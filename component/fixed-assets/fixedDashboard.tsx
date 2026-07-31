import { View, Text, Image, TouchableOpacity, BackHandler } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/types";
import { ScrollView } from "react-native-gesture-handler";
import {
  useIsFocused,
  useFocusEffect,
  RouteProp,
} from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import CustomHeader from "../common/CustomHeader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { environment } from "@/environment/environment";
import LoadingPage from "../common/LoadingPage";
import assetJsonData from "@/assets/jsons/fixed-asset/fixed-assets.json";
import { useSelector } from "react-redux";
import type { RootState } from "../../services/reducxStore";

type fixedDashboardNavigationProp = StackNavigationProp<
  RootStackParamList,
  "fixedDashboard"
>;

type fixedDashboardRouteProp = RouteProp<RootStackParamList, "fixedDashboard">;

interface fixedDashboardProps {
  navigation: fixedDashboardNavigationProp;
  route: fixedDashboardRouteProp;
}

interface AssetCategory {
  category: string;
  value: string;
}

interface UserData {
  role: string;
}

const icon = require("../../assets/images/farms/icona.webp");
const icon2 = require("../../assets/images/farms/icona1.webp");
const icon3 = require("../../assets/images/farms/icona3.webp");
const icon4 = require("../../assets/images/farms/icons4.webp");
const icon5 = require("../../assets/images/farms/icons5.webp");

const FixedDashboard: React.FC<fixedDashboardProps> = ({
  navigation,
  route,
}) => {
  const params = route.params;
  const farmId = params?.farmId;
  const farmName = params?.farmName || "";
  const isGlobal = !farmId;

  const { t, i18n } = useTranslation();
  const user = useSelector(
    (state: RootState) => state.user.userData,
  ) as UserData | null;

  const getCategoryLabel = (val: string) => {
    const item = assetJsonData.categoryOptions.find(
      (c: any) => c.value === val,
    );
    const lang = i18n.language
      ? i18n.language.startsWith("si")
        ? "si"
        : i18n.language.startsWith("ta")
          ? "ta"
          : "en"
      : "en";
    return item ? item.translations[lang] || item.translations["en"] : val;
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
            .then((res) => {
              const allData: any[] = res.data.data
                ? (res.data.data as any[])
                : [];
              if (isGlobal) {
                return { category: cat, count: allData.length };
              } else {
                const filtered = allData.filter(
                  (item) => item.farmId === farmId,
                );
                return { category: cat, count: filtered.length };
              }
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

  useFocusEffect(
    useCallback(() => {
      fetchAllCounts();
    }, [farmId, isGlobal]),
  );

  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        if (!isGlobal) {
          if (user?.role === "Owner") {
            navigation.navigate("Main", {
              screen: "FarmDetailsScreen",
              params: { farmId, farmName },
            });
          } else {
            navigation.goBack();
          }
        } else {
          navigation.navigate("Dashboard");
        }
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackPress,
      );

      return () => subscription.remove();
    }, [navigation, isGlobal, user, farmId, farmName]),
  );

  const headerTitle = isGlobal ? t("FixedAssets.MyAssets") : farmName;

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <CustomHeader
          title={headerTitle}
          navigation={navigation as any}
          onBackPress={() => {
            if (!isGlobal) {
              if (user?.role === "Owner") {
                navigation.navigate("Main", {
                  screen: "FarmDetailsScreen",
                  params: { farmId, farmName },
                });
              } else {
                navigation.goBack();
              }
            } else {
              navigation.navigate("Dashboard");
            }
          }}
        />
        <View className="flex-1 justify-center items-center bg-white">
          <LoadingPage fullScreen />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <CustomHeader
        title={headerTitle}
        navigation={navigation as any}
        onBackPress={() => {
          if (!isGlobal) {
            if (user?.role === "Owner") {
              navigation.navigate("Main", {
                screen: "FarmDetailsScreen",
                params: { farmId, farmName },
              });
            } else {
              navigation.goBack();
            }
          } else {
            navigation.navigate("Dashboard");
          }
        }}
      />

      {/* Tabs */}
      {(!isGlobal ? user && user.role !== "Supervisor" : true) && (
        <View className="flex-row mt-2 justify-center">
          <View className="w-1/2">
            <TouchableOpacity
              onPress={() => {
                if (isGlobal) {
                  navigation.navigate("CurrentAssert");
                } else {
                  navigation.navigate("Main", {
                    screen: "CurrentAssert",
                    params: { farmId, farmName },
                  });
                }
              }}
            >
              <Text className="text-black text-center font-semibold text-lg">
                {t("CurrentAssets.CurrentAssets")}
              </Text>
              <View className="border-t-[2px] border-[#D9D9D9] mt-2" />
            </TouchableOpacity>
          </View>
          <View className="w-1/2">
            <TouchableOpacity>
              <Text className="text-black text-center font-semibold text-lg">
                {t("CurrentAssets.FixedAssets")}
              </Text>
              <View className="border-t-[2px] border-black mt-2" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 250,
          paddingTop: 30,
        }}
        className="px-6"
      >
        {assetData.length > 0 ? (
          <View className="w-full items-center gap-y-6 mt-1">
            {assetData.map((asset, index) => (
              <TouchableOpacity
                key={index}
                onPress={() =>
                  navigation.navigate("AssertsFixedView", {
                    category: asset.value,
                    farmId: farmId,
                    farmName: farmName,
                  } as any)
                }
                activeOpacity={1}
                className="w-full items-center"
              >
                <View
                  className="bg-white w-full flex-row h-[50px] rounded-lg justify-between items-center px-4"
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
                      className="w-[32px] h-[32px] mr-2"
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
          </View>
        ) : (
          <View className="flex items-center">
            <Text>
              {t(
                "FixedAssets.NoAssetsAvailableAddANewAssetUsingTheButtonAbove",
              )}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* FAB - Plus Button */}
      <TouchableOpacity
        className="absolute bottom-20 right-6 bg-gray-800 w-16 h-16 rounded-full items-center justify-center shadow-lg"
        onPress={() => {
          if (isGlobal) {
            navigation.navigate("AddFixedAsset");
          } else {
            navigation.navigate("AddFixedAsset", {
              farmId: farmId,
              farmName: farmName,
            });
          }
        }}
        accessibilityLabel="Add new asset"
        accessibilityRole="button"
      >
        <Image
          className="w-[20px] h-[20px]"
          source={require("../../assets/images/farms/plus-white.webp")}
        />
      </TouchableOpacity>
    </View>
  );
};

export default FixedDashboard;
