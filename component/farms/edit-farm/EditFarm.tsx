import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Modal,
  Alert,
  BackHandler,
  Platform,
} from "react-native";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import ImageData from "@/assets/jsons/farm/farm-image.json";
import districtData from "@/assets/jsons/common/district.json";
import { StackNavigationProp } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import axios from "axios";
import { RootStackParamList } from "../../types/types";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n/i18n";
import CustomHeader from "../../common/CustomHeader";
import GlobalSearchModal from "../../common/GlobalSearchModal";
import { MaterialIcons } from "@expo/vector-icons";
import LoadingPage from "@/component/common/LoadingPage";

type EditFarmNavigationProp = StackNavigationProp<
  RootStackParamList,
  "EditFarm"
>;

interface EditFarmProps {
  route: RouteProp<RootStackParamList, "EditFarm">;
  navigation: EditFarmNavigationProp;
}

interface FarmItem {
  id: number;
  userId: number;
  farmName: string;
  farmIndex: number;
  extentha: string | number;
  extentac: string | number;
  extentp: string | number;
  district: string;
  plotNo: string;
  street: string;
  city: string;
  staffCount: number;
  appUserCount: number;
  imageId: number;
}

interface Staff {
  createdAt: string;
  farmId: number;
  firstName: string;
  id: number;
  image: string | null;
  lastName: string;
  ownerId: number;
  phoneCode: string;
  phoneNumber: string;
  role: string;
}

interface FarmDetailsResponse {
  farm: FarmItem;
  staff: Staff[];
}

const EditFarm: React.FC<EditFarmProps> = ({
  route,
  navigation,
}) => {
  const farmId = route?.params?.farmId ?? null;
  const fromScreen = route?.params?.from;

  const [farmName, setFarmName] = useState<string>("");
  const [extentha, setExtentha] = useState<string>("");
  const [extentac, setExtentac] = useState<string>("");
  const [extentp, setExtentp] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [plotNo, setPlotNo] = useState<string>("");
  const [streetName, setStreetName] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [numberOfStaff, setNumberOfStaff] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [selectedImageId, setSelectedImageId] = useState<number>(1);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [districtModalVisible, setDistrictModalVisible] =
    useState<boolean>(false);
  const [farmData, setFarmData] = useState<FarmItem | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const [tempSelectedImage, setTempSelectedImage] = useState<number>(0);
  const [tempSelectedImageId, setTempSelectedImageId] = useState<number>(1);

  const districtItems = React.useMemo(() => {
    try {
      if (districtData && Array.isArray(districtData)) {
        return districtData
          .filter((item) => item && typeof item === "object" && item.name)
          .map((item) => ({
            label: String(t(item.translationKey || `District.${item.name}`)),
            value: String(item.name),
          }))
          .sort((a, b) => a.label.localeCompare(b.label));
      }
      return [];
    } catch (err) {
      console.error("Error initializing district items:", err);
      return [];
    }
  }, [t]);

  const images = React.useMemo(() => {
    try {
      if (ImageData && Array.isArray(ImageData)) {
        return ImageData.filter(
          (img) => img && typeof img === "object" && img.id,
        );
      }
      return [];
    } catch (err) {
      console.error("Error loading image data:", err);
      return [];
    }
  }, []);

  const fetchFarms = useCallback(async () => {
    if (!farmId) {
      setError("Farm ID is required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const res = await axios.get<FarmDetailsResponse>(
        `${environment.API_BASE_URL}api/farm/get-farms/byFarm-Id/${farmId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        },
      );

      if (res.data && typeof res.data === "object" && res.data.farm) {
        setFarmData(res.data.farm);
        populateFormFields(res.data.farm);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      console.error("Error fetching farms:", err);
      let errorMessage = t("Farms.FailedToFetchFarmData");

      if (err?.response?.status === 404) {
        errorMessage = t("Farms.FarmNotFoundPleaseCheckTheFarmID");
      } else if (err?.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (err?.code === "ECONNABORTED") {
        errorMessage = "Request timeout. Please try again.";
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      Alert.alert(t("Main.Error"), errorMessage, [
        { text: t("Main.OK") },
      ]);
    } finally {
      setLoading(false);
    }
  }, [farmId]);

  const populateFormFields = useCallback(
    (farm: FarmItem) => {
      try {
        if (!farm || typeof farm !== "object") {
          throw new Error("Invalid farm data");
        }

        setFarmName(farm.farmName ? String(farm.farmName) : "");
        setExtentha(farm.extentha ? String(farm.extentha) : "");
        setExtentac(farm.extentac ? String(farm.extentac) : "");
        setExtentp(farm.extentp ? String(farm.extentp) : "");
        setDistrict(farm.district ? String(farm.district) : "");
        setPlotNo(farm.plotNo ? String(farm.plotNo) : "");
        setStreetName(farm.street ? String(farm.street) : "");
        setCity(farm.city ? String(farm.city) : "");
        setNumberOfStaff(farm.staffCount ? String(farm.staffCount) : "0");

        if (farm.imageId && images.length > 0) {
          const imageId = Number(farm.imageId);
          setSelectedImageId(imageId);
          const imageIndex = images.findIndex(
            (img) => img && img.id === imageId,
          );
          setSelectedImage(imageIndex >= 0 ? imageIndex : 0);
        }
      } catch (err) {
        console.error("Error populating form fields:", err);
      }
    },
    [images],
  );

  useEffect(() => {
    fetchFarms();
  }, [fetchFarms]);

  const validateNumericInput = useCallback((text: string): string => {
    return text.replace(/[^0-9]/g, "");
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchFarms();
    }, [fetchFarms]),
  );

  const validateForm = useCallback((): boolean => {
    if (!farmName?.trim()) {
      Alert.alert(t("Main.Sorry"), t("Farms.PleaseEnterAFarmName"), [
        { text: t("Main.OK") },
      ]);
      return false;
    }

    if (!district) {
      Alert.alert(t("Main.Sorry"), t("Farms.PleaseSelectADistrict"), [
        { text: t("Main.OK") },
      ]);
      return false;
    }

    const hasExtentValue =
      (extentha && extentha !== "0") ||
      (extentac && extentac !== "0") ||
      (extentp && extentp !== "0");

    if (!hasExtentValue) {
      Alert.alert(
        t("Main.Sorry"),
        t("Farms.Please enter at least one extent value"),
        [{ text: t("Main.OK") }],
      );
      return false;
    }

    if (!numberOfStaff || numberOfStaff.trim() === "") {
      Alert.alert(
        t("Main.Sorry"),
        t("Farms.PleaseEnterTheNumberOfStaff"),
        [{ text: t("Main.OK") }],
      );
      return false;
    }

    const staffCount = parseInt(numberOfStaff);
    if (isNaN(staffCount) || staffCount < 0) {
      Alert.alert(
        t("Main.Sorry"),
        t("Farms.Please enter a valid number of staff"),
        [{ text: t("Main.OK") }],
      );
      return false;
    }

    const appUserCount = farmData?.appUserCount || 0;
    if (staffCount < appUserCount) {
      Alert.alert(
        t("Main.Sorry"),
        t("Farms.StaffCountCannotBeLessThanAppUserCountAppUsers", {
          appUserCount,
        }),
        [{ text: t("Main.OK") }],
      );
      return false;
    }

    return true;
  }, [
    farmName,
    district,
    extentha,
    extentac,
    extentp,
    numberOfStaff,
    farmData?.appUserCount,
    t,
  ]);

  const getImageSource = useCallback((imagePath?: string) => {
    if (!imagePath || typeof imagePath !== "string") {
      return require("@/assets/images/farms/1.webp");
    }

    try {
      const imageMap: { [key: string]: any } = {
        "@/assets/images/farms/1.webp": require("@/assets/images/farms/1.webp"),
        "@/assets/images/farms/2.webp": require("@/assets/images/farms/2.webp"),
        "@/assets/images/farms/3.webp": require("@/assets/images/farms/3.webp"),
        "@/assets/images/farms/4.webp": require("@/assets/images/farms/4.webp"),
        "@/assets/images/farms/5.webp": require("@/assets/images/farms/5.webp"),
        "@/assets/images/farms/6.webp": require("@/assets/images/farms/6.webp"),
        "@/assets/images/farms/7.webp": require("@/assets/images/farms/7.webp"),
        "@/assets/images/farms/8.webp": require("@/assets/images/farms/8.webp"),
        "@/assets/images/farms/9.webp": require("@/assets/images/farms/9.webp"),
      };
      return imageMap[imagePath] || require("@/assets/images/farms/1.webp");
    } catch (err) {
      console.error("Error loading image:", err);
      return require("@/assets/images/farms/1.webp");
    }
  }, []);

  const handleImageSelect = useCallback((index: number, imageId: number) => {
    if (typeof index === "number" && typeof imageId === "number") {
      setTempSelectedImage(index);
      setTempSelectedImageId(imageId);
    }
  }, []);

  const openImageModal = useCallback(() => {
    setTempSelectedImage(selectedImage);
    setTempSelectedImageId(selectedImageId);
    setModalVisible(true);
  }, [selectedImage, selectedImageId]);

  const handleImageUpdate = useCallback(() => {
    setSelectedImage(tempSelectedImage);
    setSelectedImageId(tempSelectedImageId);
    setModalVisible(false);
  }, [tempSelectedImage, tempSelectedImageId]);

  const handleModalCancel = useCallback(() => {
    setTempSelectedImage(selectedImage);
    setTempSelectedImageId(selectedImageId);
    setModalVisible(false);
  }, [selectedImage, selectedImageId]);

  const handleModalClose = useCallback(() => {
    setModalVisible(false);
  }, []);

  const selectedDistrictLabel = React.useMemo(() => {
    const found = districtItems.find((item) => item.value === district);
    return found ? found.label : "";
  }, [district, districtItems]);

  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        if (fromScreen === "FarmDetailsScreen") {
          navigation.navigate("Main", {
            screen: "FarmDetailsScreen",
            params: { farmId },
          });
        } else {
          navigation.navigate("Main", {
            screen: "AddFarmList",
            params: { farmId: farmId },
          });
        }
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackPress,
      );

      return () => subscription.remove();
    }, [navigation, farmId, fromScreen]),
  );

  const handleUpdateFarm = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const updateData = {
        farmId: farmId,
        farmName: farmName.trim(),
        farmIndex: farmData?.farmIndex || 1,
        farmImage: selectedImageId,
        extentha: String(extentha || "0"),
        extentac: String(extentac || "0"),
        extentp: String(extentp || "0"),
        district,
        plotNo: plotNo.trim(),
        street: streetName.trim(),
        city: city.trim(),
        staffCount: String(numberOfStaff || "0"),
      };

      await axios.put(
        `${environment.API_BASE_URL}api/farm/update-farm`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

     Alert.alert(t("Main.Success"), t("Farms.FarmUpdatedSuccessfully"), [
  {
    text: t("Main.OK"),
    onPress: () => {
      if (fromScreen === "FarmDetailsScreen") {
        navigation.navigate("Main", {
          screen: "FarmDetailsScreen",
          params: { farmId },
        });
      } else {
        navigation.navigate("Main", {
          screen: "AddFarmList",
          params: { farmId: farmId },
        });
      }
    },
  },
]);
    } catch (err: any) {
      console.error("Error updating farm:", err);

      let errorMessage = t("Farms.Failed to update farm");
      if (err.response) {
        if (err.response.data?.message) {
          let message = err.response.data.message;
          message = message.replace(/\"plotNo\"/g, `"${t("Farms.PlotNo")}"`);
          message = message.replace(
            /\"farmName\"/g,
            `"${t("Farms.FarmName")}"`,
          );
          message = message.replace(
            /\"district\"/g,
            `"${t("Farms.District")}"`,
          );
          message = message.replace(
            /\"street\"/g,
            `"${t("Farms.StreetName")}"`,
          );
          message = message.replace(/\"city\"/g, `"${t("Farms.City")}"`);
          message = message.replace(/\"extentha\"/g, `"${t("Farms.ha")}"`);
          message = message.replace(/\"extentac\"/g, `"${t("Farms.ac")}"`);
          message = message.replace(/\"extentp\"/g, `"${t("Farms.p")}"`);
          message = message.replace(
            /\"staffCount\"/g,
            `"${t("Farms.NumberOfStaff")}"`,
          );
          message = message.replace(
            /"farmImage"/g,
            `"${t("Farms.Farm Image")}"`,
          );
          errorMessage = message;
        } else if (err.response.status === 400) {
          errorMessage = t(
            "Farms.Invalid data format. Please check all fields.",
          );
        }
      }

      Alert.alert(t("Main.Error"), errorMessage, [
        { text: t("Main.OK") },
      ]);
    } finally {
      setLoading(false);
    }
  }, [
    farmId,
    farmName,
    extentha,
    extentac,
    extentp,
    district,
    plotNo,
    streetName,
    city,
    numberOfStaff,
    selectedImageId,
    farmData?.farmIndex,
    validateForm,
    t,
    navigation,
  ]);

  if (loading) {
    return (
      <LoadingPage fullScreen />
    );
  }

  if (error && !farmData) {
    return (
      <View className="flex-1 bg-white justify-center items-center px-6">
        <Text className="text-lg text-red-500 text-center mb-4">{error}</Text>
        <TouchableOpacity
          className="bg-black py-3 px-6 rounded-full"
          onPress={() => {
            setError(null);
            fetchFarms();
          }}
        >
          <Text className="text-white font-semibold">{t("Farms.Retry")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        

        <CustomHeader
          title={t("Farms.EditFarm")}
          navigation={navigation}
          onBackPress={() => {
            if (fromScreen === "FarmDetailsScreen") {
              navigation.navigate("Main", {
                screen: "FarmDetailsScreen",
                params: { farmId },
              });
            } else {
              navigation.navigate("Main", {
                screen: "AddFarmList",
              });
            }
          }}
        />
        <View className="px-6">
          {/* Farm Icon with Update Option */}
          <View className="items-center mb-6">
            <TouchableOpacity
              onPress={openImageModal}
              accessibilityLabel="Change farm image"
            >
              <Image
                source={getImageSource(images[selectedImage]?.source)}
                className="w-24 h-24 rounded-full"
                resizeMode="cover"
              />
              <View className="w-7 h-7 bg-black rounded-full absolute bottom-0 right-0 items-center justify-center">
                <Image
                  source={require("../../../assets/images/farms/pen.webp")}
                  className="w-3 h-3"
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View className="gap-4">
            {/* Farm Name */}
            <View>
              <Text className="text-[#070707] font-medium mb-2">
                {t("Farms.FarmName")}
              </Text>
              <TextInput
                value={farmName}
                onChangeText={setFarmName}
                placeholder={t("Farms.EnterFarmNameHere")}
                placeholderTextColor="#9CA3AF"
                className="bg-[#F4F4F4] p-3 rounded-3xl h-[50px] text-gray-800"
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            {/* Extent */}
            <View>
              <Text className="text-[#070707] font-medium mb-2">
                {t("Farms.Extent")}
              </Text>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Text className="font-semibold">{t("Farms.ha")}</Text>
                  <View className="bg-[#F4F4F4] px-3 w-20 rounded-3xl h-[50px] justify-center">
                    <TextInput
                      className="text-black w-full"
                      style={{
                        fontSize: 14,
                        paddingVertical: 0,
                        paddingTop: 0,
                        paddingBottom: 0,
                        textAlign: "left",
                        ...(Platform.OS === "android"
                          ? { textAlignVertical: "center" }
                          : {}),
                      }}
                      value={extentha}
                      onChangeText={(text) =>
                        setExtentha(validateNumericInput(text))
                      }
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#9CA3AF"
                      maxLength={5}
                    />
                  </View>
                </View>

                <View className="flex-row items-center gap-2">
                  <Text className="font-semibold">{t("Farms.ac")}</Text>
                  <View className="bg-[#F4F4F4] px-3 w-20 rounded-3xl h-[50px] justify-center">
                    <TextInput
                      className="text-black w-full"
                      style={{
                        fontSize: 14,
                        paddingVertical: 0,
                        paddingTop: 0,
                        paddingBottom: 0,
                        textAlign: "left",
                        ...(Platform.OS === "android"
                          ? { textAlignVertical: "center" }
                          : {}),
                      }}
                      value={extentac}
                      onChangeText={(text) =>
                        setExtentac(validateNumericInput(text))
                      }
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#9CA3AF"
                      maxLength={5}
                    />
                  </View>
                </View>

                <View className="flex-row items-center gap-2">
                  <Text className="font-semibold">{t("Farms.p")}</Text>
                  <View className="bg-[#F4F4F4] px-3 w-20 rounded-3xl h-[50px] justify-center">
                    <TextInput
                      className="text-black w-full"
                      style={{
                        fontSize: 14,
                        paddingVertical: 0,
                        paddingTop: 0,
                        paddingBottom: 0,
                        textAlign: "left",
                        ...(Platform.OS === "android"
                          ? { textAlignVertical: "center" }
                          : {}),
                      }}
                      value={extentp}
                      onChangeText={(text) =>
                        setExtentp(validateNumericInput(text))
                      }
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#9CA3AF"
                      maxLength={5}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* District */}
            <View>
              <Text className="text-[#070707] font-medium mb-2">
                {t("Farms.District")}
              </Text>
              <TouchableOpacity
                className="bg-[#F4F4F4] p-3 rounded-3xl h-[50px] flex-row justify-between items-center"
                onPress={() => setDistrictModalVisible(true)}
                accessibilityLabel="Select district"
              >
                <Text
                  className={
                    selectedDistrictLabel ? "text-gray-800" : "text-[#9CA3AF]"
                  }
                >
                  {selectedDistrictLabel || t("Farms.SelectDistrict")}
                </Text>
                <MaterialIcons
                  name="arrow-drop-down"
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            {/* Plot No */}
            <View>
              <Text className="text-[#070707] font-medium mb-2">
                {t("Farms.PlotNo")}
              </Text>
              <TextInput
                value={plotNo}
                onChangeText={setPlotNo}
                placeholder={t("Farms.EnterPlotNumberHere")}
                placeholderTextColor="#9CA3AF"
                className="bg-[#F4F4F4] p-3 rounded-3xl h-[50px] text-gray-800"
                autoCapitalize="characters"
              />
            </View>

            {/* Street Name */}
            <View>
              <Text className="text-[#070707] font-medium mb-2">
                {t("Farms.StreetName")}
              </Text>
              <TextInput
                value={streetName}
                onChangeText={setStreetName}
                placeholder={t("Farms.EnterStreetName")}
                placeholderTextColor="#9CA3AF"
                className="bg-[#F4F4F4] p-3 rounded-3xl h-[50px] text-gray-800"
                autoCapitalize="words"
              />
            </View>

            {/* City */}
            <View>
              <Text className="text-[#070707] font-medium mb-2">
                {t("Farms.City")}
              </Text>
              <TextInput
                value={city}
                onChangeText={setCity}
                placeholder={t("Farms.EnterCityName")}
                placeholderTextColor="#9CA3AF"
                className="bg-[#F4F4F4] p-3 rounded-3xl h-[50px] text-gray-800"
                autoCapitalize="words"
              />
            </View>

            {/* Number of Staff */}
            <View>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-[#070707] font-medium">
                  {t("Farms.NumberOfStaff")} 
                </Text>
              </View>
              <TextInput
                value={numberOfStaff}
                onChangeText={(text) =>
                  setNumberOfStaff(validateNumericInput(text))
                }
                placeholder={t("Farms.EnterNumberOfStaff")}
                placeholderTextColor="#9CA3AF"
                className="bg-[#F4F4F4] p-3 rounded-3xl h-[50px] text-gray-800"
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
          </View>

          {/* Update Button */}
          <View className="mt-8 mb-[40%] w-full px-6">
            <TouchableOpacity
              className="bg-black h-[50px] rounded-3xl w-full justify-center items-center shadow-lg elevation-6"
              onPress={handleUpdateFarm}
              disabled={loading}
              accessibilityLabel="Update farm details"
            >
              <Text
                className="text-white text-center font-semibold text-lg"
                style={[
                  i18n.language === "si"
                    ? { fontSize: 15 }
                    : i18n.language === "ta"
                      ? { fontSize: 13 }
                      : { fontSize: 17 },
                ]}
              >
                {loading ? t("Farms.Updating...") : t("Main.Update")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* District Search Modal */}
      <GlobalSearchModal
        visible={districtModalVisible}
        onClose={() => setDistrictModalVisible(false)}
        title={t("Farms.District")}
        data={districtItems}
        selectedItems={district ? [district] : []}
        onSelect={(items) => {
          if (items.length > 0) {
            setDistrict(items[0]);
          }
        }}
        searchPlaceholder={t("Farms.SearchDistrict")}
        multiSelect={false}
        noResultsText="No district found"
      />

      {/* Farm Image Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleModalClose}
      >
        <View className="flex-1 justify-center items-center bg-[#667BA54D]">
          <View className="bg-white p-6 rounded-lg w-4/5 max-h-96">
            <Text className="text-lg font-semibold text-center mb-4">
              {t("Farms.SelectFarmImage")}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row flex-wrap justify-center">
                {images.map((imageItem, index) => (
                  <TouchableOpacity
                    key={imageItem?.id || index}
                    onPress={() => handleImageSelect(index, imageItem?.id || 1)}
                    className="w-1/3 p-2 flex items-center"
                    accessibilityLabel={`Farm image ${index + 1}`}
                  >
                    <View
                      className={`rounded-full border-2 ${tempSelectedImage === index
                        ? "border-[#2AAD7A]"
                        : "border-transparent"
                        }`}
                      style={{
                        width: 70,
                        height: 70,
                        justifyContent: "center",
                        alignItems: "center",
                        overflow: "hidden",
                      }}
                    >
                      <Image
                        source={getImageSource(imageItem?.source)}
                        className="w-full h-full rounded-full"
                        resizeMode="cover"
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                className="flex-1 bg-gray-300 py-3 rounded-full"
                onPress={handleModalCancel}
              >
                <Text className="text-center text-gray-800 font-semibold">
                  {t("Main.Cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-black py-3 rounded-full"
                onPress={handleImageUpdate}
              >
                <Text className="text-center text-white font-semibold">
                  {t("Main.Update")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default EditFarm;
