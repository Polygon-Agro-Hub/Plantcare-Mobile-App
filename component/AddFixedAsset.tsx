import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import DropDownPicker from "react-native-dropdown-picker";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import NavigationBar from "@/Items/NavigationBar";
import { TouchableOpacity } from "react-native-gesture-handler";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import AntDesign from "react-native-vector-icons/AntDesign";
import { useTranslation } from "react-i18next";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

type AddAssetNavigationProp = StackNavigationProp<
  RootStackParamList,
  "AddAsset"
>;

interface AddAssetProps {
  navigation: AddAssetNavigationProp;
}

const AddAsset: React.FC<AddAssetProps> = ({ navigation }) => {
  const [ownership, setOwnership] = useState("");
  const [landownership, setLandOwnership] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [generalCondition, setGeneralCondition] = useState("");
  const [district, setDistrict] = useState("");
  const [asset, setAsset] = useState("");
  const [brand, setBrand] = useState("");
  // const [units, setUnits] = useState('');
  const [warranty, setWarranty] = useState("");
  const [purchasedDate, setPurchasedDate] = useState(new Date());
  const [expireDate, setExpireDate] = useState(new Date());
  const [showPurchasedDatePicker, setShowPurchasedDatePicker] = useState(false);
  const [showExpireDatePicker, setShowExpireDatePicker] = useState(false);
  const [extentha, setExtentha] = useState("");
  const [extentac, setExtentac] = useState("");
  const [extentp, setExtentp] = useState("");
  const [landcategory, setLandcategory] = useState("");
  const [estimateValue, setEstimatedValue] = useState("");
  // const [fence, setFence] = useState('');
  const [peranial, setPeranial] = useState("");
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [years, setYears] = useState("");
  const [months, setMonths] = useState("");
  const [showIssuedDatePicker, setShowIssuedDatePicker] = useState(false);
  const [issuedDate, setIssuedDate] = useState(new Date());
  const [showLbIssuedDatePicker, setShowLbIssuedDatePicker] = useState(false);
  const [lbissuedDate, setLbIssuedDate] = useState(new Date());
  const [annualpermit, setAnnualpermit] = useState("");
  const [annualpayment, setAnnualpayment] = useState("");
  const [othermachine, setOthermachene] = useState("");
  const [assetname, setAssetname] = useState("");
  const [hoetype, setHoetype] = useState("");
  const [anuallease, setAnnuallease] = useState("");
  const [othertool, setOthertool] = useState("");
  const [toolbrand, setToolbrand] = useState("");
  const [leaseduration, setLeaseduration] = useState("");
  const [leasedurationmonths, setLeasedurationmonths] = useState("");
  const [permitIssuedDate, setPermitIssuedDate] = useState(new Date());
  const [showPermitIssuedDatePicker, setShowPermitIssuedDatePicker] =
    useState(false);
  const [annualBuildingPermit, setAnnualBuildingPermit] = useState("");
  const [sharedlandAnnualPaymentBilling, setSharedlandAnnualPaymentBilling] =
    useState("");
  const [floorArea, setFloorArea] = useState("");
  const [landFenced, setLandFenced] = useState("");
  const [perennialCrop, setPerennialCrop] = useState("");

  const [assetType, setAssetType] = useState("");
  const [brandType, setBrandType] = useState("");
  const [mentionOther, setMentionOther] = useState("");
  const [numberOfUnits, setNumberOfUnits] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [durationYears, setDurationYears] = useState("");
  const [durationMonths, setDurationMonths] = useState("");
  const [leastAmountAnnually, setLeastAmountAnnually] = useState("");
  const [permitFeeAnnually, setPermitFeeAnnually] = useState("");
  const [paymentAnnually, setPaymentAnnually] = useState("");
  const [dateError, setDateError] = useState("");
  const { t } = useTranslation();

  const ownershipCategories = [
    {
      key: "1",
      value: "---Select Ownership Chategory----",
      translationKey: t("FixedAssets.selectOwnershipCategory"),
    },
    {
      key: "2",
      value: "Own Building (with title ownership)",
      translationKey: t("FixedAssets.ownBuilding"),
    },
    {
      key: "3",
      value: "Leased Building",
      translationKey: t("FixedAssets.leasedBuilding"),
    },
    {
      key: "4",
      value: "Permit Building",
      translationKey: t("FixedAssets.permitBuilding"),
    },
    {
      key: "5",
      value: "Shared / No Ownership",
      translationKey: t("FixedAssets.sharedOwnership"),
    },
  ];

  const assetTypesForAssets: any = {
    Tractors: [
      { key: "4", value: "2WD", translationKey: t("FixedAssets.2WD") },
      { key: "5", value: "4WD", translationKey: t("FixedAssets.4WD") },
    ],
  
    Transplanter: [
      { key: "14", value: "Paddy transplanter", translationKey: t("FixedAssets.Paddytransplanter") },
    ],
  
    "Harvesting equipment": [
      { key: "15", value: "Sugarcane harvester", translationKey: t("FixedAssets.Sugarcaneharvester") },
      { key: "16", value: "Static shedder", translationKey: t("FixedAssets.Staticshedder") },
      { key: "17", value: "Mini combine harvester", translationKey: t("FixedAssets.Minicombineharvester") },
      { key: "18", value: "Rice Combine harvester", translationKey: t("FixedAssets.RiceCombineharvester") },
      { key: "19", value: "Paddy harvester", translationKey: t("FixedAssets.Paddyharvester") },
      { key: "20", value: "Maize harvester", translationKey: t("FixedAssets.Maizeharvester") },
    ],
  
    "Cleaning, Grading and Weighing Equipment": [
      { key: "21", value: "Seperator", translationKey: t("FixedAssets.Seperator") },
      { key: "22", value: "Centrifugal Stier Machine", translationKey: t("FixedAssets.CentrifugalStierMachine") },
      { key: "23", value: "Grain Classifier Seperator", translationKey: t("FixedAssets.GrainClassifierSeperator") },
      { key: "24", value: "Destoner Machine", translationKey: t("FixedAssets.DestonerMachine") },
    ],
  
    Sprayers: [
      { key: "25", value: "Knapsack Sprayer", translationKey: t("FixedAssets.KnapsackSprayer") },
      { key: "26", value: "Chemical Sprayer", translationKey: t("FixedAssets.ChemicalSprayer") },
      { key: "27", value: "Mist Blower", translationKey: t("FixedAssets.MistBlower") },
      { key: "28", value: "Environmental friendly sprayer", translationKey: t("FixedAssets.Environmentalfriendlysprayer") },
      { key: "29", value: "Drone sprayer", translationKey: t("FixedAssets.Dronesprayer") },
      { key: "30", value: "Pressure Sprayer", translationKey: t("FixedAssets.PressureSprayer") },
    ],
  };
  
  
  const brandTypesForAssets: any = {
    Tractors: [
      { key: "1", value: "E Kubota EK3 - 471 Hayles" , translationKey: t("FixedAssets.EKubota") },
      { key: "2", value: "Kubota L4508 4wd Tractor Hayles", translationKey: t("FixedAssets.KubotaL4508") },
      { key: "3", value: "Kubota L3408 4wd Tractor - Hayles", translationKey: t("FixedAssets.KubotaL3408") },
      { key: "4", value: "Tafe - Browns", translationKey: t("FixedAssets.Tafe") },
      { key: "5", value: "Massey Ferguson - Browns", translationKey: t("FixedAssets.MasseyFerguson")},
      { key: "6", value: "Yanmar - Browns", translationKey: t("FixedAssets.Yanmar") },
      { key: "7", value: "Sumo - Browns", translationKey: t("FixedAssets.Sumo") },
      { key: "8", value: "Sifang - Browns", translationKey: t("FixedAssets.Sifang") },
      { key: "9", value: "Uikyno - Browns" , translationKey: t("FixedAssets.Uikyno")},
      { key: "10", value: "Shakthiman - Browns", translationKey: t("FixedAssets.ShakthimanBrowns") },
      { key: "11", value: "Fieldking - Browns", translationKey: t("FixedAssets.Fieldking") },
      { key: "12", value: "National - Browns" , translationKey: t("FixedAssets.National")},
      { key: "13", value: "Gaspardo - Browns" , translationKey: t("FixedAssets.Gaspardo")},
      { key: "14", value: "Agro Vision - Browns", translationKey: t("FixedAssets.AgroVision") },
      { key: "15", value: "50 HP - ME", translationKey: t("FixedAssets.HP50ME") },
      { key: "16", value: "ME", translationKey: t("FixedAssets.ME") },
      { key: "17", value: "Mahindra - DIMO", translationKey: t("FixedAssets.MahindraDIMO") },
      { key: "18", value: "Swaraj - DIMO", translationKey: t("FixedAssets.SwarajDIMO") },
      { key: "19", value: "Claas - DIMO", translationKey: t("FixedAssets.ClaasDIMO") },
      { key: "20", value: "LOVOL - DIMO" , translationKey: t("FixedAssets.LOVOLDIMO")},
      { key: "21", value: "Kartar", translationKey: t("FixedAssets.Kartar") },
      { key: "22", value: "Shakthiman", translationKey: t("FixedAssets.Shakthiman") },
      { key: "23", value: "Ginhua", translationKey: t("FixedAssets.Ginhua") },
    ],

    Rotavator: [{ key: "24", value: "Shaktiman Fighter Rotavator", translationKey: t("FixedAssets.ShaktimanRotavator")  }],
    "Combine harvesters": [
      { key: "25", value: "Agrotech Kool Combine Harvester - Hayleys", translationKey: t("FixedAssets.AgrotechKool")  },
      { key: "26", value: "Agrotech Eco Combine Harvester - Hayleys", translationKey: t("FixedAssets.AgrotechEco")  },
      { key: "27", value: "Kubota DC-70G Plus Combine Harvester - Hayleys", translationKey: t("FixedAssets.KubotaDC70G")  },
    ],
    Transplanters: [
      { key: "28", value: "Kubota NSP - 4W Rice Transplanter - Hayleys", translationKey: t("FixedAssets.KubotaNSP4W") },
      { key: "29", value: "Transplanters - Dimo", translationKey: t("FixedAssets.TransplantersDimo") },
      { key: "30", value: "ARBOS", translationKey: t("FixedAssets.ARBOS") },
      { key: "31", value: "National", translationKey: t("FixedAssets.NationalTransplanter") },
    ],
    "Tillage Equipment": [
      { key: "32", value: "13 Tyne Cultivator Spring Loaded -  ME", translationKey: t("FixedAssets.TyneCultivator") },
      { key: "33", value: "Terracer Blade/Leveller  ME", translationKey: t("FixedAssets.TerracerBlade") },
      { key: "34", value: "Rotary Tiller - ME", translationKey: t("FixedAssets.RotaryTiller") },
      { key: "35", value: "Power harrow -  ME", translationKey: t("FixedAssets.PowerHarrow") },
      { key: "36", value: "Mounted Disc Ridger -  ME", translationKey: t("FixedAssets.DiscRidger") },
      { key: "37", value: "Disc Harrow Tractor Mounted -  ME", translationKey: t("FixedAssets.DiscHarrow") },
      { key: "38", value: "Disk Plough-  ME", translationKey: t("FixedAssets.DiskPlough") },
      { key: "39", value: "Mini Tiller", translationKey: t("FixedAssets.MiniTiller") },
      { key: "40", value: "Hand plough", translationKey: t("FixedAssets.HandPlough") },
      { key: "41", value: "Tine tiller", translationKey: t("FixedAssets.TineTiller") },
      { key: "42", value: "Browns", translationKey: t("FixedAssets.Browns") },
      { key: "43", value: "Hayles", translationKey: t("FixedAssets.Hayles") },
      { key: "44", value: "Dimo", translationKey: t("FixedAssets.Dimo") },
    ],
    "Sowing equipment": [
      { key: "45", value: "Seed Sowing Machine - ME", translationKey: t("FixedAssets.Dimo") },
      { key: "46", value: "Automatic Seed Sowing Machine - ME", translationKey: t("FixedAssets.Dimo") },
    ],
    "Harvesting equipment": [
      { key: "47", value: "Combine harvester - ME", translationKey: t("FixedAssets.SeedSowingMachine") },
      { key: "48", value: "4LZ 3.0 Batta Harvester", translationKey: t("FixedAssets.AutomaticSeedSowingMachine") },
      { key: "49", value: "4LZ 6.0P Combine Harvester", translationKey: t("FixedAssets.CombineHarvesterME") },
      { key: "50", value: "4LZ 4.0E Combine Harvester", translationKey: t("FixedAssets.BattaHarvester") },
      { key: "51", value: "Browns", translationKey: t("FixedAssets.Browns") },
      { key: "52", value: "Hayles" , translationKey: t("FixedAssets.Hayles")},
      { key: "53", value: "Yanmar - Browns", translationKey: t("FixedAssets.YanmarBrowns") },
      { key: "54", value: "360 TAF", translationKey: t("FixedAssets.TAF360") },
      { key: "55", value: "AGRIUNNION", translationKey: t("FixedAssets.AGRIUNNION") },
      { key: "56", value: "KARTAR", translationKey: t("FixedAssets.Kartar") },
    ],

    "Threshers, Reaper, Binders": [
      { key: "57", value: "Mini Combine Cutter Thresher - ME" , translationKey: t("FixedAssets.MiniCombineCutter")},
      { key: "58", value: "Multi Crop Cutter Thresher - ME", translationKey: t("FixedAssets.MultiCropCutter") },
    ],
    "Cleaning, Grading and Weighing Equipment": [
      { key: "59", value: "Grill Type Magnetic Separator - ME", translationKey: t("FixedAssets.GrillMagneticSeparator") },
      { key: "60", value: "Vibrio Separator Machine - ME", translationKey: t("FixedAssets.VibrioSeparator") },
      { key: "61", value: "Centrifugal Stifer Machine - ME" , translationKey: t("FixedAssets.CentrifugalStifer")},
      { key: "62", value: "Intensive Scourer - ME", translationKey: t("FixedAssets.IntensiveScourer") },
      { key: "63", value: "Grain Classifier Separator - ME" , translationKey: t("FixedAssets.GrainClassifier")},
      { key: "64", value: "Grain Cleaning Machine - ME", translationKey: t("FixedAssets.GrainCleaningMachine") },
      { key: "65", value: "Destoner Machine - ME", translationKey: t("FixedAssets.DestonerMachineME") },
      { key: "66", value: "Browns" , translationKey: t("FixedAssets.Browns")},
      { key: "67", value: "Hayles", translationKey: t("FixedAssets.Hayles") },
    ],
    Weeding: [
      { key: "68", value: "FarmWeeding Ditching - ME", translationKey: t("FixedAssets.FarmWeedingDitching") },
      { key: "69", value: "Slasher", translationKey: t("FixedAssets.Slasher") },
      { key: "70", value: "Browns", translationKey: t("FixedAssets.Browns") },
      { key: "71", value: "Hayles", translationKey: t("FixedAssets.Hayles") },
      { key: "72", value: "Dimo" , translationKey: t("FixedAssets.Dimo")},
    ],
    Sprayers: [
      { key: "73", value: "Knapsack Power Sprayer - ME",translationKey: t("FixedAssets.KnapsackPowerSprayer") },
      { key: "74", value: "Oregon Sprayer",translationKey: t("FixedAssets.OregonSprayer") },
      { key: "75", value: "Chemical Sprayer",translationKey: t("FixedAssets.ChemicalSprayers") },
      { key: "76", value: "Mist Blower",translationKey: t("FixedAssets.MistBlowers") },
      { key: "77", value: "DBL",translationKey: t("FixedAssets.DBL") },
      { key: "78", value: "Browns",translationKey: t("FixedAssets.Browns") },
      { key: "79", value: "Hayles",translationKey: t("FixedAssets.Hayles") },
      { key: "80", value: "National",translationKey: t("FixedAssets.NationalTransplanter") },
      { key: "81", value: "ARBOS",translationKey: t("FixedAssets.ARBOS") },
      { key: "82", value: "Gardena",translationKey: t("FixedAssets.Gardena") },
      { key: "92", value: "Tractor Mounted Sprayer - ME",translationKey: t("FixedAssets.TractorMountedSprayer") },
    ],
    "Shelling and Grinding Machine": [
      { key: "93", value: "Maize Processing Machine - ME" ,translationKey: t("FixedAssets.MaizeProcessingMachine")},
      { key: "94", value: "Maize Coen Thresher - ME" ,translationKey: t("FixedAssets.MaizeCoenThresher")},
    ],
    Sowing: [
      { key: "95", value: "Steel and Plastic Seed Sowing Machine" ,translationKey: t("FixedAssets.SteelSeedSowing")},
      { key: "96", value: "Tractor Mounted Sprayer",translationKey: t("FixedAssets.TractorMountedSpray") },
    ],
  };

  const Machineasset = [
    { key: "0", value: "", translationKey: t("FixedAssets.selectAsset") },
    { key: "1", value: "Tractors", translationKey: t("FixedAssets.Tractors") },
    { key: "2", value: "Rotavator", translationKey: t("FixedAssets.Rotavator") },
    { key: "3", value: "Combine Harvesters", translationKey: t("FixedAssets.CombineHarvesters") },
    { key: "4", value: "Transplanter", translationKey: t("FixedAssets.Transplanter") },
    { key: "5", value: "Tillage Equipment", translationKey: t("FixedAssets.TillageEquipment") },
    { key: "6", value: "Sowing Equipment", translationKey: t("FixedAssets.SowingEquipment") },
    { key: "7", value: "Harvesting Equipment", translationKey: t("FixedAssets.HarvestingEquipment") },
    { key: "8", value: "Threshers, Reaper, Binders", translationKey: t("FixedAssets.ThreshersReaperBinders") },
    { key: "9", value: "Cleaning, Grading and Weighing Equipment", translationKey: t("FixedAssets.CleaningGradingEquipment") },
    { key: "10", value: "Weeding", translationKey: t("FixedAssets.Weeding") },
    { key: "11", value: "Sprayers", translationKey: t("FixedAssets.Sprayers") },
    { key: "12", value: "Shelling and Grinding Machine", translationKey: t("FixedAssets.ShellingGrindingMachine") },
    { key: "13", value: "Sowing", translationKey: t("FixedAssets.Sowing") }
  ];
  
  const brandasset = [{ key: "1", value: "Good" }];

  const generalConditionOptions = [
    {
      key: "0",
      value: "",
      translationKey: t("FixedAssets.selectGeneralCondition"),
    },
    { key: "1", value: "Good", translationKey: t("FixedAssets.good") },
    { key: "2", value: "Average", translationKey: t("FixedAssets.average") },
    { key: "3", value: "Poor", translationKey: t("FixedAssets.poor") },
  ];

  const districtOptions = [
    { key: 0, value: "", translationKey: t("FixedAssets.selectDistrict") },
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
    { key: 23, value: "Ratnapura", translationKey: t("FixedAssets.Ratnapura") },
    {
      key: 24,
      value: "Trincomalee",
      translationKey: t("FixedAssets.Trincomalee"),
    },
    { key: 25, value: "Vavuniya", translationKey: t("FixedAssets.Vavuniya") },
  ];

  const warrantystatus = [
    { key: "1", value: "yes" , translationKey: t("FixedAssets.yes") },
    { key: "2", value: "no" , translationKey: t("FixedAssets.no") },
  ];

  const onPurchasedDateChange = (
    event: any,
    selectedDate: Date | undefined
  ) => {
    setShowPurchasedDatePicker(false);
    if (selectedDate) setPurchasedDate(selectedDate);
  };
  const onStartDateChange = (selectedDate: any) => {
    const today = new Date();

    if (selectedDate > today) {
      Alert.alert( t("FixedAssets.sorry"),  t("FixedAssets.issuedDateCannotBeFuture"), [
        { text: t("Main.ok") },
      ]);
      return;
    }

    setStartDate(selectedDate);
  };

  const [errorMessage, setErrorMessage] = useState("");
  const onExpireDateChange = (event: any, selectedDate: any) => {
    const currentDate = selectedDate || expireDate;
    setShowExpireDatePicker(false);

    if (currentDate < purchasedDate) {
      setErrorMessage(t("FixedAssets.errorInvalidExpireDate"));
    } else {
      setExpireDate(currentDate);
      setErrorMessage("");
    }
  };

  const onIssuedDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowIssuedDatePicker(false);
    if (selectedDate) setIssuedDate(selectedDate);
  };

  const onLbIssuedDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowLbIssuedDatePicker(false);
    if (selectedDate) setLbIssuedDate(selectedDate);
  };

  const onPermitIssuedDateChange = (selectedDate: any) => {
    const today = new Date();

    if (selectedDate > today) {
      Alert.alert(t("FixedAssets.sorry"), t("FixedAssets.issuedDateCannotBeFuture"), [
        { text: t("Main.ok") },
      ]);
      return;
    }

    setLbIssuedDate(selectedDate);
  };

  const totalPrice = Number(numberOfUnits) * Number(unitPrice) || 0;

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const submitData = async () => {
    if (!category) {
      Alert.alert(t("FixedAssets.sorry"), t("FixedAssets.selectCategory"));
      return;
    }

    const showError = (field: string, message: string): never => {
      Alert.alert(t("FixedAssets.sorry"), message);
      throw new Error(`${field} ${t("FixedAssets.isRequired")}`);
    };

    try {
      // **Building and Infrastructures** category validation
      if (category === "Building and Infrastructures") {
        if (!ownership)
          showError(t("FixedAssets.sorry"), t("FixedAssets.selectOwnershipCategory"));
        if (!type) showError(t("FixedAssets.sorry"), t("FixedAssets.selectAssetType"));
        if (!floorArea) showError(t("FixedAssets.sorry"), t("FixedAssets.enterFloorArea"));
        if (!generalCondition)
          showError(
            t("FixedAssets.sorry"),
            t("FixedAssets.selectGeneralCondition")
          );
        if (!district) showError(t("FixedAssets.sorry"), t("FixedAssets.selectDistrict"));

        if (
          ownership === "Own Building (with title ownership)" &&
          !estimateValue
        ) {
          showError(
            t("FixedAssets.sorry"),
            t("FixedAssets.enterEstimatedBuildingValueLKR")
          );
        } else if (
          ownership === "Leased Building" &&
          (!startDate || !durationYears)
        ) {
          showError(t("FixedAssets.sorry"), t("FixedAssets.enterDuration"));
        } else if (ownership === "Leased Building" && !leastAmountAnnually) {
          showError(
            t("FixedAssets.sorry"),
            t("FixedAssets.enterLeasedAmountAnnuallyLKR")
          );
        } else if (
          ownership === "Permit Building" &&
          (!issuedDate || !permitFeeAnnually)
        ) {
          showError(t("FixedAssets.sorry"), t("FixedAssets.enterPermitAnnuallyLKR"));
        } else if (ownership === "Shared / No Ownership" && !paymentAnnually) {
          showError(
            t("FixedAssets.sorry"),
            t("FixedAssets.enterPaymentAnnuallyLKR")
          );
        }
      }

      // **Land** category validation
      if (category === "Land") {
        if (!district) showError(t("FixedAssets.sorry"), t("FixedAssets.selectDistrict"));
        if (!extentha && !extentac && !extentp) {
          showError(t("FixedAssets.sorry"), t("FixedAssets.enterFloorArea"));
        }
        if (!landFenced) showError(t("FixedAssets.sorry"), t("FixedAssets.isLandFenced"));
        if (!perennialCrop)
          showError(
            t("FixedAssets.sorry"),
            t("FixedAssets.areThereAnyPerennialCrops")
          );

        if (landownership === "Own" && !estimateValue) {
          showError(
            t("FixedAssets.sorry"),
            t("FixedAssets.enterEstimatedBuildingValueLKR")
          );
        } else if (landownership === "Lease" && !leastAmountAnnually) {
          showError(
            t("FixedAssets.sorry"),
            t("FixedAssets.enterLeasedAmountAnnuallyLKR")
          );
        } else if (
          landownership === "Lease" &&
          (!startDate || !durationYears)
        ) {
          showError(t("FixedAssets.sorry"), t("FixedAssets.enterDuration"));
        } else if (landownership === "Permited" && !issuedDate) {
          showError(t("FixedAssets.sorry"), t("FixedAssets.selectIssuedDate"));
        } else if (landownership === "Permited" && !permitFeeAnnually) {
          showError(
            t("FixedAssets.sorry"),
            t("FixedAssets.enterPermitFeeAnnuallyLKR")
          );
        } else if (landownership === "Shared" && !paymentAnnually) {
          showError(
            t("FixedAssets.sorry"),
            t("FixedAssets.enterPaymentAnnuallyLKR")
          );
        }
      }

      if (category === "Machine and Vehicles") {
        if (!asset) showError(t("FixedAssets.sorry"), t("FixedAssets.selectAsset"));

        const brandOnlyAssets = [
          "Rotavator",
          "Tillage Equipment",
          "Threshers, Reaper, Binders",
          "Weeding",
          "Shelling and Grinding Machine",
          "Sowing",
        ];
        const typeAndBrandAssets = [
          "Tractors",
          "Transplanter",
          "Cleaning, Grading and Weighing Equipment",
          "Sprayers",
        ];

        if (brandOnlyAssets.includes(asset) && !brand) {
          showError(t("FixedAssets.sorry"), t("FixedAssets.selectBrand"));
        } else if (
          typeAndBrandAssets.includes(asset) &&
          (!assetType || !brand)
        ) {
          showError(
            t("FixedAssets.sorry"),
            !assetType
              ? t("FixedAssets.selectAssetType")
              : t("FixedAssets.selectBrand")
          );
        }

        if (assetType === "Other" && !mentionOther) {
          showError(t("FixedAssets.sorry"), t("FixedAssets.mentionOther"));
        }

        const requiredFields: { [key: string]: string } = {
          numberOfUnits: t("FixedAssets.enterNumberofUnits"),
          unitPrice: t("FixedAssets.enterUnitPrice"),
          warranty: t("FixedAssets.selectWarranty"),
        };
        if (!numberOfUnits || !unitPrice || !warranty) {
          showError(
            t("FixedAssets.sorry"),
            requiredFields[
              !numberOfUnits
                ? "numberOfUnits"
                : !unitPrice
                ? "unitPrice"
                : "warranty"
            ]
          );
        }

        if (warranty === "yes" && (!purchaseDate || !expireDate)) {
          showError(t("FixedAssets.sorry"), t("FixedAssets.warrantyDatesRequired"));
        }
      }

      if (category === "Tools") {
        if (!assetname) showError(t("FixedAssets.sorry"), t("FixedAssets.selectAsset"));
        if (assetname === "Other" && !othertool)
          showError(t("FixedAssets.sorry"), t("FixedAssets.mentionOther"));
        if (!toolbrand) showError(t("FixedAssets.sorry"), t("FixedAssets.selectBrand"));
        if (!numberOfUnits)
          showError(t("FixedAssets.sorry"), t("FixedAssets.enterNumberofUnits"));
        if (!unitPrice) showError(t("FixedAssets.sorry"), t("FixedAssets.enterUnitPrice"));
        if (!warranty) showError(t("FixedAssets.sorry"), t("FixedAssets.selectWarranty"));
        if (warranty === "yes" && (!purchaseDate || !expireDate)) {
          showError(t("FixedAssets.sorry"), t("FixedAssets.warrantyDatesRequired"));
        }
      }
    } catch (error: any) {
      console.error(error.message);
      return;
    }

    const formData = {
      category,
      ownership,
      type,
      floorArea,
      generalCondition,
      district,
      extentha,
      extentac,
      extentp,
      landFenced,
      perennialCrop,
      asset,
      assetType,
      mentionOther,
      brand,
      numberOfUnits,
      unitPrice,
      totalPrice,
      warranty,
      issuedDate,
      purchaseDate,
      expireDate,
      warrantystatus,
      startDate,
      durationYears,
      durationMonths,
      leastAmountAnnually,
      permitFeeAnnually,
      paymentAnnually,
      estimateValue,
      assetname,
      toolbrand,
      landownership,
    };

    console.log("Form Data:", formData);

    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.post(
        `${environment.API_BASE_URL}api/auth/fixedassets`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log("Data submitted successfully:", response.data);
      Alert.alert(t("FixedAssets.success"), t("FixedAssets.assetAddSuccessfuly"), [
        { text: t("Main.ok"), onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      // console.error("Error submitting data:", error);
      if (error.response) {
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
        // Alert.alert("Error", `Server error: ${error.response.data.message}`);
      } else if (error.request) {
        // Alert.alert(
        //   "Error",
        //   "No response from server. Please try again later."
        // );
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
      } else {
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
        // Alert.alert("Error", "Failed to add asset. Please try again.");
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        className="flex-1  pb-20  bg-white"
        style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
      >
        <View className="flex-row justify-between mb-2">
          <TouchableOpacity onPress={() => navigation.goBack()} className="">
            <AntDesign name="left" size={24} color="#000502" />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-lg font-bold">
              {t("FixedAssets.myAssets")}
            </Text>
          </View>
        </View>

        <View className="p-4">
          <Text className="mt-4 text-sm  pb-2 ">
            {t("CurrentAssets.category")}
          </Text>
          <View className="border border-gray-300 rounded-full bg-gray-100">
            <Picker
              selectedValue={category}
              onValueChange={(itemValue: any) => {
                setCategory(itemValue);
                setAsset("");
                setAssetname("");
                setBrand("");
                setUnitPrice("");
                setNumberOfUnits("");
                setWarranty("");
                setOthertool("");
                setDistrict("");
                setExtentac("");
                setExtentp("");
                setExtentha("");
                setFloorArea("");
                setAnnualpayment("");
                setAnnualpermit("");
                setLandFenced("");
                setPerennialCrop("");
              }}
            >
              <Picker.Item label={t("FixedAssets.selectCategory")} value="" />
              <Picker.Item
                label={t("FixedAssets.buildingandInfrastructures")}
                value="Building and Infrastructures"
              />
              <Picker.Item
                label={t("FixedAssets.machineandVehicles")}
                value="Machine and Vehicles"
              />
              <Picker.Item label={t("FixedAssets.land")} value="Land" />
              <Picker.Item
                label={t("FixedAssets.toolsandEquipments")}
                value="Tools"
              />
            </Picker>
          </View>
          {category === "Machine and Vehicles" ? (
            <View className="flex-1">
              <Text className="mt-4 text-sm  pb-2">
                {t("FixedAssets.asset")}
              </Text>
              <View className="border border-gray-300 rounded-full bg-gray-100">
                <Picker
                  selectedValue={asset}
                  onValueChange={(itemValue: any) => {
                    setAsset(itemValue);
                    setAssetType("");
                    setBrand("");
                  }}
                >
                  {Machineasset.map((item) => (
                    <Picker.Item
                      label={item.translationKey}
                      value={item.value}
                      key={item.key}
                    />
                  ))}
                </Picker>
              </View>

              {asset &&
                assetTypesForAssets[asset] &&
                assetTypesForAssets[asset].length > 0 && (
                  <>
                    <Text className="mt-4 text-sm pb-2 ">
                      {t("FixedAssets.selectAssetType")}
                    </Text>
                    <View className="border border-gray-300 rounded-full bg-gray-100">
                      <Picker
                        selectedValue={assetType}
                        onValueChange={(itemValue: any) =>
                          setAssetType(itemValue)
                        }
                      >
                        {assetTypesForAssets[asset].map((item: any) => (
                          <Picker.Item
                            label={item.translationKey}
                            value={item.value}
                            key={item.key}
                          />
                        ))}
                      </Picker>
                    </View>
                  </>
                )}

              {assetType === "Other" && (
                <View>
                  <Text>{t("FixedAssets.Mention")}</Text>
                  <TextInput
                    className="border border-gray-300 p-2 rounded-full bg-gray-100"
                    placeholder={t("FixedAssets.Mention")}
                    value={othermachine}
                    onChangeText={setOthermachene}
                  />
                </View>
              )}

              {asset &&
                brandTypesForAssets[asset] &&
                brandTypesForAssets[asset].length > 0 && (
                  <>
                    <Text className="mt-4 text-sm pb-2">
                      {t("FixedAssets.selectBrand")}
                    </Text>
                    <View className="border border-gray-300 rounded-full bg-gray-100">
                      <Picker
                        selectedValue={brand}
                        onValueChange={(itemValue: any) => setBrand(itemValue)}
                      >
                        {brandTypesForAssets[asset].map((item: any) => (
                          <Picker.Item
                            label={item.translationKey}
                            value={item.value}
                            key={item.key}
                          />
                        ))}
                      </Picker>
                    </View>
                  </>
                )}

              <Text className="mt-4 text-sm  pb-2">
                {t("FixedAssets.numberofUnits")}
              </Text>
              <TextInput
                className="border border-gray-300 p-3 pl-4 rounded-full bg-gray-100"
                placeholder={t("FixedAssets.enterNumberofUnits")}
                value={numberOfUnits}
                onChangeText={setNumberOfUnits}
                keyboardType="numeric"
              />

              <Text className="mt-4 text-sm  pb-2">
                {t("FixedAssets.unitPrice")}
              </Text>
              <TextInput
                className="border border-gray-300 p-3 pl-4 rounded-full bg-gray-100"
                placeholder={t("FixedAssets.enterUnitPrice")}
                value={unitPrice}
                onChangeText={setUnitPrice}
                keyboardType="numeric"
              />

              <Text className="mt-4 text-sm  pb-2">
                {t("FixedAssets.totalPrice")}
              </Text>
              <View className="border border-gray-300 p-4 pl-4 rounded-full bg-gray-100">
                <Text className="">{totalPrice.toFixed(2)}</Text>
              </View>

              <Text className="pt-5  pb-3 font-bold">
                {t("FixedAssets.warranty")}
              </Text>
              <View className="flex-row justify-around mb-5">
                <TouchableOpacity
                  onPress={() => setWarranty("yes")}
                  className="flex-row items-center"
                >
                  <View
                    className={`w-5 h-5 rounded-full ${
                      warranty === "yes" ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                  <Text className="ml-2">{t("FixedAssets.yes")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setWarranty("no")}
                  className="flex-row items-center"
                >
                  <View
                    className={`w-5 h-5 rounded-full ${
                      warranty === "no" ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                  <Text className="ml-2">{t("FixedAssets.no")}</Text>
                </TouchableOpacity>
              </View>

              {warranty === "yes" && (
                <>
                  <Text className="pt-5 pl-3 pb-3 font-bold">
                    {t("FixedAssets.purchasedDate")}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowPurchasedDatePicker(true)}
                  >
                    <View className="border border-gray-300 p-2 rounded-full bg-gray-100 pt-7">
                      <Text>{purchasedDate.toLocaleDateString()}</Text>
                    </View>
                  </TouchableOpacity>
                  {showPurchasedDatePicker && (
                    <DateTimePicker
                      value={purchasedDate}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        if (event.type === "set" && selectedDate) {
                          if (selectedDate > new Date()) {
                            Alert.alert(
                              t("FixedAssets.sorry"),
                              t("FixedAssets.purchaseDateCannotBeFuture"),
                              [{ text: t("Main.ok") }]
                            );
                          } else {
                            setPurchasedDate(selectedDate); // Set the valid purchased date
                          }
                        }
                        setShowPurchasedDatePicker(false); // Close the DateTimePicker
                      }}
                      maximumDate={new Date()} // Prevent future dates directly in the picker
                    />
                  )}

                  <Text className="pt-5 pl-3 pb-3 font-bold">
                    {t("FixedAssets.warrantyExpireDate")}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowExpireDatePicker(true)}
                  >
                    <View className="border border-gray-300 p-2 rounded-full bg-gray-100 pt-4">
                      <Text className="pb-3">
                        {expireDate.toLocaleDateString()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  {showExpireDatePicker && (
                    <DateTimePicker
                      value={expireDate}
                      mode="date"
                      display="default"
                      onChange={onExpireDateChange}
                      className="pb-[20%]"
                    />
                  )}

                  <Text className="pt-5 pl-3 pb-3 font-bold">
                    {t("FixedAssets.additionalOption")}
                  </Text>

                  <Text className="mt-4 text-sm pl-2">
                    {t("FixedAssets.warrantyStatus")}
                  </Text>

                  {/* Conditional Warranty Status Display */}
                  <View className="border border-gray-300 rounded-full bg-gray-100 p-2 mt-2">
                    <Text
                      style={{
                        color: expireDate > new Date() ? "green" : "red",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      {expireDate > new Date() ? t("FixedAssets.valid") : t("FixedAssets.expired")}
                    </Text>
                  </View>
                </>
              )}
            </View>
          ) : category === "Land" ? (
            <View>
              {/* Asset Details for Land */}
              <Text className="mt-4 text-sm  pb-2">
                {t("FixedAssets.extent")}
              </Text>
              <View className="items-center flex-row gap-1  ">
                <View className="items-center flex-row ">
                  <Text className=" pr-1">{t("FixedAssets.ha")}</Text>

                  <TextInput
                    className="border border-gray-300 p-2 w-20 rounded-2xl bg-gray-100"
                    value={extentha}
                    onChangeText={setExtentha}
                    keyboardType="numeric"
                  />
                </View>
                <View className="items-center flex-row ">
                  <Text className="pl-2 pr-1">{t("FixedAssets.ac")}</Text>

                  <TextInput
                    className="border border-gray-300 p-2 w-20 rounded-2xl bg-gray-100"
                    value={extentac}
                    onChangeText={setExtentac}
                    keyboardType="numeric"
                  />
                </View>
                <View className="items-center flex-row ">
                  <Text className="pl-2 pr-1">{t("FixedAssets.p")}</Text>

                  <TextInput
                    className="border border-gray-300 p-2 w-20 rounded-2xl bg-gray-100"
                    value={extentp}
                    onChangeText={setExtentp}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View>
                <Text className="mt-4 text-sm  pb-2">
                  {t("FixedAssets.selectLandCategory")}
                </Text>
                <View className="border border-gray-300 rounded-full bg-gray-100">
                  <Picker
                    selectedValue={landownership}
                    onValueChange={(itemValue: any) =>
                      setLandOwnership(itemValue)
                    }
                  >
                    <Picker.Item label={t("FixedAssets.OwnLand")} value="Own" />
                    <Picker.Item
                      label={t("FixedAssets.LeaseLand")}
                      value="Lease"
                    />
                    <Picker.Item
                      label={t("FixedAssets.PermittedLand")}
                      value="Permited"
                    />
                    <Picker.Item
                      label={t("FixedAssets.SharedOwnership")}
                      value="Shared"
                    />
                  </Picker>
                </View>
              </View>

              {/* Conditional input for estimated value */}
              {landownership === "Own" && (
                <View>
                  <Text className="mt-4 text-sm  pb-2">
                    {t("FixedAssets.estimateValue")}
                  </Text>
                  <TextInput
                    className="border border-gray-300 p-2 rounded-full bg-gray-100  pl-4"
                    placeholder={t("FixedAssets.enterEstimateValue")}
                    value={estimateValue}
                    onChangeText={setEstimatedValue}
                    keyboardType="numeric"
                  />
                </View>
              )}

              {landownership === "Lease" && (
                <View>
                  <Text className="pt-5  pb-2 ">
                    {t("FixedAssets.startDate")}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowStartDatePicker(true)}
                  >
                    <View className="border border-gray-300  rounded-full bg-gray-100 p-4 pl-4">
                      <Text className="">{startDate.toLocaleDateString()}</Text>
                    </View>
                  </TouchableOpacity>

                  {showStartDatePicker && (
                    <DateTimePicker
                      value={startDate || new Date()} // Default to current date if not set
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        if (event.type === "set") {
                          onStartDateChange(selectedDate); // Call date change handler
                          setShowStartDatePicker(false); // Close the picker
                        } else {
                          setShowStartDatePicker(false); // Close on cancel
                        }
                      }}
                      maximumDate={new Date()} // Prevent future dates
                    />
                  )}

                  <Text className="mt-4 text-sm">
                    {t("FixedAssets.duration")}
                  </Text>
                  <View className="items-center flex-row justify-center">
                    <View className="items-center flex-row  pt-3">
                      <Text className="pl-3 pr-2 pt-2">
                        {t("FixedAssets.years")}
                      </Text>
                      <TextInput
                        className="border border-gray-300 p-2 w-[100px] rounded-2xl bg-gray-100"
                        value={durationYears}
                        onChangeText={setDurationYears}
                        keyboardType="numeric"
                      />
                    </View>
                    <View className="items-center flex-row pt-3">
                      <Text className="pl-3 pr-2 pt-2">
                        {t("FixedAssets.months")}
                      </Text>
                      <TextInput
                        className="border border-gray-300 p-2 w-[100px] rounded-2xl bg-gray-100"
                        value={durationMonths}
                        onChangeText={setDurationMonths}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <Text className="my-3 text-sm">
                    {t("FixedAssets.leasedAmountAnnually")}
                  </Text>
                  <TextInput
                    className="border border-gray-300 p-3 rounded-full bg-gray-100 pl-4 "
                    placeholder={t("FixedAssets.enterLeasedAmountAnnuallyLKR")}
                    value={leastAmountAnnually}
                    onChangeText={setLeastAmountAnnually}
                    keyboardType="numeric"
                  />
                </View>
              )}

              {landownership === "Permited" && (
                <View className="pt-4">
                  <Text className="pb-2 ">{t("FixedAssets.issuedDate")}</Text>
                  <TouchableOpacity
                    onPress={() => setShowIssuedDatePicker(true)}
                  >
                    <View className="border border-gray-300 p-4 rounded-full bg-gray-100 pl-4">
                      <Text>{issuedDate.toLocaleDateString()}</Text>
                    </View>
                  </TouchableOpacity>

                  {showIssuedDatePicker && (
                    <DateTimePicker
                      value={issuedDate}
                      mode="date"
                      display="default"
                      onChange={onIssuedDateChange}
                    />
                  )}
                  <View className="pt-4">
                    <Text className="pb-2 ">
                      {t("FixedAssets.permitAnnually")}
                    </Text>
                    <TextInput
                      className="border border-gray-300 p-3 rounded-full bg-gray-100 pl-4"
                      placeholder={t("FixedAssets.enterPermitAnnuallyLKR")}
                      value={permitFeeAnnually}
                      onChangeText={setPermitFeeAnnually}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              )}

              {landownership === "Shared" && (
                <View className="pt-2">
                  <Text className="pb-2 ">
                    {t("FixedAssets.paymentAnnually")}
                  </Text>
                  <View>
                    <TextInput
                      className="border border-gray-300 p-3 rounded-full bg-gray-100 pl-4"
                      value={paymentAnnually}
                      onChangeText={setPaymentAnnually}
                      keyboardType="numeric"
                      placeholder={t("FixedAssets.enterPaymentAnnuallyLKR")}
                    />
                  </View>
                </View>
              )}

              <Text className="mt-4 text-sm  pb-2">
                {t("FixedAssets.district")}
              </Text>
              <View className="border border-gray-300 rounded-full bg-gray-100">
                <Picker
                  selectedValue={district}
                  onValueChange={(itemValue: any) => setDistrict(itemValue)}
                >
                  {districtOptions.map((item) => (
                    <Picker.Item
                      label={t(item.translationKey)}
                      value={item.value}
                      key={item.key}
                    />
                  ))}
                </Picker>
              </View>

              <View className=" justify-center ite">
                <Text className="pt-5 pb-3 font-bold">
                  {t("FixedAssets.isLandFenced")}
                </Text>
                <View className="flex-row justify-around mb-5">
                  <TouchableOpacity
                    onPress={() => setLandFenced("yes")}
                    className="flex-row items-center"
                  >
                    <View
                      className={`w-5 h-5 rounded-full ${
                        landFenced === "yes" ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    <Text className="ml-2">{t("FixedAssets.yes")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setLandFenced("no")}
                    className="flex-row items-center"
                  >
                    <View
                      className={`w-5 h-5 rounded-full ${
                        landFenced === "no" ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    <Text className="ml-2">{t("FixedAssets.no")}</Text>
                  </TouchableOpacity>
                </View>

                <Text className="pt-5  pb-3 font-bold">
                  {t("FixedAssets.areThereAnyPerennialCrops")}
                </Text>
                <View className="flex-row justify-around mb-5">
                  <TouchableOpacity
                    onPress={() => setPerennialCrop("yes")}
                    className="flex-row items-center"
                  >
                    <View
                      className={`w-5 h-5 rounded-full ${
                        perennialCrop === "yes" ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    <Text className="ml-2">{t("FixedAssets.yes")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setPerennialCrop("no")}
                    className="flex-row items-center"
                  >
                    <View
                      className={`w-5 h-5 rounded-full ${
                        perennialCrop === "no" ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    <Text className="ml-2">{t("FixedAssets.no")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : category == "Tools" ? (
            <View className="flex-1 pt-[5%]">
              <View>
                <Text className="mt-4 text-sm">{t("FixedAssets.asset")}</Text>
                <View className="border border-gray-300 rounded-full bg-gray-100">
                  <Picker
                    selectedValue={assetname}
                    onValueChange={(itemValue: any) => {
                      setAssetname(itemValue);
                      setOthertool("");
                    }}
                  >
                    <Picker.Item label={t("FixedAssets.handFork")} value="Hand Fork" />
                    <Picker.Item label={t("FixedAssets.cuttingKnife")} value="Cutting knife" />
                    <Picker.Item label={t("FixedAssets.ilukKaththa")} value="Iluk kaththa" />
                    <Picker.Item label={t("FixedAssets.kaththa")} value="Kaththa" />
                    <Picker.Item
                      label={t("FixedAssets.karaDigaManna")}
                      value="Kara diga manna"
                    />
                    <Picker.Item
                      label={t("FixedAssets.coconutHarvestingKnife")}
                      value="Coconut harvesting knife"
                    />
                    <Picker.Item label={t("FixedAssets.tappingKnife")} value="Tapping knife" />
                    <Picker.Item label={t("FixedAssets.mamotie")} value="Mamotie" />
                    <Picker.Item label={t("FixedAssets.mannaKnife")} value="Manna knife" />
                    <Picker.Item label={t("FixedAssets.shovel")} value="Shovel" />
                    <Picker.Item label={t("FixedAssets.smallAxe")} value="Small axe" />
                    <Picker.Item label={t("FixedAssets.puningKnife")} value="Puning knife" />
                    <Picker.Item label={t("FixedAssets.hoeWithFork")} value="Hoe with fork" />
                    <Picker.Item label={t("FixedAssets.forkHoe")} value="Fork hoe" />
                    <Picker.Item
                      label={t("FixedAssets.sicklePaddy")}
                      value="Sickle - paddy"
                    />
                    <Picker.Item label={t("FixedAssets.growBags")} value="Grow bags" />
                    <Picker.Item label={t("FixedAssets.seedlingTray")} value="Seedling tray" />
                    <Picker.Item label={t("FixedAssets.fogger")} value="Fogger" />
                    <Picker.Item
                      label={t("FixedAssets.dripIrrigationSystem")}
                      value="Drip Irrigation system"
                    />
                    <Picker.Item
                      label={t("FixedAssets.sprinklerIrrigationSystem")}
                      value="Sprinkler Irrigation system"
                    />
                    <Picker.Item label={t("FixedAssets.waterPump")} value="Water pump" />
                    <Picker.Item label={t("FixedAssets.waterTank")} value="Water tank" />
                    <Picker.Item label={t("FixedAssets.other")} value="Other" />
                  </Picker>
                </View>
              </View>

              {assetname == "Other" && (
                <View>
                  <View>
                    <Text className="mt-4 text-sm  pb-2">
                      {t("FixedAssets.mentionOther")}
                    </Text>
                    <TextInput
                      className="border border-gray-300 p-4 rounded-full bg-gray-100 pl-4"
                      value={othertool}
                      onChangeText={setOthertool}
                      placeholder={t("FixedAssets.mentionOther")}
                    />
                  </View>
                </View>
              )}
              <View>
                <Text className="mt-4 text-sm  pb-2">
                  {t("FixedAssets.brand")}
                </Text>
                <View className="border border-gray-300 rounded-full bg-gray-100">
                  <Picker
                    selectedValue={toolbrand}
                    onValueChange={(itemValue: any) => setToolbrand(itemValue)}
                  >
                    <Picker.Item label={t("FixedAssets.Lakloha")} value="Lakloha" />
                    <Picker.Item label={t("FixedAssets.Crocodile")} value="Crocodile" />
                    <Picker.Item label={t("FixedAssets.Chillington")} value="Chillington" />
                    <Picker.Item label={t("FixedAssets.Lanlo")} value="Lanlo" />
                    <Picker.Item label={t("FixedAssets.DBL")} value="DBL" />
                    <Picker.Item label={t("FixedAssets.Browns")} value="Browns" />
                    <Picker.Item label={t("FixedAssets.Hayles")} value="Hayles" />
                    <Picker.Item label={t("FixedAssets.Janathasteel")} value="Janatha steel" />
                    <Picker.Item label={t("FixedAssets.Lakwa")} value="Lakwa" />
                    <Picker.Item label={t("FixedAssets.CSAgro")} value="CS Agro" />
                    <Picker.Item label={t("FixedAssets.Aswenna")} value="Aswenna" />
                    <Picker.Item label={t("FixedAssets.PiyadasaAgro")} value="Piyadasa Agro" />
                    <Picker.Item label={t("FixedAssets.Lakagro")} value="Lak agro" />
                    <Picker.Item
                      label={t("FixedAssets.JohnPiperInternational")}
                      value="John Piper International"
                    />
                    <Picker.Item label={t("FixedAssets.Dinapala")}value="Dinapala" />
                    <Picker.Item label={t("FixedAssets.ANTON")} value="ANTON" />
                    <Picker.Item label={t("FixedAssets.ARPICO")} value="ARPICO" />
                    <Picker.Item label={t("FixedAssets.Slon")} value="S-lon" />
                    <Picker.Item label={t("FixedAssets.Singer")} value="Singer" />
                    <Picker.Item label={t("FixedAssets.INGCO")} value="INGCO" />
                    <Picker.Item label={t("FixedAssets.Jinasena")} value="Jinasena" />
                  </Picker>
                </View>
                <Text className="mt-4 text-sm  pb-2">
                  {t("FixedAssets.numberofUnits")}
                </Text>
                <TextInput
                  className="border border-gray-300 p-3 rounded-full bg-gray-100 pl-4"
                  placeholder={t("FixedAssets.enterNumberofUnits")}
                  value={numberOfUnits}
                  onChangeText={setNumberOfUnits}
                  keyboardType="numeric"
                />

                <Text className="mt-4 text-sm  pb-2">
                  {t("FixedAssets.unitPrice")}
                </Text>
                <TextInput
                  className="border border-gray-300 p-3 rounded-full bg-gray-100 pl-4"
                  placeholder={t("FixedAssets.enterUnitPrice")}
                  value={unitPrice}
                  onChangeText={setUnitPrice}
                  keyboardType="numeric"
                />

                <Text className="mt-4 text-sm  pb-2">
                  {t("FixedAssets.totalPrice")}
                </Text>
                <View className="border border-gray-300 p-4 rounded-full bg-gray-100 pl-4">
                  <Text>{totalPrice.toFixed(2)}</Text>
                </View>
              </View>
              {/* Warranty Section */}
              <Text className="pt-5  pb-3 ">
                {t("FixedAssets.warranty")}
              </Text>
              <View className="flex-row justify-around mb-5">
                <TouchableOpacity
                  onPress={() => setWarranty("yes")}
                  className="flex-row items-center"
                >
                  <View
                    className={`w-5 h-5 rounded-full ${
                      warranty === "yes" ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                  <Text className="ml-2">{t("FixedAssets.yes")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setWarranty("no")}
                  className="flex-row items-center"
                >
                  <View
                    className={`w-5 h-5 rounded-full ${
                      warranty === "no" ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                  <Text className="ml-2">{t("FixedAssets.no")}</Text>
                </TouchableOpacity>
              </View>

              {/* Conditional Date Pickers */}
              {warranty === "yes" && (
                <>
                  <Text className="pt-5 pl-3 pb-3 font-bold">
                    {t("FixedAssets.purchasedDate")}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowPurchasedDatePicker(true)}
                  >
                    <View className="border border-gray-300 p-2 rounded-full bg-gray-100 pt-7">
                      <Text>{purchasedDate.toLocaleDateString()}</Text>
                    </View>
                  </TouchableOpacity>
                  {showPurchasedDatePicker && (
                    <DateTimePicker
                      value={purchasedDate}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        if (event.type === "set" && selectedDate) {
                          if (selectedDate > new Date()) {
                            Alert.alert(
                              t("FixedAssets.sorry"),
                              t("FixedAssets.purchaseDateCannotBeFuture"),
                              [{ text: t("Main.ok") }]
                            );
                          } else {
                            setPurchasedDate(selectedDate);
                          }
                        }
                        setShowPurchasedDatePicker(false);
                      }}
                      maximumDate={new Date()} // Prevent future dates
                    />
                  )}

                  <Text className="pt-5 pl-3 pb-3 font-bold">
                    {t("FixedAssets.warrantyExpireDate")}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowExpireDatePicker(true)}
                  >
                    <View className="border border-gray-300 p-2 rounded-full bg-gray-100 pt-4">
                      <Text className="pb-3">
                        {expireDate.toLocaleDateString()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  {showExpireDatePicker && (
                    <DateTimePicker
                      value={expireDate}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        if (event.type === "set" && selectedDate) {
                          if (selectedDate < purchasedDate) {
                            Alert.alert(
                              t("FixedAssets.sorry"),
                              t(
                                "FixedAssets.expireDateCannotBeFuture"
                              ),
                              [{ text: t("Main.ok") }]
                            );
                          } else {
                            setExpireDate(selectedDate);
                          }
                        }
                        setShowExpireDatePicker(false);
                      }}
                    />
                  )}

                  {errorMessage ? (
                    <Text className="text-red-500 mt-2">{errorMessage}</Text>
                  ) : null}

                  <Text className="pt-5 pl-3 pb-3 font-bold">
                    {t("FixedAssets.additionalOption")}
                  </Text>

                  <Text className="mt-4 text-sm pl-2">
                    {t("FixedAssets.warrantyStatus")}
                  </Text>

                  <View className="border border-gray-300 rounded-full bg-gray-100 p-2 mt-2">
                    <Text
                      style={{
                        color: expireDate > new Date() ? "green" : "red",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      {expireDate > new Date() ? t("FixedAssets.valid") : t("FixedAssets.expired")}
                    </Text>
                  </View>
                </>
              )}
            </View>
          ) : (
            <View>
              {/* Type Picker for "Building and Infrastructures" */}
              <Text className="mt-4 text-sm pb-2">{t("FixedAssets.type")}</Text>
              <View className="border border-gray-300 rounded-full bg-gray-100">
                <Picker
                  selectedValue={type}
                  onValueChange={(itemValue: any) => setType(itemValue)}
                >
                  <Picker.Item
                    label={t("FixedAssets.selectAssetType")}
                    value=""
                  />
                  <Picker.Item label={t("FixedAssets.barn")} value="Barn" />
                  <Picker.Item label={t("FixedAssets.silo")} value="Silo" />
                  <Picker.Item
                    label={t("FixedAssets.greenhouseStructur")}
                    value="Greenhouse structure"
                  />
                  <Picker.Item
                    label={t("FixedAssets.storageFacility")}
                    value="Storage facility"
                  />
                  <Picker.Item label={t("FixedAssets.storageShed")} value="Storage shed" />
                  <Picker.Item
                    label={t("FixedAssets.processingFacility")}
                    value="Processing facility"
                  />
                  <Picker.Item label={t("FixedAssets.packingShed")} value="Packing shed" />
                  <Picker.Item label={t("FixedAssets.dairyParlor")} value="Dairy parlor" />
                  <Picker.Item label={t("FixedAssets.poultryHouse")} value="Poultry house" />
                  <Picker.Item
                    label={t("FixedAssets.livestockShelter")}
                    value="Livestock shelter"
                  />

                  {/* Add other types as needed */}
                </Picker>
              </View>

              {/* Floor Area */}
              <Text className="mt-4 text-sm pb-2 ">
                {t("FixedAssets.floorAreaSqrFt")}
              </Text>
              <TextInput
                className="border border-gray-300 p-3 pl-4  rounded-full bg-gray-100"
                placeholder={t("FixedAssets.enterFloorArea")}
                value={floorArea}
                onChangeText={setFloorArea}
                keyboardType="numeric"
              />

              {/* Ownership Picker */}
              <Text className="mt-4 text-sm pb-2">
                {t("FixedAssets.ownership")}
              </Text>
              <View className="border border-gray-300 rounded-full bg-gray-100">
                <Picker
                  selectedValue={ownership}
                  onValueChange={(itemValue: any) => setOwnership(itemValue)}
                >
                  {ownershipCategories.map((item) => (
                    <Picker.Item
                      label={t(item.translationKey)}
                      value={item.value}
                      key={item.key}
                    />
                  ))}
                </Picker>
              </View>

              {/* Conditional Ownership Fields */}
              {ownership === "Own Building (with title ownership)" && (
                <View>
                  <Text className="mt-4 text-sm pb-2">
                    {t("FixedAssets.estimatedBuildingValueLKR")}
                  </Text>
                  <TextInput
                    className="border border-gray-300 p-3 rounded-full bg-gray-100 pl-4"
                    placeholder={t(
                      "FixedAssets.estimatedBuildingValueLKR"
                    )}
                    value={estimateValue}
                    onChangeText={setEstimatedValue}
                    keyboardType="numeric"
                  />
                </View>
              )}
              {ownership === "Leased Building" && (
                <View className="pt-[3%]">
                  <Text className="pt-1 pl-3 pb-1 font-bold">
                    {t("FixedAssets.startDate")}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowStartDatePicker(true)}
                  >
                    <View className="border border-gray-300 p-2 rounded-full bg-gray-100 pt-5">
                      <Text className="pb-2">
                        {startDate.toLocaleDateString()}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {showStartDatePicker && (
                    <DateTimePicker
                      value={startDate || new Date()}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        if (event.type === "set") {
                          onStartDateChange(selectedDate); // Call date change handler
                          setShowStartDatePicker(false); // Close picker
                        } else {
                          setShowStartDatePicker(false); // Close picker on cancel
                        }
                      }}
                      maximumDate={new Date()} // <-- Prevent future dates directly in the picker
                    />
                  )}

                  <Text className="mt-4 text-sm pl-2">
                    {t("FixedAssets.duration")}
                  </Text>
                  <View className="flex-row gap-x-5 items-center ">
                    <TextInput
                      className="border border-gray-300 p-2 w-[110px] rounded-full bg-gray-100"
                      value={durationYears}
                      onChangeText={setDurationYears}
                      keyboardType="numeric"
                    />
                    <Text className="pt-3">{t("FixedAssets.years")}</Text>

                    <TextInput
                      className="border border-gray-300 p-2 w-[110px] rounded-full bg-gray-100 "
                      value={durationMonths}
                      onChangeText={setDurationMonths}
                      keyboardType="numeric"
                    />
                    <Text className="pt-3">{t("FixedAssets.months")}</Text>
                  </View>

                  <View className="pt-[5%]">
                    <Text className="pl-2 pb-1">
                      {t("FixedAssets.leasedAmountAnnually")}
                    </Text>
                    <TextInput
                      className="border border-gray-300 p-2 rounded-full bg-gray-100 pt-6"
                      value={leastAmountAnnually}
                      onChangeText={setLeastAmountAnnually}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              )}

              {ownership == "Permit Building" && (
                <View className="pt-[3%]">
                  <Text className="pl-2">{t("FixedAssets.issuedDate")}</Text>
                  <TouchableOpacity
                    onPress={() => setShowLbIssuedDatePicker(true)}
                  >
                    <View className="border border-gray-300 p-2 rounded-full bg-gray-100 pt-6">
                      <Text>
                        {lbissuedDate
                          ? lbissuedDate.toLocaleDateString()
                          : "Select Date"}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {showLbIssuedDatePicker && (
                    <DateTimePicker
                      value={lbissuedDate || new Date()} // Default to current date if not set
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        if (event.type === "set") {
                          onPermitIssuedDateChange(selectedDate); // Call date change handler
                          setShowLbIssuedDatePicker(false); // Close picker
                        } else {
                          setShowLbIssuedDatePicker(false); // Close picker on cancel
                        }
                      }}
                      maximumDate={new Date()} // Prevent future dates
                    />
                  )}

                  <View className="pt-[2%]">
                    <Text className="pl-2">
                      {t("FixedAssets.permitAnnuallyLKR")}
                    </Text>
                    <TextInput
                      className="border border-gray-300 p-2 rounded-full bg-gray-100 pt-6"
                      value={permitFeeAnnually}
                      onChangeText={setPermitFeeAnnually}
                      keyboardType="numeric"
                      placeholder={t("FixedAssets.enterPermitAnnuallyLKR")}
                    />
                  </View>
                </View>
              )}

              {ownership == "Shared / No Ownership" && (
                <View className="pt-[3%]">
                  <Text className="pl-2">
                    {t("FixedAssets.paymentAnnuallyLKR")}
                  </Text>
                  <TextInput
                    className="border border-gray-300 p-2 rounded-full bg-gray-100 pt-6"
                    value={paymentAnnually}
                    onChangeText={setPaymentAnnually}
                    keyboardType="numeric"
                    placeholder={t("FixedAssets.enterPaymentAnnuallyLKR")}
                  />
                </View>
              )}

              {/* General Condition */}
              <Text className="mt-4 text-sm pb-2">
                {t("FixedAssets.generalCondition")}
              </Text>
              <View className="border border-gray-300 rounded-full bg-gray-100">
                <Picker
                  selectedValue={generalCondition}
                  onValueChange={(itemValue: any) =>
                    setGeneralCondition(itemValue)
                  }
                >
                  {generalConditionOptions.map((item) => (
                    <Picker.Item
                      label={t(item.translationKey)}
                      value={item.value}
                      key={item.key}
                    />
                  ))}
                </Picker>
              </View>

              {/* District Picker */}
              <Text className="mt-4 text-sm  pb-2">
                {t("FixedAssets.district")}
              </Text>
              <View className="border border-gray-300 rounded-full bg-gray-100">
                <Picker
                  selectedValue={district}
                  onValueChange={(itemValue: any) => setDistrict(itemValue)}
                >
                  {districtOptions.map((item) => (
                    <Picker.Item
                      label={t(item.translationKey)}
                      value={item.value}
                      key={item.key}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          )}
          <View className="flex-1 items-center pt-8">
            <TouchableOpacity
              className="bg-gray-900 p-4 rounded-3xl mb-6 h-13 w-72 "
              onPress={submitData}
            >
              <Text className="text-white text-base text-center">
                {t("FixedAssets.save")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Navigation Bar */}
      <NavigationBar navigation={navigation} />
    </View>
  );
};

export default AddAsset;
