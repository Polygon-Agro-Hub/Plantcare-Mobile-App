import { View, Text, Dimensions, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import AntDesign from "react-native-vector-icons/AntDesign";
import { ScrollView } from "react-native-gesture-handler";
import { PieChart } from "react-native-chart-kit";
import NavigationBar from "@/Items/NavigationBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { environment } from "@/environment/environment";

// Define the navigation prop type for the fixedDashboard screen
type fixedDashboardtNavigationProp = StackNavigationProp<
  RootStackParamList,
  "fixedDashboard"
>;

// Define the props for the fixedDashboard component
interface fixedDashboardProps {
  navigation: fixedDashboardtNavigationProp;
}

// Define the interface for asset data
interface AssetCategory {
  category: string;
  totalPrice: number;
}

const icon = require("../assets/images/icona.png");
const icon2 = require("../assets/images/icona1.png");
const icon3 = require("../assets/images/icona3.png");
const icon4 = require("../assets/images/icons4.png");
const icon5 = require("../assets/images/icons5.png");
const addIcon = require("../assets/images/AddNew.png");

const fixedDashboard: React.FC<fixedDashboardProps> = ({ navigation }) => {
  const [assetData, setAssetData] = useState<AssetCategory[]>([
    { category: "Buildings and Structures", totalPrice: 100000 },
    { category: "Lands", totalPrice: 200000 },
    { category: "Machinery & Vehicles", totalPrice: 150000 },
    { category: "Tools and Equipments", totalPrice: 50000 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const isFocused = useIsFocused();

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Buildings and Structures":
        return "#26D041";
      case "Lands":
        return "#105ad2";
      case "Machinery & Vehicles":
        return "#d21c10";
      case "Tools and Equipments":
        return "#FFB300";
      case "Dummy Category":
        return "#29B6F6";
      default:
        return "#000000";
    }
  };

  const pieData = assetData
    .filter((asset) => !isNaN(Number(asset.totalPrice)))
    .map((asset) => ({
      name: asset.category.charAt(0).toUpperCase() + asset.category.slice(1),
      population: Number(asset.totalPrice),
      color: getCategoryColor(asset.category),
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    }));

  return (
    <View className="flex-1">
      <View className="flex-row mt-[5%]">
        <AntDesign name="left" size={24} color="#000502" onPress={() => navigation.goBack()} />
        <Text className="font-bold text-xl pl-[30%] pt-0 text-center">
          My Assets
        </Text>
      </View>

      <View className='flex-row ml-8 mr-8 mt-8 justify-center'>
        <View className='w-1/2'>
          <TouchableOpacity onPress={() => navigation.navigate('CurrentAssert')}>
            <Text className='text-gray-400 text-center text-lg'>Current Assets</Text>
            <View className="border-t-[2px] border-gray-400" />
          </TouchableOpacity>
        </View>
        <View className='w-1/2'>
          <TouchableOpacity >
            <Text className='text-green-400 text-center text-lg'>Fixed Assets</Text>
            <View className="border-t-[2px] border-green-400" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Pie chart */}
      {assetData.length > 0 && (
        <View className="bg-white rounded-lg mt-[10px] mx-[5%] mb-4">
          <PieChart
            data={pieData}
            width={Dimensions.get("window").width - 32}
            height={220}
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
            paddingLeft="15"
          />
        </View>
      )}

      {/* Add new button - always displayed */}
      <View className="items-center mb-4">
        <TouchableOpacity
          style={{
            backgroundColor: "#0f9d58",
            borderRadius: 5,
            width: Dimensions.get("window").width - 32,
            padding: 15,
            flexDirection: "row", // Align items in a row
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => navigation.navigate("AddFixedAsset")}
        >
          <Image
            source={addIcon}
            style={{ width: 24, height: 24, marginRight: 10 }}
          />
          <Text style={{ fontSize: 16, color: "#fff", fontWeight: "bold" }}>
            Add New Asset
          </Text>
        </TouchableOpacity>
      </View>

      {/* Hardcoded dummy category */}
      <TouchableOpacity
        style={{
          backgroundColor: "#d3d3d3",
          margin: 16,
          padding: 16,
          borderRadius: 10,
        }}
        onPress={()=>navigation.navigate('AssertsFixedView')}
      >
        <Text style={{ fontSize: 16, fontWeight: "bold", color: "#000" }}>
          Dummy Category
        </Text>
        <Text style={{ color: "#888" }}>This is a hardcoded category for testing.</Text>
      </TouchableOpacity>

      {/* Display asset list if available */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
        className="h-[50%]"
      >
        {assetData.length > 0 ? (
          <View className="flex items-center pt-[5%] gap-y-3">
            {assetData.map((asset, index) => (
              <View
                key={index}
                className="bg-white w-[90%] flex-row h-[60px] rounded-md justify-between items-center px-4"
              >
                <View className="flex-row items-center">
                  <Image
                    source={getIcon(asset.category)}
                    className="w-[24px] h-[24px] mr-2"
                  />
                  <Text>
                    {asset.category.charAt(0).toUpperCase() +
                      asset.category.slice(1)}
                  </Text>
                </View>
                <View>
                  <Text>Rs. {asset.totalPrice}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="flex items-center">
            <Text>No assets available. Add a new asset using the button above.</Text>
          </View>
        )}
      </ScrollView>

      {/* Navigation Bar */}
      <View className="absolute bottom-0 left-0 right-0">
        <NavigationBar navigation={navigation} />
      </View>
    </View>
  );
};

// Function to return icons based on asset category
const getIcon = (category: string) => {
  switch (category) {
    case "Buildings and Structures":
      return icon2;
    case "Lands":
      return icon4;
    case "Machinery & Vehicles":
      return icon5;
    case "Tools and Equipments":
      return icon;
    case "Dummy Category":
      return icon3;
    default:
      return icon;
  }
};

export default fixedDashboard;
