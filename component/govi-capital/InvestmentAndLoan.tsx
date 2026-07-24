import React, { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  BackHandler,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { StackNavigationProp } from "@react-navigation/stack";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { RootStackParamList } from "../types/types";
import Svg, { Ellipse, Defs, LinearGradient, Stop } from "react-native-svg";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import { RouteProp } from "@react-navigation/native";
import CustomHeader from "../common/CustomHeader";

type InvestmentAndLoanNavigationProp = StackNavigationProp<
  RootStackParamList,
  "InvestmentAndLoan"
>;

type InvestmentAndLoanRouteProp = RouteProp<
  RootStackParamList,
  "InvestmentAndLoan"
>;

interface InvestmentAndLoanProps {
  navigation: InvestmentAndLoanNavigationProp;
  route: InvestmentAndLoanRouteProp;
}

const InvestmentAndLoan: React.FC<InvestmentAndLoanProps> = ({
  navigation,
}) => {
  const { t } = useTranslation();

  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        navigation.navigate("Main", { screen: "GoViCapitalRequests" });
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackPress,
      );

      return () => subscription.remove();
    }, [navigation]),
  );

  return (
    <View className="flex-1 bg-white">
      {/* Background Gradient - Top Half */}
      <View className="absolute top-0 w-full" style={{ height: hp(50) }} pointerEvents="none">
        <Svg height="100%" width={wp(100)}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
              <Stop offset="1" stopColor="#72FFF5" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Ellipse
            cx={wp(50)}
            cy={hp(14)}
            rx={wp(80)}
            ry={hp(30)}
            fill="url(#grad)"
          />
        </Svg>
      </View>

      {/* Custom Header */}
      <CustomHeader
        title=""
        navigation={navigation}
        showBackButton={true}
        onBackPress={() =>
          navigation.navigate("Main", { screen: "GoViCapitalRequests" })
        }
        transparent={true}
        backButtonStyle={{
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          borderRadius: 50,
          padding: 10,
        }}
      />

      {/* Top Section with Image - First Half */}
      <View className="w-full items-center justify-center" style={{ height: hp(40) }}>
        <Image
          source={require("../../assets/images/govi-capital/investmentuser.webp")}
          className="w-full h-96"
          resizeMode="contain"
        />
      </View>

      {/* Bottom Section - Second Half */}
      <View className="flex-1 px-6 pt-8" style={{ backgroundColor: "#FFFFFF" }}>
        <View className="items-center mb-8">
          <Text className="text-2xl font-semibold text-[#000000] mb-3 text-center">
            {t("Govicapital.HowCanWeHelpYou")}
          </Text>
          <Text className="text-sm text-[#4B6B87] text-center leading-5 px-4">
            {t(
              "Govicapital.GoviCapitalProvidesYouWithCultivationInvestmentsAndLoans",
            )}
          </Text>
        </View>

        {/* Buttons Container */}
        <View className="flex-row gap-4 justify-center px-2">
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("InvestmentRequestForm");
            }}
            className="flex-1 bg-white rounded-2xl py-6 px-4 items-center justify-between"
            style={{
              minHeight: 150,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 5,
            }}
            activeOpacity={0.7}
          >
            <Text className="text-center text-gray-800 font-medium text-base leading-6 mb-4">
              {t("Govicapital.INeedAAnInvestment")}
            </Text>
            <View className="w-12 h-12 rounded-full items-center justify-center bg-[#0FC7B2]">
              <MaterialCommunityIcons
                name="arrow-right"
                size={20}
                color="#FFFFFF"
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-white rounded-2xl py-6 px-4 items-center justify-between"
            style={{
              minHeight: 150,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 5,
            }}
            activeOpacity={0.7}
          >
            <Text className="text-center text-gray-800 font-medium text-base leading-6 mb-4">
              {t("Govicapital.INeedALoan")}
            </Text>
            <View className="w-12 h-12 rounded-full items-center justify-center bg-[#0FC7B2]">
              <MaterialCommunityIcons
                name="arrow-right"
                size={20}
                color="#FFFFFF"
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default InvestmentAndLoan;