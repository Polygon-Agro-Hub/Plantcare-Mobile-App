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
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import i18n from "i18next";
import countryData from "@/assets/jsons/common/country-flag.json";
import CustomHeader from "../../common/CustomHeader";
import GlobalSearchModal from "../../common/GlobalSearchModal";
import LoadingPage from "@/component/common/LoadingPage";

type RouteParams = {
  farmId: number;
  staffMemberId?: number;
  membership: string;
  renew: string;
  regCode: string;
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
  const { farmId, staffMemberId, membership, renew, regCode } = route.params;
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

  const debounce = (fn: (val: string) => void, value: string) => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => fn(value), 800);
  };

  const handlePhoneChange = (text: string) => {
    const digitsOnly = text.replace(/\D/g, "");
    setPhoneError(null);
    setValidationError(null);

    if (digitsOnly.length > 9) {
      setValidationError(t("Farms.PhoneNumberCannotExceed9Digits"));
      setPhoneNumber(formatPhoneInput(text));
      return;
    }

    const formatted = formatPhoneInput(text);
    setPhoneNumber(formatted);

    if (formatted.length > 0) {
      if (formatted[0] !== "7") {
        setValidationError(t("Farms.PhoneNumberMustStartWith7"));
      } else if (formatted.length < 9) {
        setValidationError(t("Farms.PhoneNumberMustBeExactly9Digits"));
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
      setNicErrors(t("Farms.PleaseEnterAValidSriLankanNIC"));
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
    if (nicDuplicateErrors) {
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
          regCode,
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
        t("Main.Success"),
        t("Farms.Staff member has been updated successfully"),
        [
          {
            text: t("Main.OK"),
            onPress: () =>
              navigation.navigate("EditManagersScreen", {
                staffMemberId,
                farmId,
                membership,
                renew,
                regCode,
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

  const handleDeleteStaff = async () => {
    setShowDeleteModal(false);
    setLoading(true);
    try {
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
      Alert.alert(
        t("Main.Success"),
        t("Farms.FarmMemberDeletedSuccessfully"),
        [
          {
            text: t("Main.OK"),
            onPress: () =>
              navigation.navigate("EditManagersScreen", {
                staffMemberId,
                farmId,
                membership,
                renew,
                regCode,
              }),
          },
        ],
      );
    } catch {
      Alert.alert(t("Main.Sorry"), t("Farms.FailedToDeleteStaffMember"), [
        { text: t("Main.OK") },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingPage fullScreen />;
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
          navigation={navigation}
          onBackPress={() =>
            navigation.navigate("EditManagersScreen", {
              staffMemberId,
              farmId,
              membership,
              renew,
              regCode,
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
                  : t("Farms.SelectRole")}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
            </TouchableOpacity>
            <GlobalSearchModal
              visible={roleModalVisible}
              onClose={() => setRoleModalVisible(false)}
              title={t("Farms.Role")}
              data={roleItems}
              selectedItems={selectedRole ? [selectedRole] : []}
              onSelect={(items) => setSelectedRole(items[0] ?? "")}
              searchPlaceholder={t("Farms.SelectRole")}
              showSearch={false}
              multiSelect={false}
            />
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
              className="bg-gray-100 px-4 rounded-3xl h-[50px] text-base text-gray-700"
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
            <View className="flex-row items-center">
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
                <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
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
            {nicDuplicateErrors && (
              <Text className="text-red-500 text-sm mt-1 ml-3">
                {nicDuplicateErrors}
              </Text>
            )}
          </View>
        </View>

        {/* Save Button */}
        <View className="pt-10 pb-6 items-center">
          <TouchableOpacity
            onPress={handleSave}
            className={`${isSubmitting || checkingNumber || checkingNIC ? "bg-gray-400" : "bg-black"} rounded-full w-2/3 h-[50px] items-center justify-center`}
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

        {/* Delete Button */}
        <View className="pb-32 items-center">
          <TouchableOpacity
            onPress={() => setShowDeleteModal(true)}
            className="rounded-full w-2/3 h-[50px] items-center justify-center bg-[#FF3030]"
            activeOpacity={0.8}
            disabled={isSubmitting}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.25,
              shadowRadius: 6,
              elevation: 8,
            }}
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
                  source={require("../../../assets/images/farms/delete-image.webp")}
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
                  className="px-6 h-[50px] justify-center bg-black rounded-3xl"
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
    </KeyboardAvoidingView>
  );
};

export default EditStaffMember;
