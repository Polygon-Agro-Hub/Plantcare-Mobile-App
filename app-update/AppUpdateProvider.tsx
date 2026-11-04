/**
 * AppUpdateProvider
 *
 * Wrap your root component with this provider. It will:
 *   1. Fetch the version policy from your backend on every app launch.
 *   2. Fetch again every time the user brings the app back to the foreground.
 *   3. Show the UpdatePrompt (soft or force) when a newer version is available.
 *   4. Handle "Update Now" (opens store) and "Update Later" (snoozes for 24h).
 *
 * The check is completely silent on failure — if the network is down, the server
 * is unreachable, or the JSON is malformed, the app simply continues normally.
 *
 * useAppUpdate() hook is also exported for components that need to manually
 * trigger a re-check (e.g. a "Check for updates" button in a settings screen).
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AppState, Keyboard, type AppStateStatus } from "react-native";
import { APP_UPDATE_CONFIG } from "./config";
import {
  getInstalledVersion,
  getOsVersion,
  getPlatform,
  openStore,
} from "./device";
import { isSnoozed, setSnoozed } from "./snooze";
import { UpdatePrompt } from "./UpdatePrompt";
import {
  decideUpdate,
  fetchUpdatePolicy,
  type UpdateDecision,
  type UpdateMessages,
} from "./updatePolicy";

// ─── Context ─────────────────────────────────────────────────────────────────

interface AppUpdateContextType {
  /** Manually trigger a version check (e.g. from a settings page). */
  checkForUpdate: () => Promise<void>;
}

const AppUpdateContext = createContext<AppUpdateContextType>({
  checkForUpdate: async () => {},
});

export const useAppUpdate = (): AppUpdateContextType =>
  useContext(AppUpdateContext);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface AppUpdateProviderProps {
  children: ReactNode;
}

export function AppUpdateProvider({ children }: AppUpdateProviderProps) {
  const [decision, setDecision] = useState<UpdateDecision>({ kind: "none" });
  const [messages, setMessages] = useState<UpdateMessages | undefined>(
    undefined
  );
  const [promptVisible, setPromptVisible] = useState(false);

  // Track whether a check is already running to avoid concurrent fetches.
  const isChecking = useRef(false);

  // ── Core check logic ──────────────────────────────────────────────────────
  const checkForUpdate = useCallback(async () => {
    if (isChecking.current) return;
    isChecking.current = true;

    try {
      const url = APP_UPDATE_CONFIG.policyUrl;
      if (__DEV__) {
        console.log("[AppUpdate] 🔄 Checking policy from:", url);
      }

      const policy = await fetchUpdatePolicy(url, APP_UPDATE_CONFIG.timeoutMs);

      // Network/server failure — fail silently.
      if (!policy) {
        if (__DEV__) {
          console.warn(
            "[AppUpdate] ⚠️ Policy fetch returned null or network error. (URL:",
            url,
            ")"
          );
        }
        return;
      }

      const platform = getPlatform();
      const installedVersion = getInstalledVersion();
      const osVersion = getOsVersion();

      if (__DEV__) {
        console.log(
          "[AppUpdate] 📱 Platform:",
          platform,
          "| Installed Version:",
          installedVersion
        );
        console.log("[AppUpdate] 📋 Policy Rules:", policy[platform]);
      }

      const result = decideUpdate({
        policy,
        platform,
        installedVersion,
        osVersion,
      });

      if (__DEV__) {
        console.log("[AppUpdate] 🎯 Decision:", result);
      }

      // No update needed.
      if (result.kind === "none") {
        setPromptVisible(false);
        setDecision(result);
        return;
      }

      // Soft update: respect the "Update Later" snooze.
      if (result.kind === "soft") {
        const snoozed = await isSnoozed(result.latestVersion);
        if (snoozed) {
          if (__DEV__) {
            console.log(
              "[AppUpdate] ⏱️ Version",
              result.latestVersion,
              "is currently snoozed."
            );
          }
          return;
        }
      }

      // Show the prompt and dismiss keyboard if active
      Keyboard.dismiss();
      setMessages(policy.messages);
      setDecision(result);
      setPromptVisible(true);
    } catch (error) {
      if (__DEV__) {
        console.error("[AppUpdate] ❌ Error in checkForUpdate:", error);
      }
    } finally {
      isChecking.current = false;
    }
  }, []);

  // ── Check on mount (app launch) ───────────────────────────────────────────
  useEffect(() => {
    checkForUpdate();
  }, [checkForUpdate]);

  // ── Check when app returns to foreground ──────────────────────────────────
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active") {
        checkForUpdate();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription.remove();
  }, [checkForUpdate]);

  // ── Button handlers ──────────────────────────────────────────────────────

  const handleUpdate = useCallback(() => {
    openStore();
  }, []);

  const handleLater = useCallback(async () => {
    if (decision.kind === "soft") {
      await setSnoozed(decision.latestVersion);
    }
    setPromptVisible(false);
  }, [decision]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AppUpdateContext.Provider value={{ checkForUpdate }}>
      {children}
      {decision.kind !== "none" && (
        <UpdatePrompt
          visible={promptVisible}
          mode={decision.kind}
          installedVersion={decision.installedVersion}
          latestVersion={decision.latestVersion}
          messages={messages}
          onUpdate={handleUpdate}
          onLater={handleLater}
        />
      )}
    </AppUpdateContext.Provider>
  );
}
