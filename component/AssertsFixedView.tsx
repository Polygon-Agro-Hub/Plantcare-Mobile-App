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
    AssertsFixedView: { category: string,toolId:any }; // This stays the same
    UpdateAsset: { selectedTools: number[]; category: string, toolId:any }; // Add category here
};

// Define the props for navigation
type Props = NativeStackScreenProps<RootStackParamList, 'AssertsFixedView'>;

// Define the tool interface for type safety
interface Tool {
    id: number;
    category: string;
    userId: number;
    toolId:any;
    district?: string; // For 'Land'
    type?: string; // For 'Building and Infrastructures'
    assetType?: string; // For 'Machine and Vehicles'

}

const AssertsFixedView: React.FC<Props> = ({ navigation, route }) => {
    const { category,toolId } = route.params; // Get the category from route parameters
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

        console.log(" hiiiii this is assets fixedview params ",route.params);
        
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
        console.log("Hi this is the toggle", selectedTools)
    };
    

    // Navigate to the UpdateAsset page with selected tools
    const handleUpdateSelected = () => {
        if (selectedTools.length === 0) {
            Alert.alert('No tools selected', 'Please select at least one tool to update.');
            return;
        }
    
        navigation.navigate('UpdateAsset', {
            selectedTools, // Correctly use selectedTools
            category, // Pass the category if needed
            toolId,
            // Add any additional parameters you need to send
        }); // Navigate to UpdateAsset page
        console.log("Hi this is update toggle:", selectedTools);
    };

    // Handle deleting selected tools (you can implement the deletion logic)
    const handleDeleteSelected = async () => {
        if (selectedTools.length === 0) {
            Alert.alert('No tools selected', 'Please select at least one tool to delete.');
            return;
        }
    
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                console.error('No token found in AsyncStorage');
                return;
            }
    
            // Delete each selected tool
            for (const toolId of selectedTools) {
                await axios.delete(`${environment.API_BASE_URL}api/auth/fixedasset/${toolId}/${category}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            }
    
            // Update tools state to remove the deleted tools
            setTools((prevTools) => prevTools.filter((tool) => !selectedTools.includes(tool.id)));
    
            Alert.alert('Delete Selected', 'Selected tools deleted successfully.');
            setSelectedTools([]); // Reset selected tools after deletion
        } catch (error) {
            console.error('Error deleting tools:', error);
            Alert.alert('Error', 'There was an error deleting the selected tools.');
        }
        console.log("Hi this is delete:",selectedTools)
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

            {/* Update options - only visible when toggled */}
            {showDeleteOptions && (
                <View className="flex-row justify-around p-4 bg-gray-100">
                    <TouchableOpacity
                        className={`bg-red-500 p-2 rounded ${selectedTools.length === 0 ? 'opacity-50' : ''}`}
                        disabled={selectedTools.length === 0}
                        onPress={handleDeleteSelected}
                    >
                        <Text className="text-white font-bold">Delete Selected</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className={`bg-green-500 p-2 rounded ${selectedTools.length === 0 ? 'opacity-50' : ''}`}
                        disabled={selectedTools.length === 0}
                        onPress={handleUpdateSelected}
                    >
                        <Text className="text-white font-bold">Update Selected</Text>
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
