import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
  Alert,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTranslation } from "react-i18next";
import { RootStackParamList } from "../types/types";
import CustomHeader from "../common/CustomHeader";
import ShopLoading from "./ShopLoading";
import NoData from "../common/NoData";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
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
      setShops(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      setShops([]);
      console.error(
        "Error fetching shops:",
        error?.response?.status,
        error?.message,
      );
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
      <View className="w-24 h-24  mr-4 overflow-hidden">
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
        title={t("ExploreShops.ExploreShops") || "Explore Shops"}
        showBackButton={true}
        navigation={navigation}
        rightComponent={
          <TouchableOpacity
            onPress={() => navigation.navigate("OrderHistory" as any)}
            className="bg-[#3F3C57] rounded-full p-2"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <View className="flex-row items-center gap-2 px-2 py-2">
              <FontAwesome6 name="clock-rotate-left" size={16} color="white" />
            </View>
          </TouchableOpacity>
        }
      />

      <View className="flex-1 px-6 pt-4">
        {/* Search */}
        <View className="bg-[#E8E9EDCC] rounded-full px-4 py-1 mb-4 flex-row items-center shadow-sm">
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={
              t("ExploreShops.SearchShopsProducts") ||
              "Search Shops / Products..."
            }
            placeholderTextColor="#373737"
            className="flex-1 ml-2 text-base text-gray-800 h-[50px]"
          />

          {searchQuery.length === 0 ? (
            <Ionicons name="search-outline" size={28} color="#373737" />
          ) : (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-sharp" size={28} color="#373737" />
            </TouchableOpacity>
          )}
        </View>

        {loading && !refreshing ? (
          <ShopLoading text={t("GoviShop.LoadingShops") || "Loading shops..."} />
        ) : shops.length === 0 ? (
          <NoData text={t("ExploreShops.NoShopsFound") || "No shops found"} />
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
          />
        )}
      </View>
    </View>
  );
};

export default ExploreShopsScreen;
