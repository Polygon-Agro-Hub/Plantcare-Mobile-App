import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";

import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/types";
import { RouteProp } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import CustomHeader from "../common/CustomHeader";

type SelectCropRouteProp = RouteProp<RootStackParamList, "SelectCrop">;
type SelectCropNavigationCrop = StackNavigationProp<
  RootStackParamList,
  "SlectCrop"
>;

interface SelectCropProps {
  navigation: SelectCropNavigationCrop;
  route: SelectCropRouteProp;
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

const SelectCrop: React.FC<SelectCropProps> = ({ navigation, route }) => {
  const { cropId, selectedVariety } = route.params;
  const [crop, setCrop] = useState<CropItem | null>(null);
  const { t } = useTranslation();
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const selectedLanguage = t("Main.LNG");
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
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView>
        <CustomHeader
          title=""
          navigation={navigation}
          onBackPress={() => navigation.goBack()}
        />
        <View className=" items-center">
          <Text className="text-2xl font-bold pb-10">{getCropName()}</Text>
          {selectedVariety?.image &&
            typeof selectedVariety.image === "string" ? (
            <Image
              source={{ uri: selectedVariety.image || "" }}
              className="rounded-[30px] h-14 w-14 mb-4"
              style={{ width: 250, height: 250 }}
              resizeMode="contain"
            />
          ) : (
            <Text>{t("SelectCrop.NoImageAvailable")}</Text>
          )}
        </View>
        <View className="flex-1 px-4 pl-7">
          <Text className="font-bold text-lg mb-4">
            {t("SelectCrop.Description")}
          </Text>
          <View className="min-h-[260px] pt-0 pb-4">
            <Text className="text-base leading-relaxed">
              {getSpecialNotes() ||
                "No additional notes available for this crop."}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          className="bg-[#353535] p-4 mx-4 mb-4 items-center bottom-0 left-0 right-0  rounded-full"
          onPress={() =>
            navigation.navigate("CropEnrol", {
              cropId,
              status: "newAdd",
              onCulscropID: 0,
            })
          }
          style={{
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <Text className="text-white text-xl">{t("Main.Continue")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default SelectCrop;
