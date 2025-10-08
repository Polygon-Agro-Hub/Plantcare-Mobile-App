import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { setFarmBasicDetails } from '../../store/farmSlice';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
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
  farmCropCount:number
  isBlock: number; 
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

interface RenewalData {
  id: number;
  userId: number;
  expireDate: string;
  needsRenewal: boolean;
  status: 'expired' | 'active';
  daysRemaining: number;
  activeStatus: number; 
}

interface RenewalResponse {
  success: boolean;
  data: RenewalData;
}

type MyCultivationNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MyCultivation = () => {
  const navigation = useNavigation<MyCultivationNavigationProp>();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.userData) as UserData | null;

  const [farms, setFarms] = useState<FarmItem[]>([]);
  const [membership, setMembership] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const {t} = useTranslation();
  const [renewalData, setRenewalData] = useState<RenewalData | null>(null);
  const [membershipExpired, setMembershipExpired] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Force refresh key

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

  const getImageSource = (imageId: number) => {
    return imageMap[imageId] || imageMap[1]; 
  };

  const fetchMembership = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert(t("Farms.Error"), t("Farms.No authentication token found"),[{ text: t("PublicForum.OK") }]);
        return;
      }

      // Add cache-busting timestamp
      const timestamp = new Date().getTime();
      const res = await axios.get(
        `${environment.API_BASE_URL}api/farm/get-membership?t=${timestamp}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
        }
      );

      if (res.data.success && res.data.data) {
        setMembership(res.data.data.membership);
      } else if (res.data.membership) {
        setMembership(res.data.membership);
      } else {
        console.error("Unexpected response structure:", res.data);
        Alert.alert(t("Farms.Error"), t("Main.somethingWentWrong"),[{ text: t("PublicForum.OK") }]);
      }

    } catch (err) {
      console.error("Error fetching membership:", err);
    }
  };

  const fetchFarms = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert(t("Farms.Error"), t("Farms.No authentication token found"),[{ text: t("PublicForum.OK") }]);
        return;
      }

      // Add cache-busting timestamp
      const timestamp = new Date().getTime();
      console.log("Fetching farms at:", timestamp);
      
      const res = await axios.get<FarmItem[]>(
        `${environment.API_BASE_URL}api/farm/get-farms?t=${timestamp}`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
        }
      );
      
      console.log("Farms response:", res.data);
      
      const formattedFarms = res.data.map(farm => ({
        ...farm,
        extentha: farm.extentha.toString(),
        extentac: farm.extentac.toString(),
        extentp: farm.extentp.toString()
      }));
      
      const sortedFarms = formattedFarms.sort((a, b) => a.id - b.id);
      
      console.log("Setting farms:", sortedFarms.length, "farms");
      setFarms(sortedFarms);
    } catch (err) {
      console.error("Error fetching farms:", err);
      // Clear farms on error to prevent stale data
      setFarms([]);
    }
  };

  const fetchRenewalStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      
      if (!token) {
        return;
      }

      // Add cache-busting timestamp
      const timestamp = new Date().getTime();
      const res = await axios.get<RenewalResponse>(
        `${environment.API_BASE_URL}api/farm/get-renew?t=${timestamp}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
        }
      );

      if (res.data.success && res.data.data) {
        setRenewalData(res.data.data);
        setMembershipExpired(res.data.data.needsRenewal);
      }

    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setRenewalData(null);
        setMembershipExpired(false);
      }
    }
  };

  // Fetch all data function
  const fetchAllData = async () => {
    console.log("=== STARTING FRESH DATA FETCH ===");
    setLoading(true);
    
    // Clear existing data first to prevent showing stale data
    setFarms([]);
    
    try {
      await Promise.all([
        fetchMembership(),
        fetchFarms(),
        fetchRenewalStatus()
      ]);
      console.log("=== DATA FETCH COMPLETED ===");
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Pull to refresh handler
  const onRefresh = async () => {
    console.log("Manual refresh triggered");
    setRefreshing(true);
    setFarms([]); // Clear data immediately
    try {
      await fetchAllData();
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log("🔄 Screen FOCUSED - Fetching data");
      setRefreshKey(prev => prev + 1); // Increment key to force refresh
      fetchAllData();
      
      return () => {
        console.log("Screen UNFOCUSED");
      };
    }, []) // Empty array - creates new callback each time
  );

  const hasBlockedFarms = () => {
    return (
      (renewalData && renewalData.activeStatus === 0) ||
      farms.some(farm => farm.isBlock === 1) || 
      (membership.toLowerCase() === 'pro' && renewalData?.needsRenewal)
    );
  };

  const handleAddNewFarm = () => {
    if (hasBlockedFarms()) {
      navigation.navigate('AddNewFarmUnloackPro' as any);
      return;
    }
  
    if (membership.toLowerCase() === "basic" && farms.length >= 1) {
      navigation.navigate('AddNewFarmUnloackPro' as any, {
        membership: membership
      });
      return;
    }

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

  const handleFarmPress = (farm: FarmItem) => {
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
    console.log("Navigating to farm:", farm.id);
    navigation.navigate('FarmDetailsScreen', { farmId: farm.id, farmName: farm.farmName });
  };

  const getMembershipDisplay = (farm: FarmItem) => {
    if (membership.toLowerCase() === 'pro') {
      if (renewalData && renewalData.needsRenewal) {
        if (farm.isBlock === 0) {
          return {
            text: 'BASIC',
            bgColor: 'bg-[#CDEEFF]',
            textColor: 'text-[#223FFF]',
            showRenew: false,
            isBlocked: false
          };
        } else {
          return {
            text: 'RENEW',
            bgColor: 'bg-[#FFDEDE]',
            textColor: 'text-[#BE0003]',
            showRenew: true,
            isBlocked: true
          };
        }
      } else {
        if (farm.isBlock === 1) {
          return {
            text: 'RENEW',
            bgColor: 'bg-[#FFDEDE]',
            textColor: 'text-[#BE0003]',
            showRenew: true,
            isBlocked: true
          };
        } else {
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
      return {
        text: 'BASIC',
        bgColor: 'bg-[#CDEEFF]',
        textColor: 'text-[#223FFF]',
        showRenew: false,
        isBlocked: false
      };
    }
  };

  const renderFarmItem = (farm: FarmItem, index: number) => {
    const membershipDisplay = getMembershipDisplay(farm);

    return (
      <TouchableOpacity
        key={`farm-${farm.id}-${refreshKey}`} // Include refreshKey to force re-render
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
    );
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView 
        key={refreshKey} // Force re-render of ScrollView
        contentContainerStyle={{ flexGrow: 1 }} 
        showsVerticalScrollIndicator={false} 
        className="px-6"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FDCF3F']}
            tintColor="#FDCF3F"
          />
        }
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
              {t("MyCrop.NoDataFound")}
            </Text>
          </View>
        ) : (
          <View>
            {farms.map((farm, index) => renderFarmItem(farm, index))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default MyCultivation;