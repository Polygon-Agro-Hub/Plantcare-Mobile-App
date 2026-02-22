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
import { RootStackParamList } from "../types";
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
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import type { RootState } from "@/services/reducxStore";
import GlobalSearchModal from "@/component/common/GlobalSearchModal";
import { MaterialIcons } from "@expo/vector-icons";

type FarmAddFixAssertNavigationProp = StackNavigationProp<
  RootStackParamList,
  "FarmAddFixAssert"
>;
import Icon from "react-native-vector-icons/Ionicons";

interface FarmAddFixAssertProps {
  navigation: FarmAddFixAssertNavigationProp;
}
interface Farm {
  id: number;
  userId: number;
}

type RouteParams = {
  farmId: number;
  farmName: string;
};
interface UserData {
  role: string;
}

// ─── Reusable dropdown trigger button ────────────────────────────────────────
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
      borderRadius: 30,
      paddingHorizontal: 12,
      paddingVertical: 14,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <Text style={{ color: value ? "#111827" : "#6B7280", fontSize: 14 }}>
      {value || placeholder}
    </Text>
    <MaterialIcons name="keyboard-arrow-down" size={20} color="#6B7280" />
  </TouchableOpacity>
);

const FarmAddFixAssert: React.FC<FarmAddFixAssertProps> = ({ navigation }) => {
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
  const [annualpermit, setAnnualpermit] = useState("");
  const [annualpayment, setAnnualpayment] = useState("");
  const [othermachine, setOthermachene] = useState("");
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
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [durationYears, setDurationYears] = useState("");
  const [durationMonths, setDurationMonths] = useState("");
  const [leastAmountAnnually, setLeastAmountAnnually] = useState("");
  const [permitFeeAnnually, setPermitFeeAnnually] = useState("");
  const [paymentAnnually, setPaymentAnnually] = useState("");
  const [customBrand, setCustomBrand] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // ─── Active modal tracker (replaces all open* states) ───────────────────────
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const openModal = (name: string) => {
    Keyboard.dismiss();
    setActiveModal(name);
  };
  const closeModal = () => setActiveModal(null);

  // ─── Inline validation errors ────────────────────────────────────────────────
  const [errors, setErrors] = useState<Record<string, string>>({});
  const clearError = (field: string) =>
    setErrors((prev) => ({ ...prev, [field]: "" }));

  const [farms, setFarms] = useState<Farm[]>([]);
  const route = useRoute();
  const { farmId, farmName } = route.params as RouteParams;

  const user = useSelector(
    (state: RootState) => state.user.userData
  ) as UserData | null;

  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });
      return () => {
        resetForm();
        setActiveModal(null);
      };
    }, [])
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
        handleBackPress
      );
      return () => subscription.remove();
    }, [navigation])
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
    setAnnualpermit("");
    setAnnualpayment("");
    setOthermachene("");
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
    setPurchaseDate(new Date());
    setDurationYears("");
    setDurationMonths("");
    setLeastAmountAnnually("");
    setPermitFeeAnnually("");
    setPaymentAnnually("");
    setCustomBrand("");
    setErrors({});
  };

  // ─── Data definitions ────────────────────────────────────────────────────────

  const categoryOptions = [
    { label: t("FixedAssets.buildingandInfrastructures"), value: "Building and Infrastructures" },
    { label: t("FixedAssets.machineandVehicles"), value: "Machine and Vehicles" },
    { label: t("FixedAssets.land"), value: "Land" },
    { label: t("FixedAssets.toolsandEquipments"), value: "Tools" },
  ];

  const ownershipOptions = [
    { label: t("FixedAssets.ownBuilding"), value: "Own Building (with title ownership)" },
    { label: t("FixedAssets.leasedBuilding"), value: "Leased Building" },
    { label: t("FixedAssets.permitBuilding"), value: "Permitted Building" },
    { label: t("FixedAssets.sharedOwnership"), value: "Shared / No Ownership" },
  ];

  const landOwnershipOptions = [
    { label: t("FixedAssets.OwnLand"), value: "Own" },
    { label: t("FixedAssets.LeaseLand"), value: "Lease" },
    { label: t("FixedAssets.PermittedLand"), value: "Permitted" },
    { label: t("FixedAssets.SharedOwnership"), value: "Shared" },
  ];

  const buildingTypeOptions = [
    { label: t("FixedAssets.barn"), value: "Barn" },
    { label: t("FixedAssets.silo"), value: "Silo" },
    { label: t("FixedAssets.greenhouseStructure"), value: "Greenhouse structure" },
    { label: t("FixedAssets.storageFacility"), value: "Storage facility" },
    { label: t("FixedAssets.storageShed"), value: "Storage shed" },
    { label: t("FixedAssets.processingFacility"), value: "Processing facility" },
    { label: t("FixedAssets.packingShed"), value: "Packing shed" },
    { label: t("FixedAssets.dairyParlor"), value: "Dairy parlor" },
    { label: t("FixedAssets.poultryHouse"), value: "Poultry house" },
    { label: t("FixedAssets.livestockShelter"), value: "Livestock shelter" },
  ];

  const generalConditionOptions = [
    { label: t("FixedAssets.good"), value: "Good" },
    { label: t("FixedAssets.average"), value: "Average" },
    { label: t("FixedAssets.poor"), value: "Poor" },
  ];

  const machineAssetOptions = [
    { label: t("FixedAssets.Tractors"), value: "Tractors" },
    { label: t("FixedAssets.Rotavator"), value: "Rotavator" },
    { label: t("FixedAssets.CombineHarvesters"), value: "Combine Harvesters" },
    { label: t("FixedAssets.Transplanter"), value: "Transplanter" },
    { label: t("FixedAssets.TillageEquipment"), value: "Tillage Equipment" },
    { label: t("FixedAssets.SowingEquipment"), value: "Sowing Equipment" },
    { label: t("FixedAssets.HarvestingEquipment"), value: "Harvesting Equipment" },
    { label: t("FixedAssets.ThreshersReaperBinders"), value: "Threshers, Reaper, Binders" },
    { label: t("FixedAssets.CleaningGradingEquipment"), value: "Cleaning, Grading and Weighing Equipment" },
    { label: t("FixedAssets.Weeding"), value: "Weeding" },
    { label: t("FixedAssets.Sprayers"), value: "Sprayers" },
    { label: t("FixedAssets.ShellingGrindingMachine"), value: "Shelling and Grinding Machine" },
    { label: t("FixedAssets.Sowing"), value: "Sowing" },
  ];

  const toolAssetOptions = [
    { label: t("FixedAssets.handFork"), value: "Hand Fork" },
    { label: t("FixedAssets.cuttingKnife"), value: "Cutting knife" },
    { label: t("FixedAssets.ilukKaththa"), value: "Iluk kaththa" },
    { label: t("FixedAssets.kaththa"), value: "Kaththa" },
    { label: t("FixedAssets.karaDigaManna"), value: "Kara diga manna" },
    { label: t("FixedAssets.coconutHarvestingKnife"), value: "Coconut harvesting knife" },
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
    { label: t("FixedAssets.dripIrrigationSystem"), value: "Drip Irrigation system" },
    { label: t("FixedAssets.sprinklerIrrigationSystem"), value: "Sprinkler Irrigation system" },
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
    { label: t("FixedAssets.JohnPiperInternational"), value: "John Piper International" },
    { label: t("FixedAssets.Dinapala"), value: "Dinapala" },
    { label: t("FixedAssets.ANTON"), value: "ANTON" },
    { label: t("FixedAssets.ARPICO"), value: "ARPICO" },
    { label: t("FixedAssets.Slon"), value: "S-lon" },
    { label: t("FixedAssets.Singer"), value: "Singer" },
    { label: t("FixedAssets.INGCO"), value: "INGCO" },
    { label: t("FixedAssets.Jinasena"), value: "Jinasena" },
    { label: t("FixedAssets.other"), value: "Other" },
  ];

  const assetTypesForAssets: Record<string, { label: string; value: string }[]> = {
    Tractors: [
      { label: t("FixedAssets.2WD"), value: "2WD" },
      { label: t("FixedAssets.4WD"), value: "4WD" },
      { label: t("FixedAssets.other"), value: "Other" },
    ],
    Transplanter: [
      { label: t("FixedAssets.Paddytransplanter"), value: "Paddy transplanter" },
      { label: t("FixedAssets.other"), value: "Other" },
    ],
    "Harvesting Equipment": [
      { label: t("FixedAssets.Sugarcaneharvester"), value: "Sugarcane harvester" },
      { label: t("FixedAssets.Staticshedder"), value: "Static shedder" },
      { label: t("FixedAssets.Minicombineharvester"), value: "Mini combine harvester" },
      { label: t("FixedAssets.RiceCombineharvester"), value: "Rice Combine harvester" },
      { label: t("FixedAssets.Paddyharvester"), value: "Paddy harvester" },
      { label: t("FixedAssets.Maizeharvester"), value: "Maize harvester" },
      { label: t("FixedAssets.other"), value: "Other" },
    ],
    "Cleaning, Grading and Weighing Equipment": [
      { label: t("FixedAssets.Seperator"), value: "Seperator" },
      { label: t("FixedAssets.CentrifugalStierMachine"), value: "Centrifugal Stier Machine" },
      { label: t("FixedAssets.GrainClassifierSeperator"), value: "Grain Classifier Seperator" },
      { label: t("FixedAssets.DestonerMachine"), value: "Destoner Machine" },
      { label: t("FixedAssets.other"), value: "Other" },
    ],
    Sprayers: [
      { label: t("FixedAssets.KnapsackSprayer"), value: "Knapsack Sprayer" },
      { label: t("FixedAssets.ChemicalSprayer"), value: "Chemical Sprayer" },
      { label: t("FixedAssets.MistBlower"), value: "Mist Blower" },
      { label: t("FixedAssets.Environmentalfriendlysprayer"), value: "Environmental friendly sprayer" },
      { label: t("FixedAssets.Dronesprayer"), value: "Drone sprayer" },
      { label: t("FixedAssets.PressureSprayer"), value: "Pressure Sprayer" },
      { label: t("FixedAssets.other"), value: "Other" },
    ],
  };

  const brandTypesForAssets: Record<string, { label: string; value: string }[]> = {
    Tractors: [
      { label: t("FixedAssets.EKubota"), value: "E Kubota EK3 - 471 Hayles" },
      { label: t("FixedAssets.KubotaL4508"), value: "Kubota L4508 4wd Tractor Hayles" },
      { label: t("FixedAssets.KubotaL3408"), value: "Kubota L3408 4wd Tractor - Hayles" },
      { label: t("FixedAssets.Tafe"), value: "Tafe - Browns" },
      { label: t("FixedAssets.MasseyFerguson"), value: "Massey Ferguson - Browns" },
      { label: t("FixedAssets.Yanmar"), value: "Yanmar - Browns" },
      { label: t("FixedAssets.Sumo"), value: "Sumo - Browns" },
      { label: t("FixedAssets.Sifang"), value: "Sifang - Browns" },
      { label: t("FixedAssets.Uikyno"), value: "Uikyno - Browns" },
      { label: t("FixedAssets.ShakthimanBrowns"), value: "Shakthiman - Browns" },
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
      { label: t("FixedAssets.ShaktimanRotavator"), value: "Shaktiman Fighter Rotavator" },
      { label: t("FixedAssets.other"), value: "Other" },
    ],
    "Combine Harvesters": [
      { label: t("FixedAssets.AgrotechKool"), value: "Agrotech Kool Combine Harvester - Hayleys" },
      { label: t("FixedAssets.AgrotechEco"), value: "Agrotech Eco Combine Harvester - Hayleys" },
      { label: t("FixedAssets.KubotaDC70G"), value: "Kubota DC-70G Plus Combine Harvester - Hayleys" },
      { label: t("FixedAssets.other"), value: "Other" },
    ],
    Transplanter: [
      { label: t("FixedAssets.KubotaNSP4W"), value: "Kubota NSP - 4W Rice Transplanter - Hayleys" },
      { label: t("FixedAssets.TransplantersDimo"), value: "Transplanters - Dimo" },
      { label: t("FixedAssets.ARBOS"), value: "ARBOS" },
      { label: t("FixedAssets.NationalTransplanter"), value: "National" },
      { label: t("FixedAssets.other"), value: "Other" },
    ],
    "Tillage Equipment": [
      { label: t("FixedAssets.TyneCultivator"), value: "13 Tyne Cultivator Spring Loaded - ME" },
      { label: t("FixedAssets.TerracerBlade"), value: "Terracer Blade/Leveller ME" },
      { label: t("FixedAssets.RotaryTiller"), value: "Rotary Tiller - ME" },
      { label: t("FixedAssets.PowerHarrow"), value: "Power harrow - ME" },
      { label: t("FixedAssets.DiscRidger"), value: "Mounted Disc Ridger - ME" },
      { label: t("FixedAssets.DiscHarrow"), value: "Disc Harrow Tractor Mounted - ME" },
      { label: t("FixedAssets.DiskPlough"), value: "Disk Plough - ME" },
      { label: t("FixedAssets.MiniTiller"), value: "Mini Tiller" },
      { label: t("FixedAssets.HandPlough"), value: "Hand plough" },
      { label: t("FixedAssets.TineTiller"), value: "Tine tiller" },
      { label: t("FixedAssets.Browns"), value: "Browns" },
      { label: t("FixedAssets.Hayles"), value: "Hayles" },
      { label: t("FixedAssets.Dimo"), value: "Dimo" },
      { label: t("FixedAssets.other"), value: "Other" },
    ],
    "Sowing Equipment": [
      { label: t("FixedAssets.SeedSowingMachine"), value: "Seed Sowing Machine - ME" },
      { label: t("FixedAssets.other"), value: "Other" },
    ],
    "Harvesting Equipment": [
      { label: t("FixedAssets.CombineHarvesterME"), value: "Combine harvester - ME" },
      { label: t("FixedAssets.BattaHarvester"), value: "4LZ 3.0 Batta Harvester" },
      { label: t("FixedAssets.4LZ6"), value: "4LZ 6.0P Combine Harvester" },
      { label: t("FixedAssets.4LZ4"), value: "4LZ 4.0E Combine Harvester" },
      { label: t("FixedAssets.Browns"), value: "Browns" },
      { label: t("FixedAssets.Hayles"), value: "Hayles" },
      { label: t("FixedAssets.YanmarBrowns"), value: "Yanmar - Browns" },
      { label: t("FixedAssets.TAF360"), value: "360 TAF" },
      { label: t("FixedAssets.AGRIUNNION"), value: "AGRIUNNION" },
      { label: t("FixedAssets.Kartar"), value: "KARTAR" },
      { label: t("FixedAssets.other"), value: "Other" },
    ],
    "Threshers, Reaper, Binders": [
      { label: t("FixedAssets.MiniCombineCutter"), value: "Mini Combine Cutter Thresher - ME" },
      { label: t("FixedAssets.MultiCropCutter"), value: "Multi Crop Cutter Thresher - ME" },
      { label: t("FixedAssets.other"), value: "Other" },
    ],
    "Cleaning, Grading and Weighing Equipment": [
      { label: t("FixedAssets.GrillMagneticSeparator"), value: "Grill Type Magnetic Separator - ME" },
      { label: t("FixedAssets.VibrioSeparator"), value: "Vibrio Separator Machine - ME" },
      { label: t("FixedAssets.CentrifugalStifer"), value: "Centrifugal Stifer Machine - ME" },
      { label: t("FixedAssets.IntensiveScourer"), value: "Intensive Scourer - ME" },
      { label: t("FixedAssets.GrainClassifier"), value: "Grain Classifier Separator - ME" },
      { label: t("FixedAssets.GrainCleaningMachine"), value: "Grain Cleaning Machine - ME" },
      { label: t("FixedAssets.DestonerMachineME"), value: "Destoner Machine - ME" },
      { label: t("FixedAssets.Browns"), value: "Browns" },
      { label: t("FixedAssets.Hayles"), value: "Hayles" },
      { label: t("FixedAssets.other"), value: "Other" },
    ],
    Weeding: [
      { label: t("FixedAssets.FarmWeedingDitching"), value: "FarmWeeding Ditching - ME" },
      { label: t("FixedAssets.Slasher"), value: "Slasher" },
      { label: t("FixedAssets.Browns"), value: "Browns" },
      { label: t("FixedAssets.Hayles"), value: "Hayles" },
      { label: t("FixedAssets.Dimo"), value: "Dimo" },
      { label: t("FixedAssets.other"), value: "Other" },
    ],
    Sprayers: [
      { label: t("FixedAssets.KnapsackPowerSprayer"), value: "Knapsack Power Sprayer - ME" },
      { label: t("FixedAssets.OregonSprayer"), value: "Oregon Sprayer" },
      { label: t("FixedAssets.ChemicalSprayers"), value: "Chemical Sprayer" },
      { label: t("FixedAssets.MistBlowers"), value: "Mist Blower" },
      { label: t("FixedAssets.DBL"), value: "DBL" },
      { label: t("FixedAssets.Browns"), value: "Browns" },
      { label: t("FixedAssets.Hayles"), value: "Hayles" },
      { label: t("FixedAssets.NationalTransplanter"), value: "National" },
      { label: t("FixedAssets.ARBOS"), value: "ARBOS" },
      { label: t("FixedAssets.Gardena"), value: "Gardena" },
      { label: t("FixedAssets.TractorMountedSprayer"), value: "Tractor Mounted Sprayer - ME" },
      { label: t("FixedAssets.other"), value: "Other" },
    ],
    "Shelling and Grinding Machine": [
      { label: t("FixedAssets.MaizeProcessingMachine"), value: "Maize Processing Machine - ME" },
      { label: t("FixedAssets.MaizeCoenThresher"), value: "Maize Coen Thresher - ME" },
      { label: t("FixedAssets.other"), value: "Other" },
    ],
    Sowing: [
      { label: t("FixedAssets.SteelSeedSowing"), value: "Steel and Plastic Seed Sowing Machine" },
      { label: t("FixedAssets.TractorMountedSpray"), value: "Tractor Mounted Sprayer" },
      { label: t("FixedAssets.other"), value: "Other" },
    ],
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  const getLabelFromOptions = (
    options: { label: string; value: string }[],
    value: string
  ) => options.find((o) => o.value === value)?.label || "";

  const warrantystatus = [
    { key: "1", value: "yes" },
    { key: "2", value: "no" },
  ];

  const onPurchasedDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowPurchasedDatePicker(false);
    if (selectedDate) setPurchasedDate(selectedDate);
  };

  const onStartDateChange = (selectedDate: any) => {
    const today = new Date();
    if (selectedDate > today) {
      Alert.alert(
        t("FixedAssets.sorry"),
        t("FixedAssets.issuedDateCannotBeFuture"),
        [{ text: t("Main.ok") }]
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
        t("FixedAssets.issuedDateCannotBeFuture"),
        [{ text: t("Main.ok") }]
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

  // ─── Validation & Submit ─────────────────────────────────────────────────────

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
          [{ text: t("Farms.okButton") }]
        );
        return;
      }
    }

    if (!category) newErrors.category = t("FixedAssets.selectCategory");

    if (category === "Building and Infrastructures") {
      if (!type) newErrors.type = t("FixedAssets.selectAssetType");
      if (!floorArea) newErrors.floorArea = t("FixedAssets.enterFloorArea");
      if (!ownership) newErrors.ownership = t("FixedAssets.selectOwnershipCategory");
      if (!generalCondition) newErrors.generalCondition = t("FixedAssets.selectGeneralCondition");
      if (ownership === "Own Building (with title ownership)" && !estimateValue)
        newErrors.estimateValue = t("FixedAssets.enterEstimatedBuildingValueLKR");
      if (ownership === "Leased Building") {
        if (!startDate) newErrors.startDate = t("FixedAssets.enterDuration");
        if (!durationYears) newErrors.duration = t("FixedAssets.enterDuration");
        if (!leastAmountAnnually) newErrors.leastAmountAnnually = t("FixedAssets.enterLeasedAmountAnnuallyLKR");
      }
      if (ownership === "Permitted Building") {
        if (!lbissuedDate) newErrors.lbissuedDate = t("FixedAssets.selectIssuedDate");
        if (!permitFeeAnnually) newErrors.permitFeeAnnually = t("FixedAssets.enterPermitAnnuallyLKR");
      }
      if (ownership === "Shared / No Ownership" && !paymentAnnually)
        newErrors.paymentAnnually = t("FixedAssets.enterPaymentAnnuallyLKR");
    }

    if (category === "Land") {
      if (!landownership) newErrors.landownership = t("FixedAssets.selectLandCategory");
      const nonZeroFields = [extentp || "0", extentac || "0", extentha || "0"].filter(
        (f) => f && f !== "0"
      );
      if (nonZeroFields.length === 0) newErrors.extent = t("FixedAssets.enterFloorArea");
      if (!landFenced) newErrors.landFenced = t("FixedAssets.isLandFenced");
      if (!perennialCrop) newErrors.perennialCrop = t("FixedAssets.areThereAnyPerennialCrops");
      if (landownership === "Own" && !estimateValue)
        newErrors.estimateValue = t("FixedAssets.enterEstimatedBuildingValueLKR");
      if (landownership === "Lease") {
        const nonZeroDuration = [durationMonths || "0", durationYears || "0"].filter(
          (f) => f && f !== "0"
        );
        if (nonZeroDuration.length === 0) newErrors.duration = t("FixedAssets.enterDuration");
        if (!leastAmountAnnually) newErrors.leastAmountAnnually = t("FixedAssets.enterLeasedAmountAnnuallyLKR");
      }
      if (landownership === "Permitted") {
        if (!issuedDate) newErrors.issuedDate = t("FixedAssets.selectIssuedDate");
        if (!permitFeeAnnually) newErrors.permitFeeAnnually = t("FixedAssets.enterPermitFeeAnnuallyLKR");
      }
      if (landownership === "Shared" && !paymentAnnually)
        newErrors.paymentAnnually = t("FixedAssets.enterPaymentAnnuallyLKR");
    }

    if (category === "Machine and Vehicles") {
      if (!asset) newErrors.asset = t("FixedAssets.selectAsset");
      const brandOnlyAssets = [
        "Rotavator", "Tillage Equipment", "Threshers, Reaper, Binders",
        "Weeding", "Shelling and Grinding Machine", "Sowing",
        "Combine Harvesters", "Sowing Equipment",
      ];
      const typeAndBrandAssets = [
        "Tractors", "Cleaning, Grading and Weighing Equipment",
        "Sprayers", "Transplanter", "Harvesting Equipment",
      ];
      if (asset && brandOnlyAssets.includes(asset) && !brand)
        newErrors.brand = t("FixedAssets.selectBrand");
      if (asset && typeAndBrandAssets.includes(asset)) {
        if (!assetType) newErrors.assetType = t("FixedAssets.selectAssetType");
        if (!brand) newErrors.brand = t("FixedAssets.selectBrand");
      }
      if (assetType === "Other" && !mentionOther)
        newErrors.mentionOther = t("FixedAssets.mentionOther");
      if (brand === "Other" && !customBrand)
        newErrors.customBrand = t("FixedAssets.mentionOtherBrand");
      if (!numberOfUnits) newErrors.numberOfUnits = t("FixedAssets.enterNumberofUnits");
      if (!unitPrice) newErrors.unitPrice = t("FixedAssets.enterUnitPrice");
      if (!warranty) newErrors.warranty = t("FixedAssets.selectWarranty");
      if (warranty === "yes" && (!purchasedDate || !expireDate))
        newErrors.warrantyDates = t("FixedAssets.warrantyDatesRequired");
    }

    if (category === "Tools") {
      if (!assetname) newErrors.assetname = t("FixedAssets.selectAsset");
      if (assetname === "Other" && !othertool)
        newErrors.othertool = t("FixedAssets.mentionOther");
      if (!toolbrand) newErrors.toolbrand = t("FixedAssets.selectBrand");
      if (toolbrand === "Other" && !customBrand)
        newErrors.customBrand = t("FixedAssets.mentionOtherBrand");
      if (!numberOfUnits) newErrors.numberOfUnits = t("FixedAssets.enterNumberofUnits");
      if (!unitPrice) newErrors.unitPrice = t("FixedAssets.enterUnitPrice");
      if (!warranty) newErrors.warranty = t("FixedAssets.selectWarranty");
      if (warranty === "yes" && (!purchasedDate || !expireDate))
        newErrors.warrantyDates = t("FixedAssets.warrantyDatesRequired");
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
        category === "Tools" && assetname === "Other" ? othertool : mentionOther,
      brand: customBrand || brand,
      numberOfUnits,
      unitPrice,
      totalPrice,
      warranty,
      issuedDate,
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
    };

    try {
      const token = await AsyncStorage.getItem("userToken");
      await axios.post(
        `${environment.API_BASE_URL}api/auth/fixedassets`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert(
        t("FixedAssets.success"),
        t("FixedAssets.assetAddSuccessfuly"),
        [
          {
            text: t("Main.ok"),
            onPress: () =>
              navigation.navigate("Main", {
                screen: "FarmFixDashBoard",
                params: { farmId, farmName },
              }),
          },
        ]
      );
      setLoading(false);
    } catch (error: any) {
      console.error("Error submitting data:", error);
      setLoading(false);
      Alert.alert(t("Main.error"), t("Main.somethingWentWrong"), [
        { text: t("Farms.okButton") },
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
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );
        if (response.data.status === "success") setFarms(response.data.data);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) console.error(error.response?.data);
        else if (error instanceof Error) console.error(error.message);
      }
    };
    fetchFarmData();
  }, []);

  // ─── Field Error Component ────────────────────────────────────────────────────
  const FieldError = ({ field }: { field: string }) =>
    errors[field] ? (
      <Text style={{ color: "#DC2626", fontSize: 12, marginTop: 4, marginLeft: 4 }}>
        {errors[field]}
      </Text>
    ) : null;

  // ─── Warranty section (shared between Machine and Tools) ─────────────────────
  const renderWarrantySection = () => (
    <>
      <Text className="pt-5 pb-3">{t("FixedAssets.warranty")} *</Text>
      <View className="flex-row justify-around">
        <TouchableOpacity
          onPress={() => { setWarranty("yes"); clearError("warranty"); clearError("warrantyDates"); }}
          className="flex-row items-center"
        >
          <View className={`w-5 h-5 rounded-full ${warranty === "yes" ? "bg-green-500" : "bg-gray-400"}`} />
          <Text className="ml-2">{t("FixedAssets.yes")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => { setWarranty("no"); clearError("warranty"); clearError("warrantyDates"); }}
          className="flex-row items-center"
        >
          <View className={`w-5 h-5 rounded-full ${warranty === "no" ? "bg-green-500" : "bg-gray-400"}`} />
          <Text className="ml-2">{t("FixedAssets.no")}</Text>
        </TouchableOpacity>
      </View>
      <FieldError field="warranty" />

      {warranty === "yes" && (
        <>
          {/* Purchased Date */}
          <Text className="pt-5 pb-3">{t("FixedAssets.purchasedDate")} *</Text>
          <TouchableOpacity onPress={() => setShowPurchasedDatePicker((p) => !p)}>
            <View className="border border-[#F4F4F4] p-4 rounded-full flex-row bg-gray-100 justify-between">
              <Text>{purchasedDate ? formatDate(purchasedDate) : t("CurrentAssets.purchasedate")}</Text>
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
                        Alert.alert(t("FixedAssets.sorry"), t("FixedAssets.purchaseDateCannotBeFuture"), [{ text: t("Main.ok") }]);
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
                      Alert.alert(t("FixedAssets.sorry"), t("FixedAssets.purchaseDateCannotBeFuture"), [{ text: t("Main.ok") }]);
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

          {/* Expire Date */}
          <Text className="pt-5 pb-3">{t("FixedAssets.warrantyExpireDate")} *</Text>
          <TouchableOpacity onPress={() => setShowExpireDatePicker((p) => !p)}>
            <View className="border border-[#F4F4F4] p-4 rounded-full flex-row bg-gray-100 justify-between">
              <Text>{expireDate ? formatDate(expireDate) : t("CurrentAssets.expiredate")}</Text>
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

          {errorMessage ? <Text className="text-red-500 mt-2">{errorMessage}</Text> : null}
          <FieldError field="warrantyDates" />

          {/* Warranty Status */}
          <Text className="mt-4 text-sm">{t("FixedAssets.warrantyStatus")}</Text>
          <View className="border border-[#F4F4F4] rounded-full bg-gray-100 p-2 mt-2">
            <Text
              style={{
                color:
                  purchasedDate && expireDate
                    ? expireDate.getTime() > new Date().getTime() ? "#26D041" : "#FF0000"
                    : "#6B7280",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              {purchasedDate && expireDate
                ? expireDate.getTime() > new Date().getTime()
                  ? t("FixedAssets.valid")
                  : t("FixedAssets.expired")
                : t("CurrentAssets.status")}
            </Text>
          </View>
        </>
      )}
    </>
  );

  // ─── Number of units + unit price + total (shared) ───────────────────────────
  const renderUnitsAndPrice = () => (
    <>
      <Text className="mt-4 text-sm pb-2">{t("FixedAssets.numberofUnits")} *</Text>
      <TextInput
        className="border border-[#F4F4F4] p-3 pl-4 rounded-full bg-gray-100"
        placeholder={t("FixedAssets.enterNumberofUnits")}
        value={numberOfUnits}
        onChangeText={(text) => { setNumberOfUnits(formatDecimalInput(text)); clearError("numberOfUnits"); }}
        keyboardType="numeric"
      />
      <FieldError field="numberOfUnits" />

      <Text className="mt-4 text-sm pb-2">{t("FixedAssets.unitPrice")} *</Text>
      <TextInput
        className="border border-[#F4F4F4] p-3 pl-4 rounded-full bg-gray-100"
        placeholder={t("FixedAssets.enterUnitPrice")}
        value={formatWithCommas(unitPrice)}
        onChangeText={(text) => { handleNumericInput(text, setUnitPrice); clearError("unitPrice"); }}
        keyboardType="numeric"
      />
      <FieldError field="unitPrice" />

      <Text className="mt-4 text-sm pb-2">{t("FixedAssets.totalPrice")} *</Text>
      <View className="border border-[#F4F4F4] p-4 pl-4 rounded-full bg-gray-100">
        <Text>
          {totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      </View>
    </>
  );

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      enabled
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={false} />
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 pb-20 bg-white"
          style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="flex-row justify-between mb-2">
            <TouchableOpacity
              onPress={() => navigation.navigate("FarmFixDashBoard", { farmId, farmName })}
            >
              <AntDesign
                name="left"
                size={24}
                color="#000502"
                style={{
                  paddingHorizontal: wp(3),
                  paddingVertical: hp(1.5),
                  backgroundColor: "#F6F6F680",
                  borderRadius: 50,
                }}
              />
            </TouchableOpacity>
            <View className="flex-1 items-center">
              <Text className="text-lg font-bold pt-2 -ml-[15%]">{farmName}</Text>
            </View>
          </View>

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
                  {t("FixedAssets.currentAssets")} *
                </Text>
                <View className="border-t-[2px] border-[#D9D9D9]" />
              </TouchableOpacity>
            </View>
            <View className="w-1/2">
              <TouchableOpacity>
                <Text className="text-black text-center font-semibold text-lg">
                  {t("FixedAssets.fixedAssets")} *
                </Text>
                <View className="border-t-[2px] border-black" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="p-4">
            {/* ── Category ── */}
            <Text className="mt-4 text-sm pb-2">{t("CurrentAssets.category")} *</Text>
            <DropdownButton
              value={getLabelFromOptions(categoryOptions, category)}
              placeholder={t("FixedAssets.selectCategory")}
              onPress={() => openModal("category")}
              hasError={!!errors.category}
            />
            <FieldError field="category" />

            {/* ════════════════ CATEGORY SECTIONS ════════════════ */}
            {category === "Machine and Vehicles" ? (
              <View className="flex-1">
                {/* Asset */}
                <Text className="mt-4 text-sm pb-2">{t("FixedAssets.asset")} *</Text>
                <DropdownButton
                  value={getLabelFromOptions(machineAssetOptions, asset)}
                  placeholder={t("FixedAssets.selectAsset")}
                  onPress={() => openModal("machineAsset")}
                  hasError={!!errors.asset}
                />
                <FieldError field="asset" />

                {/* Asset Type */}
                {asset && assetTypesForAssets[asset]?.length > 0 && (
                  <>
                    <Text className="mt-4 text-sm pb-2">{t("FixedAssets.selectAssetType")} *</Text>
                    <DropdownButton
                      value={getLabelFromOptions(assetTypesForAssets[asset] || [], assetType)}
                      placeholder={t("FixedAssets.selectAssetType")}
                      onPress={() => openModal("assetType")}
                      hasError={!!errors.assetType}
                    />
                    <FieldError field="assetType" />
                  </>
                )}

                {assetType === "Other" && (
                  <View className="mt-4">
                    <Text>{t("FixedAssets.Mention")}</Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-2 rounded-full mt-2 bg-gray-100"
                      placeholder={t("FixedAssets.Mention")}
                      value={mentionOther}
                      onChangeText={(v) => { setMentionOther(v); clearError("mentionOther"); }}
                    />
                    <FieldError field="mentionOther" />
                  </View>
                )}

                {/* Brand */}
                {asset && brandTypesForAssets[asset]?.length > 0 && (
                  <>
                    <Text className="mt-4 text-sm pb-2">{t("FixedAssets.selectBrand")} *</Text>
                    <DropdownButton
                      value={getLabelFromOptions(brandTypesForAssets[asset] || [], brand)}
                      placeholder={t("FixedAssets.selectBrand")}
                      onPress={() => openModal("machineBrand")}
                      hasError={!!errors.brand}
                    />
                    <FieldError field="brand" />
                  </>
                )}

                {brand === "Other" && (
                  <View>
                    <Text className="mt-4 text-sm pb-2">{t("FixedAssets.mentionOtherBrand")} *</Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-4 rounded-full bg-gray-100 pl-4"
                      placeholder={t("FixedAssets.enterCustomBrand")}
                      value={customBrand}
                      onChangeText={(v) => { setCustomBrand(v); clearError("customBrand"); }}
                    />
                    <FieldError field="customBrand" />
                  </View>
                )}

                {renderUnitsAndPrice()}
                {renderWarrantySection()}
              </View>

            ) : category === "Land" ? (
              <View>
                {/* Extent */}
                <Text className="mt-4 text-sm pb-2">{t("FixedAssets.extent")} *</Text>
                <View className="flex-row items-center justify-between w-full">
                  {[
                    { label: t("FixedAssets.ha"), value: extentha, setter: setExtentha },
                    { label: t("FixedAssets.ac"), value: extentac, setter: setExtentac },
                    { label: t("FixedAssets.p"), value: extentp, setter: setExtentp },
                  ].map(({ label, value, setter }) => (
                    <View key={label} className="flex-row items-center space-x-2">
                      <Text className="text-right">{label}</Text>
                      <TextInput
                        className="border border-[#F4F4F4] p-2 px-4 w-20 rounded-full bg-gray-100"
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
                <Text className="mt-4 text-sm pb-2">{t("FixedAssets.selectLandCategory")} *</Text>
                <DropdownButton
                  value={getLabelFromOptions(landOwnershipOptions, landownership)}
                  placeholder={t("FixedAssets.selectLandCategory")}
                  onPress={() => openModal("landOwnership")}
                  hasError={!!errors.landownership}
                />
                <FieldError field="landownership" />

                {/* Own */}
                {landownership === "Own" && (
                  <View>
                    <Text className="mt-4 text-sm pb-2">{t("FixedAssets.estimateValue")} *</Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-3 rounded-full bg-[#F4F4F4] pl-4"
                      placeholder={t("FixedAssets.estimatedBuildingValueLKR")}
                      value={formatWithCommas(estimateValue)}
                      onChangeText={(text) => { handleNumericInput(text, setEstimatedValue); clearError("estimateValue"); }}
                      keyboardType="numeric"
                    />
                    <FieldError field="estimateValue" />
                  </View>
                )}

                {/* Lease */}
                {landownership === "Lease" && (
                  <View>
                    <Text className="mt-4 pb-2">{t("FixedAssets.startDate")} *</Text>
                    <TouchableOpacity onPress={() => setShowStartDatePicker((p) => !p)}>
                      <View className="border border-[#F4F4F4] p-4 rounded-full flex-row bg-gray-100 justify-between">
                        <Text>{startDate ? formatDate(startDate) : t("Cropenroll.selectStartDate")}</Text>
                        <Icon name="calendar-outline" size={20} color="#6B7280" />
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
                              if (event.type === "set") { onStartDateChange(selectedDate); setShowStartDatePicker(false); }
                              else setShowStartDatePicker(false);
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
                            if (event.type === "set") { onStartDateChange(selectedDate); setShowStartDatePicker(false); }
                            else setShowStartDatePicker(false);
                          }}
                          maximumDate={new Date()}
                        />
                      ))}

                    <Text className="mt-4 text-sm pb-2">{t("FixedAssets.duration")} *</Text>
                    <View className="items-center flex-row justify-center">
                      <Text className="w-[20%] text-right pr-2">{t("FixedAssets.years")}</Text>
                      <TextInput
                        className="border border-[#F4F4F4] p-2 w-[30%] px-4 rounded-full bg-gray-100"
                        value={durationYears}
                        onChangeText={(text) => { setDurationYears(text.replace(/[-.*#,]/g, "") === "0" ? "" : text.replace(/[-.*#,]/g, "")); clearError("duration"); }}
                        keyboardType="numeric"
                      />
                      <Text className="w-[20%] text-right pr-2">{t("FixedAssets.months")}</Text>
                      <TextInput
                        className="border border-[#F4F4F4] p-2 w-[30%] px-4 rounded-full bg-[#F4F4F4]"
                        value={durationMonths}
                        onChangeText={(text) => {
                          const c = text.replace(/[-.*#]/g, "");
                          const n = parseInt(c, 10);
                          if (c === "" || (n >= 0 && n <= 12)) { setDurationMonths(c); clearError("duration"); }
                        }}
                        keyboardType="numeric"
                        maxLength={2}
                      />
                    </View>
                    <FieldError field="duration" />

                    <Text className="pb-2 mt-4 text-sm">{t("FixedAssets.leasedAmountAnnually")} *</Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-3 rounded-full bg-[#F4F4F4] pl-4"
                      placeholder={t("FixedAssets.enterLeasedAmountAnnuallyLKR")}
                      value={formatWithCommas(leastAmountAnnually)}
                      onChangeText={(text) => { handleNumericInput(text, setLeastAmountAnnually); clearError("leastAmountAnnually"); }}
                      keyboardType="numeric"
                    />
                    <FieldError field="leastAmountAnnually" />
                  </View>
                )}

                {/* Permitted */}
                {landownership === "Permitted" && (
                  <View className="mt-4">
                    <Text className="pb-2">{t("FixedAssets.issuedDate")} *</Text>
                    <TouchableOpacity onPress={() => setShowIssuedDatePicker((p) => !p)}>
                      <View className="border border-[#F4F4F4] p-4 rounded-full flex-row bg-[#F4F4F4] justify-between">
                        <Text>{issuedDate ? formatDate(issuedDate) : t("Cropenroll.selectStartDate")}</Text>
                        <Icon name="calendar-outline" size={20} color="#6B7280" />
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
                    <Text className="pb-2 mt-4">{t("FixedAssets.permitAnnually")} *</Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-3 rounded-full bg-[#F4F4F4] pl-4"
                      placeholder={t("FixedAssets.enterPermitAnnuallyLKR")}
                      value={formatWithCommas(permitFeeAnnually)}
                      onChangeText={(text) => { handleNumericInput(text, setPermitFeeAnnually); clearError("permitFeeAnnually"); }}
                      keyboardType="numeric"
                    />
                    <FieldError field="permitFeeAnnually" />
                  </View>
                )}

                {/* Shared */}
                {landownership === "Shared" && (
                  <View className="mt-4">
                    <Text className="pb-2">{t("FixedAssets.paymentAnnually")} *</Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-3 rounded-full bg-[#F4F4F4] pl-4"
                      value={formatWithCommas(paymentAnnually)}
                      onChangeText={(text) => { handleNumericInput(text, setPaymentAnnually); clearError("paymentAnnually"); }}
                      keyboardType="numeric"
                      placeholder={t("FixedAssets.enterPaymentAnnuallyLKR")}
                    />
                    <FieldError field="paymentAnnually" />
                  </View>
                )}

                {/* Land Fenced */}
                <View className="justify-center">
                  <Text className="pt-5 pb-3 font-bold">{t("FixedAssets.isLandFenced")} *</Text>
                  <View className="flex-row justify-around mb-5">
                    {["yes", "no"].map((opt) => (
                      <TouchableOpacity
                        key={opt}
                        onPress={() => { setLandFenced(opt); clearError("landFenced"); }}
                        className="flex-row items-center"
                      >
                        <View className={`w-5 h-5 rounded-full ${landFenced === opt ? "bg-green-500" : "bg-gray-400"}`} />
                        <Text className="ml-2">{t(`FixedAssets.${opt}`)}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <FieldError field="landFenced" />

                  <Text className="pt-5 pb-3 font-bold">{t("FixedAssets.areThereAnyPerennialCrops")} *</Text>
                  <View className="flex-row justify-around mb-5">
                    {["yes", "no"].map((opt) => (
                      <TouchableOpacity
                        key={opt}
                        onPress={() => { setPerennialCrop(opt); clearError("perennialCrop"); }}
                        className="flex-row items-center"
                      >
                        <View className={`w-5 h-5 rounded-full ${perennialCrop === opt ? "bg-green-500" : "bg-gray-400"}`} />
                        <Text className="ml-2">{t(`FixedAssets.${opt}`)}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <FieldError field="perennialCrop" />
                </View>
              </View>

            ) : category === "Tools" ? (
              <View className="flex-1">
                <Text className="mt-4 text-sm">{t("FixedAssets.asset")} *</Text>
                <View className="mt-2">
                  <DropdownButton
                    value={getLabelFromOptions(toolAssetOptions, assetname)}
                    placeholder={t("FixedAssets.selectAsset")}
                    onPress={() => openModal("toolAsset")}
                    hasError={!!errors.assetname}
                  />
                </View>
                <FieldError field="assetname" />

                {assetname === "Other" && (
                  <View>
                    <Text className="mt-4 text-sm pb-2">{t("FixedAssets.mentionOther")} *</Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-4 rounded-full bg-[#F4F4F4] pl-4"
                      value={othertool}
                      onChangeText={(v) => { setOthertool(v); clearError("othertool"); }}
                      placeholder={t("FixedAssets.mentionOther")}
                    />
                    <FieldError field="othertool" />
                  </View>
                )}

                <Text className="mt-4 text-sm pb-2">{t("FixedAssets.brand")} *</Text>
                <DropdownButton
                  value={getLabelFromOptions(toolBrandOptions, toolbrand)}
                  placeholder={t("FixedAssets.selectBrand")}
                  onPress={() => openModal("toolBrand")}
                  hasError={!!errors.toolbrand}
                />
                <FieldError field="toolbrand" />

                {toolbrand === "Other" && (
                  <View>
                    <Text className="mt-4 text-sm pb-2">{t("FixedAssets.mentionOtherBrand")} *</Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-4 rounded-full bg-[#F4F4F4] pl-4"
                      placeholder={t("FixedAssets.enterCustomBrand")}
                      value={customBrand}
                      onChangeText={(v) => { setCustomBrand(v); clearError("customBrand"); }}
                    />
                    <FieldError field="customBrand" />
                  </View>
                )}

                {renderUnitsAndPrice()}
                {renderWarrantySection()}
              </View>

            ) : (

            /* ════ BUILDING AND INFRASTRUCTURES (default / else) ════ */
              <View>
                <Text className="mt-4 text-sm pb-2">{t("FixedAssets.type")} *</Text>
                <DropdownButton
                  value={getLabelFromOptions(buildingTypeOptions, type)}
                  placeholder={t("FixedAssets.selectAssetType")}
                  onPress={() => openModal("buildingType")}
                  hasError={!!errors.type}
                />
                <FieldError field="type" />

                <Text className="mt-4 text-sm pb-2">{t("FixedAssets.floorAreaSqrFt")} *</Text>
                <TextInput
                  className="border border-[#F4F4F4] p-3 pl-4 rounded-full bg-[#F4F4F4]"
                  placeholder={t("FixedAssets.enterFloorArea")}
                  value={floorArea}
                  onChangeText={(text) => { setFloorArea(formatDecimalInput(text)); clearError("floorArea"); }}
                  keyboardType="numeric"
                />
                <FieldError field="floorArea" />

                <Text className="mt-4 text-sm pb-2">{t("FixedAssets.ownership")} *</Text>
                <DropdownButton
                  value={getLabelFromOptions(ownershipOptions, ownership)}
                  placeholder={t("FixedAssets.selectOwnershipCategory")}
                  onPress={() => openModal("buildingOwnership")}
                  hasError={!!errors.ownership}
                />
                <FieldError field="ownership" />

                {/* Own Building */}
                {ownership === "Own Building (with title ownership)" && (
                  <View>
                    <Text className="mt-4 text-sm pb-2">{t("FixedAssets.estimatedBuildingValueLKR")} *</Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-3 rounded-full bg-[#F4F4F4] pl-4"
                      placeholder={t("FixedAssets.estimatedBuildingValueLKR")}
                      value={formatWithCommas(estimateValue)}
                      onChangeText={(text) => { handleNumericInput(text, setEstimatedValue); clearError("estimateValue"); }}
                      keyboardType="numeric"
                    />
                    <FieldError field="estimateValue" />
                  </View>
                )}

                {/* Leased Building */}
                {ownership === "Leased Building" && (
                  <View className="mt-4">
                    <Text className="pb-2">{t("FixedAssets.startDate")} *</Text>
                    <TouchableOpacity onPress={() => setShowStartDatePicker((p) => !p)}>
                      <View className="border border-[#F4F4F4] p-4 rounded-full flex-row bg-[#F4F4F4] justify-between">
                        <Text>{startDate ? formatDate(startDate) : t("Cropenroll.selectStartDate")}</Text>
                        <Icon name="calendar-outline" size={20} color="#6B7280" />
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
                              if (event.type === "set") { onStartDateChange(selectedDate); setShowStartDatePicker(false); }
                              else setShowStartDatePicker(false);
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
                            if (event.type === "set") { onStartDateChange(selectedDate); setShowStartDatePicker(false); }
                            else setShowStartDatePicker(false);
                          }}
                          maximumDate={new Date()}
                        />
                      ))}

                    <Text className="mt-4 text-sm pb-2">{t("FixedAssets.duration")} *</Text>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Text className="w-[20%] text-right pr-2">{t("FixedAssets.years")}</Text>
                        <TextInput
                          className="border border-[#F4F4F4] p-2 text-left px-4 rounded-full bg-[#F4F4F4] w-[30%]"
                          value={durationYears}
                          onChangeText={(text) => { setDurationYears(text.replace(/[-.*#]/g, "")); clearError("duration"); }}
                          keyboardType="numeric"
                        />
                        <Text className="w-[20%] text-right pr-2">{t("FixedAssets.months")}</Text>
                        <TextInput
                          className="border border-[#F4F4F4] p-2 w-[30%] px-4 rounded-full bg-[#F4F4F4]"
                          value={durationMonths}
                          onChangeText={(text) => {
                            const c = text.replace(/[-.*#]/g, "");
                            const n = parseInt(c, 10);
                            if (c === "" || (n >= 0 && n <= 12)) { setDurationMonths(c); clearError("duration"); }
                          }}
                          keyboardType="numeric"
                          maxLength={2}
                        />
                      </View>
                    </View>
                    <FieldError field="duration" />

                    <Text className="pt-[5%] pb-2">{t("FixedAssets.leasedAmountAnnually")} *</Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-3 rounded-full bg-[#F4F4F4] pl-4"
                      placeholder={t("FixedAssets.enterLeasedAmountAnnuallyLKR")}
                      value={formatWithCommas(leastAmountAnnually)}
                      onChangeText={(text) => { handleNumericInput(text, setLeastAmountAnnually); clearError("leastAmountAnnually"); }}
                      keyboardType="numeric"
                    />
                    <FieldError field="leastAmountAnnually" />
                  </View>
                )}

                {/* Permitted Building */}
                {ownership === "Permitted Building" && (
                  <View className="mt-4">
                    <Text className="pb-2">{t("FixedAssets.issuedDate")} *</Text>
                    <TouchableOpacity onPress={() => setShowLbIssuedDatePicker((p) => !p)}>
                      <View className="border border-[#F4F4F4] p-4 rounded-full flex-row bg-[#F4F4F4] justify-between">
                        <Text>{lbissuedDate ? formatDate(lbissuedDate) : "Select Date"}</Text>
                        <Icon name="calendar-outline" size={20} color="#6B7280" />
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
                              if (event.type === "set") { onPermitIssuedDateChange(selectedDate); setShowLbIssuedDatePicker(false); }
                              else setShowLbIssuedDatePicker(false);
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
                            if (event.type === "set") { onPermitIssuedDateChange(selectedDate); setShowLbIssuedDatePicker(false); }
                            else setShowLbIssuedDatePicker(false);
                          }}
                          maximumDate={new Date()}
                        />
                      ))}

                    <Text className="mt-4 pb-2">{t("FixedAssets.permitAnnuallyLKR")} *</Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-3 rounded-full bg-[#F4F4F4] pl-4"
                      placeholder={t("FixedAssets.enterPermitAnnuallyLKR")}
                      value={formatWithCommas(permitFeeAnnually)}
                      onChangeText={(text) => { handleNumericInput(text, setPermitFeeAnnually); clearError("permitFeeAnnually"); }}
                      keyboardType="numeric"
                    />
                    <FieldError field="permitFeeAnnually" />
                  </View>
                )}

                {/* Shared / No Ownership */}
                {ownership === "Shared / No Ownership" && (
                  <View className="mt-4">
                    <Text className="pb-2">{t("FixedAssets.paymentAnnuallyLKR")} *</Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-3 rounded-full bg-[#F4F4F4] pl-4"
                      value={formatWithCommas(paymentAnnually)}
                      onChangeText={(text) => { handleNumericInput(text, setPaymentAnnually); clearError("paymentAnnually"); }}
                      keyboardType="numeric"
                      placeholder={t("FixedAssets.enterPaymentAnnuallyLKR")}
                    />
                    <FieldError field="paymentAnnually" />
                  </View>
                )}

                {/* General Condition */}
                <Text className="mt-4 text-sm pb-2">{t("FixedAssets.generalCondition")} *</Text>
                <DropdownButton
                  value={getLabelFromOptions(generalConditionOptions, generalCondition)}
                  placeholder={t("FixedAssets.selectGeneralCondition")}
                  onPress={() => openModal("generalCondition")}
                  hasError={!!errors.generalCondition}
                />
                <FieldError field="generalCondition" />
              </View>
            )}

            {/* ── Submit Button ── */}
            <View className="flex-1 items-center pt-8 mb-16 ml-10 mr-10">
              <TouchableOpacity
                className={`${
                  category !== "Machine and Vehicles" &&
                  category !== "Tools" &&
                  warranty === "yes" &&
                  purchasedDate &&
                  expireDate &&
                  expireDate < new Date()
                    ? "bg-gray-400"
                    : "bg-gray-900"
                } p-4 rounded-3xl mb-6 h-13 w-72`}
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
                      ? t("FixedAssets.expired")
                      : t("FixedAssets.save")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* ════════════════ ALL GLOBAL SEARCH MODALS ════════════════ */}

        {/* Category */}
        <GlobalSearchModal
          visible={activeModal === "category"}
          onClose={closeModal}
          title={t("CurrentAssets.category")}
          data={categoryOptions}
          selectedItems={category ? [category] : []}
          onSelect={(items) => {
            const val = items[0] || "";
            setCategory(val);
            clearError("category");
            // Reset dependent fields
            setAsset(""); setAssetname(""); setBrand(""); setUnitPrice("");
            setNumberOfUnits(""); setWarranty(""); setOthertool("");
            setExtentac(""); setExtentp(""); setExtentha(""); setFloorArea("");
            setAnnualpayment(""); setAnnualpermit(""); setLandFenced("");
            setPerennialCrop(""); setErrors({});
          }}
          searchPlaceholder={t("SignupForum.TypeSomething")}
        />

        {/* Machine Asset */}
        <GlobalSearchModal
          visible={activeModal === "machineAsset"}
          onClose={closeModal}
          title={t("FixedAssets.asset")}
          data={machineAssetOptions}
          selectedItems={asset ? [asset] : []}
          onSelect={(items) => {
            setAsset(items[0] || "");
            setAssetType("");
            setBrand("");
            clearError("asset");
          }}
          searchPlaceholder={t("SignupForum.TypeSomething")}
        />

        {/* Asset Type (Machine) */}
        <GlobalSearchModal
          visible={activeModal === "assetType"}
          onClose={closeModal}
          title={t("FixedAssets.selectAssetType")}
          data={asset && assetTypesForAssets[asset] ? assetTypesForAssets[asset] : []}
          selectedItems={assetType ? [assetType] : []}
          onSelect={(items) => {
            setAssetType(items[0] || "");
            clearError("assetType");
          }}
          searchPlaceholder={t("SignupForum.TypeSomething")}
        />

        {/* Brand (Machine) */}
        <GlobalSearchModal
          visible={activeModal === "machineBrand"}
          onClose={closeModal}
          title={t("FixedAssets.selectBrand")}
          data={asset && brandTypesForAssets[asset] ? brandTypesForAssets[asset] : []}
          selectedItems={brand ? [brand] : []}
          onSelect={(items) => {
            setBrand(items[0] || "");
            clearError("brand");
          }}
          searchPlaceholder={t("SignupForum.TypeSomething")}
        />

        {/* Land Ownership */}
        <GlobalSearchModal
          visible={activeModal === "landOwnership"}
          onClose={closeModal}
          title={t("FixedAssets.selectLandCategory")}
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
          title={t("FixedAssets.asset")}
          data={toolAssetOptions}
          selectedItems={assetname ? [assetname] : []}
          onSelect={(items) => {
            setAssetname(items[0] || "");
            setOthertool("");
            clearError("assetname");
          }}
          searchPlaceholder={t("SignupForum.TypeSomething")}
        />

        {/* Tool Brand */}
        <GlobalSearchModal
          visible={activeModal === "toolBrand"}
          onClose={closeModal}
          title={t("FixedAssets.brand")}
          data={toolBrandOptions}
          selectedItems={toolbrand ? [toolbrand] : []}
          onSelect={(items) => {
            setToolbrand(items[0] || "");
            clearError("toolbrand");
          }}
          searchPlaceholder={t("SignupForum.TypeSomething")}
        />

        {/* Building Type */}
        <GlobalSearchModal
          visible={activeModal === "buildingType"}
          onClose={closeModal}
          title={t("FixedAssets.type")}
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
          title={t("FixedAssets.ownership")}
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
          title={t("FixedAssets.generalCondition")}
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