import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  RefreshControl,
  BackHandler,
  Modal,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { RootStackParamList } from "../types/types";
import { StackNavigationProp } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { encode } from "base64-arraybuffer";
import moment from "moment";
import * as Progress from "react-native-progress";
import ContentLoader, { Rect } from "react-content-loader/native";
import { useSelector } from "react-redux";
import { RootState } from "@/services/reducxStore";
import LottieView from "lottie-react-native";
import NoData from "../common/NoData";

type ManagerFarmDetailsNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ManagerFarmDetails"
>;

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
}

interface ManagerFarmDetailsProps {
  navigation: ManagerFarmDetailsNavigationProp;
  route: RouteProp<RootStackParamList, "ManagerFarmDetails">;
}

const ManagerFarmDetails: React.FC<ManagerFarmDetailsProps> = ({
  navigation,
  route,
}) => {
  const { farmId, farmName, imageId } = route.params;

  const [language, setLanguage] = useState("en");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [crops, setCrops] = useState<CropItem[]>([]);
  const [cropCertificates, setCropCertificates] = useState<
    CropCertificateStatus[]
  >([]);
  const [showCertificationModal, setShowCertificationModal] = useState(false);
  const { t } = useTranslation();
  const users = useSelector((state: RootState) => state.user.userData);

  const getImageSource = useCallback((imageId?: number) => {
    if (!imageId) {
      return require("@/assets/images/farms/1.webp");
    }

    try {
      const imageMap: { [key: number]: any } = {
        1: require("@/assets/images/farms/1.webp"),
        2: require("@/assets/images/farms/2.webp"),
        3: require("@/assets/images/farms/3.webp"),
        4: require("@/assets/images/farms/4.webp"),
        5: require("@/assets/images/farms/5.webp"),
        6: require("@/assets/images/farms/6.webp"),
        7: require("@/assets/images/farms/7.webp"),
        8: require("@/assets/images/farms/8.webp"),
        9: require("@/assets/images/farms/9.webp"),
      };

      return imageMap[imageId] || require("@/assets/images/farms/1.webp");
    } catch (err) {
      console.error("Error loading farm image:", err);
      return require("@/assets/images/farms/1.webp");
    }
  }, []);

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

      if (res.status === 404 || !res.data || res.data.length === 0) {
        console.warn("No cultivations found.");
        setCrops([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const farmCrops = res.data.filter(
        (crop: CropItem) => crop.farmId === farmId,
      );

      if (farmCrops.length === 0) {
        console.warn("No cultivations found for this farm.");
        setCrops([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const formattedCrops = farmCrops.map((crop: CropItem) => ({
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
        const cropCerts = await _fetchCropCertificates(
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

  const _fetchCropCertificates = async (
    token: string,
    cropsWithProgress: CropItem[],
  ): Promise<CropCertificateStatus[]> => {
    let allFarmCertificatesComplete = true;
    let farmHasCertificates = false;

    try {
      const farmCertResponse = await axios.get(
        `${environment.API_BASE_URL}api/certificate/get-farmcertificatetask/${farmId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (farmCertResponse.data && farmCertResponse.data.length > 0) {
        farmHasCertificates = true;
        allFarmCertificatesComplete = farmCertResponse.data.every(
          (certificate: any) =>
            certificate.questionnaireItems?.every((item: QuestionnaireItem) => {
              if (item.type === "Tick Off") return item.tickResult === 1;
              if (item.type === "Photo Proof")
                return item.uploadImage !== null && item.uploadImage !== "";
              return true;
            }) || false,
        );
      }
    } catch (error: any) {
      farmHasCertificates = false;
    }

    if (farmHasCertificates && !allFarmCertificatesComplete) {
      return cropsWithProgress.map((crop) => ({
        cropId: crop.id,
        ongoingCropId: crop.ongoingCropId || crop.id,
        certificateStatus: "pending" as const,
        isAllTasksCompleted: false,
      }));
    }

    const cropCertificatePromises = cropsWithProgress.map(async (crop) => {
      const cropOngoingId = crop.ongoingCropId || crop.id;
      try {
        const response = await axios.get(
          `${environment.API_BASE_URL}api/certificate/get-crop-certificate-status/${cropOngoingId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        let isAllCompleted = false;
        if (
          response.data.questionnaireItems &&
          Array.isArray(response.data.questionnaireItems)
        ) {
          isAllCompleted =
            response.data.questionnaireItems.length === 0 ||
            response.data.questionnaireItems.every((item: any) => {
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
    return certificate?.certificateStatus || "completed";
  };

  const handleManageWorkersPress = () => {
    if (!farmId) return;
    if (users?.role === "Manager" || users?.role === "Supervisor") {
      navigation.navigate("EditManagersScreen", {
        farmId: Number(farmId),
        farmName: farmName,
        imageId: imageId ? Number(imageId) : undefined,
        role: users?.role,
      });
    } else {
      Alert.alert(
        "Access Denied",
        "You don't have permission to manage workers",
      );
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchCultivationsAndProgress();
    }, [farmId]),
  );

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("Main", { screen: "ManagerDashbord" });
        return true;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [navigation]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCultivationsAndProgress();
  }, [farmId]);

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
        farmName: farmName,
        imageId: imageId,
        startedAt: crop.staredAt,
        cropName:
          language === "si"
            ? crop.varietyNameSinhala
            : language === "ta"
              ? crop.varietyNameTamil
              : crop.varietyNameEnglish,
        fromScreen: "ManagerFarmDetails",
      },
    } as any);
  };

  const SkeletonLoader = () => {
    return (
      <View style={{ marginTop: hp("2%"), paddingHorizontal: wp("5%") }}>
        <ContentLoader
          speed={2}
          width={wp("90%")}
          height={hp("60%")}
          viewBox={`0 0 ${wp("90%")} ${hp("60%")}`}
          backgroundColor="#ececec"
          foregroundColor="#fafafa"
        >
          {Array.from({ length: 3 }).map((_, index) => (
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
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="bg-white px-5 pt-2 pb-2 rounded-b-3xl shadow-sm">
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Main", { screen: "ManagerDashbord" })
            }
            className="mb-[-5%]"
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={32}
              color="#374151"
            />
          </TouchableOpacity>

          <View className="items-center mb-3">
            <View className="rounded-full w-20 h-20 shadow-md mb-2 overflow-hidden border-2 border-white">
              <Image
                source={getImageSource(imageId ? Number(imageId) : undefined)}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            <Text className="text-lg font-bold text-gray-800">{farmName}</Text>
          </View>

         <TouchableOpacity
  className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex-row items-center justify-between shadow-sm"
  onPress={handleManageWorkersPress}
  style={{
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
  }}
>
  <View
    className="flex-row items-center"
    style={{ flex: 1, marginRight: 8 }}
  >
    <View className="rounded-full w-10 h-10 items-center justify-center mr-3">
      <Image
        className="w-10 h-10"
        source={require("../../assets/images/farms/managers-image.webp")}
        resizeMode="contain"
      />
    </View>
    <Text
      className="text-sm font-semibold text-gray-800"
      style={{ flex: 1, flexShrink: 1 }}
      numberOfLines={2}
    >
      {t("Manager.ManageWorkers")}
    </Text>
  </View>
  <MaterialCommunityIcons
    name="chevron-right"
    size={22}
    color="#9CA3AF"
    style={{ flexShrink: 0 }}
  />
</TouchableOpacity>
        </View>

        <View className="px-5 mt-4">
          <Text className="text-center text-sm text-gray-500 font-medium mb-3">
            {t("Manager.OngoingCultivations")}
          </Text>

          {loading ? (
            <SkeletonLoader />
          ) : crops.length === 0 ? (
            <NoData
              text={
                t("Manager.NoOngoingCultivationsFound") ||
                "No ongoing cultivations found"
              }
            />
          ) : (
            crops.map((crop) => {
              const cropCertificateStatus = getCropCertificateStatus(crop.id);
              const isBlocked =
                crop.isBlock === 1 || cropCertificateStatus === "pending";
              return (
                <TouchableOpacity
                  key={crop.id}
                  onPress={() => handleCropPress(crop)}
                  activeOpacity={0.7}
                  style={{
                    width: "100%",
                    marginVertical: 6,
                    borderRadius: 9,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    opacity: isBlocked ? 0.6 : 1,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#FFFFFF",
                      padding: 12,
                      borderWidth: 1.5,
                      borderColor: "#EFEFEF",
                      borderRadius: 9,
                      overflow: "hidden",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      position: "relative",
                    }}
                  >
                    {isBlocked && (
                      <View className="absolute top-1 left-1 z-10 rounded-full w-6 h-6 items-center justify-center">
                        <Entypo name="lock" size={18} color="black" />
                      </View>
                    )}

                    <Image
                      source={{
                        uri:
                          typeof crop.image === "string"
                            ? crop.image
                            : formatImage(crop.image),
                      }}
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: 8,
                        opacity: isBlocked ? 0.5 : 1,
                        marginStart: 6,
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
                      {language === "si"
                        ? crop.varietyNameSinhala
                        : language === "ta"
                          ? crop.varietyNameTamil
                          : crop.varietyNameEnglish}
                    </Text>

                    <View
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 2,
                      }}
                    >
                      <Progress.Circle
                        size={50}
                        progress={crop.progress}
                        thickness={3}
                        color={isBlocked ? "#ccc" : "#4caf50"}
                        unfilledColor="#ddd"
                        showsText={true}
                        formatText={() => {
                          const percentage = crop.progress * 100;
                          const formatted = percentage.toFixed(2);
                          if (percentage >= 100 || crop.progress >= 1) {
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
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View className="h-6" />
      </ScrollView>

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

export default ManagerFarmDetails;
