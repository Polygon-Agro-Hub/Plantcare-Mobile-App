import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  Alert,
  BackHandler,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { environment } from "@/environment/environment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomHeader from "../common/CustomHeader";
import GlobalSearchModal from "../common/GlobalSearchModal";
import { MaterialIcons } from "@expo/vector-icons";

interface ServiceItem {
  label: string;
  value: string;
  price?: number;
  data?: any;
}

interface FarmItem {
  label: string;
  value: string;
  data?: any;
}

interface FarmData {
  id: string | number;
  plotNo?: string;
  street?: string;
  city?: string;
  farmName?: string;
  farmIndex?: string;
  extentha?: string;
  extentac?: string;
  extentp?: string;
  district?: string;
  userId?: string;
}

interface CropItem {
  id: string;
  name: string;
  cropGroupId?: string;
  cropVarietyId?: string;
  isUnknown?: boolean;
}

interface AddedItem {
  id: number;
  serviceId: string | null;
  service: string;
  price: string;
  farmId: string | null;
  farm: string;
  plotNo: string;
  streetName: string;
  city: string;
  requests: string[];
  crops: CropItem[];
  date: Date | null;
}

const RequestInspectionForm = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();

  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [hasUnknownCrop, setHasUnknownCrop] = useState(false);

  const [farmModalVisible, setFarmModalVisible] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<string | null>(null);
  const [farmItems, setFarmItems] = useState<FarmItem[]>([]);
  const [loadingFarms, setLoadingFarms] = useState(true);
  const [farmsData, setFarmsData] = useState<FarmData[]>([]);
  const [farmCrops, setFarmCrops] = useState<CropItem[]>([]);
  const [selectedCrops, setSelectedCrops] = useState<CropItem[]>([]);
  const [loadingCrops, setLoadingCrops] = useState(false);

  const [price, setPrice] = useState("");
  const [plotNo, setPlotNo] = useState("");
  const [streetName, setStreetName] = useState("");
  const [city, setCity] = useState("");
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [addedItems, setAddedItems] = useState<AddedItem[]>([]);
  const [currentScrollIndex, setCurrentScrollIndex] = useState(0);

  const scrollViewRef = React.useRef<ScrollView>(null);
  const horizontalScrollRef = React.useRef<ScrollView>(null);

  useEffect(() => {
    fetchServices();
    fetchFarms();
  }, []);

  useEffect(() => {
    if (selectedService) {
      const found = serviceItems.find((item) => item.value === selectedService);
      if (found?.price) setPrice(found.price.toString());
    }
  }, [selectedService, serviceItems]);

  useEffect(() => {
    if (selectedFarm) {
      const found = farmsData.find(
        (farm) => farm.id.toString() === selectedFarm,
      );
      if (found) {
        setPlotNo(found.plotNo || "");
        setStreetName(found.street || "");
        setCity(found.city || "");
        fetchFarmCrops(selectedFarm);
      }
    } else {
      setFarmCrops([]);
      setSelectedCrops([]);
    }
  }, [selectedFarm, farmsData]);

  const handleTextInputChange = (
    text: string,
    setter: (value: string) => void,
  ) => {
    if (text.length === 0 || text[0] !== " ") setter(text);
  };

  const fetchServices = async () => {
    try {
      setLoadingServices(true);
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.get(
        `${environment.API_BASE_URL}api/requestinspection/get-officerservices`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data && Array.isArray(response.data)) {
        const currentLang = i18n.language || "en";
        const services: ServiceItem[] = response.data.map((service: any) => {
          let serviceName = service.englishName;
          if (currentLang === "si" && service.sinhalaName)
            serviceName = service.sinhalaName;
          else if (currentLang === "ta" && service.tamilName)
            serviceName = service.tamilName;
          return {
            label: serviceName,
            value: service.id.toString(),
            price: service.srvFee || 0,
            data: service,
          };
        });
        setServiceItems(services);
      }
    } catch {
      Alert.alert(
        t("Main.Error"),
        t("RequestInspectionForm.FailedToFetchServicesPleaseTryAgain"),
        [{ text: t("Main.OK") }],
      );
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchFarms = async () => {
    try {
      setLoadingFarms(true);
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.get(
        `${environment.API_BASE_URL}api/requestinspection/get-farms`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data && Array.isArray(response.data)) {
        const farms: FarmData[] = response.data.map((farm: any) => ({
          id: farm.id,
          plotNo: farm.plotNo,
          street: farm.street,
          city: farm.city,
          farmName: farm.farmName,
          farmIndex: farm.farmIndex,
          extentha: farm.extentha,
          extentac: farm.extentac,
          extentp: farm.extentp,
          district: farm.district,
          userId: farm.userId,
        }));
        setFarmsData(farms);
        setFarmItems(
          response.data.map((farm: any) => ({
            label: farm.farmName || `Farm ${farm.farmIndex}`,
            value: farm.id.toString(),
            data: farm,
          })),
        );
      }
    } catch {
      Alert.alert(
        t("Main.Error"),
        t("RequestInspectionForm.FailedToFetchFarmsPleaseTryAgain"),
        [{ text: t("Main.OK") }],
      );
    } finally {
      setLoadingFarms(false);
    }
  };

  const fetchFarmCrops = async (farmId: string) => {
    try {
      setLoadingCrops(true);
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.get(
        `${environment.API_BASE_URL}api/requestinspection/get-farm-crops/${farmId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data && Array.isArray(response.data)) {
        const currentLang = i18n.language || "en";
        const crops: CropItem[] = response.data.map((crop: any) => {
          let cropName = crop.cropNameEnglish || "Unknown Crop";
          if (currentLang === "si" && crop.cropNameSinhala)
            cropName = crop.cropNameSinhala;
          else if (currentLang === "ta" && crop.cropNameTamil)
            cropName = crop.cropNameTamil;

          if (crop.cropVarietyNameEnglish) {
            let varietyName = crop.cropVarietyNameEnglish;
            if (currentLang === "si" && crop.cropVarietyNameSinhala)
              varietyName = crop.cropVarietyNameSinhala;
            else if (currentLang === "ta" && crop.cropVarietyNameTamil)
              varietyName = crop.cropVarietyNameTamil;
            cropName += ` - ${varietyName}`;
          }

          return {
            id: crop.cropCalendarId || crop.id || `crop-${Date.now()}`,
            name: cropName,
            cropGroupId: crop.cropGroupId,
            cropVarietyId: crop.cropVarietyId,
            isUnknown:
              cropName.toLowerCase().includes("unknown") || !crop.cropGroupId,
          };
        });

        const uniqueCrops = crops.filter(
          (crop, index, self) =>
            index === self.findIndex((c) => c.id === crop.id),
        );

        const hasUnknown = uniqueCrops.some((crop) => crop.isUnknown);
        setHasUnknownCrop(hasUnknown);
        setSelectedCrops([]);
        setSelectedRequests([]);

        if (uniqueCrops.length === 0 || hasUnknown) {
          setFarmCrops([
            {
              id: "unknown-crop",
              name: t("RequestInspectionForm.Unknown Crop"),
              isUnknown: true,
            },
          ]);
          setHasUnknownCrop(true);
        } else {
          setFarmCrops(uniqueCrops);
        }
      } else {
        setFarmCrops([
          {
            id: "unknown-crop",
            name: t("RequestInspectionForm.Unknown Crop"),
            isUnknown: true,
          },
        ]);
        setHasUnknownCrop(true);
      }
    } catch {
      Alert.alert(
        t("Main.Error"),
        t(
          "RequestInspectionForm.FailedToFetchFarmCropsPleaseTryAgain",
        ),
        [{ text: t("Main.OK") }],
      );
      setFarmCrops([
        {
          id: "unknown-crop",
          name: t("RequestInspectionForm.Unknown Crop"),
          isUnknown: true,
        },
      ]);
      setHasUnknownCrop(true);
    } finally {
      setLoadingCrops(false);
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

  const toggleRequest = (request: string) => {
    const isUnknownCrop = request === t("RequestInspectionForm.Unknown Crop");

    if (request === "All in this Farm") {
      if (selectedRequests.includes("All in this Farm")) {
        setSelectedRequests([]);
        setSelectedCrops([]);
      } else {
        const realCrops = farmCrops.filter((crop) => !crop.isUnknown);
        setSelectedRequests([
          "All in this Farm",
          ...realCrops.map((c) => c.name),
        ]);
        setSelectedCrops([...realCrops]);
      }
    } else if (isUnknownCrop) {
      Alert.alert(
        t("RequestInspectionForm.Warning"),
        t(
          "RequestInspectionForm.This farm has no enrolled crops. Please enroll crops first or contact support.",
        ),
        [{ text: t("Main.OK") }],
      );
      if (selectedRequests.includes(request)) {
        setSelectedRequests(selectedRequests.filter((r) => r !== request));
        setSelectedCrops(selectedCrops.filter((crop) => crop.name !== request));
      }
    } else {
      if (selectedRequests.includes(request)) {
        setSelectedRequests(
          selectedRequests.filter(
            (r) => r !== request && r !== "All in this Farm",
          ),
        );
        setSelectedCrops(selectedCrops.filter((crop) => crop.name !== request));
      } else {
        const cropToAdd = farmCrops.find((crop) => crop.name === request);
        if (cropToAdd && !cropToAdd.isUnknown) {
          const newRequests = [...selectedRequests, request];
          const newCrops = [...selectedCrops, cropToAdd];
          const allRealCrops = farmCrops.filter((crop) => !crop.isUnknown);
          const allSelected =
            allRealCrops.length > 0 &&
            allRealCrops.every((c) => newRequests.includes(c.name));
          setSelectedRequests(
            allSelected ? ["All in this Farm", ...newRequests] : newRequests,
          );
          setSelectedCrops(newCrops);
        }
      }
    }
  };

  const isCropSelected = (cropName: string) => {
    if (cropName === "All in this Farm") {
      return (
        farmCrops.length > 0 &&
        farmCrops.every((crop) => selectedRequests.includes(crop.name))
      );
    }
    return selectedRequests.includes(cropName);
  };

  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const getFirstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const twoDaysFromNow = new Date(today);
    twoDaysFromNow.setDate(today.getDate() + 2);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < twoDaysFromNow;
  };

  const isSameDate = (date1: Date | null, date2: Date) => {
    if (!date1) return false;
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const goToPreviousMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
    );

  const goToNextMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
    );

  const scrollToTop = () =>
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });

  const resetForm = () => {
    setSelectedService(null);
    setPrice("");
    setSelectedFarm(null);
    setPlotNo("");
    setStreetName("");
    setCity("");
    setSelectedRequests([]);
    setSelectedCrops([]);
    setSelectedDate(null);
    setFarmCrops([]);
  };

  const handleAddMore = () => {
    if (!selectedService || !price || !selectedFarm) {
      Alert.alert(
        t("RequestInspectionForm.ValidationError"),
        t(
          "RequestInspectionForm.PleaseFillInServicePriceAndFarmFields",
        ),
        [{ text: t("Main.OK") }],
      );
      return;
    }
    if (!plotNo.trim()) {
      Alert.alert(
        t("RequestInspectionForm.ValidationError"),
        t("RequestInspectionForm.PleaseEnterPlotNumber"),
        [{ text: t("Main.OK") }],
      );
      return;
    }
    if (!streetName.trim()) {
      Alert.alert(
        t("RequestInspectionForm.ValidationError"),
        t("RequestInspectionForm.PleaseEnterStreetName"),
        [{ text: t("Main.OK") }],
      );
      return;
    }
    if (!city.trim()) {
      Alert.alert(
        t("RequestInspectionForm.ValidationError"),
        t("RequestInspectionForm.PleaseEnterCity"),
        [{ text: t("Main.OK") }],
      );
      return;
    }
    if (!selectedDate) {
      Alert.alert(
        t("RequestInspectionForm.ValidationError"),
        t("RequestInspectionForm.PleaseSelectAScheduleDate"),
        [{ text: t("Main.OK") }],
      );
      return;
    }
    if (selectedCrops.length === 0) {
      Alert.alert(
        t("RequestInspectionForm.ValidationError"),
        t(
          "RequestInspectionForm.PleaseSelectAtLeastOneCropForInspection",
        ),
        [{ text: t("Main.OK") }],
      );
      return;
    }

    const selectedServiceData = serviceItems.find(
      (item) => item.value === selectedService,
    );
    const selectedFarmData = farmsData.find(
      (farm) => farm.id.toString() === selectedFarm,
    );

    setAddedItems([
      ...addedItems,
      {
        id: Date.now(),
        serviceId: selectedService,
        service: selectedServiceData?.label || "",
        price,
        farmId: selectedFarm,
        farm: selectedFarmData?.farmName || "",
        plotNo,
        streetName,
        city,
        requests: [...selectedRequests],
        crops: [...selectedCrops],
        date: selectedDate,
      },
    ]);

    resetForm();
    setTimeout(() => scrollToTop(), 100);
  };

  const handleRemoveItem = (id: number) => {
    const itemIndex = addedItems.findIndex((item) => item.id === id);
    const newItems = addedItems.filter((item) => item.id !== id);
    setAddedItems(newItems);

    if (newItems.length === 0) {
      setCurrentScrollIndex(0);
    } else if (currentScrollIndex >= newItems.length) {
      const newIndex = newItems.length - 1;
      setCurrentScrollIndex(newIndex);
      setTimeout(() => scrollToIndex(newIndex), 100);
    } else if (itemIndex < currentScrollIndex) {
      const newIndex = Math.max(0, currentScrollIndex - 1);
      setCurrentScrollIndex(newIndex);
      setTimeout(() => scrollToIndex(newIndex), 100);
    } else if (itemIndex === currentScrollIndex && newItems.length > 0) {
      setTimeout(
        () => scrollToIndex(Math.min(currentScrollIndex, newItems.length - 1)),
        100,
      );
    }
  };

  const formatCurrency = (amount: number | string): string => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return numAmount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const calculateTotalIncludingCurrent = () => {
    const addedTotal = addedItems.reduce(
      (sum, item) => sum + parseFloat(item.price || "0"),
      0,
    );
    const currentPrice = selectedService && price ? parseFloat(price) || 0 : 0;
    return addedTotal + currentPrice;
  };

  const createItemFromCurrentForm = (): AddedItem => {
    const selectedServiceData = serviceItems.find(
      (item) => item.value === selectedService,
    );
    const selectedFarmData = farmsData.find(
      (farm) => farm.id.toString() === selectedFarm,
    );
    return {
      id: Date.now(),
      serviceId: selectedService,
      service: selectedServiceData?.label || "",
      price,
      farmId: selectedFarm,
      farm: selectedFarmData?.farmName || "",
      plotNo,
      streetName,
      city,
      requests: [...selectedRequests],
      crops: [...selectedCrops],
      date: selectedDate,
    };
  };

  const proceedToPaymentWithItems = (itemsToUse: AddedItem[]) => {
    if (itemsToUse.length === 0) {
      Alert.alert(
        t("Main.Error"),
        t("RequestInspectionForm.PleaseAddAtLeastOneInspectionRequest"),
        [{ text: t("Main.OK") }],
      );
      return;
    }
    if (itemsToUse.some((item) => !item.date)) {
      Alert.alert(
        t("Main.Error"),
        t(
          "RequestInspectionForm.PleaseSelectADateForAllInspectionRequests",
        ),
        [{ text: t("Main.OK") }],
      );
      return;
    }

    const requestItems = itemsToUse.map((item) => {
      let formattedDate = null;
      if (item.date) {
        const year = item.date.getFullYear();
        const month = String(item.date.getMonth() + 1).padStart(2, "0");
        const day = String(item.date.getDate()).padStart(2, "0");
        formattedDate = `${year}-${month}-${day}`;
      }
      return {
        serviceId: item.serviceId,
        farmId: item.farmId,
        scheduleDate: formattedDate,
        amount: parseFloat(item.price),
        crops: item.crops.map((crop) => ({
          id: crop.id,
          cropGroupId: crop.cropGroupId,
          name: crop.name,
        })),
        isAllCrops: item.requests.includes("All in this Farm"),
        plotNo: item.plotNo || null,
        streetName: item.streetName || null,
        city: item.city || null,
      };
    });

    (navigation as any).navigate("RequestInspectionPayment", {
      requestItems,
      addedItems: itemsToUse,
      totalAmount: itemsToUse.reduce(
        (sum, item) => sum + parseFloat(item.price || "0"),
        0,
      ),
      itemsCount: itemsToUse.length,
    });
  };

  const proceedToPayment = () => proceedToPaymentWithItems(addedItems);

  const handleSubmit = async () => {
    const hasCompleteUnsavedData =
      selectedService &&
      price &&
      selectedFarm &&
      plotNo.trim() &&
      streetName.trim() &&
      city.trim() &&
      selectedCrops.length > 0 &&
      selectedDate;

    const hasPartialData =
      selectedService ||
      selectedFarm ||
      plotNo ||
      streetName ||
      city ||
      selectedCrops.length > 0 ||
      selectedDate;

    if (hasCompleteUnsavedData && addedItems.length === 0) {
      Alert.alert(
        t("RequestInspectionForm.UnsavedData"),
        t(
          "RequestInspectionForm.YouHaveUnsavedInspectionDataDoYouWantToAddThisRequestBeforeProceeding",
        ),
        [
          { text: t("Main.Cancel"), style: "cancel" },
          {
            text: t("RequestInspectionForm.ProceedWithoutAdding"),
            onPress: () =>
              Alert.alert(
                t("RequestInspectionForm.Confirmation"),
                t(
                  "RequestInspectionForm.AreYouSureYouWantToDiscardTheCurrentFormData",
                ),
                [
                  { text: t("Main.Cancel"), style: "cancel" },
                  {
                    text: t("RequestInspectionForm.Discard and Proceed"),
                    style: "destructive",
                    onPress: () => proceedToPayment(),
                  },
                ],
              ),
          },
          {
            text: t("RequestInspectionForm.AddAndProceed"),
            onPress: () => {
              const newItem = createItemFromCurrentForm();
              const updated = [...addedItems, newItem];
              setAddedItems(updated);
              setTimeout(() => {
                proceedToPaymentWithItems(updated);
                resetForm();
              }, 100);
            },
          },
        ],
      );
      return;
    }

    if (hasCompleteUnsavedData && addedItems.length > 0) {
      Alert.alert(
        t("RequestInspectionForm.UnsavedData"),
        t(
          "RequestInspectionForm.YouHaveUnsavedInspectionDataDoYouWantToAddThisRequestBeforeProceeding",
        ),
        [
          { text: t("Main.Cancel"), style: "cancel" },
          {
            text: t("RequestInspectionForm.ProceedWithoutAdding"),
            onPress: () => proceedToPayment(),
          },
          {
            text: t("RequestInspectionForm.AddAndProceed"),
            onPress: () => {
              const newItem = createItemFromCurrentForm();
              const updated = [...addedItems, newItem];
              setAddedItems(updated);
              setTimeout(() => {
                proceedToPaymentWithItems(updated);
                resetForm();
              }, 100);
            },
          },
        ],
      );
      return;
    }

    if (addedItems.length === 0) {
      Alert.alert(
        hasPartialData
          ? t("RequestInspectionForm.IncompleteData")
          : t("Main.Error"),
        hasPartialData
          ? t(
            "RequestInspectionForm.Please complete all required fields or click 'Add More' to save your current data",
          )
          : t(
            "RequestInspectionForm.PleaseAddAtLeastOneInspectionRequest",
          ),
        [{ text: t("Main.OK") }],
      );
      return;
    }

    if (hasPartialData && !hasCompleteUnsavedData) {
      Alert.alert(
        t("RequestInspectionForm.IncompleteData"),
        t(
          "RequestInspectionForm.YouHaveNotCompletedTheFormPleaseContinueEditing",
        ),
        [{ text: t("Main.Cancel"), style: "cancel" }],
      );
      return;
    }

    proceedToPayment();
  };

  const scrollToIndex = (index: number) => {
    if (horizontalScrollRef.current) {
      horizontalScrollRef.current.scrollTo({
        x: index * (wp(85) + 12),
        animated: true,
      });
      setCurrentScrollIndex(index);
    }
  };

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / (wp(85) + 12));
    setCurrentScrollIndex(index);
  };

  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDays = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);
  };

  const handleServiceSelect = (selected: string[]) => {
    if (selected.length === 0) return;
    setSelectedService(selected[0]);
  };

  const handleFarmSelect = (selected: string[]) => {
    if (selected.length === 0) return;
    setSelectedFarm(selected[0]);
  };

  const getSelectedLabel = (
    items: { label: string; value: string }[],
    value: string | null,
  ) => items.find((i) => i.value === value)?.label || null;

  const renderCalendar = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

    const dates: (Date | null)[] = [
      ...Array(adjustedFirstDay).fill(null),
      ...Array.from(
        { length: daysInMonth },
        (_, i) =>
          new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1),
      ),
    ];

    const remaining = 7 - (dates.length % 7);
    if (remaining < 7) dates.push(...Array(remaining).fill(null));

    const weeks: (Date | null)[][] = [];
    for (let i = 0; i < dates.length; i += 7) weeks.push(dates.slice(i, i + 7));

    return (
      <View className="bg-white rounded-lg mb-4">
        <View className="flex-row justify-between items-center mb-4 px-4 pt-4">
          <TouchableOpacity
            onPress={goToPreviousMonth}
            className="w-8 h-8 items-center justify-center"
          >
            <Ionicons name="chevron-back" size={20} color="#6B7280" />
          </TouchableOpacity>
          <Text className="text-base font-semibold bg-black text-white px-3 rounded-lg">
            {monthNames[currentMonth.getMonth()]}
          </Text>
          <TouchableOpacity
            onPress={goToNextMonth}
            className="w-8 h-8 items-center justify-center"
          >
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View className="flex-row px-4 mb-2">
          <View className="w-10" />
          {days.map((day, index) => (
            <Text
              key={index}
              className={`text-xs flex-1 text-center ${index >= 5 ? "text-teal-500" : "text-gray-500"}`}
            >
              {day}
            </Text>
          ))}
        </View>

        {weeks.map((week, weekIndex) => {
          const firstDate = week.find((d) => d !== null);
          const weekNumber = firstDate ? getWeekNumber(firstDate) : 0;
          return (
            <View key={weekIndex} className="flex-row items-center px-4 mb-1">
              <View className="w-10 h-10 bg-gray-800 rounded-lg items-center justify-center mr-2">
                <Text className="text-white text-xs font-semibold">
                  {weekNumber}
                </Text>
              </View>
              {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                const date = week[dayIndex];
                if (!date)
                  return <View key={dayIndex} className="flex-1 h-10" />;
                const isSelected = isSameDate(selectedDate, date);
                const isDisabled = isDateDisabled(date);
                return (
                  <TouchableOpacity
                    key={dayIndex}
                    onPress={() => !isDisabled && setSelectedDate(date)}
                    disabled={isDisabled}
                    className="flex-1 items-center justify-center"
                  >
                    <View
                      className={`w-9 h-9 items-center justify-center ${isSelected ? "bg-teal-500 rounded-lg" : ""}`}
                    >
                      <Text
                        className={`text-sm ${isSelected ? "text-white font-semibold" : isDisabled ? "text-gray-300" : dayIndex >= 5 ? "text-teal-500" : "text-gray-700"}`}
                      >
                        {date.getDate()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}
        <View className="h-4" />
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#FFFFFF]">
      

      <CustomHeader
        title={t("RequestInspectionForm.RequestInspection")}
        showBackButton={true}
        navigation={navigation as any}
        onBackPress={() => navigation.goBack()}
      />

      {addedItems.length > 0 && (
        <View className="mb-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => scrollToIndex(currentScrollIndex - 1)}
              className="px-2"
              disabled={currentScrollIndex === 0}
            >
              <Ionicons
                name="chevron-back"
                size={28}
                color={currentScrollIndex === 0 ? "#E6EDF3" : "#000000"}
              />
            </TouchableOpacity>

            <ScrollView
              ref={horizontalScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={wp(85) + 12}
              snapToAlignment="start"
              onMomentumScrollEnd={handleScroll}
              contentContainerStyle={{
                paddingHorizontal: 8,
                paddingVertical: 10,
              }}
              style={{ flex: 1 }}
            >
              {addedItems.map((item, index) => (
                <View
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 mr-3"
                  style={{ width: wp(70), elevation: 2 }}
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900">
                        ({String(index + 1).padStart(2, "0")}) {item.service}
                      </Text>
                      <Text className="text-sm text-black font-medium mt-1">
                        {t("RequestInspectionForm.Rs")}.
                        {formatCurrency(item.price)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveItem(item.id)}
                      className="ml-3"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#EF4444"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              onPress={() => scrollToIndex(currentScrollIndex + 1)}
              className="px-2"
              disabled={currentScrollIndex === addedItems.length - 1}
            >
              <Ionicons
                name="chevron-forward"
                size={28}
                color={
                  currentScrollIndex === addedItems.length - 1
                    ? "#E6EDF3"
                    : "#000000"
                }
              />
            </TouchableOpacity>
          </View>
          <View className="border-t border-dashed border-gray-300 mt-4 mx-5" />
        </View>
      )}

      <ScrollView className="flex-1 px-5 py-4" ref={scrollViewRef} contentContainerStyle={{ paddingBottom: 20 }}>
        <Text className="text-[#070707] text-sm mt-2">
          {t("RequestInspectionForm.Service")}
        </Text>
        <TouchableOpacity
          onPress={() => !loadingServices && setServiceModalVisible(true)}
          disabled={loadingServices}
          className="bg-[#F4F4F4] rounded-3xl px-4 mt-2 mb-2 flex-row items-center justify-between h-[50px]"
        >
          <Text
            className={`text-base ${getSelectedLabel(serviceItems, selectedService) ? "text-gray-900" : "text-gray-400"}`}
          >
            {loadingServices
              ? t("RequestInspectionForm.LoadingServices...")
              : getSelectedLabel(serviceItems, selectedService) ||
              t("RequestInspectionForm.SelectService...")}
          </Text>
          {loadingServices ? (
            <ActivityIndicator size="small" color="#9CA3AF" />
          ) : (
            <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
          )}
        </TouchableOpacity>

        <Text className="text-[#070707] text-sm mt-2">
          {t("RequestInspectionForm.PriceRs")}
        </Text>
        <TextInput
          value={price ? formatCurrency(price) : "0.00"}
          onChangeText={setPrice}
          placeholder="0.00"
          keyboardType="numeric"
          style={{ color: '#000000' }} 
          placeholderTextColor="#000000"
          className="bg-[#F4F4F4] rounded-3xl px-4 py-3 mb-2 mt-2 h-[50px] text-gray-900"
          editable={false}
        />

        <Text className="text-[#070707] text-sm mt-2">
          {t("RequestInspectionForm.Farm")}
        </Text>
        <TouchableOpacity
          onPress={() => !loadingFarms && setFarmModalVisible(true)}
          disabled={loadingFarms}
          className="bg-[#F4F4F4] rounded-3xl px-4 mt-2 mb-2 flex-row items-center justify-between h-[50px]"
        >
          <Text
            className={`text-base ${getSelectedLabel(farmItems, selectedFarm) ? "text-gray-900" : "text-gray-400"}`}
          >
            {loadingFarms
              ? t("RequestInspectionForm.LoadingFarms...")
              : getSelectedLabel(farmItems, selectedFarm) ||
              t("RequestInspectionForm.SelectFarm...")}
          </Text>
          {loadingFarms ? (
            <ActivityIndicator size="small" color="#9CA3AF" />
          ) : (
            <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
          )}
        </TouchableOpacity>

        <Text className="text-[#070707] text-sm mt-2">
          {t("RequestInspectionForm.PlotNo")}
        </Text>
        <TextInput
          value={plotNo}
          onChangeText={(text) => handleTextInputChange(text, setPlotNo)}
          placeholder={t("RequestInspectionForm.EnterPlotNumber")}
          style={{ color: '#000000' }} 
          placeholderTextColor="#000000"
          className="bg-[#F4F4F4] rounded-3xl px-4 py-3 mb-2 mt-2 h-[50px] text-gray-900"
        />

        <Text className="text-[#070707] text-sm mt-2">
          {t("RequestInspectionForm.StreetName")}
        </Text>
        <TextInput
          value={streetName}
          onChangeText={(text) => handleTextInputChange(text, setStreetName)}
          placeholder={t("RequestInspectionForm.EnterStreetName")}
          style={{ color: '#000000' }} 
          placeholderTextColor="#000000"
          className="bg-[#F4F4F4] rounded-3xl px-4 py-3 mb-2 mt-2 h-[50px] text-gray-900"
        />

        <Text className="text-[#070707] text-sm mt-2">
          {t("RequestInspectionForm.City")}
        </Text>
        <TextInput
          value={city}
          onChangeText={(text) => handleTextInputChange(text, setCity)}
          style={{ color: '#000000' }} 
          placeholderTextColor="#000000"
          placeholder={t("RequestInspectionForm.EnterCity")}
          className="bg-[#F4F4F4] rounded-3xl px-4 py-3 mb-2 mt-2 h-[50px] text-gray-900"
        />

        <Text className="text-[#070707] text-sm mt-2">
          {t("RequestInspectionForm.FieldVisitRequestFor")}
        </Text>
        <View className="mt-2 mb-2">
          {loadingCrops && selectedFarm ? (
            <Text className="text-gray-500 text-center py-4">
              {t("RequestInspectionForm.LoadingCrops...")}
            </Text>
          ) : farmCrops.length > 0 ? (
            hasUnknownCrop ? (
              <View className="mb-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Text className="text-yellow-800 text-sm">
                  {t(
                    "RequestInspectionForm.ThisFarmHasNoEnrolledCropsPleaseEnrollCropsBeforeRequestingInspection",
                  )}
                </Text>
              </View>
            ) : (
              <View className="gap-3 pl-5">
                <TouchableOpacity
                  onPress={() => toggleRequest("All in this Farm")}
                  className="flex-row items-center mb-3"
                >
                  <View
                    className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${isCropSelected("All in this Farm") ? "bg-black border-black" : "border-gray-300"}`}
                  >
                    {isCropSelected("All in this Farm") && (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    )}
                  </View>
                  <Text className="text-black font-medium">
                    {t("RequestInspectionForm.AllInThisFarm")}
                  </Text>
                </TouchableOpacity>

                {farmCrops.map((crop) => (
                  <TouchableOpacity
                    key={crop.id}
                    onPress={() => toggleRequest(crop.name)}
                    className="flex-row items-center mb-3"
                  >
                    <View
                      className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${isCropSelected(crop.name) ? "bg-black border-black" : "border-gray-300"}`}
                    >
                      {isCropSelected(crop.name) && (
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      )}
                    </View>
                    <Text className="text-black">{crop.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )
          ) : selectedFarm ? (
            <Text className="text-gray-500 text-center py-4">
              {t("RequestInspectionForm.NoCropsFoundForThisFarm")}
            </Text>
          ) : (
            <Text className="text-gray-500 text-center py-4">
              {t("RequestInspectionForm.PleaseSelectAFarmToViewCrops")}
            </Text>
          )}
        </View>

        <Text className="text-[#070707] text-sm mt-2">
          {t("RequestInspectionForm.ScheduleDate")}
        </Text>
        <View className="mt-2 mb-2">
          {renderCalendar()}
        </View>

        <View className="mt-8 mb-6 mx-6">
          <TouchableOpacity
            onPress={handleAddMore}
            className="w-full rounded-3xl h-[50px] justify-center items-center shadow-lg elevation-6 bg-[#353535]"
          >
            <Text className="text-white text-center font-semibold text-lg">
              {t("RequestInspectionForm.AddMore")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View className="bg-white border-t border-gray-200 px-5 pt-4 pb-20 flex-row justify-between items-center">
        <View>
          <Text className="text-base">
            <Text className="text-gray-600">
              {t("RequestInspectionForm.Total")}{" "}
            </Text>
            <Text className="font-semibold">
              {t("RequestInspectionForm.Rs")}.
              {formatCurrency(calculateTotalIncludingCurrent())}
            </Text>
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleSubmit}
          className={`rounded-3xl px-8 h-[50px] justify-center items-center shadow-lg elevation-6 ${
            addedItems.length === 0 ? "bg-[#9CA3AF]" : "bg-[#00A896]"
          }`}
          disabled={addedItems.length === 0}
        >
          <Text className="text-white font-semibold text-lg">
            {t("RequestInspectionForm.Done")}
          </Text>
        </TouchableOpacity>
      </View>

      <GlobalSearchModal
        visible={serviceModalVisible}
        onClose={() => setServiceModalVisible(false)}
        title={t("RequestInspectionForm.SelectService...")}
        data={serviceItems}
        selectedItems={selectedService ? [selectedService] : []}
        onSelect={handleServiceSelect}
        searchPlaceholder={t("RequestInspectionForm.SearchServices...")}
        searchKeys={["label"]}
        multiSelect={false}
        showSearch={true}
      />

      <GlobalSearchModal
        visible={farmModalVisible}
        onClose={() => setFarmModalVisible(false)}
        title={t("RequestInspectionForm.SelectFarm...")}
        data={farmItems}
        selectedItems={selectedFarm ? [selectedFarm] : []}
        onSelect={handleFarmSelect}
        searchPlaceholder={t("RequestInspectionForm.SelectFarm...")}
        searchKeys={["label"]}
        multiSelect={false}
        showSearch={true}
      />
    </View>
  );
};

export default RequestInspectionForm;
