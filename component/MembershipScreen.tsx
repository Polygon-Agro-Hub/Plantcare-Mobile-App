import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import { useNavigation } from "@react-navigation/native";
import Checkbox from "expo-checkbox";
import { useTranslation } from "react-i18next";

// Type for navigation prop
type MembershipScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "MembershipScreen"
>;

interface MembershipScreenProps {
  navigation: MembershipScreenNavigationProp;
}

const MembershipScreen: React.FC<MembershipScreenProps> = ({ navigation }) => {
  const [isChecked, setIsChecked] = useState(false);
  const [language, setLanguage] = useState("en");
  const { t } = useTranslation();

  const adjustFontSize = (size: number) => (language !== "en" ? size * 0.9 : size);

  useEffect(() => {
    const selectedLanguage = t("Membership.LNG");
    setLanguage(selectedLanguage);
  }, [t]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        className="flex-1 p-6"
      >
        {/* Header */}
        <View className="items-center mb-6">
          {/* Top Icon */}
          <View className="bg-gray-200 rounded-[15px] p-4 mb-4">
            <Image
              source={require("../assets/images/Star.png")}
              style={{ width: 32, height: 32 }}
            />
          </View>
          <Text
            className="text-xl font-bold text-gray-900"
            style={{ fontSize: adjustFontSize(18) }}
          >
            {t("Membership.ActiveMembership")}
          </Text>
          <Text
            className="text-gray-600 text-center mt-1"
            style={{ fontSize: adjustFontSize(14) }}
          >
            {t("Membership.ActiveYourMemvbershipText")}
          </Text>
        </View>

        {/* Horizontal Lines and Benefits Button */}
        <View className="flex-row items-center mb-6">
          <View style={{ flex: 1, height: 1, backgroundColor: "#ccc" }} />
          <TouchableOpacity className="bg-yellow-500 rounded-[10px] py-2 px-6 mx-4">
            <Text className="text-white font-bold text-center">
              {t("Membership.Benifits")}
            </Text>
          </TouchableOpacity>
          <View style={{ flex: 1, height: 1, backgroundColor: "#ccc" }} />
        </View>

        {/* Benefits Section */}
        <View className="flex-row flex-wrap justify-between mb-6">
          <View className="w-1/2 p-2">
            <View className="bg-white border border-gray-300 rounded-lg p-4 items-center">
              <Image
                source={require("../assets/images/Sell.png")}
                style={{ width: 40, height: 40 }}
              />
              <Text
                className="font-bold text-gray-900 mt-2  text-center"
                style={{ fontSize: adjustFontSize(14) }}
              >
                {t("Membership.SellYourHarvest")}
              </Text>
              <Text
                className="text-gray-600 text-center text-sm"
                style={{ fontSize: adjustFontSize(12) }}
              >
                {t("Membership.SellYourHarvestDes")}
              </Text>
            </View>
          </View>
          <View className="w-1/2 p-2">
            <View className="bg-white border border-gray-300 rounded-lg p-4 items-center">
              <Image
                source={require("../assets/images/Discount.png")}
                style={{ width: 40, height: 40 }}
              />
              <Text
                className="font-bold text-gray-900 mt-2  text-center"
                style={{ fontSize: adjustFontSize(14) }}
              >
                {t("Membership.FairPricing")}
              </Text>
              <Text
                className="text-gray-600 text-center text-sm"
                style={{ fontSize: adjustFontSize(12) }}
              >
                {t("Membership.FairPricingDes")}
              </Text>
            </View>
          </View>
          <View className="w-1/2 p-2">
            <View className="bg-white border border-gray-300 rounded-lg p-4 items-center">
              <Image
                source={require("../assets/images/Qr-Code.png")}
                style={{ width: 40, height: 40 }}
              />
              <Text
                className="font-bold text-gray-900 mt-2  text-center"
                style={{ fontSize: adjustFontSize(14) }}
              >
                {t("Membership.QrCodeAcess")}
              </Text>
              <Text
                className="text-gray-600 text-center text-sm"
                style={{ fontSize: adjustFontSize(12) }}
              >
                {t("Membership.QrCodeAcessDes")}
              </Text>
            </View>
          </View>
          <View className="w-1/2 p-2">
            <View className="bg-white border border-gray-300 rounded-lg p-4 items-center">
              <Image
                source={require("../assets/images/Helping-Hand.png")}
                style={{ width: 40, height: 40 }}
              />
              <Text
                className="font-bold text-gray-900 mt-2 text-center"
                style={{ fontSize: adjustFontSize(14) }}
              >
                {t("Membership.CustomerSupport")}
              </Text>
              <Text
                className="text-gray-600 text-center text-sm "
                style={{ fontSize: adjustFontSize(12) }}
              >
                {t("Membership.CustomerSupportDes")}
              </Text>
            </View>
          </View>
        </View>

        {/* Terms Section */}
        <Text
          className="text-gray-600 text-center text-sm mb-6 p-2 "
          style={{ fontSize: adjustFontSize(12) }}
        >
          {t("Membership.Terms&ConditionsDes")}
        </Text>
        <View className="flex items-center justify-center">
          {language === "en" ? (
            <Text className="text-center text-sm">
              <TouchableOpacity onPress={() => navigation.navigate("TermsConditions")}>
                <Text className="text-black font-bold">
                  <Text className="text-black font-thin">View </Text>Terms & Conditions
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate("PrivacyPolicy")}>
                <Text className="text-black font-bold">
                  <Text className="text-black font-thin"> and </Text>Privacy Policy
                </Text>
              </TouchableOpacity>
            </Text>
          ) : (
            <Text className="text-center  text-sm">
              <TouchableOpacity onPress={() => navigation.navigate("TermsConditions")}>
                <Text className="text-black font-bold" style={{ fontSize: adjustFontSize(12) }} >
                  නියමයන් සහ කොන්දේසි <Text className="text-black font-thin"  style={{ fontSize: adjustFontSize(12) }}> සහ </Text>
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate("PrivacyPolicy")}>
                <Text className="text-black font-bold"  style={{ fontSize: adjustFontSize(12) }}>
                  පුද්කලිකත්ව ප්‍රතිපත්තිය
                  <Text className="text-black font-thin"  style={{ fontSize: adjustFontSize(12) }}> බලන්න</Text>
                </Text>
              </TouchableOpacity>
            </Text>
          )}
        </View>

        {/* Checkbox Section */}
        <View className="flex-row items-center justify-center mt-4 p-4">
          <Checkbox
            value={isChecked}
            onValueChange={setIsChecked}
            color={isChecked ? "#4CAF50" : undefined}
          />
          <Text className="text-gray-700 ml-2" style={{ fontSize: adjustFontSize(12) }}>
            {t("Membership.AgreeToT&C")}
          </Text>
        </View>

        <TouchableOpacity
          className={`rounded-full py-4 mt-6 mb-3 ${isChecked ? "bg-[#353535]" : "bg-gray-400"}`}
          disabled={!isChecked}
          onPress={() => navigation.navigate("Main")}
        >
          <Text className="text-white font-bold text-center" >
            {t("Membership.Skip")} 
          </Text>
        </TouchableOpacity>

        {/* Continue Button */}
        <TouchableOpacity
          className={`rounded-full py-4 mt-6 mb-3 ${isChecked ? "bg-[#353535]" : "bg-gray-400"}`}
          disabled={!isChecked}
          onPress={() => navigation.navigate("BankDetailsScreen" as any)}
        >
          <Text className="text-white font-bold text-center" >
            {t("Membership.Continue")} 
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MembershipScreen;
