import { View, Text, Image, TouchableOpacity, BackHandler } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/types";
import { ScrollView } from "react-native-gesture-handler";
import {
  useIsFocused,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import type { RootState } from "@/services/reducxStore";
import LottieView from "lottie-react-native";
import CustomHeader from "../../common/CustomHeader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import axios from "axios";

type FarmFixDashBoardNavigationProp = StackNavigationProp<
  RootStackParamList,
  "FarmFixDashBoard"
>;

interface FarmFixDashBoardProps {
  navigation: FarmFixDashBoardNavigationProp;
}

interface AssetCategory {
  category: string;
  value: string;
}

type RouteParams = {
  farmId: number;
  farmName: string;
};
interface UserData {
  role: string;
}
const icon = require("../../../assets/images/farms/icona.webp");
const icon2 = require("../../../assets/images/farms/icona1.webp");
const icon3 = require("../../../assets/images/farms/icona3.webp");
const icon4 = require("../../../assets/images/farms/icons4.webp");
const icon5 = require("../../../assets/images/farms/icons5.webp");

const FarmFixDashBoard: React.FC<FarmFixDashBoardProps> = ({ navigation }) => {
  const { t } = useTranslation();

  const [assetData, setAssetData] = useState<AssetCategory[]>([
    {
      category: t("FixedAssets.buildings"),
      value: "Building and Infrastructures",
    },
    { category: t("FixedAssets.lands"), value: "Land" },
    {
      category: t("FixedAssets.machineryVehicles"),
      value: "Machine and Vehicles",
    },
    { category: t("FixedAssets.toolsEquipments"), value: "Tools" },
  ]);

  const [loading, setLoading] = useState(false);
  const [assetCounts, setAssetCounts] = useState<Record<string, number>>({});

  const isFocused = useIsFocused();
  const route = useRoute();
  const { farmId, farmName } = route.params as RouteParams;

  const user = useSelector(
    (state: RootState) => state.user.userData,
  ) as UserData | null;

  const categoryMapping = {
    [t("FixedAssets.buildings")]: "Building and Infrastructures",
    [t("FixedAssets.lands")]: "Land",
    [t("FixedAssets.machineryVehicles")]: "Machine and Vehicles",
    [t("FixedAssets.toolsEquipments")]: "Tools",
  };

  const getIcon = (category: string) => {
    switch (category) {
      case t("FixedAssets.buildings"):
        return icon2;
      case t("FixedAssets.lands"):
        return icon4;
      case t("FixedAssets.machineryVehicles"):
        return icon5;
      case t("FixedAssets.toolsEquipments"):
        return icon;
      default:
        return icon3;
    }
  };

  const fetchAllCounts = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        setLoading(false);
        return;
      }

      const categories = [
        "Building and Infrastructures",
        "Land",
        "Machine and Vehicles",
        "Tools",
      ];

      const results = await Promise.all(
        categories.map((cat) =>
          axios
            .get(`${environment.API_BASE_URL}api/auth/fixed-assets/${cat}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
              const allData: any[] = res.data.data ?? [];
              const filtered = allData.filter((item) => item.farmId === farmId);
              return { category: cat, count: filtered.length };
            })
            .catch(() => ({ category: cat, count: 0 })),
        ),
      );

      const counts: Record<string, number> = {};
      results.forEach(({ category, count }) => {
        counts[category] = count;
      });
      setAssetCounts(counts);
    } catch (error) {
      console.error("Error fetching counts:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        user && user.role === "Owner"
          ? navigation.navigate("Main", {
              screen: "FarmDetailsScreen",
              params: { farmId: farmId, farmName: farmName },
            })
          : navigation.goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackPress,
      );

      return () => subscription.remove();
    }, [navigation]),
  );

  useFocusEffect(
    useCallback(() => {
      fetchAllCounts();
    }, [farmId]),
  );

  useEffect(() => {
    const translatedAssetData = [
      {
        category: t("FixedAssets.buildings"),
        value: "Building and Infrastructures",
      },
      { category: t("FixedAssets.lands"), value: "Land" },
      {
        category: t("FixedAssets.machineryVehicles"),
        value: "Machine and Vehicles",
      },
      { category: t("FixedAssets.toolsEquipments"), value: "Tools" },
    ];
    setAssetData(translatedAssetData);
  }, [isFocused]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <LottieView
          source={require("../../../assets/jsons/loader.json")}
          autoPlay
          loop
          style={{ width: 300, height: 300 }}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <CustomHeader
        title={farmName}
        navigation={navigation}
        onBackPress={() =>
          user && user.role === "Owner"
            ? navigation.navigate("Main", {
                screen: "FarmDetailsScreen",
                params: { farmId: farmId, farmName: farmName },
              })
            : navigation.goBack()
        }
      />

      <View className="flex-row ml-8 mr-8 mt-2 justify-center">
        <View className="w-1/2">
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Main", {
                screen: "FarmCurrectAssets",
                params: { farmId: farmId, farmName: farmName },
              })
            }
          >
            <Text className="text-black font-semibold text-center text-lg">
              {t("FixedAssets.currentAssets")}
            </Text>
            <View className="border-t-[2px] border-[#D9D9D9]" />
          </TouchableOpacity>
        </View>
        <View className="w-1/2">
          <TouchableOpacity>
            <Text className="text-black text-center font-semibold text-lg">
              {t("FixedAssets.fixedAssets")}
            </Text>
            <View className="border-t-[2px] border-black" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 250,
          paddingTop: 30,
        }}
        className="h-[50%]"
      >
        {assetData.length > 0 ? (
          <View className="flex-1 items-center gap-y-5 mt-1">
            {assetData.map((asset, index) => (
              <TouchableOpacity
                key={index}
                onPress={() =>
                  navigation.navigate("FarmAssertsFixedView", {
                    category: categoryMapping[asset.category],
                    farmId: farmId,
                    farmName: farmName,
                  } as any)
                }
                activeOpacity={1}
                className="flex-1 w-[90%] items-center"
              >
                <View
                  className="bg-white w-[90%] flex-row h-[50px] rounded-lg justify-between items-center px-4"
                  style={{
                    shadowColor: "gray",
                    shadowOffset: { width: 1, height: 1 },
                    shadowOpacity: 0.8,
                    shadowRadius: 2,
                    elevation: 4,
                  }}
                >
                  <View className="flex-row items-center">
                    <Image
                      source={getIcon(asset.category)}
                      className="w-[24px] h-[24px] mr-2"
                    />
                    <Text className="text-center pl-1">
                      {asset.category.charAt(0).toUpperCase() +
                        asset.category.slice(1)}
                    </Text>
                  </View>

                  <View className="bg-[#353535] rounded-full w-7 h-7 items-center justify-center">
                    <Text className="text-xs font-bold text-[#FFFFFF]">
                      {assetCounts[categoryMapping[asset.category]] ?? 0}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="flex items-center">
            <Text>{t("FixedAssets.No assets available")}</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        className="absolute mb-[4%] bottom-12 right-6 bg-gray-800 w-16 h-16 rounded-full items-center justify-center shadow-lg"
        onPress={() =>
          navigation.navigate("Main", {
            screen: "FarmAddFixAssert",
            params: { farmId: farmId, farmName: farmName },
          })
        }
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 8,
        }}
      >
        <Image
          className="w-[20px] h-[20px]"
          source={require("../../../assets/images/farms/plus-white.webp")}
        />
      </TouchableOpacity>
    </View>
  );
};

export default FarmFixDashBoard;
