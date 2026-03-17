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

type DripIrrigationNavigationProp = StackNavigationProp<
  RootStackParamList,
  "DripIrrigationCalculator"
>;

interface DripIrrigationProps {
  navigation: DripIrrigationNavigationProp;
}

const DripIrrigationCalculatorScreen: React.FC<DripIrrigationProps> = ({
  navigation,
}) => {
  const [numberOfPlants, setNumberOfPlants] = useState("");
  const [flowRate, setFlowRate] = useState("");
  const [irrigationTime, setIrrigationTime] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [result, setResult] = useState({ value: "", unit: "L" });
  const [showValidation, setShowValidation] = useState(false);

  const dismissKeyboard = () => Keyboard.dismiss();

  // Integer only
  const handleNumberOfPlantsChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    setNumberOfPlants(cleaned);
  };

  // 3 decimal places
  const handleFlowRateChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 3) return;
    setFlowRate(cleaned);
  };

  // 1 decimal place
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

    if (!numberOfPlants || !flowRate || !irrigationTime) return;

    const NP = parseInt(numberOfPlants);
    const FR = parseFloat(flowRate);
    const T = parseFloat(irrigationTime);

    if (isNaN(NP) || NP <= 0) {
      Alert.alert("Invalid Input", "Number of plants must be greater than 0.");
      return;
    }
    if (isNaN(FR) || FR <= 0) {
      Alert.alert("Invalid Input", "Flow rate must be greater than 0.");
      return;
    }
    if (isNaN(T) || T <= 0) {
      Alert.alert("Invalid Input", "Irrigation time must be greater than 0.");
      return;
    }

    const totalWater = NP * FR * T;

    const formatted = totalWater.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

    setResult({ value: formatted, unit: "L" });
    setModalVisible(true);
  };

  const isFormInvalid =
    showValidation && (!numberOfPlants || !flowRate || !irrigationTime);

  return (
    <View className="flex-1 bg-white">
      <CalculatorHeader
        title="Drip Irrigation Calculator"
        icon={require("@/assets/images/farm-cal/irrigation-water-calculators/drip-irrigation-icon.webp")}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        className="flex-1 px-6 mt-3"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isFormInvalid && (
          <Text className="text-[#287097] text-sm font-medium mb-5">
            Please fill all required fields!
          </Text>
        )}

        {/* Number of Plants */}
        <Text className="text-sm font-semibold text-gray-900 mb-2">
          Number of plants *
        </Text>
        <TextInput
          value={numberOfPlants}
          onChangeText={handleNumberOfPlantsChange}
          placeholder="--Type Here--"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          className="bg-[#F4F4F4] rounded-full px-4 py-4 text-sm text-gray-900"
        />

        {/* Flow Rate Per Dripper */}
        <Text className="text-sm font-semibold text-gray-900 mb-2 mt-6">
          Flow rate per dripper (L/hr) *
        </Text>
        <TextInput
          value={flowRate}
          onChangeText={handleFlowRateChange}
          placeholder="--Type Here--"
          placeholderTextColor="#9CA3AF"
          keyboardType="decimal-pad"
          className="bg-[#F4F4F4] rounded-full px-4 py-4 text-sm text-gray-900"
        />

        {/* Irrigation Time */}
        <Text className="text-sm font-semibold text-gray-900 mb-2 mt-6">
          Irrigation time (in hours) *
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

export default DripIrrigationCalculatorScreen;