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
    { label: t("GoviPensionForm.January") || "January", value: 0 },
    { label: t("GoviPensionForm.February") || "February", value: 1 },
    { label: t("GoviPensionForm.March") || "March", value: 2 },
    { label: t("GoviPensionForm.April") || "April", value: 3 },
    { label: t("GoviPensionForm.May") || "May", value: 4 },
    { label: t("GoviPensionForm.June") || "June", value: 5 },
    { label: t("GoviPensionForm.July") || "July", value: 6 },
    { label: t("GoviPensionForm.August") || "August", value: 7 },
    { label: t("GoviPensionForm.September") || "September", value: 8 },
    { label: t("GoviPensionForm.October") || "October", value: 9 },
    { label: t("GoviPensionForm.November") || "November", value: 10 },
    { label: t("GoviPensionForm.December") || "December", value: 11 },
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
                {t("GoviPensionForm.Cancel") || "Cancel"}
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
            <View className="bg-[#F4F4F4] rounded-2xl p-4 mt-2">
              <Text className="text-center text-[#070707] text-base font-medium">
                {t("GoviPensionForm.Selected Date") || "Selected Date"}:{" "}
                {`${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`}
              </Text>
            </View>

            {/* Confirm Button */}
            <View className="mt-3">
              <TouchableOpacity
                onPress={handleConfirm}
                className="bg-[#00A896] rounded-2xl py-3 px-6"
              >
                <Text className="text-white text-center font-semibold text-base">
                  {t("GoviPensionForm.Save") || "Save"}
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

  const validateNIC = (nic: string): boolean => {
    const cleanNIC = nic.trim();
    const oldNICPattern = /^[0-9]{9}[Vv]$/;
    const newNICPattern = /^[0-9]{12}$/;
    return oldNICPattern.test(cleanNIC) || newNICPattern.test(cleanNIC);
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
        validateNIC(formData.successorNicNumber);
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

  const isFormComplete = () => {
    return isSection1Valid() && isSection2Valid();
  };

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
          "NIC must be either 9 digits followed by V/v (e.g., 123456789V) or 12 digits (e.g., 199912345678)",
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

  const handlePrevious = () => {
    setCurrentSection(1);
  };

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
          "Successor's NIC must be either 9 digits followed by V/v (e.g., 123456789V) or 12 digits (e.g., 199912345678)",
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
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes", 
          onPress: () => submitPensionRequest(),
        },
      ],
    );
  };

  const handleCancel = () => {
    navigation.goBack();
  };

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
      className="flex-1 px-5"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View className="mb-5 mt-4">
        <Text className="text-[#070707] mb-2">
          {t("GoviPensionForm.Your Full Name")} *
        </Text>
        <TextInput
          value={formData.fullName}
          onChangeText={(text) => {
        
            const filtered = text
              .replace(/^\s+/, "")
              .replace(/[^a-zA-Z\u0080-\uFFFF.\s]/g, "");
            updateFormData("fullName", filtered);
          }}
          placeholder={t("GoviPensionForm.--Type here--")}
          placeholderTextColor="#585858"
          className="bg-[#F4F4F4] rounded-2xl px-4 py-3 text-[#070707] text-sm"
        />
      </View>

      <View className="mb-5">
        <Text className="text-[#070707] mb-2">
          {t("GoviPensionForm.Your Date of Birth")} *
        </Text>
        <TouchableOpacity
          onPress={() => setShowCustomDobPicker(true)}
          className="bg-[#F4F4F4] rounded-2xl px-4 py-3 flex-row justify-between items-center border border-gray-100"
        >
          <Text
            className={`text-sm ${formData.dateOfBirth ? "text-[#070707]" : "text-[#585858]"}`}
          >
            {formData.dateOfBirth
              ? formatDate(formData.dateOfBirth)
              : t("GoviPensionForm.--Select Date--")}
          </Text>
          <FontAwesome6 name="calendar-days" size={20} color="black" />
        </TouchableOpacity>
      </View>

      <View className="mb-5">
        <Text className="text-[#070707] mb-2">
          {t("GoviPensionForm.Your NIC Number")} *
        </Text>
        <TextInput
          value={formData.nicNumber}
          onChangeText={(text) => {
         
            let filtered = text.replace(/^\s+/, "");


            filtered = filtered.replace(/[^0-9Vv]/g, "");

           
            const hasV = /[Vv]/.test(filtered);

            if (hasV) {
              
              const vIndex = filtered.search(/[Vv]/);
              const digitsBeforeV = filtered
                .slice(0, vIndex)
                .replace(/[^0-9]/g, "");
              const vChar = filtered[vIndex];
       
              filtered = digitsBeforeV.slice(0, 9) + vChar;
            } else {
            
              filtered = filtered.slice(0, 12);
            }

            updateFormData("nicNumber", filtered);
          }}
          placeholder={t("GoviPensionForm.--Type here--")}
          placeholderTextColor="#585858"
          className="bg-[#F4F4F4] rounded-2xl px-4 py-3 text-[#070707] text-sm"
          keyboardType="default"
          maxLength={13}
        />
        {formData.nicNumber.trim() && !validateNIC(formData.nicNumber) && (
          <Text className="text-red-500 text-xs mt-1 ml-4">
            {/[Vv]/.test(formData.nicNumber)
              ? formData.nicNumber.replace(/[^0-9]/g, "").length < 9
                ? "Old NIC requires exactly 9 digits before V (e.g. 123456789V)"
                : "Old NIC format: 9 digits followed by V or v"
              : formData.nicNumber.length < 9
                ? "NIC must be 9 digits + V/v (old) or 12 digits (new)"
                : formData.nicNumber.length < 12
                  ? "New NIC must be exactly 12 digits, or add V/v for old NIC"
                  : "Invalid NIC format"}
          </Text>
        )}
      </View>

      <View className="mb-5">
        <Text className="text-[#070707] mb-2">
          {t("GoviPensionForm.NIC Front Image")} *
        </Text>

        <TouchableOpacity
          onPress={() => pickImageFromGallery("nicFront")}
          className="bg-white border border-gray-300 rounded-2xl px-6 py-3 flex-row justify-center items-center mb-4"
        >
          <FontAwesome6 name="cloud-arrow-up" size={22} color="black" />
          <Text className="text-gray-900 ml-2 font-medium text-sm">
            {formData.nicFrontImage
              ? t("GoviPensionForm.Re-upload image")
              : t("GoviPensionForm.Upload Image")}
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

      <View className="mb-8">
        <Text className="text-[#070707] mb-2">
          {t("GoviPensionForm.NIC Back Image")} *
        </Text>

        <TouchableOpacity
          onPress={() => pickImageFromGallery("nicBack")}
          className="bg-white border border-gray-300 rounded-2xl px-6 py-3 flex-row justify-center items-center mb-4"
        >
          <FontAwesome6 name="cloud-arrow-up" size={22} color="black" />
          <Text className="text-gray-900 ml-2 font-medium text-sm">
            {formData.nicBackImage
              ? t("GoviPensionForm.Re-upload image")
              : t("GoviPensionForm.Upload Image")}
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
    const age = formData.successorDateOfBirth
      ? calculateAge(formData.successorDateOfBirth)
      : 0;

    return (
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
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
              updateFormData("successorFullName", filtered);
            }}
            placeholder={t("GoviPensionForm.--Type here--")}
            placeholderTextColor="#585858"
            className="bg-[#F4F4F4] rounded-2xl px-4 py-3 text-[#070707] text-sm"
          />
        </View>

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
                    <View className="w-5 h-5 rounded-2xl border-2 border-gray-400 mr-3 justify-center items-center">
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

        <View className="mb-5">
          <Text className="text-[#070707] mb-2">
            {t("GoviPensionForm.Successor's Date of Birth")} *
          </Text>
          <TouchableOpacity
            onPress={() => setShowCustomSuccessorDobPicker(true)}
            className="bg-[#F4F4F4] rounded-2xl px-4 py-3 flex-row justify-between items-center border border-gray-100"
          >
            <Text
              className={`text-sm ${formData.successorDateOfBirth ? "text-[#070707]" : "text-[#585858]"}`}
            >
              {formData.successorDateOfBirth
                ? formatDate(formData.successorDateOfBirth)
                : t("GoviPensionForm.--Select Date--")}
            </Text>
            <FontAwesome6 name="calendar-days" size={20} color="black" />
          </TouchableOpacity>
        </View>

        {formData.successorDateOfBirth ? (
          isOver18 ? (
            <>
              <View className="mb-5">
                <Text className="text-[#070707] mb-2">
                  {t("GoviPensionForm.Successor's NIC Number")} *
                </Text>
                <TextInput
                  value={formData.successorNicNumber}
                  onChangeText={(text) =>
                    updateFormData("successorNicNumber", text)
                  }
                  placeholder={t("GoviPensionForm.--Type here--")}
                  placeholderTextColor="#585858"
                  className="bg-[#F4F4F4] rounded-2xl px-4 py-3 text-[#070707] text-sm"
                  keyboardType="default"
                  maxLength={12}
                />
                {formData.successorNicNumber.trim() &&
                  !validateNIC(formData.successorNicNumber) && (
                    <Text className="text-red-500 text-xs mt-1 ml-4">
                      NIC must be 9 digits + V/v or 12 digits
                    </Text>
                  )}
              </View>

              <View className="mb-5">
                <Text className="text-[#070707] mb-2">
                  {t("GoviPensionForm.Successor's NIC Front Image")} *
                </Text>

                <TouchableOpacity
                  onPress={() => pickImageFromGallery("successorNicFront")}
                  className="bg-white border border-gray-300 rounded-2xl px-6 py-3 flex-row justify-center items-center mb-4"
                >
                  <FontAwesome6 name="cloud-arrow-up" size={22} color="black" />
                  <Text className="text-gray-900 ml-2 font-medium text-sm">
                    {formData.successorNicFrontImage
                      ? t("GoviPensionForm.Re-upload image")
                      : t("GoviPensionForm.Upload Image")}
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

              <View className="mb-8">
                <Text className="text-[#070707] mb-2">
                  {t("GoviPensionForm.Successor's NIC Back Image")} *
                </Text>

                <TouchableOpacity
                  onPress={() => pickImageFromGallery("successorNicBack")}
                  className="bg-white border border-gray-300 rounded-2xl px-6 py-3 flex-row justify-center items-center mb-4"
                >
                  <FontAwesome6 name="cloud-arrow-up" size={22} color="black" />
                  <Text className="text-gray-900 ml-2 font-medium text-sm">
                    {formData.successorNicBackImage
                      ? t("GoviPensionForm.Re-upload image")
                      : t("GoviPensionForm.Upload Image")}
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
              <View className="mb-5">
                <Text className="text-[#070707] mb-2">
                  {t("GoviPensionForm.Successor's Birth Certificate (Front)")} *
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    pickImageFromGallery("successorBirthCertFront")
                  }
                  className="bg-white border border-gray-300 rounded-2xl px-6 py-3 flex-row justify-center items-center mb-4"
                >
                  <FontAwesome6 name="cloud-arrow-up" size={22} color="black" />
                  <Text className="text-gray-900 ml-2 font-medium text-sm">
                    {formData.successorBirthCertFrontImage
                      ? t("GoviPensionForm.Re-upload image")
                      : t("GoviPensionForm.Upload Image")}
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

              <View className="mb-8">
                <Text className="text-[#070707] mb-2">
                  {t("GoviPensionForm.Successor's Birth Certificate (Back)")} *
                </Text>

                <TouchableOpacity
                  onPress={() => pickImageFromGallery("successorBirthCertBack")}
                  className="bg-white border border-gray-300 rounded-2xl px-6 py-3 flex-row justify-center items-center mb-4"
                >
                  <FontAwesome6 name="cloud-arrow-up" size={22} color="black" />
                  <Text className="text-gray-900 ml-2 font-medium text-sm">
                    {formData.successorBirthCertBackImage
                      ? t("GoviPensionForm.Re-upload image")
                      : t("GoviPensionForm.Upload Image")}
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

      {/* Applicant Date of Birth Picker */}
      <CustomDatePicker
        visible={showCustomDobPicker}
        onClose={() => setShowCustomDobPicker(false)}
        onSelect={(date) => updateFormData("dateOfBirth", date)}
        initialDate={formData.dateOfBirth || new Date()}
        maximumDate={new Date()}
      />

      {/* Successor Date of Birth Picker */}
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
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={handleCancel}
              className="flex-1 bg-[#ECECEC] rounded-full py-4"
              disabled={isSubmitting}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              <Text className="text-[#8E8E8E] text-center font-medium text-base">
                {t("GoviPensionForm.Cancel")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNext}
              className={`flex-1 rounded-full py-4 ${isSection1Valid() ? "bg-[#00A896]" : "bg-[#C6C6C6]"}`}
              disabled={!isSection1Valid() || isSubmitting}
              style={{
                shadowColor: isSection1Valid() ? "#000" : "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isSection1Valid() ? 0.35 : 0.1,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              <Text className="text-white text-center font-medium text-base">
                {t("GoviPensionForm.Next")}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={handlePrevious}
              className="flex-1 bg-[#ECECEC] rounded-full py-4"
              disabled={isSubmitting}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              <Text className="text-[#8E8E8E] text-center font-medium text-base">
                {t("GoviPensionForm.Back")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              className={`flex-1 rounded-full py-4 ${isSection2Valid() && !isSubmitting ? "bg-[#00A896]" : "bg-[#C6C6C6]"}`}
              disabled={!isSection2Valid() || isSubmitting}
              style={{
                shadowColor: isSection2Valid() ? "#00A896" : "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isSection2Valid() ? 0.35 : 0.1,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-medium text-base">
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
