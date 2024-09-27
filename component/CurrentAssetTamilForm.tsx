import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios'; // Import axios
import { RootStackParamList } from './types';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons'; // Use for icons
import NavigationBar from '@/Items/NavigationBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

type CurrentAssetTamilFormNavigationProp = StackNavigationProp<RootStackParamList, 'CurrentAssetTamilForm'>;

interface CurrentAssetTamilFormNavigationProps {
  navigation: CurrentAssetTamilFormNavigationProp;
}

const CurrentAssetTamilForm: React.FC<CurrentAssetTamilFormNavigationProps> = ({ navigation }) => {
  const [category, setCategory] = useState('Select Category');
  const [asset, setAsset] = useState('');
  const [brand, setBrand] = useState('');
  const [batchNum, setBatchNum] = useState('');
  const [volume, setVolume] = useState('');
  const [unit, setUnit] = useState('ml');
  const [numberOfUnits, setNumberOfUnits] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [expireDate, setExpireDate] = useState('');
  const [warranty, setWarranty] = useState('');
  const [status, setStatus] = useState('Expired');
  const [userId, setUserId] = useState<number | null>(null);
  const [showPurchaseDatePicker, setShowPurchaseDatePicker] = useState(false);
  const [showExpireDatePicker, setShowExpireDatePicker] = useState(false); // Placeholder for user ID

  useEffect(() => {
    if (numberOfUnits && unitPrice) {
      const total = parseFloat(numberOfUnits) * parseFloat(unitPrice);
      setTotalPrice(total.toString());
    }
  }, [numberOfUnits, unitPrice]);

  const handleDateChange = (event:any, selectedDate:any, type:any) => {
    const currentDate = selectedDate || new Date();
    const dateString = currentDate.toISOString().slice(0, 10); // Format to 'YYYY-MM-DD'
    if (type === 'purchase') {
      if (new Date(dateString) > new Date()) {
        Alert.alert('தவறான தேதி', 'கொள்முதல் தேதி எதிர்கால தேதியாக இருக்க முடியாது.');
        return;
      }
      setPurchaseDate(dateString);
      setShowPurchaseDatePicker(false);
      if (expireDate && new Date(dateString) > new Date(expireDate)) {
        Alert.alert('தவறான தேதி', 'காலாவதி தேதி கொள்முதல் தேதிக்கு முன் இருக்கக்கூடாது.');
        setExpireDate('');
      }
    } else if (type === 'expire') {
      if (new Date(dateString) < new Date(purchaseDate)) {
        Alert.alert('தவறான தேதி', 'காலாவதி தேதி கொள்முதல் தேதிக்கு முன் இருக்கக்கூடாது.');
        return;
      }
      setExpireDate(dateString);
      setShowExpireDatePicker(false);
    }
  };

  const handleAddAsset = async () => {
    try {

        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          Alert.alert('Error', 'No token found');
          return;
        }
      const response = await axios.post(
        'http://10.0.2.2:3000/api/auth/currentAsset',
        {
          category,
          asset,
          brand,
          batchNum,
          volume,
          unit,
          numberOfUnits,
          unitPrice,
          totalPrice,
          purchaseDate,
          expireDate,
          warranty,
          status,
        },
        {
          headers: {
            'Content-Type': 'application/json',
             Authorization: `Bearer ${token}`,
          }
        }
      );

      console.log('Asset added successfully:', response.data);
      Alert.alert('சொத்து சேர்க்கப்பட்டது!');
      // Optionally, you can navigate to another screen or show a success message here
    } catch (error) {
      console.error('Error adding asset:', error);
      // Optionally, you can show an error message to the user here
    }
  };

  return (
    <ScrollView className="flex-1 bg-white ">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg mr-[40%] font-bold">எனது சொத்துக்கள்</Text>
        {/* <View /> Empty view to balance alignment */}
      </View>

      {/* Tabs */}
      <View className='flex-row ml-8 mr-8 mt-8 justify-center'>
        <View className='w-1/2'>
          <TouchableOpacity onPress={() => navigation.navigate('CurrentAssert')}>
            <Text className=' text-green-400 text-center text-lg'>தற்போதைய</Text>
            <View className="border-t-[2px] border-green-400" />
          </TouchableOpacity>
        </View>
        <View className='w-1/2'>
          <TouchableOpacity >
            <Text className='text-gray-400 text-center text-lg'>தற்போதைய</Text>
            <View className="border-t-[2px] border-gray-400" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Input Fields */}
      <View className="space-y-4 p-8">
        <View className="">
          <Text className="text-gray-600 mb-2">வகையைத் தேர்ந்தெடுக்கவும்</Text>
          <View className='bg-gray-200 rounded-[30px]'>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => {
                setCategory(itemValue);
                // Reset asset when category changes
                if (itemValue !== 'Other Consumables') {
                  setAsset('');
                }
              }}
              className="bg-gray-200 rounded"
            >
              <Picker.Item label="Select Category" value="" />
              <Picker.Item label="Agro Chemicals" value="Agro Chemicals" />
              <Picker.Item label="Fertilizer" value="Fertilizer" />
              <Picker.Item label="Seed and Seedlings" value="Seed and Seedlings" />
              <Picker.Item label="Livestock for Sale" value="Livestock for Sale" />
              <Picker.Item label="Animal Feed" value="Animal Feed" />
              <Picker.Item label="Other Consumables" value="Other Consumables" />
            </Picker>
          </View>

          <Text className="text-gray-600 mt-4 mb-2">சொத்து</Text>
          {category === 'Other Consumables' ? (
            <TextInput
              placeholder="Type Asset Name"
              value={asset}
              onChangeText={setAsset}
              className="bg-gray-100 p-2 rounded-[30px] h-[50px]"
            />
          ) : (
            <View className='bg-gray-200 rounded-[30px]'>
              <Picker
                selectedValue={asset}
                onValueChange={setAsset}
                className="bg-gray-200 rounded"
              >
                <Picker.Item label="Select Asset" value="" />
                <Picker.Item label="Asset 1" value="asset1" />
                <Picker.Item label="Asset 2" value="asset2" />
              </Picker>
            </View>
          )}
        </View>

        <Text className="text-gray-600">பிராண்ட்</Text>
        <TextInput
          placeholder="Brand"
          value={brand}
          onChangeText={setBrand}
          className="bg-gray-200 p-2 rounded-[30px] h-[50px]"
        />

        <Text className="text-gray-600">தொகுதி எண்</Text>
        <TextInput
          placeholder="Batch Number"
          value={batchNum}
          onChangeText={setBatchNum}
          className="bg-gray-200 p-2 rounded-[30px] h-[50px]"
        />

        <Text className="text-gray-600 ">அலகு தொகுதி / எடை</Text>
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
              className="flex-1  "
              dropdownIconColor="gray"
            >
              <Picker.Item label="மி.லி" value="மி.லி" />
              <Picker.Item label="கி.கி" value="கி.கி" />
            </Picker>
          </View>
        </View>

        <View className="">
          <Text className="text-gray-600">அலகுகளின் எண்ணிக்கை</Text>
          <TextInput
            placeholder="Number of Units"
            value={numberOfUnits}
            onChangeText={setNumberOfUnits}
            keyboardType="numeric"
            className="bg-gray-200 p-2 mt-5 rounded-[30px] h-[50px]"
          />

          <Text className="text-gray-600 mt-5">யூனிட் விலை (ரூ.)</Text>
          <TextInput
            placeholder="Unit Price (LKR)"
            value={unitPrice}
            onChangeText={setUnitPrice}
            keyboardType="numeric"
            className="bg-gray-200 p-2 mt-5 rounded-[30px] h-[50px]"
          />

          <Text className="text-gray-600 mt-5">மொத்த விலை (ரூ.)</Text>
          <TextInput
            placeholder="Total Price (LKR)"
            value={totalPrice}
            editable={false} // Make the total price field read-only
            className="bg-gray-200 p-2 mt-5 rounded-[30px] h-[50px]"
          />
        </View>

        <View className="space-y-4 ">
        <Text className="text-gray-600">வாங்கிய தேதி</Text>
        <TouchableOpacity onPress={() => setShowPurchaseDatePicker(true)}>
          <TextInput
            placeholder="Purchase Date"
            value={purchaseDate}
            editable={false} // Make the TextInput read-only
            className="bg-gray-200 p-2 rounded-[30px] h-[50px]"
          />
        </TouchableOpacity>
        {showPurchaseDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={new Date(purchaseDate || new Date())}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => handleDateChange(event, selectedDate, 'purchase')}
          />
        )}

        <Text className="text-gray-600">காலாவதி தேதி</Text>
        <TouchableOpacity onPress={() => setShowExpireDatePicker(true)}>
          <TextInput
            placeholder="Expire Date"
            value={expireDate}
            editable={false} // Make the TextInput read-only
            className="bg-gray-200 p-2 rounded-[30px] h-[50px]"
          />
        </TouchableOpacity>
        {showExpireDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={new Date(expireDate || new Date())}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => handleDateChange(event, selectedDate, 'expire')}
          />
        )}
      </View>

        <Text className="text-gray-600 mb-2">நிலை</Text>
        <View className="flex-col">
          <TouchableOpacity
            onPress={() => setStatus('Expired')}
            className="bg-gray-200 py-2 rounded-[30px] mb-2"
          >
            <Text className={`text-center ${status === 'Expired' ? 'text-red-500' : 'text-gray-500'}`}>காலாவதியானது</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setStatus('Still Valid')}
            className="bg-gray-200 py-2 rounded-[30px]"
          >
            <Text className={`text-center ${status === 'Still Valid' ? 'text-green-500' : 'text-gray-500'}`}>இன்னும் செல்லுபடியாகும்</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleAddAsset} // Call handleAddAsset on press
          className="bg-green-500 mt-4 p-4 w-[150px] ml-[30%] rounded"
        >
          <View className='flex'>
            <Text className="text-white text-center font-bold">சொத்தைச் சேர்க்கவும்</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <NavigationBar navigation={navigation} />
      </View>
    </ScrollView>
  );
};

export default CurrentAssetTamilForm;
