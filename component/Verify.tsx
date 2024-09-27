import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Animated, { FadeIn } from 'react-native-reanimated';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

// Import navigation components
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Define the types for navigation
type RootStackParamList = {
  Verify: undefined;
  NextScreen: undefined; // Define other screens as needed
};

// Define the Verify screen component
const Verify: React.FC = ({ navigation }: any) => {
  return (
    <SafeAreaView className='flex-1 bg-white'>
      <StatusBar style='light' />
      <View className='ml-5'>
        <TouchableOpacity onPress={() => navigation.navigate('SignupForum')}>
          <Ionicons name="chevron-back-outline" size={30} color="gray" />
        </TouchableOpacity>
      </View>
      
      <View className="flex justify-center items-center mt-36">
        {/* Third Circle */}
        <Animated.View
          entering={FadeIn.delay(250).springify()}
          className="absolute w-28 h-28 bg-green-400 rounded-full flex justify-center items-center"
        >
          <AntDesign name="check" size={50} color="gray" />
        </Animated.View>

        {/* Second Circle */}
        <Animated.View
          entering={FadeIn.delay(500).springify()}
          className="absolute w-40 h-40 bg-green-200 rounded-full flex justify-center items-center"
        >
          <View className="absolute w-28 h-28 bg-green-400 rounded-full flex justify-center items-center">
            <AntDesign name="check" size={50} color="gray" />
          </View>
        </Animated.View>

        {/* First Circle */}
        <Animated.View
          entering={FadeIn.delay(750).springify()}
          className="w-52 h-52 bg-green-100 rounded-full flex justify-center items-center"
        >
          <View className="absolute w-40 h-40 bg-green-200 rounded-full flex justify-center items-center">
            <View className="absolute w-28 h-28 bg-green-400 rounded-full flex justify-center items-center">
              <AntDesign name="check" size={50} color="gray" />
            </View>
          </View>
        </Animated.View>
      </View>

      <View className='flex justify-center items-center mt-8'>
        <Text style={{ fontSize: 25 }} className='font-bold'>Successfully Verified!</Text>
        <Text className='text-gray-300 mt-5' style={{ fontSize: 20 }}>Your identity has been</Text>
        <Text className='text-gray-300' style={{ fontSize: 20 }}>verified successfully</Text>
      </View>

      <View className='mt-20'>
        <TouchableOpacity
          style={{ height: hp(7), width: wp(80) }}
          className='bg-gray-900 flex items-center justify-center mx-auto rounded-full'
          onPress={() => navigation.navigate('Signin')} // Replace 'NextScreen' with your actual next screen
        >
          <Text style={{ fontSize: 20 }} className='text-white font-bold tracking-wide'>Continue</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};


export default Verify;