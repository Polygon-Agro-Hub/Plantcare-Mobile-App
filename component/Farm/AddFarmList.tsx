import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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

  // Fetch farms from backend
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
      
      const formattedFarms = res.data.map(farm => ({
        ...farm,
        extentha: farm.extentha.toString(),
        extentac: farm.extentac.toString(),
        extentp: farm.extentp.toString()
      }));
      
      setFarms(formattedFarms);
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

  // Function to get membership display text and color
  const getMembershipDisplay = () => {
    if (membership.toLowerCase() === 'pro') {
      if (membershipExpired) {
        return {
          text: 'RENEW',
          bgColor: 'bg-[#FFDEDE]',
          textColor: 'text-[#BE0003]',
          showRenew: true
        };
      } else {
        return {
          text: 'PRO',
          bgColor: 'bg-[#FFF5BD]',
          textColor: 'text-[#E2BE00]',
          showRenew: false
        };
      }
    } else {
      return {
        text: 'BASIC',
        bgColor: 'bg-[#CDEEFF]',
        textColor: 'text-[#223FFF]',
        showRenew: false
      };
    }
  };

  // Handle adding new farm with conditional navigation
  const handleAddNewFarm = () => {
    // Check if membership is expired
    if (membershipExpired && membership.toLowerCase() === 'pro') {
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
    // Block navigation if membership is expired
    if (membershipExpired && membership.toLowerCase() === 'pro') {
      Alert.alert(
        "Membership Expired",
        "Your Pro membership has expired. Please renew to access farm details.",
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
    const membershipDisplay = getMembershipDisplay();
    
    return (
      <TouchableOpacity
        key={`${farm.farmIndex}-${index}`}
        className={`bg-white shadow-sm rounded-lg p-4 mb-4 border border-[#F2F2F2] ${
          membershipExpired ? 'opacity-75' : ''
        }`}
        onPress={() => handleFarmPress(farm)}
        disabled={membershipExpired && membership.toLowerCase() === 'pro'}
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
              {membershipExpired && membership.toLowerCase() === 'pro' && (
                <View className="ml-2">
                  {/* <Text className="text-gray-600 text-lg">🔒</Text> */}
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
            
            {/* Show expiration warning for active Pro users */}
            {renewalData && !membershipExpired && membership.toLowerCase() === 'pro' && renewalData.daysRemaining <= 7 && (
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
          
       
          {/* Show renewal reminder for active pro users */}
          {renewalData && !membershipExpired && renewalData.daysRemaining <= 7 && membership.toLowerCase() === 'pro' && (
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
                membershipExpired && membership.toLowerCase() === 'pro'
                  ? "bg-[#FDCF3F]" 
                  : "bg-black"
              }`}
              onPress={handleAddNewFarm}
            >
              <Text className="text-white text-center font-semibold text-base">
                {membershipExpired && membership.toLowerCase() === 'pro' 
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