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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  RouteProp,
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { AntDesign } from "@expo/vector-icons";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/component/types/types";
import { environment } from "@/environment/environment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import countryData from "@/assets/jsons/common/country-flag.json";

import {
  selectFarmSecondDetails,
  selectFarmBasicDetails,
  selectLoginCredentialsNeeded,
  selectIsSubmitting,
  selectSubmitError,
  selectSubmitSuccess,
  saveFarmToBackend,
  clearSubmitState,
  selectLastCreatedFarmId,
  selectRegistrationCode,
} from "../../../store/farmSlice";
import type { RootState, AppDispatch } from "../../../services/reducxStore";
import { useTranslation } from "react-i18next";
import GlobalSearchModal from "../../common/GlobalSearchModal";

interface StaffMember {
  firstName: string;
  lastName: string;
  phone: string;
  nic: string;
  countryCode: string;
  role: string | null;
}

type AddMemberDetailsRouteProp = RouteProp<
  RootStackParamList,
  "AddNewFarmBasicDetails"
>;

type ModalType = "role" | "countryCode" | null;

const AddMemberDetails: React.FC = () => {
  const route = useRoute<AddMemberDetailsRouteProp>();
  const { membership = "basic" } = route.params || {};

  const [phoneErrors, setPhoneErrors] = useState<{
    [key: number]: string | null;
  }>({});
  const [phoneValidationErrors, setPhoneValidationErrors] = useState<{
    [key: number]: string | null;
  }>({});
  const [nicErrors, setNicErrors] = useState<{ [key: number]: string | null }>(
    {},
  );
  const [nicduplicateErrors, setNicDuplicateErrors] = useState<{
    [key: number]: string | null;
  }>({});
  const [checkingNumber, setCheckingNumber] = useState<{
    [key: number]: boolean;
  }>({});
  const [checkingNIC, setCheckingNIC] = useState<{ [key: number]: boolean }>(
    {},
  );
  const [roleErrors, setRoleErrors] = useState<{
    [key: number]: string | null;
  }>({});
  const [firstNameErrors, setFirstNameErrors] = useState<{
    [key: number]: string | null;
  }>({});
  const [lastNameErrors, setLastNameErrors] = useState<{
    [key: number]: string | null;
  }>({});
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null);
  const [activeModalType, setActiveModalType] = useState<ModalType>(null);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch<AppDispatch>();

  const farmSecondDetails = useSelector((state: RootState) =>
    selectFarmSecondDetails(state),
  );
  const farmBasicDetails = useSelector((state: RootState) =>
    selectFarmBasicDetails(state),
  );
  const loginCredentialsNeeded = useSelector((state: RootState) =>
    selectLoginCredentialsNeeded(state),
  );
  const isSubmitting = useSelector((state: RootState) =>
    selectIsSubmitting(state),
  );
  const submitError = useSelector((state: RootState) =>
    selectSubmitError(state),
  );
  const submitSuccess = useSelector((state: RootState) =>
    selectSubmitSuccess(state),
  );
  const lastCreatedFarmId = useSelector((state: RootState) =>
    selectLastCreatedFarmId(state),
  );
  const registrationCode = useSelector((state: RootState) =>
    selectRegistrationCode(state),
  );

  const numStaff = parseInt(loginCredentialsNeeded || "1", 10) || 1;

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const { t } = useTranslation();

  const roleItems = [
    { label: t("Farms.Manager"), value: "Manager" },
    { label: t("Farms.Supervisor"), value: "Supervisor" },
    { label: t("Farms.Worker"), value: "Laborer" },
  ];

  const countryCodeItems = countryData.map((country) => ({
    label: `${country.emoji}  ${country.name}  (${country.dial_code})`,
    value: country.dial_code,
    dialCode: country.dial_code,
    flag: country.emoji,
  }));

  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alertShownRef = useRef(false);

  useFocusEffect(
    React.useCallback(() => {
      setCheckingNIC({});
      setNicDuplicateErrors({});
      setNicErrors({});
      setPhoneErrors({});
      setPhoneValidationErrors({});
    }, []),
  );

  const validateSriLankanNic = (nic: string): boolean => {
    if (!nic) return false;
    const cleanNic = nic.replace(/\s/g, "").toUpperCase();
    return /^[0-9]{9}[VX]$/.test(cleanNic) || /^[0-9]{12}$/.test(cleanNic);
  };

  const validateSriLankanPhoneNumber = (phone: string): boolean => {
    return /^7\d{8}$/.test(phone.replace(/\s+/g, ""));
  };

  const formatPhoneInput = (text: string): string =>
    text.replace(/\D/g, "").slice(0, 9);

  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) throw new Error("Main.SomethingWentWrongPleaseTryAgainlater");
      return token;
    } catch {
      return null;
    }
  };

  const checkForDuplicatePhone = (
    phone: string,
    countryCode: string,
    currentIndex: number,
  ): boolean => {
    if (!phone.trim()) return false;
    const fullPhone = countryCode + phone;
    return staff.some(
      (member, index) =>
        index !== currentIndex &&
        member.countryCode + member.phone === fullPhone,
    );
  };

  const checkForDuplicateNIC = (nic: string, currentIndex: number): boolean => {
    if (!nic.trim()) return false;
    const cleanNic = nic.replace(/\s/g, "").toUpperCase();
    return staff.some(
      (member, index) =>
        index !== currentIndex &&
        member.nic.replace(/\s/g, "").toUpperCase() === cleanNic,
    );
  };

  const checkNic = async (nic: string, index: number) => {
    setCheckingNIC((prev) => ({ ...prev, [index]: true }));
    try {
      const token = await getAuthToken();
      if (!token) throw new Error("Authentication required");
      await axios.post(
        `${environment.API_BASE_URL}api/farm/members-nic-checker`,
        { nic },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setNicDuplicateErrors((prev) => ({ ...prev, [index]: null }));
    } catch (error: any) {
      if (error?.response?.status === 409) {
        setNicDuplicateErrors((prev) => ({
          ...prev,
          [index]: t("Farms.This NIC is already used by another staff member"),
        }));
      } else if (error?.response) {
        setNicDuplicateErrors((prev) => ({
          ...prev,
          [index]: t("Farms.Error checking NIC number"),
        }));
      } else {
        setNicDuplicateErrors((prev) => ({ ...prev, [index]: null }));
      }
    } finally {
      setCheckingNIC((prev) => ({ ...prev, [index]: false }));
    }
  };

  const debouncedCheckNic = useCallback((nic: string, index: number) => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => checkNic(nic, index), 800);
  }, []);

  const checkPhoneNumber = async (fullNumber: string, index: number) => {
    if (!fullNumber || fullNumber.length < 10) {
      setPhoneErrors((prev) => ({ ...prev, [index]: null }));
      return;
    }
    setCheckingNumber((prev) => ({ ...prev, [index]: true }));
    setPhoneErrors((prev) => ({ ...prev, [index]: null }));
    try {
      const token = await getAuthToken();
      if (!token) return;
      await axios.post(
        `${environment.API_BASE_URL}api/farm/members-phoneNumber-checker`,
        { phoneNumber: fullNumber },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPhoneErrors((prev) => ({ ...prev, [index]: null }));
    } catch (error: any) {
      if (error?.response?.status === 409) {
        setPhoneErrors((prev) => ({
          ...prev,
          [index]: t("Farms.This phone number is already registered"),
        }));
      } else {
        setPhoneErrors((prev) => ({ ...prev, [index]: null }));
      }
    } finally {
      setCheckingNumber((prev) => ({ ...prev, [index]: false }));
    }
  };

  const debouncedCheckNumber = useCallback((number: string, index: number) => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(
      () => checkPhoneNumber(number, index),
      800,
    );
  }, []);

  const updateStaff = (index: number, field: keyof StaffMember, value: any) => {
    setStaff((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
    if (field === "phone")
      setPhoneValidationErrors((prev) => ({ ...prev, [index]: null }));
    if (field === "nic") setNicErrors((prev) => ({ ...prev, [index]: null }));
  };

  const handlePhoneChange = (text: string, index: number) => {
    const digitsOnly = text.replace(/\D/g, "");
    setPhoneErrors((prev) => ({ ...prev, [index]: null }));

    if (digitsOnly.length > 9) {
      setPhoneValidationErrors((prev) => ({
        ...prev,
        [index]: t("Farms.Phone number cannot exceed 9 digits"),
      }));
      updateStaff(index, "phone", formatPhoneInput(text));
      return;
    }

    const formattedText = formatPhoneInput(text);
    updateStaff(index, "phone", formattedText);
    setPhoneValidationErrors((prev) => ({ ...prev, [index]: null }));

    if (formattedText.length > 0) {
      const currentMember = staff[index];
      if (
        checkForDuplicatePhone(formattedText, currentMember.countryCode, index)
      ) {
        setPhoneValidationErrors((prev) => ({
          ...prev,
          [index]: t("Farms.Duplicate numbers are not allowed."),
        }));
      } else if (formattedText[0] !== "7") {
        setPhoneValidationErrors((prev) => ({
          ...prev,
          [index]: t("Farms.Phone number must start with 7"),
        }));
      } else if (formattedText.length < 9) {
        setPhoneValidationErrors((prev) => ({
          ...prev,
          [index]: t("Farms.Phone number must be exactly 9 digits"),
        }));
      } else if (!validateSriLankanPhoneNumber(formattedText)) {
        setPhoneValidationErrors((prev) => ({
          ...prev,
          [index]: t("Farms.Please enter a valid phone number"),
        }));
      }
    }

    const fullNumber = staff[index].countryCode + formattedText;
    if (
      fullNumber.length > 5 &&
      formattedText[0] === "7" &&
      formattedText.length === 9
    ) {
      debouncedCheckNumber(fullNumber, index);
    }
  };

  const handleNicChange = (index: number, nicValue: string) => {
    const formattedNic = nicValue.replace(/\s/g, "").toUpperCase();
    updateStaff(index, "nic", formattedNic);
    setNicDuplicateErrors((prev) => ({ ...prev, [index]: null }));

    if (formattedNic && checkForDuplicateNIC(formattedNic, index)) {
      setNicErrors((prev) => ({
        ...prev,
        [index]: t("Farms.Duplicate NIC numbers are not allowed."),
      }));
    } else if (formattedNic && !validateSriLankanNic(formattedNic)) {
      setNicErrors((prev) => ({
        ...prev,
        [index]: t("Farms.Please enter a valid Sri Lankan NIC"),
      }));
    } else {
      setNicErrors((prev) => ({ ...prev, [index]: null }));
    }

    if (formattedNic.length === 10 || formattedNic.length === 12) {
      debouncedCheckNic(formattedNic, index);
    }
  };

  const openModal = (index: number, type: ModalType) => {
    setActiveModalIndex(index);
    setActiveModalType(type);
  };

  const closeModal = () => {
    setActiveModalIndex(null);
    setActiveModalType(null);
  };

  const handleRoleSelect = (items: string[]) => {
    if (activeModalIndex === null) return;
    const selected = items[0] ?? null;
    updateStaff(activeModalIndex, "role", selected);
    if (selected)
      setRoleErrors((prev) => ({ ...prev, [activeModalIndex]: null }));
  };

  const handleCountryCodeSelect = (items: string[]) => {
    if (activeModalIndex === null) return;
    const selected = items[0] ?? staff[activeModalIndex].countryCode;
    updateStaff(activeModalIndex, "countryCode", selected);
  };

  useEffect(() => {
    if (numStaff > 0) {
      setStaff(
        Array.from({ length: numStaff }, () => ({
          firstName: "",
          lastName: "",
          nic: "",
          countryCode: "+94",
          phone: "",
          role: null,
        })),
      );
    }
  }, [numStaff]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (submitSuccess && lastCreatedFarmId && !alertShownRef.current) {
      alertShownRef.current = true;
      Alert.alert(t("Main.Success"), t("Farms.Farm saved successfully!"), [
        {
          text: t("Main.OK"),
          onPress: () => {
            dispatch(clearSubmitState());
            alertShownRef.current = false;
            setTimeout(() => {
              navigation.navigate("EarnCertificate", {
                farmId: lastCreatedFarmId,
                registrationCode: registrationCode || undefined,
              });
            }, 100);
          },
        },
      ]);
    }
    if (submitError) {
      Alert.alert("Error", submitError, [
        {
          text: t("Main.OK"),
          onPress: () => dispatch(clearSubmitState()),
        },
      ]);
    }
  }, [
    submitSuccess,
    submitError,
    lastCreatedFarmId,
    registrationCode,
    dispatch,
    navigation,
    t,
  ]);

  const handleSaveFarm = async () => {
    dispatch(clearSubmitState());

    if (Object.values(phoneErrors).some(Boolean)) {
      Alert.alert(
        t("Main.Sorry"),
        t(
          "Farms.One or more phone numbers are already registered. Please use different phone numbers.",
        ),
        [{ text: t("Main.OK") }],
      );
      return;
    }
    if (Object.values(phoneValidationErrors).some(Boolean)) {
      Alert.alert(
        t("Main.Sorry"),
        t("Farms.Please fix phone number validation errors before saving."),
        [{ text: t("Main.OK") }],
      );
      return;
    }
    if (Object.values(nicErrors).some(Boolean)) {
      Alert.alert(
        t("Main.Sorry"),
        t("Farms.Please fix NIC validation errors before saving."),
        [{ text: t("Main.OK") }],
      );
      return;
    }
    if (Object.values(nicduplicateErrors).some(Boolean)) {
      Alert.alert(
        t("Main.Sorry"),
        t(
          "Farms.One or more NIC numbers are already registered. Please use different NIC numbers.",
        ),
        [{ text: t("Main.OK") }],
      );
      return;
    }

    let hasDuplicatePhones = false;
    let hasDuplicateNics = false;
    const duplicatePhoneErrors: { [key: number]: string | null } = {};
    const duplicateNicErrors: { [key: number]: string | null } = {};

    staff.forEach((member, index) => {
      if (member.phone && member.countryCode) {
        const fullPhone = member.countryCode + member.phone;
        if (
          staff.some(
            (o, i) => i !== index && o.countryCode + o.phone === fullPhone,
          )
        ) {
          duplicatePhoneErrors[index] = t(
            "Farms.This phone number is already used by another staff member",
          );
          hasDuplicatePhones = true;
        }
      }
      if (member.nic) {
        const cleanNic = member.nic.replace(/\s/g, "").toUpperCase();
        if (
          staff.some(
            (o, i) =>
              i !== index &&
              o.nic.replace(/\s/g, "").toUpperCase() === cleanNic,
          )
        ) {
          duplicateNicErrors[index] = t(
            "Farms.This NIC is already used by another staff member",
          );
          hasDuplicateNics = true;
        }
      }
    });

    if (hasDuplicatePhones) {
      setPhoneValidationErrors((prev) => ({
        ...prev,
        ...duplicatePhoneErrors,
      }));
      Alert.alert(
        t("Main.Sorry"),
        t(
          "Farms.Duplicate phone numbers found. Please use unique phone numbers for each staff member.",
        ),
        [{ text: t("Main.OK") }],
      );
      return;
    }
    if (hasDuplicateNics) {
      setNicErrors((prev) => ({ ...prev, ...duplicateNicErrors }));
      Alert.alert(
        t("Main.Sorry"),
        t(
          "Farms.Duplicate NIC numbers found. Please use unique NIC numbers for each staff member.",
        ),
        [{ text: t("Main.OK") }],
      );
      return;
    }

    const newRoleErrors: { [key: number]: string | null } = {};
    const newFirstNameErrors: { [key: number]: string | null } = {};
    const newLastNameErrors: { [key: number]: string | null } = {};
    const newPhoneErrors: { [key: number]: string | null } = {};
    const newNicErrors: { [key: number]: string | null } = {};
    let hasErrors = false;

    for (let i = 0; i < staff.length; i++) {
      const { firstName, lastName, phone, role, nic } = staff[i];
      if (!firstName.trim()) {
        newFirstNameErrors[i] = t("Farms.Please enter first name");
        hasErrors = true;
      }
      if (!lastName.trim()) {
        newLastNameErrors[i] = t("Farms.Please enter last name");
        hasErrors = true;
      }
      if (!nic.trim()) {
        newNicErrors[i] = t("Farms.Please enter NIC");
        hasErrors = true;
      } else if (!validateSriLankanNic(nic)) {
        newNicErrors[i] = t("Farms.Please enter a valid NIC");
        hasErrors = true;
      }
      if (!phone.trim()) {
        newPhoneErrors[i] = t("Farms.Please enter phone number");
        hasErrors = true;
      } else if (!validateSriLankanPhoneNumber(phone)) {
        newPhoneErrors[i] = t("Farms.Please enter a valid phone number");
        hasErrors = true;
      }
      if (!role) {
        newRoleErrors[i] = t("Farms.Please select a role");
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setRoleErrors(newRoleErrors);
      setFirstNameErrors(newFirstNameErrors);
      setLastNameErrors(newLastNameErrors);
      setPhoneValidationErrors(newPhoneErrors);
      setNicErrors(newNicErrors);
      Alert.alert(
        t("Main.Sorry"),
        t("Farms.Please fill all required fields correctly."),
        [{ text: t("Main.OK") }],
      );
      return;
    }

    if (!farmBasicDetails || !farmSecondDetails) {
      Alert.alert(
        t("Main.Sorry"),
        t("Farms.Missing farm details. Please go back and complete all steps."),
        [{ text: t("Main.OK") }],
      );
      return;
    }

    dispatch(
      saveFarmToBackend({
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
      }),
    );
  };

  const handleGoBack = () => {
    navigation.navigate("AddNewFarmSecondDetails" as any, {
      membership,
      fromMemberDetails: true,
    });
  };

  const getMembershipDisplay = () => {
    switch (membership.toLowerCase()) {
      case "pro":
        return {
          text: "PRO",
          bgColor: "bg-[#FFF5BD]",
          textColor: "text-[#E2BE00]",
        };
      default:
        return {
          text: "BASIC",
          bgColor: "bg-[#CDEEFF]",
          textColor: "text-[#223FFF]",
        };
    }
  };

  const membershipDisplay = getMembershipDisplay();

  if (!farmSecondDetails || !loginCredentialsNeeded) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-lg text-gray-600">
          {t("Farms.Loading farm details...")}
        </Text>
        <TouchableOpacity
          className="mt-4 bg-black py-2 px-6 rounded-full"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white">{t("Main.Go Back")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getCountryLabel = (dialCode: string) => {
    const country = countryData.find((c) => c.dial_code === dialCode);
    return country ? `${country.emoji}  (${dialCode})` : dialCode;
  };

  const getRoleLabel = (roleValue: string | null) => {
    if (!roleValue) return null;
    return roleItems.find((r) => r.value === roleValue)?.label ?? roleValue;
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
    >
      <View className="flex-1 bg-white">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          className="px-4"
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}>
            <View className="flex-row items-center justify-center mb-6 relative">
              <Text className="font-bold text-lg text-center">
                {t("Farms.Add New Farm")}
              </Text>
              <View
                className={`absolute right-[-5%] ${membershipDisplay.bgColor} px-2 py-1 rounded-lg`}
              >
                <Text
                  className={`${membershipDisplay.textColor} text-xs font-medium`}
                >
                  {t(`Farms.${membershipDisplay.text}`)}
                </Text>
              </View>
            </View>

            {/* Step indicator */}
            <View className="flex-row items-center justify-center mb-3">
              <View className="w-[29px] h-[29px] border border-[#2AAD7A] bg-[#2AAD7A] rounded-full flex items-center justify-center">
                <Image
                  className="w-[10px] h-[13px]"
                  source={require("../../../assets/images/farms/location-white.webp")}
                />
              </View>
              <View className="w-24 h-0.5 bg-[#2AAD7A] mx-2" />
              <View className="w-[29px] h-[29px] border border-[#2AAD7A] bg-[#2AAD7A] rounded-full flex items-center justify-center">
                <Image
                  className="w-[11px] h-[12px]"
                  source={require("../../../assets/images/farms/userwhite.webp")}
                />
              </View>
              <View className="w-24 h-0.5 bg-[#2AAD7A] mx-2" />
              <View className="w-[29px] h-[29px] border border-[#2AAD7A] bg-white rounded-full flex items-center justify-center">
                <Image
                  className="w-[13.125px] h-[15px]"
                  source={require("../../../assets/images/farms/checks.webp")}
                />
              </View>
            </View>
          </View>

          {/* Staff forms */}
          {staff.map((member, index) => (
            <View key={index} className="ml-3 mr-3 space-y-4 mt-6">
              <Text className="font-semibold text-[#5A5A5A]">
                {`${t("Farms.Staff Member")} ${index + 1}`}
              </Text>
              <View className="w-full h-0.5 bg-[#AFAFAF] mx-2" />

              {/* Role */}
              <View>
                <Text className="text-[#070707] font-medium mb-2">
                  {t("Farms.Role")}
                </Text>
                <TouchableOpacity
                  onPress={() => openModal(index, "role")}
                  disabled={isSubmitting}
                  className="bg-[#F4F4F4] rounded-full px-4 flex-row items-center justify-between"
                  style={{ height: hp(7) }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: member.role ? "#374151" : "#9CA3AF",
                    }}
                  >
                    {getRoleLabel(member.role) ?? t("Farms.Select Role")}
                  </Text>
                  <AntDesign name="caret-down" size={14} color="#5e5d5d" />
                </TouchableOpacity>
                {roleErrors[index] && (
                  <Text className="text-red-500 text-sm mt-1 ml-3">
                    {roleErrors[index]}
                  </Text>
                )}
              </View>

              {/* First Name */}
              <View>
                <Text className="text-[#070707] font-medium mb-2">
                  {t("Farms.First Name")}
                </Text>
                <TextInput
                  value={member.firstName}
                  onChangeText={(text) => updateStaff(index, "firstName", text)}
                  placeholder={t("Farms.Enter First Name")}
                  placeholderTextColor="#9CA3AF"
                  className="bg-[#F4F4F4] p-3 rounded-3xl h-[50px] text-gray-800"
                  editable={!isSubmitting}
                />
                {firstNameErrors[index] && (
                  <Text className="text-red-500 text-sm mt-1 ml-3">
                    {firstNameErrors[index]}
                  </Text>
                )}
              </View>

              {/* Last Name */}
              <View>
                <Text className="text-[#070707] font-medium mb-2">
                  {t("Farms.Last Name")}
                </Text>
                <TextInput
                  value={member.lastName}
                  onChangeText={(text) => updateStaff(index, "lastName", text)}
                  placeholder={t("Farms.Enter Last Name")}
                  placeholderTextColor="#9CA3AF"
                  className="bg-[#F4F4F4] p-3 rounded-3xl h-[50px] text-gray-800"
                  editable={!isSubmitting}
                />
                {lastNameErrors[index] && (
                  <Text className="text-red-500 text-sm mt-1 ml-3">
                    {lastNameErrors[index]}
                  </Text>
                )}
              </View>

              {/* Phone Number */}
              <View>
                <Text className="text-[#070707] font-medium mb-2">
                  {t("Farms.Phone Number")}
                </Text>
                <View className="flex-row items-center space-x-2">
                  {/* Country Code Button */}
                  <TouchableOpacity
                    onPress={() => openModal(index, "countryCode")}
                    disabled={isSubmitting}
                    className="bg-[#F4F4F4] rounded-full px-3 h-[50px] flex-row items-center justify-between"
                    style={{ width: wp(33), height: hp(7) }}
                  >
                    <Text style={{ fontSize: 14, color: "#374151" }}>
                      {getCountryLabel(member.countryCode)}
                    </Text>
                    <AntDesign name="caret-down" size={14} color="#5e5d5d" />
                  </TouchableOpacity>

                  {/* Phone input */}
                  <View style={{ flex: 1 }}>
                    <TextInput
                      className="bg-[#F4F4F4] rounded-full px-4 h-[50px]"
                      placeholder="7X XXXXXXX"
                      value={member.phone}
                      onChangeText={(text) => handlePhoneChange(text, index)}
                      keyboardType="phone-pad"
                      maxLength={9}
                      style={{ fontSize: 14, borderWidth: 0 }}
                      underlineColorAndroid="transparent"
                      cursorColor="#141415ff"
                      editable={!isSubmitting}
                    />
                  </View>
                </View>

                {checkingNumber[index] && (
                  <View className="flex-row items-center mt-1 ml-3">
                    <ActivityIndicator size="small" color="#2563EB" />
                    <Text className="text-blue-600 text-sm ml-2">
                      {t("Farms.Checking number...")}
                    </Text>
                  </View>
                )}
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

              {/* NIC */}
              <View>
                <Text className="text-[#070707] font-medium mb-2">
                  {t("Farms.NIC")}
                </Text>
                <TextInput
                  value={member.nic}
                  onChangeText={(text) => handleNicChange(index, text)}
                  placeholder={t("Farms.Enter NIC")}
                  placeholderTextColor="#9CA3AF"
                  className="bg-[#F4F4F4] p-3 rounded-3xl h-[50px] text-gray-800"
                  editable={!isSubmitting}
                  autoCapitalize="characters"
                  maxLength={12}
                />
                {checkingNIC[index] && (
                  <View className="flex-row items-center mt-1">
                    <ActivityIndicator size="small" color="#2563EB" />
                    <Text className="text-blue-600 text-sm ml-2">
                      {t("Farms.Checking NIC...")}
                    </Text>
                  </View>
                )}
                {nicErrors[index] && (
                  <Text className="text-red-500 text-sm mt-1 ml-3">
                    {nicErrors[index]}
                  </Text>
                )}
                {nicduplicateErrors[index] && (
                  <Text className="text-red-500 text-sm mt-1 ml-3">
                    {nicduplicateErrors[index]}
                  </Text>
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
              <Text className="text-[#84868B] text-center font-semibold text-lg">
                {t("Main.Go Back")}
              </Text>
            </TouchableOpacity>
          </View>
          <View className="mt-2 mb-[40%]">
            <TouchableOpacity
              className={`py-3 mx-6 rounded-full ${isSubmitting ||
                Object.values(checkingNumber).includes(true) ||
                Object.values(checkingNIC).includes(true)
                ? "bg-gray-400"
                : "bg-black"
                }`}
              onPress={handleSaveFarm}
              disabled={
                isSubmitting ||
                Object.values(checkingNumber).includes(true) ||
                Object.values(checkingNIC).includes(true)
              }
              style={{
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <View className="flex-row items-center justify-center">
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

      {/* ── Role Modal ── */}
      <GlobalSearchModal
        visible={activeModalType === "role" && activeModalIndex !== null}
        onClose={closeModal}
        title={t("Farms.Select Role")}
        data={roleItems}
        selectedItems={
          activeModalIndex !== null && staff[activeModalIndex]?.role
            ? [staff[activeModalIndex].role!]
            : []
        }
        onSelect={handleRoleSelect}
        showSearch={false}
        multiSelect={false}
        doneButtonText={t("Main.OK")}
      />

      {/* ── Country Code Modal ── */}
      <GlobalSearchModal
        visible={activeModalType === "countryCode" && activeModalIndex !== null}
        onClose={closeModal}
        title={t("Farms.Select Country Code")}
        data={countryCodeItems}
        selectedItems={
          activeModalIndex !== null
            ? [staff[activeModalIndex]?.countryCode ?? "+94"]
            : []
        }
        onSelect={handleCountryCodeSelect}
        showSearch={true}
        searchPlaceholder={t("Farms.Search country...")}
        searchKeys={["label", "dialCode"]}
        multiSelect={false}
        doneButtonText={t("Main.OK")}
      />
    </KeyboardAvoidingView>
  );
};

export default AddMemberDetails;
