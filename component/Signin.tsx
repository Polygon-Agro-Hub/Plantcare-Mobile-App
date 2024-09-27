import { View, Text, Image, ScrollView, Alert, TouchableOpacity, TextInput } from 'react-native';
import React, { useState } from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import PhoneInput from 'react-native-phone-number-input';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { environment } from '@/environment/environment';

type SigninNavigationProp = StackNavigationProp<RootStackParamList, 'Signin'>;

interface SigninProps {
    navigation: SigninNavigationProp;
}

const sign = require('../assets/images/signin.png');

const Signin: React.FC<SigninProps> = ({ navigation }) => {
    const [phonenumber, setPhonenumber] = useState('');

    const getPhonenumber = () => {
        Alert.alert(phonenumber);
    };

    const handleLogin = async () => {
        if (!phonenumber) {
            Alert.alert('Validation Error', 'Phone number is required');
            return;
        }

        try {
            const response = await fetch(`${environment.API_BASE_URL}api/auth/user-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phonenumber }),
            });

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json(); // Parse JSON response

                if (data.token) {
                    await AsyncStorage.setItem('userToken', data.token); // Store token
                    console.log('token', data.token);
                    console.log(data.token);
                    
                    navigation.navigate('Dashboard');
                } else {
                    Alert.alert('Login failed', 'No token received');
                }
            } else {
                Alert.alert('Error', 'Expected JSON but received something else');
            }
        } catch (error) {
            Alert.alert('Login failed', 'An error occurred');
            console.error('Login error:', error); // Log the error for debugging
        }
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View className='flex-1 bg-white'>
                <View className="pt-3 pb-0">
                    <AntDesign name="left" size={24} color="#000502" onPress={() => navigation.navigate('SigninSelection')} />
                    <View className="items-center">
                        <Image source={sign} className="w-[240px] h-[235px] mb-2 mt-1" />
                    </View>
                </View>
                <View className='items-center'>
                    <Text className='pt-10 text-3xl font-semibold'>Welcome!</Text>
                    <Text className='pt-[45px] text-base'>Enter your phone number as your</Text>
                    <Text className='pt--1 text-base'>Login ID</Text>
                </View>

                <View className='flex-1 items-center pt-5'>
                { <PhoneInput
                      
                      defaultValue={phonenumber}
                      defaultCode='LK' // Set the default country code for Sri Lanka
                      layout='first'
                      withShadow
                      autoFocus
                      textContainerStyle={{ paddingVertical: 0 }}
                      onChangeFormattedText={text => {
                          setPhonenumber(text);}
                      
                      }
                  /> }
                    <View className='flex-1 items-center pt-10'>
                        <TouchableOpacity className="bg-gray-900 p-4 rounded-3xl mb-6 h-13 w-60" onPress={handleLogin}>
                            <Text className="text-white text-lg text-center">Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

export default Signin;
