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
  ActivityIndicator,
  Modal,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import axios from "axios";
import AntDesign from "@expo/vector-icons/AntDesign";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/types";
import { RouteProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import { environment } from "@/environment/environment";
import i18n from "@/i18n/i18n";
import { useTranslation } from "react-i18next";
import * as ImageManipulator from "expo-image-manipulator";
import CultivatedLandModal from "../../common/CultivatedLandModal";
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
import ImageViewerModal from "../../common/ImageViewerModal";
import CustomHeader from "@/component/common/CustomHeader";
import { Entypo } from "@expo/vector-icons";

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
  createdAt?: string;
  from: string;
}

type FramcropCalenderwithcertificateProp = RouteProp<
  RootStackParamList,
  "FramcropCalenderwithcertificate"
>;

type FramcropCalenderwithcertificateNavigationProp = StackNavigationProp<
  RootStackParamList,
  "FramcropCalenderwithcertificate"
>;

interface FramcropCalenderwithcertificateProps {
  navigation: FramcropCalenderwithcertificateNavigationProp;
  route: FramcropCalenderwithcertificateProp;
}

interface QuestionnaireItem {
  id: number;
  slaveId: number;
  type: string;
  qNo: number;
  qEnglish: string;
  qSinhala: string;
  qTamil: string;
  tickResult: number | null;
  officerTickResult: string | null;
  uploadImage: string | null;
  officerUploadImage: string | null;
  doneDate: string | null;
}

interface CertificateData {
  cropId: string;
  paymentId: string;
  certificateId: string;
  transactionId: string;
  amount: number;
  expireDate: string;
  paymentCreatedAt: string;
  srtName: string;
  srtNumber: string;
  applicable: string;
  accreditation: string;
  serviceAreas: string;
  price: number;
  timeLine: string;
  commission: number;
  tearms: string;
  scope: string;
  logo: string;
  noOfVisit: number;
  certificateCreatedAt: string;
  slaveQuestionnaireId: number;
  clusterFarmId: number | null;
  slaveQuestionnaireCreatedAt: string;
  questionnaireItems: QuestionnaireItem[];
}

const FramcropCalenderwithcertificate: React.FC<
  FramcropCalenderwithcertificateProps
> = ({ navigation, route }) => {
  const [crops, setCrops] = useState<CropItem[]>([]);
  const [checked, setChecked] = useState<boolean[]>([]);
  const [timestamps, setTimestamps] = useState<string[]>([]);
  const [language, setLanguage] = useState("en");
  const { cropId, cropName, farmId, ongoingCropId } = route.params;
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

  const tasksPerPage = 5;

  const [imageModalVisible, setImageModalVisible] = useState<boolean>(false);
  const [selectedTaskImages, setSelectedTaskImages] = useState<ImageData[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [tasksWithImages, setTasksWithImages] = useState<Set<string>>(
    new Set(),
  );
  const [certificateData, setCertificateData] =
    useState<CertificateData | null>(null);
  const [certificateLoading, setCertificateLoading] = useState<boolean>(true);
  const [isGapExpanded, setIsGapExpanded] = useState(false);
  const [questionnaireItems, setQuestionnaireItems] = useState<
    QuestionnaireItem[]
  >([]);
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
  const [uploadingImageForItem, setUploadingImageForItem] = useState<
    number | null
  >(null);
  const [areCertificationTasksComplete, setAreCertificationTasksComplete] =
    useState<boolean>(false);

  const [showCertificationModal, setShowCertificationModal] = useState(false);

  const [showCameraModal, setShowCameraModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] =
    useState<QuestionnaireItem | null>(null);

  const showCertificationLockAlert = () => {
    setShowCertificationModal(true);
  };

  const checkCertificationCompletion = (
    items: QuestionnaireItem[],
  ): boolean => {
    if (!items || items.length === 0) {
      return true;
    }

    return items.every((item) => {
      if (item.type === "Tick Off") {
        return item.tickResult === 1;
      } else if (item.type === "Photo Proof") {
        return item.uploadImage !== null;
      }
      return false;
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      const disableScreenCapture = async () => {
        await ScreenCapture.preventScreenCaptureAsync();
      };

      const enableScreenCapture = async () => {
        await ScreenCapture.allowScreenCaptureAsync();
      };
      const fetchData = async () => {
        await fetchCropswithoutload();
      };
      disableScreenCapture();

      return () => {
        enableScreenCapture();
        fetchData();
      };
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        navigation.navigate("Main", {
          screen: "FarmDetailsScreen",
          params: { farmId: farmId },
        });
        return true;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackPress,
      );
      return () => subscription.remove();
    }, [navigation]),
  );

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setCultivatedLandModalVisible(false);
      };
    }, []),
  );

  const loadLanguage = async () => {
    const storedLanguage = await AsyncStorage.getItem("@user_language");
    if (storedLanguage) {
      setLanguage(storedLanguage);
      i18n.changeLanguage(storedLanguage);
    }
  };

  const fetchCropCertificate = async (ongoingCropId: string | number) => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        return null;
      }

      const response = await axios.get(
        `${environment.API_BASE_URL}api/certificate/get-crop-certificate-byId/${ongoingCropId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data && response.data.length > 0) {
        const certData = response.data[0];

        if (
          certData.questionnaireItems &&
          certData.questionnaireItems.length > 0
        ) {
          setQuestionnaireItems(certData.questionnaireItems);
        }

        return certData;
      }

      return null;
    } catch (err) {
      console.error("Error fetching crop certificate:", err);
      return null;
    }
  };

  const handleQuestionnaireCheck = async (item: QuestionnaireItem) => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert(t("Main.Error"), t("Farms.NoAuthenticationTokenFound"), [
          { text: t("Main.OK") },
        ]);
        return;
      }

      const isCompleted =
        (item.type === "Tick Off" && item.tickResult === 1) ||
        (item.type === "Photo Proof" && item.uploadImage !== null);

      if (isCompleted) {
        if (item.doneDate) {
          const sriLankaOffset = 5.5 * 60 * 60 * 1000;
          const currentTime = Date.now();
          const storedTime = new Date(item.doneDate).getTime();

          let timeDifferenceRaw = currentTime - storedTime;

          let completionTime = storedTime;
          let needsAdjustment = false;

          if (timeDifferenceRaw < 0 || timeDifferenceRaw > 4 * 60 * 60 * 1000) {
            completionTime = storedTime - sriLankaOffset;
            needsAdjustment = true;
          }

          const timeDifference = currentTime - completionTime;
          const oneHourInMs = 60 * 60 * 1000;

          if (timeDifference > oneHourInMs) {
            Alert.alert(
              t("Farms.CannotRemove"),
              t("Farms.CompletionCannotBeRemovedAfter1Hour"),
              [{ text: t("Main.OK") }],
            );
            return;
          }
        }

        Alert.alert(
          t("CropCalender.ConfirmRemove"),
          t("CropCalender.AreYouSureYouWantToRemoveThisTask"),
          [
            { text: t("Main.Cancel"), style: "cancel" },
            {
              text: t("Main.OK"),
              onPress: async () => {
                await handleRemoveCompletion(item);
              },
            },
          ],
        );
        return;
      }

      if (item.type === "Photo Proof") {
        setSelectedQuestion(item);
        setShowCameraModal(true);
        return;
      }

      if (item.type === "Tick Off") {
        let newTickResult: string | null;
        if (item.tickResult === null || item.tickResult === 0) {
          newTickResult = "1";
        } else if (item.tickResult === 1) {
          newTickResult = "0";
        } else {
          newTickResult = null;
        }

        await axios.put(
          `${environment.API_BASE_URL}api/certificate/update-questionnaire-item/${item.id}`,
          {
            tickResult: newTickResult,
            type: "tickOff",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const updatedItems = questionnaireItems.map((prevItem) =>
          prevItem.id === item.id
            ? {
                ...prevItem,
                tickResult: newTickResult === "1" ? 1 : 0,
                doneDate:
                  newTickResult === "1" ? new Date().toISOString() : null,
              }
            : prevItem,
        );

        setQuestionnaireItems(updatedItems);

        const isComplete = checkCertificationCompletion(updatedItems);
        setAreCertificationTasksComplete(isComplete);

        const pending = updatedItems.filter((it) => {
          if (it.type === "Tick Off") return it.tickResult !== 1;
          if (it.type === "Photo Proof") return it.uploadImage === null;
          return false;
        });

        if (newTickResult === "1") {
          Alert.alert(
            t("Main.Success"),
            t("CropCalender.CertificateTaskCompletedSuccessfully"),
            [{ text: t("Main.OK") }],
          );
        }
      }
    } catch (error) {
      console.error("Error updating questionnaire item:", error);
      Alert.alert(
        t("Main.Error"),
        t("Main.SomethingWentWrongPleaseTryAgainlater"),
        [{ text: t("Main.OK") }],
      );
    }
  };

  const handleRemoveCompletion = async (item: QuestionnaireItem) => {
    setUploadingImageForItem(item.id);

    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert(t("Main.Error"), t("Farms.NoAuthenticationTokenFound"));
        setUploadingImageForItem(null);
        return;
      }

      const response = await axios.delete(
        `${environment.API_BASE_URL}api/certificate/questionnaire-item/remove/${item.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data && response.data.success) {
        const updatedItems = questionnaireItems.map((prevItem) =>
          prevItem.id === item.id
            ? {
                ...prevItem,
                uploadImage: null,
                tickResult: null,
                doneDate: null,
              }
            : prevItem,
        );

        setQuestionnaireItems(updatedItems);

        const isComplete = checkCertificationCompletion(updatedItems);
        setAreCertificationTasksComplete(isComplete);

        const pending = updatedItems.filter((checkItem) => {
          if (checkItem.type === "Tick Off") return checkItem.tickResult !== 1;
          if (checkItem.type === "Photo Proof")
            return checkItem.uploadImage === null;
          return false;
        });

        setIsCalendarExpanded(false);

        Alert.alert(
          t("Main.Success"),
          t("Farms.CompletionRemovedSuccessfully"),
        );
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      console.error("Error removing completion:", error);
      console.error("Error response:", error.response?.data);

      let errorMessage = t("Main.SomethingWentWrongPleaseTryAgainlater");
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 403) {
        errorMessage = t("Farms.CompletionCannotBeRemovedAfter1Hour");
      } else if (error.response?.status === 404) {
        errorMessage = t("CropCalender.Item not found");
      }

      Alert.alert(t("Main.Error"), errorMessage);
    } finally {
      setUploadingImageForItem(null);
    }
  };

  const handleUploadQuestionnairePhoto = async (
    imageUri: string,
    question: QuestionnaireItem,
  ) => {
    try {
      setUploadingImageForItem(question.id);
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert(t("Main.Error"), t("Farms.NoAuthenticationTokenFound"));
        setUploadingImageForItem(null);
        return;
      }

      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          {
            resize: {
              width: 1024,
              height: 1024,
            },
          },
        ],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: false,
        },
      );

      const fileName = `questionnaire_${question.id}_${Date.now()}.jpg`;
      const fileType = "image/jpeg";

      const formData = new FormData();
      formData.append("image", {
        uri: manipulatedImage.uri,
        type: fileType,
        name: fileName,
      } as any);
      formData.append("itemId", question.id.toString());
      formData.append("slaveId", question.slaveId.toString());
      formData.append("farmId", farmId.toString());

      const response = await axios.post(
        `${environment.API_BASE_URL}api/certificate/questionnaire-item/upload-image/${question.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000,
        },
      );

      if (response.data.success) {
        const updatedItems = questionnaireItems.map((prevItem) =>
          prevItem.id === question.id
            ? {
                ...prevItem,
                uploadImage: response.data.imageUrl,
                doneDate: new Date().toISOString(),
              }
            : prevItem,
        );

        setQuestionnaireItems(updatedItems);

        const isComplete = checkCertificationCompletion(updatedItems);
        setAreCertificationTasksComplete(isComplete);

        Alert.alert(
          t("Main.Success"),
          t("CropCalender.CertificateTaskCompletedSuccessfully"),
          [{ text: t("Main.OK") }],
        );
      }
    } catch (error: any) {
      console.error("Error uploading questionnaire image:", error);

      let errorMessage = t("Main.SomethingWentWrongPleaseTryAgainlater");
      if (error.response?.status === 413) {
        errorMessage = t("CropCalender.Image file is too large");
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === "ECONNABORTED") {
        errorMessage = t("CropCalender.Upload timeout. Please try again");
      }

      Alert.alert(t("Main.Error"), errorMessage, [{ text: t("Main.OK") }]);
    } finally {
      setUploadingImageForItem(null);
    }
  };

  const handleUploadCalendarTaskImage = async (
    imageUri: string,
    crop: CropItem,
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

      const fileName = manipResult.uri.split("/").pop();
      const fileType = fileName?.split(".").pop()
        ? `image/${fileName.split(".").pop()}`
        : "image/jpeg";

      const formData = new FormData();
      formData.append("image", {
        uri: manipResult.uri,
        name: fileName,
        type: fileType,
      } as any);
      formData.append("slaveId", crop.id);
      formData.append("farmId", farmId.toString());
      formData.append("onCulscropID", crop.onCulscropID.toString());

      await axios.post(
        `${environment.API_BASE_URL}api/auth/calendar-tasks/upload-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          timeout: 60000,
        },
      );

      setTasksWithImages((prev) => new Set(prev).add(crop.id));

      if (isLastImage) {
        await axios.post(
          `${environment.API_BASE_URL}api/crop/update-slave`,
          {
            id: crop.id,
            status: "completed",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const cropIndex = crops.findIndex((c) => c.id === crop.id);
        if (cropIndex !== -1) {
          const updatedChecked = [...checked];
          updatedChecked[cropIndex] = true;
          setChecked(updatedChecked);

          const now = moment().toISOString();
          const updatedTimestamps = [...timestamps];
          updatedTimestamps[cropIndex] = now;
          setTimestamps(updatedTimestamps);
          await AsyncStorage.setItem(`taskTimestamp_${cropIndex}`, now);

          setLastCompletedIndex(cropIndex);
        }

        await fetchCropswithoutload();
        Alert.alert(
          t("Main.Success"),
          t("CropCalender.TaskStatusUpdatedSuccessfully"),
          [{ text: t("Main.OK") }],
        );
      }
    } catch (error: any) {
      console.error("Error uploading calendar task image:", error);
      Alert.alert(
        t("Main.Error"),
        t("CropCalender.UploadRetryFailed"),
        [{ text: t("Main.OK") }],
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateRemainingMonths = (
    expireDate: string,
  ): { months: number; days: number } => {
    try {
      const today = moment();
      const expiry = moment(expireDate);

      if (expiry.isBefore(today)) {
        return { months: 0, days: 0 };
      }

      const remainingDays = expiry.diff(today, "days");

      if (remainingDays >= 30) {
        const remainingMonths = expiry.diff(today, "months");

        const monthsDate = today.clone().add(remainingMonths, "months");
        const daysAfterMonths = expiry.diff(monthsDate, "days");

        if (daysAfterMonths >= 30) {
          return {
            months: remainingMonths + 1,
            days: 0,
          };
        }

        return {
          months: remainingMonths,
          days: daysAfterMonths,
        };
      }

      return {
        months: 0,
        days: remainingDays,
      };
    } catch (error) {
      console.error("Error calculating remaining time:", error);
      return { months: 0, days: 0 };
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const loadCertificateData = async () => {
        if (ongoingCropId) {
          setCertificateLoading(true);
          const certificate = await fetchCropCertificate(ongoingCropId);
          setCertificateData(certificate);

          if (certificate && certificate.questionnaireItems) {
            setQuestionnaireItems(certificate.questionnaireItems);
            const isComplete = checkCertificationCompletion(
              certificate.questionnaireItems,
            );
            setAreCertificationTasksComplete(isComplete);

            const pending = certificate.questionnaireItems.filter(
              (item: {
                type: string;
                tickResult: number;
                uploadImage: null;
              }) => {
                if (item.type === "Tick Off") {
                  return item.tickResult !== 1;
                } else if (item.type === "Photo Proof") {
                  return item.uploadImage === null;
                }
                return false;
              },
            );
          } else {
            setAreCertificationTasksComplete(true);
          }

          setCertificateLoading(false);
        }
      };

      loadCertificateData();
    }, [ongoingCropId]),
  );

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

      setCrops([]);
      setChecked([]);
      setTimestamps([]);
      setLastCompletedIndex(null);

      setShowEditIcon(false);

      loadLanguage();
      fetchCrops().then(() => navigateToNextIncompleteTask());
    }, [cropId, farmId]),
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

  const canRemoveCompletion = (completionTime: string): boolean => {
    try {
      const completionDate = new Date(completionTime);
      const currentTime = new Date();
      const timeDifference = currentTime.getTime() - completionDate.getTime();
      const oneHourInMs = 60 * 60 * 1000;

      const canRemove = timeDifference <= oneHourInMs;

      return canRemove;
    } catch (error) {
      console.error("Error checking completion time:", error);
      return false;
    }
  };

  const handleCheck = async (i: number) => {
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

    if (!checked[globalIndex] && currentCrop.reqImages > 0) {
      setLastCompletedIndex(globalIndex);
      setCultivatedLandModalVisible(true);
      return;
    }

    let updateMessage = "";

    if (newStatus === "pending" && updateMessage) {
      await cancelScheduledNotification();
    }

    if (PreviousCrop && currentCrop) {
      let PreviousCropDate;
      if (new Date(PreviousCrop.createdAt) < new Date()) {
        PreviousCropDate = new Date(PreviousCrop.startingDate);
      } else {
        PreviousCropDate = new Date(PreviousCrop.createdAt);
      }

      const TaskDays = currentCrop.days;
      const CurrentDate = new Date();

      const nextCropUpdate = new Date(
        PreviousCropDate.getTime() + TaskDays * 24 * 60 * 60 * 1000,
      );

      const nextCropUpdate2 = new Date(
        CurrentDate.getTime() + TaskDays * 24 * 60 * 60 * 1000,
      );

      if (PreviousCrop) {
        const data = {
          taskID: globalIndex + 1,
          date: nextCropUpdate.toISOString(),
        };
        await AsyncStorage.setItem("nextCropUpdate", JSON.stringify(data));
      } else {
        const data = {
          taskID: globalIndex + 1,
          date: nextCropUpdate2.toISOString(),
        };
        await AsyncStorage.setItem("nextCropUpdate", JSON.stringify(data));
      }

      const remainingTime = nextCropUpdate.getTime() - CurrentDate.getTime();
      const remainingDays = Math.ceil(remainingTime / (24 * 60 * 60 * 1000));

      if (remainingDays > 0) {
        updateMessage = `${t("CropCalender.YouHave")} ${t(
          "CropCalender.DaysRemainingUntilTheNextUpdate",
          {
            date: remainingDays,
          },
        )}`;

        Alert.alert(t("Main.Sorry"), updateMessage, [{ text: t("Main.OK") }]);
        return;
      }

      if (!updateMessage) {
        updateMessage = `${t("CropCalender.YouHave")} ${t(
          "CropCalender.DaysRemainingUntilTheNextUpdate",
          {
            date: remainingDays,
          },
        )}`;
      }
    } else {
      updateMessage = t("CropCalender.noCropData");
    }
    if (currentCrop.taskIndex === 1 && newStatus === "completed") {
      const TaskDays = NextCrop.days;
      const CurrentDate = new Date();

      const nextCropUpdate2 = new Date(
        CurrentDate.getTime() + TaskDays * 24 * 60 * 60 * 1000,
      );
      const data = {
        taskID: globalIndex + 1,
        date: nextCropUpdate2.toISOString(),
      };
      await AsyncStorage.setItem("nextCropUpdate", JSON.stringify(data));
    }

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
        },
      );

      const updatedChecked = [...checked];
      updatedChecked[globalIndex] = !updatedChecked[globalIndex];
      setChecked(updatedChecked);

      const updatedTimestamps = [...timestamps];
      if (updatedChecked[globalIndex]) {
        const now = moment().toISOString();
        updatedTimestamps[globalIndex] = now;
        setTimestamps(updatedTimestamps);

        await AsyncStorage.setItem(`taskTimestamp_${globalIndex}`, now);
      } else {
        updatedTimestamps[globalIndex] = "";
        setTimestamps(updatedTimestamps);

        await AsyncStorage.removeItem(`taskTimestamp_${globalIndex}`);
      }

      const newLastCompletedIndex = updatedChecked.lastIndexOf(true);
      setLastCompletedIndex(newLastCompletedIndex);

      if (currentCrop.taskIndex === 1 && newStatus === "completed") {
        await handleLocationIconPress(currentCrop);
      }
      if (globalIndex < crops.length - 1) {
        if (newStatus === "completed") {
          registerForPushNotificationsAsync();
          await scheduleDailyNotification();
        }
      }

      if (updatedChecked[globalIndex] && currentCrop.reqImages > 0) {
        setCultivatedLandModalVisible(true);
      }
    } catch (error: any) {
      if (
        error.response &&
        error.response.data.message.includes(
          "You cannot change the status back to pending after 1 hour",
        )
      ) {
        Alert.alert(
          t("Main.Sorry"),
          t(
            "CropCalender.YouCantChangeTheStatusBackToPendingOnce1HourHasPassedAfterMarkingItAsCompleted",
          ),
          [{ text: t("Main.OK") }],
        );
      } else if (
        error.response &&
        error.response.data.message.includes("You need to wait 6 hours")
      ) {
        Alert.alert(t("Main.Sorry"), updateMessage, [{ text: t("Main.OK") }]);
      } else {
        Alert.alert(t("Main.Sorry"), updateMessage, [{ text: t("Main.OK") }]);
      }
    }
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
    const checkImageUploadCount = async () => {
      if (crops.length === 0) {
        return;
      }

      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
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
      }
    };

    checkImageUploadCount();
    checkTasksWithImages();
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
    }
  }

  async function scheduleDailyNotification() {
    if (!Notifications) return;
    try {
      const hasPermission = await askForPermissions();
      if (!hasPermission) {
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
        }
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

  const handleLocationIconPress = async (currentCrop: CropItem) => {
    setLoading(true);

    const maxRetries = 3;
    const delayBetweenRetries = 2000;

    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const getLocationWithRetry = async (
      retries: number,
    ): Promise<Location.LocationObject | null> => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          throw new Error("Location permission denied");
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        return location;
      } catch (error) {
        if (retries > 0) {
          await delay(delayBetweenRetries);
          return getLocationWithRetry(retries - 1);
        } else {
          return null;
        }
      }
    };

    try {
      const location = await getLocationWithRetry(maxRetries);

      if (!location) {
        Alert.alert(
          t("Main.Error"),
          t(
            "Farms.UnableToFetchLocationAfterMultipleAttemptsPleaseTryAgainLater",
          ),
          [{ text: t("Main.OK") }],
        );
        setLoading(false);
        return;
      }

      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.post(
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
    } catch (error) {
      console.error("Error processing location data:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const completedTasksCount = checked.filter(Boolean).length;
  const totalTasksCount = crops.length;
  const certificationProgress =
    totalTasksCount > 0 ? `${completedTasksCount}/${totalTasksCount}` : "0/0";

  return (
    <View className="flex-1 bg-gray-50">
      {isCultivatedLandModalVisible &&
        lastCompletedIndex !== null &&
        crops[lastCompletedIndex] && (
          <CultivatedLandModal
            visible={isCultivatedLandModalVisible}
            onClose={() => setCultivatedLandModalVisible(false)}
            onCaptureImage={async (imageUri, isLastImage) => {
              const currentCrop = crops[lastCompletedIndex];
              if (isLastImage) {
                setCultivatedLandModalVisible(false);
              }
              await handleUploadCalendarTaskImage(
                imageUri,
                currentCrop,
                isLastImage,
              );
            }}
            requiredImages={crops[lastCompletedIndex].reqImages || 1}
          />
        )}

      <View style={{ position: "relative" }}>
        <CustomHeader
          title={cropName}
          navigation={navigation}
          onBackPress={() =>
            navigation.navigate("Main", {
              screen: "FarmDetailsScreen",
              params: { farmId: farmId },
            })
          }
        />

        <View
          style={{
            position: "absolute",
            right: wp(4),
            top: 0,
            bottom: 0,
            justifyContent: "center",
          }}
        >
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("CropEnrol", {
                status: "edit",
                onCulscropID: crops[0]?.onCulscropID,
                cropId,
              })
            }
          >
            {showediticon ? (
              <Ionicons name="pencil" size={22} color="#374151" />
            ) : (
              <View style={{ width: 22 }} />
            )}
          </TouchableOpacity>
        </View>
      </View>

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
              onPress={() => {
                setShowCertificationModal(false);
                setIsGapExpanded(true);
              }}
              className="bg-gray-900 rounded-xl py-3"
            >
              <Text className="text-white text-center font-medium text-base">
                {t("Main.OK")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Certificate Badge */}
      <View className="bg-white rounded-2xl pl-12">
        <View className="flex-row items-center">
          <View>
            <Image
              source={require("../../../assets/images/farms/star-certificate.webp")}
              className="w-14 h-16"
              resizeMode="contain"
            />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-gray-900 font-semibold text-base">
              {certificateLoading
                ? t("CropCalender.LoadingCertificate")
                : certificateData
                  ? certificateData.srtName || "GAP Certification"
                  : t("CropCalender.GAPCertification")}
            </Text>

            <Text className="text-gray-500 text-sm mt-1">
              {certificateLoading
                ? t("CropCalender.CheckingValidity")
                : certificateData
                  ? (() => {
                      const remainingTime = calculateRemainingMonths(
                        certificateData.expireDate,
                      );

                      if (
                        remainingTime.months === 0 &&
                        remainingTime.days === 0
                      ) {
                        return t("CropCalender.CertificateExpired");
                      } else if (remainingTime.months === 0) {
                        return `${t("Farms.ValidityPeriod")} : ${remainingTime.days} ${remainingTime.days === 1 ? t("Farms.Day") : t("Farms.Days")}`;
                      } else if (remainingTime.days === 0) {
                        return `${t("Farms.ValidityPeriod")} : ${remainingTime.months} ${remainingTime.months === 1 ? t("Farms.Month") : t("Farms.Months")}`;
                      } else {
                        const monthText = `${remainingTime.months} ${remainingTime.months === 1 ? t("Farms.Month") : t("Farms.Months")}`;
                        const dayText = `${remainingTime.days} ${remainingTime.days === 1 ? t("Farms.Day") : t("Farms.Days")}`;
                        return `${t("Farms.ValidityPeriod")} : ${monthText} ${dayText}`;
                      }
                    })()
                  : t("CropCalender.NoActiveCertificate")}
            </Text>
          </View>
        </View>
      </View>

      {loading ? (
        <SkeletonLoader />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await fetchCrops();
                setRefreshing(false);
              }}
            />
          }
        >
          {/* GAP Certification Section */}
          <View className="mx-4 mt-4">
            <TouchableOpacity
              onPress={() => setIsGapExpanded(!isGapExpanded)}
              className="bg-white rounded-2xl shadow-sm border border-gray-100"
            >
              <View className="px-4 mt-4 mb-1 flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <Text className="ml-3 text-gray-900 font-medium text-base">
                    {certificateData?.srtName || "GAP Certification"}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons
                    name={isGapExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#9CA3AF"
                  />
                </View>
              </View>
              <View className="ml-5 mb-4">
                <Text
                  className={`ml-2 font-medium text-sm ${
                    areCertificationTasksComplete
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {areCertificationTasksComplete
                    ? t("CropCalender.AllCompleted")
                    : t("CropCalender.Pending")}
                </Text>
              </View>
            </TouchableOpacity>

            {/* GAP Certification Questionnaire Items */}
            {isGapExpanded && (
              <View className="mt-2">
                {questionnaireItems.length > 0 ? (
                  questionnaireItems.map((item, index) => {
                    const isTickOffCompleted =
                      item.type === "Tick Off" && item.tickResult === 1;
                    const isPhotoProofCompleted =
                      item.type === "Photo Proof" && item.uploadImage !== null;
                    const isCompleted =
                      isTickOffCompleted || isPhotoProofCompleted;
                    const isPhotoProof = item.type === "Photo Proof";
                    const isTickOff = item.type === "Tick Off";
                    const hasImage = item.uploadImage !== null;

                    return (
                      <View
                        key={item.id}
                        className={`mb-3 rounded-2xl shadow-sm border ${
                          isPhotoProofCompleted
                            ? "bg-[#4B5563CC] border-gray-200"
                            : "bg-white border-gray-200"
                        }`}
                        style={isCompleted && hasImage ? { opacity: 0.7 } : {}}
                      >
                        {isCompleted && hasImage && (
                          <View
                            style={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: [
                                { translateX: -17.5 },
                                { translateY: -17.5 },
                              ],
                              zIndex: 150,
                            }}
                          >
                            <TouchableOpacity
                              onPress={() => {
                                setSelectedTaskImages([
                                  {
                                    uri: item.uploadImage!,
                                    title: `Q${item.qNo} - Photo Proof`,
                                    description:
                                      language === "si"
                                        ? item.qSinhala
                                        : language === "ta"
                                          ? item.qTamil
                                          : item.qEnglish,
                                    uploadedBy:
                                      (item as any).uploadedBy ||
                                      (item as any).userName ||
                                      "Owner",
                                    from: "certificate",
                                  },
                                ]);
                                setSelectedImageIndex(0);
                                setImageModalVisible(true);
                              }}
                              style={{
                                padding: 5,
                              }}
                              activeOpacity={0.7}
                            >
                              <Image
                                source={require("../../../assets/images/crop-cultivation/viewimage.webp")}
                                style={{
                                  width: 35,
                                  height: 35,
                                }}
                                resizeMode="contain"
                              />
                            </TouchableOpacity>
                          </View>
                        )}

                        <View className="p-4">
                          {/* Question Header */}
                          <View className="flex-row items-start justify-between mb-3">
                            <View className="flex-1">
                              <Text
                                className={`font-semibold text-base ${
                                  isCompleted
                                    ? "text-gray-600"
                                    : "text-gray-900"
                                }`}
                              >
                                {language === "si"
                                  ? item.qSinhala
                                  : language === "ta"
                                    ? item.qTamil
                                    : item.qEnglish}
                              </Text>
                            </View>

                            {/* Check Circle */}
                            <View className="flex-row items-center ml-3">
                              <TouchableOpacity
                                onPress={() => handleQuestionnaireCheck(item)}
                                disabled={uploadingImageForItem === item.id}
                              >
                                <View
                                  style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 14,
                                    borderWidth: 2,
                                    borderColor: isCompleted
                                      ? "#00A896"
                                      : "#00A896",
                                    backgroundColor: isCompleted
                                      ? "#00A896"
                                      : "transparent",
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                >
                                  {uploadingImageForItem === item.id ? (
                                    <ActivityIndicator
                                      size="small"
                                      color={isCompleted ? "white" : "#00A896"}
                                    />
                                  ) : (
                                    <AntDesign
                                      name="check"
                                      size={14}
                                      color={isCompleted ? "white" : "#00A896"}
                                    />
                                  )}
                                </View>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <View className="items-center">
                      <Ionicons
                        name="document-text-outline"
                        size={48}
                        color="#D1D5DB"
                      />
                      <Text className="text-gray-500 text-center mt-3">
                        {t(
                          "CropCalender.NoQuestionnaireItemsAvailableForThisCertificate",
                        )}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Calendar Tasks Section */}
          <View className="mx-4 mt-4 mb-4">
            <TouchableOpacity
              onPress={() => {
                if (!areCertificationTasksComplete) {
                  showCertificationLockAlert();
                } else {
                  setIsCalendarExpanded(!isCalendarExpanded);
                }
              }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100"
            >
              <View className="p-4 flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  {!areCertificationTasksComplete && (
                    <Ionicons name="lock-closed" size={20} color="#9CA3AF" />
                  )}
                  <Text className={`ml-3 font-medium text-base`}>
                    {t("CropCalender.CalendarTasks")}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons
                    name={isCalendarExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={
                      areCertificationTasksComplete ? "#9CA3AF" : "#D1D5DB"
                    }
                  />
                </View>
              </View>
            </TouchableOpacity>

            {isCalendarExpanded && (
              <View className="mt-2">
                {startIndex > 0 && (
                  <TouchableOpacity
                    className="py-3 px-4 flex-row items-center justify-center bg-white rounded-xl mb-2"
                    onPress={viewPreviousTasks}
                  >
                    <Ionicons name="chevron-up" size={16} color="#6B7280" />
                    <Text className="text-gray-600 font-medium ml-2">
                      {t("CropCalender.ViewPrevious")}
                    </Text>
                  </TouchableOpacity>
                )}

                {currentTasks.map((crop, index) => {
                  const globalIndex = startIndex + index;
                  const isCompleted = checked[globalIndex];
                  const isNextTask =
                    lastCompletedIndex !== null &&
                    globalIndex === lastCompletedIndex + 1;
                  const hasImages = tasksWithImages.has(crop.id);
                  const canViewImages = isCompleted && hasImages;

                  const canUncheckCompleted =
                    isCompleted &&
                    timestamps[globalIndex] &&
                    canRemoveCompletion(timestamps[globalIndex]);
                  const canCheckIncomplete =
                    !isCompleted &&
                    (globalIndex === 0 ||
                      (lastCompletedIndex !== null &&
                        globalIndex === lastCompletedIndex + 1));

                  return (
                    <View
                      key={index}
                      className={`mb-3 rounded-2xl shadow-sm border ${
                        isCompleted
                          ? "bg-[#4B5563] border-gray-200"
                          : "bg-white border-gray-100"
                      }`}
                    >
                      {isCompleted && hasImages && (
                        <View
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: [
                              { translateX: -17.5 },
                              { translateY: -17.5 },
                            ],
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
                              source={require("../../../assets/images/crop-cultivation/viewimage.webp")}
                              style={{
                                width: 35,
                                height: 35,
                              }}
                              resizeMode="contain"
                            />
                          </TouchableOpacity>
                        </View>
                      )}

                      <View className="p-4">
                        <View className="flex-row items-start justify-between mb-3">
                          <View className="flex-1">
                            <Text className="text-gray-500 text-xs mb-1">
                              {crop.startingDate}
                            </Text>
                            <Text
                              className={`font-semibold text-base ${
                                isCompleted ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {language === "si"
                                ? crop.taskSinhala
                                : language === "ta"
                                  ? crop.taskTamil
                                  : crop.taskEnglish}
                            </Text>
                          </View>

                          {/* Check Circle */}
                          <View className="flex-row items-center ml-3">
                            {isCompleted ? (
                              <TouchableOpacity
                                onPress={() => handleCheck(index)}
                              >
                                <View
                                  style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 14,
                                    borderWidth: 2,
                                    borderColor: "#00A896",
                                    backgroundColor: "#00A896",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginRight: hasImages ? 8 : 0,
                                  }}
                                >
                                  <AntDesign
                                    name="check"
                                    size={14}
                                    color="white"
                                  />
                                </View>
                              </TouchableOpacity>
                            ) : (
                              <TouchableOpacity
                                onPress={() => handleCheck(index)}
                                disabled={
                                  !canCheckIncomplete ||
                                  crop.autoCompleted === 1
                                }
                              >
                                <View
                                  style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 14,
                                    borderWidth: 2,
                                    borderColor: canCheckIncomplete
                                      ? "#000"
                                      : "#D1D5DB",
                                    backgroundColor: canCheckIncomplete
                                      ? "#000"
                                      : "transparent",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    opacity: canCheckIncomplete ? 1 : 0.5,
                                  }}
                                >
                                  {canCheckIncomplete && (
                                    <AntDesign
                                      name="check"
                                      size={14}
                                      color="white"
                                    />
                                  )}
                                </View>
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>

                        <Text
                          className={`text-sm leading-5 mb-3 ${
                            isCompleted ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {language === "si"
                            ? crop.taskDescriptionSinhala
                            : language === "ta"
                              ? crop.taskDescriptionTamil
                              : crop.taskDescriptionEnglish}
                        </Text>

                        <View className="gap-2">
                          {crop.imageLink && (
                            <TouchableOpacity
                              onPress={() =>
                                crop.imageLink &&
                                Linking.openURL(crop.imageLink)
                              }
                              className={`rounded-xl p-3 ${
                                isCompleted ? "bg-gray-700" : "bg-gray-900"
                              }`}
                            >
                              <Text className="text-white text-center font-medium text-sm">
                                {t("CropCalender.SeePhotos")}
                              </Text>
                            </TouchableOpacity>
                          )}

                          {crop.videoLinkEnglish &&
                            crop.videoLinkSinhala &&
                            crop.videoLinkTamil && (
                              <TouchableOpacity
                                onPress={() => {
                                  if (
                                    language === "en" &&
                                    crop.videoLinkEnglish
                                  ) {
                                    Linking.openURL(crop.videoLinkEnglish);
                                  } else if (
                                    language === "si" &&
                                    crop.videoLinkSinhala
                                  ) {
                                    Linking.openURL(crop.videoLinkSinhala);
                                  } else if (
                                    language === "ta" &&
                                    crop.videoLinkTamil
                                  ) {
                                    Linking.openURL(crop.videoLinkTamil);
                                  }
                                }}
                                className={`rounded-xl p-3 ${
                                  isCompleted ? "bg-gray-700" : "bg-gray-900"
                                }`}
                                style={{ marginTop: crop.imageLink ? 8 : 0 }}
                              >
                                <Text className="text-white text-center font-medium text-sm">
                                  {t("CropCalender.WatchVideo")}
                                </Text>
                              </TouchableOpacity>
                            )}
                        </View>
                      </View>
                    </View>
                  );
                })}

                {startIndex + tasksPerPage < crops.length && (
                  <TouchableOpacity
                    className="py-3 px-4 flex-row items-center justify-center bg-white rounded-xl mt-2"
                    onPress={viewNextTasks}
                  >
                    <Text className="text-gray-600 font-medium mr-2">
                      {t("CropCalender.ViewMore")}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#6B7280" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      )}

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

      {/* Questionnaire Item Camera Modal */}
      {showCameraModal && selectedQuestion && (
        <CultivatedLandModal
          visible={showCameraModal}
          onClose={() => {
            setShowCameraModal(false);
            setSelectedQuestion(null);
          }}
          onCaptureImage={(imageUri) => {
            const currentQ = selectedQuestion;
            setShowCameraModal(false);
            setSelectedQuestion(null);
            handleUploadQuestionnairePhoto(imageUri, currentQ);
          }}
          title={t("Farms.ClickAPhoto")}
          subtitle={t("Farms.PleaseTakeAPhotoOfTheCompletedWorkInTheField.")}
        />
      )}
    </View>
  );
};

export default FramcropCalenderwithcertificate;
