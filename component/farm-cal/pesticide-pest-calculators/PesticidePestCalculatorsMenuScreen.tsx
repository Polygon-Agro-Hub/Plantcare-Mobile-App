import React from "react";
import { View, ScrollView } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/types";
import CustomHeader from "../../common/CustomHeader";
import { useTranslation } from "react-i18next";
import CalculatorButton from "../common/CalculatorButton";

type PesticidePestCalculatorsNavigationProp = StackNavigationProp<
  RootStackParamList,
  "PesticidePestCalculatorsMenu"
>;

interface PesticidePestCalculatorsProps {
  navigation: PesticidePestCalculatorsNavigationProp;
}

interface CalculatorItem {
  id: string;
  label: string;
  icon: any;
  screen: string;
}

const PesticidePestCalculatorsMenuScreen: React.FC<
  PesticidePestCalculatorsProps
> = ({ navigation }) => {
  const { t } = useTranslation();

  const calculatorItems: CalculatorItem[] = [
    {
      id: "pesticide_mixing",
      label: t("PesticidePestCalculators.PesticideMixing"),
      icon: require("@/assets/images/farm-cal/pesticide-pest-calculators/pesticide-mixing.webp"),
      screen: "PesticideMixingCalculatorScreen",
    },
    {
      id: "ipm_threshold",
      label: t("PesticidePestCalculators.IPMThreshold"),
      icon: require("@/assets/images/farm-cal/pesticide-pest-calculators/ipm-threshold.webp"),
      screen: "IPMThresholdCalculatorScreen",
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
        title={t("PesticidePestCalculators.Pesticide&PestCalculators")}
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

export default PesticidePestCalculatorsMenuScreen;
