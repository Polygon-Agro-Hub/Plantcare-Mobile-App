import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { selectFarmBasicDetails, setFarmBasicDetails } from '../../store/farmSlice';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types'; // Adjust path as needed

// Define navigation prop type
type AddFarmListNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AddFarmList = () => {
  const navigation = useNavigation<AddFarmListNavigationProp>();
  const dispatch = useDispatch();
  const farmBasicDetails = useSelector(selectFarmBasicDetails);

  const [farmName, setFarmName] = useState(farmBasicDetails?.farmName || '');
  const [district, setDistrict] = useState(farmBasicDetails?.district || '');
  const [selectedImage, setSelectedImage] = useState(farmBasicDetails?.selectedImage || 0);

  // Array of images (same as in AddNewFarmBasicDetails)
  const images = [
    require('@/assets/images/Farm/1.webp'),
    require('@/assets/images/Farm/2.webp'),
    require('@/assets/images/Farm/3.webp'),
    require('@/assets/images/Farm/4.webp'),
    require('@/assets/images/Farm/5.webp'),
    require('@/assets/images/Farm/6.webp'),
    require('@/assets/images/Farm/7.webp'),
    require('@/assets/images/Farm/8.webp'),
    require('@/assets/images/Farm/9.webp'),
  ];

  useEffect(() => {
    if (farmBasicDetails) {
      setFarmName(farmBasicDetails.farmName || '');
      setDistrict(farmBasicDetails.district || '');
      setSelectedImage(farmBasicDetails.selectedImage ?? 0); // Use nullish coalescing for default
    }
  }, [farmBasicDetails]);

 // In AddFarmList.tsx
const handleAddNewFarm = () => {
  // Reset or initialize basic details when adding a new farm
  const basicDetails = {
    farmName: '',
    extent: { ha: '', ac: '', p: '' },
    district: '',
    plotNo: '',
    streetName: '',
    city: '',
    selectedImage: 0,
  };

  dispatch(setFarmBasicDetails(basicDetails));
  navigation.navigate('AddNewFarmBasicDetails');
};

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} className="px-6">
        <View style={{ paddingVertical: 20 }}>
          <Text className="text-center font-semibold text-lg">My Farms</Text>
          <Text className="text-center text-[#5B5B5B] text-sm mt-2">
            Click on a farm to edit farm details
          </Text>
        </View>

        {farmBasicDetails && (
          <TouchableOpacity
            className="bg-white shadow-sm rounded-lg p-4 mb-4 border border-[#F2F2F2]"
            onPress={() => navigation.navigate('FarmDetailsScreen' as any)}
          >
            <View className="flex-row items-start">
              <Image
                source={images[selectedImage] || images[0]} // Use selectedImage index or default to first image
                className="w-14 h-14 mr-4 mt-4 rounded-full"
                resizeMode="cover"
              />
              <View className="flex-1">
                <View className="flex-row justify-between items-start">
                  <View>
                    <Text className="font-semibold text-base">{farmBasicDetails.farmName || 'Corn Field'}</Text>
                    <Text className="text-gray-600 text-sm">{farmBasicDetails.district || 'Hambanthota'}</Text>
                  </View>
                </View>
                <View className="mt-2">
                  <View className="bg-[#CDEEFF] px-3 py-1 rounded-lg self-start">
                    <Text className="text-[#223FFF] text-xs font-medium">BASIC</Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity className="bg-black py-3 rounded-full mt-4 mx-4" onPress={handleAddNewFarm}>
          <Text className="text-white text-center font-semibold text-lg">Add New Farm</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddFarmList;