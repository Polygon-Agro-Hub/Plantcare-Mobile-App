import { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useTranslation } from "react-i18next";
import { Entypo } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CameraAccess from "../permission/CameraAccess";

export interface CultivatedLandModalProps {
  visible: boolean;
  onClose: () => void;
  onCaptureImage: (
    imageUri: string,
    isLastImage: boolean,
  ) => Promise<boolean | void> | boolean | void;
  requiredImages?: number;
  title?: string;
  subtitle?: string;
}

function CameraScreen({
  onClose,
}: {
  onClose: (capturedImageUri: string | null) => void;
}) {
  const insets = useSafeAreaInsets();
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="#2AAD7A" />
        <Text className="text-white text-base mt-4">
          {t("CropCalender.LoadingCameraPermission") || "Loading camera permissions..."}
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <CameraAccess
        // Re-run the hook's own request so its `permission` state updates
        // and this screen re-renders into the live camera view.
        onPermissionGranted={() => {
          requestPermission();
        }}
        onClose={() => onClose(null)}
      />
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const captureImage = async () => {
    if (cameraRef.current && isCameraReady && !isTakingPhoto) {
      try {
        setIsTakingPhoto(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        setIsTakingPhoto(false);
        onClose(photo?.uri ?? null);
      } catch (err) {
        console.error("Camera capture error:", err);
        setIsTakingPhoto(false);
      }
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <CameraView
        style={{ flex: 1 }}
        facing={facing}
        ref={cameraRef}
        onCameraReady={() => setIsCameraReady(true)}
      />

      {/* Back Button */}
      <TouchableOpacity
        onPress={() => onClose(null)}
        style={{
          position: "absolute",
          top: insets.top > 0 ? insets.top + 12 : 16,
          left: 16,
          zIndex: 1000,
        }}
        className="items-start"
        activeOpacity={0.7}
      >
        <Entypo
          name="chevron-left"
          size={25}
          color="black"
          style={{
            backgroundColor: "#F6F6F6CC",
            borderRadius: 50,
            padding: 10,
          }}
        />
      </TouchableOpacity>

      <View
        style={{
          position: "absolute",
          bottom: insets.bottom > 0 ? insets.bottom + 20 : 40,
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
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
          activeOpacity={0.8}
        >
          <Text style={{ color: "black", fontWeight: "600", textAlign: "center" }}>
            {t("CropCalender.FlipCamera")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={captureImage}
          disabled={isTakingPhoto || !isCameraReady}
          style={{
            backgroundColor: isTakingPhoto || !isCameraReady ? "#9AE6B4" : "#2AAD7A",
            padding: 16,
            borderRadius: 50,
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
          activeOpacity={0.8}
        >
          {isTakingPhoto ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text
              style={{ color: "black", fontWeight: "600", textAlign: "center" }}
            >
              {t("CropCalender.Capture")}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function CultivatedLandModal({
  visible,
  onClose,
  onCaptureImage,
  requiredImages = 1,
  title,
  subtitle,
}: CultivatedLandModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const { t } = useTranslation();
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!visible) {
      setCapturedImage(null);
      setShowCamera(false);
      setCurrentStep(0);
    }
  }, [visible]);

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

  const handleCameraClose = (imageUri: string | null) => {
    setShowCamera(false);
    if (imageUri) {
      setCapturedImage(imageUri);
    }
  };

  const handleConfirmImage = async () => {
    if (capturedImage) {
      const uri = capturedImage;
      const nextStep = currentStep + 1;
      const isLast = nextStep >= requiredImages;

      setCapturedImage(null);

      if (isLast) {
        onClose();
        await onCaptureImage(uri, true);
      } else {
        setCurrentStep(nextStep);
        await onCaptureImage(uri, false);
      }
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent={!showCamera}
      visible={visible}
      onRequestClose={() => {
        if (showCamera) {
          setShowCamera(false);
        } else if (capturedImage) {
          setCapturedImage(null);
        } else {
          onClose();
        }
      }}
      animationType={showCamera ? "slide" : "fade"}
    >
      {showCamera ? (
        /* Camera View */
        <CameraScreen onClose={handleCameraClose} />
      ) : capturedImage ? (
        /* Image Preview View */
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-white rounded-2xl p-6 shadow-lg items-center w-full">
            <Text className="text-lg font-semibold mb-2">
              {t("CropCalender.ImagePreview")}
            </Text>
            <Image
              source={{ uri: capturedImage }}
              style={{ width: 250, height: 250, marginBottom: 20 }}
              resizeMode="contain"
            />

            <View className="gap-4 w-full">
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
                className={`py-2 px-6 rounded-full h-[50px] items-center justify-center ${
                  isButtonEnabled ? "bg-black" : "bg-gray-400"
                }`}
                onPress={handleConfirmImage}
                disabled={!isButtonEnabled}
              >
                <Text className="text-white text-base text-center">
                  {t("CropCalender.Submit")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="border-2 border-black bg-white py-2 px-6 rounded-full h-[50px] items-center justify-center"
                onPress={() => {
                  setCapturedImage(null);
                  setShowCamera(true);
                }}
              >
                <Text className="text-black text-base text-center">
                  {t("CropCalender.RetakePreviousPhoto")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        /* Initial Instructions Dialog */
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-white rounded-2xl p-6 shadow-lg items-center w-full">
            <View className="bg-gray-200 p-4 rounded-full mb-4">
              <Image
                source={require("../../assets/images/crop-cultivation/camera.webp")}
                className="w-8 h-8"
              />
            </View>

            <Text className="text-lg font-semibold mb-2 text-center">
              {title || t("CropCalender.ClickPhotos")}
            </Text>

            {requiredImages > 1 && (
              <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ alignItems: "center" }}
                className="mb-4"
              >
                <View className="flex-row items-center">
                  {Array.from({ length: requiredImages }).map((_, index) => (
                    <View key={index} className="flex-row items-center">
                      <View
                        className={`w-8 h-8 rounded-full ${
                          index <= currentStep ? "bg-black" : "bg-gray-200"
                        } justify-center items-center`}
                      >
                        <Text
                          className={`font-semibold ${
                            index <= currentStep ? "text-white" : "text-black"
                          }`}
                        >
                          {index + 1}
                        </Text>
                      </View>
                      {index < requiredImages - 1 && (
                        <View className="w-8 h-0.5 bg-gray-400 mx-2" />
                      )}
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}

            <Text className="text-gray-600 text-center mb-4">
              {subtitle ||
                `${t("CropCalender.UploadAPhoto")} ${t("CropCalender.OfYourCultivatedLandToReceiveOurGuidance")}`}
            </Text>

            <TouchableOpacity
              className="bg-black py-2 px-6 rounded-full h-[50px] items-center justify-center w-full mb-3"
              onPress={() => setShowCamera(true)}
            >
              <Text className="text-white text-base">
                {t("CropCalender.OpenCamera")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-gray-300 py-2 px-6 rounded-full h-[50px] items-center justify-center w-full"
              onPress={onClose}
            >
              <Text className="text-black text-base">{t("Main.Cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Modal>
  );
}