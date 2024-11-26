import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import { useNavigation } from "@react-navigation/native";
import Checkbox from "expo-checkbox";

// Type for navigation prop
type MembershipScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "MembershipScreen"
>;

interface MembershipScreenProps {
  navigation: MembershipScreenNavigationProp;
}

const MembershipScreen: React.FC<MembershipScreenProps> = ({ navigation }) => {
  //   const navigation = useNavigation<MembershipScreenProps>();
  const [isChecked, setIsChecked] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        className="flex-1 p-6"
      >
        {/* Header */}
        <View className="items-center mb-6">
          {/* Top Icon */}
          <View className="bg-gray-200 rounded-[15px] p-4 mb-4">
            <Image
              source={require("../assets/images/Star.png")}
              style={{ width: 32, height: 32 }}
            />
          </View>
          <Text className="text-xl font-bold text-gray-900">
            Activate Membership!
          </Text>
          <Text className="text-gray-600 text-center mt-1">
            Activate your membership as an AgroWorld registered Farmer.
          </Text>
        </View>

        {/* Horizontal Lines and Benefits Button */}
        <View className="flex-row items-center mb-6">
          <View style={{ flex: 1, height: 1, backgroundColor: "#ccc" }} />
          <TouchableOpacity className="bg-yellow-500 rounded-[10px] py-2 px-6 mx-4">
            <Text className="text-white font-bold text-center">Benefits</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, height: 1, backgroundColor: "#ccc" }} />
        </View>

        {/* Benefits Section */}
        <View className="flex-row flex-wrap justify-between mb-6">
          <View className="w-1/2 p-2">
            <View className="bg-white border border-gray-300 rounded-lg p-4 items-center">
              <Image
                source={require("../assets/images/Sell.png")}
                style={{ width: 40, height: 40 }}
              />
              <Text className="font-bold text-gray-900 mt-2">
                Sell Your Harvest
              </Text>
              <Text className="text-gray-600 text-center text-sm">
                Easily sell your harvest directly to AgroWorld
              </Text>
            </View>
          </View>
          <View className="w-1/2 p-2">
            <View className="bg-white border border-gray-300 rounded-lg p-4 items-center">
              <Image
                source={require("../assets/images/Discount.png")}
                style={{ width: 40, height: 40 }}
              />
              <Text className="font-bold text-gray-900 mt-2">Fair Pricing</Text>
              <Text className="text-gray-600 text-center text-sm">
                Receive fair market prices for your crops
              </Text>
            </View>
          </View>
          <View className="w-1/2 p-2">
            <View className="bg-white border border-gray-300 rounded-lg p-4 items-center">
              <Image
                source={require("../assets/images/Qr-Code.png")}
                style={{ width: 40, height: 40 }}
              />
              <Text className="font-bold text-gray-900 mt-2">
                QR Code Access
              </Text>
              <Text className="text-gray-600 text-center text-sm">
                Unique QR code for entry at our centers
              </Text>
            </View>
          </View>
          <View className="w-1/2 p-2">
            <View className="bg-white border border-gray-300 rounded-lg p-4 items-center">
              <Image
                source={require("../assets/images/Helping-Hand.png")}
                style={{ width: 40, height: 40 }}
              />
              <Text className="font-bold text-gray-900 mt-2">
                Customer Support
              </Text>
              <Text className="text-gray-600 text-center text-sm">
                {" "}
                assistance whenever you need it{" "}
              </Text>
            </View>
          </View>
        </View>

        {/* Terms Section */}
        <Text className="text-gray-600 text-center text-sm mb-6">
          To obtain access to your unique QR code, please register as a member
          by entering your bank details. This code will ensure smooth
          transactions and secure payments directly to your bank at our
          collection centers.{" "}
        </Text>
        <Text className="text-center text-sm">
            See{" "}
            <TouchableOpacity onPress={()=>navigation.navigate('ComplainForm')}>
              <Text className="text-blue-500">Terms & Conditions</Text>
            </TouchableOpacity>{" "}
            and{" "}
            <TouchableOpacity onPress={()=>navigation.navigate('PrivacyPolicy')}>
              <Text className="text-blue-500">Privacy Policy</Text>
            </TouchableOpacity>
          </Text>

        {/* Checkbox Section */}
        <View className="flex-row items-center justify-center mt-4">
          <Checkbox
            value={isChecked}
            onValueChange={setIsChecked}
            color={isChecked ? "#4CAF50" : undefined}
          />
          <Text className="text-gray-700 ml-2">
          I agree to the Terms & Conditions
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          className={`rounded-full py-3 mt-6 mb-3 ${
            isChecked ? "bg-[#353535]" : "bg-gray-400"
          }`}
          disabled={!isChecked}
          onPress={() => navigation.navigate("BankDetailsScreen" as any)}
        >
          <Text className="text-white font-bold text-center">Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MembershipScreen;
