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
    AvgYield: number;
    rowSpace: number;
    plantSpace: number;
    image: string | null;
}

interface CropItem {
    label: string;
    value: string;
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
    const [crops, setCrops] = useState<CropItem[]>([]);
    const [cropsLoading, setCropsLoading] = useState(false);

    const [cropModalVisible, setCropModalVisible] = useState(false);
    const [unitModalVisible, setUnitModalVisible] = useState(false);
    const [selectedCropValue, setSelectedCropValue] = useState<string | null>(null);
    const [area, setArea] = useState("");
    const [areaUnit, setAreaUnit] = useState("Hectares");
    const [modalVisible, setModalVisible] = useState(false);
    const [result, setResult] = useState({ value: "", unit: "kg" });
    const [showValidation, setShowValidation] = useState(false);

    const selectedCrop = crops.find((c) => c.value === selectedCropValue) || null;

    const dismissKeyboard = () => Keyboard.dismiss();

    useEffect(() => {
        const fetchCrops = async () => {
            setCropsLoading(true);
            try {
                const response = await axios.get(
                    `${environment.API_BASE_URL}api/crop/get-all-cropgroups`
                );

                if (response.data.status === "success") {
                    const mapped: CropItem[] = response.data.data
                        .filter(
                            (item: CropGroup) =>
                                item.cropNameEnglish &&
                                item.AvgYield > 0 &&
                                item.rowSpace > 0 &&
                                item.plantSpace > 0
                        )
                        .map((item: CropGroup) => ({
                            label: item.cropNameEnglish,
                            value: item.cropNameEnglish,
                            avgYield: Number(item.AvgYield),
                            rowSpace: Number(item.rowSpace),
                            plantSpace: Number(item.plantSpace),
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
            Alert.alert("Invalid Input", "Area must be greater than 0.");
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
        const newCropValue = selectedValues[0] || null;
        setSelectedCropValue(newCropValue);
    };

    const handleUnitSelect = (selectedValues: string[]) => {
        const newUnit = selectedValues[0] || "Hectares";
        setAreaUnit(newUnit);
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
                title="Yield Estimation Calculator"
                icon={require("@/assets/images/farm-cal/crop-planning-calculators/Yield_UI.webp")}
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
                                className={`text-sm ${selectedCropValue ? "text-gray-900" : "text-gray-400"
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
                    Area *
                </Text>
                <View className="flex-row gap-2 items-center">
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

                {/* Row Spacing Auto Fill */}
                <Text className="text-sm font-semibold text-gray-900 mb-2 mt-6">
                    Row Spacing (cm)
                </Text>
                <View className="bg-[#F4F4F4] rounded-full px-4 py-4">
                    <Text
                        className={`text-sm ${selectedCrop ? "text-[#287097]" : "text-gray-400"
                            }`}
                    >
                        {selectedCrop ? `${selectedCrop.rowSpace} cm` : "--Auto Fill--"}
                    </Text>
                </View>

                {/* Plant Spacing Auto Fill */}
                <Text className="text-sm font-semibold text-gray-900 mb-2 mt-6">
                    Plant Spacing (cm)
                </Text>
                <View className="bg-[#F4F4F4] rounded-full px-4 py-4">
                    <Text
                        className={`text-sm ${selectedCrop ? "text-[#287097]" : "text-gray-400"
                            }`}
                    >
                        {selectedCrop
                            ? `${selectedCrop.plantSpace} cm`
                            : "--Auto Fill--"}
                    </Text>
                </View>

                {/* Average Yield Per Plant Auto Fill */}
                <Text className="text-sm font-semibold text-gray-900 mb-2 mt-6">
                    Average yield per plant (kg)
                </Text>
                <View className="bg-[#F4F4F4] rounded-full px-4 py-4">
                    <Text
                        className={`text-sm ${selectedCrop ? "text-[#287097]" : "text-gray-400"
                            }`}
                    >
                        {selectedCrop ? `${selectedCrop.avgYield} kg` : "--Auto Fill--"}
                    </Text>
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

            <ResultModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                cropName={selectedCrop?.label || ""}
                cropIcon={
                    selectedCrop?.icon ? { uri: selectedCrop.icon } : undefined
                }
                resultValue={result.value}
                resultUnit={result.unit}
            />
        </View>
    );
};

export default YieldEstimationCalculatorScreen;