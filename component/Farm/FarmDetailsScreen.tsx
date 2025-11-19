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
  RefreshControl,
  Modal,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useSelector, useDispatch } from 'react-redux';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { selectFarmBasicDetails, selectFarmSecondDetails, resetFarm, setFarmSecondDetails } from '../../store/farmSlice';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import {  Ionicons ,Entypo, AntDesign } from '@expo/vector-icons';
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
import ImageData from '@/assets/jsons/farmImage.json';

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
  ongoingCropId: number;
  certificateStatus?: string;
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
      onPress={isBlocked ? undefined : onPress} 
      style={{
        width: "100%",
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        opacity: isBlocked ? 0.6 : 1, 
      }}
      disabled={isBlocked} 
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
            opacity: isBlocked ? 0.5 : 1 
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
            color: isBlocked ? "#999" : "#333", 
          }}
        >
          {varietyNameEnglish}
        </Text>

        <View style={{ alignItems: "center", justifyContent: "center", marginTop: 5 }}>
          <Progress.Circle
            size={50}
            progress={progress}
            thickness={4}
            color={isBlocked ? "#ccc" : "#4caf50"} 
            unfilledColor="#ddd"
            showsText={true}
            formatText={() => `${Math.round(progress * 100)}%`}
            textStyle={{ 
              fontSize: 12,
              color: isBlocked ? "#999" : "#333" 
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
  regCode:string
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


interface CertificateStatus {
  srtName: string;
  expireDate: string;
  questionnaireItems: QuestionnaireItem[];
  isValid: boolean;
  isAllCompleted: boolean;
  slaveQuestionnaireId: number;
  paymentId: number;
  certificateId: number;
}

interface QuestionnaireItem {
  id: number;
  slaveId: number;
  type: string;
  qNo: number;
  qEnglish: string;
  qSinhala: string;
  qTamil: string;
  tickResult: number;
  officerTickResult: string | null;
  uploadImage: string | null;
  officerUploadImage: string | null;
  doneDate: string | null;
}

// Add ImageViewerModal component or import it
const ImageViewerModal = ({ visible, images, initialIndex, onClose }: any) => {
  // Your image viewer modal implementation
  return (
    <Modal visible={visible} transparent={true}>
      <View className="flex-1 bg-black justify-center items-center">
        <TouchableOpacity onPress={onClose} className="absolute top-10 right-5 z-10">
          <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>
        <Image 
          source={{ uri: images[initialIndex]?.uri }} 
          className="w-full h-2/3" 
          resizeMode="contain"
        />
      </View>
    </Modal>
  );
};

const FarmDetailsScreen = () => {
  const navigation = useNavigation<FarmDetailsNavigationProp>();
  const dispatch = useDispatch();
  const farmBasicDetails = useSelector(selectFarmBasicDetails);
  const farmSecondDetails = useSelector(selectFarmSecondDetails);
  const [showMenu, setShowMenu] = useState(false);
  const route = useRoute();
    const { t } = useTranslation();
  const { farmId, farmName } = route.params as RouteParams; 
  const [farmData, setFarmData] = useState<FarmItem | null>(null);
  const [staffData, setStaffData] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [membership, setMembership] = useState('');
  const managerCount = staffData.filter(staff => staff.role === 'Manager').length;
  const otherStaffCount = staffData.filter(staff => staff.role !== 'Manager').length;
  const [renewalData, setRenewalData] = useState<RenewalData | null>(null);
  const [certificateStatus, setCertificateStatus] = useState<CertificateStatus | null>(null);
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [isCertificateExpanded, setIsCertificateExpanded] = useState(false);
  const [uploadingImageForItem, setUploadingImageForItem] = useState<number | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState<boolean>(false);
  const [selectedTaskImages, setSelectedTaskImages] = useState<any[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
 
   const [language, setLanguage] = useState("en");
     const [crops, setCrops] = useState<CropItem[]>([]);
     const [refreshing, setRefreshing] = useState<boolean>(false);
     const noCropsImage = require("@/assets/images/NoEnrolled.webp");
     const [cropCount, setCropCount] = useState(0);
     const [showDeleteModal, setShowDeleteModal] = useState(false);
     const [membershipExpired, setMembershipExpired] = useState(false);

  // ... existing functions ...

  const fetchCertificateStatus = async () => {
    try {
      setCertificateLoading(true);
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        return;
      }

      const response = await axios.get(
        `${environment.API_BASE_URL}api/certificate/get-farmcertificatetask/${farmId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Certificate status response:", response.data);

      if (response.data && response.data.length > 0) {
        const certificate = response.data[0];
        
        // Check if all questionnaire items are completed
        const isAllCompleted = certificate.questionnaireItems.every((item: QuestionnaireItem) => {
          if (item.type === 'Tick Off') {
            return item.tickResult === 1;
          } else if (item.type === 'Photo Proof') {
            return item.uploadImage !== null;
          }
          return true;
        });

        const certificateStatus: CertificateStatus = {
          srtName: certificate.srtName || "GAP Certification",
          expireDate: certificate.expireDate,
          questionnaireItems: certificate.questionnaireItems || [],
          isValid: moment(certificate.expireDate).isAfter(),
          isAllCompleted: isAllCompleted,
          slaveQuestionnaireId: certificate.slaveQuestionnaireId,
          paymentId: certificate.paymentId,
          certificateId: certificate.certificateId
        };

        setCertificateStatus(certificateStatus);
      } else {
        setCertificateStatus(null);
      }

    } catch (err) {
      console.error("Error fetching certificate status:", err);
      setCertificateStatus(null);
    } finally {
      setCertificateLoading(false);
    }
  };

  // Handle questionnaire item completion
  const handleQuestionnaireCheck = async (item: QuestionnaireItem) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      
      if (!token) {
        Alert.alert(t("Farms.Error"), t("Farms.No authentication token found"), [{ text: t("Farms.okButton") }]);
        return;
      }

      if (item.type === 'Tick Off') {
        let newTickResult: string | null;
        if (item.tickResult === null || item.tickResult === 0) {
          newTickResult = '1';
        } else if (item.tickResult === 1) {
          newTickResult = '0';
        } else {
          newTickResult = null;
        }

        await axios.put(
          `${environment.API_BASE_URL}api/certificate/update-questionnaire-item/${item.id}`,
          {
            tickResult: newTickResult,
            type: 'tickOff'
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Update local state
        if (certificateStatus) {
          const updatedItems = certificateStatus.questionnaireItems.map(prevItem =>
            prevItem.id === item.id
              ? { 
                  ...prevItem, 
                  tickResult: newTickResult === '1' ? 1 : 0, 
                  doneDate: newTickResult === '1' ? new Date().toISOString() : null 
                }
              : prevItem
          );
          
          const isAllCompleted = updatedItems.every((item: QuestionnaireItem) => {
            if (item.type === 'Tick Off') {
              return item.tickResult === 1;
            } else if (item.type === 'Photo Proof') {
              return item.uploadImage !== null;
            }
            return true;
          });

          setCertificateStatus({
            ...certificateStatus,
            questionnaireItems: updatedItems,
            isAllCompleted: isAllCompleted
          });
        }

      } else if (item.type === 'Photo Proof') {
        await handleImageUploadForQuestionnaire(item);
      }

    } catch (error) {
      console.error("Error updating questionnaire item:", error);
      Alert.alert(t("Main.error"), t("Main.somethingWentWrong"), [{ text: t("Farms.okButton") }]);
    }
  };

  // Handle image upload for Photo Proof items
  const handleImageUploadForQuestionnaire = async (item: QuestionnaireItem) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          t("Farms.Permission Required"),
          t("Farms.Please grant permission to access your photos"),
          [{ text: t("Farms.okButton") }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingImageForItem(item.id);
        
        const imageUri = result.assets[0].uri;
        const token = await AsyncStorage.getItem("userToken");

        if (!token) {
          Alert.alert(t("Farms.Error"), t("Farms.No authentication token found"), [{ text: t("Farms.okButton") }]);
          setUploadingImageForItem(null);
          return;
        }

        const formData = new FormData();
        formData.append('image', {
          uri: imageUri,
          type: 'image/jpeg',
          name: `questionnaire_${item.id}_${Date.now()}.jpg`,
        } as any);
        formData.append('itemId', item.id.toString());
        formData.append('slaveId', item.slaveId.toString());
        formData.append('farmId', farmId.toString());

        const response = await axios.post(
          `${environment.API_BASE_URL}api/certificate/questionnaire-item/upload-image/${item.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        if (response.data.success) {
          // Update local state
          if (certificateStatus) {
            const updatedItems = certificateStatus.questionnaireItems.map(prevItem =>
              prevItem.id === item.id
                ? { 
                    ...prevItem, 
                    uploadImage: response.data.imageUrl,
                    doneDate: new Date().toISOString()
                  }
                : prevItem
            );
            
            const isAllCompleted = updatedItems.every((item: QuestionnaireItem) => {
              if (item.type === 'Tick Off') {
                return item.tickResult === 1;
              } else if (item.type === 'Photo Proof') {
                return item.uploadImage !== null;
              }
              return true;
            });

            setCertificateStatus({
              ...certificateStatus,
              questionnaireItems: updatedItems,
              isAllCompleted: isAllCompleted
            });
          }

          Alert.alert(
            t("CropCalender.Success"),
            t("CropCalender.Image uploaded successfully"),
            [{ text: t("Farms.okButton") }]
          );
        }

        setUploadingImageForItem(null);
      }

    } catch (error: any) {
      console.error("Error uploading questionnaire image:", error);
      setUploadingImageForItem(null);
      
      let errorMessage = t("Main.somethingWentWrong");
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert(t("Main.error"), errorMessage, [{ text: t("Farms.okButton") }]);
    }
  };

  // View uploaded image
  const handleViewUploadedImage = (item: QuestionnaireItem) => {
    if (item.uploadImage) {
      setSelectedTaskImages([{
        uri: item.uploadImage,
        title: `Q${item.qNo} - ${item.type}`,
        description: item.qEnglish
      }]);
      setSelectedImageIndex(0);
      setImageModalVisible(true);
    }
  };

  // Calculate remaining months helper
  const calculateRemainingMonths = (expireDate: string): number => {
    try {
      const today = moment();
      const expiry = moment(expireDate);
      
      if (expiry.isBefore(today)) {
        return 0;
      }
      
      const remainingMonths = expiry.diff(today, 'months');
      return Math.max(0, remainingMonths);
    } catch (error) {
      console.error("Error calculating remaining months:", error);
      return 0;
    }
  };

   const fetchCropCount = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert(t("Farms.Error"), t("Farms.No authentication token found"),[{ text:  t("PublicForum.OK") }]);
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
      setCropCount(res.data.cropCount); 

    } catch (err) {
      console.error("Error fetching crop count:", err);
      // Alert.alert("Error", "Failed to fetch crop count");
    } finally {
      setLoading(false);
    }
  };


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
     //     console.log("//////////",crop.cropCalendar)
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


  useFocusEffect(
  useCallback(() => {
    fetchCropCount();
    fetchCultivationsAndProgress()
  }, [farmId])
);


// useFocusEffect(
//   useCallback(() => {

//     setCrops([]);
//      fetchCropCount();
//      fetchMembership()
//       fetchRenewalStatus(); 
  
//   }, [])
// );

const getImageSource = useCallback((imageId?: number) => {
  console.log('Getting image for imageId:', imageId); // Debug log
  
  if (!imageId || !ImageData || !Array.isArray(ImageData)) {
    return require('@/assets/images/Farm/1.webp');
  }
  
  try {
    const imageItem = ImageData.find(img => img && img.id === imageId);
    
    if (!imageItem || !imageItem.source) {
      return require('@/assets/images/Farm/1.webp');
    }
    
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



const fetchFarmCertificate = async (farmId: number) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    
    if (!token) {
      Alert.alert(
        t("Farms.Error"), 
        t("Farms.No authentication token found"),
        [{ text: t("PublicForum.OK") }]
      );
      return null;
    }

    const response = await axios.get(
      `${environment.API_BASE_URL}api/certificate/get-farm-certificate/${farmId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    console.log("Farm certificate response:", response.data);
    return response.data;

  } catch (err) {
    console.error("Error fetching farm certificate:", err);
    return null;
  }
};

// Update the existing fetchCropCertificate function to return null on error
const fetchCropCertificate = async (ongoingCropId: number) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    
    if (!token) {
      Alert.alert(
        t("Farms.Error"), 
        t("Farms.No authentication token found"),
        [{ text: t("PublicForum.OK") }]
      );
      return null;
    }

    const response = await axios.get(
      `${environment.API_BASE_URL}api/certificate/get-crophave-certificate/${ongoingCropId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    console.log("ongoingCropId:", ongoingCropId);
    console.log("Certificate response:", response.data);

    return response.data;

  } catch (err) {
    console.error("Error fetching crop certificate:", err);
    return null;
  }
};

 const fetchFarms = async () => {
  try {
    setLoading(true);
    const token = await AsyncStorage.getItem("userToken");

    if (!token) {
      Alert.alert(t("Farms.Error"), t("Farms.No authentication token found"),[{ text:  t("PublicForum.OK") }]);
      return;
    }

    // Add cache-busting parameter or headers to ensure fresh data
    const res = await axios.get<FarmDetailsResponse>(
      `${environment.API_BASE_URL}api/farm/get-farms/byFarm-Id/${farmId}`, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache', // Prevent caching
        },
      }
    );
    
    console.log("Fresh farm data received:", res.data);
    
    setFarmData(res.data.farm);
    setStaffData(res.data.staff);

  } catch (err) {
    console.error("Error fetching farms:", err);
  //  Alert.alert("Error", "Failed to fetch farms data");
  } finally {
    setLoading(false);
  }
};

   useEffect(() => {
    fetchFarms();
  }, [farmId]);


   const fetchMembership = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
       Alert.alert(t("Farms.Error"), t("Farms.No authentication token found"),[{ text:  t("PublicForum.OK") }]);
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

    //  console.log("Membership response:", res.data); 

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
    //  console.error("Error fetching renewal status:", err);
      
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


  useFocusEffect(
    useCallback(() => {
      fetchFarms();
      fetchCropCount();
      fetchCultivationsAndProgress();
      fetchMembership();
      fetchRenewalStatus();
      fetchCertificateStatus();
    }, [farmId])
  );

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
  const isExpired = renewalData?.needsRenewal;
  console.log("Is Expired",isExpired)

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
      <View className="flex-1 bg-gray-50 justify-center items-center">
                             <LottieView
                                source={require('../../assets/jsons/loader.json')}
                                autoPlay
                                loop
                                style={{ width: 300, height: 300 }}
                              />
      </View>
    );
  }

  // const handleDeleteFarm = async () => {
//   try {
//     setShowDeleteModal(false);
//     const token = await AsyncStorage.getItem("userToken");
    
//     if (!token) {
//       Alert.alert(t("Farms.Error"), t("Farms.No authentication token found"),[{ text:  t("PublicForum.OK") }]);
//       return;
//     }

//     await axios.delete(
//       `${environment.API_BASE_URL}api/farm/delete-farm/${farmId}`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     dispatch(resetFarm());
//     navigation.goBack();
//   } catch (err) {
//     console.error("Error deleting farm:", err);
//     Alert.alert(t("Farms.Sorry"), t("Farms.Failed to delete farm"),[{ text: t("Farms.okButton") }]);
//   }
// };

const handleDeleteFarm = async () => {
  try {
    setShowDeleteModal(false);
    setLoading(true);
    const token = await AsyncStorage.getItem("userToken");
    
    if (!token) {
      Alert.alert(t("Farms.Error"), t("Farms.No authentication token found"),[{ text:  t("PublicForum.OK") }]);
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
    setLoading(false);
    navigation.navigate("Main", { screen: "Dashboard" });
    // Show success alert before navigating back
    Alert.alert(
      t("Farms.Success"),
      t("Farms.Farm deleted successfully"),
      [{ 
        text: t("PublicForum.OK"),
        // onPress: () => navigation.navigate("Main", { screen: "Dashboard" })
      }]
    );
  } catch (err) {
    console.error("Error deleting farm:", err);
    Alert.alert(t("Farms.Sorry"), t("Farms.Failed to delete farm"),[{ text: t("Farms.okButton") }]);
    setLoading(false);
  } finally {
    setLoading(false);
  }
};


return (
  <View className="flex-1 bg-white">
    <StatusBar
      barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
      backgroundColor="#ffffff"
    />

    {/* Fixed Header */}
    <View className="bg-white px-4 py-3 flex-row items-center justify-between">
      <TouchableOpacity
        onPress={() => navigation.navigate("Main", { screen: "MyCultivation" })} 
        className="p-2 mt-[-50]"
        accessibilityLabel="Go back"
        accessibilityRole="button"
      >
        <Ionicons 
          name="chevron-back" 
          size={24} 
          color="#374151" 
          style={{ 
            paddingHorizontal: wp(3), 
            paddingVertical: hp(1.5), 
            backgroundColor: "#F6F6F680", 
            borderRadius: 50 
          }}
        />
      </TouchableOpacity>
      
      {/* Menu Dropdown */}
      {showMenu && (
        <View 
          className="absolute right-0 border border-[#A49B9B] top-full mt-[-45] mr-8 bg-white rounded-lg shadow-lg p-2 z-10"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2},
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <TouchableOpacity
            onPress={handleEditFarm}
            className="px-4 items-center justify-center"
            accessibilityLabel="Edit farm"
            accessibilityRole="button"
          >
            <Text className="text-sm text-gray-700 text-center">{t("Farms.Edit")}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Farm Image */}
      <View className="items-center bg-white">
        <Image
          source={getImageSource(farmData?.imageId)}
          className="w-20 h-20 rounded-full border-2 border-gray-200"
          resizeMode="cover"
          accessible
          accessibilityLabel={farmData?.farmName || farmBasicDetails?.farmName}
        />
      </View>

      {/* Menu Button */}
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

    {/* Scrollable Content */}
    <ScrollView 
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={true}
    >
      {/* Farm Info Section */}
      <View className="items-center px-4 py-4">
        <View className="flex-row items-center">
          <Text className="font-bold text-xl text-gray-900 mr-3">
            {farmData?.farmName || farmBasicDetails?.farmName}
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
         <View className="border border-[#434343] px-3 py-1 rounded-lg mt-2">
            <Text className="text-gray-700 text-xl font-medium">
              ID : {farmData?.regCode}
            </Text>
          </View>
        <Text className="text-[#6B6B6B] font-medium text-[15px] mt-1">
          {t("District." + (farmData?.district ?? ""))}
        </Text>
        <View className="flex-row items-center mt-1 space-x-6">
          <Text className="text-[#6B6B6B] text-sm">
            • {farmData?.appUserCount || 0} {t("Farms.Staff")}
          </Text>
          <Text className="text-[#6B6B6B] text-sm ml-2">
            • {farmData?.staffCount || 0} {t("Farms.Other Staff")}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row justify-center mt-5 space-x-5 px-4">
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
              navigation.navigate("Main", {
                screen: "EditManagersScreen",
                params: {
                  farmId: farmData.id,
                  membership: membership,
                  renew: renewalData?.needsRenewal
                }
              });
            } else {
              console.error('Farm ID is undefined');
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
          onPress={() => navigation.navigate('FarmCurrectAssets', { 
            farmId: farmId, 
            farmName: farmData?.farmName ?? farmName ?? '' 
          })}
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

      {/* Certificate Status Section */}
{/* Certificate Status Section - Only show when farm has certificate */}
{certificateStatus && (
  <View className="mt-6 px-4">
    <TouchableOpacity
      onPress={() => setIsCertificateExpanded(!isCertificateExpanded)}
      className="bg-white rounded-2xl shadow-sm border border-gray-200"
    >
      <View className="p-4 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <Ionicons name="document-text-outline" size={20} color="#374151" />
          <Text className="ml-3 text-gray-900 font-semibold text-base">
            {certificateStatus.srtName || t("Farms.GAP Certification")}
          </Text>
        </View>
        <View className="flex-row items-center">
          <View className={`px-3 py-1 rounded-full mr-3 ${
            certificateStatus.isAllCompleted ? 'bg-green-100' : 'bg-yellow-100'
          }`}>
            <Text className={`text-xs font-medium ${
              certificateStatus.isAllCompleted ? 'text-green-800' : 'text-yellow-800'
            }`}>
              {certificateStatus.isAllCompleted 
                ? t("Farms.All Completed") 
                : t("Farms.Pending")
              }
            </Text>
          </View>
          <Ionicons 
            name={isCertificateExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#9CA3AF" 
          />
        </View>
      </View>
      
      <View className="px-4 pb-4">
        <Text className="text-gray-600 text-sm">
          {t("Farms.Valid for next")} {calculateRemainingMonths(certificateStatus.expireDate)} {t("Farms.months")}
        </Text>
      </View>
    </TouchableOpacity>

    {/* Interactive Questionnaire Items - Only show when expanded */}
    {isCertificateExpanded && (
      <View className="mt-3">
        {certificateLoading ? (
          <View className="bg-white rounded-2xl p-6 border border-gray-200 items-center">
            <ActivityIndicator size="small" color="#000" />
            <Text className="text-gray-500 text-sm mt-2">
              {t("Farms.Loading certificate tasks...")}
            </Text>
          </View>
        ) : certificateStatus.questionnaireItems.length > 0 ? (
          certificateStatus.questionnaireItems.map((item, index) => {
            const isCompleted = 
              (item.type === 'Tick Off' && item.tickResult === 1) ||
              (item.type === 'Photo Proof' && item.uploadImage !== null);
            
            const isTickOff = item.type === 'Tick Off';
            const isPhotoProof = item.type === 'Photo Proof';

            return (
              <View
                key={item.id}
                className={`bg-white rounded-2xl p-4 mb-3 border ${
                  isCompleted ? 'border-green-200' : 'border-gray-200'
                }`}
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1 mr-3">
                    <Text className="text-gray-900 font-medium text-sm mb-1">
                      Q{item.qNo}: {language === "si" 
                        ? item.qSinhala 
                        : language === "ta" 
                        ? item.qTamil 
                        : item.qEnglish}
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      {item.type} • {isCompleted ? t("Farms.Completed") : t("Farms.Pending")}
                    </Text>
                  </View>
                  
                  {/* Check/Upload Button */}
                  {!isCompleted ? (
                    <TouchableOpacity
                      onPress={() => handleQuestionnaireCheck(item)}
                      disabled={uploadingImageForItem === item.id}
                      className={`w-10 h-10 rounded-full items-center justify-center ${
                        isTickOff ? 'bg-gray-900' : 'bg-blue-600'
                      }`}
                    >
                      {uploadingImageForItem === item.id ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : isTickOff ? (
                        <AntDesign name="check" size={16} color="white" />
                      ) : (
                        <Ionicons name="camera" size={16} color="white" />
                      )}
                    </TouchableOpacity>
                  ) : (
                    <View className="flex-row items-center">
                      {isPhotoProof && item.uploadImage && (
                        <TouchableOpacity
                          onPress={() => handleViewUploadedImage(item)}
                          className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-2"
                        >
                          <Ionicons name="eye" size={16} color="#10B981" />
                        </TouchableOpacity>
                      )}
                      <View className="w-10 h-10 rounded-full bg-green-500 items-center justify-center">
                        <AntDesign name="check" size={16} color="white" />
                      </View>
                    </View>
                  )}
                </View>

                {/* Action hint for incomplete tasks */}
                {!isCompleted && (
                  <Text className="text-gray-500 text-xs mt-2">
                    {isTickOff 
                      ? t("Farms.Tap to mark as complete")
                      : t("Farms.Tap to upload photo")
                    }
                  </Text>
                )}

                {/* Uploaded image preview for completed Photo Proof tasks */}
                {isCompleted && isPhotoProof && item.uploadImage && (
                  <TouchableOpacity
                    onPress={() => handleViewUploadedImage(item)}
                    className="mt-3 bg-gray-100 rounded-lg p-3 flex-row items-center"
                  >
                    <Ionicons name="image" size={20} color="#6B7280" />
                    <Text className="text-gray-600 text-xs ml-2 flex-1">
                      {t("Farms.Image uploaded - Tap to view")}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color="#6B7280" />
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        ) : (
          <View className="bg-white rounded-2xl p-6 border border-gray-200">
            <View className="items-center">
              <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
              <Text className="text-gray-500 text-center mt-3">
                {t("Farms.No certification tasks available")}
              </Text>
            </View>
          </View>
        )}
      </View>
    )}
  </View>
)}
      {/* Crops Section */}
      <View className="mt-6 px-4">
        {loading ? (
          <SkeletonLoader />
        ) : crops.length === 0 ? (
          <View className="justify-center items-center p-4 min-h-[300px] -mt-8">
            <LottieView
              source={require("../../assets/jsons/NoComplaints.json")}
              style={{ width: wp(50), height: hp(30) }}
              autoPlay
              loop
            />
            <Text className="text-center text-gray-600 -mt-8">
              {t("MyCrop.No Ongoing Cultivations yet")}
            </Text>
          </View>
        ) : (
          <View>
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
                isBlock={crop.isBlock}
             onPress={async () => {
  try {
    // Fetch both certificates in parallel
    const [cropCertificateData, farmCertificateData] = await Promise.all([
      fetchCropCertificate(crop.ongoingCropId),
      fetchFarmCertificate(farmId)
    ]);
    
    console.log("Crop certificate data:", cropCertificateData);
    console.log("Farm certificate data:", farmCertificateData);
    
    // Check if either certificate exists
    const hasCropCertificate = cropCertificateData?.status === "haveCropCertificate";
    const hasFarmCertificate = farmCertificateData?.status === "haveFarmCertificate";
    
    // Prepare base navigation params
    const baseParams = {
      cropId: crop.cropCalendar,
      startedAt: crop.staredAt,
      farmId: farmId,
      cropName:
        language === "si"
          ? crop.varietyNameSinhala
          : language === "ta"
          ? crop.varietyNameTamil
          : crop.varietyNameEnglish,
      ongoingCropId: crop.ongoingCropId,
    };
    
    // Navigate based on certificate availability
    if (hasFarmCertificate && farmCertificateData?.data) {
      // Farm has certificate - navigate to FarmHaveCertificateCropCalender
      const certData = farmCertificateData.data;
      
      // Calculate remaining months
      const validMonths = calculateRemainingMonths(certData.expireDate);
      
      // Determine certificate status
      const isAllCompleted = certData.questionnaireItems?.every((item: QuestionnaireItem) => {
        if (item.type === 'Tick Off') return item.tickResult === 1;
        if (item.type === 'Photo Proof') return item.uploadImage !== null;
        return true;
      }) || false;
      
      const certificateStatus = isAllCompleted ? "All Completed" : "Pending";
      const certificateName = certData.srtName || "Farm GAP Certification";
      
      // Navigate to FarmHaveCertificateCropCalender with farm certificate data
      navigation.navigate("FarmHaveCertificateCropCalender", {
        ...baseParams,
        hasCertificate: true,
        hasFarmCertificate: true,
        certificateName: certificateName,
        certificateStatus: certificateStatus,
        validMonths: validMonths,
        farmCertificateData: certData,
        farmName: farmData?.farmName || farmName || '',
      } as any);
      
    } else if (hasCropCertificate && cropCertificateData?.data) {
      // Crop has certificate - navigate to FramcropCalenderwithcertificate
      const certData = cropCertificateData.data;
      
      // Calculate remaining months
      const validMonths = calculateRemainingMonths(certData.expireDate);
      
      // Determine certificate status
      const isAllCompleted = certData.questionnaireItems?.every((item: QuestionnaireItem) => {
        if (item.type === 'Tick Off') return item.tickResult === 1;
        if (item.type === 'Photo Proof') return item.uploadImage !== null;
        return true;
      }) || false;
      
      const certificateStatus = isAllCompleted ? "All Completed" : "Pending";
      const certificateName = certData.srtName || "Crop GAP Certification";
      
      // Navigate to FramcropCalenderwithcertificate with crop certificate data
      navigation.navigate("FramcropCalenderwithcertificate", {
        ...baseParams,
        hasCertificate: true,
        hasCropCertificate: true,
        certificateName: certificateName,
        certificateStatus: certificateStatus,
        validMonths: validMonths,
        cropCertificateData: certData,
      } as any);
      
    } else {
      // No certificates exist - navigate to regular crop calendar
      navigation.navigate("FarmCropCalander", {
        ...baseParams,
        hasCertificate: false,
        certificateData: null,
      } as any);
    }
  } catch (error) {
    console.error("Error checking certificates:", error);
    // Fallback to regular crop calendar on error
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
      hasCertificate: false,
      certificateData: null,
      ongoingCropId: crop.ongoingCropId,
    } as any);
  }
}}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>

    {/* Add Button */}
    <View className="mb-[8%]">
      <TouchableOpacity 
        className="absolute bottom-12 right-6 bg-gray-800 w-16 h-16 rounded-full items-center justify-center shadow-lg"
        onPress={() => {
          // Check if user has reached the crop limit for basic membership
          if (membership.toLowerCase() === 'basic' && cropCount >= 3) {
            Alert.alert(
              t("Farms.Sorry"),
              t("Farms.You only have 3 free crop enrollments for now"),
              [{ text: t("Farms.okButton") }]
            );
            return;
          }
          
          if (
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
        <Image 
          className="w-[20px] h-[20px]"
          source={require('../../assets/images/Farm/plusfarm.png')}
        />
      </TouchableOpacity>
    </View>

    {/* Image Viewer Modal */}
    <Modal
      visible={imageModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setImageModalVisible(false)}
    >
      <View className="flex-1 bg-black justify-center items-center">
        <TouchableOpacity 
          onPress={() => setImageModalVisible(false)}
          className="absolute top-10 right-5 z-10 bg-black/50 rounded-full p-2"
        >
          <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>
        
        {selectedTaskImages.length > 0 && (
          <Image 
            source={{ uri: selectedTaskImages[selectedImageIndex]?.uri }} 
            className="w-full h-2/3" 
            resizeMode="contain"
          />
        )}
        
        <View className="absolute bottom-10 left-0 right-0 flex-row justify-center">
          <Text className="text-white text-center bg-black/50 px-4 py-2 rounded-lg">
            {selectedTaskImages[selectedImageIndex]?.title || 'Uploaded Image'}
          </Text>
        </View>
      </View>
    </Modal>

    {/* Delete Modal */}
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
          
          <View className="px-4 ">
            <TouchableOpacity
              onPress={handleDeleteFarm}
              className="px-6 py-2 bg-[#000000] rounded-full"
            >
              <View className='justify-center items-center'> 
                <Text className="text-white">{t("Farms.Yes, Delete")}</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          <View className='px-4 mt-4'>
            <TouchableOpacity
              onPress={() => setShowDeleteModal(false)}
              className="px-6 py-2 bg-[#D9D9D9] rounded-full"
            >
              <View className='justify-center items-center'> 
                <Text className="text-gray-700">{t("Farms.No, Go Back")}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>

    {/* Menu Overlay */}
    {showMenu && (
      <TouchableOpacity
        className="absolute inset-0 bg-black/20"
        onPress={() => setShowMenu(false)}
        activeOpacity={1}
        accessibilityLabel="Close menu"
        accessibilityRole="button"
      />
    )}
  </View>
);
};

export default FarmDetailsScreen;