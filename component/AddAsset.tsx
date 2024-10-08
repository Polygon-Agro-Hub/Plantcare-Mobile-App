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
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Select Category");
  const [selectedAsset, setSelectedAsset] = useState("");
  const [brands, setBrands] = useState<string[]>([]);
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
  const [assets, setAssets] = useState<any[]>([]);

  useEffect(() => {
    const data = require("../asset.json"); // Adjust the path as necessary
    setCategories(Object.keys(data));
  }, []);

  useEffect(() => {
    if (numberOfUnits && unitPrice) {
      const total = parseFloat(numberOfUnits) * parseFloat(unitPrice);
      setTotalPrice(total.toString());
    }
  }, [numberOfUnits, unitPrice]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const selectedAssets = require("../asset.json")[category];
    setAssets(selectedAssets);
    setSelectedAsset("");
    setBrand("");
    setBrands([]);
  };

  const handleAssetChange = (asset: string) => {
    setSelectedAsset(asset);
    const selected = assets.find((a) => a.asset === asset);
    if (selected) {
      setBrands(selected.brands);
      setBrand("");
    }
  };

  const handleDateChange = (event: any, selectedDate: any, type: any) => {
    const currentDate = selectedDate || new Date();
    const dateString = currentDate.toISOString().slice(0, 10);
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

      Alert.alert("Asset added successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error adding asset:", error);
      Alert.alert("Error adding asset");
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
          <TouchableOpacity onPress={() => navigation.navigate("CurrentAssert")}>
            <Text className="text-green-400 text-center text-lg">
              Current Assets
            </Text>
            <View className="border-t-[2px] border-green-400" />
          </TouchableOpacity>
        </View>
        <View className="w-1/2">
          <TouchableOpacity onPress={() => navigation.navigate("fixedDashboard")}>
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

        <Text className="text-gray-600">Unit Volume / Weight</Text>
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
              className="bg-gray-200 h-[55px] rounded-[30px]"
            >
              <Picker.Item label="ml" value="ml" />
              <Picker.Item label="l" value="l" />
              <Picker.Item label="kg" value="kg" />
              <Picker.Item label="g" value="g" />
              <Picker.Item label="oz" value="oz" />
            </Picker>
          </View>
        </View>

        <Text className="text-gray-600">Number of Units</Text>
        <TextInput
          placeholder="Enter Number of Units"
          value={numberOfUnits}
          onChangeText={setNumberOfUnits}
          keyboardType="numeric"
          className="bg-gray-200 p-2 rounded-[30px] h-[50px]"
        />

        <Text className="text-gray-600">Unit Price (Rs)</Text>
        <TextInput
          placeholder="Enter Unit Price"
          value={unitPrice}
          onChangeText={setUnitPrice}
          keyboardType="numeric"
          className="bg-gray-200 p-2 rounded-[30px] h-[50px]"
        />

        <Text className="text-gray-600">Total (Rs)</Text>
        <TextInput
          placeholder="Total"
          value={totalPrice}
          onChangeText={setTotalPrice}
          keyboardType="numeric"
          editable={false}
          className="bg-gray-200 p-2 rounded-[30px] h-[50px]"
        />

        <Text className="text-gray-600">Purchase Date</Text>
        <TouchableOpacity onPress={() => setShowPurchaseDatePicker(true)}>
          <TextInput
            placeholder="Enter Purchase Date"
            value={purchaseDate}
            editable={false}
            className="bg-gray-200 p-2 rounded-[30px] h-[50px]"
          />
        </TouchableOpacity>
        {showPurchaseDatePicker && (
          <DateTimePicker
            testID="purchaseDatePicker"
            value={new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) =>
              handleDateChange(event, selectedDate, "purchase")
            }
          />
        )}

        <Text className="text-gray-600">Expire Date</Text>
        <TouchableOpacity onPress={() => setShowExpireDatePicker(true)}>
          <TextInput
            placeholder="Enter Expire Date"
            value={expireDate}
            editable={false}
            className="bg-gray-200 p-2 rounded-[30px] h-[50px]"
          />
        </TouchableOpacity>
        {showExpireDatePicker && (
          <DateTimePicker
            testID="expireDatePicker"
            value={new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) =>
              handleDateChange(event, selectedDate, "expire")
            }
          />
        )}

        <Text className="text-gray-600">Warranty (Months)</Text>
        <TextInput
          placeholder="Enter Warranty"
          value={warranty}
          onChangeText={setWarranty}
          keyboardType="numeric"
          className="bg-gray-200 p-2 rounded-[30px] h-[50px]"
        />
      </View>

      <View className="p-8">
        <TouchableOpacity
          onPress={handleAddAsset}
          className="p-3 bg-green-600 rounded-full"
        >
          <Text className="text-center text-white">Add Asset</Text>
        </TouchableOpacity>
      </View>

      <NavigationBar navigation={navigation} />
    </ScrollView>
  );
};

export default AddAssetScreen;
