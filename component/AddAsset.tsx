import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { RootStackParamList } from "./types";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import NavigationBar from "@/Items/NavigationBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { environment } from "@/environment/environment";

type AddAssetNavigationProp = StackNavigationProp<
  RootStackParamList,
  "AddAsset"
>;

interface AddAssetProps {
  navigation: AddAssetNavigationProp;
}

const AddAssetScreen: React.FC<AddAssetProps> = ({ navigation }) => {
  const [categories, setCategories] = useState<string[]>([]); // To store categories from assets.json
  const [selectedCategory, setSelectedCategory] = useState("Select Category");
  const [selectedAsset, setSelectedAsset] = useState("");
  const [brands, setBrands] = useState<string[]>([]); // To store brands for the selected asset
  const [brand, setBrand] = useState("");
  const [batchNum, setBatchNum] = useState("");
  const [volume, setVolume] = useState("");
  const [unit, setUnit] = useState("ml");
  const [numberOfUnits, setNumberOfUnits] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [expireDate, setExpireDate] = useState("");
  const [warranty, setWarranty] = useState("");
  const [status, setStatus] = useState("Expired");
  const [showPurchaseDatePicker, setShowPurchaseDatePicker] = useState(false);
  const [showExpireDatePicker, setShowExpireDatePicker] = useState(false);
  const [assets, setAssets] = useState<any[]>([]); // To store assets based on selected category

  useEffect(() => {
    // Load categories from assets.json
    const data = require("../asset.json"); // Adjust the path as necessary
    setCategories(Object.keys(data)); // Get category names
  }, []);

  useEffect(() => {
    if (numberOfUnits && unitPrice) {
      const total = parseFloat(numberOfUnits) * parseFloat(unitPrice);
      setTotalPrice(total.toString());
    }
  }, [numberOfUnits, unitPrice]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const selectedAssets = require("../asset.json")[category]; // Get assets for selected category
    setAssets(selectedAssets);
    setSelectedAsset(""); // Reset selected asset when category changes
    setBrand(""); // Reset brand when category changes
    setBrands([]); // Clear brands when category changes
  };

  const handleAssetChange = (asset: string) => {
    setSelectedAsset(asset);
    const selected = assets.find((a) => a.asset === asset);
    if (selected) {
      setBrands(selected.brands); // Set brands based on selected asset
      setBrand(""); // Reset selected brand when asset changes
    }
  };

  const handleDateChange = (event: any, selectedDate: any, type: any) => {
    const currentDate = selectedDate || new Date();
    const dateString = currentDate.toISOString().slice(0, 10); // Format to 'YYYY-MM-DD'
    if (type === "purchase") {
      if (new Date(dateString) > new Date()) {
        Alert.alert("Invalid Date", "Purchase date cannot be a future date.");
        return;
      }
      setPurchaseDate(dateString);
      setShowPurchaseDatePicker(false);
      if (expireDate && new Date(dateString) > new Date(expireDate)) {
        Alert.alert(
          "Invalid Date",
          "Expire date cannot be before the purchase date."
        );
        setExpireDate("");
      }
    } else if (type === "expire") {
      if (new Date(dateString) < new Date(purchaseDate)) {
        Alert.alert(
          "Invalid Date",
          "Expire date cannot be before the purchase date."
        );
        return;
      }
      setExpireDate(dateString);
      setShowExpireDatePicker(false);
      // Automatically update the status based on the expire date
      setStatus(new Date(dateString) < new Date() ? "Expired" : "Still valid");
    }
  };

  const handleAddAsset = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Error", "No token found");
        return;
      }
      const response = await axios.post(
        `${environment.API_BASE_URL}api/auth/currentAsset`,
        {
          category: selectedCategory,
          asset: selectedAsset,
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
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("hi...... hi.....Asset added successfully:", response.data);
      Alert.alert("Asset added successfully!");
      navigation.goBack();
      // Optionally, you can navigate to another screen or show a success message here
    } catch (error) {
      console.error("Error adding asset:", error);
      // Optionally, you can show an error message to the user here
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg mr-[40%] font-bold">My Assets</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row ml-8 mr-8 mt-8 justify-center">
        <View className="w-1/2">
          <TouchableOpacity
            onPress={() => navigation.navigate("CurrentAssert")}
          >
            <Text className="text-green-400 text-center text-lg">
              Current Assets
            </Text>
            <View className="border-t-[2px] border-green-400" />
          </TouchableOpacity>
        </View>
        <View className="w-1/2">
          <TouchableOpacity
          onPress={() => navigation.navigate("fixedDashboard")}>
            <Text className="text-gray-400 text-center text-lg">
              Fixed Assets
            </Text>
            <View className="border-t-[2px] border-gray-400" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Input Fields */}
      <View className="space-y-4 p-8">
        <View>
          <Text className="text-gray-600 mb-2">Select Category</Text>
          <View className="bg-gray-200 rounded-[30px]">
            <Picker
              selectedValue={selectedCategory}
              onValueChange={handleCategoryChange}
              className="bg-gray-200 rounded"
            >
              {/* <Picker.Item label="Select Category" value="" /> */}
              {categories.map((cat, index) => (
                <Picker.Item key={index} label={cat} value={cat} />
              ))}
            </Picker>
          </View>

          <Text className="text-gray-600 mt-4 mb-2">Asset</Text>
          {selectedCategory === "Other Consumables" ? (
            <TextInput
              placeholder="Type Asset Name"
              value={selectedAsset}
              onChangeText={setSelectedAsset}
              className="bg-gray-100 p-2 rounded-[30px] h-[50px]"
            />
          ) : (
            <View className="bg-gray-200 rounded-[30px]">
              <Picker
                selectedValue={selectedAsset}
                onValueChange={handleAssetChange}
                className="bg-gray-200 rounded"
              >
                <Picker.Item label="Select Asset" value="" />
                {assets.map((asset, index) => (
                  <Picker.Item
                    key={index}
                    label={asset.asset}
                    value={asset.asset}
                  />
                ))}
              </Picker>
            </View>
          )}
        </View>

        <Text className="text-gray-600">Brand</Text>
        <View className="bg-gray-200 rounded-[30px]">
          <Picker
            selectedValue={brand}
            onValueChange={setBrand}
            className="bg-gray-200 p-2 rounded-[30px] h-[50px]"
          >
            <Picker.Item label="Select Brand" value="" />
            {brands.map((b, index) => (
              <Picker.Item key={index} label={b} value={b} />
            ))}
          </Picker>
        </View>

        <Text className="text-gray-600">Batch Number</Text>
        <TextInput
          placeholder="Batch Number"
          value={batchNum}
          onChangeText={setBatchNum}
          className="bg-gray-200 p-2 rounded-[30px] h-[50px]"
        />

        <Text className="text-gray-600 ">Unit Volume / Weight</Text>
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
              <Picker.Item label="ml" value="ml" />
              <Picker.Item label="kg" value="kg" />
            </Picker>
          </View>
        </View>
        <Text className="text-gray-600">Number of Units</Text>
        <TextInput
          placeholder="Number of Units"
          value={numberOfUnits}
          onChangeText={setNumberOfUnits}
          className="bg-gray-200 p-2 rounded-[30px] h-[50px]"
          keyboardType="numeric"
        />
        <Text className="text-gray-600">Unit Price</Text>
        <TextInput
          placeholder="Unit Price"
          value={unitPrice}
          onChangeText={setUnitPrice}
          className="bg-gray-200 p-2 rounded-[30px] h-[50px]"
          keyboardType="numeric"
        />
        <Text className="text-gray-600">Total Price</Text>
        <TextInput
          placeholder="Total Price"
          value={totalPrice}
          editable={false}
          className="bg-gray-200 p-2 rounded-[30px] h-[50px]"
        />

        {/* Purchase Date */}
        <Text className="text-gray-600">Purchase Date</Text>
        <TouchableOpacity
          onPress={() => setShowPurchaseDatePicker(true)}
          className="bg-gray-200 p-2 rounded-[30px] h-[50px] justify-center"
        >
          <Text>{purchaseDate ? purchaseDate : "Select Purchase Date"}</Text>
        </TouchableOpacity>
        {showPurchaseDatePicker && (
          <DateTimePicker
            value={purchaseDate ? new Date(purchaseDate) : new Date()} // Use selected purchase date or current date
            mode="date"
            display="default"
            onChange={(event, date) =>
              handleDateChange(event, date, "purchase")
            }
          />
        )}

        <Text className="text-gray-600">Expire Date</Text>
        <TouchableOpacity
          onPress={() => setShowExpireDatePicker(true)}
          className="bg-gray-200 p-2 rounded-[30px] h-[50px] justify-center"
        >
          <Text>{expireDate ? expireDate : "Select Expire Date"}</Text>
        </TouchableOpacity>
        {showExpireDatePicker && (
          <DateTimePicker
            value={expireDate ? new Date(expireDate) : new Date()} // Use selected expire date or current date
            mode="date"
            display="default"
            onChange={(event, date) => handleDateChange(event, date, "expire")}
          />
        )}

        <Text className="text-gray-600">Warranty (in months)</Text>
        <TextInput
          placeholder="Warranty"
          value={warranty}
          onChangeText={setWarranty}
          keyboardType="numeric"
          className="bg-gray-200 p-2 rounded-[30px] h-[50px]"
        />

        <Text className="text-gray-600">Status</Text>
        <View className="bg-gray-200 rounded-[30px]">
          <Picker
            selectedValue={status}
            onValueChange={setStatus}
            className="bg-gray-200 rounded"
            style={{ display: "none" }}
          >
            <Picker.Item label="Expired" value="Expired" />
            <Picker.Item label="Active" value="still valid" />
          </Picker>
        </View>
        <View className="bg-gray-200 rounded-[40px] p-4 items-center justify-center">
          <Text
            className={`text-lg font-bold ${
              status === "Expired" ? "text-red-500" : "text-green-500"
            }`}
          >
            {status}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleAddAsset}
          className="bg-green-500 p-3 rounded-[30px] mt-4"
        >
          <Text className="text-white text-center">Add Asset</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation Bar */}
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <NavigationBar navigation={navigation} />
      </View>
    </ScrollView>
  );
};

export default AddAssetScreen;
