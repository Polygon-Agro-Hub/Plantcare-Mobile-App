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

interface SupervisorAddStaffProps {
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

const SupervisorAddStaff: React.FC<SupervisorAddStaffProps> = ({ navigation, route }) => {
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
      label: `${country.emoji}  (${country.dial_code})`,
      value: country.dial_code,
      countryName: country.name,
      flag: country.emoji,
      dialCode: country.dial_code,
    }))
  );
  
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nicDebounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const { farmId } = route.params;
  const { t } = useTranslation();

  const roleItems = [
    { label: t("Farms.Worker"), value: "Laborer" },
  ];

  // Full format items for modal
  const fullFormatItems = countryData.map((country) => ({
    label: `${country.emoji} (${country.dial_code})`,
    value: country.dial_code,
    countryName: country.name,
    flag: `${country.emoji}  (${country.dial_code})`,
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

  // FIXED: NIC Validation and Checking
  const validateSriLankanNic = (nic: string): boolean => {
    if (!nic || nic.trim() === '') return false;
    
    const cleanNic = nic.replace(/\s/g, '').toUpperCase();
    
    // Old format: 9 digits + V or X (e.g., 123456789V)
    const oldFormat = /^[0-9]{9}[VX]$/;
    // New format: 12 digits (e.g., 199912345678)
    const newFormat = /^[0-9]{12}$/;
    
    return oldFormat.test(cleanNic) || newFormat.test(cleanNic);
  };

  const checkNic = async (nicValue: string) => {
    console.log('Checking NIC:', nicValue);
    
    // Don't check if NIC is empty or invalid
    if (!nicValue || nicValue.trim() === '' || !validateSriLankanNic(nicValue)) {
      setNicDuplicateErrors(null);
      setCheckingNIC(false);
      return;
    }

    setCheckingNIC(true);
    setNicDuplicateErrors(null);

    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      // FIXED: Use the correct endpoint
      const response = await axios.post(
        `${environment.API_BASE_URL}api/farm/members-nic-checker`, // Fixed endpoint
        { nic: nicValue.trim().toUpperCase() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // If we get here, NIC is available (no error)
      setNicDuplicateErrors(null);
    } catch (error: any) {
      console.log('NIC check error:', error.response?.data);
      if (error?.response?.status === 409) {
        setNicDuplicateErrors(t("Farms.This NIC is already used by another staff member"));
      } else if (error?.response) {
        // Don't show error for other server errors to avoid confusing users
        setNicDuplicateErrors(null);
      } else {
        setNicDuplicateErrors(null);
      }
    } finally {
      setCheckingNIC(false);
    }
  };

  const debouncedCheckNic = useCallback(
    (nicValue: string) => {
      if (nicDebounceTimeoutRef.current) {
        clearTimeout(nicDebounceTimeoutRef.current);
      }
      nicDebounceTimeoutRef.current = setTimeout(() => {
        checkNic(nicValue);
      }, 800);
    },
    []
  );

  const handleNicChange = (nicValue: string) => {
    const formattedNic = nicValue.replace(/\s/g, '').toUpperCase();
    setNicNumber(formattedNic);
    setNicDuplicateErrors(null);

    // Validate NIC format
    if (formattedNic && formattedNic.length > 0) {
      if (!validateSriLankanNic(formattedNic)) {
        setNicErrors(t("Farms.Please enter a valid Sri Lankan NIC"));
      } else {
        setNicErrors(null);
        // Only check for duplicates if format is valid
        debouncedCheckNic(formattedNic);
      }
    } else {
      setNicErrors(null);
      setNicDuplicateErrors(null);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (nicDebounceTimeoutRef.current) {
        clearTimeout(nicDebounceTimeoutRef.current);
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

    // FIXED: Better NIC validation
    if (nicErrors) {
      Alert.alert(t("Farms.Sorry"), t("Farms.Please enter a valid Sri Lankan NIC"), [{ text: t("Farms.okButton") }]);
      return false;
    }
    if (nicDuplicateErrors) {
      Alert.alert(t("Farms.Sorry"), nicDuplicateErrors, [{ text: t("Farms.okButton") }]);
      return false;
    }

    // Final NIC format validation
    if (!validateSriLankanNic(nic)) {
      Alert.alert(t("Farms.Sorry"), t("Farms.Please enter a valid Sri Lankan NIC"), [{ text: t("Farms.okButton") }]);
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
        nic: nic.trim().toUpperCase() // Ensure NIC is uppercase
      };

      const response = await axios.post(
        `${environment.API_BASE_URL}api/staff/create-new-staffmember/${farmId}`,
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
            // navigation.navigate("Main", { 
            //   screen: "ManageMembersManager",
            //   params: { farmId }
            // });
            navigation.goBack()
          }
        }]
      );
    } catch (error: any) {
      console.error("Error in handleSave:", error);
      let errorMessage = t("Farms.Failed to add staff member. Please try again.");
      
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
        
        // Handle NIC duplicate error from server
        if (error.response.status === 409 && error.response.data?.message?.includes('NIC')) {
          errorMessage = t("Farms.This NIC is already used by another staff member");
        }
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
          // navigation.navigate("Main", { 
          //   screen: "ManageMembersManager",
          //   params: { farmId: farmId }
          // });
          navigation.goBack()
          return true;
        };
  
        const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
        
        return () => {
          backHandler.remove();
        };
      }, [navigation, farmId, resetFormState])
    );

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
              onPress={() => navigation.goBack()} 
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
              <View style={{ width: wp(33), marginRight: 8, zIndex: 2000 }}>
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
                        label: `${country.emoji}  (${country.dial_code})`,
                        value: country.dial_code,
                        countryName: country.name,
                        flag: `${country.emoji}  (${country.dial_code})`,
                        dialCode: country.dial_code,
                      }))
                    );
                  }}
                  
                  listMode="SCROLLVIEW"
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
                    fontSize: 14,
                  }}
                  listItemLabelStyle={{
                    fontSize: 14,
                  }}
                  dropDownContainerStyle={{
                    borderColor: "#ccc",
                    borderWidth: 1,
                    maxHeight: 250,
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
              onChangeText={handleNicChange}
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

export default SupervisorAddStaff;