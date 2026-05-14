import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  BackHandler,
  Platform,
  StatusBar,
  Keyboard,
} from "react-native";
import axios from "axios";
import { StackNavigationProp } from "@react-navigation/stack";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { environment } from "@/environment/environment";
import Icon from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import type { RootState } from "@/services/reducxStore";
import CustomHeader from "../../common/CustomHeader";
import GlobalSearchModal from "../../common/GlobalSearchModal";
import { RootStackParamList } from "../../types/types";
import LoadingPage from "@/component/common/LoadingPage";

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
  const { t } = useTranslation();
  const route = useRoute();
  const { farmId, farmName } = route.params as RouteParams;
  const user = useSelector(
    (state: RootState) => state.user.userData,
  ) as UserData | null;

  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("");
  const [assets, setAssets] = useState<any[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [brand, setBrand] = useState("");
  const [unit, setUnit] = useState("ml");
  const [batchNum, setBatchNum] = useState("");
  const [volume, setVolume] = useState("");
  const [numberOfUnits, setNumberOfUnits] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [expireDate, setExpireDate] = useState("");
  const [warranty, setWarranty] = useState("");
  const [status, setStatus] = useState("");
  const [customAsset, setCustomAsset] = useState("");
  const [existingAssets, setExistingAssets] = useState<any[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [showPurchaseDatePicker, setShowPurchaseDatePicker] = useState(false);
  const [showExpireDatePicker, setShowExpireDatePicker] = useState(false);

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [assetModalVisible, setAssetModalVisible] = useState(false);
  const [brandModalVisible, setBrandModalVisible] = useState(false);
  const [unitModalVisible, setUnitModalVisible] = useState(false);

  const statusMapping: Record<string, string> = {
    [t("CurrentAssets.Expired")]: "Expired",
    [t("CurrentAssets.Valid")]: "Still valid",
  };

  const unitItems = [
    { label: t("CurrentAssets.ml"), value: "ml" },
    { label: t("CurrentAssets.kg"), value: "kg" },
    { label: t("CurrentAssets.l"), value: "l" },
  ];

  const shouldShowBrandField = selectedCategory !== "Livestock for sale";

  const scrollViewRef = useRef<ScrollView>(null);

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
    setStatus("");
    setCustomAsset("");
    setAssets([]);
    setErrors({});
  };

  useEffect(() => {
    const backAction = () => {
      navigation.navigate("Main", {
        screen: "FarmCurrectAssets",
        params: { farmId, farmName },
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
      const data = require("@/assets/jsons/current-asset/current-asset.json");
      setCategories(Object.keys(data));
    } catch {
      Alert.alert(t("Main.Error"), t("Main.SomethingWentWrongPleaseTryAgainlater"), [
        { text: t("Main.OK") },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", resetForm);
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (numberOfUnits && unitPrice) {
      const total =
        parseFloat(numberOfUnits) * parseFloat(unitPrice.replace(/,/g, ""));
      setTotalPrice(total.toFixed(2));
    }
  }, [numberOfUnits, unitPrice]);

  const fetchExistingAssets = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;
      const response = await axios.get(
        `${environment.API_BASE_URL}api/farm/get-currectasset-alreadyHave/${farmId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.data.status === "success") {
        setExistingAssets(response.data.currentAssetsByCategory);
      }
    } catch {
      console.error("Error");
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchExistingAssets();

      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });
    }, [farmId]),
  );

  const checkDuplicate = (
    category: string,
    asset: string,
    b: string,
    batch: string,
  ): boolean => {
    return existingAssets.some(
      (item) =>
        item.category === category &&
        item.asset === asset &&
        item.brand === b &&
        item.batchNum.toString() === batch.toString(),
    );
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const assetsJson = require("@/assets/jsons/current-asset/current-asset.json");
    setAssets(assetsJson[category] || []);
    setSelectedAsset("");
    setBrand("");
    setBrands([]);
    setErrors((prev) => ({ ...prev, selectedCategory: "" }));
  };

  const handleAssetChange = (asset: string) => {
    setSelectedAsset(asset);
    const selected = assets.find((a) => a.asset === asset);
    if (selected) {
      setBrands(selected.brands || []);
      setBrand("");
    }
  };

  const calculateWarranty = (purchase: string, expire: string) => {
    const diff = new Date(expire).getTime() - new Date(purchase).getTime();
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    setWarranty(months > 0 ? months.toString() : "0");
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
      if (purchaseDate && new Date(dateString) < new Date(purchaseDate)) {
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

  const preventLeadingSpace = (text: string): string =>
    text.replace(/^\s+/, "");

  const clearError = (key: string) =>
    setErrors((prev) => ({ ...prev, [key]: "" }));

  const handleBatchNumChange = (text: string) => {
    const cleaned = preventLeadingSpace(text.replace(/[-.*#]/g, ""));
    const num = parseFloat(cleaned);
    if (cleaned === "" || cleaned === "." || num >= 0) setBatchNum(cleaned);
    clearError("batchNum");
  };

  const handleVolumeChange = (text: string) => {
    const sanitized = text.replace(/[^0-9.]/g, "");
    const parts = sanitized.split(".");
    if (parts.length > 2) return;
    if (parts[1] !== undefined && parts[1].length > 2) return;
    setVolume(sanitized);
    clearError("volume");
  };

  const handleNumberOfUnitsChange = (text: string) => {
    setNumberOfUnits(text.replace(/[^0-9]/g, ""));
    clearError("numberOfUnits");
  };

  const handleUnitPriceChange = (text: string) => {
    const sanitized = text.replace(/[^0-9.]/g, "");
    const parts = sanitized.split(".");
    if (parts.length > 2) return;
    if (parts[1] !== undefined && parts[1].length > 2) return;
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const formatted = parts.length === 2 ? `${intPart}.${parts[1]}` : intPart;
    setUnitPrice(formatted);
    clearError("unitPrice");
  };

  const getMaximumDate = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 100);
    return d;
  };

  const validateAndSubmit = async () => {
    const assetToCheck =
      selectedAsset === "Other" ? customAsset : selectedAsset;
    const brandToCheck = selectedCategory === "Livestock for sale" ? "" : brand;

    if (status === t("CurrentAssets.Expired")) {
      Alert.alert(
        t("CurrentAssets.sorry"),
        t("CurrentAssets.CannotAddAnAssetThatHasAlreadyExpired"),
        [{ text: t("Main.OK") }],
      );
      return;
    }

    if (
      selectedCategory &&
      assetToCheck &&
      (selectedCategory === "Livestock for sale" || brandToCheck) &&
      checkDuplicate(selectedCategory, assetToCheck, brandToCheck, batchNum)
    ) {
      Alert.alert(
        t("CurrentAssets.sorry"),
        t("CurrentAssets.ThisExactAssetAlreadyExists"),
        [{ text: t("Main.OK") }],
      );
      return;
    }

    const newErrors: { [key: string]: string } = {};

    if (!selectedCategory)
      newErrors.selectedCategory = `${t("CurrentAssets.Selectcategory")} is required`;
    if (!selectedAsset)
      newErrors.selectedAsset = `${t("CurrentAssets.SelectAsset")} is required`;
    if (selectedAsset === "Other" && !customAsset)
      newErrors.customAsset = `${t("CurrentAssets.MentionOther")} is required`;
    if (
      shouldShowBrandField &&
      selectedCategory !== "Other consumables" &&
      selectedAsset !== "Other" &&
      !brand
    )
      newErrors.brand = `${t("CurrentAssets.Brand")} is required`;
    if (!batchNum)
      newErrors.batchNum = `${t("CurrentAssets.BatchNumber")} is required`;
    else if (parseFloat(batchNum) < 0)
      newErrors.batchNum = t("CurrentAssets.BatchNumberCannotBeNegative");
    if (!volume)
      newErrors.volume = `${t("CurrentAssets.UnitVolumeWeight")} is required`;
    else if (parseFloat(volume) <= 0)
      newErrors.volume = t("CurrentAssets.VolumeWeightCannotBe0OrNegative");
    if (!numberOfUnits)
      newErrors.numberOfUnits = `${t("CurrentAssets.NumberOfUnits")} is required`;
    else if (parseFloat(numberOfUnits) <= 0)
      newErrors.numberOfUnits = t("CurrentAssets.NumberOfUnitsCannotBe0OrNegative");
    if (!unitPrice)
      newErrors.unitPrice = `${t("CurrentAssets.UnitPrice")} is required`;
    else if (parseFloat(unitPrice.replace(/,/g, "")) <= 0)
      newErrors.unitPrice = t("CurrentAssets.UnitPriceCannotBe0OrNegative");
    if (!purchaseDate)
      newErrors.purchaseDate = `${t("CurrentAssets.PurchaseDate")} is required`;
    if (!expireDate)
      newErrors.expireDate = `${t("CurrentAssets.ExpireDate")} is required`;
    if (!warranty)
      newErrors.warranty = `${t("CurrentAssets.WarrentyInMonths")} is required`;
    if (!status) newErrors.status = `${t("CurrentAssets.Status")} is required`;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert(t("Main.Error"), t("Main.SomethingWentWrongPleaseTryAgainlater"), [
          { text: t("Main.OK") },
        ]);
        return;
      }

      const cleanedUnitPrice = parseFloat(unitPrice.replace(/,/g, ""));
      const cleanedUnits = parseFloat(numberOfUnits);

      const assetData: Record<string, string> = {
        category: selectedCategory,
        asset: assetToCheck,
        batchNum,
        volume,
        unit,
        numberOfUnits: cleanedUnits.toString(),
        unitPrice: cleanedUnitPrice.toString(),
        totalPrice: (cleanedUnitPrice * cleanedUnits).toFixed(2),
        purchaseDate,
        expireDate,
        warranty,
        status: statusMapping[status] || "Still valid",
      };

      if (selectedCategory !== "Livestock for sale") {
        assetData.brand = brand;
      }

      await axios.post(
        `${environment.API_BASE_URL}api/farm/currentAsset/${farmId}`,
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
      navigation.navigate("Main", {
        screen: "FarmCurrectAssets",
        params: { farmId, farmName },
      } as any);
    } catch (error: any) {
      if (error?.response?.status === 409) {
        Alert.alert(
          t("CurrentAssets.sorry"),
          t("CurrentAssets.ThisExactAssetAlreadyExists"),
          [{ text: t("Main.OK") }],
        );
        return;
      }

      Alert.alert(t("Main.Error"), t("Main.SomethingWentWrongPleaseTryAgainlater"), [
        { text: t("Main.OK") },
      ]);
    }
  };

  const ErrorText = ({ field }: { field: string }) =>
    errors[field] ? (
      <Text className="text-red-500 text-xs mt-1 ml-2">{errors[field]}</Text>
    ) : null;

  const PickerTrigger = ({
    value,
    placeholder,
    onPress,
    disabled = false,
  }: {
    value: string;
    placeholder: string;
    onPress: () => void;
    disabled?: boolean;
  }) => (
    <TouchableOpacity
      onPress={() => {
        Keyboard.dismiss();
        onPress();
      }}
      disabled={disabled}
      className="bg-[#F4F4F4] rounded-3xl h-[50px] flex-row items-center justify-between px-4"
      style={{ height: 50 }}
      activeOpacity={0.7}
    >
      <Text
        className={value ? "text-gray-800 text-sm" : "text-gray-500 text-sm"}
      >
        {value || placeholder}
      </Text>
      <AntDesign name="caret-down" size={14} color="#5e5d5d" />
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingPage fullScreen />;
  }

  const categoryItems = [
    ...categories.map((cat) => ({
      label: t(`CurrentAssets.${cat}`),
      value: cat,
    })),
    { label: t("CurrentAssets.OtherConsumables"), value: "Other consumables" },
  ];

  const assetItems = [
    ...assets.map((a) => ({ label: t(`${a.asset}`), value: a.asset })),
    { label: t("CurrentAssets.Other"), value: "Other" },
  ];

  const brandItems = brands.map((b) => ({ label: b, value: b }));

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
          title={farmName}
          navigation={navigation}
          onBackPress={() =>
            navigation.navigate("Main", {
              screen: "FarmCurrectAssets",
              params: { farmId, farmName },
            } as any)
          }
        />

        <View className="gap-4 p-4">
          {user?.role !== "Supervisor" && (
            <View className="flex-row mt-[-8%] justify-center">
              <View className="w-1/2">
                <TouchableOpacity>
                  <Text className="text-black text-center font-semibold text-lg">
                    {t("CurrentAssets.CurrentAssets")}
                  </Text>
                  <View className="border-t-[2px] border-black" />
                </TouchableOpacity>
              </View>
              <View className="w-1/2">
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("FarmFixDashBoard", {
                      farmId,
                      farmName,
                    })
                  }
                >
                  <Text className="text-black text-center font-semibold text-lg">
                    {t("CurrentAssets.FixedAssets")}
                  </Text>
                  <View className="border-t-[2px] border-[#D9D9D9]" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View className={user?.role === "Supervisor" ? "-mt-8" : ""}>
            <Text className="text-gray-600 mb-2">
              {t("CurrentAssets.Selectcategory")} *
            </Text>
            <PickerTrigger
              value={
                selectedCategory ? t(`CurrentAssets.${selectedCategory}`) : ""
              }
              placeholder={t("CurrentAssets.Selectcategory")}
              onPress={() => setCategoryModalVisible(true)}
            />
            <ErrorText field="selectedCategory" />
            <ErrorText field="duplicate" />

            <GlobalSearchModal
              visible={categoryModalVisible}
              onClose={() => setCategoryModalVisible(false)}
              title={t("CurrentAssets.Selectcategory")}
              data={categoryItems}
              selectedItems={selectedCategory ? [selectedCategory] : []}
              onSelect={(items) => {
                const val = items[0] ?? "";
                handleCategoryChange(val);
                clearError("selectedCategory");
              }}
              searchPlaceholder={t("Main.Search...")}
              showSearch={true}
              multiSelect={false}
            />
          </View>

          {selectedCategory === "Other consumables" ? (
            <>
              <Text className="text-gray-600 mt-4 mb-2">
                {t("CurrentAssets.Asset")}
              </Text>
              <TextInput
                placeholder={t("CurrentAssets.EnterAsset")}
                value={selectedAsset}
                onChangeText={(text) => {
                  clearError("selectedAsset");
                  setSelectedAsset(preventLeadingSpace(text));
                }}
                className="bg-[#F4F4F4] p-2 rounded-3xl h-[50px] mt-2"
              />
              <ErrorText field="selectedAsset" />

              {shouldShowBrandField && (
                <>
                  <Text className="text-gray-600 mt-4 mb-2">
                    {t("CurrentAssets.Brand")}
                  </Text>
                  <TextInput
                    placeholder={t("CurrentAssets.EnterBrand")}
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
                {t("CurrentAssets.Asset")} *
              </Text>
              <PickerTrigger
                value={selectedAsset ? t(`${selectedAsset}`) : ""}
                placeholder={t("CurrentAssets.SelectAsset")}
                onPress={() => setAssetModalVisible(true)}
                disabled={!selectedCategory}
              />
              <ErrorText field="selectedAsset" />

              <GlobalSearchModal
                visible={assetModalVisible}
                onClose={() => setAssetModalVisible(false)}
                title={t("CurrentAssets.Asset")}
                data={assetItems}
                selectedItems={selectedAsset ? [selectedAsset] : []}
                onSelect={(items) => {
                  const val = items[0] ?? "";
                  handleAssetChange(val);
                  clearError("selectedAsset");
                }}
                searchPlaceholder={t("Main.Search...")}
                showSearch={true}
                multiSelect={false}
              />

              {selectedAsset === "Other" && (
                <>
                  <Text className="text-gray-600 mt-4 mb-2">
                    {t("CurrentAssets.MentionOther")}
                  </Text>
                  <TextInput
                    placeholder={t("CurrentAssets.Other")}
                    value={customAsset}
                    onChangeText={(text) => {
                      clearError("customAsset");
                      setCustomAsset(preventLeadingSpace(text));
                    }}
                    className="bg-[#F4F4F4] p-2 rounded-3xl h-[50px] mt-2"
                  />
                  <ErrorText field="customAsset" />

                  {shouldShowBrandField && (
                    <>
                      <Text className="text-gray-600 mt-4 mb-2">
                        {t("CurrentAssets.Brand")}
                      </Text>
                      <TextInput
                        placeholder={t("CurrentAssets.SelectBrand")}
                        value={brand}
                        onChangeText={(text) => {
                          clearError("brand");
                          setBrand(preventLeadingSpace(text));
                        }}
                        className="bg-[#F4F4F4] p-2 rounded-3xl h-[50px] mt-2"
                      />
                      <ErrorText field="brand" />
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
                  {t("CurrentAssets.Brand")} *
                </Text>
                <PickerTrigger
                  value={brand}
                  placeholder={t("CurrentAssets.SelectBrand")}
                  onPress={() => setBrandModalVisible(true)}
                  disabled={!selectedAsset}
                />
                <ErrorText field="brand" />

                <GlobalSearchModal
                  visible={brandModalVisible}
                  onClose={() => setBrandModalVisible(false)}
                  title={t("CurrentAssets.Brand")}
                  data={brandItems}
                  selectedItems={brand ? [brand] : []}
                  onSelect={(items) => {
                    setBrand(items[0] ?? "");
                    clearError("brand");
                  }}
                  searchPlaceholder={t("Main.Search...")}
                  showSearch={true}
                  multiSelect={false}
                />
              </>
            )}

          <Text className="text-gray-600">
            {t("CurrentAssets.BatchNumber")} *
          </Text>
          <TextInput
            placeholder={t("CurrentAssets.BatchNumber")}
            value={batchNum}
            onChangeText={handleBatchNumChange}
            className="bg-[#F4F4F4] p-2 pl-4 rounded-3xl h-[50px]"
            keyboardType="numeric"
          />
          <ErrorText field="batchNum" />

          <Text className="text-gray-600">
            {t("CurrentAssets.UnitVolumeWeight")} *
          </Text>
          <View className="flex-row items-center justify-between">
            <TextInput
              placeholder={t("CurrentAssets.UnitVolumeWeight")}
              value={volume}
              onChangeText={handleVolumeChange}
              keyboardType="decimal-pad"
              className="flex-1 mr-2 h-[50px] p-4 bg-[#F4F4F4] rounded-3xl"
            />
            <View className="rounded-3xl h-[50px] w-32">
              <PickerTrigger
                value={unit}
                placeholder="unit"
                onPress={() => setUnitModalVisible(true)}
              />
              <GlobalSearchModal
                visible={unitModalVisible}
                onClose={() => setUnitModalVisible(false)}
                title={t("CurrentAssets.UnitVolumeWeight")}
                data={unitItems}
                selectedItems={[unit]}
                onSelect={(items) => setUnit(items[0] ?? "ml")}
                searchPlaceholder=""
                showSearch={false}
                multiSelect={false}
              />
            </View>
          </View>
          <ErrorText field="volume" />

          <Text className="text-gray-600">
            {t("CurrentAssets.NumberOfUnits")} *
          </Text>
          <TextInput
            placeholder={t("CurrentAssets.NumberOfUnits")}
            keyboardType="numeric"
            value={numberOfUnits}
            onChangeText={handleNumberOfUnitsChange}
            className="bg-[#F4F4F4] p-2 pl-4 rounded-3xl h-[50px]"
          />
          <ErrorText field="numberOfUnits" />

          <Text className="text-gray-600">
            {t("CurrentAssets.UnitPrice")} *
          </Text>
          <TextInput
            placeholder={t("CurrentAssets.UnitPrice")}
            keyboardType="decimal-pad"
            value={unitPrice}
            onChangeText={handleUnitPriceChange}
            className="bg-[#F4F4F4] p-2 pl-4 rounded-3xl h-[50px]"
          />
          <ErrorText field="unitPrice" />

          <Text className="text-gray-600">{t("CurrentAssets.TotalPrice")}</Text>
          <TextInput
            placeholder={t("CurrentAssets.TotalPrice")}
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

          <Text className="text-gray-600">
            {t("CurrentAssets.PurchaseDate")} *
          </Text>
          <TouchableOpacity
            onPress={() => {
              clearError("purchaseDate");
              setShowPurchaseDatePicker((prev) => !prev);
            }}
            className="bg-[#F4F4F4] p-2 pl-4 pr-4 rounded-[30px] h-[50px] justify-center flex-row items-center"
          >
            <Text className={`flex-1 ${!purchaseDate ? "text-gray-600" : ""}`}>
              {purchaseDate || t("CurrentAssets.PurchaseDate")}
            </Text>
            <Icon name="calendar-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
          <ErrorText field="purchaseDate" />
          {showPurchaseDatePicker &&
            (Platform.OS === "ios" ? (
              <View className="justify-center items-center z-50 bg-[#F4F4F4] rounded-lg">
                <DateTimePicker
                  value={purchaseDate ? new Date(purchaseDate) : new Date()}
                  mode="date"
                  display="inline"
                  style={{ width: 320, height: 260, padding: 4 }}
                  maximumDate={new Date()}
                  onChange={(event, date) => {
                    handleDateChange(event, date, "purchase");
                    if (date) clearError("purchaseDate");
                  }}
                />
              </View>
            ) : (
              <DateTimePicker
                value={purchaseDate ? new Date(purchaseDate) : new Date()}
                mode="date"
                display="default"
                maximumDate={new Date()}
                onChange={(event, date) => {
                  handleDateChange(event, date, "purchase");
                  if (date) clearError("purchaseDate");
                }}
              />
            ))}

          <Text className="text-gray-600">
            {t("CurrentAssets.ExpireDate")} *
          </Text>
          <TouchableOpacity
            onPress={() => {
              clearError("expireDate");
              setShowExpireDatePicker((prev) => !prev);
            }}
            className="bg-[#F4F4F4] p-2 pl-4 pr-4 rounded-[30px] h-[50px] justify-center flex-row items-center"
          >
            <Text className={`flex-1 ${!expireDate ? "text-gray-600" : ""}`}>
              {expireDate || t("CurrentAssets.ExpireDate")}
            </Text>
            <Icon name="calendar-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
          <ErrorText field="expireDate" />
          {showExpireDatePicker &&
            (Platform.OS === "ios" ? (
              <View className="justify-center items-center z-50 bg-[#F4F4F4] rounded-lg">
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
                  onChange={(event, date) => {
                    handleDateChange(event, date, "expire");
                    if (date) clearError("expireDate");
                  }}
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
                onChange={(event, date) => {
                  handleDateChange(event, date, "expire");
                  if (date) clearError("expireDate");
                }}
              />
            ))}

          <Text className="text-gray-600">
            {t("CurrentAssets.WarrentyInMonths")}
          </Text>
          <TextInput
            placeholder={t("CurrentAssets.WarrentyInMonths")}
            value={warranty}
            onChangeText={setWarranty}
            keyboardType="numeric"
            className="bg-[#F4F4F4] p-2 pl-4 rounded-3xl h-[50px]"
            editable={false}
          />

          <Text className="text-gray-600">{t("CurrentAssets.Status")}</Text>
          <View className="bg-[#F4F4F4] rounded-3xl h-[50px] p-3 items-center justify-center">
            {status ? (
              <Text
                className={`font-bold text-lg ${status === t("CurrentAssets.Expired")
                  ? "text-red-500"
                  : "text-green-500"
                  }`}
              >
                {status === t("CurrentAssets.Expired")
                  ? t("CurrentAssets.Expired")
                  : t("CurrentAssets.Valid")}
              </Text>
            ) : (
              <Text className="text-gray-400 text-lg">
                {t("CurrentAssets.Status")}
              </Text>
            )}
          </View>

          <TouchableOpacity
            onPress={validateAndSubmit}
            className="bg-[#353535] rounded-3xl h-[50px] p-3 mt-4 mb-16 justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.25,
              shadowRadius: 6,
              elevation: 8,
            }}
          >
            <Text className="text-white text-center text-lg">
              {t("CurrentAssets.AddAsset")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default FarmAddCurrentAsset;
