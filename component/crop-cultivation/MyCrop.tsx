import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  BackHandler,
} from "react-native";
import { RootStackParamList } from "../types/types";
import { StackNavigationProp } from "@react-navigation/stack";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import AntDesign from "react-native-vector-icons/AntDesign";
import FontAwesome from "react-native-vector-icons/FontAwesome";
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

interface CropCardProps {
  id: number;
  image: { type: string; data: number[] };
  varietyNameEnglish: string;
  onPress: () => void;
  progress: number;
  isBlock: number;
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
}

const CropCard: React.FC<CropCardProps> = ({
  image,
  varietyNameEnglish,
  onPress,
  progress,
  isBlock,
}) => {
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
      {isBlock === 1 && (
        <FontAwesome
          name="lock"
          size={20}
          color="#000"
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            zIndex: 10,
          }}
        />
      )}
      <TouchableOpacity
        onPress={isBlock === 1 ? undefined : onPress}
        style={{
          width: "100%",
          padding: 16,
          borderRadius: 12,
          marginBottom: 24,
          flexDirection: "row",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          backgroundColor: "white",
          opacity: isBlock === 1 ? 0.6 : 1,
          position: "relative",
          elevation: 4,
        }}
      >
        <Image
          source={
            typeof image === "string"
              ? { uri: image }
              : { uri: formatImage(image) }
          }
          style={{ width: 80, height: 80, borderRadius: 8 }}
          resizeMode="contain"
        />
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            marginLeft: 0,
            flex: 1,
            textAlign: "center",
            color: "#333",
          }}
        >
          {varietyNameEnglish}
        </Text>

        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <Progress.Circle
            size={50}
            progress={progress}
            thickness={4}
            color="#4caf50"
            unfilledColor="#ddd"
            showsText={true}
            formatText={() => `${Math.round(progress * 100)}%`}
            textStyle={{ fontSize: 12 }}
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
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const user = useSelector(
    (state: RootState) => state.user.userData,
  ) as UserData | null;
  const noCropsImage = require("@/assets/images/crop-cultivation/no-enrolled.webp");

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
      setTimeout(() => {
        setLoading(false);
        setRefreshing(false);
      }, 300);

      setCrops(cropsWithProgress);
    } catch (error) {
      console.error("Error fetching cultivations or progress:", error);

      setCrops([]);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setRefreshing(false);
      }, 300);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (crops.length === 0) {
        setLoading(true);
        fetchCultivationsAndProgress();
      }
    }, []),
  );

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        const userRole = user?.role;
        let screenName = "LabororDashbord";

        if (userRole === "Manager") screenName = "ManagerDashbord";
        else if (userRole === "Supervisor") screenName = "SupervisorDashbord";

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
      <StatusBar style="dark" />

      <CustomHeader
        title={t("Farms.Cultivation")}
        navigation={navigation}
        onBackPress={() => {
          const userRole = user?.role;
          let screenName = "LabororDashbord";

          if (userRole === "Manager") screenName = "ManagerDashbord";
          else if (userRole === "Supervisor") screenName = "SupervisorDashbord";

          (navigation as any).navigate("Main", {
            screen: screenName,
          });
        }}
      />
      <View className="border border-[0.5px] border-gray-200" />
      {loading ? (
        <SkeletonLoader />
      ) : crops.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <LottieView
            source={require("@/assets/jsons/common/no-data.json")}
            style={{ width: wp(50), height: hp(25) }}
            autoPlay
            loop
          />
          <Text className="text-center text-gray-600 ">
            --{t("MyCrop.NoAlreasdyEnrolled")}--
          </Text>
        </View>
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
              varietyNameEnglish={
                language === "si"
                  ? crop.varietyNameSinhala
                  : language === "ta"
                    ? crop.varietyNameTamil
                    : crop.varietyNameEnglish
              }
              progress={crop.progress}
              onPress={() =>
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
                  },
                })
              }
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default MyCrop;
