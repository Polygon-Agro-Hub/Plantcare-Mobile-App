import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import AntDesign from "react-native-vector-icons/AntDesign";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import { useTranslation } from "react-i18next";
import { environment } from "@/environment/environment";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";


type CropEnrolRouteProp = RouteProp<RootStackParamList, "CropEnrol">;

interface CropEnrolProps {
  route: CropEnrolRouteProp;
  navigation: StackNavigationProp<RootStackParamList, "CropEnrol">;
}

interface CropCalender {
  id: number;
  cropVarietyId: number;
  method: string;
}

interface Item {
  id: number;
  ongoingCultivationId: number;
  cropCalendar: number;
  startedAt: Date;
  extent: number;
}

const CropEnrol: React.FC<CropEnrolProps> = ({ route, navigation }) => {
  const { cropId, status, onCulscropID} = route.params; 
  console.log("cropcalender params", cropId, status, onCulscropID);
  const [natureOfCultivation, setNatureOfCultivation] = useState<string>("");
  const [cultivationMethod, setCultivationMethod] = useState<string>("");
  const [extent, setExtent] = useState<string>("");
  const [unit, setUnit] = useState<string>("ha");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const farmer = require("../assets/images/Farmer.png");
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [cropCalender, setCropCalender] = useState<CropCalender | null>(null);
  const [search, setSearch] = useState<boolean>(false);
  const [formStatus, setFormStatus] = useState<string>(status);
  const [language, setLanguage] = useState('en');
    console.log("formStatus", formStatus);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || startDate;
    if (currentDate > new Date()) {
      Alert.alert("Invalid Date", "The start date cannot be in the future.", [
        { text: "OK" },
      ]);
      setShowDatePicker(false); 
      return;
    }
    setStartDate(currentDate); 
    setShowDatePicker(false); 
  };

  const handleSearch = async () => {
    setSearch(false);
    if (!natureOfCultivation) {
      Alert.alert("Error", "Please select Nature of Cultivation.");
      return;
    }
    if (!cultivationMethod) {
      Alert.alert("Error", "Please select Cultivation and Method.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get<CropCalender[]>(
        `${environment.API_BASE_URL}api/crop/get-crop-calender-details/${cropId}/${natureOfCultivation}/${cultivationMethod}`
      );

      if (res.data.length > 0) {
        setCropCalender(res.data[0]);
        console.log("Crop calendar data:", res.data);
        Alert.alert("Success", "Data found. You can continue.");
        setSearch(true);
      } else {
        Alert.alert("No Data", "No data found for the selected crop and method.");
      }
    } catch (err) {
      console.log("Failed to fetch data:", err);
      Alert.alert("Error", "Could not fetch data for the selected crop and method.");
    } finally {
      setLoading(false);
    }
  };

  const HandleEnrollBtn = async () => {
    if (!extent) {
      Alert.alert("Error", "Please enter the extent.");
      return;
    }

    const formattedStartDate = startDate.toISOString().split("T")[0];

    console.log("Enroll clicked with:", {
      cropId,
      extent,
      formattedStartDate,
    });
    try {
      console.log(cropId, extent, startDate);
      const token = await AsyncStorage.getItem("userToken");
      const res = await axios.get<string>(
        `${environment.API_BASE_URL}api/crop/enroll-crop/${cropId}/${extent}/${formattedStartDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      );
      if (res.status === 200) {
        Alert.alert(
          t("SelectCrop.success"),
          t("SelectCrop.enrollmentSuccessful")
        );
        navigation.navigate("MyCrop");
      } else {
        Alert.alert(t("SelectCrop.error"), t("SelectCrop.unexpectedError"));
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          const status = err.response.status;
          const message = err.response.data.message;

          if (status === 400) {
            if (message === "You have already enrolled in 3 crops") {
              Alert.alert(
                t("SelectCrop.error"),
                t("SelectCrop.enrollmentLimit")
              );
              
            } else {
              Alert.alert(t("SelectCrop.unexpectedError"),
               t("SelectCrop.alreadyEnrolled"),
               [
                 {
                   text: "OK", 
                   onPress: () => navigation.goBack()
                 }
               ],
               { cancelable: false });
              
            }
          } else if (status === 401) {;
            Alert.alert(t("SelectCrop.unauthorized"));
          } else if (status === 500) {
            Alert.alert(t("SelectCrop.serverError"));
          } else {
            Alert.alert(t("SelectCrop.serverError"));
          }
        } else if (err.request) {
          Alert.alert(t("SelectCrop.networkError"));
        } else {
          Alert.alert(t("SelectCrop.unexpectedError"));
        }
      } else {
        Alert.alert(t("SelectCrop.unexpectedError"));
      }
      console.error("Error enrolling crop:", err);
    }
  };

  const NatureOfCultivationCategories = [
    { key: "1", lebel:"Conventional Farming" , value: "Conventional Farming", translationKey: t("FixedAssets.conventionalFarming") },
    { key: "2", lebel:"GAP Farming" , value: "GAP Farming", translationKey: t("FixedAssets.gapFarming") },
    { key: "3", lebel:"Organic Farming" , value: "Organic Farming", translationKey: t("FixedAssets.organicFarming") },
  ];

  const CultivationMethodCategories = [
    { key: "1", lebel:"Open Field" , value: "Open Field", translationKey: t("FixedAssets.openField") },
    { key: "2", lebel:"Protected Field" , value: "Protected Field", translationKey: t("FixedAssets.protectedField") },
  ]
  useEffect(() => {
    const fetchOngoingCultivations = async () => {
      try {
        if (formStatus === "edit") { 
          setLanguage(t('MyCrop.LNG'));
          const token = await AsyncStorage.getItem("userToken");
          const res = await axios.get<Item[]>(
            `${environment.API_BASE_URL}api/crop/get-user-ongoingculscrops/${onCulscropID}`,
            {
              headers: {
                Authorization: `Bearer ${token}`, 
              },
            }
          );
          

          const ongoingCultivation = res.data[0]; // Take the first item or map if needed

          const formattedCrops = res.data.map((crop: Item) => ({
            ...crop,
            sstartedAt: moment(crop.startedAt).format("YYYY-MM-DD"),
          }));
          
          // Set extent and startDate
          setExtent(ongoingCultivation.extent.toString());
          setStartDate(new Date(formattedCrops[0].sstartedAt));
          console.log("Fetched Ongoing Cultivations:", formattedCrops);
          
          // Set extent and startDate
          
        }
      } catch (err) {
        console.error("Failed to fetch ongoing cultivations:", err);
      } 
    };
    fetchOngoingCultivations(); 
  }, [formStatus, onCulscropID]);
  
const updateOngoingCultivation = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      console.error("User token not found");
      return;
    }

    const formattedDate = startDate.toISOString().split('T')[0]; 
    
    // Log the data being sent
    console.log("Request Data:", {
      onCulscropID: onCulscropID,
      extent: extent,
      startedAt: formattedDate,
    });

    const response = await axios.post(
      `${environment.API_BASE_URL}api/crop/update-ongoingcultivation`,
      {
        onCulscropID: onCulscropID,
        extent: extent,
        startedAt: formattedDate,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200) {
      Alert.alert(
        "Success",
        "Ongoing Cultivation updated successfully.",
        [
          {
            text: "OK", 
            onPress: () => navigation.goBack()
          }
        ],
        { cancelable: false }
      );
    } else {
      console.error("Failed to update ongoing cultivation:", response.data);
    }
  } catch (error) {
    console.error("Error updating ongoing cultivation:", error);
  }
};

if (loading) {
  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#00ff00" />
    </View>
  );
}

  return (
    <ScrollView className="px-5 pt-2">
      <View className="flex-row justify-between mb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="">
          <AntDesign name="left" size={24} color="#000502" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-lg font-bold">
        {formStatus === "newAdd" ? "Start your Cultivation" 
        : "Update your Cultivation"}
      </Text>
        </View>
      </View>

      <View className="items-center mb-5">
        <Image className="w-32 h-32" source={farmer} />
      </View>

     
     {formStatus === "newAdd" ? (
      <>
       <Text>Select Nature of Cultivation </Text>
      <View className="border-b border-gray-400 mb-8">
        <Picker
          selectedValue={natureOfCultivation}
          onValueChange={(itemValue) => setNatureOfCultivation(itemValue)}
        >
          <Picker.Item label="Select Nature of Cultivation" value="" />
          {NatureOfCultivationCategories.map((item) => (
            <Picker.Item
              key={item.key}
              label={item.lebel } 
              value={item.value}
            />
          ))}
        </Picker>
      </View>

      <Text>Select Cultivation Method </Text>
      <View className="border-b border-gray-400 mb-8">
        <Picker
          selectedValue={cultivationMethod}
          onValueChange={(itemValue) => setCultivationMethod(itemValue)}
        >
          <Picker.Item label="Select Cultivation Method" value="" />
          {CultivationMethodCategories.map((item) => (
            <Picker.Item
              key={item.key}
              label={item.lebel} 
              value={item.value}
            />
          ))}
        </Picker>
      </View>

      <TouchableOpacity
        onPress={handleSearch}
        className="bg-gray-800 p-3 items-center rounded-lg"
      >
        <Text className="text-white text-base font-bold">Search</Text>
      </TouchableOpacity>

      {search && (
        <>
          <Text className="mt-8">Select Extent </Text>
          <View className="flex-row space-x-4">
            <TextInput
              value={extent}
              onChangeText={setExtent}
              placeholder="Enter extent"
              keyboardType="numeric"
              style={{ flex: 1, padding: 10 }}
              className="border-b border-gray-400"
            />
            <View className="border-b border-gray-400 rounded-md overflow-hidden w-32">
              <Picker
                selectedValue={unit}
                onValueChange={(itemValue) => setUnit(itemValue)}
                style={{ width: "100%" }}
              >
                <Picker.Item label="ha" value="ha" />
                <Picker.Item label="acres" value="acres" />
              </Picker>
            </View>
          </View>

          <Text className="mt-4">Select Start Date </Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="border-b border-gray-400 my-3 flex-row justify-between items-center p-3"
          >
            <Text>{startDate.toDateString()}</Text>
            <Icon name="arrow-drop-down" size={24} color="gray" />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              maximumDate={new Date()} 
              onChange={onChangeDate}
            />
          )}

          <TouchableOpacity
            onPress={HandleEnrollBtn}
            className=" rounded-lg bg-[#26D041] p-3 mt-8 items-center bottom-0 left-0 right-0 "
          >
            <Text className="text-white text-base font-bold">
              {t("SelectCrop.enroll")}
            </Text>
          </TouchableOpacity>
        </>
      )}
      </>
      
     ) : (
      <>
        <>
          <Text className="mt-8">Select Extent </Text>
          <View className="flex-row space-x-4">
            <TextInput
              value={extent}
              onChangeText={setExtent}
              placeholder="Enter extent"
              keyboardType="numeric"
              style={{ flex: 1, padding: 10 }}
              className="border-b border-gray-400"
            />
            <View className="border-b border-gray-400 rounded-md overflow-hidden w-32">
              <Picker
                selectedValue={unit}
                onValueChange={(itemValue) => setUnit(itemValue)}
                style={{ width: "100%" }}
              >
                <Picker.Item label="ha" value="ha" />
                <Picker.Item label="acres" value="acres" />
              </Picker>
            </View>
          </View>

          <Text className="mt-4">Select Start Date </Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="border-b border-gray-400 my-3 flex-row justify-between items-center p-3"
          >
            <Text>{startDate.toDateString()}</Text>
            <Icon name="arrow-drop-down" size={24} color="gray" />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              maximumDate={new Date()} 
              onChange={onChangeDate}
            />
          )}

          <TouchableOpacity
            onPress={updateOngoingCultivation }
            className=" rounded-lg bg-[#26D041] p-3 mt-8 items-center bottom-0 left-0 right-0 "
          >
            <Text className="text-white text-base font-bold">
              {t("FixedAssets.updateAsset")}
            </Text>
          </TouchableOpacity>
        </>
      </>
     )}
     
    </ScrollView>
  );
};

export default CropEnrol;
