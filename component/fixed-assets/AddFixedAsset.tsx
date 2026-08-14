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
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { StatusBar, Platform } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/types";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
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

  // Temp values held while the iOS inline picker is open, committed only on OK.
  const [tempPurchasedDate, setTempPurchasedDate] = useState<Date>(new Date());
  const [tempExpireDate, setTempExpireDate] = useState<Date>(new Date());
  const [tempStartDate, setTempStartDate] = useState<Date>(new Date());
  const [tempIssuedDate, setTempIssuedDate] = useState<Date>(new Date());
  const [tempLbIssuedDate, setTempLbIssuedDate] = useState<Date>(new Date());

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
    setShowPurchasedDatePicker(false);
    setShowExpireDatePicker(false);
    setShowStartDatePicker(false);
    setShowIssuedDatePicker(false);
    setShowLbIssuedDatePicker(false);
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

  // Today at 23:59:59.999 — using this (instead of `new Date()`, which carries
  // the exact current time) as the picker ceiling is what guarantees "today"
  // is always selectable, on both Android and iOS.
  const getEndOfToday = (): Date => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
  };

  // ---------- Apply functions: run validation, then commit the date ----------
  const applyPurchasedDate = (date: Date) => {
    if (date > getEndOfToday()) {
      Alert.alert(
        t("FixedAssets.sorry"),
        t("FixedAssets.ThePurchaseDateCannotBeInTheFuture"),
        [{ text: t("Main.OK") }],
      );
      return;
    }
    setPurchasedDate(date);
    clearError("purchasedDate");
  };

  const applyExpireDate = (date: Date) => {
    if (purchasedDate && date < purchasedDate) {
      Alert.alert(
        t("FixedAssets.sorry"),
        t("FixedAssets.errorInvalidExpireDate"),
        [{ text: t("Main.OK") }],
      );
      return;
    }
    setExpireDate(date);
    setErrorMessage("");
    clearError("expireDate");
  };

  const applyStartDate = (date: Date) => {
    if (date > getEndOfToday()) {
      Alert.alert(
        t("FixedAssets.sorry"),
        t("FixedAssets.TheIssuedDateCannotBeInTheFuture"),
        [{ text: t("Main.OK") }],
      );
      return;
    }
    setStartDate(date);
    clearError("startDate");
  };

  const applyIssuedDate = (date: Date) => {
    if (date > getEndOfToday()) {
      Alert.alert(
        t("FixedAssets.sorry"),
        t("FixedAssets.TheIssuedDateCannotBeInTheFuture"),
        [{ text: t("Main.OK") }],
      );
      return;
    }
    setIssuedDate(date);
    clearError("issuedDate");
  };

  const applyLbIssuedDate = (date: Date) => {
    if (date > getEndOfToday()) {
      Alert.alert(
        t("FixedAssets.sorry"),
        t("FixedAssets.TheIssuedDateCannotBeInTheFuture"),
        [{ text: t("Main.OK") }],
      );
      return;
    }
    setLbIssuedDate(date);
    clearError("lbissuedDate");
  };

  // ---------- Open handlers: seed temp state, then show the picker ----------
  const handleOpenPurchasedPicker = () => {
    Keyboard.dismiss();
    setTempPurchasedDate(purchasedDate || new Date());
    setShowPurchasedDatePicker(true);
  };

  const handleOpenExpirePicker = () => {
    Keyboard.dismiss();
    setTempExpireDate(expireDate || purchasedDate || new Date());
    setShowExpireDatePicker(true);
  };

  const handleOpenStartPicker = () => {
    Keyboard.dismiss();
    setTempStartDate(startDate || new Date());
    setShowStartDatePicker(true);
  };

  const handleOpenIssuedPicker = () => {
    Keyboard.dismiss();
    setTempIssuedDate(issuedDate || new Date());
    setShowIssuedDatePicker(true);
  };

  const handleOpenLbIssuedPicker = () => {
    Keyboard.dismiss();
    setTempLbIssuedDate(lbissuedDate || new Date());
    setShowLbIssuedDatePicker(true);
  };

  // ---------- Android onChange: native dialog applies + closes itself ----------
  const onChangePurchasedDateAndroid = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    setShowPurchasedDatePicker(false);
    if (event.type === "set" && selectedDate) applyPurchasedDate(selectedDate);
  };

  const onChangeExpireDateAndroid = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    setShowExpireDatePicker(false);
    if (event.type === "set" && selectedDate) applyExpireDate(selectedDate);
  };

  const onChangeStartDateAndroid = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    setShowStartDatePicker(false);
    if (event.type === "set" && selectedDate) applyStartDate(selectedDate);
  };

  const onChangeIssuedDateAndroid = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    setShowIssuedDatePicker(false);
    if (event.type === "set" && selectedDate) applyIssuedDate(selectedDate);
  };

  const onChangeLbIssuedDateAndroid = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    setShowLbIssuedDatePicker(false);
    if (event.type === "set" && selectedDate) applyLbIssuedDate(selectedDate);
  };

  // ---------- iOS confirm (Modal OK button): commit temp value ----------
  const onConfirmPurchasedDateIOS = () => {
    applyPurchasedDate(tempPurchasedDate);
    setShowPurchasedDatePicker(false);
  };

  const onConfirmExpireDateIOS = () => {
    applyExpireDate(tempExpireDate);
    setShowExpireDatePicker(false);
  };

  const onConfirmStartDateIOS = () => {
    applyStartDate(tempStartDate);
    setShowStartDatePicker(false);
  };

  const onConfirmIssuedDateIOS = () => {
    applyIssuedDate(tempIssuedDate);
    setShowIssuedDatePicker(false);
  };

  const onConfirmLbIssuedDateIOS = () => {
    applyLbIssuedDate(tempLbIssuedDate);
    setShowLbIssuedDatePicker(false);
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
      : t("FixedAssets.Status");

  const ErrorText = ({ field }: { field: string }) =>
    errors[field] ? (
      <Text className="text-red-500 text-xs mt-1 ml-2">{errors[field]}</Text>
    ) : null;

  // Reusable date field: trigger button + Android native dialog + iOS Modal
  // (inline calendar with Cancel/OK). This is the pattern that reliably lets
  // the user pick "today" on iOS — nothing commits until OK is tapped.
  const DateField = ({
    value,
    placeholder,
    onOpen,
    showPicker,
    setShowPicker,
    tempDate,
    setTempDate,
    onConfirmIOS,
    onChangeAndroid,
    minimumDate,
    maximumDate,
    modalTitle,
  }: {
    value: Date | null;
    placeholder: string;
    onOpen: () => void;
    showPicker: boolean;
    setShowPicker: (v: boolean) => void;
    tempDate: Date;
    setTempDate: (d: Date) => void;
    onConfirmIOS: () => void;
    onChangeAndroid: (event: DateTimePickerEvent, selectedDate?: Date) => void;
    minimumDate?: Date;
    maximumDate?: Date;
    modalTitle: string;
  }) => (
    <>
      <TouchableOpacity
        onPress={onOpen}
        className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] justify-center flex-row items-center mt-2 mb-2"
      >
        <Text className={`flex-1 ${!value ? "text-[#6B7280]" : "text-black"}`}>
          {value ? formatDate(value) : placeholder}
        </Text>
        <EvilIcons name="calendar" size={28} color="#5e5d5d" />
      </TouchableOpacity>

      {Platform.OS === "android" ? (
        showPicker && (
          <DateTimePicker
            value={value || new Date()}
            mode="date"
            display="default"
            onChange={onChangeAndroid}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
        )
      ) : (
        <Modal
          transparent
          visible={showPicker}
          animationType="fade"
          onRequestClose={() => setShowPicker(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowPicker(false)}
            className="flex-1 bg-black/50 justify-center items-center p-4"
          >
            <TouchableWithoutFeedback>
              <View className="bg-white rounded-2xl p-4 w-full max-w-[340px] shadow-lg">
                <Text className="text-black font-bold text-base mb-2 px-2">
                  {modalTitle}
                </Text>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="inline"
                  onChange={(_, selectedDate) => {
                    if (selectedDate) setTempDate(selectedDate);
                  }}
                  minimumDate={minimumDate}
                  maximumDate={maximumDate}
                  themeVariant="light"
                />
                <View
                  className="flex-row justify-end mt-3 pr-2"
                  style={{ gap: 12 }}
                >
                  <TouchableOpacity
                    onPress={() => setShowPicker(false)}
                    className="px-4 py-2 rounded-lg"
                  >
                    <Text className="text-[#007AFF] font-semibold text-sm">
                      {t("Main.Cancel", "Cancel")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={onConfirmIOS}
                    className="bg-[#F7CA21] px-5 py-2 rounded-full"
                  >
                    <Text className="text-black font-semibold text-sm">
                      {t("Main.OK")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
        </Modal>
      )}
    </>
  );

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
      const nonZeroExtent = [extentha, extentac, extentp].filter(
        (f) => f && f !== "0",
      );
      if (nonZeroExtent.length === 0)
        newErrors.extent = t("FixedAssets.AtLeastOneExtentTypeIsRequired");
      if (!landFenced) newErrors.landFenced = t("FixedAssets.PleaseSelectAnOption");
      if (!landName) newErrors.landName = t("FixedAssets.LandNameIsRequired");
      if (!perennialCrop)
        newErrors.perennialCrop = t("FixedAssets.PleaseSelectAnOption");
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
      if (landownership === "Permitted" && !issuedDate)
        newErrors.issuedDate = t("FixedAssets.IssuedDateIsRequired");
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
      if (!warranty) newErrors.warranty = t("FixedAssets.PleaseSelectAnOption");
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
      if (!warranty) newErrors.warranty = t("FixedAssets.PleaseSelectAnOption");
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
          noResultsText = "No category found"
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
          noResultsText = "No assets found"
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
            noResultsText = "No ownership found"
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
            noResultsText = "No assets found"
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
            noResultsText = "No brand found"
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
            noResultsText = "No ownership found"
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
              placeholder={t("CurrentAssets.SelectCategory")}
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
                      placeholder={t("FixedAssets.AssetTypeSelect")}
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
                <Text className="text-[#070707] text-sm mt-2">{t("FixedAssets.Warranty")}</Text>
                <View className="flex-row mt-2 mb-4 justify-around">
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
                          ? t("FixedAssets.yes")
                          : t("FixedAssets.no")}
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
                    <DateField
                      value={purchasedDate}
                      placeholder={t("CurrentAssets.PurchaseDate")}
                      onOpen={handleOpenPurchasedPicker}
                      showPicker={showPurchasedDatePicker}
                      setShowPicker={setShowPurchasedDatePicker}
                      tempDate={tempPurchasedDate}
                      setTempDate={setTempPurchasedDate}
                      onConfirmIOS={onConfirmPurchasedDateIOS}
                      onChangeAndroid={onChangePurchasedDateAndroid}
                      maximumDate={getEndOfToday()}
                      modalTitle={t("FixedAssets.PurchasedDate")}
                    />
                    <ErrorText field="purchasedDate" />

                    {/* Expire date */}
                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.WarrantyExpireDate")} *
                    </Text>
                    <DateField
                      value={expireDate}
                      placeholder={t("CurrentAssets.ExpireDate")}
                      onOpen={handleOpenExpirePicker}
                      showPicker={showExpireDatePicker}
                      setShowPicker={setShowExpireDatePicker}
                      tempDate={tempExpireDate}
                      setTempDate={setTempExpireDate}
                      onConfirmIOS={onConfirmExpireDateIOS}
                      onChangeAndroid={onChangeExpireDateAndroid}
                      minimumDate={purchasedDate || undefined}
                      maximumDate={maxDate}
                      modalTitle={t("FixedAssets.WarrantyExpireDate")}
                    />
                    <ErrorText field="expireDate" />

                    {/* Status */}
                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.Status")}
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
                  maxLength={20}
                  autoCapitalize="sentences"
                  onChangeText={(text) => {
                    const trimmed = text.replace(/^\s+/, "");
                    const capitalized =
                      trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
                    setLandName(capitalized.slice(0, 20));
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
                    <DateField
                      value={startDate}
                      placeholder={t("FixedAssets.SelectDate")}
                      onOpen={handleOpenStartPicker}
                      showPicker={showStartDatePicker}
                      setShowPicker={setShowStartDatePicker}
                      tempDate={tempStartDate}
                      setTempDate={setTempStartDate}
                      onConfirmIOS={onConfirmStartDateIOS}
                      onChangeAndroid={onChangeStartDateAndroid}
                      maximumDate={getEndOfToday()}
                      modalTitle={t("FixedAssets.LeaseStartDate")}
                    />
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
                    <Text className="pb-2 text-sm">
                      {t("FixedAssets.IssuedDate")} *
                    </Text>
                    <DateField
                      value={issuedDate}
                      placeholder={t("FixedAssets.SelectDate")}
                      onOpen={handleOpenIssuedPicker}
                      showPicker={showIssuedDatePicker}
                      setShowPicker={setShowIssuedDatePicker}
                      tempDate={tempIssuedDate}
                      setTempDate={setTempIssuedDate}
                      onConfirmIOS={onConfirmIssuedDateIOS}
                      onChangeAndroid={onChangeIssuedDateAndroid}
                      maximumDate={getEndOfToday()}
                      modalTitle={t("FixedAssets.IssuedDate")}
                    />
                    <ErrorText field="issuedDate" />
                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.PermitFeeAnnuallyLKR")} *
                    </Text>
                    <TextInput
                      className="bg-[#F4F4F4] px-4  text-sm rounded-3xl h-[50px] mt-2 mb-2" placeholderTextColor="#585858"
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
                    <Text className="pb-2 text-sm">
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
                  <View className="flex-row justify-around mt-4  mb-2">
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
                            ? t("FixedAssets.yes")
                            : t("FixedAssets.no")}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <ErrorText field="landFenced" />

                  {/* Perennial crops */}
                  <Text className="text-[#070707] text-sm mt-2 font-bold">
                    {t("FixedAssets.DoesTheLandHavePerennialCrops")} *
                  </Text>
                  <View className="flex-row justify-around mt-4 mb-1">
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
                            ? t("FixedAssets.yes")
                            : t("FixedAssets.no")}
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
                <Text className="text-[#070707] text-sm mt-2">{t("FixedAssets.Warranty")}</Text>
                <View className="flex-row justify-around mt-2 mb-5">
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
                          ? t("FixedAssets.yes")
                          : t("FixedAssets.no")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <ErrorText field="warranty" />

                {warranty === "yes" && (
                  <>
                    {/* Purchased date */}
                    <Text className="pb-3 text-sm">
                      {t("FixedAssets.PurchasedDate")} *
                    </Text>
                    <DateField
                      value={purchasedDate}
                      placeholder={t("CurrentAssets.PurchaseDate")}
                      onOpen={handleOpenPurchasedPicker}
                      showPicker={showPurchasedDatePicker}
                      setShowPicker={setShowPurchasedDatePicker}
                      tempDate={tempPurchasedDate}
                      setTempDate={setTempPurchasedDate}
                      onConfirmIOS={onConfirmPurchasedDateIOS}
                      onChangeAndroid={onChangePurchasedDateAndroid}
                      maximumDate={getEndOfToday()}
                      modalTitle={t("FixedAssets.PurchasedDate")}
                    />
                    <ErrorText field="purchasedDate" />

                    {/* Expire date */}
                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.WarrantyExpireDate")} *
                    </Text>
                    <DateField
                      value={expireDate}
                      placeholder={t("CurrentAssets.ExpireDate")}
                      onOpen={handleOpenExpirePicker}
                      showPicker={showExpireDatePicker}
                      setShowPicker={setShowExpireDatePicker}
                      tempDate={tempExpireDate}
                      setTempDate={setTempExpireDate}
                      onConfirmIOS={onConfirmExpireDateIOS}
                      onChangeAndroid={onChangeExpireDateAndroid}
                      minimumDate={purchasedDate || undefined}
                      maximumDate={maxDate}
                      modalTitle={t("FixedAssets.WarrantyExpireDate")}
                    />
                    <ErrorText field="expireDate" />

                    {errorMessage ? (
                      <Text className="text-red-500 mt-2">{errorMessage}</Text>
                    ) : null}

                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.Status")}
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
                  placeholder={t("FixedAssets.AssetTypeSelect")}
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
                  className="bg-[#F4F4F4] px-4 rounded-3xl text-sm h-[50px] mt-2 mb-2" placeholderTextColor="#585858"
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
                  className="bg-[#F4F4F4] px-4 rounded-3xl text-sm h-[50px] mt-2 mb-2" placeholderTextColor="#585858"
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
                    <Text className="pb-2 text-sm">{t("FixedAssets.LeaseStartDate")} *</Text>
                    <DateField
                      value={startDate}
                      placeholder={t("FixedAssets.SelectDate")}
                      onOpen={handleOpenStartPicker}
                      showPicker={showStartDatePicker}
                      setShowPicker={setShowStartDatePicker}
                      tempDate={tempStartDate}
                      setTempDate={setTempStartDate}
                      onConfirmIOS={onConfirmStartDateIOS}
                      onChangeAndroid={onChangeStartDateAndroid}
                      maximumDate={getEndOfToday()}
                      modalTitle={t("FixedAssets.LeaseStartDate")}
                    />
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
                    <Text className="pb-2 text-sm">
                      {t("FixedAssets.IssuedDate")} *
                    </Text>
                    <DateField
                      value={lbissuedDate}
                      placeholder={t("FixedAssets.SelectDate")}
                      onOpen={handleOpenLbIssuedPicker}
                      showPicker={showLbIssuedDatePicker}
                      setShowPicker={setShowLbIssuedDatePicker}
                      tempDate={tempLbIssuedDate}
                      setTempDate={setTempLbIssuedDate}
                      onConfirmIOS={onConfirmLbIssuedDateIOS}
                      onChangeAndroid={onChangeLbIssuedDateAndroid}
                      maximumDate={getEndOfToday()}
                      modalTitle={t("FixedAssets.IssuedDate")}
                    />
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
                    <Text className="pb-2 text-sm">
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