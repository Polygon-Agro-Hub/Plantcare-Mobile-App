import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator
} from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import { useTranslation } from "react-i18next";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";

interface RequestLetterProps {
  navigation: any;
  route: any;
}

interface FarmerDetails {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  district: string;
  NICnumber: string;
  city: string;
  houseNo: string;
  streetName: string;
}

const RequestLetter: React.FC<RequestLetterProps> = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  
  const [farmerDetails, setFarmerDetails] = useState<FarmerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const { 
    crop, 
    cropId,
    extent, 
    investment, 
    expectedYield, 
    startDate, 
    nicFrontImage, 
    nicBackImage 
  } = route.params || {};

  useEffect(() => {
    // Validate required params on mount
    validateParams();
    fetchFarmerDetails();
  }, []);

  const validateParams = () => {
    const missingParams = [];
    if (!crop) missingParams.push('crop');
    if (!cropId) missingParams.push('cropId');
    if (!extent) missingParams.push('extent');
    if (!investment) missingParams.push('investment');
    if (!expectedYield) missingParams.push('expectedYield');
    if (!startDate) missingParams.push('startDate');
    if (!nicFrontImage) missingParams.push('nicFrontImage');
    if (!nicBackImage) missingParams.push('nicBackImage');

    if (missingParams.length > 0) {
      console.error('Missing required parameters:', missingParams);
      Alert.alert(
        'Missing Information',
        `Please provide: ${missingParams.join(', ')}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  const fetchFarmerDetails = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken"); 
      
      if (!token) {
        Alert.alert('Error', 'Authentication token not found. Please login again.');
        return;
      }

      const response = await axios.get(
        `${environment.API_BASE_URL}api/goviCapital/get-farmer-details`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`, 
          }
        }
      );

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setFarmerDetails(response.data[0]);
      } else {
        Alert.alert('Error', 'Could not fetch farmer details');
      }
    } catch (error) {
      console.error('Error fetching farmer details:', error);
      Alert.alert('Error', 'Failed to load farmer details');
    } finally {
      setLoading(false);
    }
  };

  const handleSendForApproval = async () => {
    try {
      if (!cropId) {
        Alert.alert('Error', 'Crop ID is missing');
        return;
      }

      if (!extent || !extent.ha || !extent.ac || !extent.p) {
        Alert.alert('Error', 'Extent information is incomplete');
        return;
      }

      if (!investment || !expectedYield || !startDate) {
        Alert.alert('Error', 'Please ensure all cultivation details are provided');
        return;
      }

      if (!nicFrontImage || !nicBackImage) {
        Alert.alert('Error', 'Both NIC images are required');
        return;
      }

      setSubmitting(true);
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      const formData = new FormData();
      
      // Append form fields
      formData.append('cropId', String(cropId));
      formData.append('extentha', String(extent.ha));
      formData.append('extentac', String(extent.ac));
      formData.append('extentp', String(extent.p));
      formData.append('investment', String(investment));
      formData.append('expectedYield', String(expectedYield));
      formData.append('startDate', startDate);

      // Append NIC Front image
      const nicFrontFile = {
        uri: nicFrontImage,
        type: 'image/jpeg',
        name: `nic_front_${Date.now()}.jpg`
      };
      formData.append('nicFront', nicFrontFile as any);

      // Append NIC Back image
      const nicBackFile = {
        uri: nicBackImage,
        type: 'image/jpeg',
        name: `nic_back_${Date.now()}.jpg`
      };
      formData.append('nicBack', nicBackFile as any);

      console.log('Submitting investment request...');
      
      const response = await axios.post(
        `${environment.API_BASE_URL}api/goviCapital/create-investment-request`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      console.log('Response:', response.data);

      if (response.status === 201) {
        Alert.alert(
           t("Govicapital.Success"), 
          t("Govicapital.Your investment request has been sent for approval!"),
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Home')
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('Error submitting request:', error);
      
      let errorMessage = 'Failed to submit investment request. Please try again.';
      
      if (error.response) {
        // Server responded with error
        console.error('Server error:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
    navigation.navigate("InvestmentAndLoan")
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

   const formatExtent = () => {
    const parts = [];
    
    if (extent?.ha && parseFloat(extent.ha) > 0) {
      parts.push(`${extent.ha} ${t("Govicapital.hectare")}`);
    }
    
    if (extent?.ac && parseFloat(extent.ac) > 0) {
      parts.push(`${extent.ac} ${t("Govicapital.acres")}`);
    }
    
    if (extent?.p && parseFloat(extent.p) > 0) {
      parts.push(`${extent.p} ${t("Govicapital.perches")}`);
    }

    // Join parts with proper formatting
    if (parts.length === 0) {
      return 'N/A';
    } else if (parts.length === 1) {
      return parts[0];
    } else if (parts.length === 2) {
      return `${parts[0]} ${t("Govicapital.and")} ${parts[1]}`;
    } else {
      // 3 parts: "5 hectare, 2 acres and 3 perches"
      return `${parts[0]}, ${parts[1]} ${t("Govicapital.and")} ${parts[2]}`;
    }
  };

   const formatDisplayDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateString;
      }


      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };


      let locale = 'en-US';
      if (i18n.language === 'si') {
        locale = 'si-LK'; // Sinhala
      } else if (i18n.language === 'ta') {
        locale = 'ta-LK'; // Tamil
      }

      return date.toLocaleDateString(locale, options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const farmerName = farmerDetails 
    ? `${farmerDetails.firstName} ${farmerDetails.lastName}` 
    : "[Farmer's Name]";
  
  const district = farmerDetails?.district || "[District]";
  const contactNumber = farmerDetails?.phoneNumber || "[Contact Number]";

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
        <Text className="mt-3 text-gray-600">{t("Govicapital.Loading farmer details")}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <View className="flex-row items-center justify-between px-6 pb-2 mt-3 py-3">
        <View className="flex-row items-center justify-between mb-2 flex-1">
          <TouchableOpacity
            onPress={() => navigation.goBack()} 
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <AntDesign name="left" size={18} />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text 
              className="text-black text-xl font-semibold"
              style={[
                i18n.language === "si"
                  ? { fontSize: 16 }
                  : i18n.language === "ta"
                  ? { fontSize: 13 }
                  : { fontSize: 17 }
              ]}
            >
              {t("Govicapital.Request Letter")}
            </Text>
          </View>
          <View className="w-8" />
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="bg-white rounded-2xl p-5 mb-5">
          <Text className="text-[#070707]  mb-3 text-sm">
            {t("Govicapital.Dear Sir/Madam,")}
          </Text>

          <Text className="text-[#070707] leading-5 mb-3">
            {t("Govicapital.I, [Farmer's Name], a farmer from [District], am writing to request agricultural loan for the upcoming cultivation season.")
              .replace("[Farmer's Name]", farmerName)
              .replace("[District]", district)}
          </Text>

          <Text className="text-[#070707] leading-5 mb-3 ">
            {t("Govicapital.The project details are as follows")}
          </Text>

          <View className="mb-3">
<View className="mb-3">
  {/* Crop - Two lines */}
  <View className="flex-row mb-3">
    <Text className="text-[#070707]">• </Text>
    <View className="flex-1">
      <Text className="text-[#070707] ">{t("Govicapital.Crop")}:</Text>
      <Text className="text-[#070707] mt-1 font-semibold">{crop || 'N/A'}</Text>
    </View>
  </View>

 
  <View className="flex-row mb-3">
  <Text className="text-[#070707]">• </Text>
  <View className="flex-1">
    <Text className="text-[#070707]">{t("Govicapital.Extent")}:</Text>
    <Text className="text-[#070707] mt-1 font-semibold">
      {formatExtent()}
    </Text>
  </View>
</View>

  {/* Expected Investment - Two lines */}
  <View className="flex-row mb-3">
    <Text className="text-[#070707]">• </Text>
    <View className="flex-1">
      <Text className="text-[#070707] ">{t("Govicapital.Expected Investment")}:</Text>
      <Text className="text-[#070707] mt-1 font-semibold">{t("Govicapital.Rs.")}{investment || 0}</Text>
    </View>
  </View>

  {/* Expected Yield - Two lines */}
  <View className="flex-row mb-3">
    <Text className="text-[#070707]">• </Text>
    <View className="flex-1">
      <Text className="text-[#070707] ">{t("Govicapital.Expected Yield")}:</Text>
      <Text className="text-[#070707] mt-1 font-semibold">{expectedYield || 0} kg</Text>
    </View>
  </View>

  {/* Cultivation Start Date - Two lines */}
  <View className="flex-row mb-3">
    <Text className="text-[#070707]">• </Text>
    <View className="flex-1">
      <Text className="text-[#070707] ">{t("Govicapital.Cultivation Start Date")}:</Text>
      {/* <Text className="text-[#070707] mt-1 font-semibold">{startDate || 'N/A'}</Text> */}
       <Text className="text-[#070707] mt-1 font-semibold">
      {formatDisplayDate(startDate)}
    </Text>
    </View>
  </View>
</View>
          </View>

          <Text className="text-[#070707] leading-5 mb-3">
            {t("Govicapital.This loan is essential for covering the costs of high-quality seeds, fertilizers, pesticides, irrigation facilities, and labor expenses for the projected year. The expected harvest is sufficient to generate sufficient revenue for the timely repayment of the loan, along with accrued interest.")}
          </Text>

          <Text className="text-[#070707] leading-5 mb-3">
            {t("Govicapital.I have attached the necessary documents for your perusal.")}
          </Text>

          <View className="flex-row justify-between mb-4">
            {nicFrontImage && (
              <View className="flex-1 mr-2">
                <Image
                  source={{ uri: nicFrontImage }}
                  className="w-full h-32 rounded-lg"
                  resizeMode="cover"
                />
                {/* <Text className="text-xs text-gray-500 text-center mt-1">{t("Govicapital.NIC Front")}</Text> */}
              </View>
            )}
            {nicBackImage && (
              <View className="flex-1 ml-2">
                <Image
                  source={{ uri: nicBackImage }}
                  className="w-full h-32 rounded-lg"
                  resizeMode="cover"
                />
                {/* <Text className="text-xs text-gray-500 text-center mt-1">{t("Govicapital.NIC Back")}</Text> */}
              </View>
            )}
          </View>

          <Text className="text-gray-700 leading-5 mb-3">
            {t("Govicapital.I am confident in the success of this venture and request you to kindly approve my loan application. I look forward to your favorable time and consideration.")}
          </Text>

          <View className="mt-3">
            <Text className="text-gray-700 font-semibold mb-1">
              {t("Govicapital.Sincerely,")}
            </Text>
            <Text className="text-gray-700">{farmerName}</Text>
            <Text className="text-gray-700">{contactNumber}</Text>
          </View>
        </View>

        <View className="mb-8 mt-2">
          <TouchableOpacity 
            onPress={handleGoBack}
            className="bg-gray-200 rounded-full py-3.5 mb-3"
            disabled={submitting}
          >
            <Text className="text-gray-700 text-center font-medium text-sm">
              {t("Govicapital.Go Back")}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleSendForApproval}
            className="bg-gray-900 rounded-full py-3.5"
            disabled={submitting}
            style={{ opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? (
              <View className="flex-row justify-center items-center">
                <ActivityIndicator size="small" color="#fff" />
                <Text className="text-white text-center font-medium text-sm ml-2">
                 {t("Govicapital.Submitting")}
                </Text>
              </View>
            ) : (
              <Text className="text-white text-center font-medium text-sm">
                {t("Govicapital.Send for Approval")}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default RequestLetter;