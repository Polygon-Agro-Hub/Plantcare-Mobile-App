import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  BackHandler,
  Dimensions,
  StatusBar,
  Linking,
  Platform,
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
import * as Location from "expo-location";
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
  const { t, i18n } = useTranslation();
  const screenWidth = Dimensions.get("window").width;
  const [isLoading, setIsLoading] = useState(false);

  const dynamicStyles = {
    imageHeight: screenWidth < 400 ? wp(55) : wp(50),
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (onClose) {
          onClose();
        } else {
          navigation.goBack();
        }
        return true;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      return () => subscription.remove();
    }, [navigation, onClose]),
  );

  const requestLocationPermission = async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        // If callback is provided, call it, otherwise navigate normally
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
          ) || "Location access is required. Please enable it in settings.",
          [
            { text: t("Main.Cancel"), style: "cancel" },
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
    <View className="flex-1 bg-black">
      <CustomHeader
        title=""
        navigation={navigation}
        onBackPress={onClose ? onClose : () => navigation.goBack()}
        transparent
      />

      <View className="flex-1 justify-center">
        <View className="items-center justify-center px-4">
          {/* Location Image */}
          <View className="mb-8">
            <Image
              source={locationImage}
              className="w-44 h-44"
              resizeMode="contain"
            />
          </View>

          {/* Title */}
          <Text className="text-white text-3xl font-extrabold mb-3 text-center tracking-wide">
            {t("LocationAccess.LocationAccess")}
          </Text>

          {/* Description */}
          <Text className="text-gray-400 text-center mb-10 px-6 text-base leading-6">
            {t(
              "LocationAccess.EnableLocationAccessToAccessLocationInformation",
            )}
          </Text>

          {/* Allow Button */}
          <TouchableOpacity
            onPress={requestLocationPermission}
            activeOpacity={0.8}
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
                Allow
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default LocationAccess;
