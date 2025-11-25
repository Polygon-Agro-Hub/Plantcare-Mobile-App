
import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
  RefreshControl,
  StatusBar,
} from "react-native";
import { Ionicons, AntDesign } from "@expo/vector-icons";

import * as ImageManipulator from 'expo-image-manipulator';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useFocusEffect, useRoute, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import moment from 'moment';
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";

interface QuestionnaireItem {
  id: number;
  slaveId: number;
  type: string;
  qNo: number;
  qEnglish: string;
  qSinhala: string;
  qTamil: string;
  tickResult: number | null;
  officerTickResult: string | null;
  uploadImage: string | null;
  officerUploadImage: string | null;
  doneDate: string | null;
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

type FarmCertificateTaskNavigationProp = NativeStackNavigationProp<RootStackParamList>;

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

const FarmCertificateTask: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<FarmCertificateTaskNavigationProp>();
  const { farmId, farmName } = route.params as { farmId: number; farmName: string };
  const { t } = useTranslation();
  
  const [certificateStatus, setCertificateStatus] = useState<CertificateStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingImageForItem, setUploadingImageForItem] = useState<number | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageTitle, setSelectedImageTitle] = useState<string>('');
  const [language, setLanguage] = useState("en");
  
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

  const fetchCertificateStatus = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert(t("Farms.Error"), t("Farms.No authentication token found"));
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

      if (response.data && response.data.length > 0) {
        const certificate = response.data[0];
        
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
      Alert.alert(t("Farms.Error"), t("Farms.Failed to fetch certificate tasks"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleQuestionnaireCheck = async (item: QuestionnaireItem) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      
      if (!token) {
        Alert.alert(t("Farms.Error"), t("Farms.No authentication token found"));
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
              t("Farms.Cannot Remove"),
              t("Farms.Completion cannot be removed after 1 hour. Please contact administrator."),
              [{ text: t("Farms.OK") }]
            );
            return;
          }
        }

        // Show confirmation to remove completion
        Alert.alert(
          t("Farms.Confirm Remove"),
          t("Farms.This will remove the completion for this task. Are you sure you want to continue?"),
          [
            { text: t("Farms.Cancel"), style: "cancel" },
            {
              text: t("Farms.OK"),
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
        // Mark as completed
        setUploadingImageForItem(item.id);
        
        await axios.put(
          `${environment.API_BASE_URL}api/certificate/update-questionnaire-item/${item.id}`,
          {
            tickResult: '1',
            type: 'tickOff'
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (certificateStatus) {
          const updatedItems = certificateStatus.questionnaireItems.map(prevItem =>
            prevItem.id === item.id
              ? { 
                  ...prevItem, 
                  tickResult: 1, 
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
        
        setUploadingImageForItem(null);
      }

    } catch (error) {
      console.error("Error updating questionnaire item:", error);
      Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
      setUploadingImageForItem(null);
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
        // Update local state immediately
        if (certificateStatus) {
          const updatedItems = certificateStatus.questionnaireItems.map(prevItem =>
            prevItem.id === item.id
              ? { 
                  ...prevItem, 
                  uploadImage: null, 
                  tickResult: null,
                  doneDate: null 
                }
              : prevItem
          );
          
          const isAllCompleted = updatedItems.every((checkItem: QuestionnaireItem) => {
            if (checkItem.type === 'Tick Off') {
              return checkItem.tickResult === 1;
            } else if (checkItem.type === 'Photo Proof') {
              return checkItem.uploadImage !== null;
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
          t("Farms.Success"),
          t("Farms.Completion removed successfully")
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
        errorMessage = t("Farms.Completion cannot be removed after 1 hour.");
      } else if (error.response?.status === 404) {
        errorMessage = t("Farms.Item not found");
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
        if (certificateStatus) {
          const updatedItems = certificateStatus.questionnaireItems.map(prevItem =>
            prevItem.id === selectedQuestion.id
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
          t("Farms.Success"),
          t("Farms.Task complete successfully!")
        );
        
        setShowCameraModal(false);
        setCapturedImage(null);
        setSelectedQuestion(null);
      }

    } catch (error: any) {
      console.error("Error uploading questionnaire image:", error);
      
      let errorMessage = t("Main.somethingWentWrong");
      if (error.response?.status === 413) {
        errorMessage = t("Farms.Image file is too large. Please try with a smaller image.");
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = t("Farms.Upload timeout. Please try again.");
      }
      
      Alert.alert(t("Main.error"), errorMessage);
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

  const handleViewUploadedImage = (item: QuestionnaireItem) => {
    if (item.uploadImage) {
      setSelectedImage(item.uploadImage);
      setSelectedImageTitle(`Q${item.qNo} - ${item.type}`);
      setImageModalVisible(true);
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchCertificateStatus();
  };

  useFocusEffect(
    useCallback(() => {
      fetchCertificateStatus();
      setLanguage("en");
    }, [farmId])
  );

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
        <Text className="text-gray-500 mt-2">{t("Farms.Loading certificate tasks")}</Text>
      </View>
    );
  }

  if (!certificateStatus) {
    return (
      <View className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        
        <View className="flex-row items-center px-4 py-4 border-b border-gray-200">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold ml-4">
            {t("Farms.Certificate Tasks")}
          </Text>
        </View>

        <View className="flex-1 justify-center items-center p-5">
          <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
          <Text className="text-gray-500 text-center mt-4 text-lg">
            {t("Farms.No certification tasks available")}
          </Text>
          <Text className="text-gray-400 text-center mt-2">
            {t("Farms.There are no certificate tasks for this farm")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F7F7F7]">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View className="bg-white">
        <View className="flex-row items-center justify-between px-6 pb-2 py-3">
          <View className="flex-row items-center justify-between mb-2">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <AntDesign 
                name="left" 
                size={24} 
                color="#000502" 
                style={{ 
                  paddingHorizontal: wp(3), 
                  paddingVertical: hp(1.5), 
                  backgroundColor: "#fff", 
                  borderRadius: 50 
                }}
              />
            </TouchableOpacity>
            <View className="flex-1 items-center">
              <Text className="text-black text-lg font-semibold text-center mr-5">
                {farmName || "Farm Certificate"}
              </Text>
            </View>
          </View>
          <View className="w-8" />
        </View>

        {/* Certificate Info Card */}
        <View className="pb-3 mt-[-3%] px-4">
          <View className="bg-white rounded-2xl pb-3 pl-[12%] shadow-sm">
            <View className="flex-row items-center mb-3">
              <Image
                source={require("../../assets/images/starCertificate.png")}
                className="w-12 h-14"
                resizeMode="contain"
              />
              <View className="ml-3 flex-1">
                <Text className="text-gray-900 font-semibold text-base">
                  {certificateStatus.srtName}
                </Text>
                <Text className="text-gray-600 text-sm mt-1">
                  {t("Farms.Valid for next")} {calculateRemainingMonths(certificateStatus.expireDate)} {t("Farms.months")}
                </Text>
              </View>
            </View>
            <Text className={`mt-[-4] font-medium ml-[22%] ${
              certificateStatus.isAllCompleted ? 'text-green-700' : 'text-[#FF0000]'
            }`}>
              {certificateStatus.isAllCompleted 
                ? t("Farms.All Completed") 
                : t("Farms.Pending")
              }
            </Text>
          </View>
        </View>
      </View>

      {/* Tasks List */}
      <ScrollView
        className="flex-1 mt-5"
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {certificateStatus.questionnaireItems.map((item) => {
          const isCompleted = 
            (item.type === 'Tick Off' && item.tickResult === 1) ||
            (item.type === 'Photo Proof' && item.uploadImage !== null);
          
          const isTickOff = item.type === 'Tick Off';
          const isPhotoProof = item.type === 'Photo Proof';

          return (
            <View
              key={item.id}
              className={`rounded-2xl p-4 mb-3 border shadow-sm ${
                isPhotoProof && isCompleted && item.uploadImage 
                  ? 'bg-[#4B5563CC] border-[#4B5563CC]'
                  : 'bg-white border-[#EFEFEF]'
              }`}
              style={{ position: 'relative' }}
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1 mr-3">
                  <Text className={`font-medium text-sm mb-1 ${
                    isPhotoProof && isCompleted && item.uploadImage 
                      ? 'text-gray-900'
                      : 'text-gray-900'
                  }`}>
                    {language === "si" 
                      ? item.qSinhala 
                      : language === "ta" 
                      ? item.qTamil 
                      : item.qEnglish}
                  </Text>
                </View>
                
                {/* Action Button - Right Side */}
                <View className="flex-row items-center gap-2">
                  {/* Tick Mark Button */}
                  <TouchableOpacity
                    onPress={() => handleQuestionnaireCheck(item)}
                    disabled={uploadingImageForItem === item.id}
                    className={`w-8 h-8 rounded-full items-center justify-center ${
                      isCompleted 
                        ? 'bg-[#00A896] border-2 border-[#00A896]'
                        : 'bg-white border-2 border-[#00A896]'
                    }`}
                  >
                    {uploadingImageForItem === item.id ? (
                      <ActivityIndicator size="small" color={isCompleted ? "white" : "#00A896"} />
                    ) : isCompleted ? (
                      <AntDesign 
                        name="check" 
                        size={18} 
                        color="white"
                      />
                    ) : (
                      <AntDesign 
                        name="check" 
                        size={18} 
                        color="#00A896"
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* View Image Icon in Center - Only for Photo Proof with uploaded image */}
              {isPhotoProof && isCompleted && item.uploadImage && (
                <View style={{
                  position: 'absolute',
                  top: '80%',
                  left: '50%',
                  transform: [{ translateX: -17.5 }, { translateY: -17.5 }],
                  zIndex: 150,
                }}>
                  <TouchableOpacity
                    onPress={() => handleViewUploadedImage(item)}
                  >
                    <Image
                      source={require('../../assets/images/viewimage.png')}
                      style={{
                        width: 30,
                        height: 30,
                      }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

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
              <Text className="text-gray-400 text-sm">Cancel</Text>
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

      {/* Image Viewer Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View className="flex-1 bg-[#FFFFFF] justify-center items-center">
          <TouchableOpacity 
            onPress={() => setImageModalVisible(false)}
            className="absolute top-10 right-5 z-10 bg-black/50 rounded-full p-2"
          >
            <Ionicons name="close" size={20} color="white" />
          </TouchableOpacity>

          <Text className="text-black text-center px-4 py-2 rounded-lg">
            {t("Farms.Uploaded")}
          </Text>
          
          {selectedImage && (
            <Image 
              source={{ uri: selectedImage }} 
              className="w-full h-2/3" 
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

export default FarmCertificateTask;