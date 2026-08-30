import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  BackHandler,
  Keyboard,
} from "react-native";
import { StatusBar, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { environment } from "@/environment/environment";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";
import GlobalSearchModal from "../../component/common/GlobalSearchModal";
import CustomHeader from "../common/CustomHeader";
import assetData from "@/assets/jsons/fixed-asset/fixed-assets.json";
import { MaterialIcons, EvilIcons } from "@expo/vector-icons";
import LoadingPage from "../common/LoadingPage";
import CustomDatePicker from "../common/CustomDatePicker";

type RootStackParamList = {
  UpdateAsset: { selectedTools: number[]; category: string; toolId: any };
};
type Props = NativeStackScreenProps<RootStackParamList, "UpdateAsset">;

interface RawOption {
  labelKey: string;
  value: string;
}

interface ToolErrors {
  [toolId: string]: {
    extent?: string;
    ownership?: string;
    estimateValue?: string;
    startDate?: string;
    duration?: string;
    leastAmountAnnually?: string;
    issuedDate?: string;
    permitFeeAnnually?: string;
    paymentAnnually?: string;
    type?: string;
    floorArea?: string;
    generalCondition?: string;
    asset?: string;
    assetType?: string;
    mentionOther?: string;
    brand?: string;
    customBrand?: string;
    numberOfUnits?: string;
    unitPrice?: string;
    totalPrice?: string;
    purchaseDate?: string;
    expireDate?: string;
    landName?: string;
    buildingName?: string;
  };
}

const UpdateAsset: React.FC<Props> = ({ navigation, route }) => {
  const { selectedTools, category } = route.params;
  const { t, i18n } = useTranslation();

  const toOptions = (raw: RawOption[]) =>
    raw.map((item) => ({ label: t(item.labelKey), value: item.value }));

  const Machineasset = toOptions(assetData.machineasset);
  const ToolAssets = toOptions(assetData.assetOptions);
  const assetTypesForBuilding = toOptions(assetData.buildingTypeOptions);
  const generalConditionOptions = toOptions(assetData.generalConditionOptions);
  const ownershipCategories = toOptions(assetData.ownershipCategories);
  const landownershipCategories = toOptions(assetData.landOwnershipOptions);
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

  const getLabel = (
    options: { label: string; value: string }[] | undefined,
    val: string,
  ) => {
    if (!options || !val) return val;
    return options.find((o) => o.value === val)?.label ?? val;
  };

  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedDetails, setUpdatedDetails] = useState<any>({});

  const [showExpireDatePicker, setShowExpireDatePicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);

  const [purchaseDateError, setPurchaseDateError] = useState("");
  const [expireDateError, setExpireDateError] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  const [showOwnershipModal, setShowOwnershipModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showAssetTypeModal, setShowAssetTypeModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showToolBrandModal, setShowToolBrandModal] = useState(false);
  const [showGeneralConditionModal, setShowGeneralConditionModal] =
    useState(false);
  const [showPurchaseDatePicker, setShowPurchaseDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [fieldErrors, setFieldErrors] = useState<ToolErrors>({});

  const clearFieldError = (toolId: string, field: string) => {
    setFieldErrors((prev) => ({
      ...prev,
      [toolId]: { ...prev[toolId], [field]: "" },
    }));
  };

  const landownershipCategoriesWithDisplay = [
    { label: t("FixedAssets.OwnLand"), value: "Own" },
    { label: t("FixedAssets.LeaseLand"), value: "Lease" },
    { label: t("FixedAssets.PermittedLand"), value: "Permited" },
    { label: t("FixedAssets.SharedLand"), value: "Shared" },
  ];

  const getOwnershipDisplayText = (
    ownershipValue: string,
    category: string,
  ): string => {
    if (category === "Land") {
      switch (ownershipValue) {
        case "Own":
          return t("FixedAssets.OwnLand");
        case "Lease":
          return t("FixedAssets.LeaseLand");
        case "Permited":
          return t("FixedAssets.PermittedLand");
        case "Shared":
          return t("FixedAssets.SharedLand");
        default:
          return ownershipValue;
      }
    } else if (category === "Building and Infrastructures") {
      switch (ownershipValue) {
        case "Own Building (with title ownership)":
          return t("FixedAssets.OwnBuildingWithTitleOwnership");
        case "Leased Building":
          return t("FixedAssets.LeasedBuilding");
        case "Permitted Building":
          return t("FixedAssets.PermittedBuilding");
        case "Shared / No Ownership":
          return t("FixedAssets.SharedNoOwnership");
        default:
          return ownershipValue;
      }
    }
    return ownershipValue;
  };

  const validateField = (
    toolId: string,
    toolDetails: any,
    category: string,
  ) => {
    const errors: any = {};

    if (category === "Land") {
      if (
        !toolDetails.extentha &&
        !toolDetails.extentac &&
        !toolDetails.extentp
      ) {
        errors.extent = t("FixedAssets.AtLeastOneExtentTypeIsRequired");
      }
      if (!toolDetails.landName) {
        errors.landName = t("FixedAssets.LandNameIsRequired");
      }
      if (!toolDetails.ownership) {
        errors.ownership = t("FixedAssets.OwnershipIsRequired");
      }

      const ownershipDetails = toolDetails.ownershipDetails || {};
      switch (toolDetails.ownership) {
        case "Own":
          if (!ownershipDetails.estimateValue) {
            errors.estimateValue = t("FixedAssets.EstimatedValueIsRequired");
          }
          break;
        case "Lease":
          if (!ownershipDetails.startDate) {
            errors.startDate = t("FixedAssets.StartDateIsRequired");
          }
          if (
            !ownershipDetails.durationYears &&
            !ownershipDetails.durationMonths
          ) {
            errors.duration = t("FixedAssets.DurationIsRequired");
          }
          if (!ownershipDetails.leastAmountAnnually) {
            errors.leastAmountAnnually = t(
              "FixedAssets.AnnualLeaseAmountIsRequired",
            );
          }
          break;
        case "Permited":
          if (!ownershipDetails.issuedDate) {
            errors.issuedDate = t("FixedAssets.AnnualLeaseAmountIsRequired");
          }
          if (!ownershipDetails.permitFeeAnnually) {
            errors.permitFeeAnnually = t(
              "FixedAssets.AnnualPermitFeeIsRequired",
            );
          }
          break;
        case "Shared":
          if (!ownershipDetails.paymentAnnually) {
            errors.paymentAnnually = t(
              "FixedAssets.AnnualPaymentFeeIsRequired",
            );
          }
          break;
      }
    } else if (category === "Building and Infrastructures") {
      if (!toolDetails.type) {
        errors.type = t("FixedAssets.TypeIsRequired");
      }
      if (!toolDetails.buildingName) {
        errors.buildingName = t("FixedAssets.BuildingNameIsRequired");
      }
      if (!toolDetails.floorArea) {
        errors.floorArea = t("FixedAssets.FloorAreaIsRequired");
      }
      if (!toolDetails.ownership) {
        errors.ownership = t("FixedAssets.OwnershipIsRequired");
      }
      if (!toolDetails.generalCondition) {
        errors.generalCondition = t("FixedAssets.GeneralConditionIsRequired");
      }

      const ownershipDetails = toolDetails.ownershipDetails || {};
      switch (toolDetails.ownership) {
        case "Own Building (with title ownership)":
          if (!ownershipDetails.estimateValue) {
            errors.estimateValue = t("FixedAssets.EstimatedValueIsRequired");
          }
          break;
        case "Leased Building":
          if (!ownershipDetails.startDate) {
            errors.startDate = t("FixedAssets.StartDateIsRequired");
          }
          if (
            !ownershipDetails.durationYears &&
            !ownershipDetails.durationMonths
          ) {
            errors.duration = t("FixedAssets.DurationIsRequired");
          }
          if (!ownershipDetails.leastAmountAnnually) {
            errors.leastAmountAnnually = t(
              "FixedAssets.AnnualLeaseAmountIsRequired",
            );
          }
          break;
        case "Permitted Building":
          if (!ownershipDetails.issuedDate) {
            errors.issuedDate = t("FixedAssets.AnnualLeaseAmountIsRequired");
          }
          if (!ownershipDetails.permitFeeAnnually) {
            errors.permitFeeAnnually = t(
              "FixedAssets.AnnualPermitFeeIsRequired",
            );
          }
          break;
        case "Shared / No Ownership":
          if (!ownershipDetails.paymentAnnually) {
            errors.paymentAnnually = t(
              "FixedAssets.AnnualPaymentFeeIsRequired",
            );
          }
          break;
      }
    } else if (category === "Machine and Vehicles" || category === "Tools") {
      if (!toolDetails.asset) {
        errors.asset = t("FixedAssets.AssetIsRequired");
      }
      if (toolDetails.asset === "Other" && !toolDetails.mentionOther) {
        errors.mentionOther = t("FixedAssets.MentionOtherIsRequired");
      }
      if (!toolDetails.brand) {
        errors.brand = t("FixedAssets.BrandIsRequired");
      }
      if (toolDetails.brand === "Other" && !toolDetails.customBrand) {
        errors.customBrand =
          t("FixedAssets.MentionOtherBrandName") ||
          t("FixedAssets.BrandIsRequired");
      }
      if (!toolDetails.numberOfUnits) {
        errors.numberOfUnits = t("FixedAssets.NumberOfUnitsIsRequired");
      }
      if (!toolDetails.unitPrice) {
        errors.unitPrice = t("FixedAssets.UnitPriceIsRequired");
      }
      if (!toolDetails.totalPrice) {
        errors.totalPrice = t("FixedAssets.TotalPriceIsRequired");
      }
      if (toolDetails.warranty === "yes") {
        if (!toolDetails.ownershipDetails?.purchaseDate) {
          errors.purchaseDate = t("FixedAssets.PurchaseDateIsRequired");
        }
        if (!toolDetails.ownershipDetails?.expireDate) {
          errors.expireDate = t("FixedAssets.ExpireDateIsRequired");
        }
      }
    }

    return errors;
  };

  const validateAllTools = () => {
    let isValid = true;
    const newErrors: ToolErrors = {};

    for (const tool of tools) {
      const toolDetails = updatedDetails[tool.id];
      const errors = validateField(tool.id, toolDetails, tool.category);
      if (Object.keys(errors).length > 0) {
        isValid = false;
      }
      newErrors[tool.id] = errors;
    }

    setFieldErrors(newErrors);
    return isValid;
  };

  const parseDate = (
    dateStr: string | Date | null | undefined,
  ): Date | null => {
    if (!dateStr) return null;
    if (dateStr instanceof Date) return dateStr;
    const parts = dateStr.split("T")[0].split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return "";
    if (typeof date === "string") {
      if (/^\d{4}-\d{2}-\d{2}/.test(date)) {
        return date.split("T")[0];
      }
    }
    const d = typeof date === "string" ? parseDate(date) : date;
    if (!d || isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const getStartOfTomorrow = (): Date => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const validatePurchaseDate = (selectedDate: Date, toolId: string) => {
    if (selectedDate > new Date()) {
      setPurchaseDateError(t("FixedAssets.purchaseDateFutureError"));
      return false;
    }
    setPurchaseDateError("");
    clearFieldError(toolId, "purchaseDate");
    return true;
  };

  const validateExpireDate = (selectedDate: Date, toolId: string) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (selectedDate <= today) {
      setExpireDateError(
        t("FixedAssets.WarrantyExpireDateMustBeInTheFuture") ||
          "Warranty expire date must be in the future.",
      );
      return false;
    }
    const purchaseDate = updatedDetails[toolId]?.ownershipDetails?.purchaseDate
      ? new Date(updatedDetails[toolId].ownershipDetails.purchaseDate)
      : null;
    if (purchaseDate && selectedDate <= purchaseDate) {
      setExpireDateError(t("FixedAssets.expireDateAfterPurchaseError"));
      return false;
    }
    setExpireDateError("");
    clearFieldError(toolId, "expireDate");
    return true;
  };

  const handlePurchaseDateChange = (
    toolId: string,
    selectedDate: Date | undefined,
  ) => {
    if (selectedDate) {
      if (validatePurchaseDate(selectedDate, toolId)) {
        const formattedDate = formatDate(selectedDate);
        handleInputChange(
          toolId,
          "ownershipDetails.purchaseDate",
          formattedDate,
        );
        const expireDate = updatedDetails[toolId]?.ownershipDetails?.expireDate;
        if (expireDate) validateExpireDate(new Date(expireDate), toolId);
      }
    }
  };

  const handleExpireDateChange = (
    toolId: string,
    selectedDate: Date | undefined,
  ) => {
    if (selectedDate) {
      if (validateExpireDate(selectedDate, toolId)) {
        const formattedDate = formatDate(selectedDate);
        handleInputChange(toolId, "ownershipDetails.expireDate", formattedDate);
      }
    }
  };

  useEffect(() => {
    if (tools.length > 0) {
      const initialAsset = tools[0]?.id
        ? updatedDetails[tools[0].id]?.asset
        : null;
      if (initialAsset) setSelectedAsset(initialAsset);
    }
  }, [updatedDetails, tools]);

  const fetchSelectedTools = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${environment.API_BASE_URL}api/auth/fixedasset/${selectedTools}/${category}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = Array.isArray(response.data)
        ? response.data
        : [response.data];

      if (data) {
        setTools(data);
        setUpdatedDetails(
          data.reduce((acc: any, tool: any) => {
            let brandVal = tool.brand ?? "";
            let customBrandVal = "";

            if (tool.category === "Machine and Vehicles") {
              const brandList =
                (assetData.brandTypesForAssets as any)[tool.asset] || [];
              const isPredefined = brandList.some(
                (b: any) => b.value === tool.brand,
              );
              if (!isPredefined && tool.brand && brandList.length > 0) {
                brandVal = "Other";
                customBrandVal = tool.brand;
              }
            } else if (tool.category === "Tools") {
              const isPredefined = assetData.toolBrandOptions.some(
                (b: any) => b.value === tool.brand,
              );
              if (!isPredefined && tool.brand) {
                brandVal = "Other";
                customBrandVal = tool.brand;
              }
            }

            acc[tool.id] = {
              ...tool,
              brand: brandVal,
              customBrand: customBrandVal,
              ownership: normalizeOwnership(
                tool.ownership ?? "",
                tool.category,
              ),
            };
            return acc;
          }, {}),
        );
      }
    } catch (error) {
      console.error("Error fetching selected tools:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSelectedTools();
  }, [selectedTools]);

  const cleanNumber = (value: string) =>
    value ? value.replace(/,/g, "") : "0";

  const handleInputChange = (toolId: any, field: any, value: any) => {
    setUpdatedDetails((prevDetails: any) => {
      const fields = field.split(".");
      const toolDetails = { ...prevDetails[toolId] };

      if (fields.length > 1) {
        const [mainField, subField] = fields;
        toolDetails[mainField] = {
          ...toolDetails[mainField],
          [subField]: value,
        };
      } else {
        toolDetails[field] = value;
      }

      if (field === "numberOfUnits" || field === "unitPrice") {
        const numberOfUnits = parseInt(
          toolDetails.numberOfUnits?.toString().replace(/,/g, "") || "0",
        );
        const unitPrice = parseInt(
          toolDetails.unitPrice?.toString().replace(/,/g, "") || "0",
        );
        const total = numberOfUnits * unitPrice;
        toolDetails.totalPrice = total
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        clearFieldError(toolId, "totalPrice");
      }

      clearFieldError(toolId, field.split(".").pop() || field);

      return { ...prevDetails, [toolId]: toolDetails };
    });
  };

  const normalizeOwnership = (value: string, cat: string): string => {
    if (!value) return value;
    if (cat === "Land") {
      if (value === "Permitted" || value === "Permit") return "Permited";
    }
    if (cat === "Building and Infrastructures") {
      if (value === "Permit Building" || value === "Permitted Building")
        return "Permitted Building";
      if (
        value === "Own Building" ||
        value === "Own Building (with title ownership)"
      )
        return "Own Building (with title ownership)";
      if (value === "Leased Building" || value === "Lease Building")
        return "Leased Building";
      if (value === "Shared" || value === "Shared / No Ownership")
        return "Shared / No Ownership";
    }
    return value;
  };

  const translateCategory = (category: string): string => {
    const match = assetData.categoryOptions.find(
      (o: any) => o.value === category,
    );
    if (!match) return category;
    const lang = i18n.language
      ? i18n.language.startsWith("si")
        ? "si"
        : i18n.language.startsWith("ta")
          ? "ta"
          : "en"
      : "en";
    return match.translations[lang] || match.translations["en"] || category;
  };

  const handleUpdateTools = async () => {
    if (!validateAllTools()) {
      Alert.alert(t("Main.Sorry"), t("FixedAssets.PleaseFillRequiredFields"), [
        { text: t("Main.OK") },
      ]);
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      for (const tool of tools) {
        const { id, category } = tool;
        const updatedToolDetails = { ...updatedDetails[id] };

        if (category === "Land") {
          if (updatedToolDetails.extentha)
            updatedToolDetails.extentha = cleanNumber(
              updatedToolDetails.extentha.toString(),
            );
          if (updatedToolDetails.extentac)
            updatedToolDetails.extentac = cleanNumber(
              updatedToolDetails.extentac.toString(),
            );
          if (updatedToolDetails.extentp)
            updatedToolDetails.extentp = cleanNumber(
              updatedToolDetails.extentp.toString(),
            );
          if (updatedToolDetails.ownershipDetails) {
            const od = updatedToolDetails.ownershipDetails;
            if (od.estimateValue)
              od.estimateValue = cleanNumber(od.estimateValue.toString());
            if (od.leastAmountAnnually)
              od.leastAmountAnnually = cleanNumber(
                od.leastAmountAnnually.toString(),
              );
            if (od.permitFeeAnnually)
              od.permitFeeAnnually = cleanNumber(
                od.permitFeeAnnually.toString(),
              );
            if (od.paymentAnnually)
              od.paymentAnnually = cleanNumber(od.paymentAnnually.toString());
          }
        } else if (category === "Building and Infrastructures") {
          if (updatedToolDetails.floorArea)
            updatedToolDetails.floorArea = cleanNumber(
              updatedToolDetails.floorArea.toString(),
            );
          if (updatedToolDetails.ownershipDetails) {
            const od = updatedToolDetails.ownershipDetails;
            if (od.estimateValue)
              od.estimateValue = cleanNumber(od.estimateValue.toString());
            if (od.leastAmountAnnually)
              od.leastAmountAnnually = cleanNumber(
                od.leastAmountAnnually.toString(),
              );
            if (od.permitFeeAnnually)
              od.permitFeeAnnually = cleanNumber(
                od.permitFeeAnnually.toString(),
              );
            if (od.paymentAnnually)
              od.paymentAnnually = cleanNumber(od.paymentAnnually.toString());
          }
        } else if (
          category === "Machine and Vehicles" ||
          category === "Tools"
        ) {
          if (updatedToolDetails.numberOfUnits)
            updatedToolDetails.numberOfUnits = cleanNumber(
              updatedToolDetails.numberOfUnits.toString(),
            );
          if (updatedToolDetails.unitPrice)
            updatedToolDetails.unitPrice = cleanNumber(
              updatedToolDetails.unitPrice.toString(),
            );
          if (updatedToolDetails.totalPrice)
            updatedToolDetails.totalPrice = cleanNumber(
              updatedToolDetails.totalPrice.toString(),
            );
          if (
            updatedToolDetails.brand === "Other" &&
            updatedToolDetails.customBrand
          ) {
            updatedToolDetails.brand = updatedToolDetails.customBrand;
          }
        }

        if (updatedToolDetails.ownershipDetails) {
          updatedToolDetails.ownershipDetails = {
            ...updatedToolDetails.ownershipDetails,
            durationYears:
              updatedToolDetails.ownershipDetails.durationYears ?? 0,
            durationMonths:
              updatedToolDetails.ownershipDetails.durationMonths ?? 0,
            warrantystatus:
              updatedToolDetails.warranty === "yes" ? "yes" : "no",
            ...(updatedToolDetails.warranty === "no" && {
              expireDate: null,
              purchaseDate: null,
            }),
          };
        }

        const payload = {
          ...updatedToolDetails,
          oldOwnership:
            updatedToolDetails.oldOwnership || updatedToolDetails.ownership,
        };

        setIsLoading(true);

        const response = await axios.put(
          `${environment.API_BASE_URL}api/auth/fixedasset/${id}/${category}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (response.status !== 200)
          throw new Error("Failed to update one or more assets");
        setIsLoading(false);
      }

      Alert.alert(
        t("Main.Success"),
        t("FixedAssets.AssetDetailsUpdatedSuccessfully"),
        [{ text: t("Main.OK") }],
      );
      setIsLoading(false);
      navigation.goBack();
    } catch (error: any) {
      setIsLoading(false);

      if (error.response?.status === 409) {
        Alert.alert("Duplicate Name", error.response.data.message, [
          { text: t("Main.OK") },
        ]);
      } else {
        Alert.alert(
          t("Main.Sorry"),
          t("FixedAssets.FailedToUpdateAssetDetailsPleaseTryAgain"),
          [{ text: t("Main.OK") }],
        );
      }
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      return () => backHandler.remove();
    }, [navigation]),
  );

  const formatDecimal = (text: string) => {
    let cleaned = text.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      cleaned = parts[0] + "." + parts.slice(1).join("");
    }
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.length === 2 ? intPart + "." + parts[1] : intPart;
  };

  const DropdownTrigger = ({
    value,
    placeholder,
    onPress,
    error,
  }: {
    value: string;
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
          className={`text-sm flex-1 ${value ? "text-black" : "text-[#6B7280]"}`}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
      </TouchableOpacity>
      {error ? (
        <Text className="text-red-500 text-xs mt-1 ml-2">{error}</Text>
      ) : null}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      enabled
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <CustomHeader
        title={translateCategory(category)}
        navigation={navigation as any}
        onBackPress={() => navigation.goBack()}
      />

      {loading ? (
        <View className="flex-1 justify-center items-center bg-white">
          <LoadingPage fullScreen />
        </View>
      ) : (
        <ScrollView
          className="bg-white flex-1"
          keyboardShouldPersistTaps="handled"
        >
          {tools.map((tool) => (
            <View key={tool.id} className="bg-white rounded">
              <View className="px-6">
                {tool.category === "Land" && (
                  <>
                    {/* Land Name */}
                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.LandName")} *
                    </Text>
                    <View className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2 justify-center">
                      <TextInput
                        className="text-black w-full text-sm"
                        style={{
                          fontSize: 12,
                          paddingVertical: 0,
                          paddingTop: 0,
                          paddingBottom: 0,
                          textAlign: "left",
                          ...(Platform.OS === "android"
                            ? { textAlignVertical: "center" }
                            : {}),
                        }}
                        placeholder={t("FixedAssets.EnterLandName")}
                        value={updatedDetails[tool.id]?.landName ?? ""}
                        onChangeText={(text) => {
                          const trimmed = text.replace(/^\s+/, "");
                          const capitalized =
                            trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
                          handleInputChange(tool.id, "landName", capitalized);
                          clearFieldError(tool.id, "landName");
                        }}
                        placeholderTextColor="#6B7280"
                      />
                    </View>
                    {fieldErrors[tool.id]?.landName ? (
                      <Text className="text-red-500 text-xs mt-1 ml-2 mb-2">
                        {fieldErrors[tool.id].landName}
                      </Text>
                    ) : null}
                    {/* Extent */}
                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.Extent")} *
                    </Text>
                    <View className="flex-row justify-between items-center w-full">
                      <Text className="pr-1 text-[#3A3A3A] text-sm">
                        {t("FixedAssets.ha")}
                      </Text>
                      <View className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] w-[25%] mt-2 mb-2 justify-center">
                        <TextInput
                          className="text-black w-full text-sm"
                          style={{
                            fontSize: 12,
                            paddingVertical: 0,
                            paddingTop: 0,
                            paddingBottom: 0,
                            textAlign: "left",
                            ...(Platform.OS === "android"
                              ? { textAlignVertical: "center" }
                              : {}),
                          }}
                          placeholder={t("FixedAssets.ha")}
                          value={
                            updatedDetails[tool.id]?.extentha?.toString() ?? ""
                          }
                          onChangeText={(text) => {
                            handleInputChange(
                              tool.id,
                              "extentha",
                              text.replace(/[-*#.]/g, ""),
                            );
                            clearFieldError(tool.id, "extent");
                          }}
                          placeholderTextColor="#6B7280"
                          keyboardType="numeric"
                        />
                      </View>
                      <Text className="pl-2 pr-1 text-[#3A3A3A] text-sm">
                        {t("FixedAssets.ac")}
                      </Text>
                      <View className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] w-[25%] mt-2 mb-2 justify-center">
                        <TextInput
                          className="text-black w-full text-sm"
                          style={{
                            fontSize: 12,
                            paddingVertical: 0,
                            paddingTop: 0,
                            paddingBottom: 0,
                            textAlign: "left",
                            ...(Platform.OS === "android"
                              ? { textAlignVertical: "center" }
                              : {}),
                          }}
                          placeholder={t("FixedAssets.ac")}
                          value={
                            updatedDetails[tool.id]?.extentac?.toString() ?? ""
                          }
                          onChangeText={(text) => {
                            handleInputChange(
                              tool.id,
                              "extentac",
                              text.replace(/[-*#.]/g, ""),
                            );
                            clearFieldError(tool.id, "extent");
                          }}
                          keyboardType="numeric"
                          placeholderTextColor="#6B7280"
                        />
                      </View>
                      <Text className="pl-2 pr-1 text-[#3A3A3A] text-sm">
                        {t("FixedAssets.p")}
                      </Text>
                      <View className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] w-[25%] mt-2 mb-2 justify-center">
                        <TextInput
                          className="text-black w-full text-sm"
                          style={{
                            fontSize: 12,
                            paddingVertical: 0,
                            paddingTop: 0,
                            paddingBottom: 0,
                            textAlign: "left",
                            ...(Platform.OS === "android"
                              ? { textAlignVertical: "center" }
                              : {}),
                          }}
                          placeholder={t("FixedAssets.p")}
                          value={
                            updatedDetails[tool.id]?.extentp?.toString() ?? ""
                          }
                          onChangeText={(text) => {
                            handleInputChange(
                              tool.id,
                              "extentp",
                              text.replace(/[-*#.]/g, ""),
                            );
                            clearFieldError(tool.id, "extent");
                          }}
                          keyboardType="numeric"
                          placeholderTextColor="#6B7280"
                        />
                      </View>
                    </View>
                    {fieldErrors[tool.id]?.extent ? (
                      <Text className="text-red-500 text-xs mt-1 ml-2 mb-2">
                        {fieldErrors[tool.id].extent}
                      </Text>
                    ) : null}

                    {/* Land Ownership */}
                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.Ownership")} *
                    </Text>
                    <DropdownTrigger
                      value={getOwnershipDisplayText(
                        updatedDetails[tool.id]?.ownership ?? "",
                        "Land",
                      )}
                      placeholder={t("FixedAssets.selectOwnership")}
                      onPress={() => {
                        clearFieldError(tool.id, "ownership");
                        setShowOwnershipModal(true);
                      }}
                      error={fieldErrors[tool.id]?.ownership}
                    />
                    <GlobalSearchModal
                      visible={showOwnershipModal}
                      onClose={() => setShowOwnershipModal(false)}
                      title={t("FixedAssets.Ownership")}
                      data={landownershipCategoriesWithDisplay}
                      selectedItems={
                        updatedDetails[tool.id]?.ownership
                          ? [updatedDetails[tool.id].ownership]
                          : []
                      }
                      onSelect={(items) => {
                        if (items[0]) {
                          if (!updatedDetails[tool.id]?.oldOwnership) {
                            handleInputChange(
                              tool.id,
                              "oldOwnership",
                              updatedDetails[tool.id]?.ownership || items[0],
                            );
                          }
                          handleInputChange(tool.id, "ownership", items[0]);
                          clearFieldError(tool.id, "ownership");
                        }
                      }}
                      searchPlaceholder={t("Main.Search...")}
                    />

                    {/* Own */}
                    {updatedDetails[tool.id]?.ownership === "Own" && (
                      <>
                        <Text className="text-[#070707] text-sm mt-2">
                          {t("FixedAssets.EstimatedValue")} *
                        </Text>
                        <View className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2 justify-center">
                          <TextInput
                            className="text-black w-full text-sm"
                            style={{
                              fontSize: 12,
                              paddingVertical: 0,
                              paddingTop: 0,
                              paddingBottom: 0,
                              textAlign: "left",
                              ...(Platform.OS === "android"
                                ? { textAlignVertical: "center" }
                                : {}),
                            }}
                            placeholder={t("FixedAssets.EstimatedValue")}
                            value={formatDecimal(
                              updatedDetails[
                                tool.id
                              ]?.ownershipDetails?.estimateValue?.toString() ??
                                "",
                            )}
                            onChangeText={(text) => {
                              handleInputChange(
                                tool.id,
                                "ownershipDetails.estimateValue",
                                formatDecimal(text),
                              );
                              clearFieldError(tool.id, "estimateValue");
                            }}
                            keyboardType="numeric"
                            placeholderTextColor="#6B7280"
                          />
                        </View>
                        {fieldErrors[tool.id]?.estimateValue ? (
                          <Text className="text-red-500 text-xs mt-1 ml-2 mb-2">
                            {fieldErrors[tool.id].estimateValue}
                          </Text>
                        ) : null}
                      </>
                    )}

                    {/* Lease */}
                    {updatedDetails[tool.id]?.ownership === "Lease" && (
                      <>
                        <Text className="text-[#070707] text-sm mt-2">
                          {t("FixedAssets.LeaseStartDate")} *
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            clearFieldError(tool.id, "startDate");
                            setShowStartDatePicker((prev) => !prev);
                          }}
                          className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] justify-center flex-row items-center mt-2 mb-2"
                        >
                          <Text
                            className={`flex-1 text-sm ${!updatedDetails[tool.id]?.ownershipDetails?.startDate ? "text-[#6B7280]" : "text-black"}`}
                          >
                            {updatedDetails[tool.id]?.ownershipDetails
                              ?.startDate
                              ? formatDate(
                                  updatedDetails[tool.id].ownershipDetails
                                    .startDate,
                                )
                              : t("FixedAssets.LeaseStartDate")}
                          </Text>
                          <EvilIcons
                            name="calendar"
                            size={28}
                            color="#5e5d5d"
                          />
                        </TouchableOpacity>
                        {fieldErrors[tool.id]?.startDate ? (
                          <Text className="text-red-500 text-xs mt-1 ml-2 mb-2">
                            {fieldErrors[tool.id].startDate}
                          </Text>
                        ) : null}
                        {Platform.OS === "ios" ? (
                          <CustomDatePicker
                            visible={showStartDatePicker}
                            onClose={() => setShowStartDatePicker(false)}
                            value={parseDate(
                              updatedDetails[tool.id]?.ownershipDetails
                                ?.startDate,
                            )}
                            onConfirm={(date) => {
                              handleInputChange(
                                tool.id,
                                "ownershipDetails.startDate",
                                formatDate(date),
                              );
                            }}
                            maximumDate={new Date()}
                            title={t("FixedAssets.LeaseStartDate")}
                          />
                        ) : (
                          showStartDatePicker && (
                            <DateTimePicker
                              value={
                                parseDate(
                                  updatedDetails[tool.id]?.ownershipDetails
                                    ?.startDate,
                                ) || new Date()
                              }
                              mode="date"
                              display="default"
                              onChange={(event, selectedDate) => {
                                setShowStartDatePicker(false);
                                if (event.type === "set" && selectedDate)
                                  handleInputChange(
                                    tool.id,
                                    "ownershipDetails.startDate",
                                    formatDate(selectedDate),
                                  );
                              }}
                              maximumDate={new Date()}
                            />
                          )
                        )}

                        <Text className="text-[#070707] text-sm mt-2">
                          {t("FixedAssets.Duration")} *
                        </Text>
                        <View className="items-center flex-row justify-center">
                          <Text className="w-[20%] text-right pr-2 text-sm text-[#070707]">
                            {t("FixedAssets.Years")}
                          </Text>
                          <View className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] w-[30%] mt-2 mb-2 justify-center">
                            <TextInput
                              className="text-black w-full text-sm"
                              style={{
                                fontSize: 12,
                                paddingVertical: 0,
                                paddingTop: 0,
                                paddingBottom: 0,
                                textAlign: "left",
                                ...(Platform.OS === "android"
                                  ? { textAlignVertical: "center" }
                                  : {}),
                              }}
                              placeholder={t("FixedAssets.Years")}
                              keyboardType="numeric"
                              value={
                                updatedDetails[
                                  tool.id
                                ]?.ownershipDetails?.durationYears?.toString() ??
                                ""
                              }
                              onChangeText={(value) => {
                                handleInputChange(
                                  tool.id,
                                  "ownershipDetails.durationYears",
                                  value.replace(/[-*#.+]/g, "").trimStart(),
                                );
                                clearFieldError(tool.id, "duration");
                              }}
                              placeholderTextColor="#6B7280"
                            />
                          </View>
                          <Text className="w-[20%] text-right pr-2 text-sm text-[#070707]">
                            {t("FixedAssets.Months")}
                          </Text>
                          <View className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] w-[30%] mt-2 mb-2 justify-center">
                            <TextInput
                              className="text-black w-full text-sm"
                              style={{
                                fontSize: 12,
                                paddingVertical: 0,
                                paddingTop: 0,
                                paddingBottom: 0,
                                textAlign: "left",
                                ...(Platform.OS === "android"
                                  ? { textAlignVertical: "center" }
                                  : {}),
                              }}
                              placeholder={t("FixedAssets.Months")}
                              keyboardType="numeric"
                              value={
                                updatedDetails[
                                  tool.id
                                ]?.ownershipDetails?.durationMonths?.toString() ??
                                ""
                              }
                              onChangeText={(value) => {
                                handleInputChange(
                                  tool.id,
                                  "ownershipDetails.durationMonths",
                                  value.replace(/[-*#.+]/g, "").trimStart(),
                                );
                                clearFieldError(tool.id, "duration");
                              }}
                              placeholderTextColor="#6B7280"
                            />
                          </View>
                        </View>
                        {fieldErrors[tool.id]?.duration ? (
                          <Text className="text-red-500 text-xs mt-1 ml-2 mb-2">
                            {fieldErrors[tool.id].duration}
                          </Text>
                        ) : null}

                        <Text className="text-[#070707] text-sm mt-2">
                          {t("FixedAssets.AnnualLeaseAmount")} *
                        </Text>
                        <View className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2 justify-center">
                          <TextInput
                            className="text-black w-full text-sm"
                            style={{
                              fontSize: 12,
                              paddingVertical: 0,
                              paddingTop: 0,
                              paddingBottom: 0,
                              textAlign: "left",
                              ...(Platform.OS === "android"
                                ? { textAlignVertical: "center" }
                                : {}),
                            }}
                            placeholder={t(
                              "FixedAssets.EnterAnnualLeasedAmount",
                            )}
                            value={formatDecimal(
                              updatedDetails[
                                tool.id
                              ]?.ownershipDetails?.leastAmountAnnually?.toString() ??
                                "",
                            )}
                            onChangeText={(text) => {
                              handleInputChange(
                                tool.id,
                                "ownershipDetails.leastAmountAnnually",
                                formatDecimal(text),
                              );
                              clearFieldError(tool.id, "leastAmountAnnually");
                            }}
                            keyboardType="numeric"
                            placeholderTextColor="#6B7280"
                          />
                        </View>
                        {fieldErrors[tool.id]?.leastAmountAnnually ? (
                          <Text className="text-red-500 text-xs mt-1 ml-2 mb-2">
                            {fieldErrors[tool.id].leastAmountAnnually}
                          </Text>
                        ) : null}
                      </>
                    )}

                    {/* Permited */}
                    {updatedDetails[tool.id]?.ownership === "Permited" && (
                      <>
                        <Text className="text-[#070707] text-sm mt-2">
                          {t("FixedAssets.IssuedDate")} *
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            clearFieldError(tool.id, "issuedDate");
                            setShowStartDatePicker((prev) => !prev);
                          }}
                          className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] justify-center flex-row items-center mt-2 mb-2"
                        >
                          <Text
                            className={`flex-1 text-sm ${!updatedDetails[tool.id]?.ownershipDetails?.issuedDate ? "text-[#6B7280]" : "text-black"}`}
                          >
                            {updatedDetails[tool.id]?.ownershipDetails
                              ?.issuedDate
                              ? formatDate(
                                  updatedDetails[tool.id].ownershipDetails
                                    .issuedDate,
                                )
                              : t("FixedAssets.IssuedDate")}
                          </Text>
                          <EvilIcons
                            name="calendar"
                            size={28}
                            color="#5e5d5d"
                          />
                        </TouchableOpacity>
                        {fieldErrors[tool.id]?.issuedDate ? (
                          <Text className="text-red-500 text-xs mt-1 ml-2 mb-2">
                            {fieldErrors[tool.id].issuedDate}
                          </Text>
                        ) : null}
                        {Platform.OS === "ios" ? (
                          <CustomDatePicker
                            visible={showStartDatePicker}
                            onClose={() => setShowStartDatePicker(false)}
                            value={parseDate(
                              updatedDetails[tool.id]?.ownershipDetails
                                ?.issuedDate,
                            )}
                            onConfirm={(date) => {
                              handleInputChange(
                                tool.id,
                                "ownershipDetails.issuedDate",
                                formatDate(date),
                              );
                            }}
                            maximumDate={new Date()}
                            title={t("FixedAssets.IssuedDate")}
                          />
                        ) : (
                          showStartDatePicker && (
                            <DateTimePicker
                              value={
                                parseDate(
                                  updatedDetails[tool.id]?.ownershipDetails
                                    ?.issuedDate,
                                ) || new Date()
                              }
                              mode="date"
                              display="default"
                              onChange={(event, selectedDate) => {
                                setShowStartDatePicker(false);
                                if (event.type === "set" && selectedDate)
                                  handleInputChange(
                                    tool.id,
                                    "ownershipDetails.issuedDate",
                                    formatDate(selectedDate),
                                  );
                              }}
                              maximumDate={new Date()}
                            />
                          )
                        )}

                        <Text className="text-[#070707] text-sm mt-2">
                          {t("FixedAssets.AnnualPermitFee")} *
                        </Text>
                        <View className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2 justify-center">
                          <TextInput
                            className="text-black w-full text-sm"
                            style={{
                              fontSize: 12,
                              paddingVertical: 0,
                              paddingTop: 0,
                              paddingBottom: 0,
                              textAlign: "left",
                              ...(Platform.OS === "android"
                                ? { textAlignVertical: "center" }
                                : {}),
                            }}
                            placeholder={t("FixedAssets.EnterAnnualPermitFee")}
                            value={formatDecimal(
                              updatedDetails[
                                tool.id
                              ]?.ownershipDetails?.permitFeeAnnually?.toString() ??
                                "",
                            )}
                            onChangeText={(text) => {
                              handleInputChange(
                                tool.id,
                                "ownershipDetails.permitFeeAnnually",
                                formatDecimal(text),
                              );
                              clearFieldError(tool.id, "permitFeeAnnually");
                            }}
                            keyboardType="numeric"
                            placeholderTextColor="#6B7280"
                          />
                        </View>
                        {fieldErrors[tool.id]?.permitFeeAnnually ? (
                          <Text className="text-red-500 text-xs mt-1 ml-2 mb-2">
                            {fieldErrors[tool.id].permitFeeAnnually}
                          </Text>
                        ) : null}
                      </>
                    )}

                    {/* Shared */}
                    {updatedDetails[tool.id]?.ownership === "Shared" && (
                      <>
                        <Text className="text-[#070707] text-sm mt-2">
                          {t("FixedAssets.AnnualPaymentFee")} *
                        </Text>
                        <View className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2 justify-center">
                          <TextInput
                            className="text-black w-full text-sm"
                            style={{
                              fontSize: 12,
                              paddingVertical: 0,
                              paddingTop: 0,
                              paddingBottom: 0,
                              textAlign: "left",
                              ...(Platform.OS === "android"
                                ? { textAlignVertical: "center" }
                                : {}),
                            }}
                            placeholder={t("FixedAssets.EnterAnnualPaymentFee")}
                            value={formatDecimal(
                              updatedDetails[
                                tool.id
                              ]?.ownershipDetails?.paymentAnnually?.toString() ??
                                "",
                            )}
                            onChangeText={(text) => {
                              handleInputChange(
                                tool.id,
                                "ownershipDetails.paymentAnnually",
                                formatDecimal(text),
                              );
                              clearFieldError(tool.id, "paymentAnnually");
                            }}
                            keyboardType="numeric"
                            placeholderTextColor="#6B7280"
                          />
                        </View>
                        {fieldErrors[tool.id]?.paymentAnnually ? (
                          <Text className="text-red-500 text-xs mt-1 ml-2 mb-2">
                            {fieldErrors[tool.id].paymentAnnually}
                          </Text>
                        ) : null}
                      </>
                    )}

                    {/* Land Fenced */}
                    <Text className="text-[#070707] text-sm mt-2 mb-2">
                      {t("FixedAssets.IsTheLandFenced")} *
                    </Text>
                    <View className="flex-row justify-around mb-1">
                      {["yes", "no"].map((val) => (
                        <TouchableOpacity
                          key={val}
                          onPress={() =>
                            handleInputChange(tool.id, "landFenced", val)
                          }
                          className="flex-row items-center"
                        >
                          <View
                            className={`w-5 h-5 rounded-full ${
                              updatedDetails[tool.id]?.landFenced === val
                                ? "bg-green-500"
                                : "bg-gray-400"
                            }`}
                          />
                          <Text className="ml-2 text-sm text-[#070707]">
                            {t(`FixedAssets.${val}`)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Perennial Crops */}
                    <Text className="text-[#070707] text-sm mt-2 mb-2">
                      {t("FixedAssets.DoesTheLandHavePerennialCrops")} *
                    </Text>
                    <View className="flex-row justify-around mb-1">
                      {["yes", "no"].map((val) => (
                        <TouchableOpacity
                          key={val}
                          onPress={() =>
                            handleInputChange(tool.id, "perennialCrop", val)
                          }
                          className="flex-row items-center"
                        >
                          <View
                            className={`w-5 h-5 rounded-full ${
                              updatedDetails[tool.id]?.perennialCrop === val
                                ? "bg-green-500"
                                : "bg-gray-400"
                            }`}
                          />
                          <Text className="ml-2 text-sm text-[#070707]">
                            {t(`FixedAssets.${val}`)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}

                {tool.category === "Building and Infrastructures" && (
                  <>
                    {/* Type */}
                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.Type")} *
                    </Text>
                    <DropdownTrigger
                      value={getLabel(
                        assetTypesForBuilding,
                        updatedDetails[tool.id]?.type ?? "",
                      )}
                      placeholder={t("FixedAssets.selectType")}
                      onPress={() => {
                        clearFieldError(tool.id, "type");
                        setShowTypeModal(true);
                      }}
                      error={fieldErrors[tool.id]?.type}
                    />
                    <GlobalSearchModal
                      visible={showTypeModal}
                      onClose={() => setShowTypeModal(false)}
                      title={t("FixedAssets.Type")}
                      data={assetTypesForBuilding}
                      selectedItems={
                        updatedDetails[tool.id]?.type
                          ? [updatedDetails[tool.id].type]
                          : []
                      }
                      onSelect={(items) => {
                        if (items[0]) {
                          handleInputChange(tool.id, "type", items[0]);
                          clearFieldError(tool.id, "type");
                        }
                      }}
                      searchPlaceholder={t("Main.Search...")}
                    />
                    {/* Building Name */}
                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.BuildingName")} *
                    </Text>
                    <View className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2 justify-center">
                      <TextInput
                        className="text-black w-full text-sm"
                        style={{
                          fontSize: 12,
                          paddingVertical: 0,
                          paddingTop: 0,
                          paddingBottom: 0,
                          textAlign: "left",
                          ...(Platform.OS === "android"
                            ? { textAlignVertical: "center" }
                            : {}),
                        }}
                        placeholder={t("FixedAssets.EnterBuildingName")}
                        value={updatedDetails[tool.id]?.buildingName ?? ""}
                        onChangeText={(text) => {
                          const trimmed = text.replace(/^\s+/, "");
                          const capitalized =
                            trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
                          handleInputChange(
                            tool.id,
                            "buildingName",
                            capitalized,
                          );
                          clearFieldError(tool.id, "buildingName");
                        }}
                        placeholderTextColor="#6B7280"
                      />
                    </View>
                    {fieldErrors[tool.id]?.buildingName ? (
                      <Text className="text-red-500 text-xs mt-1 ml-2 mb-2">
                        {fieldErrors[tool.id].buildingName}
                      </Text>
                    ) : null}

                    {/* Floor Area */}
                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.FloorArea")} *
                    </Text>
                    <View className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2 justify-center">
                      <TextInput
                        className="text-black w-full text-sm"
                        style={{
                          fontSize: 12,
                          paddingVertical: 0,
                          paddingTop: 0,
                          paddingBottom: 0,
                          textAlign: "left",
                          ...(Platform.OS === "android"
                            ? { textAlignVertical: "center" }
                            : {}),
                        }}
                        placeholder={t("FixedAssets.FloorArea")}
                        value={
                          updatedDetails[tool.id]?.floorArea?.toString() ?? ""
                        }
                        onChangeText={(text) => {
                          handleInputChange(
                            tool.id,
                            "floorArea",
                            formatDecimal(text),
                          );
                          clearFieldError(tool.id, "floorArea");
                        }}
                        placeholderTextColor="#6B7280"
                        keyboardType="numeric"
                      />
                    </View>
                    {fieldErrors[tool.id]?.floorArea ? (
                      <Text className="text-red-500 text-xs mt-1 ml-2 mb-2">
                        {fieldErrors[tool.id].floorArea}
                      </Text>
                    ) : null}

                    {/* Building Ownership */}
                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.Ownership")} *
                    </Text>
                    <DropdownTrigger
                      value={getOwnershipDisplayText(
                        updatedDetails[tool.id]?.ownership ?? "",
                        "Building and Infrastructures",
                      )}
                      placeholder={t("FixedAssets.selectOwnership")}
                      onPress={() => {
                        clearFieldError(tool.id, "ownership");
                        setShowOwnershipModal(true);
                      }}
                      error={fieldErrors[tool.id]?.ownership}
                    />
                    <GlobalSearchModal
                      visible={showOwnershipModal}
                      onClose={() => setShowOwnershipModal(false)}
                      title={t("FixedAssets.Ownership")}
                      data={ownershipCategories}
                      selectedItems={
                        updatedDetails[tool.id]?.ownership
                          ? [updatedDetails[tool.id].ownership]
                          : []
                      }
                      onSelect={(items) => {
                        if (items[0]) {
                          if (!updatedDetails[tool.id]?.oldOwnership) {
                            handleInputChange(
                              tool.id,
                              "oldOwnership",
                              updatedDetails[tool.id]?.ownership || items[0],
                            );
                          }
                          handleInputChange(
                            tool.id,
                            "ownership",
                            normalizeOwnership(items[0], "Land"),
                          );
                          clearFieldError(tool.id, "ownership");
                        }
                      }}
                      searchPlaceholder={t("Main.Search...")}
                    />

                    {/* General Condition */}
                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.GeneralCondition")} *
                    </Text>
                    <DropdownTrigger
                      value={getLabel(
                        generalConditionOptions,
                        updatedDetails[tool.id]?.generalCondition ?? "",
                      )}
                      placeholder={t(
                        "FixedAssets.SelectGeneralConditionIsRequired",
                      )}
                      onPress={() => {
                        clearFieldError(tool.id, "generalCondition");
                        setShowGeneralConditionModal(true);
                      }}
                      error={fieldErrors[tool.id]?.generalCondition}
                    />
                    <GlobalSearchModal
                      visible={showGeneralConditionModal}
                      onClose={() => setShowGeneralConditionModal(false)}
                      title={t("FixedAssets.GeneralCondition")}
                      data={generalConditionOptions}
                      selectedItems={
                        updatedDetails[tool.id]?.generalCondition
                          ? [updatedDetails[tool.id].generalCondition]
                          : []
                      }
                      onSelect={(items) => {
                        if (items[0]) {
                          handleInputChange(
                            tool.id,
                            "generalCondition",
                            items[0],
                          );
                          clearFieldError(tool.id, "generalCondition");
                        }
                      }}
                      searchPlaceholder={t("Main.Search...")}
                      showSearch={false}
                    />

                    {/* Own Building */}
                    {updatedDetails[tool.id]?.ownership ===
                      "Own Building (with title ownership)" && (
                      <>
                        <Text className="text-[#070707] text-sm mt-2">
                          {t("FixedAssets.EstimatedValue")} *
                        </Text>
                        <View className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2 justify-center">
                          <TextInput
                            className="text-black w-full text-sm"
                            style={{
                              fontSize: 12,
                              paddingVertical: 0,
                              paddingTop: 0,
                              paddingBottom: 0,
                              textAlign: "left",
                              ...(Platform.OS === "android"
                                ? { textAlignVertical: "center" }
                                : {}),
                            }}
                            placeholder={t("FixedAssets.EstimatedValue")}
                            value={formatDecimal(
                              updatedDetails[
                                tool.id
                              ]?.ownershipDetails?.estimateValue?.toString() ??
                                "",
                            )}
                            onChangeText={(text) => {
                              handleInputChange(
                                tool.id,
                                "ownershipDetails.estimateValue",
                                formatDecimal(text),
                              );
                              clearFieldError(tool.id, "estimateValue");
                            }}
                            keyboardType="numeric"
                            placeholderTextColor="#6B7280"
                          />
                        </View>
                        {fieldErrors[tool.id]?.estimateValue ? (
                          <Text className="text-red-500 text-xs mt-1 ml-2 mb-2">
                            {fieldErrors[tool.id].estimateValue}
                          </Text>
                        ) : null}
                      </>
                    )}

                    {/* Leased Building */}
                    {updatedDetails[tool.id]?.ownership ===
                      "Leased Building" && (
                      <>
                        <Text className="text-[#070707] text-sm mt-2">
                          {t("FixedAssets.LeaseStartDate")} *
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            clearFieldError(tool.id, "startDate");
                            setShowStartDatePicker((prev) => !prev);
                          }}
                          className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] justify-center flex-row items-center mt-2 mb-2"
                        >
                          <Text
                            className={`flex-1 text-sm ${!updatedDetails[tool.id]?.ownershipDetails?.startDate ? "text-[#6B7280]" : "text-black"}`}
                          >
                            {updatedDetails[tool.id]?.ownershipDetails
                              ?.startDate
                              ? formatDate(
                                  updatedDetails[tool.id].ownershipDetails
                                    .startDate,
                                )
                              : t("FixedAssets.LeaseStartDate")}
                          </Text>
                          <EvilIcons
                            name="calendar"
                            size={28}
                            color="#5e5d5d"
                          />
                        </TouchableOpacity>
                        {fieldErrors[tool.id]?.startDate ? (
                          <Text className="text-red-500 text-xs mt-1 ml-2 mb-2">
                            {fieldErrors[tool.id].startDate}
                          </Text>
                        ) : null}
                        {Platform.OS === "ios" ? (
                          <CustomDatePicker
                            visible={showStartDatePicker}
                            onClose={() => setShowStartDatePicker(false)}
                            value={parseDate(
                              updatedDetails[tool.id]?.ownershipDetails
                                ?.startDate,
                            )}
                            onConfirm={(date) => {
                              handleInputChange(
                                tool.id,
                                "ownershipDetails.startDate",
                                formatDate(date),
                              );
                            }}
                            maximumDate={new Date()}
                            title={t("FixedAssets.LeaseStartDate")}
                          />
                        ) : (
                          showStartDatePicker && (
                            <DateTimePicker
                              value={
                                parseDate(
                                  updatedDetails[tool.id]?.ownershipDetails
                                    ?.startDate,
                                ) || new Date()
                              }
                              mode="date"
                              display="default"
                              onChange={(event, selectedDate) => {
                                setShowStartDatePicker(false);
                                if (event.type === "set" && selectedDate)
                                  handleInputChange(
                                    tool.id,
                                    "ownershipDetails.startDate",
                                    formatDate(selectedDate),
                                  );
                              }}
                              maximumDate={new Date()}
                            />
                          )
                        )}

                        <Text className="text-[#070707] text-sm mt-2">
                          {t("FixedAssets.Duration")} *
                        </Text>
                        <View className="items-center flex-row justify-center">
                          <Text className="w-[20%] text-right pr-2 text-sm text-[#070707]">
                            {t("FixedAssets.Years")}
                          </Text>
                          <View className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] w-[30%] mt-2 mb-2 justify-center">
                            <TextInput
                              className="text-black w-full text-sm"
                              style={{
                                fontSize: 12,
                                paddingVertical: 0,
                                paddingTop: 0,
                                paddingBottom: 0,
                                textAlign: "left",
                                ...(Platform.OS === "android"
                                  ? { textAlignVertical: "center" }
                                  : {}),
                              }}
                              placeholder={t("FixedAssets.Years")}
                              keyboardType="numeric"
                              value={
                                updatedDetails[
                                  tool.id
                                ]?.ownershipDetails?.durationYears?.toString() ??
                                ""
                              }
                              onChangeText={(value) => {
                                handleInputChange(
                                  tool.id,
                                  "ownershipDetails.durationYears",
                                  value.replace(/[-*#.+]/g, "").trimStart(),
                                );
                                clearFieldError(tool.id, "duration");
                              }}
                              placeholderTextColor="#6B7280"
                            />
                          </View>
                          <Text className="w-[20%] text-right pr-2 text-sm text-[#070707]">
                            {t("FixedAssets.Months")}
                          </Text>
                          <View className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] w-[30%] mt-2 mb-2 justify-center">
                            <TextInput
                              className="text-black w-full text-sm"
                              style={{
                                fontSize: 12,
                                paddingVertical: 0,
                                paddingTop: 0,
                                paddingBottom: 0,
                                textAlign: "left",
                                ...(Platform.OS === "android"
                                  ? { textAlignVertical: "center" }
                                  : {}),
                              }}
                              placeholder={t("FixedAssets.Months")}
                              keyboardType="numeric"
                              value={
                                updatedDetails[
                                  tool.id
                                ]?.ownershipDetails?.durationMonths?.toString() ??
                                ""
                              }
                              onChangeText={(value) => {
                                handleInputChange(
                                  tool.id,
                                  "ownershipDetails.durationMonths",
                                  value.replace(/[-*#.+]/g, "").trimStart(),
                                );
                                clearFieldError(tool.id, "duration");
                              }}
                              placeholderTextColor="#6B7280"
                            />
                          </View>
                        </View>
                        {fieldErrors[tool.id]?.duration ? (
                          <Text className="text-red-500 text-xs mt-1 ml-2 mb-2">
                            {fieldErrors[tool.id].duration}
                          </Text>
                        ) : null}

                        <Text className="text-[#070707] text-sm mt-2">
                          {t("FixedAssets.AnnualLeaseAmount")} *
                        </Text>
                        <View className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2 justify-center">
                          <TextInput
                            className="text-black w-full text-sm"
                            style={{
                              fontSize: 12,
                              paddingVertical: 0,
                              paddingTop: 0,
                              paddingBottom: 0,
                              textAlign: "left",
                              ...(Platform.OS === "android"
                                ? { textAlignVertical: "center" }
                                : {}),
                            }}
                            placeholder={t(
                              "FixedAssets.EnterAnnualLeasedAmount",
                            )}
                            value={formatDecimal(
                              updatedDetails[
                                tool.id
                              ]?.ownershipDetails?.leastAmountAnnually?.toString() ??
                                "",
                            )}
                            onChangeText={(text) => {
                              handleInputChange(
                                tool.id,
                                "ownershipDetails.leastAmountAnnually",
                                formatDecimal(text),
                              );
                              clearFieldError(tool.id, "leastAmountAnnually");
                            }}
                            keyboardType="numeric"
                            placeholderTextColor="#6B7280"
                          />
                        </View>
                        {fieldErrors[tool.id]?.leastAmountAnnually ? (
                          <Text className="text-red-500 text-xs mt-1 ml-2 mb-2">
                            {fieldErrors[tool.id].leastAmountAnnually}
                          </Text>
                        ) : null}
                      </>
                    )}

                    {/* Permitted Building */}
                    {(updatedDetails[tool.id]?.ownership ===
                      "Permitted Building" ||
                      updatedDetails[tool.id]?.ownership ===
                        "Permit Building") && (
                      <>
                        <Text className="text-[#070707] text-sm mt-2">
                          {t("FixedAssets.IssuedDate")} *
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            clearFieldError(tool.id, "issuedDate");
                            setShowStartDatePicker((prev) => !prev);
                          }}
                          className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] justify-center flex-row items-center mt-2 mb-2"
                        >
                          <Text
                            className={`flex-1 text-sm ${!updatedDetails[tool.id]?.ownershipDetails?.issuedDate ? "text-[#6B7280]" : "text-black"}`}
                          >
                            {updatedDetails[tool.id]?.ownershipDetails
                              ?.issuedDate
                              ? formatDate(
                                  updatedDetails[tool.id].ownershipDetails
                                    .issuedDate,
                                )
                              : t("FixedAssets.IssuedDate")}
                          </Text>
                          <EvilIcons
                            name="calendar"
                            size={28}
                            color="#5e5d5d"
                          />
                        </TouchableOpacity>
                        {fieldErrors[tool.id]?.issuedDate ? (
                          <Text className="text-red-500 text-xs mt-1 ml-2 mb-2">
                            {fieldErrors[tool.id].issuedDate}
                          </Text>
                        ) : null}
                        {Platform.OS === "ios" ? (
                          <CustomDatePicker
                            visible={showStartDatePicker}
                            onClose={() => setShowStartDatePicker(false)}
                            value={parseDate(
                              updatedDetails[tool.id]?.ownershipDetails
                                ?.issuedDate,
                            )}
                            onConfirm={(date) => {
                              handleInputChange(
                                tool.id,
                                "ownershipDetails.issuedDate",
                                formatDate(date),
                              );
                            }}
                            maximumDate={new Date()}
                            title={t("FixedAssets.IssuedDate")}
                          />
                        ) : (
                          showStartDatePicker && (
                            <DateTimePicker
                              value={
                                parseDate(
                                  updatedDetails[tool.id]?.ownershipDetails
                                    ?.issuedDate,
                                ) || new Date()
                              }
                              mode="date"
                              display="default"
                              onChange={(event, selectedDate) => {
                                setShowStartDatePicker(false);
                                if (event.type === "set" && selectedDate)
                                  handleInputChange(
                                    tool.id,
                                    "ownershipDetails.issuedDate",
                                    formatDate(selectedDate),
                                  );
                              }}
                              maximumDate={new Date()}
                            />
                          )
                        )}

                        <Text className="text-[#070707] text-sm mt-2">
                          {t("FixedAssets.PermitFeeAnnuallyLKR")} *
                        </Text>
                        <View className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2 justify-center">
                          <TextInput
                            className="text-black w-full text-sm"
                            style={{
                              fontSize: 12,
                              paddingVertical: 0,
                              paddingTop: 0,
                              paddingBottom: 0,
                              textAlign: "left",
                              ...(Platform.OS === "android"
                                ? { textAlignVertical: "center" }
                                : {}),
                            }}
                            placeholder={t("FixedAssets.PermitFeeAnnuallyLKR")}
                            value={formatDecimal(
                              updatedDetails[
                                tool.id
                              ]?.ownershipDetails?.permitFeeAnnually?.toString() ??
                                "",
                            )}
                            onChangeText={(text) => {
                              handleInputChange(
                                tool.id,
                                "ownershipDetails.permitFeeAnnually",
                                formatDecimal(text),
                              );
                              clearFieldError(tool.id, "permitFeeAnnually");
                            }}
                            keyboardType="numeric"
                            placeholderTextColor="#6B7280"
                          />
                        </View>
                        {fieldErrors[tool.id]?.permitFeeAnnually ? (
                          <Text className="text-red-500 text-xs mt-1 ml-2 mb-2">
                            {fieldErrors[tool.id].permitFeeAnnually}
                          </Text>
                        ) : null}
                      </>
                    )}

                    {/* Shared / No Ownership */}
                    {updatedDetails[tool.id]?.ownership ===
                      "Shared / No Ownership" && (
                      <>
                        <Text className="text-[#070707] text-sm mt-2">
                          {t("FixedAssets.AnnualPaymentFee")} *
                        </Text>
                        <View className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2 justify-center">
                          <TextInput
                            className="text-black w-full text-sm"
                            style={{
                              fontSize: 12,
                              paddingVertical: 0,
                              paddingTop: 0,
                              paddingBottom: 0,
                              textAlign: "left",
                              ...(Platform.OS === "android"
                                ? { textAlignVertical: "center" }
                                : {}),
                            }}
                            placeholder={t("FixedAssets.EnterAnnualPaymentFee")}
                            value={formatDecimal(
                              updatedDetails[
                                tool.id
                              ]?.ownershipDetails?.paymentAnnually?.toString() ??
                                "",
                            )}
                            onChangeText={(text) => {
                              handleInputChange(
                                tool.id,
                                "ownershipDetails.paymentAnnually",
                                formatDecimal(text),
                              );
                              clearFieldError(tool.id, "paymentAnnually");
                            }}
                            keyboardType="numeric"
                            placeholderTextColor="#6B7280"
                          />
                        </View>
                        {fieldErrors[tool.id]?.paymentAnnually ? (
                          <Text className="text-red-500 text-xs mt-1 ml-2 mb-2">
                            {fieldErrors[tool.id].paymentAnnually}
                          </Text>
                        ) : null}
                      </>
                    )}
                  </>
                )}

                {tool.category === "Machine and Vehicles" && (
                  <>
                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.Asset")} *
                    </Text>
                    <DropdownTrigger
                      value={getLabel(
                        Machineasset,
                        updatedDetails[tool.id]?.asset ?? "",
                      )}
                      placeholder={t("FixedAssets.SelectAssetIsRequired")}
                      onPress={() => {
                        clearFieldError(tool.id, "asset");
                        setShowAssetModal(true);
                      }}
                      error={fieldErrors[tool.id]?.asset}
                    />
                    <GlobalSearchModal
                      visible={showAssetModal}
                      onClose={() => setShowAssetModal(false)}
                      title={t("FixedAssets.Asset")}
                      data={Machineasset}
                      selectedItems={
                        updatedDetails[tool.id]?.asset
                          ? [updatedDetails[tool.id].asset]
                          : []
                      }
                      onSelect={(items) => {
                        if (items[0]) {
                          handleInputChange(tool.id, "asset", items[0]);
                          handleInputChange(tool.id, "assetType", "");
                          handleInputChange(tool.id, "mentionOther", "");
                          handleInputChange(tool.id, "brand", "");
                          handleInputChange(tool.id, "customBrand", "");
                          setSelectedAsset(items[0]);
                          clearFieldError(tool.id, "asset");
                          clearFieldError(tool.id, "brand");
                        }
                      }}
                      searchPlaceholder={t("Main.Search...")}
                    />

                    {selectedAsset && assetTypesForAssets[selectedAsset] && (
                      <>
                        <Text className="text-[#070707] text-sm mt-2">
                          {t("FixedAssets.AssetType")} *
                        </Text>
                        <DropdownTrigger
                          value={getLabel(
                            assetTypesForAssets[
                              updatedDetails[tool.id]?.asset ||
                                selectedAsset ||
                                ""
                            ],
                            updatedDetails[tool.id]?.assetType ?? "",
                          )}
                          placeholder={t(
                            "FixedAssets.SelectAssetTypeIsRequired",
                          )}
                          onPress={() => {
                            clearFieldError(tool.id, "assetType");
                            setShowAssetTypeModal(true);
                          }}
                          error={fieldErrors[tool.id]?.assetType}
                        />
                        <GlobalSearchModal
                          visible={showAssetTypeModal}
                          onClose={() => setShowAssetTypeModal(false)}
                          title={t("FixedAssets.AssetType")}
                          data={assetTypesForAssets[selectedAsset]}
                          selectedItems={
                            updatedDetails[tool.id]?.assetType
                              ? [updatedDetails[tool.id].assetType]
                              : []
                          }
                          onSelect={(items) => {
                            if (items[0]) {
                              handleInputChange(tool.id, "assetType", items[0]);
                              clearFieldError(tool.id, "assetType");
                            }
                          }}
                          searchPlaceholder={t("Main.Search...")}
                        />
                      </>
                    )}

                    {updatedDetails[tool.id]?.assetType === "Other" && (
                      <>
                        <Text className="text-[#070707] text-sm mt-2">
                          {t("FixedAssets.MentionOtherDetails")}
                        </Text>
                        <View className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2 justify-center">
                          <TextInput
                            className="text-black w-full text-sm"
                            style={{
                              fontSize: 12,
                              paddingVertical: 0,
                              paddingTop: 0,
                              paddingBottom: 0,
                              textAlign: "left",
                              ...(Platform.OS === "android"
                                ? { textAlignVertical: "center" }
                                : {}),
                            }}
                            placeholder={t("FixedAssets.MentionOtherDetails")}
                            value={updatedDetails[tool.id]?.mentionOther ?? ""}
                            onChangeText={(value) => {
                              handleInputChange(
                                tool.id,
                                "mentionOther",
                                value.replace(/^\s+/, ""),
                              );
                              clearFieldError(tool.id, "mentionOther");
                            }}
                            placeholderTextColor="#6B7280"
                          />
                        </View>
                        {fieldErrors[tool.id]?.mentionOther ? (
                          <Text className="text-red-500 text-xs mt-1 ml-2 mb-2">
                            {fieldErrors[tool.id].mentionOther}
                          </Text>
                        ) : null}
                      </>
                    )}

                    {/* Brand */}
                    {updatedDetails[tool.id]?.asset &&
                    brandTypesForAssets[updatedDetails[tool.id]?.asset]
                      ?.length > 0 ? (
                      <>
                        <Text className="text-[#070707] text-sm mt-2">
                          {t("FixedAssets.Brand")} *
                        </Text>
                        <DropdownTrigger
                          value={getLabel(
                            brandTypesForAssets[updatedDetails[tool.id]?.asset],
                            updatedDetails[tool.id]?.brand ?? "",
                          )}
                          placeholder={t("FixedAssets.SelectBrand")}
                          onPress={() => {
                            clearFieldError(tool.id, "brand");
                            setShowBrandModal(true);
                          }}
                          error={fieldErrors[tool.id]?.brand}
                        />
                        <GlobalSearchModal
                          visible={showBrandModal}
                          onClose={() => setShowBrandModal(false)}
                          title={t("FixedAssets.SelectBrand")}
                          data={
                            brandTypesForAssets[updatedDetails[tool.id]?.asset]
                          }
                          selectedItems={
                            updatedDetails[tool.id]?.brand
                              ? [updatedDetails[tool.id].brand]
                              : []
                          }
                          onSelect={(items) => {
                            if (items[0]) {
                              handleInputChange(tool.id, "brand", items[0]);
                              if (items[0] !== "Other") {
                                handleInputChange(tool.id, "customBrand", "");
                              }
                              clearFieldError(tool.id, "brand");
                            }
                          }}
                          searchPlaceholder={t("Main.Search...")}
                          noResultsText="No brand found"
                        />

                        {updatedDetails[tool.id]?.brand === "Other" && (
                          <>
                            <Text className="text-[#070707] text-sm mt-2">
                              {t("FixedAssets.MentionOtherBrandName")}
                            </Text>
                            <View className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2 justify-center">
                              <TextInput
                                className="text-black w-full text-sm"
                                style={{
                                  fontSize: 12,
                                  paddingVertical: 0,
                                  paddingTop: 0,
                                  paddingBottom: 0,
                                  textAlign: "left",
                                  ...(Platform.OS === "android"
                                    ? { textAlignVertical: "center" }
                                    : {}),
                                }}
                                placeholder={t("FixedAssets.EnterBrandName")}
                                value={
                                  updatedDetails[tool.id]?.customBrand ?? ""
                                }
                                onChangeText={(value) => {
                                  handleInputChange(
                                    tool.id,
                                    "customBrand",
                                    value.replace(/^\s+/, ""),
                                  );
                                  clearFieldError(tool.id, "customBrand");
                                }}
                                placeholderTextColor="#6B7280"
                              />
                            </View>
                            {fieldErrors[tool.id]?.customBrand ? (
                              <Text className="text-red-500 text-xs mt-1 ml-2 mb-2">
                                {fieldErrors[tool.id].customBrand}
                              </Text>
                            ) : null}
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <Text className="text-[#070707] text-sm mt-2">
                          {t("FixedAssets.Brand")} *
                        </Text>
                        <View className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2 justify-center">
                          <TextInput
                            className="text-black w-full text-sm"
                            style={{
                              fontSize: 12,
                              paddingVertical: 0,
                              paddingTop: 0,
                              paddingBottom: 0,
                              textAlign: "left",
                              ...(Platform.OS === "android"
                                ? { textAlignVertical: "center" }
                                : {}),
                            }}
                            placeholder={t("FixedAssets.SelectBrand")}
                            value={updatedDetails[tool.id]?.brand ?? ""}
                            editable={true}
                            onChangeText={(value) => {
                              handleInputChange(
                                tool.id,
                                "brand",
                                value.replace(/^\s+/, ""),
                              );
                              clearFieldError(tool.id, "brand");
                            }}
                            placeholderTextColor="#6B7280"
                          />
                        </View>
                        {fieldErrors[tool.id]?.brand ? (
                          <Text className="text-red-500 text-xs mt-1 ml-2 mb-2">
                            {fieldErrors[tool.id].brand}
                          </Text>
                        ) : null}
                      </>
                    )}

                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.NumberOfUnits")} *
                    </Text>
                    <View className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2 justify-center">
                      <TextInput
                        className="text-black w-full text-sm"
                        style={{
                          fontSize: 12,
                          paddingVertical: 0,
                          paddingTop: 0,
                          paddingBottom: 0,
                          textAlign: "left",
                          ...(Platform.OS === "android"
                            ? { textAlignVertical: "center" }
                            : {}),
                        }}
                        placeholder={t("FixedAssets.NumberOfUnits")}
                        value={
                          updatedDetails[tool.id]?.numberOfUnits?.toString() ??
                          ""
                        }
                        onChangeText={(text) => {
                          handleInputChange(
                            tool.id,
                            "numberOfUnits",
                            text.replace(/[^0-9]/g, ""),
                          );
                          clearFieldError(tool.id, "numberOfUnits");
                        }}
                        keyboardType="numeric"
                        placeholderTextColor="#6B7280"
                      />
                    </View>
                    {fieldErrors[tool.id]?.numberOfUnits ? (
                      <Text className="text-red-500 text-xs mt-1 ml-2 mb-2">
                        {fieldErrors[tool.id].numberOfUnits}
                      </Text>
                    ) : null}

                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.UnitPrice")} *
                    </Text>
                    <View className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2 justify-center">
                      <TextInput
                        className="text-black w-full text-sm"
                        style={{
                          fontSize: 12,
                          paddingVertical: 0,
                          paddingTop: 0,
                          paddingBottom: 0,
                          textAlign: "left",
                          ...(Platform.OS === "android"
                            ? { textAlignVertical: "center" }
                            : {}),
                        }}
                        placeholder={t("FixedAssets.UnitPrice")}
                        value={formatDecimal(
                          updatedDetails[tool.id]?.unitPrice?.toString() ?? "",
                        )}
                        onChangeText={(text) => {
                          handleInputChange(
                            tool.id,
                            "unitPrice",
                            formatDecimal(text),
                          );
                          clearFieldError(tool.id, "unitPrice");
                        }}
                        keyboardType="numeric"
                        placeholderTextColor="#6B7280"
                      />
                    </View>
                    {fieldErrors[tool.id]?.unitPrice ? (
                      <Text className="text-red-500 text-xs mt-1 ml-2 mb-2">
                        {fieldErrors[tool.id].unitPrice}
                      </Text>
                    ) : null}

                    <Text className="text-[#070707] text-sm my-2">
                      {t("FixedAssets.TotalPrice")} *
                    </Text>
                    <Text className="border border-[#F4F4F4] p-4 pl-4 rounded-full bg-gray-100 mb-2 text-sm text-black">
                      {updatedDetails[tool.id]?.totalPrice
                        ? updatedDetails[tool.id].totalPrice
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        : ""}
                    </Text>
                    {fieldErrors[tool.id]?.totalPrice ? (
                      <Text className="text-red-500 text-xs mt-1 ml-2 mb-2">
                        {fieldErrors[tool.id].totalPrice}
                      </Text>
                    ) : null}

                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.Warranty")} *
                    </Text>
                    <View className="flex-row justify-around mb-4">
                      {["yes", "no"].map((val) => (
                        <TouchableOpacity
                          key={val}
                          onPress={() => {
                            handleInputChange(tool.id, "warranty", val);
                            clearFieldError(tool.id, "purchaseDate");
                            clearFieldError(tool.id, "expireDate");
                          }}
                          className="flex-row items-center mt-2"
                        >
                          <View
                            className={`w-5 h-5 rounded-full ${
                              updatedDetails[tool.id]?.warranty === val
                                ? "bg-green-500"
                                : "bg-gray-400"
                            }`}
                          />
                          <Text className="ml-2 text-sm text-[#070707]">
                            {t(`FixedAssets.${val}`)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {updatedDetails[tool.id]?.warranty === "yes" && (
                      <>
                        <Text className="text-[#070707] text-sm mt-2">
                          {t("FixedAssets.PurchasedDate")} *
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            clearFieldError(tool.id, "purchaseDate");
                            setShowPurchaseDatePicker((prev) => !prev);
                          }}
                          className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] justify-center flex-row items-center mt-2 mb-2"
                        >
                          <Text
                            className={`flex-1 text-sm ${!updatedDetails[tool.id]?.ownershipDetails?.purchaseDate ? "text-[#6B7280]" : "text-black"}`}
                          >
                            {updatedDetails[tool.id]?.ownershipDetails
                              ?.purchaseDate
                              ? formatDate(
                                  updatedDetails[tool.id].ownershipDetails
                                    .purchaseDate,
                                )
                              : t("FixedAssets.PurchasedDate")}
                          </Text>
                          <EvilIcons
                            name="calendar"
                            size={28}
                            color="#5e5d5d"
                          />
                        </TouchableOpacity>
                        {fieldErrors[tool.id]?.purchaseDate ? (
                          <Text className="text-red-500 text-xs mt-1 ml-2 mb-2">
                            {fieldErrors[tool.id].purchaseDate}
                          </Text>
                        ) : null}
                        {Platform.OS === "ios" ? (
                          <CustomDatePicker
                            visible={showPurchaseDatePicker}
                            onClose={() => setShowPurchaseDatePicker(false)}
                            value={parseDate(
                              updatedDetails[tool.id]?.ownershipDetails
                                ?.purchaseDate,
                            )}
                            onConfirm={(date) => {
                              handlePurchaseDateChange(tool.id, date);
                            }}
                            maximumDate={new Date()}
                            title={t("FixedAssets.PurchasedDate")}
                          />
                        ) : (
                          showPurchaseDatePicker && (
                            <DateTimePicker
                              value={
                                parseDate(
                                  updatedDetails[tool.id]?.ownershipDetails
                                    ?.purchaseDate,
                                ) || new Date()
                              }
                              mode="date"
                              display="default"
                              onChange={(event, selectedDate) => {
                                setShowPurchaseDatePicker(false);
                                if (event.type === "set" && selectedDate)
                                  handlePurchaseDateChange(
                                    tool.id,
                                    selectedDate,
                                  );
                              }}
                              maximumDate={new Date()}
                            />
                          )
                        )}
                        {purchaseDateError ? (
                          <Text className="text-red-500 p-2 text-center text-sm">
                            {purchaseDateError}
                          </Text>
                        ) : null}

                        <Text className="text-[#070707] text-sm mt-2">
                          {t("FixedAssets.WarrantyExpireDate")} *
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            clearFieldError(tool.id, "expireDate");
                            setShowExpireDatePicker((prev) => !prev);
                          }}
                          className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] justify-center flex-row items-center mt-2 mb-2"
                        >
                          <Text
                            className={`flex-1 text-sm ${!updatedDetails[tool.id]?.ownershipDetails?.expireDate ? "text-[#6B7280]" : "text-black"}`}
                          >
                            {updatedDetails[tool.id]?.ownershipDetails
                              ?.expireDate
                              ? formatDate(
                                  updatedDetails[tool.id].ownershipDetails
                                    .expireDate,
                                )
                              : t("FixedAssets.WarrantyExpireDate")}
                          </Text>
                          <EvilIcons
                            name="calendar"
                            size={28}
                            color="#5e5d5d"
                          />
                        </TouchableOpacity>
                        {fieldErrors[tool.id]?.expireDate ? (
                          <Text className="text-red-500 text-xs mt-1 ml-2 mb-2">
                            {fieldErrors[tool.id].expireDate}
                          </Text>
                        ) : null}
                        {Platform.OS === "ios" ? (
                          <CustomDatePicker
                            visible={showExpireDatePicker}
                            onClose={() => setShowExpireDatePicker(false)}
                            value={parseDate(
                              updatedDetails[tool.id]?.ownershipDetails
                                ?.expireDate,
                            )}
                            onConfirm={(date) => {
                              handleExpireDateChange(tool.id, date);
                            }}
                            minimumDate={getStartOfTomorrow()}
                            title={t("FixedAssets.WarrantyExpireDate")}
                          />
                        ) : (
                          showExpireDatePicker && (
                            <DateTimePicker
                              value={
                                parseDate(
                                  updatedDetails[tool.id]?.ownershipDetails
                                    ?.expireDate,
                                ) || new Date()
                              }
                              mode="date"
                              display="default"
                              onChange={(event, selectedDate) => {
                                setShowExpireDatePicker(false);
                                if (event.type === "set" && selectedDate)
                                  handleExpireDateChange(tool.id, selectedDate);
                              }}
                              minimumDate={getStartOfTomorrow()}
                            />
                          )
                        )}
                        {expireDateError ? (
                          <Text className="text-red-500 p-2 text-center text-sm">
                            {expireDateError}
                          </Text>
                        ) : null}

                        <Text className="text-[#070707] text-sm mt-2">
                          {t("FixedAssets.WarrantyCoverageStatus")}
                        </Text>
                        <View className="border border-[#F4F4F4] rounded-full bg-gray-100 p-2 mt-2 h-[50px] justify-center">
                          <Text
                            style={{
                              color: updatedDetails[tool.id]?.ownershipDetails
                                ?.expireDate
                                ? new Date(
                                    updatedDetails[tool.id].ownershipDetails
                                      .expireDate,
                                  ) > new Date()
                                  ? "#26D041"
                                  : "#FF0000"
                                : "#6B7280",
                              fontWeight: "bold",
                              textAlign: "center",
                            }}
                            className="text-sm"
                          >
                            {updatedDetails[tool.id]?.ownershipDetails
                              ?.expireDate
                              ? new Date(
                                  updatedDetails[tool.id].ownershipDetails
                                    .expireDate,
                                ) > new Date()
                                ? t("FixedAssets.UnderWarranty")
                                : t("FixedAssets.Expired")
                              : t("FixedAssets.NotSelected")}
                          </Text>
                        </View>
                      </>
                    )}
                  </>
                )}

                {tool.category === "Tools" && (
                  <>
                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.Asset")} *
                    </Text>
                    <DropdownTrigger
                      value={getLabel(
                        ToolAssets,
                        updatedDetails[tool.id]?.asset ?? "",
                      )}
                      placeholder={t("FixedAssets.SelectAssetIsRequired")}
                      onPress={() => {
                        clearFieldError(tool.id, "asset");
                        setShowAssetModal(true);
                      }}
                      error={fieldErrors[tool.id]?.asset}
                    />
                    <GlobalSearchModal
                      visible={showAssetModal}
                      onClose={() => setShowAssetModal(false)}
                      title={t("FixedAssets.Asset")}
                      data={ToolAssets}
                      selectedItems={
                        updatedDetails[tool.id]?.asset
                          ? [updatedDetails[tool.id].asset]
                          : []
                      }
                      onSelect={(items) => {
                        if (items[0]) {
                          handleInputChange(tool.id, "asset", items[0]);
                          handleInputChange(tool.id, "mentionOther", "");
                          handleInputChange(tool.id, "brand", "");
                          handleInputChange(tool.id, "customBrand", "");
                          setSelectedAsset(items[0]);
                          clearFieldError(tool.id, "asset");
                          clearFieldError(tool.id, "brand");
                        }
                      }}
                      searchPlaceholder={t("Main.Search...")}
                    />

                    {updatedDetails[tool.id]?.asset === "Other" && (
                      <>
                        <Text className="text-[#070707] text-sm mt-2">
                          {t("FixedAssets.MentionOtherDetails")}
                        </Text>
                        <View className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2 justify-center">
                          <TextInput
                            className="text-black w-full text-sm"
                            style={{
                              fontSize: 12,
                              paddingVertical: 0,
                              paddingTop: 0,
                              paddingBottom: 0,
                              textAlign: "left",
                              ...(Platform.OS === "android"
                                ? { textAlignVertical: "center" }
                                : {}),
                            }}
                            placeholder={t("FixedAssets.MentionOtherDetails")}
                            value={updatedDetails[tool.id]?.mentionOther ?? ""}
                            onChangeText={(value) => {
                              handleInputChange(
                                tool.id,
                                "mentionOther",
                                value.replace(/^\s+/, ""),
                              );
                              clearFieldError(tool.id, "mentionOther");
                            }}
                            placeholderTextColor="#6B7280"
                          />
                        </View>
                        {fieldErrors[tool.id]?.mentionOther ? (
                          <Text className="text-red-500 text-xs mt-1 ml-2 mb-2">
                            {fieldErrors[tool.id].mentionOther}
                          </Text>
                        ) : null}
                      </>
                    )}

                    {/* Brand */}
                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.Brand")} *
                    </Text>
                    <DropdownTrigger
                      value={getLabel(
                        toolBrandOptions,
                        updatedDetails[tool.id]?.brand ?? "",
                      )}
                      placeholder={t("FixedAssets.SelectBrand")}
                      onPress={() => {
                        clearFieldError(tool.id, "brand");
                        setShowToolBrandModal(true);
                      }}
                      error={fieldErrors[tool.id]?.brand}
                    />
                    <GlobalSearchModal
                      visible={showToolBrandModal}
                      onClose={() => setShowToolBrandModal(false)}
                      title={t("FixedAssets.Brand")}
                      data={toolBrandOptions}
                      selectedItems={
                        updatedDetails[tool.id]?.brand
                          ? [updatedDetails[tool.id].brand]
                          : []
                      }
                      onSelect={(items) => {
                        if (items[0]) {
                          handleInputChange(tool.id, "brand", items[0]);
                          if (items[0] !== "Other") {
                            handleInputChange(tool.id, "customBrand", "");
                          }
                          clearFieldError(tool.id, "brand");
                        }
                      }}
                      searchPlaceholder={t("Main.Search...")}
                      noResultsText="No brand found"
                    />

                    {updatedDetails[tool.id]?.brand === "Other" && (
                      <>
                        <Text className="text-[#070707] text-sm mt-2">
                          {t("FixedAssets.MentionOtherBrandName")}
                        </Text>
                        <View className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2 justify-center">
                          <TextInput
                            className="text-black w-full text-sm"
                            style={{
                              fontSize: 12,
                              paddingVertical: 0,
                              paddingTop: 0,
                              paddingBottom: 0,
                              textAlign: "left",
                              ...(Platform.OS === "android"
                                ? { textAlignVertical: "center" }
                                : {}),
                            }}
                            placeholder={t("FixedAssets.EnterBrandName")}
                            value={updatedDetails[tool.id]?.customBrand ?? ""}
                            onChangeText={(value) => {
                              handleInputChange(
                                tool.id,
                                "customBrand",
                                value.replace(/^\s+/, ""),
                              );
                              clearFieldError(tool.id, "customBrand");
                            }}
                            placeholderTextColor="#6B7280"
                          />
                        </View>
                        {fieldErrors[tool.id]?.customBrand ? (
                          <Text className="text-red-500 text-xs mt-1 ml-2 mb-2">
                            {fieldErrors[tool.id].customBrand}
                          </Text>
                        ) : null}
                      </>
                    )}

                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.NumberOfUnits")} *
                    </Text>
                    <View className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2 justify-center">
                      <TextInput
                        className="text-black w-full text-sm"
                        style={{
                          fontSize: 12,
                          paddingVertical: 0,
                          paddingTop: 0,
                          paddingBottom: 0,
                          textAlign: "left",
                          ...(Platform.OS === "android"
                            ? { textAlignVertical: "center" }
                            : {}),
                        }}
                        placeholder={t("FixedAssets.NumberOfUnits")}
                        value={
                          updatedDetails[tool.id]?.numberOfUnits?.toString() ??
                          ""
                        }
                        onChangeText={(text) => {
                          handleInputChange(
                            tool.id,
                            "numberOfUnits",
                            text.replace(/[^0-9]/g, ""),
                          );
                          clearFieldError(tool.id, "numberOfUnits");
                        }}
                        keyboardType="numeric"
                        placeholderTextColor="#6B7280"
                      />
                    </View>
                    {fieldErrors[tool.id]?.numberOfUnits ? (
                      <Text className="text-red-500 text-xs mt-1 ml-2 mb-2">
                        {fieldErrors[tool.id].numberOfUnits}
                      </Text>
                    ) : null}

                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.UnitPrice")} *
                    </Text>
                    <View className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] mt-2 mb-2 justify-center">
                      <TextInput
                        className="text-black w-full text-sm"
                        style={{
                          fontSize: 12,
                          paddingVertical: 0,
                          paddingTop: 0,
                          paddingBottom: 0,
                          textAlign: "left",
                          ...(Platform.OS === "android"
                            ? { textAlignVertical: "center" }
                            : {}),
                        }}
                        placeholder={t("FixedAssets.UnitPrice")}
                        value={formatDecimal(
                          updatedDetails[tool.id]?.unitPrice?.toString() ?? "",
                        )}
                        onChangeText={(text) => {
                          handleInputChange(
                            tool.id,
                            "unitPrice",
                            formatDecimal(text),
                          );
                          clearFieldError(tool.id, "unitPrice");
                        }}
                        keyboardType="numeric"
                        placeholderTextColor="#6B7280"
                      />
                    </View>
                    {fieldErrors[tool.id]?.unitPrice ? (
                      <Text className="text-red-500 text-xs mt-1 ml-2 mb-2">
                        {fieldErrors[tool.id].unitPrice}
                      </Text>
                    ) : null}

                    <Text className="text-[#070707] text-sm my-2">
                      {t("FixedAssets.TotalPrice")}
                    </Text>
                    <Text className="border border-[#F4F4F4] p-4 pl-4 rounded-full bg-gray-100 mb-4 text-sm text-black">
                      {updatedDetails[tool.id]?.totalPrice
                        ? (() => {
                            const raw = updatedDetails[tool.id].totalPrice
                              .toString()
                              .replace(/,/g, "");
                            const parts = raw.split(".");
                            return (
                              parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
                              (parts[1] !== undefined
                                ? "." + parts[1].slice(0, 2)
                                : ".00")
                            );
                          })()
                        : ""}
                    </Text>

                    <Text className="text-[#070707] text-sm mt-2">
                      {t("FixedAssets.Warranty")} *
                    </Text>
                    <View className="flex-row justify-around mb-4">
                      {["yes", "no"].map((val) => (
                        <TouchableOpacity
                          key={val}
                          onPress={() => {
                            handleInputChange(tool.id, "warranty", val);
                            clearFieldError(tool.id, "purchaseDate");
                            clearFieldError(tool.id, "expireDate");
                          }}
                          className="flex-row items-center mt-2"
                        >
                          <View
                            className={`w-5 h-5 rounded-full ${
                              updatedDetails[tool.id]?.warranty === val
                                ? "bg-green-500"
                                : "bg-gray-400"
                            }`}
                          />
                          <Text className="ml-2 text-sm text-[#070707]">
                            {t(`FixedAssets.${val}`)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {updatedDetails[tool.id]?.warranty === "yes" && (
                      <>
                        <Text className="text-[#070707] text-sm mt-2">
                          {t("FixedAssets.PurchasedDate")} *
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            clearFieldError(tool.id, "purchaseDate");
                            setShowPurchaseDatePicker((prev) => !prev);
                          }}
                          className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] justify-center flex-row items-center mt-2 mb-2"
                        >
                          <Text
                            className={`flex-1 text-sm ${!updatedDetails[tool.id]?.ownershipDetails?.purchaseDate ? "text-[#6B7280]" : "text-black"}`}
                          >
                            {updatedDetails[tool.id]?.ownershipDetails
                              ?.purchaseDate
                              ? formatDate(
                                  updatedDetails[tool.id].ownershipDetails
                                    .purchaseDate,
                                )
                              : t("FixedAssets.PurchasedDate")}
                          </Text>
                          <EvilIcons
                            name="calendar"
                            size={28}
                            color="#5e5d5d"
                          />
                        </TouchableOpacity>
                        {fieldErrors[tool.id]?.purchaseDate ? (
                          <Text className="text-red-500 text-xs mt-1 ml-2 mb-2">
                            {fieldErrors[tool.id].purchaseDate}
                          </Text>
                        ) : null}
                        {Platform.OS === "ios" ? (
                          <CustomDatePicker
                            visible={showPurchaseDatePicker}
                            onClose={() => setShowPurchaseDatePicker(false)}
                            value={parseDate(
                              updatedDetails[tool.id]?.ownershipDetails
                                ?.purchaseDate,
                            )}
                            onConfirm={(date) => {
                              handlePurchaseDateChange(tool.id, date);
                            }}
                            maximumDate={new Date()}
                            title={t("FixedAssets.PurchasedDate")}
                          />
                        ) : (
                          showPurchaseDatePicker && (
                            <DateTimePicker
                              value={
                                parseDate(
                                  updatedDetails[tool.id]?.ownershipDetails
                                    ?.purchaseDate,
                                ) || new Date()
                              }
                              mode="date"
                              display="default"
                              onChange={(event, selectedDate) => {
                                setShowPurchaseDatePicker(false);
                                if (event.type === "set" && selectedDate)
                                  handlePurchaseDateChange(
                                    tool.id,
                                    selectedDate,
                                  );
                              }}
                              maximumDate={new Date()}
                            />
                          )
                        )}
                        {purchaseDateError ? (
                          <Text className="text-red-500 p-2 text-center text-sm">
                            {purchaseDateError}
                          </Text>
                        ) : null}

                        <Text className="text-[#070707] text-sm mt-2">
                          {t("FixedAssets.WarrantyExpireDate")} *
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            clearFieldError(tool.id, "expireDate");
                            setShowExpireDatePicker((prev) => !prev);
                          }}
                          className="bg-[#F4F4F4] px-4 rounded-3xl h-[50px] justify-center flex-row items-center mt-2 mb-2"
                        >
                          <Text
                            className={`flex-1 text-sm ${!updatedDetails[tool.id]?.ownershipDetails?.expireDate ? "text-[#6B7280]" : "text-black"}`}
                          >
                            {updatedDetails[tool.id]?.ownershipDetails
                              ?.expireDate
                              ? formatDate(
                                  updatedDetails[tool.id].ownershipDetails
                                    .expireDate,
                                )
                              : t("FixedAssets.WarrantyExpireDate")}
                          </Text>
                          <EvilIcons
                            name="calendar"
                            size={28}
                            color="#5e5d5d"
                          />
                        </TouchableOpacity>
                        {fieldErrors[tool.id]?.expireDate ? (
                          <Text className="text-red-500 text-xs mt-1 ml-2 mb-2">
                            {fieldErrors[tool.id].expireDate}
                          </Text>
                        ) : null}
                        {Platform.OS === "ios" ? (
                          <CustomDatePicker
                            visible={showExpireDatePicker}
                            onClose={() => setShowExpireDatePicker(false)}
                            value={
                              updatedDetails[tool.id]?.ownershipDetails
                                ?.expireDate
                                ? new Date(
                                    updatedDetails[tool.id].ownershipDetails
                                      .expireDate,
                                  )
                                : null
                            }
                            onConfirm={(date) => {
                              handleExpireDateChange(tool.id, date);
                            }}
                            minimumDate={getStartOfTomorrow()}
                            title={t("FixedAssets.WarrantyExpireDate")}
                          />
                        ) : (
                          showExpireDatePicker && (
                            <DateTimePicker
                              value={
                                parseDate(
                                  updatedDetails[tool.id]?.ownershipDetails
                                    ?.expireDate,
                                ) || new Date()
                              }
                              mode="date"
                              display="default"
                              onChange={(event, selectedDate) => {
                                setShowExpireDatePicker(false);
                                if (event.type === "set" && selectedDate)
                                  handleExpireDateChange(tool.id, selectedDate);
                              }}
                              minimumDate={getStartOfTomorrow()}
                            />
                          )
                        )}
                        {expireDateError ? (
                          <Text className="text-red-500 p-2 text-center text-sm">
                            {expireDateError}
                          </Text>
                        ) : null}

                        <Text className="text-[#070707] text-sm mt-2">
                          {t("FixedAssets.WarrantyCoverageStatus")}
                        </Text>
                        <View className="border border-[#F4F4F4] rounded-full bg-gray-100 p-2 mt-2">
                          <Text
                            style={{
                              color:
                                updatedDetails[tool.id]?.ownershipDetails
                                  ?.expireDate &&
                                new Date(
                                  updatedDetails[tool.id].ownershipDetails
                                    .expireDate,
                                ) > new Date()
                                  ? "#26D041"
                                  : "#FF0000",
                              fontWeight: "bold",
                              textAlign: "center",
                            }}
                            className="text-sm"
                          >
                            {updatedDetails[tool.id]?.ownershipDetails
                              ?.expireDate &&
                            new Date(
                              updatedDetails[tool.id].ownershipDetails
                                .expireDate,
                            ) > new Date()
                              ? t("FixedAssets.UnderWarranty")
                              : t("FixedAssets.Expired")}
                          </Text>
                        </View>
                      </>
                    )}
                  </>
                )}

                {/* Submit button */}
                <TouchableOpacity
                  onPress={handleUpdateTools}
                  className="bg-[#353535] rounded-3xl h-[50px] justify-center items-center m-6"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4.65,
                    elevation: 8,
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text className="text-white text-center font-semibold text-lg">
                      {t("FixedAssets.UpdateAsset")}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
};

export default UpdateAsset;
