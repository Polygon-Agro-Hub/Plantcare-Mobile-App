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

type LaborCostNavigationProp = StackNavigationProp<
  RootStackParamList,
  "LaborCostCalculator"
>;

interface LaborCostProps {
  navigation: LaborCostNavigationProp;
}

const LaborCostCalculatorScreen: React.FC<LaborCostProps> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const [numberOfWorkers, setNumberOfWorkers] = useState("");
  const [dailyWage, setDailyWage] = useState("");
  const [workdays, setWorkdays] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [result, setResult] = useState({ value: "", unit: "Rs." });
  const [showValidation, setShowValidation] = useState(false);

  const handleIntegerInput = (
    text: string,
    setter: (value: string) => void,
  ) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    setter(cleaned);
  };

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

    if (!numberOfWorkers || !dailyWage || !workdays) {
      Alert.alert(
        t("EconomicCostCalendars.InvalidInput") || "Invalid Input",
        t("EconomicCostCalendars.FillAllFields") ||
          "Please fill all required fields.",
      );
      return;
    }

    const workersNum = parseInt(numberOfWorkers, 10);
    const wageNum = parseFloat(dailyWage);
    const workdaysNum = parseFloat(workdays);

    if (isNaN(workersNum) || workersNum <= 0) {
      Alert.alert(
        t("EconomicCostCalendars.InvalidInput") || "Invalid Input",
        t("EconomicCostCalendars.WorkersError") ||
          "Number of workers must be greater than 0.",
      );
      return;
    }
    if (isNaN(wageNum) || wageNum <= 0) {
      Alert.alert(
        t("EconomicCostCalendars.InvalidInput") || "Invalid Input",
        t("EconomicCostCalendars.WageError") ||
          "Daily wage must be greater than 0.",
      );
      return;
    }
    if (isNaN(workdaysNum) || workdaysNum <= 0) {
      Alert.alert(
        t("EconomicCostCalendars.InvalidInput") || "Invalid Input",
        t("EconomicCostCalendars.WorkdaysError") ||
          "Number of workdays must be greater than 0.",
      );
      return;
    }

    // Calculate Total Labor Cost = Number of workers × Daily Wage × Number of workdays
    const totalCost = workersNum * wageNum * workdaysNum;

    // Format with 2 decimal places and comma separators
    const formattedValue = totalCost.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    setResult({ value: formattedValue, unit: "Rs." });
    setModalVisible(true);
  };

  const isFormInvalid =
    showValidation && (!numberOfWorkers || !dailyWage || !workdays);

  return (
    <View className="flex-1 bg-white">
      <CalculatorHeader
        title={t("EconomicCostCalendars.LaborCost")}
        icon={require("@/assets/images/farm-cal/economic-cost-calculators/labor-cost-icon.webp")}
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

        {/* Number of Workers Input - Integer only */}
        <Text className="text-sm font-semibold text-gray-900 mb-2">
          {t("EconomicCostCalendars.NumberOfWorkers") || "Number of workers"} *
        </Text>
        <TextInput
          value={numberOfWorkers}
          onChangeText={(text) => handleIntegerInput(text, setNumberOfWorkers)}
          placeholder={t("EconomicCostCalendars.TypeHere") || "--Type Here--"}
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          className="bg-[#F4F4F4] rounded-3xl px-4 h-[50px] text-sm text-gray-900 mb-6"
        />

        {/* Daily Wage Input - 2 decimal points */}
        <Text className="text-sm font-semibold text-gray-900 mb-2">
          {t("EconomicCostCalendars.DailyWage") || "Daily Wage (Rs.)"} *
        </Text>
        <TextInput
          value={dailyWage}
          onChangeText={(text) => handleNumberInput(text, setDailyWage, 2)}
          placeholder={t("EconomicCostCalendars.TypeHere") || "--Type Here--"}
          placeholderTextColor="#9CA3AF"
          keyboardType="decimal-pad"
          className="bg-[#F4F4F4] rounded-3xl px-4 h-[50px] text-sm text-gray-900 mb-6"
        />

        {/* Number of Workdays Input - 1 decimal point */}
        <Text className="text-sm font-semibold text-gray-900 mb-2">
          {t("EconomicCostCalendars.NumberOfWorkdays") || "Number of workdays"}{" "}
          *
        </Text>
        <TextInput
          value={workdays}
          onChangeText={(text) => handleNumberInput(text, setWorkdays, 1)}
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
        cropName={
          t("EconomicCostCalendars.TotalLaborCost") || "Total Labor Cost"
        }
        resultValue={result.value}
        resultUnit={result.unit}
        showUnitFirst={true}
      />
    </View>
  );
};

export default LaborCostCalculatorScreen;
