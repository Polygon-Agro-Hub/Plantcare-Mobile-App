import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Linking,
  Platform,
  RefreshControl,
  BackHandler,
  Image,
  Modal,
} from "react-native";
import React, { useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import axios from "axios";
import AntDesign from "@expo/vector-icons/AntDesign";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/types";
import { RouteProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import { environment } from "@/environment/environment";
import i18n from "@/i18n/i18n";
import { useTranslation } from "react-i18next";
import * as ImageManipulator from "expo-image-manipulator";
import CultivatedLandModal from "../common/CultivatedLandModal";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import * as Location from "expo-location";
import { useFocusEffect } from "@react-navigation/native";
import ContentLoader, { Rect } from "react-content-loader/native";
import * as Device from "expo-device";
import Constants from "expo-constants";
import * as ScreenCapture from "expo-screen-capture";
import { useSelector } from "react-redux";
import type { RootState } from "../../services/reducxStore";
import ImageViewerModal from "../common/ImageViewerModal";
import LocationAccess from "../permission/LocationAccess";
import * as FileSystem from "expo-file-system/legacy";

let Notifications: any = null;
try {
  if (Constants.appOwnership !== "expo") {
    Notifications = require("expo-notifications");
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  }
} catch (e) {
  console.log("Push notifications not supported in Expo Go");
}

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
  taskEnglish: string;
  taskSinhala: string;
  taskTamil: string;
  status: string;
  startingDate: string;
  createdAt: string;
  onCulscropID: number;
  imageLink: string;
  videoLinkEnglish: string;
  videoLinkSinhala: string;
  videoLinkTamil: string;
  reqImages: number;
  autoCompleted: number;
  uploadedBy?: string;
  images?: ImageData[];
}

interface ImageData {
  uri: string;
  url?: string;
  title?: string;
  description?: string;
  uploadedBy?: string;
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
interface UserData {
  farmCount: number;
  membership: string;
  paymentActiveStatus: string | null;
  role: string;
}

const CropCalander: React.FC<CropCalendarProps> = ({ navigation, route }) => {
  const [crops, setCrops] = useState<CropItem[]>([]);
  const [checked, setChecked] = useState<boolean[]>([]);
  const [timestamps, setTimestamps] = useState<string[]>([]);
  const [language, setLanguage] = useState("en");
  const { cropId, cropName, farmId, farmName, imageId } = route.params;
  const { t } = useTranslation();
  const [lastCompletedIndex, setLastCompletedIndex] = useState<number | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [isCultivatedLandModalVisible, setCultivatedLandModalVisible] =
    useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const [startIndex, setStartIndex] = useState(0);
  const [showediticon, setShowEditIcon] = useState(false);

  const [pendingImageCrop, setPendingImageCrop] = useState<{
    crop: CropItem;
    globalIndex: number;
  } | null>(null);

  const tasksPerPage = 5;

  const user = useSelector(
    (state: RootState) => state.user.userData,
  ) as UserData | null;
  const [imageModalVisible, setImageModalVisible] = useState<boolean>(false);
  const [selectedTaskImages, setSelectedTaskImages] = useState<ImageData[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [tasksWithImages, setTasksWithImages] = useState<Set<string>>(
    new Set(),
  );
  const [showLocationAccess, setShowLocationAccess] = useState<boolean>(false);
  const [pendingLocationTask, setPendingLocationTask] = useState<{
    globalIndex: number;
    crop: CropItem;
  } | null>(null);
  const [showCertificationModal, setShowCertificationModal] =
    useState<boolean>(false);
  const [isCertificatePending, setIsCertificatePending] =
    useState<boolean>(false);

  const checkCertificateStatus = async (
    token: string,
    onCulscropId?: number,
  ) => {
    try {
      if (farmId) {
        const farmCertResponse = await axios.get(
          `${environment.API_BASE_URL}api/certificate/get-farmcertificatetask/${farmId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (farmCertResponse.data && farmCertResponse.data.length > 0) {
          const allComplete = farmCertResponse.data.every(
            (cert: any) =>
              cert.questionnaireItems?.every((item: any) => {
                if (item.type === "Tick Off") return item.tickResult === 1;
                if (item.type === "Photo Proof")
                  return item.uploadImage !== null && item.uploadImage !== "";
                return true;
              }) || false,
          );
          if (!allComplete) {
            setIsCertificatePending(true);
            return;
          }
        }
      }

      const ongoingId = onCulscropId || (route.params as any)?.ongoingCropId;
      if (ongoingId) {
        const cropCertResponse = await axios.get(
          `${environment.API_BASE_URL}api/certificate/get-crop-certificate-status/${ongoingId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (
          cropCertResponse.data?.questionnaireItems &&
          Array.isArray(cropCertResponse.data.questionnaireItems) &&
          cropCertResponse.data.questionnaireItems.length > 0
        ) {
          const allComplete = cropCertResponse.data.questionnaireItems.every(
            (item: any) => {
              if (item.type === "Tick Off") return item.tickResult === 1;
              if (item.type === "Photo Proof")
                return item.uploadImage !== null && item.uploadImage !== "";
              return true;
            },
          );
          if (!allComplete) {
            setIsCertificatePending(true);
            return;
          }
        }
      }
      setIsCertificatePending(false);
    } catch {
      setIsCertificatePending(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const disableScreenCapture = async () => {
        await ScreenCapture.preventScreenCaptureAsync();
      };

      const enableScreenCapture = async () => {
        await ScreenCapture.allowScreenCaptureAsync();
      };
      disableScreenCapture();

      return () => {
        enableScreenCapture();
      };
    }, []),
  );

  const handleBackPress = React.useCallback(() => {
    const userRole = user?.role;
    const fromScreen = (route.params as any)?.fromScreen;

    if (
      fromScreen === "MyCrop" ||
      userRole === "Laborer" ||
      userRole === "Laboror" ||
      !farmName
    ) {
      (navigation as any).navigate("MyCrop");
    } else if (fromScreen === "ManagerFarmDetails" || farmName) {
      navigation.navigate("ManagerFarmDetails", {
        farmId: farmId,
        farmName: farmName,
        imageId: imageId,
      });
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      let screenName = "Dashboard";
      if (userRole === "Laborer" || userRole === "Laboror") {
        screenName = "LabororDashbord";
      } else if (userRole === "Manager") {
        screenName = "ManagerDashbord";
      } else if (userRole === "Supervisor") {
        screenName = "SupervisorDashbord";
      }
      (navigation as any).navigate("Main", { screen: screenName });
    }
  }, [navigation, user, route.params, farmId, farmName, imageId]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleBackPress();
        return true;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [handleBackPress]),
  );

  const loadLanguage = async () => {
    const storedLanguage = await AsyncStorage.getItem("@user_language");
    if (storedLanguage) {
      setLanguage(storedLanguage);
      i18n.changeLanguage(storedLanguage);
    }
  };

  const fetchCrops = async () => {
    setLoading(true);
    setCrops([]);
    setChecked([]);
    setTimestamps([]);

    try {
      setLanguage(t("Main.LNG"));
      const token = await AsyncStorage.getItem("userToken");

      const response = await axios.get(
        `${environment.API_BASE_URL}api/crop/slave-crop-calendar/${cropId}/${farmId}`,
        {
          params: { limit: 10 },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const formattedCrops = response.data.map((crop: CropItem) => ({
        ...crop,
        startingDate: moment(crop.startingDate).format("YYYY-MM-DD"),
        createdAt: moment(crop.createdAt).format("YYYY-MM-DD"),
      }));

      if (formattedCrops[0]?.status === "completed") {
        setShowEditIcon(false);
      } else {
        setShowEditIcon(true);
      }

      setCrops(formattedCrops);
      if (token && formattedCrops.length > 0) {
        checkCertificateStatus(token, formattedCrops[0]?.onCulscropID);
      }
      const newCheckedStates = formattedCrops.map(
        (crop: CropItem) => crop.status === "completed",
      );
      setChecked(newCheckedStates);

      const lastCompletedTaskIn = formattedCrops
        .filter((crop: { status: string }) => crop.status === "completed")
        .sort(
          (
            a: { createdAt: string | number | Date },
            b: { createdAt: string | number | Date },
          ) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0];

      const lastCompletedTaskInd = lastCompletedTaskIn?.taskIndex;

      const lastCompletedTaskIndex = newCheckedStates.lastIndexOf(true);
      setLastCompletedIndex(lastCompletedTaskIndex);

      setTimestamps(new Array(response.data.length).fill(""));

      setTimeout(() => {
        setLoading(false);
      }, 300);
    } catch (error) {
      Alert.alert(
        t("Main.Error"),
        t("Main.SomethingWentWrongPleaseTryAgainlater"),
        [{ text: t("Main.OK") }],
      );
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const handleLocationPermissionGranted = async () => {
    setShowLocationAccess(false);
    if (pendingLocationTask) {
      const { globalIndex, crop } = pendingLocationTask;
      setPendingLocationTask(null);
      await completeTask(globalIndex, crop);
    }
  };

  const handleLocationIconPress = async (
    currentCrop: CropItem,
    globalIndex?: number,
  ): Promise<boolean> => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted") {
        if (globalIndex !== undefined) {
          setPendingLocationTask({ globalIndex, crop: currentCrop });
        }
        setShowLocationAccess(true);
        return false;
      }

      setLoading(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      if (!location) {
        setLoading(false);
        Alert.alert(
          t("Main.Error"),
          t(
            "Farms.UnableToFetchLocationAfterMultipleAttemptsPleaseTryAgainLater",
          ),
          [{ text: t("Main.OK") }],
        );
        return false;
      }

      const token = await AsyncStorage.getItem("userToken");
      await axios.post(
        `${environment.API_BASE_URL}api/crop/geo-location`,
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          taskId: currentCrop.id,
          onCulscropID: currentCrop.onCulscropID,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return true;
    } catch (error) {
      console.error("Error processing location data:", error);
      Alert.alert(
        t("Main.Error"),
        t(
          "Farms.UnableToFetchLocationAfterMultipleAttemptsPleaseTryAgainLater",
        ),
        [{ text: t("Main.OK") }],
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (globalIndex: number, currentCrop: CropItem) => {
    try {
      if (currentCrop.taskIndex === 1) {
        const locationSuccess = await handleLocationIconPress(
          currentCrop,
          globalIndex,
        );
        if (!locationSuccess) {
          return false;
        }
      }

      const token = await AsyncStorage.getItem("userToken");
      await axios.post(
        `${environment.API_BASE_URL}api/crop/update-slave`,
        {
          id: currentCrop.id,
          status: "completed",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const updatedChecked = [...checked];
      updatedChecked[globalIndex] = true;
      setChecked(updatedChecked);

      const now = moment().toISOString();
      const updatedTimestamps = [...timestamps];
      updatedTimestamps[globalIndex] = now;
      setTimestamps(updatedTimestamps);
      await AsyncStorage.setItem(`taskTimestamp_${globalIndex}`, now);

      const newLastCompletedIndex = updatedChecked.lastIndexOf(true);
      setLastCompletedIndex(newLastCompletedIndex);

      if (globalIndex < crops.length - 1) {
        registerForPushNotificationsAsync();
        await scheduleDailyNotification();
      }
      return true;
    } catch (error: any) {
      let msg = t("Main.SomethingWentWrongPleaseTryAgainlater");
      if (error.response?.data?.message?.includes("You need to wait 6 hours")) {
        msg = error.response.data.message;
      }
      Alert.alert(t("Main.Sorry"), msg, [{ text: t("Main.OK") }]);
      return false;
    }
  };

  const handleUploadCalendarTaskImage = async (
    imageUri: string,
    crop: CropItem,
    globalIndex: number,
    isLastImage: boolean,
  ) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");

      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
      );

      const uploadResult = await FileSystem.uploadAsync(
        `${environment.API_BASE_URL}api/auth/calendar-tasks/upload-image`,
        manipResult.uri,
        {
          httpMethod: "POST",
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: "image",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          parameters: {
            slaveId: crop.id ? crop.id.toString() : "",
            farmId: farmId ? farmId.toString() : "",
            onCulscropID: crop.onCulscropID ? crop.onCulscropID.toString() : "",
          },
        },
      );

      if (uploadResult.status < 200 || uploadResult.status >= 300) {
        let errMessage = "Upload failed";
        try {
          const parsed = JSON.parse(uploadResult.body);
          if (parsed.message) errMessage = parsed.message;
        } catch (_) {}
        throw new Error(errMessage);
      }

      setTasksWithImages((prev) => new Set(prev).add(crop.id));

      if (isLastImage) {
        await completeTask(globalIndex, crop);
        Alert.alert(
          t("Main.Success"),
          t("CropCalender.TaskStatusUpdatedSuccessfully"),
          [{ text: t("Main.OK") }],
        );
      }
    } catch (error: any) {
      console.error("Error uploading calendar task image:", error);
      Alert.alert(t("Main.Error"), t("CropCalender.UploadRetryFailed"), [
        { text: t("Main.OK") },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCropswithoutload = async () => {
    try {
      setLanguage(t("Main.LNG"));
      const token = await AsyncStorage.getItem("userToken");

      const response = await axios.get(
        `${environment.API_BASE_URL}api/crop/slave-crop-calendar/${cropId}/${farmId}`,
        {
          params: { limit: 10 },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const formattedCrops = response.data.map((crop: CropItem) => ({
        ...crop,
        startingDate: moment(crop.startingDate).format("YYYY-MM-DD"),
        createdAt: moment(crop.createdAt).format("YYYY-MM-DD"),
      }));

      if (formattedCrops[0]?.status === "completed") {
        setShowEditIcon(false);
      } else {
        setShowEditIcon(true);
      }

      setCrops(formattedCrops);
      if (token && formattedCrops.length > 0) {
        checkCertificateStatus(token, formattedCrops[0]?.onCulscropID);
      }
      const newCheckedStates = formattedCrops.map(
        (crop: CropItem) => crop.status === "completed",
      );
      setChecked(newCheckedStates);

      const lastCompletedTaskIn = formattedCrops
        .filter((crop: { status: string }) => crop.status === "completed")
        .sort(
          (
            a: { createdAt: string | number | Date },
            b: { createdAt: string | number | Date },
          ) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0];

      const lastCompletedTaskInd = lastCompletedTaskIn?.taskIndex;

      const lastCompletedTaskIndex = newCheckedStates.lastIndexOf(true);
      setLastCompletedIndex(lastCompletedTaskIndex);

      setTimestamps(new Array(response.data.length).fill(""));
    } catch (error) {
      Alert.alert(
        t("Main.Error"),
        t("Main.SomethingWentWrongPleaseTryAgainlater"),
        [{ text: t("Main.OK") }],
      );
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const navigateToNextIncompleteTask = () => {
        const firstIncompleteIndex = checked.findIndex((status) => !status);
        if (firstIncompleteIndex !== -1) {
          const newStartIndex =
            Math.floor(firstIncompleteIndex / tasksPerPage) * tasksPerPage;
          setStartIndex(newStartIndex);
        } else {
          setStartIndex(0);
        }
      };

      if (crops.length > 0) {
        return;
      }

      setCrops([]);
      setChecked([]);
      setTimestamps([]);
      setLastCompletedIndex(null);

      setShowEditIcon(false);

      loadLanguage();
      fetchCrops().then(() => navigateToNextIncompleteTask());
    }, [cropId, farmId, crops.length]),
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
    if (isCertificatePending) {
      setShowCertificationModal(true);
      return;
    }
    const globalIndex = startIndex + i;
    const currentCrop = crops[globalIndex];
    const PreviousCrop = crops[globalIndex - 1];
    const NextCrop = crops[globalIndex + 1];
    await AsyncStorage.removeItem(`uploadCompleted-${currentCrop.id}`);
    await AsyncStorage.removeItem("nextCropUpdate");

    if (globalIndex > 0 && !checked[globalIndex - 1]) {
      return;
    }

    const newStatus = checked[globalIndex] ? "pending" : "completed";

    if (newStatus === "pending") {
      try {
        const token = await AsyncStorage.getItem("userToken");
        await axios.post(
          `${environment.API_BASE_URL}api/crop/update-slave`,
          { id: currentCrop.id, status: "pending" },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        const updatedChecked = [...checked];
        updatedChecked[globalIndex] = false;
        setChecked(updatedChecked);

        const updatedTimestamps = [...timestamps];
        updatedTimestamps[globalIndex] = "";
        setTimestamps(updatedTimestamps);
        await AsyncStorage.removeItem(`taskTimestamp_${globalIndex}`);

        setLastCompletedIndex(updatedChecked.lastIndexOf(true));
        await cancelScheduledNotification();
      } catch (error: any) {
        Alert.alert(
          t("Main.Sorry"),
          error.response?.data?.message?.includes(
            "You cannot change the status back to pending after 1 hour",
          )
            ? t(
                "CropCalender.YouCantChangeTheStatusBackToPendingOnce1HourHasPassedAfterMarkingItAsCompleted",
              )
            : t("Main.SomethingWentWrongPleaseTryAgainlater"),
          [{ text: t("Main.OK") }],
        );
      }
      return;
    }

    let updateMessage = "";

    if (PreviousCrop && currentCrop) {
      let PreviousCropDate =
        new Date(PreviousCrop.createdAt) < new Date()
          ? new Date(PreviousCrop.startingDate)
          : new Date(PreviousCrop.createdAt);

      const TaskDays = currentCrop.days;
      const CurrentDate = new Date();
      const nextCropUpdate = new Date(
        PreviousCropDate.getTime() + TaskDays * 24 * 60 * 60 * 1000,
      );
      const nextCropUpdate2 = new Date(
        CurrentDate.getTime() + TaskDays * 24 * 60 * 60 * 1000,
      );

      const data = {
        taskID: globalIndex + 1,
        date: (PreviousCrop ? nextCropUpdate : nextCropUpdate2).toISOString(),
      };
      await AsyncStorage.setItem("nextCropUpdate", JSON.stringify(data));

      const remainingTime = nextCropUpdate.getTime() - CurrentDate.getTime();
      const remainingDays = Math.ceil(remainingTime / (24 * 60 * 60 * 1000));

      if (remainingDays > 0) {
        updateMessage = t("CropCalender.DaysRemainingUntilTheNextUpdate", {
          date: remainingDays,
          count: remainingDays,
        });
        Alert.alert(t("Main.Sorry"), updateMessage, [{ text: t("Main.OK") }]);
        return;
      }
    }

    if (currentCrop.taskIndex === 1) {
      const TaskDays = NextCrop.days;
      const nextCropUpdate2 = new Date(
        Date.now() + TaskDays * 24 * 60 * 60 * 1000,
      );
      await AsyncStorage.setItem(
        "nextCropUpdate",
        JSON.stringify({
          taskID: globalIndex + 1,
          date: nextCropUpdate2.toISOString(),
        }),
      );
    }

    if (currentCrop.reqImages > 0) {
      setPendingImageCrop({ crop: currentCrop, globalIndex });
      setCultivatedLandModalVisible(true);
      return;
    }

    await completeTask(globalIndex, currentCrop);
  };

  const checkTasksWithImages = async () => {
    if (crops.length === 0) return;

    const token = await AsyncStorage.getItem("userToken");
    if (!token) return;

    const tasksWithImagesSet = new Set<string>();

    for (const crop of crops) {
      if (crop.status === "completed") {
        try {
          const response = await axios.get(
            `${environment.API_BASE_URL}api/crop/get-uploaded-images-count/${crop.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          const uploadedImages = response.data[0]?.count || 0;
          if (uploadedImages > 0) {
            tasksWithImagesSet.add(crop.id);
          }
        } catch (error) {
          console.error(`Error checking images for crop ${crop.id}:`, error);
        }
      }
    }

    setTasksWithImages(tasksWithImagesSet);
  };

  useEffect(() => {
    if (crops.length > 0) {
      checkTasksWithImages();
    }
  }, [crops]);

  useEffect(() => {
    const checkImageUploadCount = async () => {
      if (crops.length === 0) {
        return;
      }

      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        console.error("No token found. Cannot proceed.");
        return;
      }

      let lastCompletedCrop = null;
      let lastCompletedCropIndex = -1;

      for (let i = 0; i < crops.length; i++) {
        const currentCrop = crops[i];

        if (currentCrop.status === "completed") {
          lastCompletedCrop = currentCrop;
          lastCompletedCropIndex = i;
        }
      }

      if (lastCompletedCrop) {
        const requiredImages = lastCompletedCrop.reqImages;

        try {
          const response = await axios.get(
            `${environment.API_BASE_URL}api/crop/get-uploaded-images-count/${lastCompletedCrop.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          const uploadedImages = response.data[0]?.count || 0;

          if (
            uploadedImages < requiredImages &&
            lastCompletedCrop.autoCompleted === 0
          ) {
            await cancelScheduledNotification();
            try {
              await axios.post(
                `${environment.API_BASE_URL}api/crop/update-slave`,
                {
                  id: lastCompletedCrop.id,
                  status: "pending",
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                },
              );
              await fetchCropswithoutload();
            } catch (error) {
              console.error("Error setting status to pending", error);
            }
          }
        } catch (error) {
          console.error("Error fetching uploaded image count", error);
        }
      } else {
      }
    };

    checkImageUploadCount();
  }, [crops]);

  async function askForPermissions() {
    if (!Notifications) return false;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  }

  async function cancelScheduledNotification() {
    if (!Notifications) return;
    const storedNotificationId = await AsyncStorage.getItem(
      "currentNotificationId",
    );
    if (storedNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(
        storedNotificationId,
      );

      await AsyncStorage.removeItem("currentNotificationId");
    } else {
    }
  }

  async function scheduleDailyNotification() {
    if (!Notifications) return;
    try {
      const hasPermission = await askForPermissions();
      if (!hasPermission) {
        console.error("Notification permission not granted");
        return;
      }

      const storedNotificationId = await AsyncStorage.getItem(
        "currentNotificationId",
      );

      if (storedNotificationId) {
        await Notifications.cancelScheduledNotificationAsync(
          storedNotificationId,
        );

        await AsyncStorage.removeItem("currentNotificationId");
      }

      const storedData = await AsyncStorage.getItem("nextCropUpdate");
      if (storedData) {
        const asy = JSON.parse(storedData);
        const nextCropDate = new Date(asy.date);
        const trigger = new Date(asy.date);
        const taskId = asy.taskID;

        if (nextCropDate <= new Date()) {
          trigger.setDate(trigger.getDate());
        }

        if (nextCropDate > trigger) {
          trigger.setTime(nextCropDate.getTime());
        }
        if (trigger) {
          trigger.setDate(trigger.getDate() - 1);
        }

        const result = await Notifications.scheduleNotificationAsync({
          content: {
            title: `${t("Notification.CropTaskUpdate")}`,
            body: `${t("Notification.YouAreAbleToCompleteTheTaskTomorrow", {
              task: taskId,
            })}`,
            sound: true,
          },
          trigger: {
            month: trigger.getMonth(),
            day: trigger.getDate(),
            hour: 20,
            minute: 0,
            repeats: true,
          },
        });

        if (result) {
          await AsyncStorage.setItem("currentNotificationId", result);
        } else {
          console.error("Failed to schedule notification.");
        }
      } else {
        console.error("No next crop update found in storage");
      }
    } catch (error) {
      console.error("Error scheduling notification:", error);
    }
  }

  async function registerForPushNotificationsAsync() {
    if (!Notifications) return undefined;
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }

      if (Constants.easConfig?.projectId) {
        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId: Constants.easConfig.projectId,
          })
        ).data;
      }
    } else {
      alert("Must use physical device for Push Notifications");
    }

    return token;
  }

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

  const SkeletonLoader = () => {
    const rectHeight = hp("30%");
    const gap = hp("4%");

    return (
      <View style={{ marginTop: hp("2%"), paddingHorizontal: wp("5%") }}>
        <ContentLoader
          speed={2}
          width={wp("100%")}
          height={hp("150%")}
          viewBox={`0 0 ${wp("100%")} ${hp("150%")}`}
          backgroundColor="#ececec"
          foregroundColor="#fafafa"
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <Rect
              key={`rect-${index}`}
              x="0"
              y={index * (rectHeight + gap)}
              rx="12"
              ry="20"
              width={wp("90%")}
              height={rectHeight}
            />
          ))}
        </ContentLoader>
      </View>
    );
  };

  const openImageModal = async (taskIndex: number): Promise<void> => {
    try {
      const cropIndex = startIndex + taskIndex;
      const crop: CropItem = crops[cropIndex];

      if (!crop) {
        console.warn("Crop data not found for index:", cropIndex);
        Alert.alert(t("Main.Error"), t("Farms.TaskDataNotFound"), [
          { text: t("Main.OK") },
        ]);
        return;
      }

      setLoading(true);

      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert(t("Main.Error"), t("Farms.NoAuthenticationTokenFound"), [
          { text: t("Main.OK") },
        ]);
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${environment.API_BASE_URL}api/crop/get-task-image/${crop.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (
        response.data.success &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        const images: ImageData[] = response.data.data.map(
          (taskImage: any, index: number) => ({
            uri: taskImage.image,
            title: `Task ${crop.taskIndex} - Photo ${index + 1}`,
            description: crop.taskDescriptionEnglish,
            uploadedBy:
              taskImage.uploadedBy ||
              taskImage.userName ||
              taskImage.name ||
              taskImage.uploaderName ||
              taskImage.user_name,
            createdAt: taskImage.createdAt,
            from: "crop",
          }),
        );

        setSelectedTaskImages(images);
        setSelectedImageIndex(0);
        setImageModalVisible(true);
      } else {
        Alert.alert(
          t("CropCalender.No Images Yet"),
          t(
            "CropCalender.YouHaventUploadedAnyImagesForTaskYetCompleteThisTaskByTakingPhotosToTrackYourProgress",
            { taskIndex: crop.taskIndex },
          ),
          [
            {
              text: t("Main.OK"),
              style: "default",
            },
          ],
        );
      }
    } catch (error: any) {
      console.error("Error fetching task images:", error);

      let errorTitle = "Oops! Something went wrong";
      let errorMessage =
        "We couldn't load your images right now. Please try again.";

      if (error.response) {
        console.error("Server Error:", error.response.data);

        if (error.response.status === 404) {
          errorTitle = "📸 No Images Yet";
          errorMessage = `You haven't uploaded any images for this task yet. `;
        } else if (error.response.status === 401) {
          errorTitle = "Session Expired";
          errorMessage =
            "Your session has expired. Please log in again to continue.";
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorTitle = "Connection Issue";
        errorMessage = "Please check your internet connection and try again.";
      }

      Alert.alert(errorTitle, errorMessage, [
        {
          text: t("Main.OK"),
          style: "default",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1">
      {isCultivatedLandModalVisible && pendingImageCrop && (
        <CultivatedLandModal
          visible={isCultivatedLandModalVisible}
          onClose={() => {
            setCultivatedLandModalVisible(false);
            setPendingImageCrop(null);
          }}
          onCaptureImage={async (imageUri, isLastImage) => {
            const { crop, globalIndex } = pendingImageCrop;
            if (isLastImage) {
              setCultivatedLandModalVisible(false);
              setPendingImageCrop(null);
            }
            await handleUploadCalendarTaskImage(
              imageUri,
              crop,
              globalIndex,
              isLastImage,
            );
          }}
          requiredImages={pendingImageCrop.crop.reqImages || 1}
        />
      )}

      <View
        className="flex-row items-center justify-between"
        style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
      >
        <View>
          <TouchableOpacity onPress={handleBackPress}>
            <Ionicons name="chevron-back-outline" size={30} color="gray" />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-black text-xl">{cropName} </Text>
        </View>
        <View>
          {user?.role === "Owner" && showediticon && (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("CropEnrol", {
                  status: "edit",
                  onCulscropID: crops[0]?.onCulscropID,
                  cropId,
                })
              }
            >
              <Ionicons name="pencil" size={20} color="gray" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <SkeletonLoader />
      ) : (
        <ScrollView
          style={{ marginBottom: 60 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                await fetchCrops();
              }}
            />
          }
        >
          {/* Certificate Pending Banner */}
          {isCertificatePending && (
            <TouchableOpacity
              onPress={() => setShowCertificationModal(true)}
              activeOpacity={0.85}
              style={{
                marginHorizontal: 24,
                marginTop: 16,
                marginBottom: 8,
                backgroundColor: "#FFF7ED",
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "#FED7AA",
                paddingHorizontal: 16,
                paddingVertical: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Ionicons name="lock-closed" size={20} color="#9CA3AF" />
              <Text
                style={{
                  marginLeft: 10,
                  flex: 1,
                  fontSize: 13,
                  color: "#6B7280",
                  lineHeight: 18,
                }}
              >
                {t(
                  "CropCalender.PleaseCompleteTheCertificationTasksToUnlockTheCalendarTasks",
                )}
              </Text>
            </TouchableOpacity>
          )}

          {startIndex > 0 && (
            <TouchableOpacity
              onPress={viewPreviousTasks}
              activeOpacity={0.7}
              className="mx-6 mt-2 mb-1 py-3 rounded-xl bg-gray-50 border border-gray-200 flex-row items-center justify-center"
            >
              <Text className="text-black font-bold mr-2">
                {t("CropCalender.ViewPrevious")}
              </Text>
              <Ionicons name="chevron-up-outline" size={18} color="black" />
            </TouchableOpacity>
          )}

          {currentTasks.map((crop, index) => (
            <View
              key={index}
              className={`flex-1 m-6 mb-[-5] shadow border-gray-200 border-[1px] rounded-[15px] ${
                checked[startIndex + index] &&
                (user?.role === "Owner" ||
                  user?.role === "Manager" ||
                  user?.role === "Supervisor" ||
                  user?.role === "Laborer")
                  ? "bg-gray-600/80"
                  : "bg-white"
              }`}
            >
              <View className="flex-row">
                <View>
                  <Text className="ml-6  mt-5">{crop.startingDate}</Text>
                </View>

                <View className="flex-1 items-end justify-center">
                  <TouchableOpacity
                    className="p-2"
                    onPress={() => handleCheck(index)}
                    disabled={
                      isCertificatePending ||
                      (lastCompletedIndex !== null &&
                        startIndex + index > lastCompletedIndex + 1) ||
                      crop.autoCompleted === 1
                    }
                    style={{ zIndex: 200 }}
                  >
                    {isCertificatePending ? (
                      <View
                        style={{
                          borderWidth: 2,
                          borderColor: "#D1D5DB",
                          borderRadius: 15,
                          width: 30,
                          height: 30,
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: "transparent",
                        }}
                      >
                        <Ionicons
                          name="lock-closed"
                          size={14}
                          color="#9CA3AF"
                        />
                      </View>
                    ) : (
                      <View
                        style={{
                          borderWidth:
                            checked[startIndex + index] ||
                            (lastCompletedIndex !== null &&
                              startIndex + index === lastCompletedIndex + 1)
                              ? 0
                              : 2,
                          borderColor: "#00A896",
                          borderRadius: 15,
                          width: 30,
                          height: 30,
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: checked[startIndex + index]
                            ? "#00A896"
                            : lastCompletedIndex !== null &&
                                startIndex + index === lastCompletedIndex + 1
                              ? "black"
                              : "transparent",
                        }}
                      >
                        <AntDesign
                          name="check"
                          size={15}
                          color={
                            checked[startIndex + index]
                              ? "white"
                              : lastCompletedIndex !== null &&
                                  startIndex + index === lastCompletedIndex + 1
                                ? "white"
                                : "black"
                          }
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {checked[startIndex + index] &&
                (user?.role === "Owner" ||
                  user?.role === "Manager" ||
                  user?.role === "Supervisor") &&
                tasksWithImages.has(crop.id) && (
                  <View
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: [{ translateX: -17.5 }, { translateY: -17.5 }],
                      zIndex: 150,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => openImageModal(index)}
                      style={{
                        padding: 5,
                      }}
                      activeOpacity={0.7}
                    >
                      <Image
                        source={require("../../assets/images/crop-cultivation/viewimage.webp")}
                        style={{
                          width: 35,
                          height: 35,
                        }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                )}

              <Text className="ml-6 font-bold mr-6">
                {language === "si"
                  ? crop.taskSinhala
                  : language === "ta"
                    ? crop.taskTamil
                    : crop.taskEnglish}
              </Text>
              <Text className="ml-6 mt-2 mb-6 mr-6">
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
                  <View className="flex rounded-lg items-center m-4  bg-black">
                    <Text className="text-white p-3 text-center">
                      {t("CropCalender.SeePhotos")}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {crop.videoLinkEnglish &&
                crop.videoLinkSinhala &&
                crop.videoLinkTamil && (
                  <TouchableOpacity
                    onPress={() => {
                      if (language === "en" && crop.videoLinkEnglish) {
                        Linking.openURL(crop.videoLinkEnglish);
                      } else if (language === "si" && crop.videoLinkSinhala) {
                        Linking.openURL(crop.videoLinkSinhala);
                      } else if (language === "ta" && crop.videoLinkTamil) {
                        Linking.openURL(crop.videoLinkTamil);
                      }
                    }}
                  >
                    <View className="flex items-center m-4 -mt-2 rounded-xl bg-black">
                      <Text className="text-white p-3 text-center">
                        {t("CropCalender.WatchVideo")}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
            </View>
          ))}

          <ImageViewerModal
            visible={imageModalVisible}
            images={selectedTaskImages}
            initialIndex={selectedImageIndex}
            onClose={() => {
              setImageModalVisible(false);
              setSelectedTaskImages([]);
              setSelectedImageIndex(0);
            }}
          />

          {/* Location Access Modal */}
          <Modal
            visible={showLocationAccess}
            animationType="slide"
            onRequestClose={() => {
              setShowLocationAccess(false);
              setPendingLocationTask(null);
            }}
          >
            <LocationAccess
              navigation={navigation as any}
              onPermissionGranted={handleLocationPermissionGranted}
              onClose={() => {
                setShowLocationAccess(false);
                setPendingLocationTask(null);
              }}
            />
          </Modal>
          {startIndex + tasksPerPage < crops.length && (
            <TouchableOpacity
              onPress={viewNextTasks}
              activeOpacity={0.7}
              className="mx-6 mt-7 mb-8 py-3  rounded-xl bg-gray-50 border border-gray-200 flex-row items-center justify-center"
            >
              <Text className="text-black font-bold mr-2">
                {t("CropCalender.ViewMore")}
              </Text>
              <Ionicons name="chevron-down-outline" size={18} color="black" />
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      <Modal
        visible={showCertificationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCertificationModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl mx-4 p-6 w-11/12 max-w-sm">
            <View className="items-center mb-4">
              <View className="bg-[#F6F7F9] rounded-lg p-3">
                <Ionicons name="warning" size={32} color="#757472ff" />
              </View>
            </View>
            <Text className="text-gray-600 text-center text-sm leading-5 mb-6">
              {t(
                "CropCalender.PleaseCompleteTheCertificationTasksToUnlockTheCalendarTasks",
              )}
            </Text>
            <TouchableOpacity
              onPress={() => setShowCertificationModal(false)}
              className="bg-gray-900 rounded-xl py-3"
            >
              <Text className="text-white text-center font-medium text-base">
                {t("Main.OK")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CropCalander;
