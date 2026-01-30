import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import CustomHeader from "./CustomHeader";
import { RootStackParamList } from "../types";
import axios from "axios";
import { environment } from "../../environment/environment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LottieView from "lottie-react-native";

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

type StatusType = "To Review" | "Approved" | "Rejected";

const GoviPensionStatus: React.FC<GoviPensionStatusProps> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const [currentStatus, setCurrentStatus] = useState<StatusType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requestId, setRequestId] = useState<number | null>(null);

  useEffect(() => {
    fetchPensionStatus();
  }, []);

const fetchPensionStatus = async () => {
  try {
    setIsLoading(true);
    const token = await AsyncStorage.getItem("userToken");

    const response = await axios.get(
      `${environment.API_BASE_URL}api/pension/pension-request/check-status`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.status && response.data.reqStatus) {
      setCurrentStatus(response.data.reqStatus as StatusType);
      setRequestId(response.data.requestId);
    } else {
      navigation.goBack();
    }
  } catch (error: any) {
    console.error("Error fetching pension status:", error);
    navigation.goBack();
  } finally {
    setIsLoading(false);
  }
};

  const getStatusConfig = () => {
    switch (currentStatus) {
      case "To Review":
        return {
          lottieSource: require("../../assets/jsons/StayTuned.json"),
          title: t("GoviPensionStatus.Stay Tuned!"),
          content: t(
            "GoviPensionStatus.We're taking a closer look at your pension application and will update you soon. This process might take a while."
          ),
          buttonText: t("GoviPensionStatus.Go Back"),
          onPress: () => navigation.goBack(),
          buttonStyle: "bg-[#ECECEC]",
          buttonTextColor: "text-[#8E8E8E]",
        };
      case "Approved":
        return {
          lottieSource: require("../../assets/jsons/Congratulations.json"),
          title: t("GoviPensionStatus.Congratulations!"),
          content: t(
            "GoviPensionStatus.You are now eligible for the pension scheme."
          ),
          buttonText: t("GoviPensionStatus.View My Pension Account"),
          onPress: () => {
            navigation.navigate("MyPensionAccount");
          },
          buttonStyle: "bg-[#00A896]",
          buttonTextColor: "text-white",
        };
      case "Rejected":
        return {
          lottieSource: require("../../assets/jsons/RequestRejected.json"),
          title: t("GoviPensionStatus.Try Again!"),
          content: t(
            "GoviPensionStatus.We're sorry to inform you that your pension request has been rejected. Please feel free to try again in the future."
          ),
          buttonText: t("GoviPensionStatus.Go Back"),
          onPress: () => navigation.goBack(),
          buttonStyle: "bg-[#ECECEC]",
          buttonTextColor: "text-[#8E8E8E]",
        };
      default:
        return {
          lottieSource: require("../../assets/jsons/StayTuned.json"),
          title: t("GoviPensionStatus.Stay Tuned!"),
          content: t(
            "GoviPensionStatus.We're taking a closer look at your pension application and will update you soon. This process might take a while."
          ),
          buttonText: t("GoviPensionStatus.Go Back"),
          onPress: () => navigation.goBack(),
          buttonStyle: "bg-[#ECECEC]",
          buttonTextColor: "text-[#8E8E8E]",
        };
    }
  };

  const config = getStatusConfig();

  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <CustomHeader
          title={t("TransactionList.GoViPension")}
          showBackButton={true}
          navigation={navigation}
          onBackPress={() => navigation.goBack()}
        />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#00A896" />
          <Text className="mt-4 text-gray-600">
            {t("GoviPensionStatus.Loading status...")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <CustomHeader
        title={t("TransactionList.GoViPension")}
        showBackButton={true}
        navigation={navigation}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
  
        <View className="items-center justify-center mt-8 mb-8">
          <LottieView
            source={config.lottieSource}
            style={{ width: 200, height: 200 }}
            autoPlay
            loop
          />
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