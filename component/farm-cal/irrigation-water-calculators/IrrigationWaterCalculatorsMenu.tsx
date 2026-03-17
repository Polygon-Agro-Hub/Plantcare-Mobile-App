import React from "react";
import { View, ScrollView } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/types";
import CustomHeader from "../../common/CustomHeader";
import { useTranslation } from "react-i18next";
import CalculatorButton from "../common/CalculatorButton";

type IrrigationWaterCalculatorsNavigationProp = StackNavigationProp<
  RootStackParamList,
  "IrrigationWaterCalculatorsMenu"
>;

interface IrrigationWaterCalculatorsProps {
  navigation: IrrigationWaterCalculatorsNavigationProp;
}

interface CalculatorItem {
  id: string;
  label: string;
  icon: any;
  screen: string;
}

const IrrigationWaterCalculatorsMenuScreen: React.FC<
  IrrigationWaterCalculatorsProps
> = ({ navigation }) => {
  const { t } = useTranslation();

  const calculatorItems: CalculatorItem[] = [
    {
      id: "irrigation_water_requirement",
      label: t("IrrigationWaterCalculators.IrrigationWaterRequirement"),
      icon: require("@/assets/images/farm-cal/irrigation-water-calculators/irrigation-water-requirement.webp"),
      screen: "",
    },
    {
      id: "drip_irrigation",
      label: t("IrrigationWaterCalculators.DripIrrigation"),
      icon: require("@/assets/images/farm-cal/irrigation-water-calculators/drip-irrigation.webp"),
      screen: "DripIrrigationCalculatorScreen",
    },
    {
      id: "sprinkler_system",
      label: t("IrrigationWaterCalculators.SprinklerSystem"),
      icon: require("@/assets/images/farm-cal/irrigation-water-calculators/sprinkler-system.webp"),
      screen: "SprinklerSystemCalculatorScreen",
    },
    {
      id: "evapotranspiration",
      label: t("IrrigationWaterCalculators.Evapotranspiration"),
      icon: require("@/assets/images/farm-cal/irrigation-water-calculators/evapotranspiration.webp"),
      screen: "",
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
        title={t("IrrigationWaterCalculators.Title")}
        showBackButton={true}
        navigation={navigation}
        onBackPress={() => navigation.goBack()}
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
              />
            ))}

            {row.length === 1 && <View style={{ width: "48%" }} />}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default IrrigationWaterCalculatorsMenuScreen;
