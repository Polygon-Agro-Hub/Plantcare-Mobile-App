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
  BackHandler,
} from "react-native";
import { Ionicons, AntDesign, Entypo } from "@expo/vector-icons";
import * as ImageManipulator from "expo-image-manipulator";
import {
  useFocusEffect,
  useRoute,
  useNavigation,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import moment from "moment";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import CustomHeader from "../../common/CustomHeader";
import LoadingPage from "@/component/common/LoadingPage";

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
  srtNameSinhala?: string;
  srtNameTamil?: string;
  expireDate: string;
  questionnaireItems: QuestionnaireItem[];
  isValid: boolean;
  isAllCompleted: boolean;
  slaveQuestionnaireId: number;
  paymentId: number;
  certificateId: number;
}

type FarmCertificateTaskNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

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
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <CameraView
        style={{ flex: 1 }}
        facing={facing}
        ref={(ref) => setCamera(ref)}
        onCameraReady={() => setIsCameraReady(true)}
      />

      {/* Back Button - closes camera and returns to the previous popup */}
      <TouchableOpacity
        onPress={() => onClose(null)}
        style={{
          position: "absolute",
          top: 50,
          left: 20,
          zIndex: 1000,
          backgroundColor: "rgba(0,0,0,0.5)",
          borderRadius: 20,
          width: 40,
          height: 40,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Entypo name="chevron-left" size={24} color="white" />
      </TouchableOpacity>

      <View
        style={{
          position: "absolute",
          bottom: 50,
          left: 0,
          right: 0,
          flexDirection: "row",
          justifyContent: "center",
          paddingHorizontal: 24,
          gap: 16,
          zIndex: 1000,
        }}
      >
        <TouchableOpacity
          onPress={toggleCameraFacing}
          style={{
            backgroundColor: "#2AAD7A",
            padding: 16,
            borderRadius: 50,
            marginBottom: 12,
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "black", textAlign: "center" }}>
            {t("CropCalender.FlipCamera")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={captureImage}
          style={{
            backgroundColor: "#2AAD7A",
            padding: 16,
            borderRadius: 50,
            marginBottom: 12,
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{ color: "black", fontWeight: "600", textAlign: "center" }}
          >
            {t("CropCalender.Capture")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const FarmCertificateTask: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<FarmCertificateTaskNavigationProp>();

  const { farmId, farmName, slaveQuestionnaireId } = route.params as {
    farmId: number;
    farmName: string;
    slaveQuestionnaireId: number;
    srtName?: string;
    srtNameSinhala?: string;
    srtNameTamil?: string;
  };
  const { t } = useTranslation();

  const [certificateStatus, setCertificateStatus] =
    useState<CertificateStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingImageForItem, setUploadingImageForItem] = useState<
    number | null
  >(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [language, setLanguage] = useState("en");

  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedQuestion, setSelectedQuestion] =
    useState<QuestionnaireItem | null>(null);
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
        Alert.alert(t("Main.Error"), t("Farms.NoAuthenticationTokenFound"));
        return;
      }

      const currentLanguage = t("Main.LNG");
      setLanguage(currentLanguage);

      const response = await axios.get(
        `${environment.API_BASE_URL}api/certificate/get-farmcertificatetask/${farmId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data && response.data.length > 0) {
        const certificate = response.data.find(
          (cert: any) => cert.slaveQuestionnaireId === slaveQuestionnaireId,
        );

        if (!certificate) {
          console.error(
            "Certificate not found with slaveQuestionnaireId:",
            slaveQuestionnaireId,
          );
          Alert.alert(t("Main.Error"), t("Farms.Certificate not found"));
          setCertificateStatus(null);
          return;
        }

        const isAllCompleted = certificate.questionnaireItems.every(
          (item: QuestionnaireItem) => {
            if (item.type === "Tick Off") {
              return item.tickResult === 1;
            } else if (item.type === "Photo Proof") {
              return item.uploadImage !== null;
            }
            return true;
          },
        );

        const certificateStatus: CertificateStatus = {
          srtName: certificate.srtName || "GAP Certification",
          srtNameSinhala: certificate.srtNameSinhala || certificate.srtName,
          srtNameTamil: certificate.srtNameTamil || certificate.srtName,
          expireDate: certificate.expireDate,
          questionnaireItems: certificate.questionnaireItems || [],
          isValid: moment(certificate.expireDate).isAfter(),
          isAllCompleted: isAllCompleted,
          slaveQuestionnaireId: certificate.slaveQuestionnaireId,
          paymentId: certificate.paymentId,
          certificateId: certificate.slaveQuestionnaireId,
        };

        setCertificateStatus(certificateStatus);
      } else {
        setCertificateStatus(null);
      }
    } catch (err) {
      console.error("Error fetching certificate status:", err);
      Alert.alert(t("Main.Error"), t("Farms.FailedToFetchCertificateTasks"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleQuestionnaireCheck = async (item: QuestionnaireItem) => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert(t("Main.Error"), t("Farms.NoAuthenticationTokenFound"));
        return;
      }

      const isCompleted =
        (item.type === "Tick Off" && item.tickResult === 1) ||
        (item.type === "Photo Proof" && item.uploadImage !== null);

      if (isCompleted) {
        // If doneDate is missing on an already-completed item, we can't verify
        // when it was completed, so default to locked (cannot remove) instead
        // of allowing an unrestricted unclick. This keeps Tick Off items
        // consistent with Photo Proof items after a refetch from the server.
        if (!item.doneDate) {
          Alert.alert(
            t("Farms.CannotRemove"),
            t("Farms.CompletionCannotBeRemovedAfter1Hour"),
            [{ text: t("Main.OK") }],
          );
          return;
        }

        const sriLankaOffset = 5.5 * 60 * 60 * 1000;
        const currentTime = Date.now();
        const storedTime = new Date(item.doneDate).getTime();

        let timeDifferenceRaw = currentTime - storedTime;

        let completionTime = storedTime;
        let needsAdjustment = false;

        if (timeDifferenceRaw < 0 || timeDifferenceRaw > 4 * 60 * 60 * 1000) {
          completionTime = storedTime - sriLankaOffset;
          needsAdjustment = true;
        }

        const timeDifference = currentTime - completionTime;
        const oneHourInMs = 60 * 60 * 1000;

        if (timeDifference > oneHourInMs) {
          Alert.alert(
            t("Farms.CannotRemove"),
            t("Farms.CompletionCannotBeRemovedAfter1Hour"),
            [{ text: t("Main.OK") }],
          );
          return;
        }

        Alert.alert(
          t("Farms.ConfirmRemove"),
          t(
            "Farms.ThisWillRemoveTheCompletionForThisTaskAreYouSureYouWantToContinue",
          ),
          [
            { text: t("Main.Cancel"), style: "cancel" },
            {
              text: t("Main.OK"),
              onPress: async () => {
                await handleRemoveCompletion(item);
              },
            },
          ],
        );
        return;
      }

      if (item.type === "Photo Proof") {
        setSelectedQuestion(item);
        setShowCameraModal(true);
        return;
      }

      if (item.type === "Tick Off") {
        setUploadingImageForItem(item.id);

        await axios.put(
          `${environment.API_BASE_URL}api/certificate/update-questionnaire-item/${item.id}`,
          {
            tickResult: "1",
            type: "tickOff",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (certificateStatus) {
          const updatedItems = certificateStatus.questionnaireItems.map(
            (prevItem) =>
              prevItem.id === item.id
                ? {
                    ...prevItem,
                    tickResult: 1,
                    doneDate: new Date().toISOString(),
                  }
                : prevItem,
          );

          const isAllCompleted = updatedItems.every(
            (item: QuestionnaireItem) => {
              if (item.type === "Tick Off") {
                return item.tickResult === 1;
              } else if (item.type === "Photo Proof") {
                return item.uploadImage !== null;
              }
              return true;
            },
          );

          setCertificateStatus({
            ...certificateStatus,
            questionnaireItems: updatedItems,
            isAllCompleted: isAllCompleted,
          });
        }

        Alert.alert(t("Main.Success"), t("Farms.TaskCompleteSuccessfully"));

        setUploadingImageForItem(null);
      }
    } catch (error) {
      console.error("Error updating questionnaire item:", error);
      Alert.alert(
        t("Main.Error"),
        t("Main.SomethingWentWrongPleaseTryAgainlater"),
      );
      setUploadingImageForItem(null);
    }
  };

  const handleRemoveCompletion = async (item: QuestionnaireItem) => {
    setUploadingImageForItem(item.id);

    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert(t("Main.Error"), t("Farms.NoAuthenticationTokenFound"));
        setUploadingImageForItem(null);
        return;
      }

      const response = await axios.delete(
        `${environment.API_BASE_URL}api/certificate/questionnaire-item/remove/${item.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data && response.data.success) {
        if (certificateStatus) {
          const updatedItems = certificateStatus.questionnaireItems.map(
            (prevItem) =>
              prevItem.id === item.id
                ? {
                    ...prevItem,
                    uploadImage: null,
                    tickResult: null,
                    doneDate: null,
                  }
                : prevItem,
          );

          const isAllCompleted = updatedItems.every(
            (checkItem: QuestionnaireItem) => {
              if (checkItem.type === "Tick Off") {
                return checkItem.tickResult === 1;
              } else if (checkItem.type === "Photo Proof") {
                return checkItem.uploadImage !== null;
              }
              return true;
            },
          );

          setCertificateStatus({
            ...certificateStatus,
            questionnaireItems: updatedItems,
            isAllCompleted: isAllCompleted,
          });
        }

        Alert.alert(
          t("Main.Success"),
          t("Farms.CompletionRemovedSuccessfully"),
        );
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      console.error("Error removing completion:", error);
      console.error("Error response:", error.response?.data);

      let errorMessage = t("Main.SomethingWentWrongPleaseTryAgainlater");
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 403) {
        errorMessage = t("Farms.CompletionCannotBeRemovedAfter1Hour");
      } else if (error.response?.status === 404) {
        errorMessage = t("Farms.Item not found");
      }

      Alert.alert(t("Main.Error"), errorMessage);
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
        Alert.alert(t("Main.Error"), t("Farms.NoAuthenticationTokenFound"));
        setUploadingImageForItem(null);
        return;
      }

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
        },
      );

      const fileName = `questionnaire_${selectedQuestion.id}_${Date.now()}.jpg`;
      const fileType = "image/jpeg";

      const formData = new FormData();
      formData.append("image", {
        uri: manipulatedImage.uri,
        type: fileType,
        name: fileName,
      } as any);
      formData.append("itemId", selectedQuestion.id.toString());
      formData.append("slaveId", selectedQuestion.slaveId.toString());
      formData.append("farmId", farmId.toString());

      const response = await axios.post(
        `${environment.API_BASE_URL}api/certificate/questionnaire-item/upload-image/${selectedQuestion.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000,
        },
      );

      if (response.data.success) {
        if (certificateStatus) {
          const updatedItems = certificateStatus.questionnaireItems.map(
            (prevItem) =>
              prevItem.id === selectedQuestion.id
                ? {
                    ...prevItem,
                    uploadImage: response.data.imageUrl,
                    doneDate: new Date().toISOString(),
                  }
                : prevItem,
          );

          const isAllCompleted = updatedItems.every(
            (item: QuestionnaireItem) => {
              if (item.type === "Tick Off") {
                return item.tickResult === 1;
              } else if (item.type === "Photo Proof") {
                return item.uploadImage !== null;
              }
              return true;
            },
          );

          setCertificateStatus({
            ...certificateStatus,
            questionnaireItems: updatedItems,
            isAllCompleted: isAllCompleted,
          });
        }

        Alert.alert(t("Main.Success"), t("Farms.TaskCompleteSuccessfully"));

        setShowCameraModal(false);
        setCapturedImage(null);
        setSelectedQuestion(null);
      }
    } catch (error: any) {
      console.error("Error uploading questionnaire image:", error);

      let errorMessage = t("Main.SomethingWentWrongPleaseTryAgainlater");
      if (error.response?.status === 413) {
        errorMessage = t(
          "Farms.Image file is too large. Please try with a smaller image.",
        );
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === "ECONNABORTED") {
        errorMessage = t("Farms.Upload timeout. Please try again.");
      }

      Alert.alert(t("Main.Error"), errorMessage);
    } finally {
      setUploadingImageForItem(null);
    }
  };

  const handleCameraClose = (imageUri: string | null) => {
    setShowCamera(false);
    if (imageUri) {
      setCapturedImage(imageUri);
      setShowCameraModal(true);
    }
  };

  const handleViewUploadedImage = (item: QuestionnaireItem) => {
    if (item.uploadImage) {
      setSelectedImage(item.uploadImage);

      setImageModalVisible(true);
    }
  };

  const calculateRemainingTime = (
    expireDate: string,
  ): { months: number; days: number } => {
    try {
      const today = moment();
      const expiry = moment(expireDate);

      if (expiry.isBefore(today)) {
        return { months: 0, days: 0 };
      }

      const remainingMonths = expiry.diff(today, "months");
      const monthsDate = today.clone().add(remainingMonths, "months");
      const remainingDays = expiry.diff(monthsDate, "days");

      return {
        months: remainingMonths,
        days: remainingDays,
      };
    } catch (error) {
      console.error("Error calculating remaining time:", error);
      return { months: 0, days: 0 };
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCertificateStatus();
  };

  useFocusEffect(
    useCallback(() => {
      fetchCertificateStatus();
      const currentLanguage = t("Main.LNG");
      setLanguage(currentLanguage);
    }, [farmId, slaveQuestionnaireId]),
  );

  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        navigation.navigate("Main", {
          screen: "FarmDetailsScreen",
          params: { farmId: farmId },
        });
        return true;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackPress,
      );
      return () => subscription.remove();
    }, [navigation]),
  );

  if (loading) {
    return <LoadingPage fullScreen />;
  }

  if (!certificateStatus) {
    return (
      <View className="flex-1 bg-white">
        <CustomHeader
          title={t("Farms.Certificate Tasks")}
          navigation={navigation as any}
          onBackPress={() => navigation.goBack()}
        />

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
      {/* Header */}
      <View className="bg-white">
        <CustomHeader
          title={farmName || "Farm Certificate"}
          navigation={navigation as any}
          onBackPress={() => navigation.goBack()}
        />

        {/* Certificate Info Card */}
        <View className="pb-3 mt-[-3%] px-6">
          <View className="bg-white rounded-2xl p-4">
            <View className="flex-row items-center">
              <Image
                source={require("../../../assets/images/farms/star-certificate.webp")}
                className="w-16 h-20"
                resizeMode="contain"
              />
              <View className="ml-3 flex-1">
                <Text className="text-gray-900 font-semibold text-base">
                  {language === "si" && certificateStatus.srtNameSinhala
                    ? certificateStatus.srtNameSinhala
                    : language === "ta" && certificateStatus.srtNameTamil
                      ? certificateStatus.srtNameTamil
                      : certificateStatus.srtName}
                </Text>
                {(() => {
                  const time = calculateRemainingTime(
                    certificateStatus.expireDate,
                  );

                  if (time.months === 0 && time.days === 0) {
                    return (
                      <Text className="text-red-600 text-sm mt-1 font-medium">
                        {t("Farms.CertificateHasExpired")}
                      </Text>
                    );
                  } else {
                    let validityText = t("Farms.ValidFor") + " ";

                    if (time.months > 0) {
                      validityText += `${time.months} ${
                        time.months === 1 ? t("Farms.Month") : t("Farms.Months")
                      }`;
                    }

                    if (time.days > 0) {
                      if (time.months > 0) {
                        validityText += " ";
                      }
                      validityText += `${time.days} ${
                        time.days === 1 ? t("Farms.Day") : t("Farms.Days")
                      }`;
                    }

                    return (
                      <Text className="text-gray-600 text-sm mt-1">
                        {validityText}
                      </Text>
                    );
                  }
                })()}
                <Text
                  className={`mt-1 font-medium ${
                    certificateStatus.isAllCompleted
                      ? "text-green-700"
                      : "text-[#FF0000]"
                  }`}
                >
                  {certificateStatus.isAllCompleted
                    ? t("Farms.AllCompleted")
                    : t("Farms.Pending")}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
      {/* Tasks List */}
      <ScrollView
        className="flex-1 mt-5 px-6"
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {certificateStatus.questionnaireItems.map((item) => {
          const isCompleted =
            (item.type === "Tick Off" && item.tickResult === 1) ||
            (item.type === "Photo Proof" && item.uploadImage !== null);

          const isTickOff = item.type === "Tick Off";
          const isPhotoProof = item.type === "Photo Proof";

          return (
            <View
              key={item.id}
              className={`rounded-2xl p-4 mb-3 border shadow-sm ${
                isPhotoProof && isCompleted && item.uploadImage
                  ? "bg-[#4B5563CC] border-[#4B5563CC]"
                  : "bg-white border-[#EFEFEF]"
              }`}
              style={{
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
              }}
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1 mr-3">
                  <Text
                    className={`font-medium text-sm mb-1 ${
                      isPhotoProof && isCompleted && item.uploadImage
                        ? "text-gray-900"
                        : "text-gray-900"
                    }`}
                  >
                    {language === "si"
                      ? item.qSinhala
                      : language === "ta"
                        ? item.qTamil
                        : item.qEnglish}
                  </Text>
                </View>

                {/* Action Button - Right Side */}
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    onPress={() => handleQuestionnaireCheck(item)}
                    disabled={uploadingImageForItem === item.id}
                    className={`w-8 h-8 rounded-full items-center justify-center ${
                      isCompleted
                        ? "bg-[#00A896] border-2 border-[#00A896]"
                        : "bg-white border-2 border-[#00A896]"
                    }`}
                  >
                    {uploadingImageForItem === item.id ? (
                      <ActivityIndicator
                        size="small"
                        color={isCompleted ? "white" : "#00A896"}
                      />
                    ) : isCompleted ? (
                      <AntDesign name="check" size={18} color="white" />
                    ) : (
                      <AntDesign name="check" size={18} color="#00A896" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {isPhotoProof && isCompleted && item.uploadImage && (
                <View
                  pointerEvents="box-none"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: [{ translateX: -15 }, { translateY: -15 }],
                    zIndex: 150,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => handleViewUploadedImage(item)}
                    style={{ padding: 5 }}
                  >
                    <Image
                      source={require("../../../assets/images/crop-cultivation/viewimage.webp")}
                      style={{ width: 30, height: 30 }}
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
        visible={showCameraModal && !showCamera && !capturedImage}
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
              {t("Farms.ClickAPhoto")}
            </Text>

            <Text className="text-gray-500 text-center mt-2 mb-6">
              {t("Farms.PleaseTakeAPhotoOfTheCompletedWorkInTheField.")}
            </Text>

            <TouchableOpacity
              onPress={() => setShowCamera(true)}
              className="bg-black py-2 px-6 rounded-full h-[50px] items-center justify-center w-full"
            >
              <Text className="text-white text-base">
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
            <View className="bg-white rounded-2xl p-6 shadow-lg items-center w-full">
              <Text className="text-lg font-semibold mb-2">
                {t("CropCalender.ImagePreview")}
              </Text>

              <Image
                source={{ uri: capturedImage }}
                style={{ width: 250, height: 250, marginBottom: 20 }}
                resizeMode="contain"
                className="mt-2"
              />

              <View className="gap-4 w-full">
                {isButtonEnabled ? (
                  <Text className="text-center font-semibold">
                    {t("Farms.ReadyToSubmit")}
                  </Text>
                ) : (
                  <Text className="text-gray-600 text-center text-lg">
                    {countdown} {t("Farms.Seconds")}
                  </Text>
                )}

                <TouchableOpacity
                  onPress={handleSubmitPhoto}
                  className={`py-2 px-6 rounded-full h-[50px] items-center justify-center ${
                    isButtonEnabled ? "bg-[#353535]" : "bg-gray-400"
                  }`}
                  disabled={
                    uploadingImageForItem === selectedQuestion?.id ||
                    !isButtonEnabled
                  }
                >
                  {uploadingImageForItem === selectedQuestion?.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text className="text-white text-base text-center">
                      {t("Farms.Submit")}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowCamera(true)}
                  className="border-2 border-black bg-white py-2 px-6 rounded-full h-[50px] items-center justify-center"
                >
                  <Text className="text-black text-base text-center">
                    {t("Farms.RetakePreviousPhoto")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setCapturedImage(null);
                    setShowCameraModal(false);
                    setSelectedQuestion(null);
                  }}
                  className="items-center mt-2"
                >
                  <Text className="text-gray-400 text-sm">
                    {t("Main.Cancel")}
                  </Text>
                </TouchableOpacity>
              </View>
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
            {t("Farms.UploadedByYou")}
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
