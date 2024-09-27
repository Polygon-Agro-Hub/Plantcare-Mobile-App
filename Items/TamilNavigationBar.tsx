import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/component/types';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface NavigationbarProps {
  navigation: StackNavigationProp<RootStackParamList>; // Generalize to accept any navigation prop from RootStackParamList
}

const TamilNavigationBar: React.FC<NavigationbarProps> = ({ navigation }) => {
  return (
    <View className="flex-row justify-around bg-white border-t border-gray-300 shadow-lg pl-0">
      <TouchableOpacity onPress={() => navigation.navigate('TamilDashbord')}>
        <View className="flex items-center justify-center pt-0.5 pb-2 ">
          <Image source={require('../assets/images/Home.png')} 
          style={{width:48, height:48}}/>
          <Text className="text-green-500 mt-0">முகப்பு பக்கம்</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('TamilNewCrop')}>
        <View className="flex items-center justify-center pt-2 pb-2">
          <Image source={require('../assets/images/New Crop.png')} />
          <Text className="text-green-500 mt-1">புதிய பயிர்கள்</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('TamilMyCrop')}>
        <View className="flex items-center justify-center pt-2 pb-2">
          <Image source={require('../assets/images/Irrigation.png')} />
          <Text className="text-green-500 mt-1">என் சாகுபடி</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default TamilNavigationBar;
