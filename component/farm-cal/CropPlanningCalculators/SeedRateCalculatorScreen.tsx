// SeedRateCalculatorScreen.tsx
import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Platform,
    StatusBar,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/types";
import CalculatorHeader from "../common/CalculatorHeader";
import ResultModal from "../common/ResultModal";
import DropDownPicker from "react-native-dropdown-picker";
import { Keyboard } from "react-native";

type SeedRateNavigationProp = StackNavigationProp<RootStackParamList, "SeedRateCalculator">;

interface SeedRateProps {
    navigation: SeedRateNavigationProp;
}

const CROPS: { label: string; value: string; seedRatePerHectare: number; icon: any }[] = [
    {
        label: "Maize",
        value: "Maize",
        seedRatePerHectare: 25,
        icon: require("../../../assets/images/farm-cal/maize.webp"),
    },
];

const AREA_UNITS = [
    { label: "Hectares", value: "Hectares" },
    { label: "Acres", value: "Acres" },
];

const SeedRateCalculatorScreen: React.FC<SeedRateProps> = ({ navigation }) => {
    const [openCrop, setOpenCrop] = useState(false);
    const [openUnit, setOpenUnit] = useState(false);
    const [selectedCropValue, setSelectedCropValue] = useState<string | null>(null);
    const [area, setArea] = useState("");
    const [areaUnit, setAreaUnit] = useState("Hectares");
    const [seedRateDisplay, setSeedRateDisplay] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [result, setResult] = useState({ value: "", unit: "kg" });
    const [showValidation, setShowValidation] = useState(false);

    const selectedCrop = CROPS.find((c) => c.value === selectedCropValue) || null;

    const dismissKeyboard = () => Keyboard.dismiss();

    const dropdownStyle = {
        borderWidth: 1,
        borderColor: "#F4F4F4",
        backgroundColor: "#F4F4F4",
        borderRadius: 30,
        paddingHorizontal: 12,
        paddingVertical: 12,
    };

    const dropdownContainerStyle = {
        borderColor: "#F4F4F4",
        borderWidth: 1,
        backgroundColor: "#F4F4F4",
        maxHeight: 400,
    };

    const modalContentStyle = {
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0,
        backgroundColor: "#fff",
    };

    const updateSeedRateDisplay = (cropValue: string | null, unit: string) => {
        const crop = CROPS.find((c) => c.value === cropValue);
        if (!crop) {
            setSeedRateDisplay("");
            return;
        }
        const rateLabel =
            unit === "Hectares"
                ? `${crop.seedRatePerHectare} kg/ha`
                : `${(crop.seedRatePerHectare * 0.404686).toFixed(2)} kg/acre`;
        setSeedRateDisplay(rateLabel);
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

        const totalSeed = areaInHectares * selectedCrop.seedRatePerHectare;

        const formatted = totalSeed.toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        });

        setResult({ value: formatted, unit: "kg" });
        setModalVisible(true);
    };

    const isFormInvalid =
        showValidation && (!selectedCrop || !area || parseFloat(area) <= 0);

    return (
        <View className="flex-1 bg-white">
            <CalculatorHeader
                title="Seed Rate Calculator"
                icon={require("../../../assets/images/farm-cal/crop-planning/SeedRateUI.webp")}
                onBack={() => navigation.goBack()}
            />

            <ScrollView
                className="flex-1 px-2"
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {isFormInvalid && (
                    <Text className="text-blue-500 text-sm font-medium mb-5">
                        Please fill all required fields!
                    </Text>
                )}

                {/* Crop Dropdown */}
                <Text className="text-sm font-semibold text-gray-900 mb-2">
                    Crop <Text className="text-red-500">*</Text>
                </Text>
                <DropDownPicker
                    open={openCrop}
                    value={selectedCropValue}
                    items={CROPS.map((c) => ({ label: c.label, value: c.value }))}
                    setOpen={(open) => {
                        setOpenCrop(open);
                        setOpenUnit(false);
                    }}
                    setValue={(callback) => {
                        const newVal = typeof callback === "function"
                            ? callback(selectedCropValue)
                            : callback;
                        setSelectedCropValue(newVal);
                        updateSeedRateDisplay(newVal, areaUnit);
                    }}
                    placeholder="--Select Crop--"
                    searchPlaceholder="Type something..."
                    placeholderStyle={{ color: "#6B7280" }}
                    style={dropdownStyle}
                    dropDownContainerStyle={dropdownContainerStyle}
                    textStyle={{ fontSize: 14 }}
                    searchable={true}
                    listMode="MODAL"
                    onOpen={dismissKeyboard}
                    zIndex={3000}
                    modalProps={{
                        animationType: "slide",
                        transparent: false,
                        presentationStyle: "fullScreen",
                        statusBarTranslucent: false,
                    }}
                    modalContentContainerStyle={modalContentStyle}
                />

                {/* Area Input + Unit Dropdown */}
                <Text className="text-sm font-semibold text-gray-900 mb-2 mt-6">
                    Area to be planted <Text className="text-red-500">*</Text>
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
                    <View style={{ width: 140 }}>
                        <DropDownPicker
                            open={openUnit}
                            value={areaUnit}
                            items={AREA_UNITS}
                            setOpen={(open) => {
                                setOpenUnit(open);
                                setOpenCrop(false);
                            }}
                            setValue={(callback) => {
                                const newVal = typeof callback === "function"
                                    ? callback(areaUnit)
                                    : callback;
                                setAreaUnit(newVal);
                                updateSeedRateDisplay(selectedCropValue, newVal);
                            }}
                            placeholderStyle={{ color: "#6B7280" }}
                            style={dropdownStyle}
                            dropDownContainerStyle={dropdownContainerStyle}
                            textStyle={{ fontSize: 14 }}
                            listMode="MODAL"
                            onOpen={dismissKeyboard}
                            zIndex={2000}
                            modalProps={{
                                animationType: "slide",
                                transparent: false,
                                presentationStyle: "fullScreen",
                                statusBarTranslucent: false,
                            }}
                            modalContentContainerStyle={modalContentStyle}
                        />
                    </View>
                </View>

                {/* Seed Rate Auto Fill */}
                <Text className="text-sm font-semibold text-gray-900 mb-2 mt-6">
                    Recommended Seed Rate per unit{"\n"}(kg/ha)
                </Text>
                <View className="bg-[#F4F4F4] rounded-full px-4 py-4">
                    <Text className={`text-sm ${seedRateDisplay ? "text-[#287097]" : "text-gray-400"}`}>
                        {seedRateDisplay || "--Auto Fill--"}
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

            <ResultModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                cropName={selectedCrop?.label || ""}
                cropIcon={selectedCrop?.icon}
                resultValue={result.value}
                resultUnit={result.unit}
            />
        </View>
    );
};

export default SeedRateCalculatorScreen;