import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
  BackHandler,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { selectFarmBasicDetails, selectFarmSecondDetails, resetFarm, setFarmSecondDetails } from '../../store/farmSlice';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import axios from "axios";
import LottieView from 'lottie-react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTranslation } from "react-i18next";
import ImageData from '@/assets/jsons/farmImage.json'; // Add this import

type EditManagersScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'EditManagersScreen'
>;

type RouteParams = {
  farmId: number;
  staffMemberId?: number; // Make it optional since it's not always passed
  membership:string;
  renew:string
};

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

interface Staff {
  createdAt: string;
  farmId: number;
  firstName: string;
  id: number;
  image: string | null;
  lastName: string;
  ownerId: number;
  phoneCode: string;
  phoneNumber: string;
  role: string;
}

interface FarmDetailsResponse {
  farm: FarmItem;
  staff: Staff[];
}

const EditManagersScreen = () => {
  const navigation = useNavigation<EditManagersScreenNavigationProp>();
  const dispatch = useDispatch();
  const farmBasicDetails = useSelector(selectFarmBasicDetails);
  const farmSecondDetails = useSelector(selectFarmSecondDetails);
  const [showMenu, setShowMenu] = useState(false);
  const route = useRoute();
  const { farmId, membership, renew } = route.params as RouteParams; 
  const [farmData, setFarmData] = useState<FarmItem | null>(null);
  const [staffData, setStaffData] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  console.log("membership-------------", membership, renew);

  // Replace the hardcoded images array with dynamic image loading function
  const getImageSource = useCallback((imageId?: number) => {
    console.log('Getting image for imageId:', imageId); // Debug log
    
    if (!imageId || !ImageData || !Array.isArray(ImageData)) {
      return require('@/assets/images/Farm/1.webp'); // Default fallback
    }
    
    try {
      // Find the image by ID
      const imageItem = ImageData.find(img => img && img.id === imageId);
      
      if (!imageItem || !imageItem.source) {
        return require('@/assets/images/Farm/1.webp'); // Default fallback
      }
      
      // Map the source path to actual require statements
      const imageMap: { [key: string]: any } = {
        '@/assets/images/Farm/1.webp': require('@/assets/images/Farm/1.webp'),
        '@/assets/images/Farm/2.webp': require('@/assets/images/Farm/2.webp'),
        '@/assets/images/Farm/3.webp': require('@/assets/images/Farm/3.webp'),
        '@/assets/images/Farm/4.webp': require('@/assets/images/Farm/4.webp'),
        '@/assets/images/Farm/5.webp': require('@/assets/images/Farm/5.webp'),
        '@/assets/images/Farm/6.webp': require('@/assets/images/Farm/6.webp'),
        '@/assets/images/Farm/7.webp': require('@/assets/images/Farm/7.webp'),
        '@/assets/images/Farm/8.webp': require('@/assets/images/Farm/8.webp'),
        '@/assets/images/Farm/9.webp': require('@/assets/images/Farm/9.webp'),
      };
      
      console.log('Using image source:', imageItem.source); // Debug log
      return imageMap[imageItem.source] || require('@/assets/images/Farm/1.webp');
    } catch (err) {
      console.error('Error loading farm image:', err);
      return require('@/assets/images/Farm/1.webp');
    }
  }, []);

  // Calculate manager and other staff counts
  const managerCount = staffData.filter(staff => staff.role === 'Manager').length;
  const otherStaffCount = staffData.filter(staff => staff.role !== 'Manager').length;
  const { t } = useTranslation();

  // Update fetchFarms to ensure fresh data and add refresh on focus
  const fetchFarms = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert("Error", "No authentication token found");
        return;
      }

      const res = await axios.get<FarmDetailsResponse>(
        `${environment.API_BASE_URL}api/farm/get-farms/byFarm-Id/${farmId}`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache', // Prevent caching
          },
        }
      );
      
      console.log("Fresh farm data received in EditManagersScreen:", res.data);
      setFarmData(res.data.farm);
      setStaffData(res.data.staff);

    } catch (err) {
      console.error("Error fetching farms:", err);
      // Alert.alert("Error", "Failed to fetch farms data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, [farmId]);

  // Add focus effect to refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchFarms();
    }, [farmId])
  );

  // Rest of your existing functions remain the same...
  const handleDeleteFarm = () => {
    dispatch(resetFarm());
    navigation.goBack();
    setShowMenu(false);
  };

  const handleAddStaff = () => {
    navigation.navigate('AddnewStaff', { farmId });
    setShowMenu(false);
  };

  const handleEditStaffMember = (staffId: number) => {
    console.log(staffId);
    navigation.navigate('EditStaffMember', { 
      staffMemberId: staffId,
      farmId: farmId,
      membership: membership,
      renew: renew
    });
  };

  const getMembershipDisplay = () => {
    if (!membership) {
      return {
        text: 'BASIC',
        bgColor: 'bg-[#CDEEFF]',
        textColor: 'text-[#223FFF]',
        showRenew: false
      };
    }

    const isPro = membership.toLowerCase() === 'pro';
    const isExpired = renew;
    console.log("Is Expired", isExpired);

    if (isPro && !isExpired) {
      return {
        text: 'PRO',
        bgColor: 'bg-[#FFF5BD]',
        textColor: 'text-[#E2BE00]',
        showRenew: false
      };
    } else if (isPro && isExpired) {
      return {
        text: 'BASIC',
        bgColor: 'bg-[#CDEEFF]',
        textColor: 'text-[#223FFF]',
        showRenew: true
      };
    } else {
      return {
        text: 'BASIC',
        bgColor: 'bg-[#CDEEFF]',
        textColor: 'text-[#223FFF]',
        showRenew: false
      };
    }
  };

  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        navigation.navigate("Main", {
          screen: "FarmDetailsScreen",
          params: { farmId: farmId }
        });
        return true;
      };

      BackHandler.addEventListener("hardwareBackPress", handleBackPress);

      return () => {
        BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
      };
    }, [navigation])
  );

  // ... CircularProgress component remains the same

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <LottieView
          source={require('../../assets/jsons/loader.json')}
          autoPlay
          loop
          style={{ width: 300, height: 300 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor="#f9fafb"
      />

      {/* Header */}
      <View className="bg-white px-4 py-6 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => navigation.navigate("Main", { 
            screen: "FarmDetailsScreen",
            params: { farmId: farmId }
          })} 
          className="p-2 mt-[-50]"
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={24} color="#374151" style={{ paddingHorizontal: wp(3), paddingVertical: hp(1.5), backgroundColor: "#F6F6F680", borderRadius: 50 }} />
        </TouchableOpacity>

        <View className="flex-1 items-center">
          <Image
            source={getImageSource(farmData?.imageId)} // Use the dynamic image loading function
            className="w-20 h-20 rounded-full border-2 border-gray-200"
            resizeMode="cover"
            accessible
            accessibilityLabel={farmData?.farmName || farmBasicDetails?.farmName}
          />
        </View>

        <View className="w-10" />
      </View>

      {/* Rest of your JSX remains the same... */}
      {/* Farm Info Section */}
      <View className="bg-white px-6 pb-6">
        <View className="items-center">
          <View className="flex-row items-center ">
            <Text className="font-bold text-xl text-gray-900 mr-3">
              {farmData?.farmName || farmBasicDetails?.farmName }
            </Text>
            {(() => {
              const membershipDisplay = getMembershipDisplay();
              return (
                <View className={`${membershipDisplay.bgColor} px-3 py-1 rounded-lg`}>
                  <Text className={`${membershipDisplay.textColor} text-xs font-medium uppercase`}>
                    {t(`Farms.${membershipDisplay.text}`)}
                  </Text>
                </View>
              );
            })()}
          </View>
          <Text className="text-gray-600 text-sm mb-1">
            {farmData?.district}
          </Text>
          <Text className="text-gray-600 text-sm">
            {managerCount} {t("Farms.Managers")}
          </Text>
        </View>
      </View>

      {/* Rest of your existing JSX for ScrollView and staff list... */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        className="px-6 mb-10"
      >
        {/* Staff List Section */}
        {staffData.length > 0 && (
          <View className="mt-6">
            {staffData.map((staff, index) => (
              <View
                key={staff.id}
                className="bg-white rounded-lg p-4 mb-3 border border-gray-100 shadow-sm flex-row items-center justify-between"
              >
                <View className="flex-row items-center flex-1">
                  {/* Avatar */}
                  <View className="w-12 h-12 rounded-full items-center justify-center mr-4">
                    <Image 
                      source={require('../../assets/images/Farm/profile.png')}
                      className="w-full h-full rounded-full"
                      resizeMode="cover"
                    />
                  </View>
                  
                  <View className="flex-1">
                    <Text className="text-base font-medium text-gray-900">
                      {staff.firstName} {staff.lastName}
                    </Text>
                    <Text className="text-sm text-gray-600">{t("Farms.Farm")} {staff.role}</Text>
                    <Text className="text-sm text-gray-500">
                      {staff.phoneCode} {staff.phoneNumber}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity 
                  className="p-2"
                  onPress={() => handleEditStaffMember(staff.id)}
                >
                  <Image 
                    source={require('../../assets/images/Farm/pen1.png')}
                    className="w-6 h-6 rounded-full"
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {staffData.length === 0 && (
          <View className="items-center mt-12">
            <Text className="text-gray-500 text-center">{t("Farms.No staff members found")}</Text>
          </View>
        )}
      </ScrollView>

      <View className="absolute bottom-6 right-6 mb-[8%]">
        <TouchableOpacity
          className="bg-gray-800 w-16 h-16 rounded-full items-center justify-center shadow-lg"
          onPress={handleAddStaff}
          accessibilityLabel="Add new staff member"
          accessibilityRole="button"
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default EditManagersScreen;