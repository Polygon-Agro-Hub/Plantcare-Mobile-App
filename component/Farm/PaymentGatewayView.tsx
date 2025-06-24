import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { RadioButton } from "react-native-paper"; // For Visa/MasterCard radio buttons
import { AntDesign, FontAwesome } from "@expo/vector-icons"; // For calendar icon
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { useSelector, useDispatch } from "react-redux";
import { resetPackage } from "../../store/packageSlice";
import type { RootState } from "../../services/reducxStore";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Checkbox from "expo-checkbox";
type PaymentGatewayViewNavigationProp = StackNavigationProp<
  RootStackParamList,
  "FirstTimePackagePlan"
>;

import { RouteProp } from "@react-navigation/native";

type PaymentGatewayViewProps = {
  navigation: PaymentGatewayViewNavigationProp;
  route: RouteProp<RootStackParamList, "FirstTimePackagePlan">;
};

const PaymentGatewayView: React.FC<PaymentGatewayViewProps> = ({
  navigation,
}) => {
  const dispatch = useDispatch();
  const [cardType, setCardType] = useState("visa");
  const packageType = useSelector(
    (state: RootState) => state.package.packageType
  );
  const packagePrice = useSelector(
    (state: RootState) => state.package.packagePrice
  );
  const [isChecked, setChecked] = useState(false);
  const [expirationDate, setExpirationDate] = useState("");
  const [error, setError] = useState<string>("");
    const [cardNumber, setCardNumber] = useState("");
  console.log(expirationDate)

const handleExpirationDateChange = (text: string) => {
    setError("");
    let formattedText = text.replace(/[^\d]/g, "");
    if (formattedText.length > 2) {
      const month = formattedText.slice(0, 2);
      if (parseInt(month) > 12) {
        setError("Invalid month. Please enter a month between 01 and 12.");
        formattedText = formattedText.slice(0, 2); 
      } else {
        formattedText = `${formattedText.slice(0, 2)}/${formattedText.slice(2, 4)}`;
      }
    }
    setExpirationDate(formattedText);
  };

 

  const formatCardNumber = (text: string) => {
    let cleanedText = text.replace(/[^\d]/g, "");
    let formattedText = cleanedText.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formattedText);
  };

  const handlePayNow = () => {
    dispatch(resetPackage());
  };

  const handleCheckboxChange = (type: string) => {
    setCardType(type); 
    setChecked(!isChecked); 
  };
  return (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          enabled
          className="flex-1"
        >
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }} className="bg-white">
      <View
        className="flex-row items-center justify-between mb-2"
        style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate("FirstTimePackagePlan" as any)}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <AntDesign name="left" size={24} color="#000502" />
        </TouchableOpacity>

        <View
          className="absolute top-0 left-0 right-0 items-center"
          style={{
            paddingVertical: hp(2),
          }}
        >
          <Text className="text-black text-xl font-bold">
            Credit / Debit Card
          </Text>
        </View>
      </View>

      <View
        className="flex-row mb-6 mt-6 justify-between items-center "
        style={{ paddingHorizontal: wp(8) }}
      >
        <Text className="text-lg ">Total</Text>
        <Text className="text-lg font-bold">
          Rs. {packagePrice?.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}
        </Text>
      </View>

      <View className="border-b border-[#F3F4F6] my-2 mb-4" />

      <View className="" style={{ paddingHorizontal: wp(8) }}>
        <View className="flex-row justify-center mb-6">
          <View>
            <View className="flex-row items-center p-2 gap-3 ">
              <View className="flex-row items-center rounded-xl  border border-[#3E206D] p-2 px-4">
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
                    borderColor:
                      cardType === "mastercard" ? "#4630EB" : "#3E206D",
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
        </View>

        <TextInput
            className="h-12 border border-gray-300 bg-[#F6F6F6] rounded-full p-3 mb-8 text-base"
            placeholder="Enter Card Number"
            keyboardType="numeric"
            maxLength={19} // Max 16 digits + 3 spaces
            value={cardNumber}
            onChangeText={formatCardNumber} // Format input as user types
          />

        <TextInput
          className="h-12 border border-gray-300 bg-[#F6F6F6] rounded-full p-3 mb-8 text-base"
          placeholder="Enter Name on Card"
        />

        <View className={`flex-row items-center h-12 border border-gray-300 bg-[#F6F6F6] rounded-full px-3 ${error ? 'mb-2' : 'mb-8'}`}>
           <TextInput
              className="flex-1 h-full text-base"
              placeholder="Expiration Date (MM/YY)"
              keyboardType="numeric"
              maxLength={5} 
              value={expirationDate}
              onChangeText={handleExpirationDateChange}
            />
          <FontAwesome
            name="calendar"
            size={20}
            color="black"
            className="absolute left-3"
          />
          
        </View>
        {error && (
            <Text className="text-red-500 text-sm mb-4">
              {error}
            </Text>
          )}
        <TextInput
          className="h-12 border border-gray-300 bg-[#F6F6F6] rounded-full p-3 mb-5 text-base"
          placeholder="Enter CVV"
          keyboardType="numeric"
          maxLength={3}
        />

        <TouchableOpacity
          className="bg-black py-3 rounded-full mt-5 mb-24"
          onPress={handlePayNow}
        >
          <Text className="text-white text-lg font-semibold text-center">
            Pay Now
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PaymentGatewayView;
