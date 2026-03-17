import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/types";
import CalculatorHeader from "../common/CalculatorHeader";
import ResultModal from "../common/ResultModal";
import { Keyboard } from "react-native";

type SprinklerSystemNavigationProp = StackNavigationProp<
  RootStackParamList,
  "SprinklerSystemCalculator"
>;

interface SprinklerSystemProps {
  navigation: SprinklerSystemNavigationProp;
}

const SprinklerSystemCalculatorScreen: React.FC<SprinklerSystemProps> = ({
  navigation,
}) => {
  const [discharge, setDischarge] = useState("");
  const [spacing, setSpacing] = useState("");
  const [irrigationTime, setIrrigationTime] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [result, setResult] = useState({ value: "", unit: "L" });
  const [showValidation, setShowValidation] = useState(false);

  const dismissKeyboard = () => Keyboard.dismiss();

  const handleDischargeChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 3) return;
    setDischarge(cleaned);
  };

  const handleSpacingChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setSpacing(cleaned);
  };

  const handleIrrigationTimeChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 1) return;
    setIrrigationTime(cleaned);
  };

  const handleCalculate = () => {
    setShowValidation(true);
    dismissKeyboard();

    if (!discharge || !spacing || !irrigationTime) return;

    const SD = parseFloat(discharge);
    const SS = parseFloat(spacing);
    const T = parseFloat(irrigationTime);

    if (isNaN(SD) || SD <= 0) {
      Alert.alert("Invalid Input", "Sprinkler discharge must be greater than 0.");
      return;
    }
    if (isNaN(SS) || SS <= 0) {
      Alert.alert("Invalid Input", "Sprinkler spacing must be greater than 0.");
      return;
    }
    if (isNaN(T) || T <= 0) {
      Alert.alert("Invalid Input", "Irrigation time must be greater than 0.");
      return;
    }

    const totalWater = SD * SS * T * 60;

    const formatted = totalWater.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

    setResult({ value: formatted, unit: "L" });
    setModalVisible(true);
  };

  const isFormInvalid =
    showValidation && (!discharge || !spacing || !irrigationTime);

  return (
    <View className="flex-1 bg-white">
      <CalculatorHeader
        title="Sprinkler System Calculator"
        icon={require("@/assets/images/farm-cal/irrigation-water-calculators/Sprinkler_UI.webp")}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        className="flex-1 px-6 mt-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isFormInvalid && (
          <Text className="text-[#287097] text-sm font-medium mb-5">
            Please fill all required fields!
          </Text>
        )}

        {/* Sprinkler Discharge */}
        <Text className="text-sm font-semibold text-gray-900 mb-2">
          Sprinkler discharge (L/min) *
        </Text>
        <TextInput
          value={discharge}
          onChangeText={handleDischargeChange}
          placeholder="--Type Here--"
          placeholderTextColor="#9CA3AF"
          keyboardType="decimal-pad"
          className="bg-[#F4F4F4] rounded-full px-4 py-4 text-sm text-gray-900"
        />

        {/* Sprinkler Spacing */}
        <Text className="text-sm font-semibold text-gray-900 mb-2 mt-6">
          Sprinkler spacing (m) *
        </Text>
        <TextInput
          value={spacing}
          onChangeText={handleSpacingChange}
          placeholder="--Type Here--"
          placeholderTextColor="#9CA3AF"
          keyboardType="decimal-pad"
          className="bg-[#F4F4F4] rounded-full px-4 py-4 text-sm text-gray-900"
        />

        {/* Irrigation Time */}
        <Text className="text-sm font-semibold text-gray-900 mb-2 mt-6">
          Irrigation time (hr) *
        </Text>
        <TextInput
          value={irrigationTime}
          onChangeText={handleIrrigationTimeChange}
          placeholder="--Type Here--"
          placeholderTextColor="#9CA3AF"
          keyboardType="decimal-pad"
          className="bg-[#F4F4F4] rounded-full px-4 py-4 text-sm text-gray-900"
        />

        {/* Calculate Button */}
        <TouchableOpacity
          onPress={handleCalculate}
          className="bg-[#2D2D2D] rounded-full py-4 items-center mt-10"
          activeOpacity={0.8}
        >
          <Text className="text-white text-base font-bold">Calculate</Text>
        </TouchableOpacity>
      </ScrollView>

      <ResultModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        cropName="Answer :"
        resultValue={result.value}
        resultUnit={result.unit}
      />
    </View>
  );
};

export default SprinklerSystemCalculatorScreen;