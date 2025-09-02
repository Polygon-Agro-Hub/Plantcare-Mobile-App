import {
  View,
  Text,
  Image,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import AntDesign from "react-native-vector-icons/AntDesign";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { RouteProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import { encode } from "base64-arraybuffer";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTranslation } from "react-i18next";
import LottieView from "lottie-react-native";

type FarmSelectCropRouteProp = RouteProp<RootStackParamList, "FarmSelectCrop">;
type FarmSelectCropNavigationCrop = StackNavigationProp<
  RootStackParamList,
  "FarmSelectCrop"
>;

interface FarmSelectCropProps {
  navigation: FarmSelectCropNavigationCrop;
  route: FarmSelectCropRouteProp;
}

interface CropItem {
  id: number;
  varietyNameEnglish: string;
  varietyNameSinhala: string;
  varietyNameTamil: string;
  image: string;
  descriptionEnglish: string;
  descriptionSinhala: string;
  descriptionTamil: string;
}

const FarmSelectCrop: React.FC<FarmSelectCropProps> = ({ navigation, route }) => {
  const { cropId, selectedVariety, farmId } = route.params;
  const [crop, setCrop] = useState<CropItem | null>(null);
  const { t } = useTranslation();
  const [language, setLanguage] = useState("en"); 
  const [loading, setLoading] = useState<boolean>(true);

  console.log(";;;;;;;;;;;;;;;farmcrop addd" ,farmId)

  const bufferToBase64 = (buffer: number[]): string => {
    const uint8Array = new Uint8Array(buffer);
    return encode(uint8Array.buffer);
  };

  const formatImage = (imageBuffer: { type: string; data: number[] } | null): string | null => {
    if (imageBuffer && imageBuffer.data) {
      const base64String = bufferToBase64(imageBuffer.data);
      return `data:image/png;base64,${base64String}`;
    }
    return null;
  };

  useEffect(() => {
    const selectedLanguage = t("NewCrop.LNG");
    setLanguage(selectedLanguage);
    if (selectedVariety) {
      setCrop(selectedVariety);
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [selectedVariety]);

  const getCropName = () => {
    switch (language) {
      case "si":
        return crop?.varietyNameSinhala || crop?.varietyNameEnglish;
      case "ta":
        return crop?.varietyNameTamil || crop?.varietyNameEnglish;
      default:
        return crop?.varietyNameEnglish;
    }
  };

  const getSpecialNotes = () => {
    switch (language) {
      case "si":
        return crop?.descriptionSinhala || crop?.descriptionEnglish;
      case "ta":
        return crop?.descriptionTamil || crop?.descriptionEnglish;
      default:
        return crop?.descriptionEnglish;
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
             <LottieView
                                        source={require('../../assets/jsons/loader.json')}
                                        autoPlay
                                        loop
                                        style={{ width: 300, height: 300 }}
                                      />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" >
      <ScrollView>
      <TouchableOpacity onPress={() => router.back()}>
        <AntDesign name="left" size={24} color="#000502" style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}  />
      </TouchableOpacity>
      <View className=" items-center">
        <Text className="text-2xl font-bold pb-10">{getCropName()}</Text>
        {selectedVariety?.image && typeof selectedVariety.image === "string" ? (
          <Image
            source={{ uri: (selectedVariety.image) || "" }}
            className="rounded-[30px] h-14 w-14 mb-4"
            style={{ width: 250, height: 250 }}
             resizeMode="contain"
          />
        ) : (
          <Text>{t("SelectCrop.noImage")}</Text> // Fallback if no image data
        )}
      </View>
      <View className="flex-1 px-4 pl-7">
        <Text className="font-bold text-lg mb-4">{t("SelectCrop.description")}</Text>
        <View className="min-h-[260px] pt-0 pb-4">
            <Text className="text-base leading-relaxed">
              {getSpecialNotes() || "No additional notes available for this crop."}
            </Text>
          
        </View>
      </View>
      <TouchableOpacity
        className="bg-[#26D041] p-4 mx-4 mb-4 items-center bottom-0 left-0 right-0  rounded-lg"
        onPress={() => navigation.navigate("FarmCropEnroll", { cropId ,status: "newAdd", onCulscropID: 0 ,farmId:farmId})}
      >
        <Text className="text-white text-xl">{t("SelectCrop.Continue")}</Text>
      </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FarmSelectCrop;
