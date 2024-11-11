import { View, FlatList } from 'react-native';
import React, { useState } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/component/types';
import CropSelectCard from './CropSelectCard';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

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
    <View style={{ paddingHorizontal: wp('4%'), paddingTop: wp('2%') }}>
      <FlatList
        data={data}
        numColumns={2}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: wp('15%'),alignItems: 'center'  }}
        columnWrapperStyle={{
          justifyContent: 'space-between',
          marginBottom: wp('3%'), 
          flexWrap: 'wrap',
        }}
        renderItem={({ item, index}) => (
          
         <View style={{ width: wp('45%'), minWidth: 150,maxWidth: 200, marginBottom: wp('5%'),alignSelf: 'center', }}> 
            <CropSelectCard
              navigation={navigation}
              index={index}
              item={item}
              lang={lang}
            />
          </View>
        )}
      />
    </View>
  );
};

export default CropItem;
