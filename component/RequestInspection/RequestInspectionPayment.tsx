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

// Define types for the data
interface CropItem {
  id: string;
  cropGroupId?: string;
  name: string;
}

interface RequestItem {
  serviceId: string | null;
  farmId: string | null;
  scheduleDate: string | null;
  amount: number;
  crops: CropItem[];
  isAllCrops: boolean;
  plotNo: string | null;
  streetName: string | null;
  city: string | null;
}

interface AddedItem {
  id: number;
  serviceId: string | null;
  service: string;
  price: string;
  farmId: string | null;
  farm: string;
  plotNo: string;
  streetName: string;
  city: string;
  requests: string[];
  crops: CropItem[];
  date: Date | null;
}

type RequestInspectionPaymentNavigationProp = StackNavigationProp<
  RootStackParamList,
  "RequestInspectionPayment"
>;

type RequestInspectionPaymentRouteProp = RouteProp<RootStackParamList, "RequestInspectionPayment">;

interface RequestInspectionPaymentProps {
  navigation: RequestInspectionPaymentNavigationProp;
  route: RequestInspectionPaymentRouteProp;
}

const RequestInspectionPayment: React.FC<RequestInspectionPaymentProps> = ({
  navigation,
  route,
}) => {
  const { requestItems, addedItems, totalAmount, itemsCount } = route.params;
  
  const { t } = useTranslation();

  const [cardType, setCardType] = useState("visa");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardExpiryDate, setCardExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [transactionId, setTransactionId] = useState("");

  // Auto-navigate after modal shows for 2 seconds
  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        handleModalClose();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessModal]);

  // Format card expiry date as MM/YY
  const formatCardExpiryDate = (text: string) => {
    let cleanedText = text.replace(/[^\d]/g, "");
    cleanedText = cleanedText.substring(0, 4);
    
    if (cleanedText.length >= 2) {
      let month = cleanedText.substring(0, 2);
      let year = cleanedText.substring(2, 4);
      
      let monthNum = parseInt(month);
      if (monthNum > 12) {
        month = "12";
      } else if (monthNum < 1 && month.length === 2) {
        month = "01";
      }
      
      if (year.length === 2) {
        let currentYear = new Date().getFullYear() % 100;
        let yearNum = parseInt(year);
        if (yearNum < currentYear) {
          year = currentYear.toString().padStart(2, '0');
        }
      }
      
      if (year.length > 0) {
        setCardExpiryDate(`${month}/${year}`);
      } else {
        setCardExpiryDate(month);
      }
    } else {
      setCardExpiryDate(cleanedText);
    }
  };

  const isCardExpiryValid = (): boolean => {
    if (!cardExpiryDate || cardExpiryDate.length !== 5) return false;
    
    const [month, year] = cardExpiryDate.split('/');
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    if (monthNum < 1 || monthNum > 12) return false;
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    if (yearNum < currentYear) return false;
    if (yearNum === currentYear && monthNum < currentMonth) return false;
    
    return true;
  };

  const formatCardNumber = (text: string) => {
    let cleanedText = text.replace(/[^\d]/g, "");
    let formattedText = cleanedText.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formattedText);
  };

  // Block special characters in Card Holder Name - only allow letters, spaces, and common name characters
  const formatCardHolderName = (text: string) => {
    // Only allow letters, spaces, apostrophes, hyphens, and periods
    const cleanedText = text.replace(/[^a-zA-Z\s]/g, "");
    setCardHolderName(cleanedText);
  };

  // Block special characters in CVV - only allow numbers
  const formatCvv = (text: string) => {
    // Only allow numbers
    const cleanedText = text.replace(/[^\d]/g, "");
    setCvv(cleanedText);
  };

  const saveInspectionRequest = async (paymentTransactionId: string) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      
      const requestData = {
        requestItems: requestItems,
        paymentTransactionId: paymentTransactionId,
        totalAmount: totalAmount,
        paymentMethod: cardType,
        paymentStatus: "completed"
      };

      const response = await axios.post(
        `${environment.API_BASE_URL}api/requestinspection/submit-request`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("Error saving inspection request:", error);
      
      let errorMessage = "Failed to save inspection request. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  };

  const handlePayNow = async () => {
    if (!cardNumber || !cardHolderName || !cardExpiryDate || !cvv) {
      Alert.alert(
        t("RequestInspectionForm.Error"), 
        t("RequestInspectionForm.Please fill all payment details"),
        [{ text: t("RequestInspectionForm.OK") }]
      );
      return;
    }

    if (!isCardExpiryValid()) {
      Alert.alert(
        t("RequestInspectionForm.Error"), 
        t("RequestInspectionForm.Please enter a valid card expiry date (MM/YY)"),
        [{ text: t("RequestInspectionForm.OK") }]
      );
      return;
    }

    setIsProcessing(true);

    try {
      // Show processing alert
      Alert.alert(
        t("RequestInspectionForm.Please wait"), 
        t("RequestInspectionForm.Submitting your request"),
        [{ text: t("RequestInspectionForm.OK") }]
      );

      // Simulate payment processing
      setTimeout(async () => {
        try {
          // Generate a mock transaction ID
          const mockTransactionId = "TXN_" + Date.now();
          
          // Save the inspection request with payment details
          const response = await saveInspectionRequest(mockTransactionId);
          
          setIsProcessing(false);
          
          if (response.status === "success") {
            setTransactionId(mockTransactionId);
            setShowSuccessModal(true);
            
            // Show success alert
            Alert.alert(
              t("RequestInspectionForm.Success"),
              t("RequestInspectionForm.Your inspection request has been submitted successfully"),
              [
                {
                  text: t("RequestInspectionForm.OK"),
                  onPress: () => {
                    setShowSuccessModal(true);
                  }
                }
              ]
            );
          } else {
            Alert.alert(
              t("RequestInspectionForm.Error"), 
              t("RequestInspectionForm.Request Inspection Submitting error, Please try again later"),
              [{ text: t("RequestInspectionForm.OK") }]
            );
          }
        } catch (error: any) {
          setIsProcessing(false);
          Alert.alert(
            t("RequestInspectionForm.Error"), 
            error.message || t("RequestInspectionForm.Request Inspection Submitting error, Please try again later"),
            [{ text: t("RequestInspectionForm.OK") }]
          );
        }
      }, 2000);

      // Log payment details for debugging
      const paymentData = {
        cardType,
        cardNumber: cardNumber.replace(/\s/g, "").substring(0, 8) + "****",
        cardHolderName,
        cardExpiryDate,
        totalAmount,
        itemsCount,
        requestItemsCount: requestItems.length
      };
      console.log("Inspection Payment Data:", paymentData);

    } catch (error) {
      setIsProcessing(false);
      Alert.alert(
        t("RequestInspectionForm.Error"), 
        t("RequestInspectionForm.Payment processing failed. Please try again."),
        [{ text: t("RequestInspectionForm.OK") }]
      );
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    // Navigate back to main screen
    navigation.navigate("RequestHistory");
  };

  const handleCheckboxChange = (type: string) => {
    setCardType(type);
  };

  // Format amount for display
  const formattedAmount = totalAmount.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      enabled
      style={{ flex: 1 }}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        className="bg-white"
      >
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
              {t("Farms.Credit Debit Card")}
            </Text>
          </View>
        </View>

        {/* Total Amount */}
        <View
          className="flex-row mb-6 justify-between items-center"
          style={{ paddingHorizontal: wp(8) }}
        >
          <Text className="text-lg">{t("Farms.Total")}</Text>
          <Text className="text-lg font-bold">Rs.{formattedAmount}</Text>
        </View>

        <View className="border-b border-[#F3F4F6] my-2 mb-4" />

        <View style={{ paddingHorizontal: wp(8) }}>
          {/* Card Type Selection */}
          <View className="flex-row justify-center mb-6">
            <View className="flex-row items-center p-2 gap-3">
              <View className="flex-row items-center rounded-xl border border-[#3E206D] p-2 px-4">
                <Checkbox
                  value={cardType === "visa"}
                  onValueChange={() => handleCheckboxChange("visa")}
                  color={cardType === "visa" ? "#4630EB" : undefined}
                  style={{
                    borderRadius: 25,
                    borderWidth: 2,
                    borderColor: cardType === "visa" ? "#4630EB" : "#3E206D",
                    padding: 5,
                  }}
                />
                <Image
                  source={require("../../assets/images/Farm/visaCard-logo.png")}
                  className="w-16 h-6 object-contain ml-2"
                />
              </View>
              <View className="flex-row items-center p-1 rounded-xl border border-[#3E206D] px-4">
                <Checkbox
                  value={cardType === "mastercard"}
                  onValueChange={() => handleCheckboxChange("mastercard")}
                  color={cardType === "mastercard" ? "#4630EB" : undefined}
                  style={{
                    borderRadius: 25,
                    borderWidth: 2,
                    borderColor: cardType === "mastercard" ? "#4630EB" : "#3E206D",
                    padding: 4,
                  }}
                />
                <Image
                  source={require("../../assets/images/Farm/mastercard-payment-logo.png")}
                  className="w-16 h-8 object-contain ml-2"
                />
              </View>
            </View>
          </View>

          {/* Card Number Input */}
          <TextInput
            className="h-12 border border-gray-300 bg-[#F6F6F6] rounded-full p-3 mb-8 text-base"
            placeholder="Enter Card Number"
            keyboardType="numeric"
            maxLength={19}
            value={cardNumber}
            onChangeText={formatCardNumber}
          />

          {/* Card Holder Name Input */}
          <TextInput
            className="h-12 border border-gray-300 bg-[#F6F6F6] rounded-full p-3 mb-8 text-base"
            placeholder="Enter Name on Card"
            value={cardHolderName}
            onChangeText={formatCardHolderName}
          />

          {/* Card Expiry Date Input */}
          <View className="flex-row items-center h-12 border border-gray-300 bg-[#F6F6F6] rounded-full px-3 mb-8">
            <TextInput
              className="flex-1 h-full text-base"
              placeholder="Enter Expiration Date (MM/YY)"
              keyboardType="numeric"
              maxLength={5}
              value={cardExpiryDate}
              onChangeText={formatCardExpiryDate}
            />
            <FontAwesome name="calendar" size={20} color="black" />
          </View>

          {/* CVV Input */}
          <TextInput
            className="h-12 border border-gray-300 bg-[#F6F6F6] rounded-full p-3 mb-5 text-base"
            placeholder="Enter CVV"
            keyboardType="numeric"
            maxLength={3}
            value={cvv}
            onChangeText={formatCvv}
            secureTextEntry
          />

          {/* Pay Now Button */}
          <TouchableOpacity
            className="bg-black py-3 rounded-full mt-5 mb-24"
            onPress={handlePayNow}
            disabled={isProcessing}
          >
            <Text className="text-white text-lg font-semibold text-center">
              {isProcessing ? t("Farms.Processing") : t("Farms.Pay Now")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      
    </KeyboardAvoidingView>
  );
};

export default RequestInspectionPayment;