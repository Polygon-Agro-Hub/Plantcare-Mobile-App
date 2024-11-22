import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
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
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

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
  const [years, setYears] = useState("");
  const [months, setMonths] = useState("");
  const [showIssuedDatePicker, setShowIssuedDatePicker] = useState(false);
  const [issuedDate, setIssuedDate] = useState(new Date());
  const [showLbIssuedDatePicker, setShowLbIssuedDatePicker] = useState(false);
  const [lbissuedDate, setLbIssuedDate] = useState(new Date());
  const [permitIssuedDate, setPermitIssuedDate] = useState(new Date());
  const [showPermitIssuedDatePicker, setShowPermitIssuedDatePicker] =
    useState(false);
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [dateError, setDateError] = useState("");
  const { t } = useTranslation();
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

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
    { key: 23, value: "Ratnapura", translationKey: t("FixedAssets.Ratnapura") },
    {
      key: 24,
      value: "Trincomalee",
      translationKey: t("FixedAssets.Trincomalee"),
    },
    { key: 25, value: "Vavuniya", translationKey: t("FixedAssets.Vavuniya") },
  ];

  const Machineasset = [
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
    { key: "14", value: "Other" },
  ];

  const ToolAssets = [
    { key: "1", value: "Hand Fork" },
    { key: "2", value: "Cutting knife" },
    { key: "3", value: "Iluk kaththa" },
    { key: "4", value: "Kaththa" },
    { key: "5", value: "Kara diga manna" },
    { key: "6", value: "Coconut harvesting knife" },
    { key: "7", value: "Tapping knife" },
    { key: "8", value: "Mamotie" },
    { key: "9", value: "Manna knife" },
    { key: "10", value: "Shovel" },
    { key: "11", value: "Small axe" },
    { key: "12", value: "Pruning knife" },
    { key: "13", value: "Hoe with fork" },
    { key: "14", value: "Fork hoe" },
    { key: "15", value: "Sickle - paddy" },
    { key: "16", value: "Grow bags" },
    { key: "17", value: "Seedling tray" },
    { key: "18", value: "Fogger" },
    { key: "19", value: "Drip Irrigation system" },
    { key: "20", value: "Sprinkler Irrigation system" },
    { key: "21", value: "Water pump" },
    { key: "22", value: "Water tank" },
    { key: "23", value: "Other" },
  ];

  const brands = [
    { key: "1", value: "Lakloha" },
    { key: "2", value: "Crocodile" },
    { key: "3", value: "Chillington" },
    { key: "4", value: "Lanlo" },
    { key: "5", value: "DBL" },
    { key: "6", value: "Browns" },
    { key: "7", value: "Hayles" },
    { key: "8", value: "Janatha steel" },
    { key: "9", value: "Lakwa" },
    { key: "10", value: "CS Agro" },
    { key: "11", value: "Aswenna" },
    { key: "12", value: "Hayles" },
    { key: "13", value: "Piyadasa Agro" },
    { key: "14", value: "Lak agro" },
    { key: "15", value: "John Piper International" },
    { key: "16", value: "Dinapala" },
    { key: "17", value: "ANTON" },
    { key: "18", value: "ARPICO" },
    { key: "19", value: "S-lon" },
    { key: "20", value: "Singer" },
    { key: "21", value: "INGCO" },
    { key: "22", value: "Jinasena" },
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
    // You can add more mappings for other assets if needed
    Rotavator: [{ key: "24", value: "Shaktiman Fighter Rotavator" }],
    "Combine Harvesters": [
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
    "Sowing Equipment": [
      { key: "45", value: "Seed Sowing Machine - ME" },
      { key: "46", value: "Automatic Seed Sowing Machine - ME" },
    ],
    "Harvesting Equipment": [
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

  const warrantystatus = [
    { key: "1", value: "yes" },
    { key: "2", value: "no" },
  ];

  const assetTypesForBuilding = [
    { key: "0", value: "", translationKey: t("FixedAssets.selectAssetType") },
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
        console.error("No token found in AsyncStorage");
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
      console.error("Error fetching selected tools:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchSelectedTools();
  }, [selectedTools]);

  const handleUpdateTools = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        console.error("No token found in AsyncStorage");
        return;
      }

      // Update each selected tool
      for (const tool of tools) {
        const { id, category } = tool;
        const updatedToolDetails = updatedDetails[id];
        console.log(updatedToolDetails);

        const payload = {
          ...updatedToolDetails,
          oldOwnership:
            updatedToolDetails?.oldOwnership || updatedToolDetails.ownership,
        };

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
      }

      Alert.alert(
        t("FixedAssets.successTitle"),
        t("FixedAssets.assetsUpdatedSuccessfully")
      );
      navigation.goBack(); // Go back after successful update
    } catch (error) {
      console.error("Error updating assets:", error);
      Alert.alert(
        t("FixedAssets.errorTitle"),
        t("FixedAssets.failToUpdateAssets")
      );
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

  // Handle change in input fields
  // const handleInputChange = (toolId: any, field: any, value: any) => {
  //   setUpdatedDetails((prevDetails: any) => {
  //     const fields = field.split(".");
  //     const toolDetails = { ...prevDetails[toolId] };

  //     if (fields.length > 1) {
  //       const [mainField, subField] = fields;
  //       toolDetails[mainField] = {
  //         ...toolDetails[mainField],
  //         [subField]: value,
  //       };
  //     } else {
  //       toolDetails[field] = value;
  //     }

  //     return {
  //       ...prevDetails,
  //       [toolId]: toolDetails,
  //     };
  //   });
  // };
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

  return (
    <ScrollView className="p-2 bg-white">
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#00ff00" />
        </View>
      ) : (
        tools.map((tool) => (
          <View key={tool.id} className="mb-4 p-4 bg-white rounded ">
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
                  {tool.category}
                </Text>
                <Text className="font-bold text-lg text-center">
                  {t("FixedAssets.edit")}
                </Text>
              </View>
            </View>

            {tool.category === "Land" && (
              <>
                <Text className=" pb-2 pt-8">{t("FixedAssets.district")}</Text>
                <View className="border border-gray-400 rounded-full bg-white mb-4  ">
                  <Picker
                    selectedValue={updatedDetails[tool.id]?.district || ""}
                    onValueChange={(value) =>
                      handleInputChange(tool.id, "district", value)
                    }
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
                <Text className=" pb-2 pt-2">{t("FixedAssets.extent")}</Text>
                <View className="flex-row gap-1 items-center pb-2">
                  <Text className="pr-1 ">{t("FixedAssets.ha")}</Text>
                  <TextInput
                    placeholder={t("FixedAssets.ha")}
                    value={updatedDetails[tool.id]?.extentha?.toString() || ""}
                    onChangeText={(value) =>
                      handleInputChange(tool.id, "extentha", value)
                    }
                    className="border border-gray-400  p-2 mb-2 rounded-2xl w-20"
                  />
                  <Text className="pl-2  pr-1">{t("FixedAssets.ac")}</Text>
                  <TextInput
                    placeholder={t("FixedAssets.ac")}
                    value={updatedDetails[tool.id]?.extentac?.toString() || ""}
                    onChangeText={(value) =>
                      handleInputChange(tool.id, "extentac", value)
                    }
                    className="border border-gray-400 rounded-xl p-2 mb-2 w-20"
                  />
                  <Text className="pl-2 pr-1 ">{t("FixedAssets.p")}</Text>
                  <TextInput
                    placeholder={t("FixedAssets.p")}
                    value={updatedDetails[tool.id]?.extentp?.toString() || ""}
                    onChangeText={(value) =>
                      handleInputChange(tool.id, "extentp", value)
                    }
                    className="border border-gray-400 rounded-xl p-2 mb-2 w-20"
                  />
                </View>

                <Text className=" pb-2 ">{t("FixedAssets.ownership")}</Text>
                <View className="border border-gray-300 rounded-full bg-white mb-4">
                  <Picker
                    selectedValue={updatedDetails[tool.id]?.ownership || ""}
                    onValueChange={(value) => {
                      // Set ownership to the new value
                      handleInputChange(tool.id, "ownership", value);

                      // Store the initial ownership as oldOwnership if it hasn't been set already
                      if (!("oldOwnership" in updatedDetails[tool.id])) {
                        handleInputChange(
                          tool.id,
                          "oldOwnership",
                          updatedDetails[tool.id]?.ownership || value
                        );
                      }
                    }}
                  >
                    {landownershipCategories.map((item) => (
                      <Picker.Item
                        label={t(item.translationKey)}
                        value={item.value}
                        key={item.key}
                      />
                    ))}
                  </Picker>
                </View>

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
                      onChangeText={(value) =>
                        handleInputChange(
                          tool.id,
                          "ownershipDetails.estimateValue",
                          value
                        )
                      }
                      className="border border-gray-400 rounded-full p-4 mb-4 pl-4"
                    />
                    <Text className=" pb-2 pt-2">
                      {t("FixedAssets.issuedDate")}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowIssuedDatePicker(true)}
                      className="border border-gray-400 rounded-full p-4 mb-4 pl-4"
                    >
                      <Text>
                        {updatedDetails[tool.id]?.ownershipDetails?.issuedDate
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

                    {showIssuedDatePicker && (
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
                    )}
                  </>
                )}

                {updatedDetails[tool.id]?.ownership === "Lease" && (
                  <>
                    <Text className="pb-2">{t("FixedAssets.startDate")}</Text>
                    <TouchableOpacity
                      onPress={() => setShowStartDatePicker(true)}
                      className="border border-gray-400 rounded-full p-4 mb-4 pl-4"
                    >
                      <Text>
                        {updatedDetails[tool.id]?.ownershipDetails?.startDate
                          ? new Date(
                              updatedDetails[tool.id].ownershipDetails.startDate
                            )
                              .toISOString()
                              .split("T")[0]
                          : t("FixedAssets.startDate")}
                      </Text>
                    </TouchableOpacity>

                    {showStartDatePicker && (
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
                    )}
                    <Text className="pb-2">{t("FixedAssets.duration")}</Text>
                    <View className="flex-row gap-x-4 items-center">
                      <Text className="">{t("FixedAssets.years")}</Text>
                      <TextInput
                        placeholder={t("FixedAssets.years")}
                        keyboardType="numeric"
                        value={
                          updatedDetails[
                            tool.id
                          ]?.ownershipDetails?.durationYears?.toString() || ""
                        }
                        onChangeText={(value) =>
                          handleInputChange(
                            tool.id,
                            "ownershipDetails.durationYears",
                            value
                          )
                        }
                        className="border border-gray-300 p-2 w-[110px] rounded-full bg-gray-100 pt-2 mb-4 pl-4"
                      />

                      <Text className="">{t("FixedAssets.months")}</Text>

                      <TextInput
                        placeholder={t("FixedAssets.months")}
                        keyboardType="numeric"
                        value={
                          updatedDetails[
                            tool.id
                          ]?.ownershipDetails?.durationMonths?.toString() || ""
                        }
                        onChangeText={(value) =>
                          handleInputChange(
                            tool.id,
                            "ownershipDetails.durationMonths",
                            value
                          )
                        }
                        className="border border-gray-300 p-2 w-[110px] rounded-full bg-gray-100 pt-2 mb-4 pl-4"
                      />
                    </View>

                    <Text className="pb-2 mt-2">
                      {t("FixedAssets.leasedAmountAnnually")}
                    </Text>
                    <TextInput
                      placeholder={t("FixedAssets.leasedAmountAnnually")}
                      value={
                        updatedDetails[tool.id]?.ownershipDetails
                          ?.leastAmountAnnually || ""
                      }
                      onChangeText={(value) =>
                        handleInputChange(
                          tool.id,
                          "ownershipDetails.leastAmountAnnually",
                          value
                        )
                      }
                      className="border border-gray-400 rounded-full p-4 mb-4 pl-4"
                    />
                  </>
                )}

                {updatedDetails[tool.id]?.ownership === "Permited" && (
                  <>
                    <Text className="pb-2">{t("FixedAssets.issuedDate")}</Text>
                    <TouchableOpacity
                      onPress={() => setShowStartDatePicker(true)}
                      className="border border-gray-400 rounded-full p-4 mb-4 pl-4"
                    >
                      <Text>
                        {updatedDetails[tool.id]?.ownershipDetails?.issuedDate
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

                    {showStartDatePicker && (
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
                    )}

                    <Text className="pb-2">
                      {t("FixedAssets.paymentAnnually")}
                    </Text>
                    <TextInput
                      placeholder={t("FixedAssets.paymentAnnually")}
                      value={
                        updatedDetails[tool.id]?.ownershipDetails
                          ?.permitFeeAnnually || ""
                      }
                      onChangeText={(value) =>
                        handleInputChange(
                          tool.id,
                          "ownershipDetails.permitFeeAnnually",
                          value
                        )
                      }
                      className="border border-gray-400 rounded-full p-4 mb-4 pl-4"
                    />
                  </>
                )}

                {updatedDetails[tool.id]?.ownership === "Shared" && (
                  <>
                    <Text className="pb-2">
                      {t("FixedAssets.paymentAnnually")}
                    </Text>
                    <TextInput
                      placeholder={t("FixedAssets.paymentAnnually")}
                      value={
                        updatedDetails[tool.id]?.ownershipDetails
                          ?.paymentAnnually || ""
                      }
                      onChangeText={(value) =>
                        handleInputChange(
                          tool.id,
                          "ownershipDetails.paymentAnnually",
                          value
                        )
                      }
                      className="border border-gray-400 rounded-full p-4 mb-4 pl-4"
                    />
                  </>
                )}
              </>
            )}
            {tool.category === "Building and Infrastructures" && (
              <>
                <Text className="pb-2 pt-10">{t("FixedAssets.type")}</Text>
                <View className="border border-gray-300 rounded-full  bg-white mb-4">
                  <Picker
                    selectedValue={updatedDetails[tool.id]?.type || ""}
                    onValueChange={(value) =>
                      handleInputChange(tool.id, "type", value)
                    }
                  >
                    {assetTypesForBuilding.map((item) => (
                      <Picker.Item
                        label={t(item.translationKey)}
                        value={item.value}
                        key={item.key}
                      />
                    ))}
                  </Picker>
                </View>

                <Text className="pb-2">{t("FixedAssets.floorAreaSqrFt")}</Text>
                <TextInput
                  placeholder={t("FixedAssets.floorAreaSqrFt")}
                  value={updatedDetails[tool.id]?.floorArea || ""}
                  onChangeText={(value) =>
                    handleInputChange(tool.id, "floorArea", value)
                  }
                  className="border border-gray-400 rounded-full p-3 mb-4 pl-4"
                />
                <Text className="pb-2">{t("FixedAssets.ownership")}</Text>
                <View className="border border-gray-300 rounded-full bg-white mb-4">
                  <Picker
                    selectedValue={updatedDetails[tool.id]?.ownership || ""}
                    onValueChange={(value) => {
                      handleInputChange(tool.id, "ownership", value);

                      if (!("oldOwnership" in updatedDetails[tool.id])) {
                        handleInputChange(
                          tool.id,
                          "oldOwnership",
                          updatedDetails[tool.id]?.ownership || value
                        );
                      }
                    }}
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

                <Text className="pb-2">
                  {t("FixedAssets.generalCondition")}
                </Text>
                <View className="border border-gray-300 rounded-full bg-white mb-4">
                  <Picker
                    selectedValue={
                      updatedDetails[tool.id]?.generalCondition || ""
                    }
                    onValueChange={(value) =>
                      handleInputChange(tool.id, "generalCondition", value)
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
                <Text className="pb-2">{t("FixedAssets.district")}</Text>
                <View className="border border-gray-300 rounded-full bg-white mb-4">
                  <Picker
                    selectedValue={updatedDetails[tool.id]?.district || ""}
                    onValueChange={(value) =>
                      handleInputChange(tool.id, "district", value)
                    }
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

                {updatedDetails[tool.id]?.ownership ===
                  "Own Building (with title ownership)" && (
                  <>
                    <Text className="pb-2">
                      {t("FixedAssets.estimateValue")}
                    </Text>

                    <TextInput
                      placeholder={t("FixedAssets.estimateValue")}
                      value={
                        updatedDetails[tool.id]?.ownershipDetails
                          ?.estimateValue || ""
                      }
                      onChangeText={(value) =>
                        handleInputChange(
                          tool.id,
                          "ownershipDetails.estimateValue",
                          value
                        )
                      }
                      className="border border-gray-400 rounded-full p-3 mb-4 pl-4"
                    />
                    <Text className="pb-2">{t("FixedAssets.issuedDate")}</Text>
                    <TouchableOpacity
                      onPress={() => setShowIssuedDatePicker(true)}
                      className="border border-gray-400 rounded-full p-4 mb-4 pl-4"
                    >
                      <Text>
                        {updatedDetails[tool.id]?.ownershipDetails?.issuedDate
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

                    {showIssuedDatePicker && (
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
                    )}
                  </>
                )}

                {updatedDetails[tool.id]?.ownership === "Leased Building" && (
                  <>
                    <Text className="pb-2">{t("FixedAssets.startDate")}</Text>
                    <TouchableOpacity
                      onPress={() => setShowStartDatePicker(true)}
                      className="border border-gray-400 rounded-full p-4 mb-4 pl-4"
                    >
                      <Text>
                        {updatedDetails[tool.id]?.ownershipDetails?.startDate
                          ? new Date(
                              updatedDetails[tool.id].ownershipDetails.startDate
                            )
                              .toISOString()
                              .split("T")[0]
                          : t("FixedAssets.startDate")}
                      </Text>
                    </TouchableOpacity>

                    {showStartDatePicker && (
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
                    )}
                    <Text className="pb-2 mt-2">
                      {t("FixedAssets.duration")}
                    </Text>
                    <View className="flex-row gap-x-4 items-center">
                      <Text className="">{t("FixedAssets.years")}</Text>

                      <TextInput
                        placeholder={t("FixedAssets.years")}
                        keyboardType="numeric"
                        value={
                          updatedDetails[
                            tool.id
                          ]?.ownershipDetails?.durationYears?.toString() || ""
                        }
                        onChangeText={(value) =>
                          handleInputChange(
                            tool.id,
                            "ownershipDetails.durationYears",
                            value
                          )
                        }
                        className="border border-gray-300 p-2 w-[110px] rounded-full bg-gray-100 pt-2 mb-4 pl-4"
                      />
                      <Text className="">{t("FixedAssets.months")}</Text>

                      <TextInput
                        placeholder={t("FixedAssets.months")}
                        keyboardType="numeric"
                        value={
                          updatedDetails[
                            tool.id
                          ]?.ownershipDetails?.durationMonths?.toString() || ""
                        }
                        onChangeText={(value) =>
                          handleInputChange(
                            tool.id,
                            "ownershipDetails.durationMonths",
                            value
                          )
                        }
                        className="border border-gray-300 p-2 w-[110px] rounded-full bg-gray-100 pt-2 mb-4 pl-4"
                      />
                    </View>

                    <Text className="pb-2 mt-2">
                      {t("FixedAssets.leasedAmountAnnually")}
                    </Text>
                    <TextInput
                      placeholder={t("FixedAssets.leasedAmountAnnually")}
                      value={
                        updatedDetails[tool.id]?.ownershipDetails
                          ?.leastAmountAnnually || ""
                      }
                      onChangeText={(value) =>
                        handleInputChange(
                          tool.id,
                          "ownershipDetails.leastAmountAnnually",
                          value
                        )
                      }
                      className="border border-gray-400 rounded-full p-3 mb-4 pl-4"
                    />
                  </>
                )}

                {updatedDetails[tool.id]?.ownership === "Permit Building" && (
                  <>
                    <Text className="pb-2">{t("FixedAssets.issuedDate")}</Text>
                    <TouchableOpacity
                      onPress={() => setShowStartDatePicker(true)}
                      className="border border-gray-400 rounded-full p-4 mb-4 pl-4"
                    >
                      <Text>
                        {updatedDetails[tool.id]?.ownershipDetails?.issuedDate
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

                    {showStartDatePicker && (
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
                    )}

                    <Text className="pb-2">
                      {t("FixedAssets.paymentAnnually")}
                    </Text>
                    <TextInput
                      placeholder={t("FixedAssets.paymentAnnually")}
                      value={
                        updatedDetails[tool.id]?.ownershipDetails
                          ?.permitFeeAnnually || ""
                      }
                      onChangeText={(value) =>
                        handleInputChange(
                          tool.id,
                          "ownershipDetails.permitFeeAnnually",
                          value
                        )
                      }
                      className="border border-gray-400 rounded-full p-4 mb-4 pl-4"
                    />
                  </>
                )}

                {updatedDetails[tool.id]?.ownership ===
                  "Shared / No Ownership" && (
                  <>
                    <Text className="pb-2">
                      {t("FixedAssets.paymentAnnually")}
                    </Text>
                    <TextInput
                      placeholder={t("FixedAssets.paymentAnnually")}
                      value={
                        updatedDetails[tool.id]?.ownershipDetails
                          ?.paymentAnnually || ""
                      }
                      onChangeText={(value) =>
                        handleInputChange(
                          tool.id,
                          "ownershipDetails.paymentAnnually",
                          value
                        )
                      }
                      className="border border-gray-400 rounded-full p-3 mb-4 pl-4"
                    />
                  </>
                )}
              </>
            )}

            {tool.category === "Machine and Vehicles" ? (
              <>
                <Text className="pb-2 pt-10">{t("FixedAssets.asset")}</Text>
                <View className="border border-gray-400 rounded-full bg-white mb-4">
                  <Picker
                    selectedValue={updatedDetails[tool.id]?.asset || ""}
                    onValueChange={(value) => {
                      handleInputChange(tool.id, "asset", value);
                      setSelectedAsset(value);
                    }}
                  >
                    {Machineasset.map((item) => (
                      <Picker.Item
                        label={item.value}
                        value={item.value}
                        key={item.key}
                      />
                    ))}
                  </Picker>
                </View>

                {selectedAsset && assetTypesForAssets[selectedAsset] && (
                  <>
                    <Text className="pb-2">{t("FixedAssets.assetType")}</Text>
                    <View className="border border-gray-400 rounded-full bg-white mb-4">
                      <Picker
                        selectedValue={updatedDetails[tool.id]?.assetType || ""}
                        onValueChange={(value) =>
                          handleInputChange(tool.id, "assetType", value)
                        }
                      >
                        {assetTypesForAssets[selectedAsset].map((type: any) => (
                          <Picker.Item
                            label={type.value}
                            value={type.value}
                            key={type.key}
                          />
                        ))}
                      </Picker>
                    </View>
                  </>
                )}
                {updatedDetails[tool.id]?.assetType === "Other" && (
                  <>
                    <Text className="pb-2">
                      {t("FixedAssets.mentionOther")}
                    </Text>
                    <TextInput
                      placeholder={t("FixedAssets.mentionOther")}
                      value={updatedDetails[tool.id]?.mentionOther || ""}
                      onChangeText={(value) =>
                        handleInputChange(tool.id, "mentionOther", value)
                      }
                      className="border border-gray-400 rounded-full p-3 pl-4 mb-4"
                    />
                  </>
                )}
                {selectedAsset && brandTypesForAssets[selectedAsset] && (
                  <>
                    <Text className="pb-2">{t("FixedAssets.brand")}</Text>
                    <View className="border border-gray-400 rounded-full bg-white mb-4">
                      <Picker
                        selectedValue={updatedDetails[tool.id]?.brand || ""}
                        onValueChange={(value) => {
                          handleInputChange(tool.id, "brand", value);
                          setSelectedBrand(value);
                        }}
                      >
                        {brandTypesForAssets[selectedAsset].map(
                          (brand: any) => (
                            <Picker.Item
                              label={brand.value}
                              value={brand.value}
                              key={brand.key}
                            />
                          )
                        )}
                      </Picker>
                    </View>
                  </>
                )}
                <Text className="pb-2">{t("FixedAssets.numberofUnits")}</Text>
                <TextInput
                  placeholder={t("FixedAssets.numberofUnits")}
                  value={
                    updatedDetails[tool.id]?.numberOfUnits?.toString() || ""
                  }
                  onChangeText={(value) =>
                    handleInputChange(tool.id, "numberOfUnits", value)
                  }
                  keyboardType="numeric"
                  className="border border-gray-400 rounded-full p-3 mb-4 pl-4"
                />

                <Text className="pb-2">{t("FixedAssets.unitPrice")}</Text>
                <TextInput
                  placeholder={t("FixedAssets.unitPrice")}
                  value={updatedDetails[tool.id]?.unitPrice || ""}
                  onChangeText={(value) =>
                    handleInputChange(tool.id, "unitPrice", value)
                  }
                  keyboardType="numeric"
                  className="border border-gray-400 rounded-full p-3 mb-4 pl-4"
                />
                <Text className="pb-2">{t("FixedAssets.totalPrice")}</Text>

                <Text className="border border-gray-400 rounded-full p-4 mb-4 pl-4">
                  {updatedDetails[tool.id]?.totalPrice || ""}
                </Text>

                <Text className="pb-2">{t("FixedAssets.warranty")}</Text>
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
                    onPress={() => handleInputChange(tool.id, "warranty", "no")}
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
                    <Text className="pl-[20px] font-bold">
                      {t("FixedAssets.purchasedDate")}
                    </Text>
                    <TextInput
                      placeholder={t("FixedAssets.purchasedDate")}
                      value={
                        updatedDetails[tool.id]?.ownershipDetails
                          ?.purchaseDate || ""
                      }
                      onChangeText={(value) =>
                        handleInputChange(
                          tool.id,
                          "ownershipDetails.purchaseDate",
                          value
                        )
                      }
                      className="border border-gray-400 rounded-2xl p-2 mb-4 pl-4"
                    />
                    <Text className="pl-[20px] font-bold">
                      {t("FixedAssets.warrantyExpireDate")}
                    </Text>
                    <TextInput
                      placeholder={t("FixedAssets.warrantyExpireDate")}
                      value={
                        updatedDetails[tool.id]?.ownershipDetails?.expireDate ||
                        ""
                      }
                      onChangeText={(value) =>
                        handleInputChange(
                          tool.id,
                          "ownershipDetails.expireDate",
                          value
                        )
                      }
                      className="border border-gray-400 rounded-2xl p-2 mb-4 pl-4"
                    />
                    <Text className="pl-[20px] font-bold">
                      {t("FixedAssets.warrantyStatus")}
                    </Text>
                    <TextInput
                      placeholder={t("FixedAssets.warrantyStatus")}
                      value={
                        updatedDetails[tool.id]?.ownershipDetails
                          ?.warrantystatus || ""
                      }
                      onChangeText={(value) =>
                        handleInputChange(
                          tool.id,
                          "ownershipDetails.warrantystatus",
                          value
                        )
                      }
                      className="border border-gray-400 rounded-2xl p-2 mb-4 pl-4"
                    />
                  </>
                )}
              </>
            ) : null}

            {tool.category === "Tools" ? (
              <>
                <Text className="pb-2 pt-10">{t("FixedAssets.asset")}</Text>
                <View className="border border-gray-400 rounded-full bg-white mb-4">
                  <Picker
                    selectedValue={updatedDetails[tool.id]?.asset || ""}
                    onValueChange={(value) => {
                      handleInputChange(tool.id, "asset", value);
                      setSelectedAsset(value);
                    }}
                  >
                    {ToolAssets.map((item) => (
                      <Picker.Item
                        label={item.value}
                        value={item.value}
                        key={item.key}
                      />
                    ))}
                  </Picker>
                </View>
                {updatedDetails[tool.id]?.asset === "Other" && (
                  <>
                    <Text className="pb-2">
                      {t("FixedAssets.mentionOther")}
                    </Text>
                    <TextInput
                      placeholder={t("FixedAssets.mentionOther")}
                      value={updatedDetails[tool.id]?.mentionOther || ""}
                      onChangeText={(value) =>
                        handleInputChange(tool.id, "mentionOther", value)
                      }
                      className="border border-gray-400 rounded-full p-4 mb-4 pl-4"
                    />
                  </>
                )}

                <Text className="pb-2">{t("FixedAssets.brand")}</Text>
                <View className="border border-gray-400 rounded-full bg-white mb-4">
                  <Picker
                    selectedValue={updatedDetails[tool.id]?.brand || ""}
                    onValueChange={(value) => {
                      handleInputChange(tool.id, "brand", value);
                      setSelectedAsset(value);
                    }}
                  >
                    {brands.map((item) => (
                      <Picker.Item
                        label={item.value}
                        value={item.value}
                        key={item.key}
                      />
                    ))}
                  </Picker>
                </View>

                <Text className="pb-2">{t("FixedAssets.numberofUnits")}</Text>
                <TextInput
                  placeholder={t("FixedAssets.numberofUnits")}
                  value={
                    updatedDetails[tool.id]?.numberOfUnits?.toString() || ""
                  }
                  onChangeText={(value) =>
                    handleInputChange(tool.id, "numberOfUnits", value)
                  }
                  keyboardType="numeric"
                  className="border border-gray-400 rounded-full p-3 mb-4 pl-4"
                />

                <Text className="pb-2">{t("FixedAssets.unitPrice")}</Text>
                <TextInput
                  placeholder={t("FixedAssets.unitPrice")}
                  value={updatedDetails[tool.id]?.unitPrice || ""}
                  onChangeText={(value) =>
                    handleInputChange(tool.id, "unitPrice", value)
                  }
                  keyboardType="numeric"
                  className="border border-gray-400 rounded-full p-3 mb-4 pl-4"
                />
                <Text className="pb-2">{t("FixedAssets.totalPrice")}</Text>
                <TextInput
                  placeholder={t("FixedAssets.totalPrice")}
                  value={updatedDetails[tool.id]?.totalPrice || ""}
                  onChangeText={(value) =>
                    handleInputChange(tool.id, "totalPrice", value)
                  }
                  keyboardType="numeric"
                  className="border border-gray-400 rounded-full p-3 mb-4 pl-4"
                />
                <Text className="pb-2">{t("FixedAssets.warranty")}</Text>
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
                    onPress={() => handleInputChange(tool.id, "warranty", "no")}
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
                    <Text className="pb-2">
                      {t("FixedAssets.purchasedDate")}
                    </Text>
                    <TextInput
                      placeholder={t("FixedAssets.purchasedDate")}
                      value={
                        updatedDetails[tool.id]?.ownershipDetails
                          ?.purchaseDate || ""
                      }
                      onChangeText={(value) =>
                        handleInputChange(
                          tool.id,
                          "ownershipDetails.purchaseDate",
                          value
                        )
                      }
                      className="border border-gray-400 rounded-full p-3 mb-4 pl-4"
                    />
                    <Text className="pb-2">
                      {t("FixedAssets.warrantyExpireDate")}
                    </Text>
                    <TextInput
                      placeholder={t("FixedAssets.warrantyExpireDate")}
                      value={
                        updatedDetails[tool.id]?.ownershipDetails?.expireDate ||
                        ""
                      }
                      onChangeText={(value) =>
                        handleInputChange(
                          tool.id,
                          "ownershipDetails.expireDate",
                          value
                        )
                      }
                      className="border border-gray-400 rounded-full p-3 mb-4 pl-4"
                    />
    
                  </>
                )}
              </>
            ) : null}
            <View className="flex-1 items-center pt-8">
              <TouchableOpacity
                onPress={handleUpdateTools}
                className="bg-gray-900 p-4 rounded-3xl mb-6 h-13 w-72 "
              >
                <Text className="text-white text-center text-base">
                  {t("FixedAssets.updateAsset")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};
export default UpdateAsset;
