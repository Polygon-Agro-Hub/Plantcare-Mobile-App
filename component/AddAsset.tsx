import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  BackHandler
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { RootStackParamList } from "./types";
import { StackNavigationProp } from "@react-navigation/stack";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { StatusBar } from "expo-status-bar";
import { Keyboard } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

type AddAssetNavigationProp = StackNavigationProp<
  RootStackParamList,
  "AddAsset"
>;

interface AddAssetProps {
  navigation: AddAssetNavigationProp;
}

const AddAssetScreen: React.FC<AddAssetProps> = ({ navigation }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
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
  const [showPurchaseDatePicker, setShowPurchaseDatePicker] = useState(false);
  const [showExpireDatePicker, setShowExpireDatePicker] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const [customCategory, setCustomCategory] = useState("");
  const [customAsset, setCustomAsset] = useState("");

  const [status, setStatus] = useState(t("CurrentAssets.expired"));
  const [openCategory, setOpenCategory] = useState(false);
  const [openAsset, setOpenAsset] = useState(false);
  const [openBrand, setOpenBrand] = useState(false);
  const [openUnit, setOpenUnit] = useState(false);
  const statusMapping = {
    [t("CurrentAssets.expired")]: "Expired",
    [t("CurrentAssets.stillvalide")]: "Still valid",
  };

      useEffect(() => {
      const backAction = () => {
        navigation.navigate("CurrentAssert") 
        return true;
      };
  
      // Add the back handler listener
      BackHandler.addEventListener("hardwareBackPress", backAction);
  
      // Cleanup listener on component unmount
      return () => {
        BackHandler.removeEventListener("hardwareBackPress", backAction);
      };
    }, [ navigation]);

  useEffect(() => {
    setLoading(true);
    try {
      const data = require("../asset.json");
      setCategories(Object.keys(data));
    } catch (error) {
      Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (numberOfUnits && unitPrice) {
      const total = parseFloat(numberOfUnits) * parseFloat(unitPrice);
      setTotalPrice(total.toString());
    }
  }, [numberOfUnits, unitPrice]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);

    const assetsJson = require("../asset.json");
    const selectedAssets = assetsJson[category] || [];
    setAssets(selectedAssets);
    setSelectedAsset("");
    setBrand("");
    setBrands([]);
  };

  const handleAssetChange = (asset: string) => {
    setSelectedAsset(asset);

    const selected = assets.find((a) => a.asset === asset);

    if (selected) {
      setBrands(selected.brands || []);
      setBrand("");
    }
  };

  const handleDateChange = (
    event: any,
    selectedDate: any,
    type: "purchase" | "expire"
  ) => {
    const currentDate = selectedDate || new Date();
    const dateString = currentDate.toISOString().slice(0, 10);

    if (type === "purchase") {
      if (new Date(dateString) > new Date()) {
        Alert.alert(
          t("CurrentAssets.sorry"),
          t("CurrentAssets.futureDateError")
        );
        return;
      }
      setPurchaseDate(dateString);
      setShowPurchaseDatePicker(false);

      if (expireDate && new Date(dateString) > new Date(expireDate)) {
        Alert.alert(
          t("CurrentAssets.sorry"),
          t("CurrentAssets.expireBeforePurchase")
        );
        setExpireDate("");
        setWarranty("");
      } else if (expireDate) {
        calculateWarranty(dateString, expireDate);
      }
    } else if (type === "expire") {
      if (new Date(dateString) < new Date(purchaseDate)) {
        Alert.alert(
          t("CurrentAssets.sorry"),
          t("CurrentAssets.expireBeforePurchase")
        );
        return;
      }
      setExpireDate(dateString);
      setShowExpireDatePicker(false);

      setStatus(
        new Date(dateString) < new Date()
          ? t("CurrentAssets.expired")
          : t("CurrentAssets.stillvalide")
      );

      if (purchaseDate) {
        calculateWarranty(purchaseDate, dateString);
      }
    }
  };

  const calculateWarranty = (purchase: string, expire: string) => {
    const purchaseDate = new Date(purchase);
    const expireDate = new Date(expire);

    const diffTime = expireDate.getTime() - purchaseDate.getTime();
    const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));

    setWarranty(diffMonths > 0 ? diffMonths.toString() : "0");
  };

  const handleAddAsset = async () => {
    // Modified validation to exclude brand when Livestock for sale is selected
    const isBrandRequired = selectedCategory !== "Livestock for sale";
    
    if (
      !selectedCategory ||
      !selectedAsset ||
      (isBrandRequired && !brand) ||
      !batchNum ||
      !volume ||
      !unit ||
      !numberOfUnits ||
      !unitPrice ||
      !purchaseDate ||
      !expireDate ||
      !warranty ||
      !status
    ) {
      Alert.alert(t("CurrentAssets.sorry"), t("CurrentAssets.missingFields"));
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
        return;
      }

      const backendStatus = statusMapping[status] || "Expired";

      const assetData: {
        category: string;
        asset: string;
        batchNum: string;
        volume: string;
        unit: string;
        numberOfUnits: string;
        unitPrice: string;
        totalPrice: string;
        purchaseDate: string;
        expireDate: string;
        warranty: string;
        status: string;
        brand?: string; // Optional brand property
      } = {
        category: selectedCategory,
        asset: selectedAsset,
        batchNum,
        volume,
        unit,
        numberOfUnits,
        unitPrice,
        totalPrice,
        purchaseDate,
        expireDate,
        warranty,
        status: backendStatus,
      };

      // Only add brand to payload if not Livestock for sale
      if (selectedCategory !== "Livestock for sale") {
        assetData.brand = brand;
      }

      const response = await axios.post(
        `${environment.API_BASE_URL}api/auth/currentAsset`,
        assetData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert(
        t("CurrentAssets.success"),
        t("CurrentAssets.addAssetSuccess")
      );
      navigation.goBack();
    } catch (error) {
      console.error("Error adding asset:", error);
      Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
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

  const getMinimumDate = () => {
    if (purchaseDate) {
      const parsedPurchaseDate = new Date(purchaseDate);
      // If purchaseDate is invalid, fall back to current date
      if (isNaN(parsedPurchaseDate.getTime())) {
        return new Date();
      }
      return new Date(parsedPurchaseDate.getTime() + 24 * 60 * 60 * 1000); // Adding 1 day to purchase date
    }
    return new Date();
  };
  const getMaximumDate = () => {
    const currentDate = new Date();
    currentDate.setFullYear(currentDate.getFullYear() + 100);
    return currentDate;
  };

  // Check if brand field should be shown
  const shouldShowBrandField = selectedCategory !== "Livestock for sale";

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }


  const handleBatchNumChangebatchnum = (text: string) => {
  // Remove any non-numeric characters except decimal point
  const numericText = text.replace(/[-.*#]/g, '');

  // Convert to number and check if it's negative
  const numValue = parseFloat(numericText);
  
  // Only update if it's not negative (or if it's empty/NaN)
  if (numericText === '' || numericText === '.' || numValue >= 0) {
    setBatchNum(numericText);
  }
};
const handleBatchNumChangeVolume = (text: string) => {
  // Remove any non-numeric characters except decimal point
  const numericText = text.replace(/[^0-9.]/g, '');
  
  // Convert to number and check if it's negative
  const numValue = parseFloat(numericText);
  
  // Only update if it's not negative (or if it's empty/NaN)
  if (numericText === '' || numericText === '.' || numValue >= 0) {
    setVolume(numericText);
  }
};

const handleBatchNumOfUnits = (text: string) => {
  // Remove any non-numeric characters except decimal point
  const numericText = text.replace(/[^0-9.]/g, '');
  
  // Convert to number and check if it's negative
  const numValue = parseFloat(numericText);
  
  // Only update if it's not negative (or if it's empty/NaN)
  if (numericText === '' || numericText === '.' || numValue >= 0) {
    setNumberOfUnits(numericText);
  }
};

const handleBatchNumUnitPrice = (text: string) => {
  // Remove any non-numeric characters except decimal point
  const numericText = text.replace(/[^0-9.]/g, '');
  
  // Convert to number and check if it's negative
  const numValue = parseFloat(numericText);
  
  // Only update if it's not negative (or if it's empty/NaN)
  if (numericText === '' || numericText === '.' || numValue >= 0) {
    setUnitPrice(numericText);
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
        <StatusBar style="dark" />
        <View
          className="flex-row justify-between "
          style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
        >
          <TouchableOpacity onPress={() => navigation.navigate("CurrentAssert")} className="">
            <AntDesign name="left" size={24} color="#000502" />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-lg font-bold">
              {t("FixedAssets.myAssets")}
            </Text>
          </View>
        </View>
        <View className="space-y-4 p-8">
          <View>
            <Text className="text-gray-600 mb-2">
              {t("CurrentAssets.selectcategory")}
            </Text>
            <View className=" rounded-[30px]">
              <View className="rounded-[30px]">
                <DropDownPicker
                  open={openCategory}
                  value={selectedCategory}
                  setOpen={(open) => {
                    setOpenCategory(open);
                    setOpenAsset(false);
                    setOpenBrand(false);
                    setOpenUnit(false);
                  }}
                  setValue={setSelectedCategory}
                  items={[
                    ...categories.map((cat) => ({
                      label: t(`CurrentAssets.${cat}`),
                      value: cat,
                    })),
                    {
                      label: t("CurrentAssets.Other consumables"),
                      value: "Other consumables",
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
                    borderWidth: 1,
                    borderColor: "#ccc",
                    backgroundColor: "#E5E7EB",
                    borderRadius: 30,
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                  }}
                  textStyle={{
                    fontSize: 14,
                  }}
                  onOpen={dismissKeyboard}
                  onSelectItem={(item) =>
                    item.value && handleCategoryChange(item.value)
                  }
                />
              </View>
            </View>

            {selectedCategory === "Other consumables" ? (
              <>
                <Text className="text-gray-600 mt-4 mb-2">
                  {t("CurrentAssets.asset")}
                </Text>
                <TextInput
                  placeholder={t("CurrentAssets.selectasset")}
                  value={selectedAsset}
                  onChangeText={setSelectedAsset}
                  className="bg-gray-100 p-2 rounded-[30px] h-[50px] mt-2"
                />

                {shouldShowBrandField && (
                  <>
                    <Text className="text-gray-600 mt-4 mb-2">
                      {t("CurrentAssets.brand")}
                    </Text>
                    <TextInput
                      placeholder={t("CurrentAssets.selectbrand")}
                      value={brand}
                      onChangeText={setBrand}
                      className="bg-gray-100 p-2 rounded-[30px] h-[50px] mt-2"
                    />
                  </>
                )}
              </>
            ) : (
              <>
                <Text className="text-gray-600 mt-4 mb-2">
                  {t("CurrentAssets.asset")}
                </Text>
                <View className=" rounded-[30px]">
                  <DropDownPicker
                    open={openAsset}
                    value={selectedAsset}
                    setOpen={(open) => {
                      setOpenAsset(open);
                      setOpenCategory(false);
                      setOpenBrand(false);
                      setOpenUnit(false);
                    }}
                    searchable={true}
                    setValue={setSelectedAsset}
                    items={[
                      ...assets.map((asset) => ({
                        label: t(`${asset.asset}`),
                        value: asset.asset,
                      })),
                      { label: t("CurrentAssets.Other"), value: "Other" }, // Adding "Other" item
                    ]}
                    placeholder={t("CurrentAssets.selectasset")}
                    placeholderStyle={{ color: "#6B7280" }}
                    listMode="MODAL"
                    zIndex={3000}
                    zIndexInverse={1000}
                    dropDownContainerStyle={{
                      borderColor: "#ccc",
                      borderWidth: 1,
                      backgroundColor: "#E5E7EB",
                    }}
                    style={{
                      borderWidth: 1,
                      borderColor: "#ccc",
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
                      if (item.value === "Other") {
                        handleAssetChange("Other");
                      } else {
                        handleAssetChange(item.value);
                      }
                    }}
                  />
                </View>

                {selectedAsset === "Other" && (
                  <>
                    <Text className="text-gray-600 mt-4 mb-2">
                      {t("CurrentAssets.mentionother")}
                    </Text>
                    <TextInput
                      placeholder={t("CurrentAssets.Other")}
                      value={customAsset}
                      onChangeText={setCustomAsset}
                      className="bg-gray-100 p-2 rounded-[30px] h-[50px] mt-2"
                    />

                    {shouldShowBrandField && (
                      <>
                        <Text className="text-gray-600 mt-4 mb-2">
                          {t("CurrentAssets.brand")}
                        </Text>
                        <TextInput
                          placeholder={t("CurrentAssets.selectbrand")}
                          value={brand}
                          onChangeText={setBrand}
                          className="bg-gray-100 p-2 rounded-[30px] h-[50px] mt-2"
                        />
                      </>
                    )}
                  </>
                )}
              </>
            )}

            {selectedCategory !== "Other consumables" && 
              selectedAsset !== "Other" && 
              shouldShowBrandField && (
                <>
                  <Text className="text-gray-600 mt-4 mb-2">
                    {t("CurrentAssets.brand")}
                  </Text>
                  <View className=" rounded-[30px]">
                    <DropDownPicker
                      open={openBrand}
                      value={brand}
                      setOpen={(open) => {
                        setOpenBrand(open);
                        setOpenCategory(false);
                        setOpenAsset(false);
                        setOpenUnit(false);
                      }}
                      setValue={setBrand}
                      items={brands.map((b) => ({
                        label: b,
                        value: b,
                      }))}
                      placeholder={t("CurrentAssets.selectbrand")}
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
                        borderWidth: 1,
                        borderColor: "#ccc",
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
                </>
              )}
          </View>

          <Text className="text-gray-600">
            {t("CurrentAssets.batchnumber")}
          </Text>
          {/* <TextInput
            placeholder={t("CurrentAssets.batchnumber")}
            value={batchNum}
            onChangeText={setBatchNum}
            className="bg-gray-200 p-2 pl-4 rounded-[30px] h-[50px]"
            keyboardType="numeric"
          /> */}

          <TextInput
  placeholder={t("CurrentAssets.batchnumber")}
  value={batchNum}
  onChangeText={handleBatchNumChangebatchnum}
  className="bg-gray-200 p-2 pl-4 rounded-[30px] h-[50px]"
  keyboardType="numeric"
/>

          <Text className="text-gray-600 ">
            {t("CurrentAssets.unitvolume_weight")}
          </Text>
          <View className="flex-row items-center justify-between bg-white">
            <TextInput
              placeholder={t("CurrentAssets.unitvolume_weight")}
              value={volume}
           //   onChangeText={setVolume}
               onChangeText={handleBatchNumChangeVolume }
              keyboardType="decimal-pad"
              className="flex-1 mr-2 py-2 p-4 bg-gray-200 rounded-full"
            />

            <View className=" rounded-full w-32">
              <DropDownPicker
                open={openUnit}
                value={unit}
                setOpen={(open) => {
                  setOpenUnit(open);
                  setOpenBrand(false);
                  setOpenCategory(false);
                  setOpenAsset(false);
                }}
                setValue={setUnit}
                items={unitvol.map((item) => ({
                  label: item.label,
                  value: item.value,
                }))}
                placeholderStyle={{ color: "#6B7280" }}
                listMode="SCROLLVIEW"
                scrollViewProps={{
                  nestedScrollEnabled: true,
                }}
                zIndex={4000}
                zIndexInverse={800}
                dropDownContainerStyle={{
                  borderColor: "#ccc",
                  borderWidth: 1,
                  borderBlockStartColor: "#E5E7EB",
                  backgroundColor: "#E5E7EB",
                }}
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
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
          </View>

          <Text className="text-gray-600">
            {t("CurrentAssets.numberofunits")}
          </Text>
          <TextInput
            placeholder={t("CurrentAssets.numberofunits")}
            keyboardType="numeric"
            value={numberOfUnits}
              onChangeText={handleBatchNumOfUnits }
           // onChangeText={setNumberOfUnits}
            className="bg-gray-200 p-2 pl-4 rounded-[30px] h-[50px]"
          />

          <Text className="text-gray-600">{t("CurrentAssets.unitprice")}</Text>
          <TextInput
            placeholder={t("CurrentAssets.unitprice")}
            keyboardType="numeric"
            value={unitPrice}
          //  onChangeText={setUnitPrice}
             onChangeText={handleBatchNumUnitPrice }
            className="bg-gray-200 p-2 pl-4 rounded-[30px] h-[50px]"
          />

          <Text className="text-gray-600">{t("CurrentAssets.totalprice")}</Text>
          <TextInput
            placeholder={t("CurrentAssets.totalprice")}
            value={totalPrice}
            editable={false}
            className="bg-gray-200 p-2 pl-4 rounded-[30px] h-[50px]"
          />

          <Text className="text-gray-600">
            {t("CurrentAssets.purchasedate")}
          </Text>
          <TouchableOpacity
            onPress={() => setShowPurchaseDatePicker((prev) => !prev)}
            className="bg-gray-200 p-2 pl-4 rounded-[30px] h-[50px] justify-center"
          >
            <Text>
              {purchaseDate
                ? purchaseDate.toString()
                : t("CurrentAssets.purchasedate")}
            </Text>
          </TouchableOpacity>

          {showPurchaseDatePicker &&
            (Platform.OS === "ios" ? (
              <View className=" justify-center items-center z-50  bg-gray-100  rounded-lg">
                <DateTimePicker
                  value={purchaseDate ? new Date(purchaseDate) : new Date()}
                  mode="date"
                  display="inline"
                  style={{ width: 320, height: 260, padding:4 }}
                  maximumDate={new Date()}
                  onChange={(event, date) =>
                    handleDateChange(event, date, "purchase")
                  }
                />
              </View>
            ) : (
              <DateTimePicker
                value={purchaseDate ? new Date(purchaseDate) : new Date()}
                mode="date"
                display="default"
                maximumDate={new Date()}
                onChange={(event, date) =>
                  handleDateChange(event, date, "purchase")
                }
              />
            ))}

          <Text className="text-gray-600">{t("CurrentAssets.expiredate")}</Text>
          <TouchableOpacity
            onPress={() => setShowExpireDatePicker((prev) => !prev)}
            className="bg-gray-200 p-2 rounded-[30px] h-[50px] pl-4 justify-center"
          >
            <Text>
              {expireDate
                ? expireDate.toString()
                : t("CurrentAssets.expiredate")}
            </Text>
          </TouchableOpacity>

          {showExpireDatePicker &&
            (Platform.OS === "ios" ? (
              <View className=" justify-center items-center z-50  bg-gray-100   rounded-lg">
                <DateTimePicker
                  value={expireDate ? new Date(expireDate) : new Date()}
                  mode="date"
                  display="inline"
                  style={{ width: 320, height: 260, padding:4 }}
                  minimumDate={
                    purchaseDate
                      ? new Date(
                          new Date(purchaseDate).getTime() + 24 * 60 * 60 * 1000
                        )
                      : new Date()
                  }
                  maximumDate={getMaximumDate()}
                  onChange={(event, date) =>
                    handleDateChange(event, date, "expire")
                  }
                />
              </View>
            ) : (
              <DateTimePicker
                value={expireDate ? new Date(expireDate) : new Date()}
                mode="date"
                minimumDate={
                  purchaseDate
                    ? new Date(
                        new Date(purchaseDate).getTime() + 24 * 60 * 60 * 1000
                      )
                    : new Date()
                }
                maximumDate={getMaximumDate()}
                display="default"
                onChange={(event, date) =>
                  handleDateChange(event, date, "expire")
                }
              />
            ))}

          <Text className="text-gray-600">
            {t("CurrentAssets.warrentyinmonths")}
          </Text>
          <TextInput
            placeholder={t("CurrentAssets.warrentyinmonths")}
            value={warranty}
            onChangeText={setWarranty}
            keyboardType="numeric"
            className="bg-gray-200 p-2 pl-4 rounded-[30px] h-[50px]"
            editable={false}
          />

          <Text className="text-gray-600">{t("CurrentAssets.status")}</Text>
          <View className="bg-gray-200 rounded-[40px] p-2 items-center justify-center">
            <Text
              className={` font-bold ${
                status === t("CurrentAssets.expired")
                  ? "text-red-500"
                  : "text-green-500"
              }`}
            >
              {status === t("CurrentAssets.expired")
                ? t("CurrentAssets.expired")
                : t("CurrentAssets.stillvalide")}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleAddAsset}
            className="bg-green-400 rounded-[30px] p-3 mt-4 mb-16"
          >
            <Text className="text-white text-center">
              {t("CurrentAssets.AddAsset")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddAssetScreen;