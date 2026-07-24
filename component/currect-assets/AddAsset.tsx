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
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import type { RootState } from "@/services/reducxStore";
import { RootStackParamList } from "../types/types";
import GlobalSearchModal from "../../component/common/GlobalSearchModal";
import CustomHeader from "../common/CustomHeader";
import { MaterialIcons } from "@expo/vector-icons";
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

interface UserData {
  role: string;
}

const AddAssetScreen: React.FC<AddAssetProps> = ({ navigation }) => {
  const route = useRoute();
  const { farmId, farmName } = (route.params || {}) as { farmId?: number; farmName?: string };
  const user = useSelector(
    (state: RootState) => state.user.userData,
  ) as UserData | null;

  const scrollViewRef = useRef<ScrollView>(null);
  const { t, i18n } = useTranslation();
  const unitOptions = [
    { label: t("CurrentAssets.ml"), value: "ml" },
    { label: t("CurrentAssets.kg"), value: "kg" },
    { label: t("CurrentAssets.l"), value: "l" },
  ];

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
    [t("CurrentAssets.Expired")]: "Expired",
    [t("CurrentAssets.Valid")]: "Still valid",
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
        if (farmId) {
          navigation.navigate("Main", {
            screen: "CurrentAssert",
            params: { farmId, farmName },
          } as any);
        } else {
          navigation.navigate("CurrentAssert");
        }
        return true;
      },
    );
    return () => backHandler.remove();
  }, [navigation, farmId, farmName]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      resetForm();
      setExistingAssets([]);

      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });
    });
    return unsubscribe;
  }, [navigation]);



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
    }, [farmId]),
  );

  useEffect(() => {
    if (!farmId) {
      fetchFarmData();
    }
  }, [farmId]);

  const fetchExistingAssets = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;
      const url = farmId
        ? `${environment.API_BASE_URL}api/farm/get-currectasset-alreadyHave/${farmId}`
        : `${environment.API_BASE_URL}api/auth/get-currentasset-alreadyHave-byuser`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
    const assetsJson = require("@/assets/jsons/current-asset/current-asset.json");
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
          t("CurrentAssets.PurchaseDateMustNotBeInTheFuture"),
          [{ text: t("Main.OK") }],
        );
        return;
      }
      setPurchaseDate(dateString);
      setShowPurchaseDatePicker(false);

      if (expireDate && new Date(dateString) > new Date(expireDate)) {
        Alert.alert(
          t("CurrentAssets.sorry"),
          t("CurrentAssets.ExpirationDateMustBeAfterPurchaseDate"),
          [{ text: t("Main.OK") }],
        );
        setExpireDate("");
        setWarranty("");
        setStatus("");
      } else if (expireDate) {
        calculateWarranty(dateString, expireDate);
        setStatus(
          new Date(expireDate) < new Date()
            ? t("CurrentAssets.Expired")
            : t("CurrentAssets.Valid"),
        );
      }
    } else {
      if (new Date(dateString) < new Date(purchaseDate)) {
        Alert.alert(
          t("CurrentAssets.sorry"),
          t("CurrentAssets.ExpirationDateMustBeAfterPurchaseDate"),
          [{ text: t("Main.OK") }],
        );
        return;
      }
      setExpireDate(dateString);
      setShowExpireDatePicker(false);
      if (purchaseDate) {
        setStatus(
          new Date(dateString) < new Date()
            ? t("CurrentAssets.Expired")
            : t("CurrentAssets.Valid"),
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
        t("CurrentAssets.ThisExactAssetAlreadyExists"),
        [{ text: t("Main.OK") }],
      );
      return;
    }

    const errors = { ...INITIAL_ERRORS };
    let hasError = false;

    const requiredFields: Array<[any, keyof typeof INITIAL_ERRORS, string]> =
      [
        [
          farmId || selectedFarm,
          "selectedFarm",
          `${t("CurrentAssets.SelectFarm")} is required`,
        ],
        [
          selectedCategory,
          "selectedCategory",
          `${t("CurrentAssets.SelectCategory")} is required`,
        ],
        [
          selectedAsset,
          "selectedAsset",
          `${t("CurrentAssets.Asset")} is required`,
        ],
        [batchNum, "batchNum", `${t("CurrentAssets.BatchNumber")} is required`],
        [
          volume,
          "volume",
          `${t("CurrentAssets.UnitVolumeWeight")} is required`,
        ],
        [
          numberOfUnits,
          "numberOfUnits",
          `${t("CurrentAssets.NumberOfUnits")} is required`,
        ],
        [unitPrice, "unitPrice", `${t("CurrentAssets.UnitPrice")} is required`],
        [
          purchaseDate,
          "purchaseDate",
          `${t("CurrentAssets.PurchaseDate")} is required`,
        ],
        [
          expireDate,
          "expireDate",
          `${t("CurrentAssets.ExpireDate")} is required`,
        ],
        [
          warranty,
          "warranty",
          `${t("CurrentAssets.WarrentyInMonths")} is required`,
        ],
        [status, "status", `${t("CurrentAssets.Status")} is required`],
      ];

    requiredFields.forEach(([val, key, message]) => {
      if (!val) {
        errors[key] = message;
        hasError = true;
      }
    });

    if (isBrandRequired && !brand) {
      errors.brand = `${t("CurrentAssets.Brand")} is required`;
      hasError = true;
    }

    if (status === t("CurrentAssets.Expired")) {
      Alert.alert(
        t("CurrentAssets.sorry"),
        t("CurrentAssets.CannotAddAnAssetThatHasAlreadyExpired"),
        [{ text: t("Main.OK") }],
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
        Alert.alert(t("Main.Error"), t("Main.SomethingWentWrongPleaseTryAgainlater"), [
          { text: t("Main.OK") },
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
        farmId: farmId ? farmId.toString() : selectedFarm,
      };

      if (isBrandRequired) assetData.brand = brand;

      const url = farmId
        ? `${environment.API_BASE_URL}api/farm/currentAsset/${farmId}`
        : `${environment.API_BASE_URL}api/auth/currentAsset`;

      await axios.post(
        url,
        assetData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      Alert.alert(
        t("Main.Success"),
        t("CurrentAssets.AssetAddedSuccessfully"),
        [{ text: t("Main.OK") }],
      );
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
      if (farmId) {
        navigation.navigate("Main", {
          screen: "CurrentAssert",
          params: { farmId, farmName },
        } as any);
      } else {
        navigation.navigate("CurrentAssert");
      }
    } catch (error: any) {
      if (error?.response?.status === 409) {
        Alert.alert(
          t("CurrentAssets.sorry"),
          t(
            "CurrentAssets.ThisExactAssetAlreadyExists You cannot add the same asset with the same brand, batch number, volume, and unit.",
          ),
          [{ text: t("Main.OK") }],
        );
        scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
        return;
      }

      console.error("Error adding asset:", error);
      Alert.alert(t("Main.Error"), t("Main.SomethingWentWrongPleaseTryAgainlater"), [
        { text: t("Main.OK") },
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

  const categoryData = require("@/assets/jsons/current-asset/categories.json");
  const assetTranslationData = require("@/assets/jsons/current-asset/assets-translations.json");

  const getCategoryLabel = (val: string) => {
    const item = categoryData.find((c: any) => c.value === val);
    const lang = i18n.language ? (i18n.language.startsWith("si") ? "si" : i18n.language.startsWith("ta") ? "ta" : "en") : "en";
    return item ? (item.translations[lang] || item.translations["en"]) : val;
  };

  const getAssetLabel = (val: string) => {
    if (val === "Other") return t("CurrentAssets.Other");
    const item = assetTranslationData.find((a: any) => a.value === val);
    const lang = i18n.language ? (i18n.language.startsWith("si") ? "si" : i18n.language.startsWith("ta") ? "ta" : "en") : "en";
    return item ? (item.translations[lang] || item.translations["en"]) : val;
  };

  const categoryItems = categoryData.map((item: any) => ({
    label: getCategoryLabel(item.value),
    value: item.value,
  }));

  const assetItems = [
    ...assets.map((a) => ({ label: getAssetLabel(a.asset), value: a.asset })),
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
    <View className="mt-2 mb-2">
      <TouchableOpacity
        onPress={() => {
          Keyboard.dismiss();
          onPress();
        }}
        className="bg-[#F4F4F4] rounded-3xl h-[50px] flex-row items-center px-4 justify-between"
      >
        <Text
          className={label ? "text-black text-sm" : "text-[#6B7280] text-sm"}
        >
          {label || placeholder}
        </Text>
        <MaterialIcons
          name="arrow-drop-down"
          size={24}
          color="#666"
        />
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
        

        <CustomHeader
          title={farmId && farmName ? farmName : t("FixedAssets.MyAssets")}
          navigation={navigation}
          onBackPress={() => {
            if (farmId) {
              navigation.navigate("Main", {
                screen: "CurrentAssert",
                params: { farmId, farmName },
              } as any);
            } else {
              navigation.navigate("CurrentAssert");
            }
          }}
        />

        {/* Tab Bar */}
        {(!farmId || user?.role !== "Supervisor") && (
          <View className="flex-row mt-2 justify-center">
            <View className="w-1/2">
              <TouchableOpacity>
                <Text className="text-black font-semibold text-center text-lg">
                  {t("CurrentAssets.CurrentAssets")}
                </Text>
                <View className="border-t-[2px] border-black mt-2" />
              </TouchableOpacity>
            </View>
            <View className="w-1/2">
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate(
                    "fixedDashboard",
                    farmId ? { farmId, farmName } : undefined,
                  )
                }
              >
                <Text className="text-black text-center font-semibold text-lg">
                  {t("CurrentAssets.FixedAssets")}
                </Text>
                <View className="border-t-[2px] border-[#D9D9D9] mt-2" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View className="px-6 pt-4 pb-16">
          {/* Farm */}
          {!farmId && (
            <>
              <Text className="text-[#070707] text-sm mt-2">
                {t("CurrentAssets.SelectFarm")} *
              </Text>
              <PickerTrigger
                label={
                  farms.find((f) => f.id.toString() === selectedFarm)?.farmName ??
                  ""
                }
                placeholder={t("FixedAssets.SelectAFarm")}
                onPress={() => openModal("farm")}
                error={fieldErrors.selectedFarm}
              />
            </>
          )}

          {/* Category */}
          <Text className="text-[#070707] text-sm mt-2">
            {t("CurrentAssets.SelectCategory")} *
          </Text>
          <PickerTrigger
            label={
              selectedCategory ? getCategoryLabel(selectedCategory) : ""
            }
            placeholder={t("CurrentAssets.SelectCategory")}
            onPress={() => openModal("category")}
            error={fieldErrors.selectedCategory}
          />

          {selectedCategory === "Other consumables" ? (
            <>
              <Text className="text-[#070707] text-sm mt-2">
                {t("CurrentAssets.Asset")}
              </Text>
              <TextInput
                placeholder={t("CurrentAssets.EnterAsset")}
                placeholderTextColor="#585858"
                value={selectedAsset}
                onChangeText={(text) => {
                  clearError("selectedAsset");
                  setSelectedAsset(preventLeadingSpace(text));
                }}
                className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2"
              />
              {shouldShowBrandField && (
                <>
                  <Text className="text-[#070707] text-sm mt-2">
                    {t("CurrentAssets.Brand")}
                  </Text>
                  <TextInput
                    placeholder={t("CurrentAssets.EnterBrand")}
                    placeholderTextColor="#585858"
                    value={brand}
                    onChangeText={(text) => {
                      clearError("brand");
                      setBrand(preventLeadingSpace(text));
                    }}
                    className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2"
                  />
                </>
              )}
            </>
          ) : (
            <>
              <Text className="text-[#070707] text-sm mt-2">
                {t("CurrentAssets.Asset")} *
              </Text>
              <PickerTrigger
                label={selectedAsset ? getAssetLabel(selectedAsset) : ""}
                placeholder={t("CurrentAssets.SelectAsset")}
                onPress={() => openModal("asset")}
                error={fieldErrors.selectedAsset}
              />

              {selectedAsset === "Other" && (
                <>
                  <Text className="text-[#070707] text-sm mt-2">
                    {t("CurrentAssets.MentionOther")}
                  </Text>
                  <TextInput
                    placeholder={t("CurrentAssets.Other")}
                    placeholderTextColor="#585858"
                    value={customAsset}
                    onChangeText={(text) => {
                      clearError("selectedAsset");
                      setCustomAsset(preventLeadingSpace(text));
                    }}
                    className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2"
                  />
                  {shouldShowBrandField && (
                    <>
                      <Text className="text-[#070707] text-sm mt-2">
                        {t("CurrentAssets.Brand")}
                      </Text>
                      <TextInput
                        placeholder={t("CurrentAssets.SelectBrand")}
                        placeholderTextColor="#585858"
                        value={brand}
                        onChangeText={(text) => {
                          clearError("brand");
                          setBrand(preventLeadingSpace(text));
                        }}
                        className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2"
                      />
                    </>
                  )}
                </>
              )}

              {selectedAsset !== "Other" && shouldShowBrandField && (
                <>
                  <Text className="text-[#070707] text-sm mt-2">
                    {t("CurrentAssets.Brand")} *
                  </Text>
                  <PickerTrigger
                    label={brand}
                    placeholder={t("CurrentAssets.SelectBrand")}
                    onPress={() => openModal("brand")}
                    error={fieldErrors.brand}
                  />
                </>
              )}
            </>
          )}

          {/* Batch Number */}
          <View className="mt-2 mb-2">
            <Text className="text-[#070707] text-sm">
              {t("CurrentAssets.BatchNumber")} *
            </Text>
            <TextInput
              placeholder={t("CurrentAssets.BatchNumber")}
              placeholderTextColor="#585858"
              value={batchNum}
              onChangeText={handleBatchNumChange}
              className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2"
              keyboardType="numeric"
            />
            {fieldErrors.batchNum ? (
              <Text className="text-red-500 text-xs mt-1 ml-2">
                {fieldErrors.batchNum}
              </Text>
            ) : null}
          </View>

          <View className="mt-2 mb-2">
            <Text className="text-[#070707] text-sm">
              {t("CurrentAssets.UnitVolumeWeight")} *
            </Text>
            <View className="flex-row items-center justify-between mt-2">
              <TextInput
                placeholder={t("CurrentAssets.UnitVolumeWeight")}
                placeholderTextColor="#585858"
                value={volume}
                onChangeText={handleVolumeChange}
                keyboardType="decimal-pad"
                className="flex-1 mr-2 px-4 bg-[#F4F4F4] h-[50px] rounded-3xl"
              />
              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  openModal("unit");
                }}
                className="bg-[#F4F4F4] rounded-3xl h-[50px] w-28 flex-row items-center justify-between px-3"
              >
                <Text className="text-sm text-black">{t(`CurrentAssets.${unit}`, unit)}</Text>
                <MaterialIcons
                  name="arrow-drop-down"
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
            {fieldErrors.volume ? (
              <Text className="text-red-500 text-xs mt-1 ml-2">
                {fieldErrors.volume}
              </Text>
            ) : null}
          </View>
          {/* Number of Units */}
          <View className="mt-2 mb-2">
            <Text className="text-[#070707] text-sm">
              {t("CurrentAssets.NumberOfUnits")} *
            </Text>
            <TextInput
              placeholder={t("CurrentAssets.NumberOfUnits")}
              placeholderTextColor="#585858"
              keyboardType="numeric"
              value={numberOfUnits}
              onChangeText={(text) =>
                handleNumOfUnitsChange(text.replace(/[^0-9]/g, ""))
              }
              className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2"
            />
            {fieldErrors.numberOfUnits ? (
              <Text className="text-red-500 text-xs mt-1 ml-2">
                {fieldErrors.numberOfUnits}
              </Text>
            ) : null}
          </View>

          <View className="mt-2 mb-2">
            <Text className="text-[#070707] text-sm">
              {t("CurrentAssets.UnitPrice")} *
            </Text>
            <TextInput
              placeholder={t("CurrentAssets.UnitPrice")}
              placeholderTextColor="#585858"
              keyboardType="decimal-pad"
              value={unitPrice}
              onChangeText={handleUnitPriceChange}
              className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2"
            />
            {fieldErrors.unitPrice ? (
              <Text className="text-red-500 text-xs mt-1 ml-2">
                {fieldErrors.unitPrice}
              </Text>
            ) : null}
          </View>

          {/* Total Price  */}
          <View className="mt-2 mb-2">
            <Text className="text-[#070707] text-sm">{t("CurrentAssets.TotalPrice")}</Text>
            <TextInput
              placeholder={t("CurrentAssets.TotalPrice")}
              placeholderTextColor="#585858"
              value={
                totalPrice
                  ? parseFloat(totalPrice).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                  : ""
              }
              editable={false}
              className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 text-gray-500"
            />
          </View>

          {/* Purchase Date */}
          <View className="mt-2 mb-2">
            <Text className="text-[#070707] text-sm">
              {t("CurrentAssets.PurchaseDate")} *
            </Text>
            <TouchableOpacity
              onPress={() => {
                clearError("purchaseDate");
                setShowPurchaseDatePicker((p) => !p);
              }}
              className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] justify-center flex-row items-center mt-2"
            >
              <Text
                className={`flex-1 ${!purchaseDate ? "text-[#6B7280]" : "text-black"}`}
              >
                {purchaseDate || t("CurrentAssets.PurchaseDate")}
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
          <View className="mt-2 mb-2">
            <Text className="text-[#070707] text-sm">
              {t("CurrentAssets.ExpireDate")} *
            </Text>
            <TouchableOpacity
              onPress={() => {
                clearError("expireDate");
                setShowExpireDatePicker((p) => !p);
              }}
              className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] justify-center flex-row items-center mt-2"
            >
              <Text
                className={`flex-1 ${!expireDate ? "text-[#6B7280]" : "text-black"}`}
              >
                {expireDate || t("CurrentAssets.ExpireDate")}
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
          <View className="mt-2 mb-2">
            <Text className="text-[#070707] text-sm">
              {t("CurrentAssets.WarrentyInMonths")}
            </Text>
            <TextInput
              placeholder={t("CurrentAssets.WarrentyInMonths")}
              placeholderTextColor="#585858"
              value={warranty}
              keyboardType="numeric"
              className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 text-gray-500"
              editable={false}
            />
          </View>

          {/* Status  */}
          <View className="mt-2 mb-2">
            <Text className="text-[#070707] text-sm">{t("CurrentAssets.Status")}</Text>
            <View className="bg-[#F4F4F4] rounded-3xl h-[50px] justify-center items-center mt-2">
              {status ? (
                <Text
                  className={`font-bold ${status === t("CurrentAssets.Expired")
                    ? "text-red-500"
                    : "text-green-500"
                    }`}
                >
                  {status === t("CurrentAssets.Expired")
                    ? t("CurrentAssets.Expired")
                    : t("CurrentAssets.Valid")}
                </Text>
              ) : (
                <Text className="text-gray-400 text-lg">{t("CurrentAssets.Status")}</Text>
              )}
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleAddAsset}
            className="bg-[#353535] rounded-3xl h-[50px] justify-center items-center m-6"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 4.65,
              elevation: 8,
            }}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {t("CurrentAssets.AddAsset")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* GlobalSearchModals */}
      <GlobalSearchModal
        visible={modals.farm}
        onClose={() => closeModal("farm")}
        title={t("CurrentAssets.SelectFarm")}
        data={farmItems}
        selectedItems={selectedFarm ? [selectedFarm] : []}
        onSelect={(items) => {
          setSelectedFarm(items[0] ?? "");
          clearError("selectedFarm");
        }}
        searchPlaceholder={t("Main.Search...")}
      />

      <GlobalSearchModal
        visible={modals.category}
        onClose={() => closeModal("category")}
        title={t("CurrentAssets.SelectCategory")}
        data={categoryItems}
        selectedItems={selectedCategory ? [selectedCategory] : []}
        onSelect={(items) => {
          const val = items[0] ?? "";
          handleCategoryChange(val);
          clearError("selectedCategory");
        }}
        searchPlaceholder={t("Main.Search...")}
      />

      <GlobalSearchModal
        visible={modals.asset}
        onClose={() => closeModal("asset")}
        title={t("CurrentAssets.Asset")}
        data={assetItems}
        selectedItems={selectedAsset ? [selectedAsset] : []}
        onSelect={(items) => {
          const val = items[0] ?? "";
          handleAssetChange(val);
          clearError("selectedAsset");
        }}
        searchPlaceholder={t("Main.Search...")}
      />

      <GlobalSearchModal
        visible={modals.brand}
        onClose={() => closeModal("brand")}
        title={t("CurrentAssets.Brand")}
        data={brandItems}
        selectedItems={brand ? [brand] : []}
        onSelect={(items) => {
          setBrand(items[0] ?? "");
          clearError("brand");
        }}
        searchPlaceholder={t("Main.Search...")}
      />

      <GlobalSearchModal
        visible={modals.unit}
        onClose={() => closeModal("unit")}
        title={t("CurrentAssets.UnitVolumeWeight")}
        data={unitOptions}
        selectedItems={[unit]}
        onSelect={(items) => setUnit(items[0] ?? "ml")}
        showSearch={false}
      />
    </KeyboardAvoidingView>
  );
};

export default AddAssetScreen;
