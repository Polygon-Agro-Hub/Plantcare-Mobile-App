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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "react-native-vector-icons/AntDesign";
import DropDownPicker from "react-native-dropdown-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

// Add environment import - adjust path as needed
// import { environment } from "../config/environment";

type AddnewStaffNavigationProp = StackNavigationProp<
  RootStackParamList,
  "AddnewStaff"
>;

interface AddnewStaffProps {
  navigation: AddnewStaffNavigationProp;
}

interface CountryItem {
  label: string;
  value: string;
  flag: string;
}

const AddnewStaff: React.FC<AddnewStaffProps> = ({ navigation }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+94");
  const [selectedRole, setSelectedRole] = useState("");
  const [roleOpen, setRoleOpen] = useState(false);
  const [countryCodeOpen, setCountryCodeOpen] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [checkingNumber, setCheckingNumber] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const roleItems = [
    { label: "Manager", value: "manager" },
    { label: "Assistant Manager", value: "assistant_manager" },
    { label: "Team Lead", value: "team_lead" },
    { label: "Supervisor", value: "supervisor" },
  ];

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

  const checkPhoneNumber = async (phone: string, code: string) => {
    if (!phone || !validatePhoneNumber(phone, code)) {
      setPhoneError(null);
      return;
    }
    
    const fullNumber = code + phone;
    setCheckingNumber(true);
    setPhoneError(null);
    
    try {
      const token = await getAuthToken();
      if (!token) return;

      // Uncomment and adjust API endpoint as needed
      /*
      await axios.post(
        `${environment.API_BASE_URL}api/farm/members-phoneNumber-checker`,
        { phoneNumber: fullNumber },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      */
      
      // If successful, clear any errors
      setPhoneError(null);
    } catch (error: any) {
      if (error?.response?.status === 409) {
        setPhoneError("This phone number is already registered");
      } else {
        setPhoneError(null);
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
    setPhoneNumber(formattedPhone);
    debouncedCheckNumber(formattedPhone, countryCode);
  };

  const handleCountryCodeChange = (callback: any) => {
    if (typeof callback === 'function') {
      const newValue = callback(countryCode);
      setCountryCode(newValue);
      if (phoneNumber) {
        const formattedPhone = formatPhoneNumber(phoneNumber, newValue);
        setPhoneNumber(formattedPhone);
        debouncedCheckNumber(formattedPhone, newValue);
      }
    } else {
      setCountryCode(callback);
      if (phoneNumber) {
        const formattedPhone = formatPhoneNumber(phoneNumber, callback);
        setPhoneNumber(formattedPhone);
        debouncedCheckNumber(formattedPhone, callback);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleSave = () => {
    if (!firstName.trim()) {
      Alert.alert("Error", "Please enter first name");
      return;
    }
    if (!lastName.trim()) {
      Alert.alert("Error", "Please enter last name");
      return;
    }
    if (!phoneNumber.trim()) {
      Alert.alert("Error", "Please enter phone number");
      return;
    }
    if (!validatePhoneNumber(phoneNumber, countryCode)) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }
    if (!selectedRole) {
      Alert.alert("Error", "Please select a role");
      return;
    }
    if (phoneError) {
      Alert.alert("Error", phoneError);
      return;
    }

    setIsSubmitting(true);

    // Handle save logic here
    console.log({
      firstName,
      lastName,
      phoneNumber: countryCode + phoneNumber,
      role: selectedRole,
    });

    Alert.alert("Success", "Manager added successfully!");
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        className="flex-1 bg-white"
        style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pb-6">
          <View className="flex-row items-center justify-between mb-2">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <AntDesign name="left" size={24} color="#000502" />
            </TouchableOpacity>
            <View className="flex-1 items-center">
              <Text className="text-black text-xl font-semibold">
                Add New Manager
              </Text>
            </View>
          </View>
          <View className="w-8" />
        </View>

        {/* Form Content */}
        <View className="px-7 space-y-6">
          {/* First Name */}
          <View className="space-y-2">
            <Text className="text-[#070707] text-base">First Name</Text>
            <TextInput
              className="bg-gray-100 px-4 py-4 rounded-lg text-base text-gray-700"
              placeholder="Enter First Name"
              placeholderTextColor="#9CA3AF"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
          </View>

          {/* Last Name */}
          <View className="space-y-2">
            <Text className="text-[#070707] text-base">Last Name</Text>
            <TextInput
              className="bg-gray-100 px-4 py-4 rounded-lg text-base text-gray-700"
              placeholder="Enter Last Name"
              placeholderTextColor="#9CA3AF"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />
          </View>

          {/* Phone Number */}
          <View className="space-y-2" style={{ zIndex: 2000 }}>
            <Text className="text-[#070707] text-base">Phone Number</Text>
            <View className="flex-row bg-gray-100 rounded-lg overflow-hidden">
              <View className="w-24">
                <DropDownPicker
                  open={countryCodeOpen}
                  value={countryCode}
                  items={countryItems}
                  setOpen={setCountryCodeOpen}
                  setValue={handleCountryCodeChange}
                  setItems={() => {}}
                  placeholder="+94"
                  style={{
                    backgroundColor: "#F3F4F6",
                    borderColor: "#E5E7EB",
                    borderWidth: 0,
                    borderRadius: 0,
                    minHeight: 56,
                    paddingHorizontal: 8,
                  }}
                  textStyle={{ 
                    color: "#374151", 
                    fontSize: 14,
                    fontWeight: '500'
                  }}
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
                    zIndex: 3000,
                  }}
                  listMode="SCROLLVIEW"
                  closeAfterSelecting={true}
                  disabled={isSubmitting}
                />
              </View>
              <TextInput
                className="flex-1 px-4 py-4 text-base text-gray-700"
                placeholder="Enter Phone Number"
                placeholderTextColor="#9CA3AF"
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                editable={!isSubmitting}
              />
            </View>
            
            {/* Phone validation feedback */}
            {checkingNumber && (
              <Text className="text-blue-600 text-sm mt-1">
                Checking phone number...
              </Text>
            )}
            {phoneError && (
              <Text className="text-red-600 text-sm mt-1">
                {phoneError}
              </Text>
            )}
            {phoneNumber && !checkingNumber && !phoneError && validatePhoneNumber(phoneNumber, countryCode) && (
              <Text className="text-green-600 text-sm mt-1">
                ✓ Valid phone number
              </Text>
            )}
          </View>

          {/* Role */}
          <View className="space-y-2" style={{ zIndex: 1000 }}>
            <Text className="text-[#070707] text-base">Role</Text>
            <DropDownPicker
              open={roleOpen}
              value={selectedRole}
              items={roleItems}
              setOpen={setRoleOpen}
              setValue={(callback: any) => {
                if (typeof callback === 'function') {
                  setSelectedRole(callback(selectedRole));
                } else {
                  setSelectedRole(callback);
                }
              }}
              setItems={() => {}}
              placeholder="Select Role"
              placeholderStyle={{ color: "#9CA3AF", fontSize: 14 }}
              style={{
                backgroundColor: "#F4F4F4",
                borderColor: "#F4F4F4",
                borderRadius: 8,
                minHeight: 56,
                paddingHorizontal: 16,
              }}
              textStyle={{ color: "#374151", fontSize: 14 }}
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
                zIndex: 2000,
              }}
              listMode="SCROLLVIEW"
              closeAfterSelecting={true}
              disabled={isSubmitting}
            />
          </View>
        </View>

        {/* Spacer to push save button to bottom */}
        <View className="flex-1" />

        {/* Save Button */}
        <View className="px-6 pb-8 pt-6">
          <TouchableOpacity
            onPress={handleSave}
            className={`${
              isSubmitting ? "bg-gray-400" : "bg-black"
            } rounded-full py-4 items-center justify-center`}
            activeOpacity={0.8}
            disabled={isSubmitting}
          >
            <Text className="text-white text-lg font-semibold">
              {isSubmitting ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddnewStaff;