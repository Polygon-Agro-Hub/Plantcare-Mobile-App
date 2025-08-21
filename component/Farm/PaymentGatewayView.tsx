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
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { useSelector, useDispatch } from "react-redux";
import {
  resetPackage,
  processPayment,
  selectPackageType,
  selectPackagePrice,
  selectIsProcessing,
  selectPaymentError,
  selectPaymentSuccess,
  selectExpireDate,
} from "../../store/packageSlice";
import type { RootState } from "../../services/reducxStore";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Checkbox from "expo-checkbox";
import { RouteProp } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

type PaymentGatewayViewNavigationProp = StackNavigationProp<
  RootStackParamList,
  "FirstTimePackagePlan"
>;

type PaymentGatewayViewProps = {
  navigation: PaymentGatewayViewNavigationProp;
  route: RouteProp<RootStackParamList, "FirstTimePackagePlan">;
};

const PaymentGatewayView: React.FC<PaymentGatewayViewProps> = ({
  navigation,
}) => {
  // Type the dispatch properly for async thunks
  const dispatch = useDispatch<any>();
  const [cardType, setCardType] = useState("visa");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardExpiryDate, setCardExpiryDate] = useState(""); // New state for card expiry
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState<string>("");

  const packageType = useSelector(selectPackageType);
  const packagePrice = useSelector(selectPackagePrice);
  const isProcessing = useSelector(selectIsProcessing);
  const paymentError = useSelector(selectPaymentError);
  const paymentSuccess = useSelector(selectPaymentSuccess);
  const expireDate = useSelector(selectExpireDate);
  const {t} = useTranslation();
  const getPackageExpirationDate = (): string => {
    if (expireDate) {
      return new Date(expireDate).toLocaleDateString('en-GB'); // DD/MM/YYYY
    }
    const currentDate = new Date();
    let monthsToAdd = 1;

    if (packageType) {
      const packageString = packageType.toLowerCase();
      const monthMatch = packageString.match(/(\d+)\s*month/);
      if (monthMatch) {
        monthsToAdd = parseInt(monthMatch[1]);
      } else if (
        packageString.includes('yearly') ||
        packageString.includes('annual') ||
        packageString.includes('12')
      ) {
        monthsToAdd = 12;
      } else if (
        packageString.includes('quarterly') ||
        packageString.includes('3')
      ) {
        monthsToAdd = 3;
      } else if (packageString.includes('6')) {
        monthsToAdd = 6;
      }
    }

    currentDate.setMonth(currentDate.getMonth() + monthsToAdd);
    return currentDate.toLocaleDateString('en-GB'); // DD/MM/YYYY
  };

  // Format card expiry date as MM/YY
  const formatCardExpiryDate = (text: string) => {
    // Remove all non-numeric characters
    let cleanedText = text.replace(/[^\d]/g, "");
    
    // Limit to 4 digits (MMYY)
    cleanedText = cleanedText.substring(0, 4);
    
    if (cleanedText.length >= 2) {
      let month = cleanedText.substring(0, 2);
      let year = cleanedText.substring(2, 4);
      
      // Validate month (01-12)
      let monthNum = parseInt(month);
      if (monthNum > 12) {
        month = "12";
      } else if (monthNum < 1 && month.length === 2) {
        month = "01";
      }
      
      // Validate year (minimum current year)
      if (year.length === 2) {
        let currentYear = new Date().getFullYear() % 100; // Get last 2 digits of current year (25 for 2025)
        let yearNum = parseInt(year);
        if (yearNum < currentYear) {
          year = currentYear.toString().padStart(2, '0');
        }
      }
      
      // Format as MM/YY
      if (year.length > 0) {
        setCardExpiryDate(`${month}/${year}`);
      } else {
        setCardExpiryDate(month);
      }
    } else {
      setCardExpiryDate(cleanedText);
    }
  };

  // Validate card expiry date
  const isCardExpiryValid = (): boolean => {
    if (!cardExpiryDate || cardExpiryDate.length !== 5) return false;
    
    const [month, year] = cardExpiryDate.split('/');
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    if (monthNum < 1 || monthNum > 12) return false;
    
    // Check if the expiry date is not in the past
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    if (yearNum < currentYear) return false;
    if (yearNum === currentYear && monthNum < currentMonth) return false;
    
    return true;
  };

  useEffect(() => {
    if (paymentError) {
      Alert.alert("Payment Failed", paymentError);
      dispatch(resetPackage());
    }
    if (paymentSuccess && expireDate) {
      Alert.alert(
        "Payment Successful!",
        `Your ${packageType} subscription has been activated.\nExpires on: ${new Date(
          expireDate
        ).toLocaleDateString('en-GB')}`,
        [
          {
            text: "OK",
            onPress: () => {
              setCardNumber("");
              setCardHolderName("");
              setCardExpiryDate("");
              setCvv("");
              setCardType("visa");
              navigation.navigate("AddFarmList"); // Navigate to farm list after payment
            },
          },
        ]
      );
    }
  }, [paymentError, paymentSuccess, expireDate, dispatch, navigation, packageType]);

  const formatCardNumber = (text: string) => {
    let cleanedText = text.replace(/[^\d]/g, "");
    let formattedText = cleanedText.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formattedText);
  };

  const handlePayNow = async () => {
    if (!cardNumber || !cardHolderName || !cardExpiryDate || !cvv) {
      Alert.alert("Error", "Please fill all payment details");
      return;
    }

    if (!isCardExpiryValid()) {
      Alert.alert("Error", "Please enter a valid card expiry date (MM/YY)");
      return;
    }

    if (!packageType || !packagePrice) {
      Alert.alert("Error", "Package information is missing");
      return;
    }

    const paymentData = {
      cardType,
      cardNumber: cardNumber.replace(/\s/g, ""),
      cardHolderName,
      expirationDate: getPackageExpirationDate(), // Package expiration date (as required by the interface)
      cardExpiryDate, // Card expiry date (additional field for card validation)
      cvv,
      packageType,
      packagePrice,
    };

    try {
      await dispatch(processPayment(paymentData)).unwrap();
    } catch (error) {
      // Error handling is done in the useEffect hook
      console.error('Payment failed:', error);
    }
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
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        className="bg-white"
      >
        <View
          className="flex-row items-center justify-between mb-2"
          style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate("UnloackPro" as any)}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <AntDesign name="left" size={24} color="#000502" />
          </TouchableOpacity>
          <View
            className="absolute top-0 left-0 right-0 items-center"
            style={{ paddingVertical: hp(2) }}
          >
            <Text className="text-black text-xl font-bold">
              Credit / Debit Card
            </Text>
          </View>
        </View>

        <View
          className="flex-row mb-6 mt-6 justify-between items-center"
          style={{ paddingHorizontal: wp(8) }}
        >
          <Text className="text-lg">Total</Text>
          <Text className="text-lg font-bold">
            Rs. {packagePrice?.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}
          </Text>
        </View>

        <View className="border-b border-[#F3F4F6] my-2 mb-4" />

        <View style={{ paddingHorizontal: wp(8) }}>
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

          <TextInput
            className="h-12 border border-gray-300 bg-[#F6F6F6] rounded-full p-3 mb-8 text-base"
            placeholder="Enter Card Number"
            keyboardType="numeric"
            maxLength={19}
            value={cardNumber}
            onChangeText={formatCardNumber}
          />

          <TextInput
            className="h-12 border border-gray-300 bg-[#F6F6F6] rounded-full p-3 mb-8 text-base"
            placeholder="Enter Name on Card"
            value={cardHolderName}
            onChangeText={setCardHolderName}
          />

          {/* <View className={`flex-row items-center h-12 border border-gray-300 bg-[#F6F6F6] rounded-full px-3 mb-8`}>
            <TextInput
              className="flex-1 h-full text-base"
              placeholder="Package Valid Until (DD/MM/YYYY)"
              value={getPackageExpirationDate()}
              editable={false}
            />
            <FontAwesome name="calendar" size={20} color="black" />
          </View> */}

          <View className={`flex-row items-center h-12 border border-gray-300 bg-[#F6F6F6] rounded-full px-3 mb-8`}>
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

          <TextInput
            className="h-12 border border-gray-300 bg-[#F6F6F6] rounded-full p-3 mb-5 text-base"
            placeholder="Enter CVV"
            keyboardType="numeric"
            maxLength={3}
            value={cvv}
            onChangeText={setCvv}
            secureTextEntry
          />

          <TouchableOpacity
            className="bg-black py-3 rounded-full mt-5 mb-24"
            onPress={handlePayNow}
            disabled={isProcessing}
          >
            <Text className="text-white text-lg font-semibold text-center">
              {isProcessing ? "Processing..." : "Pay Now"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PaymentGatewayView;