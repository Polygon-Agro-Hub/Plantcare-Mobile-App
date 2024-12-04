import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/component/types';
import { encode } from 'base64-arraybuffer';
import CropVariety from './CropVariety';

interface CropData {
  id: string;
    cropNameEnglish: string;
    cropNameSinhala:string
    cropNameTamil:string
    bgColor: string;
  image: { type: string; data: number[] };
}

interface CropSelectCardProps {
  item: CropData;
  navigation: StackNavigationProp<RootStackParamList, 'NewCrop'>;
  index: number;
  lang: string;
  selectedCrop: boolean;
  setSelectedCrop: React.Dispatch<React.SetStateAction<boolean>>;
  onCropSelect: (cropId: string) => void;
}

const CropSelectCard: React.FC<CropSelectCardProps> = ({ item, navigation, lang, index , selectedCrop, setSelectedCrop, onCropSelect}) => {


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
    <View className='mt-5 pl-6 pr-6 '>
             <TouchableOpacity
          onPress={() => {
            setSelectedCrop(true);
            onCropSelect(item.id);
            console.log('CropSelectCard', item.id);
          }} >
        <View
          className="flex justify-center items-center w-[100px] h-[100px] rounded-[10px] shadow-l p-1"
          style={{ backgroundColor: item.bgColor }}
          
        >
          <Image className="w-[75px] h-[75px] -mb-3 " source={{ uri: formatImage(item.image) }} resizeMode="contain" />
          <Text className="text-center text-[14px] pb-4 pt-1">
            {
              lang==='si' ? item.cropNameSinhala
              : lang === 'ta' ? item.cropNameTamil
              : item.cropNameEnglish
            }
          </Text>
        </View>
        
      </TouchableOpacity>
    </View>
  );
};

export default CropSelectCard;
