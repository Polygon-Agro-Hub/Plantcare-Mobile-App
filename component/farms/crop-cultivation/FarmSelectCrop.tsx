import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/types";
import { RouteProp } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useTranslation } from "react-i18next";
import LottieView from "lottie-react-native";
import i18n from "@/i18n/i18n";
import CustomHeader from "@/component/common/CustomHeader";

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
          source={require("../../../assets/jsons/loader.json")}
          autoPlay
          loop
          style={{ width: 300, height: 300 }}
        />
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
          <Text
            className="font-bold pb-10 px-4"
            style={[
              i18n.language === "si" ? { fontSize: 20 } : { fontSize: 20 },
              {
                flexWrap: "wrap",
                textAlign: "center",
                width: wp(90),
                lineHeight: 28,
              },
            ]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {getCropName()}
          </Text>
          {selectedVariety?.image &&
          typeof selectedVariety.image === "string" ? (
            <Image
              source={{ uri: selectedVariety.image || "" }}
              className="rounded-[30px] h-14 w-14 mb-4"
              style={{ width: 250, height: 250 }}
              resizeMode="contain"
            />
          ) : (
            <Text>{t("SelectCrop.noImage")}</Text>
          )}
        </View>
        <View className="flex-1 px-4 pl-7">
          <Text className="font-bold text-lg mb-4">
            {t("SelectCrop.description")}
          </Text>
          <View className="min-h-[260px] pt-0 pb-4">
            <Text
              className="text-base leading-relaxed"
              style={[
                i18n.language === "si" ? { fontSize: 14 } : { fontSize: 16 },
              ]}
            >
              {getSpecialNotes() ||
                "No additional notes available for this crop."}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          className="bg-[#353535] p-3 mx-8 mb-4 items-center bottom-0 left-0 right-0  rounded-full"
          onPress={() =>
            navigation.navigate("FarmCropEnroll", {
              cropId,
              status: "newAdd",
              onCulscropID: 0,
              farmId: farmId,
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
          <Text
            className="text-white text-xl"
            style={[
              i18n.language === "si" ? { fontSize: 16 } : { fontSize: 20 },
            ]}
          >
            {t("SelectCrop.Continue")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default FarmSelectCrop;
