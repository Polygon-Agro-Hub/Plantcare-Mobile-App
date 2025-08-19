import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Image,
  Modal,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useDispatch, useSelector } from 'react-redux';
import DropDownPicker from 'react-native-dropdown-picker';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ImageData from '@/assets/jsons/farmImage.json'
import districtData from '@/assets/jsons/district.json'; 
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

// Import Redux actions and selectors
import { setFarmBasicDetails, selectFarmBasicDetails } from "../../store/farmSlice";
import type { RootState , AppDispatch} from "../../services/reducxStore";

// Define route params type
interface RouteParams {
  membership?: string;
  currentFarmCount?: number;
}

type AddNewFarmBasicDetailsRouteProp = RouteProp<RootStackParamList, 'AddNewFarmBasicDetails'>;

type AddNewFarmBasicDetailsNavigationProp = StackNavigationProp<
  RootStackParamList,
  "AddNewFarmBasicDetails"
>;

const AddNewFarmBasicDetails: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<AddNewFarmBasicDetailsRouteProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  // Get route parameters
  const { membership = 'basic' } = route.params || {};
  
  // Get existing farm details from Redux (if any)
  const existingFarmDetails = useSelector((state: RootState) => selectFarmBasicDetails(state));
  
  // Initialize state with existing Redux data or empty values
  const [farmName, setFarmName] = useState(existingFarmDetails?.farmName || '');
  const [extentha, setExtentha] = useState(existingFarmDetails?.extent.ha || '');
  const [extentac, setExtentac] = useState(existingFarmDetails?.extent.ac || '');
  const [extentp, setExtentp] = useState(existingFarmDetails?.extent.p || '');
  const [district, setDistrict] = useState(existingFarmDetails?.district || '');
  const [plotNo, setPlotNo] = useState(existingFarmDetails?.plotNo || '');
  const [streetName, setStreetName] = useState(existingFarmDetails?.streetName || '');
  const [city, setCity] = useState(existingFarmDetails?.city || '');
  const [selectedImage, setSelectedImage] = useState(existingFarmDetails?.selectedImage || 0);
  const [selectedImageId, setSelectedImageId] = useState(existingFarmDetails?.selectedImageId || 1);
  const [modalVisible, setModalVisible] = useState(false);

  // DropDownPicker states
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(
    districtData.map(item => ({
      label: item.name,
      value: item.name,
    }))
  );

  const validateNumericInput = (text: string) => {
    return text.replace(/[^0-9]/g, '');
  };

  const images = ImageData;

  // Helper function to get image source from path
  const getImageSource = (imagePath: string) => {
    // Map the JSON paths to actual require statements
    const imageMap: { [key: string]: any } = {
      '@/assets/images/Farm/1.webp': require('@/assets/images/Farm/1.webp'),
      '@/assets/images/Farm/2.webp': require('@/assets/images/Farm/2.webp'),
      '@/assets/images/Farm/3.webp': require('@/assets/images/Farm/3.webp'),
      '@/assets/images/Farm/4.webp': require('@/assets/images/Farm/4.webp'),
      '@/assets/images/Farm/5.webp': require('@/assets/images/Farm/5.webp'),
      '@/assets/images/Farm/6.webp': require('@/assets/images/Farm/6.webp'),
      '@/assets/images/Farm/7.webp': require('@/assets/images/Farm/7.webp'),
      '@/assets/images/Farm/8.webp': require('@/assets/images/Farm/8.webp'),
      '@/assets/images/Farm/9.webp': require('@/assets/images/Farm/9.webp'),
    };
    return imageMap[imagePath] || null;
  };

  // Function to get membership display style
  const getMembershipDisplay = () => {
    const membershipType = membership.toLowerCase();
    
    switch (membershipType) {
      case 'pro':
        return {
          text: 'PRO',
          bgColor: 'bg-[#FFF5BD]',
          textColor: 'text-[#E2BE00]'
        };
      case 'basic':
      default:
        return {
          text: 'BASIC',
          bgColor: 'bg-[#CDEEFF]',
          textColor: 'text-[#223FFF]'
        };
    }
  };

  const membershipDisplay = getMembershipDisplay();

  const handleContinue = () => {
    if (!farmName.trim()) {
      alert('Please enter a farm name');
      return;
    }

    // Prepare data to dispatch to Redux
    const farmBasicDetails = {
      farmName,
      extent: { 
        ha: extentha, 
        ac: extentac, 
        p: extentp 
      },
      district,
      plotNo,
      streetName,
      city,
      selectedImage,
      selectedImageId // Add this for backend
    };

    console.log('Form data:', farmBasicDetails);

    // Dispatch data to Redux store
    dispatch(setFarmBasicDetails(farmBasicDetails));

    // Navigate to AddNewFarmSecondDetails with membership info
    navigation.navigate('AddNewFarmSecondDetails' as any, {
      membership: membership
     
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }} 
        showsVerticalScrollIndicator={false}
        className="px-6"
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className=""
         style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
        >
          <View className="flex-row items-center justify-between mb-6">
            <Text className="font-semibold text-lg ml-[30%]">Add New Farm</Text>
            <View className={`${membershipDisplay.bgColor} px-3 py-1 rounded-lg`}>
              <Text className={`${membershipDisplay.textColor} text-xs font-medium`}>
                {membershipDisplay.text}
              </Text>
            </View>
          </View>

          {/* Progress Steps */}
         <View className="flex-row items-center justify-center mb-8 ">
  <View className="w-[29px] h-[29px] border border-[#2AAD7A] bg-white rounded-full flex items-center justify-center">
    <Image
      className="w-[10px] h-[13px] bg-white rounded-full"
      source={require('../../assets/images/Farm/location.webp')}
    />
  </View>
  <View className="w-24 h-0.5 bg-[#C6C6C6] mx-2" />
  <View className="w-[29px] h-[29px] border border-[#C6C6C6] rounded-full flex items-center justify-center">
    <Image
      className="w-[11px] h-[12px] bg-white"
      source={require('../../assets/images/Farm/user.webp')}
    />
  </View>
  <View className="w-24 h-0.5 bg-[#C6C6C6] mx-2" />
  <View className="w-[29px] h-[29px] border border-[#C6C6C6] rounded-full flex items-center justify-center">
    <Image
      className="w-[13.125px] h-[15px] bg-white rounded-full"
      source={require('../../assets/images/Farm/check.png')}
    />
  </View>
</View>

          {/* Farm Icon with Update Option */}
          <View className="items-center mb-8">
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Image
                source={getImageSource(images[selectedImage].source)}
                className="w-20 h-20 rounded-full"
                resizeMode="cover"
              />
              <View className="w-6 h-6 bg-black rounded-full absolute bottom-0 right-0 items-center justify-center">
                <Image  
                  source={require('../../assets/images/Farm/pen.webp')}
                  className="w-3 h-3"
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Fields */}
        <View className=" space-y-6 ">
          {/* Farm Name */}
          <View>
            <Text className="text-[#070707] font-medium mb-2">Farm Name</Text>
            <TextInput
              value={farmName}
              onChangeText={setFarmName}
              placeholder="Enter Farm Name Here"
              placeholderTextColor="#9CA3AF"
              className="bg-[#F4F4F4] p-3 rounded-full text-gray-800"
            />
          </View>

          {/* Extent */}
          <View>
            <Text className="text-[#070707] font-medium mb-2">Extent</Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center space-x-2">
                <Text className="font-semibold">ha</Text>
                <TextInput
                  className="bg-[#F4F4F4] p-2 px-4 w-20 rounded-2xl text-center"
                  value={extentha}
                  onChangeText={(text) => {
                    const validatedText = validateNumericInput(text);
                    setExtentha(validatedText);
                  }}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View className="flex-row items-center space-x-2">
                <Text className="font-semibold">ac</Text>
                <TextInput
                  className="bg-[#F4F4F4] p-2 px-4 w-20 rounded-2xl text-center"
                  value={extentac}
                  onChangeText={(text) => {
                    const validatedText = validateNumericInput(text);
                    setExtentac(validatedText);
                  }}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View className="flex-row items-center space-x-2">
                <Text className="font-semibold">p</Text>
                <TextInput
                  className="bg-[#F4F4F4] p-2 w-20 px-4 rounded-2xl text-center"
                  value={extentp}
                  onChangeText={(text) => {
                    const validatedText = validateNumericInput(text);
                    setExtentp(validatedText);
                  }}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </View>

          {/* District - Using DropDownPicker */}
          <View style={{ zIndex: open ? 2000 : 1 }}>
            <Text className="text-[#070707] font-medium mb-2">District</Text>
          <DropDownPicker
              open={open}
              value={district}
              items={items}
              setOpen={setOpen}
              setValue={setDistrict}
              setItems={setItems}
              placeholder="Select District"
              placeholderStyle={{
                color: "#9CA3AF",
                fontSize: 16,
              }}
              style={{
                backgroundColor: "#F4F4F4",
                borderColor: "#F4F4F4",
                borderRadius: 25,
                height: 50,
                paddingHorizontal: 16,
              }}
              textStyle={{
                color: "#374151",
                fontSize: 16,
              }}
              dropDownContainerStyle={{
                backgroundColor: "#FFFFFF",
                borderColor: "#E5E7EB",
                borderRadius: 8,
                marginTop: 4,
                elevation: 5,
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                zIndex: 5000,
                position: "absolute",
                top: 50,
                left: 0,
                right: 0,
              }}
              listItemLabelStyle={{
                color: "#374151",
                fontSize: 16,
              }}
              selectedItemLabelStyle={{
                color: "#059669",
                fontWeight: "600",
              }}
              searchable={true}
              searchPlaceholder="Search district..."
              searchTextInputStyle={{
                borderColor: "#E5E7EB",
                color: "#374151",
              }}
              maxHeight={300} 
              closeAfterSelecting={true}
              scrollViewProps={{
                nestedScrollEnabled: true, 
                showsVerticalScrollIndicator: true,
              }}
              listMode="MODAL" 
            />
          </View>

          {/* Plot No */}
          <View>
            <Text className="text-[#070707] font-medium mb-2">Plot No</Text>
            <TextInput
              value={plotNo}
              onChangeText={setPlotNo}
              placeholder="Enter Plot Number Here"
              placeholderTextColor="#9CA3AF"
              className="bg-[#F4F4F4] p-3 rounded-full text-gray-800"
            />
          </View>

          {/* Street Name */}
          <View>
            <Text className="text-[#070707] font-medium mb-2">Street Name</Text>
            <TextInput
              value={streetName}
              onChangeText={setStreetName}
              placeholder="Enter Street Name"
              placeholderTextColor="#9CA3AF"
              className="bg-[#F4F4F4] p-3 rounded-full text-gray-800"
            />
          </View>

          {/* City */}
          <View>
            <Text className="text-[#070707] font-medium mb-2">City</Text>
            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder="Enter City Name"
              placeholderTextColor="#9CA3AF"
              className="bg-[#F4F4F4] p-3 rounded-full text-gray-800"
            />
          </View>
        </View>

        {/* Continue Button */}
        <View className="mt-8 mb-[40%]">
          <TouchableOpacity 
            className="bg-black py-3 mx-6 rounded-full"
            onPress={handleContinue}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Image Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-[#667BA54D]">
          <View className="bg-white p-6 rounded-lg w-4/5 max-h-96">
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row flex-wrap justify-center">
                {images.map((imageItem, index) => (
                  <TouchableOpacity
                    key={imageItem.id}
                    onPress={() => {
                      setSelectedImage(index);
                      setSelectedImageId(imageItem.id);
                    }}
                    className="w-1/3 p-2 flex items-center"
                  >
                    <View
                      className={`rounded-full border-2 ${selectedImage === index ? 'border-[#2AAD7A]' : 'border-transparent'}`}
                      style={{ width: 70, height: 70, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}
                    >
                      <Image
                        source={getImageSource(imageItem.source)}
                        className="w-full h-full rounded-full"
                        resizeMode="cover"
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <View className="flex-row space-x-3 mt-4 ">
              <TouchableOpacity
                className="flex-1 bg-gray-300 py-3 rounded-full"
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-center text-gray-800 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-black py-3 rounded-full"
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-center text-white font-semibold">Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AddNewFarmBasicDetails;