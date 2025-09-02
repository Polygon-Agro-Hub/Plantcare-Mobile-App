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
  RefreshControl,
  Modal,
  BackHandler,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { selectFarmBasicDetails, selectFarmSecondDetails, resetFarm, setFarmSecondDetails } from '../../store/farmSlice';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { AntDesign, Ionicons ,Entypo } from '@expo/vector-icons';
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
import LottieView from "lottie-react-native";

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
  isBlock: number;
}

interface CropCardProps {
  id: number;
  image: { type: string; data: number[] };
  varietyNameEnglish: string;
  onPress: () => void;
  progress: number;
  isBlock?: number; // Add isBlock prop
}

const CropCard: React.FC<CropCardProps> = ({
  image,
  varietyNameEnglish,
  onPress,
  progress,
  isBlock = 0, // Default to 0 (not blocked)
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

  const isBlocked = isBlock === 1;

  return (
    <TouchableOpacity
      onPress={isBlocked ? undefined : onPress} // Disable onPress if blocked
      style={{
        width: "100%",
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        opacity: isBlocked ? 0.6 : 1, // Reduce opacity for blocked crops
      }}
      disabled={isBlocked} // Disable touch if blocked
    >
      <View
        className={`bg-white rounded-lg p-4 border-2 ${
          isBlocked ? 'border-[#EFEFEF]' : 'border-[#EFEFEF]'
        } flex-row items-center justify-between relative`}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
      >
        {/* Lock Icon Overlay for Blocked Crops */}
        {isBlocked && (
          <View 
            className="absolute top-1 left-1 z-10  rounded-full w-6 h-6 items-center justify-center"
          >
          
                  <Entypo name="lock" size={20} color="black" />

          </View>
        )}

        <Image
          source={
            typeof image === "string"
              ? { uri: image }
              : { uri: formatImage(image) }
          }
          style={{ 
            width: 70, 
            height: 70, 
            borderRadius: 8,
            opacity: isBlocked ? 0.5 : 1 // Reduce image opacity if blocked
          }}
          resizeMode="contain"
        />
        
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            marginLeft: 0,
            flex: 1,
            textAlign: "center",
            color: isBlocked ? "#999" : "#333", // Grey text for blocked crops
          }}
        >
          {varietyNameEnglish}
        </Text>

        <View style={{ alignItems: "center", justifyContent: "center", marginTop: 5 }}>
          <Progress.Circle
            size={50}
            progress={progress}
            thickness={4}
            color={isBlocked ? "#ccc" : "#4caf50"} // Grey progress for blocked crops
            unfilledColor="#ddd"
            showsText={true}
            formatText={() => `${Math.round(progress * 100)}%`}
            textStyle={{ 
              fontSize: 12,
              color: isBlocked ? "#999" : "#333" // Grey text for blocked crops
            }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

type FarmDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface UserData {
  farmCount: number;
  membership: string;
  paymentActiveStatus: string | null;
}

type RouteParams = {
  farmId: number;
  farmName:string
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
  isBlock:number;
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

interface CropCountResponse {
  cropCount: number;
}

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

const FarmDetailsScreen = () => {
  const navigation = useNavigation<FarmDetailsNavigationProp>();
  const dispatch = useDispatch();
  const farmBasicDetails = useSelector(selectFarmBasicDetails);
  const farmSecondDetails = useSelector(selectFarmSecondDetails);
  const [showMenu, setShowMenu] = useState(false);
  const route = useRoute();
  const { farmId, farmName } = route.params as RouteParams; 
  const [farmData, setFarmData] = useState<FarmItem | null>(null);
  const [staffData, setStaffData] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
   const [membership, setMembership] = useState('');

  // Calculate manager and other staff counts
  const managerCount = staffData.filter(staff => staff.role === 'Manager').length;
  const otherStaffCount = staffData.filter(staff => staff.role !== 'Manager').length;
   const [renewalData, setRenewalData] = useState<RenewalData | null>(null);

  console.log(";;;;;;;;;;;;;iddd", renewalData?.needsRenewal, farmId, farmData?.farmName);
  
  const images = [
    require('../../assets/images/Farm/1.webp'), 
    require('../../assets/images/Farm/2.webp'),
  ];

  

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
        // Alert.alert("Error", "Unexpected response format");
      }

    } catch (err) {
      console.error("Error fetching membership:", err);
      // Alert.alert("Error", "Failed to fetch membership data");
    } finally {
      setLoading(false);
    }
  };

const handleEditFarm = () => {
  navigation.navigate('EditFarm', { farmId: farmId });
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


   const fetchCropCount = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert("Error", "No authentication token found");
        return;
      }

      console.log("Fetching crop count for farmId:", farmId);

      const res = await axios.get<CropCountResponse>(
        `${environment.API_BASE_URL}api/farm/get-cropCount/${farmId}`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log("Crop count data:", res.data);
      setCropCount(res.data.cropCount); // Store the crop count in state

    } catch (err) {
      console.error("Error fetching crop count:", err);
      // Alert.alert("Error", "Failed to fetch crop count");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
  useCallback(() => {
    fetchCropCount();
    fetchCultivationsAndProgress()
  }, [farmId])
);


useFocusEffect(
  useCallback(() => {

    setCrops([]);
     fetchCropCount();
     fetchMembership()
      fetchRenewalStatus(); 
  
  }, [])
);

// useEffect(() => {
//   if (farmId) {
//     setLoading(true);
//      // Clear previous crops
//     fetchCultivationsAndProgress();
//     fetchMembership();
//     fetchCropCount();
//   }
// }, [farmId]);

  // const handleDeleteFarm = () => {
  //   dispatch(resetFarm());
  //   navigation.goBack();
  //   setShowMenu(false);
  // };

  useFocusEffect(
  useCallback(() => {
    const handleBackPress = () => {
      navigation.navigate("Main", { screen: "MyCultivation" });
      return true;
    };

    BackHandler.addEventListener("hardwareBackPress", handleBackPress);

    return () => {
      BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
    };
  }, [navigation])
);

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
  const [cropCount, setCropCount] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [membershipExpired, setMembershipExpired] = useState(false);

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

      console.log("crop---------------------",res.data)

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
          console.log("//////////",crop.cropCalendar)
          try {
            if (!crop.cropCalendar) {
              return { ...crop, progress: 0 };
            }

            const response = await axios.get(
              `${environment.API_BASE_URL}api/crop/slave-crop-calendar-progress/${crop.cropCalendar}/${farmId}`,
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

  const handleDeletePress = () => {
  setShowMenu(false);
  setShowDeleteModal(true);
};

const handleDeleteFarm = async () => {
  try {
    setShowDeleteModal(false);
    const token = await AsyncStorage.getItem("userToken");
    
    if (!token) {
      Alert.alert("Error", "No authentication token found");
      return;
    }

    await axios.delete(
      `${environment.API_BASE_URL}api/farm/delete-farm/${farmId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    dispatch(resetFarm());
    navigation.goBack();
  } catch (err) {
    console.error("Error deleting farm:", err);
    Alert.alert(t("Farms.Sorry"), t("Farms.Failed to delete farm"));
  }
};

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



  const onRefresh = () => {
    setRefreshing(true);
    fetchCultivationsAndProgress();
    fetchRenewalStatus();
  };

  //  const getMembershipDisplay = () => {
  //   if (membership.toLowerCase() === 'pro' ) {
  //     if (membership ) {
  //       return {
  //         text: 'PRO',
  //         bgColor: 'bg-[#FFF5BD]',
  //         textColor: 'text-[#E2BE00]',
  //         showRenew: false
  //       };
  //     } else {
  //       return {
  //         text: 'PRO',
  //         bgColor: 'bg-[#FFF5BD]',
  //         textColor: 'text-[#E2BE00]',
  //         showRenew: false
  //       };
  //     }
  //   } else {
  //     return {
  //       text: 'BASIC',
  //       bgColor: 'bg-[#CDEEFF]',
  //       textColor: 'text-[#223FFF]',
  //       showRenew: false
  //     };
  //   }
  // };

  const getMembershipDisplay = () => {
  // Default to basic if no membership data
  if (!membership) {
    return {
      text: 'BASIC',
      bgColor: 'bg-[#CDEEFF]',
      textColor: 'text-[#223FFF]',
      showRenew: false
    };
  }

  const isPro = membership.toLowerCase() === 'pro';
  const isExpired = renewalData?.needsRenewal;
  console.log("kkkkkkkkkkkkkkkkk",isExpired)

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
    React.useCallback(() => {
      if (crops.length === 0) {
        setLoading(true);
        fetchCultivationsAndProgress();
        getMembershipDisplay()
      }
    }, [])
  );
 

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
      backgroundColor="#ffffff"
    />

    {/* Header */}
    <View className="bg-white px-4 py-3 flex-row items-center justify-between">
      <TouchableOpacity
         onPress={() => navigation.navigate("Main", { 
    screen: "MyCultivation"
  
  })} 
        className="p-2 mt-[-50]"
        accessibilityLabel="Go back"
        accessibilityRole="button"
      >
        <Ionicons name="chevron-back" size={24} color="#374151" style={{ paddingHorizontal: wp(3), paddingVertical: hp(1.5), backgroundColor: "#F6F6F680" , borderRadius: 50 }}/>
      </TouchableOpacity>
      
        {showMenu && (
          <View 
          className="absolute right-0 border border-[#A49B9B] top-full mt-[-45] mr-8 bg-white rounded-lg shadow-lg p-2 z-10"
           style={{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }}
          >
            <TouchableOpacity
              onPress={handleEditFarm}
              className="px-4 py-2 flex-row items-center"
              accessibilityLabel="Edit farm"
              accessibilityRole="button"
              
            >
              {/* <Ionicons name="create-outline" size={16} color="#374151" /> */}
              <Text className="ml-2 text-sm text-gray-700">{t("Farms.Edit")}</Text>

            </TouchableOpacity>
           <View className="border-0.5 border-[#A49B9B]" />
           
            <TouchableOpacity
  onPress={handleDeletePress}
  className="px-4 py-2 flex-row items-center"
  accessibilityLabel="Delete farm"
  accessibilityRole="button"
>
  <Text className="ml-2 text-sm text-gray-700">{t("Farms.Delete")}</Text>
</TouchableOpacity>
          </View>
        )}

      <View className="items-center bg-white">
        <Image
          source={images[farmData?.imageId ?? farmBasicDetails?.selectedImage ?? 0]}
          className="w-20 h-20 rounded-full border-2 border-gray-200"
          resizeMode="cover"
          accessible
          accessibilityLabel={farmData?.farmName || farmBasicDetails?.farmName }
        />
      </View>

      <View className="relative bg-white">
        <TouchableOpacity
          onPress={() => setShowMenu(!showMenu)}
          className="p-2 mt-[-50]"
          accessibilityLabel="Open menu"
          accessibilityRole="button"
        >
          <Ionicons name="ellipsis-vertical" size={24} color="#374151" />
        </TouchableOpacity>

      </View>
    </View>

    {/* Farm Info Section */}
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
     <Text className="text-[#6B6B6B] font-medium text-[15px]">
   {t("District." + (farmData?.district ?? ""))}
</Text>
      <View className="flex-row items-center mt-1 space-x-6">
        <Text className="text-[#6B6B6B] text-sm">
          • {managerCount} {t("Farms.Managers")}
        </Text>
        <Text className="text-[#6B6B6B] text-sm ml-2">
          • {otherStaffCount} {t("Farms.Other Staff")}
        </Text>
      </View>
    </View>

    {/* Action Buttons */}
    <View className="flex-row justify-center mt-5 space-x-5">
      <TouchableOpacity
        className="bg-white p-4 rounded-xl justify-center items-center w-36 h-40 border border-[#445F4A33]"
        style={{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }}
        accessibilityLabel="View managers"
        accessibilityRole="button"
        onPress={() => {
          if (farmData?.id) {
            navigation.navigate('EditManagersScreen' as any, { farmId: farmData.id ,membership:membership, renew:renewalData?.needsRenewal});
          } else {
            console.error('Farm ID is undefined');
            Alert.alert('Error', 'Farm ID is not available');
          }
        }}
      >
        <View className="w-12 h-12 rounded-full items-center justify-center mb-2">
          <Image
            className="w-[75px] h-[75px]"
            source={require('../../assets/images/Farm/Managers.webp')}
          />
        </View>
        <Text className="text-black text-sm font-medium mt-4">{t("Farms.Staff")}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-white p-4 rounded-xl justify-center items-center w-36 h-40 border border-[#445F4A33]"
        style={{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }}
        accessibilityLabel="View farm assets"
        accessibilityRole="button"
        onPress={() => navigation.navigate('FarmCurrectAssets', { farmId: farmId, farmName: farmData?.farmName ?? farmName ?? '' })}
      >
        <View className="w-12 h-12 bg-purple-600 rounded-full items-center justify-center mb-2">
          <Image
            className="w-[75px] h-[75px]"
            source={require('../../assets/images/Farm/FarmAssets.webp')}
          />
        </View>
        <Text className="text-black text-sm font-medium mt-4">{t("Farms.Farm Assets")}</Text>
      </TouchableOpacity>
    </View>

    {/* Crops Section - Only this section scrolls */}
    <View className="mt-3 flex-1 mb-20">
      {loading ? (
        <SkeletonLoader />
      ) : crops.length === 0 ? (
        <View className="flex-1 justify-center items-center p-4">
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
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 14, paddingBottom: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={true}
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
    isBlock={crop.isBlock} // Add this line - pass the isBlock prop
    onPress={() =>
      navigation.navigate("FarmCropCalander", {
        cropId: crop.cropCalendar,
        startedAt: crop.staredAt,
        farmId: farmId,
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

    {/* Floating Add Button */}
    <View className="mb-[10%]">
    <TouchableOpacity 
  className="absolute bottom-12 right-6 bg-gray-800 w-16 h-16 rounded-full items-center justify-center shadow-lg"
  onPress={() => {
    // Basic membership: limit to 3 crops
    // Pro membership: no limit
    if (
      (membership.toLowerCase() === 'basic' && cropCount >= 3) ||
      (membership.toLowerCase() === 'pro' && renewalData?.needsRenewal === true && (farmData?.farmIndex ?? 0) > 1) ||
      ((farmData?.farmIndex === 1 && cropCount >= 3))
    ) {
      navigation.navigate('AddNewFarmUnloackPro' as any);
    } else {
      navigation.navigate('AddNewCrop', { farmId: farmId });
    }
  }}
  accessibilityLabel="Add new asset"
  accessibilityRole="button"
>
  <Ionicons name="add" size={28} color="white" />
</TouchableOpacity>
    
    </View>

    {/* Delete Confirmation Modal */}
<Modal
  visible={showDeleteModal}
  transparent={true}
  animationType="fade"
  onRequestClose={() => setShowDeleteModal(false)}
>
  <View className="flex-1 bg-[#667BA54D] justify-center items-center p-8">
    <View className="bg-white rounded-lg p-6 w-full max-w-sm">
      <View className='justify-center items-center'>
      <Image
            className="w-[150px] h-[200px]"
            source={require('../../assets/images/Farm/deleteImage.png')}
          />
          </View>
      <Text className="text-lg font-bold text-center mb-2">
        {t("Farms.Are you sure you want to delete this farm?")}
      </Text>
      <Text className="text-gray-600 text-center mb-6">
       {t("Farms.Deleting this farm will permanently remove all associated managers, crop calendars, and assets.")}

        {"\n\n"}
        {t("Farms.This action cannot be undone.")}
      </Text>
      
      <View className=" px-4 justify-center item-center space-x-4">
          <TouchableOpacity
          onPress={handleDeleteFarm}
          className="px-6 py-2 bg-[#000000] rounded-full"
        >
          <View className='justify-center items-center'> 
          <Text className="text-white ">{t("Farms.Yes, Delete")}</Text>
          </View>
        </TouchableOpacity>
       
        </View>
        <View className=' px-4 mt-4'>
       <TouchableOpacity
          onPress={() => setShowDeleteModal(false)}
          className="px-6 py-2 bg-[#0000001A] rounded-full"
        >
           <View className='justify-center items-center'> 
          <Text className="text-gray-700">{t("Farms.No, Go Back")}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

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