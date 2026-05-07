import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  Keyboard,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";
import CustomHeader from "../common/CustomHeader";

interface userItem {
  firstName: string;
  lastName: string;
  phoneNumber: number;
  NICnumber: string;
  district: string;
  farmerLanguage: string;
}

const Otpverification: React.FC = ({ navigation, route }: any) => {
  const { mobileNumber, firstName, lastName, nic, district } = route.params;
  const [otpCode, setOtpCode] = useState<string>("");
  const [maskedCode, setMaskedCode] = useState<string>("XXXXX");
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(240);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [disabledResend, setDisabledResend] = useState<boolean>(true);
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState("en");
  const [isOtpValid, setIsOtpValid] = useState<boolean>(false);
  const [disabledVerify, setDisabledVerify] = useState<boolean>(false);
  const [isOtpExpired, setIsOtpExpired] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const selectedLanguage = t("Main.LNG");
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

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("Signup");
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [navigation]),
  );

  useFocusEffect(
    React.useCallback(() => {
      if (timer === 0) {
        setReferenceId("c0000000-0e0c-1000-b000-100000000000");
        setIsOtpExpired(true);
      }

      if (timer > 0 && !isVerified) {
        const interval = setInterval(() => {
          setTimer((prevTimer) => prevTimer - 1);
        }, 1000);

        setDisabledResend(true);

        return () => clearInterval(interval);
      } else if (timer === 0 && !isVerified) {
        setDisabledResend(false);
      }
    }, [timer, isVerified]),
  );

  const handleInputChange = (text: string) => {
    const sanitizedText = text.slice(0, 5);
    setOtpCode(sanitizedText);

    const masked = sanitizedText.padEnd(5, "X");
    setMaskedCode(masked);
    setIsOtpValid(sanitizedText.length === 5);
    if (sanitizedText.length === 5) {
      Keyboard.dismiss();
    }
  };

  const handleVerify = async () => {
    if (disabledVerify) return;
    setIsLoading(true);
    setDisabledVerify(true);
    const code = otpCode;

    if (code.length !== 5) {
      Alert.alert(t("Main.Error"), t("OtpVerification.completeOTP"), [
        { text: t("Main.OK") },
      ]);
      setDisabledVerify(false);
      setIsLoading(false);
      return;
    }

    if (isOtpExpired) {
      Alert.alert(
        t("Main.Error"),
        t("OtpVerification.otpExpired") ||
        "OTP has expired. Please resend a new OTP.",
        [{ text: t("Main.OK") }],
      );
      setDisabledVerify(false);
      setIsLoading(false);
      return;
    }

    try {
      const refId = referenceId;
      let farmerLanguage;
      if (language === "si") {
        farmerLanguage = "Sinhala";
      } else if (language === "ta") {
        farmerLanguage = "Tamil";
      } else {
        farmerLanguage = "English";
      }

      const data: userItem = {
        firstName,
        lastName,
        phoneNumber: parseInt(mobileNumber, 10),
        NICnumber: nic,
        district,
        farmerLanguage,
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

        const response1 = await axios.post(
          `${environment.API_BASE_URL}api/auth/user-register`,
          data,
        );

        const { token } = response1.data;
        if (token) {
          const timestamp = new Date();
          const expirationTime = new Date(
            timestamp.getTime() + 8 * 60 * 60 * 1000,
          );
          await AsyncStorage.setItem("userToken", token);
          await AsyncStorage.multiSet([
            ["tokenStoredTime", timestamp.toISOString()],
            ["tokenExpirationTime", expirationTime.toISOString()],
          ]);
        } else {
        }
        navigation.navigate("Verify");
        setIsLoading(false);
        setDisabledVerify(false);
      } else if (statusCode === "1001") {
        Alert.alert(t("Main.Error"), t("OtpVerification.verificationFailed"), [
          { text: t("Main.OK") },
        ]);
        setDisabledVerify(false);
        setIsLoading(false);
      } else {
        Alert.alert(t("Main.Error"), t("Main.SomethingWentWrongPleaseTryAgainlater"), [
          { text: t("Main.OK") },
        ]);
        setDisabledVerify(false);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error during OTP verification or registration:", error);
      Alert.alert(t("Main.Error"), t("Main.SomethingWentWrongPleaseTryAgainlater"), [
        { text: t("Main.OK") },
      ]);
      setDisabledVerify(false);
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    await AsyncStorage.removeItem("referenceId");
    try {
      const apiUrl = "https://api.getshoutout.com/otpservice/send";
      const headers = {
        Authorization: `Apikey ${environment.SHOUTOUT_API_KEY}`,
        "Content-Type": "application/json",
      };

      let otpMessage = "";
      if (i18n.language === "en") {
        otpMessage = `Your GoviCare OTP is {{code}}`;
      } else if (i18n.language === "si") {
        otpMessage = `ඔබේ GoviCare OTP මුරපදය {{code}} වේ.`;
      } else if (i18n.language === "ta") {
        otpMessage = `உங்கள் GoviCare OTP {{code}} ஆகும்.`;
      }
      const body = {
        source: "PolygonAgro",
        transport: "sms",
        content: {
          sms: otpMessage,
        },
        destination: mobileNumber,
      };

      const response = await axios.post(apiUrl, body, { headers });

      if (response.data.referenceId) {
        await AsyncStorage.setItem("referenceId", response.data.referenceId);
        setReferenceId(response.data.referenceId);
        setIsOtpExpired(false);
        Alert.alert(
          t("Main.Success"),
          t("OtpVerification.otpResent"),
          [{ text: t("Main.OK") }],
        );
        setTimer(240);
        setDisabledResend(true);
      } else {
        Alert.alert(t("Main.Error"), t("OtpVerification.otpResendFailed"), [
          { text: t("Main.OK") },
        ]);
      }
    } catch (error) {
      Alert.alert(t("Main.Error"), t("OtpVerification.otpResendFailed"), [
        { text: t("Main.OK") },
      ]);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled" className="bg-[#FFFFFF]">
      <View className="flex-1 ">
        <StatusBar style="dark" />
        <CustomHeader
          title=""
          navigation={navigation}
          onBackPress={() => navigation.goBack()}
        />
        <View className="flex justify-center items-center mt-0">
          <Text className="text-black" style={{ fontSize: wp(8) }}>
            {t("OtpVerification.OTPVerification")}
          </Text>
        </View>

        <View className="flex justify-center items-center mt-5">
          <Image
            source={require("../../assets/images/otp/otp.webp")}
            style={{ width: 280, height: 140 }}
            resizeMode="contain"
          />
          {language === "en" ? (
            <View className="mt-10">
              <Text className="text-md text-[#818080]">
                {t("OtpVerification.OTPCode")}
              </Text>
              <Text className="text-md text-[#0085FF] text-center pt-1">
                {mobileNumber}
              </Text>
            </View>
          ) : (
            <View className="mt-10">
              <Text className="text-md text-[#0085FF] text-center ">
                {mobileNumber}
              </Text>

              <Text className="text-md text-[#818080] pt-1">
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
            <Text className="mt-3 text-base text-[#707070] text-center">
              {t("OtpVerification.didntreceived")}
            </Text>
          </View>

          <View className="mt-1 mb-9">
            <Text
              className="mt-3 text-lg text-black text-center underline"
              onPress={disabledResend ? undefined : handleResendOTP}
              style={{ color: disabledResend ? "#393939" : "blue" }}
            >
              {timer > 0
                ? `${t("OtpVerification.Count")} ${formatTime(timer)}`
                : `${t("OtpVerification.Resendagain")}`}
            </Text>
          </View>

          <View className="mt-4">
            <TouchableOpacity
              className={`mt-2 w-2/3 rounded-3xl mb-2 h-[50px] items-center justify-center ${!isOtpValid || disabledVerify ? "bg-gray-500" : "bg-[#353535]"
                }`}
              onPress={handleVerify}
              disabled={!isOtpValid || disabledVerify}
              style={{
                width: wp(72),
                height: hp(7),
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white  font-semibold text-base">
                  {t("OtpVerification.Verify")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default Otpverification;
