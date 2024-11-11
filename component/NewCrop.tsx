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
import CropItem from "@/Items/CropItem";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import NavigationBar from "@/Items/NavigationBar";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import AntDesign from 'react-native-vector-icons/AntDesign';

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
    cropName: string;
    sinhalaCropName:string
    tamilCropName:string
    cropColor: string;
    image: string;
  }

  const [crop, setCrop] = useState<CropData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>(""); // New state for search query
  const [selectedCategory, setSelectedCategory] = useState<string>("Vegetables");
  const [isModalVisible, setModalVisible] = useState(false);
  const [showDistricts, setShowDistricts] = useState(false);
  const [language, setLanguage] = useState('en');
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(true);
  const [districts] = useState<string[]>([
    "Ampara",
    "Anuradhapura",
    "Badulla",
    "Batticaloa",
    "Colombo",
    "Galle",
    "Gampaha",
    "Hambantota",
    "Jaffna",
    "Kalutara",
    "Kandy",
    "Kegalle",
    "Kilinochchi",
    "Kurunegala",
    "Mannar",
    "Matale",
    "Matara",
    "Monaragala",
    "Mullaitivu",
    "Nuwara Eliya",
    "Polonnaruwa",
    "Puttalam",
    "Ratnapura",
    "Trincomalee",
    "Vavuniya",
  ]);

  const [SinhalaDistricts] = useState<string[]>([
    "අම්පාර",
    "අනුරාධපුර",
    "බදුල්ල",
    "මඩකලපුව",
    "කොළඹ",
    "ගාල්ල",
    "ගම්පහ",
    "හම්බන්තොට",
    "යාපනය",
    "කළුතර",
    "මහනුවර",
    "කෑගල්ල",
    "කිලිනොච්චි",
    "කුරුණෑගල",
    "මන්නාරම",
    "මාතලේ",
    "මාතර",
    "මොනරාගල",
    "මුලතිව්",
    "නුවරඑළිය",
    "පොළොන්නරුව",
    "පුත්තලම",
    "රත්නපුර",
    "ත්‍රිකුණාමලය",
    "වවුනියාව",
  ]);


  const [TamilDistricts] = useState<string[]>([
    "அம்பாறை",
    "அனுராதபுரம்",
    "பதுளை",
    "மட்டக்களப்பு",
    "கொழும்பு",
    "காலி",
    "கம்பஹா",
    "ஹம்பாந்தோட்டை",
    "யாழ்ப்பாணம்",
    "கலுத்துறை",
    "கCandy",
    "கேகாலை",
    "கிளிநொச்சி",
    "குருநாகல்",
    "மன்னார்",
    "மாத்தளை",
    "மாத்தறை",
    "மொனராகலை",
    "முள்ளைத்தீவு",
    "நுவரெலியா",
    "பொலன்னறுவை",
    "புத்தளம்",
    "இரத்தினபுரி",
    "திருகோணமலை",
    "வவுனியா",
  ]);

  const CheckDistrict = () => {
    if (language === 'si') {
      return SinhalaDistricts
    }
    else if (language === 'ta') {
      return TamilDistricts
    }
    else {
      return districts
    }
  }

  useEffect(() => {
    const fetchCrop = async () => {
      try {
        const selectedLanguage = t("NewCrop.LNG");
        setLanguage(selectedLanguage);
        const res = await axios.get<CropData[]>(
          `${environment.API_BASE_URL}api/crop/get-all-crop/${selectedCategory}`
        );
        setCrop(res.data);
      } catch (error) {
        console.error("Error fetching crop data:", error);
      }finally {
        setLoading(false);
      }
    };

    fetchCrop();
  }, [selectedCategory]);

  const inputRef = useRef<TextInput>(null);
  const handlePress = () => {
    inputRef.current?.focus();
  };

  // Filter crops based on search query
  const filteredCrops = crop.filter((item) =>
    item.cropName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [
    {
      name: "Vegetables",
      SinhalaName: "එළවළු",
      TamilName: "காய்கறிகள்",
      image: require("../assets/images/fruit-vegetables-background-style 4.png"),
    },
    {
      name: "Fruit",
      SinhalaName: "පළතුරු",
      TamilName: "பழங்கள்",
      image: require("../assets/images/organic-flat-delicious-fruit-pack 1.png"),
    },
    {
      name: "Grain",
      SinhalaName: "ධාන්‍ය",
      TamilName: "தான்ய",
      image: require("../assets/images/grains 1.png")
    },
    {
      name: "Mushrooms",
      SinhalaName: "බිම්මල්",
      TamilName: "காளான்கள்",
      image: require("../assets/images/mushrooms 2.png")
    }
  ];

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
    setShowDistricts(false);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <StatusBar style="light" />

      <View className="flex-row items-center justify-between px-4">
        <View>
          <TouchableOpacity onPress={() => navigation.navigate("Dashboard")}>
            {/* <Ionicons name="chevron-back-outline" size={30} color="gray" /> */}
            <AntDesign name="left" size={24} color="#000502" onPress={() => navigation.goBack()} />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-black text-xl font-bold ">
            {t('NewCrop.NewCrop')}
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
              placeholder={t('NewCrop.Search')}
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
            <Text className="text-base mb-2">{t('NewCrop.District')}</Text>
          </TouchableOpacity>
          <View className="border-t border-gray-400" />
          <TouchableOpacity className="bg-slate-100">
            <Text className="text-base">{t('NewCrop.Price')}</Text>
          </TouchableOpacity>

          {showDistricts && (
            <ScrollView className="mt-4">
              {CheckDistrict().map((district, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => console.log(district)}
                >
                  <Text className="text-base mb-2">{district}</Text>
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
              onPress={() => setSelectedCategory(category.name)}
              className={`${selectedCategory === category.name
                ? "bg-green-300 border-2 border-green-500"
                : "bg-gray-200"
                } rounded-full p-2`}
              style={{ 
                width: wp('20%'),  // Adjusts width based on device screen width
          height: wp('20%'),  // Same for height to maintain the circle shape
               }}
            >
              <Image
                source={category.image}
                className="rounded-[35px] h-14 w-14"
                style={{ 
                  width: wp('14%'),   // Makes image responsive
            height: wp('14%'),  // Maintains image proportions
                 }}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <Text className="text-center">
              {
                language==='si'? category.SinhalaName
                : language === 'ta' ? category.TamilName
                : category.name
              }
            </Text>
          </View>
        ))}
      </View>

      <ScrollView>
        <CropItem data={filteredCrops} navigation={navigation} lang={language}/>
      </ScrollView>

      <View className="flex fixed justify-end w-full">
        <NavigationBar navigation={navigation} />
      </View>
    </SafeAreaView>
  );
};

export default NewCrop;
