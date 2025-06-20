import React from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { RadioButton } from "react-native-paper"; // For Visa/MasterCard radio buttons
import { FontAwesome } from "@expo/vector-icons"; // For calendar icon
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
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
  route,
}) => {
  const [cardType, setCardType] = React.useState("visa");
 const { packageType } = route.params;

 console.log("Package Type:", packageType);

  return (
    <ScrollView contentContainerStyle={{ backgroundColor: "white", padding: 20 }}>
      <View className="items-center mb-6">
        <Text className="text-2xl font-bold">Credit / Debit Card</Text>
        <Text className="text-lg mt-2">Total Rs.500.00</Text>
      </View>

      <View className="flex-row justify-center mb-6">
        <RadioButton.Group
          onValueChange={value => setCardType(value)}
          value={cardType}
        >
          <View className="flex-row items-center">
            <RadioButton value="visa" />
            <Text className="text-lg mr-4">VISA</Text>
            <RadioButton value="mastercard" />
            <Text className="text-lg">MasterCard</Text>
          </View>
        </RadioButton.Group>
      </View>

      <TextInput
        className="h-12 border border-gray-300 rounded-lg p-3 mb-5 text-lg"
        placeholder="Enter Card Number"
        keyboardType="numeric"
      />

      <TextInput
        className="h-12 border border-gray-300 rounded-lg p-3 mb-5 text-lg"
        placeholder="Enter Name on Card"
      />

      <View className="flex-row justify-between items-center mb-5">
        <TextInput
          className="h-12 border border-gray-300 rounded-lg p-3 text-lg w-4/5"
          placeholder="Select Expiration Date (MM/YY)"
        />
        <FontAwesome name="calendar" size={20} color="gray" />
      </View>

      <TextInput
        className="h-12 border border-gray-300 rounded-lg p-3 mb-5 text-lg"
        placeholder="Enter CVV"
        keyboardType="numeric"
        maxLength={3}
      />

      <TouchableOpacity className="bg-black py-4 rounded-full mt-5">
        <Text className="text-white text-lg font-semibold text-center">Pay Now</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default PaymentGatewayView;
