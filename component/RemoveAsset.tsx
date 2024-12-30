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
import AntDesign from "react-native-vector-icons/AntDesign";
import NavigationBar from "@/Items/NavigationBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

type RemoveAssetNavigationProp = StackNavigationProp<
  RootStackParamList,
  "RemoveAsset"
>;

interface RemoveAssetProps {
  navigation: RemoveAssetNavigationProp;
}

interface Asset {
  id: number;
  asset: string;
  brand: string;
  batchNum: string;
  category: string;
  createdAt: string;
  expireDate: string;
  numOfUnit: string;
  purchaseDate: string;
  status: string;
  total: string;
  unit: string;
  unitPrice: string;
  unitVolume: number;
  userId: number;
}

const RemoveAsset: React.FC<RemoveAssetProps> = ({ navigation }) => {
  const [category, setCategory] = useState("Select Category");
  const [assetId, setAssetId] = useState("");
  const [asset, setAsset] = useState("");
  const [brand, setBrand] = useState("");
  const [batchNum, setBatchNum] = useState("");
  const [volume, setVolume] = useState(""); // Store the unit volume
  const [unit, setUnit] = useState("l"); // Default unit to 'l' for liters
  const [numberOfUnits, setNumberOfUnits] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [availableUnits, setAvailableUnits] = useState(0); // Store the available number of units
  const [assets, setAssets] = useState<Asset[]>([]); // Array of fetched assets
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    if (numberOfUnits && unitPrice) {
      const total = parseFloat(numberOfUnits) * parseFloat(unitPrice);
      setTotalPrice(total.toString());
    }
  }, [numberOfUnits, unitPrice]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Error", "No token found");
        return;
      }

      const response = await axios.get(
        `${environment.API_BASE_URL}api/auth/assets`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params: { category },
        }
      );

      const fetchedAssets = response.data.assets;

      if (!fetchedAssets || fetchedAssets.length === 0) {
        Alert.alert(
          "No Assets Found",
          "There are no assets available for the selected category."
        );
      } else {
        setAssets(fetchedAssets);
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
      Alert.alert("Error", "No assets found.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (category !== "Select Category") {
      fetchAssets();
    }
  }, [category]);

  const handleRemoveAsset = async () => {
    if (parseFloat(numberOfUnits) > availableUnits) {
      Alert.alert(t("CurrentAssets.sorry"), t("CurrentAssets.YouCannotRemove"));
      return;
    }

    if (parseFloat(totalPrice) > parseFloat(unitPrice) * availableUnits) {
      Alert.alert(
        "Error",
        "The total price cannot exceed the available total value."
      );
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Error", "No token found");
        return;
      }

      const response = await axios.delete(
        `${environment.API_BASE_URL}api/auth/removeAsset/${category}/${assetId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          data: {
            numberOfUnits,
            totalPrice,
          },
        }
      );
      Alert.alert(t("CurrentAssets.Success"), t("CurrentAssets.RemoveSuccess"))
      navigation.navigate("CurrentAssert");
    } catch (error) {
      Alert.alert(t("CurrentAssets.Failed"), t("CurrentAssets.RemoveFailed"))
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View
        className="flex-row justify-between  "
        style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} className="">
          <AntDesign name="left" size={24} color="#000502" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-lg font-bold">{t("FixedAssets.myAssets")}</Text>
        </View>
      </View>

      {/* Tabs */}
      {/* <View className='flex-row ml-8 mr-8  justify-center'>
                <View className='w-1/2'>
                    <TouchableOpacity onPress={() => navigation.navigate('CurrentAssert')}>
                        <Text className=' text-green-400 text-center text-lg'>{t("CurrentAssets.currentAssets")}</Text>
                        <View className="border-t-[2px] border-green-400" />
                    </TouchableOpacity>
                </View>
                <View className='w-1/2'>
                    <TouchableOpacity onPress={() => navigation.navigate('fixedDashboard')}>
                        <Text className='text-gray-400 text-center text-lg'>{t("CurrentAssets.fixedAssets")}</Text>
                        <View className="border-t-[2px] border-gray-400" />
                    </TouchableOpacity>
                </View>
            </View> */}

      {/* Input Fields */}
      <View className="space-y-4 p-8">
        <View className="">
          <Text className="text-gray-600 mb-2">
            {t("CurrentAssets.category")}
          </Text>
          <View className="bg-gray-200 rounded-[30px]">
            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => {
                setCategory(itemValue);
                setAssetId("");
                if (itemValue !== "Other Consumables") {
                  setAsset("");
                }
              }}
              className="bg-gray-200 rounded"
            >
              <Picker.Item
                label={t("CurrentAssets.selectcategory")}
                value="Select Category"
              />
              <Picker.Item
                label={t("CurrentAssets.Agro chemicals ")}
                value="Agro Chemicals"
              />
              <Picker.Item
                label={t("CurrentAssets.Fertilizers")}
                value="Fertilizers"
              />
              {/* <Picker.Item label="Machinery" value="Machinery" />
                            <Picker.Item label="Greenhouse" value="Greenhouse" /> */}
              <Picker.Item
                label={t("CurrentAssets.Seeds and Seedlings")}
                value="Seeds and Seedlings"
              />
              <Picker.Item
                label={t("CurrentAssets.Livestock for sale")}
                value="Livestock for Sale"
              />
              <Picker.Item
                label={t("CurrentAssets.Animal feed")}
                value="Animal Feed"
              />
              <Picker.Item
                label={t("CurrentAssets.Other consumables")}
                value="Other Consumables"
              />
            </Picker>
          </View>

          <Text className="text-gray-600 mt-4 mb-2">
            {t("CurrentAssets.asset")}
          </Text>
          <View className="bg-gray-200 rounded-[30px]">
            <Picker
              selectedValue={asset}
              onValueChange={(itemValue) => {
                const selectedAsset = assets.find(
                  (assetItem: Asset) => assetItem.asset === itemValue
                );
                if (selectedAsset) {
                  setAsset(selectedAsset.asset);
                  setAssetId(selectedAsset.id.toString());
                  setVolume(selectedAsset.unitVolume.toString());
                  setAvailableUnits(parseFloat(selectedAsset.numOfUnit));
                  setUnitPrice(selectedAsset.unitPrice);
                  setBrand(selectedAsset.brand);
                  setBatchNum(selectedAsset.batchNum);
                } else {
                  setAsset("");
                  setAssetId("");
                }
              }}
              className="bg-gray-200 rounded"
            >
              <Picker.Item label={t("CurrentAssets.selectasset")} value="" />
              {assets.map((assetItem, index) => (
                <Picker.Item
                  key={index}
                  label={assetItem.asset}
                  value={assetItem.asset}
                />
              ))}
            </Picker>
          </View>
        </View>

        <Text className="text-gray-600">{t("CurrentAssets.brand")}</Text>
        <TextInput
          placeholder={t("CurrentAssets.brand")}
          value={brand}
          onChangeText={setBrand}
          className="bg-gray-200 p-2 pl-4 rounded-[30px] h-[50px]"
          editable={false}
        />

        <Text className="text-gray-600">{t("CurrentAssets.batchnumber")}</Text>
        <TextInput
          placeholder={t("CurrentAssets.batchnumber")}
          value={batchNum}
          onChangeText={setBatchNum}
          className="bg-gray-200 p-2 pl-4 rounded-[30px] h-[50px]"
          editable={false}
        />

        <Text className="text-gray-600 ">
          {t("CurrentAssets.unitvolume_weight")}
        </Text>
        <View className="flex-row items-center justify-between bg-white">
          <TextInput
            placeholder={t("CurrentAssets.unitvolume_weight")}
            value={volume}
            editable={false}
            className="flex-1 mr-2 py-2 pl-4 p-3  bg-gray-200 rounded-full"
          />

          <View className="bg-gray-200 rounded-full  w-32">
            <Picker
              selectedValue={unit}
              onValueChange={(itemValue) => setUnit(itemValue)}
              className="flex-1"
              dropdownIconColor="gray"
            >
              <Picker.Item label={t("CurrentAssets.ml")} value="ml" />
              <Picker.Item label={t("CurrentAssets.kg")} value="kg" />
              <Picker.Item label={t("CurrentAssets.l")} value="l" />
            </Picker>
          </View>
        </View>

        <Text className="text-gray-600">
          {t("CurrentAssets.numberofunits")}
        </Text>
        <Text className="text-gray-600">
        {t("CurrentAssets.NumOfUnits")} ({t("CurrentAssets.Max")}: {availableUnits})
        </Text>
        <TextInput
          placeholder={t("CurrentAssets.numberofunits")}
          value={numberOfUnits}
          onChangeText={(value) => {
            if (parseFloat(value) > availableUnits) {
              Alert.alert(t("CurrentAssets.sorry"), t("CurrentAssets.YouCannotRemove"));
            } else {
              setNumberOfUnits(value);
            }
          }}
          keyboardType="numeric"
          className="bg-gray-200 p-2 mt-5 pl-4 rounded-[30px] h-[50px]"
        />

        <Text className="text-gray-600">{t("CurrentAssets.unitprice")}</Text>
        <TextInput
          placeholder={t("CurrentAssets.unitprice")}
          value={unitPrice}
          onChangeText={setUnitPrice}
          keyboardType="numeric"
          editable={false}
          className="bg-gray-200 p-2 rounded-[30px] pl-4 h-[50px]"
        />

        <Text className="text-gray-600">{t("CurrentAssets.totalprice")}</Text>
        <TextInput
          placeholder={t("CurrentAssets.totalprice")}
          value={totalPrice}
          editable={false}
          className="bg-gray-200 p-2 rounded-[30px] pl-4 h-[50px]"
        />

        <TouchableOpacity
          onPress={handleRemoveAsset}
          className="bg-green-400 p-4 rounded-[30px] mt-8"
        >
          <Text className="text-white text-center">
            {t("CurrentAssets.removeAsset")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* <NavigationBar navigation={navigation} /> */}
    </ScrollView>
  );
};

export default RemoveAsset;
