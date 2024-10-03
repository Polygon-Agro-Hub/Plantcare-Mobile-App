import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, Linking, Alert, BackHandler } from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { environment } from '@/environment/environment';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '@/context/LanguageContext';

type EngProfileNavigationProp = StackNavigationProp<RootStackParamList, 'EngProfile'>;

interface EngProfileProps {
  navigation: EngProfileNavigationProp;
}

const EngProfile: React.FC<EngProfileProps> = ({ navigation }) => {
  const [isLanguageDropdownOpen, setLanguageDropdownOpen] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [profile, setProfile] = useState<{ firstName: string; lastName: string; phoneNumber: string } | null>(null);
  const { changeLanguage } = useContext(LanguageContext);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchProfile = async () => {
      try {

        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const response = await axios.get(`${environment.API_BASE_URL}api/auth/user-profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.data.status === 'success') {
            setProfile(response.data.user);
          } else {
            Alert.alert('Error', response.data.message);
          }
        } else {
          Alert.alert('Error', 'No token found');
        }
      } catch (error) {
        console.error('An error occurred', error);
      }
    };

    fetchProfile();

    // Handle back button press
    const handleBackPress = () => {
      navigation.navigate('Dashboard'); // Navigate to your dashboard
      return true; // Prevent default behavior
    };

    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, []);

  



  const handleCall = () => {
    const phoneNumber = '+1234567890'; // Replace with the actual number
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Unable to open dialer.');
        }
      })
      .catch((err) => console.error('An error occurred', err));
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      navigation.navigate('Signin');
    } catch (error) {
      console.error('An error occurred during logout:', error);
      Alert.alert('Error', 'Failed to log out.');
    }
  };

  const handleEditClick = () => {
    navigation.navigate('EngEditProfile');
  };

  const handleLanguageSelect = async (language: string) => {
    setSelectedLanguage(language);
    setLanguageDropdownOpen(false);
    try {
        if (language === 'ENGLISH') {
          LanguageSelect('en')
        } else if (language === 'தமிழ்') {
          LanguageSelect('ta')
        } else if (language === 'SINHALA') {
          LanguageSelect('si')
        }
    } catch (error) {
        console.error('Failed to save language preference:', error);
    }
};

  const LanguageSelect = async (language: string) => {
    try {
      await AsyncStorage.setItem('@user_language', language); 
      changeLanguage(language);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  };

  return (
    <View className="flex-1 bg-white p-12 mt-9 w-full">
      <View className='items-start pb-5 pl-0'>
        <AntDesign
          name="left"
          size={24}
          color="#000000"
          onPress={() => navigation.navigate('Dashboard')}
        />
      </View>
      {/* Profile Card */}
      <View className="flex-row items-center mb-4">
        <Image
          source={require('../assets/images/profile.webp')}
          className="w-12 h-12 rounded-full mr-3"
        />
        <View className="flex-1">
          {profile ? (
            <Text className="text-lg mb-1">{profile.firstName} {profile.lastName}</Text>
          ) : (
            <Text className="text-lg mb-1">Loading...</Text>
          )}
          {profile && <Text className="text-sm text-gray-600">{profile.phoneNumber}</Text>}
        </View>
        <TouchableOpacity onPress={handleEditClick}>
          <Ionicons name="pencil" size={30} color="#2fcd46" />
        </TouchableOpacity>
      </View>

      {/* Horizontal Line */}
      <View className="h-0.5 bg-black my-2" />

      {/* Language Settings */}
      <TouchableOpacity
        onPress={() => setLanguageDropdownOpen(!isLanguageDropdownOpen)}
        className="flex-row items-center py-3"
      >
        <Ionicons name="globe-outline" size={20} color="black" />
        <Text className="flex-1 text-lg ml-2">{t('Profile.LanguageSettings')}</Text>
        <Ionicons name={isLanguageDropdownOpen ? "chevron-up" : "chevron-down"} size={20} color="black" />
      </TouchableOpacity>

      {isLanguageDropdownOpen && (
        <View className="pl-8">
          {/* {['ENGLISH', 'தமிழ்', 'SINHALA'].map(language => (
            <TouchableOpacity
              key={language}
              onPress={() => handleLanguageSelect(language)}
              className={`flex-row items-center py-2 px-4 rounded-lg my-1 ${selectedLanguage === language ? 'bg-green-200' : ''}`}
            >
              <Text className={`text-base ${selectedLanguage === language ? 'text-black' : 'text-gray-700'}`}>
                {language}
              </Text>
              {selectedLanguage === language && (
                <View className="absolute right-4">
                  <Ionicons name="checkmark" size={20} color="black" />
                </View>
              )}
            </TouchableOpacity>
          ))} */}
          {['ENGLISH', 'தமிழ்', 'SINHALA'].map(language => {
  const displayLanguage = language === 'SINHALA' ? 'සිංහල' : language;
  return (
    <TouchableOpacity
      key={language}
      onPress={() => handleLanguageSelect(language)}
      className={`flex-row items-center py-2 px-4 rounded-lg my-1 ${selectedLanguage === language ? 'bg-green-200' : ''}`}
    >
      <Text className={`text-base ${selectedLanguage === language ? 'text-black' : 'text-gray-700'}`}>
        {displayLanguage}
      </Text>
      {selectedLanguage === language && (
        <View className="absolute right-4">
          <Ionicons name="checkmark" size={20} color="black" />
        </View>
      )}
    </TouchableOpacity>
  );
})}




        </View>
      )}

      {/* Horizontal Line */}
      <View className="h-0.5 bg-black my-4" />

      {/* View My QR Code */}
      <TouchableOpacity className="flex-row items-center py-3" onPress={() => navigation.navigate('EngQRcode')}>
        <Ionicons name="qr-code" size={20} color="black" />
        <Text className="flex-1 text-lg ml-2">{t('Profile.ViewQR')}</Text>
      </TouchableOpacity>

      {/* Horizontal Line */}
      <View className="h-0.5 bg-black my-4" />

      {/* Plant Care Help */}
      <TouchableOpacity className="flex-row items-center py-3" onPress={() => setModalVisible(true)}>
        <Ionicons name="person" size={20} color="black" />
        <Text className="flex-1 text-lg ml-2">{t('Profile.PlantCareHelp')}</Text>
      </TouchableOpacity>

      {/* Horizontal Line */}
      <View className="h-0.5 bg-black my-4" />

      {/* Logout */}
      <TouchableOpacity className="flex-row items-center py-3" onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="red" />
        <Text className="flex-1 text-lg ml-2 text-red-600">{t('Profile.Logout')}</Text>
      </TouchableOpacity>

      {/* Modal for Call */}
      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-6 rounded-lg shadow-lg w-80">
            <View className="flex-row justify-center mb-4">
              <View className="bg-gray-200 rounded-full p-4">
                <Image
                  source={require('../assets/images/ringer.png')}
                  className="w-16 h-16"
                />
              </View>
            </View>
            <Text className="text-xl font-bold text-center mb-2">{t('Profile.NeedHelp')}?</Text>
            <Text className="text-base text-center mb-4">
            {t('Profile.NeedPlantCareHelp')}
            </Text>
            <View className="flex-row justify-around">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="bg-gray-300 p-3 rounded-full flex-1 mx-1"
              >
                <Text className="text-center">{t('Profile.Cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCall}
                className="bg-green-500 p-3 rounded-full flex-1 mx-1"
              >
                <Text className="text-center text-white">{t('Profile.Call')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default EngProfile;
