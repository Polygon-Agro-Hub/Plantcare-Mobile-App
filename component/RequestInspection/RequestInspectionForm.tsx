import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import DropDownPicker from 'react-native-dropdown-picker';
import AntDesign from "react-native-vector-icons/AntDesign";
import { useTranslation } from "react-i18next";
import axios from 'axios';
import { environment } from "@/environment/environment";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = 'YOUR_API_BASE_URL';

// Define types for your data
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
  
  // Service dropdown state
  const [openService, setOpenService] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // Farm dropdown state
  const [openFarm, setOpenFarm] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<string | null>(null);
  const [farmItems, setFarmItems] = useState<FarmItem[]>([]);
  const [loadingFarms, setLoadingFarms] = useState(true);
  const [farmsData, setFarmsData] = useState<FarmData[]>([]);

  // Crops state
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
  
  // Added items list
  const [addedItems, setAddedItems] = useState<AddedItem[]>([]);
  
  // Ref for horizontal scroll
  const horizontalScrollRef = React.useRef<ScrollView>(null);

  const requestOptions = ["All in this Farm", "Beans", "Carrot"];

  // Fetch services on component mount
  useEffect(() => {
    fetchServices();
    fetchFarms();
  }, []);

  // Auto-populate price when service is selected
  useEffect(() => {
    if (selectedService) {
      const selectedServiceData = serviceItems.find(item => item.value === selectedService);
      if (selectedServiceData && selectedServiceData.price) {
        setPrice(selectedServiceData.price.toString());
      }
    }
  }, [selectedService, serviceItems]);

  const handleTextInputChange = (text: string, setter: (value: string) => void) => {
  // Prevent leading spaces - only allow text if it doesn't start with a space
  // or if there's already non-space content
  if (text.length === 0 || text[0] !== ' ') {
    setter(text);
  }
};

  // Auto-populate farm details and fetch crops when farm is selected
  useEffect(() => {
    if (selectedFarm) {
      const selectedFarmData = farmsData.find(farm => farm.id.toString() === selectedFarm);
      if (selectedFarmData) {
        setPlotNo(selectedFarmData.plotNo || "");
        setStreetName(selectedFarmData.street || "");
        setCity(selectedFarmData.city || "");
        
        // Fetch crops for the selected farm
        fetchFarmCrops(selectedFarm);
      }
    } else {
      // Reset crops when no farm is selected
      setFarmCrops([]);
      setSelectedCrops([]);
    }
  }, [selectedFarm, farmsData]);

  const fetchServices = async () => {
    try {
      setLoadingServices(true);
      
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.get(`${environment.API_BASE_URL}api/requestinspection/get-officerservices`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && Array.isArray(response.data)) {
        // Get current language
        const currentLang = i18n.language || 'en';
        
        // Map services based on language
        const services: ServiceItem[] = response.data.map((service: any) => {
          let serviceName = service.englishName;
          
          if (currentLang === 'si' && service.sinhalaName) {
            serviceName = service.sinhalaName;
          } else if (currentLang === 'ta' && service.tamilName) {
            serviceName = service.tamilName;
          }

          return {
            label: serviceName,
            value: service.id.toString(),
            price: service.srvFee || 0,
            data: service
          };
        });

        setServiceItems(services);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
 
          Alert.alert(t("RequestInspectionForm.Error"), t("RequestInspectionForm.Failed to fetch services. Please try again."),[{ text:  t("RequestInspectionForm.OK") }]);
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchFarms = async () => {
    try {
      setLoadingFarms(true);
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.get(`${environment.API_BASE_URL}api/requestinspection/get-farms`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && Array.isArray(response.data)) {
        // Store full farm data
        const farmsData: FarmData[] = response.data.map((farm: any) => ({
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
          userId: farm.userId
        }));

        setFarmsData(farmsData);

        // Map farms for dropdown
        const farms: FarmItem[] = response.data.map((farm: any) => ({
          label: farm.farmName || `Farm ${farm.farmIndex}`,
          value: farm.id.toString(),
          data: farm
        }));

        setFarmItems(farms);
      }
    } catch (error) {
      console.error("Error fetching farms:", error);

        Alert.alert(t("RequestInspectionForm.Error"), t("RequestInspectionForm.Failed to fetch farms. Please try again."),[{ text:  t("RequestInspectionForm.OK") }]);
    } finally {
      setLoadingFarms(false);
    }
  };

  const fetchFarmCrops = async (farmId: string) => {
    try {
      setLoadingCrops(true);
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.get(`${environment.API_BASE_URL}api/requestinspection/get-farm-crops/${farmId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && Array.isArray(response.data)) {
        // Get current language
        const currentLang = i18n.language || 'en';
        
        // Map crops based on language
        const crops: CropItem[] = response.data.map((crop: any) => {
          let cropName = crop.cropNameEnglish || 'Unknown Crop';
          
          if (currentLang === 'si' && crop.cropNameSinhala) {
            cropName = crop.cropNameSinhala;
          } else if (currentLang === 'ta' && crop.cropNameTamil) {
            cropName = crop.cropNameTamil;
          }

          // If there's a variety name, append it
          if (crop.cropVarietyNameEnglish) {
            let varietyName = crop.cropVarietyNameEnglish;
            if (currentLang === 'si' && crop.cropVarietyNameSinhala) {
              varietyName = crop.cropVarietyNameSinhala;
            } else if (currentLang === 'ta' && crop.cropVarietyNameTamil) {
              varietyName = crop.cropVarietyNameTamil;
            }
            cropName += ` - ${varietyName}`;
          }

          return {
            id: crop.cropCalendarId || crop.id || `crop-${Date.now()}`,
            name: cropName,
            cropGroupId: crop.cropGroupId,
            cropVarietyId: crop.cropVarietyId
          };
        });

        // Remove duplicates based on crop id
        const uniqueCrops = crops.filter((crop, index, self) => 
          index === self.findIndex(c => c.id === crop.id)
        );

        setFarmCrops(uniqueCrops);
        setSelectedCrops([]); // Reset selected crops when farm changes
      } else {
        setFarmCrops([]);
      }
    } catch (error) {
      console.error("Error fetching farm crops:", error);
    
               Alert.alert(t("RequestInspectionForm.Error"), t("RequestInspectionForm.Failed to fetch farm crops. Please try again."),[{ text:  t("RequestInspectionForm.OK") }]);
      setFarmCrops([]);
    } finally {
      setLoadingCrops(false);
    }
  };

  const toggleRequest = (request: string) => {
  if (request === "All in this Farm") {
    // If "All in this Farm" is selected, select all crops
    if (selectedRequests.includes("All in this Farm")) {
      // Deselect "All in this Farm" and all crops
      setSelectedRequests([]);
      setSelectedCrops([]);
    } else {
      // Select "All in this Farm" and all crops
      setSelectedRequests(["All in this Farm", ...farmCrops.map(crop => crop.name)]);
      setSelectedCrops([...farmCrops]);
    }
  } else {
    // For individual crops
    if (selectedRequests.includes(request)) {
      // Remove the crop from selected requests and crops
      setSelectedRequests(selectedRequests.filter(r => r !== request));
      setSelectedCrops(selectedCrops.filter(crop => crop.name !== request));
      
      // Also remove "All in this Farm" if it was selected
      if (selectedRequests.includes("All in this Farm")) {
        setSelectedRequests(selectedRequests.filter(r => r !== "All in this Farm"));
      }
    } else {
      // Add the crop to selected requests and crops
      const cropToAdd = farmCrops.find(crop => crop.name === request);
      if (cropToAdd) {
        const newSelectedRequests = [...selectedRequests, request];
        const newSelectedCrops = [...selectedCrops, cropToAdd];
        
        // Check if all crops are now selected
        const allCropsSelected = farmCrops.every(crop => 
          newSelectedRequests.includes(crop.name)
        );
        
        // If all crops are selected, also select "All in this Farm"
        if (allCropsSelected && farmCrops.length > 0) {
          setSelectedRequests(["All in this Farm", ...newSelectedRequests]);
        } else {
          setSelectedRequests(newSelectedRequests);
        }
        
        setSelectedCrops(newSelectedCrops);
      }
    }
  }
};

const isCropSelected = (cropName: string) => {
  if (cropName === "All in this Farm") {
    // "All in this Farm" is selected when ALL individual crops are selected
    return farmCrops.length > 0 && farmCrops.every(crop => 
      selectedRequests.includes(crop.name)
    );
  }
  return selectedRequests.includes(cropName);
};



  // Update the request options to include actual crop names from the farm
const getRequestOptions = () => {
  const baseOptions = ["All in this Farm"];
  if (farmCrops.length > 0) {
    return [...baseOptions, ...farmCrops.map(crop => crop.name)];
  }
  return baseOptions;
};

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

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

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

 const handleAddMore = () => {
  // Validate required fields
  if (!selectedService || !price || !selectedFarm) {
    Alert.alert(
      t("RequestInspectionForm.Validation Error"), 
      t("RequestInspectionForm.Please fill in Service, Price, and Farm fields"),
      [{ text: t("RequestInspectionForm.OK") }]
    );
    return;
  }

  // NEW: Validate Plot No, Street Name, City
  if (!plotNo.trim()) {
    Alert.alert(
      t("RequestInspectionForm.Validation Error"), 
      t("RequestInspectionForm.Please enter Plot Number"),
      [{ text: t("RequestInspectionForm.OK") }]
    );
    return;
  }

  if (!streetName.trim()) {
    Alert.alert(
      t("RequestInspectionForm.Validation Error"), 
      t("RequestInspectionForm.Please enter Street Name"),
      [{ text: t("RequestInspectionForm.OK") }]
    );
    return;
  }

  if (!city.trim()) {
    Alert.alert(
      t("RequestInspectionForm.Validation Error"), 
      t("RequestInspectionForm.Please enter City"),
      [{ text: t("RequestInspectionForm.OK") }]
    );
    return;
  }

  // NEW: Validate Schedule Date
  if (!selectedDate) {
    Alert.alert(
      t("RequestInspectionForm.Validation Error"), 
      t("RequestInspectionForm.Please select a schedule date"),
      [{ text: t("RequestInspectionForm.OK") }]
    );
    return;
  }

  // Validate that at least one crop is selected
  if (selectedCrops.length === 0) {
    Alert.alert(
      t("RequestInspectionForm.Validation Error"), 
      t("RequestInspectionForm.Please select at least one crop for inspection"),
      [{ text: t("RequestInspectionForm.OK") }]
    );
    return;
  }

  const selectedServiceData = serviceItems.find(item => item.value === selectedService);
  const selectedFarmData = farmsData.find(farm => farm.id.toString() === selectedFarm);

  // Create new item
  const newItem: AddedItem = {
    id: Date.now(),
    serviceId: selectedService,
    service: selectedServiceData?.label || '',
    price: price,
    farmId: selectedFarm,
    farm: selectedFarmData?.farmName || '',
    plotNo: plotNo,
    streetName: streetName,
    city: city,
    requests: [...selectedRequests],
    crops: [...selectedCrops],
    date: selectedDate,
  };

  // Add to list
  setAddedItems([...addedItems, newItem]);

  // Reset form
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


  const handleRemoveItem = (id: number) => {
    setAddedItems(addedItems.filter(item => item.id !== id));
  };

  const formatCurrency = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return numAmount.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
};


  const calculateTotal = () => {
    return addedItems.reduce((sum, item) => sum + parseFloat(item.price || "0"), 0);
  };



// const handleSubmit = async () => {
//   try {
//     // Validate that there are items to submit
//     if (addedItems.length === 0) {
//       Alert.alert(
//         t("RequestInspectionForm.Error"), 
//         t("RequestInspectionForm.Please add at least one inspection request"),
//         [{ text: t("RequestInspectionForm.OK") }]
//       );
//       return;
//     }

//     // Validate that all items have dates
//     const itemsWithoutDate = addedItems.filter(item => !item.date);
//     if (itemsWithoutDate.length > 0) {
//       Alert.alert(
//         t("RequestInspectionForm.Error"), 
//         t("RequestInspectionForm.Please select a date for all inspection requests"),
//         [{ text: t("RequestInspectionForm.OK") }]
//       );
//       return;
//     }

//     // Prepare request items with farm details for backend
//     const requestItems = addedItems.map(item => ({
//       serviceId: item.serviceId,
//       farmId: item.farmId,
//       scheduleDate: item.date ? item.date.toISOString().split('T')[0] : null,
//       amount: parseFloat(item.price),
//       crops: item.crops.map(crop => ({
//         id: crop.id,
//         cropGroupId: crop.cropGroupId,
//         name: crop.name
//       })),
//       isAllCrops: item.requests.includes("All in this Farm"),
//       plotNo: item.plotNo || null,
//       streetName: item.streetName || null,
//       city: item.city || null
//     }));

//     // Calculate total amount
//     const totalAmount = calculateTotal();

//     // Navigate to payment screen with ALL necessary data
//     (navigation as any).navigate("RequestInspectionPayment", {
//       requestItems: requestItems, // Data for backend API
//       addedItems: addedItems, // Original items for display
//       totalAmount: totalAmount,
//       itemsCount: addedItems.length
//     });

//   } catch (error: any) {
//     console.error("Error preparing request:", error);
    
//     Alert.alert(
//       t("RequestInspectionForm.Error"), 
//       t("RequestInspectionForm.Failed to prepare request. Please try again."),
//       [{ text: t("RequestInspectionForm.OK") }]
//     );
//   }
// };
const handleSubmit = async () => {
  // Check if there are COMPLETE unsaved form data
  const hasCompleteUnsavedData = 
    selectedService && 
    price && 
    selectedFarm && 
    plotNo.trim() && 
    streetName.trim() && 
    city.trim() && 
    selectedCrops.length > 0 && 
    selectedDate;

  if (hasCompleteUnsavedData && addedItems.length === 0) {
    // Case 1: No items added yet, but form has COMPLETE data
    Alert.alert(
      t("RequestInspectionForm.Unsaved Data"),
      t("RequestInspectionForm.You have unsaved inspection data. Do you want to add this request before proceeding?"),
      [
        {
          text: t("RequestInspectionForm.Cancel"),
          style: "cancel"
        },
        {
          text: t("RequestInspectionForm.Proceed Without Adding"),
          style: "default",
          onPress: () => {
            Alert.alert(
              t("RequestInspectionForm.Confirmation"),
              t("RequestInspectionForm.Are you sure you want to discard the current form data?"),
              [
                {
                  text: t("RequestInspectionForm.Cancel"),
                  style: "cancel"
                },
                {
                  text: t("RequestInspectionForm.Discard and Proceed"),
                  style: "destructive",
                  onPress: () => proceedToPayment()
                }
              ]
            );
          }
        },
        {
          text: t("RequestInspectionForm.Add and Proceed"),
          onPress: () => {
            // Add current form data FIRST, then proceed to payment
            const newItem = createItemFromCurrentForm();
            const updatedItems = [...addedItems, newItem];
            
            // Update state and wait for it to complete before navigation
            setAddedItems(updatedItems);
            
            // Use setTimeout to ensure state update is processed
            setTimeout(() => {
              proceedToPaymentWithItems(updatedItems);
              resetForm(); // Reset form after successful addition
            }, 100);
          }
        }
      ]
    );
    return;
  } else if (hasCompleteUnsavedData && addedItems.length > 0) {
    // Case 2: Already have items, and form has COMPLETE new data
    Alert.alert(
      t("RequestInspectionForm.Unsaved Data"),
      t("RequestInspectionForm.You have unsaved inspection data. Do you want to add this request before proceeding?"),
      [
        {
          text: t("RequestInspectionForm.Cancel"),
          style: "cancel"
        },
        {
          text: t("RequestInspectionForm.Proceed Without Adding"),
          style: "default",
          onPress: () => proceedToPayment()
        },
        {
          text: t("RequestInspectionForm.Add and Proceed"),
          onPress: () => {
            // Add current form data FIRST, then proceed to payment
            const newItem = createItemFromCurrentForm();
            const updatedItems = [...addedItems, newItem];
            
            setAddedItems(updatedItems);
            
            // Use setTimeout to ensure state update is processed
            setTimeout(() => {
              proceedToPaymentWithItems(updatedItems);
              resetForm(); // Reset form after successful addition
            }, 100);
          }
        }
      ]
    );
    return;
  } else if (addedItems.length === 0) {
    // Case 3: No items and no COMPLETE form data
    const hasPartialData = selectedService || selectedFarm || plotNo || streetName || city || selectedCrops.length > 0 || selectedDate;
    
    if (hasPartialData) {
      Alert.alert(
        t("RequestInspectionForm.Incomplete Data"),
        t("RequestInspectionForm.Please complete all required fields or click 'Add More' to save your current data"),
        [{ text: t("RequestInspectionForm.OK") }]
      );
    } else {
      Alert.alert(
        t("RequestInspectionForm.Error"), 
        t("RequestInspectionForm.Please add at least one inspection request"),
        [{ text: t("RequestInspectionForm.OK") }]
      );
    }
    return;
  }

  // Case 4: Have items and no COMPLETE unsaved form data
  const hasPartialData = selectedService || selectedFarm || plotNo || streetName || city || selectedCrops.length > 0 || selectedDate;
  
  if (hasPartialData && !hasCompleteUnsavedData) {
    Alert.alert(
      t("RequestInspectionForm.Incomplete Data"),
      t("RequestInspectionForm.You have unsaved inspection data. Do you want to add this request before proceeding?"),
      [
        {
          text: t("RequestInspectionForm.Cancel"),
          style: "cancel"
        },
        {
          text: t("RequestInspectionForm.Proceed"),
          onPress: () => proceedToPayment()
        }
      ]
    );
    return;
  }

  proceedToPayment();
};

// Helper function to create item from current form data
const createItemFromCurrentForm = (): AddedItem => {
  const selectedServiceData = serviceItems.find(item => item.value === selectedService);
  const selectedFarmData = farmsData.find(farm => farm.id.toString() === selectedFarm);

  return {
    id: Date.now(),
    serviceId: selectedService,
    service: selectedServiceData?.label || '',
    price: price,
    farmId: selectedFarm,
    farm: selectedFarmData?.farmName || '',
    plotNo: plotNo,
    streetName: streetName,
    city: city,
    requests: [...selectedRequests],
    crops: [...selectedCrops],
    date: selectedDate,
  };
};

// Updated proceedToPayment that accepts items as parameter
const proceedToPaymentWithItems = (itemsToUse: AddedItem[]) => {
  try {
    // Validate that there are items to submit
    if (itemsToUse.length === 0) {
      Alert.alert(
        t("RequestInspectionForm.Error"), 
        t("RequestInspectionForm.Please add at least one inspection request"),
        [{ text: t("RequestInspectionForm.OK") }]
      );
      return;
    }

    // Validate that all items have dates
    const itemsWithoutDate = itemsToUse.filter(item => !item.date);
    if (itemsWithoutDate.length > 0) {
      Alert.alert(
        t("RequestInspectionForm.Error"), 
        t("RequestInspectionForm.Please select a date for all inspection requests"),
        [{ text: t("RequestInspectionForm.OK") }]
      );
      return;
    }

    // Prepare request items for backend
    const requestItems = itemsToUse.map(item => ({
      serviceId: item.serviceId,
      farmId: item.farmId,
      scheduleDate: item.date ? item.date.toISOString().split('T')[0] : null,
      amount: parseFloat(item.price),
      crops: item.crops.map(crop => ({
        id: crop.id,
        cropGroupId: crop.cropGroupId,
        name: crop.name
      })),
      isAllCrops: item.requests.includes("All in this Farm"),
      plotNo: item.plotNo || null,
      streetName: item.streetName || null,
      city: item.city || null
    }));

    // Calculate total amount
    const totalAmount = itemsToUse.reduce((sum, item) => sum + parseFloat(item.price || "0"), 0);

    // Navigate to payment screen
    (navigation as any).navigate("RequestInspectionPayment", {
      requestItems: requestItems,
      addedItems: itemsToUse,
      totalAmount: totalAmount,
      itemsCount: itemsToUse.length
    });

  } catch (error: any) {
    console.error("Error preparing request:", error);
    
    Alert.alert(
      t("RequestInspectionForm.Error"), 
      t("RequestInspectionForm.Failed to prepare request. Please try again."),
      [{ text: t("RequestInspectionForm.OK") }]
    );
  }
};

// Keep the original proceedToPayment for cases where we don't need to modify items
const proceedToPayment = () => {
  proceedToPaymentWithItems(addedItems);
};

// Reset form function
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

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const [currentScrollIndex, setCurrentScrollIndex] = useState(0);

  const scrollToIndex = (index: number) => {
    if (horizontalScrollRef.current) {
      const cardWidth = wp(85);
      const marginRight = 12;
      const totalCardWidth = cardWidth + marginRight;
      
      horizontalScrollRef.current.scrollTo({
        x: index * totalCardWidth,
        animated: true,
      });
      setCurrentScrollIndex(index);
    }
  };

  const scrollToPrevious = () => {
    if (currentScrollIndex > 0) {
      scrollToIndex(currentScrollIndex - 1);
    }
  };

  const scrollToNext = () => {
    if (currentScrollIndex < addedItems.length - 1) {
      scrollToIndex(currentScrollIndex + 1);
    }
  };

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const cardWidth = wp(85);
    const marginRight = 12;
    const totalCardWidth = cardWidth + marginRight;
    const index = Math.round(scrollPosition / totalCardWidth);
    setCurrentScrollIndex(index);
  };

  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const renderCalendar = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

    const dates: (Date | null)[] = [];
    
    for (let i = 0; i < adjustedFirstDay; i++) {
      dates.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
    }

    const remainingSlots = 7 - (dates.length % 7);
    if (remainingSlots < 7) {
      for (let i = 0; i < remainingSlots; i++) {
        dates.push(null);
      }
    }

    const weeks: (Date | null)[][] = [];
    for (let i = 0; i < dates.length; i += 7) {
      weeks.push(dates.slice(i, i + 7));
    }

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
          {days.map((day, index) => {
            const isSatOrSun = index >= 5;
            return (
              <Text 
                key={index} 
                className={`text-xs flex-1 text-center ${
                  isSatOrSun ? 'text-teal-500' : 'text-gray-500'
                }`}
              >
                {day}
              </Text>
            );
          })}
        </View>

        {weeks.map((week, weekIndex) => {
          const firstDateInWeek = week.find(d => d !== null);
          const weekNumber = firstDateInWeek ? getWeekNumber(firstDateInWeek) : 0;
          
          return (
            <View key={weekIndex} className="flex-row items-center px-4 mb-1">
              <View className="w-10 h-10 bg-gray-800 rounded-lg items-center justify-center mr-2">
                <Text className="text-white text-xs font-semibold">{weekNumber}</Text>
              </View>

              {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                const date = week[dayIndex];
                
                if (!date) {
                  return <View key={dayIndex} className="flex-1 h-10" />;
                }

                const isSelected = isSameDate(selectedDate, date);
                const isDisabled = isDateDisabled(date);
                const isToday = isSameDate(new Date(), date);
                const isSatOrSun = dayIndex >= 5;

                return (
                  <TouchableOpacity
                    key={dayIndex}
                    onPress={() => !isDisabled && setSelectedDate(date)}
                    disabled={isDisabled}
                    className="flex-1 items-center justify-center"
                  >
                    <View
                      className={`w-9 h-9 items-center justify-center ${
                        isSelected ? "bg-teal-500 rounded-lg" : ""
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          isSelected 
                            ? "text-white font-semibold" 
                            : isDisabled 
                            ? "text-gray-300" 
                            : isSatOrSun
                            ? "text-teal-500"
                            : "text-gray-700"
                        }`}
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
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View
          className="flex-row items-center justify-between mb-2"
          style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <AntDesign name="left" size={24} color="#000502" />
          </TouchableOpacity>
          <View
            className="absolute top-0 left-0 right-0 items-center"
            style={{ paddingVertical: hp(2) }}
          >
            <Text className="text-black text-xl font-bold">
          {t("RequestInspectionForm.Request Inspection")}
            </Text>
          </View>
        </View>

      {/* Horizontal ScrollView for Added Items */}
     {addedItems.length > 0 && (
  <View className="mb-4">
    <View className="flex-row items-center">
      {/* <TouchableOpacity 
        onPress={scrollToPrevious}
        className="px-2"
      >
        <Ionicons name="chevron-back" size={28} color="#9CA3AF" />
      </TouchableOpacity> */}
      <TouchableOpacity 
  onPress={scrollToPrevious}
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
        pagingEnabled={false}
        decelerationRate="fast"
        snapToInterval={wp(85) + 12}
        snapToAlignment="start"
        onMomentumScrollEnd={handleScroll}
        contentContainerStyle={{ paddingHorizontal: 8, paddingVertical: 10 }}
        style={{ flex: 1 }}
      >
        {addedItems.map((item, index) => (
          <View
            key={item.id}
            className="bg-white border border-gray-200 rounded-lg p-4 mr-3"
            style={{ 
              width: wp(70),
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  ({String(index + 1).padStart(2, '0')}) {item.service}
                </Text>
                <Text className="text-sm text-black font-medium mt-1">
                  {t("RequestInspectionForm.Rs")}.{formatCurrency(item.price)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveItem(item.id)}
                className="ml-3"
                style={{
                  alignSelf: 'center'
                }}
              >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* <TouchableOpacity 
        onPress={scrollToNext}
        className="px-2"
      >
        <Ionicons name="chevron-forward" size={28} color="#9CA3AF" />
      </TouchableOpacity> */}
      <TouchableOpacity 
  onPress={scrollToNext}
  className="px-2"
  disabled={currentScrollIndex === addedItems.length - 1}
>
  <Ionicons 
    name="chevron-forward" 
    size={28} 
    color={currentScrollIndex === addedItems.length - 1 ? "#E6EDF3" : "#000000"} 
  />
</TouchableOpacity>
    </View>

    <View className="border-t border-dashed border-gray-300 mt-4 mx-5" />
  </View>
)}

      <ScrollView className="flex-1 px-5 py-4">

        {/* Service Dropdown */}
        <View className="mb-4">
          <Text className="text-sm text-gray-600 mb-2">{t("RequestInspectionForm.Service")}</Text>
          <DropDownPicker
            open={openService}
            value={selectedService}
            items={serviceItems}
            setOpen={setOpenService}
            setValue={setSelectedService}
            setItems={setServiceItems}
            placeholder={loadingServices ? t("RequestInspectionForm.Loading services") : t("RequestInspectionForm.Select Service")}
            disabled={loadingServices}
            listMode="FLATLIST"
            scrollViewProps={{
              nestedScrollEnabled: true,
              decelerationRate: 'fast',
            }}
            flatListProps={{
              nestedScrollEnabled: true,
              initialNumToRender: 20,
              maxToRenderPerBatch: 50,
              windowSize: 10,
            }}
            searchable={true}
            searchPlaceholder={t("RequestInspectionForm.Search services")}
            style={{
              borderWidth: 1,
              borderColor: "#F4F4F4",
              backgroundColor: "#F4F4F4",
              borderRadius: 30,
              paddingHorizontal: 12,
              paddingVertical: 12,
            }}
            textStyle={{
              fontSize: 15,
              color: '#111827',
            }}
            placeholderStyle={{
              color: '#9CA3AF',
            }}
            dropDownContainerStyle={{
              backgroundColor: '#fff',
              borderColor: '#E5E7EB',
              borderRadius: 8,
              maxHeight: hp(50), // Limit height
            }}
            ArrowDownIconComponent={() => (
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            )}
            ArrowUpIconComponent={() => (
              <Ionicons name="chevron-up" size={20} color="#9CA3AF" />
            )}
          />
        </View>

        {/* Price Input */}
        <View className="mb-4" style={{ zIndex: 2000 }}>
          <Text className="text-sm text-gray-600 mb-2">{t("RequestInspectionForm.Price")}</Text>
          <TextInput
            value={price ? formatCurrency(price) : "0.00"}
            onChangeText={setPrice}
            placeholder="0.00"
            keyboardType="numeric"
            className="bg-[#F4F4F4] rounded-full p-3 border border-[#F4F4F4] text-[gray-900]"
             editable={false}
          />
        </View>

        {/* Farm Dropdown */}
        <View className="mb-4" style={{ zIndex: 1000 }}>
          <Text className="text-sm text-gray-600 mb-2">{t("RequestInspectionForm.Farm")}</Text>
          <DropDownPicker
            open={openFarm}
            value={selectedFarm}
            items={farmItems}
            setOpen={setOpenFarm}
            setValue={setSelectedFarm}
            setItems={setFarmItems}
            placeholder={loadingFarms ? t("RequestInspectionForm.Loading farms") : t("RequestInspectionForm.Select Farm")}
            disabled={loadingFarms}
            style={{
              borderWidth: 1,
              borderColor: "#F4F4F4",
              backgroundColor: "#F4F4F4",
              borderRadius: 30,
              paddingHorizontal: 12,
              paddingVertical: 12,
            }}
            textStyle={{
              fontSize: 15,
              color: '#111827',
            }}
            placeholderStyle={{
              color: '#9CA3AF',
            }}
            dropDownContainerStyle={{
              backgroundColor: '#fff',
              borderColor: '#E5E7EB',
              borderRadius: 8,
            }}
            ArrowDownIconComponent={() => (
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            )}
            ArrowUpIconComponent={() => (
              <Ionicons name="chevron-up" size={20} color="#9CA3AF" />
            )}
          />
        </View>

        {/* Plot Number */}
        <View className="mb-4">
          <Text className="text-sm text-gray-600 mb-2">{t("RequestInspectionForm.Plot No")}</Text>
          <TextInput
            value={plotNo}
          //  onChangeText={setPlotNo}
           onChangeText={(text) => handleTextInputChange(text, setPlotNo)}
            placeholder={t("RequestInspectionForm.Enter plot number")}
            className="bg-[#F4F4F4] rounded-full p-3 border border-[#F4F4F4] text-[gray-900]"
          />
        </View>

        {/* Street Name */}
        <View className="mb-4">
          <Text className="text-sm text-gray-600 mb-2">{t("RequestInspectionForm.Street Name")}</Text>
          <TextInput
            value={streetName}
           // onChangeText={setStreetName}
           onChangeText={(text) => handleTextInputChange(text, setStreetName)}
            placeholder={t("RequestInspectionForm.Enter street name")}
            className="bg-[#F4F4F4] rounded-full p-3 border border-[#F4F4F4] text-[gray-900]"
          />
        </View>

        {/* City */}
        <View className="mb-4">
          <Text className="text-sm text-gray-600 mb-2">{t("RequestInspectionForm.City")}</Text>
          <TextInput
            value={city}
          //  onChangeText={setCity}
          onChangeText={(text) => handleTextInputChange(text, setCity)}
            placeholder={t("RequestInspectionForm.Enter city")}
           className="bg-[#F4F4F4] rounded-full p-3 border border-[#F4F4F4] text-[gray-900]"
          />
        </View>

        {/* Field Visit Request For - Crops Selection */}
       {/* Field Visit Request For - Crops Selection */}
<View className="mb-4 mt-2">
  <Text className="text-sm text-gray-600 mb-3">{t("RequestInspectionForm.Field Visit Request For")}</Text>
  
  {loadingCrops && selectedFarm ? (
    <Text className="text-gray-500 text-center py-4">{t("RequestInspectionForm.Loading crops")}</Text>
  ) : farmCrops.length > 0 ? (
    <View className="space-y-3 pl-5">
      {/* "All in this Farm" option */}
      <TouchableOpacity
        onPress={() => toggleRequest("All in this Farm")}
        className="flex-row items-center mb-3"
      >
        <View
          className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
            isCropSelected("All in this Farm")
              ? "bg-black border-black"
              : "border-gray-300"
          }`}
        >
          {isCropSelected("All in this Farm") && (
            <Ionicons name="checkmark" size={14} color="#fff" />
          )}
        </View>
        <Text className="text-black font-medium">{t("RequestInspectionForm.All in this Farm")}</Text>
      </TouchableOpacity>

      {/* Individual crop options */}
      {farmCrops.map((crop, index) => (
        <TouchableOpacity
          key={crop.id}
          onPress={() => toggleRequest(crop.name)}
          className="flex-row items-center mb-3"
        >
          <View
            className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
              isCropSelected(crop.name)
                ? "bg-black border-black"
                : "border-gray-300"
            }`}
          >
            {isCropSelected(crop.name) && (
              <Ionicons name="checkmark" size={14} color="#fff" />
            )}
          </View>
          <Text className="text-black">{crop.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  ) : selectedFarm ? (
    <Text className="text-gray-500 text-center py-4">{t("RequestInspectionForm.No crops found for this farm")}</Text>
  ) : (
    <Text className="text-gray-500 text-center py-4">{t("RequestInspectionForm.Please select a farm to view crops")}</Text>
  )}
</View>

        {/* Selected Crops Summary */}
        {/* {selectedCrops.length > 0 && (
          <View className="mb-4 bg-blue-50 p-3 rounded-lg">
            <Text className="text-sm font-semibold text-blue-800 mb-2">
              Selected Crops ({selectedCrops.length}):
            </Text>
            <Text className="text-sm text-blue-700">
              {selectedCrops.map(crop => crop.name).join(', ')}
            </Text>
          </View>
        )} */}

        {/* Schedule Date */}
        <View className="mb-4">
          <Text className="text-sm text-gray-600 mb-3">{t("RequestInspectionForm.Schedule Date")}</Text>
          {renderCalendar()}
        </View>

        {/* Add More Button */}
        <View className="pr-10 pl-10">
        <TouchableOpacity 
          onPress={handleAddMore}
          className="bg-gray-800 rounded-full py-4 items-center mb-6 "
        >
          <Text className="text-white font-semibold text-base">{t("RequestInspectionForm.Add More")}</Text>
        </TouchableOpacity>
        </View>
      </ScrollView>
      

      {/* Bottom Bar */}
      <View className="bg-white border-t border-gray-200 px-5 py-4 flex-row justify-between items-center">
        <Text className="text-base">
          <Text className="text-gray-600">{t("RequestInspectionForm.Total")} </Text>
          {/* <Text className="font-semibold">
            {t("RequestInspectionForm.Rs")} {calculateTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text> */}
           <Text className="font-semibold">
      {t("RequestInspectionForm.Rs")}.{formatCurrency(calculateTotal())}
    </Text>
        </Text>
       {/* <TouchableOpacity 
  onPress={handleSubmit}
  className="bg-teal-500 rounded-full px-8 py-3"
  disabled={addedItems.length === 0}
  style={{ opacity: addedItems.length === 0 ? 0.5 : 1 }}
>
  <Text className="text-white font-semibold">{t("RequestInspectionForm.Done")}</Text>
</TouchableOpacity> */}
<TouchableOpacity 
    onPress={handleSubmit}
    className="bg-teal-500 rounded-full px-8 py-3"
    disabled={addedItems.length === 0}
    style={{ opacity: addedItems.length === 0 ? 0.5 : 1 }}
  >
    <Text className="text-white font-semibold">{t("RequestInspectionForm.Done")}</Text>
  </TouchableOpacity>
      </View>
    </View>
  );
};

export default RequestInspectionForm;