import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { selectFarmBasicDetails, selectFarmSecondDetails, resetFarm, setFarmSecondDetails } from '../../store/farmSlice';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import axios from "axios";

type EditManagersScreenProp = NativeStackNavigationProp<RootStackParamList>;

type RouteParams = {
  farmId: number;
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
  const navigation = useNavigation<EditManagersScreenProp>();
  const dispatch = useDispatch();
  const farmBasicDetails = useSelector(selectFarmBasicDetails);
  const farmSecondDetails = useSelector(selectFarmSecondDetails);
  const [showMenu, setShowMenu] = useState(false);
  const route = useRoute();
  const { farmId } = route.params as RouteParams; 
  const [farmData, setFarmData] = useState<FarmItem | null>(null);
  const [staffData, setStaffData] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate manager and other staff counts
  const managerCount = staffData.filter(staff => staff.role === 'Manager').length;
  const otherStaffCount = staffData.filter(staff => staff.role !== 'Manager').length;

  console.log(";;;;;;;;;;;;;iddd", farmId);
  
  const images = [
    require('../../assets/images/Farm/1.webp'), 
    require('../../assets/images/Farm/2.webp'),
  ];

  const farmAssets = [
    {
      name: 'Carrot',
      progress: 60,
      image: require('../../assets/images/Farm/carrot.webp'),
    },
    {
      name: 'Bell Pepper',
      progress: 60,
      image: require('../../assets/images/Farm/bellpaper.webp'),
    },
    {
      name: 'Banana',
      progress: 60,
      image: require('../../assets/images/Farm/banana.webp'),
    },
  ];

  const handleEditFarm = () => {
    navigation.navigate('AddNewFarmBasicDetails');
    setShowMenu(false);
  };

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
          },
        }
      );
      
      console.log("datttttt", res.data);
      
      // Set the farm data and staff data
      setFarmData(res.data.farm);
      setStaffData(res.data.staff);

    } catch (err) {
      console.error("Error fetching farms:", err);
      Alert.alert("Error", "Failed to fetch farms data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, [farmId]);

  const handleDeleteFarm = () => {
    dispatch(resetFarm());
    navigation.goBack();
    setShowMenu(false);
  };

  const handleAddStaff = () => {
  navigation.navigate('AddnewStaff', { farmId: farmId });
  
  setShowMenu(false);
};

  const CircularProgress = ({ progress }: { progress: number }) => {
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <View className="w-12 h-12">
        <Svg width="48" height="48" viewBox="0 0 48 48">
          <Circle
            cx="24"
            cy="24"
            r={radius}
            fill="none"
            stroke="#E0E0E0"
            strokeWidth="4"
          />
          <Circle
            cx="24"
            cy="24"
            r={radius}
            fill="none"
            stroke="#10B981"
            strokeWidth="4"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 24 24)"
            strokeLinecap="round"
          />
          <SvgText
            x="24"
            y="28"
            textAnchor="middle"
            fontSize="10"
            fill="#10B981"
            fontWeight="600"
          >
            {progress}%
          </SvgText>
        </Svg>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-gray-600">Loading...</Text>
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
                onPress={() => navigation.goBack()}
                className="p-2 mt-[-50]"
                accessibilityLabel="Go back"
                accessibilityRole="button"
              >
                <Ionicons name="chevron-back" size={24} color="#374151" />
              </TouchableOpacity>
      

        <View className="flex-1 items-center">
          <Image
            source={images[farmData?.imageId ?? farmBasicDetails?.selectedImage ?? 0]}
            className="w-20 h-20 rounded-full border-2 border-gray-200"
            resizeMode="cover"
            accessible
            accessibilityLabel={farmData?.farmName || farmBasicDetails?.farmName || 'Farm image'}
          />
        </View>

        <View className="w-10" />
      </View>

      {/* Farm Info Section */}
      <View className="bg-white px-6 pb-6">
        <View className="items-center">
              <View className="flex-row items-center ">
           <Text className="font-bold text-xl text-gray-900 mr-3">
             {farmData?.farmName || farmBasicDetails?.farmName || 'Corn Field'}
           </Text>
           <View className="bg-[#CDEEFF] px-3 py-1 rounded-lg">
             <Text className="text-[#223FFF] text-xs font-medium uppercase">BASIC</Text>
           </View>
         </View>
          <Text className="text-gray-600 text-sm mb-1">
            {farmData?.district || farmBasicDetails?.district || 'Hambanthota'}
          </Text>
          <Text className="text-gray-600 text-sm">
            {managerCount} Managers
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        className="px-6"
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
                  <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 `}>
                  
                      <Image 
                        source={require('../../assets/images/Farm/profile.png')}
                        className="w-full h-full rounded-full"
                        resizeMode="cover"
                      />
                 
                  </View>
                  
                  {/* Staff Info */}
                  <View className="flex-1">
                    <Text className="text-base font-medium text-gray-900">
                      {staff.firstName} {staff.lastName}
                    </Text>
                    <Text className="text-sm text-gray-600">Farm {staff.role}</Text>
                    <Text className="text-sm text-gray-500">
                      {staff.phoneCode} {staff.phoneNumber}
                    </Text>
                  </View>
                </View>
                
                {/* Edit Button */}
                <TouchableOpacity 
                  className="p-2"
                  onPress={() => {
                    // Handle edit staff
                    console.log("Edit staff:", staff.id);
                  }}
                >
                  {/* <Ionicons name="create-outline" size={16} color="#9CA3AF" /> */}
                    <Image 
                        source={require('../../assets/images/Farm/pen.png')}
                        className="w-6 h-6 rounded-full"
                        resizeMode="cover"
                       
                      />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Empty state if no staff */}
        {staffData.length === 0 && (
          <View className="items-center mt-12">
            <Text className="text-gray-500 text-center">No staff members found</Text>
          </View>
        )}
      </ScrollView>

      {/* Add New Staff Button */}
      <View className="absolute bottom-6 right-6">
        <TouchableOpacity
          className="bg-gray-800 w-16 h-16 rounded-full items-center justify-center shadow-lg"
          onPress={handleAddStaff}
          accessibilityLabel="Add new staff member"
          accessibilityRole="button"
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Backdrop for menu */}
      {showMenu && (
        <TouchableOpacity
          className="absolute inset-0 bg-black/20"
          onPress={() => setShowMenu(false)}
          activeOpacity={1}
          accessibilityLabel="Close menu"
          accessibilityRole="button"
        />
      )}
    </SafeAreaView>
  );
};

export default EditManagersScreen;