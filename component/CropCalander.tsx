import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  View,
  Alert,
  Linking,
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

const screenWidth = Dimensions.get("window").width;

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
  console.log(isCompleted);

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
        setLanguage(t("CropCalender.LNG"));
        const token = await AsyncStorage.getItem("userToken");

        const response = await axios.get(
          `${environment.API_BASE_URL}api/crop/slave-crop-calendar/${cropId}`,
          {
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
        const checkedStates = response.data.map(
          (crop: CropItem) => crop.status === "completed"
        );
        setChecked(checkedStates);
        console.log(formattedCrops);

        const lastCompletedTaskIndex = checkedStates.lastIndexOf(true);
        setLastCompletedIndex(lastCompletedTaskIndex);

        setTimestamps(new Array(response.data.length).fill(""));
      } catch (error) {
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
      } finally {
        setLoading(false);
      }
    };

    fetchCrops();
    loadLanguage();
  }, []);

  const handleCheck = async (i: number) => {
    await AsyncStorage.removeItem(`uploadProgress-${cropId}`);

    const now = moment();
    const currentCrop = crops[i];
    const PreviousCrop = crops[i - 1];
    const NextCrop = crops[i + 1];

    if (i > 0 && !checked[i - 1]) {
      return; // Ensure previous task is completed
    }

    if (PreviousCrop && currentCrop) {
      const PreviousCropDate = new Date(PreviousCrop.createdAt);
      const TaskDays = currentCrop.days;
      const CurrentDate = new Date();
      const nextCropUpdate = new Date(
        PreviousCropDate.getTime() + TaskDays * 24 * 60 * 60 * 1000
      );
      const remainingTime = nextCropUpdate.getTime() - CurrentDate.getTime();
      const remainingDays = Math.ceil(remainingTime / (24 * 60 * 60 * 1000));
      let updateMessage;
      if (remainingDays > 0) {
        updateMessage = `${t("CropCalender.YouHave")} ${remainingDays} ${t(
          "CropCalender.daysRemaining"
        )}`;
      } else {
        updateMessage = t("CropCalender.overDue");
      }
      setUpdateError(updateMessage);
    }

    const newStatus = checked[i] ? "pending" : "completed";

    try {
      const token = await AsyncStorage.getItem("userToken");

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

      const updatedChecked = [...checked];
      updatedChecked[i] = !updatedChecked[i];
      setChecked(updatedChecked);
      if (updatedChecked[i]) {
        const updatedTimestamps = [...timestamps];
        updatedTimestamps[i] = now.toISOString();
        setTimestamps(updatedTimestamps);

        await AsyncStorage.setItem(`taskTimestamp_${i}`, now.toISOString());
        setLastCompletedIndex(i);
      } else {
        const updatedTimestamps = [...timestamps];
        updatedTimestamps[i] = "";
        setTimestamps(updatedTimestamps);
        await AsyncStorage.removeItem(`taskTimestamp_${i}`);

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
          t("CropCalender.sorry"),
          t("CropCalender.cannotChangeStatus")
        );
      } else if (
        error.response &&
        error.response.data.message.includes("You need to wait 6 hours")
      ) {
        Alert.alert(t("CropCalender.sorry"), updateerror);
      } else {
        Alert.alert(t("CropCalender.sorry"), updateerror);
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
        <View>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back-outline" size={30} color="gray" />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-black text-xl">{cropName}</Text>
        </View>
        <View>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("CropEnrol", {
                status: "edit",
                onCulscropID: crops[0]?.onCulscropID,
                cropId,
              })
            }
          >
            {crops[1]?.status !== "completed" && (
              <Ionicons name="pencil" size={20} color="gray" />
            )}
          </TouchableOpacity>
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
                    index > lastCompletedIndex + 1
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
                        : "#3b3b3b"
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
                <View className="flex rounded-lgitems-center m-4 rounded-xl bg-black  ">
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
                <View className="flex rounded-lgitems-center m-4 -mt-2 rounded-xl bg-black  ">
                  <Text className="text-white p-3 text-center">
                    {t("CropCalender.viewVideo")}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>

      <View
        style={{
          position: "absolute",
          bottom: 0,
          width: screenWidth,
          borderTopWidth: 1,
          borderColor: "#D1D5DB",
          backgroundColor: "#fff",
        }}
      >
        <NavigationBar navigation={navigation} />
      </View>
    </SafeAreaView>
  );
};

export default CropCalander;
