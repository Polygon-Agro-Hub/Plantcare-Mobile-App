import React, { useState, useEffect, useCallback } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/component/types';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage for state persistence
import { useFocusEffect, useNavigationState } from '@react-navigation/native'; // Import navigation state

interface NavigationbarProps {
  navigation: StackNavigationProp<RootStackParamList>;
}

const NavigationBar: React.FC<NavigationbarProps> = ({ navigation }) => {
  const { t } = useTranslation();

  // Add state to track which tab is clicked
  const [activeTab, setActiveTab] = useState<string>('Dashboard');

  // Load the active tab from local storage and update based on current screen when the app mounts
  useEffect(() => {
    const loadActiveTab = async () => {
      const storedTab = await AsyncStorage.getItem('activeTab');
      const currentRoute = navigation.getState().routes[navigation.getState().index].name;

      // If there's no stored tab or stored tab doesn't match the current route, update it
      if (!storedTab || storedTab !== currentRoute) {
        setActiveTab(currentRoute);
        await AsyncStorage.setItem('activeTab', currentRoute); // Sync activeTab with current route
      } else {
        setActiveTab(storedTab); // If stored tab matches current route, use it
      }
    };
    loadActiveTab();
  }, []);

  // Ensure the correct tab is active when the screen regains focus
  useFocusEffect(
    useCallback(() => {
      const loadActiveTab = async () => {
        const currentRoute = navigation.getState().routes[navigation.getState().index].name;
        setActiveTab(currentRoute);
        await AsyncStorage.setItem('activeTab', currentRoute); // Sync the tab with current route when screen is focused
      };
      loadActiveTab();
    }, [])
  );

  // Function to handle tab change and save to local storage
  const handleTabPress = async (tabName: string) => {
    setActiveTab(tabName);
    await AsyncStorage.setItem('activeTab', tabName);
    navigation.navigate(tabName as any);
  };

  return (
    <View className="flex-row justify-around bg-white border-t border-gray-300 shadow-lg">
      {/* Dashboard Button */}
      <TouchableOpacity onPress={() => handleTabPress('Dashboard')}>
        <View className="flex items-center justify-center pt-0.5 pb-2">
          <Image
            source={
              activeTab === 'Dashboard'
                ? require('../assets/images/HomeClick.png') // Clicked version
                : require('../assets/images/Home.png') // Default version
            }
            style={{ width: 48, height: 48 }}
            resizeMode="contain"
          />
          <Text className="text-green-500 mt-0 pt-0">{t('navbar.home')}</Text>
        </View>
      </TouchableOpacity>

      {/* NewCrop Button */}
      <TouchableOpacity onPress={() => handleTabPress('NewCrop')}>
        <View className="flex items-center justify-center pt-2 pb-2 pl-5">
          <Image
            source={
              activeTab === 'NewCrop'
                ? require('../assets/images/NewCropClick.png') // Clicked version
                : require('../assets/images/New Crop.png') // Default version
            }
            resizeMode="contain"
          />
          <Text className="text-green-500 mt-1">{t('navbar.newcrop')}</Text>
        </View>
      </TouchableOpacity>

      {/* MyCrop Button */}
      <TouchableOpacity onPress={() => handleTabPress('MyCrop')}>
        <View className="flex items-center justify-center pt-2 pb-2">
          <Image
            source={
              activeTab === 'MyCrop'
                ? require('../assets/images/IrrigationClick.png') // Clicked version
                : require('../assets/images/Irrigation.png') // Default version
            }
            resizeMode="contain"
          />
          <Text className="text-green-500 mt-1">{t('navbar.mycultivation')}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default NavigationBar;

