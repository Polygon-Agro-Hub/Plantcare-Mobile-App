import { View, Text, Dimensions, Image, ActivityIndicator, SafeAreaView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { PieChart } from 'react-native-chart-kit';
import axios from 'axios';
import NavigationBar from '@/Items/NavigationBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { environment } from '@/environment/environment';

interface Asset {
  assetType: string;
  totalValue: number;
}

type CurrentAssetNavigationProp = StackNavigationProp<RootStackParamList, 'CurrentAssert'>;

interface CurrentAssetProps {
  navigation: CurrentAssetNavigationProp;
}

// Import the icons
const icon = require('../assets/images/icon.png');
const icon2 = require('../assets/images/icon2.png');
const icon3 = require('../assets/images/icon3.png');
const icon4 = require('../assets/images/icon4.png');
const icon5 = require('../assets/images/icon5.png');
const icon6 = require('../assets/images/icon6.png');
const icon7 = require('../assets/images/icon7.png');

const CurrentAssert: React.FC<CurrentAssetProps> = ({ navigation }) => {
  const [assetData, setAssetData] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  // Function to get the auth token
  const getAuthToken = async () => {
    const token = await AsyncStorage.getItem('userToken');
    return token;
  };

  // Function to fetch current assets from the backend
  const fetchCurrentAssets = async () => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${environment.API_BASE_URL}api/auth/currentAsset`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);

      // setAssetData(response.data.categories);
      setAssetData([
        {
          "assetType": "Cash",
          "totalValue": 2000
        },
        {
          "assetType": "Receivables",
          "totalValue": 2500
        },
        {
          "assetType": "Inventory",
          "totalValue": 2800
        },
      ])
      setLoading(false);
    } catch (error) {
      console.error('Error fetching assets:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchCurrentAssets();
    }
  }, [isFocused]);

  // Function to handle adding a new asset value
  const handleAddAsset = async (assetType: string, amount: number) => {
    try {
      const token = await getAuthToken();
      const response = await axios.post(
        `${environment.API_BASE_URL}api/auth/addCurrentAsset`,
        { assetType, value: amount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update asset data in state
      setAssetData((prevData) => {
        return prevData.map((asset) =>
          asset.assetType === assetType
            ? { ...asset, totalValue: response.data.updatedValue }
            : asset
        );
      });
    } catch (error) {
      console.error('Error adding asset:', error);
    }
  };

  // Get the color for the pie chart slice based on the asset type
  const getColorByAssetType = (assetType: string) => {
    switch (assetType) {
      case 'Cash':
        return '#26D041';
      case 'Receivables':
        return '#105ad2';
      case 'Inventory':
        return '#d21c10';
      case 'Prepaid Expenses':
        return '#733e9a';
      case 'Marketable Securities':
        return '#1ddcce';
      case 'Biological Assets':
        return '#ddc309';
      case 'Other':
        return '#dd09c7';
      default:
        return '#000000';
    }
  };

  // Create pie data for the PieChart
  const pieData = assetData.map((asset) => ({
    name: asset.assetType,
    population: Number(asset.totalValue), // Ensure this is a number
    color: getColorByAssetType(asset.assetType),
    legendFontColor: '#7F7F7F',
    legendFontSize: 12,
  }));

  // Check if loading
  if (loading) {
    return (
      <View className='flex-1 justify-center items-center'>
        <ActivityIndicator size="large" color="#00ff00" />
        <Text>Loading assets...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className='flex-1'>
      <View className='flex-row mt-[5%]'>
        <AntDesign name="left" size={24} color="#000502" onPress={() => navigation.goBack()} />
        <Text className='font-bold text-xl pl-[30%] pt-0 text-center'>My Assets</Text>
      </View>

      <View>
        <View className='flex-row ml-8 mr-8 mt-8 justify-center'>
          <View className='w-1/2'>
            <TouchableOpacity>
              <Text className='text-green-400 text-center text-lg'>Current Assets</Text>
              <View className="border-t-[2px] border-green-400" />
            </TouchableOpacity>
          </View>
          <View className='w-1/2'>
            <TouchableOpacity onPress={() => navigation.navigate('fixedDashboard')}>
              <Text className='text-gray-400 text-center text-lg'>Fixed Assets</Text>
              <View className="border-t-[2px] border-gray-400" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="bg-white rounded-lg mt-[10px] mx-[5%] mb-4">
          <PieChart
            data={pieData}
            width={Dimensions.get('window').width - 32}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              propsForLabels: {
                fontSize: 12,
                fontWeight: 'bold',
              },
            }}
            accessor="population" // This field should match your data
            backgroundColor="transparent"
            paddingLeft="15"
          />
        </View>

        <View className='flex-row justify-between mx-[30px]'>
          <TouchableOpacity className='bg-green-400 w-[150px] h-[30px]' onPress={() => navigation.navigate('AddAsset')}>
            <Text className='text-white text-center text-base'>ADD ASSET</Text>
          </TouchableOpacity>
          <TouchableOpacity className='bg-red-500 w-[150px] h-[30px]' onPress={() => navigation.navigate('RemoveAsset')}>
            <Text className='text-white text-center text-base'>REMOVE ASSET</Text>
          </TouchableOpacity>
        </View>

        {/* Cards displaying the total amount of each asset type */}
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }} className='h-[50%]'>
          <View className='items-center pt-[5%] gap-y-3'>
            {assetData.map((asset, index) => (
              <View key={index} className='bg-white w-[90%] flex-row h-[60px] rounded-md justify-between items-center px-4 '>
                <View className='flex-row items-center'>
                  <Image source={getIconByAssetType(asset.assetType)} className='w-[24px] h-[24px] mr-2' />
                  <Text>{asset.assetType}</Text>
                </View>
                <View>
                  <Text>Rs. {asset.totalValue}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <View className="absolute bottom-0 left-0 right-0">
        <NavigationBar navigation={navigation} />
      </View>

    </SafeAreaView>
  );
};

// Function to return icon based on asset type
const getIconByAssetType = (assetType: string) => {
  switch (assetType) {
    case 'Cash':
      return icon;
    case 'Receivables':
      return icon2;
    case 'Inventory':
      return icon3;
    case 'Prepaid Expenses':
      return icon4;
    case 'Marketable Securities':
      return icon5;
    case 'Biological Assets':
      return icon6;
    case 'Other':
      return icon7;
    default:
      return icon; // Default icon
  }
};

export default CurrentAssert;
