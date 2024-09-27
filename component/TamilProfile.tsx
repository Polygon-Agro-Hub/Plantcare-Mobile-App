import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Linking, Alert, Modal, BackHandler } from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { environment } from '@/environment/environment';

type TamilProfileNavigationProp = StackNavigationProp<RootStackParamList, 'TamilProfile'>;

interface TamilProfileProps {
    navigation: TamilProfileNavigationProp;
}

const TamilProfile: React.FC<TamilProfileProps> = ({ navigation }) => {
    const [isLanguageDropdownOpen, setLanguageDropdownOpen] = useState<boolean>(false);
    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
    const [isModalVisible, setModalVisible] = useState<boolean>(false);
    const [profile, setProfile] = useState<{ firstName: string; lastName: string; phoneNumber: string } | null>(null);

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
                    Alert.alert('Error', 'டோக்கன் கிடைக்கவில்லை');
                }
            } catch (error) {
                console.error('An error occurred', error);
            }
        };

        fetchProfile();

        // Load the saved language from AsyncStorage
        const loadLanguage = async () => {
            try {
                const savedLanguage = await AsyncStorage.getItem('@user_language');
                if (savedLanguage) {
                    setSelectedLanguage(savedLanguage);
                }
            } catch (error) {
                console.error('Failed to load language:', error);
            }
        };

        loadLanguage();

        // Handle back button press
        const handleBackPress = () => {
            navigation.navigate('TamilDashbord'); // Navigate to your dashboard
            return true; // Prevent default behavior
        };

        BackHandler.addEventListener('hardwareBackPress', handleBackPress);

        return () => {
            BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
        };
    }, []);

    const handleLanguageSelect = async (language: string) => {
        setSelectedLanguage(language);
        setLanguageDropdownOpen(false);
        try {
            // Save the selected language to AsyncStorage
            await AsyncStorage.setItem('@user_language', language);
            console.log('Selected language:', language);

            // Navigate to the appropriate profile screen based on the selected language
            if (language === 'ENGLISH') {
                navigation.navigate('EngProfile');
            } else if (language === 'தமிழ்') {
                navigation.navigate('TamilProfile');
            } else if (language === 'SINHALA') {
                navigation.navigate('SinProfile');
            }
        } catch (error) {
            console.error('Failed to save language preference:', error);
        }
    };

    const handleCall = () => {
        const phoneNumber = '+1234567890'; // Replace with the actual number
        const url = `tel:${phoneNumber}`;
        Linking.canOpenURL(url)
            .then((supported) => {
                if (supported) {
                    return Linking.openURL(url);
                } else {
                    Alert.alert('Error', 'டயலரைத் திறக்க முடியவில்லை.');
                }
            })
            .catch((err) => console.error('An error occurred', err));
    };

    const handleLogout = async () => {
        try {
            // Remove the token from AsyncStorage
            await AsyncStorage.removeItem('userToken');
            // Redirect to the login screen
            navigation.navigate('SigninTamil');
        } catch (error) {
            console.error('An error occurred during logout:', error);
            Alert.alert('Error', 'வெளியேற முடியவில்லை.');
        }
    };

    return (
        <View className="flex-1 bg-white p-12 mt-9">
             <View className='items-start pb-5 pl-0'>  
      <AntDesign
          name="left"
          size={24}
          color="#000000"
          onPress={()=>navigation.navigate('TamilDashbord')}
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
                        <Text className="text-lg mb-1">ஏற்றுகிறது......</Text>
                    )}
                    {profile && <Text className="text-sm text-gray-600">{profile.phoneNumber}</Text>}
                </View>
                <TouchableOpacity
                    onPress={() => navigation.navigate('TamilEditProfile')}
                >
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
                <Text className="flex-1 text-lg ml-2">மொழி அமைப்புகள்</Text>
                <Ionicons name={isLanguageDropdownOpen ? "chevron-up" : "chevron-down"} size={20} color="black" />
            </TouchableOpacity>

            {isLanguageDropdownOpen && (
                <View className="pl-8">
                    {['ENGLISH', 'தமிழ்', 'SINHALA'].map(language => (
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
                    ))}
                </View>
            )}

            {/* Horizontal Line */}
            <View className="h-0.5 bg-black my-4" />

            {/* View My QR Code */}
            <TouchableOpacity className="flex-row items-center py-3"
                onPress={() => navigation.navigate('TamilQRcode')}
            >
                <Ionicons name="qr-code" size={20} color="black" />
                <Text className="flex-1 text-lg ml-2">எனது QR குறியீட்டைப் பார்க்கவும்</Text>
            </TouchableOpacity>

            {/* Horizontal Line */}
            <View className="h-0.5 bg-black my-4" />

            {/* Plant Care Help */}
            <TouchableOpacity className="flex-row items-center py-3" onPress={() => setModalVisible(true)}>
                <Ionicons name="person" size={20} color="black" />
                <Text className="flex-1 text-lg ml-2">Plant Care உதவி மையம்</Text>
            </TouchableOpacity>

            {/* Horizontal Line */}
            <View className="h-0.5 bg-black my-4" />

            {/* Logout */}
            <TouchableOpacity className="flex-row items-center py-3" onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color="red" />
                <Text className="flex-1 text-lg ml-2 text-red-600">வெளியேறு</Text>
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
                                    source={require('../assets/images/ringer.png')} // Replace with your call ringing PNG path
                                    className="w-16 h-16"
                                />
                            </View>
                        </View>
                        <Text className="text-xl font-bold text-center mb-2">உதவி தேவையா?</Text>
                        <Text className="text-base text-center mb-4">
                            PlantCare ஆதரவு தேவையா? தொடர்பு விவரங்கள் அம்ச ஆதரவுக்காக எங்கள் உதவி மையத்தை அழைக்கவும்.
                        </Text>
                        <View className="flex-row justify-around">
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                className="bg-gray-300 p-3 rounded-full flex-1 mx-1"
                            >
                                <Text className="text-center">ரத்து செய்</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleCall}
                                className="bg-green-500 p-3 rounded-full flex-1 mx-1"
                            >
                                <Text className="text-center text-white">அழைப்பு</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default TamilProfile;
