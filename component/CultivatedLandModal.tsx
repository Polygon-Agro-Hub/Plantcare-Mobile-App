import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  AppState,
  AppStateStatus 
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import axios from "axios";
import { environment } from "@/environment/environment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import * as ImageManipulator from 'expo-image-manipulator';

interface CultivatedLandModalProps {
  visible: boolean;
  onClose: (success?: boolean) => void; // Updated interface
  cropId: string;
  farmId: number;
  onCulscropID: number;
  requiredImages: number;
  onUploadSuccess?: () => void;
}

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
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const selectedLanguage = t("CropCalender.LNG");
    setLanguage(selectedLanguage);
  }, [t]);

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

export default function CultivatedLandModal({
  visible,
  onClose,
  cropId,
  farmId,
  onCulscropID,
  onUploadSuccess,
}: CultivatedLandModalProps) {
  const [requiredImages, setRequiredImages] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [appState, setAppState] = useState("active");

  useEffect(() => {
    if (visible) {
      if (!cropId || cropId === "" || cropId === "undefined") {
        console.error("❌ CultivatedLandModal: Invalid cropId:", cropId);
        Alert.alert(
          t("Main.error"),
          t("CropCalender.Invalid crop data. Please try again."),
          [{
            text: t("PublicForum.OK"),
            onPress: () => {
              setLoading(false);
              onClose(); // Fixed: removed argument
            }
          }]
        );
        return;
      }

      if (!farmId || farmId === 0) {
        console.error("❌ CultivatedLandModal: Invalid farmId:", farmId);
        Alert.alert(
          t("Main.error"),
          t("CropCalender.Invalid farm data. Please try again."),
          [{
            text: t("PublicForum.OK"),
            onPress: () => {
              setLoading(false);
              onClose(); // Fixed: removed argument
            }
          }]
        );
        return;
      }

      if (!onCulscropID || onCulscropID === 0) {
        console.error("❌ CultivatedLandModal: Invalid onCulscropID:", onCulscropID);
        Alert.alert(
          t("Main.error"),
          t("CropCalender.Invalid cultivation data. Please try again."),
          [{
            text: t("PublicForum.OK"),
            onPress: () => {
              setLoading(false);
              onClose(); // Fixed: removed argument
            }
          }]
        );
        return;
      }
    }
  }, [visible, cropId, farmId, onCulscropID]);

  useEffect(() => {
    if (capturedImage) {
      setIsButtonEnabled(false); 
      setCountdown(3); 

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval); 
            setIsButtonEnabled(true); 
            return 0; 
          }
          return prev - 1; 
        });
      }, 1000);

      return () => clearInterval(interval); 
    }
  }, [capturedImage]);

  useEffect(() => {
    if (visible) {
      fetchRequiredImages();
    }
  }, [visible]);

  const fetchRequiredImages = async () => {
    if (!cropId || cropId === "" || cropId === "undefined") {
      console.error("fetchRequiredImages: Invalid cropId");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${environment.API_BASE_URL}api/auth/calendar-tasks/requiredimages/${cropId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000
        }
      );
      
      setRequiredImages(response.data.requiredImages || 0);
      
      if (response.data.requiredImages === 0) {
        console.log("⚠️ No images required for this task");
        onClose(true); // This is correct - passing boolean for success
      }
      
    } catch (error: any) {
      console.error("❌ Error fetching required images:", error);
      
      let errorMessage = t("Main.somethingWentWrong");
      
      if (error.response?.status === 404) {
        errorMessage = t("CropCalender.Task not found. Please try again.");
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message === "No authentication token found") {
        errorMessage = t("CropCalender.Please log in again.");
      }
      
      Alert.alert(
        t("Main.error"), 
        errorMessage,
        [{
          text: t("PublicForum.OK"),
          onPress: () => onClose() // Fixed: removed argument
        }]
      );
    } finally {
      setLoading(false);
    }
  };

  const resizeImage = async (imageUri: string) => {
    const manipResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 800 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipResult.uri;
  };

  const handleCameraClose = (imageUri: string | null) => {
    setShowCamera(false);
    if (imageUri) {
      setCapturedImage(imageUri);
    }
  };

  const storeUploadProgress = async (step: number) => {
    if (!cropId) return;
    try {
      await AsyncStorage.setItem(`uploadProgress-${cropId}`, step.toString());
    } catch (error) {
      console.error("Error storing upload progress:", error);
    }
  };

  const retrieveUploadProgress = async () => {
    if (!cropId) return 0;
    try {
      const storedProgress = await AsyncStorage.getItem(`uploadProgress-${cropId}`);
      return storedProgress ? parseInt(storedProgress, 10) : 0;
    } catch (error) {
      console.error("Error retrieving upload progress:", error);
      return 0;
    }
  };

  useEffect(() => {
    if (visible) {
      checkUploadCompletion();
      fetchRequiredImages();
      const loadProgress = async () => {
        const progress = await retrieveUploadProgress();
        setCurrentStep(progress);
      };
      loadProgress();
      checkUploadCompletion();
    }
  }, [visible]);

  const uploadImage = async (imageUri: string) => {
    setLoading(true);
    const maxRetries = 3;
    let attempt = 0;
    let success = false;

    const resizedImageUri = await resizeImage(imageUri);

    while (attempt < maxRetries && !success) {
      try {
        attempt++;
        console.log(`Upload attempt ${attempt} for image: ${resizedImageUri}`);

        const fileName = resizedImageUri.split("/").pop();
        const fileType = fileName?.split(".").pop() ? `image/${fileName.split(".").pop()}` : "image/jpeg";

        const formData = new FormData();
        formData.append("image", {
          uri: resizedImageUri,
          name: fileName,
          type: fileType,
        } as any);
        formData.append("slaveId", cropId);
        formData.append("farmId", farmId.toString())
        formData.append("onCulscropID", onCulscropID.toString())
        const token = await AsyncStorage.getItem("userToken");
        const response = await axios.post(
          `${environment.API_BASE_URL}api/auth/calendar-tasks/upload-image`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
            timeout: 60000,
          }
        );

        setCurrentStep((prevStep) => {
          const nextStep = prevStep + 1;

          if (nextStep === requiredImages) {
            // Call onUploadSuccess callback when all images are uploaded
            if (onUploadSuccess) {
              onUploadSuccess();
            }
            
            Alert.alert(t("CropCalender.Success"), t("CropCalender.TaskSuccessMessage"), [{ text: t("PublicForum.OK") }]);
            
            onClose(true); // Passing true for success
            AsyncStorage.setItem(`uploadCompleted-${cropId}`, "true");
            clearUploadProgress();
          }

          storeUploadProgress(nextStep);
          return nextStep;
        });

        setCapturedImage(null);
        setLoading(false);
        success = true;
      } catch (error) {
        console.error(`Upload attempt ${attempt} failed:`, error);

        if (attempt >= maxRetries) {
          Alert.alert(t("Main.error"), t("CropCalender.UploadRetryFailed"), [{ text: t("PublicForum.OK") }]);
          setLoading(false);
          await markTaskAsIncomplete();
          setCurrentStep(0);
          setCapturedImage(null);
          return;
        }
      }
    }
  };

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState.match(/inactive|background/)) {
        markTaskAsIncomplete(); 
      }
      setAppState(nextAppState);
    };
  
    if (visible) {
      const appStateListener = AppState.addEventListener(
        'change',
        handleAppStateChange
      );
      return () => {
        appStateListener.remove(); 
      };
    }
  
    return undefined; 
  }, [visible, cropId]);

  const markTaskAsIncomplete = async () => {
    if (!cropId) {
      console.error("Cannot mark task as incomplete: cropId is undefined");
      return;
    }
    
    try {
      const token = await AsyncStorage.getItem("userToken");
      await axios.post(
        `${environment.API_BASE_URL}api/crop/update-slave`,
        {
          id: cropId,
          status: "pending",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error marking task as incomplete:", error);
    }
  };

  const checkUploadCompletion = async () => {
    if (!cropId) return;
    try {
      await clearUploadProgress();
      const uploadCompleted = await AsyncStorage.getItem(`uploadCompleted-${cropId}`);
    } catch (error) {
      console.error("Error checking upload completion:", error);
    }
  };

  const clearUploadProgress = async () => {
    if (!cropId) return;
    try {
      await AsyncStorage.removeItem(`uploadProgress-${cropId}`);
    } catch (error) {
      console.error("Error clearing upload progress:", error);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setShowCamera(true);
  };

  if (loading) {
    return (
      <Modal transparent={true} visible={visible} animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50">
          <ActivityIndicator size="large" color="#ffffff" />
          <Text className="text-white mt-4">{t("CropCalender.Loading")}</Text>
        </View>
      </Modal>
    );
  }

  if (requiredImages === 0) {
    return null;
  }

  return (
    <>
      {/* Main Modal */}
      <Modal
        transparent={true}
        visible={visible && !showCamera && !capturedImage}
        onRequestClose={() => onClose()} // Fixed: removed argument
        animationType="fade"
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg w-3/4 p-6 shadow-lg items-center">
            <View className="bg-gray-200 p-4 rounded-full mb-4">
              <Image
                source={require("../assets/images/Camera.webp")}
                className="w-8 h-8"
              />
            </View>

            <Text className="text-lg font-semibold mb-2">
              {t("CropCalender.ClickPhotos")}
            </Text>

            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ alignItems: "center" }}
              className="mb-4"
            >
              <View className="flex-row items-center">
                {Array.from({ length: requiredImages || 0 }).map((_, index) => (
                  <View key={index} className="flex-row items-center">
                    <View
                      className={`w-8 h-8 rounded-full ${
                        index < currentStep ? "bg-black" : "bg-gray-200"
                      } justify-center items-center`}
                    >
                      <Text
                        className={`font-semibold ${
                          index < currentStep ? "text-white" : "text-black"
                        }`}
                      >
                        {index + 1}
                      </Text>
                    </View>
                    {index < (requiredImages || 0) - 1 && (
                      <View className="w-8 h-0.5 bg-gray-400 mx-2" />
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>

            <Text className="text-gray-600 text-center mb-4">
              {t("CropCalender.photo")} {t("CropCalender.yourcultivated")}
            </Text>
            <TouchableOpacity
              className="bg-black py-2 px-6 rounded-full"
              onPress={() => setShowCamera(true)}
            >
              <Text className="text-white text-base">
                {t("CropCalender.OpenCamera")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Camera Screen */}
      {showCamera && (
        <Modal
          transparent={true}
          visible={showCamera}
          onRequestClose={() => setShowCamera(false)}
          animationType="slide"
        >
          <CameraScreen onClose={handleCameraClose} />
        </Modal>
      )}

      {/* Image Preview Screen */}
      {capturedImage && (
        <Modal
          transparent={true}
          visible={capturedImage !== null}
          onRequestClose={() => setCapturedImage(null)}
          animationType="slide"
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white rounded-lg w-3/4 p-6 shadow-lg items-center">
              <Text className="text-lg font-semibold mb-2">
                {t("CropCalender.ImagePreview")}
              </Text>
              <Image
                source={{ uri: capturedImage }}
                style={{ width: 250, height: 250, marginBottom: 20 }}
              />

              <View className="space-y-4">
                {isButtonEnabled ? (
                  <Text className="text-center font-semibold">
                    {t("CropCalender.ReadyToSubmit")}
                  </Text>
                ) : (
                  <Text className="text-gray-600 text-center text-lg">
                    {countdown} {t("CropCalender.Seconds")}
                  </Text>
                )}

                <TouchableOpacity
                  className={`py-2 px-6 rounded-full ${
                    isButtonEnabled ? "bg-black" : "bg-gray-400"
                  }`}
                  onPress={() => isButtonEnabled && uploadImage(capturedImage)}
                  disabled={!isButtonEnabled}
                >
                  <Text className="text-white text-base text-center">
                    {t("CropCalender.Send")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="border-2 border-black bg-white py-2 px-6 rounded-full"
                  onPress={() => setCapturedImage(null)}
                >
                  <Text className="text-black text-base text-center">
                    {t("CropCalender.RetakePreviousPhoto")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}