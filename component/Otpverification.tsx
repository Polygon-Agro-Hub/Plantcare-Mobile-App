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
// Define the types for navigation
type RootStackParamList = {
  OtpVerification: undefined;
  NextScreen: undefined; // Define other screens as needed
};

interface userItem {
  firstName: String; // Matches the SQL column names
  lastName: String;
  phoneNumber: number; // Concatenate country code and phone number
  NICnumber: String;
}

// Define the OtpSinhalaVerification screen component without explicit typing
const Otpverification: React.FC = ({ navigation, route }: any) => {
  const { mobileNumber, firstName, lastName, nic } = route.params;

  const [otpCode, setOtpCode] = useState<string[]>(Array(5).fill(""));
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(240); // Timer starts at 4 minutes (240 seconds)
  const [isVerified, setIsVerified] = useState<boolean>(false); // Track if OTP is verified
  const inputs: TextInput[] = []; // Ref array for text inputs
  const { t } = useTranslation();
  // Retrieve referenceId from AsyncStorage
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

      return () => clearInterval(interval);
    } else if (timer === 0 && !isVerified) {
      clearReferenceIdAndRedirect();
    }
  }, [timer, isVerified]);

  // Function to clear referenceId and redirect
  const clearReferenceIdAndRedirect = async () => {
    try {
      await AsyncStorage.removeItem("referenceId");
      Alert.alert("Timeout", "OTP timed out. Please try again.");
      navigation.goBack(); // Redirect to the previous page
    } catch (error) {
      console.error("Error clearing referenceId:", error);
    }
  };

  // Function to handle input change
  const handleInputChange = (text: string, index: number) => {
    const newOtpCode = [...otpCode];
    newOtpCode[index] = text; // Set the new value at the current index
    setOtpCode(newOtpCode);

    // Move to the next input if the text length is 1 (digit entered)
    if (text.length === 1 && index < otpCode.length - 1) {
      inputs[index + 1].focus(); // Focus on the next input
    } else if (text.length === 0 && index > 0) {
      inputs[index - 1].focus(); // Focus on the previous input if deleted
    }
  };

  const handleVerify = async () => {
    const code = otpCode.join(""); // Combine the OTP code array into a single string

    if (code.length !== 5) {
      Alert.alert("Invalid OTP", "Please enter the complete OTP.");
      return;
    }

    try {
      const refId = referenceId;

      const data: userItem = {
        firstName,
        lastName,
        phoneNumber: parseInt(mobileNumber, 10),
        NICnumber: nic,
      };

      // Shoutout verify endpoint
      const url = "https://api.getshoutout.com/otpservice/verify";
      const headers = {
        Authorization:
          "Apikey eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NmM4NTZkMC04YmY2LTExZWQtODE0NS0yOTMwOGIyN2NlM2EiLCJzdWIiOiJTSE9VVE9VVF9BUElfVVNFUiIsImlhdCI6MTY3MjgxMjYxOCwiZXhwIjoxOTg4NDMxODE4LCJzY29wZXMiOnsiYWN0aXZpdGllcyI6WyJyZWFkIiwid3JpdGUiXSwibWVzc2FnZXMiOlsicmVhZCIsIndyaXRlIl0sImNvbnRhY3RzIjpbInJlYWQiLCJ3cml0ZSJdfSwic29fdXNlcl9pZCI6IjgzOTkzIiwic29fdXNlcl9yb2xlIjoidXNlciIsInNvX3Byb2ZpbGUiOiJhbGwiLCJzb191c2VyX25hbWUiOiIiLCJzb19hcGlrZXkiOiJub25lIn0.ayaQjSjBxcSSnqskZp_F_NlrLa_98ddiOi1lfK8WrJ4",
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

        const response1 = await axios.post<userItem>(
          `${environment.API_BASE_URL}api/auth/user-register`,
          data
        );
        console.log("Registration response:", response1.data);

        navigation.navigate("Verify"); // Navigate to the next screen
      } else if (statusCode === "1001") {
        // Handle failure
        Alert.alert(
          "Verification Failed",
          "The OTP verification failed. Please try again."
        );
      } else {
        // Handle unexpected status codes
        Alert.alert("Error", "An unexpected error occurred.");
      }
    } catch (error) {
      // Handle errors
      Alert.alert(
        "Error",
        "Something went wrong during the OTP verification. Please try again later."
      );
    }
  };

  // Function to resend the OTP
  const handleResendOTP = async () => {
    try {
      const apiUrl = "https://api.getshoutout.com/otpservice/send";

      const headers = {
        Authorization:
          "Apikey eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NmM4NTZkMC04YmY2LTExZWQtODE0NS0yOTMwOGIyN2NlM2EiLCJzdWIiOiJTSE9VVE9VVF9BUElfVVNFUiIsImlhdCI6MTY3MjgxMjYxOCwiZXhwIjoxOTg4NDMxODE4LCJzY29wZXMiOnsiYWN0aXZpdGllcyI6WyJyZWFkIiwid3JpdGUiXSwibWVzc2FnZXMiOlsicmVhZCIsIndyaXRlIl0sImNvbnRhY3RzIjpbInJlYWQiLCJ3cml0ZSJdfSwic29fdXNlcl9pZCI6IjgzOTkzIiwic29fdXNlcl9yb2xlIjoidXNlciIsInNvX3Byb2ZpbGUiOiJhbGwiLCJzb191c2VyX25hbWUiOiIiLCJzb19hcGlrZXkiOiJub25lIn0.ayaQjSjBxcSSnqskZp_F_NlrLa_98ddiOi1lfK8WrJ4",
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

      console.log("Sending OTP to:", mobileNumber);

      const response = await axios.post(apiUrl, body, { headers });
      console.log("OTP response:", response.data);

      if (response.data.referenceId) {
        await AsyncStorage.setItem("referenceId", response.data.referenceId);
        setReferenceId(response.data.referenceId);
        Alert.alert("Success", "OTP resent successfully!");
        setTimer(240); // Reset the timer after resending OTP
      } else {
        Alert.alert("Error", "Failed to resend OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      Alert.alert("Error", "Failed to resend OTP. Please try again.");
    }
  };

  // Format the timer for display
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  return (
    <SafeAreaView className="flex-1">
      <StatusBar style="light" />

      <View>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back-outline" size={30} color="gray" />
        </TouchableOpacity>
      </View>
      <View className="flex justify-center items-center mt-5">
        <Text className="text-black" style={{ fontSize: wp(8) }}>
          {t("OtpVerification.OTPVerification")}
        </Text>
      </View>

      <View className="flex justify-center items-center mt-16">
        <Image source={require("../assets/images/OTP 1.png")} />
        <View className="mt-10">
          <Text className="text-md text-gray-400">
            {t("OtpVerification.OTPCode")}
          </Text>
          <Text className="text-md text-blue-500 text-center pt-1 ">
            {mobileNumber}
          </Text>
        </View>
        <View className="flex-row items-center justify-between pt-6">
          {otpCode.map((digit, index) => (
            <View
              key={index}
              className="bg-green-100 h-14 w-14 ml-3 mr-3 rounded-[10px] shadow-lg shadow-black"
            >
              <TextInput
                ref={(input) => (inputs[index] = input!)} // Save the reference to the input box
                className="flex-1 text-center text-lg"
                keyboardType="numeric"
                maxLength={1} // Allow only one digit
                value={digit}
                onChangeText={(text) => handleInputChange(text, index)} // Update input change logic
                onFocus={() =>
                  inputs[index].setNativeProps({
                    selection: { start: 0, end: 1 },
                  })
                } // Set cursor position on focus
              />
            </View>
          ))}
        </View>

        <View className="mt-10">
          <Text className="mt-3 text-lg text-black text-center">
          {t("OtpVerification.didntreceived")}
          </Text>
        </View>

        <View className="mt-1 mb-9">
          <Text
            className="mt-3 text-lg text-black text-center underline"
            onPress={handleResendOTP}
          >
            {t("OtpVerification.Count")} {formatTime(timer)}
          </Text>
        </View>

        <View className="mt-10">
          <TouchableOpacity
            style={{ height: hp(7), width: wp(80) }}
            className="bg-gray-900 flex items-center justify-center mx-auto rounded-full"
            onPress={handleVerify} // Replace 'NextScreen' with your actual next screen
          >
            <Text
              style={{ fontSize: 20 }}
              className="text-white font-bold tracking-wide"
            >
              {t("OtpVerification.Verify")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Otpverification;
