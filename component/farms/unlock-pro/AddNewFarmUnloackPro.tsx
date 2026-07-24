import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/component/types/types";

const AddNewFarmUnloackPro: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-white justify-center items-center p-6">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className=""
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center items-center">
          <Image
            source={require("../../../assets/images/farms/gradient-trophy.webp")}
            className="w-64 h-64 object-cover"
          />

          <View className="text-center justify-center items-center p-2">
            <View className="flex-row items-center justify-center gap-2">
              <Text className="text-xl font-bold text-black">
                {t("Farms.Upgrade")}
              </Text>
              <Text className="text-base text-[#E2BE00] font-semibold bg-[#FFF5BD] p-1 px-6 rounded-md">
                {t("Farms.Pro")}
              </Text>
            </View>

            <Text className="mt-6 text-lg text-black text-center  ">
              {t(
                "Farms.PleaseUpgradeToProMembershipToAccessAllTheFeatures",
              )}
            </Text>

            <View className="mt-8 justify-center items-center w-[90%]">
              <View className="">
                <Text className="text-base text-black font-bold">
                  • {t("Farms.CreateUnlimitedFarms")}
                </Text>
                <Text className="text-base text-black mt-1 ml-3">
                  {t("Farms.ManageAsManyFarmsAsYouNeed")}
                  <Text>
                    {"\n"}
                    {t("Farms.NoLimits&NoRestrictions")}
                  </Text>
                </Text>

                <Text className="text-base text-black font-bold mt-8">
                  • {t("Farms.UnlimitedCropCalendars")}
                </Text>
                <Text className="text-base text-black mt-1 ml-3">
                  {t(
                    "Farms.PlanTrackAndOptimizeAllYourCropCyclesWithoutBoundaries",
                  )}
                </Text>
              </View>
            </View>
          </View>
          <View className="w-full px-6">
            <LinearGradient
              className="w-full rounded-3xl h-[50px] mt-10 shadow-lg elevation-6 mb-10 overflow-hidden"
              colors={["#FDCF3F", "#FEE969"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <TouchableOpacity
                className="w-full h-full justify-center items-center"
                onPress={() => navigation.navigate("UnLockProRenew" as any)}
              >
                <Text className="text-[#7E5E00] text-lg font-semibold">
                  {t("Farms.UnlockPro")}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          <TouchableOpacity
            className="absolute top-0 right-0 bg-gray-200 px-2  rounded-full shadow-lg"
            onPress={() =>
              navigation.navigate("Main", {
                screen: "AddFarmList",
              })
            }
          >
            <Text className="text-lg  text-white">X</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default AddNewFarmUnloackPro;
