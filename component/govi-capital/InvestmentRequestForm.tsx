import React, { useState, useEffect, useRef } from "react";
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
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { AntDesign, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { RootStackParamList } from "../types/types";
import CustomHeader from "../common/CustomHeader";
import GlobalSearchModal from "../common/GlobalSearchModal";

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
  const [plotNumber, setPlotNumber] = useState("");
  const [streetName, setStreetName] = useState("");
  const [landCity, setLandCity] = useState("");
  const [items, setItems] = useState<Array<{ label: string; value: string }>>(
    [],
  );
  const [loadingCrops, setLoadingCrops] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const { t, i18n } = useTranslation();
  const scrollViewRef = useRef<ScrollView>(null);

  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, []),
  );

  useEffect(() => {
    fetchCrops();
  }, []);

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

  const handleCropSelect = (selectedValues: string[]) => {
    if (selectedValues.length > 0) {
      setSelectedCrop(selectedValues[0]);
    }
  };

  const getSelectedCropLabel = () => {
    if (!selectedCrop) return t("Govicapital.Select Crop");
    const crop = items.find((item) => item.value === selectedCrop);
    return crop ? crop.label : selectedCrop;
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
      nicBackImage &&
      plotNumber &&
      streetName &&
      landCity
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
    if (!plotNumber) {
      Alert.alert("Validation Error", "Please Enter Plot Number");
    }
    if (!streetName) {
      Alert.alert("Validation Error", "Please Enter Street Name");
    }
    if (!landCity) {
      Alert.alert("Validation Error", "Please Enter Land City");
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
      plotNumber,
      streetName,
      landCity,
    });
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const formatWithCommas = (value: string): string => {
    const numeric = value.replace(/,/g, "");
    if (!numeric) return "";
    const parts = numeric.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <CustomHeader
        title={t("Govicapital.Investment Request")}
        navigation={navigation}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        nestedScrollEnabled={true}
      >
        {/* Crop Selection with GlobalSearchModal */}
        <View className="mb-5">
          <Text className="text-[#070707] mb-2">{t("Govicapital.Crop")} *</Text>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="bg-[#F4F4F4] rounded-full px-4 h-[50px] flex-row justify-between items-center border border-[#F4F4F4]"
            disabled={loadingCrops}
          >
            <Text
              className={`text-sm ${selectedCrop ? "text-gray-900" : "text-gray-400"}`}
            >
              {loadingCrops ? "Loading crops..." : getSelectedCropLabel()}
            </Text>

            <AntDesign name="caret-down" size={14} color="#555" />
          </TouchableOpacity>
        </View>

        {/* Cultivation Extent - 3 Inputs */}
        <View className="mb-5">
          <Text className="text-[#070707] mb-2">
            {t("Govicapital.Cultivation Extent")} *
          </Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <TextInput
                className="bg-[#F4F4F4] p-2 px-4 w-20 rounded-3xl h-[50px] text-center"
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

            <View className="flex-row items-center gap-2">
              <TextInput
                className="bg-[#F4F4F4] p-2 px-4 w-20 rounded-3xl h-[50px] text-center"
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

            <View className="flex-row items-center gap-2">
              <TextInput
                className="bg-[#F4F4F4] p-2 w-20 px-4 rounded-3xl h-[50px] text-center"
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
            {t("Govicapital.Expected Investment (Rs.)")} *
          </Text>
          <TextInput
            value={formatWithCommas(investment)}
            onChangeText={(text) => {
              const stripped = text.replace(/,/g, "");
              const validated = validateNumericInput(stripped);
              setInvestment(validated);
            }}
            placeholder="0.00"
            placeholderTextColor="#D1D5DB"
            keyboardType="numeric"
            className="bg-[#F4F4F4] rounded-3xl px-4 h-[50px] text-gray-900 text-sm border border-[#F4F4F4]"
          />
        </View>

        {/* Expected Yield */}
        <View className="mb-5">
          <Text className="text-[#070707] mb-2">
            {t("Govicapital.Expected Yield (kg)")} *
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
            className="bg-[#F4F4F4] rounded-3xl px-4 h-[50px] text-gray-900 text-sm border border-[#F4F4F4]"
          />
        </View>

        {/* Expected Start Date with Calendar */}
        <View className="mb-5">
          <Text className="text-[#070707] mb-2">
            {t("Govicapital.Expected Start Date")} *
          </Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="bg-[#F4F4F4] rounded-full px-4 h-[50px] flex-row justify-between items-center border border-[#F4F4F4]"
          >
            <Text
              className={`text-sm ${startDate ? "text-gray-900" : "text-gray-400"}`}
            >
              {startDate ? formatDate(startDate) : t("Govicapital.Select Date")}
            </Text>
            <MaterialCommunityIcons
              name="calendar-blank"
              size={22}
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
            {t("Govicapital.NIC Front Image")} *
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
                  className="absolute right-2 top-2 rounded-3xl h-[50px] items-center justify-center"
                >
                  <Ionicons name="close-circle" size={28} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={() => pickImageFromGallery("front")}
            className="bg-white border border-gray-300 rounded-full px-6 h-[50px] flex-row justify-center items-center"
          >
            <FontAwesome6 name="cloud-arrow-up" size={14} color="black" />
            <Text className="text-gray-900 ml-2 font-medium ">
              {nicFrontImage
                ? t("Govicapital.Re-upload image")
                : t("Govicapital.Upload Image")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* NIC Back Image */}
        <View className="mb-6">
          <Text className="text-[#070707] mb-2">
            {t("Govicapital.NIC Back Image")} *
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
                  className="absolute right-2 top-2 rounded-3xl h-[50px] items-center justify-center"
                >
                  <Ionicons name="close-circle" size={28} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={() => pickImageFromGallery("back")}
            className="bg-white border border-gray-300 rounded-3xl p-[50px] px-6 py-3 flex-row justify-center items-center"
          >
            <FontAwesome6 name="cloud-arrow-up" size={14} color="black" />
            <Text className="text-gray-900 ml-2 font-medium text-sm">
              {nicBackImage
                ? t("Govicapital.Re-upload image")
                : t("Govicapital.Upload Image")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Land’s Plot Number */}
        <View className="mb-5">
          <Text className="text-[#070707] mb-2">
            {t("Govicapital.Land’s Plot Number")} *
          </Text>
          <TextInput
            value={plotNumber}
            onChangeText={(text) => setPlotNumber(text.trimStart())}
            placeholder={t("Govicapital.plotnumberplaceholder")}
            placeholderTextColor="#D1D5DB"
            className="bg-[#F4F4F4] rounded-3xl px-4 h-[50px] text-gray-900 text-sm border border-[#F4F4F4]"
          />
        </View>

        {/*Land’s Street Name */}
        <View className="mb-5">
          <Text className="text-[#070707] mb-2">
            {t("Govicapital.Land’s Street Name")} *
          </Text>
          <TextInput
            value={streetName}
            onChangeText={(text) => setStreetName(text.trimStart())}
            placeholder={t("Govicapital.Type here")}
            placeholderTextColor="#D1D5DB"
            className="bg-[#F4F4F4] rounded-3xl px-4 h-[50px] text-gray-900 text-sm border border-[#F4F4F4]"
          />
        </View>

        {/* Land’s City */}
        <View className="mb-5">
          <Text className="text-[#070707] mb-2">
            {t("Govicapital.Land’s City")} *
          </Text>
          <TextInput
            value={landCity}
            onChangeText={(text) => {
              const trimmed = text.trimStart();
              const capitalized =
                trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
              setLandCity(capitalized);
            }}
            placeholder={t("Govicapital.Type here")}
            placeholderTextColor="#D1D5DB"
            className="bg-[#F4F4F4] rounded-3xl px-4 h-[50px] text-gray-900 text-sm border border-[#F4F4F4]"
          />
        </View>

        {/* Buttons */}
        <View className="mb-8 mt-4">
          <TouchableOpacity
            onPress={handleCancel}
            className="bg-gray-200 rounded-3xl justify-center h-[50px] mb-3"
            style={{
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Text className="text-gray-500 text-center font-medium text-lg">
              {t("Main.Cancel")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleContinue}
            className={`rounded-3xl h-[50px] justify-center ${isFormValid() ? "bg-black" : "bg-gray-400"}`}
            disabled={!isFormValid()}
            style={{
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Text className="text-white text-center font-medium text-lg">
              {t("Main.Continue")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Global Search Modal for Crop Selection */}
      <GlobalSearchModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={t("Govicapital.Select Crop")}
        data={items}
        selectedItems={selectedCrop ? [selectedCrop] : []}
        onSelect={handleCropSelect}
        searchPlaceholder={t("Govicapital.Search crop")}
        doneButtonText={t("Govicapital.Done")}
        noResultsText={t("Govicapital.No crops found")}
        multiSelect={false}
        isLoading={loadingCrops}
        searchKeys={["label"]}
      />
    </View>
  );
};

export default InvestmentRequestForm;
