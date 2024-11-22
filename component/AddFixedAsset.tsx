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
      { key: "4", value: "2WD" },
      { key: "5", value: "4WD" },
    ],

    Transplanter: [{ key: "14", value: "Paddy transplanter" }],
    "Harvesting equipment": [
      { key: "15", value: "Sugarcane harvester" },
      { key: "16", value: "Static shedder" },
      { key: "17", value: "Mini combine harvester" },
      { key: "18", value: "Rice Combine harvester" },
      { key: "19", value: "Paddy harvester" },
      { key: "20", value: "Maize harvester" },
    ],
    "Cleaning, Grading and Weighing Equipment": [
      { key: "21", value: "Seperator" },
      { key: "22", value: "Centrifugal Stier Machine" },
      { key: "23", value: "Grain Classifier Seperator" },
      { key: "24", value: "Destoner Machine" },
    ],
    Sprayers: [
      { key: "25", value: "Knapsack Sprayer" },
      { key: "26", value: "Chemical Sprayer" },
      { key: "27", value: "Mist Blower" },
      { key: "28", value: "Environmental friendly sprayer" },
      { key: "29", value: "Drone sprayer" },
      { key: "30", value: "Pressure Sprayer" },
    ],
  };

  const brandTypesForAssets: any = {
    Tractors: [
      { key: "1", value: "E Kubota EK3 - 471 Hayles" },
      { key: "2", value: "Kubota L4508 4wd Tractor Hayles" },
      { key: "3", value: "Kubota L3408 4wd Tractor - Hayles" },
      { key: "4", value: "Tafe - Browns" },
      { key: "5", value: "Massey Ferguson - Browns" },
      { key: "6", value: "Yanmar - Browns" },
      { key: "7", value: "Sumo - Browns" },
      { key: "8", value: "Sifang - Browns" },
      { key: "9", value: "Uikyno - Browns" },
      { key: "10", value: "Shakthiman - Browns" },
      { key: "11", value: "Fieldking - Browns" },
      { key: "12", value: "National - Browns" },
      { key: "13", value: "Gaspardo - Browns" },
      { key: "14", value: "Agro Vision - Browns" },
      { key: "15", value: "50 HP - ME" },
      { key: "16", value: "ME" },
      { key: "17", value: "Mahindra - DIMO" },
      { key: "18", value: "Swaraj - DIMO" },
      { key: "19", value: "Claas - DIMO" },
      { key: "20", value: "LOVOL - DIMO" },
      { key: "21", value: "Kartar" },
      { key: "22", value: "Shakthiman" },
      { key: "23", value: "Ginhua" },
    ],

    Rotavator: [{ key: "24", value: "Shaktiman Fighter Rotavator" }],
    "Combine harvesters": [
      { key: "25", value: "Agrotech Kool Combine Harvester - Hayleys" },
      { key: "26", value: "Agrotech Eco Combine Harvester - Hayleys" },
      { key: "27", value: "Kubota DC-70G Plus Combine Harvester - Hayleys" },
    ],
    Transplanters: [
      { key: "28", value: "Kubota NSP - 4W Rice Transplanter - Hayleys" },
      { key: "29", value: "Transplanters - Dimo" },
      { key: "30", value: "ARBOS" },
      { key: "31", value: "National" },
    ],
    "Tillage Equipment": [
      { key: "32", value: "13 Tyne Cultivator Spring Loaded -  ME" },
      { key: "33", value: "Terracer Blade/Leveller  ME" },
      { key: "34", value: "Rotary Tiller - ME" },
      { key: "35", value: "Power harrow -  ME" },
      { key: "36", value: "Mounted Disc Ridger -  ME" },
      { key: "37", value: "Disc Harrow Tractor Mounted -  ME" },
      { key: "38", value: "Disk Plough-  ME" },
      { key: "39", value: "Mini Tiller" },
      { key: "40", value: "Hand plough" },
      { key: "41", value: "Tine tiller" },
      { key: "42", value: "Browns" },
      { key: "43", value: "Hayles" },
      { key: "44", value: "Dimo" },
    ],
    "Sowing equipment": [
      { key: "45", value: "Seed Sowing Machine - ME" },
      { key: "46", value: "Automatic Seed Sowing Machine - ME" },
    ],
    "Harvesting equipment": [
      { key: "47", value: "Combine harvester - ME" },
      { key: "48", value: "4LZ 3.0 Batta Harvester" },
      { key: "49", value: "4LZ 6.0P Combine Harvester" },
      { key: "50", value: "4LZ 4.0E Combine Harvester" },
      { key: "51", value: "Browns" },
      { key: "52", value: "Hayles" },
      { key: "53", value: "Yanmar - Browns" },
      { key: "54", value: "360 TAF" },
      { key: "55", value: "AGRIUNNION" },
      { key: "56", value: "KARTAR" },
    ],

    "Threshers, Reaper, Binders": [
      { key: "57", value: "Mini Combine Cutter Thresher - ME" },
      { key: "58", value: "Multi Crop Cutter Thresher - ME" },
    ],
    "Cleaning, Grading and Weighing Equipment": [
      { key: "59", value: "Grill Type Magnetic Separator - ME" },
      { key: "60", value: "Vibrio Separator Machine - ME" },
      { key: "61", value: "Centrifugal Stifer Machine - ME" },
      { key: "62", value: "Intensive Scourer - ME" },
      { key: "63", value: "Grain Classifier Separator - ME" },
      { key: "64", value: "Grain Cleaning Machine - ME" },
      { key: "65", value: "Destoner Machine - ME" },
      { key: "66", value: "Browns" },
      { key: "67", value: "Hayles" },
    ],
    Weeding: [
      { key: "68", value: "FarmWeeding Ditching - ME" },
      { key: "69", value: "Slasher" },
      { key: "70", value: "Browns" },
      { key: "71", value: "Hayles" },
      { key: "72", value: "Dimo" },
    ],
    Sprayers: [
      { key: "73", value: "Knapsack Power Sprayer - ME" },
      { key: "74", value: "Oregon Sprayer" },
      { key: "75", value: "Chemical Sprayer" },
      { key: "76", value: "Mist Blower" },
      { key: "77", value: "DBL" },
      { key: "78", value: "Browns" },
      { key: "79", value: "Hayles" },
      { key: "80", value: "National" },
      { key: "81", value: "ARBOS" },
      { key: "82", value: "Gardena" },
      { key: "92", value: "Tractor Mounted Sprayer - ME" },
    ],
    "Shelling and Grinding Machine": [
      { key: "93", value: "Maize Processing Machine - ME" },
      { key: "94", value: "Maize Coen Thresher - ME" },
    ],
    Sowing: [
      { key: "95", value: "Steel and Plastic Seed Sowing Machine" },
      { key: "96", value: "Tractor Mounted Sprayer" },
    ],
  };

  const Machineasset = [
    { key: "0", value: "", translationKey: t("FixedAssets.selectAsset") },
    { key: "1", value: "Tractors" },
    { key: "2", value: "Rotavator" },
    { key: "3", value: "Combine Harvesters" },
    { key: "4", value: "Transplanter" },
    { key: "5", value: "Tillage Equipment" },
    { key: "6", value: "Sowing Equipment" },
    { key: "7", value: "Harvesting Equipment" },
    { key: "8", value: "Threshers, Reaper, Binders" },
    { key: "9", value: "Cleaning, Grading and Weighing Equipment" },
    { key: "10", value: "Weeding" },
    { key: "11", value: "Sprayers" },
    { key: "12", value: "Shelling and Grinding Machine" },
    { key: "13", value: "Sowing" },
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
      Alert.alert("Invalid Date", "The start date cannot be in the future.", [
        { text: "OK" },
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
      Alert.alert("Invalid Date", "The issued date cannot be in the future.", [
        { text: "OK" },
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
      Alert.alert(t("Error"), t("FixedAssets.selectCategory"));
      return;
    }

    const showError = (field: string, message: string): never => {
      Alert.alert(t("Error"), message);
      throw new Error(`${field} is required`);
    };

    try {
      // **Building and Infrastructures** category validation
      if (category === "Building and Infrastructures") {
        if (!ownership)
          showError("ownership", t("FixedAssets.selectOwnershipCategory"));
        if (!type) showError("type", t("FixedAssets.selectAssetType"));
        if (!floorArea) showError("floorArea", t("FixedAssets.enterFloorArea"));
        if (!generalCondition)
          showError(
            "generalCondition",
            t("FixedAssets.selectGeneralCondition")
          );
        if (!district) showError("district", t("FixedAssets.selectDistrict"));

        if (
          ownership === "Own Building (with title ownership)" &&
          !estimateValue
        ) {
          showError(
            "estimateValue",
            t("FixedAssets.enterEstimatedBuildingValueLKR")
          );
        } else if (
          ownership === "Leased Building" &&
          (!startDate || !durationYears)
        ) {
          showError("leaseDetails", t("FixedAssets.enterDuration"));
        } else if (ownership === "Leased Building" && !leastAmountAnnually) {
          showError(
            "leaseDetails",
            t("FixedAssets.enterLeasedAmountAnnuallyLKR")
          );
        } else if (
          ownership === "Permit Building" &&
          (!issuedDate || !permitFeeAnnually)
        ) {
          showError("permitDetails", t("FixedAssets.enterPermitAnnuallyLKR"));
        } else if (ownership === "Shared / No Ownership" && !paymentAnnually) {
          showError(
            "paymentAnnually",
            t("FixedAssets.enterPaymentAnnuallyLKR")
          );
        }
      }

      // **Land** category validation
      if (category === "Land") {
        if (!district) showError("district", t("FixedAssets.selectDistrict"));
        if (!extentha && !extentac && !extentp) {
          showError("extent", t("FixedAssets.enterFloorArea"));
        }
        if (!landFenced) showError("landfenced", t("FixedAssets.isLandFenced"));
        if (!perennialCrop)
          showError(
            "perennialCrop",
            t("FixedAssets.areThereAnyPerennialCrops")
          );

        if (landownership === "Own" && !estimateValue) {
          showError(
            "estimateValue",
            t("FixedAssets.enterEstimatedBuildingValueLKR")
          );
        } else if (landownership === "Lease" && !leastAmountAnnually) {
          showError(
            "leaseDetails",
            t("FixedAssets.enterLeasedAmountAnnuallyLKR")
          );
        } else if (
          landownership === "Lease" &&
          (!startDate || !durationYears)
        ) {
          showError("leaseDetails", t("FixedAssets.enterDuration"));
        } else if (landownership === "Permited" && !issuedDate) {
          showError("permitDetails", t("FixedAssets.selectIssuedDate"));
        } else if (landownership === "Permited" && !permitFeeAnnually) {
          showError(
            "permitDetails",
            t("FixedAssets.enterPermitFeeAnnuallyLKR")
          );
        } else if (landownership === "Shared" && !paymentAnnually) {
          showError(
            "paymentAnnually",
            t("FixedAssets.enterPaymentAnnuallyLKR")
          );
        }
      }

      if (category === "Machine and Vehicles") {
        if (!asset) showError("asset", t("FixedAssets.selectAsset"));

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
          showError("brand", t("FixedAssets.selectBrand"));
        } else if (
          typeAndBrandAssets.includes(asset) &&
          (!assetType || !brand)
        ) {
          showError(
            "typeBrand",
            !assetType
              ? t("FixedAssets.selectAssetType")
              : t("FixedAssets.selectBrand")
          );
        }

        if (assetType === "Other" && !mentionOther) {
          showError("mentionOther", t("FixedAssets.mentionOther"));
        }

        const requiredFields: { [key: string]: string } = {
          numberOfUnits: t("FixedAssets.enterNumberofUnits"),
          unitPrice: t("FixedAssets.enterUnitPrice"),
          warranty: t("FixedAssets.selectWarranty"),
        };
        if (!numberOfUnits || !unitPrice || !warranty) {
          showError(
            "general",
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
          showError("warrantyDates", t("FixedAssets.warrantyDatesRequired"));
        }
      }

      if (category === "Tools") {
        if (!assetname) showError("assetname", t("FixedAssets.selectAsset"));
        if (assetname === "Other" && !othertool)
          showError("othertool", t("FixedAssets.mentionOther"));
        if (!toolbrand) showError("toolbrand", t("FixedAssets.selectBrand"));
        if (!numberOfUnits)
          showError("numberOfUnits", t("FixedAssets.enterNumberofUnits"));
        if (!unitPrice) showError("unitPrice", t("FixedAssets.enterUnitPrice"));
        if (!warranty) showError("warranty", t("FixedAssets.selectWarranty"));
        if (warranty === "yes" && (!purchaseDate || !expireDate)) {
          showError("warrantyDates", t("FixedAssets.warrantyDatesRequired"));
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
      console.log("Data submitted successfully:", response.data);
      Alert.alert("Success", t("FixedAssets.assetAddSuccessfuly"), [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error("Error submitting data:", error);
      if (error.response) {
        Alert.alert("Error", `Server error: ${error.response.data.message}`);
      } else if (error.request) {
        Alert.alert(
          "Error",
          "No response from server. Please try again later."
        );
      } else {
        Alert.alert("Error", "Failed to add asset. Please try again.");
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
                      label={item.value || item.translationKey}
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
                            label={item.value}
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
                  <Text>Mention Other</Text>
                  <TextInput
                    className="border border-gray-300 p-2 rounded-full bg-gray-100"
                    placeholder="Mention Other"
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
                            label={item.value}
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
                              t("Invalid Date"),
                              t("The purchased date cannot be in the future."),
                              [{ text: t("OK") }]
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
                      {expireDate > new Date() ? t("Valid") : t("Expired")}
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
              <View className="items-center flex-row gap-0 ">
                <View className="items-center flex-row ">
                  <Text className=" pr-2">{t("FixedAssets.ha")}</Text>

                  <TextInput
                    className="border border-gray-300 p-2 w-20 rounded-2xl bg-gray-100"
                    value={extentha}
                    onChangeText={setExtentha}
                    keyboardType="numeric"
                  />
                </View>
                <View className="items-center flex-row ">
                  <Text className="pl-3 pr-2">{t("FixedAssets.ac")}</Text>

                  <TextInput
                    className="border border-gray-300 p-2 w-20 rounded-2xl bg-gray-100"
                    value={extentac}
                    onChangeText={setExtentac}
                    keyboardType="numeric"
                  />
                </View>
                <View className="items-center flex-row ">
                  <Text className="pl-3 pr-2">{t("FixedAssets.p")}</Text>

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
                    <Picker.Item label="Hand Fork" value="Hand Fork" />
                    <Picker.Item label="Cutting knife" value="Cutting knife" />
                    <Picker.Item label="Iluk kaththa" value="Iluk kaththa" />
                    <Picker.Item label="Kaththa" value="Kaththa" />
                    <Picker.Item
                      label="Kara diga manna"
                      value="Kara diga manna"
                    />
                    <Picker.Item
                      label="Coconut harvesting knife"
                      value="Coconut harvesting knife"
                    />
                    <Picker.Item label="Tapping knife" value="Tapping knife" />
                    <Picker.Item label="Mamotie" value="Mamotie" />
                    <Picker.Item label="Manna knife" value="Manna knife" />
                    <Picker.Item label="Shovel" value="Shovel" />
                    <Picker.Item label="Small axe" value="Small axe" />
                    <Picker.Item label="Puning knife" value="Puning knife" />
                    <Picker.Item label="Hoe with fork" value="Hoe with fork" />
                    <Picker.Item label="Fork hoe" value="Fork hoe" />
                    <Picker.Item
                      label="Sickle - paddy"
                      value="Sickle - paddy"
                    />
                    <Picker.Item label="Grow bags" value="Grow bags" />
                    <Picker.Item label="Seedling tray" value="Seedling tray" />
                    <Picker.Item label="Fogger" value="Fogger" />
                    <Picker.Item
                      label="Drip Irrigation system"
                      value="Drip Irrigation system"
                    />
                    <Picker.Item
                      label="Sprinkler Irrigation system"
                      value="Sprinkler Irrigation system"
                    />
                    <Picker.Item label="Water pump" value="Water pump" />
                    <Picker.Item label="Water tank" value="Water tank" />
                    <Picker.Item label="Other" value="Other" />
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
                    <Picker.Item label="Lakloha" value="Lakloha" />
                    <Picker.Item label="Crocodile" value="Crocodile" />
                    <Picker.Item label="Chillington" value="Chillington" />
                    <Picker.Item label="Lanlo" value="Lanlo" />
                    <Picker.Item label="DBL" value="DBL" />
                    <Picker.Item label="Browns" value="Browns" />
                    <Picker.Item label="Hayles" value="Hayles" />
                    <Picker.Item label="Janatha steel" value="Janatha steel" />
                    <Picker.Item label="Lakwa" value="Lakwa" />
                    <Picker.Item label="CS Agro" value="CS Agro" />
                    <Picker.Item label="Aswenna" value="Aswenna" />
                    <Picker.Item label="Hayles" value="Hayles" />
                    <Picker.Item label="Piyadasa Agro" value="Piyadasa Agro" />
                    <Picker.Item label="Lak agro" value="Lak agro" />
                    <Picker.Item
                      label="John Piper International"
                      value="John Piper International"
                    />
                    <Picker.Item label="Dinapala" value="Dinapala" />
                    <Picker.Item label="ANTON" value="ANTON" />
                    <Picker.Item label="ARPICO" value="ARPICO" />
                    <Picker.Item label="S-lon" value="S-lon" />
                    <Picker.Item label="Singer" value="Singer" />
                    <Picker.Item label="INGCO" value="INGCO" />
                    <Picker.Item label="Jinasena" value="Jinasena" />
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
                              t("Invalid Date"),
                              t("The purchased date cannot be in the future."),
                              [{ text: t("OK") }]
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
                              t("Invalid Date"),
                              t(
                                "The expiration date cannot be earlier than the purchase date."
                              ),
                              [{ text: t("OK") }]
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
                      {expireDate > new Date() ? t("Valid") : t("Expired")}
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
                  <Picker.Item label="Barn" value="Barn" />
                  <Picker.Item label="Silo" value="Silo" />
                  <Picker.Item
                    label="Greenhouse structure"
                    value="Greenhouse structure"
                  />
                  <Picker.Item
                    label="Storage facility"
                    value="Storage facility"
                  />
                  <Picker.Item label="Storage shed" value="Storage shed" />
                  <Picker.Item
                    label="Processing facility"
                    value="Processing facility"
                  />
                  <Picker.Item label="Packing shed" value="Packing shed" />
                  <Picker.Item label="Dairy parlor" value="Dairy parlor" />
                  <Picker.Item label="Poultry house" value="Poultry house" />
                  <Picker.Item
                    label="Livestock shelter"
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
