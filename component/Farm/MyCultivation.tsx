// import React, { useState, useEffect } from 'react';
// import { View, Text, TouchableOpacity, Image, SafeAreaView, ScrollView, Alert } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { useDispatch, useSelector } from 'react-redux';
// import { setFarmBasicDetails } from '../../store/farmSlice';
// import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { RootStackParamList } from '../types'; // Adjust path as needed
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { environment } from "@/environment/environment";
// import axios from "axios";
// import ImageData from '@/assets/jsons/farmImage.json'
// import type { RootState } from '../../services/reducxStore';
// import { useTranslation } from 'react-i18next';
// import LottieView from 'lottie-react-native';
// import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
// // Define the user data interface
// interface UserData {
//   farmCount: number;
//   membership: string;
//   paymentActiveStatus: string | null;
// }

// // Updated interface to match backend response
// interface FarmItem {
//   id: number; // Added this missing property
//   userId: number;
//   farmName: string;
//   farmIndex: number;
//   extentha: string | number;
//   extentac: string | number;
//   extentp: string | number;
//   district: string;
//   plotNo: string;
//   street: string;
//   city: string;
//   staffCount: number;
//   appUserCount: number;
//   imageId: number;
//   farmCropCount:number
// }

// interface MembershipData {
//   id: number;
//   firstName: string;
//   lastName: string;
//   membership: string;
// }

// // Add the missing MembershipResponse interface
// interface MembershipResponse {
//   success: boolean;
//   data: MembershipData;
// }

// // Define navigation prop type
// type MyCultivationNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// const MyCultivation = () => {
//   const navigation = useNavigation<MyCultivationNavigationProp>();
//   const dispatch = useDispatch();
//   const user = useSelector((state: RootState) => state.user.userData) as UserData | null;
//   console.log("MyCultivation - user data from redux:", user);

//   const [farms, setFarms] = useState<FarmItem[]>([]);
//   const [membership, setMembership] = useState('');
//   const [loading, setLoading] = useState(true);
//   const {t} = useTranslation();
//   console.log("MyCultivation - redux user data", user);

//   // Map of image IDs to actual image sources
//   const imageMap: { [key: number]: any } = {
//     1: require('@/assets/images/Farm/1.webp'),
//     2: require('@/assets/images/Farm/2.webp'),
//     3: require('@/assets/images/Farm/3.webp'),
//     4: require('@/assets/images/Farm/4.webp'),
//     5: require('@/assets/images/Farm/5.webp'),
//     6: require('@/assets/images/Farm/6.webp'),
//     7: require('@/assets/images/Farm/7.webp'),
//     8: require('@/assets/images/Farm/8.webp'),
//     9: require('@/assets/images/Farm/9.webp'),
//   };

//   // Get image source by ID
//   const getImageSource = (imageId: number) => {
//     return imageMap[imageId] || imageMap[1]; // Default to first image if not found
//   };

//   const fetchMembership = async () => {
//     try {
//       setLoading(true);
//       const token = await AsyncStorage.getItem("userToken");

//       if (!token) {
//         Alert.alert("Error", "No authentication token found");
//         return;
//       }

//       // Use a more flexible approach to handle different response structures
//       const res = await axios.get(
//         `${environment.API_BASE_URL}api/farm/get-membership`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       console.log("Membership response:", res.data); // Debug log to see actual structure

//       // Handle different response structures
//       if (res.data.success && res.data.data) {
//         // Structure: { success: true, data: { membership: "premium" } }
//         setMembership(res.data.data.membership);
//       } else if (res.data.membership) {
//         // Structure: { membership: "premium", firstName: "John", ... }
//         setMembership(res.data.membership);
//       } else {
//         console.error("Unexpected response structure:", res.data);
//         Alert.alert("Error", "Unexpected response format");
//       }

//     } catch (err) {
//       console.error("Error fetching membership:", err);
//       // Alert.alert("Error", "Failed to fetch membership data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchMembership();
//   }, []);

//   // Fetch farms from backend
//   const fetchFarms = async () => {
//     try {
//       setLoading(true);
//       const token = await AsyncStorage.getItem("userToken");

//       if (!token) {
//         Alert.alert("Error", "No authentication token found");
//         return;
//       }

//       const res = await axios.get<FarmItem[]>(
//         `${environment.API_BASE_URL}api/farm/get-farms`, 
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       console.log(";;;;;;;;;;;",res.data)
      
//       // Convert number fields to strings if needed
//       const formattedFarms = res.data.map(farm => ({
//         ...farm,
//         extentha: farm.extentha.toString(),
//         extentac: farm.extentac.toString(),
//         extentp: farm.extentp.toString()
//       }));
      
//       setFarms(formattedFarms);
//     } catch (err) {
//       console.error("Error fetching farms:", err);
//       // Alert.alert("Error", "Failed to fetch farms data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchFarms();
//   }, []);

//   // Handle adding new farm with conditional navigation
//   const handleAddNewFarm = () => {
//     // Check if user has Basic membership and already has 3 or more farms
//     if (membership === "Basic" ) {
//       navigation.navigate('AddNewFarmUnloackPro' as any);
//       return;
//     }

//     // Reset basic details when adding a new farm
//     const basicDetails = {
//       farmName: '',
//       extent: { ha: '', ac: '', p: '' },
//       district: '',
//       plotNo: '',
//       streetName: '',
//       city: '',
//       selectedImage: 0,
//     };

//     dispatch(setFarmBasicDetails(basicDetails));

//     // Navigate to add farm screen for Premium users or Basic users with < 3 farms
//     navigation.navigate('AddNewFarmBasicDetails' as any);
//   };

//   // Handle farm selection for editing
//   const handleFarmPress = (farm: FarmItem) => {
//     // Convert backend data to Redux format for editing
//     const farmDetailsForRedux = {
//       farmName: farm.farmName,
//       extent: { 
//         ha: farm.extentha.toString(), 
//         ac: farm.extentac.toString(), 
//         p: farm.extentp.toString() 
//       },
//       district: farm.district,
//       plotNo: farm.plotNo,
//       streetName: farm.street,
//       city: farm.city,
//       selectedImage: farm.imageId || 0,
//     };

//     dispatch(setFarmBasicDetails(farmDetailsForRedux));
//     console.log("============farmeId",farm.id)
//     navigation.navigate('FarmDetailsScreen', { farmId: farm.id, farmName: farm.farmName });
//   };

//   // Render farm item
//   const renderFarmItem = (farm: FarmItem, index: number) => (
//     <TouchableOpacity
//       key={`${farm.farmIndex}-${index}`}
//       className="bg-white shadow-sm rounded-lg p-4 mb-4 border border-[#F2F2F2]"
//       onPress={() => handleFarmPress(farm)}
//     >
//       <View className="flex-row items-start">
//         <Image
//           source={getImageSource(farm.imageId)}
//           className="w-14 h-14 mr-4 mt-4 rounded-full"
//           resizeMode="cover"
//         />
//         <View className="flex-1">
//           <View className="flex-row justify-between items-start mt-2">
//             <View>
//               <Text className="font-semibold text-base">{farm.farmName}</Text>
//               <Text className="text-gray-600 text-sm">{farm.district}</Text>
//               <Text className="text-gray-600 text-sm">
//                 {farm.farmCropCount} {t("Farms.crops")}
//               </Text>
//             </View>
//           </View>
       
           
              
         
       
//         </View>
//       </View>
//     </TouchableOpacity>
//   );

//   return (
//     <SafeAreaView className="flex-1 bg-white">
//       <ScrollView 
//         contentContainerStyle={{ flexGrow: 1 }} 
//         showsVerticalScrollIndicator={false} 
//         className="px-6"
//       >
//         <View style={{ paddingVertical: 20 }}>
//           <Text className="text-center font-semibold text-lg">{t("Farms.My Cultivation")}</Text>
//           <Text className="text-center text-[#5B5B5B] text-sm mt-2">
//             {t("Farms.Select a farm to manage your cultivation and assets")}
//           </Text>
//           {/* Show farm count for Basic users */}
//           {/* {membership === "Basic" && (
//             <View className="mt-3">
//               <Text className="text-center text-orange-600 text-sm font-medium">
//                 {farms.length}/3 farms used
//               </Text>
//               {farms.length >= 3 && (
//                 <Text className="text-center text-red-500 text-xs mt-1">
//                   Upgrade to Premium to add more farms
//                 </Text>
//               )}
//             </View>
//           )} */}
//         </View>

//         {loading ? (
//           <View className="flex-1 justify-center items-center">
//              <LottieView
//                                             source={require('../../assets/jsons/loader.json')}
//                                             autoPlay
//                                             loop
//                                             style={{ width: 300, height: 300 }}
//                                           />
//           </View>
//         ) : farms.length === 0 ? (
//           <View className="flex-1 justify-center items-center">
//             <View className='-mt-[30%]'>
//             <LottieView
//                                     source={require("../../assets/jsons/NoComplaints.json")}
//                                     style={{ width: wp(50), height: hp(50) }}
//                                     autoPlay
//                                     loop
                                    
//                                   />
//                                   </View>
//                                   <Text className="text-center text-gray-600 -mt-[30%]">
//                                     {t("ReportHistory.noData")}
//                                   </Text>
//           </View>
//         ) : (
//           <>
//           <View>
//             {farms.map((farm, index) => renderFarmItem(farm, index))}
//           </View>
      
//           </>
//         )}

        
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default MyCultivation;

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { setFarmBasicDetails } from '../../store/farmSlice';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types'; // Adjust path as needed
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import axios from "axios";
import ImageData from '@/assets/jsons/farmImage.json'
import type { RootState } from '../../services/reducxStore';
import { useTranslation } from 'react-i18next';
import LottieView from 'lottie-react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Entypo } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import i18n from '@/i18n/i18n';
// Define the user data interface
interface UserData {
  farmCount: number;
  membership: string;
  paymentActiveStatus: string | null;
}

// Updated interface to match backend response
interface FarmItem {
  id: number; // Added this missing property
  userId: number;
  farmName: string;
  farmIndex: number;
  extentha: string | number;
  extentac: string | number;
  extentp: string | number;
  district: string;
  plotNo: string;
  street: string;
  city: string;
  staffCount: number;
  appUserCount: number;
  imageId: number;
  farmCropCount:number
  isBlock: number; // 0 for not blocked, 1 for blocked
}

interface MembershipData {
  id: number;
  firstName: string;
  lastName: string;
  membership: string;
}

// Add the missing MembershipResponse interface
interface MembershipResponse {
  success: boolean;
  data: MembershipData;
}
interface RenewalData {
  id: number;
  userId: number;
  expireDate: string;
  needsRenewal: boolean;
  status: 'expired' | 'active';
  daysRemaining: number;
  activeStatus: number; // 0 for inactive, 1 for active
}

interface RenewalResponse {
  success: boolean;
  data: RenewalData;
}
// Define navigation prop type
type MyCultivationNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MyCultivation = () => {
  const navigation = useNavigation<MyCultivationNavigationProp>();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.userData) as UserData | null;
  console.log("MyCultivation - user data from redux:", user);

  const [farms, setFarms] = useState<FarmItem[]>([]);
  const [membership, setMembership] = useState('');
  const [loading, setLoading] = useState(true);
  const {t} = useTranslation();
  console.log("MyCultivation - redux user data", user);
  const [renewalData, setRenewalData] = useState<RenewalData | null>(null);
  const [membershipExpired, setMembershipExpired] = useState(false);

  // Map of image IDs to actual image sources
  const imageMap: { [key: number]: any } = {
    1: require('@/assets/images/Farm/1.webp'),
    2: require('@/assets/images/Farm/2.webp'),
    3: require('@/assets/images/Farm/3.webp'),
    4: require('@/assets/images/Farm/4.webp'),
    5: require('@/assets/images/Farm/5.webp'),
    6: require('@/assets/images/Farm/6.webp'),
    7: require('@/assets/images/Farm/7.webp'),
    8: require('@/assets/images/Farm/8.webp'),
    9: require('@/assets/images/Farm/9.webp'),
  };

  // Get image source by ID
  const getImageSource = (imageId: number) => {
    return imageMap[imageId] || imageMap[1]; // Default to first image if not found
  };

  const fetchMembership = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert("Error", "No authentication token found");
        return;
      }

      // Use a more flexible approach to handle different response structures
      const res = await axios.get(
        `${environment.API_BASE_URL}api/farm/get-membership`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Membership response:", res.data); // Debug log to see actual structure

      // Handle different response structures
      if (res.data.success && res.data.data) {
        // Structure: { success: true, data: { membership: "premium" } }
        setMembership(res.data.data.membership);
      } else if (res.data.membership) {
        // Structure: { membership: "premium", firstName: "John", ... }
        setMembership(res.data.membership);
      } else {
        console.error("Unexpected response structure:", res.data);
        Alert.alert("Error", "Unexpected response format");
      }

    } catch (err) {
      console.error("Error fetching membership:", err);
      // Alert.alert("Error", "Failed to fetch membership data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembership();
  }, []);

  // Handle adding new farm with conditional navigation
  const hasBlockedFarms = () => {
    return (
      (renewalData && renewalData.activeStatus === 0) ||
      farms.some(farm => farm.isBlock === 1) || 
      (membership.toLowerCase() === 'pro' && renewalData?.needsRenewal)
    );
  };
    const handleAddNewFarm = () => {
    // Check if user has any blocked farms (Pro membership with isBlock = 1)
    if (hasBlockedFarms()) {
      // Show renewal dialog or navigate to renewal screen
     navigation.navigate('AddNewFarmUnloackPro' as any);
      return;
    }
  
    // Check if user has Basic membership and already has farms
    if (membership.toLowerCase() === "basic" && farms.length >= 1) {
      navigation.navigate('AddNewFarmUnloackPro' as any, {
        membership: membership
     
      });
      return;
    }
  
    // Reset basic details when adding a new farm
    const basicDetails = {
      farmName: '',
      extent: { ha: '', ac: '', p: '' },
      district: '',
      plotNo: '',
      streetName: '',
      city: '',
      selectedImage: 0,
    };
  
    dispatch(setFarmBasicDetails(basicDetails));
    navigation.navigate('AddNewFarmBasicDetails' as any, {
      membership: membership
  
    });
  };
  
  const fetchFarms = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert("Error", "No authentication token found");
        return;
      }

      const res = await axios.get<FarmItem[]>(
        `${environment.API_BASE_URL}api/farm/get-farms`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(";;;;;;;;;;;",res.data)
      
      // Convert number fields to strings if needed
      const formattedFarms = res.data.map(farm => ({
        ...farm,
        extentha: farm.extentha.toString(),
        extentac: farm.extentac.toString(),
        extentp: farm.extentp.toString()
      }));
         const sortedFarms = formattedFarms.sort((a, b) => a.id - b.id);
      
      setFarms(sortedFarms);
    } catch (err) {
      console.error("Error fetching farms:", err);
      // Alert.alert("Error", "Failed to fetch farms data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchRenewalStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      
      if (!token) {
        return;
      }

      const res = await axios.get<RenewalResponse>(
        `${environment.API_BASE_URL}api/farm/get-renew`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Renewal response:", res.data.data);

      if (res.data.success && res.data.data) {
        setRenewalData(res.data.data);
        setMembershipExpired(res.data.data.needsRenewal);
      }

    } catch (err) {
      console.error("Error fetching renewal status:", err);
      // If no renewal data found (404), treat as no premium membership
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setRenewalData(null);
        setMembershipExpired(false);
      }
    }
  };
  useFocusEffect(
    useCallback(() => {
      fetchFarms(); 
      fetchRenewalStatus();
    }, [])
  );
  // Handle farm selection for editing
  const handleFarmPress = (farm: FarmItem) => {
    // Convert backend data to Redux format for editing
    const farmDetailsForRedux = {
      farmName: farm.farmName,
      extent: { 
        ha: farm.extentha.toString(), 
        ac: farm.extentac.toString(), 
        p: farm.extentp.toString() 
      },
      district: farm.district,
      plotNo: farm.plotNo,
      streetName: farm.street,
      city: farm.city,
      selectedImage: farm.imageId || 0,
    };

    dispatch(setFarmBasicDetails(farmDetailsForRedux));
    console.log("============farmeId",farm.id)
    navigation.navigate('FarmDetailsScreen', { farmId: farm.id, farmName: farm.farmName });
  };

  const getMembershipDisplay = (farm: FarmItem) => {
  // If membership is PRO
  if (membership.toLowerCase() === 'pro') {
    // First check if renewal data exists and membership is expired
    if (renewalData && renewalData.needsRenewal) {
      // Expired membership
      if (farm.isBlock === 0) {
        // Expired but not blocked - show BASIC
        return {
          text: 'BASIC',
          bgColor: 'bg-[#CDEEFF]',
          textColor: 'text-[#223FFF]',
          showRenew: false,
          isBlocked: false
        };
      } else {
        // Expired and blocked - show RENEW
        return {
          text: 'RENEW',
          bgColor: 'bg-[#FFDEDE]',
          textColor: 'text-[#BE0003]',
          showRenew: true,
          isBlocked: true
        };
      }
    } else {
      // Not expired membership
      if (farm.isBlock === 1) {
        // Not expired but blocked - show RENEW
        return {
          text: 'RENEW',
          bgColor: 'bg-[#FFDEDE]',
          textColor: 'text-[#BE0003]',
          showRenew: true,
          isBlocked: true
        };
      } else {
        // Not expired and not blocked - show PRO
        return {
          text: 'PRO',
          bgColor: 'bg-[#FFF5BD]',
          textColor: 'text-[#E2BE00]',
          showRenew: false,
          isBlocked: false
        };
      }
    }
  } else {
    // Membership is BASIC - always show BASIC
    return {
      text: 'BASIC',
      bgColor: 'bg-[#CDEEFF]',
      textColor: 'text-[#223FFF]',
      showRenew: false,
      isBlocked: false
    };
  }
};


  // Render farm item
  const renderFarmItem = (farm: FarmItem, index: number) => {
    const membershipDisplay = getMembershipDisplay(farm);

    return (
      <TouchableOpacity
        key={`${farm.farmIndex}-${index}`}
        className="bg-white shadow-sm rounded-lg p-4 mb-4 border border-[#F2F2F2]"
        onPress={() => handleFarmPress(farm)}
      disabled={membershipDisplay.isBlocked}
    >
      <View className="flex-row items-start">
        <Image
          source={getImageSource(farm.imageId)}
          className="w-14 h-14 mr-4 mt-4 rounded-full"
          resizeMode="cover"
        />
        <View className="flex-1">
          <View className="flex-row justify-between items-start mt-2">
            <View>
              <Text className="font-semibold text-base">{farm.farmName}</Text>
              <Text className="text-gray-600 text-sm">{t(`District.${farm.district}`)}</Text>
              <Text className="text-gray-600 text-sm">
                {farm.farmCropCount} {t("Farms.crops")}
              </Text>
            </View>
              {membershipDisplay.isBlocked && (
                <View className="ml-2">
                  <Entypo name="lock" size={20} color="black" />
                </View>
              )}
          </View>
       
           
              
         
       
        </View>
      </View>
    </TouchableOpacity>
  )};

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }} 
        showsVerticalScrollIndicator={false} 
        className="px-6"
      >
        <View style={{ paddingVertical: 20 }}>
          <Text className="text-center font-semibold text-lg">{t("Farms.My Cultivation")}</Text>
          <Text className="text-center text-[#5B5B5B] text-sm mt-2">
            {t("Farms.Select a farm to manage your cultivation and assets")}
          </Text>
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
             <LottieView
                                            source={require('../../assets/jsons/loader.json')}
                                            autoPlay
                                            loop
                                            style={{ width: 300, height: 300 }}
                                          />
          </View>
        ) : farms.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <View className='-mt-[30%]'>
            <LottieView
                                    source={require("../../assets/jsons/NoComplaints.json")}
                                    style={{ width: wp(50), height: hp(50) }}
                                    autoPlay
                                    loop
                                    
                                  />
                                  </View>
                                  <Text className="text-center text-gray-600 -mt-[30%]">
                                    {t("ReportHistory.noData")}
                                  </Text>
          </View>
        ) : (
          <>
          <View>
            {farms.map((farm, index) => renderFarmItem(farm, index))}
          </View>
          {hasBlockedFarms() && (
                  <TouchableOpacity 
                    onPress={handleAddNewFarm}
                  >
                            <LinearGradient
                                   className="py-4 rounded-full mt-6 mx-4  shadow-md shadow-black mb-8"
                            colors={['#FDCF3F', '#FEE969']}
                              start={{ x: 0, y: 0 }}  // Start from left
                                  end={{ x: 1, y: 0 }} 
                           >
                           
                    <Text className="text-[#7E5E00] text-center font-semibold text-base" style={[ {fontSize: i18n.language === "si" ? 15 : i18n.language === "ta" ? 14 : 20,},]}>
                      {t("Farms.Renew your PRO plan")}
                    </Text>
        </LinearGradient>
                  </TouchableOpacity>
)}
          </>
        )}

        
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyCultivation;