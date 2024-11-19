// import {
//   View,
//   Text,
//   Image,
//   TextInput,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   TouchableOpacity,
//   Alert,
// } from "react-native";
// import React, { useEffect, useState } from "react";
// import AntDesign from "react-native-vector-icons/AntDesign";
// import axios from "axios";
// import PhoneInput from "react-native-phone-number-input";
// import { StackNavigationProp } from "@react-navigation/stack";
// import { RootStackParamList } from "./types";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useTranslation } from "react-i18next";
// import { environment } from "@/environment/environment";
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from "react-native-responsive-screen";

// type SignupForumNavigationProp = StackNavigationProp<
//   RootStackParamList,
//   "SignupForum"
// >;

// interface SignupForumProps {
//   navigation: SignupForumNavigationProp;
// }

// const logo2 = require("@/assets/images/logo2.png");

// const SignupForum: React.FC<SignupForumProps> = ({ navigation }) => {
//   const [firstName, setFirstName] = useState(""); // Fixed typo in setter name
//   const [lastName, setLastName] = useState("");
//   const [mobileNumber, setMobileNumber] = useState("");
//   const [nic, setNic] = useState("");
//   const [error, setError] = useState("");
//   const [ere, setEre] = useState("");
//   const [selectedCode, setSelectedCode] = useState("+1"); // Default to a country code, e.g., '+1'
//   const { t } = useTranslation();
//   const [firstNameError, setFirstNameError] = useState(""); // Error state for first name
//   const [lastNameError, setLastNameError] = useState(""); // Error state for last name
//   const [isButtonDisabled, setIsButtonDisabled] = useState(true); // Button disabled state
//   const screenWidth = wp(100);

//   const validateMobileNumber = (number: string) => {
//     const regex = /^[1-9][0-9]{8}$/;
//     if (!regex.test(number)) {
//       setError(t("SignupForum.Enteravalidmobile"));
//     } else {
//       setError("");
//     }
//   };

//   const handleMobileNumberChange = (text: string) => {
//     if (text.length <= 10) {
//       setMobileNumber(text);
//       validateMobileNumber(text);
//     }
//   };

//   const validateNic = (nic: string) => {
//     const regex = /^(\d{12}|\d{9}V|\d{9}X|\d{9}v|\d{9}x)$/;
//     if (!regex.test(nic)) {
//       setEre(t("SignupForum.Enteravalidenic"));
//     } else {
//       setEre("");
//     }
//   };

//   const handleNicChange = (text: string) => {
//     setNic(text);
//     validateNic(text);
//   };

//   interface userItem {
//     phoneNumber: String;
//   }

//   // Validation for firstName and lastName (should start with a letter)
//   // const validateName = (
//   //   name: string,
//   //   setError: React.Dispatch<React.SetStateAction<string>>
//   // ) => {
//   //   const regex = /^[A-Za-z][A-Za-z0-9]*$/;
//   //   if (!regex.test(name)) {
//   //     setError(t("SignupForum.Startwithletter"));
//   //   } else {
//   //     setError("");
//   //   }
//   // };
//   const validateName = (
//     name: string,
//     setError: React.Dispatch<React.SetStateAction<string>>
//   ) => {
//     // Regex to accept only single words in English, Tamil, or Sinhala alphabets (no numbers or spaces)
//     const regex = /^[\p{L}\u0B80-\u0BFF\u0D80-\u0DFF]+$/u;

//     if (!regex.test(name)) {
//       setError(t("SignupForum.Startwithletter")); // Ensure your translation key handles this error message
//     } else {
//       setError("");
//     }
//   };

//   const handleFirstNameChange = (text: string) => {
//     setFirstName(text);
//     validateName(text, setFirstNameError);
//   };

//   const handleLastNameChange = (text: string) => {
//     setLastName(text);
//     validateName(text, setLastNameError);
//   };

//   const handleRegister = async () => {
//     if (!mobileNumber || !nic || !firstName || !lastName || !selectedCode) {
//       Alert.alert("Error", "Please fill in all fields.");
//       return;
//     }

//     try {
//       // Check if phoneNumber or NICnumber exists using signupChecker API
//       const checkApiUrl = `${environment.API_BASE_URL}api/auth/user-register-checker`; // Replace with actual URL of your signupChecker endpoint
//       const checkBody = {
//         phoneNumber: mobileNumber,
//         NICnumber: nic,
//       };

//       // Make the request to the signupChecker endpoint
//       const checkResponse = await axios.post(checkApiUrl, checkBody);

//       // Handle response from signupChecker
//       if (checkResponse.data.message === "This Phone Number already exists.") {
//         Alert.alert(t("SignupForum.error"), t("SignupForum.phoneExists"));
//         return;
//       } else if (checkResponse.data.message === "This NIC already exists.") {
//         Alert.alert(t("SignupForum.error"), t("SignupForum.nicExists"));
//         return;
//       } else if (
//         checkResponse.data.message ===
//         "This Phone Number and NIC already exist."
//       ) {
//         Alert.alert(t("SignupForum.error"), t("SignupForum.phoneNicExist"));
//         return;
//       }

//       // If phoneNumber and NICnumber are available, proceed with OTP request
//       const apiUrl = "https://api.getshoutout.com/otpservice/send";
//       const headers = {
//         Authorization:
//           // "Apikey eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NmM4NTZkMC04YmY2LTExZWQtODE0NS0yOTMwOGIyN2NlM2EiLCJzdWIiOiJTSE9VVE9VVF9BUElfVVNFUiIsImlhdCI6MTY3MjgxMjYxOCwiZXhwIjoxOTg4NDMxODE4LCJzY29wZXMiOnsiYWN0aXZpdGllcyI6WyJyZWFkIiwid3JpdGUiXSwibWVzc2FnZXMiOlsicmVhZCIsIndyaXRlIl0sImNvbnRhY3RzIjpbInJlYWQiLCJ3cml0ZSJdfSwic29fdXNlcl9pZCI6IjgzOTkzIiwic29fdXNlcl9yb2xlIjoidXNlciIsInNvX3Byb2ZpbGUiOiJhbGwiLCJzb191c2VyX25hbWUiOiIiLCJzb19hcGlrZXkiOiJub25lIn0.ayaQjSjBxcSSnqskZp_F_NlrLa_98ddiOi1lfK8WrJ4",
//           `Apikey ${environment.SHOUTOUT_API_KEY}`,
//         "Content-Type": "application/json",
//       };

//       const body = {
//         source: "ShoutDEMO",
//         transport: "sms",
//         content: {
//           sms: "Your code is {{code}}",
//         },
//         destination: mobileNumber,
//       };

//       const response = await axios.post(apiUrl, body, { headers });

//       console.log(
//         "hi.......this is response from shoutout.............:\n\n",
//         response.data
//       );
//       console.log(
//         "hi.......this is referenceId from shoutout.............:\n\n",
//         response.data.referenceId
//       );

//       await AsyncStorage.setItem("referenceId", response.data.referenceId);

//       // Navigate to the OTP screen with the mobile number and user details
//       navigation.navigate("OTPE", {
//         firstName: firstName,
//         lastName: lastName,
//         nic: nic,
//         mobileNumber: mobileNumber,
//       });
//     } catch (error) {
//       console.error("Error sending OTP:", error);
//       Alert.alert(t("SignupForum.error"), t("SignupForum.otpSendFailed"));
//     }
//   };

//   useEffect(() => {
//     if (
//       firstName &&
//       lastName &&
//       mobileNumber &&
//       nic &&
//       !error && // Ensure no mobile number error
//       !ere && // Ensure no NIC error
//       !firstNameError && // Ensure no first name error
//       !lastNameError // Ensure no last name error
//     ) {
//       setIsButtonDisabled(false); // Enable button if all fields are valid
//     } else {
//       setIsButtonDisabled(true); // Disable button otherwise
//     }
//   }, [
//     firstName,
//     lastName,
//     mobileNumber,
//     nic,
//     error,
//     ere,
//     firstNameError,
//     lastNameError,
//   ]);

//   //Define dynamic styles based on screen size
//   const dynamicStyles = {
//     imageHeight: screenWidth < 400 ? wp(30) : wp(50), // Adjust image size
//     imageWidth: screenWidth < 400 ? wp(30) : wp(50),
//     inputFieldsPaddingX: screenWidth < 400 ? wp(8) : wp(4),
//     paddingTopFromPhne: screenWidth < 400 ? wp(2) : wp(8),
//     paddingLeft: screenWidth < 400 ? wp(7) : wp(0),
//   };

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//       className="flex-1"
//     >
//       <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
//         <View className="flex-1">
//           <View className="bg-custom-green pt-0">
//             <View className="pt-3 pb-0">
//               <AntDesign
//                 name="left"
//                 size={24}
//                 color="#000502"
//                 onPress={() => navigation.navigate("Lanuage")}
//               />
//               <View className="items-center ">
//                 <Image
//                   source={logo2}
//                   // className="w-[218px] h-[243px] mb-2 mt-5"
//                   style={{
//                     width: dynamicStyles.imageWidth,
//                     height: dynamicStyles.imageHeight,
//                   }}
//                 />
//               </View>
//             </View>
//           </View>
//           <View className="flex-1 items-center pt-5 bg-white">
//             <Text className="font-bold" style={{ fontSize: wp(4) }}>
//               {t("SignupForum.FillAccountDetails")}
//             </Text>
//             <View
//               className="flex-1 w-full"
//               style={{ paddingHorizontal: dynamicStyles.inputFieldsPaddingX }}
//             >
//               <View className="flex-row gap-x-0 pt-5 items-center border-b border-gray-300">
//                 <View className="flex-row items-center flex-1 gap-x-1 ">
//                   <View className="pr-1">
//                     <PhoneInput
//                       defaultValue={mobileNumber}
//                       defaultCode="LK"
//                       layout="first"
//                       withShadow
//                       autoFocus
//                       textContainerStyle={{ paddingVertical: 0 }}
//                       value={mobileNumber}
//                       onChangeText={handleMobileNumberChange}
//                       onChangeFormattedText={(text) => {
//                         setMobileNumber(text);
//                       }}
//                     />
//                   </View>
//                 </View>
//               </View>
//               {error ? (
//                 <Text
//                   className="text-red-500"
//                   style={{ fontSize: wp(3), marginTop: wp(1) }}
//                 >
//                   {error}
//                 </Text>
//               ) : null}
//               <View style={{ marginTop: dynamicStyles.paddingTopFromPhne }}>
//                 <TextInput
//                   className="h-10 border-b border-gray-300 mb-5 text-base px-2"
//                   style={{ fontSize: wp(3) }}
//                   placeholder={t("SignupForum.FirstName")}
//                   placeholderTextColor="#2E2E2E"
//                   value={firstName}
//                   onChangeText={handleFirstNameChange}
//                 />
//                 {firstNameError ? (
//                   <Text
//                     className="text-red-500"
//                     style={{ fontSize: wp(3), marginTop: wp(-4) }}
//                   >
//                     {firstNameError}
//                   </Text>
//                 ) : null}
//                 <TextInput
//                   className="h-10 border-b border-gray-300 mb-5 text-base px-2"
//                   style={{ fontSize: wp(3) }}
//                   placeholder={t("SignupForum.LastName")}
//                   placeholderTextColor="#2E2E2E"
//                   value={lastName}
//                   onChangeText={handleLastNameChange}
//                 />
//                 {lastNameError ? (
//                   <Text
//                     className="text-red-500"
//                     style={{ fontSize: wp(3), marginTop: wp(-4) }}
//                   >
//                     {lastNameError}
//                   </Text>
//                 ) : null}
//                 <TextInput
//                   className="h-10 border-b border-gray-300 mb-5 text-base px-2"
//                   style={{ fontSize: wp(3) }}
//                   placeholder={t("SignupForum.NICNumber")}
//                   placeholderTextColor="#2E2E2E"
//                   value={nic}
//                   onChangeText={handleNicChange}
//                 />
//                 {ere ? (
//                   <Text
//                     className="text-red-500 mb-3"
//                     style={{ fontSize: wp(3), marginTop: wp(-4) }}
//                   >
//                     {ere}
//                   </Text>
//                 ) : null}
//               </View>
//             </View>
//             <View
//               className="flex-1 justify-center w-64 px-4 mt-0 pt-0"
//               style={{ paddingBottom: wp(5) }}
//             >
//               <TouchableOpacity
//                 className={`p-4 rounded-3xl mb-2 ${
//                   isButtonDisabled ? "bg-gray-400" : "bg-gray-900"
//                 }`} // Disable button styling
//                 onPress={handleRegister}
//                 disabled={isButtonDisabled} // Disable button if form is invalid
//               >
//                 <Text
//                   className="text-white text-center"
//                   style={{ fontSize: wp(3) }}
//                 >
//                   {t("SignupForum.SignUp")}
//                 </Text>
//               </TouchableOpacity>
//               <View
//                 className="flex-1 items-center flex-row pt-0 pb-4"
//                 style={{ paddingLeft: dynamicStyles.paddingLeft }}
//               >
//                 <Text style={{ fontSize: wp(3) }}>
//                   {t("SignupForum.AlreadyAccount")}?{" "}
//                 </Text>
//                 <TouchableOpacity>
//                   <Text
//                     className="text-blue-600 underline"
//                     style={{ fontSize: wp(3) }}
//                     onPress={() => navigation.navigate("SigninOldUser")}
//                   >
//                     {t("SignupForum.SignIn")}
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         </View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// };

// export default SignupForum;


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
} from "react-native";
import React, { useEffect, useState } from "react";
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

type SignupForumNavigationProp = StackNavigationProp<
  RootStackParamList,
  "SignupForum"
>;

interface SignupForumProps {
  navigation: SignupForumNavigationProp;
}

const logo2 = require("@/assets/images/logo2.png");

const SignupForum: React.FC<SignupForumProps> = ({ navigation }) => {
  const [firstName, setFirstName] = useState(""); // Fixed typo in setter name
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [nic, setNic] = useState("");
  const [error, setError] = useState("");
  const [ere, setEre] = useState("");
  const [selectedCode, setSelectedCode] = useState("+1"); // Default to a country code, e.g., '+1'
  const { t } = useTranslation();
  const [firstNameError, setFirstNameError] = useState(""); // Error state for first name
  const [lastNameError, setLastNameError] = useState(""); // Error state for last name
  const [isButtonDisabled, setIsButtonDisabled] = useState(true); // Button disabled state
  const screenWidth = wp(100);

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
    setNic(text);
    validateNic(text);
  };

  interface userItem {
    phoneNumber: String;
  }

  const validateName = (
    name: string,
    setError: React.Dispatch<React.SetStateAction<string>>
  ) => {
    // Regex to accept only single words in English, Tamil, or Sinhala alphabets (no numbers or spaces)
    const regex = /^[\p{L}\u0B80-\u0BFF\u0D80-\u0DFF]+$/u;

    if (!regex.test(name)) {
      setError(t("SignupForum.Startwithletter")); // Ensure your translation key handles this error message
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
    if (!mobileNumber || !nic || !firstName || !lastName || !selectedCode) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      // Check if phoneNumber or NICnumber exists using signupChecker API
      const checkApiUrl = `${environment.API_BASE_URL}api/auth/user-register-checker`; // Replace with actual URL of your signupChecker endpoint
      const checkBody = {
        phoneNumber: mobileNumber,
        NICnumber: nic,
      };

      // Make the request to the signupChecker endpoint
      const checkResponse = await axios.post(checkApiUrl, checkBody);

      // Handle response from signupChecker
      if (checkResponse.data.message === "This Phone Number already exists.") {
        Alert.alert(t("SignupForum.error"), t("SignupForum.phoneExists"));
        return;
      } else if (checkResponse.data.message === "This NIC already exists.") {
        Alert.alert(t("SignupForum.error"), t("SignupForum.nicExists"));
        return;
      } else if (
        checkResponse.data.message ===
        "This Phone Number and NIC already exist."
      ) {
        Alert.alert(t("SignupForum.error"), t("SignupForum.phoneNicExist"));
        return;
      }

      // If phoneNumber and NICnumber are available, proceed with OTP request
      const apiUrl = "https://api.getshoutout.com/otpservice/send";
      const headers = {
        Authorization:
          // "Apikey eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NmM4NTZkMC04YmY2LTExZWQtODE0NS0yOTMwOGIyN2NlM2EiLCJzdWIiOiJTSE9VVE9VVF9BUElfVVNFUiIsImlhdCI6MTY3MjgxMjYxOCwiZXhwIjoxOTg4NDMxODE4LCJzY29wZXMiOnsiYWN0aXZpdGllcyI6WyJyZWFkIiwid3JpdGUiXSwibWVzc2FnZXMiOlsicmVhZCIsIndyaXRlIl0sImNvbnRhY3RzIjpbInJlYWQiLCJ3cml0ZSJdfSwic29fdXNlcl9pZCI6IjgzOTkzIiwic29fdXNlcl9yb2xlIjoidXNlciIsInNvX3Byb2ZpbGUiOiJhbGwiLCJzb191c2VyX25hbWUiOiIiLCJzb19hcGlrZXkiOiJub25lIn0.ayaQjSjBxcSSnqskZp_F_NlrLa_98ddiOi1lfK8WrJ4",
          `Apikey ${environment.SHOUTOUT_API_KEY}`,
        "Content-Type": "application/json",
      };

      const body = {
        source: "ShoutDEMO",
        transport: "sms",
        content: {
          sms: "Your code is {{code}}",
        },
        destination: mobileNumber,
      };

      const response = await axios.post(apiUrl, body, { headers });

      console.log(
        "hi.......this is response from shoutout.............:\n\n",
        response.data
      );
      console.log(
        "hi.......this is referenceId from shoutout.............:\n\n",
        response.data.referenceId
      );

      await AsyncStorage.setItem("referenceId", response.data.referenceId);
      await AsyncStorage.setItem("firstName", firstName);
      await AsyncStorage.setItem("lastName", lastName);
      await AsyncStorage.setItem("nic", nic);
      await AsyncStorage.setItem("mobileNumber", mobileNumber);

      console.log("User details stored in AsyncStorage:");
      console.log("First Name:", firstName);
      console.log("Last Name:", lastName);
      console.log("NIC:", nic);
      console.log("Mobile Number:", mobileNumber);

      // Navigate to the OTP screen with the mobile number and user details
      navigation.navigate("OTPE", {
        firstName: firstName,
        lastName: lastName,
        nic: nic,
        mobileNumber: mobileNumber,
      });
    } catch (error) {
      console.error("Error sending OTP:", error);
      Alert.alert(t("SignupForum.error"), t("SignupForum.otpSendFailed"));
    }
  };

  useEffect(() => {
    if (
      firstName &&
      lastName &&
      mobileNumber &&
      nic &&
      !error && // Ensure no mobile number error
      !ere && // Ensure no NIC error
      !firstNameError && // Ensure no first name error
      !lastNameError // Ensure no last name error
    ) {
      setIsButtonDisabled(false); // Enable button if all fields are valid
    } else {
      setIsButtonDisabled(true); // Disable button otherwise
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
  ]);

  //Define dynamic styles based on screen size
  const dynamicStyles = {
    imageHeight: screenWidth < 400 ? wp(60) : wp(60), // Adjust image size
    imageWidth: screenWidth < 400 ? wp(55) : wp(65),
    inputFieldsPaddingX: screenWidth < 400 ? wp(8) : wp(4),
    paddingTopFromPhne: screenWidth < 400 ? wp(2) : wp(8),
    paddingLeft: screenWidth < 400 ? wp(5) : wp(0),
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1">
          <View className="bg-[#EDFFF0] pt-0 pb-8">
            <View className=" pb-0  ">
              <AntDesign
                style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
                name="left"
                size={24}
                color="#000502"
                onPress={() => navigation.navigate("Lanuage")}
              />
              <View className="items-center " >
                <Image
                  source={logo2}
                  // className="w-[218px] h-[243px] mb-2 mt-5"
                  style={{
                    width: dynamicStyles.imageWidth,
                    height: dynamicStyles.imageHeight,
                  }}
                />
              </View>
            </View>
          </View>
          <View className="flex-1 items-center pt-5 bg-white">
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
              </View>
            </View>
            <View
              className="flex-1 justify-center w-72 px-4 "
              style={{ paddingBottom: wp(5) }}
            >
              <TouchableOpacity
                className={`p-4 rounded-3xl mb-2 ${
                  isButtonDisabled ? "bg-gray-400" : "bg-gray-900"
                }`} // Disable button styling
                onPress={handleRegister}
                disabled={isButtonDisabled} // Disable button if form is invalid
              >
                <Text
                  className="text-white text-center"
                  style={{ fontSize: wp(4) }}
                >
                  {t("SignupForum.SignUp")}
                </Text>
              </TouchableOpacity>
              <View
                className="flex-1 items-center flex-row pt-0  "
                style={{ paddingLeft: dynamicStyles.paddingLeft }}
              >
                <Text className="">{t("SignupForum.AlreadyAccount")}? </Text>
                <TouchableOpacity>
                  <Text
                    className="text-blue-600 underline "
                    onPress={() => navigation.navigate("SigninOldUser")}
                  >
                    {t("SignupForum.SignIn")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignupForum;
