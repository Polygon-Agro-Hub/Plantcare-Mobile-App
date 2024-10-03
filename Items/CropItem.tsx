import { View, FlatList } from 'react-native';
import React, { useState } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/component/types';
import CropSelectCard from './CropSelectCard';

interface CropData {
  id: string;
  cropName: string;
  sinhalaCropName:string
  tamilCropName:string
  cropColor: string;
  image: any;
}

interface CropItemProps {
  data: CropData[];
  lang:string
  navigation: StackNavigationProp<RootStackParamList, 'NewCrop'>;
}

const CropItem: React.FC<CropItemProps> = ({ data, navigation ,lang}) => {
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
        renderItem={({ item, index}) => (
          <CropSelectCard navigation={navigation} index={index} item={item} lang={lang}/>
        )}
      />
    </View>
  );
};

export default CropItem;
