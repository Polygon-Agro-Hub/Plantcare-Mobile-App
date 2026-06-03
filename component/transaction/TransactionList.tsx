import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { scale } from "react-native-size-matters";
import { RootStackParamList } from "../types/types";
import { environment } from "@/environment/environment";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import LottieView from "lottie-react-native";
import CustomHeader from "../common/CustomHeader";
import LoadingPage from "../common/LoadingPage";

type TransactionHistoryNavigationProp = StackNavigationProp<
  RootStackParamList,
  "TransactionHistory"
>;
type TransactionHistoryRouteProp = RouteProp<
  RootStackParamList,
  "TransactionHistory"
>;

interface TransactionHistoryProps {
  navigation: TransactionHistoryNavigationProp;
  route: TransactionHistoryRouteProp;
}

interface Transaction {
  id: string;
  grnNo: string;
  amount: string;
  itemCount: number;
  deliveryDate: string;
  registeredFarmerId?: string;
  collectionOfficerId?: string;
  invNo?: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profileImage?: string;
  address?: string;
  NICnumber?: string;
  totalAmount?: string;
  accountNumber?: string;
  accountHolderName?: string;
  bankName?: string;
  branchName?: string;
  empId?: string;
  transactionDate?: string;
  centerId?: string;
  companyId?: string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  navigation,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const { t } = useTranslation();

  const fetchTransactions = async (pageNum: number = 1, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
      setPage(1);
    } else if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.get(
        `${environment.API_BASE_URL}api/auth/history?page=${pageNum}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        const formattedTransactions = response.data.data.map((item: any) => ({
          id: item.invNo || String(Math.random()),
          grnNo: item.invNo || "N/A",
          amount: `Rs. ${parseFloat(item.totalAmount || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          itemCount: item.cropRecordCount || 0,
          deliveryDate: item.transactionDate
            ? new Date(item.transactionDate)
                .toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })
                .replace(/(\d+)\/(\d+)\/(\d+)/, "$3/$1/$2")
            : "N/A",
          ...item,
        }));

        if (pageNum === 1) {
          setTransactions(formattedTransactions);
        } else {
          setTransactions((prev) => [...prev, ...formattedTransactions]);
        }

        setHasMore(response.data.hasMore);
      } else {
        if (pageNum === 1) {
          setTransactions([]);
        }
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);

      if (pageNum === 1) {
        setTransactions([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchTransactions(1, true);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTransactions(nextPage);
    }
  };

  useEffect(() => {
    fetchTransactions(1);
  }, []);

  const renderFooter = () => {
    if (!loadingMore) return null;
  };

  const renderLoadMoreButton = () => {
    if (loadingMore || !hasMore || transactions.length === 0) return null;

    return (
      <TouchableOpacity
        className="items-center py-4 bg-gray-100 mx-4 rounded-lg mt-2"
        onPress={loadMore}
        disabled={loadingMore}
      >
        <Text className="text-green-600 font-medium">
          {t("TransactionList.See More")}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <CustomHeader
        title={t("TransactionList.TransactionHistory")}
        showBackButton={true}
        navigation={navigation}
        onBackPress={() => navigation.goBack()}
      />

      {loading ? (
        <View className="flex-1 justify-center items-center bg-white">
          <LoadingPage fullScreen />
        </View>
      ) : (
        <View className="flex-1 px-6">
          <Text className="font-medium text-base text-gray-600 mb-2">
            {t("TransactionList.All")} ({transactions.length})
          </Text>
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: 8, paddingBottom: 40 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#0000ff"]}
                tintColor="#0000ff"
              />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="flex-row justify-between items-center p-4 bg-white border border-gray-200 mt-2"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.12,
                  shadowRadius: 4,
                  elevation: 4,
                  borderRadius: 8,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                }}
                onPress={() => {
                  navigation.navigate("TransactionReport" as any, {
                    registeredFarmerId: item.registeredFarmerId,
                    userId: item.userId,
                    centerId: item.centerId,
                    companyId: item.companyId,
                    transactionDate: item.transactionDate,
                  });
                }}
              >
                <View>
                  <View className="flex-row mb-1">
                    <Text className="text-gray-800 font-medium">
                      {t("TransactionList.GRNNo")}
                    </Text>
                    <Text className="text-gray-800 ml-2 font-medium">
                      : {item.grnNo}
                    </Text>
                  </View>
                  <View className="flex-row mb-1">
                    <Text className="text-gray-800 ">
                      {t("TransactionList.Amount")}
                    </Text>
                    <Text className="text-gray-800 ml-2">: {item.amount}</Text>
                  </View>
                  <View className="flex-row mb-1">
                    <Text className="text-gray-800 ">
                      # {t("TransactionList.of Items")}
                    </Text>
                    <Text className="text-gray-800 ml-2">: {item.itemCount}</Text>
                  </View>
                  <View className="flex-row">
                    <Text className="text-gray-800 ">
                      {t("TransactionList.Delivered on")}
                    </Text>
                    <Text className="text-gray-800 ml-2">
                      : {item.deliveryDate}
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={scale(20)}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center">
                <LottieView
                  source={require("@/assets/jsons/common/no-data.json")}
                  style={{ width: wp(50), height: hp(50) }}
                  autoPlay
                  loop
                />
                <Text className="text-center text-gray-600 mt-[-30%]">
                  --{t("TransactionList.NoTransactionsFound")}--
                </Text>
              </View>
            }
          />
        </View>
      )}
      {renderLoadMoreButton()}
    </View>
  );
};

export default TransactionHistory;
