import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";
import Svg, { Circle } from "react-native-svg";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { RootStackParamList } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { environment } from "@/environment/environment";

type ProjectStatusNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ProjectStatus"
>;

type ProjectStatusRouteProp = RouteProp<RootStackParamList, "ProjectStatus">;

interface ProjectStatusProps {
  navigation: ProjectStatusNavigationProp;
  route: ProjectStatusRouteProp;
}

interface InvestmentItem {
  investmentId: number;
  investerId: number;
  reqId: number;
  refCode: string;
  investerName: string;
  nic: string;
  shares: number;
  totInvt: string;
  expextreturnInvt: number;
  internalRate: number;
  invtStatus: string;
  investmentCreatedAt: string;
}

interface InvestmentDetail {
  requestId: number;
  jobId: string;
  officerId: number;
  approvedRequestId: number;
  approvedReqId: number;
  totalValue: string;
  defineShares: number;
  minShare: number;
  maxShare: number;
  defineBy: string | null;
  approvedCreatedAt: string;
  investments: InvestmentItem[];
}

const ProjectStatus: React.FC<ProjectStatusProps> = ({ navigation, route }) => {
  const { id, jobid } = route.params;
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [investmentDetail, setInvestmentDetail] =
    useState<InvestmentDetail | null>(null);
  const [projectData, setProjectData] = useState({
    receivedInvestment: 0,
    totalShares: 0,
    sharesLeft: 0,
    totalInvestmentNeeded: 0,
    pendingBalance: 0,
  });

  console.log("Project Status screen", id, jobid);
  console.log("Received Total Investemnet", projectData.receivedInvestment);

  useEffect(() => {
    fetchInvestmentDetails();
  }, [id]);

  const fetchInvestmentDetails = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");

      const response = await axios.get(
        `${environment.API_BASE_URL}api/goviCapital/get-approvedStatus-details/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("API Response:", response.data);

      if (response.data) {
        setInvestmentDetail(response.data);
        calculateProjectData(response.data);
      }
    } catch (error) {
      console.error("Error fetching investment details:", error);
      Alert.alert(
        "Error",
        "Failed to load investment details. Please try again later.",
        [{ text: "OK" }],
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("Main", { screen: "GoViCapitalRequests" });
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => backHandler.remove();
    }, [navigation]),
  );

  const calculateProjectData = (data: InvestmentDetail) => {
    if (!data) return;

    const investments = data.investments || [];

    const totalValue = parseFloat(data.totalValue) || 0;

    const totalShares = data.defineShares || 0;

    const totalReceived = investments.reduce(
      (sum, item) => sum + (parseFloat(item.totInvt) || 0),
      0,
    );

    const sharesSold = investments.reduce(
      (sum, item) => sum + (item.shares || 0),
      0,
    );

    const sharesLeft = totalShares - sharesSold;

    const pendingBalance = totalValue - totalReceived;

    console.log("Calculated Data:", {
      totalValue,
      totalShares,
      totalReceived,
      sharesSold,
      sharesLeft,
      pendingBalance,
    });

    setProjectData({
      receivedInvestment: totalReceived,
      totalShares: totalShares,
      sharesLeft: sharesLeft >= 0 ? sharesLeft : 0,
      totalInvestmentNeeded: totalValue,
      pendingBalance: pendingBalance >= 0 ? pendingBalance : 0,
    });
  };

  const progressPercentage =
    projectData.totalShares > 0
      ? Math.round(
          ((projectData.totalShares - projectData.sharesLeft) /
            projectData.totalShares) *
            100,
        )
      : 0;

  const radius = 45;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (progressPercentage / 100) * circumference;

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#FFCD01" />
        <Text className="mt-4 text-[#5A7386]">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFC107" />

      <View className="pt-5 pb-6 overflow-hidden" style={{ height: 180 }}>
        <Video
          source={require("../../assets/images/govi-pension/pension-background.mov")}
          className="absolute top-0 left-0 bottom-0 right-0 w-full h-[200%]"
          shouldPlay
          isLooping
          isMuted
          resizeMode={ResizeMode.COVER}
        />

        {/* Content */}
        <View className="mb-2 z-10 px-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Main", { screen: "GoViCapitalRequests" })
              }
              className="mr-3 p-1 bg-[#F6F6F680] rounded rounded-full mt-[-2%]"
              activeOpacity={0.7}
            >
              <MaterialIcons name="chevron-left" size={28} color="#000" />
            </TouchableOpacity>

            <View className="absolute w-full left-0 right-0 items-center justify-center mt-[-2%]">
              <Text className="text-base font-semibold text-black">
                #{jobid}
              </Text>
            </View>
          </View>
          <View className="absolute w-full left-0 right-0 items-center justify-center mt-[13%] mb-[10%] ml-[5%]">
            <Text className="text-black">
              {t("ProjectStatus.Received Total Investment")}
            </Text>
          </View>
          <View className="w-full left-0 right-0 items-center justify-center mt-[14%] mb-[5%]">
            <Text className="text-3xl font-semibold text-black">
              {t("ProjectStatus.Rs.")}{" "}
              {projectData.receivedInvestment.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 mt-[-7%]">
        <View className="px-3">
          <View className="bg-white rounded-2xl p-3 px-5 mb-5 shadow- border border-[#6E98B8]">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-xs text-[#000000]">
                  {t("ProjectStatus.Total Shares")}
                </Text>
                <Text className="text-base font-semibold text-[#000000] mb-2">
                  {projectData.totalShares}
                </Text>

                <Text className="text-xs text-[#000000]">
                  {t("ProjectStatus.Shares Left")}
                </Text>
                <Text className="text-base font-semibold text-[#000000]">
                  {projectData.sharesLeft}
                </Text>
              </View>

              <View className="items-center justify-center">
                <Svg width={100} height={100}>
                  <Circle
                    cx={50}
                    cy={50}
                    r={radius}
                    stroke="#FBFAED"
                    strokeWidth={strokeWidth}
                    fill="none"
                  />

                  <Circle
                    cx={50}
                    cy={50}
                    r={radius}
                    stroke="#FFCD01"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation="-90"
                    origin="50, 50"
                  />
                </Svg>
                <View className="absolute items-center justify-center">
                  <Text className="text-xl font-bold text-[#000000]">
                    {progressPercentage}%
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View className="flex-row justify-between mb-4">
          <View className="bg-[#FBFAED] border border-[#FFCD01] rounded-xl p-4 flex-1 mr-2">
            <Text className="text-xs text-[#000000] mb-2 text-center">
              {t("ProjectStatus.Total Investment")}
              {"\n"}
              {t("ProjectStatus.Needed")}
            </Text>
            <Text className="text-base font-semibold text-[#000000] text-center">
              {t("ProjectStatus.Rs.")}{" "}
              {projectData.totalInvestmentNeeded.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>

          <View className="bg-[#FBFAED] border border-[#FFCD01] rounded-xl p-4 flex-1 ml-2">
            <Text className="text-xs text-[#000000] mb-2 text-center">
              {t("ProjectStatus.Pending Balance")}
              {"\n"}
              {t("ProjectStatus.to Receive")}
            </Text>
            <Text className="text-base font-semibold text-[#000000] text-center">
              {t("ProjectStatus.Rs.")}{" "}
              {projectData.pendingBalance.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
        </View>

        {/* Transaction List - Only map through investments array with proper checks */}
        {investmentDetail?.investments &&
        investmentDetail.investments.length > 0 ? (
          investmentDetail.investments.map((transaction, index) => (
            <View
              key={index}
              className="bg-[#FFFFFF] border border-[#6E98B8] rounded-xl p-4 mb-3"
            >
              <View className="flex-row justify-between">
                <Text className="text-base font-semibold text-[#000000]">
                  {t("ProjectStatus.Rs.")}{" "}
                  {parseFloat(transaction.totInvt).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
                <Text className="text-xs text-[#5A7386] mt-1">
                  {formatDate(transaction.investmentCreatedAt)}
                </Text>
              </View>

              <Text className="text-xs text-[#5A7386]">
                {transaction.shares} {t("ProjectStatus.Shares")}
              </Text>
            </View>
          ))
        ) : (
          <View className="bg-[#FBFAED] border border-[#FFCD01] rounded-xl p-4 mb-3">
            <Text className="text-center text-[#5A7386]">
              No investment transactions found
            </Text>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </View>
  );
};

export default ProjectStatus;
