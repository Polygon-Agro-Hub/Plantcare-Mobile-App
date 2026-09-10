import { useCallback, useEffect, useState, useMemo } from "react";
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
import { RootState } from "@/services/reducxStore";
import { selectFarmBasicDetails } from "../../../store/farmSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { encode } from "base64-arraybuffer";
import ImageData from "@/assets/jsons/farm/farm-image.json";
import districtData from "@/assets/jsons/common/district.json";
import CustomHeader from "@/component/common/CustomHeader";
import { MaterialIcons } from "@expo/vector-icons";
import LoadingPage from "@/component/common/LoadingPage";
import NoData from "@/component/common/NoData";

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
  membership?: string;
  renew?: string | boolean;
  regCode?: string;
  farmName?: string;
  imageId?: number;
  role?: string;
};

interface FarmItem {
  id: number;
  userId?: number;
  farmName: string;
  farmIndex?: number;
  extentha?: string | number;
  extentac?: string | number;
  extentp?: string | number;
  district?: string;
  plotNo?: string;
  street?: string;
  city?: string;
  staffCount: number;
  appUserCount: number;
  imageId: number;
  regCode?: string;
}

interface Staff {
  createdAt?: string;
  farmId: number;
  firstName: string;
  id: number;
  image?: any;
  lastName: string;
  ownerId?: number;
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
  const currentUser = useSelector((state: RootState) => state.user.userData);

  const route = useRoute();
  const routeParams = (route.params || {}) as RouteParams;
  const { farmId, membership, renew, regCode } = routeParams;

  const userRole = currentUser?.role || routeParams.role || "Owner";

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

      if (userRole === "Manager" || userRole === "Supervisor") {
        const res = await axios.get<any>(
          `${environment.API_BASE_URL}api/staff/get-supervisor&Laboror/${farmId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (res.data) {
          const rawStaff: Staff[] = res.data.staff || [];
          setStaffData(rawStaff);
          setFarmData({
            id: farmId,
            farmName: routeParams.farmName || res.data.farm?.farmName || "",
            district: res.data.farm?.district || "",
            staffCount: res.data.staffCount || rawStaff.length,
            appUserCount: res.data.appUserCount || rawStaff.length,
            imageId: routeParams.imageId || res.data.farm?.imageId || 1,
            regCode: routeParams.regCode || res.data.farm?.regCode || "",
          });
        } else {
          setStaffData([]);
        }
      } else {
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
        setStaffData(res.data.staff || []);
      }
    } catch (err) {
      console.error("Error fetching farms/staff:", err);
      setStaffData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, [farmId, userRole]);

  useFocusEffect(
    useCallback(() => {
      fetchFarms();
    }, [farmId, userRole]),
  );

  const handleBackPress = useCallback(() => {
    if (userRole === "Manager" || userRole === "Supervisor") {
      navigation.navigate("ManagerFarmDetails", {
        farmId: farmId,
        farmName: routeParams.farmName || farmData?.farmName || "",
        imageId: routeParams.imageId || farmData?.imageId,
      });
    } else {
      navigation.navigate("Main", {
        screen: "FarmDetailsScreen",
        params: { farmId: farmId },
      });
    }
    return true;
  }, [navigation, userRole, farmId, routeParams, farmData]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackPress,
      );

      return () => subscription.remove();
    }, [handleBackPress]),
  );

  const handleAddStaff = () => {
    navigation.navigate("Main", {
      screen: "AddnewStaff",
      params: {
        farmId: farmId,
        regCode: routeParams.regCode || farmData?.regCode || "",
        farmName: routeParams.farmName || farmData?.farmName,
        imageId: routeParams.imageId || farmData?.imageId,
      },
    });
  };

  const handleEditStaffMember = (staffId: number) => {
    navigation.navigate("EditStaffMember", {
      staffMemberId: staffId,
      farmId: farmId,
      membership: routeParams.membership || membership,
      renew: routeParams.renew || renew,
      regCode: routeParams.regCode || farmData?.regCode || "",
      farmName: routeParams.farmName || farmData?.farmName,
      imageId: routeParams.imageId || farmData?.imageId,
    });
  };

  const getDistrictLabel = (districtValue: string | undefined): string => {
    if (!districtValue) return "";
    const trimmed = String(districtValue).trim();

    const numericId = Number(trimmed);
    if (!isNaN(numericId)) {
      const found = districtData.find((d) => d.id === numericId);
      if (found) return t(found.translationKey);
    }

    const foundByName = districtData.find(
      (d) => d.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (foundByName) return t(foundByName.translationKey);

    return t(`District.${trimmed}`) || trimmed;
  };

  const getRoleDisplayName = (role: string) => {
    if (!role) return "";
    const normalized = role.toLowerCase().replace(/[\s_-]/g, "");
    if (normalized === "supervisor" || normalized === "farmsupervisor") {
      return t("Farms.FarmSupervisor") || t("Farms.Supervisor") || "Farm Supervisor";
    }
    if (
      normalized === "laborer" ||
      normalized === "farmlaborer" ||
      normalized === "laboror" ||
      normalized === "farmlaboror"
    ) {
      return t("Farms.FarmLaborer") || t("Farms.Laborer") || "Farm Laborer";
    }
    if (normalized === "manager" || normalized === "farmmanager") {
      return t("Farms.FarmManager") || t("Farms.Manager") || "Farm Manager";
    }
    if (normalized === "owner" || normalized === "farmowner") {
      return t("Farms.FarmOwner") || t("Farms.Owner") || "Farm Owner";
    }
    return t(`Farms.${role}`) || role;
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

    const isPro = String(membership).toLowerCase() === "pro";
    const isExpired = !!renew;

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

  const filteredStaff = useMemo(() => {
    return staffData.filter((member) => {
      if (userRole === "Supervisor") {
        return member.role === "Laborer";
      }
      if (userRole === "Manager") {
        return member.role === "Supervisor" || member.role === "Laborer";
      }
      return true;
    });
  }, [staffData, userRole]);

  const emptyStaffText = useMemo(() => {
    if (userRole === "Supervisor") {
      return (
        t("Farms.NoLaborersFoundForThisFarm") ||
        "No laborers found for this farm"
      );
    }
    if (userRole === "Manager") {
      return (
        t("Farms.NoSupervisorsOrLaborersFoundForThisFarm") ||
        "No supervisors or laborers found for this farm"
      );
    }
    return t("Farms.NoStaffMembersFound") || "No staff members found";
  }, [userRole, t]);

  const renderStaffImage = (image: any) => {
    if (typeof image === "string" && image.trim().length > 0) {
      return (
        <Image
          source={{ uri: image }}
          className="w-full h-full rounded-full"
          resizeMode="cover"
        />
      );
    }
    if (image && image.data && Array.isArray(image.data)) {
      try {
        const uint8Array = new Uint8Array(image.data);
        const base64String = encode(uint8Array.buffer);
        return (
          <Image
            source={{ uri: `data:image/png;base64,${base64String}` }}
            className="w-full h-full rounded-full"
            resizeMode="cover"
          />
        );
      } catch (err) {
        console.error("Error decoding staff image:", err);
      }
    }
    return (
      <Image
        source={require("../../../assets/images/farms/farm-profile.webp")}
        className="w-full h-full rounded-full"
        resizeMode="cover"
      />
    );
  };

  if (loading) {
    return <LoadingPage fullScreen />;
  }

  const effectiveFarmName =
    farmData?.farmName ||
    routeParams.farmName ||
    farmBasicDetails?.farmName ||
    "Farm";
  const effectiveRegCode = farmData?.regCode || regCode;

  return (
    <View className="flex-1 bg-white">
      <CustomHeader
        title={""}
        navigation={navigation as any}
        onBackPress={handleBackPress}
      />

      <View className="bg-white pb-6 items-center justify-center pt-2">
        <Image
          source={getImageSource(farmData?.imageId || routeParams.imageId)}
          className="w-28 h-28 rounded-full border-2 border-gray-200"
          resizeMode="cover"
          accessible
          accessibilityLabel={effectiveFarmName}
        />
      </View>

      <View className="bg-white px-6">
        <View className="items-center">
          <View className="flex-row items-center ">
            <Text className="font-bold text-xl text-gray-900 mr-3">
              {effectiveFarmName}
            </Text>
            {userRole === "Owner" && membership && (
              (() => {
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
              })()
            )}
          </View>
          {effectiveRegCode ? (
            <View className="border border-[#434343] px-3 py-1 rounded-lg mt-2">
              <Text className="text-gray-700 text-xl font-medium">
                {" "}{t("Farms.ID")} : {effectiveRegCode}
              </Text>
            </View>
          ) : null}
          {farmData?.district ? (
            <Text className="text-gray-600 text-sm mb-1 mt-2">
              {getDistrictLabel(farmData.district)}
            </Text>
          ) : null}

          <Text className="text-gray-600 text-sm">
            {filteredStaff.length}{" "}
            {filteredStaff.length === 1
              ? t("Farms.Member")
              : t("Farms.Members")}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        className="px-6 mb-10"
      >
        {filteredStaff.length > 0 && (
          <View className="mt-6">
            {filteredStaff.map((staff) => (
              <View
                key={staff.id}
                className="bg-white rounded-xl p-4 mb-3 border border-gray-100 flex-row items-center justify-between"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-16 h-16 rounded-full items-center justify-center mr-4 overflow-hidden">
                    {renderStaffImage(staff.image)}
                  </View>

                  <View className="flex-1">
                    <Text className="text-base font-medium text-gray-900">
                      {staff.firstName} {staff.lastName}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {getRoleDisplayName(staff.role)}
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

        {filteredStaff.length === 0 && (
          <View className="flex-1 justify-center items-center py-12">
            <NoData text={emptyStaffText} />
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
