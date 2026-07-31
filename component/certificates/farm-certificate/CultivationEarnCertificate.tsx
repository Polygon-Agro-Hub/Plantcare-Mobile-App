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
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import axios from "axios";
import CustomHeader from "@/component/common/CustomHeader";
import NoData from "@/component/common/NoData";

type CultivationEarnCertificateNavigationProp = StackNavigationProp<
  RootStackParamList,
  "CultivationEarnCertificate"
>;

type CultivationEarnCertificateRouteProp = RouteProp<
  RootStackParamList,
  "CultivationEarnCertificate"
>;

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

const CultivationEarnCertificate: React.FC = () => {
  const navigation = useNavigation<CultivationEarnCertificateNavigationProp>();
  const route = useRoute<CultivationEarnCertificateRouteProp>();

  const { farmId, registrationCode, farmName } = route.params || {};

  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();

  const getMonthLabel = (timeline: string) => {
    const months = parseInt(timeline);
    return months === 1
      ? t("EarnCertificate.month")
      : t("EarnCertificate.Months");
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return price;

    return numPrice.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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
        Alert.alert(
          t("Main.Error"),
          t("Farms.NoAuthenticationTokenFound"),
          [{ text: t("Main.OK") }],
        );
        return;
      }

      const res = await axios.get<Certificate[]>(
        `${environment.API_BASE_URL}api/certificate/get-farms-certificate/${farmId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const sortedCertificates = res.data.sort((a, b) =>
        a.srtName.localeCompare(b.srtName, undefined, { sensitivity: "base" }),
      );

      setCertificates(sortedCertificates);
    } catch (err: any) {
      console.error("Error fetching certificates:", err);

      if (err.response?.status === 404) {
        Alert.alert(
          t("Main.Error"),
          "No certificates available for farms at the moment",
          [{ text: t("Main.OK") }],
        );
      } else {
        Alert.alert(t("Main.Error"), t("Main.SomethingWentWrongPleaseTryAgainlater"), [
          { text: t("Main.OK") },
        ]);
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
    setModalVisible(false);

    const priceNum = parseFloat(selectedCertificate?.price || "0");
    const commissionNum = parseFloat(selectedCertificate?.commission || "0");
    const percent = parseFloat(commissionNum.toFixed(2));
    const calculatedFee = parseFloat((priceNum * (percent / 100)).toFixed(2));
    const calculatedTotal = priceNum + calculatedFee;

    const match = String(selectedCertificate?.timeLine || "18").match(/(\d+)/);
    const validity = match ? parseInt(match[1]) : 18;

    navigation.navigate("PaymentSummary", {
      subTotal: priceNum,
      processingFee: calculatedFee,
      processingFeePercentage: percent,
      fullTotal: calculatedTotal,
      title: t("Payment.PaymentSummary", "Payment Summary"),
      isCertificatePayment: true,
      certificateType: "Cultivation",
      certificateId: selectedCertificate?.id || 0,
      farmId: farmId,
      farmName: farmName,
      certificateName: selectedCertificate?.srtName || "",
      validityMonths: validity,
    });
  };

  const handleGoBack = () => {
    setModalVisible(false);
    setSelectedCertificate(null);
  };

  const handleProceedWithout = () => {
    navigation.navigate("Main", {
      screen: "FarmDetailsScreen",
      params: { farmId: farmId, farmName: farmName },
    });
  };

  const filteredCertificates = certificates.filter((cert) =>
    cert.srtName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="bg-white"
      style={{ flex: 1 }}
    >
      

      <CustomHeader
        title={t("EarnCertificate.EarnACertificate")}
        navigation={navigation}
        onBackPress={() => navigation.goBack()}
      />
      <View className="bg-white px-4 pb-4 shadow-sm">
        <View className="bg-[#F6F6F6CC] rounded-3xl h-[50px] flex-row items-center px-4">
          <TextInput
            className="flex-1 text-lg text-gray-700"
            placeholder={t("Main.Search...")}
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
          <Text className="text-gray-600 mt-4">
            {" "}
            {t("EarnCertificate.LoadingCertificates")}
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
        >
          {filteredCertificates.length > 0 && (
            <Text className="text-center text-gray-600 text-sm mb-3 mr-3 ml-3">
              {t(
                "EarnCertificate.JustClickOnTheCertificateYouWantToApplyFor",
              )}
            </Text>
          )}

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
                <View className="p-1 mr-4">
                  <View className="relative">
                    <Image
                      className="w-[30px] h-[30px]"
                      source={require("../../../assets/images/certificates/certificate.webp")}
                    />
                  </View>
                </View>

                <View className="flex-1">
                  <Text className="text-[#070707] font-semibold mb-1">
                    {certificate.srtName}
                  </Text>
                  <Text className="text-[#A07700] font-bold mb-1">
                    {t("EarnCertificate.Rs")}.{formatPrice(certificate.price)}
                  </Text>
                  <Text className="text-[#6B6B6B] text-sm">
                    {t("Farms.ValidityPeriod")} {certificate.timeLine}{" "}
                    {getMonthLabel(certificate.timeLine)}
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))
          ) : (
              <NoData
                text={
                  searchQuery
                    ? "No certificates found matching your search"
                    : "No certificates available"
                }
              />
          )}

          {filteredCertificates.length > 0 && (
            <TouchableOpacity
              onPress={handleProceedWithout}
              className="bg-[#F3F3F5] rounded-3xl h-[50px] justify-center px-6 mt-6 mb-8 shadow-sm"
              activeOpacity={0.7}
              style={{
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <Text
                className="text-center text-[#84868B] text-base font-medium"
                style={[
                  i18n.language === "si"
                    ? { fontSize: 14 }
                    : i18n.language === "ta"
                      ? { fontSize: 12 }
                      : { fontSize: 18 },
                ]}
              >
                {t("EarnCertificate.ProceedWithoutACertificate")}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleGoBack}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View
            className="bg-white rounded-3xl w-full max-w-sm shadow-lg"
            style={{
              paddingTop: hp(4),
              paddingBottom: hp(3),
              paddingHorizontal: wp(6),
            }}
          >
            <View className="items-center" style={{ marginBottom: hp(2) }}>
              <Image
                style={{ width: wp(20), height: wp(20) }}
                source={require("../../../assets/images/certificates/star.webp")}
                resizeMode="contain"
              />
            </View>

            <Text className="text-center text-gray-800 mb-2">
              {t("EarnCertificate.The")}{" "}
              <Text className="text-[#A07700] font-semibold">
                {selectedCertificate?.srtName}
              </Text>
            </Text>
            <Text className="text-center text-gray-800 mb-2">
              {t("EarnCertificate.Costs")}{" "}
              <Text className="text-[#A07700] font-semibold">
                {t("EarnCertificate.Rs")}.
                {formatPrice(selectedCertificate?.price || "0")}
              </Text>{" "}
              {t("EarnCertificate.AndIsValidFor")}
            </Text>
            <Text
              className="text-center text-gray-800"
              style={{ marginBottom: hp(3) }}
            >
              <Text className="text-[#A07700] font-semibold">
                {selectedCertificate?.timeLine}{" "}
                {getMonthLabel(selectedCertificate?.timeLine || "0")}
              </Text>
              . {t("EarnCertificate.DoYouWantToApplyForIt")}
            </Text>

            <View className="flex-row justify-between gap-3">
              <TouchableOpacity
                onPress={handleGoBack}
                className="flex-1 bg-[#ECECEC] rounded-lg h-[50px] justify-center px-4"
                activeOpacity={0.7}
              >
                <Text
                  className="text-center text-[#8E8E8E] text-lg font-medium"
                  style={[
                    i18n.language === "si"
                      ? { fontSize: 14 }
                      : i18n.language === "ta"
                        ? { fontSize: 12 }
                        : { fontSize: 16 },
                  ]}
                >
                  {t("Main.GoBack")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleContinue}
                className="flex-1 bg-black rounded-lg h-[50px] justify-center px-4"
                activeOpacity={0.8}
              >
                <Text
                  className="text-center text-white text-lg font-medium"
                  style={[
                    i18n.language === "si"
                      ? { fontSize: 14 }
                      : i18n.language === "ta"
                        ? { fontSize: 12 }
                        : { fontSize: 16 },
                  ]}
                >
                  {t("Main.Continue")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default CultivationEarnCertificate;
