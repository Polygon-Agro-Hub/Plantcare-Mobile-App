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
import { useTranslation } from "react-i18next";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

type SigninNavigationProp = StackNavigationProp<RootStackParamList, "Signin">;

interface SigninProps {
  navigation: SigninNavigationProp;
}

const sign = require("../assets/images/signin.png");

const Signin: React.FC<SigninProps> = ({ navigation }) => {
  const [phonenumber, setPhonenumber] = useState("");
  const [formattedPhonenumber, setFormattedPhonenumber] = useState("");
  const [error, setError] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const { t } = useTranslation();
  const screenWidth = wp(100);

  const validateMobileNumber = (number: string) => {
    const localNumber = number.replace(/[^0-9]/g, "");
    const regex = /^[1-9][0-9]{8}$/;
    if (!regex.test(localNumber)) {
      setError(t("SignupForum.Enteravalidmobile"));
      setIsButtonDisabled(true);
    } else {
      setError("");
      setIsButtonDisabled(false);
    }
  };

  const handlePhoneNumberChange = (text: string) => {
    setPhonenumber(text);
    validateMobileNumber(text);
  };

  const handleFormattedPhoneNumberChange = (formattedText: string) => {
    setFormattedPhonenumber(formattedText);
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
          body: JSON.stringify({ phonenumber: formattedPhonenumber }),
        }
      );

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();

        if (data.token) {
          await AsyncStorage.setItem("userToken", data.token);
          console.log("token", data.token);

          navigation.navigate("Dashboard");
        } else {
          Alert.alert(
            t("signinForm.loginFailed"),
            // t("signinForm.noTokenReceived")
            t("Main.somethingWentWrong")
          );
        }
      } else {
        // Alert.alert(t("signinForm.error"), t("signinForm.expectedJson"));
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
      }
    } catch (error) {
      Alert.alert(
        t("signinForm.loginFailed"),
        t("Main.somethingWentWrong")
      );
      console.error("Login error:", error);
    }
  };

  const dynamicStyles = {
    imageWidth: screenWidth < 400 ? wp(20) : wp(60),
    imageHeight: screenWidth < 400 ? wp(20) : wp(60),
    margingTopForImage: screenWidth < 400 ? wp(1) : wp(16),
    margingTopForBtn: screenWidth < 400 ? wp(0) : wp(10),
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1 bg-white">
        <View className="pt-3 pb-0">
          <AntDesign
            name="left"
            size={24}
            color="#000502"
            onPress={() => navigation.navigate("Lanuage")}
          />
          <View className="items-center">
            <Image
              source={sign}
              className="mb-2 mt-1"
              style={{
                height: dynamicStyles.imageHeight,
                width: dynamicStyles.imageWidth,
              }}
            />
          </View>
        </View>
        <View className="items-center">
          <Text className="pt-10 text-3xl font-semibold">
            {t("signinForm.welcome")}
          </Text>
          <Text className="pt-[35px] text-base">
            {t("signinForm.enteryourphno")}
          </Text>
          <Text className="pt--1 text-base">{t("signinForm.LoginID")}</Text>
        </View>

        <View className="flex-1 items-center pt-5">
          {
            <PhoneInput
              defaultValue={phonenumber}
              defaultCode="LK"
              layout="first"
              withShadow
              autoFocus
              textContainerStyle={{ paddingVertical: 0 }}
              onChangeText={handlePhoneNumberChange}
              onChangeFormattedText={handleFormattedPhoneNumberChange}
            />
          }
          {error ? <Text className="text-red-500 mt-2">{error}</Text> : null}
          <View className="flex-1 items-center pt-10">
            <TouchableOpacity
              className={`p-4 rounded-3xl mb-6 h-13 w-60 ${
                isButtonDisabled ? "bg-gray-400" : "bg-gray-900"
              }`}
              onPress={handleLogin}
              disabled={isButtonDisabled}
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
    </ScrollView>
  );
};

export default Signin;
