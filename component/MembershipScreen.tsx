import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  BackHandler,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import { useTranslation } from "react-i18next";
import AntDesign from "react-native-vector-icons/AntDesign";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import i18n from "@/i18n/i18n";
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

  const adjustFontSize = (size: number) =>
    language !== "en" ? size * 0.9 : size;

  // useEffect(() => {
  //   const selectedLanguage = t("Membership.LNG");
  //   setLanguage(selectedLanguage);
  // }, [t]);
    useEffect(() => {
    const selectedLanguage = t("Membership.LNG");
    setLanguage(selectedLanguage);

    const backAction = () => {
      navigation.navigate("Main", { screen: "EngQRcode" }); 
      return true;
    };

    // Add the back handler listener
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    // Cleanup listener on component unmount
    return () => {
      backHandler.remove();
    };
  }, [t, navigation]);

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
        className="flex-1 "
      >
        <View className="flex-row items-center justify-between ">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <AntDesign name="left" size={24} color="#000502" />
          </TouchableOpacity>
        </View>
        {/* Header */}
        <View className="items-center mb-6">
          {/* Top Icon */}
          <View className="bg-gray-200 rounded-[15px] p-4 mb-4">
            <Image
              source={require("../assets/images/membership/Star.webp")}
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
       {/* Benefits Section - All 4 Boxes with Equal Height & Width */}
        <View className="mb-6" style={{ paddingHorizontal: 4 }}>
          <View className="flex-row justify-between mb-3">
            {/* Top Left - Sell Your Harvest */}
            <View style={{ width: '48%' }}>
              <View 
                className="bg-white border border-gray-300 rounded-lg items-center justify-start" 
                style={{ 
                  minHeight: 180,
                  paddingTop: 20,
                  paddingHorizontal: 12,
                  paddingBottom: 16
                }}
              >
                <Image
                  source={require("../assets/images/membership/Sell.webp")}
                  style={{ width: 50, height: 50, marginBottom: 16 }}
                />
                <Text
                  className="font-bold text-gray-900 text-center"
                  style={{ fontSize: adjustFontSize(14), marginBottom: 8 }}
                >
                  {t("Membership.SellYourHarvest")}
                </Text>
                <Text
                  className="text-gray-600 text-center"
                  style={{
                    fontSize: adjustFontSize(11),
                    lineHeight: adjustFontSize(16),
                  }}
                >
                  {t("Membership.SellYourHarvestDes")}
                </Text>
              </View>
            </View>
            
            {/* Top Right - Fair Pricing */}
            <View style={{ width: '48%' }}>
              <View 
                className="bg-white border border-gray-300 rounded-lg items-center justify-start" 
                style={{ 
                  minHeight: 180,
                  paddingTop: 20,
                  paddingHorizontal: 12,
                  paddingBottom: 16
                }}
              >
                <Image
                  source={require("../assets/images/membership/Discount.webp")}
                  style={{ width: 50, height: 50, marginBottom: 16 }}
                />
                <Text
                  className="font-bold text-gray-900 text-center"
                  style={{ fontSize: adjustFontSize(14), marginBottom: 8 }}
                >
                  {t("Membership.FairPricing")}
                </Text>
                <Text
                  className="text-gray-600 text-center"
                  style={{
                    fontSize: adjustFontSize(11),
                    lineHeight: adjustFontSize(16),
                  }}
                >
                  {t("Membership.FairPricingDes")}
                </Text>
              </View>
            </View>
          </View>
          
          <View className="flex-row justify-between">
            {/* Bottom Left - QR Code Access */}
            <View style={{ width: '48%' }}>
              <View 
                className="bg-white border border-gray-300 rounded-lg items-center justify-start" 
                style={{ 
                  minHeight: 180,
                  paddingTop: 20,
                  paddingHorizontal: 12,
                  paddingBottom: 16
                }}
              >
                <Image
                  source={require("../assets/images/membership/Qr-Code.webp")}
                  style={{ width: 50, height: 50, marginBottom: 16 }}
                />
                <Text
                  className="font-bold text-gray-900 text-center"
                  style={{ fontSize: adjustFontSize(14), marginBottom: 8 }}
                >
                  {t("Membership.QrCodeAcess")}
                </Text>
                <Text
                  className="text-gray-600 text-center"
                  style={{
                    fontSize: adjustFontSize(11),
                    lineHeight: adjustFontSize(16),
                  }}
                >
                  {t("Membership.QrCodeAcessDes")}
                </Text>
              </View>
            </View>
            
            {/* Bottom Right - Customer Support */}
            <View style={{ width: '48%' }}>
              <View 
                className="bg-white border border-gray-300 rounded-lg items-center justify-start" 
                style={{ 
                  minHeight: 180,
                  paddingTop: 20,
                  paddingHorizontal: 12,
                  paddingBottom: 16
                }}
              >
                <Image
                  source={require("../assets/images/membership/Helping-Hand.webp")}
                  style={{ width: 50, height: 50, marginBottom: 16 }}
                />
                <Text
                  className="font-bold text-gray-900 text-center"
                  style={{ fontSize: adjustFontSize(14), marginBottom: 8 }}
                >
                  {t("Membership.CustomerSupport")}
                </Text>
                <Text
                  className="text-gray-600 text-center"
                  style={{
                    fontSize: adjustFontSize(11),
                    lineHeight: adjustFontSize(16),
                  }}
                >
                  {t("Membership.CustomerSupportDes")}
                </Text>
              </View>
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
    <View className="flex-row justify-center flex-wrap">
  <Text className="text-sm text-black font-thin">View </Text>

  <TouchableOpacity onPress={() => navigation.navigate("TermsConditions")}>
    <Text className="text-sm text-black font-bold underline">
      Terms & Conditions
    </Text>
  </TouchableOpacity>

  <Text className="text-sm text-black font-thin"> and </Text>

  <TouchableOpacity onPress={() => navigation.navigate("PrivacyPolicy")}>
    <Text className="text-sm text-black font-bold underline">
      Privacy Policy
    </Text>
  </TouchableOpacity>
</View>

          ) : (
            <View className="flex-row justify-center flex-wrap">
  <TouchableOpacity onPress={() => navigation.navigate("TermsConditions")}>
    <Text
      className="text-black font-bold underline"
      style={{ fontSize: adjustFontSize(12) }}
    >
      නියමයන් සහ කොන්දේසි
    </Text>
  </TouchableOpacity>

  <Text
    className="text-black font-thin"
    style={{ fontSize: adjustFontSize(12), marginHorizontal: 2 }}
  >
    {""} සහ
  </Text>

  <TouchableOpacity onPress={() => navigation.navigate("PrivacyPolicy")}>
    <Text
      className="text-black font-bold underline"
      style={{ fontSize: adjustFontSize(12) }}
    >
      {""} රහස්‍යතා ප්‍රතිපත්තිය
    </Text>
  </TouchableOpacity>

  <Text
    className="text-black font-thin"
    style={{ fontSize: adjustFontSize(12), marginLeft: 2 }}
  >
   {""} බලන්න
  </Text>
</View>

          )}
        </View>

        {/* Checkbox Section */}
        {/* <View className="flex-row items-center justify-center mt-4 p-4">
          <Checkbox
            value={isChecked}
            onValueChange={setIsChecked}
            color={isChecked ? "#4CAF50" : undefined}
          />
          <Text
            className="text-gray-700 ml-2"
            style={{ fontSize: adjustFontSize(12) }}
          >
            {t("Membership.AgreeToT&C")}
          </Text>
        </View> */}

        <View className="justify-center items-center">
                  <TouchableOpacity
                  className={`rounded-full py-4 w-64  mt-6 mb-3 bg-[#353535] shadow-lg`}
                  onPress={async () => {
                     navigation.navigate("BankDetailsScreen" as any);
                  }}
                >
                  <Text className="text-white font-bold text-center">
                    {t("Membership.Continue")}
                  </Text>
                </TouchableOpacity>
        
        </View>
        
      </ScrollView>
    </View>
  );
};

export default MembershipScreen;
