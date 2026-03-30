import {
  View,
  Text,
  Image,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Keyboard,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { StatusBar, Platform } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import AntDesign from "react-native-vector-icons/AntDesign";
import axios from "axios";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { environment } from "@/environment/environment";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Checkbox from "expo-checkbox";
import { useFocusEffect } from "@react-navigation/native";
import countryData from "../../assets/jsons/countryflag.json";
import districtData from "../../assets/jsons/district.json";
import GlobalSearchModal from "../../component/common/GlobalSearchModal";
import CustomHeader from "../common/CustomHeader";

type SignupForumNavigationProp = StackNavigationProp<
  RootStackParamList,
  "SignupForum"
>;

interface SignupForumProps {
  navigation: SignupForumNavigationProp;
}

const Bottom = require("../../assets/images/auth/sign-up-bg-vector-bottom.webp");
const Top = require("../../assets/images/auth/sign-up-bg-vector-top.webp");

const countryItems = countryData.map((country) => ({
  label: `${country.emoji}  ${country.name}  (${country.dial_code})`,
  value: country.dial_code,
  countryName: country.name,
  flag: country.emoji,
  dialCode: country.dial_code,
}));

const SignupForum: React.FC<SignupForumProps> = ({ navigation }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [nic, setNic] = useState("");
  const [error, setError] = useState("");
  const [ere, setEre] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [spaceAttempted, setSpaceAttempted] = useState(false);
  const [lastNameSpaceAttempted, setLastNameSpaceAttempted] = useState(false);
  const [language, setLanguage] = useState("en");

  const [selectedCountryCode, setSelectedCountryCode] = useState("+94");
  const [selectedCountryFlag, setSelectedCountryFlag] = useState("🇱🇰");
  const [countryModalVisible, setCountryModalVisible] = useState(false);

  const [district, setDistrict] = useState("");

  const [districtModalVisible, setDistrictModalVisible] = useState(false);

  const nicInputRef = useRef<TextInput>(null);
  const { t, i18n } = useTranslation();

  const districtItems = districtData.map((d) => ({
    label: t(d.translationKey),
    value: d.name,
    districtId: d.id,
    districtName: d.name,
  }));

  useEffect(() => {
    const selectedLanguage = t("SignupForum.LNG");
    setLanguage(selectedLanguage);
  }, [t]);

  const getFontSizeByLanguage = () =>
    language === "si" || language === "ta" ? wp(3) : wp(4);

  const adjustFontSize = (size: number) =>
    language !== "en" ? size * 0.9 : size;

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        AsyncStorage.removeItem("@user_language");
        navigation.navigate("Lanuage");
        return true;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      return () => subscription.remove();
    }, [navigation]),
  );

  useEffect(() => {
    const allFilled =
      firstName &&
      lastName &&
      mobileNumber &&
      nic &&
      district &&
      !error &&
      !ere &&
      !firstNameError &&
      !lastNameError;
    setIsButtonDisabled(!allFilled);
  }, [
    firstName,
    lastName,
    mobileNumber,
    nic,
    district,
    error,
    ere,
    firstNameError,
    lastNameError,
  ]);

  const validateMobileNumber = (number: string) => {
    const regex = /^[1-9][0-9]{8}$/;
    setError(regex.test(number) ? "" : t("SignupForum.Enteravalidmobile"));
  };

  const handleMobileNumberChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    if (cleaned.length <= 10) {
      setMobileNumber(cleaned);
      validateMobileNumber(cleaned);
    }
  };

  const validateName = (
    name: string,
    setErr: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    if (name.startsWith(" ")) {
      setErr(t("SignupForum.CannotStartWithSpace"));
      return false;
    }
    if (name.includes(" ")) {
      setErr(t("SignupForum.NoSpacesAllowed"));
      return false;
    }
    const regex = /^[\p{L}\u0B80-\u0BFF\u0D80-\u0DFF]+$/u;
    if (name && !regex.test(name)) {
      setErr(t("SignupForum.OnlyLettersAllowed"));
      return false;
    }
    if (name) {
      setErr("");
      return true;
    }
    return false;
  };

  const handleFirstNameChange = (text: string) => {
    const blocked =
      text.startsWith(" ") ||
      text.includes(" ") ||
      (text && !/^[\p{L}\u0B80-\u0BFF\u0D80-\u0DFF]*$/u.test(text));

    if (blocked) {
      const msg = text.startsWith(" ")
        ? t("SignupForum.CannotStartWithSpace")
        : text.includes(" ")
          ? t("SignupForum.NoSpacesAllowed")
          : t("SignupForum.OnlyLettersAllowed");
      setFirstNameError(msg);
      setSpaceAttempted(true);
      setTimeout(() => {
        setFirstNameError("");
        setSpaceAttempted(false);
      }, 3000);
      return;
    }
    if (spaceAttempted) {
      setFirstNameError("");
      setSpaceAttempted(false);
    }
    setFirstName(text);
    validateName(text, setFirstNameError);
  };

  const handleLastNameChange = (text: string) => {
    const blocked =
      text.startsWith(" ") ||
      text.includes(" ") ||
      (text && !/^[\p{L}\u0B80-\u0BFF\u0D80-\u0DFF]*$/u.test(text));

    if (blocked) {
      const msg = text.startsWith(" ")
        ? t("SignupForum.CannotStartWithSpace")
        : text.includes(" ")
          ? t("SignupForum.NoSpacesAllowed")
          : t("SignupForum.OnlyLettersAllowed");
      setLastNameError(msg);
      setLastNameSpaceAttempted(true);
      setTimeout(() => {
        setLastNameError("");
        setLastNameSpaceAttempted(false);
      }, 3000);
      return;
    }
    if (lastNameSpaceAttempted) {
      setLastNameError("");
      setLastNameSpaceAttempted(false);
    }
    setLastName(text);
    validateName(text, setLastNameError);
  };

  const validateNic = (value: string) => {
    const nicRegex = /^(\d{12}|\d{9}[VvXx])$/;
    setEre(
      value && !nicRegex.test(value) ? t("SignupForum.Enteravalidenic") : "",
    );
  };

  const handleNicChange = (text: string) => {
    const cleaned = text.replace(/[^0-9VvXx]/g, "");
    const normalized = cleaned.replace(/[vV]/g, "V").replace(/[xX]/g, "X");
    let final = normalized;

    if (
      normalized.length > 9 &&
      (normalized.includes("V") || normalized.includes("X"))
    ) {
      const nums = normalized.replace(/[VX]/g, "");
      const lets = normalized.replace(/[0-9]/g, "");
      if (nums.length === 9 && lets.length === 1) {
        final = nums + lets;
      } else if (nums.length >= 9) {
        final = nums.substring(0, 9) + (lets.length > 0 ? lets.charAt(0) : "");
      } else {
        final = nums;
      }
    }

    if (final.length > 12) final = final.substring(0, 12);
    setNic(final);
    validateNic(final);
    if (final.endsWith("V") || final.endsWith("X") || final.length === 12) {
      Keyboard.dismiss();
    }
  };

  const handleCountrySelect = (items: string[]) => {
    if (!items.length) return;
    const dialCode = items[0];
    const country = countryData.find((c) => c.dial_code === dialCode);
    setSelectedCountryCode(dialCode);
    setSelectedCountryFlag(country?.emoji ?? "🏳️");
  };

  const handleDistrictSelect = (items: string[]) => {
    if (!items.length) return;
    const name = items[0];
    const found = districtData.find((d) => d.name === name);
    setDistrict(name);
  };

  const handleRegister = async () => {
    if (
      !mobileNumber ||
      !nic ||
      !firstName ||
      !lastName ||
      !selectedCountryCode ||
      !district
    ) {
      Alert.alert(t("Main.Sorry"), t("SignupForum.fillAllFields"), [
        { text: t("PublicForum.OK") },
      ]);
      return;
    }

    await AsyncStorage.multiRemove([
      "userToken",
      "tokenStoredTime",
      "tokenExpirationTime",
    ]);
    await AsyncStorage.removeItem("referenceId");
    setIsButtonDisabled(true);
    setIsLoading(true);

    try {
      const fullPhoneNumber = selectedCountryCode + mobileNumber;
      const checkResponse = await axios.post(
        `${environment.API_BASE_URL}api/auth/user-register-checker`,
        { phoneNumber: fullPhoneNumber, NICnumber: nic },
      );

      const msg = checkResponse.data.message;
      if (msg === "This Phone Number already exists.") {
        Alert.alert(t("Main.Sorry"), t("SignupForum.phoneExists"), [
          {
            text: t("PublicForum.OK"),
            onPress: () => navigation.navigate("SignupForum"),
          },
        ]);
        setIsLoading(false);
        setIsButtonDisabled(false);
        return;
      }
      if (msg === "This NIC already exists.") {
        Alert.alert(t("Main.Sorry"), t("SignupForum.nicExists"), [
          {
            text: t("PublicForum.OK"),
            onPress: () => navigation.navigate("SignupForum"),
          },
        ]);
        setIsLoading(false);
        setIsButtonDisabled(false);
        return;
      }
      if (msg === "This Phone Number and NIC already exist.") {
        Alert.alert(t("Main.Sorry"), t("SignupForum.phoneNicExist"), [
          {
            text: t("PublicForum.OK"),
            onPress: () => navigation.navigate("SignupForum"),
          },
        ]);
        setIsLoading(false);
        setIsButtonDisabled(false);
        return;
      }

      let otpMessage = "";
      if (i18n.language === "en") {
        otpMessage = `Thank you for joining Polygon Agro!\nYour GoviCare OTP is {{code}}`;
      } else if (i18n.language === "si") {
        otpMessage = `Polygon Agro සමඟ සම්බන්ධ වීම ගැන ඔබට ස්තූතියි!\nඔබේ GoviCare OTP මුරපදය {{code}} වේ.`;
      } else if (i18n.language === "ta") {
        otpMessage = `Polygon Agro ல் இணைந்ததற்கு நன்றி!\nஉங்கள் GoviCare OTP {{code}} ஆகும்.`;
      }

      const otpResponse = await axios.post(
        "https://api.getshoutout.com/otpservice/send",
        {
          source: "PolygonAgro",
          transport: "sms",
          content: { sms: otpMessage },
          destination: fullPhoneNumber,
        },
        {
          headers: {
            Authorization: `Apikey ${environment.SHOUTOUT_API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      await AsyncStorage.setItem("referenceId", otpResponse.data.referenceId);
      await AsyncStorage.setItem("firstName", firstName);
      await AsyncStorage.setItem("lastName", lastName);
      await AsyncStorage.setItem("nic", nic);
      await AsyncStorage.setItem("mobileNumber", fullPhoneNumber);
      await AsyncStorage.setItem("district", district);

      navigation.navigate("OTPE", {
        firstName,
        lastName,
        nic,
        mobileNumber: fullPhoneNumber,
        district,
      });
      setIsButtonDisabled(false);
      setIsLoading(false);
    } catch (err) {
      console.error("Registration error:", err);
      Alert.alert(t("Main.Sorry"), t("Main.somethingWentWrong"), [
        {
          text: t("PublicForum.OK"),
          onPress: () => navigation.navigate("SignupForum"),
        },
      ]);
      setIsButtonDisabled(false);
      setIsLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: "#F4F4F4",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 0,
    borderColor: "transparent",
    elevation: 0,
    shadowOpacity: 0,
    marginBottom: 8,
    marginTop: 10,
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "white" }}
      enabled
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={false}
      />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={Top}
          className="w-[100%] -mt-[46%] absolute"
          resizeMode="contain"
        />

        <View style={{ flex: 1, zIndex: 2 }}>
          <View className="pt-0">
            <CustomHeader
              title={""}
              navigation={navigation}
              onBackPress={async () => {
                try {
                  await AsyncStorage.removeItem("@user_language");
                  navigation.navigate("Signin");
                } catch (e) {
                  console.error("Error clearing language:", e);
                }
              }}
            />
          </View>

          <View className="flex-1 items-center pt-[4%]">
            <Text className="font-bold" style={{ fontSize: wp(6) }}>
              {t("SignupForum.Create Account")}
            </Text>

            <View className="flex-1 w-full px-4">
              <View className="pt-5">
                <Text className="text-[#070707] text-sm mb-2">
                  {t("SignupForum.Mobile Number")}
                </Text>
                <View className="mt-2 flex-row items-center gap-2">
                  <TouchableOpacity
                    onPress={() => {
                      Keyboard.dismiss();
                      setCountryModalVisible(true);
                    }}
                    style={{
                      height: hp(5.5),
                      width: wp(30),
                      backgroundColor: "#F4F4F4",
                      borderRadius: 25,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                      paddingHorizontal: 10,
                    }}
                  >
                    <Text style={{ fontSize: 18 }}>{selectedCountryFlag}</Text>
                    <Text
                      style={{ fontSize: 13, color: "#333", paddingInline: 8 }}
                    >
                      {selectedCountryCode}
                    </Text>
                  </TouchableOpacity>

                  <TextInput
                    placeholder={t("7X XXXXXXX")}
                    value={mobileNumber}
                    onChangeText={handleMobileNumberChange}
                    keyboardType="phone-pad"
                    maxLength={10}
                    placeholderTextColor="#585858"
                    autoFocus
                    style={{
                      flex: 1,
                      height: hp(5.5),
                      fontSize: getFontSizeByLanguage(),
                      backgroundColor: "#F4F4F4",
                      borderRadius: 25,
                      paddingHorizontal: 16,
                      borderWidth: 0,
                    }}
                    underlineColorAndroid="transparent"
                    cursorColor="#141415ff"
                  />
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

              <View>
                <Text className="text-[#070707] text-sm mt-2">
                  {t("SignupForum.FirstName")}
                </Text>
                <TextInput
                  placeholder={t("SignupForum.Enter First Name Here")}
                  style={inputStyle}
                  placeholderTextColor="#585858"
                  underlineColorAndroid="transparent"
                  cursorColor="#141415ff"
                  value={firstName}
                  onChangeText={(text) =>
                    handleFirstNameChange(
                      text.replace(/\b\w/g, (c) => c.toUpperCase()),
                    )
                  }
                  maxLength={20}
                  autoComplete="given-name"
                />
                {firstNameError ? (
                  <Text
                    className="text-red-500 mb-4"
                    style={{ fontSize: wp(3) }}
                  >
                    {firstNameError}
                  </Text>
                ) : null}

                <Text className="text-[#070707] text-sm">
                  {t("SignupForum.LastName")}
                </Text>
                <TextInput
                  placeholder={t("SignupForum.Enter Last Name Here")}
                  value={lastName}
                  style={inputStyle}
                  placeholderTextColor="#585858"
                  underlineColorAndroid="transparent"
                  cursorColor="#141415ff"
                  onChangeText={(text) =>
                    handleLastNameChange(
                      text.replace(/\b\w/g, (c) => c.toUpperCase()),
                    )
                  }
                  maxLength={20}
                  autoComplete="family-name"
                />
                {lastNameError ? (
                  <Text
                    className="text-red-500 mb-4"
                    style={{ fontSize: wp(3) }}
                  >
                    {lastNameError}
                  </Text>
                ) : null}

                <Text className="text-[#070707] text-sm">
                  {t("SignupForum.NICNumber")}
                </Text>
                <TextInput
                  ref={nicInputRef}
                  placeholder={t("SignupForum.Enter NIC Here")}
                  value={nic}
                  style={inputStyle}
                  underlineColorAndroid="transparent"
                  cursorColor="#141415ff"
                  maxLength={12}
                  onChangeText={handleNicChange}
                  placeholderTextColor="#585858"
                />
                {ere ? (
                  <Text
                    className="text-red-500 mb-4"
                    style={{ fontSize: wp(3) }}
                  >
                    {ere}
                  </Text>
                ) : null}

                <Text className="text-[#070707] text-sm">
                  {t("SignupForum.District")}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    Keyboard.dismiss();
                    setDistrictModalVisible(true);
                  }}
                  style={{
                    ...inputStyle,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 18,
                  }}
                >
                  <Text style={{ fontSize: 14, color: "#585858", flex: 1 }}>
                    {district
                      ? (districtItems.find((d) => d.value === district)
                          ?.label ?? district)
                      : t("SignupForum.Select Your District")}
                  </Text>
                  <AntDesign name="caret-down" size={14} color="#555" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex items-center justify-center mt-10">
              {language === "en" || (language !== "si" && language !== "ta") ? (
                <View className="flex-row justify-center flex-wrap">
                  <Text className="text-sm text-black font-thin">See </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("TermsConditions")}
                  >
                    <Text className="text-sm text-black font-bold underline">
                      Terms & Conditions
                    </Text>
                  </TouchableOpacity>
                  <Text className="text-sm text-black font-thin"> and </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("PrivacyPolicy")}
                  >
                    <Text className="text-sm text-black font-bold underline">
                      Privacy Policy
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : language === "si" ? (
                <View className="flex-row justify-center flex-wrap">
                  <TouchableOpacity
                    onPress={() => navigation.navigate("TermsConditions")}
                  >
                    <Text
                      className="text-black font-bold underline"
                      style={{ fontSize: adjustFontSize(12) }}
                    >
                      නියමයන් සහ කොන්දේසි
                    </Text>
                  </TouchableOpacity>
                  <Text
                    className="text-black font-thin"
                    style={{
                      fontSize: adjustFontSize(12),
                      marginHorizontal: 2,
                    }}
                  >
                    {""} සහ
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("PrivacyPolicy")}
                  >
                    <Text
                      className="text-black font-bold underline"
                      style={{ fontSize: adjustFontSize(12) }}
                    >
                      {""} රහස්‍යතා ප්‍රතිපත්තිය
                    </Text>
                  </TouchableOpacity>
                  <Text
                    className="text-black font-thin"
                    style={{ fontSize: adjustFontSize(12), marginLeft: 2 }}
                  >
                    {""} බලන්න
                  </Text>
                </View>
              ) : (
                <View className="flex-row justify-center flex-wrap">
                  <TouchableOpacity
                    onPress={() => navigation.navigate("TermsConditions")}
                  >
                    <Text
                      className="text-black font-bold"
                      style={{ fontSize: adjustFontSize(12) }}
                    >
                      விதிமுறைகள் மற்றும் நிபந்தனைகள்
                    </Text>
                  </TouchableOpacity>
                  <Text
                    className="text-black font-thin"
                    style={{
                      fontSize: adjustFontSize(12),
                      marginHorizontal: 2,
                    }}
                  >
                    {""} மற்றும்
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("PrivacyPolicy")}
                  >
                    <Text
                      className="text-black font-bold"
                      style={{ fontSize: adjustFontSize(12) }}
                    >
                      {""} தனியுரிமைக் கொள்கை
                    </Text>
                  </TouchableOpacity>
                  <Text
                    className="text-black font-thin"
                    style={{ fontSize: adjustFontSize(12), marginLeft: 2 }}
                  >
                    {""} பார்க்க
                  </Text>
                </View>
              )}
            </View>

            <View className="flex-row items-center justify-center p-4">
              <Checkbox
                value={isChecked}
                onValueChange={setIsChecked}
                color={isChecked ? "#00A896" : undefined}
              />
              <Text
                className="text-[#282828] ml-2 font-semibold"
                style={{ fontSize: adjustFontSize(12) }}
              >
                {t("Membership.AgreeToT&C")}
              </Text>
            </View>

            <View style={{ width: wp(72), paddingBottom: wp(5) }}>
              <TouchableOpacity
                className={`p-3 mt-2 rounded-3xl mb-2 ${
                  isButtonDisabled || !isChecked
                    ? "bg-gray-400"
                    : "bg-[#353535]"
                }`}
                onPress={handleRegister}
                disabled={isButtonDisabled || !isChecked}
                style={{
                  shadowColor: "#000000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text
                    className="text-white text-center font-semibold text-base"
                  
                  >
                    {t("SignupForum.SignUp")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text className="font-bold">
                {t("SignupForum.AlreadyAccount")}{" "}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Signin")}>
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontWeight: "600",
                    textDecorationLine: "underline",
                  }}
                >
                  {t("SignupForum.SignIn")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Image
          source={Bottom}
          style={{
            width: "100%",
            height: hp(15),
            marginTop: -60,
          }}
          resizeMode="stretch"
        />
      </ScrollView>

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

      <GlobalSearchModal
        visible={districtModalVisible}
        onClose={() => setDistrictModalVisible(false)}
        title={t("SignupForum.Select Your District")}
        data={districtItems}
        selectedItems={district ? [district] : []}
        onSelect={handleDistrictSelect}
        searchPlaceholder={t("SignupForum.TypeSomething")}
        searchKeys={["label", "districtName"]}
        multiSelect={false}
      />
    </KeyboardAvoidingView>
  );
};

export default SignupForum;
