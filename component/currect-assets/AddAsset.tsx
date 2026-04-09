import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  BackHandler,
  StatusBar,
  Platform,
  Keyboard,
} from "react-native";
import axios from "axios";
import { StackNavigationProp } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import { RootStackParamList } from "../types/types";
import GlobalSearchModal from "../../component/common/GlobalSearchModal";
import CustomHeader from "../common/CustomHeader";
import AntDesign from "react-native-vector-icons/AntDesign";
import { EvilIcons } from "@expo/vector-icons";

type AddAssetNavigationProp = StackNavigationProp<
  RootStackParamList,
  "AddAsset"
>;

interface AddAssetProps {
  navigation: AddAssetNavigationProp;
}

interface Farm {
  id: number;
  userId: number;
  farmName: string;
}

interface ModalState {
  farm: boolean;
  category: boolean;
  asset: boolean;
  brand: boolean;
  unit: boolean;
}

const UNIT_OPTIONS = [
  { label: "ml", value: "ml" },
  { label: "kg", value: "kg" },
  { label: "l", value: "l" },
];

const INITIAL_ERRORS = {
  selectedFarm: "",
  selectedCategory: "",
  selectedAsset: "",
  brand: "",
  batchNum: "",
  volume: "",
  numberOfUnits: "",
  unitPrice: "",
  purchaseDate: "",
  expireDate: "",
  warranty: "",
  status: "",
};

const preventLeadingSpace = (text: string): string => text.replace(/^\s+/, "");

const AddAssetScreen: React.FC<AddAssetProps> = ({ navigation }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const { t } = useTranslation();
  const [categories, setCategories] = useState<string[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [existingAssets, setExistingAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("");
  const [customAsset, setCustomAsset] = useState("");
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
  const [status, setStatus] = useState("");
  const [modals, setModals] = useState<ModalState>({
    farm: false,
    category: false,
    asset: false,
    brand: false,
    unit: false,
  });
  const [showPurchaseDatePicker, setShowPurchaseDatePicker] = useState(false);
  const [showExpireDatePicker, setShowExpireDatePicker] = useState(false);

  const [fieldErrors, setFieldErrors] = useState(INITIAL_ERRORS);

  const openModal = (key: keyof ModalState) =>
    setModals((m) => ({ ...m, [key]: true }));
  const closeModal = (key: keyof ModalState) =>
    setModals((m) => ({ ...m, [key]: false }));

  const clearError = (key: keyof typeof INITIAL_ERRORS) =>
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));

  const statusMapping: Record<string, string> = {
    [t("CurrentAssets.expired")]: "Expired",
    [t("CurrentAssets.stillvalide")]: "Still valid",
  };

  const cleanNumber = (value: string) =>
    value ? parseFloat(value.replace(/,/g, "")) : 0;

  const resetForm = () => {
    setSelectedFarm("");
    setSelectedCategory("");
    setSelectedAsset("");
    setCustomAsset("");
    setBrand("");
    setBrands([]);
    setBatchNum("");
    setVolume("");
    setUnit("ml");
    setNumberOfUnits("");
    setUnitPrice("");
    setTotalPrice("");
    setPurchaseDate("");
    setExpireDate("");
    setWarranty("");
    setStatus("");
    setAssets([]);
    setFieldErrors(INITIAL_ERRORS);
    setModals({
      farm: false,
      category: false,
      asset: false,
      brand: false,
      unit: false,
    });
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        navigation.navigate("CurrentAssert");
        return true;
      },
    );
    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      resetForm();
      setExistingAssets([]);

      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    setLoading(true);
    try {
      const data = require("../../assets/jsons/current-asset.json");
      setCategories(Object.keys(data));
    } catch {
      Alert.alert(t("Main.error"), t("Main.somethingWentWrong"), [
        { text: t("PublicForum.OK") },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (numberOfUnits && unitPrice) {
      const total = cleanNumber(numberOfUnits) * cleanNumber(unitPrice);
      setTotalPrice(total.toFixed(2));
    }
  }, [numberOfUnits, unitPrice]);

  useEffect(() => {
    if (selectedCategory && selectedAsset && batchNum && volume && unit) {
      const assetToCheck =
        selectedAsset === "Other" && customAsset ? customAsset : selectedAsset;
      const brandToCheck =
        selectedCategory === "Livestock for sale" ? "" : brand;

      if (
        assetToCheck &&
        (selectedCategory === "Livestock for sale" || brandToCheck)
      ) {
        checkDuplicate(selectedCategory, assetToCheck, brandToCheck, batchNum);
      }
    } else {
      console.error("Add Asset Error");
    }
  }, [
    selectedCategory,
    selectedAsset,
    customAsset,
    brand,
    batchNum,
    volume,
    unit,
    existingAssets,
  ]);

  useFocusEffect(
    React.useCallback(() => {
      fetchExistingAssets();

      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });
    }, []),
  );

  useEffect(() => {
    fetchFarmData();
  }, []);

  const fetchExistingAssets = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;
      const response = await axios.get(
        `${environment.API_BASE_URL}api/auth/get-currentasset-alreadyHave-byuser`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.data.status === "success") {
        setExistingAssets(response.data.currentAssetsByCategory);
      }
    } catch (error) {
      console.error("Error fetching existing assets:", error);
    }
  };

  const fetchFarmData = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;
      const response = await axios.get(
        `${environment.API_BASE_URL}api/farm/select-farm`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (response.data.status === "success") {
        setFarms(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching farms:", error);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const assetsJson = require("../../assets/jsons/current-asset.json");
    setAssets(assetsJson[category] || []);
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

  const checkDuplicate = (
    category: string,
    asset: string,
    brand: string,
    batchNum: string,
  ): boolean => {
    const duplicate = existingAssets.find(
      (item) =>
        item.category === category &&
        item.asset === asset &&
        item.brand === brand &&
        item.batchNum.toString() === batchNum.toString(),
    );
    return !!duplicate;
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
        setStatus("");
      } else if (expireDate) {
        calculateWarranty(dateString, expireDate);
        setStatus(
          new Date(expireDate) < new Date()
            ? t("CurrentAssets.expired")
            : t("CurrentAssets.stillvalide"),
        );
      }
    } else {
      if (new Date(dateString) < new Date(purchaseDate)) {
        Alert.alert(
          t("CurrentAssets.sorry"),
          t("CurrentAssets.expireBeforePurchase"),
          [{ text: t("PublicForum.OK") }],
        );
        return;
      }
      setExpireDate(dateString);
      setShowExpireDatePicker(false);
      if (purchaseDate) {
        setStatus(
          new Date(dateString) < new Date()
            ? t("CurrentAssets.expired")
            : t("CurrentAssets.stillvalide"),
        );
        calculateWarranty(purchaseDate, dateString);
      }
    }
  };

  const calculateWarranty = (purchase: string, expire: string) => {
    const diffTime = new Date(expire).getTime() - new Date(purchase).getTime();
    const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
    setWarranty(diffMonths > 0 ? diffMonths.toString() : "0");
  };

  const handleBatchNumChange = (text: string) => {
    clearError("batchNum");
    setBatchNum(preventLeadingSpace(text.replace(/[-.*#]/g, "")));
  };
  const handleVolumeChange = (text: string) => {
    clearError("volume");

    const sanitized = text.replace(/[^0-9.]/g, "");

    const parts = sanitized.split(".");
    if (parts.length > 2) return;

    if (parts[1] !== undefined && parts[1].length > 2) return;

    setVolume(sanitized);
  };
  const handleNumOfUnitsChange = (text: string) => {
    clearError("numberOfUnits");
    setNumberOfUnits(text.replace(/[^0-9.]/g, ""));
  };
  const handleUnitPriceChange = (text: string) => {
    clearError("unitPrice");

    const sanitized = text.replace(/[^0-9.]/g, "");

    const parts = sanitized.split(".");
    if (parts.length > 2) return;

    if (parts[1] !== undefined && parts[1].length > 2) return;

    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const formatted = parts.length === 2 ? `${intPart}.${parts[1]}` : intPart;

    setUnitPrice(formatted);
  };

  const handleAddAsset = async () => {
    const isBrandRequired = selectedCategory !== "Livestock for sale";
    const assetToCheck =
      selectedAsset === "Other" ? customAsset : selectedAsset;
    const brandToCheck = isBrandRequired ? brand : "";

    if (
      checkDuplicate(selectedCategory, assetToCheck, brandToCheck, batchNum)
    ) {
      Alert.alert(
        t("CurrentAssets.sorry"),
        t("CurrentAssets.This exact asset already exists."),
        [{ text: t("Farms.okButton") }],
      );
      return;
    }

    const errors = { ...INITIAL_ERRORS };
    let hasError = false;

    const requiredFields: Array<[string, keyof typeof INITIAL_ERRORS, string]> =
      [
        [
          selectedFarm,
          "selectedFarm",
          `${t("CurrentAssets.Select Farm")} is required`,
        ],
        [
          selectedCategory,
          "selectedCategory",
          `${t("CurrentAssets.selectcategory")} is required`,
        ],
        [
          selectedAsset,
          "selectedAsset",
          `${t("CurrentAssets.asset")} is required`,
        ],
        [batchNum, "batchNum", `${t("CurrentAssets.batchnumber")} is required`],
        [
          volume,
          "volume",
          `${t("CurrentAssets.unitvolume_weight")} is required`,
        ],
        [
          numberOfUnits,
          "numberOfUnits",
          `${t("CurrentAssets.numberofunits")} is required`,
        ],
        [unitPrice, "unitPrice", `${t("CurrentAssets.unitprice")} is required`],
        [
          purchaseDate,
          "purchaseDate",
          `${t("CurrentAssets.purchasedate")} is required`,
        ],
        [
          expireDate,
          "expireDate",
          `${t("CurrentAssets.expiredate")} is required`,
        ],
        [
          warranty,
          "warranty",
          `${t("CurrentAssets.warrentyinmonths")} is required`,
        ],
        [status, "status", `${t("CurrentAssets.status")} is required`],
      ];

    requiredFields.forEach(([val, key, message]) => {
      if (!val) {
        errors[key] = message;
        hasError = true;
      }
    });

    if (isBrandRequired && !brand) {
      errors.brand = `${t("CurrentAssets.brand")} is required`;
      hasError = true;
    }

    if (status === t("CurrentAssets.expired")) {
      Alert.alert(
        t("CurrentAssets.sorry"),
        t("CurrentAssets.cannotAddExpiredAsset"),
        [{ text: t("PublicForum.OK") }],
      );
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
      return;
    }

    setFieldErrors(errors);
    if (hasError) {
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"), [
          { text: t("PublicForum.OK") },
        ]);
        return;
      }

      const cleanedUnitPrice = cleanNumber(unitPrice);
      const cleanedNumberOfUnits = cleanNumber(numberOfUnits);

      const assetData: Record<string, string> = {
        category: selectedCategory,
        asset: selectedAsset,
        batchNum,
        volume,
        unit,
        numberOfUnits: cleanedNumberOfUnits.toString(),
        unitPrice: cleanedUnitPrice.toString(),
        totalPrice: (cleanedUnitPrice * cleanedNumberOfUnits).toString(),
        purchaseDate,
        expireDate,
        warranty,
        status: statusMapping[status] || "Expired",
        farmId: selectedFarm,
      };

      if (isBrandRequired) assetData.brand = brand;

      await axios.post(
        `${environment.API_BASE_URL}api/auth/currentAsset`,
        assetData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      Alert.alert(
        t("CurrentAssets.success"),
        t("CurrentAssets.addAssetSuccess"),
        [{ text: t("PublicForum.OK") }],
      );
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
      navigation.navigate("CurrentAssert");
    } catch (error: any) {
      if (error?.response?.status === 409) {
        Alert.alert(
          t("CurrentAssets.sorry"),
          t(
            "CurrentAssets.This exact asset already exists. You cannot add the same asset with the same brand, batch number, volume, and unit.",
          ),
          [{ text: t("Farms.okButton") }],
        );
        scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
        return;
      }

      console.error("Error adding asset:", error);
      Alert.alert(t("Main.error"), t("Main.somethingWentWrong"), [
        { text: t("PublicForum.OK") },
      ]);
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
    }
  };

  const shouldShowBrandField = selectedCategory !== "Livestock for sale";
  const getMaximumDate = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 100);
    return d;
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  const farmItems = farms.map((f) => ({
    label: f.farmName,
    value: f.id.toString(),
  }));

  const categoryItems = [
    ...categories.map((cat) => ({
      label: t(`CurrentAssets.${cat}`),
      value: cat,
    })),
    { label: t("CurrentAssets.Other consumables"), value: "Other consumables" },
  ];

  const assetItems = [
    ...assets.map((a) => ({ label: t(`${a.asset}`), value: a.asset })),
    { label: t("CurrentAssets.Other"), value: "Other" },
  ];

  const brandItems = brands.map((b) => ({ label: b, value: b }));

  const PickerTrigger = ({
    label,
    placeholder,
    onPress,
    error,
  }: {
    label: string;
    placeholder: string;
    onPress: () => void;
    error?: string;
  }) => (
    <View className="mb-1">
      <TouchableOpacity
        onPress={() => {
          Keyboard.dismiss();
          onPress();
        }}
        className="bg-[#F4F4F4] rounded-[30px] h-[50px] flex-row items-center px-4 justify-between"
      >
        <Text
          className={label ? "text-black text-sm" : "text-[#6B7280] text-sm"}
        >
          {label || placeholder}
        </Text>
        <AntDesign name="caret-down" size={14} color="#5e5d5d" />
      </TouchableOpacity>
      {error ? (
        <Text className="text-red-500 text-xs mt-1 ml-2">{error}</Text>
      ) : null}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 bg-white"
        keyboardShouldPersistTaps="handled"
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={false}
        />

        <CustomHeader
          title={t("FixedAssets.myAssets")}
          navigation={navigation}
          onBackPress={() => navigation.navigate("CurrentAssert")}
        />

        {/* Tab Bar */}
        <View className="flex-row mt-2 justify-center">
          <View className="w-1/2">
            <TouchableOpacity>
              <Text className="text-black font-semibold text-center text-lg">
                {t("FixedAssets.currentAssets")}
              </Text>
              <View className="border-t-[2px] border-black" />
            </TouchableOpacity>
          </View>
          <View className="w-1/2">
            <TouchableOpacity
              onPress={() => navigation.navigate("fixedDashboard")}
            >
              <Text className="text-black text-center font-semibold text-lg">
                {t("FixedAssets.fixedAssets")}
              </Text>
              <View className="border-t-[2px] border-[#D9D9D9]" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="space-y-4 p-4">
          {/* Farm */}
          <Text className="mt-4 text-sm">
            {t("CurrentAssets.Select Farm")} *
          </Text>
          <PickerTrigger
            label={
              farms.find((f) => f.id.toString() === selectedFarm)?.farmName ??
              ""
            }
            placeholder={t("FixedAssets.Select a farm")}
            onPress={() => openModal("farm")}
            error={fieldErrors.selectedFarm}
          />

          {/* Category */}
          <Text className="text-gray-600 mb-2">
            {t("CurrentAssets.selectcategory")} *
          </Text>
          <PickerTrigger
            label={
              selectedCategory ? t(`CurrentAssets.${selectedCategory}`) : ""
            }
            placeholder={t("CurrentAssets.selectcategory")}
            onPress={() => openModal("category")}
            error={fieldErrors.selectedCategory}
          />

          {selectedCategory === "Other consumables" ? (
            <>
              <Text className="text-gray-600 mt-4 mb-2">
                {t("CurrentAssets.asset")}
              </Text>
              <TextInput
                placeholder={t("CurrentAssets.enterasset")}
                value={selectedAsset}
                onChangeText={(text) => {
                  clearError("selectedAsset");
                  setSelectedAsset(preventLeadingSpace(text));
                }}
                className="bg-[#F4F4F4] p-2 rounded-3xl h-[50px] mt-2"
              />
              {shouldShowBrandField && (
                <>
                  <Text className="text-gray-600 mt-4 mb-2">
                    {t("CurrentAssets.brand")}
                  </Text>
                  <TextInput
                    placeholder={t("CurrentAssets.enterbrand")}
                    value={brand}
                    onChangeText={(text) => {
                      clearError("brand");
                      setBrand(preventLeadingSpace(text));
                    }}
                    className="bg-[#F4F4F4] p-2 rounded-3xl h-[50px] mt-2"
                  />
                </>
              )}
            </>
          ) : (
            <>
              <Text className="text-gray-600 mt-4 mb-2">
                {t("CurrentAssets.asset")} *
              </Text>
              <PickerTrigger
                label={selectedAsset ? t(`${selectedAsset}`) : ""}
                placeholder={t("CurrentAssets.selectasset")}
                onPress={() => openModal("asset")}
                error={fieldErrors.selectedAsset}
              />

              {selectedAsset === "Other" && (
                <>
                  <Text className="text-gray-600 mt-4 mb-2">
                    {t("CurrentAssets.mentionother")}
                  </Text>
                  <TextInput
                    placeholder={t("CurrentAssets.Other")}
                    value={customAsset}
                    onChangeText={(text) => {
                      clearError("selectedAsset");
                      setCustomAsset(preventLeadingSpace(text));
                    }}
                    className="bg-[#F4F4F4] p-2 rounded-3xl h-[50px] mt-2"
                  />
                  {shouldShowBrandField && (
                    <>
                      <Text className="text-gray-600 mt-4 mb-2">
                        {t("CurrentAssets.brand")}
                      </Text>
                      <TextInput
                        placeholder={t("CurrentAssets.selectbrand")}
                        value={brand}
                        onChangeText={(text) => {
                          clearError("brand");
                          setBrand(preventLeadingSpace(text));
                        }}
                        className="bg-[#F4F4F4] p-2 rounded-3xl h-[50px] mt-2"
                      />
                    </>
                  )}
                </>
              )}

              {selectedAsset !== "Other" && shouldShowBrandField && (
                <>
                  <Text className="text-gray-600 mt-4 mb-2">
                    {t("CurrentAssets.brand")} *
                  </Text>
                  <PickerTrigger
                    label={brand}
                    placeholder={t("CurrentAssets.selectbrand")}
                    onPress={() => openModal("brand")}
                    error={fieldErrors.brand}
                  />
                </>
              )}
            </>
          )}

          {/* Batch Number */}
          <View className="mb-1">
            <Text className="text-gray-600 mb-1">
              {t("CurrentAssets.batchnumber")} *
            </Text>
            <TextInput
              placeholder={t("CurrentAssets.batchnumber")}
              value={batchNum}
              onChangeText={handleBatchNumChange}
              className="bg-[#F4F4F4] p-2 pl-4 rounded-3xl h-[50px]"
              keyboardType="numeric"
            />
            {fieldErrors.batchNum ? (
              <Text className="text-red-500 text-xs mt-1 ml-2">
                {fieldErrors.batchNum}
              </Text>
            ) : null}
          </View>

          <View className="mb-1">
            <Text className="text-gray-600 mb-1">
              {t("CurrentAssets.unitvolume_weight")} *
            </Text>
            <View className="flex-row items-center justify-between">
              <TextInput
                placeholder={t("CurrentAssets.unitvolume_weight")}
                value={volume}
                onChangeText={handleVolumeChange}
                keyboardType="decimal-pad"
                className="flex-1 mr-2 py-2 p-4 bg-[#F4F4F4] h-[50px] rounded-full"
              />
              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  openModal("unit");
                }}
                className="bg-[#F4F4F4] rounded-[30px] h-[50px] w-28 flex-row items-center justify-between px-3"
              >
                <Text className="text-sm text-black">{unit}</Text>
                <AntDesign name="caret-down" size={14} color="#5e5d5d" />
              </TouchableOpacity>
            </View>
            {fieldErrors.volume ? (
              <Text className="text-red-500 text-xs mt-1 ml-2">
                {fieldErrors.volume}
              </Text>
            ) : null}
          </View>
          {/* Number of Units */}
          <View className="mb-1">
            <Text className="text-gray-600 mb-1">
              {t("CurrentAssets.numberofunits")} *
            </Text>
            <TextInput
              placeholder={t("CurrentAssets.numberofunits")}
              keyboardType="numeric"
              value={numberOfUnits}
              onChangeText={(text) =>
                handleNumOfUnitsChange(text.replace(/[^0-9]/g, ""))
              }
              className="bg-[#F4F4F4] p-2 pl-4 rounded-3xl h-[50px]"
            />
            {fieldErrors.numberOfUnits ? (
              <Text className="text-red-500 text-xs mt-1 ml-2">
                {fieldErrors.numberOfUnits}
              </Text>
            ) : null}
          </View>

          <View className="mb-1">
            <Text className="text-gray-600 mb-1">
              {t("CurrentAssets.unitprice")} *
            </Text>
            <TextInput
              placeholder={t("CurrentAssets.unitprice")}
              keyboardType="decimal-pad"
              value={unitPrice}
              onChangeText={handleUnitPriceChange}
              className="bg-[#F4F4F4] p-2 pl-4 rounded-3xl h-[50px]"
            />
            {fieldErrors.unitPrice ? (
              <Text className="text-red-500 text-xs mt-1 ml-2">
                {fieldErrors.unitPrice}
              </Text>
            ) : null}
          </View>

          {/* Total Price  */}
          <Text className="text-gray-600">{t("CurrentAssets.totalprice")}</Text>
          <TextInput
            placeholder={t("CurrentAssets.totalprice")}
            value={
              totalPrice
                ? parseFloat(totalPrice).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : ""
            }
            editable={false}
            className="bg-[#F4F4F4] p-2 pl-4 rounded-3xl h-[50px]"
          />

          {/* Purchase Date */}
          {/* Purchase Date */}
          <View className="mb-1">
            <Text className="text-gray-600 mb-1">
              {t("CurrentAssets.purchasedate")} *
            </Text>
            <TouchableOpacity
              onPress={() => {
                clearError("purchaseDate");
                setShowPurchaseDatePicker((p) => !p);
              }}
              className="bg-[#F4F4F4] p-2 pl-4 pr-4 rounded-[30px] h-[50px] justify-center flex-row items-center"
            >
              <Text
                className={`flex-1 ${!purchaseDate ? "text-[#6B7280]" : "text-black"}`}
              >
                {purchaseDate || t("CurrentAssets.purchasedate")}
              </Text>
              <EvilIcons name="calendar" size={28} color="#5e5d5d" />
            </TouchableOpacity>
            {fieldErrors.purchaseDate ? (
              <Text className="text-red-500 text-xs mt-1 ml-2">
                {fieldErrors.purchaseDate}
              </Text>
            ) : null}

            {showPurchaseDatePicker &&
              (Platform.OS === "ios" ? (
                <View className="justify-center items-center z-50 bg-[#F4F4F4] rounded-lg">
                  <DateTimePicker
                    value={purchaseDate ? new Date(purchaseDate) : new Date()}
                    mode="date"
                    display="inline"
                    style={{ width: 320, height: 260, padding: 4 }}
                    maximumDate={new Date()}
                    onChange={(e, d) => handleDateChange(e, d, "purchase")}
                  />
                </View>
              ) : (
                <DateTimePicker
                  value={purchaseDate ? new Date(purchaseDate) : new Date()}
                  mode="date"
                  display="default"
                  maximumDate={new Date()}
                  onChange={(e, d) => handleDateChange(e, d, "purchase")}
                />
              ))}
          </View>

          {/* Expire Date */}
          <View className="mb-1">
            <Text className="text-gray-600 mb-1">
              {t("CurrentAssets.expiredate")} *
            </Text>
            <TouchableOpacity
              onPress={() => {
                clearError("expireDate");
                setShowExpireDatePicker((p) => !p);
              }}
              className="bg-[#F4F4F4] p-2 pl-4 pr-4 rounded-[30px] h-[50px] justify-center flex-row items-center"
            >
              <Text
                className={`flex-1 ${!expireDate ? "text-[#6B7280]" : "text-black"}`}
              >
                {expireDate || t("CurrentAssets.expiredate")}
              </Text>
              <EvilIcons name="calendar" size={28} color="#5e5d5d" />
            </TouchableOpacity>
            {fieldErrors.expireDate ? (
              <Text className="text-red-500 text-xs mt-1 ml-2">
                {fieldErrors.expireDate}
              </Text>
            ) : null}

            {showExpireDatePicker &&
              (Platform.OS === "ios" ? (
                <View className="justify-center items-center z-50 bg-gray-100 rounded-lg">
                  <DateTimePicker
                    value={expireDate ? new Date(expireDate) : new Date()}
                    mode="date"
                    display="inline"
                    style={{ width: 320, height: 260, padding: 4 }}
                    minimumDate={
                      purchaseDate
                        ? new Date(new Date(purchaseDate).getTime() + 86400000)
                        : new Date()
                    }
                    maximumDate={getMaximumDate()}
                    onChange={(e, d) => handleDateChange(e, d, "expire")}
                  />
                </View>
              ) : (
                <DateTimePicker
                  value={expireDate ? new Date(expireDate) : new Date()}
                  mode="date"
                  minimumDate={
                    purchaseDate
                      ? new Date(new Date(purchaseDate).getTime() + 86400000)
                      : new Date()
                  }
                  maximumDate={getMaximumDate()}
                  display="default"
                  onChange={(e, d) => handleDateChange(e, d, "expire")}
                />
              ))}
          </View>

          {/* Warranty  */}
          <Text className="text-gray-600">
            {t("CurrentAssets.warrentyinmonths")}
          </Text>
          <TextInput
            placeholder={t("CurrentAssets.warrentyinmonths")}
            value={warranty}
            keyboardType="numeric"
            className="bg-[#F4F4F4] p-2 pl-4 rounded-3xl h-[50px]"
            editable={false}
          />

          {/* Status  */}
          <Text className="text-gray-600">{t("CurrentAssets.status")}</Text>
          <View className="bg-[#F4F4F4] rounded-3xl h-[50px] p-3 items-center justify-center">
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

          {/* Submit */}
          <TouchableOpacity
            onPress={handleAddAsset}
            className="bg-[#353535] rounded-3xl h-[50px] p-3 mt-4 mb-16"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 4.65,
              elevation: 8,
            }}
          >
            <Text className="text-white text-center">
              {t("CurrentAssets.AddAsset")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* GlobalSearchModals */}
      <GlobalSearchModal
        visible={modals.farm}
        onClose={() => closeModal("farm")}
        title={t("CurrentAssets.Select Farm")}
        data={farmItems}
        selectedItems={selectedFarm ? [selectedFarm] : []}
        onSelect={(items) => {
          setSelectedFarm(items[0] ?? "");
          clearError("selectedFarm");
        }}
        searchPlaceholder={t("Signup.TypeSomething")}
      />

      <GlobalSearchModal
        visible={modals.category}
        onClose={() => closeModal("category")}
        title={t("CurrentAssets.selectcategory")}
        data={categoryItems}
        selectedItems={selectedCategory ? [selectedCategory] : []}
        onSelect={(items) => {
          const val = items[0] ?? "";
          handleCategoryChange(val);
          clearError("selectedCategory");
        }}
        searchPlaceholder={t("Signup.TypeSomething")}
      />

      <GlobalSearchModal
        visible={modals.asset}
        onClose={() => closeModal("asset")}
        title={t("CurrentAssets.asset")}
        data={assetItems}
        selectedItems={selectedAsset ? [selectedAsset] : []}
        onSelect={(items) => {
          const val = items[0] ?? "";
          handleAssetChange(val);
          clearError("selectedAsset");
        }}
        searchPlaceholder={t("Signup.TypeSomething")}
      />

      <GlobalSearchModal
        visible={modals.brand}
        onClose={() => closeModal("brand")}
        title={t("CurrentAssets.brand")}
        data={brandItems}
        selectedItems={brand ? [brand] : []}
        onSelect={(items) => {
          setBrand(items[0] ?? "");
          clearError("brand");
        }}
        searchPlaceholder={t("Signup.TypeSomething")}
      />

      <GlobalSearchModal
        visible={modals.unit}
        onClose={() => closeModal("unit")}
        title={t("CurrentAssets.unitvolume_weight")}
        data={UNIT_OPTIONS}
        selectedItems={[unit]}
        onSelect={(items) => setUnit(items[0] ?? "ml")}
        showSearch={false}
      />
    </KeyboardAvoidingView>
  );
};

export default AddAssetScreen;
