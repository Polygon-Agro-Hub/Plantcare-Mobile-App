import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../context/LanguageContext'; // Adjust the path as needed
const lg = require('../assets/images/lanuage.jpg');
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';

type LanuageScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Lanuage'>;

interface LanuageProps {
  navigation: LanuageScreenNavigationProp;
}

const Lanuage: React.FC<LanuageProps> = ({ navigation }) => {
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    const checkLanguagePreference = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem('@user_language');
        if (storedLanguage) {
          setLanguage(storedLanguage); // This should not cause re-renders if context is stable
          navigateToScreen(storedLanguage);
        }
      } catch (error) {
        console.error('Failed to retrieve language preference:', error);
      }
    };

    checkLanguagePreference();
  }, []); // Empty dependency array means this effect runs only once

  const navigateToScreen = (lang: string) => {
    switch (lang) {
      case 'ENGLISH':
        navigation.navigate('SigninSelection');
        break;
      case 'SINHALA':
        navigation.navigate('SigninSinhala');
        break;
      case 'தமிழ்':
        navigation.navigate('SigninSeTamil');
        break;
      default:
        break;
    }
  };

  const handleLanguageSelect = async (language: string, route: string) => {
    try {
      await AsyncStorage.setItem('@user_language', language); // Save language before navigating
      setLanguage(language); // Update context state
      navigation.navigate(route as any);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  };

  return (
    <View className="flex-1 bg-white items-center">
      <Image className="mt-20 w-full h-30" source={lg} resizeMode="contain" />
      <Text className="text-3xl pt-5 font-semibold">Language</Text>
      <Text className="text-lg pt-5 font-extralight">மொழியைத் தேர்ந்தெடுக்கவும்</Text>
      <Text className="text-lg pt-1 mb-0 font-extralight">කරුණාකර භාෂාව තෝරන්න</Text>

      {/* TouchableOpacity Buttons */}
      <View className="flex-1 justify-center w-64 px-4 mt-0 pt-0">
        <TouchableOpacity
          className="bg-gray-900 p-4 rounded-3xl mb-6"
          onPress={() => handleLanguageSelect('ENGLISH', 'SigninSelection')}
        >
          <Text className="text-white text-lg text-center">ENGLISH</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-gray-900 p-4 rounded-3xl mb-6"
          onPress={() => handleLanguageSelect('SINHALA', 'SigninSinhala')}
        >
          <Text className="text-white text-2xl text-center">සිංහල</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-gray-900 p-4 rounded-3xl mb-12"
          onPress={() => handleLanguageSelect('தமிழ்', 'SigninSeTamil')}
        >
          <Text className="text-white text-2xl text-center">தமிழ்</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Lanuage;
