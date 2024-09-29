import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import NavigationBar from '@/Items/NavigationBar';
import { TouchableOpacity } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios'; // Import axios
import { environment } from '@/environment/environment';

type AddAssetNavigationProp = StackNavigationProp<RootStackParamList, 'AddAsset'>;

interface AddAssetProps {
  navigation: AddAssetNavigationProp;
}

const AddAsset: React.FC<AddAssetProps> = ({ navigation }) => {
  const [ownership, setOwnership] = useState('Own Building (with title ownership)');
  const [category, setCategory] = useState('Building and Infrastructures');
  const [type, setType] = useState('Greenhouse');
  const [generalCondition, setGeneralCondition] = useState('Good');
  const [district, setDistrict] = useState('Galle');
  const [asset, setAsset] = useState('');
  const [brand, setBrand] = useState('');
  const [units, setUnits] = useState('');
  const [unitprice, setUnitprice] = useState('');
  const [warranty, setWarranty] = useState('');
  const [assetType, setAssetType] = useState('Car');
  const [purchasedDate, setPurchasedDate] = useState(new Date());
  const [expireDate, setExpireDate] = useState(new Date());
  const [showPurchasedDatePicker, setShowPurchasedDatePicker] = useState(false);
  const [showExpireDatePicker, setShowExpireDatePicker] = useState(false);
  const [extentha, setExtentha] = useState(''); // New state for extent
  const [extentac, setExtentac] = useState('');
  const [extentp, setExtentp] = useState('');
  const [landcategory, setLandcategory] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [fence, setFence] = useState('');
  const [peranial, setPeranial] = useState('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false); // State for Start Date Picker
  const [startDate, setStartDate] = useState(new Date()); // Added Start Date
  const [years, setYears] = useState('');
  const [months, setMonths] = useState('');
  const [showIssuedDatePicker, setShowIssuedDatePicker] = useState(false);
  const [issuedDate, setIssuedDate] = useState(new Date());
  const [showLbIssuedDatePicker, setShowLbIssuedDatePicker] = useState(false);
  const [lbissuedDate, setLbIssuedDate] = useState(new Date());
  const [annualpermit, setAnnualpermit] = useState('');
  const [annualpayment, setAnnualpayment] = useState('');
  const [othermachine, setOthermachene] = useState('');
  const [assetname, setAssetname] = useState('');
  const [hoetype, setHoetype] = useState('');
  const [anuallease, setAnnuallease] = useState('');
  const [othertool, setOthertool] = useState('');
  const [toolbrand, setToolbrand] = useState('');
  const [leaseduration, setLeaseduration] = useState('');
  const [leasedurationmonths, setLeasedurationmonths] = useState('');
  const [permitIssuedDate, setPermitIssuedDate] = useState(new Date());
  const [showPermitIssuedDatePicker, setShowPermitIssuedDatePicker] = useState(false);
  const [annualBuildingPermit, setAnnualBuildingPermit] = useState('');
  const [sharedlandAnnualPaymentBilling, setSharedlandAnnualPaymentBilling] = useState('');

  // New state for additional picker
  const [additionalOption, setAdditionalOption] = useState('Option1');

  const ownershipCategories = [
    { key: '1', value: '---Select Ownership Chategory----' },
    { key: '2', value: 'Own Building (with title ownership)' },
    { key: '3', value: 'Leased Building' },
    { key: '4', value: 'Permit Building' },
    { key: '5', value: 'Shared / No Ownership' },
  ];

  const assetTypes = [
    { key: '1', value: 'Car' },
    { key: '2', value: 'Truck' },
    { key: '3', value: 'Other' },
  ];

  const generalConditionOptions = [
    { key: '1', value: 'Good' },
    { key: '2', value: 'Average' },
    { key: '3', value: 'Poor' },
  ];

  const districtOptions = [
    { key: '1', value: 'Galle' },
    { key: '2', value: 'Colombo' },
    { key: '3', value: 'Kandy' },
    { key: '4', value: 'Jaffna' },
  ];

  // New options for additional picker
  const additionalOptions = [
    { key: '1', value: 'Expired' },
    { key: '2', value: 'Under Warrenty' },
  ];

  const onPurchasedDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowPurchasedDatePicker(false);
    if (selectedDate) setPurchasedDate(selectedDate);
  };

  const onStartDateChange = (event: any, selectedDate: Date | undefined) => { // Start Date change handler
    setShowStartDatePicker(false);
    if (selectedDate) setStartDate(selectedDate);
  };

  const onExpireDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowExpireDatePicker(false);
    if (selectedDate) setExpireDate(selectedDate);
  };

  const onIssuedDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowIssuedDatePicker(false); // Correctly updating the state here
    if (selectedDate) {
      setIssuedDate(selectedDate); // Assuming you have a state for issuedDate
    }
  };

  const onLbIssuedDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowLbIssuedDatePicker(false); // Hide the date picker after a selection
    if (selectedDate) {
      setLbIssuedDate(selectedDate); // Update the issued date if a valid date is selected
    }
  };

  const onPermitIssuedDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowPermitIssuedDatePicker(false);
    if (selectedDate) {
      setPermitIssuedDate(selectedDate);
    }
  };

  const totalPrice = parseFloat(units) * parseFloat(unitprice) || 0;

  const submitData = async () => {
    // Prepare the data to be sent
    const formData = {
      ownership,
      category,
      type,
      generalCondition,
      district,
      asset,
      brand,
      units,
      unitprice,
      warranty,
      purchasedDate,
      expireDate,
      extentha,
      extentac,
      extentp,
      landcategory,
      estimatedValue,
      fence,
      peranial,
      startDate,
      years,
      months,
      issuedDate,
      lbissuedDate,
      annualpermit,
      annualpayment,
      othermachine,
      assetname,
      hoetype,
      anuallease,
      othertool,
      toolbrand,
      leaseduration,
      leasedurationmonths,
      permitIssuedDate,
      annualBuildingPermit,
      sharedlandAnnualPaymentBilling,
      additionalOption,
      totalPrice,
    };

    try {
      const response = await axios.post(`${environment.API_BASE_URL}api/auth/add/fixedassets`, formData);
      console.log('Data submitted successfully:', response.data);
      Alert.alert('Success', 'Asset added successfully!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error) {
      console.error('Error submitting data:', error);
      Alert.alert('Error', 'Failed to add asset. Please try again.');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView className="flex-1 px-4 pb-20 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between pr-[40%]">
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </Pressable>
          <Text className="text-lg text-center font-bold">My Assets</Text>
        </View>

        {/* Category Picker */}
        <Text className="mt-4 text-sm">Select Category</Text>
        <View className="border border-gray-300 rounded-full bg-gray-100">
          <Picker
            selectedValue={category}
            onValueChange={(itemValue: any) => setCategory(itemValue)}
          >
            <Picker.Item label="Building and Infrastructures" value="Building and Infrastructures" />
            <Picker.Item label="Machine and Vehicles" value="Machine and Vehicles" />
            <Picker.Item label="Land" value="Land" />
            <Picker.Item label="Tools and Equipments" value="Tools" />

          </Picker>
        </View>



        {/* Asset Details */}
        {category === 'Machine and Vehicles' ? (
          <View className="flex-1">
            <Text className="mt-4 text-sm">Asset</Text>
            <TextInput
              className="border border-gray-300 p-2 rounded-full bg-gray-100"
              placeholder="Enter asset details"
              value={asset}
              onChangeText={setAsset}
            />

            {/* Asset Type Picker */}
            <Text className="mt-4 text-sm">Select Asset Type</Text>
            <View className="border border-gray-300 rounded-full bg-gray-100">
              <Picker selectedValue={assetType} onValueChange={(itemValue: any) => setAssetType(itemValue)}>
                {assetTypes.map((item) => (
                  <Picker.Item label={item.value} value={item.value} key={item.key} />
                ))}
              </Picker>
            </View>
            {assetType === 'Other' && (
              <View>
                <Text>Mention Other</Text>

                <TextInput
                  className="border border-gray-300 p-2 rounded-full bg-gray-100"
                  placeholder="Mention Other"
                  value={othermachine}
                  onChangeText={setOthermachene}
                />
              </View>
            )}

            <Text className="mt-4 text-sm">Brand</Text>
            <TextInput
              className="border border-gray-300 p-2 rounded-full bg-gray-100"
              placeholder="Enter brand"
              value={brand}
              onChangeText={setBrand}
            />

            <Text className="mt-4 text-sm">Number of Units</Text>
            <TextInput
              className="border border-gray-300 p-2 rounded-full bg-gray-100"
              placeholder="Enter number of units"
              value={units}
              onChangeText={setUnits}
              keyboardType="numeric"
            />

            <Text className="mt-4 text-sm">Unit Price</Text>
            <TextInput
              className="border border-gray-300 p-2 rounded-full bg-gray-100"
              placeholder="Enter unit price"
              value={unitprice}
              onChangeText={setUnitprice}
              keyboardType="numeric"
            />

            <Text className="mt-4 text-sm">Total Price (LKR)</Text>
            <View className="border border-gray-300 p-2 rounded-full bg-gray-100">
              <Text>{totalPrice.toFixed(2)}</Text>
            </View>

            {/* Warranty Section */}
            <Text className="pt-5 pl-3 pb-3 font-bold">Warranty</Text>
            <View className="flex-row justify-around mb-5">
              <TouchableOpacity onPress={() => setWarranty('yes')} className="flex-row items-center">
                <View className={`w-5 h-5 rounded-full ${warranty === 'yes' ? 'bg-green-500' : 'bg-gray-400'}`} />
                <Text className="ml-2">Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setWarranty('no')} className="flex-row items-center">
                <View className={`w-5 h-5 rounded-full ${warranty === 'no' ? 'bg-green-500' : 'bg-gray-400'}`} />
                <Text className="ml-2">No</Text>
              </TouchableOpacity>
            </View>

            {/* Conditional Date Pickers */}
            {warranty === 'yes' && (
              <>
                <Text className="pt-5 pl-3 pb-3 font-bold">Purchased Date</Text>
                <TouchableOpacity onPress={() => setShowPurchasedDatePicker(true)}>
                  <View className="border border-gray-300 p-2 rounded-full bg-gray-100">
                    <Text>{purchasedDate.toLocaleDateString()}</Text>
                  </View>
                </TouchableOpacity>
                {showPurchasedDatePicker && (
                  <DateTimePicker
                    value={purchasedDate}
                    mode="date"
                    display="default"
                    onChange={onPurchasedDateChange}
                  />
                )}

                <Text className="pt-5 pl-3 pb-3 font-bold">Warranty Expire Date</Text>
                <TouchableOpacity onPress={() => setShowExpireDatePicker(true)}>
                  <View className="border border-gray-300 p-2 rounded-full bg-gray-100">
                    <Text>{expireDate.toLocaleDateString()}</Text>
                  </View>
                </TouchableOpacity>
                {showExpireDatePicker && (
                  <DateTimePicker
                    value={expireDate}
                    mode="date"
                    display="default"
                    onChange={onExpireDateChange}
                    className='pb-[20%]'
                  />
                )}

                <Text className="pt-5 pl-3 pb-3 font-bold">Warranty Status</Text>

                {/* Additional Picker */}
                <Text className="mt-4 text-sm">Additional Option</Text>
                <View className="border border-gray-300 rounded-full bg-gray-100">
                  <Picker
                    selectedValue={additionalOption}
                    onValueChange={(itemValue: any) => setAdditionalOption(itemValue)}
                  >
                    {additionalOptions.map((item) => (
                      <Picker.Item label={item.value} value={item.value} key={item.key} />
                    ))}
                  </Picker>
                </View>
              </>
            )}


          </View>
        ) : category === 'Land' ? (
          <View>
            {/* Asset Details for Land */}
            <Text className="mt-4 text-sm">Extent</Text>
            <View className='items-center flex-row'>
              <View className='items-center flex-row '>
                <TextInput
                  className="border border-gray-300 p-2 w-[100px] rounded-2xl bg-gray-100"
                  value={extentha}
                  onChangeText={setExtentha}

                />
                <Text className='pl-3 pr-2'>ha</Text>
              </View>
              <View className='items-center flex-row '>
                <TextInput
                  className="border border-gray-300 p-2 w-[100px] rounded-2xl bg-gray-100"
                  value={extentac}
                  onChangeText={setExtentac}

                />
                <Text className='pl-3 pr-2'>ac</Text>
              </View>
              <View className='items-center flex-row '>
                <TextInput
                  className="border border-gray-300 p-2 w-[100px] rounded-2xl bg-gray-100"
                  value={extentp}
                  onChangeText={setExtentp}

                />
                <Text className='pl-3'>p</Text>
              </View>
            </View>
            <View>
              <Text className="mt-4 text-sm">Select Category</Text>
              <View className="border border-gray-300 rounded-full bg-gray-100">
                <Picker
                  selectedValue={landcategory}
                  onValueChange={(itemValue: any) => setLandcategory(itemValue)}
                >
                  <Picker.Item label="Own Land" value="Own" />
                  <Picker.Item label="Lease Land" value="Lease" />
                  <Picker.Item label="Permitted Land" value="Permited" />
                  <Picker.Item label="Shared/No Ownership" value="Shared" />
                </Picker>
              </View>
            </View>

            {/* Conditional input for estimated value */}
            {landcategory === 'Own' && (
              <View>
                <Text className="mt-4 text-sm">Estimated Value (LKR)</Text>
                <TextInput
                  className="border border-gray-300 p-2 rounded-full bg-gray-100"
                  placeholder="Enter estimated value"
                  value={estimatedValue}
                  onChangeText={setEstimatedValue}
                  keyboardType="numeric"
                />
                <Text className="mt-4 text-sm">District</Text>
                <View className="border border-gray-300 rounded-full bg-gray-100">
                  <Picker selectedValue={district} onValueChange={(itemValue: any) => setDistrict(itemValue)}>
                    {districtOptions.map((item) => (
                      <Picker.Item label={item.value} value={item.value} key={item.key} />
                    ))}
                  </Picker>
                </View>
              </View>

            )}

            {landcategory === 'Lease' && (
              <View>
                <Text className="pt-5 pl-3 pb-3 font-bold">Start Date</Text>
                <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
                  <View className="border border-gray-300 p-2 rounded-full bg-gray-100">
                    <Text>{startDate.toLocaleDateString()}</Text>
                  </View>
                </TouchableOpacity>
                {showStartDatePicker && (
                  <DateTimePicker
                    value={startDate}
                    mode="date"
                    display="default"
                    onChange={onStartDateChange}
                  />
                )}

                <Text className="mt-4 text-sm">Duration</Text>
                <View className="items-center flex-row">
                  <View className="items-center flex-row pl-[25%] ">
                    <TextInput
                      className="border border-gray-300 p-2 w-[100px] rounded-2xl bg-gray-100"
                      value={years}
                      onChangeText={setYears}
                    />
                    <Text className="pl-3 pr-2">Years</Text>
                  </View>
                  <View className="items-center flex-row ">
                    <TextInput
                      className="border border-gray-300 p-2 w-[100px] rounded-2xl bg-gray-100"
                      value={months}
                      onChangeText={setMonths}
                    />
                    <Text className="pl-3 pr-2">Months</Text>
                  </View>
                </View>

                {/* Estimated Value Input */}
                <Text className="mt-4 text-sm">Estimated Value (LKR)</Text>
                <TextInput
                  className="border border-gray-300 p-2 rounded-full bg-gray-100"
                  placeholder="Enter estimated value"
                  value={estimatedValue}
                  onChangeText={setEstimatedValue}
                  keyboardType="numeric"
                />
              </View>
            )}

            {landcategory === 'Permited' && (
              <View>
                <Text>Issued Date</Text>
                <TouchableOpacity onPress={() => setShowIssuedDatePicker(true)}>
                  <View className="border border-gray-300 p-2 rounded-full bg-gray-100">
                    <Text>{issuedDate.toLocaleDateString()}</Text>
                  </View>
                </TouchableOpacity>

                {showIssuedDatePicker && (
                  <DateTimePicker
                    value={issuedDate}
                    mode="date"
                    display="default"
                    onChange={onIssuedDateChange}
                  />
                )}
                <View>
                  <Text>Permit Annually(LKR)</Text>
                  <TextInput
                    className="border border-gray-300 p-2 rounded-full bg-gray-100"
                    placeholder="Enter estimated value"
                    value={annualpermit}
                    onChangeText={setAnnualpermit}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            )}

            {landcategory === 'Shared' && (
              <View className='pt-2'>
                <Text>Payment Annually (LKR)</Text>
                <View>
                  <TextInput
                    className="border border-gray-300 p-2 rounded-full bg-gray-100"
                    value={annualpayment}
                    onChangeText={setAnnualpayment}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            )}

            <Text className="mt-4 text-sm">District</Text>
            <View className="border border-gray-300 rounded-full bg-gray-100">
              <Picker selectedValue={district} onValueChange={(itemValue: any) => setDistrict(itemValue)}>
                {districtOptions.map((item) => (
                  <Picker.Item label={item.value} value={item.value} key={item.key} />
                ))}
              </Picker>
            </View>
            <Text className="pt-5 pl-3 pb-3 font-bold">Is the land fenced</Text>
            <View className="flex-row justify-around mb-5">
              <TouchableOpacity onPress={() => setFence('yes')} className="flex-row items-center">
                <View className={`w-5 h-5 rounded-full ${fence === 'yes' ? 'bg-green-500' : 'bg-gray-400'}`} />
                <Text className="ml-2">Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setFence('no')} className="flex-row items-center">
                <View className={`w-5 h-5 rounded-full ${fence === 'no' ? 'bg-green-500' : 'bg-gray-400'}`} />
                <Text className="ml-2">No</Text>
              </TouchableOpacity>
            </View>

            <Text className="pt-5 pl-3 pb-3 font-bold">Are there any perennial crops?</Text>
            <View className="flex-row justify-around mb-5">
              <TouchableOpacity onPress={() => setPeranial('yes')} className="flex-row items-center">
                <View className={`w-5 h-5 rounded-full ${peranial === 'yes' ? 'bg-green-500' : 'bg-gray-400'}`} />
                <Text className="ml-2">Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPeranial('no')} className="flex-row items-center">
                <View className={`w-5 h-5 rounded-full ${peranial === 'no' ? 'bg-green-500' : 'bg-gray-400'}`} />
                <Text className="ml-2">No</Text>
              </TouchableOpacity>
            </View>

          </View>

        ) : category == 'Tools' ? (
          <View className='flex-1 pt-[5%]'>
            <View>
              <Text className="mt-4 text-sm">Asset</Text>
              <View className="border border-gray-300 rounded-full bg-gray-100">
                <Picker
                  selectedValue={assetname}
                  onValueChange={(itemValue: any) => setAssetname(itemValue)}
                >
                  <Picker.Item label="Hoe" value="hoe" />
                  <Picker.Item label="Other" value="Other" />
                </Picker>
              </View>
            </View>
            {assetname == 'hoe' && (
              <View>
                <Text className="mt-4 text-sm"> Asset Type</Text>
                <View className="border border-gray-300 rounded-full bg-gray-100">
                  <Picker
                    selectedValue={hoetype}
                    onValueChange={(itemValue: any) => setHoetype(itemValue)}
                  >
                    <Picker.Item label="Hoe-1" value="hoe-1" />
                    <Picker.Item label="Hoe-2" value="hoe-2" />
                  </Picker>
                </View>
              </View>
            )}

            {assetname == 'Other' && (
              <View>
                <Text className="mt-4 text-sm"> Asset Type</Text>
                <View className="border border-gray-300 rounded-full bg-gray-100">
                  <Picker
                    selectedValue={hoetype}
                    onValueChange={(itemValue: any) => setHoetype(itemValue)}
                  >
                    <Picker.Item label="Other-1" value="other-1" />
                    <Picker.Item label="Other-2" value="other-2" />
                  </Picker>
                </View>
                <View>
                  <Text className="mt-4 text-sm">Mention Other</Text>
                  <TextInput
                    className="border border-gray-300 p-2 rounded-full bg-gray-100"
                    value={othertool}
                    onChangeText={setOthertool}
                  />
                </View>
              </View>
            )}
            <View>
              <Text className="mt-4 text-sm">Brand</Text>
              <TextInput
                className="border border-gray-300 p-2 rounded-full bg-gray-100"
                placeholder="Enter brand"
                value={toolbrand}
                onChangeText={setToolbrand}
              />
              <Text className="mt-4 text-sm">Number of Units</Text>
              <TextInput
                className="border border-gray-300 p-2 rounded-full bg-gray-100"
                placeholder="Enter number of units"
                value={units}
                onChangeText={setUnits}
                keyboardType="numeric"
              />

              <Text className="mt-4 text-sm">Unit Price</Text>
              <TextInput
                className="border border-gray-300 p-2 rounded-full bg-gray-100"
                placeholder="Enter unit price"
                value={unitprice}
                onChangeText={setUnitprice}
                keyboardType="numeric"
              />

              <Text className="mt-4 text-sm">Total Price (LKR)</Text>
              <View className="border border-gray-300 p-2 rounded-full bg-gray-100">
                <Text>{totalPrice.toFixed(2)}</Text>
              </View>
            </View>
            {/* Warranty Section */}
            <Text className="pt-5 pl-3 pb-3 font-bold">Warranty</Text>
            <View className="flex-row justify-around mb-5">
              <TouchableOpacity onPress={() => setWarranty('yes')} className="flex-row items-center">
                <View className={`w-5 h-5 rounded-full ${warranty === 'yes' ? 'bg-green-500' : 'bg-gray-400'}`} />
                <Text className="ml-2">Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setWarranty('no')} className="flex-row items-center">
                <View className={`w-5 h-5 rounded-full ${warranty === 'no' ? 'bg-green-500' : 'bg-gray-400'}`} />
                <Text className="ml-2">No</Text>
              </TouchableOpacity>
            </View>

            {/* Conditional Date Pickers */}
            {warranty === 'yes' && (
              <>
                <Text className="pt-5 pl-3 pb-3 font-bold">Purchased Date</Text>
                <TouchableOpacity onPress={() => setShowPurchasedDatePicker(true)}>
                  <View className="border border-gray-300 p-2 rounded-full bg-gray-100">
                    <Text>{purchasedDate.toLocaleDateString()}</Text>
                  </View>
                </TouchableOpacity>
                {showPurchasedDatePicker && (
                  <DateTimePicker
                    value={purchasedDate}
                    mode="date"
                    display="default"
                    onChange={onPurchasedDateChange}
                  />
                )}

                <Text className="pt-5 pl-3 pb-3 font-bold">Warranty Expire Date</Text>
                <TouchableOpacity onPress={() => setShowExpireDatePicker(true)}>
                  <View className="border border-gray-300 p-2 rounded-full bg-gray-100">
                    <Text>{expireDate.toLocaleDateString()}</Text>
                  </View>
                </TouchableOpacity>
                {showExpireDatePicker && (
                  <DateTimePicker
                    value={expireDate}
                    mode="date"
                    display="default"
                    onChange={onExpireDateChange}
                    className='pb-[20%]'
                  />
                )}

                <Text className="pt-5 pl-3 pb-3 font-bold">Warranty Status</Text>

                {/* Additional Picker */}
                <Text className="mt-4 text-sm">Additional Option</Text>
                <View className="border border-gray-300 rounded-full bg-gray-100">
                  <Picker
                    selectedValue={additionalOption}
                    onValueChange={(itemValue: any) => setAdditionalOption(itemValue)}
                  >
                    {additionalOptions.map((item) => (
                      <Picker.Item label={item.value} value={item.value} key={item.key} />
                    ))}
                  </Picker>
                </View>
              </>
            )}


          </View>

        ) : (
          <View>
            {/* Type Picker for "Building and Infrastructures" */}
            <Text className="mt-4 text-sm">Type</Text>
            <View className="border border-gray-300 rounded-full bg-gray-100">
              <Picker selectedValue={type} onValueChange={(itemValue: any) => setType(itemValue)}>
                <Picker.Item label="Greenhouse" value="Greenhouse" />
                {/* Add other types as needed */}
              </Picker>
            </View>

            {/* Floor Area */}
            <Text className="mt-4 text-sm">Floor Area (sqr ft)</Text>
            <TextInput
              className="border border-gray-300 p-2 rounded-full bg-gray-100"
              placeholder="Enter floor area"
            />

            {/* Ownership Picker */}
            <Text className="mt-4 text-sm">Ownership</Text>
            <View className="border border-gray-300 rounded-full bg-gray-100">
              <Picker selectedValue={ownership} onValueChange={(itemValue: any) => setOwnership(itemValue)}>
                {ownershipCategories.map((item) => (
                  <Picker.Item label={item.value} value={item.value} key={item.key} />
                ))}
              </Picker>
            </View>

            {/* Conditional Ownership Fields */}
            {ownership === 'Own Building (with title ownership)' && (
              <View>
                <Text className="mt-4 text-sm">Estimated Building Value (LKR)</Text>
                <TextInput
                  className="border border-gray-300 p-2 rounded-full bg-gray-100"
                  placeholder="Enter estimated value"
                />
              </View>
            )}
            {/***************************************************************************************LEASE BUILDING SECTION*****************************************************/}
            {ownership === 'Leased Building' && (
              <View className='pt-[3%]'>
                <Text>Leased Date</Text>
                <TouchableOpacity onPress={() => setShowLbIssuedDatePicker(true)}>
                  <View className="border border-gray-300 p-2 rounded-full bg-gray-100">
                    <Text>
                      {lbissuedDate ? lbissuedDate.toLocaleDateString() : 'Select Date'}
                    </Text>
                  </View>
                </TouchableOpacity>
                {showLbIssuedDatePicker && (
                  <DateTimePicker
                    value={lbissuedDate || new Date()} // Set to current date if lbissuedDate is not set
                    mode="date"
                    display="default"
                    onChange={onLbIssuedDateChange}
                  />
                )}
                <Text className="mt-4 text-sm">Duration</Text>
                <View className='flex-row gap-x-5 items-center'>

                  <TextInput
                    className="border border-gray-300 p-2 w-[110px] rounded-full bg-gray-100"
                    value={leaseduration}
                    onChangeText={setLeaseduration}
                    keyboardType="numeric"
                  />
                  <Text className=' pt-3'>Years</Text>

                  <TextInput
                    className="border border-gray-300  p-2 w-[110px] rounded-full bg-gray-100"
                    value={leasedurationmonths}
                    onChangeText={setLeasedurationmonths}
                    keyboardType="numeric"
                  />
                  <Text className='pt-3'>Months</Text>
                </View>
                <View className='pt-[5%]'>
                  <Text>Leased Amount Annually (LKR)</Text>
                  <TextInput
                    className="border border-gray-300 p-2 rounded-full bg-gray-100"
                    value={anuallease}
                    onChangeText={setAnnuallease}
                    keyboardType='numeric'
                  />
                </View>
              </View>
            )}

            {/***************************************************************************************Permit BUILDING SECTION*****************************************************/}
            {ownership == 'Permit Building' && (
              <View className='pt-[3%]'>
                <Text>Issued Date</Text>
                <TouchableOpacity onPress={() => setShowLbIssuedDatePicker(true)}>
                  <View className="border border-gray-300 p-2 rounded-full bg-gray-100">
                    <Text>
                      {lbissuedDate ? lbissuedDate.toLocaleDateString() : 'Select Date'}
                    </Text>
                  </View>
                </TouchableOpacity>
                {showLbIssuedDatePicker && (
                  <DateTimePicker
                    value={lbissuedDate || new Date()} // Set to current date if lbissuedDate is not set
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      if (event.type === "set") {  // Check if the user selected a date (not canceled)
                        onPermitIssuedDateChange(event, selectedDate);
                        setShowLbIssuedDatePicker(false); // Close the DateTimePicker after selection
                      } else {
                        setShowLbIssuedDatePicker(false); // Close the DateTimePicker on cancel
                      }
                    }}
                  />
                )}
                <View className='pt-[2%]'>
                  <Text>Permit Fee Annually (LKR)</Text>
                  <TextInput
                    className="border border-gray-300 p-2 rounded-full bg-gray-100"
                    value={annualBuildingPermit}
                    onChangeText={setAnnualBuildingPermit}
                    keyboardType='numeric'
                    placeholder="Enter Annual Building Permit"
                  />

                </View>

              </View>
            )}

            {ownership == 'Shared / No Ownership' && (
              <View className='pt-[3%]'>
                <Text>Payment Annually (LKR)</Text>
                <TextInput
                  className="border border-gray-300 p-2 rounded-full bg-gray-100"
                  value={sharedlandAnnualPaymentBilling}
                  onChangeText={setSharedlandAnnualPaymentBilling}
                  keyboardType='numeric'
                  placeholder="Enter Annual Payment Billing"
                />

              </View>
            )}


            {/* General Condition */}
            <Text className="mt-4 text-sm">General Condition</Text>
            <View className="border border-gray-300 rounded-full bg-gray-100">
              <Picker selectedValue={generalCondition} onValueChange={(itemValue: any) => setGeneralCondition(itemValue)}>
                {generalConditionOptions.map((item) => (
                  <Picker.Item label={item.value} value={item.value} key={item.key} />
                ))}
              </Picker>
            </View>

            {/* District Picker */}
            <Text className="mt-4 text-sm">District</Text>
            <View className="border border-gray-300 rounded-full bg-gray-100">
              <Picker selectedValue={district} onValueChange={(itemValue: any) => setDistrict(itemValue)}>
                {districtOptions.map((item) => (
                  <Picker.Item label={item.value} value={item.value} key={item.key} />
                ))}
              </Picker>


            </View>




          </View>



        )}
        <View className='flex-1 items-center pt-10'>
          <TouchableOpacity className="bg-gray-900 p-4 rounded-3xl mb-6 h-13 w-60" onPress={submitData} >
            <Text className="text-white text-lg text-center" >Save</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>


      {/* Navigation Bar */}
      <NavigationBar navigation={navigation} />
    </View>
  );
};

export default AddAsset;
