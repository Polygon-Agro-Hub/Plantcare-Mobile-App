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

type CompostMixingNavigationProp = StackNavigationProp<
    RootStackParamList,
    "CompostMixingCalculator"
>;

interface CompostMixingProps {
    navigation: CompostMixingNavigationProp;
}

const CompostMixingCalculatorScreen: React.FC<CompostMixingProps> = ({
    navigation,
}) => {
    const [greenWaste, setGreenWaste] = useState("");
    const [brownWaste, setBrownWaste] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [result, setResult] = useState({ value: "", unit: "" });
    const [showValidation, setShowValidation] = useState(false);

    const dismissKeyboard = () => Keyboard.dismiss();

    const handleGreenWasteChange = (text: string) => {
        const cleaned = text.replace(/[^0-9.]/g, "");
        const parts = cleaned.split(".");
        if (parts.length > 2) return;
        if (parts[1] && parts[1].length > 2) return;
        setGreenWaste(cleaned);
    };

    const handleBrownWasteChange = (text: string) => {
        const cleaned = text.replace(/[^0-9.]/g, "");
        const parts = cleaned.split(".");
        if (parts.length > 2) return;
        if (parts[1] && parts[1].length > 2) return;
        setBrownWaste(cleaned);
    };

    const handleCalculate = () => {
        setShowValidation(true);
        dismissKeyboard();

        if (!greenWaste || !brownWaste) return;

        const G = parseFloat(greenWaste);
        const B = parseFloat(brownWaste);

        if (isNaN(G) || G <= 0) {
            Alert.alert("Invalid Input", "Green waste percentage must be greater than 0.");
            return;
        }

        if (isNaN(B) || B <= 0) {
            Alert.alert("Invalid Input", "Brown waste percentage must be greater than 0.");
            return;
        }

        const ratioB = (B / G).toFixed(2);
        const ratioG = (G / G).toFixed(2); 

        const fmt = (val: string) => parseFloat(val).toString();

        setResult({ value: `${fmt(ratioB)} : ${fmt(ratioG)}`, unit: "" });
        setModalVisible(true);
    };

    const isFormInvalid = showValidation && (!greenWaste || !brownWaste);

    return (
        <View className="flex-1 bg-white">
            <CalculatorHeader
                title="Compost Mixing Calculator"
                icon={require("@/assets/images/farm-cal/soil-fertilizer-calculators/Compost_UI.webp")}
                onBack={() => navigation.goBack()}
            />

            <ScrollView
                className="flex-1 px-6 mt-5"
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {isFormInvalid && (
                    <Text className="text-[#287097] text-sm font-medium mb-5">
                        Please fill all required fields!
                    </Text>
                )}

                {/* Green Waste */}
                <Text className="text-sm font-semibold text-gray-900 mb-2">
                    Green waste percentage (%) *
                </Text>
                <TextInput
                    value={greenWaste}
                    onChangeText={handleGreenWasteChange}
                    placeholder="--Type Here--"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="decimal-pad"
                    className="bg-[#F4F4F4] rounded-full px-4 py-4 text-sm text-gray-900"
                />

                {/* Brown Waste */}
                <Text className="text-sm font-semibold text-gray-900 mb-2 mt-6">
                    Brown waste percentage (%) *
                </Text>
                <TextInput
                    value={brownWaste}
                    onChangeText={handleBrownWasteChange}
                    placeholder="--Type Here--"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="decimal-pad"
                    className="bg-[#F4F4F4] rounded-full px-4 py-4 text-sm text-gray-900"
                />

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
                cropName="Ideal Ratio (B:G)"
                resultValue={result.value}
                resultUnit={result.unit}
            />
        </View>
    );
};

export default CompostMixingCalculatorScreen;