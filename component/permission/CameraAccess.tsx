import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  BackHandler,
  Dimensions,
  Linking,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/types";
import { useTranslation } from "react-i18next";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { LinearGradient } from "expo-linear-gradient";
import { Camera } from "expo-camera";
import CustomHeader from "../common/CustomHeader";

type CameraAccessNavigationProp = StackNavigationProp<
  RootStackParamList,
  "CameraAccess"
>;

interface CameraAccessProps {
  // Optional now: when this is used standalone (e.g. embedded in a modal
  // instead of as a navigator screen), there's no navigation prop to pass.
  navigation?: CameraAccessNavigationProp;
  onPermissionGranted?: () => void;
  onClose?: () => void;
  returnScreen?: keyof RootStackParamList;
}

const cameraImage = require("../../assets/images/permission/camera.webp");
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const CameraAccess: React.FC<CameraAccessProps> = ({
  navigation,
  onPermissionGranted,
  onClose,
  returnScreen = "Main",
}) => {
  const { t } = useTranslation();
  const screenWidth = Dimensions.get("window").width;
  const [isLoading, setIsLoading] = useState(false);

  const dynamicStyles = {
    imageHeight: screenWidth < 400 ? wp(55) : wp(50),
  };

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else if (navigation) {
      navigation.goBack();
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleBack();
        return true;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      return () => subscription.remove();
    }, [navigation, onClose]),
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
          t("CameraAccess.PermissionDenied") || "Permission Denied",
          t(
            "CameraAccess.CameraAccessIsRequiredPleaseEnableItInSettings",
          ) || "Camera access is required. Please enable it in settings.",
          [
            { text: t("Main.Cancel") || "Cancel", style: "cancel" },
            {
              text: t("CameraAccess.OpenSettings") || "Open Settings",
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
    <View className="flex-1 bg-black">
      <CustomHeader
        title=""
        navigation={navigation}
        onBackPress={handleBack}
        transparent
      />

      <View className="flex-1 justify-center">
        <View className="items-center justify-center px-4">
          {/* Camera Image */}
          <View className="mb-8">
            <Image
              source={cameraImage}
              className="w-44 h-44"
              resizeMode="contain"
              style={{ height: dynamicStyles.imageHeight }}
            />
          </View>

          {/* Title */}
          <Text className="text-white text-3xl font-extrabold mb-3 text-center tracking-wide">
            {t("CameraAccess.CameraAccess") || "Camera Access"}
          </Text>

          {/* Description */}
          <Text className="text-gray-400 text-center mb-10 px-6 text-base leading-6">
            {t("CameraAccess.EnableCameraAccessToCapturePhotos") ||
              "Enable camera access to capture photos and scan documents."}
          </Text>

          {/* Allow Button */}
          <TouchableOpacity
            onPress={requestCameraPermission}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            <LinearGradient
              colors={["#009570", "#19D7B7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="py-4 items-center justify-center"
              style={{
                borderRadius: 999,
                height: 50,
                width: SCREEN_HEIGHT > 900 ? 260 : 220,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text className="text-black font-extrabold text-lg tracking-wider">
                {isLoading
                  ? t("CameraAccess.Requesting...") || "Requesting..."
                  : t("CameraAccess.Allow") || "Allow"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default CameraAccess;