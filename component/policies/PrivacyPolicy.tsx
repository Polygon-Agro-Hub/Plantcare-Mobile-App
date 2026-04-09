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
    const selectedLanguage = t("PrivacyPlicy.LNG");
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
        title={t("PrivacyPlicy.PrivacyPolicy")}
        showBackButton={true}
        navigation={navigation}
        onBackPress={() => navigation.goBack()}
      />
      <Text className="text-sm text-blue-500  text-center font-bold ">
        {t("PrivacyPlicy.By")} 11/08/2024
      </Text>

      <View className="py-2 px-4">
        <Text
          className="text-sm text-gray-700 mt-2"
          style={{ fontSize: adjustFontSize(14) }}
        >
          {t("PrivacyPlicy.explain")}
        </Text>
        <View className="flex-row justify-center items-center my-4"></View>

        <Text
          className="text-lg font-bold mt-4"
          style={{ fontSize: adjustFontSize(16) }}
        >
          1. {t("PrivacyPlicy.InformationWeCollect")}
        </Text>
        <Text
          className="text-sm font-bold mt-9"
          style={{ fontSize: adjustFontSize(14) }}
        >
          {t("PrivacyPlicy.RegistrationInformation")}
        </Text>
        <Text className="text-sm text-gray-700 mt-1">
          {t("PrivacyPlicy.RegistrationInformationTxt")}
        </Text>
        <Text
          className="text-sm font-bold mt-2"
          style={{ fontSize: adjustFontSize(14) }}
        >
          {t("PrivacyPlicy.LocationInformation")}
        </Text>
        <Text className="text-sm text-gray-700 mt-1">
          {t("PrivacyPlicy.LocationInformationTxt")}
        </Text>
        <Text
          className="text-sm font-bold mt-2"
          style={{ fontSize: adjustFontSize(14) }}
        >
          {t("PrivacyPlicy.UsageData")}
        </Text>
        <Text className="text-sm text-gray-700 mt-1">
          {t("PrivacyPlicy.UsageDataTxt")}
        </Text>

        <Text
          className="text-lg font-bold mt-6"
          style={{ fontSize: adjustFontSize(16) }}
        >
          2. {t("PrivacyPlicy.HowWeUseYourInformation")}
        </Text>
        <Text
          className="text-sm font-bold mt-9"
          style={{ fontSize: adjustFontSize(14) }}
        >
          {t("PrivacyPlicy.ToProvideServices")}
        </Text>
        <Text className="text-sm text-gray-700 mt-1">
          {t("PrivacyPlicy.ToProvideServicesTxt")}
        </Text>
        <Text
          className="text-sm font-bold mt-2"
          style={{ fontSize: adjustFontSize(14) }}
        >
          {t("PrivacyPlicy.WeatherandLocationServices")}
        </Text>
        <Text className="text-sm text-gray-700 mt-1">
          {t("PrivacyPlicy.WeatherandLocationServicesTxt")}
        </Text>
        <Text
          className="text-sm font-bold mt-2"
          style={{ fontSize: adjustFontSize(14) }}
        >
          {t("PrivacyPlicy.AccountManagement")}
        </Text>
        <Text className="text-sm text-gray-700 mt-1">
          {t("PrivacyPlicy.AccountManagementTxt")}
        </Text>
        <Text
          className="text-sm font-bold mt-2 "
          style={{ fontSize: adjustFontSize(14) }}
        >
          {t("PrivacyPlicy.PublicForum")}
        </Text>
        <Text className="text-sm text-gray-700 mt-1">
          {t("PrivacyPlicy.PublicForumTxt")}
        </Text>
        <Text
          className="text-sm font-bold mt-2"
          style={{ fontSize: adjustFontSize(14) }}
        >
          {t("PrivacyPlicy.ResearchandDevelopment")}
        </Text>
        <Text className="text-sm text-gray-700 mt-1">
          {t("PrivacyPlicy.ResearchandDevelopmentTxt")}
        </Text>

        <Text
          className="text-lg font-bold mt-4"
          style={{ fontSize: adjustFontSize(16) }}
        >
          3. {t("PrivacyPlicy.InformationSharingandDisclosure")}
        </Text>
        <Text className="text-sm text-gray-700 mt-4">
          {t("PrivacyPlicy.InformationSharingandDisclosuretxt")}
        </Text>
        <Text
          className="text-sm font-bold mt-9"
          style={{ fontSize: adjustFontSize(14) }}
        >
          {t("PrivacyPlicy.ServiceProviders")}
        </Text>
        <Text className="text-sm text-gray-700 mt-1">
          {t("PrivacyPlicy.ServiceProvidersTxt")}
        </Text>
        <Text
          className="text-sm font-bold mt-2"
          style={{ fontSize: adjustFontSize(14) }}
        >
          {" "}
          {t("PrivacyPlicy.LegalRequirements")}
        </Text>
        <Text className="text-sm text-gray-700 mt-1">
          {t("PrivacyPlicy.LegalRequirementsTxt")}
        </Text>
        <Text
          className="text-sm font-bold mt-2"
          style={{ fontSize: adjustFontSize(14) }}
        >
          {t("PrivacyPlicy.AggregatedData")}
        </Text>
        <Text className="text-sm mt-6 text-gray-700">
          {t("PrivacyPlicy.AggregatedDataTxt")}
        </Text>
        <Text
          className="text-lg font-bold mt-4"
          style={{ fontSize: adjustFontSize(16) }}
        >
          4. {t("PrivacyPlicy.SecurityofYourInformation")}
        </Text>
        <Text className="text-sm mt-6 text-gray-700">
          {t("PrivacyPlicy.SecurityofYourInformationTxt")}
        </Text>
        <Text
          className="text-lg font-bold mt-4"
          style={{ fontSize: adjustFontSize(16) }}
        >
          5. {t("PrivacyPlicy.YourPrivacyChoices")}
        </Text>
        <Text className="text-sm mt-6 text-gray-700 ">
          {t("PrivacyPlicy.YourPrivacyChoicesTxt")}
        </Text>

        <Text
          className="text-lg font-bold mt-4"
          style={{ fontSize: adjustFontSize(16) }}
        >
          6. {t("PrivacyPlicy.ChildrensPrivacy")}{" "}
        </Text>
        <Text className="text-sm mt-6 text-gray-700 ">
          {t("PrivacyPlicy.ChildrensPrivacyTxt")}
        </Text>

        <Text
          className="text-lg font-bold mt-4"
          style={{ fontSize: adjustFontSize(16) }}
        >
          7. {t("PrivacyPlicy.UpdatestothisPrivacyPolicy")}
        </Text>
        <Text className="text-sm mt-6 text-gray-700 mb-12">
          {t("PrivacyPlicy.UpdatestothisPrivacyPolicyTxt")}
        </Text>
      </View>
    </ScrollView>
  );
};

export default PrivacyPolicy;
