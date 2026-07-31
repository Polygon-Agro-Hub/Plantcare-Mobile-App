import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { MaterialIcons } from "@expo/vector-icons";
import CustomHeader from "@/component/common/CustomHeader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { environment } from "@/environment/environment";

interface PaymentSummaryProps {
  navigation?: any;
  route?: any;
  subTotal?: number;
  processingFeePercentage?: number;
  processingFee?: number;
  fullTotal?: number;
  onContinuePress?: () => void;
  title?: string;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  navigation,
  route,
  subTotal: propsSubTotal,
  processingFeePercentage: propsProcessingFeePercentage,
  processingFee: propsProcessingFee,
  fullTotal: propsFullTotal,
  onContinuePress,
  title: propsTitle,
}) => {
  const { t, i18n } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);

  // Extract variables from navigation params or props, fallback to user request defaults
  const valSubTotal = route?.params?.subTotal ?? propsSubTotal ?? 5000;
  const valFeePercent =
    route?.params?.processingFeePercentage ?? propsProcessingFeePercentage ?? 2;
  const valFee = route?.params?.processingFee ?? propsProcessingFee ?? 100;
  const valFullTotal = route?.params?.fullTotal ?? propsFullTotal ?? 5100;
  const pageTitle =
    route?.params?.title ?? propsTitle ?? t("Payment.PaymentSummary", "Payment Summery");

  const isRequestInspection = route?.params?.isRequestInspection ?? false;
  const requestItems = route?.params?.requestItems ?? [];

  const isCertificatePayment = route?.params?.isCertificatePayment ?? false;
  const certificateType = route?.params?.certificateType;
  const certificateId = route?.params?.certificateId;
  const cropId = route?.params?.cropId;
  const farmId = route?.params?.farmId;
  const farmName = route?.params?.farmName;
  const certificateName = route?.params?.certificateName;
  const validityMonths = route?.params?.validityMonths;

  const formatCurrency = (amount: number, prefix: string = "") => {
    const formatted = amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${prefix}Rs.${formatted}`;
  };

  const handleContinue = async () => {
    if (isRequestInspection) {
      setIsProcessing(true);
      try {
        const mockTransactionId = "TXN_" + Date.now();
        const token = await AsyncStorage.getItem("userToken");

        // Map over request items to attach the 5% processing fee to each item
        const requestItemsWithFee = requestItems.map((item: any) => ({
          ...item,
          processFee: item.amount * 0.05,
        }));

        const requestData = {
          requestItems: requestItemsWithFee,
          paymentTransactionId: mockTransactionId,
          totalAmount: valSubTotal, // SubTotal matches the sum of request items
          paymentMethod: "direct",
          paymentStatus: "completed",
        };

        const response = await axios.post(
          `${environment.API_BASE_URL}api/requestinspection/submit-request`,
          requestData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        setIsProcessing(false);

        if (response.data && response.data.status === "success") {
          Alert.alert(
            t("Main.Success", "Success"),
            t(
              "RequestInspectionForm.YourInspectionRequestHasBeenSubmittedSuccessfully",
              "Your inspection request has been submitted successfully.",
            ),
            [
              {
                text: t("Main.OK", "OK"),
                onPress: () => {
                  navigation?.navigate("Main", {
                    screen: "RequestHistory",
                  });
                },
              },
            ],
          );
        } else {
          Alert.alert(
            t("Main.Error", "Error"),
            t(
              "RequestInspectionForm.RequestInspection Submitting error, Please try again later",
              "RequestInspection submitting error. Please try again later.",
            ),
            [{ text: t("Main.OK", "OK") }],
          );
        }
      } catch (error: any) {
        setIsProcessing(false);
        console.error("Error submitting inspection request:", error);

        let errorMessage = t(
          "Main.SomethingWentWrongPleaseTryAgainlater",
          "Something went wrong. Please try again later.",
        );

        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        Alert.alert(t("Main.Error", "Error"), errorMessage, [
          { text: t("Main.OK", "OK") },
        ]);
      }
    } else if (isCertificatePayment) {
      setIsProcessing(true);
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          Alert.alert(t("Main.Error", "Error"), t("Farms.NoAuthenticationTokenFound", "No authentication token found."));
          setIsProcessing(false);
          return;
        }

        const paymentData = {
          certificateId: certificateId,
          amount: valSubTotal.toString(),
          validityMonths: validityMonths ?? 18,
          processFee: valFee,
        };

        let url = "";
        if (certificateType === "Farm" || certificateType === "Cultivation") {
          url = `${environment.API_BASE_URL}api/certificate/certificate-payment/${farmId}`;
        } else {
          url = `${environment.API_BASE_URL}api/certificate/certificate-crop-payment/${cropId}`;
        }

        const response = await axios.post(url, paymentData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        setIsProcessing(false);

        if (response.data && response.data.data) {
          Alert.alert(
            t("Main.Success", "Success"),
            t(
              "Farms.YouHaveSuccessfullyAppliedForYourCertificate",
              "You have successfully applied for your certificate.",
            ),
            [
              {
                text: t("Main.Continue", "Continue"),
                onPress: async () => {
                  if (certificateType === "Farm") {
                    navigation?.navigate("Main", {
                      screen: "AddFarmList",
                    });
                  } else if (certificateType === "Cultivation" || certificateType === "Crop") {
                    navigation?.navigate("Main", {
                      screen: "FarmDetailsScreen",
                      params: {
                        farmId: farmId,
                        farmName: farmName,
                      },
                    });
                  } else if (certificateType === "CropAfterEnroll") {
                    try {
                      setIsProcessing(true);
                      const cropRes = await axios.get(
                        `${environment.API_BASE_URL}api/certificate/get-cropName/${cropId}`,
                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        }
                      );
                      setIsProcessing(false);
                      let cropCalId = "";
                      let cName = certificateName || "Crop";
                      if (cropRes.data && cropRes.data.length > 0) {
                        const cropInfo = cropRes.data[0];
                        cropCalId = String(cropInfo.cropCalendarId);
                        const lang = i18n.language || "en";
                        cName = lang === "si" 
                          ? cropInfo.varietyNameSinhala 
                          : lang === "ta" 
                            ? cropInfo.varietyNameTamil 
                            : cropInfo.varietyNameEnglish;
                      }

                      navigation?.navigate("FramcropCalenderwithcertificate", {
                        farmId: farmId,
                        farmName: farmName,
                        cropId: cropCalId,
                        cropName: cName,
                        startedAt: new Date(),
                        requiredImages: [],
                        ongoingCropId: String(cropId),
                      });
                    } catch (err) {
                      setIsProcessing(false);
                      console.error("Error fetching crop info:", err);
                      navigation?.navigate("Main", {
                        screen: "FarmDetailsScreen",
                        params: {
                          farmId: farmId,
                          farmName: farmName,
                        },
                      });
                    }
                  }
                },
              },
            ]
          );
        } else {
          Alert.alert(
            t("Main.Error", "Error"),
            t("Main.SomethingWentWrongPleaseTryAgainlater", "Something went wrong. Please try again later.")
          );
        }
      } catch (error: any) {
        setIsProcessing(false);
        console.error("Error processing certificate payment:", error);
        let msg = t("Main.SomethingWentWrongPleaseTryAgainlater", "Something went wrong. Please try again later.");
        if (error.response?.data?.message) {
          msg = error.response.data.message;
        }
        Alert.alert(t("Main.Error", "Error"), msg);
      }
    } else {
      if (route?.params?.nextScreen) {
        if (navigation) {
          navigation.navigate(route.params.nextScreen, {
            ...route.params.nextScreenParams,
            processFee: valFee,
            fullTotal: valFullTotal,
          });
        }
      } else if (onContinuePress) {
        onContinuePress();
      } else if (navigation) {
        navigation.navigate("PaymentScreen", {
          certificatePrice: valFullTotal.toString(),
        });
      }
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Custom Header */}
      <CustomHeader
        title={pageTitle}
        navigation={navigation}
        onBackPress={() => navigation?.goBack()}
      />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingBottom: 40,
        }}
        className="bg-white px-5"
        showsVerticalScrollIndicator={false}
      >
        {/* Verification Image */}
        <View className="flex justify-center items-center my-4">
          <Image
            source={require("../../assets/images/payments/payment-summery.webp")}
            style={{ width: "100%", height: 280 }}
            resizeMode="contain"
          />
        </View>

        {/* Pricing Summary Box */}
        <View style={styles.shadowBox} className="bg-white p-5 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text
              style={{ color: "#414347", fontWeight: "normal" }}
              className="text-base"
            >
              {t("Payment.SubTotal", "Sub Total")}
            </Text>
            <Text
              style={{ color: "#212121", fontWeight: "bold" }}
              className="text-base"
            >
              {formatCurrency(valSubTotal)}
            </Text>
          </View>

          <View className="flex-row justify-between items-center mb-4">
            <Text
              style={{ color: "#414347", fontWeight: "normal" }}
              className="text-base"
            >
              {t("Payment.ProcessingFee", "Processing Fee")} ({valFeePercent}%)
            </Text>
            <Text
              style={{ color: "#212121", fontWeight: "bold" }}
              className="text-base"
            >
              {formatCurrency(valFee, "+ ")}
            </Text>
          </View>

          {/* Border Line */}
          <View className="border-b border-[#D1D7E4] my-2" />

          <View className="flex-row justify-between items-center mt-4">
            <Text
              style={{ color: "#414347", fontWeight: "normal", fontSize: 18 }}
            >
              {t("Payment.FullTotal", "Full Total")}
            </Text>
            <Text
              style={{ color: "#A07700", fontWeight: "bold", fontSize: 20 }}
            >
              {formatCurrency(valFullTotal)}
            </Text>
          </View>
        </View>

        {/* Secure Info Alert Box */}
        <View
          style={styles.secureBox}
          className="flex-row items-center p-4 mb-8"
        >
          {/* Rounded Shield Icon Background */}
          <View
            style={styles.iconContainer}
            className="justify-center items-center mr-4"
          >
            <MaterialIcons name="security" size={24} color="#0F5132" />
          </View>
          <Text
            style={styles.secureText}
            className="flex-1 font-medium text-sm leading-5"
          >
            {t(
              "Payment.SecureInfo",
              "Your payment information is secure and encrypted.",
            )}
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleContinue}
          disabled={isProcessing}
          className="rounded-3xl h-[50px] justify-center items-center bg-[#000000] shadow-md mx-6"
          style={styles.buttonShadow}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text className="text-white font-bold text-center text-base">
              {t("Payment.ContinueToPayment", "Continue to Payment")}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowBox: {
    borderColor: "#D1D7E4",
    borderWidth: 1,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  secureBox: {
    backgroundColor: "#E8FFF4",
    borderColor: "#E8FFF4",
    borderWidth: 1,
    borderRadius: 12,
  },
  iconContainer: {
    backgroundColor: "#B5FFDB",
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  secureText: {
    color: "#0F5132",
  },
  buttonShadow: {
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});

export default PaymentSummary;
