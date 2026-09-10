import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  BackHandler,
  Modal,
} from "react-native";
import { RootStackParamList } from "../types/types";
import { StackNavigationProp } from "@react-navigation/stack";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Progress from "react-native-progress";
import { encode } from "base64-arraybuffer";
import moment from "moment";
import { useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import type { RootState } from "../../services/reducxStore";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import ContentLoader, { Rect } from "react-content-loader/native";
import { StatusBar } from "expo-status-bar";
import LottieView from "lottie-react-native";
import CustomHeader from "../common/CustomHeader";
import NoData from "../common/NoData";

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

interface CropCertificateStatus {
  cropId: number;
  ongoingCropId: number;
  certificateStatus: "pending" | "completed";
  isAllTasksCompleted: boolean;
}

interface CropCardProps {
  id: number;
  image: { type: string; data: number[] };
  varietyNameEnglish: string;
  onPress: () => void;
  progress: number;
  isBlock: number;
  certificateStatus?: string;
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
  farmId: number;
  isBlock: number;
  ongoingCropId?: number;
  certificateStatus?: string;
}

const CropCard: React.FC<CropCardProps> = ({
  image,
  varietyNameEnglish,
  onPress,
  progress,
  isBlock,
  certificateStatus = "completed",
}) => {
  const isBlocked = isBlock === 1 || certificateStatus === "pending";

  const bufferToBase64 = (buffer: number[]): string => {
    const uint8Array = new Uint8Array(buffer);
    return encode(uint8Array.buffer);
  };

  const formatImage = (imageBuffer: {
    type: string;
    data: number[];
  }): string => {
    const base64String = bufferToBase64(imageBuffer.data);
    return `data:image/png;base64,${base64String}`;
  };

  return (
    <View>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 9,
          marginBottom: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderWidth: 1.5,
          borderColor: "#EFEFEF",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          backgroundColor: "white",
          opacity: isBlocked ? 0.6 : 1,
          position: "relative",
          elevation: 4,
        }}
      >
        {isBlocked && (
          <View className="absolute top-1 left-1 z-10 rounded-full w-6 h-6 items-center justify-center">
            <Entypo name="lock" size={18} color="black" />
          </View>
        )}

        <Image
          source={
            typeof image === "string"
              ? { uri: image }
              : { uri: formatImage(image) }
          }
          style={{
            width: 54,
            height: 54,
            borderRadius: 8,
            marginStart: 6,
            opacity: isBlocked ? 0.5 : 1,
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

        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <Progress.Circle
            size={50}
            progress={progress}
            thickness={3}
            color={isBlocked ? "#ccc" : "#4caf50"}
            unfilledColor="#ddd"
            showsText={true}
            formatText={() => {
              const percentage = progress * 100;
              const formatted = percentage.toFixed(2);
              if (percentage >= 100 || progress >= 1) {
                return "100%";
              }
              if (percentage <= 0 || formatted === "0.00") {
                return "0%";
              }
              return `${formatted}%`;
            }}
            textStyle={{
              fontSize: 9,
              color: isBlocked ? "#999" : "#4caf50",
              fontWeight: "bold",
            }}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

type MyCropNavigationProp = StackNavigationProp<RootStackParamList, "MyCrop">;

interface MyCropProps {
  navigation: MyCropNavigationProp;
}
interface UserData {
  farmCount: number;
  membership: string;
  paymentActiveStatus: string | null;
  role: string;
}

const MyCrop: React.FC<MyCropProps> = ({ navigation }) => {
  const [language, setLanguage] = useState("en");
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [crops, setCrops] = useState<CropItem[]>([]);
  const [cropCertificates, setCropCertificates] = useState<
    CropCertificateStatus[]
  >([]);
  const [showCertificationModal, setShowCertificationModal] =
    useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const user = useSelector(
    (state: RootState) => state.user.userData,
  ) as UserData | null;
  const noCropsImage = require("@/assets/images/crop-cultivation/no-enrolled.webp");

  const _fetchCropCertificatesForMyCrops = async (
    token: string,
    cropsWithProgress: CropItem[],
  ): Promise<CropCertificateStatus[]> => {
    const farmStatuses: { [farmId: number]: boolean } = {};
    const uniqueFarmIds = Array.from(
      new Set(cropsWithProgress.map((c) => c.farmId).filter(Boolean)),
    );

    await Promise.all(
      uniqueFarmIds.map(async (fId) => {
        try {
          const farmCertResponse = await axios.get(
            `${environment.API_BASE_URL}api/certificate/get-farmcertificatetask/${fId}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          if (farmCertResponse.data && farmCertResponse.data.length > 0) {
            const allComplete = farmCertResponse.data.every(
              (cert: any) =>
                cert.questionnaireItems?.every((item: QuestionnaireItem) => {
                  if (item.type === "Tick Off") return item.tickResult === 1;
                  if (item.type === "Photo Proof")
                    return item.uploadImage !== null && item.uploadImage !== "";
                  return true;
                }) || false,
            );
            farmStatuses[fId] = allComplete;
          } else {
            farmStatuses[fId] = true;
          }
        } catch {
          farmStatuses[fId] = true;
        }
      }),
    );

    const cropCertificatePromises = cropsWithProgress.map(async (crop) => {
      const cropOngoingId = crop.ongoingCropId || crop.id;
      if (crop.farmId && farmStatuses[crop.farmId] === false) {
        return {
          cropId: crop.id,
          ongoingCropId: cropOngoingId,
          certificateStatus: "pending" as const,
          isAllTasksCompleted: false,
        };
      }

      try {
        const response = await axios.get(
          `${environment.API_BASE_URL}api/certificate/get-crop-certificate-byId/${cropOngoingId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        let isAllCompleted = false;
        const certData = response.data?.[0];
        if (
          certData?.questionnaireItems &&
          Array.isArray(certData.questionnaireItems) &&
          certData.questionnaireItems.length > 0
        ) {
          isAllCompleted = certData.questionnaireItems.every((item: any) => {
            if (item.type === "Tick Off") return item.tickResult === 1;
            if (item.type === "Photo Proof")
              return item.uploadImage !== null && item.uploadImage !== "";
            return true;
          });
        } else {
          isAllCompleted = true;
        }

        return {
          cropId: crop.id,
          ongoingCropId: cropOngoingId,
          certificateStatus: (isAllCompleted ? "completed" : "pending") as
            | "pending"
            | "completed",
          isAllTasksCompleted: isAllCompleted,
        };
      } catch (error: any) {
        const isNotFound =
          error.response?.status === 404 ||
          error.response?.data?.message?.includes("not found");
        return {
          cropId: crop.id,
          ongoingCropId: cropOngoingId,
          certificateStatus: (isNotFound ? "completed" : "pending") as
            | "pending"
            | "completed",
          isAllTasksCompleted: isNotFound,
        };
      }
    });

    return Promise.all(cropCertificatePromises);
  };

  const getCropCertificateStatus = (
    cropId: number,
  ): "pending" | "completed" => {
    const certificate = cropCertificates.find((cert) => cert.cropId === cropId);
    return certificate?.certificateStatus || "pending";
  };

  const fetchCultivationsAndProgress = async () => {
    setLoading(true);
    try {
      setLanguage(t("Main.LNG"));

      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        console.error("User token is missing");
        throw new Error("User is not authenticated");
      }

      const res = await axios.get<CropItem[]>(
        `${environment.API_BASE_URL}api/crop/get-user-ongoing-cul`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.status === 404) {
        console.warn("No cultivations found. Clearing data.");
        setCrops([]);
        setCropCertificates([]);
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
              `${environment.API_BASE_URL}api/crop/slave-crop-calendar-progress/${crop.cropCalendar}/${crop.farmId}`,
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

      setCrops(cropsWithProgress);

      if (cropsWithProgress.length > 0) {
        const cropCerts = await _fetchCropCertificatesForMyCrops(
          token,
          cropsWithProgress,
        );
        setCropCertificates(cropCerts);
      } else {
        setCropCertificates([]);
      }
    } catch (error) {
      console.error("Error fetching cultivations or progress:", error);
      setCrops([]);
      setCropCertificates([]);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setRefreshing(false);
      }, 300);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchCultivationsAndProgress();
    }, []),
  );

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        const userRole = user?.role;
        let screenName = "Dashboard";

        if (userRole === "Laborer" || userRole === "Laboror") {
          screenName = "LabororDashbord";
        } else if (userRole === "Manager") {
          screenName = "ManagerDashbord";
        } else if (userRole === "Supervisor") {
          screenName = "SupervisorDashbord";
        }

        (navigation as any).navigate("Main", {
          screen: screenName,
        });
        return true;
      },
    );

    return () => backHandler.remove();
  }, [navigation, user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCultivationsAndProgress();
  };

  const handleCropPress = (crop: CropItem) => {
    if (crop.isBlock === 1) {
      return;
    }

    const cropCertificateStatus = getCropCertificateStatus(crop.id);
    if (cropCertificateStatus === "pending") {
      setShowCertificationModal(true);
      return;
    }

    navigation.navigate("Main", {
      screen: "CropCalander",
      params: {
        cropId: crop.cropCalendar,
        farmId: crop.farmId,
        startedAt: crop.staredAt,
        cropName:
          language === "si"
            ? crop.varietyNameSinhala
            : language === "ta"
              ? crop.varietyNameTamil
              : crop.varietyNameEnglish,
        ongoingCropId: crop.ongoingCropId || crop.id,
        fromScreen: "MyCrop",
      },
    });
  };

  const SkeletonLoader = () => {
    return (
      <View style={{ marginTop: hp("2%"), paddingHorizontal: wp("5%") }}>
        <ContentLoader
          speed={2}
          width={wp("100%")}
          height={hp("120%")}
          viewBox={`0 0 ${wp("100%")} ${hp("120%")}`}
          backgroundColor="#ececec"
          foregroundColor="#fafafa"
        >
          {Array.from({ length: 10 }).map((_, index) => (
            <Rect
              key={index}
              x="0"
              y={index * hp("12%")}
              rx="12"
              ry="12"
              width={wp("90%")}
              height={hp("10%")}
            />
          ))}
        </ContentLoader>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <CustomHeader
        title={t("Farms.Cultivation")}
        navigation={navigation}
        onBackPress={() => {
          const userRole = user?.role;
          let screenName = "Dashboard";

          if (userRole === "Laborer" || userRole === "Laboror") {
            screenName = "LabororDashbord";
          } else if (userRole === "Manager") {
            screenName = "ManagerDashbord";
          } else if (userRole === "Supervisor") {
            screenName = "SupervisorDashbord";
          }

          (navigation as any).navigate("Main", {
            screen: screenName,
          });
        }}
      />
      <View className=" border-[0.5px] border-gray-200" />
      {loading ? (
        <SkeletonLoader />
      ) : crops.length === 0 ? (
        <NoData
          text={
            t("MyCrop.YouHaveNotEnrolledAnyCropsYet") ||
            "You have not enrolled any crops yet"
          }
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {crops.map((crop) => (
            <CropCard
              key={crop.id}
              id={crop.id}
              image={crop.image}
              isBlock={crop.isBlock}
              certificateStatus={getCropCertificateStatus(crop.id)}
              varietyNameEnglish={
                language === "si"
                  ? crop.varietyNameSinhala
                  : language === "ta"
                    ? crop.varietyNameTamil
                    : crop.varietyNameEnglish
              }
              progress={crop.progress}
              onPress={() => handleCropPress(crop)}
            />
          ))}
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

export default MyCrop;
