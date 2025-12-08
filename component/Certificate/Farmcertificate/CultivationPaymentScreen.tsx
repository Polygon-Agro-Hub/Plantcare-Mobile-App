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
import { RootStackParamList } from "../../types";
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

type CultivationPaymentScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "CultivationPaymentScreen"
>;

type CultivationPaymentScreenProps = {
  navigation: CultivationPaymentScreenNavigationProp;
  route: RouteProp<RootStackParamList, 'CultivationPaymentScreen'>;
};

const CultivationPaymentScreen: React.FC<CultivationPaymentScreenProps> = ({
  navigation,
  route,
}) => {
  const { 
    certificateName, 
    certificatePrice, 
    certificateValidity, 
    certificateId,
    farmId, // Optional farmId
    registrationCode
  } = route.params;
  
  const { t } = useTranslation();
  const [farmName, setFarmName] = useState("");
  const [cardType, setCardType] = useState("visa");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardExpiryDate, setCardExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [transactionId, setTransactionId] = useState("");

  console.log("farmid payamnet",farmId)
    // Fetch farm name
  useEffect(() => {
    const fetchFarmName = async () => {
      if (!farmId) return;
      
      try {
        const token = await AsyncStorage.getItem("userToken");
        
        if (!token) {
          console.error("No authentication token found");
          return;
        }

        const response = await axios.get(
          `${environment.API_BASE_URL}api/certificate/get-farmname/${farmId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Farm name response:", response.data);

        if (response.data && response.data.length > 0) {
          setFarmName(response.data[0].farmName);
        }
      } catch (error) {
        console.error("Error fetching farm name:", error);
      }
    };

    fetchFarmName();
  }, [farmId]);

  // Auto-navigate after modal shows for 2 seconds
  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        handleModalClose();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessModal]);

  // Extract validity in months from certificateValidity string or number
  const extractValidityMonths = (validity: string | number): number => {
    if (typeof validity === 'number') {
      return validity;
    }
    
    // Handle string case
    const match = validity.match(/(\d+)/);
    return match ? parseInt(match[1]) : 18; // Default to 18 if not found
  };

  // Format amount with comma-separated values and currency prefix
  const formatAmountWithCurrency = (amount: string | number): string => {
    // Extract numeric value
    const numericValue = typeof amount === 'string' 
      ? parseFloat(amount.replace(/[^\d.]/g, "")) 
      : Number(amount);
    
    // Format with comma separation and 2 decimal places
    const formattedAmount = numericValue.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    // Add currency prefix
    return `Rs.${formattedAmount}`;
  };

  // Block special characters in card holder name (only allow letters, spaces, and basic punctuation)
  const handleCardHolderNameChange = (text: string) => {
    // Only allow letters, spaces, apostrophes, hyphens, and periods
    const cleanedText = text.replace(/[^a-zA-Z\s]/g, "");
    setCardHolderName(cleanedText);
  };

  // Block special characters in CVV (only allow numbers)
  const handleCvvChange = (text: string) => {
    // Only allow numbers
    const cleanedText = text.replace(/[^\d]/g, "");
    setCvv(cleanedText);
  };

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

  const saveCertificatePayment = async (numericPrice: string) => {
    try {
      // Validate required fields
      if (!certificateId) {
        Alert.alert(t("Main.error"), "Certificate ID is missing", [
          { text: t("PublicForum.OK") }
        ]);
        return false;
      }

      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert(t("Farms.Error"), t("Farms.No authentication token found"), [
          { text: t("PublicForum.OK") }
        ]);
        return false;
      }

      const validityMonths = extractValidityMonths(certificateValidity);

      const paymentData = {
        certificateId: certificateId,
        amount: numericPrice,
        validityMonths: validityMonths,
      };

      console.log("Sending payment data:", paymentData);

      const response = await axios.post(
        `${environment.API_BASE_URL}api/certificate/certificate-payment/${farmId}`,
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Payment response:", response.data);

      if (response.data && response.data.data) {
        setTransactionId(response.data.data.transactionId);
        return true;
      }

      return false;
    } catch (error: any) {
      console.error("Error saving certificate payment:", error);
      
      if (error.response) {
        console.error("Error response:", error.response.data);
        Alert.alert(
          t("Main.error"),
          error.response.data.message || t("Main.somethingWentWrong"),
          [{ text: t("PublicForum.OK") }]
        );
      } else {
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"), [
          { text: t("PublicForum.OK") }
        ]);
      }
      
      return false;
    }
  };

  const handlePayNow = async () => {
    if (!cardNumber || !cardHolderName || !cardExpiryDate || !cvv) {
        Alert.alert(t("Main.error"),
              t("EarnCertificate.Please fill all payment details"),[{ text: t("PublicForum.OK") }] );
      return;
    }

    if (!isCardExpiryValid()) {
     Alert.alert(
          t("Main.error"), 
          t("EarnCertificate.Please enter a valid card expiry date (MM/YY)"),
          [{ text: t("PublicForum.OK") }]
        );
      return;
    }

    setIsProcessing(true);

    // Extract numeric price
    const numericPrice = certificatePrice?.replace(/[^\d.]/g, "") || "0";

    // Simulate payment gateway processing
    setTimeout(async () => {
      // Save payment to database
      const paymentSaved = await saveCertificatePayment(numericPrice);
      
      setIsProcessing(false);
      
      if (paymentSaved) {
        setShowSuccessModal(true);
      }
    }, 2000);

    // Log payment details for debugging
    const paymentData = {
      cardType,
      cardNumber: cardNumber.replace(/\s/g, ""),
      cardHolderName,
      cardExpiryDate,
      cvv: "***", // Don't log actual CVV
      certificateName,
      certificatePrice,
      certificateValidity,
      certificateId,
    };
    console.log("Certificate Payment Data:", paymentData);
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    // Navigate back to certificate list or farm list
      navigation.navigate("Main", { 
      screen: "FarmDetailsScreen",
      params: {
        farmId: farmId,
        farmName: farmName
      }
    });
  };

  const handleCheckboxChange = (type: string) => {
    setCardType(type);
  };

  // Format the certificate price for display
  const formattedCertificatePrice = formatAmountWithCurrency(certificatePrice);

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

        {/* Certificate Details */}
        {/* <View
          className="bg-gray-50 mx-4 p-4 rounded-lg mb-4"
          style={{ marginTop: hp(1) }}
        >
          <Text className="text-gray-600 text-sm mb-1">Certificate</Text>
          <Text className="text-black font-semibold text-base mb-2">
            {certificateName}
          </Text>
          <Text className="text-gray-600 text-sm">{certificateValidity}</Text>
        </View> */}

        {/* Total Amount */}
        <View
          className="flex-row mb-6 justify-between items-center"
          style={{ paddingHorizontal: wp(8) }}
        >
          <Text className="text-lg">{t("Farms.Total")}</Text>
          <Text className="text-lg font-bold">{formattedCertificatePrice}</Text>
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
                  source={require("../../../assets/images/Farm/visaCard-logo.png")}
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
                  source={require("../../../assets/images/Farm/mastercard-payment-logo.png")}
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
            onChangeText={handleCardHolderNameChange}
          />

          {/* Card Expiry Date Input */}
          <View className="flex-row items-center h-12 border border-gray-300 bg-[#F6F6F6] rounded-full px-3 mb-8">
            <TextInput
              className="flex-1 h-full text-base"
              placeholder="Card Expiry Date (MM/YY)"
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
            onChangeText={handleCvvChange}
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

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleModalClose}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-3xl mx-6 p-8 items-center" style={{ width: wp(85) }}>
            {/* Success Icon */}
            <View className="relative mb-6">
              <View className="">
                <Image
                  source={require("../../../assets/images/successfully.png")}
                  className="w-20 h-20 object-contain ml-2"
                />
              </View>
            </View>

            {/* Success Text */}
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              {t("Farms.Success")}
            </Text>
            <Text className="text-center text-gray-600 mb-2">
              {t("Farms.Payment Success Message")}
            </Text>
            
            {/* Transaction ID */}
            {/* {transactionId && (
              <View className="bg-gray-50 p-3 rounded-lg mb-4 w-full">
                <Text className="text-sm text-gray-600 text-center mb-1">
                  Transaction ID
                </Text>
                <Text className="text-base font-semibold text-gray-800 text-center">
                  {transactionId}
                </Text>
              </View>
            )} */}

            {/* Continue Button */}
            <TouchableOpacity
              className="bg-black py-3 px-12 rounded-full"
              onPress={handleModalClose}
            >
              <Text className="text-white text-base font-semibold">
                {t("Farms.Continue")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default CultivationPaymentScreen;