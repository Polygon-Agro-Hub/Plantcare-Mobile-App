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
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { selectFarmBasicDetails, selectFarmSecondDetails, resetFarm, setFarmSecondDetails } from '../../store/farmSlice';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import axios from "axios";
import ContentLoader, { Rect, Circle as LoaderCircle } from "react-content-loader/native";
import * as Progress from "react-native-progress";
import { encode } from 'base64-arraybuffer';
import { useTranslation } from "react-i18next";
import moment from 'moment';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

interface CropCardProps {
  id: number;
  image: { type: string; data: number[] };
  varietyNameEnglish: string;
  onPress: () => void;
  progress: number;
}

interface CropItem {
  id: number;
  image: { type: string; data: number[] };
  varietyNameEnglish: string;
  varietyNameSinhala: string;
  varietyNameTamil: string;
  startedAt: Date;
  staredAt: string;
  cropCalendar: number;
  progress: number;
}

const CropCard: React.FC<CropCardProps> = ({
  image,
  varietyNameEnglish,
  onPress,
  progress,
}) => {
  const bufferToBase64 = (buffer: number[]): string => {
    const uint8Array = new Uint8Array(buffer);
    return encode(uint8Array.buffer);
  };

  const formatImage = (imageBuffer: {
    type: string;
    data: number[];
  }): string => {
    const base64String = bufferToBase64(imageBuffer.data);
    return `data:image/png;base64,${base64String}`;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: "100%",
        padding: 5,
        borderRadius: 12,
        marginBottom: 24,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        backgroundColor: "white",
      }}
    >
       <View
           
                className="bg-white rounded-lg p-4 mb-4 border border-[#EFEFEF] shadow-sm flex-row items-center justify-between"
              >
      
      <Image
        source={
          typeof image === "string"
            ? { uri: image }
            : { uri: formatImage(image) }
        }
        style={{ width: 70, height: 70, borderRadius: 8 }}
        resizeMode="contain"
      />
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          marginLeft: 0,
          flex: 1,
          textAlign: "center",
          color: "#333",
        }}
      >
        {varietyNameEnglish}
      </Text>

      <View style={{ alignItems: "center", justifyContent: "center",marginTop:5}}>
        <Progress.Circle
          size={50}
          progress={progress}
          thickness={4}
          color="#4caf50"
          unfilledColor="#ddd"
          showsText={true}
          formatText={() => `${Math.round(progress * 100)}%`}
          textStyle={{ fontSize: 12 }}
      
        />
      </View>
      </View>
    </TouchableOpacity>
  );
};

type FarmDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList>;

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

const FarmDetailsScreen = () => {
  const navigation = useNavigation<FarmDetailsNavigationProp>();
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

  const [language, setLanguage] = useState("en");
  const { t } = useTranslation();
  const [crops, setCrops] = useState<CropItem[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const noCropsImage = require("@/assets/images/NoEnrolled.webp");

  const fetchCultivationsAndProgress = async () => {
    setLoading(true);
    try {
      setLanguage(t("MyCrop.LNG"));

      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        console.error("User token is missing");
        throw new Error("User is not authenticated");
      }

      const res = await axios.get<CropItem[]>(
        `${environment.API_BASE_URL}api/farm/get-user-ongoing-cul/${farmId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 404) {
        console.warn("No cultivations found. Clearing data.");
        setCrops([]);
        return;
      }

      const formattedCrops = res.data.map((crop: CropItem) => ({
        ...crop,
        staredAt: moment(crop.startedAt).format("YYYY-MM-DD"),
      }));

      const cropsWithProgress = await Promise.all(
        formattedCrops.map(async (crop) => {
          try {
            if (!crop.cropCalendar) {
              return { ...crop, progress: 0 };
            }

            const response = await axios.get(
              `${environment.API_BASE_URL}api/crop/slave-crop-calendar-progress/${crop.cropCalendar}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const completedStages = response.data.filter(
              (stage: { status: string }) => stage.status === "completed"
            ).length;
            const totalStages = response.data.length;

            const progress =
              totalStages > 0 ? Math.min(completedStages / totalStages, 1) : 0; 

            return { ...crop, progress };
          } catch (error) {
            console.error(
              `Error fetching progress for cropCalendar ${crop.cropCalendar}:`,
              error
            );
            return { ...crop, progress: 0 }; 
          }
        })
      );
      
      setTimeout(() => {
        setLoading(false);
        setRefreshing(false); 
      }, 300);

      setCrops(cropsWithProgress);
    } catch (error) {
      console.error("Error fetching cultivations or progress:", error);
      setCrops([]);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setRefreshing(false);
      }, 300);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (crops.length === 0) {
        setLoading(true);
        fetchCultivationsAndProgress();
      }
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchCultivationsAndProgress();
  };

  const SkeletonLoader = () => {
    return (
      <View style={{ marginTop: hp("2%"), paddingHorizontal: wp("5%") }}>
        <ContentLoader
          speed={2}
          width={wp("100%")}
          height={hp("120%")}
          viewBox={`0 0 ${wp("100%")} ${hp("120%")}`}
          backgroundColor="#ececec"
          foregroundColor="#fafafa"
        >
          {Array.from({ length: 10 }).map((_, index) => (
            <Rect
              key={index}
              x="0"
              y={index * hp("12%")}
              rx="12"
              ry="12"
              width={wp("90%")}
              height={hp("10%")}
            />
          ))}
        </ContentLoader>
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
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor="#f9fafb"
      />

      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 mt-[-50]"
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>

        <View className="items-center">
          <Image
            source={images[farmData?.imageId ?? farmBasicDetails?.selectedImage ?? 0]}
            className="w-20 h-20 rounded-full border-2 border-gray-200"
            resizeMode="cover"
            accessible
            accessibilityLabel={farmData?.farmName || farmBasicDetails?.farmName || 'Farm image'}
          />
        </View>

        <View className="relative">
          <TouchableOpacity
            onPress={() => setShowMenu(!showMenu)}
            className="p-2 mt-[-50]"
            accessibilityLabel="Open menu"
            accessibilityRole="button"
          >
            <Ionicons name="ellipsis-vertical" size={24} color="#374151" />
          </TouchableOpacity>

          {showMenu && (
            <View className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 w-32 z-10">
              <TouchableOpacity
                onPress={handleEditFarm}
                className="px-4 py-2 flex-row items-center"
                accessibilityLabel="Edit farm"
                accessibilityRole="button"
              >
                <Ionicons name="create-outline" size={16} color="#374151" />
                <Text className="ml-2 text-sm text-gray-700">Edit Farm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDeleteFarm}
                className="px-4 py-2 flex-row items-center"
                accessibilityLabel="Delete farm"
                accessibilityRole="button"
              >
                <Ionicons name="trash-outline" size={16} color="#374151" />
                <Text className="ml-2 text-sm text-gray-700">Delete Farm</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        className="px-6 bg-white"
      >
        {/* Farm Info Section */}
        <View className="items-center mt-4">
          <Text className="font-bold text-xl text-gray-900">
            {farmData?.farmName || farmBasicDetails?.farmName || 'Corn Field'}
          </Text>
          <View className="bg-blue-100 px-3 py-1 rounded-full mt-2">
            <Text className="text-blue-600 text-xs font-medium uppercase">BASIC</Text>
          </View>
          <Text className="text-gray-600 text-sm mt-2">
            {farmData?.district || farmBasicDetails?.district || 'Hambanthota'}
          </Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-gray-600 text-sm">
              • {managerCount} Managers
            </Text>
            <Text className="text-gray-600 text-sm ml-2">
              • {otherStaffCount} Other Staff
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-center mt-8 space-x-6">
          <TouchableOpacity
            className="bg-white p-4 rounded-xl items-center w-32 h-32 border border-[#445F4A33]"
            accessibilityLabel="View managers"
            accessibilityRole="button"
            onPress={() => {
              if (farmData?.id) {
                navigation.navigate('EditManagersScreen', { farmId: farmData.id });
              } else {
                console.error('Farm ID is undefined');
                Alert.alert('Error', 'Farm ID is not available');
              }
            }}
          >
            <View className="w-12 h-12 rounded-full items-center justify-center mb-2">
              <Image
                className="w-[55px] h-[55px]"
                source={require('../../assets/images/Farm/Managers.webp')}
              />
            </View>
            <Text className="text-black text-sm font-medium">Managers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white p-4 rounded-xl items-center w-32 h-32 border border-[#445F4A33]"
            accessibilityLabel="View farm assets"
            accessibilityRole="button"
            onPress={() => navigation.navigate('FarmAssetsScreen' as any)}
          >
            <View className="w-12 h-12 bg-purple-600 rounded-full items-center justify-center mb-2">
              <Image
                className="w-[55px] h-[55px]"
                source={require('../../assets/images/Farm/FarmAssets.webp')}
              />
            </View>
            <Text className="text-black text-sm font-medium">Farm Assets</Text>
          </TouchableOpacity>
        </View>

        {/* Crops Section */}
        <View className="mt-8">
       
          
          {loading ? (
            <SkeletonLoader />
          ) : crops.length === 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                padding: 16,
              }}
            >
            
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={{ padding: 16 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              {crops.map((crop) => (
                <CropCard
                  key={crop.id}
                  id={crop.id}
                  image={crop.image}
                  varietyNameEnglish={
                    language === "si"
                      ? crop.varietyNameSinhala
                      : language === "ta"
                      ? crop.varietyNameTamil
                      : crop.varietyNameEnglish
                  }
                  progress={crop.progress}
                  onPress={() =>
                    navigation.navigate("CropCalander", {
                      cropId: crop.cropCalendar,
                      startedAt: crop.staredAt,
                      cropName:
                        language === "si"
                          ? crop.varietyNameSinhala
                          : language === "ta"
                          ? crop.varietyNameTamil
                          : crop.varietyNameEnglish,
                    } as any)
                  }
                />
              ))}
            </ScrollView>
          )}
        </View>
           </ScrollView>
           <View className='mb-[10%]'>

        {/* Add New Asset Button */}
        <TouchableOpacity
          className="bg-gray-800 w-16 h-16 rounded-full items-center justify-center ml-[77%] shadow-lg "
          onPress={() => navigation.navigate('AddNewCrop',{ farmId: farmId })}
          accessibilityLabel="Add new asset"
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

export default FarmDetailsScreen;