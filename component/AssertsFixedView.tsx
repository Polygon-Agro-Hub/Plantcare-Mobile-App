import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
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
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/AntDesign";
import Ionicons from "react-native-vector-icons/Ionicons";
import { MaterialIcons } from "@expo/vector-icons";

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

  useEffect(() => {
    fetchTools();
  }, [category]);

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
    NuwaraEliya: t("FixedAssets.Nuwara Eliya"),
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

  const renderToolDetails = (tool: Tool) => {
    const translatedCategory = translateCategory(tool.category, t);

    switch (category) {
      case "Land":
        const district = tool.district?.trim() as keyof typeof District;
        return (
          <View className="">
            <Text className="font-bold">
              {District[district] || tool.district || "N/A"}
            </Text>
          </View>
        );
      case "Building and Infrastructures":
        const buildingType = tool.type?.trim() as keyof typeof BuildingTypes;
        const district2 = tool.district?.trim() as keyof typeof District;
        return (
          <View>
            <Text className="font-bold">
              {BuildingTypes[buildingType] || tool.type || "N/A"}
            </Text>
            <Text className="font-bold">
              {District[district2] || tool.district || "N/A"}
            </Text>
          </View>
        );
      case "Machine and Vehicles":
        const assetType =
          tool.assetType?.trim() as keyof typeof assetTypesForAssets;
        const asset = tool.asset?.trim() as keyof typeof Machineasset;
        return (
          <View className="">
            <Text className="font-bold pb-1 -ml-1">
              {" "}
              {Machineasset[asset] || tool.asset || "N/A"}
            </Text>
            <Text className="font-bold">
              {assetTypesForAssets[assetType] || tool.assetType || "N/A"}
            </Text>
          </View>
        );
      case "Tools":
        const Tool = tool.asset?.trim() as keyof typeof AseetTools;
        return (
          <View>
            <Text className="font-bold">
              {AseetTools[Tool] || tool.asset || "N/A"}{" "}
            </Text>
          </View>
        );
    }
  };

  // Fixed selection logic - allows single selection or toggling
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
        // If not selected, add it (replace previous selection for single select)
        setShowDeleteOptions(true); // Show options when item is selected
        return [toolId]; // Single selection - replace with new selection
      }
    });
    setShowDropdown(false); // Close dropdown when selecting
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
        t("FixedAssets.noToolsSelectedMessage")
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
        t("FixedAssets.noToolsSelectedDeleteMessage")
      );
      return;
    }

    // Show confirmation dialog
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete ${selectedTools.length} item(s)?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
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
                t("FixedAssets.successDeleteMessage")
              );
              handleCancelSelection();
            } catch (error) {
              console.error("Error deleting tools:", error);
              Alert.alert(
                t("FixedAssets.errorTitle"),
                t("FixedAssets.errorDeleteMessage")
              );
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7]">
      <StatusBar style="dark" />

      <View className="flex-row justify-between mb-8" style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="">
          <AntDesign name="left" size={24} color="#000502" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-lg font-bold">
            My Assets
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

      <View className="flex-row mt-5 justify-between items-center px-4">
        <Text className="text-lg font-semibold">
          {translateCategory(category, t)}
        </Text>
        
        <View className="relative">
         {showDeleteOptions ? (
            <View className="absolute top-8 right-0 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-[120px]">
              <TouchableOpacity
                onPress={handleCancelSelection}
                className="px-4 py-3 border-b border-gray-100"
              >
                <Text className="text-sm ">Deselect All</Text>
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
                <Text className="text-sm">Select All</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

    

      {showDeleteOptions && (
        <View className="flex-row justify-around mt-2 p-4 bg-gray-100">
          <TouchableOpacity
            className={`bg-red-500 p-3 w-[48%] rounded-full ${
              selectedTools.length === 0 ? "opacity-50" : ""
            }`}
            disabled={selectedTools.length === 0}
            onPress={handleDeleteSelected}
          >
            <Text className="text-white text-center font-bold">
              Delete Selected
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
              Update Selected
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView className="mt-2 p-4">
        {loading ? (
          <Text>{t("Dashboard.loading")}</Text>
        ) : tools.length > 0 ? (
          tools.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              className={`bg-[#FFFFFF] border mb-2 rounded flex-row justify-between items-center ${
                selectedTools.includes(tool.id) 
                  ? "border-[#E1E1E1] " 
                  : "border-[#E1E1E1]"
              }`}
              onPress={() => toggleSelectTool(tool.id)}
            >
              <View className="flex-row items-center flex-1 p-4">
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
              </View>

              {/* Edit Icon */}
              <View>
                <View
                  className={`flex items-center justify-center w-10 h-20 ${
                    selectedTools.includes(tool.id)
                      ? "bg-[#E8F5F3]"
                      : "bg-[#E8E8E8]"
                  }`}
                >
                  <MaterialCommunityIcons
                    name="pencil"
                    size={24}
                    color={
                      selectedTools.includes(tool.id) ? "#101010ff" : "#101010ff"
                    }
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text className="text-center text-gray-500 mt-8">
            {t("FixedAssets.notoolsavailable")}
          </Text>
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
    </SafeAreaView>
  );
};

export default AssertsFixedView;