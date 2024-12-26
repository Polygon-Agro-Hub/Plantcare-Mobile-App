// OTPService.tsx
import axios from "axios";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";

export const sendOTP = async (
  formattedPhonenumber: string,
  navigation: any
) => {
  try {
    const apiUrl = "https://api.getshoutout.com/otpservice/send";

    const headers = {
      Authorization:
        `Apikey ${environment.SHOUTOUT_API_KEY}`,
      "Content-Type": "application/json",
    };

    const body = {
      source: "ShoutDEMO",
      transport: "sms",
      content: {
        sms: "Your code is {{code}}",
      },
      destination: formattedPhonenumber,
    };

    console.log("this is the body from OTPService..", body);
    console.log("this is the apiUrl..", apiUrl);

    const response = await axios.post(apiUrl, body, { headers });

    console.log(
      "this is response from shoutout.............:\n\n",
      response.data
    );
    console.log(
      "this is referenceId from shoutout.............:\n\n",
      response.data.referenceId
    );

    // Store referenceId in AsyncStorage
    await AsyncStorage.setItem("referenceId", response.data.referenceId);

    // Navigate to the OTPE screen with the mobile number
    navigation.navigate("OTPEOLDUSER", {
      mobileNumber: formattedPhonenumber,
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    Alert.alert("Error", "Failed to send OTP. Please try again.");
  }
};