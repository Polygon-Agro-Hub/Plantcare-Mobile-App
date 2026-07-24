import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
  BackHandler,
} from "react-native";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { useSelector } from "react-redux";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/types";
import { selectFarmBasicDetails } from "../../../store/farmSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import axios from "axios";
import { useTranslation } from "react-i18next";
import ImageData from "@/assets/jsons/farm/farm-image.json";
import CustomHeader from "@/component/common/CustomHeader";
import { MaterialIcons } from "@expo/vector-icons";
import LoadingPage from "@/component/common/LoadingPage";

type EditManagersScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "EditManagersScreen"
>;

interface EditManagersScreenProps {
  navigation: EditManagersScreenNavigationProp;
}

type RouteParams = {
  farmId: number;
  staffMemberId?: number;
  membership: string;
  renew: string;
  regCode: string;
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

const EditManagersScreen = () => {
  const navigation = useNavigation<EditManagersScreenNavigationProp>();
  const farmBasicDetails = useSelector(selectFarmBasicDetails);

  const route = useRoute();
  const { farmId, membership, renew, regCode } = route.params as RouteParams;
  const [farmData, setFarmData] = useState<FarmItem | null>(null);
  const [staffData, setStaffData] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  const getImageSource = useCallback((imageId?: number) => {
    if (!imageId || !ImageData || !Array.isArray(ImageData)) {
      return require("@/assets/images/farms/1.webp");
    }

    try {
      const imageItem = ImageData.find((img) => img && img.id === imageId);

      if (!imageItem || !imageItem.source) {
        return require("@/assets/images/farms/1.webp");
      }

      const imageMap: { [key: string]: any } = {
        "@/assets/images/farms/1.webp": require("@/assets/images/farms/1.webp"),
        "@/assets/images/farms/2.webp": require("@/assets/images/farms/2.webp"),
        "@/assets/images/farms/3.webp": require("@/assets/images/farms/3.webp"),
        "@/assets/images/farms/4.webp": require("@/assets/images/farms/4.webp"),
        "@/assets/images/farms/5.webp": require("@/assets/images/farms/5.webp"),
        "@/assets/images/farms/6.webp": require("@/assets/images/farms/6.webp"),
        "@/assets/images/farms/7.webp": require("@/assets/images/farms/7.webp"),
        "@/assets/images/farms/8.webp": require("@/assets/images/farms/8.webp"),
        "@/assets/images/farms/9.webp": require("@/assets/images/farms/9.webp"),
      };

      return (
        imageMap[imageItem.source] || require("@/assets/images/farms/1.webp")
      );
    } catch (err) {
      return require("@/assets/images/farms/1.webp");
    }
  }, []);

  const { t } = useTranslation();

  const fetchFarms = async () => {
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

      const res = await axios.get<FarmDetailsResponse>(
        `${environment.API_BASE_URL}api/farm/get-farms/byFarm-Id/${farmId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
        },
      );

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

  useFocusEffect(
    useCallback(() => {
      fetchFarms();
    }, [farmId]),
  );

  const handleAddStaff = () => {
    navigation.navigate("Main", {
      screen: "AddnewStaff",
      params: {
        farmId: farmId,
        regCode: regCode,
      },
    });
  };

  const handleEditStaffMember = (staffId: number) => {
    navigation.navigate("EditStaffMember", {
      staffMemberId: staffId,
      farmId: farmId,
      membership: membership,
      renew: renew,
      regCode: regCode,
    });
  };

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
    const isExpired = renew;

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

  if (loading) {
    return <LoadingPage fullScreen />;
  }

  return (
    <View className="flex-1 bg-white">
      
      <CustomHeader
        title={""}
        navigation={navigation as any}
        onBackPress={() =>
          navigation.navigate("Main", {
            screen: "FarmDetailsScreen",
            params: { farmId: farmId },
          })
        }
      />

      <View className="bg-white pb-6 items-center justify-center pt-2">
        <Image
          source={getImageSource(farmData?.imageId)}
          className="w-28 h-28 rounded-full border-2 border-gray-200"
          resizeMode="cover"
          accessible
          accessibilityLabel={farmData?.farmName || farmBasicDetails?.farmName}
        />
      </View>

      <View className="bg-white px-6s">
        <View className="items-center">
          <View className="flex-row items-center ">
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
            <Text className="text-gray-700 text-xl font-medium"> {t("Farms.ID")} : {regCode}</Text>
          </View>
          <Text className="text-gray-600 text-sm mb-1 mt-2">
            {farmData?.district}
          </Text>

          <Text className="text-gray-600 text-sm">
            {farmData?.appUserCount || 0} {t("Farms.Members")}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        className="px-6 mb-10"
      >
        {staffData.length > 0 && (
          <View className="mt-6">
            {staffData.map((staff, index) => (
              <View
                key={staff.id}
                className="bg-white rounded-lg p-4 mb-3 border border-gray-100 shadow-sm flex-row items-center justify-between"
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-24 h-24 rounded-full items-center justify-center mr-4 overflow-hidden">
                    <Image
                      source={require("../../../assets/images/farms/farm-profile.webp")}
                      className="w-full h-full rounded-full"
                      resizeMode="cover"
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="text-base font-medium text-gray-900">
                      {staff.firstName} {staff.lastName}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {t("Farms.Farm")} {staff.role}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {staff.phoneCode} {staff.phoneNumber}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  className="p-2"
                  onPress={() => handleEditStaffMember(staff.id)}
                >
                  <MaterialIcons name="edit" size={26} color="#555" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {staffData.length === 0 && (
          <View className="items-center mt-12">
            <Text className="text-gray-500 text-center">
              {t("Farms.NoStaffMembersFound")}
            </Text>
          </View>
        )}
      </ScrollView>

      <View>
        <TouchableOpacity
          className="absolute bottom-20 right-6 bg-gray-800 w-16 h-16 rounded-full items-center justify-center shadow-lg"
          onPress={handleAddStaff}
          accessibilityLabel="Add new staff member"
          accessibilityRole="button"
        >
          <Image
            className="w-[20px] h-[20px]"
            source={require("../../../assets/images/farms/plus-white.webp")}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditManagersScreen;
