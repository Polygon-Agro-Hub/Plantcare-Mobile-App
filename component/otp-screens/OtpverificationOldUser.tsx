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
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Dimensions,
  StatusBar as RNStatusBar,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { setUserData } from "../../store/userSlice";
import CustomHeader from "../common/CustomHeader";
import { LinearGradient } from "expo-linear-gradient";

const OtpverificationOldUser: React.FC = ({ navigation, route }: any) => {
  const { mobileNumber } = route.params;
  const [otpCode, setOtpCode] = useState<string>("");
  const [maskedCode, setMaskedCode] = useState<string>("XXXXX");
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(240);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [disabledResend, setDisabledResend] = useState<boolean>(true);
  const [disabledVerify, setDisabledVerify] = useState<boolean>(false);
  const [isOtpExpired, setIsOtpExpired] = useState<boolean>(false);
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState("en");
  const [isOtpValid, setIsOtpValid] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const screenWidth = Dimensions.get("window").width;

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

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("Signin");
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => backHandler.remove();
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
          setTimer((prev) => prev - 1);
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
    setDisabledVerify(true);
    setIsLoading(true);
    const code = otpCode;

    if (code.length !== 5) {
      Alert.alert(
        t("OtpVerification.invalidOTP"),
        t("OtpVerification.completeOTP"),
        [{ text: t("PublicForum.OK") }],
      );
      setDisabledVerify(false);
      setIsLoading(false);
      return;
    }

    if (isOtpExpired) {
      Alert.alert(
        t("Main.error"),
        t("OtpVerification.otpExpired") ||
          "OTP has expired. Please resend a new OTP.",
        [{ text: t("PublicForum.OK") }],
      );
      setDisabledVerify(false);
      setIsLoading(false);
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
          },
        );

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          if (data.token) {
            const timestamp = new Date();
            const expirationTime = new Date(
              timestamp.getTime() + 8 * 60 * 60 * 1000,
            );
            await AsyncStorage.setItem("userToken", data.token);
            await AsyncStorage.multiSet([
              ["tokenStoredTime", timestamp.toISOString()],
              ["tokenExpirationTime", expirationTime.toISOString()],
            ]);
            dispatch(setUserData(data.user));
            navigation.navigate("Main");
            setDisabledVerify(false);
            setIsLoading(false);
          } else {
            Alert.alert(t("Main.error"), t("Main.somethingWentWrong"), [
              { text: t("PublicForum.OK") },
            ]);
            setDisabledVerify(false);
            setIsLoading(false);
          }
        } else {
          Alert.alert(t("Main.error"), t("Main.somethingWentWrong"), [
            { text: t("PublicForum.OK") },
          ]);
          setDisabledVerify(false);
          setIsLoading(false);
        }
      } else {
        Alert.alert(t("Main.error"), t("OtpVerification.invalidOTP"), [
          { text: t("PublicForum.OK") },
        ]);
        setDisabledVerify(false);
        setIsLoading(false);
      }
    } catch (error) {
      Alert.alert(t("Main.error"), t("Main.somethingWentWrong"), [
        { text: t("PublicForum.OK") },
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
          t("OtpVerification.success"),
          t("OtpVerification.otpResent"),
          [{ text: t("PublicForum.OK") }],
        );
        setTimer(240);
        setDisabledResend(true);
      } else {
        Alert.alert(t("Main.error"), t("OtpVerification.otpResendFailed"), [
          { text: t("PublicForum.OK") },
        ]);
      }
    } catch (error) {
      Alert.alert(t("Main.error"), t("OtpVerification.otpResendFailed"), [
        { text: t("PublicForum.OK") },
      ]);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  const dynamicStyles = {
    imageHeight: screenWidth < 400 ? wp(50) : wp(45),
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "white" }}
      enabled
    >
      <RNStatusBar barStyle="dark-content" backgroundColor="#fff" />
      <CustomHeader
        title=""
        navigation={navigation}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 bg-white justify-center">
          <View className="items-center justify-center px-4">
            <Text
              className=" font-semibold text-center mb-6"
              style={{
                fontSize:
                  i18n.language === "si" || i18n.language === "ta" ? 18 : 25,
              }}
            >
              {t("OtpVerification.OTPVerification")}
            </Text>
            <Image
              source={require("../../assets/images/otp/otp.webp")}
              resizeMode="contain"
              style={{ height: dynamicStyles.imageHeight, width: "100%" }}
            />

            {language === "en" ? (
              <View className="mt-6 items-center">
                <Text className="text-md text-gray-400 text-center">
                  {t("OtpVerification.OTPCode")}
                </Text>
                <Text className="text-md text-[#0085FF] text-center pt-4 font-semibold">
                  {mobileNumber}
                </Text>
              </View>
            ) : (
              <View className="mt-6 items-center">
                <Text className="text-md text-[#0085FF] text-center font-semibold">
                  {mobileNumber}
                </Text>
                <Text className="text-md text-[#818080] pt-4 text-center">
                  {t("OtpVerification.OTPCode")}
                </Text>
              </View>
            )}

            {/* OTP Input */}
            <View className="mt-6 w-full items-center">
              <TextInput
                style={{
                  width: wp(60),
                  height: hp(7),
                  textAlign: "center",
                  fontSize: wp(6),
                  letterSpacing: wp(4),
                  borderBottomWidth: 2,
                  borderBottomColor: "#D5D5D5",
                  color: "black",
                  fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
                }}
                keyboardType="numeric"
                maxLength={5}
                value={otpCode}
                onChangeText={handleInputChange}
                placeholder={maskedCode}
                placeholderTextColor="#B0B0B0"
                underlineColorAndroid="transparent"
                cursorColor="#141415ff"
                autoFocus
              />
            </View>

            {/* Timer and Resend */}
            <View className="mt-8 items-center">
              <Text className="text-base text-[#707070] text-center">
                {t("OtpVerification.didntreceived")}
              </Text>
              <TouchableOpacity
                onPress={disabledResend ? undefined : handleResendOTP}
                disabled={disabledResend}
                activeOpacity={0.7}
              >
                <Text
                  className="mt-2 text-lg text-center underline"
                  style={{
                    color: disabledResend ? "#9CA3AF" : "#0085FF",
                    fontSize: 16,
                  }}
                >
                  {timer > 0
                    ? `${t("OtpVerification.Count")} ${formatTime(timer)}`
                    : `${t("OtpVerification.Resendagain")}`}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Verify Button */}
            <View className="mt-8 w-full items-center">
              <View
                className="w-2/3 rounded-full"
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
                  onPress={handleVerify}
                  disabled={!isOtpValid || disabledVerify}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      !isOtpValid || disabledVerify
                        ? ["#353535", "#353535"]
                        : ["#0FC7B2", "#10A37D"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="w-full rounded-3xl h-[50px] justify-center items-center"
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text className="text-white font-semibold text-center text-lg">
                        {t("OtpVerification.Verify")}
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default OtpverificationOldUser;
