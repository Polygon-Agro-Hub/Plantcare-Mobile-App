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
  BackHandler,
  Dimensions,
  StatusBar,
  TextInput
} from "react-native";
import React, { useState } from "react";
import AntDesign from "react-native-vector-icons/AntDesign";
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
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import DropDownPicker from "react-native-dropdown-picker";
import countryData from '../assets/jsons/countryflag.json';

type SigninNavigationProp = StackNavigationProp<RootStackParamList, "Signin">;

interface SigninProps {
  navigation: SigninNavigationProp;
}

interface CountryItem {
  label: string;
  value: string;
  countryName: string;
  flag: string;
  dialCode: string;
}

const sign = require("../assets/images/sign/loginpc.webp");
const correct = require("../assets/images/sign/correct.webp")

const SigninOldUser: React.FC<SigninProps> = ({ navigation }) => {
  const [phonenumber, setPhonenumber] = useState(""); // Phone number state (without country code)
  const [selectedCountryCode, setSelectedCountryCode] = useState("+94"); // Default to Sri Lanka
  const [error, setError] = useState(""); // Validation error state
  const [isButtonDisabled, setIsButtonDisabled] = useState(true); // Button disabled state
  const [isLoading, setIsLoading] = useState(false);
  const { t, i18n } = useTranslation();
  const screenWidth = Dimensions.get("window").width; 
  const [isValid, setIsValid] = useState(false);
  
  // Country code picker states
  const [countryCodeOpen, setCountryCodeOpen] = useState(false);
  const [countryCodeItems, setCountryCodeItems] = useState<CountryItem[]>(
    countryData.map((country) => ({
      label: country.emoji,
      value: country.dial_code,
      countryName: country.name,
      flag: country.emoji,
      dialCode: country.dial_code,
    }))
  );

  const fullFormatItems = countryData.map((country) => ({
    label: `${country.emoji} ${country.name} (${country.dial_code})`,
    value: country.dial_code,
    countryName: country.name,
    flag: country.emoji,
    dialCode: country.dial_code,
  }));

  // Validate mobile number input (local part of the phone number)
  const validateMobileNumber = (number: string) => {
    const localNumber = number.replace(/[^0-9]/g, ""); // Extract only digits
    const regex = /^[1-9][0-9]{8}$/; // Regex for valid 9-digit phone number without leading zero
    
    if (!regex.test(localNumber)) {
      setError(t("SignupForum.Enteravalidmobile"));
      setIsButtonDisabled(true);
      setIsValid(false);
    } else {
      setError("");
      setIsButtonDisabled(false);
      setIsValid(true); 
      if (localNumber.length === 9) {
        Keyboard.dismiss();
      }
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("SignupForum");
        return true;
      };

      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }, [navigation])
  );

  const handlePhoneNumberChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 10) {
      setPhonenumber(cleaned);
      validateMobileNumber(cleaned);
    }
  };

  const handleLogin = async () => {
    if (!phonenumber) {
      Alert.alert(t("signinForm.sorry"), t("signinForm.phoneNumberRequired"), [{
        text: t("PublicForum.OK"),
        onPress: () => {
          navigation.navigate("Signin");
        }
      }]);
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
      const fullPhoneNumber = selectedCountryCode + phonenumber;

      const response = await fetch(
        `${environment.API_BASE_URL}api/auth/user-login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phonenumber: fullPhoneNumber }),
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
              otpMessage = `Your GoviCare OTP is {{code}}`;
            }else if(i18n.language === "si"){
              otpMessage = `ඔබේ GoviCare OTP මුරපදය {{code}} වේ.`;
            }else if(i18n.language === "ta"){
              otpMessage = `உங்கள் GoviCare OTP {{code}} ஆகும்.`;
            }
            
            const body = {
              source: "PolygonAgro",
              transport: "sms",
              content: {
                sms: otpMessage,
              },
              destination: fullPhoneNumber,
            };

            const otpResponse = await axios.post(apiUrl, body, { headers });

            await AsyncStorage.setItem(
              "referenceId",
              otpResponse.data.referenceId
            );

            navigation.navigate("OTPEOLDUSER", {
              mobileNumber: fullPhoneNumber,
            });
            setIsButtonDisabled(false);
            setIsLoading(false);
          } catch (error) {
            Alert.alert(t("Main.error"), t("SignupForum.otpSendFailed"), [{
              text: t("PublicForum.OK"),
              onPress: () => {
                navigation.navigate("Signin");
              }
            }]);
          }
        } else {
          setIsLoading(false);
          setIsButtonDisabled(false);
          console.log("Login failed:", data.message);
          if(data.message === "User is blocked"){
            Alert.alert(t("Main.error"), t("Main.userBlocked"), [{
              text: t("PublicForum.OK"),
              onPress: () => {
                navigation.navigate("Signin");
              }
            }]);
            return;
          }
          Alert.alert(
            t("signinForm.loginFailed"),
            t("signinForm.notRegistered"),
            [{
              text: t("PublicForum.OK"),
              onPress: () => {
                navigation.navigate("Signin");
              }
            }]
          );
        }
      } else {
        setIsLoading(false);
        setIsButtonDisabled(false);
        Alert.alert(t("Main.Sorry"), t("Main.somethingWentWrong"), [{
          text: t("PublicForum.OK"),
          onPress: () => {
            navigation.navigate("Signin");
          }
        }]);
      }
    } catch (error) {
      setIsButtonDisabled(false);
      setIsLoading(false);
      Alert.alert(t("signinForm.loginFailed"), t("Main.somethingWentWrong"), [{
        text: t("PublicForum.OK"),
        onPress: () => {
          navigation.navigate("Signin");
        }
      }]);
      console.error("Login error:", error);
    }
  };

  const dynamicStyles = {
    imageWidth: screenWidth < 400 ? wp(70) : wp(60),
    imageHeight: screenWidth < 400 ? wp(70) : wp(60),
    margingTopForImage: screenWidth < 400 ? wp(1) : wp(16),
    margingTopForBtn: screenWidth < 380 ? 10 : 20,
    inputFieldsPaddingX: screenWidth < 400 ? wp(5) : wp(8),
  };

  const getFontSizeByLanguage = () => {
    if (i18n.language === 'si' || i18n.language === 'ta') {
      return wp(3);
    }
    return wp(4);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      enabled
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <StatusBar barStyle="dark-content" animated={true} backgroundColor="#fff" />
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
            <Text className="pt-4 text-3xl font-semibold"
              style={[
                i18n.language === "si"
                  ? { fontSize: 18 }
                  : i18n.language === "ta"
                  ? { fontSize: 18 }
                  : { fontSize: 25 }
              ]}
            >
              {t("signinForm.welcome")}
            </Text>
            <Text className="pt-4 text-center text-base w-[95%]"
              style={[
                i18n.language === "si"
                  ? { fontSize: 12 }
                  : i18n.language === "ta"
                  ? { fontSize: 14 }
                  : { fontSize: 16 }
              ]}
            >
              {t("signinForm.enteryourphno")}
            </Text>
          </View>

          <View className="flex-1 items-center pt-8 px-8">
            <View className="w-full">
              


<View className="w-full">
  {/* Combined Container with unified border */}
  <View 
    className="flex-row items-center border border-gray-300 rounded-full overflow-hidden"
    style={{ height: hp(8) }}
  >
    {/* Country Code Picker - No separate border */}
    <View style={{ width: wp(25), zIndex: 2000 }}>
      <DropDownPicker
        open={countryCodeOpen}
        value={selectedCountryCode}
        items={countryCodeItems}
        setOpen={setCountryCodeOpen}
        setValue={setSelectedCountryCode}
        setItems={setCountryCodeItems}
        onOpen={() => {
          setCountryCodeItems(fullFormatItems);
        }}
        onClose={() => {
          setCountryCodeItems(
            countryData.map((country) => ({
              label: country.emoji,
              value: country.dial_code,
              countryName: country.name,
              flag: country.emoji,
              dialCode: country.dial_code,
            }))
          );
        }}
        searchable={true}
        searchPlaceholder="Search country..."
        listMode="MODAL"
        modalProps={{
          animationType: "slide",
          transparent: false,
          presentationStyle: "fullScreen",
          statusBarTranslucent: false,
        }}
        modalContentContainerStyle={{
          paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
          backgroundColor: '#fff',
        }}
        style={{
          borderWidth: 0, // Remove border
          backgroundColor: "transparent", // Make background transparent
          borderRadius: 0,
          height: hp(7),
          minHeight: hp(7),
          paddingLeft: 8,
        }}
        textStyle={{ 
          fontSize: 16,
        }}
        labelStyle={{
          fontSize: 22,
        }}
        listItemLabelStyle={{
          fontSize: 14,
        }}
        dropDownContainerStyle={{
          borderColor: "#ccc",
          borderWidth: 1,
        }}
        placeholder="🇱🇰"
        showTickIcon={false}
      />
    </View>

    {/* Vertical Divider */}
    <View 
      style={{ 
        width: 1, 
        height: hp(4), 
        backgroundColor: 'white',
        marginHorizontal: 4 
      }} 
    />

    {/* Phone Number Input - No separate border */}
    <TextInput
      className="flex-1 px-4"
      placeholder={t("SignupForum.PhoneNumber")}
      value={phonenumber}
      onChangeText={handlePhoneNumberChange}
      keyboardType="phone-pad"
      maxLength={10}
      autoFocus
      style={{
        height: hp(7),
        fontSize: getFontSizeByLanguage(),
        borderWidth: 0,
      }}
      underlineColorAndroid="transparent"
      cursorColor="#141415ff"
    />
    
    {/* Check mark when valid */}
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
                end={{ x: 1, y: 0 }} 
                className={`rounded-3xl mt-${dynamicStyles.margingTopForBtn} h-13 p-3 px-[35%] justify-center items-center`}
              >
                {isLoading ? (
                  <View className="flex-row items-center justify-center p-1 px-[20%]">
                    <ActivityIndicator size="small" color="#fff" /> 
                  </View>
                ) : (
                  <Text className="text-white font-semibold text-center"
                    style={[
                      i18n.language === "si"
                        ? { fontSize: 13 }
                        : i18n.language === "ta"
                        ? { fontSize: 12 }
                        : { fontSize: 20 }
                    ]}
                  >
                    {t("signinForm.signin")}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View className="flex-1 mt-4 mb-4 items-center flex-row">
              <Text className="items-center"
                style={[
                  i18n.language === "si"
                    ? { fontSize: 13 }
                    : i18n.language === "ta"
                    ? { fontSize: 10 }
                    : { fontSize: 14 }
                ]}
              >
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
                <Text className="text-blue-600 underline pl-1"
                  style={[
                    i18n.language === "si"
                      ? { fontSize: 13 }
                      : i18n.language === "ta"
                      ? { fontSize: 10 }
                      : { fontSize: 14}
                  ]}
                >
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