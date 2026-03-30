import React, { useEffect } from "react";
import { View, Text, Image } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTranslation } from "react-i18next";
import LottieView from "lottie-react-native";
import { RootStackParamList } from "../types/types";
import CustomHeader from "../common/CustomHeader";

type GoviShopNavigationProp = StackNavigationProp<
  RootStackParamList,
  "GoviShopLoadingScreen"
>;

interface GoviShopProps {
  navigation: GoviShopNavigationProp;
}

const GoviShopLoadingScreen: React.FC<GoviShopProps> = ({ navigation }) => {
  const { t } = useTranslation();

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("ExploreShopsScreen");
    }, 3000); 

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View className="flex-1 bg-white">
      <CustomHeader title="" showBackButton={true} navigation={navigation} />

      <View className="flex-1 justify-center items-center px-6">
        {/* Logo Section */}
        <View className="items-center mb-8">
          <Image
            source={require("@/assets/images/govi-shop/govi-shop-logo.webp")}
            className="w-64 h-64 mb-4"
            resizeMode="contain"
          />
          <Text className="text-lg font-bold text-[#657178] text-center my-10">
            {t("GoviShop.WelcomeToGoviShop") || "Welcome to GoViShop"}
          </Text>
        </View>

        {/* Loading Animation - Smaller */}
        <View className="w-20 h-20 mt-4">
          <LottieView
            source={require("@/assets/jsons/govi-shop/loading-animation.json")}
            autoPlay
            loop
            style={{ width: "100%", height: "100%" }}
          />
        </View>
      </View>
    </View>
  );
};

export default GoviShopLoadingScreen;