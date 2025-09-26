// import React, { useState, useEffect } from 'react';
// import { View, Text, TouchableOpacity, FlatList, Modal, Platform, RefreshControl, ActivityIndicator } from 'react-native';
// import { StackNavigationProp } from '@react-navigation/stack';
// import { RouteProp } from '@react-navigation/native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { scale } from 'react-native-size-matters';
// import { RootStackParamList } from './types';
// import { environment } from '@/environment/environment';
// import AntDesign from 'react-native-vector-icons/AntDesign';
// import Ionicons from '@expo/vector-icons/Ionicons';
// import { useTranslation } from "react-i18next";
// import DateTimePicker from '@react-native-community/datetimepicker';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from "react-native-responsive-screen";
// import LottieView from "lottie-react-native";

// type TransactionHistoryNavigationProp = StackNavigationProp<RootStackParamList, 'TransactionHistory'>;
// type TransactionHistoryRouteProp = RouteProp<RootStackParamList, 'TransactionHistory'>;

// interface TransactionHistoryProps {
//   navigation: TransactionHistoryNavigationProp;
//   route: TransactionHistoryRouteProp;
// }

// interface Transaction {
//   id: string;
//   grnNo: string;
//   amount: string;
//   itemCount: number;
//   deliveryDate: string;
//   // Additional fields from backend
//   registeredFarmerId?: string;
//   collectionOfficerId?: string;
//   invNo?: string;
//   userId?: string;
//   firstName?: string;
//   lastName?: string;
//   phoneNumber?: string;
//   profileImage?: string;
//   address?: string;
//   NICnumber?: string;
//   totalAmount?: string;
//   accountNumber?: string;
//   accountHolderName?: string;
//   bankName?: string;
//   branchName?: string;
//   empId?: string;
//   transactionDate?: string;
//   centerId?: string;
//   companyId?: string;
// }

// const formatDate = (date: Date): string => {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const day = String(date.getDate()).padStart(2, '0');
//   return `${year}/${month}/${day}`;
// };

// const formatDateForAPI = (date: Date): string => {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const day = String(date.getDate()).padStart(2, '0');
//   return `${year}-${month}-${day}`;
// };

// const TransactionHistory: React.FC<TransactionHistoryProps> = ({ navigation }) => {
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [selectedDate, setSelectedDate] = useState<Date>(new Date());
//   const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [refreshing, setRefreshing] = useState<boolean>(false); // Add refreshing state
//   const { t } = useTranslation();

//   const fetchTransactions = async (date: Date, isRefresh = false) => {
//     if (isRefresh) {
//       setRefreshing(true);
//     } else {
//       setLoading(true);
//     }
//     setError(null);
   
//     try {
//       const formattedDate = formatDateForAPI(date);
//       const token = await AsyncStorage.getItem("userToken");
//       const response = await axios.get(`${environment.API_BASE_URL}api/auth/history?date=${formattedDate}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         }
//       });
     
//       if (response.data.success) {
//         const formattedTransactions = response.data.data.map((item: any) => ({
//           id: item.invNo || String(Math.random()),
//           grnNo: item.invNo || 'N/A',
//           amount: `Rs.${parseFloat(item.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
//           itemCount: item.cropRecordCount || 0,
//           deliveryDate: item.transactionDate ? new Date(item.transactionDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/(\d+)\/(\d+)\/(\d+)/, '$3/$1/$2') : 'N/A',
//           ...item
//         }));
       
//         setTransactions(formattedTransactions);
//         console.log('Fetched transactions:', formattedTransactions);
//       } else {
//         setError('Failed to fetch transactions');
//         setTransactions([]);
//       }
//     } catch (err) {
//       console.error('Error fetching transactions:', err);
//       setError('Error connecting to server');
//       setTransactions([]);
//     } finally {
//       setLoading(false);
//       setRefreshing(false); // Always set refreshing to false when done
//     }
//   };

//   // Updated onRefresh function
//   const onRefresh = () => {
//     fetchTransactions(selectedDate, true); // Pass true to indicate it's a refresh
//   };

// useEffect(() => {
//   fetchTransactions(selectedDate);
// }, [selectedDate]);

//   const onDateChange = (event: any, selectedDate?: Date) => {
//     setShowDatePicker(Platform.OS === 'ios');
//     if (selectedDate) {
//       setSelectedDate(selectedDate);
//     }
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-white"        
//     >
        
//       {/* Header */}
//       <View className=" border-b border-gray-200 -mt-6" >
//         <View className="flex-row items-center justify-between"  style={{ paddingHorizontal: wp(4) , paddingVertical: hp(2)}}>
//           <TouchableOpacity onPress={() => navigation.goBack()}>
//             <AntDesign name="left" size={22} color="black" />
//           </TouchableOpacity>
//           <Text className="text-black text-lg font-medium ">{t("TransactionList.Transaction History")}</Text>
//           <View>
//           <TouchableOpacity onPress={() => setShowDatePicker(prev => !prev)}>
//           <Ionicons name="calendar-outline" size={22} color="black" />
//         </TouchableOpacity>

//           </View>
       
//         </View>

//       </View>

//       {/* Selected Date Display */}
//       <View className="px-4 pt-4">
//         <Text className="text-gray-600 p-3 font-medium">
//           {t("TransactionList.Transactions on")} {formatDate(selectedDate)} ({transactions.length})
//         </Text>
//       </View>

//       {/* Transaction List */}
      
//       <FlatList
//         data={transactions}
//         keyExtractor={(item) => item.id}
//         contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={['#0000ff']} // Customize as needed
//             tintColor="#0000ff" // Customize as needed
//           />
//         }
//         renderItem={({ item }) => (
//           <TouchableOpacity
//             className="flex-row justify-between items-center p-4 border-b border-gray-100"
//             onPress={() => {
//               navigation.navigate('TransactionReport'as any, {
//                 registeredFarmerId: item.registeredFarmerId,
//                 userId: item.userId,
//                 centerId: item.centerId,
//                 companyId: item.companyId,
//                 transactionDate: formatDateForAPI(selectedDate)
//               });
//             }}
//           >
//             <View>
//               <View className="flex-row mb-1">
//                 <Text className="text-gray-800 font-medium">{t("TransactionList.GRN No")}</Text>
//                 <Text className="text-gray-800 ml-2">: {item.grnNo}</Text>
//               </View>
//               <View className="flex-row mb-1">
//                 <Text className="text-gray-800 font-medium">{t("TransactionList.Amount")}</Text>
//                 <Text className="text-gray-800 ml-2">: {item.amount}</Text>
//               </View>
//               <View className="flex-row mb-1">
//                 <Text className="text-gray-800 font-medium"># {t("TransactionList.of Items")}</Text>
//                 <Text className="text-gray-800 ml-2">: {item.itemCount}</Text>
//               </View>
//               <View className="flex-row">
//                 <Text className="text-gray-800 font-medium">{t("TransactionList.Delivered on")}</Text>
//                 <Text className="text-gray-800 ml-2">: {item.deliveryDate}</Text>
//               </View>
//             </View>
//             <Ionicons name="chevron-forward" size={scale(20)} color="#9CA3AF" />
//           </TouchableOpacity>
//         )}
//         ListEmptyComponent={
//           <View className="items-center justify-center mt-8">
//             {loading ? (
//               // <Text className="text-gray-500 text-lg">Loading ...</Text>
//               // <View className="flex-1 items-center justify-center">
//               // <ActivityIndicator size="large" color="#26D041" />
//               // </View>
//               <View className="flex-1 justify-center items-center">
//                                    <LottieView
//                                      source={require('../assets/jsons/loader.json')}
//                                      autoPlay
//                                      loop
//                                      style={{ width: 300, height: 300 }}
//                                    />
//                                  </View>
//             ) :(
//                         <View className="flex-1 items-center justify-center">
//                           <LottieView
//                             source={require("../assets/jsons/NoComplaints.json")}
//                             style={{ width: wp(50), height: hp(50) }}
//                             autoPlay
//                             loop
//                           />
//                           <Text className="text-center text-gray-600 mt-4">
//                          {t("TransactionList.No transactions found for this date")}
//                           </Text>
//                         </View>
//             )}
//           </View>
//         }
//       />

//       {/* Date Picker */}
//       {showDatePicker && (
//         Platform.OS === 'ios' ? (
//           // <Modal
//           //   animationType="slide"
//           //   transparent={true}
//           //   visible={showDatePicker}
//           //   onRequestClose={() => setShowDatePicker(false)}
//           // >
//           //   <View className="flex-1 justify-end bg-black bg-opacity-50">
//           //     <View className="bg-white p-4">
//           //       <View className="flex-row justify-between mb-4">
//           //         <TouchableOpacity onPress={() => setShowDatePicker(false)}>
//           //           <Text className="text-blue-500 text-lg">Cancel</Text>
//           //         </TouchableOpacity>
//           //         <TouchableOpacity onPress={() => setShowDatePicker(false)}>
//           //           <Text className="text-blue-500 text-lg">Done</Text>
//           //         </TouchableOpacity>
//           //       </View>
//           //       <DateTimePicker
//           //         value={selectedDate}
//           //         mode="date"
//           //         display="spinner"
//           //         onChange={onDateChange}
//           //       />
//           //     </View>
//           //   </View>
//           // </Modal>
//           <View className=' justify-center items-center z-50 absolute ml-6 mt-[20%] bg-gray-100  rounded-lg'>
//           <DateTimePicker
//             value={selectedDate}
//             mode="date"
//             display="inline"
//             style={{ width: 320, height: 260 }}
//             onChange={onDateChange}
//           />
//           </View>
//         ) : (
//           <DateTimePicker
//             value={selectedDate}
//             mode="date"
//             display="default"
//             onChange={onDateChange}
//           />
//         )
//       )}
//     </SafeAreaView>
//   );
// };

// export default TransactionHistory;


import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, Platform, RefreshControl, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { scale } from 'react-native-size-matters';
import { RootStackParamList } from './types';
import { environment } from '@/environment/environment';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from "react-i18next";
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

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ navigation }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
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
    
    setError(null);
   
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.get(
        `${environment.API_BASE_URL}api/auth/history?page=${pageNum}&limit=10`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
     
      if (response.data.success) {
        const formattedTransactions = response.data.data.map((item: any) => ({
          id: item.invNo || String(Math.random()),
          grnNo: item.invNo || 'N/A',
          amount: `Rs.${parseFloat(item.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          itemCount: item.cropRecordCount || 0,
          deliveryDate: item.transactionDate ? new Date(item.transactionDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/(\d+)\/(\d+)\/(\d+)/, '$3/$1/$2') : 'N/A',
          ...item
        }));
       
        if (pageNum === 1) {
          setTransactions(formattedTransactions);
        } else {
          setTransactions(prev => [...prev, ...formattedTransactions]);
        }
        
        setHasMore(response.data.hasMore);
        console.log('Fetched transactions:', formattedTransactions);
      } else {
        setError('Failed to fetch transactions');
        if (pageNum === 1) {
          setTransactions([]);
        }
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Error connecting to server');
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
    
    return (
      <View className="items-center py-4">
        {/* <ActivityIndicator size="small" color="#26D041" /> */}
      </View>
    );
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
    <View className="flex-1 bg-[#F9F9FA]">
      {/* Header */}
      <View className="" >
        <View className="flex-row items-center justify-between" style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <AntDesign name="left" size={22} color="black" style={{ paddingHorizontal: wp(3), paddingVertical: hp(1.5), backgroundColor: "#F6F6F680" , borderRadius: 50 }}/>
          </TouchableOpacity>
          <Text className="text-black text-lg font-bold ">{t("TransactionList.Transaction History")}</Text>
          <View style={{ width: 22 }} /> 
        </View>
      </View>

      {/* Transaction Count */}
      {/* <View className="px-4 pt-4">
        <Text className="text-gray-600 p-3 font-medium">
          {t("TransactionList.All Transactions")} ({transactions.length})
        </Text>
      </View> */}

     
      <View className='mb-[30%] p-2 -mt-4'>
      <FlatList
      
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0000ff']}
            tintColor="#0000ff"
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="flex-row justify-between items-center p-4 border-b border-gray-100 mt-2"
            style={{ shadowColor: '#000', 
              shadowOffset: { width: 0, height: 1 }, 
            //  shadowOpacity: 0.1, 
            //  shadowRadius: 2, 
            //  elevation: 2, 
              backgroundColor: '#fff', 
              borderRadius: 8, 
              marginBottom: 8 }}
            onPress={() => {
              navigation.navigate('TransactionReport' as any, {
                registeredFarmerId: item.registeredFarmerId,
                userId: item.userId,
                centerId: item.centerId,
                companyId: item.companyId,
                transactionDate: item.transactionDate
              });
            }}
          >
            <View>
              <View className="flex-row mb-1">
                <Text className="text-gray-800 font-medium">{t("TransactionList.GRN No")}</Text>
                <Text className="text-gray-800 ml-2 font-medium">: {item.grnNo}</Text>
              </View>
              <View className="flex-row mb-1">
                <Text className="text-gray-800 ">{t("TransactionList.Amount")}</Text>
                <Text className="text-gray-800 ml-2">: {item.amount}</Text>
              </View>
              <View className="flex-row mb-1">
                <Text className="text-gray-800 "># {t("TransactionList.of Items")}</Text>
                <Text className="text-gray-800 ml-2">: {item.itemCount}</Text>
              </View>
              <View className="flex-row">
                <Text className="text-gray-800 ">{t("TransactionList.Delivered on")}</Text>
                <Text className="text-gray-800 ml-2">: {item.deliveryDate}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={scale(20)} color="#9CA3AF" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="items-center justify-center mt-8">
            {loading ? (
              <View className="flex-1 justify-center items-center mt-[20%]">
                <LottieView
                  source={require('../assets/jsons/loader.json')}
                  autoPlay
                  loop
                  style={{ width: 300, height: 300 }}
                />
              </View>
            ) : (
              <View className="flex-1 items-center justify-center">
                <LottieView
                  source={require("../assets/jsons/NoComplaints.json")}
                  style={{ width: wp(50), height: hp(50) }}
                  autoPlay
                  loop
                />
                <Text className="text-center text-gray-600 mt-4">
                  {t("TransactionList.No transactions found")}
                </Text>
              </View>
            )}
          </View>
        }
      />
      </View>
      {renderLoadMoreButton()}
    </View>
  );
};

export default TransactionHistory;