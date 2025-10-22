// import React, { useState, useRef, useCallback, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   Alert,
//   KeyboardAvoidingView,
//   Platform,
//   ActivityIndicator,
//   BackHandler,
// } from "react-native";
// import { AntDesign } from "@expo/vector-icons";
// import DropDownPicker from "react-native-dropdown-picker";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";
// import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
// import { environment } from "@/environment/environment";
// import { useTranslation } from "react-i18next";
// import i18n from "@/i18n/i18n";
// import { useFocusEffect } from "expo-router";
// interface RouteParams {
//   farmId: number;
// }

// interface AddnewStaffProps {
//   navigation: any;
//   route: {
//     params: RouteParams;
//   };
// }

// interface CountryItem {
//   label: string;
//   value: string;
//   flag: string;
// }

// interface PhoneInputProps {
//   value: string;
//   onChangeText: (text: string) => void;
//   countryCode: string;
//   onCountryCodeChange: (code: string) => void;
//   placeholder?: string;
//   label?: string;
//   error?: string | null;
//   onPhoneError: (error: string | null) => void;
// }

// const PhoneInput: React.FC<PhoneInputProps> = ({
//   value,
//   onChangeText,
//   countryCode,
//   onCountryCodeChange,
//   placeholder = "Enter Phone Number",
//   label = "Phone Number",
//   error,
//   onPhoneError,
// }) => {
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [checkingNumber, setCheckingNumber] = useState(false);
// const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//   const countryItems: CountryItem[] = [
//     { label: "+94", value: "+94", flag: "🇱🇰" },
//     { label: "+1", value: "+1", flag: "🇺🇸" },
//     { label: "+44", value: "+44", flag: "🇬🇧" },
//     { label: "+91", value: "+91", flag: "🇮🇳" },
//     { label: "+61", value: "+61", flag: "🇦🇺" },
//     { label: "+86", value: "+86", flag: "🇨🇳" },
//     { label: "+33", value: "+33", flag: "🇫🇷" },
//     { label: "+49", value: "+49", flag: "🇩🇪" },
//   ];

//   const getAuthToken = async () => {
//     try {
//       const token = await AsyncStorage.getItem("userToken");
//       if (!token) throw new Error("Authentication token not found");
//       return token;
//     } catch (error) {
//       console.error("Error getting auth token:", error);
//       return null;
//     }
//   };

//   const validatePhoneNumber = (phone: string, code: string): boolean => {
//     const cleanPhone = phone.replace(/\s+/g, '');
    
//     if (code === "+94") {
//       const phoneRegex = /^7\d{8}$/;
//       return phoneRegex.test(cleanPhone);
//     } else if (code === "+1") {
//       const phoneRegex = /^\d{10}$/;
//       return phoneRegex.test(cleanPhone);
//     } else {
//       const phoneRegex = /^\d{7,15}$/;
//       return phoneRegex.test(cleanPhone);
//     }
//   };

//   const formatPhoneNumber = (phone: string, code: string): string => {
//     const digits = phone.replace(/\D/g, '');
    
//     if (code === "+94") {
//       const cleanDigits = digits.startsWith('0') ? digits.slice(1) : digits;
//       return cleanDigits.slice(0, 9);
//     } else if (code === "+1") {
//       return digits.slice(0, 10);
//     } else {
//       return digits.slice(0, 10);
//     }
//   };

//   const checkPhoneNumber = async (phone: string, code: string) => {
//     if (!phone || !validatePhoneNumber(phone, code)) {
//       onPhoneError(null);
//       return;
//     }
    
//     const fullNumber = code + phone;
//     setCheckingNumber(true);
//     onPhoneError(null);
    
//     try {
//       const token = await getAuthToken();
//       if (!token) {
//         throw new Error("Authentication required");
//       }

//       await axios.post(
//         `${environment.API_BASE_URL}api/farm/members-phoneNumber-checker`,
//         { phoneNumber: fullNumber },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
      
//       onPhoneError(null);
//     } catch (error: any) {
//       if (error?.response?.status === 409) {
//         onPhoneError(t("Farms.This phone number is already registered"));
//       } else if (error?.response) {
//         onPhoneError(t("Farms.Error checking phone number"));
//       } else {
//         onPhoneError(null);
//       }
//     } finally {
//       setCheckingNumber(false);
//     }
//   };

//   const debouncedCheckNumber = useCallback(
//     (phone: string, code: string) => {
//       if (debounceTimeoutRef.current) {
//         clearTimeout(debounceTimeoutRef.current);
//       }
//       debounceTimeoutRef.current = setTimeout(() => {
//         checkPhoneNumber(phone, code);
//       }, 800);
//     },
//     []
//   );

//   const handlePhoneChange = (text: string) => {
//     const formattedPhone = formatPhoneNumber(text, countryCode);
//     onChangeText(formattedPhone);
//     debouncedCheckNumber(formattedPhone, countryCode);
//   };

//   useEffect(() => {
//     return () => {
//       if (debounceTimeoutRef.current) {
//         clearTimeout(debounceTimeoutRef.current);
//       }
//     };
//   }, []);

//   const isValid = !value || validatePhoneNumber(value, countryCode);
//   const { t } = useTranslation();

//   return (
//     <View className="ml-2 flex-1" style={{ zIndex: dropdownOpen ? 9999 : 1 }}>
//       <Text className="text-gray-900 text-base mb-2">{label}</Text>
      
//       <View className="flex-row gap-3 ">
//         <View className="w-24" style={{ zIndex: dropdownOpen ? 9999 : 1 }}>
//           <DropDownPicker
//             open={dropdownOpen}
//             value={countryCode}
//             items={countryItems}
//             setOpen={setDropdownOpen}
//             setValue={(callback) => {
//               const newValue = typeof callback === 'function' ? callback(countryCode) : callback;
//               onCountryCodeChange(newValue);
//               if (value) {
//                 debouncedCheckNumber(value, newValue);
//               }
//             }}
//             setItems={() => {}}
//             placeholder="+94"
//             showArrowIcon={true}
//             showTickIcon={false}
//             style={{
//               backgroundColor: "#F4F4F4",
//               borderWidth: 0,
//               borderRadius: 25,
//               height: 48,
//               paddingLeft: 12,
//               paddingRight: 8,
//             }}
//             textStyle={{ 
//               color: "#374151", 
//               fontSize: 16,
//             //  fontWeight: "500",
//               textAlign: "center"
//             }}
//             arrowIconStyle={{ width: 12, height: 12 }}
//             dropDownContainerStyle={{
//               backgroundColor: "#FFFFFF",
//               borderColor: "#E5E7EB",
//               borderWidth: 1,
//               borderRadius: 8,
//               marginTop: 2,
//               elevation: 10,
//               shadowColor: "#000",
//               shadowOffset: { width: 0, height: 4 },
//               shadowOpacity: 0.3,
//               shadowRadius: 5,
//               zIndex: 10000,
//               position: "absolute",
//               top: 50,
//               left: 0,
//               width: 120,
//               maxHeight: 200,
//             }}
//             listItemLabelStyle={{ fontSize: 14, color: "#374151", textAlign: "center" }}
//             selectedItemLabelStyle={{ color: "#2563EB", fontWeight: "600" }}
//             listItemContainerStyle={{
//               paddingVertical: 8,
//               paddingHorizontal: 4,
//             }}
//             renderListItem={({ item, onPress }) => {
//               const countryItem = item as CountryItem;
//               return (
//                 <TouchableOpacity 
//                   className="py-2 px-3 flex-row items-center justify-center bg-transparent"
//                   onPress={() => {
//                     onCountryCodeChange(countryItem.value);
//                     setDropdownOpen(false);
//                   }}
//                   activeOpacity={0.7}
//                 >
//                   <Text className="mr-1.5 text-sm">{countryItem.flag}</Text>
//                   <Text className="text-sm text-gray-700 font-medium">{countryItem.label}</Text>
//                 </TouchableOpacity>
//               );
//             }}
//             listMode="SCROLLVIEW"
//             closeAfterSelecting={true}
//             onClose={() => setDropdownOpen(false)}
//             scrollViewProps={{
//               nestedScrollEnabled: true,
//               showsVerticalScrollIndicator: false,
//             }}
//           />
//         </View>

//         <View className="flex-1" style={{ zIndex: dropdownOpen ? -1 : 1 }}>
//           <TextInput
//             value={value}
//             onChangeText={handlePhoneChange}
//             placeholder={placeholder}
//             placeholderTextColor="#9CA3AF"
//             className="bg-gray-100 px-4 py-3 rounded-full text-base text-gray-700 h-12"
//             keyboardType="phone-pad"
//             editable={!dropdownOpen}
//           />
//         </View>
//       </View>
      
//       {checkingNumber && (
//         <View className="flex-row items-center mt-1 ml-3">
//           <ActivityIndicator size="small" color="#2563EB" />
//           <Text className="text-blue-600 text-sm ml-2">{t("Farms.Checking number...")}</Text>
//         </View>
//       )}
//       {error && (
//         <Text className="text-red-500 text-sm mt-1 ml-3">
//           {error}
//         </Text>
//       )}
//       {!isValid && value && (
//         <Text className="text-red-500 text-sm mt-1 ml-3">
//           {t("Farms.Please enter a valid phone number for")}
//         </Text>
//       )}
//     </View>
//   );
// };

// const AddnewStaff: React.FC<AddnewStaffProps> = ({ navigation, route }) => {
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [countryCode, setCountryCode] = useState("+94");
//   const [selectedRole, setSelectedRole] = useState("");
//   const [roleOpen, setRoleOpen] = useState(false);
//   const [phoneError, setPhoneError] = useState<string | null>(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const { farmId } = route.params;
//   const { t } = useTranslation();

//   const roleItems = [
//     { label: t("Farms.Manager"), value: "Manager" },
//     { label: t("Farms.Supervisor"), value: "Supervisor" },
//     { label: t("Farms.Worker"), value: "Laborer" },
//   ];

//   const getAuthToken = async () => {
//     try {
//       const token = await AsyncStorage.getItem("userToken");
//       if (!token) throw new Error("Authentication token not found");
//       return token;
//     } catch (error) {
//       console.error("Error getting auth token:", error);
//       throw error;
//     }
//   };

//    const resetFormState = useCallback(() => {
//     setFirstName("");
//     setLastName("");
//     setPhoneNumber("");
//     setCountryCode("+94");
//     setSelectedRole("");
//     setRoleOpen(false);
//     setPhoneError(null);
//     setIsSubmitting(false);
//   }, []);

//   const validateForm = () => {
//     if (!firstName.trim()) {
//       Alert.alert(t("Farms.Sorry"), t("Farms.Please enter first name"),  [{ text: t("Farms.okButton") }]);
//       return false;
//     }
//     if (!lastName.trim()) {
//       Alert.alert(t("Farms.Sorry"), t("Farms.Please enter last name"),  [{ text: t("Farms.okButton") }]);
//       return false;
//     }
//     if (!phoneNumber.trim()) {
//       Alert.alert(t("Farms.Sorry"), t("Farms.Please enter phone number"),  [{ text: t("Farms.okButton") }]);
//       return false;
//     }
//     if (!selectedRole) {
//       Alert.alert(t("Farms.Sorry"), t("Farms.Please select a role"),  [{ text: t("Farms.okButton") }]);
//       return false;
//     }
//     if (phoneError) {
//       Alert.alert(t("Farms.Sorry"), phoneError,  [{ text: t("Farms.okButton") }]);
//       return false;
//     }

//     const cleanPhone = phoneNumber.replace(/\s+/g, '');
//     if (countryCode === "+94" && !/^7\d{8}$/.test(cleanPhone)) {
//       Alert.alert(t("Farms.Sorry"), t("Farms.Please enter a valid Sri Lankan phone number"),  [{ text: t("Farms.okButton") }]);
//       return false;
//     }

//     return true;
//   };

//   const handleSave = async () => {
//     if (!validateForm()) {
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const token = await getAuthToken();
      
//       const staffData = {
//         firstName: firstName.trim(),
//         lastName: lastName.trim(),
//         phoneNumber: phoneNumber.trim(),
//         countryCode: countryCode,
//         role: selectedRole,
//         farmId: farmId
//       };

//       const response = await axios.post(
//         `${environment.API_BASE_URL}api/farm/create-new-staffmember/${farmId}`,
//         staffData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       // Alert.alert(
//       //   t("Farms.Success"), 
//       //   t("Farms.Staff members has been added successfully!"),
//       //   [{ text: "OK", onPress: () => navigation.goBack() }]
//       // );
//        Alert.alert(
//         t("Farms.Success"), 
//         `${t("Farms.Staff members has been added successfully!")}`,
//         [{
//           text: t("Farms.OK"),
//           onPress: () => {
//             navigation.navigate("EditManagersScreen", { 
           
//               farmId, 
           
//             });
//           }
//         }]
//       );
//     } catch (error: any) {
//       console.error("Error in handleSave:", error);
//       let errorMessage = t("Farms.Failed to add staff member. Please try again.");
      
//       if (error.response) {
//         errorMessage = error.response.data?.message || errorMessage;
//       } else if (error.request) {
//         errorMessage = t("Farms.Network error. Please check your connection.");
//       }
      
//       Alert.alert("Error", errorMessage,[{ text: t("Farms.okButton") }]);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//     useFocusEffect(
//           useCallback(() => {

//             resetFormState();

//             const handleBackPress = () => {
//              navigation.navigate("Main", { 
//     screen: "EditManagersScreen",
//    params: { farmId: farmId }
//   })
//               return true;
//             };
        
//             const subscription = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
                      
//                             return () => subscription.remove();
//           }, [navigation])
//         );

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//       className="bg-white"
//       style={{ flex: 1 }}
//     >
//       <View className="flex-row items-center justify-between px-6 pb-2 mt-3 py-3">
//         <View className="flex-row items-center justify-between mb-2">
//           <TouchableOpacity
//            // onPress={() => navigation.goBack()}
//             onPress={() => navigation.navigate("Main", { 
//     screen: "EditManagersScreen",
//    params: { farmId: farmId }
//   })} 
//             hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
//             disabled={isSubmitting}
//           >
//             <AntDesign name="left" size={24} color={isSubmitting ? "#9CA3AF" : "black"} />
//           </TouchableOpacity>
//           <View className="flex-1 items-center">
//             <Text className="text-black text-xl font-semibold"
//               style={[
//   i18n.language === "si"
//     ? { fontSize: 16 }
//     : i18n.language === "ta"
//     ? { fontSize: 13 }
//     : { fontSize: 17 }
// ]}
//             >
//               {t("Farms.Add New Staff Member")}
//             </Text>
//           </View>
//         </View>
//         <View className="w-8" />
//       </View>

//       <ScrollView
//         contentContainerStyle={{ paddingBottom: 24 }}
//         className="flex-1 bg-white"
//         keyboardShouldPersistTaps="handled"
//       >
//         <View className="px-8 gap-6 pt-3">
//           <View className="gap-2">
//             <Text className="text-gray-900 text-base">{t("Farms.First Name")}</Text>
//             <TextInput
//               className="bg-gray-100 px-4 py-3 rounded-full text-base text-gray-700"
//               placeholder={t("Farms.Enter First Name")}
//               placeholderTextColor="#9CA3AF"
//               value={firstName}
//               onChangeText={setFirstName}
//               autoCapitalize="words"
//               editable={!isSubmitting}
//             />
//           </View>

//           <View className="gap-2">
//             <Text className="text-gray-900 text-base">{t("Farms.Last Name")}</Text>
//             <TextInput
//               className="bg-gray-100 px-4 py-3 rounded-full text-base text-gray-700"
//               placeholder={t("Farms.Enter Last Name")}
//               placeholderTextColor="#9CA3AF"
//               value={lastName}
//               onChangeText={setLastName}
//               autoCapitalize="words"
//               editable={!isSubmitting}
//             />
//           </View>

//            <View className="gap-2">

//           <PhoneInput
//             value={phoneNumber}
//             onChangeText={setPhoneNumber}
//             countryCode={countryCode}
//             onCountryCodeChange={setCountryCode}
//             placeholder={t("Farms.Enter Phone Number")}
//             label={t("Farms.Phone Number")}
//             error={phoneError}
//             onPhoneError={setPhoneError}
//           />
//           </View>

//           <View className="gap-2" style={{ zIndex: roleOpen ? 9999 : 1 }}>
//             <Text className="text-gray-900 text-base">{t("Farms.Role")}</Text>
//             <DropDownPicker
//               open={roleOpen}
//               value={selectedRole}
//               items={roleItems}
//               setOpen={setRoleOpen}
//               setValue={setSelectedRole}
//               setItems={() => {}}
//               placeholder={t("Farms.Select Role")}
//               placeholderStyle={{ color: "#9CA3AF", fontSize: 16 }}
//               style={{
//                 backgroundColor: "#F4F4F4",
//                 borderColor: "#F4F4F4",
//                 borderRadius: 25,
//                 minHeight: 48,
//                 paddingHorizontal: 16,
//               }}
//               textStyle={{ color: "#374151", fontSize: 16 }}
//               dropDownContainerStyle={{
//                 backgroundColor: "#FFFFFF",
//                 borderColor: "#E5E7EB",
//                 borderRadius: 8,
//                 marginTop: 4,
//               }}
//               listMode="SCROLLVIEW"
//               closeAfterSelecting={true}
//               disabled={isSubmitting}
//             />
//           </View>
//         </View>

//         <View className="pt-10 pb-4 px-[15%]">
//           <TouchableOpacity
//             onPress={handleSave}
//             className={`${isSubmitting ? 'bg-gray-400' : 'bg-black'} rounded-full py-3 items-center justify-center`}
//             activeOpacity={0.8}
//             disabled={isSubmitting}
//           >
//             {isSubmitting ? (
//               <View className="flex-row items-center">
//                 <ActivityIndicator size="small" color="white" />
//                 <Text className="text-white text-lg font-semibold ml-2">
//                   {t("Farms.Saving...")}
//                 </Text>
//               </View>
//             ) : (
//               <Text className="text-white text-lg font-semibold">
//                 {t("Farms.Save")}
//               </Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// };

// export default AddnewStaff;

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  BackHandler,
  Keyboard,
  StatusBar,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n/i18n";
import { useFocusEffect } from "@react-navigation/native";
import countryData from '../../assets/jsons/countryflag.json';

interface RouteParams {
  farmId: number;
}

interface AddnewStaffProps {
  navigation: any;
  route: {
    params: RouteParams;
  };
}

interface CountryItem {
  label: string;
  value: string;
  countryName: string;
  flag: string;
  dialCode: string;
}

const AddnewStaff: React.FC<AddnewStaffProps> = ({ navigation, route }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+94");
  const [selectedRole, setSelectedRole] = useState("");
  const [roleOpen, setRoleOpen] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingNumber, setCheckingNumber] = useState(false);
  const [nicDuplicateErrors, setNicDuplicateErrors] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [nicErrors, setNicErrors] = useState<string | null>(null);
  const [checkingNIC, setCheckingNIC] = useState(false);
  const [nic, setNicNumber] = useState("");
  
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
  
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const { farmId } = route.params;
  const { t } = useTranslation();

  const roleItems = [
    { label: t("Farms.Manager"), value: "Manager" },
    { label: t("Farms.Supervisor"), value: "Supervisor" },
    { label: t("Farms.Worker"), value: "Laborer" },
  ];

  // Full format items for modal
  const fullFormatItems = countryData.map((country) => ({
    label: `${country.emoji} ${country.name} (${country.dial_code})`,
    value: country.dial_code,
    countryName: country.name,
    flag: country.emoji,
    dialCode: country.dial_code,
  }));

  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) throw new Error("Authentication token not found");
      return token;
    } catch (error) {
      console.error("Error getting auth token:", error);
      throw error;
    }
  };

  const validateSriLankanPhoneNumber = (number: string): boolean => {
    const cleanNumber = number.replace(/\D/g, '');
    const isValid = /^7\d{8}$/.test(cleanNumber);
    return isValid;
  };

  const formatPhoneInput = (text: string): string => {
    let digits = text.replace(/\D/g, '');
    digits = digits.slice(0, 9);
    return digits;
  };

  const checkPhoneNumber = async (fullNumber: string) => {
    if (!fullNumber || fullNumber.length < 10) {
      setPhoneError(null);
      return;
    }
    
    setCheckingNumber(true);
    setPhoneError(null);
    
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      await axios.post(
        `${environment.API_BASE_URL}api/farm/members-phoneNumber-checker`,
        { phoneNumber: fullNumber },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setPhoneError(null);
    } catch (error: any) {
      if (error?.response?.status === 409) {
        setPhoneError(t("Farms.This phone number is already registered"));
      } else if (error?.response) {
        setPhoneError(t("Farms.Error checking phone number"));
      } else {
        setPhoneError(null);
      }
    } finally {
      setCheckingNumber(false);
    }
  };

  const debouncedCheckNumber = useCallback(
    (number: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(() => {
        checkPhoneNumber(number);
      }, 800);
    },
    []
  );

  const handlePhoneChange = (text: string) => {
    const digitsOnly = text.replace(/\D/g, '');
    setPhoneError(null);

    if (digitsOnly.length > 9) {
      setValidationError(t("Farms.Phone number cannot exceed 9 digits"));
      const formattedText = formatPhoneInput(text);
      setPhoneNumber(formattedText);
      return;
    }

    const formattedText = formatPhoneInput(text);
    setPhoneNumber(formattedText);
    
    setValidationError(null);

    if (formattedText.length > 0) {
      if (formattedText[0] !== '7') {
        setValidationError(t("Farms.Phone number must start with 7"));
      } else if (formattedText.length < 9) {
        setValidationError(t("Farms.Phone number must be exactly 9 digits"));
      } else if (!validateSriLankanPhoneNumber(formattedText)) {
        setValidationError(t("Farms.Please enter a valid phone number"));
      } else {
        setValidationError(null);
      }
    } else {
      setValidationError(null);
    }

    const fullNumber = countryCode + formattedText;
    if (fullNumber && fullNumber.length > 5 && formattedText[0] === '7' && formattedText.length === 9) {
      debouncedCheckNumber(fullNumber);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const resetFormState = useCallback(() => {
    setFirstName("");
    setLastName("");
    setPhoneNumber("");
    setCountryCode("+94");
    setSelectedRole("");
    setRoleOpen(false);
    setPhoneError(null);
    setIsSubmitting(false);
    setCheckingNumber(false);
    setValidationError(null);
    setNicNumber("");
    setNicErrors(null);
    setCheckingNIC(false);
    setNicDuplicateErrors(null);
    setCountryCodeOpen(false);
  }, []);

  useEffect(() => {
    resetFormState();
  }, []);

  const validateForm = () => {
    if (!firstName.trim()) {
      Alert.alert(t("Farms.Sorry"), t("Farms.Please enter first name"), [{ text: t("Farms.okButton") }]);
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert(t("Farms.Sorry"), t("Farms.Please enter last name"), [{ text: t("Farms.okButton") }]);
      return false;
    }
    if (!phoneNumber.trim()) {
      Alert.alert(t("Farms.Sorry"), t("Farms.Please enter phone number"), [{ text: t("Farms.okButton") }]);
      return false;
    }
    if (!nic.trim()) {
      Alert.alert(t("Farms.Sorry"), t("Farms.Please enter NIC"), [{ text: t("Farms.okButton") }]);
      return false;
    }

    if (!validateSriLankanPhoneNumber(phoneNumber)) {
      if (phoneNumber.length !== 9) {
        Alert.alert(t("Farms.Sorry"), t("Farms.Phone number must be exactly 9 digits"), [{ text: t("Farms.okButton") }]);
      } else if (phoneNumber[0] !== '7') {
        Alert.alert(t("Farms.Sorry"), t("Farms.Phone number must start with 7"), [{ text: t("Farms.okButton") }]);
      } else if (phoneNumber.length > 9) {
        Alert.alert(t("Farms.Sorry"), t("Farms.Phone number cannot exceed 9 digits"), [{ text: t("Farms.okButton") }]);
      } else {
        Alert.alert(t("Farms.Sorry"), t("Farms.Please enter a valid phone number"), [{ text: t("Farms.okButton") }]);
      }
      return false;
    }
    
    if (!selectedRole) {
      Alert.alert(t("Farms.Sorry"), t("Farms.Please select a role"), [{ text: t("Farms.okButton") }]);
      return false;
    }
    if (phoneError) {
      Alert.alert(t("Farms.Sorry"), phoneError, [{ text: t("Farms.okButton") }]);
      return false;
    }
    if (validationError) {
      Alert.alert(t("Farms.Sorry"), validationError, [{ text: t("Farms.okButton") }]);
      return false;
    }

    if (nicErrors) {
      Alert.alert(t("Farms.Sorry"), t("Farms.Please enter a valid Sri Lankan NIC"), [{ text: t("Farms.okButton") }]);
      return false;
    }
    if (nicDuplicateErrors) {
      Alert.alert(t("Farms.Sorry"), t("Farms.This NIC is already used by another staff member"), [{ text: t("Farms.okButton") }]);
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    Keyboard.dismiss();

    try {
      const token = await getAuthToken();
      
      const staffData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber,
        countryCode: countryCode,
        role: selectedRole,
        farmId: farmId,
        nic: nic.trim() 
      };

      const response = await axios.post(
        `${environment.API_BASE_URL}api/farm/create-new-staffmember/${farmId}`,
        staffData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      Alert.alert(
        t("Farms.Success"), 
        `${t("Farms.Staff members has been added successfully!")}`,
        [{
          text: t("Farms.OK"),
          onPress: () => {
            navigation.navigate("Main", { 
              screen: "EditManagersScreen",
              params: { farmId }
            });
          }
        }]
      );
    } catch (error: any) {
      console.error("Error in handleSave:", error);
      let errorMessage = t("Farms.Failed to add staff member. Please try again.");
      
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = t("Farms.Network error. Please check your connection.");
      }
      
      Alert.alert("Error", errorMessage, [{ text: t("Farms.okButton") }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      resetFormState();

      const handleBackPress = () => {
        navigation.navigate("Main", { 
          screen: "EditManagersScreen",
          params: { farmId: farmId }
        });
        return true;
      };

      const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
      
      return () => {
        backHandler.remove();
      };
    }, [navigation, farmId, resetFormState])
  );

  const handleNicChange = (nicValue: string) => {
    const formattedNic = nicValue.replace(/\s/g, '').toUpperCase();
    setNicNumber(formattedNic);
    setNicDuplicateErrors(null);

    if (formattedNic && !validateSriLankanNic(formattedNic)) {
      setNicErrors(t("Farms.Please enter a valid Sri Lankan NIC"));
    } else {
      setNicErrors(null);
    }
    if (formattedNic.length >= 10) {
      debouncedCheckNic(formattedNic);
    }
  };

  const validateSriLankanNic = (nic: string): boolean => {
    if (!nic) return false;
    
    const cleanNic = nic.replace(/\s/g, '').toUpperCase();
    
    const oldFormat = /^[0-9]{9}[VX]$/;
    const newFormat = /^[0-9]{12}$/;
    
    return oldFormat.test(cleanNic) || newFormat.test(cleanNic);
  };

  const debouncedCheckNic = useCallback(
    (nic: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(() => {
        console.log('Debounced NIC check for:', nic);
        checkNic(nic);
      }, 800);
    },
    []
  );

  const checkNic = async (nic: string) => {
    console.log('Checking NIC:', nic);
    
    setCheckingNIC(true);
    setNicDuplicateErrors(null);

    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      await axios.post(
        `${environment.API_BASE_URL}api/farm/members-nic-checker`,
        { nic: nic },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNicDuplicateErrors(null);
    } catch (error: any) {
      if (error?.response?.status === 409) {
        setNicDuplicateErrors(t("Farms.This NIC is already used by another staff member"));
      } else if (error?.response) {
        setNicDuplicateErrors(t("Farms.Error checking NIC number"));
      } else {
        setNicDuplicateErrors(null);
      }
    } finally {
      setCheckingNIC(false);
    }
  };

  const handleCountryCodeOpen = (isOpen: boolean) => {
    if (isOpen) {
      setCountryCodeItems(fullFormatItems);
    } else {
      setCountryCodeItems(
        countryData.map((country) => ({
          label: country.emoji,
          value: country.dial_code,
          countryName: country.name,
          flag: country.emoji,
          dialCode: country.dial_code,
        }))
      );
    }
    setCountryCodeOpen(isOpen);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="bg-white"
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        className="flex-1 bg-white"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row items-center justify-between px-6 pb-2 mt-3 py-3">
          <View className="flex-row items-center justify-between mb-2">
            <TouchableOpacity
              onPress={() => navigation.navigate("Main", { 
                screen: "EditManagersScreen",
                params: { farmId: farmId }
              })} 
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              disabled={isSubmitting}
            >
              <AntDesign name="left" size={24} color={isSubmitting ? "#9CA3AF" : "black"} />
            </TouchableOpacity>
            <View className="flex-1 items-center">
              <Text className="text-black text-xl font-semibold"
                style={[
                  i18n.language === "si"
                    ? { fontSize: 16 }
                    : i18n.language === "ta"
                    ? { fontSize: 13 }
                    : { fontSize: 17 }
                ]}
              >
                {t("Farms.Add New Staff Member")}
              </Text>
            </View>
          </View>
          <View className="w-8" />
        </View>

        <View className="px-8 gap-6 pt-3">
          <View className="gap-2" style={{ zIndex: roleOpen ? 9999 : 1 }}>
            <Text className="text-gray-900 text-base">{t("Farms.Role")}</Text>
            <DropDownPicker
              open={roleOpen}
              value={selectedRole}
              items={roleItems}
              setOpen={setRoleOpen}
              setValue={setSelectedRole}
              setItems={() => {}}
              placeholder={t("Farms.Select Role")}
              placeholderStyle={{ color: "#9CA3AF", fontSize: 16 }}
              style={{
                backgroundColor: "#F4F4F4",
                borderColor: "#F4F4F4",
                borderRadius: 25,
                minHeight: 48,
                paddingHorizontal: 16,
              }}
              textStyle={{ color: "#374151", fontSize: 16 }}
              dropDownContainerStyle={{
                backgroundColor: "#FFFFFF",
                borderColor: "#E5E7EB",
                borderRadius: 8,
                marginTop: 4,
                marginLeft: 8,
                marginRight: 8,
              }}
              listMode="SCROLLVIEW"
              closeAfterSelecting={true}
              disabled={isSubmitting}
            />
          </View>

          <View className="gap-2">
            <Text className="text-gray-900 text-base">{t("Farms.First Name")}</Text>
            <TextInput
              className="bg-gray-100 px-4 py-3 rounded-full text-base text-gray-700"
              placeholder={t("Farms.Enter First Name")}
              placeholderTextColor="#9CA3AF"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              editable={!isSubmitting}
            />
          </View>

          <View className="gap-2">
            <Text className="text-gray-900 text-base">{t("Farms.Last Name")}</Text>
            <TextInput
              className="bg-gray-100 px-4 py-3 rounded-full text-base text-gray-700"
              placeholder={t("Farms.Enter Last Name")}
              placeholderTextColor="#9CA3AF"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              editable={!isSubmitting}
            />
          </View>

          <View className="gap-2">
            <Text className="text-gray-900 text-base">{t("Farms.Phone Number")}</Text>
            <View className="flex-row items-center space-x-2">
              {/* Country Code Picker */}
              <View style={{ width: wp(25), marginRight: 8, zIndex: 2000 }}>
                <DropDownPicker
                  open={countryCodeOpen}
                  value={countryCode}
                  items={countryCodeItems}
                  setOpen={(value) => {
                    const newOpen = typeof value === 'function' ? value(countryCodeOpen) : value;
                    handleCountryCodeOpen(newOpen);
                  }}
                  setValue={setCountryCode}
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
                    borderWidth: 0,
                    backgroundColor: "#F4F4F4",
                    borderRadius: 25,
                    height: hp(7),
                    minHeight: hp(7),
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
                  disabled={isSubmitting}
                />
              </View>

              {/* Phone Number Input */}
              <View style={{ flex: 1 }}>
                <TextInput
                  className="bg-[#F4F4F4] rounded-full px-4"
                  placeholder="7X XXXXXXX"
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  maxLength={9}
                  style={{
                    height: hp(7),
                    fontSize: 14,
                    borderWidth: 0,
                  }}
                  underlineColorAndroid="transparent"
                  cursorColor="#141415ff"
                  editable={!isSubmitting}
                />
              </View>
            </View>
            
            {checkingNumber && (
              <View className="flex-row items-center mt-1 ml-3">
                <ActivityIndicator size="small" color="#2563EB" />
                <Text className="text-blue-600 text-sm ml-2">{t("Farms.Checking number...")}</Text>
              </View>
            )}
            {phoneError && (
              <Text className="text-red-500 text-sm mt-1 ml-3">
                {phoneError}
              </Text>
            )}
            {validationError && (
              <Text className="text-red-500 text-sm mt-1 ml-3">
                {validationError}
              </Text>
            )}
          </View>

          <View className="gap-2">
            <Text className="text-gray-900 text-base">{t("Farms.NIC")}</Text>
            <TextInput
              value={nic}
              onChangeText={(text: string) => handleNicChange(text)}
              placeholder={t("Farms.Enter NIC")}
              placeholderTextColor="#9CA3AF"
              className="bg-[#F4F4F4] p-3 rounded-full text-gray-800"
              editable={!isSubmitting}
              autoCapitalize="characters"
              maxLength={12}
            />
            {checkingNIC && (
              <View className="flex-row items-center mt-1 ml-3">
                <ActivityIndicator size="small" color="#2563EB" />
                <Text className="text-blue-600 text-sm ml-2">{t("Farms.Checking NIC...")}</Text>
              </View>
            )}
            {nicErrors && (
              <Text className="text-red-500 text-sm mt-1 ml-3">
                {nicErrors}
              </Text>
            )}
            {nicDuplicateErrors && (
              <Text className="text-red-500 text-sm mt-1 ml-3">
                {nicDuplicateErrors}
              </Text>
            )}
          </View>
        </View>

        <View className="pt-10 pb-32 px-[15%]">
          <TouchableOpacity
            onPress={handleSave}
            className={`${isSubmitting || checkingNumber || checkingNIC ? 'bg-gray-400' : 'bg-black'} rounded-full py-3 items-center justify-center`}
            activeOpacity={0.8}
            disabled={isSubmitting || checkingNumber || checkingNIC}
          >
            {isSubmitting ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white text-lg font-semibold ml-2">
                  {t("Farms.Saving...")}
                </Text>
              </View>
            ) : (
              <Text className="text-white text-lg font-semibold">
                {t("Farms.Save")}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddnewStaff;