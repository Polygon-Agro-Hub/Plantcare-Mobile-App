import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
} from "react-native";
import axios from "axios";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp, useRoute } from "@react-navigation/native";
import { environment } from "@/environment/environment";
import { RootStackParamList } from "../types/types";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import CustomHeader from "../common/CustomHeader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LottieView from "lottie-react-native";
import LoadingPage from "../common/LoadingPage";

const api = axios.create({
  baseURL: environment.API_BASE_URL,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn("Could not read token from AsyncStorage:", e);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

type TransactionReportNavigationProps = StackNavigationProp<
  RootStackParamList,
  "TransactionReport"
>;
type TransactionReportRouteProp = RouteProp<
  RootStackParamList,
  "TransactionReport"
>;

interface TransactionReportProps {
  navigation: TransactionReportNavigationProps;
}

interface PersonalAndBankDetails {
  userId: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  NICnumber: string | null;
  profileImage: string | null;
  qrCode: string | null;
  accNumber: string | null;
  accHolderName: string | null;
  bankName: string | null;
  branchName: string | null;
  companyNameEnglish: string | null;
  collectionCenterName: string | null;
}

interface Crop {
  id: number;
  cropName: string;
  cropNameSinhala: string;
  cropNameTamil: string;
  variety: string;
  varietyNameSinhala: string;
  varietyNameTamil: string;
  grade: string;
  unitPrice: string;
  quantity: string;
  subTotal: string;
  invoiceNumber: string;
  createdAt: string;
}

const TransactionReport: React.FC<TransactionReportProps> = ({
  navigation,
}) => {
  const [details, setDetails] = useState<PersonalAndBankDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const route = useRoute<TransactionReportRouteProp>();
  const { registeredFarmerId, userId, centerId, companyId, transactionDate } =
    route.params;

  const [crops, setCrops] = useState<Crop[]>([]);

  const { t } = useTranslation();

  const calculateTotalSum = (cropsData: Crop[]): number => {
    return (cropsData || []).reduce((sum: number, crop: Crop) => {
      const subTotal =
        typeof crop.subTotal === "string"
          ? parseFloat(crop.subTotal)
          : typeof crop.subTotal === "number"
            ? crop.subTotal
            : 0;
      return sum + subTotal;
    }, 0);
  };

  const totalSum = calculateTotalSum(crops);

  const formatNumberWithCommas = (value: number | string): string => {
    if (value === undefined || value === null) return "0.00";
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) return "0.00";
    return numValue.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatNumber = (value: number | string): string => {
    if (value === undefined || value === null) return "0.00";
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? "0.00" : formatNumberWithCommas(parsed);
    }
    return formatNumberWithCommas(value);
  };

  const selectedDate = transactionDate || new Date().toISOString().slice(0, 10);

  useEffect(() => {
    fetchDetails();
  }, []);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      try {
        const detailsResponse = await api.get(
          `api/auth/user-details/${userId}/${centerId}/${companyId}`,
        );
        const data = detailsResponse.data;
        setDetails({
          userId: data.userId ?? "",
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          phoneNumber: data.phoneNumber ?? "",
          NICnumber: data.NICnumber ?? "",
          profileImage: data.profileImage ?? "",
          qrCode: data.qrCode ?? "",
          accNumber: data.accNumber ?? "",
          accHolderName: data.accHolderName ?? "",
          bankName: data.bankName ?? "",
          branchName: data.branchName ?? "",
          companyNameEnglish: data.companyNameEnglish ?? "company name",
          collectionCenterName: data.centerName ?? "Collection Center",
        });
      } catch (detailsError) {
        console.error("Error fetching user details:", detailsError);
        if (axios.isAxiosError(detailsError)) {
          console.log("Details error response:", detailsError.response?.data);
        }
      }

      try {
        const cropsResponse = await api.get(
          `api/auth/farmer-report/${userId}/${selectedDate}/${registeredFarmerId}`,
        );
        const cropsData = cropsResponse.data?.data || cropsResponse.data || [];
        setCrops(Array.isArray(cropsData) ? cropsData : []);
      } catch (cropsError) {
        console.error("Error fetching crops:", cropsError);
        if (axios.isAxiosError(cropsError)) {
          console.log("Crops error response:", cropsError.response?.data);
        }
        setCrops([]);
      }
    } catch (error) {
      console.error("Error in fetchDetails:", error);
      Alert.alert(
        t("TransactionList.Sorry"),
        t("TransactionList.Failed to load details"),
        [{ text: t("PublicForum.OK") }],
      );
      setCrops([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      let date: Date;
      if (dateString.includes("/") && dateString.includes(".")) {
        const [datePart, timePart] = dateString.split(" ");
        const [year, month, day] = datePart.split("/");
        const [hourMin, period] = timePart.split(" ");
        const [hour, minute] = hourMin.split(".");
        let hour24 = parseInt(hour);
        if (period === "PM" && hour24 !== 12) hour24 += 12;
        else if (period === "AM" && hour24 === 12) hour24 = 0;
        date = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          hour24,
          parseInt(minute),
        );
      } else {
        date = new Date(dateString);
      }

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const period = hours >= 12 ? "PM" : "AM";
      let displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      return `${year}/${month}/${day} ${String(displayHours).padStart(2, "0")}.${minutes} ${period}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  const generatePDF = async (): Promise<string> => {
    if (!details) {
      Alert.alert(
        t("Error.error"),
        t("Error.Details are missing for generating PDF"),
        [{ text: t("PublicForum.OK") }],
      );
      return "";
    }

    const total = calculateTotalSum(crops);

    const html = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            font-size: 10px;
            background-color: white;
            max-width: 800px;
            margin: 0 auto;
            padding: 30px;
            box-sizing: border-box;
          }
          h1 { text-align: center; font-size: 22px; margin-bottom: 15px; font-weight: bold; }
          .header-line { border-top: 1px solid #000; margin: 5px 0 15px 0; }
          .header-row { display: flex; justify-content: space-between; margin-bottom: 15px; }
          .header-item { margin-bottom: 5px; font-size: 11px; }
          .section-title { font-weight: bold; margin-bottom: 5px; font-size: 14px; }
          .supplier-section { display: flex; justify-content: space-between; margin-bottom: 15px; }
          .received-by-section { display: flex; justify-content: space-between; margin-bottom: 15px; }
          .table-title {
            font-weight: bold; margin: 15px 0 5px 0; text-align: center;
            background-color: #D6E6F4; padding: 8px; border: 1px solid #000; font-size: 16px;
          }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          th {
            background-color: #fff; text-align: center; padding: 8px;
            border: 1px solid #000; font-weight: bold; font-size: 12px;
          }
          td { padding: 8px; text-align: center; border: 1px solid #000; font-size: 10px; }
          .total-row { display: flex; justify-content: flex-end; margin: 10px 0; }
          .total-box { display: flex; border: 1px solid #000; }
          .total-label {
            padding: 8px; font-weight: bold; border-right: 1px solid #000;
            background-color: #D6E6F4; font-size: 13px;
          }
          .total-value { padding: 8px; min-width: 150px; text-align: center; font-weight: bold; font-size: 13px; }
          .note { font-size: 11px; margin: 15px 0; font-style: italic; text-align: justify; }
        </style>
      </head>
      <body>
        <h1>${t("TransactionList.Goods Received Note")}</h1>
        <div class="header-line"></div>

        <div class="header-row">
          <div class="header-item">
            <strong>${t("TransactionList.GRN No")} :</strong>
            ${crops.length > 0 ? crops[0].invoiceNumber : "N/A"}
          </div>
          <div class="header-item">
            <strong>${t("TransactionList.Date")} :</strong>
            ${crops.length > 0 ? formatDateTime(crops[0].createdAt) : "N/A"}
          </div>
        </div>

        <div class="supplier-section">
          <div>
            <div class="section-title">${t("TransactionList.Supplier Details")} :</div>
            <div>${t("TransactionList.Name")} : ${details.firstName} ${details.lastName}</div>
          </div>
          <div>
            <div>&nbsp;</div>
            <div>${details.phoneNumber}</div>
          </div>
        </div>

        <div class="received-by-section">
          <div>
            <div class="section-title">${t("TransactionList.Received By")} :</div>
            <div>${t("TransactionList.Company Name")} : ${details.companyNameEnglish || ""}</div>
          </div>
          <div>
            <div>&nbsp;</div>
            <div>${t("TransactionList.Centre")} : ${details.collectionCenterName || "Collection Center"}</div>
          </div>
        </div>

        <div class="table-title">${t("TransactionList.Received Items")}</div>
        <table>
          <thead>
            <tr>
              <th>${t("TransactionList.Crop Name")}</th>
              <th>${t("TransactionList.Variety")}</th>
              <th>${t("TransactionList.Grade")}</th>
              <th>${t("TransactionList.Unit Price(Rs.)")}</th>
              <th>${t("TransactionList.Quantity(kg)")}</th>
              <th>${t("TransactionList.Sub Total(Rs.)")}</th>
            </tr>
          </thead>
          <tbody>
            ${crops
              .map(
                (crop) => `
              <tr>
                <td>${
                  i18next.language === "si"
                    ? crop.cropNameSinhala || "-"
                    : i18next.language === "ta"
                      ? crop.cropNameTamil || "-"
                      : crop.cropName || "-"
                }</td>
                <td>${
                  i18next.language === "si"
                    ? crop.varietyNameSinhala || "-"
                    : i18next.language === "ta"
                      ? crop.varietyNameTamil || "-"
                      : crop.variety || "-"
                }</td>
                <td>${crop.grade || "-"}</td>
                <td>${formatNumberWithCommas(parseFloat(crop.unitPrice || "0"))}</td>
                <td>${formatNumberWithCommas(parseFloat(crop.quantity || "0"))}</td>
                <td>${formatNumberWithCommas(parseFloat(crop.subTotal || "0"))}</td>
              </tr>`,
              )
              .join("")}
          </tbody>
        </table>

        <div class="total-row">
          <div class="total-box">
            <div class="total-label">${t("TransactionList.Full Total (Rs.)")} </div>
            <div class="total-value">: Rs. ${formatNumberWithCommas(total)}</div>
          </div>
        </div>

        <div class="note">
          <strong>${t("TransactionList.Note")}:</strong>
          ${t("TransactionList.This Goods Receipt Note")}
        </div>
      </body>
    </html>`;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      return uri;
    } catch (error) {
      console.error("Error generating PDF:", error);
      Alert.alert(
        t("TransactionList.Sorry"),
        t("TransactionList.PDF was not generated."),
        [{ text: t("PublicForum.OK") }],
      );
      return "";
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const uri = await generatePDF();
      if (!uri) {
        Alert.alert(
          t("TransactionList.Sorry"),
          t("TransactionList.PDF was not generated."),
          [{ text: t("PublicForum.OK") }],
        );
        return;
      }

      const date = new Date().toISOString().slice(0, 10);
      const fileName = `GRN_${crops.length > 0 ? crops[0].invoiceNumber : "N/A"}_${date}.pdf`;

      if (Platform.OS === "android") {
        const tempFilePath = `${(FileSystem as any).cacheDirectory}${fileName}`;
        await FileSystem.copyAsync({ from: uri, to: tempFilePath });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(tempFilePath, {
            dialogTitle: t("Save GRN Report"),
            mimeType: "application/pdf",
            UTI: "com.adobe.pdf",
          });
        } else {
          Alert.alert(
            t("TransactionList.Sorry"),
            t("TransactionList.Sharing is not available on this device"),
            [{ text: t("PublicForum.OK") }],
          );
        }
      } else if (Platform.OS === "ios") {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            dialogTitle: t("TransactionList.Save GRN Report"),
            mimeType: "application/pdf",
            UTI: "com.adobe.pdf",
          });
          Alert.alert(
            t("TransactionList.Info"),
            t(
              'TransactionList.Use the "Save to Files" option to save to Downloads',
            ),
            [{ text: t("PublicForum.OK") }],
          );
        } else {
          Alert.alert(
            t("TransactionList.Sorry"),
            t("TransactionList.Sharing is not available on this device"),
            [{ text: t("PublicForum.OK") }],
          );
        }
      }
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert(
        t("TransactionList.Sorry"),
        t("TransactionList.Failed to save PDF to Downloads folder."),
        [{ text: t("PublicForum.OK") }],
      );
    }
  };

  const handleSharePDF = async () => {
    try {
      const uri = await generatePDF();
      if (!uri) {
        Alert.alert(
          t("TransactionList.Sorry"),
          t("TransactionList.PDF was not generated."),
          [{ text: t("PublicForum.OK") }],
        );
        return;
      }

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert(
          t("TransactionList.Sorry"),
          t("TransactionList.Sharing is not available on this device"),
          [{ text: t("PublicForum.OK") }],
        );
        return;
      }

      const fileName = `PurchaseReport_${crops.length > 0 ? crops[0].invoiceNumber : "N/A"}_${selectedDate}.pdf`;
      const newUri = `${(FileSystem as any).cacheDirectory}${fileName}`;

      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        Alert.alert(
          t("TransactionList.Sorry"),
          t("TransactionList.Generated PDF file not found"),
          [{ text: t("PublicForum.OK") }],
        );
        return;
      }

      await FileSystem.copyAsync({ from: uri, to: newUri });
      await Sharing.shareAsync(newUri, {
        mimeType: "application/pdf",
        dialogTitle: "Share Purchase Report",
        UTI: "com.adobe.pdf",
      });
    } catch (error) {
      console.error("Error in handleSharePDF:", error);

      try {
        const uri = await generatePDF();
        if (uri) {
          await Sharing.shareAsync(uri, {
            mimeType: "application/pdf",
            dialogTitle: "Share Purchase Report",
          });
        }
      } catch (fallbackError) {
        console.error("Fallback sharing also failed:", fallbackError);
        Alert.alert(
          t("TransactionList.Sorry"),
          t("TransactionList.Failed to share PDF file"),
          [{ text: t("PublicForum.OK") }],
        );
      }
    }
  };

  const getTextStyle = (lang: string) => {
    if (lang === "si" || lang === "ta") {
      return { fontSize: 12, lineHeight: 20 };
    }
    return {};
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <CustomHeader
          title={t("TransactionList.Goods Received Note")}
          showBackButton={true}
          navigation={navigation}
          onBackPress={() => navigation.goBack()}
        />
        <View className="flex-1 justify-center items-center mt-[45%]">
          <LoadingPage fullScreen />
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <CustomHeader
        title={t("TransactionList.Goods Received Note")}
        showBackButton={true}
        navigation={navigation}
        onBackPress={() => navigation.goBack()}
      />

      <View className="p-6">
        {/* GRN No & Date */}
        <View className="mb-4 -mt-2">
          <Text
            className="text-sm font-bold"
            style={getTextStyle(i18next.language)}
          >
            {t("TransactionList.GRN No")}:{" "}
            {crops.length > 0 ? crops[0].invoiceNumber : "N/A"}
          </Text>
          <Text className="text-sm" style={getTextStyle(i18next.language)}>
            {t("TransactionList.Date")}:{" "}
            {crops.length > 0 && crops[0].createdAt
              ? formatDateTime(crops[0].createdAt)
              : formatDateTime(selectedDate)}
          </Text>
        </View>

        {/* Supplier Details */}
        <View className="mb-4">
          <Text
            className="font-bold text-sm mb-3"
            style={getTextStyle(i18next.language)}
          >
            {t("TransactionList.Supplier Details")}:
          </Text>
          <View className="border border-gray-300 rounded-lg p-2">
            <Text>
              <Text style={getTextStyle(i18next.language)}>
                {t("TransactionList.Name")}:
              </Text>{" "}
              {details?.firstName} {details?.lastName}
            </Text>
            <Text>
              <Text style={getTextStyle(i18next.language)}>
                {t("TransactionList.Phone")}:
              </Text>{" "}
              {details?.phoneNumber}
            </Text>
          </View>
        </View>

        {/* Received By */}
        <View className="mb-4">
          <Text
            className="font-bold text-sm mb-3"
            style={getTextStyle(i18next.language)}
          >
            {t("TransactionList.Received By")}:
          </Text>
          <View className="border border-gray-300 rounded-lg p-2">
            <Text>
              <Text style={getTextStyle(i18next.language)}>
                {t("TransactionList.Company Name")}:
              </Text>{" "}
              {details?.companyNameEnglish || ""}
            </Text>
            <Text>
              <Text style={getTextStyle(i18next.language)}>
                {t("TransactionList.Centre")}:
              </Text>{" "}
              {details?.collectionCenterName || "Collection Center"}
            </Text>
          </View>
        </View>

        {/* Received Items Table */}
        <View className="mb-4">
          <Text
            className="font-bold text-sm mb-3"
            style={getTextStyle(i18next.language)}
          >
            {t("TransactionList.Received Items")}:
          </Text>
          <ScrollView horizontal className="border border-gray-300 rounded-lg">
            <View>
              {/* Header Row */}
              <View className="flex-row bg-gray-200">
                {[
                  t("TransactionList.Crop Name"),
                  t("TransactionList.Variety"),
                  t("TransactionList.Grade"),
                  t("TransactionList.Unit Price(Rs.)"),
                  t("TransactionList.Quantity(kg)"),
                  t("TransactionList.Sub Total(Rs.)"),
                ].map((header, i, arr) => (
                  <Text
                    key={header}
                    className={`w-24 p-2 font-bold ${i < arr.length - 1 ? "border-r border-gray-300" : ""} ${i === 2 ? "w-20" : ""}`}
                    style={getTextStyle(i18next.language)}
                  >
                    {header}
                  </Text>
                ))}
              </View>

              {/* Data Rows */}
              {crops.map((crop, index) => (
                <View key={`${crop.id}-${index}`} className="flex-row">
                  <Text className="w-24 p-2 border-t border-r border-gray-300">
                    {i18next.language === "si"
                      ? crop.cropNameSinhala || "-"
                      : i18next.language === "ta"
                        ? crop.cropNameTamil || "-"
                        : crop.cropName || "-"}
                  </Text>
                  <Text className="w-24 p-2 border-t border-r border-gray-300">
                    {i18next.language === "si"
                      ? crop.varietyNameSinhala || "-"
                      : i18next.language === "ta"
                        ? crop.varietyNameTamil || "-"
                        : crop.variety || "-"}
                  </Text>
                  <Text className="w-20 p-2 border-t border-r border-gray-300">
                    {crop.grade || "-"}
                  </Text>
                  <Text className="w-24 p-2 border-t border-r border-gray-300 text-right">
                    {formatNumber(crop.unitPrice)}
                  </Text>
                  <Text className="w-24 p-2 border-t border-r border-gray-300 text-right">
                    {formatNumber(crop.quantity)}
                  </Text>
                  <Text className="w-24 p-2 border-t border-gray-300 text-right">
                    {formatNumber(crop.subTotal)}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Divider */}
        <View className="border-t border-gray-400 my-2" />

        {/* Total */}
        <View className="mb-2 mt-2 items-end">
          <Text className="font-bold" style={getTextStyle(i18next.language)}>
            {t("TransactionList.Full Total (Rs.)")} Rs.{" "}
            {formatNumberWithCommas(totalSum)}
          </Text>
        </View>

        {/* Divider */}
        <View className="border-t border-gray-400 my-2" />

        {/* Note */}
        <View className="mb-4">
          <Text className="text-xs">
            <Text className="font-bold">{t("TransactionList.Note")}:</Text>
            <Text className="italic">
              {" "}
              {t("TransactionList.This Goods Receipt Note")}
            </Text>
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-around w-full mb-7">
          <TouchableOpacity
            className="bg-black p-4 h-[80px] w-[120px] rounded-lg items-center justify-center"
            onPress={handleDownloadPDF}
          >
            <Image
              source={require("../../assets/images/transaction/download.webp")}
              style={{ width: 24, height: 24 }}
            />
            <Text className="text-sm text-cyan-50 text-center">
              {t("TransactionList.Download")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-black p-4 h-[80px] w-[120px] rounded-lg items-center justify-center"
            onPress={handleSharePDF}
          >
            <Image
              source={require("../../assets/images/transaction/share.webp")}
              style={{ width: 24, height: 24 }}
            />
            <Text className="text-sm text-cyan-50">
              {t("TransactionList.Share")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default TransactionReport;
