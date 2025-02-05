import {
  View,
  Text,
  Image,
  ScrollView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator
} from "react-native";
import React, { useState } from "react";
import AntDesign from "react-native-vector-icons/AntDesign";
import PhoneInput from "react-native-phone-number-input";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import axios from "axios";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { set } from "lodash";

type SigninNavigationProp = StackNavigationProp<RootStackParamList, "Signin">;

interface SigninProps {
  navigation: SigninNavigationProp;
}

const sign = require("../assets/images/sign/loginpc.webp");

const SigninOldUser: React.FC<SigninProps> = ({ navigation }) => {
  const [phonenumber, setPhonenumber] = useState(""); // Phone number state
  const [formattedPhonenumber, setFormattedPhonenumber] = useState(""); // Store formatted phone number (with country code)
  const [error, setError] = useState(""); // Validation error state
  const [isButtonDisabled, setIsButtonDisabled] = useState(true); // Button disabled state
  const [isLoading, setIsLoading] = useState(false);
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
      if (localNumber.length === 9) {
        Keyboard.dismiss(); // Dismiss the keyboard when exactly 9 digits are entered
      }
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
      Alert.alert(t("signinForm.sorry"), t("signinForm.phoneNumberRequired"));
      return;
    }
    await AsyncStorage.multiRemove([
      "userToken",
      "tokenStoredTime",
      "tokenExpirationTime",
    ]);
    setIsLoading(true);
    setIsButtonDisabled(true);
    try {
      const response = await fetch(
        `${environment.API_BASE_URL}api/auth/user-login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phonenumber: formattedPhonenumber }),
        }
      );

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();

        if (data.status === "success") {
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

            await AsyncStorage.setItem(
              "referenceId",
              response.data.referenceId
            );

            // Navigate to the OTPE screen with the mobile number
            navigation.navigate("OTPEOLDUSER", {
              mobileNumber: formattedPhonenumber,
            });
            setIsButtonDisabled(false);
            setIsLoading(false);
          } catch (error) {
            Alert.alert(t("Main.error"), t("SignupForum.otpSendFailed"));
          }
        } else {
          setIsLoading(false);
          setIsButtonDisabled(false);
          Alert.alert(
            t("signinForm.loginFailed"),
            t("signinForm.notRegistered")
          );
        }
      } else {
        setIsLoading(false);
        setIsButtonDisabled(false);
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
      }
    } catch (error) {
      setIsButtonDisabled(false);
      setIsLoading(false);
      Alert.alert(t("signinForm.loginFailed"), t("Main.somethingWentWrong"));
      console.error("Login error:", error); // Log the error for debugging
    }
  };

  // Define dynamic styles based on screen size
  const dynamicStyles = {
    imageWidth: screenWidth < 400 ? wp(70) : wp(60), // Adjust image width
    imageHeight: screenWidth < 400 ? wp(70) : wp(60), // Adjust image height
    margingTopForImage: screenWidth < 400 ? wp(1) : wp(16),
    margingTopForBtn: screenWidth < 400 ? wp(0) : wp(10),
    inputFieldsPaddingX: screenWidth < 400 ? wp(5) : wp(8), // Padding for input fields
  };
  const handleInputSubmit = () => {
    // Automatically close the keyboard after completing input
    Keyboard.dismiss();
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      enabled
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 bg-white">
          <View className="pb-0">
            <AntDesign
              name="left"
              size={24}
              color="#000502"
              onPress={() => navigation.navigate("SignupForum")}
              style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
            />
            <View className="items-center">
              <Image
                source={sign}
                style={{
                  height: dynamicStyles.imageHeight,
                  width: dynamicStyles.imageWidth,
                }}
              />
            </View>
          </View>

          <View className="items-center">
            <Text className="pt-8 text-3xl font-semibold">
              {t("signinForm.welcome")}
            </Text>
            <Text className="pt-6 text-center text-base w-[95%]">
              {t("signinForm.enteryourphno")}
            </Text>
            {/* <Text className="pt-0 text-sm">{t("signinForm.LoginID")}</Text> */}
          </View>

          <View className="flex-1 items-center pt-6 px-8 ">
            <View className="flex-row gap-x-0 items-center border border-gray-300 rounded-3xl">
              <View className="flex-row items-center flex-1 gap-x-1 ">
                <View className="py-2 ">
                  <PhoneInput
                    defaultValue={phonenumber}
                    defaultCode="LK" // Set the default country code for Sri Lanka
                    layout="first"
                    autoFocus
                    placeholder={t("SignupForum.PhoneNumber")}
                    textContainerStyle={{ paddingVertical: 1 }}
                    onChangeText={handlePhoneNumberChange} // Handle local phone number validation
                    onChangeFormattedText={handleFormattedPhoneNumberChange} // Handle full formatted phone number
                  />
                </View>
              </View>
            </View>
            {error ? (
              <Text
                className="text-red-500  "
                style={{ fontSize: wp(3), marginTop: wp(2) }}
              >
                {error}
              </Text> // Show validation error message
            ) : null}

            {/* <TouchableOpacity
              className={`p-4 rounded-3xl  mt-10 h-13 w-60 ${
                isButtonDisabled ? "bg-gray-400" : "bg-gray-900"
              }`} // Button styling changes based on disabled state
              onPress={handleLogin}
              disabled={isButtonDisabled} // Disable button until phone number is valid
            >
              <Text className="text-white text-lg text-center">
                {t("signinForm.signin")}
              </Text>
            </TouchableOpacity> */}
            <TouchableOpacity
              className={`p-4 rounded-3xl mt-10 h-13 w-60 ${
                isButtonDisabled ? "bg-gray-400" : "bg-gray-900"
              }`}
              onPress={handleLogin}
              disabled={isButtonDisabled}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" /> 
              ) : (
                <Text className="text-white text-lg text-center">
                  {t("signinForm.signin")}
                </Text>
              )}
            </TouchableOpacity>

            <View className="flex-1 items-center flex-row  ">
              <Text className="items-center  ">
                {t("signinForm.donthaveanaccount")}
              </Text>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    await AsyncStorage.removeItem("@user_language");
                    navigation.navigate("SignupForum");
                  } catch (error) {
                    console.error(
                      "Error clearing language from AsyncStorage:",
                      error
                    );
                  }
                }}
              >
                <Text className="text-blue-600 underline pl-1 ">
                  {t("signinForm.signuphere")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SigninOldUser;
