import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  BackHandler,
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
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import { RootStackParamList } from "../types/types";
import CustomHeader from "../common/CustomHeader";
import districtData from "../../assets/jsons/district.json";

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

const getDistrictLabel = (
  districtValue: string | undefined,
  t: any,
): string | null => {
  if (!districtValue) return null;

  const trimmed = districtValue.trim();

  const numericId = Number(trimmed);
  if (!isNaN(numericId)) {
    const found = districtData.find((d) => d.id === numericId);
    if (found) return t(found.translationKey);
  }

  const foundByName = districtData.find(
    (d) => d.name.toLowerCase() === trimmed.toLowerCase(),
  );
  if (foundByName) return t(foundByName.translationKey);

  return trimmed;
};

const FarmAssertsFixedView: React.FC<Props> = ({ navigation, route }) => {
  const { category, farmId, farmName } = route.params;
  const [isModalVisible, setModalVisible] = useState(false);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTools, setSelectedTools] = useState<number[]>([]);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentFarmId, setCurrentFarmId] = useState(farmId);

  const { t } = useTranslation();

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  useEffect(() => {
    if (farmId !== currentFarmId) {
      setCurrentFarmId(farmId);
      setTools([]);
      setSelectedTools([]);
      setShowDeleteOptions(false);
      setShowDropdown(false);
      setLoading(true);
      fetchTools(farmId);
    }
  }, [farmId, category]);

  useFocusEffect(
    useCallback(() => {
      setCurrentFarmId(farmId);
      setTools([]);
      setSelectedTools([]);
      setShowDeleteOptions(false);
      setShowDropdown(false);
      setLoading(true);
      fetchTools(farmId);
    }, [farmId, category]),
  );

  const fetchTools = useCallback(
    async (targetFarmId?: Number) => {
      const farmIdToUse = targetFarmId || farmId;

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
          },
        );

        if (farmIdToUse === farmId) {
          if (response.data.fixedAssets) {
            setTools(response.data.fixedAssets as Tool[]);
          } else {
            setTools([]);
          }
        }
      } catch (error: any) {
        console.error("Error fetching tools for farm", farmIdToUse, ":", error);

        if (farmIdToUse === farmId) {
          if (error.response?.status === 404) {
            setTools([]);
          } else {
            console.error(
              "Error details:",
              error.response?.data || error.message,
            );
            setTools([]);
          }
        }
      } finally {
        if (farmIdToUse === farmId) {
          setLoading(false);
        }
      }
    },
    [farmId, category],
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
    Barn: t("FixedAssets.barn"),
    Silo: t("FixedAssets.silo"),
    "Greenhouse structure": t("FixedAssets.greenhouseStructure"),
    "Storage facility": t("FixedAssets.storageFacility"),
    "Storage shed": t("FixedAssets.storageShed"),
    "Processing facility": t("FixedAssets.processingFacility"),
    "Packing shed": t("FixedAssets.packingShed"),
    "Dairy parlor": t("FixedAssets.dairyParlor"),
    "Poultry house": t("FixedAssets.poultryHouse"),
    "Livestock shelter": t("FixedAssets.livestockShelter"),
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
      "FixedAssets.Environmentalfriendlysprayer",
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
      "FixedAssets.CleaningGradingEquipment",
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
    switch (category) {
      case "Land":
        const districtLabel = getDistrictLabel(tool.district, t);
        return (
          <View className="flex-1 justify-center">
            {districtLabel && (
              <Text className="font-bold text-base text-[#070707]">
                {districtLabel}
              </Text>
            )}
          </View>
        );

      case "Building and Infrastructures":
        const buildingType = tool.type?.trim() as keyof typeof BuildingTypes;
        const buildingDisplay = BuildingTypes[buildingType] || tool.type;
        return (
          <View className="flex-1 justify-center">
            {buildingDisplay && (
              <Text className="font-bold text-base text-[#070707]">
                {buildingDisplay}
              </Text>
            )}
          </View>
        );

      case "Machine and Vehicles":
        const assetType =
          tool.assetType?.trim() as keyof typeof assetTypesForAssets;
        const asset = tool.asset?.trim() as keyof typeof Machineasset;
        const assetDisplay = Machineasset[asset] || tool.asset;
        const assetTypeDisplay =
          assetTypesForAssets[assetType] || tool.assetType;
        return (
          <View className="flex-1 justify-center">
            {assetDisplay && (
              <Text className="font-bold text-base text-[#070707]">
                {assetDisplay}
              </Text>
            )}
            {assetTypeDisplay && (
              <Text className="text-sm text-[#070707] mt-1">
                {assetTypeDisplay}
              </Text>
            )}
          </View>
        );

      case "Tools":
        const ToolKey = tool.asset?.trim() as keyof typeof AseetTools;
        const toolDisplay = AseetTools[ToolKey] || tool.asset;
        return (
          <View className="flex-1 justify-center">
            {toolDisplay && (
              <Text className="font-bold text-[#070707]">{toolDisplay}</Text>
            )}
          </View>
        );

      default:
        return null;
    }
  };

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
        return [...prevSelected, toolId];
      }
    });
    setShowDropdown(false);
  };

  const handleEditTool = (toolId: number) => {
    navigation.navigate("UpdateAsset", {
      selectedTools: [toolId],
      category,
      toolId,
    });
  };

  const areAllToolsSelected = () => {
    return tools.length > 0 && selectedTools.length === tools.length;
  };

  const handleSelectAll = () => {
    setShowDropdown(false);

    if (areAllToolsSelected()) {
      setSelectedTools([]);
      setShowDeleteOptions(false);
    } else {
      setShowDeleteOptions(true);
      const allToolIds = tools.map((tool) => tool.id);
      setSelectedTools(allToolIds);
    }
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
        t("FixedAssets.noToolsSelectedDeleteMessage"),
        [{ text: t("Farms.okButton") }],
      );
      return;
    }

    Alert.alert(
      t("FixedAssets.confirmDeleteTitle"),
      selectedTools.length > 1
        ? t("FixedAssets.confirmDeleteMessageMultiple", {
            count: selectedTools.length,
          })
        : t("FixedAssets.confirmDeleteMessageSingle"),
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
                  },
                );
              }

              setTools((prevTools) =>
                prevTools.filter((tool) => !selectedTools.includes(tool.id)),
              );

              Alert.alert(
                t("FixedAssets.successTitle"),
                t("CurrentAssets.RemoveSuccess"),
                [{ text: t("Farms.okButton") }],
              );
              handleCancelSelection();
            } catch (error) {
              console.error("Error deleting tools:", error);
              Alert.alert(
                t("FixedAssets.errorTitle"),
                t("FixedAssets.errorDeleteMessage"),
                [{ text: t("Farms.okButton") }],
              );
            }
          },
        },
      ],
    );
  };

  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        navigation.navigate("FarmFixDashBoard", {
          farmId: farmId,
          farmName: farmName,
        });
        return true;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackPress,
      );
      return () => subscription.remove();
    }, [navigation]),
  );

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      <CustomHeader
        title={farmName}
        navigation={navigation as any}
        onBackPress={() => {
          try {
            navigation.navigate("FarmFixDashBoard", {
              farmId: farmId,
              farmName: farmName,
            });
          } catch (error) {
            console.error("Navigation error:", error);
          }
        }}
      />

      <View className="flex-row ml-8 mr-8  justify-center">
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

      <View
        className={`flex-row mt-5 justify-between items-center px-4 ${
          showDropdown ? "mb-8" : ""
        }`}
      >
        <Text className="text-lg font-semibold">
          {translateCategory(category, t)}
        </Text>

        {tools.length > 0 && (
          <View className="relative">
            <TouchableOpacity onPress={handleMenuPress}>
              <MaterialIcons name="more-vert" size={24} color="black" />
            </TouchableOpacity>

            {showDropdown && (
              <View className="absolute top-6 right-0 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-[120px]">
                <TouchableOpacity
                  onPress={handleSelectAll}
                  className="px-4 py-2"
                >
                  <Text className="text-sm">
                    {areAllToolsSelected()
                      ? t("FixedAssets.Deselect All")
                      : t("FixedAssets.Select All")}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {showDeleteOptions && (
        <View className="mt-2 px-4">
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

      <ScrollView
        className="mt-2 p-4"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
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
              className="bg-[#FFFFFF] border border-[#E1E1E1] mb-2 rounded flex-row justify-between items-center"
            >
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
          <View className="flex-1 justify-center items-center">
            <View className="">
              <LottieView
                source={require("../../assets/jsons/NoComplaints.json")}
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

export default FarmAssertsFixedView;
