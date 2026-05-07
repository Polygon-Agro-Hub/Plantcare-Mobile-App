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
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import countryData from "@/assets/jsons/common/country-flag.json";
import CustomHeader from "../../common/CustomHeader";
import GlobalSearchModal from "../../common/GlobalSearchModal";

interface RouteParams {
  farmId: number;
  regCode: string;
}

interface AddnewStaffProps {
  navigation: any;
  route: {
    params: RouteParams;
  };
}

const AddnewStaff: React.FC<AddnewStaffProps> = ({ navigation, route }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+94");
  const [selectedRole, setSelectedRole] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingNumber, setCheckingNumber] = useState(false);
  const [nicDuplicateErrors, setNicDuplicateErrors] = useState<string | null>(
    null,
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [nicErrors, setNicErrors] = useState<string | null>(null);
  const [checkingNIC, setCheckingNIC] = useState(false);
  const [nic, setNicNumber] = useState("");

  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [countryModalVisible, setCountryModalVisible] = useState(false);

  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { farmId, regCode } = route.params;
  const { t } = useTranslation();

  const roleItems = [
    { label: t("Farms.Manager"), value: "Manager" },
    { label: t("Farms.Supervisor"), value: "Supervisor" },
    { label: t("Farms.Worker"), value: "Laborer" },
  ];

  const countryModalData = countryData.map((country) => ({
    label: `${country.emoji}  ${country.name}  (${country.dial_code})`,
    value: country.dial_code,
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
    const cleanNumber = number.replace(/\D/g, "");
    const isValid = /^7\d{8}$/.test(cleanNumber);
    return isValid;
  };

  const formatPhoneInput = (text: string): string => {
    let digits = text.replace(/\D/g, "");
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
      if (!token) throw new Error("Authentication required");

      await axios.post(
        `${environment.API_BASE_URL}api/farm/members-phoneNumber-checker`,
        { phoneNumber: fullNumber },
        { headers: { Authorization: `Bearer ${token}` } },
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

  const debouncedCheckNumber = useCallback((number: string) => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => {
      checkPhoneNumber(number);
    }, 800);
  }, []);

  const handlePhoneChange = (text: string) => {
    const digitsOnly = text.replace(/\D/g, "");
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
      if (formattedText[0] !== "7") {
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
    if (
      fullNumber &&
      fullNumber.length > 5 &&
      formattedText[0] === "7" &&
      formattedText.length === 9
    ) {
      debouncedCheckNumber(fullNumber);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, []);

  const resetFormState = useCallback(() => {
    setFirstName("");
    setLastName("");
    setPhoneNumber("");
    setCountryCode("+94");
    setSelectedRole("");
    setPhoneError(null);
    setIsSubmitting(false);
    setCheckingNumber(false);
    setValidationError(null);
    setNicNumber("");
    setNicErrors(null);
    setCheckingNIC(false);
    setNicDuplicateErrors(null);
    setRoleModalVisible(false);
    setCountryModalVisible(false);
  }, []);

  useEffect(() => {
    resetFormState();
  }, []);

  const validateForm = () => {
    if (!firstName.trim()) {
      Alert.alert(t("Main.Sorry"), t("Farms.Please enter first name"), [
        { text: t("Main.OK") },
      ]);
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert(t("Main.Sorry"), t("Farms.Please enter last name"), [
        { text: t("Main.OK") },
      ]);
      return false;
    }
    if (!phoneNumber.trim()) {
      Alert.alert(t("Main.Sorry"), t("Farms.Please enter phone number"), [
        { text: t("Main.OK") },
      ]);
      return false;
    }
    if (!nic.trim()) {
      Alert.alert(t("Main.Sorry"), t("Farms.Please enter NIC"), [
        { text: t("Main.OK") },
      ]);
      return false;
    }

    if (!validateSriLankanPhoneNumber(phoneNumber)) {
      if (phoneNumber.length !== 9) {
        Alert.alert(
          t("Main.Sorry"),
          t("Farms.Phone number must be exactly 9 digits"),
          [{ text: t("Main.OK") }],
        );
      } else if (phoneNumber[0] !== "7") {
        Alert.alert(
          t("Main.Sorry"),
          t("Farms.Phone number must start with 7"),
          [{ text: t("Main.OK") }],
        );
      } else if (phoneNumber.length > 9) {
        Alert.alert(
          t("Main.Sorry"),
          t("Farms.Phone number cannot exceed 9 digits"),
          [{ text: t("Main.OK") }],
        );
      } else {
        Alert.alert(
          t("Main.Sorry"),
          t("Farms.Please enter a valid phone number"),
          [{ text: t("Main.OK") }],
        );
      }
      return false;
    }

    if (!selectedRole) {
      Alert.alert(t("Main.Sorry"), t("Farms.Please select a role"), [
        { text: t("Main.OK") },
      ]);
      return false;
    }
    if (phoneError) {
      Alert.alert(t("Main.Sorry"), phoneError, [
        { text: t("Main.OK") },
      ]);
      return false;
    }
    if (validationError) {
      Alert.alert(t("Main.Sorry"), validationError, [
        { text: t("Main.OK") },
      ]);
      return false;
    }
    if (nicErrors) {
      Alert.alert(
        t("Main.Sorry"),
        t("Farms.Please enter a valid Sri Lankan NIC"),
        [{ text: t("Main.OK") }],
      );
      return false;
    }
    if (nicDuplicateErrors) {
      Alert.alert(
        t("Main.Sorry"),
        t("Farms.This NIC is already used by another staff member"),
        [{ text: t("Main.OK") }],
      );
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

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
        nic: nic.trim(),
      };

      await axios.post(
        `${environment.API_BASE_URL}api/farm/create-new-staffmember/${farmId}`,
        staffData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      Alert.alert(
        t("Main.Success"),
        `${t("Farms.Staff members has been added successfully!")}`,
        [
          {
            text: t("Main.OK"),
            onPress: () => {
              navigation.navigate("Main", {
                screen: "EditManagersScreen",
                params: { farmId, regCode },
              });
            },
          },
        ],
      );
    } catch (error: any) {
      console.error("Error in handleSave:", error);
      let errorMessage = t(
        "Farms.Failed to add staff member. Please try again.",
      );

      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = t("Farms.Network error. Please check your connection.");
      }

      Alert.alert("Error", errorMessage, [{ text: t("Main.OK") }]);
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
          params: { farmId: farmId, regCode: regCode },
        });
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackPress,
      );

      return () => backHandler.remove();
    }, [navigation, farmId, resetFormState]),
  );

  const handleNicChange = (nicValue: string) => {
    const formattedNic = nicValue.replace(/\s/g, "").toUpperCase();
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
    const cleanNic = nic.replace(/\s/g, "").toUpperCase();
    const oldFormat = /^[0-9]{9}[VX]$/;
    const newFormat = /^[0-9]{12}$/;
    return oldFormat.test(cleanNic) || newFormat.test(cleanNic);
  };

  const debouncedCheckNic = useCallback((nic: string) => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => {
      checkNic(nic);
    }, 800);
  }, []);

  const checkNic = async (nic: string) => {
    setCheckingNIC(true);
    setNicDuplicateErrors(null);

    try {
      const token = await getAuthToken();
      if (!token) throw new Error("Authentication required");

      await axios.post(
        `${environment.API_BASE_URL}api/farm/members-nic-checker`,
        { nic: nic },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setNicDuplicateErrors(null);
    } catch (error: any) {
      if (error?.response?.status === 409) {
        setNicDuplicateErrors(
          t("Farms.This NIC is already used by another staff member"),
        );
      } else if (error?.response) {
        setNicDuplicateErrors(t("Farms.Error checking NIC number"));
      } else {
        setNicDuplicateErrors(null);
      }
    } finally {
      setCheckingNIC(false);
    }
  };

  const selectedCountry = countryData.find((c) => c.dial_code === countryCode);

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
        <CustomHeader
          title={t("Farms.Add New Staff Member")}
          navigation={navigation}
          onBackPress={() =>
            navigation.navigate("Main", {
              screen: "EditManagersScreen",
              params: { farmId: farmId, regCode: regCode },
            })
          }
        />

        <View className="px-4 gap-6 pt-3">
          {/* Role */}
          <View className="gap-2">
            <Text className="text-gray-900 text-base">{t("Farms.Role")}</Text>
            <TouchableOpacity
              onPress={() => !isSubmitting && setRoleModalVisible(true)}
              className="bg-gray-100 px-4 rounded-full flex-row items-center justify-between"
              style={{ height: hp(7) }}
              activeOpacity={0.7}
            >
              <Text
                className={
                  selectedRole
                    ? "text-gray-700 text-base"
                    : "text-gray-400 text-base"
                }
              >
                {selectedRole
                  ? roleItems.find((r) => r.value === selectedRole)?.label
                  : t("Farms.Select Role")}
              </Text>
              <AntDesign name="caret-down" size={14} color="#555" />
            </TouchableOpacity>

            <GlobalSearchModal
              visible={roleModalVisible}
              onClose={() => setRoleModalVisible(false)}
              title={t("Farms.Role")}
              data={roleItems}
              selectedItems={selectedRole ? [selectedRole] : []}
              onSelect={(items) => setSelectedRole(items[0] ?? "")}
              searchPlaceholder={t("Farms.Select Role")}
              showSearch={false}
              multiSelect={false}
            />
          </View>

          {/* First Name */}
          <View className="gap-2">
            <Text className="text-gray-900 text-base">
              {t("Farms.First Name")}
            </Text>
            <TextInput
              className="bg-gray-100 px-4 rounded-3xl h-[50px] text-base text-gray-700"
              placeholder={t("Farms.Enter First Name")}
              placeholderTextColor="#9CA3AF"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              editable={!isSubmitting}
            />
          </View>

          {/* Last Name */}
          <View className="gap-2">
            <Text className="text-gray-900 text-base">
              {t("Farms.Last Name")}
            </Text>
            <TextInput
              className="bg-gray-100 px-4 py-3 rounded-3xl h-[50px] text-base text-gray-700"
              placeholder={t("Farms.Enter Last Name")}
              placeholderTextColor="#9CA3AF"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              editable={!isSubmitting}
            />
          </View>

          {/* Phone Number */}
          <View className="gap-2">
            <Text className="text-gray-900 text-base">
              {t("Farms.Phone Number")}
            </Text>
            <View className="flex-row items-center">
              {/* Country Code Trigger */}
              <TouchableOpacity
                onPress={() => !isSubmitting && setCountryModalVisible(true)}
                className="bg-[#F4F4F4] rounded-3xl h-[50px] flex-row items-center justify-between px-4 mr-2"
                style={{ width: wp(33), height: hp(7) }}
                activeOpacity={0.7}
              >
                <Text className="text-base text-gray-700">
                  {selectedCountry?.emoji ?? "🇱🇰"}
                  {"  "}({countryCode})
                </Text>
                <AntDesign name="caret-down" size={14} color="#555" />
              </TouchableOpacity>

              {/* Phone Input */}
              <View style={{ flex: 1 }}>
                <TextInput
                  className="bg-[#F4F4F4] rounded-3xl h-[50px] px-4"
                  placeholder="7X XXXXXXX"
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  maxLength={9}
                  style={{ height: hp(7), fontSize: 14 }}
                  underlineColorAndroid="transparent"
                  cursorColor="#141415ff"
                  editable={!isSubmitting}
                />
              </View>
            </View>

            {checkingNumber && (
              <View className="flex-row items-center mt-1 ml-3">
                <ActivityIndicator size="small" color="#2563EB" />
                <Text className="text-blue-600 text-sm ml-2">
                  {t("Farms.Checking number...")}
                </Text>
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

            {/* Country Code Modal */}
            <GlobalSearchModal
              visible={countryModalVisible}
              onClose={() => setCountryModalVisible(false)}
              title={t("Farms.Select Country Code")}
              data={countryModalData}
              selectedItems={[countryCode]}
              onSelect={(items) => setCountryCode(items[0] ?? "+94")}
              searchPlaceholder={t("Farms.Search country...")}
              searchKeys={["label"]}
              showSearch={true}
              multiSelect={false}
            />
          </View>

          {/* NIC */}
          <View className="gap-2">
            <Text className="text-gray-900 text-base">{t("Farms.NIC")}</Text>
            <TextInput
              value={nic}
              onChangeText={(text: string) => handleNicChange(text)}
              placeholder={t("Farms.Enter NIC")}
              placeholderTextColor="#9CA3AF"
              className="bg-[#F4F4F4] p-4 mx-4 rounded-3xl h-[50px] text-gray-800  text-base"
              editable={!isSubmitting}
              autoCapitalize="characters"
              maxLength={12}
            />
            {checkingNIC && (
              <View className="flex-row items-center mt-1 ml-3">
                <ActivityIndicator size="small" color="#2563EB" />
                <Text className="text-blue-600 text-sm ml-2">
                  {t("Farms.Checking NIC...")}
                </Text>
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

        {/* Save Button */}
        <View className="pt-10 pb-32 items-center">
          <TouchableOpacity
            onPress={handleSave}
            className={`${isSubmitting || checkingNumber || checkingNIC
              ? "bg-gray-400"
              : "bg-black"
              } rounded-3xl h-[50px] items-center justify-center w-2/3`}
            activeOpacity={0.8}
            disabled={isSubmitting || checkingNumber || checkingNIC}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.25,
              shadowRadius: 6,
              elevation: 8,
            }}
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
                {t("Main.Save")}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddnewStaff;
