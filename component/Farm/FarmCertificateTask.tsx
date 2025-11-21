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
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useFocusEffect, useRoute, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as ImagePicker from 'expo-image-picker';
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
      Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
    }
  };

  const handleImageUploadForQuestionnaire = async (item: QuestionnaireItem) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          t("Farms.Permission Required"),
          t("Farms.Please grant permission to access your photos")
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
          Alert.alert(t("Farms.Error"), t("Farms.No authentication token found"));
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
            t("CropCalender.Image uploaded successfully")
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
      
      Alert.alert(t("Main.error"), errorMessage);
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
              <Text className="text-black text-lg font-semibold text-center">
                {farmName || "Farm Certificate"}
              </Text>
            </View>
          </View>
          <View className="w-8" />
        </View>

        {/* Certificate Info Card */}
        <View className="pb-3 mt-[-5%] px-4">
          <View className="bg-white rounded-2xl pb-3 pl-[18%] shadow-sm">
            <View className="flex-row items-center mb-3">
              <Image
                source={require("../../assets/images/starCertificate.png")}
                className="w-10 h-10"
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
            <Text className={`mt-[-4] font-medium ml-[20%] ${
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
                  ? 'bg-[#4B5563CC] border-[#4B5563CC]' // Full gray background for completed photo proof
                  : 'bg-white border-[#EFEFEF]' // Normal white background for others
              }`}
              style={{ position: 'relative' }}
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1 mr-3">
                  <Text className={`font-medium text-sm mb-1 ${
                    isPhotoProof && isCompleted && item.uploadImage 
                      ? 'text-gray-900' // White text for gray background
                      : 'text-gray-900' // Dark text for white background
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
                  {/* Image Upload/View Button for Photo Proof */}
                  {isPhotoProof && (
                    <>
                      {!isCompleted ? (
                        <TouchableOpacity
                          onPress={() => handleQuestionnaireCheck(item)}
                          disabled={uploadingImageForItem === item.id}
                          className="w-8 h-8 rounded-full items-center justify-center bg-gray-200"
                        >
                          {uploadingImageForItem === item.id ? (
                            <ActivityIndicator size="small" color="#00A896" />
                          ) : (
                            <Ionicons name="camera" size={18} color="#666" />
                          )}
                        </TouchableOpacity>
                      ) : null}
                    </>
                  )}

                  {/* Tick Mark Button */}
                  <TouchableOpacity
                    onPress={() => isTickOff ? handleQuestionnaireCheck(item) : null}
                    disabled={isPhotoProof && uploadingImageForItem === item.id}
                    className={`w-8 h-8 rounded-full items-center justify-center ${
                      isCompleted 
                        ? 'bg-[#00A896] border-2 border-[#00A896]' // Green background for completed tasks
                        : 'bg-white border-2 border-[#00A896]' // White background with green border for incomplete
                    }`}
                  >
                    {isCompleted ? (
                      <AntDesign 
                        name="check" 
                        size={18} 
                        color="white" // White tick for completed (green background)
                      />
                    ) : (
                      <AntDesign 
                        name="check" 
                        size={18} 
                        color="#00A896" // Green tick for incomplete (white background with green border)
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* View Image Icon in Center - Only for Photo Proof with uploaded image */}
              {isPhotoProof && isCompleted && item.uploadImage && (
                <View style={{
                  position: 'absolute',
                  top: '60%',
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

              {/* Action hint for incomplete tasks */}
              {!isCompleted && (
                <Text className={`text-xs mt-2 ${
                  isPhotoProof && isCompleted && item.uploadImage 
                    ? 'text-gray-300' // Light gray text for gray background
                    : 'text-gray-500' // Dark gray text for white background
                }`}>
                  {isTickOff 
                    ? t("Farms.Tap the check button to mark as complete")
                    : t("Farms.Tap the camera button to upload photo")
                  }
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>

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

           <Text className="text-black text-center  px-4 py-2 rounded-lg">
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