import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/component/types/types";
import { encode } from "base64-arraybuffer";

interface VarietyData {
  cropGroupId: string;
  id: string;
  varietyNameEnglish: string;
  varietyNameSinhala: string;
  varietyNameTamil: string;
  bgColor: string;
  image: { type: string; data: number[] };
}

interface CropVarietySelectCardProps {
  item: VarietyData;
  navigation: StackNavigationProp<RootStackParamList, "AddNewCrop">;
  index: number;
  lang: string;
  selectedCrop: boolean;
  farmId: number;
  onNavigate?: () => void;
}

const CropVarietySelectCard: React.FC<CropVarietySelectCardProps> = ({
  item,
  navigation,
  lang,
  farmId,
  onNavigate,
}) => {
  const bufferToBase64 = (buffer: number[]): string => {
    const uint8Array = new Uint8Array(buffer);
    return encode(uint8Array.buffer);
  };

  const formatImage = (imageBuffer: {
    type: string;
    data: number[];
  }): string => {
    const base64String = bufferToBase64(imageBuffer.data);
    return `data:image/png;base64,${base64String}`;
  };

  const handlePress = () => {
    onNavigate?.();

    navigation.navigate("FarmSelectCrop", {
      cropId: item.id,
      selectedVariety: item,
      farmId: farmId,
    });
  };

  return (
    <View className="mt-5 pl-6 pr-6">
      <TouchableOpacity onPress={handlePress}>
        <View
          className="flex justify-center items-center w-[100px] h-[100px] rounded-[10px] shadow-lg p-1"
          style={{ backgroundColor: item.bgColor }}
        >
          <Image
            className=""
            source={
              typeof item.image === "string"
                ? { uri: item.image }
                : { uri: formatImage(item.image) }
            }
            resizeMode="contain"
            style={{ width: 80, height: 60 }}
          />
          <Text className="text-center text-[12px]">
            {lang === "si"
              ? item.varietyNameSinhala.length > 20
                ? item.varietyNameSinhala.slice(0, 18) + "..."
                : item.varietyNameSinhala
              : lang === "ta"
                ? item.varietyNameTamil.length > 20
                  ? item.varietyNameTamil.slice(0, 20) + "..."
                  : item.varietyNameTamil
                : item.varietyNameEnglish.length > 20
                  ? item.varietyNameEnglish.slice(0, 20) + "..."
                  : item.varietyNameEnglish}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default CropVarietySelectCard;
