import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  RefreshControl
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { RootStackParamList } from "../types";
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

type ManagerFarmDetailsNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ManagerFarmDetails"
>;

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

interface ManagerFarmDetailsProps {
  navigation: ManagerFarmDetailsNavigationProp;
  route: RouteProp<RootStackParamList, 'ManagerFarmDetails'>;
}

const ManagerFarmDetails: React.FC<ManagerFarmDetailsProps> = ({ navigation, route }) => {
  const { farmId, farmName, imageId } = route.params;
  
  const [language, setLanguage] = useState("en");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [crops, setCrops] = useState<CropItem[]>([]);
  const { t } = useTranslation();
  const users = useSelector((state: RootState) => state.user.userData);
  
  console.log('user role---------------',users?.role)

  const getImageSource = useCallback((imageId?: number) => {
    console.log('Getting image for imageId:', imageId);
    
    if (!imageId) {
      return require('@/assets/images/Farm/1.webp');
    }
    
    try {
      const imageMap: { [key: number]: any } = {
        1: require('@/assets/images/Farm/1.webp'),
        2: require('@/assets/images/Farm/2.webp'),
        3: require('@/assets/images/Farm/3.webp'),
        4: require('@/assets/images/Farm/4.webp'),
        5: require('@/assets/images/Farm/5.webp'),
        6: require('@/assets/images/Farm/6.webp'),
        7: require('@/assets/images/Farm/7.webp'),
        8: require('@/assets/images/Farm/8.webp'),
        9: require('@/assets/images/Farm/9.webp'),
      };
      
      return imageMap[imageId] || require('@/assets/images/Farm/1.webp');
    } catch (err) {
      console.error('Error loading farm image:', err);
      return require('@/assets/images/Farm/1.webp');
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
      setLanguage(t("MyCrop.LNG"));

      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        console.error("User token is missing");
        throw new Error("User is not authenticated");
      }

      // Fetch all user cultivations (same as MyCrop)
      const res = await axios.get<CropItem[]>(
        `${environment.API_BASE_URL}api/crop/get-user-ongoing-cul`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API Response:", res.data);
      console.log("Filtering for farmId:", farmId);

      if (res.status === 404 || !res.data || res.data.length === 0) {
        console.warn("No cultivations found.");
        setCrops([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Filter cultivations by farmId
      const farmCrops = res.data.filter((crop: CropItem) => crop.farmId === farmId);
      console.log("Filtered crops for this farm:", farmCrops);

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
              }
            );

            const completedStages = response.data.filter(
              (stage: { status: string }) => stage.status === "completed"
            ).length;
            const totalStages = response.data.length;

            const progress =
              totalStages > 0 ? Math.min(completedStages / totalStages, 1) : 0;

            return { ...crop, progress };
          } catch (error) {
            console.error(
              `Error fetching progress for cropCalendar ${crop.cropCalendar}:`,
              error
            );
            return { ...crop, progress: 0 };
          }
        })
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


  const handleManageWorkersPress = () => {
  if (users?.role === "Manager") {
    navigation.navigate("ManageMembersManager", { 
      farmId: farmId, 
      farmName: farmName,
      imageId: imageId
    });
  } else if (users?.role === "Supervisor") {
    navigation.navigate("ManageMembersSupervisor", { 
      farmId: farmId, 
      farmName: farmName,
      imageId: imageId
    });
  } else {
    // Optional: Handle other roles or show alert
    Alert.alert("Access Denied", "You don't have permission to manage workers");
  }
}

  useFocusEffect(
    React.useCallback(() => {
      fetchCultivationsAndProgress();
    }, [farmId])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCultivationsAndProgress();
  }, [farmId]);

  const handleCropPress = (crop: CropItem) => {
    if (crop.isBlock === 1) {
      return; // Don't navigate if blocked
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

  console.log("farm name & Id", farmId, farmName);

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Section */}
        <View className="bg-white px-5 pt-2 pb-2 rounded-b-3xl shadow-sm">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mb-[-5%]"
          >
            <MaterialCommunityIcons name="chevron-left" size={32} color="#374151" />
          </TouchableOpacity>

          {/* Farm Image and Name */}
          <View className="items-center mb-4">
            <View className="rounded-full w-24 h-24 shadow-lg mb-3 overflow-hidden border-4 border-white">
              <Image
                source={getImageSource(imageId ? Number(imageId) : undefined)}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            <Text className="text-2xl font-bold text-gray-800">{farmName}</Text>
          </View>

          {/* Manage Workers Button */}
          <TouchableOpacity
  className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex-row items-center justify-between shadow-sm"
  onPress={handleManageWorkersPress}
>
  <View className="flex-row items-center">
    <View className="rounded-full w-12 h-12 items-center justify-center mr-3">
      <Image
        className="w-[50px] h-[50px]"
        source={require('../../assets/images/Farm/Managers.webp')}
      />
    </View>
    <Text className="text-base font-semibold text-gray-800">
      {t("Manager.Manage Workers")}
    </Text>
  </View>
  <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
</TouchableOpacity>
        </View>

        {/* Ongoing Cultivations Section */}
        <View className="px-5 mt-6">
          <Text className="text-center text-sm text-gray-500 font-medium mb-4">
            {t("Manager.Ongoing Cultivations")}
          </Text>

          {loading ? (
            <SkeletonLoader />
          ) : crops.length === 0 ? (
            <View className="items-center justify-center py-10">
              <Text className="text-gray-500 text-base">
                {t("Manager.No ongoing cultivations found")}
              </Text>
            </View>
          ) : (
            /* Cultivation Cards */
            crops.map((crop) => (
              <View key={crop.id} style={{ position: 'relative' }}>
                {/* Lock Icon */}
                {crop.isBlock === 1 && (
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
                  onPress={crop.isBlock === 1 ? undefined : () => handleCropPress(crop)}
                  style={{
                    width: "100%",
                    padding: 16,
                    borderRadius: 12,
                    marginBottom: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    backgroundColor: "white",
                    opacity: crop.isBlock === 1 ? 0.6 : 1,
                    position: "relative",
                  }}
                >
                  {/* Crop Image */}
                  <Image
                    source={{
                      uri: typeof crop.image === "string"
                        ? crop.image
                        : formatImage(crop.image)
                    }}
                    style={{ width: 80, height: 80, borderRadius: 8 }}
                    resizeMode="contain"
                  />
                  
                  {/* Crop Name */}
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "600",
                      marginLeft: 0,
                      flex: 1,
                      textAlign: "center",
                      color: "#333",
                    }}
                  >
                    {language === "si"
                      ? crop.varietyNameSinhala
                      : language === "ta"
                      ? crop.varietyNameTamil
                      : crop.varietyNameEnglish}
                  </Text>

                  {/* Progress Circle */}
                  <View style={{ alignItems: "center", justifyContent: "center" }}>
                    <Progress.Circle
                      size={50}
                      progress={crop.progress}
                      thickness={4}
                      color="#4caf50"
                      unfilledColor="#ddd"
                      showsText={true}
                      formatText={() => `${Math.round(crop.progress * 100)}%`}
                      textStyle={{ fontSize: 12, fontWeight: 'bold' }}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Add Bottom Padding */}
        <View className="h-6" />
      </ScrollView>

    
    </View>
  );
};

export default ManagerFarmDetails;