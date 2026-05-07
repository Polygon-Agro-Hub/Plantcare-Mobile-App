import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Modal,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { StatusBar, Platform } from "react-native";
import {
  useNavigation,
  useRoute,
  RouteProp,
  useFocusEffect,
} from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import ImageData from "@/assets/jsons/farm/farm-image.json";
import districtData from "@/assets/jsons/common/district.json";
import { RootStackParamList } from "../../types/types";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import {
  setFarmBasicDetails,
  selectFarmBasicDetails,
  clearFarmBasicDetails,
  clearFarmSecondDetails,
} from "../../../store/farmSlice";
import type { RootState, AppDispatch } from "../../../services/reducxStore";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n/i18n";
import { useCallback } from "react";
import GlobalSearchModal from "../../common/GlobalSearchModal";
import AntDesign from "@expo/vector-icons/AntDesign";

interface RouteParams {
  membership?: string;
  currentFarmCount?: number;
  fromSecondScreen?: boolean;
}

type AddNewFarmBasicDetailsRouteProp = RouteProp<
  RootStackParamList,
  "AddNewFarmBasicDetails"
>;

const AddNewFarmBasicDetails: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<AddNewFarmBasicDetailsRouteProp>();
  const dispatch = useDispatch<AppDispatch>();
  const params = route.params as RouteParams | undefined;
  const { membership = "basic", fromSecondScreen = false } = params || {};
  const existingFarmDetails = useSelector((state: RootState) =>
    selectFarmBasicDetails(state),
  );

  const [farmName, setFarmName] = useState("");
  const [extentha, setExtentha] = useState("");
  const [extentac, setExtentac] = useState("");
  const [extentp, setExtentp] = useState("");
  const [district, setDistrict] = useState("");
  const [plotNo, setPlotNo] = useState("");
  const [streetName, setStreetName] = useState("");
  const [city, setCity] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedImageId, setSelectedImageId] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [districtModalVisible, setDistrictModalVisible] = useState(false);
  const { t } = useTranslation();

  const districtItems = districtData.map((item) => ({
    label: t(`District.${item.name}`),
    value: item.name,
  }));

  useFocusEffect(
    useCallback(() => {
      const navigationState = navigation.getState();
      const routes = navigationState.routes;
      const currentIndex = navigationState.index;
      const previousRoute = currentIndex > 0 ? routes[currentIndex - 1] : null;
      const isComingFromSecondScreen =
        fromSecondScreen || previousRoute?.name === "AddNewFarmSecondDetails";

      if (isComingFromSecondScreen && existingFarmDetails) {
        setFarmName(existingFarmDetails.farmName || "");
        setExtentha(existingFarmDetails.extent?.ha || "");
        setExtentac(existingFarmDetails.extent?.ac || "");
        setExtentp(existingFarmDetails.extent?.p || "");
        setDistrict(existingFarmDetails.district || "");
        setPlotNo(existingFarmDetails.plotNo || "");
        setStreetName(existingFarmDetails.streetName || "");
        setCity(existingFarmDetails.city || "");
        setSelectedImage(existingFarmDetails.selectedImage ?? 0);
        setSelectedImageId(existingFarmDetails.selectedImageId ?? 1);
      } else {
        setFarmName("");
        setExtentha("");
        setExtentac("");
        setExtentp("");
        setDistrict("");
        setPlotNo("");
        setStreetName("");
        setCity("");
        setSelectedImage(0);
        setSelectedImageId(1);
        dispatch(clearFarmBasicDetails());
        dispatch(clearFarmSecondDetails());
      }
    }, [fromSecondScreen, existingFarmDetails, dispatch, navigation]),
  );

  const validateNumericInput = (text: string) => {
    return text.replace(/[^0-9]/g, "");
  };

  const images = ImageData;

  const imageMap: { [key: number]: any } = {
    1: require("../../../assets/images/farms/1.webp"),
    2: require("../../../assets/images/farms/2.webp"),
    3: require("../../../assets/images/farms/3.webp"),
    4: require("../../../assets/images/farms/4.webp"),
    5: require("../../../assets/images/farms/5.webp"),
    6: require("../../../assets/images/farms/6.webp"),
    7: require("../../../assets/images/farms/7.webp"),
    8: require("../../../assets/images/farms/8.webp"),
    9: require("../../../assets/images/farms/9.webp"),
  };

  const getImageSource = (id: number) => {
    return imageMap[id] || imageMap[1];
  };

  const getMembershipDisplay = () => {
    const membershipType = membership.toLowerCase();
    switch (membershipType) {
      case "pro":
        return {
          text: "PRO",
          bgColor: "bg-[#FFF5BD]",
          textColor: "text-[#E2BE00]",
        };
      case "basic":
      default:
        return {
          text: "BASIC",
          bgColor: "bg-[#CDEEFF]",
          textColor: "text-[#223FFF]",
        };
    }
  };

  const membershipDisplay = getMembershipDisplay();

  const handleContinue = () => {
    if (!farmName.trim()) {
      Alert.alert(t("Main.Error"), t("Farms.enterFarmName"), [
        { text: t("Main.OK") },
      ]);
      return;
    }
    if (!extentha.trim() && !extentac.trim() && !extentp.trim()) {
      Alert.alert(t("Main.Error"), t("Farms.enterFarmExtent"), [
        { text: t("Main.OK") },
      ]);
      return;
    }
    if (!district.trim()) {
      Alert.alert(t("Main.Error"), t("Farms.selectDistrict"), [
        { text: t("Main.OK") },
      ]);
      return;
    }
    if (!plotNo.trim()) {
      Alert.alert(t("Main.Error"), t("Farms.enterPlotNumber"), [
        { text: t("Main.OK") },
      ]);
      return;
    }
    if (!streetName.trim()) {
      Alert.alert(t("Main.Error"), t("Farms.enterStreetName"), [
        { text: t("Main.OK") },
      ]);
      return;
    }
    if (!city.trim()) {
      Alert.alert(t("Main.Error"), t("Farms.enterCityName"), [
        { text: t("Main.OK") },
      ]);
      return;
    }

    const farmBasicDetails = {
      farmName,
      extent: { ha: extentha, ac: extentac, p: extentp },
      district,
      plotNo,
      streetName,
      city,
      selectedImage,
      selectedImageId,
    };

    dispatch(setFarmBasicDetails(farmBasicDetails));
    navigation.navigate("AddNewFarmSecondDetails" as any, {
      membership: membership,
      fromFirstScreen: true,
    });
  };

  const getTextStyle = (language: string) => {
    if (language === "si") {
      return { fontSize: 12, lineHeight: 20 };
    }
    return { fontSize: 16, lineHeight: 25 };
  };

  const selectedDistrictLabel =
    districtItems.find((item) => item.value === district)?.label || "";

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "white" }}
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
    >
      <View className="flex-1 bg-white">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          className="px-4"
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
        >
          <StatusBar
            barStyle="dark-content"
            backgroundColor="transparent"
            translucent={false}
          />

          <View style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}>
            <View className="flex-row items-center justify-center mb-6 relative">
              <Text
                className="font-bold text-lg text-center"
                style={[
                  i18n.language === "si" ? { fontSize: 14 } : { fontSize: 20 },
                ]}
              >
                {t("Farms.Add New Farm")}
              </Text>
              <View
                className={`absolute right-[-5%] ${membershipDisplay.bgColor} px-2 py-1 rounded-lg`}
              >
                <Text
                  className={`${membershipDisplay.textColor} text-xs font-medium`}
                >
                  {t(`Farms.${membershipDisplay.text}`)}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-center mb-8">
              <View className="w-[29px] h-[29px] border border-[#2AAD7A] bg-white rounded-full flex items-center justify-center">
                <Image
                  className="w-[10px] h-[13px] bg-white rounded-full"
                  source={require("../../../assets/images/farms/location.webp")}
                />
              </View>
              <View className="w-24 h-0.5 bg-[#C6C6C6] mx-2" />
              <View className="w-[29px] h-[29px] border border-[#C6C6C6] rounded-full flex items-center justify-center">
                <Image
                  className="w-[11px] h-[12px] bg-white"
                  source={require("../../../assets/images/farms/user.webp")}
                />
              </View>
              <View className="w-24 h-0.5 bg-[#C6C6C6] mx-2" />
              <View className="w-[29px] h-[29px] border border-[#C6C6C6] rounded-full flex items-center justify-center">
                <Image
                  className="w-[13.125px] h-[15px] bg-white rounded-full"
                  source={require("../../../assets/images/farms/checks.webp")}
                />
              </View>
            </View>

            <View className="items-center mb-8">
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Image
                  source={getImageSource(selectedImageId)}
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
          </View>

          <View className="space-y-6">
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
              />
            </View>

            <View>
              <Text className="text-[#070707] font-medium mb-2">
                {t("Farms.Extent")}
              </Text>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center space-x-2">
                  <Text className="font-semibold">{t("Farms.ha")}</Text>
                  <TextInput
                    className="bg-[#F4F4F4] p-2 px-4 w-20 rounded-3xl h-[50px] text-center"
                    value={extentha}
                    onChangeText={(text) =>
                      setExtentha(validateNumericInput(text))
                    }
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View className="flex-row items-center space-x-2">
                  <Text className="font-semibold">{t("Farms.ac")}</Text>
                  <TextInput
                    className="bg-[#F4F4F4] p-2 px-4 w-20 rounded-3xl h-[50px] text-center"
                    value={extentac}
                    onChangeText={(text) =>
                      setExtentac(validateNumericInput(text))
                    }
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View className="flex-row items-center space-x-2">
                  <Text className="font-semibold">{t("Farms.p")}</Text>
                  <TextInput
                    className="bg-[#F4F4F4] p-2 w-20 px-4 rounded-3xl h-[50px] text-center"
                    value={extentp}
                    onChangeText={(text) =>
                      setExtentp(validateNumericInput(text))
                    }
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            </View>

            <View>
              <Text className="text-[#070707] font-medium mb-2">
                {t("Farms.District")}
              </Text>
              <TouchableOpacity
                className="bg-[#F4F4F4] p-3 rounded-3xl h-[50px] flex-row items-center justify-between"
                onPress={() => setDistrictModalVisible(true)}
              >
                <Text
                  className={
                    selectedDistrictLabel ? "text-gray-800" : "text-[#9CA3AF]"
                  }
                >
                  {selectedDistrictLabel || t("Farms.Select District")}
                </Text>
                <AntDesign name="caret-down" size={14} color="#555" />
              </TouchableOpacity>

              <GlobalSearchModal
                visible={districtModalVisible}
                onClose={() => setDistrictModalVisible(false)}
                title={t("Farms.District")}
                data={districtItems}
                selectedItems={district ? [district] : []}
                onSelect={(values) => setDistrict(values[0] ?? "")}
                searchPlaceholder={t("Farms.Search district..")}
                multiSelect={false}
              />
            </View>

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
              />
            </View>

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
              />
            </View>

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
              />
            </View>
          </View>

          <View className="mt-8 mb-[30%] items-center justify-center">
            <TouchableOpacity
              className="bg-black  rounded-3xl h-[50px] w-2/3 justify-center"
              onPress={handleContinue}
              style={{
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <Text className="text-white text-center font-semibold text-lg">
                {t("Main.Continue")}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Image picker modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-[#667BA54D]">
            <View className="bg-white p-6 rounded-lg w-4/5 max-h-96">
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="flex-row flex-wrap justify-center">
                  {images.map((imageItem, index) => (
                    <TouchableOpacity
                      key={imageItem.id}
                      onPress={() => {
                        setSelectedImage(index);
                        setSelectedImageId(imageItem.id);
                      }}
                      className="w-1/3 p-2 flex items-center"
                    >
                      <View
                        className={`rounded-full border-2 ${selectedImage === index ? "border-[#2AAD7A]" : "border-transparent"}`}
                        style={{
                          width: 70,
                          height: 70,
                          justifyContent: "center",
                          alignItems: "center",
                          overflow: "hidden",
                        }}
                      >
                        <Image
                          source={getImageSource(imageItem.id)}
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
                  className="flex-1 bg-gray-300 justify-center rounded-3xl h-[50px]"
                  onPress={() => setModalVisible(false)}
                >
                  <Text
                    className="text-center text-gray-800 font-semibold"
                    style={[{ fontSize: 16 }, getTextStyle(i18n.language)]}
                  >
                    {t("Main.Cancel")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-black h-[50px] rounded-3xl justify-center"
                  onPress={() => setModalVisible(false)}
                >
                  <Text
                    className="text-center text-white font-semibold"
                    style={[{ fontSize: 14 }, getTextStyle(i18n.language)]}
                  >
                    {t("Main.Update")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
};

export default AddNewFarmBasicDetails;
