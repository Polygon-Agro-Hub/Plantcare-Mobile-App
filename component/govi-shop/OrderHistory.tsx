import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTranslation } from "react-i18next";
import { RootStackParamList } from "../types/types";
import CustomHeader from "../common/CustomHeader";
import { Entypo, FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import axios from "axios";
import { environment } from "@/environment/environment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Pagination from "../common/Pagination";

type OrderHistoryNavigationProp = StackNavigationProp<
  RootStackParamList,
  "OrderHistory"
>;

interface OrderHistoryProps {
  navigation: OrderHistoryNavigationProp;
}


interface ApiOrder {
  id: number | string;
  invNo?: string;
  price?: string | number;
  createdAt?: string;
  branchId?: number;
  branchName?: string;
  branchCode?: string;
  shopName?: string;
  orderNumber?: string;
  order_number?: string;
  amount?: number | string;
  totalAmount?: number | string;
  total?: number | string;
  date?: string;
  location?: string;
  shop?: { name?: string; location?: string };
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  shopName: string;
  location: string;
  amount: number;
}


const PAGE_SIZE = 4;

const OrderHistory: React.FC<OrderHistoryProps> = ({ navigation }) => {
  const { t } = useTranslation();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

 
  const formatDate = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toISOString().split("T")[0];
  };

  const fetchOrders = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.get(
        `${environment.API_BASE_URL}api/govi-shop/get-all-orders`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

    
      const rawOrders: ApiOrder[] = Array.isArray(response.data)
        ? response.data
        : (response.data?.data ?? response.data?.orders ?? []);

      const mapped: Order[] = rawOrders.map((o) => ({
        id: String(o.id),
        orderNumber: o.invNo ?? o.orderNumber ?? o.order_number ?? "",
        date: formatDate(o.createdAt ?? o.date),
        shopName: o.shopName ?? o.shop?.name ?? "",
        location: o.branchName ?? o.location ?? o.shop?.location ?? "",
        amount: Number(o.price ?? o.amount ?? o.totalAmount ?? o.total ?? 0),
      }));

      setOrders(mapped);
    
      setPage(1);
    } catch (error) {
      console.log("Failed to fetch orders", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

 
  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));

  const paginatedOrders = useMemo(
    () => orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [orders, page],
  );

  
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const formatCurrency = (value: number) =>
    `Rs. ${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigation.navigate("InvoiceScreen", { orderId: Number(item.id) })}
      className="bg-white border border-gray-100 rounded-2xl p-4 mb-3 shadow-sm"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      {/* Top row: order number + date */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className=" font-bold text-black">
          #{item.orderNumber}
        </Text>
        <Text className=" text-[#708696]">{item.date}</Text>
      </View>

      {/* Shop info */}
      <View className="flex-row items-start mb-3">
        <Entypo
          name="location-pin"
          size={22}
          color="black"
          style={{ marginTop: 2 }}
        />
        <View className="ml-2">
          <Text className="text-base font-semibold text-gray-900">
            {item.shopName}
          </Text>
          {!!item.location && (
            <Text className="text-[#708696]">{item.location}</Text>
          )}
        </View>
      </View>

      {/* Amount */}
      <View className="flex-row items-center">
        <FontAwesome5
          name="coins"
          size={18}
          color="black"
        />
        <Text className="ml-2 text-base font-bold text-orange-500">
          {formatCurrency(item.amount)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <CustomHeader
        title={t("OrderHistory.My Orders")}
        showBackButton={true}
        navigation={navigation}
      />

      {/* Count */}
      <Text className="px-4  text-black font-semibold mb-3">
        {t("OrderHistory.All")} ({String(orders.length).padStart(2, "0")})
      </Text>

      {/* List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#F97316" />
        </View>
      ) : orders.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <View className="items-center justify-center">
            <LottieView
              source={require("@/assets/jsons/common/no-data.json")}
              style={{ width: 200, height: 200 }}
              autoPlay
              loop
            />
            <Text className="text-center text-gray-600">
              --{t("OrderHistory.No Previous Orders") || "No Previous Orders"}
              --
            </Text>
          </View>
        </View>
      ) : (
        <>
          <FlatList
            data={paginatedOrders}
            keyExtractor={(item) => item.id}
            renderItem={renderOrder}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          )}
        </>
      )}
    </View>
  );
};

export default OrderHistory;