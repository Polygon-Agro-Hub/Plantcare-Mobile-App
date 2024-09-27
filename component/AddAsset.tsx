import { View, Text, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { AntDesign } from '@expo/vector-icons';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import DropdownPicker from 'react-native-dropdown-picker';
import NavigationBar from '@/Items/NavigationBar';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { environment } from "@/environment/environment";

type AddAssetNavigationProp = StackNavigationProp<RootStackParamList, 'AddAsset'>;

interface AddAssetProps {
    navigation: AddAssetNavigationProp;
}

const AddAsset: React.FC<AddAssetProps> = ({ navigation }) => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<string | null>(null);
    const [items, setItems] = useState([
        { label: 'Cash', value: 'Cash' },
        { label: 'Receivables', value: 'Receivables' },
        { label: 'Inventory', value: 'Inventory' },
        { label: 'Prepaid', value: 'Prepaid Expenses' },
        { label: 'Biological Assets', value: 'Biological Assets' },
        { label: 'Other', value: 'Other' },
        
    ]);
    const [assetName, setAssetName] = useState('');
    const [assetValue, setAssetValue] = useState('');

    const handleAddAsset = async () => {
        if (!value || !assetName || !assetValue) {
            Alert.alert('Error', 'All required fields must be provided.');
            return;
        }

        try {
            const response = await fetch(`${environment.API_BASE_URL}api/auth/currentAsset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await AsyncStorage.getItem('userToken')}`,

                },
                body: JSON.stringify({
                    assetType: value,
                    assetName,
                    value: assetValue,
                }),
            });

            const result = await response.json();

            if (response.status === 400 && result.message === 'Asset name already exists. Please choose a different name.') {
                Alert.alert('Error', result.message);
            } else if (response.status === 201) {
                Alert.alert('Success', 'Current asset added successfully.');
                navigation.goBack();
            } else {
                Alert.alert('Error', result.message || 'Something went wrong.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to add asset. Please try again later.');
        }
    };

    return (
        <View className='flex-1 bg-white'>
            <View className='flex-row mt-[5%] items-center px-4'>
                <AntDesign name="left" size={24} color="#000502" onPress={() => navigation.goBack()} />
                <Text className='font-bold text-xl pl-[3%] text-center flex-1'>My Assets</Text>
            </View>

            <View className='flex-1'>
                <View className='flex-row ml-8 mr-8 mt-8 justify-center'>
                    <View className='w-1/2'>
                        <TouchableOpacity>
                            <Text className='text-green-400 text-center text-lg'>Current Assets</Text>
                            <View className="border-t-[2px] border-green-400" />
                        </TouchableOpacity>
                    </View>
                    <View className='w-1/2'>
                        <TouchableOpacity>
                            <Text className='text-gray-400 text-center text-lg'>Fixed Assets</Text>
                            <View className="border-t-[2px] border-gray-400" />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView className='flex-1 px-8 mt-4' contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }}>
                    <View>
                        <Text className='pt-5 pl-[3%] pb-[3%] font-bold'>Select Current Asset type</Text>
                        <DropdownPicker
                            open={open}
                            value={value}
                            items={items}
                            setOpen={setOpen}
                            setValue={setValue}
                            setItems={setItems}
                            placeholder="Select an asset type"
                            containerStyle={{ marginBottom: 16 }}
                            style={{ borderColor: 'gray', borderWidth: 1, borderRadius: 10 }}
                            placeholderStyle={{ color: '#2E2E2E' }}
                        />
                        <Text className='pt-5 pl-[3%] pb-[3%] font-bold'>Asset Name</Text>
                        <TextInput
                            className="h-12 border border-gray-300 mb-5 text-base px-4 rounded-2xl"
                            placeholder="Enter asset name"
                            value={assetName}
                            onChangeText={setAssetName}
                            placeholderTextColor="#2E2E2E"
                        />
                        <Text className='pt-5 pl-[3%] pb-[3%] font-bold'>Value</Text>
                        <TextInput
                            className="h-12 border border-gray-300 mb-5 text-base px-4 rounded-2xl"
                            placeholder="Enter asset value"
                            value={assetValue}
                            onChangeText={setAssetValue}
                            keyboardType="numeric"
                            placeholderTextColor="#2E2E2E"
                        />
                    </View>

                    <View className='flex-1 items-center pt-10 '>
                        <TouchableOpacity 
                            className="bg-green-400 pt-[10px] rounded-3xl mb-6 h-13 w-60" 
                            onPress={handleAddAsset}
                        >
                            <Text className="text-white text-lg text-center pb-3">Add asset</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>

            <NavigationBar navigation={navigation} />
        </View>
    );
}

export default AddAsset;
