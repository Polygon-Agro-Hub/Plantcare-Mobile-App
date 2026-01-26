import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Image,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import CustomHeader from "./CustomHeader";
import axios from "axios";
import { environment } from "../../environment/environment";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface GoviPensionFormProps {
  navigation: any;
}

interface FormData {
  // Section 1: Applicant Details
  fullName: string;
  dateOfBirth: Date | null;
  nicNumber: string;
  nicFrontImage: string | null;
  nicBackImage: string | null;

  // Section 2: Successor Details
  successorFullName: string;
  successorRelationship: string;
  successorDateOfBirth: Date | null;
  successorNicNumber: string;
  successorNicFrontImage: string | null;
  successorNicBackImage: string | null;
  successorBirthCertFrontImage: string | null;
  successorBirthCertBackImage: string | null;
}

const GoviPensionForm: React.FC<GoviPensionFormProps> = ({ navigation }) => {
  const [currentSection, setCurrentSection] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    // Section 1
    fullName: "",
    dateOfBirth: null,
    nicNumber: "",
    nicFrontImage: null,
    nicBackImage: null,

    // Section 2
    successorFullName: "",
    successorRelationship: "",
    successorDateOfBirth: null,
    successorNicNumber: "",
    successorNicFrontImage: null,
    successorNicBackImage: null,
    successorBirthCertFrontImage: null,
    successorBirthCertBackImage: null,
  });

  // Date picker states
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [showSuccessorDobPicker, setShowSuccessorDobPicker] = useState(false);

  const { t, i18n } = useTranslation();

  // Relationship options
  const relationshipOptions = [
    { label: t("GoviPensionForm.Wife"), value: "Wife" },
    { label: t("GoviPensionForm.Husband"), value: "Husband" },
    { label: t("GoviPensionForm.Son"), value: "Son" },
    { label: t("GoviPensionForm.Daughter"), value: "Daughter" },
  ];

  // Split relationship options into columns
  const leftColumnOptions = relationshipOptions.slice(0, 2);
  const rightColumnOptions = relationshipOptions.slice(2);

  // Calculate age from date
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

  // Check if successor is 18 or older
  const isSuccessorOver18 = (): boolean => {
    if (!formData.successorDateOfBirth) return false;
    return calculateAge(formData.successorDateOfBirth) >= 18;
  };

  // NIC validation function
  const validateNIC = (nic: string): boolean => {
    const cleanNIC = nic.trim();
    const oldNICPattern = /^[0-9]{9}[Vv]$/;
    const newNICPattern = /^[0-9]{12}$/;
    return oldNICPattern.test(cleanNIC) || newNICPattern.test(cleanNIC);
  };

  // Format date for display
  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  // Format date for API (MySQL timestamp format)
  const formatDateForAPI = (date: Date | null): string => {
    if (!date) return "";
    return date.toISOString().slice(0, 19).replace("T", " ");
  };

  // Handle date change
  const onDateChange = (
    event: any,
    selectedDate?: Date,
    type: "applicant" | "successor" = "applicant",
  ) => {
    if (type === "applicant") {
      setShowDobPicker(Platform.OS === "ios");
      if (selectedDate) {
        setFormData((prev) => ({ ...prev, dateOfBirth: selectedDate }));
      }
    } else {
      setShowSuccessorDobPicker(Platform.OS === "ios");
      if (selectedDate) {
        setFormData((prev) => ({
          ...prev,
          successorDateOfBirth: selectedDate,
        }));
      }
    }
  };

  // Request permission and pick image from gallery
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
        aspect: [4, 3],
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

  // Validation functions
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

    // Check basic fields
    const basicFieldsValid =
      formData.successorFullName.trim() &&
      formData.successorRelationship &&
      formData.successorDateOfBirth;

    if (!basicFieldsValid) return false;

    // If over 18, validate NIC fields
    if (isOver18) {
      const nicValid =
        formData.successorNicNumber.trim() &&
        validateNIC(formData.successorNicNumber);
      const nicImagesValid =
        formData.successorNicFrontImage && formData.successorNicBackImage;
      return nicValid && nicImagesValid;
    } else {
      // Under 18, validate birth certificate fields
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

  const handleSubmit = async () => {
    const isOver18 = isSuccessorOver18();

    // Validate basic fields
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
      // Validate NIC for over 18
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
      // Validate birth certificate for under 18
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

    setIsSubmitting(true);

    try {
      // Create FormData for multipart/form-data request
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Error", "Please login again");
        navigation.navigate("Login");
        return;
      }

      const formDataToSend = new FormData();

      // Add text fields
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

      // Helper function to add images to FormData
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

      // Add applicant NIC images
      addImageToFormData(formData.nicFrontImage, "nicFront");
      addImageToFormData(formData.nicBackImage, "nicBack");

      // Add successor images based on age
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

      console.log("Submitting pension request...");

      // Submit form
      const response = await axios.post(
        `${environment.API_BASE_URL}api/pension/pension-request/submit`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          timeout: 30000, // 30 seconds timeout
        },
      );

      console.log("Response:", response.data);

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
        // Server responded with error
        errorMessage =
          error.response.data?.message || error.response.statusText;
      } else if (error.request) {
        // No response received
        errorMessage =
          "No response from server. Please check your internet connection.";
      } else {
        // Something else happened
        errorMessage = error.message || errorMessage;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Render Section 1: Applicant Details
  const renderSection1 = () => (
    <ScrollView
      className="flex-1 px-5"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      {/* 1. Your Full Name */}
      <View className="mb-5 mt-4">
        <Text className="text-[#070707] mb-2">
          {t("GoviPensionForm.Your Full Name")} *
        </Text>
        <TextInput
          value={formData.fullName}
          onChangeText={(text) => updateFormData("fullName", text)}
          placeholder={t("GoviPensionForm.--Type here--")}
          placeholderTextColor="#585858"
          className="bg-[#F4F4F4] rounded-2xl px-4 py-3 text-[#070707] text-sm"
        />
      </View>

      {/* 2. Your Date of Birth */}
      <View className="mb-5">
        <Text className="text-[#070707] mb-2">
          {t("GoviPensionForm.Your Date of Birth")} *
        </Text>
        <TouchableOpacity
          onPress={() => setShowDobPicker(true)}
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

        {showDobPicker && (
          <DateTimePicker
            value={formData.dateOfBirth || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, date) => onDateChange(event, date, "applicant")}
            maximumDate={new Date()}
          />
        )}
      </View>

      {/* 3. Your NIC Number */}
      <View className="mb-5">
        <Text className="text-[#070707] mb-2">
          {t("GoviPensionForm.Your NIC Number")} *
        </Text>
        <TextInput
          value={formData.nicNumber}
          onChangeText={(text) => updateFormData("nicNumber", text)}
          placeholder={t("GoviPensionForm.--Type here--")}
          placeholderTextColor="#585858"
          className="bg-[#F4F4F4] rounded-2xl px-4 py-3 text-[#070707] text-sm"
          keyboardType="default"
          maxLength={12}
        />
        {formData.nicNumber.trim() && !validateNIC(formData.nicNumber) && (
          <Text className="text-red-500 text-xs mt-1 ml-4">
            NIC must be 9 digits + V/v or 12 digits
          </Text>
        )}
      </View>

      {/* 4. NIC Front Image */}
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

      {/* 5. NIC Back Image */}
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

  // Render Section 2: Successor Details
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
        {/* 6. Successor's Full Name */}
        <View className="mb-5 mt-4">
          <Text className="text-[#070707] mb-2">
            {t("GoviPensionForm.Successor's Full Name")} *
          </Text>
          <TextInput
            value={formData.successorFullName}
            onChangeText={(text) => updateFormData("successorFullName", text)}
            placeholder={t("GoviPensionForm.--Type here--")}
            placeholderTextColor="#585858"
            className="bg-[#F4F4F4] rounded-2xl px-4 py-3 text-[#070707] text-sm"
          />
        </View>

        {/* 7. Successor Relationship */}
        <View className="mb-5">
          <Text className="text-[#070707] mb-2">
            {t("GoviPensionForm.Relationship")} *
          </Text>
          <View className="px-2">
            <View className="flex-row justify-between">
              {/* Left Column */}
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

              {/* Right Column */}
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
                        <View className="w-3 h-3 rounded-full bg-[#00A896]" />
                      )}
                    </View>
                    <Text className="text-gray-700">{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* 8. Successor's Date of Birth */}
        <View className="mb-5">
          <Text className="text-[#070707] mb-2">
            {t("GoviPensionForm.Successor's Date of Birth")} *
          </Text>
          <TouchableOpacity
            onPress={() => setShowSuccessorDobPicker(true)}
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

          {showSuccessorDobPicker && (
            <DateTimePicker
              value={formData.successorDateOfBirth || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, date) => onDateChange(event, date, "successor")}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Conditionally render NIC or Birth Certificate fields based on age - ONLY if date is selected */}
        {formData.successorDateOfBirth ? (
          isOver18 ? (
            <>
              {/* Successor's NIC Number (Only if 18 or older) */}
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

              {/* Successor's NIC Front Image */}
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

              {/* Successor's NIC Back Image */}
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
              {/* Successor's Birth Certificate Front Image (Only if under 18) */}
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

              {/* Successor's Birth Certificate Back Image */}
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

      {/* Form Content */}
      {currentSection === 1 ? renderSection1() : renderSection2()}

      {/* Action Buttons */}
      <View className="px-5 pb-6 pt-4 bg-white">
        {currentSection === 1 ? (
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={handleCancel}
              className="flex-1 bg-[#ECECEC] rounded-2xl py-4"
              disabled={isSubmitting}
            >
              <Text className="text-[#8E8E8E] text-center font-medium text-base">
                {t("GoviPensionForm.Cancel")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNext}
              className={`flex-1 rounded-2xl py-4 ${isSection1Valid() ? "bg-[#00A896]" : "bg-[#C6C6C6]"}`}
              disabled={!isSection1Valid() || isSubmitting}
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
              className="flex-1 bg-[#ECECEC] rounded-2xl py-4"
              disabled={isSubmitting}
            >
              <Text className="text-[#8E8E8E] text-center font-medium text-base">
                {t("GoviPensionForm.Back")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              className={`flex-1 rounded-2xl py-4 ${isSection2Valid() && !isSubmitting ? "bg-[#00A896]" : "bg-[#C6C6C6]"}`}
              disabled={!isSection2Valid() || isSubmitting}
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
