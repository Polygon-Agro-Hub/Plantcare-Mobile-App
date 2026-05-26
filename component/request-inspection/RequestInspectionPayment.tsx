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
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/types";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import Checkbox from "expo-checkbox";
import { RouteProp } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import axios from "axios";
import CustomHeader from "../common/CustomHeader";

type RequestInspectionPaymentNavigationProp = StackNavigationProp<
  RootStackParamList,
  "RequestInspectionPayment"
>;

type RequestInspectionPaymentRouteProp = RouteProp<
  RootStackParamList,
  "RequestInspectionPayment"
>;

interface RequestInspectionPaymentProps {
  navigation: RequestInspectionPaymentNavigationProp;
  route: RequestInspectionPaymentRouteProp;
}

const RequestInspectionPayment: React.FC<RequestInspectionPaymentProps> = ({
  navigation,
  route,
}) => {
  const { requestItems, totalAmount } = route.params;

  const { t } = useTranslation();

  const [cardType, setCardType] = useState("visa");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardExpiryDate, setCardExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        handleModalClose();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessModal]);

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
          year = currentYear.toString().padStart(2, "0");
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

    const [month, year] = cardExpiryDate.split("/");
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

  const formatCardHolderName = (text: string) => {
    const cleanedText = text.replace(/[^a-zA-Z\s]/g, "");
    setCardHolderName(cleanedText);
  };

  const formatCvv = (text: string) => {
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
        paymentStatus: "completed",
      };

      const response = await axios.post(
        `${environment.API_BASE_URL}api/requestinspection/submit-request`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
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
        t("Main.Error"),
        t("RequestInspectionForm.PleaseFillAllPaymentDetails"),
        [{ text: t("Main.OK") }],
      );
      return;
    }

    if (!isCardExpiryValid()) {
      Alert.alert(
        t("Main.Error"),
        t(
          "RequestInspectionForm.PleaseEnterAValidCardExpiryDateMMYY",
        ),
        [{ text: t("Main.OK") }],
      );
      return;
    }

    setIsProcessing(true);

    try {
      Alert.alert(
        t("RequestInspectionForm.PleaseWait"),
        t("RequestInspectionForm.SubmittingYourRequest..."),
        [{ text: t("Main.OK") }],
      );

      setTimeout(async () => {
        try {
          const mockTransactionId = "TXN_" + Date.now();

          const response = await saveInspectionRequest(mockTransactionId);

          setIsProcessing(false);

          if (response.status === "success") {
            setShowSuccessModal(true);

            Alert.alert(
              t("Main.Success"),
              t(
                "RequestInspectionForm.YourInspectionRequestHasBeenSubmittedSuccessfully",
              ),
              [
                {
                  text: t("Main.OK"),
                  onPress: () => {
                    setShowSuccessModal(true);
                  },
                },
              ],
            );
          } else {
            Alert.alert(
              t("Main.Error"),
              t(
                "RequestInspectionForm.RequestInspection Submitting error, Please try again later",
              ),
              [{ text: t("Main.OK") }],
            );
          }
        } catch (error: any) {
          setIsProcessing(false);
          Alert.alert(
            t("Main.Error"),
            error.message ||
            t(
              "RequestInspectionForm.RequestInspection Submitting error, Please try again later",
            ),
            [{ text: t("Main.OK") }],
          );
        }
      }, 2000);
    } catch (error) {
      setIsProcessing(false);
      Alert.alert(
        t("Main.Error"),
        t("RequestInspectionForm.Payment processing failed. Please try again."),
        [{ text: t("Main.OK") }],
      );
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);

    navigation.navigate("RequestHistory");
  };

  const handleCheckboxChange = (type: string) => {
    setCardType(type);
  };

  const formattedAmount = totalAmount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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
        <CustomHeader
          title={t("Farms.CreditDebitCard")}
          showBackButton={true}
          navigation={navigation as any}
          onBackPress={() => navigation.goBack()}
        />

        <View
          className="flex-row mb-6 justify-between items-center"
          style={{ paddingHorizontal: wp(8) }}
        >
          <Text className="text-lg">{t("Farms.Total")}</Text>
          <Text className="text-lg font-bold">Rs.{formattedAmount}</Text>
        </View>

        <View className="border-b border-[#F3F4F6] my-2 mb-4" />

        <View style={{ paddingHorizontal: wp(4) }}>
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
                  source={require("../../assets/images/certificates/visaCard-logo.webp")}
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
                    borderColor:
                      cardType === "mastercard" ? "#4630EB" : "#3E206D",
                    padding: 4,
                  }}
                />
                <Image
                  source={require("../../assets/images/certificates/mastercard-payment-logo.webp")}
                  className="w-16 h-8 object-contain ml-2"
                />
              </View>
            </View>
          </View>

          {/* Card Number Input */}
          <TextInput
            className="h-[50px] border border-gray-300 bg-[#F6F6F6] rounded-3xl p-3 mb-8 text-base"
            placeholder="Enter Card Number"
            style={{ color: '#000000' }} 
            placeholderTextColor="#000000"
            keyboardType="numeric"
            maxLength={19}
            value={cardNumber}
            onChangeText={formatCardNumber}
          />

          {/* Card Holder Name Input */}
          <TextInput
            className="h-[50px] border border-gray-300 bg-[#F6F6F6] rounded-3xl p-3 mb-8 text-base"
            placeholder="Enter Name on Card"
            style={{ color: '#000000' }} 
            placeholderTextColor="#000000"
            value={cardHolderName}
            onChangeText={formatCardHolderName}
          />

          {/* Card Expiry Date Input */}
          <View className="flex-row items-center h-[50px] border border-gray-300 bg-[#F6F6F6] rounded-3xl px-3 mb-8">
            <TextInput
              className="flex-1 h-full text-base"
              placeholder="Enter Expiration Date (MM/YY)"
              style={{ color: '#000000' }} 
              placeholderTextColor="#000000"
              keyboardType="numeric"
              maxLength={5}
              value={cardExpiryDate}
              onChangeText={formatCardExpiryDate}
            />
            <FontAwesome name="calendar" size={20} color="black" />
          </View>

          {/* CVV Input */}
          <TextInput
            className="h-[50px] border border-gray-300 bg-[#F6F6F6] rounded-3xl p-3 mb-5 text-base"
            placeholder="Enter CVV"
            style={{ color: '#000000' }} 
            placeholderTextColor="#000000"
            keyboardType="numeric"
            maxLength={3}
            value={cvv}
            onChangeText={formatCvv}
            secureTextEntry
          />

          {/* Pay Now Button */}
          <TouchableOpacity
            className="bg-black h-[50px] justify-center rounded-full mt-5 mb-24"
            onPress={handlePayNow}
            disabled={isProcessing}
            style={{
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Text className="text-white text-lg font-semibold text-center">
              {isProcessing ? t("Farms.Processing...") : t("Farms.PayNow")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RequestInspectionPayment;
