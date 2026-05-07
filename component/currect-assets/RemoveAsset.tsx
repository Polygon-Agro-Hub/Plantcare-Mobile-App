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
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { RootStackParamList } from "../types/types";
import { StackNavigationProp } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import GlobalSearchModal from "../common/GlobalSearchModal";
import CustomHeader from "../common/CustomHeader";

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
  const [filteredAssetsByBrand, setFilteredAssetsByBrand] = useState<Asset[]>(
    [],
  );
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [filteredAssetsByBatch, setFilteredAssetsByBatch] = useState<Asset[]>(
    [],
  );
  const [availableBatches, setAvailableBatches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState("");

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [assetModalVisible, setAssetModalVisible] = useState(false);
  const [brandModalVisible, setBrandModalVisible] = useState(false);
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [unitModalVisible, setUnitModalVisible] = useState(false);

  const { t } = useTranslation();

  const unitvol = [
    { value: "ml", label: t("CurrentAssets.ml") },
    { value: "kg", label: t("CurrentAssets.kg") },
    { value: "l", label: t("CurrentAssets.l") },
  ];

  const categoryItems = [
    { label: t("CurrentAssets.Agro chemicals"), value: "Agro Chemicals" },
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
    { label: t("CurrentAssets.Other consumables"), value: "Other Consumables" },
  ];

  const uniqueAssetNames = [...new Set(assets.map((a: Asset) => a.asset))].map(
    (name) => ({
      label: name,
      value: name,
    }),
  );

  const brandItems = availableBrands.map((b) => ({ label: b, value: b }));
  const batchItems = availableBatches.map((b) => ({ label: b, value: b }));

  const getLabel = (items: { label: string; value: string }[], val: string) =>
    items.find((i) => i.value === val)?.label || "";

  useEffect(() => {
    if (numberOfUnits && unitPrice) {
      setTotalPrice(
        (parseFloat(numberOfUnits) * parseFloat(unitPrice)).toString(),
      );
    }
  }, [numberOfUnits, unitPrice]);

  useFocusEffect(
    useCallback(() => {
      setAssets([]);
      setAsset("");
      setBrand("");
      setBatchNum("");
      setVolume("");
      setUnitPrice("");
      setAvailableUnits(0);
      setNumberOfUnits("");
      setTotalPrice("");
      setCategory("");
      setUnit("");
    }, []),
  );

  const fetchAssets = async () => {
    if (!category || category.trim() === "") return;
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert(
          t("Main.Error"),
          t("Farms.No authentication token found"),
          [{ text: t("Main.OK") }],
        );
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
        },
      );
      const fetchedAssets = response.data.assets;
      if (!fetchedAssets || fetchedAssets.length === 0) {
        Alert.alert(
          t("Farms.No Assets Found"),
          t("Farms.There are no assets available for the selected category."),
          [{ text: t("Main.OK") }],
        );
      } else {
        setAssets(fetchedAssets);
      }
    } catch {
      setAssets([]);
      setBrand("");
      setBatchNum("");
      setVolume("");
      setUnitPrice("");
      setAvailableUnits(0);
      setNumberOfUnits("");
      setTotalPrice("");
    }
  };

  useEffect(() => {
    if (category && category.trim() !== "") fetchAssets();
  }, [category]);

  const populateAssetDetails = (selectedAsset: Asset) => {
    setAssetId(selectedAsset.id.toString());
    setVolume(selectedAsset.unitVolume.toString());
    setAvailableUnits(parseFloat(selectedAsset.numOfUnit));
    setUnitPrice(selectedAsset.unitPrice);
    setBatchNum(selectedAsset.batchNum);
    setUnit(selectedAsset.unit);
  };

  const handleAssetSelection = (selectedAssetName: string) => {
    const assetsWithSameName = assets.filter(
      (a) => a.asset === selectedAssetName,
    );
    setFilteredAssetsByBrand(assetsWithSameName);
    const uniqueBrands = [...new Set(assetsWithSameName.map((a) => a.brand))];
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
      const firstAsset = assetsWithSameName[0];
      setBrand(firstAsset.brand);
      const assetsWithSameBrand = assetsWithSameName.filter(
        (a) => a.brand === firstAsset.brand,
      );
      setFilteredAssetsByBatch(assetsWithSameBrand);
      const uniqueBatches = [
        ...new Set(assetsWithSameBrand.map((a) => a.batchNum)),
      ];
      if (uniqueBatches.length === 1) {
        setBatchNum(assetsWithSameBrand[0].batchNum);
        populateAssetDetails(assetsWithSameBrand[0]);
      } else {
        setAvailableBatches(uniqueBatches);
      }
    }
  };

  const handleBrandSelection = (selectedBrand: string) => {
    const assetsWithSameBrand = filteredAssetsByBrand.filter(
      (a) => a.brand === selectedBrand,
    );
    setFilteredAssetsByBatch(assetsWithSameBrand);
    const uniqueBatches = [
      ...new Set(assetsWithSameBrand.map((a) => a.batchNum)),
    ];
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
      setBatchNum(assetsWithSameBrand[0].batchNum);
      populateAssetDetails(assetsWithSameBrand[0]);
    }
  };

  const handleBatchSelection = (selectedBatch: string) => {
    const selectedAsset = filteredAssetsByBatch.find(
      (a) => a.batchNum === selectedBatch,
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
      Alert.alert(t("PublicForum.sorry"), t("PublicForum.fillAllFields"), [
        { text: t("Main.OK") },
      ]);
      return;
    }
    if (isNaN(numUnits) || numUnits <= 0) {
      Alert.alert(
        t("Main.Error"),
        t("Farms.Please enter a valid number of units"),
      );
      return;
    }
    if (numUnits > availableUnits) {
      Alert.alert(
        t("CurrentAssets.sorry"),
        t("CurrentAssets.YouCannotRemove"),
        [{ text: t("Main.OK") }],
      );
      return;
    }
    if (totalPrice && !isNaN(totalPriceValue)) {
      const maxTotalValue = unitPriceValue * availableUnits;
      if (totalPriceValue > maxTotalValue) {
        Alert.alert(
          t("CurrentAssets.error"),
          t("CurrentAssets.totalPriceExceed", {
            maxValue: maxTotalValue.toFixed(2),
          }),
          [{ text: t("Main.OK") }],
        );
        return;
      }
    }

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert(
          t("Main.Error"),
          t("Farms.No authentication token found"),
          [{ text: t("Main.OK") }],
        );
        setIsLoading(false);
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
            numberOfUnits: numUnits,
            ...(totalPrice &&
              !isNaN(totalPriceValue) && { totalPrice: totalPriceValue }),
          },
        },
      );

      if (response.status === 200 || response.status === 204) {
        Alert.alert(
          t("Main.Success"),
          t("CurrentAssets.RemoveSuccess"),
          [
            {
              text: t("Main.OK"),
              onPress: () => navigation.navigate("CurrentAssert"),
            },
          ],
        );
      } else {
        Alert.alert(t("Main.Error"), t("Main.SomethingWentWrongPleaseTryAgainlater"), [
          { text: t("Main.OK") },
        ]);
      }
    } catch {
      Alert.alert(t("Main.Error"), t("Main.SomethingWentWrongPleaseTryAgainlater"), [
        { text: t("Main.OK") },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      enabled
      style={{ flex: 1 }}
    >
      <ScrollView
        className="flex-1 bg-white"
        keyboardShouldPersistTaps="handled"
      >
        <CustomHeader
          title={t("FixedAssets.myAssets")}
          showBackButton={true}
          navigation={navigation as any}
          onBackPress={() => navigation.navigate("CurrentAssert")}
        />

        <View className="gap-4 p-8">
          {/* Category */}
          <View>
            <Text className="text-gray-600 mb-2">
              {t("CurrentAssets.category")}
            </Text>
            <TouchableOpacity
              onPress={() => {
                Keyboard.dismiss();
                setCategoryModalVisible(true);
              }}
              className="bg-gray-200 rounded-full px-4 h-[50px] flex-row items-center justify-between"
            >
              <Text
                className={
                  category ? "text-gray-800 text-sm" : "text-gray-400 text-sm"
                }
              >
                {category
                  ? getLabel(categoryItems, category)
                  : t("CurrentAssets.selectcategory")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Asset */}
          <View>
            <Text className="text-gray-600 mt-4 mb-2">
              {t("CurrentAssets.asset")}
            </Text>
            <TouchableOpacity
              onPress={() => {
                Keyboard.dismiss();
                setAssetModalVisible(true);
              }}
              className="bg-gray-200 rounded-full px-4 h-[50px] flex-row items-center justify-between"
              disabled={uniqueAssetNames.length === 0}
            >
              <Text
                className={
                  asset ? "text-gray-800 text-sm" : "text-gray-400 text-sm"
                }
              >
                {asset || t("CurrentAssets.selectasset")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Brand */}
          {category !== "Livestock for Sale" && (
            <View>
              <Text className="text-gray-600 mt-4 mb-2">
                {t("CurrentAssets.brand")}
              </Text>
              {availableBrands.length > 1 ? (
                <TouchableOpacity
                  onPress={() => {
                    Keyboard.dismiss();
                    setBrandModalVisible(true);
                  }}
                  className="bg-gray-200 rounded-full px-4 h-[50px] flex-row items-center justify-between"
                >
                  <Text
                    className={
                      brand ? "text-gray-800 text-sm" : "text-gray-400 text-sm"
                    }
                  >
                    {brand || t("CurrentAssets.selectbrand")}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TextInput
                  placeholder={t("CurrentAssets.brand")}
                  value={brand}
                  onChangeText={setBrand}
                  className="bg-gray-200 p-2 pl-4 mt-2 rounded-3xl h-[50px]"
                  editable={false}
                />
              )}
            </View>
          )}

          {/* Batch */}
          <View>
            <Text className="text-gray-600 mb-2">
              {t("CurrentAssets.batchnumber")}
            </Text>
            {availableBatches.length > 1 ? (
              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  setBatchModalVisible(true);
                }}
                className="bg-gray-200 rounded-full px-4 h-[50px] flex-row items-center justify-between"
              >
                <Text
                  className={
                    batchNum ? "text-gray-800 text-sm" : "text-gray-400 text-sm"
                  }
                >
                  {batchNum || t("CurrentAssets.selectbatch")}
                </Text>
              </TouchableOpacity>
            ) : (
              <TextInput
                placeholder={t("CurrentAssets.batchnumber")}
                value={batchNum}
                onChangeText={setBatchNum}
                className="bg-gray-200 p-2 pl-4 rounded-3xl h-[50px]"
                editable={false}
              />
            )}
          </View>

          {/* Unit Volume */}
          <View>
            <Text className="text-gray-600 mb-2">
              {t("CurrentAssets.unitvolume_weight")}
            </Text>
            <View className="flex-row items-center justify-between bg-white">
              <TextInput
                placeholder={t("CurrentAssets.unitvolume_weight")}
                value={volume}
                editable={false}
                className="flex-1 mr-2 py-2 pl-4 p-3 bg-gray-200 rounded-3xl h-[50px]"
              />
              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  setUnitModalVisible(true);
                }}
                className="w-32 bg-gray-200 rounded-full px-4 h-[50px] flex-row items-center justify-between"
              >
                <Text
                  className={
                    unit ? "text-gray-800 text-sm" : "text-gray-400 text-sm"
                  }
                >
                  {unit ? getLabel(unitvol, unit) : t("CurrentAssets.unit")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Number of Units */}
          <View>
            <Text className="text-gray-600 mb-2">
              {t("CurrentAssets.NumOfUnits")} ({t("CurrentAssets.Max")}:{" "}
              {availableUnits})
            </Text>
            <TextInput
              placeholder={t("CurrentAssets.numberofunits")}
              value={numberOfUnits}
              onChangeText={(value) => {
                const cleaned = value.replace(/[-.*#]/g, "");
                if (parseFloat(cleaned) > availableUnits) {
                  Alert.alert(
                    t("CurrentAssets.sorry"),
                    t("CurrentAssets.YouCannotRemove"),
                    [{ text: t("Main.OK") }],
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
            <Text className="text-gray-600 mb-2">
              {t("CurrentAssets.unitprice")}
            </Text>
            <TextInput
              placeholder={t("CurrentAssets.unitprice")}
              value={unitPrice}
              onChangeText={setUnitPrice}
              keyboardType="numeric"
              editable={false}
              className="bg-gray-200 p-2 rounded-3xl pl-4 h-[50px]"
            />
          </View>

          {/* Total Price */}
          <View>
            <Text className="text-gray-600 mb-2">
              {t("CurrentAssets.totalprice")}
            </Text>
            <TextInput
              placeholder={t("CurrentAssets.totalprice")}
              value={totalPrice}
              editable={false}
              className="bg-gray-200 p-2 rounded-[30px] pl-4 h-[50px]"
            />
          </View>

          {/* Remove Button */}
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

      <GlobalSearchModal
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        title={t("CurrentAssets.category")}
        data={categoryItems}
        selectedItems={category ? [category] : []}
        onSelect={(selected) => {
          if (selected.length > 0) setCategory(selected[0]);
        }}
        searchPlaceholder={t("CurrentAssets.selectcategory")}
        multiSelect={false}
        showSearch={false}
      />

      <GlobalSearchModal
        visible={assetModalVisible}
        onClose={() => setAssetModalVisible(false)}
        title={t("CurrentAssets.asset")}
        data={uniqueAssetNames}
        selectedItems={asset ? [asset] : []}
        onSelect={(selected) => {
          if (selected.length > 0) handleAssetSelection(selected[0]);
        }}
        searchPlaceholder={t("CurrentAssets.selectasset")}
        multiSelect={false}
        showSearch={true}
      />

      <GlobalSearchModal
        visible={brandModalVisible}
        onClose={() => setBrandModalVisible(false)}
        title={t("CurrentAssets.brand")}
        data={brandItems}
        selectedItems={brand ? [brand] : []}
        onSelect={(selected) => {
          if (selected.length > 0) handleBrandSelection(selected[0]);
        }}
        searchPlaceholder={t("CurrentAssets.selectbrand")}
        multiSelect={false}
        showSearch={true}
      />

      <GlobalSearchModal
        visible={batchModalVisible}
        onClose={() => setBatchModalVisible(false)}
        title={t("CurrentAssets.batchnumber")}
        data={batchItems}
        selectedItems={batchNum ? [batchNum] : []}
        onSelect={(selected) => {
          if (selected.length > 0) handleBatchSelection(selected[0]);
        }}
        searchPlaceholder={t("CurrentAssets.selectbatch")}
        multiSelect={false}
        showSearch={true}
      />

      <GlobalSearchModal
        visible={unitModalVisible}
        onClose={() => setUnitModalVisible(false)}
        title={t("CurrentAssets.unit")}
        data={unitvol}
        selectedItems={unit ? [unit] : []}
        onSelect={(selected) => {
          if (selected.length > 0) setUnit(selected[0]);
        }}
        searchPlaceholder={t("CurrentAssets.unit")}
        multiSelect={false}
        showSearch={false}
      />
    </KeyboardAvoidingView>
  );
};

export default RemoveAsset;
