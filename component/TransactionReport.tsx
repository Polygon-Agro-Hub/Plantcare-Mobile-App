import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
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
  companyNameEnglish: string | null; // Added company name field
  collectionCenterName: string | null; // Added collection center field
}

interface Crop {
  id: number;
  cropName: string;
  variety: string;
  grade: string;
  unitPrice: string;
  quantity: string;
  subTotal: string;
  invoiceNumber: string;
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
  
  // Safe reduce with proper type handling
  const totalSum = (crops || []).reduce((sum: number, crop: Crop) => {
    const subTotal = typeof crop.subTotal === 'string' 
      ? parseFloat(crop.subTotal) 
      : crop.subTotal || 0;
    return sum + subTotal;
  }, 0);

  const formatNumberWithCommas = (value: number | string): string => {
    // Convert to number if it's a string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // Format with 2 decimal places and add commas for thousands
    return numValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  
  // Replace the current formatNumber function with this one
  const formatNumber = (value: number | string): string => {
    if (typeof value === 'string') {
      return formatNumberWithCommas(parseFloat(value));
    }
    return formatNumberWithCommas(value);
  };
  
  const selectedDate  = transactionDate || new Date().toISOString().slice(0, 10);

 
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
      Alert.alert(t("Error.error"), t("Error.Failed to load details"));
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
  
    const totalSum = crops.reduce((sum: number, crop: Crop) => {
      return sum + Number(crop.subTotal);
    }, 0);

  
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
        <h1>Goods Received Note</h1>
        <div class="header-line"></div>
        
        <div class="header-row">
          <div class="header-item">
            <strong>GRN No :</strong> ${crops.length > 0 ? crops[0].invoiceNumber : 'N/A'}
          </div>
          <div class="header-item">
            <strong>Date :</strong> ${selectedDate}
          </div>
        </div>
        
        <div class="supplier-section">
          <div>
            <div class="section-title">Supplier Details :</div>
            <div>Name : ${details.firstName} ${details.lastName}</div>
          </div>
          <div>
            <div>&nbsp;</div>
            <div>${details.phoneNumber}</div>
          </div>
        </div>
        
        <div class="received-by-section">
          <div>
            <div class="section-title">Received By :</div>
            <div>Company Name : ${details.companyNameEnglish || ''}</div>
          </div>
          <div>
            <div>&nbsp;</div>
            <div>Centre : ${details.collectionCenterName || 'Collection Center'}</div>
          </div>
        </div>
        
        <div class="table-title">Received Items</div>
        <table>
          <thead>
            <tr>
              <th>Crop Name</th>
              <th>Variety</th>
              <th>Grade</th>
              <th>Unit Price(Rs.)</th>
              <th>Quantity(kg)</th>
              <th>Sub Total(Rs.)</th>
            </tr>
          </thead>
          <tbody>
            ${crops.map(crop => `
              <tr>
                <td>${crop.cropName || '-'}</td>
                <td>${crop.variety || '-'}</td>
                <td>${crop.grade || '-'}</td>
                <td>${formatNumberWithCommas(parseFloat(crop.unitPrice))}</td>
                <td>${formatNumberWithCommas(parseFloat(crop.quantity))}</td>
                <td>${formatNumberWithCommas(parseFloat(crop.subTotal))}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total-row">
          <div class="total-box">
            <div class="total-label">Full Total (Rs.) :</div>
            <div class="total-value">Rs.${formatNumberWithCommas(totalSum)}</div>
          </div>
        </div>
        
        <div class="note">
          <strong>Note:</strong> This Goods Receipt Note (GRN) serves as a provisional acknowledgment based on initial measurements taken by front-line staff. Final verification will be conducted at the Collection Centre. The measurement recorded at the Collection Centre shall be deemed conclusive and binding in all cases of discrepancy. The organization reserves the right to rectify any revenue impacts arising from measurement variances and shall not be liable for losses due to initial miscalculations.
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
      Alert.alert(t("Error.error"), t("Error.PDF was not generated."));
      return '';
    }
  };

  const handleDownloadPDF = async () => {
    const uri = await generatePDF();
  
    if (uri) {
      const date = new Date().toISOString().slice(0, 10);
      const fileName = `GRN_${crops.length > 0 ? crops[0].invoiceNumber : 'N/A'}_${date}.pdf`;
  
      try {
        const { status } = await MediaLibrary.requestPermissionsAsync();
  
        if (status === 'granted') {
          const tempUri = `${FileSystem.cacheDirectory}${fileName}`;
          await FileSystem.copyAsync({
            from: uri,
            to: tempUri,
          });
  
          const asset = await MediaLibrary.createAssetAsync(tempUri);
          const album = await MediaLibrary.getAlbumAsync('Download');
          if (!album) {
            await MediaLibrary.createAlbumAsync('Download', asset, false);
          } else {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
          }
  
          Alert.alert('Download Success', `${fileName} has been saved to your Downloads folder.`);
        } else {
          Alert.alert('Permission Denied', 'You need to grant permission to save the PDF.');
        }
      } catch (error) {
        console.error('Error saving PDF:', error);
        Alert.alert(t("Error.error"), t("Error.Failed to save PDF to Downloads folder."));
      }
    } else {
      Alert.alert(t("Error.error"), t("Error.PDF was not generated."));
    }
  };
  
  const handleSharePDF = async () => {
    try {
      const uri = await generatePDF();
      
      if (!uri) {
        console.error('PDF generation failed - no URI returned');
        Alert.alert("Error", "Failed to generate PDF");
        return;
      }
      
      // Check if sharing is available
      const isSharingAvailable = await Sharing.isAvailableAsync();
      console.log('Sharing available:', isSharingAvailable);
      
      if (!isSharingAvailable) {
        console.log('Sharing not available on this device');
        Alert.alert("Error", "Sharing is not available on this device");
        return;
      }
      
      // Create a descriptive filename
      const fileName = `PurchaseReport_${crops.length > 0 ? crops[0].invoiceNumber : 'N/A'}_${selectedDate}.pdf`;
      const newUri = `${FileSystem.cacheDirectory}${fileName}`;
      
      // Make sure the file exists before attempting to copy
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        console.error('PDF file does not exist at URI:', uri);
        Alert.alert("Error", "Generated PDF file not found");
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
        Alert.alert("Error", "Failed to share PDF: " + (error instanceof Error ? error.message : "Unknown error"));
      }
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <View className="flex-row items-center mb-4">
        <TouchableOpacity onPress={() => navigation.navigate("Main" as any)}>
          <AntDesign name="left" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold ml-[25%]">Goods Received Note</Text>
      </View>

      {/* GRN Header */}
      <View className="mb-4">
        <Text className="text-sm font-bold">GRN No: {crops.length > 0 ? crops[0].invoiceNumber : 'N/A'}</Text>
        <Text className="text-sm">Date: {selectedDate}</Text>
      </View>

      {/* Supplier Details */}
      <View className="mb-4">
        <Text className="font-bold text-sm mb-1">Supplier Details:</Text>
        <View className="border border-gray-300 rounded-lg p-2">
          <Text><Text className="font-bold">Name:</Text> {details?.firstName} {details?.lastName}</Text>
          <Text><Text className="font-bold">Phone:</Text> {details?.phoneNumber}</Text>
        </View>
      </View>

      {/* Received By */}
      <View className="mb-4">
        <Text className="font-bold text-sm mb-1">Received By:</Text>
        <View className="border border-gray-300 rounded-lg p-2">
          <Text><Text className="font-bold">Company Name:</Text> {details?.companyNameEnglish || ''}</Text>
          <Text><Text className="font-bold">Centre:</Text> {details?.collectionCenterName || 'Collection Center'}</Text>
        </View>
      </View>

      {/* Divider */}
      <View className="border-t border-gray-400 my-2"></View>

      {/* Received Items */}
      <View className="mb-4">
        <Text className="font-bold text-sm mb-2">Received Items</Text>
       <ScrollView horizontal className="border border-gray-300 rounded-lg">
  <View>
    {/* Table Header */}
    <View className="flex-row bg-gray-200">
      <Text className="w-24 p-2 font-bold border-r border-gray-300">Crop Name</Text>
      <Text className="w-24 p-2 font-bold border-r border-gray-300">Variety</Text>
      <Text className="w-20 p-2 font-bold border-r border-gray-300">Grade</Text>
      <Text className="w-24 p-2 font-bold border-r border-gray-300">Unit Price(Rs.)</Text>
      <Text className="w-24 p-2 font-bold border-r border-gray-300">Quantity(kg)</Text>
      <Text className="w-24 p-2 font-bold">Sub Total(Rs.)</Text>
    </View>
    
    {/* Table Rows */}
    {crops.map((crop, index) => (
      <View key={`${crop.id}-${index}`} className="flex-row">
        <Text className="w-24 p-2 border-b border-gray-300">{crop.cropName || '-'}</Text>
        <Text className="w-24 p-2 border-b border-gray-300">{crop.variety || '-'}</Text>
        <Text className="w-20 p-2 border-b border-gray-300">{crop.grade || '-'}</Text>
        <Text className="w-24 p-2 border-b border-gray-300 text-right">
          {formatNumber(crop.unitPrice)}
        </Text>
        <Text className="w-24 p-2 border-b border-gray-300 text-right">
          {formatNumber(crop.quantity)}
        </Text>
        <Text className="w-24 p-2 border-b border-gray-300 text-right">
          {formatNumberWithCommas(totalSum)}
        </Text>
      </View>
    ))}
  </View>
</ScrollView>
      </View>

      {/* Divider */}
      <View className="border-t border-gray-400 my-2"></View>

      {/* Total */}
      <View className="mb-4 items-end">
        <Text className="font-bold">Full Total (Rs.): Rs.{totalSum.toFixed(2)}</Text>
      </View>

      {/* Divider */}
      <View className="border-t border-gray-400 my-2"></View>

      {/* Note */}
      <View className="mb-4">
        <Text className="text-xs">
          <Text className="font-bold">Note:</Text> This Goods Receipt Note (GRN) serves as a provisional acknowledgment based on initial measurements taken by front-line staff. Final verification will be conducted at the Collection Centre. The measurement recorded at the Collection Centre shall be deemed conclusive and binding in all cases of discrepancy. The organization reserves the right to rectify any revenue impacts arising from measurement variances and shall not be liable for losses due to initial miscalculations.
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="flex-row justify-around w-full mb-7">
        <TouchableOpacity className="bg-[#2AAD7A] p-4 h-[80px] w-[120px] rounded-lg items-center" onPress={handleDownloadPDF}>
          <Image
            source={require('../assets/images/download.webp')}
            style={{ width: 24, height: 24 }}
          />
          <Text className="text-sm text-cyan-50">Download</Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-[#2AAD7A] p-4 h-[80px] w-[120px] rounded-lg items-center" onPress={handleSharePDF}>
          <Image
            source={require('../assets/images/Share.webp')}
            style={{ width: 24, height: 24 }}
          />
          <Text className="text-sm text-cyan-50">Share</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default TransactionReport;