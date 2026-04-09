import React, { useState, useCallback } from "react";
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
import { useFocusEffect } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { MaterialIcons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import CustomHeader from "../common/CustomHeader";
import districtData from "../../assets/jsons/district.json";
import assetData from "../../assets/jsons/fixed-assets.json";

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
  farmId: number;
  farmName?: string;
  landName: string;
  buildingName: string;
}

const buildLookup = (
  items: { labelKey: string; value: string }[],
  t: (key: string) => string,
): Record<string, string> =>
  items.reduce(
    (acc, { value, labelKey }) => {
      acc[value] = t(labelKey);
      return acc;
    },
    {} as Record<string, string>,
  );

const AssertsFixedView: React.FC<Props> = ({ navigation, route }) => {
  const { category } = route.params;
  const [isModalVisible, setModalVisible] = useState(false);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTools, setSelectedTools] = useState<number[]>([]);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const { t } = useTranslation();

  const District = districtData.reduce(
    (acc, item) => {
      acc[item.name] = t(item.translationKey);
      return acc;
    },
    {} as Record<string, string>,
  );

  const BuildingTypes = buildLookup(assetData.buildingTypeOptions, t);

  const Machineasset = buildLookup(assetData.machineasset, t);

  const AseetTools = buildLookup(assetData.assetOptions, t);

  const assetTypesForAssets: Record<string, string> = Object.values(
    assetData.assetTypesForAssets,
  )
    .flat()
    .reduce(
      (acc, { value, labelKey }) => {
        acc[value] = t(labelKey);
        return acc;
      },
      {} as Record<string, string>,
    );

  const toggleModal = () => setModalVisible((v) => !v);

  const translateCategory = (cat: string): string => {
    const match = assetData.categoryOptions.find((o) => o.value === cat);
    return match ? t(match.labelKey) : cat;
  };

  const fetchTools = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        console.error("No token found in AsyncStorage");
        return;
      }

      const response = await axios.get(
        `${environment.API_BASE_URL}api/auth/fixed-assets/${category}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setTools(response.data.data ? (response.data.data as Tool[]) : []);
    } catch (error) {
      console.error("Error fetching tools:", error);
      setTools([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("fixedDashboard" as any);
        return true;
      };
      const sub = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      return () => sub.remove();
    }, [navigation]),
  );

  useFocusEffect(
    useCallback(() => {
      setSelectedTools([]);
      setShowDeleteOptions(false);
      setShowDropdown(false);
      fetchTools();
    }, [category]),
  );

  const renderToolDetails = (tool: Tool) => {
    switch (category) {
      case "Land": {
        const districtDisplay =
          District[tool.district?.trim() ?? ""] ?? tool.district;
        return (
          <View className="flex-1 justify-center">
            {districtDisplay && (
              <Text className="font-semibold text-base text-[#070707]">
                {tool.landName}
              </Text>
            )}
            <Text className="text-sm text-[#6E8BC4]">{tool.farmName}</Text>
            {districtDisplay && (
              <Text className=" text-sm text-[#6E8BC4]">{districtDisplay}</Text>
            )}
          </View>
        );
      }

      case "Building and Infrastructures": {
        const buildingDisplay =
          BuildingTypes[tool.type?.trim() ?? ""] ?? tool.type;
        const districtDisplay =
          District[tool.district?.trim() ?? ""] ?? tool.district;
        return (
          <View className="flex-1 justify-center">
            <Text className="text-base font-semibold text-[#070707]">
              {tool.buildingName}
            </Text>
            <Text className="text-sm text-[#6E8BC4]">{tool.farmName}</Text>
            {buildingDisplay && (
              <Text className=" text-sm text-[#6E8BC4]">{districtDisplay}</Text>
            )}
          </View>
        );
      }

      case "Machine and Vehicles": {
        const assetDisplay =
          Machineasset[tool.asset?.trim() ?? ""] ?? tool.asset;
        const assetTypeDisplay =
          assetTypesForAssets[tool.assetType?.trim() ?? ""] ?? tool.assetType;
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
            <Text className="text-sm text-[#070707] mt-1">{tool.farmName}</Text>
          </View>
        );
      }

      case "Tools": {
        const toolDisplay = AseetTools[tool.asset?.trim() ?? ""] ?? tool.asset;
        return (
          <View className="flex-1 justify-center">
            {toolDisplay && (
              <Text className="font-bold text-base text-[#070707]">
                {toolDisplay}
              </Text>
            )}
            <Text className="text-sm text-[#070707]">{tool.farmName}</Text>
          </View>
        );
      }

      default:
        return null;
    }
  };

  const toggleSelectTool = (toolId: number) => {
    setSelectedTools((prev) => {
      if (prev.includes(toolId)) {
        const next = prev.filter((id) => id !== toolId);
        if (next.length === 0) setShowDeleteOptions(false);
        return next;
      }
      setShowDeleteOptions(true);
      return [...prev, toolId];
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

  const areAllToolsSelected = () =>
    tools.length > 0 && selectedTools.length === tools.length;

  const handleSelectAll = () => {
    setShowDropdown(false);
    if (areAllToolsSelected()) {
      setSelectedTools([]);
      setShowDeleteOptions(false);
    } else {
      setSelectedTools(tools.map((t) => t.id));
      setShowDeleteOptions(true);
    }
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
        [{ text: t("PublicForum.OK") }],
      );
      return;
    }

    Alert.alert(
      t("FixedAssets.confirmDeleteTitle"),
      selectedTools.length === 1
        ? t("FixedAssets.confirmDeleteMessageSingle")
        : t("FixedAssets.confirmDeleteMessageMultiple", {
            count: selectedTools.length,
          }),
      [
        { text: t("FixedAssets.cancelButton"), style: "cancel" },
        {
          text: t("FixedAssets.deleteButton"),
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("userToken");
              if (!token) return;

              for (const toolId of selectedTools) {
                await axios.delete(
                  `${environment.API_BASE_URL}api/auth/fixedasset/${toolId}/${category}`,
                  { headers: { Authorization: `Bearer ${token}` } },
                );
              }

              setTools((prev) =>
                prev.filter((tool) => !selectedTools.includes(tool.id)),
              );
              Alert.alert(
                t("FixedAssets.successTitle"),
                t("CurrentAssets.RemoveSuccess"),
                [{ text: t("PublicForum.OK") }],
              );
              handleCancelSelection();
            } catch (error) {
              console.error("Error deleting tools:", error);
              Alert.alert(
                t("FixedAssets.errorTitle"),
                t("FixedAssets.errorDeleteMessage"),
                [{ text: t("PublicForum.OK") }],
              );
            }
          },
        },
      ],
    );
  };

  const TabHeader = () => (
    <>
      <CustomHeader
        title={t("FixedAssets.myAssets")}
        navigation={navigation as any}
        onBackPress={() => navigation.navigate("fixedDashboard" as any)}
      />
      <View className="flex-row ml-8 mr-8 justify-center">
        <View className="w-1/2">
          <TouchableOpacity
            onPress={() =>
              (navigation as any).navigate("Main", { screen: "CurrentAssert" })
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
    </>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-[#F7F7F7]">
       <View className="flex-1 justify-center items-center">
                 <LottieView
                   source={require("../../assets/jsons/loader.json")}
                   autoPlay
                   loop
                   style={{ width: 300, height: 300 }}
                 />
               </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F7F7F7]">
      <StatusBar style="dark" />
      <TabHeader />

      {/* Category title + menu */}
      <View
        className={`flex-row mt-5 justify-between items-center px-4 ${showDropdown ? "mb-8" : ""}`}
      >
        <Text className="text-lg font-semibold">
          {translateCategory(category)}
        </Text>

        {tools.length > 0 && (
          <View className="relative">
            <TouchableOpacity onPress={() => setShowDropdown((v) => !v)}>
              <MaterialIcons name="more-vert" size={24} color="black" />
            </TouchableOpacity>

            {showDropdown && (
              <View className="absolute top-5 mb-4 right-0 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-[120px]">
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

      {/* Delete bar */}
      {showDeleteOptions && (
        <View className="px-4 mb-2">
          <TouchableOpacity
            className={`bg-red-500 p-3 rounded-full self-end w-[48%] ${
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

      {/* Tool list */}
      <ScrollView
        className="mt-2 p-4"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {tools.length > 0 ? (
          tools.map((tool) => (
            <View
              key={tool.id}
              className="bg-[#FFFFFF] border border-[#E1E1E1] mb-2 rounded flex-row justify-between items-center"
            >
              <TouchableOpacity
                className="flex-row items-center flex-1 p-4"
                onPress={() => toggleSelectTool(tool.id)}
              >
                {/* Checkbox */}
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

                {/* Details */}
                <View className="flex-1">{renderToolDetails(tool)}</View>
              </TouchableOpacity>

              {/* Edit button */}
              <TouchableOpacity
                onPress={() => handleEditTool(tool.id)}
                className={`flex items-center justify-center w-12  ${
                  selectedTools.includes(tool.id)
                    ? "bg-[#E8F5F3]"
                    : "bg-[#E8E8E8]"
                }`}
                style={{ height: "100%", minHeight: 80 }}
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
            <LottieView
              source={require("../../assets/jsons/NoComplaints.json")}
              style={{ width: wp(50), height: hp(50) }}
              autoPlay
              loop
            />
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
