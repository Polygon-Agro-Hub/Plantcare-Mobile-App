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
import { useTranslation } from "react-i18next";
import AntDesign from "react-native-vector-icons/AntDesign";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
// Type for navigation prop
type MembershipScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "MembershipScreen"
>;

interface MembershipScreenProps {
  navigation: MembershipScreenNavigationProp;
}

const MembershipScreen: React.FC<MembershipScreenProps> = ({ navigation }) => {
  const [language, setLanguage] = useState("en");
  const { t } = useTranslation();

  const adjustFontSize = (size: number) =>
    language !== "en" ? size * 0.9 : size;

  useEffect(() => {
    const selectedLanguage = t("Membership.LNG");
    setLanguage(selectedLanguage);
  }, [t]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
              style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
        
        className="flex-1 "
      >
        {/* <View className="flex-row items-center justify-between ">
           <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                   >
                     <AntDesign name="left" size={24} color="#000502" />
                   </TouchableOpacity>
        </View> */}
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

        {/* Benefits Section */}
        <View className="flex-row flex-wrap justify-between mb-6">
          <View className="w-1/2 p-2">
            <View className="bg-white border border-gray-300 rounded-lg p-4 items-center">
              <Image
                source={require("../assets/images/membership/Sell.webp")}
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
                source={require("../assets/images/membership/Discount.webp")}
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
                source={require("../assets/images/membership/Qr-Code.webp")}
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
                source={require("../assets/images/membership/Helping-Hand.webp")}
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
                className="text-black font-bold"
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
                className="text-black font-bold"
                style={{ fontSize: adjustFontSize(12) }}
              >
                {""} පුද්කලිකත්ව ප්‍රතිපත්තිය
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

<View className="justify-center items-center ">
          <TouchableOpacity
          className={`rounded-full py-4 w-64  mt-6 mb-3 bg-[#353535] shadow-lg`}
          onPress={async () => {
            navigation.navigate("BankDetailsSignUp" as any);
          }}
        >
          <Text className="text-white font-bold text-center">
            {t("Membership.Continue")}
          </Text>
        </TouchableOpacity>

</View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default MembershipScreen;
