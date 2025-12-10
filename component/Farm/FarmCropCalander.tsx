import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Linking,
  
  RefreshControl,
  BackHandler,
  Image,
  Modal
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { StatusBar, Platform } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from "axios";
import AntDesign from "react-native-vector-icons/AntDesign";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { RouteProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import { environment } from "@/environment/environment";
import i18n from "@/i18n/i18n";
import { useTranslation } from "react-i18next";
import CultivatedLandModal from "../CultivatedLandModal";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import * as Location from "expo-location";
import { useFocusEffect } from "@react-navigation/native";
import ContentLoader, { Rect, Circle } from "react-content-loader/native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import * as ScreenCapture from "expo-screen-capture";
import { set } from "lodash";
import { useSelector, useDispatch } from 'react-redux';
import { selectFarmBasicDetails, selectFarmSecondDetails, resetFarm, setFarmSecondDetails } from '../../store/farmSlice';
import type { RootState } from '../../services/reducxStore';
import ImageViewerModal from '../ImageViewerModal';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

interface CropItem {
  id: string;
  task: string;
  taskIndex: number;
  days: number;
  CropDuration: string;
  taskDescriptionEnglish: string;
  taskCategoryEnglish: string;
  taskDescriptionSinhala: string;
  taskDescriptionTamil: string;
  taskEnglish:string;
  taskSinhala:string;
  taskTamil:string;
  status: string;
  startingDate: string;
  createdAt: string;
  onCulscropID: number;
  imageLink: string;
  videoLinkEnglish: string;
  videoLinkSinhala: string;
  videoLinkTamil: string;
  reqImages: number;
  autoCompleted: number
  // reqGeo: number;
  uploadedBy?: string;  // Add this field
  images?: ImageData[];
}

interface ImageData {
  uri: string;
  url?: string;
  title?: string;
  description?: string;
  uploadedBy?: string;
}


interface CropData {
  id: string;
  taskIndex: number;
  startingDate: string;
  taskDescriptionEnglish: string;
  taskDescriptionSinhala: string;
  taskDescriptionTamil: string;
  taskEnglish:string;
  taskSinhala:string;
  taskTamil:string;
  imageLink?: string;
  images?: ImageData[];
  videoLinkEnglish?: string;
  videoLinkSinhala?: string;
  videoLinkTamil?: string;
  uploadedBy?: string;
  status?: string;
}

type FarmCropCalanderProp = RouteProp<RootStackParamList, "FarmCropCalander">;

type FarmCropCalanderNavigationProp = StackNavigationProp<
  RootStackParamList,
  "FarmCropCalander"
>;

type FarmCropCalanderScreenProp = StackNavigationProp<
  RootStackParamList,
  "FarmCropCalander"
>;

type FarmCropCalanderRouteProp = RouteProp<RootStackParamList, "FarmCropCalander">;

interface FarmCropCalanderProps {
  navigation: FarmCropCalanderNavigationProp;
  route: FarmCropCalanderProp;
}
interface UserData {
  farmCount: number;
  membership: string;
  paymentActiveStatus: string | null;
  role:string
}

const FarmCropCalander: React.FC<FarmCropCalanderProps> = ({ navigation, route }) => {

  const [crops, setCrops] = useState<CropItem[]>([]);
  const [checked, setChecked] = useState<boolean[]>([]);
  const [timestamps, setTimestamps] = useState<string[]>([]);
  const [language, setLanguage] = useState("en");
  //const { cropId, cropName , farmId,ongoingCropId} = route.params;
  const { cropId, cropName, farmId, ongoingCropId, hasCertificate } = route.params;
console.log("0000000000000000000000000000000000",hasCertificate)
  const { t } = useTranslation();
  const [updateerror, setUpdateError] = useState<string>("");
  const [lastCompletedIndex, setLastCompletedIndex] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [isCultivatedLandModalVisible, setCultivatedLandModalVisible] =
    useState(false);
  const [isImageUpload, setImageUpload] = useState(false);
  const [isCompleted, setCompleted] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refloading, setRefLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [startIndex, setStartIndex] = useState(0);
  const [showediticon, setShowEditIcon] = useState(false);
  const [lastCompletedInd, setLastCompletedInd] = useState<number | null>();
  const tasksPerPage = 5;
  const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user.userData) as UserData | null;
    const [imageModalVisible, setImageModalVisible] = useState<boolean>(false);
  const [selectedTaskImages, setSelectedTaskImages] = useState<ImageData[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [tasksWithImages, setTasksWithImages] = useState<Set<string>>(new Set());
   const [certificationModalVisible, setCertificationModalVisible] = useState(false);


   useEffect(() => {
  loadLanguage();
  fetchCrops();
}, []);

// ISSUE 2: The useFocusEffect is called twice with same logic
// Remove duplicate and keep only one

useFocusEffect(
  React.useCallback(() => {
    const checkCertificateAndSetup = async () => {
      const certificateStatus = await fetchFarmCertificate(farmId);
      const shouldShowModal = certificateStatus?.status !== "haveFarmCertificate";
      setCertificationModalVisible(shouldShowModal);
      
      await ScreenCapture.preventScreenCaptureAsync();
      await fetchCropswithoutload();
    };

    checkCertificateAndSetup();

    return () => {
      ScreenCapture.allowScreenCaptureAsync();
      setCultivatedLandModalVisible(false);
    };
  }, [farmId])
);

// ISSUE 3: Error handling might be hiding the real error
// Update fetchCrops with better error logging

const fetchCrops = async () => {
  setLoading(true);
  setCrops([]);
  setChecked([]);
  setTimestamps([]);
  
  try {
    setLanguage(t("CropCalender.LNG"));
    const token = await AsyncStorage.getItem("userToken");

    if (!token) {
      console.error("No token found");
      Alert.alert(t("Main.error"), "Authentication required");
      setLoading(false);
      return;
    }

    console.log("Fetching crops with:", {
      cropId,
      farmId,
      url: `${environment.API_BASE_URL}api/crop/slave-crop-calendar/${cropId}/${farmId}`
    });

    const response = await axios.get(
      `${environment.API_BASE_URL}api/crop/slave-crop-calendar/${cropId}/${farmId}`,
      {
        params: { limit: 10 },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

   // console.log("API Response:", response.data);

    if (!response.data || response.data.length === 0) {
      console.log("No crops returned from API");
      setLoading(false);
      return;
    }

    const formattedCrops = response.data.map((crop: CropItem) => ({
      ...crop,
      startingDate: moment(crop.startingDate).format("YYYY-MM-DD"),
      createdAt: moment(crop.createdAt).format("YYYY-MM-DD"),
    }));

    console.log("Formatted crops:", formattedCrops.length);

    if (formattedCrops[0]?.status === "completed") {
      setShowEditIcon(false);
    } else {
      setShowEditIcon(true);
    }

    setCrops(formattedCrops);
    const newCheckedStates = formattedCrops.map(
      (crop: CropItem) => crop.status === "completed"
    );
    setChecked(newCheckedStates);
    setHasMore(formattedCrops.length === 10);

    const lastCompletedTaskIn = formattedCrops
      .filter((crop: { status: string; }) => crop.status === "completed")
      .sort((a: { createdAt: string | number | Date; }, b: { createdAt: string | number | Date; }) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    const lastCompletedTaskInd = lastCompletedTaskIn?.taskIndex;
    setLastCompletedInd(lastCompletedTaskInd);

    const lastCompletedTaskIndex = newCheckedStates.lastIndexOf(true);
    setLastCompletedIndex(lastCompletedTaskIndex);

    setTimestamps(new Array(response.data.length).fill(""));

  } catch (error: any) {
    console.error("Fetch crops error:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    
    let errorMessage = t("Main.somethingWentWrong");
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    Alert.alert(t("Main.error"), errorMessage, [{ text: t("Farms.okButton") }]);
  } finally {
    setTimeout(() => {
      setLoading(false);
    }, 300);
  }
};

// ISSUE 4: Check route params are being passed correctly
// Add this to verify params

useEffect(() => {
  console.log("Route params:", {
    cropId,
    cropName,
    farmId,
    ongoingCropId,
    hasCertificate
  });

  if (!cropId || !farmId) {
    console.error("Missing required route parameters!");
    Alert.alert(
      t("Main.error"),
      "Missing crop or farm information",
      [{ 
        text: t("Farms.okButton"),
        onPress: () => navigation.goBack()
      }]
    );
  }
}, [cropId, farmId]);

// ISSUE 5: Certificate modal might be blocking content
// Update the modal to not cover the entire screen if rejected

const handleReject = () => {
  setCertificationModalVisible(false);
  // Ensure crops are loaded after modal closes
  if (crops.length === 0) {
    fetchCrops();
  }
};

    //console.log("user- cropcalander- redux user data ",user)

   // console.log("user- cropcalander- user Role ",user?.role)
   const handleBuyNow = () => {
    setCertificationModalVisible(false);
    navigation.navigate("CropEarnCertificateAfterEnroll", { 
      // Add any required params here
      cropId: ongoingCropId,
     farmId:farmId
    });
  };

  // const handleReject = () => {
  //   setCertificationModalVisible(false);
  // };
  

// const fetchFarmCertificate = async (farmId: number) => {
//   try {
//     const token = await AsyncStorage.getItem("userToken");
    
//     if (!token) {
//       console.log("No authentication token found");
//       return { status: "noFarmCertificate", data: null };
//     }

//     const response = await axios.get(
//       `${environment.API_BASE_URL}api/certificate/get-farm-certificate/${farmId}`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
    
//     console.log("Farm certificate API response:", response.data);
    
//     // Based on your endpoint structure
//     if (response.data && response.data.status === "haveFarmCertificate") {
//       return { status: "haveFarmCertificate", data: response.data.data };
//     } else {
//       return { status: "noFarmCertificate", data: null };
//     }

//   } catch (err) {
//     console.error("Error fetching farm certificate:", err);
//     // If there's an error, assume no certificate to be safe
//     return { status: "noFarmCertificate", data: null };
//   }
// };
const fetchFarmCertificate = async (farmId: number) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    
    if (!token) {
      console.log("No authentication token found");
      return { status: "noFarmCertificate", data: null };
    }

    // Use the SAME endpoint as FarmDetailsScreen
    const response = await axios.get(
      `${environment.API_BASE_URL}api/certificate/get-farmcertificatetask/${farmId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    console.log("Farm certificates API response:", response.data);
    
    // Process the same way as FarmDetailsScreen
    if (response.data && response.data.length > 0) {
      // Check if ALL certificates are complete
      const allCertificatesComplete = response.data.every((certificate: any) => {
        const isCertificateComplete = certificate.questionnaireItems?.every((item: any) => {
          if (item.type === 'Tick Off') {
            return item.tickResult === 1;
          } else if (item.type === 'Photo Proof') {
            return item.uploadImage !== null && item.uploadImage !== '';
          }
          return true;
        }) || false;
        return isCertificateComplete;
      });
      
      return { 
        status: allCertificatesComplete ? "haveFarmCertificate" : "certificateIncomplete", 
        data: response.data 
      };
    } else {
      return { status: "noFarmCertificate", data: null };
    }

  } catch (err: any) {
    console.error("Error fetching farm certificates:", err);
    
    // Check if it's a 404 (no certificates)
    if (err.response?.status === 404 || 
        err.response?.data?.message?.includes('not found')) {
      return { status: "noFarmCertificate", data: null };
    }
    
    // For other errors, return incomplete to be safe
    return { status: "certificateIncomplete", data: null };
  }
};
  //console.log("====farmId======",farmId)

useFocusEffect(
  React.useCallback(() => {
    const setupScreen = async () => {
      // 1. Load crops FIRST
      await fetchCrops();
      
      // 2. Then check certificate
      const certificateStatus = await fetchFarmCertificate(farmId);
      const shouldShowModal = certificateStatus?.status !== "haveFarmCertificate";
      setCertificationModalVisible(shouldShowModal);
      
      // 3. Screen capture protection
      await ScreenCapture.preventScreenCaptureAsync();
    };

    setupScreen();

    return () => {
      ScreenCapture.allowScreenCaptureAsync();
      setCultivatedLandModalVisible(false);
    };
  }, [farmId])
);


 
    useFocusEffect(
      React.useCallback(() => {
        return () => {
          setCultivatedLandModalVisible(false);
        };
      }, [])
    );

  const loadLanguage = async () => {
    const storedLanguage = await AsyncStorage.getItem("@user_language");
    if (storedLanguage) {
      setLanguage(storedLanguage);
      i18n.changeLanguage(storedLanguage);
    }
  };

//  const fetchCrops = async () => {
//   setLoading(true);
  
//   setCrops([]);
//   setChecked([]);
//   setTimestamps([]);
  
//   try {
//     setLanguage(t("CropCalender.LNG"));
//     const token = await AsyncStorage.getItem("userToken");

//     const response = await axios.get(
//       `${environment.API_BASE_URL}api/crop/slave-crop-calendar/${cropId}/${farmId}`,
//       {
//         params: { limit: 10 },
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
//   //  console.log("response================",response)

 
//     const formattedCrops = response.data.map((crop: CropItem) => ({
//       ...crop,
//       startingDate: moment(crop.startingDate).format("YYYY-MM-DD"),
//       createdAt: moment(crop.createdAt).format("YYYY-MM-DD"),
//     }));

//     if (formattedCrops[0]?.status === "completed") {
//       setShowEditIcon(false);
//     } else {
//       setShowEditIcon(true);
//     }

//     setCrops(formattedCrops);
//     const newCheckedStates = formattedCrops.map(
//       (crop: CropItem) => crop.status === "completed"
//     );
//     setChecked(newCheckedStates);
//     setHasMore(formattedCrops.length === 10);

//     const lastCompletedTaskIn = formattedCrops
//       .filter((crop: { status: string; }) => crop.status === "completed")
//       .sort((a: { createdAt: string | number | Date; }, b: { createdAt: string | number | Date; }) => 
//         new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

//     const lastCompletedTaskInd = lastCompletedTaskIn?.taskIndex;
//     setLastCompletedInd(lastCompletedTaskInd);

//     const lastCompletedTaskIndex = newCheckedStates.lastIndexOf(true);
//     setLastCompletedIndex(lastCompletedTaskIndex);

//     setTimestamps(new Array(response.data.length).fill(""));

//     setTimeout(() => {
//       setLoading(false);
//     }, 300);
//   } catch (error) {
//     Alert.alert(t("Main.error"), t("Main.somethingWentWrong"),[{ text: t("Farms.okButton") }]);
//     setTimeout(() => {
//       setLoading(false);
//     }, 300);
//   }
// };


 // console.log("cropid",cropId)
const fetchCropswithoutload = async () => {
  try {
    setLanguage(t("CropCalender.LNG"));
    const token = await AsyncStorage.getItem("userToken");

    const response = await axios.get(
      `${environment.API_BASE_URL}api/crop/slave-crop-calendar/${cropId}/${farmId}`,
      {
        params: { limit: 10 },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
   // console.log("response.............",response.data)

    const formattedCrops = response.data.map((crop: CropItem) => ({
      ...crop,
      startingDate: moment(crop.startingDate).format("YYYY-MM-DD"),
      createdAt: moment(crop.createdAt).format("YYYY-MM-DD"),
    }));

    if (formattedCrops[0]?.status === "completed") {
      setShowEditIcon(false);
    } else {
      setShowEditIcon(true);
    }

  
    setCrops(formattedCrops);
    const newCheckedStates = formattedCrops.map(
      (crop: CropItem) => crop.status === "completed"
    );
    setChecked(newCheckedStates);
    setHasMore(formattedCrops.length === 10);

    const lastCompletedTaskIn = formattedCrops
      .filter((crop: { status: string; }) => crop.status === "completed")
      .sort((a: { createdAt: string | number | Date; }, b: { createdAt: string | number | Date; }) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    const lastCompletedTaskInd = lastCompletedTaskIn?.taskIndex;
    setLastCompletedInd(lastCompletedTaskInd);

    const lastCompletedTaskIndex = newCheckedStates.lastIndexOf(true);
    setLastCompletedIndex(lastCompletedTaskIndex);

    setTimestamps(new Array(response.data.length).fill(""));

  } catch (error) {
    Alert.alert(t("Main.error"), t("Main.somethingWentWrong"),[{ text: t("Farms.okButton") }]);
  }
};

  console.log("on cul crop Id",crops[0]?.onCulscropID)

//   useFocusEffect(
//   React.useCallback(() => {
//     const checkCertificateAndSetup = async () => {
//       // First, check if farm has certificate via API
//       const certificateStatus = await fetchFarmCertificate(farmId);
      
//       // Show certification modal ONLY when farm does NOT have certificate
//       const shouldShowModal = certificateStatus?.status !== "haveFarmCertificate";
//       setCertificationModalVisible(shouldShowModal);
      
//       const disableScreenCapture = async () => {
//         await ScreenCapture.preventScreenCaptureAsync();
//       };

//       const enableScreenCapture = async () => {
//         await ScreenCapture.allowScreenCaptureAsync();
//       };

//       const fetchData = async () => {
//         await fetchCropswithoutload();
//       };

//       disableScreenCapture(); 

//       return () => {
//         enableScreenCapture(); 
//         fetchData();
//       };
//     };

//     checkCertificateAndSetup();
//   }, [farmId]) // Add farmId as dependency
// );


useFocusEffect(
  React.useCallback(() => {
    const checkCertificateAndSetup = async () => {
      // 1. Load crops FIRST
      await fetchCrops();
      
      // 2. Check certificate status with new logic
      const certificateStatus = await fetchFarmCertificate(farmId);
      
      // Show modal if:
      // - No certificate exists (noFarmCertificate) OR
      // - Certificate exists but is incomplete (certificateIncomplete)
      const shouldShowModal = certificateStatus.status === "noFarmCertificate" || 
                            certificateStatus.status === "certificateIncomplete";
      
      console.log(`Certificate status: ${certificateStatus.status}, Show modal: ${shouldShowModal}`);
      
      setCertificationModalVisible(shouldShowModal);
      
      // 3. Screen capture protection
      await ScreenCapture.preventScreenCaptureAsync();
    };

    checkCertificateAndSetup();

    return () => {
      ScreenCapture.allowScreenCaptureAsync();
      setCultivatedLandModalVisible(false);
    };
  }, [farmId])
);

  const viewNextTasks = () => {
    if (startIndex + tasksPerPage < crops.length) {
      setStartIndex(startIndex + tasksPerPage);
    }
  };

  const viewPreviousTasks = () => {
    if (startIndex - tasksPerPage >= 0) {
      setStartIndex(startIndex - tasksPerPage);
    }
  };

  const currentTasks = crops.slice(startIndex, startIndex + tasksPerPage);

const handleCheck = async (i: number) => {
  const globalIndex = startIndex + i;
  const currentCrop = crops[globalIndex];
  
  // Enhanced validation
  if (!currentCrop || !currentCrop.id) {
    console.error("Invalid crop data at index:", globalIndex);
    Alert.alert(
      t("Main.error"),
      "Task data is invalid. Please refresh and try again.",
      [{ text: t("Farms.okButton") }]
    );
    return;
  }

  console.log("🔄 Processing crop ID:", currentCrop.id, "Task Index:", currentCrop.taskIndex);
  console.log("📊 Current crop status:", currentCrop.status);
  
  // Clear storage
  await AsyncStorage.removeItem(`uploadCompleted-${currentCrop.id}`);
  await AsyncStorage.removeItem("nextCropUpdate");

  // Enhanced task order validation
  if (globalIndex > 0) {
    const previousCrop = crops[globalIndex - 1];
    const previousTaskStatus = previousCrop?.status;
    
    console.log(`🔍 Task Order Check:`);
    console.log(`   - Current task: ${currentCrop.taskIndex} (${currentCrop.status})`);
    console.log(`   - Previous task: ${previousCrop?.taskIndex} (${previousTaskStatus})`);
    
    if (previousTaskStatus !== "completed") {
      console.log("❌ Previous task not completed, blocking current task");
      Alert.alert(
        t("CropCalender.sorry"),
        t("CropCalender.completePreviousFirst"),
        [{ text: t("Farms.okButton") }]
      );
      return;
    }
    
    // Additional server-like validation
    const previousCompletedDate = new Date(previousCrop.createdAt);
    const currentDate = new Date();
    const daysSincePrevious = Math.floor((currentDate.getTime() - previousCompletedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log(`📅 Date Validation:`);
    console.log(`   - Previous task completed: ${previousCompletedDate}`);
    console.log(`   - Current date: ${currentDate}`);
    console.log(`   - Days since previous: ${daysSincePrevious}`);
    console.log(`   - Required days: ${currentCrop.days}`);
    
    if (daysSincePrevious < currentCrop.days) {
      const remainingDays = currentCrop.days - daysSincePrevious;
      const message = `${t("CropCalender.YouHave")} ${t("CropCalender.daysRemaining", {
        date: remainingDays,
      })}`;
      
      console.log("❌ Timing validation failed:", message);
      Alert.alert(t("CropCalender.sorry"), message, [{ text: t("Farms.okButton") }]);
      return;
    }
  }

  // Determine new status
  const newStatus = currentCrop.status === "completed" ? "pending" : "completed";
  
  console.log(`🔄 Updating task ${currentCrop.taskIndex} from ${currentCrop.status} to ${newStatus}`);

  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      throw new Error("No authentication token");
    }

    // ✅ FIXED: Send only the required fields that the server expects
    const requestPayload = {
      id: currentCrop.id,
      status: newStatus,
      onCulscropID:crops[0]?.onCulscropID 
      // Remove taskIndex and onCulscropID as they're not allowed by the server validation schema
    };

    console.log("📤 Sending request to server:", {
      url: `${environment.API_BASE_URL}api/crop/update-slave`,
      payload: requestPayload
    });

    const response = await axios.post(
      `${environment.API_BASE_URL}api/crop/update-slave`,
      requestPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log("✅ Server response:", response.data);

    // Update local state
    const updatedCrops = [...crops];
    updatedCrops[globalIndex] = {
      ...updatedCrops[globalIndex],
      status: newStatus,
      // Update createdAt if this is a new completion
      ...(newStatus === "completed" && { createdAt: moment().format("YYYY-MM-DD") })
    };
    setCrops(updatedCrops);

    // Update checked states
    const updatedChecked = [...checked];
    updatedChecked[globalIndex] = newStatus === "completed";
    setChecked(updatedChecked);

    // Update timestamps
    const updatedTimestamps = [...timestamps];
    if (newStatus === "completed") {
      const now = moment().toISOString();
      updatedTimestamps[globalIndex] = now;
      setTimestamps(updatedTimestamps);
      await AsyncStorage.setItem(`taskTimestamp_${globalIndex}`, now);
    } else {
      updatedTimestamps[globalIndex] = "";
      setTimestamps(updatedTimestamps);
      await AsyncStorage.removeItem(`taskTimestamp_${globalIndex}`);
    }

    // Update last completed index
    const completedTasks = updatedCrops.filter(crop => crop.status === "completed");
    const newLastCompletedIndex = completedTasks.length > 0 
      ? updatedCrops.findIndex(crop => crop.id === completedTasks[completedTasks.length - 1].id)
      : null;
    
    setLastCompletedIndex(newLastCompletedIndex);
    console.log("📊 Last completed index updated to:", newLastCompletedIndex);

    // Handle special cases
    if (currentCrop.taskIndex === 1 && newStatus === "completed") {
      console.log("📍 First task completed, triggering location capture");
      await handleLocationIconPress(currentCrop);
    }

    // Setup notifications for next task
    if (globalIndex < crops.length - 1 && newStatus === "completed") {
      console.log("🔔 Setting up notifications for next task");
      registerForPushNotificationsAsync();
      await scheduleDailyNotification();
    }

    // Show image upload modal if required
    if (newStatus === "completed" && currentCrop.reqImages > 0) {
      console.log("🖼️ Task requires images, opening upload modal");
      setCultivatedLandModalVisible(true);
    }

    // Refresh crops data to ensure sync with server
    setTimeout(() => {
      fetchCropswithoutload();
    }, 500);

  } catch (error: any) {
    console.error("❌ Error updating task status:", error);
    
    let errorMessage = t("Main.somethingWentWrong");
    
    if (error.response) {
      console.error("🚨 Server Error Details:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.request) {
      errorMessage = "Network error. Please check your connection.";
    } else {
      errorMessage = error.message || t("Main.somethingWentWrong");
    }
    
    Alert.alert(
      t("CropCalender.sorry"), 
      errorMessage,
      [{ text: t("Farms.okButton") }]
    );
  }
};

  const checkTasksWithImages = async () => {
  if (crops.length === 0) return;
  
  const token = await AsyncStorage.getItem("userToken");
  if (!token) return;

  const tasksWithImagesSet = new Set<string>();

  // Check each completed crop for images
  for (const crop of crops) {
    if (crop.status === 'completed') {
      try {
        const response = await axios.get(
          `${environment.API_BASE_URL}api/crop/get-uploaded-images-count/${crop.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        const uploadedImages = response.data[0]?.count || 0;
        if (uploadedImages > 0) {
          tasksWithImagesSet.add(crop.id);
        }
      } catch (error) {
        console.error(`Error checking images for crop ${crop.id}:`, error);
      }
    }
  }
  
  setTasksWithImages(tasksWithImagesSet);
};
  

  // useEffect(() => {
  //   const checkImageUploadCount = async () => {
  //     if (crops.length === 0) {
  //       console.log("No crops to check.");
  //       return;
  //     }
  
  //     const token = await AsyncStorage.getItem("userToken");
  
  //     if (!token) {
  //       console.error("No token found. Cannot proceed.");
  //       return;
  //     }
  
  //     let lastCompletedCrop = null;
  //     let lastCompletedCropIndex = -1;
  
      
  //     for (let i = 0; i < crops.length; i++) {
  //       const currentCrop = crops[i];
  
        
  //       if (currentCrop.status === 'completed') {
  //         lastCompletedCrop = currentCrop;  
  //         lastCompletedCropIndex = i;  
  //       }
  //     }
  
      
  //     if (lastCompletedCrop) {
  //       const requiredImages = lastCompletedCrop.reqImages;
  
  //       try {
  //         const response = await axios.get(
  //           `${environment.API_BASE_URL}api/crop/get-uploaded-images-count/${lastCompletedCrop.id}`,
  //           {
  //             headers: {
  //               Authorization: `Bearer ${token}`,
  //             },
  //           }
           
  //         );
         
  
  //         const uploadedImages = response.data[0]?.count || 0;
  //         console.log(`Crop with ID ${lastCompletedCrop.id} has ${uploadedImages} uploaded images.`);
  //         console.log(`Crop with ID ${lastCompletedCrop.id} requires ${requiredImages} images.`);
  //         if (uploadedImages < requiredImages && lastCompletedCrop.autoCompleted === 0 ) {
  //           console.log("hitc")
  //           await cancelScheduledNotification();
  //           try {
  //             await axios.post(
  //               `${environment.API_BASE_URL}api/crop/update-slave`,
  //               {
  //                 id: lastCompletedCrop.id,
  //                 status: "pending",
  //               },
  //               {
  //                 headers: {
  //                   Authorization: `Bearer ${token}`,
  //                 },
  //               }
  //             );
  //             await fetchCropswithoutload();
  //             console.log(`Crop with ID ${lastCompletedCrop.id} status set to pending due to incomplete upload.`);
  //           } catch (error) {
  //             console.error("Error setting status to pending", error);
  //           }
  //         }
  //       } catch (error) {
  //         console.error("Error fetching uploaded image count", error);
  //       }
  //     } else {
  //       console.log("No completed crops found.");
  //     }
  //   };
  
  //   checkImageUploadCount();
  // }, [crops]);


  useEffect(() => {
  const checkImageUploadCount = async () => {
    if (crops.length === 0) {
      console.log("No crops to check.");
      return;
    }

    const token = await AsyncStorage.getItem("userToken");

    if (!token) {
      console.error("No token found. Cannot proceed.");
      return;
    }

    let lastCompletedCrop = null;
    let lastCompletedCropIndex = -1;

    for (let i = 0; i < crops.length; i++) {
      const currentCrop = crops[i];

      if (currentCrop.status === 'completed') {
        lastCompletedCrop = currentCrop;  
        lastCompletedCropIndex = i;  
      }
    }

    if (lastCompletedCrop) {
      const requiredImages = lastCompletedCrop.reqImages;

      try {
        const response = await axios.get(
          `${environment.API_BASE_URL}api/crop/get-uploaded-images-count/${lastCompletedCrop.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const uploadedImages = response.data[0]?.count || 0;
        console.log(`Crop with ID ${lastCompletedCrop.id} has ${uploadedImages} uploaded images.`);
        console.log(`Crop with ID ${lastCompletedCrop.id} requires ${requiredImages} images.`);
        if (uploadedImages < requiredImages && lastCompletedCrop.autoCompleted === 0 ) {
          console.log("hitc")
          await cancelScheduledNotification();
          try {
            await axios.post(
              `${environment.API_BASE_URL}api/crop/update-slave`,
              {
                id: lastCompletedCrop.id,
                status: "pending",
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            await fetchCropswithoutload();
            console.log(`Crop with ID ${lastCompletedCrop.id} status set to pending due to incomplete upload.`);
          } catch (error) {
            console.error("Error setting status to pending", error);
          }
        }
      } catch (error) {
        console.error("Error fetching uploaded image count", error);
      }
    } else {
      console.log("No completed crops found.");
    }
  };

  // Call both functions
  checkImageUploadCount();
  checkTasksWithImages();
}, [crops]);
  

  async function askForPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  }

  async function cancelScheduledNotification() {
    const storedNotificationId = await AsyncStorage.getItem(
      "currentNotificationId"
    );
    if (storedNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(
        storedNotificationId
      );
      console.log("Scheduled notification canceled.");
      await AsyncStorage.removeItem("currentNotificationId");
    } else {
      console.log("No scheduled notification found.");
    }
  }

  async function scheduleDailyNotification() {
    try {
      const hasPermission = await askForPermissions();
      if (!hasPermission) {
        console.error("Notification permission not granted");
        return;
      }

      const storedNotificationId = await AsyncStorage.getItem(
        "currentNotificationId"
      );

      if (storedNotificationId) {
        await Notifications.cancelScheduledNotificationAsync(
          storedNotificationId
        );
        console.log("Previous notification canceled.");
        await AsyncStorage.removeItem("currentNotificationId");
      }

      const storedData = await AsyncStorage.getItem("nextCropUpdate");
      if (storedData) {
        const asy = JSON.parse(storedData);
        const nextCropDate = new Date(asy.date);
        const trigger = new Date(asy.date);
        const taskId = asy.taskID;
        console.log("Next crop date:", nextCropDate);
    

        if (nextCropDate <= new Date()) {
          trigger.setDate(trigger.getDate() );
        }

        if (nextCropDate > trigger) {
          trigger.setTime(nextCropDate.getTime());
        }
        if (trigger) {
          trigger.setDate(trigger.getDate() -1 );
        }
        console.log("Trigger date:", trigger);
        const result = await Notifications.scheduleNotificationAsync({
          content: {
            title: `${t("Notification.Reminder")}`,
            body: `${t("Notification.CompleteMsg", {
              task: taskId,
            })}`,
            sound: true,
          },
          trigger: {
            month: trigger.getMonth(),
            day: trigger.getDate(),
            hour: 20,
            minute: 0,
            repeats: true,
          },
        });

        if (result) {
          console.log("Notification scheduled successfully!", result);
          await AsyncStorage.setItem("currentNotificationId", result);
        } else {
          console.error("Failed to schedule notification.");
        }
      } else {
        console.error("No next crop update found in storage");
      }
    } catch (error) {
      console.error("Error scheduling notification:", error);
    }
  }

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }

      if (Constants.easConfig?.projectId) {
        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId: Constants.easConfig.projectId,
          })
        ).data;
        console.log(token);
      }
    } else {
      alert("Must use physical device for Push Notifications");
    }

    return token;
  }

  useEffect(() => {
    const loadTimestamps = async () => {
      const loadedTimestamps = [];
      for (let i = 0; i < crops.length; i++) {
        const timestamp = await AsyncStorage.getItem(`taskTimestamp_${i}`);
        loadedTimestamps.push(timestamp || "");
      }
      setTimestamps(loadedTimestamps);
    };

    if (crops.length > 0) {
      loadTimestamps();
    }
  }, [crops]);

  const handleLocationIconPress = async (currentCrop: CropItem) => {
    setLoading(true);
    console.log(`Processing crop with ID: ${currentCrop.id}`);

    const maxRetries = 3;
    const delayBetweenRetries = 2000;

    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const getLocationWithRetry = async (
      retries: number
    ): Promise<Location.LocationObject | null> => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          throw new Error("Location permission denied");
        }

        
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High, 
        });
        return location;
      } catch (error) {
        console.error(`Attempt failed. Retries left: ${retries}`, error);

        if (retries > 0) {
          await delay(delayBetweenRetries);
          return getLocationWithRetry(retries - 1);
        } else {
          return null;
        }
      }
    };

    try {
      const location = await getLocationWithRetry(maxRetries);

      if (!location) {
        Alert.alert(
                  t("Farms.Error"),
                  t("Farms.Unable to fetch location after multiple attempts"),
                  [{ text: t("Farms.okButton") }]
                );
        setLoading(false);
        return;
      }
      
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.post(
        `${environment.API_BASE_URL}api/crop/geo-location`,
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          taskId: currentCrop.id,
          onCulscropID: currentCrop.onCulscropID,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Server response:", response.data);
    } catch (error) {
      console.error("Error processing location data:", error);
    } finally {
      setLoading(false);
    }
  };

  const SkeletonLoader = () => {
    const rectHeight = hp("30%");
    const gap = hp("4%");

    return (
      <View style={{ marginTop: hp("2%"), paddingHorizontal: wp("5%") }}>
        <ContentLoader
          speed={2}
          width={wp("100%")}
          height={hp("150%")}
          viewBox={`0 0 ${wp("100%")} ${hp("150%")}`}
          backgroundColor="#ececec"
          foregroundColor="#fafafa"
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <Rect
              key={`rect-${index}`}
              x="0"
              y={index * (rectHeight + gap)}
              rx="12"
              ry="20"
              width={wp("90%")}
              height={rectHeight}
            />
          ))}
        </ContentLoader>
      </View>
    );
  };





const openImageModal = async (taskIndex: number): Promise<void> => {
  console.log('openImageModal called with taskIndex:', taskIndex);
  
  try {
    const cropIndex = startIndex + taskIndex;
    const crop: CropItem = crops[cropIndex];
    
    if (!crop) {
      console.warn('Crop data not found for index:', cropIndex);
      Alert.alert(t("Farms.Error"), t("Farms.Task data not found"),[{ text: t("Farms.okButton") }]);
      return;
    }

    // Show loading state
    setLoading(true);
    
    const token = await AsyncStorage.getItem("userToken");
    
    if (!token) {
     Alert.alert(t("Farms.Error"), t("Farms.No authentication token found"),[{ text: t("Farms.okButton") }])
      setLoading(false);
      return;
    }

    console.log('Fetching images for slaveId (crop.id):', crop.id);
    
    // Fetch task images from API using the crop.id as slaveId
    const response = await axios.get(
      `${environment.API_BASE_URL}api/crop/get-task-image/${crop.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('API Response:', response.data);

    if (response.data.success && response.data.data && response.data.data.length > 0) {
      // Convert API response to ImageData format
      const images: ImageData[] = response.data.data.map((taskImage: any, index: number) => ({
        uri: taskImage.image,
        title: `Task ${crop.taskIndex} - Photo ${index + 1}`,
        description: crop.taskDescriptionEnglish,
        uploadedBy: taskImage.uploadedBy,
        createdAt: taskImage.createdAt,
        from: 'crop'
      }));
      
      console.log('Opening modal with fetched images for task:', crop.taskIndex);
      console.log('Number of images:', images.length);
      
      setSelectedTaskImages(images);
      setSelectedImageIndex(0);
      setImageModalVisible(true);
    } else {
      // User-friendly message for no images found
    //   Alert.alert(
    //     '📸 No Images Yet', 
    //     `You haven't uploaded any images for Task ${crop.taskIndex} yet. Complete this task by taking photos to track your progress!`,
    //     [
    //       {
    //         text: 'OK',
    //         style: 'default'
    //       }
    //     ]
    //   );
    //   console.log('No images found for task:', crop.taskIndex);
    // }
    Alert.alert(
  t("CropCalender.No Images Yet"),
  t("CropCalender.No Images Message", { taskIndex: crop.taskIndex }),
  [
    {
      text: t("CropCalender.OK"),
      style: 'default'
    }
  ]
);
 console.log('No images found for task:', crop.taskIndex);
     }
    
  } catch (error: any) {
    console.error('Error fetching task images:', error);
    
    let errorTitle = 'Oops! Something went wrong';
    let errorMessage = 'We couldn\'t load your images right now. Please try again.';
    
    if (error.response) {
      // Server responded with error status
      console.error('Server Error:', error.response.data);
      
      if (error.response.status === 404) {
        errorTitle = '📸 No Images Yet';
        errorMessage = `You haven't uploaded any images for this task yet. `;
      } else if (error.response.status === 401) {
        errorTitle = 'Session Expired';
        errorMessage = 'Your session has expired. Please log in again to continue.';
      } else if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.request) {
  
      errorTitle = 'Connection Issue';
      errorMessage = 'Please check your internet connection and try again.';
    }
    
    Alert.alert(errorTitle, errorMessage, [
      {
          text: t("CropCalender.OK"),
        style: 'default'
      }
    ]);
  } finally {
    setLoading(false);
  }
};

  return (
    <View className="flex-1">
    <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={false} />

  {/* Certification Modal - Only show when farm does NOT have certificate */}
      {!hasCertificate && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={certificationModalVisible}
          onRequestClose={handleReject}
          className="mt-20"
          statusBarTranslucent={false}
        >
          <View 
            className="flex-1 justify-start"
            style={{ 
              paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Modal Content - Only the top portion */}
            <View className="bg-white rounded-b-3xl shadow-2xl">
              {/* Header */}
              <View className="flex-row items-center justify-between px-5 pt-4 pb-4">
                <TouchableOpacity 
                  onPress={() => navigation.navigate("Main", { 
                    screen: "FarmDetailsScreen",
                    params: { farmId: farmId }
                  })} 
                >
                  <Ionicons name="chevron-back-outline" size={30} color="gray" />
                </TouchableOpacity>
                <Text className="text-lg font-semibold text-gray-900">{cropName}</Text>
                <View>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("CropEnrol", {
                        status: "edit",
                        onCulscropID: crops[0]?.onCulscropID,
                        cropId,
                      })
                    }
                  >
                    <Ionicons name="pencil" size={20} color="black" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Certification Question */}
              <View className="px-6 pb-6 ">
                <Text className="text-center text-base text-gray-800 mb-5">
                  {t("CropCalender.Buy a Certification for")} {cropName}?
                </Text>
                
                {/* Action Buttons */}
                <View className="flex-row justify-center space-x-4">
                  <TouchableOpacity
                    className="rounded-lg px-8 py-3"
                    style={{ backgroundColor: '#FF0000' }}
                    onPress={handleReject}
                    activeOpacity={0.8}
                  >
                    <Text className="text-white font-semibold text-base">
                      {t("CropCalender.Reject")}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    className="rounded-lg px-8 py-3"
                    style={{ backgroundColor: '#00A896' }}
                    onPress={handleBuyNow}
                    activeOpacity={0.8}
                  >
                    <Text className="text-white font-semibold text-base">
                      {t("CropCalender.Buy Now")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {isCultivatedLandModalVisible && lastCompletedIndex !== null && (
        <CultivatedLandModal
          visible={isCultivatedLandModalVisible}
          onClose={() => setCultivatedLandModalVisible(false)}
          cropId={crops[lastCompletedIndex].id}
          farmId = {farmId}
          onCulscropID = {crops[0]?.onCulscropID}
          requiredImages={0}
        />
      )}

      <View
        className="flex-row items-center justify-between"
        style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
      >
        <View>
          <TouchableOpacity 
               onPress={() => navigation.navigate("Main", { 
    screen: "FarmDetailsScreen",
   params: { farmId: farmId }
  })} 
          >
            <Ionicons name="chevron-back-outline" size={30} color="gray" />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-black text-xl">{cropName} </Text>
        </View>
        <View>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("CropEnrol", {
                status: "edit",
                onCulscropID: crops[0]?.onCulscropID,
                cropId,
              })
            }
          >
           

            {showediticon ? (
              <Ionicons name="pencil" size={20} color="black" />
            ) : null}
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <SkeletonLoader />
      ) : (
        <ScrollView
          style={{ marginBottom: 60 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefLoading(true);
                await fetchCrops();
                setRefLoading(false);
              }}
            />
          }
        >
          {startIndex > 0 && (
            <TouchableOpacity
              className="py-2 px-4 flex-row items-center justify-center"
              onPress={viewPreviousTasks}
            >
              <Text className="text-black font-bold">
                {t("CropCalender.viewPrevious")}
              </Text>
            </TouchableOpacity>
          )}

 {currentTasks.map((crop, index) => (
  <View
    key={index}
    className={`flex-1 m-6 mb-[-10] shadow border-gray-200 border-[1px] rounded-[15px] ${
      checked[startIndex + index] && (user?.role === 'Owner' || user?.role === 'Manager' || user?.role === 'Supervisor')
        ? 'bg-gray-600/80' 
        : 'bg-white'       
    }`}
  >
    <View className="flex-row">
      <View>
        <Text className="ml-6 mt-5">
         {/* {t("CropCalender.Task")} {crop.taskIndex} */}
          {crop.startingDate}
        </Text>
      </View>
      
      <View className="flex-1 items-end justify-center">
        <TouchableOpacity
          className="p-2"
          onPress={() => handleCheck(index)}
          disabled={
            lastCompletedIndex !== null &&
            startIndex + index > lastCompletedIndex + 1  || crop.autoCompleted === 1
          }
          style={{ zIndex: 200 }} 
        >
          {/* <View style={{
            borderWidth: checked[startIndex + index] || (lastCompletedIndex !== null && startIndex + index === lastCompletedIndex + 1) ? 0 : 1,
            borderColor: "white",
            borderRadius: 20,
            padding: 0,
            backgroundColor: checked[startIndex + index] 
              ? "white" 
              : lastCompletedIndex !== null && startIndex + index === lastCompletedIndex + 1
              ? "white"
              : "white"
          }}> */}
    <View style={{
  borderWidth: checked[startIndex + index] || (lastCompletedIndex !== null && startIndex + index === lastCompletedIndex + 1) ? 0 : 2,
  borderColor: "#00A896",
  borderRadius: 15,
  width: 30,
  height: 30,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: checked[startIndex + index] 
    ? "#00A896"  // Completed - full green background
    : lastCompletedIndex !== null && startIndex + index === lastCompletedIndex + 1
    ? "black"  // Next task - black background
    : "transparent"  // Others - transparent (only border)
}}>
            
            {/* <AntDesign
              name={checked[startIndex + index] || (lastCompletedIndex !== null && startIndex + index === lastCompletedIndex + 1) ? "check-circle" : "check"}
              size={checked[startIndex + index] || (lastCompletedIndex !== null && startIndex + index === lastCompletedIndex + 1) ? 30 : 28}
              color={
                checked[startIndex + index]
                  ? "#00A896"
                  : lastCompletedIndex !== null &&
                    startIndex + index === lastCompletedIndex + 1
                  ? ""
                  : "black"
              }
            /> */}
           <AntDesign
    name="check"  // Use "check" instead of "check-circle"
    size={15}
    color={
      checked[startIndex + index]
        ? "white"  // Completed - white tick
        : lastCompletedIndex !== null &&
          startIndex + index === lastCompletedIndex + 1
        ? "white"  // Next task - white tick
        : "black"  // Others - black tick
    }
  />
          </View>
        </TouchableOpacity>
      </View>
    </View>


     {checked[startIndex + index] && 
     (user?.role === 'Owner' || user?.role === 'Manager' || user?.role === 'Supervisor') && 
     tasksWithImages.has(crop.id) && (
      <View style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -17.5 }, { translateY: -17.5 }], 
        zIndex: 150 
      }}>
        <TouchableOpacity
          onPress={() => openImageModal(index)}
          style={{
            padding: 5, 
          }}
          activeOpacity={0.7}
        >
          <Image
            source={require('../../assets/images/viewimage.png')}
            style={{
              width: 35,
              height: 35,
            }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    )}
    
   
    <Text className="ml-6 font-bold mr-6">
        {language === "si"
        ? crop.taskSinhala
        : language === "ta"
        ? crop.taskTamil
        : crop.taskEnglish}
    </Text>
    <Text className="ml-6 mt-2 mb-6 mr-6">
      {language === "si"
        ? crop.taskDescriptionSinhala
        : language === "ta"
        ? crop.taskDescriptionTamil
        : crop.taskDescriptionEnglish}
    </Text>
    
    {crop.imageLink && (
      <TouchableOpacity
        onPress={() =>
          crop.imageLink && Linking.openURL(crop.imageLink)
        }
      >
        <View className="flex rounded-lg items-center m-4  bg-black">
          <Text className="text-white p-3 text-center">
            {t("CropCalender.viewImage")}
          </Text>
        </View>
      </TouchableOpacity>
    )}
    
    {crop.videoLinkEnglish &&
      crop.videoLinkSinhala &&
      crop.videoLinkTamil && (
        <TouchableOpacity
          onPress={() => {
            if (language === "en" && crop.videoLinkEnglish) {
              Linking.openURL(crop.videoLinkEnglish);
            } else if (language === "si" && crop.videoLinkSinhala) {
              Linking.openURL(crop.videoLinkSinhala);
            } else if (language === "ta" && crop.videoLinkTamil) {
              Linking.openURL(crop.videoLinkTamil);
            }
          }}
        >
          <View className="flex items-center m-4 -mt-2 rounded-xl bg-black" >
            <Text className="text-white p-3 text-center">
              {t("CropCalender.viewVideo")}
            </Text>
          </View>
        </TouchableOpacity>
      )}
  </View>
))}

<ImageViewerModal
      visible={imageModalVisible}
      images={selectedTaskImages}
      initialIndex={selectedImageIndex}
      onClose={() => {
        setImageModalVisible(false);
        setSelectedTaskImages([]);
        setSelectedImageIndex(0);
      }}
    />
          {startIndex + tasksPerPage < crops.length && (
            <TouchableOpacity
              className="py-2 pb-8 px-4 flex-row items-center justify-center"
              onPress={viewNextTasks}
            >
              <Text className="text-black font-bold">
                {t("CropCalender.viewMore")}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default FarmCropCalander;