import type { ImagePickerAsset } from "expo-image-picker";

/**
 * Validates if the selected image asset is an allowed format (HEIC, JPG, PNG).
 * Explicitly rejects TIFF and other disallowed formats.
 */
export function isAllowedImageFormat(asset?: ImagePickerAsset | null): boolean {
  if (!asset) return false;

  const mimeType = (asset.mimeType || "").toLowerCase().trim();
  const fileName = (asset.fileName || "").toLowerCase().trim();
  const uri = (asset.uri || "").toLowerCase().trim();

  // Reject TIFF and other prohibited formats
  if (
    mimeType.includes("tiff") ||
    mimeType.includes("tif") ||
    /\.(tiff?)$/i.test(fileName) ||
    /\.(tiff?)$/i.test(uri.split("?")[0])
  ) {
    return false;
  }

  // Allowed MIME types
  if (
    mimeType === "image/jpeg" ||
    mimeType === "image/jpg" ||
    mimeType === "image/png" ||
    mimeType === "image/heic" ||
    mimeType === "image/heif" ||
    mimeType === "image/heic-sequence" ||
    mimeType === "image/heif-sequence"
  ) {
    return true;
  }

  // Extract file extension from fileName or uri
  const getExtension = (str: string) => {
    const cleanStr = str.split("?")[0];
    const parts = cleanStr.split(".");
    return parts.length > 1 ? parts.pop()?.toLowerCase() : "";
  };

  const ext = getExtension(fileName) || getExtension(uri);

  if (
    ext === "jpg" ||
    ext === "jpeg" ||
    ext === "png" ||
    ext === "heic" ||
    ext === "heif"
  ) {
    return true;
  }

  return false;
}

/**
 * Checks if an error thrown by ImagePicker or ImageManipulator is due to an unsupported/unreadable format
 * (such as selecting a TIFF file in Android PhotoPicker which causes
 * 'java.lang.IllegalArgumentException: Uri lacks file scheme', 'ExponentImagePicker.launchImageLibraryAsync has been rejected',
 * decode failure, FailedToReadFileException, etc.).
 */
export function isFormatOrImagePickerError(error: any): boolean {
  if (!error) return false;
  const msg = (error?.message || error?.toString() || "").toLowerCase();
  return (
    msg.includes("uri lacks 'file' scheme") ||
    msg.includes("uri lacks \"file\" scheme") ||
    msg.includes("illegalargumentexception") ||
    msg.includes("failed to read file") ||
    msg.includes("failedtoreadfileexception") ||
    msg.includes("launchimagelibraryasync") ||
    msg.includes("exponentimagepicker") ||
    msg.includes("format") ||
    msg.includes("decode") ||
    msg.includes("unsupported") ||
    msg.includes("corrupt")
  );
}
