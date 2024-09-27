import { View, Text,Image,TouchableOpacity } from 'react-native';
import React from 'react';
const dial = require('../assets/images/Number.png')
const logo2 = require('../assets/images/register.png');
const google = require('../assets/images/google.png');
const apple = require('../assets/images/Apple.png');
const huw = require('../assets/images/hua.png');
import AntDesign from 'react-native-vector-icons/AntDesign';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';

type SigninSelectionNavigationProp = StackNavigationProp<RootStackParamList, 'SigninSelection'>;

interface SigninSelectionProps {
  navigation: SigninSelectionNavigationProp;
}

const SigninSelection: React.FC<SigninSelectionProps> = ({ navigation }) => {
  return (
    <View className='flex-1'>
                    <View className="bg-custom-green pt-0 pb-0">
                        <View className="pt-3 pb-0">
                            <AntDesign name="left" size={24} color="#000502" onPress={()=>navigation.navigate('Lanuage')} />
                            <View className="items-center ">
                                <Image source={logo2} className="w-full h-[235px] mb-2 mt-1" />
                            </View>
                        </View>
                    </View>
                    <View className='flex-1 items-center bg-white'>
                        <Text className='font-semibold text-2xl pt-4'>இங்கே பதிவு செய்யுங்கள்</Text>
                      <View className='pt-5'>  
                      <TouchableOpacity className="bg-white p-4 rounded-3xl h-12 mb-6 shadow-xl flex-row items-center" onPress={()=>navigation.navigate('SignupFT')} >
                            <Image source={dial} className="w-6 h-6 ml-4 "  />
                            <Text className="text-black text-xs text-end pl-3 ml-3 " >மொபைல் ஃபோன் எண்ணைப் பயன்படுத்துதல்</Text>
                        </TouchableOpacity>
                        <View className="flex-row items-center pb-4">
                            <View className="flex-1 border-t border-gray-300" />
                            <Text className="mx-4 text-gray-500">அல்லது</Text>
                            <View className="flex-1 border-t border-gray-300" />
                            </View>
                        <TouchableOpacity className="bg-white p-4 rounded-3xl h-12 mb-6 shadow-xl flex-row items-center" >
                            <Image source={google} className="w-6 h-6 ml-5 "  />
                            <Text className="text-black text-xs text-end pl-3 ml-3">Google உடன் பதிவு செய்யவும்</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="bg-white p-4 rounded-3xl h-12 mb-6 shadow-xl flex-row items-center" >
                            <Image source={apple} className="w-6 h-6 ml-5 "  />
                            <Text className="text-black text-xs text-end pl-3 ml-3">Apple ID உடன் பதிவு செய்யவும்</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="bg-white p-4 rounded-3xl h-12 mb-6 shadow-xl flex-row items-center" >
                            <Image source={huw} className="w-10 h-10 ml-4 "  />
                            <Text className="text-black text-xs text-end pl-3 ml--1">Huwawei ID உடன் பதிவு செய்யவும்</Text>
                        </TouchableOpacity>
                        <View className="flex-1 items-center flex-row">
                                <Text className='items-center pl-10 pb-20'>ஏற்கனவே கணக்கு உள்ளதா? </Text>
                                <TouchableOpacity onPress={()=>navigation.navigate('SigninTamil')}>
                                    <Text className="text-blue-600 underline pb-20">இங்கே உள்நுழையவும்</Text>
                                </TouchableOpacity>
                            </View>
                      </View> 
                      
                    </View>

    </View>
  )
}

export default SigninSelection