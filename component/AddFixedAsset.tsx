import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import NavigationBar from "@/Items/NavigationBar";
import { TouchableOpacity } from "react-native-gesture-handler";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios"; // Import axios
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import AntDesign from 'react-native-vector-icons/AntDesign';

type AddAssetNavigationProp = StackNavigationProp<
  RootStackParamList,
  "AddAsset"
>;

interface AddAssetProps {
  navigation: AddAssetNavigationProp;
}

const AddAsset: React.FC<AddAssetProps> = ({ navigation }) => {
  const [ownership, setOwnership] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [generalCondition, setGeneralCondition] = useState("");
  const [district, setDistrict] = useState("");
  const [asset, setAsset] = useState("");
  const [brand, setBrand] = useState("");
  // const [units, setUnits] = useState('');
  const [warranty, setWarranty] = useState("");
  const [purchasedDate, setPurchasedDate] = useState(new Date());
  const [expireDate, setExpireDate] = useState(new Date());
  const [showPurchasedDatePicker, setShowPurchasedDatePicker] = useState(false);
  const [showExpireDatePicker, setShowExpireDatePicker] = useState(false);
  const [extentha, setExtentha] = useState("");
  const [extentac, setExtentac] = useState("");
  const [extentp, setExtentp] = useState("");
  const [landcategory, setLandcategory] = useState("");
  const [estimateValue, setEstimatedValue] = useState("");
  // const [fence, setFence] = useState('');
  const [peranial, setPeranial] = useState("");
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [years, setYears] = useState("");
  const [months, setMonths] = useState("");
  const [showIssuedDatePicker, setShowIssuedDatePicker] = useState(false);
  const [issuedDate, setIssuedDate] = useState(new Date());
  const [showLbIssuedDatePicker, setShowLbIssuedDatePicker] = useState(false);
  const [lbissuedDate, setLbIssuedDate] = useState(new Date());
  const [annualpermit, setAnnualpermit] = useState("");
  const [annualpayment, setAnnualpayment] = useState("");
  const [othermachine, setOthermachene] = useState("");
  const [assetname, setAssetname] = useState("");
  const [hoetype, setHoetype] = useState("");
  const [anuallease, setAnnuallease] = useState("");
  const [othertool, setOthertool] = useState("");
  const [toolbrand, setToolbrand] = useState("");
  const [leaseduration, setLeaseduration] = useState("");
  const [leasedurationmonths, setLeasedurationmonths] = useState("");
  const [permitIssuedDate, setPermitIssuedDate] = useState(new Date());
  const [showPermitIssuedDatePicker, setShowPermitIssuedDatePicker] =
    useState(false);
  const [annualBuildingPermit, setAnnualBuildingPermit] = useState("");
  const [sharedlandAnnualPaymentBilling, setSharedlandAnnualPaymentBilling] =
    useState("");
  const [floorArea, setFloorArea] = useState("");
  const [landFenced, setLandFenced] = useState("");
  const [perennialCrop, setPerennialCrop] = useState("");
  const [assetType, setAssetType] = useState("");
  const [brandType, setBrandType] = useState("")
  const [mentionOther, setMentionOther] = useState("");
  const [numberOfUnits, setNumberOfUnits] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [durationYears, setDurationYears] = useState("");
  const [durationMonths, setDurationMonths] = useState("");
  const [leastAmountAnnually, setLeastAmountAnnually] = useState("");
  const [permitFeeAnnually, setPermitFeeAnnually] = useState("");
  const [paymentAnnually, setPaymentAnnually] = useState("");
  const [dateError, setDateError] = useState("");

  
  const ownershipCategories = [
    { key: "1", value: "---Select Ownership Chategory----" },
    { key: "2", value: "Own Building (with title ownership)" },
    { key: "3", value: "Leased Building" },
    { key: "4", value: "Permit Building" },
    { key: "5", value: "Shared / No Ownership" },
  ];

  
  const assetTypesForAssets:any = {
    Tractors: [
      { key: "4", value: "2WD" },
      { key: "5", value: "4WD" },
    ],
    // You can add more mappings for other assets if needed
    Transplanter: [
      {key:"14", value:"Paddy transplanter"},
    ],
    "Harvesting equipment": [
      { key: "15", value: "Sugarcane harvester" },
      { key: "16", value: "Static shedder" },
      { key: "17", value: "Mini combine harvester" },
      { key: "18", value: "Rice Combine harvester" },
      { key: "19", value: "Paddy harvester" },
      { key: "20", value: "Maize harvester" },
    ],
    "Cleaning, Grading and Weighing Equipment": [
      { key: "21", value: "Seperator" },
      { key: "22", value: "Centrifugal Stier Machine" },
      { key: "23", value: "Grain Classifier Seperator" },
      { key: "24", value: "Destoner Machine" },
    ],
    Sprayers:[
      { key: "25", value: "Knapsack Sprayer" },
      { key: "26", value: "Chemical Sprayer" },
      { key: "27", value: "Mist Blower" },
      { key: "28", value: "Environmental friendly sprayer" },
      { key: "29", value: "Drone sprayer" },
      { key: "30", value: "Pressure Sprayer" },
    ],
    
  };
  
  // Asset list for Machine and Vehicles
  const Machineasset = [
    { key: "1", value: "Tractors" },
    { key: "2", value: "Rotavator" },
    {key:"3", value:"Combine harvesters"},
    { key: "4", value: "Transplanter" },
    {key:"5", value:"Tillage Equipment"},
    {key:"6", value:"Sowing equipment"},
    {key:"7", value:"Harvesting equipment"},
    {key:"8", value:"Threshers, Reaper, Binders"},
    {key:"9", value:"Cleaning, Grading and Weighing Equipment"},
    {key:"10", value:"Weeding"},
    {key:"11", value:"Sprayers"},
    {key:"12", value:"Shelling and Grinding Machine"},
    {key:"13", value:"Sowing"},

    // Add other machine assets here
  ];
  
  
  const brandasset = [
    { key: "1", value: "Good" },
  ];

  const generalConditionOptions = [
    { key: "1", value: "Good" },
    { key: "2", value: "Average" },
    { key: "3", value: "Poor" },
  ];

  const districtOptions = [
    { key: "1", value: "Galle" },
    { key: "2", value: "Colombo" },
    { key: "3", value: "Kandy" },
    { key: "4", value: "Jaffna" },
  ];

  // New options for additional picker
  const warrantystatus = [
    { key: "1", value: "yes" },
    { key: "2", value: "no" },
  ];

  // Date change handlers
  const onPurchasedDateChange = (
    event: any,
    selectedDate: Date | undefined
  ) => {
    setShowPurchasedDatePicker(false);
    if (selectedDate) setPurchasedDate(selectedDate);
  };

  const onStartDateChange = (event: any, selectedDate: Date | undefined) => {
    if (selectedDate) {
      const currentDate = new Date();
      if (selectedDate > currentDate) {
        setDateError("Start date cannot be a future date.");
      } else {
        setDateError(""); // Clear any previous error
        setStartDate(selectedDate);
      }
    }
    setShowStartDatePicker(false); // Hide the date picker after selection
  };

  const onExpireDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowExpireDatePicker(false);
    if (selectedDate) setExpireDate(selectedDate);
  };

  const onIssuedDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowIssuedDatePicker(false);
    if (selectedDate) setIssuedDate(selectedDate);
  };

  const onLbIssuedDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowLbIssuedDatePicker(false);
    if (selectedDate) setLbIssuedDate(selectedDate);
  };

  const onPermitIssuedDateChange = (
    event: any,
    selectedDate: Date | undefined
  ) => {
    setShowPermitIssuedDatePicker(false);
    if (selectedDate) setPermitIssuedDate(selectedDate);
  };

  const totalPrice = Number(numberOfUnits) * Number(unitPrice) || 0; // Updated total price calculation

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const submitData = async () => {
    // Validate inputs (example validation)

    // Prepare the data to be sent
    const formData = {
      category,
      ownership,
      type,
      floorArea,
      generalCondition,
      district,
      extentha,
      extentac,
      extentp,
      landFenced,
      perennialCrop,
      asset,
      assetType,
      mentionOther,
      brand,
      numberOfUnits,
      unitPrice,
      totalPrice,
      warranty,
      issuedDate,
      purchaseDate,
      expireDate,
      warrantystatus,
      startDate,
      durationYears,
      durationMonths,
      leastAmountAnnually,
      permitFeeAnnually,
      paymentAnnually,
      estimateValue,
    };

    console.log("form data", formData);

    try {
      // Retrieve the token from Async Storage
      const token = await AsyncStorage.getItem("userToken"); // Replace 'token' with your actual key
      const response = await axios.post(
        `${environment.API_BASE_URL}api/auth/fixedassets`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Data submitted successfully:", response.data);
      Alert.alert("Success", "Asset added successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error("Error submitting data:", error);
      if (error.response) {
        Alert.alert("Error", `Server error: ${error.response.data.message}`);
      } else if (error.request) {
        Alert.alert(
          "Error",
          "No response from server. Please try again later."
        );
      } else {
        Alert.alert("Error", "Failed to add asset. Please try again.");
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView className="flex-1 px-4 pb-20 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between pr-[40%]">
          <Pressable onPress={() => navigation.goBack()}>
          <AntDesign name="left" size={24} color="black" onPress={() => navigation.goBack()} />
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
            <Picker.Item
              label="Building and Infrastructures"
              value="Building and Infrastructures"
            />
            <Picker.Item
              label="Machine and Vehicles"
              value="Machine and Vehicles"
            />
            <Picker.Item label="Land" value="Land" />
            <Picker.Item label="Tools and Equipments" value="Tools" />
          </Picker>
        </View>

        {/* Asset Details */}
        {category === "Machine and Vehicles" ? (
  <View className="flex-1">
    <Text className="mt-4 text-sm">Asset</Text>
    <View className="border border-gray-300 rounded-full bg-gray-100">
      <Picker
        selectedValue={asset}
        onValueChange={(itemValue: any) => {
          setAsset(itemValue);
          setAssetType(''); // Reset asset type when asset changes
        }}
      >
        {Machineasset.map((item) => (
          <Picker.Item
            label={item.value}
            value={item.value}
            key={item.key}
          />
        ))}
      </Picker>
    </View>    

    {/* Asset Type Picker - Only show if there are asset types for the selected asset */}
    {asset && assetTypesForAssets[asset] && assetTypesForAssets[asset].length > 0 && (
      <>
        <Text className="mt-4 text-sm">Select Asset Type</Text>
        <View className="border border-gray-300 rounded-full bg-gray-100">
          <Picker
            selectedValue={assetType}
            onValueChange={(itemValue: any) => setAssetType(itemValue)}
          >
            {/* Dynamically load asset types based on selected asset */}
            {assetTypesForAssets[asset].map((item:any) => (
              <Picker.Item
                label={item.value}
                value={item.value}
                key={item.key}
              />
            ))}
          </Picker>
        </View>
      </>
    )}
    
    {assetType === "Other" && (
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

    {/* Brand Input */}
    <Text className="mt-4 text-sm">Brand</Text>
    <View className="border border-gray-300 rounded-full bg-gray-100"> 
      <Picker
        selectedValue={brand}
        onValueChange={(itemValue: any) => {
          setBrand(itemValue);
          setBrandType(''); // Reset asset type when asset changes
        }}
      >
        {brandasset.map((item) => (
          <Picker.Item
            label={item.value}
            value={item.value}
            key={item.key}
            
          />
        ))}
      </Picker>
      </View>

    {/* Number of Units Input */}
    <Text className="mt-4 text-sm">Number of Units</Text>
    <TextInput
      className="border border-gray-300 p-2 rounded-full bg-gray-100"
      placeholder="Enter number of units"
      value={numberOfUnits}
      onChangeText={setNumberOfUnits}
      keyboardType="numeric"
    />

    {/* Unit Price Input */}
    <Text className="mt-4 text-sm">Unit Price</Text>
    <TextInput
      className="border border-gray-300 p-2 rounded-full bg-gray-100"
      placeholder="Enter unit price"
      value={unitPrice}
      onChangeText={setUnitPrice}
      keyboardType="numeric"
    />

    {/* Total Price Display */}
    <Text className="mt-4 text-sm">Total Price (LKR)</Text>
    <View className="border border-gray-300 p-2 rounded-full bg-gray-100">
      <Text>{totalPrice.toFixed(2)}</Text>
    </View>

    {/* Warranty Section */}
    <Text className="pt-5 pl-3 pb-3 font-bold">Warranty</Text>
    <View className="flex-row justify-around mb-5">
      <TouchableOpacity onPress={() => setWarranty("yes")} className="flex-row items-center">
        <View className={`w-5 h-5 rounded-full ${warranty === "yes" ? "bg-green-500" : "bg-gray-400"}`} />
        <Text className="ml-2">Yes</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setWarranty("no")} className="flex-row items-center">
        <View className={`w-5 h-5 rounded-full ${warranty === "no" ? "bg-green-500" : "bg-gray-400"}`} />
        <Text className="ml-2">No</Text>
      </TouchableOpacity>
    </View>

    {/* Conditional Date Pickers */}
    {warranty === "yes" && (
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
            className="pb-[20%]"
          />
        )}

        <Text className="pt-5 pl-3 pb-3 font-bold">Warranty Status</Text>

        {/* Additional Picker */}
        <Text className="mt-4 text-sm">Additional Option</Text>
        <View className="border border-gray-300 rounded-full bg-gray-100">
          <Picker
            selectedValue={warrantystatus}
            onValueChange={(itemValue: any) => setWarranty(itemValue)}
          >
            {warrantystatus.map((item) => (
              <Picker.Item
                label={item.value}
                value={item.value}
                key={item.key}
              />
            ))}
          </Picker>
        </View>
      </>
    )}

          </View>
        ) : category === "Land" ? (
          <View>
            {/* Asset Details for Land */}
            <Text className="mt-4 text-sm">Extent</Text>
            <View className="items-center flex-row">
              <View className="items-center flex-row ">
                <TextInput
                  className="border border-gray-300 p-2 w-[100px] rounded-2xl bg-gray-100"
                  value={extentha}
                  onChangeText={setExtentha}
                />
                <Text className="pl-3 pr-2">ha</Text>
              </View>
              <View className="items-center flex-row ">
                <TextInput
                  className="border border-gray-300 p-2 w-[100px] rounded-2xl bg-gray-100"
                  value={extentac}
                  onChangeText={setExtentac}
                />
                <Text className="pl-3 pr-2">ac</Text>
              </View>
              <View className="items-center flex-row ">
                <TextInput
                  className="border border-gray-300 p-2 w-[100px] rounded-2xl bg-gray-100"
                  value={extentp}
                  onChangeText={setExtentp}
                />
                <Text className="pl-3">p</Text>
              </View>
            </View>
            <View>
              <Text className="mt-4 text-sm">Select Land Category</Text>
              <View className="border border-gray-300 rounded-full bg-gray-100">
                <Picker
                  selectedValue={ownership}
                  onValueChange={(itemValue: any) => setOwnership(itemValue)}
                >
                  <Picker.Item label="Own Land" value="Own" />
                  <Picker.Item label="Lease Land" value="Lease" />
                  <Picker.Item label="Permitted Land" value="Permited" />
                  <Picker.Item label="Shared/No Ownership" value="Shared" />
                </Picker>
              </View>
            </View>

            {/* Conditional input for estimated value */}
            {ownership === "Own" && (
              <View>
                <Text className="mt-4 text-sm">Estimated value (LKR)</Text>
                <TextInput
                  className="border border-gray-300 p-2 rounded-full bg-gray-100"
                  placeholder="Enter Leased value"
                  value={estimateValue}
                  onChangeText={setEstimatedValue}
                  keyboardType="numeric"
                />
              </View>
            )}

            {ownership === "Lease" && (
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
                      value={durationYears}
                      onChangeText={setDurationYears}
                      keyboardType="numeric"
                    />
                    <Text className="pl-3 pr-2">Years</Text>
                  </View>
                  <View className="items-center flex-row ">
                    <TextInput
                      className="border border-gray-300 p-2 w-[100px] rounded-2xl bg-gray-100"
                      value={durationMonths}
                      onChangeText={setDurationMonths}
                       keyboardType="numeric"
                    />
                    <Text className="pl-3 pr-2">Months</Text>
                  </View>
                </View>

                {/* Leased Value Input */}
                <Text className="mt-4 text-sm">
                  Leased Amount Annually (LKR)
                </Text>
                <TextInput
                  className="border border-gray-300 p-2 rounded-full bg-gray-100"
                  placeholder="Enter Leased value"
                  value={leastAmountAnnually}
                  onChangeText={setLeastAmountAnnually}
                  keyboardType="numeric"
                />
              </View>
            )}

            {ownership === "Permited" && (
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
                    placeholder="Enter Permit value"
                    value={permitFeeAnnually}
                    onChangeText={setPermitFeeAnnually}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            )}

            {ownership === "Shared" && (
              <View className="pt-2">
                <Text>Payment Annually (LKR)</Text>
                <View>
                  <TextInput
                    className="border border-gray-300 p-2 rounded-full bg-gray-100"
                    value={paymentAnnually}
                    onChangeText={setPaymentAnnually}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            )}

            <Text className="mt-4 text-sm">District</Text>
            <View className="border border-gray-300 rounded-full bg-gray-100">
              <Picker
                selectedValue={district}
                onValueChange={(itemValue: any) => setDistrict(itemValue)}
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
            <Text className="pt-5 pl-3 pb-3 font-bold">Is the land fenced</Text>
            <View className="flex-row justify-around mb-5">
              <TouchableOpacity
                onPress={() => setLandFenced("yes")}
                className="flex-row items-center"
              >
                <View
                  className={`w-5 h-5 rounded-full ${
                    landFenced === "yes" ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
                <Text className="ml-2">Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setLandFenced("no")}
                className="flex-row items-center"
              >
                <View
                  className={`w-5 h-5 rounded-full ${
                    landFenced === "no" ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
                <Text className="ml-2">No</Text>
              </TouchableOpacity>
            </View>

            <Text className="pt-5 pl-3 pb-3 font-bold">
              Are there any perennial crops?
            </Text>
            <View className="flex-row justify-around mb-5">
              <TouchableOpacity
                onPress={() => setPerennialCrop("yes")}
                className="flex-row items-center"
              >
                <View
                  className={`w-5 h-5 rounded-full ${
                    perennialCrop === "yes" ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
                <Text className="ml-2">Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPerennialCrop("no")}
                className="flex-row items-center"
              >
                <View
                  className={`w-5 h-5 rounded-full ${
                    perennialCrop === "no" ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
                <Text className="ml-2">No</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : category == "Tools" ? (
          <View className="flex-1 pt-[5%]">
            <View>
              <Text className="mt-4 text-sm">Asset</Text>
              <View className="border border-gray-300 rounded-full bg-gray-100">
                <Picker
                  selectedValue={assetname}
                  onValueChange={(itemValue: any) => setAssetname(itemValue)}
                >
                  <Picker.Item label="Hand Fork" value="hoe" />
                  <Picker.Item label="Cutting knife" value="hoe" />
                  <Picker.Item label="Iluk kaththa" value="hoe" />
                  <Picker.Item label="Kaththa" value="hoe" />
                  <Picker.Item label="Kara diga manna" value="hoe" />
                  <Picker.Item label="Coconut harvesting knife" value="hoe" />
                  <Picker.Item label="Tapping knife" value="hoe" />
                  <Picker.Item label="Mamotie" value="hoe" />
                  <Picker.Item label="Manna knife" value="hoe" />
                  <Picker.Item label="Shovel" value="hoe" />
                  <Picker.Item label="Small axe" value="hoe" />
                  <Picker.Item label="Puning knife" value="hoe" />
                  <Picker.Item label="Hoe with fork" value="hoe" />
                  <Picker.Item label="Fork hoe" value="hoe" />
                  <Picker.Item label="Sickle - paddy" value="hoe" />
                  <Picker.Item label="Grow bags" value="hoe" />
                  <Picker.Item label="Seedling tray" value="hoe" />
                  <Picker.Item label="Fogger" value="hoe" />
                  <Picker.Item label="Drip Irrigation system" value="hoe" />
                  <Picker.Item label="Sprinkler Irrigation system" value="hoe" />
                  <Picker.Item label="Water pump" value="hoe" />
                  <Picker.Item label="Water tank" value="hoe" />
                  <Picker.Item label="Other" value="Other" />
                </Picker>
              </View>
            </View>

            {assetname == "Other" && (
              <View>
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
              <View className="border border-gray-300 rounded-full bg-gray-100">
                <Picker
                  selectedValue={toolbrand}
                  onValueChange={(itemValue: any) => setToolbrand(itemValue)}
                >
                 <Picker.Item label="Lakloha" value="Lakloha" />
  <Picker.Item label="Crocodile" value="Crocodile" />
  <Picker.Item label="Chillington" value="Chillington" />
  <Picker.Item label="Lanlo" value="Lanlo" />
  <Picker.Item label="DBL" value="DBL" />
  <Picker.Item label="Browns" value="Browns" />
  <Picker.Item label="Hayles" value="Hayles" />
  <Picker.Item label="Janatha steel" value="Janatha steel" />
  <Picker.Item label="Lakwa" value="Lakwa" />
  <Picker.Item label="CS Agro" value="CS Agro" />
  <Picker.Item label="Aswenna" value="Aswenna" />
  <Picker.Item label="Hayles" value="Hayles" />
  <Picker.Item label="Piyadasa Agro" value="Piyadasa Agro" />
  <Picker.Item label="Lak agro" value="Lak agro" />
  <Picker.Item label="John Piper International" value="John Piper International" />
  <Picker.Item label="Dinapala" value="Dinapala" />
  <Picker.Item label="ANTON" value="ANTON" />
  <Picker.Item label="ARPICO" value="ARPICO" />
  <Picker.Item label="S-lon" value="S-lon" />
  <Picker.Item label="Singer" value="Singer" />
  <Picker.Item label="INGCO" value="INGCO" />
  <Picker.Item label="Jinasena" value="Jinasena" />
                </Picker>
              </View>
              <Text className="mt-4 text-sm">Number of Units</Text>
              <TextInput
                className="border border-gray-300 p-2 rounded-full bg-gray-100"
                placeholder="Enter number of units"
                value={numberOfUnits}
                onChangeText={setNumberOfUnits}
                keyboardType="numeric"
              />

              <Text className="mt-4 text-sm">Unit Price</Text>
              <TextInput
                className="border border-gray-300 p-2 rounded-full bg-gray-100"
                placeholder="Enter unit price"
                value={unitPrice}
                onChangeText={setUnitPrice}
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
              <TouchableOpacity
                onPress={() => setWarranty("yes")}
                className="flex-row items-center"
              >
                <View
                  className={`w-5 h-5 rounded-full ${
                    warranty === "yes" ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
                <Text className="ml-2">Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setWarranty("no")}
                className="flex-row items-center"
              >
                <View
                  className={`w-5 h-5 rounded-full ${
                    warranty === "no" ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
                <Text className="ml-2">No</Text>
              </TouchableOpacity>
            </View>

            {/* Conditional Date Pickers */}
            {warranty === "yes" && (
              <>
                <Text className="pt-5 pl-3 pb-3 font-bold">Purchased Date</Text>
                <TouchableOpacity
                  onPress={() => setShowPurchasedDatePicker(true)}
                >
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

                <Text className="pt-5 pl-3 pb-3 font-bold">
                  Warranty Expire Date
                </Text>
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
                    className="pb-[20%]"
                  />
                )}

                <Text className="pt-5 pl-3 pb-3 font-bold">
                  Warranty Status
                </Text>

                {/* Additional Picker */}
                <View className="border border-gray-300 rounded-full bg-gray-100">
                  <Picker
                    selectedValue={warrantystatus}
                    onValueChange={(itemValue: any) => itemValue}
                  >
                    {warrantystatus.map((item) => (
                      <Picker.Item
                        label={item.value}
                        value={item.value}
                        key={item.key}
                      />
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
              <Picker
                selectedValue={type}
                onValueChange={(itemValue: any) => setType(itemValue)}
              >
          <Picker.Item label="Barn" value="Barn" />
          <Picker.Item label="Silo" value="Silo" />
          <Picker.Item label="Greenhouse structure" value="Greenhouse structure" />
          <Picker.Item label="Storage facility" value="Storage facility" />
          <Picker.Item label="Storage shed" value="Storage shed" />
          <Picker.Item label="Processing facility" value="Processing facility" />
          <Picker.Item label="Packing shed" value="Packing shed" />
          <Picker.Item label="Dairy parlor" value="Dairy parlor" />
          <Picker.Item label="Poultry house" value="Poultry house" />
          <Picker.Item label="Livestock shelter" value="Livestock shelter" />

                {/* Add other types as needed */}
              </Picker>
            </View>

            {/* Floor Area */}
            <Text className="mt-4 text-sm">Floor Area (sqr ft)</Text>
            <TextInput
              className="border border-gray-300 p-2 rounded-full bg-gray-100"
              placeholder="Enter floor area"
              value={floorArea}
              onChangeText={setFloorArea}
            />

            {/* Ownership Picker */}
            <Text className="mt-4 text-sm">Ownership</Text>
            <View className="border border-gray-300 rounded-full bg-gray-100">
              <Picker
                selectedValue={ownership}
                onValueChange={(itemValue: any) => setOwnership(itemValue)}
              >
                {ownershipCategories.map((item) => (
                  <Picker.Item
                    label={item.value}
                    value={item.value}
                    key={item.key}
                  />
                ))}
              </Picker>
            </View>

            {/* Conditional Ownership Fields */}
            {ownership === "Own Building (with title ownership)" && (
              <View>
                <Text className="mt-4 text-sm">
                  Estimated Building Value (LKR)
                </Text>
                <TextInput
                  className="border border-gray-300 p-2 rounded-full bg-gray-100"
                  placeholder="Enter estimated value"
                  value={estimateValue}
                  onChangeText={setEstimatedValue}
                />
              </View>
            )}
            {/***************************************************************************************LEASE BUILDING SECTION*****************************************************/}
            {ownership === "Leased Building" && (
              <View className="pt-[3%]">
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
                <View className="flex-row gap-x-5 items-center">
                  <TextInput
                    className="border border-gray-300 p-2 w-[110px] rounded-full bg-gray-100"
                    value={durationYears}
                    onChangeText={setDurationYears}
                    keyboardType="numeric"
                  />
                  <Text className=" pt-3">Years</Text>

                  <TextInput
                    className="border border-gray-300  p-2 w-[110px] rounded-full bg-gray-100"
                    value={durationMonths}
                    onChangeText={setDurationMonths}
                    keyboardType="numeric"
                  />
                  <Text className="pt-3">Months</Text>
                </View>
                <View className="pt-[5%]">
                  <Text>Leased Amount Annually (LKR)</Text>
                  <TextInput
                    className="border border-gray-300 p-2 rounded-full bg-gray-100"
                    value={leastAmountAnnually}
                    onChangeText={setLeastAmountAnnually}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            )}

            {/***************************************************************************************Permit BUILDING SECTION*****************************************************/}
            {ownership == "Permit Building" && (
              <View className="pt-[3%]">
                <Text>Issued Date</Text>
                <TouchableOpacity
                  onPress={() => setShowLbIssuedDatePicker(true)}
                >
                  <View className="border border-gray-300 p-2 rounded-full bg-gray-100">
                    <Text>
                      {lbissuedDate
                        ? lbissuedDate.toLocaleDateString()
                        : "Select Date"}
                    </Text>
                  </View>
                </TouchableOpacity>
                {showLbIssuedDatePicker && (
                  <DateTimePicker
                    value={lbissuedDate || new Date()} // Set to current date if lbissuedDate is not set
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      if (event.type === "set") {
                        // Check if the user selected a date (not canceled)
                        onPermitIssuedDateChange(event, selectedDate);
                        setShowLbIssuedDatePicker(false); // Close the DateTimePicker after selection
                      } else {
                        setShowLbIssuedDatePicker(false); // Close the DateTimePicker on cancel
                      }
                    }}
                  />
                )}
                <View className="pt-[2%]">
                  <Text>Permit Fee Annually (LKR)</Text>
                  <TextInput
                    className="border border-gray-300 p-2 rounded-full bg-gray-100"
                    value={permitFeeAnnually}
                    onChangeText={setPermitFeeAnnually}
                    keyboardType="numeric"
                    placeholder="Enter Annual Building Permit"
                  />
                </View>
              </View>
            )}

            {ownership == "Shared / No Ownership" && (
              <View className="pt-[3%]">
                <Text>Payment Annually (LKR)</Text>
                <TextInput
                  className="border border-gray-300 p-2 rounded-full bg-gray-100"
                  value={paymentAnnually}
                  onChangeText={setPaymentAnnually}
                  keyboardType="numeric"
                  placeholder="Enter Annual Payment Billing"
                />
              </View>
            )}

            {/* General Condition */}
            <Text className="mt-4 text-sm">General Condition</Text>
            <View className="border border-gray-300 rounded-full bg-gray-100">
              <Picker
                selectedValue={generalCondition}
                onValueChange={(itemValue: any) =>
                  setGeneralCondition(itemValue)
                }
              >
                {generalConditionOptions.map((item) => (
                  <Picker.Item
                    label={item.value}
                    value={item.value}
                    key={item.key}
                  />
                ))}
              </Picker>
            </View>

            {/* District Picker */}
            <Text className="mt-4 text-sm">District</Text>
            <View className="border border-gray-300 rounded-full bg-gray-100">
              <Picker
                selectedValue={district}
                onValueChange={(itemValue: any) => setDistrict(itemValue)}
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
          </View>
        )}
        <View className="flex-1 items-center pt-10">
          <TouchableOpacity
            className="bg-gray-900 p-4 rounded-3xl mb-6 h-13 w-60"
            onPress={submitData}
          >
            <Text className="text-white text-lg text-center">Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Navigation Bar */}
      <NavigationBar navigation={navigation} />
    </View>
  );
};

export default AddAsset;
