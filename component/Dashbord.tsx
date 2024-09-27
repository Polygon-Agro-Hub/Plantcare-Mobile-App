import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ImageBackground, Image, TouchableOpacity, Alert } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';
import AntDesign from "react-native-vector-icons/AntDesign";
import NewsSlideShow from '@/Items/NewsSlideShow';
import MarketPriceSlideShow from '@/Items/MarketPriceSlideShow';
import { RootStackParamList } from './types';
import { StackNavigationProp } from '@react-navigation/stack';
import NavigationBar from '@/Items/NavigationBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { environment } from '@/environment/environment';

// Define the type for navigation prop
type DashboardNavigationProp = StackNavigationProp<RootStackParamList, 'Lanuage'>;

// Define the interface for user details
interface User {
  firstName: string;
  lastName?: string; // Optional if not always provided
  phoneNumber?: string; // Optional if not always provided
  NICnumber?: string; // Optional if not always provided
  // Add other properties as needed
}

interface DashboardProps {
  navigation: DashboardNavigationProp;
}

const Dashboard: React.FC<DashboardProps> = ({ navigation }) => {
  const [user, setUser] = useState<User | null>(null);
  const [preferredLanguage, setPreferredLanguage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch(`${environment.API_BASE_URL}api/auth/user-profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${await AsyncStorage.getItem('userToken')}`,
          },
        });
        const data = await response.json();
        console.log(data.user);
        
        setUser(data.user);

      } catch (error) {
        console.error('Error fetching profile data:', error);
        Alert.alert('Error', 'Failed to fetch profile data.');
      }
    };

    fetchProfileData();

    const loadPreferredLanguage = async () => {
      try {
        const language = await AsyncStorage.getItem('@user_language');
        setPreferredLanguage(language);
        console.log('Loaded language:', language);
      } catch (error) {
        console.error('Failed to load preferred language:', error);
      }
    };

    loadPreferredLanguage();
  }, []);

  const getProfileNavigationPath = () => {
    if (preferredLanguage === 'ENGLISH') {
      return 'EngProfile';
    } else if (preferredLanguage === 'தமிழ்') {
      return 'TamilProfile';
    } else if (preferredLanguage === 'sinhala') {
      return 'SinProfile';
    } else {
      return 'EngProfile'; // Default to English if no language set
    }
  };

  const getLanguageDisplayText = () => {
    switch (preferredLanguage) {
      case 'ENGLISH':
        return 'English';
      case 'தமிழ்':
        return 'Tamil';
      case 'sinhala':
        return 'Sinhala';
      default:
        return 'Loading...';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style='light' />

      <ImageBackground
        source={require('../assets/images/upper.jpeg')}
        className="flex-1 w-full h-[30%]"
      >
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.navigate(getProfileNavigationPath())}>
            <Image
              source={require('../assets/images/pcprofile 1.jpg')}
              className="h-20 w-20 rounded-full ml-4 mt-4" // Equivalent to hp(8)
            />
          </TouchableOpacity>
          <View className="mt-5 ml-3">
            <Text className="text-lg font-bold">
              Hi, {user ? `${user.firstName} 👍` : 'Loading...'}
            </Text>
            <Text className="text-gray-500 text-sm">Last seen 11.23PM</Text>
            <Text className="text-gray-500 text-sm">Language: {getLanguageDisplayText()}</Text>
          </View>

          {/* Add the message icon here */}
          <TouchableOpacity
            onPress={() => {
           navigation.navigate('PublicForum' as any)
            }}
            className="ml-auto mr-4" // Push it to the right
          >
            <AntDesign name="message1" size={34} color="black" />
          </TouchableOpacity>
        </View>

        <View className="mt-5 ml-5">
          <Text className="text-xl text-gray-500">News</Text>
          <View className="border-t border-gray-400 mr-5" />
        </View>

        <View className="mt-5 flex-1 ml-5 justify-center items-center">
          <NewsSlideShow navigation={navigation} />
        </View>

        <View className="ml-5 mt-5">
          <Text className="text-xl text-gray-500">MarketPlace</Text>
          <View className="border-t border-gray-400 mr-5" />
        </View>

        <View className="mt-5 flex-1 ml-5 justify-center items-center">
          <MarketPriceSlideShow />
        </View>

        <View className="flex-row justify-between mx-5 mt-5">
          <TouchableOpacity
            className="rounded-lg bg-green-600 w-1/3 h-20"
            onPress={() => {
              navigation.navigate('CurrentAssert');
            }}
          >
            <View className="flex-1 justify-center items-center">
              <Image
                source={require('../assets/images/Sales Performance.png')}
                className="w-12 h-9"
                resizeMode="contain"
              />
              <Text className="mt-1 text-white text-sm">My Assets</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="rounded-lg bg-green-600 w-1/3 h-20 ml-2"
            onPress={() => {
              navigation.navigate('WeatherForecastEng');
            }}
          >
            <View className="flex-1 justify-center items-center">
              <Image
                source={require('../assets/images/whether fill w.png')}
                className="w-12 h-12"
                resizeMode="contain"
              />
              <Text className="mt-1 text-white text-sm">Weather</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View className="flex-1 justify-end">
          <NavigationBar navigation={navigation} />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default Dashboard;
