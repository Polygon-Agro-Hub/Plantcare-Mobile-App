import React from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";

type RootStackParamList = {
  FirstLoginProView: undefined;
};

const AddNewFarmFirst: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t, i18n } = useTranslation();
  return (
    <View className="bg-[#093832] flex-1">
      <View className="w-full h-[50%] bg-[#093832] overflow-hidden top-0 left-0 right-0">
        <Image
          source={require("../../../assets/images/farms/farm-welcome.webp")}
          className="w-full h-full object-cover absolute"
          style={{ borderBottomLeftRadius: 90, borderBottomRightRadius: 90 }}
        />
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 60 }}
        className="bg-[#093832]"
        showsHorizontalScrollIndicator={false}
      >
        <View className="text-center justify-center items-center p-6 mt-2">
          <Text className="text-2xl w-[90%] text-center text-white font-bold mb-4">
            {t("Farms.CreateYourFirstFarmForFree")}
          </Text>
          <View className="w-[85%]">
            <Text className="text-sm text-center text-white mt-2">
              {t("Farms.SimplifyFarmManagementLikeNeverBefore")}
            </Text>
            <Text className="text-sm text-center text-white mt-2">
              {t(
                "Farms.AddNewFarmsAssignManagersAndOverseeOperationsFromASinglePowerfulPlatform",
              )}
            </Text>
            <Text className="text-sm text-center text-white mt-2">
              {t(
                "Farms.DesignedForFarmOwnersWhoWantEfficiencyTransparencyAndGrowthAllInOnePlace",
              )}
            </Text>
          </View>

          <View className="w-full px-6 mt-6">
            <TouchableOpacity
              className="w-full rounded-3xl h-[50px] justify-center items-center bg-white/25 shadow-lg elevation-6"
              onPress={() => navigation.navigate("AddNewFarmBasicDetails" as any)}
            >
              <Text
                className="text-white text-lg font-bold text-center"
                style={{
                  fontSize:
                    i18n.language === "en"
                      ? 18
                      : i18n.language === "si"
                        ? 14
                        : 14,
                }}
              >
                {t("Farms.GetStarted")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AddNewFarmFirst;
