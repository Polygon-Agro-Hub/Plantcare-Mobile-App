import React, { useState, useEffect, useCallback } from "react";
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
import Icon from "react-native-vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import type { RootState } from "@/services/reducxStore";
import LottieView from "lottie-react-native";
import CustomHeader from "../../common/CustomHeader";
import GlobalSearchModal from "../../common/GlobalSearchModal";
import { RootStackParamList } from "../../types/types";

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
    [t("CurrentAssets.expired")]: "Expired",
    [t("CurrentAssets.stillvalide")]: "Still valid",
  };

  const unitItems = [
    { label: t("CurrentAssets.ml"), value: "ml" },
    { label: t("CurrentAssets.kg"), value: "kg" },
    { label: t("CurrentAssets.l"), value: "l" },
  ];

  const shouldShowBrandField = selectedCategory !== "Livestock for sale";

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
      const data = require("../../../assets/jsons/current-asset.json");
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
    }, [farmId]),
  );

  const checkDuplicate = (
    category: string,
    asset: string,
    b: string,
    batch: string,
    vol: string,
    u: string,
  ): boolean => {
    return existingAssets.some(
      (item) =>
        item.category === category &&
        item.asset === asset &&
        item.brand === b &&
        item.batchNum.toString() === batch.toString() &&
        item.unit === u &&
        parseFloat(item.unitVolume) === parseFloat(vol),
    );
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const assetsJson = require("../../../assets/jsons/current-asset.json");
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

  const handleBatchNumChange = (text: string) => {
    const cleaned = text.replace(/[-.*#]/g, "");
    const num = parseFloat(cleaned);
    if (cleaned === "" || cleaned === "." || num >= 0) setBatchNum(cleaned);
    setErrors((prev) => ({ ...prev, batchNum: "" }));
  };

  const handleVolumeChange = (text: string) => {
    setVolume(text.replace(/[^0-9]/g, ""));
    setErrors((prev) => ({ ...prev, volume: "" }));
  };

  const handleNumberOfUnitsChange = (text: string) => {
    setNumberOfUnits(text.replace(/[^0-9]/g, ""));
    setErrors((prev) => ({ ...prev, numberOfUnits: "" }));
  };

  const handleUnitPriceChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, "");
    setUnitPrice(digits.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
    setErrors((prev) => ({ ...prev, unitPrice: "" }));
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
    const newErrors: { [key: string]: string } = {};

    if (
      selectedCategory &&
      assetToCheck &&
      (selectedCategory === "Livestock for sale" || brandToCheck) &&
      checkDuplicate(
        selectedCategory,
        assetToCheck,
        brandToCheck,
        batchNum,
        volume,
        unit,
      )
    ) {
      newErrors.duplicate =
        "This exact asset already exists. You cannot add the same asset with the same brand, batch number, volume, and unit.";
    }

    if (status === t("CurrentAssets.expired"))
      newErrors.status = t("CurrentAssets.cannotAddExpiredAsset");
    if (!selectedCategory)
      newErrors.selectedCategory = t("CurrentAssets.selectcategory");
    if (!selectedAsset)
      newErrors.selectedAsset = t("CurrentAssets.selectasset");
    if (selectedAsset === "Other" && !customAsset)
      newErrors.customAsset = t("CurrentAssets.mentionother");
    if (
      shouldShowBrandField &&
      selectedCategory !== "Other consumables" &&
      selectedAsset !== "Other" &&
      !brand
    )
      newErrors.brand = t("CurrentAssets.selectbrand");
    if (!batchNum) newErrors.batchNum = t("CurrentAssets.batchnumber");
    else if (parseFloat(batchNum) < 0)
      newErrors.batchNum = t("CurrentAssets.batchNumberError");
    if (!volume) newErrors.volume = t("CurrentAssets.unitvolume_weight");
    else if (parseFloat(volume) <= 0)
      newErrors.volume = t("CurrentAssets.volumeZeroError");
    if (!numberOfUnits)
      newErrors.numberOfUnits = t("CurrentAssets.numberofunits");
    else if (parseFloat(numberOfUnits) <= 0)
      newErrors.numberOfUnits = t("CurrentAssets.unitsZeroError");
    if (!unitPrice) newErrors.unitPrice = t("CurrentAssets.unitprice");
    else if (parseFloat(unitPrice.replace(/,/g, "")) <= 0)
      newErrors.unitPrice = t("CurrentAssets.unitPriceZeroError");
    if (!purchaseDate) newErrors.purchaseDate = t("CurrentAssets.purchasedate");
    if (!expireDate) newErrors.expireDate = t("CurrentAssets.expiredate");
    if (!warranty) newErrors.warranty = t("CurrentAssets.warrentyinmonths");
    if (!status) newErrors.status = t("CurrentAssets.status");

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"), [
          { text: t("Farms.okButton") },
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
        t("CurrentAssets.success"),
        t("CurrentAssets.addAssetSuccess"),
        [{ text: t("Farms.okButton") }],
      );
      navigation.navigate("Main", {
        screen: "FarmCurrectAssets",
        params: { farmId, farmName },
      } as any);
    } catch {
      Alert.alert(t("Main.error"), t("Main.somethingWentWrong"), [
        { text: t("Farms.okButton") },
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
      className="bg-[#F4F4F4] rounded-[30px] flex-row items-center justify-between px-4"
      style={{ height: 50 }}
      activeOpacity={0.7}
    >
      <Text
        className={value ? "text-gray-800 text-sm" : "text-gray-500 text-sm"}
      >
        {value || placeholder}
      </Text>
      <AntDesign name="down" size={14} color="#9CA3AF" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <LottieView
          source={require("../../../assets/jsons/loader.json")}
          autoPlay
          loop
          style={{ width: 300, height: 300 }}
        />
      </View>
    );
  }

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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
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

        <View className="space-y-4 p-8">
          {user?.role !== "Supervisor" && (
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
                      farmId,
                      farmName,
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

          {/* Category */}
          <View className={user?.role === "Supervisor" ? "-mt-8" : ""}>
            <Text className="text-gray-600 mb-2">
              {t("CurrentAssets.selectcategory")} *
            </Text>
            <PickerTrigger
              value={
                selectedCategory ? t(`CurrentAssets.${selectedCategory}`) : ""
              }
              placeholder={t("CurrentAssets.selectcategory")}
              onPress={() => setCategoryModalVisible(true)}
            />
            <ErrorText field="selectedCategory" />
            <ErrorText field="duplicate" />

            <GlobalSearchModal
              visible={categoryModalVisible}
              onClose={() => setCategoryModalVisible(false)}
              title={t("CurrentAssets.selectcategory")}
              data={categoryItems}
              selectedItems={selectedCategory ? [selectedCategory] : []}
              onSelect={(items) => {
                const val = items[0] ?? "";
                handleCategoryChange(val);
              }}
              searchPlaceholder={t("SignupForum.TypeSomething")}
              showSearch={true}
              multiSelect={false}
            />
          </View>

          {/* Asset */}
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
              <ErrorText field="selectedAsset" />

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
                {t("CurrentAssets.asset")} *
              </Text>
              <PickerTrigger
                value={selectedAsset ? t(`${selectedAsset}`) : ""}
                placeholder={t("CurrentAssets.selectasset")}
                onPress={() => setAssetModalVisible(true)}
                disabled={!selectedCategory}
              />
              <ErrorText field="selectedAsset" />

              <GlobalSearchModal
                visible={assetModalVisible}
                onClose={() => setAssetModalVisible(false)}
                title={t("CurrentAssets.asset")}
                data={assetItems}
                selectedItems={selectedAsset ? [selectedAsset] : []}
                onSelect={(items) => {
                  const val = items[0] ?? "";
                  handleAssetChange(val);
                }}
                searchPlaceholder={t("SignupForum.TypeSomething")}
                showSearch={true}
                multiSelect={false}
              />

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
                  <ErrorText field="customAsset" />

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
                      <ErrorText field="brand" />
                    </>
                  )}
                </>
              )}
            </>
          )}

          {/* Brand Picker */}
          {selectedCategory !== "Other consumables" &&
            selectedAsset !== "Other" &&
            shouldShowBrandField && (
              <>
                <Text className="text-gray-600 mt-4 mb-2">
                  {t("CurrentAssets.brand")} *
                </Text>
                <PickerTrigger
                  value={brand}
                  placeholder={t("CurrentAssets.selectbrand")}
                  onPress={() => setBrandModalVisible(true)}
                  disabled={!selectedAsset}
                />
                <ErrorText field="brand" />

                <GlobalSearchModal
                  visible={brandModalVisible}
                  onClose={() => setBrandModalVisible(false)}
                  title={t("CurrentAssets.brand")}
                  data={brandItems}
                  selectedItems={brand ? [brand] : []}
                  onSelect={(items) => setBrand(items[0] ?? "")}
                  searchPlaceholder={t("SignupForum.TypeSomething")}
                  showSearch={true}
                  multiSelect={false}
                />
              </>
            )}

          {/* Batch Number */}
          <Text className="text-gray-600">
            {t("CurrentAssets.batchnumber")} *
          </Text>
          <TextInput
            placeholder={t("CurrentAssets.batchnumber")}
            value={batchNum}
            onChangeText={handleBatchNumChange}
            className="bg-[#F4F4F4] p-2 pl-4 rounded-[30px] h-[50px]"
            keyboardType="numeric"
          />
          <ErrorText field="batchNum" />

          {/* Volume + Unit */}
          <Text className="text-gray-600">
            {t("CurrentAssets.unitvolume_weight")} *
          </Text>
          <View className="flex-row items-center justify-between">
            <TextInput
              placeholder={t("CurrentAssets.unitvolume_weight")}
              value={volume}
              onChangeText={handleVolumeChange}
              keyboardType="decimal-pad"
              className="flex-1 mr-2 py-2 p-4 bg-[#F4F4F4] rounded-full"
            />
            <View className="rounded-full w-32">
              <PickerTrigger
                value={unit}
                placeholder="unit"
                onPress={() => setUnitModalVisible(true)}
              />
              <GlobalSearchModal
                visible={unitModalVisible}
                onClose={() => setUnitModalVisible(false)}
                title={t("CurrentAssets.unitvolume_weight")}
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

          {/* Number of Units */}
          <Text className="text-gray-600">
            {t("CurrentAssets.numberofunits")} *
          </Text>
          <TextInput
            placeholder={t("CurrentAssets.numberofunits")}
            keyboardType="numeric"
            value={numberOfUnits}
            onChangeText={handleNumberOfUnitsChange}
            className="bg-[#F4F4F4] p-2 pl-4 rounded-[30px] h-[50px]"
          />
          <ErrorText field="numberOfUnits" />

          {/* Unit Price */}
          <Text className="text-gray-600">
            {t("CurrentAssets.unitprice")} *
          </Text>
          <TextInput
            placeholder={t("CurrentAssets.unitprice")}
            keyboardType="numeric"
            value={unitPrice}
            onChangeText={handleUnitPriceChange}
            className="bg-[#F4F4F4] p-2 pl-4 rounded-[30px] h-[50px]"
          />
          <ErrorText field="unitPrice" />

          {/* Total Price */}
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
            className="bg-[#F4F4F4] p-2 pl-4 rounded-[30px] h-[50px]"
          />

          {/* Purchase Date */}
          <Text className="text-gray-600">
            {t("CurrentAssets.purchasedate")} *
          </Text>
          <TouchableOpacity
            onPress={() => setShowPurchaseDatePicker((prev) => !prev)}
            className="bg-[#F4F4F4] p-2 pl-4 pr-4 rounded-[30px] h-[50px] justify-center flex-row items-center"
          >
            <Text className={`flex-1 ${!purchaseDate ? "text-gray-600" : ""}`}>
              {purchaseDate || t("CurrentAssets.purchasedate")}
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
                    if (date)
                      setErrors((prev) => ({ ...prev, purchaseDate: "" }));
                  }}
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

          {/* Expire Date */}
          <Text className="text-gray-600">
            {t("CurrentAssets.expiredate")} *
          </Text>
          <TouchableOpacity
            onPress={() => setShowExpireDatePicker((prev) => !prev)}
            className="bg-[#F4F4F4] p-2 pl-4 pr-4 rounded-[30px] h-[50px] justify-center flex-row items-center"
          >
            <Text className={`flex-1 ${!expireDate ? "text-gray-600" : ""}`}>
              {expireDate || t("CurrentAssets.expiredate")}
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
                    ? new Date(new Date(purchaseDate).getTime() + 86400000)
                    : new Date()
                }
                maximumDate={getMaximumDate()}
                display="default"
                onChange={(event, date) => {
                  handleDateChange(event, date, "expire");
                  if (date) setErrors((prev) => ({ ...prev, expireDate: "" }));
                }}
              />
            ))}

          {/* Warranty */}
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

          {/* Status */}
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
          <ErrorText field="status" />

          {/* Submit */}
          <TouchableOpacity
            onPress={validateAndSubmit}
            className={`${
              status === t("CurrentAssets.expired")
                ? "bg-gray-400"
                : "bg-[#353535]"
            } rounded-[30px] p-3 mt-4 mb-16`}
            disabled={status === t("CurrentAssets.expired")}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.25,
              shadowRadius: 6,
              elevation: 8,
            }}
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

export default FarmAddCurrentAsset;
