import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { RootStackParamList } from './types';
import { StackNavigationProp } from '@react-navigation/stack';
import { environment } from "@/environment/environment";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Type for navigation prop
type BankDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'BankDetailsScreen'>;

interface BankDetailsScreenProps {
  navigation: BankDetailsScreenNavigationProp;
}

const BankDetailsScreen: React.FC<any> = ({ navigation, route }) => {
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nic, setNic] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const [loading, setLoading] = useState(true); // Loading state for AsyncStorage data

  // Load data from AsyncStorage when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedFirstName = await AsyncStorage.getItem('firstName');
        const storedLastName = await AsyncStorage.getItem('lastName');
        const storedNic = await AsyncStorage.getItem('nic');
        const storedMobileNumber = await AsyncStorage.getItem('mobileNumber');
        const storedSelectedDistrict = await AsyncStorage.getItem('selectedDistrict');
        console.log(storedFirstName, storedLastName, storedNic, storedMobileNumber, storedSelectedDistrict);

        if (storedFirstName) setFirstName(storedFirstName);
        if (storedLastName) setLastName(storedLastName);
        if (storedNic) setNic(storedNic);
        if (storedMobileNumber) setMobileNumber(storedMobileNumber);
        if (storedSelectedDistrict) setSelectedDistrict(storedSelectedDistrict);
      } catch (error) {
        console.error('Error loading data from AsyncStorage:', error);
      } finally {
        setLoading(false); // Set loading to false when data is loaded
      }
    };

    loadData();
  }, []);

  // Handle register button press
  const handleRegister = async () => {
    if (loading) {
      Alert.alert('Loading', 'Please wait, data is being loaded.');
      return;
    }

    if (!accountNumber || !confirmAccountNumber || !accountHolderName || !bankName || !branchName) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (accountNumber !== confirmAccountNumber) {
      Alert.alert('Error', 'Account numbers do not match.');
      return;
    }

    try {
      // Ensure all required data is loaded and valid
      if (!firstName || !lastName || !nic || !mobileNumber ) {
        Alert.alert('Error', 'Required data is missing.');
        return;
      }

      // Prepare the data to be sent to the backend
      const bankDetails = {
        firstName,
        lastName,
        nic,
        mobileNumber,
        selectedDistrict,
        accountHolderName,
        accountNumber,
        bankName,
        branchName,
      };
      console.log(bankDetails);

      // Get the token (Assuming you are storing it in AsyncStorage or state)
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'User not authenticated. Please log in.');
        return;
      }

      // Send a POST request to the backend using axios with token in the headers
      const response = await axios.post(
        `${environment.API_BASE_URL}api/auth/registerBankDetails`,
        bankDetails,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add the token here
          },
        }
      );

      // Handle the response
      if (response.status === 200) {
        Alert.alert('Success', 'Bank details registered successfully!');
        // Optionally navigate to another screen
        navigation.navigate('Dashboard');
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error sending bank details:', error);
      if (axios.isAxiosError(error)) {
        Alert.alert('Error', 'Failed to send bank details. Please check your internet connection or try again later.');
      } else {
        Alert.alert('Error', 'An unexpected error occurred. Please try again later.');
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} className="flex-1 p-6">
        {/* Header with Back Button */}
        <View className="flex-row items-center justify-between mb-6">
          <Ionicons name="arrow-back" size={24} color="black" onPress={() => navigation.goBack()} />
        </View>

        {/* QR Code Image Section */}
        <View className="items-center mb-6">
          <Image source={require('../assets/images/QRScreen.png')} style={{ width: 200, height: 200 }} />
        </View>

        {/* Title */}
        <Text className="text-lg font-bold text-center text-gray-900 mb-6">Fill Bank Details</Text>

        {/* Form Fields */}
        <View className="space-y-4 p-4">
          <TextInput
            placeholder="Account Holder's Name"
            className="border-b border-gray-300 pb-2"
            value={accountHolderName}
            onChangeText={setAccountHolderName}
          />
          <TextInput
            placeholder="Account Number"
            className="border-b border-gray-300 pb-2"
            keyboardType="number-pad"
            value={accountNumber}
            onChangeText={setAccountNumber}
          />
          <TextInput
            placeholder="Confirm Your Account Number"
            className="border-b border-gray-300 pb-2"
            keyboardType="number-pad"
            value={confirmAccountNumber}
            onChangeText={setConfirmAccountNumber}
          />

          {/* Bank Name Dropdown */}
          <View className="border-b border-gray-300 ">
            <Picker
              selectedValue={bankName}
              onValueChange={(value) => setBankName(value)}
              style={{ height: 50, width: '100%' }}
            >
              <Picker.Item label="Select Bank Name" value="" />
              <Picker.Item label="Bank of America" value="Bank of America" />
              <Picker.Item label="Chase Bank" value="Chase Bank" />
              <Picker.Item label="Wells Fargo" value="Wells Fargo" />
            </Picker>
          </View>

          {/* Branch Name Dropdown */}
          <View className="border-b border-gray-300 ">
            <Picker
              selectedValue={branchName}
              onValueChange={(value) => setBranchName(value)}
              style={{ height: 50, width: '100%' }}
            >
              <Picker.Item label="Select Branch Name" value="" />
              <Picker.Item label="Main Branch" value="Main Branch" />
              <Picker.Item label="Downtown Branch" value="Downtown Branch" />
              <Picker.Item label="Uptown Branch" value="Uptown Branch" />
            </Picker>
          </View>
        </View>

        {/* Register Button */}
        <TouchableOpacity onPress={handleRegister} className="bg-[#353535] rounded-full py-3 mt-8">
          <Text className="text-white font-bold text-center">Register</Text>
        </TouchableOpacity>

        {/* Terms and Conditions */}
        <Text className="text-center text-sm mt-6 mb-4">
          See <Text className="text-blue-500">Terms & Conditions</Text> and <Text className="text-blue-500">Privacy Policy</Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BankDetailsScreen;
