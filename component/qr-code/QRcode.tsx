import React, { useState, useEffect, useRef } from "react";
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
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveImageToGallery } from "@/utils/mediaSave";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/types";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import type { NativeEventSubscription } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import CustomHeader from "../common/CustomHeader";
import LoadingPage from "../common/LoadingPage";
import DownloadShareButtons from "../common/DownloadShareButtons";

type QRcodeNavigationPrps = StackNavigationProp<RootStackParamList, "QRcode">;

interface QRcodeProps {
  navigation: QRcodeNavigationPrps;
}

const LOGO = require("../../assets/images/qr-code/polygon-logo.webp");

const QRcode: React.FC<QRcodeProps> = ({ navigation }) => {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const { t } = useTranslation();
  const [QR, setQR] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [language, setLanguage] = useState("en");
  const [hiddenQrLoaded, setHiddenQrLoaded] = useState<boolean>(false);

  // Hidden card used ONLY for Download / Share
  const shareCardRef = useRef<View>(null);

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
        Alert.alert(
          t("Main.Error"),
          t("Main.SomethingWentWrongPleaseTryAgainlater"),
          [{ text: t("Main.OK") }],
        );
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
        Alert.alert(
          t("Main.Error"),
          t("Main.SomethingWentWrongPleaseTryAgainlater"),
          [{ text: t("Main.OK") }],
        );
      }
    } catch (error) {
      console.error("Fetch error:", error);
      Alert.alert(
        t("Main.Error"),
        t("Main.SomethingWentWrongPleaseTryAgainlater"),
        [{ text: t("Main.OK") }],
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrationDetails();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchRegistrationDetails();
    }, []),
  );

  // Snapshot of the hidden card (logo + QR + name) as a PNG matching Transport project layout
  const captureShareCard = async (): Promise<string> => {
    if (!shareCardRef.current) {
      throw new Error("QR card is not ready yet.");
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
    return await captureRef(shareCardRef, {
      format: "png",
      quality: 1,
      result: "tmpfile",
    });
  };

  const getErrorMessage = (error: unknown, fallback: string): string => {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    if (typeof error === "string" && error) {
      return error;
    }
    return fallback;
  };

  const downloadQRCode = async () => {
    try {
      if (!QR) {
        Alert.alert(
          t("Main.Error") || "Error",
          t("QRcode.noQRCodeAvailable") || "No QR code available",
          [{ text: t("Main.OK") || "OK" }],
        );
        return;
      }

      const localUri = await captureShareCard();

      const saved = await saveImageToGallery(localUri, `Farmer_QR_${firstName || "Card"}`);

      if (!saved) {
        return;
      }

      Alert.alert(
        t("Main.Success") || "Success",
        t("QRcode.YourQRCodeHasBeenSavedToYourGallery") ||
          "Your QR Code has been saved to your gallery.",
        [{ text: t("Main.OK") || "OK" }],
      );
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert(
        t("Main.Error") || "Error",
        getErrorMessage(
          error,
          t("QRcode.UnableToSaveQRCodePleaseTryAgain") ||
            "Unable to save QR code. Please try again.",
        ),
        [{ text: t("Main.OK") || "OK" }],
      );
    }
  };

  const shareQRCode = async () => {
    try {
      if (!QR) {
        Alert.alert(
          t("Main.Error") || "Error",
          t("QRcode.noQRCodeAvailable") || "No QR code available",
          [{ text: t("Main.OK") || "OK" }],
        );
        return;
      }

      const localUri = await captureShareCard();

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(localUri, {
          UTI: "public.png",
          mimeType: "image/png",
          dialogTitle: t("QRcode.ShareQRCode") || "Share QR Code",
        });
      } else {
        Alert.alert(
          t("QRcode.SharingFeatureUnavailable") || "Sharing Unavailable",
          t("QRcode.ThisDeviceDoesNotSupportSharingQRCodes") ||
            "This device does not support sharing QR codes.",
          [{ text: t("Main.OK") || "OK" }],
        );
      }
    } catch (error) {
      console.error("Share error:", error);
      Alert.alert(
        t("Main.Error") || "Error",
        getErrorMessage(
          error,
          t("QRcode.UnableToShareQRCodePleaseTryAgainLater") ||
            "Unable to share QR code. Please try again later.",
        ),
        [{ text: t("Main.OK") || "OK" }],
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
    <ScrollView
      className="flex-1 bg-white"
      showsVerticalScrollIndicator={false}
    >
      <CustomHeader
        title={t("QRcode.MyQRCode")}
        showBackButton={true}
        navigation={navigation}
        onBackPress={() => navigation.navigate("EngProfile")}
      />

      {/* ===== Off-screen Printable Card (used strictly for downloading & sharing — matching Transport design) ===== */}
      {QR ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: -9999,
            top: 0,
            width: 440,
            backgroundColor: "#FFFFFF",
          }}
        >
          <View
            ref={shareCardRef}
            collapsable={false}
            style={{
              width: 440,
              minHeight: 580,
              backgroundColor: "#FFFFFF",
              paddingTop: 40,
              paddingBottom: 70,
              paddingHorizontal: 30,
              alignItems: "center",
              borderWidth: 2,
              borderColor: "#E5E7EB",
              borderRadius: 24,
            }}
          >
            {/* Top: Polygon logo */}
            <View style={{ alignItems: "center", marginBottom: 22 }}>
              <Image
                source={LOGO}
                style={{ width: 240, height: 72 }}
                resizeMode="contain"
              />
            </View>

            {/* Middle: QR Code Container (dimensions and white BG padding matching Transport app) */}
            <View
              style={{
                backgroundColor: "#FFFFFF",
                padding: 16,
                borderRadius: 20,
                borderWidth: 2.5,
                borderColor: "#00A896",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={{ uri: `${QR}` }}
                onLoad={() => setHiddenQrLoaded(true)}
                style={{ width: 270, height: 270 }}
                resizeMode="contain"
              />
            </View>

            {/* Bottom: Farmer Info */}
            <View style={{ alignItems: "center", marginTop: 22, width: "100%" }}>
              <Text
                style={{
                  fontSize: 23,
                  fontWeight: "bold",
                  color: "#111827",
                  textAlign: "center",
                }}
              >
                {`${firstName} ${lastName}`.trim()}
              </Text>
            </View>
          </View>
        </View>
      ) : null}

      {/* ===== Visible UI (Matching Transport app design) ===== */}
      {/* Top: Polygon Logo */}
      <View className="items-center mb-4 mt-6">
        <Image
          source={LOGO}
          style={{ width: 180, height: 54 }}
          resizeMode="contain"
        />
      </View>

      {/* User / Farmer Name */}
      <View className="items-center mb-6">
        <Text className="text-2xl font-bold text-gray-900 text-center">
          {`${firstName} ${lastName}`.trim()}
        </Text>
      </View>

      {/* QR Code Container (Aligned with bottom button side lines) */}
      <View
        style={{
          width: "100%",
          paddingHorizontal: 32,
          maxWidth: 500,
          alignSelf: "center",
          alignItems: "center",
          marginBottom: 32,
        }}
      >
        {QR ? (
          <View
            style={{
              width: "100%",
              aspectRatio: 1,
              backgroundColor: "#FFFFFF",
              borderRadius: 24,
              borderWidth: 2,
              borderColor: "#00A896",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 4,
              padding: 16,
            }}
          >
            <Image
              source={{ uri: `${QR}` }}
              style={{
                width: "90%",
                height: "90%",
                maxWidth: 280,
                maxHeight: 280,
                resizeMode: "contain",
              }}
            />
          </View>
        ) : (
          <View className="items-center justify-center w-full">
            <Text className="text-center mt-4 p-4 leading-7 text-gray-500 text-base">
              {t(
                "Membership.ToObtainAccessToYourUniqueQRCodePleaseRegisterAsAMemberByEnteringYourBankDetailsThisCodeWillEnsureSmoothTransactionsAndSecurePaymentsDirectlyToYourBankAtOurCollectionCentres",
              )}
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
        <View style={{ width: "100%", alignItems: "center", justifyContent: "center", marginTop: 8, marginBottom: 24 }}>
          <DownloadShareButtons
            onDownload={downloadQRCode}
            onShare={shareQRCode}
            downloadLabel={t("QRcode.Download")}
            shareLabel={t("QRcode.Share")}
            disabled={!QR}
          />
        </View>
      )}
    </ScrollView>
  );
};

export default QRcode;
