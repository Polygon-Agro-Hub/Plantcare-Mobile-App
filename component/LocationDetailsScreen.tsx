import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, ScrollView, Platform, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import axios from 'axios';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
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
  const { t } = useTranslation();
  const [language, setLanguage] = useState('en');
  useEffect(() => {
    const selectedLanguage = t("AddressDetails.LNG");
    setLanguage(selectedLanguage);
  }, [t]);

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
      // console.log(response.data);
      Alert.alert( t("AddressDetails.success"),  t("AddressDetails.addressAddedSuccessfully"));
      
      navigation.navigate('NewCrop');  // Go back after successful update

    } catch (err: any) {
      // setError(err.response?.data?.message || 'An error occurred');
      Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-white">
      <View className="flex-1 px-4 py-6">
        {/* Back Button */}
        <TouchableOpacity className="absolute " onPress={() => navigation.goBack()}  style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}>
          <Icon name="left" size={24} color="black" />
        </TouchableOpacity>

        {/* Header Image */}
        <View className="items-center mt-5">
          <Image source={require('../assets/images/address3.png')} className="w-72 h-72" resizeMode="contain" />
        </View>

        {/* Title */}
        <Text className="text-lg font-semibold text-center mb-2">{t("AddressDetails.LocationDetails")}</Text>
        <Text className="text-center text-gray-500 mb-6">
        {t("AddressDetails.pleaseAdd")}
        </Text>

        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          {/* Input Fields */}
          <View className="space-y-6 p-4">
            <View>
              <TextInput
                value={houseNo}
                onChangeText={setHouseNo}
                placeholder= {t("AddressDetails.Building")}
                className="text-gray-900 px-4 pb-2"
                placeholderTextColor="gray"
              />
              <View className="border-b border-[#AFAFAF]" />
            </View>

            <View>
              <TextInput
                value={streetName}
                onChangeText={setStreetName}
                placeholder={t("AddressDetails.Streetname")}
                className="text-gray-900 px-4 pb-2"
                placeholderTextColor="gray"
              />
              <View className="border-b border-[#AFAFAF]" />
            </View>

            <View>
              <TextInput
                value={city}
                onChangeText={setCity}
                placeholder={t("AddressDetails.City")}
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
              {loading ? t("AddressDetails.Updating") : t("AddressDetails.Continue")}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Display Error if any */}
        {/* {error && <Text className="text-center text-red-500 mt-4">{error}</Text>} */}
      </View>
    </KeyboardAvoidingView>
  );
};

export default LocationDetailsScreen;
