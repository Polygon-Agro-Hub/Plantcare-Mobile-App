import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/types";
import CalculatorHeader from "../common/CalculatorHeader";
import ResultModal from "../common/ResultModal";
import { Keyboard } from "react-native";
import GlobalSearchModal from "@/component/common/GlobalSearchModal";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";

type PlantPopulationNavigationProp = StackNavigationProp<
  RootStackParamList,
  "PlantPopulationCalculator"
>;

interface PlantPopulationProps {
  navigation: PlantPopulationNavigationProp;
}

interface CropGroup {
  id: number;
  cropNameEnglish: string;
  rowSpace: number;
  plantSpace: number;
  image: string | null;
}

interface CropItem {
  label: string;
  value: string;
  rowSpace: number;
  plantSpace: number;
  icon: string | null;
}

const AREA_UNITS = [
  { label: "Hectares", value: "Hectares" },
  { label: "Acres", value: "Acres" },
];

const PlantPopulationCalculatorScreen: React.FC<PlantPopulationProps> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const [crops, setCrops] = useState<CropItem[]>([]);
  const [cropsLoading, setCropsLoading] = useState(false);

  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [unitModalVisible, setUnitModalVisible] = useState(false);
  const [selectedCropValue, setSelectedCropValue] = useState<string | null>(
    null,
  );
  const [area, setArea] = useState("");
  const [areaUnit, setAreaUnit] = useState("Hectares");
  const [modalVisible, setModalVisible] = useState(false);
  const [result, setResult] = useState({ value: "", unit: "" });
  const [showValidation, setShowValidation] = useState(false);

  const selectedCrop = crops.find((c) => c.value === selectedCropValue) || null;

  const dismissKeyboard = () => Keyboard.dismiss();

  useEffect(() => {
    const fetchCrops = async () => {
      setCropsLoading(true);
      try {
        const response = await axios.get(
          `${environment.API_BASE_URL}api/crop/get-all-cropgroups`,
        );

        if (response.data.status === "success") {
          const mapped: CropItem[] = response.data.data
            .filter(
              (item: CropGroup) =>
                item.cropNameEnglish &&
                item.rowSpace > 0 &&
                item.plantSpace > 0,
            )
            .map((item: CropGroup) => ({
              label: item.cropNameEnglish,
              value: item.cropNameEnglish,
              rowSpace: Number(item.rowSpace),
              plantSpace: Number(item.plantSpace),
              icon: item.image ?? null,
            }));
          setCrops(mapped);
        }
      } catch (error) {
        console.error("Error fetching crop groups:", error);
        Alert.alert(
          t("CropPlanningCalculators.Error"),
          t("CropPlanningCalculators.FetchError"),
        );
      } finally {
        setCropsLoading(false);
      }
    };

    fetchCrops();
  }, [t]);

  const handleAreaChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 4) return;
    setArea(cleaned);
  };

  const handleCalculate = () => {
    setShowValidation(true);
    dismissKeyboard();

    if (!selectedCrop || !area) return;

    const areaNum = parseFloat(area);
    if (isNaN(areaNum) || areaNum <= 0) {
      Alert.alert(
        t("CropPlanningCalculators.InvalidInput"),
        t("CropPlanningCalculators.AreaError"),
      );
      return;
    }

    const areaCm2 =
      areaUnit === "Hectares" ? areaNum * 100_000_000 : areaNum * 40_468_564;

    const plantPopulation =
      areaCm2 / (selectedCrop.rowSpace * selectedCrop.plantSpace);

    const formatted = Math.round(plantPopulation).toLocaleString("en-US");

    setResult({ value: formatted, unit: "" });
    setModalVisible(true);
  };

  const handleCropSelect = (selectedValues: string[]) => {
    setSelectedCropValue(selectedValues[0] || null);
  };

  const handleUnitSelect = (selectedValues: string[]) => {
    setAreaUnit(selectedValues[0] || "Hectares");
  };

  const getSelectedCropLabel = () => {
    if (!selectedCropValue) return t("CropPlanningCalculators.SelectCrop");
    const crop = crops.find((c) => c.value === selectedCropValue);
    return crop ? crop.label : t("CropPlanningCalculators.SelectCrop");
  };

  const getSelectedUnitLabel = () => {
    const unit = AREA_UNITS.find((u) => u.value === areaUnit);
    return unit
      ? t(`CropPlanningCalculators.${unit.label}`)
      : t("CropPlanningCalculators.Hectares");
  };

  const isFormInvalid =
    showValidation && (!selectedCrop || !area || parseFloat(area) <= 0);

  return (
    <View className="flex-1 bg-white">
      <CalculatorHeader
        title={`${t("CropPlanningCalculators.PlantPopulation")} ${t("Calculator.calculator")}`}
        icon={require("@/assets/images/farm-cal/crop-planning-calculators/plant-population-icon.webp")}
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
            {t("CropPlanningCalculators.FillAllFields")}
          </Text>
        )}

        {/* Crop Selection */}
        <Text className="text-sm font-semibold text-gray-900 mb-2">
          {t("CropPlanningCalculators.Crop")} *
        </Text>
        <TouchableOpacity
          onPress={() => {
            dismissKeyboard();
            setCropModalVisible(true);
          }}
          className="bg-[#F4F4F4] rounded-full px-4 py-4 flex-row justify-between items-center"
          disabled={cropsLoading}
        >
          {cropsLoading ? (
            <ActivityIndicator size="small" color="#287097" />
          ) : (
            <>
              <Text
                className={`text-sm ${
                  selectedCropValue ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {getSelectedCropLabel()}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
            </>
          )}
        </TouchableOpacity>

        {/* Area Input + Unit Selection */}
        <Text className="text-sm font-semibold text-gray-900 mb-2 mt-6">
          {t("CropPlanningCalculators.AreaToBePlanted")} *
        </Text>
        <View className="flex-row gap-2 items-center">
          <TextInput
            value={area}
            onChangeText={handleAreaChange}
            placeholder={t("CropPlanningCalculators.TypeHere")}
            placeholderTextColor="#9CA3AF"
            keyboardType="decimal-pad"
            className="flex-1 bg-[#F4F4F4] rounded-full px-4 py-4 text-sm text-gray-900"
          />
          <TouchableOpacity
            onPress={() => {
              dismissKeyboard();
              setUnitModalVisible(true);
            }}
            style={{ width: 140 }}
            className="bg-[#F4F4F4] rounded-full px-4 py-4 flex-row justify-between items-center"
          >
            <Text className="text-sm text-gray-900">
              {getSelectedUnitLabel()}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Row Spacing Auto Fill */}
        <Text className="text-sm font-semibold text-gray-900 mb-2 mt-6">
          {t("CropPlanningCalculators.RowSpacing")}
        </Text>
        <View className="bg-[#F4F4F4] rounded-full px-4 py-4">
          <Text
            className={`text-sm ${
              selectedCrop ? "text-[#287097]" : "text-gray-400"
            }`}
          >
            {selectedCrop
              ? `${selectedCrop.rowSpace} cm`
              : t("CropPlanningCalculators.AutoFill")}
          </Text>
        </View>

        {/* Plant Spacing Auto Fill */}
        <Text className="text-sm font-semibold text-gray-900 mb-2 mt-6">
          {t("CropPlanningCalculators.PlantSpacing")}
        </Text>
        <View className="bg-[#F4F4F4] rounded-full px-4 py-4">
          <Text
            className={`text-sm ${
              selectedCrop ? "text-[#287097]" : "text-gray-400"
            }`}
          >
            {selectedCrop
              ? `${selectedCrop.plantSpace} cm`
              : t("CropPlanningCalculators.AutoFill")}
          </Text>
        </View>

        {/* Calculate Button */}
        <TouchableOpacity
          onPress={handleCalculate}
          className="bg-[#2D2D2D] rounded-full py-4 items-center mt-10"
          activeOpacity={0.8}
        >
          <Text className="text-white text-base font-bold">
            {t("CropPlanningCalculators.Calculate")}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Crop Selection Modal */}
      <GlobalSearchModal
        visible={cropModalVisible}
        onClose={() => setCropModalVisible(false)}
        title={t("CropPlanningCalculators.SelectCrop")}
        data={crops}
        selectedItems={selectedCropValue ? [selectedCropValue] : []}
        onSelect={handleCropSelect}
        searchPlaceholder={t("CropPlanningCalculators.SearchCrops")}
        noResultsText={t("CropPlanningCalculators.NoCropsFound")}
        multiSelect={false}
        searchKeys={["label"]}
      />

      {/* Unit Selection Modal */}
      <GlobalSearchModal
        visible={unitModalVisible}
        onClose={() => setUnitModalVisible(false)}
        title={t("CropPlanningCalculators.SelectAreaUnit")}
        data={AREA_UNITS}
        selectedItems={[areaUnit]}
        onSelect={handleUnitSelect}
        searchPlaceholder={t("CropPlanningCalculators.SearchUnits")}
        noResultsText={t("CropPlanningCalculators.NoUnitsFound")}
        multiSelect={false}
        searchKeys={["label"]}
        showSearch={false}
      />

      <ResultModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        cropName={selectedCrop?.label || t("CropPlanningCalculators.Answer")}
        cropIcon={selectedCrop?.icon ? { uri: selectedCrop.icon } : undefined}
        resultValue={result.value}
        resultUnit={result.unit}
      />
    </View>
  );
};

export default PlantPopulationCalculatorScreen;
