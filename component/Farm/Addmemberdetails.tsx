import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
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
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

// Import Redux selectors and actions
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

// Staff member interface
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

// Extended interface for country items with flag property
interface CountryItem {
  label: string;
  value: string;
  flag: string;
}

type AddMemberDetailsRouteProp = RouteProp<RootStackParamList, 'AddNewFarmBasicDetails'>;

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  staffIndex: number;
  onPhoneError: (index: number, error: string | null) => void;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChangeText,
  countryCode,
  onCountryCodeChange,
  placeholder = "Enter Phone Number",
  label = "Phone Number",
  error,
  staffIndex,
  onPhoneError,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [checkingNumber, setCheckingNumber] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { t } = useTranslation();
  const countryItems: CountryItem[] = [
    { label: "+94", value: "+94", flag: "🇱🇰" },
    { label: "+1", value: "+1", flag: "🇺🇸" },
    { label: "+44", value: "+44", flag: "🇬🇧" },
    { label: "+91", value: "+91", flag: "🇮🇳" },
    { label: "+61", value: "+61", flag: "🇦🇺" },
    { label: "+86", value: "+86", flag: "🇨🇳" },
    { label: "+33", value: "+33", flag: "🇫🇷" },
    { label: "+49", value: "+49", flag: "🇩🇪" },
  ];

  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) throw new Error("Main.somethingWentWrong");
      return token;
    } catch (error) {
      return null;
    }
  };

  const checkPhoneNumber = async (phone: string, code: string) => {
    if (!phone || !validatePhoneNumber(phone, code)) {
      onPhoneError(staffIndex, null);
      return;
    }
    
    const fullNumber = code + phone;
    setCheckingNumber(true);
    onPhoneError(staffIndex, null);
    
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
      
      // If successful, clear any errors
      onPhoneError(staffIndex, null);
    } catch (error: any) {
      if (error?.response?.status === 409) {
        onPhoneError(staffIndex, "This phone number is already registered");
      } else {
        onPhoneError(staffIndex, null);
      }
    } finally {
      setCheckingNumber(false);
    }
  };

  const debouncedCheckNumber = useCallback(
    (phone: string, code: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(() => {
        checkPhoneNumber(phone, code);
      }, 800);
    },
    []
  );

  const handlePhoneChange = (text: string) => {
    const formattedPhone = formatPhoneNumber(text, countryCode);
    onChangeText(formattedPhone);
    debouncedCheckNumber(formattedPhone, countryCode);
  };

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const formatPhoneNumber = (phone: string, code: string): string => {
    const digits = phone.replace(/\D/g, '');
    
    if (code === "+94") {
      const cleanDigits = digits.startsWith('0') ? digits.slice(1) : digits;
      return cleanDigits.slice(0, 9);
    } else if (code === "+1") {
      return digits.slice(0, 10);
    } else {
      return digits.slice(0, 10);
    }
  };

  const validatePhoneNumber = (phone: string, code: string): boolean => {
    const cleanPhone = phone.replace(/\s+/g, '');
    
    if (code === "+94") {
      const phoneRegex = /^7\d{8}$/;
      return phoneRegex.test(cleanPhone);
    } else if (code === "+1") {
      const phoneRegex = /^\d{10}$/;
      return phoneRegex.test(cleanPhone);
    } else {
      const phoneRegex = /^\d{7,15}$/;
      return phoneRegex.test(cleanPhone);
    }
  };

  const isValid = !value || validatePhoneNumber(value, countryCode);

  return (
    <View style={{ zIndex: dropdownOpen ? 9999 : 1, position: 'relative' }}>
      <Text className="text-[#070707] font-medium mb-2 mt-3">{label}</Text>
      
      <View className="flex-row space-x-3">
        <View className="flex-1" style={{ maxWidth: 100, zIndex: dropdownOpen ? 9999 : 1 }}>
          <DropDownPicker
            open={dropdownOpen}
            value={countryCode}
            items={countryItems}
            setOpen={setDropdownOpen}
            setValue={(callback) => {
              const newValue = typeof callback === 'function' ? callback(countryCode) : callback;
              onCountryCodeChange(newValue);
            }}
            setItems={() => {}}
            placeholder="+94"
            showArrowIcon={true}
            showTickIcon={false}
            style={{
              backgroundColor: "#F4F4F4",
              borderWidth: 0,
              borderRadius: 25,
              height: 48,
              paddingLeft: 12,
              paddingRight: 8,
            }}
            textStyle={{ 
              color: "#374151", 
              fontSize: 14, 
              fontWeight: "500",
              textAlign: "center"
            }}
            arrowIconStyle={{ width: 12, height: 12 }}
            dropDownContainerStyle={{
              backgroundColor: "#FFFFFF",
              borderColor: "#E5E7EB",
              borderWidth: 1,
              borderRadius: 8,
              marginTop: 2,
              elevation: 10,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              zIndex: 10000,
              position: "absolute",
              top: 50,
              left: 0,
              width: 120,
              maxHeight: 200,
            }}
            listItemLabelStyle={{ fontSize: 14, color: "#374151", textAlign: "center" }}
            selectedItemLabelStyle={{ color: "#2563EB", fontWeight: "600" }}
            listItemContainerStyle={{
              paddingVertical: 8,
              paddingHorizontal: 4,
            }}
            renderListItem={({ item, onPress }) => {
              const countryItem = item as CountryItem;
              return (
                <TouchableOpacity 
                  style={{ 
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    flexDirection: "row", 
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "transparent",
                  }}
                  onPress={() => {
                    onCountryCodeChange(countryItem.value);
                    setDropdownOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ marginRight: 6, fontSize: 14 }}>{countryItem.flag}</Text>
                  <Text style={{ fontSize: 14, color: "#374151", fontWeight: "500" }}>{countryItem.label}</Text>
                </TouchableOpacity>
              );
            }}
            listMode="SCROLLVIEW"
            closeAfterSelecting={true}
            onClose={() => setDropdownOpen(false)}
            scrollViewProps={{
              nestedScrollEnabled: true,
              showsVerticalScrollIndicator: false,
            }}
          />
        </View>

        <View className="flex-1" style={{ zIndex: dropdownOpen ? -1 : 1 }}>
          <TextInput
            value={value}
            onChangeText={handlePhoneChange}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            className="bg-[#F4F4F4] px-4 py-3 rounded-full text-gray-800"
            keyboardType="phone-pad"
            style={{ 
              fontSize: 14, 
              color: "#374151",
              height: 48,
            }}
            editable={!dropdownOpen}
          />
        </View>
      </View>
      
      {checkingNumber && (
        <View className="flex-row items-center mt-1 ml-3">
          <ActivityIndicator size="small" color="#2563EB" />
          <Text className="text-blue-600 text-sm ml-2">{t("Farms.Checking number...")}</Text>
        </View>
      )}
      {error && <Text className="text-red-500 text-sm mt-1 ml-3">{error}</Text>}
      {!isValid && value && (
        <Text className="text-red-500 text-sm mt-1 ml-3">
          {t("Farms.Please enter a valid phone number")}
        </Text>
      )}
    </View>
  );
};

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
  
  // Get submission state from Redux
  const isSubmitting = useSelector((state: RootState) => selectIsSubmitting(state));
  const submitError = useSelector((state: RootState) => selectSubmitError(state));
  const submitSuccess = useSelector((state: RootState) => selectSubmitSuccess(state));

  const numStaff = parseInt(loginCredentialsNeeded || "1", 10) || 1;

  // State for dynamic staff members
  const [staff, setStaff] = useState<StaffMember[]>([]);
 const { t } = useTranslation();
  // Role items for dropdowns
  const [roleItems] = useState([
    { label: t("Farms.Manager"), value: "Manager" },
    { label: t("Farms.Supervisor"), value: "Supervisor" },
    { label: t("Farms.Worker"), value: "Worker" },
  ]);

  // State for dropdown open/close and values
  const [dropdownStates, setDropdownStates] = useState<
    { [key: number]: { open: boolean; value: string | null } }
  >({});

  // NIC validation function for Sri Lankan NICs
  const validateSriLankanNic = (nic: string): boolean => {
    if (!nic) return false;
    
    // Remove spaces and convert to uppercase
    const cleanNic = nic.replace(/\s/g, '').toUpperCase();
    
    // Old format: 9 digits + V/X (e.g., 123456789V)
    const oldFormat = /^[0-9]{9}[VX]$/;
    
    // New format: 12 digits (e.g., 200012345678)
    const newFormat = /^[0-9]{12}$/;
    
    return oldFormat.test(cleanNic) || newFormat.test(cleanNic);
  };

  // Check for duplicate NICs within the current staff array
  const checkForDuplicateNic = (nic: string, currentIndex: number): boolean => {
    if (!nic.trim()) return false;
    
    return staff.some((member, index) => 
      index !== currentIndex && 
      member.nic.replace(/\s/g, '').toUpperCase() === nic.replace(/\s/g, '').toUpperCase()
    );
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

  // Handle submission success/error
  useEffect(() => {
    if (submitSuccess) {
      Alert.alert(t("Farms.Success"), t("Farms.Farm saved successfully!"), [
        {
          text: "OK",
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
          text: "OK",
          onPress: () => dispatch(clearSubmitState()),
        },
      ]);
    }
  }, [submitSuccess, submitError, dispatch, navigation]);

  const validatePhoneNumber = (phone: string, countryCode: string): boolean => {
    const cleanPhone = phone.replace(/\s+/g, '');
    
    if (countryCode === "+94") {
      const phoneRegex = /^7\d{8}$/;
      return phoneRegex.test(cleanPhone);
    } else if (countryCode === "+1") {
      const phoneRegex = /^\d{10}$/;
      return phoneRegex.test(cleanPhone);
    } else {
      const phoneRegex = /^\d{7,15}$/;
      return phoneRegex.test(cleanPhone);
    }
  };

  const updateStaff = (index: number, field: keyof StaffMember, value: any) => {
    setStaff((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );

    // Clear validation errors when field changes
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
    // Format NIC: remove spaces, convert to uppercase
    const formattedNic = nicValue.replace(/\s/g, '').toUpperCase();
    updateStaff(index, "nic", formattedNic);
    
    // Validate NIC
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

  const handlePhoneError = (index: number, error: string | null) => {
    setPhoneErrors(prev => ({
      ...prev,
      [index]: error
    }));
  };

  const handleSaveFarm = async () => {
    dispatch(clearSubmitState());

    // Check for existing phone number errors
    const hasExistingPhoneErrors = Object.values(phoneErrors).some(error => error !== null);
    if (hasExistingPhoneErrors) {
      Alert.alert(t("Farms.Sorry"), t("Farms.One or more phone numbers are already registered. Please use different phone numbers."));
      return;
    }

    // Check for existing NIC errors
    const hasExistingNicErrors = Object.values(nicErrors).some(error => error !== null);
    if (hasExistingNicErrors) {
      Alert.alert(t("Farms.Sorry"), t("Farms.Please fix NIC validation errors before saving."));
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
      } else if (!validatePhoneNumber(phone, countryCode)) {
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
      Alert.alert(t("Farms.Sorry"), t("Farms.Please fill all required fields correctly."));
      return;
    }

    if (!farmBasicDetails || !farmSecondDetails) {
      Alert.alert(t("Farms.Sorry"), t("Farms.Missing farm details. Please go back and complete all steps."));
      return;
    }

    const completeFarmData = {
      basicDetails: farmBasicDetails,
      secondDetails: farmSecondDetails,
      staffDetails: staff.map((member, index) => ({
        id: index + 1,
        firstName: member.firstName.trim(),
        lastName: member.lastName.trim(),
        nic: member.nic.trim(), // Include NIC in the payload
        phone: member.countryCode + member.phone.trim(),
        role: member.role!,
      })),
    };

    console.log('Complete farm data being sent:', completeFarmData); // Debug log
    dispatch(saveFarmToBackend(completeFarmData));
  };

  const handleGoBack = () => {
    navigation.goBack();
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

  // Show loading if Redux data is not available
  if (!farmSecondDetails || !loginCredentialsNeeded) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-lg text-gray-600">{t("Farms.Loading farm details...")}</Text>
        <TouchableOpacity
          className="mt-4 bg-black py-2 px-6 rounded-full"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white">{t("Farms.Go Back")}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
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

          {/* Progress Steps */}
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

        {/* Dynamic Staff Sections */}
        {staff.map((member, index) => (
          <View key={index} className="ml-3 mr-3 space-y-4 mt-6" style={{ zIndex: dropdownStates[index]?.open ? 5000 + index : 1 }}>
            <Text className="font-semibold text-[#5A5A5A]">{`Staff Member ${index + 1}`}</Text>
            <View className="w-full h-0.5 bg-[#AFAFAF] mx-2" />

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

            {/* Phone Input */}
         <PhoneInput
  value={member.phone}
  onChangeText={(text: string) => updateStaff(index, "phone", text)}
  countryCode={member.countryCode}
  onCountryCodeChange={(code: string) => updateStaff(index, "countryCode", code)}
  placeholder={t("Farms.Enter Phone Number")}
  label={t("Farms.Phone Number")}
  staffIndex={index}
  onPhoneError={handlePhoneError}
  error={phoneErrors[index] || undefined} // Pass the error to display
/>
            <View>
              <Text className="text-[#070707] font-medium mb-2">{t("Farms.Role")}</Text>
              <DropDownPicker
                open={dropdownStates[index]?.open || false}
                value={dropdownStates[index]?.value || null}
                items={roleItems}
                setOpen={(value) => {
                  // Handle both boolean and functional update
                  if (typeof value === 'function') {
                    // If value is a function, call it with the current state
                    const currentOpen = dropdownStates[index]?.open || false;
                    const newOpen = value(currentOpen);
                    setDropdownOpen(index, newOpen);
                  } else {
                    // If value is a boolean, use it directly
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
    </SafeAreaView>
  );
};

export default AddMemberDetails;


