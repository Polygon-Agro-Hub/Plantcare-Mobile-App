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
  StatusBar,
} from "react-native";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import LottieView from "lottie-react-native";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n/i18n";
import ImageData from "@/assets/jsons/farmImage.json";
import districtData from "@/assets/jsons/district.json";
import { environment } from "@/environment/environment";
import { RootStackParamList } from "../../types/types";
import CustomHeader from "../../common/CustomHeader";
import GlobalSearchModal from "../../common/GlobalSearchModal";
import { AntDesign } from "@expo/vector-icons";

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

const getImageSource = (imagePath?: string) => {
  if (!imagePath) return require("@/assets/images/farms/1.webp");
  return imageMap[imagePath] ?? require("@/assets/images/farms/1.webp");
};

const EditFarm: React.FC<EditFarmProps> = ({ route, navigation }) => {
  const farmId = route?.params?.farmId ?? null;
  const { t } = useTranslation();

  const [farmName, setFarmName] = useState("");
  const [extentha, setExtentha] = useState("");
  const [extentac, setExtentac] = useState("");
  const [extentp, setExtentp] = useState("");
  const [district, setDistrict] = useState("");
  const [plotNo, setPlotNo] = useState("");
  const [streetName, setStreetName] = useState("");
  const [city, setCity] = useState("");
  const [numberOfStaff, setNumberOfStaff] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedImageId, setSelectedImageId] = useState(1);
  const [tempSelectedImage, setTempSelectedImage] = useState(0);
  const [tempSelectedImageId, setTempSelectedImageId] = useState(1);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [districtModalVisible, setDistrictModalVisible] = useState(false);
  const [farmData, setFarmData] = useState<FarmItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const images = React.useMemo(
    () => (Array.isArray(ImageData) ? ImageData.filter((img) => img?.id) : []),
    [],
  );

  const districtItems = districtData
    .filter((item) => item?.name)
    .map((item) => ({
      label: t(`District.${item.name}`),
      value: item.name,
    }));

  const populateFormFields = useCallback(
    (farm: FarmItem) => {
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
        const imageIndex = images.findIndex((img) => img?.id === imageId);
        setSelectedImage(imageIndex >= 0 ? imageIndex : 0);
      }
    },
    [images],
  );

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
      if (!token) throw new Error("No authentication token found");

      const res = await axios.get<FarmDetailsResponse>(
        `${environment.API_BASE_URL}api/farm/get-farms/byFarm-Id/${farmId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        },
      );

      if (res.data?.farm) {
        setFarmData(res.data.farm);
        populateFormFields(res.data.farm);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      let errorMessage = t("Farms.Failed to fetch farm data");

      if (err?.response?.status === 404) {
        errorMessage = t("Farms.Farm not found. Please check the farm ID.");
      } else if (err?.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (err?.code === "ECONNABORTED") {
        errorMessage = "Request timeout. Please try again.";
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      Alert.alert(t("Farms.Error"), errorMessage, [
        { text: t("Farms.okButton") },
      ]);
    } finally {
      setLoading(false);
    }
  }, [farmId, populateFormFields]);

  useEffect(() => {
    fetchFarms();
  }, [fetchFarms]);

  useFocusEffect(
    useCallback(() => {
      fetchFarms();
    }, [fetchFarms]),
  );

  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        navigation.navigate("Main", {
          screen: "FarmDetailsScreen",
          params: { farmId },
        });
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackPress,
      );
      return () => subscription.remove();
    }, [navigation, farmId]),
  );

  const validateNumericInput = (text: string) => text.replace(/[^0-9]/g, "");

  const validateForm = useCallback((): boolean => {
    if (!farmName?.trim()) {
      Alert.alert(t("Farms.Sorry"), t("Farms.Please enter a farm name"), [
        { text: t("Farms.okButton") },
      ]);
      return false;
    }
    if (!district) {
      Alert.alert(t("Farms.Sorry"), t("Farms.Please select a district"), [
        { text: t("Farms.okButton") },
      ]);
      return false;
    }

    const hasExtent =
      (extentha && extentha !== "0") ||
      (extentac && extentac !== "0") ||
      (extentp && extentp !== "0");
    if (!hasExtent) {
      Alert.alert(
        t("Farms.Sorry"),
        t("Farms.Please enter at least one extent value"),
        [{ text: t("Farms.okButton") }],
      );
      return false;
    }
    if (!numberOfStaff?.trim()) {
      Alert.alert(
        t("Farms.Sorry"),
        t("Farms.Please enter the number of staff"),
        [{ text: t("Farms.okButton") }],
      );
      return false;
    }

    const staffCount = parseInt(numberOfStaff);
    if (isNaN(staffCount) || staffCount < 0) {
      Alert.alert(
        t("Farms.Sorry"),
        t("Farms.Please enter a valid number of staff"),
        [{ text: t("Farms.okButton") }],
      );
      return false;
    }

    const appUserCount = farmData?.appUserCount ?? 0;
    if (staffCount < appUserCount) {
      Alert.alert(
        t("Farms.Sorry"),
        t("Farms.Staff count cannot be less than app user count", {
          appUserCount,
        }),
        [{ text: t("Farms.okButton") }],
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

  const handleUpdateFarm = useCallback(async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) throw new Error("No authentication token found");

      const updateData = {
        farmId,
        farmName: farmName.trim(),
        farmIndex: farmData?.farmIndex ?? 1,
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

      Alert.alert(t("Farms.Success"), t("Farms.Farm updated successfully"), [
        {
          text: t("Farms.okButton"),
          onPress: () =>
            navigation.navigate("Main", {
              screen: "FarmDetailsScreen",
              params: { farmId },
            }),
        },
      ]);
    } catch (err: any) {
      let errorMessage = t("Farms.Failed to update farm");

      if (err.response?.data?.message) {
        const fieldMap: [RegExp, string][] = [
          [/"plotNo"/g, `"${t("Farms.Plot No")}"`],
          [/"farmName"/g, `"${t("Farms.Farm Name")}"`],
          [/"district"/g, `"${t("Farms.District")}"`],
          [/"street"/g, `"${t("Farms.Street Name")}"`],
          [/"city"/g, `"${t("Farms.City")}"`],
          [/"extentha"/g, `"${t("Farms.ha")}"`],
          [/"extentac"/g, `"${t("Farms.ac")}"`],
          [/"extentp"/g, `"${t("Farms.p")}"`],
          [/"staffCount"/g, `"${t("Farms.Number of Staff")}"`],
          [/"farmImage"/g, `"${t("Farms.Farm Image")}"`],
        ];
        errorMessage = fieldMap.reduce(
          (msg, [pattern, replacement]) => msg.replace(pattern, replacement),
          err.response.data.message,
        );
      } else if (err.response?.status === 400) {
        errorMessage = t("Farms.Invalid data format. Please check all fields.");
      }

      Alert.alert(t("Farms.Error"), errorMessage, [
        { text: t("Farms.okButton") },
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

  const openImageModal = () => {
    setTempSelectedImage(selectedImage);
    setTempSelectedImageId(selectedImageId);
    setImageModalVisible(true);
  };

  const handleImageSelect = (index: number, imageId: number) => {
    setTempSelectedImage(index);
    setTempSelectedImageId(imageId);
  };

  const handleImageUpdate = () => {
    setSelectedImage(tempSelectedImage);
    setSelectedImageId(tempSelectedImageId);
    setImageModalVisible(false);
  };

  const handleImageModalCancel = () => {
    setTempSelectedImage(selectedImage);
    setTempSelectedImageId(selectedImageId);
    setImageModalVisible(false);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <LottieView
          source={require("../../../assets/jsons/loader.json")}
          autoPlay
          loop
          style={{ width: 300, height: 300 }}
        />
      </View>
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
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={false}
      />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <CustomHeader
          title={t("Farms.Edit Farm")}
          navigation={navigation}
          onBackPress={() =>
            navigation.navigate("Main", {
              screen: "FarmDetailsScreen",
              params: { farmId },
            })
          }
        />
        <View className="px-4">

        {/* Farm Image Selector */}
        <View
          className="items-center mb-8 mt-3"
          style={{ paddingVertical: hp(2) }}
        >
          <TouchableOpacity
            onPress={openImageModal}
            accessibilityLabel="Change farm image"
          >
            <Image
              source={getImageSource(images[selectedImage]?.source)}
              className="w-20 h-20 rounded-full"
              resizeMode="cover"
            />
            <View className="w-6 h-6 bg-black rounded-full absolute bottom-0 right-0 items-center justify-center">
              <Image
                source={require("../../../assets/images/farms/pen.webp")}
                className="w-3 h-3"
              />
            </View>
          </TouchableOpacity>
        </View>

        <View className="space-y-6">
          {/* Farm Name */}
          <View>
            <Text className="text-[#070707] font-medium mb-2">
              {t("Farms.Farm Name")}
            </Text>
            <TextInput
              value={farmName}
              onChangeText={setFarmName}
              placeholder={t("Farms.Enter Farm Name Here")}
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
              {[
                { label: t("Farms.ha"), value: extentha, setter: setExtentha },
                { label: t("Farms.ac"), value: extentac, setter: setExtentac },
                { label: t("Farms.p"), value: extentp, setter: setExtentp },
              ].map(({ label, value, setter }) => (
                <View key={label} className="flex-row items-center space-x-2">
                  <Text className="font-semibold">{label}</Text>
                  <TextInput
                    className="bg-[#F4F4F4] p-2 px-4 w-20 rounded-3xl text-center h-[50px]"
                    value={value}
                    onChangeText={(text) => setter(validateNumericInput(text))}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    maxLength={5}
                  />
                </View>
              ))}
            </View>
          </View>

          {/* District */}
          <View>
            <Text className="text-[#070707] font-medium mb-2">
              {t("Farms.District")}
            </Text>
            <TouchableOpacity
              onPress={() => setDistrictModalVisible(true)}
              className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] flex-row items-center justify-between"
              style={{ height: hp(7) }}
              activeOpacity={0.7}
            >
              <Text
                className={
                  district
                    ? "text-gray-700 text-base"
                    : "text-gray-400 text-base"
                }
              >
                {district
                  ? districtItems.find((d) => d.value === district)?.label
                  : t("Farms.Select District")}
              </Text>
              <AntDesign name="caret-down" size={14} color="#5e5d5d" />
            </TouchableOpacity>

            <GlobalSearchModal
              visible={districtModalVisible}
              onClose={() => setDistrictModalVisible(false)}
              title={t("Farms.District")}
              data={districtItems}
              selectedItems={district ? [district] : []}
              onSelect={(items) => setDistrict(items[0] ?? "")}
              searchPlaceholder={t("Farms.Search district..")}
              searchKeys={["label"]}
              showSearch={true}
              multiSelect={false}
            />
          </View>

          {/* Plot No */}
          <View>
            <Text className="text-[#070707] font-medium mb-2">
              {t("Farms.Plot No")}
            </Text>
            <TextInput
              value={plotNo}
              onChangeText={setPlotNo}
              placeholder={t("Farms.Enter Plot Number Here")}
              placeholderTextColor="#9CA3AF"
              className="bg-[#F4F4F4] p-3 rounded-3xl h-[50px] text-gray-800"
              autoCapitalize="characters"
            />
          </View>

          {/* Street Name */}
          <View>
            <Text className="text-[#070707] font-medium mb-2">
              {t("Farms.Street Name")}
            </Text>
            <TextInput
              value={streetName}
              onChangeText={setStreetName}
              placeholder={t("Farms.Enter Street Name")}
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
              placeholder={t("Farms.Enter City Name")}
              placeholderTextColor="#9CA3AF"
              className="bg-[#F4F4F4] p-3 rounded-3xl h-[50px] text-gray-800"
              autoCapitalize="words"
            />
          </View>

          {/* Number of Staff */}
          <View>
            <Text className="text-[#070707] font-medium mb-2">
              {t("Farms.Number of Staff")} *
            </Text>
            <TextInput
              value={numberOfStaff}
              onChangeText={(text) =>
                setNumberOfStaff(validateNumericInput(text))
              }
              placeholder={t("Farms.Enter Number of Staff")}
              placeholderTextColor="#9CA3AF"
              className="bg-[#F4F4F4] p-3 rounded-3xl h-[50px] text-gray-800"
              keyboardType="numeric"
              maxLength={4}
            />
          </View>
        </View>

        {/* Update Button */}
        <View className="mt-8 mb-[40%]">
          <TouchableOpacity
            className="bg-black py-3 mx-6 rounded-3xl h-[50px]"
            onPress={handleUpdateFarm}
            disabled={loading}
            accessibilityLabel="Update farm details"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.25,
              shadowRadius: 6,
              elevation: 8,
            }}
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
              {loading ? t("Farms.Updating...") : t("Farms.Update")}
            </Text>
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>

      {/* Farm Image Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={imageModalVisible}
        onRequestClose={handleImageModalCancel}
      >
        <View className="flex-1 justify-center items-center bg-[#667BA54D]">
          <View className="bg-white p-6 rounded-lg w-4/5 max-h-96">
            <Text className="text-lg font-semibold text-center mb-4">
              {t("Farms.Select Farm Image")}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row flex-wrap justify-center">
                {images.map((imageItem, index) => (
                  <TouchableOpacity
                    key={imageItem?.id ?? index}
                    onPress={() => handleImageSelect(index, imageItem?.id ?? 1)}
                    className="w-1/3 p-2 flex items-center"
                    accessibilityLabel={`Farm image ${index + 1}`}
                  >
                    <View
                      className={`rounded-full border-2 ${
                        tempSelectedImage === index
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
            <View className="flex-row space-x-3 mt-4">
              <TouchableOpacity
                className="flex-1 bg-gray-300 py-3 rounded-full"
                onPress={handleImageModalCancel}
              >
                <Text className="text-center text-gray-800 font-semibold">
                  {t("Farms.Cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-black py-3 rounded-full"
                onPress={handleImageUpdate}
              >
                <Text className="text-center text-white font-semibold">
                  {t("Farms.Update")}
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
