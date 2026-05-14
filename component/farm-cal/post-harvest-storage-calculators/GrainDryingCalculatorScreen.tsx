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

type GrainDryingNavigationProp = StackNavigationProp<
  RootStackParamList,
  "GrainDryingCalculator"
>;

interface GrainDryingProps {
  navigation: GrainDryingNavigationProp;
}

const GrainDryingCalculatorScreen: React.FC<GrainDryingProps> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const [initialMoisture, setInitialMoisture] = useState("");
  const [finalMoisture, setFinalMoisture] = useState("");
  const [grainWeight, setGrainWeight] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [result, setResult] = useState({ value: "", unit: "kg" });
  const [showValidation, setShowValidation] = useState(false);

  const handleNumberInput = (
    text: string,
    setter: (value: string) => void,
    decimals: number = 3,
  ) => {
    const cleaned = text.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > decimals) return;
    setter(cleaned);
  };

  const handleCalculate = () => {
    setShowValidation(true);

    if (!initialMoisture || !finalMoisture || !grainWeight) {
      Alert.alert(t("PostHarvestStorageCalculators.InvalidInput"), t("Main.PleaseFillAllRequiredFields"));
      return;
    }

    const initialNum = parseFloat(initialMoisture);
    const finalNum = parseFloat(finalMoisture);
    const weightNum = parseFloat(grainWeight);

    if (isNaN(initialNum) || initialNum <= 0 || initialNum > 100) {
      Alert.alert(
        t("PostHarvestStorageCalculators.InvalidInput"),
        t("PostHarvestStorageCalculators.InitialMoistureMustBeBetween0And100"),
      );
      return;
    }
    if (isNaN(finalNum) || finalNum <= 0 || finalNum > 100) {
      Alert.alert(t("PostHarvestStorageCalculators.InvalidInput"), t("PostHarvestStorageCalculators.FinalMoistureMustBeBetween0And100"));
      return;
    }
    if (initialNum <= finalNum) {
      Alert.alert(
        t("PostHarvestStorageCalculators.InvalidInput"),
        t("PostHarvestStorageCalculators.InitialMoistureMustBeGreaterThanFinalMoisture"),
      );
      return;
    }
    if (isNaN(weightNum) || weightNum <= 0) {
      Alert.alert(t("PostHarvestStorageCalculators.InvalidInput"), t("PostHarvestStorageCalculators.GrainWeightMustBeGreaterThan0"));
      return;
    }

    // Calculate Water to Remove = Grain Weight × (Initial Moisture - Final Moisture) / 100
    const waterToRemove = (weightNum * (initialNum - finalNum)) / 100;

    const formatted = waterToRemove.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    setResult({ value: formatted, unit: "kg" });
    setModalVisible(true);
  };

  const isFormInvalid =
    showValidation && (!initialMoisture || !finalMoisture || !grainWeight);

  return (
    <View className="flex-1 bg-white">
      <CalculatorHeader
        title={t("PostHarvestStorageCalculators.GrainDrying")}
        icon={require("@/assets/images/farm-cal/post-harvest-storage-calculators/grain-drying-icon.webp")}
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
            {t("Main.PleaseFillAllRequiredFields")}
          </Text>
        )}

        {/* Initial Moisture Input */}
        <Text className="text-sm font-semibold text-gray-900 mb-2">
          {t("PostHarvestStorageCalculators.InitialMoisture%")} *
        </Text>
        <TextInput
          value={initialMoisture}
          onChangeText={(text) =>
            handleNumberInput(text, setInitialMoisture, 3)
          }
          placeholder={t("Main.TypeHere")}
          placeholderTextColor="#9CA3AF"
          keyboardType="decimal-pad"
          className="bg-[#F4F4F4] rounded-3xl px-4 h-[50px] text-sm text-gray-900 mb-6"
        />

        {/* Final Moisture Input */}
        <Text className="text-sm font-semibold text-gray-900 mb-2">
          {t("PostHarvestStorageCalculators.FinalMoisture%")} *
        </Text>
        <TextInput
          value={finalMoisture}
          onChangeText={(text) => handleNumberInput(text, setFinalMoisture, 3)}
          placeholder={t("Main.TypeHere")}
          placeholderTextColor="#9CA3AF"
          keyboardType="decimal-pad"
          className="bg-[#F4F4F4] rounded-3xl px-4 h-[50px] text-sm text-gray-900 mb-6"
        />

        {/* Grain Weight Input */}
        <Text className="text-sm font-semibold text-gray-900 mb-2">
          {t("PostHarvestStorageCalculators.TotalGrainWeightKg")} *
        </Text>
        <TextInput
          value={grainWeight}
          onChangeText={(text) => handleNumberInput(text, setGrainWeight, 3)}
          placeholder={t("Main.TypeHere")}
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
          <Text className="text-white text-lg font-bold">{t("PostHarvestStorageCalculators.Calculate")}</Text>
        </TouchableOpacity>
      </ScrollView>

      <ResultModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        cropName={t("PostHarvestStorageCalculators.WaterToRemove")}
        resultValue={result.value}
        resultUnit={result.unit}
      />
    </View>
  );
};

export default GrainDryingCalculatorScreen;