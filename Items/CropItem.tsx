import { View, FlatList } from 'react-native';
import React from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/component/types';
import CropSelectCard from './CropSelectCard';

interface CropData {
  id: string;
  cropName: string;
  cropColor: string;
  image: string;
}

interface CropItemProps {
  data: CropData[];
  navigation: StackNavigationProp<RootStackParamList, 'NewCrop'>;
}

const CropItem: React.FC<CropItemProps> = ({ data, navigation }) => {
  return (
    <View className="flex ml-10 mr-10 mt-3">
      <FlatList
        data={data}
        numColumns={2}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60, paddingTop: 20 }}
        columnWrapperStyle={{
          justifyContent: 'space-between',
        }}
        renderItem={({ item, index }) => (
          <CropSelectCard navigation={navigation} index={index} item={item} />
        )}
      />
    </View>
  );
};

export default CropItem;
