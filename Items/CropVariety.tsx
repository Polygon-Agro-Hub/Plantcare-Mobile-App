import { View, FlatList, Text } from 'react-native';
import React from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/component/types';
import CropVarietySelectCard from './CropVarietySelectCard';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

interface VarietyData {
  cropGroupId: string;
  id: string;
  varietyNameEnglish: string;
  varietyNameSinhala: string;
  varietyNameTamil: string;
  bgColor: string;
  image: any;
}

interface CropItemProps {
  data: VarietyData[];
  lang: string;
  navigation: StackNavigationProp<RootStackParamList, 'NewCrop'>;
  selectedCrop: boolean;
 
}

const CropItem: React.FC<CropItemProps> = ({ data, navigation, lang, selectedCrop }) => {
  const isLastRowWithTwoItems = data.length % 3 === 2;

  return (
    <View style={{ paddingHorizontal: wp('5%'), paddingTop: wp('2%') }}>
      <FlatList
        data={data}
        numColumns={3} // Display 3 columns
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: wp('15%') }}
        columnWrapperStyle={{
          justifyContent: isLastRowWithTwoItems ? 'flex-start' : 'space-between',
          marginBottom: wp('3%'),
        }}
        renderItem={({ item, index }) => {
          const isLastRow = Math.floor(index / 3) === Math.floor(data.length / 3);
          const isSecondItemInLastRowWithTwoItems = isLastRowWithTwoItems && index % 3 === 1 && isLastRow;

          return (
            <View
              style={{
                width: wp('28%'), // Adjust width to fit 3 items per row
                aspectRatio: 1, // Ensures the card is square
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: wp('3%'),
                marginLeft: isSecondItemInLastRowWithTwoItems ? wp('3%') : 0, // Apply margin only to the second item in the last row
              }}
            >
              
              <CropVarietySelectCard
                navigation={navigation}
                index={index}
                item={item}
                lang={lang}
                selectedCrop={selectedCrop}
              />
            </View>
          );
        }}
      />
    </View>
  );
};

export default CropItem;
