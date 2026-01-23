import React, { useState } from "react";
import { View, Text, Image } from "react-native";
import { useTranslation } from "react-i18next";
import { StackNavigationProp } from "@react-navigation/stack";
import { Video, ResizeMode } from "expo-av";
import CustomHeader from "./CustomHeader";
import { RootStackParamList } from "../types";
import { Dimensions } from "react-native";

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
}

const MyPensionAccount: React.FC<MyPensionAccountProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const screenHeight = Dimensions.get("window").height;
  const whiteSectionHeight = screenHeight * 0.68;

  // Mock data - replace with actual API call
  const [pensionData, setPensionData] = useState<PensionData>({
    amount: 2000, // Yearly amount
    date: "2018-01-23", // Start date
  });

  // Calculate if a year is a leap year
  const isLeapYear = (year: number): boolean => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  };

  // Get days in a year
  const getDaysInYear = (year: number): number => {
    return isLeapYear(year) ? 366 : 365;
  };

  // Calculate current pension value - FIXED VERSION
  const calculatePensionValue = (): number => {
    const startDate = new Date(pensionData.date);
    const currentDate = new Date();

    // If current date is before start date, return 0
    if (currentDate < startDate) {
      return 0;
    }

    // Calculate total days between start and current date
    const totalDays = Math.floor(
      (currentDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000),
    );

    // Calculate full years passed
    const fullYearsPassed = Math.floor(totalDays / 365.25);

    // Calculate base amount from full years (2000 per year)
    const baseAmount = fullYearsPassed * pensionData.amount;

    // Calculate days in current incomplete year
    const daysInCurrentYear = totalDays - fullYearsPassed * 365.25;

    if (daysInCurrentYear <= 0) {
      return baseAmount;
    }

    // Calculate current year
    const currentYear = startDate.getFullYear() + fullYearsPassed;
    const daysInYear = getDaysInYear(currentYear);

    // Calculate amount for partial year
    const dailyRate = pensionData.amount / daysInYear;
    const partialAmount = dailyRate * daysInCurrentYear;

    return baseAmount + partialAmount;
  };

  // Calculate remaining time until pension becomes available
  const calculateRemainingTime = () => {
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

    // Adjust negative days
    if (days < 0) {
      months--;
      const prevMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        0,
      );
      days += prevMonth.getDate();
    }

    // Adjust negative months
    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months, days };
  };

  // Calculate time passed since start date
  const calculateTimePassed = () => {
    const startDate = new Date(pensionData.date);
    const currentDate = new Date();

    if (currentDate < startDate) {
      return { years: 0, months: 0, days: 0 };
    }

    let years = currentDate.getFullYear() - startDate.getFullYear();
    let months = currentDate.getMonth() - startDate.getMonth();
    let days = currentDate.getDate() - startDate.getDate();

    // Adjust negative days
    if (days < 0) {
      months--;
      const prevMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        0,
      );
      days += prevMonth.getDate();
    }

    // Adjust negative months
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

  // Calculate values
  const pensionValue = calculatePensionValue();
  const eligible = isEligible();
  const remaining = calculateRemainingTime();

  return (
    <View className="flex-1 bg-black">
      {/* Video Background */}
      <Video
        source={require("../../assets/images/govi-pension/pension-background.mov")}
        className="absolute top-0 left-0 bottom-0 right-0 w-full h-full"
        shouldPlay
        isLooping
        isMuted
        resizeMode={ResizeMode.COVER}
      />

      {/* Custom Header */}
      <CustomHeader
        title={t("MyPensionAccount.GoViPension")}
        showBackButton={true}
        navigation={navigation}
        onBackPress={handleBackPress}
      />

      {/* Main Content */}
      {eligible ? (
        // Eligible State - Show Pension Amount
        <View className="flex-1 items-center justify-center px-5 pt-20">
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
        // Waiting State - Show Remaining Time and Current Value
        <View className="flex-1 justify-end">
          {/* Current Pension Value Display */}
          <View className="flex-1 items-center justify-center px-5 pt-20">
            <Text className="text-black text-5xl font-bold">
              Rs.
              {pensionValue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            <Text className="text-black text-lg my-6">Total Pension Value</Text>
          </View>

          {/* Waiting Section */}
          <View
            style={{ height: whiteSectionHeight }}
            className="bg-white rounded-t-3xl px-6 py-8 items-center justify-center"
          >
            <Text className="text-gray-800 text-2xl font-semibold mb-6 text-center">
              You will get your pension in...
            </Text>

            {/* Waiting Image */}
            <View className="w-48 h-48 mb-6 items-center justify-center">
              <Image
                source={require("../../assets/images/govi-pension/stay-tuned.webp")}
                className="w-full h-full"
                resizeMode="contain"
              />
            </View>
            {/* Countdown Timer */}
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
    </View>
  );
};

export default MyPensionAccount;
