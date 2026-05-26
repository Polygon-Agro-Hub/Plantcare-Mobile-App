import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import React, { useEffect, useState } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/types";
import { ScrollView } from "react-native-gesture-handler";
import { useIsFocused } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { t } from "i18next";
import CustomHeader from "../common/CustomHeader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { environment } from "@/environment/environment";
import LoadingPage from "../common/LoadingPage";
import assetJsonData from "@/assets/jsons/fixed-asset/fixed-assets.json";

type fixedDashboardNavigationProp = StackNavigationProp<
  RootStackParamList,
  "fixedDashboard"
>;
t;
interface fixedDashboardProps {
  navigation: fixedDashboardNavigationProp;
}

interface AssetCategory {
  category: string;
  value: string;
}

const icon = require("../../assets/images/farms/icona.webp");
const icon2 = require("../../assets/images/farms/icona1.webp");
const icon3 = require("../../assets/images/farms/icona3.webp");
const icon4 = require("../../assets/images/farms/icons4.webp");
const icon5 = require("../../assets/images/farms/icons5.webp");

const FixedDashboard: React.FC<fixedDashboardProps> = ({ navigation }) => {
  const { t, i18n } = useTranslation();

  const getCategoryLabel = (val: string) => {
    const item = assetJsonData.categoryOptions.find((c: any) => c.value === val);
    const lang = i18n.language ? (i18n.language.startsWith("si") ? "si" : i18n.language.startsWith("ta") ? "ta" : "en") : "en";
    return item ? (item.translations[lang] || item.translations["en"]) : val;
  };

  const [assetData, setAssetData] = useState<AssetCategory[]>([
    {
      category: getCategoryLabel("Building and Infrastructures"),
      value: "Building and Infrastructures",
    },
    { category: getCategoryLabel("Land"), value: "Land" },
    {
      category: getCategoryLabel("Machine and Vehicles"),
      value: "Machine and Vehicles",
    },
    { category: getCategoryLabel("Tools"), value: "Tools" },
  ]);

  const [loading, setLoading] = useState(false);
  const [assetCounts, setAssetCounts] = useState<Record<string, number>>({});
  const isFocused = useIsFocused();

  const getIcon = (value: string) => {
    switch (value) {
      case "Building and Infrastructures":
        return icon2;
      case "Land":
        return icon4;
      case "Machine and Vehicles":
        return icon5;
      case "Tools":
        return icon;
      default:
        return icon3;
    }
  };

  const fetchAllCounts = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

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
            .then((res) => ({
              category: cat,
              count: res.data.data ? (res.data.data as any[]).length : 0,
            }))
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

  useEffect(() => {
    const translatedAssetData = [
      {
        category: getCategoryLabel("Building and Infrastructures"),
        value: "Building and Infrastructures",
      },
      { category: getCategoryLabel("Land"), value: "Land" },
      {
        category: getCategoryLabel("Machine and Vehicles"),
        value: "Machine and Vehicles",
      },
      { category: getCategoryLabel("Tools"), value: "Tools" },
    ];
    setAssetData(translatedAssetData);
  }, [isFocused, i18n.language]);

  useEffect(() => {
    if (isFocused) {
      fetchAllCounts();
    }
  }, [isFocused]);

  useEffect(() => {
    const handleBackPress = () => {
      navigation.navigate("Dashboard");
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress,
    );

    return () => {
      backHandler.remove();
    };
  }, []);

  if (loading) {
    return <LoadingPage fullScreen />;
  }

  return (
    <View className="flex-1 bg-[#F7F7F7]">
      <CustomHeader
        title={t("FixedAssets.MyAssets")}
        navigation={navigation}
        onBackPress={() => navigation.navigate("Dashboard")}
      />

      <View className="flex-row ml-8 mr-8 mt-2 justify-center">
        <View className="w-1/2">
          <TouchableOpacity
            onPress={() => navigation.navigate("CurrentAssert")}
          >
            <Text className="text-black font-semibold text-center text-lg">
              {t("FixedAssets.CurrentAssets")}
            </Text>
            <View className="border-t-[2px] border-[#D9D9D9]" />
          </TouchableOpacity>
        </View>
        <View className="w-1/2">
          <TouchableOpacity>
            <Text className="text-black text-center font-semibold text-lg">
              {t("FixedAssets.FixedAssets")}
            </Text>
            <View className="border-t-[2px] border-black" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        className="h-[50%] py-10"
      >
        {assetData.length > 0 ? (
          <View className="flex-1 items-center gap-y-5 mt-1">
            {assetData.map((asset, index) => (
              <TouchableOpacity
                key={index}
                onPress={() =>
                  navigation.navigate("AssertsFixedView", {
                    category: asset.value,
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
                      source={getIcon(asset.value)}
                      className="w-[24px] h-[24px] mr-2"
                    />
                    <Text className="text-center pl-1">
                      {asset.category.charAt(0).toUpperCase() +
                        asset.category.slice(1)}
                    </Text>
                  </View>

                  <View className="bg-[#353535] rounded-full w-7 h-7 items-center justify-center">
                    <Text className="text-xs font-bold text-[#FFFFFF]">
                      {assetCounts[asset.value] ?? 0}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            <View className="w-[90%] items-end mt-2">
              <TouchableOpacity
                className="bg-gray-800 w-14 h-14 rounded-full items-center justify-center shadow-lg"
                onPress={() => navigation.navigate("AddFixedAsset")}
                accessibilityLabel="Add new asset"
                accessibilityRole="button"
              >
                <Image
                  className="w-[20px] h-[20px]"
                  source={require("../../assets/images/farms/plus-white.webp")}
                />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="flex items-center">
            <Text>{t("FixedAssets.NoAssetsAvailableAddANewAssetUsingTheButtonAbove")}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default FixedDashboard;
