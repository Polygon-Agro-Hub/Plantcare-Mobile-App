import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import axios from 'axios';
import { environment } from '@/environment/environment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CultivatedLandModalProps {
  visible: boolean;
  onClose: (status: boolean) => void; // Notify parent when all images are uploaded
  cropId: string; // slaveId in database
  requiredImages: number;
}

function CameraScreen({
  onClose,
}: {
  onClose: (capturedImageUri: string | null) => void;
}) {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [camera, setCamera] = useState<CameraView | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  // Handle the camera permission
  useEffect(() => {
    if (permission?.granted === false) {
      requestPermission();
    }
  }, [permission]);

  if (permission === null) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-white text-lg mb-4">Loading camera permissions...</Text>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const captureImage = async () => {
    if (camera && isCameraReady) {
      const photo = await camera.takePictureAsync();
      onClose(photo?.uri ?? null);
    }
  };

  return (
    <CameraView
      className="flex-1 justify-end"
      facing={facing}
      ref={(ref) => setCamera(ref)}
      onCameraReady={() => setIsCameraReady(true)}
    >
      <View className="flex-row justify-between w-full px-6 mt-4">
        <TouchableOpacity onPress={toggleCameraFacing} className="bg-[#26D041] p-4 rounded-full mb-3">
          <Text className="text-black">Flip Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={captureImage} className="bg-[#26D041] p-4 rounded-full mb-3">
          <Text className="text-black font-semibold">Capture</Text>
        </TouchableOpacity>
      </View>
    </CameraView>
  );
}

export default function CultivatedLandModal({
  visible,
  onClose,
  cropId,
}: CultivatedLandModalProps) {
  const [requiredImages, setRequiredImages] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(0); // Track the number of images uploaded
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch required images for the cropId
  useEffect(() => {
    if (visible) {
      fetchRequiredImages();
    }
  }, [visible]);

  const fetchRequiredImages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${environment.API_BASE_URL}api/auth/calendar-tasks/requiredimages/${cropId}`
      );
      setRequiredImages(response.data.requiredImages || 0);
      console.log("required images", response.data); // Fallback to 0
    } catch (error) {
      console.error('Error fetching required images:', error);
      Alert.alert('Error', 'Failed to load required images.');
      onClose(false); // Close modal on error
    } finally {
      setLoading(false);
    }
  };

  const handleCameraClose = (imageUri: string | null) => {
    setShowCamera(false);
    if (imageUri) {
      console.log("Captured Image URI:", imageUri);  // Add logging here to check
      setCapturedImage(imageUri);  // Set the captured image URI correctly
    }
  };
  

// Store the current step in AsyncStorage when an image is uploaded
const storeUploadProgress = async (step: number) => {
  try {
    await AsyncStorage.setItem(`uploadProgress-${cropId}`, step.toString());
  } catch (error) {
    console.error("Error storing upload progress:", error);
  }
};

// Retrieve the progress from AsyncStorage when the modal is opened
const retrieveUploadProgress = async () => {
  try {
    const storedProgress = await AsyncStorage.getItem(`uploadProgress-${cropId}`);
    return storedProgress ? parseInt(storedProgress, 10) : 0;
  } catch (error) {
    console.error("Error retrieving upload progress:", error);
    return 0;
  }
};

// Modify the existing useEffect to check for progress when the modal is visible
useEffect(() => {
  if (visible) {
    fetchRequiredImages();
    const loadProgress = async () => {
      const progress = await retrieveUploadProgress();
      setCurrentStep(progress);
    };
    loadProgress();

    // Check if the upload has already been completed
    checkUploadCompletion();  // Call the checkUploadCompletion function
  }
}, [visible]);




// After uploading all images, check if we reached the required number of images and clear progress
const uploadImage = async (imageUri: string) => {
  try {
    const fileName = imageUri.split('/').pop();
    const fileType = fileName?.split('.').pop()
      ? `image/${fileName.split('.').pop()}`
      : 'image/jpeg';

    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      name: fileName,
      type: fileType,
    } as any);
    formData.append('slaveId', cropId);

    const response = await axios.post(
      `${environment.API_BASE_URL}api/auth/calendar-tasks/upload-image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      }
    );

    Alert.alert('Upload Successful', 'Image uploaded successfully.');
    setCapturedImage(null);

    // Increment step and check if all images are uploaded
    setCurrentStep((prevStep) => {
      const nextStep = prevStep + 1;
      if (nextStep === (requiredImages || 0)) {
        onClose(true); // Notify parent when all images are uploaded
        clearUploadProgress(); // Clear progress after completion
        AsyncStorage.setItem(`uploadCompleted-${cropId}`, 'true'); // Mark as completed
      }
      storeUploadProgress(nextStep); // Save the progress
      return nextStep;
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    Alert.alert('Error', 'There was an error uploading your image.');
  }
};



const checkUploadCompletion = async () => {
  try {
    // Check if the upload is already completed
    const uploadCompleted = await AsyncStorage.getItem(`uploadCompleted-${cropId}`);
    if (uploadCompleted === 'true') {
      Alert.alert(
        'Upload Already Completed',
        'You have already completed the image upload process.'
      );

      // Clear upload progress when upload is completed
      await clearUploadProgress();

      onClose(false); // Close modal if upload is completed
    }
  } catch (error) {
    console.error('Error checking upload completion:', error);
  }
};

// Function to clear upload progress
const clearUploadProgress = async () => {
  try {
    await AsyncStorage.removeItem(`uploadProgress-${cropId}`);
    console.log('Upload progress cleared for cropId:', cropId);
  } catch (error) {
    console.error('Error clearing upload progress:', error);
  }
};

// Function to update progress after each image upload
// const updateUploadProgress = async (progress:any) => {
//   try {
//     await AsyncStorage.setItem(`uploadProgress-${cropId}`, JSON.stringify(progress));
//     console.log('Updated upload progress:', progress);
//   } catch (error) {
//     console.error('Error updating upload progress:', error);
//   }
// };


const handleRetake = () => {
  setCapturedImage(null);
  setShowCamera(true); // Let the user retake the photo
};

if (loading) {
  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-white mt-4">Loading...</Text>
      </View>
    </Modal>
  );
}


if (requiredImages === 0) {
  Alert.alert('No Images Required', 'There are no images required for upload.');
  onClose(false); // Close modal if no images are required
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
          <View className="bg-gray-200 p-4 rounded-full mb-4">
            <Image source={require('../assets/images/Camera.png')} className="w-8 h-8" />
          </View>

          <Text className="text-lg font-semibold mb-2">Click Photos</Text>

          {/* Horizontal Scroll View for Steps */}
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ alignItems: 'center' }}
            className="mb-4"
          >
            <View className="flex-row items-center">
              {Array.from({ length: requiredImages || 0 }).map((_, index) => (
                <View key={index} className="flex-row items-center">
                  <View
                    className={`w-8 h-8 rounded-full ${
                      index < currentStep ? 'bg-black' : 'bg-gray-200'
                    } justify-center items-center`}
                  >
                    <Text
                      className={`font-semibold ${
                        index < currentStep ? 'text-white' : 'text-black'
                      }`}
                    >
                      {index + 1}
                    </Text>
                  </View>
                  {index < (requiredImages || 0) - 1 && <View className="w-8 h-0.5 bg-gray-400 mx-2" />}
                </View>
              ))}
            </View>
          </ScrollView>

          <Text className="text-gray-600 text-center mb-4">
            Please upload {requiredImages || 0} photo{(requiredImages || 0) > 1 ? 's' : ''} of your cultivated land
            so we can guide you through the process.
          </Text>
          <TouchableOpacity
            className="bg-black py-2 px-6 rounded-full"
            onPress={() => setShowCamera(true)}
          >
            <Text className="text-white text-base">Open Camera</Text>
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
            <Text className="text-lg font-semibold mb-2">Image Preview</Text>
            <Image
              source={{ uri: capturedImage }}
              style={{ width: 250, height: 250, marginBottom: 20 }}
            />

            {/* Buttons vertically aligned */}
            <View className="space-y-4">
              <TouchableOpacity
                className="bg-black py-2 px-6 rounded-full"
                onPress={() => uploadImage(capturedImage)}
              >
                <Text className="text-white text-base text-center">Send</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="border-2 border-black bg-white py-2 px-6 rounded-full"
                onPress={handleRetake}
              >
                <Text className="text-black text-base text-center">Retake Previous Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    )}
  </>
);
}
