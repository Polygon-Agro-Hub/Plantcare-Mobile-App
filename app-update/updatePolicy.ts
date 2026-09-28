/**
 * The "brain" of the update check.
 *
 * This file is plain TypeScript with no React Native imports, so it is easy to read
 * and easy to unit test.
 *
 *   fetchUpdatePolicy()  →  decideUpdate()  →  'none' | 'soft' | 'force'
 */

export type StorePlatform = "ios" | "android";

/** The rules for one platform, read from your version policy JSON. */
export interface PlatformPolicy {
  /** Newest version live in the store. Users below it get an optional ("soft") prompt. */
  latestVersion?: string;
  /** Oldest version you still support. Users below it are blocked ("force"). */
  minimumVersion?: string;
  /**
   * Optional minimum OS needed to install your latest build.
   * iOS: e.g. "15.1". Android: API level e.g. "24".
   * People on an older OS cannot install the update, so they are never prompted.
   */
  minOsVersion?: string;
}

/** Optional text overrides from the server — change wording without shipping a new build. */
export interface UpdateMessages {
  softTitle?: string;
  softMessage?: string;
  forceTitle?: string;
  forceMessage?: string;
  updateButton?: string;
  laterButton?: string;
}

export interface UpdatePolicy {
  ios?: PlatformPolicy;
  android?: PlatformPolicy;
  messages?: UpdateMessages;
}

export type UpdateDecision =
  | { kind: "none" }
  | { kind: "soft" | "force"; installedVersion: string; latestVersion: string };

const NO_UPDATE: UpdateDecision = { kind: "none" };

/**
 * Cleans a version so it can be compared:
 * "v2.0.0" → "2.0.0", " 2.0.0 " → "2.0.0", "2.0.0-beta.2" → "2.0.0", 24 → "24".
 * Returns null when there is no usable version number in the value.
 */
export function normalizeVersion(value: unknown): string | null {
  const text =
    typeof value === "number" && Number.isFinite(value) ? String(value) : value;
  if (typeof text !== "string") return null;
  const match = text
    .trim()
    .replace(/^v/i, "")
    .match(/^\d+(\.\d+)*/);
  return match ? match[0] : null;
}

/**
 * Compares two versions number by number.
 * Returns 1 if a is newer, -1 if a is older, 0 if equal.
 *
 * Why not compare strings directly? Alphabetically "1.10.0" < "1.9.0",
 * but 1.10.0 IS the newer version. This is the most common bug in update checks.
 */
export function compareVersions(a: string, b: string): number {
  const left = (normalizeVersion(a) ?? "0").split(".").map(Number);
  const right = (normalizeVersion(b) ?? "0").split(".").map(Number);
  const length = Math.max(left.length, right.length);

  for (let i = 0; i < length; i++) {
    const difference = (left[i] ?? 0) - (right[i] ?? 0);
    if (difference !== 0) return difference > 0 ? 1 : -1;
  }
  return 0;
}

/**
 * Reads the downloaded JSON defensively — missing or malformed fields are ignored
 * instead of crashing the app. Returns null if the JSON isn't an object at all.
 */
export function parsePolicy(json: unknown): UpdatePolicy | null {
  if (!isRecord(json)) return null;
  return {
    ios: parsePlatformPolicy(json.ios),
    android: parsePlatformPolicy(json.android),
    messages: parseMessages(json.messages),
  };
}

export interface DecideUpdateInput {
  policy: UpdatePolicy;
  platform: StorePlatform;
  /** The version installed on this device, e.g. "2.0.0". */
  installedVersion: string;
  /** iOS: e.g. "17.5". Android: API level, e.g. 34 (React Native's Platform.Version). */
  osVersion?: string | number;
}

/** Decides what the user should see. This is the entire business logic of the feature. */
export function decideUpdate({
  policy,
  platform,
  installedVersion,
  osVersion,
}: DecideUpdateInput): UpdateDecision {
  const rules = policy[platform];
  const installed = normalizeVersion(installedVersion);
  if (!rules || !installed) return NO_UPDATE;

  const latest = rules.latestVersion;
  let minimum = rules.minimumVersion;

  // Safety net for typos: never block people on a version newer than the one in the store.
  if (minimum && latest && compareVersions(minimum, latest) > 0) {
    minimum = latest;
  }

  // If this device's OS is too old to install the new build, prompting only frustrates the user.
  const os = normalizeVersion(osVersion);
  if (rules.minOsVersion && os && compareVersions(os, rules.minOsVersion) < 0) {
    return NO_UPDATE;
  }

  if (minimum && compareVersions(installed, minimum) < 0) {
    return {
      kind: "force",
      installedVersion: installed,
      latestVersion: latest ?? minimum,
    };
  }
  if (latest && compareVersions(installed, latest) < 0) {
    return { kind: "soft", installedVersion: installed, latestVersion: latest };
  }
  return NO_UPDATE;
}

/**
 * Downloads your version policy.
 * Returns null on ANY problem (offline, timeout, 404, invalid JSON), because an update check
 * must NEVER be the reason your app stops working.
 */
export async function fetchUpdatePolicy(
  url: string,
  timeoutMs: number
): Promise<UpdatePolicy | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Timestamp stops the phone (and CDNs) from serving a stale cached copy.
    const separator = url.includes("?") ? "&" : "?";
    const response = await fetch(`${url}${separator}t=${Date.now()}`, {
      headers: { Accept: "application/json", "Cache-Control": "no-cache" },
      signal: controller.signal,
    });
    if (!response.ok) {
      if (__DEV__) {
        console.warn(
          `[AppUpdate] Server responded with status ${response.status} for ${url}`
        );
      }
      return null;
    }
    return parsePolicy(await response.json());
  } catch (err) {
    if (__DEV__) {
      console.warn(`[AppUpdate] fetchUpdatePolicy failed:`, err);
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Private helpers
// ─────────────────────────────────────────────────────────────────────────────

const MESSAGE_KEYS = [
  "softTitle",
  "softMessage",
  "forceTitle",
  "forceMessage",
  "updateButton",
  "laterButton",
] as const;

function parsePlatformPolicy(value: unknown): PlatformPolicy | undefined {
  if (!isRecord(value)) return undefined;
  return {
    latestVersion: normalizeVersion(value.latestVersion) ?? undefined,
    minimumVersion: normalizeVersion(value.minimumVersion) ?? undefined,
    minOsVersion: normalizeVersion(value.minOsVersion) ?? undefined,
  };
}

function parseMessages(value: unknown): UpdateMessages | undefined {
  if (!isRecord(value)) return undefined;
  const messages: UpdateMessages = {};
  for (const key of MESSAGE_KEYS) {
    const text = value[key];
    if (typeof text === "string" && text.trim() !== "")
      messages[key] = text.trim();
  }
  return messages;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
