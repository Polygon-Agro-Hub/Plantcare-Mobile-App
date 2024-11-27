import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import { Dimensions } from "react-native";

const { width: screenWidth } = Dimensions.get("window");

const OtpverificationOldUser: React.FC = ({ navigation, route }: any) => {
  const { mobileNumber } = route.params;
  const [otpCode, setOtpCode] = useState<string>("");
  const [maskedCode, setMaskedCode] = useState<string>("XXXXX");
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(240);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [disabledResend, setDisabledResend] = useState<boolean>(true);
  const { t } = useTranslation();
  const [language, setLanguage] = useState("en");
  useEffect(() => {
    const selectedLanguage = t("OtpVerification.LNG");
    setLanguage(selectedLanguage);
    const fetchReferenceId = async () => {
      try {
        const refId = await AsyncStorage.getItem("referenceId");
        if (refId) {
          setReferenceId(refId);
        }
      } catch (error) {
        console.error("Failed to load referenceId:", error);
      }
    };
    fetchReferenceId();
  }, []);

  useEffect(() => {
    if (timer > 0 && !isVerified) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      setDisabledResend(true);
      return () => clearInterval(interval);
    } else if (timer === 0 && !isVerified) {
      setDisabledResend(false);
    }
  }, [timer, isVerified]);

  const handleInputChange = (text: string) => {
    const sanitizedText = text.slice(0, 5);
    setOtpCode(sanitizedText);
    const masked = sanitizedText.padEnd(5, "X");
    setMaskedCode(masked);
  };

  const handleVerify = async () => {
    const code = otpCode;

    if (code.length !== 5) {
      Alert.alert(
        t("OtpVerification.invalidOTP"),
        t("OtpVerification.completeOTP")
      );
      return;
    }

    try {
      const refId = referenceId;

      const data: any = {
        phoneNumber: parseInt(mobileNumber, 10),
      };

      const url = "https://api.getshoutout.com/otpservice/verify";
      const headers = {
        Authorization: `Apikey ${environment.SHOUTOUT_API_KEY}`,
        "Content-Type": "application/json",
      };

      const body = {
        code: code,
        referenceId: refId,
      };

      const response = await axios.post(url, body, { headers });
      const { statusCode } = response.data;

      if (statusCode === "1000") {
        setIsVerified(true);

        const response = await fetch(
          `${environment.API_BASE_URL}api/auth/user-login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phonenumber: mobileNumber }),
          }
        );

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          if (data.token) {
            await AsyncStorage.setItem("userToken", data.token);
            navigation.navigate("Dashboard");
          } else {
            // Alert.alert("Login failed", "No token received");
            Alert.alert(
              t("OtpVerification.errorOccurred"),
              t("Main.somethingWentWrong")
            );
          }
        } else {
          // Alert.alert("Error", "Expected JSON but received something else");
          Alert.alert(
            t("OtpVerification.errorOccurred"),
            t("Main.somethingWentWrong")
          );
        }
      } else {
        Alert.alert(
          t("OtpVerification.invalidOTP"),
          t("OtpVerification.verificationFailed")
        );
      }
    } catch (error) {
      Alert.alert(
        t("OtpVerification.errorOccurred"),
        t("Main.somethingWentWrong")
      );
    }
  };

  const handleResendOTP = async () => {
    try {
      const apiUrl = "https://api.getshoutout.com/otpservice/send";
      const headers = {
        Authorization: `Apikey ${environment.SHOUTOUT_API_KEY}`,
        "Content-Type": "application/json",
      };

      const body = {
        source: "ShoutDEMO",
        transport: "sms",
        content: {
          sms: "Your code is {{code}}",
        },
        destination: mobileNumber,
      };

      const response = await axios.post(apiUrl, body, { headers });

      if (response.data.referenceId) {
        await AsyncStorage.setItem("referenceId", response.data.referenceId);
        setReferenceId(response.data.referenceId);
        Alert.alert(
          t("OtpVerification.success"),
          t("OtpVerification.otpResent")
        );
        setTimer(240);
        setDisabledResend(true);
      } else {
        Alert.alert(
          t("OtpVerification.errorOccurred"),
          t("OtpVerification.otpResendFailed")
        );
      }
    } catch (error) {
      Alert.alert(
        t("OtpVerification.errorOccurred"),
        t("OtpVerification.otpResendFailed")
      );
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
    >
      <StatusBar style="light" />
      <View>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back-outline" size={30} color="gray" />
        </TouchableOpacity>
      </View>
      <View className="flex justify-center items-center mt-0">
        <Text className="text-black" style={{ fontSize: wp(8) }}>
          {t("OtpVerification.OTPVerification")}
        </Text>
      </View>

      <View
        className="flex justify-center items-center"
        style={{ marginTop: hp(8) }}
      >
        <Image
          source={require("../assets/images/OTP 1.png")}
          style={{ width: 175, height: 120 }}
        />
        {language === "en" ? (
          <View className="mt-10">
            <Text className="text-md text-gray-400">
              {t("OtpVerification.OTPCode")}
            </Text>
            <Text className="text-md text-blue-500 text-center pt-1">
              {mobileNumber}
            </Text>
          </View>
        ) : (
          <View className="mt-10">
            <Text className="text-md text-blue-500 text-center ">
              {mobileNumber}
            </Text>

            <Text className="text-md text-gray-400 pt-1">
              {t("OtpVerification.OTPCode")}
            </Text>
          </View>
        )}

        <View className="pt-6">
          <TextInput
            style={{
              width: wp(60),
              height: hp(7),
              textAlign: "center",
              fontSize: wp(6),
              letterSpacing: wp(6),
              borderBottomWidth: 1,
              borderBottomColor: "gray",
              color: "black",
            }}
            keyboardType="numeric"
            maxLength={5}
            value={otpCode}
            onChangeText={handleInputChange}
            placeholder={maskedCode}
            placeholderTextColor="lightgray"
          />
        </View>

        <View className="mt-10">
          <Text className="mt-3 text-lg text-black text-center">
            {t("OtpVerification.didntreceived")}
          </Text>
        </View>

        <View className="mt-1 mb-9">
          <Text
            className="mt-3 text-lg text-black text-center underline"
            onPress={disabledResend ? undefined : handleResendOTP}
            style={{ color: disabledResend ? "gray" : "blue" }}
          >
            {timer > 0
              ? `${t("OtpVerification.Count")} ${formatTime(timer)}`
              : `${t("OtpVerification.Resendagain")}`}
          </Text>
        </View>

        <TouchableOpacity
          style={{ height: hp(7), width: wp(80) }}
          className="bg-gray-900 flex items-center justify-center mx-auto rounded-full"
          onPress={handleVerify}
        >
          <Text
            style={{ fontSize: wp(5) }}
            className="text-white font-bold tracking-wide"
          >
            {t("OtpVerification.Verify")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OtpverificationOldUser;
