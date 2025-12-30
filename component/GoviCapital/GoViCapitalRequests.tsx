import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import axios from "axios";
import { environment } from "@/environment/environment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LottieView from "lottie-react-native";
import { useTranslation } from "react-i18next";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

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
}

interface GoViCapitalRequestsProps {
  navigation: any;
}

const GoViCapitalRequests: React.FC<GoViCapitalRequestsProps> = ({ navigation }) => {
  const [investmentRequests, setInvestmentRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { t, i18n } = useTranslation();

  // Get status text and color based on status and current language
  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "under_review":
      case "pending":
        return { 
          text: t("Govicapital.Request Under Review"), 
          color: "#C49400" 
        };
      case "approved":
        return { 
          text: t("Govicapital.Request Approved"), 
          color: "#00C1AB" 
        };
      case "rejected":
        return { 
          text: t("Govicapital.Request Rejected"), 
          color: "#FF0000" 
        };
      default:
        return { 
          text: status || t("Govicapital.Unknown Status"), 
          color: "#9CA3AF" 
        };
    }
  };

  // Get crop name based on current language
  const getCropName = (request: RequestItem) => {
    const currentLanguage = i18n.language;
    
    switch (currentLanguage) {
      case 'si':
      case 'sinhala':
        return request.cropNameSinhala || request.cropNameEnglish || t("Govicapital.Unknown Crop");
      case 'ta':
      case 'tamil':
        return request.cropNameTamil || request.cropNameEnglish || t("Govicapital.Unknown Crop");
      case 'en':
      case 'english':
      default:
        return request.cropNameEnglish || t("Govicapital.Unknown Crop");
    }
  };

const handleRequestPress = (request: RequestItem) => {
    console.log("Request pressed:", request.id);
    // Navigate to RequestReview screen with request data
    navigation.navigate('RequestReview', { 
      request: request,
      status: request.reqStatus 
    });
  };


  const fetchInvestmentDetails = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken"); 
      
      if (!token) {
        Alert.alert('Error', 'Authentication token not found. Please login again.');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${environment.API_BASE_URL}api/goviCapital/get-investment-requests`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`, 
          }
        }
      );

      console.log("response data", response.data);

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setInvestmentRequests(response.data);
      } else {
        setInvestmentRequests([]);
      }
    } catch (error: any) {
      console.error('Error fetching investment requests:', error);
      if (error.response?.status === 404) {
        setInvestmentRequests([]);
      } else {
        Alert.alert('Error', 'Failed to load investment requests');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInvestmentDetails();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchInvestmentDetails();
  }, []);

  const handleAddRequest = () => {
    console.log("Add new request");
    navigation.navigate('InvestmentAndLoan');
  };

  const formatAmount = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `Rs. ${numAmount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatExtent = (ha: number, ac: number, p: number) => {
    const parts = [];
    if (ha > 0) parts.push(`${ha}ha`);
    if (ac > 0) parts.push(`${ac}a`);
    if (p > 0) parts.push(`${p}p`);
    return parts.length > 0 ? parts.join(' ') : '0';
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      
      {/* Header */}
      <View className="bg-white px-4 py-4">
        <View className="flex-row items-center ">
          <TouchableOpacity 
            onPress={() => navigation?.goBack()}
            className="mr-3 p-1"
            activeOpacity={0.7}
          >
            <MaterialIcons name="chevron-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900 ml-3">
           {t("Govicapital.Investment / Loan Requests")}    
          </Text>
        </View>
      </View>

      {/* Loading State */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#000" />
          <Text className="text-gray-500 mt-4">{t("Govicapital.Loading requests")}</Text>
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
          <View className="flex-1 items-center justify-center mt-[-40%]">
            <LottieView
              source={require("../../assets/jsons/NoComplaints.json")}
              style={{ width: 200, height: 200 }}
              autoPlay
              loop
            />
            <Text className="font-semibold text-gray-900">
              {t("Govicapital.No Requests Yet")}   
            </Text>
          </View>
        </ScrollView>
      ) : (
        /* Request Cards */
        <ScrollView 
          className="flex-1 px-4 pt-4 mb-20"
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
              >
                {/* Request ID and Job ID */}
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-[#4E6393]">
                    #{request.jobId}
                  </Text>
                </View>
                
                {/* Crop Name and Arrow */}
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="font-semibold text-gray-900">
                    {cropName}
                  </Text>
                  <MaterialIcons name="chevron-right" size={25} color="#9ca3af" />
                </View>
                
                {/* Amount */}
                <View className="flex-row items-center mb-2">
                  <FontAwesome5 name="coins" size={16} color="black" />
                  <Text className="font-bold text-gray-900 ml-2">
                    {formatAmount(request.investment)}
                  </Text>
                </View>
                
                {/* Status */}
                <Text className="text-sm font-medium" style={{ color: statusInfo.color }}>
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
        className="absolute bottom-20 right-6 bg-gray-800 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8
        }}
      >
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default GoViCapitalRequests;