import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
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
import { useTranslation } from "react-i18next";

interface CropItem {
  task: string;
  CropDuration: string;
  taskDescriptionEnglish: string;
  taskCategoryEnglish: string;
  taskDescriptionSinhala: string
  taskDescriptionTamil: string
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
  const [timestamps, setTimestamps] = useState<string[]>([]);
  const [language, setLanguage] = useState('en');
  const { t } = useTranslation();

  const { cropId, cropName } = route.params;

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        //set language
        setLanguage(t('CropCalender.LNG'))

        const token = await AsyncStorage.getItem("userToken");

        const response = await axios.get(
          `${environment.API_BASE_URL}api/crop/crop-feed/${cropId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the token in the Authorization header
            },
          }
        );
        setCrops(response.data);
        setChecked(new Array(response.data.length).fill(false)); // Initialize all as unchecked
        setTimestamps(new Array(response.data.length).fill("")); // Initialize all timestamps as empty
      } catch (error) {
        console.error("Error fetching crops:", error);
      }
    };

    fetchCrops();
  }, []);

  const handleCheck = async (index: number) => {
    const now = moment();

    // Check if all previous tasks are checked
    if (index > 0) {
      if (!checked[index - 1]) {
        Alert.alert(
          t('CropCalender.WarningAlert'),
          `${t('CropCalender.WarningDis1')} ${index} ${t('CropCalender.WarningDis2')} ${index + 1}.`
        );
        return;
      }

      // Check the time difference between now and the previous task completion
      const previousTimestamp = timestamps[index - 1];
      if (previousTimestamp) {
        const previousTime = moment(previousTimestamp);
        const timeDifference = now.diff(previousTime, "hours");

        if (timeDifference < 6) {
          Alert.alert(
            t('CropCalender.AlartHead'),
            `${t('CropCalender.Allertdis1')} ${6 - timeDifference} ${t('CropCalender.Allertdis2')}.`
          );
          return;
        }
      }
    }

    // Update the checked state and timestamp
    const updatedChecked = [...checked];
    updatedChecked[index] = !updatedChecked[index]; // Toggle the check state
    setChecked(updatedChecked);

    if (updatedChecked[index]) {
      const updatedTimestamps = [...timestamps];
      updatedTimestamps[index] = now.toISOString(); // Save the current timestamp
      setTimestamps(updatedTimestamps);

      // Store in AsyncStorage to persist the timestamp between app sessions
      await AsyncStorage.setItem(`taskTimestamp_${index}`, now.toISOString());
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

  return (
    <SafeAreaView className="flex-1">
      <StatusBar style="light" />
      <View className="flex-row items-center justify-between px-4">
        <View>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
          >
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
                <Text className="ml-6 text-xl mt-2">{t('CropCalender.Task')} {index + 1}</Text>
              </View>
              <View className="flex-1 items-end justify-center">
                <TouchableOpacity
                  className="p-2"
                  onPress={() => handleCheck(index)}
                >
                  <AntDesign
                    name="checkcircle"
                    size={30}
                    color={checked[index] ? "green" : "gray"}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <Text className="mt-3 ml-6">{t('CropCalender.Day')} {index + 1}</Text>
            <Text className="m-6">
              {
                language === 'si' ? crop.taskDescriptionSinhala
                : language === 'ta' ? crop.taskDescriptionTamil
                : crop.taskDescriptionEnglish
              }
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
