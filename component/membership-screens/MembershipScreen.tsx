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
import { RootStackParamList } from "../types/types";
import { useTranslation } from "react-i18next";
import CustomHeader from "../common/CustomHeader";

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
    const selectedLanguage = t("Main.LNG");
    setLanguage(selectedLanguage);

    const backAction = () => {
      navigation.navigate("Main", { screen: "EngQRcode" });
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    return () => {
      backHandler.remove();
    };
  }, [t, navigation]);

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        className="flex-1 "
      >
        <CustomHeader
          title={""}
          navigation={navigation}
          onBackPress={() => navigation.goBack()}
        />

        <View className="items-center mb-6 px-4">
          <View className="bg-gray-200 rounded-[15px] p-4 mb-4">
            <Image
              source={require("../../assets/images/membership/star-image.webp")}
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
            {t("Membership.ActivateYourMembershipAsAnPolygonAgroRegisteredFarmer")}
          </Text>
        </View>

        <View className="flex-row items-center mb-6 ">
          <View style={{ flex: 1, height: 1, backgroundColor: "#ccc" }} />
          <TouchableOpacity className="bg-yellow-500 rounded-[10px] py-2 px-6 mx-4">
            <Text className="text-white font-bold text-center">
              {t("Membership.Benifits")}
            </Text>
          </TouchableOpacity>
          <View style={{ flex: 1, height: 1, backgroundColor: "#ccc" }} />
        </View>

        <View className="mb-6 px-4" style={{ paddingHorizontal: 4 }}>
          <View className="flex-row justify-between mb-3">
            <View style={{ width: "48%" }}>
              <View
                className="bg-white border border-gray-300 rounded-lg items-center justify-start"
                style={{
                  minHeight: 180,
                  paddingTop: 20,
                  paddingHorizontal: 12,
                  paddingBottom: 16,
                }}
              >
                <Image
                  source={require("../../assets/images/membership/sell-image.webp")}
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
                  {t("Membership.EasilySellYourHarvestDirectlyToPolygonAgro")}
                </Text>
              </View>
            </View>

            <View style={{ width: "48%" }}>
              <View
                className="bg-white border border-gray-300 rounded-lg items-center justify-start"
                style={{
                  minHeight: 180,
                  paddingTop: 20,
                  paddingHorizontal: 12,
                  paddingBottom: 16,
                }}
              >
                <Image
                  source={require("../../assets/images/membership/discount-image.webp")}
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
                  {t("Membership.ReceiveFairMarketPricesForYourCrops")}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row justify-between">
            <View style={{ width: "48%" }}>
              <View
                className="bg-white border border-gray-300 rounded-lg items-center justify-start"
                style={{
                  minHeight: 180,
                  paddingTop: 20,
                  paddingHorizontal: 12,
                  paddingBottom: 16,
                }}
              >
                <Image
                  source={require("../../assets/images/membership/qr-code-image.webp")}
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
                  {t("Membership.UniqueQRCodeForEntryAtOurCentre")}
                </Text>
              </View>
            </View>

            <View style={{ width: "48%" }}>
              <View
                className="bg-white border border-gray-300 rounded-lg items-center justify-start"
                style={{
                  minHeight: 180,
                  paddingTop: 20,
                  paddingHorizontal: 12,
                  paddingBottom: 16,
                }}
              >
                <Image
                  source={require("../../assets/images/membership/helping-hand-image.webp")}
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
                  {t("Membership.AssistanceWheneverYouNeedIt")}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View className="px-4">
          <Text
            className="text-gray-600 text-center text-sm mb-6 p-2 "
            style={{ fontSize: adjustFontSize(12) }}
          >
            {t("Membership.ToObtainAccessToYourUniqueQRCodePleaseRegisterAsAMemberByEnteringYourBankDetailsThisCodeWillEnsureSmoothTransactionsAndSecurePaymentsDirectlyToYourBankAtOurCollectionCentres")}
          </Text>
          <View className="flex items-center justify-center">
            {language === "en" ? (
              <View className="flex-row justify-center flex-wrap">
                <Text className="text-sm text-black font-thin">View </Text>

                <TouchableOpacity
                  onPress={() => navigation.navigate("TermsConditions")}
                >
                  <Text className="text-sm text-black font-bold underline">
                    Terms & Conditions
                  </Text>
                </TouchableOpacity>

                <Text className="text-sm text-black font-thin"> and </Text>

                <TouchableOpacity
                  onPress={() => navigation.navigate("PrivacyPolicy")}
                >
                  <Text className="text-sm text-black font-bold underline">
                    Privacy Policy
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="flex-row justify-center flex-wrap">
                <TouchableOpacity
                  onPress={() => navigation.navigate("TermsConditions")}
                >
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

                <TouchableOpacity
                  onPress={() => navigation.navigate("PrivacyPolicy")}
                >
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

          <View className="justify-center items-center">
            <TouchableOpacity
              className={`rounded-3xl  w-2/3 h-[50px] mt-6 mb-3 bg-[#353535] shadow-lg justify-center items-center`}
              onPress={async () => {
                navigation.navigate("BankDetailsScreen" as any);
              }}
              style={{
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <Text className="text-white font-bold text-center">
                {t("Main.Continue")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default MembershipScreen;
