import axios from "axios";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";

export const sendOTP = async (
  formattedPhonenumber: string,
  navigation: any,
) => {
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
      destination: formattedPhonenumber,
    };

    const response = await axios.post(apiUrl, body, { headers });

    await AsyncStorage.setItem("referenceId", response.data.referenceId);

    navigation.navigate("OTPEOLDUSER", {
      mobileNumber: formattedPhonenumber,
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    Alert.alert("Error", "Failed to send OTP. Please try again.");
  }
};
