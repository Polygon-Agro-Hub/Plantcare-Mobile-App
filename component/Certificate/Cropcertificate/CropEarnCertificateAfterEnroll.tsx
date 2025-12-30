import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  Image,
  Modal,
  Alert,
  ActivityIndicator
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import axios from "axios";
import LottieView from "lottie-react-native";

type CropEarnCertificateAfterEnrollNavigationProp = StackNavigationProp<
  RootStackParamList,
  "CropEarnCertificateAfterEnroll"
>;

type CropEarnCertificateAfterEnrollRouteProp = RouteProp<RootStackParamList, "CropEarnCertificateAfterEnroll">;

interface Certificate {
  id: number;
  srtcomapnyId?: string;
  srtName: string;
  srtNumber?: string;
  applicable: string;
  accreditation?: string;
  serviceAreas?: string;
  price: string;
  timeLine: string;
  commission?: string;
  tearms?: string;
  scope?: string;
  logo?: string;
  noOfVisit?: number;
  modifyBy?: string;
  modifyDate?: string;
  createdAt?: string;
}

const CropEarnCertificateAfterEnroll: React.FC = () => {
  const navigation = useNavigation<CropEarnCertificateAfterEnrollNavigationProp>();
  const route = useRoute<CropEarnCertificateAfterEnrollRouteProp>();
  
  // Safely extract params with defaults
  const { cropId, farmId } = route.params || {};
  
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();
  const [farmName, setFarmName] = useState("");

  console.log("cropid??????", cropId);

  const getMonthLabel = (timeline: string) => {
    const months = parseInt(timeline);
    return months === 1 ? t("EarnCertificate.month") : t("EarnCertificate.months");
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return price;
    
    // Format with 2 decimal places and add commas
    return numPrice.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert(t("Farms.Error"), t("Farms.No authentication token found"), [{ text: t("PublicForum.OK") }]);
        return;
      }

      const res = await axios.get<Certificate[]>(
        `${environment.API_BASE_URL}api/certificate/get-crop-certificate/${farmId}/${cropId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Certificates response:', res.data);
      const sortedCertificates = res.data.sort((a, b) => 
        a.srtName.localeCompare(b.srtName, undefined, { sensitivity: 'base' })
      );
      
      setCertificates(sortedCertificates);
    } catch (err: any) {
      console.error("Error fetching certificates:", err);
      
      if (err.response?.status === 404) {
        Alert.alert(
          t("Main.error"), 
          t("EarnCertificate.No certificates available for farms at the moment"),
          [{ text: t("PublicForum.OK") }]
        );
      } else {
        Alert.alert(
          t("Main.error"), 
          t("Main.somethingWentWrong"),
          [{ text: t("PublicForum.OK") }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCertificateSelect = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setModalVisible(true);
  };

  const handleContinue = () => {
    console.log("Continuing with certificate:", selectedCertificate);
    setModalVisible(false);
    
    navigation.navigate("CropPaymentScreenAfterEnroll", {
      certificateName: selectedCertificate?.srtName || "",
      certificatePrice: selectedCertificate?.price || "",
      certificateValidity: selectedCertificate?.timeLine || "",
      certificateId: selectedCertificate?.id || 0,
      cropId: cropId,
      farmId: farmId
    });
  };

  const handleGoBack = () => {
    setModalVisible(false);
    setSelectedCertificate(null);
  };

  useEffect(() => {
    const fetchFarmName = async () => {
      if (!farmId) return;
      
      try {
        const token = await AsyncStorage.getItem("userToken");
        
        if (!token) {
          console.error("No authentication token found");
          return;
        }

        const response = await axios.get(
          `${environment.API_BASE_URL}api/certificate/get-farmname/${farmId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Farm name response:", response.data);

        if (response.data && response.data.length > 0) {
          setFarmName(response.data[0].farmName);
        }
      } catch (error) {
        console.error("Error fetching farm name:", error);
      }
    };

    fetchFarmName();
  }, [farmId]);

  const handleProceedWithout = () => {
    console.log("Proceeding without certificate");
    navigation.goBack();
  };

  // Filter certificates based on search query
  const filteredCertificates = certificates.filter((cert) =>
    cert.srtName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="bg-white"
      style={{ flex: 1, paddingHorizontal: wp(3), paddingVertical: hp(1.5) }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View className="bg-white px-4 pb-4 shadow-sm">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4 p-2 -ml-2"
          >
            <Ionicons 
              name="chevron-back" 
              size={24} 
              color="#374151" 
              style={{ 
                paddingHorizontal: wp(3), 
                paddingVertical: hp(1.5), 
                backgroundColor: "#F6F6F680", 
                borderRadius: 50 
              }}
            />
          </TouchableOpacity>
          <Text className="font-semibold text-lg text-center flex-1 mr-[10%]">
            {t("EarnCertificate.Earn a Certificate")}
          </Text>
        </View>

        {/* Search Bar */}
        <View className="bg-[#F6F6F6CC] rounded-full flex-row items-center px-4">
          <TextInput
            className="flex-1 text-base text-gray-700"
            placeholder={t("EarnCertificate.Search")}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Ionicons name="search" size={20} color="#0c0c0cff" />
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#A07700" />
          <Text className="text-gray-600 mt-4"> {t("EarnCertificate.Loading certificates")}</Text>
        </View>
      ) : (
        <ScrollView 
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
        >
          {/* Instructions - Only show when there are certificates to display */}
          {filteredCertificates.length > 0 && (
            <Text className="text-center text-gray-600 text-sm mb-3 mr-3 ml-3">
              {t("EarnCertificate.Just click on the certificate you want to apply for")}
            </Text>
          )}

          {/* Certificate List */}
          {filteredCertificates.length > 0 ? (
            filteredCertificates.map((certificate) => (
              <TouchableOpacity
                key={certificate.id}
                onPress={() => handleCertificateSelect(certificate)}
                className="bg-white rounded-xl p-4 mb-3 flex-row items-center border border-[#F2F2F2]"
                activeOpacity={0.7}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                {/* Certificate Icon */}
                <View className="p-1 mr-4">
                  <View className="relative">
                    <Image
                      className="w-[30px] h-[30px]"
                      source={require("../../../assets/images/certificate.png")}
                    />
                  </View>
                </View>

                {/* Certificate Details */}
                <View className="flex-1">
                  <Text className="text-[#070707] font-semibold mb-1">
                    {certificate.srtName}
                  </Text>
                  <Text className="text-[#A07700] font-bold mb-1">
                    {t("EarnCertificate.Rs")}.{formatPrice(certificate.price)}
                  </Text>
                  <Text className="text-[#6B6B6B] text-sm">
                    {t("EarnCertificate.Valid for")} {certificate.timeLine} {getMonthLabel(certificate.timeLine)}
                  </Text>
                </View>

                {/* Arrow Icon */}
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))
          ) : (
   <View className="justify-center items-center py-2" style={{ height: hp(50) }}> {/* Reduced padding, fixed height */}
    <View style={{ 
      height: hp(30),  // Reduced from hp(50)
      width: wp(50),
      marginBottom: hp(-6)  // Negative margin to pull text closer
    }}>
      <LottieView
        source={require("../../../assets/jsons/NoComplaints.json")}
        style={{ width: '100%', height: '100%' }}
        autoPlay
        loop
      />
    </View>
    <Text className="text-gray-500 text-center mt-2" style={{ fontSize: wp(4) }}>
      {searchQuery ? "No certificates found matching your search" : "No certificates available"}
    </Text>
  </View>
          )}

          {/* Proceed Without Certificate Button - Always show */}
          {filteredCertificates.length > 0 && (
          <TouchableOpacity
            onPress={handleProceedWithout}
            className="bg-[#F3F3F5] rounded-full py-3 px-6 mt-6 mb-8 shadow-sm"
            activeOpacity={0.7}
          >
            <Text 
              className="text-center text-[#84868B] text-base font-medium"
              style={[
                i18n.language === "si"
                  ? { fontSize: 14 }
                  : i18n.language === "ta"
                  ? { fontSize: 12 }
                  : { fontSize: 16 }
              ]}
            >
              {t("EarnCertificate.Proceed without a certificate")}
            </Text>
          </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {/* Certificate Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleGoBack}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-white rounded-3xl w-full max-w-sm shadow-lg" style={{ paddingTop: hp(4), paddingBottom: hp(3), paddingHorizontal: wp(6) }}>
            {/* Certificate Icon */}
            <View className="items-center" style={{ marginBottom: hp(2) }}>
              <Image
                style={{ width: wp(20), height: wp(20) }}
                source={require("../../../assets/images/star.png")}
                resizeMode="contain"
              />
            </View>

            {/* Modal Content */}
            <Text className="text-center text-gray-800 mb-2">
              {t("EarnCertificate.The")} <Text className="text-[#A07700] font-semibold">{selectedCertificate?.srtName}</Text>
            </Text>
            <Text className="text-center text-gray-800 mb-2">
              {t("EarnCertificate.costs")} <Text className="text-[#A07700] font-semibold">{t("EarnCertificate.Rs")}.{formatPrice(selectedCertificate?.price || "0")}</Text> {t("EarnCertificate.and is valid for")}
            </Text>
            <Text className="text-center text-gray-800" style={{ marginBottom: hp(3) }}>
              <Text className="text-[#A07700] font-semibold">
                {selectedCertificate?.timeLine} {getMonthLabel(selectedCertificate?.timeLine || "0")}
              </Text>. {t("EarnCertificate.Do you want to apply for it")}
            </Text>

            {/* Action Buttons */}
            <View className="flex-row justify-between gap-3">
              <TouchableOpacity
                onPress={handleGoBack}
                className="flex-1 bg-[#ECECEC] rounded-lg py-3 px-4"
                activeOpacity={0.7}
              >
                <Text 
                  className="text-center text-[#8E8E8E] text-base font-medium"
                  style={[
                    i18n.language === "si"
                      ? { fontSize: 14 }
                      : i18n.language === "ta"
                      ? { fontSize: 12 }
                      : { fontSize: 16 }
                  ]}
                >
                  {t("EarnCertificate.Go Back")}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleContinue}
                className="flex-1 bg-black rounded-lg py-3 px-4"
                activeOpacity={0.8}
              >
                <Text 
                  className="text-center text-white text-base font-medium"
                  style={[
                    i18n.language === "si"
                      ? { fontSize: 14 }
                      : i18n.language === "ta"
                      ? { fontSize: 12 }
                      : { fontSize: 16 }
                  ]}
                >
                  {t("EarnCertificate.Continue")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default CropEarnCertificateAfterEnroll;