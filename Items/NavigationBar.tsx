import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/component/types';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface NavigationbarProps {
  navigation: StackNavigationProp<RootStackParamList>; // Generalize to accept any navigation prop from RootStackParamList
}


const NavigationBar: React.FC<NavigationbarProps> = ({ navigation }) => {
  const {t}=useTranslation();

  return (
    <View className="flex-row justify-around bg-white border-t border-gray-300 shadow-lg">
      <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
        <View className="flex items-center justify-center pt-0.5 pb-2">
          <Image source={require('../assets/images/Home.png')} 
           style={{ width: 48, height: 48 }}/>
          <Text className="text-green-500 mt-0 pt-0">{t('navbar.home')}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('NewCrop')}>
        <View className="flex items-center justify-center pt-2 pb-2 pl-9">
          <Image source={require('../assets/images/New Crop.png')} />
          <Text className="text-green-500 mt-1">{t('navbar.newcrop')}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('MyCrop')}>
        <View className="flex items-center justify-center pt-2 pb-2">
          <Image source={require('../assets/images/Irrigation.png')} />
          <Text className="text-green-500 mt-1">{t('navbar.mycultivation')}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default NavigationBar;
