import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { environment } from '@/environment/environment'; // Adjust the path as needed
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';
import AntDesign from 'react-native-vector-icons/AntDesign';

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

    const districtOptions = [
        { key: "1", value: "Galle" },
        { key: "2", value: "Colombo" },
        { key: "3", value: "Kandy" },
        { key: "4", value: "Jaffna" },
    ];

    // Fetch the selected tool(s) details
    const fetchSelectedTools = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                console.error('No token found in AsyncStorage');
                setLoading(false);
                return;
            }

            // Fetch details for the selected tools or a single tool
            const response = await axios.get(
                `${environment.API_BASE_URL}api/auth/fixedasset/${selectedTools}/${category}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = Array.isArray(response.data) ? response.data : [response.data];
            if (data) {
                setTools(data);
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

                const response = await axios.put(
                    `${environment.API_BASE_URL}api/auth/fixedasset/${selectedTools}/${category}`,
                    updatedToolDetails,
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

    const handleOwnershipInputChange = (toolId: any, field: any, value: any) => {
        setUpdatedDetails((prev: any) => ({
            ...prev,
            [toolId]: {
                ...prev[toolId],
                ownershipDetails: {
                    ...prev[toolId]?.ownershipDetails,
                    [field]: value,
                },
            },
        }));
    };

    // Handle change in input fields
    const handleInputChange = (toolId: any, field: any, value: any) => {
        setUpdatedDetails((prevDetails: any) => {
            const fields = field.split('.'); // Split field by dot notation to handle nested fields
            const toolDetails = { ...prevDetails[toolId] };

            // If field is nested (like ownershipDetails.issuedDate)
            if (fields.length > 1) {
                const [mainField, subField] = fields;
                toolDetails[mainField] = {
                    ...toolDetails[mainField],
                    [subField]: value,
                };
            } else {
                toolDetails[field] = value;
            }

            return {
                ...prevDetails,
                [toolId]: toolDetails, // Update the tool's details
            };
        });
    };

    return (
        <ScrollView className="p-4 bg-white">
            {loading ? (
                <Text>Loading...</Text>
            ) : (
                tools.map((tool) => (
                    <View key={tool.id} className="mb-4 p-4 bg-white rounded">
                    <AntDesign name="left" size={24} color="#000502" onPress={() => navigation.goBack()} />
                        <Text className="font-bold text-lg text-center">Edit</Text>
                        <Text className="font-bold text-lg text-center">{tool.category}</Text>

                        {tool.category === 'Land' && (
                            <>
                                <View className="border border-gray-400 rounded-2xl bg-white mb-2">
                                    <Picker
                                        selectedValue={updatedDetails[tool.id]?.district || ''}
                                        onValueChange={(value) => handleInputChange(tool.id, 'district', value)}
                                    >
                                        {districtOptions.map((item) => (
                                            <Picker.Item
                                                label={item.value}
                                                value={item.value}
                                                key={item.key}
                                            />
                                        ))}
                                    </Picker>
                                </View>
                                <TextInput
                                    placeholder="Extent Ha"
                                    value={updatedDetails[tool.id]?.extentha || ''}
                                    onChangeText={(value) => handleInputChange(tool.id, 'extentha', value)}
                                    className="border border-gray-400  p-2 mb-2 rounded-2xl"
                                />
                                <TextInput
                                    placeholder="Extent Ac"
                                    value={updatedDetails[tool.id]?.extentac || ''}
                                    onChangeText={(value) => handleInputChange(tool.id, 'extentac', value)}
                                    className="border border-gray-400 rounded-2xl p-2 mb-2"
                                />
                                <TextInput
                                    placeholder="Extent P"
                                    value={updatedDetails[tool.id]?.extentp || ''}
                                    onChangeText={(value) => handleInputChange(tool.id, 'extentp', value)}
                                    className="border border-gray-400 rounded-2xl p-2 mb-2"
                                />
                                <TextInput
                                    placeholder="Ownership"
                                    value={updatedDetails[tool.id]?.ownership || ''}
                                    onChangeText={(value) => handleInputChange(tool.id, 'ownership', value)}
                                    className="border border-gray-400 rounded-2xl p-2 mb-2"
                                />
                                <TextInput
                                    placeholder="Land Fenced"
                                    value={updatedDetails[tool.id]?.landFenced || ''}
                                    onChangeText={(value) => handleInputChange(tool.id, 'landFenced', value)}
                                    className="border border-gray-400 rounded-2xl p-2 mb-2"
                                />
                                <TextInput
                                    placeholder="Perennial Crop"
                                    value={updatedDetails[tool.id]?.perennialCrop || ''}
                                    onChangeText={(value) => handleInputChange(tool.id, 'perennialCrop', value)}
                                    className="border border-gray-400 rounded-2xl p-2 mb-2"
                                />

                                {/* Ownership Details Fields */}
                                <TextInput
                                    placeholder="Issued Date"
                                    value={updatedDetails[tool.id]?.ownershipDetails?.issuedDate || ''}
                                    onChangeText={(value) => handleOwnershipInputChange(tool.id, 'issuedDate', value)}
                                    className="border border-gray-400 rounded-2xl p-2 mb-2"
                                />
                                <TextInput
                                    placeholder="Estimated Value"
                                    value={updatedDetails[tool.id]?.ownershipDetails?.estimateValue || ''}
                                    onChangeText={(value) => handleOwnershipInputChange(tool.id, 'estimateValue', value)}
                                    className="border border-gray-400 rounded-2xl p-2 mb-2"
                                />
                                <TextInput
                                    placeholder="Start Date"
                                    value={updatedDetails[tool.id]?.ownershipDetails?.startDate || ''}
                                    onChangeText={(value) => handleOwnershipInputChange(tool.id, 'startDate', value)}
                                    className="border border-gray-400 rounded-2xl p-2 mb-2"
                                />
                                <TextInput
                                    placeholder="Duration (Years)"
                                    value={updatedDetails[tool.id]?.ownershipDetails?.duration || ''}
                                    onChangeText={(value) => handleOwnershipInputChange(tool.id, 'duration', value)}
                                    className="border border-gray-400 rounded-2xl p-2 mb-2"
                                />
                                <TextInput
                                    placeholder="Least Amount Annually"
                                    value={updatedDetails[tool.id]?.ownershipDetails?.leastAmountAnnually || ''}
                                    onChangeText={(value) => handleOwnershipInputChange(tool.id, 'leastAmountAnnually', value)}
                                    className="border border-gray-400 rounded-2xl p-2 mb-2"
                                />
                                <TextInput
                                    placeholder="Permit Fee Annually"
                                    value={updatedDetails[tool.id]?.ownershipDetails?.permitFeeAnnually || ''}
                                    onChangeText={(value) => handleOwnershipInputChange(tool.id, 'permitFeeAnnually', value)}
                                    className="border border-gray-400 rounded-2xl p-2 mb-2"
                                />
                                <TextInput
                                    placeholder="Payment Annually"
                                    value={updatedDetails[tool.id]?.ownershipDetails?.paymentAnnually || ''}
                                    onChangeText={(value) => handleOwnershipInputChange(tool.id, 'paymentAnnually', value)}
                                    className="border border-gray-400 rounded-2xl p-2 mb-2"
                                />
                            </>
                        )}


                        {tool.category === 'Building and Infrastructures' && (
                            <>
                                <TextInput
                                    placeholder="Type"
                                    value={updatedDetails[tool.id]?.type || ''}
                                    onChangeText={(value) => handleInputChange(tool.id, 'type', value)}
                                    className="border border-gray-400 rounded-2xl p-2 mb-2 bg-white"
                                />
                                <TextInput
                                    placeholder="Floor Area"
                                    value={updatedDetails[tool.id]?.floorArea || ''}
                                    onChangeText={(value) => handleInputChange(tool.id, 'floorArea', value)}
                                    className="border border-gray-400 rounded-2xl p-2 mb-2"
                                />
                                <TextInput
                                    placeholder="Ownership"
                                    value={updatedDetails[tool.id]?.ownership || ''}
                                    onChangeText={(value) => handleInputChange(tool.id, 'ownership', value)}
                                    className="border border-gray-400 rounded-2xl p-2 mb-2"
                                />
                                <TextInput
                                    placeholder="General Condition"
                                    value={updatedDetails[tool.id]?.generalCondition || ''}
                                    onChangeText={(value) => handleInputChange(tool.id, 'generalCondition', value)}
                                    className="border border-gray-400 rounded-2xl p-2 mb-2"
                                />
                                <View className="border border-gray-300 rounded-2xl bg-gray-100 mb-2">
                                    <Picker
                                        selectedValue={updatedDetails[tool.id]?.district || ''}
                                        onValueChange={(value) => handleInputChange(tool.id, 'district', value)}
                                    >
                                        {districtOptions.map((item) => (
                                            <Picker.Item
                                                label={item.value}
                                                value={item.value}
                                                key={item.key}
                                            />
                                        ))}
                                    </Picker>
                                </View>

                                <TextInput
                                    placeholder="Issued Date"
                                    value={updatedDetails[tool.id]?.ownershipDetails?.issuedDate || ''}
                                    onChangeText={(value) => handleInputChange(tool.id, 'ownershipDetails.issuedDate', value)}
                                    className="border border-gray-400 rounded-2xl p-2 mb-2"
                                />
                                <TextInput
                                    placeholder="Estimate Value"
                                    value={updatedDetails[tool.id]?.ownershipDetails?.estimateValue || ''}
                                    onChangeText={(value) => handleInputChange(tool.id, 'ownershipDetails.estimateValue', value)}
                                    className="border border-gray-400 rounded-2xl p-2 mb-2"
                                />
                                <TextInput
                                    placeholder="Start Date"
                                    value={updatedDetails[tool.id]?.ownershipDetails?.startDate || ''}
                                    onChangeText={(value) => handleInputChange(tool.id, 'ownershipDetails.startDate', value)}
                                    className="border border-gray-400 rounded-2xl p-2 mb-2"
                                />
                                <TextInput
                                    placeholder="Duration"
                                    value={updatedDetails[tool.id]?.ownershipDetails?.duration || ''}
                                    onChangeText={(value) => handleInputChange(tool.id, 'ownershipDetails.duration', value)}
                                    className="border border-gray-400 rounded-2xl p-2 mb-2"
                                />
                                <TextInput
                                    placeholder="Lease Amount Annually"
                                    value={updatedDetails[tool.id]?.ownershipDetails?.leaseAmountAnnually || ''}
                                    onChangeText={(value) => handleInputChange(tool.id, 'ownershipDetails.leaseAmountAnnually', value)}
                                    className="border border-gray-400 rounded-2xl p-2 mb-2"
                                />
                            </>
                        )}

                        {tool.category === 'Machine and Vehicles' || tool.category === 'Tools' ? (
                            <>
                                <TextInput
                                    placeholder="Asset"
                                    value={updatedDetails[tool.id]?.asset || ''}
                                    onChangeText={(value) => handleInputChange(tool.id, 'asset', value)}
                                    className="border border-gray-400 rounded-2xl p-2 mb-2"
                                />
                                <TextInput
                                    placeholder="Asset Type"
                                    value={updatedDetails[tool.id]?.assetType || ''}
                                    onChangeText={(value) => handleInputChange(tool.id, 'assetType', value)}
                                    className="border border-gray-400 rounded-2xl p-2 mb-2"
                                />
                                {updatedDetails[tool.id]?.assetType === 'Other' && (
                                    <TextInput
                                        placeholder="Mention Other"
                                        value={updatedDetails[tool.id]?.mentionOther || ''}
                                        onChangeText={(value) => handleInputChange(tool.id, 'mentionOther', value)}
                                        className="border border-gray-400 rounded-2xl p-2 mb-2"
                                    />
                                )}
                                <TextInput
                                    placeholder="Brand"
                                    value={updatedDetails[tool.id]?.brand || ''}
                                    onChangeText={(value) => handleInputChange(tool.id, 'brand', value)}
                                    className="border border-gray-400 rounded-2xl p-2 mb-2"
                                />
                                <TextInput
                                    placeholder="Number of Units"
                                    value={updatedDetails[tool.id]?.numberOfUnits || ''}
                                    onChangeText={(value) => handleInputChange(tool.id, 'numberOfUnits', value)}
                                    keyboardType="numeric"
                                    className="border border-gray-400 rounded-2xl p-2 mb-2"
                                />
                                <TextInput
                                    placeholder="Unit Price"
                                    value={updatedDetails[tool.id]?.unitPrice || ''}
                                    onChangeText={(value) => handleInputChange(tool.id, 'unitPrice', value)}
                                    keyboardType="numeric"
                                    className="border border-gray-400 rounded-2xl p-2 mb-2"
                                />
                                <TextInput
                                    placeholder="Total Price"
                                    value={updatedDetails[tool.id]?.totalPrice || ''}
                                    onChangeText={(value) => handleInputChange(tool.id, 'totalPrice', value)}
                                    keyboardType="numeric"
                                    className="border border-gray-400 rounded-2xl p-2 mb-2"
                                />
                                <TextInput
                                    placeholder="Warranty"
                                    value={updatedDetails[tool.id]?.warranty || ''}
                                    onChangeText={(value) => handleInputChange(tool.id, 'warranty', value)}
                                    className="border border-gray-400 rounded-2xl p-2 mb-2"
                                />

                                {/* Ownership Details Section */}
                                <TextInput
                                    placeholder="Purchase Date (YYYY-MM-DD)"
                                    value={updatedDetails[tool.id]?.ownershipDetails?.purchaseDate || ''}
                                    onChangeText={(value) => handleInputChange(tool.id, 'ownershipDetails.purchaseDate', value)}
                                    className="border border-gray-400 rounded-2xl p-2 mb-2"
                                />
                                <TextInput
                                    placeholder="Expire Date (YYYY-MM-DD)"
                                    value={updatedDetails[tool.id]?.ownershipDetails?.expireDate || ''}
                                    onChangeText={(value) => handleInputChange(tool.id, 'ownershipDetails.expireDate', value)}
                                    className="border border-gray-400 rounded-2xl p-2 mb-2"
                                />
                                <TextInput
                                    placeholder="Warranty Status"
                                    value={updatedDetails[tool.id]?.ownershipDetails?.warrantystatus || ''}
                                    onChangeText={(value) => handleInputChange(tool.id, 'ownershipDetails.warrantystatus', value)}
                                    className="border border-gray-400 rounded-2xl p-2 mb-2"
                                />
                            </>
                        ) : null}


                        <TouchableOpacity
                            onPress={handleUpdateTools}
                            className="bg-green-500 p-2 rounded items-center">
                            <Text className="text-white">Update Asset</Text>
                        </TouchableOpacity>
                    </View>
                ))
            )}
        </ScrollView>
    );
};

export default UpdateAsset;
