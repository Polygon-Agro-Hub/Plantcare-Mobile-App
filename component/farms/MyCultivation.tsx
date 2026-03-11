import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  RefreshControl,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { setFarmBasicDetails } from "../../store/farmSlice";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import axios from "axios";
import { useTranslation } from "react-i18next";
import LottieView from "lottie-react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Entypo } from "@expo/vector-icons";

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
  farmCropCount: number;
  isBlock: number;
  certificationStatus?: string;
}

interface RenewalData {
  id: number;
  userId: number;
  expireDate: string;
  needsRenewal: boolean;
  status: "expired" | "active";
  daysRemaining: number;
  activeStatus: number;
}

interface RenewalResponse {
  success: boolean;
  data: RenewalData;
}

type MyCultivationNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

const MyCultivation = () => {
  const navigation = useNavigation<MyCultivationNavigationProp>();
  const dispatch = useDispatch();

  const [farms, setFarms] = useState<FarmItem[]>([]);
  const [membership, setMembership] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useTranslation();
  const [renewalData, setRenewalData] = useState<RenewalData | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

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

  const getImageSource = (imageId: number) => {
    return imageMap[imageId] || imageMap[1];
  };

  const fetchMembership = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert(
          t("Farms.Error"),
          t("Farms.No authentication token found"),
          [{ text: t("PublicForum.OK") }],
        );
        return;
      }

      const timestamp = new Date().getTime();
      const res = await axios.get(
        `${environment.API_BASE_URL}api/farm/get-membership?t=${timestamp}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        },
      );

      if (res.data.success && res.data.data) {
        setMembership(res.data.data.membership);
      } else if (res.data.membership) {
        setMembership(res.data.membership);
      } else {
        console.error("Unexpected response structure:", res.data);
        Alert.alert(t("Farms.Error"), t("Main.somethingWentWrong"), [
          { text: t("PublicForum.OK") },
        ]);
      }
    } catch (err) {
      console.error("Error fetching membership:", err);
    }
  };

  const fetchFarms = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert(
          t("Farms.Error"),
          t("Farms.No authentication token found"),
          [{ text: t("PublicForum.OK") }],
        );
        return;
      }

      const timestamp = new Date().getTime();

      const res = await axios.get<FarmItem[]>(
        `${environment.API_BASE_URL}api/farm/get-farms?t=${timestamp}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        },
      );

      const formattedFarms = res.data.map((farm) => ({
        ...farm,
        extentha: farm.extentha.toString(),
        extentac: farm.extentac.toString(),
        extentp: farm.extentp.toString(),
      }));

      const sortedFarms = formattedFarms.sort((a, b) => a.id - b.id);

      setFarms(sortedFarms);
    } catch (err) {
      console.error("Error fetching farms:", err);

      setFarms([]);
    }
  };

  const fetchRenewalStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        return;
      }

      const timestamp = new Date().getTime();
      const res = await axios.get<RenewalResponse>(
        `${environment.API_BASE_URL}api/farm/get-renew?t=${timestamp}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        },
      );

      if (res.data.success && res.data.data) {
        setRenewalData(res.data.data);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setRenewalData(null);
      }
    }
  };

  const fetchAllData = async () => {
    setLoading(true);

    setFarms([]);

    try {
      await Promise.all([
        fetchMembership(),
        fetchFarms(),
        fetchRenewalStatus(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setFarms([]);
    try {
      await fetchAllData();
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((prev) => prev + 1);
      fetchAllData();
    }, []),
  );

  const handleFarmPress = (farm: FarmItem) => {
    const farmDetailsForRedux = {
      farmName: farm.farmName,
      extent: {
        ha: farm.extentha.toString(),
        ac: farm.extentac.toString(),
        p: farm.extentp.toString(),
      },
      district: farm.district,
      plotNo: farm.plotNo,
      streetName: farm.street,
      city: farm.city,
      selectedImage: farm.imageId || 0,
    };

    dispatch(setFarmBasicDetails(farmDetailsForRedux));

    if (
      farm.farmCropCount === 0 &&
      farm.certificationStatus === "NoCertificate"
    ) {
      navigation.navigate("CultivationEarnCertificate" as any, {
        farmId: farm.id,
        farmName: farm.farmName,
      });
    } else {
      navigation.navigate("FarmDetailsScreen", {
        farmId: farm.id,
        farmName: farm.farmName,
      });
    }
  };

  const getMembershipDisplay = (farm: FarmItem) => {
    if (membership.toLowerCase() === "pro") {
      if (renewalData && renewalData.needsRenewal) {
        if (farm.isBlock === 0) {
          return {
            text: "BASIC",
            bgColor: "bg-[#CDEEFF]",
            textColor: "text-[#223FFF]",
            showRenew: false,
            isBlocked: false,
          };
        } else {
          return {
            text: "RENEW",
            bgColor: "bg-[#FFDEDE]",
            textColor: "text-[#BE0003]",
            showRenew: true,
            isBlocked: true,
          };
        }
      } else {
        if (farm.isBlock === 1) {
          return {
            text: "RENEW",
            bgColor: "bg-[#FFDEDE]",
            textColor: "text-[#BE0003]",
            showRenew: true,
            isBlocked: true,
          };
        } else {
          return {
            text: "PRO",
            bgColor: "bg-[#FFF5BD]",
            textColor: "text-[#E2BE00]",
            showRenew: false,
            isBlocked: false,
          };
        }
      }
    } else {
      return {
        text: "BASIC",
        bgColor: "bg-[#CDEEFF]",
        textColor: "text-[#223FFF]",
        showRenew: false,
        isBlocked: false,
      };
    }
  };

  const renderFarmItem = (farm: FarmItem, index: number) => {
    const membershipDisplay = getMembershipDisplay(farm);

    return (
      <TouchableOpacity
        key={`farm-${farm.id}-${refreshKey}`}
        className="bg-white shadow-sm rounded-lg p-4 mb-4 border border-[#F2F2F2]"
        onPress={() => handleFarmPress(farm)}
        disabled={membershipDisplay.isBlocked}
      >
        <View className="flex-row items-start">
          <Image
            source={getImageSource(farm.imageId)}
            className="w-14 h-14 mr-4 mt-4 rounded-full"
            resizeMode="cover"
          />
          <View className="flex-1">
            <View className="flex-row justify-between items-start mt-2">
              <View>
                <Text className="font-semibold text-base">{farm.farmName}</Text>
                <Text className="text-gray-600 text-sm">
                  {t(`District.${farm.district}`)}
                </Text>
                <Text className="text-gray-600 text-sm">
                  {farm.farmCropCount} {t("Farms.crops")}
                </Text>
              </View>
              {membershipDisplay.isBlocked && (
                <View className="ml-2">
                  <Entypo name="lock" size={20} color="black" />
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        key={refreshKey}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        className="px-6"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FDCF3F"]}
            tintColor="#FDCF3F"
          />
        }
      >
        <View style={{ paddingVertical: 20 }}>
          <Text className="text-center font-semibold text-lg">
            {t("Farms.My Cultivation")}
          </Text>
          <Text className="text-center text-[#5B5B5B] text-sm mt-2">
            {t("Farms.Select a farm to manage your cultivation and assets")}
          </Text>
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <LottieView
              source={require("../../assets/jsons/loader.json")}
              autoPlay
              loop
              style={{ width: 300, height: 300 }}
            />
          </View>
        ) : farms.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <View className="-mt-[30%]">
              <LottieView
                source={require("../../assets/jsons/NoComplaints.json")}
                style={{ width: wp(50), height: hp(50) }}
                autoPlay
                loop
              />
            </View>
            <Text className="text-center text-gray-600 -mt-[30%]">
              {t("MyCrop.NoDataFound")}
            </Text>
          </View>
        ) : (
          <View>{farms.map((farm, index) => renderFarmItem(farm, index))}</View>
        )}
      </ScrollView>
    </View>
  );
};

export default MyCultivation;
