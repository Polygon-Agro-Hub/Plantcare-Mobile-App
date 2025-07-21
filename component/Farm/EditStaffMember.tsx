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
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { environment } from "@/environment/environment";

type RouteParams = {
  farmId: number;
  staffMemberId?: number;
};

interface EditStaffMemberProps {
  navigation: any;
  route: {
    params: RouteParams;
  };
}

interface CountryItem {
  label: string;
  value: string;
  flag: string;
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
}

interface FarmDetailsResponse extends StaffMemberData {}

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  placeholder?: string;
  label?: string;
  error?: string | null;
  onPhoneError: (error: string | null) => void;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChangeText,
  countryCode,
  onCountryCodeChange,
  placeholder = "Enter Phone Number",
  label = "Phone Number",
  error,
  onPhoneError,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [checkingNumber, setCheckingNumber] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      if (!token) throw new Error("Authentication token not found");
      return token;
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
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

  const checkPhoneNumber = async (phone: string, code: string) => {
    if (!phone || !validatePhoneNumber(phone, code)) {
      onPhoneError(null);
      return;
    }
    
    const fullNumber = code + phone;
    setCheckingNumber(true);
    onPhoneError(null);
    
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
      
      onPhoneError(null);
    } catch (error: any) {
      if (error?.response?.status === 409) {
        onPhoneError("This phone number is already registered");
      } else if (error?.response) {
        onPhoneError("Error checking phone number");
      } else {
        onPhoneError(null);
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

  const isValid = !value || validatePhoneNumber(value, countryCode);

  return (
    <View className="ml-2" style={{ zIndex: dropdownOpen ? 9999 : 1 }}>
      <Text className="text-gray-900 text-base mb-2">{label}</Text>
      
      <View className="flex-row gap-3">
        <View className="w-24" style={{ zIndex: dropdownOpen ? 9999 : 1 }}>
          <DropDownPicker
            open={dropdownOpen}
            value={countryCode}
            items={countryItems}
            setOpen={setDropdownOpen}
            setValue={(callback) => {
              const newValue = typeof callback === 'function' ? callback(countryCode) : callback;
              onCountryCodeChange(newValue);
              if (value) {
                debouncedCheckNumber(value, newValue);
              }
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
              fontSize: 16,
            //  fontWeight: "500",
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
                  className="py-2 px-3 flex-row items-center justify-center bg-transparent"
                  onPress={() => {
                    onCountryCodeChange(countryItem.value);
                    setDropdownOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text className="mr-1.5 text-sm">{countryItem.flag}</Text>
                  <Text className="text-sm text-gray-700 font-medium">{countryItem.label}</Text>
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
            className="bg-gray-100 px-4 py-3 rounded-full text-base text-gray-700 h-12"
            keyboardType="phone-pad"
            editable={!dropdownOpen}
          />
        </View>
      </View>
      
      {checkingNumber && (
        <View className="flex-row items-center mt-1 ml-3">
          <ActivityIndicator size="small" color="#2563EB" />
          <Text className="text-blue-600 text-sm ml-2">Checking number...</Text>
        </View>
      )}
      {error && (
        <Text className="text-red-500 text-sm mt-1 ml-3">
          {error}
        </Text>
      )}
      {!isValid && value && (
        <Text className="text-red-500 text-sm mt-1 ml-3">
          Please enter a valid phone number for {countryCode}
        </Text>
      )}
    </View>
  );
};

const EditStaffMember: React.FC<EditStaffMemberProps> = ({ navigation, route }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+94");
  const [selectedRole, setSelectedRole] = useState("");
  const [roleOpen, setRoleOpen] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { farmId, staffMemberId } = route.params;

  // Changed to store single staff member data
  const [staffData, setStaffData] = useState<StaffMemberData | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('staffMemberId:', staffMemberId);

  const roleItems = [
    { label: "Manager", value: "Manager" },
    { label: "Supervisor", value: "Supervisor" },
    { label: "Worker", value: "Worker" },
    { label: "Admin", value: "Admin" },
  ];

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

  const validateForm = () => {
    if (!firstName.trim()) {
      Alert.alert("Validation Error", "Please enter first name");
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert("Validation Error", "Please enter last name");
      return false;
    }
    if (!phoneNumber.trim()) {
      Alert.alert("Validation Error", "Please enter phone number");
      return false;
    }
    if (!selectedRole) {
      Alert.alert("Validation Error", "Please select a role");
      return false;
    }
    if (phoneError) {
      Alert.alert("Validation Error", phoneError);
      return false;
    }

    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    if (countryCode === "+94" && !/^7\d{8}$/.test(cleanPhone)) {
      Alert.alert("Validation Error", "Please enter a valid Sri Lankan phone number");
      return false;
    }

    return true;
  };

  // Fetch staff member data and populate form fields
  const fetchStaffMember = async () => {
    if (!staffMemberId) {
      Alert.alert("Error", "Staff member ID is missing");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert("Error", "No authentication token found");
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
      setPhoneNumber(res.data.phoneNumber || "");
      setCountryCode(res.data.phoneCode || "+94");
      setSelectedRole(res.data.role || "");

    } catch (err) {
      console.error("Error fetching staff member:", err);
      Alert.alert("Error", "Failed to fetch staff member data");
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
      
      const updatedStaffData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        countryCode: countryCode,
        role: selectedRole,
        farmId: farmId
      };

      // You'll need to create an update endpoint - this is just an example
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
        "Success", 
        `Staff member ${firstName} ${lastName} has been updated successfully!`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      console.error("Error in handleSave:", error);
      let errorMessage = "Failed to update staff member. Please try again.";
      
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading indicator while fetching data
  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="text-gray-600 mt-4">Loading staff member data...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
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
            <Text className="text-black text-xl font-semibold">
              Edit {selectedRole} Details
            </Text>
          </View>
        </View>
        <View className="w-8" />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        className="flex-1 bg-white"
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-8 gap-6 pt-3">
          <View className="gap-2">
            <Text className="text-gray-900 text-base">First Name</Text>
            <TextInput
              className="bg-gray-100 px-4 py-3 rounded-full text-base text-gray-700"
              placeholder="Enter First Name"
              placeholderTextColor="#9CA3AF"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              editable={!isSubmitting}
            />
          </View>

          <View className="gap-2">
            <Text className="text-gray-900 text-base">Last Name</Text>
            <TextInput
              className="bg-gray-100 px-4 py-3 rounded-full text-base text-gray-700"
              placeholder="Enter Last Name"
              placeholderTextColor="#9CA3AF"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              editable={!isSubmitting}
            />
          </View>

<View className="gap-2">
          <PhoneInput
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            countryCode={countryCode}
            onCountryCodeChange={setCountryCode}
            placeholder="Enter Phone Number"
            label="Phone Number"
            error={phoneError}
            onPhoneError={setPhoneError}
          />
          </View>

          <View className="gap-2" style={{ zIndex: roleOpen ? 9999 : 1 }}>
            <Text className="text-gray-900 text-base">Role</Text>
            <DropDownPicker
              open={roleOpen}
              value={selectedRole}
              items={roleItems}
              setOpen={setRoleOpen}
              setValue={setSelectedRole}
              setItems={() => {}}
              placeholder="Select Role"
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
              }}
              listMode="SCROLLVIEW"
              closeAfterSelecting={true}
              disabled={isSubmitting}
            />
          </View>
        </View>

      <View className="px-8 pt-10 pb-4 px-[15%]">
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
                  Save...
                </Text>
              </View>
            ) : (
              <Text className="text-white text-lg font-semibold">
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditStaffMember;