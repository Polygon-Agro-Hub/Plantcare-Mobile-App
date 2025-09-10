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
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n/i18n";
import { useFocusEffect } from "expo-router";
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
  flag: string;
}

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
  const { t } = useTranslation();

  return (
    <View className="ml-2 flex-1" style={{ zIndex: dropdownOpen ? 9999 : 1 }}>
      <Text className="text-gray-900 text-base mb-2">{label}</Text>
      
      <View className="flex-row gap-3 ">
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
          <Text className="text-blue-600 text-sm ml-2">{t("Farms.Checking number...")}</Text>
        </View>
      )}
      {error && (
        <Text className="text-red-500 text-sm mt-1 ml-3">
          {error}
        </Text>
      )}
      {!isValid && value && (
        <Text className="text-red-500 text-sm mt-1 ml-3">
          {t("Farms.Please enter a valid phone number for")}
        </Text>
      )}
    </View>
  );
};

const AddnewStaff: React.FC<AddnewStaffProps> = ({ navigation, route }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+94");
  const [selectedRole, setSelectedRole] = useState("");
  const [roleOpen, setRoleOpen] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { farmId } = route.params;
  const { t } = useTranslation();

  const roleItems = [
    { label: t("Farms.Manager"), value: "Manager" },
    { label: t("Farms.Supervisor"), value: "Supervisor" },
    { label: t("Farms.Worker"), value: "Worker" },
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
      Alert.alert(t("Farms.Sorry"), t("Farms.Please enter first name"));
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert(t("Farms.Sorry"), t("Farms.Please enter last name"));
      return false;
    }
    if (!phoneNumber.trim()) {
      Alert.alert(t("Farms.Sorry"), t("Farms.Please enter phone number"));
      return false;
    }
    if (!selectedRole) {
      Alert.alert(t("Farms.Sorry"), t("Farms.Please select a role"));
      return false;
    }
    if (phoneError) {
      Alert.alert(t("Farms.Sorry"), phoneError);
      return false;
    }

    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    if (countryCode === "+94" && !/^7\d{8}$/.test(cleanPhone)) {
      Alert.alert(t("Farms.Sorry"), t("Farms.Please enter a valid Sri Lankan phone number"));
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await getAuthToken();
      
      const staffData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        countryCode: countryCode,
        role: selectedRole,
        farmId: farmId
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
        t("Farms.Staff members has been added successfully!"),
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      console.error("Error in handleSave:", error);
      let errorMessage = t("Farms.Failed to add staff member. Please try again.");
      
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = t("Farms.Network error. Please check your connection.");
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

    useFocusEffect(
          useCallback(() => {
            const handleBackPress = () => {
             navigation.navigate("Main", { 
    screen: "EditManagersScreen",
   params: { farmId: farmId }
  })
              return true;
            };
        
            BackHandler.addEventListener("hardwareBackPress", handleBackPress);
        
            return () => {
              BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
            };
          }, [navigation])
        );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="bg-white"
      style={{ flex: 1 }}
    >
      <View className="flex-row items-center justify-between px-6 pb-2 mt-3 py-3">
        <View className="flex-row items-center justify-between mb-2">
          <TouchableOpacity
           // onPress={() => navigation.goBack()}
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
    : { fontSize: 15 }
]}
            >
              {t("Farms.Add New Staff Member")}
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

          <PhoneInput
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            countryCode={countryCode}
            onCountryCodeChange={setCountryCode}
            placeholder={t("Farms.Enter Phone Number")}
            label={t("Farms.Phone Number")}
            error={phoneError}
            onPhoneError={setPhoneError}
          />
          </View>

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
              }}
              listMode="SCROLLVIEW"
              closeAfterSelecting={true}
              disabled={isSubmitting}
            />
          </View>
        </View>

        <View className="pt-10 pb-4 px-[15%]">
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

export default AddnewStaff;