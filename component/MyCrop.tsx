import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, ActivityIndicator,TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Navigationbar from "../Items/NavigationBar";
import { RootStackParamList } from "./types";
import { StackNavigationProp } from "@react-navigation/stack";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import AntDesign from 'react-native-vector-icons/AntDesign';
import { encode } from 'base64-arraybuffer';

interface CropCardProps {
  id: number;
  image: { type: string; data: number[] };
  varietyNameEnglish: string;
  onPress: () => void; 
}

interface CropItem {
  id: number;
  image: { type: string; data: number[] };
  varietyNameEnglish: string;
  varietyNameSinhala: string;
  varietyNameTamil: string;
}


const CropCard: React.FC<CropCardProps> = ({ image, varietyNameEnglish, onPress }) => {

  console.log('cropName',varietyNameEnglish)

  const bufferToBase64 = (buffer: number[]): string => {
    const uint8Array = new Uint8Array(buffer); // Create Uint8Array from number[]
    return encode(uint8Array.buffer); // Pass the underlying ArrayBuffer to encode
  };

  const formatImage = (imageBuffer: { type: string; data: number[] }): string => {
    const base64String = bufferToBase64(imageBuffer.data);
    return `data:image/png;base64,${base64String}`; // Assuming the image is PNG
  };


  return(

  

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
      style={{ width: 96, height: 96, borderRadius: 12 }}
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

    <View style={{ alignItems: "center", justifyContent: "center" }}>

      <View
        style={{
          position: "absolute",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{ fontWeight: "bold", fontSize: 15, color: "#000" }}
        ></Text>
      </View>
    </View>
  </TouchableOpacity>
  )
}

type MyCropNavigationProp = StackNavigationProp<RootStackParamList, "MyCrop">;

interface MyCropProps {
  navigation: MyCropNavigationProp;
}

const MyCrop: React.FC<MyCropProps> = ({ navigation }) => {
  const [language, setLanguage] = useState('en');
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(true);
  


  const [crops, setCrops] = useState<CropItem[]>([]);

  // Updated bufferToBase64 function
  const bufferToBase64 = (buffer: number[]): string => {
    const uint8Array = new Uint8Array(buffer); // Create Uint8Array from number[]
    return encode(uint8Array.buffer); // Pass the underlying ArrayBuffer to encode
  };

  const formatImage = (imageBuffer: { type: string; data: number[] }): string => {
    const base64String = bufferToBase64(imageBuffer.data);
    return `data:image/png;base64,${base64String}`; // Assuming the image is PNG
  };



  const fetchOngoingCultivations = async () => {
    try {
      //set language
      setLanguage(t('MyCrop.LNG'))

      const token = await AsyncStorage.getItem("userToken");

      const res = await axios.get<CropItem[]>(
        `${environment.API_BASE_URL}api/crop/get-user-ongoing-cul`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        }
      );
      setCrops(res.data);
      console.log(res.data);
    } catch (err) {
      console.log("Failed to fetch", err);
    }finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOngoingCultivations();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
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
        <AntDesign name="left" size={24} color="#000502"/>
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "#333" }}>
          {t('MyCrop.Cultivation')}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {crops.map((crop) => (
          <CropCard
            id={crop.id}
            image={crop.image}
            varietyNameEnglish={
              language === 'si' ? crop.varietyNameSinhala
                : language === 'ta' ? crop.varietyNameSinhala
                  : crop.varietyNameEnglish
            }
            onPress={() =>
              navigation.navigate("CropCalander", {
                cropId: crop.id,
                cropName:
                language === 'si' ? crop.varietyNameSinhala
                : language === 'ta' ? crop.varietyNameTamil
                  : crop.varietyNameEnglish
              } as any)
            } // Navigate to CropDetail with crop id
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
