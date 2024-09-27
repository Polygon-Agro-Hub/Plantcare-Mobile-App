import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import axios from "axios";
import Ionicons from "react-native-vector-icons/Ionicons";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import Modal from "react-native-modal";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import SinhalaNavigationBar from "@/Items/SinhalaNavigationBar";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import CropItem from "@/Items/CropItem";
import SinhalaCropItem from "@/Items/SinhalaCropItem";
import { environment } from "@/environment/environment";

type SinhalaNewCropNavigationProps = StackNavigationProp<
  RootStackParamList,
  "SinhalaNewCrop"
>;

interface SinhalaNewCropProps {
  navigation: SinhalaNewCropNavigationProps;
}

const SinhalaNewCrop: React.FC<SinhalaNewCropProps> = ({ navigation }) => {
  interface CropData {
    id: string;
    cropName: string;
    cropColor: string;
    image: string;
  }

  const [crop, setCrop] = useState<CropData[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<string>("Vegetables"); // Default to "Vegetables"
  const [isModalVisible, setModalVisible] = useState(false); // State to control modal visibility
  const [showDistricts, setShowDistricts] = useState(false); // State to control the district list visibility

  const [districts] = useState<string[]>([
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

  useEffect(() => {
    const fetchCrop = async () => {
      try {
        const res = await axios.get<CropData[]>(
          `${environment.API_BASE_URL}api/crop/get-all-crop/${selectedCategory}`
        );
        setCrop(res.data);
        console.log(res.data);
      } catch (error) {
        console.error("Error fetching crop data:", error);
      }
    };

    fetchCrop();
  }, [selectedCategory]); // Refetch crops when the selected category changes

  const inputRef = useRef<TextInput>(null);
  const handlePress = () => {
    inputRef.current?.focus();
  };

  const categories = [
    {
      name: "Vegetables",
      image: require("../assets/images/fruit-vegetables-background-style 4.png"),
      sinhalaName: "එළවළු",
    },
    {
      name: "Fruit",
      image: require("../assets/images/organic-flat-delicious-fruit-pack 1.png"),
      sinhalaName: "පළතුරු",
    },
    {
      name: "Grain",
      image: require("../assets/images/grains 1.png"),
      sinhalaName: "ධාන්‍ය",
    },
    {
      name: "Mushrooms",
      image: require("../assets/images/mushrooms 2.png"),
      sinhalaName: "බිම්මල්",
    },
  ];

  // Function to toggle the modal visibility
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
    setShowDistricts(false); // Reset district list visibility when closing the modal
  };

  return (
    <SafeAreaView className="flex-1">
      <StatusBar style="light" />

      <View className="flex-row items-center justify-between px-4">
        <View>
          <TouchableOpacity
            onPress={() => navigation.navigate("SinhalaDashbord")}
          >
            <Ionicons name="chevron-back-outline" size={30} color="gray" />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-black text-xl font-bold">නව බෝගයක් තෝරන්න</Text>
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
              placeholder="Search"
              placeholderTextColor="gray"
              style={{ textAlignVertical: "center" }} // Center text vertically
            />
          </View>
        </TouchableOpacity>

        <View className="flex justify-center items-center bg-green-100 mr-4 rounded-lg pl-1 pr-1">
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
        }} // Right side modal
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
            onPress={() => setShowDistricts(true)} // Show district list when "By District" is pressed
          >
            <Text className="text-base mb-2">දිස්ත්‍රික්කය අනුව</Text>
          </TouchableOpacity>
          <View className="border-t border-gray-400" />
          <TouchableOpacity className="bg-slate-100">
            <Text className="text-base">මිල අනුව</Text>
          </TouchableOpacity>

          {showDistricts && (
            <ScrollView className="mt-4">
              {districts.map((district, index) => (
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
              className={`${
                selectedCategory === category.name
                  ? "bg-green-300 border-2 border-green-500"
                  : "bg-gray-200"
              } rounded-full p-2`}
              style={{ width: 90, height: 90 }}
            >
              <Image
                source={category.image}
                className="rounded-[35px] h-14 w-14"
                style={{ width: 65, height: 65 }}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <Text className="text-center mt-1">{category.sinhalaName}</Text>
          </View>
        ))}
      </View>

      <View>
        <SinhalaCropItem data={crop} navigation={navigation} />
      </View>

      <View className="flex-1 justify-end">
        <SinhalaNavigationBar navigation={navigation} />
      </View>
    </SafeAreaView>
  );
};

export default SinhalaNewCrop;
