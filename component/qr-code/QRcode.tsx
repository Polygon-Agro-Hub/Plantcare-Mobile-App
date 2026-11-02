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

  // Snapshot of the hidden card (logo + QR + name) as a PNG
  const captureShareCard = async (): Promise<string> => {
    if (!shareCardRef.current) {
      throw new Error("QR card is not ready yet.");
    }
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
      if (!QR || !hiddenQrLoaded) {
        Alert.alert(
          t("Main.Error") || "Error",
          t("QRcode.noQRCodeAvailable") || "No QR code available",
          [{ text: t("Main.OK") || "OK" }],
        );
        return;
      }

      const localUri = await captureShareCard();

      const saved = await saveImageToGallery(localUri, "QRCode");

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
      if (!QR || !hiddenQrLoaded) {
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

      {/* ===== Hidden card: only used for Download / Share image ===== */}
      {QR ? (
        <View
          pointerEvents="none"
          style={{ position: "absolute", left: -2000, top: 0 }}
        >
          <View
            ref={shareCardRef}
            collapsable={false}
            style={{
              width: 360,
              backgroundColor: "#FFFFFF",
              alignItems: "center",
              paddingVertical: 24,
              paddingHorizontal: 20,
            }}
          >
            {/* 1. Logo */}
            <Image
              source={LOGO}
              style={{ width: 180, height: 70, marginBottom: 16 }}
              resizeMode="contain"
            />

            {/* 2. QR with yellow rounded frame */}
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderWidth: 4,
                borderColor: "#00A896",
                borderRadius: 28,
                padding: 24,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={{ uri: `${QR}` }}
                onLoad={() => setHiddenQrLoaded(true)}
                style={{ width: 240, height: 240 }}
                resizeMode="contain"
              />
            </View>

            {/* 3. Name */}
            <Text
              style={{
                marginTop: 18,
                fontSize: 22,
                fontWeight: "700",
                color: "#111827",
                textAlign: "center",
              }}
            >
              {`${firstName} ${lastName}`}
            </Text>
          </View>
        </View>
      ) : null}

      {/* ===== Original visible UI (unchanged) ===== */}
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
          <View className="bg-white p-6 rounded-xl border-2 border-[#00A896]">
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
