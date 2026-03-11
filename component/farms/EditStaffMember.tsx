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
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { environment } from "@/environment/environment";
import LottieView from "lottie-react-native";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import i18n from "i18next";
import countryData from "../../assets/jsons/countryflag.json";
import CustomHeader from "../common/CustomHeader";
import GlobalSearchModal from "../common/GlobalSearchModal";

type RouteParams = {
  farmId: number;
  staffMemberId?: number;
  membership: string;
  renew: string;
};

interface EditStaffMemberProps {
  navigation: any;
  route: { params: RouteParams };
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

const EditStaffMember: React.FC<EditStaffMemberProps> = ({
  navigation,
  route,
}) => {
  const { farmId, staffMemberId, membership, renew } = route.params;
  const { t } = useTranslation();
  const selectedLanguage = i18n.language;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [nic, setNic] = useState("");
  const [countryCode, setCountryCode] = useState("+94");
  const [selectedRole, setSelectedRole] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingNumber, setCheckingNumber] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [nicErrors, setNicErrors] = useState<string | null>(null);
  const [checkingNIC, setCheckingNIC] = useState(false);
  const [nicDuplicateErrors, setNicDuplicateErrors] = useState<string | null>(
    null,
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [staffData, setStaffData] = useState<StaffMemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [countryModalVisible, setCountryModalVisible] = useState(false);

  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getRoleText = (role: string) => {
    switch (role) {
      case "Manager":
        return selectedLanguage === "si"
          ? "කළමනාකරු"
          : selectedLanguage === "ta"
            ? "மேலாளர்"
            : t("Farms.Manager");
      case "Supervisor":
        return selectedLanguage === "si"
          ? "අධීක්ෂක"
          : selectedLanguage === "ta"
            ? "மேற்பார்வையாளர்"
            : t("Farms.Supervisor");
      case "Laborer":
        return selectedLanguage === "si"
          ? "කම්කරුවා"
          : selectedLanguage === "ta"
            ? "தொழிலாளி"
            : t("Farms.Worker");
      default:
        return role;
    }
  };

  const roleItems = [
    { label: getRoleText("Manager"), value: "Manager" },
    { label: getRoleText("Supervisor"), value: "Supervisor" },
    { label: getRoleText("Laborer"), value: "Laborer" },
  ];

  const countryModalData = countryData.map((country) => ({
    label: `${country.emoji}  ${country.name}  (${country.dial_code})`,
    value: country.dial_code,
  }));

  const selectedCountry = countryData.find((c) => c.dial_code === countryCode);

  const getAuthToken = async () => {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) throw new Error("Authentication token not found");
    return token;
  };

  const validateSriLankanPhoneNumber = (number: string): boolean =>
    /^7\d{8}$/.test(number.replace(/\D/g, ""));

  const validateSriLankanNic = (value: string): boolean => {
    const clean = value.replace(/\s/g, "").toUpperCase();
    return /^[0-9]{9}[VX]$/.test(clean) || /^[0-9]{12}$/.test(clean);
  };

  const formatPhoneInput = (text: string): string =>
    text.replace(/\D/g, "").slice(0, 9);

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

  const debounce = (fn: (val: string) => void, value: string) => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => fn(value), 800);
  };

  const handlePhoneChange = (text: string) => {
    const digitsOnly = text.replace(/\D/g, "");
    setPhoneError(null);
    setValidationError(null);

    if (digitsOnly.length > 9) {
      setValidationError(t("Farms.Phone number cannot exceed 9 digits"));
      setPhoneNumber(formatPhoneInput(text));
      return;
    }

    const formatted = formatPhoneInput(text);
    setPhoneNumber(formatted);

    if (formatted.length > 0) {
      if (formatted[0] !== "7") {
        setValidationError(t("Farms.Phone number must start with 7"));
      } else if (formatted.length < 9) {
        setValidationError(t("Farms.Phone number must be exactly 9 digits"));
      } else if (!validateSriLankanPhoneNumber(formatted)) {
        setValidationError(t("Farms.Please enter a valid phone number"));
      }
    }

    if (staffData && formatted.length === 9 && formatted[0] === "7") {
      const full = `${countryCode}${formatted}`;
      const original = `${staffData.phoneCode}${staffData.phoneNumber}`;
      if (original !== full) debounce(checkPhoneNumber, full);
      else setPhoneError(null);
    }
  };

  const handleNicChange = (nicValue: string) => {
    const formatted = nicValue.replace(/\s/g, "").toUpperCase();
    setNic(formatted);
    setNicDuplicateErrors(null);

    if (formatted && !validateSriLankanNic(formatted)) {
      setNicErrors(t("Farms.Please enter a valid Sri Lankan NIC"));
    } else {
      setNicErrors(null);
    }

    if (staffData && formatted.length >= 10) {
      if (staffData.nic !== formatted) debounce(checkNic, formatted);
      else setNicErrors(null);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, []);

  const validateForm = (): boolean => {
    if (!firstName.trim()) {
      Alert.alert(t("Farms.Sorry"), t("Farms.Please enter first name"), [
        { text: t("Farms.okButton") },
      ]);
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert(t("Farms.Sorry"), t("Farms.Please enter last name"), [
        { text: t("Farms.okButton") },
      ]);
      return false;
    }
    if (!phoneNumber.trim()) {
      Alert.alert(t("Farms.Sorry"), t("Farms.Please enter phone number"), [
        { text: t("Farms.okButton") },
      ]);
      return false;
    }
    if (!validateSriLankanPhoneNumber(phoneNumber)) {
      const msg =
        phoneNumber.length !== 9
          ? t("Farms.Phone number must be exactly 9 digits")
          : phoneNumber[0] !== "7"
            ? t("Farms.Phone number must start with 7")
            : t("Farms.Please enter a valid phone number");
      Alert.alert(t("Farms.Sorry"), msg, [{ text: t("Farms.okButton") }]);
      return false;
    }
    if (!selectedRole) {
      Alert.alert(t("Farms.Sorry"), t("Farms.Please select a role"), [
        { text: t("Farms.okButton") },
      ]);
      return false;
    }
    if (!nic.trim()) {
      Alert.alert(t("Farms.Sorry"), t("Farms.Please enter NIC"), [
        { text: t("Farms.okButton") },
      ]);
      return false;
    }
    if (!validateSriLankanNic(nic)) {
      Alert.alert(t("Farms.Sorry"), t("Farms.Please enter a valid NIC"), [
        { text: t("Farms.okButton") },
      ]);
      return false;
    }
    if (phoneError) {
      Alert.alert(t("Farms.Sorry"), phoneError, [
        { text: t("Farms.okButton") },
      ]);
      return false;
    }
    if (validationError) {
      Alert.alert(t("Farms.Sorry"), validationError, [
        { text: t("Farms.okButton") },
      ]);
      return false;
    }
    if (nicDuplicateErrors) {
      Alert.alert(
        t("Farms.Sorry"),
        t("Farms.This NIC is already used by another staff member"),
        [{ text: t("Farms.okButton") }],
      );
      return false;
    }
    return true;
  };

  const fetchStaffMember = async () => {
    if (!staffMemberId) {
      Alert.alert(t("Farms.Sorry"), t("Farms.Staff member ID is missing"), [
        { text: t("Farms.okButton") },
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
          t("Farms.Sorry"),
          t("Farms.No authentication token found"),
          [{ text: t("Farms.okButton") }],
        );
        return;
      }

      const res = await axios.get<StaffMemberData>(
        `${environment.API_BASE_URL}api/farm/get-staffMmber-byId/${staffMemberId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setStaffData(res.data);
      setFirstName(res.data.firstName || "");
      setLastName(res.data.lastName || "");
      setPhoneNumber(formatPhoneInput(res.data.phoneNumber || ""));
      setCountryCode(res.data.phoneCode || "+94");
      setSelectedRole(res.data.role || "");
      setNic(res.data.nic || "");
    } catch {
      Alert.alert(
        t("Farms.Sorry"),
        t("Farms.Failed to fetch staff member data"),
        [{ text: t("Farms.okButton") }],
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffMember();
  }, [staffMemberId]);

  useFocusEffect(
    useCallback(() => {
      fetchStaffMember();
      setValidationError(null);
    }, [staffMemberId]),
  );

  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        navigation.navigate("EditManagersScreen", {
          staffMemberId,
          farmId,
          membership,
          renew,
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
        t("Farms.Success"),
        t("Farms.Staff member has been updated successfully"),
        [
          {
            text: t("Farms.OK"),
            onPress: () =>
              navigation.navigate("EditManagersScreen", {
                staffMemberId,
                farmId,
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
        errorMessage = t("Farms.Network error. Please check your connection.");
      }
      Alert.alert(t("Farms.Sorry"), errorMessage, [
        { text: t("Farms.okButton") },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async () => {
    setShowDeleteModal(false);
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert(
          t("Farms.Error"),
          t("Farms.No authentication token found"),
          [{ text: t("PublicForum.OK") }],
        );
        return;
      }
      await axios.delete(
        `${environment.API_BASE_URL}api/farm/delete-staffmember/${staffMemberId}/${farmId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      Alert.alert(
        t("Farms.Success"),
        t("Farms.Farm member deleted successfully"),
        [
          {
            text: t("PublicForum.OK"),
            onPress: () =>
              navigation.navigate("EditManagersScreen", {
                staffMemberId,
                farmId,
                membership,
                renew,
              }),
          },
        ],
      );
    } catch {
      Alert.alert(t("Farms.Sorry"), t("Farms.Failed to delete staff member"), [
        { text: t("Farms.okButton") },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <LottieView
          source={require("../../assets/jsons/loader.json")}
          autoPlay
          loop
          style={{ width: 300, height: 300 }}
        />
      </View>
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
          title={t("Farms.Edit Details", {
            selectedRole: getRoleText(selectedRole),
          })}
          navigation={navigation}
          onBackPress={() =>
            navigation.navigate("EditManagersScreen", {
              staffMemberId,
              farmId,
              membership,
              renew,
            })
          }
        />

        <View className="px-8 gap-6 pt-3">
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
              <AntDesign name="down" size={14} color="#9CA3AF" />
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
              className="bg-gray-100 px-4 py-3 rounded-full text-base text-gray-700"
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
              className="bg-gray-100 px-4 py-3 rounded-full text-base text-gray-700"
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
                className="bg-[#F4F4F4] rounded-full flex-row items-center justify-between px-4 mr-2"
                style={{ width: wp(33), height: hp(7) }}
                activeOpacity={0.7}
              >
                <Text className="text-base text-gray-700">
                  {selectedCountry?.emoji ?? "🇱🇰"}
                  {"  "}({countryCode})
                </Text>
                <AntDesign name="down" size={14} color="#9CA3AF" />
              </TouchableOpacity>

              {/* Phone Input */}
              <View style={{ flex: 1 }}>
                <TextInput
                  className="bg-[#F4F4F4] rounded-full px-4"
                  placeholder="7X XXXXXXX"
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  maxLength={9}
                  style={{ height: hp(7), fontSize: 14, borderWidth: 0 }}
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
              onChangeText={handleNicChange}
              placeholder={t("Farms.Enter NIC")}
              placeholderTextColor="#9CA3AF"
              className="bg-[#F4F4F4] p-3 rounded-full text-gray-800"
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
        <View className="pt-10 pb-6 px-[15%]">
          <TouchableOpacity
            onPress={handleSave}
            className={`${isSubmitting || checkingNumber || checkingNIC ? "bg-gray-400" : "bg-black"} rounded-full py-3 items-center justify-center`}
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
                {t("Farms.Save")}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Delete Button */}
        <View className="pb-32 px-[15%]">
          <TouchableOpacity
            onPress={() => setShowDeleteModal(true)}
            className="rounded-full py-3 items-center justify-center bg-[#FF3030]"
            activeOpacity={0.8}
            disabled={isSubmitting}
          >
            <Text className="text-white text-lg font-semibold">
              {t("Farms.Delete Member")}
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
                {t("Farms.Are you sure you want to delete this member?")}
              </Text>
              <Text className="text-gray-600 text-center mb-6">
                {t(
                  "Farms.Deleting this member will permanently remove all data related to that member.",
                )}
                {"\n\n"}
                {t("Farms.This action cannot be undone.")}
              </Text>
              <View className="px-4">
                <TouchableOpacity
                  onPress={handleDeleteStaff}
                  className="px-6 py-2 bg-black rounded-full"
                >
                  <View className="justify-center items-center">
                    <Text className="text-white">{t("Farms.Yes, Delete")}</Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View className="px-4 mt-4">
                <TouchableOpacity
                  onPress={() => setShowDeleteModal(false)}
                  className="px-6 py-2 bg-[#D9D9D9] rounded-full"
                >
                  <View className="justify-center items-center">
                    <Text className="text-gray-700">
                      {t("Farms.No, Go Back")}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditStaffMember;
