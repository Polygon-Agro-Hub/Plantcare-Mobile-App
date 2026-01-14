import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AntDesign from "react-native-vector-icons/AntDesign";
import Modal from "react-native-modal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { environment } from "@/environment/environment";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/AntDesign";
import Ionicons from "react-native-vector-icons/Ionicons";
import { MaterialIcons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import i18n from "@/i18n/i18n";

type RootStackParamList = {
  AssertsFixedView: { category: string; toolId: any };
  UpdateAsset: { selectedTools: number[]; category: string; toolId: any };
};

type Props = NativeStackScreenProps<RootStackParamList, "AssertsFixedView">;

interface Tool {
  id: number;
  category: string;
  userId: number;
  toolId: any;
  district?: string;
  type?: string;
  assetType?: string;
  asset?: string;
}

const AssertsFixedView: React.FC<Props> = ({ navigation, route }) => {
  const { category, toolId } = route.params;
  const [isModalVisible, setModalVisible] = useState(false);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTools, setSelectedTools] = useState<number[]>([]);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const { t } = useTranslation();

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const fetchTools = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        console.error("No token found in AsyncStorage");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${environment.API_BASE_URL}api/auth/fixed-assets/${category}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("data assetttttttttttttt",response.data)

      if (response.data.data) {
        setTools(response.data.data as Tool[]);
      } else {
        setTools([]);
      }
    } catch (error) {
      console.error("Error fetching tools:", error);
      setTools([]);
    } finally {
      setLoading(false);
    }
  };

  // Use useFocusEffect to reload data every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Reset selection state when screen comes into focus
      setSelectedTools([]);
      setShowDeleteOptions(false);
      setShowDropdown(false);
      
      // Fetch fresh data
      fetchTools();
    }, [category])
  );

  const translateCategory = (category: string, t: any): string => {
    switch (category) {
      case "Land":
        return t("FixedAssets.lands");
      case "Building and Infrastructures":
        return t("FixedAssets.buildingandInfrastructures");
      case "Machine and Vehicles":
        return t("FixedAssets.machineandVehicles");
      case "Tools":
        return t("FixedAssets.toolsandEquipments");
      default:
        return category;
    }
  };

  const BuildingTypes = {
    "Barn": t("FixedAssets.barn"),
    "Silo": t("FixedAssets.silo"),
    "Greenhouse structure": t("FixedAssets.greenhouseStructure"),
    "Storage facility": t("FixedAssets.storageFacility"),
    "Storage shed": t("FixedAssets.storageShed"),
    "Processing facility": t("FixedAssets.processingFacility"),
    "Packing shed": t("FixedAssets.packingShed"),
    "Dairy parlor": t("FixedAssets.dairyParlor"),
    "Poultry house": t("FixedAssets.poultryHouse"),
    "Livestock shelter": t("FixedAssets.livestockShelter"),
  };

  const District = {
    Ampara: t("FixedAssets.Ampara"),
    Anuradhapura: t("FixedAssets.Anuradhapura"),
    Badulla: t("FixedAssets.Badulla"),
    Batticaloa: t("FixedAssets.Batticaloa"),
    Colombo: t("FixedAssets.Colombo"),
    Galle: t("FixedAssets.Galle"),
    Gampaha: t("FixedAssets.Gampaha"),
    Hambantota: t("FixedAssets.Hambantota"),
    Jaffna: t("FixedAssets.Jaffna"),
    Kalutara: t("FixedAssets.Kalutara"),
    Kandy: t("FixedAssets.Kandy"),
    Kegalle: t("FixedAssets.Kegalle"),
    Kilinochchi: t("FixedAssets.Kilinochchi"),
    Kurunegala: t("FixedAssets.Kurunegala"),
    Mannar: t("FixedAssets.Mannar"),
    Matale: t("FixedAssets.Matale"),
    Matara: t("FixedAssets.Matara"),
    Moneragala: t("FixedAssets.Moneragala"),
    Mullaitivu: t("FixedAssets.Mullaitivu"),
    NuwaraEliya: t("FixedAssets.NuwaraEliya"),
    Polonnaruwa: t("FixedAssets.Polonnaruwa"),
    Puttalam: t("FixedAssets.Puttalam"),
    Rathnapura: t("FixedAssets.Rathnapura"),
    Trincomalee: t("FixedAssets.Trincomalee"),
    Vavuniya: t("FixedAssets.Vavuniya"),
  };

  const assetTypesForAssets: any = {
    "2WD": t("FixedAssets.2WD"),
    "4WD": t("FixedAssets.4WD"),
    "Paddy transplanter": t("FixedAssets.Paddytransplanter"),
    "Sugarcane harvester": t("FixedAssets.Sugarcaneharvester"),
    "Static shedder": t("FixedAssets.Staticshedder"),
    "Mini combine harvester": t("FixedAssets.Minicombineharvester"),
    "Rice Combine harvester": t("FixedAssets.RiceCombineharvester"),
    "Paddy harvester": t("FixedAssets.Paddyharvester"),
    "Maize harvester": t("FixedAssets.Maizeharvester"),
    Seperator: t("FixedAssets.Seperator"),
    "Centrifugal Stier Machine": t("FixedAssets.CentrifugalStierMachine"),
    "Grain Classifier Seperator": t("FixedAssets.GrainClassifierSeperator"),
    "Destoner Machine": t("FixedAssets.DestonerMachine"),
    "Knapsack Sprayer": t("FixedAssets.KnapsackSprayer"),
    "Chemical Sprayer": t("FixedAssets.ChemicalSprayer"),
    "Mist Blower": t("FixedAssets.MistBlower"),
    "Environmental friendly sprayer": t(
      "FixedAssets.Environmentalfriendlysprayer"
    ),
    "Drone sprayer": t("FixedAssets.Dronesprayer"),
    "Pressure Sprayer": t("FixedAssets.PressureSprayer"),
  };

  const Machineasset = {
    Tractors: t("FixedAssets.Tractors"),
    Rotavator: t("FixedAssets.Rotavator"),
    "Combine Harvesters": t("FixedAssets.CombineHarvesters"),
    Transplanter: t("FixedAssets.Transplanter"),
    "Tillage Equipment": t("FixedAssets.TillageEquipment"),
    "Sowing Equipment": t("FixedAssets.SowingEquipment"),
    "Harvesting Equipment": t("FixedAssets.HarvestingEquipment"),
    "Threshers, Reaper, Binders": t("FixedAssets.ThreshersReaperBinders"),
    "Cleaning, Grading and Weighing Equipment": t(
      "FixedAssets.CleaningGradingEquipment"
    ),
    Weeding: t("FixedAssets.Weeding"),
    Sprayers: t("FixedAssets.Sprayers"),
    "Shelling and Grinding Machine": t("FixedAssets.ShellingGrindingMachine"),
    Sowing: t("FixedAssets.Sowing"),
  };

  const AseetTools = {
    "Hand Fork": t("FixedAssets.handFork"),
    "Cutting knife": t("FixedAssets.cuttingKnife"),
    "Iluk kaththa": t("FixedAssets.ilukKaththa"),
    Kaththa: t("FixedAssets.kaththa"),
    "Kara diga manna": t("FixedAssets.karaDigaManna"),
    "Coconut harvesting knife": t("FixedAssets.coconutHarvestingKnife"),
    "Tapping knife": t("FixedAssets.tappingKnife"),
    Mamotie: t("FixedAssets.mamotie"),
    "Manna knife": t("FixedAssets.mannaKnife"),
    Shovel: t("FixedAssets.shovel"),
    "Small axe": t("FixedAssets.smallAxe"),
    "Puning knife": t("FixedAssets.puningKnife"),
    "Hoe with fork": t("FixedAssets.hoeWithFork"),
    "Fork hoe": t("FixedAssets.forkHoe"),
    "Sickle - paddy": t("FixedAssets.sicklePaddy"),
    "Grow bags": t("FixedAssets.growBags"),
    "Seedling tray": t("FixedAssets.seedlingTray"),
    Fogger: t("FixedAssets.fogger"),
    "Drip Irrigation system": t("FixedAssets.dripIrrigationSystem"),
    "Sprinkler Irrigation system": t("FixedAssets.sprinklerIrrigationSystem"),
    "Water pump": t("FixedAssets.waterPump"),
    "Water tank": t("FixedAssets.waterTank"),
    Other: t("FixedAssets.other"),
  };

  // const renderToolDetails = (tool: Tool) => {
  //   const translatedCategory = translateCategory(tool.category, t);

  //   switch (category) {
  //     case "Land":
  //       const district = tool.district?.trim() as keyof typeof District;
  //       return (
  //         <View className="">
  //           <Text className="font-bold">
  //             {District[district] || tool.district || "N/A"}
  //           </Text>
  //         </View>
  //       );
  //     case "Building and Infrastructures":
  //       const buildingType = tool.type?.trim() as keyof typeof BuildingTypes;
  //       const district2 = tool.district?.trim() as keyof typeof District;
  //       return (
  //         <View>
  //           <Text className="font-bold">
  //             {BuildingTypes[buildingType] || tool.type || "N/A"}
  //           </Text>
  //           <Text className="font-bold">
  //             {District[district2] || tool.district || "N/A"}
  //           </Text>
  //         </View>
  //       );
  //     case "Machine and Vehicles":
  //       const assetType =
  //         tool.assetType?.trim() as keyof typeof assetTypesForAssets;
  //       const asset = tool.asset?.trim() as keyof typeof Machineasset;
  //       return (
  //         <View className="">
  //           <Text className="font-bold pb-1 -ml-1">
  //             {" "}
  //             {Machineasset[asset] || tool.asset || "N/A"}
  //           </Text>
  //           <Text className="font-bold">
  //             {assetTypesForAssets[assetType] || tool.assetType || "N/A"}
  //           </Text>
  //         </View>
  //       );
  //     case "Tools":
  //       const Tool = tool.asset?.trim() as keyof typeof AseetTools;
  //       return (
  //         <View>
  //           <Text className="font-bold">
  //             {AseetTools[Tool] || tool.asset || "N/A"}{" "}
  //           </Text>
  //         </View>
  //       );
  //   }
  // };

  const renderToolDetails = (tool: Tool) => {
  const translatedCategory = translateCategory(tool.category, t);

  switch (category) {
    case "Land":
      const district = tool.district?.trim() as keyof typeof District;
      const districtDisplay = District[district] || tool.district;
      return (
        <View className="flex-1 justify-center ">
          {districtDisplay && (
            <Text className="font-bold text-base text-[#070707]">
              {districtDisplay}
            </Text>
          )}
        </View>
      );
      
    case "Building and Infrastructures":
      const buildingType = tool.type?.trim() as keyof typeof BuildingTypes;
      const district2 = tool.district?.trim() as keyof typeof District;
      const buildingDisplay = BuildingTypes[buildingType] || tool.type;
      const districtDisplay2 = District[district2] || tool.district;
      return (
        <View className="flex-1 justify-center">
          {buildingDisplay && (
            <Text className="font-bold text-base text-[#070707]">
              {buildingDisplay}
            </Text>
          )}
          {districtDisplay2 && (
            <Text className=" text-sm text-[#070707] mt-1">
              {districtDisplay2}
            </Text>
          )}
        </View>
      );
      
    case "Machine and Vehicles":
      const assetType =
        tool.assetType?.trim() as keyof typeof assetTypesForAssets;
      const asset = tool.asset?.trim() as keyof typeof Machineasset;
      const assetDisplay = Machineasset[asset] || tool.asset;
      const assetTypeDisplay = assetTypesForAssets[assetType] || tool.assetType;
      return (
        <View className="flex-1 justify-center">
          {assetDisplay && (
            <Text className="font-bold text-base text-[#070707]">
              {assetDisplay}
            </Text>
          )}
          {assetTypeDisplay && (
            <Text className=" text-sm text-[#070707] mt-1">
              {assetTypeDisplay}
            </Text>
          )}
        </View>
      );
      
    case "Tools":
      const Tool = tool.asset?.trim() as keyof typeof AseetTools;
      const toolDisplay = AseetTools[Tool] || tool.asset;
      return (
        <View className="flex-1 justify-center">
          {toolDisplay && (
            <Text className="font-bold text-[#070707]">
              {toolDisplay}
            </Text>
          )}
        </View>
      );
      
    default:
      return null;
  }
};

  // Modified selection logic - only for checkbox selection
  const toggleSelectTool = (toolId: number) => {
    setSelectedTools((prevSelected) => {
      if (prevSelected.includes(toolId)) {
        // If already selected, remove it
        const newSelected = prevSelected.filter((id) => id !== toolId);
        if (newSelected.length === 0) {
          setShowDeleteOptions(false); // Hide options when no items selected
        }
        return newSelected;
      } else {
        // If not selected, add it
        setShowDeleteOptions(true); // Show options when item is selected
        return [...prevSelected, toolId]; // Allow multiple selection
      }
    });
    setShowDropdown(false); // Close dropdown when selecting
  };

  // Handle edit button press - navigate to update screen for single item
  const handleEditTool = (toolId: number) => {
    navigation.navigate("UpdateAsset", {
      selectedTools: [toolId], // Pass single tool ID as array
      category,
      toolId,
    });
  };

  const handleSelectAll = () => {
    setShowDropdown(false); // Close dropdown
    setShowDeleteOptions(true); // Show select mode
    
    // Select all tools
    const allToolIds = tools.map(tool => tool.id);
    setSelectedTools(allToolIds);
  };

  const handleMenuPress = () => {
    setShowDropdown(!showDropdown);
  };

  const handleCancelSelection = () => {
    setSelectedTools([]);
    setShowDeleteOptions(false);
    setShowDropdown(false);
  };

  const handleUpdateSelected = () => {
    if (selectedTools.length === 0) {
      Alert.alert(
        t("FixedAssets.noToolsSelectedTitle"),
        t("FixedAssets.noToolsSelectedMessage"),
         [{ text:  t("PublicForum.OK") }]
      );
      return;
    }

    navigation.navigate("UpdateAsset", {
      selectedTools,
      category,
      toolId,
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedTools.length === 0) {
      Alert.alert(
        t("FixedAssets.noToolsSelectedTitle"),
        t("FixedAssets.noToolsSelectedDeleteMessage"),
         [{ text:  t("PublicForum.OK") }]
      );
      return;
    }

    // Show confirmation dialog
    Alert.alert(
      t("FixedAssets.confirmDeleteTitle"),
      selectedTools.length === 1 
        ? t("FixedAssets.confirmDeleteMessageSingle")
        : t("FixedAssets.confirmDeleteMessageMultiple", { count: selectedTools.length }),
      [
        {
          text: t("FixedAssets.cancelButton"),
          style: "cancel"
        },
        {
          text: t("FixedAssets.deleteButton"),
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("userToken");
              if (!token) {
                console.error("No token found in AsyncStorage");
                return;
              }
                for (const toolId of selectedTools) {
                  await axios.delete(
                    `${environment.API_BASE_URL}api/auth/fixedasset/${toolId}/${category}`,
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );
                }

                // Update tools state to remove the deleted tools
                setTools((prevTools) =>
                  prevTools.filter((tool) => !selectedTools.includes(tool.id))
                );

                Alert.alert(
                  t("FixedAssets.successTitle"),
                  t("CurrentAssets.RemoveSuccess"),
                    [{ text:  t("PublicForum.OK") }]
                );
                handleCancelSelection();
              } catch (error) {
                console.error("Error deleting tools:", error);
                Alert.alert(
                  t("FixedAssets.errorTitle"),
                  t("FixedAssets.errorDeleteMessage"),
                   [{ text:  t("PublicForum.OK") }]
                );
              }
            }
          }
        ]
      );
    };

  // Loading component
  const LoadingComponent = () => (
    <View className="flex-1 justify-center items-center bg-[#F7F7F7]">
      <ActivityIndicator size="large" color="#00A896" />
      <Text className="mt-4 text-gray-600">{t("Dashboard.loading")}</Text>
    </View>
  );

  // Show loading screen if data is being fetched
  if (loading) {
    return (
      <View className="flex-1 bg-[#F7F7F7]">
        <StatusBar style="dark" />
        
        {/* Header */}
        <View className="flex-row justify-between mb-8" style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}>
          <TouchableOpacity onPress={() => navigation.goBack()} className="">
            <AntDesign name="left" size={24} color="#000502" />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-lg font-bold">
              {t("FixedAssets.myAssets")}
            </Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <View className="flex-row ml-8 mr-8 mt-[-8%] justify-center">
          <View className="w-1/2">
            <TouchableOpacity 
              onPress={() => (navigation as any).navigate("Main", { screen: "CurrentAssert" })}
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

        {/* Loading Content */}
        <LoadingComponent />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F7F7F7]">
      <StatusBar style="dark" />

      <View className="flex-row justify-between mb-8" style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="">
          <AntDesign name="left" size={24} color="#000502" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-lg font-bold">
            {t("FixedAssets.myAssets")}
          </Text>
        </View>
      </View>

      <View className="flex-row ml-8 mr-8 mt-[-8%] justify-center">
        <View className="w-1/2">
          <TouchableOpacity 
            onPress={() => (navigation as any).navigate("Main", { screen: "CurrentAssert" })}
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

      {/* <View className="flex-row mt-5 justify-between items-center px-4">
        <Text className="text-lg font-semibold">
          {translateCategory(category, t)}
        </Text>
        
        <View className="relative">
         {showDeleteOptions ? (
            <View className="absolute top-8 right-0 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-[120px]">
              <TouchableOpacity
                onPress={handleCancelSelection}
                className="px-4 py-1 border-b border-gray-100"
              >
                <Text className="text-sm ">{t("FixedAssets.Deselect All")}</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          
          <TouchableOpacity onPress={handleMenuPress}>
            <MaterialIcons name="more-vert" size={24} color="black" />
          </TouchableOpacity>
          
        
          {showDropdown && !showDeleteOptions && (
            <View className="absolute top-8 right-0 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-[120px]">
              <TouchableOpacity
                onPress={handleSelectAll}
                className="px-4 py-3 border-b border-gray-100"
              >
                <Text className="text-sm">{t("FixedAssets.Select All")}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View> */}

      <View className="flex-row mt-5 justify-between items-center px-4">
        <Text className="text-lg font-semibold">
          {translateCategory(category, t)}
        </Text>
        
        {/* Only show menu button if there are items */}
        {tools.length > 0 && (
          <View className="relative">
           {showDeleteOptions ? (
              <View className="absolute top-8 right-0 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-[120px]">
                <TouchableOpacity
                  onPress={handleCancelSelection}
                  className="px-4 py-2 border-b border-gray-100"
                >
                  <Text className="text-sm "
                   style={[
                    i18n.language === "si"
                      ? { fontSize: 13 }
                      : i18n.language === "ta"
                      ? { fontSize: 10 }
                      : { fontSize: 14}
                  ]}
                  >{t("FixedAssets.Deselect All")}</Text>
                </TouchableOpacity>
              </View>
            ) : null}
            
            <TouchableOpacity onPress={handleMenuPress}>
              <MaterialIcons name="more-vert" size={24} color="black" />
            </TouchableOpacity>
            
            {/* Dropdown Menu */}
            {showDropdown && !showDeleteOptions && (
              <View className="absolute top-8 right-0 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-[120px]">
                <TouchableOpacity
                  onPress={handleSelectAll}
                  className="px-4 py-3 border-b border-gray-100"
                >
                  <Text className="text-sm">{t("FixedAssets.Select All")}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
      

      {/* {showDeleteOptions && (
         <View className="flex-row justify-end mt-2 p-4 bg-gray-100">
          <TouchableOpacity
            className={`bg-red-500 p-3 w-[48%] rounded-full ${
              selectedTools.length === 0 ? "opacity-50" : ""
            }`}
            disabled={selectedTools.length === 0}
            onPress={handleDeleteSelected}
          >
            <Text className="text-white text-center font-bold">
              {t("FixedAssets.Delete Selected")} 
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`bg-[#00A896] p-3 w-[48%] rounded-full ${
              selectedTools.length === 0 ? "opacity-50" : ""
            }`}
            disabled={selectedTools.length === 0}
            onPress={handleUpdateSelected}
          >
            <Text className="text-white text-center font-bold">
              {t("FixedAssets.Update Selected")}
            </Text>
          </TouchableOpacity>
        </View>
      )} */}

      {showDeleteOptions && (
         <View className="mt-2 px-4  ">
          <View className="flex-row justify-end mb-2">
            <TouchableOpacity
              onPress={handleCancelSelection}
              className="bg-[#F7F7F7] px-4 py-2 rounded border border-[#F7F7F7]"
            >
              <Text className="text-sm text-gray-700"></Text>
            </TouchableOpacity>
          </View>
            <View className="flex-row justify-end mb-2">
           <TouchableOpacity
            className={`bg-red-500 p-3 w-[48%] rounded-full justify-end ${
              selectedTools.length === 0 ? "opacity-50" : ""
            }`}
            disabled={selectedTools.length === 0}
            onPress={handleDeleteSelected}
          >
            <Text className="text-white text-center font-bold">
              {t("FixedAssets.Delete Selected")} 
            </Text>
          </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView className="mt-2 p-4">
        {tools.length > 0 ? (
          tools.map((tool) => (
            <View
              key={tool.id}
              className={`bg-[#FFFFFF] border mb-2 rounded flex-row justify-between items-center ${
                selectedTools.includes(tool.id) 
                  ? "border-[#E1E1E1] " 
                  : "border-[#E1E1E1]"
              }`}
            >
              {/* Main content area - clickable for selection */}
              <TouchableOpacity
                className="flex-row items-center flex-1 p-4"
                onPress={() => toggleSelectTool(tool.id)}
              >
                {/* Selection Circle */}
                <View className="mr-3">
                  <View
                    className={`w-6 h-6 border-2 rounded-full flex items-center justify-center ${
                      selectedTools.includes(tool.id) 
                        ? "bg-black border-black" 
                        : "border-gray-400 bg-white"
                    }`}
                  >
                    {selectedTools.includes(tool.id) && (
                      <AntDesign name="check" size={14} color="white" />
                    )}
                  </View>
                </View>
                
                {/* Tool Details */}
                <View className="flex-1">
                  {renderToolDetails(tool)}
                </View>
              </TouchableOpacity>

              {/* Edit Icon - separate touchable area */}
              <TouchableOpacity
                onPress={() => handleEditTool(tool.id)}
                className={`flex items-center justify-center w-10 h-20 ${
                  selectedTools.includes(tool.id)
                    ? "bg-[#E8F5F3]"
                    : "bg-[#E8E8E8]"
                }`}
              >
                <MaterialCommunityIcons
                  name="pencil"
                  size={24}
                  color="#101010ff"
                />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          // <Text className="text-center text-gray-500 mt-8">
          //   {t("FixedAssets.No assets available for this category")}
          // </Text>
           <View className="flex-1 justify-center items-center">
                      <View className=''>
                        <LottieView
                          source={require("../assets/jsons/NoComplaints.json")}
                          style={{ width: wp(50), height: hp(50) }}
                          autoPlay
                          loop
                        />
                      </View>
                      <Text className="text-center text-gray-600 -mt-[30%]">
                       {t("FixedAssets.No assets available for this category")}
                      </Text>
                    </View>
        )}
      </ScrollView>

      <Modal isVisible={isModalVisible}>
        <View className="flex-1 justify-center items-center bg-white p-4 rounded-lg">
          <Text className="font-bold text-xl mb-4">
            {t("FixedAssets.addNewTool")}
          </Text>
          <TouchableOpacity onPress={toggleModal}>
            <Text className="text-red-500 mt-4">{t("FixedAssets.close")}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default AssertsFixedView;