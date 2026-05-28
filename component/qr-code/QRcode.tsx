import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  BackHandler,
  Platform,
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

const QRcode: React.FC<QRcodeProps> = ({ navigation }) => {
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

  const requestMediaLibraryPermissions = async () => {
    try {
      if (Platform.OS === 'ios') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        return status === 'granted';
      } else {
        // For Android, check and request permissions with writeOnly=true to avoid audio permission request
        const permission = await MediaLibrary.getPermissionsAsync(true);
        if (permission.status !== 'granted') {
          const { status } = await MediaLibrary.requestPermissionsAsync(true);
          return status === 'granted';
        }
        return permission.status === 'granted';
      }
    } catch (error) {
      console.error("Permission error:", error);
      return false;
    }
  };

  const downloadQRCode = async () => {
    try {
      if (!QR) {
        Alert.alert(t("Main.Error"), t("QRcode.noQRCodeAvailable"), [
          { text: t("Main.OK") },
        ]);
        return;
      }

      // Request permissions
      const hasPermission = await requestMediaLibraryPermissions();
      if (!hasPermission) {
        Alert.alert(
          t("QRcode.AccessRequired"),
          t("QRcode.PleaseEnablePermissionToSaveTheQRToYourGallery"),
          [{ text: t("Main.OK") }],
        );
        return;
      }

      const fileUri = `${FileSystem.documentDirectory}QRCode_${Date.now()}.png`;
      
      // Download the file
      const downloadResult = await FileSystem.downloadAsync(QR, fileUri);
      
      if (downloadResult.status !== 200) {
        throw new Error('Download failed');
      }

      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
      
      // Create album and save
      const album = await MediaLibrary.getAlbumAsync('GoviCare');
      if (album) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      } else {
        await MediaLibrary.createAlbumAsync('GoviCare', asset, false);
      }

      Alert.alert(
        t("Main.Success"), 
        t("QRcode.YourQRCodeHasBeenSavedToYourGallery"), 
        [{ text: t("Main.OK") }]
      );
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert(
        t("Main.Error"), 
        t("QRcode.UnableToSaveQRCodePleaseTryAgain"), 
        [{ text: t("Main.OK") }]
      );
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
      const downloadResult = await FileSystem.downloadAsync(QR, fileUri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType: "image/png",
          dialogTitle: t("QRcode.ShareQRCode"),
        });
      } else {
        Alert.alert(
          t("QRcode.SharingFeatureUnavailable"),
          t("QRcode.ThisDeviceDoesNotSupportSharingQRCodes"),
          [{ text: t("Main.OK") }],
        );
      }
    } catch (error) {
      console.error("Share error:", error);
      Alert.alert(
        t("Main.Error"), 
        t("QRcode.UnableToShareQRCodePleaseTryAgainLater"), 
        [{ text: t("Main.OK") }]
      );
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
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      <CustomHeader
        title={t("QRcode.MyQRCode")}
        showBackButton={true}
        navigation={navigation}
        onBackPress={() => navigation.navigate("EngProfile")}
      />

      <View className="items-center mt-12 mb-6">
        <Image
          source={
            profileImage
              ? { uri: profileImage }
              : require("../../assets/images/auth/profile.webp")
          }
          className="w-24 h-24 rounded-full border-2 border-gray-300"
        />
        <Text className="text-lg font-semibold mt-3 text-center">{`${firstName} ${lastName}`}</Text>
      </View>

      <View className="items-center mb-8 mt-4 px-4">
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
          <View className="items-center justify-center w-full">
            <Text className="text-center mt-4 p-4 leading-7 text-gray-500 text-base">
              {t("Membership.ToObtainAccessToYourUniqueQRCodePleaseRegisterAsAMemberByEnteringYourBankDetailsThisCodeWillEnsureSmoothTransactionsAndSecurePaymentsDirectlyToYourBankAtOurCollectionCentres")}
            </Text>
            
            <View className="items-center justify-center mt-4 w-full">
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
                    className="text-black font-thin mx-0.5"
                    style={{ fontSize: adjustFontSize(12) }}
                  >
                    සහ
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("PrivacyPolicy")}
                  >
                    <Text
                      className="text-black font-bold underline"
                      style={{ fontSize: adjustFontSize(12) }}
                    >
                      රහස්‍යතා ප්‍රතිපත්තිය
                    </Text>
                  </TouchableOpacity>
                  <Text
                    className="text-black font-thin ml-0.5"
                    style={{ fontSize: adjustFontSize(12) }}
                  >
                    බලන්න
                  </Text>
                </View>
              )}
            </View>

            <View className="items-center justify-center w-full mt-8">
              <View
                className="w-4/5 rounded-full"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  elevation: 6,
                  backgroundColor: "transparent",
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={async () => {
                    navigation.navigate("MembershipScreen");
                  }}
                  style={{
                    backgroundColor: "#353535",
                    borderRadius: 100,
                    height: 55,
                    justifyContent: "center",
                    alignItems: "center",
                    overflow: "hidden",
                  }}
                >
                  <View className="flex-row items-center justify-center gap-x-2">
                    <Image
                      source={require("../../assets/images/qr-code/generate-qr.webp")}
                      style={{ width: 24, height: 24 }}
                    />
                    <Text className="text-white font-semibold text-center text-base">
                      {t("QRcode.GenerateMyQr")}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>

      {QR && (
        <View className="flex-row justify-center items-center gap-6 mb-12 mt-4 px-4">
          <TouchableOpacity
            className="bg-[#1E1E1E] w-1/3 h-24 rounded-xl items-center justify-center"
            onPress={downloadQRCode}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <MaterialIcons name="download" size={28} color="white" />
            <Text className="text-white text-sm mt-2 font-medium">
              {t("QRcode.Download")}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="bg-[#1E1E1E] w-1/3 h-24 rounded-xl items-center justify-center"
            onPress={shareQRCode}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <MaterialIcons name="share" size={28} color="white" />
            <Text className="text-white text-sm mt-2 font-medium">
              {t("QRcode.Share")}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

export default QRcode;