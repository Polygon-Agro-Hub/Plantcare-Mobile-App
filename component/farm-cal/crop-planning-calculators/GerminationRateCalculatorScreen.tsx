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
import { useTranslation } from "react-i18next";

type GerminationRateNavigationProp = StackNavigationProp<
  RootStackParamList,
  "GerminationRateCalculator"
>;

interface GerminationRateProps {
  navigation: GerminationRateNavigationProp;
}

const GerminationRateCalculatorScreen: React.FC<GerminationRateProps> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const [seedsTested, setSeedsTested] = useState("");
  const [seedsGerminated, setSeedsGerminated] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [result, setResult] = useState({ value: "", unit: "%" });
  const [showValidation, setShowValidation] = useState(false);

  const dismissKeyboard = () => Keyboard.dismiss();

  const handleSeedsTestedChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    setSeedsTested(cleaned);
  };

  const handleSeedsGerminatedChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    setSeedsGerminated(cleaned);
  };

  // Formula: Germination Rate = (SG / ST) × 100
  const handleCalculate = () => {
    setShowValidation(true);
    dismissKeyboard();

    if (!seedsTested || !seedsGerminated) return;

    const ST = parseInt(seedsTested);
    const SG = parseInt(seedsGerminated);

    if (ST <= 0) {
      Alert.alert(
        t("CropPlanningCalculators.InvalidInput"),
        t("CropPlanningCalculators.NumberOfSeedsTestedMustBeGreaterThan0"),
      );
      return;
    }

    if (SG > ST) {
      Alert.alert(
        t("CropPlanningCalculators.InvalidInput"),
        t("CropPlanningCalculators.SeedsGerminatedCannotBeGreaterThanSeedsTested"),
      );
      return;
    }

    const germinationRate = (SG / ST) * 100;

    const formatted = germinationRate.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

    setResult({ value: formatted, unit: "%" });
    setModalVisible(true);
  };

  const isFormInvalid = showValidation && (!seedsTested || !seedsGerminated);

  return (
    <View className="flex-1 bg-white">
      <CalculatorHeader
        title={`${t("CropPlanningCalculators.GerminationRate")} ${t("Calculator.Calculator")}`}
        icon={require("@/assets/images/farm-cal/crop-planning-calculators/germination-rate-icon.webp")}
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
            {t("Main.PleaseFillAllRequiredFields")}
          </Text>
        )}

        {/* Number of Seeds Tested */}
        <Text className="text-sm font-semibold text-gray-900 mb-2">
          {t("CropPlanningCalculators.NumberOfSeedsTested")} *
        </Text>
        <TextInput
          value={seedsTested}
          onChangeText={handleSeedsTestedChange}
          placeholder={t("Main.TypeHere")}
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          className="bg-[#F4F4F4] rounded-3xl px-4 h-[50px] text-sm text-gray-900"
        />

        {/* Number of Seeds Germinated */}
        <Text className="text-sm font-semibold text-gray-900 mb-2 mt-6">
          {t("CropPlanningCalculators.SeedsGerminated")} *
        </Text>
        <TextInput
          value={seedsGerminated}
          onChangeText={handleSeedsGerminatedChange}
          placeholder={t("Main.TypeHere")}
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          className="bg-[#F4F4F4] rounded-3xl px-4 h-[50px] text-sm text-gray-900"
        />

        {/* Calculate Button */}
        <TouchableOpacity
          onPress={handleCalculate}
          className="bg-[#2D2D2D] rounded-3xl h-[50px] items-center justify-center mt-10"
          activeOpacity={0.8}
        >
          <Text className="text-white text-lg font-bold">
            {t("CropPlanningCalculators.Calculate")}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <ResultModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        cropName={t("CropPlanningCalculators.Answer")}
        resultValue={result.value}
        resultUnit={result.unit}
      />
    </View>
  );
};

export default GerminationRateCalculatorScreen;
