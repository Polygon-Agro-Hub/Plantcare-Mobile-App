import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useRoute } from '@react-navigation/native';
import {environment} from '@/environment/environment';
import { RootStackParamList } from './types';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import QRCode from 'react-native-qrcode-svg';
import { useTranslation } from "react-i18next";
import { AntDesign } from '@expo/vector-icons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import i18n from '@/i18n/i18n';
import i18next from 'i18next';
const api = axios.create({
  baseURL: environment.API_BASE_URL,
});

type TransactionReportNavigationProps = StackNavigationProp<RootStackParamList, 'TransactionReport'>;
type TransactionReportRouteProp = RouteProp<RootStackParamList, 'TransactionReport'>;

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
  createdAt:string
}

interface officerDetails {
  QRCode: string;
  empId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

const TransactionReport: React.FC<TransactionReportProps> = ({ navigation }) => {
  const [details, setDetails] = useState<PersonalAndBankDetails | null>(null);
  const [officerDetails, setOfficerDetails] = useState<officerDetails | null>(null);
  const route = useRoute<TransactionReportRouteProp>();
  const {
    registeredFarmerId,
    userId,
    centerId,
    companyId,
    firstName,
    lastName,
    phoneNumber,
    address,
    NICnumber,
    totalAmount,
    bankAddress,
    accountNumber,
    accountHolderName,
    bankName,
    branchName,
    transactionDate,
  } = route.params;
  
  console.log('Farmer Report:', route.params);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [qrValue, setQrValue] = useState<string>("");
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Calculate the total sum from all crop subtotals
  const calculateTotalSum = (cropsData: Crop[]): number => {
    return (cropsData || []).reduce((sum: number, crop: Crop) => {
      const subTotal = typeof crop.subTotal === 'string' 
        ? parseFloat(crop.subTotal) 
        : typeof crop.subTotal === 'number'
          ? crop.subTotal
          : 0;
      return sum + subTotal;
    }, 0);
  };

  // Get the total sum for display
  const totalSum = calculateTotalSum(crops);

  const formatNumberWithCommas = (value: number | string): string => {
    // Handle undefined or null values
    if (value === undefined || value === null) {
      return '0.00';
    }
    
    // Convert to number if it's a string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // Check if it's a valid number
    if (isNaN(numValue)) {
      return '0.00';
    }
    
    // Format with 2 decimal places and add commas for thousands
    return numValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  
  // Format number function that handles potential invalid inputs
  const formatNumber = (value: number | string): string => {
    if (value === undefined || value === null) {
      return '0.00';
    }
    
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? '0.00' : formatNumberWithCommas(parsed);
    }
    return formatNumberWithCommas(value);
  };
  
  const selectedDate = transactionDate || new Date().toISOString().slice(0, 10);

  useEffect(() => {
    fetchDetails();
  }, []);
  
  const fetchDetails = async () => {
    try {
      console.log('Fetching details for userId:', userId, 'and registeredFarmerId:', registeredFarmerId);
       
      // Make requests separately to identify which one is failing
      try {
        const detailsResponse = await api.get(`${environment.API_BASE_URL}api/auth/report-user-details/${userId}/${centerId}/${companyId}`);
        console.log('Details response successful:', detailsResponse.data);
         
        // Process details response...
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
        console.error('Error fetching user details:', detailsError);
        if (axios.isAxiosError(detailsError)) {
          console.log('Details error response:', detailsError.response?.data);
        } else {
          console.log('Details error:', detailsError);
        }
      }
       
      try {
        const cropsResponse = await api.get(`${environment.API_BASE_URL}api/auth/transaction-details/${userId}/${selectedDate}/${registeredFarmerId}`);
        console.log('Crops response successful:', cropsResponse.data);
         
        // Process crops response...
        const cropsData = cropsResponse.data?.data || cropsResponse.data || [];
        console.log('Crops data:', cropsData);
        
        setCrops(Array.isArray(cropsData) ? cropsData : []);
      } catch (cropsError) {
        console.error('Error fetching crops:', cropsError);
        if (axios.isAxiosError(cropsError)) {
          console.log('Crops error response:', cropsError.response?.data);
        } else {
          console.log('Crops error response:', cropsError);
        }
        setCrops([]);
      }


       
    } catch (error) {
      console.error('Error in fetchDetails:', error);
      Alert.alert(t("TransactionList.Sorry"), t("TransactionList.Failed to load details"));
      setCrops([]);
    } finally {
      setIsLoading(false);
    }
  };

  

  const generatePDF = async () => {
    if (!details) {
      Alert.alert(t("Error.error"), t("Error.Details are missing for generating PDF"));
      return '';
    }
  
    // Calculate the total sum for PDF
    const totalSum = calculateTotalSum(crops);

    const html = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            font-size: 10px; /* Base font size for body text */
            background-color: white;
            max-width: 800px;
            margin: 0 auto;
            padding: 30px;
            box-sizing: border-box;
            border-radius: 20px;
            overflow: hidden;
          }
          h1 {
            text-align: center;
            font-size: 22px; /* Increased main title size */
            margin-bottom: 15px;
            font-weight: bold;
          }
          .header-line {
            border-top: 1px solid #000;
            margin: 5px 0 15px 0;
          }
          .header-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
          }
          .header-item {
            margin-bottom: 5px;
            font-size: 11px; /* Slightly larger for header items */
          }
          .section-title {
            font-weight: bold;
            margin-bottom: 5px;
            font-size: 14px; /* Larger for section titles */
          }
          .supplier-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
          }
          .supplier-section div div:not(.section-title) {
            font-size: 10px; /* Regular size for supplier details */
          }
          .received-by-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
          }
          .received-by-section div div:not(.section-title) {
            font-size: 10px; /* Regular size for receiver details */
          }
          .table-title {
            font-weight: bold;
            margin: 15px 0 5px 0;
            text-align: center;
            background-color: #D6E6F4;
            padding: 8px;
            border: 1px solid #000;
            font-size: 16px; /* Larger font for table title */
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            background-color: white;
          }
          th {
            background-color:rgb(255, 255, 255);
            text-align: center;
            padding: 8px;
            border: 1px solid #000;
            font-weight: bold;
            font-size: 12px; /* Larger for table headers */
          }
          td {
            padding: 8px;
            text-align: center;
            border: 1px solid #000;
            background-color: white;
            font-size: 10px; /* Normal size for table data */
          }
          .total-row {
            display: flex;
            justify-content: flex-end;
            margin: 10px 0;
          }
          .total-box {
            display: flex;
            background-color: white;
            border: 1px solid #000;
          }
          .total-label {
            padding: 8px;
            font-weight: bold;
            border-right: 1px solid #000;
            background-color: #D6E6F4;
            font-size: 13px; /* Larger for total label */
          }
          .total-value {
            padding: 8px;
            min-width: 150px;
            text-align: center;
            font-weight: bold;
            font-size: 13px; /* Larger for total value */
          }
          .note {
            font-size: 11px; /* Smaller for the note text */
            margin: 15px 0;
            font-style: italic;
            text-align: justify;
          }
          .qr-section {
            display: flex;
            justify-content: space-around;
            margin-top: 20px;
          }
          .qr-container {
            text-align: center;
          }
          .qr-code {
            width: 100px;
            height: 100px;
            display: block;
            margin: 0 auto;
          }
          .qr-label {
            margin-top: 5px;
            font-weight: bold;
            font-size: 11px; /* Slightly larger for QR labels */
          }
          .button-container {
            display: flex;
            justify-content: center;
            margin-top: 20px;
            gap: 20px;
          }
          .button {
            width: 40px;
            height: 40px;
            background-color: black;
            border-radius: 5px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 8px;
            text-align: center;
          }
          .button-icon {
            font-size: 14px;
            margin-bottom: 3px;
          }
        </style>
      </head>
      <body>
        <h1>${t("TransactionList.Goods Received Note")}</h1>
        <div class="header-line"></div>
        
        <div class="header-row">
          <div class="header-item">
            <strong>${t("TransactionList.GRN No")} :</strong> ${crops.length > 0 ? crops[0].invoiceNumber : 'N/A'}
          </div>
          <div class="header-item">
            <strong>${t("TransactionList.Date")} :</strong> ${formatDateTime(crops[0].createdAt) }
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
            <div>${t("TransactionList.Company Name")} : ${details.companyNameEnglish || ''}</div>
          </div>
          <div>
            <div>&nbsp;</div>
            <div>${t("TransactionList.Centre")} : ${details.collectionCenterName || 'Collection Center'}</div>
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
            ${crops.map(crop => `
              <tr>
                <td>${i18next.language === 'si'
        ? crop.cropNameSinhala || '-'
        : i18next.language === 'ta'
        ? crop.cropNameTamil || '-'
        : crop.cropName || '-'}
        </td>
                <td>${i18next.language === 'si'
        ? crop.varietyNameSinhala || '-'
        : i18next.language === 'ta'
        ? crop.varietyNameTamil || '-'
        : crop.variety|| '-'}</td>
                <td>${crop.grade || '-'}</td>
                <td>${formatNumberWithCommas(parseFloat(crop.unitPrice || '0'))}</td>
                <td>${formatNumberWithCommas(parseFloat(crop.quantity || '0'))}</td>
                <td>${formatNumberWithCommas(parseFloat(crop.subTotal || '0'))}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total-row">
          <div class="total-box">
            <div class="total-label">${t("TransactionList.Full Total (Rs.)")} :</div>
            <div class="total-value">Rs.${formatNumberWithCommas(totalSum)}</div>
          </div>
        </div>
        
        <div class="note">
          <strong>${t("TransactionList.Note")}:</strong>${t("TransactionList.This Goods Receipt Note")}
        </div>
      </body>
    </html>
    `;
    try {
      const { uri } = await Print.printToFileAsync({ html });
      console.log('PDF generated at:', uri);
      return uri;
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert(t("TransactionList.Sorry"), t("TransactionList.PDF was not generated."));
      return '';
    }
  };



  const handleDownloadPDF = async () => {
    try {
      const uri = await generatePDF();
  
      if (!uri) {
        Alert.alert(t("TransactionList.Sorry"), t("TransactionList.PDF was not generated."));
        return;
      }
  
      const date = new Date().toISOString().slice(0, 10);
      const fileName = `GRN_${crops.length > 0 ? crops[0].invoiceNumber : 'N/A'}_${date}.pdf`;
      
      // Define tempFilePath
      let tempFilePath = uri; // Default to original URI
  
      if (Platform.OS === 'android') {
        // Create a named file in cache directory
        tempFilePath = `${FileSystem.cacheDirectory}${fileName}`;
        
        // Copy the PDF to the temp location
        await FileSystem.copyAsync({
          from: uri,
          to: tempFilePath
        });
        
        // Use the sharing API
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(tempFilePath, {
            dialogTitle: t('Save GRN Report'),
            mimeType: 'application/pdf',
            UTI: 'com.adobe.pdf'
          });
          // Alert.alert(
          //   t('TransactionList.PDF Ready'), 
          //   t('TransactionList.To save to Downloads, select "Save to device" from the share menu'),
          //   [{ text: "OK" }]
          // );
        } else {
          Alert.alert(t('TransactionList.Sorry'), t('TransactionList.Sharing is not available on this device'));
        }
      } else if (Platform.OS === 'ios') {
        // iOS approach using share dialog
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(tempFilePath, {
            dialogTitle: t('TransactionList.Save GRN Report'),
            mimeType: 'application/pdf',
            UTI: 'com.adobe.pdf'
          });
          Alert.alert(
            t('TransactionList.Info'), 
            t('TransactionList.Use the "Save to Files" option to save to Downloads')
          );
        } else {
          Alert.alert(t('TransactionList.Sorry'), t('TransactionList.Sharing is not available on this device'));
        }
      }
      
      console.log(`PDF prepared for sharing: ${tempFilePath}`);
      
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert(t("TransactionList.Sorry"), t("TransactionList.Failed to save PDF to Downloads folder."));
    }
  };

const formatDateTime = (dateString: string) => {
  if (!dateString) return 'N/A';
  
  try {
    let date: Date;
    
    
    if (dateString.includes('/') && dateString.includes('.')) {
      const [datePart, timePart] = dateString.split(' ');
      const [year, month, day] = datePart.split('/');
      const [hourMin, period] = timePart.split(' ');
      const [hour, minute] = hourMin.split('.');
      
      let hour24 = parseInt(hour);
      if (period === 'PM' && hour24 !== 12) {
        hour24 += 12;
      } else if (period === 'AM' && hour24 === 12) {
        hour24 = 0;
      }
      // For AM hours 1-11, keep as is (no conversion needed)
      
      date = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        hour24,
        parseInt(minute)
      );
    }
    // Fallback to standard Date parsing
    else {
      date = new Date(dateString);
    }
    
    // Format the date in the desired format: 2024/10/05 10.00 AM
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format for display
    let displayHours = hours;
    if (hours === 0) {
      displayHours = 12;
    } else if (hours > 12) {
      displayHours = hours - 12;
    }
    // For hours 1-12, keep as is
    
    const formattedHours = String(displayHours).padStart(2, '0');
    
    return `${year}/${month}/${day} ${formattedHours}.${minutes} ${period}`;
    
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString; // Return original if parsing fails
  }
};
  
  const handleSharePDF = async () => {
    try {
      const uri = await generatePDF();
      
      if (!uri) {
        console.error('PDF generation failed - no URI returned');
        Alert.alert(t("TransactionList.Sorry"), t("TransactionList.PDF was not generated."));
        return;
      }
      
      // Check if sharing is available
      const isSharingAvailable = await Sharing.isAvailableAsync();
      console.log('Sharing available:', isSharingAvailable);
      
      if (!isSharingAvailable) {
        console.log('Sharing not available on this device');
        Alert.alert(t("TransactionList.Sorry"), t("TransactionList.Sharing is not available on this device"));
        return;
      }
      
      // Create a descriptive filename
      const fileName = `PurchaseReport_${crops.length > 0 ? crops[0].invoiceNumber : 'N/A'}_${selectedDate}.pdf`;
      const newUri = `${FileSystem.cacheDirectory}${fileName}`;
      
      // Make sure the file exists before attempting to copy
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        console.error('PDF file does not exist at URI:', uri);
        Alert.alert(t("TransactionList.Sorry"), ("TransactionList.Generated PDF file not found"));
        return;
      }
      
      console.log('Copying file from', uri, 'to', newUri);
      
      // Copy file with new name
      await FileSystem.copyAsync({
        from: uri,
        to: newUri
      });
      
      console.log('File copied successfully, attempting to share');
      
      // Share with better error handling
      await Sharing.shareAsync(newUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Purchase Report',
        UTI: 'com.adobe.pdf'
      });
    } catch (error) {
      console.error('Error in handleSharePDF:', error);
      
      // Try fallback to direct sharing if we have a URI
      try {
        const uri = await generatePDF();
        if (uri) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Share Purchase Report'
          });
        }
      } catch (fallbackError) {
        console.error('Fallback sharing also failed:', fallbackError);
        Alert.alert(t("TransactionList.Sorry"),t("TransactionList.Failed to share PDF file"));
      }
    }
  };

  const getTextStyle = (i18next: string) => {
    if (i18next === "si" || i18next === "ta") {
      return {
        fontSize: 12, // Smaller text size for Sinhala
        lineHeight: 20, // Space between lines
      };
    }
   
  };



  const getCreatedAt = () => {
  if (crops && crops.length > 0) {
    return crops[0].createdAt; // Get createdAt from first item
  }
  return null;
}; 


  return (
    <ScrollView className="flex-1 bg-white ">
      <View
        className="flex-row justify-between items-center"
        style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="left" size={24} color="#000502" style={{ paddingHorizontal: wp(3), paddingVertical: hp(1.5), backgroundColor: "#F6F6F680" , borderRadius: 50 }}/>
        </TouchableOpacity>
        <Text className="text-xl font-bold " style={{fontSize:18}}>{t("TransactionList.Goods Received Note")}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* GRN Header */}
      <View className='p-6 '>
      <View className="mb-4 -mt-2">
        <Text className="text-sm font-bold" style={[ getTextStyle(i18next.language)]}>{t("TransactionList.GRN No")}: {crops.length > 0 ? crops[0].invoiceNumber : 'N/A'}</Text>
       <Text className="text-sm" style={[getTextStyle(i18next.language)]}>
      {t("TransactionList.Date")}: {crops.length > 0 && crops[0].createdAt 
        ? formatDateTime(crops[0].createdAt) 
        : formatDateTime(selectedDate)}
    </Text>
      </View> 
     


      {/* Supplier Details */}
      <View className="mb-4">
        <Text className="font-bold text-sm mb-3"  style={[ getTextStyle(i18next.language)]}>{t("TransactionList.Supplier Details")}:</Text>
        <View className="border border-gray-300 rounded-lg p-2">
          <Text><Text className="" style={[ getTextStyle(i18next.language)]}>{t("TransactionList.Name")}:</Text> {details?.firstName} {details?.lastName}</Text>
          <Text><Text className="" style={[ getTextStyle(i18next.language)]}>{t("TransactionList.Phone")}:</Text> {details?.phoneNumber}</Text>
        </View>
      </View>

      {/* Received By */}
      <View className="mb-4">
        <Text className="font-bold text-sm mb-3"  style={[ getTextStyle(i18next.language)]}>{t("TransactionList.Received By")}:</Text>
        <View className="border border-gray-300 rounded-lg p-2">
          <Text><Text className="" style={[ getTextStyle(i18next.language)]} >{t("TransactionList.Company Name")}:</Text> {details?.companyNameEnglish || ''}</Text>
          <Text><Text className="" style={[ getTextStyle(i18next.language)]}>{t("TransactionList.Centre")}:</Text> {details?.collectionCenterName || 'Collection Center'}</Text>
        </View>
      </View>

      {/* Received Items */}
      <View className="mb-4">
        <Text className="font-bold text-sm mb-3" style={[ getTextStyle(i18next.language)]}>{t("TransactionList.Received Items")}:</Text>
        <ScrollView horizontal className="border border-gray-300 rounded-lg">
          <View>
            {/* Table Header */}
            <View className="flex-row bg-gray-200">
              <Text className="w-24 p-2 font-bold border-r border-gray-300" style={[ getTextStyle(i18next.language)]}>{t("TransactionList.Crop Name")}</Text>
              <Text className="w-24 p-2 font-bold border-r border-gray-300" style={[ getTextStyle(i18next.language)]}>{t("TransactionList.Variety")}</Text>
              <Text className="w-20 p-2 font-bold border-r border-gray-300" style={[ getTextStyle(i18next.language)]}>{t("TransactionList.Grade")}</Text>
              <Text className="w-24 p-2 font-bold border-r border-gray-300" style={[ getTextStyle(i18next.language)]}>{t("TransactionList.Unit Price(Rs.)")}</Text>
              <Text className="w-24 p-2 font-bold border-r border-gray-300" style={[ getTextStyle(i18next.language)]}>{t("TransactionList.Quantity(kg)")}</Text>
              <Text className="w-24 p-2 font-bold" style={[ getTextStyle(i18next.language)]}>{t("TransactionList.Sub Total(Rs.)")}</Text>
            </View>
            
            {/* Table Rows */}
            {crops.map((crop, index) => (
              <View key={`${crop.id}-${index}`} className="flex-row">
                <Text className="w-24 p-2 border-t border-r border-gray-300">   
                  {i18next.language === 'si'
                    ? crop.cropNameSinhala || '-'
                    : i18next.language === 'ta'
                    ? crop.cropNameTamil || '-'
                    : crop.cropName || '-'}
                </Text>
                <Text className="w-24 p-2 border-t border-r border-gray-300"> 
                  {i18next.language === 'si'
                    ? crop.varietyNameSinhala || '-'
                    : i18next.language === 'ta'
                    ? crop.varietyNameTamil || '-'
                    : crop.variety|| '-'}
                </Text>
                <Text className="w-20 p-2 border-t border-r border-gray-300">{crop.grade || '-'}</Text>
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
      <View className="border-t border-gray-400 my-2"></View>

      {/* Total */}
      <View className="mb-2 mt-2 items-end">
        <Text className="font-bold" style={[ getTextStyle(i18next.language)]}>
          {t("TransactionList.Full Total (Rs.)")} Rs.{formatNumberWithCommas(totalSum)}
        </Text>
      </View>

      {/* Divider */}
      <View className="border-t border-gray-400 my-2"></View>

      {/* Note */}
      <View className="mb-4">
        <Text className="text-xs">
          <Text className="font-bold ">{t("TransactionList.Note")}:</Text>
          <Text className='italic'> {t("TransactionList.This Goods Receipt Note")}</Text> 
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="flex-row justify-around w-full mb-7">
        <TouchableOpacity className="bg-black p-4 h-[80px] w-[120px] rounded-lg items-center justify-center" onPress={handleDownloadPDF}>
          <Image
            source={require('../assets/images/download.webp')}
            style={{ width: 24, height: 24 }}
          />
          <Text className="text-sm text-cyan-50 text-center">{t("TransactionList.Download")}</Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-black p-4 h-[80px] w-[120px] rounded-lg items-center justify-center" onPress={handleSharePDF}>
          <Image
            source={require('../assets/images/Share.webp')}
            style={{ width: 24, height: 24 }}
          />
          <Text className="text-sm text-cyan-50">{t("TransactionList.Share")}</Text>
        </TouchableOpacity>
      </View>
      </View>
    </ScrollView>
  );
};

export default TransactionReport;