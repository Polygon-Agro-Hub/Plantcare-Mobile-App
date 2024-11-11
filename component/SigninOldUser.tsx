import {
  View,
  Text,
  Image,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import AntDesign from "react-native-vector-icons/AntDesign";
import PhoneInput from "react-native-phone-number-input";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next"; // Import useTranslation hook
import axios from "axios";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

type SigninNavigationProp = StackNavigationProp<RootStackParamList, "Signin">;

interface SigninProps {
  navigation: SigninNavigationProp;
}

const sign = require("../assets/images/signin.png");

const SigninOldUser: React.FC<SigninProps> = ({ navigation }) => {
  const [phonenumber, setPhonenumber] = useState(""); // Phone number state
  const [formattedPhonenumber, setFormattedPhonenumber] = useState(""); // Store formatted phone number (with country code)
  const [error, setError] = useState(""); // Validation error state
  const [isButtonDisabled, setIsButtonDisabled] = useState(true); // Button disabled state
  const { t } = useTranslation();
  const screenWidth = wp(100); 

  // Validate mobile number input (local part of the phone number)
  const validateMobileNumber = (number: string) => {
    const localNumber = number.replace(/[^0-9]/g, ""); // Extract only digits from formatted phone number
    const regex = /^[1-9][0-9]{8}$/; // Regex for valid 9-digit phone number without leading zero
    if (!regex.test(localNumber)) {
      setError(t("SignupForum.Enteravalidmobile"));
      setIsButtonDisabled(true); // Disable button if invalid phone number
    } else {
      setError(""); // Clear error if valid phone number
      setIsButtonDisabled(false); // Enable button if phone number is valid
    }
  };

  const handlePhoneNumberChange = (text: string) => {
    setPhonenumber(text);
    validateMobileNumber(text); // Validate the local part of the phone number
  };

  const handleFormattedPhoneNumberChange = (formattedText: string) => {
    setFormattedPhonenumber(formattedText); // Store formatted phone number
  };

  const handleLogin = async () => {
    if (!phonenumber) {
      Alert.alert(
        t("signinForm.validationError"),
        t("signinForm.phoneNumberRequired")
      );
      return;
    }

    try {
      const response = await fetch(
        `${environment.API_BASE_URL}api/auth/user-login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phonenumber: formattedPhonenumber }), // Send formatted phone number with country code
        }
      );

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json(); // Parse JSON response

        if (data.status === "success") {
          // await AsyncStorage.setItem('userToken', data.token); // Store token
          // console.log('token', data.token);
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

            console.log("====================================");
            console.log("this is the body from oldsignin..", body);
            console.log("this is the apiUrl..", apiUrl);
            console.log("====================================");

            const response = await axios.post(apiUrl, body, { headers });

            console.log(
              "hi.......this is response from shoutout.............:\n\n",
              response.data
            );
            console.log(
              "hi.......this is referenceId from shoutout.............:\n\n",
              response.data.referenceId
            );
            //Alert.alert("Success", "OTP sent successfully!");

            await AsyncStorage.setItem(
              "referenceId",
              response.data.referenceId
            );

            // Navigate to the OTPE screen with the mobile number
            navigation.navigate("OTPEOLDUSER", {
              mobileNumber: formattedPhonenumber,
            });
          } catch (error) {
            console.error("Error sending OTP:", error);
            Alert.alert(t("signinForm.error"), t("SignupForum.otpSendFailed"));
          }

          //navigation.navigate('Dashboard');
        } else {
          Alert.alert(
            t("signinForm.loginFailed"),
            t("signinForm.notRegistered")
          );
        }
      } else {
        Alert.alert(t("signinForm.error"), t("signinForm.expectedJson"));
      }
    } catch (error) {
      Alert.alert(
        t("signinForm.loginFailed"),
        t("signinForm.somethingWentWrong")
      );
      console.error("Login error:", error); // Log the error for debugging
    }
  };

  //Define dynamic styles based on screen size
  const dynamicStyles = {
    
    imageWidth: screenWidth < 400 ? wp(20) : wp(60), // Adjust button width
    imageHeight: screenWidth < 400 ? wp(20) : wp(60), // Adjust button height
    margingTopForImage: screenWidth < 400 ? wp(1) : wp(16),
    margingTopForBtn: screenWidth < 400 ? wp(0) : wp(10),
    };

  return (
    <>
      <View className="flex-1 bg-white">
        <View className="pt-3 pb-0">
          <AntDesign
            name="left"
            size={24}
            color="#000502"
            onPress={() => navigation.navigate("Lanuage")}
          />
          <View className="items-center">
            <Image source={sign} className="mb-2 mt-1" style={{ height: dynamicStyles.imageHeight, width:dynamicStyles.imageWidth }} />
          </View>
        </View>
        <View className="items-center">
          <Text className="pt-10 text-3xl font-semibold">
            {t("signinForm.welcome")}
          </Text>
          <Text className="pt-[35px] text-base">
            {t("signinForm.enteryourphno")}
          </Text>
          <Text className="pt-0 text-base">{t("signinForm.LoginID")}</Text>
        </View>

        <View className="flex-1 items-center pt-5">
          {
            <PhoneInput
              defaultValue={phonenumber}
              defaultCode="LK" // Set the default country code for Sri Lanka
              layout="first"
              withShadow
              autoFocus
              textContainerStyle={{ paddingVertical: 0 }}
              onChangeText={handlePhoneNumberChange} // Handle local phone number validation
              onChangeFormattedText={handleFormattedPhoneNumberChange} // Handle full formatted phone number
            />
          }
          {error ? (
            <Text className="text-red-500 mt-2">{error}</Text> // Show validation error message
          ) : null}
          <View className="flex-1 items-center pt-10">
            <TouchableOpacity
              className={`p-4 rounded-3xl mb-6 h-13 w-60 ${
                isButtonDisabled ? "bg-gray-400" : "bg-gray-900"
              }`} // Button styling changes based on disabled state
              onPress={handleLogin}
              disabled={isButtonDisabled} // Disable button until phone number is valid
            >
              <Text className="text-white text-lg text-center">
                {t("signinForm.signin")}
              </Text>
            </TouchableOpacity>
          </View>
          <View className="flex-1 items-center flex-row">
            <Text className="items-center pl-1 pb-20">
              {t("signinForm.donthaveanaccount")}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("SignupForum")}
            >
              <Text className="text-blue-600 underline pb-20">
                {" "}
                {t("signinForm.signuphere")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
};

export default SigninOldUser;
