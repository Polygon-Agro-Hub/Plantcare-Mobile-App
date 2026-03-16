import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, BackHandler } from "react-native";
import { RootStackParamList } from "../types/types";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import CustomHeader from "../common/CustomHeader";
type TermsConditionsNavigationProp = StackNavigationProp<
  RootStackParamList,
  "PrivacyPolicy"
>;

interface TermsConditionsProps {
  navigation: TermsConditionsNavigationProp;
}

const TermsConditions: React.FC<TermsConditionsProps> = ({ navigation }) => {
  const [language, setLanguage] = useState("en");
  const { t } = useTranslation();

  const adjustFontSize = (size: number) =>
    language !== "en" ? size * 0.9 : size;

  useEffect(() => {
    const selectedLanguage = t("Terms&Condisions.LNG");
    setLanguage(selectedLanguage);
  }, [t]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [navigation]),
  );

  return (
    <ScrollView className="flex-1 bg-white">
      <CustomHeader
        title={t("Terms&Condisions.Terms&Conditions")}
        showBackButton={true}
        navigation={navigation}
        onBackPress={() => navigation.goBack()}
      />
      <Text className="text-sm text-blue-500  text-center font-bold ">
        {t("Terms&Condisions.By")} 11/08/2024
      </Text>

      <View className="p-2 px-6">
        <Text
          className="text-sm text-gray-700 mt-2"
          style={{ fontSize: adjustFontSize(14) }}
        >
          {t("Terms&Condisions.explain")}{" "}
        </Text>

        <Text
          className="text-lg font-bold mt-8"
          style={{ fontSize: adjustFontSize(16) }}
        >
          1. {t("Terms&Condisions.UseoftheApp")}{" "}
        </Text>
        <Text className="text-sm font-bold mt-8">
          {t("Terms&Condisions.Eligibility")}
        </Text>
        <Text className="text-sm text-gray-700 mt-1">
          {t("Terms&Condisions.EligibilityTxt")}
        </Text>
        <Text className="text-sm font-bold mt-2">
          {t("Terms&Condisions.LicenseGrant")}
        </Text>
        <Text className="text-sm text-gray-700 mt-1">
          {t("Terms&Condisions.LicenseGrantTxt")}
        </Text>
        <Text className="text-sm font-bold mt-2">
          {t("Terms&Condisions.ProhibitedUses")}
        </Text>
        <Text className="text-sm text-gray-700 mt-1">
          {t("Terms&Condisions.ProhibitedUsesTxt")}
        </Text>
        <View>
          <Text className="text-sm text-gray-700 mt-4">
            {t("Terms&Condisions.bullet1")}
          </Text>
          <Text className="text-sm text-gray-700">
            {t("Terms&Condisions.bullet2")}
          </Text>
          <Text className="text-sm text-gray-700">
            {t("Terms&Condisions.bullet3")}
          </Text>
          <Text className="text-sm text-gray-700">
            {t("Terms&Condisions.bullet4")}
          </Text>
          <Text className="text-sm text-gray-700">
            {t("Terms&Condisions.bullet5")}
          </Text>
        </View>

        <Text
          className="text-lg font-bold mt-6"
          style={{ fontSize: adjustFontSize(16) }}
        >
          2. {t("Terms&Condisions.UserRegistrationandAccountSecurity")}
        </Text>
        <Text className="text-sm text-gray-700 mt-4">
          {t("Terms&Condisions.UserRegistrationandAccountSecurityTxt")}
        </Text>
        <View>
          <Text className="text-sm text-gray-700 mt-4">
            {t("Terms&Condisions.bullet6")}
          </Text>
          <Text className="text-sm text-gray-700">
            {t("Terms&Condisions.bullet7")}
          </Text>
          <Text className="text-sm text-gray-700">
            {t("Terms&Condisions.bullet8")}
          </Text>
          <Text className="text-sm text-gray-700">
            {t("Terms&Condisions.bullet9")}
          </Text>
        </View>

        <Text
          className="text-lg font-bold mt-6"
          style={{ fontSize: adjustFontSize(16) }}
        >
          3. {t("Terms&Condisions.PublicForum")}
        </Text>
        <Text className="text-sm font-bold  mt-4">
          {t("Terms&Condisions.UserContent")}
        </Text>
        <Text className="text-sm text-gray-700">
          {t("Terms&Condisions.UserContentTxt")}
        </Text>
        <Text className="text-sm font-bold mt-4">
          {t("Terms&Condisions.CodeofConduct")}
        </Text>
        <Text className="text-sm text-gray-700 mt-1">
          {t("Terms&Condisions.CodeofConductTxt")}
        </Text>

        <Text
          className="text-lg font-bold mt-6"
          style={{ fontSize: adjustFontSize(16) }}
        >
          4. {t("Terms&Condisions.Privacy")}
        </Text>
        <Text className="text-sm text-gray-700 mt-2">
          {t("Terms&Condisions.PrivacyTxt")}
        </Text>

        <Text
          className="text-lg font-bold mt-4"
          style={{ fontSize: adjustFontSize(16) }}
        >
          5. {t("Terms&Condisions.DisclaimerofWarranties")}
        </Text>
        <Text className="text-sm mt- text-gray-700 mt-2">
          {t("Terms&Condisions.DisclaimerofWarrantiesTxt")}
        </Text>
        <Text
          className="text-lg font-bold mt-4"
          style={{ fontSize: adjustFontSize(16) }}
        >
          6. {t("Terms&Condisions.LimitationofLiability")}
        </Text>
        <Text className="text-sm mt- text-gray-700 mt-2">
          {t("Terms&Condisions.LimitationofLiabilityTxt")}
        </Text>

        <Text
          className="text-lg font-bold mt-4"
          style={{ fontSize: adjustFontSize(16) }}
        >
          7. {t("Terms&Condisions.ModificationstotheApp")}
        </Text>
        <Text className="text-sm mt- text-gray-700 mt-2 ">
          {t("Terms&Condisions.ModificationstotheAppTxt")}
        </Text>

        <Text
          className="text-lg font-bold mt-4"
          style={{ fontSize: adjustFontSize(16) }}
        >
          8. {t("Terms&Condisions.Termination")}
        </Text>
        <Text className="text-sm mt- text-gray-700 mt-2 ">
          {t("Terms&Condisions.TerminationTxt")}
        </Text>

        <Text
          className="text-lg font-bold mt-4"
          style={{ fontSize: adjustFontSize(16) }}
        >
          9. {t("Terms&Condisions.GoverningLaw")}
        </Text>
        <Text className="text-sm mt- text-gray-700 mt-2 ">
          {t("Terms&Condisions.GoverningLawTxt")}
        </Text>
        <Text
          className="text-lg font-bold mt-4"
          style={{ fontSize: adjustFontSize(16) }}
        >
          10. {t("Terms&Condisions.ContactUs")}
        </Text>
        <Text className="text-sm text-gray-700 mt-2">
          {t("Terms&Condisions.ContactUsTxt")}
        </Text>
        <Text className="text-lg font-semibold mb-10  ">info@polygon.lk</Text>
      </View>
    </ScrollView>
  );
};

export default TermsConditions;
