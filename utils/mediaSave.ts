import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

/**
 * Safely saves an image or file to device storage or shares it.
 * On Android, uses the StorageAccessFramework (SAF) to let the user save to their
 * selected directory (Downloads, Pictures, etc.) with ZERO dangerous permissions,
 * eliminating the need for android.permission.READ_MEDIA_IMAGES.
 */
export async function saveImageToGallery(
  sourceUri: string,
  filenamePrefix: string = "QRCode"
): Promise<boolean> {
  try {
    const fileUri = `${(FileSystem as any).documentDirectory}${filenamePrefix}_${Date.now()}.png`;
    let localUri = sourceUri;

    if (sourceUri.startsWith("http://") || sourceUri.startsWith("https://")) {
      const response = await FileSystem.downloadAsync(sourceUri, fileUri);
      localUri = response.uri;
    }

    // Android: Use StorageAccessFramework (SAF) - doesn't require READ_MEDIA_IMAGES
    if (Platform.OS === "android") {
      try {
        const SAF = (FileSystem as any).StorageAccessFramework;
        if (SAF && typeof SAF.requestDirectoryPermissionsAsync === "function") {
          let initialDirUri: string | null = null;
          try {
            initialDirUri = SAF.getUriForDirectoryInRoot("Download");
          } catch (_) {}

          const permissions = await SAF.requestDirectoryPermissionsAsync(initialDirUri);
          if (permissions.granted) {
            const base64Data = await FileSystem.readAsStringAsync(localUri, {
              encoding: FileSystem.EncodingType.Base64,
            });
            const filename = `${filenamePrefix}_${Date.now()}`;
            const createdFileUri = await SAF.createFileAsync(
              permissions.directoryUri,
              filename,
              "image/png"
            );
            await FileSystem.writeAsStringAsync(createdFileUri, base64Data, {
              encoding: FileSystem.EncodingType.Base64,
            });
            return true;
          } else {
            // User cancelled folder selection
            return false;
          }
        }
      } catch (safError) {
        console.warn("StorageAccessFramework save failed, falling back to share:", safError);
      }
    }

    // iOS: Attempt MediaLibrary (only requires NSPhotoLibraryAddUsageDescription)
    if (Platform.OS === "ios") {
      try {
        const MediaLibrary = require("expo-media-library");
        if (MediaLibrary) {
          if (typeof MediaLibrary.saveToLibraryAsync === "function") {
            await MediaLibrary.saveToLibraryAsync(localUri);
            return true;
          } else if (typeof MediaLibrary.createAssetAsync === "function") {
            const { status } = await MediaLibrary.requestPermissionsAsync(false);
            if (status === "granted") {
              const asset = await MediaLibrary.createAssetAsync(localUri);
              await MediaLibrary.createAlbumAsync("Download", asset, false);
              return true;
            }
          }
        }
      } catch (_) {
        // Fallback for iOS
      }
    }

    // Universal Fallback to Sharing sheet (zero permissions required)
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(localUri, {
        mimeType: "image/png",
        dialogTitle: "Save or Share Image",
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error("saveImageToGallery error:", error);
    return false;
  }
}
