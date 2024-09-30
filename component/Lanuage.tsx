import React, { useContext, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const lg = require('../assets/images/lanuage.jpg');
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { LanguageContext } from '@/context/LanguageContext';

type LanuageScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Lanuage'>;

interface LanuageProps {
  navigation: LanuageScreenNavigationProp;
}

const Lanuage: React.FC<LanuageProps> = ({ navigation }) => {
  const { changeLanguage } = useContext(LanguageContext);

  useEffect(() => {
    const checkLanguagePreference = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem('@user_language');
        if (storedLanguage) {
          handleLanguageSelect(storedLanguage);
        }
      } catch (error) {
        console.error('Failed to retrieve language preference:', error);
      }
    };

    checkLanguagePreference();
  }, []); // Empty dependency array means this effect runs only once

  // const navigateToScreen = (lang: string) => {
  //   switch (lang) {
  //     case 'ENGLISH':
  //       navigation.navigate('SigninSelection');
  //       break;
  //     case 'SINHALA':
  //       navigation.navigate('SigninSelection');
  //       break;
  //     case 'தமிழ்':
  //       navigation.navigate('SigninSelection');
  //       break;
  //     default:
  //       break;
  //   }
  // };

  const handleLanguageSelect = async (language: string) => {
    try {
      await AsyncStorage.setItem('@user_language', language); 
      changeLanguage(language);
      //navigation.navigate('SigninSelection' as any);
      //THE  NAVIGATION IS CHANGED TEMPERALALY TO MOVE SIGNUPFORM
      navigation.navigate('SignupForum' as any);
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
          onPress={() => handleLanguageSelect('en')}
        >
          <Text className="text-white text-lg text-center">ENGLISH</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-gray-900 p-4 rounded-3xl mb-6"
          onPress={() => handleLanguageSelect('si')}
        >
          <Text className="text-white text-2xl text-center">සිංහල</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-gray-900 p-4 rounded-3xl mb-12"
          onPress={() => handleLanguageSelect('ta')}
        >
          <Text className="text-white text-2xl text-center">தமிழ்</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Lanuage;
