import React from "react";
import {
  View,
  ScrollView,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/types";
import CustomHeader from "../../common/CustomHeader";
import { useTranslation } from "react-i18next";
import CalculatorButton from "../common/CalculatorButton";


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

const CropPlanningCalculatorsMenuScreen: React.FC<CropPlanningProps> = ({
  navigation,
}) => {
  const { t } = useTranslation();

  const calculatorItems: CalculatorItem[] = [
    {
      id: "seed_rate",
      label: t("CropPlanningCalculators.SeedRate"),
      icon: require("../../../assets/images/farm-cal/crop-planning-calculators/seed-rate.webp"),
      screen: "SeedRateCalculatorScreen",
    },
    {
      id: "plant_population",
      label: t("CropPlanningCalculators.PlantPopulation"),
      icon: require("../../../assets/images/farm-cal/crop-planning-calculators/plant-population.webp"),
      screen: "PlantPopulationCalculatorScreen",
    },
    {
      id: "yield_estimation",
      label: t("CropPlanningCalculators.YieldEstimation"),
      icon: require("../../../assets/images/farm-cal/crop-planning-calculators/yield-estimation.webp"),
      screen: "YieldEstimationCalculatorScreen",
    },
    {
      id: "germination_rate",
      label: t("CropPlanningCalculators.GerminationRate"),
      icon: require("../../../assets/images/farm-cal/crop-planning-calculators/germination-rate.webp"),
      screen: "GerminationRateCalculatorScreen",
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

  const rows = chunkArray(calculatorItems, 2);

  return (
    <View className="flex-1 bg-white">
      <CustomHeader
        title={t("CropPlanningCalculators.CropPlanning&YieldCalculators")}
        showBackButton={true}
        navigation={navigation}
        onBackPress={() => navigation.goBack()}
        titleSize={14}
      />

      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} className="flex-row justify-between mb-4">
            {row.map((item) => (
              <CalculatorButton
                key={item.id}
                id={item.id}
                label={item.label}
                icon={item.icon}
                onPress={() => navigation.navigate(item.screen as any)}
                width="48%"
                labelSize={12} 
              />
            ))}

            {row.length === 1 && <View style={{ width: "48%" }} />}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default CropPlanningCalculatorsMenuScreen;