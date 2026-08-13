import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/types";
import CalculatorHeader from "../common/CalculatorHeader";
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

    if (!totalCost || !totalYield) {
      Alert.alert(
        t("EconomicCostCalendars.InvalidInput") || "Invalid Input",
        t("Main.PleaseFillAllRequiredFields") ||
          "Please fill all required fields.",
      );
      return;
    }

    const costNum = parseFloat(totalCost);
    const yieldNum = parseFloat(totalYield);

    if (isNaN(costNum) || costNum <= 0) {
      Alert.alert(
        t("EconomicCostCalendars.InvalidInput") || "Invalid Input",
        t("EconomicCostCalendars.TotalCostMustBeGreaterThan0") ||
          "Total cost must be greater than 0.",
      );
      return;
    }
    if (isNaN(yieldNum) || yieldNum <= 0) {
      Alert.alert(
        t("EconomicCostCalendars.InvalidInput") || "Invalid Input",
        t("EconomicCostCalendars.TotalYieldMustBeGreaterThan0") ||
          "Total yield must be greater than 0.",
      );
      return;
    }

    const breakEvenPrice = costNum / yieldNum;

    const formattedValue = breakEvenPrice.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    setResult({ value: formattedValue, unit: "Rs. / kg" });
    setModalVisible(true);
  };

  const isFormInvalid = showValidation && (!totalCost || !totalYield);

  return (
    <View className="flex-1 bg-white">
      <CalculatorHeader
        title={`${t("EconomicCostCalendars.BreakEvenPrice")} ${t("Calculator.Calculator")}`}
        icon={require("@/assets/images/farm-cal/economic-cost-calculators/break-even-price-icon.webp")}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isFormInvalid && (
          <Text className="text-[#287097] text-sm font-medium mb-5">
            {t("Main.PleaseFillAllRequiredFields") ||
              "Please fill all required fields!"}
          </Text>
        )}

        {/* Total Cost Input */}
        <Text className="text-sm font-semibold text-gray-900 mb-2">
          {t("EconomicCostCalendars.TotalCost") || "Total Cost (Rs.)"} *
        </Text>
        <TextInput
          value={formatWithCommas(totalCost)}
          onChangeText={(text) => handleNumberInput(text, setTotalCost, 2)}
          placeholder={t("Main.TypeHere") || "--Type Here--"}
          placeholderTextColor="#9CA3AF"
          keyboardType="decimal-pad"
          className="bg-[#F4F4F4] rounded-3xl px-4 h-[50px] text-sm text-gray-900 mb-6"
        />

        {/* Total Yield Input */}
        <Text className="text-sm font-semibold text-gray-900 mb-2">
          {t("EconomicCostCalendars.TotalYieldKg") || "Total Yield (kg)"} *
        </Text>
        <TextInput
          value={formatWithCommas(totalYield)}
          onChangeText={(text) => handleNumberInput(text, setTotalYield, 2)}
          placeholder={t("Main.TypeHere") || "--Type Here--"}
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

      {/* Result Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.75)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            className="bg-white w-3/4 shadow-lg overflow-hidden"
            style={{ borderRadius: 16 }}
          >
            {/* Yellow top bar */}
            <View
              style={{ height: 10, backgroundColor: "#F5C518", width: "100%" }}
            />

            {/* Content */}
            <View className="py-7 px-9 items-center">
              {/* Close button */}
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gray-200 items-center justify-center"
              >
                <Text className="text-xs text-gray-600 font-semibold">✕</Text>
              </TouchableOpacity>

              {/* Title */}
              <Text className="text-lg font-semibold text-gray-900 mt-1">
                {t("EconomicCostCalendars.Answer")}
              </Text>

              {/* Result */}
              <View className="flex-row items-baseline mt-2 flex-wrap justify-center">
                <Text className="text-3xl text-[#287097] ml-1">Rs. </Text>
                <Text className="text-3xl font-extrabold text-gray-900">
                  {result.value}
                </Text>
                <Text className="text-3xl text-[#287097] ml-1">/ kg</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default BreakEvenPriceCalculatorScreen;
