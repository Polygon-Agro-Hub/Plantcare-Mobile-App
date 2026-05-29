import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/component/types/types";
import { encode } from "base64-arraybuffer";

interface CropData {
  id: string;
  cropNameEnglish: string;
  cropNameSinhala: string;
  cropNameTamil: string;
  bgColor: string;
  image: { type: string; data: number[] };
}

interface FarmCropSelectCardProps {
  item: CropData;
  navigation: StackNavigationProp<RootStackParamList, "AddNewCrop">;
  index: number;
  lang: string;
  selectedCrop: boolean;
  setSelectedCrop: React.Dispatch<React.SetStateAction<boolean>>;
  onCropSelect: (cropId: string) => void;
  isAllowed: boolean;
}

const FarmCropSelectCard: React.FC<FarmCropSelectCardProps> = ({
  item,
  lang,
  setSelectedCrop,
  onCropSelect,
  isAllowed,
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
    setSelectedCrop(true);
    onCropSelect(item.id);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={{ width: "100%", height: "100%" }}
      disabled={!isAllowed}
    >
      <View
        className="flex-1 justify-center items-center rounded-2xl p-2"
        style={{
          backgroundColor: item.bgColor || "#F3F4F6",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
          elevation: 5,
          opacity: isAllowed ? 1 : 0.5,
        }}
      >
        <Image
          source={
            typeof item.image === "string"
              ? { uri: item.image }
              : { uri: formatImage(item.image) }
          }
          resizeMode="contain"
          style={{ width: "85%", height: "55%", marginBottom: 6 }}
        />
        <Text
          className="text-center font-bold text-[12px] text-gray-800"
          numberOfLines={2}
          style={{ width: "95%", lineHeight: 15 }}
        >
          {lang === "si"
            ? item.cropNameSinhala
            : lang === "ta"
              ? item.cropNameTamil
              : item.cropNameEnglish}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default FarmCropSelectCard;
