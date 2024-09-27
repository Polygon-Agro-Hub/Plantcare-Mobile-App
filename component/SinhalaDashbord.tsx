import { View, Text, SafeAreaView, ImageBackground, Image, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { StatusBar } from 'expo-status-bar';
import SinhalaNavigationBar from '@/Items/SinhalaNavigationBar';
import { RootStackParamList } from './types';
import { StackNavigationProp } from '@react-navigation/stack';
import SinhalaNewsSlideShow from '@/Items/SinhalaNewsSlideShow';
import MarketPriceSlideShow from '@/Items/MarketPriceSlideShow';
import { environment } from '@/environment/environment';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SinhalaDashbordNavigationProps = StackNavigationProp<RootStackParamList,'SinhalaDashbord'>;

interface User {
  firstName: string;
  lastName?: string; // Optional if not always provided
  phoneNumber?: string; // Optional if not always provided
  NICnumber?: string; // Optional if not always provided
  // Add other properties as needed
}

interface SinhalaDashbordProps{
    navigation:SinhalaDashbordNavigationProps
}

const SinhalaDashbord:React.FC<SinhalaDashbordProps> = ({navigation}) => {

  const [user, setUser] = useState<User | null>(null);
  const [preferredLanguage, setPreferredLanguage] = useState<string | null>(null);

  useEffect(() => {
    // Fetch initial profile data (dummy example, replace with your API call)
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

    // Load preferred language from AsyncStorage
    const loadPreferredLanguage = async () => {
      try {
        const language = await AsyncStorage.getItem('@user_language');
        setPreferredLanguage(language);
        console.log('Loaded language:', language); // Log the loaded language
      } catch (error) {
        console.error('Failed to load preferred language:', error);
      }
    };

    loadPreferredLanguage();
  }, []);

  // Determine the profile navigation path based on preferred language
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

  // Determine language display text
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
    <SafeAreaView className='flex-1 bg-white'>
      <StatusBar style='light' />

      <ImageBackground
        source={require('../assets/images/dashbordHeader.jpg')} // Make sure the path is correct
        className="flex-1"
        style={{ width: wp(100), height: (110) }}
      >
        <View className='flex-row'>
          <TouchableOpacity
            onPress={()=>navigation.navigate('SinProfile')}
          >
              <Image
              source={require('../assets/images/pcprofile 1.jpg')}
              style={{ height: hp(8), width: hp(8) }}
              className="rounded-full ml-3 mt-3"
            />

          </TouchableOpacity>
          <View className='mt-5 ml-3'>
            <Text style={{ fontSize: 15 }} className='font-semibold'>Hi, {user ? `${user.firstName} 👍` : 'Loading...'}</Text>
            <Text style={{ fontSize: 12 }} className='text-gray-300'>Last seen 11.23PM</Text>
          </View>
        </View>
        
        <View className='mt-12 ml-10'>
          <Text style={{ fontSize: 20 }} className='text-gray-400 mb-1'>පුවත්</Text>
          <View className="border-t border-gray-400 mr-20" />
        </View>

        {/* Place the NewsSlideShow component here to ensure it appears right after the "News" text */}
        <View className="mt-8 flex-1 ml-12 justify-center items-center">
          <SinhalaNewsSlideShow navigation={navigation} />
        </View>

        <View className='ml-10 mt-8'>
          <Text style={{ fontSize: 20 }} className='text-gray-400 mb-1'>වෙළඳපල මිල</Text>
          <View className="border-t border-gray-400 mr-20" />
        </View>

        <View className="mt-8 flex-1 ml-12 justify-center items-center">
          <MarketPriceSlideShow />
        </View>

        <View className="flex-row justify-between mx-10 mt-10">

          <TouchableOpacity
          onPress={() => {
            navigation.navigate('CurrentAssert');
          }}
            className="rounded-[25px] bg-green-500"
            style={{ width: wp(35), height: wp(20) }}
          >
            <View className="flex flex-1 justify-center items-center">
              <Image
                source={require('../assets/images/Sales Performance.png')}
                style={{ width: 50, height: 35 }}
                resizeMode="contain"
              />
              <Text className="mt-3 text-white" style={{ fontSize: 12 }}>
                මගේ වත්කම්
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="rounded-[25px] bg-green-500 ml-3"
            style={{ width: wp(35), height: wp(20) }}
            onPress={()=>navigation.navigate('WeatherForecastSinhala')}
          >
            <View className="flex flex-1 justify-center items-center">
              <Image
                source={require('../assets/images/whether fill w.png')}
                style={{ width: 50, height: 50 }}
                resizeMode="contain"
              />
              <Text className="mt-3 text-white" style={{ fontSize: 12 }}>
              කාලගුණය
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <View className='flex-1 justify-end'>
          <SinhalaNavigationBar navigation={navigation} />
        </View>
      </ImageBackground>
    </SafeAreaView>
  )
}

export default SinhalaDashbord
