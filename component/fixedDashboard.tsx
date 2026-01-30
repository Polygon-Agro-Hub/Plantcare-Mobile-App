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
import { RootStackParamList } from "./types";
import AntDesign from "react-native-vector-icons/AntDesign";
import { ScrollView } from "react-native-gesture-handler";
import { useIsFocused } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { t } from "i18next";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

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

const icon = require("../assets/images/icona.webp");
const icon2 = require("../assets/images/icona1.webp");
const icon3 = require("../assets/images/icona3.webp");
const icon4 = require("../assets/images/icons4.webp");
const icon5 = require("../assets/images/icons5.webp");
const addIcon = require("../assets/images/AddNew.webp");

const FixedDashboard: React.FC<fixedDashboardProps> = ({ navigation }) => {
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
  const isFocused = useIsFocused();
  const [language, setLanguage] = useState("en");

  const categoryMapping = {
    [t("FixedAssets.buildings")]: "Building and Infrastructures",
    [t("FixedAssets.lands")]: "Land",
    [t("FixedAssets.machineryVehicles")]: "Machine and Vehicles",
    [t("FixedAssets.toolsEquipments")]: "Tools",
  };

  useEffect(() => {
    const selectedLanguage = t("FixedAssets.LNG");
    setLanguage(selectedLanguage);
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

  // Check if loading
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F7F7F7]">
      <View
        className="flex-row  "
        style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
      >
        <AntDesign
          name="left"
          size={24}
          color="#000502"
          onPress={() => navigation.navigate("Dashboard")}
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

      {/* Add new button - always displayed */}
      {/* <View className="items-center  mt-6 p-6">
        <TouchableOpacity
          className="bg-[#00A896] rounded-full    p-3  px-12 flex-row justify-center items-center"
          onPress={() => navigation.navigate("AddFixedAsset")}
        >
       
          <Text className="text-white font-bold text-lg">
            {t("FixedAssets.addAsset")}
          </Text>
        </TouchableOpacity>
      </View> */}

      {/* Display asset list if available */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 250 }}
        className="h-[50%]  py-10"
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
                className="flex-1 w-[90%] items-center "
              >
                <View
                  className="bg-white w-[90%] flex-row h-[50px] rounded-lg justify-between items-center px-4 shadow-3xl "
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
        className="absolute mb-3 bottom-12 right-6 bg-gray-800 w-16 h-16 rounded-full items-center justify-center shadow-lg"
        onPress={() => navigation.navigate("AddFixedAsset")}
        accessibilityLabel="Add new asset"
        accessibilityRole="button"
      >
        {/* <Ionicons name="add" size={28} color="white" /> */}
        <Image
          className="w-[20px] h-[20px]"
          source={require("../assets/images/Farm/plusfarm.png")}
        />
      </TouchableOpacity>
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
