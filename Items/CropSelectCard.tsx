import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/component/types';
import { encode } from 'base64-arraybuffer';

interface CropData {
  id: string;
  cropName: string;
  sinhalaCropName:string
  tamilCropName:string
  cropColor: string;
  image: { type: string; data: number[] };
}

interface CropSelectCardProps {
  item: CropData;
  navigation: StackNavigationProp<RootStackParamList, 'NewCrop'>;
  index: number;
  lang: string
}

const CropSelectCard: React.FC<CropSelectCardProps> = ({ item, navigation, lang }) => {

  // Updated bufferToBase64 function
  const bufferToBase64 = (buffer: number[]): string => {
    const uint8Array = new Uint8Array(buffer); // Create Uint8Array from number[]
    return encode(uint8Array.buffer); // Pass the underlying ArrayBuffer to encode
  };

  const formatImage = (imageBuffer: { type: string; data: number[] }): string => {
    const base64String = bufferToBase64(imageBuffer.data);
    return `data:image/png;base64,${base64String}`; // Assuming the image is PNG
  };

  return (
    <View className='mt-5 mr-3'>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('SelectCrop', { cropId: item.id })
        }
      >
        <View
          className="flex justify-center items-center w-40 h-40 rounded-[10px] shadow-lg"
          style={{ backgroundColor: item.cropColor }}
        >
          <Image className="w-28 h-28" source={{ uri: formatImage(item.image) }} />
          <Text className="text-center text-lg pb-1">
            {
              lang==='si' ? item.sinhalaCropName
              : lang === 'ta' ? item.tamilCropName
              : item.cropName
            }
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default CropSelectCard;
