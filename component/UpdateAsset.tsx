import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { environment } from '@/environment/environment'; // Adjust the path as needed
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Define the RootStackParamList
type RootStackParamList = {
    UpdateAsset: { selectedTools: number[]; category: string; toolId: any };
};

// Define the props for navigation
type Props = NativeStackScreenProps<RootStackParamList, 'UpdateAsset'>;

const UpdateAsset: React.FC<Props> = ({ navigation, route }) => {
    const { selectedTools, category } = route.params; // Get selected tool IDs and category from route parameters
    const [tools, setTools] = useState<any[]>([]); // To hold tool data
    const [loading, setLoading] = useState(true);
    const [updatedDetails, setUpdatedDetails] = useState<any>({}); // To hold updated data

    // Fetch the selected tool(s) details
    const fetchSelectedTools = async () => {
        console.log("this is updateassets ", route.params);
        console.log("toolsssssssssssss ", tools);
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                console.error('No token found in AsyncStorage');
                setLoading(false);
                return;
            }

            // Fetch details for the selected tools or a single tool
            console.log("Hi this is the url.........:", `${environment.API_BASE_URL}api/auth/fixedasset/${selectedTools}/${category}`);
            const response = await axios.get(
                `${environment.API_BASE_URL}api/auth/fixedasset/${selectedTools}/${category}`, // Adjust endpoint accordingly
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log("Hi this is get data:", response.data);

            // Check if the response data is an array or a single object
            const data = Array.isArray(response.data) ? response.data : [response.data];

            if (data) {
                setTools(data); // Set tool(s) data
                setUpdatedDetails(
                    data.reduce((acc: any, tool: any) => {
                        acc[tool.id] = { ...tool }; // Store tool data by ID for updating
                        return acc;
                    }, {})
                );
            }
        } catch (error) {
            console.error('Error fetching selected tools:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Fetch the selected tool(s) details when the component loads
        fetchSelectedTools();
    }, [selectedTools]);

    // Handle form submission to update tool(s)
    const handleUpdateTools = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                console.error('No token found in AsyncStorage');
                return;
            }

            // Update each selected tool
            for (const tool of tools) {
                const { id, category } = tool;
                const updatedToolDetails = updatedDetails[id];

                // Send the updated details to the backend
                const response = await axios.put(
                    `${environment.API_BASE_URL}api/auth/fixedasset/${selectedTools}/${category}`, // Update the endpoint
                    updatedToolDetails, // Send updated tool details
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.status !== 200) {
                    throw new Error('Failed to update one or more assets');
                }
            }

            Alert.alert('Success', 'Assets updated successfully');
            navigation.goBack(); // Go back after successful update
        } catch (error) {
            console.error('Error updating assets:', error);
            Alert.alert('Error', 'Failed to update assets');
        }
    };

    // Handle change in input fields
    const handleInputChange = (id: number, field: string, value: string) => {
        setUpdatedDetails((prev: any) => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value,
            },
        }));
    };

    return (
        <ScrollView className="p-4 bg-white">
            {loading ? (
                <Text>Loading...</Text>
            ) : (
                tools.map((tool) => (
                    <View key={tool.id} className="mb-4 p-4 bg-gray-200 rounded">
                        <Text className="font-bold text-lg">Asset Details:</Text>
                        <Text className="font-bold text-lg">{tool.category}</Text>

                        {tool.category === 'Land' && (
                            <>
                                <TextInput
                                    placeholder="District"
                                    value={updatedDetails[tool.id]?.district || ''}
                                    onChangeText={(value) => handleInputChange(tool.id, 'district', value)}
                                    className="border border-gray-400 rounded p-2 mb-2"
                                />
                                <TextInput
                                    placeholder="Extent Ha"
                                    value={updatedDetails[tool.id]?.extentha || ''}
                                    onChangeText={(value) => handleInputChange(tool.id, 'extentha', value)}
                                    className="border border-gray-400 rounded p-2 mb-2"
                                />
                                <TextInput
                                    placeholder="Extent Ac"
                                    value={updatedDetails[tool.id]?.extentac || ''}
                                    onChangeText={(value) => handleInputChange(tool.id, 'extentac', value)}
                                    className="border border-gray-400 rounded p-2 mb-2"
                                />
                                <TextInput
                                    placeholder="Extent P"
                                    value={updatedDetails[tool.id]?.extentp || ''}
                                    onChangeText={(value) => handleInputChange(tool.id, 'extentp', value)}
                                    className="border border-gray-400 rounded p-2 mb-2"
                                />
                                <TextInput
                                    placeholder="Land Fenced"
                                    value={updatedDetails[tool.id]?.landFenced || ''}
                                    onChangeText={(value) => handleInputChange(tool.id, 'landFenced', value)}
                                    className="border border-gray-400 rounded p-2 mb-2"
                                />
                            </>
                        )}

{tool.category === 'Building and Infrastructures' && (
    <>
        {/* Asset Fields */}
        <TextInput
            placeholder="Type"
            value={updatedDetails[tool.id]?.type || ''}
            onChangeText={(value) => handleInputChange(tool.id, 'type', value)}
            className="border border-gray-400 rounded p-2 mb-2"
        />
        <TextInput
            placeholder="Floor Area"
            value={updatedDetails[tool.id]?.floorArea || ''}
            onChangeText={(value) => handleInputChange(tool.id, 'floorArea', value)}
            className="border border-gray-400 rounded p-2 mb-2"
        />
        <TextInput
            placeholder="Ownership"
            value={updatedDetails[tool.id]?.ownership || ''}
            onChangeText={(value) => handleInputChange(tool.id, 'ownership', value)}
            className="border border-gray-400 rounded p-2 mb-2"
        />
        <TextInput
            placeholder="General Condition"
            value={updatedDetails[tool.id]?.generalCondition || ''}
            onChangeText={(value) => handleInputChange(tool.id, 'generalCondition', value)}
            className="border border-gray-400 rounded p-2 mb-2"
        />
        <TextInput
            placeholder="District"
            value={updatedDetails[tool.id]?.district || ''}
            onChangeText={(value) => handleInputChange(tool.id, 'district', value)}
            className="border border-gray-400 rounded p-2 mb-2"
        />

        {/* Ownership Details */}
        <TextInput
            placeholder="Issued Date"
            value={updatedDetails[tool.id]?.ownershipDetails?.issuedDate || ''}
            onChangeText={(value) => handleInputChange(tool.id, 'ownershipDetails.issuedDate', value)}
            className="border border-gray-400 rounded p-2 mb-2"
        />
        <TextInput
            placeholder="Estimate Value"
            value={updatedDetails[tool.id]?.ownershipDetails?.estimateValue || ''}
            onChangeText={(value) => handleInputChange(tool.id, 'ownershipDetails.estimateValue', value)}
            className="border border-gray-400 rounded p-2 mb-2"
        />
        <TextInput
            placeholder="Start Date"
            value={updatedDetails[tool.id]?.ownershipDetails?.startDate || ''}
            onChangeText={(value) => handleInputChange(tool.id, 'ownershipDetails.startDate', value)}
            className="border border-gray-400 rounded p-2 mb-2"
        />
        <TextInput
            placeholder="Duration"
            value={updatedDetails[tool.id]?.ownershipDetails?.duration || ''}
            onChangeText={(value) => handleInputChange(tool.id, 'ownershipDetails.duration', value)}
            className="border border-gray-400 rounded p-2 mb-2"
        />
        <TextInput
            placeholder="Lease Amount Annually"
            value={updatedDetails[tool.id]?.ownershipDetails?.leastAmountAnnually || ''}
            onChangeText={(value) => handleInputChange(tool.id, 'ownershipDetails.leastAmountAnnually', value)}
            className="border border-gray-400 rounded p-2 mb-2"
        />
        <TextInput
            placeholder="Permit Fee Annually"
            value={updatedDetails[tool.id]?.ownershipDetails?.permitFeeAnnually || ''}
            onChangeText={(value) => handleInputChange(tool.id, 'ownershipDetails.permitFeeAnnually', value)}
            className="border border-gray-400 rounded p-2 mb-2"
        />
        <TextInput
            placeholder="Payment Annually"
            value={updatedDetails[tool.id]?.ownershipDetails?.paymentAnnually || ''}
            onChangeText={(value) => handleInputChange(tool.id, 'ownershipDetails.paymentAnnually', value)}
            className="border border-gray-400 rounded p-2 mb-2"
        />
    </>
)}


                        {tool.category === 'Machine and Vehicles' || tool.category === 'Tools' ? (
                            <>
                                <TextInput
                                    placeholder="Asset Type"
                                    value={updatedDetails[tool.id]?.assetType || ''}
                                    onChangeText={(value) => handleInputChange(tool.id, 'assetType', value)}
                                    className="border border-gray-400 rounded p-2 mb-2"
                                />
                                <TextInput
                                    placeholder="Mention Other"
                                    value={updatedDetails[tool.id]?.mentionOther || ''}
                                    onChangeText={(value) => handleInputChange(tool.id, 'mentionOther', value)}
                                    className="border border-gray-400 rounded p-2 mb-2"
                                />
                                <TextInput
                                    placeholder="Brand"
                                    value={updatedDetails[tool.id]?.brand || ''}
                                    onChangeText={(value) => handleInputChange(tool.id, 'brand', value)}
                                    className="border border-gray-400 rounded p-2 mb-2"
                                />
                                <TextInput
                                    placeholder="Number of Units"
                                    value={updatedDetails[tool.id]?.numberOfUnits || ''}
                                    onChangeText={(value) => handleInputChange(tool.id, 'numberOfUnits', value)}
                                    className="border border-gray-400 rounded p-2 mb-2"
                                />
                                <TextInput
                                    placeholder="Unit Price"
                                    value={updatedDetails[tool.id]?.unitPrice || ''}
                                    onChangeText={(value) => handleInputChange(tool.id, 'unitPrice', value)}
                                    className="border border-gray-400 rounded p-2 mb-2"
                                />
                            </>
                        ) : null}

                        {/* Add more conditions as needed for other categories */}
                    </View>
                ))
            )}
            <TouchableOpacity
                onPress={handleUpdateTools}
                className="bg-green-500 py-2 px-4 rounded"
            >
                <Text className="text-white text-center">Update Assets</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default UpdateAsset;
