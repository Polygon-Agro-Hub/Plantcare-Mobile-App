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
import { useTranslation } from "react-i18next";

type BreakEvenPriceNavigationProp = StackNavigationProp<
  RootStackParamList,
  "BreakEvenPriceCalculator"
>;

interface BreakEvenPriceProps {
  navigation: BreakEvenPriceNavigationProp;
}

const BreakEvenPriceCalculatorScreen: React.FC<BreakEvenPriceProps> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const [totalCost, setTotalCost] = useState("");
  const [totalYield, setTotalYield] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [result, setResult] = useState({ value: "", unit: "Rs. / kg" });
  const [showValidation, setShowValidation] = useState(false);

  const handleNumberInput = (
    text: string,
    setter: (value: string) => void,
    decimals: number = 2,
  ) => {
    const cleaned = text.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > decimals) return;
    setter(cleaned);
  };

  const handleCalculate = () => {
    setShowValidation(true);

    if (!totalCost || !totalYield) {
      Alert.alert(
        t("EconomicCostCalendars.InvalidInput") || "Invalid Input",
        t("EconomicCostCalendars.FillAllFields") ||
          "Please fill all required fields.",
      );
      return;
    }

    const costNum = parseFloat(totalCost);
    const yieldNum = parseFloat(totalYield);

    if (isNaN(costNum) || costNum <= 0) {
      Alert.alert(
        t("EconomicCostCalendars.InvalidInput") || "Invalid Input",
        t("EconomicCostCalendars.TotalCostError") ||
          "Total cost must be greater than 0.",
      );
      return;
    }
    if (isNaN(yieldNum) || yieldNum <= 0) {
      Alert.alert(
        t("EconomicCostCalendars.InvalidInput") || "Invalid Input",
        t("EconomicCostCalendars.TotalYieldError") ||
          "Total yield must be greater than 0.",
      );
      return;
    }

    // Calculate Break-even Price = Total Cost / Total Yield
    const breakEvenPrice = costNum / yieldNum;

    // Format with 2 decimal places and comma separators
    const formattedValue = breakEvenPrice.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    setResult({ value: formattedValue, unit: "Rs. / kg" });
    setModalVisible(true);
  };

  const isFormInvalid =
    showValidation && (!totalCost || !totalYield);

  return (
    <View className="flex-1 bg-white">
      <CalculatorHeader
        title={t("EconomicCostCalendars.BreakEvenPrice")}
        icon={require("@/assets/images/farm-cal/economic-cost-calculators/break-even-price-icon.webp")}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isFormInvalid && (
          <Text className="text-[#287097] text-sm font-medium mb-5">
            {t("EconomicCostCalendars.FillRequiredFields") ||
              "Please fill all required fields!"}
          </Text>
        )}

        {/* Total Cost Input - 2 decimal points */}
        <Text className="text-sm font-semibold text-gray-900 mb-2">
          {t("EconomicCostCalendars.TotalCost") || "Total Cost (Rs.)"} *
        </Text>
        <TextInput
          value={totalCost}
          onChangeText={(text) => handleNumberInput(text, setTotalCost, 2)}
          placeholder={t("EconomicCostCalendars.TypeHere") || "--Type Here--"}
          placeholderTextColor="#9CA3AF"
          keyboardType="decimal-pad"
          className="bg-[#F4F4F4] rounded-full px-4 py-4 text-sm text-gray-900 mb-6"
        />

        {/* Total Yield Input - 2 decimal points */}
        <Text className="text-sm font-semibold text-gray-900 mb-2">
          {t("EconomicCostCalendars.TotalYield") || "Total Yield (kg)"} *
        </Text>
        <TextInput
          value={totalYield}
          onChangeText={(text) => handleNumberInput(text, setTotalYield, 2)}
          placeholder={t("EconomicCostCalendars.TypeHere") || "--Type Here--"}
          placeholderTextColor="#9CA3AF"
          keyboardType="decimal-pad"
          className="bg-[#F4F4F4] rounded-full px-4 py-4 text-sm text-gray-900 mb-6"
        />

        {/* Calculate Button */}
        <TouchableOpacity
          onPress={handleCalculate}
          className="bg-[#2D2D2D] rounded-full py-4 items-center mt-4"
          activeOpacity={0.8}
        >
          <Text className="text-white text-base font-bold">
            {t("EconomicCostCalendars.Calculate") || "Calculate"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <ResultModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        cropName={
          t("EconomicCostCalendars.BreakEvenPriceResult") || "Break-even Price"
        }
        resultValue={result.value}
        resultUnit={result.unit}
        showUnitFirst={true}
      />
    </View>
  );
};

export default BreakEvenPriceCalculatorScreen;