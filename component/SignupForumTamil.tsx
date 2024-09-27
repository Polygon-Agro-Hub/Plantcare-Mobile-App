import { View, Text, Image, TextInput, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity,Alert } from 'react-native';
import React, { useState } from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import axios from 'axios';
import Signin from './Signin';
import PhoneInput from 'react-native-phone-number-input';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import AsyncStorage from "@react-native-async-storage/async-storage";
const logo2 = require('@/assets/images/logo2.png');

type SignupForumTamilNavigationProp = StackNavigationProp<RootStackParamList, 'SignupForumTamil'>;

interface SignupForumProps {
  navigation: SignupForumTamilNavigationProp;
}
const SignupForum: React.FC<SignupForumProps> = ({ navigation }) => {
    const [firstName, setFirstame] = useState('');
    const[lastName,setLastName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [nic, setNic] = useState('');
    const [error, setError] = useState('');
    const [ere, setEre] = useState('');
    const [selectedCode, setSelectedCode] = useState('+1'); // Default to a country code, e.g., '+1'

    const validateMobileNumber = (number: string) => {
        const regex = /^[1-9][0-9]{8}$/;
        if (!regex.test(number)) {
            setError('Enter a valid 9-digit mobile number that does not start with zero');
        } else {
            setError('');
        }
    };

    const handleMobileNumberChange = (text: string) => {
        if (text.length <= 10) {
            setMobileNumber(text);
            validateMobileNumber(text);
        }
    };

    const validateNic = (nic: string) => {
        const regex = /^(\d{12}|\d{9}V|\d{9}X|\d{9}v|\d{9}x)$/;
        if (!regex.test(nic)) {
            setEre('Enter a valid NIC number');
        } else {
            setEre('');
        }
    };

    const handleNicChange = (text: string) => {
        setNic(text);
        validateNic(text);
    };

    interface userItem {
        phoneNumber: String;
      }

    

    const countryCodes = [
        { label: '+94 (SL)', value: '+94' },
        { label: '+1 (USA)', value: '+1' },
        { label: '+44 (UK)', value: '+44' },
        { label: '+91 (India)', value: '+91' },
        // Add more country codes here
    ];

    const handleRegister = async () => {
        
    if (!mobileNumber || !nic || !firstName || !lastName || !selectedCode) {
        Alert.alert("Error", "Please fill in all fields.");
        return;
      }
  
      try {
        const apiUrl = "https://api.getshoutout.com/otpservice/send";
  
        const headers = {
          Authorization:
            "Apikey eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NmM4NTZkMC04YmY2LTExZWQtODE0NS0yOTMwOGIyN2NlM2EiLCJzdWIiOiJTSE9VVE9VVF9BUElfVVNFUiIsImlhdCI6MTY3MjgxMjYxOCwiZXhwIjoxOTg4NDMxODE4LCJzY29wZXMiOnsiYWN0aXZpdGllcyI6WyJyZWFkIiwid3JpdGUiXSwibWVzc2FnZXMiOlsicmVhZCIsIndyaXRlIl0sImNvbnRhY3RzIjpbInJlYWQiLCJ3cml0ZSJdfSwic29fdXNlcl9pZCI6IjgzOTkzIiwic29fdXNlcl9yb2xlIjoidXNlciIsInNvX3Byb2ZpbGUiOiJhbGwiLCJzb191c2VyX25hbWUiOiIiLCJzb19hcGlrZXkiOiJub25lIn0.ayaQjSjBxcSSnqskZp_F_NlrLa_98ddiOi1lfK8WrJ4",
          "Content-Type": "application/json",
        };
  
        const body = {
          source: "ShoutDEMO",
          transport: "sms",
          content: {
            sms: "Your code is {{code}}",
          },
          destination: mobileNumber,
        };
  
        console.log("====================================");
        console.log("this is the body..", body);
        console.log("this is the apiUrl..", apiUrl);
        console.log("====================================");
  
        const response = await axios.post(apiUrl, body, { headers });
  
        console.log(
          "hi.......this is response from shoutout.............:\n\n",
          response.data
        );
        console.log(
          "hi.......this is referenceId from shoutout.............:\n\n",
          response.data.referenceId
        );
        Alert.alert("Success", "OTP sent successfully!");
  
        await AsyncStorage.setItem("referenceId", response.data.referenceId);
  
        // Navigate to the OTPE screen with the mobile number
        navigation.navigate("OtpTamilverification", {
          firstName: firstName,
          lastName: lastName,
          nic: nic,
          mobileNumber: mobileNumber,
        });
      } catch (error) {
        console.error("Error sending OTP:", error);
        Alert.alert("Error", "Failed to send OTP. Please try again.");
      }
    };
    

    const pickerSelectStyles = {
        inputIOS: {
            fontSize: 16,
            paddingVertical: 12,
            paddingHorizontal: 10,
            
            borderRadius: 4,
            color: 'black',
            paddingRight: 30, // to ensure the text is not obscured by the icon
        },
        inputAndroid: {
            fontSize: 16,
            paddingVertical: 8,
            paddingHorizontal: 10,
            borderBottomWidth: 1,
            borderBottomColor: 'gray',
            borderRadius: 8,
            color: 'black',
            paddingRight: 30, // to ensure the text is not obscured by the icon
        },
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View className="flex-1">
                    <View className="bg-custom-green pt-0">
                        <View className="pt-3 pb-0">
                            <AntDesign name="left" size={24} color="#000502" onPress={()=>navigation.navigate('SigninSeTamil')}/>
                            <View className="items-center ">
                                <Image source={logo2} className="w-[218px] h-[243px] mb-2 mt-5" />
                            </View>
                        </View>
                    </View>
                    <View className="flex-1 items-center pt-5 bg-white">
                        <Text className="text-xl font-bold">
                        கணக்கு விவரங்களை நிரப்பவும்</Text>
                        <View className="flex-1 w-full px-4">
                            <View className="flex-row gap-x-0 pt-5 items-center border-b border-gray-300">
                                <View className="flex-row items-center flex-1 gap-x-1 ">
                                  <View className='pr-1'>  
                                   <PhoneInput
                      
                      defaultValue={mobileNumber}
                      defaultCode='LK' // Set the default country code for Sri Lanka
                      layout='first'
                      withShadow
                      autoFocus
                      textContainerStyle={{ paddingVertical: 0 }}
                      value={mobileNumber}
                      onChangeText={handleMobileNumberChange}
                      onChangeFormattedText={text => {
                          setMobileNumber(text);}
                      
                      }
                        /> 
                                 </View>   
                                </View>
                            </View>
                            {error ? <Text className="text-red-500 mt-2">{error}</Text> : null}
                            <View className="mt-4">
                                <TextInput
                                    className="h-10 border-b border-gray-300 mb-5 text-base px-2"
                                    placeholder="முதல் பெயர்"
                                    placeholderTextColor="#2E2E2E"
                                    value={firstName}
                                    onChangeText={setFirstame}
                                />
                                <TextInput
                                    className="h-10 border-b border-gray-300 mb-5 text-base px-2"
                                    placeholder="கடைசி பெயர்"
                                    placeholderTextColor="#2E2E2E"
                                    value={lastName}
                                    onChangeText={setLastName}
                                />
                                <TextInput
                                    className="h-10 border-b border-gray-300 mb-5 text-base px-2"
                                    placeholder="தேசிய அடையாள அட்டை எண்"
                                    placeholderTextColor="#2E2E2E"
                                    value={nic}
                                    onChangeText={handleNicChange}
                                />
                                {ere ? <Text className="text-red-500 mt--1 mb-3" >{ere}</Text> : null}
                            </View>
                        </View>
                        <View className="flex-1 justify-center w-64 px-4 mt-0 pb-8 pt-0">
                            <TouchableOpacity className="bg-gray-900 p-4 rounded-3xl mb-6" onPress={handleRegister}>
                                <Text className="text-white text-lg text-center">பதிவு செய்யவும்</Text>
                            </TouchableOpacity>
                            <View className="flex-1 items-center flex-row pt-0 pb-4">
                                <Text>ஏற்கனவே கணக்கு உள்ளது? </Text>
                                <TouchableOpacity >
                                    <Text className="text-blue-600 underline" onPress={()=>navigation.navigate('SigninTamil')} >உள்நுழையவும்</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default SignupForum;
