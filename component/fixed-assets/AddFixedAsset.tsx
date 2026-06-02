import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  Keyboard,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { StatusBar, Platform } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/types";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";

import { useTranslation } from "react-i18next";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import type { RootState } from "@/services/reducxStore";
import GlobalSearchModal from "../../component/common/GlobalSearchModal";
import CustomHeader from "../common/CustomHeader";
import assetData from "@/assets/jsons/fixed-asset/fixed-assets.json";
import { MaterialIcons, EvilIcons } from "@expo/vector-icons";

type AddFixedAssetNavigationProp = StackNavigationProp<
  RootStackParamList,
  "AddFixedAsset"
>;

interface AddFixedAssetProps {
  navigation: AddFixedAssetNavigationProp;
}

interface UserData {
  role: string;
}

interface Farm {
  id: number;
  userId: number;
  farmName: string;
}

interface RawOption {
  labelKey: string;
  value: string;
}

const SelectorButton = ({
  label,
  placeholder,
  onPress,
  error,
}: {
  label: string | undefined;
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
      activeOpacity={0.7}
    >
      <Text
        className={`text-sm flex-1 ${label ? "text-black" : "text-[#6B7280]"}`}
        numberOfLines={1}
      >
        {label || placeholder}
      </Text>
      <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
    </TouchableOpacity>
    {error ? (
      <Text className="text-red-500 text-xs mt-1 ml-2">{error}</Text>
    ) : null}
  </View>
);

const AddFixedAsset: React.FC<AddFixedAssetProps> = ({ navigation }) => {
  const route = useRoute();
  const { farmId, farmName } = (route.params || {}) as { farmId?: number; farmName?: string };
  const user = useSelector(
    (state: RootState) => state.user.userData,
  ) as UserData | null;
  const { t, i18n } = useTranslation();

  const getCategoryLabel = (val: string) => {
    const item = assetData.categoryOptions.find((c: any) => c.value === val);
    const lang = i18n.language ? (i18n.language.startsWith("si") ? "si" : i18n.language.startsWith("ta") ? "ta" : "en") : "en";
    return item ? (item.translations[lang] || item.translations["en"]) : val;
  };

  const toOptions = (raw: RawOption[]) =>
    raw.map((item) => ({ label: t(item.labelKey), value: item.value }));

  const categoryOptions = assetData.categoryOptions.map((item: any) => ({
    label: getCategoryLabel(item.value),
    value: item.value,
  }));
  const ownershipCategories = toOptions(assetData.ownershipCategories);
  const landOwnershipOptions = toOptions(assetData.landOwnershipOptions);
  const generalConditionOptions = toOptions(assetData.generalConditionOptions);
  const buildingTypeOptions = toOptions(assetData.buildingTypeOptions);
  const Machineasset = toOptions(assetData.machineasset);
  const assetOptions = toOptions(assetData.assetOptions);
  const toolBrandOptions = toOptions(assetData.toolBrandOptions);

  const assetTypesForAssets: Record<
    string,
    { label: string; value: string }[]
  > = Object.fromEntries(
    Object.entries(assetData.assetTypesForAssets).map(([key, items]) => [
      key,
      toOptions(items as RawOption[]),
    ]),
  );

  const brandTypesForAssets: Record<
    string,
    { label: string; value: string }[]
  > = Object.fromEntries(
    Object.entries(assetData.brandTypesForAssets).map(([key, items]) => [
      key,
      toOptions(items as RawOption[]),
    ]),
  );

  const [ownership, setOwnership] = useState("");
  const [landownership, setLandOwnership] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [generalCondition, setGeneralCondition] = useState("");
  const [asset, setAsset] = useState("");
  const [brand, setBrand] = useState("");
  const [warranty, setWarranty] = useState("");
  const [showPurchasedDatePicker, setShowPurchasedDatePicker] = useState(false);
  const [showExpireDatePicker, setShowExpireDatePicker] = useState(false);
  const [purchasedDate, setPurchasedDate] = useState<Date | null>(null);
  const [expireDate, setExpireDate] = useState<Date | null>(null);
  const [extentha, setExtentha] = useState("");
  const [extentac, setExtentac] = useState("");
  const [extentp, setExtentp] = useState("");
  const [estimateValue, setEstimatedValue] = useState("");
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [showIssuedDatePicker, setShowIssuedDatePicker] = useState(false);
  const [issuedDate, setIssuedDate] = useState<Date | null>(null);
  const [lbissuedDate, setLbIssuedDate] = useState<Date | null>(null);
  const [showLbIssuedDatePicker, setShowLbIssuedDatePicker] = useState(false);

  const [assetname, setAssetname] = useState("");
  const [othertool, setOthertool] = useState("");
  const [toolbrand, setToolbrand] = useState("");
  const [floorArea, setFloorArea] = useState("");
  const [landFenced, setLandFenced] = useState("");
  const [perennialCrop, setPerennialCrop] = useState("");
  const [assetType, setAssetType] = useState("");
  const [mentionOther, setMentionOther] = useState("");
  const [numberOfUnits, setNumberOfUnits] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [durationYears, setDurationYears] = useState("");
  const [durationMonths, setDurationMonths] = useState("");
  const [leastAmountAnnually, setLeastAmountAnnually] = useState("");
  const [permitFeeAnnually, setPermitFeeAnnually] = useState("");
  const [paymentAnnually, setPaymentAnnually] = useState("");
  const [modalFarm, setModalFarm] = useState(false);
  const [modalCategory, setModalCategory] = useState(false);
  const [modalAsset, setModalAsset] = useState(false);
  const [modalAssetType, setModalAssetType] = useState(false);
  const [modalBrand, setModalBrand] = useState(false);
  const [modalLandOwnership, setModalLandOwnership] = useState(false);
  const [modalToolBrand, setModalToolBrand] = useState(false);
  const [modalType, setModalType] = useState(false);
  const [modalOwnership, setModalOwnership] = useState(false);
  const [modalGeneralCondition, setModalGeneralCondition] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customBrand, setCustomBrand] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<string>("");
  const [landName, setLandName] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, []),
  );

  const formatDate = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (farmId) {
          navigation.navigate("Main", {
            screen: "fixedDashboard",
            params: { farmId, farmName },
          } as any);
        } else {
          navigation.navigate("fixedDashboard");
        }
        return true;
      };
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      return () => backHandler.remove();
    }, [navigation, farmId, farmName]),
  );

  const resetForm = () => {
    setOwnership("");
    setLandOwnership("");
    setCategory("");
    setType("");
    setGeneralCondition("");
    setAsset("");
    setBrand("");
    setWarranty("");
    setExtentha("");
    setExtentac("");
    setExtentp("");
    setEstimatedValue("");
    setStartDate(null);
    setIssuedDate(null);
    setLbIssuedDate(null);
    setAssetname("");
    setOthertool("");
    setToolbrand("");
    setFloorArea("");
    setLandFenced("");
    setPerennialCrop("");
    setAssetType("");
    setMentionOther("");
    setNumberOfUnits("");
    setUnitPrice("");
    setDurationYears("");
    setDurationMonths("");
    setLeastAmountAnnually("");
    setPermitFeeAnnually("");
    setPaymentAnnually("");
    setCustomBrand("");
    setSelectedFarm("");
    setPurchasedDate(null);
    setExpireDate(null);
    setLandName("");
    setBuildingName("");
    setErrors({});
    setErrorMessage("");
  };

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        resetForm();
      };
    }, []),
  );

  const getLabel = (
    options: Array<{ label: string; value: string }>,
    val: string,
  ) => options.find((o) => o.value === val)?.label;

  const clearError = (field: string) =>
    setErrors((prev) => ({ ...prev, [field]: "" }));

  const formatCurrency = (text: string) => {
    let cleaned = text.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) cleaned = parts[0] + "." + parts.slice(1).join("");
    const intPart = (parts[0] || "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.length === 2 ? intPart + "." + parts[1] : intPart;
  };

  const cleanNumber = (value: string) =>
    value ? value.replace(/,/g, "") : "0";

  const cleanedUnitPrice = parseFloat(unitPrice.replace(/,/g, "")) || 0;
  const cleanedNumberOfUnits = parseFloat(numberOfUnits) || 0;
  const totalPrice = cleanedUnitPrice * cleanedNumberOfUnits;

  const currentDate = new Date();
  const maxDate = new Date(currentDate);
  maxDate.setFullYear(currentDate.getFullYear() + 1000);

  const onStartDateChange = (selectedDate: any) => {
    if (selectedDate > new Date()) {
      Alert.alert(
        t("FixedAssets.sorry"),
        t("FixedAssets.TheIssuedDateCannotBeInTheFuture"),
        [{ text: t("Main.OK") }],
      );
      return;
    }
    setStartDate(selectedDate);
    clearError("startDate");
  };

  const onIssuedDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowIssuedDatePicker(false);
    if (event.type === "set" && selectedDate) setIssuedDate(selectedDate);
  };

  const onLbIssuedDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowLbIssuedDatePicker(false);
    if (event.type === "set" && selectedDate) setLbIssuedDate(selectedDate);
  };

  const onPermitIssuedDateChange = (selectedDate: any) => {
    if (selectedDate > new Date()) {
      Alert.alert(
        t("FixedAssets.sorry"),
        t("FixedAssets.TheIssuedDateCannotBeInTheFuture"),
        [{ text: t("Main.OK") }],
      );
      return;
    }
    setLbIssuedDate(selectedDate);
  };

  const warrantyStatusColor =
    purchasedDate && expireDate && expireDate > new Date()
      ? "#26D041"
      : purchasedDate && expireDate
        ? "#FF0000"
        : "#6B7280";

  const warrantyStatusText =
    purchasedDate && expireDate
      ? expireDate.getTime() > new Date().getTime()
        ? t("FixedAssets.UnderWarranty")
        : t("FixedAssets.Expired")
      : t("CurrentAssets.Status");

  const ErrorText = ({ field }: { field: string }) =>
    errors[field] ? (
      <Text className="text-red-500 text-xs mt-1 ml-2">{errors[field]}</Text>
    ) : null;

  useEffect(() => {
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
        if (response.data.status === "success") setFarms(response.data.data);
      } catch (error) {
        console.error("Error fetching farms:", error);
      }
    };
    fetchFarmData();
  }, []);

  const submitData = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!farmId && !selectedFarm) newErrors.selectedFarm = t("Farms.SelectFarmIsRequired");
    if (!category) newErrors.category = t("FixedAssets.SelectCategoryIsRequired");

    if (category === "Building and Infrastructures") {
      if (!type) newErrors.type = t("FixedAssets.SelectAssetTypeIsRequired");
      if (!floorArea) newErrors.floorArea = t("FixedAssets.FloorAreaIsRequired");
      if (!buildingName)
        newErrors.buildingName = t("FixedAssets.BuildingNameIsRequired");
      if (!ownership)
        newErrors.ownership = t("FixedAssets.SelectOwnershipCategoryIsRequired");
      if (!generalCondition)
        newErrors.generalCondition = t("FixedAssets.SelectGeneralConditionIsRequired");
      if (ownership === "Own Building (with title ownership)" && !estimateValue)
        newErrors.estimateValue = t(
          "FixedAssets.EstimatedBuildingValueIsRequired",
        );
      if (ownership === "Leased Building") {
        if (!startDate) newErrors.startDate = t("FixedAssets.StartDateIsRequired");
        if (!durationYears && !durationMonths)
          newErrors.duration = t("FixedAssets.DurationIsRequired");
        if (!leastAmountAnnually)
          newErrors.leastAmountAnnually = t(
            "FixedAssets.AnnualLeaseAmountIsRequired",
          );
      }
      if (ownership === "Permitted Building") {
        if (!lbissuedDate)
          newErrors.lbissuedDate = t("FixedAssets.AnnualLeaseAmountIsRequired");
        if (!permitFeeAnnually)
          newErrors.permitFeeAnnually = t("FixedAssets.AnnualPermitFeeIsRequired");
      }
      if (ownership === "Shared / No Ownership" && !paymentAnnually)
        newErrors.paymentAnnually = t("FixedAssets.AnnualPaymentFeeIsRequired");
    }

    if (category === "Land") {
      if (!landownership)
        newErrors.landownership = t("FixedAssets.SelectOwnershipCategoryIsRequired");
      const nonZeroExtent = [extentha, extentac, extentp].filter(
        (f) => f && f !== "0",
      );
      if (nonZeroExtent.length === 0)
        newErrors.extent = t("FixedAssets.AtLeastOneExtentTypeIsRequired");
      if (!landFenced) newErrors.landFenced = t("FixedAssets.IsTheLandFenced");
      if (!landName) newErrors.landName = t("FixedAssets.LandNameIsRequired");
      if (!perennialCrop)
        newErrors.perennialCrop = t("FixedAssets.DoesTheLandHavePerennialCrops");
      if (landownership === "Own" && !estimateValue)
        newErrors.estimateValue = t(
          "FixedAssets.EstimatedBuildingValueIsRequired",
        );
      if (landownership === "Lease") {
        if (!startDate) newErrors.startDate = t("FixedAssets.StartDateIsRequired");
        const nonZeroDuration = [durationYears, durationMonths].filter(
          (f) => f && f !== "0",
        );
        if (nonZeroDuration.length === 0)
          newErrors.duration = t("FixedAssets.DurationIsRequired");
        if (!leastAmountAnnually)
          newErrors.leastAmountAnnually = t(
            "FixedAssets.AnnualLeaseAmountIsRequired",
          );
      }
      if (landownership === "Permitted" && !permitFeeAnnually)
        newErrors.permitFeeAnnually = t(
          "FixedAssets.enterPermitFeeAnnuallyLKR",
        );
      if (landownership === "Shared" && !paymentAnnually)
        newErrors.paymentAnnually = t("FixedAssets.AnnualPaymentFeeIsRequired");
    }

    if (category === "Machine and Vehicles") {
      if (!asset) newErrors.asset = t("FixedAssets.SelectAssetIsRequired");
      const typeAndBrandAssets = [
        "Tractors",
        "Cleaning, Grading and Weighing Equipment",
        "Sprayers",
        "Transplanter",
        "Harvesting Equipment",
      ];
      if (typeAndBrandAssets.includes(asset) && !assetType)
        newErrors.assetType = t("FixedAssets.SelectAssetTypeIsRequired");
      if (assetType === "Other" && !mentionOther)
        newErrors.mentionOther = t("FixedAssets.MentionOtherDetails");
      if (!brand) newErrors.brand = t("FixedAssets.SelectBrand");
      if (brand === "Other" && !customBrand)
        newErrors.customBrand = t("FixedAssets.MentionOtherBrandName");
      if (!numberOfUnits)
        newErrors.numberOfUnits = t("FixedAssets.NumberOfUnitsIsRequired");
      if (!unitPrice) newErrors.unitPrice = t("FixedAssets.UnitPriceIsRequired");
      if (!warranty) newErrors.warranty = t("FixedAssets.SelectWarrantyIsRequired");
      if (warranty === "yes" && !purchasedDate)
        newErrors.purchasedDate = t("FixedAssets.PurchasedDateIsRequired");
      if (warranty === "yes" && !expireDate)
        newErrors.expireDate = t("FixedAssets.ExpireDateIsRequired");
    }

    if (category === "Tools") {
      if (!assetname) newErrors.assetname = t("FixedAssets.SelectAssetIsRequired");
      if (assetname === "Other" && !othertool)
        newErrors.othertool = t("FixedAssets.MentionOtherDetails");
      if (!toolbrand) newErrors.toolbrand = t("FixedAssets.SelectBrand");
      if (toolbrand === "Other" && !customBrand)
        newErrors.customBrand = t("FixedAssets.MentionOtherBrandName");
      if (!numberOfUnits)
        newErrors.numberOfUnits = t("FixedAssets.NumberOfUnitsIsRequired");
      if (!unitPrice) newErrors.unitPrice = t("FixedAssets.UnitPriceIsRequired");
      if (!warranty) newErrors.warranty = t("FixedAssets.SelectWarrantyIsRequired");
      if (warranty === "yes" && !purchasedDate)
        newErrors.purchasedDate = t("FixedAssets.PurchasedDateIsRequired");
      if (warranty === "yes" && !expireDate)
        newErrors.expireDate = t("FixedAssets.ExpireDateIsRequired");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const updatedExtentp = extentp || "0";
    const updatedExtentac = extentac || "0";
    const updatedExtentha = extentha || "0";
    const updatedDurationYears = durationYears || "0";
    const updatedDurationMonths = durationMonths || "0";

    setLoading(true);
    const updatedPurchaseDate = warranty === "no" ? null : purchasedDate;
    const updatedExpireDate = warranty === "no" ? null : expireDate;

    const formData = {
      farmId: farmId ? farmId.toString() : selectedFarm,
      category,
      ownership,
      type,
      floorArea,
      generalCondition,
      extentha: updatedExtentha,
      extentac: updatedExtentac,
      extentp: updatedExtentp,
      landFenced,
      perennialCrop,
      asset,
      assetType,
      mentionOther:
        category === "Tools" && assetname === "Other"
          ? othertool
          : mentionOther,
      brand: customBrand || brand,
      numberOfUnits: cleanedNumberOfUnits.toString(),
      unitPrice: cleanNumber(unitPrice),
      totalPrice,
      warranty,
      issuedDate:
        category === "Building and Infrastructures"
          ? (lbissuedDate ?? null)
          : (issuedDate ?? null),
      purchaseDate: updatedPurchaseDate,
      expireDate: updatedExpireDate,
      startDate,
      durationYears: updatedDurationYears,
      durationMonths: updatedDurationMonths,
      leastAmountAnnually: cleanNumber(leastAmountAnnually),
      permitFeeAnnually: cleanNumber(permitFeeAnnually),
      paymentAnnually: cleanNumber(paymentAnnually),
      estimateValue: cleanNumber(estimateValue),
      assetname,
      toolbrand: customBrand || toolbrand,
      landownership,
      landName,
      buildingName,
    };

    try {
      const token = await AsyncStorage.getItem("userToken");
      await axios.post(
        `${environment.API_BASE_URL}api/auth/fixedassets`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      Alert.alert(
        t("Main.Success"),
        t("FixedAssets.AssetAddSuccessfuly"),
        [
          {
            text: t("Main.OK"),
            onPress: () => {
              if (farmId) {
                navigation.navigate("Main", {
                  screen: "fixedDashboard",
                  params: { farmId, farmName },
                } as any);
              } else {
                navigation.navigate("fixedDashboard");
              }
            },
          },
        ],
      );
      setLoading(false);
    } catch (error: any) {
      console.error("Error submitting data:", error);
      setLoading(false);
      Alert.alert("Duplicate Name", error.response.data.message, [
        { text: t("Main.OK") },
      ]);
    }
  };

  const farmLabel = farms.find(
    (f) => f.id.toString() === selectedFarm,
  )?.farmName;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      enabled
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1 }}>
        

        {/* Farm */}
        <GlobalSearchModal
          visible={modalFarm}
          onClose={() => setModalFarm(false)}
          title={t("CurrentAssets.SelectFarm")}
          data={farms.map((f) => ({
            label: f.farmName,
            value: f.id.toString(),
          }))}
          selectedItems={selectedFarm ? [selectedFarm] : []}
          onSelect={(items) => {
            setSelectedFarm(items[0] ?? "");
            setAssetType("");
            setBrand("");
            clearError("selectedFarm");
          }}
          searchPlaceholder={t("Main.Search...")}
        />

        {/* Category */}
        <GlobalSearchModal
          visible={modalCategory}
          onClose={() => setModalCategory(false)}
          title={t("CurrentAssets.Category")}
          data={categoryOptions}
          selectedItems={category ? [category] : []}
          onSelect={(items) => {
            const val = items[0] ?? "";
            setCategory(val);
            setOwnership("");
            setLbIssuedDate(null);
            setPermitFeeAnnually("");
            setAsset("");
            setAssetname("");
            setBrand("");
            setUnitPrice("");
            setNumberOfUnits("");
            setWarranty("");
            setOthertool("");
            setExtentac("");
            setExtentp("");
            setExtentha("");
            setFloorArea("");
            setLandFenced("");
            setPerennialCrop("");
            clearError("category");
          }}
          searchPlaceholder={t("Main.Search...")}
        />

        {/* Machine asset */}
        <GlobalSearchModal
          visible={modalAsset && category === "Machine and Vehicles"}
          onClose={() => setModalAsset(false)}
          title={t("FixedAssets.Asset")}
          data={Machineasset}
          selectedItems={asset ? [asset] : []}
          onSelect={(items) => {
            setAsset(items[0] ?? "");
            setAssetType("");
            setBrand("");
            clearError("asset");
          }}
          searchPlaceholder={t("Main.Search...")}
        />

        {/* Asset type (Machine) */}
        {category === "Machine and Vehicles" &&
          asset &&
          assetTypesForAssets[asset] && (
            <GlobalSearchModal
              visible={modalAssetType}
              onClose={() => setModalAssetType(false)}
              title={t("FixedAssets.SelectAssetTypeIsRequired")}
              data={assetTypesForAssets[asset]}
              selectedItems={assetType ? [assetType] : []}
              onSelect={(items) => {
                setAssetType(items[0] ?? "");
                clearError("assetType");
              }}
              searchPlaceholder={t("Main.Search...")}
            />
          )}

        {/* Brand (Machine) */}
        {category === "Machine and Vehicles" &&
          asset &&
          brandTypesForAssets[asset] && (
            <GlobalSearchModal
              visible={modalBrand}
              onClose={() => setModalBrand(false)}
              title={t("FixedAssets.SelectBrand")}
              data={brandTypesForAssets[asset]}
              selectedItems={brand ? [brand] : []}
              onSelect={(items) => {
                setBrand(items[0] ?? "");
                clearError("brand");
              }}
              searchPlaceholder={t("Main.Search...")}
            />
          )}

        {/* Land ownership */}
        {category === "Land" && (
          <GlobalSearchModal
            visible={modalLandOwnership}
            onClose={() => setModalLandOwnership(false)}
            title={t("FixedAssets.Ownership")}
            data={landOwnershipOptions}
            selectedItems={landownership ? [landownership] : []}
            onSelect={(items) => {
              setLandOwnership(items[0] ?? "");
              clearError("landownership");
            }}
            searchPlaceholder={t("Main.Search...")}
          />
        )}

        {/* Tools asset */}
        {category === "Tools" && (
          <GlobalSearchModal
            visible={modalAsset && category === "Tools"}
            onClose={() => setModalAsset(false)}
            title={t("FixedAssets.Asset")}
            data={assetOptions}
            selectedItems={assetname ? [assetname] : []}
            onSelect={(items) => {
              setAssetname(items[0] ?? "");
              setOthertool("");
              clearError("assetname");
            }}
            searchPlaceholder={t("Main.Search...")}
          />
        )}

        {/* Tool brand */}
        {category === "Tools" && (
          <GlobalSearchModal
            visible={modalToolBrand}
            onClose={() => setModalToolBrand(false)}
            title={t("FixedAssets.Brand")}
            data={toolBrandOptions}
            selectedItems={toolbrand ? [toolbrand] : []}
            onSelect={(items) => {
              setToolbrand(items[0] ?? "");
              clearError("toolbrand");
            }}
            searchPlaceholder={t("Main.Search...")}
          />
        )}

        {/* Building type */}
        {(category === "Building and Infrastructures" || !category) && (
          <GlobalSearchModal
            visible={modalType}
            onClose={() => setModalType(false)}
            title={t("FixedAssets.Type")}
            data={buildingTypeOptions}
            selectedItems={type ? [type] : []}
            onSelect={(items) => {
              setType(items[0] ?? "");
              clearError("type");
            }}
            searchPlaceholder={t("Main.Search...")}
          />
        )}

        {/* Building ownership */}
        {(category === "Building and Infrastructures" || !category) && (
          <GlobalSearchModal
            visible={modalOwnership}
            onClose={() => setModalOwnership(false)}
            title={t("FixedAssets.Ownership")}
            data={ownershipCategories}
            selectedItems={ownership ? [ownership] : []}
            onSelect={(items) => {
              setOwnership(items[0] ?? "");
              clearError("ownership");
            }}
            searchPlaceholder={t("Main.Search...")}
          />
        )}

        {/* General condition */}
        {(category === "Building and Infrastructures" || !category) && (
          <GlobalSearchModal
            visible={modalGeneralCondition}
            onClose={() => setModalGeneralCondition(false)}
            title={t("FixedAssets.GeneralCondition")}
            data={generalConditionOptions}
            selectedItems={generalCondition ? [generalCondition] : []}
            onSelect={(items) => {
              setGeneralCondition(items[0] ?? "");
              clearError("generalCondition");
            }}
            searchPlaceholder={t("Main.Search...")}
            showSearch={false}
          />
        )}

        {/*  Scrollable form  */}
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
                  screen: "fixedDashboard",
                  params: { farmId, farmName },
                } as any);
              } else {
                navigation.navigate("fixedDashboard");
              }
            }}
          />

          {/* Tab Bar */}
          {(!farmId || user?.role !== "Supervisor") && (
            <View className="flex-row mt-2 justify-center">
              <View className="w-1/2">
                <TouchableOpacity
                  onPress={() => {
                    if (farmId) {
                      navigation.navigate("Main", {
                        screen: "CurrentAssert",
                        params: { farmId, farmName },
                      } as any);
                    } else {
                      navigation.navigate("CurrentAssert");
                    }
                  }}
                >
                  <Text className="text-black text-center font-semibold text-lg">
                    {t("CurrentAssets.CurrentAssets")}
                  </Text>
                  <View className="border-t-[2px] border-[#D9D9D9] mt-2" />
                </TouchableOpacity>
              </View>
              <View className="w-1/2">
                <TouchableOpacity>
                  <Text className="text-black font-semibold text-center text-lg">
                    {t("CurrentAssets.FixedAssets")}
                  </Text>
                  <View className="border-t-[2px] border-black mt-2" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View className="px-6 pt-4 pb-16">
            {/* Farm selector */}
            {!farmId && (
              <>
                <Text className="text-[#070707] text-sm mt-2">
                  {t("CurrentAssets.SelectFarm")} *
                </Text>
                <SelectorButton
                  label={farmLabel}
                  placeholder={t("FixedAssets.SelectAFarm")}
                  onPress={() => {
                    Keyboard.dismiss();
                    setModalFarm(true);
                  }}
                />
                <ErrorText field="selectedFarm" />
              </>
            )}

            {/*  Category selector */}
            <Text className="text-[#070707] text-sm mt-2">
              {t("CurrentAssets.Category")} *
            </Text>
            <SelectorButton
              label={getLabel(categoryOptions, category)}
              placeholder={t("CurrentAssets.Selectcategory")}
              onPress={() => {
                Keyboard.dismiss();
                setModalCategory(true);
              }}
            />
            <ErrorText field="category" />

            {category === "Machine and Vehicles" && (
              <View className="flex-1">
                <Text className="text-[#070707] text-sm mt-2">
                  {t("FixedAssets.Asset")} *
                </Text>
                <SelectorButton
                  label={getLabel(Machineasset, asset)}
                  placeholder={t("FixedAssets.SelectAssetIsRequired")}
                  onPress={() => {
                    Keyboard.dismiss();
                    setModalAsset(true);
                  }}
                />
                <ErrorText field="asset" />

                {/* Asset type */}
                {asset && assetTypesForAssets[asset]?.length > 0 && (
                  <>
                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.SelectAssetTypeIsRequired")} *
                    </Text>
                    <SelectorButton
                      label={getLabel(assetTypesForAssets[asset], assetType)}
                      placeholder={t("FixedAssets.AssetTypeselect")}
                      onPress={() => {
                        Keyboard.dismiss();
                        setModalAssetType(true);
                      }}
                    />
                    <ErrorText field="assetType" />
                  </>
                )}

                {assetType === "Other" && (
                  <View className="mt-4">
                    <Text>{t("FixedAssets.MentionOther")}</Text>
                    <TextInput
                      className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2" placeholderTextColor="#585858"
                      placeholder={t("FixedAssets.MentionOther")}
                      value={mentionOther}
                      onChangeText={(text) => {
                        setMentionOther(text.replace(/^\s+/, ""));
                        clearError("mentionOther");
                      }}
                    />
                    <ErrorText field="mentionOther" />
                  </View>
                )}

                {/* Brand */}
                {asset && brandTypesForAssets[asset]?.length > 0 && (
                  <>
                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.SelectBrand")} *
                    </Text>
                    <SelectorButton
                      label={getLabel(brandTypesForAssets[asset], brand)}
                      placeholder={t("FixedAssets.SelectBrand")}
                      onPress={() => {
                        Keyboard.dismiss();
                        setModalBrand(true);
                      }}
                    />
                    <ErrorText field="brand" />
                  </>
                )}

                {brand === "Other" && (
                  <View>
                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.MentionOtherBrandName")}
                    </Text>
                    <TextInput
                      className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2" placeholderTextColor="#585858"
                      placeholder={t("FixedAssets.EnterBrandName")}
                      value={customBrand}
                      onChangeText={(text) => {
                        setCustomBrand(text.replace(/^\s+/, ""));
                        clearError("customBrand");
                      }}
                    />
                    <ErrorText field="customBrand" />
                  </View>
                )}

                {/* Number of units */}
                <Text className="text-[#070707] text-sm mt-2">
                  {t("FixedAssets.NumberOfUnits")} *
                </Text>
                <TextInput
                  className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2" placeholderTextColor="#585858"
                  placeholder={t("FixedAssets.NumberOfUnitsIsRequired")}
                  value={numberOfUnits}
                  onChangeText={(text) => {
                    setNumberOfUnits(text.replace(/[-.*#+]/g, "").trimStart());
                    clearError("numberOfUnits");
                  }}
                  keyboardType="numeric"
                />
                <ErrorText field="numberOfUnits" />

                {/* Unit price */}
                <Text className="text-[#070707] text-sm mt-2">
                  {t("FixedAssets.UnitPrice")} *
                </Text>
                <TextInput
                  className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2" placeholderTextColor="#585858"
                  placeholder={t("FixedAssets.UnitPriceIsRequired")}
                  value={unitPrice}
                  onChangeText={(text) => {
                    let cleaned = text.replace(/[^0-9.]/g, "");
                    const parts = cleaned.split(".");
                    if (parts.length > 2)
                      cleaned = parts[0] + "." + parts.slice(1).join("");
                    const intPart = (parts[0] || "").replace(
                      /\B(?=(\d{3})+(?!\d))/g,
                      ",",
                    );
                    const formatted =
                      parts.length === 2 ? intPart + "." + parts[1] : intPart;
                    setUnitPrice(formatted);
                    clearError("unitPrice");
                  }}
                  keyboardType="numeric"
                />
                <ErrorText field="unitPrice" />

                {/* Total price */}
                <Text className="text-[#070707] text-sm mt-2">
                  {t("FixedAssets.TotalPrice")}
                </Text>
                <View className="border border-[#F4F4F4] p-4 pl-4 rounded-full bg-gray-100">
                  <Text>
                    {totalPrice
                      ? (() => {
                        const parts = totalPrice.toFixed(2).split(".");
                        return (
                          parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
                          "." +
                          parts[1]
                        );
                      })()
                      : "0.00"}
                  </Text>
                </View>

                {/* Warranty */}
                <Text className="text-[#070707] text-sm mt-2">{t("FixedAssets.warranty")}</Text>
                <View className="flex-row justify-around">
                  {["yes", "no"].map((w) => (
                    <TouchableOpacity
                      key={w}
                      onPress={() => setWarranty(w)}
                      className="flex-row items-center"
                    >
                      <View
                        className={`w-5 h-5 rounded-full ${warranty === w ? "bg-green-500" : "bg-gray-400"
                          }`}
                      />
                      <Text className="ml-2">
                        {w === "yes"
                          ? t("FixedAssets.Yes")
                          : t("FixedAssets.No")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <ErrorText field="warranty" />

                {warranty === "yes" && (
                  <>
                    {/* Purchased date */}
                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.PurchasedDate")} *
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        Keyboard.dismiss();
                        setShowPurchasedDatePicker((prev) => !prev);
                      }}
                      className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] justify-center flex-row items-center mt-2 mb-2"
                    >
                      <Text
                        className={`flex-1 ${!purchasedDate ? "text-[#6B7280]" : "text-black"}`}
                      >
                        {purchasedDate
                          ? formatDate(purchasedDate)
                          : t("CurrentAssets.PurchaseDate")}
                      </Text>
                      <EvilIcons name="calendar" size={28} color="#5e5d5d" />
                    </TouchableOpacity>
                    <ErrorText field="purchasedDate" />

                    {showPurchasedDatePicker &&
                      (Platform.OS === "ios" ? (
                        <View className="justify-center items-center z-50 mt-2 bg-gray-100 rounded-lg">
                          <DateTimePicker
                            value={purchasedDate || new Date()}
                            mode="date"
                            display="inline"
                            style={{ width: 320, height: 260 }}
                            onChange={(event, selectedDate) => {
                              if (event.type === "set" && selectedDate) {
                                if (selectedDate > new Date()) {
                                  Alert.alert(
                                    t("FixedAssets.sorry"),
                                    t("FixedAssets.ThePurchaseDateCannotBeInTheFuture"),
                                    [{ text: t("Main.OK") }],
                                  );
                                } else {
                                  setPurchasedDate(selectedDate);
                                  clearError("purchasedDate");
                                }
                              }
                              setShowPurchasedDatePicker(false);
                            }}
                            maximumDate={new Date()}
                          />
                        </View>
                      ) : (
                        <DateTimePicker
                          value={purchasedDate || new Date()}
                          mode="date"
                          display="default"
                          onChange={(event, selectedDate) => {
                            if (event.type === "set" && selectedDate) {
                              if (selectedDate > new Date()) {
                                Alert.alert(
                                  t("FixedAssets.sorry"),
                                  t("FixedAssets.ThePurchaseDateCannotBeInTheFuture"),
                                  [{ text: t("Main.OK") }],
                                );
                              } else {
                                setPurchasedDate(selectedDate);
                                clearError("purchasedDate");
                              }
                            }
                            setShowPurchasedDatePicker(false);
                          }}
                          maximumDate={new Date()}
                        />
                      ))}

                    {/* Expire date */}
                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.WarrantyExpireDate")} *
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        Keyboard.dismiss();
                        setShowExpireDatePicker((prev) => !prev);
                      }}
                      className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] justify-center flex-row items-center mt-2 mb-2"
                    >
                      <Text
                        className={`flex-1 ${!expireDate ? "text-[#6B7280]" : "text-black"}`}
                      >
                        {expireDate
                          ? formatDate(expireDate)
                          : t("CurrentAssets.ExpireDate")}
                      </Text>
                      <EvilIcons name="calendar" size={28} color="#5e5d5d" />
                    </TouchableOpacity>
                    <ErrorText field="expireDate" />

                    {showExpireDatePicker &&
                      (Platform.OS === "ios" ? (
                        <View className="justify-center items-center z-50 bg-gray-100 rounded-lg">
                          <DateTimePicker
                            value={expireDate || new Date()}
                            mode="date"
                            display="inline"
                            style={{ width: 320, height: 260 }}
                            onChange={(event, selectedDate) => {
                              setShowExpireDatePicker(false);
                              if (event.type === "set" && selectedDate) {
                                if (
                                  purchasedDate &&
                                  selectedDate < purchasedDate
                                ) {
                                  Alert.alert(
                                    t("FixedAssets.sorry"),
                                    t("FixedAssets.errorInvalidExpireDate"),
                                    [{ text: t("Main.OK") }],
                                  );
                                } else {
                                  setExpireDate(selectedDate);
                                  setErrorMessage("");
                                  clearError("expireDate");
                                }
                              }
                            }}
                            minimumDate={purchasedDate || undefined}
                            maximumDate={maxDate}
                          />
                        </View>
                      ) : (
                        <DateTimePicker
                          value={expireDate || new Date()}
                          mode="date"
                          display="default"
                          onChange={(event, selectedDate) => {
                            setShowExpireDatePicker(false);
                            if (event.type === "set" && selectedDate) {
                              if (
                                purchasedDate &&
                                selectedDate < purchasedDate
                              ) {
                                Alert.alert(
                                  t("FixedAssets.sorry"),
                                  t("FixedAssets.errorInvalidExpireDate"),
                                  [{ text: t("Main.OK") }],
                                );
                              } else {
                                setExpireDate(selectedDate);
                                setErrorMessage("");
                                clearError("expireDate");
                              }
                            }
                          }}
                          minimumDate={purchasedDate || undefined}
                          maximumDate={maxDate}
                        />
                      ))}

                    {/* Status */}
                    <Text className="text-[#070707] text-sm mt-2">
                      {t("CurrentAssets.Status")}
                    </Text>
                    <View className="bg-[#F4F4F4] rounded-3xl h-[50px] justify-center items-center mt-2 mb-2">
                      <Text
                        style={{
                          color: warrantyStatusColor,
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        {warrantyStatusText}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            )}

            {category === "Land" && (
              <View>
                <Text className="text-[#070707] text-sm mt-2">
                  {t("FixedAssets.LandName")} *
                </Text>
                <TextInput
                  className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2" placeholderTextColor="#585858"
                  placeholder={t("FixedAssets.EnterLandName")}
                  value={landName}
                  autoCapitalize="sentences"
                  onChangeText={(text) => {
                    const trimmed = text.replace(/^\s+/, "");
                    const capitalized =
                      trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
                    setLandName(capitalized);
                    clearError("landName");
                  }}
                />
                <ErrorText field="landName" />
                <Text className="text-[#070707] text-sm mt-2">
                  {t("FixedAssets.Extent")} *
                </Text>
                <View className="flex-row items-center justify-between w-full">
                  {[
                    {
                      label: t("FixedAssets.ha"),
                      val: extentha,
                      setter: setExtentha,
                    },
                    {
                      label: t("FixedAssets.ac"),
                      val: extentac,
                      setter: setExtentac,
                    },
                    {
                      label: t("FixedAssets.p"),
                      val: extentp,
                      setter: setExtentp,
                    },
                  ].map(({ label, val, setter }) => (
                    <View
                      key={label}
                      className="flex-row items-center gap-2"
                    >
                      <Text className="text-[#070707] text-sm mt-2 mr-2">{label}</Text>
                      <TextInput
                        className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] w-20 mt-2 mb-2" placeholderTextColor="#585858"
                        value={val}
                        onChangeText={(text) =>
                          setter(text.replace(/[-.*#+]/g, ""))
                        }
                        keyboardType="numeric"
                        placeholder={label}
                      />
                    </View>
                  ))}
                </View>
                <ErrorText field="extent" />

                {/* Land ownership */}
                <Text className="text-[#070707] text-sm mt-2">
                  {t("FixedAssets.Ownership")} *
                </Text>
                <SelectorButton
                  label={getLabel(landOwnershipOptions, landownership)}
                  placeholder={t("FixedAssets.SelectOwnershipCategoryIsRequired")}
                  onPress={() => {
                    Keyboard.dismiss();
                    setModalLandOwnership(true);
                  }}
                />
                <ErrorText field="landownership" />

                {/* Own */}
                {landownership === "Own" && (
                  <View>
                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.EstimatedValue")} *
                    </Text>
                    <TextInput
                      className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2" placeholderTextColor="#585858"
                      placeholder={t("FixedAssets.EnterEstimatedValue")}
                      value={estimateValue}
                      onChangeText={(text) => {
                        setEstimatedValue(formatCurrency(text.trimStart()));
                        clearError("estimateValue");
                      }}
                      keyboardType="numeric"
                    />
                    <ErrorText field="estimateValue" />
                  </View>
                )}

                {/* Lease */}
                {landownership === "Lease" && (
                  <View>
                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.LeaseStartDate")} *
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        Keyboard.dismiss();
                        setShowStartDatePicker((prev) => !prev);
                      }}
                      className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] justify-center flex-row items-center mt-2 mb-2"
                    >
                      <Text
                        className={`flex-1 ${!startDate ? "text-[#6B7280]" : "text-black"}`}
                      >
                        {startDate
                          ? formatDate(new Date(startDate))
                          : t("FixedAssets.SelectDate")}
                      </Text>
                      <EvilIcons name="calendar" size={28} color="#5e5d5d" />
                    </TouchableOpacity>

                    {showStartDatePicker &&
                      (Platform.OS === "ios" ? (
                        <View className="justify-center items-center z-50 bg-gray-100 rounded-lg">
                          <DateTimePicker
                            value={startDate || new Date()}
                            mode="date"
                            display="inline"
                            style={{ width: 320, height: 260 }}
                            onChange={(event, selectedDate) => {
                              if (event.type === "set") {
                                onStartDateChange(selectedDate);
                                setShowStartDatePicker(false);
                              } else {
                                setShowStartDatePicker(false);
                              }
                            }}
                            maximumDate={new Date()}
                          />
                        </View>
                      ) : (
                        <DateTimePicker
                          value={startDate || new Date()}
                          mode="date"
                          display="default"
                          onChange={(event, selectedDate) => {
                            if (event.type === "set") {
                              onStartDateChange(selectedDate);
                              setShowStartDatePicker(false);
                            } else {
                              setShowStartDatePicker(false);
                            }
                          }}
                          maximumDate={new Date()}
                        />
                      ))}
                    <ErrorText field="startDate" />

                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.Duration")} *
                    </Text>
                    <View className="items-center flex-row justify-center">
                      <Text className="w-[20%] text-right pr-2">
                        {t("FixedAssets.Years")}
                      </Text>
                      <TextInput
                        className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] w-[30%] mt-2 mb-2" placeholderTextColor="#585858"
                        value={durationYears}
                        onChangeText={(text) => {
                          setDurationYears(
                            text.replace(/[-.*#+]/g, "").trimStart(),
                          );
                          clearError("duration");
                        }}
                        keyboardType="numeric"
                        placeholder={t("FixedAssets.Years")}
                      />
                      <Text className="w-[20%] text-right pr-2">
                        {t("FixedAssets.Months")}
                      </Text>
                      <TextInput
                        className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] w-[30%] mt-2 mb-2" placeholderTextColor="#585858"
                        value={durationMonths}
                        onChangeText={(text) => {
                          const cleaned = text
                            .replace(/[-.*#+]/g, "")
                            .trimStart();
                          const num = parseInt(cleaned, 10);
                          if (cleaned === "" || (num >= 0 && num <= 12))
                            setDurationMonths(cleaned);
                          clearError("duration");
                        }}
                        keyboardType="numeric"
                        maxLength={2}
                        placeholder={t("FixedAssets.Months")}
                      />
                    </View>
                    <ErrorText field="duration" />

                    <Text className="pb-2 mt-4 text-sm">
                      {t("FixedAssets.AnnualLeaseAmount")} *
                    </Text>
                    <TextInput
                      className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2" placeholderTextColor="#585858"
                      value={leastAmountAnnually}
                      onChangeText={(text) => {
                        setLeastAmountAnnually(formatCurrency(text));
                        clearError("leastAmountAnnually");
                      }}
                      keyboardType="numeric"
                      placeholder={t("FixedAssets.EnterAnnualLeasedAmount")}
                    />
                    <ErrorText field="leastAmountAnnually" />
                  </View>
                )}

                {/* Permitted */}
                {landownership === "Permitted" && (
                  <View className="mt-4">
                    <Text className="pb-2">
                      {t("FixedAssets.IssuedDate")} *
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        Keyboard.dismiss();
                        setShowIssuedDatePicker((prev) => !prev);
                      }}
                      className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] justify-center flex-row items-center mt-2 mb-2"
                    >
                      <Text
                        className={`flex-1 ${!issuedDate ? "text-[#6B7280]" : "text-black"}`}
                      >
                        {issuedDate ? formatDate(issuedDate) : t("FixedAssets.SelectDate")}
                      </Text>
                      <EvilIcons name="calendar" size={28} color="#5e5d5d" />
                    </TouchableOpacity>
                    {showIssuedDatePicker &&
                      (Platform.OS === "ios" ? (
                        <View className="justify-center items-center z-50 bg-[#F4F4F4] rounded-lg">
                          <DateTimePicker
                            value={issuedDate ?? new Date()}
                            mode="date"
                            display="inline"
                            style={{ width: 320, height: 260 }}
                            onChange={onIssuedDateChange}
                            maximumDate={new Date()}
                          />
                        </View>
                      ) : (
                        <DateTimePicker
                          value={issuedDate ?? new Date()}
                          mode="date"
                          display="default"
                          onChange={onIssuedDateChange}
                          maximumDate={new Date()}
                        />
                      ))}
                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.permitFeeAnnuallyLKR")} *
                    </Text>
                    <TextInput
                      className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2" placeholderTextColor="#585858"
                      placeholder={t("FixedAssets.EnterAnnualPermitFee")}
                      value={permitFeeAnnually}
                      onChangeText={(text) => {
                        setPermitFeeAnnually(formatCurrency(text.trimStart()));
                        clearError("permitFeeAnnually");
                      }}
                      keyboardType="numeric"
                    />
                    <ErrorText field="permitFeeAnnually" />
                  </View>
                )}

                {/* Shared */}
                {landownership === "Shared" && (
                  <View className="mt-4">
                    <Text className="pb-2">
                      {t("FixedAssets.AnnualPaymentFee")} *
                    </Text>
                    <TextInput
                      className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2" placeholderTextColor="#585858"
                      value={paymentAnnually}
                      onChangeText={(text) => {
                        setPaymentAnnually(formatCurrency(text.trimStart()));
                        clearError("paymentAnnually");
                      }}
                      keyboardType="numeric"
                      placeholder={t("FixedAssets.EnterAnnualPaymentFee")}
                    />
                    <ErrorText field="paymentAnnually" />
                  </View>
                )}

                {/* Land fenced */}
                <View className="justify-center">
                  <Text className="text-[#070707] text-sm mt-2 font-bold">
                    {t("FixedAssets.IsTheLandFenced")} *
                  </Text>
                  <View className="flex-row justify-around mb">
                    {["yes", "no"].map((v) => (
                      <TouchableOpacity
                        key={v}
                        onPress={() => setLandFenced(v)}
                        className="flex-row items-center"
                      >
                        <View
                          className={`w-5 h-5 rounded-full ${landFenced === v ? "bg-green-500" : "bg-gray-400"
                            }`}
                        />
                        <Text className="ml-2">
                          {v === "yes"
                            ? t("FixedAssets.Yes")
                            : t("FixedAssets.No")}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <ErrorText field="landFenced" />

                  {/* Perennial crops */}
                  <Text className="text-[#070707] text-sm mt-2 font-bold">
                    {t("FixedAssets.DoesTheLandHavePerennialCrops")} *
                  </Text>
                  <View className="flex-row justify-around mb-1">
                    {["yes", "no"].map((v) => (
                      <TouchableOpacity
                        key={v}
                        onPress={() => setPerennialCrop(v)}
                        className="flex-row items-center"
                      >
                        <View
                          className={`w-5 h-5 rounded-full ${perennialCrop === v ? "bg-green-500" : "bg-gray-400"
                            }`}
                        />
                        <Text className="ml-2">
                          {v === "yes"
                            ? t("FixedAssets.Yes")
                            : t("FixedAssets.No")}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <ErrorText field="perennialCrop" />
                </View>
              </View>
            )}

            {category === "Tools" && (
              <View className="flex-1">
                <Text className="text-[#070707] text-sm mt-2">{t("FixedAssets.Asset")} *</Text>
                <View className="rounded-full mt-2">
                  <SelectorButton
                    label={getLabel(assetOptions, assetname)}
                    placeholder={t("FixedAssets.SelectAssetIsRequired")}
                    onPress={() => {
                      Keyboard.dismiss();
                      setModalAsset(true);
                    }}
                  />
                </View>
                <ErrorText field="assetname" />

                {assetname === "Other" && (
                  <View>
                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.MentionOtherDetails")}
                    </Text>
                    <TextInput
                      className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2" placeholderTextColor="#585858"
                      value={othertool}
                      onChangeText={(text) => {
                        setOthertool(text.replace(/^\s+/, ""));
                        clearError("othertool");
                      }}
                      placeholder={t("FixedAssets.MentionOtherDetails")}
                    />
                    <ErrorText field="othertool" />
                  </View>
                )}

                {/* Tool brand */}
                <Text className="text-[#070707] text-sm mt-2">
                  {t("FixedAssets.Brand")} *
                </Text>
                <SelectorButton
                  label={getLabel(toolBrandOptions, toolbrand)}
                  placeholder={t("FixedAssets.SelectBrand")}
                  onPress={() => {
                    Keyboard.dismiss();
                    setModalToolBrand(true);
                  }}
                />
                <ErrorText field="toolbrand" />

                {toolbrand === "Other" && (
                  <View>
                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.MentionOtherBrandName")}
                    </Text>
                    <TextInput
                      className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2" placeholderTextColor="#585858"
                      placeholder={t("FixedAssets.EnterBrandName")}
                      value={customBrand}
                      onChangeText={(text) =>
                        setCustomBrand(text.replace(/^\s+/, ""))
                      }
                    />
                    <ErrorText field="customBrand" />
                  </View>
                )}

                {/* Units & price */}
                <Text className="text-[#070707] text-sm mt-2">
                  {t("FixedAssets.NumberOfUnits")} *
                </Text>
                <TextInput
                  className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2" placeholderTextColor="#585858"
                  placeholder={t("FixedAssets.NumberOfUnitsIsRequired")}
                  value={numberOfUnits}
                  onChangeText={(text) =>
                    setNumberOfUnits(text.replace(/[-.*#+]/g, "").trimStart())
                  }
                  keyboardType="numeric"
                />
                <ErrorText field="numberOfUnits" />

                <Text className="text-[#070707] text-sm mt-2">
                  {t("FixedAssets.UnitPrice")} *
                </Text>
                <TextInput
                  className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2" placeholderTextColor="#585858"
                  placeholder={t("FixedAssets.UnitPriceIsRequired")}
                  value={unitPrice}
                  onChangeText={(text) => {
                    const digits = text.replace(/[^0-9]/g, "");
                    setUnitPrice(digits.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
                    clearError("unitPrice");
                  }}
                  keyboardType="numeric"
                />
                <ErrorText field="unitPrice" />

                <Text className="text-[#070707] text-sm mt-2">
                  {t("FixedAssets.TotalPrice")}
                </Text>
                <View className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] justify-center mt-2 mb-2">
                  <Text className="text-black text-sm">
                    {totalPrice
                      ? (() => {
                        const parts = totalPrice.toFixed(2).split(".");
                        return (
                          parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
                          "." +
                          parts[1]
                        );
                      })()
                      : "0.00"}
                  </Text>
                </View>

                {/* Warranty */}
                <Text className="text-[#070707] text-sm mt-2">{t("FixedAssets.warranty")}</Text>
                <View className="flex-row justify-around mb-5">
                  {["yes", "no"].map((w) => (
                    <TouchableOpacity
                      key={w}
                      onPress={() => setWarranty(w)}
                      className="flex-row items-center"
                    >
                      <View
                        className={`w-5 h-5 rounded-full ${warranty === w ? "bg-green-500" : "bg-gray-400"
                          }`}
                      />
                      <Text className="ml-2">
                        {w === "yes"
                          ? t("FixedAssets.Yes")
                          : t("FixedAssets.No")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <ErrorText field="warranty" />

                {warranty === "yes" && (
                  <>
                    {/* Purchased date */}
                    <Text className="pb-3">
                      {t("FixedAssets.PurchasedDate")} *
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        Keyboard.dismiss();
                        setShowPurchasedDatePicker((prev) => !prev);
                      }}
                      className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] justify-center flex-row items-center mt-2 mb-2"
                    >
                      <Text
                        className={`flex-1 ${!purchasedDate ? "text-[#6B7280]" : "text-black"}`}
                      >
                        {purchasedDate
                          ? formatDate(purchasedDate)
                          : t("CurrentAssets.PurchaseDate")}
                      </Text>
                      <EvilIcons name="calendar" size={28} color="#5e5d5d" />
                    </TouchableOpacity>
                    <ErrorText field="purchasedDate" />

                    {showPurchasedDatePicker &&
                      (Platform.OS === "ios" ? (
                        <View className="justify-center items-center z-50 bg-gray-100 rounded-lg">
                          <DateTimePicker
                            value={purchasedDate || new Date()}
                            mode="date"
                            display="inline"
                            style={{ width: 320, height: 260 }}
                            onChange={(event, selectedDate) => {
                              if (event.type === "set" && selectedDate) {
                                if (selectedDate > new Date()) {
                                  Alert.alert(
                                    t("FixedAssets.sorry"),
                                    t("FixedAssets.ThePurchaseDateCannotBeInTheFuture"),
                                    [{ text: t("Main.OK") }],
                                  );
                                } else {
                                  setPurchasedDate(selectedDate);
                                  clearError("purchasedDate");
                                }
                              }
                              setShowPurchasedDatePicker(false);
                            }}
                            maximumDate={new Date()}
                          />
                        </View>
                      ) : (
                        <DateTimePicker
                          value={purchasedDate || new Date()}
                          mode="date"
                          display="default"
                          onChange={(event, selectedDate) => {
                            if (event.type === "set" && selectedDate) {
                              if (selectedDate > new Date()) {
                                Alert.alert(
                                  t("FixedAssets.sorry"),
                                  t("FixedAssets.ThePurchaseDateCannotBeInTheFuture"),
                                  [{ text: t("Main.OK") }],
                                );
                              } else {
                                setPurchasedDate(selectedDate);
                                clearError("purchasedDate");
                              }
                            }
                            setShowPurchasedDatePicker(false);
                          }}
                          maximumDate={new Date()}
                        />
                      ))}

                    {/* Expire date */}
                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.WarrantyExpireDate")} *
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        Keyboard.dismiss();
                        setShowExpireDatePicker((prev) => !prev);
                      }}
                      className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] justify-center flex-row items-center mt-2 mb-2"
                    >
                      <Text
                        className={`flex-1 ${!expireDate ? "text-[#6B7280]" : "text-black"}`}
                      >
                        {expireDate
                          ? formatDate(expireDate)
                          : t("CurrentAssets.ExpireDate")}
                      </Text>
                      <EvilIcons name="calendar" size={28} color="#5e5d5d" />
                    </TouchableOpacity>
                    <ErrorText field="expireDate" />

                    {showExpireDatePicker &&
                      (Platform.OS === "ios" ? (
                        <View className="justify-center items-center z-50 bg-gray-100 rounded-lg">
                          <DateTimePicker
                            value={expireDate || new Date()}
                            mode="date"
                            display="inline"
                            style={{ width: 320, height: 260 }}
                            onChange={(event, selectedDate) => {
                              setShowExpireDatePicker(false);
                              if (event.type === "set" && selectedDate) {
                                if (
                                  purchasedDate &&
                                  selectedDate < purchasedDate
                                ) {
                                  Alert.alert(
                                    t("FixedAssets.sorry"),
                                    t("FixedAssets.errorInvalidExpireDate"),
                                    [{ text: t("Main.OK") }],
                                  );
                                } else {
                                  setExpireDate(selectedDate);
                                  setErrorMessage("");
                                  clearError("expireDate");
                                }
                              }
                            }}
                            minimumDate={purchasedDate || undefined}
                            maximumDate={maxDate}
                          />
                        </View>
                      ) : (
                        <DateTimePicker
                          value={expireDate || new Date()}
                          mode="date"
                          display="default"
                          onChange={(event, selectedDate) => {
                            setShowExpireDatePicker(false);
                            if (event.type === "set" && selectedDate) {
                              if (
                                purchasedDate &&
                                selectedDate < purchasedDate
                              ) {
                                Alert.alert(
                                  t("FixedAssets.sorry"),
                                  t("FixedAssets.errorInvalidExpireDate"),
                                  [{ text: t("Main.OK") }],
                                );
                              } else {
                                setExpireDate(selectedDate);
                                setErrorMessage("");
                                clearError("expireDate");
                              }
                            }
                          }}
                          minimumDate={purchasedDate || undefined}
                          maximumDate={maxDate}
                        />
                      ))}

                    {errorMessage ? (
                      <Text className="text-red-500 mt-2">{errorMessage}</Text>
                    ) : null}

                    <Text className="text-[#070707] text-sm mt-2">
                      {t("CurrentAssets.Status")}
                    </Text>
                    <View className="bg-[#F4F4F4] rounded-3xl h-[50px] justify-center items-center mt-2 mb-2">
                      <Text
                        style={{
                          color: warrantyStatusColor,
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        {warrantyStatusText}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            )}

            {(category === "Building and Infrastructures" || !category) && (
              <View>
                {/* Building type */}
                <Text className="text-[#070707] text-sm mt-2">
                  {t("FixedAssets.Type")} *
                </Text>
                <SelectorButton
                  label={getLabel(buildingTypeOptions, type)}
                  placeholder={t("FixedAssets.AssetTypeselect")}
                  onPress={() => {
                    Keyboard.dismiss();
                    setModalType(true);
                  }}
                />
                <ErrorText field="type" />

                <Text className="text-[#070707] text-sm mt-2">
                  {t("FixedAssets.BuildingName")} *
                </Text>
                <TextInput
                  className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2" placeholderTextColor="#585858"
                  placeholder={t("FixedAssets.EnterBuildingName")}
                  value={buildingName}
                  onChangeText={(text) => {
                    const trimmed = text.replace(/^\s+/, "");
                    const capitalized =
                      trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
                    setBuildingName(capitalized);
                    clearError("buildingName");
                  }}
                />
                <ErrorText field="buildingName" />

                {/* Floor area */}
                <Text className="text-[#070707] text-sm mt-2">
                  {t("FixedAssets.FloorArea")} *
                </Text>
                <TextInput
                  className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2" placeholderTextColor="#585858"
                  placeholder={t("FixedAssets.EnterFloorArea")}
                  value={floorArea}
                  onChangeText={(text) => {
                    let cleaned = text.replace(/[^0-9.]/g, "").trimStart();
                    const parts = cleaned.split(".");
                    if (parts.length > 2)
                      cleaned = parts[0] + "." + parts.slice(1).join("");
                    setFloorArea(cleaned);
                    clearError("floorArea");
                  }}
                  keyboardType="numeric"
                />
                <ErrorText field="floorArea" />

                {/* Ownership */}
                <Text className="text-[#070707] text-sm mt-2">
                  {t("FixedAssets.Ownership")} *
                </Text>
                <SelectorButton
                  label={getLabel(ownershipCategories, ownership)}
                  placeholder={t("FixedAssets.SelectOwnershipCategoryIsRequired")}
                  onPress={() => {
                    Keyboard.dismiss();
                    setModalOwnership(true);
                  }}
                />
                <ErrorText field="ownership" />

                {/* Own Building */}
                {ownership === "Own Building (with title ownership)" && (
                  <View>
                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.EstimatedBuildingValue")} *
                    </Text>
                    <TextInput
                      className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2" placeholderTextColor="#585858"
                      placeholder={t("FixedAssets.EnterEstimatedValue")}
                      value={estimateValue}
                      onChangeText={(text) => {
                        setEstimatedValue(formatCurrency(text.trimStart()));
                        clearError("estimateValue");
                      }}
                      keyboardType="numeric"
                    />
                    <ErrorText field="estimateValue" />
                  </View>
                )}

                {/* Leased Building */}
                {ownership === "Leased Building" && (
                  <View className="mt-4">
                    <Text className="pb-2">{t("FixedAssets.LeaseStartDate")} *</Text>
                    <TouchableOpacity
                      onPress={() => {
                        Keyboard.dismiss();
                        setShowStartDatePicker((prev) => !prev);
                      }}
                      className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] justify-center flex-row items-center mt-2 mb-2"
                    >
                      <Text
                        className={`flex-1 ${!startDate ? "text-[#6B7280]" : "text-black"}`}
                      >
                        {startDate
                          ? formatDate(new Date(startDate))
                          : t("FixedAssets.SelectDate")}
                      </Text>
                      <EvilIcons name="calendar" size={28} color="#5e5d5d" />
                    </TouchableOpacity>
                    {showStartDatePicker &&
                      (Platform.OS === "ios" ? (
                        <View className="justify-center items-center z-50 bg-[#F4F4F4] rounded-lg">
                          <DateTimePicker
                            value={startDate || new Date()}
                            mode="date"
                            display="inline"
                            style={{ width: 320, height: 260 }}
                            onChange={(event, selectedDate) => {
                              if (event.type === "set") {
                                onStartDateChange(selectedDate);
                                setShowStartDatePicker(false);
                              } else {
                                setShowStartDatePicker(false);
                              }
                            }}
                            maximumDate={new Date()}
                          />
                        </View>
                      ) : (
                        <DateTimePicker
                          value={startDate || new Date()}
                          mode="date"
                          display="default"
                          onChange={(event, selectedDate) => {
                            if (event.type === "set") {
                              onStartDateChange(selectedDate);
                              setShowStartDatePicker(false);
                            } else {
                              setShowStartDatePicker(false);
                            }
                          }}
                          maximumDate={new Date()}
                        />
                      ))}
                    <ErrorText field="startDate" />

                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.Duration")} *
                    </Text>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Text className="w-[20%] text-right pr-2">
                          {t("FixedAssets.Years")}
                        </Text>
                        <TextInput
                          className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] w-[30%] mt-2 mb-2" placeholderTextColor="#585858"
                          value={durationYears}
                          onChangeText={(text) => {
                            setDurationYears(
                              text.replace(/[-.*#+]/g, "").trimStart(),
                            );
                            clearError("duration");
                          }}
                          keyboardType="numeric"
                          placeholder={t("FixedAssets.Years")}
                        />
                        <Text className="w-[20%] text-right pr-2">
                          {t("FixedAssets.Months")}
                        </Text>
                        <TextInput
                          className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] w-[30%] mt-2 mb-2" placeholderTextColor="#585858"
                          value={durationMonths}
                          onChangeText={(text) => {
                            const cleaned = text
                              .replace(/[-.*#+]/g, "")
                              .trimStart();
                            const num = parseInt(cleaned, 10);
                            if (cleaned === "" || (num >= 0 && num <= 12))
                              setDurationMonths(cleaned);
                            clearError("duration");
                          }}
                          keyboardType="numeric"
                          maxLength={2}
                          placeholder={t("FixedAssets.Months")}
                        />
                      </View>
                    </View>
                    <ErrorText field="duration" />

                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.AnnualLeaseAmount")} *
                    </Text>
                    <TextInput
                      className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2" placeholderTextColor="#585858"
                      value={leastAmountAnnually}
                      onChangeText={(text) => {
                        setLeastAmountAnnually(
                          formatCurrency(text.trimStart()),
                        );
                        clearError("leastAmountAnnually");
                      }}
                      keyboardType="numeric"
                      placeholder={t("FixedAssets.EnterAnnualLeasedAmount")}
                    />
                    <ErrorText field="leastAmountAnnually" />
                  </View>
                )}

                {/* Permitted Building */}
                {ownership === "Permitted Building" && (
                  <View className="mt-4">
                    <Text className="pb-2">
                      {t("FixedAssets.IssuedDate")} *
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        Keyboard.dismiss();
                        setShowLbIssuedDatePicker((prev) => !prev);
                      }}
                      className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] justify-center flex-row items-center mt-2 mb-2"
                    >
                      <Text
                        className={`flex-1 ${!lbissuedDate ? "text-[#6B7280]" : "text-black"}`}
                      >
                        {lbissuedDate ? formatDate(lbissuedDate) : t("FixedAssets.SelectDate")}
                      </Text>
                      <EvilIcons name="calendar" size={28} color="#5e5d5d" />
                    </TouchableOpacity>
                    {showLbIssuedDatePicker &&
                      (Platform.OS === "ios" ? (
                        <View className="justify-center items-center z-50 bg-gray-100 rounded-lg">
                          <DateTimePicker
                            value={lbissuedDate || new Date()}
                            mode="date"
                            display="inline"
                            style={{ width: 320, height: 260 }}
                            onChange={(event, selectedDate) => {
                              if (event.type === "set") {
                                onPermitIssuedDateChange(selectedDate);
                                setShowLbIssuedDatePicker(false);
                              } else {
                                setShowLbIssuedDatePicker(false);
                              }
                            }}
                            maximumDate={new Date()}
                          />
                        </View>
                      ) : (
                        <DateTimePicker
                          value={lbissuedDate || new Date()}
                          mode="date"
                          display="default"
                          onChange={(event, selectedDate) => {
                            if (event.type === "set") {
                              onPermitIssuedDateChange(selectedDate);
                              setShowLbIssuedDatePicker(false);
                            } else {
                              setShowLbIssuedDatePicker(false);
                            }
                          }}
                          maximumDate={new Date()}
                        />
                      ))}
                    <ErrorText field="lbissuedDate" />
                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.AnnualPermitFee")} *
                    </Text>
                    <TextInput
                      className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2" placeholderTextColor="#585858"
                      value={permitFeeAnnually}
                      onChangeText={(text) => {
                        setPermitFeeAnnually(formatCurrency(text.trimStart()));
                        clearError("permitFeeAnnually");
                      }}
                      keyboardType="numeric"
                      placeholder={t("FixedAssets.EnterAnnualPermitFee")}
                    />
                    <ErrorText field="permitFeeAnnually" />
                  </View>
                )}

                {/* Shared / No Ownership */}
                {ownership === "Shared / No Ownership" && (
                  <View className="mt-4">
                    <Text className="pb-2">
                      {t("FixedAssets.AnnualPaymentFee")} *
                    </Text>
                    <TextInput
                      className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2" placeholderTextColor="#585858"
                      value={paymentAnnually}
                      onChangeText={(text) => {
                        setPaymentAnnually(formatCurrency(text.trimStart()));
                        clearError("paymentAnnually");
                      }}
                      keyboardType="numeric"
                      placeholder={t("FixedAssets.EnterAnnualPaymentFee")}
                    />
                    <ErrorText field="paymentAnnually" />
                  </View>
                )}

                {/* General condition */}
                <Text className="text-[#070707] text-sm mt-2">
                  {t("FixedAssets.GeneralCondition")} *
                </Text>
                <SelectorButton
                  label={getLabel(generalConditionOptions, generalCondition)}
                  placeholder={t("FixedAssets.SelectGeneralConditionIsRequired")}
                  onPress={() => {
                    Keyboard.dismiss();
                    setModalGeneralCondition(true);
                  }}
                />
                <ErrorText field="generalCondition" />
              </View>
            )}

            {/* Submit */}
          <TouchableOpacity
            onPress={submitData}
            className="bg-[#353535] rounded-3xl h-[50px] justify-center items-center m-6"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 4.65,
              elevation: 8,
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white text-center font-semibold text-lg">
                {t("FixedAssets.AddAsset")}
              </Text>
            )}
          </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default AddFixedAsset;
