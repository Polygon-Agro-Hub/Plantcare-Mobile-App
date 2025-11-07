import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  RefreshControl,
} from "react-native";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Checkbox from "expo-checkbox";
import { RouteProp } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import axios from "axios";
import LottieView from "lottie-react-native";

type RequestHistoryNavigationProp = StackNavigationProp<
  RootStackParamList,
  "RequestHistory"
>;

type RequestHistoryRouteProp = RouteProp<RootStackParamList, "RequestHistory">;

interface RequestHistoryProps {
  navigation: RequestHistoryNavigationProp;
  route: RequestHistoryRouteProp;
}

interface ServiceRequest {
  id: string;
  serviceName: string;
  status: "Request Placed" | "Request Reviewed" | "Finished";
  scheduledDate: string;
  date: string;
  serviceId: string;
  farmerId: string;
  farmId: string;
  jobId: string;
  isAllCrops: boolean;
  createdAt: string;
  englishName: string;
  sinhalaName: string;
  tamilName: string;
  srvFee: number;
}

const RequestHistory: React.FC<RequestHistoryProps> = ({
  navigation,
  route,
}) => {
  const { t, i18n } = useTranslation();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      
      if (!token) {
        Alert.alert(t("Error"), t("Authentication required"));
        return;
      }

      const response = await axios.get(
        `${environment.API_BASE_URL}api/requestinspection/get-request`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API Response:", response.data);

      if (response.data && Array.isArray(response.data)) {
        // Get current language
        const currentLang = i18n.language || 'en';
        
        // Transform API data to match ServiceRequest interface
        const transformedRequests: ServiceRequest[] = response.data.map((item: any) => {
          // Determine service name based on current language
          let serviceName = item.englishName; // default
          if (currentLang === 'si' && item.sinhalaName) {
            serviceName = item.sinhalaName;
          } else if (currentLang === 'ta' && item.tamilName) {
            serviceName = item.tamilName;
          }

          // Format scheduled date
          const scheduledDate = item.sheduleDate 
            ? new Date(item.sheduleDate).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })
            : "Not scheduled";

          // Map status from API to your status types
          let status: "Request Placed" | "Request Reviewed" | "Finished" = "Request Placed";
          if (item.status === "Request Reviewed" || item.status === "Request Reviewed") {
            status = "Request Reviewed";
          } else if (item.status === "Finished" || item.status === "finished") {
            status = "Finished";
          }

          return {
            id: item.id.toString(),
            serviceName: serviceName,
            status: status,
            scheduledDate: scheduledDate,
            date: item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            serviceId: item.serviceId,
            farmerId: item.farmerId,
            farmId: item.farmId,
            jobId: item.jobId,
            isAllCrops: item.isAllCrops,
            createdAt: item.createdAt,
            englishName: item.englishName,
            sinhalaName: item.sinhalaName,
            tamilName: item.tamilName,
            srvFee: item.srvFee
          };
        });

        setRequests(transformedRequests);
      } else {
        setRequests([]);
      }
    } catch (error: any) {
      console.error("Error fetching requests:", error);
      
      // Show appropriate error message
      if (error.response?.status === 404) {
        setRequests([]); // No requests found is not an error, just empty state
      } else if (error.response?.status === 401) {
        Alert.alert(
          t("Authentication Error"), 
          t("Please login again"),
          [{ text: t("OK") }]
        );
      } else {
        Alert.alert(
          t("Error"), 
          t("Failed to fetch requests. Please try again."),
          [{ text: t("OK") }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchRequests();
  }, [i18n.language]); // Refetch when language changes

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "Finished":
        return "text-[#0021F5]";
      case "Request Reviewed":
        return "text-[#00C1AB]";
      case "Request Placed":
        return "text-[#C49400]";
      default:
        return "text-gray-800";
    }
  };

  const handleRequestPress = (request: ServiceRequest) => {
    navigation.navigate("RequestSummery", { request });
  };

  const EmptyState = () => (
    <View className="flex-1 items-center justify-center -mt-[70%]">
      <LottieView
        source={require("../../assets/jsons/NoComplaints.json")}
        style={{ width: wp(50), height: hp(50) }}
        autoPlay
        loop
      />
      <Text className="text-center text-gray-600 -mt-[30%]">
        {t("RequestHistory.noData")}
      </Text>
    </View>
  );

  const RequestCard = ({ request }: { request: ServiceRequest }) => (
    <TouchableOpacity
      onPress={() => handleRequestPress(request)}
      activeOpacity={0.7}
    >
      <View className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-3 mx-4">
        <View className="flex-row justify-between items-start mb-3">
          <Text className="font-semibold text-gray-800 flex-1 mr-2">
            {request.serviceName}
          </Text>
        
        </View>

        <View className="space-y-2">
          <View className="flex-row justify-between  items-center">
            <Text className="text-gray-600 text-sm">
              {t("RequestHistory.Scheduled")} {request.scheduledDate}
            </Text>
                <AntDesign name="right" size={18} color="#9CA3AF" />
          </View>
          <View className="flex-row items-center">
            <Text
              className={`font-medium ${getStatusTextColor(request.status)}`}
            >
              {request.status}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <LottieView
          source={require('../../assets/jsons/loader.json')}
          autoPlay
          loop
          style={{ width: 300, height: 300 }}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      enabled
      style={{ flex: 1 }}
      className="bg-white"
    >
      <View className="flex-1">
        {/* Header */}
        <View
          className="flex-row items-center justify-between mb-2"
          style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <AntDesign name="left" size={24} color="#000502" />
          </TouchableOpacity>
          <View
            className="absolute top-0 left-0 right-0 items-center"
            style={{ paddingVertical: hp(2) }}
          >
            <Text className="text-black text-xl font-bold">
              {t("RequestHistory.Request History")}
            </Text>
          </View>
        </View>

        {/* Content */}
        {requests.length === 0 ? (
          <EmptyState />
        ) : (
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
            className="flex-1 pt-4"
          >
            {requests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
            
            <View className="pb-6" />
          </ScrollView>
        )}
      </View>

      {/* Floating Action Button */}
      <View className="">
        <TouchableOpacity 
          className="absolute bottom-12 right-6 bg-gray-800 w-16 h-16 rounded-full items-center justify-center shadow-lg"
          onPress={() => navigation.navigate("RequestInspectionForm")}
          accessibilityLabel="Add new request"
          accessibilityRole="button"
        >
          <Image 
            className="w-[20px] h-[20px]"
            source={require('../../assets/images/Farm/plusfarm.png')}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default RequestHistory;