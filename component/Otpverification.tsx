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

// Get screen width
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
}

const Otpverification: React.FC = ({ navigation, route }: any) => {
  const { mobileNumber, firstName, lastName, nic, district } = route.params;
  const [otpCode, setOtpCode] = useState<string>("");
  const [maskedCode, setMaskedCode] = useState<string>("XXXXX");
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(240); // Timer starts at 4 minutes (240 seconds)
  const [isVerified, setIsVerified] = useState<boolean>(false); // Track if OTP is verified
  const [disabledResend, setDisabledResend] = useState<boolean>(true); // Disable resend button initially
  const { t } = useTranslation();

  // Fetch referenceId from AsyncStorage
  useEffect(() => {
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

  // Timer logic
  useEffect(() => {
    if (timer > 0 && !isVerified) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      setDisabledResend(true);

      return () => clearInterval(interval);
    } else if (timer === 0 && !isVerified) {
      setDisabledResend(false);
    }
  }, [timer, isVerified]);

  // Function to handle input change (OTP input)
  const handleInputChange = (text: string) => {
    const sanitizedText = text.slice(0, 5); // Limit input to 5 characters
    setOtpCode(sanitizedText);

    // Mask the remaining characters with "X"
    const masked = sanitizedText.padEnd(5, "X");
    setMaskedCode(masked);
  };

  // Verify OTP
  // const handleVerify = async () => {
  //   if (otpCode.length !== 5) {
  //     Alert.alert(t("OtpVerification.invalidOTP"), t("OtpVerification.completeOTP"));
  //     return;
  //   }

  //   try {
  //     const refId = referenceId;
  //     const data: userItem = {
  //       firstName,
  //       lastName,
  //       phoneNumber: parseInt(mobileNumber, 10),
  //       NICnumber: nic,
  //     };

  //     const url = "https://api.getshoutout.com/otpservice/verify";
  //     const headers = {
  //       Authorization: `Apikey ${environment.SHOUTOUT_API_KEY}`,
  //       "Content-Type": "application/json",
  //     };

  //     const body = { code: otpCode, referenceId: refId };

  //     const response = await axios.post(url, body, { headers });

  //     const { statusCode } = response.data;

  //     if (statusCode === "1000") {
  //       setIsVerified(true); // OTP verified, stop timer

  //       // Proceed with user registration
  //       await axios.post(`${environment.API_BASE_URL}api/auth/user-register`, data);
        
  //       navigation.navigate("Verify"); // Navigate to the next screen
  //     } else {
  //       Alert.alert(t("OtpVerification.invalidOTP"), t("OtpVerification.verificationFailed"));
  //     }
  //   } catch (error) {
  //     Alert.alert(t("OtpVerification.errorOccurred"), t("OtpVerification.somethingWentWrong"));
  //   }
  // };

  const handleVerify = async () => {
    const code = otpCode; // Combine the OTP code array into a single string

    if (code.length !== 5) {
      Alert.alert(t("OtpVerification.invalidOTP"), t("OtpVerification.completeOTP"));
      return;
    }

    try {
      const refId = referenceId;

      const data: userItem = {
        firstName,
        lastName,
        phoneNumber: parseInt(mobileNumber, 10),
        NICnumber: nic,
        district
      };

      // Shoutout verify endpoint
      const url = "https://api.getshoutout.com/otpservice/verify";
      const headers = {
        Authorization: `Apikey ${environment.SHOUTOUT_API_KEY}`,
        "Content-Type": "application/json",
      };

      const body = {
        code: code,
        referenceId: refId, // Use the referenceId from the route params
      };

      // Make the POST request to verify OTP
      const response = await axios.post(url, body, { headers });
      console.log("Response:", response.data);

      const { statusCode } = response.data;

      if (statusCode === "1000") {
        setIsVerified(true); // Mark OTP as verified and stop timer

        // Registration API call
        const response1 = await axios.post(
          `${environment.API_BASE_URL}api/auth/user-register`,
          data
        );
        console.log("Registration response:", response1.data);

        // Retrieve and store token if available
        const { token } = response1.data;
        if (token) {
          await AsyncStorage.setItem("userToken", token);
          console.log("User Token stored in AsyncStorage:", token);
        } else {
          console.log("No token found in the registration response.");
        }

        // Navigate to the next screen after successful verification and registration
        navigation.navigate("Verify");
      } else if (statusCode === "1001") {
        // Handle failure
        Alert.alert(
          t("OtpVerification.invalidOTP"), 
          t("OtpVerification.verificationFailed")
        );
      } else {
        // Handle unexpected status codes
        Alert.alert(t("OtpVerification.errorOccurred"), t("OtpVerification.somethingWentWrong"));
      }
    } catch (error) {
      // Handle errors
      console.error("Error during OTP verification or registration:", error);
      Alert.alert(
        t("OtpVerification.errorOccurred"),
        t("OtpVerification.somethingWentWrong")
      );
    }
  };

  // Resend OTP
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
        content: { sms: "Your code is {{code}}" },
        destination: mobileNumber,
      };

      const response = await axios.post(apiUrl, body, { headers });

      if (response.data.referenceId) {
        await AsyncStorage.setItem("referenceId", response.data.referenceId);
        setReferenceId(response.data.referenceId);
        Alert.alert(t("OtpVerification.success"), t("OtpVerification.otpResent"));
        setTimer(240); // Reset the timer after resending OTP
        setDisabledResend(true); // Disable resend button until timer ends
      } else {
        Alert.alert(t("OtpVerification.errorOccurred"), t("OtpVerification.otpResendFailed"));
      }
    } catch (error) {
      Alert.alert(t("OtpVerification.errorOccurred"), t("OtpVerification.otpResendFailed"));
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
    <SafeAreaView className="flex-1 " style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}>
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

      <View className="flex justify-center items-center" style={{ marginTop: dynamicStyles.margingTopForImage }}>
        <Image source={require("../assets/images/OTP 1.png")} style={{ width: dynamicStyles.imageWidth, height: dynamicStyles.imageHeight }} />
        <View className="mt-10">
          <Text className="text-md text-gray-400">{t("OtpVerification.OTPCode")}</Text>
          <Text className="text-md text-blue-500 text-center pt-1">{mobileNumber}</Text>
        </View>
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
          <Text className="mt-3 text-lg text-black text-center">{t("OtpVerification.didntreceived")}</Text>
        </View>

        <View className="mt-1 mb-9">
          <Text
            className="mt-3 text-lg text-black text-center underline"
            onPress={disabledResend ? undefined : handleResendOTP}
            style={{ color: disabledResend ? "gray" : "blue" }}
          >
            {timer > 0 ? `${t("OtpVerification.Count")} ${formatTime(timer)}` : `${t("OtpVerification.Resendagain")}`}
          </Text>
        </View>

        <View style={{ marginTop: dynamicStyles.margingTopForBtn }}>
          <TouchableOpacity
            style={{ height: hp(7), width: wp(80) }}
            className="bg-gray-900 flex items-center justify-center mx-auto rounded-full"
            onPress={handleVerify}
            disabled={isVerified}
          >
            <Text className="text-white text-lg">{t("OtpVerification.Verify")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Otpverification;
