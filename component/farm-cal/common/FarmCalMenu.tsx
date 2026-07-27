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
import { useTranslation } from "react-i18next";
import { Entypo } from "@expo/vector-icons";

type FarmCalMenuNavigationProp = StackNavigationProp<
  RootStackParamList,
  "FarmCalMenu"
>;

interface FarmCalMenuProps {
  navigation: FarmCalMenuNavigationProp;
}

interface CalculatorItem {
  id: string;
  labelKey: string;
  icon: any;
  screen: string;
}

const calculatorItems: CalculatorItem[] = [
  {
    id: "crop",
    labelKey: "CropPlanningCalculators.CropPlanning&YieldCalculators",
    icon: require("@/assets/images/farm-cal/menu/crop-planning.webp"),
    screen: "CropPlanningCalculatorsMenu",
  },
  {
    id: "irrigation",
    labelKey: "IrrigationWaterCalculators.Irrigation&WaterCalculators",
    icon: require("@/assets/images/farm-cal/menu/irrigation-water.webp"),
    screen: "IrrigationWaterCalculatorsMenu",
  },
  {
    id: "soil",
    labelKey: "SoilFertilizerCalculators.Soil&FertilizerCalculators",
    icon: require("@/assets/images/farm-cal/menu/soil.webp"),
    screen: "SoilFertilizerCalculatorsMenu",
  },
  // {
  //   id: "pesticide",
  //   labelKey: "PesticidePestCalculators.Pesticide&PestCalculators",
  //   icon: require("@/assets/images/farm-cal/menu/pesticide.webp"),
  //   screen: "PesticidePestCalculatorsMenu",
  // },
  // {
  //   id: "economic",
  //   labelKey: "EconomicCostCalendars.Economic&CostCalendars",
  //   icon: require("@/assets/images/farm-cal/menu/economic.webp"),
  //   screen: "EconomicCostCalendarsMenu",
  // },
  // {
  //   id: "weather",
  //   labelKey: "WeatherClimateCalculators.Weather&ClimateCalculators",
  //   icon: require("@/assets/images/farm-cal/menu/weather.webp"),
  //   screen: "WeatherClimateCalculatorsMenu",
  // },
  // {
  //   id: "postharvest",
  //   labelKey: "PostHarvestStorageCalculators.PostHarvestStorageCalculators",
  //   icon: require("@/assets/images/farm-cal/menu/post-harvest.webp"),
  //   screen: "PostHarvestStorageCalculatorsMenu",
  // },
];

const FarmCalMenuScreen: React.FC<FarmCalMenuProps> = ({ navigation }) => {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-white">
      <CustomHeader
        title={t("TransactionList.FarmCal")}
        showBackButton={true}
        navigation={navigation}
        onBackPress={() => navigation.goBack()}
      />
      {/* List */}
      <ScrollView
        className="flex-1 px-6 pt-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {calculatorItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            className="flex-row items-center bg-white rounded-2xl px-4 py-4 mb-4"
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
              {t(item.labelKey)}
            </Text>

            <Entypo name="chevron-right" size={25} color={"black"} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default FarmCalMenuScreen;
