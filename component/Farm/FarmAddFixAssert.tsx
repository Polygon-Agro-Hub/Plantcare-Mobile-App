import React, { useCallback, useEffect, useState } from "react";
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
  BackHandler
} from "react-native";
import { StatusBar, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
// import { TouchableOpacity } from "react-native-gesture-handler";
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

import DropDownPicker from "react-native-dropdown-picker";
import { update, values } from "lodash";
import { useSelector } from "react-redux";
import type { RootState } from "@/services/reducxStore";

type FarmAddFixAssertNavigationProp = StackNavigationProp<
  RootStackParamList,
  "FarmAddFixAssert"
>;
import Icon from 'react-native-vector-icons/Ionicons';
import LottieView from "lottie-react-native";
interface FarmAddFixAssertProps {
  navigation: FarmAddFixAssertNavigationProp;
}
interface Farm {
  id: number;
  userId: number;
}

type RouteParams = {
  farmId: number;
  farmName:string
};
interface UserData {
  role:string
}
const FarmAddFixAssert: React.FC<FarmAddFixAssertProps> = ({ navigation }) => {
  const [ownership, setOwnership] = useState("");
  const [landownership, setLandOwnership] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [generalCondition, setGeneralCondition] = useState("");
  const [district, setDistrict] = useState("");
  const [asset, setAsset] = useState("");
  //console.log("asset", asset)
  const [brand, setBrand] = useState("");
  const [warranty, setWarranty] = useState("");
//  const [purchasedDate, setPurchasedDate] = useState(new Date());
 // const [expireDate, setExpireDate] = useState(new Date());
  // Change these lines:
const [purchasedDate, setPurchasedDate] = useState<Date | null>(null);
const [expireDate, setExpireDate] = useState<Date | null>(null);
  const [showPurchasedDatePicker, setShowPurchasedDatePicker] = useState(false);
  const [showExpireDatePicker, setShowExpireDatePicker] = useState(false);
  const [extentha, setExtentha] = useState("");
  const [extentac, setExtentac] = useState("");
  const [extentp, setExtentp] = useState("");
  const [estimateValue, setEstimatedValue] = useState("");
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [showIssuedDatePicker, setShowIssuedDatePicker] = useState(false);
  const [issuedDate, setIssuedDate] = useState(new Date());
  const [showLbIssuedDatePicker, setShowLbIssuedDatePicker] = useState(false);
  const [lbissuedDate, setLbIssuedDate] = useState(new Date());
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
  const { t } = useTranslation();
  const [openCategory, setOpenCategory] = useState(false);
  const [openAsset, setOpenAsset] = useState(false);
  const [openAssetType, setOpenAssetType] = useState(false);
  const [openBrand, setOpenBrand] = useState(false);
  const [openLandOwnership, setOpenLandOwnership] = useState(false);
  const [openDistrict, setOpenDistrict] = useState(false);
  const [openToolBrand, setOpenToolBrand] = useState(false);
  const [openType, setOpenType] = useState(false);
  const [openOwnership, setOpenOwnership] = useState(false);
  const [openGeneralCondition, setOpenGeneralCondition] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customBrand, setCustomBrand] = useState("")

  const [farms, setFarms] = useState<Farm[]>([]);
  const [openFarm, setOpenFarm] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<string>("");
  const route = useRoute();
     const { farmId, farmName } = route.params as RouteParams; 
      //  const [farm, setFarm] = useState("");
      //    const [farmName, setFarmName] = useState("");
    const user = useSelector((state: RootState) => state.user.userData) as UserData | null;

  console.log('Add Fix Asset FramId',farmId)

    useFocusEffect(
      useCallback(() => {
        const handleBackPress = () => {
          console.log("back click", farmName)
navigation.navigate("Main", { 
      screen: "FarmFixDashBoard",
     params: { farmId: farmId, farmName: farmName }
    }) 
          return true;
        };
    
        
                 const subscription = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
            
                  return () => subscription.remove();
      }, [navigation])
    );

 const resetForm = () => {
  setOwnership("");
  setLandOwnership("");
  setCategory("");
  setType("");
  setGeneralCondition("");
  setDistrict("");
  setAsset("");
  setBrand("");
  setWarranty("");
  setPurchasedDate(null); // Change to null
  setExpireDate(null); // Change to null
  setExtentha("");
  setExtentac("");
  setExtentp("");
  setEstimatedValue("");
  setStartDate(new Date());
  setIssuedDate(new Date());
  setLbIssuedDate(new Date());
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
  setCustomBrand("")
};

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        resetForm();
        setOpenCategory(false)
        setOpenAsset(false)
        setOpenAssetType(false)
        setOpenType(false)
        setOpenOwnership(false)
        setOpenGeneralCondition(false)
        setOpenDistrict(false)
      };
    }, [])
  );

  const ownershipCategories = [
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

    "Harvesting Equipment": [
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
      {
        key:"97",
        value:"Other",
        translationKey:t("FixedAssets.other")
      }
    ],

    Rotavator: [
      {
        key: "24",
        value: "Shaktiman Fighter Rotavator",
        translationKey: t("FixedAssets.ShaktimanRotavator"),
      },
      {
        key:"97",
        value:"Other",
        translationKey:t("FixedAssets.other")
      }
    ],
    "Combine Harvesters": [
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
      {
        key:"97",
        value:"Other",
        translationKey:t("FixedAssets.other")
      }
    ],
    Transplanter: [
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
      {
        key:"97",
        value:"Other",
        translationKey:t("FixedAssets.other")
      }
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
      {
        key:"97",
        value:"Other",
        translationKey:t("FixedAssets.other")
      }
    ],
    "Sowing Equipment": [
      {
        key: "45",
        value: "Seed Sowing Machine - ME",
        translationKey: t("FixedAssets.Dimo"),
      },
      {
        key:"97",
        value:"Other",
        translationKey:t("FixedAssets.other")
      }
    ],
    "Harvesting Equipment": [
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
      {
        key:"97",
        value:"Other",
        translationKey:t("FixedAssets.other")
      }
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
      {
        key:"97",
        value:"Other",
        translationKey:t("FixedAssets.other")
      }
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
      {
        key:"97",
        value:"Other",
        translationKey:t("FixedAssets.other")
      }
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
      {
        key:"97",
        value:"Other",
        translationKey:t("FixedAssets.other")
      }
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
      {
        key:"97",
        value:"Other",
        translationKey:t("FixedAssets.other")
      }
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
      {
        key:"97",
        value:"Other",
        translationKey:t("FixedAssets.other")
      }
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
      {
        key:"97",
        value:"Other",
        translationKey:t("FixedAssets.other")
      }

    ]
  };

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
    { key: "13", value: "Sowing", translationKey: t("FixedAssets.Sowing") }

  ];

  const brandasset = [{ key: "1", value: "Good" }];

  const generalConditionOptions = [
    { key: "1", value: "Good", translationKey: t("FixedAssets.good") },
    { key: "2", value: "Average", translationKey: t("FixedAssets.average") },
    { key: "3", value: "Poor", translationKey: t("FixedAssets.poor") },
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
      value: "NuwaraEliya",
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

  const warrantystatus = [
    { key: "1", value: "yes" },
    { key: "2", value: "no" },
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
      Alert.alert(
        t("FixedAssets.sorry"),
        t("FixedAssets.issuedDateCannotBeFuture"),
        [{ text: t("Main.ok") }]
      );
      return;
    }

    setStartDate(selectedDate);
  };

  const [errorMessage, setErrorMessage] = useState("");
  // const onExpireDateChange = (event: any, selectedDate: any) => {
  //   const currentDate = selectedDate || expireDate;
  //   setShowExpireDatePicker(false);

  //   if (purchasedDate && currentDate < purchasedDate) {
  //     setErrorMessage(t("FixedAssets.errorInvalidExpireDate"));
  //   } else {
  //     setExpireDate(currentDate);
  //     setErrorMessage("");
  //   }
  // };
  const onExpireDateChange = (event: any, selectedDate: any) => {
  const currentDate = selectedDate || expireDate;
  setShowExpireDatePicker(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const selectedDateOnly = new Date(currentDate);
  selectedDateOnly.setHours(0, 0, 0, 0);

  if (purchasedDate && currentDate < purchasedDate) {
    setErrorMessage(t("FixedAssets.errorInvalidExpireDate"));
  } else {
    setExpireDate(currentDate);
    setErrorMessage("");
    
    // Show warning but allow selection
    if (selectedDateOnly < today) {
      Alert.alert(
        t("FixedAssets.warning"),
        t("FixedAssets.warrantyAlreadyExpired"),
        [
          { 
            text: t("FixedAssets.keepDate"), 
            onPress: () => {
              // Date is already set, just show the warning
            }
          }
        ]
      );
    }
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
      Alert.alert(
        t("FixedAssets.sorry"),
        t("FixedAssets.issuedDateCannotBeFuture"),
        [{ text: t("Main.ok") }]
      );
      return;
    }

    setLbIssuedDate(selectedDate);
  };

  const formatNumberWithCommas = (value: string): string => {
    if (!value) return '';
    
    // Remove all non-digit characters
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Format with commas
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const totalPrice = Number(numberOfUnits) * Number(unitPrice) || 0;

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

 const submitData = async () => {
    // Remove farm selection validation since farmId comes from route params
    
    
    if (!category) {
      Alert.alert(t("FixedAssets.sorry"), t("FixedAssets.selectCategory") ,[{ text:  t("PublicForum.OK") }]);
      return;
    }

     if (warranty === "yes" && purchasedDate && expireDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
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


    const showError = (field: string, message: string): never => {
      Alert.alert(t("FixedAssets.sorry"), message ,[{ text:  t("PublicForum.OK") }]);
      throw new Error(`${field} ${t("FixedAssets.isRequired")}`);
    };

    try {
      // **Building and Infrastructures** category validation
      if (category === "Building and Infrastructures") {
        if (!ownership)
          showError(
            t("FixedAssets.sorry"),
            t("FixedAssets.selectOwnershipCategory")
          );
        if (!type)
          showError(t("FixedAssets.sorry"), t("FixedAssets.selectAssetType"));
        if (!floorArea)
          showError(t("FixedAssets.sorry"), t("FixedAssets.enterFloorArea"));
        if (!generalCondition)
          showError(
            t("FixedAssets.sorry"),
            t("FixedAssets.selectGeneralCondition")
          );
        if (!district)
          showError(t("FixedAssets.sorry"), t("FixedAssets.selectDistrict"));

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
          showError(
            t("FixedAssets.sorry"),
            t("FixedAssets.enterPermitAnnuallyLKR")
          );
        } else if (ownership === "Shared / No Ownership" && !paymentAnnually) {
          showError(
            t("FixedAssets.sorry"),
            t("FixedAssets.enterPaymentAnnuallyLKR")
          );
        }
      }

      // **Land** category validation
      if (category === "Land") {
          if (!landownership)
          showError(t("FixedAssets.sorry"), t("FixedAssets.selectLandCategory"));
        if (!district)
          showError(t("FixedAssets.sorry"), t("FixedAssets.selectDistrict"));

        // Ensure extentp, extentac, and extentha have values, else set them to 0
        const updatedExtentp = extentp || "0";
        const updatedExtentac = extentac || "0";
        const updatedExtentha = extentha || "0";

        const updatedDurationMoths = durationMonths || "0";
        const updatedDurationYears = durationYears || "0";
        console.log(updatedDurationMoths, updatedDurationYears);

        // Ensure only one of extentp, extentac, extentha is filled
        const nonZeroFields = [
          updatedExtentp,
          updatedExtentac,
          updatedExtentha,
        ].filter((field) => field && field !== "0");
        const nonZeroDurationFields = [
          updatedDurationMoths,
          updatedDurationYears,
        ].filter((field) => field && field !== "0");

        console.log(nonZeroDurationFields.length);

        // If more than one field has a non-zero value, show an error
       if (nonZeroFields.length === 0) {
          showError(t("FixedAssets.sorry"), t("FixedAssets.enterFloorArea"));
        }
        if (!landFenced)
          showError(t("FixedAssets.sorry"), t("FixedAssets.isLandFenced"));
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
        }
        if (landownership === "Lease" && !leastAmountAnnually) {
          showError(
            t("FixedAssets.sorry"),
            t("FixedAssets.enterLeasedAmountAnnuallyLKR")
          );
        }
        if (landownership === "Lease" && nonZeroDurationFields.length === 0) {
          showError(t("FixedAssets.sorry"), t("FixedAssets.enterDuration"));
        }
        if (landownership === "Permited" && !issuedDate) {
          showError(t("FixedAssets.sorry"), t("FixedAssets.selectIssuedDate"));
        }
        if (landownership === "Permited" && !permitFeeAnnually) {
          showError(
            t("FixedAssets.sorry"),
            t("FixedAssets.enterPermitFeeAnnuallyLKR")
          );
        }
        if (landownership === "Shared" && !paymentAnnually) {
          showError(
            t("FixedAssets.sorry"),
            t("FixedAssets.enterPaymentAnnuallyLKR")
          );
        }
      }

      if (category === "Machine and Vehicles") {
        if (!asset)
          showError(t("FixedAssets.sorry"), t("FixedAssets.selectAsset"));

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

        console.log(assetType)
        console.log("mention other", mentionOther)

        if (assetType === "Other" && !mentionOther) {
          showError(t("FixedAssets.sorry"), t("FixedAssets.mentionOther"));
        }

         if (brand === "Other" && !customBrand) {
          showError(t("FixedAssets.sorry"), t("FixedAssets.mentionOtherBrand"));
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
          showError(
            t("FixedAssets.sorry"),
            t("FixedAssets.warrantyDatesRequired")
          );
        }
      }

      if (category === "Tools") {
        if (!assetname)
          showError(t("FixedAssets.sorry"), t("FixedAssets.selectAsset"));
        if (assetname === "Other" && !othertool)
          showError(t("FixedAssets.sorry"), t("FixedAssets.mentionOther"));
        if (!toolbrand)
          showError(t("FixedAssets.sorry"), t("FixedAssets.selectBrand"));
        if (!numberOfUnits)
          showError(
            t("FixedAssets.sorry"),
            t("FixedAssets.enterNumberofUnits")
          );
        if (!unitPrice)
          showError(t("FixedAssets.sorry"), t("FixedAssets.enterUnitPrice"));
        if (!warranty)
          showError(t("FixedAssets.sorry"), t("FixedAssets.selectWarranty"));
        if (warranty === "yes" && (!purchaseDate || !expireDate)) {
          showError(
            t("FixedAssets.sorry"),
            t("FixedAssets.warrantyDatesRequired")
          );
        }
         if (toolbrand === "Other" && !customBrand) {
          showError(t("FixedAssets.sorry"), t("FixedAssets.mentionOtherBrand"));
        }
      }
    } catch (error: any) {
      console.error("hittt",error.message);
      return;
    }
    
    const updatedExtentp = extentp || "0";
    const updatedExtentac = extentac || "0";
    const updatedExtentha = extentha || "0";
    const updatedDurationYears = durationYears || "0";
    const updatedDurationMonths = durationMonths || "0";

    setLoading(true);
    const updatedPurchaseDate = warranty === "no" ? null : purchasedDate;
    const updatedExpireDate = warranty === "no" ? null : expireDate;

    const formData = {
      farmId: farmId, // Using farmId from route params
      category,
      ownership,
      type,
      floorArea,
      generalCondition,
      district,
      extentha: updatedExtentha,
      extentac: updatedExtentac,
      extentp: updatedExtentp,
      landFenced,
      perennialCrop,
      asset,
      assetType,
      mentionOther,
      brand: customBrand || brand,
      numberOfUnits,
      unitPrice,
      totalPrice,
      warranty,
      issuedDate,
      purchaseDate: updatedPurchaseDate,
      expireDate : updatedExpireDate,
      warrantystatus,
      startDate,
      durationYears: updatedDurationYears,
      durationMonths: updatedDurationMonths,
      leastAmountAnnually,
      permitFeeAnnually,
      paymentAnnually,
      estimateValue,
      assetname,
      toolbrand: customBrand || toolbrand,
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
      
      Alert.alert(
        t("FixedAssets.success"),
        t("FixedAssets.assetAddSuccessfuly"),
        [
          {
            text: t("Main.ok"),
            onPress: () => 
              navigation.navigate("Main", { 
      screen: "FarmFixDashBoard",
     params: { farmId: farmId, farmName: farmName }
    }) ,
          },
        ]
      );
      setLoading(false);
    } catch (error: any) {
      console.error("Error submitting data:", error);
      setLoading(false);
      if (error.response) {
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"),[{ text: t("Farms.okButton") }]);
      } else if (error.request) {
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"),[{ text: t("Farms.okButton") }]);
      } else {
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"),[{ text: t("Farms.okButton") }]);
      }
    }
  };
  
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const currentDate = new Date();
  const maxDate = new Date(currentDate);
  maxDate.setFullYear(currentDate.getFullYear() + 1000);


 useEffect(() => {
    const fetchFarmData = async () => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            if (!token) {
                console.error("User token not found");
                return;
            }

            const response = await axios.get(
                `${environment.API_BASE_URL}api/farm/select-farm`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (response.data.status === "success") {
                console.log('Farm data:', response.data.data);
                setFarms(response.data.data);
            }
        } catch (error: unknown) {
            console.error('Error fetching farms:', error);
            
            // Type guard to check if error is an AxiosError
            if (axios.isAxiosError(error)) {
                console.error('Error response:', error.response?.data);
                console.error('Error status:', error.response?.status);
            } else if (error instanceof Error) {
                console.error('Error message:', error.message);
            } else {
                console.error('Unknown error:', error);
            }
        }
    };

    fetchFarmData();
}, []);


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
        <ScrollView
          className="flex-1  pb-20  bg-white"
          style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-row justify-between mb-2">
            <TouchableOpacity
              onPress={() => navigation.navigate("FarmFixDashBoard" ,{ farmId: farmId , farmName: farmName})}
              className=""
            >
              <AntDesign name="left" size={24} color="#000502" style={{ paddingHorizontal: wp(3), paddingVertical: hp(1.5), backgroundColor: "#F6F6F680" , borderRadius: 50 }} />
            </TouchableOpacity>
            <View className="flex-1 items-center">
              <Text className="text-lg font-bold pt-2 -ml-[15%]">
          {farmName}
              </Text>
            </View>
          </View>

          
                <View className="flex-row mt-2 justify-center">
                  <View className="w-1/2">
                     <TouchableOpacity
                                         onPress={() =>
                                 navigation.navigate("Main", {
                                   screen: "FarmCurrectAssets",
                                   params: { farmId: farmId,farmName: farmName },
                                 }as any)
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
            <Text className="mt-4 text-sm  pb-2 ">
              {t("CurrentAssets.category")}
            </Text>
            <View className=" rounded-full">
              <DropDownPicker
                open={openCategory}
                value={category}
                items={[
                  {
                    label: t("FixedAssets.buildingandInfrastructures"),
                    value: "Building and Infrastructures",
                  },
                  {
                    label: t("FixedAssets.machineandVehicles"),
                    value: "Machine and Vehicles",
                  },
                  {
                    label: t("FixedAssets.land"),
                    value: "Land",
                  },
                  {
                    label: t("FixedAssets.toolsandEquipments"),
                    value: "Tools",
                  },
                ]}
                setOpen={(open) => {
                  setOpenCategory(open);
                  setOpenAsset(false);
                  setOpenAssetType(false)
                  setOpenType(false);
                  setOpenLandOwnership(false);
                  setOpenGeneralCondition(false);
                  setOpenOwnership(false);
                }}
                setValue={(value) => {
                  setCategory(value);
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
                placeholder={t("FixedAssets.selectCategory")}
                placeholderStyle={{ color: "#6B7280" }}
                dropDownContainerStyle={{
                  borderColor: "#ccc",
                  borderWidth: 1,
                  backgroundColor: "#F4F4F4",
                  maxHeight: 400,
                  minHeight: 150,
                }}
                style={{
                  borderWidth: 1,
                  borderColor: "#F4F4F4",
                  backgroundColor: "#F4F4F4",
                  borderRadius: 30,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                }}
                textStyle={{
                  fontSize: 14,
                }}
                onOpen={dismissKeyboard}
                zIndex={80000}
                listMode="SCROLLVIEW"
                scrollViewProps={{
                  nestedScrollEnabled: true,
                }}
              />
            </View>
            {category === "Machine and Vehicles" ? (
              <View className="flex-1">
                <Text className="mt-4 text-sm  pb-2">
                  {t("FixedAssets.asset")}
                </Text>
                <View className=" rounded-full">
                  <DropDownPicker
                    open={openAsset}
                    value={asset}
                    items={Machineasset.map((item) => ({
                      label: t(item.translationKey),
                      value: item.value,
                      key: item.key,
                    }))}
                    setOpen={(open) => {
                      setOpenAsset(open);
                      setOpenAssetType(false);
                      setOpenBrand(false);
                    }}
                    setValue={(value) => {
                      setAsset(value);
                      setAssetType("");
                      setBrand("");
                    }}
                    placeholder={t("FixedAssets.selectAsset")}
                    searchPlaceholder={t("SignupForum.TypeSomething")} 
                    placeholderStyle={{ color: "#6B7280" }}
                    dropDownContainerStyle={{
                      borderColor: "#F4F4F4",
                      borderWidth: 1,
                      backgroundColor: "#F4F4F4",
                      maxHeight: 400,
                    }}
                    style={{
                      borderWidth: 1,
                      borderColor: "#F4F4F4",
                      backgroundColor: "#F4F4F4",
                      borderRadius: 30,
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                    }}
                    textStyle={{
                      fontSize: 14,
                    }}
                    searchable={true}
                    listMode="MODAL"
                    modalProps={{
  animationType: "slide",
  transparent: false,
  presentationStyle: "fullScreen",
  statusBarTranslucent: false,
}}
modalContentContainerStyle={{
  paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  backgroundColor: '#fff',
}}
                    onOpen={dismissKeyboard}
                    zIndex={7900}
                  />
                </View>

                {asset &&
                  assetTypesForAssets[asset] &&
                  assetTypesForAssets[asset].length > 0 && (
                    <>
                      <Text className="mt-4 text-sm pb-2 ">
                        {t("FixedAssets.selectAssetType")}
                      </Text>
                      <View className="rounded-full">
                        <DropDownPicker
                          open={openAssetType}
                          value={assetType}
                          items={assetTypesForAssets[asset].map(
                            (item: any) => ({
                              label: t(item.translationKey),
                              value: item.value,
                              key: item.key,
                            })
                          )}
                          setOpen={(open) => {
                            setOpenAssetType(open);
                            setOpenBrand(false);
                          }}
                          setValue={setAssetType}
                          placeholder={t("FixedAssets.selectAssetType")}
                          searchPlaceholder={t("SignupForum.TypeSomething")} 
                          placeholderStyle={{ color: "#6B7280" }}
                          dropDownContainerStyle={{
                            borderColor: "#ccc",
                            borderWidth: 1,
                            backgroundColor: "#F4F4F4",
                            maxHeight: 400,
                            zIndex:10
                          }}
                          style={{
                            borderColor: "#F4F4F4",
                            borderWidth: 1,
                            backgroundColor: "#F4F4F4",
                            borderRadius: 30,
                            paddingHorizontal: 12,
                            paddingVertical: 12,
                          }}
                          textStyle={{
                            fontSize: 14,
                          }}
                          onOpen={dismissKeyboard}
                          listMode="SCROLLVIEW"
                scrollViewProps={{
                  nestedScrollEnabled: true,
                }}
                        />
                      </View>
                    </>
                  )}

                {assetType === "Other" && (
                  <View className="mt-4">
                    <Text>{t("FixedAssets.Mention")}</Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-2 rounded-full mt-2 bg-gray-100"
                      placeholder={t("FixedAssets.Mention")}
                      value={mentionOther}
                      onChangeText={setMentionOther}
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
                      <View className=" rounded-full ">
                        <DropDownPicker
                          open={openBrand}
                          value={brand}
                          items={brandTypesForAssets[asset].map(
                            (item: any) => ({
                              label: t(item.translationKey),
                              value: item.value,
                              key: item.key,
                            })
                          )}
                          setOpen={setOpenBrand}
                          setValue={setBrand}
                          placeholder={t("FixedAssets.selectBrand")}
                          searchPlaceholder={t("SignupForum.TypeSomething")} 
                          placeholderStyle={{ color: "#6B7280" }}
                          dropDownContainerStyle={{
                            borderColor: "#ccc",
                            borderWidth: 1,
                            backgroundColor: "#F4F4F4",
                            maxHeight: 400,
                          }}
                          style={{
                            borderColor: "#F4F4F4",
                            borderWidth: 1,
                            backgroundColor: "#F4F4F4",
                            borderRadius: 30,
                            paddingHorizontal: 12,
                            paddingVertical: 12,
                            zIndex:9
                          }}
                          textStyle={{
                            fontSize: 14,
                          }}
                          searchable={true}
                          listMode="MODAL"
                          modalProps={{
  animationType: "slide",
  transparent: false,
  presentationStyle: "fullScreen",
  statusBarTranslucent: false,
}}
modalContentContainerStyle={{
  paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  backgroundColor: '#fff',
}}
                          onOpen={dismissKeyboard}
                        />
                      </View>
                    </>
                  )}

                         {brand === "Other" && (
                      <View>
                       <Text className="mt-4 text-sm  pb-2">
                        {t("FixedAssets.mentionOtherBrand")}
                      </Text>
                      <TextInput
                        className="border border-[#F4F4F4] p-4 rounded-full bg-gray-100 pl-4"
                        placeholder={t("FixedAssets.enterCustomBrand")}
                        value={customBrand}
                        onChangeText={setCustomBrand} 
                      />
                      </View>
                    )}

                <Text className="mt-4 text-sm  pb-2">
                  {t("FixedAssets.numberofUnits")}
                </Text>
                <TextInput
  className="border border-[#F4F4F4] p-3 pl-4 rounded-full bg-gray-100"
  placeholder={t("FixedAssets.enterNumberofUnits")}
  value={formatNumberWithCommas(numberOfUnits)}
  onChangeText={(text) => {
    const cleanedText = text.replace(/[-.*#,]/g, '');
    
    // If the cleaned text is "0" or empty, clear the input
    if (cleanedText === '0' || cleanedText === '') {
      setNumberOfUnits('');
    } else {
      setNumberOfUnits(cleanedText);
    }
  }}
  keyboardType="numeric"
/>
                {/* <TextInput
                  className="border border-[#F4F4F4] p-3 pl-4 rounded-full bg-gray-100"
                  placeholder={t("FixedAssets.enterNumberofUnits")}
                 // value={numberOfUnits}
                  value={formatNumberWithCommas(numberOfUnits)}
                  // onChangeText={setNumberOfUnits}
                        onChangeText={(text) => {
                            const cleanedText = text.replace(/[-.*#]/g, '');
                           setNumberOfUnits(cleanedText);
                          }}
                  keyboardType="numeric"
                /> */}

                <Text className="mt-4 text-sm  pb-2">
                  {t("FixedAssets.unitPrice")}
                </Text>
                {/* <TextInput
                  className="border border-[#F4F4F4] p-3 pl-4 rounded-full bg-gray-100"
                  placeholder={t("FixedAssets.enterUnitPrice")}
                  value={unitPrice}
                   onChangeText={setUnitPrice}
                  // onChangeText={(text) => {
                  //           const cleanedText = text.replace(/[-*#]/g, '');
                  //          setUnitPrice(cleanedText);
                  //         }}
  //                  onChangeText={(text) => {
  //   const cleanedText = text.replace(/[-.*#,]/g, '');
    
  //   // If the cleaned text is "0" or empty, clear the input
  //   if (cleanedText === '0' || cleanedText === '') {
  //     setNumberOfUnits('');
  //   } else {
  //     setNumberOfUnits(cleanedText);
  //   }
  // }}
                  keyboardType="numeric"
                /> */}
                <TextInput
  className="border border-[#F4F4F4] p-3 pl-4 rounded-full bg-gray-100"
  placeholder={t("FixedAssets.enterUnitPrice")}
  value={unitPrice}
  onChangeText={(text) => {
    // Remove unwanted characters
    const cleanedText = text.replace(/[-.*#]/g, '');
    
    // If the cleaned text is "0" or empty, don't update the state
    // This prevents entering "0" as a value
    if (cleanedText === '0' || cleanedText === '') {
      // Option 1: Keep current value (preferred if you want to prevent clearing)
      return;
      
      // Option 2: Clear the input (if you want to allow clearing but not "0")
      // setUnitPrice('');
    } else {
      setUnitPrice(cleanedText);
    }
  }}
  keyboardType="numeric"
/>

                <Text className="mt-4 text-sm  pb-2">
                  {t("FixedAssets.totalPrice")}
                </Text>
                <View className="border border-[#F4F4F4] p-4 pl-4 rounded-full bg-gray-100">
                  <Text className="">{totalPrice.toFixed(2)}</Text>
                </View>

                <Text className="pt-5  pb-3 ">{t("FixedAssets.warranty")}</Text>
                <View className="flex-row justify-around ">
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
                    <Text className="pt-5 pb-3 ">
                      {t("FixedAssets.purchasedDate")}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowPurchasedDatePicker(prev => !prev)}
                    >
                      <View className="border border-[#F4F4F4] p-4 pl-4 pr-4 rounded-full flex-row bg-gray-100  justify-between">
                       <Text className="">
  {purchasedDate ? purchasedDate.toLocaleDateString() : t("CurrentAssets.purchasedate")}
</Text>
                        <Icon name="calendar-outline" size={20} color="#6B7280" />
                      </View>
                    </TouchableOpacity>
                   

{showPurchasedDatePicker &&
            (Platform.OS === "ios" ? (
              <View className=" justify-center items-center z-50 mt-2  bg-gray-100  rounded-lg">
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
                          [{ text: t("Main.ok") }]
                        );
                      } else {
                        setPurchasedDate(selectedDate); // Set the valid purchased date
                      }
                    }
                    setShowPurchasedDatePicker(false); // Close the DateTimePicker
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
                        [{ text: t("Main.ok") }]
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

                    <Text className="pt-5 pb-3 ">
                      {t("FixedAssets.warrantyExpireDate")}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowExpireDatePicker(prev => !prev)}
                    >
                      <View className="border border-[#F4F4F4] p-4 pl-4 pr-4 rounded-full flex-row bg-gray-100  justify-between">
                        <Text className="">
  {expireDate ? expireDate.toLocaleDateString() : t("CurrentAssets.expiredate")}
</Text>
                        <Icon name="calendar-outline" size={20} color="#6B7280" />
                      </View>
                    </TouchableOpacity>
               

{showExpireDatePicker &&
                (Platform.OS === "ios" ? (
                  <View className=" justify-center items-center z-50 bg-gray-100  rounded-lg">
                    <DateTimePicker
                      mode="date"
                      display="inline"
                      style={{ width: 320, height: 260 }}
                      onChange={onExpireDateChange}
                      value={expireDate || new Date()}
                      minimumDate={new Date()}
                      maximumDate={maxDate}
                    />
                  </View>
                ) : (
                  <DateTimePicker
                    mode="date"
                    display="default"
                    onChange={onExpireDateChange}
                    value={expireDate || new Date()}
                    minimumDate={new Date()}
                    maximumDate={maxDate}
                  />
                ))}

                    {/* <Text className="mt-4 text-sm">
                      {t("FixedAssets.warrantyStatus")}
                    </Text> */}

                    {/* Conditional Warranty Status Display */}
                    {/* Conditional Warranty Status Display - Only show when both dates are selected */}
{/* {warranty === "yes" && purchasedDate && expireDate && (
  <View className="border border-[#F4F4F4] rounded-full bg-gray-100 p-2 mt-2">
    <Text
      style={{
        color: expireDate > new Date() ? "#26D041" : "#FF0000",
        fontWeight: "bold",
        textAlign: "center",
      }}
    >
      {expireDate > new Date()
        ? t("FixedAssets.valid")
        : t("FixedAssets.expired")}
    </Text>
  </View>
)} */}

 <Text className="mt-4 text-sm">
                           {t("FixedAssets.warrantyStatus")}
                    </Text>

                    {/* Conditional Warranty Status Display */}
                 {/* Conditional Warranty Status Display */}
<View className="border border-[#F4F4F4] rounded-full bg-gray-100 p-2 mt-2">
  <Text
    style={{
      color: purchasedDate && expireDate 
        ? (expireDate.getTime() > new Date().getTime() ? "#26D041" : "#FF0000")
        : "#6B7280",
      fontWeight: "bold",
      textAlign: "center",
    }}
  >
    {purchasedDate && expireDate
      ? (expireDate.getTime() > new Date().getTime()
          ? t("FixedAssets.valid")
          : t("FixedAssets.expired"))
      : t("CurrentAssets.status")}
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
                <View className="flex-row items-center justify-between w-full ">
                  {/* HA Input */}
                  <View className="flex-row items-center space-x-2">
                    <Text className="text-right">{t("FixedAssets.ha")}</Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-2 px-4 w-20 rounded-full bg-gray-100 text-left"
                      value={extentha}
                      // onChangeText={setExtentha}
                       onChangeText={(text) => {
                            const cleanedText = text.replace(/[-.*#]/g, '');
                           setExtentha(cleanedText);
                          }}
                      keyboardType="numeric"
                    />
                  </View>

                  {/* AC Input */}
                  <View className="flex-row items-center space-x-2 ">
                    <Text className="text-right ml-1">{t("FixedAssets.ac")}</Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-2 px-4 w-20 rounded-full bg-gray-100 "
                      value={extentac}
                      // onChangeText={setExtentac}
                      onChangeText={(text) => {
                            const cleanedText = text.replace(/[-.*#]/g, '');
                           setExtentac(cleanedText);
                          }}
                      keyboardType="numeric"
                    />
                  </View>

                  {/* P Input */}
                  <View className="flex-row items-center space-x-2">
                    <Text className="text-right ml-1">{t("FixedAssets.p")}</Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-2 w-20 px-4 rounded-full bg-gray-100 "
                      value={extentp}
                      // onChangeText={setExtentp}
                      onChangeText={(text) => {
                            const cleanedText = text.replace(/[-.*#]/g, '');
                           setExtentp(cleanedText);
                          }}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View>
                  <Text className="mt-4 text-sm  pb-2">
                    {t("FixedAssets.selectLandCategory")}
                  </Text>
                  <View className="rounded-full ">
                    <DropDownPicker
                      open={openLandOwnership}
                      value={landownership}
                      setOpen={setOpenLandOwnership}
                      setValue={setLandOwnership}
                      items={[
                        { label: t("FixedAssets.OwnLand"), value: "Own" },
                        { label: t("FixedAssets.LeaseLand"), value: "Lease" },
                        {
                          label: t("FixedAssets.PermittedLand"),
                          value: "Permited",
                        },
                        {
                          label: t("FixedAssets.SharedOwnership"),
                          value: "Shared",
                        },
                      ]}
                      placeholder={t("FixedAssets.selectLandCategory")}
                      placeholderStyle={{ color: "#6B7280" }}
                      dropDownContainerStyle={{
                        borderColor: "#F4F4F4",
                        borderWidth: 1,
                        backgroundColor: "#F4F4F4",
                        maxHeight: 350,
                      }}
                      style={{
                        borderWidth: 1,
                        borderColor: "#F4F4F4",
                        backgroundColor: "#F4F4F4",
                        borderRadius: 30,
                        paddingHorizontal: 12,
                        paddingVertical: 12,
                      }}
                      textStyle={{
                        fontSize: 14,
                      }}
                      onOpen={dismissKeyboard}
                      zIndex={6000}
                      zIndexInverse={1000}
                      listMode="SCROLLVIEW"
                scrollViewProps={{
                  nestedScrollEnabled: true,
                }}
                    />
                  </View>
                </View>

                {/* Conditional input for estimated value */}
                {landownership === "Own" && (
                  <View>
                    <Text className="mt-4 text-sm  pb-2">
                      {t("FixedAssets.estimateValue")}
                    </Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-2 rounded-full bg-gray-100  pl-4"
                      placeholder={t("FixedAssets.enterEstimateValue")}
                      value={estimateValue}
                      // onChangeText={setEstimatedValue}
                      //  onChangeText={(text) => {
                      //       const cleanedText = text.replace(/[-*#]/g, '');
                      //      setEstimatedValue(cleanedText);
                      //     }}
                       onChangeText={(text) => {
    const cleanedText = text.replace(/[-.*#,]/g, '');
    
    // If the cleaned text is "0" or empty, clear the input
    if (cleanedText === '0' || cleanedText === '') {
      setNumberOfUnits('');
    } else {
      setNumberOfUnits(cleanedText);
    }
  }}
                      keyboardType="numeric"
                    />
                  </View>
                )}

                {landownership === "Lease" && (
                  <View>
                    <Text className="mt-4  pb-2 ">
                      {t("FixedAssets.startDate")}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowStartDatePicker(prev => !prev)}
                    >
                      <View className="border border-[#F4F4F4] p-4 pl-4 pr-4 rounded-full flex-row bg-gray-100  justify-between">
                        <Text className="">
                          {startDate.toLocaleDateString()}
                        </Text>
                          <Icon name="calendar-outline" size={20} color="#6B7280" />
                      </View>
                    </TouchableOpacity>

                  

{showStartDatePicker &&
                (Platform.OS === "ios" ? (
                  <View className=" justify-center items-center z-50  bg-gray-100  rounded-lg">
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

                    <Text className="mt-4 text-sm pb-2">
                      {t("FixedAssets.duration")}
                    </Text>
                    <View className="items-center flex-row justify-center">
                      <Text className="w-[20%] text-right pr-2">
                        {t("FixedAssets.years")}
                      </Text>
                      <TextInput
                        className="border border-[#F4F4F4] p-2 w-[30%] px-4 rounded-full bg-gray-100"
                        value={durationYears}
                        // onChangeText={setDurationYears}
                        //  onChangeText={(text) => {
                        //     const cleanedText = text.replace(/[-.*#]/g, '');
                        //    setDurationYears(cleanedText);
                        //   }}
                         onChangeText={(text) => {
    const cleanedText = text.replace(/[-.*#,]/g, '');
    
    // If the cleaned text is "0" or empty, clear the input
    if (cleanedText === '0' || cleanedText === '') {
      setNumberOfUnits('');
    } else {
      setNumberOfUnits(cleanedText);
    }
  }}
                        keyboardType="numeric"
                      />

                      {/* <Text className=" w-[20%] text-right pr-2 ">
                        {t("FixedAssets.months")}
                      </Text> */}
                   
                      <Text className=" w-[20%] text-right pr-2 ">
  {t("FixedAssets.months")}
</Text>
<TextInput
  className="border border-[#F4F4F4] p-2 w-[30%] px-4  rounded-full bg-[#F4F4F4]"
  value={durationMonths}
  onChangeText={(text) => {
    // Remove unwanted characters
    const cleanedText = text.replace(/[-.*#]/g, '');
    
    // Convert to number for validation
    const numericValue = parseInt(cleanedText, 10);
    
  
    if (cleanedText === '' || (numericValue >= 0 && numericValue <= 12)) {
      setDurationMonths(cleanedText);
    }
  }}
  keyboardType="numeric"
  maxLength={2} 
/>
                    </View>

                    <Text className="pb-2 mt-4 text-sm">
                      {t("FixedAssets.leasedAmountAnnually")}
                    </Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-3 rounded-full bg-[#F4F4F4] pl-4 "
                      placeholder={t(
                        "FixedAssets.enterLeasedAmountAnnuallyLKR"
                      )}
                      value={leastAmountAnnually}
                      // onChangeText={setLeastAmountAnnually}
                      // onChangeText={(text) => {
                      //       const cleanedText = text.replace(/[-*#]/g, '');
                      //      setLeastAmountAnnually(cleanedText);
                      //     }}
                       onChangeText={(text) => {
    const cleanedText = text.replace(/[-.*#,]/g, '');
    
    // If the cleaned text is "0" or empty, clear the input
    if (cleanedText === '0' || cleanedText === '') {
      setNumberOfUnits('');
    } else {
      setNumberOfUnits(cleanedText);
    }
  }}
                      keyboardType="numeric"
                    />
                  </View>
                )}

                {landownership === "Permited" && (
                  <View className="mt-4">
                    <Text className="pb-2 ">{t("FixedAssets.issuedDate")}</Text>
                    <TouchableOpacity
                      onPress={() => setShowIssuedDatePicker(prev => !prev)}
                    >
                      <View className="border border-[#F4F4F4] p-4 pl-4 pr-4 rounded-full flex-row bg-[#F4F4F4]  justify-between">
                        <Text>{issuedDate.toLocaleDateString()}</Text>
                         <Icon name="calendar-outline" size={20} color="#6B7280" />
                      </View>
                    </TouchableOpacity>

                  

{showIssuedDatePicker &&
                (Platform.OS === "ios" ? (
                  <View className=" justify-center items-center z-50  bg-[#F4F4F4]  rounded-lg">
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
                    <View className="mt-4">
                      <Text className="pb-2 ">
                        {t("FixedAssets.permitAnnually")}
                      </Text>
                      <TextInput
                        className="border border-[#F4F4F4] p-3 rounded-full bg-[#F4F4F4] pl-4"
                        placeholder={t("FixedAssets.enterPermitAnnuallyLKR")}
                        value={permitFeeAnnually}
                        // onChangeText={setPermitFeeAnnually}
                        // onChangeText={(text) => {
                        //     const cleanedText = text.replace(/[-*#]/g, '');
                        //   setPermitFeeAnnually(cleanedText);
                        //   }}
                         onChangeText={(text) => {
    const cleanedText = text.replace(/[-.*#,]/g, '');
    
    // If the cleaned text is "0" or empty, clear the input
    if (cleanedText === '0' || cleanedText === '') {
      setNumberOfUnits('');
    } else {
      setNumberOfUnits(cleanedText);
    }
  }}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                )}

                {landownership === "Shared" && (
                  <View className="mt-4">
                    <Text className="pb-2 ">
                      {t("FixedAssets.paymentAnnually")}
                    </Text>
                    <View>
                      <TextInput
                        className="border border-[#F4F4F4] p-3 rounded-full bg-[#F4F4F4] pl-4"
                        value={paymentAnnually}
                        // onChangeText={setPaymentAnnually}
                        // onChangeText={(text) => {
                        //     const cleanedText = text.replace(/[-*#]/g, '');
                        //   setPaymentAnnually(cleanedText);
                        //   }}
                         onChangeText={(text) => {
    const cleanedText = text.replace(/[-.*#,]/g, '');
    
    // If the cleaned text is "0" or empty, clear the input
    if (cleanedText === '0' || cleanedText === '') {
      setNumberOfUnits('');
    } else {
      setNumberOfUnits(cleanedText);
    }
  }}
                        keyboardType="numeric"
                        placeholder={t("FixedAssets.enterPaymentAnnuallyLKR")}
                      />
                    </View>
                  </View>
                )}

                <Text className="mt-4 text-sm  pb-2">
                  {t("FixedAssets.district")}
                </Text>
                <View className="rounded-full ">
                  <DropDownPicker
                    open={openDistrict}
                    value={district}
                    items={districtOptions.map((item) => ({
                      label: t(item.translationKey),
                      value: item.value,
                      key: item.key,
                    }))}
                    setOpen={setOpenDistrict}
                    setValue={setDistrict}
                    searchPlaceholder={t("SignupForum.TypeSomething")} 
                    placeholder={t("FixedAssets.selectDistrict")}
                    placeholderStyle={{ color: "#6B7280" }}
                    dropDownContainerStyle={{
                      borderColor: "#F4F4F4",
                      borderWidth: 1,
                      backgroundColor: "#F4F4F4",
                      maxHeight: 280,
                    }}
                    style={{
                      borderColor: "#F4F4F4",
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
                    listMode="MODAL"
                    modalProps={{
  animationType: "slide",
  transparent: false,
  presentationStyle: "fullScreen",
  statusBarTranslucent: false,
}}
modalContentContainerStyle={{
  paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  backgroundColor: '#fff',
}}
                    onOpen={dismissKeyboard}
                    zIndex={4000}
                  />
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
                          perennialCrop === "yes"
                            ? "bg-green-500"
                            : "bg-gray-400"
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
                          perennialCrop === "no"
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      />
                      <Text className="ml-2">{t("FixedAssets.no")}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : category == "Tools" ? (
              <View className="flex-1 ">
                <View>
                  <Text className="mt-4 text-sm">{t("FixedAssets.asset")}</Text>
                  <View className=" rounded-full mt-2 ">
                    <DropDownPicker
                      open={openAsset}
                      value={assetname}
                      setOpen={(open) => {
                        setOpenAsset(open);
                        setOpenToolBrand(false);
                      }}
                      setValue={(itemValue: any) => {
                        setAssetname(itemValue);
                        setOthertool(""); 
                      }}
                      items={assetOptions}
                      placeholder={t("FixedAssets.selectAsset")}
                      searchPlaceholder={t("SignupForum.TypeSomething")} 
                      placeholderStyle={{ color: "#6B7280" }}
                      dropDownContainerStyle={{
                        borderColor: "#F4F4F4",
                        borderWidth: 1,
                        backgroundColor: "#F4F4F4",
                        maxHeight: 280,
                      }}
                      style={{
                        borderColor: "#F4F4F4",
                        borderWidth: 1,
                        backgroundColor: "#F4F4F4",
                        borderRadius: 30,
                        paddingHorizontal: 12,
                        paddingVertical: 12,
                      }}
                      textStyle={{
                        fontSize: 14,
                      }}
                      onOpen={dismissKeyboard}
                      zIndex={6000}
                      searchable={true}
                      listMode="MODAL"
                      modalProps={{
  animationType: "slide",
  transparent: false,
  presentationStyle: "fullScreen",
  statusBarTranslucent: false,
}}
modalContentContainerStyle={{
  paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  backgroundColor: '#fff',
}}
                      zIndexInverse={1000}
                    />
                  </View>
                </View>

                {assetname == "Other" && (
                  <View>
                    <View>
                      <Text className="mt-4 text-sm  pb-2">
                        {t("FixedAssets.mentionOther")}
                      </Text>
                      <TextInput
                        className="border border-[#F4F4F4] p-4 rounded-full bg-[#F4F4F4] pl-4"
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
                  <View className=" rounded-full ">
                    <DropDownPicker
                      open={openToolBrand}
                      value={toolbrand}
                      setOpen={setOpenToolBrand}
                      setValue={(itemValue: any) => setToolbrand(itemValue)}
                      items={[
                        { label: t("FixedAssets.Lakloha"), value: "Lakloha" },
                        {
                          label: t("FixedAssets.Crocodile"),
                          value: "Crocodile",
                        },
                        {
                          label: t("FixedAssets.Chillington"),
                          value: "Chillington",
                        },
                        { label: t("FixedAssets.Lanlo"), value: "Lanlo" },
                        { label: t("FixedAssets.DBL"), value: "DBL" },
                        { label: t("FixedAssets.Browns"), value: "Browns" },
                        { label: t("FixedAssets.Hayles"), value: "Hayles" },
                        {
                          label: t("FixedAssets.Janathasteel"),
                          value: "Janatha steel",
                        },
                        { label: t("FixedAssets.Lakwa"), value: "Lakwa" },
                        { label: t("FixedAssets.CSAgro"), value: "CS Agro" },
                        { label: t("FixedAssets.Aswenna"), value: "Aswenna" },
                        {
                          label: t("FixedAssets.PiyadasaAgro"),
                          value: "Piyadasa Agro",
                        },
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
                      ]}
                      placeholder={t("FixedAssets.selectBrand")}
                      searchPlaceholder={t("SignupForum.TypeSomething")} 
                      placeholderStyle={{ color: "#6B7280" }}
                      dropDownContainerStyle={{
                        borderColor: "#F4F4F4",
                        borderWidth: 1,
                        backgroundColor: "#F4F4F4",
                        maxHeight: 200,
                      }}
                      style={{
                        borderColor: "#F4F4F4",
                        borderWidth: 1,
                        backgroundColor: "#F4F4F4",
                        borderRadius: 30,
                        paddingHorizontal: 12,
                        paddingVertical: 12,
                      }}
                      textStyle={{
                        fontSize: 14,
                      }}
                      onOpen={dismissKeyboard}
                      zIndex={4000}
                      searchable={true}
                      listMode="MODAL"
                      modalProps={{
  animationType: "slide",
  transparent: false,
  presentationStyle: "fullScreen",
  statusBarTranslucent: false,
}}
modalContentContainerStyle={{
  paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  backgroundColor: '#fff',
}}
                      zIndexInverse={1000}
                    />
                  </View>
                    {toolbrand === "Other" && (
                      <View>
                       <Text className="mt-4 text-sm  pb-2">
                        {t("FixedAssets.mentionOtherBrand")}
                      </Text>
                      <TextInput
                        className="border border-[#F4F4F4] p-4 rounded-full bg-[#F4F4F4] pl-4"
                        placeholder={t("FixedAssets.enterCustomBrand")}
                        value={customBrand}
                        onChangeText={setCustomBrand} 
                      />
                      </View>
                    )}
  
                  <Text className="mt-4 text-sm  pb-2">
                    {t("FixedAssets.numberofUnits")}
                  </Text>
                  <TextInput
                    className="border border-[#F4F4F4] p-3 rounded-full bg-[#F4F4F4] pl-4"
                    placeholder={t("FixedAssets.enterNumberofUnits")}
                    value={numberOfUnits}
                    // onChangeText={setNumberOfUnits}
                          //  onChangeText={(text) => {
                          //   const cleanedText = text.replace(/[-.*#]/g, '');
                          //  setNumberOfUnits(cleanedText);
                          // }}
                           onChangeText={(text) => {
    const cleanedText = text.replace(/[-.*#,]/g, '');
    
    // If the cleaned text is "0" or empty, clear the input
    if (cleanedText === '0' || cleanedText === '') {
      setNumberOfUnits('');
    } else {
      setNumberOfUnits(cleanedText);
    }
  }}
                    keyboardType="numeric"
                  />

                  <Text className="mt-4 text-sm  pb-2">
                    {t("FixedAssets.unitPrice")}
                  </Text>
                  {/* <TextInput
                    className="border border-[#F4F4F4] p-3 rounded-full bg-[#F4F4F4] pl-4"
                    placeholder={t("FixedAssets.enterUnitPrice")}
                    value={unitPrice}
                    onChangeText={setUnitPrice}
                    // onChangeText={(text) => {
                    //         const cleanedText = text.replace(/[-*#]/g, '');
                    //        setUnitPrice(cleanedText);
                    //       }}
  //                    onChangeText={(text) => {
  //   const cleanedText = text.replace(/[-.*#,]/g, '');
    
  //   // If the cleaned text is "0" or empty, clear the input
  //   if (cleanedText === '0' || cleanedText === '') {
  //     setNumberOfUnits('');
  //   } else {
  //     setNumberOfUnits(cleanedText);
  //   }
  // }}
                    keyboardType="numeric"
                  /> */}
                  <TextInput
  className="border border-[#F4F4F4] p-3 pl-4 rounded-full bg-gray-100"
  placeholder={t("FixedAssets.enterUnitPrice")}
  value={unitPrice}
  onChangeText={(text) => {
    // Remove unwanted characters
    const cleanedText = text.replace(/[-.*#]/g, '');
    
    // If the cleaned text is "0" or empty, don't update the state
    // This prevents entering "0" as a value
    if (cleanedText === '0' || cleanedText === '') {
      // Option 1: Keep current value (preferred if you want to prevent clearing)
      return;
      
      // Option 2: Clear the input (if you want to allow clearing but not "0")
      // setUnitPrice('');
    } else {
      setUnitPrice(cleanedText);
    }
  }}
  keyboardType="numeric"
/>

                  <Text className="mt-4 text-sm  pb-2">
                    {t("FixedAssets.totalPrice")}
                  </Text>
                  <View className="border border-[#F4F4F4] p-4 rounded-full bg-[#F4F4F4] pl-4">
                    <Text>{totalPrice.toFixed(2)}</Text>
                  </View>
                </View>
                {/* Warranty Section */}
                <Text className="pt-5  pb-3 ">{t("FixedAssets.warranty")}</Text>
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
                    <Text className=" pb-3  ">
                      {t("FixedAssets.purchasedDate")}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowPurchasedDatePicker(prev => !prev)}
                    >
                      <View className="border border-[#F4F4F4] p-4 pl-4 pr-4 rounded-full flex-row bg-[#F4F4F4]  justify-between">
                       <Text>
  {purchasedDate ? purchasedDate.toLocaleDateString() : t("CurrentAssets.purchasedate")}
</Text>
                        <Icon name="calendar-outline" size={20} color="#6B7280" />
                      </View>
                      
                    </TouchableOpacity>
                   

{showPurchasedDatePicker  &&
                (Platform.OS === "ios" ? (
                  <View className=" justify-center items-center z-50  bg-gray-100  rounded-lg">
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
                              [{ text: t("Main.ok") }]
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
                            [{ text: t("Main.ok") }]
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

                    <Text className="pt-5  pb-3">
                      {t("FixedAssets.warrantyExpireDate")}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowExpireDatePicker(prev => !prev)}
                    >
                      <View className="border border-[#F4F4F4] p-4 pl-4 pr-4 rounded-full flex-row bg-[#F4F4F4]  justify-between">
                      <Text className="">
  {expireDate ? expireDate.toLocaleDateString() : t("CurrentAssets.expiredate")}
</Text>
                        <Icon name="calendar-outline" size={20} color="#6B7280" />
                      </View>
                    </TouchableOpacity>
                   

{showExpireDatePicker &&
                (Platform.OS === "ios" ? (
                  <View className=" justify-center items-center z-50  bg-[#F4F4F4]  rounded-lg">
                    <DateTimePicker
                    value={expireDate || new Date()}
                      mode="date"
                      display="inline"
                      style={{ width: 320, height: 260 }}
                      onChange={(event, selectedDate) => {
                        if (event.type === "set" && selectedDate) {
                        if (purchasedDate && selectedDate < purchasedDate) {
                            Alert.alert(
                              t("FixedAssets.sorry"),
                              t("FixedAssets.expireDateCannotBeFuture"),
                              [{ text: t("Main.ok") }]
                            );
                          } else {
                            setExpireDate(selectedDate);
                          }
                        }
                        setShowExpireDatePicker(false);
                      }}
                      maximumDate={(() => {
                        const maxDate = new Date();
                        maxDate.setFullYear(maxDate.getFullYear() + 200);
                        return maxDate;
                      })()} 
                    />
                  </View>
                ) : (
                  <DateTimePicker
                 value={expireDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      if (event.type === "set" && selectedDate) {
                      if (purchasedDate && selectedDate < purchasedDate){
                          Alert.alert(
                            t("FixedAssets.sorry"),
                            t("FixedAssets.expireDateCannotBeFuture"),
                            [{ text: t("Main.ok") }]
                          );
                        } else {
                          setExpireDate(selectedDate);
                        }
                      }
                      setShowExpireDatePicker(false);
                    }}
                  />
                ))}

                    {errorMessage ? (
                      <Text className="text-red-500 mt-2">{errorMessage}</Text>
                    ) : null}

                   

                    {/* <Text className="mt-4 text-sm">
                      {t("FixedAssets.warrantyStatus")}
                    </Text> */}

                   {/* Conditional Warranty Status Display - Only show when both dates are selected */}
{/* {warranty === "yes" && purchasedDate && expireDate && (
  <View className="border border-[#F4F4F4] rounded-full bg-gray-100 p-2 mt-2">
    <Text
      style={{
        color: expireDate > new Date() ? "#26D041" : "#FF0000",
        fontWeight: "bold",
        textAlign: "center",
      }}
    >
      {expireDate > new Date()
        ? t("FixedAssets.valid")
        : t("FixedAssets.expired")}
    </Text>
  </View>
)} */}

 <Text className="mt-4 text-sm">
                        {t("FixedAssets.warrantyStatus")}
                    </Text>

                    {/* Conditional Warranty Status Display */}
                    {/* Conditional Warranty Status Display */}
<View className="border border-[#F4F4F4] rounded-full bg-gray-100 p-2 mt-2">
  <Text
    style={{
      color: purchasedDate && expireDate 
        ? (expireDate.getTime() > new Date().getTime() ? "#26D041" : "#FF0000")
        : "#6B7280",
      fontWeight: "bold",
      textAlign: "center",
    }}
  >
    {purchasedDate && expireDate
      ? (expireDate.getTime() > new Date().getTime()
          ? t("FixedAssets.valid")
          : t("FixedAssets.expired"))
      : t("CurrentAssets.status")}
  </Text>
</View>
                    {/* <View className="border border-[#F4F4F4] rounded-full bg-gray-100 p-2 mt-2">
                      <Text
                       style={{
        color: purchasedDate && expireDate && expireDate > new Date() ? "#26D041" : purchasedDate && expireDate ? "#FF0000" : "#6B7280",
        fontWeight: "bold",
        textAlign: "center",
      }}
                      >
                      {purchasedDate && expireDate
        ? (expireDate.getTime() > new Date().getTime()
            ? t("FixedAssets.valid")
            : t("FixedAssets.expired"))
        : t("CurrentAssets.status")}
                         
                      </Text>
                    </View> */}
                  </>
                )}
              </View>
            ) : (
              <View>
                {/* Type Picker for "Building and Infrastructures" */}
                <Text className="mt-4 text-sm pb-2">
                  {t("FixedAssets.type")}
                </Text>
                <View className="rounded-full ">
                  <DropDownPicker
                    open={openType}
                    value={type}
                    setOpen={(open) => {
                      setOpenType(open);
                      setOpenLandOwnership(false);
                      setOpenGeneralCondition(false);
                      setOpenOwnership(false);
                    }}
                    setValue={(itemValue: any) => setType(itemValue)}
                    items={[
                      { label: t("FixedAssets.barn"), value: "Barn" },
                      { label: t("FixedAssets.silo"), value: "Silo" },
                      {
                        label: t("FixedAssets.greenhouseStructure"),
                        value: "Greenhouse structure",
                      },
                      {
                        label: t("FixedAssets.storageFacility"),
                        value: "Storage facility",
                      },
                      {
                        label: t("FixedAssets.storageShed"),
                        value: "Storage shed",
                      },
                      {
                        label: t("FixedAssets.processingFacility"),
                        value: "Processing facility",
                      },
                      {
                        label: t("FixedAssets.packingShed"),
                        value: "Packing shed",
                      },
                      {
                        label: t("FixedAssets.dairyParlor"),
                        value: "Dairy parlor",
                      },
                      {
                        label: t("FixedAssets.poultryHouse"),
                        value: "Poultry house",
                      },
                      {
                        label: t("FixedAssets.livestockShelter"),
                        value: "Livestock shelter",
                      },
                    ]}
                    placeholder={t("FixedAssets.selectAssetType")}
                    placeholderStyle={{ color: "#6B7280" }}
                    dropDownContainerStyle={{
                      borderColor: "#ccc",
                      borderWidth: 1,
                      backgroundColor: "#F4F4F4",
                      maxHeight: 300,
                    }}
                    style={{
                      borderWidth: 1,
                      borderColor: "#F4F4F4",
                      backgroundColor: "#F4F4F4",
                      borderRadius: 30,
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                    }}
                    textStyle={{
                      fontSize: 14,
                    }}
                    onOpen={dismissKeyboard}
                    zIndex={20000}
                    zIndexInverse={1000}
                    listMode="SCROLLVIEW"
                    scrollViewProps={{
                  nestedScrollEnabled: true,
                }}
                  />
                </View>

        
                <Text className="mt-4 text-sm pb-2 ">
                  {t("FixedAssets.floorAreaSqrFt")}
                </Text>
                <TextInput
                  className="border border-[#F4F4F4] p-3 pl-4  rounded-full bg-[#F4F4F4]"
                  placeholder={t("FixedAssets.enterFloorArea")}
                //  value={floorArea}
                value={formatNumberWithCommas(floorArea)}
                  // onChangeText={setFloorArea}
                    // onChangeText={(text) => {
                    //         const cleanedText = text.replace(/[-*#]/g, '');
                    //        setFloorArea(cleanedText);
                    //       }}
                     onChangeText={(text) => {
    const cleanedText = text.replace(/[-.*#,]/g, '');
    
    // If the cleaned text is "0" or empty, clear the input
    if (cleanedText === '0' || cleanedText === '') {
      setNumberOfUnits('');
    } else {
      setNumberOfUnits(cleanedText);
    }
  }}
                  onFocus={() => setOpenOwnership(false)}
                  keyboardType="numeric"
                />

                {/* Ownership Picker */}
                <Text className="mt-4 text-sm pb-2">
                  {t("FixedAssets.ownership")}
                </Text>
                <View className="rounded-full ">
                  <DropDownPicker
                    open={openOwnership}
                    value={ownership}
                    setOpen={(open) => {
                      setOpenOwnership(open);
                      setOpenGeneralCondition(false); // Close general condition when ownership is opened
                    }}
                    setValue={(itemValue: any) => setOwnership(itemValue)}
                    items={ownershipCategories.map((item) => ({
                      label: t(item.translationKey),
                      value: item.value,
                    }))}
                    placeholder={t("FixedAssets.selectOwnershipCategory")}
                    placeholderStyle={{ color: "#6B7280" }}
                    dropDownContainerStyle={{
                      borderColor: "#F4F4F4",
                      borderWidth: 1,
                      backgroundColor: "#F4F4F4",
                      maxHeight: 300,
                    }}
                    style={{
                      borderWidth: 1,
                      borderColor: "#F4F4F4",
                      backgroundColor: "#F4F4F4",
                      borderRadius: 30,
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                    }}
                    textStyle={{
                      fontSize: 14,
                    }}
                    onOpen={dismissKeyboard}
                    zIndex={6000}
                    zIndexInverse={1000}
                    listMode="SCROLLVIEW"
                scrollViewProps={{
                  nestedScrollEnabled: true,
                }}
                  />
                </View>

                {/* Conditional Ownership Fields */}
                {ownership === "Own Building (with title ownership)" && (
                  <View>
                    <Text className="mt-4 text-sm pb-2">
                      {t("FixedAssets.estimatedBuildingValueLKR")}
                    </Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-3 rounded-full bg-[#F4F4F4] pl-4"
                      placeholder={t("FixedAssets.estimatedBuildingValueLKR")}
                      value={estimateValue}
                      // onChangeText={setEstimatedValue}
                      //  onChangeText={(text) => {
                      //       const cleanedText = text.replace(/[-*#]/g, '');
                      //      setEstimatedValue(cleanedText);
                      //     }}
                       onChangeText={(text) => {
    const cleanedText = text.replace(/[-.*#,]/g, '');
    
    // If the cleaned text is "0" or empty, clear the input
    if (cleanedText === '0' || cleanedText === '') {
      setNumberOfUnits('');
    } else {
      setNumberOfUnits(cleanedText);
    }
  }}
                      keyboardType="numeric"
                    />
                  </View>
                )}
                {ownership === "Leased Building" && (
                  <View className="mt-4">
                    <Text className=" pb-2 ">
                      {t("FixedAssets.startDate")}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowStartDatePicker(prev => !prev)}
                    >
                      <View className="border border-[#F4F4F4] p-4 pl-4 pr-4 rounded-full flex-row bg-[#F4F4F4]  justify-between">
                        <Text className="">
                          {startDate.toLocaleDateString()}
                        </Text>
                        <Icon name="calendar-outline" size={20} color="#6B7280" />
                      </View>
                    </TouchableOpacity>

                


{showStartDatePicker &&
                (Platform.OS === "ios" ? (
                  <View className=" justify-center items-center z-50  bg-[#F4F4F4]  rounded-lg">
                    <DateTimePicker
                     value={startDate || new Date()}
                      mode="date"
                      display="inline"
                      style={{ width: 320, height: 260 }}
                      onChange={(event, selectedDate) => {
                        if (event.type === "set") {
                          onStartDateChange(selectedDate); // Call date change handler
                          setShowStartDatePicker(false); // Close picker
                        } else {
                          setShowStartDatePicker(false); // Close picker on cancel
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
                        onStartDateChange(selectedDate); // Call date change handler
                        setShowStartDatePicker(false); // Close picker
                      } else {
                        setShowStartDatePicker(false); // Close picker on cancel
                      }
                    }}
                    maximumDate={new Date()}
                  />
                ))}

                    <Text className="mt-4 text-sm pb-2">
                      {t("FixedAssets.duration")}
                    </Text>

                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center ">
                        <Text className=" w-[20%] text-right pr-2">
                          {t("FixedAssets.years")}
                        </Text>

                        <TextInput
                          className="border border-[#F4F4F4] p-2 text-left  px-4 rounded-full bg-[#F4F4F4] w-[30%]"
                          value={durationYears}
                          // onChangeText={setDurationYears}
                           onChangeText={(text) => {
                            const cleanedText = text.replace(/[-.*#]/g, '');
                            setDurationYears(cleanedText);
                          }}

                          keyboardType="numeric"
                        />

                        <Text className=" w-[20%] text-right pr-2 ">
                          {t("FixedAssets.months")}
                        </Text>

                       
                        <TextInput
  className="border border-[#F4F4F4] p-2 w-[30%] px-4  rounded-full bg-[#F4F4F4]"
  value={durationMonths}
  onChangeText={(text) => {
    // Remove unwanted characters
    const cleanedText = text.replace(/[-.*#]/g, '');
    
    // Convert to number for validation
    const numericValue = parseInt(cleanedText, 10);
    
    // Only allow values from 0 to 12
    if (cleanedText === '' || (numericValue >= 0 && numericValue <= 12)) {
      setDurationMonths(cleanedText);
    }
  }}
  keyboardType="numeric"
  maxLength={2} // Prevents typing more than 2 digits
/>
                      </View>
                    </View>

                    <View className="pt-[5%]">
                      <Text className=" pb-2">
                        {t("FixedAssets.leasedAmountAnnually")}
                      </Text>
                      <TextInput
                        className="border border-[#F4F4F4] p-3 rounded-full bg-[#F4F4F4] pl-4"
                        value={leastAmountAnnually}
                        // onChangeText={setLeastAmountAnnually}
                        // onChangeText={(text) => {
                        //     const cleanedText = text.replace(/[-*#]/g, '');
                        //    setLeastAmountAnnually(cleanedText);
                        //   }}
                         onChangeText={(text) => {
    const cleanedText = text.replace(/[-.*#,]/g, '');
    
    // If the cleaned text is "0" or empty, clear the input
    if (cleanedText === '0' || cleanedText === '') {
      setNumberOfUnits('');
    } else {
      setNumberOfUnits(cleanedText);
    }
  }}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                )}

                {ownership == "Permit Building" && (
                  <View className="mt-4">
                    <Text className="pb-2">{t("FixedAssets.issuedDate")}</Text>
                    <TouchableOpacity
                      onPress={() => setShowLbIssuedDatePicker(prev => !prev)}
                    >
                      <View className="border border-[#F4F4F4] p-4 pl-4 pr-4 rounded-full flex-row bg-[#F4F4F4]  justify-between">
                        <Text>
                          {lbissuedDate
                            ? lbissuedDate.toLocaleDateString()
                            : "Select Date"}
                        </Text>
                         <Icon name="calendar-outline" size={20} color="#6B7280" />
                      </View>
                    </TouchableOpacity>

                   

{showLbIssuedDatePicker&&
                (Platform.OS === "ios" ? (
                  <View className=" justify-center items-center z-50  bg-gray-100  rounded-lg">
                    <DateTimePicker
                      value={lbissuedDate || new Date()}
                      mode="date"
                      display="inline"
                      style={{ width: 320, height: 260 }}
                      onChange={(event, selectedDate) => {
                        if (event.type === "set") {
                          onPermitIssuedDateChange(selectedDate); // Call date change handler
                          setShowLbIssuedDatePicker(false); // Close picker
                        } else {
                          setShowLbIssuedDatePicker(false); // Close picker on cancel
                        }
                      }}
                      maximumDate={new Date()}
                    />
                  </View>
                ) : (
                  <DateTimePicker
                    value={startDate}
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
                    maximumDate={new Date()}
                  />
                ))}

                    <View className="mt-4">
                      <Text className="pb-2">
                        {t("FixedAssets.permitAnnuallyLKR")}
                      </Text>
                      <TextInput
                        className="border border-[#F4F4F4] p-3 rounded-full bg-[#F4F4F4] pl-4"
                        value={permitFeeAnnually}
                        // onChangeText={setPermitFeeAnnually}
                        // onChangeText={(text) => {
                        //     const cleanedText = text.replace(/[-*#]/g, '');
                        //    setPermitFeeAnnually(cleanedText);
                        //   }}
                         onChangeText={(text) => {
    const cleanedText = text.replace(/[-.*#,]/g, '');
    
    // If the cleaned text is "0" or empty, clear the input
    if (cleanedText === '0' || cleanedText === '') {
      setNumberOfUnits('');
    } else {
      setNumberOfUnits(cleanedText);
    }
  }}
                        keyboardType="numeric"
                        placeholder={t("FixedAssets.enterPermitAnnuallyLKR")}
                      />
                    </View>
                  </View>
                )}

                {ownership == "Shared / No Ownership" && (
                  <View className="mt-4">
                    <Text className="pb-2">
                      {t("FixedAssets.paymentAnnuallyLKR")}
                    </Text>
                    <TextInput
                      className="border border-[#F4F4F4] p-3 rounded-full bg-[#F4F4F4] pl-4"
                      value={paymentAnnually}
                      // onChangeText={setPaymentAnnually}
                      //  onChangeText={(text) => {
                      //       const cleanedText = text.replace(/[-*#]/g, '');
                      //      setPaymentAnnually(cleanedText);
                      //     }}
                       onChangeText={(text) => {
    const cleanedText = text.replace(/[-.*#,]/g, '');
    
    // If the cleaned text is "0" or empty, clear the input
    if (cleanedText === '0' || cleanedText === '') {
      setNumberOfUnits('');
    } else {
      setNumberOfUnits(cleanedText);
    }
  }}
                      keyboardType="numeric"
                      placeholder={t("FixedAssets.enterPaymentAnnuallyLKR")}
                    />
                  </View>
                )}

                {/* General Condition */}
                <Text className="mt-4 text-sm pb-2">
                  {t("FixedAssets.generalCondition")}
                </Text>
                <View className=" rounded-full ">
                  <DropDownPicker
                    open={openGeneralCondition}
                    value={generalCondition}
                    setOpen={setOpenGeneralCondition}
                    setValue={(itemValue: any) =>
                      setGeneralCondition(itemValue)
                    }
                    items={generalConditionOptions.map((item) => ({
                      label: t(item.translationKey),
                      value: item.value,
                    }))}
                    placeholder={t("FixedAssets.selectGeneralCondition")}
                    placeholderStyle={{ color: "#6B7280" }}
                    dropDownContainerStyle={{
                      borderColor: "#F4F4F4",
                      borderWidth: 1,
                      backgroundColor: "#F4F4F4",
                      maxHeight: 280,
                    }}
                    style={{
                      borderWidth: 1,
                      borderColor: "#F4F4F4",
                      backgroundColor: "#F4F4F4",
                      borderRadius: 30,
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                    }}
                    textStyle={{
                      fontSize: 14,
                    }}
                    onOpen={dismissKeyboard}
                    zIndex={3000}
                    listMode="SCROLLVIEW"
                scrollViewProps={{
                  nestedScrollEnabled: true,
                }}
                  />
                </View>

                {/* District Picker */}
                <Text className="mt-4 text-sm  pb-2">
                  {t("FixedAssets.district")}
                </Text>
                <View className=" rounded-full ">
                  <DropDownPicker
                    open={openDistrict}
                    value={district}
                    setOpen={setOpenDistrict}
                    setValue={(itemValue: any) => setDistrict(itemValue)}
                    items={districtOptions.map((item) => ({
                      label: t(item.translationKey),
                      value: item.value,
                    }))}
                    placeholder={t("FixedAssets.selectDistrict")}
                    placeholderStyle={{ color: "#6B7280" }}
                    dropDownDirection="BOTTOM"
                    style={{
                      borderColor: "#F4F4F4",
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
                    modalProps={{
  animationType: "slide",
  transparent: false,
  presentationStyle: "fullScreen",
  statusBarTranslucent: false,
}}
modalContentContainerStyle={{
  paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  backgroundColor: '#fff',
}}
                    onOpen={dismissKeyboard}
                    zIndex={1000}
                  />
                </View>
              </View>
            )}
            <View className="flex-1 items-center pt-8 mb-16 ml-10 mr-10">
              {/* <TouchableOpacity
                className="bg-gray-900 p-4 rounded-3xl mb-6 h-13 w-72 "
                onPress={submitData}
              >
                {loading ? (
                      //  <LottieView
                      //                             source={require('../../assets/jsons/loader.json')}
                      //                             autoPlay
                      //                             loop
                      //                             style={{ width: 20, height: 20 }}
                      //                           />
                      <ActivityIndicator size="large" color="white" />
                ) : (
                  <Text className="text-white text-base text-center">
                    {t("FixedAssets.save")}
                  </Text>
                  
                )}
              </TouchableOpacity> */}
             <TouchableOpacity
  className={`${
    warranty === "yes" && purchasedDate && expireDate && expireDate < new Date() 
      ? "bg-gray-400" 
      : "bg-gray-900"
  } p-4 rounded-3xl mb-6 h-13 w-72`}
  onPress={submitData}
  disabled={loading || (warranty === "yes" && purchasedDate && expireDate && expireDate < new Date() ? true : false)}
>
  {loading ? (
    <ActivityIndicator size="large" color="white" />
  ) : (
    <Text className="text-white text-base text-center">
      {warranty === "yes" && purchasedDate && expireDate && expireDate < new Date()
        ? t("FixedAssets.expired")  
        : t("FixedAssets.save")}    
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

export default FarmAddFixAssert;
