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
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import PhoneInput from '@linhnguyen96114/react-native-phone-input';
import codeMapJson from '../../assets/jsons/codeMap.json';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { environment } from "@/environment/environment";
import LottieView from "lottie-react-native";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import i18n from "i18next";
import { s } from "react-native-size-matters";
import { get } from "lodash";

type RouteParams = {
  farmId: number;
  staffMemberId?: number;
  membership: string;
  renew: string;
};

interface EditStaffMemberProps {
  navigation: any;
  route: {
    params: RouteParams;
  };
}

// Define the staff member data interface
interface StaffMemberData {
  id: number;
  ownerId: number;
  farmId: number;
  firstName: string;
  lastName: string;
  phoneCode: string;
  phoneNumber: string;
  role: string;
  image: string | null;
  createdAt: string;
  nic: string;
}

interface FarmDetailsResponse extends StaffMemberData {}

const EditStaffMember: React.FC<EditStaffMemberProps> = ({ navigation, route }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [nic, setNic] = useState("");
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+94");
  console.log('countryCode:', countryCode);
  const [selectedRole, setSelectedRole] = useState("");
  const [roleOpen, setRoleOpen] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingNumber, setCheckingNumber] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { farmId, staffMemberId, membership, renew } = route.params;
  const selectedLanguage = i18n.language;

  const phoneInputRef = useRef<any>(null);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Changed to store single staff member data
  const [staffData, setStaffData] = useState<StaffMemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const [nicErrors, setNicErrors] = useState<string | null>(null);
  const [checkingNIC, setCheckingNIC] = useState(false);
  const [nicduplicateErrors, setNicDuplicateErrors] = useState<string | null>(null);
  console.log('staffMemberId:', staffMemberId);

  useFocusEffect(
    useCallback(() => {
      setRoleOpen(false);
        fetchStaffMember();
        setValidationError(null);
  }, [staffMemberId])
  );

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

  // Validate Sri Lankan phone number format
  const validateSriLankanPhoneNumber = (number: string): boolean => {
    // Remove all non-digit characters
    const cleanNumber = number.replace(/\D/g, '');
    
    // Check if number starts with 7 and has exactly 9 digits
    const isValid = /^7\d{8}$/.test(cleanNumber);
    return isValid;
  };

  // Format phone number input to enforce 9 digits starting with 7
  const formatPhoneInput = (text: string): string => {
    // Remove all non-digit characters
    let digits = text.replace(/\D/g, '');
    
    // If first digit is not 7 and there are digits, force it to start with 7
    if (digits.length > 0 && digits[0] !== '7') {
      digits = '7' + digits.slice(1); // Replace first digit with 7
    }
    
    // Limit to 9 digits maximum
    digits = digits.slice(0, 9);
    
    return digits;
  };

  console.log('phoneNumber:', phoneNumber);
  console.log('formattedPhoneNumber:', formattedPhoneNumber);

  const checkPhoneNumber = async (fullNumber: string) => {
    console.log('Checking phone number:', fullNumber);
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

  const debouncedCheckNumber = useCallback(
    (number: string) => {

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(() => {
        console.log('Debounced phone number check for:', number);
        checkPhoneNumber(number);
      }, 800);
    },
    []
  );
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
//   const handlePhoneChange = (text: string) => {
//   // Remove all non-digit characters
//   const digitsOnly = text.replace(/\D/g, '');
  
//   // Check if user is trying to enter more than 9 digits
//   if (digitsOnly.length > 9) {
//     setValidationError(t("Farms.Phone number cannot exceed 9 digits"));
//     // Only keep first 9 digits
//     const limitedDigits = digitsOnly.slice(0, 9);
//     setPhoneNumber(limitedDigits);
//     return;
//   }
  
//   // Update phone number state
//   setPhoneNumber(digitsOnly);
  
//   // Clear previous errors
//   setValidationError(null);
  
//   // Real-time validation feedback
//   if (digitsOnly.length > 0) {
//     if (digitsOnly.length < 9) {
//       setValidationError(t("Farms.Phone number must be exactly 9 digits"));
//     } else if (digitsOnly[0] !== '7') {
//       setValidationError(t("Farms.Phone number must start with 7"));
//     } else {
//       setValidationError(null);
//       // Only check for duplicates if format is valid
//       if (formattedPhoneNumber && formattedPhoneNumber.length >= 10) {
//         debouncedCheckNumber(formattedPhoneNumber);
//       }
//     }
//   }
// };

const handlePhoneChange = (text: string) => {
  // Remove all non-digit characters
  const digitsOnly = text.replace(/\D/g, '');

  // Limit to 9 digits
  // const limitedDigits = digitsOnly.slice(0, 9);
  setPhoneNumber(digitsOnly);

  // Validation
  if (digitsOnly.length < 9) {
    setValidationError(t("Farms.Phone number must be exactly 9 digits"));
  } else if (digitsOnly[0] !== '7') {
    setValidationError(t("Farms.Phone number must start with 7"));
  } else if (digitsOnly.length > 9) {
    setValidationError(t("Farms.Phone number cannot exceed 9 digits"));
  } else {
    setValidationError(null);

    // Construct formatted number for checking
    const formatted = `${countryCode}${digitsOnly}`;
    setFormattedPhoneNumber(formatted);

    // Only check duplicates if number + code is different from original
    if (staffData) {
      const originalFullNumber = `${staffData.phoneCode}${staffData.phoneNumber}`;
      if (originalFullNumber !== formatted) {
        debouncedCheckNumber(formatted);
      } else {
        setPhoneError(null); // reset error if unchanged
      }
    }
  }
};

  const handleNicChange = (nicValue: string) => {
    const formattedNic = nicValue.replace(/\s/g, '').toUpperCase();
    setNic(formattedNic);
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

  const handleFormattedPhoneChange = (text: string) => {
    setFormattedPhoneNumber(text);
    console.log('Formatted phone number changed to:', text);
    // Extract country code from formatted number
    if (phoneInputRef.current) {
      const code = phoneInputRef.current.getCallingCode();
      if (code) {
        setCountryCode(`+${code}`);
      }
    }

    // Check the formatted number only if it's valid
    if (text && text.length > 5 && validateSriLankanPhoneNumber(phoneNumber)) {
      debouncedCheckNumber(text);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const validateForm = () => {
    if (!firstName.trim()) {
      Alert.alert(t("Farms.Sorry"), t("Farms.Please enter first name"),[{ text: t("Farms.okButton") }]);
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert(t("Farms.Sorry"), t("Farms.Please enter last name"),[{ text: t("Farms.okButton") }]);
      return false;
    }
    if (!phoneNumber.trim()) {
      Alert.alert(t("Farms.Sorry"), t("Farms.Please enter phone number"),[{ text: t("Farms.okButton") }]);
      return false;
    }
    
    // Enhanced phone number validation
    if (!validateSriLankanPhoneNumber(phoneNumber)) {
      if (phoneNumber.length !== 9) {
        Alert.alert(t("Farms.Sorry"), t("Farms.Phone number must be exactly 9 digits"),[{ text: t("Farms.okButton") }]);
      } else if (phoneNumber[0] !== '7') {
        Alert.alert(t("Farms.Sorry"), t("Farms.Phone number must start with 7"),[{ text: t("Farms.okButton") }]);
      } else {
        Alert.alert(t("Farms.Sorry"), t("Farms.Please enter a valid phone number"),[{ text: t("Farms.okButton") }]);
      }
      return false;
    }
    
    if (!formattedPhoneNumber || formattedPhoneNumber.length < 10) {
      Alert.alert(t("Farms.Sorry"), t("Farms.Please enter a valid phone number"),[{ text: t("Farms.okButton") }]);
      return false;
    }
    if (!selectedRole) {
      Alert.alert(t("Farms.Sorry"), t("Farms.Please select a role"),[{ text: t("Farms.okButton") }]);
      return false;
    }
    if (phoneError) {
      Alert.alert(t("Farms.Sorry"), phoneError ,[{ text: t("Farms.okButton") }]);
      return false;
    }
    if (validationError) {
      Alert.alert(t("Farms.Sorry"), validationError ,[{ text: t("Farms.okButton") }]);
      return false;
    }

    return true;
  };

  // Fetch staff member data and populate form fields
  const fetchStaffMember = async () => {
    if (!staffMemberId) {
      Alert.alert(t("Farms.Sorry"), t("Farms.Staff member ID is missing"),[{ text: t("Farms.okButton") }]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setValidationError(null);
      setPhoneError(null);
      setNicDuplicateErrors(null);
      setNicErrors(null);
      
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert(t("Farms.Sorry"), t("Farms.No authentication token found"),[{ text: t("Farms.okButton") }]);
        return;
      }

      const res = await axios.get<FarmDetailsResponse>(
        `${environment.API_BASE_URL}api/farm/get-staffMmber-byId/${staffMemberId}`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Staff member data:', res.data);
      
      // Store the staff data
      setStaffData(res.data);
      
      // Populate form fields with fetched data
      setFirstName(res.data.firstName || "");
      setLastName(res.data.lastName || "");
      
      // Format the phone number to ensure it meets validation
      const rawPhoneNumber = res.data.phoneNumber || "";
      const formattedPhone = formatPhoneInput(rawPhoneNumber);
      setPhoneNumber(formattedPhone);
      
      setCountryCode(res.data.phoneCode || "+94");
      setSelectedRole(res.data.role || "");
      setNic(res.data.nic || "");
      
      // Set formatted phone number for display
      const fullPhoneNumber = (res.data.phoneCode || "+94") + (formattedPhone || "");
      setFormattedPhoneNumber(fullPhoneNumber);

    } catch (err) {
      console.error("Error fetching staff member:", err);
      Alert.alert(t("Farms.Sorry"), t("Farms.Failed to fetch staff member data"),[{ text: t("Farms.okButton") }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffMember();
  }, [staffMemberId]);

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await getAuthToken();
      
      // Remove country code from formatted number to get just the number
      const numberWithoutCode = formattedPhoneNumber.replace(countryCode, "").trim();
      
      const updatedStaffData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: numberWithoutCode,
        countryCode: countryCode,
        role: selectedRole,
        farmId: farmId,
        nic: nic.trim(),
      };

      const response = await axios.put(
        `${environment.API_BASE_URL}api/farm/update-staffmember/${staffMemberId}`,
        updatedStaffData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      Alert.alert(
        t("Farms.Success"), 
        `${t("Farms.Staff member has been updated successfully")}`,
        [{
          text: t("Farms.OK"),
          onPress: () => {
            navigation.navigate("EditManagersScreen", { 
              staffMemberId, 
              farmId, 
              membership, 
              renew 
            });
          }
        }]
      );
    } catch (error: any) {
      console.error("Error in handleSave:", error);
      let errorMessage = t("Farms.Failed to update staff member. Please try again.");
      
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = t("Farms.Network error. Please check your connection.");
      }

      Alert.alert(t("Farms.Sorry"), errorMessage, [{ text: t("Farms.okButton") }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'Manager':
        return selectedLanguage === 'si' ? 'කළමනාකරු' :
                selectedLanguage === 'ta' ? 'மேலாளர்' :
                t("Farms.Manager") || 'Manager';
      case 'Supervisor':
        return selectedLanguage === 'si' ? 'අධීක්ෂක' :
                selectedLanguage === 'ta' ? 'மேற்பார்வையாளர்' :
                t("Farms.Supervisor") || 'Supervisor';
      case 'Laborer':
        return selectedLanguage === 'si' ? 'කම්කරුවා' :
                selectedLanguage === 'ta' ? 'தொழிலாளி' :
                t("Farms.Worker") || 'Laborer';
      default:
        return role;
    }
  };

  const roleItems = [
    { label: getRoleText('Manager'), value: "Manager" },
    { label: getRoleText('Supervisor'), value: "Supervisor" },
    { label: getRoleText('Laborer'), value: "Laborer" },
  ];

  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        navigation.navigate("EditManagersScreen", { staffMemberId, farmId, membership, renew } );
        return true;
      };
  
      const subscription = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
      return () => subscription.remove();
    }, [navigation])
  );

  // Show loading indicator while fetching data
  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <LottieView
          source={require('../../assets/jsons/loader.json')}
          autoPlay
          loop
          style={{ width: 300, height: 300 }}
        />
      </View>
    );
  }
const codeMap: Record<string, string> = codeMapJson as Record<string, string>;
const getCallingCodeFromCountryCode = (code: string): string | undefined => {
  const numericCode = code.replace('+', '');
  console.log('getCallingCodeFromCountryCode:', numericCode, codeMap[numericCode]);
  return codeMap[numericCode];
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
      <View className="flex-row items-center justify-between px-6 pb-2  py-3">
        <View className="flex-row items-center justify-between mb-2">
          <TouchableOpacity
            onPress={() => navigation.navigate("EditManagersScreen", { staffMemberId, farmId, membership, renew }) }
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            disabled={isSubmitting}
          >
            <AntDesign name="left" size={24} color={isSubmitting ? "#9CA3AF" : "black"} style={{ paddingHorizontal: wp(3), paddingVertical: hp(1.5), backgroundColor: "#F6F6F680" , borderRadius: 50 }} />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-black text-lg font-semibold text-center" 
               style={[
                i18n.language === "si"
                  ? { fontSize: 16 }
                  : i18n.language === "ta"
                  ? { fontSize: 13 }
                  : { fontSize: 17 }
              ]}
            >
              {t("Farms.Edit Details", { selectedRole: getRoleText(selectedRole) })}
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
                alignContent: "center",
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
            <View className=" bg-[#F4F4F4] rounded-full">
              <PhoneInput
                key={`edit-phone-input-${staffMemberId}`}
                defaultValue={phoneNumber}
                defaultCode={getCallingCodeFromCountryCode(countryCode) || 'LK'}
                countryPickerButtonStyle={{
                  backgroundColor: "#F4F4F4",
                }}
                layout="first"
                placeholder={t("Farms.Enter Phone Number (7XXXXXXX)")}
                disableArrowIcon={false}
        textContainerStyle={{
          backgroundColor: "transparent",
          width: 0,
          height: 0,
        }}
                textInputStyle={{
                  borderRadius: 50,
                  fontSize: 16,
                  paddingLeft: 5,
                  color: "#374151",
                }}
                flagButtonStyle={{
                  borderRadius: 50,
                  backgroundColor: "#F4F4F4",
                  marginRight: 5,
                  paddingHorizontal: 8,
                  minWidth: 70,
                }}
                containerStyle={{
                  height: 48,
                  width: "100%",
                  borderColor: "#F4F4F4",
                  borderRadius: 50,
                }}
                codeTextStyle={{
                  fontSize: 16,
                  color: "#374151",
                }}
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                ref={phoneInputRef}
                disabled={isSubmitting}
onChangeCountry={(country) => {
  if (country.callingCode) {
    const newCode = `+${country.callingCode[0]}`;
    setCountryCode(newCode);

    if (phoneNumber) {
      setFormattedPhoneNumber(`${newCode}${phoneNumber}`);
    }
  }
}}

              />
            </View>
                            <View className="flex-1 bg-[#F4F4F4] rounded-full px-4 flex-row items-center" style={{ height: 50 }}>
                              <Text className="text-[#374151] text-sm mr-2 font-medium">
                                {countryCode}
                              </Text>
                              <TextInput
                                value={phoneNumber}
                                onChangeText={handlePhoneChange}
                                placeholder="7XXXXXXXX"
                                placeholderTextColor="#9CA3AF"
                                className="flex-1 text-gray-800"
                                keyboardType="phone-pad"
                                editable={!isSubmitting}
                                maxLength={9}
                                style={{ fontSize: 14 }}
                              />
                            </View>
                             </View>
            {/* Show current digit count with warning if exceeded */}
            {/* {phoneNumber.length > 0 && (
              <Text className={`text-sm mt-1 ml-3 ${
                phoneNumber.length === 9 && phoneNumber[0] === '7' 
                  ? 'text-green-600' 
                  : phoneNumber.length > 9
                  ? 'text-red-500'
                  : 'text-gray-600'
              }`}>
                {t("Farms.Digits entered")}: {phoneNumber.length}/9
                {phoneNumber.length === 9 && phoneNumber[0] === '7' && ` ✓`}
                {phoneNumber.length > 9 && ` ⚠`}
              </Text>
            )} */}
            
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
            {nicduplicateErrors && (
              <Text className="text-red-500 text-sm mt-1 ml-3">
                {nicduplicateErrors}
              </Text>
            )}
                      </View>
        </View>

        <View className="pt-10 pb-32 px-[15%]">
          <TouchableOpacity
            onPress={handleSave}
            className={`${isSubmitting ? 'bg-gray-400' : 'bg-black'} rounded-full py-3 items-center justify-center`}
            activeOpacity={0.8}
            disabled={isSubmitting}
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

export default EditStaffMember;