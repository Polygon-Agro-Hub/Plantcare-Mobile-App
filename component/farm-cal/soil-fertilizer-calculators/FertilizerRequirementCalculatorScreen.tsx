import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/types";
import CalculatorHeader from "../common/CalculatorHeader";
import { Keyboard } from "react-native";
import GlobalSearchModal from "@/component/common/GlobalSearchModal";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { environment } from "@/environment/environment";

type FertilizerRequirementNavigationProp = StackNavigationProp<
  RootStackParamList,
  "FertilizerRequirementCalculator"
>;

interface FertilizerRequirementProps {
  navigation: FertilizerRequirementNavigationProp;
}

interface CropGroup {
  id: number;
  cropNameEnglish: string;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  image: string | null;
}

interface CropItem {
  label: string;
  value: string;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  icon: string | null;
}

interface NPKResult {
  N: string;
  P: string;
  K: string;
}

const AREA_UNITS = [
  { label: "Hectares", value: "Hectares" },
  { label: "Acres", value: "Acres" },
];

const FertilizerRequirementCalculatorScreen: React.FC<
  FertilizerRequirementProps
> = ({ navigation }) => {
  const [crops, setCrops] = useState<CropItem[]>([]);
  const [cropsLoading, setCropsLoading] = useState(false);

  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [unitModalVisible, setUnitModalVisible] = useState(false);
  const [selectedCropValue, setSelectedCropValue] = useState<string | null>(
    null,
  );
  const [area, setArea] = useState("");
  const [areaUnit, setAreaUnit] = useState("Hectares");
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [npkResult, setNpkResult] = useState<NPKResult>({
    N: "",
    P: "",
    K: "",
  });
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
                (item.nitrogen > 0 ||
                  item.phosphorus > 0 ||
                  item.potassium > 0),
            )
            .map((item: CropGroup) => ({
              label: item.cropNameEnglish,
              value: item.cropNameEnglish,
              nitrogen: Number(item.nitrogen),
              phosphorus: Number(item.phosphorus),
              potassium: Number(item.potassium),
              icon: item.image ?? null,
            }));
          setCrops(mapped);
        }
      } catch (error) {
        console.error("Error fetching crop groups:", error);
        Alert.alert("Error", "Failed to load crops. Please try again.");
      } finally {
        setCropsLoading(false);
      }
    };

    fetchCrops();
  }, []);

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
      Alert.alert("Invalid Input", "Area must be greater than 0.");
      return;
    }

    const areaInHectares =
      areaUnit === "Hectares" ? areaNum : areaNum * 0.404686;

    const N = selectedCrop.nitrogen * areaInHectares;
    const P = selectedCrop.phosphorus * areaInHectares;
    const K = selectedCrop.potassium * areaInHectares;

    const fmt = (val: number) =>
      val.toLocaleString("en-US", {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      });

    setNpkResult({ N: fmt(N), P: fmt(P), K: fmt(K) });
    setResultModalVisible(true);
  };

  const handleCropSelect = (selectedValues: string[]) => {
    setSelectedCropValue(selectedValues[0] || null);
  };

  const handleUnitSelect = (selectedValues: string[]) => {
    setAreaUnit(selectedValues[0] || "Hectares");
  };

  const getSelectedCropLabel = () => {
    if (!selectedCropValue) return "--Select Crop--";
    const crop = crops.find((c) => c.value === selectedCropValue);
    return crop ? crop.label : "--Select Crop--";
  };

  const getSelectedUnitLabel = () => {
    const unit = AREA_UNITS.find((u) => u.value === areaUnit);
    return unit ? unit.label : "Hectares";
  };

  const isFormInvalid =
    showValidation && (!selectedCrop || !area || parseFloat(area) <= 0);

  return (
    <View className="flex-1 bg-white">
      <CalculatorHeader
        title="Fertilizer Requirement Calculator"
        icon={require("@/assets/images/farm-cal/soil-fertilizer-calculators/fertilizer-icon.webp")}
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
            Please fill all required fields!
          </Text>
        )}

        {/* Crop Selection */}
        <Text className="text-sm font-semibold text-gray-900 mb-2">Crop *</Text>
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
          Area to be planted *
        </Text>
        <View className="flex-row items-center" style={{ gap: 8 }}>
          <TextInput
            value={area}
            onChangeText={handleAreaChange}
            placeholder="--Type Here--"
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

        {/* Recommended NPK Ratio Auto Fill */}
        <Text className="text-sm font-semibold text-gray-900 mb-2 mt-6 ">
          Recommended NPK Ratio
        </Text>
        <View className="bg-[#F4F4F4] rounded-2xl px-4 py-4">
          {selectedCrop ? (
            <View>
              <Text
                style={{ marginBottom: 4 }}
                className="text-sm text-[#287097]"
              >
                N: {selectedCrop.nitrogen}kg/ha
              </Text>
              <Text
                style={{ marginBottom: 4 }}
                className="text-sm text-[#287097]"
              >
                P: {selectedCrop.phosphorus}kg/ha
              </Text>
              <Text className="text-sm text-[#287097]">
                K: {selectedCrop.potassium}kg/ha
              </Text>
            </View>
          ) : (
            <Text className="text-sm text-gray-400">--Auto Fill--</Text>
          )}
        </View>

        {/* Calculate Button */}
        <TouchableOpacity
          onPress={handleCalculate}
          className="bg-[#2D2D2D] rounded-full py-4 items-center mt-10"
          activeOpacity={0.8}
        >
          <Text className="text-white text-base font-bold">Calculate</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Crop Selection Modal */}
      <GlobalSearchModal
        visible={cropModalVisible}
        onClose={() => setCropModalVisible(false)}
        title="Select Crop"
        data={crops}
        selectedItems={selectedCropValue ? [selectedCropValue] : []}
        onSelect={handleCropSelect}
        searchPlaceholder="Search crops..."
        noResultsText="No crops found"
        multiSelect={false}
        searchKeys={["label"]}
      />

      {/* Unit Selection Modal */}
      <GlobalSearchModal
        visible={unitModalVisible}
        onClose={() => setUnitModalVisible(false)}
        title="Select Area Unit"
        data={AREA_UNITS}
        selectedItems={[areaUnit]}
        onSelect={handleUnitSelect}
        searchPlaceholder="Search units..."
        noResultsText="No units found"
        multiSelect={false}
        searchKeys={["label"]}
        showSearch={false}
      />

      {/* NPK Result Modal - Updated to match ResultModal styling */}
      <Modal
        transparent
        animationType="fade"
        visible={resultModalVisible}
        onRequestClose={() => setResultModalVisible(false)}
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
                onPress={() => setResultModalVisible(false)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full items-center justify-center"
              >
                <Ionicons name="close-circle" size={30} color="#C7C9CB" />
              </TouchableOpacity>

              {/* Crop Image */}
              {selectedCrop?.icon && (
                <Image
                  source={{ uri: selectedCrop.icon }}
                  className="w-24 h-24 mb-2"
                  resizeMode="contain"
                />
              )}

              {/* Crop Name */}
              <Text className="text-lg font-semibold text-gray-900 mt-1">
                {selectedCrop?.label || ""}
              </Text>

              {/* NPK Values - Now styled like the ResultModal */}
              <View className="w-full mt-4">
                {/* N Row */}
                <View className="flex-row items-baseline justify-center mb-2">
                  <Text className="text-3xl font-extrabold text-gray-900">
                    N : {npkResult.N}
                  </Text>
                  <Text className="text-3xl text-[#287097] ml-2">kg</Text>
                </View>

                {/* P Row */}
                <View className="flex-row items-baseline justify-center mb-2">
                  <Text className="text-3xl font-extrabold text-gray-900">
                    P : {npkResult.P}
                  </Text>
                  <Text className="text-3xl text-[#287097] ml-2">kg</Text>
                </View>

                {/* K Row */}
                <View className="flex-row items-baseline justify-center">
                  <Text className="text-3xl font-extrabold text-gray-900">
                    K : {npkResult.K}
                  </Text>
                  <Text className="text-3xl text-[#287097] ml-2">kg</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default FertilizerRequirementCalculatorScreen;
