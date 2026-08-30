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
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import countryData from "@/assets/jsons/common/country-flag.json";
import CustomHeader from "../common/CustomHeader";
import GlobalSearchModal from "../common/GlobalSearchModal";

interface RouteParams {
  farmId: number;
}

interface SupervisorAddStaffProps {
  navigation: any;
  route: {
    params: RouteParams;
  };
}

const SupervisorAddStaff: React.FC<SupervisorAddStaffProps> = ({
  navigation,
  route,
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+94");
  const [selectedCountryFlag, setSelectedCountryFlag] = useState("🇱🇰");
  const [countryModalVisible, setCountryModalVisible] = useState(false);
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

  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nicDebounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const { farmId } = route.params;
  const { t } = useTranslation();

  const selectedRole = "Laborer";

  const countryCodeItems = countryData.map((country) => ({
    label: `${country.emoji}  ${country.name}  (${country.dial_code})`,
    value: country.dial_code,
    flag: country.emoji,
    dialCode: country.dial_code,
    countryName: country.name,
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
    return /^7\d{8}$/.test(cleanNumber);
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
      await axios.post(
        `${environment.API_BASE_URL}api/farm/members-phoneNumber-checker`,
        { phoneNumber: fullNumber },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPhoneError(null);
    } catch (error: any) {
      if (error?.response?.status === 409) {
        setPhoneError(t("Farms.ThisPhoneNumberIsAlreadyRegistered"));
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
      setValidationError(t("Farms.PhoneNumberCannotExceed9Digits"));
      setPhoneNumber(formatPhoneInput(text));
      return;
    }

    const formattedText = formatPhoneInput(text);
    setPhoneNumber(formattedText);
    setValidationError(null);

    if (formattedText.length > 0) {
      if (formattedText[0] !== "7") {
        setValidationError(t("Farms.PhoneNumberMustStartWith7"));
      } else if (formattedText.length < 9) {
        setValidationError(t("Farms.PhoneNumberMustBeExactly9Digits"));
      } else if (!validateSriLankanPhoneNumber(formattedText)) {
        setValidationError(t("Farms.Please enter a valid phone number"));
      }
    }

    const fullNumber = countryCode + formattedText;
    if (
      fullNumber.length > 5 &&
      formattedText[0] === "7" &&
      formattedText.length === 9
    ) {
      debouncedCheckNumber(fullNumber);
    }
  };

  const validateSriLankanNic = (nic: string): boolean => {
    if (!nic || nic.trim() === "") return false;
    const cleanNic = nic.replace(/\s/g, "").toUpperCase();
    return /^[0-9]{9}[VX]$/.test(cleanNic) || /^[0-9]{12}$/.test(cleanNic);
  };

  const checkNic = async (nicValue: string) => {
    if (
      !nicValue ||
      nicValue.trim() === "" ||
      !validateSriLankanNic(nicValue)
    ) {
      setNicDuplicateErrors(null);
      setCheckingNIC(false);
      return;
    }
    setCheckingNIC(true);
    setNicDuplicateErrors(null);
    try {
      const token = await getAuthToken();
      await axios.post(
        `${environment.API_BASE_URL}api/farm/members-nic-checker`,
        { nic: nicValue.trim().toUpperCase() },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setNicDuplicateErrors(null);
    } catch (error: any) {
      if (error?.response?.status === 409) {
        setNicDuplicateErrors(
          t("Farms.ThisNICIsAlreadyUsedByAnotherStaffMember"),
        );
      } else {
        setNicDuplicateErrors(null);
      }
    } finally {
      setCheckingNIC(false);
    }
  };

  const debouncedCheckNic = useCallback((nicValue: string) => {
    if (nicDebounceTimeoutRef.current)
      clearTimeout(nicDebounceTimeoutRef.current);
    nicDebounceTimeoutRef.current = setTimeout(() => {
      checkNic(nicValue);
    }, 800);
  }, []);

  const handleNicChange = (nicValue: string) => {
    const formattedNic = nicValue.replace(/\s/g, "").toUpperCase();
    setNicNumber(formattedNic);
    setNicDuplicateErrors(null);

    if (formattedNic.length > 0) {
      if (!validateSriLankanNic(formattedNic)) {
        setNicErrors(t("Farms.PleaseEnterAValidSriLankanNIC"));
      } else {
        setNicErrors(null);
        debouncedCheckNic(formattedNic);
      }
    } else {
      setNicErrors(null);
      setNicDuplicateErrors(null);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      if (nicDebounceTimeoutRef.current)
        clearTimeout(nicDebounceTimeoutRef.current);
    };
  }, []);

  const resetFormState = useCallback(() => {
    setFirstName("");
    setLastName("");
    setPhoneNumber("");
    setCountryCode("+94");
    setSelectedCountryFlag("🇱🇰");
    setPhoneError(null);
    setIsSubmitting(false);
    setCheckingNumber(false);
    setValidationError(null);
    setNicNumber("");
    setNicErrors(null);
    setCheckingNIC(false);
    setNicDuplicateErrors(null);
    setCountryModalVisible(false);
  }, []);

  useEffect(() => {
    resetFormState();
  }, []);

  const validateForm = () => {
    if (!firstName.trim()) {
      Alert.alert(t("Main.Sorry"), t("Farms.PleaseEnterFirstName"), [
        { text: t("Main.OK") },
      ]);
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert(t("Main.Sorry"), t("Farms.PleaseEnterLastName"), [
        { text: t("Main.OK") },
      ]);
      return false;
    }
    if (!phoneNumber.trim()) {
      Alert.alert(t("Main.Sorry"), t("Farms.PleaseEnterPhoneNumber"), [
        { text: t("Main.OK") },
      ]);
      return false;
    }
    if (!nic.trim()) {
      Alert.alert(t("Main.Sorry"), t("Farms.PleaseEnterNIC"), [
        { text: t("Main.OK") },
      ]);
      return false;
    }
    if (!validateSriLankanPhoneNumber(phoneNumber)) {
      const msg =
        phoneNumber.length !== 9
          ? t("Farms.PhoneNumberMustBeExactly9Digits")
          : phoneNumber[0] !== "7"
            ? t("Farms.PhoneNumberMustStartWith7")
            : t("Farms.Please enter a valid phone number");
      Alert.alert(t("Main.Sorry"), msg, [{ text: t("Main.OK") }]);
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
    if (nicErrors || !validateSriLankanNic(nic)) {
      Alert.alert(
        t("Main.Sorry"),
        t("Farms.PleaseEnterAValidSriLankanNIC"),
        [{ text: t("Main.OK") }],
      );
      return false;
    }
    if (nicDuplicateErrors) {
      Alert.alert(t("Main.Sorry"), nicDuplicateErrors, [
        { text: t("Main.OK") },
      ]);
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
      await axios.post(
        `${environment.API_BASE_URL}api/staff/create-new-staffmember/${farmId}`,
        {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phoneNumber,
          countryCode,
          role: selectedRole,
          farmId,
          nic: nic.trim().toUpperCase(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      Alert.alert(
        t("Main.Success"),
        t("Farms.StaffMembersHasBeenAddedSuccessfully"),
        [{ text: t("Main.OK"), onPress: () => navigation.goBack() }],
      );
    } catch (error: any) {
      let errorMessage = t(
        "Farms.FailedToAddStaffMemberPleaseTryAgain",
      );
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
        if (
          error.response.status === 409 &&
          error.response.data?.message?.includes("NIC")
        ) {
          errorMessage = t(
            "Farms.ThisNICIsAlreadyUsedByAnotherStaffMember",
          );
        }
      } else if (error.request) {
        errorMessage = t("Farms.NetworkErrorPleaseCheckYourConnection");
      }
      Alert.alert("Error", errorMessage, [{ text: t("Main.OK") }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      resetFormState();
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          navigation.goBack();
          return true;
        },
      );
      return () => backHandler.remove();
    }, [navigation, farmId, resetFormState]),
  );

  const handleCountrySelect = (selected: string[]) => {
    if (selected.length === 0) return;
    const dialCode = selected[0];
    const match = countryCodeItems.find((c) => c.value === dialCode);
    if (match) {
      setCountryCode(match.dialCode);
      setSelectedCountryFlag(match.flag);
    }
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
        <CustomHeader
          title={t("Farms.AddNewStaffMember")}
          showBackButton={true}
          navigation={navigation}
          onBackPress={() => navigation.goBack()}
        />

        <View className="px-8 gap-6 pt-3">
          {/* Role */}
          <View className="gap-2">
            <Text className="text-gray-900 text-base">{t("Farms.Role")}</Text>
            <View className="bg-gray-100 px-4 py-3 rounded-full">
              <Text className="text-base text-gray-700">
                {t("Farms.FarmLaborer") || t("Farms.Laborer") || "Farm Laborer"}
              </Text>
            </View>
          </View>

          {/* First Name */}
          <View className="gap-2">
            <Text className="text-gray-900 text-base">
              {t("Inputs.FirstName")}
            </Text>
            <View className="bg-gray-100 px-4 rounded-3xl h-[50px] justify-center">
              <TextInput
                className="text-base text-gray-700 w-full"
                style={{ paddingVertical: 0 }}
                placeholder={t("Farms.EnterFirstName")}
                placeholderTextColor="#9CA3AF"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                editable={!isSubmitting}
              />
            </View>
          </View>

          {/* Last Name */}
          <View className="gap-2">
            <Text className="text-gray-900 text-base">
              {t("Inputs.LastName")}
            </Text>
            <View className="bg-gray-100 px-4 rounded-3xl h-[50px] justify-center">
              <TextInput
                className="text-base text-gray-700 w-full"
                style={{ paddingVertical: 0 }}
                placeholder={t("Farms.EnterLastName")}
                placeholderTextColor="#9CA3AF"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                editable={!isSubmitting}
              />
            </View>
          </View>

          {/* Phone Number */}
          <View className="gap-2">
            <Text className="text-gray-900 text-base">
              {t("Farms.PhoneNumber")}
            </Text>
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => !isSubmitting && setCountryModalVisible(true)}
                style={{ height: hp(7) }}
                className="bg-[#F4F4F4] rounded-3xl px-4 flex-row items-center justify-center min-w-[100px]"
                disabled={isSubmitting}
              >
                <Text className="text-base">
                  {selectedCountryFlag} {countryCode}
                </Text>
              </TouchableOpacity>

              {/* Phone Input */}
              <View className="flex-1 bg-[#F4F4F4] rounded-3xl h-[50px] px-4 justify-center">
                <TextInput
                  className="text-base text-gray-700 w-full"
                  placeholder="7X XXXXXXX"
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  maxLength={9}
                  style={{ fontSize: 14, paddingVertical: 0 }}
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
                  {t("Farms.CheckingNumber...")}
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
          </View>

          {/* NIC */}
          <View className="gap-2">
            <Text className="text-gray-900 text-base">{t("Farms.NIC")}</Text>
            <View className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] justify-center">
              <TextInput
                value={nic}
                onChangeText={handleNicChange}
                placeholder={t("Farms.EnterNIC")}
                placeholderTextColor="#9CA3AF"
                className="text-gray-800 text-base w-full"
                style={{ paddingVertical: 0 }}
                editable={!isSubmitting}
                autoCapitalize="characters"
                maxLength={12}
              />
            </View>
            {checkingNIC && (
              <View className="flex-row items-center mt-1 ml-3">
                <ActivityIndicator size="small" color="#2563EB" />
                <Text className="text-blue-600 text-sm ml-2">
                  {t("Farms.CheckingNIC...")}
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
        <View className="pt-10 pb-32 px-[15%]">
          <TouchableOpacity
            onPress={handleSave}
            className={`${isSubmitting || checkingNumber || checkingNIC
              ? "bg-gray-400"
              : "bg-black"
              } rounded-full py-3 items-center justify-center`}
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
                {t("Main.Save")}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Country Code Modal */}
      <GlobalSearchModal
        visible={countryModalVisible}
        onClose={() => setCountryModalVisible(false)}
        title={t("Farms.Select Country Code")}
        data={countryCodeItems}
        selectedItems={[countryCode]}
        onSelect={handleCountrySelect}
        searchPlaceholder={t("Farms.Search country...")}
        searchKeys={["label", "countryName", "dialCode"]}
        multiSelect={false}
        showSearch={true}
      />
    </KeyboardAvoidingView>
  );
};

export default SupervisorAddStaff;
