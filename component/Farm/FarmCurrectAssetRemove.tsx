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
import { RootStackParamList } from "../types";
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
import { useFocusEffect } from "expo-router";
import { useRoute } from "@react-navigation/native";
import LottieView from "lottie-react-native";
type FarmCurrectAssetRemoveNavigationProp = StackNavigationProp<
  RootStackParamList,
  "FarmCurrectAssetRemove"
>;

interface FarmCurrectAssetRemoveProps {
  navigation: FarmCurrectAssetRemoveNavigationProp;
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

type RouteParams = {
  farmId: number;
  farmName:string;
};

const FarmCurrectAssetRemove: React.FC<FarmCurrectAssetRemoveProps> = ({ navigation }) => {
  const [category, setCategory] = useState("Select Category");
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
  const [filteredAssetsByBrand, setFilteredAssetsByBrand] = useState<Asset[]>([]); // Assets filtered by selected asset name
  const [availableBrands, setAvailableBrands] = useState<string[]>([]); // Available brands for selected asset
  const [filteredAssetsByBatch, setFilteredAssetsByBatch] = useState<Asset[]>([]); // Assets filtered by asset name and brand
  const [availableBatches, setAvailableBatches] = useState<string[]>([]); // Available batch numbers for selected asset and brand
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const [openCategorylist, setOpenCategorylist] = useState(false);
  const [openAsset, setOpenAsset] = useState(false);
  const [openBrand, setOpenBrand] = useState(false); // New state for brand dropdown
  const [openBatch, setOpenBatch] = useState(false); // New state for batch dropdown
  const [openUnit, setOpenUnit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unit, setUnit] = useState("");
  const route = useRoute();
  const { farmId , farmName} = route.params as RouteParams; 

  console.log("farm id;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;",farmId)
 
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
      setOpenAsset(false)
      setOpenCategorylist(false)
      setOpenBatch(false)
      setOpenBrand(false)
      setOpenUnit(false)
    }, [])
  );

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
    
    if (category) {
      console.log("hittttt")
      fetchAssets();
    }
  }, [category]);

  // Function to handle asset selection and determine available brands
  // const handleAssetSelection = (selectedAssetName: string) => {
  //   const assetsWithSameName = assets.filter(
  //     (assetItem: Asset) => assetItem.asset === selectedAssetName
  //   );
    
  //   setFilteredAssetsByBrand(assetsWithSameName);
    
  //   const brands = assetsWithSameName.map((assetItem: Asset) => assetItem.brand);
  //   const uniqueBrands = [...new Set(brands)];
  //   setAvailableBrands(uniqueBrands);
    
  //   setAsset(selectedAssetName);
    
  //   // Reset brand-dependent fields
  //   setBrand("");
  //   setAssetId("");
  //   setVolume("");
  //   setAvailableUnits(0);
  //   setUnitPrice("");
  //   setBatchNum("");
  //   setUnit("");
  //   setNumberOfUnits("");
  //   setTotalPrice("");
    
  //   // If only one brand, auto-select it
  //   if (uniqueBrands.length === 1) {
  //     const selectedAsset = assetsWithSameName[0];
  //     setBrand(selectedAsset.brand);
  //     populateAssetDetails(selectedAsset);
  //   }
  // };

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

    // ✅ Use assetsWithSameName instead of filteredAssetsByBrand
    const assetsWithSameBrand = assetsWithSameName.filter(
      (assetItem: Asset) => assetItem.brand === selectedAsset.brand
    );

    setFilteredAssetsByBatch(assetsWithSameBrand);

    const batches = assetsWithSameBrand.map(
      (assetItem: Asset) => assetItem.batchNum
    );
    const uniqueBatches = [...new Set(batches)];
    console.log(uniqueBatches)
    // setAvailableBatches(uniqueBatches);
        if (uniqueBatches.length === 1) {
      const selectedAsset = assetsWithSameBrand[0];
      setBatchNum(selectedAsset.batchNum);
      populateAssetDetails(selectedAsset);
    }else{
      setAvailableBatches(uniqueBatches);
    }
  }
};


  // Function to populate asset details when batch is selected
  const populateAssetDetails = (selectedAsset: Asset) => {
    setAssetId(selectedAsset.id.toString());
    setVolume(selectedAsset.unitVolume.toString());
    setAvailableUnits(parseFloat(selectedAsset.numOfUnit));
    setUnitPrice(selectedAsset.unitPrice);
    setBatchNum(selectedAsset.batchNum);
    setUnit(selectedAsset.unit);
  };

  // const handleBrandSelection = (selectedBrand: string) => {
  //   const assetsWithSameBrand = filteredAssetsByBrand.filter(
  //     (assetItem: Asset) => assetItem.brand === selectedBrand
  //   );
    
  //   setFilteredAssetsByBatch(assetsWithSameBrand);
    
  //   const batches = assetsWithSameBrand.map((assetItem: Asset) => assetItem.batchNum);
  //   const uniqueBatches = [...new Set(batches)];
  //   setAvailableBatches(uniqueBatches);
    
  //   setBrand(selectedBrand);
    
  //   // Reset batch-dependent fields
  //   setBatchNum("");
  //   setAssetId("");
  //   setVolume("");
  //   setAvailableUnits(0);
  //   setUnitPrice("");
  //   setUnit("");
  //   setNumberOfUnits("");
  //   setTotalPrice("");
    
  //   // If only one batch, auto-select it
  //   if (uniqueBatches.length === 1) {
  //     const selectedAsset = assetsWithSameBrand[0];
  //     setBatchNum(selectedAsset.batchNum);
  //     populateAssetDetails(selectedAsset);
  //   }
  // };

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
    Alert.alert(t("PublicForum.sorry"), t("PublicForum.fillAllFields"));
    return;
  }

  if (isNaN(numUnits) || numUnits <= 0) {
    Alert.alert("Error", "Please enter a valid number of units");
    return;
  }

  if (numUnits > availableUnits) {
    Alert.alert(t("CurrentAssets.sorry"), t("CurrentAssets.YouCannotRemove"));
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
    
    // Success handling
    if (response.status === 200 || response.status === 204) {
      Alert.alert(
        t("CurrentAssets.Success"), 
        t("CurrentAssets.RemoveSuccess"),
        [
          {
            text: "OK",
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
    
    let errorMessage = "An unexpected error occurred. Please try again.";
    
   
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

  const resetForm = () => {
  setAssetId("");
  setAsset("");
  setBrand("");
  setBatchNum("");
  setVolume("");
  setNumberOfUnits("");
  setUnitPrice("");
  setAvailableUnits(0);
  setTotalPrice("");
  setUnit("");
  setAssets([]);
  setFilteredAssetsByBrand([]);
  setFilteredAssetsByBatch([]);
  setAvailableBrands([]);
  setAvailableBatches([]);
};

  // Get unique asset names for the dropdown
  const uniqueAssetNames = [...new Set(assets.map((asset: Asset) => asset.asset))];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      enabled
      style={{ flex: 1 }}
    >
      <ScrollView className="flex-1 bg-white" keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View
          className="flex-row justify-between"
          style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
        >
        <TouchableOpacity 
  onPress={() => navigation.navigate("Main", { 
    screen: "FarmCurrectAssets",
    params: { farmId: farmId, farmName: farmName }
  })} 
  className=""
>
            <AntDesign name="left" size={24} color="#000502" style={{ paddingHorizontal: wp(3), paddingVertical: hp(1.5), backgroundColor: "#F6F6F680" , borderRadius: 50 }}/>
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-lg font-bold pt-2">{farmName}</Text>
          </View>
        </View>
        <View className="space-y-4 p-8 -mt-8">
          <View className="">
            <Text className="text-gray-600 mb-2">
              {t("CurrentAssets.category")}
            </Text>
            <View className=" rounded-[30px]">
              <DropDownPicker
                open={openCategorylist}
                value={category} 
                setOpen={(open) => {
                  setOpenCategorylist(open); 
                  setOpenAsset(false);
                  setOpenBrand(false);
                  setOpenBatch(false);
                  setBatchNum("")
                  setBrand("")
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
                zIndex={10000}
                zIndexInverse={1000}
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
                onSelectItem={(item) => {
                  setCategory(item.value || "");
                  resetForm()
                }}
              />
            </View>

            <Text className="text-gray-600 mt-4 mb-2">
              {t("CurrentAssets.asset")}
            </Text>
            <View className=" rounded-[30px]">
              <DropDownPicker
                open={openAsset}
                value={asset}
                setOpen={(open) => {
                  setOpenAsset(open);
                  setOpenCategorylist(false);
                  setOpenBrand(false);
                  setOpenBatch(false);
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
                zIndex={5000}
                zIndexInverse={1000}
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
                onSelectItem={(item) => {
                  handleAssetSelection(item.value || "");
                }}
              />
            </View>
          </View>

          {category !== "Livestock for Sale" && (
            <>
              <Text className="text-gray-600 mt-4">{t("CurrentAssets.brand")}</Text>
              {availableBrands.length > 1 ? (
                // Show dropdown when multiple brands are available
                <View className="rounded-[30px]">
                  <DropDownPicker
                    open={openBrand}
                    value={brand}
                    setOpen={(open) => {
                      setOpenBrand(open);
                      setOpenCategorylist(false);
                      setOpenAsset(false);
                      setOpenBatch(false);
                      setOpenUnit(false);
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
                    zIndex={4000}
                    zIndexInverse={1000}
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
                    onSelectItem={(item) => {
                      handleBrandSelection(item.value || "");
                    }}
                  />
                </View>
              ) : (
                // Show read-only TextInput when only one brand or no asset selected
                <TextInput
                  placeholder={t("CurrentAssets.brand")}
                  value={brand}
                  onChangeText={setBrand}
                  className="bg-gray-200 p-2 pl-4 mt-2 rounded-[30px] h-[50px]"
                  editable={false}
                />
              )}
            </>
          )}

          <Text className="text-gray-600">{t("CurrentAssets.batchnumber")}</Text>
          {availableBatches.length > 1 ? (
            // Show dropdown when multiple batches are available
            <View className="rounded-[30px]">
              <DropDownPicker
                open={openBatch}
                value={batchNum}
                setOpen={(open) => {
                  setOpenBatch(open);
                  setOpenCategorylist(false);
                  setOpenAsset(false);
                  setOpenBrand(false);
                  setOpenUnit(false);
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
                zIndex={3500}
                zIndexInverse={1000}
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
                onSelectItem={(item) => {
                  handleBatchSelection(item.value || "");
                }}
              />
            </View>
          ) : (
            // Show read-only TextInput when only one batch or no brand selected
            <TextInput
              placeholder={t("CurrentAssets.batchnumber")}
              value={batchNum}
              onChangeText={setBatchNum}
              className="bg-gray-200 p-2 pl-4 rounded-[30px] h-[50px]"
              editable={false}
            />
          )}

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

            <View className="rounded-full  w-32">
              <DropDownPicker
                open={openUnit}
                value={unit}
                setOpen={(open) => {
                  setOpenUnit(open);
                  setOpenAsset(false);
                  setOpenBrand(false);
                  setOpenBatch(false);
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
                zIndex={3000}
                zIndexInverse={1000}
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

          <Text className="text-gray-600">
            {t("CurrentAssets.NumOfUnits")} ({t("CurrentAssets.Max")}:{" "}
            {availableUnits})
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
            className="bg-[#FF4646] p-4 rounded-[30px] mt-8 mb-16"
          >
            {isLoading ? (
                   <LottieView
                                              source={require('../../assets/jsons/loader.json')}
                                              autoPlay
                                              loop
                                              style={{ width: 300, height: 300 }}
                                            />
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

export default FarmCurrectAssetRemove;