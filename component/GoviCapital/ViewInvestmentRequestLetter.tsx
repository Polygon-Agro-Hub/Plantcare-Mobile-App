import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import { useTranslation } from "react-i18next";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";

interface ViewInvestmentRequestLetterProps {
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

const ViewInvestmentRequestLetter: React.FC<
  ViewInvestmentRequestLetterProps
> = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();

  const [farmerDetails, setFarmerDetails] = useState<FarmerDetails | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const { request } = route.params || {};

  const isViewingExisting = !!request;

  const crop = request ? getCropName(request) : route.params?.crop;
  const cropId = request?.cropId || route.params?.cropId;
  const extent = request
    ? {
        ha: request.extentha,
        ac: request.extentac,
        p: request.extentp,
      }
    : route.params?.extent;
  const investment = request?.investment || route.params?.investment;
  const expectedYield = request?.expectedYield || route.params?.expectedYield;
  const startDate = request?.startDate || route.params?.startDate;
  const nicFrontImage = request?.nicFront || route.params?.nicFrontImage;
  const nicBackImage = request?.nicBack || route.params?.nicBackImage;
  const jobId = request?.jobId;
  const reqStatus = request?.reqStatus;
  const createdAt = request?.createdAt;

  function getCropName(requestData: any) {
    const currentLanguage = i18n.language;

    switch (currentLanguage) {
      case "si":
      case "sinhala":
        return (
          requestData.cropNameSinhala ||
          requestData.cropNameEnglish ||
          t("Govicapital.Unknown Crop")
        );
      case "ta":
      case "tamil":
        return (
          requestData.cropNameTamil ||
          requestData.cropNameEnglish ||
          t("Govicapital.Unknown Crop")
        );
      case "en":
      case "english":
      default:
        return requestData.cropNameEnglish || t("Govicapital.Unknown Crop");
    }
  }

  // Format extent text - only show non-zero values
  const formatExtentText = () => {
    const parts = [];

    if (extent?.ha && extent.ha > 0) {
      parts.push(`${extent.ha} ${t("Govicapital.hectare")}`);
    }

    if (extent?.ac && extent.ac > 0) {
      parts.push(`${extent.ac} ${t("Govicapital.acres")}`);
    }

    if (extent?.p && extent.p > 0) {
      parts.push(`${extent.p} ${t("Govicapital.perches")}`);
    }

    if (parts.length === 0) {
      return "N/A";
    }

    if (parts.length === 1) {
      return parts[0];
    } else if (parts.length === 2) {
      return `${parts[0]} ${t("Govicapital.and")} ${parts[1]}`;
    } else {
      return `${parts[0]}, ${parts[1]} ${t("Govicapital.and")} ${parts[2]}`;
    }
  };

  const formatCurrency = (amount: number | string) => {
    if (!amount) return "0.00";

    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

    return numAmount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get status display
  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "under_review":
      case "pending":
        return {
          text: t("Govicapital.Request Under Review"),
          color: "#C49400",
        };
      case "approved":
        return {
          text: t("Govicapital.Request Approved"),
          color: "#00C1AB",
        };
      case "rejected":
        return {
          text: t("Govicapital.Request Rejected"),
          color: "#FF0000",
        };
      default:
        return {
          text: status || t("Govicapital.Unknown Status"),
          color: "#9CA3AF",
        };
    }
  };

  useEffect(() => {
    if (!isViewingExisting) {
      validateParams();
    }
    fetchFarmerDetails();
  }, []);

  const validateParams = () => {
    const missingParams = [];
    if (!crop) missingParams.push("crop");
    if (!cropId) missingParams.push("cropId");
    if (!extent) missingParams.push("extent");
    if (!investment) missingParams.push("investment");
    if (!expectedYield) missingParams.push("expectedYield");
    if (!startDate) missingParams.push("startDate");
    if (!nicFrontImage) missingParams.push("nicFrontImage");
    if (!nicBackImage) missingParams.push("nicBackImage");

    if (missingParams.length > 0) {
      console.error("Missing required parameters:", missingParams);
      Alert.alert(
        "Missing Information",
        `Please provide: ${missingParams.join(", ")}`,
        [{ text: "OK", onPress: () => navigation.goBack() }],
      );
    }
  };

  const fetchFarmerDetails = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert(
          "Error",
          "Authentication token not found. Please login again.",
        );
        return;
      }

      const response = await axios.get(
        `${environment.API_BASE_URL}api/goviCapital/get-farmer-details`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (
        response.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        setFarmerDetails(response.data[0]);
      } else {
        Alert.alert("Error", "Could not fetch farmer details");
      }
    } catch (error) {
      console.error("Error fetching farmer details:", error);
      Alert.alert("Error", "Failed to load farmer details");
    } finally {
      setLoading(false);
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
        <Text className="mt-3 text-gray-600">
          {t("Govicapital.Loading farmer details")}
        </Text>
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
                    : { fontSize: 17 },
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
          <Text className="text-[#070707] mb-3 text-sm">
            {t("Govicapital.Dear Sir/Madam,")}
          </Text>

          <Text className="text-[#070707] leading-5 mb-3">
            {t(
              "Govicapital.I, [Farmer's Name], a farmer from [District], am writing to request agricultural loan for the upcoming cultivation season.",
            )
              .replace("[Farmer's Name]", farmerName)
              .replace("[District]", district)}
          </Text>

          <Text className="text-[#070707] leading-5 mb-3">
            {t("Govicapital.The project details are as follows")}
          </Text>

          <View className="mb-3">
            {/* Crop */}
            <View className="flex-row mb-3">
              <Text className="text-[#070707]">• </Text>
              <View className="flex-1">
                <Text className="text-[#070707]">{t("Govicapital.Crop")}:</Text>
                <Text className="text-[#070707] mt-1 font-semibold">
                  {crop || "N/A"}
                </Text>
              </View>
            </View>

            {/* Extent */}
            <View className="flex-row mb-3">
              <Text className="text-[#070707]">• </Text>
              <View className="flex-1">
                <Text className="text-[#070707]">
                  {t("Govicapital.Extent")}:
                </Text>
                <Text className="text-[#070707] mt-1 font-semibold">
                  {formatExtentText()}
                </Text>
              </View>
            </View>

            {/* Expected Investment */}
            <View className="flex-row mb-3">
              <Text className="text-[#070707]">• </Text>
              <View className="flex-1">
                <Text className="text-[#070707]">
                  {t("Govicapital.Expected Investment")}:
                </Text>
                <Text className="text-[#070707] mt-1 font-semibold">
                  {t("Govicapital.Rs.")}
                  {formatCurrency(investment)}
                </Text>
              </View>
            </View>

            {/* Expected Yield */}
            <View className="flex-row mb-3">
              <Text className="text-[#070707]">• </Text>
              <View className="flex-1">
                <Text className="text-[#070707]">
                  {t("Govicapital.Expected Yield")}:
                </Text>
                <Text className="text-[#070707] mt-1 font-semibold">
                  {expectedYield || 0} kg
                </Text>
              </View>
            </View>

            {/* Cultivation Start Date */}
            <View className="flex-row mb-3">
              <Text className="text-[#070707]">• </Text>
              <View className="flex-1">
                <Text className="text-[#070707]">
                  {t("Govicapital.Cultivation Start Date")}:
                </Text>
                <Text className="text-[#070707] mt-1 font-semibold">
                  {startDate ? formatDate(startDate) : "N/A"}
                </Text>
              </View>
            </View>
          </View>

          <Text className="text-[#070707] leading-5 mb-3">
            {t(
              "Govicapital.This loan is essential for covering the costs of high-quality seeds, fertilizers, pesticides, irrigation facilities, and labor expenses for the projected year. The expected harvest is sufficient to generate sufficient revenue for the timely repayment of the loan, along with accrued interest.",
            )}
          </Text>

          <Text className="text-[#070707] leading-5 mb-3">
            {t(
              "Govicapital.I have attached the necessary documents for your perusal.",
            )}
          </Text>

          {/* NIC Images */}
          {(nicFrontImage || nicBackImage) && (
            <View className="flex-row justify-between mb-4">
              {nicFrontImage && (
                <View className="flex-1 mr-2">
                  <Image
                    source={{ uri: nicFrontImage }}
                    className="w-full h-32 rounded-lg"
                    resizeMode="cover"
                  />
                </View>
              )}
              {nicBackImage && (
                <View className="flex-1 ml-2">
                  <Image
                    source={{ uri: nicBackImage }}
                    className="w-full h-32 rounded-lg"
                    resizeMode="cover"
                  />
                </View>
              )}
            </View>
          )}

          <Text className="text-gray-700 leading-5 mb-3">
            {t(
              "Govicapital.I am confident in the success of this venture and request you to kindly approve my loan application. I look forward to your favorable time and consideration.",
            )}
          </Text>

          <View className="mt-3">
            <Text className="text-gray-700 font-semibold mb-1">
              {t("Govicapital.Sincerely,")}
            </Text>
            <Text className="text-gray-700">{farmerName}</Text>
            <Text className="text-gray-700">{contactNumber}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ViewInvestmentRequestLetter;
