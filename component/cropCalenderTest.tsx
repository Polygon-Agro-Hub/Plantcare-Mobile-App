import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  View,
  Alert,
  Linking,
  RefreshControl,
  FlatList
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
import moment from "moment";
import { environment } from "@/environment/environment";
import NavigationBar from "@/Items/NavigationBar";
import { Dimensions } from "react-native";
import i18n from "@/i18n/i18n";
import { useTranslation } from "react-i18next";
import CultivatedLandModal from "./CultivatedLandModal"; // Replace with the correct path
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import * as Location from "expo-location";
import { useFocusEffect } from "@react-navigation/native";

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
  startingDate: string;
  createdAt: string;
  onCulscropID: number;
  imageLink: string;
  videoLink: string;
  reqImages: number;
  reqGeo: number;
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

const CropCalander: React.FC<CropCalendarProps> = ({ navigation, route }) => {
  const [crops, setCrops] = useState<CropItem[]>([]);
  const [checked, setChecked] = useState<boolean[]>([]);
  const [timestamps, setTimestamps] = useState<string[]>([]);
  const [language, setLanguage] = useState("en");
  const { cropId, cropName } = route.params;
  const { t } = useTranslation();
  const [updateerror, setUpdateError] = useState<string>("");
  const [lastCompletedIndex, setLastCompletedIndex] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [isCultivatedLandModalVisible, setCultivatedLandModalVisible] =
    useState(false);
  const [isImageUpload, setImageUpload] = useState(false);
  const [isCompleted, setCompleted] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refloading, setRefLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [startIndex, setStartIndex] = useState(0);
  const tasksPerPage = 5;

  const loadLanguage = async () => {
    const storedLanguage = await AsyncStorage.getItem("@user_language");
    if (storedLanguage) {
      setLanguage(storedLanguage);
      i18n.changeLanguage(storedLanguage);
    }
  };

  const fetchCrops = async () => {
    try {
      setLanguage(t("CropCalender.LNG"));
      const token = await AsyncStorage.getItem("userToken");

      const response = await axios.get(
        `${environment.API_BASE_URL}api/crop/slave-crop-calendar/${cropId}`,
        {
          params: { limit: 10 },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const formattedCrops = response.data.map((crop: CropItem) => ({
        ...crop,
        startingDate: moment(crop.startingDate).format("YYYY-MM-DD"),
        createdAt: moment(crop.createdAt).format("YYYY-MM-DD"),
      }));

      setCrops(formattedCrops); 
      console.log(formattedCrops);

      const newCheckedStates = formattedCrops.map(
        (crop: CropItem) => crop.status === "completed"
      );
      setChecked(newCheckedStates);
      setHasMore(formattedCrops.length === 10);

      const lastCompletedTaskIndex = newCheckedStates.lastIndexOf(true);
      setLastCompletedIndex(lastCompletedTaskIndex);

      setTimestamps(new Array(response.data.length).fill(""));
      const nextUpcomingTasks = formattedCrops.slice(0, 3).map((crop: CropItem) => crop.startingDate);
      await AsyncStorage.setItem("nextUpcomingTaskDates", JSON.stringify(nextUpcomingTasks));
      console.log(nextUpcomingTasks);
      setLoading(false);
    } catch (error) {
      Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const navigateToNextIncompleteTask = () => {
        const firstIncompleteIndex = checked.findIndex((status) => !status);
        if (firstIncompleteIndex !== -1) {
          const newStartIndex = Math.floor(firstIncompleteIndex / tasksPerPage) * tasksPerPage;
          setStartIndex(newStartIndex);
        } else {
          setStartIndex(0);
        }
      };
  
      setCrops([]);
      loadLanguage();
      fetchCrops().then(() => navigateToNextIncompleteTask());
    }, [cropId])
  );
  
  const viewNextTasks = () => {
    if (startIndex + tasksPerPage < crops.length) {
      setStartIndex(startIndex + tasksPerPage);
    }
  };

  const viewPreviousTasks = () => {
    if (startIndex - tasksPerPage >= 0) {
      setStartIndex(startIndex - tasksPerPage);
    }
  };

  const currentTasks = crops.slice(startIndex, startIndex + tasksPerPage);

  const handleCheck = async (i: number) => {
    // Calculate the global index in the `crops` array
    const globalIndex = startIndex + i;
    const currentCrop = crops[globalIndex];
    const PreviousCrop = crops[globalIndex - 1];

    // Ensure the previous task is completed before marking the current one
    if (globalIndex > 0 && !checked[globalIndex - 1]) {
      return;
    }

    // Determine the new status of the task
    const newStatus = checked[globalIndex] ? "pending" : "completed";

    let updateMessage = "";

    // Calculate remaining days and updateMessage logic
    if (PreviousCrop && currentCrop) {
      const PreviousCropDate = new Date(PreviousCrop.createdAt);
      const TaskDays = currentCrop.days;
      const CurrentDate = new Date();
      const nextCropUpdate = new Date(
        PreviousCropDate.getTime() + TaskDays * 24 * 60 * 60 * 1000
      );
      const remainingTime = nextCropUpdate.getTime() - CurrentDate.getTime();
      const remainingDays = Math.ceil(remainingTime / (24 * 60 * 60 * 1000));

      if (remainingDays > 0 && language === "si") {
        updateMessage = `${t("CropCalender.YouHave")} ${t(
          "CropCalender.daysRemaining",
          {
            date: remainingDays,
          }
        )}`;
      } else {
        updateMessage = t("CropCalender.overDue");
      }

      if (!updateMessage) {
        updateMessage = `${t("CropCalender.YouHave")} ${remainingDays} ${t(
          "CropCalender.daysRemaining"
        )}`;
      }

      setUpdateError(updateMessage); // Set the error message here
    } else {
      // If the previous crop or current crop is not available, set a default error message
      updateMessage = t("CropCalender.noCropData");
      setUpdateError(updateMessage);
    }

    try {
      const token = await AsyncStorage.getItem("userToken");

      // Update the status in the backend
      await axios.post(
        `${environment.API_BASE_URL}api/crop/update-slave`,
        {
          id: currentCrop.id,
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the local `checked` state
      const updatedChecked = [...checked];
      updatedChecked[globalIndex] = !updatedChecked[globalIndex];
      setChecked(updatedChecked);

      // Update the timestamps for completed tasks
      const updatedTimestamps = [...timestamps];
      if (updatedChecked[globalIndex]) {
        const now = moment().toISOString();
        updatedTimestamps[globalIndex] = now;
        setTimestamps(updatedTimestamps);

        // Save timestamp to AsyncStorage
        await AsyncStorage.setItem(`taskTimestamp_${globalIndex}`, now);
      } else {
        updatedTimestamps[globalIndex] = "";
        setTimestamps(updatedTimestamps);

        // Remove timestamp from AsyncStorage
        await AsyncStorage.removeItem(`taskTimestamp_${globalIndex}`);
      }

      // Update the `lastCompletedIndex` state
      const newLastCompletedIndex = updatedChecked.lastIndexOf(true);
      setLastCompletedIndex(newLastCompletedIndex);

      // Show success alert
      Alert.alert(
        t("CropCalender.success"),
        t("CropCalender.taskUpdated", {
          task: globalIndex + 1,
          status: t(`CropCalender.status.${newStatus}`),
        })
      );

      // If the task requires geo-location, handle it
      if (currentCrop.reqGeo === 1 && newStatus === "completed") {
        await handleLocationIconPress(currentCrop);
      }

      // Show the cultivated land modal if the task requires images
      if (updatedChecked[globalIndex] && currentCrop.reqImages > 0) {
        setCultivatedLandModalVisible(true);
      }
    } catch (error: any) {
      if (
        error.response &&
        error.response.data.message.includes(
          "You cannot change the status back to pending after 1 hour"
        )
      ) {
        Alert.alert(
          t("CropCalender.sorry"),
          t("CropCalender.cannotChangeStatus")
        );
      } else if (
        error.response &&
        error.response.data.message.includes("You need to wait 6 hours")
      ) {
        Alert.alert(t("CropCalender.sorry"), updateMessage); // Show the updateMessage here
      } else {
        Alert.alert(t("CropCalender.sorry"), updateMessage); // Show the updateMessage here
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
      loadTimestamps();
    }
  }, [crops]);

  const handleLocationIconPress = async (currentCrop: CropItem) => {
    setLoading(true);
    console.log(currentCrop.id);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});

        // Fetch weather data directly for the current location
        console.log(location.coords.latitude, location.coords.longitude);
        setLoading(false);

        const token = await AsyncStorage.getItem("userToken");
        const response = await axios.post(
          `${environment.API_BASE_URL}api/crop/geo-location`,
          {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            taskId: currentCrop.id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(response.data);
      } else {
        Alert.alert(
          "Permission Denied",
          "Location access is required to fetch weather data for your current location. You can search for a location manually.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error getting current location:", error);
      Alert.alert("Error", "Unable to fetch current location.");
      setLoading(false);
    }
  };

  const renderTask = ({ item: crop, index }: { item: CropItem; index: number }) => (
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
              startIndex + index > lastCompletedIndex + 1
            }
          >
            <AntDesign
              name="checkcircle"
              size={30}
              color={
                checked[startIndex + index]
                  ? "#008000"
                  : lastCompletedIndex !== null &&
                    startIndex + index === lastCompletedIndex + 1
                  ? "#000000"
                  : "#CDCDCD"
              }
            />
          </TouchableOpacity>
        </View>
      </View>
      <Text className="mt-3 ml-6">{crop.startingDate}</Text>
      <Text className="m-6">
        {language === "si"
          ? crop.taskDescriptionSinhala
          : language === "ta"
          ? crop.taskDescriptionTamil
          : crop.taskDescriptionEnglish}
      </Text>
      {crop.imageLink && (
        <TouchableOpacity
          onPress={() =>
            crop.imageLink && Linking.openURL(crop.imageLink)
          }
        >
          <View className="flex rounded-lgitems-center m-4 rounded-xl bg-black">
            <Text className="text-white p-3 text-center">
              {t("CropCalender.viewImage")}
            </Text>
          </View>
        </TouchableOpacity>
      )}
      {crop.videoLink && (
        <TouchableOpacity
          onPress={() =>
            crop.videoLink && Linking.openURL(crop.videoLink)
          }
        >
          <View className="flex rounded-lgitems-center m-4 -mt-2 rounded-xl bg-black">
            <Text className="text-white p-3 text-center">
              {t("CropCalender.viewVideo")}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );

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

      {isCultivatedLandModalVisible && lastCompletedIndex !== null && (
        <CultivatedLandModal
          visible={isCultivatedLandModalVisible}
          onClose={() => setCultivatedLandModalVisible(false)}
          cropId={crops[lastCompletedIndex].id}
          requiredImages={0}
        />
      )}

      <View
        className="flex-row items-center justify-between"
        style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back-outline" size={30} color="gray" />
        </TouchableOpacity>
        <Text className="text-black text-xl flex-1 text-center">{cropName}</Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("CropEnrol", {
              status: "edit",
              onCulscropID: crops[0]?.onCulscropID,
              cropId,
            })
          }
        >
          {crops[0]?.status !== "completed" && (
            <Ionicons name="pencil" size={20} color="gray" />
          )}
        </TouchableOpacity>
      </View>

      <FlatList
  data={currentTasks}
  keyExtractor={(item: { id: any; }, index: any) => `${item.id}-${index}`}
  renderItem={renderTask}
  onEndReachedThreshold={0.1}
  onEndReached={() => {
    if (startIndex + tasksPerPage < crops.length) {
      setStartIndex(startIndex + tasksPerPage);
    }
  }}
  ListHeaderComponent={
    startIndex > 0 ? ( // Show "Previous Tasks" button only if there are previous tasks
      <TouchableOpacity
        className="py-2 px-4 flex-row items-center justify-center"
        onPress={viewPreviousTasks}
      >
        <Text className="text-black font-bold">
          {t("PublicForum.previous")}
        </Text>
      </TouchableOpacity>
    ) : null
  }
  ListFooterComponent={
    startIndex + tasksPerPage < crops.length ? (
      <TouchableOpacity
        className="py-2 pb-8 px-4 flex-row items-center justify-center"
        onPress={viewNextTasks}
      >
        <Text className="text-black font-bold">
          {t("PublicForum.viewMore")}
        </Text>
      </TouchableOpacity>
    ) : null
  }
/>

    </SafeAreaView>
  );
};

export default CropCalander;