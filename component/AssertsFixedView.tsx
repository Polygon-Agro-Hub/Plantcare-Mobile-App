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

  // const toggleSelectTool = (toolId: number) => {
  //   setShowDeleteOptions(!showDeleteOptions);
  //   setSelectedTools((prevSelected) =>
  //     prevSelected.includes(toolId) ? [] : [toolId]
  //   );
  // };

  const toggleSelectTool = (toolId: number) => {
    setShowDeleteOptions(true);  
  
    setSelectedTools((prevSelected) => {
      if (prevSelected.includes(toolId)) {
        return prevSelected.filter((id) => id !== toolId);
      } else {
        return [...prevSelected, toolId];
      }
    });
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
      setSelectedTools([]); // Reset selected tools after deletion
    } catch (error) {
      console.error("Error deleting tools:", error);
      Alert.alert(
        t("FixedAssets.errorTitle"),
        t("FixedAssets.errorDeleteMessage")
      );
    }
    // console.log("Hi this is delete:", selectedTools);
  };

  return (
    <SafeAreaView
      className="flex-1"
    >
      <StatusBar style="dark" />

      <View className="flex-row justify-between mb-8 "  style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="">
          <AntDesign name="left" size={24} color="#000502" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-lg font-bold">
            {translateCategory(category, t)}
          </Text>
        </View>
      </View>
      {showDeleteOptions && (
        <View className="flex-row justify-around mt-2 p-4  bg-gray-100 ">
          <TouchableOpacity
            className={`bg-red-500 p-2 w-36 rounded ${
              selectedTools.length === 0 ? "opacity-50" : ""
            }`}
            disabled={selectedTools.length === 0}
            onPress={handleDeleteSelected}
          >
            <Text className="text-white text-center font-bold">
              {t("FixedAssets.deleteSelected")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`bg-green-500 p-2   text-center rounded ${
              selectedTools.length === 0 ? "opacity-50" : ""
            }`}
            disabled={selectedTools.length === 0}
            onPress={handleUpdateSelected}
          >
            <Text className="text-white font-bold">
              {t("FixedAssets.updateSelected")}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView className="mt-2 p-4 ">
        {loading ? (
          <Text>{t("Dashboard.loading")}</Text>
        ) : tools.length > 0 ? (
          tools.map((tool) => (
            <View
              key={tool.id}
              className="bg-gray-200 p-4 mb-2 rounded item-center flex-row justify-between "
            >
              <View>{renderToolDetails(tool)}</View>
              <View>
                <TouchableOpacity
                  className="rounded-full flex   "
                  onPress={() => toggleSelectTool(tool.id)}
                  hitSlop={{ top: 40, bottom: 40, left: 40, right: 40 }}
                >
                  <View
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      selectedTools.includes(tool.id)
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  >
                    <MaterialCommunityIcons
                      name="pencil"
                      size={24}
                      color={
                        selectedTools.includes(tool.id) ? "#ffffff" : "#9ca3af"
                      }
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text>{t("FixedAssets.notoolsavailable")}</Text>
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
