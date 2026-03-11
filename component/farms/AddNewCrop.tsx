import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
  BackHandler,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import axios from "axios";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import Modal from "react-native-modal";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/types";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import AntDesign from "react-native-vector-icons/AntDesign";
import FarmCropItem from "@/Items/FarmCropItem";
import CropVariety from "@/Items/FarmCropVariety";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import ContentLoader, { Rect } from "react-content-loader/native";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomHeader from "../common/CustomHeader";
import districtData from "../../assets/jsons/district.json";

type AddNewCropNavigationProps = StackNavigationProp<
  RootStackParamList,
  "AddNewCrop"
>;

interface AddNewCropProps {
  navigation: AddNewCropNavigationProps;
}

type RouteParams = {
  farmId: number;
  farmName: string;
};

const AddNewCrop: React.FC<AddNewCropProps> = ({ navigation }) => {
  interface CropData {
    id: string;
    cropNameEnglish: string;
    cropNameSinhala: string;
    cropNameTamil: string;
    bgColor: string;
    image: string;
    selectedCrop: boolean;
    district: string;
  }

  interface VarietyData {
    cropGroupId: string;
    id: string;
    varietyNameEnglish: string;
    varietyNameSinhala: string;
    varietyNameTamil: string;
    bgColor: string;
    image: string;
  }

  const [crop, setCrop] = useState<CropData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] =
    useState<string>("Vegetables");
  const [isModalVisible, setModalVisible] = useState(false);
  const [showDistricts, setShowDistricts] = useState(false);
  const [language, setLanguage] = useState("en");
  const { t } = useTranslation();
  const [loadingCrops, setLoadingCrops] = useState<boolean>(false);
  const [loadingVarieties, setLoadingVarieties] = useState<boolean>(false);

  const [selectedCrop, setSelectedCrop] = useState<boolean>(false);
  const [selectedCropId, setSelectedCropId] = useState<string | null>(null);
  const [selectedVariety, setSelectedVariety] = useState<VarietyData[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [allowedCropIds, setAllowedCropIds] = useState<string[]>([]);
  const route = useRoute();
  const { farmId, farmName } = route.params as RouteParams;

  useEffect(() => {
    const fetchFarmCertificateCrops = async () => {
      if (!farmId) {
        return;
      }

      try {
        const token = await AsyncStorage.getItem("userToken");

        if (!token) {
          console.error(" No authentication token found");
          return;
        }

        const response = await axios.get(
          `${environment.API_BASE_URL}api/certificate/get-farmcertificate-crop/${farmId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.data && response.data.length > 0) {
          const cropIds = response.data.map((item: any) => {
            const cropIdStr = item.cropId.toString();

            return cropIdStr;
          });
          setAllowedCropIds(cropIds);
        } else {
          setAllowedCropIds([]);
        }
      } catch (error) {
        console.error(" Error fetching farm certificate crops:", error);
        setAllowedCropIds([]);
      }
    };

    fetchFarmCertificateCrops();
  }, [farmId]);

  const validateCropSelection = (cropId: string): boolean => {
    if (allowedCropIds.length === 0) {
      return true;
    }

    const isIncluded = allowedCropIds.includes(cropId);

    return isIncluded;
  };

  const handleCropSelect = (cropId: string) => {
    const cropIdString = String(cropId);

    const isValid = validateCropSelection(cropIdString);

    if (!isValid) {
      Alert.alert(
        t("NewCrop.Not Allowed"),
        t(
          "NewCrop.The certificate you purchased does not include this crop variety",
        ),
        [{ text: t("NewCrop.OK") }],
      );
      return;
    }

    setSelectedCropId(cropIdString);
    setSelectedCrop(true);
  };

  const CheckDistrict = () => {
    return districtData.map((district) => ({
      id: district.id,
      name: t(district.translationKey),
      value: district.name,
    }));
  };

  const fetchCrop = async () => {
    try {
      const selectedLanguage = t("NewCrop.LNG");
      setLanguage(selectedLanguage);

      const res = await axios.get<CropData[]>(
        `${environment.API_BASE_URL}api/crop/get-all-crop/${selectedCategory}`,
      );

      const orderedCrops = res.data.sort((a, b) => {
        const aCropName =
          language === "si"
            ? a.cropNameSinhala
            : language === "ta"
              ? a.cropNameTamil
              : a.cropNameEnglish;

        const bCropName =
          language === "si"
            ? b.cropNameSinhala
            : language === "ta"
              ? b.cropNameTamil
              : b.cropNameEnglish;

        return aCropName.localeCompare(bCropName);
      });

      setCrop(orderedCrops);
    } catch (error) {
      console.error("Error fetching crops:", error);
    } finally {
      setTimeout(() => {
        setLoadingCrops(false);
      }, 300);
    }
  };

  useEffect(() => {
    setLoadingCrops(true);
    fetchCrop();
  }, [selectedCategory]);

  const toggleDistrictSelection = async (district: string) => {
    setSelectedDistrict(district);
  };

  useEffect(() => {
    if (selectedDistrict) {
      setLoadingCrops(true);
      filteredCropsforDistrict();
    }
  }, [selectedDistrict]);

  const filteredCropsforDistrict = async () => {
    try {
      const res = await axios.get<CropData[]>(
        `${environment.API_BASE_URL}api/crop/get-all-crop-bydistrict/${selectedCategory}/${selectedDistrict}`,
      );

      const orderedCrops = res.data.sort((a, b) => {
        const aCropName =
          language === "si"
            ? a.cropNameSinhala
            : language === "ta"
              ? a.cropNameTamil
              : a.cropNameEnglish;

        const bCropName =
          language === "si"
            ? b.cropNameSinhala
            : language === "ta"
              ? b.cropNameTamil
              : b.cropNameEnglish;

        return aCropName.localeCompare(bCropName);
      });

      setCrop(orderedCrops);
    } catch (error) {
      console.error("Error fetching crop data:", error);
    } finally {
      setLoadingCrops(false);
    }
  };

  const inputRef = useRef<TextInput>(null);
  const handlePress = () => {
    inputRef.current?.focus();
  };

  const filteredCrops = crop.filter((item) => {
    const searchField =
      language === "si"
        ? item.cropNameSinhala
        : language === "ta"
          ? item.cropNameTamil
          : item.cropNameEnglish;

    const matchesSearch = searchField
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const filterdVareity = selectedVariety.filter((item) => {
    const searchField =
      language === "si"
        ? item.varietyNameSinhala
        : language === "ta"
          ? item.varietyNameTamil
          : item.varietyNameEnglish;
    return searchField.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const categories = [
    {
      name: "Vegetables",
      SinhalaName: "එළවළු",
      TamilName: "காய்கறிகள்",
      image: require("../../assets/images/crop-cultivation/vegitables.webp"),
    },
    {
      name: "Fruit",
      SinhalaName: "පළතුරු",
      TamilName: "பழங்கள்",
      image: require("../../assets/images/crop-cultivation/fruit.webp"),
    },
    {
      name: "Cereals",
      SinhalaName: "ධාන්‍ය බෝග",
      TamilName: "தான்ய",
      image: require("../../assets/images/crop-cultivation/grains.webp"),
    },
    {
      name: "Legumes",
      SinhalaName: "රනිල බෝග",
      TamilName: "மலர்கள்",
      image: require("../../assets/images/crop-cultivation/legumes.webp"),
    },
    {
      name: "Spices",
      SinhalaName: "කුළු බඩු",
      TamilName: "மசாலா",
      image: require("../../assets/images/crop-cultivation/spices.webp"),
    },
    {
      name: "Mushrooms",
      SinhalaName: "බිම්මල්",
      TamilName: "காளான்கள்",
      image: require("../../assets/images/crop-cultivation/mushroom.webp"),
    },
  ];

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
    setShowDistricts(false);
  };

  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        if (selectedCrop) {
          setSelectedCrop(false);
          setSelectedVariety([]);
          setSelectedCropId(null);
          return true;
        } else {
          navigation.navigate("Main", {
            screen: "FarmDetailsScreen",
            params: { farmId: farmId, farmName: farmName },
          });
          return true;
        }
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackPress,
      );
      return () => subscription.remove();
    }, [navigation, selectedCrop, farmId, farmName]),
  );

  useEffect(() => {
    const fetchVarieties = async () => {
      if (!selectedCropId) return;

      setLoadingVarieties(true);

      try {
        const selectedLanguage = t("NewCrop.LNG");
        setLanguage(selectedLanguage);

        const varietyResponse = await axios.get<VarietyData[]>(
          `${environment.API_BASE_URL}api/crop/get-crop-variety/${selectedCropId}`,
        );

        const orderedVarieties = varietyResponse.data.sort((a, b) => {
          const aVarietyName =
            selectedLanguage === "si"
              ? a.varietyNameSinhala
              : selectedLanguage === "ta"
                ? a.varietyNameTamil
                : a.varietyNameEnglish;

          const bVarietyName =
            selectedLanguage === "si"
              ? b.varietyNameSinhala
              : selectedLanguage === "ta"
                ? b.varietyNameTamil
                : b.varietyNameEnglish;

          return aVarietyName.localeCompare(bVarietyName);
        });

        setSelectedVariety(orderedVarieties);
      } catch (error) {
        console.error("Error fetching crop data:", error);
      } finally {
        setTimeout(() => {
          setLoadingVarieties(false);
        }, 300);
      }
    };

    fetchVarieties();
  }, [selectedCropId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCrop();
    setRefreshing(false);
  };

  const SkeletonLoader = () => (
    <View style={{ marginTop: hp("2%"), paddingHorizontal: wp("5%") }}>
      <ContentLoader
        speed={2}
        width={wp("90%")}
        height={hp("80%")}
        viewBox={`0 0 ${wp("90%")} ${hp("80%")}`}
        backgroundColor="#ececec"
        foregroundColor="#fafafa"
      >
        <Rect
          x="2"
          y="10"
          rx="12"
          ry="12"
          width={wp("28%")}
          height={hp("15%")}
        />
        <Rect
          x={wp("31%")}
          y="10"
          rx="12"
          ry="12"
          width={wp("28%")}
          height={hp("15%")}
        />
        <Rect
          x={wp("62%")}
          y="10"
          rx="12"
          ry="12"
          width={wp("28%")}
          height={hp("15%")}
        />

        <Rect
          x="2"
          y={hp("18%")}
          rx="12"
          ry="12"
          width={wp("28%")}
          height={hp("15%")}
        />
        <Rect
          x={wp("31%")}
          y={hp("18%")}
          rx="12"
          ry="12"
          width={wp("28%")}
          height={hp("15%")}
        />
        <Rect
          x={wp("62%")}
          y={hp("18%")}
          rx="12"
          ry="12"
          width={wp("28%")}
          height={hp("15%")}
        />

        <Rect
          x="2"
          y={hp("35%")}
          rx="12"
          ry="12"
          width={wp("28%")}
          height={hp("15%")}
        />
        <Rect
          x={wp("31%")}
          y={hp("35%")}
          rx="12"
          ry="12"
          width={wp("28%")}
          height={hp("15%")}
        />
        <Rect
          x={wp("62%")}
          y={hp("35%")}
          rx="12"
          ry="12"
          width={wp("28%")}
          height={hp("15%")}
        />

        <Rect
          x="2"
          y={hp("52%")}
          rx="12"
          ry="12"
          width={wp("28%")}
          height={hp("15%")}
        />
        <Rect
          x={wp("31%")}
          y={hp("52%")}
          rx="12"
          ry="12"
          width={wp("28%")}
          height={hp("15%")}
        />
        <Rect
          x={wp("62%")}
          y={hp("52%")}
          rx="12"
          ry="12"
          width={wp("28%")}
          height={hp("15%")}
        />
      </ContentLoader>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      <CustomHeader
        title={t("NewCrop.NewCrop")}
        navigation={navigation}
        onBackPress={() =>
          navigation.navigate("Main", {
            screen: "FarmDetailsScreen",
            params: { farmId: farmId, farmName: farmName },
          })
        }
      />

      <View className="flex-row mt-6 items-center ml-5 mr-5">
        <TouchableOpacity
          onPress={handlePress}
          className="flex-row justify-center"
        >
          <View className="flex-row items-center bg-gray-100 rounded-lg p-1 w-full max-w-md">
            <EvilIcons name="search" size={24} color="gray" />
            <TextInput
              ref={inputRef}
              className="ml-2 mr-6 text-base flex-1"
              placeholder={t("NewCrop.Search")}
              placeholderTextColor="gray"
              style={{ textAlignVertical: "center" }}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </TouchableOpacity>
      </View>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        animationIn="slideInRight"
        animationOut="slideOutRight"
        style={{
          margin: 0,
          justifyContent: "flex-start",
          alignItems: "flex-end",
        }}
      >
        <View
          className="bg-white p-4 h-full mt-[10%] mr-4 rounded-[25px]"
          style={{ width: wp(50) }}
        >
          <View className="flex items-start justify-start mb-2">
            <TouchableOpacity onPress={toggleModal}>
              <View>
                <FontAwesome6 name="arrow-right-long" size={25} color="gray" />
              </View>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            className="bg-slate-100"
            onPress={() => setShowDistricts(true)}
          >
            <Text className="text-base mb-2">{t("NewCrop.District")}</Text>
          </TouchableOpacity>
          <View className="border-t border-gray-400" />
          <TouchableOpacity className="bg-slate-100">
            <Text className="text-base">{t("NewCrop.Price")}</Text>
          </TouchableOpacity>

          {showDistricts && (
            <ScrollView className="mt-4 mb-4">
              {CheckDistrict().map((district, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => toggleDistrictSelection(district.value)}
                >
                  <Text className="text-base mb-2">{district.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </Modal>

      <View className="flex-row mt-6 mb-4 justify-between">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingRight: wp("1%"),
          }}
        >
          <View className="flex-row ml-6 mr-2">
            {categories.map((category, index) => (
              <View key={index} className="mr-4">
                <TouchableOpacity
                  onPress={() => {
                    if (selectedCategory === category.name) {
                      return;
                    }

                    setSelectedCategory(category.name);
                    setCrop([]);
                    setSelectedCrop(false);
                    setSelectedVariety([]);
                    setSelectedCropId(null);
                  }}
                  className={`${
                    selectedCategory === category.name
                      ? "bg-green-300 border-2 border-green-500"
                      : "bg-gray-200"
                  } rounded-full items-center justify-center`}
                  style={{
                    width: wp("20%"),
                    height: wp("20%"),
                    padding: wp("2%"),
                  }}
                  disabled={selectedCrop}
                >
                  <Image
                    source={category.image}
                    style={{
                      flex: 1,
                      width: "70%",
                      height: "70%",
                    }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                <Text
                  className="text-center mt-1"
                  style={{
                    width: wp("20%"),
                    fontSize: wp("3%"),
                  }}
                  numberOfLines={2}
                >
                  {language === "si"
                    ? category.SinhalaName
                    : language === "ta"
                      ? category.TamilName
                      : category.name}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {loadingCrops && !selectedCrop ? (
        <View style={{ flex: 1, alignItems: "center" }}>
          <SkeletonLoader />
        </View>
      ) : (
        <>
          {selectedCrop === false && (
            <>
              {filteredCrops && filteredCrops.length > 0 ? (
                <ScrollView
                  contentContainerStyle={{ flexGrow: 1, zIndex: 1 }}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={handleRefresh}
                    />
                  }
                >
                  <FarmCropItem
                    data={filteredCrops}
                    navigation={navigation}
                    lang={language}
                    selectedCrop={selectedCrop}
                    setSelectedCrop={setSelectedCrop}
                    onCropSelect={handleCropSelect}
                    allowedCropIds={allowedCropIds}
                  />
                </ScrollView>
              ) : (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingHorizontal: 20,
                  }}
                >
                  <LottieView
                    source={require("../../assets/jsons/NoComplaints.json")}
                    autoPlay
                    loop
                    style={{ width: 150, height: 150 }}
                  />
                  <Text
                    style={{
                      fontSize: 18,
                      color: "#666",
                      textAlign: "center",
                      marginTop: 20,
                      fontWeight: "500",
                    }}
                  >
                    {searchQuery
                      ? t("NewCrop.No results found")
                      : t("NewCrop.No results found")}
                  </Text>
                </View>
              )}
            </>
          )}

          {selectedCrop === true && (
            <>
              <View className="flex-row items-center justify-between px-6 mt-8">
                <View>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedCrop(false);
                      setSelectedVariety([]);
                      setSelectedCropId(null);
                    }}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  >
                    <AntDesign name="arrow-left" size={24} color="#000502" />
                  </TouchableOpacity>
                </View>
                <View className="flex-1 items-center">
                  <Text className="text-black text-xl">
                    {language === "en"
                      ? crop.find((c) => c.id === selectedCropId)
                          ?.cropNameEnglish
                      : language === "ta"
                        ? crop.find((c) => c.id === selectedCropId)
                            ?.cropNameTamil
                        : crop.find((c) => c.id === selectedCropId)
                            ?.cropNameSinhala}{" "}
                    {t("TransactionList.Varieties")}
                  </Text>
                </View>
              </View>

              {loadingVarieties ? (
                <View style={{ flex: 1, alignItems: "center" }}>
                  <SkeletonLoader />
                </View>
              ) : (
                <>
                  {filterdVareity && filterdVareity.length > 0 ? (
                    <ScrollView>
                      <CropVariety
                        data={filterdVareity}
                        navigation={navigation as any}
                        lang={language}
                        selectedCrop={selectedCrop}
                        farmId={farmId}
                      />
                    </ScrollView>
                  ) : (
                    <View
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        paddingHorizontal: 20,
                      }}
                    >
                      <LottieView
                        source={require("../../assets/jsons/NoComplaints.json")}
                        autoPlay
                        loop
                        style={{ width: 150, height: 150 }}
                      />
                      <Text
                        style={{
                          fontSize: 18,
                          color: "black",
                          textAlign: "center",
                          marginTop: 20,
                        }}
                      >
                        {t("NewCrop.No results found")}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </View>
  );
};

export default AddNewCrop;
