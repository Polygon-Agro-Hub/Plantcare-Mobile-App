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

// Define navigation prop type
type AddFarmListNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AddFarmList = () => {
  const navigation = useNavigation<AddFarmListNavigationProp>();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.userData) as UserData | null;
  console.log("AddFarmList - user data from redux:", user);

  const [farms, setFarms] = useState<FarmItem[]>([]);
  const [membership, setMembership] = useState('');
  const [loading, setLoading] = useState(true);

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
      Alert.alert("Error", "Failed to fetch membership data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembership();
  }, []);

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
      
      // Convert number fields to strings if needed
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
    fetchFarms();
  }, []);

  // Handle adding new farm with conditional navigation
  const handleAddNewFarm = () => {
    // Check if user has Basic membership and already has 3 or more farms
    if (membership === "Basic" ) {
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

    // Navigate to add farm screen for Premium users or Basic users with < 3 farms
    navigation.navigate('AddNewFarmBasicDetails');
  };

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
    navigation.navigate('FarmDetailsScreen', { farmId: farm.id });
  };

  // Render farm item
  const renderFarmItem = (farm: FarmItem, index: number) => (
    <TouchableOpacity
      key={`${farm.farmIndex}-${index}`}
      className="bg-white shadow-sm rounded-lg p-4 mb-4 border border-[#F2F2F2]"
      onPress={() => handleFarmPress(farm)}
    >
      <View className="flex-row items-start">
        <Image
          source={getImageSource(farm.imageId)}
          className="w-14 h-14 mr-4 mt-4 rounded-full"
          resizeMode="cover"
        />
        <View className="flex-1">
          <View className="flex-row justify-between items-start">
            <View>
              <Text className="font-semibold text-base">{farm.farmName}</Text>
              <Text className="text-gray-600 text-sm">{farm.district}</Text>
            </View>
          </View>
          <View className="mt-2">
            <View className="bg-[#CDEEFF] px-3 py-1 rounded-lg self-start">
              <Text className="text-[#223FFF] text-xs font-medium">
                {membership.toUpperCase() || 'BASIC'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }} 
        showsVerticalScrollIndicator={false} 
        className="px-6"
      >
        <View style={{ paddingVertical: 20 }}>
          <Text className="text-center font-semibold text-lg">My Farms</Text>
          <Text className="text-center text-[#5B5B5B] text-sm mt-2">
            Click on a farm to edit farm details
          </Text>
          {/* Show farm count for Basic users */}
          {/* {membership === "Basic" && (
            <View className="mt-3">
              <Text className="text-center text-orange-600 text-sm font-medium">
                {farms.length}/3 farms used
              </Text>
              {farms.length >= 3 && (
                <Text className="text-center text-red-500 text-xs mt-1">
                  Upgrade to Premium to add more farms
                </Text>
              )}
            </View>
          )} */}
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
          <TouchableOpacity 
          className={`py-3 rounded-full mt-4 mx-4 ${
            membership === "Basic" && farms.length >= 1
              ? "bg-orange-500" 
              : "bg-black"
          }`}
          onPress={handleAddNewFarm}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {membership === "Basic" && farms.length >= 1
              ? "Add New Farm" 
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