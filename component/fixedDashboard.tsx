import {
  View,
  Text,
  Dimensions,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types"; // Update this import based on your project structure
import AntDesign from "react-native-vector-icons/AntDesign";
import { ScrollView } from "react-native-gesture-handler";
import NavigationBar from "@/Items/NavigationBar"; // Update this import based on your project structure
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { environment } from "@/environment/environment";
import { t } from "i18next";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

// Define the navigation prop type for the fixedDashboard screen
type fixedDashboardNavigationProp = StackNavigationProp<
  RootStackParamList,
  "fixedDashboard"
>;

// Define the props for the fixedDashboard component
interface fixedDashboardProps {
  navigation: fixedDashboardNavigationProp;
}

// Define the interface for asset data
interface AssetCategory {
  category: string;
  value: string;
}

const icon = require("../assets/images/icona.webp");
const icon2 = require("../assets/images/icona1.webp");
const icon3 = require("../assets/images/icona3.webp");
const icon4 = require("../assets/images/icons4.webp");
const icon5 = require("../assets/images/icons5.webp");
const addIcon = require("../assets/images/AddNew.webp");

const FixedDashboard: React.FC<fixedDashboardProps> = ({ navigation }) => {
  const { t } = useTranslation();

  const [assetData, setAssetData] = useState<AssetCategory[]>([
    { category: t("FixedAssets.buildings"), value: 'Building and Infrastructures' },
    { category: t("FixedAssets.lands"), value: 'Land' },
    { category: t("FixedAssets.machineryVehicles") , value: 'Machine and Vehicles'},
    { category: t("FixedAssets.toolsEquipments"), value: 'Tools' },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const isFocused = useIsFocused();
  const [language, setLanguage] = useState("en");

  // Mapping for category translation back to English
  const categoryMapping = {
    [t("FixedAssets.buildings")]: "Building and Infrastructures",
    [t("FixedAssets.lands")]: "Land",
    [t("FixedAssets.machineryVehicles")]: "Machine and Vehicles",
    [t("FixedAssets.toolsEquipments")]: "Tools",
  };

  // Fetch asset data from backend when the component is focused
  useEffect(() => {
    const selectedLanguage = t("FixedAssets.LNG");
    setLanguage(selectedLanguage);
    const translatedAssetData = [
      { category: t("FixedAssets.buildings"), value: "Building and Infrastructures" },
      { category: t("FixedAssets.lands"), value: "Land" },
      { category: t("FixedAssets.machineryVehicles"), value: "Machine and Vehicles" },
      { category: t("FixedAssets.toolsEquipments"), value: "Tools" },
    ];
    setAssetData(translatedAssetData);
  }, [isFocused]);

  // Check if loading
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  return (
    <View className="flex-1">
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
        <Text className="font-bold text-xl flex-1  pt-0 text-center">
          {t("FixedAssets.myAssets")}
        </Text>
      </View>

      <View className="flex-row ml-8 mr-8 mt-2 justify-center">
        <View className="w-1/2">
          <TouchableOpacity
            onPress={() => navigation.navigate("CurrentAssert")}
          >
            <Text className="text-gray-400 text-center text-lg">
              {t("FixedAssets.currentAssets")}
            </Text>
            <View className="border-t-[2px] border-gray-400" />
          </TouchableOpacity>
        </View>
        <View className="w-1/2">
          <TouchableOpacity>
            <Text className="text-green-400 text-center text-lg">
              {t("FixedAssets.fixedAssets")}
            </Text>
            <View className="border-t-[2px] border-green-400" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Add new button - always displayed */}
      <View className="items-center  mt-6 p-8">
        <TouchableOpacity
          className="bg-[#26D041] rounded-md    p-2  px-10 flex-row justify-center items-center"
          onPress={() => navigation.navigate("AddFixedAsset")}
        >
        {/* 
          <Image
            source={addIcon}
            style={{ width: 24, height: 24, marginRight: 10 }}
          />
           */}
          <Text className="text-white font-bold text-lg">
            {t("FixedAssets.addAsset")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Display asset list if available */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 250 }}
        className="h-[50%]"
      >
        {assetData.length > 0 ? (
          <View className="flex-1 items-center gap-y-5 mt-1 ">
            {assetData.map((asset, index) => (
              <TouchableOpacity
                key={index}
                onPress={() =>
                  navigation.navigate("AssertsFixedView", {
                    category: categoryMapping[asset.category],
                    console: console.log(categoryMapping[asset.category]),
                  } as any)
                }
                className="flex-1 w-[90%] items-center"
              >
                <View className="bg-white w-[90%] flex-row h-[60px] rounded-lg justify-between items-center px-4 shadow-2xl">
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
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="flex items-center">
            <Text>
              No assets available. Add a new asset using the button above.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
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
      return icon3; // Default icon for any unknown category
  }
};

export default FixedDashboard;
