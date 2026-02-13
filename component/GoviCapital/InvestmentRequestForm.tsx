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
  Platform,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import DropDownPicker from "react-native-dropdown-picker";
import AntDesign from "react-native-vector-icons/AntDesign";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../types";

type InvestmentRequestFormNavigationProp = StackNavigationProp<
  RootStackParamList,
  "InvestmentRequestForm"
>;

type InvestmentRequestFormRouteProp = RouteProp<
  RootStackParamList,
  "InvestmentRequestForm"
>;

interface InvestmentRequestFormProps {
  navigation: InvestmentRequestFormNavigationProp;
  route: InvestmentRequestFormRouteProp;
}
interface Crop {
  cropGroupId: number;
  cropNameEnglish: string;
  cropNameSinhala: string;
  cropNameTamil: string;
}

const InvestmentRequestForm: React.FC<InvestmentRequestFormProps> = ({
  navigation,
}) => {
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [extentha, setExtentha] = useState("");
  const [extentac, setExtentac] = useState("");
  const [extentp, setExtentp] = useState("");
  const [investment, setInvestment] = useState("");
  const [expectedYield, setExpectedYield] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [nicFrontImage, setNicFrontImage] = useState<string | null>(null);
  const [nicBackImage, setNicBackImage] = useState<string | null>(null);

  // Dropdown state
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Array<{ label: string; value: string }>>(
    [],
  );
  const [loadingCrops, setLoadingCrops] = useState(false);

  const { t, i18n } = useTranslation();

  // Fetch crops from API
  useEffect(() => {
    fetchCrops();
  }, []);

  // Update dropdown items when language changes
  useEffect(() => {
    if (items.length > 0) {
      updateDropdownItems();
    }
  }, [i18n.language]);

  const fetchCrops = async () => {
    setLoadingCrops(true);
    try {
      const token = await AsyncStorage.getItem("userToken");

      const response = await axios.get(
        `${environment.API_BASE_URL}api/goviCapital/get-farm-crops`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data && Array.isArray(response.data)) {
        // Remove duplicates based on cropGroupId
        const uniqueCrops = response.data.reduce(
          (acc: Crop[], current: any) => {
            const exists = acc.find(
              (item) => item.cropGroupId === current.cropGroupId,
            );
            if (!exists && current.cropNameEnglish) {
              acc.push({
                cropGroupId: current.cropGroupId,
                cropNameEnglish: current.cropNameEnglish,
                cropNameSinhala: current.cropNameSinhala,
                cropNameTamil: current.cropNameTamil,
              });
            }
            return acc;
          },
          [],
        );

        // Convert to dropdown format
        const dropdownItems = uniqueCrops.map((crop) => ({
          label: getCropName(crop),
          value: crop.cropGroupId.toString(),
        }));

        setItems(dropdownItems);
      }
    } catch (error) {
      console.error("Error fetching crops:", error);
      Alert.alert("Error", "Failed to load crops. Please try again later.", [
        { text: "OK" },
      ]);
      setItems([]);
    } finally {
      setLoadingCrops(false);
    }
  };

  const updateDropdownItems = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.get(
        `${environment.API_BASE_URL}api/goviCapital/get-farm-crops`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data && Array.isArray(response.data)) {
        const uniqueCrops = response.data.reduce(
          (acc: Crop[], current: any) => {
            const exists = acc.find(
              (item) => item.cropGroupId === current.cropGroupId,
            );
            if (!exists && current.cropNameEnglish) {
              acc.push({
                cropGroupId: current.cropGroupId,
                cropNameEnglish: current.cropNameEnglish,
                cropNameSinhala: current.cropNameSinhala,
                cropNameTamil: current.cropNameTamil,
              });
            }
            return acc;
          },
          [],
        );

        const dropdownItems = uniqueCrops.map((crop) => ({
          label: getCropName(crop),
          value: crop.cropGroupId.toString(),
        }));

        setItems(dropdownItems);
      }
    } catch (error) {
      console.error("Error updating dropdown items:", error);
    }
  };

  const getCropName = (crop: Crop): string => {
    switch (i18n.language) {
      case "si":
        return crop.cropNameSinhala || crop.cropNameEnglish;
      case "ta":
        return crop.cropNameTamil || crop.cropNameEnglish;
      default:
        return crop.cropNameEnglish;
    }
  };

  const validateNumericInput = (text: string): string => {
    const numericText = text.replace(/[^0-9.]/g, "");
    const parts = numericText.split(".");
    if (parts.length > 2) {
      return parts[0] + "." + parts.slice(1).join("");
    }
    return numericText;
  };

  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || startDate;
    setShowDatePicker(Platform.OS === "ios");
    if (currentDate) {
      setStartDate(currentDate);
    }
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

  const pickImageFromGallery = async (imageType: "front" | "back") => {
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
        if (imageType === "front") {
          setNicFrontImage(result.assets[0].uri);
        } else {
          setNicBackImage(result.assets[0].uri);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image. Please try again.");
      console.error("Image picker error:", error);
    }
  };

  const isFormValid = () => {
    const hasValidExtent =
      (extentha && parseFloat(extentha) > 0) ||
      (extentac && parseFloat(extentac) > 0) ||
      (extentp && parseFloat(extentp) > 0);

    return (
      selectedCrop &&
      hasValidExtent &&
      investment &&
      parseFloat(investment) > 0 &&
      expectedYield &&
      parseFloat(expectedYield) > 0 &&
      startDate &&
      nicFrontImage &&
      nicBackImage
    );
  };

  const handleContinue = () => {
    if (!selectedCrop) {
      Alert.alert("Validation Error", "Please select a crop");
      return;
    }

    const hasValidExtent =
      (extentha && parseFloat(extentha) > 0) ||
      (extentac && parseFloat(extentac) > 0) ||
      (extentp && parseFloat(extentp) > 0);

    if (!hasValidExtent) {
      Alert.alert(
        "Validation Error",
        "Please enter at least one extent value greater than 0",
      );
      return;
    }

    if (!investment || parseFloat(investment) <= 0) {
      Alert.alert("Validation Error", "Please enter a valid investment amount");
      return;
    }

    if (!expectedYield || parseFloat(expectedYield) <= 0) {
      Alert.alert("Validation Error", "Please enter a valid expected yield");
      return;
    }

    if (!startDate) {
      Alert.alert("Validation Error", "Please select start date");
      return;
    }
    if (!nicFrontImage) {
      Alert.alert("Validation Error", "Please upload NIC front image");
      return;
    }
    if (!nicBackImage) {
      Alert.alert("Validation Error", "Please upload NIC back image");
      return;
    }

    const selectedCropLabel =
      items.find((item) => item.value === selectedCrop)?.label || selectedCrop;

    navigation.navigate("RequestLetter", {
      crop: selectedCropLabel,
      cropId: selectedCrop,
      extent: {
        ha: extentha || "0",
        ac: extentac || "0",
        p: extentp || "0",
      },
      investment,
      expectedYield,
      startDate: formatDate(startDate),
      nicFrontImage,
      nicBackImage,
    });
  };
  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pb-2 mt-3 py-3">
        <View className="flex-row items-center justify-between mb-2">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <AntDesign name="left" size={18} />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text
              className="text-black text-xl font-semibold"
              style={[
                i18n.language === "si"
                  ? { fontSize: 16 }
                  : i18n.language === "ta"
                    ? { fontSize: 13 }
                    : { fontSize: 17 },
              ]}
            >
              {t("Govicapital.Investment Request")}
            </Text>
          </View>
        </View>
        <View className="w-8" />
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        nestedScrollEnabled={true}
      >
        {/* Crop Dropdown */}
        <View className="mb-5" style={{ zIndex: 1000 }}>
          <Text className="text-[#070707] mb-2">{t("Govicapital.Crop")}</Text>
          <DropDownPicker
            open={open}
            value={selectedCrop}
            items={items}
            setOpen={setOpen}
            setValue={setSelectedCrop}
            setItems={setItems}
            loading={loadingCrops}
            placeholder={t("Govicapital.Select Crop")}
            searchable={true}
            searchPlaceholder={t("Govicapital.Search crop")}
            listMode="MODAL"
            scrollViewProps={{
              nestedScrollEnabled: true,
            }}
            style={{
              backgroundColor: "#F4F4F4",
              borderColor: "#F4F4F4",
              borderRadius: 25,
              minHeight: 50,
              paddingVertical: 12,
              paddingHorizontal: 16,
            }}
            dropDownContainerStyle={{
              backgroundColor: "#FFFFFF",
              borderColor: "#E5E7EB",
              borderRadius: 12,
              marginTop: 4,
              maxHeight: 200,
              paddingVertical: 4,
            }}
            textStyle={{
              fontSize: 14,
              color: "#6B7280",
              lineHeight: 20,
            }}
            placeholderStyle={{
              color: "#9CA3AF",
              fontSize: 14,
              lineHeight: 20,
            }}
            searchTextInputStyle={{
              borderColor: "#E5E7EB",
              borderRadius: 8,
              paddingVertical: 10,
              paddingHorizontal: 12,
            }}
            listItemContainerStyle={{
              height: 44,
              justifyContent: "center",
            }}
            listItemLabelStyle={{
              fontSize: 14,
              color: "#374151",
              lineHeight: 20,
              paddingVertical: 2,
            }}
            selectedItemLabelStyle={{
              fontWeight: "600",
              color: "#111827",
            }}
            modalContentContainerStyle={{
              paddingTop:
                Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0,
              backgroundColor: "#fff",
              paddingBottom: 35,
            }}
            ArrowDownIconComponent={() => (
              <MaterialCommunityIcons
                name="chevron-down"
                size={18}
                color="#9CA3AF"
              />
            )}
            ArrowUpIconComponent={() => (
              <MaterialCommunityIcons
                name="chevron-up"
                size={18}
                color="#9CA3AF"
              />
            )}
            TickIconComponent={() => (
              <MaterialCommunityIcons name="check" size={18} color="#10B981" />
            )}
            activityIndicatorColor="#9CA3AF"
            activityIndicatorSize={20}
          />
        </View>

        {/* Cultivation Extent - 3 Inputs */}
        <View className="mb-5" style={{ zIndex: 100 }}>
          <Text className="text-[#070707] mb-2">
            {t("Govicapital.Cultivation Extent")}
          </Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center space-x-2">
              <TextInput
                className="bg-[#F4F4F4] p-2 px-4 w-20 rounded-2xl text-center"
                value={extentha}
                onChangeText={(text) => {
                  const validatedText = validateNumericInput(text);
                  setExtentha(validatedText);
                }}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#9CA3AF"
              />
              <Text className="text-sm">{t("Govicapital.ha")}</Text>
            </View>

            <View className="flex-row items-center space-x-2">
              <TextInput
                className="bg-[#F4F4F4] p-2 px-4 w-20 rounded-2xl text-center"
                value={extentac}
                onChangeText={(text) => {
                  const validatedText = validateNumericInput(text);
                  setExtentac(validatedText);
                }}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#9CA3AF"
              />
              <Text className="text-sm">{t("Govicapital.ac")}</Text>
            </View>

            <View className="flex-row items-center space-x-2">
              <TextInput
                className="bg-[#F4F4F4] p-2 w-20 px-4 rounded-2xl text-center"
                value={extentp}
                onChangeText={(text) => {
                  const validatedText = validateNumericInput(text);
                  setExtentp(validatedText);
                }}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#9CA3AF"
              />
              <Text className="text-sm">{t("Govicapital.p")}</Text>
            </View>
          </View>
        </View>

        {/* Expected Investment */}
        <View className="mb-5">
          <Text className="text-[#070707] mb-2">
            {t("Govicapital.Expected Investment (Rs.)")}
          </Text>
          <TextInput
            value={investment}
            onChangeText={(text) => {
              const validatedText = validateNumericInput(text);
              setInvestment(validatedText);
            }}
            placeholder="0.00"
            placeholderTextColor="#D1D5DB"
            keyboardType="numeric"
            className="bg-[#F4F4F4] rounded-full px-4 py-3 text-gray-900 text-sm border border-[#F4F4F4]"
          />
        </View>

        {/* Expected Yield */}
        <View className="mb-5">
          <Text className="text-[#070707] mb-2">
            {t("Govicapital.Expected Yield (kg)")}
          </Text>
          <TextInput
            value={expectedYield}
            onChangeText={(text) => {
              const validatedText = validateNumericInput(text);
              setExpectedYield(validatedText);
            }}
            placeholder={t("Govicapital.Type here")}
            placeholderTextColor="#D1D5DB"
            keyboardType="numeric"
            className="bg-[#F4F4F4] rounded-full px-4 py-3 text-gray-900 text-sm border border-[#F4F4F4]"
          />
        </View>

        {/* Expected Start Date with Calendar */}
        <View className="mb-5">
          <Text className="text-[#070707] mb-2">
            {t("Govicapital.Expected Start Date")}
          </Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="bg-[#F4F4F4] rounded-full px-4 py-3 flex-row justify-between items-center border border-[#F4F4F4]"
          >
            <Text
              className={`text-sm ${startDate ? "text-gray-900" : "text-gray-400"}`}
            >
              {startDate ? formatDate(startDate) : t("Govicapital.Select Date")}
            </Text>
            <MaterialCommunityIcons
              name="calendar-blank"
              size={18}
              color="#6B7280"
            />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        {/* NIC Front Image */}
        <View className="mb-5">
          <Text className="text-[#070707] mb-2">
            {t("Govicapital.NIC Front Image")}
          </Text>

          {nicFrontImage ? (
            <View className="mb-3">
              <View className="relative">
                <Image
                  source={{ uri: nicFrontImage }}
                  className="w-full h-48 rounded-lg"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => setNicFrontImage(null)}
                  className="absolute bg-white right-[-6] top-[-10] rounded-full items-center justify-center"
                >
                  <Ionicons name="close-circle" size={28} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={() => pickImageFromGallery("front")}
            className="bg-white border border-gray-300 rounded-full px-6 py-3 flex-row justify-center items-center"
          >
            <FontAwesome6 name="cloud-arrow-up" size={14} color="black" />
            <Text className="text-gray-900 ml-2 font-medium text-sm">
              {nicFrontImage
                ? t("Govicapital.Re-upload image")
                : t("Govicapital.Upload Image")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* NIC Back Image */}
        <View className="mb-6">
          <Text className="text-[#070707] mb-2">
            {t("Govicapital.NIC Back Image")}
          </Text>

          {nicBackImage ? (
            <View className="mb-3">
              <View className="relative">
                <Image
                  source={{ uri: nicBackImage }}
                  className="w-full h-48 rounded-lg"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => setNicBackImage(null)}
                  className="absolute right-2 rounded-full items-center justify-center"
                >
                  <Ionicons name="close-circle" size={28} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={() => pickImageFromGallery("back")}
            className="bg-white border border-gray-300 rounded-full px-6 py-3 flex-row justify-center items-center"
          >
            <FontAwesome6 name="cloud-arrow-up" size={14} color="black" />
            <Text className="text-gray-900 ml-2 font-medium text-sm">
              {nicBackImage
                ? t("Govicapital.Re-upload image")
                : t("Govicapital.Upload Image")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Buttons */}
        <View className="mb-8 mt-4">
          <TouchableOpacity
            onPress={handleCancel}
            className="bg-gray-200 rounded-full py-3.5 mb-3"
          >
            <Text className="text-gray-500 text-center font-medium text-sm">
              {t("Govicapital.Cancel")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleContinue}
            className={`rounded-full py-3.5 ${isFormValid() ? "bg-black" : "bg-gray-400"}`}
            disabled={!isFormValid()}
          >
            <Text className="text-white text-center font-medium text-sm">
              {t("Govicapital.Continue")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default InvestmentRequestForm;
