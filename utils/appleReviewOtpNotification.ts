import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

// Configure foreground notification presentation handler for local notifications
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (e) {
  console.warn("Notifications setup skipped:", e);
}

/**
 * Checks whether the given phone number is an iOS Apple Review test account
 * Supports both 707111707 and 70711707 (with or without leading 0 or +94 country code).
 */
export const isAppleReviewPhone = (
  phoneNumber?: string | number | null,
  countryCode?: string,
): boolean => {
  if (Platform.OS !== "ios") return false;
  if (!phoneNumber) return false;

  const cleanPhone = String(phoneNumber).replace(/[^0-9]/g, "");

  const matchesNumber =
    cleanPhone.endsWith("707111707") ||
    cleanPhone.endsWith("70711707") ||
    cleanPhone === "707111707" ||
    cleanPhone === "70711707";

  if (!matchesNumber) return false;

  if (countryCode) {
    const cleanCountry = countryCode.replace(/[^0-9]/g, "");
    return cleanCountry === "" || cleanCountry === "94";
  }

  return true;
};

/**
 * Sends an immediate local notification on device with the review OTP code
 */
export const triggerAppleReviewOtpNotification = async (
  otpCode: string = "12345",
): Promise<void> => {
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "GoViCare OTP",
        body: `Your GoViCare OTP is ${otpCode}`,
        sound: true,
      },
      trigger: null,
    });
  } catch (error) {
    console.warn("Could not schedule Apple Review OTP notification:", error);
  }
};
