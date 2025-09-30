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
//import PhoneInput from "react-native-phone-number-input";
import PhoneInput from '@linhnguyen96114/react-native-phone-input';
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
const Bottom = require('../assets/images/sign/sign up bg vector bottom.webp');
const Top = require('../assets/images/sign/sign up bg vector top.webp');
const logo2 = require("@/assets/images/sign/createaccount.webp");

const SignupForum: React.FC<SignupForumProps> = ({ navigation }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [nic, setNic] = useState("");
  const [error, setError] = useState("");
  const [ere, setEre] = useState("");
  const [selectedCode, setSelectedCode] = useState("+1");
  const { t, i18n } = useTranslation();
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
  const [spaceAttempted, setSpaceAttempted] = useState(false);
  const [lastNameSpaceAttempted, setLastNameSpaceAttempted] = useState(false);

  const getFontSizeByLanguage = () => {
  // Reduce font size for Sinhala and Tamil languages
  if (language === 'si' || language === 'ta') {
    return wp(3); // Smaller font size for Sinhala/Tamil
  }
  return wp(4); // Normal font size for other languages
};

const getPlaceholderSizeByLanguage = () => {
  if (language === 'si' || language === 'ta') {
    return wp(3); // Even smaller for placeholders
  }
  return wp(4); // Normal placeholder size
};

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

        const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
   
         return () => subscription.remove();
    }, [navigation])
  );

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

  // const validateNic = (nic: string) => {
  //   const regex = /^(\d{12}|\d{9}V|\d{9}X|\d{9}v|\d{9}x)$/;
  //   if (!regex.test(nic)) {
  //     setEre(t("SignupForum.Enteravalidenic"));
  //   } else {
  //     setEre("");
  //   }
  // };

  // const handleNicChange = (text: string) => {
  //   const normalizedText = text.replace(/[vV]/g, "V");
  //   setNic(normalizedText);
  //   validateNic(normalizedText);
  //   if (normalizedText.endsWith("V") || normalizedText.length === 12) {
  //     Keyboard.dismiss();
  //   }
  // };

  interface userItem {
    phoneNumber: String;
  }

  // const validateName = (
  //   name: string,
  //   setError: React.Dispatch<React.SetStateAction<string>>
  // ) => {
  //   const regex = /^[\p{L}\u0B80-\u0BFF\u0D80-\u0DFF]+$/u;

  //   if (!regex.test(name)) {
  //     setError(t("SignupForum.Startwithletter"));
  //   } else {
  //     setError("");
  //   }
  // };


  const validateName = (
  name: string,
  setError: React.Dispatch<React.SetStateAction<string>>
) => {
  // Check if name starts with space
  if (name.startsWith(' ')) {
    setError(t("SignupForum.CannotStartWithSpace"));
    return false;
  }
  
  // Check if name contains any spaces
  if (name.includes(' ')) {
    setError(t("SignupForum.NoSpacesAllowed"));
    return false;
  }
  
  // Check if name contains numbers or special characters (only letters allowed)
  const regex = /^[\p{L}\u0B80-\u0BFF\u0D80-\u0DFF]+$/u;
  
  if (name && !regex.test(name)) {
    setError(t("SignupForum.OnlyLettersAllowed"));
    return false;
  } else if (name) {
    setError("");
    return true;
  }
  
  return false;
};

// Enhanced First Name handler
const handleFirstNameChange = (text: string) => {
  // Prevent spaces at the beginning
  if (text.startsWith(' ')) {
    setFirstNameError(t("SignupForum.CannotStartWithSpace"));
    setSpaceAttempted(true);
    
    setTimeout(() => {
      setFirstNameError("");
      setSpaceAttempted(false);
    }, 3000);
    
    return; // Don't update the state
  }
  
  // Block spaces anywhere in the name
  if (text.includes(' ')) {
    setFirstNameError(t("SignupForum.NoSpacesAllowed"));
    setSpaceAttempted(true);
    
    setTimeout(() => {
      setFirstNameError("");
      setSpaceAttempted(false);
    }, 3000);
    
    return; // Don't update the state
  }
  
  // Block numbers and special characters (allow only letters)
  const letterOnlyRegex = /^[\p{L}\u0B80-\u0BFF\u0D80-\u0DFF]*$/u;
  if (text && !letterOnlyRegex.test(text)) {
    setFirstNameError(t("SignupForum.OnlyLettersAllowed"));
    setSpaceAttempted(true);
    
    setTimeout(() => {
      setFirstNameError("");
      setSpaceAttempted(false);
    }, 3000);
    
    return; // Don't update the state
  }
  
  // Clear any existing errors when user types valid input
  if (spaceAttempted) {
    setFirstNameError("");
    setSpaceAttempted(false);
  }
  
  setFirstName(text);
  validateName(text, setFirstNameError);
};

// Enhanced Last Name handler
const handleLastNameChange = (text: string) => {
  // Prevent spaces at the beginning
  if (text.startsWith(' ')) {
    setLastNameError(t("SignupForum.CannotStartWithSpace"));
    setLastNameSpaceAttempted(true);
    
    setTimeout(() => {
      setLastNameError("");
      setLastNameSpaceAttempted(false);
    }, 3000);
    
    return; // Don't update the state
  }
  
  // Block spaces anywhere in the name
  if (text.includes(' ')) {
    setLastNameError(t("SignupForum.NoSpacesAllowed"));
    setLastNameSpaceAttempted(true);
    
    setTimeout(() => {
      setLastNameError("");
      setLastNameSpaceAttempted(false);
    }, 3000);
    
    return; // Don't update the state
  }
  
  // Block numbers and special characters (allow only letters)
  const letterOnlyRegex = /^[\p{L}\u0B80-\u0BFF\u0D80-\u0DFF]*$/u;
  if (text && !letterOnlyRegex.test(text)) {
    setLastNameError(t("SignupForum.OnlyLettersAllowed"));
    setLastNameSpaceAttempted(true);
    
    setTimeout(() => {
      setLastNameError("");
      setLastNameSpaceAttempted(false);
    }, 3000);
    
    return; // Don't update the state
  }
  
  // Clear any existing errors when user types valid input
  if (lastNameSpaceAttempted) {
    setLastNameError("");
    setLastNameSpaceAttempted(false);
  }
  
  setLastName(text);
  validateName(text, setLastNameError);
};

// Enhanced NIC validation function
const validateNic = (nic: string) => {
  // Allow only numbers and V/X at the end (block all other letters and special characters)
  const nicRegex = /^(\d{12}|\d{9}[VvXx])$/;
  
  if (nic && !nicRegex.test(nic)) {
    setEre(t("SignupForum.Enteravalidenic"));
  } else {
    setEre("");
  }
};

// Enhanced NIC handler
const handleNicChange = (text: string) => {
  // Remove any characters that are not numbers, V, or X
  const cleanedText = text.replace(/[^0-9VvXx]/g, '');
  
  // Normalize V and X to uppercase
  const normalizedText = cleanedText.replace(/[vV]/g, "V").replace(/[xX]/g, "X");
  
  // Ensure V or X can only be at the end and only for 9-digit NICs
  let finalText = normalizedText;
  
  // If there's a V or X, make sure it's only at position 9 (for old format)
  if (normalizedText.length > 9 && (normalizedText.includes('V') || normalizedText.includes('X'))) {
    const numbers = normalizedText.replace(/[VX]/g, '');
    const letters = normalizedText.replace(/[0-9]/g, '');
    
    if (numbers.length === 9 && letters.length === 1) {
      finalText = numbers + letters;
    } else if (numbers.length >= 9) {
      finalText = numbers.substring(0, 9) + (letters.length > 0 ? letters.charAt(0) : '');
    } else {
      finalText = numbers;
    }
  }
  
  // Limit to 12 characters for new format or 10 for old format (9 digits + V/X)
  if (finalText.length > 12) {
    finalText = finalText.substring(0, 12);
  }
  
  setNic(finalText);
  validateNic(finalText);
  
  // Auto-dismiss keyboard when NIC is complete
  if (finalText.endsWith("V") || finalText.endsWith("X") || finalText.length === 12) {
    Keyboard.dismiss();
  }
};
  // const handleFirstNameChange = (text: string) => {
  //   setFirstName(text);
  //   validateName(text, setFirstNameError);
  // };

  // const handleLastNameChange = (text: string) => {
  //   setLastName(text);
  //   validateName(text, setLastNameError);
  // };

  // const handleFirstNameChange = (text: string) => {
  //   // Check if the text contains spaces
  //   if (text.includes(" ")) {
  //     setFirstNameError(t("SignupForum.Startwithletter")); // Add this translation
  //     setSpaceAttempted(true);

  //     // Clear the error after 3 seconds
  //     setTimeout(() => {
  //       setFirstNameError("");
  //       setSpaceAttempted(false);
  //     }, 3000);

  //     return; // Prevent the change
  //   }

  //   // Clear any existing space error when user types normally
  //   if (spaceAttempted) {
  //     setFirstNameError("");
  //     setSpaceAttempted(false);
  //   }

  //   setFirstName(text);
  //   validateName(text, setFirstNameError);
  // };

  // // Replace your existing handleLastNameChange function with this:
  // const handleLastNameChange = (text: string) => {
  //   // Check if the text contains spaces
  //   if (text.includes(" ")) {
  //     setLastNameError(t("SignupForum.Startwithletter")); // Add this translation
  //     setLastNameSpaceAttempted(true);

  //     // Clear the error after 3 seconds
  //     setTimeout(() => {
  //       setLastNameError("");
  //       setLastNameSpaceAttempted(false);
  //     }, 3000);

  //     return; 
  //   }


  //   if (lastNameSpaceAttempted) {
  //     setLastNameError("");
  //     setLastNameSpaceAttempted(false);
  //   }

  //   setLastName(text);
  //   validateName(text, setLastNameError);
  // };

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
        Alert.alert(t("Main.Sorry"), t("SignupForum.phoneExists"),
         [
      {
        text: t("PublicForum.OK"),
        onPress: () => {
          navigation.navigate("SignupForum"); // Go back after successful update
        }
      }
    ]);
        setIsLoading(false);
        setIsButtonDisabled(false);
        return;
      } else if (checkResponse.data.message === "This NIC already exists.") {
        Alert.alert(t("Main.Sorry"), t("SignupForum.nicExists"),
          [
      {
        text: t("PublicForum.OK"),
        onPress: () => {
          navigation.navigate("SignupForum"); // Go back after successful update
        }
      }
    ]);
        setIsLoading(false);
        setIsButtonDisabled(false);
        return;
      } else if (
        checkResponse.data.message ===
        "This Phone Number and NIC already exist."
      ) {
        Alert.alert(t("Main.Sorry"), t("SignupForum.phoneNicExist"),
          [
      {
        text: t("PublicForum.OK"),
        onPress: () => {
          navigation.navigate("SignupForum"); // Go back after successful update
        }
      }
    ]);
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
      if (i18n.language === "en") {
        otpMessage = `Thank you for joining Polygon Agro!
Your GoviCare OTP is {{code}}`;
      } else if (i18n.language === "si") {
        otpMessage = `Polygon Agro සමඟ සම්බන්ධ වීම ගැන ඔබට ස්තූතියි!
ඔබේ GoviCare OTP මුරපදය {{code}} වේ.`;
      } else if (i18n.language === "ta") {
        otpMessage = `Polygon Agro ல் இணைந்ததற்கு நன்றி!
உங்கள் GoviCare OTP {{code}} ஆகும்.`;
      }
      const body = {
        source: "PolygonAgro",
        transport: "sms",
        content: {
          sms: otpMessage,
        },
        destination: mobileNumber,
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
      Alert.alert(t("Main.Sorry"), t("Main.somethingWentWrong"),
        [
      {
        text: t("PublicForum.OK"),
        onPress: () => {
          navigation.navigate("SignupForum"); // Go back after successful update
        }
      }
    ]);
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
      nicInputRef.current.blur(); 
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios"  ? "height" : "height"}
      style={{ flex: 1 }}
      enabled
    >
      <StatusBar 
  barStyle="dark-content" 
  backgroundColor="transparent" 
  translucent={false}
/>
      <View className=" bg-white ">

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        className=""
      >
                    <Image
        source={Top} 
        className="w-[100%] -mt-[46%] absolute "
        resizeMode="contain"

      />
        <View className="flex-1  z-50">
          <View className="pt-0  ">
            <View className=" pb-0  ">
              <AntDesign
                style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
                name="left"
                size={24}
                color="#fff"
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
            </View>
          </View>

          <View className="flex-1 items-center pt-6 ">
            <Text className="font-bold" style={{ fontSize: wp(6) }}>
              {t("SignupForum.Create Account")}
            </Text>
            <View
              className="flex-1 w-full "
              style={{ paddingHorizontal: dynamicStyles.inputFieldsPaddingX }}
            >
             <View className="flex gap-x-0 pt-5">                 
  <View className="flex-col flex-1 gap-x-1">                   
    <Text className="text-gray-700 text-sm">                     
      {t("SignupForum.Mobile Number")}                   
    </Text>                   
    <View className="mt-2 bg-[#F4F4F4] rounded-full ">                     
      <PhoneInput
        key="lk-phone-input"                      
        defaultValue={mobileNumber}
        defaultCode="LK"
        countryPickerButtonStyle={{
          backgroundColor: "#F4F4F4",
       //   borderRadius: 25,
      //    paddingHorizontal: 10,
        }}
        layout="first"
        placeholder={t("7X XXXXXXX")}                                              
        autoFocus
        disableArrowIcon={false}
       // flagSize={24}
        textContainerStyle={{                         
          paddingVertical: 2,                         
          backgroundColor: "#F4F4F4",                         
          borderRadius: 50, 
          paddingLeft: 10,  
      //    height:50                    
        }}                      
        textInputStyle={{           
          borderRadius: 50,           
          fontSize: getFontSizeByLanguage(),
          paddingLeft: 5,
          
        }}                       
        flagButtonStyle={{                         
          borderRadius: 50,                         
          backgroundColor: "#F4F4F4",                         
          marginRight: 5,
          paddingHorizontal: 8,
          minWidth: 70, // Ensure space for flag + country code
        }}                       
        containerStyle={{                         
          height: hp(7),                         
          width: wp(78),                         
          borderColor: "#F4F4F4",                         
          borderRadius: 50,                       
        }}
        codeTextStyle={{
          fontSize: getFontSizeByLanguage(),
          color: '#000',
        }}                      
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
              <Text className="text-gray-700 text-sm mt-2">                   
    {t("SignupForum.FirstName")}                 
  </Text>                 
  <TextInput                   
  //  className=" bg-[#F4F4F4]  rounded-full mb-2 mt-2  px-4 p-3"                   
    placeholder={t("SignupForum.Enter First Name Here")}               
       style={{ 
              backgroundColor: '#F4F4F4',
              borderRadius: 25,
              paddingHorizontal: 16,
              paddingVertical: 16,
              textDecorationLine: 'none',
              borderBottomWidth: 0,
              borderBottomColor: 'transparent',
              borderWidth: 0,
              borderColor: 'transparent',
              elevation: 0,
              shadowOpacity: 0,
              outline: 'none',
              marginBottom:8,
               marginTop:10
            }}
            underlineColorAndroid="transparent"
            cursorColor="#141415ff"                 
    value={firstName}                   
    onChangeText={(text) => {
      // Capitalize first letter of each word
      const capitalizedText = text.replace(/\b\w/g, (char) => char.toUpperCase());
      handleFirstNameChange(capitalizedText);
    }}                   
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
  
  <Text className="text-gray-700 text-sm ">                   
    {t("SignupForum.LastName")}                 
  </Text>                 
  <TextInput                   
   // className=" bg-[#F4F4F4]  rounded-full mb-2 mt-2   px-4 p-3"                   
    placeholder={t("SignupForum.Enter Last Name Here")}                   
    value={lastName}                  
   style={{ 
              backgroundColor: '#F4F4F4',
              borderRadius: 25,
              paddingHorizontal: 16,
              paddingVertical: 16,
              textDecorationLine: 'none',
              borderBottomWidth: 0,
              borderBottomColor: 'transparent',
              borderWidth: 0,
              borderColor: 'transparent',
              elevation: 0,
              shadowOpacity: 0,
              outline: 'none',
              marginBottom:8,
               marginTop:10
            }}
            underlineColorAndroid="transparent"
            cursorColor="#141415ff"                      
    onChangeText={(text) => {
      // Capitalize first letter of each word
      const capitalizedText = text.replace(/\b\w/g, (char) => char.toUpperCase());
      handleLastNameChange(capitalizedText);
    }}                   
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
                <Text className="text-gray-700 text-sm ">
                  {t("SignupForum.NICNumber")}
                </Text>
                <TextInput
               //   className=" bg-[#F4F4F4]  rounded-full mb-2 mt-2   px-4 p-3"
                  placeholder={t("SignupForum.Enter NIC Here")}
                  value={nic}
                //  style={{ fontSize: wp(4) }}
  //                  style={{ 
  //   fontSize: getFontSizeByLanguage(),
  //   // Optional: Adjust height if needed
  //   height: hp(6) 
  // }}
   style={{ 
              backgroundColor: '#F4F4F4',
              borderRadius: 25,
              paddingHorizontal: 16,
              paddingVertical: 16,
              textDecorationLine: 'none',
              borderBottomWidth: 0,
              borderBottomColor: 'transparent',
              borderWidth: 0,
              borderColor: 'transparent',
              elevation: 0,
              shadowOpacity: 0,
              outline: 'none',
              marginBottom:8,
              marginTop:10
            }}
            underlineColorAndroid="transparent"
            cursorColor="#141415ff"   
                  maxLength={12}
                  onChangeText={handleNicChange}
                />
                {ere ? (
                  <Text
                    className="text-red-500 mb-4 "
                    style={{ fontSize: wp(3) }}
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
                  <View className=" ">
                    <Text className="text-gray-700 text-sm mt-8">
                      {t("SignupForum.District")}
                    </Text>
                    <DropDownPicker
                      searchable={true}
                      open={open}
                      value={district}
                       searchPlaceholder={t("SignupForum.TypeSomething")} 
                      // items={items}
                      setOpen={setOpen}
                      setValue={setDistrict}
                      // setItems={setItems}
                      items={districtOptions.map((item) => ({
                        label: t(item.translationKey),
                        value: item.value,
                      }))}
                      placeholder={t("SignupForum.Select Your District")}
                      placeholderStyle={{ 
          color: "#585858", 
          fontSize: getPlaceholderSizeByLanguage(), // Dynamic placeholder size
        }}
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
                        backgroundColor: "#F4F4F4",
                        borderRadius: 50,
                        marginTop: 8,
                      }}
                      textStyle={{ fontSize: 14, marginLeft: 4 }}
                      onOpen={dismissKeyboard}
                    />
                  </View>
                </View>
              </View>
            </View>
            {/* <View className="flex items-center justify-center mt-14 ">
              {language === "en" ? (
                <View className="flex-row justify-center flex-wrap">
                  <Text className="text-sm text-black font-thin">View </Text>

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
              ) : (
                <View className="flex-row justify-center flex-wrap">
                  <TouchableOpacity
                    onPress={() => navigation.navigate("TermsConditions")}
                  >
                    <Text
                      className="text-black font-bold"
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
                      className="text-black font-bold"
                      style={{ fontSize: adjustFontSize(12) }}
                    >
                      {""} පුද්කලිකත්ව ප්‍රතිපත්තිය
                    </Text>
                  </TouchableOpacity>

                  <Text
                    className="text-black font-thin"
                    style={{ fontSize: adjustFontSize(12), marginLeft: 2 }}
                  >
                    {""} බලන්න
                  </Text>
                </View>
              )}
            </View> */}

            <View className="flex items-center justify-center mt-14 ">
  {language === "en" ? (
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
    // Sinhala version
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
  ) : language === "ta" ? (
    // Tamil version
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
  ) : (
    // Fallback to English if language not recognized
    <View className="flex-row justify-center flex-wrap">
      <Text className="text-sm text-black font-thin">View </Text>
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
  )}
</View>

            <View className="flex-row items-center justify-center p-4">
              <Checkbox
                value={isChecked}
                onValueChange={setIsChecked}
                color={isChecked ? "#00A896" : undefined}
              />
              <Text
                className="text-gray-700 ml-2 font-semibold"
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
                className={`p-3 mt-2 rounded-3xl mb-2 ${
                  isButtonDisabled || !isChecked
                    ? "bg-gray-400"
                    : "bg-[#353535]"
                }`}
                onPress={handleRegister}
                disabled={isButtonDisabled || !isChecked}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" /> // Show loader when isLoading is true
                ) : (
                  <Text
                    className="text-white text-center font-semibold"
                    style={{ fontSize: wp(5) }}
                  >
                    {t("SignupForum.SignUp")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <View className="flex-1 items-center  flex-row  pb-6 justify-center z-50 ">
              <Text className="font-bold ">{t("SignupForum.AlreadyAccount")} </Text>
              <TouchableOpacity>
                <Text
                  className="text-white font-semibold underline "
                  onPress={() => navigation.navigate("Signin")}
                >
                  {t("SignupForum.SignIn")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
                        <Image
        source={Bottom} 
        className="w-[100%]  absolute mt-[110%] " 
        resizeMode="contain"

      />
      </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default SignupForum;
