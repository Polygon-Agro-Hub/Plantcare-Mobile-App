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
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { environment } from "@/environment/environment";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Picker } from "@react-native-picker/picker";
import AntDesign from "react-native-vector-icons/AntDesign";
import { useTranslation } from "react-i18next";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import DropDownPicker from "react-native-dropdown-picker";
import Icon from "react-native-vector-icons/Ionicons";




type RootStackParamList = {
  UpdateAsset: { selectedTools: number[]; category: string; toolId: any };
};
type Props = NativeStackScreenProps<RootStackParamList, "UpdateAsset">;
const UpdateAsset: React.FC<Props> = ({ navigation, route }) => {
  const { selectedTools, category } = route.params;
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedDetails, setUpdatedDetails] = useState<any>({});
  const [purchasedDate, setPurchasedDate] = useState(new Date());
  const [expireDate, setExpireDate] = useState(new Date());
  const [showPurchasedDatePicker, setShowPurchasedDatePicker] = useState(false);
  const [showExpireDatePicker, setShowExpireDatePicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [showIssuedDatePicker, setShowIssuedDatePicker] = useState(false);
  const [issuedDate, setIssuedDate] = useState(new Date());
  const [showLbIssuedDatePicker, setShowLbIssuedDatePicker] = useState(false);
  const [lbissuedDate, setLbIssuedDate] = useState(new Date());
  const [permitIssuedDate, setPermitIssuedDate] = useState(new Date());
  const [showPermitIssuedDatePicker, setShowPermitIssuedDatePicker] =
    useState(false);
  const [dateError, setDateError] = useState("");
  const { t } = useTranslation();
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [openDistrict, setOpenDistrict] = useState(false);
  const [openOwnership, setOpenOwnership] = useState(false);
  const [openType, setOpenType] = useState(false);
  const [openBrand, setOpenBrand] = useState(false);
  const [openAsset, setOpenAsset] = useState(false);
  const [openAssetType, setOpenAssetType] = useState(false);
  const [openLandOwnership, setOpenLandOwnership] = useState(false);
  const [openMachineAsset, setOpenMachineAsset] = useState(false);
  const [openToolAsset, setOpenToolAsset] = useState(false);
  const [openGeneralCondition, setOpenGeneralCondition] = useState(false);
  const [showPurchaseDatePicker, setShowPurchaseDatePicker] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
  
  useEffect(() => {
    if (tools.length > 0) {
      const initialAsset = tools[0]?.id
        ? updatedDetails[tools[0].id]?.asset
        : null;
      if (initialAsset) setSelectedAsset(initialAsset);
    }
  }, [updatedDetails, tools]);

  const onPurchasedDateChange = (
    event: any,
    selectedDate: Date | undefined
  ) => {
    setShowPurchasedDatePicker(false);
    if (selectedDate) setPurchasedDate(selectedDate);
  };

  const onStartDateChange = (event: any, selectedDate: Date | undefined) => {
    if (selectedDate) {
      const currentDate = new Date();
      if (selectedDate > currentDate) {
        setDateError("Start date cannot be a future date.");
      } else {
        setDateError("");
        setStartDate(selectedDate);
      }
    }
    setShowStartDatePicker(false);
  };

  const onExpireDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowExpireDatePicker(false);
    if (selectedDate) setExpireDate(selectedDate);
  };

  const onIssuedDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowIssuedDatePicker(false);
    if (selectedDate) setIssuedDate(selectedDate);
  };

  const onLbIssuedDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowLbIssuedDatePicker(false);
    if (selectedDate) setLbIssuedDate(selectedDate);
  };

  const onPermitIssuedDateChange = (
    event: any,
    selectedDate: Date | undefined
  ) => {
    setShowPermitIssuedDatePicker(false);
    if (selectedDate) setPermitIssuedDate(selectedDate);
  };
  const ownershipCategories = [
    {
      key: "1",
      value: "Own Building (with title ownership)",
      translationKey: t("FixedAssets.ownBuilding"),
    },
    {
      key: "2",
      value: "Leased Building",
      translationKey: t("FixedAssets.leasedBuilding"),
    },
    {
      key: "3",
      value: "Permit Building",
      translationKey: t("FixedAssets.permitBuilding"),
    },
    {
      key: "4",
      value: "Shared / No Ownership",
      translationKey: t("FixedAssets.sharedOwnership"),
    },
  ];

  const landownershipCategories = [
    { key: "1", value: "Own", translationKey: t("FixedAssets.OwnLand") },
    { key: "2", value: "Lease", translationKey: t("FixedAssets.LeaseLand") },
    {
      key: "3",
      value: "Permited",
      translationKey: t("FixedAssets.PermittedLand"),
    },
    {
      key: "4",
      value: "Shared",
      translationKey: t("FixedAssets.SharedOwnership"),
    },
  ];

  const districtOptions = [
    { key: 1, value: "Ampara", translationKey: t("FixedAssets.Ampara") },
    {
      key: 2,
      value: "Anuradhapura",
      translationKey: t("FixedAssets.Anuradhapura"),
    },
    { key: 3, value: "Badulla", translationKey: t("FixedAssets.Badulla") },
    {
      key: 4,
      value: "Batticaloa",
      translationKey: t("FixedAssets.Batticaloa"),
    },
    { key: 5, value: "Colombo", translationKey: t("FixedAssets.Colombo") },
    { key: 6, value: "Galle", translationKey: t("FixedAssets.Galle") },
    { key: 7, value: "Gampaha", translationKey: t("FixedAssets.Gampaha") },
    {
      key: 8,
      value: "Hambantota",
      translationKey: t("FixedAssets.Hambantota"),
    },
    { key: 9, value: "Jaffna", translationKey: t("FixedAssets.Jaffna") },
    { key: 10, value: "Kalutara", translationKey: t("FixedAssets.Kalutara") },
    { key: 11, value: "Kandy", translationKey: t("FixedAssets.Kandy") },
    { key: 12, value: "Kegalle", translationKey: t("FixedAssets.Kegalle") },
    {
      key: 13,
      value: "Kilinochchi",
      translationKey: t("FixedAssets.Kilinochchi"),
    },
    {
      key: 14,
      value: "Kurunegala",
      translationKey: t("FixedAssets.Kurunegala"),
    },
    { key: 15, value: "Mannar", translationKey: t("FixedAssets.Mannar") },
    { key: 16, value: "Matale", translationKey: t("FixedAssets.Matale") },
    { key: 17, value: "Matara", translationKey: t("FixedAssets.Matara") },
    {
      key: 18,
      value: "Moneragala",
      translationKey: t("FixedAssets.Moneragala"),
    },
    {
      key: 19,
      value: "Mullaitivu",
      translationKey: t("FixedAssets.Mullaitivu"),
    },
    {
      key: 20,
      value: "Nuwara Eliya",
      translationKey: t("FixedAssets.NuwaraEliya"),
    },
    {
      key: 21,
      value: "Polonnaruwa",
      translationKey: t("FixedAssets.Polonnaruwa"),
    },
    { key: 22, value: "Puttalam", translationKey: t("FixedAssets.Puttalam") },
    {
      key: 23,
      value: "Rathnapura",
      translationKey: t("FixedAssets.Rathnapura"),
    },
    {
      key: 24,
      value: "Trincomalee",
      translationKey: t("FixedAssets.Trincomalee"),
    },
    { key: 25, value: "Vavuniya", translationKey: t("FixedAssets.Vavuniya") },
  ];

  const Machineasset = [
    { key: "1", value: "Tractors", translationKey: t("FixedAssets.Tractors") },
    {
      key: "2",
      value: "Rotavator",
      translationKey: t("FixedAssets.Rotavator"),
    },
    {
      key: "3",
      value: "Combine Harvesters",
      translationKey: t("FixedAssets.CombineHarvesters"),
    },
    {
      key: "4",
      value: "Transplanter",
      translationKey: t("FixedAssets.Transplanter"),
    },
    {
      key: "5",
      value: "Tillage Equipment",
      translationKey: t("FixedAssets.TillageEquipment"),
    },
    {
      key: "6",
      value: "Sowing Equipment",
      translationKey: t("FixedAssets.SowingEquipment"),
    },
    {
      key: "7",
      value: "Harvesting Equipment",
      translationKey: t("FixedAssets.HarvestingEquipment"),
    },
    {
      key: "8",
      value: "Threshers, Reaper, Binders",
      translationKey: t("FixedAssets.ThreshersReaperBinders"),
    },
    {
      key: "9",
      value: "Cleaning, Grading and Weighing Equipment",
      translationKey: t("FixedAssets.CleaningGradingEquipment"),
    },
    { key: "10", value: "Weeding", translationKey: t("FixedAssets.Weeding") },
    { key: "11", value: "Sprayers", translationKey: t("FixedAssets.Sprayers") },
    {
      key: "12",
      value: "Shelling and Grinding Machine",
      translationKey: t("FixedAssets.ShellingGrindingMachine"),
    },
    { key: "13", value: "Sowing", translationKey: t("FixedAssets.Sowing") },
  ];

  const ToolAssets = [
    { key: "1", value: "Hand Fork", translationKey: t("FixedAssets.handFork") },
    {
      key: "2",
      value: "Cutting knife",
      translationKey: t("FixedAssets.cuttingKnife"),
    },
    {
      key: "3",
      value: "Iluk kaththa",
      translationKey: t("FixedAssets.ilukKaththa"),
    },
    { key: "4", value: "Kaththa", translationKey: t("FixedAssets.kaththa") },
    {
      key: "5",
      value: "Kara diga manna",
      translationKey: t("FixedAssets.karaDigaManna"),
    },
    {
      key: "6",
      value: "Coconut harvesting knife",
      translationKey: t("FixedAssets.coconutHarvestingKnife"),
    },
    {
      key: "7",
      value: "Tapping knife",
      translationKey: t("FixedAssets.tappingKnife"),
    },
    { key: "8", value: "Mamotie", translationKey: t("FixedAssets.mamotie") },
    {
      key: "9",
      value: "Manna knife",
      translationKey: t("FixedAssets.mannaKnife"),
    },
    { key: "10", value: "Shovel", translationKey: t("FixedAssets.shovel") },
    {
      key: "11",
      value: "Small axe",
      translationKey: t("FixedAssets.smallAxe"),
    },
    {
      key: "12",
      value: "Pruning knife",
      translationKey: t("FixedAssets.puningKnife"),
    },
    {
      key: "13",
      value: "Hoe with fork",
      translationKey: t("FixedAssets.hoeWithFork"),
    },
    { key: "14", value: "Fork hoe", translationKey: t("FixedAssets.forkHoe") },
    {
      key: "15",
      value: "Sickle - paddy",
      translationKey: t("FixedAssets.sicklePaddy"),
    },
    {
      key: "16",
      value: "Grow bags",
      translationKey: t("FixedAssets.growBags"),
    },
    {
      key: "17",
      value: "Seedling tray",
      translationKey: t("FixedAssets.seedlingTray"),
    },
    { key: "18", value: "Fogger", translationKey: t("FixedAssets.fogger") },
    {
      key: "19",
      value: "Drip Irrigation system",
      translationKey: t("FixedAssets.dripIrrigationSystem"),
    },
    {
      key: "20",
      value: "Sprinkler Irrigation system",
      translationKey: t("FixedAssets.sprinklerIrrigationSystem"),
    },
    {
      key: "21",
      value: "Water pump",
      translationKey: t("FixedAssets.waterPump"),
    },
    {
      key: "22",
      value: "Water tank",
      translationKey: t("FixedAssets.waterTank"),
    },
    { key: "23", value: "Other", translationKey: t("FixedAssets.other") },
  ];

  const brands = [
    { key: "1", value: "Lakloha", translationKey: t("FixedAssets.Lakloha") },
    {
      key: "2",
      value: "Crocodile",
      translationKey: t("FixedAssets.Crocodile"),
    },
    {
      key: "3",
      value: "Chillington",
      translationKey: t("FixedAssets.Chillington"),
    },
    { key: "4", value: "Lanlo", translationKey: t("FixedAssets.Lanlo") },
    { key: "5", value: "DBL", translationKey: t("FixedAssets.DBL") },
    { key: "6", value: "Browns", translationKey: t("FixedAssets.Browns") },
    { key: "7", value: "Hayles", translationKey: t("FixedAssets.Hayles") },
    {
      key: "8",
      value: "Janatha steel",
      translationKey: t("FixedAssets.Janathasteel"),
    },
    { key: "9", value: "Lakwa", translationKey: t("FixedAssets.Lakwa") },
    { key: "10", value: "CS Agro", translationKey: t("FixedAssets.CSAgro") },
    { key: "11", value: "Aswenna", translationKey: t("FixedAssets.Aswenna") },
    {
      key: "13",
      value: "Piyadasa Agro",
      translationKey: t("FixedAssets.PiyadasaAgro"),
    },
    { key: "14", value: "Lak agro", translationKey: t("FixedAssets.Lakagro") },
    {
      key: "15",
      value: "John Piper International",
      translationKey: t("FixedAssets.JohnPiperInternational"),
    },
    { key: "16", value: "Dinapala", translationKey: t("FixedAssets.Dinapala") },
    { key: "17", value: "ANTON", translationKey: t("FixedAssets.ANTON") },
    { key: "18", value: "ARPICO", translationKey: t("FixedAssets.ARPICO") },
    { key: "19", value: "S-lon", translationKey: t("FixedAssets.Slon") },
    { key: "20", value: "Singer", translationKey: t("FixedAssets.Singer") },
    { key: "21", value: "INGCO", translationKey: t("FixedAssets.INGCO") },
    { key: "22", value: "Jinasena", translationKey: t("FixedAssets.Jinasena") },
  ];

  const assetTypesForAssets: any = {
    Tractors: [
      { key: "4", value: "2WD", translationKey: t("FixedAssets.2WD") },
      { key: "5", value: "4WD", translationKey: t("FixedAssets.4WD") },
      {key: "6", value: "Other", translationKey: t("FixedAssets.other") }
    ],

    Transplanter: [
      {
        key: "14",
        value: "Paddy transplanter",
        translationKey: t("FixedAssets.Paddytransplanter"),
      },
      {key: "31", value: "Other", translationKey: t("FixedAssets.other") }
    ],

    "Harvesting equipment": [
      {
        key: "15",
        value: "Sugarcane harvester",
        translationKey: t("FixedAssets.Sugarcaneharvester"),
      },
      {
        key: "16",
        value: "Static shedder",
        translationKey: t("FixedAssets.Staticshedder"),
      },
      {
        key: "17",
        value: "Mini combine harvester",
        translationKey: t("FixedAssets.Minicombineharvester"),
      },
      {
        key: "18",
        value: "Rice Combine harvester",
        translationKey: t("FixedAssets.RiceCombineharvester"),
      },
      {
        key: "19",
        value: "Paddy harvester",
        translationKey: t("FixedAssets.Paddyharvester"),
      },
      {
        key: "20",
        value: "Maize harvester",
        translationKey: t("FixedAssets.Maizeharvester"),
      },
      {key: "32", value: "Other", translationKey: t("FixedAssets.other") }
    ],

    "Cleaning, Grading and Weighing Equipment": [
      {
        key: "21",
        value: "Seperator",
        translationKey: t("FixedAssets.Seperator"),
      },
      {
        key: "22",
        value: "Centrifugal Stier Machine",
        translationKey: t("FixedAssets.CentrifugalStierMachine"),
      },
      {
        key: "23",
        value: "Grain Classifier Seperator",
        translationKey: t("FixedAssets.GrainClassifierSeperator"),
      },
      {
        key: "24",
        value: "Destoner Machine",
        translationKey: t("FixedAssets.DestonerMachine"),
      },
      {key: "33", value: "Other", translationKey: t("FixedAssets.other") }
    ],

    Sprayers: [
      {
        key: "25",
        value: "Knapsack Sprayer",
        translationKey: t("FixedAssets.KnapsackSprayer"),
      },
      {
        key: "26",
        value: "Chemical Sprayer",
        translationKey: t("FixedAssets.ChemicalSprayer"),
      },
      {
        key: "27",
        value: "Mist Blower",
        translationKey: t("FixedAssets.MistBlower"),
      },
      {
        key: "28",
        value: "Environmental friendly sprayer",
        translationKey: t("FixedAssets.Environmentalfriendlysprayer"),
      },
      {
        key: "29",
        value: "Drone sprayer",
        translationKey: t("FixedAssets.Dronesprayer"),
      },
      {
        key: "30",
        value: "Pressure Sprayer",
        translationKey: t("FixedAssets.PressureSprayer"),
      },
      {key: "34", value: "Other", translationKey: t("FixedAssets.other") }
    ],
  };

  const brandTypesForAssets: any = {
    Tractors: [
      {
        key: "1",
        value: "E Kubota EK3 - 471 Hayles",
        translationKey: t("FixedAssets.EKubota"),
      },
      {
        key: "2",
        value: "Kubota L4508 4wd Tractor Hayles",
        translationKey: t("FixedAssets.KubotaL4508"),
      },
      {
        key: "3",
        value: "Kubota L3408 4wd Tractor - Hayles",
        translationKey: t("FixedAssets.KubotaL3408"),
      },
      {
        key: "4",
        value: "Tafe - Browns",
        translationKey: t("FixedAssets.Tafe"),
      },
      {
        key: "5",
        value: "Massey Ferguson - Browns",
        translationKey: t("FixedAssets.MasseyFerguson"),
      },
      {
        key: "6",
        value: "Yanmar - Browns",
        translationKey: t("FixedAssets.Yanmar"),
      },
      {
        key: "7",
        value: "Sumo - Browns",
        translationKey: t("FixedAssets.Sumo"),
      },
      {
        key: "8",
        value: "Sifang - Browns",
        translationKey: t("FixedAssets.Sifang"),
      },
      {
        key: "9",
        value: "Uikyno - Browns",
        translationKey: t("FixedAssets.Uikyno"),
      },
      {
        key: "10",
        value: "Shakthiman - Browns",
        translationKey: t("FixedAssets.ShakthimanBrowns"),
      },
      {
        key: "11",
        value: "Fieldking - Browns",
        translationKey: t("FixedAssets.Fieldking"),
      },
      {
        key: "12",
        value: "National - Browns",
        translationKey: t("FixedAssets.National"),
      },
      {
        key: "13",
        value: "Gaspardo - Browns",
        translationKey: t("FixedAssets.Gaspardo"),
      },
      {
        key: "14",
        value: "Agro Vision - Browns",
        translationKey: t("FixedAssets.AgroVision"),
      },
      {
        key: "15",
        value: "50 HP - ME",
        translationKey: t("FixedAssets.HP50ME"),
      },
      { key: "16", value: "ME", translationKey: t("FixedAssets.ME") },
      {
        key: "17",
        value: "Mahindra - DIMO",
        translationKey: t("FixedAssets.MahindraDIMO"),
      },
      {
        key: "18",
        value: "Swaraj - DIMO",
        translationKey: t("FixedAssets.SwarajDIMO"),
      },
      {
        key: "19",
        value: "Claas - DIMO",
        translationKey: t("FixedAssets.ClaasDIMO"),
      },
      {
        key: "20",
        value: "LOVOL - DIMO",
        translationKey: t("FixedAssets.LOVOLDIMO"),
      },
      { key: "21", value: "Kartar", translationKey: t("FixedAssets.Kartar") },
      {
        key: "22",
        value: "Shakthiman",
        translationKey: t("FixedAssets.Shakthiman"),
      },
      { key: "23", value: "Ginhua", translationKey: t("FixedAssets.Ginhua") },
    ],

    Rotavator: [
      {
        key: "24",
        value: "Shaktiman Fighter Rotavator",
        translationKey: t("FixedAssets.ShaktimanRotavator"),
      },
    ],
    "Combine harvesters": [
      {
        key: "25",
        value: "Agrotech Kool Combine Harvester - Hayleys",
        translationKey: t("FixedAssets.AgrotechKool"),
      },
      {
        key: "26",
        value: "Agrotech Eco Combine Harvester - Hayleys",
        translationKey: t("FixedAssets.AgrotechEco"),
      },
      {
        key: "27",
        value: "Kubota DC-70G Plus Combine Harvester - Hayleys",
        translationKey: t("FixedAssets.KubotaDC70G"),
      },
    ],
    Transplanters: [
      {
        key: "28",
        value: "Kubota NSP - 4W Rice Transplanter - Hayleys",
        translationKey: t("FixedAssets.KubotaNSP4W"),
      },
      {
        key: "29",
        value: "Transplanters - Dimo",
        translationKey: t("FixedAssets.TransplantersDimo"),
      },
      { key: "30", value: "ARBOS", translationKey: t("FixedAssets.ARBOS") },
      {
        key: "31",
        value: "National",
        translationKey: t("FixedAssets.NationalTransplanter"),
      },
    ],
    "Tillage Equipment": [
      {
        key: "32",
        value: "13 Tyne Cultivator Spring Loaded -  ME",
        translationKey: t("FixedAssets.TyneCultivator"),
      },
      {
        key: "33",
        value: "Terracer Blade/Leveller  ME",
        translationKey: t("FixedAssets.TerracerBlade"),
      },
      {
        key: "34",
        value: "Rotary Tiller - ME",
        translationKey: t("FixedAssets.RotaryTiller"),
      },
      {
        key: "35",
        value: "Power harrow -  ME",
        translationKey: t("FixedAssets.PowerHarrow"),
      },
      {
        key: "36",
        value: "Mounted Disc Ridger -  ME",
        translationKey: t("FixedAssets.DiscRidger"),
      },
      {
        key: "37",
        value: "Disc Harrow Tractor Mounted -  ME",
        translationKey: t("FixedAssets.DiscHarrow"),
      },
      {
        key: "38",
        value: "Disk Plough-  ME",
        translationKey: t("FixedAssets.DiskPlough"),
      },
      {
        key: "39",
        value: "Mini Tiller",
        translationKey: t("FixedAssets.MiniTiller"),
      },
      {
        key: "40",
        value: "Hand plough",
        translationKey: t("FixedAssets.HandPlough"),
      },
      {
        key: "41",
        value: "Tine tiller",
        translationKey: t("FixedAssets.TineTiller"),
      },
      { key: "42", value: "Browns", translationKey: t("FixedAssets.Browns") },
      { key: "43", value: "Hayles", translationKey: t("FixedAssets.Hayles") },
      { key: "44", value: "Dimo", translationKey: t("FixedAssets.Dimo") },
    ],
    "Sowing equipment": [
      {
        key: "45",
        value: "Seed Sowing Machine - ME",
        translationKey: t("FixedAssets.Dimo"),
      },
      {
        key: "46",
        value: "Automatic Seed Sowing Machine - ME",
        translationKey: t("FixedAssets.Dimo"),
      },
    ],
    "Harvesting equipment": [
      {
        key: "47",
        value: "Combine harvester - ME",
        translationKey: t("FixedAssets.SeedSowingMachine"),
      },
      {
        key: "48",
        value: "4LZ 3.0 Batta Harvester",
        translationKey: t("FixedAssets.AutomaticSeedSowingMachine"),
      },
      {
        key: "49",
        value: "4LZ 6.0P Combine Harvester",
        translationKey: t("FixedAssets.CombineHarvesterME"),
      },
      {
        key: "50",
        value: "4LZ 4.0E Combine Harvester",
        translationKey: t("FixedAssets.BattaHarvester"),
      },
      { key: "51", value: "Browns", translationKey: t("FixedAssets.Browns") },
      { key: "52", value: "Hayles", translationKey: t("FixedAssets.Hayles") },
      {
        key: "53",
        value: "Yanmar - Browns",
        translationKey: t("FixedAssets.YanmarBrowns"),
      },
      { key: "54", value: "360 TAF", translationKey: t("FixedAssets.TAF360") },
      {
        key: "55",
        value: "AGRIUNNION",
        translationKey: t("FixedAssets.AGRIUNNION"),
      },
      { key: "56", value: "KARTAR", translationKey: t("FixedAssets.Kartar") },
    ],

    "Threshers, Reaper, Binders": [
      {
        key: "57",
        value: "Mini Combine Cutter Thresher - ME",
        translationKey: t("FixedAssets.MiniCombineCutter"),
      },
      {
        key: "58",
        value: "Multi Crop Cutter Thresher - ME",
        translationKey: t("FixedAssets.MultiCropCutter"),
      },
    ],
    "Cleaning, Grading and Weighing Equipment": [
      {
        key: "59",
        value: "Grill Type Magnetic Separator - ME",
        translationKey: t("FixedAssets.GrillMagneticSeparator"),
      },
      {
        key: "60",
        value: "Vibrio Separator Machine - ME",
        translationKey: t("FixedAssets.VibrioSeparator"),
      },
      {
        key: "61",
        value: "Centrifugal Stifer Machine - ME",
        translationKey: t("FixedAssets.CentrifugalStifer"),
      },
      {
        key: "62",
        value: "Intensive Scourer - ME",
        translationKey: t("FixedAssets.IntensiveScourer"),
      },
      {
        key: "63",
        value: "Grain Classifier Separator - ME",
        translationKey: t("FixedAssets.GrainClassifier"),
      },
      {
        key: "64",
        value: "Grain Cleaning Machine - ME",
        translationKey: t("FixedAssets.GrainCleaningMachine"),
      },
      {
        key: "65",
        value: "Destoner Machine - ME",
        translationKey: t("FixedAssets.DestonerMachineME"),
      },
      { key: "66", value: "Browns", translationKey: t("FixedAssets.Browns") },
      { key: "67", value: "Hayles", translationKey: t("FixedAssets.Hayles") },
    ],
    Weeding: [
      {
        key: "68",
        value: "FarmWeeding Ditching - ME",
        translationKey: t("FixedAssets.FarmWeedingDitching"),
      },
      { key: "69", value: "Slasher", translationKey: t("FixedAssets.Slasher") },
      { key: "70", value: "Browns", translationKey: t("FixedAssets.Browns") },
      { key: "71", value: "Hayles", translationKey: t("FixedAssets.Hayles") },
      { key: "72", value: "Dimo", translationKey: t("FixedAssets.Dimo") },
    ],
    Sprayers: [
      {
        key: "73",
        value: "Knapsack Power Sprayer - ME",
        translationKey: t("FixedAssets.KnapsackPowerSprayer"),
      },
      {
        key: "74",
        value: "Oregon Sprayer",
        translationKey: t("FixedAssets.OregonSprayer"),
      },
      {
        key: "75",
        value: "Chemical Sprayer",
        translationKey: t("FixedAssets.ChemicalSprayers"),
      },
      {
        key: "76",
        value: "Mist Blower",
        translationKey: t("FixedAssets.MistBlowers"),
      },
      { key: "77", value: "DBL", translationKey: t("FixedAssets.DBL") },
      { key: "78", value: "Browns", translationKey: t("FixedAssets.Browns") },
      { key: "79", value: "Hayles", translationKey: t("FixedAssets.Hayles") },
      {
        key: "80",
        value: "National",
        translationKey: t("FixedAssets.NationalTransplanter"),
      },
      { key: "81", value: "ARBOS", translationKey: t("FixedAssets.ARBOS") },
      { key: "82", value: "Gardena", translationKey: t("FixedAssets.Gardena") },
      {
        key: "92",
        value: "Tractor Mounted Sprayer - ME",
        translationKey: t("FixedAssets.TractorMountedSprayer"),
      },
    ],
    "Shelling and Grinding Machine": [
      {
        key: "93",
        value: "Maize Processing Machine - ME",
        translationKey: t("FixedAssets.MaizeProcessingMachine"),
      },
      {
        key: "94",
        value: "Maize Coen Thresher - ME",
        translationKey: t("FixedAssets.MaizeCoenThresher"),
      },
    ],
    Sowing: [
      {
        key: "95",
        value: "Steel and Plastic Seed Sowing Machine",
        translationKey: t("FixedAssets.SteelSeedSowing"),
      },
      {
        key: "96",
        value: "Tractor Mounted Sprayer",
        translationKey: t("FixedAssets.TractorMountedSpray"),
      },
    ],
  };

  const warrantystatus = [
    { key: "1", value: "yes" },
    { key: "2", value: "no" },
  ];

  const assetTypesForBuilding = [
    { key: "1", value: "Barn", translationKey: t("FixedAssets.barn") },
    { key: "2", value: "Silo", translationKey: t("FixedAssets.silo") },
    {
      key: "3",
      value: "Greenhouse structure",
      translationKey: t("FixedAssets.greenhouseStructure"),
    },
    {
      key: "4",
      value: "Storage facility",
      translationKey: t("FixedAssets.storageFacility"),
    },
    {
      key: "5",
      value: "Storage shed",
      translationKey: t("FixedAssets.storageShed"),
    },
    {
      key: "6",
      value: "Processing facility",
      translationKey: t("FixedAssets.processingFacility"),
    },
    {
      key: "7",
      value: "Packing shed",
      translationKey: t("FixedAssets.packingShed"),
    },
    {
      key: "8",
      value: "Dairy parlor",
      translationKey: t("FixedAssets.dairyParlor"),
    },
    {
      key: "9",
      value: "Poultry house",
      translationKey: t("FixedAssets.poultryHouse"),
    },
    {
      key: "10",
      value: "Livestock shelter",
      translationKey: t("FixedAssets.livestockShelter"),
    },
  ];

  const generalConditionOptions = [
    { key: "1", value: "Good", translationKey: t("FixedAssets.good") },
    { key: "2", value: "Average", translationKey: t("FixedAssets.average") },
    { key: "3", value: "Poor", translationKey: t("FixedAssets.poor") },
  ];

  const fetchSelectedTools = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        // console.error("No token found in AsyncStorage");
        setLoading(false);
        return;
      }
      // Fetch details for the selected tools or a single tool
      const response = await axios.get(
        `${environment.API_BASE_URL}api/auth/fixedasset/${selectedTools}/${category}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = Array.isArray(response.data)
        ? response.data
        : [response.data];
      console.log(data);
      if (data) {
        setTools(data);
        setUpdatedDetails(
          data.reduce((acc: any, tool: any) => {
            acc[tool.id] = { ...tool }; // Store tool data by ID for updating
            return acc;
          }, {})
        );
      }
    } catch (error) {
      // console.error("Error fetching selected tools:", error);
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
      if (!toolDetails.extentha && !toolDetails.extentac && !toolDetails.extentp) {
        errors.push(t("FixedAssets.extentRequired"));
      }
      if (!toolDetails.ownership) errors.push(t("FixedAssets.ownershipRequired"));
      
      const ownership = toolDetails.ownership;
      const ownershipDetails = toolDetails.ownershipDetails || {};
  
      switch (ownership) {
        case "Lease":
          if (!ownershipDetails.startDate)
            errors.push(t("FixedAssets.startDateRequired"));
          if (!ownershipDetails.durationYears && !ownershipDetails.durationMonths) {
            errors.push(t("FixedAssets.durationRequired"));
          } else {
            if (!ownershipDetails.durationYears) ownershipDetails.durationYears = 0;
            if (!ownershipDetails.durationMonths) ownershipDetails.durationMonths = 0;
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
      if (!toolDetails.floorArea) errors.push(t("FixedAssets.floorAreaRequired"));
      if (!toolDetails.ownership) errors.push(t("FixedAssets.ownershipRequired"));
      if (!toolDetails.generalCondition)
        errors.push(t("FixedAssets.generalConditionRequired"));
      if (!toolDetails.district) errors.push(t("FixedAssets.districtRequired"));
  
      const ownership = toolDetails.ownership;
      const ownershipDetails = toolDetails.ownershipDetails || {};
  
      switch (ownership) {
        case "Leased Building":
          if (!ownershipDetails.startDate)
            errors.push(t("FixedAssets.startDateRequired"));
          if (!ownershipDetails.durationYears && !ownershipDetails.durationMonths) {
            errors.push(t("FixedAssets.durationRequired"));
          } else {
            if (!ownershipDetails.durationYears) ownershipDetails.durationYears = 0;
            if (!ownershipDetails.durationMonths) ownershipDetails.durationMonths = 0;
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
      if (!toolDetails.brand) 
        errors.push(t("FixedAssets.brandRequired"));
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
  
  const handleUpdateTools = async () => {
    try {
      for (const tool of tools) {
        const toolDetails = updatedDetails[tool.id];
        const validationErrors = validateTool(toolDetails, tool.category);
        if (validationErrors.length > 0) {
          Alert.alert(t("FixedAssets.sorry"), validationErrors.join("\n"));
          return;
        }
      }
  
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;
  
      for (const tool of tools) {
        const { id, category } = tool;
        const updatedToolDetails = updatedDetails[id];
        console.log(updatedToolDetails);
  
        // const payload = {
        //   ...updatedToolDetails,
        //   oldOwnership: updatedToolDetails?.oldOwnership || updatedToolDetails.ownership,
        // };

        if (updatedToolDetails.ownershipDetails) {
          updatedToolDetails.ownershipDetails = {
            ...updatedToolDetails.ownershipDetails,
            durationYears: updatedToolDetails.ownershipDetails.durationYears ?? 0,
            durationMonths: updatedToolDetails.ownershipDetails.durationMonths ?? 0,
          };
        }
    
        const payload = {
          ...updatedToolDetails,
          oldOwnership: updatedToolDetails.oldOwnership || updatedToolDetails.ownership,
        };

        setIsLoading(true);
  
        const response = await axios.put(
          `${environment.API_BASE_URL}api/auth/fixedasset/${id}/${category}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        if (response.status !== 200) {
          throw new Error("Failed to update one or more assets");
        }
        setIsLoading(false);
      }
  
      Alert.alert(
        t("FixedAssets.successTitle"),
        t("FixedAssets.assetsUpdatedSuccessfully")
      );
      setIsLoading(false);
      navigation.goBack();
    } catch (error) {
      Alert.alert(t("FixedAssets.sorry"), t("FixedAssets.failToUpdateAssets"));
      setIsLoading(false);
    }
  };
  
  const handleOwnershipInputChange = (toolId: any, field: any, value: any) => {
    setUpdatedDetails((prev: any) => ({
      ...prev,
      [toolId]: {
        ...prev[toolId],
        ownershipDetails: {
          ...prev[toolId]?.ownershipDetails,
          [field]: value,
        },
      },
    }));
  };

  const handleInputChange = (toolId: any, field: any, value: any) => {
    setUpdatedDetails((prevDetails: any) => {
      const fields = field.split(".");
      const toolDetails = { ...prevDetails[toolId] };

      // Handle nested fields if required
      if (fields.length > 1) {
        const [mainField, subField] = fields;
        toolDetails[mainField] = {
          ...toolDetails[mainField],
          [subField]: value,
        };
      } else {
        toolDetails[field] = value;
      }

      // Calculate totalPrice if field is numberOfUnits or unitPrice
      if (field === "numberOfUnits" || field === "unitPrice") {
        const numberOfUnits = parseFloat(toolDetails.numberOfUnits) || 0;
        const unitPrice = parseFloat(toolDetails.unitPrice) || 0;
        toolDetails.totalPrice = (numberOfUnits * unitPrice).toFixed(2);
      }

      return {
        ...prevDetails,
        [toolId]: toolDetails,
      };
    });
  };

  const handleDateChange = (
    toolId: string,
    field: string,
    selectedDate: Date | undefined
  ) => {
    if (selectedDate) {
      setUpdatedDetails((prev: any) => ({
        ...prev,
        [toolId]: {
          ...prev[toolId],
          ownershipDetails: {
            ...prev[toolId]?.ownershipDetails,
            [field]: selectedDate.toISOString().split("T")[0],
          },
        },
      }));
    }
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      enabled
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView className="p-2 bg-white">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#00ff00" />
          </View>
        ) : (
          tools.map((tool) => (
            <View key={tool.id} className=" bg-white rounded  p-2">
              <View className="flex-row items-center justify-center">
                <View className="left-0 top-0 absolute">
                  <AntDesign
                    name="left"
                    size={24}
                    color="#000502"
                    onPress={() => navigation.goBack()}
                  />
                </View>

                <View className="flex">
                  <Text className="font-bold text-lg text-center pl-1">
                    {translateCategory(category, t)}
                  </Text>
                  <Text className="font-bold text-lg text-center">
                    {t("FixedAssets.edit")}
                  </Text>
                </View>
              </View>
              <View className="p-2">
                {tool.category === "Land" && (
                  <>
                    <Text className=" pb-2 pt-8 font-bold">
                      {t("FixedAssets.district")}
                    </Text>
                    <View className="rounded-full mb-4  ">
                      <DropDownPicker
                        open={openDistrict}
                        value={updatedDetails[tool.id]?.district || ""}
                        setOpen={(open) => {
                          setOpenDistrict(open);
                          setOpenAsset(false);
                          setOpenType(false);
                          setOpenLandOwnership(false);
                          setOpenGeneralCondition(false);
                          setOpenOwnership(false);
                        }}
                        setValue={(callback) =>
                          setUpdatedDetails((prev: { [x: string]: any }) => ({
                            ...prev,
                            [tool.id]: {
                              ...prev[tool.id],
                              district: callback(
                                updatedDetails[tool.id]?.district || ""
                              ),
                            },
                          }))
                        }
                        onSelectItem={(item) =>
                          handleInputChange(tool.id, "district", item.value)
                        }
                        items={districtOptions.map((item) => ({
                          label: item.translationKey,
                          value: item.value,
                          key: item.key,
                        }))}
                        placeholder={t("FixedAssets.selectDistrict")}
                        placeholderStyle={{ color: "#6B7280" }}
                        dropDownDirection="BOTTOM"
                        style={{
                          borderColor: "#ccc",
                          borderWidth: 1,
                          backgroundColor: "#F4F4F4",
                          borderRadius: 30,
                          paddingHorizontal: 12,
                          paddingVertical: 12,
                        }}
                        textStyle={{
                          fontSize: 14,
                        }}
                        searchable={true}
                        searchPlaceholder={t("FixedAssets.selectDistrict")}
                        listMode="MODAL"
                        zIndex={1000}
                      />
                    </View>
                    <Text className=" pb-2 pt-2 font-bold">
                      {t("FixedAssets.extent")}
                    </Text>
                    <View className="flex-row  justify-between items-center pb-2 w-full">
                      <Text className="pr-1 ">{t("FixedAssets.ha")}</Text>
                      <TextInput
                        placeholder={t("FixedAssets.ha")}
                        value={
                          updatedDetails[tool.id]?.extentha?.toString() || ""
                        }
                        onChangeText={(text) => {                             
                          const cleanedText = text.replace(/[-*#.]/g, '');                            
                          handleInputChange(tool.id, "extentha", cleanedText);                           
                        }} 
                        className="border border-gray-300 bg-[#F4F4F4] p-2 mb-2 px-4 rounded-full w-[25%]"
                        keyboardType="numeric"
                      />
                      <Text className="pl-2  pr-1 font-bold">
                        {t("FixedAssets.ac")}
                      </Text>
                      <TextInput
                        placeholder={t("FixedAssets.ac")}
                        value={
                          updatedDetails[tool.id]?.extentac?.toString() || ""
                        }
                        // onChangeText={(value) =>
                        //   handleInputChange(tool.id, "extentac", value)
                        // }
                          onChangeText={(text) => {                             
                            const cleanedText = text.replace(/[-*#.]/g, '');                            
                            handleInputChange(tool.id, "extentac", cleanedText);                           
                          }} 
                        keyboardType="numeric"
                        className="border border-gray-300 bg-[#F4F4F4] rounded-full p-2 px-4 mb-2 w-[25%]"
                      />
                      <Text className="pl-2 pr-1 font-bold">
                        {t("FixedAssets.p")}
                      </Text>
                      <TextInput
                        placeholder={t("FixedAssets.p")}
                        value={
                          updatedDetails[tool.id]?.extentp?.toString() || ""
                        }
                          onChangeText={(text) => {                             
                            const cleanedText = text.replace(/[-*#.]/g, '');                            
                            handleInputChange(tool.id, "extentp", cleanedText);                           
                          }} 
                        keyboardType="numeric"
                        className="border border-gray-300 bg-[#F4F4F4] rounded-full p-2 px-4 mb-2 w-[25%]"
                      />
                    </View>

                    <Text className=" pb-2 font-bold ">
                      {t("FixedAssets.ownership")}
                    </Text>
                    <View className="rounded-full  mb-4">
                      <DropDownPicker
                        open={openOwnership}
                        value={updatedDetails[tool.id]?.ownership || ""}
                        setOpen={(open) => {
                          setOpenOwnership(open);
                          setOpenLandOwnership(false);
                          setOpenDistrict(false);
                          setOpenAsset(false);
                          setOpenType(false);
                          setOpenLandOwnership(false);
                          setOpenGeneralCondition(false);
                        }}
                        setValue={(callback) =>
                          setUpdatedDetails((prev: { [x: string]: any }) => ({
                            ...prev,
                            [tool.id]: {
                              ...prev[tool.id],
                              ownership: callback(
                                updatedDetails[tool.id]?.ownership || ""
                              ),
                            },
                          }))
                        }
                        onSelectItem={(item) => {
                          handleInputChange(tool.id, "ownership", item.value);
                          if (!updatedDetails[tool.id]?.oldOwnership) {
                            handleInputChange(
                              tool.id,
                              "oldOwnership",
                              updatedDetails[tool.id]?.ownership || item.value
                            );
                          }
                        }}
                        items={landownershipCategories.map((item) => ({
                          label: item.translationKey,
                          value: item.value,
                          key: item.key,
                        }))}
                        placeholder={t("FixedAssets.selectOwnership")}
                        placeholderStyle={{ color: "#6B7280" }}
                        dropDownDirection="BOTTOM"
                        dropDownContainerStyle={{
                          borderColor: "#ccc",
                          backgroundColor: "#F4F4F4",
                          borderWidth: 1,
                          maxHeight: 300,
                        }}
                        style={{
                          borderWidth: 1,
                          borderColor: "#ccc",
                          backgroundColor: "#F4F4F4",
                          borderRadius: 30,
                          paddingHorizontal: 12,
                          paddingVertical: 12,
                        }}
                        textStyle={{
                          fontSize: 14,
                        }}
                       // listMode="SCROLLVIEW"
                       listMode="SCROLLVIEW"
                scrollViewProps={{
                  nestedScrollEnabled: true,
                }}
                        zIndex={1000}
                      />
                    </View>

                    {updatedDetails[tool.id]?.ownership === "Own" && (
                      <>
                        <Text className="pb-2 ">
                          {t("FixedAssets.estimateValue")}
                        </Text>

                        <TextInput
                          placeholder={t("FixedAssets.estimateValue")}
                          value={
                            updatedDetails[tool.id]?.ownershipDetails
                              ?.estimateValue || ""
                          }
                           onChangeText={(text) => {                             
                             const cleanedText = text.replace(/[-*#]/g, '');                            
                             handleInputChange(tool.id, "ownershipDetails.estimateValue", cleanedText);                           
                           }} 
                          keyboardType="numeric"
                          className="border border-gray-300 bg-[#F4F4F4] rounded-full p-4 mb-4 pl-4"
                        />
                        <Text className=" pb-2 pt-2 font-bold">
                          {t("FixedAssets.issuedDate")}
                        </Text>
                        <TouchableOpacity
                          onPress={() => setShowIssuedDatePicker(prev => !prev)}
                          className="border border-gray-300 bg-[#F4F4F4] rounded-full p-4 mb-4 pl-4 flex-row justify-between"
                        >
                          <Text>
                            {updatedDetails[tool.id]?.ownershipDetails
                              ?.issuedDate
                              ? new Date(
                                  updatedDetails[
                                    tool.id
                                  ].ownershipDetails.issuedDate
                                )
                                  .toISOString()
                                  .split("T")[0]
                              : t("FixedAssets.issuedDate")}
                          </Text>
                           <Icon name="calendar-outline" size={20} color="#6B7280" />
                        </TouchableOpacity>

                {showIssuedDatePicker&&
                  (Platform.OS === "ios" ? (
                    <View className=" justify-center items-center z-50  bg-gray-100  rounded-lg">
                      <DateTimePicker
                        value={issuedDate || new Date()}
                        mode="date"
                        display="inline"
                        style={{ width: 320, height: 260 }}
                        onChange={(event, selectedDate) => {
                          setShowIssuedDatePicker(false);

                          if (event.type === "set" && selectedDate) {
                            const formattedDate = selectedDate
                              .toISOString()
                              .split("T")[0];
                            handleInputChange(
                              tool.id,
                              "ownershipDetails.issuedDate",
                              formattedDate
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
                          const formattedDate = selectedDate
                            .toISOString()
                            .split("T")[0];
                          handleInputChange(
                            tool.id,
                            "ownershipDetails.issuedDate",
                            formattedDate
                          );
                        }
                      }}
                      maximumDate={new Date()}
                    />
                  ))}

                      </>
                    )}

                    {updatedDetails[tool.id]?.ownership === "Lease" && (
                      <>
                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.startDate")}
                        </Text>
                        <TouchableOpacity
                          onPress={() => setShowStartDatePicker(prev => !prev)}
                          className="border border-gray-300 bg-[#F4F4F4] rounded-full p-4 mb-4 pl-4"
                        >
                          <Text>
                            {updatedDetails[tool.id]?.ownershipDetails
                              ?.startDate
                              ? new Date(
                                  updatedDetails[
                                    tool.id
                                  ].ownershipDetails.startDate
                                )
                                  .toISOString()
                                  .split("T")[0]
                              : t("FixedAssets.startDate")}
                          </Text>
                        </TouchableOpacity>

                  {showStartDatePicker &&
                  (Platform.OS === "ios" ? (
                    <View className=" justify-center items-center z-50 bg-gray-100  rounded-lg">
                      <DateTimePicker
                        value={startDate || new Date()}
                        mode="date"
                        display="inline"
                        style={{ width: 320, height: 260 }}
                        onChange={(event, selectedDate) => {
                          setShowStartDatePicker(false);

                          if (event.type === "set" && selectedDate) {
                            const formattedDate = selectedDate
                              .toISOString()
                              .split("T")[0];
                            handleInputChange(
                              tool.id,
                              "ownershipDetails.startDate",
                              formattedDate
                            );
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
                        setShowStartDatePicker(false);

                        if (event.type === "set" && selectedDate) {
                          const formattedDate = selectedDate
                            .toISOString()
                            .split("T")[0];
                          handleInputChange(
                            tool.id,
                            "ownershipDetails.startDate",
                            formattedDate
                          );
                        }
                      }}
                      maximumDate={new Date()}
                    />
                  ))}
                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.duration")}
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
                            onChangeText={(value) =>{
                              const cleanedText = value.replace(/[-*#.]/g, '');
                              handleInputChange(
                                tool.id,
                                "ownershipDetails.durationYears",
                                cleanedText
                              )
                            }
                            }
                            className="border border-gray-300 p-2 w-[30%] px-4 rounded-full bg-gray-100"
                          />

                          <Text className=" w-[20%] text-right pr-2 ">
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
                            onChangeText={(value) =>{
                              const cleanedText = value.replace(/[-*#.]/g, '');
                              handleInputChange(
                                tool.id,
                                "ownershipDetails.durationMonths",
                                cleanedText
                              )
                            }
                            }
                            className="border border-gray-300 p-2 w-24 rounded-full bg-gray-100 px-4"
                          />
                        </View>

                        <Text className="pb-2 mt-4 font-bold">
                          {t("FixedAssets.leasedAmountAnnually")}
                        </Text>
                        <TextInput
                          placeholder={t("FixedAssets.leasedAmountAnnually")}
                          value={
                            updatedDetails[tool.id]?.ownershipDetails
                              ?.leastAmountAnnually || ""
                          }
                          onChangeText={(value) =>{
                            const cleanedText = value.replace(/[-*#]/g, '');
                            handleInputChange(
                              tool.id,
                              "ownershipDetails.leastAmountAnnually",
                              cleanedText
                            )
                          }
                          }
                          keyboardType="numeric"
                          className="border border-gray-300 bg-[#F4F4F4] rounded-full p-4 mb-4 pl-4"
                        />
                      </>
                    )}

                    {updatedDetails[tool.id]?.ownership === "Permited" && (
                      <>
                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.issuedDate")}
                        </Text>
                        <TouchableOpacity
                          onPress={() => setShowStartDatePicker(prev => !prev)}
                          className="border border-gray-300 bg-[#F4F4F4] rounded-full p-4 mb-4 pl-4"
                        >
                          <Text>
                            {updatedDetails[tool.id]?.ownershipDetails
                              ?.issuedDate
                              ? new Date(
                                  updatedDetails[
                                    tool.id
                                  ].ownershipDetails.issuedDate
                                )
                                  .toISOString()
                                  .split("T")[0]
                              : t("FixedAssets.issuedDate")}
                          </Text>
                        </TouchableOpacity>


                {showStartDatePicker &&
                  (Platform.OS === "ios" ? (
                    <View className=" justify-center items-center z-50 bg-gray-100  rounded-lg">
                      <DateTimePicker
                        value={issuedDate || new Date()}
                        mode="date"
                        display="inline"
                        style={{ width: 320, height: 260 }}
                        onChange={(event, selectedDate) => {
                          setShowStartDatePicker(false);

                          if (event.type === "set" && selectedDate) {
                            const formattedDate = selectedDate
                              .toISOString()
                              .split("T")[0];
                            console.log(formattedDate);
                            handleInputChange(
                              tool.id,
                              "ownershipDetails.issuedDate",
                              formattedDate
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
                        setShowStartDatePicker(false);

                        if (event.type === "set" && selectedDate) {
                          const formattedDate = selectedDate
                            .toISOString()
                            .split("T")[0];
                          console.log(formattedDate);
                          handleInputChange(
                            tool.id,
                            "ownershipDetails.issuedDate",
                            formattedDate
                          );
                        }
                      }}
                      maximumDate={new Date()}
                    />
                  ))}

                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.paymentAnnually")}
                        </Text>
                        <TextInput
                          placeholder={t("FixedAssets.paymentAnnually")}
                          value={
                            updatedDetails[tool.id]?.ownershipDetails
                              ?.permitFeeAnnually || ""
                          }
                          onChangeText={(value) =>{
                            const cleanedText = value.replace(/[-*#]/g, '');
                            handleInputChange(
                              tool.id,
                              "ownershipDetails.permitFeeAnnually",
                              cleanedText
                            )
                          }
                          }
                          keyboardType="numeric"
                          className="border border-gray-300 bg-[#F4F4F4] rounded-full p-4 mb-4 pl-4"
                        />
                      </>
                    )}

                    {updatedDetails[tool.id]?.ownership === "Shared" && (
                      <>
                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.paymentAnnually")}
                        </Text>
                        <TextInput
                          placeholder={t("FixedAssets.paymentAnnually")}
                          value={
                            updatedDetails[tool.id]?.ownershipDetails
                              ?.paymentAnnually || ""
                          }
                          onChangeText={(value) =>{
                            const cleanedText = value.replace(/[-*#]/g, '');
                            handleInputChange(
                              tool.id,
                              "ownershipDetails.paymentAnnually",
                              cleanedText
                            )
                          }
                          }
                          keyboardType="numeric"
                          className="border border-gray-300 bg-[#F4F4F4] rounded-full p-4 mb-4 pl-4"
                        />
                      </>
                    )}

                    <Text className="font-bold pb-2 pt-2">
                      {t("FixedAssets.isLandFenced")}
                    </Text>
                    <View className="flex-row justify-around mb-5">
                      <TouchableOpacity
                        onPress={() =>
                          handleInputChange(tool.id, "landFenced", "yes")
                        }
                        className="flex-row items-center"
                      >
                        <View
                          className={`w-5 h-5 rounded-full ${
                            updatedDetails[tool.id]?.landFenced === "yes"
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        />
                        <Text className="ml-2">{t("FixedAssets.yes")}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          handleInputChange(tool.id, "landFenced", "no")
                        }
                        className="flex-row items-center"
                      >
                        <View
                          className={`w-5 h-5 rounded-full ${
                            updatedDetails[tool.id]?.landFenced === "no"
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        />
                        <Text className="ml-2">{t("FixedAssets.no")}</Text>
                      </TouchableOpacity>
                    </View>

                    <Text className="font-bold pb-2 ">
                      {t("FixedAssets.areThereAnyPerennialCrops")}
                    </Text>
                    <View className="flex-row justify-around mb-5">
                      <TouchableOpacity
                        onPress={() =>
                          handleInputChange(tool.id, "perennialCrop", "yes")
                        }
                        className="flex-row items-center"
                      >
                        <View
                          className={`w-5 h-5 rounded-full ${
                            updatedDetails[tool.id]?.perennialCrop === "yes"
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        />
                        <Text className="ml-2">{t("FixedAssets.yes")}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          handleInputChange(tool.id, "perennialCrop", "no")
                        }
                        className="flex-row items-center"
                      >
                        <View
                          className={`w-5 h-5 rounded-full ${
                            updatedDetails[tool.id]?.perennialCrop === "no"
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        />
                        <Text className="ml-2">{t("FixedAssets.no")}</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
                {tool.category === "Building and Infrastructures" && (
                  <>
                    <Text className="pb-2 pt-10 font-bold">
                      {t("FixedAssets.type")}
                    </Text>
                    <View className=" rounded-full  mb-4">
                      <DropDownPicker
                        open={openType}
                        value={updatedDetails[tool.id]?.type || ""}
                        setOpen={(open) => {
                          setOpenOwnership(false);
                          setOpenLandOwnership(false);
                          setOpenDistrict(false);
                          setOpenAsset(false);
                          setOpenType(open);
                          setOpenLandOwnership(false);
                          setOpenGeneralCondition(false);
                        }}
                        setValue={(callback) =>
                          setUpdatedDetails((prev: { [x: string]: any }) => ({
                            ...prev,
                            [tool.id]: {
                              ...prev[tool.id],
                              type: callback(
                                updatedDetails[tool.id]?.type || ""
                              ),
                            },
                          }))
                        }
                        onSelectItem={(item) =>
                          handleInputChange(tool.id, "type", item.value)
                        }
                        items={assetTypesForBuilding.map((item) => ({
                          label: item.translationKey,
                          value: item.value,
                          key: item.key,
                        }))}
                        placeholder={t("FixedAssets.selectType")}
                        placeholderStyle={{ color: "#6B7280" }}
                        dropDownDirection="BOTTOM"
                        dropDownContainerStyle={{
                          borderWidth: 1,
                          borderColor: "#ccc",
                          backgroundColor: "#F4F4F4",
                          maxHeight: 280,
                        }}
                        style={{
                          borderWidth: 1,
                          borderColor: "#ccc",
                          backgroundColor: "#F4F4F4",
                          borderRadius: 30,
                          paddingHorizontal: 12,
                          paddingVertical: 12,
                        }}
                        textStyle={{
                          fontSize: 14,
                        }}
                       // listMode="SCROLLVIEW"
                       listMode="SCROLLVIEW"
                scrollViewProps={{
                  nestedScrollEnabled: true,
                }}
                        zIndex={10000}
                      />
                    </View>

                    <Text className="pb-2 font-bold">
                      {t("FixedAssets.floorAreaSqrFt")}
                    </Text>
                    <TextInput
                      placeholder={t("FixedAssets.floorAreaSqrFt")}
                      value={updatedDetails[tool.id]?.floorArea || ""}
                      onChangeText={(text) => {                             
                        const cleanedText = text.replace(/[-*#]/g, '');                            
                        handleInputChange(tool.id, "floorArea", cleanedText);                           
                      }}  
                      className="border bg-[#F4F4F4] border-gray-300 rounded-full p-3 mb-4 pl-4"
                      keyboardType="numeric"
                    />
                    <Text className="pb-2 font-bold">
                      {t("FixedAssets.ownership")}
                    </Text>
                    <View className=" rounded-full mb-4">
                      <DropDownPicker
                        open={openOwnership}
                        value={updatedDetails[tool.id]?.ownership || ""}
                        setOpen={(open) => {
                          setOpenOwnership(open);
                          setOpenLandOwnership(false);
                          setOpenDistrict(false);
                          setOpenAsset(false);
                          setOpenType(false);
                          setOpenLandOwnership(false);
                          setOpenGeneralCondition(false);
                        }}
                        setValue={(callback) =>
                          setUpdatedDetails((prev: { [x: string]: any }) => ({
                            ...prev,
                            [tool.id]: {
                              ...prev[tool.id],
                              ownership: callback(
                                updatedDetails[tool.id]?.ownership || ""
                              ),
                            },
                          }))
                        }
                        onSelectItem={(item) => {
                          handleInputChange(tool.id, "ownership", item.value);

                          if (!("oldOwnership" in updatedDetails[tool.id])) {
                            handleInputChange(
                              tool.id,
                              "oldOwnership",
                              updatedDetails[tool.id]?.ownership || item.value
                            );
                          }
                        }}
                        items={ownershipCategories.map((item) => ({
                          label: item.translationKey,
                          value: item.value,
                          key: item.key,
                        }))}
                        placeholder={t("FixedAssets.selectOwnership")}
                        placeholderStyle={{ color: "#6B7280" }}
                        dropDownDirection="BOTTOM"
                        dropDownContainerStyle={{
                          borderWidth: 1,
                          borderColor: "#ccc",
                          backgroundColor: "#F4F4F4",
                          maxHeight: 300,
                          minHeight: 180,
                        }}
                        style={{
                          borderWidth: 1,
                          borderColor: "#ccc",
                          backgroundColor: "#F4F4F4",
                          borderRadius: 30,
                          paddingHorizontal: 12,
                          paddingVertical: 12,
                        }}
                        textStyle={{
                          fontSize: 14,
                        }}
                      //  listMode="SCROLLVIEW"
                      listMode="SCROLLVIEW"
                       scrollViewProps={{
                         nestedScrollEnabled: true,
                       }}
                        zIndex={9500}
                      />
                    </View>

                    <Text className="pb-2 font-bold">
                      {t("FixedAssets.generalCondition")}
                    </Text>
                    <View className="rounded-full  mb-4">
                      <DropDownPicker
                        open={openGeneralCondition}
                        value={updatedDetails[tool.id]?.generalCondition || ""}
                        setOpen={(open) => {
                          setOpenOwnership(false);
                          setOpenGeneralCondition(open);
                          setOpenLandOwnership(false);
                          setOpenDistrict(false);
                          setOpenAsset(false);
                          setOpenType(false);
                          setOpenLandOwnership(false);
                        }}
                        setValue={(callback) =>
                          setUpdatedDetails((prev: { [x: string]: any }) => ({
                            ...prev,
                            [tool.id]: {
                              ...prev[tool.id],
                              generalCondition: callback(
                                updatedDetails[tool.id]?.generalCondition || ""
                              ),
                            },
                          }))
                        }
                        onSelectItem={(item) =>
                          handleInputChange(
                            tool.id,
                            "generalCondition",
                            item.value
                          )
                        }
                        items={generalConditionOptions.map((item) => ({
                          label: item.translationKey,
                          value: item.value,
                          key: item.key,
                        }))}
                        placeholder={t("FixedAssets.selectGeneralCondition")}
                        placeholderStyle={{ color: "#6B7280" }}
                        dropDownDirection="BOTTOM"
                        dropDownContainerStyle={{
                          borderWidth: 1,
                          borderColor: "#ccc",
                          backgroundColor: "#F4F4F4",
                          maxHeight: 280,
                        }}
                        style={{
                          borderWidth: 1,
                          borderColor: "#ccc",
                          backgroundColor: "#F4F4F4",
                          borderRadius: 30,
                          paddingHorizontal: 12,
                          paddingVertical: 12,
                        }}
                        textStyle={{
                          fontSize: 14,
                        }}
                      //  listMode="SCROLLVIEW"
                      listMode="SCROLLVIEW"
                scrollViewProps={{
                  nestedScrollEnabled: true,
                }}
                        zIndex={9000}
                      />
                    </View>
                    <Text className="pb-2 font-bold">
                      {t("FixedAssets.district")}
                    </Text>
                    <View className=" rounded-full  mb-4">
                      <DropDownPicker
                        open={openDistrict}
                        value={updatedDetails[tool.id]?.district || ""}
                        setOpen={(open) => {
                          setOpenDistrict(open);
                          setOpenOwnership(false);
                          setOpenGeneralCondition(false);
                          setOpenLandOwnership(false);
                          setOpenAsset(false);
                          setOpenType(false);
                          setOpenLandOwnership(false);
                        }}
                        setValue={(callback) =>
                          setUpdatedDetails((prev: { [x: string]: any }) => ({
                            ...prev,
                            [tool.id]: {
                              ...prev[tool.id],
                              district: callback(
                                updatedDetails[tool.id]?.district || ""
                              ),
                            },
                          }))
                        }
                        onSelectItem={(item) =>
                          handleInputChange(tool.id, "district", item.value)
                        }
                        items={districtOptions.map((item) => ({
                          label: item.translationKey,
                          value: item.value,
                          key: item.key,
                        }))}
                        placeholder={t("FixedAssets.selectDistrict")}
                        placeholderStyle={{ color: "#6B7280" }}
                        dropDownDirection="BOTTOM"
                        dropDownContainerStyle={{
                          borderWidth: 1,
                          borderColor: "#ccc",
                          backgroundColor: "#F4F4F4",
                          maxHeight: 280,
                        }}
                        style={{
                          borderWidth: 1,
                          borderColor: "#ccc",
                          backgroundColor: "#F4F4F4",
                          borderRadius: 30,
                          paddingHorizontal: 12,
                          paddingVertical: 12,
                        }}
                        textStyle={{
                          fontSize: 14,
                        }}
                        listMode="MODAL"
                        searchable={true}
                        searchPlaceholder={t("FixedAssets.selectDistrict")}
                      />
                    </View>

                    {updatedDetails[tool.id]?.ownership ===
                      "Own Building (with title ownership)" && (
                      <>
                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.estimateValue")}
                        </Text>

                        <TextInput
                          placeholder={t("FixedAssets.estimateValue")}
                          value={
                            updatedDetails[tool.id]?.ownershipDetails
                              ?.estimateValue || ""
                          }
                          onChangeText={(text) => {                             
                            const cleanedText = text.replace(/[-*#]/g, '');                            
                            handleInputChange(tool.id, "ownershipDetails.estimateValue", cleanedText);                           
                          }}
                          keyboardType="numeric"
                          className="border bg-[#F4F4F4] border-gray-300  rounded-full p-3 mb-4 pl-4"
                        />
                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.issuedDate")}
                        </Text>
                        <TouchableOpacity
                          onPress={() => setShowIssuedDatePicker(prev => !prev)}
                          className="border bg-[#F4F4F4] border-gray-300  rounded-full p-4 mb-4 pl-4 flex-row justify-between"
                        >
                          <Text>
                            {updatedDetails[tool.id]?.ownershipDetails
                              ?.issuedDate
                              ? new Date(
                                  updatedDetails[
                                    tool.id
                                  ].ownershipDetails.issuedDate
                                )
                                  .toISOString()
                                  .split("T")[0]
                              : t("FixedAssets.issuedDate")}
                          </Text>
                           <Icon name="calendar-outline" size={20} color="#6B7280" />
                        </TouchableOpacity>

                  {showIssuedDatePicker &&
                  (Platform.OS === "ios" ? (
                    <View className=" justify-center items-center z-50  bg-gray-100  rounded-lg">
                      <DateTimePicker
                        value={issuedDate || new Date()}
                        mode="date"
                        display="inline"
                        style={{ width: 320, height: 260 }}
                        onChange={(event, selectedDate) => {
                          setShowIssuedDatePicker(false);

                          if (event.type === "set" && selectedDate) {
                            const formattedDate = selectedDate
                              .toISOString()
                              .split("T")[0];
                            handleInputChange(
                              tool.id,
                              "ownershipDetails.issuedDate",
                              formattedDate
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
                          const formattedDate = selectedDate
                            .toISOString()
                            .split("T")[0];
                          handleInputChange(
                            tool.id,
                            "ownershipDetails.issuedDate",
                            formattedDate
                          );
                        }
                      }}
                      maximumDate={new Date()}
                    />
                  ))}

                      </>
                    )}


                    {updatedDetails[tool.id]?.ownership ===
                      "Leased Building" && (
                      <>
                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.startDate")}
                        </Text>
                        <TouchableOpacity
                          onPress={() => setShowStartDatePicker(prev => !prev)}
                          className="border bg-[#F4F4F4] border-gray-300  rounded-full p-4 mb-4 pl-4 flex-row justify-between"
                        >
                          <Text>
                            {updatedDetails[tool.id]?.ownershipDetails
                              ?.startDate
                              ? new Date(
                                  updatedDetails[
                                    tool.id
                                  ].ownershipDetails.startDate
                                )
                                  .toISOString()
                                  .split("T")[0]
                              : t("FixedAssets.startDate")}
                          </Text>
                           <Icon name="calendar-outline" size={20} color="#6B7280" />
                        </TouchableOpacity>

                 {showStartDatePicker  &&
                  (Platform.OS === "ios" ? (
                    <View className=" justify-center items-center z-50  bg-gray-100  rounded-lg">
                      <DateTimePicker
                        value={startDate || new Date()}
                        mode="date"
                        display="inline"
                        style={{ width: 320, height: 260 }}
                        onChange={(event, selectedDate) => {
                          setShowStartDatePicker(false);

                          if (event.type === "set" && selectedDate) {
                            const formattedDate = selectedDate
                              .toISOString()
                              .split("T")[0];
                            console.log(formattedDate);
                            handleInputChange(
                              tool.id,
                              "ownershipDetails.startDate",
                              formattedDate
                            );
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
                        setShowStartDatePicker(false);

                        if (event.type === "set" && selectedDate) {
                          const formattedDate = selectedDate
                            .toISOString()
                            .split("T")[0];
                          console.log(formattedDate);
                          handleInputChange(
                            tool.id,
                            "ownershipDetails.startDate",
                            formattedDate
                          );
                        }
                      }}
                      maximumDate={new Date()}
                    />
                  ))}
                        <Text className="pb-2 mt-2 font-bold">
                          {t("FixedAssets.duration")}
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
                              onChangeText={(value) => {
                                const cleanedText = value.replace(/[-*#.]/g, ""); // removes all non-digits
                                handleInputChange(
                                  tool.id,
                                  "ownershipDetails.durationYears",
                                  cleanedText
                                );
                              }}
                            className="border border-gray-300 p-2 w-[30%] px-4 rounded-full bg-gray-100"
                          />

                          <Text className=" w-[20%] text-right pr-2 ">
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
                            onChangeText={(value) =>{
                              const cleanedText = value.replace(/[-*#.]/g, '');
                              handleInputChange(
                                tool.id,
                                "ownershipDetails.durationMonths",
                                cleanedText
                              )
                              }
                            }
                            className="border border-gray-300 p-2 w-24 rounded-full bg-gray-100 px-4"
                          />
                        </View>

                        <Text className="pb-2 mt-4 font-bold">
                          {t("FixedAssets.leasedAmountAnnually")}
                        </Text>
                        <TextInput
                          placeholder={t("FixedAssets.leasedAmountAnnually")}
                          value={
                            updatedDetails[tool.id]?.ownershipDetails
                              ?.leastAmountAnnually || ""
                          }
                          onChangeText={(value) =>{
                             const cleanedText = value.replace(/[-*#]/g, '');
                            handleInputChange(
                              tool.id,
                              "ownershipDetails.leastAmountAnnually",
                              cleanedText
                            )
                            }
                          }
                          keyboardType="numeric"
                          className="border bg-[#F4F4F4] border-gray-300  rounded-full p-3 mb-4 pl-4"
                        />
                      </>
                    )}

                    {updatedDetails[tool.id]?.ownership ===
                      "Permit Building" && (
                      <>
                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.issuedDate")}
                        </Text>
                        <TouchableOpacity
                          onPress={() => setShowStartDatePicker(prev => !prev)}
                          className="border bg-[#F4F4F4] border-gray-300  rounded-full p-4 mb-4 pl-4 flex-row justify-between"
                        >
                          <Text>
                            {updatedDetails[tool.id]?.ownershipDetails
                              ?.issuedDate
                              ? new Date(
                                  updatedDetails[
                                    tool.id
                                  ].ownershipDetails.issuedDate
                                )
                                  .toISOString()
                                  .split("T")[0]
                              : t("FixedAssets.issuedDate")}
                          </Text>
                           <Icon name="calendar-outline" size={20} color="#6B7280" />
                        </TouchableOpacity>

                  {showStartDatePicker  &&
                  (Platform.OS === "ios" ? (
                    <View className=" justify-center items-center z-50 bg-gray-100  rounded-lg">
                      <DateTimePicker
                        value={issuedDate || new Date()}
                        mode="date"
                        display="inline"
                        style={{ width: 320, height: 260 }}
                        onChange={(event, selectedDate) => {
                          setShowStartDatePicker(false);

                          if (event.type === "set" && selectedDate) {
                            const formattedDate = selectedDate
                              .toISOString()
                              .split("T")[0];
                            console.log(formattedDate);
                            handleInputChange(
                              tool.id,
                              "ownershipDetails.issuedDate",
                              formattedDate
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
                        setShowStartDatePicker(false);

                        if (event.type === "set" && selectedDate) {
                          const formattedDate = selectedDate
                            .toISOString()
                            .split("T")[0];
                          console.log(formattedDate);
                          handleInputChange(
                            tool.id,
                            "ownershipDetails.issuedDate",
                            formattedDate
                          );
                        }
                      }}
                      maximumDate={new Date()}
                    />
                  ))}

                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.paymentAnnually")}
                        </Text>
                        <TextInput
                          placeholder={t("FixedAssets.paymentAnnually")}
                          value={
                            updatedDetails[tool.id]?.ownershipDetails
                              ?.permitFeeAnnually || ""
                          }
                          onChangeText={(value) =>{
                             const cleanedText = value.replace(/[-*#]/g, '');
                            handleInputChange(
                              tool.id,
                              "ownershipDetails.permitFeeAnnually",
                              cleanedText
                            )
                          }
                          }
                          keyboardType="numeric"
                          className="border bg-[#F4F4F4] border-gray-300  rounded-full p-4 mb-4 pl-4"
                        />
                      </>
                    )}

                    {updatedDetails[tool.id]?.ownership ===
                      "Shared / No Ownership" && (
                      <>
                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.paymentAnnually")}
                        </Text>
                        <TextInput
                          placeholder={t("FixedAssets.paymentAnnually")}
                          value={
                            updatedDetails[tool.id]?.ownershipDetails
                              ?.paymentAnnually || ""
                          }
                          onChangeText={(value) =>{
                             const cleanedText = value.replace(/[-*#]/g, '');
                            handleInputChange(
                              tool.id,
                              "ownershipDetails.paymentAnnually",
                              cleanedText
                            )
                          }
                          }
                          keyboardType="numeric"
                          className="border bg-[#F4F4F4] border-gray-300  rounded-full p-3 mb-4 pl-4"
                        />
                      </>
                    )}
                  </>
                )}

                {tool.category === "Machine and Vehicles" ? (
                  <>
                    <Text className="pb-2 pt-10 font-bold">
                      {t("FixedAssets.asset")}
                    </Text>
                    <View className="rounded-full mb-4">

                      <DropDownPicker
                        open={openAsset}
                        value={updatedDetails[tool.id]?.asset || ""}
                        setOpen={(open) => {
                          setOpenDistrict(false);
                          setOpenOwnership(false);
                          setOpenGeneralCondition(false);
                          setOpenLandOwnership(false);
                          setOpenAsset(open);
                          setOpenType(false);
                          setOpenLandOwnership(false);
                          setOpenAssetType(false);
                          setOpenBrand(false);
                        }}
                        setValue={(callback) =>
                          setUpdatedDetails((prev: { [x: string]: any }) => ({
                            ...prev,
                            [tool.id]: {
                              ...prev[tool.id],
                              asset: callback(
                                updatedDetails[tool.id]?.asset || ""
                              ),
                            },
                          }))
                        }
                        onSelectItem={(item) => {
                          handleInputChange(tool.id, "asset", item.value);
                          setSelectedAsset(item.value);
                          
                        }}
                        items={Machineasset.map((item) => ({
                          label: item.translationKey,
                          value: item.value,
                          key: item.key,
                        }))}
                        placeholder={t("FixedAssets.selectAsset")}
                        placeholderStyle={{ color: "#6B7280" }}
                        dropDownDirection="BOTTOM"
                        dropDownContainerStyle={{
                          borderWidth: 1,
                          borderColor: "#ccc",
                          backgroundColor: "#F4F4F4",
                          maxHeight: 280,
                        }}
                        style={{
                          borderWidth: 1,
                          borderColor: "#ccc",
                          backgroundColor: "#F4F4F4",
                          borderRadius: 30,
                          paddingHorizontal: 12,
                          paddingVertical: 12,
                        }}
                        textStyle={{
                          fontSize: 14,
                        }}
                       // listMode="SCROLLVIEW"
                       listMode="SCROLLVIEW"
                scrollViewProps={{
                  nestedScrollEnabled: true,
                }}
                        zIndex={100000}
                      />
                    </View>

                    {selectedAsset && assetTypesForAssets[selectedAsset] && (
                      <>
                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.assetType")}
                        </Text>
                        <View className="rounded-full mb-4">
                          <DropDownPicker
                            open={openAssetType}
                            value={updatedDetails[tool.id]?.assetType || ""}
                            setOpen={(open) => {
                              setOpenAssetType(open);
                              setOpenDistrict(false);
                              setOpenOwnership(false);
                              setOpenGeneralCondition(false);
                              setOpenLandOwnership(false);
                              setOpenAsset(false);
                              setOpenType(false);
                              setOpenLandOwnership(false);
                              setOpenBrand(false);
                            }}
                            setValue={(callback) =>
                              setUpdatedDetails(
                                (prev: { [x: string]: any }) => ({
                                  ...prev,
                                  [tool.id]: {
                                    ...prev[tool.id],
                                    assetType: callback(
                                      updatedDetails[tool.id]?.assetType || ""
                                    ),
                                  },
                                })
                              )
                            }
                            onSelectItem={(item) =>
                              handleInputChange(
                                tool.id,
                                "assetType",
                                item.value
                              )
                            }
                            items={assetTypesForAssets[selectedAsset].map(
                              (type: any) => ({
                                label: type.translationKey,
                                value: type.value,
                                key: type.key,
                              })
                            )}
                            placeholder={t("FixedAssets.selectAssetType")}
                            placeholderStyle={{ color: "#6B7280" }}
                            dropDownDirection="BOTTOM"
                            dropDownContainerStyle={{
                              borderWidth: 1,
                              borderColor: "#ccc",
                              backgroundColor: "#F4F4F4",
                              maxHeight: 280,
                            }}
                            style={{
                              borderWidth: 1,
                              borderColor: "#ccc",
                              backgroundColor: "#F4F4F4",
                              borderRadius: 30,
                              paddingHorizontal: 12,
                              paddingVertical: 12,
                            }}
                            textStyle={{
                              fontSize: 14,
                            }}
                           // listMode="SCROLLVIEW"
                           listMode="SCROLLVIEW"
                scrollViewProps={{
                  nestedScrollEnabled: true,
                }}
                            zIndex={95000}
                          />
                        </View>
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
                            handleInputChange(tool.id, "mentionOther", value)
                          }
                          className="border border-gray-300 bg-[#F4F4F4] rounded-full p-3 pl-4 mb-4"
                        />
                      </>
                    )}
                    {selectedAsset && brandTypesForAssets[selectedAsset] && (
                      <>
                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.brand")}
                        </Text>
                        <View className=" rounded-full mb-4">
                
                        <TextInput
                          placeholder={t("FixedAssets.selectBrand")}
                          value={updatedDetails[tool.id]?.brand || ""}
                          onChangeText={(value) =>
                            handleInputChange(tool.id, "brand", value)
                          }
                          editable={false} 
                          className="border border-gray-300 bg-[#F4F4F4] rounded-full p-3 mb-4 pl-4"
                        />

                        </View>
                      </>
                    )}
                    <Text className="pb-2 font-bold">
                      {t("FixedAssets.numberofUnits")}
                    </Text>
                    <TextInput
                      placeholder={t("FixedAssets.numberofUnits")}
                      value={
                        updatedDetails[tool.id]?.numberOfUnits?.toString() || ""
                      }
                        onChangeText={(text) => {                             
                        const cleanedText = text.replace(/[-*#]/g, '');                            
                        handleInputChange(tool.id, "numberOfUnits", cleanedText);                           
                      }} 
                      keyboardType="numeric"
                      className="border border-gray-300 bg-[#F4F4F4] rounded-full p-3 mb-4 pl-4"
                    />

                    <Text className="pb-2 font-bold">
                      {t("FixedAssets.unitPrice")}
                    </Text>
                    <TextInput
                      placeholder={t("FixedAssets.unitPrice")}
                      value={updatedDetails[tool.id]?.unitPrice || ""}
                      onChangeText={(text) => {                             
                        const cleanedText = text.replace(/[-*#]/g, '');                            
                        handleInputChange(tool.id, "unitPrice", cleanedText);                           
                      }} 
                      keyboardType="numeric"
                      className="border border-gray-300 bg-[#F4F4F4] rounded-full p-3 mb-4 pl-4"
                    />
                    <Text className="pb-2 font-bold">
                      {t("FixedAssets.totalPrice")}
                    </Text>

                    <Text className="border border-gray-300 bg-[#F4F4F4] rounded-full p-4 mb-4 pl-4">
                      {updatedDetails[tool.id]?.totalPrice || ""}
                    </Text>

                    <Text className="pb-2 font-bold">
                      {t("FixedAssets.warranty")}
                    </Text>
                    <View className="flex-row justify-around mb-4">
                      <TouchableOpacity
                        onPress={() =>
                          handleInputChange(tool.id, "warranty", "yes")
                        }
                        className="flex-row items-center mt-2"
                      >
                        <View
                          className={`w-5 h-5 rounded-full ${
                            updatedDetails[tool.id]?.warranty === "yes"
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        />
                        <Text className="ml-2 ">{t("FixedAssets.yes")}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          handleInputChange(tool.id, "warranty", "no")
                        }
                        className="flex-row items-center"
                      >
                        <View
                          className={`w-5 h-5 rounded-full ${
                            updatedDetails[tool.id]?.warranty === "no"
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        />
                        <Text className="ml-2">{t("FixedAssets.no")}</Text>
                      </TouchableOpacity>
                    </View>

                    {updatedDetails[tool.id]?.warranty === "yes" && (
                      <>
                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.purchasedDate")}
                        </Text>
                        <TouchableOpacity
                          onPress={() => setShowPurchaseDatePicker(prev => !prev)}
                          className="border border-gray-300 p-4 pl-4 pr-4 rounded-full flex-row bg-gray-100  justify-between mb-3"
                        >
                          <Text>
                            {updatedDetails[tool.id]?.ownershipDetails
                              ?.purchaseDate
                              ? new Date(
                                  updatedDetails[
                                    tool.id
                                  ].ownershipDetails.purchaseDate
                                )
                                  .toISOString()
                                  .split("T")[0]
                              : t("FixedAssets.purchasedDate")}
                          </Text>
                          <Icon name="calendar-outline" size={20} color="#6B7280" />
                        </TouchableOpacity>

                  {showPurchaseDatePicker &&
                  (Platform.OS === "ios" ? (
                    <View className=" justify-center items-center z-50 bg-gray-100  rounded-lg">
                      <DateTimePicker
                         value={
                          new Date(
                            updatedDetails[
                              tool.id
                            ]?.ownershipDetails?.purchaseDate
                          ) || new Date()
                        }
                        mode="date"
                        display="inline"
                        style={{ width: 320, height: 260 }}
                        onChange={(event, selectedDate) => {
                          setShowPurchaseDatePicker(false);

                          if (event.type === "set" && selectedDate) {
                            const formattedDate = selectedDate
                              .toISOString()
                              .split("T")[0];
                            console.log(formattedDate);
                            handleInputChange(
                              tool.id,
                              "ownershipDetails.purchaseDate",
                              formattedDate
                            );
                          }
                        }}
                        maximumDate={
                          new Date(
                            new Date().setFullYear(
                              new Date().getFullYear() + 100
                            )
                          )
                        } 
                      />
                    </View>
                  ) : (
                    <DateTimePicker
                    value={
                      new Date(
                        updatedDetails[
                          tool.id
                        ]?.ownershipDetails?.purchaseDate
                      ) || new Date()
                    }
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowPurchaseDatePicker(false);

                        if (event.type === "set" && selectedDate) {
                          const formattedDate = selectedDate
                            .toISOString()
                            .split("T")[0];
                          console.log(formattedDate);
                          handleInputChange(
                            tool.id,
                            "ownershipDetails.purchaseDate",
                            formattedDate
                          );
                        }
                      }}
                      maximumDate={
                        new Date(
                          new Date().setFullYear(
                            new Date().getFullYear() + 100
                          )
                        )
                      } 
                    />
                  ))}

                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.warrantyExpireDate")}
                        </Text>
                        <TouchableOpacity
                          onPress={() => setShowExpireDatePicker(prev => !prev)}
                          className="border bg-[#F4F4F4] border-gray-300 rounded-full p-4 mb-4 pl-4 flex-row justify-between"
                        >
                          <Text>
                            {updatedDetails[tool.id]?.ownershipDetails
                              ?.expireDate
                              ? new Date(
                                  updatedDetails[
                                    tool.id
                                  ].ownershipDetails.expireDate
                                )
                                  .toISOString()
                                  .split("T")[0]
                              : t("FixedAssets.warrantyExpireDate")}
                          </Text>
                            <Icon name="calendar-outline" size={20} color="#6B7280" />
                        </TouchableOpacity>

                 {showExpireDatePicker &&
                  (Platform.OS === "ios" ? (
                    <View className=" justify-center items-center z-50 bg-gray-100  rounded-lg">
                      <DateTimePicker
                        value={
                          new Date(
                            updatedDetails[
                              tool.id
                            ]?.ownershipDetails?.expireDate
                          ) || new Date()
                        }
                        mode="date"
                        display="inline"
                        style={{ width: 320, height: 260 }}
                        onChange={(event, selectedDate) => {
                          setShowExpireDatePicker(false);

                          if (event.type === "set" && selectedDate) {
                            const formattedDate = selectedDate
                              .toISOString()
                              .split("T")[0];
                            console.log(formattedDate);
                            handleInputChange(
                              tool.id,
                              "ownershipDetails.expireDate",
                              formattedDate
                            );
                          }
                        }}
                        maximumDate={
                          new Date(
                            new Date().setFullYear(
                              new Date().getFullYear() + 100
                            )
                          )
                        } 
                      />
                    </View>
                  ) : (
                    <DateTimePicker
                    value={
                      new Date(
                        updatedDetails[
                          tool.id
                        ]?.ownershipDetails?.expireDate
                      ) || new Date()
                    }
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowExpireDatePicker(false);

                        if (event.type === "set" && selectedDate) {
                          const formattedDate = selectedDate
                            .toISOString()
                            .split("T")[0];
                          console.log(formattedDate);
                          handleInputChange(
                            tool.id,
                            "ownershipDetails.expireDate",
                            formattedDate
                          );
                        }
                      }}
                      maximumDate={
                        new Date(
                          new Date().setFullYear(
                            new Date().getFullYear() + 100
                          )
                        )
                      } 
                    />
                  ))}

                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.warrantyStatus")}
                        </Text>

                        <View className="border border-gray-300 rounded-full bg-gray-100 p-2 mt-2">
                          <Text
                            style={{
                              color:
                                new Date(
                                  updatedDetails[
                                    tool.id
                                  ]?.ownershipDetails?.expireDate
                                ) > new Date()
                                  ? "green"
                                  : "red",
                              fontWeight: "bold",
                              textAlign: "center",
                            }}
                          >
                            {new Date(
                              updatedDetails[
                                tool.id
                              ]?.ownershipDetails?.expireDate
                            ) > new Date()
                              ? t("FixedAssets.valid")
                              : t("FixedAssets.expired")}
                          </Text>
                        </View>
                      </>
                    )}
                  </>
                ) : null}

                {tool.category === "Tools" ? (
                  <>
                    <Text className="pb-2 pt-10 font-bold">
                      {t("FixedAssets.asset")}
                    </Text>
                    <View className=" rounded-full  mb-4">

                      <DropDownPicker
                        open={openAsset}
                        value={updatedDetails[tool.id]?.asset || ""}
                        setOpen={(open) => {
                          setOpenDistrict(false);
                          setOpenOwnership(false);
                          setOpenGeneralCondition(false);
                          setOpenLandOwnership(false);
                          setOpenAsset(open);
                          setOpenType(false);
                          setOpenLandOwnership(false);
                          setOpenBrand(false);
                        }}
                        setValue={(callback) =>
                          setUpdatedDetails((prev: { [x: string]: any }) => ({
                            ...prev,
                            [tool.id]: {
                              ...prev[tool.id],
                              asset: callback(
                                updatedDetails[tool.id]?.asset || ""
                              ),
                            },
                          }))
                        }
                        onSelectItem={(item) => {
                          handleInputChange(tool.id, "asset", item.value);
                          setSelectedAsset(item.value);
                        }}
                        items={ToolAssets.map((item) => ({
                          label: item.translationKey,
                          value: item.value,
                          key: item.key,
                        }))}
                        placeholder={t("FixedAssets.selectAsset")}
                        placeholderStyle={{ color: "#6B7280" }}
                        dropDownDirection="BOTTOM"
                        dropDownContainerStyle={{
                          borderWidth: 1,
                          borderColor: "#ccc",
                          backgroundColor: "#F4F4F4",
                          maxHeight: 280,
                        }}
                        style={{
                          borderWidth: 1,
                          borderColor: "#ccc",
                          backgroundColor: "#F4F4F4",
                          borderRadius: 30,
                          paddingHorizontal: 12,
                          paddingVertical: 12,
                        }}
                        textStyle={{
                          fontSize: 14,
                        }}
                       // listMode="SCROLLVIEW"
                       listMode="SCROLLVIEW"
                scrollViewProps={{
                  nestedScrollEnabled: true,
                }}
                        zIndex={10000}
                      />
                    </View>
                    {updatedDetails[tool.id]?.asset === "Other" && (
                      <>
                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.mentionOther")}
                        </Text>
                        <TextInput
                          placeholder={t("FixedAssets.mentionOther")}
                          value={updatedDetails[tool.id]?.mentionOther || ""}
                          onChangeText={(value) =>
                            handleInputChange(tool.id, "mentionOther", value)
                          }
                          className="border border-gray-300 bg-[#F4F4F4] rounded-full p-3 mb-4 pl-4"
                        />
                      </>
                    )}

                    <Text className="pb-2 font-bold">
                      {t("FixedAssets.brand")}
                    </Text>
                    <View className=" rounded-full  mb-4">
                         <TextInput
                      placeholder={t("FixedAssets.selectBrand")}
                      value={updatedDetails[tool.id]?.brand || ""}
                     editable={false} 
                        onChangeText={(value) =>
                        handleInputChange(tool.id, "brand", value)
                      }
                      
                      className="border border-gray-300 bg-[#F4F4F4] rounded-full p-3 mb-4 pl-4"
                    />
                    </View>

                    <Text className="pb-2 font-bold">
                      {t("FixedAssets.numberofUnits")}
                    </Text>
                    <TextInput
                      placeholder={t("FixedAssets.numberofUnits")}
                      value={
                        updatedDetails[tool.id]?.numberOfUnits?.toString() || ""
                      }
                       onChangeText={(text) => {                             
    const cleanedText = text.replace(/[-*#.]/g, '');                            
    handleInputChange(tool.id, "numberOfUnits", cleanedText);                           
  }} 
                      keyboardType="numeric"
                      className="border border-gray-300 bg-[#F4F4F4] rounded-full p-3 mb-4 pl-4"
                    />

                    <Text className="pb-2 font-bold">
                      {t("FixedAssets.unitPrice")}
                    </Text>
                    <TextInput
                      placeholder={t("FixedAssets.unitPrice")}
                      value={updatedDetails[tool.id]?.unitPrice || ""}
                        onChangeText={(text) => {                             
    const cleanedText = text.replace(/[-*#]/g, '');                            
    handleInputChange(tool.id, "unitPrice", cleanedText);                           
  }} 
                      keyboardType="numeric"
                      className="border border-gray-300 bg-[#F4F4F4] rounded-full p-3 mb-4 pl-4"
                    />
                    <Text className="pb-2 font-bold">
                      {t("FixedAssets.totalPrice")}
                    </Text>
                    <TextInput
                      placeholder={t("FixedAssets.totalPrice")}
                      value={updatedDetails[tool.id]?.totalPrice || ""}
                      onChangeText={(value) =>
                        handleInputChange(tool.id, "totalPrice", value)
                      }
                      keyboardType="numeric"
                      editable={false}
                      className="border border-gray-300 bg-[#F4F4F4] rounded-full p-3 mb-4 pl-4"
                    />
                    <Text className="pb-2 font-bold">
                      {t("FixedAssets.warranty")}
                    </Text>
                    <View className="flex-row justify-around mb-4">
                      <TouchableOpacity
                        onPress={() =>
                          handleInputChange(tool.id, "warranty", "yes")
                        }
                        className="flex-row items-center mt-2"
                      >
                        <View
                          className={`w-5 h-5 rounded-full ${
                            updatedDetails[tool.id]?.warranty === "yes"
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        />
                        <Text className="ml-2">{t("FixedAssets.yes")}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          handleInputChange(tool.id, "warranty", "no")
                        }
                        className="flex-row items-center"
                      >
                        <View
                          className={`w-5 h-5 rounded-full ${
                            updatedDetails[tool.id]?.warranty === "no"
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        />
                        <Text className="ml-2">{t("FixedAssets.no")}</Text>
                      </TouchableOpacity>
                    </View>

                    {updatedDetails[tool.id]?.warranty === "yes" && (
                      <>
                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.purchasedDate")}
                        </Text>
                        <TouchableOpacity
                          onPress={() => setShowPurchaseDatePicker(prev => !prev)}
                          className="border bg-[#F4F4F4] border-gray-300 rounded-full p-4 mb-4 pl-4 flex-row justify-between"
                        >
                          <Text>
                            {updatedDetails[tool.id]?.ownershipDetails
                              ?.purchaseDate
                              ? new Date(
                                  updatedDetails[
                                    tool.id
                                  ].ownershipDetails.purchaseDate
                                )
                                  .toISOString()
                                  .split("T")[0]
                              : t("FixedAssets.purchasedDate")}
                          </Text>
                           <Icon name="calendar-outline" size={20} color="#6B7280" />
                        </TouchableOpacity>

                  {showPurchaseDatePicker  &&
                  (Platform.OS === "ios" ? (
                    <View className=" justify-center items-center z-50  bg-gray-100  rounded-lg">
                      <DateTimePicker
                        value={
                          new Date(
                            updatedDetails[
                              tool.id
                            ]?.ownershipDetails?.purchaseDate
                          ) || new Date()
                        }
                        mode="date"
                        display="inline"
                        style={{ width: 320, height: 260 }}
                        onChange={(event, selectedDate) => {
                          setShowPurchaseDatePicker(false);

                          if (event.type === "set" && selectedDate) {
                            const formattedDate = selectedDate
                              .toISOString()
                              .split("T")[0];
                            console.log(formattedDate);
                            handleInputChange(
                              tool.id,
                              "ownershipDetails.purchaseDate",
                              formattedDate
                            );
                          }
                        }}
                        maximumDate={new Date()}
                      />
                    </View>
                  ) : (
                    <DateTimePicker
                    value={
                      new Date(
                        updatedDetails[
                          tool.id
                        ]?.ownershipDetails?.purchaseDate
                      ) || new Date()
                    }
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowPurchaseDatePicker(false);

                        if (event.type === "set" && selectedDate) {
                          const formattedDate = selectedDate
                            .toISOString()
                            .split("T")[0];
                          console.log(formattedDate);
                          handleInputChange(
                            tool.id,
                            "ownershipDetails.purchaseDate",
                            formattedDate
                          );
                        }
                      }}
                      maximumDate={new Date()}
                    />
                  ))}
                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.warrantyExpireDate")}
                        </Text>
                        <TouchableOpacity
                          onPress={() => setShowExpireDatePicker(prev => !prev)}
                          className="border bg-[#F4F4F4] border-gray-300 rounded-full p-4 mb-4 pl-4 flex-row justify-between"
                        >
                          <Text>
                            {updatedDetails[tool.id]?.ownershipDetails
                              ?.expireDate
                              ? new Date(
                                  updatedDetails[
                                    tool.id
                                  ].ownershipDetails.expireDate
                                )
                                  .toISOString()
                                  .split("T")[0]
                              : t("FixedAssets.warrantyExpireDate")}
                          </Text>
                           <Icon name="calendar-outline" size={20} color="#6B7280" />
                        </TouchableOpacity>

                 {showExpireDatePicker &&
                  (Platform.OS === "ios" ? (
                    <View className=" justify-center items-center z-50 bg-gray-100  rounded-lg">
                      <DateTimePicker
                        value={
                          new Date(
                            updatedDetails[
                              tool.id
                            ]?.ownershipDetails?.expireDate
                          ) || new Date()
                        }
                        mode="date"
                        display="inline"
                        style={{ width: 320, height: 260 }}
                        onChange={(event, selectedDate) => {
                          setShowExpireDatePicker(false);

                          if (event.type === "set" && selectedDate) {
                            const formattedDate = selectedDate
                              .toISOString()
                              .split("T")[0];
                            console.log(formattedDate);
                            handleInputChange(
                              tool.id,
                              "ownershipDetails.expireDate",
                              formattedDate
                            );
                          }
                        }}
                        maximumDate={
                          new Date(
                            new Date().setFullYear(
                              new Date().getFullYear() + 100
                            )
                          )
                        }
                      />
                    </View>
                  ) : (
                    <DateTimePicker
                    value={
                      new Date(
                        updatedDetails[
                          tool.id
                        ]?.ownershipDetails?.expireDate
                      ) || new Date()
                    }
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowExpireDatePicker(false);

                        if (event.type === "set" && selectedDate) {
                          const formattedDate = selectedDate
                            .toISOString()
                            .split("T")[0];
                          console.log(formattedDate);
                          handleInputChange(
                            tool.id,
                            "ownershipDetails.expireDate",
                            formattedDate
                          );
                        }
                      }}
                      maximumDate={
                        new Date(
                          new Date().setFullYear(
                            new Date().getFullYear() + 100
                          )
                        )
                      }
                    />
                  ))}

                        <Text className="pb-2 font-bold">
                          {t("FixedAssets.warrantyStatus")}
                        </Text>

                        <View className="border border-gray-300 rounded-full bg-gray-100 p-2 mt-2">
                          <Text
                            style={{
                              color:
                                new Date(
                                  updatedDetails[
                                    tool.id
                                  ]?.ownershipDetails?.expireDate
                                ) > new Date()
                                  ? "green"
                                  : "red",
                              fontWeight: "bold",
                              textAlign: "center",
                            }}
                          >
                            {new Date(
                              updatedDetails[
                                tool.id
                              ]?.ownershipDetails?.expireDate
                            ) > new Date()
                              ? t("FixedAssets.valid")
                              : t("FixedAssets.expired")}
                          </Text>
                        </View>
                      </>
                    )}
                  </>
                ) : null}
                <View className="flex-1 items-center pt-8">
                  <TouchableOpacity
                    onPress={handleUpdateTools}
                    className={`bg-gray-900 p-4 rounded-3xl mb-6 h-13 w-72 ${isLoading ? 'bg-gray-500' : 'bg-gray-900'}`}
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
          ))
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
export default UpdateAsset;
