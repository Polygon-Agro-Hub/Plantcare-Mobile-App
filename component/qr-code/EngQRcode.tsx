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
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/types";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import type { NativeEventSubscription } from "react-native";
import LottieView from "lottie-react-native";
import CustomHeader from "../common/CustomHeader";
import LoadingPage from "../common/LoadingPage";

type EngQRcodeNavigationPrps = StackNavigationProp<
  RootStackParamList,
  "EngQRcode"
>;

interface EngQRcodeProps {
  navigation: EngQRcodeNavigationPrps;
}

const EngQRcode: React.FC<EngQRcodeProps> = ({ navigation }) => {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const { t } = useTranslation();
  const [QR, setQR] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [language, setLanguage] = useState("en");

  const adjustFontSize = (size: number) =>
    language !== "en" ? size * 0.9 : size;

  useEffect(() => {
    const selectedLanguage = t("Main.LNG");
    setLanguage(selectedLanguage);
  }, [t]);

  const handleBackButton = () => {
    navigation.navigate("EngProfile");
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

        setFirstName(registrationDetails.firstName || "");
        setLastName(registrationDetails.lastName || "");
        setProfileImage(registrationDetails.profileImage || "");
        setQR(registrationDetails.farmerQr || "");
        await AsyncStorage.setItem("district", registrationDetails.district);
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

  const downloadQRCode = async () => {
    try {
      if (!QR) {
        Alert.alert(t("Main.Error"), t("QRcode.noQRCodeAvailable"), [
          { text: t("Main.OK") },
        ]);
        return;
      }

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          t("QRcode.permissionDeniedTitle"),
          t("QRcode.permissionDeniedMessage"),
          [{ text: t("Main.OK") }],
        );
        return;
      }

      const fileUri = `${FileSystem.documentDirectory}QRCode_${Date.now()}.png`;
      const response = await FileSystem.downloadAsync(QR, fileUri);

      const asset = await MediaLibrary.createAssetAsync(response.uri);
      await MediaLibrary.createAlbumAsync("Download", asset, false);

      Alert.alert(t("QRcode.successTitle"), t("QRcode.savedToGallery"), [
        { text: t("Main.OK") },
      ]);
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert(t("Main.Error"), t("QRcode.failedSaveQRCode"), [
        { text: t("Main.OK") },
      ]);
    }
  };

  const shareQRCode = async () => {
    try {
      if (!QR) {
        Alert.alert(t("Main.Error"), t("QRcode.noQRCodeAvailable"), [
          { text: t("Main.OK") },
        ]);
        return;
      }

      const fileUri = `${FileSystem.documentDirectory}QRCode_${Date.now()}.png`;
      const response = await FileSystem.downloadAsync(QR, fileUri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(response.uri, {
          mimeType: "image/png",
          dialogTitle: "Share QR Code",
        });
      } else {
        Alert.alert(
          t("QRcode.sharingUnavailableTitle"),
          t("QRcode.sharingUnavailableMessage"),
          [{ text: t("Main.OK") }],
        );
      }
    } catch (error) {
      console.error("Share error:", error);
      Alert.alert(t("Main.Error"), t("QRcode.failedShareQRCode"), [
        { text: t("Main.OK") },
      ]);
    }
  };

  const dynamicStyles = {
    imageHeight: 80,
    qrSize: 200,
  };

  if (loading) {
    return (
      <LoadingPage fullScreen />
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <CustomHeader
        title={t("QRcode.QRcode")}
        showBackButton={true}
        navigation={navigation}
        onBackPress={() => navigation.navigate("EngProfile")}
      />

      <View className="items-center mt-20 mb-4">
        <Image
          source={
            profileImage
              ? { uri: profileImage }
              : require("../../assets/images/auth/profile.webp")
          }
          className="w-24 h-24 rounded-full border-2 border-gray-300"
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
                resizeMode: "contain",
              }}
            />
          </View>
        ) : (
          <View className="items-center justify-center">
            <Text className=" text-center mt-4 p-2 gap-y-4 max-w-[80%] leading-7 text-gray-500 ">
              {t("QRcode.NoQrText")}
            </Text>
            <View className="flex items-center justify-center">
              {language === "en" ? (
                <View className="flex-row justify-center flex-wrap">
                  <Text className="text-sm text-black font-thin">View </Text>

                  <TouchableOpacity
                    onPress={() => navigation.navigate("TermsConditions")}
                  >
                    <Text className="text-sm text-black font-bold underline">
                      Terms & Conditions
                    </Text>
                  </TouchableOpacity>

                  <Text className="text-sm text-black font-thin"> and </Text>

                  <TouchableOpacity
                    onPress={() => navigation.navigate("PrivacyPolicy")}
                  >
                    <Text className="text-sm text-black font-bold underline">
                      Privacy Policy
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="flex-row justify-center flex-wrap">
                  <TouchableOpacity
                    onPress={() => navigation.navigate("TermsConditions")}
                  >
                    <Text
                      className="text-black font-bold underline"
                      style={{ fontSize: adjustFontSize(12) }}
                    >
                      නියමයන් සහ කොන්දේසි
                    </Text>
                  </TouchableOpacity>

                  <Text
                    className="text-black font-thin"
                    style={{
                      fontSize: adjustFontSize(12),
                      marginHorizontal: 2,
                    }}
                  >
                    {""} සහ
                  </Text>

                  <TouchableOpacity
                    onPress={() => navigation.navigate("PrivacyPolicy")}
                  >
                    <Text
                      className="text-black font-bold underline"
                      style={{ fontSize: adjustFontSize(12) }}
                    >
                      {""} රහස්‍යතා ප්‍රතිපත්තිය
                    </Text>
                  </TouchableOpacity>

                  <Text
                    className="text-black font-thin"
                    style={{ fontSize: adjustFontSize(12), marginLeft: 2 }}
                  >
                    {""} බලන්න
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              className=" bg-black mt-4 px-6 items-center justify-center h-[50px] rounded-3xl"
              onPress={async () => {
                navigation.navigate("MembershipScreen");
              }}
              style={{
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <View className="flex-row items-center justify-center gap-x-2">
                <Image
                  source={require("../../assets/images/qr-code/generate-qr.webp")}
                  style={{ width: 32, height: 32 }}
                />
                <Text className="text-white text-center text-lg " >
                  {t("QRcode.GenerateQr")}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View className="flex-row justify-center gap-6 mb-20 mt-2">
        {QR && (
          <>
            <TouchableOpacity
              className="bg-[#1E1E1E] w-24 h-20 rounded-lg items-center justify-center flex-col mt-5 ml-6 "
              onPress={downloadQRCode}
            >
              <MaterialIcons name="download" size={24} color="white" />
              <Text className="text-white text-xs mt-1">
                {t("QRcode.Download")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-[#1E1E1E] w-24 h-20 rounded-lg items-center justify-center flex-col  mt-5 ml-5"
              onPress={shareQRCode}
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

export default EngQRcode;
