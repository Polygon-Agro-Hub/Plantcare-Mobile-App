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

type ColdStorageNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ColdStorageCalculator"
>;

interface ColdStorageProps {
  navigation: ColdStorageNavigationProp;
}

const ColdStorageCalculatorScreen: React.FC<ColdStorageProps> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const [storageVolume, setStorageVolume] = useState("");
  const [coolingPowerPerUnit, setCoolingPowerPerUnit] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [result, setResult] = useState({ value: "", unit: "W" });
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

    if (!storageVolume || !coolingPowerPerUnit) {
      Alert.alert(
        t("PostHarvestStorageCalculators.InvalidInput"),
        t("PostHarvestStorageCalculators.FillAllFields"),
      );
      return;
    }

    const volumeNum = parseFloat(storageVolume);
    const powerPerUnitNum = parseFloat(coolingPowerPerUnit);

    if (isNaN(volumeNum) || volumeNum <= 0) {
      Alert.alert(
        t("PostHarvestStorageCalculators.InvalidInput"),
        t("PostHarvestStorageCalculators.VolumeError"),
      );
      return;
    }
    if (isNaN(powerPerUnitNum) || powerPerUnitNum <= 0) {
      Alert.alert(
        t("PostHarvestStorageCalculators.InvalidInput"),
        t("PostHarvestStorageCalculators.PowerError"),
      );
      return;
    }

    // Calculate Total Cooling Power = Storage Volume × Cooling Power per m³
    const totalCoolingPower = volumeNum * powerPerUnitNum;

    // Format based on size for better readability
    let formattedValue;
    let displayUnit = "W";

    if (totalCoolingPower >= 1000) {
      formattedValue = (totalCoolingPower / 1000).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      displayUnit = "kW";
    } else {
      formattedValue = totalCoolingPower.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      });
    }

    setResult({ value: formattedValue, unit: displayUnit });
    setModalVisible(true);
  };

  const isFormInvalid =
    showValidation && (!storageVolume || !coolingPowerPerUnit);

  return (
    <View className="flex-1 bg-white">
      <CalculatorHeader
        title={t("PostHarvestStorageCalculators.ColdStorage")}
        icon={require("@/assets/images/farm-cal/post-harvest-storage-calculators/cold-storage-icon.webp")}
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
            {t("PostHarvestStorageCalculators.FillRequiredFields")}
          </Text>
        )}

        {/* Storage Volume Input */}
        <Text className="text-sm font-semibold text-gray-900 mb-2">
          {t("PostHarvestStorageCalculators.StorageVolume")} *
        </Text>
        <TextInput
          value={storageVolume}
          onChangeText={(text) => handleNumberInput(text, setStorageVolume, 2)}
          placeholder={t("PostHarvestStorageCalculators.TypeHere")}
          placeholderTextColor="#9CA3AF"
          keyboardType="decimal-pad"
          className="bg-[#F4F4F4] rounded-full px-4 py-4 text-sm text-gray-900 mb-6"
        />

        {/* Cooling Power per Unit Input */}
        <Text className="text-sm font-semibold text-gray-900 mb-2">
          {t("PostHarvestStorageCalculators.CoolingPowerNeeded")} *
        </Text>
        <TextInput
          value={coolingPowerPerUnit}
          onChangeText={(text) =>
            handleNumberInput(text, setCoolingPowerPerUnit, 2)
          }
          placeholder={t("PostHarvestStorageCalculators.TypeHere")}
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
            {t("PostHarvestStorageCalculators.Calculate")}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <ResultModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        cropName={t("PostHarvestStorageCalculators.TotalCoolingPower")}
        resultValue={result.value}
        resultUnit={result.unit}
      />
    </View>
  );
};

export default ColdStorageCalculatorScreen;
