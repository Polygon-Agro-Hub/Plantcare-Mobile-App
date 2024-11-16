import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, Image } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import axios from 'axios';
import { environment } from "@/environment/environment";
import { AxiosError } from 'axios';

// Helper function to fetch the image from URI and convert it to Blob
const uriToBlob = async (uri: string) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
};

interface CultivatedLandModalProps {
  visible: boolean;
  onClose: (capturedImageUri: string | null) => void; // Handle null when no image is captured
  cropId: string;
}

function CameraScreen({ onClose }: { onClose: (capturedImageUri: string | null) => void }) {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [camera, setCamera] = useState<CameraView | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  // Handle the camera permission
  useEffect(() => {
    if (permission?.granted === false) {
      requestPermission(); // Automatically request permission if not granted
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
      onClose(photo?.uri ?? null); // Close camera and pass the captured image URI to parent
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
        <TouchableOpacity onPress={toggleCameraFacing} className="bg-[#26D041]  p-4 rounded-full mb-3">
          <Text className="text-black">Flip Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={captureImage} className="bg-[#26D041] p-4 rounded-full mb-3">
          <Text className="text-black font-semibold">Capture</Text>
        </TouchableOpacity>
      </View>
    </CameraView>
  );
}

export default function CultivatedLandModal({ visible, onClose, cropId }: CultivatedLandModalProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleCameraClose = (imageUri: string | null) => {
    setShowCamera(false);
    if (imageUri) {
      setCapturedImage(imageUri);
    }
  };

  // Helper function to upload the image
  const uploadImage = async () => {
    if (capturedImage && cropId) {
      try {
        const imageBlob = await uriToBlob(capturedImage);
  
        const formData = new FormData();
        formData.append('image', imageBlob, 'cultivated_land.jpg');
        formData.append('slaveId', cropId);

        console.log(formData);
  
        const response = await axios.post(
          `${environment.API_BASE_URL}api/auth/calendar-tasks/upload-image`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      
  
        console.log('Response:', response.data);
        onClose(capturedImage);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          // This ensures that TypeScript knows it's an AxiosError
          console.error('Error uploading image:', error.response?.data || error.message);
        } else {
          // Handle unknown errors here
          console.error('An unexpected error occurred:', error);
        }
      }
    }
  };
  
  
  // Handle the modal close event correctly
  const handleModalClose = () => {
    onClose(capturedImage); // Send captured image when modal is closed
  };

  return (
    <>
      {/* Modal for capturing land */}
      <Modal
        transparent={true}
        visible={visible && !showCamera}
        onRequestClose={handleModalClose} // Corrected here
        animationType="fade"
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg w-3/4 p-6 shadow-lg items-center">
            <View className="bg-gray-200 p-4 rounded-full mb-4">
              <Image source={require('../assets/images/Camera.png')} className="w-8 h-8" />
            </View>
            <Text className="text-lg font-semibold mb-2">Click a Photo</Text>
            <Text className="text-gray-600 text-center mb-4">
              Please upload a photo of your Cultivated Land, so we can guide you through the process.
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

      {/* Camera Screen (Overlay Modal) */}
      {showCamera && (
        <Modal
          transparent={true}
          visible={showCamera}
          onRequestClose={() => setShowCamera(false)}
          animationType="slide"
        >
          <View className="flex-1 justify-center items-center bg-black/70">
            <CameraScreen onClose={handleCameraClose} />
          </View>
        </Modal>
      )}

      {/* Display Captured Image */}
      {capturedImage && (
        <Modal
          transparent={true}
          visible={capturedImage !== null}
          onRequestClose={() => setCapturedImage(null)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <Image
              source={{ uri: capturedImage }}
              className="w-72 h-72 rounded-lg"
            />
            <View className="mt-4 flex-row space-x-4">
              {/* Retake Button */}
              <TouchableOpacity
                onPress={() => setCapturedImage(null)} // Reset image to allow retake
                className="bg-white py-2 px-6 rounded-full"
              >
                <Text className="text-black font-semibold">Retake</Text>
              </TouchableOpacity>

              {/* Close Button */}
              <TouchableOpacity
                onPress={() => setCapturedImage(null)} // Close the modal
                className="bg-white py-2 px-6 rounded-full"
              >
                <Text className="text-black font-semibold">Close</Text>
              </TouchableOpacity>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={uploadImage} // Trigger the uploadImage function
                className="bg-blue-500 py-2 px-6 rounded-full"
              >
                <Text className="text-white font-semibold">Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}
