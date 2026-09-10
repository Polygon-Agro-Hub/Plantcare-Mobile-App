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
  SafeAreaView,
  LayoutChangeEvent,
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
  navigation?: LocationAccessNavigationProp;
  onPermissionGranted?: () => void;
  onClose?: () => void;
  onNotNow?: () => void;
  returnScreen?: keyof RootStackParamList;
  onBackPress?: () => void;
  blockBackNavigation?: boolean;
}

const locationImage = require("../../assets/images/permission/location.webp");

const LocationAccess: React.FC<LocationAccessProps> = ({
  navigation,
  onPermissionGranted,
  onClose,
  onNotNow,
  returnScreen = "Main",
  onBackPress,
  blockBackNavigation = false,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);

  const isScreenTooLong =
    scrollViewHeight > 0 &&
    contentHeight > 0 &&
    scrollViewHeight >= contentHeight + 20;

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

  const handleNotNowPress = () => {
    if (onNotNow) {
      onNotNow();
    } else {
      handleDenyOrClose();
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const handleHardwareBackPress = () => {
        if (blockBackNavigation) {
          // Block phone back navigation completely
          return true;
        }
        handleDenyOrClose();
        return true;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        handleHardwareBackPress,
      );
      return () => subscription.remove();
    }, [blockBackNavigation, navigation, onClose, onBackPress, returnScreen]),
  );

  const requestLocationPermission = async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        if (onPermissionGranted) {
          onPermissionGranted();
        } else if (navigation) {
          navigation.navigate(returnScreen as any);
        }
      } else {
        Alert.alert(
          t("LocationAccess.PermissionDenied") || "Permission Denied",
          t(
            "LocationAccess.LocationAccessIsRequiredPleaseEnableItInSettings",
          ) ||
            "Location access is required for this feature. Please enable it in settings.",
          [
            {
              text: t("LocationAccess.NotNow") || "Not Now",
              style: "cancel",
              onPress: handleNotNowPress,
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
        [
          {
            text: t("LocationAccess.NotNow") || "Not Now",
            onPress: handleNotNowPress,
          },
          { text: t("Main.OK") },
        ],
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#121212" }}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      {!blockBackNavigation && (
        <CustomHeader
          title=""
          navigation={navigation}
          onBackPress={handleDenyOrClose}
          showBackButton={true}
          transparent
        />
      )}

      <ScrollView
        className="flex-1 px-5"
        onLayout={(e: LayoutChangeEvent) =>
          setScrollViewHeight(e.nativeEvent.layout.height)
        }
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: isScreenTooLong ? "center" : "flex-start",
          paddingBottom: isScreenTooLong
            ? 20
            : Platform.OS === "android"
              ? 75
              : 55,
          paddingTop: isScreenTooLong ? 0 : 10,
        }}
        showsVerticalScrollIndicator={false}
        bounces={!isScreenTooLong}
      >
        <View
          onLayout={(e: LayoutChangeEvent) =>
            setContentHeight(e.nativeEvent.layout.height)
          }
          className="w-full"
        >
          <View className="items-center justify-center mt-2 mb-4">
          <Image
            source={locationImage}
            className="w-32 h-32"
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
        <View
          className={`items-center w-full mt-4 ${
            isScreenTooLong ? "mb-2" : "mb-8"
          }`}
        >
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
              <View className="flex-row items-center justify-center">
                <Ionicons
                  name="location-outline"
                  size={20}
                  color="#000000"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-black font-extrabold text-base tracking-wide">
                  {isLoading
                    ? t("LocationAccess.Requesting...") || "Requesting..."
                    : t("LocationAccess.AgreeAndContinue") || "Agree & Continue"}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNotNowPress}
            activeOpacity={0.7}
            className="py-3 px-6 items-center justify-center"
          >
            <Text className="text-gray-400 font-semibold text-sm">
              {t("LocationAccess.NotNow") || "Not Now"}
            </Text>
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LocationAccess;
