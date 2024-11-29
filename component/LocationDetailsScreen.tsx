import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, ScrollView, Platform, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import axios from 'axios';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { environment } from "@/environment/environment";

type LocationDetailsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'LocationDetailsScreen'
>;

interface LocationDetailsScreenProps {
  navigation: LocationDetailsScreenNavigationProp;
}

const LocationDetailsScreen: React.FC<LocationDetailsScreenProps> = ({ navigation }) => {
  const [houseNo, setHouseNo] = useState('');
  const [streetName, setStreetName] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);

  // Validation function
  const validateInputs = () => {
    if (!houseNo.trim() || !streetName.trim() || !city.trim()) {
      Alert.alert('Validation Error', 'All fields are required.');
      return false;
    }
    return true;
  };

  // Function to handle form submission
  const handleSubmit = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.post(
        `${environment.API_BASE_URL}api/auth/update-useraddress`,
        {
          houseNo,
          streetName,
          city,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      // Handle the success response
      console.log(response.data);
      Alert.alert('Success', 'Details updated successfully!');
      navigation.navigate('NewCrop');

    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-white">
      <View className="flex-1 px-4 py-6">
        {/* Back Button */}
        <TouchableOpacity className="absolute top-4 left-4 p-2" onPress={() => navigation.goBack()}>
          <Icon name="left" size={24} color="black" />
        </TouchableOpacity>

        {/* Header Image */}
        <View className="items-center mt-5">
          <Image source={require('../assets/images/address3.png')} className="w-72 h-72" resizeMode="contain" />
        </View>

        {/* Title */}
        <Text className="text-lg font-semibold text-center mb-2">Location Details</Text>
        <Text className="text-center text-gray-500 mb-6">
          Please add your cultivation land’s address details to collaborate with us.
        </Text>

        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          {/* Input Fields */}
          <View className="space-y-6 p-4">
            <View>
              <TextInput
                value={houseNo}
                onChangeText={setHouseNo}
                placeholder="Building / House No."
                className="text-gray-900 px-4 pb-2"
                placeholderTextColor="gray"
              />
              <View className="border-b border-[#AFAFAF]" />
            </View>

            <View>
              <TextInput
                value={streetName}
                onChangeText={setStreetName}
                placeholder="Street name"
                className="text-gray-900 px-4 pb-2"
                placeholderTextColor="gray"
              />
              <View className="border-b border-[#AFAFAF]" />
            </View>

            <View>
              <TextInput
                value={city}
                onChangeText={setCity}
                placeholder="City"
                className="text-gray-900 px-4 pb-2"
                placeholderTextColor="gray"
              />
              <View className="border-b border-[#AFAFAF]" />
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            className="mt-7 bg-[#353535] rounded-full py-4 w-3/4 self-center"
            disabled={loading}
          >
            <Text className="text-center text-white font-semibold">
              {loading ? 'Updating...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LocationDetailsScreen;
