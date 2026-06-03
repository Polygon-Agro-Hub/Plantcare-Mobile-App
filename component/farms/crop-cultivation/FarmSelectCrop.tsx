import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/types";
import { useTranslation } from "react-i18next";
import { RouteProp } from "@react-navigation/native";
import i18n from "@/i18n/i18n";
import CustomHeader from "@/component/common/CustomHeader";
import LoadingPage from "@/component/common/LoadingPage";

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

const FarmSelectCrop: React.FC<FarmSelectCropProps> = ({
  navigation,
  route,
}) => {
  const { cropId, selectedVariety, farmId } = route.params;
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
    return <LoadingPage fullScreen />;
  }

  return (
    <View className="flex-1 bg-white">
      <CustomHeader
        title=""
        navigation={navigation}
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        className="px-6"
      >
        <View className="items-center mt-4">
          <Text
            className="font-bold text-xl text-center mb-6 text-black"
            style={{ lineHeight: 28 }}
          >
            {getCropName()}
          </Text>
          {selectedVariety?.image &&
          typeof selectedVariety.image === "string" ? (
            <Image
              source={{ uri: selectedVariety.image || "" }}
              className="rounded-[30px] mb-6"
              style={{ width: 250, height: 250 }}
              resizeMode="contain"
            />
          ) : (
            <Text className="text-gray-400 mb-6">
              {t("SelectCrop.NoImageAvailable")}
            </Text>
          )}
        </View>
        <View className="mt-4">
          <Text className="font-bold text-lg mb-2 text-black">
            {t("SelectCrop.Description")}
          </Text>
          <View className="min-h-[200px]">
            <Text className="text-base leading-relaxed text-gray-700">
              {getSpecialNotes() ||
                "No additional notes available for this crop."}
            </Text>
          </View>
        </View>
        <View className="px-6">
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("FarmCropEnroll", {
                cropId,
                status: "newAdd",
                onCulscropID: 0,
                farmId: farmId,
              })
            }
            className="bg-[#353535] w-full rounded-3xl h-[50px] justify-center items-center shadow-lg elevation-6 mt-8 mb-6"
          >
            <Text className="text-white text-base font-bold">
              {t("Main.Continue")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default FarmSelectCrop;
