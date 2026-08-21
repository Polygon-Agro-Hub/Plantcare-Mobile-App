import { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useTranslation } from "react-i18next";
import { Entypo } from "@expo/vector-icons";

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

      {/* Back Button */}
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

  return (
    <>
      {/* Initial Modal Dialog */}
      {/* Initial Modal Dialog */}
      <Modal
        transparent={true}
        visible={visible && !showCamera && !capturedImage}
        onRequestClose={onClose}
        animationType="fade"
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-white rounded-2xl p-6 shadow-lg items-center w-full">
            {/* Close (X) button removed from top-right */}

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

            {/* New gray Close button below Open Camera */}
            <TouchableOpacity
              className="bg-gray-300 py-2 px-6 rounded-full h-[50px] items-center justify-center w-full"
              onPress={onClose}
            >
              <Text className="text-black text-base">{t("Main.Cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Camera Screen Modal */}
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

      {/* Image Preview Screen Modal */}
      {capturedImage && (
        <Modal
          transparent={true}
          visible={capturedImage !== null}
          onRequestClose={() => setCapturedImage(null)}
          animationType="slide"
        >
          <View className="flex-1 justify-center items-center bg-black/50 px-6">
            <View className="bg-white rounded-2xl p-6 shadow-lg items-center w-full">
              <Text className="text-lg font-semibold mb-2">
                {t("CropCalender.ImagePreview")}
              </Text>
              <Image
                source={{ uri: capturedImage }}
                style={{ width: 250, height: 250, marginBottom: 20 }}
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
        </Modal>
      )}
    </>
  );
}
