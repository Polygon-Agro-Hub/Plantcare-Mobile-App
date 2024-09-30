import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { RootStackParamList } from './types';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import NavigationBar from '@/Items/NavigationBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { environment } from '@/environment/environment';
import AntDesign from 'react-native-vector-icons/AntDesign';

type RemoveAssetNavigationProp = StackNavigationProp<RootStackParamList, 'RemoveAsset'>;

interface RemoveAssetProps {
    navigation: RemoveAssetNavigationProp;
}

const RemoveAsset: React.FC<RemoveAssetProps> = ({ navigation }) => {
    const [category, setCategory] = useState('Select Category');
    const [assetId, setAssetId] = useState(''); // State for asset ID
    const [asset, setAsset] = useState('');
    const [brand, setBrand] = useState('');
    const [batchNum, setBatchNum] = useState('');
    const [volume, setVolume] = useState('');
    const [unit, setUnit] = useState('ml');
    const [numberOfUnits, setNumberOfUnits] = useState('');
    const [unitPrice, setUnitPrice] = useState('');
    const [totalPrice, setTotalPrice] = useState('');
    const [assets, setAssets] = useState<{ id: string; asset: string }[]>([]); // Array of objects with asset ID and name

    useEffect(() => {
        if (numberOfUnits && unitPrice) {
            const total = parseFloat(numberOfUnits) * parseFloat(unitPrice);
            setTotalPrice(total.toString());
        }
    }, [numberOfUnits, unitPrice]);

    const fetchAssets = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'No token found');
                return;
            }

            const response = await axios.get(
                `${environment.API_BASE_URL}api/auth/assets`, // API endpoint
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    params: { category } // Send category as a query parameter
                }
            );

            // Access the 'assets' field from the response data
            const fetchedAssets = response.data.assets;
            // Set the assets state with objects containing asset ID and name
            setAssets(fetchedAssets);
        } catch (error) {
            console.error('Error fetching assets:', error);
        }
    };

    useEffect(() => {
        if (category !== 'Select Category') {
            fetchAssets();
        }
    }, [category]);

    const handleRemoveAsset = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'No token found');
                return;
            }

            const response = await axios.delete(
                `${environment.API_BASE_URL}api/auth/removeAsset/${category}/${assetId}`, // Use assetId here
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    data: {
                        //volume,      // Dynamically taken from the form input
                        numberOfUnits,   // Dynamically taken from the form input
                        totalPrice        // Dynamically taken from the form input
                    }
                }
            );
            console.log(volume,numberOfUnits,totalPrice)

            console.log('Asset removed successfully:', response.data);
            Alert.alert('Asset removed successfully!');
            navigation.navigate('CurrentAssert')
        } catch (error) {
            console.error('Error removing asset:', error);
            Alert.alert('Error removing asset.');
        }
    };

    return (
        <ScrollView className="flex-1 bg-white ">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-4">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                <AntDesign name="left" size={24} color="#000502" style={{paddingTop:5}} onPress={() => navigation.goBack()} />
        
                </TouchableOpacity>
                <Text className="text-lg mr-[40%] font-bold">My Assets</Text>
            </View>

            {/* Tabs */}
            <View className='flex-row ml-8 mr-8 mt-8 justify-center'>
                <View className='w-1/2'>
                    <TouchableOpacity onPress={() => navigation.navigate('CurrentAssert')}>
                        <Text className=' text-green-400 text-center text-lg'>Current Assets</Text>
                        <View className="border-t-[2px] border-green-400" />
                    </TouchableOpacity>
                </View>
                <View className='w-1/2'>
                    <TouchableOpacity >
                        <Text className='text-gray-400 text-center text-lg'>Fixed Assets</Text>
                        <View className="border-t-[2px] border-gray-400" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Input Fields */}
            <View className="space-y-4 p-8">
                <View className="">
                    <Text className="text-gray-600 mb-2">Select Category</Text>
                    <View className='bg-gray-200 rounded-[30px]'>
                        <Picker
                            selectedValue={category}
                            onValueChange={(itemValue) => {
                                setCategory(itemValue);
                                setAssetId(''); // Reset assetId when category changes
                                if (itemValue !== 'Other Consumables') {
                                    setAsset('');
                                }
                            }}
                            className="bg-gray-200 rounded"
                        >
                            <Picker.Item label="Select Category" value="Select Category" />
                            <Picker.Item label="Agro Chemicals" value="Agro Chemicals" />
                            <Picker.Item label="Fertilizer" value="Fertilizer" />
                            <Picker.Item label="Seed and Seedlings" value="Seed and Seedlings" />
                            <Picker.Item label="Livestock for Sale" value="Livestock for Sale" />
                            <Picker.Item label="Animal Feed" value="Animal Feed" />
                            <Picker.Item label="Other Consumables" value="Other Consumables" />
                        </Picker>
                    </View>

                    <Text className="text-gray-600 mt-4 mb-2">Asset</Text>
                    <View className='bg-gray-200 rounded-[30px]'>
                    <Picker
                            selectedValue={asset}
                            onValueChange={(itemValue) => {
                                const selectedAsset = assets.find((assetItem) => assetItem.asset === itemValue);
                                if (selectedAsset) {
                                    setAsset(selectedAsset.asset);  // Update the asset
                                    setAssetId(selectedAsset.id);   // Correctly set the assetId
                                } else {
                                    setAsset('');
                                    setAssetId('');  // Clear assetId when no valid asset is selected
                                }
                            }}
                            className="bg-gray-200 rounded"
                        >
                            <Picker.Item label="Select Asset" value="" />
                            {assets.map((assetItem, index) => (
                                <Picker.Item key={index} label={assetItem.asset} value={assetItem.asset} />
                            ))}
                        </Picker>

                    </View>
                </View>

                <Text className="text-gray-600">Brand</Text>
                <TextInput
                    placeholder="Brand"
                    value={brand}
                    onChangeText={setBrand}
                    className="bg-gray-200 p-2 rounded-[30px] h-[50px]"
                />

                <Text className="text-gray-600">Batch Number</Text>
                <TextInput
                    placeholder="Batch Number"
                    value={batchNum}
                    onChangeText={setBatchNum}
                    className="bg-gray-200 p-2 rounded-[30px] h-[50px]"
                />

                <Text className="text-gray-600 ">Unit Volume / Weight</Text>
                <View className="flex-row items-center justify-between bg-white">
                    <TextInput
                        placeholder="Unit Volume / Weight"
                        value={volume}
                        onChangeText={setVolume}
                        keyboardType="numeric"
                        className="flex-[2] mr-2 py-2 px-4 h-[55px] bg-gray-200 rounded-[10px]"
                    />

                    <View className="bg-gray-200 rounded-[10px]  flex-1">
                        <Picker
                            selectedValue={unit}
                            onValueChange={(itemValue) => setUnit(itemValue)}
                            className="flex-1"
                            dropdownIconColor="gray"
                        >
                            <Picker.Item label="ml" value="ml" />
                            <Picker.Item label="kg" value="kg" />
                        </Picker>
                    </View>
                </View>

                <Text className="text-gray-600">Number of Units</Text>
                <TextInput
                    placeholder="Number of Units"
                    value={numberOfUnits}
                    onChangeText={setNumberOfUnits}
                    keyboardType="numeric"
                    className="bg-gray-200 p-2 mt-5 rounded-[30px] h-[50px]"
                />

                <Text className="text-gray-600">Unit Price</Text>
                <TextInput
                    placeholder="Unit Price"
                    value={unitPrice}
                    onChangeText={setUnitPrice}
                    keyboardType="numeric"
                    className="bg-gray-200 p-2 rounded-[30px] h-[50px]"
                />

                <Text className="text-gray-600">Total Price</Text>
                <TextInput
                    placeholder="Total Price"
                    value={totalPrice}
                    editable={false}
                    className="bg-gray-200 p-2 rounded-[30px] h-[50px]"
                />

                <TouchableOpacity onPress={handleRemoveAsset} className="bg-green-400 p-4 rounded-[30px] mt-8">
                    <Text className="text-white text-center">Remove Asset</Text>
                </TouchableOpacity>
            </View>

            <NavigationBar navigation={navigation} />
        </ScrollView>
    );
};

export default RemoveAsset;
