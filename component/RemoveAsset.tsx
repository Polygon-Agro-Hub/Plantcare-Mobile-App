import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { RootStackParamList } from "./types";
import { StackNavigationProp } from "@react-navigation/stack";
import AntDesign from "react-native-vector-icons/AntDesign";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import DropDownPicker from "react-native-dropdown-picker";
import { set } from "lodash";
import { useFocusEffect } from "@react-navigation/native";

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
  const [assetId, setAssetId] = useState("");
  const [asset, setAsset] = useState("");
  const [brand, setBrand] = useState("");
  const [batchNum, setBatchNum] = useState("");
  const [volume, setVolume] = useState("");
  const [numberOfUnits, setNumberOfUnits] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [availableUnits, setAvailableUnits] = useState(0);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssetsByBrand, setFilteredAssetsByBrand] = useState<Asset[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [filteredAssetsByBatch, setFilteredAssetsByBatch] = useState<Asset[]>([]);
  const [availableBatches, setAvailableBatches] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const [openCategorylist, setOpenCategorylist] = useState(false);
  const [openAsset, setOpenAsset] = useState(false);
  const [openBrand, setOpenBrand] = useState(false);
  const [openBatch, setOpenBatch] = useState(false);
  const [openUnit, setOpenUnit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState("");

  // Close all other dropdowns when one opens
  const closeAllDropdowns = (except?: string) => {
    if (except !== 'category') setOpenCategorylist(false);
    if (except !== 'asset') setOpenAsset(false);
    if (except !== 'brand') setOpenBrand(false);
    if (except !== 'batch') setOpenBatch(false);
    if (except !== 'unit') setOpenUnit(false);
  };

  useEffect(() => {
    if (numberOfUnits && unitPrice) {
      const total = parseFloat(numberOfUnits) * parseFloat(unitPrice);
      setTotalPrice(total.toString());
    }
  }, [numberOfUnits, unitPrice]);

  useFocusEffect(
    useCallback(() => {
      // Clear search query every time screen comes into focus
      setAssets([]);
      setAsset("")
      setBrand("");
      setBatchNum("");
      setVolume("");
      setUnitPrice("");
      setAvailableUnits(0);
      setNumberOfUnits("");
      setTotalPrice("");
      setCategory("")
      setUnit("")
      closeAllDropdowns();
    }, [])
  );

  const fetchAssets = async () => {
    if (!category || category.trim() === "") {
      return;
    }
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

      console.log("=============", response.data);

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
      setAssets([]);
      setBrand("");
      setBatchNum("");
      setVolume("");
      setUnitPrice("");
      setAvailableUnits(0);
      setNumberOfUnits("");
      setTotalPrice("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (category && category.trim() !== "") {
      console.log("hittttt");
      fetchAssets();
    }
  }, [category]);

  const handleAssetSelection = (selectedAssetName: string) => {
    console.log("hit");
    const assetsWithSameName = assets.filter(
      (assetItem: Asset) => assetItem.asset === selectedAssetName
    );

    setFilteredAssetsByBrand(assetsWithSameName);

    const brands = assetsWithSameName.map((assetItem: Asset) => assetItem.brand);
    const uniqueBrands = [...new Set(brands)];
    console.log(uniqueBrands);
    setAvailableBrands(uniqueBrands);

    setAsset(selectedAssetName);

    setBrand("");
    setAssetId("");
    setVolume("");
    setAvailableUnits(0);
    setUnitPrice("");
    setUnit("");
    setNumberOfUnits("");
    setTotalPrice("");

    if (uniqueBrands.length === 1) {
      const selectedAsset = assetsWithSameName[0];
      console.log(selectedAsset);
      console.log(selectedAsset.brand);

      setBrand(selectedAsset.brand);

      const assetsWithSameBrand = assetsWithSameName.filter(
        (assetItem: Asset) => assetItem.brand === selectedAsset.brand
      );

      setFilteredAssetsByBatch(assetsWithSameBrand);

      const batches = assetsWithSameBrand.map(
        (assetItem: Asset) => assetItem.batchNum
      );
      const uniqueBatches = [...new Set(batches)];
      console.log(uniqueBatches)
      
      if (uniqueBatches.length === 1) {
        const selectedAsset = assetsWithSameBrand[0];
        setBatchNum(selectedAsset.batchNum);
        populateAssetDetails(selectedAsset);
      } else {
        setAvailableBatches(uniqueBatches);
      }
    }
  };

  const populateAssetDetails = (selectedAsset: Asset) => {
    setAssetId(selectedAsset.id.toString());
    setVolume(selectedAsset.unitVolume.toString());
    setAvailableUnits(parseFloat(selectedAsset.numOfUnit));
    setUnitPrice(selectedAsset.unitPrice);
    setBatchNum(selectedAsset.batchNum);
    setUnit(selectedAsset.unit);
  };

  const handleBrandSelection = (selectedBrand: string) => {
    const assetsWithSameBrand = filteredAssetsByBrand.filter(
      (assetItem: Asset) => assetItem.brand === selectedBrand
    );
    
    setFilteredAssetsByBatch(assetsWithSameBrand);
    
    const batches = assetsWithSameBrand.map((assetItem: Asset) => assetItem.batchNum);
    const uniqueBatches = [...new Set(batches)];
    setAvailableBatches(uniqueBatches);
    
    setBrand(selectedBrand);
    
    setBatchNum("");
    setAssetId("");
    setVolume("");
    setAvailableUnits(0);
    setUnitPrice("");
    setUnit("");
    setNumberOfUnits("");
    setTotalPrice("");
    
    if (uniqueBatches.length === 1) {
      const selectedAsset = assetsWithSameBrand[0];
      setBatchNum(selectedAsset.batchNum);
      populateAssetDetails(selectedAsset);
    }
  };

  const handleBatchSelection = (selectedBatch: string) => {
    const selectedAsset = filteredAssetsByBatch.find(
      (assetItem: Asset) => assetItem.batchNum === selectedBatch
    );
    
    if (selectedAsset) {
      setBatchNum(selectedBatch);
      populateAssetDetails(selectedAsset);
    }
  };

  const handleRemoveAsset = async () => {
    const numUnits = parseFloat(numberOfUnits);
    const totalPriceValue = parseFloat(totalPrice);
    const unitPriceValue = parseFloat(unitPrice);

    if (!numberOfUnits || !assetId || !category) {
      Alert.alert(t("PublicForum.sorry"), t("PublicForum.fillAllFields"), [{ text: t("PublicForum.OK") }]);
      return;
    }

    if (isNaN(numUnits) || numUnits <= 0) {
      Alert.alert("Error", "Please enter a valid number of units");
      return;
    }

    if (numUnits > availableUnits) {
      Alert.alert(t("CurrentAssets.sorry"), t("CurrentAssets.YouCannotRemove"), [{ text: t("PublicForum.OK") }]);
      return;
    }

    if (totalPrice && !isNaN(totalPriceValue)) {
      const maxTotalValue = unitPriceValue * availableUnits;
      if (totalPriceValue > maxTotalValue) {
        Alert.alert(
          "Error",
          `The total price cannot exceed ${maxTotalValue.toFixed(2)}`
        );
        return;
      }
    }

    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Error", "Authentication required. Please login again.");
        setIsLoading(false);
        return;
      }

      const requestData = {
        numberOfUnits: numUnits,
        ...(totalPrice && !isNaN(totalPriceValue) && { totalPrice: totalPriceValue })
      };

      const response = await axios.delete(
        `${environment.API_BASE_URL}api/auth/removeAsset/${category}/${assetId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          data: requestData,
        }
      );

      setIsLoading(false);
      
      if (response.status === 200 || response.status === 204) {
        Alert.alert(
          t("CurrentAssets.Success"), 
          t("CurrentAssets.RemoveSuccess"),
          [
            {
              text: t("PublicForum.OK"),
              onPress: () => navigation.navigate("CurrentAssert")
            }
          ]
        );
      } else {
        Alert.alert("Error", "Unexpected response from server. Please try again.");
      }

    } catch (error) {
      console.error("Remove asset error:", error);
      setIsLoading(false);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const unitvol = [
    {
      value: "ml",
      label: t("CurrentAssets.ml"),
    },
    {
      value: "kg",
      label: t("CurrentAssets.kg"),
    },
    {
      value: "l",
      label: t("CurrentAssets.l"),
    },
  ];

  const uniqueAssetNames = [...new Set(assets.map((asset: Asset) => asset.asset))];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      enabled
      style={{ flex: 1 }}
    >
      <ScrollView 
        className="flex-1 bg-white" 
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        {/* Header */}
        <View
          className="flex-row justify-between"
          style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
        >
          <TouchableOpacity onPress={() => navigation.navigate("CurrentAssert")}>
            <AntDesign name="left" size={24} color="#000502" />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-lg font-bold">{t("FixedAssets.myAssets")}</Text>
          </View>
        </View>

        <View className="space-y-4 p-8">
          {/* Category Dropdown */}
          <View style={{ zIndex: 10000 }}>
            <Text className="text-gray-600 mb-2">
              {t("CurrentAssets.category")}
            </Text>
            <DropDownPicker
              open={openCategorylist}
              value={category}
              setOpen={(open) => {
                closeAllDropdowns('category');
                setOpenCategorylist(open);
                if (!open) {
                  setAssetId("");
                  if (category !== "Other Consumables") {
                    setAsset("");
                  }
                }
              }}
              setValue={setCategory}
              items={[
                {
                  label: t("CurrentAssets.Agro chemicals"),
                  value: "Agro Chemicals",
                },
                { label: t("CurrentAssets.Fertilizers"), value: "Fertilizers" },
                {
                  label: t("CurrentAssets.Seeds and Seedlings"),
                  value: "Seeds and Seedlings",
                },
                {
                  label: t("CurrentAssets.Livestock for sale"),
                  value: "Livestock for Sale",
                },
                { label: t("CurrentAssets.Animal feed"), value: "Animal Feed" },
                {
                  label: t("CurrentAssets.Other consumables"),
                  value: "Other Consumables",
                },
              ]}
              placeholder={t("CurrentAssets.selectcategory")}
              placeholderStyle={{ color: "#6B7280" }}
              listMode="SCROLLVIEW"
              scrollViewProps={{
                nestedScrollEnabled: true,
              }}
              dropDownContainerStyle={{
                borderColor: "#ccc",
                borderWidth: 1,
                backgroundColor: "#E5E7EB",
              }}
              style={{
                borderColor: "#ccc",
                borderWidth: 1,
                backgroundColor: "#E5E7EB",
                borderRadius: 30,
                paddingHorizontal: 12,
                paddingVertical: 12,
              }}
              textStyle={{
                fontSize: 14,
              }}
              onOpen={dismissKeyboard}
            />
          </View>

          {/* Asset Dropdown */}
          <View style={{ zIndex: 9000 }}>
            <Text className="text-gray-600 mt-4 mb-2">
              {t("CurrentAssets.asset")}
            </Text>
            <DropDownPicker
              open={openAsset}
              value={asset}
              setOpen={(open) => {
                closeAllDropdowns('asset');
                setOpenAsset(open);
              }}
              setValue={(callback) => {
                const itemValue =
                  typeof callback === "function" ? callback(asset) : callback;
                handleAssetSelection(itemValue);
              }}
              items={uniqueAssetNames.map((assetName) => ({
                label: assetName,
                value: assetName,
              }))}
              placeholder={t("CurrentAssets.selectasset")}
              placeholderStyle={{ color: "#6B7280" }}
              listMode="SCROLLVIEW"
              scrollViewProps={{
                nestedScrollEnabled: true,
              }}
              dropDownContainerStyle={{
                borderColor: "#ccc",
                borderWidth: 1,
                backgroundColor: "#E5E7EB",
              }}
              style={{
                borderColor: "#ccc",
                borderWidth: 1,
                backgroundColor: "#E5E7EB",
                borderRadius: 30,
                paddingHorizontal: 12,
                paddingVertical: 12,
              }}
              textStyle={{
                fontSize: 14,
              }}
              onOpen={dismissKeyboard}
                  modalProps={{
    animationType: "slide",
    transparent: true,
  }}
  modalContentContainerStyle={{
    backgroundColor: "white",
  }}
  searchContainerStyle={{
    borderBottomColor: "#dfdfdf",
  }}
  searchTextInputStyle={{
    borderColor: "#dfdfdf",
  }}
   closeAfterSelecting={true}
  closeOnBackPressed={true}
            />
          </View>

          {/* Brand Section */}
          {category !== "Livestock for Sale" && (
            <View style={{ zIndex: 8000 }}>
              <Text className="text-gray-600 mt-4 mb-2">{t("CurrentAssets.brand")}</Text>
              {availableBrands.length > 1 ? (
                <DropDownPicker
                  open={openBrand}
                  value={brand}
                  setOpen={(open) => {
                    closeAllDropdowns('brand');
                    setOpenBrand(open);
                  }}
                  setValue={(callback) => {
                    const brandValue =
                      typeof callback === "function" ? callback(brand) : callback;
                    handleBrandSelection(brandValue);
                  }}
                  items={availableBrands.map((brandName) => ({
                    label: brandName,
                    value: brandName,
                  }))}
                  placeholder={t("CurrentAssets.selectbrand") || "Select Brand"}
                  placeholderStyle={{ color: "#6B7280" }}
                  listMode="SCROLLVIEW"
                  scrollViewProps={{
                    nestedScrollEnabled: true,
                  }}
                  dropDownContainerStyle={{
                    borderColor: "#ccc",
                    borderWidth: 1,
                    backgroundColor: "#E5E7EB",
                  }}
                  style={{
                    borderColor: "#ccc",
                    borderWidth: 1,
                    backgroundColor: "#E5E7EB",
                    borderRadius: 30,
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                  }}
                  textStyle={{
                    fontSize: 14,
                  }}
                  onOpen={dismissKeyboard}
                />
              ) : (
                <TextInput
                  placeholder={t("CurrentAssets.brand")}
                  value={brand}
                  onChangeText={setBrand}
                  className="bg-gray-200 p-2 pl-4 mt-2 rounded-[30px] h-[50px]"
                  editable={false}
                />
              )}
            </View>
          )}

          {/* Batch Section */}
          <View style={{ zIndex: 7000 }}>
            <Text className="text-gray-600 mb-2">{t("CurrentAssets.batchnumber")}</Text>
            {availableBatches.length > 1 ? (
              <DropDownPicker
                open={openBatch}
                value={batchNum}
                setOpen={(open) => {
                  closeAllDropdowns('batch');
                  setOpenBatch(open);
                }}
                setValue={(callback) => {
                  const batchValue =
                    typeof callback === "function" ? callback(batchNum) : callback;
                  handleBatchSelection(batchValue);
                }}
                items={availableBatches.map((batchNumber) => ({
                  label: batchNumber,
                  value: batchNumber,
                }))}
                placeholder={t("CurrentAssets.selectbatch") || "Select Batch Number"}
                placeholderStyle={{ color: "#6B7280" }}
                listMode="SCROLLVIEW"
                scrollViewProps={{
                  nestedScrollEnabled: true,
                }}
                dropDownContainerStyle={{
                  borderColor: "#ccc",
                  borderWidth: 1,
                  backgroundColor: "#E5E7EB",
                }}
                style={{
                  borderColor: "#ccc",
                  borderWidth: 1,
                  backgroundColor: "#E5E7EB",
                  borderRadius: 30,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                }}
                textStyle={{
                  fontSize: 14,
                }}
                onOpen={dismissKeyboard}
              />
            ) : (
              <TextInput
                placeholder={t("CurrentAssets.batchnumber")}
                value={batchNum}
                onChangeText={setBatchNum}
                className="bg-gray-200 p-2 pl-4 rounded-[30px] h-[50px]"
                editable={false}
              />
            )}
          </View>

          {/* Unit Volume Section */}
          <View style={{ zIndex: 6000 }}>
            <Text className="text-gray-600 mb-2">
              {t("CurrentAssets.unitvolume_weight")}
            </Text>
            <View className="flex-row items-center justify-between bg-white">
              <TextInput
                placeholder={t("CurrentAssets.unitvolume_weight")}
                value={volume}
                editable={false}
                className="flex-1 mr-2 py-2 pl-4 p-3 bg-gray-200 rounded-full"
              />
              <View className="w-32">
                <DropDownPicker
                  open={openUnit}
                  value={unit}
                  setOpen={(open) => {
                    closeAllDropdowns('unit');
                    setOpenUnit(open);
                  }}
                  setValue={setUnit}
                  items={unitvol.map((item) => ({
                    label: item.label,
                    value: item.value,
                  }))}
                  placeholder="unit"
                  placeholderStyle={{ color: "#6B7280" }}
                  listMode="SCROLLVIEW"
                  scrollViewProps={{
                    nestedScrollEnabled: true,
                  }}
                  dropDownContainerStyle={{
                    borderColor: "#ccc",
                    borderWidth: 1,
                    backgroundColor: "#E5E7EB",
                  }}
                  style={{
                    borderColor: "#ccc",
                    borderWidth: 1,
                    backgroundColor: "#E5E7EB",
                    borderRadius: 30,
                    paddingHorizontal: 25,
                    paddingVertical: 12,
                  }}
                  textStyle={{
                    fontSize: 14
                  }}
                  onOpen={dismissKeyboard}
                />
              </View>
            </View>
          </View>

          {/* Number of Units */}
          <View>
            <Text className="text-gray-600 mb-2">
              {t("CurrentAssets.NumOfUnits")} ({t("CurrentAssets.Max")}: {availableUnits})
            </Text>
            <TextInput
              placeholder={t("CurrentAssets.numberofunits")}
              value={numberOfUnits}
              onChangeText={(value) => {
                const cleaned = value.replace(/[-.*#]/g, '');
                if (parseFloat(cleaned) > availableUnits) {
                  Alert.alert(
                    t("CurrentAssets.sorry"),
                    t("CurrentAssets.YouCannotRemove")
                  );
                } else {
                  setNumberOfUnits(cleaned);
                }
              }}
              keyboardType="numeric"
              className="bg-gray-200 p-2 pl-4 rounded-[30px] h-[50px]"
            />
          </View>

          {/* Unit Price */}
          <View>
            <Text className="text-gray-600 mb-2">{t("CurrentAssets.unitprice")}</Text>
            <TextInput
              placeholder={t("CurrentAssets.unitprice")}
              value={unitPrice}
              onChangeText={setUnitPrice}
              keyboardType="numeric"
              editable={false}
              className="bg-gray-200 p-2 rounded-[30px] pl-4 h-[50px]"
            />
          </View>

          {/* Total Price */}
          <View>
            <Text className="text-gray-600 mb-2">{t("CurrentAssets.totalprice")}</Text>
            <TextInput
              placeholder={t("CurrentAssets.totalprice")}
              value={totalPrice}
              editable={false}
              className="bg-gray-200 p-2 rounded-[30px] pl-4 h-[50px]"
            />
          </View>

          {/* Remove Asset Button */}
          <TouchableOpacity
            onPress={handleRemoveAsset}
            className="bg-[#FF4646] p-4 rounded-[30px] mt-8 mb-16"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white text-center">
                {t("CurrentAssets.removeAsset")}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RemoveAsset;