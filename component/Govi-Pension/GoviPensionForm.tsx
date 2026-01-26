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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import CustomHeader from "./CustomHeader";

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
}

const GoviPensionForm: React.FC<GoviPensionFormProps> = ({ navigation }) => {
  const [currentSection, setCurrentSection] = useState<1 | 2>(1);
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
  });

  // Date picker states
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [showSuccessorDobPicker, setShowSuccessorDobPicker] = useState(false);

  const { t, i18n } = useTranslation();

  // Relationship options
  const relationshipOptions = [
    { label: t("GoviPensionForm.Wife"), value: "Wife" },
    { label: t("GoviPensionForm.Father"), value: "Father" },
    { label: t("GoviPensionForm.Mother"), value: "Mother" },
    { label: t("GoviPensionForm.Son"), value: "Son" },
    { label: t("GoviPensionForm.Daughter"), value: "Daughter" },
    { label: t("GoviPensionForm.Sibling"), value: "Sibling" },
  ];

  // Split relationship options into columns
  const leftColumnOptions = relationshipOptions.slice(0, 3); // Wife, Father, Mother
  const rightColumnOptions = relationshipOptions.slice(3); // Son, Daughter, Sibling

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

  // Validate successor age (must be at least 16 for NIC)
  const isSuccessorOldEnoughForNIC = (): boolean => {
    if (!formData.successorDateOfBirth) return false;
    const age = calculateAge(formData.successorDateOfBirth);
    return age >= 16;
  };

  // NIC validation function
  const validateNIC = (nic: string): boolean => {
    // Remove whitespace
    const cleanNIC = nic.trim();

    // Old NIC format: 9 digits + V/v (e.g., 123456789V)
    const oldNICPattern = /^[0-9]{9}[Vv]$/;

    // New NIC format: 12 digits (e.g., 199912345678)
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
      | "successorNicBack",
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
    // Check basic fields
    const basicFieldsValid =
      formData.successorFullName.trim() &&
      formData.successorRelationship &&
      formData.successorDateOfBirth;

    // Always return true for basic fields - no NIC validation required
    return basicFieldsValid;
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

  const handleSubmit = () => {
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

    // Validate successor NIC only if provided
    if (
      formData.successorNicNumber.trim() &&
      !validateNIC(formData.successorNicNumber)
    ) {
      Alert.alert(
        "Invalid NIC",
        "Successor's NIC must be either 9 digits followed by V/v (e.g., 123456789V) or 12 digits (e.g., 199912345678)",
      );
      return;
    }

    if (isFormComplete()) {
      // Navigate to status page
      navigation.navigate("GoviPensionStatus");
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
    const isOldEnough = isSuccessorOldEnoughForNIC();
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
        <View className="mb-5">
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
            className="bg-gray-100 rounded-2xl px-4 py-3 flex-row justify-between items-center border border-gray-100"
          >
            <Text
              className={`text-sm ${formData.successorDateOfBirth ? "text-gray-900" : "text-gray-400"}`}
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

          {/* Age validation message */}
          {formData.successorDateOfBirth && !isOldEnough && (
            <View className="mt-2">
              <Text className="text-[#FF0000] text-sm">
                Successor must be at least 16 years old to have a NIC number.
              </Text>
            </View>
          )}
        </View>

        {/* 9. Successor's NIC Number */}
        <View className="mb-5">
          <Text className="text-[#070707] mb-2">
            {t("GoviPensionForm.Successor's NIC Number")} *
          </Text>
          <TextInput
            value={formData.successorNicNumber}
            onChangeText={(text) => updateFormData("successorNicNumber", text)}
            placeholder={t("GoviPensionForm.Enter successor's NIC number")}
            placeholderTextColor="#D1D5DB"
            className="bg-gray-100 rounded-2xl px-4 py-3 text-gray-900 text-sm border border-gray-100"
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

        {/* 10. Successor's NIC Front Image */}
        <View className="mb-5">
          <Text className="text-[#070707] mb-2">
            {t("GoviPensionForm.Successor's NIC Front Image")} *
          </Text>

          <TouchableOpacity
            onPress={() => pickImageFromGallery("successorNicFront")}
            className="bg-white border border-gray-300 rounded-2xl px-6 py-3 flex-row justify-center items-center mb-4"
          >
            <FontAwesome6 name="cloud-arrow-up" size={22} color="black" />
            <Text className="ml-2 font-medium text-sm text-gray-900">
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
                  onPress={() => updateFormData("successorNicFrontImage", null)}
                  className="absolute right-2 top-2"
                >
                  <Ionicons name="close-circle" size={28} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>

        {/* 11. Successor's NIC Back Image */}
        <View className="mb-8">
          <Text className="text-gray-700 mb-2">
            {t("GoviPensionForm.Successor's NIC Back Image")} *
          </Text>

          <TouchableOpacity
            onPress={() => pickImageFromGallery("successorNicBack")}
            className="bg-white border border-gray-300 rounded-2xl px-6 py-3 flex-row justify-center items-center mb-4"
          >
            <FontAwesome6 name="cloud-arrow-up" size={22} color="black" />
            <Text className="ml-2 font-medium text-sm text-gray-900">
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
                  onPress={() => updateFormData("successorNicBackImage", null)}
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
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

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
            >
              <Text className="text-[#8E8E8E] text-center font-medium text-base">
                {t("GoviPensionForm.Cancel")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNext}
              className={`flex-1 rounded-2xl py-4 ${isSection1Valid() ? "bg-[#00A896]" : "bg-[#C6C6C6]"}`}
              disabled={!isSection1Valid()}
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
            >
              <Text className="text-[#8E8E8E] text-center font-medium text-base">
                {t("GoviPensionForm.Back")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              className={`flex-1 rounded-2xl py-4 ${isSection2Valid() ? "bg-[#00A896]" : "bg-[#C6C6C6]"}`}
              disabled={!isSection2Valid()}
            >
              <Text className="text-white text-center font-medium text-base">
                {t("GoviPensionForm.Submit")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default GoviPensionForm;
