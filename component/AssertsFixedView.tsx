// import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
// import React, { useState, useEffect } from 'react';
// import { StatusBar } from 'expo-status-bar';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import AntDesign from 'react-native-vector-icons/AntDesign';
// import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
// import Modal from 'react-native-modal';
// import { StackNavigationProp } from '@react-navigation/stack';
// import { RootStackParamList } from './types';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';
// import { environment } from '@/environment/environment';

// type AssertsFixedViewNavigationProp = StackNavigationProp<RootStackParamList, 'AssertsFixedView'>

// interface CurentAsssetProps {
//     navigation: AssertsFixedViewNavigationProp;
// }

// // Define a TypeScript interface for a tool
// interface Tool {
//     id: number;
//     userId: number;
//     tool: string;
//     toolType: string;
//     brandName: string;
//     purchaseDate: string; // Assuming date is returned as a string in ISO format
//     unit: string;
//     price: string; // price is returned as a string
//     warranty?: string;
//     expireDate?: string; // Assuming date is returned as a string in ISO format
//     depreciation?: number;
//     warrantyStatus: string;
// }

// // Define the interface for the API response
// interface ApiResponse {
//     status: string;
//     message?: string;
//     fixedAssets: Tool[]; // Changed from `data` to `fixedAssets`
// }

// const AssertsFixedView: React.FC<CurentAsssetProps> = ({ navigation }) => {
//     const [isModalVisible, setModalVisible] = useState(false);
//     const [tools, setTools] = useState<Tool[]>([]);
//     const [loading, setLoading] = useState(true);

//     const toggleModal = () => {
//         setModalVisible(!isModalVisible);
//     };

//     useEffect(() => {
//         const fetchTools = async () => {
//             try {
//                 const token = await AsyncStorage.getItem('userToken');
//                 const response = await axios.get<ApiResponse>(`${environment.API_BASE_URL}api/auth/fixedassets`, {
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${token}`,
//                     },
//                 });

//                 console.log('Fetched data:', response.data); // Log the fetched data for inspection

//                 if (response.data.status === 'success') {
//                     setTools(Array.isArray(response.data.fixedAssets) ? response.data.fixedAssets : []);
//                 } else {
//                     console.error('Failed to fetch tools:', response.data.message);
//                     setTools([]); // Set tools to an empty array if the response status is not 'success'
//                 }
//             } catch (error) {
//                 console.error('Error fetching tools:', error);
//                 setTools([]); // Set tools to an empty array in case of an error
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchTools();
//     }, []);

//     return (
//         <SafeAreaView>
//             <StatusBar style='light' />

//             <View className='flex-row items-center justify-between px-4 mt-[5%]'>
//                 <View>
//                     <TouchableOpacity onPress={() => navigation.goBack()}>
//                         <Ionicons name="chevron-back-outline" size={30} color="gray" />
//                     </TouchableOpacity>
//                 </View>
//                 <View className='flex-1 items-center'>
//                     <Text className='text-black text-xl font-bold'>My Assets</Text>
//                 </View>
//             </View>

//             <View className='flex-row ml-8 mr-8 mt-8 justify-center'>
//                 <View className='w-1/2'>
//                     <TouchableOpacity onPress={() => navigation.navigate('CurrentAssert')}>
//                         <Text className='text-gray-400 text-center text-lg'>Current Asserts</Text>
//                         <View className="border-t-[2px] border-gray-400" />
//                     </TouchableOpacity>
//                 </View>
//                 <View className='w-1/2'>
//                     <TouchableOpacity>
//                         <Text className='text-green-400 text-center text-lg'>Fixed Asserts</Text>
//                         <View className="border-t-[2px] border-green-400" />
//                     </TouchableOpacity>
//                 </View>
//             </View>

//             <View className='items-center'>
//                 {/* <View className='flex-row justify-between items-center w-full px-4 pt-10'>
//                     <View className='flex-1 items-center'>
//                         <Text className='text-base font-medium'>Total Tools</Text>
//                     </View>
//                     <TouchableOpacity onPress={toggleModal}>
//                         <SimpleLineIcons name="options-vertical" size={16} color="black" />
//                     </TouchableOpacity>
//                 </View> */}

//                 <ScrollView>
        

//                     {loading ? (
//                         <Text>Loading...</Text>
//                     ) : (
//                         tools.length > 0 ? (
//                             tools.map((tool) => (
//                                 <View key={tool.id} className='flex-row items-center rounded-lg mb-5 border-[1px] shadow-md'>
//                                     <View className='bg-white rounded-xl w-[330px] h-[70px] flex-row justify-between items-center pr-3'>
//                                         <View className='pl-10'>
//                                             <Text className='font-bold text-xl'>{tool.tool}</Text>
//                                             <Text>{tool.toolType}</Text>
//                                         </View>
//                                         <View>
//                                             <Text className='font-bold text-base'>RS {tool.price}</Text>
//                                         </View>
//                                         <View>
//                                             <AntDesign name="edit" size={20} color="#000502" />
//                                         </View>
//                                     </View>
//                                 </View>
//                             ))
//                         ) : (
//                             <Text>No tools available</Text>
//                         )
//                     )}
//                 </ScrollView>

//             </View>

//             <Modal isVisible={isModalVisible} onBackdropPress={toggleModal} style={{ margin: 0 }}>
//                 <View style={{
//                     position: 'absolute',
//                     top: 110, // Adjust this value based on the position of your icon
//                     right: 15, // Adjust this value to match the alignment of the icon
//                     backgroundColor: 'white',
//                     borderRadius: 8,
//                     padding: 10,
//                     width: 150,
//                 }}>
//                     <TouchableOpacity onPress={() => { /* Handle Select All action */ }}>
//                         <Text className='text-lg mb-2 ml-3'>Select All</Text>
//                     </TouchableOpacity>
//                     <View className='border-t border-gray-500' />
//                     <TouchableOpacity onPress={() => { /* Handle Delete action */ }}>
//                         <Text className='text-lg ml-3'>Delete</Text>
//                     </TouchableOpacity>
//                 </View>
//             </Modal>
//         </SafeAreaView>
//     );
// }

// export default AssertsFixedView;

import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { environment } from '@/environment/environment'; // Adjust according to your project structure
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Define the RootStackParamList
type RootStackParamList = {
    AssertsFixedView: { category: string }; // Adjust this if you have more parameters
};

// Define the props for navigation
type Props = NativeStackScreenProps<RootStackParamList, 'AssertsFixedView'>;

// Define the tool interface for type safety
interface Tool {
    id: number;
    category: string;
    createdAt: string;
    userId: number;
    details?: string; // Assuming additional details can be optional
}

const AssertsFixedView: React.FC<Props> = ({ navigation, route }) => {
    const { category } = route.params; // Get the category from route parameters
    const [isModalVisible, setModalVisible] = useState(false);
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const fetchTools = async () => {
        console.log("HI ",`${environment.API_BASE_URL}api/auth/fixed-assets/totals/${category}`)
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                console.error('No token found in AsyncStorage');
                setLoading(false);
                return;
            }

            // Fetch data with the selected category
            const response = await axios.get(`${environment.API_BASE_URL}api/auth/fixed-assets/totals/${category}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log('Fetched data:', response.data); // Log fetched data for inspection

            // Check if data is an array of tools
            if (response.data.data) {
                setTools(response.data.data as Tool[]); // Cast response to Tool[] for type safety
            } else {
                console.error('No tools found for the selected category');
                setTools([]); // Set empty tools array if no data
            }
        } catch (error) {
            console.error('Error fetching tools:', error);
            setTools([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Fetch tools for the selected category when the component loads
        fetchTools();
    }, [category]); // Depend on category to fetch whenever it changes

    return (
        <SafeAreaView>
            <StatusBar style="light" />

            <View className="flex-row justify-between items-center px-4 py-3 bg-[#3A8E33]">
                <AntDesign name="left" size={24} color="white" onPress={() => navigation.goBack()} />
                <Text className="text-white text-xl font-bold">{category} Tools</Text>
                <TouchableOpacity onPress={toggleModal}>
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView className="mt-2 p-4">
                {loading ? (
                    <Text>Loading...</Text>
                ) : tools.length > 0 ? (
                    tools.map((tool) => (
                        <View key={tool.id} className="bg-gray-200 p-4 mb-2 rounded">
                            <Text className="font-bold">{tool.details || "Tool Details"}</Text>
                            <Text>{`Created At: ${new Date(tool.createdAt).toLocaleDateString()}`}</Text>
                        </View>
                    ))
                ) : (
                    <Text>No tools available for this category.</Text>
                )}
            </ScrollView>

            <Modal isVisible={isModalVisible}>
                <View className="flex-1 justify-center items-center bg-white p-4 rounded-lg">
                    <Text className="font-bold text-xl mb-4">Add New Tool</Text>
                    {/* Add form to create a new tool here */}
                    <TouchableOpacity onPress={toggleModal}>
                        <Text className="text-red-500 mt-4">Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default AssertsFixedView;
