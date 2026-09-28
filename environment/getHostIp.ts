import Constants from "expo-constants";
import { NativeModules } from "react-native";

/**
 * Automatically detects the local IP address of the development machine
 * from Expo Constants or React Native NativeModules.
 * Falls back to "192.168.8.102" if detection is not possible.
 */
export const getDevServerHostIp = (): string => {
  try {
    // 1. Check Expo hostUri (e.g. "192.168.8.102:8081")
    const hostUri =
      Constants.expoConfig?.hostUri ||
      (Constants as any).manifest?.debuggerHost ||
      (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;

    if (hostUri) {
      const ip = hostUri.split(":")[0];
      if (ip && ip !== "localhost" && ip !== "127.0.0.1") {
        return ip;
      }
    }

    // 2. Check NativeModules SourceCode scriptURL
    const scriptURL: string | undefined = NativeModules.SourceCode?.scriptURL;
    if (scriptURL) {
      const address = scriptURL.split("://")[1]?.split("/")[0]?.split(":")[0];
      if (address && address !== "localhost" && address !== "127.0.0.1") {
        return address;
      }
    }

    // 3. Check Constants linkingUri or experienceUrl
    const linkingUri =
      (Constants as any).linkingUri || (Constants as any).experienceUrl;
    if (typeof linkingUri === "string") {
      const match = linkingUri.match(/:\/\/(.[^/:]+)/);
      if (
        match &&
        match[1] &&
        match[1] !== "localhost" &&
        match[1] !== "127.0.0.1"
      ) {
        return match[1];
      }
    }
  } catch (err) {
    console.warn("Failed to auto-detect dev server host IP:", err);
  }

  // Fallback default IP
  return "192.168.8.102";
};

export default getDevServerHostIp;
