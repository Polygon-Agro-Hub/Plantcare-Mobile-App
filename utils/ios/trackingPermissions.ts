import {
  requestTrackingPermissionsAsync,
  getTrackingPermissionsAsync,
  PermissionStatus,
} from "expo-tracking-transparency";
import { Platform } from "react-native";

/**
 * Requests iOS AppTrackingTransparency permission if needed (iOS 14+).
 * This wraps native ATTrackingManager.requestTrackingAuthorization for Expo / React Native.
 */
export async function requestTrackingIfNeeded(): Promise<PermissionStatus | null> {
  if (Platform.OS === "ios") {
    try {
      const { status: currentStatus } = await getTrackingPermissionsAsync();
      if (currentStatus === PermissionStatus.UNDETERMINED) {
        const { status } = await requestTrackingPermissionsAsync();
        return status;
      }
      return currentStatus;
    } catch (error) {
      console.error("Error requesting tracking permission:", error);
    }
  }
  return null;
}
