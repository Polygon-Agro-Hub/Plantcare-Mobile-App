import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
    StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/types";
import CustomHeader from "../common/CustomHeader";
import { useTranslation } from "react-i18next";

type FarmCalNavigationProp = StackNavigationProp<RootStackParamList, "FarmCal">;

interface FarmCalProps {
    navigation: FarmCalNavigationProp;
}

interface CalculatorItem {
    id: string;
    label: string;
    icon: any;
    screen: string;
}

const calculatorItems: CalculatorItem[] = [
    {
        id: "crop",
        label: "Crop Planning & Yield Calculators",
        icon: require("../../assets/images/farm-cal/Crop-Planning.webp"),
        screen: "CropPlanningCalculators",
    },
      {
        id: "irrigation",
        label: "Irrigation & Water Calculators",
        icon: require("../../assets/images/farm-cal/IrrigationWater.webp"),
        screen: "IrrigationCalculators",
      },
      {
        id: "soil",
        label: "Soil & Fertilizer Calculators",
        icon: require("../../assets/images/farm-cal/Soil.webp"),
        screen: "SoilFertilizerCalculators",
      },
      {
        id: "pesticide",
        label: "Pesticide & Pest Calculators",
        icon: require("../../assets/images/farm-cal/Pesticide.webp"),
        screen: "PesticideCalculators",
      },
      {
        id: "economic",
        label: "Economic & Cost Calculators",
        icon: require("../../assets/images/farm-cal/Economic.webp"),
        screen: "EconomicCalculators",
      },
      {
        id: "weather",
        label: "Weather & Climate Calculators",
        icon: require("../../assets/images/farm-cal/Weather.webp"),
        screen: "WeatherCalculators",
      },
      {
        id: "postharvest",
        label: "Post-Harvest Storage Calculators",
        icon: require("../../assets/images/farm-cal/Post-Harvest.webp"),
        screen: "PostHarvestCalculators",
      },
];

const FarmCalScreen: React.FC<FarmCalProps> = ({ navigation }) => {
    const { t } = useTranslation();
    return (
        <View className="flex-1 bg-white">

            <StatusBar barStyle="dark-content" backgroundColor="white" />

            <CustomHeader
                title={t("TransactionList.Farmcal")}
                showBackButton={true}
                navigation={navigation}
                onBackPress={() => navigation.goBack()}
            />
            {/* List */}
            <ScrollView
                className="flex-1 px-5 pt-5"
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {calculatorItems.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        className="flex-row items-center bg-white rounded-2xl px-4 py-4 mb-3"
                        style={{
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.06,
                            shadowRadius: 4,
                            elevation: 2,
                        }}
                        onPress={() => navigation.navigate(item.screen as any)}
                        activeOpacity={0.7}
                    >
                        <View className="w-12 h-12 rounded-xl bg-[white] items-center justify-center overflow-hidden mr-4">
                            <Image
                                source={item.icon}
                                className="w-10 h-10"
                                resizeMode="contain"
                            />
                        </View>

                        <Text className="flex-1 text-sm font-medium text-gray-900 leading-5">
                            {item.label}
                        </Text>

                        <Text className="text-2xl text-gray-400 ml-2">›</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

export default FarmCalScreen;