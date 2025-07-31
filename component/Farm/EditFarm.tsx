import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Image,
  Modal,
  Alert,
  BackHandler,
} from "react-native";
import { useNavigation, RouteProp, useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from 'react-redux';
import DropDownPicker from 'react-native-dropdown-picker';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ImageData from '@/assets/jsons/farmImage.json';
import districtData from '@/assets/jsons/district.json';
import { StackNavigationProp } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import axios from "axios";
import { RootStackParamList } from "../types";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

type EditFarmNavigationProp = StackNavigationProp<
  RootStackParamList,
  "EditFarm"
>;

interface RouteParams {
  farmId: number;
}

interface EditFarmProps {
  route: RouteProp<RootStackParamList, 'EditFarm'>;
  navigation: EditFarmNavigationProp;
}

interface FarmItem {
  id: number;
  userId: number;
  farmName: string;
  farmIndex: number;
  extentha: string | number;
  extentac: string | number;
  extentp: string | number;
  district: string;
  plotNo: string;
  street: string;
  city: string;
  staffCount: number;
  appUserCount: number;
  imageId: number;
}

interface Staff {
  createdAt: string;
  farmId: number;
  firstName: string;
  id: number;
  image: string | null;
  lastName: string;
  ownerId: number;
  phoneCode: string;
  phoneNumber: string;
  role: string;
}

interface FarmDetailsResponse {
  farm: FarmItem;
  staff: Staff[];
}

const EditFarm: React.FC<EditFarmProps> = ({ route, navigation }) => {
  // Fix: Proper null checks and default values for route params
  const farmId = route?.params?.farmId ?? null;
  
  // Form state - Initialize with proper default values
  const [farmName, setFarmName] = useState<string>('');
  const [extentha, setExtentha] = useState<string>('');
  const [extentac, setExtentac] = useState<string>('');
  const [extentp, setExtentp] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [plotNo, setPlotNo] = useState<string>('');
  const [streetName, setStreetName] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [numberOfStaff, setNumberOfStaff] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [selectedImageId, setSelectedImageId] = useState<number>(1);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [farmData, setFarmData] = useState<FarmItem | null>(null);
  const [staffData, setStaffData] = useState<Staff[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // DropDownPicker states - Fix: Proper initialization and type safety
  const [open, setOpen] = useState<boolean>(false);
  const [items, setItems] = useState(() => {
    try {
      if (districtData && Array.isArray(districtData)) {
        return districtData
          .filter(item => item && typeof item === 'object' && item.name)
          .map(item => ({
            label: String(item.name),
            value: String(item.name),
          }));
      }
      return [];
    } catch (err) {
      console.error('Error initializing district items:', err);
      return [];
    }
  });

  // Safe image data handling
  const images = React.useMemo(() => {
    try {
      if (ImageData && Array.isArray(ImageData)) {
        return ImageData.filter(img => img && typeof img === 'object' && img.id);
      }
      return [];
    } catch (err) {
      console.error('Error loading image data:', err);
      return [];
    }
  }, []);

  // Fetch farm details function with improved error handling
  const fetchFarms = useCallback(async () => {
    if (!farmId) {
      setError('Farm ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      console.log(`Fetching farm details for ID: ${farmId}`);
      
      const res = await axios.get<FarmDetailsResponse>(
        `${environment.API_BASE_URL}api/farm/get-farms/byFarm-Id/${farmId}`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        }
      );
      
      console.log("Farm data received:", res.data);
      
      if (res.data && typeof res.data === 'object' && res.data.farm) {
        setFarmData(res.data.farm);
        setStaffData(Array.isArray(res.data.staff) ? res.data.staff : []);
        populateFormFields(res.data.farm);
      } else {
        throw new Error("Invalid response format");
      }

    } catch (err: any) {
      console.error("Error fetching farms:", err);
      let errorMessage = "Failed to fetch farm data";
      
      if (err?.response?.status === 404) {
        errorMessage = "Farm not found. Please check the farm ID.";
      } else if (err?.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (err?.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please try again.";
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  }, [farmId]);

  // Helper function to populate form fields with proper type checking
  const populateFormFields = useCallback((farm: FarmItem) => {
    try {
      if (!farm || typeof farm !== 'object') {
        throw new Error('Invalid farm data');
      }

      setFarmName(farm.farmName ? String(farm.farmName) : '');
      setExtentha(farm.extentha ? String(farm.extentha) : '');
      setExtentac(farm.extentac ? String(farm.extentac) : '');
      setExtentp(farm.extentp ? String(farm.extentp) : '');
      setDistrict(farm.district ? String(farm.district) : '');
      setPlotNo(farm.plotNo ? String(farm.plotNo) : '');
      setStreetName(farm.street ? String(farm.street) : '');
      setCity(farm.city ? String(farm.city) : '');
      setNumberOfStaff(farm.staffCount ? String(farm.staffCount) : '0');
      
      // Handle image selection with proper validation
      if (farm.imageId && images.length > 0) {
        const imageId = Number(farm.imageId);
        setSelectedImageId(imageId);
        const imageIndex = images.findIndex(img => img && img.id === imageId);
        setSelectedImage(imageIndex >= 0 ? imageIndex : 0);
      }
      
      console.log('Form fields populated successfully');
    } catch (err) {
      console.error('Error populating form fields:', err);
      Alert.alert('Error', 'Failed to populate form fields');
    }
  }, [images]);

  // Load farm details on component mount
  useEffect(() => {
    fetchFarms();
  }, [fetchFarms]);

  // Validation functions
  const validateNumericInput = useCallback((text: string): string => {
    return text.replace(/[^0-9]/g, '');
  }, []);

  const validateForm = useCallback((): boolean => {
    if (!farmName?.trim()) {
      Alert.alert('Validation Error', 'Please enter a farm name');
      return false;
    }
    
    if (!district) {
      Alert.alert('Validation Error', 'Please select a district');
      return false;
    }
    
    return true;
  }, [farmName, district]);

  

  // Helper function to get image source from path with proper error handling
  const getImageSource = useCallback((imagePath?: string) => {
    if (!imagePath || typeof imagePath !== 'string') {
      return require('@/assets/images/Farm/1.webp'); // Default fallback
    }
    
    try {
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
      return imageMap[imagePath] || require('@/assets/images/Farm/1.webp');
    } catch (err) {
      console.error('Error loading image:', err);
      return require('@/assets/images/Farm/1.webp');
    }
  }, []);

  const handleImageSelect = useCallback((index: number, imageId: number) => {
    if (typeof index === 'number' && typeof imageId === 'number') {
      setSelectedImage(index);
      setSelectedImageId(imageId);
    }
  }, []);

  const handleModalClose = useCallback(() => {
    setModalVisible(false);
  }, []);

   useFocusEffect(
      useCallback(() => {
        const handleBackPress = () => {
          navigation.navigate("Main", {screen: "FarmDetailsScreen",
       params: { farmId: farmId }});
          return true;
        };
    
        BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    
        return () => {
          BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
        };
      }, [navigation])
    );

const handleUpdateFarm = useCallback(async () => {
  if (!validateForm()) {
    return;
  }

  try {
    setLoading(true);
    const token = await AsyncStorage.getItem("userToken");
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    // Prepare staff data according to Joi schema
    const formattedStaff = staffData.map(staff => ({
      id: staff.id,
      firstName: staff.firstName,
      lastName: staff.lastName,
      phoneCode: staff.phoneCode || '+1', // Provide default if missing
      phoneNumber: staff.phoneNumber,
      role: staff.role,
      image: staff.image || null // Ensure null if no image
    }));

    const updateData = {
      farmId: farmId,
      farmName: farmName.trim(),
      farmIndex: farmData?.farmIndex || 1, // From existing data or default
      farmImage: selectedImageId, // Matches Joi's farmImage field
      extentha: String(extentha || '0'), // Convert to string as required by Joi
      extentac: String(extentac || '0'),
      extentp: String(extentp || '0'),
      district,
      plotNo: plotNo.trim(),
      street: streetName.trim(),
      city: city.trim(),
      staffCount: String(numberOfStaff || '0'), // Convert to string
 
    };

    console.log('Update payload:', updateData); // Debug log

    const response = await axios.put(
      `${environment.API_BASE_URL}api/farm/update-farm`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    Alert.alert('Success', 'Farm updated successfully', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);

  } catch (err: any) {
    console.error('Error updating farm:', err);
    
    let errorMessage = 'Failed to update farm';
    if (err.response) {
      if (err.response.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response.status === 400) {
        errorMessage = 'Invalid data format. Please check all fields.';
      }
    }
    
    Alert.alert('Error', errorMessage);
  } finally {
    setLoading(false);
  }
}, [
  farmId, 
  farmName, 
  extentha, 
  extentac, 
  extentp, 
  district, 
  plotNo, 
  streetName, 
  city, 
  numberOfStaff


]);
  // Show loading spinner
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-lg">Loading farm details...</Text>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error && !farmData) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center px-6">
        <Text className="text-lg text-red-500 text-center mb-4">
          {error}
        </Text>
        <TouchableOpacity 
          className="bg-black py-3 px-6 rounded-full"
          onPress={() => {
            setError(null);
            fetchFarms();
          }}
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

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
        <View 
          className="items-center justify-center mb-6"
          style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
        >
          <Text className="font-semibold text-lg">Edit Farm</Text>
          
          {/* Farm Icon with Update Option */}
          <View className="items-center mb-8 mt-3">
            <TouchableOpacity 
              onPress={() => setModalVisible(true)}
              accessibilityLabel="Change farm image"
            >
              <Image
                source={getImageSource(images[selectedImage]?.source)}
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
        <View className="space-y-6">
          {/* Farm Name */}
          <View>
            <Text className="text-[#070707] font-medium mb-2">Farm Name *</Text>
            <TextInput
              value={farmName}
              onChangeText={setFarmName}
              placeholder="Enter Farm Name Here"
              placeholderTextColor="#9CA3AF"
              className="bg-[#F4F4F4] p-3 rounded-full text-gray-800"
              autoCapitalize="words"
              returnKeyType="next"
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
                  onChangeText={(text) => setExtentha(validateNumericInput(text))}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  maxLength={5}
                />
              </View>

              <View className="flex-row items-center space-x-2">
                <Text className="font-semibold">ac</Text>
                <TextInput
                  className="bg-[#F4F4F4] p-2 px-4 w-20 rounded-2xl text-center"
                  value={extentac}
                  onChangeText={(text) => setExtentac(validateNumericInput(text))}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  maxLength={5}
                />
              </View>

              <View className="flex-row items-center space-x-2">
                <Text className="font-semibold">p</Text>
                <TextInput
                  className="bg-[#F4F4F4] p-2 w-20 px-4 rounded-2xl text-center"
                  value={extentp}
                  onChangeText={(text) => setExtentp(validateNumericInput(text))}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  maxLength={5}
                />
              </View>
            </View>
          </View>

          {/* District */}
          <View style={{ zIndex: open ? 2000 : 1 }}>
            <Text className="text-[#070707] font-medium mb-2">District *</Text>
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
                shadowOffset: { width: 0, height: 2 },
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
              autoCapitalize="characters"
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
              autoCapitalize="words"
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
              autoCapitalize="words"
            />
          </View>

          {/* Number of Staff */}
          <View>
            <Text className="text-[#070707] font-medium mb-2">Number of Staff</Text>
            <TextInput
              value={numberOfStaff}
              onChangeText={(text) => setNumberOfStaff(validateNumericInput(text))}
              placeholder="Enter Number of Staff"
              placeholderTextColor="#9CA3AF"
              className="bg-[#F4F4F4] p-3 rounded-full text-gray-800"
              keyboardType="numeric"
              maxLength={4}
            />
          </View>
        </View>

        {/* Update Button */}
        <View className="mt-8 mb-[40%]">
          <TouchableOpacity 
            className="bg-black py-3 mx-6 rounded-full"
            onPress={handleUpdateFarm}
            disabled={loading}
            accessibilityLabel="Update farm details"
          >
            <Text className="text-white text-center font-semibold text-lg">
              {loading ? 'Updating...' : 'Update'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Image Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleModalClose}
      >
        <View className="flex-1 justify-center items-center bg-[#667BA54D]">
          <View className="bg-white p-6 rounded-lg w-4/5 max-h-96">
            <Text className="text-lg font-semibold text-center mb-4">
              Select Farm Image
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row flex-wrap justify-center">
                {images.map((imageItem, index) => (
                  <TouchableOpacity
                    key={imageItem?.id || index}
                    onPress={() => handleImageSelect(index, imageItem?.id || 1)}
                    className="w-1/3 p-2 flex items-center"
                    accessibilityLabel={`Farm image ${index + 1}`}
                  >
                    <View
                      className={`rounded-full border-2 ${
                        selectedImage === index ? 'border-[#2AAD7A]' : 'border-transparent'
                      }`}
                      style={{ 
                        width: 70, 
                        height: 70, 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        overflow: 'hidden' 
                      }}
                    >
                      <Image
                        source={getImageSource(imageItem?.source)}
                        className="w-full h-full rounded-full"
                        resizeMode="cover"
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <View className="flex-row space-x-3 mt-4">
              <TouchableOpacity
                className="flex-1 bg-gray-300 py-3 rounded-full"
                onPress={handleModalClose}
              >
                <Text className="text-center text-gray-800 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-black py-3 rounded-full"
                onPress={handleModalClose}
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

export default EditFarm;