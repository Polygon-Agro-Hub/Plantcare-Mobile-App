import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Modal from 'react-native-modal';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { environment } from '@/environment/environment';

type AssertsFixedViewNavigationProp = StackNavigationProp<RootStackParamList, 'AssertsFixedView'>

interface CurentAsssetProps {
    navigation: AssertsFixedViewNavigationProp;
}

// Define a TypeScript interface for a tool
interface Tool {
    id: number;
    userId: number;
    tool: string;
    toolType: string;
    brandName: string;
    purchaseDate: string; // Assuming date is returned as a string in ISO format
    unit: string;
    price: string; // price is returned as a string
    warranty?: string;
    expireDate?: string; // Assuming date is returned as a string in ISO format
    depreciation?: number;
    warrantyStatus: string;
}

// Define the interface for the API response
interface ApiResponse {
    status: string;
    message?: string;
    fixedAssets: Tool[]; // Changed from `data` to `fixedAssets`
}

const AssertsFixedView: React.FC<CurentAsssetProps> = ({ navigation }) => {
    const [isModalVisible, setModalVisible] = useState(false);
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    useEffect(() => {
        const fetchTools = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                const response = await axios.get<ApiResponse>(`${environment.API_BASE_URL}api/auth/fixedassets`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                console.log('Fetched data:', response.data); // Log the fetched data for inspection

                if (response.data.status === 'success') {
                    setTools(Array.isArray(response.data.fixedAssets) ? response.data.fixedAssets : []);
                } else {
                    console.error('Failed to fetch tools:', response.data.message);
                    setTools([]); // Set tools to an empty array if the response status is not 'success'
                }
            } catch (error) {
                console.error('Error fetching tools:', error);
                setTools([]); // Set tools to an empty array in case of an error
            } finally {
                setLoading(false);
            }
        };

        fetchTools();
    }, []);

    return (
        <SafeAreaView>
            <StatusBar style='light' />

            <View className='flex-row items-center justify-between px-4 mt-[5%]'>
                <View>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back-outline" size={30} color="gray" />
                    </TouchableOpacity>
                </View>
                <View className='flex-1 items-center'>
                    <Text className='text-black text-xl font-bold'>My Assets</Text>
                </View>
            </View>

            <View className='flex-row ml-8 mr-8 mt-8 justify-center'>
                <View className='w-1/2'>
                    <TouchableOpacity onPress={() => navigation.navigate('CurrentAssert')}>
                        <Text className='text-gray-400 text-center text-lg'>Current Asserts</Text>
                        <View className="border-t-[2px] border-gray-400" />
                    </TouchableOpacity>
                </View>
                <View className='w-1/2'>
                    <TouchableOpacity>
                        <Text className='text-green-400 text-center text-lg'>Fixed Asserts</Text>
                        <View className="border-t-[2px] border-green-400" />
                    </TouchableOpacity>
                </View>
            </View>

            <View className='items-center'>
                <View className='flex-row justify-between items-center w-full px-4 pt-10'>
                    <View className='flex-1 items-center'>
                        <Text className='text-base font-medium'>Total Tools</Text>
                    </View>
                    <TouchableOpacity onPress={toggleModal}>
                        <SimpleLineIcons name="options-vertical" size={16} color="black" />
                    </TouchableOpacity>
                </View>

                <ScrollView>
                    <View className='items-center pb-[10%]'>
                        <Text className='font-bold text-2xl pt-5 pb-4'>RS. 60,000</Text>
                        <TouchableOpacity
                            className='bg-green-500 rounded-xl w-[330px] items-center h-[50px] flex-row justify-between'
                            onPress={() => navigation.navigate('AddFixedAsset')}
                        >
                            <Text className='text-white font-bold text-xl ml-5'>Add New Tool</Text>
                            <AntDesign name="plussquare" size={26} color="white" style={{ marginRight: 10 }} />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <Text>Loading...</Text>
                    ) : (
                        tools.length > 0 ? (
                            tools.map((tool) => (
                                <View key={tool.id} className='flex-row items-center rounded-lg mb-5 border-[1px] shadow-md'>
                                    <View className='bg-white rounded-xl w-[330px] h-[70px] flex-row justify-between items-center pr-3'>
                                        <View className='pl-10'>
                                            <Text className='font-bold text-xl'>{tool.tool}</Text>
                                            <Text>{tool.toolType}</Text>
                                        </View>
                                        <View>
                                            <Text className='font-bold text-base'>RS {tool.price}</Text>
                                        </View>
                                        <View>
                                            <AntDesign name="edit" size={20} color="#000502" />
                                        </View>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text>No tools available</Text>
                        )
                    )}
                </ScrollView>

            </View>

            <Modal isVisible={isModalVisible} onBackdropPress={toggleModal} style={{ margin: 0 }}>
                <View style={{
                    position: 'absolute',
                    top: 110, // Adjust this value based on the position of your icon
                    right: 15, // Adjust this value to match the alignment of the icon
                    backgroundColor: 'white',
                    borderRadius: 8,
                    padding: 10,
                    width: 150,
                }}>
                    <TouchableOpacity onPress={() => { /* Handle Select All action */ }}>
                        <Text className='text-lg mb-2 ml-3'>Select All</Text>
                    </TouchableOpacity>
                    <View className='border-t border-gray-500' />
                    <TouchableOpacity onPress={() => { /* Handle Delete action */ }}>
                        <Text className='text-lg ml-3'>Delete</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

export default AssertsFixedView;
