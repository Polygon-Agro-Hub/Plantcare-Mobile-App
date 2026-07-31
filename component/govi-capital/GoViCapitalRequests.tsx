import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import axios from "axios";
import { environment } from "@/environment/environment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../types/types";
import CustomHeader from "../common/CustomHeader";
import NoData from "../common/NoData";
import LoadingPage from "../common/LoadingPage";

type GoViCapitalRequestsNavigationProp = StackNavigationProp<
  RootStackParamList,
  "GoViCapitalRequests"
>;

type GoViCapitalRequestsRouteProp = RouteProp<
  RootStackParamList,
  "GoViCapitalRequests"
>;

interface GoViCapitalRequestsProps {
  navigation: GoViCapitalRequestsNavigationProp;
  route: GoViCapitalRequestsRouteProp;
}

interface RequestItem {
  id: string;
  cropId: string;
  farmerId: string;
  officerId: string;
  jobId: string;
  extentha: number;
  extentac: number;
  extentp: number;
  investment: string;
  expectedYield: string;
  startDate: string;
  nicFront: string;
  nicBack: string;
  assignDate: string;
  publishDate: string;
  assignedBy: string;
  publishBy: string;
  reqStatus: string;
  publishStatus: string;
  createdAt: string;
  cropNameEnglish: string;
  cropNameSinhala: string;
  cropNameTamil: string;
  isFistTime: number;
}

const GoViCapitalRequests: React.FC<GoViCapitalRequestsProps> = ({
  navigation,
}) => {
  const [investmentRequests, setInvestmentRequests] = useState<RequestItem[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { t, i18n } = useTranslation();

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "under_review":
      case "pending":
        return {
          text: t("Govicapital.RequestUnderReview"),
          color: "#C49400",
        };
      case "approved":
        return {
          text: t("Govicapital.RequestApproved"),
          color: "#00C1AB",
        };
      case "rejected":
        return {
          text: t("Govicapital.RequestRejected"),
          color: "#FF0000",
        };
      default:
        return {
          text: status || t("Govicapital.UnknownStatus"),
          color: "#9CA3AF",
        };
    }
  };

  const getCropName = (request: RequestItem) => {
    const currentLanguage = i18n.language;

    switch (currentLanguage) {
      case "si":
      case "sinhala":
        return (
          request.cropNameSinhala ||
          request.cropNameEnglish ||
          t("Govicapital.UnknownCrop")
        );
      case "ta":
      case "tamil":
        return (
          request.cropNameTamil ||
          request.cropNameEnglish ||
          t("Govicapital.UnknownCrop")
        );
      case "en":
      case "english":
      default:
        return request.cropNameEnglish || t("Govicapital.UnknownCrop");
    }
  };

  const handleRequestPress = async (request: RequestItem) => {
    if (request.reqStatus?.toLowerCase() === "approved") {
      if (request.isFistTime === 0) {
        try {
          const token = await AsyncStorage.getItem("userToken");

          if (!token) {
            Alert.alert(
              "Error",
              "Authentication token not found. Please login again.",
            );
            return;
          }

          await axios.post(
            `${environment.API_BASE_URL}api/goviCapital/update-review-status/${request.id}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          navigation.navigate("RequestReview", {
            request: request,
            status: request.reqStatus,
          });

          await fetchInvestmentDetails();
        } catch (error) {
          console.error("Error updating review status:", error);
          Alert.alert("Error", "Failed to update review status");
        }
      } else if (request.isFistTime === 1) {
        navigation.navigate("ProjectStatus", {
          id: request.id,
          jobid: request.jobId,
        });
      }
    } else {
      navigation.navigate("RequestReview", {
        request: request,
        status: request.reqStatus,
      });
    }
  };

  const fetchInvestmentDetails = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert(
          "Error",
          "Authentication token not found. Please login again.",
        );
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${environment.API_BASE_URL}api/goviCapital/get-investment-requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (
        response.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        setInvestmentRequests(response.data);
      } else {
        setInvestmentRequests([]);
      }
    } catch (error: any) {
      console.error("Error fetching investment requests:", error);
      if (error.response?.status === 404) {
        setInvestmentRequests([]);
      } else {
        Alert.alert("Error", "Failed to load investment requests");
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInvestmentDetails();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchInvestmentDetails();
  }, []);

  const handleAddRequest = () => {
    navigation.navigate("InvestmentAndLoan");
  };

  const formatAmount = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return `Rs. ${numAmount.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <View className="flex-1 bg-white">
      <CustomHeader
        title={t("Govicapital.InvestmentLoanRequests")}
        navigation={navigation}
        onBackPress={() => navigation?.goBack()}
      />
      {/* Loading State */}
      {loading ? (
        <View className="flex-1 justify-center items-center bg-white">
          <LoadingPage fullScreen />
        </View>
      ) : investmentRequests.length === 0 ? (
        /* Empty State */
        <ScrollView
          contentContainerStyle={{ flex: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#000"]}
              tintColor="#000"
            />
          }
        >
          <NoData text={t("Govicapital.NoRequestsYet") || "No requests yet"} />
        </ScrollView>
      ) : (
        <ScrollView
          className="flex-1 px-6 pt-4 mb-20"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#000"]}
              tintColor="#000"
            />
          }
        >
          {investmentRequests.map((request, index) => {
            const statusInfo = getStatusStyle(request.reqStatus);
            const cropName = getCropName(request);

            return (
              <TouchableOpacity
                key={`${request.id}-${index}`}
                onPress={() => handleRequestPress(request)}
                activeOpacity={0.7}
                className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100"
                style={{
                  shadowColor: "#000000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                {/* Request ID and Job ID */}
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-[#4E6393]">#{request.jobId}</Text>
                </View>

                {/* Crop Name and Arrow */}
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="font-semibold text-gray-900">
                    {cropName}
                  </Text>
                  <MaterialIcons
                    name="chevron-right"
                    size={25}
                    color="#9ca3af"
                  />
                </View>

                {/* Amount */}
                <View className="flex-row items-center mb-2">
                  <FontAwesome5 name="coins" size={16} color="black" />
                  <Text className="font-bold text-gray-900 ml-2">
                    {formatAmount(request.investment)}
                  </Text>
                </View>

                {/* Status */}
                <Text
                  className="text-sm font-medium"
                  style={{ color: statusInfo.color }}
                >
                  {statusInfo.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={handleAddRequest}
        activeOpacity={0.8}
        className="absolute bottom-20 right-6 bg-gray-800 w-16 h-16 rounded-full items-center justify-center shadow-lg"
      >
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default GoViCapitalRequests;
