import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, BackHandler } from "react-native";
import { RootStackParamList } from "../types/types";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import CustomHeader from "../common/CustomHeader";
type PrivacyPolicyNavigationProp = StackNavigationProp<
  RootStackParamList,
  "PrivacyPolicy"
>;

interface PrivacyPolicyProps {
  navigation: PrivacyPolicyNavigationProp;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ navigation }) => {
  const [language, setLanguage] = useState("en");
  const { t } = useTranslation();
  const adjustFontSize = (size: number) =>
    language !== "en" ? size * 0.9 : size;

  useEffect(() => {
    const selectedLanguage = t("Main.LNG");
    setLanguage(selectedLanguage);
  }, [t]);
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => backHandler.remove();
    }, [navigation]),
  );

  return (
    <ScrollView className="flex-1 bg-white">
      <CustomHeader
        title={t("PrivacyPolicy.PrivacyPolicy")}
        showBackButton={true}
        navigation={navigation}
        onBackPress={() => navigation.goBack()}
      />
      <Text className="text-sm text-blue-500  text-center font-bold ">
        {t("PrivacyPolicy.By")} 11/08/2024
      </Text>

      <View className="py-2 px-4">
        <Text
          className="text-sm text-gray-700 mt-2"
          style={{ fontSize: adjustFontSize(14) }}
        >
          {t("PrivacyPolicy.GoviCarePrivacy")}
        </Text>
        <View className="flex-row justify-center items-center my-4"></View>

        <Text
          className="text-lg font-bold mt-4"
          style={{ fontSize: adjustFontSize(16) }}
        >
          1. {t("PrivacyPolicy.InformationWeCollect")}
        </Text>
        <Text
          className="text-sm font-bold mt-9"
          style={{ fontSize: adjustFontSize(14) }}
        >
          {t("PrivacyPolicy.RegistrationInformation")}
        </Text>
        <Text className="text-sm text-gray-700 mt-1">
          {t("PrivacyPolicy.RegistrationInformationText")}
        </Text>
        <Text
          className="text-sm font-bold mt-2"
          style={{ fontSize: adjustFontSize(14) }}
        >
          {t("PrivacyPolicy.LocationInformation")}
        </Text>
        <Text className="text-sm text-gray-700 mt-1">
          {t("PrivacyPolicy.LocationInformationText")}
        </Text>
        <Text
          className="text-sm font-bold mt-2"
          style={{ fontSize: adjustFontSize(14) }}
        >
          {t("PrivacyPolicy.UsageData")}
        </Text>
        <Text className="text-sm text-gray-700 mt-1">
          {t("PrivacyPolicy.UsageDataText")}
        </Text>

        <Text
          className="text-lg font-bold mt-6"
          style={{ fontSize: adjustFontSize(16) }}
        >
          2. {t("PrivacyPolicy.HowWeUseYourInformation")}
        </Text>
        <Text
          className="text-sm font-bold mt-9"
          style={{ fontSize: adjustFontSize(14) }}
        >
          {t("PrivacyPolicy.ToProvideServices")}
        </Text>
        <Text className="text-sm text-gray-700 mt-1">
          {t("PrivacyPolicy.ToProvideServicesText")}
        </Text>
        <Text
          className="text-sm font-bold mt-2"
          style={{ fontSize: adjustFontSize(14) }}
        >
          {t("PrivacyPolicy.WeatherandLocationServices")}
        </Text>
        <Text className="text-sm text-gray-700 mt-1">
          {t("PrivacyPolicy.WeatherandLocationServicesText")}
        </Text>
        <Text
          className="text-sm font-bold mt-2"
          style={{ fontSize: adjustFontSize(14) }}
        >
          {t("PrivacyPolicy.AccountManagement")}
        </Text>
        <Text className="text-sm text-gray-700 mt-1">
          {t("PrivacyPolicy.AccountManagementText")}
        </Text>
        <Text
          className="text-sm font-bold mt-2 "
          style={{ fontSize: adjustFontSize(14) }}
        >
          {t("PrivacyPolicy.PublicForum")}
        </Text>
        <Text className="text-sm text-gray-700 mt-1">
          {t("PrivacyPolicy.PublicForumText")}
        </Text>
        <Text
          className="text-sm font-bold mt-2"
          style={{ fontSize: adjustFontSize(14) }}
        >
          {t("PrivacyPolicy.ResearchandDevelopment")}
        </Text>
        <Text className="text-sm text-gray-700 mt-1">
          {t("PrivacyPolicy.ResearchandDevelopmentText")}
        </Text>

        <Text
          className="text-lg font-bold mt-4"
          style={{ fontSize: adjustFontSize(16) }}
        >
          3. {t("PrivacyPolicy.InformationSharingandDisclosure")}
        </Text>
        <Text className="text-sm text-gray-700 mt-4">
          {t("PrivacyPolicy.InformationSharingandDisclosureText")}
        </Text>
        <Text
          className="text-sm font-bold mt-9"
          style={{ fontSize: adjustFontSize(14) }}
        >
          {t("PrivacyPolicy.ServiceProviders")}
        </Text>
        <Text className="text-sm text-gray-700 mt-1">
          {t("PrivacyPolicy.ServiceProvidersText")}
        </Text>
        <Text
          className="text-sm font-bold mt-2"
          style={{ fontSize: adjustFontSize(14) }}
        >
          {" "}
          {t("PrivacyPolicy.LegalRequirements")}
        </Text>
        <Text className="text-sm text-gray-700 mt-1">
          {t("PrivacyPolicy.LegalRequirementsText")}
        </Text>
        <Text
          className="text-sm font-bold mt-2"
          style={{ fontSize: adjustFontSize(14) }}
        >
          {t("PrivacyPolicy.AggregatedData")}
        </Text>
        <Text className="text-sm mt-6 text-gray-700">
          {t("PrivacyPolicy.AggregatedDataText")}
        </Text>
        <Text
          className="text-lg font-bold mt-4"
          style={{ fontSize: adjustFontSize(16) }}
        >
          4. {t("PrivacyPolicy.SecurityofYourInformation")}
        </Text>
        <Text className="text-sm mt-6 text-gray-700">
          {t("PrivacyPolicy.SecurityofYourInformationText")}
        </Text>
        <Text
          className="text-lg font-bold mt-4"
          style={{ fontSize: adjustFontSize(16) }}
        >
          5. {t("PrivacyPolicy.YourPrivacyChoices")}
        </Text>
        <Text className="text-sm mt-6 text-gray-700 ">
          {t("PrivacyPolicy.YourPrivacyChoicesText")}
        </Text>

        <Text
          className="text-lg font-bold mt-4"
          style={{ fontSize: adjustFontSize(16) }}
        >
          6. {t("PrivacyPolicy.ChildrensPrivacy")}{" "}
        </Text>
        <Text className="text-sm mt-6 text-gray-700 ">
          {t("PrivacyPolicy.ChildrensPrivacyText")}
        </Text>

        <Text
          className="text-lg font-bold mt-4"
          style={{ fontSize: adjustFontSize(16) }}
        >
          7. {t("PrivacyPolicy.UpdatestothisPrivacyPolicy")}
        </Text>
        <Text className="text-sm mt-6 text-gray-700 mb-12">
          {t("PrivacyPolicy.UpdatestothisPrivacyPolicyText")}
        </Text>
      </View>
    </ScrollView>
  );
};

export default PrivacyPolicy;
