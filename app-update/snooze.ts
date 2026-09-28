/**
 * Snooze management for "Update Later".
 *
 * When the user taps "Update Later", we store the current timestamp in
 * AsyncStorage keyed by version. On the next check, if the stored timestamp
 * is still within snoozeDurationMs, we skip the prompt.
 *
 * A force update (minimumVersion) is never snoozeable — that is enforced
 * in AppUpdateProvider, not here.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { APP_UPDATE_CONFIG } from "./config";

const SNOOZE_KEY_PREFIX = "@govicare_update_snooze_";

/**
 * Returns true if the user has snoozed the prompt for this version
 * and the snooze window has not yet expired.
 */
export async function isSnoozed(version: string): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(`${SNOOZE_KEY_PREFIX}${version}`);
    if (!raw) return false;

    // snoozeDurationMs === 0 means snooze lasts until next restart (already
    // filtered by the in-memory check in AppUpdateProvider), so treat as snoozed.
    if (APP_UPDATE_CONFIG.snoozeDurationMs <= 0) return true;

    const snoozedAt = parseInt(raw, 10);
    if (Number.isNaN(snoozedAt)) return false;

    const elapsed = Date.now() - snoozedAt;
    return elapsed < APP_UPDATE_CONFIG.snoozeDurationMs;
  } catch {
    // If AsyncStorage is unavailable, act as if not snoozed so the prompt shows.
    return false;
  }
}

/**
 * Records the current timestamp as the snooze start for this version.
 */
export async function setSnoozed(version: string): Promise<void> {
  try {
    await AsyncStorage.setItem(
      `${SNOOZE_KEY_PREFIX}${version}`,
      Date.now().toString()
    );
  } catch {
    // Ignore write failures — the worst outcome is the prompt shows again next launch.
  }
}

/**
 * Clears the snooze for a specific version (e.g. useful in dev/testing).
 */
export async function clearSnooze(version: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(`${SNOOZE_KEY_PREFIX}${version}`);
  } catch {
    // Ignore
  }
}
