import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { setFarmBasicDetails } from "../../../store/farmSlice";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import axios from "axios";
import { Entypo } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTranslation } from "react-i18next";
import LoadingPage from "@/component/common/LoadingPage";
import CustomHeader from "../../common/CustomHeader";
import NoData from "../../common/NoData";

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

type AddFarmListNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AddFarmList = () => {
  const navigation = useNavigation<AddFarmListNavigationProp>();
  const dispatch = useDispatch();

  const [farms, setFarms] = useState<FarmItem[]>([]);
  const [membership, setMembership] = useState("");
  const [loading, setLoading] = useState(true);

  const [renewalData, setRenewalData] = useState<RenewalData | null>(null);

  const [membershipExpired, setMembershipExpired] = useState(false);

  const { t } = useTranslation();

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

  const fetchMembership = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert(
          t("Main.Error"),
          t("Farms.NoAuthenticationTokenFound"),
          [{ text: t("Main.OK") }],
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
        Alert.alert(t("Main.Error"), t("Main.SomethingWentWrongPleaseTryAgainlater"), [
          { text: t("Main.OK") },
        ]);
      }
    } catch (err) {
      console.error("Error fetching membership:", err);
      Alert.alert(t("Main.Error"), t("Main.SomethingWentWrongPleaseTryAgainlater"), [
        { text: t("Main.OK") },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFarms = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert(
          t("Main.Error"),
          t("Farms.NoAuthenticationTokenFound"),
          [{ text: t("Main.OK") }],
        );
        return;
      }

      const res = await axios.get<FarmItem[]>(
        `${environment.API_BASE_URL}api/farm/get-farms`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
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

      Alert.alert(t("Main.Error"), t("Main.SomethingWentWrongPleaseTryAgainlater"), [
        { text: t("Main.OK") },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchMembership();
      setLoading(true);
      await fetchFarms();
    };

    fetchData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchFarms();
      fetchRenewalStatus();
    }, []),
  );

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

  const handleFarmPress = (farm: FarmItem) => {
    if (farm.isBlock === 1 && membership.toLowerCase() === "pro") {
      Alert.alert(
        t("Farms.FarmBlocked"),
        t(
          "Farms.ThisFarmIsBlockedDueToExpiredProMembershipPleaseRenewToAccessFarmDetails",
        ),
        [
          { text: t("Main.Cancel"), style: "cancel" },
          {
            text: t("Farms.RenewNow"),
            onPress: () => {
              navigation.navigate("RenewalScreen" as any);
            },
          },
        ],
      );
      return;
    }

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

    navigation.navigate("EditFarm", { farmId: farm.id, from: "AddFarmList" });
  };

  const renderFarmItem = (farm: FarmItem, index: number) => {
    const membershipDisplay = getMembershipDisplay(farm);

    return (
      <TouchableOpacity
        key={`${farm.farmIndex}-${index}`}
        onPress={() => handleFarmPress(farm)}
        className="bg-white shadow-sm rounded-lg p-4 mb-4 border border-[#F2F2F2]"
      >
        <View className="flex-row items-center">
          <Image
            source={getImageSource(farm.imageId)}
            className="mr-4  rounded-full "
            style={{ width: wp(20), height: wp(20) }}
            resizeMode="cover"
          />

          <View className="flex-1 justify-center">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="font-semibold text-base text-black">
                  {farm.farmName}
                </Text>
                <Text className="text-gray-600 text-sm mt-1">
                  {t(`District.${farm.district}`)}
                </Text>
              </View>
              {membershipDisplay.isBlocked && (
                <View className="ml-2">
                  <Entypo name="lock" size={20} color="black" />
                </View>
              )}
            </View>

            <View className="mt-1 flex-row items-center flex-wrap">
              <View
                className={`${membershipDisplay.bgColor} px-3 py-1 rounded-lg mr-2`}
              >
                <Text
                  className={`${membershipDisplay.textColor} text-xs font-medium`}
                >
                  {t(`Farms.${membershipDisplay.text}`)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <CustomHeader
        title={t("Farms.MyFarms")}
        navigation={navigation as any}
        showBackButton={false}
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        className="px-6"
      >
        <View style={{ paddingVertical: 10 }}>
          <Text className="text-center text-[#5B5B5B] text-sm -mt-4">
            {t("Farms.ClickOnAFarmToEditFarmDetails")}
          </Text>
        </View>

        {loading ? (
          <LoadingPage fullScreen />
        ) : farms.length === 0 ? (
            <NoData text={t("RequestHistory.NoFarmAvailable") } />
        ) : (
          <>
            <View>
              {farms.map((farm, index) => renderFarmItem(farm, index))}
            </View>
          </>
        )}

        {renewalData &&
          !membershipExpired &&
          renewalData.daysRemaining <= 7 &&
          membership.toLowerCase() === "pro" && (
            <View className="">
              <Text className="text-center text-orange-600 text-sm font-medium mb-2">
                {t("Farms.YourProMembershipExpiresInDate", {
                  date: renewalData.daysRemaining,
                })}
              </Text>
            </View>
          )}
      </ScrollView>
    </View>
  );
};

export default AddFarmList;
