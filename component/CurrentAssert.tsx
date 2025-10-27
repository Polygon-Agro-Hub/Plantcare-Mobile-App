import {
  View,
  Text,
  Dimensions,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import AntDesign from "react-native-vector-icons/AntDesign";
import axios from "axios";
import NavigationBar from "@/Items/NavigationBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import { PieChart } from "react-native-chart-kit";
import LottieView from "lottie-react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useSelector } from "react-redux";
import type { RootState } from "../services/reducxStore";
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
  // You can add more properties here if needed
}

interface CurrentAssetProps {
  navigation: CurrentAssetNavigationProp;
}

// Import the icons
const icon = require("../assets/images/icon.webp");
const icon2 = require("../assets/images/icon2.webp");
const icon3 = require("../assets/images/icon3.webp");
const icon4 = require("../assets/images/icon4.webp");
const icon5 = require("../assets/images/icon5.webp");
const icon6 = require("../assets/images/icon6.webp");
const icon7 = require("../assets/images/icon7.webp");

const CurrentAssert: React.FC<CurrentAssetProps> = ({ navigation }) => {
  const [assetData, setAssetData] = useState<Asset[]>([]);
  console.log(assetData)
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("en");
  const { t } = useTranslation();
    const assets = useSelector(
    (state: RootState) => state.assets.assetsData
  );
  console.log(assets)
  // Function to get the auth token
  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) throw new Error(t("Main.somethingWentWrong"));
      return token;
    } catch (error) {
      return null;
    }
  };

  // Function to fetch current assets from the backend
  const fetchCurrentAssets = useCallback(async () => {
    try {
      setLoading(true); // Set loading to true when fetching starts
      const token = await getAuthToken();
      if (!token) {
        // If no token, clear the asset data and stop loading
        setAssetData([]);
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${environment.API_BASE_URL}api/auth/currentAsset`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("currect assettt",response.data)

      if (response.data && response.data.currentAssetsByCategory) {
        setAssetData(response.data.currentAssetsByCategory);
      } else {
        setAssetData([]);
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
      // Clear data on error (in case of logout or token expiry)
      setAssetData([]);
      
      // Check if error is due to authentication
     
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Use useFocusEffect instead of useEffect with useIsFocused
  useFocusEffect(
    useCallback(() => {
      const selectedLanguage = t("CurrentAssets.LNG");
      setLanguage(selectedLanguage);
      
      // Always fetch data when screen comes into focus
      fetchCurrentAssets();
      
      // Optional: Set up an interval to periodically check for updates
      const interval = setInterval(() => {
        fetchCurrentAssets();
      }, 30000); // Check every 30 seconds
      
      // Cleanup interval when screen loses focus
      return () => clearInterval(interval);
    }, [fetchCurrentAssets, t])
  );

  // Listen for storage changes (logout events)
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        // User has logged out, clear the data
        setAssetData([]);
      }
    };

    // Check auth status when component mounts
    checkAuthStatus();

    // Set up a listener for storage changes (optional - requires additional setup)
    // You might want to implement a custom event listener for logout events
  }, []);

  // Function to handle adding a new asset value
  const handleAddAsset = async (category: string, amount: number) => {
    try {
      const token = await getAuthToken();
      if (!token) return;

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

  // Add a refresh function that can be called from other components
  const refreshAssets = useCallback(() => {
    fetchCurrentAssets();
  }, [fetchCurrentAssets]);

  // Expose refresh function through navigation params (optional)
  // useEffect(() => {
  //   return navigation.setParams({ refreshAssets });
  // }, [navigation, refreshAssets]);

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
      // <View className="flex-1 justify-center items-center">
      //   <ActivityIndicator size="large" color="#00ff00" />
      // </View>
        <View className="flex-1 bg-white">
                    <View className="flex-1 justify-center items-center">
                      <LottieView
                        source={require('../assets/jsons/loader.json')}
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
    0
  );

  const renderFarmName = assets?.farmName === "My Assets" ? (
    <Text className="font-bold text-xl flex-1 pt-0 text-center">
      {t("CurrentAssets.myAssets")}
    </Text>
  ) : (
    <Text className="font-bold text-xl flex-1 pt-0 text-center">Farm</Text>
  );

  return (
    <View className="flex-1 ">
      {/* <View className="flex-row items-center "  style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="" >
          <AntDesign name="left" size={24} color="#000502" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold text-black">
        {t("CurrentAssets.myAssets")}
        </Text>
      </View> */}

          <View
              className="flex-row  "
              style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
            >
              <AntDesign
                name="left"
                size={24}
                color="#000502"
                onPress={() => navigation.goBack()}
              />
              {/* <Text className="font-bold text-xl flex-1  pt-0 text-center">
                {t("CurrentAssets.myAssets")}
              </Text> */}
              {renderFarmName}
            </View>

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


        <View className="bg-white rounded-lg mt-6  mx-[4%] mb-6 shadow-lg ">
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
                width={Dimensions.get("window").width} // Adjusted width for proper spacing
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
                  alignItems: "center", // Centers the chart
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
                            1
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
            // <Image
            //   source={require("../assets/images/spices.png")}
            //   className="mt-4 mb-4 self-center w-36 h-36"
            // />
            <View className="self-center ">
               <LottieView
                        source={require('../assets/jsons/currentassetempty.json')}
                        autoPlay
                        loop
                        style={{ width: 200, height: 200 }}
                      />
            </View>
          )}
        </View>

        {/* <View className="flex-row justify-between px-4 items-center  ">
          <TouchableOpacity
            className="bg-[#00A896] w-[48%] h-[40px]  rounded-full justify-center items-center"
            onPress={() => navigation.navigate("AddAsset")}
          >
            <Text className="text-white text-center text-base">
              {t("CurrentAssets.addAsset")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-[#FF4646] w-[48%] h-[40px] rounded-full justify-center items-center"
            onPress={() => 
              navigation.navigate("RemoveAsset")
            }
          >
            <Text className="text-white text-center text-base">
              {t("CurrentAssets.removeAsset")}
            </Text>
          </TouchableOpacity>
        </View> */}

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          className="h-[50%] pt-3"
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
                      {t("CurrentAssets.rs")}{Number(asset.totalSum).toLocaleString("en-LK")}
                      {/* {asset.totalSum} */}
                      
                    </Text>
                  </View>
                </View>
              ))}

            
          </View>
        
        </ScrollView>
         <TouchableOpacity 
           className="absolute mb-[-2%] bottom-12 right-6 bg-gray-800 w-16 h-16 rounded-full items-center justify-center shadow-lg"
          onPress={() => navigation.navigate("AddAsset")}
           accessibilityLabel="Add new asset"
           accessibilityRole="button"
         >
           {/* <Ionicons name="add" size={28} color="white" /> */}
           <Image className="w-[20px] h-[20px]"
                       source={require('../assets/images/Farm/plusfarm.png')}/>
         </TouchableOpacity>
      </View>
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
