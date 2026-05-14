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

type ShelfLifeNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ShelfLifeCalculator"
>;

interface ShelfLifeProps {
  navigation: ShelfLifeNavigationProp;
}

const ShelfLifeCalculatorScreen: React.FC<ShelfLifeProps> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const [idealStorageLife, setIdealStorageLife] = useState("");
  const [temperature, setTemperature] = useState("");
  const [humidity, setHumidity] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [result, setResult] = useState({
    value: "",
    unit: t("PostHarvestStorageCalculators.Days"),
  });
  const [showValidation, setShowValidation] = useState(false);

  const handleNumberInput = (
    text: string,
    setter: (value: string) => void,
    decimals: number = 1,
  ) => {
    const cleaned = text.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > decimals) return;
    setter(cleaned);
  };

  const handleCalculate = () => {
    setShowValidation(true);

    if (!idealStorageLife || !temperature || !humidity) {
      Alert.alert(
        t("PostHarvestStorageCalculators.InvalidInput"),
        t("Main.PleaseFillAllRequiredFields"),
      );
      return;
    }

    const idealNum = parseFloat(idealStorageLife);
    const tempNum = parseFloat(temperature);
    const humidityNum = parseFloat(humidity);

    if (isNaN(idealNum) || idealNum <= 0) {
      Alert.alert(
        t("PostHarvestStorageCalculators.InvalidInput"),
        t("PostHarvestStorageCalculators.IdealStorageLifeDaysMustBeGreaterThan0"),
      );
      return;
    }
    if (isNaN(tempNum)) {
      Alert.alert(
        t("PostHarvestStorageCalculators.InvalidInput"),
        t("PostHarvestStorageCalculators.PleaseEnterAValidTemperature"),
      );
      return;
    }
    if (isNaN(humidityNum) || humidityNum < 0 || humidityNum > 100) {
      Alert.alert(
        t("PostHarvestStorageCalculators.InvalidInput"),
        t("PostHarvestStorageCalculators.HumidityMustBeBetween0And100"),
      );
      return;
    }

    // Calculate Shelf Life = Ideal Storage Life / ((T + H)/2)
    const averageFactor = (tempNum + humidityNum) / 2;
    if (averageFactor === 0) {
      Alert.alert(
        t("PostHarvestStorageCalculators.InvalidInput"),
        t("PostHarvestStorageCalculators.TemperatureAndHumidityCannotBothBeZero"),
      );
      return;
    }

    const shelfLife = idealNum / averageFactor;

    const formatted = shelfLife.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    });

    setResult({
      value: formatted,
      unit: t("PostHarvestStorageCalculators.Days"),
    });
    setModalVisible(true);
  };

  const isFormInvalid =
    showValidation && (!idealStorageLife || !temperature || !humidity);

  return (
    <View className="flex-1 bg-white">
      <CalculatorHeader
        title={t("PostHarvestStorageCalculators.ShelfLife")}
        icon={require("@/assets/images/farm-cal/post-harvest-storage-calculators/shelf-life-icon.webp")}
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

        {/* Ideal Storage Life Input */}
        <Text className="text-sm font-semibold text-gray-900 mb-2">
          {t("PostHarvestStorageCalculators.IdealStorageLifeDays")} *
        </Text>
        <TextInput
          value={idealStorageLife}
          onChangeText={(text) =>
            handleNumberInput(text, setIdealStorageLife, 1)
          }
          placeholder={t("Main.TypeHere")}
          placeholderTextColor="#9CA3AF"
          keyboardType="decimal-pad"
          className="bg-[#F4F4F4] rounded-3xl px-4 h-[50px] text-sm text-gray-900 mb-6"
        />

        {/* Temperature Input */}
        <Text className="text-sm font-semibold text-gray-900 mb-2">
          {t("PostHarvestStorageCalculators.TemperatureC")} *
        </Text>
        <TextInput
          value={temperature}
          onChangeText={(text) => handleNumberInput(text, setTemperature, 1)}
          placeholder={t("Main.TypeHere")}
          placeholderTextColor="#9CA3AF"
          keyboardType="decimal-pad"
          className="bg-[#F4F4F4] rounded-3xl px-4 h-[50px] text-sm text-gray-900 mb-6"
        />

        {/* Humidity Input */}
        <Text className="text-sm font-semibold text-gray-900 mb-2">
          {t("PostHarvestStorageCalculators.Humidity%")} *
        </Text>
        <TextInput
          value={humidity}
          onChangeText={(text) => handleNumberInput(text, setHumidity, 2)}
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
          <Text className="text-white text-lg font-bold">
            {t("PostHarvestStorageCalculators.Calculate")}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <ResultModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        cropName={t("PostHarvestStorageCalculators.ShelfLife")}
        resultValue={result.value}
        resultUnit={result.unit}
      />
    </View>
  );
};

export default ShelfLifeCalculatorScreen;
