import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { StackNavigationProp } from '@react-navigation/stack';  // Import StackNavigationProp
import { RootStackParamList } from './types';  // Import the types for navigation
import NavigationBar from '@/Items/NavigationBar';

// Define the AddAssetNavigationProp using the RootStackParamList
type AddAssetNavigationProp = StackNavigationProp<RootStackParamList, 'AddAsset'>;

// Define the AddAssetProps interface
interface AddAssetProps {
    navigation: AddAssetNavigationProp;
}

// Define the AddAsset component with props
const AddAsset: React.FC<AddAssetProps> = ({ navigation }) => {
    const [ownership, setOwnership] = useState('Own Building (with title ownership)');
    const [category, setCategory] = useState('Building and Infrastructures');
    const [type, setType] = useState('Greenhouse');
    const [generalCondition, setGeneralCondition] = useState('Good');
    const [district, setDistrict] = useState('Galle');

    // Ownership options
    const ownershipCategories = [
        { key: '1', value: 'Own Building (with title ownership)' },
        { key: '2', value: 'Least Land' },
        { key: '3', value: 'Permit Land' },
        { key: '4', value: 'Shared / No Ownership' },
    ];

    // General condition options
    const generalConditionOptions = [
        { key: '1', value: 'Good' },
        { key: '2', value: 'Average' },
        { key: '3', value: 'Poor' },
    ];

    // District options
    const districtOptions = [
        { key: '1', value: 'Galle' },
        { key: '2', value: 'Colombo' },
        { key: '3', value: 'Kandy' },
        { key: '4', value: 'Jaffna' },
    ];

    return (
        <ScrollView className="flex-1 px-4 py-4 bg-white">
            {/* Header with back button */}
            <View className="flex-row items-center justify-between pr-[40%]">
                <Pressable onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </Pressable>
                <Text className="text-lg text-center font-bold">My Assets</Text>
            </View>

            {/* Category Picker */}
            <Text className="mt-4 text-sm">Select Category</Text>
            <View className="border border-gray-300 rounded-full bg-gray-100">
                <Picker selectedValue={category} onValueChange={(itemValue: any) => setCategory(itemValue)}>
                    <Picker.Item label="Building and Infrastructures" value="Building and Infrastructures" />
                    {/* Add other categories as needed */}
                </Picker>
            </View>

            {/* Type Picker */}
            <Text className="mt-4 text-sm">Type</Text>
            <View className="border border-gray-300 rounded-full  bg-gray-100">
                <Picker selectedValue={type} onValueChange={(itemValue: any) => setType(itemValue)}>
                    <Picker.Item label="Greenhouse" value="Greenhouse" />
                    {/* Add other types as needed */}
                </Picker>
            </View>

            {/* Floor Area (sqr ft) */}
            <Text className="mt-4 text-sm">Floor Area (sqr ft)</Text>
            <TextInput className="border border-gray-300 p-2 rounded-full bg-gray-100" placeholder="Enter area in sqr ft" />

            {/* Ownership Selection */}
            <Text className="mt-4 text-sm">Ownership</Text>
            <View className="border border-gray-300 rounded-full bg-gray-100">
                <Picker
                    selectedValue={ownership}
                    onValueChange={(itemValue: any) => setOwnership(itemValue)}
                >
                    {ownershipCategories.map((item) => (
                        <Picker.Item label={item.value} value={item.value} key={item.key} />
                    ))}
                </Picker>
            </View>

            {/* Conditional fields based on ownership */}
            {ownership === "Own Building (with title ownership)" && (
                <View>
                    <Text className="mt-4 text-sm">Estimated Building Value (LKR)</Text>
                    <TextInput className="border border-gray-300 p-2 rounded-full bg-gray-100" placeholder="4,50,000" />
                </View>
            )}

            {ownership === "Least Land" && (
                <View>
                    <Text className="mt-4 text-sm">Start Date</Text>
                    <View className="flex-row space-x-4 items-center">
                        <TextInput className="flex-1 border border-gray-300 p-2 rounded-full bg-gray-100" placeholder="Select date" />
                        <Ionicons name="calendar-outline" size={24} color="gray" />
                    </View>

                    <Text className="mt-4 text-sm">Duration</Text>
                    <View className="flex-row space-x-4">
                        <TextInput className="flex-1 border border-gray-300 p-2 rounded-full bg-gray-100" placeholder="years" />
                        <TextInput className="flex-1 border border-gray-300 p-2 rounded-full bg-gray-100" placeholder="months" />
                    </View>

                    <Text className="mt-4 text-sm">Least Amount Annually (LKR)</Text>
                    <TextInput className="border border-gray-300 p-2 rounded-full bg-gray-100" placeholder="4,50,000" />
                </View>
            )}

            {ownership === "Permit Land" && (
                <View>
                    <Text className="mt-4 text-sm">Issued Date</Text>
                    <View className="flex-row space-x-4 items-center">
                        <TextInput className="flex-1 border border-gray-300 p-2 rounded-md bg-gray-100" placeholder="Select date" />
                        <Ionicons name="calendar-outline" size={24} color="gray" />
                    </View>

                    <Text className="mt-4 text-sm">Permit Fee Annually (LKR)</Text>
                    <TextInput className="border border-gray-300 p-2 rounded-full bg-gray-100" placeholder="4,50,000" />
                </View>
            )}

            {ownership === "Shared / No Ownership" && (
                <View>
                    <Text className="mt-4 text-sm">Payment Annually (LKR)</Text>
                    <TextInput className="border border-gray-300 p-2 rounded-full bg-gray-100" placeholder="4,50,000" />
                </View>
            )}

            {/* General Condition */}
            <Text className="mt-4 text-sm">General Condition</Text>
            <View className="border border-gray-300 rounded-full bg-gray-100">
                <Picker
                    selectedValue={generalCondition}
                    onValueChange={(itemValue: any) => setGeneralCondition(itemValue)}
                >
                    {generalConditionOptions.map((item) => (
                        <Picker.Item label={item.value} value={item.value} key={item.key} />
                    ))}
                </Picker>
            </View>

            {/* District */}
            <Text className="mt-4 text-sm">District</Text>
            <View className="border border-gray-300 rounded-full bg-gray-100">
                <Picker
                    selectedValue={district}
                    onValueChange={(itemValue: any) => setDistrict(itemValue)}
                >
                    {districtOptions.map((item) => (
                        <Picker.Item label={item.value} value={item.value} key={item.key} />
                    ))}
                </Picker>
            </View>

            {/* Save Button */}
            <Pressable className="mt-6 bg-black p-4 rounded-full">
                <Text className="text-white text-center">Save</Text>
            </Pressable>

            {/* Bottom Navigation */}
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                <NavigationBar navigation={navigation} />
            </View>
        </ScrollView>
    );
};

export default AddAsset;