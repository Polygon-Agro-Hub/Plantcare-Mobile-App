// import { View, Text, Dimensions, Image, TouchableOpacity } from "react-native";
// import React, { useEffect, useState } from "react";
// import { StackNavigationProp } from "@react-navigation/stack";
// import { RootStackParamList } from "./types"; // Update this import based on your project structure
// import AntDesign from "react-native-vector-icons/AntDesign";
// import { ScrollView } from "react-native-gesture-handler";
// import NavigationBar from "@/Items/NavigationBar"; // Update this import based on your project structure
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useIsFocused } from "@react-navigation/native";
// import axios from "axios";

// // Define the navigation prop type for the fixedDashboard screen
// type fixedDashboardNavigationProp = StackNavigationProp<RootStackParamList, "fixedDashboard">;

// // Define the props for the fixedDashboard component
// interface fixedDashboardProps {
//   navigation: fixedDashboardNavigationProp;
// }

// // Define the interface for asset data
// interface AssetCategory {
//   category: string;
// }

// const icon = require("../assets/images/icona.png");
// const icon2 = require("../assets/images/icona1.png");
// const icon3 = require("../assets/images/icona3.png");
// const icon4 = require("../assets/images/icons4.png");
// const icon5 = require("../assets/images/icons5.png");
// const addIcon = require("../assets/images/AddNew.png");

// const fixedDashboard: React.FC<fixedDashboardProps> = ({ navigation }) => {
//   const [assetData, setAssetData] = useState<AssetCategory[]>([
//     { category: "Buildings and Structures" },
//     { category: "Lands" },
//     { category: "Machinery & Vehicles" },
//     { category: "Tools and Equipments" },
//   ]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(false);
//   const isFocused = useIsFocused();

//   // Fetch asset data from backend when the component is focused
//   useEffect(() => {
//     const fetchAssetData = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get("http://10.0.2.2:3000/api/auth/fixed-assets/totals/{category}"); // Update the URL accordingly
//         setAssetData(response.data.data);
//       } catch (error) {
//         setError(true);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (isFocused) {
//       fetchAssetData();
//     }
//   }, [isFocused]);

//   return (
//     <View className="flex-1">
//       <View className="flex-row mt-[5%]">
//         <AntDesign
//           name="left"
//           size={24}
//           color="#000502"
//           onPress={() => navigation.goBack()}
//         />
//         <Text className="font-bold text-xl pl-[30%] pt-0 text-center">
//           My Assets
//         </Text>
//       </View>

//       <View className="flex-row ml-8 mr-8 mt-8 justify-center">
//         <View className="w-1/2">
//           <TouchableOpacity onPress={() => navigation.navigate("CurrentAssert")}>
//             <Text className="text-gray-400 text-center text-lg">Current Assets</Text>
//             <View className="border-t-[2px] border-gray-400" />
//           </TouchableOpacity>
//         </View>
//         <View className="w-1/2">
//           <TouchableOpacity>
//             <Text className="text-green-400 text-center text-lg">Fixed Assets</Text>
//             <View className="border-t-[2px] border-green-400" />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Add new button - always displayed */}
//       <View className="items-center mb-4 pt-[5%]">
//         <TouchableOpacity
//           className="bg-green-600 rounded-md w-[95%] p-4 flex-row justify-center items-center"
//           onPress={() => navigation.navigate("AddFixedAsset")}
//         >
//           <Image
//             source={addIcon}
//             style={{ width: 24, height: 24, marginRight: 10 }}
//           />
//           <Text className="text-white font-bold text-lg">Add New Asset</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Display asset list if available */}
//       <ScrollView
//         contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
//         className="h-[50%]"
//       >
//         {assetData.length > 0 ? (
//           <View className="flex-1 items-center pt-[5%] gap-y-3">
//             {assetData.map((asset, index) => (
//               <TouchableOpacity
//                 key={index}
//                 onPress={() => navigation.navigate("AssertsFixedView", { category: asset.category } as any)}
//               >
//                 <View className="bg-white w-[90%] flex-row h-[60px] rounded-md justify-between items-center px-4">
//                   <View className="flex-row items-center">
//                     <Image
//                       source={getIcon(asset.category)}
//                       className="w-[24px] h-[24px] mr-2"
//                     />
//                     <Text>
//                       {asset.category.charAt(0).toUpperCase() +
//                         asset.category.slice(1)}
//                     </Text>
//                   </View>
//                 </View>
//               </TouchableOpacity>
//             ))}
//           </View>
//         ) : (
//           <View className="flex items-center">
//             <Text>No assets available. Add a new asset using the button above.</Text>
//           </View>
//         )}
//       </ScrollView>

//       {/* Navigation Bar */}
//       <View className="absolute bottom-0 left-0 right-0">
//         <NavigationBar navigation={navigation} />
//       </View>
//     </View>
//   );
// };

// // Function to return icons based on asset category
// const getIcon = (category: string) => {
//   switch (category) {
//     case "Buildings and Structures":
//       return icon2;
//     case "Lands":
//       return icon4;
//     case "Machinery & Vehicles":
//       return icon5;
//     case "Tools and Equipments":
//       return icon;
//     default:
//       return icon3; // Default icon for any unknown category
//   }
// };

// export default fixedDashboard;

import { View, Text, Dimensions, Image, TouchableOpacity } from "react-native";
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

// Define the navigation prop type for the fixedDashboard screen
type fixedDashboardNavigationProp = StackNavigationProp<RootStackParamList, "fixedDashboard">;

// Define the props for the fixedDashboard component
interface fixedDashboardProps {
  navigation: fixedDashboardNavigationProp;
}

// Define the interface for asset data
interface AssetCategory {
  category: string;
}

const icon = require("../assets/images/icona.png");
const icon2 = require("../assets/images/icona1.png");
const icon3 = require("../assets/images/icona3.png");
const icon4 = require("../assets/images/icons4.png");
const icon5 = require("../assets/images/icons5.png");
const addIcon = require("../assets/images/AddNew.png");

const fixedDashboard: React.FC<fixedDashboardProps> = ({ navigation }) => {
  const [assetData, setAssetData] = useState<AssetCategory[]>([
    { category: "Building and Infrastructures" },
    { category: "Land" },
    { category: "Machine and Vehicles" },
    { category: "Tools" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const isFocused = useIsFocused();
  const { t } = useTranslation();

  // Fetch asset data from backend when the component is focused
  useEffect(() => {
    const fetchAssetData = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://10.0.2.2:3000/api/auth/fixed-assets/{category}"); // Update the URL accordingly
        setAssetData(response.data.data);
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) {
      fetchAssetData();
    }
  }, [isFocused]);

  return (
    <View className="flex-1">
      <View className="flex-row mt-[5%]">
        <AntDesign
          name="left"
          size={24}
          color="#000502"
          onPress={() => navigation.goBack()}
        />
        <Text className="font-bold text-xl pl-[30%] pt-0 text-center">
        {t("FixedAssets.myAssets")}
        </Text>
      </View>

      <View className="flex-row ml-8 mr-8 mt-8 justify-center">
        <View className="w-1/2">
          <TouchableOpacity onPress={() => navigation.navigate("CurrentAssert")}>
            <Text className="text-gray-400 text-center text-lg">{t("FixedAssets.currentAssets")}</Text>
            <View className="border-t-[2px] border-gray-400" />
          </TouchableOpacity>
        </View>
        <View className="w-1/2">
          <TouchableOpacity>
            <Text className="text-green-400 text-center text-lg">{t("FixedAssets.fixedAssets")}</Text>
            <View className="border-t-[2px] border-green-400" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Add new button - always displayed */}
      <View className="items-center mb-4 pt-[5%]">
        <TouchableOpacity
          className="bg-green-600 rounded-md w-[95%] p-4 flex-row justify-center items-center"
          onPress={() => navigation.navigate("AddFixedAsset")}
        >
          <Image
            source={addIcon}
            style={{ width: 24, height: 24, marginRight: 10 }}
          />
          <Text className="text-white font-bold text-lg">{t("FixedAssets.addAsset")}</Text>
        </TouchableOpacity>
      </View>

      {/* Display asset list if available */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
        className="h-[50%]"
      >
        {assetData.length > 0 ? (
          <View className="flex-1 items-center">
            {assetData.map((asset, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => navigation.navigate("AssertsFixedView", { category: asset.category } as any)}
                className="flex-1 w-[80%] items-center"
              >
                <View className="bg-white w-[90%] flex-row h-[60px] rounded-md justify-between items-center px-4">
                  <View className="flex-row items-center">
                    <Image
                      source={getIcon(asset.category)}
                      className="w-[24px] h-[24px] mr-2"
                    />
                    <Text className="text-center pl-10">
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
    case "Building and Infrastructures":
      return icon2;
    case "Land":
      return icon4;
    case "Machine and Vehicles":
      return icon5;
    case "Tools":
      return icon;
    default:
      return icon3; // Default icon for any unknown category
  }
};

export default fixedDashboard;
