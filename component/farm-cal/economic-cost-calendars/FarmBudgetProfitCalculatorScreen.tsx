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

type FarmBudgetProfitNavigationProp = StackNavigationProp<
  RootStackParamList,
  "FarmBudgetProfitCalculator"
>;

interface FarmBudgetProfitProps {
  navigation: FarmBudgetProfitNavigationProp;
}

const FarmBudgetProfitCalculatorScreen: React.FC<FarmBudgetProfitProps> = ({
  navigation,
}) => {
  const { t } = useTranslation();

  const [totalExpenses, setTotalExpenses] = useState("");
  const [expectedRevenue, setExpectedRevenue] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [result, setResult] = useState({ value: "", unit: "Rs." });
  const [showValidation, setShowValidation] = useState(false);

  const stripCommas = (value: string) => value.replace(/,/g, "");

  const formatWithCommas = (raw: string): string => {
    if (!raw) return "";
    const [intPart, decPart] = raw.split(".");
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
  };

  const handleNumberInput = (
    text: string,
    setter: (value: string) => void,
    maxDecimals: number = 2,
  ) => {
    const stripped = stripCommas(text);

    const cleaned = stripped.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > maxDecimals) return;

    setter(cleaned);
  };

  const handleCalculate = () => {
    setShowValidation(true);

    if (!totalExpenses || !expectedRevenue) {
      Alert.alert(
        t("EconomicCostCalendars.InvalidInput") || "Invalid Input",
        t("EconomicCostCalendars.FillAllFields") ||
          "Please fill all required fields.",
      );
      return;
    }

    const expensesNum = parseFloat(totalExpenses);
    const revenueNum = parseFloat(expectedRevenue);

    if (isNaN(expensesNum) || expensesNum <= 0) {
      Alert.alert(
        t("EconomicCostCalendars.InvalidInput") || "Invalid Input",
        t("EconomicCostCalendars.ExpensesError") ||
          "Total farm expenses must be greater than 0.",
      );
      return;
    }
    if (isNaN(revenueNum) || revenueNum <= 0) {
      Alert.alert(
        t("EconomicCostCalendars.InvalidInput") || "Invalid Input",
        t("EconomicCostCalendars.RevenueError") ||
          "Expected revenue must be greater than 0.",
      );
      return;
    }

    const profit = revenueNum - expensesNum;

    const formattedValue = profit.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    setResult({ value: formattedValue, unit: "Rs." });
    setModalVisible(true);
  };

  const isFormInvalid = showValidation && (!totalExpenses || !expectedRevenue);

  return (
    <View className="flex-1 bg-white">
      <CalculatorHeader
        title={t("EconomicCostCalendars.FarmBudgetProfit")}
        icon={require("@/assets/images/farm-cal/economic-cost-calculators/farm-budget-profit-icon.webp")}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isFormInvalid && (
          <Text className="text-[#287097] text-sm font-medium mb-5">
            {t("EconomicCostCalendars.FillRequiredFields") ||
              "Please fill all required fields!"}
          </Text>
        )}

        {/* Total Farm Expenses */}
        <Text className="text-sm font-semibold text-gray-900 mb-2">
          {t("EconomicCostCalendars.TotalFarmExpenses") ||
            "Total Farm Expenses (Rs.)"}{" "}
          *
        </Text>
        <TextInput
          value={formatWithCommas(totalExpenses)}
          onChangeText={(text) => handleNumberInput(text, setTotalExpenses, 2)}
          placeholder={t("EconomicCostCalendars.TypeHere") || "--Type Here--"}
          placeholderTextColor="#9CA3AF"
          keyboardType="decimal-pad"
          className="bg-[#F4F4F4] rounded-3xl px-4 h-[50px] text-sm text-gray-900 mb-6"
        />

        {/* Expected Revenue */}
        <Text className="text-sm font-semibold text-gray-900 mb-2">
          {t("EconomicCostCalendars.ExpectedRevenue") ||
            "Expected Revenue (Rs.)"}{" "}
          *
        </Text>
        <TextInput
          value={formatWithCommas(expectedRevenue)}
          onChangeText={(text) =>
            handleNumberInput(text, setExpectedRevenue, 2)
          }
          placeholder={t("EconomicCostCalendars.TypeHere") || "--Type Here--"}
          placeholderTextColor="#9CA3AF"
          keyboardType="decimal-pad"
          className="bg-[#F4F4F4] rounded-3xl px-4 h-[50px] text-sm text-gray-900 mb-6"
        />

        {/* Calculate Button */}
        <TouchableOpacity
          onPress={handleCalculate}
          className="bg-[#2D2D2D] rounded-3xl h-[50px] items-center justify-center mt-4"
          activeOpacity={0.8}
        >
          <Text className="text-white text-lg font-bold">
            {t("EconomicCostCalendars.Calculate") || "Calculate"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <ResultModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        cropName={t("EconomicCostCalendars.Profit") || "Profit :"}
        resultValue={result.value}
        resultUnit={result.unit}
        showUnitFirst={true}
      />
    </View>
  );
};

export default FarmBudgetProfitCalculatorScreen;
