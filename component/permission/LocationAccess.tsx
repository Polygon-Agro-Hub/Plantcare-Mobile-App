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
  ScrollView,
  Platform,
  StatusBar,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/types";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import CustomHeader from "../common/CustomHeader";

type LocationAccessNavigationProp = StackNavigationProp<
  RootStackParamList,
  "LocationAccess"
>;

interface LocationAccessProps {
  navigation: LocationAccessNavigationProp;
  onPermissionGranted?: () => void;
  onClose?: () => void;
  returnScreen?: keyof RootStackParamList;
}

const locationImage = require("../../assets/images/permission/location.webp");
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const LocationAccess: React.FC<LocationAccessProps> = ({
  navigation,
  onPermissionGranted,
  onClose,
  returnScreen = "Main",
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleDenyOrClose = () => {
    if (onClose) {
      onClose();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate(returnScreen as any);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleDenyOrClose();
        return true;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      return () => subscription.remove();
    }, [navigation, onClose, returnScreen]),
  );

  const requestLocationPermission = async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        if (onPermissionGranted) {
          onPermissionGranted();
        } else {
          navigation.navigate(returnScreen as any);
        }
      } else if (status === "denied") {
        Alert.alert(
          t("LocationAccess.PermissionDenied") || "Permission Denied",
          t(
            "LocationAccess.LocationAccessIsRequiredPleaseEnableItInSettings",
          ) || "Location access is required for this feature. Please enable it in settings.",
          [
            {
              text: t("LocationAccess.NotNow") || "Not Now",
              style: "cancel",
              onPress: handleDenyOrClose,
            },
            {
              text: t("LocationAccess.OpenSettings") || "Open Settings",
              onPress: () => Linking.openSettings(),
            },
          ],
        );
      }
    } catch (error) {
      console.error("Error requesting location permission:", error);
      Alert.alert(
        t("Main.Error") || "Error",
        t("LocationAccess.UnableToRequestLocationPermissionPleaseTryAgain") ||
          "Unable to request location permission. Please try again.",
        [{ text: t("Main.OK") }],
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#121212]">
      <View
        style={{
          paddingTop:
            Platform.OS === "android"
              ? (StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 36)
              : 48,
        }}
      >
        <CustomHeader
          title=""
          navigation={navigation}
          onBackPress={handleDenyOrClose}
          transparent
        />
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center justify-center mt-2 mb-4">
          <Image
            source={locationImage}
            className="w-28 h-28"
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text className="text-white text-2xl font-bold text-center mb-2">
          {t("LocationAccess.ProminentDisclosureTitle")}
        </Text>

        {/* Intro */}
        <Text className="text-gray-300 text-sm text-center mb-5 leading-5">
          {t("LocationAccess.ProminentDisclosureIntro")}
        </Text>

        {/* Feature 1: Weather */}
        <View className="bg-[#1E1E1E] p-4 rounded-xl mb-3 border border-gray-800 flex-row items-start">
          <View className="bg-[#009570]/20 p-2.5 rounded-lg mr-3 mt-0.5">
            <MaterialCommunityIcons
              name="weather-partly-cloudy"
              size={24}
              color="#19D7B7"
            />
          </View>
          <View className="flex-1">
            <Text className="text-white font-semibold text-base mb-1">
              {t("LocationAccess.FeatureWeatherTitle")}
            </Text>
            <Text className="text-gray-400 text-xs leading-4">
              {t("LocationAccess.FeatureWeatherDesc")}
            </Text>
          </View>
        </View>

        {/* Feature 2: Farm / Crop Tracking */}
        <View className="bg-[#1E1E1E] p-4 rounded-xl mb-4 border border-gray-800 flex-row items-start">
          <View className="bg-[#009570]/20 p-2.5 rounded-lg mr-3 mt-0.5">
            <MaterialCommunityIcons
              name="sprout"
              size={24}
              color="#19D7B7"
            />
          </View>
          <View className="flex-1">
            <Text className="text-white font-semibold text-base mb-1">
              {t("LocationAccess.FeatureCropTitle")}
            </Text>
            <Text className="text-gray-400 text-xs leading-4">
              {t("LocationAccess.FeatureCropDesc")}
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
            {t("LocationAccess.DisclosureFooter")}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="items-center w-full mt-auto">
          <TouchableOpacity
            onPress={requestLocationPermission}
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
              <Text className="text-black font-extrabold text-base tracking-wide">
                {isLoading
                  ? t("LocationAccess.Requesting...") || "Requesting..."
                  : t("LocationAccess.AgreeAndContinue")}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDenyOrClose}
            activeOpacity={0.7}
            className="py-2.5 px-6 items-center justify-center"
          >
            <Text className="text-gray-400 font-semibold text-sm">
              {t("LocationAccess.NotNow")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default LocationAccess;
