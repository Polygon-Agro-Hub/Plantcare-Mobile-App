import {
  View,
  Text,
  Dimensions,
  Image,
  ScrollView,
  TouchableOpacity,
  BackHandler,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/types";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import { PieChart } from "react-native-chart-kit";
import LottieView from "lottie-react-native";
import { useSelector } from "react-redux";
import type { RootState } from "../../services/reducxStore";
import CustomHeader from "../common/CustomHeader";
interface Asset {
  category: string;
  totalSum: number;
}

type CurrentAssetNavigationProp = StackNavigationProp<
  RootStackParamList,
  "CurrentAssert"
>;

interface Asset {
  farmName: string;
  farmId: number | null;
}

interface CurrentAssetProps {
  navigation: CurrentAssetNavigationProp;
}

const icon = require("../../assets/images/currect-assets/icon.webp");
const icon2 = require("../../assets/images/currect-assets/icon2.webp");
const icon3 = require("../../assets/images/currect-assets/icon3.webp");
const icon4 = require("../../assets/images/currect-assets/icon4.webp");
const icon5 = require("../../assets/images/currect-assets/icon5.webp");
const icon7 = require("../../assets/images/currect-assets/icon7.webp");

const CurrentAssert: React.FC<CurrentAssetProps> = ({ navigation }) => {
  const [assetData, setAssetData] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const assets = useSelector((state: RootState) => state.assets.assetsData);

  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) throw new Error(t("Main.somethingWentWrong"));
      return token;
    } catch (error) {
      return null;
    }
  };

  const fetchCurrentAssets = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      if (!token) {
        setAssetData([]);
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${environment.API_BASE_URL}api/auth/currentAsset`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data && response.data.currentAssetsByCategory) {
        setAssetData(response.data.currentAssetsByCategory);
      } else {
        setAssetData([]);
      }
    } catch (error) {
      console.error("Error fetching assets:", error);

      setAssetData([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      fetchCurrentAssets();

      return () => {};
    }, [fetchCurrentAssets, t]),
  );

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        setAssetData([]);
      }
    };

    checkAuthStatus();
  }, []);

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

  const getColorByAssetType = (assetType: string) => {
    const normalizedType = assetType.trim().toLowerCase();
    switch (normalizedType) {
      case "agro chemicals":
        return "#5687F2";
      case "fertilizers":
      case "fertilizer":
        return "#31101D";
      case "seeds and seedlings":
      case "seed and seedling":
        return "#60CA3B";
      case "livestock for sale":
        return "#EA3A88";
      case "animal feed":
        return "#EAB308";
      case "other consumables":
        return "#999999";
      case "greenhouse":
        return "#f5a623";
      case "machinery":
        return "#f44242";
      default:
        return "#000000";
    }
  };

  const getTranslatedCategory = (category: string) => {
    return t(`CurrentAssets.${category}`) || category;
  };

  const pieData = assetData?.length
    ? assetData.map((asset) => ({
        name: getTranslatedCategory(asset.category),
        population: Number(asset.totalSum),
        color: getColorByAssetType(asset.category),
        legendFontColor: "#7F7F7F",
        legendFontSize: 11,
        legndMarginLeft: 10,
      }))
    : [];

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <LottieView
            source={require("../../assets/jsons/loader.json")}
            autoPlay
            loop
            style={{ width: 300, height: 300 }}
          />
        </View>
      </View>
    );
  }

  const totalPopulation = pieData.reduce(
    (sum, item) => sum + item.population,
    0,
  );

  const headerTitle =
    assets?.farmName === "My Assets" ? t("CurrentAssets.myAssets") : "Farm";

  return (
    <View className="flex-1">
      <CustomHeader
        title={headerTitle}
        navigation={navigation}
        onBackPress={() => navigation.goBack()}
      />

      <View className="flex-row ml-8 mr-8 mt-2 justify-center">
        <View className="w-1/2">
          <TouchableOpacity>
            <Text className="text-black text-center font-semibold text-lg">
              {t("CurrentAssets.currentAssets")}
            </Text>
            <View className="border-t-[2px] border-black" />
          </TouchableOpacity>
        </View>
        <View className="w-1/2">
          <TouchableOpacity
            onPress={() => navigation.navigate("fixedDashboard")}
          >
            <Text className="text-black text-center font-semibold text-lg">
              {t("CurrentAssets.fixedAssets")}
            </Text>
            <View className="border-t-[2px] border-[#D9D9D9]" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="item-center">
        <View className="bg-white rounded-lg mt-6 mx-[4%] mb-6 shadow-lg">
          {pieData && pieData.length > 0 ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 45,
              }}
            >
              <PieChart
                data={pieData}
                width={Dimensions.get("window").width}
                height={180}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  propsForLabels: {
                    fontSize: 12,
                    fontWeight: "bold",
                  },
                }}
                hasLegend={false}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="20"
                style={{
                  alignItems: "center",
                }}
              />

              <View style={{ marginLeft: -120, marginTop: 10 }}>
                {pieData.map((data, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <View
                        style={{
                          width: 4,
                          height: 16,
                          backgroundColor: data.color,
                          borderRadius: 0,
                          marginRight: 8,
                        }}
                      />
                      <View>
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#000",
                          }}
                        >
                          {((data.population / totalPopulation) * 100).toFixed(
                            1,
                          )}
                          %
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View className="self-center">
              <LottieView
                source={require("../../assets/jsons/currentassetempty.json")}
                autoPlay
                loop
                style={{ width: 200, height: 200 }}
              />
            </View>
          )}
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          className="h-[50%] pt-3"
        >
          <View className="items-center gap-y-3">
            {assetData &&
              assetData.length > 0 &&
              assetData.map((asset, index) => (
                <View
                  key={index}
                  className="bg-white w-[90%] flex-row h-[60px] rounded-md justify-between items-center px-4"
                >
                  <View className="flex-row items-center">
                    <Image
                      source={getIconByAssetType(asset.category)}
                      className="w-[24px] h-[24px] mr-2"
                    />
                    <Text>
                      {getTranslatedCategory(asset.category).length > 20
                        ? getTranslatedCategory(asset.category)
                            .split(" ")
                            .slice(0, 2)
                            .join(" ") +
                          "\n" +
                          getTranslatedCategory(asset.category)
                            .split(" ")
                            .slice(2)
                            .join(" ")
                        : getTranslatedCategory(asset.category)}
                    </Text>
                  </View>
                  <View>
                    <Text>
                      {t("CurrentAssets.rs")}
                      {Number(asset.totalSum).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                  </View>
                </View>
              ))}
          </View>
        </ScrollView>
      </View>

      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 80,
          right: 24,
          backgroundColor: "#1f2937",
          width: 56,
          height: 56,
          borderRadius: 28,
          alignItems: "center",
          justifyContent: "center",
          elevation: 6,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        }}
        onPress={() => navigation.navigate("AddAsset")}
        accessibilityLabel="Add new asset"
        accessibilityRole="button"
      >
        <Image
          style={{ width: 20, height: 20 }}
          source={require("../../assets/images/farms/plus-white.webp")}
        />
      </TouchableOpacity>
    </View>
  );
};

const getIconByAssetType = (assetType: string) => {
  switch (assetType) {
    case "Agro chemicals":
      return icon;
    case "Fertilizers":
      return icon2;
    case "Seeds and Seedlings":
      return icon3;
    case "Livestock for sale":
      return icon4;
    case "Animal feed":
      return icon5;
    case "Other consumables":
      return icon7;
    default:
      return icon;
  }
};
export default CurrentAssert;
