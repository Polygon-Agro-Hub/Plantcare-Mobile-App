import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
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
          marginLeft: 16,
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
  const [loading, setLoading] = useState<boolean>(true);
  const [crops, setCrops] = useState<CropItem[]>([]);

  const fetchCultivationsAndProgress = async () => {
    try {
      setLanguage(t("MyCrop.LNG"));

      const token = await AsyncStorage.getItem("userToken");

      // Fetch ongoing cultivations
      const res = await axios.get<CropItem[]>(
        `${environment.API_BASE_URL}api/crop/get-user-ongoing-cul`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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

            const progress = Math.min(completedStages / totalStages, 1); // Progress value between 0 and 1

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

      setCrops(cropsWithProgress);
    } catch (error) {
      console.error("Error fetching cultivations or progress:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCultivationsAndProgress();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

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

      <ScrollView contentContainerStyle={{ padding: 16 }}>
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

      <View style={{ width: "100%" }}>
        <Navigationbar navigation={navigation} />
      </View>
    </View>
  );
};

export default MyCrop;
