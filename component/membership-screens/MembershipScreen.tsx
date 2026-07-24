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
  route: any;
}

const MembershipScreen: React.FC<MembershipScreenProps> = ({
  navigation,
  route,
}) => {
  const [language, setLanguage] = useState("en");
  const { t } = useTranslation();
  const isSignUp = route.name === "MembershipScreenSignUp";

  const adjustFontSize = (size: number) =>
    language !== "en" ? size * 0.9 : size;

  useEffect(() => {
    const selectedLanguage = t("Main.LNG");
    setLanguage(selectedLanguage);

    if (!isSignUp) {
      const backAction = () => {
        navigation.navigate("Main", { screen: "QRcode" });
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction,
      );

      return () => {
        backHandler.remove();
      };
    }
  }, [t, navigation, isSignUp]);

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerClassName="pb-6"
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <CustomHeader
          title={""}
          navigation={navigation}
          showBackButton={true}
          onBackPress={() => {
            if (isSignUp) {
              navigation.goBack();
            } else {
              navigation.navigate("Main", { screen: "QRcode" });
            }
          }}
        />

        <View className="items-center mb-6 px-4">
          <View className="bg-gray-200 rounded-[15px] p-4 mb-4">
            <Image
              source={require("../../assets/images/membership/star-image.webp")}
              style={{ width: 32, height: 32 }}
            />
          </View>
          <Text
            className="font-bold text-gray-900 text-center"
            style={{ fontSize: adjustFontSize(18) }}
          >
            {t("Membership.ActiveMembership")}
          </Text>
          <Text
            className="text-gray-600 text-center mt-1"
            style={{ fontSize: adjustFontSize(14) }}
          >
            {t(
              "Membership.ActivateYourMembershipAsAnPolygonAgroRegisteredFarmer",
            )}
          </Text>
        </View>

        <View className="flex-row items-center mb-6 px-4">
          <View className="flex-1 h-px bg-gray-300" />
          <TouchableOpacity className="bg-yellow-500 rounded-[10px] py-2 px-6 mx-4">
            <Text className="text-white font-bold text-center">
              {t("Membership.Benifits")}
            </Text>
          </TouchableOpacity>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        <View className="mb-6 px-4">
          <View className="flex-row justify-between mb-3">
            <View className="w-[48%]">
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
                  className="font-bold text-gray-900 text-center mb-2"
                  style={{ fontSize: adjustFontSize(14) }}
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

            <View className="w-[48%]">
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
                  className="font-bold text-gray-900 text-center mb-2"
                  style={{ fontSize: adjustFontSize(14) }}
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
            <View className="w-[48%]">
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
                  className="font-bold text-gray-900 text-center mb-2"
                  style={{ fontSize: adjustFontSize(14) }}
                >
                  {t("Membership.QrCodeAccess")}
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

            <View className="w-[48%]">
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
                  className="font-bold text-gray-900 text-center mb-2"
                  style={{ fontSize: adjustFontSize(14) }}
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
            className="text-gray-600 text-center text-sm mb-6 p-2"
            style={{ fontSize: adjustFontSize(12) }}
          >
            {t(
              "Membership.ToObtainAccessToYourUniqueQRCodePleaseRegisterAsAMemberByEnteringYourBankDetailsThisCodeWillEnsureSmoothTransactionsAndSecurePaymentsDirectlyToYourBankAtOurCollectionCentres",
            )}
          </Text>

          <View className="items-center justify-center">
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
                  className="text-black font-thin mx-0.5"
                  style={{ fontSize: adjustFontSize(12) }}
                >
                  සහ
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("PrivacyPolicy")}
                >
                  <Text
                    className="text-black font-bold underline"
                    style={{ fontSize: adjustFontSize(12) }}
                  >
                    රහස්‍යතා ප්‍රතිපත්තිය
                  </Text>
                </TouchableOpacity>
                <Text
                  className="text-black font-thin ml-0.5"
                  style={{ fontSize: adjustFontSize(12) }}
                >
                  බලන්න
                </Text>
              </View>
            )}
          </View>
        </View>
        <View className="justify-center items-center w-full px-12">
          <TouchableOpacity
            className="w-full rounded-3xl h-[50px] mt-6 mb-3 bg-[#353535] shadow-lg elevation-6 justify-center items-center"
            onPress={async () => {
              navigation.navigate(
                isSignUp
                  ? ("BankDetailsSignUp" as any)
                  : ("BankDetailsScreen" as any),
              );
            }}
          >
            <Text className="text-white font-bold text-center text-lg">
              {t("Main.Continue")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default MembershipScreen;
