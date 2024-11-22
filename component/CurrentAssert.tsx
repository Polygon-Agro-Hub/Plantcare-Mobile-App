import {
  View,
  Text,
  Dimensions,
  Image,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import AntDesign from "react-native-vector-icons/AntDesign";
import axios from "axios";
import NavigationBar from "@/Items/NavigationBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import { PieChart } from "react-native-chart-kit";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

interface Asset {
  category: string;
  totalSum: number;
}

type CurrentAssetNavigationProp = StackNavigationProp<
  RootStackParamList,
  "CurrentAssert"
>;

interface CurrentAssetProps {
  navigation: CurrentAssetNavigationProp;
}

// Import the icons
const icon = require("../assets/images/icon.png");
const icon2 = require("../assets/images/icon2.png");
const icon3 = require("../assets/images/icon3.png");
const icon4 = require("../assets/images/icon4.png");
const icon5 = require("../assets/images/icon5.png");
const icon6 = require("../assets/images/icon6.png");
const icon7 = require("../assets/images/icon7.png");

const CurrentAssert: React.FC<CurrentAssetProps> = ({ navigation }) => {
  const [assetData, setAssetData] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();
  const [language, setLanguage] = useState("en");
  const { t } = useTranslation();

  // Function to get the auth token
  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) throw new Error("No token found");
      return token;
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  };

  // Function to fetch current assets from the backend
  useEffect(() => {
    const selectedLanguage = t("CurrentAssets.LNG");
    setLanguage(selectedLanguage);
    if (isFocused) {
      fetchCurrentAssets();
    }
  }, [isFocused]);

  const fetchCurrentAssets = async () => {
    try {
      const token = await getAuthToken();
      if (!token) return; // Ensure token exists before proceeding

      const response = await axios.get(
        `${environment.API_BASE_URL}api/auth/currentAsset`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data.currentAssetsByCategory) {
        setAssetData(response.data.currentAssetsByCategory);
      } else {
        setAssetData([]);
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setLoading(false); // Always stop loading regardless of success or failure
    }
  };

  // Function to handle adding a new asset value
  const handleAddAsset = async (category: string, amount: number) => {
    try {
      const token = await getAuthToken();
      const response = await axios.post(
        `${environment.API_BASE_URL}api/auth/addCurrentAsset`,
        { category, value: amount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update asset data in state
      setAssetData((prevData) => {
        return prevData.map((asset) =>
          asset.category === category
            ? { ...asset, totalSum: response.data.updatedValue }
            : asset
        );
      });
    } catch (error) {
      console.error("Error adding asset:", error);
    }
  };

  const getColorByAssetType = (assetType: string) => {
    switch (
      assetType.toLowerCase() // Use toLowerCase() for more lenient matching
    ) {
      case "agro chemicals":
        return "#26D041";
      case "fertilizers": // Plural case for Fertilizer
      case "fertilizer": // Singular case for Fertilizer
        return "#105ad2";
      case "seed and seedlings":
      case "seed and seedling": // Handle both plural and singular
        return "#d21c10";
      case "livestock for sale":
        return "#733e9a";
      case "animal feed":
        return "#1ddcce";
      case "other consumables":
        return "#dd09c7";
      case "greenhouse": // Added missing case for Greenhouse
        return "#f5a623";
      case "machinery": // Added missing case for Machinery
        return "#f44242";
      default:
        return "#000000"; // Default color for unknown categories
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
        legendFontSize: 12,
      }))
    : [];

  useEffect(() => {
    console.log("Asset Data:", assetData);
    console.log("Pie Data:", pieData);
  }, [assetData, pieData]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <View
        className="flex-row  "
        style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
      >
        <AntDesign
          name="left"
          size={24}
          color="#000502"
          style={{ paddingTop: 5 }}
          onPress={() => navigation.goBack()}
        />
        <Text className="font-bold text-xl pl-[25%] pt-0 text-center">
          {t("CurrentAssets.myAssets")}
        </Text>
      </View>

      <View className="item-center">
        <View className="flex-row ml-8 mr-8 mt-8 justify-center">
          <View className="w-1/2">
            <TouchableOpacity>
              <Text className="text-green-400 text-center text-lg">
                {t("CurrentAssets.currentAssets")}
              </Text>
              <View className="border-t-[2px] border-green-400" />
            </TouchableOpacity>
          </View>
          <View className="w-1/2">
            <TouchableOpacity
              onPress={() => navigation.navigate("fixedDashboard")}
            >
              <Text className="text-gray-400 text-center text-lg">
                {t("CurrentAssets.fixedAssets")}
              </Text>
              <View className="border-t-[2px] border-gray-400" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="bg-white rounded-lg mt-[10px] mx-[3%] mb-4 shadow-lg " >
          {pieData && pieData.length > 0 ? (
            <PieChart
              data={pieData}
              width={Dimensions.get("window").width - 32}
              height={200}
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
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="10"
            />
          ) : (
            <Image
              source={require("../assets/images/currentasset1.png")}
              className="mt-4 mb-4 self-center"
            />
          )}
        </View>

        <View className="flex-row justify-between mx-[30px] items-center">
          <TouchableOpacity
            className="bg-green-400 w-[150px] h-[40px] rounded-lg justify-center items-center"
            onPress={() => navigation.navigate("AddAsset")}
          >
            <Text className="text-white text-center text-base">
              {t("CurrentAssets.addAsset")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-red-500 w-[150px] h-[40px] rounded-lg justify-center items-center"
            onPress={() => navigation.navigate("RemoveAsset")}
          >
            <Text className="text-white text-center text-base">
              {t("CurrentAssets.removeAsset")}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
          className="h-[40%] pt-3"
        >
          <View className="items-center pt-[5%] gap-y-3">
            {assetData &&
              assetData.length > 0 &&
              assetData.map((asset, index) => (
                <View
                  key={index}
                  className="bg-white w-[90%] flex-row h-[60px] rounded-md justify-between items-center px-4 "
                >
                  <View className="flex-row items-center">
                    <Image
                      source={getIconByAssetType(asset.category)}
                      className="w-[24px] h-[24px] mr-2"
                    />

                    <Text>{getTranslatedCategory(asset.category)}</Text>
                  </View>
                  <View>
                    <Text>
                      {t("CurrentAssets.rs")}
                      {asset.totalSum}
                    </Text>
                  </View>
                </View>
              ))}
          </View>
        </ScrollView>
      </View>

      <View className="absolute bottom-0 left-0 right-0">
        <NavigationBar navigation={navigation} />
      </View>
    </SafeAreaView>
  );
};

const getIconByAssetType = (assetType: string) => {
  switch (assetType) {
    case "Agro chemicals ":
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
