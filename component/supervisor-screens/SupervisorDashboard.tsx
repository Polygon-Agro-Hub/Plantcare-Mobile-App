import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  RefreshControl,
} from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import NewsSlideShow from "@/Items/NewsSlideShow";
import MarketPriceSlideShow from "@/Items/MarketPriceSlideShow";
import { RootStackParamList } from "../types/types";
import { StackNavigationProp } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import NetInfo from "@react-native-community/netinfo";
import { BackHandler } from "react-native";
import DashboardSkeleton from "@/skeletons/DashboardSkeleton";
import { useDispatch } from "react-redux";
import { setAssetData } from "../../store/assetSlice";
import { setUserData, setUserPersonalData } from "../../store/userSlice";
import { useSelector } from "react-redux";
import { selectUserPersonal } from "@/store/userSlice";

type SupervisorDashbordNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Lanuage"
>;

interface User {
  firstName: string;
  lastName?: string;
  phoneNumber?: string;
  NICnumber?: string;
  profileImage?: string;
  id?: number;
  farmId?: number;
  farmName?: string;
  imageId?: number;
}

interface SupervisorDashbordProps {
  navigation: SupervisorDashbordNavigationProp;
}

const SupervisorDashbord: React.FC<SupervisorDashbordProps> = ({
  navigation,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState("en");
  const { t } = useTranslation();
  const [isConnected, setIsConnected] = useState(true);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const scrollViewRef = useRef<ScrollView>(null);
  useFocusEffect(
    useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, []),
  );

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? false);
    });
    return () => unsubscribe();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const backAction = () => true;
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction,
      );
      return () => subscription.remove();
    }, []),
  );

  const userPersonalData = useSelector(selectUserPersonal);

  useFocusEffect(
    React.useCallback(() => {
      setUser({
        firstName: userPersonalData?.firstName || "",
        lastName: userPersonalData?.lastName || "",
        phoneNumber: userPersonalData?.phoneNumber || "",
        id: userPersonalData?.id || 0,
        profileImage: userPersonalData?.profileImage || "",
        farmId: userPersonalData?.farmId || 0,
        farmName: userPersonalData?.farmName || "",
        NICnumber: userPersonalData?.NICnumber || "",
      });
    }, [userPersonalData]),
  );

  useEffect(() => {
    const checkTokenExpiration = async () => {
      try {
        const expirationTime = await AsyncStorage.getItem(
          "tokenExpirationTime",
        );
        const userToken = await AsyncStorage.getItem("userToken");

        if (expirationTime && userToken) {
          const currentTime = new Date();
          const tokenExpiry = new Date(expirationTime);

          if (currentTime < tokenExpiry) {
            console.log("Token is valid");
          } else {
            console.log("Token expired, clearing storage.");
            await AsyncStorage.multiRemove([
              "userToken",
              "tokenStoredTime",
              "tokenExpirationTime",
            ]);
            navigation.navigate("Signin");
          }
        }
      } catch (error) {
        console.error("Error checking token expiration:", error);
        navigation.navigate("Signin");
      }
    };

    checkTokenExpiration();
  }, [navigation]);

  const fetchProfileData = async () => {
    const selectedLanguage = t("Main.LNG");
    setLanguage(selectedLanguage);
    try {
      const response = await fetch(
        `${environment.API_BASE_URL}api/auth/user-profile`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem("userToken")}`,
          },
        },
      );

      const data = await response.json();

      if (!data.user || !data.user.firstName) {
        Alert.alert(t("Main.Error"), t("Main.SomethingWentWrongPleaseTryAgainlater"), [
          { text: t("Main.OK") },
        ]);
        navigation.navigate("Signin");
        return;
      }

      setUser(data.user);
      dispatch(setUserData(data.usermembership));
      dispatch(setUserPersonalData(data.user));
      setTimeout(() => setLoading(false), 300);
    } catch (error) {
      Alert.alert(t("Main.Error"), t("Main.SomethingWentWrongPleaseTryAgainlater"), [
        { text: t("Main.OK") },
      ]);
      navigation.navigate("Signin");
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await fetchProfileData();
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfileData();
    }, []),
  );

  const handleWeatherNavigation = () => {
    navigation.navigate("WeatherForecast" as any);
  };

  const actionItems = [
    {
      image: require("../../assets/images/dashboard/weather.webp"),
      label: t("Dashboard.Weather"),
      action: handleWeatherNavigation,
      bgColor: "#FFFFFF",
    },
    {
      image: require("../../assets/images/laboror/cultivation-image.webp"),
      label: t("Farms.Cultivation"),
      action: () =>
        navigation.navigate("ManagerFarmDetails", {
          farmId: user?.farmId,
          farmName: user?.farmName,
          imageId: user?.imageId,
        }),
      bgColor: "#FFFFFF",
    },
    {
      image: require("../../assets/images/dashboard/assets.webp"),
      label: t("Farms.Assets"),
      action: () => {
        if (
          typeof user?.farmId === "number" &&
          typeof user?.farmName === "string"
        ) {
          navigation.navigate("FarmCurrectAssets", {
            farmId: user.farmId,
            farmName: user.farmName,
          });
          dispatch(
            setAssetData({ farmName: "My Assets", farmId: user.farmId }),
          );
        } else {
          Alert.alert(t("Main.Error"), t("Farms.FarmIDOrFarmNameIsMissingOrInvalid"));
        }
      },
      bgColor: "#FFFFFF",
    },
  ];

  const chunkArray = (arr: any[], size: number) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  const actionRows = chunkArray(actionItems, 2);

  if (loading) return <DashboardSkeleton />;

  return (
    <View className="flex-1 bg-white">
      

      <View style={{ flexDirection: "row" }} className="mb-2">
        <TouchableOpacity
          onPress={() => navigation.navigate("LabororEngProfile")}
        >
          <View style={{ position: "relative" }}>
            <Image
              source={
                user?.profileImage
                  ? { uri: user.profileImage }
                  : require("../../assets/images/auth/profile.webp")
              }
              style={{
                height: 50,
                width: 50,
                borderRadius: hp(4),
                marginLeft: 15,
                marginTop: 15,
              }}
            />
            <View
              style={{
                position: "absolute",
                top: 13,
                right: 4,
                height: 15,
                width: 15,
                borderRadius: 7.5,
                backgroundColor: isConnected ? "#00A896" : "#808080",
                borderWidth: 2,
                borderColor: "white",
              }}
            />
          </View>
        </TouchableOpacity>

        <View style={{ marginTop: 15, marginLeft: 15, flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: "bold", flexWrap: "wrap" }}>
            {t("Dashboard.Hello")},{" "}
            {user ? (
              <Text numberOfLines={1} ellipsizeMode="tail">
                {user.firstName} ✋🏻
              </Text>
            ) : (
              t("Main.Loading...")
            )}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("PublicForum" as any)}
          className="ml-auto mr-4 mt-4 justify-center items-center bg-[#F6F7F7] rounded-full w-12 h-12 shadow-sm"
        >
          <MaterialCommunityIcons
            name="message-processing"
            size={24}
            color="black"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginLeft: 20, marginTop: 20 }}>
          <Text style={{ fontSize: 15, color: "gray", marginBottom: 5 }}>
            {t("Dashboard.MarketPrice")}
          </Text>
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: "#E2E2E2",
              marginRight: 80,
            }}
          />
        </View>

        <View
          style={{
            flex: 1,
            marginBottom: 10,
            justifyContent: "center",
            alignItems: "center",
            padding: 10,
          }}
        >
          <MarketPriceSlideShow language={language} />
        </View>

        <View style={{ marginLeft: 20 }}>
          <Text style={{ fontSize: 15, color: "gray", marginBottom: 5 }}>
            {t("Dashboard.News")}
          </Text>
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: "#E2E2E2",
              marginRight: 80,
            }}
          />
        </View>

        <View
          style={{
            flex: 1,
            padding: 10,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <NewsSlideShow navigation={navigation} language={language} />
        </View>

        <View className="px-4 pt-4 pb-28">
          {actionRows.map((row, rowIndex) => (
            <View key={rowIndex} className="flex-row justify-between mb-4">
              {row.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={action.action}
                  activeOpacity={0.7}
                  style={{
                    width: "48%",
                    backgroundColor: action.bgColor,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 2,
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <View className="w-24 h-24 rounded-lg justify-center items-center mb-3 overflow-hidden">
                    <Image
                      source={action.image}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="contain"
                    />
                  </View>

                  <View className="flex-row items-center justify-center">
                    <Text className="text-sm font-medium text-gray-800 text-center">
                      {action.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}

              {row.length === 1 && <View style={{ width: "48%" }} />}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default SupervisorDashbord;
