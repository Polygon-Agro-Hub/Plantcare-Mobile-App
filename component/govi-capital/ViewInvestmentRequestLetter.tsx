import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StatusBar,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/types";
import CustomHeader from "../common/CustomHeader";

type ViewInvestmentRequestLetterNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ViewInvestmentRequestLetter"
>;

interface ViewInvestmentRequestLetterParams {
  request?: any;
  crop?: string;
  cropId?: string;
  extent?: {
    ha: number;
    ac: number;
    p: number;
  };
  investment?: number;
  expectedYield?: number;
  startDate?: string;
  nicFrontImage?: string;
  nicBackImage?: string;
}

interface ViewInvestmentRequestLetterProps {
  navigation: ViewInvestmentRequestLetterNavigationProp;
  route: {
    params?: ViewInvestmentRequestLetterParams;
  };
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

  function getCropName(requestData: any) {
    const currentLanguage = i18n.language;

    switch (currentLanguage) {
      case "si":
      case "sinhala":
        return (
          requestData.cropNameSinhala ||
          requestData.cropNameEnglish ||
          t("Govicapital.UnknownCrop")
        );
      case "ta":
      case "tamil":
        return (
          requestData.cropNameTamil ||
          requestData.cropNameEnglish ||
          t("Govicapital.UnknownCrop")
        );
      case "en":
      case "english":
      default:
        return requestData.cropNameEnglish || t("Govicapital.UnknownCrop");
    }
  }

  const formatExtentText = () => {
    const parts = [];

    if (extent?.ha && extent.ha > 0) {
      parts.push(`${extent.ha} ${t("Govicapital.Hectare")}`);
    }

    if (extent?.ac && extent.ac > 0) {
      parts.push(`${extent.ac} ${t("Govicapital.Acres")}`);
    }

    if (extent?.p && extent.p > 0) {
      parts.push(`${extent.p} ${t("Govicapital.Perches")}`);
    }

    if (parts.length === 0) {
      return "N/A";
    }

    if (parts.length === 1) {
      return parts[0];
    } else if (parts.length === 2) {
      return `${parts[0]} ${t("Govicapital.And")} ${parts[1]}`;
    } else {
      return `${parts[0]}, ${parts[1]} ${t("Govicapital.And")} ${parts[2]}`;
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

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
          {t("Govicapital.LoadingFarmerDetails")}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <CustomHeader
        title={t("Govicapital.RequestLetter")}
        navigation={navigation}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="bg-white rounded-2xl  mb-5">
          <Text className="text-[#070707] mb-3 text-sm">
            {t("Govicapital.DearSirMadam")}
          </Text>

          <Text className="text-[#070707] leading-5 mb-3">
            {t(
              "Govicapital.IFarmersNameAFarmerFromDistrictAmWritingToFormallyRequestAnAgriculturalInvestmentForTheUpcomingCultivationSeason",
            )
              .replace("[Farmer's Name]", farmerName)
              .replace("[District]", district)}
          </Text>

          <Text className="text-[#070707] leading-5 mb-3">
            {t("Govicapital.TheProjectDetailsAreAsFollows")}
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
                  {t("Govicapital.ExpectedInvestment")}:
                </Text>
                <Text className="text-[#070707] mt-1 font-semibold">
                  {t("Govicapital.Rs")} {formatCurrency(investment)}
                </Text>
              </View>
            </View>

            {/* Expected Yield */}
            <View className="flex-row mb-3">
              <Text className="text-[#070707]">• </Text>
              <View className="flex-1">
                <Text className="text-[#070707]">
                  {t("Govicapital.ExpectedYield")}:
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
                  {t("Govicapital.CultivationStartDate")}:
                </Text>
                <Text className="text-[#070707] mt-1 font-semibold">
                  {startDate ? formatDate(startDate) : "N/A"}
                </Text>
              </View>
            </View>
          </View>

          <Text className="text-[#070707] leading-5 mb-3">
            {t(
              "Govicapital.ThisInvestmentIsEssentialForCoveringTheCostsOfHighQualitySeedsFertilizersPesticidesIrrigationFacilitiesAndLaborExpensesForTheProjectedYearTheExpectedHarvestIsSufficientToGenerateSufficientRevenueForTheTimelyRepaymentOfTheLoanAlongWithAccruedInterest",
            )}
          </Text>

          <Text className="text-[#070707] leading-5 mb-3">
            {t(
              "Govicapital.IHaveAAttachedTheNecessaryDocumentsForYourPerusal",
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
              "Govicapital.IAmConfidentInTheSuccessOfThisVentureAndRequestYouToKindlyApproveMyLoanApplicationILookForwardToYourFavorableTimeAndConsideration",
            )}
          </Text>

          <View className="mt-3">
            <Text className="text-gray-700 font-semibold mb-1">
              {t("Govicapital.Sincerely")}
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
