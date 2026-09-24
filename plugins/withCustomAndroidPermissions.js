const { withAndroidManifest } = require("@expo/config-plugins");

/**
 * Expo config plugin to explicitly block and remove unwanted permissions
 * (specifically READ_MEDIA_IMAGES, READ_MEDIA_VIDEO, and other broad storage/media
 * permissions) from being auto-injected by third-party plugins during APK and AAB builds.
 *
 * Root cause: expo-screen-capture injects READ_MEDIA_IMAGES with a scoped
 * minSdkVersion="33" maxSdkVersion="33" attribute that Expo's built-in
 * "blockedPermissions" array cannot strip. This plugin uses tools:node="remove"
 * which is honoured by the Android manifest merger and removes the entry
 * regardless of any SDK version constraints on the injected declaration.
 *
 * Google Play Policy: apps targeting Android 13+ (API 33+) must use the
 * Android Photo Picker instead of requesting broad media permissions.
 * expo-image-picker already uses the system photo picker on Android 13+,
 * so these permissions are not needed.
 */
function withCustomAndroidPermissions(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;

    if (!androidManifest.$) {
      androidManifest.$ = {};
    }
    if (!androidManifest.$["xmlns:tools"]) {
      androidManifest.$["xmlns:tools"] = "http://schemas.android.com/tools";
    }

    const blocked = [
      "com.google.android.gms.permission.AD_ID",
      "android.permission.RECORD_AUDIO",
      "android.permission.MODIFY_AUDIO_SETTINGS",
      "android.permission.ACCESS_BACKGROUND_LOCATION",
      "android.permission.READ_MEDIA_AUDIO",
      "android.permission.READ_MEDIA_VIDEO",
      "android.permission.READ_MEDIA_IMAGES",
      "android.permission.READ_MEDIA_VISUAL_USER_SELECTED",
      "android.permission.ACCESS_MEDIA_LOCATION",
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE",
      "android.permission.SYSTEM_ALERT_WINDOW",
      "android.permission.CALL_PHONE",
      "android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK",
      "android.permission.BLUETOOTH",
      "android.permission.BLUETOOTH_ADMIN",
      "android.permission.BLUETOOTH_SCAN",
      "android.permission.BLUETOOTH_CONNECT",
      "android.permission.WAKE_LOCK",
      "android.permission.CHANGE_WIFI_STATE",
      "android.permission.CHANGE_NETWORK_STATE",
    ];

    if (!Array.isArray(androidManifest["uses-permission"])) {
      androidManifest["uses-permission"] = [];
    }

    // 1. Strip any active uses-permission matching the blocked list
    androidManifest["uses-permission"] = androidManifest["uses-permission"].filter(
      (perm) => {
        const name = perm?.$?.["android:name"];
        const isBlocked = blocked.includes(name);
        const isRemoveNode = perm?.$?.["tools:node"] === "remove";
        // Keep only if it's not in blocked list, or if it already has tools:node="remove"
        return !isBlocked || isRemoveNode;
      }
    );

    // 2. Ensure each blocked permission is explicitly marked with tools:node="remove"
    for (const permName of blocked) {
      const alreadyHasRemove = androidManifest["uses-permission"].some(
        (p) => p?.$?.["android:name"] === permName && p?.$?.["tools:node"] === "remove"
      );
      if (!alreadyHasRemove) {
        androidManifest["uses-permission"].push({
          $: {
            "android:name": permName,
            "tools:node": "remove",
          },
        });
      }
    }

    return config;
  });
}

module.exports = withCustomAndroidPermissions;
