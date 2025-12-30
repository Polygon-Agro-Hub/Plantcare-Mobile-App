import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RouteProp } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

type RequestSummaryNavigationProp = StackNavigationProp<
  RootStackParamList,
  "RequestSummery"
>;

type RequestSummaryRouteProp = RouteProp<RootStackParamList, "RequestSummery">;

interface RequestSummaryProps {
  navigation: RequestSummaryNavigationProp;
  route: RequestSummaryRouteProp;
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
  srvFee?: number;
  doneDate: string;
}

const RequestSummary: React.FC<RequestSummaryProps> = ({
  navigation,
  route,
}) => {
  const { t, i18n } = useTranslation();
  
  // Safe extraction with multiple fallbacks
  const request = route.params?.request;
  
  // Debug: log everything to understand the data structure
  useEffect(() => {
    console.log('Route params:', route.params);
    console.log('Request object:', request);
    console.log('Service fee value:', request?.srvFee);
    console.log('Service fee type:', typeof request?.srvFee);
  }, [route.params, request]);

  // Safe service fee with multiple validation layers
  const getSafeServiceFee = (): number => {
    try {
      const fee = request?.srvFee;
      
      // Check if fee exists and is a valid number
      if (fee === null || fee === undefined) {
        console.log('Service fee is null or undefined, using default 0');
        return 0;
      }
      
      if (typeof fee === 'number' && !isNaN(fee)) {
        return fee;
      }
      
      // If it's a string, try to convert to number
      if (typeof fee === 'string') {
        const parsed = parseFloat(fee);
        if (!isNaN(parsed)) {
          return parsed;
        }
      }
      
      console.log('Service fee is not a valid number, using default 0');
      return 0;
    } catch (error) {
      console.error('Error getting service fee:', error);
      return 0;
    }
  };

  const serviceFee = getSafeServiceFee();

  // Safe number formatting
  // const formatCurrency = (amount: number): string => {
  //   try {
  //     if (typeof amount !== 'number' || isNaN(amount)) {
  //       return '0.00';
  //     }
  //     return amount.toFixed(2);
  //   } catch (error) {
  //     console.error('Error formatting currency:', error);
  //     return '0.00';
  //   }
  // };

  // Replace the existing formatCurrency function with this updated version

const formatCurrency = (amount: number): string => {
  try {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return '0.00';
    }
    
    // Format with 2 decimal places and add thousand separators
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  } catch (error) {
    console.error('Error formatting currency:', error);
    return '0.00';
  }
};

  // Safe date formatting
  const getSafeDate = (): string => {
    try {
      return request?.scheduledDate || 'the scheduled date';
    } catch (error) {
      return 'the scheduled date';
    }
  };

  // Format completion time from doneDate
  const getCompletionTime = (): string => {
    try {
      if (!request?.doneDate) {
        return '';
      }
      
      const date = new Date(request.doneDate);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.log('Invalid doneDate:', request.doneDate);
        return '';
      }
      
      // Format time as HH:MM AM/PM
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      
      hours = hours % 12;
      hours = hours ? hours : 12; // Convert 0 to 12
      
      const minutesStr = minutes < 10 ? '0' + minutes : minutes.toString();
      
      return `${hours}:${minutesStr} ${ampm}`;
    } catch (error) {
      console.error('Error formatting completion time:', error);
      return '';
    }
  };

  // Determine which steps to show based on status
  const getStepNumber = (): number => {
    if (!request) return 1;
    
    try {
      switch (request.status) {
        case "Request Placed":
          return 1;
        case "Request Reviewed":
          return 2;
        case "Finished":
          return 3;
        default:
          return 1;
      }
    } catch (error) {
      return 1;
    }
  };

  const currentStep = getStepNumber();

  const ProgressBar = () => (
    <View className="px-6 py-8">
      <View className="flex-row items-center justify-between relative">
        {/* Progress Line */}
        <View className="absolute top-6 left-12 right-12 h-0.5 bg-[#0FC7B2]">
          <View
            className="h-full bg-[#0FC7B2]"
            style={{
              width: currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%",
            }}
          />
        </View>

        {/* Step 1 - Request Placed */}
        <View className="items-center z-10">
          <View
            className={`w-12 h-12 rounded-full items-center justify-center ${
              currentStep >= 1 ? "bg-[#0FC7B2]" : "bg-white border-2 border-gray-300"
            }`}
          >
            <AntDesign
              name="folder-open"
              size={20}
              color={currentStep >= 1 ? "#FFFFFF" : "#9CA3AF"}
            />
          </View>
        </View>

        {/* Step 2 - Request Reviewed */}
        <View className="items-center z-10">
          <View
            className={`w-12 h-12 rounded-full items-center justify-center ${
              currentStep >= 2 ? "bg-[#0FC7B2]" : "bg-white border-2 border-[#0FC7B2]"
            }`}
          >
            <AntDesign
              name="check"
              size={20}
              color={currentStep >= 2 ? "#FFFFFF" : "#0FC7B2"}
            />
          </View>
        </View>

        {/* Step 3 - Finished */}
        <View className="items-center z-10">
          <View
            className={`w-12 h-12 rounded-full items-center justify-center ${
              currentStep >= 3 ? "bg-[#0FC7B2]" : "bg-white border-2 border-[#0FC7B2]"
            }`}
          >
            <FontAwesome5
              name="user"
              size={20}
              color={currentStep >= 3 ? "#FFFFFF" : "#0FC7B2"}
            />
          </View>
        </View>
      </View>
    </View>
  );

  const DetailCard = ({ number, description, subText }: { 
    number: string; 
    description: string; 
    subText?: string; 
  }) => (
    <View className="mx-6 mb-4">
      <View className="bg-[#E6FFFC] border border-[#0FC7B2] rounded-2xl p-4">
        <View className="items-center justify-center mt-[-11%] mb-2">
          <View className="w-7 h-7 rounded-full bg-[#0FC7B2] items-center justify-center">
            <Text className="text-white text-sm font-bold">{number}</Text>
          </View>
        </View>
        <View className="flex-row items-start mb-2">
          <View className="flex-1">
            <Text 
              className="text-[#3C3C3C] leading-6"
              style={[
                i18n.language === "si"
                  ? { fontSize: 13 }
                  : i18n.language === "ta"
                  ? { fontSize: 12 }
                  : { fontSize: 14 }
              ]}
            >
              {description}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderContent = () => {
    if (!request) {
      return (
        <View className="mx-6 mb-4">
          <Text className="text-red-500 text-center">
            {t("RequestSummary.noRequestData")}
          </Text>
        </View>
      );
    }

    const formattedFee = formatCurrency(serviceFee);
    const scheduledDate = getSafeDate();
    const completionTime = getCompletionTime();

    switch (currentStep) {
      case 1:
        return (
          <>
            <DetailCard
              number="1"
              description={t("RequestSummary.step1Description", { fee: formattedFee })}
            />
            <Text className="text-gray-600 text-sm text-center px-6 mt-4">
              {t("RequestSummary.ourTeamWillReview")}
            </Text>
          </>
        );

      case 2:
        return (
          <>
            <DetailCard
              number="1"
              description={t("RequestSummary.step1Description", { fee: formattedFee })}
            />
            <DetailCard
              number="2"
              description={t("RequestSummary.step2Description")}
            />
            <Text className="text-gray-600 text-sm text-center px-6 mt-4">
              {t("RequestSummary.fieldOfficerWillContact")}
            </Text>
          </>
        );

      case 3:
        return (
          <>
            <DetailCard
              number="1"
              description={t("RequestSummary.step1Description", { fee: formattedFee })}
            />
            <DetailCard
              number="2"
              description={t("RequestSummary.step2Description")}
            />
            <DetailCard
              number="3"
              description={t("RequestSummary.step3Description", { 
                date: scheduledDate,
                time: completionTime 
              })}
            />
          </>
        );

      default:
        return (
          <DetailCard
            number="1"
            description={t("RequestSummary.step1Description", { fee: formattedFee })}
          />
        );
    }
  };

  // If no request data, show comprehensive error message
  if (!request) {
    return (
      <View className="flex-1 bg-white justify-center items-center px-6">
        <AntDesign 
        //  name="exclamationcircle"
          size={64} 
          color="#EF4444" 
        />
        <Text className="text-lg text-red-500 font-bold text-center mb-2">
          {t("RequestSummary.noRequestDataFound")} 
        </Text>
        <Text className="text-gray-600 text-center mb-6">
          {t("RequestSummary.unableToLoadDetails")} 
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-[#00C1AB] px-8 py-4 rounded-lg"
        >
          <Text className="text-white font-bold text-lg">
            {t("RequestSummary.goBack")}
          </Text>
        </TouchableOpacity>
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
              {t("RequestSummary.requestSummary")}
            </Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {/* Progress Bar */}
          <ProgressBar />

          {/* Details Section */}
          <View className="mt-4">
            <Text className="text-lg font-bold text-gray-800 px-6 mb-4">
              {t("RequestSummary.details")}
            </Text>
            {renderContent()}
          </View>

          <View className="pb-6" />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default RequestSummary;