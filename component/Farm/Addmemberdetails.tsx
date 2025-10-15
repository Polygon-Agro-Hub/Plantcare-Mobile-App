import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import DropDownPicker from "react-native-dropdown-picker";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/component/types";
import { environment } from "@/environment/environment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import PhoneInput from '@linhnguyen96114/react-native-phone-input';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import {
  selectFarmSecondDetails,
  selectFarmBasicDetails,
  selectLoginCredentialsNeeded,
  selectIsSubmitting,
  selectSubmitError,
  selectSubmitSuccess,
  saveFarmToBackend,
  clearSubmitState,
} from "../../store/farmSlice";
import type { RootState, AppDispatch } from "../../services/reducxStore";
import { useTranslation } from "react-i18next";

interface StaffMember {
  firstName: string;
  lastName: string;
  phone: string;
  nic: string;
  countryCode: string;
  role: string | null;
}

interface RouteParams {
  membership?: string;
  currentFarmCount?: number;
}

type AddMemberDetailsRouteProp = RouteProp<RootStackParamList, 'AddNewFarmBasicDetails'>;

const AddMemberDetails: React.FC = () => {
  const route = useRoute<AddMemberDetailsRouteProp>();
  const { membership = 'basic' } = route.params || {};
  const [phoneErrors, setPhoneErrors] = useState<{ [key: number]: string | null }>({});
  const [phoneValidationErrors, setPhoneValidationErrors] = useState<{ [key: number]: string | null }>({});
  const [nicErrors, setNicErrors] = useState<{ [key: number]: string | null }>({});
  
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch<AppDispatch>();

  // Get data from Redux
  const farmSecondDetails = useSelector((state: RootState) => selectFarmSecondDetails(state));
  const farmBasicDetails = useSelector((state: RootState) => selectFarmBasicDetails(state));
  const loginCredentialsNeeded = useSelector((state: RootState) =>
    selectLoginCredentialsNeeded(state)
  );
  
  const isSubmitting = useSelector((state: RootState) => selectIsSubmitting(state));
  const submitError = useSelector((state: RootState) => selectSubmitError(state));
  const submitSuccess = useSelector((state: RootState) => selectSubmitSuccess(state));

  const numStaff = parseInt(loginCredentialsNeeded || "1", 10) || 1;

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const { t } = useTranslation();
 
  const [roleItems] = useState([
    { label: t("Farms.Manager"), value: "Manager" },
    { label: t("Farms.Supervisor"), value: "Supervisor" },
    { label: t("Farms.Worker"), value: "Laborer" },
  ]);

  const [dropdownStates, setDropdownStates] = useState<
    { [key: number]: { open: boolean; value: string | null } }
  >({});

  const phoneInputRefs = useRef<{ [key: number]: any }>({});
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const validateSriLankanNic = (nic: string): boolean => {
    if (!nic) return false;
    
    const cleanNic = nic.replace(/\s/g, '').toUpperCase();
    
    const oldFormat = /^[0-9]{9}[VX]$/;
    const newFormat = /^[0-9]{12}$/;
    
    return oldFormat.test(cleanNic) || newFormat.test(cleanNic);
  };

  // Check for duplicate NIC within current form
  const checkForDuplicateNic = (nic: string, currentIndex: number): boolean => {
    if (!nic.trim()) return false;
    
    return staff.some((member, index) => 
      index !== currentIndex && 
      member.nic.replace(/\s/g, '').toUpperCase() === nic.replace(/\s/g, '').toUpperCase()
    );
  };

  // NEW: Check for duplicate phone numbers within current form
  const checkForDuplicatePhone = (phone: string, countryCode: string, currentIndex: number): boolean => {
    if (!phone.trim()) return false;
    
    const fullPhone = countryCode + phone;
    return staff.some((member, index) => 
      index !== currentIndex && 
      (member.countryCode + member.phone) === fullPhone
    );
  };

  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) throw new Error("Main.somethingWentWrong");
      return token;
    } catch (error) {
      return null;
    }
  };

  const checkPhoneNumber = async (fullNumber: string, index: number) => {
    if (!fullNumber || fullNumber.length < 10) {
      setPhoneErrors(prev => ({ ...prev, [index]: null }));
      return;
    }
    
    setPhoneErrors(prev => ({ ...prev, [index]: null }));
    
    try {
      const token = await getAuthToken();
      if (!token) return;

      await axios.post(
        `${environment.API_BASE_URL}api/farm/members-phoneNumber-checker`,
        { phoneNumber: fullNumber },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setPhoneErrors(prev => ({ ...prev, [index]: null }));
    } catch (error: any) {
      if (error?.response?.status === 409) {
        setPhoneErrors(prev => ({ 
          ...prev, 
          [index]: t("Farms.This phone number is already registered") 
        }));
      } else {
        setPhoneErrors(prev => ({ ...prev, [index]: null }));
      }
    }
  };

  const debouncedCheckNumber = useCallback(
    (number: string, index: number) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(() => {
        checkPhoneNumber(number, index);
      }, 800);
    },
    []
  );

  // Validate Sri Lankan phone number format
  const validateSriLankanPhoneNumber = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\s+/g, '');
    const phoneRegex = /^7\d{8}$/;
    return phoneRegex.test(cleanPhone);
  };

  // Format phone number input to enforce 9 digits starting with 7
  const formatPhoneInput = (text: string): string => {
    // Remove all non-digit characters
    let digits = text.replace(/\D/g, '');
    
    // Limit to 9 digits maximum
    digits = digits.slice(0, 9);
    
    return digits;
  };

  const handlePhoneChange = (text: string, index: number) => {
    // Remove all non-digit characters first to check the actual digit count
    const digitsOnly = text.replace(/\D/g, '');
    
    // Check if user is trying to enter more than 9 digits
    if (digitsOnly.length > 9) {
      setPhoneValidationErrors(prev => ({
        ...prev,
        [index]: t("Farms.Phone number cannot exceed 9 digits")
      }));
      // Format to only allow 9 digits
      const formattedText = formatPhoneInput(text);
      updateStaff(index, "phone", formattedText);
      return;
    }
    
    // Format the input (just remove non-digits and limit length)
    const formattedText = formatPhoneInput(text);
    updateStaff(index, "phone", formattedText);
    
    // Clear any previous validation errors
    setPhoneValidationErrors(prev => ({
      ...prev,
      [index]: null
    }));
    
    // Validate the formatted number
    if (formattedText.length > 0) {
      const currentMember = staff[index];
      
      // Check for duplicate phone numbers within form
      if (checkForDuplicatePhone(formattedText, currentMember.countryCode, index)) {
        setPhoneValidationErrors(prev => ({
          ...prev,
          [index]: t("Farms.Duplicate numbers are not allowed.")
        }));
      }
      // Check if first digit is not 7
      else if (formattedText[0] !== '7') {
        setPhoneValidationErrors(prev => ({
          ...prev,
          [index]: t("Farms.Phone number must start with 7")
        }));
      } else if (formattedText.length < 9) {
        setPhoneValidationErrors(prev => ({
          ...prev,
          [index]: t("Farms.Phone number must be exactly 9 digits")
        }));
      } else if (!validateSriLankanPhoneNumber(formattedText)) {
        setPhoneValidationErrors(prev => ({
          ...prev,
          [index]: t("Farms.Please enter a valid phone number")
        }));
      } else {
        setPhoneValidationErrors(prev => ({
          ...prev,
          [index]: null
        }));
      }
    } else {
      setPhoneValidationErrors(prev => ({
        ...prev,
        [index]: null
      }));
    }

    // Get the full formatted phone number for checking
    const fullNumber = staff[index].countryCode + formattedText;
    if (fullNumber && fullNumber.length > 5 && formattedText[0] === '7' && formattedText.length === 9) {
      debouncedCheckNumber(fullNumber, index);
    }
  };

  // Initialize staff and dropdown states
  useEffect(() => {
    if (numStaff > 0) {
      const newStaff = Array.from({ length: numStaff }, () => ({
        firstName: "",
        lastName: "",
        nic: "",
        countryCode: "+94",
        phone: "",
        role: null,
      }));
      setStaff(newStaff);

      const initialDropdownStates: { [key: number]: { open: boolean; value: string | null } } = {};
      newStaff.forEach((_, index) => {
        initialDropdownStates[index] = { open: false, value: null };
      });
      setDropdownStates(initialDropdownStates);
    }
  }, [numStaff]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (submitSuccess) {
      Alert.alert(t("Farms.Success"), t("Farms.Farm saved successfully!"), [
        {
          text: t("PublicForum.OK"),
          onPress: () => {
            dispatch(clearSubmitState());
            navigation.navigate("Main", { screen: "AddFarmList" });
          },
        },
      ]);
    }
    
    if (submitError) {
      Alert.alert("Error", submitError, [
        {
          text: t("PublicForum.OK"),
          onPress: () => dispatch(clearSubmitState()),
        },
      ]);
    }
  }, [submitSuccess, submitError, dispatch, navigation]);

  const updateStaff = (index: number, field: keyof StaffMember, value: any) => {
    setStaff((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );

    if (field === 'phone') {
      setPhoneValidationErrors(prev => ({
        ...prev,
        [index]: null
      }));
    }
    
    if (field === 'nic') {
      setNicErrors(prev => ({
        ...prev,
        [index]: null
      }));
    }
  };

  const handleNicChange = (index: number, nicValue: string) => {
    const formattedNic = nicValue.replace(/\s/g, '').toUpperCase();
    updateStaff(index, "nic", formattedNic);

    if (formattedNic && !validateSriLankanNic(formattedNic)) {
      setNicErrors(prev => ({
        ...prev,
        [index]: t("Farms.Please enter a valid Sri Lankan NIC")
      }));
    } else if (formattedNic && checkForDuplicateNic(formattedNic, index)) {
      setNicErrors(prev => ({
        ...prev,
        [index]: t("Farms.This NIC is already used by another staff member")
      }));
    } else {
      setNicErrors(prev => ({
        ...prev,
        [index]: null
      }));
    }
  };

  const setDropdownOpen = (index: number, open: boolean) => {
    setDropdownStates((prev) => {
      const newStates = { ...prev };
      Object.keys(newStates).forEach((key) => {
        newStates[parseInt(key)] = {
          ...newStates[parseInt(key)],
          open: false,
        };
      });
      if (open) {
        newStates[index] = {
          ...newStates[index],
          open: true,
        };
      }
      return newStates;
    });
  };

  const setDropdownValue = (index: number, callback: any) => {
    const currentValue = dropdownStates[index]?.value || null;
    const newValue = typeof callback === "function" ? callback(currentValue) : callback;
    
    setDropdownStates((prev) => ({
      ...prev,
      [index]: { ...prev[index], value: newValue, open: false },
    }));
    updateStaff(index, "role", newValue);
  };

  const handleSaveFarm = async () => {
    dispatch(clearSubmitState());

    // Check for existing phone number errors (backend duplicates)
    const hasExistingPhoneErrors = Object.values(phoneErrors).some(error => error !== null);
    if (hasExistingPhoneErrors) {
      Alert.alert(t("Farms.Sorry"), t("Farms.One or more phone numbers are already registered. Please use different phone numbers."),[{ text:  t("PublicForum.OK") }]);
      return;
    }

    // Check for existing phone validation errors (format and form duplicates)
    const hasPhoneValidationErrors = Object.values(phoneValidationErrors).some(error => error !== null);
    if (hasPhoneValidationErrors) {
      Alert.alert(t("Farms.Sorry"), t("Farms.Please fix phone number validation errors before saving."),[{ text:  t("PublicForum.OK") }]);
      return;
    }

    // Check for existing NIC errors
    const hasExistingNicErrors = Object.values(nicErrors).some(error => error !== null);
    if (hasExistingNicErrors) {
      Alert.alert(t("Farms.Sorry"), t("Farms.Please fix NIC validation errors before saving."),[{ text:  t("PublicForum.OK") }]);
      return;
    }

    // NEW: Check for duplicate phone numbers within the form before submission
    const duplicatePhoneErrors: { [key: number]: string | null } = {};
    let hasDuplicatePhones = false;

    staff.forEach((member, index) => {
      if (member.phone && member.countryCode) {
        const fullPhone = member.countryCode + member.phone;
        const isDuplicate = staff.some((otherMember, otherIndex) => 
          otherIndex !== index && 
          (otherMember.countryCode + otherMember.phone) === fullPhone
        );
        
        if (isDuplicate) {
          duplicatePhoneErrors[index] = t("Farms.This phone number is already used by another staff member");
          hasDuplicatePhones = true;
        }
      }
    });

    if (hasDuplicatePhones) {
      setPhoneValidationErrors(prev => ({ ...prev, ...duplicatePhoneErrors }));
      Alert.alert(t("Farms.Sorry"), t("Farms.Duplicate phone numbers found. Please use unique phone numbers for each staff member."),[{ text:  t("PublicForum.OK") }]);
      return;
    }

    // Validate required fields
    const validationErrors: { [key: number]: string | null } = {};
    const nicValidationErrors: { [key: number]: string | null } = {};
    let hasErrors = false;

    for (let i = 0; i < staff.length; i++) {
      const { firstName, lastName, phone, countryCode, role, nic } = staff[i];
      
      if (!firstName.trim()) {
        validationErrors[i] = t("Farms.Please enter first name");
        hasErrors = true;
      }
      if (!lastName.trim()) {
        validationErrors[i] = t("Farms.Please enter last name");
        hasErrors = true;
      }
      if (!nic.trim()) {
        nicValidationErrors[i] = t("Farms.Please enter NIC");
        hasErrors = true;
      } else if (!validateSriLankanNic(nic)) {
        nicValidationErrors[i] = t("Farms.Please enter a valid NIC");
        hasErrors = true;
      } else if (checkForDuplicateNic(nic, i)) {
        nicValidationErrors[i] = t("Farms.This NIC is already used by another staff member");
        hasErrors = true;
      }
      if (!phone.trim()) {
        validationErrors[i] = t("Farms.Please enter phone number");
        hasErrors = true;
      } else if (!validateSriLankanPhoneNumber(phone)) {
        validationErrors[i] = t("Farms.Please enter a valid phone number");
        hasErrors = true;
      }
      if (!role) {
        validationErrors[i] = t("Farms.Please select a role");
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setPhoneValidationErrors(validationErrors);
      setNicErrors(nicValidationErrors);
      Alert.alert(t("Farms.Sorry"), t("Farms.Please fill all required fields correctly."),[{ text:  t("PublicForum.OK") }]);
      return;
    }

    if (!farmBasicDetails || !farmSecondDetails) {
      Alert.alert(t("Farms.Sorry"), t("Farms.Missing farm details. Please go back and complete all steps."),[{ text:  t("PublicForum.OK") }]);
      return;
    }

    const completeFarmData = {
      basicDetails: farmBasicDetails,
      secondDetails: farmSecondDetails,
      staffDetails: staff.map((member, index) => ({
        id: index + 1,
        firstName: member.firstName.trim(),
        lastName: member.lastName.trim(),
        nic: member.nic.trim(),
        phone: member.countryCode + member.phone.trim(),
        role: member.role!,
      })),
    };

    console.log('Complete farm data being sent:', completeFarmData);
    dispatch(saveFarmToBackend(completeFarmData));
  };

  const handleGoBack = () => {
   navigation.navigate("AddNewFarmSecondDetails" as any, {
    membership: membership,
    fromMemberDetails: true  // Flag to restore second details data
  });
  };

  const getMembershipDisplay = () => {
    const membershipType = membership.toLowerCase();
    
    switch (membershipType) {
      case 'pro':
        return {
          text: 'PRO',
          bgColor: 'bg-[#FFF5BD]',
          textColor: 'text-[#E2BE00]'
        };
      case 'basic':
      default:
        return {
          text: 'BASIC',
          bgColor: 'bg-[#CDEEFF]',
          textColor: 'text-[#223FFF]'
        };
    }
  };

  const membershipDisplay = getMembershipDisplay();

  if (!farmSecondDetails || !loginCredentialsNeeded) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-lg text-gray-600">{t("Farms.Loading farm details...")}</Text>
        <TouchableOpacity
          className="mt-4 bg-black py-2 px-6 rounded-full"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white">{t("Farms.Go Back")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        className="px-6"
      >
        {/* Header */}
        <View style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}>
          <View className="flex-row items-center justify-between mb-6">
            <Text className="font-semibold text-lg ml-[30%]">{t("Farms.Add New Farm")}</Text>
            <View className={`${membershipDisplay.bgColor} px-3 py-1 rounded-lg`}>
              <Text className={`${membershipDisplay.textColor} text-xs font-medium`}>
                {membershipDisplay.text}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-center mb-3">
            <View className="w-[29px] h-[29px] border border-[#2AAD7A] bg-[#2AAD7A] rounded-full flex items-center justify-center">
              <Image
                className="w-[10px] h-[13px]"
                source={require("../../assets/images/Farm/locationWhite.webp")}
              />
            </View>
            <View className="w-24 h-0.5 bg-[#2AAD7A] mx-2" />
            <View className="w-[29px] h-[29px] border border-[#2AAD7A] bg-[#2AAD7A] rounded-full flex items-center justify-center">
              <Image
                className="w-[11px] h-[12px]"
                source={require("../../assets/images/Farm/userwhite.webp")}
              />
            </View>
            <View className="w-24 h-0.5 bg-[#2AAD7A] mx-2" />
            <View className="w-[29px] h-[29px] border border-[#2AAD7A] bg-[white] rounded-full flex items-center justify-center">
              <Image
                className="w-[13.125px] h-[15px]"
                source={require("../../assets/images/Farm/check.png")}
              />
            </View>
          </View>
        </View>

        {staff.map((member, index) => (
          <View key={index} className="ml-3 mr-3 space-y-4 mt-6" style={{ zIndex: dropdownStates[index]?.open ? 5000 + index : 1 }}>
            <Text className="font-semibold text-[#5A5A5A]">
              {`${t("Farms.Staff Member")} ${index + 1}`}
            </Text>
            <View className="w-full h-0.5 bg-[#AFAFAF] mx-2" />

            <View>
              <Text className="text-[#070707] font-medium mb-2">{t("Farms.Role")}</Text>
              <DropDownPicker
                open={dropdownStates[index]?.open || false}
                value={dropdownStates[index]?.value || null}
                items={roleItems}
                setOpen={(value) => {
                  if (typeof value === 'function') {
                    const currentOpen = dropdownStates[index]?.open || false;
                    const newOpen = value(currentOpen);
                    setDropdownOpen(index, newOpen);
                  } else {
                    setDropdownOpen(index, value);
                  }
                }}
                setValue={(callback) => setDropdownValue(index, callback)}
                setItems={() => {}}
                placeholder={t("Farms.Select Role")}
                placeholderStyle={{ color: "#9CA3AF", fontSize: 14 }}
                style={{
                  backgroundColor: "#F4F4F4",
                  borderColor: "#F4F4F4",
                  borderRadius: 25,
                  height: 50,
                  paddingHorizontal: 16,
                }}
                textStyle={{ color: "#374151", fontSize: 12 }}
                dropDownContainerStyle={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#E5E7EB",
                  borderRadius: 8,
                  marginTop: 4,
                  elevation: 5,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  zIndex: 6000 + index,
                }}
                listMode="SCROLLVIEW"
                closeAfterSelecting={true}
                onSelectItem={() => {
                  setTimeout(() => {
                    setDropdownOpen(index, false);
                  }, 100);
                }}
                disabled={isSubmitting}
              />
            </View>

            <View>
              <Text className="text-[#070707] font-medium mb-2">{t("Farms.First Name")}</Text>
              <TextInput
                value={member.firstName}
                onChangeText={(text: string) => updateStaff(index, "firstName", text)}
                placeholder={t("Farms.Enter First Name")}
                placeholderTextColor="#9CA3AF"
                className="bg-[#F4F4F4] p-3 rounded-full text-gray-800"
                editable={!isSubmitting}
              />
            </View>

            <View>
              <Text className="text-[#070707] font-medium mb-2">{t("Farms.Last Name")}</Text>
              <TextInput
                value={member.lastName}
                onChangeText={(text: string) => updateStaff(index, "lastName", text)}
                placeholder={t("Farms.Enter Last Name")}
                placeholderTextColor="#9CA3AF"
                className="bg-[#F4F4F4] p-3 rounded-full text-gray-800"
                editable={!isSubmitting}
              />
            </View>

            {/* Phone Input */}
            <View>
              <Text className="text-[#070707] font-medium mb-2">{t("Farms.Phone Number")}</Text>
              <View className="flex-row items-center space-x-2">
                {/* Country Code Picker */}
                <View className="bg-[#F4F4F4] rounded-full overflow-hidden" style={{ width: 80, height: 50 }}>
                  <PhoneInput
                    defaultCode="LK"
                    layout="first"
                    onChangeCountry={(country: any) => {
                      if (country?.callingCode?.[0]) {
                        updateStaff(index, "countryCode", `+${country.callingCode[0]}`);
                      }
                    }}
                    containerStyle={{
                      backgroundColor: "#F4F4F4",
                      width: 80,
                      height: 50,
                      borderRadius: 25,
                    }}
                    textContainerStyle={{
                      backgroundColor: "transparent",
                      width: 0,
                      height: 0,
                    }}
                    textInputStyle={{
                      width: 0,
                      height: 0,
                      display: 'none',
                    }}
                    codeTextStyle={{
                      display: 'none',
                    }}
                    flagButtonStyle={{
                      backgroundColor: "transparent",
                      width: 80,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    disabled={isSubmitting}
                    disableArrowIcon={false}
                  />
                </View>

                {/* Phone Number Input */}
                <View className="flex-1 bg-[#F4F4F4] rounded-full px-4 flex-row items-center" style={{ height: 50 }}>
                  <Text className="text-[#374151] text-sm mr-2 font-medium">
                    {member.countryCode}
                  </Text>
                  <TextInput
                    value={member.phone}
                    onChangeText={(text: string) => handlePhoneChange(text, index)}
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
              
              {/* Error messages */}
              {phoneErrors[index] && (
                <Text className="text-red-500 text-sm mt-1 ml-3">
                  {phoneErrors[index]}
                </Text>
              )}
              {phoneValidationErrors[index] && (
                <Text className="text-red-500 text-sm mt-1 ml-3">
                  {phoneValidationErrors[index]}
                </Text>
              )}
            </View>

            <View>
              <Text className="text-[#070707] font-medium mb-2">{t("Farms.NIC")}</Text>
              <TextInput
                value={member.nic}
                onChangeText={(text: string) => handleNicChange(index, text)}
                placeholder={t("Farms.Enter NIC")}
                placeholderTextColor="#9CA3AF"
                className="bg-[#F4F4F4] p-3 rounded-full text-gray-800"
                editable={!isSubmitting}
                autoCapitalize="characters"
                maxLength={12}
              />
              {nicErrors[index] && (
                <Text className="text-red-500 text-sm mt-1 ml-3">{nicErrors[index]}</Text>
              )}
            </View>
          </View>
        ))}

        {/* Buttons */}
        <View className="mt-8 mb-2">
          <TouchableOpacity
            className="bg-[#F3F3F5] py-3 mx-6 rounded-full"
            onPress={handleGoBack}
            disabled={isSubmitting}
          >
            <Text className="text-[#84868B] text-center font-semibold text-lg">{t("Farms.Go Back")}</Text>
          </TouchableOpacity>
        </View>
        <View className="mt-2 mb-[40%]">
          <TouchableOpacity
            className={`py-3 mx-6 rounded-full ${isSubmitting ? 'bg-gray-400' : 'bg-black'}`}
            onPress={handleSaveFarm}
            disabled={isSubmitting}
          >
            <View className="flex-row items-center justify-center ">
              {isSubmitting && (
                <ActivityIndicator
                  size="small"
                  color="white"
                  style={{ marginRight: 8 }}
                />
              )}
              <Text className="text-white text-center font-semibold text-lg">
                {isSubmitting ? t("Farms.Saving...") : t("Farms.Save Farm")}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default AddMemberDetails;