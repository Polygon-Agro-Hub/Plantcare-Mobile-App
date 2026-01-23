import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import CustomHeader from "./CustomHeader";
import { RootStackParamList } from "../types";

type GoviPensionStatusScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "GoviPensionStatus"
>;

type GoviPensionStatusScreenRouteProp = RouteProp<
  RootStackParamList,
  "GoviPensionStatus"
>;

interface GoviPensionStatusProps {
  navigation: GoviPensionStatusScreenNavigationProp;
  route: GoviPensionStatusScreenRouteProp;
}

const GoviPensionStatus: React.FC<GoviPensionStatusProps> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();

  // Static status configuration - you can change this value to test different statuses
  const [currentStatus, setCurrentStatus] = useState<
    "Stay Tuned!" | "Congratulations!" | "Try Again!"
  >("Stay Tuned!"); // Change this to test: "Congratulations!" or "Try Again!"

  const getStatusConfig = () => {
    switch (currentStatus) {
      case "Stay Tuned!":
        return {
          image: require("../../assets/images/govi-pension/stay-tuned.webp"),
          title: t("GoviPensionStatus.Stay Tuned!"),
          content: t(
            "GoviPensionStatus.We're taking a closer look at your pension application and will update you soon. This process might take a while.",
          ),
          buttonText: t("GoviPensionStatus.Go Back"),
          onPress: () => navigation.goBack(),
          buttonStyle: "bg-[#ECECEC]",
          buttonTextColor: "text-[#8E8E8E]",
        };
      case "Congratulations!":
        return {
          image: require("../../assets/images/govi-pension/congratulations.webp"),
          title: t("GoviPensionStatus.Congratulations!"),
          content: t(
            "GoviPensionStatus.You are now eligible for the pension scheme.",
          ),
          buttonText: t("GoviPensionStatus.View My Pension Account"),
          onPress: () => navigation.goBack(),
          buttonStyle: "bg-[#00A896]",
          buttonTextColor: "text-white",
        };
      case "Try Again!":
        return {
          image: require("../../assets/images/govi-pension/try-again.webp"),
          title: t("GoviPensionStatus.Try Again!"),
          content: t(
            "GoviPensionStatus.We're sorry to inform you that your pension request has been rejected. Please feel free to try again in the future.",
          ),
          buttonText: t("GoviPensionStatus.Go Back"),
          onPress: () => navigation.goBack(),
          buttonStyle: "bg-[#ECECEC]",
          buttonTextColor: "text-[#8E8E8E]",
        };
      default:
        return {
          image: require("../../assets/images/govi-pension/stay-tuned.webp"),
          title: t("GoviPensionStatus.Stay Tuned!"),
          content: t(
            "GoviPensionStatus.We're taking a closer look at your pension application and will update you soon. This process might take a while.",
          ),
          buttonText: t("GoviPensionStatus.Go Back"),
          onPress: () => navigation.goBack(),
          buttonStyle: "bg-[#00A896]",
          buttonTextColor: "text-[#8E8E8E]",
        };
    }
  };

  const config = getStatusConfig();

  // Handle status change for testing (you can remove this in production)
  const handleStatusChange = (
    newStatus: "Stay Tuned!" | "Congratulations!" | "Try Again!",
  ) => {
    setCurrentStatus(newStatus);
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Custom Header */}
      <CustomHeader
        title={t("TransactionList.GoViPension")}
        showBackButton={true}
        navigation={navigation}
        onBackPress={() => navigation.goBack()}
      />

      {/* TESTING CONTROLS - Remove this section in production */}
      <View className="px-4 py-3 bg-gray-100 border-b border-gray-200">
        <Text className="text-gray-600 text-sm mb-2">
          Test Status (Remove in production):
        </Text>
        <View className="flex-row space-x-2">
          <TouchableOpacity
            onPress={() => handleStatusChange("Stay Tuned!")}
            className="flex-1 bg-blue-100 rounded-full py-2"
          >
            <Text className="text-blue-800 text-center text-xs">Pending</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleStatusChange("Congratulations!")}
            className="flex-1 bg-green-100 rounded-full py-2"
          >
            <Text className="text-green-800 text-center text-xs">Approved</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleStatusChange("Try Again!")}
            className="flex-1 bg-red-100 rounded-full py-2"
          >
            <Text className="text-red-800 text-center text-xs">Rejected</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Image */}
        <View className="items-center justify-center mt-8 mb-8">
          <View className="w-64 h-64 rounded-full overflow-hidden">
            <Image
              source={config.image}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Status Title */}
        <View className="items-center mb-6">
          <Text className="text-2xl font-bold text-black">{config.title}</Text>
        </View>

        {/* Status Content */}
        <View className="px-8 mb-10">
          <Text className="text-md text-[#4B6B87] text-center leading-7">
            {config.content}
          </Text>
        </View>

        {/* Spacer to push button to bottom */}
        <View className="flex-1" />
      </ScrollView>

      {/* Action Button */}
      <View className="px-5 pb-6 pt-4 bg-white">
        <TouchableOpacity
          onPress={config.onPress}
          className={`${config.buttonStyle} rounded-full py-4`}
          activeOpacity={0.8}
        >
          <Text
            className={`${config.buttonTextColor} text-center font-bold text-lg`}
          >
            {config.buttonText}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GoviPensionStatus;
