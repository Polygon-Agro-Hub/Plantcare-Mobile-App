import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  BackHandler,
  Linking,
  ScrollView,
  Platform,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/types";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { Camera } from "expo-camera";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import CustomHeader from "../common/CustomHeader";

type CameraAccessNavigationProp = StackNavigationProp<
  RootStackParamList,
  "CameraAccess"
>;

interface CameraAccessProps {
  // Optional: when this is used standalone (e.g. embedded in a modal
  // instead of as a navigator screen), there's no navigation prop to pass.
  navigation?: CameraAccessNavigationProp;
  onPermissionGranted?: () => void;
  onClose?: () => void;
  returnScreen?: keyof RootStackParamList;
  onBackPress?: () => void;
}

const cameraImage = require("../../assets/images/permission/camera.webp");

const CameraAccess: React.FC<CameraAccessProps> = ({
  navigation,
  onPermissionGranted,
  onClose,
  returnScreen = "Main",
  onBackPress,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleDenyOrClose = () => {
    if (onClose) {
      onClose();
    } else if (onBackPress) {
      onBackPress();
    } else if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else if (navigation) {
      navigation.navigate(returnScreen as any);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const handleHardwareBackPress = () => {
        handleDenyOrClose();
        return true;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        handleHardwareBackPress,
      );
      return () => subscription.remove();
    }, [navigation, onClose, onBackPress, returnScreen]),
  );

  const requestCameraPermission = async () => {
    setIsLoading(true);
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();

      if (status === "granted") {
        if (onPermissionGranted) {
          onPermissionGranted();
        } else if (navigation) {
          navigation.navigate(returnScreen as any);
        }
      } else if (status === "denied") {
        Alert.alert(
          t("CameraAccess.PermissionDenied") ||
            t("Permission.PermissionDenied") ||
            "Permission Denied",
          t("CameraAccess.CameraAccessIsRequiredPleaseEnableItInSettings") ||
            t("Permission.CameraAccessIsRequiredPleaseEnableItInSettings") ||
            "Camera access is required. Please enable it in settings.",
          [
            {
              text:
                t("CameraAccess.NotNow") ||
                t("Main.Cancel") ||
                "Not Now",
              style: "cancel",
              onPress: handleDenyOrClose,
            },
            {
              text:
                t("CameraAccess.OpenSettings") ||
                t("Permission.OpenSettings") ||
                "Open Settings",
              onPress: () => Linking.openSettings(),
            },
          ],
        );
      }
    } catch (error) {
      console.error("Error requesting camera permission:", error);
      Alert.alert(
        t("Main.Error") || "Error",
        t("CameraAccess.UnableToRequestCameraPermissionPleaseTryAgain") ||
          "Unable to request camera permission. Please try again.",
        [{ text: t("Main.OK") || "OK" }],
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#121212" }}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <CustomHeader
        title=""
        navigation={navigation}
        onBackPress={handleDenyOrClose}
        transparent
      />
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: Platform.OS === "android" ? 75 : 55,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center justify-center mt-2 mb-4">
          <Image
            source={cameraImage}
            className="w-32 h-32"
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text className="text-white text-2xl font-bold text-center mb-2">
          {t("CameraAccess.ProminentDisclosureTitle") ||
            "Why GoviCare Uses Camera"}
        </Text>

        {/* Intro */}
        <Text className="text-gray-300 text-sm text-center mb-5 leading-5">
          {t("CameraAccess.ProminentDisclosureIntro") ||
            "GoviCare requires camera access to enable the following operational features:"}
        </Text>

        {/* Feature 1: QR Scanning */}
        <View className="bg-[#1E1E1E] p-4 rounded-xl mb-3 border border-gray-800 flex-row items-start">
          <View className="bg-[#009570]/20 p-2.5 rounded-lg mr-3 mt-0.5 border border-[#009570]/30">
            <MaterialCommunityIcons
              name="qrcode-scan"
              size={24}
              color="#19D7B7"
            />
          </View>
          <View className="flex-1">
            <Text className="text-white font-semibold text-base mb-1">
              {t("CameraAccess.FeatureQRTitle") ||
                "Instant QR Code Scanning"}
            </Text>
            <Text className="text-gray-400 text-xs leading-4">
              {t("CameraAccess.FeatureQRDesc") ||
                "Scan shop and farmer QR codes for quick identification, crop tracking, and secure transactions."}
            </Text>
          </View>
        </View>

        {/* Feature 2: Inspection / Crop Diagnosis */}
        <View className="bg-[#1E1E1E] p-4 rounded-xl mb-4 border border-gray-800 flex-row items-start">
          <View className="bg-[#009570]/20 p-2.5 rounded-lg mr-3 mt-0.5 border border-[#009570]/30">
            <MaterialCommunityIcons
              name="camera-outline"
              size={24}
              color="#19D7B7"
            />
          </View>
          <View className="flex-1">
            <Text className="text-white font-semibold text-base mb-1">
              {t("CameraAccess.FeatureInspectionTitle") ||
                "Crop Diagnosis & Document Photos"}
            </Text>
            <Text className="text-gray-400 text-xs leading-4">
              {t("CameraAccess.FeatureInspectionDesc") ||
                "Capture real-time photos of plant diseases, crop damages, and verification documents for agricultural assistance."}
            </Text>
          </View>
        </View>

        {/* Privacy Note */}
        <View className="bg-[#1A2621] p-3 rounded-lg mb-6 border border-[#009570]/30 flex-row items-start">
          <Ionicons
            name="shield-checkmark-outline"
            size={18}
            color="#19D7B7"
            style={{ marginTop: 2, marginRight: 8 }}
          />
          <Text className="text-gray-300 text-xs flex-1 leading-4">
            {t("CameraAccess.DisclosureFooter") ||
              "Camera access is only active while using QR scanning or live photo capture. No photos or videos are captured without your explicit tap."}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="items-center w-full mt-4 mb-8">
          <TouchableOpacity
            onPress={requestCameraPermission}
            activeOpacity={0.8}
            disabled={isLoading}
            className="w-full mb-3"
            style={{ borderRadius: 999, overflow: "hidden" }}
          >
            <LinearGradient
              colors={["#009570", "#19D7B7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                height: 52,
                borderRadius: 999,
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons
                  name="camera-outline"
                  size={20}
                  color="#000000"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-black font-extrabold text-base tracking-wide">
                  {isLoading
                    ? t("CameraAccess.Requesting...") || "Requesting..."
                    : t("CameraAccess.AgreeAndContinue") || "Agree & Continue"}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDenyOrClose}
            activeOpacity={0.7}
            className="py-3 px-6 items-center justify-center"
          >
            <Text className="text-gray-400 font-semibold text-sm">
              {t("CameraAccess.NotNow") || "Not Now"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CameraAccess;