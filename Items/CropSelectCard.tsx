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

interface CropSelectCardProps {
  item: CropData;
  navigation: StackNavigationProp<RootStackParamList, "NewCrop">;
  index: number;
  lang: string;
  selectedCrop: boolean;
  setSelectedCrop: React.Dispatch<React.SetStateAction<boolean>>;
  onCropSelect: (cropId: string) => void;
}

const CropSelectCard: React.FC<CropSelectCardProps> = ({
  item,
  lang,
  setSelectedCrop,
  onCropSelect,
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

  return (
    <View className="mt-5 pl-6 pr-6 ">
      <TouchableOpacity
        onPress={() => {
          setSelectedCrop(true);
          onCropSelect(item.id);
        }}
      >
        <View
          className="flex justify-center items-center w-[100px] h-[115px] rounded-[10px] shadow-l p-1"
          style={{
            backgroundColor: item.bgColor,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25,
            shadowRadius: 6,
            elevation: 8,
            opacity: 1,
          }}
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
          <Text className="text-center text-[14px]">
            {lang === "si"
              ? item.cropNameSinhala.length > 20
                ? item.cropNameSinhala.slice(0, 30) + "..."
                : item.cropNameSinhala
              : lang === "ta"
                ? item.cropNameTamil.length > 20
                  ? item.cropNameTamil.slice(0, 30) + "..."
                  : item.cropNameTamil
                : item.cropNameEnglish.length > 20
                  ? item.cropNameEnglish.slice(0, 30) + "..."
                  : item.cropNameEnglish}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default CropSelectCard;
