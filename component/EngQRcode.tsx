import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { environment } from '@/environment/environment';

type EngQRcodeNavigationPrps= StackNavigationProp<RootStackParamList,'EngQRcode'>

interface EngQRcodeProps{
    navigation:EngQRcodeNavigationPrps
}

const EngQRcode: React.FC<EngQRcodeProps> = ({navigation}) => {
  const qrCodeRef = useRef<any>(null);
  const [qrValue, setQrValue] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');

  // Fetch registration details from the server
  const fetchRegistrationDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'No token found');
        return;
      }

      const response = await fetch(`${environment.API_BASE_URL}api/auth/user-profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.status === 'success') {
        const registrationDetails = data.user;
        const qrData = JSON.stringify(registrationDetails);
        setQrValue(qrData); // Update QR value

        // Extract firstName and lastName from user data
        setFirstName(registrationDetails.firstName || '');
        setLastName(registrationDetails.lastName || '');
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      console.error('Error fetching registration details:', error);
      Alert.alert('Error', 'Failed to fetch registration details.');
    }
  };

  useEffect(() => {
    fetchRegistrationDetails();
  }, []);

  const downloadQRCode = async () => {
    if (!qrCodeRef.current) return;

    try {
      const uri = await captureRef(qrCodeRef.current, {
        format: 'png',
        quality: 1.0,
      });

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'You need to grant permission to save the QR code to your gallery.');
        return;
      }

      const fileName = `QRCode_${Date.now()}.png`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.moveAsync({
        from: uri,
        to: fileUri,
      });

      await MediaLibrary.saveToLibraryAsync(fileUri);

      Alert.alert('Success', 'QR Code saved to your gallery.');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save QR code.');
    }
  };

  const shareQRCode = async () => {
    if (!qrCodeRef.current) return;

    try {
      const uri = await captureRef(qrCodeRef.current, {
        format: 'png',
        quality: 1.0,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share QR Code',
        });
      } else {
        Alert.alert('Sharing Unavailable', 'Sharing is not available on this device.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to share QR code.');
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="relative w-full">
        <Image
          source={require('../assets/images/upper.jpeg')}
          className="w-full h-40 mt-0"
        />
        <View className="absolute top-0 left-0 right-0 flex-row items-center justify-center px-4 pt-4">
          <TouchableOpacity
            className="absolute top-6 left-4 p-2 bg-transparent"
            onPress={() =>navigation.navigate('EngProfile')}
          >
            <Text className="text-4xl text-black">&lt;</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-center text-black text-3xl font-bold top-6">Your QR Code</Text>
        </View>
      </View>

      <View className="items-center mt-4 mb-4">
        <Image
          source={require('../assets/images/profile.webp')}
          className="w-24 h-24 rounded-full border-2 border-gray-300"
        />
        <Text className="text-lg font-semibold mt-2">{`${lastName} ${firstName}`}</Text>
      </View>

      <View className="items-center mb-4 mt-5">
        <View ref={qrCodeRef} className="bg-white p-6 rounded-xl border-2 border-black">
          {qrValue ? (
            <QRCode value={qrValue} size={150} />
          ) : (
            <Text>Loading...</Text>
          )}
        </View>
      </View>

      <View className="flex-row justify-evenly mb-4">
        <TouchableOpacity
          className="bg-gray-600 w-20 h-20 rounded-lg items-center justify-center flex-col mx-2 mt-5"
          onPress={downloadQRCode}
        >
          <MaterialIcons name="download" size={24} color="white" />
          <Text className="text-white text-xs mt-1">Download</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-gray-600 w-20 h-20 rounded-lg items-center justify-center flex-col mx-2 mt-5"
          onPress={shareQRCode}
        >
          <MaterialIcons name="share" size={24} color="white" />
          <Text className="text-white text-xs mt-1">Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EngQRcode;
