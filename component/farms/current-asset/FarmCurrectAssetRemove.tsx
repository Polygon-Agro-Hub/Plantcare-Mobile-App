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
import { RootStackParamList } from "../../types/types";
import { StackNavigationProp } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import CustomHeader from "../../common/CustomHeader";
import GlobalSearchModal from "../../common/GlobalSearchModal";

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
  farmName: string;
};

const FarmCurrectAssetRemove: React.FC<FarmCurrectAssetRemoveProps> = ({
  navigation,
}) => {
  const [category, setCategory] = useState("");
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

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [assetModalVisible, setAssetModalVisible] = useState(false);
  const [brandModalVisible, setBrandModalVisible] = useState(false);
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [unitModalVisible, setUnitModalVisible] = useState(false);

  const { t } = useTranslation();
  const route = useRoute();
  const { farmId, farmName } = route.params as RouteParams;

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

  const unitvol = [
    { value: "ml", label: t("CurrentAssets.ml") },
    { value: "kg", label: t("CurrentAssets.kg") },
    { value: "l", label: t("CurrentAssets.l") },
  ];

  const uniqueAssetNames = [...new Set(assets.map((a) => a.asset))].map(
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

  useFocusEffect(
    useCallback(() => {
      setCategory("");
      resetForm();
    }, []),
  );

  const fetchAssets = async () => {
    if (!category || category.trim() === "") return;
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert(
          t("Farms.Error"),
          t("Farms.No authentication token found"),
          [{ text: t("Farms.okButton") }],
        );
        return;
      }
      const response = await axios.get(
        `${environment.API_BASE_URL}api/farm/assets/${farmId}`,
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
          [{ text: t("Farms.okButton") }],
        );
        setAssets([]);
      } else {
        setAssets(fetchedAssets);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        Alert.alert(
          t("Farms.Error"),
          t("Farms.Farm assets not found. Please check the farm ID."),
          [{ text: t("Farms.okButton") }],
        );
      } else {
        Alert.alert(
          t("Farms.Error"),
          t("Farms.Failed to fetch assets. Please try again."),
          [{ text: t("Farms.okButton") }],
        );
      }
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
        { text: t("Farms.okButton") },
      ]);
      return;
    }
    if (isNaN(numUnits) || numUnits <= 0) {
      Alert.alert(t("Farms.Error"), "Please enter a valid number of units", [
        { text: t("Farms.okButton") },
      ]);
      return;
    }
    if (numUnits > availableUnits) {
      Alert.alert(
        t("CurrentAssets.sorry"),
        t("CurrentAssets.YouCannotRemove"),
        [{ text: t("Farms.okButton") }],
      );
      return;
    }
    if (totalPrice && !isNaN(totalPriceValue)) {
      const maxTotalValue = unitPriceValue * availableUnits;
      if (totalPriceValue > maxTotalValue) {
        Alert.alert(
          "Error",
          `The total price cannot exceed ${maxTotalValue.toFixed(2)}`,
        );
        return;
      }
    }

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert(t("Main.error"), t("Farms.No authentication token found"), [
          { text: t("PublicForum.OK") },
        ]);
        setIsLoading(false);
        return;
      }
      const response = await axios.delete(
        `${environment.API_BASE_URL}api/farm/removeAsset/${category}/${assetId}`,
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
          t("CurrentAssets.Success"),
          t("CurrentAssets.RemoveSuccess"),
          [
            {
              text: t("CropCalender.OK"),
              onPress: () =>
                navigation.navigate("Main", {
                  screen: "FarmCurrectAssets",
                  params: { farmId, farmName },
                }),
            },
          ],
        );
      } else {
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"), [
          { text: t("PublicForum.OK") },
        ]);
      }
    } catch (error) {
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (axios.isAxiosError(error))
        errorMessage = error.response?.data?.message || errorMessage;
      Alert.alert(t("Main.error"), errorMessage, [
        { text: t("PublicForum.OK") },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        className="flex-1 bg-white"
        keyboardShouldPersistTaps="handled"
      >
        <CustomHeader
          title={farmName}
          navigation={navigation}
          onBackPress={() =>
            navigation.navigate("Main", {
              screen: "FarmCurrectAssets",
              params: { farmId, farmName },
            })
          }
        />

        <View className="space-y-4 p-8 -mt-8">
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
              className="bg-gray-200 rounded-full px-4 h-[50px] flex-row items-center"
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
            <Text className="text-gray-600 mb-2">
              {t("CurrentAssets.asset")}
            </Text>
            <TouchableOpacity
              onPress={() => {
                Keyboard.dismiss();
                setAssetModalVisible(true);
              }}
              disabled={uniqueAssetNames.length === 0}
              className="bg-gray-200 rounded-full px-4 h-[50px] flex-row items-center"
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
              <Text className="text-gray-600 mb-2">
                {t("CurrentAssets.brand")}
              </Text>
              {availableBrands.length > 1 ? (
                <TouchableOpacity
                  onPress={() => {
                    Keyboard.dismiss();
                    setBrandModalVisible(true);
                  }}
                  className="bg-gray-200 rounded-full px-4 h-[50px] flex-row items-center"
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
                  className="bg-gray-200 p-2 pl-4 mt-2 rounded-[30px] h-[50px]"
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
                className="bg-gray-200 rounded-full px-4 h-[50px] flex-row items-center"
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
                className="bg-gray-200 p-2 pl-4 rounded-[30px] h-[50px]"
                editable={false}
              />
            )}
          </View>

          {/* Unit Volume */}
          <View>
            <Text className="text-gray-600 mb-2">
              {t("CurrentAssets.unitvolume_weight")}
            </Text>
            <View className="flex-row items-center justify-between">
              <TextInput
                placeholder={t("CurrentAssets.unitvolume_weight")}
                value={volume}
                editable={false}
                className="flex-1 mr-2 py-2 pl-4 p-3 bg-gray-200 rounded-full"
              />
              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  setUnitModalVisible(true);
                }}
                className="w-32 bg-gray-200 rounded-full px-4 h-[50px] flex-row items-center"
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
                    [{ text: t("PublicForum.OK") }],
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
              className="bg-gray-200 p-2 rounded-[30px] pl-4 h-[50px]"
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
            disabled={isLoading}
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

export default FarmCurrectAssetRemove;
