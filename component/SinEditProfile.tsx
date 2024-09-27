import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SinhalaNavigationBar from '@/Items/SinhalaNavigationBar';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { environment } from '@/environment/environment';

type SinEditProfileNavigationProps = StackNavigationProp<RootStackParamList , 'SinEditProfile'>

interface  EngEditProfileProps {
    navigation:SinEditProfileNavigationProps
}


const SinEditProfile: React.FC<EngEditProfileProps> = ({navigation}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [NICnumber, setNICnumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumberError, setPhoneNumberError] = useState('');

  useEffect(() => {
    // Fetch initial profile data
    const fetchProfileData = async () => {
      try {
        const response = await fetch(`${environment.API_BASE_URL}api/auth/user-profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${await AsyncStorage.getItem('userToken')}`,
          },
        });
        const data = await response.json();
        if (data.status === 'success') {
          const { firstName, lastName, phoneNumber, NICnumber } = data.user;
          setFirstName(firstName || '');
          setLastName(lastName || '');
          setPhoneNumber(phoneNumber || '');
          setNICnumber(NICnumber || '');
        } else {
          Alert.alert('Error', data.message);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        Alert.alert('Error', 'Profile data fetch failed.');
      }
    };
    fetchProfileData();
  }, []);

  const validatePhoneNumber = (number: string) => {
    if (number.length === 10 && /^\d+$/.test(number)) {
      setPhoneNumberError('');
      return true;
    } else {
      setPhoneNumberError('දුරකථන අංකය සම්පූර්ණ 10 අංක තිබිය යුතුයි.');
      return false;
    }
  };

  const handleSave = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      return;
    }

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'පරිශීලකයෙකු සත්‍යාපිත කර නැත.');
        return;
      }

      const response = await fetch(`${environment.API_BASE_URL}api/auth/user-updatePhone`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ newPhoneNumber: phoneNumber }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'සාර්ථකයි',
          text2: 'පැතිකඩ යාවත්කාලීන විය!',
        });
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'පැතිකඩ යාවත්කාලීන කිරීමට අසමත් විය.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Upper Profile Edit Section */}
      <View className="p-2 flex-1">
        {/* Header */}
        <View className="relative w-full mb-6">
          <TouchableOpacity
            className="absolute top-6 left-4 p-2 bg-transparent"
            onPress={() => navigation.goBack()}
          >
            <Text className="text-4xl text-black">&lt;</Text>
          </TouchableOpacity>
          
          {/* Centered Title */}
          <View className="mt-10 items-center">
            <Text className="text-center text-black text-xl font-bold">
              වෙනස් කිරීම
            </Text>
          </View>
        </View>

        {/* Avatar Image */}
        <View className="items-center mb-6 relative">
          <Image
            source={require('../assets/images/profile.webp')} // Replace with your avatar image path
            style={{ width: 100, height: 100, borderRadius: 50 }}
          />
          <TouchableOpacity
            className="absolute right-0 bottom-0 p-1 bg-white mr-40 rounded-full"
            onPress={() => console.log('Edit Avatar')}
          >
            <Image
              source={require('../assets/images/Pencil.png')} // Replace with your edit icon path
              style={{ width: 17, height: 17, tintColor: 'green' }} // Adjust size and color
            />
          </TouchableOpacity>
        </View>

        {/* Input Fields */}
        <View className="p-6">
          <View className="space-y-8">
            <View>
              <Text className="text-sm text-gray-700 mb-1">මුල් නම</Text>
              <TextInput
                className="h-10 px-3 bg-gray-200 rounded-full text-sm"
                value={firstName}
                editable={false} // Make read-only
                placeholder="මුල් නම ඇතුලත් කරන්න"
              />
            </View>

            <View>
              <Text className="text-sm text-gray-700 mb-1">අවසන් නම</Text>
              <TextInput
                className="h-10 px-3 bg-gray-200 rounded-full text-sm"
                value={lastName}
                editable={false} // Make read-only
                placeholder="අවසන් නම ඇතුලත් කරන්න"
              />
            </View>

            <View>
              <Text className="text-sm text-gray-700 mb-1">දුරකථන අංකය</Text>
              <TextInput
                className={`h-10 px-3 bg-gray-200 rounded-full text-sm ${phoneNumberError ? 'border-red-500' : ''}`}
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text);
                  validatePhoneNumber(text);
                }}
                placeholder="දුරකථන අංකය ඇතුලත් කරන්න"
                keyboardType="phone-pad"
              />
              {phoneNumberError ? (
                <Text className="text-xs text-red-500 mt-1">{phoneNumberError}</Text>
              ) : null}
            </View>

            <View>
              <Text className="text-sm text-gray-700 mb-1">ජාතික හැඳුනුම්පත් අංකය</Text>
              <TextInput
                className="h-10 px-3 bg-gray-200 rounded-full text-sm"
                value={NICnumber}
                editable={false} // Make read-only
                placeholder="ජා.හැ.අ. ඇතුලත් කරන්න"
              />
            </View>
          </View>

          {/* Save Button */}
          <View className="flex-1 items-center mt-10">
            <TouchableOpacity
              onPress={handleSave}
              className={`bg-gray-800 rounded-full py-3 w-60 h-12 ${isLoading ? 'opacity-50' : ''}`}
              disabled={isLoading}
            >
              <Text className="text-center text-white text-sm">සුරකින්න</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Full-width Navigation Bar */}
      <View style={{ width: '100%' }}>
        <SinhalaNavigationBar navigation={navigation} />
      </View>

      {/* Toast Notifications */}
      {/* <Toast ref={(ref) => Toast.setRef(ref)} /> */}
    </View>
  );
};

export default SinEditProfile;
