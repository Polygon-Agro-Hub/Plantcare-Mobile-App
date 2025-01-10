import React, { useRef, useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import QRCode from "react-native-qrcode-svg";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AntDesign from "react-native-vector-icons/AntDesign";
import { captureRef } from "react-native-view-shot";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";


type EngQRcodeNavigationPrps = StackNavigationProp<
  RootStackParamList,
  "EngQRcode"
>;

interface EngQRcodeProps {
  navigation: EngQRcodeNavigationPrps;
}

const EngQRcode: React.FC<EngQRcodeProps> = ({ navigation }) => {
  const qrCodeRef = useRef<any>(null);
  const [qrValue, setQrValue] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [qrBase64, setQrBase64] = useState<string>(""); 
  const { t } = useTranslation();
  const screenWidth = wp(100);
  const [loading, setLoading] = useState<boolean>(true);
  const [QR, setQR] = useState<string>("");

  const fetchRegistrationDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
        return;
      }
  
      const response = await fetch(`${environment.API_BASE_URL}api/auth/user-profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
      console.log("Data:", data);
  
      if (data.status === "success") {
        const registrationDetails = data.user;
        setFirstName(registrationDetails.firstName || "");
        setLastName(registrationDetails.lastName || "");
        setQR(registrationDetails.farmerQr || "");
      } else {
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
      }
    } catch (error) {
      console.error("Fetch error:", error);
      Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
    }
  };
  

  useEffect(() => {
    fetchRegistrationDetails();
  }, []);

  // const downloadQRCode = async () => {
  //   try {
  //     if (!qrBase64) {
  //       Alert.alert(t("Main.error"), t("QRcode.noQRCodeAvailable"));
  //       return;
  //     }
  
  //     const { status } = await MediaLibrary.requestPermissionsAsync();
  //     if (status !== "granted") {
  //       Alert.alert(
  //         t("QRcode.permissionDeniedTitle"),
  //         t("QRcode.permissionDeniedMessage")
  //       );
  //       return;
  //     }
  
  //     const base64Data = qrBase64.replace(/^data:image\/\w+;base64,/, '');
  //     const fileName = `QRCode_${Date.now()}.png`;
  //     const fileUri = `${FileSystem.documentDirectory}${fileName}`;
  
  //     await FileSystem.writeAsStringAsync(fileUri, base64Data, {
  //       encoding: FileSystem.EncodingType.Base64
  //     });
  
  //     const asset = await MediaLibrary.createAssetAsync(fileUri);
  //     await MediaLibrary.createAlbumAsync("Download", asset, false);
  
  //     Alert.alert(t("QRcode.successTitle"), t("QRcode.savedToGallery"));
  //   } catch (error) {
  //     console.error("Download error:", error);
  //     Alert.alert(t("Main.error"), t("QRcode.failedSaveQRCode"));
  //   }
  // };
  
  // const shareQRCode = async () => {
  //   try {
  //     if (!qrBase64) {
  //       Alert.alert(t("Main.error"), t("QRcode.noQRCodeAvailable"));
  //       return;
  //     }
  
  //     const base64Data = qrBase64.replace(/^data:image\/\w+;base64,/, '');
  //     const fileName = `QRCode_${Date.now()}.png`;
  //     const fileUri = `${FileSystem.documentDirectory}${fileName}`;
  
  //     await FileSystem.writeAsStringAsync(fileUri, base64Data, {
  //       encoding: FileSystem.EncodingType.Base64
  //     });
  
  //     if (await Sharing.isAvailableAsync()) {
  //       await Sharing.shareAsync(fileUri, {
  //         mimeType: "image/png",
  //         dialogTitle: "Share QR Code"
  //       });
  //     } else {
  //       Alert.alert(
  //         t("QRcode.sharingUnavailableTitle"),
  //         t("QRcode.sharingUnavailableMessage")
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Share error:", error);
  //     Alert.alert(t("Main.error"), t("QRcode.failedShareQRCode"));
  //   }
  // };

  const downloadQRCode = async () => {
    try {
      if (!QR) {
        Alert.alert(t("Main.error"), t("QRcode.noQRCodeAvailable"));
        return;
      }
  
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          t("QRcode.permissionDeniedTitle"),
          t("QRcode.permissionDeniedMessage")
        );
        return;
      }
  
      const fileUri = `${FileSystem.documentDirectory}QRCode_${Date.now()}.png`;
      const response = await FileSystem.downloadAsync(QR, fileUri);
  
      const asset = await MediaLibrary.createAssetAsync(response.uri);
      await MediaLibrary.createAlbumAsync("Download", asset, false);
  
      Alert.alert(t("QRcode.successTitle"), t("QRcode.savedToGallery"));
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert(t("Main.error"), t("QRcode.failedSaveQRCode"));
    }
  };
  
  const shareQRCode = async () => {
    try {
      if (!QR) {
        Alert.alert(t("Main.error"), t("QRcode.noQRCodeAvailable"));
        return;
      }
  
      const fileUri = `${FileSystem.documentDirectory}QRCode_${Date.now()}.png`;
      const response = await FileSystem.downloadAsync(QR, fileUri);
  
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(response.uri, {
          mimeType: "image/png",
          dialogTitle: "Share QR Code"
        });
      } else {
        Alert.alert(
          t("QRcode.sharingUnavailableTitle"),
          t("QRcode.sharingUnavailableMessage")
        );
      }
    } catch (error) {
      console.error("Share error:", error);
      Alert.alert(t("Main.error"), t("QRcode.failedShareQRCode"));
    }
  };
  

  const dynamicStyles = {
    imageHeight: 80,  
    qrSize: 200,      
  };

return (
  <View className="flex-1 bg-white">
    <View className="relative w-full">
      <Image
        source={require("../assets/images/upper.jpeg")}
        className="w-full h-40 mt-0"
      />
      <View className="absolute top-0 left-0 right-0 flex-row items-center justify-center px-2 pt-4">
        <TouchableOpacity
          className="top-6 left-4 p-2 bg-transparent" 
          onPress={() => navigation.navigate("EngProfile")}
        >
          <AntDesign name="left" size={24} color="#000000" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-black text-2xl font-bold top-6">
          {t("QRcode.QRcode")}
        </Text>
      </View>
    </View>

    <View className="items-center mt-0 mb-4">
      <Image
        source={require("../assets/images/profile.webp")}
        className="w-24 rounded-full border-2 border-gray-300"
        style={{ height: dynamicStyles.imageHeight }}
      />
      <Text className="text-lg font-semibold mt-2">{`${firstName} ${lastName}`}</Text>
    </View>

    <View className="items-center mb-4 mt-5">
    {QR ? (
      <View className="bg-white p-6 rounded-xl border-2 border-black">
       
          <Image
            source={{ uri: `${QR}` }}
            style={{
              width: dynamicStyles.qrSize,
              height: dynamicStyles.qrSize,
              resizeMode: 'contain',
            }}
          />
           </View>
        ) : (
          <View className="items-center justify-center">
            <Text className=" text-center mt-4 p-2 gap-y-4 max-w-[80%] leading-7 text-gray-500 ">
            {t("QRcode.NoQrText")}
            </Text>
            <TouchableOpacity
              className=" bg-black mt-4 px-6 py-2 rounded-3xl"
              onPress={async () => {
             

                  navigation.navigate("MembershipScreen");
              
              }}
            >
              <View  className="flex-row items-center justify-center gap-x-2">
              <Image  
              source={require("../assets/images/GenerateQr.png")}
              style={{ width: 32, height: 32 }}
              />
              <Text className="text-white text-center">
                {t("QRcode.GenerateQr")}
              </Text>

              </View>

            </TouchableOpacity>
          </View>
        )}
     
    </View>

    <View className="flex-row justify-evenly mb-4">
      {QR && (
        <>
          <TouchableOpacity
            className="bg-gray-600 w-20 h-20 rounded-lg items-center justify-center flex-col mx-2 mt-5"
            onPress={downloadQRCode}
          >
            <MaterialIcons name="download" size={24} color="white" />
            <Text className="text-white text-xs mt-1">
              {t("QRcode.Download")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-gray-600 w-20 h-20 rounded-lg items-center justify-center flex-col mx-2 mt-5"
            onPress={shareQRCode}
          >
            <MaterialIcons name="share" size={24} color="white" />
            <Text className="text-white text-xs mt-1">{t("QRcode.Share")}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  </View>
);
};

export default EngQRcode;
