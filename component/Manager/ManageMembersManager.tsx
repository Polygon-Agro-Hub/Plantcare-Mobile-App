import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
  BackHandler,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import axios from "axios";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTranslation } from "react-i18next";
import ContentLoader, { Rect, Circle as LoaderCircle } from "react-content-loader/native";
import { encode } from "base64-arraybuffer";

type ManageMembersManagerNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ManageMembersManager'
>;

type RouteParams = {
  farmId: number;
  farmName: string;
  imageId?: number;
};

interface StaffMember {
  id: number;
  ownerId: number;
  farmId: number;
  firstName: string;
  lastName: string;
  phoneCode: string;
  phoneNumber: string;
  role: string;
  nic: string;
  image?: { type: string; data: number[] } | null;
  createdAt: string;
}

interface FarmData {
  farm: any;
  staff: StaffMember[];
  staffCount: number;
  appUserCount?: number;
}

interface FarmStats {
  supervisorCount: number;
  laborerCount: number;
  otherStaffCount: number;
  totalCount: number;
}

const ManageMembersManager = () => {
  const navigation = useNavigation<ManageMembersManagerNavigationProp>();
  const route = useRoute();
  const { farmId, farmName, imageId } = route.params as RouteParams;
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [totalStaffCount, setTotalStaffCount] = useState(0);
  const [stats, setStats] = useState<FarmStats>({
    supervisorCount: 0,
    laborerCount: 0,
    otherStaffCount: 0,
    totalCount: 0,
  });

  const getImageSource = useCallback((imageId?: number) => {
    if (!imageId) {
      return require('@/assets/images/Farm/1.webp');
    }
    
    try {
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
      
      return imageMap[imageId] || require('@/assets/images/Farm/1.webp');
    } catch (err) {
      console.error('Error loading farm image:', err);
      return require('@/assets/images/Farm/1.webp');
    }
  }, []);

  const bufferToBase64 = (buffer: number[]): string => {
    const uint8Array = new Uint8Array(buffer);
    return encode(uint8Array.buffer);
  };

  const formatImage = (imageBuffer: { type: string; data: number[] }): string => {
    const base64String = bufferToBase64(imageBuffer.data);
    return `data:image/png;base64,${base64String}`;
  };

  const calculateStats = (staffList: StaffMember[], totalStaffCount: number) => {
    const supervisors = staffList.filter(s => s.role === 'Supervisor').length;
    const laborers = staffList.filter(s => s.role === 'Laborer').length;
    
    // Calculate other staff count: total staff count minus supervisors and laborers
    const otherStaffCount = totalStaffCount - supervisors - laborers;

    console.log("Stats Calculation:", {
      totalStaffCount,
      supervisors,
      laborers,
      otherStaffCount
    });

    setStats({
      supervisorCount: supervisors,
      laborerCount: laborers,
      otherStaffCount: Math.max(0, otherStaffCount), // Ensure it's not negative
      totalCount: totalStaffCount,
    });
  };

  const fetchFarmStaff = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        console.error("User token is missing");
        throw new Error("User is not authenticated");
      }

      console.log("Fetching staff for farmId:", farmId);

      const res = await axios.get<FarmData>(
        `${environment.API_BASE_URL}api/staff/get-supervisor&Laboror/${farmId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Farm Staff Response:", res.data);

      if (res.data) {
        setStaff(res.data.staff || []);
        setTotalStaffCount(res.data.staffCount || 0);
        calculateStats(res.data.staff || [], res.data.staffCount || 0);
      } else {
        setStaff([]);
        setTotalStaffCount(0);
        calculateStats([], 0);
      }

      setTimeout(() => {
        setLoading(false);
        setRefreshing(false);
      }, 300);
    } catch (error) {
      console.error("Error fetching farm staff:", error);
      setStaff([]);
      setTotalStaffCount(0);
      calculateStats([], 0);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setRefreshing(false);
      }, 300);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchFarmStaff();
    }, [farmId])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFarmStaff();
  }, [farmId]);

  const handleEditMember = (member: StaffMember) => {
    console.log("Edit member:", member);
    Alert.alert(
      "Edit Member",
      `Edit ${member.firstName} ${member.lastName}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Edit", 
          onPress: () => {
            // Navigate to edit screen with required parameters - FIXED SCREEN NAME
            navigation.navigate("ManageEditscreen", {
              staffMemberId: member.id,
              farmId: farmId,
              farmName: farmName
            });
          }
        }
      ]
    );
  };

  const getRoleDisplayName = (role: string) => {
    if (role === 'Supervisor') return 'Farm Supervisor';
    if (role === 'Laborer') return 'Farm Laborer';
    if (role === 'Manager') return 'Farm Manager';
    return role;
  };

  const getRoleColor = (role: string) => {
    if (role === 'Supervisor') return '#3B82F6'; // Blue
    if (role === 'Laborer') return '#10B981'; // Green
    if (role === 'Manager') return '#8B5CF6'; // Purple
    return '#6B7280'; // Gray
  };

  const SkeletonLoader = () => {
    return (
      <View style={{ marginTop: hp("2%"), paddingHorizontal: wp("5%") }}>
        <ContentLoader
          speed={2}
          width={wp("90%")}
          height={hp("60%")}
          viewBox={`0 0 ${wp("90%")} ${hp("60%")}`}
          backgroundColor="#ececec"
          foregroundColor="#fafafa"
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <React.Fragment key={index}>
              <LoaderCircle cx="40" cy={40 + index * 100} r="30" />
              <Rect
                x="90"
                y={20 + index * 100}
                rx="4"
                ry="4"
                width={wp("50%")}
                height="20"
              />
              <Rect
                x="90"
                y={50 + index * 100}
                rx="4"
                ry="4"
                width={wp("40%")}
                height="15"
              />
            </React.Fragment>
          ))}
        </ContentLoader>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Section */}
        <View className="bg-white px-5 pt-2 pb-4 rounded-b-3xl shadow-sm">
          <TouchableOpacity
            onPress={() => navigation.navigate(
  "ManagerFarmDetails", 
  { 
    farmId: farmId, 
    farmName: farmName ,
    imageId:imageId
  }
)}
            className="mb-[-5%]"
          >
            <MaterialCommunityIcons name="chevron-left" size={32} color="#374151" />
          </TouchableOpacity>

          {/* Farm Image and Name */}
          <View className="items-center mb-4">
            <View className="rounded-full w-24 h-24 shadow-lg mb-3 overflow-hidden border-4 border-white">
              <Image
                source={getImageSource(imageId ? Number(imageId) : undefined)}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            <Text className="text-2xl font-bold text-gray-800">{farmName}</Text>
          </View>

          {/* Stats Row - Supervisors, Laborers, and Other Staff */}
          <View className="flex-row justify-center items-center flex-wrap px-4">
            <Text className="text-sm text-gray-600 mx-1">
              {stats.supervisorCount} Supervisor{stats.supervisorCount !== 1 ? 's' : ''}
            </Text>
            <Text className="text-sm text-gray-600 mx-1">•</Text>
            <Text className="text-sm text-gray-600 mx-1">
              {stats.laborerCount} Laborer{stats.laborerCount !== 1 ? 's' : ''}
            </Text>
            <View className="flex-row justify-center items-center flex-wrap px-4 mt-4">
            <Text className="text-sm text-gray-600 mx-1">•</Text>
            <Text className="text-sm text-gray-600 mx-1">
              {totalStaffCount} Other Staff
            </Text>
            </View>
          </View>
        </View>

        {/* Staff List - Only Supervisors and Laborers */}
        <View className="px-5 mt-6">
          {loading ? (
            <SkeletonLoader />
          ) : staff.filter(member => member.role === 'Supervisor' || member.role === 'Laborer').length === 0 ? (
            <View className="items-center justify-center py-10">
              <Text className="text-gray-500 text-base">
                No supervisors or laborers found for this farm
              </Text>
            </View>
          ) : (
            staff
              .filter(member => member.role === 'Supervisor' || member.role === 'Laborer')
              .map((member) => (
              <View
                key={member.id}
                className="bg-white rounded-2xl p-4 mb-3 flex-row items-center shadow-sm"
              >
                {/* Profile Image */}
                <View className="w-16 h-16 rounded-full overflow-hidden mr-4" 
                //  style={{ backgroundColor: getRoleColor(member.role) + '20' }}
                >
                  {member.image && member.image.data ? (
                    <Image
                      source={{ uri: formatImage(member.image) }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-full items-center justify-center">
  <Image 
                      source={require('../../assets/images/Farm/profile.png')}
                      className="w-full h-full rounded-full"
                      resizeMode="cover"
                    />
                    </View>
                  )}
                </View>

                {/* Member Info */}
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-800">
                    {member.firstName} {member.lastName}
                  </Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    {getRoleDisplayName(member.role)}
                  </Text>
                  <Text className="text-sm text-gray-500 mt-1">
                    {member.phoneCode} {member.phoneNumber}
                  </Text>
                </View>

                {/* Edit Button */}
                <TouchableOpacity
                  onPress={() => handleEditMember(member)}
                  className="p-2"
                >
                  <MaterialCommunityIcons name="pencil" size={24} color="#374151" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Add Bottom Padding */}
        <View className="h-20" />
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-gray-800 rounded-full w-16 h-16 items-center justify-center shadow-lg"
        activeOpacity={0.8}
        onPress={() => navigation.navigate(
          "ManagerAddStaff", 
          { 
            farmId: farmId  
          }
        )}
      >
        <MaterialCommunityIcons name="plus" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default ManageMembersManager;