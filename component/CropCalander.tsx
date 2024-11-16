import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  View,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from "axios";
import AntDesign from "react-native-vector-icons/AntDesign";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import { RouteProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment"; // For handling date/time
import { environment } from "@/environment/environment";
import NavigationBar from "@/Items/NavigationBar";
import { Dimensions } from "react-native"; // Import Dimensions to get screen width
import i18n from "@/i18n/i18n";
import { useTranslation } from "react-i18next";
import CultivatedLandModal from "./CultivatedLandModal"; // Replace with the correct path


interface CropItem {
  id: string;
  task: string;
  taskIndex: number;
  days: number;
  CropDuration: string;
  taskDescriptionEnglish: string;
  taskCategoryEnglish: string;
  taskDescriptionSinhala: string;
  taskDescriptionTamil: string;
  status: string;
}

type CropCalanderProp = RouteProp<RootStackParamList, "CropCalander">;

type CropCalendarNavigationProp = StackNavigationProp<
  RootStackParamList,
  "CropCalander"
>;

interface CropCalendarProps {
  navigation: CropCalendarNavigationProp;
  route: CropCalanderProp;
}

const screenWidth = Dimensions.get("window").width; // Get the full screen width

const CropCalander: React.FC<CropCalendarProps> = ({ navigation, route }) => {
  const [crops, setCrops] = useState<CropItem[]>([]);
  const [checked, setChecked] = useState<boolean[]>([]);
  const [timestamps, setTimestamps] = useState<string[]>([]); // To store task completion times
  const [language, setLanguage] = useState("en");
  const { cropId, cropName } = route.params;
  const { t } = useTranslation();
  const [lastCompletedIndex, setLastCompletedIndex] = useState<number | null>(
    null
  ); // To track the last completed task index
  const [loading, setLoading] = useState<boolean>(true);
  const [isCultivatedLandModalVisible, setCultivatedLandModalVisible] = useState(false);


  useEffect(() => {
    const loadLanguage = async () => {
      const storedLanguage = await AsyncStorage.getItem("@user_language");
      if (storedLanguage) {
        setLanguage(storedLanguage);
        i18n.changeLanguage(storedLanguage);
      }
    };

    const fetchCrops = async () => {
      try {
        // Set language
        setLanguage(t("CropCalender.LNG"));
        const token = await AsyncStorage.getItem("userToken");

        const response = await axios.get(
          `${environment.API_BASE_URL}api/crop/slave-crop-calendar/${cropId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the token in the Authorization header
            },
          }
        );
        setCrops(response.data);
        console.log(response.data)

        const slaveId = response.data.id;
        

        // Initialize checked states based on the task status
        const checkedStates = response.data.map(
          (crop: CropItem) => crop.status === "completed"
        );
        setChecked(checkedStates);

        // Find the index of the last completed task
        const lastCompletedTaskIndex = checkedStates.lastIndexOf(true);
        setLastCompletedIndex(lastCompletedTaskIndex);

        setTimestamps(new Array(response.data.length).fill("")); // Initialize all timestamps as empty
      } catch (error) {
        console.error("Error fetching crops:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCrops();
    loadLanguage();
  }, []);

  const handleCheck = async (i: number) => {
    const now = moment();
    const currentCrop = crops[i];
  
    // Check if all previous tasks are checked
    if (i > 0) {
      if (!checked[i - 1]) {
        return;
      }
    }
  
    // Toggle the task status
    const newStatus = checked[i] ? "pending" : "completed";
  
    try {
      const token = await AsyncStorage.getItem("userToken");
  
      // Call backend to update the status
      await axios.post(
        `${environment.API_BASE_URL}api/crop/update-slave`,
        {
          id: currentCrop.id,
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        }
      );
  
      // Update the checked state and timestamp on successful backend update
      const updatedChecked = [...checked];
      updatedChecked[i] = !updatedChecked[i]; // Toggle the check state
      setChecked(updatedChecked);
  
      if (updatedChecked[i]) {
        const updatedTimestamps = [...timestamps];
        updatedTimestamps[i] = now.toISOString(); // Save the current timestamp
        setTimestamps(updatedTimestamps);
  
        // Store in AsyncStorage to persist the timestamp between app sessions
        await AsyncStorage.setItem(`taskTimestamp_${i}`, now.toISOString());
  
        // Update the last completed task index
        setLastCompletedIndex(i);
      } else {
        // If task is marked as pending, clear the timestamp and recalculate the last completed index
        const updatedTimestamps = [...timestamps];
        updatedTimestamps[i] = ""; // Clear timestamp
        setTimestamps(updatedTimestamps);
        await AsyncStorage.removeItem(`taskTimestamp_${i}`);
  
        // Recalculate the last completed index
        const newLastCompletedIndex = updatedChecked.lastIndexOf(true);
        setLastCompletedIndex(newLastCompletedIndex);
      }
  
      Alert.alert(
        t("CropCalender.success"),
        t("CropCalender.taskUpdated", {
          task: i + 1,
          status: t(`CropCalender.status.${newStatus}`),
        })
      );
      if (updatedChecked[i]) {
        // Pass currentCrop.id to the modal
        setCultivatedLandModalVisible(true); // Show the modal
      }
    } catch (error: any) {
      if (
        error.response &&
        error.response.data.message.includes(
          "You cannot change the status back to pending after 1 hour"
        )
      ) {
        Alert.alert(
          t("CropCalender.errormsg"),
          t("CropCalender.cannotChangeStatus")
        );
      } else if (
        error.response &&
        error.response.data.message.includes("You need to wait 6 hours")
      ) {
        Alert.alert(t("CropCalender.errormsg"), t("CropCalender.wait6Hours"));
      } else {
        Alert.alert("Error", error.response.data.message);
      }
    }
  };
  

  useEffect(() => {
    const loadTimestamps = async () => {
      const loadedTimestamps = [];
      for (let i = 0; i < crops.length; i++) {
        const timestamp = await AsyncStorage.getItem(`taskTimestamp_${i}`);
        loadedTimestamps.push(timestamp || "");
      }
      setTimestamps(loadedTimestamps);
    };

    if (crops.length > 0) {
      loadTimestamps(); // Load timestamps from AsyncStorage when crops are fetched
    }
  }, [crops]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <StatusBar style="light" />

       {/* CultivatedLandModal Component */}
       {isCultivatedLandModalVisible && lastCompletedIndex !== null && (
        <CultivatedLandModal
          visible={isCultivatedLandModalVisible}
          onClose={() => setCultivatedLandModalVisible(false)}
          cropId={crops[lastCompletedIndex].id} // Access cropId only if lastCompletedIndex is not null
        />
      )}



      <View className="flex-row items-center justify-between px-4">
        <View>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back-outline" size={30} color="gray" />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-black text-xl">{cropName}</Text>
        </View>
      </View>
      <ScrollView style={{ marginBottom: 60 }}>
        {crops.map((crop, index) => (
          <View
            key={index}
            className="flex-1 m-6 shadow border-gray-200 border-[1px] rounded-[15px]"
          >
            <View className="flex-row">
              <View>
                <Text className="ml-6 text-xl mt-2">
                  {t("CropCalender.Task")} {crop.taskIndex}
                </Text>
              </View>
              <View className="flex-1 items-end justify-center">
                <TouchableOpacity
                  className="p-2"
                  onPress={() => handleCheck(index)}
                  disabled={
                    lastCompletedIndex !== null &&
                    index > lastCompletedIndex + 1 // Disable tick if it's beyond the next task
                  }
                >
                  <AntDesign
                    name="checkcircle"
                    size={30}
                    color={
                      checked[index]
                        ? "green"
                        : lastCompletedIndex !== null &&
                          index > lastCompletedIndex + 1
                        ? "#CDCDCD"
                        : "#3b3b3b" // Gray out the icon if disabled
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>
            <Text className="mt-3 ml-6">
              {t("CropCalender.Day")} {crop.days}
            </Text>
            <Text className="m-6">
              {language === "si"
                ? crop.taskDescriptionSinhala
                : language === "ta"
                ? crop.taskDescriptionTamil
                : crop.taskDescriptionEnglish}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Fix NavigationBar at the bottom and ensure it takes full screen width */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          width: screenWidth, // Full screen width for the navigation bar
          borderTopWidth: 1,
          borderColor: "#D1D5DB", // This is the hex code for border-gray-300
          backgroundColor: "#fff",
        }}
      >
        <NavigationBar navigation={navigation} />
      </View>
    </SafeAreaView>
  );
};

export default CropCalander;
