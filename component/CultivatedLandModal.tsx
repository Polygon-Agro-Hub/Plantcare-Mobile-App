// import React, { useState, useEffect } from "react";
// import {
//   Modal,
//   View,
//   Text,
//   TouchableOpacity,
//   Image,
//   Alert,
//   ActivityIndicator,
//   ScrollView,
// } from "react-native";
// import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
// import axios from "axios";
// import { environment } from "@/environment/environment";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useTranslation } from "react-i18next";
// import { AntDesign } from "@expo/vector-icons";

// interface CultivatedLandModalProps {
//   visible: boolean;
//   onClose: (status: boolean) => void;
//   cropId: string;
//   requiredImages: number;
// }

// function CameraScreen({
//   onClose,
// }: {
//   onClose: (capturedImageUri: string | null) => void;
// }) {
//   const [facing, setFacing] = useState<CameraType>("back");
//   const [permission, requestPermission] = useCameraPermissions();
//   const [camera, setCamera] = useState<CameraView | null>(null);
//   const [isCameraReady, setIsCameraReady] = useState(false);
//   const { t } = useTranslation();
//   const [language, setLanguage] = useState("en");

//   useEffect(() => {
//     const selectedLanguage = t("CropCalender.LNG");
//     setLanguage(selectedLanguage);
//   }, [t]);

//   useEffect(() => {
//     if (permission?.granted === false) {
//       requestPermission();
//     }
//   }, [permission]);

//   if (permission === null) {
//     return (
//       <View className="flex-1 justify-center items-center bg-black">
//         <Text className="text-white text-lg mb-4">
//           {t("CropCalender.loadingCameraPermission")}
//         </Text>
//       </View>
//     );
//   }

//   const toggleCameraFacing = () => {
//     setFacing((current) => (current === "back" ? "front" : "back"));
//   };

//   const captureImage = async () => {
//     if (camera && isCameraReady) {
//       const photo = await camera.takePictureAsync();
//       onClose(photo?.uri ?? null);
//     }
//   };

//   return (
//     <CameraView
//       className="flex-1 justify-end items-center"
//       facing={facing}
//       ref={(ref) => setCamera(ref)}
//       onCameraReady={() => setIsCameraReady(true)}
//     >
//       <View className="flex-row justify-center w-full px-6 mt-4 gap-4">
//         <TouchableOpacity
//           onPress={toggleCameraFacing}
//           className="bg-[#26D041] p-4 rounded-full mb-3"
//         >
//           <Text className="text-black">{t("CropCalender.FlipCamera")}</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           onPress={captureImage}
//           className="bg-[#26D041] p-4 rounded-full mb-3"
//         >
//           <Text className="text-black font-semibold">
//             {t("CropCalender.Capture")}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </CameraView>
//   );
// }

// export default function CultivatedLandModal({
//   visible,
//   onClose,
//   cropId,
// }: CultivatedLandModalProps) {
//   const [requiredImages, setRequiredImages] = useState<number | null>(null);
//   const [currentStep, setCurrentStep] = useState(0); // Track the number of images uploaded
//   const [capturedImage, setCapturedImage] = useState<string | null>(null);
//   const [showCamera, setShowCamera] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const { t } = useTranslation();
//   const [isButtonEnabled, setIsButtonEnabled] = useState(false);
//   const [countdown, setCountdown] = useState(10);

//   useEffect(() => {
//     if (capturedImage) {
//       setIsButtonEnabled(false); // Disable the button initially
//       setCountdown(10); // Reset countdown to 10 seconds

//       const interval = setInterval(() => {
//         setCountdown((prev) => {
//           if (prev <= 1) {
//             clearInterval(interval); // Stop countdown when it reaches 0
//             setIsButtonEnabled(true); // Enable the button when countdown ends
//             return 0; // Ensure countdown doesn't go below 0
//           }
//           return prev - 1; // Decrement countdown
//         });
//       }, 1000);

//       return () => clearInterval(interval); // Clean up interval on component unmount or new image
//     }
//   }, [capturedImage]);

//   // Fetch required images for the cropId
//   useEffect(() => {
//     if (visible) {
//       fetchRequiredImages();
//     }
//   }, [visible]);

//   const fetchRequiredImages = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(
//         `${environment.API_BASE_URL}api/auth/calendar-tasks/requiredimages/${cropId}`
//       );
//       setRequiredImages(response.data.requiredImages || 0);
//     } catch (error) {
//       Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
//       onClose(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCameraClose = (imageUri: string | null) => {
//     setShowCamera(false);
//     if (imageUri) {
//       setCapturedImage(imageUri); // Set the captured image URI correctly
//     }
//   };

//   const storeUploadProgress = async (step: number) => {
//     try {
//       await AsyncStorage.setItem(`uploadProgress-${cropId}`, step.toString());
//     } catch (error) {}
//   };

//   // Retrieve the progress from AsyncStorage when the modal is opened
//   const retrieveUploadProgress = async () => {
//     try {
//       const storedProgress = await AsyncStorage.getItem(
//         `uploadProgress-${cropId}`
//       );
//       return storedProgress ? parseInt(storedProgress, 10) : 0;
//     } catch (error) {
//       // console.error("Error retrieving upload progress:", error);
//       return 0;
//     }
//   };

//   // Modify the existing useEffect to check for progress when the modal is visible
//   useEffect(() => {
//     if (visible) {
//       checkUploadCompletion();
//       fetchRequiredImages();
//       const loadProgress = async () => {
//         const progress = await retrieveUploadProgress();
//         setCurrentStep(progress);
//       };
//       loadProgress();

//       checkUploadCompletion();
//     }
//   }, [visible]);

//   const uploadImage = async (imageUri: string) => {
//     setLoading(true);
//     const maxRetries = 3; // Maximum number of retries
//     let attempt = 0;
//     let success = false;

//     while (attempt < maxRetries && !success) {
//       try {
//         attempt++;
//         console.log(`Upload attempt ${attempt} for image: ${imageUri}`);

//         const fileName = imageUri.split("/").pop();
//         const fileType = fileName?.split(".").pop()
//           ? `image/${fileName.split(".").pop()}`
//           : "image/jpeg";

//         const formData = new FormData();
//         formData.append("image", {
//           uri: imageUri,
//           name: fileName,
//           type: fileType,
//         } as any);
//         formData.append("slaveId", cropId);

//         const response = await axios.post(
//           `${environment.API_BASE_URL}api/auth/calendar-tasks/upload-image`,
//           formData,
//           {
//             headers: {
//               "Content-Type": "multipart/form-data",
//             },
//             timeout: 60000,
//           }
//         );
//         console.log("Upload response:", response.data);

//         Alert.alert(
//           t("CropCalender.Success"),
//           t("CropCalender.SuccessMessage")
//         );
//         setCapturedImage(null);
//         setLoading(false);

//         setCurrentStep((prevStep) => {
//           const nextStep = prevStep + 1;
//           if (nextStep === (requiredImages || 0)) {
//             onClose(true);
//             clearUploadProgress();
//             AsyncStorage.setItem(`uploadCompleted-${cropId}`, "true"); // Mark as completed
//           }
//           storeUploadProgress(nextStep); // Save the progress
//           return nextStep;
//         });

//         success = true; // Mark upload as successful
//       } catch (error) {
//         console.error(`Upload attempt ${attempt} failed:`, error);

//         if (attempt >= maxRetries) {
//           Alert.alert(t("Main.error"), t("CropCalender.UploadRetryFailed"));
//           setLoading(false);
//         } else {
//           console.log(`Retrying upload... (Attempt ${attempt + 1})`);
//         }
//       }
//     }
//   };

//   const checkUploadCompletion = async () => {
//     try {
//       await clearUploadProgress();
//       const uploadCompleted = await AsyncStorage.getItem(
//         `uploadCompleted-${cropId}`
//       );
//       if (uploadCompleted === "true") {
//         Alert.alert(t("CropCalender.uploadAgin"), t("CropCalender.uploadAgin"));
//       }
//     } catch (error) {
//       // console.error("Error checking upload completion:", error);
//     }
//   };

//   // Function to clear upload progress
//   const clearUploadProgress = async () => {
//     try {
//       await AsyncStorage.removeItem(`uploadProgress-${cropId}`);
//     } catch (error) {}
//   };

//   const handleRetake = () => {
//     setCapturedImage(null);
//     setShowCamera(true);
//   };

//   if (loading) {
//     return (
//       <Modal transparent={true} visible={visible} animationType="fade">
//         <View className="flex-1 justify-center items-center bg-black/50">
//           <ActivityIndicator size="large" color="#ffffff" />
//           <Text className="text-white mt-4">{t("CropCalender.Loading")}</Text>
//         </View>
//       </Modal>
//     );
//   }

//   if (requiredImages === 0) {
//     onClose(false);
//     return null;
//   }

//   return (
//     <>
//       {/* Main Modal */}
//       <Modal
//         transparent={true}
//         visible={visible && !showCamera && !capturedImage}
//         onRequestClose={() => onClose(false)}
//         animationType="fade"
//       >
//         <View className="flex-1 justify-center items-center bg-black/50">
//           <View className="bg-white rounded-lg w-3/4 p-6 shadow-lg items-center">
//             {/* Add Camera Icon */}
//             <TouchableOpacity
//               onPress={() => onClose(false)}
//               style={{
//                 position: "absolute",
//                 top: 10,
//                 right: 10,
//                 zIndex: 1,
//               }}
//             >
//               <AntDesign name="close" size={24} color="#000" />
//             </TouchableOpacity>
//             <View className="bg-gray-200 p-4 rounded-full mb-4">
//               <Image
//                 source={require("../assets/images/Camera.webp")}
//                 className="w-8 h-8"
//               />
//             </View>

//             <Text className="text-lg font-semibold mb-2">
//               {t("CropCalender.ClickPhotos")}
//             </Text>

//             <ScrollView
//               horizontal={true}
//               showsHorizontalScrollIndicator={false}
//               contentContainerStyle={{ alignItems: "center" }}
//               className="mb-4"
//             >
//               <View className="flex-row items-center">
//                 {Array.from({ length: requiredImages || 0 }).map((_, index) => (
//                   <View key={index} className="flex-row items-center">
//                     <View
//                       className={`w-8 h-8 rounded-full ${
//                         index < currentStep ? "bg-black" : "bg-gray-200"
//                       } justify-center items-center`}
//                     >
//                       <Text
//                         className={`font-semibold ${
//                           index < currentStep ? "text-white" : "text-black"
//                         }`}
//                       >
//                         {index + 1}
//                       </Text>
//                     </View>
//                     {index < (requiredImages || 0) - 1 && (
//                       <View className="w-8 h-0.5 bg-gray-400 mx-2" />
//                     )}
//                   </View>
//                 ))}
//               </View>
//             </ScrollView>

//             <Text className="text-gray-600 text-center mb-4">
//               {/* {t("CropCalender.PleaseUpoload")} {requiredImages || 0}{" "} */}
//               {t("CropCalender.photo")}
//               {/* {(requiredImages || 0) > 1 ? "s" : ""}{" "} */}
//               {t("CropCalender.yourcultivated")}
//             </Text>
//             <TouchableOpacity
//               className="bg-black py-2 px-6 rounded-full"
//               onPress={() => setShowCamera(true)}
//             >
//               <Text className="text-white text-base">
//                 {t("CropCalender.OpenCamera")}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       {/* Camera Screen */}
//       {showCamera && (
//         <Modal
//           transparent={true}
//           visible={showCamera}
//           onRequestClose={() => setShowCamera(false)}
//           animationType="slide"
//         >
//           <CameraScreen onClose={handleCameraClose} />
//         </Modal>
//       )}

//       {/* Image Preview Screen */}
//       {capturedImage && (
//         <Modal
//           transparent={true}
//           visible={capturedImage !== null}
//           onRequestClose={() => setCapturedImage(null)}
//           animationType="slide"
//         >
//           <View className="flex-1 justify-center items-center bg-black/50">
//             <View className="bg-white rounded-lg w-3/4 p-6 shadow-lg items-center">
//               <Text className="text-lg font-semibold mb-2">
//                 {t("CropCalender.ImagePreview")}
//               </Text>
//               <Image
//                 source={{ uri: capturedImage }}
//                 style={{ width: 250, height: 250, marginBottom: 20 }}
//               />

//               <View className="space-y-4">
//                 {/* Conditional Countdown or Ready Message */}
//                 {isButtonEnabled ? (
//                   <Text className=" text-center font-semibold">
//                     {t("CropCalender.ReadyToSubmit")}
//                   </Text>
//                 ) : (
//                   <Text className="text-gray-600 text-center text-lg">
//                     {countdown} {t("CropCalender.Seconds")}
//                   </Text>
//                 )}

//                 {/* Submit Button */}
//                 <TouchableOpacity
//                   className={`py-2 px-6 rounded-full ${
//                     isButtonEnabled ? "bg-black" : "bg-gray-400"
//                   }`}
//                   onPress={() => isButtonEnabled && uploadImage(capturedImage)}
//                   disabled={!isButtonEnabled}
//                 >
//                   <Text className="text-white text-base text-center">
//                     {t("CropCalender.Send")}
//                   </Text>
//                 </TouchableOpacity>

//                 {/* Retake Button */}
//                 <TouchableOpacity
//                   className="border-2 border-black bg-white py-2 px-6 rounded-full"
//                   onPress={() => setCapturedImage(null)}
//                 >
//                   <Text className="text-black text-base text-center">
//                     {t("CropCalender.RetakePreviousPhoto")}
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         </Modal>
//       )}
//     </>
//   );
// }

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
  BackHandler,
  AppState,
  AppStateStatus 
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import axios from "axios";
import { environment } from "@/environment/environment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { AntDesign } from "@expo/vector-icons";
import * as ImageManipulator from 'expo-image-manipulator';
import { useFocusEffect } from "@react-navigation/native";

interface CultivatedLandModalProps {
  visible: boolean;
  onClose: (status: boolean) => void;
  cropId: string;
  requiredImages: number;
  farmId: number,
  onCulscropID : number
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
      className="flex-1 justify-end items-center"
      facing={facing}
      ref={(ref) => setCamera(ref)}
      onCameraReady={() => setIsCameraReady(true)}
    >
      <View className="flex-row justify-center w-full px-6 mt-4 gap-4">
        <TouchableOpacity
          onPress={toggleCameraFacing}
          className="bg-[#26D041] p-4 rounded-full mb-3"
        >
          <Text className="text-black">{t("CropCalender.FlipCamera")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={captureImage}
          className="bg-[#26D041] p-4 rounded-full mb-3"
        >
          <Text className="text-black font-semibold">
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
  onCulscropID
}: CultivatedLandModalProps) {
  const [requiredImages, setRequiredImages] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(0); // Track the number of images uploaded
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [appState, setAppState] = useState("active");

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


  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState.match(/inactive|background/)) {
        markTaskAsIncomplete(); 
        onClose(false); 
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
  
  const fetchRequiredImages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${environment.API_BASE_URL}api/auth/calendar-tasks/requiredimages/${cropId}`
      );
      setRequiredImages(response.data.requiredImages || 0);
      console.log("Required Images:", response.data.requiredImages);
    } catch (error) {
      Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
      onClose(false);
    } finally {
      setLoading(false);
    }
  };

  const resizeImage = async (imageUri: string) => {
    const manipResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 800 } }], // Resize the image to a smaller size (adjust the width as needed)
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Compress the image to reduce file size
    );
    return manipResult.uri;
  };

  const handleCameraClose = (imageUri: string | null) => {
    setShowCamera(false);
    if (imageUri) {
      setCapturedImage(imageUri); // Set the captured image URI correctly
    }
  };

  const storeUploadProgress = async (step: number) => {
    try {
      await AsyncStorage.setItem(`uploadProgress-${cropId}`, step.toString());
    } catch (error) {}
  };

  // Retrieve the progress from AsyncStorage when the modal is opened
  const retrieveUploadProgress = async () => {
    try {
      const storedProgress = await AsyncStorage.getItem(
        `uploadProgress-${cropId}`
      );
      return storedProgress ? parseInt(storedProgress, 10) : 0;
    } catch (error) {
      // console.error("Error retrieving upload progress:", error);
      return 0;
    }
  };

  // Modify the existing useEffect to check for progress when the modal is visible
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
  const maxRetries = 3; // Maximum number of retries
  let attempt = 0;
  let success = false;

  const resizedImageUri = await resizeImage(imageUri);
  console.log(`Resized image URI: ${resizedImageUri}`);

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
            Authorization: `Bearer ${token}`, // Add the token to the Authorization header
          },
          timeout: 60000,
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total ? (progressEvent.loaded / progressEvent.total) * 100 : 0;
            console.log(`Upload progress: ${progress.toFixed(2)}%`);
          }
        }
      );

      console.log("Upload response:", response.data);

      setCurrentStep((prevStep) => {
        const nextStep = prevStep + 1;

        if (nextStep === requiredImages) {
          Alert.alert(t("CropCalender.Success"), t("CropCalender.TaskSuccessMessage"));
          
          onClose(true);
          AsyncStorage.setItem(`uploadCompleted-${cropId}`, "true");
          console.log("cropId", cropId);
          clearUploadProgress();
        }

        storeUploadProgress(nextStep); // Save the progress
        return nextStep;
      });

      setCapturedImage(null);
      setLoading(false);

      success = true; // Mark upload as successful
    } catch (error) {
      console.error(`Upload attempt ${attempt} failed:`, error);

      if (attempt >= maxRetries) {
        Alert.alert(t("Main.error"), t("CropCalender.UploadRetryFailed"));
        setLoading(false);
        await markTaskAsIncomplete();
        setCurrentStep(0); // Reset step if upload fails
        setCapturedImage(null); // Clear captured image
        return;
      } else {
        console.log(`Retrying upload... (Attempt ${attempt + 1})`);
      }
    }
  }
};


  // Function to mark task as incomplete
  const markTaskAsIncomplete = async () => {
    try {
      await axios.post(
        `${environment.API_BASE_URL}api/crop/update-slave`,
        {
          id: cropId,
          status: "pending", // Mark task as incomplete
        },
        {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem("userToken")}`,
          },
        }
      );
      console.log("Task marked as incomplete.");
    } catch (error) {
      console.error("Error marking task as incomplete:", error);
    }
  };

  const checkUploadCompletion = async () => {
    try {
      await clearUploadProgress();
      const uploadCompleted = await AsyncStorage.getItem(
        `uploadCompleted-${cropId}`
      );
    } catch (error) {
      // console.error("Error checking upload completion:", error);
    }
  };

  // Function to clear upload progress
  const clearUploadProgress = async () => {
    try {
      await AsyncStorage.removeItem(`uploadProgress-${cropId}`);
    } catch (error) {}
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
    onClose(false);
    return null;
  }

  return (
    <>
      {/* Main Modal */}
      <Modal
        transparent={true}
        visible={visible && !showCamera && !capturedImage}
        onRequestClose={() => onClose(false)}
        animationType="fade"
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg w-3/4 p-6 shadow-lg items-center">
            {/* Add Camera Icon */}
            {/* <TouchableOpacity
              onPress={() => {
             
                onClose(false);
              }}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                zIndex: 1,
              }}
            >
              <AntDesign name="close" size={24} color="#000" />
            </TouchableOpacity> */}
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
              {/* {t("CropCalender.PleaseUpoload")} {requiredImages || 0}{" "} */}
              {t("CropCalender.photo")}
              {/* {(requiredImages || 0) > 1 ? "s" : ""}{" "} */}
              {t("CropCalender.yourcultivated")}
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
                {/* Conditional Countdown or Ready Message */}
                {isButtonEnabled ? (
                  <Text className=" text-center font-semibold">
                    {t("CropCalender.ReadyToSubmit")}
                  </Text>
                ) : (
                  <Text className="text-gray-600 text-center text-lg">
                    {countdown} {t("CropCalender.Seconds")}
                  </Text>
                )}

                {/* Submit Button */}
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

                {/* Retake Button */}
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