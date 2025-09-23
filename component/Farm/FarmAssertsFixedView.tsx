import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
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
import { useRoute, useFocusEffect } from "@react-navigation/native";
import LottieView from "lottie-react-native";

type RootStackParamList = {
  FarmAssertsFixedView: { category: string; toolId: any; farmId: Number; farmName: string };
  UpdateAsset: { selectedTools: number[]; category: string; toolId: any };
};

type Props = NativeStackScreenProps<RootStackParamList, "FarmAssertsFixedView">;

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

const FarmAssertsFixedView: React.FC<Props> = ({ navigation, route }) => {
  const { category, toolId, farmId, farmName } = route.params;
  const [isModalVisible, setModalVisible] = useState(false);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTools, setSelectedTools] = useState<number[]>([]);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentFarmId, setCurrentFarmId] = useState(farmId);

  const { t } = useTranslation();

  console.log("Farm Asserts Fixed View===========", farmId);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  // Reset component state when farmId changes
  useEffect(() => {
    if (farmId !== currentFarmId) {
      console.log("Farm ID changed from", currentFarmId, "to", farmId);
      setCurrentFarmId(farmId);
      setTools([]); // Clear previous data
      setSelectedTools([]); // Clear selections
      setShowDeleteOptions(false);
      setShowDropdown(false);
      setLoading(true);
      fetchTools(farmId); // Fetch new data immediately
    }
  }, [farmId, category]);

  // Focus effect to refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log("Screen focused with farmId:", farmId, "category:", category);
      setCurrentFarmId(farmId);
      setTools([]); // Clear any existing data
      setSelectedTools([]);
      setShowDeleteOptions(false);
      setShowDropdown(false);
      setLoading(true);
      fetchTools(farmId);
    }, [farmId, category])
  );

  const fetchTools = useCallback(async (targetFarmId?: Number) => {
    const farmIdToUse = targetFarmId || farmId;
    console.log("Fetching tools for farm ID:", farmIdToUse, "category:", category);
    
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        console.error("No token found in AsyncStorage");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${environment.API_BASE_URL}api/farm/fixed-assets/${category}/${farmIdToUse}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API Response for farm", farmIdToUse, ":", response.data);

      // Only update state if this is still the current farm
      if (farmIdToUse === farmId) {
        if (response.data.fixedAssets) {
          setTools(response.data.fixedAssets as Tool[]);
        } else {
          setTools([]);
        }
      }
    } catch (error: any) {
      console.error("Error fetching tools for farm", farmIdToUse, ":", error);
      
      // Only update state if this is still the current farm
      if (farmIdToUse === farmId) {
        // Handle 404 specifically (no fixed assets found)
        if (error.response?.status === 404) {
          console.log("No fixed assets found for this category");
          setTools([]);
        } else {
          console.error("Error details:", error.response?.data || error.message);
          setTools([]);
        }
      }
    } finally {
      if (farmIdToUse === farmId) {
        setLoading(false);
      }
    }
  }, [farmId, category]);

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
    Rathnapura: t("FixedAssets.Ratnapura"),
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

  // Modified selection logic - only for checkbox selection
  const toggleSelectTool = (toolId: number) => {
    setSelectedTools((prevSelected) => {
      if (prevSelected.includes(toolId)) {
        const newSelected = prevSelected.filter((id) => id !== toolId);
        if (newSelected.length === 0) {
          setShowDeleteOptions(false);
        }
        return newSelected;
      } else {
        setShowDeleteOptions(true);
        return [...prevSelected, toolId]; // Allow multiple selection
      }
    });
    setShowDropdown(false);
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
    setShowDropdown(false);
    setShowDeleteOptions(true);

    // Select all tools
    const allToolIds = tools.map((tool) => tool.id);
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

  const handleDeleteSelected = async () => {
    if (selectedTools.length === 0) {
      Alert.alert(
        t("FixedAssets.noToolsSelectedTitle"),
        t("FixedAssets.noToolsSelectedDeleteMessage"),[{ text: t("Farms.okButton") }]
      );
      return;
    }

    // Show confirmation dialog
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete ${selectedTools.length} item(s)?`,
      [
        {
          text: t("Farms.Cancel"),
          style: "cancel",
        },
        {
          text: t("Farms.Delete"),
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
                t("FixedAssets.successDeleteMessage"),[{ text: t("Farms.okButton") }]
              );
              handleCancelSelection();
            } catch (error) {
              console.error("Error deleting tools:", error);
              Alert.alert(
                t("FixedAssets.errorTitle"),
                t("FixedAssets.errorDeleteMessage"),[{ text: t("Farms.okButton") }]
              );
            }
          },
        },
      ]
    );
  };

  console.log("Current Tools Data:", tools);

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      <View
        className="flex-row justify-between mb-8"
        style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} className="">
          <AntDesign
            name="left"
            size={24}
            color="#000502"
            style={{
              paddingHorizontal: wp(3),
              paddingVertical: hp(1.5),
              backgroundColor: "#F6F6F680",
              borderRadius: 50,
            }}
          />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-lg font-bold pt-2 -ml-[15%]">{farmName}</Text>
        </View>
      </View>

      <View className="flex-row ml-8 mr-8 mt-[-8%] justify-center">
        <View className="w-1/2">
          <TouchableOpacity
            onPress={() =>
              navigation.navigate({
                screen: "FarmCurrentAssets",
                params: { farmId: farmId, farmName: farmName },
              } as any)
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

      <View className="flex-row mt-5 justify-between items-center px-4">
        <Text className="text-lg font-semibold">
          {translateCategory(category, t)}
        </Text>

        <View className="relative">
          {showDeleteOptions ? (
            <View className="absolute top-8 right-0 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-[120px] min-h-[10px]">
              <TouchableOpacity
                onPress={handleCancelSelection}
                className="px-4 py-1 border-b border-gray-100"
              >
                <Text className="text-sm ">
                  {" "}
                  {t("FixedAssets.Deselect All")}
                </Text>
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
      </View>

      {showDeleteOptions && (
        <View className="flex-row justify-end mt-2 p-4 ">
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
        </View>
      )}

      <ScrollView className="mt-2 p-4">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <LottieView
              source={require("../../assets/jsons/loader.json")}
              autoPlay
              loop
              style={{ width: 300, height: 300 }}
            />
          </View>
        ) : tools.length > 0 ? (
          tools.map((tool) => (
            <View
              key={`${farmId}-${tool.id}`}
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

                <View className="flex-1">{renderToolDetails(tool)}</View>
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
          <Text className="text-center text-gray-500 mt-8">
            {t("FixedAssets.No assets available for this category")}
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
    </View>
  );
};

export default FarmAssertsFixedView;