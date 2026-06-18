import React, { useState, useEffect, useMemo } from "react";
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

type YieldEstimationNavigationProp = StackNavigationProp<
  RootStackParamList,
  "YieldEstimationCalculator"
>;

interface YieldEstimationProps {
  navigation: YieldEstimationNavigationProp;
}

interface CropGroup {
  id: number;
  cropNameEnglish: string;
  cropNameSinhala: string;
  cropNameTamil: string;
  AvgYield: number;
  rowSpace: number;
  plantSpace: number;
  image: string | null;
}

interface CropItem {
  label: string;
  value: string;
  nameEnglish: string;
  nameSinhala: string;
  nameTamil: string;
  avgYield: number;
  rowSpace: number;
  plantSpace: number;
  icon: string | null;
}

const AREA_UNITS = [
  { label: "Hectares", value: "Hectares" },
  { label: "Acres", value: "Acres" },
];

const YieldEstimationCalculatorScreen: React.FC<YieldEstimationProps> = ({
  navigation,
}) => {
  const { t, i18n } = useTranslation();
  const [rawCrops, setRawCrops] = useState<CropItem[]>([]);
  const [cropsLoading, setCropsLoading] = useState(false);

  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [unitModalVisible, setUnitModalVisible] = useState(false);
  const [selectedCropValue, setSelectedCropValue] = useState<string | null>(
    null,
  );
  const [area, setArea] = useState("");
  const [areaUnit, setAreaUnit] = useState("Hectares");
  const [modalVisible, setModalVisible] = useState(false);
  const [result, setResult] = useState({ value: "", unit: "kg" });
  const [showValidation, setShowValidation] = useState(false);

  const crops = useMemo<CropItem[]>(() => {
    const lang = i18n.language;
    return rawCrops.map((c) => ({
      ...c,
      label:
        lang === "si"
          ? c.nameSinhala
          : lang === "ta"
            ? c.nameTamil
            : c.nameEnglish,
    }));
  }, [rawCrops, i18n.language]);

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
                item.AvgYield > 0 &&
                item.rowSpace > 0 &&
                item.plantSpace > 0,
            )
            .map((item: CropGroup) => ({
              label: item.cropNameEnglish,
              value: item.cropNameEnglish,
              nameEnglish: item.cropNameEnglish,
              nameSinhala: item.cropNameSinhala || item.cropNameEnglish,
              nameTamil: item.cropNameTamil || item.cropNameEnglish,
              avgYield: Number(item.AvgYield),
              rowSpace: Number(item.rowSpace),
              plantSpace: Number(item.plantSpace),
              icon: item.image ?? null,
            }));
          setRawCrops(mapped);
        }
      } catch (error) {
        console.error("Error fetching crop groups:", error);
        Alert.alert(
          t("Main.Error"),
          t("CropPlanningCalculators.FailedToLoadCropsPleaseTryAgain"),
        );
      } finally {
        setCropsLoading(false);
      }
    };

    fetchCrops();
  }, [t]);

  const getPlantsPerHectare = (crop: CropItem): number => {
    const rowM = crop.rowSpace / 100;
    const plantM = crop.plantSpace / 100;
    return 10_000 / (rowM * plantM);
  };

  const handleAreaChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 4) return;
    setArea(cleaned);
  };

  const handleCalculate = () => {
    setShowValidation(true);
    if (!selectedCrop || !area) return;

    const areaNum = parseFloat(area);
    if (isNaN(areaNum) || areaNum <= 0) {
      Alert.alert(
        t("CropPlanningCalculators.InvalidInput"),
        t("CropPlanningCalculators.AreaMustBeGreaterThan0"),
      );
      return;
    }

    const areaInHectares =
      areaUnit === "Hectares" ? areaNum : areaNum * 0.404686;

    const PP = getPlantsPerHectare(selectedCrop);
    const YP = selectedCrop.avgYield;
    const estimatedYield = PP * YP * areaInHectares;

    const formatted = estimatedYield.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

    setResult({ value: formatted, unit: "kg" });
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
        title={`${t("CropPlanningCalculators.YieldEstimation")} ${t("Calculator.calculator")}`}
        icon={require("@/assets/images/farm-cal/crop-planning-calculators/yield-estimation-icon.webp")}
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
            {t("Main.PleaseFillAllRequiredFields")}
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
          className="bg-[#F4F4F4] rounded-3xl px-4 h-[50px] flex-row justify-between items-center"
          disabled={cropsLoading}
        >
          {cropsLoading ? (
            <ActivityIndicator size="small" color="#287097" />
          ) : (
            <>
              <Text
                className={`text-sm ${selectedCropValue ? "text-gray-900" : "text-gray-400"}`}
              >
                {getSelectedCropLabel()}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
            </>
          )}
        </TouchableOpacity>

        {/* Area Input + Unit Selection */}
        <Text className="text-sm font-semibold text-gray-900 mb-2 mt-6">
          {t("CropPlanningCalculators.Area")} *
        </Text>
        <View className="flex-row gap-2 items-center">
          <TextInput
            value={area}
            onChangeText={handleAreaChange}
            placeholder={t("Main.TypeHere")}
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
            className="bg-[#F4F4F4] rounded-3xl px-4 h-[50px] flex-row justify-between items-center"
          >
            <Text className="text-sm text-gray-900">
              {getSelectedUnitLabel()}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Row Spacing Auto Fill */}
        <Text className="text-sm font-semibold text-gray-900 mb-2 mt-6">
          {t("CropPlanningCalculators.RowSpacingCm")}
        </Text>
        <View className="bg-[#F4F4F4] rounded-3xl h-[50px] px-4 justify-center">
          <Text
            className={`text-sm ${selectedCrop ? "text-[#287097]" : "text-gray-400"}`}
          >
            {selectedCrop
              ? `${selectedCrop.rowSpace} cm`
              : t("CropPlanningCalculators.AutoFill")}
          </Text>
        </View>

        {/* Plant Spacing Auto Fill */}
        <Text className="text-sm font-semibold text-gray-900 mb-2 mt-6">
          {t("CropPlanningCalculators.PlantSpacingCm")}
        </Text>
        <View className="bg-[#F4F4F4] rounded-3xl h-[50px] px-4 justify-center">
          <Text
            className={`text-sm ${selectedCrop ? "text-[#287097]" : "text-gray-400"}`}
          >
            {selectedCrop
              ? `${selectedCrop.plantSpace} cm`
              : t("CropPlanningCalculators.AutoFill")}
          </Text>
        </View>

        {/* Average Yield Per Plant Auto Fill */}
        <Text className="text-sm font-semibold text-gray-900 mb-2 mt-6">
          {t("CropPlanningCalculators.AverageYieldPerPlantKg")}
        </Text>
        <View className="bg-[#F4F4F4] rounded-3xl h-[50px] px-4 justify-center">
          <Text
            className={`text-sm ${selectedCrop ? "text-[#287097]" : "text-gray-400"}`}
          >
            {selectedCrop
              ? `${selectedCrop.avgYield} kg`
              : t("CropPlanningCalculators.AutoFill")}
          </Text>
        </View>

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

      {/* Crop Selection Modal */}
      <GlobalSearchModal
        visible={cropModalVisible}
        onClose={() => setCropModalVisible(false)}
        title={t("CropPlanningCalculators.SelectCrop")}
        data={crops}
        selectedItems={selectedCropValue ? [selectedCropValue] : []}
        onSelect={handleCropSelect}
        searchPlaceholder={t("CropPlanningCalculators.SearchCrops...")}
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
        searchPlaceholder={t("CropPlanningCalculators.SearchUnits...")}
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

export default YieldEstimationCalculatorScreen;
