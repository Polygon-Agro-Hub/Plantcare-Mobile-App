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
import { FontAwesome } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/types";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import Checkbox from "expo-checkbox";
import { RouteProp } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import axios from "axios";
import CustomHeader from "@/component/common/CustomHeader";

type CropPaymentScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "CropPaymentScreen"
>;

type CropPaymentScreenProps = {
  navigation: CropPaymentScreenNavigationProp;
  route: RouteProp<RootStackParamList, "CropPaymentScreen">;
};

const CropPaymentScreen: React.FC<CropPaymentScreenProps> = ({
  navigation,
  route,
}) => {
  const {
    certificateName,
    certificatePrice,
    certificateValidity,
    certificateId,
    cropId,
    farmId,
  } = route.params;

  const { t } = useTranslation();

  const [cardType, setCardType] = useState("visa");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardExpiryDate, setCardExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [farmName, setFarmName] = useState("");

  const formatAmount = (amount: string | number): string => {
    let numericValue: number;

    if (typeof amount === "string") {
      const cleanAmount = amount.replace(/[^\d.]/g, "");
      numericValue = parseFloat(cleanAmount) || 0;
    } else {
      numericValue = amount;
    }

    const formattedAmount = numericValue.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return `Rs.${formattedAmount}`;
  };

  const formattedCertificatePrice = formatAmount(certificatePrice);

  const handleCardHolderNameChange = (text: string) => {
    const cleanedText = text.replace(/[^a-zA-Z\s]/g, "");
    setCardHolderName(cleanedText);
  };

  const handleCvvChange = (text: string) => {
    const cleanedText = text.replace(/[^\d]/g, "");
    setCvv(cleanedText);
  };

  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        handleModalClose();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessModal]);

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
          },
        );

        if (response.data && response.data.length > 0) {
          setFarmName(response.data[0].farmName);
        }
      } catch (error) {
        console.error("Error fetching farm name:", error);
      }
    };

    fetchFarmName();
  }, [farmId]);

  const extractValidityMonths = (validity: string | number): number => {
    if (typeof validity === "number") {
      return validity;
    }

    const match = validity.match(/(\d+)/);
    return match ? parseInt(match[1]) : 18;
  };

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

  const saveCertificatePayment = async (numericPrice: string) => {
    try {
      if (!certificateId) {
        Alert.alert(
          t("Main.Error"),
          t("EarnCertificate.CertificateIDIsMissing"),
          [{ text: t("Main.OK") }],
        );
        return false;
      }

      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert(
          t("Main.Error"),
          t("Farms.NoAuthenticationTokenFound"),
          [{ text: t("Main.OK") }],
        );
        return false;
      }

      const validityMonths = extractValidityMonths(certificateValidity);

      const paymentData = {
        certificateId: certificateId,
        amount: numericPrice,
        validityMonths: validityMonths,
      };

      const response = await axios.post(
        `${environment.API_BASE_URL}api/certificate/certificate-crop-payment/${cropId}`,
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data && response.data.data) {
        return true;
      }

      return false;
    } catch (error: any) {
      console.error("Error saving certificate payment:", error);

      if (error.response) {
        console.error("Error response:", error.response.data);
        Alert.alert(
          t("Main.Error"),
          error.response.data.message || t("Main.SomethingWentWrongPleaseTryAgainlater"),
          [{ text: t("Main.OK") }],
        );
      } else {
        Alert.alert(t("Main.Error"), t("Main.SomethingWentWrongPleaseTryAgainlater"), [
          { text: t("Main.OK") },
        ]);
      }

      return false;
    }
  };

  const handlePayNow = async () => {
    if (!cardNumber || !cardHolderName || !cardExpiryDate || !cvv) {
      Alert.alert(
        t("Main.Error"),
        t("EarnCertificate.PleaseFillAllPaymentDetails"),
        [{ text: t("Main.OK") }],
      );
      return;
    }

    if (!isCardExpiryValid()) {
      Alert.alert(
        t("Main.Error"),
        t("EarnCertificate.PleaseEnterAValidCardExpiryDate"),
        [{ text: t("Main.OK") }],
      );
      return;
    }

    setIsProcessing(true);

    const numericPrice = certificatePrice?.replace(/[^\d.]/g, "") || "0";

    setTimeout(async () => {
      const paymentSaved = await saveCertificatePayment(numericPrice);

      setIsProcessing(false);

      if (paymentSaved) {
        setShowSuccessModal(true);
      }
    }, 2000);

    const paymentData = {
      cardType,
      cardNumber: cardNumber.replace(/\s/g, ""),
      cardHolderName,
      cardExpiryDate,
      cvv: "***",
      certificateName,
      certificatePrice: formattedCertificatePrice,
      certificateValidity,
      certificateId,
    };
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);

    navigation.navigate("Main", {
      screen: "FarmDetailsScreen",
      params: {
        farmId: farmId,
        farmName: farmName,
      },
    });
  };

  const handleCheckboxChange = (type: string) => {
    setCardType(type);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      enabled
      style={{ flex: 1 }}
    >
      <CustomHeader
        title={t("Farms.CreditDebitCard")}
        navigation={navigation}
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        className="bg-white px-6"
      >
        <View className="flex-row mb-6 justify-between items-center">
          <Text className="text-lg">{t("Farms.Total")}</Text>
          <Text className="text-lg font-bold">{formattedCertificatePrice}</Text>
        </View>

        <View className="border-b border-[#F3F4F6] my-2 mb-4" />

        <View className="">
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
                  source={require("../../../assets/images/certificates/visaCard-logo.webp")}
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
                  source={require("../../../assets/images/certificates/mastercard-payment-logo.webp")}
                  className="w-16 h-8 object-contain ml-2"
                />
              </View>
            </View>
          </View>

          <TextInput
            className="h-12 border border-gray-300 bg-[#F6F6F6] rounded-3xl h-[50px] p-3 mb-8 text-base"
            placeholder={t("Payment.EnterCardNumber") ?? "Enter Card Number"}
            style={{ color: '#000000' }} 
            placeholderTextColor="#000000"
            keyboardType="numeric"
            maxLength={19}
            value={cardNumber}
            onChangeText={formatCardNumber}
          />

          <TextInput
            className="h-12 border border-gray-300 bg-[#F6F6F6] rounded-3xl h-[50px] p-3 mb-8 text-base"
            placeholder={t("Payment.EnterNameOnCard")}
            style={{ color: '#000000' }} 
            placeholderTextColor="#000000"
            value={cardHolderName}
            onChangeText={handleCardHolderNameChange}
          />

          <View className="flex-row items-center rounded-3xl h-[50px] border border-gray-300 bg-[#F6F6F6] rounded-full px-3 mb-8">
            <TextInput
              className="flex-1 h-full text-base"
              placeholder={t("Payment.EnterExpirationDate")}
              style={{ color: '#000000' }} 
              placeholderTextColor="#000000"
              keyboardType="numeric"
              maxLength={5}
              value={cardExpiryDate}
              onChangeText={formatCardExpiryDate}
            />
            <FontAwesome name="calendar" size={20} color="black" />
          </View>

          <TextInput
            className="rounded-3xl h-[50px] border border-gray-300 bg-[#F6F6F6] rounded-full p-3 mb-5 text-base"
            placeholder={t("Payment.EnterCVV")}
            style={{ color: '#000000' }} 
            placeholderTextColor="#000000"
            keyboardType="numeric"
            maxLength={3}
            value={cvv}
            onChangeText={handleCvvChange}
            secureTextEntry
          />

          <TouchableOpacity
            className="bg-black py-3 rounded-3xl h-[50px] mt-5 mb-24"
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

      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleModalClose}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View
            className="bg-white rounded-3xl mx-6 p-8 items-center"
            style={{ width: wp(85) }}
          >
            <View className="relative mb-6">
              <View className="">
                <Image
                  source={require("../../../assets/images/certificates/successfully.webp")}
                  className="w-20 h-20 object-contain ml-2"
                />
              </View>
            </View>

            <Text className="text-2xl font-bold text-gray-800 mb-2">
              {t("Main.Success")}
            </Text>
            <Text className="text-center text-gray-600 mb-2">
              {t("Farms.YouHaveSuccessfullyAppliedForYourCertificate")}
            </Text>

            <TouchableOpacity
              className="bg-black py-3 px-12 rounded-full"
              onPress={handleModalClose}
            >
              <Text className="text-white text-base font-semibold">
                {t("Main.Continue")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default CropPaymentScreen;
