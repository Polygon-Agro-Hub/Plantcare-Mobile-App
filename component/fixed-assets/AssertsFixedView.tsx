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
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
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
import NoData from "../common/NoData";
import districtData from "@/assets/jsons/common/district.json";
import assetData from "@/assets/jsons/fixed-asset/fixed-assets.json";
import LoadingPage from "../common/LoadingPage";
import { useSelector } from "react-redux";
import type { RootState } from "../../services/reducxStore";
import { RootStackParamList } from "../types/types";

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

interface UserData {
  role: string;
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
  const { category, farmId, farmName = "" } = route.params;
  const isGlobal = !farmId;

  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTools, setSelectedTools] = useState<number[]>([]);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const { t, i18n } = useTranslation();
  const user = useSelector(
    (state: RootState) => state.user.userData,
  ) as UserData | null;

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

  const getDistrictLabel = (
    districtValue: string | undefined,
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

    return District[trimmed] ?? trimmed;
  };

  const translateCategory = (cat: string): string => {
    const match = assetData.categoryOptions.find((o: any) => o.value === cat);
    if (!match) return cat;
    const lang = i18n.language
      ? i18n.language.startsWith("si")
        ? "si"
        : i18n.language.startsWith("ta")
          ? "ta"
          : "en"
      : "en";
    return match.translations[lang] || match.translations["en"] || cat;
  };

  const fetchTools = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        console.error("No token found in AsyncStorage");
        return;
      }

      const endpoint = isGlobal
        ? `${environment.API_BASE_URL}api/auth/fixed-assets/${category}`
        : `${environment.API_BASE_URL}api/farm/fixed-assets/${category}/${farmId}`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (isGlobal) {
        setTools(response.data.data ? (response.data.data as Tool[]) : []);
      } else {
        setTools(
          response.data.fixedAssets
            ? (response.data.fixedAssets as Tool[])
            : [],
        );
      }
    } catch (error: any) {
      console.error("Error fetching tools:", error);
      setTools([]);
    } finally {
      setLoading(false);
    }
  }, [category, farmId, isGlobal]);

  useFocusEffect(
    useCallback(() => {
      setSelectedTools([]);
      setShowDeleteOptions(false);
      setShowDropdown(false);
      fetchTools();
    }, [fetchTools]),
  );

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (isGlobal) {
          navigation.navigate("fixedDashboard" as any);
        } else {
          navigation.navigate("fixedDashboard" as any, { farmId, farmName });
        }
        return true;
      };
      const sub = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      return () => sub.remove();
    }, [navigation, isGlobal, farmId, farmName]),
  );

  const renderToolDetails = (tool: Tool) => {
    switch (category) {
      case "Land": {
        const districtDisplay = getDistrictLabel(tool.district);
        return (
          <View className="flex-1 justify-center">
            <Text className="font-semibold text-base text-[#070707]">
              {tool.landName}
            </Text>
            {!isGlobal && districtDisplay && (
              <Text className="text-sm text-[#6E8BC4]">{districtDisplay}</Text>
            )}
            {isGlobal && (
              <>
                <Text className="text-sm text-[#6E8BC4]">{tool.farmName}</Text>
                {districtDisplay && (
                  <Text className="text-sm text-[#6E8BC4]">
                    {districtDisplay}
                  </Text>
                )}
              </>
            )}
          </View>
        );
      }

      case "Building and Infrastructures": {
        const buildingDisplay =
          BuildingTypes[tool.type?.trim() ?? ""] ?? tool.type;
        const districtDisplay = getDistrictLabel(tool.district);
        return (
          <View className="flex-1 justify-center">
            <Text className="text-base font-semibold text-[#070707]">
              {tool.buildingName}
            </Text>
            {!isGlobal && districtDisplay && (
              <Text className="text-sm text-[#6E8BC4]">{districtDisplay}</Text>
            )}
            {isGlobal && (
              <>
                <Text className="text-sm text-[#6E8BC4]">{tool.farmName}</Text>
                {districtDisplay && (
                  <Text className="text-sm text-[#6E8BC4]">
                    {districtDisplay}
                  </Text>
                )}
              </>
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
            {isGlobal && (
              <Text className="text-sm text-[#070707] mt-1">
                {tool.farmName}
              </Text>
            )}
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
            {isGlobal && (
              <Text className="text-sm text-[#070707]">{tool.farmName}</Text>
            )}
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
        t("FixedAssets.NoToolsSelected"),
        t("FixedAssets.SelectAtLeastOneToolToDelete"),
        [{ text: t("Main.OK") }],
      );
      return;
    }

    Alert.alert(
      t("FixedAssets.ConfirmDelete"),
      selectedTools.length === 1
        ? t("FixedAssets.AreYouSureYouWantToDeleteThisAsset")
        : t("FixedAssets.AreYouSureYouWantToDeletecountAssets", {
            count: selectedTools.length,
          }),
      [
        { text: t("Main.Cancel"), style: "cancel" },
        {
          text: t("Main.Delete"),
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
                t("Main.Success"),
                t("CurrentAssets.AssetRemovedSuccessfully"),
                [{ text: t("Main.OK") }],
              );
              handleCancelSelection();
            } catch (error) {
              console.error("Error deleting tools:", error);
              Alert.alert(
                t("FixedAssets.SomethingWentWrongPleaseTryAgain"),
                t("FixedAssets.ThereWasAnErrorDeletingTheSelectedTools"),
                [{ text: t("Main.OK") }],
              );
            }
          },
        },
      ],
    );
  };

  const headerTitle = isGlobal ? t("FixedAssets.MyAssets") : farmName;

  return (
    <View className="flex-1 bg-white">
      <CustomHeader
        title={headerTitle}
        navigation={navigation as any}
        onBackPress={() => {
          if (isGlobal) {
            navigation.navigate("fixedDashboard" as any);
          } else {
            navigation.navigate("fixedDashboard" as any, { farmId, farmName });
          }
        }}
      />

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <LoadingPage fullScreen />
        </View>
      ) : (
        <>
          {/* Tabs */}
          {(!isGlobal ? user && user.role !== "Supervisor" : true) && (
            <View className="flex-row mt-2 justify-center">
              <View className="w-1/2">
                <TouchableOpacity
                  onPress={() => {
                    if (isGlobal) {
                      navigation.navigate("CurrentAssert");
                    } else {
                      navigation.navigate("Main", {
                        screen: "CurrentAssert",
                        params: { farmId, farmName },
                      });
                    }
                  }}
                >
                  <Text className="text-black text-center font-semibold text-lg">
                    {t("CurrentAssets.CurrentAssets")}
                  </Text>
                  <View className="border-t-[2px] border-[#D9D9D9] mt-2" />
                </TouchableOpacity>
              </View>
              <View className="w-1/2">
                <TouchableOpacity>
                  <Text className="text-black text-center font-semibold text-lg">
                    {t("CurrentAssets.FixedAssets")}
                  </Text>
                  <View className="border-t-[2px] border-black mt-2" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Category title + menu */}
          <View
            className={`flex-row mt-5 justify-between items-center px-6 ${showDropdown ? "mb-8" : ""}`}
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
                  <View className="absolute top-6 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-[120px]">
                    <TouchableOpacity
                      onPress={handleSelectAll}
                      className="px-4 py-2"
                    >
                      <Text className="text-sm">
                        {areAllToolsSelected()
                          ? t("FixedAssets.DeselectAll")
                          : t("FixedAssets.SelectAll")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Delete bar */}
          {showDeleteOptions && (
            <View className="mt-2 px-6">
              <View className="flex-row justify-end">
                <TouchableOpacity
                  className={`bg-red-500 p-3 w-[48%] rounded-full justify-end ${
                    selectedTools.length === 0 ? "opacity-50" : ""
                  }`}
                  disabled={selectedTools.length === 0}
                  onPress={handleDeleteSelected}
                >
                  <Text className="text-white text-center font-bold">
                    {t("FixedAssets.DeleteSelected")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Tool list */}
          <ScrollView
            className="p-4 px-6"
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {tools.length > 0 ? (
              tools.map((tool) => (
                <View
                  key={tool.id}
                  className="bg-[#FFFFFF] border border-[#E1E1E1] mb-2 rounded-xl flex-row justify-between items-center"
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
                    className={`flex items-center justify-center w-12 rounded-r ${
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
              <NoData text={t("FixedAssets.NoAssetsAvailableForThisCategory") || "No assets available for this category"} />
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
};

export default AssertsFixedView;
