import React from "react";
import { View, ScrollView } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/types";
import CustomHeader from "../../common/CustomHeader";
import { useTranslation } from "react-i18next";
import CalculatorButton from "../common/CalculatorButton";

type PostHarvestStorageCalculatorsNavigationProp = StackNavigationProp<
  RootStackParamList,
  "PostHarvestStorageCalculatorsMenu"
>;

interface PostHarvestStorageCalculatorsProps {
  navigation: PostHarvestStorageCalculatorsNavigationProp;
}

interface CalculatorItem {
  id: string;
  label: string;
  icon: any;
  screen: string;
}

const PostHarvestStorageCalculatorsMenuScreen: React.FC<
  PostHarvestStorageCalculatorsProps
> = ({ navigation }) => {
  const { t } = useTranslation();

  const calculatorItems: CalculatorItem[] = [
    {
      id: "grain_drying",
      label: t("PostHarvestStorageCalculators.GrainDrying"),
      icon: require("@/assets/images/farm-cal/post-harvest-storage-calculators/grain-drying.webp"),
      screen: "GrainDryingCalculator",
    },
    {
      id: "cold_storage",
      label: t("PostHarvestStorageCalculators.ColdStorage"),
      icon: require("@/assets/images/farm-cal/post-harvest-storage-calculators/cold-storage.webp"),
      screen: "ColdStorageCalculator",
    },
    {
      id: "shelf_life",
      label: t("PostHarvestStorageCalculators.ShelfLife"),
      icon: require("@/assets/images/farm-cal/post-harvest-storage-calculators/shelf-life.webp"),
      screen: "ShelfLifeCalculator",
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
        title={t("PostHarvestStorageCalculators.PostHarvestStorageCalculators")}
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

export default PostHarvestStorageCalculatorsMenuScreen;
