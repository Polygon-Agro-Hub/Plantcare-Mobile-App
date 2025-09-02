import {
  View,
  Text,
  Dimensions,
  Image,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  BackHandler,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import AntDesign from "react-native-vector-icons/AntDesign";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useIsFocused, useRoute } from "@react-navigation/native";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import { PieChart } from "react-native-chart-kit";
import LottieView from "lottie-react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useSelector } from "react-redux";
import type { RootState } from "@/services/reducxStore";

interface Asset {
  category: string;
  totalSum: number;
}

type FarmCurrectAssetsNavigationProp = StackNavigationProp<
  RootStackParamList,
  "FarmCurrectAssets"
>;

interface Asset {
  farmName: string;
  farmId: number | null;
  
}

type RouteParams = {
  farmId: number;
  farmName:string
};

interface FarmCurrectAssetsProps {
  navigation: FarmCurrectAssetsNavigationProp;
}
interface UserData {
  role:string
}
// Import the icons
const icon = require("../../assets/images/icon.webp");
const icon2 = require("../../assets/images/icon2.webp");
const icon3 = require("../../assets/images/icon3.webp");
const icon4 = require("../../assets/images/icon4.webp");
const icon5 = require("../../assets/images/icon5.webp");
const icon6 = require("../../assets/images/icon6.webp");
const icon7 = require("../../assets/images/icon7.webp");

const FarmCurrectAssets: React.FC<FarmCurrectAssetsProps> = ({ navigation }) => {
  const [assetData, setAssetData] = useState<Asset[]>([]);
  console.log(assetData)
  const [loading, setLoading] = useState(true);
  const [farm, setFarm] = useState("");
  // const [farmName, setFarmName] = useState("");
  const [language, setLanguage] = useState("en");
  const { t } = useTranslation();
    const route = useRoute();
   const { farmId, farmName } = route.params as RouteParams; 
   const [selectedFarmName, setSelectedFarmName] = useState(farmName);
    const assets = useSelector(
    (state: RootState) => state.assets.assetsData
  );
    const user = useSelector((state: RootState) => state.user.userData) as UserData | null;
  
  console.log("farmId", farmId, selectedFarmName)
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

//  console.log("farm current asset ===============================",farmId)

      useFocusEffect(
      React.useCallback(() => {
        setSelectedFarmName(farmName);
          setLoading(true);
        fetchCurrentAssets()
        setAssetData([])
      
      }, [])
    );


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
        `${environment.API_BASE_URL}api/farm/currentAsset/${farmId}`,
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
      
      setAssetData([]);
      
     
     
    } finally {
      setLoading(false);
    }
  }, [t, farmId]);

useFocusEffect(
  useCallback(() => {
    const handleBackPress = () => {
      if (user?.role === "Owner") {
        navigation.navigate("Main", { 
          screen: "FarmDetailsScreen",
          params: { farmId, farmName }
        });
      } else {
        navigation.goBack();
      }
      return true;
    };

    BackHandler.addEventListener("hardwareBackPress", handleBackPress);

    return () => {
      BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
    };
  }, [navigation, user?.role, farmId, farmName])
);


  useFocusEffect(
    useCallback(() => {
      const selectedLanguage = t("CurrentAssets.LNG");
      setLanguage(selectedLanguage);
      
      
      fetchCurrentAssets();
      
    
      const interval = setInterval(() => {
        fetchCurrentAssets();
      }, 30000); 
      
      
      return () => clearInterval(interval);
    }, [fetchCurrentAssets, t])
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

  
  const refreshAssets = useCallback(() => {
    fetchCurrentAssets();
  }, [fetchCurrentAssets]);



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

  console.log("Farm Name",farmName)


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
     
        <SafeAreaView className="flex-1 bg-white">
                    <View className="flex-1 justify-center items-center">
                      <LottieView
                        source={require('../../assets/jsons/loader.json')}
                        autoPlay
                        loop
                        style={{ width: 300, height: 300 }}
                      />
                    </View>
                  </SafeAreaView>
    );
  }

  const totalPopulation = pieData.reduce(
    (sum, item) => sum + item.population,
    0
  );

  const renderFarmName = assets?.farmName === "My Assets" ? (
    <Text className="font-bold text-xl flex-1 pt-0 text-center">
      {farmName}
    </Text>
  ) : (
    <Text className="font-bold text-xl flex-1 pt-0 text-center">{farmName}</Text>
  );
  

  return (
    <SafeAreaView className="flex-1 bg-white">
     
          <View
              className="flex-row  "
              style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
            >
              <TouchableOpacity className="z-50"
              onPress={() => user && user.role === "Owner" ? navigation.navigate("Main", {
    screen: "FarmDetailsScreen",
   params: { farmId: farmId, farmName: selectedFarmName }
  }) : navigation.goBack()} 
              >
         <AntDesign
                name="left"
                size={24}
                color="#000502"
               style={{ paddingHorizontal: wp(3), paddingVertical: hp(1.5), backgroundColor: "#F6F6F680" , borderRadius: 50 }}
   
              />
              </TouchableOpacity>
     
              <Text className="font-bold text-xl flex-1  pt-2 text-center -ml-[15%]">
                {renderFarmName}
              </Text>
              
            </View>

{user && user.role !== "Supervisor" && (
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
              onPress={() => navigation.navigate("FarmFixDashBoard" ,{ farmId: farmId , farmName: selectedFarmName })}
            >
              <Text className="text-black text-center font-semibold text-lg">
                {t("CurrentAssets.fixedAssets")}
              </Text>
              <View className="border-t-[2px] border-[#D9D9D9]" />
            </TouchableOpacity>
          </View>
        </View>
)}

      <View className="item-center">


        <View className="bg-white rounded-lg mt-6  mx-[4%] mb-6 shadow-lg " 
              style={{
                shadowColor: "gray",
                shadowOffset: { width: 1, height: 1 },
                shadowOpacity: 0.8,
                shadowRadius: 2,
                elevation: 4,
              }}
        >
          {pieData && pieData.length > 0 ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 45,
              }}
              
            >
              {/* Pie Chart */}
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

              {/* Legend */}
              <View style={{ marginLeft: -120, marginTop: 10 }}>
                {pieData.map((data, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    {/* Color Indicator */}
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
                      {/* Text Label */}
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
                   <View className="self-center ">
                           <LottieView
                                    source={require('../../assets/jsons/currentassetempty.json')}
                                    autoPlay
                                    loop
                                    style={{ width: 200, height: 200 }}
                                  />
                        </View>
          )}
        </View>

        <View className="flex-row justify-between px-4 items-center  ">
          <TouchableOpacity
            className="bg-[#00A896] w-[48%] h-[40px]  rounded-full justify-center items-center"
            onPress={() => navigation.navigate("FarmAddCurrentAsset", {farmId:farmId, farmName: selectedFarmName})}
          >
            <Text className="text-white text-center text-base">
              {t("CurrentAssets.addAsset")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-[#FF4646] w-[48%] h-[40px] rounded-full justify-center items-center"
            onPress={() => navigation.navigate("FarmCurrectAssetRemove" ,{ farmId: farmId, farmName: selectedFarmName})}
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
                      {/* {asset.totalSum} */}
                      {Number(asset.totalSum).toLocaleString("en-LK")}
                    </Text>
                  </View>
                </View>
              ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
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
export default FarmCurrectAssets;
