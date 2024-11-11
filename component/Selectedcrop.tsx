import { View, Text, Image, ScrollView } from 'react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';

const car = require('../assets/images/carrots.png');
//-------------------WRONG ONE----------------------------

type SelectedcropNavigationProp = StackNavigationProp<RootStackParamList, 'Selectedcrop'>;

interface SelectedcropProps {
  navigation: SelectedcropNavigationProp;
}

const Selectedcrop: React.FC<SelectedcropProps> = ({ navigation }) => {
  return (
    <View className="flex-1 pt-5  bg-white">
        <AntDesign name="left" size={24} color="#000502" onPress={()=>navigation.navigate('SigninSelection')}/>
        <Text className="text-2xl text-center font-bold pb-10">Carrots</Text>
      <View className="pt-10 items-center">
      
        
        <Image source={car} className="pb-1 " />
      </View>
      <View className="flex-1 pt-0 px-4">
        <Text className='font-bold text-lg mb-4'>Description</Text>
       <View className='h-[340px] pb-[5%] pt-0'>
        <ScrollView >
          <Text className="text-base leading-relaxed">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of
            type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s
            with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer 
            took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially 
            unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently
            with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
          </Text>
          
        </ScrollView>
        </View> 
      </View>
      <TouchableOpacity className="bg-[#26D041] p-4  mx-4 mb-4 items-center  bottom-0 left-0 right-0" onPress={()=>navigation.navigate('News' as any)}>
        <Text className='items-center text-white text-xl'>Enrolllll</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Selectedcrop;
