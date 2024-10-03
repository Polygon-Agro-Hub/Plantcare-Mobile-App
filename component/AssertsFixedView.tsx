import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
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
    userId: number;
    district?: string; // For 'Land'
    type?: string; // For 'Building and Infrastructures'
    assetType?: string; // For 'Machine and Vehicles'
}

const AssertsFixedView: React.FC<Props> = ({ navigation, route }) => {
    const { category } = route.params; // Get the category from route parameters
    const [isModalVisible, setModalVisible] = useState(false);
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTools, setSelectedTools] = useState<number[]>([]); // To track selected tools
    const [showDeleteOptions, setShowDeleteOptions] = useState(false); // Toggle for delete buttons

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const fetchTools = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                console.error('No token found in AsyncStorage');
                setLoading(false);
                return;
            }

            // Fetch data with the selected category
            const response = await axios.get(`${environment.API_BASE_URL}api/auth/fixed-assets/${category}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Check if data is available and set it to the tools state
            if (response.data.data) {
                setTools(response.data.data as Tool[]); // Cast response to Tool[] for type safety
            } else {
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

    // Function to render details based on the category
    const renderToolDetails = (tool: Tool) => {
        switch (category) {
            case 'Land':
                return (
                    <View className='flex-row gap-x-[50px]'>
                        <Text>{tool.category}</Text>
                        <Text className="font-bold">{tool.district || 'N/A'}</Text>
                    </View>
                );
            case 'Building and Infrastructures':
                return (
                    <View>
                        <Text>{tool.category}</Text>
                        <Text className="font-bold"> {tool.type || 'N/A'}</Text>
                    </View>
                );
            case 'Machine and Vehicles':
                return (
                    <View>
                        <Text className="font-bold"> {tool.assetType || 'N/A'}</Text>
                        <Text className="font-bold"> {tool.category}</Text>
                    </View>
                );
            case 'Tools':
                return (
                    <View>
                        <Text className="font-bold"> {tool.assetType || 'N/A'}</Text>
                        <Text className="font-bold"> {tool.category}</Text>
                    </View>
                );
        }
    };

    // Toggle selection for tools
    const toggleSelectTool = (toolId: number) => {
        setSelectedTools((prevSelected) =>
            prevSelected.includes(toolId)
                ? prevSelected.filter(id => id !== toolId) // Deselect if already selected
                : [...prevSelected, toolId] // Add to selected if not selected
        );
    };

    // Delete all tools
    const handleDeleteAll = () => {
        Alert.alert('Delete All', 'Are you sure you want to delete all tools?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                onPress: () => {
                    // Logic to delete all tools
                    console.log('All tools deleted');
                    setTools([]); // Clear the list
                },
            },
        ]);
    };

    // Delete selected tools
    const handleDeleteSelected = async () => {
        Alert.alert('Delete Selected', 'Are you sure you want to delete the selected tools?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                onPress: async () => {
                    try {
                        const token = await AsyncStorage.getItem('userToken');
                        if (!token) {
                            console.error('No token found in AsyncStorage');
                            return;
                        }
    
                        // Track the tools that fail deletion
                        const failedDeletes: number[] = [];
    
                        // Loop through each selected tool and call the delete API
                        for (const toolId of selectedTools) {
                            const tool = tools.find(t => t.id === toolId);
                            if (!tool) {
                                console.error("Tool not found in the tools list");
                                continue;
                            }
    
                            console.log(`Deleting tool ID: ${tool.id}, Category: ${tool.category}`);
    
                            try {
                                // Call the backend delete API with the tool ID and category
                                const response = await axios.delete(`${environment.API_BASE_URL}api/auth/fixedasset/${tool.id}/${tool.category}`, {
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                });
    
                                if (response.status === 200 || response.status === 204) {
                                    console.log(`Deleted tool ID: ${tool.id}`);
                                } else {
                                    console.error(`Failed to delete tool ID: ${tool.id}`);
                                    failedDeletes.push(tool.id);
                                }
                            } catch (error) {
                                console.error(`Error deleting tool ID: ${tool.id}`, error);
                                failedDeletes.push(tool.id);
                            }
                        }
    
                        // Update tools after deletion
                        const remainingTools = tools.filter(tool => !selectedTools.includes(tool.id) || failedDeletes.includes(tool.id));
                        setTools(remainingTools); // Update the tools list without the deleted ones
                        setSelectedTools([]); // Clear the selected tools
    
                        if (failedDeletes.length > 0) {
                            Alert.alert('Error', `Failed to delete ${failedDeletes.length} tool(s).`);
                        } else {
                            Alert.alert('Success', 'Selected tools have been deleted.');
                        }
                    } catch (error) {
                        console.error('Error deleting selected tools:', error);
                        Alert.alert('Error', 'Failed to delete the selected tools.');
                    }
                },
            },
        ]);
    };
    
    
    

    return (
        <SafeAreaView>
            <StatusBar style="light" />

            <View className="flex-row justify-between items-center px-4 py-3 bg-[#26D041]">
                <AntDesign name="left" size={24} color="white" onPress={() => navigation.goBack()} />
                <Text className="text-white text-xl font-bold text-center pr-[40%]">{category} </Text>

                {/* Toggle button to show/hide delete options */}
                <TouchableOpacity onPress={() => setShowDeleteOptions(!showDeleteOptions)}>
                <AntDesign name="ellipsis1" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* Delete options - only visible when toggled */}
            {showDeleteOptions && (
                <View className="flex-row justify-around p-4 bg-gray-100">
                    <TouchableOpacity className="bg-red-500 p-2 rounded" onPress={handleDeleteAll}>
                        <Text className="text-white font-bold">Delete All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`bg-red-500 p-2 rounded ${selectedTools.length === 0 ? 'opacity-50' : ''}`}
                        disabled={selectedTools.length === 0}
                        onPress={handleDeleteSelected}
                    >
                        <Text className="text-white font-bold">Delete Selected</Text>
                    </TouchableOpacity>
                </View>
            )}

            <ScrollView className="mt-2 p-4">
                {loading ? (
                    <Text>Loading...</Text>
                ) : tools.length > 0 ? (
                    tools.map((tool) => (
                        <View key={tool.id} className="bg-gray-200 p-4 mb-2 rounded relative">
                            {/* Select/Deselect dot */}
                            <TouchableOpacity
                                className="absolute top-1 right-1 w-4 h-4 rounded-full"
                                onPress={() => toggleSelectTool(tool.id)}
                            >
                                <View
                                    className={
                                        selectedTools.includes(tool.id)
                                            ? "bg-green-500 w-full h-full rounded-full"
                                            : "bg-gray-400 w-full h-full rounded-full"
                                    }
                                />
                            </TouchableOpacity>

                            {renderToolDetails(tool)}
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
