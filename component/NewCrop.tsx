import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import axios from "axios";
import Ionicons from "react-native-vector-icons/Ionicons";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import Modal from "react-native-modal";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import NavigationBar from "@/Items/NavigationBar";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import AntDesign from "react-native-vector-icons/AntDesign";
import CropItem from "@/Items/CropItem";
import CropVariety from "@/Items/CropVariety";

type NewCropNavigationProps = StackNavigationProp<
  RootStackParamList,
  "NewCrop"
>;

interface NewCropProps {
  navigation: NewCropNavigationProps;
}

const NewCrop: React.FC<NewCropProps> = ({ navigation }) => {
  interface CropData {
    id: string;
    cropNameEnglish: string;
    cropNameSinhala: string;
    cropNameTamil: string;
    bgColor: string;
    image: string;
    selectedCrop: boolean;
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
  const [searchQuery, setSearchQuery] = useState<string>(""); // New state for search query
  const [selectedCategory, setSelectedCategory] =
    useState<string>("Vegetables");
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [showDistricts, setShowDistricts] = useState(false);
  const [language, setLanguage] = useState("en");
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCrop, setSelectedCrop] = useState<boolean>(false);
  const [selectedCropId, setSelectedCropId] = useState<string | null>(null);
  const [selectedVariety, setSelectedVariety] = useState<VarietyData[]>([]);

  const distict = [
    { id: 1, name: t("District.Ampara") },
    { id: 2, name: t("District.Anuradhapura") },
    { id: 3, name: t("District.Badulla") },
    { id: 4, name: t("District.Batticaloa") },
    { id: 5, name: t("District.Colombo") },
    { id: 6, name: t("District.Galle") },
    { id: 7, name: t("District.Gampaha") },
    { id: 8, name: t("District.Hambantota") },
    { id: 9, name: t("District.Jaffna") },
    { id: 10, name: t("District.Kalutara") },
    { id: 11, name: t("District.Kandy") },
    { id: 12, name: t("District.Kegalle") },
    { id: 13, name: t("District.Kilinochchi") },
    { id: 14, name: t("District.Kurunegala") },
    { id: 15, name: t("District.Mannar") },
    { id: 16, name: t("District.Matale") },
    { id: 17, name: t("District.Matara") },
    { id: 18, name: t("District.Monaragala") },
    { id: 19, name: t("District.Mullaitivu") },
    { id: 20, name: t("District.NuwaraEliya") },
    { id: 21, name: t("District.Polonnaruwa") },
    { id: 22, name: t("District.Puttalam") },
    { id: 23, name: t("District.Ratnapura") },
    { id: 24, name: t("District.Trincomalee") },
    { id: 25, name: t("District.Vavuniya") },
  ];
  const CheckDistrict = () => {
    return distict;
  };

  useEffect(() => {
    setCategoryLoading(true);
    const fetchCrop = async () => {
      try {
        const selectedLanguage = t("NewCrop.LNG");
        setLanguage(selectedLanguage);

        const res = await axios.get<CropData[]>(
          `${environment.API_BASE_URL}api/crop/get-all-crop/${selectedCategory}`
        );
        setCrop(res.data);
      } catch (error) {
        
      } finally {
        setLoading(false);
        setCategoryLoading(false);
      }
    };

    fetchCrop();
  }, [selectedCategory]);

  const inputRef = useRef<TextInput>(null);
  const handlePress = () => {
    inputRef.current?.focus();
  };

  const filteredCrops = crop.filter((item) =>
    item.cropNameEnglish.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filterdVareity = selectedVariety.filter((item) =>
    item.varietyNameEnglish.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [
    {
      name: "Vegetables",
      SinhalaName: "එළවළු",
      TamilName: "காய்கறிகள்",
      image: require("../assets/images/Vegitables.png"),
    },
    {
      name: "Fruit",
      SinhalaName: "පළතුරු",
      TamilName: "பழங்கள்",
      image: require("../assets/images/Fruit.png"),
    },
    {
      name: "Grain",
      SinhalaName: "ධාන්‍ය",
      TamilName: "தான்ய",
      image: require("../assets/images/Grains.png"),
    },
    {
      name: "Mushrooms",
      SinhalaName: "බිම්මල්",
      TamilName: "காளான்கள்",
      image: require("../assets/images/Mushroom.png"),
    },
  ];

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
    setShowDistricts(false);
  };

  const handleCropSelect = (cropId: string) => {
    setSelectedCropId(cropId);
    setSelectedCrop(true);
  };

  useEffect(() => {
    const fetchCrop = async () => {
      if (!selectedCropId) return;

      try {
        const selectedLanguage = t("NewCrop.LNG");
        setLanguage(selectedLanguage);

        console.log("Selected Crop ID:", selectedCropId);
        const varietyResponse = await axios.get<VarietyData[]>(
          `${environment.API_BASE_URL}api/crop/get-crop-variety/${selectedCropId}`
        );
        setSelectedVariety(varietyResponse.data);
      } catch (error) {
        console.error("Error fetching crop data:", error);
      } finally {
        setLoading(false);
        setCategoryLoading(false);
      }
    };

    fetchCrop();
  }, [selectedCropId]);

  return (
    <SafeAreaView className="flex-1">
      <StatusBar style="light" />

      <View className="flex-row items-center justify-between px-4 pt-4">
        <View>
          <TouchableOpacity
            onPress={() => navigation.navigate("Dashboard")}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <AntDesign
              name="left"
              size={24}
              color="#000502"
              onPress={() => navigation.goBack()}
            />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-black text-xl font-bold ">
            {t("NewCrop.NewCrop")}
          </Text>
        </View>
      </View>

      <View className="flex-row ml-6 mr-12 mt-6 justify-between">
        <TouchableOpacity
          onPress={handlePress}
          className="flex-row justify-center mr-5"
        >
          <View className="flex-row items-center bg-gray-100 rounded-lg p-2 w-full max-w-md">
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

        <View className="flex justify-center items-center bg-slate-200 mr-4 rounded-lg pl-1 pr-1">
          <TouchableOpacity onPress={toggleModal}>
            <MaterialIcons name="tune" size={30} color="green" />
          </TouchableOpacity>
        </View>
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
          className="bg-white p-4 h-full mt-16 mr-4 rounded-[25px]"
          style={{ width: wp(50) }}
        >
          <View className=" flex items-start justify-start mb-2">
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
            <ScrollView className="mt-4">
              {CheckDistrict().map((district, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => console.log(district.name)}
                >
                  <Text className="text-base mb-2">{district.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </Modal>

      <View className="flex-row pl-6 pr-6 mt-6 justify-between">
        {categories.map((category, index) => (
          <View key={index}>
            <TouchableOpacity
              onPress={() => {
                if (selectedCategory === category.name) return;
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
              } rounded-full p-2`}
              style={{
                width: wp("20%"),
                height: wp("20%"),
              }}
            >
              {loading && selectedCategory === category.name ? (
                <ActivityIndicator size="small" color="green" />
              ) : (
                <Image
                  source={category.image}
                  className="rounded-[35px] h-14 w-14 "
                  style={{
                    width: wp("14%"),
                    height: wp("14%"),
                  }}
                  resizeMode="cover"
                />
              )}
            </TouchableOpacity>
            <Text className="text-center">
              {language === "si"
                ? category.SinhalaName
                : language === "ta"
                ? category.TamilName
                : category.name}
            </Text>
          </View>
        ))}
      </View>

      {categoryLoading && (
        <View className="flex-1 justify-center items-center mt-40">
          <ActivityIndicator size="large" color="#00ff00" />
        </View>
      )}

      {selectedCrop === false && (
        <ScrollView>
          <CropItem
            data={filteredCrops}
            navigation={navigation}
            lang={language}
            selectedCrop={selectedCrop}
            setSelectedCrop={setSelectedCrop}
            onCropSelect={handleCropSelect}
          />
        </ScrollView>
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
                <AntDesign
                  name="arrowleft"
                  size={24}
                  color="#000502"
                  onPress={() => {
                    setSelectedCrop(false);
                    setSelectedVariety([]);
                    setSelectedCropId(null);
                  }}
                />
              </TouchableOpacity>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-black text-xl  ">
              {
          // Conditionally render based on the current language
          language === 'en'
            ? crop.find((c) => c.id === selectedCropId)?.cropNameEnglish
            : language === 'ta'
            ? crop.find((c) => c.id === selectedCropId)?.cropNameTamil
            : crop.find((c) => c.id === selectedCropId)?.cropNameSinhala
        }
              </Text>
            </View>
          </View>
          <ScrollView>
            <CropVariety
              data={filterdVareity}
              navigation={navigation}
              lang={language}
              selectedCrop={selectedCrop}
            />
          </ScrollView>
        </>
      )}

      <View style={{ width: "100%" }}>
        <NavigationBar navigation={navigation} />
      </View>
    </SafeAreaView>
  );
};

export default NewCrop;
