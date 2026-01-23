import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  BackHandler,
} from "react-native";
import { StatusBar, Platform } from "react-native";
import axios from "axios";
import { RootStackParamList } from "../types";
import { StackNavigationProp } from "@react-navigation/stack";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { environment } from "@/environment/environment";
import Icon from "react-native-vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import { Keyboard } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import type { RootState } from "@/services/reducxStore";
import LottieView from "lottie-react-native";
type FarmAddCurrentAssetNavigationProp = StackNavigationProp<
  RootStackParamList,
  "FarmAddCurrentAsset"
>;

interface FarmAddCurrentAssetProps {
  navigation: FarmAddCurrentAssetNavigationProp;
}

type RouteParams = {
  farmId: number;
  farmName: string;
};
interface UserData {
  role: string;
}
const FarmAddCurrentAsset: React.FC<FarmAddCurrentAssetProps> = ({
  navigation,
}) => {
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
  const [existingAssets, setExistingAssets] = useState<any[]>([]);
const [isDuplicate, setIsDuplicate] = useState(false);
const [duplicateMessage, setDuplicateMessage] = useState("");

  const [status, setStatus] = useState("");

  const [openCategory, setOpenCategory] = useState(false);
  const [openAsset, setOpenAsset] = useState(false);
  const [openBrand, setOpenBrand] = useState(false);
  const [openUnit, setOpenUnit] = useState(false);
  const user = useSelector(
    (state: RootState) => state.user.userData,
  ) as UserData | null;

  const statusMapping = {
    [t("CurrentAssets.expired")]: "Expired",
    [t("CurrentAssets.stillvalide")]: "Still valid",
  };
  const route = useRoute();
  const { farmId, farmName } = route.params as RouteParams;

  console.log("Add Currect Asset============", farmId);


  // Add function to check for duplicates
const checkDuplicate = (
  category: string, 
  asset: string, 
  brand: string, 
  batchNum: string, 
  volume: string, 
  unit: string
) => {
  const duplicate = existingAssets.find(
    (item) =>
      item.category === category &&
      item.asset === asset &&
      item.brand === brand &&
      item.batchNum.toString() === batchNum.toString() &&
      item.unit === unit &&
      parseFloat(item.unitVolume) === parseFloat(volume)
  );

  if (duplicate) {
    setIsDuplicate(true);
    setDuplicateMessage(
      `This asset already exists: ${asset} - ${brand} - Batch: ${batchNum} - ${volume} ${unit}`
    );
    return true;
  } else {
    setIsDuplicate(false);
    setDuplicateMessage("");
    return false;
  }
};

  useEffect(() => {
    const backAction = () => {
      navigation.navigate("Main", {
        screen: "FarmCurrectAssets",
        params: { farmId: farmId, farmName: farmName },
      } as any);
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    return () => subscription.remove();
  }, [navigation]);

  useEffect(() => {
    setLoading(true);
    try {
      const data = require("../../asset.json");
      setCategories(Object.keys(data));
    } catch (error) {
      Alert.alert(t("Main.error"), t("Main.somethingWentWrong"), [
        { text: t("PublicForum.OK") },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Create a function to reset the form
    const resetForm = () => {
      setSelectedCategory("");
      setSelectedAsset("");
      setBrands([]);
      setBrand("");
      setBatchNum("");
      setVolume("");
      setUnit("ml");
      setNumberOfUnits("");
      setUnitPrice("");
      setTotalPrice("");
      setPurchaseDate("");
      setExpireDate("");
      setWarranty("");
      setStatus(""); // Changed from t("CurrentAssets.expired") to empty string
      setCustomCategory("");
      setCustomAsset("");
      setAssets([]);

      setOpenCategory(false);
      setOpenAsset(false);
      setOpenBrand(false);
      setOpenUnit(false);
    };

    // Listen for focus event
    const unsubscribe = navigation.addListener("focus", () => {
      resetForm();
    });

    // Cleanup listener
    return unsubscribe;
  }, [navigation, t]);

  useEffect(() => {
    if (numberOfUnits && unitPrice) {
      const total = parseFloat(numberOfUnits) * parseFloat(unitPrice);
      setTotalPrice(total.toString());
    }
  }, [numberOfUnits, unitPrice]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);

    const assetsJson = require("../../asset.json");
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
    type: "purchase" | "expire",
  ) => {
    const currentDate = selectedDate || new Date();
    const dateString = currentDate.toISOString().slice(0, 10);

    if (type === "purchase") {
      if (new Date(dateString) > new Date()) {
        Alert.alert(
          t("CurrentAssets.sorry"),
          t("CurrentAssets.futureDateError"),
          [{ text: t("PublicForum.OK") }],
        );
        return;
      }
      setPurchaseDate(dateString);
      setShowPurchaseDatePicker(false);

      if (expireDate && new Date(dateString) > new Date(expireDate)) {
        Alert.alert(
          t("CurrentAssets.sorry"),
          t("CurrentAssets.expireBeforePurchase"),
          [{ text: t("PublicForum.OK") }],
        );
        setExpireDate("");
        setWarranty("");
        setStatus(""); // Reset status when dates are invalid
      } else if (expireDate) {
        // Only calculate warranty and set status when both dates are valid
        calculateWarranty(dateString, expireDate);
        setStatus(
          new Date(expireDate) < new Date()
            ? t("CurrentAssets.expired")
            : t("CurrentAssets.stillvalide"),
        );
      }
    } else if (type === "expire") {
      if (purchaseDate && new Date(dateString) < new Date(purchaseDate)) {
        Alert.alert(
          t("CurrentAssets.sorry"),
          t("CurrentAssets.expireBeforePurchase"),
          [{ text: t("PublicForum.OK") }],
        );
        return;
      }
      setExpireDate(dateString);
      setShowExpireDatePicker(false);

      // Only set status if purchase date is also selected
      if (purchaseDate) {
        const newStatus =
          new Date(dateString) < new Date()
            ? t("CurrentAssets.expired")
            : t("CurrentAssets.stillvalide");
        setStatus(newStatus);
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
    // Check if status is expired

    const assetToCheck = selectedAsset === "Other" ? customAsset : selectedAsset;
  
  // Determine the brand (handle "Livestock for sale" special case)
  const brandToCheck = selectedCategory === "Livestock for sale" ? "" : brand;

  // Check for duplicate asset FIRST
  if (checkDuplicate(selectedCategory, assetToCheck, brandToCheck, batchNum, volume, unit)) {
    Alert.alert(
      t("CurrentAssets.sorry"),
      "CurrentAssets.This exact asset already exists. You cannot add the same asset with the same brand, batch number, volume, and unit.",
      [{ text: t("Farms.okButton") }]
    );
    return;
  }
    if (status === t("CurrentAssets.expired")) {
      Alert.alert(
        t("CurrentAssets.sorry"),
        t("CurrentAssets.cannotAddExpiredAsset"),
        [{ text: t("Farms.okButton") }],
      );
      return;
    }

    
 

    if (status === t("CurrentAssets.expired")) {
    Alert.alert(
      t("CurrentAssets.sorry"),
      t("CurrentAssets.cannotAddExpiredAsset"),
      [{ text: t("Farms.okButton") }]
    );
    return;
  }

    const isBrandRequired = selectedCategory !== "Livestock for sale";

    // Validate required fields
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
      Alert.alert(t("CurrentAssets.sorry"), t("CurrentAssets.missingFields"), [
        { text: t("Farms.okButton") },
      ]);
      return;
    }

   const volumeNum = parseFloat(volume);
  if (isNaN(volumeNum) || volumeNum <= 0) {
    Alert.alert(
      t("CurrentAssets.sorry"),
      t("CurrentAssets.volumeZeroError"),
      [{ text: t("Farms.okButton") }],
    );
    return;
  }

  const unitPriceNum = parseFloat(unitPrice);
  if (isNaN(unitPriceNum) || unitPriceNum <= 0) {
    Alert.alert(
      t("CurrentAssets.sorry"),
      t("CurrentAssets.unitPriceZeroError"),
      [{ text: t("Farms.okButton") }],
    );
    return;
  }

  const numberOfUnitsNum = parseFloat(numberOfUnits);
  if (isNaN(numberOfUnitsNum) || numberOfUnitsNum <= 0) {
    Alert.alert(t("CurrentAssets.sorry"), t("CurrentAssets.unitsZeroError"), [
      { text: t("Farms.okButton") },
    ]);
    return;
  }

  const batchNumNum = parseFloat(batchNum);
  if (isNaN(batchNumNum) || batchNumNum < 0) {
    Alert.alert(
      t("CurrentAssets.sorry"),
      t("CurrentAssets.batchNumberError"),
      [{ text: t("Farms.okButton") }],
    );
    return;
  }

  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      Alert.alert(t("Main.error"), t("Main.somethingWentWrong"), [
        { text: t("Farms.okButton") },
      ]);
      return;
    }

    const backendStatus = statusMapping[status] || "Still valid";

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
      brand?: string;
    } = {
      category: selectedCategory,
      asset: assetToCheck, // Use the determined asset name
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
      `${environment.API_BASE_URL}api/farm/currentAsset/${farmId}`,
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
      t("CurrentAssets.addAssetSuccess"),
      [{ text: t("Farms.okButton") }],
    );
    navigation.navigate("Main", {
      screen: "FarmCurrectAssets",
      params: { farmId: farmId, farmName: farmName },
    } as any);
  } catch (error) {
    console.error("Error adding asset:", error);
    Alert.alert(t("Main.error"), t("Main.somethingWentWrong"), [
      { text: t("Farms.okButton") },
    ]);
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

  const getMaximumDate = () => {
    const currentDate = new Date();
    currentDate.setFullYear(currentDate.getFullYear() + 100);
    return currentDate;
  };

  const shouldShowBrandField = selectedCategory !== "Livestock for sale";

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <LottieView
          source={require("../../assets/jsons/loader.json")}
          autoPlay
          loop
          style={{ width: 300, height: 300 }}
        />
      </View>
    );
  }

  const handleBatchNumChangebatchnum = (text: string) => {
    const numericText = text.replace(/[-.*#]/g, "");

    const numValue = parseFloat(numericText);

    if (numericText === "" || numericText === "." || numValue >= 0) {
      setBatchNum(numericText);
    }
  };
  const handleBatchNumChangeVolume = (text: string) => {
    const numericText = text.replace(/[^0-9.]/g, "");

    const numValue = parseFloat(numericText);

    if (numericText === "" || numericText === "." || numValue >= 0) {
      setVolume(numericText);
    }
  };

  const handleBatchNumOfUnits = (text: string) => {
    const numericText = text.replace(/[^0-9.]/g, "");

    const numValue = parseFloat(numericText);

    if (numericText === "" || numericText === "." || numValue >= 0) {
      setNumberOfUnits(numericText);
    }
  };

  const handleBatchNumUnitPrice = (text: string) => {
    const numericText = text.replace(/[^0-9.]/g, "");

    const numValue = parseFloat(numericText);

    if (numericText === "" || numericText === "." || numValue >= 0) {
      setUnitPrice(numericText);
    }
  };

  const fetchExistingAssets = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) return;

    const response = await axios.get(
      `${environment.API_BASE_URL}api/farm/get-currectasset-alreadyHave/${farmId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.status === "success") {
      setExistingAssets(response.data.currentAssetsByCategory);
    }
  } catch (error) {
    console.error("Error fetching existing assets:", error);
  }
};

useFocusEffect(
  React.useCallback(() => {
    fetchExistingAssets();
  }, [farmId])
);



// Add useEffect to check for duplicates when values change
useEffect(() => {
  if (selectedCategory && selectedAsset && batchNum && volume && unit) {
    // Determine the actual asset name to check
    let assetToCheck = selectedAsset;
    if (selectedAsset === "Other" && customAsset) {
      assetToCheck = customAsset;
    }
    
    // Determine the brand to check (handle "Livestock for sale" category)
    let brandToCheck = brand;
    if (selectedCategory === "Livestock for sale") {
      brandToCheck = ""; // or use a default value
    }
    
    // Only check if we have all required fields
    if (assetToCheck && (selectedCategory === "Livestock for sale" || brandToCheck)) {
      checkDuplicate(selectedCategory, assetToCheck, brandToCheck, batchNum, volume, unit);
    }
  } else {
    setIsDuplicate(false);
    setDuplicateMessage("");
  }
}, [selectedCategory, selectedAsset, customAsset, brand, batchNum, volume, unit, existingAssets]);


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
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={false}
        />
        <View
          className="flex-row justify-between "
          style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
        >
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Main", {
                screen: "FarmCurrectAssets",
                params: { farmId: farmId, farmName: farmName },
              } as any)
            }
          >
            <AntDesign
              name="left"
              size={24}
              color="#000502"
              style={{
                paddingHorizontal: wp(3),
                paddingVertical: hp(1.5),
                backgroundColor: "#F6F6F680",
                borderRadius: 50,
              }}
            />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-lg font-bold pt-2 -ml-[15%]">{farmName}</Text>
          </View>
        </View>
        <View className="space-y-4 p-8">
          {user && user.role !== "Supervisor" && (
            <View className="flex-row mt-[-8%] justify-center">
              <View className="w-1/2">
                <TouchableOpacity>
                  <Text className="text-black text-center font-semibold text-lg">
                    {t("CurrentAssets.currentAssets")}
                  </Text>
                  <View className="border-t-[2px] border-black" />
                </TouchableOpacity>
              </View>
              <View className="w-1/2">
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("FarmFixDashBoard", {
                      farmId: farmId,
                      farmName: farmName,
                    })
                  }
                >
                  <Text className="text-black text-center font-semibold text-lg">
                    {t("CurrentAssets.fixedAssets")}
                  </Text>
                  <View className="border-t-[2px] border-[#D9D9D9]" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          <View
            className={`${user && user.role == "Supervisor" ? "-mt-8" : ""}`}
          >
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
                  searchPlaceholder={t("SignupForum.TypeSomething")}
                  placeholderStyle={{ color: "#6B7280" }}
                  listMode="SCROLLVIEW"
                  scrollViewProps={{
                    nestedScrollEnabled: true,
                  }}
                  zIndex={10000}
                  zIndexInverse={1000}
                  dropDownContainerStyle={{
                    borderColor: "#F4F4F4",
                    borderWidth: 1,
                    backgroundColor: "#F4F4F4",
                  }}
                  style={{
                    borderWidth: 1,
                    borderColor: "#F4F4F4",
                    backgroundColor: "#F4F4F4",
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
                  placeholder={t("CurrentAssets.enterasset")}
                  value={selectedAsset}
                  onChangeText={setSelectedAsset}
                  className="bg-[#F4F4F4] p-2 rounded-[30px] h-[50px] mt-2"
                />

                {shouldShowBrandField && (
                  <>
                    <Text className="text-gray-600 mt-4 mb-2">
                      {t("CurrentAssets.brand")}
                    </Text>
                    <TextInput
                      placeholder={t("CurrentAssets.enterbrand")}
                      value={brand}
                      onChangeText={setBrand}
                      className="bg-[#F4F4F4] p-2 rounded-[30px] h-[50px] mt-2"
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
                      { label: t("CurrentAssets.Other"), value: "Other" },
                    ]}
                    placeholder={t("CurrentAssets.selectasset")}
                    searchPlaceholder={t("SignupForum.TypeSomething")}
                    placeholderStyle={{ color: "#6B7280" }}
                    listMode="MODAL"
                    modalProps={{
                      animationType: "slide",
                      transparent: false,
                      presentationStyle: "fullScreen",
                      statusBarTranslucent: false,
                    }}
                    modalContentContainerStyle={{
                      paddingTop:
                        Platform.OS === "android"
                          ? StatusBar.currentHeight || 0
                          : 0,
                      paddingBottom: 35,
                      backgroundColor: "#fff",
                    }}
                    zIndex={3000}
                    zIndexInverse={1000}
                    dropDownContainerStyle={{
                      borderColor: "#F4F4F4",
                      borderWidth: 1,
                      backgroundColor: "#F4F4F4",
                    }}
                    style={{
                      borderWidth: 1,
                      borderColor: "#F4F4F4",
                      backgroundColor: "#F4F4F4",
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
                      className="bg-[#F4F4F4] p-2 rounded-[30px] h-[50px] mt-2"
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
                          className="bg-[#F4F4F4] p-2 rounded-[30px] h-[50px] mt-2"
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
                      searchPlaceholder={t("SignupForum.TypeSomething")}
                      placeholderStyle={{ color: "#6B7280" }}
                      listMode="SCROLLVIEW"
                      scrollViewProps={{
                        nestedScrollEnabled: true,
                      }}
                      zIndex={5000}
                      zIndexInverse={1000}
                      dropDownContainerStyle={{
                        borderColor: "#F4F4F4",
                        borderWidth: 1,
                        backgroundColor: "#F4F4F4",
                      }}
                      style={{
                        borderWidth: 1,
                        borderColor: "#F4F4F4",
                        backgroundColor: "#F4F4F4",
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

          <TextInput
            placeholder={t("CurrentAssets.batchnumber")}
            value={batchNum}
            onChangeText={handleBatchNumChangebatchnum}
            className="bg-[#F4F4F4] p-2 pl-4 rounded-[30px] h-[50px]"
            keyboardType="numeric"
          />

          <Text className="text-gray-600 ">
            {t("CurrentAssets.unitvolume_weight")}
          </Text>
          <View className="flex-row items-center justify-between bg-white">
            <TextInput
              placeholder={t("CurrentAssets.unitvolume_weight")}
              value={volume}
              onChangeText={handleBatchNumChangeVolume}
              keyboardType="decimal-pad"
              className="flex-1 mr-2 py-2 p-4 bg-[#F4F4F4] rounded-full"
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
                  borderColor: "#F4F4F4",
                  borderWidth: 1,
                  borderBlockStartColor: "#F4F4F4",
                  backgroundColor: "#F4F4F4",
                }}
                style={{
                  borderWidth: 1,
                  borderColor: "#F4F4F4",
                  backgroundColor: "#F4F4F4",
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
            onChangeText={handleBatchNumOfUnits}
            className="bg-[#F4F4F4] p-2 pl-4 rounded-[30px] h-[50px]"
          />

          <Text className="text-gray-600">{t("CurrentAssets.unitprice")}</Text>
          <TextInput
            placeholder={t("CurrentAssets.unitprice")}
            keyboardType="numeric"
            value={unitPrice}
            onChangeText={handleBatchNumUnitPrice}
            className="bg-[#F4F4F4] p-2 pl-4 rounded-[30px] h-[50px]"
          />

          <Text className="text-gray-600">{t("CurrentAssets.totalprice")}</Text>
          <TextInput
            placeholder={t("CurrentAssets.totalprice")}
            value={totalPrice}
            editable={false}
            className="bg-[#F4F4F4] p-2 pl-4 rounded-[30px] h-[50px]"
          />

          <Text className="text-gray-600">
            {t("CurrentAssets.purchasedate")}
          </Text>
          <TouchableOpacity
            onPress={() => setShowPurchaseDatePicker((prev) => !prev)}
            className="bg-[#F4F4F4] p-2 pl-4 pr-4 rounded-[30px] h-[50px] justify-center flex-row items-center"
          >
            <Text className="flex-1">
              {purchaseDate
                ? purchaseDate.toString()
                : t("CurrentAssets.purchasedate")}
            </Text>
            <Icon name="calendar-outline" size={20} color="#6B7280" />
          </TouchableOpacity>

          {showPurchaseDatePicker &&
            (Platform.OS === "ios" ? (
              <View className=" justify-center items-center z-50  bg-[#F4F4F4]  rounded-lg">
                <DateTimePicker
                  value={purchaseDate ? new Date(purchaseDate) : new Date()}
                  mode="date"
                  display="inline"
                  style={{ width: 320, height: 260, padding: 4 }}
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
            className="bg-[#F4F4F4] p-2 pl-4 pr-4 rounded-[30px] h-[50px] justify-center flex-row items-center"
          >
            <Text className="flex-1">
              {expireDate
                ? expireDate.toString()
                : t("CurrentAssets.expiredate")}
            </Text>
            <Icon name="calendar-outline" size={20} color="#6B7280" />
          </TouchableOpacity>

          {showExpireDatePicker &&
            (Platform.OS === "ios" ? (
              <View className=" justify-center items-center z-50  bg-[#F4F4F4]   rounded-lg">
                <DateTimePicker
                  value={expireDate ? new Date(expireDate) : new Date()}
                  mode="date"
                  display="inline"
                  style={{ width: 320, height: 260, padding: 4 }}
                  minimumDate={
                    purchaseDate
                      ? new Date(
                          new Date(purchaseDate).getTime() +
                            24 * 60 * 60 * 1000,
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
                        new Date(purchaseDate).getTime() + 24 * 60 * 60 * 1000,
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
            className="bg-[#F4F4F4] p-2 pl-4 rounded-[30px] h-[50px]"
            editable={false}
          />

          <Text className="text-gray-600">{t("CurrentAssets.status")}</Text>
          <View className="bg-[#F4F4F4] rounded-[40px] p-2 items-center justify-center">
            {status ? (
              <Text
                className={`font-bold ${
                  status === t("CurrentAssets.expired")
                    ? "text-red-500"
                    : "text-green-500"
                }`}
              >
                {status === t("CurrentAssets.expired")
                  ? t("CurrentAssets.expired")
                  : t("CurrentAssets.stillvalide")}
              </Text>
            ) : (
              <Text className="text-gray-400">{t("CurrentAssets.status")}</Text>
            )}
          </View>

          <TouchableOpacity
            onPress={handleAddAsset}
            className={`${
              status === t("CurrentAssets.expired")
                ? "bg-gray-400"
                : "bg-[#353535]"
            } rounded-[30px] p-3 mt-4 mb-16`}
            disabled={status === t("CurrentAssets.expired")}
          >
            <Text className="text-white text-center">
              {status === t("CurrentAssets.expired")
                ? t("CurrentAssets.AddAsset")
                : t("CurrentAssets.AddAsset")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default FarmAddCurrentAsset;
