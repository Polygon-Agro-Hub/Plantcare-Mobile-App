import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { StackNavigationProp } from "@react-navigation/stack";
import { Video, ResizeMode } from "expo-av";
import CustomHeader from "./CustomHeader";
import { RootStackParamList } from "../types";
import { Dimensions } from "react-native";
import axios from "axios";
import { environment } from "../../environment/environment";
import AsyncStorage from "@react-native-async-storage/async-storage";

type MyPensionAccountScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "MyPensionAccount"
>;

interface MyPensionAccountProps {
  navigation: MyPensionAccountScreenNavigationProp;
}

interface PensionData {
  amount: number;
  date: string;
  status: "To Review" | "Approved" | "Rejected";
}

const MyPensionAccount: React.FC<MyPensionAccountProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const screenHeight = Dimensions.get("window").height;
  const whiteSectionHeight = screenHeight * 0.68;

  const [pensionData, setPensionData] = useState<PensionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPensionData();
  }, []);

  const fetchPensionData = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      const response = await axios.get(
        `${environment.API_BASE_URL}api/pension/pension-request/check-status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Pension data response:", response.data);

      if (response.data.status && response.data.reqStatus) {
        if (response.data.reqStatus !== "Approved") {
          Alert.alert(
            "Not Approved",
            "Your pension request has not been approved yet. Please check your status.",
            [
              {
                text: "OK",
                onPress: () => navigation.navigate("GoviPensionStatus"),
              },
            ]
          );
          return;
        }

        setPensionData({
          amount: response.data.defaultPension || 2000,
          date: response.data.userCreatedAt,
          status: response.data.reqStatus,
        });
      } else {
        Alert.alert(
          "No Pension Found",
          "You don't have an approved pension account yet.",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error("Error fetching pension data:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to fetch pension data. Please try again.";
      Alert.alert("Error", errorMessage, [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPensionData();
  };

  // Calculate if a year is a leap year
  const isLeapYear = (year: number): boolean => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  };

  // Get days in a year
  const getDaysInYear = (year: number): number => {
    return isLeapYear(year) ? 366 : 365;
  };

  // Calculate current pension value
  const calculatePensionValue = (): number => {
    if (!pensionData) return 0;

    const startDate = new Date(pensionData.date);
    const currentDate = new Date();

    if (currentDate < startDate) {
      return 0;
    }

    const totalDays = Math.floor(
      (currentDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
    );

    const fullYearsPassed = Math.floor(totalDays / 365.25);
    const baseAmount = fullYearsPassed * pensionData.amount;
    const daysInCurrentYear = totalDays - fullYearsPassed * 365.25;

    if (daysInCurrentYear <= 0) {
      return baseAmount;
    }

    const currentYear = startDate.getFullYear() + fullYearsPassed;
    const daysInYear = getDaysInYear(currentYear);
    const dailyRate = pensionData.amount / daysInYear;
    const partialAmount = dailyRate * daysInCurrentYear;

    return baseAmount + partialAmount;
  };

  // Calculate remaining time until pension becomes available
  const calculateRemainingTime = () => {
    if (!pensionData) return null;

    const startDate = new Date(pensionData.date);
    const currentDate = new Date();
    const eligibleDate = new Date(startDate);
    eligibleDate.setFullYear(startDate.getFullYear() + 5);

    if (currentDate >= eligibleDate) {
      return null;
    }

    let years = eligibleDate.getFullYear() - currentDate.getFullYear();
    let months = eligibleDate.getMonth() - currentDate.getMonth();
    let days = eligibleDate.getDate() - currentDate.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        0
      );
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months, days };
  };

  // Calculate time passed since start date
  const calculateTimePassed = () => {
    if (!pensionData) return { years: 0, months: 0, days: 0 };

    const startDate = new Date(pensionData.date);
    const currentDate = new Date();

    if (currentDate < startDate) {
      return { years: 0, months: 0, days: 0 };
    }

    let years = currentDate.getFullYear() - startDate.getFullYear();
    let months = currentDate.getMonth() - startDate.getMonth();
    let days = currentDate.getDate() - startDate.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        0
      );
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months, days };
  };

  // Check if eligible (5+ years passed)
  const isEligible = (): boolean => {
    const timePassed = calculateTimePassed();
    return timePassed.years >= 5;
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-black">
        <CustomHeader
          title={t("MyPensionAccount.GoViPension")}
          showBackButton={true}
          navigation={navigation}
          onBackPress={handleBackPress}
        />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#00A896" />
          <Text className="mt-4 text-white">Loading pension data...</Text>
        </View>
      </View>
    );
  }

  if (!pensionData) {
    return null;
  }

  const pensionValue = calculatePensionValue();
  const eligible = isEligible();
  const remaining = calculateRemainingTime();

  return (
    <View className="flex-1 bg-black">
      <Video
        source={require("../../assets/images/govi-pension/pension-background.mov")}
        className="absolute top-0 left-0 bottom-0 right-0 w-full h-full"
        shouldPlay
        isLooping
        isMuted
        resizeMode={ResizeMode.COVER}
      />

      <CustomHeader
        title={t("MyPensionAccount.GoViPension")}
        showBackButton={true}
        navigation={navigation}
        onBackPress={handleBackPress}
      />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00A896"
          />
        }
      >
        {eligible ? (
          <View className="flex-1 items-center justify-center px-5 pt-20 min-h-screen">
            <Text className="text-black text-5xl font-bold">
              Rs.
              {pensionValue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            <Text className="text-black text-lg my-6">Total Pension Value</Text>
          </View>
        ) : (
          <View className="flex-1 justify-end min-h-screen">
            <View className="flex-1 items-center justify-center px-5 pt-20">
              <Text className="text-black text-5xl font-bold">
                Rs.
                {pensionValue.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
              <Text className="text-black text-lg my-6">
                Total Pension Value
              </Text>
            </View>

            <View
              style={{ height: whiteSectionHeight }}
              className="bg-white rounded-t-3xl px-6 py-8 items-center justify-center"
            >
              <Text className="text-gray-800 text-2xl font-semibold mb-6 text-center">
                You will get your pension in...
              </Text>

              <View className="w-48 h-48 mb-6 items-center justify-center">
                <Image
                  source={require("../../assets/images/govi-pension/stay-tuned.webp")}
                  className="w-full h-full"
                  resizeMode="contain"
                />
              </View>

              {remaining && (
                <View
                  style={{
                    borderWidth: 2,
                    borderColor: "#008C7C",
                    borderStyle: "dashed",
                    overflow: "hidden",
                  }}
                  className="flex-row items-center justify-center gap-4 mt-6 rounded-lg px-4 pb-4 w-full"
                >
                  {remaining.years > 0 && (
                    <View className="items-center">
                      <Text className="text-2xl font-bold text-black ">
                        {remaining.years}{" "}
                        {remaining.years === 1 ? "Year" : "Years"}
                      </Text>
                    </View>
                  )}

                  {remaining.months > 0 && (
                    <View className="items-center">
                      <Text className="text-2xl font-bold text-black">
                        {remaining.months}{" "}
                        {remaining.months === 1 ? "Month" : "Months"}
                      </Text>
                    </View>
                  )}

                  <View className="items-center">
                    <Text className="text-2xl font-bold text-black">
                      {remaining.days} {remaining.days === 1 ? "Day" : "Days"}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default MyPensionAccount;