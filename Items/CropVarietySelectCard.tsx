import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/component/types';
import { encode } from 'base64-arraybuffer';

interface VarietyData {
  cropGroupId: string;
  id: string;
  varietyNameEnglish: string;
  varietyNameSinhala: string;
  varietyNameTamil: string;
  bgColor: string;
  image: { type: string; data: number[] };
}

interface CropSelectCardProps {
  item: VarietyData;
  navigation: StackNavigationProp<RootStackParamList, 'NewCrop'>;
  index: number;
  lang: string;
  selectedCrop: boolean;
}

const CropSelectCard: React.FC<CropSelectCardProps> = ({ item, navigation, lang, index, selectedCrop }) => {
  const bufferToBase64 = (buffer: number[]): string => {
    const uint8Array = new Uint8Array(buffer); 
    return encode(uint8Array.buffer);
  };

  const formatImage = (imageBuffer: { type: string; data: number[] }): string => {
    const base64String = bufferToBase64(imageBuffer.data);
    return `data:image/png;base64,${base64String}`; 
  };

  return (
    <View className="mt-5 pl-6 pr-6">
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('SelectCrop', {
            cropId: item.id,
            selectedVariety: item,  
          })
        }
      >
        <View
          className="flex justify-center items-center w-[100px] h-[100px] rounded-[10px] shadow-lg pb-1"
          style={{ backgroundColor: item.bgColor }}
        >
          <Image className="w-[70px] h-[70px] -mb-4" 
          // source={{ uri: formatImage(item.image) }} 
          source={
            typeof item.image === "string"
              ? { uri: item.image } 
              : { uri: formatImage(item.image) }
          } 
           resizeMode="contain" />
          <Text className="text-center text-[14px] pb-4 pt-1">
            {
              lang === 'si' ? item.varietyNameSinhala
              : lang === 'ta' ? item.varietyNameTamil
              : item.varietyNameEnglish
            }
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default CropSelectCard;
