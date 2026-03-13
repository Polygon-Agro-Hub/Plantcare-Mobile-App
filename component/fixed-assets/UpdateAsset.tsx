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
} from "react-native";
import { StatusBar, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { environment } from "@/environment/environment";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";
import GlobalSearchModal from "../../component/common/GlobalSearchModal";
import districtData from "../../assets/jsons/district.json";
import CustomHeader from "../common/CustomHeader";

type RootStackParamList = {
  UpdateAsset: { selectedTools: number[]; category: string; toolId: any };
};
type Props = NativeStackScreenProps<RootStackParamList, "UpdateAsset">;

const UpdateAsset: React.FC<Props> = ({ navigation, route }) => {
  const { selectedTools, category } = route.params;
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedDetails, setUpdatedDetails] = useState<any>({});

  const [showExpireDatePicker, setShowExpireDatePicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [showIssuedDatePicker, setShowIssuedDatePicker] = useState(false);
  const [issuedDate, setIssuedDate] = useState(new Date());

  const [purchaseDateError, setPurchaseDateError] = useState("");
  const [expireDateError, setExpireDateError] = useState("");

  const { t } = useTranslation();
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showOwnershipModal, setShowOwnershipModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showAssetTypeModal, setShowAssetTypeModal] = useState(false);
  const [showGeneralConditionModal, setShowGeneralConditionModal] =
    useState(false);

  const [showPurchaseDatePicker, setShowPurchaseDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const validatePurchaseDate = (selectedDate: Date, toolId: string) => {
    const currentDate = new Date();
    if (selectedDate > currentDate) {
      setPurchaseDateError(t("FixedAssets.purchaseDateFutureError"));
      return false;
    }
    setPurchaseDateError("");
    return true;
  };

  const validateExpireDate = (selectedDate: Date, toolId: string) => {
    const purchaseDate = updatedDetails[toolId]?.ownershipDetails?.purchaseDate
      ? new Date(updatedDetails[toolId].ownershipDetails.purchaseDate)
      : null;
    if (purchaseDate && selectedDate <= purchaseDate) {
      return false;
    }
    setExpireDateError("");
    return true;
  };

  const handlePurchaseDateChange = (
    toolId: string,
    selectedDate: Date | undefined,
  ) => {
    if (selectedDate) {
      if (validatePurchaseDate(selectedDate, toolId)) {
        const formattedDate = selectedDate.toISOString().split("T")[0];
        handleInputChange(
          toolId,
          "ownershipDetails.purchaseDate",
          formattedDate,
        );
        const expireDate = updatedDetails[toolId]?.ownershipDetails?.expireDate;
        if (expireDate) {
          validateExpireDate(new Date(expireDate), toolId);
        }
      }
    }
  };

  const handleExpireDateChange = (
    toolId: string,
    selectedDate: Date | undefined,
  ) => {
    if (selectedDate) {
      if (validateExpireDate(selectedDate, toolId)) {
        const formattedDate = selectedDate.toISOString().split("T")[0];
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

  const districtOptions = districtData.map((item) => ({
    key: item.name,
    value: item.name,
    label: t(item.translationKey),
  }));

  const ownershipCategories = [
    {
      key: "1",
      value: "Own Building (with title ownership)",
      label: t("FixedAssets.ownBuilding"),
    },
    {
      key: "2",
      value: "Leased Building",
      label: t("FixedAssets.leasedBuilding"),
    },
    {
      key: "3",
      value: "Permit Building",
      label: t("FixedAssets.permitBuilding"),
    },
    {
      key: "4",
      value: "Shared / No Ownership",
      label: t("FixedAssets.sharedOwnership"),
    },
  ];

  const landownershipCategories = [
    { key: "1", value: "Own", label: t("FixedAssets.OwnLand") },
    { key: "2", value: "Lease", label: t("FixedAssets.LeaseLand") },
    { key: "3", value: "Permited", label: t("FixedAssets.PermittedLand") },
    { key: "4", value: "Shared", label: t("FixedAssets.SharedOwnership") },
  ];

  const Machineasset = [
    { key: "1", value: "Tractors", label: t("FixedAssets.Tractors") },
    { key: "2", value: "Rotavator", label: t("FixedAssets.Rotavator") },
    {
      key: "3",
      value: "Combine Harvesters",
      label: t("FixedAssets.CombineHarvesters"),
    },
    { key: "4", value: "Transplanter", label: t("FixedAssets.Transplanter") },
    {
      key: "5",
      value: "Tillage Equipment",
      label: t("FixedAssets.TillageEquipment"),
    },
    {
      key: "6",
      value: "Sowing Equipment",
      label: t("FixedAssets.SowingEquipment"),
    },
    {
      key: "7",
      value: "Harvesting Equipment",
      label: t("FixedAssets.HarvestingEquipment"),
    },
    {
      key: "8",
      value: "Threshers, Reaper, Binders",
      label: t("FixedAssets.ThreshersReaperBinders"),
    },
    {
      key: "9",
      value: "Cleaning, Grading and Weighing Equipment",
      label: t("FixedAssets.CleaningGradingEquipment"),
    },
    { key: "10", value: "Weeding", label: t("FixedAssets.Weeding") },
    { key: "11", value: "Sprayers", label: t("FixedAssets.Sprayers") },
    {
      key: "12",
      value: "Shelling and Grinding Machine",
      label: t("FixedAssets.ShellingGrindingMachine"),
    },
    { key: "13", value: "Sowing", label: t("FixedAssets.Sowing") },
  ];

  const ToolAssets = [
    { key: "1", value: "Hand Fork", label: t("FixedAssets.handFork") },
    { key: "2", value: "Cutting knife", label: t("FixedAssets.cuttingKnife") },
    { key: "3", value: "Iluk kaththa", label: t("FixedAssets.ilukKaththa") },
    { key: "4", value: "Kaththa", label: t("FixedAssets.kaththa") },
    {
      key: "5",
      value: "Kara diga manna",
      label: t("FixedAssets.karaDigaManna"),
    },
    {
      key: "6",
      value: "Coconut harvesting knife",
      label: t("FixedAssets.coconutHarvestingKnife"),
    },
    { key: "7", value: "Tapping knife", label: t("FixedAssets.tappingKnife") },
    { key: "8", value: "Mamotie", label: t("FixedAssets.mamotie") },
    { key: "9", value: "Manna knife", label: t("FixedAssets.mannaKnife") },
    { key: "10", value: "Shovel", label: t("FixedAssets.shovel") },
    { key: "11", value: "Small axe", label: t("FixedAssets.smallAxe") },
    { key: "12", value: "Pruning knife", label: t("FixedAssets.puningKnife") },
    { key: "13", value: "Hoe with fork", label: t("FixedAssets.hoeWithFork") },
    { key: "14", value: "Fork hoe", label: t("FixedAssets.forkHoe") },
    { key: "15", value: "Sickle - paddy", label: t("FixedAssets.sicklePaddy") },
    { key: "16", value: "Grow bags", label: t("FixedAssets.growBags") },
    { key: "17", value: "Seedling tray", label: t("FixedAssets.seedlingTray") },
    { key: "18", value: "Fogger", label: t("FixedAssets.fogger") },
    {
      key: "19",
      value: "Drip Irrigation system",
      label: t("FixedAssets.dripIrrigationSystem"),
    },
    {
      key: "20",
      value: "Sprinkler Irrigation system",
      label: t("FixedAssets.sprinklerIrrigationSystem"),
    },
    { key: "21", value: "Water pump", label: t("FixedAssets.waterPump") },
    { key: "22", value: "Water tank", label: t("FixedAssets.waterTank") },
    { key: "23", value: "Other", label: t("FixedAssets.other") },
  ];

  const assetTypesForAssets: any = {
    Tractors: [
      { key: "4", value: "2WD", label: t("FixedAssets.2WD") },
      { key: "5", value: "4WD", label: t("FixedAssets.4WD") },
      { key: "6", value: "Other", label: t("FixedAssets.other") },
    ],
    Transplanter: [
      {
        key: "14",
        value: "Paddy transplanter",
        label: t("FixedAssets.Paddytransplanter"),
      },
      { key: "31", value: "Other", label: t("FixedAssets.other") },
    ],
    "Harvesting equipment": [
      {
        key: "15",
        value: "Sugarcane harvester",
        label: t("FixedAssets.Sugarcaneharvester"),
      },
      {
        key: "16",
        value: "Static shedder",
        label: t("FixedAssets.Staticshedder"),
      },
      {
        key: "17",
        value: "Mini combine harvester",
        label: t("FixedAssets.Minicombineharvester"),
      },
      {
        key: "18",
        value: "Rice Combine harvester",
        label: t("FixedAssets.RiceCombineharvester"),
      },
      {
        key: "19",
        value: "Paddy harvester",
        label: t("FixedAssets.Paddyharvester"),
      },
      {
        key: "20",
        value: "Maize harvester",
        label: t("FixedAssets.Maizeharvester"),
      },
      { key: "32", value: "Other", label: t("FixedAssets.other") },
    ],
    "Cleaning, Grading and Weighing Equipment": [
      { key: "21", value: "Seperator", label: t("FixedAssets.Seperator") },
      {
        key: "22",
        value: "Centrifugal Stier Machine",
        label: t("FixedAssets.CentrifugalStierMachine"),
      },
      {
        key: "23",
        value: "Grain Classifier Seperator",
        label: t("FixedAssets.GrainClassifierSeperator"),
      },
      {
        key: "24",
        value: "Destoner Machine",
        label: t("FixedAssets.DestonerMachine"),
      },
      { key: "33", value: "Other", label: t("FixedAssets.other") },
    ],
    Sprayers: [
      {
        key: "25",
        value: "Knapsack Sprayer",
        label: t("FixedAssets.KnapsackSprayer"),
      },
      {
        key: "26",
        value: "Chemical Sprayer",
        label: t("FixedAssets.ChemicalSprayer"),
      },
      { key: "27", value: "Mist Blower", label: t("FixedAssets.MistBlower") },
      {
        key: "28",
        value: "Environmental friendly sprayer",
        label: t("FixedAssets.Environmentalfriendlysprayer"),
      },
      {
        key: "29",
        value: "Drone sprayer",
        label: t("FixedAssets.Dronesprayer"),
      },
      {
        key: "30",
        value: "Pressure Sprayer",
        label: t("FixedAssets.PressureSprayer"),
      },
      { key: "34", value: "Other", label: t("FixedAssets.other") },
    ],
  };

  const assetTypesForBuilding = [
    { key: "1", value: "Barn", label: t("FixedAssets.barn") },
    { key: "2", value: "Silo", label: t("FixedAssets.silo") },
    {
      key: "3",
      value: "Greenhouse structure",
      label: t("FixedAssets.greenhouseStructure"),
    },
    {
      key: "4",
      value: "Storage facility",
      label: t("FixedAssets.storageFacility"),
    },
    { key: "5", value: "Storage shed", label: t("FixedAssets.storageShed") },
    {
      key: "6",
      value: "Processing facility",
      label: t("FixedAssets.processingFacility"),
    },
    { key: "7", value: "Packing shed", label: t("FixedAssets.packingShed") },
    { key: "8", value: "Dairy parlor", label: t("FixedAssets.dairyParlor") },
    { key: "9", value: "Poultry house", label: t("FixedAssets.poultryHouse") },
    {
      key: "10",
      value: "Livestock shelter",
      label: t("FixedAssets.livestockShelter"),
    },
  ];

  const generalConditionOptions = [
    { key: "1", value: "Good", label: t("FixedAssets.good") },
    { key: "2", value: "Average", label: t("FixedAssets.average") },
    { key: "3", value: "Poor", label: t("FixedAssets.poor") },
  ];

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
            acc[tool.id] = { ...tool };
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

  const validateTool = (toolDetails: any, category: string) => {
    const errors: string[] = [];
    if (category === "Land") {
      if (!toolDetails.district) errors.push(t("FixedAssets.districtRequired"));
      if (
        !toolDetails.extentha &&
        !toolDetails.extentac &&
        !toolDetails.extentp
      )
        errors.push(t("FixedAssets.extentRequired"));
      if (!toolDetails.ownership)
        errors.push(t("FixedAssets.ownershipRequired"));
      const ownership = toolDetails.ownership;
      const ownershipDetails = toolDetails.ownershipDetails || {};
      switch (ownership) {
        case "Lease":
          if (!ownershipDetails.startDate)
            errors.push(t("FixedAssets.startDateRequired"));
          if (
            !ownershipDetails.durationYears &&
            !ownershipDetails.durationMonths
          )
            errors.push(t("FixedAssets.durationRequired"));
          else {
            if (!ownershipDetails.durationYears)
              ownershipDetails.durationYears = 0;
            if (!ownershipDetails.durationMonths)
              ownershipDetails.durationMonths = 0;
          }
          if (!ownershipDetails.leastAmountAnnually)
            errors.push(t("FixedAssets.leasedAmountRequired"));
          break;
        case "Permited":
          if (!ownershipDetails.issuedDate)
            errors.push(t("FixedAssets.issuedDateRequired"));
          if (!ownershipDetails.permitFeeAnnually)
            errors.push(t("FixedAssets.permitFeeRequired"));
          break;
        case "Own":
          if (!ownershipDetails.estimateValue)
            errors.push(t("FixedAssets.estimateValueRequired"));
          if (!ownershipDetails.issuedDate)
            errors.push(t("FixedAssets.issuedDateRequired"));
          break;
        case "Shared":
          if (!ownershipDetails.paymentAnnually)
            errors.push(t("FixedAssets.paymentAnnuallyRequired"));
          break;
      }
    } else if (category === "Building and Infrastructures") {
      if (!toolDetails.type) errors.push(t("FixedAssets.typeRequired"));
      if (!toolDetails.floorArea)
        errors.push(t("FixedAssets.floorAreaRequired"));
      if (!toolDetails.ownership)
        errors.push(t("FixedAssets.ownershipRequired"));
      if (!toolDetails.generalCondition)
        errors.push(t("FixedAssets.generalConditionRequired"));
      const ownership = toolDetails.ownership;
      const ownershipDetails = toolDetails.ownershipDetails || {};
      switch (ownership) {
        case "Leased Building":
          if (!ownershipDetails.startDate)
            errors.push(t("FixedAssets.startDateRequired"));
          if (
            !ownershipDetails.durationYears &&
            !ownershipDetails.durationMonths
          )
            errors.push(t("FixedAssets.durationRequired"));
          else {
            if (!ownershipDetails.durationYears)
              ownershipDetails.durationYears = 0;
            if (!ownershipDetails.durationMonths)
              ownershipDetails.durationMonths = 0;
          }
          if (!ownershipDetails.leastAmountAnnually)
            errors.push(t("FixedAssets.leasedAmountRequired"));
          break;
        case "Permit Building":
          if (!ownershipDetails.issuedDate)
            errors.push(t("FixedAssets.issuedDateRequired"));
          if (!ownershipDetails.permitFeeAnnually)
            errors.push(t("FixedAssets.permitFeeRequired"));
          break;
        case "Own Building (with title ownership)":
          if (!ownershipDetails.estimateValue)
            errors.push(t("FixedAssets.estimateValueRequired"));
          if (!ownershipDetails.issuedDate)
            errors.push(t("FixedAssets.issuedDateRequired"));
          break;
        case "Shared / No Ownership":
          if (!ownershipDetails.paymentAnnually)
            errors.push(t("FixedAssets.paymentAnnuallyRequired"));
          break;
      }
    } else if (category === "Machine and Vehicles") {
      if (!toolDetails.asset) errors.push(t("FixedAssets.assetRequired"));
      const assetTypeOptions = assetTypesForAssets[toolDetails.asset];
      if (assetTypeOptions && !toolDetails.assetType)
        errors.push(t("FixedAssets.assetTypeRequired"));
      if (toolDetails.assetType === "Other" && !toolDetails.mentionOther)
        errors.push(t("FixedAssets.mentionOtherRequired"));
      if (!toolDetails.brand) errors.push(t("FixedAssets.brandRequired"));
      if (!toolDetails.numberOfUnits)
        errors.push(t("FixedAssets.numberOfUnitsRequired"));
      if (!toolDetails.unitPrice)
        errors.push(t("FixedAssets.unitPriceRequired"));
      if (!toolDetails.totalPrice)
        errors.push(t("FixedAssets.totalPriceRequired"));
      if (isNaN(Number(toolDetails.numberOfUnits)))
        errors.push(t("FixedAssets.numberOfUnitsNumber"));
      if (isNaN(Number(toolDetails.unitPrice)))
        errors.push(t("FixedAssets.unitPriceNumber"));
      if (isNaN(Number(toolDetails.totalPrice)))
        errors.push(t("FixedAssets.totalPriceNumber"));
      if (toolDetails.warranty === "yes") {
        if (!toolDetails.ownershipDetails?.purchaseDate)
          errors.push(t("FixedAssets.purchaseDateRequired"));
        if (!toolDetails.ownershipDetails?.expireDate)
          errors.push(t("FixedAssets.expireDateRequired"));
      }
    } else if (category === "Tools") {
      if (!toolDetails.asset) errors.push(t("FixedAssets.assetRequired"));
      if (toolDetails.asset === "Other" && !toolDetails.mentionOther)
        errors.push(t("FixedAssets.mentionOtherRequired"));
      if (!toolDetails.brand) errors.push(t("FixedAssets.brandRequired"));
      if (!toolDetails.numberOfUnits)
        errors.push(t("FixedAssets.numberOfUnitsRequired"));
      if (!toolDetails.unitPrice)
        errors.push(t("FixedAssets.unitPriceRequired"));
      if (!toolDetails.totalPrice)
        errors.push(t("FixedAssets.totalPriceRequired"));
      if (isNaN(Number(toolDetails.numberOfUnits)))
        errors.push(t("FixedAssets.numberOfUnitsNumber"));
      if (isNaN(Number(toolDetails.unitPrice)))
        errors.push(t("FixedAssets.unitPriceNumber"));
      if (isNaN(Number(toolDetails.totalPrice)))
        errors.push(t("FixedAssets.totalPriceNumber"));
      if (toolDetails.warranty === "yes") {
        if (!toolDetails.ownershipDetails?.purchaseDate)
          errors.push(t("FixedAssets.purchaseDateRequired"));
        if (!toolDetails.ownershipDetails?.expireDate)
          errors.push(t("FixedAssets.expireDateRequired"));
      }
    }
    return errors;
  };
  const cleanNumber = (value: string) =>
    value ? value.replace(/,/g, "") : "0";

  const handleUpdateTools = async () => {
    try {
      for (const tool of tools) {
        const toolDetails = updatedDetails[tool.id];
        const validationErrors = validateTool(toolDetails, tool.category);
        if (validationErrors.length > 0) {
          Alert.alert(t("FixedAssets.sorry"), validationErrors.join("\n"), [
            { text: t("PublicForum.OK") },
          ]);
          return;
        }
      }

      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      for (const tool of tools) {
        const { id, category } = tool;
        const updatedToolDetails = { ...updatedDetails[id] };

        if (category === "Land") {
          if (updatedToolDetails.extentha) {
            updatedToolDetails.extentha = cleanNumber(
              updatedToolDetails.extentha.toString(),
            );
          }
          if (updatedToolDetails.extentac) {
            updatedToolDetails.extentac = cleanNumber(
              updatedToolDetails.extentac.toString(),
            );
          }
          if (updatedToolDetails.extentp) {
            updatedToolDetails.extentp = cleanNumber(
              updatedToolDetails.extentp.toString(),
            );
          }

          if (updatedToolDetails.ownershipDetails) {
            if (updatedToolDetails.ownershipDetails.estimateValue) {
              updatedToolDetails.ownershipDetails.estimateValue = cleanNumber(
                updatedToolDetails.ownershipDetails.estimateValue.toString(),
              );
            }
            if (updatedToolDetails.ownershipDetails.leastAmountAnnually) {
              updatedToolDetails.ownershipDetails.leastAmountAnnually =
                cleanNumber(
                  updatedToolDetails.ownershipDetails.leastAmountAnnually.toString(),
                );
            }
            if (updatedToolDetails.ownershipDetails.permitFeeAnnually) {
              updatedToolDetails.ownershipDetails.permitFeeAnnually =
                cleanNumber(
                  updatedToolDetails.ownershipDetails.permitFeeAnnually.toString(),
                );
            }
            if (updatedToolDetails.ownershipDetails.paymentAnnually) {
              updatedToolDetails.ownershipDetails.paymentAnnually = cleanNumber(
                updatedToolDetails.ownershipDetails.paymentAnnually.toString(),
              );
            }
          }
        } else if (category === "Building and Infrastructures") {
          if (updatedToolDetails.floorArea) {
            updatedToolDetails.floorArea = cleanNumber(
              updatedToolDetails.floorArea.toString(),
            );
          }

          if (updatedToolDetails.ownershipDetails) {
            if (updatedToolDetails.ownershipDetails.estimateValue) {
              updatedToolDetails.ownershipDetails.estimateValue = cleanNumber(
                updatedToolDetails.ownershipDetails.estimateValue.toString(),
              );
            }
            if (updatedToolDetails.ownershipDetails.leastAmountAnnually) {
              updatedToolDetails.ownershipDetails.leastAmountAnnually =
                cleanNumber(
                  updatedToolDetails.ownershipDetails.leastAmountAnnually.toString(),
                );
            }
            if (updatedToolDetails.ownershipDetails.permitFeeAnnually) {
              updatedToolDetails.ownershipDetails.permitFeeAnnually =
                cleanNumber(
                  updatedToolDetails.ownershipDetails.permitFeeAnnually.toString(),
                );
            }
            if (updatedToolDetails.ownershipDetails.paymentAnnually) {
              updatedToolDetails.ownershipDetails.paymentAnnually = cleanNumber(
                updatedToolDetails.ownershipDetails.paymentAnnually.toString(),
              );
            }
          }
        } else if (
          category === "Machine and Vehicles" ||
          category === "Tools"
        ) {
          if (updatedToolDetails.numberOfUnits) {
            updatedToolDetails.numberOfUnits = cleanNumber(
              updatedToolDetails.numberOfUnits.toString(),
            );
          }
          if (updatedToolDetails.unitPrice) {
            updatedToolDetails.unitPrice = cleanNumber(
              updatedToolDetails.unitPrice.toString(),
            );
          }
          if (updatedToolDetails.totalPrice) {
            updatedToolDetails.totalPrice = cleanNumber(
              updatedToolDetails.totalPrice.toString(),
            );
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
        t("FixedAssets.successTitle"),
        t("FixedAssets.assetsUpdatedSuccessfully"),
        [{ text: t("PublicForum.OK") }],
      );
      setIsLoading(false);
      navigation.goBack();
    } catch (error) {
      Alert.alert(t("FixedAssets.sorry"), t("FixedAssets.failToUpdateAssets"), [
        { text: t("PublicForum.OK") },
      ]);
      setIsLoading(false);
    }
  };

  const formatInt = (text: string) => {
    const digits = text.replace(/[^0-9]/g, "");
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

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
      }

      return { ...prevDetails, [toolId]: toolDetails };
    });
  };

  const translateCategory = (category: string, t: any): string => {
    switch (category) {
      case "Land":
        return t("FixedAssets.lands");
      case "Building and Infrastructures":
        return t("FixedAssets.buildingandInfrastructures");
      case "Machine and Vehicles":
        return t("FixedAssets.machineandVehicles");
      case "Tools":
        return t("FixedAssets.toolsandEquipments");
      default:
        return category;
    }
  };

  const DropdownTrigger = ({
    value,
    placeholder,
    onPress,
  }: {
    value: string;
    placeholder: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="border border-gray-300 bg-[#F4F4F4] rounded-full px-4 py-4 mb-4 flex-row justify-between items-center"
    >
      <Text
        className={value ? "text-gray-800 text-sm" : "text-gray-400 text-sm"}
      >
        {value || placeholder}
      </Text>
      <Icon name="chevron-down-outline" size={18} color="#6B7280" />
    </TouchableOpacity>
  );

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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      enabled
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={false}
      />

      {loading ? (
        <View className="flex-1 justify-center items-center bg-white">
          <ActivityIndicator size="large" color="#00ff00" />
        </View>
      ) : (
        <ScrollView className="p-2 bg-white">
          {tools.map((tool) => (
            <View key={tool.id} className="bg-white rounded p-2">
              <CustomHeader
                title={`${translateCategory(category, t)} ${t("FixedAssets.edit")}`}
                navigation={navigation as any}
                onBackPress={() => navigation.goBack()}
              />

              <View className="p-2">
                {tool.category === "Land" && (
                  <>
                    {/* District */}
                    <Text className="pb-2 pt-8 font-bold">
                      {t("FixedAssets.district")} *
                    </Text>
                    <DropdownTrigger
                      value={updatedDetails[tool.id]?.district || ""}
                      placeholder={t("FixedAssets.selectDistrict")}
                      onPress={() => setShowDistrictModal(true)}
                    />
                    <GlobalSearchModal
                      visible={showDistrictModal}
                      onClose={() => setShowDistrictModal(false)}
                      title={t("FixedAssets.district")}
                      data={districtOptions}
                      selectedItems={
                        updatedDetails[tool.id]?.district
                          ? [updatedDetails[tool.id].district]
                          : []
                      }
                      onSelect={(items) => {
                        if (items[0])
                          handleInputChange(tool.id, "district", items[0]);
                      }}
                      searchPlaceholder={t("SignupForum.TypeSomething")}
                    />

                    {/* Extent */}
                    <Text className="pb-2 pt-2 font-bold">
                      {t("FixedAssets.extent")} *
                    </Text>
                    <View className="flex-row justify-between items-center pb-2 w-full">
                      <Text className="pr-1">{t("FixedAssets.ha")}</Text>
                      <TextInput
                        placeholder={t("FixedAssets.ha")}
                        value={
                          updatedDetails[tool.id]?.extentha?.toString() || ""
                        }
                        onChangeText={(text) =>
                          handleInputChange(
                            tool.id,
                            "extentha",
                            text.replace(/[-*#.]/g, ""),
                          )
                        }
                        className="border border-gray-300 bg-[#F4F4F4] p-2 mb-2 px-4 rounded-full w-[25%]"
                        keyboardType="numeric"
                      />
                      <Text className="pl-2 pr-1 font-bold">
                        {t("FixedAssets.ac")} *
                      </Text>
                      <TextInput
                        placeholder={t("FixedAssets.ac")}
                        value={
                          updatedDetails[tool.id]?.extentac?.toString() || ""
                        }
                        onChangeText={(text) =>
                          handleInputChange(
                            tool.id,
                            "extentac",
                            text.replace(/[-*#.]/g, ""),
                          )
                        }
                        keyboardType="numeric"
                        className="border border-gray-300 bg-[#F4F4F4] rounded-full p-2 px-4 mb-2 w-[25%]"
                      />
                      <Text className="pl-2 pr-1 font-bold">
                        {t("FixedAssets.p")} *
                      </Text>
                      <TextInput
                        placeholder={t("FixedAssets.p")}
                        value={
                          updatedDetails[tool.id]?.extentp?.toString() || ""
                        }
                        onChangeText={(text) =>
                          handleInputChange(
                            tool.id,
                            "extentp",
                            text.replace(/[-*#.]/g, ""),
                          )
                        }
                        keyboardType="numeric"
                        className="border border-gray-300 bg-[#F4F4F4] rounded-full p-2 px-4 mb-2 w-[25%]"
                      />
                    </View>

                    {/* Ownership */}
                    <Text className="pb-2 font-bold">
                      {t("FixedAssets.ownership")} *
                    </Text>
                    <DropdownTrigger
                      value={updatedDetails[tool.id]?.ownership || ""}
                      placeholder={t("FixedAssets.selectOwnership")}
                      onPress={() => setShowOwnershipModal(true)}
                    />
                    <GlobalSearchModal
                      visible={showOwnershipModal}
                      onClose={() => setShowOwnershipModal(false)}
                      title={t("FixedAssets.ownership")}
                      data={landownershipCategories}
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
                        }
                      }}
                      searchPlaceholder={t("SignupForum.TypeSomething")}
                    />

                    {/* Own */}
                    {updatedDetails[tool.id]?.ownership === "Own" && (
                      <>
                        <Text className="pb-2">
                          {t("FixedAssets.estimateValue")} *
                        </Text>
                        <TextInput
                          placeholder={t("FixedAssets.estimateValue")}
                          value={
                            updatedDetails[tool.id]?.ownershipDetails
                              ?.estimateValue || ""
                          }
                          onChangeText={(text) =>
                            handleInputChange(
                              tool.id,
                              "ownershipDetails.estimateValue",
                              formatInt(text),
                            )
                          }
                          keyboardType="numeric"
                          className="border border-gray-300 bg-[#F4F4F4] rounded-full p-4 mb-4 pl-4"
                        />
                        <Text className="pb-2 pt-2 font-bold">
                          {t("FixedAssets.issuedDate")} *
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            setShowIssuedDatePicker((prev) => !prev)
                          }
                          className="border border-gray-300 bg-[#F4F4F4] rounded-full p-4 mb-4 pl-4 flex-row justify-between"
                        >
                          <Text>
                            {updatedDetails[tool.id]?.ownershipDetails
                              ?.issuedDate
                              ? new Date(
                                  updatedDetails[tool.id].ownershipDetails
                                    .issuedDate,
                                )
                                  .toISOString()
                                  .split("T")[0]
                              : t("FixedAssets.issuedDate")}
                          </Text>
                          <Icon
                            name="calendar-outline"
                            size={20}
                            color="#6B7280"
                          />
                        </TouchableOpacity>
                        {showIssuedDatePicker &&
                          (Platform.OS === "ios" ? (
                            <View className="justify-center items-center z-50 bg-gray-100 rounded-lg">
                              <DateTimePicker
                                value={issuedDate || new Date()}
                                mode="date"
                                display="inline"
                                style={{ width: 320, height: 260 }}
                                onChange={(event, selectedDate) => {
                                  setShowIssuedDatePicker(false);
                                  if (event.type === "set" && selectedDate) {
                                    handleInputChange(
                                      tool.id,
                                      "ownershipDetails.issuedDate",
                                      selectedDate.toISOString().split("T")[0],
                                    );
                                  }
                                }}
                                maximumDate={new Date()}
                              />
                            </View>
                          ) : (
                            <DateTimePicker
                              value={issuedDate || new Date()}
                              mode="date"
                              display="default"
                              onChange={(event, selectedDate) => {
                                setShowIssuedDatePicker(false);
                                if (event.type === "set" && selectedDate) {
                                  handleInputChange(
                                    tool.id,
                                    "ownershipDetails.issuedDate",
                                    selectedDate.toISOString().split("T")[0],
                                  );
                                }
                              }}
                              maximumDate={new Date()}
                            />
                          ))}
                      </>
                    )}

                    {/* Lease */}
                    {updatedDetails[tool.id]?.ownership === "Lease" && (
                      <>
                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.startDate")} *
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            setShowStartDatePicker((prev) => !prev)
                          }
                          className="border bg-[#F4F4F4] border-gray-300 rounded-full p-4 mb-4 pl-4 flex-row justify-between"
                        >
                          <Text>
                            {updatedDetails[tool.id]?.ownershipDetails
                              ?.startDate
                              ? new Date(
                                  updatedDetails[tool.id].ownershipDetails
                                    .startDate,
                                )
                                  .toISOString()
                                  .split("T")[0]
                              : t("FixedAssets.startDate")}
                          </Text>
                          <Icon
                            name="calendar-outline"
                            size={20}
                            color="#6B7280"
                          />
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
                                  setShowStartDatePicker(false);
                                  if (event.type === "set" && selectedDate)
                                    handleInputChange(
                                      tool.id,
                                      "ownershipDetails.startDate",
                                      selectedDate.toISOString().split("T")[0],
                                    );
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
                                setShowStartDatePicker(false);
                                if (event.type === "set" && selectedDate)
                                  handleInputChange(
                                    tool.id,
                                    "ownershipDetails.startDate",
                                    selectedDate.toISOString().split("T")[0],
                                  );
                              }}
                              maximumDate={new Date()}
                            />
                          ))}

                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.duration")} *
                        </Text>
                        <View className="items-center flex-row justify-center">
                          <Text className="w-[20%] text-right pr-2">
                            {t("FixedAssets.years")}
                          </Text>
                          <TextInput
                            placeholder={t("FixedAssets.years")}
                            keyboardType="numeric"
                            value={
                              updatedDetails[
                                tool.id
                              ]?.ownershipDetails?.durationYears?.toString() ||
                              ""
                            }
                            onChangeText={(value) =>
                              handleInputChange(
                                tool.id,
                                "ownershipDetails.durationYears",
                                value.replace(/[-*#.+]/g, "").trimStart(),
                              )
                            }
                            className="border border-gray-300 p-2 w-[30%] px-4 rounded-full bg-gray-100"
                          />
                          <Text className="w-[20%] text-right pr-2">
                            {t("FixedAssets.months")}
                          </Text>
                          <TextInput
                            placeholder={t("FixedAssets.months")}
                            keyboardType="numeric"
                            value={
                              updatedDetails[
                                tool.id
                              ]?.ownershipDetails?.durationMonths?.toString() ||
                              ""
                            }
                            onChangeText={(value) =>
                              handleInputChange(
                                tool.id,
                                "ownershipDetails.durationMonths",
                                value.replace(/[-*#.+]/g, "").trimStart(),
                              )
                            }
                            className="border border-gray-300 p-2 w-24 rounded-full bg-gray-100 px-4"
                          />
                        </View>

                        <Text className="pb-2 mt-4 font-bold">
                          {t("FixedAssets.leasedAmountAnnually")} *
                        </Text>
                        <TextInput
                          placeholder={t("FixedAssets.leasedAmountAnnually")}
                          value={
                            updatedDetails[tool.id]?.ownershipDetails
                              ?.leastAmountAnnually || ""
                          }
                          onChangeText={(text) =>
                            handleInputChange(
                              tool.id,
                              "ownershipDetails.leastAmountAnnually",
                              formatInt(text),
                            )
                          }
                          keyboardType="numeric"
                          className="border border-gray-300 bg-[#F4F4F4] rounded-full p-4 mb-4 pl-4"
                        />
                      </>
                    )}

                    {/* Permited */}
                    {updatedDetails[tool.id]?.ownership === "Permited" && (
                      <>
                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.issuedDate")} *
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            setShowStartDatePicker((prev) => !prev)
                          }
                          className="border bg-[#F4F4F4] border-gray-300 rounded-full p-4 mb-4 pl-4 flex-row justify-between"
                        >
                          <Text>
                            {updatedDetails[tool.id]?.ownershipDetails
                              ?.issuedDate
                              ? new Date(
                                  updatedDetails[tool.id].ownershipDetails
                                    .issuedDate,
                                )
                                  .toISOString()
                                  .split("T")[0]
                              : t("FixedAssets.issuedDate")}
                          </Text>
                          <Icon
                            name="calendar-outline"
                            size={20}
                            color="#6B7280"
                          />
                        </TouchableOpacity>
                        {showStartDatePicker &&
                          (Platform.OS === "ios" ? (
                            <View className="justify-center items-center z-50 bg-gray-100 rounded-lg">
                              <DateTimePicker
                                value={issuedDate || new Date()}
                                mode="date"
                                display="inline"
                                style={{ width: 320, height: 260 }}
                                onChange={(event, selectedDate) => {
                                  setShowStartDatePicker(false);
                                  if (event.type === "set" && selectedDate)
                                    handleInputChange(
                                      tool.id,
                                      "ownershipDetails.issuedDate",
                                      selectedDate.toISOString().split("T")[0],
                                    );
                                }}
                                maximumDate={new Date()}
                              />
                            </View>
                          ) : (
                            <DateTimePicker
                              value={issuedDate || new Date()}
                              mode="date"
                              display="default"
                              onChange={(event, selectedDate) => {
                                setShowStartDatePicker(false);
                                if (event.type === "set" && selectedDate)
                                  handleInputChange(
                                    tool.id,
                                    "ownershipDetails.issuedDate",
                                    selectedDate.toISOString().split("T")[0],
                                  );
                              }}
                              maximumDate={new Date()}
                            />
                          ))}
                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.paymentAnnually")} *
                        </Text>
                        <TextInput
                          placeholder={t("FixedAssets.paymentAnnually")}
                          value={
                            updatedDetails[tool.id]?.ownershipDetails
                              ?.permitFeeAnnually || ""
                          }
                          onChangeText={(text) =>
                            handleInputChange(
                              tool.id,
                              "ownershipDetails.permitFeeAnnually",
                              formatInt(text),
                            )
                          }
                          keyboardType="numeric"
                          className="border border-gray-300 bg-[#F4F4F4] rounded-full p-4 mb-4 pl-4"
                        />
                      </>
                    )}

                    {/* Shared */}
                    {updatedDetails[tool.id]?.ownership === "Shared" && (
                      <>
                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.paymentAnnually")} *
                        </Text>
                        <TextInput
                          placeholder={t("FixedAssets.paymentAnnually")}
                          value={
                            updatedDetails[tool.id]?.ownershipDetails
                              ?.paymentAnnually || ""
                          }
                          onChangeText={(text) =>
                            handleInputChange(
                              tool.id,
                              "ownershipDetails.paymentAnnually",
                              formatInt(text),
                            )
                          }
                          keyboardType="numeric"
                          className="border border-gray-300 bg-[#F4F4F4] rounded-full p-4 mb-4 pl-4"
                        />
                      </>
                    )}

                    {/* Land Fenced */}
                    <Text className="font-bold pb-2 pt-2">
                      {t("FixedAssets.isLandFenced")} *
                    </Text>
                    <View className="flex-row justify-around mb-5">
                      {["yes", "no"].map((val) => (
                        <TouchableOpacity
                          key={val}
                          onPress={() =>
                            handleInputChange(tool.id, "landFenced", val)
                          }
                          className="flex-row items-center"
                        >
                          <View
                            className={`w-5 h-5 rounded-full ${updatedDetails[tool.id]?.landFenced === val ? "bg-green-500" : "bg-gray-400"}`}
                          />
                          <Text className="ml-2">
                            {t(`FixedAssets.${val}`)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Perennial Crops */}
                    <Text className="font-bold pb-2">
                      {t("FixedAssets.areThereAnyPerennialCrops")} *
                    </Text>
                    <View className="flex-row justify-around mb-5">
                      {["yes", "no"].map((val) => (
                        <TouchableOpacity
                          key={val}
                          onPress={() =>
                            handleInputChange(tool.id, "perennialCrop", val)
                          }
                          className="flex-row items-center"
                        >
                          <View
                            className={`w-5 h-5 rounded-full ${updatedDetails[tool.id]?.perennialCrop === val ? "bg-green-500" : "bg-gray-400"}`}
                          />
                          <Text className="ml-2">
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
                    <Text className="pb-2 pt-10 font-bold">
                      {t("FixedAssets.type")} *
                    </Text>
                    <DropdownTrigger
                      value={updatedDetails[tool.id]?.type || ""}
                      placeholder={t("FixedAssets.selectType")}
                      onPress={() => setShowTypeModal(true)}
                    />
                    <GlobalSearchModal
                      visible={showTypeModal}
                      onClose={() => setShowTypeModal(false)}
                      title={t("FixedAssets.type")}
                      data={assetTypesForBuilding}
                      selectedItems={
                        updatedDetails[tool.id]?.type
                          ? [updatedDetails[tool.id].type]
                          : []
                      }
                      onSelect={(items) => {
                        if (items[0])
                          handleInputChange(tool.id, "type", items[0]);
                      }}
                      searchPlaceholder={t("SignupForum.TypeSomething")}
                    />

                    {/* Floor Area */}
                    <Text className="pb-2 font-bold">
                      {t("FixedAssets.floorAreaSqrFt")} *
                    </Text>
                    <TextInput
                      placeholder={t("FixedAssets.floorAreaSqrFt")}
                      value={updatedDetails[tool.id]?.floorArea || ""}
                      onChangeText={(text) =>
                        handleInputChange(
                          tool.id,
                          "floorArea",
                          text.replace(/[-*#+]/g, "").trimStart(),
                        )
                      }
                      className="border bg-[#F4F4F4] border-gray-300 rounded-full p-3 mb-4 pl-4"
                      keyboardType="numeric"
                    />

                    {/* Ownership */}
                    <Text className="pb-2 font-bold">
                      {t("FixedAssets.ownership")} *
                    </Text>
                    <DropdownTrigger
                      value={updatedDetails[tool.id]?.ownership || ""}
                      placeholder={t("FixedAssets.selectOwnership")}
                      onPress={() => setShowOwnershipModal(true)}
                    />
                    <GlobalSearchModal
                      visible={showOwnershipModal}
                      onClose={() => setShowOwnershipModal(false)}
                      title={t("FixedAssets.ownership")}
                      data={ownershipCategories}
                      selectedItems={
                        updatedDetails[tool.id]?.ownership
                          ? [updatedDetails[tool.id].ownership]
                          : []
                      }
                      onSelect={(items) => {
                        if (items[0]) {
                          if (!("oldOwnership" in updatedDetails[tool.id])) {
                            handleInputChange(
                              tool.id,
                              "oldOwnership",
                              updatedDetails[tool.id]?.ownership || items[0],
                            );
                          }
                          handleInputChange(tool.id, "ownership", items[0]);
                        }
                      }}
                      searchPlaceholder={t("SignupForum.TypeSomething")}
                    />

                    {/* General Condition */}
                    <Text className="pb-2 font-bold">
                      {t("FixedAssets.generalCondition")} *
                    </Text>
                    <DropdownTrigger
                      value={updatedDetails[tool.id]?.generalCondition || ""}
                      placeholder={t("FixedAssets.selectGeneralCondition")}
                      onPress={() => setShowGeneralConditionModal(true)}
                    />
                    <GlobalSearchModal
                      visible={showGeneralConditionModal}
                      onClose={() => setShowGeneralConditionModal(false)}
                      title={t("FixedAssets.generalCondition")}
                      data={generalConditionOptions}
                      selectedItems={
                        updatedDetails[tool.id]?.generalCondition
                          ? [updatedDetails[tool.id].generalCondition]
                          : []
                      }
                      onSelect={(items) => {
                        if (items[0])
                          handleInputChange(
                            tool.id,
                            "generalCondition",
                            items[0],
                          );
                      }}
                      searchPlaceholder={t("SignupForum.TypeSomething")}
                      showSearch={false}
                    />

                    {/* Own Building */}
                    {updatedDetails[tool.id]?.ownership ===
                      "Own Building (with title ownership)" && (
                      <>
                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.estimateValue")} *
                        </Text>
                        <TextInput
                          placeholder={t("FixedAssets.estimateValue")}
                          value={
                            updatedDetails[tool.id]?.ownershipDetails
                              ?.estimateValue || ""
                          }
                          onChangeText={(text) =>
                            handleInputChange(
                              tool.id,
                              "ownershipDetails.estimateValue",
                              formatInt(text),
                            )
                          }
                          keyboardType="numeric"
                          className="border bg-[#F4F4F4] border-gray-300 rounded-full p-3 mb-4 pl-4"
                        />
                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.issuedDate")} *
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            setShowIssuedDatePicker((prev) => !prev)
                          }
                          className="border bg-[#F4F4F4] border-gray-300 rounded-full p-4 mb-4 pl-4 flex-row justify-between"
                        >
                          <Text>
                            {updatedDetails[tool.id]?.ownershipDetails
                              ?.issuedDate
                              ? new Date(
                                  updatedDetails[tool.id].ownershipDetails
                                    .issuedDate,
                                )
                                  .toISOString()
                                  .split("T")[0]
                              : t("FixedAssets.issuedDate")}
                          </Text>
                          <Icon
                            name="calendar-outline"
                            size={20}
                            color="#6B7280"
                          />
                        </TouchableOpacity>
                        {showIssuedDatePicker &&
                          (Platform.OS === "ios" ? (
                            <View className="justify-center items-center z-50 bg-gray-100 rounded-lg">
                              <DateTimePicker
                                value={issuedDate || new Date()}
                                mode="date"
                                display="inline"
                                style={{ width: 320, height: 260 }}
                                onChange={(event, selectedDate) => {
                                  setShowIssuedDatePicker(false);
                                  if (event.type === "set" && selectedDate)
                                    handleInputChange(
                                      tool.id,
                                      "ownershipDetails.issuedDate",
                                      selectedDate.toISOString().split("T")[0],
                                    );
                                }}
                                maximumDate={new Date()}
                              />
                            </View>
                          ) : (
                            <DateTimePicker
                              value={issuedDate || new Date()}
                              mode="date"
                              display="default"
                              onChange={(event, selectedDate) => {
                                setShowIssuedDatePicker(false);
                                if (event.type === "set" && selectedDate)
                                  handleInputChange(
                                    tool.id,
                                    "ownershipDetails.issuedDate",
                                    selectedDate.toISOString().split("T")[0],
                                  );
                              }}
                              maximumDate={new Date()}
                            />
                          ))}
                      </>
                    )}

                    {/* Leased Building */}
                    {updatedDetails[tool.id]?.ownership ===
                      "Leased Building" && (
                      <>
                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.startDate")} *
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            setShowStartDatePicker((prev) => !prev)
                          }
                          className="border bg-[#F4F4F4] border-gray-300 rounded-full p-4 mb-4 pl-4 flex-row justify-between"
                        >
                          <Text>
                            {updatedDetails[tool.id]?.ownershipDetails
                              ?.startDate
                              ? new Date(
                                  updatedDetails[tool.id].ownershipDetails
                                    .startDate,
                                )
                                  .toISOString()
                                  .split("T")[0]
                              : t("FixedAssets.startDate")}
                          </Text>
                          <Icon
                            name="calendar-outline"
                            size={20}
                            color="#6B7280"
                          />
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
                                  setShowStartDatePicker(false);
                                  if (event.type === "set" && selectedDate)
                                    handleInputChange(
                                      tool.id,
                                      "ownershipDetails.startDate",
                                      selectedDate.toISOString().split("T")[0],
                                    );
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
                                setShowStartDatePicker(false);
                                if (event.type === "set" && selectedDate)
                                  handleInputChange(
                                    tool.id,
                                    "ownershipDetails.startDate",
                                    selectedDate.toISOString().split("T")[0],
                                  );
                              }}
                              maximumDate={new Date()}
                            />
                          ))}

                        <Text className="pb-2 mt-2 font-bold">
                          {t("FixedAssets.duration")} *
                        </Text>
                        <View className="items-center flex-row justify-center">
                          <Text className="w-[20%] text-right pr-2">
                            {t("FixedAssets.years")}
                          </Text>
                          <TextInput
                            placeholder={t("FixedAssets.years")}
                            keyboardType="numeric"
                            value={
                              updatedDetails[
                                tool.id
                              ]?.ownershipDetails?.durationYears?.toString() ||
                              ""
                            }
                            onChangeText={(value) =>
                              handleInputChange(
                                tool.id,
                                "ownershipDetails.durationYears",
                                value.replace(/[-*#.+]/g, "").trimStart(),
                              )
                            }
                            className="border border-gray-300 p-2 w-[30%] px-4 rounded-full bg-gray-100"
                          />
                          <Text className="w-[20%] text-right pr-2">
                            {t("FixedAssets.months")}
                          </Text>
                          <TextInput
                            placeholder={t("FixedAssets.months")}
                            keyboardType="numeric"
                            value={
                              updatedDetails[
                                tool.id
                              ]?.ownershipDetails?.durationMonths?.toString() ||
                              ""
                            }
                            onChangeText={(value) =>
                              handleInputChange(
                                tool.id,
                                "ownershipDetails.durationMonths",
                                value.replace(/[-*#.+]/g, "").trimStart(),
                              )
                            }
                            className="border border-gray-300 p-2 w-24 rounded-full bg-gray-100 px-4"
                          />
                        </View>

                        <Text className="pb-2 mt-4 font-bold">
                          {t("FixedAssets.leasedAmountAnnually")} *
                        </Text>
                        <TextInput
                          placeholder={t("FixedAssets.leasedAmountAnnually")}
                          value={
                            updatedDetails[tool.id]?.ownershipDetails
                              ?.leastAmountAnnually || ""
                          }
                          onChangeText={(text) =>
                            handleInputChange(
                              tool.id,
                              "ownershipDetails.leastAmountAnnually",
                              formatInt(text),
                            )
                          }
                          keyboardType="numeric"
                          className="border bg-[#F4F4F4] border-gray-300 rounded-full p-3 mb-4 pl-4"
                        />
                      </>
                    )}

                    {/* Permit Building */}
                    {updatedDetails[tool.id]?.ownership ===
                      "Permit Building" && (
                      <>
                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.issuedDate")} *
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            setShowStartDatePicker((prev) => !prev)
                          }
                          className="border bg-[#F4F4F4] border-gray-300 rounded-full p-4 mb-4 pl-4 flex-row justify-between"
                        >
                          <Text>
                            {updatedDetails[tool.id]?.ownershipDetails
                              ?.issuedDate
                              ? new Date(
                                  updatedDetails[tool.id].ownershipDetails
                                    .issuedDate,
                                )
                                  .toISOString()
                                  .split("T")[0]
                              : t("FixedAssets.issuedDate")}
                          </Text>
                          <Icon
                            name="calendar-outline"
                            size={20}
                            color="#6B7280"
                          />
                        </TouchableOpacity>
                        {showStartDatePicker &&
                          (Platform.OS === "ios" ? (
                            <View className="justify-center items-center z-50 bg-gray-100 rounded-lg">
                              <DateTimePicker
                                value={issuedDate || new Date()}
                                mode="date"
                                display="inline"
                                style={{ width: 320, height: 260 }}
                                onChange={(event, selectedDate) => {
                                  setShowStartDatePicker(false);
                                  if (event.type === "set" && selectedDate)
                                    handleInputChange(
                                      tool.id,
                                      "ownershipDetails.issuedDate",
                                      selectedDate.toISOString().split("T")[0],
                                    );
                                }}
                                maximumDate={new Date()}
                              />
                            </View>
                          ) : (
                            <DateTimePicker
                              value={issuedDate || new Date()}
                              mode="date"
                              display="default"
                              onChange={(event, selectedDate) => {
                                setShowStartDatePicker(false);
                                if (event.type === "set" && selectedDate)
                                  handleInputChange(
                                    tool.id,
                                    "ownershipDetails.issuedDate",
                                    selectedDate.toISOString().split("T")[0],
                                  );
                              }}
                              maximumDate={new Date()}
                            />
                          ))}
                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.paymentAnnually")} *
                        </Text>
                        <TextInput
                          placeholder={t("FixedAssets.paymentAnnually")}
                          value={
                            updatedDetails[tool.id]?.ownershipDetails
                              ?.permitFeeAnnually || ""
                          }
                          onChangeText={(text) =>
                            handleInputChange(
                              tool.id,
                              "ownershipDetails.permitFeeAnnually",
                              formatInt(text),
                            )
                          }
                          keyboardType="numeric"
                          className="border bg-[#F4F4F4] border-gray-300 rounded-full p-4 mb-4 pl-4"
                        />
                      </>
                    )}

                    {/* Shared / No Ownership */}
                    {updatedDetails[tool.id]?.ownership ===
                      "Shared / No Ownership" && (
                      <>
                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.paymentAnnually")} *
                        </Text>
                        <TextInput
                          placeholder={t("FixedAssets.paymentAnnually")}
                          value={
                            updatedDetails[tool.id]?.ownershipDetails
                              ?.paymentAnnually || ""
                          }
                          onChangeText={(text) =>
                            handleInputChange(
                              tool.id,
                              "ownershipDetails.paymentAnnually",
                              formatInt(text),
                            )
                          }
                          keyboardType="numeric"
                          className="border bg-[#F4F4F4] border-gray-300 rounded-full p-3 mb-4 pl-4"
                        />
                      </>
                    )}
                  </>
                )}

                {tool.category === "Machine and Vehicles" && (
                  <>
                    <Text className="pb-2 pt-10 font-bold">
                      {t("FixedAssets.asset")} *
                    </Text>
                    <DropdownTrigger
                      value={updatedDetails[tool.id]?.asset || ""}
                      placeholder={t("FixedAssets.selectAsset")}
                      onPress={() => setShowAssetModal(true)}
                    />
                    <GlobalSearchModal
                      visible={showAssetModal}
                      onClose={() => setShowAssetModal(false)}
                      title={t("FixedAssets.asset")}
                      data={Machineasset}
                      selectedItems={
                        updatedDetails[tool.id]?.asset
                          ? [updatedDetails[tool.id].asset]
                          : []
                      }
                      onSelect={(items) => {
                        if (items[0]) {
                          handleInputChange(tool.id, "asset", items[0]);
                          setSelectedAsset(items[0]);
                        }
                      }}
                      searchPlaceholder={t("SignupForum.TypeSomething")}
                    />

                    {/* Asset Type */}
                    {selectedAsset && assetTypesForAssets[selectedAsset] && (
                      <>
                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.assetType")} *
                        </Text>
                        <DropdownTrigger
                          value={updatedDetails[tool.id]?.assetType || ""}
                          placeholder={t("FixedAssets.selectAssetType")}
                          onPress={() => setShowAssetTypeModal(true)}
                        />
                        <GlobalSearchModal
                          visible={showAssetTypeModal}
                          onClose={() => setShowAssetTypeModal(false)}
                          title={t("FixedAssets.assetType")}
                          data={assetTypesForAssets[selectedAsset]}
                          selectedItems={
                            updatedDetails[tool.id]?.assetType
                              ? [updatedDetails[tool.id].assetType]
                              : []
                          }
                          onSelect={(items) => {
                            if (items[0])
                              handleInputChange(tool.id, "assetType", items[0]);
                          }}
                          searchPlaceholder={t("SignupForum.TypeSomething")}
                        />
                      </>
                    )}

                    {updatedDetails[tool.id]?.assetType === "Other" && (
                      <>
                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.mentionOther")}
                        </Text>
                        <TextInput
                          placeholder={t("FixedAssets.mentionOther")}
                          value={updatedDetails[tool.id]?.mentionOther || ""}
                          onChangeText={(value) =>
                            handleInputChange(
                              tool.id,
                              "mentionOther",
                              value.replace(/^\s+/, ""),
                            )
                          }
                          className="border border-gray-300 bg-[#F4F4F4] rounded-full p-3 pl-4 mb-4"
                        />
                      </>
                    )}

                    <Text className="pb-2 font-bold">
                      {t("FixedAssets.brand")} *
                    </Text>
                    <TextInput
                      placeholder={t("FixedAssets.selectBrand")}
                      value={updatedDetails[tool.id]?.brand || ""}
                      editable={false}
                      className="border border-gray-300 bg-[#F4F4F4] rounded-full p-3 mb-4 pl-4"
                    />

                    <Text className="pb-2 font-bold">
                      {t("FixedAssets.numberofUnits")} *
                    </Text>
                    <TextInput
                      placeholder={t("FixedAssets.numberofUnits")}
                      value={
                        updatedDetails[tool.id]?.numberOfUnits?.toString() || ""
                      }
                      onChangeText={(text) =>
                        handleInputChange(
                          tool.id,
                          "numberOfUnits",
                          text.replace(/[^0-9]/g, ""),
                        )
                      }
                      keyboardType="numeric"
                      className="border border-gray-300 bg-[#F4F4F4] rounded-full p-3 mb-4 pl-4"
                    />

                    <Text className="pb-2 font-bold">
                      {t("FixedAssets.unitPrice")} *
                    </Text>
                    <TextInput
                      placeholder={t("FixedAssets.unitPrice")}
                      value={updatedDetails[tool.id]?.unitPrice || ""}
                      onChangeText={(text) =>
                        handleInputChange(tool.id, "unitPrice", formatInt(text))
                      }
                      keyboardType="numeric"
                      className="border border-gray-300 bg-[#F4F4F4] rounded-full p-3 mb-4 pl-4"
                    />

                    <Text className="pb-2 font-bold">
                      {t("FixedAssets.totalPrice")} *
                    </Text>
                    <Text className="border border-gray-300 bg-[#F4F4F4] rounded-full p-4 mb-4 pl-4">
                      {updatedDetails[tool.id]?.totalPrice
                        ? updatedDetails[tool.id].totalPrice
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        : ""}
                    </Text>

                    <Text className="pb-2 font-bold">
                      {t("FixedAssets.warranty")} *
                    </Text>
                    <View className="flex-row justify-around mb-4">
                      {["yes", "no"].map((val) => (
                        <TouchableOpacity
                          key={val}
                          onPress={() =>
                            handleInputChange(tool.id, "warranty", val)
                          }
                          className="flex-row items-center mt-2"
                        >
                          <View
                            className={`w-5 h-5 rounded-full ${updatedDetails[tool.id]?.warranty === val ? "bg-green-500" : "bg-gray-400"}`}
                          />
                          <Text className="ml-2">
                            {t(`FixedAssets.${val}`)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {updatedDetails[tool.id]?.warranty === "yes" && (
                      <>
                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.purchasedDate")} *
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            setShowPurchaseDatePicker((prev) => !prev)
                          }
                          className="border border-gray-300 p-4 pl-4 pr-4 rounded-full flex-row bg-gray-100 justify-between mb-3"
                        >
                          <Text>
                            {updatedDetails[tool.id]?.ownershipDetails
                              ?.purchaseDate
                              ? new Date(
                                  updatedDetails[tool.id].ownershipDetails
                                    .purchaseDate,
                                )
                                  .toISOString()
                                  .split("T")[0]
                              : t("FixedAssets.purchasedDate")}
                          </Text>
                          <Icon
                            name="calendar-outline"
                            size={20}
                            color="#6B7280"
                          />
                        </TouchableOpacity>
                        {showPurchaseDatePicker &&
                          (Platform.OS === "ios" ? (
                            <View className="justify-center items-center z-50 bg-gray-100 rounded-lg">
                              <DateTimePicker
                                value={
                                  updatedDetails[tool.id]?.ownershipDetails
                                    ?.purchaseDate
                                    ? new Date(
                                        updatedDetails[tool.id].ownershipDetails
                                          .purchaseDate,
                                      )
                                    : new Date()
                                }
                                mode="date"
                                display="inline"
                                style={{ width: 320, height: 260 }}
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
                              {purchaseDateError ? (
                                <Text className="text-red-500 p-2 text-center">
                                  {purchaseDateError}
                                </Text>
                              ) : null}
                            </View>
                          ) : (
                            <>
                              <DateTimePicker
                                value={
                                  updatedDetails[tool.id]?.ownershipDetails
                                    ?.purchaseDate
                                    ? new Date(
                                        updatedDetails[tool.id].ownershipDetails
                                          .purchaseDate,
                                      )
                                    : new Date()
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
                              {purchaseDateError ? (
                                <Text className="text-red-500 p-2 text-center">
                                  {purchaseDateError}
                                </Text>
                              ) : null}
                            </>
                          ))}

                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.warrantyExpireDate")} *
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            setShowExpireDatePicker((prev) => !prev)
                          }
                          className="border bg-[#F4F4F4] border-gray-300 rounded-full p-4 mb-4 pl-4 flex-row justify-between"
                        >
                          <Text>
                            {updatedDetails[tool.id]?.ownershipDetails
                              ?.expireDate
                              ? new Date(
                                  updatedDetails[tool.id].ownershipDetails
                                    .expireDate,
                                )
                                  .toISOString()
                                  .split("T")[0]
                              : t("FixedAssets.warrantyExpireDate")}
                          </Text>
                          <Icon
                            name="calendar-outline"
                            size={20}
                            color="#6B7280"
                          />
                        </TouchableOpacity>
                        {showExpireDatePicker &&
                          (Platform.OS === "ios" ? (
                            <View className="justify-center items-center z-50 bg-gray-100 rounded-lg">
                              <DateTimePicker
                                value={
                                  updatedDetails[tool.id]?.ownershipDetails
                                    ?.expireDate
                                    ? new Date(
                                        updatedDetails[tool.id].ownershipDetails
                                          .expireDate,
                                      )
                                    : new Date()
                                }
                                mode="date"
                                display="inline"
                                style={{ width: 320, height: 260 }}
                                onChange={(event, selectedDate) => {
                                  setShowExpireDatePicker(false);
                                  if (event.type === "set" && selectedDate)
                                    handleExpireDateChange(
                                      tool.id,
                                      selectedDate,
                                    );
                                }}
                                minimumDate={
                                  updatedDetails[tool.id]?.ownershipDetails
                                    ?.purchaseDate
                                    ? new Date(
                                        updatedDetails[tool.id].ownershipDetails
                                          .purchaseDate,
                                      )
                                    : new Date()
                                }
                              />
                              {expireDateError ? (
                                <Text className="text-red-500 p-2 text-center">
                                  {expireDateError}
                                </Text>
                              ) : null}
                            </View>
                          ) : (
                            <>
                              <DateTimePicker
                                value={
                                  updatedDetails[tool.id]?.ownershipDetails
                                    ?.expireDate
                                    ? new Date(
                                        updatedDetails[tool.id].ownershipDetails
                                          .expireDate,
                                      )
                                    : new Date()
                                }
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                  setShowExpireDatePicker(false);
                                  if (event.type === "set" && selectedDate)
                                    handleExpireDateChange(
                                      tool.id,
                                      selectedDate,
                                    );
                                }}
                                minimumDate={
                                  updatedDetails[tool.id]?.ownershipDetails
                                    ?.purchaseDate
                                    ? new Date(
                                        updatedDetails[tool.id].ownershipDetails
                                          .purchaseDate,
                                      )
                                    : new Date()
                                }
                              />
                              {expireDateError ? (
                                <Text className="text-red-500 p-2 text-center">
                                  {expireDateError}
                                </Text>
                              ) : null}
                            </>
                          ))}

                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.warrantyStatus")}
                        </Text>
                        <View className="border border-gray-300 rounded-full bg-gray-100 p-2 mt-2">
                          <Text
                            style={{
                              color: updatedDetails[tool.id]?.ownershipDetails
                                ?.expireDate
                                ? new Date(
                                    updatedDetails[tool.id].ownershipDetails
                                      .expireDate,
                                  ) > new Date()
                                  ? "green"
                                  : "red"
                                : "#6B7280",
                              fontWeight: "bold",
                              textAlign: "center",
                            }}
                          >
                            {updatedDetails[tool.id]?.ownershipDetails
                              ?.expireDate
                              ? new Date(
                                  updatedDetails[tool.id].ownershipDetails
                                    .expireDate,
                                ) > new Date()
                                ? t("FixedAssets.valid")
                                : t("FixedAssets.expired")
                              : t("FixedAssets.notSelected")}
                          </Text>
                        </View>
                      </>
                    )}
                  </>
                )}

                {tool.category === "Tools" && (
                  <>
                    <Text className="pb-2 pt-10 font-bold">
                      {t("FixedAssets.asset")} *
                    </Text>
                    <DropdownTrigger
                      value={updatedDetails[tool.id]?.asset || ""}
                      placeholder={t("FixedAssets.selectAsset")}
                      onPress={() => setShowAssetModal(true)}
                    />
                    <GlobalSearchModal
                      visible={showAssetModal}
                      onClose={() => setShowAssetModal(false)}
                      title={t("FixedAssets.asset")}
                      data={ToolAssets}
                      selectedItems={
                        updatedDetails[tool.id]?.asset
                          ? [updatedDetails[tool.id].asset]
                          : []
                      }
                      onSelect={(items) => {
                        if (items[0]) {
                          handleInputChange(tool.id, "asset", items[0]);
                          setSelectedAsset(items[0]);
                        }
                      }}
                      searchPlaceholder={t("SignupForum.TypeSomething")}
                    />

                    {updatedDetails[tool.id]?.asset === "Other" && (
                      <>
                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.mentionOther")}
                        </Text>
                        <TextInput
                          placeholder={t("FixedAssets.mentionOther")}
                          value={updatedDetails[tool.id]?.mentionOther || ""}
                          onChangeText={(value) =>
                            handleInputChange(
                              tool.id,
                              "mentionOther",
                              value.replace(/^\s+/, ""),
                            )
                          }
                          className="border border-gray-300 bg-[#F4F4F4] rounded-full p-3 mb-4 pl-4"
                        />
                      </>
                    )}

                    <Text className="pb-2 font-bold">
                      {t("FixedAssets.brand")} *
                    </Text>
                    <TextInput
                      placeholder={t("FixedAssets.selectBrand")}
                      value={updatedDetails[tool.id]?.brand || ""}
                      editable={false}
                      className="border border-gray-300 bg-[#F4F4F4] rounded-full p-3 mb-4 pl-4"
                    />

                    <Text className="pb-2 font-bold">
                      {t("FixedAssets.numberofUnits")} *
                    </Text>
                    <TextInput
                      placeholder={t("FixedAssets.numberofUnits")}
                      value={
                        updatedDetails[tool.id]?.numberOfUnits?.toString() || ""
                      }
                      onChangeText={(text) =>
                        handleInputChange(
                          tool.id,
                          "numberOfUnits",
                          text.replace(/[^0-9]/g, ""),
                        )
                      }
                      keyboardType="numeric"
                      className="border border-gray-300 bg-[#F4F4F4] rounded-full p-3 mb-4 pl-4"
                    />

                    <Text className="pb-2 font-bold">
                      {t("FixedAssets.unitPrice")} *
                    </Text>
                    <TextInput
                      placeholder={t("FixedAssets.unitPrice")}
                      value={updatedDetails[tool.id]?.unitPrice || ""}
                      onChangeText={(text) =>
                        handleInputChange(tool.id, "unitPrice", formatInt(text))
                      }
                      keyboardType="numeric"
                      className="border border-gray-300 bg-[#F4F4F4] rounded-full p-3 mb-4 pl-4"
                    />

                    <Text className="pb-2 font-bold">
                      {t("FixedAssets.totalPrice")}
                    </Text>
                    <TextInput
                      placeholder={t("FixedAssets.totalPrice")}
                      value={
                        updatedDetails[tool.id]?.totalPrice
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
                          : ""
                      }
                      editable={false}
                      className="border border-gray-300 bg-[#F4F4F4] rounded-full p-3 mb-4 pl-4"
                    />

                    <Text className="pb-2 font-bold">
                      {t("FixedAssets.warranty")} *
                    </Text>
                    <View className="flex-row justify-around mb-4">
                      {["yes", "no"].map((val) => (
                        <TouchableOpacity
                          key={val}
                          onPress={() =>
                            handleInputChange(tool.id, "warranty", val)
                          }
                          className="flex-row items-center mt-2"
                        >
                          <View
                            className={`w-5 h-5 rounded-full ${updatedDetails[tool.id]?.warranty === val ? "bg-green-500" : "bg-gray-400"}`}
                          />
                          <Text className="ml-2">
                            {t(`FixedAssets.${val}`)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {updatedDetails[tool.id]?.warranty === "yes" && (
                      <>
                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.purchasedDate")} *
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            setShowPurchaseDatePicker((prev) => !prev)
                          }
                          className="border bg-[#F4F4F4] border-gray-300 rounded-full p-4 mb-4 pl-4 flex-row justify-between"
                        >
                          <Text>
                            {updatedDetails[tool.id]?.ownershipDetails
                              ?.purchaseDate
                              ? new Date(
                                  updatedDetails[tool.id].ownershipDetails
                                    .purchaseDate,
                                )
                                  .toISOString()
                                  .split("T")[0]
                              : t("FixedAssets.purchasedDate")}
                          </Text>
                          <Icon
                            name="calendar-outline"
                            size={20}
                            color="#6B7280"
                          />
                        </TouchableOpacity>
                        {showPurchaseDatePicker &&
                          (Platform.OS === "ios" ? (
                            <View className="justify-center items-center z-50 bg-gray-100 rounded-lg">
                              <DateTimePicker
                                value={
                                  updatedDetails[tool.id]?.ownershipDetails
                                    ?.purchaseDate
                                    ? new Date(
                                        updatedDetails[tool.id].ownershipDetails
                                          .purchaseDate,
                                      )
                                    : new Date()
                                }
                                mode="date"
                                display="inline"
                                style={{ width: 320, height: 260 }}
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
                              {purchaseDateError ? (
                                <Text className="text-red-500 p-2 text-center">
                                  {purchaseDateError}
                                </Text>
                              ) : null}
                            </View>
                          ) : (
                            <>
                              <DateTimePicker
                                value={
                                  updatedDetails[tool.id]?.ownershipDetails
                                    ?.purchaseDate
                                    ? new Date(
                                        updatedDetails[tool.id].ownershipDetails
                                          .purchaseDate,
                                      )
                                    : new Date()
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
                              {purchaseDateError ? (
                                <Text className="text-red-500 p-2 text-center">
                                  {purchaseDateError}
                                </Text>
                              ) : null}
                            </>
                          ))}

                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.warrantyExpireDate")} *
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            setShowExpireDatePicker((prev) => !prev)
                          }
                          className="border bg-[#F4F4F4] border-gray-300 rounded-full p-4 mb-4 pl-4 flex-row justify-between"
                        >
                          <Text>
                            {updatedDetails[tool.id]?.ownershipDetails
                              ?.expireDate
                              ? new Date(
                                  updatedDetails[tool.id].ownershipDetails
                                    .expireDate,
                                )
                                  .toISOString()
                                  .split("T")[0]
                              : t("FixedAssets.warrantyExpireDate")}
                          </Text>
                          <Icon
                            name="calendar-outline"
                            size={20}
                            color="#6B7280"
                          />
                        </TouchableOpacity>
                        {showExpireDatePicker &&
                          (Platform.OS === "ios" ? (
                            <View className="justify-center items-center z-50 bg-gray-100 rounded-lg">
                              <DateTimePicker
                                value={
                                  updatedDetails[tool.id]?.ownershipDetails
                                    ?.expireDate
                                    ? new Date(
                                        updatedDetails[tool.id].ownershipDetails
                                          .expireDate,
                                      )
                                    : new Date()
                                }
                                mode="date"
                                display="inline"
                                style={{ width: 320, height: 260 }}
                                onChange={(event, selectedDate) => {
                                  setShowExpireDatePicker(false);
                                  if (event.type === "set" && selectedDate)
                                    handleExpireDateChange(
                                      tool.id,
                                      selectedDate,
                                    );
                                }}
                                minimumDate={
                                  updatedDetails[tool.id]?.ownershipDetails
                                    ?.purchaseDate
                                    ? new Date(
                                        updatedDetails[tool.id].ownershipDetails
                                          .purchaseDate,
                                      )
                                    : new Date()
                                }
                              />
                              {expireDateError ? (
                                <Text className="text-red-500 p-2 text-center">
                                  {expireDateError}
                                </Text>
                              ) : null}
                            </View>
                          ) : (
                            <>
                              <DateTimePicker
                                value={
                                  updatedDetails[tool.id]?.ownershipDetails
                                    ?.expireDate
                                    ? new Date(
                                        updatedDetails[tool.id].ownershipDetails
                                          .expireDate,
                                      )
                                    : new Date()
                                }
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                  setShowExpireDatePicker(false);
                                  if (event.type === "set" && selectedDate)
                                    handleExpireDateChange(
                                      tool.id,
                                      selectedDate,
                                    );
                                }}
                                minimumDate={
                                  updatedDetails[tool.id]?.ownershipDetails
                                    ?.purchaseDate
                                    ? new Date(
                                        updatedDetails[tool.id].ownershipDetails
                                          .purchaseDate,
                                      )
                                    : new Date()
                                }
                              />
                              {expireDateError ? (
                                <Text className="text-red-500 p-2 text-center">
                                  {expireDateError}
                                </Text>
                              ) : null}
                            </>
                          ))}

                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.warrantyStatus")}
                        </Text>
                        <View className="border border-gray-300 rounded-full bg-gray-100 p-2 mt-2">
                          <Text
                            style={{
                              color:
                                new Date(
                                  updatedDetails[tool.id]?.ownershipDetails
                                    ?.expireDate,
                                ) > new Date()
                                  ? "green"
                                  : "red",
                              fontWeight: "bold",
                              textAlign: "center",
                            }}
                          >
                            {new Date(
                              updatedDetails[tool.id]?.ownershipDetails
                                ?.expireDate,
                            ) > new Date()
                              ? t("FixedAssets.valid")
                              : t("FixedAssets.expired")}
                          </Text>
                        </View>
                      </>
                    )}
                  </>
                )}

                {/* Submit */}
                <View className="flex-1 items-center pt-8">
                  <TouchableOpacity
                    onPress={handleUpdateTools}
                    className={`p-4 rounded-3xl mb-6 h-13 w-72 ${isLoading ? "bg-gray-500" : "bg-gray-900"}`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text className="text-white text-center text-base">
                        {t("FixedAssets.updateAsset")}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
};

export default UpdateAsset;
