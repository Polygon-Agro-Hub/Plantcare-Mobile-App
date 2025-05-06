import {
  View,
  Text,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  Keyboard,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import AntDesign from "react-native-vector-icons/AntDesign";
import axios from "axios";
import PhoneInput from "react-native-phone-number-input";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { environment } from "@/environment/environment";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Picker } from "@react-native-picker/picker";
import Checkbox from "expo-checkbox";
import DropDownPicker from "react-native-dropdown-picker";
import { set } from "lodash";
import { useFocusEffect } from "@react-navigation/native";
type SignupForumNavigationProp = StackNavigationProp<
  RootStackParamList,
  "SignupForum"
>;

interface SignupForumProps {
  navigation: SignupForumNavigationProp;
}

const logo2 = require("@/assets/images/sign/createaccount.webp");

const SignupForum: React.FC<SignupForumProps> = ({ navigation }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [nic, setNic] = useState("");
  const [error, setError] = useState("");
  const [ere, setEre] = useState("");
  const [selectedCode, setSelectedCode] = useState("+1");
  const { t ,i18n} = useTranslation();
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const screenWidth = wp(100);
  const [language, setLanguage] = useState("en");
  const [isChecked, setIsChecked] = useState(false);
  const nicInputRef = useRef<TextInput>(null);
  const [open, setOpen] = useState(false);
  const [district, setDistrict] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const adjustFontSize = (size: number) =>
    language !== "en" ? size * 0.9 : size;

  useEffect(() => {
    const selectedLanguage = t("SignupForum.LNG");
    setLanguage(selectedLanguage);
    console.log("Language:", selectedLanguage);
  }, [t]);

    useFocusEffect(
      React.useCallback(() => {
        const onBackPress = () => {
          AsyncStorage.removeItem("@user_language");
          navigation.navigate("Lanuage");
          return true; // Prevent default back action
        };
    
        BackHandler.addEventListener("hardwareBackPress", onBackPress);
    
        return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
      }, [navigation])
    );

  // useEffect(() => {
  //   const checkTokenExpiration = async () => {
  //     try {
  //       const expirationTime = await AsyncStorage.getItem(
  //         "tokenExpirationTime"
  //       );
  //       const userToken = await AsyncStorage.getItem("userToken");

  //       if (expirationTime && userToken) {
  //         const currentTime = new Date();
  //         const tokenExpiry = new Date(expirationTime);

  //         if (currentTime < tokenExpiry) {
  //           console.log("Token is valid, navigating to Main.");
  //           navigation.navigate("Main", { screen: "Dashboard" });
  //         } else {
  //           console.log("Token expired, clearing storage.");
  //           await AsyncStorage.multiRemove([
  //             "userToken",
  //             "tokenStoredTime",
  //             "tokenExpirationTime",
  //           ]);
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Error checking token expiration:", error);
  //     }
  //   };

  //   checkTokenExpiration();
  // }, [navigation]);

  const districtOptions = [
    { key: 1, value: "Ampara", translationKey: t("FixedAssets.Ampara") },
    {
      key: 2,
      value: "Anuradhapura",
      translationKey: t("FixedAssets.Anuradhapura"),
    },
    { key: 3, value: "Badulla", translationKey: t("FixedAssets.Badulla") },
    {
      key: 4,
      value: "Batticaloa",
      translationKey: t("FixedAssets.Batticaloa"),
    },
    { key: 5, value: "Colombo", translationKey: t("FixedAssets.Colombo") },
    { key: 6, value: "Galle", translationKey: t("FixedAssets.Galle") },
    { key: 7, value: "Gampaha", translationKey: t("FixedAssets.Gampaha") },
    {
      key: 8,
      value: "Hambantota",
      translationKey: t("FixedAssets.Hambantota"),
    },
    { key: 9, value: "Jaffna", translationKey: t("FixedAssets.Jaffna") },
    { key: 10, value: "Kalutara", translationKey: t("FixedAssets.Kalutara") },
    { key: 11, value: "Kandy", translationKey: t("FixedAssets.Kandy") },
    { key: 12, value: "Kegalle", translationKey: t("FixedAssets.Kegalle") },
    {
      key: 13,
      value: "Kilinochchi",
      translationKey: t("FixedAssets.Kilinochchi"),
    },
    {
      key: 14,
      value: "Kurunegala",
      translationKey: t("FixedAssets.Kurunegala"),
    },
    { key: 15, value: "Mannar", translationKey: t("FixedAssets.Mannar") },
    { key: 16, value: "Matale", translationKey: t("FixedAssets.Matale") },
    { key: 17, value: "Matara", translationKey: t("FixedAssets.Matara") },
    {
      key: 18,
      value: "Moneragala",
      translationKey: t("FixedAssets.Moneragala"),
    },
    {
      key: 19,
      value: "Mullaitivu",
      translationKey: t("FixedAssets.Mullaitivu"),
    },
    {
      key: 20,
      value: "Nuwara Eliya",
      translationKey: t("FixedAssets.NuwaraEliya"),
    },
    {
      key: 21,
      value: "Polonnaruwa",
      translationKey: t("FixedAssets.Polonnaruwa"),
    },
    { key: 22, value: "Puttalam", translationKey: t("FixedAssets.Puttalam") },
    {
      key: 23,
      value: "Rathnapura",
      translationKey: t("FixedAssets.Rathnapura"),
    },
    {
      key: 24,
      value: "Trincomalee",
      translationKey: t("FixedAssets.Trincomalee"),
    },
    { key: 25, value: "Vavuniya", translationKey: t("FixedAssets.Vavuniya") },
  ];

  // const [items, setItems] = useState(
  //   districtOptions.map((item) => ({
  //     label: t(item.translationKey),
  //     value: item.value,
  //   }))
  // );

  const validateMobileNumber = (number: string) => {
    const regex = /^[1-9][0-9]{8}$/;
    if (!regex.test(number)) {
      setError(t("SignupForum.Enteravalidmobile"));
    } else {
      setError("");
    }
  };

  const handleMobileNumberChange = (text: string) => {
    if (text.length <= 10) {
      setMobileNumber(text);
      validateMobileNumber(text);
    }
  };

  const validateNic = (nic: string) => {
    const regex = /^(\d{12}|\d{9}V|\d{9}X|\d{9}v|\d{9}x)$/;
    if (!regex.test(nic)) {
      setEre(t("SignupForum.Enteravalidenic"));
    } else {
      setEre("");
    }
  };

  const handleNicChange = (text: string) => {
    const normalizedText = text.replace(/[vV]/g, "V");
    setNic(normalizedText);
    validateNic(normalizedText);
    if (normalizedText.endsWith("V") || normalizedText.length === 12) {
      Keyboard.dismiss();
    }
  };

  interface userItem {
    phoneNumber: String;
  }

  const validateName = (
    name: string,
    setError: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const regex = /^[\p{L}\u0B80-\u0BFF\u0D80-\u0DFF]+$/u;

    if (!regex.test(name)) {
      setError(t("SignupForum.Startwithletter"));
    } else {
      setError("");
    }
  };

  const handleFirstNameChange = (text: string) => {
    setFirstName(text);
    validateName(text, setFirstNameError);
  };

  const handleLastNameChange = (text: string) => {
    setLastName(text);
    validateName(text, setLastNameError);
  };

  const handleRegister = async () => {
    if (
      !mobileNumber ||
      !nic ||
      !firstName ||
      !lastName ||
      !selectedCode ||
      !district
    ) {
      Alert.alert(t("Main.Sorry"), t("SignupForum.fillAllFields"));
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
      const checkApiUrl = `${environment.API_BASE_URL}api/auth/user-register-checker`;
      const checkBody = {
        phoneNumber: mobileNumber,
        NICnumber: nic,
      };

      const checkResponse = await axios.post(checkApiUrl, checkBody);

      if (checkResponse.data.message === "This Phone Number already exists.") {
        Alert.alert(t("Main.Sorry"), t("SignupForum.phoneExists"));
        setIsLoading(false);
        setIsButtonDisabled(false);
        return;
      } else if (checkResponse.data.message === "This NIC already exists.") {
        Alert.alert(t("Main.Sorry"), t("SignupForum.nicExists"));
        setIsLoading(false);
        setIsButtonDisabled(false);
        return;
      } else if (
        checkResponse.data.message ===
        "This Phone Number and NIC already exist."
      ) {
        Alert.alert(t("Main.Sorry"), t("SignupForum.phoneNicExist"));
        setIsLoading(false);
        setIsButtonDisabled(false);
        return;
      }

      const apiUrl = "https://api.getshoutout.com/otpservice/send";
      const headers = {
        Authorization: `Apikey ${environment.SHOUTOUT_API_KEY}`,
        "Content-Type": "application/json",
      };

      // const body = {
      //   source: "ShoutDEMO",
      //   transport: "sms",
      //   content: {
      //     sms: "Your code is {{code}}",
      //   },
      //   destination: mobileNumber,
      // };

      // const body = {
      //   source: "AgroWorld",
      //   transport: "sms",
      //   content: {
      //     sms: "Your PlantCare OTP is {{code}}",
      //   },
      //   destination: mobileNumber,
      // };
      let otpMessage = "";
      if(i18n.language === "en"){
        otpMessage = `Thank you for joining Agro World!
Your PlantCare OTP is {{code}}`;
      }else if(i18n.language === "si"){
        otpMessage = `AgroWorld සමඟ සම්බන්ධ වීම ගැන ඔබට ස්තූතියි!
ඔබේ PlantCare OTP එක් වරක් මුරපදය {{code}} වේ.`;
      }else if(i18n.language === "ta"){
        otpMessage = `Agroworld ல் இணைந்ததற்கு நன்றி!
உங்கள் PlantCare OTP {{code}} ஆகும்.`;
      }
      const body = {
        source: "AgroWorld",
        transport: "sms",
        content: {
          sms: otpMessage,
        },
        destination:  mobileNumber,
      };

      const response = await axios.post(apiUrl, body, { headers });

      await AsyncStorage.setItem("referenceId", response.data.referenceId);
      await AsyncStorage.setItem("firstName", firstName);
      await AsyncStorage.setItem("lastName", lastName);
      await AsyncStorage.setItem("nic", nic);
      await AsyncStorage.setItem("mobileNumber", mobileNumber);
      await AsyncStorage.setItem("district", district);
      navigation.navigate("OTPE", {
        firstName: firstName,
        lastName: lastName,
        nic: nic,
        mobileNumber: mobileNumber,
        district: district,
      });
      setIsButtonDisabled(false);
      setIsLoading(false);
    } catch (error) {
      Alert.alert(t("Main.Sorry"), t("SignupForum.otpSendFailed"));
      setIsButtonDisabled(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (
      firstName &&
      lastName &&
      mobileNumber &&
      nic &&
      !error &&
      !ere &&
      !firstNameError &&
      !lastNameError &&
      district
    ) {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
    }
  }, [
    firstName,
    lastName,
    mobileNumber,
    nic,
    error,
    ere,
    firstNameError,
    lastNameError,
    district,
  ]);

  const dynamicStyles = {
    imageHeight: screenWidth < 400 ? wp(60) : wp(60),
    imageWidth: screenWidth < 400 ? wp(55) : wp(65),
    inputFieldsPaddingX: screenWidth < 400 ? wp(8) : wp(4),
    paddingTopFromPhne: screenWidth < 400 ? wp(2) : wp(8),
    paddingLeft: screenWidth < 400 ? wp(5) : wp(0),
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };
  const handlePickerInteraction = () => {
    dismissKeyboard();
    if (nicInputRef.current) {
      nicInputRef.current.blur(); // Blur the NIC input field
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      enabled
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1">
          <View className="pt-0 bg-white ">
            <View className=" pb-0  ">
              <AntDesign
                style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
                name="left"
                size={24}
                color="#000502"
                onPress={async () => {
                  try {
                    await AsyncStorage.removeItem("@user_language");
                    navigation.navigate("Signin");
                  } catch (error) {
                    console.error(
                      "Error clearing language from AsyncStorage:",
                      error
                    );
                  }
                }}
              />
              <View className="items-center ">
                <Image
                  source={logo2}
                  className="w-full h-[200px] "
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>

          <View className="flex-1 items-center pt-5 bg-white">
            <View className="flex-1 items-center  flex-row  pb-6 justify-center">
              <Text className="">{t("SignupForum.AlreadyAccount")} </Text>
              <TouchableOpacity>
                <Text
                  className="text-blue-600 underline "
                  onPress={() => navigation.navigate("Signin")}
                >
                  {t("SignupForum.SignIn")}
                </Text>
              </TouchableOpacity>
            </View>
            <Text className="font-bold" style={{ fontSize: wp(4) }}>
              {t("SignupForum.FillAccountDetails")}
            </Text>
            <View
              className="flex-1 w-full"
              style={{ paddingHorizontal: dynamicStyles.inputFieldsPaddingX }}
            >
              <View className="flex-row gap-x-0 pt-5 items-center border-b border-gray-300">
                <View className="flex-row items-center flex-1 gap-x-1 ">
                  <View className="pr-1">
                    <PhoneInput
                      defaultValue={mobileNumber}
                      defaultCode="LK"
                      layout="first"
                      withShadow
                      placeholder={t("SignupForum.PhoneNumber")}
                      autoFocus
                      textContainerStyle={{ paddingVertical: 1 }}
                      value={mobileNumber}
                      onChangeText={handleMobileNumberChange}
                      onChangeFormattedText={(text) => {
                        setMobileNumber(text);
                      }}
                    />
                  </View>
                </View>
              </View>
              {error ? (
                <Text
                  className="text-red-500 mt-2"
                  style={{ fontSize: wp(3), marginTop: wp(2) }}
                >
                  {error}
                </Text>
              ) : null}
              <View style={{ marginTop: dynamicStyles.paddingTopFromPhne }}>
                <TextInput
                  className="h-10 border-b border-gray-300 mb-5 text-base px-2"
                  style={{ fontSize: wp(3) }}
                  placeholder={t("SignupForum.FirstName")}
                  placeholderTextColor="#2E2E2E"
                  value={firstName}
                  onChangeText={handleFirstNameChange}
                  maxLength={20}
                />
                {firstNameError ? (
                  <Text
                    className="text-red-500"
                    style={{ fontSize: wp(3), marginTop: wp(-4) }}
                  >
                    {firstNameError}
                  </Text>
                ) : null}
                <TextInput
                  className="h-10 border-b border-gray-300 mb-5 text-base px-2"
                  style={{ fontSize: wp(3) }}
                  placeholder={t("SignupForum.LastName")}
                  placeholderTextColor="#2E2E2E"
                  value={lastName}
                  onChangeText={handleLastNameChange}
                  maxLength={20}
                />
                {lastNameError ? (
                  <Text
                    className="text-red-500"
                    style={{ fontSize: wp(3), marginTop: wp(-4) }}
                  >
                    {lastNameError}
                  </Text>
                ) : null}
                <TextInput
                  className="h-10 border-b border-gray-300 mb-5 text-base px-2"
                  style={{ fontSize: wp(3) }}
                  placeholder={t("SignupForum.NICNumber")}
                  placeholderTextColor="#2E2E2E"
                  value={nic}
                  maxLength={12}
                  onChangeText={handleNicChange}
                />
                {ere ? (
                  <Text
                    className="text-red-500 mb-3"
                    style={{ fontSize: wp(3), marginTop: wp(-4) }}
                  >
                    {ere}
                  </Text>
                ) : null}

                <View
                  className="h-10 mb-2 text-base pl-1  justify-center items-center "
                  onTouchStart={() => {
                    dismissKeyboard();
                  }}
                >
                  <View className="border-b z-60 border-gray-300  ">
                    <DropDownPicker
                      searchable={true}
                      open={open}
                      value={district}
                      // items={items}
                      setOpen={setOpen}
                      setValue={setDistrict}
                      // setItems={setItems}
                      items={districtOptions.map((item) => ({
                        label: t(item.translationKey),
                        value: item.value,
                      }))}
                      placeholder={t("SignupForum.Please Select Your District")}
                      placeholderStyle={{ color: "#2E2E2E" }}
                      listMode="MODAL"
                      zIndex={3000}
                      zIndexInverse={1000}
                      dropDownContainerStyle={{
                        borderColor: "#ccc",
                        borderWidth: 0,
                      }}
                      style={{
                        borderWidth: 0,
                        width: wp(85),
                        paddingHorizontal: 8,
                        paddingVertical: 10,
                      }}
                      textStyle={{ fontSize: 12 }}
                      onOpen={dismissKeyboard}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Terms Section */}
            <View className="flex items-center mt-4 justify-center">
              {language === "en" ? (
                <Text className="text-center text-sm">
                  <TouchableOpacity
                    onPress={() => navigation.navigate("TermsConditions")}
                  >
                    <Text className="text-black font-bold">
                      <Text className="text-black font-thin">View </Text>Terms &
                      Conditions
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("PrivacyPolicy")}
                  >
                    <Text className="text-black font-bold">
                      <Text className="text-black font-thin"> and </Text>Privacy
                      Policy
                    </Text>
                  </TouchableOpacity>
                </Text>
              ) : (
                <Text className="text-center  text-sm">
                  <TouchableOpacity
                    onPress={() => navigation.navigate("TermsConditions")}
                  >
                    <Text
                      className="text-black font-bold"
                      style={{ fontSize: adjustFontSize(12) }}
                    >
                      නියමයන් සහ කොන්දේසි{" "}
                      <Text
                        className="text-black font-thin"
                        style={{ fontSize: adjustFontSize(12) }}
                      >
                        {" "}
                        සහ{" "}
                      </Text>
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("PrivacyPolicy")}
                  >
                    <Text
                      className="text-black font-bold"
                      style={{ fontSize: adjustFontSize(12) }}
                    >
                      පුද්කලිකත්ව ප්‍රතිපත්තිය
                      <Text
                        className="text-black font-thin"
                        style={{ fontSize: adjustFontSize(12) }}
                      >
                        {" "}
                        බලන්න
                      </Text>
                    </Text>
                  </TouchableOpacity>
                </Text>
              )}
            </View>

            <View className="flex-row items-center justify-center p-4">
              <Checkbox
                value={isChecked}
                onValueChange={setIsChecked}
                color={isChecked ? "#4CAF50" : undefined}
              />
              <Text
                className="text-gray-700 ml-2"
                style={{ fontSize: adjustFontSize(12) }}
              >
                {t("Membership.AgreeToT&C")}
              </Text>
            </View>

            <View
              className="flex-1 justify-center w-72 px-4 "
              style={{ paddingBottom: wp(5) }}
            >
              <TouchableOpacity
                className={`p-4 rounded-3xl mb-2 ${
                  isButtonDisabled || !isChecked ? "bg-gray-400" : "bg-gray-900"
                }`}
                onPress={handleRegister}
                disabled={isButtonDisabled || !isChecked}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" /> // Show loader when isLoading is true
                ) : (
                  <Text
                    className="text-white text-center"
                    style={{ fontSize: wp(4) }}
                  >
                    {t("SignupForum.SignUp")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignupForum;
