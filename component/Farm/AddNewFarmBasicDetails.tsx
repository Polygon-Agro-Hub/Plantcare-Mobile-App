import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Modal,
  KeyboardAvoidingView,
 
  Alert,
} from "react-native";
import { StatusBar, Platform } from "react-native";
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
import { useTranslation } from "react-i18next";
import i18n from "@/i18n/i18n";

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
  const { t } = useTranslation();

  // DropDownPicker states
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(
    districtData.map(item => ({
      label: (t(`District.${item.name}`)),
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

  // const handleContinue = () => {
  //   if (!farmName.trim()) {
  //     alert('Please enter a farm name');
  //     return;
  //   }

  //   // Prepare data to dispatch to Redux
  //   const farmBasicDetails = {
  //     farmName,
  //     extent: { 
  //       ha: extentha, 
  //       ac: extentac, 
  //       p: extentp 
  //     },
  //     district,
  //     plotNo,
  //     streetName,
  //     city,
  //     selectedImage,
  //     selectedImageId // Add this for backend
  //   };

  //   console.log('Form data:', farmBasicDetails);


  //   dispatch(setFarmBasicDetails(farmBasicDetails));

   
  //   navigation.navigate('AddNewFarmSecondDetails' as any, {
  //     membership: membership
     
  //   });
  // };

  const handleContinue = () => {
  // Validate all required fields
 if (!farmName.trim()) {
    Alert.alert(
      t("Farms.validationError"),
      t("Farms.enterFarmName"),
      [{ text: t("Farms.okButton") }]
    );
    return;
  }

  // Validate extent fields - at least one should be filled
  if (!extentha.trim() && !extentac.trim() && !extentp.trim()) {
    Alert.alert(
      t("Farms.validationError"),
      t("Farms.enterFarmExtent"),
      [{ text: t("Farms.okButton") }]
    );
    return;
  }

  if (!district.trim()) {
    Alert.alert(
      t("Farms.validationError"),
      t("Farms.selectDistrict"),
      [{ text: t("Farms.okButton") }]
    );
    return;
  }

  if (!plotNo.trim()) {
    Alert.alert(
      t("Farms.validationError"),
      t("Farms.enterPlotNumber"),
      [{ text: t("Farms.okButton") }]
    );
    return;
  }

  if (!streetName.trim()) {
    Alert.alert(
      t("Farms.validationError"),
      t("Farms.enterStreetName"),
      [{ text: t("Farms.okButton") }]
    );
    return;
  }

  if (!city.trim()) {
    Alert.alert(
      t("Farms.validationError"),
      t("Farms.enterCityName"),
      [{ text: t("Farms.okButton") }]
    );
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

  dispatch(setFarmBasicDetails(farmBasicDetails));

  navigation.navigate('AddNewFarmSecondDetails' as any, {
    membership: membership
  });
};


  const getTextStyle = (language: string) => {
    if (language === "si") {
      return {
        fontSize: 12,
        lineHeight: 20, 
      };
    }
    return {
      fontSize: 14, 
      lineHeight: 25, 
    };
  };
  return (
    <KeyboardAvoidingView style={{ flex: 1 , backgroundColor: 'white' }} behavior={Platform.OS === 'ios' ? 'padding' : "padding"}>
      <View className="flex-1 bg-white">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          className="px-6"
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        <StatusBar 
  barStyle="dark-content" 
  backgroundColor="transparent" 
  translucent={false}
/>
    
        <View className=""
         style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
        >
          
          <View className="flex-row items-center justify-center mb-6 relative">
  
  <Text
    className="font-bold text-lg text-center"
    style={[
      i18n.language === "si"
        ? { fontSize: 14 }
        : { fontSize: 20 }
    ]}
  >
    {t("Farms.Add New Farm")}
  </Text>


  <View className={`absolute right-[-5%] ${membershipDisplay.bgColor} px-2 py-1 rounded-lg`}>
    <Text className={`${membershipDisplay.textColor} text-xs font-medium`}>
      {/* {membershipDisplay.text} */}
      {t(`Farms.${membershipDisplay.text}`)}
    </Text>
  </View>
</View>


      
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

 
        <View className=" space-y-6 ">
      
          <View>
            <Text className="text-[#070707] font-medium mb-2">{t("Farms.Farm Name")}</Text>
            <TextInput
              value={farmName}
              onChangeText={setFarmName}
              placeholder={t("Farms.Enter Farm Name Here")}
              placeholderTextColor="#9CA3AF"
              className="bg-[#F4F4F4] p-3 rounded-full text-gray-800"
            />
          </View>

         
          <View>
            <Text className="text-[#070707] font-medium mb-2">{t("Farms.Extent")}</Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center space-x-2">
                <Text className="font-semibold">{t("Farms.ha")}</Text>
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
                <Text className="font-semibold">{t("Farms.ac")}</Text>
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
                <Text className="font-semibold">{t("Farms.p")}</Text>
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

          
          <View style={{ zIndex: open ? 2000 : 1 }}>
            <Text className="text-[#070707] font-medium mb-2">{t("Farms.District")}</Text>
          <DropDownPicker
              open={open}
              value={district}
              items={items}
              setOpen={setOpen}
              setValue={setDistrict}
              setItems={setItems}
              placeholder={t("Farms.Select District")}
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
              searchPlaceholder={t("Farms.Search district..")}
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
              modalProps={{
  animationType: "slide",
  transparent: false,
  presentationStyle: "fullScreen",
  statusBarTranslucent: false,
}}
modalContentContainerStyle={{
  paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  backgroundColor: '#fff',
}}
            />
          </View>

        
          <View>
            <Text className="text-[#070707] font-medium mb-2">{t("Farms.Plot No")}</Text>
            <TextInput
              value={plotNo}
              onChangeText={setPlotNo}
              placeholder={t("Farms.Enter Plot Number Here")}
              placeholderTextColor="#9CA3AF"
              className="bg-[#F4F4F4] p-3 rounded-full text-gray-800"
            />
          </View>

         
          <View>
            <Text className="text-[#070707] font-medium mb-2">{t("Farms.Street Name")}</Text>
            <TextInput
              value={streetName}
              onChangeText={setStreetName}
              placeholder={t("Farms.Enter Street Name")}
              placeholderTextColor="#9CA3AF"
              className="bg-[#F4F4F4] p-3 rounded-full text-gray-800"
            />
          </View>

          
          <View>
            <Text className="text-[#070707] font-medium mb-2">{t("Farms.City")}</Text>
            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder={t("Farms.Enter City Name")}
              placeholderTextColor="#9CA3AF"
              className="bg-[#F4F4F4] p-3 rounded-full text-gray-800"
            />
          </View>
          
        </View>

       
        <View className="mt-8 mb-[30%]">
          <TouchableOpacity 
            className="bg-black py-3 mx-6 rounded-full"
            onPress={handleContinue}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {t("Farms.Continue")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

 
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
                <Text className="text-center text-gray-800 font-semibold"  style={[{ fontSize: 14 }, getTextStyle(i18n.language)]}>{t("Farms.Cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-black py-3 rounded-full"
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-center text-white font-semibold " style={[{ fontSize: 14 }, getTextStyle(i18n.language)]}>{t("Farms.Update")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
    </KeyboardAvoidingView>
  );
};

export default AddNewFarmBasicDetails;