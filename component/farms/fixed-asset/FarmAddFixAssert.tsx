import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { RootStackParamList } from "../../types/types";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import GlobalSearchModal from "@/component/common/GlobalSearchModal";
import { MaterialIcons } from "@expo/vector-icons";
import assetData from "@/assets/jsons/fixed-asset/fixed-assets.json";

type FarmAddFixAssertNavigationProp = StackNavigationProp<
  RootStackParamList,
  "FarmAddFixAssert"
>;
import Icon from "@expo/vector-icons/Ionicons";
import CustomHeader from "../../common/CustomHeader";

interface FarmAddFixAssertProps {
  navigation: FarmAddFixAssertNavigationProp;
}

type RouteParams = {
  farmId: number;
  farmName: string;
};

interface RawOption {
  labelKey: string;
  value: string;
}

const DropdownButton = ({
  value,
  placeholder,
  onPress,
  hasError,
}: {
  value: string;
  placeholder: string;
  onPress: () => void;
  hasError?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      borderWidth: 1,
      borderColor: hasError ? "#DC2626" : "#F4F4F4",
      backgroundColor: "#F4F4F4",
      paddingHorizontal: 12,
      paddingVertical: 14,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    }}
    className="h-[50px] rounded-3xl"
  >
    <Text style={{ color: value ? "#111827" : "#6B7280", fontSize: 14 }}>
      {value || placeholder}
    </Text>
    <MaterialIcons
      name="arrow-drop-down"
      size={24}
      color="#666"
    />
  </TouchableOpacity>
);

const FarmAddFixAssert: React.FC<FarmAddFixAssertProps> = ({ navigation }) => {
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
  const ownershipOptions = toOptions(assetData.ownershipCategories);
  const landOwnershipOptions = toOptions(assetData.landOwnershipOptions);
  const buildingTypeOptions = toOptions(assetData.buildingTypeOptions);
  const generalConditionOptions = toOptions(assetData.generalConditionOptions);
  const machineAssetOptions = toOptions(assetData.machineasset);
  const toolAssetOptions = toOptions(assetData.assetOptions);
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
  const [purchasedDate, setPurchasedDate] = useState<Date | null>(null);
  const [expireDate, setExpireDate] = useState<Date | null>(null);
  const [showPurchasedDatePicker, setShowPurchasedDatePicker] = useState(false);
  const [showExpireDatePicker, setShowExpireDatePicker] = useState(false);
  const [extentha, setExtentha] = useState("");
  const [extentac, setExtentac] = useState("");
  const [extentp, setExtentp] = useState("");
  const [estimateValue, setEstimatedValue] = useState("");
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [showIssuedDatePicker, setShowIssuedDatePicker] = useState(false);
  const [issuedDate, setIssuedDate] = useState<Date | null>(null);
  const [showLbIssuedDatePicker, setShowLbIssuedDatePicker] = useState(false);
  const [lbissuedDate, setLbIssuedDate] = useState<Date | null>(null);
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
  const [customBrand, setCustomBrand] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [landName, setLandName] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const openModal = (name: string) => {
    Keyboard.dismiss();
    setActiveModal(name);
  };
  const closeModal = () => setActiveModal(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const clearError = (field: string) =>
    setErrors((prev) => ({ ...prev, [field]: "" }));

  const route = useRoute();
  const { farmId, farmName } = route.params as RouteParams;

  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });
      return () => {
        resetForm();
        setActiveModal(null);
      };
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        navigation.navigate("Main", {
          screen: "FarmFixDashBoard",
          params: { farmId, farmName },
        });
        return true;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackPress,
      );
      return () => subscription.remove();
    }, [navigation]),
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
    setPurchasedDate(null);
    setExpireDate(null);
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
    setErrors({});
    setLandName("");
    setBuildingName("");
  };

  const getLabelFromOptions = (
    options: { label: string; value: string }[],
    value: string,
  ) => options.find((o) => o.value === value)?.label || "";

  const warrantystatus = [
    { key: "1", value: "yes" },
    { key: "2", value: "no" },
  ];

  const onPurchasedDateChange = (
    event: any,
    selectedDate: Date | undefined,
  ) => {
    setShowPurchasedDatePicker(false);
    if (selectedDate) setPurchasedDate(selectedDate);
  };

  const onStartDateChange = (selectedDate: any) => {
    const today = new Date();
    if (selectedDate > today) {
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

  const onExpireDateChange = (event: any, selectedDate: any) => {
    const currentDate = selectedDate || expireDate;
    setShowExpireDatePicker(false);
    if (purchasedDate && currentDate < purchasedDate) {
      setErrorMessage(t("FixedAssets.errorInvalidExpireDate"));
    } else {
      setExpireDate(currentDate);
      setErrorMessage("");
      clearError("expireDate");
      clearError("warrantyDates");
    }
  };

  const onIssuedDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowIssuedDatePicker(false);
    if (selectedDate) {
      setIssuedDate(selectedDate);
      clearError("issuedDate");
    }
  };

  const onPermitIssuedDateChange = (selectedDate: any) => {
    const today = new Date();
    if (selectedDate > today) {
      Alert.alert(
        t("FixedAssets.sorry"),
        t("FixedAssets.TheIssuedDateCannotBeInTheFuture"),
        [{ text: t("Main.OK") }],
      );
      return;
    }
    setLbIssuedDate(selectedDate);
    clearError("lbissuedDate");
  };

  const formatDecimalInput = (value: string): string => {
    let cleaned = value.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) cleaned = parts[0] + "." + parts.slice(1).join("");
    if (parts.length === 2 && parts[1].length > 2)
      cleaned = parts[0] + "." + parts[1].substring(0, 2);
    if (cleaned.startsWith("0") && cleaned.length > 1 && cleaned[1] !== ".")
      cleaned = cleaned.replace(/^0+/, "");
    return cleaned;
  };

  const formatWithCommas = (value: string): string => {
    if (!value) return "";
    const parts = value.split(".");
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.length > 1 ? `${intPart}.${parts[1]}` : intPart;
  };

  const handleNumericInput = (text: string, setter: (v: string) => void) => {
    const raw = text.replace(/,/g, "");
    const cleaned = formatDecimalInput(raw);
    setter(cleaned);
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  const totalPrice = Number(numberOfUnits) * Number(unitPrice) || 0;

  const currentDate = new Date();
  const maxDate = new Date(currentDate);
  maxDate.setFullYear(currentDate.getFullYear() + 1000);

  const submitData = async () => {
    const newErrors: Record<string, string> = {};

    if (
      category !== "Machine and Vehicles" &&
      category !== "Tools" &&
      warranty === "yes" &&
      purchasedDate &&
      expireDate
    ) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expireDateOnly = new Date(expireDate);
      expireDateOnly.setHours(0, 0, 0, 0);
      if (expireDateOnly < today) {
        Alert.alert(
          t("FixedAssets.sorry"),
          t("FixedAssets.cannotAddExpiredAsset"),
          [{ text: t("Main.OK") }],
        );
        return;
      }
    }

    if (!category) newErrors.category = t("FixedAssets.SelectCategoryIsRequired");

    if (category === "Building and Infrastructures") {
      if (!type) newErrors.type = t("FixedAssets.SelectAssetTypeIsRequired");
      if (!buildingName)
        newErrors.buildingName = t("FixedAssets.BuildingNameIsRequired");
      if (!floorArea) newErrors.floorArea = t("FixedAssets.FloorAreaIsRequired");
      if (!ownership)
        newErrors.ownership = t("FixedAssets.SelectOwnershipCategoryIsRequired");
      if (!generalCondition)
        newErrors.generalCondition = t("FixedAssets.SelectGeneralConditionIsRequired");
      if (ownership === "Own Building (with title ownership)" && !estimateValue)
        newErrors.estimateValue = t(
          "FixedAssets.EstimatedBuildingValueIsRequired",
        );
      if (ownership === "Leased Building") {
        if (!startDate)
          newErrors.startDate = t("FixedAssets.LeaseStartDateIsRequired");
        if (!durationYears) newErrors.duration = t("FixedAssets.DurationIsRequired");
        if (!leastAmountAnnually)
          newErrors.leastAmountAnnually = t(
            "FixedAssets.AnnualLeaseAmountIsRequired",
          );
      }
      if (ownership === "Permitted Building") {
        if (!lbissuedDate)
          newErrors.lbissuedDate = t("FixedAssets.IssuedDateIsRequired");
        if (!permitFeeAnnually)
          newErrors.permitFeeAnnually = t("FixedAssets.AnnualPermitFeeIsRequired");
      }
      if (ownership === "Shared / No Ownership" && !paymentAnnually)
        newErrors.paymentAnnually = t("FixedAssets.AnnualPaymentFeeIsRequired");
    }

    if (category === "Land") {
      if (!landownership)
        newErrors.landownership = t("FixedAssets.SelectOwnershipCategoryIsRequired");
      const nonZeroFields = [
        extentp || "0",
        extentac || "0",
        extentha || "0",
      ].filter((f) => f && f !== "0");
      if (!landName) newErrors.landName = t("FixedAssets.LandNameIsRequired");
      if (nonZeroFields.length === 0)
        newErrors.extent = t("FixedAssets.AtLeastOneExtentTypeIsRequired");
      if (!landFenced) newErrors.landFenced = t("FixedAssets.IsTheLandFenced");
      if (!perennialCrop)
        newErrors.perennialCrop = t("FixedAssets.DoesTheLandHavePerennialCrops");
      if (landownership === "Own" && !estimateValue)
        newErrors.estimateValue = t(
          "FixedAssets.EstimatedBuildingValueIsRequired",
        );
      if (landownership === "Lease") {
        const nonZeroDuration = [
          durationMonths || "0",
          durationYears || "0",
        ].filter((f) => f && f !== "0");
        if (nonZeroDuration.length === 0)
          newErrors.duration = t("FixedAssets.DurationIsRequired");
        if (!leastAmountAnnually)
          newErrors.leastAmountAnnually = t(
            "FixedAssets.AnnualLeaseAmountIsRequired",
          );
      }
      if (landownership === "Permitted") {
        if (!issuedDate)
          newErrors.issuedDate = t("FixedAssets.IssuedDateIsRequired");
        if (!permitFeeAnnually)
          newErrors.permitFeeAnnually = t(
            "FixedAssets.enterPermitFeeAnnuallyLKR",
          );
      }
      if (landownership === "Shared" && !paymentAnnually)
        newErrors.paymentAnnually = t("FixedAssets.AnnualPaymentFeeIsRequired");
    }

    if (category === "Machine and Vehicles") {
      if (!asset) newErrors.asset = t("FixedAssets.SelectAssetIsRequired");
      const brandOnlyAssets = [
        "Rotavator",
        "Tillage Equipment",
        "Threshers, Reaper, Binders",
        "Weeding",
        "Shelling and Grinding Machine",
        "Sowing",
        "Combine Harvesters",
        "Sowing Equipment",
      ];
      const typeAndBrandAssets = [
        "Tractors",
        "Cleaning, Grading and Weighing Equipment",
        "Sprayers",
        "Transplanter",
        "Harvesting Equipment",
      ];
      if (asset && brandOnlyAssets.includes(asset) && !brand)
        newErrors.brand = t("FixedAssets.SelectBrand");
      if (asset && typeAndBrandAssets.includes(asset)) {
        if (!assetType) newErrors.assetType = t("FixedAssets.SelectAssetTypeIsRequired");
        if (!brand) newErrors.brand = t("FixedAssets.SelectBrand");
      }
      if (assetType === "Other" && !mentionOther)
        newErrors.mentionOther = t("FixedAssets.MentionOtherDetails");
      if (brand === "Other" && !customBrand)
        newErrors.customBrand = t("FixedAssets.MentionOtherBrandName");
      if (!numberOfUnits)
        newErrors.numberOfUnits = t("FixedAssets.NumberOfUnitsIsRequired");
      if (!unitPrice) newErrors.unitPrice = t("FixedAssets.UnitPriceIsRequired");
      if (!warranty) newErrors.warranty = t("FixedAssets.SelectWarrantyIsRequired");
      if (warranty === "yes" && !purchasedDate)
        newErrors.warrantypurchasedDate = t(
          "FixedAssets.WarrantyPurchasedDateIsRequired",
        );
      if (warranty === "yes" && !expireDate)
        newErrors.warrantyDatesexpireDate = t(
          "FixedAssets.WarrantyExpireDateIsRequired",
        );
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
      if (warranty === "yes" && !purchasedDate)
        newErrors.warrantypurchasedDate = t(
          "FixedAssets.WarrantyPurchasedDateIsRequired",
        );
      if (warranty === "yes" && !expireDate)
        newErrors.warrantyDatesexpireDate = t(
          "FixedAssets.WarrantyExpireDateIsRequired",
        );
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
      return;
    }

    setErrors({});
    setLoading(true);
    const updatedPurchaseDate = warranty === "no" ? null : purchasedDate;
    const updatedExpireDate = warranty === "no" ? null : expireDate;

    const formData = {
      farmId,
      category,
      ownership,
      type,
      floorArea,
      generalCondition,
      extentha: extentha || "0",
      extentac: extentac || "0",
      extentp: extentp || "0",
      landFenced,
      perennialCrop,
      asset,
      assetType,
      mentionOther:
        category === "Tools" && assetname === "Other"
          ? othertool
          : mentionOther,
      brand: customBrand || brand,
      numberOfUnits,
      unitPrice,
      totalPrice,
      warranty,
      issuedDate:
        category === "Building and Infrastructures"
          ? (lbissuedDate ?? null)
          : (issuedDate ?? null),
      purchaseDate: updatedPurchaseDate,
      expireDate: updatedExpireDate,
      warrantystatus,
      startDate,
      durationYears: durationYears || "0",
      durationMonths: durationMonths || "0",
      leastAmountAnnually,
      permitFeeAnnually,
      paymentAnnually,
      estimateValue,
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
            onPress: () =>
              navigation.navigate("Main", {
                screen: "FarmFixDashBoard",
                params: { farmId, farmName },
              }),
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
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) console.error(error.response?.data);
        else if (error instanceof Error) console.error(error.message);
      }
    };
    fetchFarmData();
  }, []);

  const FieldError = ({ field }: { field: string }) =>
    errors[field] ? (
      <Text
        style={{ color: "#DC2626", fontSize: 12, marginTop: 4, marginLeft: 4 }}
      >
        {errors[field]}
      </Text>
    ) : null;

  const renderWarrantySection = () => (
    <>
      <Text className="pt-5 pb-3">{t("FixedAssets.Warranty")} *</Text>
      <View className="flex-row justify-around">
        <TouchableOpacity
          onPress={() => {
            setWarranty("yes");
            clearError("warranty");
            clearError("warrantyDates");
          }}
          className="flex-row items-center"
        >
          <View
            className={`w-5 h-5 rounded-full ${warranty === "yes" ? "bg-green-500" : "bg-gray-400"}`}
          />
          <Text className="ml-2">{t("FixedAssets.Yes")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setWarranty("no");
            clearError("warranty");
            clearError("warrantyDates");
          }}
          className="flex-row items-center"
        >
          <View
            className={`w-5 h-5 rounded-full ${warranty === "no" ? "bg-green-500" : "bg-gray-400"}`}
          />
          <Text className="ml-2">{t("FixedAssets.No")}</Text>
        </TouchableOpacity>
      </View>
      <FieldError field="warranty" />

      {warranty === "yes" && (
        <>
          {/* Purchased Date */}
          <Text className="pt-5 pb-3">{t("FixedAssets.PurchasedDate")} *</Text>
          <TouchableOpacity
            onPress={() => setShowPurchasedDatePicker((p) => !p)}
          >
            <View className="border border-[#F4F4F4] p-4 rounded-full flex-row bg-gray-100 justify-between">
              <Text>
                {purchasedDate
                  ? formatDate(purchasedDate)
                  : t("CurrentAssets.PurchaseDate")}
              </Text>
              <Icon name="calendar-outline" size={20} color="#6B7280" />
            </View>
          </TouchableOpacity>
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
                        clearError("warrantyDates");
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
                      clearError("warrantyDates");
                    }
                  }
                  setShowPurchasedDatePicker(false);
                }}
                maximumDate={new Date()}
              />
            ))}

          {errorMessage ? (
            <Text className="text-red-500 mt-2">{errorMessage}</Text>
          ) : null}
          <FieldError field="warrantypurchasedDate" />

          {/* Expire Date */}
          <Text className="pt-5 pb-3">
            {t("FixedAssets.WarrantyExpireDate")} *
          </Text>
          <TouchableOpacity onPress={() => setShowExpireDatePicker((p) => !p)}>
            <View className="border border-[#F4F4F4] p-4 rounded-full flex-row bg-gray-100 justify-between">
              <Text>
                {expireDate
                  ? formatDate(expireDate)
                  : t("CurrentAssets.ExpireDate")}
              </Text>
              <Icon name="calendar-outline" size={20} color="#6B7280" />
            </View>
          </TouchableOpacity>
          {showExpireDatePicker &&
            (Platform.OS === "ios" ? (
              <View className="justify-center items-center z-50 bg-gray-100 rounded-lg">
                <DateTimePicker
                  mode="date"
                  display="inline"
                  style={{ width: 320, height: 260 }}
                  onChange={onExpireDateChange}
                  value={expireDate || new Date()}
                  minimumDate={purchasedDate || undefined}
                  maximumDate={maxDate}
                />
              </View>
            ) : (
              <DateTimePicker
                mode="date"
                display="default"
                onChange={onExpireDateChange}
                value={expireDate || new Date()}
                minimumDate={purchasedDate || undefined}
                maximumDate={maxDate}
              />
            ))}

          {errorMessage ? (
            <Text className="text-red-500 mt-2">{errorMessage}</Text>
          ) : null}
          <FieldError field="warrantyDatesexpireDate" />

          {/* Warranty Status */}
          <Text className="mt-4 text-sm">
            {t("FixedAssets.WarrantyCoverageStatus")}
          </Text>
          <View className="border border-[#F4F4F4] rounded-full bg-gray-100 p-2 mt-2">
            <Text
              style={{
                color:
                  purchasedDate && expireDate
                    ? expireDate.getTime() > new Date().getTime()
                      ? "#26D041"
                      : "#FF0000"
                    : "#6B7280",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              {purchasedDate && expireDate
                ? expireDate.getTime() > new Date().getTime()
                  ? t("FixedAssets.UnderWarranty")
                  : t("FixedAssets.Expired")
                : t("CurrentAssets.Status")}
            </Text>
          </View>
        </>
      )}
    </>
  );

  const renderUnitsAndPrice = () => (
    <>
      <Text className="mt-4 text-sm pb-2">
        {t("FixedAssets.NumberOfUnits")} *
      </Text>
      <TextInput
        className="border border-[#F4F4F4] p-3 pl-4 h-[50px] rounded-3xl bg-gray-100"
        placeholder={t("FixedAssets.NumberOfUnitsIsRequired")}
        value={numberOfUnits}
        onChangeText={(text) => {
          setNumberOfUnits(formatDecimalInput(text));
          clearError("numberOfUnits");
        }}
        keyboardType="numeric"
      />
      <FieldError field="numberOfUnits" />

      <Text className="mt-4 text-sm pb-2">{t("FixedAssets.UnitPrice")} *</Text>
      <TextInput
        className="border border-[#F4F4F4] p-3 pl-4 rounded-3xl h-[50px] bg-gray-100"
        placeholder={t("FixedAssets.UnitPriceIsRequired")}
        value={formatWithCommas(unitPrice)}
        onChangeText={(text) => {
          handleNumericInput(text, setUnitPrice);
          clearError("unitPrice");
        }}
        keyboardType="numeric"
      />
      <FieldError field="unitPrice" />

      <Text className="mt-4 text-sm pb-2">{t("FixedAssets.TotalPrice")} *</Text>
      <View className="border border-[#F4F4F4] p-4 pl-4 rounded-full bg-gray-100">
        <Text>
          {totalPrice.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </View>
    </>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      enabled
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1 }}>
        
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 pb-20 bg-white "
          keyboardShouldPersistTaps="handled"
        >
          <CustomHeader
            title={farmName}
            navigation={navigation}
            onBackPress={() =>
              navigation.navigate("FarmFixDashBoard", { farmId, farmName })
            }
          />

          {/* Tab bar */}
          <View className="flex-row mt-2 justify-center">
            <View className="w-1/2">
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Main", {
                    screen: "FarmCurrectAssets",
                    params: { farmId, farmName },
                  } as any)
                }
              >
                <Text className="text-black font-semibold text-center text-lg">
                  {t("FixedAssets.CurrentAssets")}
                </Text>
                <View className="border-t-[2px] border-[#D9D9D9]" />
              </TouchableOpacity>
            </View>
            <View className="w-1/2">
              <TouchableOpacity>
                <Text className="text-black text-center font-semibold text-lg">
                  {t("FixedAssets.FixedAssets")}
                </Text>
                <View className="border-t-[2px] border-black" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="p-4">
            {/* ── Category ── */}
            <Text className="mt-4 text-sm pb-2">
              {t("CurrentAssets.Category")} *
            </Text>
            <DropdownButton
              value={getLabelFromOptions(categoryOptions, category)}
              placeholder={t("CurrentAssets.Selectcategory")}
              onPress={() => openModal("category")}
              hasError={!!errors.category}
            />
            <FieldError field="category" />

            {category === "Machine and Vehicles" ? (
              <View className="flex-1">
                {/* Asset */}
                <Text className="mt-4 text-sm pb-2">
                  {t("FixedAssets.Asset")} *
                </Text>
                <DropdownButton
                  value={getLabelFromOptions(machineAssetOptions, asset)}
                  placeholder={t("FixedAssets.SelectAssetIsRequired")}
                  onPress={() => openModal("machineAsset")}
                  hasError={!!errors.asset}
                />
                <FieldError field="asset" />

                {/* Asset Type */}
                {asset && assetTypesForAssets[asset]?.length > 0 && (
                  <>
                    <Text className="mt-4 text-sm pb-2">
                      {t("FixedAssets.SelectAssetTypeIsRequired")} *
                    </Text>
                    <DropdownButton
                      value={getLabelFromOptions(
                        assetTypesForAssets[asset] || [],
                        assetType,
                      )}
                      placeholder={t("FixedAssets.SelectAssetTypeIsRequired")}
                      onPress={() => openModal("assetType")}
                      hasError={!!errors.assetType}
                    />
                    <FieldError field="assetType" />
                  </>
                )}

                {assetType === "Other" && (
                  <View className="mt-4">
                    <Text>{t("FixedAssets.MentionOther")}</Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-2 rounded-3xl h-[50px] mt-2 bg-gray-100"
                      placeholder={t("FixedAssets.MentionOther")}
                      value={mentionOther}
                      onChangeText={(v) => {
                        setMentionOther(v);
                        clearError("mentionOther");
                      }}
                    />
                    <FieldError field="mentionOther" />
                  </View>
                )}

                {/* Brand */}
                {asset && brandTypesForAssets[asset]?.length > 0 && (
                  <>
                    <Text className="mt-4 text-sm pb-2">
                      {t("FixedAssets.SelectBrand")} *
                    </Text>
                    <DropdownButton
                      value={getLabelFromOptions(
                        brandTypesForAssets[asset] || [],
                        brand,
                      )}
                      placeholder={t("FixedAssets.SelectBrand")}
                      onPress={() => openModal("machineBrand")}
                      hasError={!!errors.brand}
                    />
                    <FieldError field="brand" />
                  </>
                )}

                {brand === "Other" && (
                  <View>
                    <Text className="mt-4 text-sm pb-2">
                      {t("FixedAssets.MentionOtherBrandName")} *
                    </Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-4 rounded-3xl h-[50px] bg-gray-100 pl-4"
                      placeholder={t("FixedAssets.EnterBrandName")}
                      value={customBrand}
                      onChangeText={(v) => {
                        setCustomBrand(v);
                        clearError("customBrand");
                      }}
                    />
                    <FieldError field="customBrand" />
                  </View>
                )}

                {renderUnitsAndPrice()}
                {renderWarrantySection()}
              </View>
            ) : category === "Land" ? (
              <View>
                <Text className="mt-4 text-sm pb-2">
                  {t("FixedAssets.LandName")} *
                </Text>
                <TextInput
                  className="border border-[#F4F4F4] p-3 pl-4 rounded-3xl h-[50px] bg-gray-100"
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
                <FieldError field="landName" />
                {/* Extent */}
                <Text className="mt-4 text-sm pb-2">
                  {t("FixedAssets.Extent")} *
                </Text>
                <View className="flex-row items-center justify-between w-full">
                  {[
                    {
                      label: t("FixedAssets.ha"),
                      value: extentha,
                      setter: setExtentha,
                    },
                    {
                      label: t("FixedAssets.ac"),
                      value: extentac,
                      setter: setExtentac,
                    },
                    {
                      label: t("FixedAssets.p"),
                      value: extentp,
                      setter: setExtentp,
                    },
                  ].map(({ label, value, setter }) => (
                    <View
                      key={label}
                      className="flex-row items-center gap-2"
                    >
                      <Text className="text-right">{label}</Text>
                      <TextInput
                        className="border border-[#F4F4F4] p-2 px-4 w-20 rounded-3xl h-[50px] bg-gray-100"
                        value={value}
                        onChangeText={(text) => {
                          setter(text.replace(/[-.*#]/g, ""));
                          clearError("extent");
                        }}
                        keyboardType="numeric"
                      />
                    </View>
                  ))}
                </View>
                <FieldError field="extent" />

                {/* Land Category */}
                <Text className="mt-4 text-sm pb-2">
                  {t("FixedAssets.Ownership")} *
                </Text>
                <DropdownButton
                  value={getLabelFromOptions(
                    landOwnershipOptions,
                    landownership,
                  )}
                  placeholder={t("FixedAssets.SelectOwnershipCategoryIsRequired")}
                  onPress={() => openModal("landOwnership")}
                  hasError={!!errors.landownership}
                />
                <FieldError field="landownership" />

                {/* Own */}
                {landownership === "Own" && (
                  <View>
                    <Text className="mt-4 text-sm pb-2">
                      {t("FixedAssets.EstimatedValue")} *
                    </Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-3 rounded-3xl h-[50px] bg-[#F4F4F4] pl-4"
                      placeholder={t("FixedAssets.EstimatedBuildingValue")}
                      value={formatWithCommas(estimateValue)}
                      onChangeText={(text) => {
                        handleNumericInput(text, setEstimatedValue);
                        clearError("estimateValue");
                      }}
                      keyboardType="numeric"
                    />
                    <FieldError field="estimateValue" />
                  </View>
                )}

                {/* Lease */}
                {landownership === "Lease" && (
                  <View>
                    <Text className="mt-4 pb-2">
                      {t("FixedAssets.LeaseStartDate")} *
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowStartDatePicker((p) => !p)}
                    >
                      <View className="border border-[#F4F4F4] p-4 rounded-full flex-row bg-gray-100 justify-between">
                        <Text>
                          {startDate
                            ? formatDate(startDate)
                            : t("Main.SelectStartDate")}
                        </Text>
                        <Icon
                          name="calendar-outline"
                          size={20}
                          color="#6B7280"
                        />
                      </View>
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
                              } else setShowStartDatePicker(false);
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
                            } else setShowStartDatePicker(false);
                          }}
                          maximumDate={new Date()}
                        />
                      ))}

                    <Text className="mt-4 text-sm pb-2">
                      {t("FixedAssets.Duration")} *
                    </Text>
                    <View className="items-center flex-row justify-center">
                      <Text className="w-[20%] text-right pr-2">
                        {t("FixedAssets.Years")}
                      </Text>
                      <TextInput
                        className="border border-[#F4F4F4] p-2 w-[30%] px-4 rounded-3xl h-[50px] bg-gray-100"
                        value={durationYears}
                        onChangeText={(text) => {
                          setDurationYears(
                            text.replace(/[-.*#,]/g, "") === "0"
                              ? ""
                              : text.replace(/[-.*#,]/g, ""),
                          );
                          clearError("duration");
                        }}
                        keyboardType="numeric"
                      />
                      <Text className="w-[20%] text-right pr-2">
                        {t("FixedAssets.Months")}
                      </Text>
                      <TextInput
                        className="border border-[#F4F4F4] p-2 w-[30%] px-4 rounded-3xl h-[50px] bg-[#F4F4F4]"
                        value={durationMonths}
                        onChangeText={(text) => {
                          const c = text.replace(/[-.*#]/g, "");
                          const n = parseInt(c, 10);
                          if (c === "" || (n >= 0 && n <= 12)) {
                            setDurationMonths(c);
                            clearError("duration");
                          }
                        }}
                        keyboardType="numeric"
                        maxLength={2}
                      />
                    </View>
                    <FieldError field="duration" />

                    <Text className="pb-2 mt-4 text-sm">
                      {t("FixedAssets.AnnualLeaseAmount")} *
                    </Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-3 rounded-3xl h-[50px] bg-[#F4F4F4] pl-4"
                      placeholder={t("FixedAssets.EnterAnnualLeasedAmount")}
                      value={formatWithCommas(leastAmountAnnually)}
                      onChangeText={(text) => {
                        handleNumericInput(text, setLeastAmountAnnually);
                        clearError("leastAmountAnnually");
                      }}
                      keyboardType="numeric"
                    />
                    <FieldError field="leastAmountAnnually" />
                  </View>
                )}

                {/* Permitted */}
                {landownership === "Permitted" && (
                  <View className="mt-4">
                    <Text className="pb-2">
                      {t("FixedAssets.IssuedDate")} *
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowIssuedDatePicker((p) => !p)}
                    >
                      <View className="border border-[#F4F4F4] p-4 rounded-full flex-row bg-[#F4F4F4] justify-between">
                        <Text>
                          {issuedDate
                            ? formatDate(issuedDate)
                            : t("Main.SelectStartDate")}
                        </Text>
                        <Icon
                          name="calendar-outline"
                          size={20}
                          color="#6B7280"
                        />
                      </View>
                    </TouchableOpacity>
                    <FieldError field="issuedDate" />
                    {showIssuedDatePicker &&
                      (Platform.OS === "ios" ? (
                        <View className="justify-center items-center z-50 bg-[#F4F4F4] rounded-lg">
                          <DateTimePicker
                            value={issuedDate || new Date()}
                            mode="date"
                            display="inline"
                            style={{ width: 320, height: 260 }}
                            onChange={onIssuedDateChange}
                            maximumDate={new Date()}
                          />
                        </View>
                      ) : (
                        <DateTimePicker
                          value={issuedDate || new Date()}
                          mode="date"
                          display="default"
                          onChange={onIssuedDateChange}
                          maximumDate={new Date()}
                        />
                      ))}
                    <Text className="pb-2 mt-4">
                      {t("FixedAssets.permitFeeAnnuallyLKR")} *
                    </Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-3 rounded-3xl h-[50px] bg-[#F4F4F4] pl-4"
                      placeholder={t("FixedAssets.EnterAnnualPermitFee")}
                      value={formatWithCommas(permitFeeAnnually)}
                      onChangeText={(text) => {
                        handleNumericInput(text, setPermitFeeAnnually);
                        clearError("permitFeeAnnually");
                      }}
                      keyboardType="numeric"
                    />
                    <FieldError field="permitFeeAnnually" />
                  </View>
                )}

                {/* Shared */}
                {landownership === "Shared" && (
                  <View className="mt-4">
                    <Text className="pb-2">
                      {t("FixedAssets.AnnualPaymentFee")} *
                    </Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-3 rounded-3xl h-[50px] bg-[#F4F4F4] pl-4"
                      value={formatWithCommas(paymentAnnually)}
                      onChangeText={(text) => {
                        handleNumericInput(text, setPaymentAnnually);
                        clearError("paymentAnnually");
                      }}
                      keyboardType="numeric"
                      placeholder={t("FixedAssets.EnterAnnualPaymentFee")}
                    />
                    <FieldError field="paymentAnnually" />
                  </View>
                )}

                {/* Land Fenced */}
                <View className="justify-center">
                  <Text className="pt-5 pb-3 font-bold">
                    {t("FixedAssets.IsTheLandFenced")} *
                  </Text>
                  <View className="flex-row justify-around mb-1">
                    {["yes", "no"].map((opt) => (
                      <TouchableOpacity
                        key={opt}
                        onPress={() => {
                          setLandFenced(opt);
                          clearError("landFenced");
                        }}
                        className="flex-row items-center"
                      >
                        <View
                          className={`w-5 h-5 rounded-full ${landFenced === opt ? "bg-green-500" : "bg-gray-400"}`}
                        />
                        <Text className="ml-2">{t(`FixedAssets.${opt}`)}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <FieldError field="landFenced" />

                  <Text className="pt-5 pb-3 font-bold">
                    {t("FixedAssets.DoesTheLandHavePerennialCrops")} *
                  </Text>
                  <View className="flex-row justify-around mb-1">
                    {["yes", "no"].map((opt) => (
                      <TouchableOpacity
                        key={opt}
                        onPress={() => {
                          setPerennialCrop(opt);
                          clearError("perennialCrop");
                        }}
                        className="flex-row items-center"
                      >
                        <View
                          className={`w-5 h-5 rounded-full ${perennialCrop === opt ? "bg-green-500" : "bg-gray-400"}`}
                        />
                        <Text className="ml-2">{t(`FixedAssets.${opt}`)}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <FieldError field="perennialCrop" />
                </View>
              </View>
            ) : category === "Tools" ? (
              <View className="flex-1">
                <Text className="mt-4 text-sm">{t("FixedAssets.Asset")} *</Text>
                <View className="mt-2">
                  <DropdownButton
                    value={getLabelFromOptions(toolAssetOptions, assetname)}
                    placeholder={t("FixedAssets.SelectAssetIsRequired")}
                    onPress={() => openModal("toolAsset")}
                    hasError={!!errors.assetname}
                  />
                </View>
                <FieldError field="assetname" />

                {assetname === "Other" && (
                  <View>
                    <Text className="mt-4 text-sm pb-2">
                      {t("FixedAssets.MentionOtherDetails")} *
                    </Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-4 rounded-3xl h-[50px] bg-[#F4F4F4] pl-4"
                      value={othertool}
                      onChangeText={(v) => {
                        setOthertool(v);
                        clearError("othertool");
                      }}
                      placeholder={t("FixedAssets.MentionOtherDetails")}
                    />
                    <FieldError field="othertool" />
                  </View>
                )}

                <Text className="mt-4 text-sm pb-2">
                  {t("FixedAssets.Brand")} *
                </Text>
                <DropdownButton
                  value={getLabelFromOptions(toolBrandOptions, toolbrand)}
                  placeholder={t("FixedAssets.SelectBrand")}
                  onPress={() => openModal("toolBrand")}
                  hasError={!!errors.toolbrand}
                />
                <FieldError field="toolbrand" />

                {toolbrand === "Other" && (
                  <View>
                    <Text className="mt-4 text-sm pb-2">
                      {t("FixedAssets.MentionOtherBrandName")} *
                    </Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-4 rounded-3xl h-[50px] bg-[#F4F4F4] pl-4"
                      placeholder={t("FixedAssets.EnterBrandName")}
                      value={customBrand}
                      onChangeText={(v) => {
                        setCustomBrand(v);
                        clearError("customBrand");
                      }}
                    />
                    <FieldError field="customBrand" />
                  </View>
                )}

                {renderUnitsAndPrice()}
                {renderWarrantySection()}
              </View>
            ) : (
              <View>
                <Text className="mt-4 text-sm pb-2">
                  {t("FixedAssets.Type")} *
                </Text>
                <DropdownButton
                  value={getLabelFromOptions(buildingTypeOptions, type)}
                  placeholder={t("FixedAssets.SelectAssetTypeIsRequired")}
                  onPress={() => openModal("buildingType")}
                  hasError={!!errors.type}
                />
                <FieldError field="type" />

                <Text className="mt-4 text-sm pb-2">
                  {t("FixedAssets.BuildingName")} *
                </Text>
                <TextInput
                  className="border border-[#F4F4F4] p-3 pl-4 rounded-3xl h-[50px] bg-[#F4F4F4]"
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
                <FieldError field="buildingName" />

                <Text className="mt-4 text-sm pb-2">
                  {t("FixedAssets.FloorArea")} *
                </Text>
                <TextInput
                  className="border border-[#F4F4F4] p-3 pl-4 rounded-3xl h-[50px] bg-[#F4F4F4]"
                  placeholder={t("FixedAssets.EnterFloorArea")}
                  value={floorArea}
                  onChangeText={(text) => {
                    setFloorArea(formatDecimalInput(text));
                    clearError("floorArea");
                  }}
                  keyboardType="numeric"
                />
                <FieldError field="floorArea" />

                <Text className="mt-4 text-sm pb-2">
                  {t("FixedAssets.Ownership")} *
                </Text>
                <DropdownButton
                  value={getLabelFromOptions(ownershipOptions, ownership)}
                  placeholder={t("FixedAssets.SelectOwnershipCategoryIsRequired")}
                  onPress={() => openModal("buildingOwnership")}
                  hasError={!!errors.ownership}
                />
                <FieldError field="ownership" />

                {/* Own Building */}
                {ownership === "Own Building (with title ownership)" && (
                  <View>
                    <Text className="mt-4 text-sm pb-2">
                      {t("FixedAssets.EstimatedBuildingValue")} *
                    </Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-3 rounded-3xl h-[50px] bg-[#F4F4F4] pl-4"
                      placeholder={t("FixedAssets.EnterEstimatedValue")}
                      value={formatWithCommas(estimateValue)}
                      onChangeText={(text) => {
                        handleNumericInput(text, setEstimatedValue);
                        clearError("estimateValue");
                      }}
                      keyboardType="numeric"
                    />
                    <FieldError field="estimateValue" />
                  </View>
                )}

                {/* Leased Building */}
                {ownership === "Leased Building" && (
                  <View className="mt-4">
                    <Text className="pb-2">{t("FixedAssets.LeaseStartDate")} *</Text>
                    <TouchableOpacity
                      onPress={() => setShowStartDatePicker((p) => !p)}
                    >
                      <View className="border border-[#F4F4F4] p-4 rounded-full flex-row bg-[#F4F4F4] justify-between">
                        <Text>
                          {startDate
                            ? formatDate(startDate)
                            : t("Main.SelectStartDate")}
                        </Text>
                        <Icon
                          name="calendar-outline"
                          size={20}
                          color="#6B7280"
                        />
                      </View>
                    </TouchableOpacity>
                    <FieldError field="startDate" />
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
                              } else setShowStartDatePicker(false);
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
                            } else setShowStartDatePicker(false);
                          }}
                          maximumDate={new Date()}
                        />
                      ))}

                    <Text className="mt-4 text-sm pb-2">
                      {t("FixedAssets.Duration")} *
                    </Text>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Text className="w-[20%] text-right pr-2">
                          {t("FixedAssets.Years")}
                        </Text>
                        <TextInput
                          className="border border-[#F4F4F4] p-2 text-left px-4 rounded-3xl h-[50px] bg-[#F4F4F4] w-[30%]"
                          value={durationYears}
                          onChangeText={(text) => {
                            setDurationYears(text.replace(/[-.*#]/g, ""));
                            clearError("duration");
                          }}
                          keyboardType="numeric"
                        />
                        <Text className="w-[20%] text-right pr-2">
                          {t("FixedAssets.Months")}
                        </Text>
                        <TextInput
                          className="border border-[#F4F4F4] p-2 w-[30%] px-4 rounded-3xl h-[50px] bg-[#F4F4F4]"
                          value={durationMonths}
                          onChangeText={(text) => {
                            const c = text.replace(/[-.*#]/g, "");
                            const n = parseInt(c, 10);
                            if (c === "" || (n >= 0 && n <= 12)) {
                              setDurationMonths(c);
                              clearError("duration");
                            }
                          }}
                          keyboardType="numeric"
                          maxLength={2}
                        />
                      </View>
                    </View>
                    <FieldError field="duration" />

                    <Text className="pt-[5%] pb-2">
                      {t("FixedAssets.AnnualLeaseAmount")} *
                    </Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-3 rounded-3xl h-[50px] bg-[#F4F4F4] pl-4"
                      placeholder={t("FixedAssets.EnterAnnualLeasedAmount")}
                      value={formatWithCommas(leastAmountAnnually)}
                      onChangeText={(text) => {
                        handleNumericInput(text, setLeastAmountAnnually);
                        clearError("leastAmountAnnually");
                      }}
                      keyboardType="numeric"
                    />
                    <FieldError field="leastAmountAnnually" />
                  </View>
                )}

                {/* Permitted Building */}
                {ownership === "Permitted Building" && (
                  <View className="mt-4">
                    <Text className="pb-2">
                      {t("FixedAssets.IssuedDate")} *
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowLbIssuedDatePicker((p) => !p)}
                    >
                      <View className="border border-[#F4F4F4] p-4 rounded-full flex-row bg-[#F4F4F4] justify-between">
                        <Text>
                          {lbissuedDate
                            ? formatDate(lbissuedDate)
                            : "Select Date"}
                        </Text>
                        <Icon
                          name="calendar-outline"
                          size={20}
                          color="#6B7280"
                        />
                      </View>
                    </TouchableOpacity>
                    <FieldError field="lbissuedDate" />
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
                              } else setShowLbIssuedDatePicker(false);
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
                            } else setShowLbIssuedDatePicker(false);
                          }}
                          maximumDate={new Date()}
                        />
                      ))}

                    <Text className="mt-4 pb-2">
                      {t("FixedAssets.AnnualPermitFee")} *
                    </Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-3 rounded-3xl h-[50px] bg-[#F4F4F4] pl-4"
                      placeholder={t("FixedAssets.EnterAnnualPermitFee")}
                      value={formatWithCommas(permitFeeAnnually)}
                      onChangeText={(text) => {
                        handleNumericInput(text, setPermitFeeAnnually);
                        clearError("permitFeeAnnually");
                      }}
                      keyboardType="numeric"
                    />
                    <FieldError field="permitFeeAnnually" />
                  </View>
                )}

                {/* Shared / No Ownership */}
                {ownership === "Shared / No Ownership" && (
                  <View className="mt-4">
                    <Text className="pb-2">
                      {t("FixedAssets.AnnualPaymentFee")} *
                    </Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-3 rounded-3xl h-[50px] bg-[#F4F4F4] pl-4"
                      value={formatWithCommas(paymentAnnually)}
                      onChangeText={(text) => {
                        handleNumericInput(text, setPaymentAnnually);
                        clearError("paymentAnnually");
                      }}
                      keyboardType="numeric"
                      placeholder={t("FixedAssets.EnterAnnualPaymentFee")}
                    />
                    <FieldError field="paymentAnnually" />
                  </View>
                )}

                {/* General Condition */}
                <Text className="mt-4 text-sm pb-2">
                  {t("FixedAssets.GeneralCondition")} *
                </Text>
                <DropdownButton
                  value={getLabelFromOptions(
                    generalConditionOptions,
                    generalCondition,
                  )}
                  placeholder={t("FixedAssets.SelectGeneralConditionIsRequired")}
                  onPress={() => openModal("generalCondition")}
                  hasError={!!errors.generalCondition}
                />
                <FieldError field="generalCondition" />
              </View>
            )}

            {/* ── Submit Button ── */}
            <View className="flex-1 items-center pt-8 mb-16 ">
              <TouchableOpacity
                className={`${category !== "Machine and Vehicles" &&
                  category !== "Tools" &&
                  warranty === "yes" &&
                  purchasedDate &&
                  expireDate &&
                  expireDate < new Date()
                  ? "bg-gray-400"
                  : "bg-gray-900"
                  } p-3 rounded-3xl mb-6 h-[50px] w-2/3`}
                onPress={submitData}
                disabled={
                  loading ||
                  !!(
                    category !== "Machine and Vehicles" &&
                    category !== "Tools" &&
                    warranty === "yes" &&
                    purchasedDate &&
                    expireDate &&
                    expireDate < new Date()
                  )
                }
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.25,
                  shadowRadius: 6,
                  elevation: 8,
                }}
              >
                {loading ? (
                  <ActivityIndicator size="large" color="white" />
                ) : (
                  <Text className="text-white text-base text-center">
                    {category !== "Machine and Vehicles" &&
                      category !== "Tools" &&
                      warranty === "yes" &&
                      purchasedDate &&
                      expireDate &&
                      expireDate < new Date()
                      ? t("FixedAssets.Expired")
                      : t("FixedAssets.AddAsset")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Category */}
        <GlobalSearchModal
          visible={activeModal === "category"}
          onClose={closeModal}
          title={t("CurrentAssets.Category")}
          data={categoryOptions}
          selectedItems={category ? [category] : []}
          onSelect={(items) => {
            const val = items[0] || "";
            setCategory(val);
            clearError("category");
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
            setErrors({});
          }}
          searchPlaceholder={t("Main.Search...")}
        />

        {/* Machine Asset */}
        <GlobalSearchModal
          visible={activeModal === "machineAsset"}
          onClose={closeModal}
          title={t("FixedAssets.Asset")}
          data={machineAssetOptions}
          selectedItems={asset ? [asset] : []}
          onSelect={(items) => {
            setAsset(items[0] || "");
            setAssetType("");
            setBrand("");
            clearError("asset");
          }}
          searchPlaceholder={t("Main.Search...")}
        />

        {/* Asset Type (Machine) */}
        <GlobalSearchModal
          visible={activeModal === "assetType"}
          onClose={closeModal}
          title={t("FixedAssets.SelectAssetTypeIsRequired")}
          data={
            asset && assetTypesForAssets[asset]
              ? assetTypesForAssets[asset]
              : []
          }
          selectedItems={assetType ? [assetType] : []}
          onSelect={(items) => {
            setAssetType(items[0] || "");
            clearError("assetType");
          }}
          searchPlaceholder={t("Main.Search...")}
        />

        {/* Brand (Machine) */}
        <GlobalSearchModal
          visible={activeModal === "machineBrand"}
          onClose={closeModal}
          title={t("FixedAssets.SelectBrand")}
          data={
            asset && brandTypesForAssets[asset]
              ? brandTypesForAssets[asset]
              : []
          }
          selectedItems={brand ? [brand] : []}
          onSelect={(items) => {
            setBrand(items[0] || "");
            clearError("brand");
          }}
          searchPlaceholder={t("Main.Search...")}
        />

        {/* Land Ownership */}
        <GlobalSearchModal
          visible={activeModal === "landOwnership"}
          onClose={closeModal}
          title={t("FixedAssets.Ownership")}
          data={landOwnershipOptions}
          selectedItems={landownership ? [landownership] : []}
          onSelect={(items) => {
            setLandOwnership(items[0] || "");
            clearError("landownership");
          }}
          showSearch={false}
        />

        {/* Tool Asset */}
        <GlobalSearchModal
          visible={activeModal === "toolAsset"}
          onClose={closeModal}
          title={t("FixedAssets.Asset")}
          data={toolAssetOptions}
          selectedItems={assetname ? [assetname] : []}
          onSelect={(items) => {
            setAssetname(items[0] || "");
            setOthertool("");
            clearError("assetname");
          }}
          searchPlaceholder={t("Main.Search...")}
        />

        {/* Tool Brand */}
        <GlobalSearchModal
          visible={activeModal === "toolBrand"}
          onClose={closeModal}
          title={t("FixedAssets.Brand")}
          data={toolBrandOptions}
          selectedItems={toolbrand ? [toolbrand] : []}
          onSelect={(items) => {
            setToolbrand(items[0] || "");
            clearError("toolbrand");
          }}
          searchPlaceholder={t("Main.Search...")}
        />

        {/* Building Type */}
        <GlobalSearchModal
          visible={activeModal === "buildingType"}
          onClose={closeModal}
          title={t("FixedAssets.Type")}
          data={buildingTypeOptions}
          selectedItems={type ? [type] : []}
          onSelect={(items) => {
            setType(items[0] || "");
            clearError("type");
          }}
          showSearch={false}
        />

        {/* Building Ownership */}
        <GlobalSearchModal
          visible={activeModal === "buildingOwnership"}
          onClose={closeModal}
          title={t("FixedAssets.Ownership")}
          data={ownershipOptions}
          selectedItems={ownership ? [ownership] : []}
          onSelect={(items) => {
            setOwnership(items[0] || "");
            clearError("ownership");
          }}
          showSearch={false}
        />

        {/* General Condition */}
        <GlobalSearchModal
          visible={activeModal === "generalCondition"}
          onClose={closeModal}
          title={t("FixedAssets.GeneralCondition")}
          data={generalConditionOptions}
          selectedItems={generalCondition ? [generalCondition] : []}
          onSelect={(items) => {
            setGeneralCondition(items[0] || "");
            clearError("generalCondition");
          }}
          showSearch={false}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default FarmAddFixAssert;
