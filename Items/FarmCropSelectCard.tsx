import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import React from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/component/types';
import { encode } from 'base64-arraybuffer';

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
  navigation: StackNavigationProp<RootStackParamList, 'AddNewCrop'>;
  index: number;
  lang: string;
  selectedCrop: boolean;
  setSelectedCrop: React.Dispatch<React.SetStateAction<boolean>>;
  onCropSelect: (cropId: string) => void;
  isAllowed: boolean; // Add this prop
}

const FarmCropSelectCard: React.FC<FarmCropSelectCardProps> = ({ 
  item, 
  navigation, 
  lang, 
  index, 
  selectedCrop, 
  setSelectedCrop, 
  onCropSelect,
  isAllowed
}) => {

  const bufferToBase64 = (buffer: number[]): string => {
    const uint8Array = new Uint8Array(buffer);
    return encode(uint8Array.buffer);
  };

  const formatImage = (imageBuffer: { type: string; data: number[] }): string => {
    const base64String = bufferToBase64(imageBuffer.data);
    return `data:image/png;base64,${base64String}`;
  };

  const handlePress = () => {
    // Don't block the press here - let the parent handle validation
    // This allows all crops to be clickable
    setSelectedCrop(true);
    onCropSelect(item.id);
    console.log('FarmCropSelectCard', item.id);
  };

  return (
    <View className='mt-5 pl-6 pr-6 '>
      <TouchableOpacity
        onPress={handlePress}
        // Remove disabled prop - all crops are clickable
        style={{ opacity: 1 }} // Remove opacity change
      >
        <View
          className="flex justify-center items-center w-[100px] h-[100px] rounded-[10px] shadow-l p-1"
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
          <Text className="text-center text-[14px]">
            {
              lang === 'si' 
                ? (item.cropNameSinhala.length > 20 ? item.cropNameSinhala.slice(0, 30) + '...' : item.cropNameSinhala)
                : lang === 'ta' 
                  ? (item.cropNameTamil.length > 20 ? item.cropNameTamil.slice(0, 30) + '...' : item.cropNameTamil)
                  : (item.cropNameEnglish.length > 20 ? item.cropNameEnglish.slice(0, 30) + '...' : item.cropNameEnglish)
            }
          </Text>
          
          {/* Optional: Show a small badge for certificate-included crops */}
          {/* {isAllowed && (
            <View
              style={{
                position: 'absolute',
                top: 5,
                right: 5,
                backgroundColor: 'green',
                borderRadius: 10,
                width: 20,
                height: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 12, color: 'white' }}>✓</Text>
            </View>
          )} */}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default FarmCropSelectCard;