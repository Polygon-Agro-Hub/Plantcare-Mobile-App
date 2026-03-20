import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Animated,
} from "react-native";
import { useTranslation } from "react-i18next";
import { StackNavigationProp } from "@react-navigation/stack";
import { Video, ResizeMode } from "expo-av";
import CustomHeader from "../common/CustomHeader";
import { RootStackParamList } from "../types/types";
import { Dimensions } from "react-native";
import axios from "axios";
import { environment } from "../../environment/environment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LottieView from "lottie-react-native";

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
  const whiteSectionHeight = screenHeight * 0.7;

  const [pensionData, setPensionData] = useState<PensionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isSmallScreen = screenHeight < 700;

  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchPensionData();
  }, []);

  useEffect(() => {
    if (!pensionData) return;

    const pensionText = `Rs. ${calculatePensionValue().toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

    const textLength = pensionText.length;

    if (textLength > 12) {
      const scrollDistance = textLength * 9;

      const animation = Animated.loop(
        Animated.sequence([
          Animated.delay(1000),
          Animated.timing(scrollX, {
            toValue: -scrollDistance,
            duration: textLength * 200,
            useNativeDriver: true,
          }),
          Animated.timing(scrollX, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      );

      animation.start();

      return () => {
        scrollX.setValue(0);
        animation.stop();
      };
    }
  }, [pensionData]);

  const fetchPensionData = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      const response = await axios.get(
        `${environment.API_BASE_URL}api/pension/pension-request/check-status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

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
            ],
          );
          return;
        }

        setPensionData({
          amount: response.data.defaultPension || 2000,
          date: response.data.approveTime,
          status: response.data.reqStatus,
        });
      } else {
        Alert.alert(
          "No Pension Found",
          "You don't have an approved pension account yet.",
          [{ text: "OK", onPress: () => navigation.goBack() }],
        );
      }
    } catch (error: any) {
      console.error("Error fetching pension data:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to fetch pension data. Please try again.";
      Alert.alert("Error", errorMessage, [
        { text: "OK", onPress: () => navigation.goBack() },
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

  const isLeapYear = (year: number): boolean =>
    (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

  const getDaysInYear = (year: number): number =>
    isLeapYear(year) ? 366 : 365;

  const calculatePensionValue = (): number => {
    if (!pensionData) return 0;

    const startDate = new Date(pensionData.date);
    const currentDate = new Date();

    if (currentDate < startDate) return 0;

    let total = 0;
    let periodStart = new Date(startDate);

    while (periodStart < currentDate) {
      const year = periodStart.getFullYear();
      const daysInYear = getDaysInYear(year);
      const dailyRate = pensionData.amount / daysInYear;

      const periodEnd = new Date(periodStart);
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);

      const effectiveEnd = periodEnd < currentDate ? periodEnd : currentDate;

      const daysInPeriod = Math.floor(
        (effectiveEnd.getTime() - periodStart.getTime()) /
          (24 * 60 * 60 * 1000),
      );

      total += dailyRate * daysInPeriod;
      periodStart = periodEnd;
    }

    return total;
  };

  const calculateRemainingTime = () => {
    if (!pensionData) return null;

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const startDate = new Date(pensionData.date);
    startDate.setHours(0, 0, 0, 0);

    const eligibleDate = new Date(startDate);
    eligibleDate.setFullYear(startDate.getFullYear() + 5);
    eligibleDate.setHours(0, 0, 0, 0);

    if (currentDate >= eligibleDate) return null;

    const totalRemainingDays = Math.ceil(
      (eligibleDate.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000),
    );

    const AVG_DAYS_PER_YEAR = 365.25;
    const AVG_DAYS_PER_MONTH = AVG_DAYS_PER_YEAR / 12;

    const years = Math.floor(totalRemainingDays / AVG_DAYS_PER_YEAR);
    const rem = totalRemainingDays - years * AVG_DAYS_PER_YEAR;
    const months = Math.floor(rem / AVG_DAYS_PER_MONTH);
    const days = Math.round(rem - months * AVG_DAYS_PER_MONTH);

    return { years, months, days };
  };

  const calculateTimePassed = () => {
    if (!pensionData) return { years: 0, months: 0, days: 0 };

    const startDate = new Date(pensionData.date);
    const currentDate = new Date();

    if (currentDate < startDate) return { years: 0, months: 0, days: 0 };

    let years = currentDate.getFullYear() - startDate.getFullYear();
    let months = currentDate.getMonth() - startDate.getMonth();
    let days = currentDate.getDate() - startDate.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        0,
      );
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months, days };
  };

  const isEligible = (): boolean => {
    const timePassed = calculateTimePassed();
    return timePassed.years >= 5;
  };

  const handleBackPress = () => navigation.goBack();

  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
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

  if (!pensionData) return null;

  const pensionValue = calculatePensionValue();
  const eligible = isEligible();
  const remaining = calculateRemainingTime();

  const pensionText = `Rs. ${pensionValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const isLongText = pensionText.length > 12;

  const PensionAmount = () => (
    <View
      className="overflow-hidden"
      style={{
        width: "100%",
        alignItems: isLongText ? "flex-start" : "center",
      }}
    >
      <Animated.Text
        style={{
          fontSize: 48,
          fontWeight: "bold",
          color: "#000",
          transform: isLongText ? [{ translateX: scrollX }] : [],
          minWidth: isLongText ? "200%" : "auto",
        }}
      >
        {pensionText}
      </Animated.Text>
    </View>
  );

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
        scrollEnabled={isSmallScreen}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00A896"
          />
        }
      >
        {eligible ? (
          <View className="flex-1 items-center justify-center px-5 pt-10 min-h-screen">
            <PensionAmount />
            <Text className="text-black text-lg my-6">Total Pension Value</Text>
          </View>
        ) : (
          <View className="flex-1 justify-end min-h-screen mt-[-10%]">
            <View className="flex-1 items-center justify-center px-5">
              <PensionAmount />
              <Text className="text-black text-lg my-6">
                Total Pension Value
              </Text>
            </View>

            <View
              style={{ height: whiteSectionHeight }}
              className="bg-white rounded-t-3xl px-6 mt-[-5%] items-center justify-center"
            >
              <Text className="text-gray-800 text-xl font-semibold mt-[-10%] text-center">
                You will get your pension in...
              </Text>

              <View className="w-48 h-48 mb-6 items-center justify-center">
                <LottieView
                  source={require("../../assets/jsons/StayTuned.json")}
                  style={{ width: 200, height: 200 }}
                  autoPlay
                  loop
                />
              </View>

              {remaining && (
                <View
                  style={{
                    borderWidth: 2,
                    borderColor: "#008C7C",
                    borderStyle: "dashed",
                    overflow: "hidden",
                    paddingRight: 20,
                  }}
                  className="flex-row items-center gap-x-4 justify-center p-2 mt-6 rounded-lg w-full ml-[2%]"
                >
                  {remaining.years > 0 && (
                    <View className="items-center">
                      <Text className="text-xl font-bold text-black">
                        {remaining.years}{" "}
                        {remaining.years === 1 ? "Year" : "Years"}
                      </Text>
                    </View>
                  )}
                  {remaining.months > 0 && (
                    <View className="items-center">
                      <Text className="text-xl font-bold text-black">
                        {remaining.months}{" "}
                        {remaining.months === 1 ? "Month" : "Months"}
                      </Text>
                    </View>
                  )}
                  <View className="items-center">
                    <Text className="text-xl font-bold text-black">
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
