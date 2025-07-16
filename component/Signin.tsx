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
  ActivityIndicator,
  BackHandler
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
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

type SigninNavigationProp = StackNavigationProp<RootStackParamList, "Signin">;

interface SigninProps {
  navigation: SigninNavigationProp;
}

const sign = require("../assets/images/sign/loginpc.webp");
const correct = require("../assets/images/sign/correct.webp")

const SigninOldUser: React.FC<SigninProps> = ({ navigation }) => {
  const [phonenumber, setPhonenumber] = useState(""); // Phone number state
  const [formattedPhonenumber, setFormattedPhonenumber] = useState(""); // Store formatted phone number (with country code)
  const [error, setError] = useState(""); // Validation error state
  const [isButtonDisabled, setIsButtonDisabled] = useState(true); // Button disabled state
  const [isLoading, setIsLoading] = useState(false);
  const { t, i18n } = useTranslation();
  const screenWidth = wp(100);
  const [isValid, setIsValid] = useState(false);

  // Validate mobile number input (local part of the phone number)
  const validateMobileNumber = (number: string) => {
    const localNumber = number.replace(/[^0-9]/g, ""); // Extract only digits from formatted phone number
    const regex = /^[1-9][0-9]{8}$/; // Regex for valid 9-digit phone number without leading zero
    
    if (!regex.test(localNumber)) {
      setError(t("SignupForum.Enteravalidmobile"));
      setIsButtonDisabled(true); // Disable button if invalid phone number
      setIsValid(false); // Set isValid to false when number is invalid
    } else {
      setError(""); // Clear error if valid phone number
      setIsButtonDisabled(false); // Enable button if phone number is valid
      setIsValid(true); 
      if (localNumber.length === 9) {
        Keyboard.dismiss(); // Dismiss the keyboard when exactly 9 digits are entered
      }
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("SignupForum"); // Navigate to Signup screen on back press
        return true; // Prevent default back action
      };
  
      BackHandler.addEventListener("hardwareBackPress", onBackPress);
  
      return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [navigation])
  );
  

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
    await AsyncStorage.removeItem("referenceId");
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
        Alert.alert(t("Main.Sorry"), t("Main.somethingWentWrong"));
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
              onPress={() => navigation.navigate("Lanuage")}
              style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
            />
            <View className="items-center px-8">
              <Image
                source={sign}
                resizeMode="contain"
                style={{
                  height: dynamicStyles.imageHeight,
                  width: "98%",
                }}
              />
            </View>
          </View>

          <View className="items-center">
            <Text className="pt-4 text-3xl font-semibold">
              {t("signinForm.welcome")}
            </Text>
            <Text className="pt-4 text-center text-base w-[95%]">
              {t("signinForm.enteryourphno")}
            </Text>
          </View>

          <View className="flex-1 items-center pt-8 px-8">
            <View className="flex-row items-center border border-gray-300 rounded-3xl">
              <View className="flex-row items-center flex-1 gap-x-1">
                <View className="py-2 flex-1 px-1">
                  <PhoneInput
                    defaultValue={phonenumber}
                    defaultCode="LK"
                   
                    layout="first"
                    autoFocus
                    containerStyle={{
                      borderRadius: 50,
                      borderWidth: 0,
                      backgroundColor: "#ffffff",
                    }}
                    placeholder={t("SignupForum.PhoneNumber")}
                    textContainerStyle={{ paddingVertical: 1 }}
                     
                    onChangeText={handlePhoneNumberChange}
                    onChangeFormattedText={handleFormattedPhoneNumberChange}
                  />
                </View>
                
                {/* Only show check mark when phone is valid and has exactly 9 digits */}
                {isValid && phonenumber.replace(/[^0-9]/g, "").length === 9 && (
                  <View className="pr-4">
                    <Image
                      source={correct}
                      style={{ 
                        width: wp(5),
                        height: wp(5)
                      }}
                    />
                  </View>
                )}
              </View>
            </View>
            {error ? (
              <Text
                className="text-red-500"
                style={{ fontSize: wp(3), marginTop: wp(2) }}
              >
                {error}
              </Text>
            ) : null}

            <TouchableOpacity
              
              onPress={handleLogin}
              disabled={isButtonDisabled}
            >
                  <LinearGradient
  colors={isButtonDisabled ? ["#9CA3AF", "#9CA3AF"] : ["#0FC7B2", "#10A37D"]}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 0 }} // left to right
  className="rounded-3xl mt-8 h-13 p-3 w-64 justify-center items-center"
>
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" /> 
              ) : (


                <Text className="text-white text-xl font-semibold text-center">
                  {t("signinForm.signin")}
                </Text>
               
              )}
               </LinearGradient>
            </TouchableOpacity>

            <View className="flex-1 mt-4 mb-4 items-center flex-row">
              <Text className="items-center">
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
      
                <Text className="text-blue-600 underline pl-1">
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