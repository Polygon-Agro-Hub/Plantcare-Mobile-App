import React, { useEffect, useState,  } from "react";
import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity , RefreshControl} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Navigationbar from "../Items/NavigationBar";
import { RootStackParamList } from "./types";
import { StackNavigationProp } from "@react-navigation/stack";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import AntDesign from "react-native-vector-icons/AntDesign";
import * as Progress from "react-native-progress"; // Progress library for circular progress
import { encode } from "base64-arraybuffer";
import moment from "moment";
import { useFocusEffect } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import ContentLoader, { Rect, Circle } from "react-content-loader/native";
interface CropCardProps {
  id: number;
  image: { type: string; data: number[] };
  varietyNameEnglish: string;
  onPress: () => void;
  progress: number; // Progress as a prop
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
  progress: number; // Progress value for each crop
}

const CropCard: React.FC<CropCardProps> = ({ image, varietyNameEnglish, onPress, progress }) => {
  const bufferToBase64 = (buffer: number[]): string => {
    const uint8Array = new Uint8Array(buffer); // Create Uint8Array from number[]
    return encode(uint8Array.buffer); // Pass the underlying ArrayBuffer to encode
  };

  const formatImage = (imageBuffer: { type: string; data: number[] }): string => {
    const base64String = bufferToBase64(imageBuffer.data);
    return `data:image/png;base64,${base64String}`; // Assuming the image is PNG
  };

  return (
    <TouchableOpacity
      onPress={onPress}
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
      }}
    >
      {/* Left: Crop Image */}
      <Image
        source={{ uri: formatImage(image) }}
        style={{ width: "30%", height: 80, borderRadius: 8 }}
        resizeMode="cover"
      />

      {/* Middle: Crop Name */}
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

      {/* Right: Circular Progress */}
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Progress.Circle
          size={50}
          progress={progress} // Progress value between 0 and 1
          thickness={4}
          color="#4caf50"
          unfilledColor="#ddd"
          showsText={true}
          formatText={() => `${Math.round(progress * 100)}%`} // Display progress as percentage
          textStyle={{ fontSize: 12 }}
        />
      </View>
    </TouchableOpacity>
  );
};

type MyCropNavigationProp = StackNavigationProp<RootStackParamList, "MyCrop">;

interface MyCropProps {
  navigation: MyCropNavigationProp;
}

const MyCrop: React.FC<MyCropProps> = ({ navigation }) => {
  const [language, setLanguage] = useState("en");
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [crops, setCrops] = useState<CropItem[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);


  const fetchCultivationsAndProgress = async () => {
    setLoading(true); 
    try {
      setLanguage(t("MyCrop.LNG"));
  
      const token = await AsyncStorage.getItem("userToken");
  
      if (!token) {
        console.error("User token is missing");
        throw new Error("User is not authenticated");
      }
  
      // Fetch ongoing cultivations
      const res = await axios.get<CropItem[]>(
        `${environment.API_BASE_URL}api/crop/get-user-ongoing-cul`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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
              `${environment.API_BASE_URL}api/crop/slave-crop-calendar-progress/${crop.cropCalendar}`,
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
  
            const progress = totalStages > 0
              ? Math.min(completedStages / totalStages, 1)
              : 0; // Avoid division by zero
  
            return { ...crop, progress };
            
          } catch (error) {
            console.error(
              `Error fetching progress for cropCalendar ${crop.cropCalendar}:`,
              error
            );
            return { ...crop, progress: 0 }; // Default progress in case of error
          }
        })
      );
      setTimeout(() => {
        setLoading(false);
        setRefreshing(false); // Stop refreshing loader
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

  // useFocusEffect(
  //   React.useCallback(() => {
  //     setLoading(true); // Show loader when screen is focused
  //     fetchCultivationsAndProgress();
  //   }, [])
  // );
  useFocusEffect(
    React.useCallback(() => {
      if (crops.length === 0) {
        setLoading(true); 
        fetchCultivationsAndProgress();
      }
    }, [])
  );

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
          height={hp("120%")} // Adjust height to fit all 10 rows
          viewBox={`0 0 ${wp("100%")} ${hp("120%")}`}
          backgroundColor="#ececec"
          foregroundColor="#fafafa"
        >
          {Array.from({ length: 10 }).map((_, index) => (
            <Rect
              key={index}
              x="0"
              y={index * hp("12%")} // Maintain consistent vertical spacing
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
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 16,
          backgroundColor: "white",
          borderBottomWidth: 1,
          borderBottomColor: "#ccc",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="left" size={24} color="#000502" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "#333" }}>
          {t("MyCrop.Cultivation")}
        </Text>
        <View style={{ width: 24 }} />
      </View>
      {loading ?(
        <SkeletonLoader/>
      ):(
        <ScrollView contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        >
          {crops.map((crop) => (
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
              progress={crop.progress} // Individual progress
              onPress={() =>
                navigation.navigate("CropCalander", {
                  cropId: crop.cropCalendar,
                  startedAt: crop.staredAt,
                  cropName:
                    language === "si"
                      ? crop.varietyNameSinhala
                      : language === "ta"
                      ? crop.varietyNameTamil
                      : crop.varietyNameEnglish,
                } as any)
                
              }
              
            />
          ))}
        </ScrollView>

      )}

    

      {/* <View style={{ width: "100%" }}>
        <Navigationbar navigation={navigation} />
      </View> */}
    </View>
  );
};

export default MyCrop;
