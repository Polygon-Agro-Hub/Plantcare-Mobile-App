import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Linking,
  Platform,
  RefreshControl,
  BackHandler,
  Image,
  ActivityIndicator,
  Modal
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
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
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
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
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";


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
  uploadedBy?: string;
  images?: ImageData[];
}

interface ImageData {
  uri: string;
  url?: string;
  title?: string;
  description?: string;
  uploadedBy?: string;
  createdAt?: string;
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

type FramcropCalenderwithcertificateProp = RouteProp<RootStackParamList, "FramcropCalenderwithcertificate">;

type FramcropCalenderwithcertificateNavigationProp = StackNavigationProp<
  RootStackParamList,
  "FramcropCalenderwithcertificate"
>;

type FramcropCalenderwithcertificateScreenProp = StackNavigationProp<
  RootStackParamList,
  "FramcropCalenderwithcertificate"
>;

type FramcropCalenderwithcertificateRouteProp = RouteProp<RootStackParamList, "FramcropCalenderwithcertificate">;

interface FramcropCalenderwithcertificateProps {
  navigation: FramcropCalenderwithcertificateNavigationProp;
  route: FramcropCalenderwithcertificateProp;
}
interface UserData {
  farmCount: number;
  membership: string;
  paymentActiveStatus: string | null;
  role:string
}

interface QuestionnaireItem {
  id: number;
  slaveId: number;
  type: string;
  qNo: number;
  qEnglish: string;
  qSinhala: string;
  qTamil: string;
  tickResult: number | null; // Allow null
  officerTickResult: string | null;
  uploadImage: string | null;
  officerUploadImage: string | null;
  doneDate: string | null;
}

interface CertificateData {
  cropId: string;
  paymentId: string;
  certificateId: string;
  transactionId: string;
  amount: number;
  expireDate: string;
  paymentCreatedAt: string;
  srtName: string;
  srtNumber: string;
  applicable: string;
  accreditation: string;
  serviceAreas: string;
  price: number;
  timeLine: string;
  commission: number;
  tearms: string;
  scope: string;
  logo: string;
  noOfVisit: number;
  certificateCreatedAt: string;
  slaveQuestionnaireId: number;
  clusterFarmId: number | null;
  slaveQuestionnaireCreatedAt: string;
  questionnaireItems: QuestionnaireItem[];
}

// Camera Screen Component
function CameraScreen({
  onClose,
}: {
  onClose: (capturedImageUri: string | null) => void;
}) {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [camera, setCamera] = useState<CameraView | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (permission?.granted === false) {
      requestPermission();
    }
  }, [permission]);

  if (permission === null) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-white text-lg mb-4">
          {t("CropCalender.loadingCameraPermission")}
        </Text>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const captureImage = async () => {
    if (camera && isCameraReady) {
      const photo = await camera.takePictureAsync();
      onClose(photo?.uri ?? null);
    }
  };

  return (
    <CameraView
      className="flex-1"
      facing={facing}
      ref={(ref) => setCamera(ref)}
      onCameraReady={() => setIsCameraReady(true)}
    >
      <View style={{
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 24,
        gap: 16,
        zIndex: 1000
      }}>
        <TouchableOpacity
          onPress={toggleCameraFacing}
          style={{
            backgroundColor: '#26D041',
            padding: 16,
            borderRadius: 50,
            marginBottom: 12
          }}
        >
          <Text style={{ color: 'black' }}>
            {t("CropCalender.FlipCamera")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={captureImage}
          style={{
            backgroundColor: '#26D041',
            padding: 16,
            borderRadius: 50,
            marginBottom: 12
          }}
        >
          <Text style={{ color: 'black', fontWeight: '600' }}>
            {t("CropCalender.Capture")}
          </Text>
        </TouchableOpacity>
      </View>
    </CameraView>
  );
}

const FramcropCalenderwithcertificate: React.FC<FramcropCalenderwithcertificateProps> = ({ navigation, route }) => {

  const [crops, setCrops] = useState<CropItem[]>([]);
  const [checked, setChecked] = useState<boolean[]>([]);
  const [timestamps, setTimestamps] = useState<string[]>([]);
  const [language, setLanguage] = useState("en");
  const { cropId, cropName , farmId,ongoingCropId} = route.params;
  const { t } = useTranslation();
  const [updateerror, setUpdateError] = useState<string>("");
  const [lastCompletedIndex, setLastCompletedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCultivatedLandModalVisible, setCultivatedLandModalVisible] = useState(false);
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
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [certificateLoading, setCertificateLoading] = useState<boolean>(true);
  const [isGapExpanded, setIsGapExpanded] = useState(false);
  const [questionnaireItems, setQuestionnaireItems] = useState<QuestionnaireItem[]>([]);
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
  const [uploadingImageForItem, setUploadingImageForItem] = useState<number | null>(null);
  const [areCertificationTasksComplete, setAreCertificationTasksComplete] = useState<boolean>(false);
  const [pendingCertificationItems, setPendingCertificationItems] = useState<QuestionnaireItem[]>([]);
  const [showCertificationModal, setShowCertificationModal] = useState(false);
  
  // Camera modal states
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionnaireItem | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);

  useEffect(() => {
    if (capturedImage) {
      setIsButtonEnabled(false);
      setCountdown(3);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsButtonEnabled(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [capturedImage]);

  const showCertificationLockAlert = () => {
    setShowCertificationModal(true);
  };

  const checkCertificationCompletion = (items: QuestionnaireItem[]): boolean => {
    if (!items || items.length === 0) {
      return true;
    }

    return items.every(item => {
      if (item.type === 'Tick Off') {
        return item.tickResult === 1;
      } else if (item.type === 'Photo Proof') {
        return item.uploadImage !== null;
      }
      return false;
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      const disableScreenCapture = async () => {
        await ScreenCapture.preventScreenCaptureAsync();
      };

      const enableScreenCapture = async () => {
        await ScreenCapture.allowScreenCaptureAsync();
      };
      const fetchData = async () => {
        await fetchCropswithoutload();
      };
      disableScreenCapture(); 

      return () => {
        enableScreenCapture(); 
        fetchData()
      };
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        navigation.navigate("Main", {screen: "FarmDetailsScreen", params: { farmId: farmId }});
        return true;
      };
      const subscription = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
      return () => subscription.remove();
    }, [navigation])
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

  const fetchCropCertificate = async (ongoingCropId: string | number) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      
      if (!token) {
        console.log("No authentication token found");
        return null;
      }

      const response = await axios.get(
        `${environment.API_BASE_URL}api/certificate/get-crop-certificate-byId/${ongoingCropId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log("Certificate response:", response.data);

      if (response.data && response.data.length > 0) {
        const certData = response.data[0];
        
        if (certData.questionnaireItems && certData.questionnaireItems.length > 0) {
          setQuestionnaireItems(certData.questionnaireItems);
        }
        
        return certData;
      }
      
      return null;

    } catch (err) {
      console.error("Error fetching crop certificate:", err);
      return null;
    }
  };


  

  const handleQuestionnaireCheck = async (item: QuestionnaireItem) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      
      if (!token) {
        Alert.alert(t("Farms.Error"), t("Farms.No authentication token found"), [{ text: t("Farms.okButton") }]);
        return;
      }

      const isCompleted = 
        (item.type === 'Tick Off' && item.tickResult === 1) ||
        (item.type === 'Photo Proof' && item.uploadImage !== null);

      // If item is already completed, check if we can remove it
      if (isCompleted) {
        // Check if the completion was done within the last 1 hour
        if (item.doneDate) {
          const completionTime = new Date(item.doneDate);
          const currentTime = new Date();
          const timeDifference = currentTime.getTime() - completionTime.getTime();
          const oneHourInMs = 60 * 60 * 1000;

          if (timeDifference > oneHourInMs) {
            Alert.alert(
              t("CropCalender.Cannot Remove"),
              t("CropCalender.Completion cannot be removed after 1 hour"),
              [{ text: t("Farms.okButton") }]
            );
            return;
          }
        }

        // Show confirmation to remove completion
        Alert.alert(
          t("CropCalender.Confirm Remove"),
          t("CropCalender.Remove Completion Message"),
          [
            { text: t("Farms.Cancel"), style: "cancel" },
            {
              text: t("Farms.okButton"),
              onPress: async () => {
                await handleRemoveCompletion(item);
              },
            },
          ]
        );
        return;
      }

      // If item is not completed, handle completion based on type
      if (item.type === 'Photo Proof') {
        // Open camera modal for new photo
        setSelectedQuestion(item);
        setShowCameraModal(true);
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

        const updatedItems = questionnaireItems.map(prevItem =>
          prevItem.id === item.id
            ? { 
                ...prevItem, 
                tickResult: newTickResult === '1' ? 1 : 0, 
                doneDate: newTickResult === '1' ? new Date().toISOString() : null 
              }
            : prevItem
        );
        
        setQuestionnaireItems(updatedItems);
        
        const isComplete = checkCertificationCompletion(updatedItems);
        setAreCertificationTasksComplete(isComplete);
        
        const pending = updatedItems.filter(it => {
          if (it.type === 'Tick Off') return it.tickResult !== 1;
          if (it.type === 'Photo Proof') return it.uploadImage === null;
          return false;
        });
        setPendingCertificationItems(pending);
      }

    } catch (error) {
      console.error("Error updating questionnaire item:", error);
      Alert.alert(t("Main.error"), t("Main.somethingWentWrong"), [{ text: t("Farms.okButton") }]);
    }
  };

  const handleRemoveCompletion = async (item: QuestionnaireItem) => {
    setUploadingImageForItem(item.id);
    
    try {
      const token = await AsyncStorage.getItem("userToken");
      
      if (!token) {
        Alert.alert(t("Farms.Error"), t("Farms.No authentication token found"));
        setUploadingImageForItem(null);
        return;
      }

      console.log('Attempting to remove completion for item:', item.id, 'Type:', item.type);

      const response = await axios.delete(
        `${environment.API_BASE_URL}api/certificate/questionnaire-item/remove/${item.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Remove completion response:', response.data);

      if (response.data && response.data.success) {
        const updatedItems = questionnaireItems.map(prevItem =>
          prevItem.id === item.id
            ? { 
                ...prevItem, 
                uploadImage: null, 
                tickResult: null,
                doneDate: null 
              }
            : prevItem
        );
        
        setQuestionnaireItems(updatedItems);
        
        const isComplete = checkCertificationCompletion(updatedItems);
        setAreCertificationTasksComplete(isComplete);
        
        const pending = updatedItems.filter(checkItem => {
          if (checkItem.type === 'Tick Off') return checkItem.tickResult !== 1;
          if (checkItem.type === 'Photo Proof') return checkItem.uploadImage === null;
          return false;
        });
        setPendingCertificationItems(pending);
        
        Alert.alert(
          t("CropCalender.Success"),
          t("CropCalender.Completion removed successfully")
        );
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error("Error removing completion:", error);
      console.error("Error response:", error.response?.data);
      
      let errorMessage = t("Main.somethingWentWrong");
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 403) {
        errorMessage = t("CropCalender.Completion cannot be removed after 1 hour");
      } else if (error.response?.status === 404) {
        errorMessage = t("CropCalender.Item not found");
      }
      
      Alert.alert(t("Main.error"), errorMessage);
    } finally {
      setUploadingImageForItem(null);
    }
  };

  const handleSubmitPhoto = async () => {
    if (!capturedImage || !selectedQuestion) return;

    try {
      setUploadingImageForItem(selectedQuestion.id);
      const token = await AsyncStorage.getItem("userToken");
      
      if (!token) {
        Alert.alert(t("Farms.Error"), t("Farms.No authentication token found"));
        setUploadingImageForItem(null);
        return;
      }

      // Compress and resize the image
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        capturedImage,
        [
          {
            resize: {
              width: 1024,
              height: 1024,
            },
          },
        ],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: false,
        }
      );

      const fileName = `questionnaire_${selectedQuestion.id}_${Date.now()}.jpg`;
      const fileType = 'image/jpeg';

      const formData = new FormData();
      formData.append('image', {
        uri: manipulatedImage.uri,
        type: fileType,
        name: fileName,
      } as any);
      formData.append('itemId', selectedQuestion.id.toString());
      formData.append('slaveId', selectedQuestion.slaveId.toString());
      formData.append('farmId', farmId.toString());

      const response = await axios.post(
        `${environment.API_BASE_URL}api/certificate/questionnaire-item/upload-image/${selectedQuestion.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
        }
      );

      if (response.data.success) {
        const updatedItems = questionnaireItems.map(prevItem =>
          prevItem.id === selectedQuestion.id
            ? { 
                ...prevItem, 
                uploadImage: response.data.imageUrl,
                doneDate: new Date().toISOString()
              }
            : prevItem
        );
        
        setQuestionnaireItems(updatedItems);
        
        const isComplete = checkCertificationCompletion(updatedItems);
        setAreCertificationTasksComplete(isComplete);
        
        const pending = updatedItems.filter(item => {
          if (item.type === 'Tick Off') return item.tickResult !== 1;
          if (item.type === 'Photo Proof') return item.uploadImage === null;
          return false;
        });
        setPendingCertificationItems(pending);

        Alert.alert(
          t("CropCalender.Success"),
          t("CropCalender.SuccessMessage"),
          [{ text: t("Farms.okButton") }]
        );
        
        setShowCameraModal(false);
        setCapturedImage(null);
        setSelectedQuestion(null);
      }

    } catch (error: any) {
      console.error("Error uploading questionnaire image:", error);
      
      let errorMessage = t("Main.somethingWentWrong");
      if (error.response?.status === 413) {
        errorMessage = t("CropCalender.Image file is too large");
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = t("CropCalender.Upload timeout. Please try again");
      }
      
      Alert.alert(t("Main.error"), errorMessage, [{ text: t("Farms.okButton") }]);
    } finally {
      setUploadingImageForItem(null);
    }
  };

  const handleCameraClose = (imageUri: string | null) => {
    setShowCamera(false);
    if (imageUri) {
      console.log("Captured Image URI:", imageUri);
      setCapturedImage(imageUri);
      setShowCameraModal(true);
    }
  };

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

  useFocusEffect(
    React.useCallback(() => {
      const loadCertificateData = async () => {
        if (ongoingCropId) {
          setCertificateLoading(true);
          const certificate = await fetchCropCertificate(ongoingCropId);
          setCertificateData(certificate);
          
          if (certificate && certificate.questionnaireItems) {
            setQuestionnaireItems(certificate.questionnaireItems);
            const isComplete = checkCertificationCompletion(certificate.questionnaireItems);
            setAreCertificationTasksComplete(isComplete);
            
            const pending = certificate.questionnaireItems.filter((item: { type: string; tickResult: number; uploadImage: null; }) => {
              if (item.type === 'Tick Off') {
                return item.tickResult !== 1;
              } else if (item.type === 'Photo Proof') {
                return item.uploadImage === null;
              }
              return false;
            });
            setPendingCertificationItems(pending);
          } else {
            setAreCertificationTasksComplete(true);
          }
          
          setCertificateLoading(false);
        }
      };

      loadCertificateData();
    }, [ongoingCropId])
  );

  const fetchCrops = async () => {
    setLoading(true);
    setCrops([]);
    setChecked([]);
    setTimestamps([]);
    
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

      setTimeout(() => {
        setLoading(false);
      }, 300);
    } catch (error) {
      Alert.alert(t("Main.error"), t("Main.somethingWentWrong"),[{ text: t("Farms.okButton") }]);
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

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

  useFocusEffect(
    React.useCallback(() => {
      const navigateToNextIncompleteTask = () => {
        const firstIncompleteIndex = checked.findIndex((status) => !status);
        if (firstIncompleteIndex !== -1) {
          const newStartIndex =
            Math.floor(firstIncompleteIndex / tasksPerPage) * tasksPerPage;
          setStartIndex(newStartIndex);
        } else {
          setStartIndex(0);
        }
      };

      setCrops([]);
      setChecked([]);
      setTimestamps([]);
      setLastCompletedIndex(null);
      setLastCompletedInd(null);
      setShowEditIcon(false);
      
      loadLanguage();
      fetchCrops().then(() => navigateToNextIncompleteTask());
    }, [cropId, farmId])
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

 // Add this function to check if task completion can be removed (within 1 hour)
// Add this function to check if task completion can be removed (within 1 hour)
const canRemoveCompletion = (completionTime: string): boolean => {
  try {
    const completionDate = new Date(completionTime);
    const currentTime = new Date();
    const timeDifference = currentTime.getTime() - completionDate.getTime();
    const oneHourInMs = 60 * 60 * 1000;
    
    const canRemove = timeDifference <= oneHourInMs;
    
    console.log('canRemoveCompletion check:', {
      completionTime,
      currentTime: currentTime.toISOString(),
      timeDifference: timeDifference / 1000 / 60, // in minutes
      timeDifferenceMs: timeDifference,
      oneHourInMs,
      canRemove
    });
    
    return canRemove;
  } catch (error) {
    console.error("Error checking completion time:", error);
    return false;
  }
};
// Update the handleCheck function in FramcropCalenderwithcertificate
const handleCheck = async (i: number) => {
  const globalIndex = startIndex + i;
  const currentCrop = crops[globalIndex];
  
  // If trying to uncheck a completed task, check 1-hour restriction
  if (checked[globalIndex]) {
    const completionTime = timestamps[globalIndex];
    if (completionTime && !canRemoveCompletion(completionTime)) {
      Alert.alert(
        t("CropCalender.Cannot Remove"),
        t("CropCalender.Completion cannot be removed after 1 hour"),
        [{ text: t("Farms.okButton") }]
      );
      return;
    }
  }

  const PreviousCrop = crops[globalIndex - 1];
  const NextCrop = crops[globalIndex + 1];
  await AsyncStorage.removeItem(`uploadCompleted-${currentCrop.id}`);
  await AsyncStorage.removeItem("nextCropUpdate");

  if (globalIndex > 0 && !checked[globalIndex - 1]) {
    return;
  }

  const newStatus = checked[globalIndex] ? "pending" : "completed";

  let updateMessage = "";

  if (newStatus === "pending" && updateMessage) {
    await cancelScheduledNotification();
  }

  if (PreviousCrop && currentCrop) {
    let PreviousCropDate;
    if (new Date(PreviousCrop.createdAt) < new Date()) {
      PreviousCropDate = new Date(PreviousCrop.startingDate);
    } else {
      PreviousCropDate = new Date(PreviousCrop.createdAt);
    }

    const TaskDays = currentCrop.days;
    const CurrentDate = new Date();
    
    const nextCropUpdate = new Date(
      PreviousCropDate.getTime() + TaskDays * 24 * 60 * 60 * 1000
    );

    const nextCropUpdate2 = new Date(
      CurrentDate.getTime() + TaskDays * 24 * 60 * 60 * 1000
    );

    if (PreviousCrop) {
      const data = {
        taskID: globalIndex + 1,
        date: nextCropUpdate.toISOString(),
      };
      await AsyncStorage.setItem("nextCropUpdate", JSON.stringify(data));
    } else {
      const data = {
        taskID: globalIndex + 1,
        date: nextCropUpdate2.toISOString(),
      };
      await AsyncStorage.setItem("nextCropUpdate", JSON.stringify(data));
    }

    const remainingTime = nextCropUpdate.getTime() - CurrentDate.getTime();
    const remainingDays = Math.ceil(remainingTime / (24 * 60 * 60 * 1000));

    if (remainingDays > 0) {
      updateMessage = `${t("CropCalender.YouHave")} ${t(
        "CropCalender.daysRemaining",
        {
          date: remainingDays,
        }
      )}`;
      setUpdateError(updateMessage);
      Alert.alert(t("CropCalender.sorry"), updateMessage, [
        {
          text: t("PublicForum.OK"),
          onPress: () => {
            navigation.goBack(); 
          }
        }
      ]);
      return;
    }

    if (!updateMessage) {
      updateMessage = `${t("CropCalender.YouHave")} ${t(
        "CropCalender.daysRemaining",
        {
          date: remainingDays,
        }
      )}`;
    }
  } else {
    updateMessage = t("CropCalender.noCropData");
    setUpdateError(updateMessage);
  }

  if(currentCrop.taskIndex === 1 && newStatus === "completed"){
    const TaskDays = NextCrop.days;
    const CurrentDate = new Date();

    const nextCropUpdate2 = new Date(
      CurrentDate.getTime() + TaskDays * 24 * 60 * 60 * 1000
    );
    const data = {
      taskID: globalIndex + 1,
      date: nextCropUpdate2.toISOString(),
    };
    await AsyncStorage.setItem("nextCropUpdate", JSON.stringify(data));
  }

  try {
    const token = await AsyncStorage.getItem("userToken");
    await axios.post(
      `${environment.API_BASE_URL}api/crop/update-slave`,
      {
        id: currentCrop.id,
        status: newStatus,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const updatedChecked = [...checked];
    updatedChecked[globalIndex] = !updatedChecked[globalIndex];
    setChecked(updatedChecked);

    const updatedTimestamps = [...timestamps];
    if (updatedChecked[globalIndex]) {
      const now = moment().toISOString();
      updatedTimestamps[globalIndex] = now;
      setTimestamps(updatedTimestamps);

      await AsyncStorage.setItem(`taskTimestamp_${globalIndex}`, now);
    } else {
      updatedTimestamps[globalIndex] = "";
      setTimestamps(updatedTimestamps);

      await AsyncStorage.removeItem(`taskTimestamp_${globalIndex}`);
    }

    const newLastCompletedIndex = updatedChecked.lastIndexOf(true);
    setLastCompletedIndex(newLastCompletedIndex);

    if (currentCrop.taskIndex === 1 && newStatus === "completed") {
      await handleLocationIconPress(currentCrop);
    }
    if (globalIndex < crops.length - 1) {
      if (newStatus === "completed") {
        registerForPushNotificationsAsync();
        await scheduleDailyNotification();
      }
    }

    if (updatedChecked[globalIndex] && currentCrop.reqImages > 0) {
      setCultivatedLandModalVisible(true);
    }
  } catch (error: any) {
    if (
      error.response &&
      error.response.data.message.includes(
        "You cannot change the status back to pending after 1 hour"
      )
    ) {
      Alert.alert(
        t("CropCalender.sorry"),
        t("CropCalender.cannotChangeStatus"),
        [{ text: t("Farms.okButton") }]
      );
    } else if (
      error.response &&
      error.response.data.message.includes("You need to wait 6 hours")
    ) {
      Alert.alert(t("CropCalender.sorry"), updateMessage ,[{ text: t("Farms.okButton") }]);
    } else {
      Alert.alert(t("CropCalender.sorry"), updateMessage ,[{ text: t("Farms.okButton") }]);
    }
  }
};


  const checkTasksWithImages = async () => {
    if (crops.length === 0) return;
    
    const token = await AsyncStorage.getItem("userToken");
    if (!token) return;

    const tasksWithImagesSet = new Set<string>();

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

  useEffect(() => {
    const checkImageUploadCount = async () => {
      if (crops.length === 0) {
        return;
      }

      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
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
          if (uploadedImages < requiredImages && lastCompletedCrop.autoCompleted === 0 ) {
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
            } catch (error) {
              console.error("Error setting status to pending", error);
            }
          }
        } catch (error) {
          console.error("Error fetching uploaded image count", error);
        }
      }
    };

    checkImageUploadCount();
    checkTasksWithImages();
  }, [crops]);

  async function askForPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  }

  async function cancelScheduledNotification() {
    const storedNotificationId = await AsyncStorage.getItem("currentNotificationId");
    if (storedNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(storedNotificationId);
      await AsyncStorage.removeItem("currentNotificationId");
    }
  }

  async function scheduleDailyNotification() {
    try {
      const hasPermission = await askForPermissions();
      if (!hasPermission) {
        return;
      }

      const storedNotificationId = await AsyncStorage.getItem("currentNotificationId");

      if (storedNotificationId) {
        await Notifications.cancelScheduledNotificationAsync(storedNotificationId);
        await AsyncStorage.removeItem("currentNotificationId");
      }

      const storedData = await AsyncStorage.getItem("nextCropUpdate");
      if (storedData) {
        const asy = JSON.parse(storedData);
        const nextCropDate = new Date(asy.date);
        const trigger = new Date(asy.date);
        const taskId = asy.taskID;

        if (nextCropDate <= new Date()) {
          trigger.setDate(trigger.getDate() );
        }

        if (nextCropDate > trigger) {
          trigger.setTime(nextCropDate.getTime());
        }
        if (trigger) {
          trigger.setDate(trigger.getDate() -1 );
        }

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
          await AsyncStorage.setItem("currentNotificationId", result);
        }
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
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
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
    try {
      const cropIndex = startIndex + taskIndex;
      const crop: CropItem = crops[cropIndex];
      
      if (!crop) {
        Alert.alert(t("Farms.Error"), t("Farms.Task data not found"),[{ text: t("Farms.okButton") }]);
        return;
      }

      setLoading(true);
      
      const token = await AsyncStorage.getItem("userToken");
      
      if (!token) {
        Alert.alert(t("Farms.Error"), t("Farms.No authentication token found"),[{ text: t("Farms.okButton") }])
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${environment.API_BASE_URL}api/crop/get-task-image/${crop.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success && response.data.data && response.data.data.length > 0) {
        const images: ImageData[] = response.data.data.map((taskImage: any, index: number) => ({
          uri: taskImage.image,
          title: `Task ${crop.taskIndex} - Photo ${index + 1}`,
          description: crop.taskDescriptionEnglish,
          uploadedBy: taskImage.uploadedBy,
          createdAt: taskImage.createdAt
        }));
        
        setSelectedTaskImages(images);
        setSelectedImageIndex(0);
        setImageModalVisible(true);
      } else {
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
      }
      
    } catch (error: any) {
      console.error('Error fetching task images:', error);
      
      let errorTitle = 'Oops! Something went wrong';
      let errorMessage = 'We couldn\'t load your images right now. Please try again.';
      
      if (error.response) {
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

  const completedTasksCount = checked.filter(Boolean).length;
  const totalTasksCount = crops.length;
  const certificationProgress = totalTasksCount > 0 
    ? `${completedTasksCount}/${totalTasksCount}` 
    : "0/0";

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      {isCultivatedLandModalVisible && lastCompletedIndex !== null && (
        <CultivatedLandModal
          visible={isCultivatedLandModalVisible}
          onClose={() => setCultivatedLandModalVisible(false)}
          cropId={crops[lastCompletedIndex].id}
          farmId={farmId}
          onCulscropID={crops[0]?.onCulscropID}
          requiredImages={0}
        />
      )}

      {/* Header */}
      <View
        className="flex-row items-center justify-between bg-white"
        style={{ 
          paddingHorizontal: wp(4), 
          paddingVertical: hp(2),
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 3,
        }}
      >
        <TouchableOpacity 
          onPress={() => navigation.navigate("Main", { 
            screen: "FarmDetailsScreen",
            params: { farmId: farmId }
          })} 
        >
          <Ionicons name="chevron-back-outline" size={30} color="#374151" />
        </TouchableOpacity>
        
        <View className="flex-1 items-center">
          <Text className="text-gray-900 text-xl font-semibold">{cropName}</Text>
        </View>
        
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
            <Ionicons name="pencil" size={22} color="#374151" />
          ) : (
            <View style={{ width: 22 }} />
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={showCertificationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCertificationModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl mx-4 p-6 w-11/12 max-w-sm">
            <View className="items-center mb-4">
              <View className="bg-[#F6F7F9] rounded-lg p-3">
                <Ionicons name="warning" size={32} color="#757472ff" />
              </View>
            </View>
            
            <Text className="text-gray-600 text-center text-sm leading-5 mb-6">
              {t("CropCalender.Please complete the certification tasks to unlock the calendar tasks")}     
            </Text>
            
            <TouchableOpacity
              onPress={() => {
                setShowCertificationModal(false);
                setIsGapExpanded(true);
              }}
              className="bg-gray-900 rounded-xl py-3"
            >
              <Text className="text-white text-center font-medium text-base">
                {t("CropCalender.OK")} 
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Certificate Badge */}
      <View className="bg-white rounded-2xl pl-12">
        <View className="flex-row items-center">
          <View>
            <Image
              source={require("../../assets/images/starCertificate.png")}
              className="w-8 h-8"
              resizeMode="contain"
            />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-gray-900 font-semibold text-base">
              {certificateLoading 
                ? t("CropCalender.Loading Certificate..." )
                : certificateData 
                  ? certificateData.srtName || "GAP Certification"
                  : t("CropCalender.GAP Certification")
              }
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              {certificateLoading 
                ? t("CropCalender.CheckingValidity")
                : certificateData 
                  ? (() => {
                      const remainingMonths = calculateRemainingMonths(certificateData.expireDate);
                      if (remainingMonths === 0) {
                        return t("CropCalender.CertificateExpired");
                      } else if (remainingMonths === 1) {
                        return t("CropCalender.ValidForOneMonth");
                      } else {
                        return t("CropCalender.ValidForMonths", { months: remainingMonths });
                      }
                    })()
                  : t("CropCalender.NoActiveCertificate")
              }
            </Text>
          </View>
        </View>
      </View>

      {loading ? (
        <SkeletonLoader />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await fetchCrops();
                setRefreshing(false);
              }}
            />
          }
        >
          {/* GAP Certification Section */}
          <View className="mx-4 mt-4">
            <TouchableOpacity
              onPress={() => setIsGapExpanded(!isGapExpanded)}
              className="bg-white rounded-2xl shadow-sm border border-gray-100"
            >
              <View className="px-4 mt-4 mb-1 flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <Text className="ml-3 text-gray-900 font-medium text-base">
                    {certificateData?.srtName || "GAP Certification"}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons 
                    name={isGapExpanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#9CA3AF" 
                  />
                </View>
              </View>
              <View className="ml-5 mb-4">
                <Text className={`ml-2 font-medium text-sm ${
                  areCertificationTasksComplete ? 'text-green-700' : 'text-red-700'
                }`}>
                  {areCertificationTasksComplete 
                    ? t("CropCalender.All Completed") 
                    : t("CropCalender.Pending")
                  }
                </Text>
              </View> 
            </TouchableOpacity>

            {/* GAP Certification Questionnaire Items */}
            {isGapExpanded && (
              <View className="mt-2">
                {questionnaireItems.length > 0 ? (
                  questionnaireItems.map((item, index) => {
                    const isTickOffCompleted = item.type === 'Tick Off' && item.tickResult === 1;
                    const isPhotoProofCompleted = item.type === 'Photo Proof' && item.uploadImage !== null;
                    const isCompleted = isTickOffCompleted || isPhotoProofCompleted;
                    const isPhotoProof = item.type === 'Photo Proof';
                    const isTickOff = item.type === 'Tick Off';
                    const hasImage = item.uploadImage !== null;

                    return (
                      <View
                        key={item.id}
                        className={`mb-3 rounded-2xl shadow-sm border ${
                          isPhotoProofCompleted
                            ? 'bg-[#4B5563CC] border-gray-200'
                            : 'bg-white border-gray-200'
                        }`}
                        style={isCompleted && hasImage ? { opacity: 0.7 } : {}}
                      >
                        {/* Custom Eye Icon Overlay for completed Photo Proof tasks */}
                        {isCompleted && hasImage && (
                          <View style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: [{ translateX: -17.5 }, { translateY: -17.5 }], 
                            zIndex: 150 
                          }}>
                            <TouchableOpacity
                              onPress={() => {
                                setSelectedTaskImages([{
                                  uri: item.uploadImage!,
                                  title: `Q${item.qNo} - Photo Proof`,
                                  description: language === "si" ? item.qSinhala : language === "ta" ? item.qTamil : item.qEnglish,
                                  uploadedBy: t("ImageViewerModal.You")
                                }]);
                                setSelectedImageIndex(0);
                                setImageModalVisible(true);
                              }}
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

                        <View className="p-4">
                          {/* Question Header */}
                          <View className="flex-row items-start justify-between mb-3">
                            <View className="flex-1">
                              <Text className={`font-semibold text-base ${
                                isCompleted ? 'text-gray-600' : 'text-gray-900'
                              }`}>
                                {language === "si"
                                  ? item.qSinhala
                                  : language === "ta"
                                  ? item.qTamil
                                  : item.qEnglish}
                              </Text>
                            </View>

                            {/* Check Circle */}
                            <View className="flex-row items-center ml-3">
                              <TouchableOpacity
                                onPress={() => handleQuestionnaireCheck(item)}
                                disabled={uploadingImageForItem === item.id}
                              >
                                <View style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 14,
                                  borderWidth: 2,
                                  borderColor: isCompleted ? "#00A896" : "#00A896",
                                  backgroundColor: isCompleted ? "#00A896" : "transparent",
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}>
                                  {uploadingImageForItem === item.id ? (
                                    <ActivityIndicator size="small" color={isCompleted ? "white" : "#00A896"} />
                                  ) : (
                                    <AntDesign 
                                      name="check" 
                                      size={14} 
                                      color={isCompleted ? "white" : "#00A896"} 
                                    />
                                  )}
                                </View>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <View className="items-center">
                      <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
                      <Text className="text-gray-500 text-center mt-3">
                        {t("CropCalender.No questionnaire items available for this certificate")}  
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Calendar Tasks Section */}
          <View className="mx-4 mt-4 mb-4">
            <TouchableOpacity
              onPress={() => {
                if (!areCertificationTasksComplete) {
                  showCertificationLockAlert();
                } else {
                  setIsCalendarExpanded(!isCalendarExpanded);
                }
              }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100"
            >
              <View className="p-4 flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <Ionicons 
                    name={areCertificationTasksComplete ? "" : "lock-closed"} 
                    size={20} 
                    color={areCertificationTasksComplete ? "#374151" : "#9CA3AF"} 
                  />
                  <Text className={`ml-3 font-medium text-base `}>
                    {t("CropCalender.Calendar Tasks")}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons 
                    name={isCalendarExpanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={areCertificationTasksComplete ? "#9CA3AF" : "#D1D5DB"} 
                  />
                </View>
              </View>
            </TouchableOpacity>
            
            {isCalendarExpanded && (
              <View className="mt-2">
                {startIndex > 0 && (
                  <TouchableOpacity
                    className="py-3 px-4 flex-row items-center justify-center bg-white rounded-xl mb-2"
                    onPress={viewPreviousTasks}
                  >
                    <Ionicons name="chevron-up" size={16} color="#6B7280" />
                    <Text className="text-gray-600 font-medium ml-2">
                      {t("CropCalender.viewPrevious")}
                    </Text>
                  </TouchableOpacity>
                )}

       {currentTasks.map((crop, index) => {
  const globalIndex = startIndex + index;
  const isCompleted = checked[globalIndex];
  const isNextTask = lastCompletedIndex !== null && globalIndex === lastCompletedIndex + 1;
  const hasImages = tasksWithImages.has(crop.id);
  const canViewImages = isCompleted && hasImages;
  
  // Determine if the task can be interacted with
  const canUncheckCompleted = isCompleted && timestamps[globalIndex] && canRemoveCompletion(timestamps[globalIndex]);
  const canCheckIncomplete = !isCompleted && (globalIndex === 0 || (lastCompletedIndex !== null && globalIndex === lastCompletedIndex + 1));
  const canInteract = canUncheckCompleted || canCheckIncomplete;

  return (
    <View
      key={index}
      className={`mb-3 rounded-2xl shadow-sm border ${
        isCompleted 
          ? 'bg-[#4B5563] border-gray-200'  // Changed from transparent to solid dark gray
          : 'bg-white border-gray-100'
      }`}
      // REMOVED the opacity style that was making it transparent and unclickable
    >
      {/* Custom Eye Icon Overlay - Only show for completed tasks with images */}
      {isCompleted && hasImages && (
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

      <View className="p-4">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <Text className="text-gray-500 text-xs mb-1">
              {crop.startingDate}
            </Text>
            <Text className={`font-semibold text-base ${
              isCompleted ? 'text-white' : 'text-gray-900'  // Changed completed text to white for better contrast
            }`}>
              {language === "si"
                ? crop.taskSinhala
                : language === "ta"
                ? crop.taskTamil
                : crop.taskEnglish}
            </Text>
          </View>

          {/* Check Circle */}
          <View className="flex-row items-center ml-3">
            {isCompleted ? (
              // Completed task checkbox - ALWAYS show but conditionally make it clickable
              <TouchableOpacity
                onPress={() => canInteract ? handleCheck(index) : null}
                disabled={!canInteract}
              >
                <View style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  borderWidth: 2,
                  borderColor: canInteract ? "#00A896" : "#00A896", // Red if can uncheck, green if can't
                  backgroundColor: "#00A896",
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: hasImages ? 8 : 0,
             //     opacity: canInteract ? 1 : 0.7,
                }}>
                  <AntDesign name="check" size={14} color="white" />
                </View>
              </TouchableOpacity>
            ) : (
              // Incomplete task checkbox
              <TouchableOpacity
                onPress={() => handleCheck(index)}
                disabled={!canInteract || crop.autoCompleted === 1}
              >
                <View style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  borderWidth: 2,
                  borderColor: canInteract ? "#000" : "#D1D5DB",
                  backgroundColor: canInteract ? "#000" : "transparent",
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: canInteract ? 1 : 0.5,
                }}>
                  {canInteract && (
                    <AntDesign name="check" size={14} color="white" />
                  )}
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text className={`text-sm leading-5 mb-3 ${
          isCompleted ? 'text-gray-300' : 'text-gray-600'  // Lighter gray for completed description
        }`}>
          {language === "si"
            ? crop.taskDescriptionSinhala
            : language === "ta"
            ? crop.taskDescriptionTamil
            : crop.taskDescriptionEnglish}
        </Text>

        {/* Action buttons */}
        <View className="space-y-2">
          {crop.imageLink && (
            <TouchableOpacity
              onPress={() => crop.imageLink && Linking.openURL(crop.imageLink)}
              className={`rounded-xl p-3 ${
                isCompleted ? 'bg-gray-700' : 'bg-gray-900'  // Different background for completed
              }`}
            >
              <Text className="text-white text-center font-medium text-sm">
                {t("CropCalender.viewImage")}
              </Text>
            </TouchableOpacity>
          )}
          
          {crop.videoLinkEnglish && crop.videoLinkSinhala && crop.videoLinkTamil && (
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
              className={`rounded-xl p-3 ${
                isCompleted ? 'bg-gray-700' : 'bg-gray-900'  // Different background for completed
              }`}
              style={{ marginTop: crop.imageLink ? 8 : 0 }}
            >
              <Text className="text-white text-center font-medium text-sm">
                {t("CropCalender.viewVideo")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
})}

                {startIndex + tasksPerPage < crops.length && (
                  <TouchableOpacity
                    className="py-3 px-4 flex-row items-center justify-center bg-white rounded-xl mt-2"
                    onPress={viewNextTasks}
                  >
                    <Text className="text-gray-600 font-medium mr-2">
                      {t("CropCalender.viewMore")}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#6B7280" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      )}

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

      {/* Camera Modal */}
      <Modal
        visible={showCameraModal && !capturedImage}
        animationType="fade"
        transparent
        onRequestClose={() => {
          setShowCameraModal(false);
          setSelectedQuestion(null);
        }}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-8 items-center w-full">
            <View className="p-2 bg-[#F6F6F6] rounded-xl">
              <Ionicons name="camera" size={45} color="#000" />
            </View>

            <Text className="text-lg font-semibold mt-2 text-center">
              {t("Farms.Click a Photo")}
            </Text>

            <Text className="text-gray-500 text-center mt-2 mb-6">
              {t("Farms.Please take a photo of the completed work in the field.")}
            </Text>

            <TouchableOpacity
              onPress={() => setShowCamera(true)}
              className="bg-black rounded-3xl w-full py-3 items-center justify-center"
            >
              <Text className="text-white font-semibold text-base">
                {t("CropCalender.OpenCamera")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowCameraModal(false);
                setSelectedQuestion(null);
              }}
              className="mt-4"
            >
              <Text className="text-gray-400 text-sm">{t("Farms.Cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Camera Screen Modal */}
      <Modal visible={showCamera} animationType="slide" transparent={false}>
        <CameraScreen
          onClose={(imageUri) => {
            handleCameraClose(imageUri);
          }}
        />
      </Modal>

      {/* Image Preview Modal (after capture) */}
      {capturedImage && (
        <Modal
          visible={capturedImage !== null}
          animationType="fade"
          transparent
          onRequestClose={() => {
            setCapturedImage(null);
            setShowCameraModal(false);
          }}
        >
          <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <View className="bg-white rounded-2xl p-8 items-center w-full">
              <Text className="text-lg font-semibold mt-2 text-center">
                {t("Farms.Click a Photo")}
              </Text>

              <Image
                source={{ uri: capturedImage }}
                style={{ width: 250, height: 250, marginBottom: 20 }}
                resizeMode="contain"
                className="mt-2"
              />

              <View className="flex justify-center w-full -mt-2">
                {isButtonEnabled ? (
                  <Text className="text-center font-semibold mb-2">
                    {t("Farms.Ready To Submit")}
                  </Text>
                ) : (
                  <Text className="text-gray-600 text-center mb-2">
                    {countdown} {t("Farms.Seconds")}
                  </Text>
                )}

                <TouchableOpacity
                  onPress={() => setShowCamera(true)}
                  className="border border-black rounded-3xl py-3 items-center"
                >
                  <Text className="text-black font-semibold text-base">
                    {t("Farms.Retake Previous Photo")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSubmitPhoto}
                  className="bg-[#353535] rounded-3xl py-3 items-center mt-4"
                  disabled={uploadingImageForItem === selectedQuestion?.id || !isButtonEnabled}
                >
                  {uploadingImageForItem === selectedQuestion?.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text className="text-white font-semibold text-base">
                      {t("Farms.Submit")}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setCapturedImage(null);
                  setShowCameraModal(false);
                  setSelectedQuestion(null);
                }}
                className="mt-4"
              >
                <Text className="text-gray-400 text-sm">{t("Farms.Cancel")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default FramcropCalenderwithcertificate;