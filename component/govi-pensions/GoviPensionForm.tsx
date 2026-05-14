import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Image,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  BackHandler,
  Modal,
  Keyboard,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import CustomHeader from "../common/CustomHeader";
import axios from "axios";
import { environment } from "../../environment/environment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

interface GoviPensionFormProps {
  navigation: any;
}

interface FormData {
  fullName: string;
  dateOfBirth: Date | null;
  nicNumber: string;
  nicFrontImage: string | null;
  nicBackImage: string | null;

  successorFullName: string;
  successorRelationship: string;
  successorDateOfBirth: Date | null;
  successorNicNumber: string;
  successorNicFrontImage: string | null;
  successorNicBackImage: string | null;
  successorBirthCertFrontImage: string | null;
  successorBirthCertBackImage: string | null;
}

const CustomDatePicker = ({
  visible,
  onClose,
  onSelect,
  initialDate,
  maximumDate = new Date(),
  minimumDate,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
  initialDate?: Date;
  maximumDate?: Date;
  minimumDate?: Date;
}) => {
  const currentDate = initialDate || new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedDay, setSelectedDay] = useState(currentDate.getDate());

  const { t } = useTranslation();

  const startYear = minimumDate ? minimumDate.getFullYear() : 1900;
  const endYear = maximumDate.getFullYear();
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => endYear - i,
  );

  const months = [
    { label: t("Months.January"), value: 0 },
    { label: t("Months.February"), value: 1 },
    { label: t("Months.March"), value: 2 },
    { label: t("Months.April"), value: 3 },
    { label: t("Months.May"), value: 4 },
    { label: t("Months.June"), value: 5 },
    { label: t("Months.July"), value: 6 },
    { label: t("Months.August"), value: 7 },
    { label: t("Months.September"), value: 8 },
    { label: t("Months.October"), value: 9 },
    { label: t("Months.November"), value: 10 },
    { label: t("Months.December"), value: 11 },
  ];

  const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  useEffect(() => {
    if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [selectedYear, selectedMonth]);

  const handleConfirm = () => {
    const selectedDate = new Date(selectedYear, selectedMonth, selectedDay);
    onSelect(selectedDate);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl pb-8">
          {/* Header */}
          <View className="px-5 py-4 border-b border-gray-200">
            <TouchableOpacity onPress={onClose}>
              <Text className="text-gray-500 text-base font-medium">
                {t("Main.Cancel")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Date Pickers */}
          <View className="px-5 py-6">
            {/* Year Picker */}
            <View className="mb-4">
              <Text className="text-[#070707] mb-2 font-medium">
                {t("GoviPensionForm.Year") || "Year"}
              </Text>
              <ScrollView
                className="max-h-32 bg-[#F4F4F4] rounded-2xl"
                showsVerticalScrollIndicator={true}
              >
                {years.map((year) => (
                  <TouchableOpacity
                    key={year}
                    onPress={() => setSelectedYear(year)}
                    className={`py-3 px-4 ${selectedYear === year ? "bg-[#00A896]" : ""}`}
                  >
                    <Text
                      className={`text-center ${selectedYear === year ? "text-white font-semibold" : "text-[#070707]"}`}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Month Picker */}
            <View className="mb-4">
              <Text className="text-[#070707] mb-2 font-medium">
                {t("GoviPensionForm.Month") || "Month"}
              </Text>
              <ScrollView
                className="max-h-32 bg-[#F4F4F4] rounded-2xl"
                showsVerticalScrollIndicator={true}
              >
                {months.map((month) => (
                  <TouchableOpacity
                    key={month.value}
                    onPress={() => setSelectedMonth(month.value)}
                    className={`py-3 px-4 ${selectedMonth === month.value ? "bg-[#00A896]" : ""}`}
                  >
                    <Text
                      className={`text-center ${selectedMonth === month.value ? "text-white font-semibold" : "text-[#070707]"}`}
                    >
                      {month.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Day Picker */}
            <View className="mb-4">
              <Text className="text-[#070707] mb-2 font-medium">
                {t("GoviPensionForm.Day") || "Day"}
              </Text>
              <ScrollView
                className="max-h-32 bg-[#F4F4F4] rounded-2xl"
                showsVerticalScrollIndicator={true}
              >
                <View className="flex-row flex-wrap">
                  {days.map((day) => (
                    <TouchableOpacity
                      key={day}
                      onPress={() => setSelectedDay(day)}
                      className={`py-3 px-2 ${selectedDay === day ? "bg-[#00A896] rounded-xl" : ""}`}
                      style={{ width: "14.28%" }}
                    >
                      <Text
                        className={`text-center ${selectedDay === day ? "text-white font-semibold" : "text-[#070707]"}`}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Selected Date Preview */}
            <View className="bg-[#F4F4F4] h-[50px] rounded-3xl justify-center mt-2">
              <Text className="text-center text-[#070707] text-base font-medium">
                {t("GoviPensionForm.SelectedDate") || "Selected Date"}:{" "}
                {`${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`}
              </Text>
            </View>

            {/* Confirm Button */}
            <View className="mt-3">
              <TouchableOpacity
                onPress={handleConfirm}
                className="bg-[#00A896] rounded-3xl h-[50px] px-6 justify-center"
              >
                <Text className="text-white text-center font-semibold text-lg">
                  {t("Main.Save")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const GoviPensionForm: React.FC<GoviPensionFormProps> = ({ navigation }) => {
  const [currentSection, setCurrentSection] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    dateOfBirth: null,
    nicNumber: "",
    nicFrontImage: null,
    nicBackImage: null,

    successorFullName: "",
    successorRelationship: "",
    successorDateOfBirth: null,
    successorNicNumber: "",
    successorNicFrontImage: null,
    successorNicBackImage: null,
    successorBirthCertFrontImage: null,
    successorBirthCertBackImage: null,
  });

  const [nicError, setNicError] = useState("");
  const [successorNicError, setSuccessorNicError] = useState("");

  const [showCustomDobPicker, setShowCustomDobPicker] = useState(false);
  const [showCustomSuccessorDobPicker, setShowCustomSuccessorDobPicker] =
    useState(false);

  const { t } = useTranslation();

  const relationshipOptions = [
    { label: t("GoviPensionForm.Wife"), value: "Wife" },
    { label: t("GoviPensionForm.Husband"), value: "Husband" },
    { label: t("GoviPensionForm.Son"), value: "Son" },
    { label: t("GoviPensionForm.Daughter"), value: "Daughter" },
  ];

  const leftColumnOptions = relationshipOptions.slice(0, 2);
  const rightColumnOptions = relationshipOptions.slice(2);

  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const isSuccessorOver18 = (): boolean => {
    if (!formData.successorDateOfBirth) return false;
    return calculateAge(formData.successorDateOfBirth) >= 17;
  };

  const validateNIC = (value: string): boolean => {
    const nicRegex = /^(\d{12}|\d{9}[VvXx])$/;
    return nicRegex.test(value);
  };

  const buildNicValue = (text: string): string => {
    const cleaned = text.replace(/[^0-9VvXx]/g, "");
    const normalized = cleaned.replace(/[vV]/g, "V").replace(/[xX]/g, "X");

    let final = normalized;

    if (
      normalized.length > 9 &&
      (normalized.includes("V") || normalized.includes("X"))
    ) {
      const nums = normalized.replace(/[VX]/g, "");
      const lets = normalized.replace(/[0-9]/g, "");

      if (nums.length === 9 && lets.length === 1) {
        final = nums + lets;
      } else if (nums.length >= 9) {
        final = nums.substring(0, 9) + (lets.length > 0 ? lets.charAt(0) : "");
      } else {
        final = nums;
      }
    }

    if (final.length > 12) final = final.substring(0, 12);

    return final;
  };

  const capitalizeFirstLetter = (text: string): string => {
    if (text.length === 0) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const handleApplicantNicChange = (text: string) => {
    const final = buildNicValue(text);
    updateFormData("nicNumber", final);

    const nicRegex = /^(\d{12}|\d{9}[VvXx])$/;
    setNicError(
      final && !nicRegex.test(final)
        ? t("SignUp.PleaseEnterAValidNICNumber") || "Enter a valid NIC number"
        : "",
    );

    if (final.endsWith("V") || final.endsWith("X") || final.length === 12) {
      Keyboard.dismiss();
    }
  };

  const handleSuccessorNicChange = (text: string) => {
    const final = buildNicValue(text);
    updateFormData("successorNicNumber", final);

    const nicRegex = /^(\d{12}|\d{9}[VvXx])$/;
    setSuccessorNicError(
      final && !nicRegex.test(final)
        ? t("SignUp.PleaseEnterAValidNICNumber") || "Enter a valid NIC number"
        : "",
    );

    if (final.endsWith("V") || final.endsWith("X") || final.length === 12) {
      Keyboard.dismiss();
    }
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const formatDateForAPI = (date: Date | null): string => {
    if (!date) return "";
    return date.toISOString().slice(0, 19).replace("T", " ");
  };

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Sorry, we need camera roll permissions to upload images!",
      );
      return false;
    }
    return true;
  };

  const pickImageFromGallery = async (
    imageType:
      | "nicFront"
      | "nicBack"
      | "successorNicFront"
      | "successorNicBack"
      | "successorBirthCertFront"
      | "successorBirthCertBack",
  ) => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        switch (imageType) {
          case "nicFront":
            setFormData((prev) => ({
              ...prev,
              nicFrontImage: result.assets[0].uri,
            }));
            break;
          case "nicBack":
            setFormData((prev) => ({
              ...prev,
              nicBackImage: result.assets[0].uri,
            }));
            break;
          case "successorNicFront":
            setFormData((prev) => ({
              ...prev,
              successorNicFrontImage: result.assets[0].uri,
            }));
            break;
          case "successorNicBack":
            setFormData((prev) => ({
              ...prev,
              successorNicBackImage: result.assets[0].uri,
            }));
            break;
          case "successorBirthCertFront":
            setFormData((prev) => ({
              ...prev,
              successorBirthCertFrontImage: result.assets[0].uri,
            }));
            break;
          case "successorBirthCertBack":
            setFormData((prev) => ({
              ...prev,
              successorBirthCertBackImage: result.assets[0].uri,
            }));
            break;
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image. Please try again.");
      console.error("Image picker error:", error);
    }
  };

  const isSection1Valid = () => {
    return (
      formData.fullName.trim() &&
      formData.dateOfBirth &&
      formData.nicNumber.trim() &&
      validateNIC(formData.nicNumber) &&
      !nicError &&
      formData.nicFrontImage &&
      formData.nicBackImage
    );
  };

  const isSection2Valid = () => {
    const isOver18 = isSuccessorOver18();

    const basicFieldsValid =
      formData.successorFullName.trim() &&
      formData.successorRelationship &&
      formData.successorDateOfBirth;

    if (!basicFieldsValid) return false;

    if (isOver18) {
      const nicValid =
        formData.successorNicNumber.trim() &&
        validateNIC(formData.successorNicNumber) &&
        !successorNicError;
      const nicImagesValid =
        formData.successorNicFrontImage && formData.successorNicBackImage;
      return nicValid && nicImagesValid;
    } else {
      return (
        formData.successorBirthCertFrontImage &&
        formData.successorBirthCertBackImage
      );
    }
  };

  const isFormComplete = () => isSection1Valid() && isSection2Valid();

  const handleNext = () => {
    if (currentSection === 1) {
      if (!formData.fullName.trim()) {
        Alert.alert("Validation Error", "Please enter your full name");
        return;
      }
      if (!formData.dateOfBirth) {
        Alert.alert("Validation Error", "Please select your date of birth");
        return;
      }
      if (!formData.nicNumber.trim()) {
        Alert.alert("Validation Error", "Please enter your NIC number");
        return;
      }
      if (!validateNIC(formData.nicNumber)) {
        Alert.alert(
          "Invalid NIC",
          "NIC must be either 9 digits followed by V/v/X/x (e.g., 123456789V) or 12 digits (e.g., 199912345678)",
        );
        return;
      }
      if (!formData.nicFrontImage) {
        Alert.alert("Validation Error", "Please upload NIC front image");
        return;
      }
      if (!formData.nicBackImage) {
        Alert.alert("Validation Error", "Please upload NIC back image");
        return;
      }
      setCurrentSection(2);
    }
  };

  const handlePrevious = () => setCurrentSection(1);

  const submitPensionRequest = async () => {
    const isOver18 = isSuccessorOver18();
    setIsSubmitting(true);

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Error", "Please login again");
        navigation.navigate("Login");
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("fullName", formData.fullName);
      formDataToSend.append("nic", formData.nicNumber);
      formDataToSend.append("dob", formatDateForAPI(formData.dateOfBirth));
      formDataToSend.append("sucFullName", formData.successorFullName);
      formDataToSend.append("sucType", formData.successorRelationship);
      formDataToSend.append(
        "sucdob",
        formatDateForAPI(formData.successorDateOfBirth),
      );

      if (formData.successorNicNumber.trim()) {
        formDataToSend.append("sucNic", formData.successorNicNumber);
      }

      const addImageToFormData = (uri: string | null, fieldName: string) => {
        if (uri) {
          const uriParts = uri.split(".");
          const fileType = uriParts[uriParts.length - 1];
          formDataToSend.append(fieldName, {
            uri,
            name: `${fieldName}_${Date.now()}.${fileType}`,
            type: `image/${fileType}`,
          } as any);
        }
      };

      addImageToFormData(formData.nicFrontImage, "nicFront");
      addImageToFormData(formData.nicBackImage, "nicBack");

      if (isOver18) {
        addImageToFormData(formData.successorNicFrontImage, "sucNicFront");
        addImageToFormData(formData.successorNicBackImage, "sucNicBack");
      } else {
        addImageToFormData(
          formData.successorBirthCertFrontImage,
          "birthCrtFront",
        );
        addImageToFormData(
          formData.successorBirthCertBackImage,
          "birthCrtBack",
        );
      }

      const response = await axios.post(
        `${environment.API_BASE_URL}api/pension/pension-request/submit`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          timeout: 30000,
        },
      );

      if (response.data.status) {
        Alert.alert(
          "Success",
          "Your pension request has been submitted successfully!",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("GoviPensionStatus"),
            },
          ],
        );
      } else {
        Alert.alert(
          "Error",
          response.data.message || "Failed to submit request",
        );
      }
    } catch (error: any) {
      console.error("Error submitting pension request:", error);
      let errorMessage =
        "An error occurred while submitting your request. Please try again.";
      if (error.response) {
        errorMessage =
          error.response.data?.message || error.response.statusText;
      } else if (error.request) {
        errorMessage =
          "No response from server. Please check your internet connection.";
      } else {
        errorMessage = error.message || errorMessage;
      }
      Alert.alert("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => {
    const isOver18 = isSuccessorOver18();

    if (!formData.successorFullName.trim()) {
      Alert.alert("Validation Error", "Please enter successor's full name");
      return;
    }
    if (!formData.successorRelationship) {
      Alert.alert("Validation Error", "Please select relationship");
      return;
    }
    if (!formData.successorDateOfBirth) {
      Alert.alert(
        "Validation Error",
        "Please select successor's date of birth",
      );
      return;
    }
    if (isOver18) {
      if (!formData.successorNicNumber.trim()) {
        Alert.alert("Validation Error", "Please enter successor's NIC number");
        return;
      }
      if (!validateNIC(formData.successorNicNumber)) {
        Alert.alert(
          "Invalid NIC",
          "Successor's NIC must be either 9 digits followed by V/v/X/x (e.g., 123456789V) or 12 digits (e.g., 199912345678)",
        );
        return;
      }
      if (!formData.successorNicFrontImage) {
        Alert.alert(
          "Validation Error",
          "Please upload successor's NIC front image",
        );
        return;
      }
      if (!formData.successorNicBackImage) {
        Alert.alert(
          "Validation Error",
          "Please upload successor's NIC back image",
        );
        return;
      }
    } else {
      if (!formData.successorBirthCertFrontImage) {
        Alert.alert(
          "Validation Error",
          "Please upload successor's birth certificate front image",
        );
        return;
      }
      if (!formData.successorBirthCertBackImage) {
        Alert.alert(
          "Validation Error",
          "Please upload successor's birth certificate back image",
        );
        return;
      }
    }
    if (!isFormComplete()) {
      Alert.alert("Error", "Please complete all required fields");
      return;
    }

    Alert.alert(
      "Confirm Submission",
      "Are you sure you want to submit this pension request?",
      [
        { text: "No", style: "cancel" },
        { text: "Yes", onPress: () => submitPensionRequest() },
      ],
    );
  };

  const handleCancel = () => navigation.goBack();

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      return () => backHandler.remove();
    }, [navigation]),
  );

  const renderSection1 = () => (
    <ScrollView
      className="flex-1 px-4"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      {/* Full Name */}
      <View className="mb-5 mt-4">
        <Text className="text-[#070707] mb-2">
          {t("GoviPensionForm.YourFullName")} *
        </Text>
        <TextInput
          value={formData.fullName}
          onChangeText={(text) => {
            const filtered = text
              .replace(/^\s+/, "")
              .replace(/[^a-zA-Z\u0080-\uFFFF.\s]/g, "");
            updateFormData("fullName", capitalizeFirstLetter(filtered));
          }}
          placeholder={t("Main.TypeHere")}
          placeholderTextColor="#585858"
          className="bg-[#F4F4F4] rounded-3xl px-4 h-[50px] text-[#070707] text-sm"
        />
      </View>

      {/* Date of Birth */}
      <View className="mb-5">
        <Text className="text-[#070707] mb-2">
          {t("GoviPensionForm.YourDateOfBirth")} *
        </Text>
        <TouchableOpacity
          onPress={() => setShowCustomDobPicker(true)}
          className="bg-[#F4F4F4] rounded-3xl px-4 h-[50px] flex-row justify-between items-center border border-gray-100"
        >
          <Text
            className={`text-sm ${formData.dateOfBirth ? "text-[#070707]" : "text-[#585858]"}`}
          >
            {formData.dateOfBirth
              ? formatDate(formData.dateOfBirth)
              : t("GoviPensionForm.SelectDate")}
          </Text>
          <FontAwesome6 name="calendar-days" size={20} color="black" />
        </TouchableOpacity>
      </View>

      {/* Applicant NIC */}
      <View className="mb-5">
        <Text className="text-[#070707] mb-2">
          {t("GoviPensionForm.YourNICNumber")} *
        </Text>
        <TextInput
          value={formData.nicNumber}
          onChangeText={handleApplicantNicChange}
          placeholder={t("Main.TypeHere")}
          placeholderTextColor="#585858"
          className="bg-[#F4F4F4] rounded-3xl px-4 h-[50px] text-[#070707] text-sm"
          keyboardType="default"
          maxLength={12}
        />
        {nicError ? (
          <Text className="text-red-500 text-xs mt-1 ml-4">{nicError}</Text>
        ) : null}
      </View>

      {/* NIC Front */}
      <View className="mb-5">
        <Text className="text-[#070707] mb-2">
          {t("GoviPensionForm.NICFrontImage")} *
        </Text>
        <TouchableOpacity
          onPress={() => pickImageFromGallery("nicFront")}
          className="bg-white border border-gray-300 rounded-3xl px-6 h-[50px] flex-row justify-center items-center mb-4"
        >
          <FontAwesome6 name="cloud-arrow-up" size={22} color="black" />
          <Text className="text-gray-900 ml-2 font-medium text-sm">
            {formData.nicFrontImage
              ? t("GoviPensionForm.ReUploadImage")
              : t("GoviPensionForm.UploadImage")}
          </Text>
        </TouchableOpacity>
        {formData.nicFrontImage ? (
          <View className="mb-3">
            <View className="relative justify-center items-center">
              <Image
                source={{ uri: formData.nicFrontImage }}
                className="w-full h-48 rounded-lg"
                resizeMode="contain"
              />
              <TouchableOpacity
                onPress={() => updateFormData("nicFrontImage", null)}
                className="absolute right-2 top-2"
              >
                <Ionicons name="close-circle" size={28} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </View>

      {/* NIC Back */}
      <View className="mb-8">
        <Text className="text-[#070707] mb-2">
          {t("GoviPensionForm.NICBackImage")} *
        </Text>
        <TouchableOpacity
          onPress={() => pickImageFromGallery("nicBack")}
          className="bg-white border border-gray-300 rounded-3xl px-6 h-[50px] flex-row justify-center items-center mb-4"
        >
          <FontAwesome6 name="cloud-arrow-up" size={22} color="black" />
          <Text className="text-gray-900 ml-2 font-medium text-sm">
            {formData.nicBackImage
              ? t("GoviPensionForm.ReUploadImage")
              : t("GoviPensionForm.UploadImage")}
          </Text>
        </TouchableOpacity>
        {formData.nicBackImage ? (
          <View className="mb-3">
            <View className="relative">
              <Image
                source={{ uri: formData.nicBackImage }}
                className="w-full h-48 rounded-lg"
                resizeMode="contain"
              />
              <TouchableOpacity
                onPress={() => updateFormData("nicBackImage", null)}
                className="absolute right-2 top-2"
              >
                <Ionicons name="close-circle" size={28} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );

  const renderSection2 = () => {
    const isOver18 = isSuccessorOver18();

    return (
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Successor Full Name */}
        <View className="mb-5 mt-4">
          <Text className="text-[#070707] mb-2">
            {t("GoviPensionForm.Successor's Full Name")} *
          </Text>
          <TextInput
            value={formData.successorFullName}
            onChangeText={(text) => {
              const filtered = text
                .replace(/^\s+/, "")
                .replace(/[^a-zA-Z\u0080-\uFFFF.\s]/g, "");
              updateFormData(
                "successorFullName",
                capitalizeFirstLetter(filtered),
              );
            }}
            placeholder={t("Main.TypeHere")}
            placeholderTextColor="#585858"
            className="bg-[#F4F4F4] rounded-3xl px-4 h-[50px] text-[#070707] text-sm"
          />
        </View>

        {/* Relationship */}
        <View className="mb-5">
          <Text className="text-[#070707] mb-2">
            {t("GoviPensionForm.Relationship")} *
          </Text>
          <View className="px-2">
            <View className="flex-row justify-between">
              <View className="flex-1">
                {leftColumnOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() =>
                      updateFormData("successorRelationship", option.value)
                    }
                    className="flex-row items-center py-2"
                  >
                    <View className="w-5 h-5 rounded-3xl border-2 border-gray-400 mr-3 justify-center items-center">
                      {formData.successorRelationship === option.value && (
                        <View className="w-3 h-3 rounded-full bg-black" />
                      )}
                    </View>
                    <Text className="text-gray-700">{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View className="flex-1">
                {rightColumnOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() =>
                      updateFormData("successorRelationship", option.value)
                    }
                    className="flex-row items-center py-2"
                  >
                    <View className="w-5 h-5 rounded-2xl border-2 border-gray-400 mr-3 justify-center items-center">
                      {formData.successorRelationship === option.value && (
                        <View className="w-3 h-3 rounded-full bg-black" />
                      )}
                    </View>
                    <Text className="text-gray-700">{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Successor Date of Birth */}
        <View className="mb-5">
          <Text className="text-[#070707] mb-2">
            {t("GoviPensionForm.SuccessorsDateOfBirth")} *
          </Text>
          <TouchableOpacity
            onPress={() => setShowCustomSuccessorDobPicker(true)}
            className="bg-[#F4F4F4] rounded-3xl px-4 h-[50px] flex-row justify-between items-center border border-gray-100"
          >
            <Text
              className={`text-sm ${formData.successorDateOfBirth ? "text-[#070707]" : "text-[#585858]"}`}
            >
              {formData.successorDateOfBirth
                ? formatDate(formData.successorDateOfBirth)
                : t("GoviPensionForm.SelectDate")}
            </Text>
            <FontAwesome6 name="calendar-days" size={20} color="black" />
          </TouchableOpacity>
        </View>

        {formData.successorDateOfBirth ? (
          isOver18 ? (
            <>
              {/* Successor NIC */}
              <View className="mb-5">
                <Text className="text-[#070707] mb-2">
                  {t("GoviPensionForm.SuccessorsNICNumber")} *
                </Text>
                <TextInput
                  value={formData.successorNicNumber}
                  onChangeText={handleSuccessorNicChange}
                  placeholder={t("Main.TypeHere")}
                  placeholderTextColor="#585858"
                  className="bg-[#F4F4F4] rounded-3xl px-4 h-[50px] text-[#070707] text-sm"
                  keyboardType="default"
                  maxLength={12}
                />
                {successorNicError ? (
                  <Text className="text-red-500 text-xs mt-1 ml-4">
                    {successorNicError}
                  </Text>
                ) : null}
              </View>

              {/* Successor NIC Front */}
              <View className="mb-5">
                <Text className="text-[#070707] mb-2">
                  {t("GoviPensionForm.SuccessorsNICFrontImage")} *
                </Text>
                <TouchableOpacity
                  onPress={() => pickImageFromGallery("successorNicFront")}
                  className="bg-white border border-gray-300 rounded-3xl px-6 h-[50px] flex-row justify-center items-center mb-4"
                >
                  <FontAwesome6 name="cloud-arrow-up" size={22} color="black" />
                  <Text className="text-gray-900 ml-2 font-medium text-sm">
                    {formData.successorNicFrontImage
                      ? t("GoviPensionForm.ReUploadImage")
                      : t("GoviPensionForm.UploadImage")}
                  </Text>
                </TouchableOpacity>
                {formData.successorNicFrontImage ? (
                  <View className="mb-3">
                    <View className="relative">
                      <Image
                        source={{ uri: formData.successorNicFrontImage }}
                        className="w-full h-48 rounded-lg"
                        resizeMode="contain"
                      />
                      <TouchableOpacity
                        onPress={() =>
                          updateFormData("successorNicFrontImage", null)
                        }
                        className="absolute right-2 top-2"
                      >
                        <Ionicons name="close-circle" size={28} color="red" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}
              </View>

              {/* Successor NIC Back */}
              <View className="mb-8">
                <Text className="text-[#070707] mb-2">
                  {t("GoviPensionForm.SuccessorsNICBackImage")} *
                </Text>
                <TouchableOpacity
                  onPress={() => pickImageFromGallery("successorNicBack")}
                  className="bg-white border border-gray-300 rounded-3xl px-6 h-[50px] flex-row justify-center items-center mb-4"
                >
                  <FontAwesome6 name="cloud-arrow-up" size={22} color="black" />
                  <Text className="text-gray-900 ml-2 font-medium text-sm">
                    {formData.successorNicBackImage
                      ? t("GoviPensionForm.ReUploadImage")
                      : t("GoviPensionForm.UploadImage")}
                  </Text>
                </TouchableOpacity>
                {formData.successorNicBackImage ? (
                  <View className="mb-3">
                    <View className="relative">
                      <Image
                        source={{ uri: formData.successorNicBackImage }}
                        className="w-full h-48 rounded-lg"
                        resizeMode="contain"
                      />
                      <TouchableOpacity
                        onPress={() =>
                          updateFormData("successorNicBackImage", null)
                        }
                        className="absolute right-2 top-2"
                      >
                        <Ionicons name="close-circle" size={28} color="red" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}
              </View>
            </>
          ) : (
            <>
              {/* Birth Certificate Front */}
              <View className="mb-5">
                <Text className="text-[#070707] mb-2">
                  {t("GoviPensionForm.SuccessorsBirthCertificateFront")} *
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    pickImageFromGallery("successorBirthCertFront")
                  }
                  className="bg-white border border-gray-300 rounded-3xl px-6 h-[50px] flex-row justify-center items-center mb-4"
                >
                  <FontAwesome6 name="cloud-arrow-up" size={22} color="black" />
                  <Text className="text-gray-900 ml-2 font-medium text-sm">
                    {formData.successorBirthCertFrontImage
                      ? t("GoviPensionForm.ReUploadImage")
                      : t("GoviPensionForm.UploadImage")}
                  </Text>
                </TouchableOpacity>
                {formData.successorBirthCertFrontImage ? (
                  <View className="mb-3">
                    <View className="relative">
                      <Image
                        source={{ uri: formData.successorBirthCertFrontImage }}
                        className="w-full h-48 rounded-lg"
                        resizeMode="contain"
                      />
                      <TouchableOpacity
                        onPress={() =>
                          updateFormData("successorBirthCertFrontImage", null)
                        }
                        className="absolute right-2 top-2"
                      >
                        <Ionicons name="close-circle" size={28} color="red" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}
              </View>

              {/* Birth Certificate Back */}
              <View className="mb-8">
                <Text className="text-[#070707] mb-2">
                  {t("GoviPensionForm.SuccessorsBirthCertificateBack")} *
                </Text>
                <TouchableOpacity
                  onPress={() => pickImageFromGallery("successorBirthCertBack")}
                  className="bg-white border border-gray-300 rounded-3xl px-6 h-[50px] flex-row justify-center items-center mb-4"
                >
                  <FontAwesome6 name="cloud-arrow-up" size={22} color="black" />
                  <Text className="text-gray-900 ml-2 font-medium text-sm">
                    {formData.successorBirthCertBackImage
                      ? t("GoviPensionForm.ReUploadImage")
                      : t("GoviPensionForm.UploadImage")}
                  </Text>
                </TouchableOpacity>
                {formData.successorBirthCertBackImage ? (
                  <View className="mb-3">
                    <View className="relative">
                      <Image
                        source={{ uri: formData.successorBirthCertBackImage }}
                        className="w-full h-48 rounded-lg"
                        resizeMode="contain"
                      />
                      <TouchableOpacity
                        onPress={() =>
                          updateFormData("successorBirthCertBackImage", null)
                        }
                        className="absolute right-2 top-2"
                      >
                        <Ionicons name="close-circle" size={28} color="red" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}
              </View>
            </>
          )
        ) : (
          <></>
        )}
      </ScrollView>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      <CustomHeader
        title={t("GoviPensionForm.GoViPension")}
        showBackButton={true}
        navigation={navigation}
        onBackPress={() => navigation.goBack()}
      />

      <CustomDatePicker
        visible={showCustomDobPicker}
        onClose={() => setShowCustomDobPicker(false)}
        onSelect={(date) => updateFormData("dateOfBirth", date)}
        initialDate={formData.dateOfBirth || new Date()}
        maximumDate={new Date()}
      />

      <CustomDatePicker
        visible={showCustomSuccessorDobPicker}
        onClose={() => setShowCustomSuccessorDobPicker(false)}
        onSelect={(date) => updateFormData("successorDateOfBirth", date)}
        initialDate={formData.successorDateOfBirth || new Date()}
        maximumDate={new Date()}
      />

      {currentSection === 1 ? renderSection1() : renderSection2()}

      <View className="px-5 pb-6 pt-4 bg-white">
        {currentSection === 1 ? (
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleCancel}
              className="flex-1 bg-[#ECECEC] rounded-3xl h-[50px] justify-center"
              disabled={isSubmitting}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              <Text className="text-[#8E8E8E] text-center font-medium text-lg">
                {t("Main.Cancel")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNext}
              className={`flex-1 rounded-3xl h-[50px] justify-center ${isSection1Valid() ? "bg-[#00A896]" : "bg-[#C6C6C6]"}`}
              disabled={!isSection1Valid() || isSubmitting}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isSection1Valid() ? 0.35 : 0.1,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              <Text className="text-white text-center font-medium text-lg">
                {t("GoviPensionForm.Next")}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handlePrevious}
              className="flex-1 bg-[#ECECEC] rounded-3xl h-[50px] justify-center"
              disabled={isSubmitting}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              <Text className="text-[#8E8E8E] text-center font-medium text-lg">
                {t("GoviPensionForm.Back")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              className={`flex-1 rounded-3xl h-[50px] justify-center ${isSection2Valid() && !isSubmitting ? "bg-[#00A896]" : "bg-[#C6C6C6]"}`}
              disabled={!isSection2Valid() || isSubmitting}
              style={{
                shadowColor: isSection2Valid() ? "#000" : "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isSection2Valid() ? 0.35 : 0.1,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-medium text-lg">
                  {t("GoviPensionForm.Submit")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default GoviPensionForm;
