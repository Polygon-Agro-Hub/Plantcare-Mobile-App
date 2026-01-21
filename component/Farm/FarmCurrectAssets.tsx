import {
  View,
  Text,
  Dimensions,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
  BackHandler,
  Animated,
  Modal,
  TextInput,
  RefreshControl,
} from "react-native";
import React, { useCallback, useEffect, useState, useRef } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import AntDesign from "react-native-vector-icons/AntDesign";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useIsFocused, useRoute } from "@react-navigation/native";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import { PieChart } from "react-native-chart-kit";
import LottieView from "lottie-react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useSelector } from "react-redux";
import type { RootState } from "@/services/reducxStore";
import { Feather, FontAwesome } from "@expo/vector-icons";

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
  totalSum: string;
  items: AssetItem[];
}

type FarmCurrectAssetsNavigationProp = StackNavigationProp<
  RootStackParamList,
  "FarmCurrectAssets"
>;

type RouteParams = {
  farmId: number;
  farmName: string;
};

interface FarmCurrectAssetsProps {
  navigation: FarmCurrectAssetsNavigationProp;
}

interface UserData {
  role: string;
}

// Import the icons
const icon = require("../../assets/images/icon.webp");
const icon2 = require("../../assets/images/icon2.webp");
const icon3 = require("../../assets/images/icon3.webp");
const icon4 = require("../../assets/images/icon4.webp");
const icon5 = require("../../assets/images/icon5.webp");
const icon6 = require("../../assets/images/icon6.webp");
const icon7 = require("../../assets/images/icon7.webp");

const FarmCurrectAssets: React.FC<FarmCurrectAssetsProps> = ({ navigation }) => {
  const [assetData, setAssetData] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [language, setLanguage] = useState("en");
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});
  const { t, i18n } = useTranslation();
  const route = useRoute();
  const { farmId, farmName } = route.params as RouteParams;
  const [selectedFarmName, setSelectedFarmName] = useState(farmName);
  const [currentFarmId, setCurrentFarmId] = useState(farmId);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AssetItem | null>(null);
  const [updateQuantity, setUpdateQuantity] = useState(0);
  const [updateUnitPrice, setUpdateUnitPrice] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const assets = useSelector((state: RootState) => state.assets.assetsData);
  const user = useSelector(
    (state: RootState) => state.user.userData
  ) as UserData | null;

  // Function to get the auth token
  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) throw new Error(t("Main.somethingWentWrong"));
      return token;
    } catch (error) {
      return null;
    }
  };

  // Function to aggregate duplicate items
  const aggregateAssetItems = (items: AssetItem[]): AssetItem[] => {
    const itemMap = new Map<string, AssetItem>();

    items.forEach(item => {
      // Create a unique key combining asset name, batch number, AND unit price
      const key = `${item.asset.trim().toLowerCase()}_${item.batchNum.trim()}_${item.pricePerUnit}`;
      
      if (itemMap.has(key)) {
        // If item exists with same asset, batch, and price, aggregate the quantities and totals
        const existingItem = itemMap.get(key)!;
        existingItem.quantity = Number(existingItem.quantity) + Number(item.quantity);
        existingItem.total = Number(existingItem.total) + Number(item.total);
      } else {
        // If new combination, add as separate item with converted numbers
        itemMap.set(key, { 
          ...item,
          quantity: Number(item.quantity) || 0,
          total: Number(item.total) || 0
        });
      }
    });

    return Array.from(itemMap.values());
  };

  // Handle edit icon click
  const handleEditClick = (item: AssetItem) => {
    setSelectedItem(item);
    // Convert to integer when displaying
    setUpdateQuantity(Math.floor(item.quantity));
    setUpdateUnitPrice(item.pricePerUnit.toString());
    setModalVisible(true);
  };

  // Handle quantity change - only integer values
  const handleQuantityChange = (increment: boolean) => {
    setUpdateQuantity(prev => {
      const newValue = increment ? prev + 1 : prev - 1;
      return newValue < 0 ? 0 : newValue;
    });
  };

  // Handle update submission
  const handleUpdateAsset = async () => {
    if (!selectedItem) {
      Alert.alert("Error", "No item selected");
      return;
    }

    // Show confirmation dialog if quantity is 0
    if (updateQuantity === 0) {
      Alert.alert(
        t("CurrentAssets.Confirm Deletion"),
        t("CurrentAssets.Setting quantity to 0 will clear this record. Do you want to continue?"),
        [
          {
            text: t("CurrentAssets.Cancel"),
            style: "cancel"
          },
          {
            text: t("CurrentAssets.Yes, Clear Record"),
            onPress: async () => {
              await performUpdate();
            }
          }
        ]
      );
    } else {
      await performUpdate();
    }
  };

  // Separate function to perform the actual update
  const performUpdate = async () => {
    if (!selectedItem) {
      Alert.alert("Error", "No item selected");
      return;
    }

    try {
      setIsUpdating(true);
      const token = await getAuthToken();
      if (!token) {
        Alert.alert("Error", t("Main.somethingWentWrong"));
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
        }
      );

      if (response.data.status === 'success') {
        Alert.alert(
          t("CurrentAssets.Success"), 
          updateQuantity === 0 
            ? t("CurrentAssets.Asset record cleared successfully")
            : t("CurrentAssets.Asset updated successfully"),
          [{ text: t("Farms.okButton") }]
        );
        setModalVisible(false);
        fetchCurrentAssets(farmId);
      }
    } catch (error) {
      console.error("Error updating asset:", error);
      Alert.alert("Error", "Failed to update asset");
    } finally {
      setIsUpdating(false);
    }
  };

  // Reset component state when farmId changes
  useEffect(() => {
    if (farmId !== currentFarmId) {
      setCurrentFarmId(farmId);
      setSelectedFarmName(farmName);
      setAssetData([]);
      setExpandedCategories({});
      setLoading(true);
      fetchCurrentAssets(farmId);
    }
  }, [farmId, farmName]);

  // Initial load and focus effect - REMOVED AUTO REFRESH
  useFocusEffect(
    React.useCallback(() => {
      setSelectedFarmName(farmName);
      setCurrentFarmId(farmId);
      setAssetData([]);
      setExpandedCategories({});
      setLoading(true);
      fetchCurrentAssets(farmId);
    }, [farmId, farmName])
  );

  const fetchCurrentAssets = useCallback(async (targetFarmId?: number) => {
    const farmIdToUse = targetFarmId || farmId;
    
    try {
      setLoading(true);
      const token = await getAuthToken();
      if (!token) {
        setAssetData([]);
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${environment.API_BASE_URL}api/farm/currentAsset/${farmIdToUse}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("API Response:", response.data);

      if (response.data && response.data.currentAssetsByCategory) {
        // Process and aggregate duplicate items
        const assetsData = Array.isArray(response.data.currentAssetsByCategory) 
          ? response.data.currentAssetsByCategory.map((asset: Asset) => ({
              ...asset,
              items: Array.isArray(asset.items) ? aggregateAssetItems(asset.items) : []
            }))
          : [];
        
        if (farmIdToUse === farmId) {
          setAssetData(assetsData);
        }
      } else {
        if (farmIdToUse === farmId) {
          setAssetData([]);
        }
      }
    } catch (error) {
      console.error("Error fetching assets for farm", farmIdToUse, ":", error);
      if (farmIdToUse === farmId) {
        setAssetData([]);
      }
    } finally {
      if (farmIdToUse === farmId) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [farmId, t]);

  // Pull to refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCurrentAssets(farmId);
  }, [farmId, fetchCurrentAssets]);

  // Back button handler
  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        if (user?.role === "Owner") {
          navigation.navigate("Main", {
            screen: "FarmDetailsScreen",
            params: { farmId, farmName },
          });
        } else {
          navigation.goBack();
        }
        return true;
      };

      const subscription = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
      return () => subscription.remove();
    }, [navigation, user?.role, farmId, farmName])
  );

  // Language setup - REMOVED AUTO REFRESH INTERVAL
  useFocusEffect(
    useCallback(() => {
      const selectedLanguage = t("CurrentAssets.LNG");
      setLanguage(selectedLanguage);
    }, [t])
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
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
      default:
        return "#000000";
    }
  };

  const getTranslatedCategory = (category: string) => {
    return t(`CurrentAssets.${category}`) || category;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const pieData = assetData && assetData.length > 0
    ? assetData.map((asset) => ({
        name: getTranslatedCategory(asset.category),
        population: Number(asset.totalSum) || 0,
        color: getColorByAssetType(asset.category),
        legendFontColor: "#7F7F7F",
        legendFontSize: 11,
      }))
    : [];

  if (loading) {
    return (
      <View className="flex-1 bg-white">
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

  const totalPopulation = pieData.reduce((sum, item) => sum + item.population, 0);

  const renderFarmName = (
    <Text className="font-bold text-xl flex-1 pt-0 text-center">{farmName}</Text>
  );

  return (
    <View className="flex-1 bg-[#F7F7F7]">
      {/* Header */}
      <View
        className="flex-row"
        style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
      >
        <TouchableOpacity
          className="z-50"
          onPress={() =>
            user && user.role === "Owner"
              ? navigation.navigate("Main", {
                  screen: "FarmDetailsScreen",
                  params: { farmId: farmId, farmName: selectedFarmName },
                })
              : navigation.goBack()
          }
        >
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

        <Text className="font-bold text-xl flex-1 pt-2 text-center -ml-[15%]">
          {renderFarmName}
        </Text>
      </View>

      {/* Tabs */}
      {user && user.role !== "Supervisor" && (
        <View className="flex-row ml-8 mr-8 mt-2 justify-center">
          <View className="w-1/2">
            <TouchableOpacity>
              <Text className="text-black text-center font-semibold text-lg">
                {t("CurrentAssets.currentAssets")}
              </Text>
              <View className="border-t-[2px] border-black" />
            </TouchableOpacity>
          </View>
          <View className="w-1/2">
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("FarmFixDashBoard", {
                  farmId: farmId,
                  farmName: selectedFarmName,
                })
              }
            >
              <Text className="text-black text-center font-semibold text-lg">
                {t("CurrentAssets.fixedAssets")}
              </Text>
              <View className="border-t-[2px] border-[#D9D9D9]" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Pie Chart */}
      <View className="item-center">
        <View
          className="bg-white rounded-lg mt-6 mx-[4%] mb-6 shadow-lg"
          style={{
            shadowColor: "gray",
            shadowOffset: { width: 1, height: 1 },
            shadowOpacity: 0.8,
            shadowRadius: 2,
            elevation: 4,
          }}
        >
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
                }}
                hasLegend={false}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="20"
              />

              <View style={{ marginLeft: -120, marginTop: 10 }}>
                {pieData.map((data, index) => (
                  <View key={index} style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                      <View
                        style={{
                          width: 4,
                          height: 16,
                          backgroundColor: data.color,
                          marginRight: 8,
                        }}
                      />
                      <Text style={{ fontSize: 12, color: "#000" }}>
                        {((data.population / totalPopulation) * 100).toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View className="self-center">
              <LottieView
                source={require("../../assets/jsons/currentassetempty.json")}
                autoPlay
                loop
                style={{ width: 200, height: 200 }}
              />
            </View>
          )}
        </View>

        {/* Asset Cards with Expandable Items - WITH REFRESH CONTROL */}
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
          className="h-[50%] mt-[-5%]"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#000000"]}
              tintColor="#000000"
            />
          }
        >
          <View className="items-center pt-[5%] gap-y-3">
            {assetData && assetData.length > 0 ? (
              assetData.map((asset, index) => (
                <View
                  key={`${farmId}-${asset.category}-${index}`}
                  className="w-[90%]"
                >
                  {/* Category Header - Touchable */}
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
                      <View>
                        <Image
                          source={getIconByAssetType(asset.category)}
                          className="w-[24px] h-[24px] mr-2"
                        />
                      </View>

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
                        {t("CurrentAssets.rs")}
                        {Number(asset.totalSum).toLocaleString("en-LK")}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Expandable Items List */}
                  {expandedCategories[asset.category] && (
                    <View className="bg-white rounded-b-md mt-1 px-3 py-2">
                      {/* Table Header */}
                      <View className="flex-row bg-white rounded-md py-2 px-3 mb-2">
                        <Text className="flex-1 text-xs font-semibold text-gray-600">{t("CurrentAssets.Asset")}</Text>
                        <Text className="w-[50px] text-xs font-semibold text-gray-600 text-center">{t("CurrentAssets.B.No")}</Text>
                        <Text className="w-[80px] text-xs font-semibold text-gray-600 text-center">{t("CurrentAssets.Qty")}</Text>
                        <Text className="w-[20px]"></Text>
                      </View>
                      <View className="border-b border-[#5C5C5C] border-b-[0.8px] mt-[-5%]"></View>

                      {/* Items */}
                      {asset.items && asset.items.length > 0 ? (
                        asset.items.map((item, itemIndex) => (
                          <View
                            key={`${item.id}-${itemIndex}`}
                            className="bg-white rounded-md mb-2 p-3"
                          >
                            <View className="flex-row items-center justify-between">
                              <View className="flex-1">
                                <Text className="text-sm text-gray-800" numberOfLines={1}>
                                  {item.asset}
                                </Text>
                              </View>
                              
                              <View className="w-[50px] items-center">
                                <Text className="text-xs text-gray-700">{item.batchNum || '-'}</Text>
                              </View>

                              <View className="w-[80px] items-center">
                                <Text className="text-xs font-semibold text-gray-800">
                                  {!isNaN(item.quantity) && item.quantity !== null && item.quantity !== undefined
                                    ? Math.floor(Number(item.quantity))
                                    : 0}
                                </Text>
                              </View>

                              <TouchableOpacity 
                                className="w-[18px] items-center"
                                onPress={() => handleEditClick(item)}
                              >
                                <FontAwesome name="edit" size={18} color="#0021F5" />
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))
                      ) : (
                        <View className="py-4 items-center">
                          <Text className="text-gray-500">{t("CurrentAssets.No items found")}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View className="w-[90%] items-center py-10">
                <Text className="text-gray-500 text-lg">{t("CurrentAssets.No assets found")}</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Floating Action Button */}
        <TouchableOpacity
          className="absolute mb-[-2%] bottom-12 right-6 bg-gray-800 w-16 h-16 rounded-full items-center justify-center shadow-lg"
          onPress={() =>
            navigation.navigate("FarmAddCurrentAsset", {
              farmId: farmId,
              farmName: selectedFarmName,
            })
          }
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 8,
          }}
        >
          <Image
            className="w-[20px] h-[20px]"
            source={require("../../assets/images/Farm/plusfarm.png")}
          />
        </TouchableOpacity>
      </View>

      {/* Update Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl w-[85%] max-h-[70%]">
            <Text className="text-lg font-semibold text-center pt-6 pb-4">{t("CurrentAssets.Update Asset")}</Text>

            <ScrollView 
              className="px-6"
              showsVerticalScrollIndicator={false}
            >
              {/* Asset Name */}
              <View className="mb-4">
                <Text className="text-sm text-black mb-2">{t("CurrentAssets.Asset")}</Text>
                <View className="bg-[#F6F6F6] rounded-full">
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={true}
                    persistentScrollbar={true}
                    contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 12 }}
                    style={{ maxHeight: 45 }}
                  >
                    <Text className="text-base">
                      {selectedItem?.asset}
                    </Text>
                  </ScrollView>
                </View>
              </View>

              {/* Batch Number */}
              <View className="mb-4">
                <Text className="text-sm text-black mb-2">{t("CurrentAssets.Batch No")}</Text>
                <View className="bg-[#F6F6F6] rounded-full p-3">
                  <Text className="text-base">{selectedItem?.batchNum}</Text>
                </View>
              </View>

              {/* Quantity - Integer only */}
              <View className="mb-3">
                <Text className="text-sm text-black mb-1">{t("CurrentAssets.Quantity")}</Text>
                <View className="flex-row items-center justify-between bg-[#F6F6F6] rounded-full px-3 py-3">
                  <TouchableOpacity
                    onPress={() => handleQuantityChange(false)}
                  >
                    <Image
                      source={require('../../assets/images/Farm/Minus.png')}
                      className="w-[20px] h-[20px]"
                    />
                  </TouchableOpacity>
                  <TextInput
                    className="text-base font-semibold text-center flex-1 mx-2 py-0"
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
                      source={require('../../assets/images/Farm/Plus.png')}
                      className="w-[20px] h-[20px]"
                    />             
                  </TouchableOpacity>
                </View>
                {updateQuantity === 0 && (
                  <Text className="text-red-500 text-xs mt-1">
                    {t("CurrentAssets.The total record will be cleared when updating.")}
                  </Text>
                )}
              </View>

              {/* Unit Price */}
              <View className="mb-4">
                <Text className="text-sm text-black mb-2">{t("CurrentAssets.Unit Price")}</Text>
                <View className="bg-[#F6F6F6] rounded-full p-3">
                  <Text className="text-base">{t("CurrentAssets.Rs")}.{updateUnitPrice}</Text>
                </View>
              </View>

              {/* Total Amount */}
              <View className="mb-6">
                <Text className="text-sm text-black mb-2">{t("CurrentAssets.Total Amount")}</Text>
                <View className="bg-[#F6F6F6] rounded-full p-3">
                  <Text className="text-base font-semibold">
                    {t("CurrentAssets.Rs")}.{(updateQuantity * parseFloat(updateUnitPrice || "0")).toFixed(2)}
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View className="px-6 pb-6 pt-4 gap-y-3">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="bg-[#ECECEC] rounded-full py-3 justify-center items-center"
                disabled={isUpdating}
              >
                <Text className="text-[#8E8E8E] font-semibold">{t("CurrentAssets.Cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUpdateAsset}
                className="bg-black rounded-full py-3 justify-center items-center"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-center font-semibold text-white">{t("CurrentAssets.Update")}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

export default FarmCurrectAssets;