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
  Modal,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import i18n from "i18next";
import countryData from "@/assets/jsons/common/country-flag.json";
import CustomHeader from "../common/CustomHeader";
import GlobalSearchModal from "../common/GlobalSearchModal";
import LoadingPage from "../common/LoadingPage";

type RouteParams = {
  farmId: number;
  staffMemberId?: number;
  membership: string;
  renew: string;
  farmName: string;
};

interface SupervisorEditScreenProps {
  navigation: any;
  route: {
    params: RouteParams;
  };
}

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
  nic: string;
}

interface FarmDetailsResponse extends StaffMemberData { }

const SupervisorEditScreen: React.FC<SupervisorEditScreenProps> = ({
  navigation,
  route,
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const { farmName } = route.params as RouteParams;
  const [nic, setNic] = useState("");
  const [countryCode, setCountryCode] = useState("+94");
  const [selectedCountryFlag, setSelectedCountryFlag] = useState("🇱🇰");
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingNumber, setCheckingNumber] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [nicErrors, setNicErrors] = useState<string | null>(null);
  const [checkingNIC, setCheckingNIC] = useState(false);
  const [nicduplicateErrors, setNicDuplicateErrors] = useState<string | null>(
    null,
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [staffData, setStaffData] = useState<StaffMemberData | null>(null);
  const [loading, setLoading] = useState(true);

  const { farmId, staffMemberId, membership, renew } = route.params;
  const selectedLanguage = i18n.language;

  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { t } = useTranslation();

  const countryCodeItems = countryData.map((country) => ({
    label: `${country.emoji}  ${country.name}  (${country.dial_code})`,
    value: country.dial_code,
    flag: country.emoji,
    dialCode: country.dial_code,
    countryName: country.name,
  }));

  useFocusEffect(
    useCallback(() => {
      fetchStaffMember();
      setValidationError(null);
    }, [staffMemberId]),
  );

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

  const checkNic = async (nicValue: string) => {
    setCheckingNIC(true);
    setNicDuplicateErrors(null);
    try {
      const token = await getAuthToken();
      await axios.post(
        `${environment.API_BASE_URL}api/farm/members-nic-checker`,
        { nic: nicValue },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setNicDuplicateErrors(null);
    } catch (error: any) {
      if (error?.response?.status === 409) {
        setNicDuplicateErrors(
          t("Farms.ThisNICIsAlreadyUsedByAnotherStaffMember"),
        );
      } else if (error?.response) {
        setNicDuplicateErrors(t("Farms.ErrorCheckingNICNumber"));
      } else {
        setNicDuplicateErrors(null);
      }
    } finally {
      setCheckingNIC(false);
    }
  };

  const debouncedCheckNumber = useCallback((number: string) => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => {
      checkPhoneNumber(number);
    }, 800);
  }, []);

  const debouncedCheckNic = useCallback((nicValue: string) => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => {
      checkNic(nicValue);
    }, 800);
  }, []);

  const handlePhoneChange = (text: string) => {
    const digitsOnly = text.replace(/\D/g, "");
    setPhoneError(null);
    setValidationError(null);

    if (digitsOnly.length > 9) {
      setValidationError(t("Farms.PhoneNumberCannotExceed9Digits"));
      setPhoneNumber(formatPhoneInput(text));
      return;
    }

    const formattedText = formatPhoneInput(text);
    setPhoneNumber(formattedText);

    if (formattedText.length > 0) {
      if (formattedText[0] !== "7") {
        setValidationError(t("Farms.PhoneNumberMustStartWith7"));
      } else if (formattedText.length < 9) {
        setValidationError(t("Farms.PhoneNumberMustBeExactly9Digits"));
      } else if (!validateSriLankanPhoneNumber(formattedText)) {
        setValidationError(t("Farms.Please enter a valid phone number"));
      } else {
        setValidationError(null);
      }
    }

    if (staffData && formattedText.length === 9 && formattedText[0] === "7") {
      const originalFullNumber = `${staffData.phoneCode}${staffData.phoneNumber}`;
      const formatted = `${countryCode}${formattedText}`;
      if (originalFullNumber !== formatted) {
        debouncedCheckNumber(formatted);
      } else {
        setPhoneError(null);
      }
    }
  };

  const handleNicChange = (nicValue: string) => {
    const formattedNic = nicValue.replace(/\s/g, "").toUpperCase();
    setNic(formattedNic);
    setNicDuplicateErrors(null);

    if (formattedNic && !validateSriLankanNic(formattedNic)) {
      setNicErrors(t("Farms.PleaseEnterAValidSriLankanNIC"));
    } else {
      setNicErrors(null);
    }

    if (staffData && formattedNic.length >= 10) {
      if (staffData.nic !== formattedNic) {
        debouncedCheckNic(formattedNic);
      } else {
        setNicErrors(null);
      }
    }
  };

  const validateSriLankanNic = (nicValue: string): boolean => {
    if (!nicValue) return false;
    const cleanNic = nicValue.replace(/\s/g, "").toUpperCase();
    return /^[0-9]{9}[VX]$/.test(cleanNic) || /^[0-9]{12}$/.test(cleanNic);
  };

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
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
    if (!selectedRole) {
      Alert.alert(t("Main.Sorry"), t("Farms.PleaseSelectARole"), [
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
    if (!validateSriLankanNic(nic)) {
      Alert.alert(t("Main.Sorry"), t("Farms.PleaseEnterAValidNIC"), [
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
    if (nicduplicateErrors) {
      Alert.alert(
        t("Main.Sorry"),
        t("Farms.ThisNICIsAlreadyUsedByAnotherStaffMember"),
        [{ text: t("Main.OK") }],
      );
      return false;
    }
    return true;
  };

  const fetchStaffMember = async () => {
    if (!staffMemberId) {
      Alert.alert(t("Main.Sorry"), t("Farms.StaffMemberIDIsMissing"), [
        { text: t("Main.OK") },
      ]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setValidationError(null);
      setPhoneError(null);
      setNicDuplicateErrors(null);
      setNicErrors(null);

      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert(
          t("Main.Sorry"),
          t("Farms.NoAuthenticationTokenFound"),
          [{ text: t("Main.OK") }],
        );
        return;
      }

      const res = await axios.get<FarmDetailsResponse>(
        `${environment.API_BASE_URL}api/farm/get-staffMmber-byId/${staffMemberId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setStaffData(res.data);
      setFirstName(res.data.firstName || "");
      setLastName(res.data.lastName || "");
      setPhoneNumber(formatPhoneInput(res.data.phoneNumber || ""));

      const loadedCode = res.data.phoneCode || "+94";
      setCountryCode(loadedCode);

      const match = countryData.find((c) => c.dial_code === loadedCode);
      if (match) setSelectedCountryFlag(match.emoji);

      setSelectedRole(res.data.role || "");
      setNic(res.data.nic || "");
    } catch (err) {
      console.error("Error fetching staff member:", err);
      Alert.alert(
        t("Main.Sorry"),
        t("Farms.FailedToFFetchStaffMemberData"),
        [{ text: t("Main.OK") }],
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffMember();
  }, [staffMemberId]);

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    Keyboard.dismiss();
    try {
      const token = await getAuthToken();
      await axios.put(
        `${environment.API_BASE_URL}api/farm/update-staffmember/${staffMemberId}`,
        {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phoneNumber,
          countryCode,
          role: selectedRole,
          farmId,
          nic: nic.trim(),
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
        t("Farms.Staff member has been updated successfully"),
        [
          {
            text: t("Main.OK"),
            onPress: () =>
              navigation.navigate("ManageMembersSupervisor", {
                staffMemberId,
                farmId,
                farmName,
                membership,
                renew,
              }),
          },
        ],
      );
    } catch (error: any) {
      let errorMessage = t(
        "Farms.Failed to update staff member. Please try again.",
      );
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = t("Farms.NetworkErrorPleaseCheckYourConnection");
      }
      Alert.alert(t("Main.Sorry"), errorMessage, [
        { text: t("Main.OK") },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "Manager":
        return selectedLanguage === "si"
          ? "කළමනාකරු"
          : selectedLanguage === "ta"
            ? "மேலாளர்"
            : t("Farms.Manager") || "Manager";
      case "Supervisor":
        return selectedLanguage === "si"
          ? "අධීක්ෂක"
          : selectedLanguage === "ta"
            ? "மேற்பார்வையாளர்"
            : t("Farms.Supervisor") || "Supervisor";
      case "Laborer":
        return selectedLanguage === "si"
          ? "කම්කරුවා"
          : selectedLanguage === "ta"
            ? "தொழிலாளி"
            : t("Farms.Worker") || "Laborer";
      default:
        return role;
    }
  };

  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        navigation.navigate("ManageMembersSupervisor", {
          staffMemberId,
          farmId,
          membership,
          renew,
          farmName,
        });
        return true;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackPress,
      );
      return () => subscription.remove();
    }, [navigation]),
  );

  const handleDeleteStaff = async () => {
    try {
      setShowDeleteModal(false);
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert(
          t("Main.Error"),
          t("Farms.NoAuthenticationTokenFound"),
          [{ text: t("Main.OK") }],
        );
        return;
      }
      await axios.delete(
        `${environment.API_BASE_URL}api/farm/delete-staffmember/${staffMemberId}/${farmId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setLoading(false);
      Alert.alert(
        t("Main.Success"),
        t("Farms.FarmMemberDeletedSuccessfully"),
        [
          {
            text: t("Main.OK"),
            onPress: () =>
              navigation.navigate("ManageMembersSupervisor", {
                staffMemberId,
                farmId,
                membership,
                farmName,
                renew,
              }),
          },
        ],
      );
    } catch (err) {
      console.error("Error deleting staff member:", err);
      Alert.alert(t("Main.Sorry"), t("Farms.FailedToDeleteStaffMember"), [
        { text: t("Main.OK") },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCountrySelect = (selected: string[]) => {
    if (selected.length === 0) return;
    const dialCode = selected[0];
    const match = countryCodeItems.find((c) => c.value === dialCode);
    if (match) {
      setCountryCode(match.dialCode);
      setSelectedCountryFlag(match.flag);
    }
  };

  if (loading) {
    return (
      <LoadingPage fullScreen />
    );
  }

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
          title={t("Farms.EditSelectedRoleDetails", {
            selectedRole: getRoleText(selectedRole),
          })}
          showBackButton={true}
          navigation={navigation}
          onBackPress={() =>
            navigation.navigate("ManageMembersSupervisor", {
              staffMemberId,
              farmId,
              membership,
              renew,
              farmName,
            })
          }
        />

        <View className="px-8 gap-6 pt-3">
          {/* Role */}
          <View className="gap-2">
            <Text className="text-gray-900 text-base">{t("Farms.Role")}</Text>
            <View className="bg-gray-100 px-4 h-[50px] rounded-3xl justify-center">
              <Text className="text-base text-gray-700">
                {t("Farms.Worker")}
              </Text>
            </View>
          </View>

          {/* First Name */}
          <View className="gap-2">
            <Text className="text-gray-900 text-base">
              {t("Inputs.FirstName")}
            </Text>
            <TextInput
              className="bg-gray-100 px-4 h-[50px] rounded-3xl text-base text-gray-700"
              placeholder={t("Farms.EnterFirstName")}
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
              {t("Inputs.LastName")}
            </Text>
            <TextInput
              className="bg-gray-100 px-4 h-[50px]  rounded-3xl text-base text-gray-700"
              placeholder={t("Farms.EnterLastName")}
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
              {t("Farms.PhoneNumber")}
            </Text>
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => !isSubmitting && setCountryModalVisible(true)}

                className="bg-[#F4F4F4] rounded-3xl w-1/3 h-[50px] px-4 flex-row items-center justify-center"
                disabled={isSubmitting}
              >
                <Text className="text-base">
                  {selectedCountryFlag} {countryCode}
                </Text>
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
                  style={{ fontSize: 14, borderWidth: 0 }}
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
            <TextInput
              value={nic}
              onChangeText={handleNicChange}
              placeholder={t("Farms.EnterNIC")}
              placeholderTextColor="#9CA3AF"
              className="bg-[#F4F4F4] p-3 rounded-3xl h-[50px] text-gray-800"
              editable={!isSubmitting}
              autoCapitalize="characters"
              maxLength={12}
            />
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
            {nicduplicateErrors && (
              <Text className="text-red-500 text-sm mt-1 ml-3">
                {nicduplicateErrors}
              </Text>
            )}
          </View>
        </View>

        {/* Save Button */}
        <View className="pt-10 pb-6 px-[15%]">
          <TouchableOpacity
            onPress={handleSave}
            className={`${isSubmitting || checkingNumber || checkingNIC
              ? "bg-gray-400"
              : "bg-black"
              } rounded-full h-[50px] items-center justify-center`}
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

        {/* Delete Button */}
        <View className="pb-32 left-0 right-0 px-[15%]">
          <TouchableOpacity
            onPress={() => setShowDeleteModal(true)}
            className="rounded-full py-3 items-center justify-center bg-[#FF3030]"
            activeOpacity={0.8}
            disabled={isSubmitting}
          >
            <Text className="text-white text-lg font-semibold">
              {t("Farms.DeleteMember")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Delete Confirmation Modal */}
        <Modal
          visible={showDeleteModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View className="flex-1 bg-[#667BA54D] justify-center items-center p-8">
            <View className="bg-white rounded-lg p-6 w-full max-w-sm">
              <View className="justify-center items-center">
                <Image
                  className="w-[150px] h-[200px]"
                  source={require("../../assets/images/farms/delete-image.webp")}
                />
              </View>
              <Text className="text-lg font-bold text-center mb-2">
                {t("Farms.AreYouSureYouWantToDeleteThisMember")}
              </Text>
              <Text className="text-gray-600 text-center mb-6">
                {t(
                  "Farms.DeletingThisMemberWillPermanentlyRemoveAllDataRelatedToThatMember",
                )}
                {"\n\n"}
                {t("Farms.ThisActionCannotBeUndone")}
              </Text>
              <View className="px-4">
                <TouchableOpacity
                  onPress={handleDeleteStaff}
                  className="px-6 h-[50px] justify-center bg-[#000000] rounded-3xl"
                >
                  <View className="justify-center items-center">
                    <Text className="text-white text-lg">{t("Farms.YesDelete")}</Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View className="px-4 mt-4">
                <TouchableOpacity
                  onPress={() => setShowDeleteModal(false)}
                  className="px-6 h-[50px] justify-center bg-[#D9D9D9] rounded-3xl"
                >
                  <View className="justify-center items-center">
                    <Text className="text-gray-700 text-lg">
                      {t("Main.GoBack")}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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

export default SupervisorEditScreen;
