import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
  RefreshControl,
  Modal,
} from "react-native";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import {
  selectFarmBasicDetails,
  selectFarmSecondDetails,
  resetFarm,
} from "../../store/farmSlice";
import { Ionicons, Entypo } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import axios from "axios";
import * as Progress from "react-native-progress";
import { useTranslation } from "react-i18next";
import moment from "moment";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import LottieView from "lottie-react-native";
import ImageData from "@/assets/jsons/farmImage.json";

interface CropCardProps {
  id: number;
  image: { type: string; data: number[] };
  varietyNameEnglish: string;
  onPress: () => void;
  progress: number;
  isBlock?: number;
  certificateStatus?: "pending" | "completed";
  farmName?: string;
}

interface CropItem {
  id: number;
  image: { type: string; data: number[] };
  varietyNameEnglish: string;
  varietyNameSinhala: string;
  varietyNameTamil: string;
  startedAt: Date;
  staredAt: string;
  cropCalendar: number;
  progress: number;
  isBlock: number;
  ongoingCropId: number;
  certificateStatus?: string;
}

const CropCard: React.FC<CropCardProps> = ({
  image,
  varietyNameEnglish,
  onPress,
  progress,
  isBlock = 0,
  certificateStatus = "pending",
  farmName = "",
}) => {
  const isBlocked = certificateStatus === "pending";

  const handlePress = () => {
    onPress();
  };

  function formatImage(image: {
    type: string;
    data: number[];
  }): string | undefined {
    throw new Error("Function not implemented.");
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={{
        width: "100%",
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
      }}
    >
      <View
        className={`bg-white rounded-lg p-4 border-2 ${
          isBlocked ? "border-[#EFEFEF]" : "border-[#EFEFEF]"
        } flex-row items-center justify-between relative`}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          opacity: isBlocked ? 0.6 : 1,
        }}
      >
        {isBlocked && (
          <View className="absolute top-1 left-1 z-10 rounded-full w-6 h-6 items-center justify-center ">
            <Entypo name="lock" size={20} color="black" />
          </View>
        )}

        <Image
          source={
            typeof image === "string"
              ? { uri: image }
              : { uri: formatImage(image) }
          }
          style={{
            width: 70,
            height: 70,
            borderRadius: 8,
            opacity: isBlocked ? 0.5 : 1,
            marginStart: 10,
          }}
          resizeMode="contain"
        />

        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            marginLeft: 0,
            flex: 1,
            textAlign: "center",
            color: isBlocked ? "#999" : "#333",
          }}
        >
          {varietyNameEnglish}
        </Text>

        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            marginTop: 5,
          }}
        >
          <Progress.Circle
            size={50}
            progress={progress}
            thickness={4}
            color={isBlocked ? "#ccc" : "#4caf50"}
            unfilledColor="#ddd"
            showsText={true}
            formatText={() => {
              const percentage = progress * 100;
              // If progress > 0 but rounds to 0, show at least 1%
              if (percentage > 0 && percentage < 1) {
                return "1%";
              }
              return `${Math.floor(percentage)}%`;
            }}
            textStyle={{
              fontSize: 12,
              color: isBlocked ? "#999" : "#333",
            }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

type FarmDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface UserData {
  farmCount: number;
  membership: string;
  paymentActiveStatus: string | null;
}

type RouteParams = {
  farmId: number;
  farmName: string;
};

interface FarmItem {
  id: number;
  userId: number;
  farmName: string;
  farmIndex: number;
  extentha: string | number;
  extentac: string | number;
  extentp: string | number;
  district: string;
  plotNo: string;
  street: string;
  city: string;
  staffCount: number;
  appUserCount: number;
  imageId: number;
  isBlock: number;
  regCode: string;
}

interface Staff {
  createdAt: string;
  farmId: number;
  firstName: string;
  id: number;
  image: string | null;
  lastName: string;
  ownerId: number;
  phoneCode: string;
  phoneNumber: string;
  role: string;
}

interface FarmDetailsResponse {
  farm: FarmItem;
  staff: Staff[];
}

interface CropCountResponse {
  cropCount: number;
}

interface RenewalData {
  id: number;
  userId: number;
  expireDate: string;
  needsRenewal: boolean;
  status: "expired" | "active";
  daysRemaining: number;
}

interface RenewalResponse {
  success: boolean;
  data: RenewalData;
}

interface QuestionnaireItem {
  id: number;
  slaveId: number;
  type: string;
  qNo: number;
  qEnglish: string;
  qSinhala: string;
  qTamil: string;
  tickResult: number;
  officerTickResult: string | null;
  uploadImage: string | null;
  officerUploadImage: string | null;
  doneDate: string | null;
}

// Add interface for crop certificate status
interface CropCertificateStatus {
  cropId: number;
  ongoingCropId: number;
  certificateStatus: "pending" | "completed";
  isAllTasksCompleted: boolean;
}

interface MultipleCertificateStatus {
  certificateType: "farm" | "cluster";
  srtName: string;
  srtNameSinhala?: string;
  srtNameTamil?: string;
  clsName?: string;
  expireDate: string;
  isValid: boolean;
  isAllCompleted: boolean;
  slaveQuestionnaireId: number;
  paymentId?: number;
  certificateId: number;
  questionnaireItems: QuestionnaireItem[];
}

const FarmDetailsScreen = () => {
  const navigation = useNavigation<FarmDetailsNavigationProp>();
  const dispatch = useDispatch();
  const farmBasicDetails = useSelector(selectFarmBasicDetails);
  const farmSecondDetails = useSelector(selectFarmSecondDetails);
  const [showMenu, setShowMenu] = useState(false);
  const route = useRoute();
  const { t } = useTranslation();
  const { farmId, farmName } = route.params as RouteParams;
  const [farmData, setFarmData] = useState<FarmItem | null>(null);
  const [staffData, setStaffData] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [cropsLoading, setCropsLoading] = useState(false);
  const [membership, setMembership] = useState("");
  const [renewalData, setRenewalData] = useState<RenewalData | null>(null);
  const [certificateStatus, setCertificateStatus] = useState<{
    srtName: string;
    expireDate: string;
    isAllCompleted: boolean;
    isValid: boolean;
    questionnaireItems?: QuestionnaireItem[];
  } | null>(null);
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState<boolean>(false);
  const [certificateStatuses, setCertificateStatuses] = useState<
    MultipleCertificateStatus[]
  >([]);
  const [selectedTaskImages, setSelectedTaskImages] = useState<any[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [language, setLanguage] = useState("en");
  const [crops, setCrops] = useState<CropItem[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [cropCount, setCropCount] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [membershipExpired, setMembershipExpired] = useState(false);
  const [cropCertificates, setCropCertificates] = useState<
    CropCertificateStatus[]
  >([]);

  const [showCertificationModal, setShowCertificationModal] = useState(false);

  const fetchCertificateStatus = async () => {
    try {
      setCertificateLoading(true);
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        return;
      }

      const response = await axios.get(
        `${environment.API_BASE_URL}api/certificate/get-farmcertificatetask/${farmId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data && response.data.length > 0) {
        const processedCertificates: MultipleCertificateStatus[] =
          response.data.map((certificate: any, index: number) => {
            const isAllCompleted =
              certificate.questionnaireItems?.every(
                (item: QuestionnaireItem) => {
                  if (item.type === "Tick Off") {
                    return item.tickResult === 1;
                  } else if (item.type === "Photo Proof") {
                    return item.uploadImage !== null && item.uploadImage !== "";
                  }
                  return true;
                },
              ) || false;

            return {
              certificateType: certificate.certificateType || "farm",
              srtName: certificate.srtName || "GAP Certification",
              srtNameSinhala: certificate.srtNameSinhala || certificate.srtName,
              srtNameTamil: certificate.srtNameTamil || certificate.srtName,
              clsName: certificate.clsName,
              expireDate: certificate.expireDate,
              isValid: moment(certificate.expireDate).isAfter(),
              isAllCompleted: isAllCompleted,
              slaveQuestionnaireId: certificate.slaveQuestionnaireId,
              paymentId: certificate.paymentId,
              certificateId: certificate.certificateId || index,
              questionnaireItems: certificate.questionnaireItems || [],
            };
          });

        // Sort certificates alphabetically by srtName
        const sortedCertificates = processedCertificates.sort((a, b) => {
          const nameA = a.srtName.toLowerCase();
          const nameB = b.srtName.toLowerCase();
          return nameA.localeCompare(nameB);
        });

        setCertificateStatuses(sortedCertificates);
      } else {
        setCertificateStatuses([]);
      }
    } catch (err) {
      console.error("Error fetching certificate status:", err);
      setCertificateStatuses([]);
    } finally {
      setCertificateLoading(false);
    }
  };

  const fetchCropCertificates = async (crops: CropItem[]) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      let allFarmCertificatesComplete = true;
      let farmHasCertificates = false;

      try {
        const farmCertResponse = await axios.get(
          `${environment.API_BASE_URL}api/certificate/get-farmcertificatetask/${farmId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (farmCertResponse.data && farmCertResponse.data.length > 0) {
          farmHasCertificates = true;

          const allCertificatesComplete = farmCertResponse.data.every(
            (certificate: any) => {
              const isThisCertificateComplete =
                certificate.questionnaireItems?.every(
                  (item: QuestionnaireItem) => {
                    if (item.type === "Tick Off") {
                      return item.tickResult === 1;
                    } else if (item.type === "Photo Proof") {
                      return (
                        item.uploadImage !== null && item.uploadImage !== ""
                      );
                    }
                    return true;
                  },
                ) || false;

              console.log(
                `Certificate ${certificate.srtName} complete: ${isThisCertificateComplete}`,
              );
              return isThisCertificateComplete;
            },
          );

          allFarmCertificatesComplete = allCertificatesComplete;

          console.log(
            `Farm has ${farmCertResponse.data.length} certificates. All complete: ${allFarmCertificatesComplete}`,
          );
        }
      } catch (error: any) {
        if (
          error.response?.status === 404 ||
          error.response?.data?.message?.includes("not found")
        ) {
          console.log("Farm has NO certificates - crops will be unlocked");
          farmHasCertificates = false;
        } else {
          console.error("Error checking farm certificates:", error);
          farmHasCertificates = false;
        }
      }

      if (farmHasCertificates && !allFarmCertificatesComplete) {
        const lockedCertificates = crops.map((crop) => ({
          cropId: crop.id,
          ongoingCropId: crop.ongoingCropId,
          certificateStatus: "pending" as const,
          isAllTasksCompleted: false,
        }));
        setCropCertificates(lockedCertificates);
        return;
      }

      //  console.log(`Farm certificate status - Has certificates: ${farmHasCertificates}, All complete: ${allFarmCertificatesComplete}`);

      const cropCertificatePromises = crops.map(async (crop) => {
        try {
          const response = await axios.get(
            `${environment.API_BASE_URL}api/certificate/get-crop-certificate-status/${crop.ongoingCropId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          console.log(
            `Crop ${crop.id} API response:`,
            JSON.stringify(response.data, null, 2),
          );

          let isAllCompleted = false;

          if (
            response.data.questionnaireItems &&
            Array.isArray(response.data.questionnaireItems)
          ) {
            if (response.data.questionnaireItems.length > 0) {
              isAllCompleted = response.data.questionnaireItems.every(
                (item: any) => {
                  if (item.type === "Tick Off") {
                    return item.tickResult === 1;
                  } else if (item.type === "Photo Proof") {
                    return item.uploadImage !== null && item.uploadImage !== "";
                  }
                  return true;
                },
              );
            } else {
              isAllCompleted = true;
            }
          } else {
            isAllCompleted = true;
          }

          const certificateStatus: "pending" | "completed" = isAllCompleted
            ? "completed"
            : "pending";

          console.log(
            `Crop ${crop.id} - Final Status: ${certificateStatus} (${isAllCompleted ? "UNLOCKED" : "LOCKED"})`,
          );

          return {
            cropId: crop.id,
            ongoingCropId: crop.ongoingCropId,
            certificateStatus: certificateStatus,
            isAllTasksCompleted: isAllCompleted,
          };
        } catch (error: any) {
          console.error(
            `Error fetching certificate for crop ${crop.id}:`,
            error,
          );

          // If 404 or not found = no tasks = unlocked (farm certs already complete/nonexistent)
          if (
            error.response?.status === 404 ||
            error.response?.data?.message?.includes("not found")
          ) {
            return {
              cropId: crop.id,
              ongoingCropId: crop.ongoingCropId,
              certificateStatus: "completed" as const,
              isAllTasksCompleted: true,
            };
          }

          return {
            cropId: crop.id,
            ongoingCropId: crop.ongoingCropId,
            certificateStatus: "pending" as const,
            isAllTasksCompleted: false,
          };
        }
      });

      const certificates = await Promise.all(cropCertificatePromises);
      console.log(
        "Final crop certificates:",
        JSON.stringify(certificates, null, 2),
      );
      setCropCertificates(certificates);
    } catch (error) {
      console.error("Error in fetchCropCertificates:", error);

      const unlockedCertificates = crops.map((crop) => ({
        cropId: crop.id,
        ongoingCropId: crop.ongoingCropId,
        certificateStatus: "completed" as const,
        isAllTasksCompleted: true,
      }));
      setCropCertificates(unlockedCertificates);
    }
  };

  const getCropCertificateStatus = (
    cropId: number,
  ): "pending" | "completed" => {
    const certificate = cropCertificates.find((cert) => cert.cropId === cropId);
    const status = certificate?.certificateStatus || "pending";
    console.log(`Getting status for crop ${cropId}: ${status}`);
    return status;
  };

  const isCropBlocked = (cropId: number): boolean => {
    const status = getCropCertificateStatus(cropId);
    const blocked = status === "pending";
    console.log(`Crop ${cropId} blocked: ${blocked}`);
    return blocked;
  };

  const handleViewCertificateTasks = (
    certificate: MultipleCertificateStatus,
  ) => {
    const params = {
      farmId: farmId,
      farmName: farmData?.farmName || farmName,
      certificateType: certificate.certificateType,
      slaveQuestionnaireId: certificate.slaveQuestionnaireId,
      srtName: certificate.srtName,
      srtNameSinhala: certificate.srtNameSinhala,
      srtNameTamil: certificate.srtNameTamil,
      clsName: certificate.clsName,
    };

    navigation.navigate("FarmCertificateTask" as any, params);
  };

  const fetchCropCount = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert(
          t("Farms.Error"),
          t("Farms.No authentication token found"),
          [{ text: t("PublicForum.OK") }],
        );
        return;
      }

      console.log("Fetching crop count for farmId:", farmId);

      const res = await axios.get<CropCountResponse>(
        `${environment.API_BASE_URL}api/farm/get-cropCount/${farmId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Crop count data:", res.data);
      setCropCount(res.data.cropCount);
    } catch (err) {
      console.error("Error fetching crop count:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCultivationsAndProgress = async () => {
    setCropsLoading(true);

    try {
      setLanguage(t("MyCrop.LNG"));

      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        console.error("User token is missing");
        throw new Error("User is not authenticated");
      }

      const res = await axios.get<CropItem[]>(
        `${environment.API_BASE_URL}api/farm/get-user-ongoing-cul/${farmId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("crop---------------------", res.data);

      if (!res.data || res.data.length === 0 || res.status === 404) {
        console.warn("No cultivations found. Clearing data.");
        setCrops([]);
        setCropsLoading(false);
        setRefreshing(false);
        return;
      }

      const formattedCrops = res.data.map((crop: CropItem) => ({
        ...crop,
        staredAt: moment(crop.startedAt).format("YYYY-MM-DD"),
      }));

      const cropsWithProgress = await Promise.all(
        formattedCrops.map(async (crop) => {
          try {
            if (!crop.cropCalendar) {
              return { ...crop, progress: 0 };
            }

            const response = await axios.get(
              `${environment.API_BASE_URL}api/crop/slave-crop-calendar-progress/${crop.cropCalendar}/${farmId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );

            const completedStages = response.data.filter(
              (stage: { status: string }) => stage.status === "completed",
            ).length;
            const totalStages = response.data.length;

            const progress =
              totalStages > 0 ? Math.min(completedStages / totalStages, 1) : 0;

            return { ...crop, progress };
          } catch (error) {
            console.error(
              `Error fetching progress for cropCalendar ${crop.cropCalendar}:`,
              error,
            );
            return { ...crop, progress: 0 };
          }
        }),
      );

      await fetchCropCertificates(cropsWithProgress);

      setCrops(cropsWithProgress);
    } catch (error) {
      console.error("Error fetching cultivations or progress:", error);
      setCrops([]);
    } finally {
      setCropsLoading(false);
      setRefreshing(false);
    }
  };

  const handleCropPress = async (crop: CropItem) => {
    const cropCertificateStatus = getCropCertificateStatus(crop.id);

    console.log(
      `User clicked crop ${crop.id}, certificate status: ${cropCertificateStatus}`,
    );

    if (cropCertificateStatus === "pending") {
      setShowCertificationModal(true);
      return;
    }

    try {
      const cropCertificateData = await fetchCropCertificate(
        crop.ongoingCropId,
      );
      const hasCertificate =
        cropCertificateData?.status === "haveCropCertificate";

      const baseParams = {
        cropId: crop.cropCalendar.toString(),
        cropName:
          language === "si"
            ? crop.varietyNameSinhala
            : language === "ta"
              ? crop.varietyNameTamil
              : crop.varietyNameEnglish,
        startedAt: new Date(crop.staredAt),
        requiredImages: [],
        farmId: farmId,
        farmName: farmData?.farmName || farmName || "",
        ongoingCropId: crop.ongoingCropId.toString(),
      };

      console.log("Navigating with params:", baseParams);

      if (hasCertificate) {
        navigation.navigate("FramcropCalenderwithcertificate", {
          ...baseParams,
          hasCertificate: true,
        } as any);
      } else {
        navigation.navigate("FarmCropCalander", {
          ...baseParams,
          hasCertificate: false,
        } as any);
      }
    } catch (error) {
      console.error("Error checking certificates:", error);

      navigation.navigate("FarmCropCalander", {
        cropId: crop.cropCalendar.toString(),
        cropName:
          language === "si"
            ? crop.varietyNameSinhala
            : language === "ta"
              ? crop.varietyNameTamil
              : crop.varietyNameEnglish,
        startedAt: new Date(crop.staredAt),
        requiredImages: [],
        farmId: farmId,
        farmName: farmData?.farmName || farmName || "",
        ongoingCropId: crop.ongoingCropId.toString(),
        hasCertificate: false,
      } as any);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCropCount();
      fetchCultivationsAndProgress();
      fetchCertificateStatus();
    }, [farmId]),
  );
  const getImageSource = useCallback((imageId?: number) => {
    console.log("Getting image for imageId:", imageId);

    if (!imageId || !ImageData || !Array.isArray(ImageData)) {
      return require("@/assets/images/Farm/1.webp");
    }

    try {
      const imageItem = ImageData.find((img) => img && img.id === imageId);

      if (!imageItem || !imageItem.source) {
        return require("@/assets/images/Farm/1.webp");
      }

      const imageMap: { [key: string]: any } = {
        "@/assets/images/Farm/1.webp": require("@/assets/images/Farm/1.webp"),
        "@/assets/images/Farm/2.webp": require("@/assets/images/Farm/2.webp"),
        "@/assets/images/Farm/3.webp": require("@/assets/images/Farm/3.webp"),
        "@/assets/images/Farm/4.webp": require("@/assets/images/Farm/4.webp"),
        "@/assets/images/Farm/5.webp": require("@/assets/images/Farm/5.webp"),
        "@/assets/images/Farm/6.webp": require("@/assets/images/Farm/6.webp"),
        "@/assets/images/Farm/7.webp": require("@/assets/images/Farm/7.webp"),
        "@/assets/images/Farm/8.webp": require("@/assets/images/Farm/8.webp"),
        "@/assets/images/Farm/9.webp": require("@/assets/images/Farm/9.webp"),
      };

      console.log("Using image source:", imageItem.source);
      return (
        imageMap[imageItem.source] || require("@/assets/images/Farm/1.webp")
      );
    } catch (err) {
      console.error("Error loading farm image:", err);
      return require("@/assets/images/Farm/1.webp");
    }
  }, []);

  const fetchCropCertificate = async (ongoingCropId: number) => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert(
          t("Farms.Error"),
          t("Farms.No authentication token found"),
          [{ text: t("PublicForum.OK") }],
        );
        return null;
      }

      const response = await axios.get(
        `${environment.API_BASE_URL}api/certificate/get-crophave-certificate/${ongoingCropId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("ongoingCropId:", ongoingCropId);
      console.log("Certificate response:", response.data);

      return response.data;
    } catch (err) {
      console.error("Error fetching crop certificate:", err);
      return null;
    }
  };

  const fetchFarms = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert(
          t("Farms.Error"),
          t("Farms.No authentication token found"),
          [{ text: t("PublicForum.OK") }],
        );
        return;
      }

      const res = await axios.get<FarmDetailsResponse>(
        `${environment.API_BASE_URL}api/farm/get-farms/byFarm-Id/${farmId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
        },
      );

      console.log("Fresh farm data received:", res.data);

      setFarmData(res.data.farm);
      setStaffData(res.data.staff);
    } catch (err) {
      console.error("Error fetching farms:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, [farmId]);

  const fetchMembership = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert(
          t("Farms.Error"),
          t("Farms.No authentication token found"),
          [{ text: t("PublicForum.OK") }],
        );
        return;
      }

      const res = await axios.get(
        `${environment.API_BASE_URL}api/farm/get-membership`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data.success && res.data.data) {
        setMembership(res.data.data.membership);
      } else if (res.data.membership) {
        setMembership(res.data.membership);
      } else {
        console.error("Unexpected response structure:", res.data);
      }
    } catch (err) {
      console.error("Error fetching membership:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditFarm = () => {
    navigation.navigate("EditFarm", { farmId: farmId });
    setShowMenu(false);
  };

  const fetchRenewalStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        return;
      }

      const res = await axios.get<RenewalResponse>(
        `${environment.API_BASE_URL}api/farm/get-renew`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Renewal response:", res.data);

      if (res.data.success && res.data.data) {
        setRenewalData(res.data.data);
        setMembershipExpired(res.data.data.needsRenewal);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setRenewalData(null);
        setMembershipExpired(false);
      }
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCultivationsAndProgress();
    fetchRenewalStatus();
    fetchCertificateStatus();
  };

  useFocusEffect(
    useCallback(() => {
      fetchFarms();
      fetchCropCount();
      fetchCultivationsAndProgress();
      fetchMembership();
      fetchRenewalStatus();
      fetchCertificateStatus();
    }, [farmId]),
  );

  const getMembershipDisplay = () => {
    if (!membership) {
      return {
        text: "BASIC",
        bgColor: "bg-[#CDEEFF]",
        textColor: "text-[#223FFF]",
        showRenew: false,
      };
    }

    const isPro = membership.toLowerCase() === "pro";
    const isExpired = renewalData?.needsRenewal;

    if (isPro && !isExpired) {
      return {
        text: "PRO",
        bgColor: "bg-[#FFF5BD]",
        textColor: "text-[#E2BE00]",
        showRenew: false,
      };
    } else if (isPro && isExpired) {
      return {
        text: "BASIC",
        bgColor: "bg-[#CDEEFF]",
        textColor: "text-[#223FFF]",
        showRenew: true,
      };
    } else {
      return {
        text: "BASIC",
        bgColor: "bg-[#CDEEFF]",
        textColor: "text-[#223FFF]",
        showRenew: false,
      };
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (crops.length === 0) {
        setLoading(true);
        fetchCultivationsAndProgress();
        getMembershipDisplay();
      }
    }, []),
  );

  const handleDeleteFarm = async () => {
    try {
      setShowDeleteModal(false);
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert(
          t("Farms.Error"),
          t("Farms.No authentication token found"),
          [{ text: t("PublicForum.OK") }],
        );
        return;
      }

      await axios.delete(
        `${environment.API_BASE_URL}api/farm/delete-farm/${farmId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      dispatch(resetFarm());
      setLoading(false);
      navigation.navigate("Main", { screen: "Dashboard" });
      Alert.alert(t("Farms.Success"), t("Farms.Farm deleted successfully"), [
        {
          text: t("PublicForum.OK"),
        },
      ]);
    } catch (err) {
      console.error("Error deleting farm:", err);
      Alert.alert(t("Farms.Sorry"), t("Farms.Failed to delete farm"), [
        { text: t("Farms.okButton") },
      ]);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Calculate remaining months and days helper
  const calculateRemainingTime = (
    expireDate: string,
  ): { months: number; days: number } => {
    try {
      const today = moment();
      const expiry = moment(expireDate);

      if (expiry.isBefore(today)) {
        return { months: 0, days: 0 };
      }

      // Calculate full months difference
      const remainingMonths = expiry.diff(today, "months");
      const monthsDate = today.clone().add(remainingMonths, "months");
      const remainingDays = expiry.diff(monthsDate, "days");

      return {
        months: remainingMonths,
        days: remainingDays,
      };
    } catch (error) {
      console.error("Error calculating remaining time:", error);
      return { months: 0, days: 0 };
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <LottieView
          source={require("../../assets/jsons/loader.json")}
          autoPlay
          loop
          style={{ width: 300, height: 300 }}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar
        barStyle={Platform.OS === "ios" ? "dark-content" : "light-content"}
        backgroundColor="#ffffff"
      />

      {/* Fixed Header */}
      <View className="bg-white px-4 py-3 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("Main", { screen: "MyCultivation" })
          }
          className="p-2 mt-[-50]"
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color="#374151"
            style={{
              paddingHorizontal: wp(3),
              paddingVertical: hp(1.5),
              backgroundColor: "#F6F6F680",
              borderRadius: 50,
            }}
          />
        </TouchableOpacity>

        {/* Menu Dropdown */}
        {showMenu && (
          <View
            className="absolute right-0 border border-[#A49B9B] top-full mt-[-45] mr-8 bg-white rounded-lg shadow-lg p-2 z-10"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <TouchableOpacity
              onPress={handleEditFarm}
              className="px-4 items-center justify-center"
              accessibilityLabel="Edit farm"
              accessibilityRole="button"
            >
              <Text className="text-sm text-gray-700 text-center">
                {t("Farms.Edit")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Farm Image */}
        <View className="items-center bg-white">
          <Image
            source={getImageSource(farmData?.imageId)}
            className="w-20 h-20 rounded-full border-2 border-gray-200"
            resizeMode="cover"
            accessible
            accessibilityLabel={
              farmData?.farmName || farmBasicDetails?.farmName
            }
          />
        </View>

        {/* Menu Button */}
        <View className="relative bg-white">
          <TouchableOpacity
            onPress={() => setShowMenu(!showMenu)}
            className="p-2 mt-[-50]"
            accessibilityLabel="Open menu"
            accessibilityRole="button"
          >
            <Ionicons name="ellipsis-vertical" size={24} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={true}
      >
        {/* Farm Info Section */}
        <View className="items-center px-4 py-4">
          <View className="flex-row items-center">
            <Text className="font-bold text-xl text-gray-900 mr-3">
              {farmData?.farmName || farmBasicDetails?.farmName}
            </Text>

            {(() => {
              const membershipDisplay = getMembershipDisplay();
              return (
                <View
                  className={`${membershipDisplay.bgColor} px-3 py-1 rounded-lg`}
                >
                  <Text
                    className={`${membershipDisplay.textColor} text-xs font-medium uppercase`}
                  >
                    {t(`Farms.${membershipDisplay.text}`)}
                  </Text>
                </View>
              );
            })()}
          </View>
          <View className="border border-[#434343] px-3 py-1 rounded-lg mt-2">
            <Text className="text-gray-700 text-xl font-medium">
              ID : {farmData?.regCode}
            </Text>
          </View>
          <Text className="text-[#6B6B6B] font-medium text-[15px] mt-1">
            {t("District." + (farmData?.district ?? ""))}
          </Text>
          <View className="flex-row items-center mt-1 space-x-6">
            <Text className="text-[#6B6B6B] text-sm">
              • {farmData?.appUserCount || 0} {t("Farms.Staff")}
            </Text>
            <Text className="text-[#6B6B6B] text-sm ml-2">
              • {farmData?.staffCount || 0} {t("Farms.Other Staff")}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-center mt-5 space-x-5 px-4">
          <TouchableOpacity
            className="bg-white p-4 rounded-xl justify-center items-center w-36 h-40 border border-[#445F4A33]"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
            accessibilityLabel="View managers"
            accessibilityRole="button"
            onPress={() => {
              if (farmData?.id) {
                navigation.navigate("Main", {
                  screen: "EditManagersScreen",
                  params: {
                    farmId: farmData.id,
                    membership: membership,
                    renew: renewalData?.needsRenewal,
                  },
                });
              } else {
                console.error("Farm ID is undefined");
              }
            }}
          >
            <View className="w-12 h-12 rounded-full items-center justify-center mb-2">
              <Image
                className="w-[75px] h-[75px]"
                source={require("../../assets/images/Farm/Managers.webp")}
              />
            </View>
            <Text className="text-black text-sm font-medium mt-4">
              {t("Farms.Staff")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white p-4 rounded-xl justify-center items-center w-36 h-40 border border-[#445F4A33]"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
            accessibilityLabel="View farm assets"
            accessibilityRole="button"
            onPress={() =>
              navigation.navigate("FarmCurrectAssets", {
                farmId: farmId,
                farmName: farmData?.farmName ?? farmName ?? "",
              })
            }
          >
            <View className="w-12 h-12 bg-purple-600 rounded-full items-center justify-center mb-2">
              <Image
                className="w-[75px] h-[75px]"
                source={require("../../assets/images/Farm/FarmAssets.webp")}
              />
            </View>
            <Text className="text-black text-sm font-medium mt-4">
              {t("Farms.Farm Assets")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Certificate Status Section */}
        {certificateStatuses.length > 0 && (
          <View className="mt-6 px-7">
            {certificateStatuses.map((certificate, index) => {
              // Helper function to get certificate name based on language
              const getCertificateName = () => {
                if (language === "si" && certificate.srtNameSinhala) {
                  return certificate.srtNameSinhala;
                } else if (language === "ta" && certificate.srtNameTamil) {
                  return certificate.srtNameTamil;
                }
                return certificate.srtName;
              };

              return (
                <TouchableOpacity
                  key={`cert-${certificate.certificateId}-${certificate.slaveQuestionnaireId}`}
                  onPress={() => handleViewCertificateTasks(certificate)}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-3"
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-row items-start flex-1">
                      <Image
                        source={require("../../assets/images/starCertificate.png")}
                        className="w-12 h-12 mt-1"
                        resizeMode="contain"
                      />
                      <View className="ml-3 flex-1">
                        {/* Display certificate name based on language */}
                        <Text className="text-gray-900 font-semibold text-base">
                          {getCertificateName()}
                        </Text>

                        {/* Validity Period */}
                        {(() => {
                          const remainingTime = calculateRemainingTime(
                            certificate.expireDate,
                          );

                          if (
                            remainingTime.months === 0 &&
                            remainingTime.days === 0
                          ) {
                            return (
                              <Text className="text-red-600 text-sm mt-1 font-medium">
                                {t("Farms.Certificate has expired")}
                              </Text>
                            );
                          } else {
                            let validityText = t("Farms.Valid for next") + " ";

                            if (remainingTime.months > 0) {
                              validityText += `${remainingTime.months} ${
                                remainingTime.months === 1
                                  ? t("Farms.month")
                                  : t("Farms.months")
                              }`;
                            }

                            if (remainingTime.days > 0) {
                              if (remainingTime.months > 0) {
                                validityText += " ";
                              }
                              validityText += `${remainingTime.days} ${
                                remainingTime.days === 1
                                  ? t("Farms.day")
                                  : t("Farms.days")
                              }`;
                            }

                            return (
                              <Text className="text-gray-600 text-sm mt-1">
                                {validityText}
                              </Text>
                            );
                          }
                        })()}

                        {/* Completion Status */}
                        <Text
                          className={`text-sm font-medium mt-1 ${
                            certificate.isAllCompleted
                              ? "text-[#00A896]"
                              : "text-red-500"
                          }`}
                        >
                          {certificate.isAllCompleted
                            ? t("Farms.All Completed")
                            : t("Farms.Pending")}
                        </Text>
                      </View>
                    </View>

                    <View className="ml-2 mt-1 mt-6">
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#9CA3AF"
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View className="mt-6 px-4">
          {cropsLoading ? (
            // Show loader during crops loading
            <View className="justify-center items-center p-4 min-h-[300px]">
              <LottieView
                source={require("../../assets/jsons/loader.json")}
                autoPlay
                loop
                style={{ width: 200, height: 200 }}
              />
              <Text className="text-center text-gray-600 mt-4">
                {t("RequestInspectionForm.Loading crops")}
              </Text>
            </View>
          ) : crops.length === 0 ? (
            // Show empty state only when NOT loading and no crops
            <View className="justify-center items-center p-4 min-h-[300px] -mt-8">
              <LottieView
                source={require("../../assets/jsons/NoComplaints.json")}
                style={{ width: wp(50), height: hp(30) }}
                autoPlay
                loop
              />
              <Text className="text-center text-gray-600 -mt-8">
                {t("MyCrop.No Ongoing Cultivations yet")}
              </Text>
            </View>
          ) : (
            // Show crops list
            <View>
              {crops.map((crop) => {
                const cropCertificateStatus = getCropCertificateStatus(crop.id);
                const isCropBlockedDueToCertificate = isCropBlocked(crop.id);

                return (
                  <CropCard
                    key={crop.id}
                    id={crop.id}
                    image={crop.image}
                    varietyNameEnglish={
                      language === "si"
                        ? crop.varietyNameSinhala
                        : language === "ta"
                          ? crop.varietyNameTamil
                          : crop.varietyNameEnglish
                    }
                    progress={crop.progress}
                    isBlock={crop.isBlock}
                    certificateStatus={cropCertificateStatus}
                    farmName={farmData?.farmName || farmName}
                    onPress={() => handleCropPress(crop)}
                  />
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Button */}
      <View className="mb-[8%]">
        <TouchableOpacity
          className="absolute bottom-12 right-6 bg-gray-800 w-16 h-16 rounded-full items-center justify-center shadow-lg"
          onPress={() => {
            if (membership.toLowerCase() === "basic" && cropCount >= 3) {
              Alert.alert(
                t("Farms.Sorry"),
                t("Farms.You only have 3 free crop enrollments for now"),
                [{ text: t("Farms.okButton") }],
              );
              return;
            }

            if (
              (membership.toLowerCase() === "pro" &&
                renewalData?.needsRenewal === true &&
                (farmData?.farmIndex ?? 0) > 1) ||
              (farmData?.farmIndex === 1 && cropCount >= 3)
            ) {
              navigation.navigate("AddNewFarmUnloackPro" as any);
            } else {
              navigation.navigate("AddNewCrop", { farmId: farmId });
            }
          }}
          accessibilityLabel="Add new asset"
          accessibilityRole="button"
        >
          <Image
            className="w-[20px] h-[20px]"
            source={require("../../assets/images/Farm/plusfarm.png")}
          />
        </TouchableOpacity>
      </View>

      {/* Certification Required Modal */}
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
                "CropCalender.Please complete the certification tasks to unlock the calendar tasks",
              )}
            </Text>

            <TouchableOpacity
              onPress={() => {
                setShowCertificationModal(false);
              }}
              className="bg-gray-900 rounded-xl py-3"
            >
              <Text className="text-white text-center font-medium text-base">
                {t("CropCalender.OK")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View className="flex-1 bg-black justify-center items-center">
          <TouchableOpacity
            onPress={() => setImageModalVisible(false)}
            className="absolute top-10 right-5 z-10 bg-black/50 rounded-full p-2"
          >
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>

          {selectedTaskImages.length > 0 && (
            <Image
              source={{ uri: selectedTaskImages[selectedImageIndex]?.uri }}
              className="w-full h-2/3"
              resizeMode="contain"
            />
          )}

          <View className="absolute bottom-10 left-0 right-0 flex-row justify-center">
            <Text className="text-white text-center bg-black/50 px-4 py-2 rounded-lg">
              {selectedTaskImages[selectedImageIndex]?.title ||
                "Uploaded Image"}
            </Text>
          </View>
        </View>
      </Modal>

      {/* Delete Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View className="flex-1 bg-[#667BA54D] justify-center items-center p-8">
          <View className="bg-white rounded-lg p-6 w-full max-w-sm">
            <View className="justify-center items-center">
              <Image
                className="w-[150px] h-[200px]"
                source={require("../../assets/images/Farm/deleteImage.png")}
              />
            </View>
            <Text className="text-lg font-bold text-center mb-2">
              {t("Farms.Are you sure you want to delete this farm?")}
            </Text>
            <Text className="text-gray-600 text-center mb-6">
              {t(
                "Farms.Deleting this farm will permanently remove all associated managers, crop calendars, and assets.",
              )}
              {"\n\n"}
              {t("Farms.This action cannot be undone.")}
            </Text>

            <View className="px-4 ">
              <TouchableOpacity
                onPress={handleDeleteFarm}
                className="px-6 py-2 bg-[#000000] rounded-full"
              >
                <View className="justify-center items-center">
                  <Text className="text-white">{t("Farms.Yes, Delete")}</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View className="px-4 mt-4">
              <TouchableOpacity
                onPress={() => setShowDeleteModal(false)}
                className="px-6 py-2 bg-[#D9D9D9] rounded-full"
              >
                <View className="justify-center items-center">
                  <Text className="text-gray-700">
                    {t("Farms.No, Go Back")}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Menu Overlay */}
      {showMenu && (
        <TouchableOpacity
          className="absolute inset-0 bg-black/20"
          onPress={() => setShowMenu(false)}
          activeOpacity={1}
          accessibilityLabel="Close menu"
          accessibilityRole="button"
        />
      )}
    </View>
  );
};

export default FarmDetailsScreen;
