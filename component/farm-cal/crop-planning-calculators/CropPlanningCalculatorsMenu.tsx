import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/types";
import CustomHeader from "../../common/CustomHeader";

type CropPlanningNavigationProp = StackNavigationProp<
  RootStackParamList,
  "CropPlanningCalculatorsMenu"
>;

interface CropPlanningProps {
  navigation: CropPlanningNavigationProp;
}

interface CalculatorItem {
  id: string;
  label: string;
  icon: any;
  screen: string;
}

const calculatorItems: CalculatorItem[] = [
  {
    id: "seed_rate",
    label: "Seed Rate",
    icon: require("../../../assets/images/farm-cal/crop-planning/SeedRate.webp"),
    screen: "SeedRateCalculatorScreen",
  },
  {
    id: "plant_population",
    label: "Plant Population",
    icon: require("../../../assets/images/farm-cal/crop-planning/PlantPopulation.webp"),
    screen: "PlantPopulationCalculator",
  },
  {
    id: "yield_estimation",
    label: "Yield Estimation",
    icon: require("../../../assets/images/farm-cal/crop-planning/YieldEstimation.webp"),
    screen: "YieldEstimationCalculator",
  },
  {
    id: "germination_rate",
    label: "Germination Rate",
    icon: require("../../../assets/images/farm-cal/crop-planning/GerminationRate.webp"),
    screen: "GerminationRateCalculator",
  },
];

const chunkArray = (
  arr: CalculatorItem[],
  size: number,
): CalculatorItem[][] => {
  const result: CalculatorItem[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

const CropPlanningCalculatorsMenuScreen: React.FC<CropPlanningProps> = ({
  navigation,
}) => {
  const rows = chunkArray(calculatorItems, 2);

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <CustomHeader
        title="Crop Planning & Yield Calculators"
        showBackButton={true}
        navigation={navigation}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{  paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} className="flex-row justify-between mb-4">
            {row.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => navigation.navigate(item.screen as any)}
                activeOpacity={0.7}
                style={{
                  width: "48%",
                  backgroundColor: "#FFFFFF",
                  borderRadius: 12,
                  padding: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <View
                  style={{
                    width: 100,
                    height: 100,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <Image
                    source={item.icon}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="contain"
                  />
                </View>

                <Text className="text-sm font-medium text-gray-800 text-center">
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}

            {row.length === 1 && <View style={{ width: "48%" }} />}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default CropPlanningCalculatorsMenuScreen;
