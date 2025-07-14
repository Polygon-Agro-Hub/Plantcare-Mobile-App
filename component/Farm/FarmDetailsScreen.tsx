import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { selectFarmBasicDetails, selectFarmSecondDetails, resetFarm, setFarmSecondDetails } from '../../store/farmSlice';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

type FarmDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FarmDetailsScreen = () => {
  const navigation = useNavigation<FarmDetailsNavigationProp>();
  const dispatch = useDispatch();
  const farmBasicDetails = useSelector(selectFarmBasicDetails);
  const farmSecondDetails = useSelector(selectFarmSecondDetails); // Fixed: using the correct selector
  const [showMenu, setShowMenu] = useState(false);

  const images = [
    require('../../assets/images/Farm/1.webp'), // Adjusted path
    require('../../assets/images/Farm/2.webp'),
  ];

  const farmAssets = [
    {
      name: 'Carrot',
      progress: 60,
      image: require('../../assets/images/Farm/carrot.webp'),
    },
    {
      name: 'Bell Pepper',
      progress: 60,
      image: require('../../assets/images/Farm/bellpaper.webp'),
    },
    {
      name: 'Banana',
      progress: 60,
      image: require('../../assets/images/Farm/banana.webp'),
    },
  ];

  const handleEditFarm = () => {
    navigation.navigate('AddNewFarmBasicDetails');
    setShowMenu(false);
  };

  const handleDeleteFarm = () => {
    dispatch(resetFarm());
    navigation.goBack();
    setShowMenu(false);
  };

  const CircularProgress = ({ progress }: { progress: number }) => {
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <View className="w-12 h-12">
        <Svg width="48" height="48" viewBox="0 0 48 48">
          <Circle
            cx="24"
            cy="24"
            r={radius}
            fill="none"
            stroke="#E0E0E0"
            strokeWidth="4"
          />
          <Circle
            cx="24"
            cy="24"
            r={radius}
            fill="none"
            stroke="#10B981"
            strokeWidth="4"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 24 24)"
            strokeLinecap="round"
          />
          <SvgText
            x="24"
            y="28"
            textAnchor="middle"
            fontSize="10"
            fill="#10B981"
            fontWeight="600"
          >
            {progress}%
          </SvgText>
        </Svg>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor="#f9fafb"
      />

      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center justify-between ">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 mt-[-50]"
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>

        <View className="items-center">
          <Image
            source={images[farmBasicDetails?.selectedImage ?? 0]}
            className="w-20 h-20 rounded-full border-2 border-gray-200"
            resizeMode="cover"
            accessible
            accessibilityLabel={farmBasicDetails?.farmName || 'Farm image'}
          />
        </View>

        <View className="relative">
          <TouchableOpacity
            onPress={() => setShowMenu(!showMenu)}
            className="p-2 mt-[-50]"
            accessibilityLabel="Open menu"
            accessibilityRole="button"
          >
            <Ionicons name="ellipsis-vertical" size={24} color="#374151" />
          </TouchableOpacity>

          {showMenu && (
            <View className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 w-32 z-10">
              <TouchableOpacity
                onPress={handleEditFarm}
                className="px-4 py-2 flex-row items-center"
                accessibilityLabel="Edit farm"
                accessibilityRole="button"
              >
                <Ionicons name="create-outline" size={16} color="#374151" />
                <Text className="ml-2 text-sm text-gray-700">Edit Farm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDeleteFarm}
                className="px-4 py-2 flex-row items-center"
                accessibilityLabel="Delete farm"
                accessibilityRole="button"
              >
                <Ionicons name="trash-outline" size={16} color="#374151" />
                <Text className="ml-2 text-sm text-gray-700">Delete Farm</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        className="px-6 bg-white"
      >
        {/* Farm Info Section */}
        <View className="items-center mt-4">
          <Text className="font-bold text-xl text-gray-900">
            {farmBasicDetails?.farmName || 'Corn Field'}
          </Text>
          <View className="bg-blue-100 px-3 py-1 rounded-full mt-2">
            <Text className="text-blue-600 text-xs font-medium uppercase">BASIC</Text>
          </View>
          <Text className="text-gray-600 text-sm mt-2">
            {farmBasicDetails?.district || 'Hambanthota'}
          </Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-gray-600 text-sm">
              • {farmSecondDetails?.numberOfStaff || '2'} Managers
            </Text>
            <Text className="text-gray-600 text-sm ml-2">
              • {farmSecondDetails?.loginCredentialsNeeded || '4'} Other Staff
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-center mt-8 space-x-6">
          <TouchableOpacity
            className="bg-white p-4 rounded-xl items-center w-32 h-32 border border-[#445F4A33]"
            accessibilityLabel="View managers"
            accessibilityRole="button"
            onPress={() => navigation.navigate('ManagersScreen' as any)}
          >
            <View className="w-12 h-12 rounded-full items-center justify-center mb-2">
              <Image
                className="w-[55px] h-[55px]"
                source={require('../../assets/images/Farm/Managers.webp')}
              />
            </View>
            <Text className="text-black text-sm font-medium">Managers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white p-4 rounded-xl items-center w-32 h-32 border border-[#445F4A33]"
            accessibilityLabel="View farm assets"
            accessibilityRole="button"
            onPress={() => navigation.navigate('FarmAssetsScreen' as any)}
          >
            <View className="w-12 h-12 bg-purple-600 rounded-full items-center justify-center mb-2">
              <Image
                className="w-[55px] h-[55px]"
                source={require('../../assets/images/Farm/FarmAssets.webp')}
              />
            </View>
            <Text className="text-black text-sm font-medium">Farm Assets</Text>
          </TouchableOpacity>
        </View>

        {/* Farm Assets List */}
        <View className="mt-8">
          {farmAssets.length > 0 ? (
            farmAssets.map((asset, index) => (
              <View
                key={index}
                className="bg-white rounded-lg p-4 mb-4 border border-gray-100 shadow-sm flex-row items-center justify-between"
              >
                <View className="flex-row items-center flex-1">
                  <Image
                    source={asset.image}
                    className="w-12 h-12 mr-4 rounded-md"
                    resizeMode="contain"
                    accessible
                    accessibilityLabel={`${asset.name} image`}
                  />
                  <Text className="text-base font-medium text-gray-900">{asset.name}</Text>
                </View>
                <CircularProgress progress={asset.progress} />
              </View>
            ))
          ) : (
            <Text className="text-gray-500 text-center">No assets available</Text>
          )}
        </View>

        {/* Add New Asset Button */}
<TouchableOpacity
  className="bg-gray-800 w-16 h-16 rounded-full items-center justify-center  ml-[77%] shadow-lg"
  onPress={() => navigation.navigate('AddNewAssetScreen' as any)}
  accessibilityLabel="Add new asset"
  accessibilityRole="button"
>
  <Ionicons name="add" size={28} color="white" />
</TouchableOpacity>
      </ScrollView>

      {/* Backdrop for menu */}
      {showMenu && (
        <TouchableOpacity
          className="absolute inset-0 bg-black/20"
          onPress={() => setShowMenu(false)}
          activeOpacity={1}
          accessibilityLabel="Close menu"
          accessibilityRole="button"
        />
      )}
    </SafeAreaView>
  );
};

export default FarmDetailsScreen;