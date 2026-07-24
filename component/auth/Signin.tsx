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
  TextInput,
} from "react-native";
import React, { useState } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/types";
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

import countryData from "@/assets/jsons/common/country-flag.json";
import GlobalSearchModal from "../../component/common/GlobalSearchModal";
import { MaterialIcons } from "@expo/vector-icons";
import CustomHeader from "../common/CustomHeader";

type SigninNavigationProp = StackNavigationProp<RootStackParamList, "Signin">;

interface SigninProps {
  navigation: SigninNavigationProp;
}

const sign = require("../../assets/images/auth/loginpc.webp");

const countryItems = countryData.map((country) => ({
  label: `${country.emoji}  ${country.name}  (${country.dial_code})`,
  value: country.dial_code,
  countryName: country.name,
  flag: country.emoji,
  dialCode: country.dial_code,
}));

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const Signin: React.FC<SigninProps> = ({ navigation }) => {
  const [phonenumber, setPhonenumber] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("+94");
  const [selectedCountryFlag, setSelectedCountryFlag] = useState("🇱🇰");
  const [error, setError] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const { t, i18n } = useTranslation();
  const screenWidth = Dimensions.get("window").width;
  const [isValid, setIsValid] = useState(false);

  const validateMobileNumber = (number: string) => {
    const localNumber = number.replace(/[^0-9]/g, "");
    const regex = /^[1-9][0-9]{8}$/;

    if (!regex.test(localNumber)) {
      setError(
        t("SignUp.PleaseEnterAValid9DigitMobileNumberExcludeTheLeadingZero"),
      );
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
        navigation.navigate("Signup");
        return true;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      return () => subscription.remove();
    }, [navigation]),
  );

  const handlePhoneNumberChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    if (cleaned.length <= 10) {
      setPhonenumber(cleaned);
      validateMobileNumber(cleaned);
    }
  };

  const handleCountrySelect = (items: string[]) => {
    if (items.length === 0) return;
    const dialCode = items[0];
    const country = countryData.find((c) => c.dial_code === dialCode);
    setSelectedCountryCode(dialCode);
    setSelectedCountryFlag(country?.emoji ?? "🏳️");
  };

  const handleLogin = async () => {
    if (!phonenumber) {
      Alert.alert(t("Main.Sorry"), t("SignIn.PhoneNumberIsRequired"), [
        {
          text: t("Main.OK"),
          onPress: () => navigation.navigate("Signin"),
        },
      ]);
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phonenumber: fullPhoneNumber }),
        },
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
            if (i18n.language === "en") {
              otpMessage = `Your GoviCare OTP is {{code}}`;
            } else if (i18n.language === "si") {
              otpMessage = `ඔබේ GoviCare OTP මුරපදය {{code}} වේ.`;
            } else if (i18n.language === "ta") {
              otpMessage = `உங்கள் GoviCare OTP {{code}} ஆகும்.`;
            }

            const body = {
              source: "PolygonAgro",
              transport: "sms",
              content: { sms: otpMessage },
              destination: fullPhoneNumber,
            };

            const otpResponse = await axios.post(apiUrl, body, { headers });
            await AsyncStorage.setItem(
              "referenceId",
              otpResponse.data.referenceId,
            );

            navigation.navigate("OTPEOLDUSER", {
              mobileNumber: fullPhoneNumber,
            });
            setIsButtonDisabled(false);
            setIsLoading(false);
          } catch (error) {
            Alert.alert(
              t("Main.Error"),
              t("SignUp.FailedToSendOTPPleaseCheckYourNumberAndTryAgain"),
              [
                {
                  text: t("Main.OK"),
                  onPress: () => navigation.navigate("Signin"),
                },
              ],
            );
          }
        } else {
          setIsLoading(false);
          setIsButtonDisabled(false);
          if (data.message === "User is blocked") {
            Alert.alert(
              t("Main.Error"),
              t("Main.TooManyRequestsFromThisDevicePleaseTryAgainIn30Minutes"),
              [
                {
                  text: t("Main.OK"),
                  onPress: () => navigation.navigate("Signin"),
                },
              ],
            );
            return;
          }
          Alert.alert(
            t("SignIn.LoginFailed"),
            t("SignIn.ThisUserIsNotRegisteredPleaseSignUpFirst"),
            [
              {
                text: t("Main.OK"),
                onPress: () => navigation.navigate("Signin"),
              },
            ],
          );
        }
      } else {
        setIsLoading(false);
        setIsButtonDisabled(false);
        Alert.alert(
          t("Main.Sorry"),
          t("Main.SomethingWentWrongPleaseTryAgainlater"),
          [
            {
              text: t("Main.OK"),
              onPress: () => navigation.navigate("Signin"),
            },
          ],
        );
      }
    } catch (error) {
      setIsButtonDisabled(false);
      setIsLoading(false);
      Alert.alert(
        t("SignIn.LoginFailed"),
        t("Main.SomethingWentWrongPleaseTryAgainlater"),
        [
          {
            text: t("Main.OK"),
            onPress: () => navigation.navigate("Signin"),
          },
        ],
      );
      console.error("Login error:", error);
    }
  };

  const dynamicStyles = {
    imageHeight: screenWidth < 400 ? wp(70) : wp(60),
    margingTopForBtn: screenWidth < 380 ? 10 : 20,
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "white" }}
      enabled
    >
      <CustomHeader
        title=""
        navigation={navigation}
        onBackPress={() => navigation.navigate("Lanuage")}
      />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 bg-white justify-center">
          <View className="items-center justify-center px-4">
            <Image
              source={sign}
              resizeMode="contain"
              style={{ height: dynamicStyles.imageHeight, width: "100%" }}
            />

            <Text
              className="pt-10 font-semibold text-center"
              style={
                i18n.language === "si" || i18n.language === "ta"
                  ? { fontSize: 18 }
                  : { fontSize: 25 }
              }
            >
              {t("SignIn.Welcome")}
            </Text>

            <Text
              className="pt-4 text-center w-full px-8"
              style={
                i18n.language === "si"
                  ? { fontSize: 12 }
                  : i18n.language === "ta"
                    ? { fontSize: 14 }
                    : { fontSize: 16 }
              }
            >
              {t("SignIn.EnterYourPhoneNumberOfYourLoginID")}
            </Text>
          </View>

          <View className="px-6 pt-8 pb-8">
            <View className="flex">
              <View className="flex w-full">
                <View className="flex-row items-center gap-2 w-full">
                  {/* Country Picker */}
                  <TouchableOpacity
                    onPress={() => setCountryModalVisible(true)}
                    className="border border-[#D5D5D5] rounded-3xl flex-row items-center justify-center px-3 gap-1 h-[50px]"
                    style={{ flex: 3 }}
                  >
                    <Text style={{ fontSize: 20 }}>{selectedCountryFlag}</Text>
                    <Text className="text-sm text-gray-700">
                      {selectedCountryCode}
                    </Text>
                    <MaterialIcons
                      name="arrow-drop-down"
                      size={24}
                      color="#666"
                    />
                  </TouchableOpacity>

                  {/* Phone Input */}
                  <View
                    className="flex-row items-center border border-[#D5D5D5] rounded-3xl bg-white h-[50px]"
                    style={{ flex: 7 }}
                  >
                    <TextInput
                      className="flex-1 px-4"
                      placeholder={t("Inputs.PhoneNumber")}
                      value={phonenumber}
                      onChangeText={handlePhoneNumberChange}
                      keyboardType="phone-pad"
                      maxLength={10}
                      autoFocus
                      underlineColorAndroid="transparent"
                      cursorColor="#141415ff"
                    />

                    {isValid &&
                      phonenumber.replace(/[^0-9]/g, "").length === 9 && (
                        <View
                          className="mr-3"
                          style={{
                            width: wp(6),
                            height: wp(6),
                            borderRadius: wp(3.5),
                            backgroundColor: "#0FC7B2",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <AntDesign name="check" size={wp(3)} color="#fff" />
                        </View>
                      )}
                  </View>
                </View>
              </View>

              {/* Error */}
              {error && (
                <Text className="text-red-500 mt-2" style={{ fontSize: wp(3) }}>
                  {error}
                </Text>
              )}
            </View>

            <View className="mt-8 w-full px-6">
              <TouchableOpacity
                onPress={handleLogin}
                disabled={isButtonDisabled}
                activeOpacity={0.8}
                className="w-full rounded-3xl h-[50px] overflow-hidden shadow-lg elevation-6"
              >
                {isButtonDisabled ? (
                  <View className="items-center">
                  <View className=" h-full bg-[#9CA3AF] justify-center items-center"
                     style={{
                        borderRadius: 999,
                        height: 50,
                        width: SCREEN_HEIGHT > 900 ? 260 : 220,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                  >
                    <Text className="text-white font-semibold text-center text-lg">
                      {t("SignIn.SignIn")}
                    </Text>
                  </View>
                  </View>
                ) : (
                  <View className="items-center">
                    <LinearGradient
                      colors={["#0FC7B2", "#10A37D"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className="w-full h-full justify-center items-center"
                      style={{
                        borderRadius: 999,
                        height: 50,
                        width: SCREEN_HEIGHT > 900 ? 260 : 220,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text className="text-white font-semibold text-center text-lg">
                          {t("SignIn.SignIn")}
                        </Text>
                      )}
                    </LinearGradient>
                  </View>
                )}
              </TouchableOpacity>

              {/* Signup Link */}
              <View className="mt-6 flex-row justify-center items-center ">
                <Text className="font-bold text-[#3F3F3F] mr-2">
                  {t("SignIn.DontHaveAnAccount")}
                </Text>

                <TouchableOpacity
                  onPress={async () => {
                    try {
                      await AsyncStorage.removeItem("@user_language");
                      navigation.navigate("Signup");
                    } catch (error) {
                      console.error("Error clearing language:", error);
                    }
                  }}
                >
                  <Text className="text-[#0085FF] font-semibold underline">
                    {t("SignIn.SignUpHere")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Country Code Modal */}
      <GlobalSearchModal
        visible={countryModalVisible}
        onClose={() => setCountryModalVisible(false)}
        title={t("Select Country Code")}
        data={countryItems}
        selectedItems={[selectedCountryCode]}
        onSelect={handleCountrySelect}
        searchPlaceholder={t("Search country or dial code...")}
        searchKeys={["label", "countryName", "dialCode"]}
        multiSelect={false}
      />
    </KeyboardAvoidingView>
  );
};

export default Signin;
