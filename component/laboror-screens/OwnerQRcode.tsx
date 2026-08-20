import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  BackHandler,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/types";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import type { NativeEventSubscription } from "react-native";
import CustomHeader from "../common/CustomHeader";
import LoadingPage from "../common/LoadingPage";

type QRcodeNavigationPrps = StackNavigationProp<
  RootStackParamList,
  "QRcode"
>;

interface QRcodeProps {
  navigation: QRcodeNavigationPrps;
}

const OwnerQRcode: React.FC<QRcodeProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [QR, setQR] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);

  const handleBackButton = () => {
    navigation.navigate("LabororEngProfile" as any);
    return true;
  };

  useEffect(() => {
    const subscription: NativeEventSubscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackButton,
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const fetchRegistrationDetails = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert(t("Main.Error"), t("Main.SomethingWentWrongPleaseTryAgainlater"), [
          { text: t("Main.OK") },
        ]);
        return;
      }

      const response = await fetch(
        `${environment.API_BASE_URL}api/auth/user-profile`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();
      if (data.status === "success") {
        const registrationDetails = data.user;

        setQR(registrationDetails.farmerQr || "");
      } else {
        Alert.alert(t("Main.Error"), t("Main.SomethingWentWrongPleaseTryAgainlater"), [
          { text: t("Main.OK") },
        ]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      Alert.alert(t("Main.Error"), t("Main.SomethingWentWrongPleaseTryAgainlater"), [
        { text: t("Main.OK") },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrationDetails();
  }, []);

  const downloadQRcode = async () => {
    try {
      if (!QR) {
        Alert.alert(t("Main.Error"), t("QRcode.noQRcodeAvailable"), [
          { text: t("Main.OK") },
        ]);
        return;
      }

      const { status } = await MediaLibrary.requestPermissionsAsync(true);
      if (status !== "granted") {
        Alert.alert(
          t("QRcode.AccessRequired"),
          t("QRcode.PleaseEnablePermissionToSaveTheQRToYourGallery"),
          [{ text: t("Main.OK") }],
        );
        return;
      }

      const fileUri = `${FileSystem.documentDirectory}QRcode_${Date.now()}.png`;
      const response = await FileSystem.downloadAsync(QR, fileUri);

      const asset = await MediaLibrary.createAssetAsync(response.uri);
      await MediaLibrary.createAlbumAsync("Download", asset, false);

      Alert.alert(t("Main.Success"), t("QRcode.YourQRCodeHasBeenSavedToYourGallery"), [
        { text: t("Main.OK") },
      ]);
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert(t("Main.Error"), t("QRcode.UnableTSaveQRcodePleaseTryAgain"), [
        { text: t("Main.OK") },
      ]);
    }
  };

  const shareQRcode = async () => {
    try {
      if (!QR) {
        Alert.alert(t("Main.Error"), t("QRcode.noQRcodeAvailable"), [
          { text: t("Main.OK") },
        ]);
        return;
      }

      const fileUri = `${FileSystem.documentDirectory}QRcode_${Date.now()}.png`;
      const response = await FileSystem.downloadAsync(QR, fileUri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(response.uri, {
          mimeType: "image/png",
          dialogTitle: "Share QR Code",
        });
      } else {
        Alert.alert(
          t("QRcode.SharingFeatureUnavailable"),
          t("QRcode.ThisDeviceDoesNotSupportSharingQRcodes"),
          [{ text: t("Main.OK") }],
        );
      }
    } catch (error) {
      console.error("Share error:", error);
      Alert.alert(t("Main.Error"), t("QRcode.UnableToShareQRcodePleaseTryAgainLater"), [
        { text: t("Main.OK") },
      ]);
    }
  };

  const dynamicStyles = {
    imageHeight: 80,
    qrSize: 200,
  };

  if (loading) {
    return <LoadingPage fullScreen />;
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <CustomHeader
        title={t("QRcode.QRCode")}
        showBackButton={true}
        navigation={navigation}
        onBackPress={() => navigation.navigate("LabororEngProfile" as any)}
      />

      <View className="items-center mb-4 mt-20">
        {QR ? (
          <View className="bg-white p-6 rounded-xl border-2 border-black">
            <Image
              source={{ uri: `${QR}` }}
              style={{
                width: dynamicStyles.qrSize,
                height: dynamicStyles.qrSize,
                resizeMode: "contain",
              }}
            />
          </View>
        ) : (
          <View className="items-center justify-center">
            <Text className=" text-center mt-4 p-2 gap-y-4 max-w-[80%] leading-7 text-gray-500 ">
              {t("QRcode.YourFarmOwnerHasNotRegisteredForAQRcodeYet")}
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row justify-center gap-6 mb-20 mt-2">
        {QR && (
          <>
            <TouchableOpacity
              className="bg-[#1E1E1E] w-24 h-20 rounded-lg items-center justify-center flex-col mt-5 ml-6 "
              onPress={downloadQRcode}
            >
              <MaterialIcons name="download" size={24} color="white" />
              <Text className="text-white text-xs mt-1">
                {t("QRcode.Download")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-[#1E1E1E] w-24 h-20 rounded-lg items-center justify-center flex-col  mt-5 ml-5"
              onPress={shareQRcode}
            >
              <MaterialIcons name="share" size={24} color="white" />
              <Text className="text-white text-xs mt-1">
                {t("QRcode.Share")}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default OwnerQRcode;
