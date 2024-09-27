import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/component/types';

interface CropData {
  id: string;
  cropName: string;
  cropColor: string;
  image: string;
}

interface CropSelectCardProps {
  item: CropData;
  navigation: StackNavigationProp<RootStackParamList, 'NewCrop'>;
  index: number;
}

const CropSelectCard: React.FC<CropSelectCardProps> = ({ item, navigation }) => {
  return (
    <View className='mt-5 mr-3'>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('SelectCrop', { cropId: item.id } )
        }
      >
        <View
          className="flex justify-center items-center w-40 h-40 rounded-[10px] shadow-lg"
          style={{ backgroundColor: item.cropColor }}
        >
          <Image className="w-28 h-28" source={{ uri: item.image }} />
          <Text className="text-center text-lg pb-1">{item.cropName}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default CropSelectCard;
