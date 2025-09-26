import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler
} from "react-native";
import React, { useEffect, useState , useCallback} from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types"; 
import AntDesign from "react-native-vector-icons/AntDesign";
import { ScrollView } from "react-native-gesture-handler";
import { useIsFocused, useRoute , useFocusEffect} from "@react-navigation/native";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { environment } from "@/environment/environment";
import { t } from "i18next";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useSelector } from "react-redux";
import type { RootState } from "@/services/reducxStore";
import LottieView from "lottie-react-native";


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
  role:string
}
const icon = require("../../assets/images/icona.webp");
const icon2 = require("../../assets/images/icona1.webp");
const icon3 = require("../../assets/images/icona3.webp");
const icon4 = require("../../assets/images/icons4.webp");
const icon5 = require("../../assets/images/icons5.webp");
const addIcon = require("../../assets/images/AddNew.webp");

const FarmFixDashBoard: React.FC<FarmFixDashBoardProps> = ({ navigation }) => {
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
   const route = useRoute();
     const { farmId , farmName} = route.params as RouteParams; 
     const [farm, setFarm] = useState("");
      
    const user = useSelector((state: RootState) => state.user.userData) as UserData | null;

   console.log("farm fix asset dashboard ===============================",farmId)

  
  const categoryMapping = {
    [t("FixedAssets.buildings")]: "Building and Infrastructures",
    [t("FixedAssets.lands")]: "Land",
    [t("FixedAssets.machineryVehicles")]: "Machine and Vehicles",
    [t("FixedAssets.toolsEquipments")]: "Tools",
  };

    useFocusEffect(
      useCallback(() => {
        const handleBackPress = () => {
          console.log("back click", farmName)
          user && user.role === "Owner" ? navigation.navigate("Main", { 
      screen: "FarmDetailsScreen",
     params: { farmId: farmId, farmName: farmName }
    }) : navigation.goBack()
          return true;
        };
    
      const subscription = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
                           
                                 return () => subscription.remove();
      }, [navigation])
    );
  
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


   console.log("Farm Name",farmName)




  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
             <LottieView
                                        source={require('../../assets/jsons/loader.json')}
                                        autoPlay
                                        loop
                                        style={{ width: 300, height: 300 }}
                                      />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View
        className="flex-row  "
        style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
      >
        <AntDesign
          name="left"
          size={24}
          color="#000502"
          style={{ paddingHorizontal: wp(3), paddingVertical: hp(1.5), backgroundColor: "#F6F6F680" , borderRadius: 50 }}
            onPress={() => user && user.role === "Owner" ? navigation.navigate("Main", { 
    screen: "FarmDetailsScreen",
   params: { farmId: farmId, farmName: farmName }
  }) : navigation.goBack()} 
        />
        <Text className="font-bold text-xl flex-1  pt-2 text-center -ml-[15%]">
         {farmName}
        </Text>
      </View>

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

      {/* Add new button - always displayed */}
      <View className="items-center  mt-6 p-6">
        <TouchableOpacity
          className="bg-[#00A896] rounded-full    p-3  px-12 flex-row justify-center items-center"
           onPress={() =>
    navigation.navigate("Main", {
      screen: "FarmAddFixAssert",
      params: { farmId: farmId, farmName: farmName },
    })
  }
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
                  navigation.navigate("FarmAssertsFixedView", {
                    category: categoryMapping[asset.category],
                    console: console.log(categoryMapping[asset.category]),
                    farmId:farmId,
                    farmName:farmName
                  } as any)
                }
                className="flex-1 w-[90%] items-center"
              >
                <View className="bg-white w-[90%] flex-row h-[50px] rounded-lg justify-between items-center px-4 shadow-3xl "            
                 style={{
                shadowColor: "gray",
                shadowOffset: { width: 1, height: 1 },
                shadowOpacity: 0.8,
                shadowRadius: 2,
                elevation:4
              }} >
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
             {t("FixedAssets.No assets available")} 
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
      return icon3; 
  }
};

export default FarmFixDashBoard;
