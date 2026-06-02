import {
  View,
  Text,
  Dimensions,
  Image,
  ScrollView,
  TouchableOpacity,
  BackHandler,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/types";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRoute, RouteProp } from "@react-navigation/native";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import { PieChart } from "react-native-chart-kit";
import LottieView from "lottie-react-native";
import { useSelector } from "react-redux";
import type { RootState } from "../../services/reducxStore";
import { FontAwesome } from "@expo/vector-icons";
import CustomHeader from "../common/CustomHeader";
import LoadingPage from "../common/LoadingPage";

interface AssetItem {
  id: number;
  category: string;
  asset: string;
  brand: string;
  batchNum: string;
  quantity: number;
  unit: string;
  unitVolume: number;
  pricePerUnit: number;
  total: number;
  purchaseDate: string;
  expireDate: string;
  status: string;
}

interface Asset {
  category: string;
  totalSum: string | number;
  items?: AssetItem[];
}

type CurrentAssetNavigationProp = StackNavigationProp<
  RootStackParamList,
  "CurrentAssert"
>;

type CurrentAssetRouteProp = RouteProp<RootStackParamList, "CurrentAssert">;

interface CurrentAssetProps {
  navigation: CurrentAssetNavigationProp;
  route: CurrentAssetRouteProp;
}

interface UserData {
  role: string;
}

const icon = require("../../assets/images/currect-assets/icon.webp");
const icon2 = require("../../assets/images/currect-assets/icon2.webp");
const icon3 = require("../../assets/images/currect-assets/icon3.webp");
const icon4 = require("../../assets/images/currect-assets/icon4.webp");
const icon5 = require("../../assets/images/currect-assets/icon5.webp");
const icon7 = require("../../assets/images/currect-assets/icon7.webp");

const CurrentAssert: React.FC<CurrentAssetProps> = ({ navigation, route }) => {
  const params = route.params;
  const farmId = params?.farmId;
  const farmName = params?.farmName || "";
  const isGlobal = !farmId;

  const [assetData, setAssetData] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<{
    [key: string]: boolean;
  }>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AssetItem | null>(null);
  const [updateQuantity, setUpdateQuantity] = useState(0);
  const [updateUnitPrice, setUpdateUnitPrice] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const { t, i18n } = useTranslation();
  const assets = useSelector((state: RootState) => state.assets.assetsData);
  const user = useSelector(
    (state: RootState) => state.user.userData,
  ) as UserData | null;

  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token)
        throw new Error(t("Main.SomethingWentWrongPleaseTryAgainlater"));
      return token;
    } catch (error) {
      return null;
    }
  };

  const fetchCurrentAssets = useCallback(async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        setAssetData([]);
        setLoading(false);
        return;
      }

      const endpoint = isGlobal
        ? `${environment.API_BASE_URL}api/auth/currentAsset`
        : `${environment.API_BASE_URL}api/farm/currentAsset/${farmId}`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.currentAssetsByCategory) {
        const assetsData = Array.isArray(response.data.currentAssetsByCategory)
          ? response.data.currentAssetsByCategory.map((asset: any) => ({
              ...asset,
              items: Array.isArray(asset.items) ? asset.items : [],
            }))
          : [];
        setAssetData(assetsData);
      } else {
        setAssetData([]);
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
      setAssetData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [farmId, isGlobal, t]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      setExpandedCategories({});
      fetchCurrentAssets();
    }, [farmId, fetchCurrentAssets]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCurrentAssets();
  }, [fetchCurrentAssets]);

  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        if (!isGlobal) {
          if (user?.role === "Owner") {
            navigation.navigate("Main", {
              screen: "FarmDetailsScreen",
              params: { farmId, farmName },
            });
          } else {
            navigation.goBack();
          }
        } else {
          navigation.navigate("Dashboard");
        }
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackPress,
      );
      return () => subscription.remove();
    }, [navigation, isGlobal, user?.role, farmId, farmName]),
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleEditClick = (item: AssetItem) => {
    setSelectedItem(item);
    setUpdateQuantity(Math.floor(item.quantity));
    setUpdateUnitPrice(item.pricePerUnit.toString());
    setModalVisible(true);
  };

  const handleQuantityChange = (increment: boolean) => {
    setUpdateQuantity((prev) => {
      const newValue = increment ? prev + 1 : prev - 1;
      return newValue < 0 ? 0 : newValue;
    });
  };

  const handleUpdateAsset = async () => {
    if (!selectedItem) {
      Alert.alert("Error", "No item selected");
      return;
    }

    if (updateQuantity === 0) {
      Alert.alert(
        t("CurrentAssets.ConfirmDeletion"),
        t(
          "CurrentAssets.SettingQuantityToZeroWillClearThisRecordDoYouWantToContinue",
        ),
        [
          {
            text: t("Main.Cancel"),
            style: "cancel",
          },
          {
            text: t("CurrentAssets.YesClearRecord"),
            onPress: async () => {
              await performUpdate();
            },
          },
        ],
      );
    } else {
      await performUpdate();
    }
  };

  const performUpdate = async () => {
    if (!selectedItem) {
      Alert.alert("Error", "No item selected");
      return;
    }

    try {
      setIsUpdating(true);
      const token = await getAuthToken();
      if (!token) {
        Alert.alert("Error", t("Main.SomethingWentWrongPleaseTryAgainlater"));
        return;
      }

      const totalAmount = updateQuantity * parseFloat(updateUnitPrice);
      const assetId = selectedItem.id;

      const response = await axios.put(
        `${environment.API_BASE_URL}api/farm/currentAsset/update/${assetId}`,
        {
          numberOfUnits: updateQuantity,
          unitPrice: parseFloat(updateUnitPrice),
          totalPrice: totalAmount,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.status === "success") {
        Alert.alert(
          t("Main.Success"),
          updateQuantity === 0
            ? t("CurrentAssets.AssetRecordClearedSuccessfully")
            : t("CurrentAssets.AssetUpdatedSuccessfully"),
          [{ text: t("Main.OK") }],
        );
        setModalVisible(false);
        fetchCurrentAssets();
      }
    } catch (error) {
      console.error("Error updating asset:", error);
      Alert.alert("Error", "Failed to update asset");
    } finally {
      setIsUpdating(false);
    }
  };

  const getColorByAssetType = (assetType: string) => {
    const normalizedType = assetType.trim().toLowerCase();
    switch (normalizedType) {
      case "agro chemicals":
        return "#5687F2";
      case "fertilizers":
      case "fertilizer":
        return "#31101D";
      case "seeds and seedlings":
      case "seed and seedling":
        return "#60CA3B";
      case "livestock for sale":
        return "#EA3A88";
      case "animal feed":
        return "#EAB308";
      case "other consumables":
        return "#999999";
      case "greenhouse":
        return "#f5a623";
      case "machinery":
        return "#f44242";
      default:
        return "#000000";
    }
  };

  const getTranslatedCategory = (category: string) => {
    const categoryData = require("@/assets/jsons/current-asset/categories.json");
    const item = categoryData.find((c: any) => c.value === category);
    const lang = i18n.language
      ? i18n.language.startsWith("si")
        ? "si"
        : i18n.language.startsWith("ta")
          ? "ta"
          : "en"
      : "en";
    return item ? item.translations[lang] || item.translations["en"] : category;
  };

  const getTranslatedAsset = (assetName: string) => {
    if (assetName === "Other") return t("CurrentAssets.Other");
    const assetTranslationData = require("@/assets/jsons/current-asset/assets-translations.json");
    const item = assetTranslationData.find((a: any) => a.value === assetName);
    const lang = i18n.language
      ? i18n.language.startsWith("si")
        ? "si"
        : i18n.language.startsWith("ta")
          ? "ta"
          : "en"
      : "en";
    return item
      ? item.translations[lang] || item.translations["en"]
      : assetName;
  };

  const CATEGORY_ORDER = [
    "Agro chemicals",
    "Fertilizers",
    "Seeds and Seedlings",
    "Livestock for sale",
    "Animal feed",
    "Other consumables",
  ];

  const sortedAssetData = [...(assetData ?? [])].sort((a, b) => {
    const indexA = CATEGORY_ORDER.findIndex(
      (cat) => cat.toLowerCase() === a.category.toLowerCase(),
    );
    const indexB = CATEGORY_ORDER.findIndex(
      (cat) => cat.toLowerCase() === b.category.toLowerCase(),
    );

    const orderA = indexA === -1 ? CATEGORY_ORDER.length : indexA;
    const orderB = indexB === -1 ? CATEGORY_ORDER.length : indexB;
    return orderA - orderB;
  });

  const pieData = sortedAssetData.length
    ? sortedAssetData.map((asset) => ({
        name: getTranslatedCategory(asset.category),
        population: Number(asset.totalSum) || 0,
        color: getColorByAssetType(asset.category),
        legendFontColor: "#7F7F7F",
        legendFontSize: 11,
        legndMarginLeft: 10,
      }))
    : [];

  if (loading) {
    return <LoadingPage fullScreen />;
  }

  const totalPopulation = pieData.reduce(
    (sum, item) => sum + item.population,
    0,
  );

  const headerTitle = isGlobal
    ? assets?.farmName === "My Assets"
      ? t("CurrentAssets.MyAssets")
      : "Farm"
    : farmName;

  return (
    <View className="flex-1 bg-[#F7F7F7]">
      <CustomHeader
        title={headerTitle}
        navigation={navigation}
        onBackPress={() => {
          if (!isGlobal) {
            if (user?.role === "Owner") {
              navigation.navigate("Main", {
                screen: "FarmDetailsScreen",
                params: { farmId, farmName },
              });
            } else {
              navigation.goBack();
            }
          } else {
            navigation.navigate("Dashboard");
          }
        }}
        transparent
        titleStyle={{ color: "black" }}
      />

      {/* Tabs */}
      {(!isGlobal ? user && user.role !== "Supervisor" : true) && (
        <View className="flex-row mt-2 justify-center">
          <View className="w-1/2">
            <TouchableOpacity>
              <Text className="text-black text-center font-semibold text-lg">
                {t("CurrentAssets.CurrentAssets")}
              </Text>
              <View className="border-t-[2px] border-black mt-2" />
            </TouchableOpacity>
          </View>
          <View className="w-1/2">
            <TouchableOpacity
              onPress={() => {
                if (isGlobal) {
                  navigation.navigate("fixedDashboard");
                } else {
                  navigation.navigate("fixedDashboard", {
                    farmId: farmId,
                    farmName: farmName,
                  });
                }
              }}
            >
              <Text className="text-black text-center font-semibold text-lg">
                {t("CurrentAssets.FixedAssets")}
              </Text>
              <View className="border-t-[2px] border-[#D9D9D9] mt-2" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Pie Chart */}
      <View className="item-center">
        <View className="bg-white rounded-xl mt-6 mx-6 mb-6 shadow-lg">
          {pieData && pieData.length > 0 ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 45,
              }}
            >
              <PieChart
                data={pieData}
                width={Dimensions.get("window").width}
                height={180}
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
                hasLegend={false}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="20"
                style={{
                  alignItems: "center",
                }}
              />

              <View style={{ marginLeft: -120, marginTop: 10 }}>
                {pieData.map((data, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <View
                        style={{
                          width: 4,
                          height: 16,
                          backgroundColor: data.color,
                          borderRadius: 0,
                          marginRight: 8,
                        }}
                      />
                      <View>
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#000",
                          }}
                        >
                          {totalPopulation > 0
                            ? (
                                (data.population / totalPopulation) *
                                100
                              ).toFixed(1)
                            : "0.0"}
                          %
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View className="self-center">
              <LottieView
                source={require("@/assets/jsons/current-asset/current-asset-empty.json")}
                autoPlay
                loop
                style={{ width: 200, height: 200 }}
              />
            </View>
          )}
        </View>

        {/* Scrollable list of categories/items */}
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
          className="h-[50%] pt-3"
          refreshControl={
            !isGlobal ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#000000"]}
                tintColor="#000000"
              />
            ) : undefined
          }
        >
          <View className="items-center gap-y-3">
            {sortedAssetData.length > 0 ? (
              sortedAssetData.map((asset, index) => (
                <View
                  key={`${farmId || "global"}-${asset.category}-${index}`}
                  className="w-[90%]"
                >
                  {isGlobal ? (
                    /* Global Static View */
                    <View className="bg-white flex-row h-[60px] rounded-xl justify-between items-center px-4 shadow-sm">
                      <View className="flex-row items-center">
                        <Image
                          source={getIconByAssetType(asset.category)}
                          className="w-[24px] h-[24px] mr-2"
                        />
                        <Text>
                          {getTranslatedCategory(asset.category).length > 20
                            ? getTranslatedCategory(asset.category)
                                .split(" ")
                                .slice(0, 2)
                                .join(" ") +
                              "\n" +
                              getTranslatedCategory(asset.category)
                                .split(" ")
                                .slice(2)
                                .join(" ")
                            : getTranslatedCategory(asset.category)}
                        </Text>
                      </View>
                      <View>
                        <Text>
                          {t("CurrentAssets.Rs")}
                          {Number(asset.totalSum).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    /* Farm-specific Expandable View */
                    <View>
                      <TouchableOpacity
                        onPress={() => toggleCategory(asset.category)}
                        className="bg-white flex-row h-[60px] rounded-md justify-between items-center px-4 shadow-sm"
                        style={{
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.1,
                          shadowRadius: 2,
                          elevation: 2,
                        }}
                      >
                        <View className="flex-row items-center flex-1">
                          <Image
                            source={getIconByAssetType(asset.category)}
                            className="w-[24px] h-[24px] mr-2"
                          />
                          <View className="flex-1">
                            <Text>
                              {getTranslatedCategory(asset.category).length > 20
                                ? getTranslatedCategory(asset.category)
                                    .split(" ")
                                    .slice(0, 2)
                                    .join(" ") +
                                  "\n" +
                                  getTranslatedCategory(asset.category)
                                    .split(" ")
                                    .slice(2)
                                    .join(" ")
                                : getTranslatedCategory(asset.category)}
                            </Text>
                          </View>
                        </View>
                        <View className="flex-row items-center">
                          <Text>
                            {t("CurrentAssets.Rs")}
                            {Number(asset.totalSum).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </Text>
                        </View>
                      </TouchableOpacity>

                      {expandedCategories[asset.category] && (
                        <View className="bg-white rounded-b-md mt-1 px-3 py-2">
                          <View className="flex-row bg-white rounded-md py-2 px-3 mb-2">
                            <Text className="flex-1 text-xs text-[#5C5C5C]">
                              {t("CurrentAssets.Asset")}
                            </Text>
                            <Text className="w-[50px] text-xs text-[#5C5C5C] text-center">
                              {t("CurrentAssets.BNo")}
                            </Text>
                            <Text className="w-[80px] text-xs text-[#5C5C5C] text-center">
                              {t("CurrentAssets.Qty")}
                            </Text>
                            <Text className="w-[20px]"></Text>
                          </View>
                          <View className="border-b border-[#5C5C5C] border-b-[0.8px] mt-[-5%]"></View>

                          {asset.items && asset.items.length > 0 ? (
                            asset.items.map((item, itemIndex) => (
                              <View
                                key={`${item.id}-${itemIndex}`}
                                className="bg-white rounded-md mb-2 p-3"
                              >
                                <View className="flex-row items-center justify-between">
                                  <View className="flex-1">
                                    <Text
                                      className="text-sm font-semibold text-gray-800"
                                      numberOfLines={1}
                                    >
                                      {getTranslatedAsset(item.asset)}
                                    </Text>
                                  </View>

                                  <View className="w-[50px] items-center">
                                    <Text className="text-xs font-semibold text-gray-800">
                                      {item.batchNum || "-"}
                                    </Text>
                                  </View>

                                  <View className="w-[80px] items-center">
                                    <Text className="text-xs font-semibold text-gray-800">
                                      {!isNaN(item.quantity) &&
                                      item.quantity !== null &&
                                      item.quantity !== undefined
                                        ? Math.floor(Number(item.quantity))
                                        : 0}
                                    </Text>
                                  </View>

                                  <TouchableOpacity
                                    className="w-[18px] items-center"
                                    onPress={() => handleEditClick(item)}
                                  >
                                    <FontAwesome
                                      name="edit"
                                      size={18}
                                      color="#0021F5"
                                    />
                                  </TouchableOpacity>
                                </View>
                              </View>
                            ))
                          ) : (
                            <View className="py-4 items-center">
                              <Text className="text-gray-500">
                                {t("CurrentAssets.No items found")}
                              </Text>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View className="w-[90%] items-center py-10">
                <Text className="text-gray-500 text-lg">
                  {t("CurrentAssets.NoAssetsFound")}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-20 right-6 bg-gray-800 w-16 h-16 rounded-full items-center justify-center shadow-lg"
        onPress={() => {
          if (isGlobal) {
            navigation.navigate("AddAsset");
          } else {
            navigation.navigate("AddAsset", {
              farmId: farmId,
              farmName: farmName,
            });
          }
        }}
        accessibilityLabel="Add new asset"
        accessibilityRole="button"
      >
        <Image
          className="w-[20px] h-[20px]"
          source={require("../../assets/images/farms/plus-white.webp")}
        />
      </TouchableOpacity>

      {/* Update Modal */}
      {!isGlobal && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white rounded-2xl w-[85%]">
              <Text className="text-lg font-semibold text-center pt-4 pb-3">
                {t("CurrentAssets.UpdateAsset")}
              </Text>

              <View className="px-5">
                <View className="mb-2">
                  <Text className="text-base text-black mb-1">
                    {t("CurrentAssets.Asset")}
                  </Text>
                  <View className="bg-[#F6F6F6] rounded-3xl h-[50px] justify-center">
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                      }}
                      style={{ maxHeight: 38 }}
                    >
                      <Text className="text-base">
                        {selectedItem
                          ? getTranslatedAsset(selectedItem.asset)
                          : ""}
                      </Text>
                    </ScrollView>
                  </View>
                </View>

                {/* Batch Number */}
                <View className="mb-2">
                  <Text className="text-base text-black mb-1">
                    {t("CurrentAssets.BatchNo")}
                  </Text>
                  <View className="bg-[#F6F6F6] rounded-3xl px-3 justify-center h-[50px]">
                    <Text className="text-base">{selectedItem?.batchNum}</Text>
                  </View>
                </View>

                {/* Quantity */}
                <View className="mb-2">
                  <Text className="text-base text-black mb-1">
                    {t("CurrentAssets.Quantity")}
                  </Text>
                  <View className="flex-row items-center justify-between bg-[#F6F6F6] rounded-full px-3 py-2">
                    <TouchableOpacity
                      onPress={() => handleQuantityChange(false)}
                    >
                      <Image
                        source={require("../../assets/images/farms/farm-minus.webp")}
                        className="w-[30px] h-[30px]"
                      />
                    </TouchableOpacity>
                    <TextInput
                      className="text-base font-semibold text-center flex-1 mx-2 py-0 h-[40px]"
                      value={updateQuantity.toString()}
                      onChangeText={(text) => {
                        const numValue = parseInt(text) || 0;
                        setUpdateQuantity(numValue < 0 ? 0 : numValue);
                      }}
                      keyboardType="numeric"
                      selectTextOnFocus
                    />
                    <TouchableOpacity
                      onPress={() => handleQuantityChange(true)}
                    >
                      <Image
                        source={require("../../assets/images/farms/farm-plus.webp")}
                        className="w-[30px] h-[30px]"
                      />
                    </TouchableOpacity>
                  </View>
                  {updateQuantity === 0 && (
                    <Text className="text-red-500 text-xs mt-1">
                      {t(
                        "CurrentAssets.YouHaveSetTheQuantityToZeroTheTotalRecordWillBeClearedWhenUpdating",
                      )}
                    </Text>
                  )}
                </View>

                <View className="flex-row gap-x-2 mb-3">
                  <View className="flex-1">
                    <Text className="text-base text-black mb-1">
                      {t("CurrentAssets.UnitPrice")}
                    </Text>
                    <View className="bg-[#F6F6F6] rounded-3xl h-[50px] justify-center px-3 py-2">
                      <Text className="text-sm" numberOfLines={1}>
                        {t("CurrentAssets.Rs")}.{" "}
                        {parseFloat(updateUnitPrice || "0").toLocaleString(
                          "en-US",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        )}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-1">
                    <Text className="text-base text-black mb-1">
                      {t("CurrentAssets.TotalAmount")}
                    </Text>
                    <View className="bg-[#F6F6F6] rounded-full px-3 h-[50px] justify-center">
                      <Text className="text-sm font-semibold" numberOfLines={1}>
                        {t("CurrentAssets.Rs")}.{" "}
                        {(
                          updateQuantity * parseFloat(updateUnitPrice || "0")
                        ).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="px-5 pb-5 pt-1 gap-y-2">
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="bg-[#ECECEC] rounded-full h-[50px] justify-center items-center"
                  disabled={isUpdating}
                >
                  <Text className="text-[#8E8E8E] font-semibold text-lg">
                    {t("Main.Cancel")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleUpdateAsset}
                  className="bg-black rounded-full h-[50px] justify-center items-center"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-center font-semibold text-white text-lg">
                      {t("Main.Update")}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const getIconByAssetType = (assetType: string) => {
  switch (assetType) {
    case "Agro chemicals":
      return icon;
    case "Fertilizers":
      return icon2;
    case "Seeds and Seedlings":
      return icon3;
    case "Livestock for sale":
      return icon4;
    case "Animal feed":
      return icon5;
    case "Other consumables":
      return icon7;
    default:
      return icon;
  }
};

export default CurrentAssert;
