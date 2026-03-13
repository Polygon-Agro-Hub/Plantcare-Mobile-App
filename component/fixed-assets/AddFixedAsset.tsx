import React, { useEffect, useState } from "react";
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
import AntDesign from "react-native-vector-icons/AntDesign";
import { useTranslation } from "react-i18next";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useFocusEffect } from "@react-navigation/native";
import GlobalSearchModal from "../../component/common/GlobalSearchModal";
import Icon from "react-native-vector-icons/Ionicons";
import CustomHeader from "../common/CustomHeader";

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

const SelectorButton = ({
  label,
  placeholder,
  onPress,
}: {
  label: string | undefined;
  placeholder: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="border border-[#F4F4F4] bg-[#F4F4F4] rounded-full px-4 flex-row justify-between items-center"
    style={{ paddingVertical: 14 }}
  >
    <Text
      className={`text-sm flex-1 ${label ? "text-gray-800" : "text-gray-400"}`}
      numberOfLines={1}
    >
      {label || placeholder}
    </Text>
    <AntDesign name="down" size={14} color="#6B7280" />
  </TouchableOpacity>
);

const AddAsset: React.FC<AddAssetProps> = ({ navigation }) => {
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
  const [issuedDate, setIssuedDate] = useState(new Date());
  const [showLbIssuedDatePicker, setShowLbIssuedDatePicker] = useState(false);
  const [lbissuedDate, setLbIssuedDate] = useState(new Date());
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
  const { t } = useTranslation();

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

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("fixedDashboard");
        return true;
      };
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      return () => backHandler.remove();
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
    setExtentha("");
    setExtentac("");
    setExtentp("");
    setEstimatedValue("");
    setStartDate(new Date());
    setIssuedDate(new Date());
    setLbIssuedDate(new Date());
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
  };

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        resetForm();
      };
    }, []),
  );

  const ownershipCategories = [
    {
      label: t("FixedAssets.ownBuilding"),
      value: "Own Building (with title ownership)",
    },
    { label: t("FixedAssets.leasedBuilding"), value: "Leased Building" },
    { label: t("FixedAssets.permitBuilding"), value: "Permitted Building" },
    {
      label: t("FixedAssets.sharedOwnership"),
      value: "Shared / No Ownership",
    },
  ];

  const assetTypesForAssets: Record<
    string,
    Array<{ label: string; value: string }>
  > = {
    Tractors: [
      { label: t("FixedAssets.2WD"), value: "2WD" },
      { label: t("FixedAssets.4WD"), value: "4WD" },
      { label: t("FixedAssets.other"), value: "Other" },
    ],
    Transplanter: [
      {
        label: t("FixedAssets.Paddytransplanter"),
        value: "Paddy transplanter",
      },
      { label: t("FixedAssets.other"), value: "Other" },
    ],
    "Harvesting Equipment": [
      {
        label: t("FixedAssets.Sugarcaneharvester"),
        value: "Sugarcane harvester",
      },
      { label: t("FixedAssets.Staticshedder"), value: "Static shedder" },
      {
        label: t("FixedAssets.Minicombineharvester"),
        value: "Mini combine harvester",
      },
      {
        label: t("FixedAssets.RiceCombineharvester"),
        value: "Rice Combine harvester",
      },
      { label: t("FixedAssets.Paddyharvester"), value: "Paddy harvester" },
      { label: t("FixedAssets.Maizeharvester"), value: "Maize harvester" },
      { label: t("FixedAssets.other"), value: "Other" },
    ],
    "Cleaning, Grading and Weighing Equipment": [
      { label: t("FixedAssets.Seperator"), value: "Seperator" },
      {
        label: t("FixedAssets.CentrifugalStierMachine"),
        value: "Centrifugal Stier Machine",
      },
      {
        label: t("FixedAssets.GrainClassifierSeperator"),
        value: "Grain Classifier Seperator",
      },
      { label: t("FixedAssets.DestonerMachine"), value: "Destoner Machine" },
      { label: t("FixedAssets.other"), value: "Other" },
    ],
    Sprayers: [
      { label: t("FixedAssets.KnapsackSprayer"), value: "Knapsack Sprayer" },
      {
        label: t("FixedAssets.ChemicalSprayer"),
        value: "Chemical Sprayer",
      },
      { label: t("FixedAssets.MistBlower"), value: "Mist Blower" },
      {
        label: t("FixedAssets.Environmentalfriendlysprayer"),
        value: "Environmental friendly sprayer",
      },
      { label: t("FixedAssets.Dronesprayer"), value: "Drone sprayer" },
      { label: t("FixedAssets.PressureSprayer"), value: "Pressure Sprayer" },
      { label: t("FixedAssets.other"), value: "Other" },
    ],
  };

  const brandTypesForAssets: Record<
    string,
    Array<{ label: string; value: string }>
  > = {
    Tractors: [
      { label: t("FixedAssets.EKubota"), value: "E Kubota EK3 - 471 Hayles" },
      {
        label: t("FixedAssets.KubotaL4508"),
        value: "Kubota L4508 4wd Tractor Hayles",
      },
      {
        label: t("FixedAssets.KubotaL3408"),
        value: "Kubota L3408 4wd Tractor - Hayles",
      },
      { label: t("FixedAssets.Tafe"), value: "Tafe - Browns" },
      {
        label: t("FixedAssets.MasseyFerguson"),
        value: "Massey Ferguson - Browns",
      },
      { label: t("FixedAssets.Yanmar"), value: "Yanmar - Browns" },
      { label: t("FixedAssets.Sumo"), value: "Sumo - Browns" },
      { label: t("FixedAssets.Sifang"), value: "Sifang - Browns" },
      { label: t("FixedAssets.Uikyno"), value: "Uikyno - Browns" },
      {
        label: t("FixedAssets.ShakthimanBrowns"),
        value: "Shakthiman - Browns",
      },
      { label: t("FixedAssets.Fieldking"), value: "Fieldking - Browns" },
      { label: t("FixedAssets.National"), value: "National - Browns" },
      { label: t("FixedAssets.Gaspardo"), value: "Gaspardo - Browns" },
      { label: t("FixedAssets.AgroVision"), value: "Agro Vision - Browns" },
      { label: t("FixedAssets.HP50ME"), value: "50 HP - ME" },
      { label: t("FixedAssets.ME"), value: "ME" },
      { label: t("FixedAssets.MahindraDIMO"), value: "Mahindra - DIMO" },
      { label: t("FixedAssets.SwarajDIMO"), value: "Swaraj - DIMO" },
      { label: t("FixedAssets.ClaasDIMO"), value: "Claas - DIMO" },
      { label: t("FixedAssets.LOVOLDIMO"), value: "LOVOL - DIMO" },
      { label: t("FixedAssets.Kartar"), value: "Kartar" },
      { label: t("FixedAssets.Shakthiman"), value: "Shakthiman" },
      { label: t("FixedAssets.Ginhua"), value: "Ginhua" },
      { label: t("FixedAssets.other"), value: "Other" },
    ],
    Rotavator: [
      {
        label: t("FixedAssets.ShaktimanRotavator"),
        value: "Shaktiman Fighter Rotavator",
      },
      { label: t("FixedAssets.other"), value: "Other" },
    ],
    "Combine Harvesters": [
      {
        label: t("FixedAssets.AgrotechKool"),
        value: "Agrotech Kool Combine Harvester - Hayleys",
      },
      {
        label: t("FixedAssets.AgrotechEco"),
        value: "Agrotech Eco Combine Harvester - Hayleys",
      },
      {
        label: t("FixedAssets.KubotaDC70G"),
        value: "Kubota DC-70G Plus Combine Harvester - Hayleys",
      },
      { label: t("FixedAssets.other"), value: "Other" },
    ],
    Transplanter: [
      {
        label: t("FixedAssets.KubotaNSP4W"),
        value: "Kubota NSP - 4W Rice Transplanter - Hayleys",
      },
      {
        label: t("FixedAssets.TransplantersDimo"),
        value: "Transplanters - Dimo",
      },
      { label: t("FixedAssets.ARBOS"), value: "ARBOS" },
      {
        label: t("FixedAssets.NationalTransplanter"),
        value: "National",
      },
      { label: t("FixedAssets.other"), value: "Other" },
    ],
    "Tillage Equipment": [
      {
        label: t("FixedAssets.TyneCultivator"),
        value: "13 Tyne Cultivator Spring Loaded -  ME",
      },
      {
        label: t("FixedAssets.TerracerBlade"),
        value: "Terracer Blade/Leveller  ME",
      },
      { label: t("FixedAssets.RotaryTiller"), value: "Rotary Tiller - ME" },
      { label: t("FixedAssets.PowerHarrow"), value: "Power harrow -  ME" },
      {
        label: t("FixedAssets.DiscRidger"),
        value: "Mounted Disc Ridger -  ME",
      },
      {
        label: t("FixedAssets.DiscHarrow"),
        value: "Disc Harrow Tractor Mounted -  ME",
      },
      { label: t("FixedAssets.DiskPlough"), value: "Disk Plough-  ME" },
      { label: t("FixedAssets.MiniTiller"), value: "Mini Tiller" },
      { label: t("FixedAssets.HandPlough"), value: "Hand plough" },
      { label: t("FixedAssets.TineTiller"), value: "Tine tiller" },
      { label: t("FixedAssets.Browns"), value: "Browns" },
      { label: t("FixedAssets.Hayles"), value: "Hayles" },
      { label: t("FixedAssets.Dimo"), value: "Dimo" },
      { label: t("FixedAssets.other"), value: "Other" },
    ],
    "Sowing Equipment": [
      {
        label: t("FixedAssets.Dimo"),
        value: "Seed Sowing Machine - ME",
      },
      { label: t("FixedAssets.other"), value: "Other" },
    ],
    "Harvesting Equipment": [
      {
        label: t("FixedAssets.SeedSowingMachine"),
        value: "Combine harvester - ME",
      },
      {
        label: t("FixedAssets.AutomaticSeedSowingMachine"),
        value: "4LZ 3.0 Batta Harvester",
      },
      {
        label: t("FixedAssets.CombineHarvesterME"),
        value: "4LZ 6.0P Combine Harvester",
      },
      {
        label: t("FixedAssets.BattaHarvester"),
        value: "4LZ 4.0E Combine Harvester",
      },
      { label: t("FixedAssets.Browns"), value: "Browns" },
      { label: t("FixedAssets.Hayles"), value: "Hayles" },
      { label: t("FixedAssets.YanmarBrowns"), value: "Yanmar - Browns" },
      { label: t("FixedAssets.TAF360"), value: "360 TAF" },
      { label: t("FixedAssets.AGRIUNNION"), value: "AGRIUNNION" },
      { label: t("FixedAssets.Kartar"), value: "KARTAR" },
      { label: t("FixedAssets.other"), value: "Other" },
    ],
    "Threshers, Reaper, Binders": [
      {
        label: t("FixedAssets.MiniCombineCutter"),
        value: "Mini Combine Cutter Thresher - ME",
      },
      {
        label: t("FixedAssets.MultiCropCutter"),
        value: "Multi Crop Cutter Thresher - ME",
      },
      { label: t("FixedAssets.other"), value: "Other" },
    ],
    "Cleaning, Grading and Weighing Equipment": [
      {
        label: t("FixedAssets.GrillMagneticSeparator"),
        value: "Grill Type Magnetic Separator - ME",
      },
      {
        label: t("FixedAssets.VibrioSeparator"),
        value: "Vibrio Separator Machine - ME",
      },
      {
        label: t("FixedAssets.CentrifugalStifer"),
        value: "Centrifugal Stifer Machine - ME",
      },
      {
        label: t("FixedAssets.IntensiveScourer"),
        value: "Intensive Scourer - ME",
      },
      {
        label: t("FixedAssets.GrainClassifier"),
        value: "Grain Classifier Separator - ME",
      },
      {
        label: t("FixedAssets.GrainCleaningMachine"),
        value: "Grain Cleaning Machine - ME",
      },
      {
        label: t("FixedAssets.DestonerMachineME"),
        value: "Destoner Machine - ME",
      },
      { label: t("FixedAssets.Browns"), value: "Browns" },
      { label: t("FixedAssets.Hayles"), value: "Hayles" },
      { label: t("FixedAssets.other"), value: "Other" },
    ],
    Weeding: [
      {
        label: t("FixedAssets.FarmWeedingDitching"),
        value: "FarmWeeding Ditching - ME",
      },
      { label: t("FixedAssets.Slasher"), value: "Slasher" },
      { label: t("FixedAssets.Browns"), value: "Browns" },
      { label: t("FixedAssets.Hayles"), value: "Hayles" },
      { label: t("FixedAssets.Dimo"), value: "Dimo" },
      { label: t("FixedAssets.other"), value: "Other" },
    ],
    Sprayers: [
      {
        label: t("FixedAssets.KnapsackPowerSprayer"),
        value: "Knapsack Power Sprayer - ME",
      },
      { label: t("FixedAssets.OregonSprayer"), value: "Oregon Sprayer" },
      { label: t("FixedAssets.ChemicalSprayers"), value: "Chemical Sprayer" },
      { label: t("FixedAssets.MistBlowers"), value: "Mist Blower" },
      { label: t("FixedAssets.DBL"), value: "DBL" },
      { label: t("FixedAssets.Browns"), value: "Browns" },
      { label: t("FixedAssets.Hayles"), value: "Hayles" },
      {
        label: t("FixedAssets.NationalTransplanter"),
        value: "National",
      },
      { label: t("FixedAssets.ARBOS"), value: "ARBOS" },
      { label: t("FixedAssets.Gardena"), value: "Gardena" },
      {
        label: t("FixedAssets.TractorMountedSprayer"),
        value: "Tractor Mounted Sprayer - ME",
      },
      { label: t("FixedAssets.other"), value: "Other" },
    ],
    "Shelling and Grinding Machine": [
      {
        label: t("FixedAssets.MaizeProcessingMachine"),
        value: "Maize Processing Machine - ME",
      },
      {
        label: t("FixedAssets.MaizeCoenThresher"),
        value: "Maize Coen Thresher - ME",
      },
      { label: t("FixedAssets.other"), value: "Other" },
    ],
    Sowing: [
      {
        label: t("FixedAssets.SteelSeedSowing"),
        value: "Steel and Plastic Seed Sowing Machine",
      },
      {
        label: t("FixedAssets.TractorMountedSpray"),
        value: "Tractor Mounted Sprayer",
      },
      { label: t("FixedAssets.other"), value: "Other" },
    ],
  };

  const Machineasset = [
    { label: t("FixedAssets.Tractors"), value: "Tractors" },
    { label: t("FixedAssets.Rotavator"), value: "Rotavator" },
    { label: t("FixedAssets.CombineHarvesters"), value: "Combine Harvesters" },
    { label: t("FixedAssets.Transplanter"), value: "Transplanter" },
    { label: t("FixedAssets.TillageEquipment"), value: "Tillage Equipment" },
    { label: t("FixedAssets.SowingEquipment"), value: "Sowing Equipment" },
    {
      label: t("FixedAssets.HarvestingEquipment"),
      value: "Harvesting Equipment",
    },
    {
      label: t("FixedAssets.ThreshersReaperBinders"),
      value: "Threshers, Reaper, Binders",
    },
    {
      label: t("FixedAssets.CleaningGradingEquipment"),
      value: "Cleaning, Grading and Weighing Equipment",
    },
    { label: t("FixedAssets.Weeding"), value: "Weeding" },
    { label: t("FixedAssets.Sprayers"), value: "Sprayers" },
    {
      label: t("FixedAssets.ShellingGrindingMachine"),
      value: "Shelling and Grinding Machine",
    },
    { label: t("FixedAssets.Sowing"), value: "Sowing" },
  ];

  const generalConditionOptions = [
    { label: t("FixedAssets.good"), value: "Good" },
    { label: t("FixedAssets.average"), value: "Average" },
    { label: t("FixedAssets.poor"), value: "Poor" },
  ];

  const assetOptions = [
    { label: t("FixedAssets.handFork"), value: "Hand Fork" },
    { label: t("FixedAssets.cuttingKnife"), value: "Cutting knife" },
    { label: t("FixedAssets.ilukKaththa"), value: "Iluk kaththa" },
    { label: t("FixedAssets.kaththa"), value: "Kaththa" },
    { label: t("FixedAssets.karaDigaManna"), value: "Kara diga manna" },
    {
      label: t("FixedAssets.coconutHarvestingKnife"),
      value: "Coconut harvesting knife",
    },
    { label: t("FixedAssets.tappingKnife"), value: "Tapping knife" },
    { label: t("FixedAssets.mamotie"), value: "Mamotie" },
    { label: t("FixedAssets.mannaKnife"), value: "Manna knife" },
    { label: t("FixedAssets.shovel"), value: "Shovel" },
    { label: t("FixedAssets.smallAxe"), value: "Small axe" },
    { label: t("FixedAssets.puningKnife"), value: "Puning knife" },
    { label: t("FixedAssets.hoeWithFork"), value: "Hoe with fork" },
    { label: t("FixedAssets.forkHoe"), value: "Fork hoe" },
    { label: t("FixedAssets.sicklePaddy"), value: "Sickle - paddy" },
    { label: t("FixedAssets.growBags"), value: "Grow bags" },
    { label: t("FixedAssets.seedlingTray"), value: "Seedling tray" },
    { label: t("FixedAssets.fogger"), value: "Fogger" },
    {
      label: t("FixedAssets.dripIrrigationSystem"),
      value: "Drip Irrigation system",
    },
    {
      label: t("FixedAssets.sprinklerIrrigationSystem"),
      value: "Sprinkler Irrigation system",
    },
    { label: t("FixedAssets.waterPump"), value: "Water pump" },
    { label: t("FixedAssets.waterTank"), value: "Water tank" },
    { label: t("FixedAssets.other"), value: "Other" },
  ];

  const toolBrandOptions = [
    { label: t("FixedAssets.Lakloha"), value: "Lakloha" },
    { label: t("FixedAssets.Crocodile"), value: "Crocodile" },
    { label: t("FixedAssets.Chillington"), value: "Chillington" },
    { label: t("FixedAssets.Lanlo"), value: "Lanlo" },
    { label: t("FixedAssets.DBL"), value: "DBL" },
    { label: t("FixedAssets.Browns"), value: "Browns" },
    { label: t("FixedAssets.Hayles"), value: "Hayles" },
    { label: t("FixedAssets.Janathasteel"), value: "Janatha steel" },
    { label: t("FixedAssets.Lakwa"), value: "Lakwa" },
    { label: t("FixedAssets.CSAgro"), value: "CS Agro" },
    { label: t("FixedAssets.Aswenna"), value: "Aswenna" },
    { label: t("FixedAssets.PiyadasaAgro"), value: "Piyadasa Agro" },
    { label: t("FixedAssets.Lakagro"), value: "Lak agro" },
    {
      label: t("FixedAssets.JohnPiperInternational"),
      value: "John Piper International",
    },
    { label: t("FixedAssets.Dinapala"), value: "Dinapala" },
    { label: t("FixedAssets.ANTON"), value: "ANTON" },
    { label: t("FixedAssets.ARPICO"), value: "ARPICO" },
    { label: t("FixedAssets.Slon"), value: "S-lon" },
    { label: t("FixedAssets.Singer"), value: "Singer" },
    { label: t("FixedAssets.INGCO"), value: "INGCO" },
    { label: t("FixedAssets.Jinasena"), value: "Jinasena" },
    { label: t("FixedAssets.other"), value: "Other" },
  ];

  const buildingTypeOptions = [
    { label: t("FixedAssets.barn"), value: "Barn" },
    { label: t("FixedAssets.silo"), value: "Silo" },
    {
      label: t("FixedAssets.greenhouseStructure"),
      value: "Greenhouse structure",
    },
    { label: t("FixedAssets.storageFacility"), value: "Storage facility" },
    { label: t("FixedAssets.storageShed"), value: "Storage shed" },
    {
      label: t("FixedAssets.processingFacility"),
      value: "Processing facility",
    },
    { label: t("FixedAssets.packingShed"), value: "Packing shed" },
    { label: t("FixedAssets.dairyParlor"), value: "Dairy parlor" },
    { label: t("FixedAssets.poultryHouse"), value: "Poultry house" },
    { label: t("FixedAssets.livestockShelter"), value: "Livestock shelter" },
  ];

  const categoryOptions = [
    {
      label: t("FixedAssets.buildingandInfrastructures"),
      value: "Building and Infrastructures",
    },
    {
      label: t("FixedAssets.machineandVehicles"),
      value: "Machine and Vehicles",
    },
    { label: t("FixedAssets.land"), value: "Land" },
    { label: t("FixedAssets.toolsandEquipments"), value: "Tools" },
  ];

  const landOwnershipOptions = [
    { label: t("FixedAssets.OwnLand"), value: "Own" },
    { label: t("FixedAssets.LeaseLand"), value: "Lease" },
    { label: t("FixedAssets.PermittedLand"), value: "Permitted" },
    { label: t("FixedAssets.SharedOwnership"), value: "Shared" },
  ];

  const getLabel = (
    options: Array<{ label: string; value: string }>,
    val: string,
  ) => options.find((o) => o.value === val)?.label;

  const onStartDateChange = (selectedDate: any) => {
    if (selectedDate > new Date()) {
      Alert.alert(
        t("FixedAssets.sorry"),
        t("FixedAssets.issuedDateCannotBeFuture"),
        [{ text: t("Main.ok") }],
      );
      return;
    }
    setStartDate(selectedDate);
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
    if (selectedDate > new Date()) {
      Alert.alert(
        t("FixedAssets.sorry"),
        t("FixedAssets.issuedDateCannotBeFuture"),
        [{ text: t("Main.ok") }],
      );
      return;
    }
    setLbIssuedDate(selectedDate);
  };

  const cleanedUnitPrice = parseFloat(unitPrice.replace(/,/g, "")) || 0;
  const cleanedNumberOfUnits = parseFloat(numberOfUnits) || 0;
  const totalPrice = cleanedUnitPrice * cleanedNumberOfUnits;

  const cleanNumber = (value: string) =>
    value ? value.replace(/,/g, "") : "0";

  const clearError = (field: string) =>
    setErrors((prev) => ({ ...prev, [field]: "" }));

  const currentDate = new Date();
  const maxDate = new Date(currentDate);
  maxDate.setFullYear(currentDate.getFullYear() + 1000);

  const submitData = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!selectedFarm) newErrors.selectedFarm = t("Farms.Please select a farm");
    if (!category) newErrors.category = t("FixedAssets.selectCategory");

    if (category === "Building and Infrastructures") {
      if (!type) newErrors.type = t("FixedAssets.selectAssetType");
      if (!floorArea) newErrors.floorArea = t("FixedAssets.enterFloorArea");
      if (!ownership)
        newErrors.ownership = t("FixedAssets.selectOwnershipCategory");
      if (!generalCondition)
        newErrors.generalCondition = t("FixedAssets.selectGeneralCondition");
      if (ownership === "Own Building (with title ownership)" && !estimateValue)
        newErrors.estimateValue = t(
          "FixedAssets.enterEstimatedBuildingValueLKR",
        );
      if (ownership === "Leased Building") {
        if (!startDate) newErrors.startDate = t("FixedAssets.enterDuration");
        if (!durationYears && !durationMonths)
          newErrors.duration = t("FixedAssets.enterDuration");
        if (!leastAmountAnnually)
          newErrors.leastAmountAnnually = t(
            "FixedAssets.enterLeasedAmountAnnuallyLKR",
          );
      }
      if (ownership === "Permitted Building" && !permitFeeAnnually)
        newErrors.permitFeeAnnually = t("FixedAssets.enterPermitAnnuallyLKR");
      if (ownership === "Shared / No Ownership" && !paymentAnnually)
        newErrors.paymentAnnually = t("FixedAssets.enterPaymentAnnuallyLKR");
    }

    if (category === "Land") {
      if (!landownership)
        newErrors.landownership = t("FixedAssets.selectLandCategory");
      const nonZeroExtent = [extentha, extentac, extentp].filter(
        (f) => f && f !== "0",
      );
      if (nonZeroExtent.length === 0)
        newErrors.extent = t("FixedAssets.enterFloorArea");
      if (!landFenced) newErrors.landFenced = t("FixedAssets.isLandFenced");
      if (!perennialCrop)
        newErrors.perennialCrop = t("FixedAssets.areThereAnyPerennialCrops");
      if (landownership === "Own" && !estimateValue)
        newErrors.estimateValue = t(
          "FixedAssets.enterEstimatedBuildingValueLKR",
        );
      if (landownership === "Lease") {
        if (!startDate) newErrors.startDate = t("FixedAssets.enterDuration");
        const nonZeroDuration = [durationYears, durationMonths].filter(
          (f) => f && f !== "0",
        );
        if (nonZeroDuration.length === 0)
          newErrors.duration = t("FixedAssets.enterDuration");
        if (!leastAmountAnnually)
          newErrors.leastAmountAnnually = t(
            "FixedAssets.enterLeasedAmountAnnuallyLKR",
          );
      }
      if (landownership === "Permitted" && !permitFeeAnnually)
        newErrors.permitFeeAnnually = t(
          "FixedAssets.enterPermitFeeAnnuallyLKR",
        );
      if (landownership === "Shared" && !paymentAnnually)
        newErrors.paymentAnnually = t("FixedAssets.enterPaymentAnnuallyLKR");
    }

    if (category === "Machine and Vehicles") {
      if (!asset) newErrors.asset = t("FixedAssets.selectAsset");
      const typeAndBrandAssets = [
        "Tractors",
        "Cleaning, Grading and Weighing Equipment",
        "Sprayers",
        "Transplanter",
        "Harvesting Equipment",
      ];
      if (typeAndBrandAssets.includes(asset) && !assetType)
        newErrors.assetType = t("FixedAssets.selectAssetType");
      if (assetType === "Other" && !mentionOther)
        newErrors.mentionOther = t("FixedAssets.mentionOther");
      if (!brand) newErrors.brand = t("FixedAssets.selectBrand");
      if (brand === "Other" && !customBrand)
        newErrors.customBrand = t("FixedAssets.mentionOtherBrand");
      if (!numberOfUnits)
        newErrors.numberOfUnits = t("FixedAssets.enterNumberofUnits");
      if (!unitPrice) newErrors.unitPrice = t("FixedAssets.enterUnitPrice");
      if (!warranty) newErrors.warranty = t("FixedAssets.selectWarranty");
      if (warranty === "yes" && !purchasedDate)
        newErrors.purchasedDate = t("CurrentAssets.missingFields");
      if (warranty === "yes" && !expireDate)
        newErrors.expireDate = t("CurrentAssets.missingFields");
    }

    if (category === "Tools") {
      if (!assetname) newErrors.assetname = t("FixedAssets.selectAsset");
      if (assetname === "Other" && !othertool)
        newErrors.othertool = t("FixedAssets.mentionOther");
      if (!toolbrand) newErrors.toolbrand = t("FixedAssets.selectBrand");
      if (toolbrand === "Other" && !customBrand)
        newErrors.customBrand = t("FixedAssets.mentionOtherBrand");
      if (!numberOfUnits)
        newErrors.numberOfUnits = t("FixedAssets.enterNumberofUnits");
      if (!unitPrice) newErrors.unitPrice = t("FixedAssets.enterUnitPrice");
      if (!warranty) newErrors.warranty = t("FixedAssets.selectWarranty");
      if (warranty === "yes" && !purchasedDate)
        newErrors.purchasedDate = t("FixedAssets.warrantyDatesRequired");
      if (warranty === "yes" && !expireDate)
        newErrors.expireDate = t("FixedAssets.warrantyDatesRequired");
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
      farmId: selectedFarm,
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
      mentionOther,
      brand: customBrand || brand,
      numberOfUnits: cleanedNumberOfUnits.toString(),
      unitPrice: cleanNumber(unitPrice),
      totalPrice,
      warranty,
      issuedDate,
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
    };

    try {
      const token = await AsyncStorage.getItem("userToken");
      await axios.post(
        `${environment.API_BASE_URL}api/auth/fixedassets`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      Alert.alert(
        t("FixedAssets.success"),
        t("FixedAssets.assetAddSuccessfuly"),
        [
          {
            text: t("Main.ok"),
            onPress: () => navigation.navigate("fixedDashboard"),
          },
        ],
      );
      setLoading(false);
    } catch (error: any) {
      console.error("Error submitting data:", error);
      setLoading(false);
      Alert.alert(t("Main.error"), t("Main.somethingWentWrong"), [
        { text: t("PublicForum.OK") },
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
        if (response.data.status === "success") setFarms(response.data.data);
      } catch (error) {
        console.error("Error fetching farms:", error);
      }
    };
    fetchFarmData();
  }, []);

  const formatCurrency = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const ErrorText = ({ field }: { field: string }) =>
    errors[field] ? (
      <Text className="text-red-500 text-xs mt-1 ml-2">{errors[field]}</Text>
    ) : null;

  const farmLabel = farms.find(
    (f) => f.id.toString() === selectedFarm,
  )?.farmName;

  const warrantyStatusColor =
    purchasedDate && expireDate && expireDate > new Date()
      ? "#26D041"
      : purchasedDate && expireDate
        ? "#FF0000"
        : "#6B7280";

  const warrantyStatusText =
    purchasedDate && expireDate
      ? expireDate.getTime() > new Date().getTime()
        ? t("FixedAssets.valid")
        : t("FixedAssets.expired")
      : t("CurrentAssets.status");

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      enabled
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1 }}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={false}
        />

        {/* Farm */}
        <GlobalSearchModal
          visible={modalFarm}
          onClose={() => setModalFarm(false)}
          title={t("CurrentAssets.Select Farm")}
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
          searchPlaceholder={t("SignupForum.TypeSomething")}
        />

        {/* Category */}
        <GlobalSearchModal
          visible={modalCategory}
          onClose={() => setModalCategory(false)}
          title={t("CurrentAssets.category")}
          data={categoryOptions}
          selectedItems={category ? [category] : []}
          onSelect={(items) => {
            const val = items[0] ?? "";
            setCategory(val);
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
          searchPlaceholder={t("SignupForum.TypeSomething")}
        />

        <GlobalSearchModal
          visible={modalAsset && category === "Machine and Vehicles"}
          onClose={() => setModalAsset(false)}
          title={t("FixedAssets.asset")}
          data={Machineasset}
          selectedItems={asset ? [asset] : []}
          onSelect={(items) => {
            setAsset(items[0] ?? "");
            setAssetType("");
            setBrand("");
            clearError("asset");
          }}
          searchPlaceholder={t("SignupForum.TypeSomething")}
        />

        {category === "Machine and Vehicles" &&
          asset &&
          assetTypesForAssets[asset] && (
            <GlobalSearchModal
              visible={modalAssetType}
              onClose={() => setModalAssetType(false)}
              title={t("FixedAssets.selectAssetType")}
              data={assetTypesForAssets[asset]}
              selectedItems={assetType ? [assetType] : []}
              onSelect={(items) => {
                setAssetType(items[0] ?? "");
                clearError("assetType");
              }}
              searchPlaceholder={t("SignupForum.TypeSomething")}
            />
          )}

        {category === "Machine and Vehicles" &&
          asset &&
          brandTypesForAssets[asset] && (
            <GlobalSearchModal
              visible={modalBrand}
              onClose={() => setModalBrand(false)}
              title={t("FixedAssets.selectBrand")}
              data={brandTypesForAssets[asset]}
              selectedItems={brand ? [brand] : []}
              onSelect={(items) => {
                setBrand(items[0] ?? "");
                clearError("brand");
              }}
              searchPlaceholder={t("SignupForum.TypeSomething")}
            />
          )}

        {category === "Land" && (
          <GlobalSearchModal
            visible={modalLandOwnership}
            onClose={() => setModalLandOwnership(false)}
            title={t("FixedAssets.selectLandCategory")}
            data={landOwnershipOptions}
            selectedItems={landownership ? [landownership] : []}
            onSelect={(items) => {
              setLandOwnership(items[0] ?? "");
              clearError("landownership");
            }}
            searchPlaceholder={t("SignupForum.TypeSomething")}
          />
        )}

        {category === "Tools" && (
          <GlobalSearchModal
            visible={modalAsset && category === "Tools"}
            onClose={() => setModalAsset(false)}
            title={t("FixedAssets.asset")}
            data={assetOptions}
            selectedItems={assetname ? [assetname] : []}
            onSelect={(items) => {
              setAssetname(items[0] ?? "");
              setOthertool("");
              clearError("assetname");
            }}
            searchPlaceholder={t("SignupForum.TypeSomething")}
          />
        )}

        {category === "Tools" && (
          <GlobalSearchModal
            visible={modalToolBrand}
            onClose={() => setModalToolBrand(false)}
            title={t("FixedAssets.brand")}
            data={toolBrandOptions}
            selectedItems={toolbrand ? [toolbrand] : []}
            onSelect={(items) => {
              setToolbrand(items[0] ?? "");
              clearError("toolbrand");
            }}
            searchPlaceholder={t("SignupForum.TypeSomething")}
          />
        )}

        {(category === "Building and Infrastructures" || !category) && (
          <GlobalSearchModal
            visible={modalType}
            onClose={() => setModalType(false)}
            title={t("FixedAssets.type")}
            data={buildingTypeOptions}
            selectedItems={type ? [type] : []}
            onSelect={(items) => {
              setType(items[0] ?? "");
              clearError("type");
            }}
            searchPlaceholder={t("SignupForum.TypeSomething")}
          />
        )}

        {(category === "Building and Infrastructures" || !category) && (
          <GlobalSearchModal
            visible={modalOwnership}
            onClose={() => setModalOwnership(false)}
            title={t("FixedAssets.ownership")}
            data={ownershipCategories}
            selectedItems={ownership ? [ownership] : []}
            onSelect={(items) => {
              setOwnership(items[0] ?? "");
              clearError("ownership");
            }}
            searchPlaceholder={t("SignupForum.TypeSomething")}
          />
        )}

        {(category === "Building and Infrastructures" || !category) && (
          <GlobalSearchModal
            visible={modalGeneralCondition}
            onClose={() => setModalGeneralCondition(false)}
            title={t("FixedAssets.generalCondition")}
            data={generalConditionOptions}
            selectedItems={generalCondition ? [generalCondition] : []}
            onSelect={(items) => {
              setGeneralCondition(items[0] ?? "");
              clearError("generalCondition");
            }}
            searchPlaceholder={t("SignupForum.TypeSomething")}
            showSearch={false}
          />
        )}

        <ScrollView
          className="flex-1 pb-20 bg-white"
          style={{ paddingHorizontal: wp(2) }}
          keyboardShouldPersistTaps="handled"
        >
          <CustomHeader
            title={t("FixedAssets.myAssets")}
            navigation={navigation}
            onBackPress={() => navigation.navigate("fixedDashboard")}
          />

          <View className="flex-row mt-2 justify-center">
            <View className="w-1/2">
              <TouchableOpacity
                onPress={() =>
                  (navigation as any).navigate("Main", {
                    screen: "CurrentAssert",
                  })
                }
              >
                <Text className="text-black font-semibold text-center text-lg">
                  {t("FixedAssets.currentAssets")}
                </Text>
                <View className="border-t-[2px] border-[#D9D9D9]" />
              </TouchableOpacity>
            </View>
            <View className="w-1/2">
              <TouchableOpacity>
                <Text className="text-black text-center font-semibold text-lg">
                  {t("FixedAssets.fixedAssets")}
                </Text>
                <View className="border-t-[2px] border-black" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="p-4">
            <Text className="mt-4 text-sm pb-2">
              {t("CurrentAssets.Select Farm")} *
            </Text>
            <SelectorButton
              label={farmLabel}
              placeholder={t("FixedAssets.Select a farm")}
              onPress={() => {
                Keyboard.dismiss();
                setModalFarm(true);
              }}
            />
            <ErrorText field="selectedFarm" />

            <Text className="mt-4 text-sm pb-2">
              {t("CurrentAssets.category")} *
            </Text>
            <SelectorButton
              label={getLabel(categoryOptions, category)}
              placeholder={t("FixedAssets.selectCategory")}
              onPress={() => {
                Keyboard.dismiss();
                setModalCategory(true);
              }}
            />
            <ErrorText field="category" />

            {category === "Machine and Vehicles" && (
              <View className="flex-1">
                <Text className="mt-4 text-sm pb-2">
                  {t("FixedAssets.asset")} *
                </Text>
                <SelectorButton
                  label={getLabel(Machineasset, asset)}
                  placeholder={t("FixedAssets.selectAsset")}
                  onPress={() => {
                    Keyboard.dismiss();
                    setModalAsset(true);
                  }}
                />
                <ErrorText field="asset" />

                {/* Asset Type */}
                {asset &&
                  assetTypesForAssets[asset] &&
                  assetTypesForAssets[asset].length > 0 && (
                    <>
                      <Text className="mt-4 text-sm pb-2">
                        {t("FixedAssets.selectAssetType")} *
                      </Text>
                      <SelectorButton
                        label={getLabel(assetTypesForAssets[asset], assetType)}
                        placeholder={t("FixedAssets.selectAssetType")}
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
                    <Text>{t("FixedAssets.Mention")}</Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-2 rounded-full mt-2 bg-gray-100"
                      placeholder={t("FixedAssets.Mention")}
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
                {asset &&
                  brandTypesForAssets[asset] &&
                  brandTypesForAssets[asset].length > 0 && (
                    <>
                      <Text className="mt-4 text-sm pb-2">
                        {t("FixedAssets.selectBrand")} *
                      </Text>
                      <SelectorButton
                        label={getLabel(brandTypesForAssets[asset], brand)}
                        placeholder={t("FixedAssets.selectBrand")}
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
                    <Text className="mt-4 text-sm pb-2">
                      {t("FixedAssets.mentionOtherBrand")}
                    </Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-4 rounded-full bg-gray-100 pl-4"
                      placeholder={t("FixedAssets.enterCustomBrand")}
                      value={customBrand}
                      onChangeText={(text) => {
                        setCustomBrand(text.replace(/^\s+/, ""));
                        clearError("customBrand");
                      }}
                    />
                    <ErrorText field="customBrand" />
                  </View>
                )}

                {/* Number of Units */}
                <Text className="mt-4 text-sm pb-2">
                  {t("FixedAssets.numberofUnits")} *
                </Text>
                <TextInput
                  className="border border-[#F4F4F4] p-3 pl-4 rounded-full bg-gray-100"
                  placeholder={t("FixedAssets.enterNumberofUnits")}
                  value={numberOfUnits}
                  onChangeText={(text) => {
                    setNumberOfUnits(text.replace(/[-.*#+]/g, "").trimStart());
                    clearError("numberOfUnits");
                  }}
                  keyboardType="numeric"
                />
                <ErrorText field="numberOfUnits" />

                {/* Unit Price */}
                <Text className="mt-4 text-sm pb-2">
                  {t("FixedAssets.unitPrice")} *
                </Text>
                <TextInput
                  className="border border-[#F4F4F4] p-3 pl-4 rounded-full bg-gray-100"
                  placeholder={t("FixedAssets.enterUnitPrice")}
                  value={unitPrice}
                  onChangeText={(text) => {
                    const digits = text.replace(/[^0-9]/g, "");
                    setUnitPrice(digits.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
                    clearError("unitPrice");
                  }}
                  keyboardType="numeric"
                />
                <ErrorText field="unitPrice" />

                {/* Total Price */}
                <Text className="mt-4 text-sm pb-2">
                  {t("FixedAssets.totalPrice")}
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
                <Text className="pt-5 pb-3">{t("FixedAssets.warranty")}</Text>
                <View className="flex-row justify-around">
                  {["yes", "no"].map((w) => (
                    <TouchableOpacity
                      key={w}
                      onPress={() => setWarranty(w)}
                      className="flex-row items-center"
                    >
                      <View
                        className={`w-5 h-5 rounded-full ${
                          warranty === w ? "bg-green-500" : "bg-gray-400"
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
                    {/* Purchased Date */}
                    <Text className="pt-5 pb-3">
                      {t("FixedAssets.purchasedDate")} *
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setShowPurchasedDatePicker((prev) => !prev)
                      }
                    >
                      <View className="border border-[#F4F4F4] p-4 rounded-full flex-row bg-gray-100 justify-between">
                        <Text>
                          {purchasedDate
                            ? purchasedDate.toLocaleDateString()
                            : t("CurrentAssets.purchasedate")}
                        </Text>
                        <Icon
                          name="calendar-outline"
                          size={20}
                          color="#6B7280"
                        />
                      </View>
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
                                    t("FixedAssets.purchaseDateCannotBeFuture"),
                                    [{ text: t("Main.ok") }],
                                  );
                                } else {
                                  setPurchasedDate(selectedDate);
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
                                  t("FixedAssets.purchaseDateCannotBeFuture"),
                                  [{ text: t("Main.ok") }],
                                );
                              } else {
                                setPurchasedDate(selectedDate);
                              }
                            }
                            setShowPurchasedDatePicker(false);
                          }}
                          maximumDate={new Date()}
                        />
                      ))}

                    {/* Expire Date */}
                    <Text className="pt-5 pb-3">
                      {t("FixedAssets.warrantyExpireDate")} *
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowExpireDatePicker((prev) => !prev)}
                    >
                      <View className="border border-[#F4F4F4] p-4 rounded-full flex-row bg-gray-100 justify-between">
                        <Text>
                          {expireDate
                            ? expireDate.toLocaleDateString()
                            : t("CurrentAssets.expiredate")}
                        </Text>
                        <Icon
                          name="calendar-outline"
                          size={20}
                          color="#6B7280"
                        />
                      </View>
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
                                    [{ text: t("Main.ok") }],
                                  );
                                } else {
                                  setExpireDate(selectedDate);
                                  setErrorMessage("");
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
                                  [{ text: t("Main.ok") }],
                                );
                              } else {
                                setExpireDate(selectedDate);
                                setErrorMessage("");
                              }
                            }
                          }}
                          minimumDate={purchasedDate || undefined}
                          maximumDate={maxDate}
                        />
                      ))}

                    {/* Status */}
                    <Text className="mt-4 text-sm">
                      {t("CurrentAssets.status")}
                    </Text>
                    <View className="border border-[#F4F4F4] rounded-full bg-gray-100 p-2 mt-2">
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
                <Text className="mt-4 text-sm pb-2">
                  {t("FixedAssets.extent")} *
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
                      className="flex-row items-center space-x-2"
                    >
                      <Text className="text-right">{label}</Text>
                      <TextInput
                        className="border border-[#F4F4F4] p-2 px-4 w-20 rounded-full bg-gray-100"
                        value={val}
                        onChangeText={(text) =>
                          setter(text.replace(/[-.*#+]/g, ""))
                        }
                        keyboardType="numeric"
                      />
                    </View>
                  ))}
                </View>
                <ErrorText field="extent" />

                {/* Land Ownership */}
                <Text className="mt-4 text-sm pb-2">
                  {t("FixedAssets.selectLandCategory")} *
                </Text>
                <SelectorButton
                  label={getLabel(landOwnershipOptions, landownership)}
                  placeholder={t("FixedAssets.selectLandCategory")}
                  onPress={() => {
                    Keyboard.dismiss();
                    setModalLandOwnership(true);
                  }}
                />
                <ErrorText field="landownership" />

                {/* Own */}
                {landownership === "Own" && (
                  <View>
                    <Text className="mt-4 text-sm pb-2">
                      {t("FixedAssets.estimateValue")} *
                    </Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-2 rounded-full bg-gray-100 pl-4"
                      placeholder={t("FixedAssets.enterEstimateValue")}
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
                    <Text className="mt-4 pb-2">
                      {t("FixedAssets.startDate")} *
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowStartDatePicker((prev) => !prev)}
                    >
                      <View className="border border-[#F4F4F4] p-4 rounded-full flex-row bg-gray-100 justify-between">
                        <Text className={startDate ? "" : "text-gray-400"}>
                          {startDate
                            ? new Date(startDate).toLocaleDateString()
                            : "Select Date"}
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

                    <Text className="mt-4 text-sm pb-2">
                      {t("FixedAssets.duration")} *
                    </Text>
                    <View className="items-center flex-row justify-center">
                      <Text className="w-[20%] text-right pr-2">
                        {t("FixedAssets.years")} *
                      </Text>
                      <TextInput
                        className="border border-[#F4F4F4] p-2 w-[30%] px-4 rounded-full bg-gray-100"
                        value={durationYears}
                        onChangeText={(text) =>
                          setDurationYears(
                            text.replace(/[-.*#+]/g, "").trimStart(),
                          )
                        }
                        keyboardType="numeric"
                      />
                      <Text className="w-[20%] text-right pr-2">
                        {t("FixedAssets.months")} *
                      </Text>
                      <TextInput
                        className="border border-[#F4F4F4] p-2 w-[30%] px-4 rounded-full bg-[#F4F4F4]"
                        value={durationMonths}
                        onChangeText={(text) => {
                          const cleaned = text
                            .replace(/[-.*#+]/g, "")
                            .trimStart();
                          const num = parseInt(cleaned, 10);
                          if (cleaned === "" || (num >= 0 && num <= 12))
                            setDurationMonths(cleaned);
                        }}
                        keyboardType="numeric"
                        maxLength={2}
                      />
                    </View>
                    <ErrorText field="duration" />

                    <Text className="pb-2 mt-4 text-sm">
                      {t("FixedAssets.leasedAmountAnnually")} *
                    </Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-3 rounded-full bg-[#F4F4F4] pl-4"
                      placeholder={t(
                        "FixedAssets.enterLeasedAmountAnnuallyLKR",
                      )}
                      value={leastAmountAnnually}
                      onChangeText={(text) =>
                        setLeastAmountAnnually(formatCurrency(text))
                      }
                      keyboardType="numeric"
                    />
                    <ErrorText field="leastAmountAnnually" />
                  </View>
                )}

                {/* Permitted */}
                {landownership === "Permitted" && (
                  <View className="mt-4">
                    <Text className="pb-2">
                      {t("FixedAssets.issuedDate")} *
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowIssuedDatePicker((prev) => !prev)}
                    >
                      <View className="border border-[#F4F4F4] p-4 rounded-full flex-row bg-[#F4F4F4] justify-between">
                        <Text>{issuedDate.toLocaleDateString()}</Text>
                        <Icon
                          name="calendar-outline"
                          size={20}
                          color="#6B7280"
                        />
                      </View>
                    </TouchableOpacity>
                    {showIssuedDatePicker &&
                      (Platform.OS === "ios" ? (
                        <View className="justify-center items-center z-50 bg-[#F4F4F4] rounded-lg">
                          <DateTimePicker
                            value={issuedDate}
                            mode="date"
                            display="inline"
                            style={{ width: 320, height: 260 }}
                            onChange={onIssuedDateChange}
                            maximumDate={new Date()}
                          />
                        </View>
                      ) : (
                        <DateTimePicker
                          value={issuedDate}
                          mode="date"
                          display="default"
                          onChange={onIssuedDateChange}
                          maximumDate={new Date()}
                        />
                      ))}
                    <Text className="mt-4 pb-2">
                      {t("FixedAssets.permitAnnually")} *
                    </Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-3 rounded-full bg-[#F4F4F4] pl-4"
                      placeholder={t("FixedAssets.enterPermitAnnuallyLKR")}
                      value={permitFeeAnnually}
                      onChangeText={(text) =>
                        setPermitFeeAnnually(formatCurrency(text.trimStart()))
                      }
                      keyboardType="numeric"
                    />
                    <ErrorText field="permitFeeAnnually" />
                  </View>
                )}

                {/* Shared */}
                {landownership === "Shared" && (
                  <View className="mt-4">
                    <Text className="pb-2">
                      {t("FixedAssets.paymentAnnually")} *
                    </Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-3 rounded-full bg-[#F4F4F4] pl-4"
                      value={paymentAnnually}
                      onChangeText={(text) =>
                        setPaymentAnnually(formatCurrency(text.trimStart()))
                      }
                      keyboardType="numeric"
                      placeholder={t("FixedAssets.enterPaymentAnnuallyLKR")}
                    />
                    <ErrorText field="paymentAnnually" />
                  </View>
                )}

                {/* Land fenced */}
                <View className="justify-center">
                  <Text className="pt-5 pb-3 font-bold">
                    {t("FixedAssets.isLandFenced")} *
                  </Text>
                  <View className="flex-row justify-around mb-5">
                    {["yes", "no"].map((v) => (
                      <TouchableOpacity
                        key={v}
                        onPress={() => setLandFenced(v)}
                        className="flex-row items-center"
                      >
                        <View
                          className={`w-5 h-5 rounded-full ${
                            landFenced === v ? "bg-green-500" : "bg-gray-400"
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
                  <Text className="pt-5 pb-3 font-bold">
                    {t("FixedAssets.areThereAnyPerennialCrops")} *
                  </Text>
                  <View className="flex-row justify-around mb-5">
                    {["yes", "no"].map((v) => (
                      <TouchableOpacity
                        key={v}
                        onPress={() => setPerennialCrop(v)}
                        className="flex-row items-center"
                      >
                        <View
                          className={`w-5 h-5 rounded-full ${
                            perennialCrop === v ? "bg-green-500" : "bg-gray-400"
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
                <Text className="mt-4 text-sm">{t("FixedAssets.asset")} *</Text>
                <View className="rounded-full mt-2">
                  <SelectorButton
                    label={getLabel(assetOptions, assetname)}
                    placeholder={t("FixedAssets.selectAsset")}
                    onPress={() => {
                      Keyboard.dismiss();
                      setModalAsset(true);
                    }}
                  />
                </View>
                <ErrorText field="assetname" />

                {assetname === "Other" && (
                  <View>
                    <Text className="mt-4 text-sm pb-2">
                      {t("FixedAssets.mentionOther")}
                    </Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-4 rounded-full bg-[#F4F4F4] pl-4"
                      value={othertool}
                      onChangeText={(text) => {
                        setOthertool(text.replace(/^\s+/, ""));
                        clearError("othertool");
                      }}
                      placeholder={t("FixedAssets.mentionOther")}
                    />
                    <ErrorText field="othertool" />
                  </View>
                )}

                {/* Tool Brand */}
                <Text className="mt-4 text-sm pb-2">
                  {t("FixedAssets.brand")} *
                </Text>
                <SelectorButton
                  label={getLabel(toolBrandOptions, toolbrand)}
                  placeholder={t("FixedAssets.selectBrand")}
                  onPress={() => {
                    Keyboard.dismiss();
                    setModalToolBrand(true);
                  }}
                />
                <ErrorText field="toolbrand" />

                {toolbrand === "Other" && (
                  <View>
                    <Text className="mt-4 text-sm pb-2">
                      {t("FixedAssets.mentionOtherBrand")}
                    </Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-4 rounded-full bg-[#F4F4F4] pl-4"
                      placeholder={t("FixedAssets.enterCustomBrand")}
                      value={customBrand}
                      onChangeText={(text) =>
                        setCustomBrand(text.replace(/^\s+/, ""))
                      }
                    />
                    <ErrorText field="customBrand" />
                  </View>
                )}

                {/* Units & Price */}
                <Text className="mt-4 text-sm pb-2">
                  {t("FixedAssets.numberofUnits")} *
                </Text>
                <TextInput
                  className="border border-[#F4F4F4] p-3 rounded-full bg-[#F4F4F4] pl-4"
                  placeholder={t("FixedAssets.enterNumberofUnits")}
                  value={numberOfUnits}
                  onChangeText={(text) =>
                    setNumberOfUnits(text.replace(/[-.*#+]/g, "").trimStart())
                  }
                  keyboardType="numeric"
                />
                <ErrorText field="numberOfUnits" />

                <Text className="mt-4 text-sm pb-2">
                  {t("FixedAssets.unitPrice")} *
                </Text>
                <TextInput
                  className="border border-[#F4F4F4] p-3 rounded-full bg-[#F4F4F4] pl-4"
                  placeholder={t("FixedAssets.enterUnitPrice")}
                  value={unitPrice}
                  onChangeText={(text) => {
                    const digits = text.replace(/[^0-9]/g, "");
                    setUnitPrice(digits.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
                    clearError("unitPrice");
                  }}
                  keyboardType="numeric"
                />
                <ErrorText field="unitPrice" />

                <Text className="mt-4 text-sm pb-2">
                  {t("FixedAssets.totalPrice")}
                </Text>
                <View className="border border-[#F4F4F4] p-4 rounded-full bg-gray-100">
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
                <Text className="pt-5 pb-3">{t("FixedAssets.warranty")}</Text>
                <View className="flex-row justify-around mb-5">
                  {["yes", "no"].map((w) => (
                    <TouchableOpacity
                      key={w}
                      onPress={() => setWarranty(w)}
                      className="flex-row items-center"
                    >
                      <View
                        className={`w-5 h-5 rounded-full ${
                          warranty === w ? "bg-green-500" : "bg-gray-400"
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
                    {/* Purchased Date */}
                    <Text className="pb-3">
                      {t("FixedAssets.purchasedDate")} *
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setShowPurchasedDatePicker((prev) => !prev)
                      }
                    >
                      <View className="border border-[#F4F4F4] p-4 rounded-full flex-row bg-[#F4F4F4] justify-between">
                        <Text>
                          {purchasedDate
                            ? purchasedDate.toLocaleDateString()
                            : t("CurrentAssets.purchasedate")}
                        </Text>
                        <Icon
                          name="calendar-outline"
                          size={20}
                          color="#6B7280"
                        />
                      </View>
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
                                    t("FixedAssets.purchaseDateCannotBeFuture"),
                                    [{ text: t("Main.ok") }],
                                  );
                                } else {
                                  setPurchasedDate(selectedDate);
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
                                  t("FixedAssets.purchaseDateCannotBeFuture"),
                                  [{ text: t("Main.ok") }],
                                );
                              } else {
                                setPurchasedDate(selectedDate);
                              }
                            }
                            setShowPurchasedDatePicker(false);
                          }}
                          maximumDate={new Date()}
                        />
                      ))}

                    {/* Expire Date */}
                    <Text className="pt-5 pb-3">
                      {t("FixedAssets.warrantyExpireDate")} *
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowExpireDatePicker((prev) => !prev)}
                    >
                      <View className="border border-[#F4F4F4] p-4 rounded-full flex-row bg-[#F4F4F4] justify-between">
                        <Text>
                          {expireDate
                            ? expireDate.toLocaleDateString()
                            : t("CurrentAssets.expiredate")}
                        </Text>
                        <Icon
                          name="calendar-outline"
                          size={20}
                          color="#6B7280"
                        />
                      </View>
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
                                    [{ text: t("Main.ok") }],
                                  );
                                } else {
                                  setExpireDate(selectedDate);
                                  setErrorMessage("");
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
                                  [{ text: t("Main.ok") }],
                                );
                              } else {
                                setExpireDate(selectedDate);
                                setErrorMessage("");
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

                    <Text className="mt-4 text-sm">
                      {t("CurrentAssets.status")}
                    </Text>
                    <View className="border border-[#F4F4F4] rounded-full bg-gray-100 p-2 mt-2">
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
                {/* Building Type */}
                <Text className="mt-4 text-sm pb-2">
                  {t("FixedAssets.type")} *
                </Text>
                <SelectorButton
                  label={getLabel(buildingTypeOptions, type)}
                  placeholder={t("FixedAssets.selectAssetType")}
                  onPress={() => {
                    Keyboard.dismiss();
                    setModalType(true);
                  }}
                />
                <ErrorText field="type" />

                {/* Floor Area */}
                <Text className="mt-4 text-sm pb-2">
                  {t("FixedAssets.floorAreaSqrFt")} *
                </Text>
                <TextInput
                  className="border border-[#F4F4F4] p-3 pl-4 rounded-full bg-[#F4F4F4]"
                  placeholder={t("FixedAssets.enterFloorArea")}
                  value={floorArea}
                  onChangeText={(text) => {
                    setFloorArea(text.replace(/[^0-9]/g, "").trimStart());
                    clearError("floorArea");
                  }}
                  keyboardType="numeric"
                />
                <ErrorText field="floorArea" />

                {/* Ownership */}
                <Text className="mt-4 text-sm pb-2">
                  {t("FixedAssets.ownership")} *
                </Text>
                <SelectorButton
                  label={getLabel(ownershipCategories, ownership)}
                  placeholder={t("FixedAssets.selectOwnershipCategory")}
                  onPress={() => {
                    Keyboard.dismiss();
                    setModalOwnership(true);
                  }}
                />
                <ErrorText field="ownership" />

                {/* Own Building */}
                {ownership === "Own Building (with title ownership)" && (
                  <View>
                    <Text className="mt-4 text-sm pb-2">
                      {t("FixedAssets.estimatedBuildingValueLKR")} *
                    </Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-3 rounded-full bg-[#F4F4F4] pl-4"
                      placeholder={t("FixedAssets.estimatedBuildingValueLKR")}
                      value={estimateValue}
                      onChangeText={(text) =>
                        setEstimatedValue(formatCurrency(text.trimStart()))
                      }
                      keyboardType="numeric"
                    />
                    <ErrorText field="estimateValue" />
                  </View>
                )}

                {/* Leased Building */}
                {ownership === "Leased Building" && (
                  <View className="mt-4">
                    <Text className="pb-2">{t("FixedAssets.startDate")} *</Text>
                    <TouchableOpacity
                      onPress={() => setShowStartDatePicker((prev) => !prev)}
                    >
                      <View className="border border-[#F4F4F4] p-4 rounded-full flex-row bg-[#F4F4F4] justify-between">
                        <Text className={startDate ? "" : "text-gray-400"}>
                          {startDate
                            ? new Date(startDate).toLocaleDateString()
                            : "Select Date"}
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

                    <Text className="mt-4 text-sm pb-2">
                      {t("FixedAssets.duration")} *
                    </Text>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Text className="w-[20%] text-right pr-2">
                          {t("FixedAssets.years")}
                        </Text>
                        <TextInput
                          className="border border-[#F4F4F4] p-2 px-4 rounded-full bg-[#F4F4F4] w-[30%]"
                          value={durationYears}
                          onChangeText={(text) =>
                            setDurationYears(
                              text.replace(/[-.*#+]/g, "").trimStart(),
                            )
                          }
                          keyboardType="numeric"
                        />
                        <Text className="w-[20%] text-right pr-2">
                          {t("FixedAssets.months")}
                        </Text>
                        <TextInput
                          className="border border-[#F4F4F4] p-2 w-[30%] px-4 rounded-full bg-[#F4F4F4]"
                          value={durationMonths}
                          onChangeText={(text) => {
                            const cleaned = text
                              .replace(/[-.*#+]/g, "")
                              .trimStart();
                            const num = parseInt(cleaned, 10);
                            if (cleaned === "" || (num >= 0 && num <= 12))
                              setDurationMonths(cleaned);
                          }}
                          keyboardType="numeric"
                          maxLength={2}
                        />
                      </View>
                    </View>
                    <ErrorText field="duration" />

                    <Text className="pt-5 pb-2">
                      {t("FixedAssets.leasedAmountAnnually")} *
                    </Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-3 rounded-full bg-[#F4F4F4] pl-4"
                      value={leastAmountAnnually}
                      onChangeText={(text) =>
                        setLeastAmountAnnually(formatCurrency(text.trimStart()))
                      }
                      keyboardType="numeric"
                    />
                    <ErrorText field="leastAmountAnnually" />
                  </View>
                )}

                {/* Permitted Building */}
                {ownership === "Permitted Building" && (
                  <View className="mt-4">
                    <Text className="pb-2">
                      {t("FixedAssets.issuedDate")} *
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowLbIssuedDatePicker((prev) => !prev)}
                    >
                      <View className="border border-[#F4F4F4] p-4 rounded-full flex-row bg-[#F4F4F4] justify-between">
                        <Text>
                          {lbissuedDate
                            ? lbissuedDate.toLocaleDateString()
                            : "Select Date"}
                        </Text>
                        <Icon
                          name="calendar-outline"
                          size={20}
                          color="#6B7280"
                        />
                      </View>
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
                    <Text className="mt-4 pb-2">
                      {t("FixedAssets.permitAnnuallyLKR")} *
                    </Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-3 rounded-full bg-[#F4F4F4] pl-4"
                      value={permitFeeAnnually}
                      onChangeText={(text) =>
                        setPermitFeeAnnually(formatCurrency(text.trimStart()))
                      }
                      keyboardType="numeric"
                      placeholder={t("FixedAssets.enterPermitAnnuallyLKR")}
                    />
                    <ErrorText field="permitFeeAnnually" />
                  </View>
                )}

                {/* Shared / No Ownership */}
                {ownership === "Shared / No Ownership" && (
                  <View className="mt-4">
                    <Text className="pb-2">
                      {t("FixedAssets.paymentAnnuallyLKR")} *
                    </Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-3 rounded-full bg-[#F4F4F4] pl-4"
                      value={paymentAnnually}
                      onChangeText={(text) =>
                        setPaymentAnnually(formatCurrency(text.trimStart()))
                      }
                      keyboardType="numeric"
                      placeholder={t("FixedAssets.enterPaymentAnnuallyLKR")}
                    />
                    <ErrorText field="paymentAnnually" />
                  </View>
                )}

                {/* General Condition */}
                <Text className="mt-4 text-sm pb-2">
                  {t("FixedAssets.generalCondition")} *
                </Text>
                <SelectorButton
                  label={getLabel(generalConditionOptions, generalCondition)}
                  placeholder={t("FixedAssets.selectGeneralCondition")}
                  onPress={() => {
                    Keyboard.dismiss();
                    setModalGeneralCondition(true);
                  }}
                />
                <ErrorText field="generalCondition" />
              </View>
            )}

            {/*  Save button */}
            <View className="flex-1 items-center pt-8 mb-16 ml-10 mr-10">
              <TouchableOpacity
                className="bg-gray-900 p-4 rounded-3xl mb-6 h-13 w-72"
                onPress={submitData}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white text-base text-center">
                    {t("FixedAssets.save")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default AddAsset;
