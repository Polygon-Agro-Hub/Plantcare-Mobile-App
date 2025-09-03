import { View, FlatList } from 'react-native';
import React from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/component/types';
import CropSelectCard from './FarmCropSelectCard';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

interface CropData {
  id: string;
  cropNameEnglish: string;
  cropNameSinhala: string;
  cropNameTamil: string;
  bgColor: string;
  image: any;
}

interface FarmCropItemProps {
  data: CropData[];
  lang: string;
  navigation: StackNavigationProp<RootStackParamList, 'AddNewCrop'>;
  selectedCrop: boolean;
  setSelectedCrop: React.Dispatch<React.SetStateAction<boolean>>;
  onCropSelect: (cropId: string) => void;
}

const FarmCropItem: React.FC<FarmCropItemProps> = ({ data, navigation, lang, selectedCrop, setSelectedCrop, onCropSelect }) => {
  // Check if the last row will have only two items
  const isLastRowWithTwoItems = data.length % 3 === 2;

  return (
    <View style={{ paddingHorizontal: wp('5%'), paddingTop: wp('2%') }}>
      <FlatList
        data={data}
        numColumns={3}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: wp('15%') }}
        columnWrapperStyle={{
          justifyContent: isLastRowWithTwoItems ? 'flex-start' : 'space-between', 
          marginBottom: wp('3%'),
        }}
        renderItem={({ item, index }) => {
          const isLastRow = Math.floor(index / 3) === Math.floor(data.length / 3);
          const isSecondItemInLastRowWithTwoItems = isLastRowWithTwoItems && index % 3 === 2 && isLastRow;
          return (
          <View
            style={{
              width: wp('30%'), 
              aspectRatio: 1, 
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: wp('3%'), 
              marginLeft: isSecondItemInLastRowWithTwoItems ? wp('3%') : 0,
            }}
          >
            <CropSelectCard
              navigation={navigation as any}
              index={index}
              item={item}
              lang={lang}
              selectedCrop={selectedCrop}
              setSelectedCrop={setSelectedCrop}
              onCropSelect={onCropSelect}
              
            />
          </View>
          );
        }}
      />
    </View>
  );
};

export default FarmCropItem;
