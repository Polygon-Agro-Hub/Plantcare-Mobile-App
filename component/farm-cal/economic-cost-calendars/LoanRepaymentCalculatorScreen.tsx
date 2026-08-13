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

type LoanRepaymentNavigationProp = StackNavigationProp<
  RootStackParamList,
  "LoanRepaymentCalculator"
>;

interface LoanRepaymentProps {
  navigation: LoanRepaymentNavigationProp;
}

const LoanRepaymentCalculatorScreen: React.FC<LoanRepaymentProps> = ({
  navigation,
}) => {
  const { t } = useTranslation();

  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanYears, setLoanYears] = useState("");

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
    decimals: number = 2,
  ) => {
    const cleaned = text.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > decimals) return;
    setter(cleaned);
  };

  const handleCommaNumberInput = (
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

    if (!loanAmount || !interestRate || !loanYears) {
      Alert.alert(
        t("EconomicCostCalendars.InvalidInput") || "Invalid Input",
        t("Main.PleaseFillAllRequiredFields") ||
        "Please fill all required fields.",
      );
      return;
    }

    const loanNum = parseFloat(loanAmount);
    const rateNum = parseFloat(interestRate);
    const yearsNum = parseFloat(loanYears);

    if (isNaN(loanNum) || loanNum <= 0) {
      Alert.alert(
        t("EconomicCostCalendars.InvalidInput") || "Invalid Input",
        t("EconomicCostCalendars.LoanAmountMustBeGreaterThan0") ||
        "Loan amount must be greater than 0.",
      );
      return;
    }
    if (isNaN(rateNum) || rateNum <= 0) {
      Alert.alert(
        t("EconomicCostCalendars.InvalidInput") || "Invalid Input",
        t("EconomicCostCalendars.InterestRateMustBeGreaterThan0") ||
        "Interest rate must be greater than 0.",
      );
      return;
    }
    if (isNaN(yearsNum) || yearsNum <= 0) {
      Alert.alert(
        t("EconomicCostCalendars.InvalidInput") || "Invalid Input",
        t("EconomicCostCalendars.NumberOfYearsMustBeGreaterThan0") ||
        "Number of years must be greater than 0.",
      );
      return;
    }

    const monthlyRate = rateNum / 100 / 12;
    const totalMonths = yearsNum * 12;
    const compoundFactor = Math.pow(1 + monthlyRate, totalMonths);

    let monthlyPayment = 0;
    if (compoundFactor !== 1) {
      monthlyPayment =
        (loanNum * monthlyRate * compoundFactor) / (compoundFactor - 1);
    } else {
      monthlyPayment = loanNum / totalMonths;
    }

    const formattedValue = monthlyPayment.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    setResult({ value: formattedValue, unit: "Rs." });
    setModalVisible(true);
  };

  const isFormInvalid =
    showValidation && (!loanAmount || !interestRate || !loanYears);

  return (
    <View className="flex-1 bg-white">
      <CalculatorHeader
        title={`${t("EconomicCostCalendars.LoanRepayment")} ${t("Calculator.Calculator")}`}
        icon={require("@/assets/images/farm-cal/economic-cost-calculators/loan-repayment-icon.webp")}
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

        <Text className="text-sm font-semibold text-gray-900 mb-2">
          {t("EconomicCostCalendars.LoanAmountRs") || "Loan Amount (Rs.)"} *
        </Text>
        <TextInput
          value={formatWithCommas(loanAmount)}
          onChangeText={(text) =>
            handleCommaNumberInput(text, setLoanAmount, 2)
          }
          placeholder={t("Main.TypeHere") || "--Type Here--"}
          placeholderTextColor="#9CA3AF"
          keyboardType="decimal-pad"
          className="bg-[#F4F4F4] rounded-3xl px-4 h-[50px] text-sm text-gray-900 mb-6"
        />

        <Text className="text-sm font-semibold text-gray-900 mb-2">
          {t("EconomicCostCalendars.InterestRate%") || "Interest Rate (%)"} *
        </Text>
        <TextInput
          value={interestRate}
          onChangeText={(text) => handleNumberInput(text, setInterestRate, 2)}
          placeholder={t("Main.TypeHere") || "--Type Here--"}
          placeholderTextColor="#9CA3AF"
          keyboardType="decimal-pad"
          className="bg-[#F4F4F4] rounded-3xl px-4 h-[50px] text-sm text-gray-900 mb-6"
        />

        <Text className="text-sm font-semibold text-gray-900 mb-2">
          {t("EconomicCostCalendars.NumberOfYears") || "Number of years"} *
        </Text>
        <TextInput
          value={loanYears}
          onChangeText={(text) => handleNumberInput(text, setLoanYears, 1)}
          placeholder={t("Main.TypeHere") || "--Type Here--"}
          placeholderTextColor="#9CA3AF"
          keyboardType="decimal-pad"
          className="bg-[#F4F4F4] rounded-3xl px-4 h-[50px] text-sm text-gray-900 mb-6"
        />

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
          t("EconomicCostCalendars.MonthlyPayment") || "Monthly Payment"
        }
        resultValue={result.value}
        resultUnit={result.unit}
        showUnitFirst={true}
      />
    </View>
  );
};

export default LoanRepaymentCalculatorScreen;
