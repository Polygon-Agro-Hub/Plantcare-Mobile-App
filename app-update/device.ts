/**
 * Device layer for the app-update feature.
 *
 * - getPlatform()         → 'ios' | 'android'
 * - getInstalledVersion() → e.g. "2.0.0" from native binary / app.json
 * - getOsVersion()        → iOS: "17.5" / Android: API level (e.g. 34)
 * - openStore()           → Opens Play Store (Android) or App Store (iOS)
 */

import * as Application from "expo-application";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { Linking, Platform } from "react-native";
import { APP_UPDATE_CONFIG } from "./config";
import type { StorePlatform } from "./updatePolicy";

export function getPlatform(): StorePlatform {
  return Platform.OS === "ios" ? "ios" : "android";
}

/**
 * Returns the version string of the installed app.
 * In Expo Go / Dev Client: Uses Constants.expoConfig.version (e.g. "2.0.0" from app.json)
 * because Application.nativeApplicationVersion in Expo Go returns Expo Go's own version.
 * In Standalone APK / iOS IPA / Production: Uses Application.nativeApplicationVersion.
 */
export function getInstalledVersion(): string {
  const isExpoGo =
    Constants.appOwnership === "expo" ||
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

  if (isExpoGo) {
    return Constants.expoConfig?.version ?? "2.0.0";
  }

  return (
    Application.nativeApplicationVersion ??
    Constants.expoConfig?.version ??
    "2.0.0"
  );
}

/**
 * Returns the OS version.
 * iOS:     a string like "17.5"
 * Android: a number (API level) like 34
 */
export function getOsVersion(): string | number {
  return Platform.Version;
}

/**
 * Opens this app's page on the Play Store (Android) or App Store (iOS).
 * Supports both Apple ID number and bundle identifier fallback for iOS.
 */
export async function openStore(): Promise<void> {
  const isIos = Platform.OS === "ios";

  if (isIos) {
    const appleId = APP_UPDATE_CONFIG.iosAppStoreId?.trim();
    const bundleId =
      APP_UPDATE_CONFIG.iosBundleIdentifier?.trim() ||
      "com.polygonagro.GoviCare";

    // If numeric Apple ID exists, link directly to app ID; otherwise link by bundle ID / search
    const storeUrl = appleId
      ? `itms-apps://apps.apple.com/app/id${appleId}`
      : `itms-apps://apps.apple.com/app/${bundleId}`;

    const webUrl = appleId
      ? `https://apps.apple.com/app/id${appleId}`
      : `https://apps.apple.com/app/${bundleId}`;

    try {
      const canOpen = await Linking.canOpenURL(storeUrl);
      await Linking.openURL(canOpen ? storeUrl : webUrl);
    } catch {
      try {
        await Linking.openURL(webUrl);
      } catch {
        // Silently swallow
      }
    }
    return;
  }

  // Android
  const storeUrl = `market://details?id=${APP_UPDATE_CONFIG.androidPackageName}`;
  const webUrl = `https://play.google.com/store/apps/details?id=${APP_UPDATE_CONFIG.androidPackageName}`;

  try {
    const canOpen = await Linking.canOpenURL(storeUrl);
    await Linking.openURL(canOpen ? storeUrl : webUrl);
  } catch {
    try {
      await Linking.openURL(webUrl);
    } catch {
      // Silently swallow
    }
  }
}
