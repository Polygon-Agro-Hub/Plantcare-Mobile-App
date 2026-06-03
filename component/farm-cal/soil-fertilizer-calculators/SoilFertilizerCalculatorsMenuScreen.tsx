import React from "react";
import { View, ScrollView } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/types";
import CustomHeader from "../../common/CustomHeader";
import { useTranslation } from "react-i18next";
import CalculatorButton from "../common/CalculatorButton";

type SoilFertilizerCalculatorsNavigationProp = StackNavigationProp<
  RootStackParamList,
  "SoilFertilizerCalculatorsMenu"
>;

interface SoilFertilizerCalculatorsProps {
  navigation: SoilFertilizerCalculatorsNavigationProp;
}

interface CalculatorItem {
  id: string;
  label: string;
  icon: any;
  screen: string;
}

const SoilFertilizerCalculatorsMenuScreen: React.FC<
  SoilFertilizerCalculatorsProps
> = ({ navigation }) => {
  const { t } = useTranslation();

  const calculatorItems: CalculatorItem[] = [
    {
      id: "fertilizer",
      label: t("SoilFertilizerCalculators.Fertilizer"),
      icon: require("@/assets/images/farm-cal/soil-fertilizer-calculators/fertilizer.webp"),
      screen: "FertilizerRequirementCalculatorScreen",
    },
    {
      id: "npk_ratio",
      label: t("SoilFertilizerCalculators.NPKRatio"),
      icon: require("@/assets/images/farm-cal/soil-fertilizer-calculators/npk-ratio.webp"),
      screen: "NPKRatioCalculatorScreen",
    },
    {
      id: "lime_requirement",
      label: t("SoilFertilizerCalculators.LimeRequirement"),
      icon: require("@/assets/images/farm-cal/soil-fertilizer-calculators/lime-requirement.webp"),
      screen: "LimeRequirementCalculatorScreen",
    },
    {
      id: "compost_mixing",
      label: t("SoilFertilizerCalculators.CompostMixing"),
      icon: require("@/assets/images/farm-cal/soil-fertilizer-calculators/compost-mixing.webp"),
      screen: "CompostMixingCalculatorScreen",
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
        title={t("SoilFertilizerCalculators.Soil&FertilizerCalculators")}
        showBackButton={true}
        navigation={navigation}
        onBackPress={() => navigation.goBack()}
        titleSize={14}
      />

      <ScrollView
        className="flex-1 px-6 pt-4"
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

export default SoilFertilizerCalculatorsMenuScreen;
