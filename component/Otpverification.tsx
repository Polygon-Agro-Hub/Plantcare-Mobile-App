import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  Keyboard,
  ActivityIndicator,
  BackHandler
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
import { ScrollView } from "react-native-gesture-handler";
import { AntDesign } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

const { width: screenWidth } = Dimensions.get("window");

type RootStackParamList = {
  OtpVerification: undefined;
  NextScreen: undefined;
};

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
  const [isLoading, setIsLoading] = useState(false);
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
            navigation.navigate("SignupForum");
            return true; // Prevent default back action
          };
      
          BackHandler.addEventListener("hardwareBackPress", onBackPress);
      
          return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
        }, [navigation])
      );

  // useEffect(() => {
  //   if (timer > 0 && !isVerified) {
  //     const interval = setInterval(() => {
  //       setTimer((prevTimer) => prevTimer - 1);
  //     }, 1000);

  //     setDisabledResend(true);

  //     return () => clearInterval(interval);
  //   } else if (timer === 0 && !isVerified) {
  //     setDisabledResend(false);
  //   }
  // }, [timer, isVerified]);

    useFocusEffect(
    React.useCallback(() => {
      console.log(timer);
      if(timer === 0){
         setReferenceId("c0000000-0e0c-1000-b000-100000000000")
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
    }, [timer, isVerified])
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
      Alert.alert(
        t("Main.error"),
        t("OtpVerification.completeOTP")
      );
      setDisabledVerify(false);
      setIsLoading(false);
      return;
    }

    try {
      const refId = referenceId;
      let farmerLanguage;
      if(language === "si"){
        farmerLanguage = "Sinhala"
      }else if(language === "ta"){
        farmerLanguage = "Tamil"
      }else{
        farmerLanguage = "English"
      };

      const data: userItem = {
        firstName,
        lastName,
        phoneNumber: parseInt(mobileNumber, 10),
        NICnumber: nic,
        district,
        farmerLanguage
      };

      // Shoutout verify endpoint
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
          data
        );

        const { token } = response1.data;
        if (token) {
          // await AsyncStorage.setItem("userToken", token);
          const timestamp = new Date();
          const expirationTime = new Date(
            timestamp.getTime() + 8 * 60 * 60 * 1000
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
        // Handle failure
        Alert.alert(
          t("Main.error"),
          t("OtpVerification.verificationFailed")
        );
        setDisabledVerify(false);
        setIsLoading(false);
      } else {
        // Handle unexpected status codes
        Alert.alert(
          t("Main.error"),
          t("Main.somethingWentWrong")
        );
        setDisabledVerify(false);
        setIsLoading(false);
      }
    } catch (error) {
      // Handle errors
      console.error("Error during OTP verification or registration:", error);
      Alert.alert(
        t("Main.error"),
        t("Main.somethingWentWrong")
      );
      setDisabledVerify(false);
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    await AsyncStorage.removeItem("referenceId");
    try {
      const apiUrl = "https://api.getshoutout.com/otpservice/send";
      const headers = {
        Authorization: `Apikey ${environment.SHOUTOUT_API_KEY}`,
        "Content-Type": "application/json",
      };

      // const body = {
      //   source: "AgroWorld",
      //   transport: "sms",
      //   content: { sms: "Your code is {{code}}" },
      //   destination: mobileNumber,
      // };

            let otpMessage = "";
            if(i18n.language === "en"){
              otpMessage = `Your PlantCare OTP is {{code}}`;
            }else if(i18n.language === "si"){
              otpMessage = `ඔබේ PlantCare OTP මුරපදය {{code}} වේ.`;
            }else if(i18n.language === "ta"){
              otpMessage = `உங்கள் PlantCare OTP {{code}} ஆகும்.`;
            }
            const body = {
              source: "AgroWorld",
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
        Alert.alert(
          t("OtpVerification.success"),
          t("OtpVerification.otpResent")
        );
        setTimer(240);
        setDisabledResend(true);
      } else {
        Alert.alert(
          t("Main.error"),
          t("OtpVerification.otpResendFailed")
        );
      }
    } catch (error) {
      Alert.alert(
        t("Main.error"),
        t("OtpVerification.otpResendFailed")
      );
    }
  };

  // Format the timer for display
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  const dynamicStyles = {
    imageWidth: screenWidth < 400 ? wp(28) : wp(35),
    imageHeight: screenWidth < 400 ? wp(28) : wp(28),
    margingTopForImage: screenWidth < 400 ? wp(1) : wp(16),
    margingTopForBtn: screenWidth < 400 ? wp(0) : wp(10),
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <SafeAreaView className="flex-1 ">
        <StatusBar style="dark" />
        <View>
          <AntDesign
            name="left"
            size={24}
            color="#000502"
            onPress={() => navigation.goBack()}
            style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
          />
        </View>
        <View className="flex justify-center items-center mt-0">
          <Text className="text-black" style={{ fontSize: wp(8) }}>
            {t("OtpVerification.OTPVerification")}
          </Text>
        </View>

        <View
          className="flex justify-center items-center"
          style={{ marginTop: dynamicStyles.margingTopForImage }}
        >
          <Image
            source={require("../assets/images/OTP 1.webp")}
            style={{
              width: dynamicStyles.imageWidth,
              height: dynamicStyles.imageHeight,
            }}
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

          <View style={{ marginTop: dynamicStyles.margingTopForBtn }}>
            <TouchableOpacity
              style={{ height: hp(7), width: wp(80) }}
              className={`flex items-center justify-center mx-auto rounded-full ${
                !isOtpValid || disabledVerify ? "bg-gray-500" : "bg-gray-900"
              }`}
              onPress={handleVerify}
              disabled={!isOtpValid || disabledVerify}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white text-lg">
                  {t("OtpVerification.Verify")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default Otpverification;
