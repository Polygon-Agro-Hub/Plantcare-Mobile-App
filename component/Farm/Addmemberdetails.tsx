import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import DropDownPicker from "react-native-dropdown-picker";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/component/types";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

// Import Redux selectors and actions
import {
  selectFarmSecondDetails,
  selectFarmBasicDetails,
  selectLoginCredentialsNeeded,
} from "../../store/farmSlice";
import type { RootState, AppDispatch } from "../../services/reducxStore";

// Staff member interface
interface StaffMember {
  firstName: string;
  lastName: string;
  phone: string;
  countryCode: string;
  role: string | null;
}

// Extended interface for country items with flag property
interface CountryItem {
  label: string;
  value: string;
  flag: string;
}

// Phone Input Component
interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
}

// Updated PhoneInput Component with separate fields
const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChangeText,
  countryCode,
  onCountryCodeChange,
  placeholder = "Enter Phone Number",
  label = "Phone Number",
  error,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const countryItems: CountryItem[] = [
    { label: "+94", value: "+94", flag: "🇱🇰" }, // Sri Lanka
    { label: "+1", value: "+1", flag: "🇺🇸" },   // USA
    { label: "+44", value: "+44", flag: "🇬🇧" }, // UK
    { label: "+91", value: "+91", flag: "🇮🇳" }, // India
    { label: "+61", value: "+61", flag: "🇦🇺" }, // Australia
    { label: "+86", value: "+86", flag: "🇨🇳" }, // China
    { label: "+33", value: "+33", flag: "🇫🇷" }, // France
    { label: "+49", value: "+49", flag: "🇩🇪" }, // Germany
  ];

  // Format phone number based on country code
  const formatPhoneNumber = (phone: string, code: string): string => {
    const digits = phone.replace(/\D/g, '');
    
    if (code === "+94") {
      // Sri Lankan format: 7XXXXXXXX (without leading 0)
      if (digits.length === 0) return '';
      // Remove leading 0 if present
      const cleanDigits = digits.startsWith('0') ? digits.slice(1) : digits;
      return cleanDigits.slice(0, 9); // Limit to 9 digits
    } else if (code === "+1") {
      // US format: XXX-XXX-XXXX
      return digits.slice(0, 10);
    } else {
      // Default: limit to 10 digits
      return digits.slice(0, 10);
    }
  };

  const handlePhoneChange = (text: string) => {
    const formattedPhone = formatPhoneNumber(text, countryCode);
    onChangeText(formattedPhone);
  };

  const validatePhoneNumber = (phone: string, code: string): boolean => {
    const cleanPhone = phone.replace(/\s+/g, '');
    
    if (code === "+94") {
      // Sri Lankan: 7XXXXXXXX (9 digits starting with 7)
      const phoneRegex = /^7\d{8}$/;
      return phoneRegex.test(cleanPhone);
    } else if (code === "+1") {
      // US: 10 digits
      const phoneRegex = /^\d{10}$/;
      return phoneRegex.test(cleanPhone);
    } else {
      // Default validation: 7-15 digits
      const phoneRegex = /^\d{7,15}$/;
      return phoneRegex.test(cleanPhone);
    }
  };

  const isValid = !value || validatePhoneNumber(value, countryCode);

  return (
    <View style={{ zIndex: dropdownOpen ? 9999 : 1, position: 'relative' }}>
      <Text className="text-[#070707] font-medium mb-2 mt-3">{label}</Text>
      
      {/* Two separate fields container */}
      <View className="flex-row space-x-3">
        {/* Country Code Dropdown - Separate Field */}
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

        {/* Phone Number Input - Separate Field */}
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
            editable={!dropdownOpen} // Disable when dropdown is open
          />
        </View>
      </View>
      
      {error && <Text className="text-red-500 text-sm mt-1 ml-3">{error}</Text>}
      {!isValid && value && (
        <Text className="text-red-500 text-sm mt-1 ml-3">
          Please enter a valid phone number
        </Text>
      )}
    </View>
  );
};

const AddMemberDetails: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch<AppDispatch>();

  // Get data from Redux
  const farmSecondDetails = useSelector((state: RootState) => selectFarmSecondDetails(state));
  const farmBasicDetails = useSelector((state: RootState) => selectFarmBasicDetails(state));
  const loginCredentialsNeeded = useSelector((state: RootState) =>
    selectLoginCredentialsNeeded(state)
  );

  // Parse the number of staff members who need login credentials
  // Fix for Error 2345: Handle undefined case explicitly
  const numStaff = parseInt(loginCredentialsNeeded || "1", 10) || 1;

  // State for dynamic staff members
  const [staff, setStaff] = useState<StaffMember[]>([]);

  // Role items for dropdowns
  const [roleItems] = useState([
    { label: "Manager", value: "Manager" },
    { label: "Supervisor", value: "Supervisor" },
    { label: "Worker", value: "Worker" },
  ]);

  // State for dropdown open/close and values
  const [dropdownStates, setDropdownStates] = useState<
    { [key: number]: { open: boolean; value: string | null } }
  >({});

  // Initialize staff and dropdown states
  useEffect(() => {
    if (numStaff > 0) {
      const newStaff = Array.from({ length: numStaff }, () => ({
        firstName: "",
        lastName: "",
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

  // Phone number validation function
  const validatePhoneNumber = (phone: string, countryCode: string): boolean => {
    const cleanPhone = phone.replace(/\s+/g, '');
    
    if (countryCode === "+94") {
      // Sri Lankan: 7XXXXXXXX (9 digits starting with 7)
      const phoneRegex = /^7\d{8}$/;
      return phoneRegex.test(cleanPhone);
    } else if (countryCode === "+1") {
      // US: 10 digits
      const phoneRegex = /^\d{10}$/;
      return phoneRegex.test(cleanPhone);
    } else {
      // Default validation: 7-15 digits
      const phoneRegex = /^\d{7,15}$/;
      return phoneRegex.test(cleanPhone);
    }
  };

  // Update staff state
  const updateStaff = (index: number, field: keyof StaffMember, value: any) => {
    setStaff((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  // Handle dropdown open/close
  const setDropdownOpen = (index: number, open: boolean) => {
    setDropdownStates((prev) => {
      const newStates = { ...prev };
      // Close all dropdowns first
      Object.keys(newStates).forEach((key) => {
        newStates[parseInt(key)] = {
          ...newStates[parseInt(key)],
          open: false,
        };
      });
      // Then open the specific one if needed
      if (open) {
        newStates[index] = {
          ...newStates[index],
          open: true,
        };
      }
      return newStates;
    });
  };

  // Handle dropdown value change
  const setDropdownValue = (index: number, callback: any) => {
    const currentValue = dropdownStates[index]?.value || null;
    const newValue = typeof callback === "function" ? callback(currentValue) : callback;
    
    setDropdownStates((prev) => ({
      ...prev,
      [index]: { ...prev[index], value: newValue, open: false }, // Auto close after selection
    }));
    updateStaff(index, "role", newValue);
  };

  const handleSaveFarm = () => {
    // Validate required fields
    for (let i = 0; i < staff.length; i++) {
      const { firstName, lastName, phone, countryCode, role } = staff[i];
      if (!firstName.trim()) {
        Alert.alert("Validation Error", `Please enter first name for Staff ${i + 1}`);
        return;
      }
      if (!lastName.trim()) {
        Alert.alert("Validation Error", `Please enter last name for Staff ${i + 1}`);
        return;
      }
      if (!phone.trim()) {
        Alert.alert("Validation Error", `Please enter phone number for Staff ${i + 1}`);
        return;
      }
      if (!validatePhoneNumber(phone, countryCode)) {
        Alert.alert("Validation Error", `Please enter a valid phone number for Staff ${i + 1}`);
        return;
      }
      if (!role) {
        Alert.alert("Validation Error", `Please select a role for Staff ${i + 1}`);
        return;
      }
    }

    

    // Prepare complete farm data
    const completeFarmData = {
      basicDetails: farmBasicDetails,
      secondDetails: farmSecondDetails,
      staffDetails: staff.map((member, index) => ({
        id: index + 1,
        firstName: member.firstName.trim(),
        lastName: member.lastName.trim(),
        phone: member.countryCode + member.phone.trim(), // Combine country code and phone
        role: member.role,
      })),
    };

    console.log("Complete Farm Data:", completeFarmData);
    Alert.alert("Success", "Farm saved successfully!", [
      {
        text: "OK",
        onPress: () => navigation.navigate("AddFarmList" as any),
      },
    ]);
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Show loading if Redux data is not available
  if (!farmSecondDetails || !loginCredentialsNeeded) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-lg text-gray-600">Loading farm details...</Text>
        <TouchableOpacity
          className="mt-4 bg-black py-2 px-6 rounded-full"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white">Go Back</Text>
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
            <Text className="font-semibold text-lg ml-[30%]">Add New Farm</Text>
            <View className="bg-[#CDEEFF] px-3 py-1 rounded-lg">
              <Text className="text-[#223FFF] text-xs font-medium">BASIC</Text>
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
            <Text className="font-semibold text-[#5A5A5A]">{`Manager ${index + 1}`}</Text>
            <View className="w-full h-0.5 bg-[#AFAFAF] mx-2" />

            <View>
              <Text className="text-[#070707] font-medium mb-2">First Name</Text>
              <TextInput
                value={member.firstName}
                onChangeText={(text: string) => updateStaff(index, "firstName", text)}
                placeholder="Enter First Name"
                placeholderTextColor="#9CA3AF"
                className="bg-[#F4F4F4] p-3 rounded-full text-gray-800"
              />
            </View>

            <View>
              <Text className="text-[#070707] font-medium mb-2">Last Name</Text>
              <TextInput
                value={member.lastName}
                onChangeText={(text: string) => updateStaff(index, "lastName", text)}
                placeholder="Enter Last Name"
                placeholderTextColor="#9CA3AF"
                className="bg-[#F4F4F4] p-3 rounded-full text-gray-800"
              />
            </View>

            {/* Phone Input */}
            <PhoneInput
              value={member.phone}
              onChangeText={(text: string) => updateStaff(index, "phone", text)}
              countryCode={member.countryCode}
              onCountryCodeChange={(code: string) => updateStaff(index, "countryCode", code)}
              placeholder="Enter Phone Number"
              label="Phone Number"
            />

            <View>
              <Text className="text-[#070707] font-medium mb-2">Role</Text>
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
                placeholder="Select Role"
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
              />
            </View>
          </View>
        ))}

        {/* Buttons */}
        <View className="mt-8 mb-2">
          <TouchableOpacity
            className="bg-[#F3F3F5] py-3 mx-6 rounded-full"
            onPress={handleGoBack}
          >
            <Text className="text-[#84868B] text-center font-semibold text-lg">Go Back</Text>
          </TouchableOpacity>
        </View>
        <View className="mt-2 mb-8">
          <TouchableOpacity
            className="bg-black py-3 mx-6 rounded-full"
            onPress={handleSaveFarm}
          >
            <Text className="text-white text-center font-semibold text-lg">Save Farm</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddMemberDetails;