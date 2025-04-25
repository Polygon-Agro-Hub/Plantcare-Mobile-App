import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, Platform, RefreshControl, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale } from 'react-native-size-matters';
import { RootStackParamList } from './types';
import { environment } from '@/environment/environment';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from "react-i18next";
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import LottieView from "lottie-react-native";

type TransactionHistoryNavigationProp = StackNavigationProp<RootStackParamList, 'TransactionHistory'>;
type TransactionHistoryRouteProp = RouteProp<RootStackParamList, 'TransactionHistory'>;

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
  // Additional fields from backend
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

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ navigation }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false); // Add refreshing state
  const { t } = useTranslation();

  const fetchTransactions = async (date: Date, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
   
    try {
      const formattedDate = formatDateForAPI(date);
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.get(`${environment.API_BASE_URL}api/auth/history?date=${formattedDate}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
     
      if (response.data.success) {
        const formattedTransactions = response.data.data.map((item: any) => ({
          id: item.invNo || String(Math.random()),
          grnNo: item.invNo || 'N/A',
          amount: `Rs.${parseFloat(item.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          itemCount: 11,
          deliveryDate: item.transactionDate ? new Date(item.transactionDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/(\d+)\/(\d+)\/(\d+)/, '$3/$1/$2') : 'N/A',
          ...item
        }));
       
        setTransactions(formattedTransactions);
      } else {
        setError('Failed to fetch transactions');
        setTransactions([]);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Error connecting to server');
      setTransactions([]);
    } finally {
      setLoading(false);
      setRefreshing(false); // Always set refreshing to false when done
    }
  };

  // Updated onRefresh function
  const onRefresh = () => {
    fetchTransactions(selectedDate, true); // Pass true to indicate it's a refresh
  };

useEffect(() => {
  fetchTransactions(selectedDate);
}, [selectedDate]);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white"        
    >
        
      {/* Header */}
      <View className=" border-b border-gray-200 -mt-6" >
        <View className="flex-row items-center justify-between"  style={{ paddingHorizontal: wp(4) , paddingVertical: hp(2)}}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <AntDesign name="left" size={22} color="black" />
          </TouchableOpacity>
          <Text className="text-black text-lg font-medium ">{t("TransactionList.Transaction History")}</Text>
          <View>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar-outline" size={22} color="black" />
        </TouchableOpacity>

          </View>
       
        </View>

      </View>

      {/* Selected Date Display */}
      <View className="px-4 pt-4">
        <Text className="text-gray-600 p-3 font-medium">
          {t("TransactionList.Transactions on")} {formatDate(selectedDate)} ({transactions.length})
        </Text>
      </View>

      {/* Transaction List */}
      
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0000ff']} // Customize as needed
            tintColor="#0000ff" // Customize as needed
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            className="flex-row justify-between items-center p-4 border-b border-gray-100"
            onPress={() => {
              navigation.navigate('TransactionReport'as any, {
                registeredFarmerId: item.registeredFarmerId,
                userId: item.userId,
                centerId: item.centerId,
                companyId: item.companyId,
                transactionDate: formatDateForAPI(selectedDate)
              });
            }}
          >
            <View>
              <View className="flex-row mb-1">
                <Text className="text-gray-800 font-medium">{t("TransactionList.GRN No")}</Text>
                <Text className="text-gray-800 ml-2">: {item.grnNo}</Text>
              </View>
              <View className="flex-row mb-1">
                <Text className="text-gray-800 font-medium">{t("TransactionList.Amount")}</Text>
                <Text className="text-gray-800 ml-2">: {item.amount}</Text>
              </View>
              <View className="flex-row mb-1">
                <Text className="text-gray-800 font-medium"># {t("TransactionList.of Items")}</Text>
                <Text className="text-gray-800 ml-2">: {item.itemCount}</Text>
              </View>
              <View className="flex-row">
                <Text className="text-gray-800 font-medium">{t("TransactionList.Delivered on")}</Text>
                <Text className="text-gray-800 ml-2">: {item.deliveryDate}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={scale(20)} color="#9CA3AF" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="items-center justify-center mt-8">
            {loading ? (
              // <Text className="text-gray-500 text-lg">Loading ...</Text>
              <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#26D041" />
              </View>
            ) :(
                        <View className="flex-1 items-center justify-center">
                          <LottieView
                            source={require("../assets/jsons/NoComplaints.json")}
                            style={{ width: wp(50), height: hp(50) }}
                            autoPlay
                            loop
                          />
                          <Text className="text-center text-gray-600 mt-4">
                         {t("TransactionList.No transactions found for this date")}
                          </Text>
                        </View>
            )}
          </View>
        }
      />

      {/* Date Picker */}
      {showDatePicker && (
        Platform.OS === 'ios' ? (
          <Modal
            animationType="slide"
            transparent={true}
            visible={showDatePicker}
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View className="flex-1 justify-end bg-black bg-opacity-50">
              <View className="bg-white p-4">
                <View className="flex-row justify-between mb-4">
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text className="text-blue-500 text-lg">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text className="text-blue-500 text-lg">Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="spinner"
                  onChange={onDateChange}
                />
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )
      )}
    </SafeAreaView>
  );
};

export default TransactionHistory;