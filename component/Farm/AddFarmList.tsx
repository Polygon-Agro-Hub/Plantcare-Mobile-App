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
import { AntDesign, Ionicons,Entypo  } from '@expo/vector-icons';

// Define the user data interface
interface UserData {
  farmCount: number;
  membership: string;
  paymentActiveStatus: string | null;
}

interface FarmItem {
  id: number;
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
  isBlock: number; // 0 = active, 1 = blocked/needs renewal
}

interface MembershipData {
  id: number;
  firstName: string;
  lastName: string;
  membership: string;
}

interface MembershipResponse {
  success: boolean;
  data: MembershipData;
}

// New interface for renewal data
interface RenewalData {
  id: number;
  userId: number;
  expireDate: string;
  needsRenewal: boolean;
  status: 'expired' | 'active';
  daysRemaining: number;
}

interface RenewalResponse {
  success: boolean;
  data: RenewalData;
}

type AddFarmListNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AddFarmList = () => {
  const navigation = useNavigation<AddFarmListNavigationProp>();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.userData) as UserData | null;
  
  const [farms, setFarms] = useState<FarmItem[]>([]);
  const [membership, setMembership] = useState('');
  const [loading, setLoading] = useState(true);
  
  // New state for renewal data
  const [renewalData, setRenewalData] = useState<RenewalData | null>(null);
  const [membershipExpired, setMembershipExpired] = useState(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  

  console.log("AddFarmList - user data from redux:", user);
  console.log("AddFarmList - redux user data", user);

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
    return imageMap[imageId] || imageMap[1];
  };

  // New function to check renewal status
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

      console.log("Renewal response:", res.data);

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

  const fetchMembership = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert("Error", "No authentication token found");
        return;
      }

      const res = await axios.get(
        `${environment.API_BASE_URL}api/farm/get-membership`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Membership response:", res.data);

      if (res.data.success && res.data.data) {
        setMembership(res.data.data.membership);
      } else if (res.data.membership) {
        setMembership(res.data.membership);
      } else {
        console.error("Unexpected response structure:", res.data);
        Alert.alert("Error", "Unexpected response format");
      }

    } catch (err) {
      console.error("Error fetching membership:", err);
      Alert.alert("Error", "Failed to fetch membership data");
    } finally {
      setLoading(false);
    }
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
      console.log('response fram',res.data)
      
      const formattedFarms = res.data.map(farm => ({
        ...farm,
        extentha: farm.extentha.toString(),
        extentac: farm.extentac.toString(),
        extentp: farm.extentp.toString()
      }));
      
      // Sort farms by id in ascending order (lowest id first)
      const sortedFarms = formattedFarms.sort((a, b) => a.id - b.id);
      
      setFarms(sortedFarms);
    } catch (err) {
      console.error("Error fetching farms:", err);
      Alert.alert("Error", "Failed to fetch farms data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchMembership();
      await fetchRenewalStatus();
      await fetchFarms();
    };
    
    fetchData();
  }, []);

   useFocusEffect(
    useCallback(() => {
      fetchFarms(); 
    }, [])
  );
  


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
  // Check if any farm needs renewal
  const hasBlockedFarms = () => {
    return farms.some(farm => farm.isBlock === 1 && membership.toLowerCase() === 'pro');
  };

  // Handle adding new farm with conditional navigation
  const handleAddNewFarm = () => {
    // Check if user has any blocked farms (Pro membership with isBlock = 1)
    if (hasBlockedFarms()) {
      // Show renewal dialog or navigate to renewal screen
      navigation.navigate('AddNewFarmUnloackPro' as any);
      return;
    }

    // Check if user has Basic membership and already has farms
    if (membership.toLowerCase() === "basic" && farms.length >= 1) {
      navigation.navigate('AddNewFarmUnloackPro' as any);
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
    navigation.navigate('AddNewFarmBasicDetails');
  };

  // Handle farm selection for editing
  const handleFarmPress = (farm: FarmItem) => {
    // Block navigation if this specific farm is blocked (isBlock = 1)
    if (farm.isBlock === 1 && membership.toLowerCase() === 'pro') {
      Alert.alert(
        "Farm Blocked",
        "This farm is blocked due to expired Pro membership. Please renew to access farm details.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Renew Now", onPress: () => {
            navigation.navigate('RenewalScreen' as any);
          }}
        ]
      );
      return;
    }

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
    console.log("============farmId", farm.id);
    navigation.navigate('FarmDetailsScreen', { farmId: farm.id });
  };

  // Handle renewal navigation
  const handleRenewalPress = () => {
    navigation.navigate('RenewalScreen' as any);
  };

  // Render farm item
  const renderFarmItem = (farm: FarmItem, index: number) => {
    const membershipDisplay = getMembershipDisplay(farm);

    const onRefresh = () => {
      setRefreshing(true);
    };

    return (
      <TouchableOpacity
        key={`${farm.farmIndex}-${index}`}
        className={`bg-white shadow-sm rounded-lg p-4 mb-4 border border-[#F2F2F2] ${
          membershipDisplay.isBlocked ? 'opacity-75' : ''
        }`}
        onPress={() => handleFarmPress(farm)}
        disabled={membershipDisplay.isBlocked}
      >
        <View className="flex-row items-start">
          <Image
            source={getImageSource(farm.imageId)}
            className="w-14 h-14 mr-4 mt-1 rounded-full"
            resizeMode="cover"
          />
          <View className="flex-1">
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="font-semibold text-base text-black">{farm.farmName}</Text>
                <Text className="text-gray-600 text-sm mt-1">{farm.district}</Text>
              </View>
              {membershipDisplay.isBlocked && (
                <View className="ml-2">
                  <Entypo name="lock" size={20} color="black" />
                </View>
              )}
            </View>
            
            {/* Membership Status Display */}
            <View className="mt-1 flex-row items-center flex-wrap">
              <View className={`${membershipDisplay.bgColor} px-3 py-1 rounded-lg mr-2`}>
                <Text className={`${membershipDisplay.textColor} text-xs font-medium`}>
                  {membershipDisplay.text}
                </Text>
              </View>
            </View>
            
            {/* Show expiration warning for active Pro farms (not blocked) */}
            {renewalData && 
             !membershipDisplay.isBlocked && 
             membership.toLowerCase() === 'pro' && 
             renewalData.daysRemaining <= 7 && (
              <Text className="text-[#BE0003] text-xs mt-2 font-medium">
                Expires in {renewalData.daysRemaining} days
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }} 
        showsVerticalScrollIndicator={false} 
        className="px-6"
      >
        <View style={{ paddingVertical: 20 }}>
          <Text className="text-center font-semibold text-lg text-black">My Farms</Text>
          <Text className="text-center text-[#5B5B5B] text-sm mt-2">
            Click on a farm to edit farm details
          </Text>
          
 
          {renewalData && 
           !membershipExpired && 
           renewalData.daysRemaining <= 7 && 
           membership.toLowerCase() === 'pro' && (
            <View className="mt-4 bg-orange-50 p-4 rounded-lg border border-orange-200">
              <Text className="text-center text-orange-600 text-sm font-medium mb-2">
                Your Pro membership expires in {renewalData.daysRemaining} days
              </Text>
              <TouchableOpacity 
                className="bg-orange-600 py-2 px-4 rounded-full self-center"
                onPress={handleRenewalPress}
              >
                <Text className="text-white text-sm font-medium">Renew Early</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500">Loading farms...</Text>
          </View>
        ) : farms.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500 text-center mb-4">
              No farms found. Add your first farm to get started!
            </Text>
          </View>
        ) : (
          <>
            <View>
              {farms.map((farm, index) => renderFarmItem(farm, index))}
            </View>
            
            {/* Add New Farm Button */}
            <TouchableOpacity 
              className={`py-4 rounded-full mt-6 mx-4 ${
                hasBlockedFarms()
                  ? "bg-[#FDCF3F]" 
                  : "bg-black"
              }`}
              onPress={handleAddNewFarm}
            >
              <Text className="text-white text-center font-semibold text-base">
                {hasBlockedFarms() 
                  ? "Renew your PRO plan" 
                  : "Add New Farm"
                }
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddFarmList;