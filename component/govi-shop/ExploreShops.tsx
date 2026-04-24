import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTranslation } from "react-i18next";
import { RootStackParamList } from "../types/types";
import CustomHeader from "../common/CustomHeader";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import axios from "axios";
import { environment } from "@/environment/environment";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ExploreShopsNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ExploreShopsScreen"
>;

interface ExploreShopsProps {
  navigation: ExploreShopsNavigationProp;
}

interface Shop {
  shopId: string;
  shopName: string;
  logo: string;
  approvedStatus: string;
  branchId: string;
  branchName: string;
  district: string;
  province: string;
  mobilePhone: string;
}

const ExploreShopsScreen: React.FC<ExploreShopsProps> = ({ navigation }) => {
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState("");
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [cartCount, setCartCount] = useState(3);

  const fetchShops = async (search = "") => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert(
          "Error",
          "Authentication token not found. Please login again.",
        );
        return;
      }

      const response = await axios.get(
        `${environment.API_BASE_URL}api/govi-shop/shops`,
        {
          params: { search },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setShops(response.data);
    } catch (error) {
      console.error("Error fetching shops:", error);
      setShops([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchShops(searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchShops(searchQuery);
  }, [searchQuery]);

  const renderShopItem = ({ item }: { item: Shop }) => (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate("GoviShopProfileScreen" as any, {
          shopId: item.shopId,
          branchId: item.branchId,
          shopname: item.shopName,
          logo: item.logo,
          adress: item.district,
        });
      }}
      className="flex-row items-center bg-white rounded-xl p-4 mb-3 border border-gray-100"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
      }}
      activeOpacity={0.7}
    >
      {/* Logo */}
      <View className="w-24 h-24 rounded-lg bg-gray-100 mr-4 overflow-hidden">
        <Image
          source={{ uri: item.logo }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      {/* Content */}
      <View className="flex-1 flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-base font-bold text-gray-800 mb-1">
            {item.shopName}
          </Text>

          <Text className="text-sm text-gray-500">{item.branchName}</Text>

          {item.district ? (
            <Text className="text-xs text-gray-400 mt-0.5">
              {item.district}
            </Text>
          ) : null}
        </View>

        <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      <CustomHeader
        title={t("ExploreShops.Title") || "Explore Shops"}
        showBackButton={true}
        navigation={navigation}
        rightComponent={
          <TouchableOpacity
            onPress={() => navigation.navigate("GoviShopCartScreen" as any)}
            className="bg-[#3F3C57] rounded-full p-2"
          >
            <View className="flex-row items-center gap-2 px-3 py-1">
              <Ionicons name="bag-handle" size={20} color="white" />
              {cartCount > 0 && (
                <Text className="text-white text-xs font-bold">
                  {cartCount}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        }
      />

      <View className="flex-1 px-4 pt-4">
        {/* Search */}
        <View className="bg-[#E8E9EDCC] rounded-full px-4 py-1 mb-4 flex-row items-center shadow-sm">
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={
              t("ExploreShops.SearchPlaceholder") ||
              "Search Shops / Products..."
            }
            placeholderTextColor="#373737"
            className="flex-1 ml-2 text-base text-gray-800"
          />

          {searchQuery.length === 0 ? (
            <Ionicons name="search-outline" size={20} color="#373737" />
          ) : (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#373737" />
            </TouchableOpacity>
          )}
        </View>

        {/* Loading */}
        {loading && !refreshing ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#6C63FF" />
          </View>
        ) : (
          <FlatList
            data={shops}
            renderItem={renderShopItem}
            keyExtractor={(item, index) =>
              item?.branchId?.toString() ?? index.toString()
            }
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center py-10">
                <LottieView
                  source={require("@/assets/jsons/common/no-data.json")}
                  autoPlay
                  loop
                  style={{ width: 250, height: 250 }}
                />
                <Text className="text-[#7A9BC9] text-base mt-4 text-center">
                  {t("ExploreShops.NoShopsFound") || "No shops found"}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

export default ExploreShopsScreen;
