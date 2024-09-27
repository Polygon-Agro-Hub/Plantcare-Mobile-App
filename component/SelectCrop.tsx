import {
  View,
  Text,
  Image,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import AntDesign from "react-native-vector-icons/AntDesign";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import { RouteProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";

type SelectCropRouteProp = RouteProp<RootStackParamList, "SelectCrop">;
type SelectCropNavigationCrop = StackNavigationProp<
  RootStackParamList,
  "SlectCrop"
>;

interface SelectCropProps {
  navigation: SelectCropNavigationCrop;
  route: SelectCropRouteProp;
}

interface CropItem {
  id: number;
  cropName: string;
  NatureOfCultivation: string;
  image: string;
  SpecialNotes: string;
}

const SelectCrop: React.FC<SelectCropProps> = ({ navigation, route }) => {
  const { cropId } = route.params;
  const [crop, setCrop] = useState<CropItem | null>(null);

  useEffect(() => {
    const fetchCrop = async () => {
      try {
        const res = await axios.get<CropItem[]>(
          `${environment.API_BASE_URL}api/crop/get-crop/${cropId}`
        );
        setCrop(res.data[0]); // Accessing the first item in the array
        console.log(res.data);
      } catch (err) {
        console.log("Failed to fetch", err);
      }
    };

    if (cropId) {
      fetchCrop();
    }
  }, [cropId]);

  const HandleEnrollBtn = async () => {
    try {
      // Get the cropId and user token
      console.log(cropId);
      const token = await AsyncStorage.getItem("userToken");

      // Make the API request with the token in the headers
      const res = await axios.get<string>(
        `${environment.API_BASE_URL}api/crop/enroll-crop/${cropId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        }
      );

      // Handle the response based on the status code
      if (res.status === 200) {
        // Success response
        Alert.alert("Success", "Enrollment successful");
        navigation.navigate("MyCrop");
      } else {
        // Any other status
        Alert.alert(
          "Error",
          "Unexpected response from the server. Please try again."
        );
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Handle specific error statuses from the backend
          const status = err.response.status;
          const message = err.response.data.message;

          if (status === 401) {
            Alert.alert(
              "Enrollment Error",
              message || "You are already enrolled in 3 crops."
            );
          } else if (status === 500) {
            Alert.alert(
              "Server Error",
              message ||
                "An error occurred on the server. Please try again later."
            );
          } else {
            Alert.alert(
              "Error",
              message || "An unexpected error occurred. Please try again."
            );
          }
        } else if (err.request) {
          // No response was received from the server
          Alert.alert(
            "Network Error",
            "Failed to connect to the server. Please check your internet connection and try again."
          );
        } else {
          // Something else went wrong in making the request
          Alert.alert(
            "Error",
            "An unexpected error occurred. Please try again."
          );
        }
      } else {
        // Any other kind of error
        Alert.alert("Error", "An unexpected error occurred. Please try again.");
      }

      console.error("Error enrolling crop:", err);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <TouchableOpacity onPress={() => router.back()}>
        <AntDesign
          name="left"
          size={24}
          color="#000502"
          style={{ paddingLeft: 10 }}
        />
      </TouchableOpacity>
      <View className="pt-10 items-center">
        <Text className="text-2xl font-bold pb-10">{crop?.cropName}</Text>
        <Image source={{ uri: crop?.image }} className="pb-1 h-40 w-40" />
      </View>
      <View className="flex-1 px-4">
        <Text className="font-bold text-lg mb-4">Description</Text>
        <View className="h-[260px] pt-0">
          <ScrollView>
            <Text className="text-base leading-relaxed">
              {crop?.SpecialNotes ||
                "No additional notes available for this crop."}
            </Text>
          </ScrollView>
        </View>
      </View>
      <TouchableOpacity
        className="bg-[#26D041] p-4 mx-4 mb-4 items-center bottom-0 left-0 right-0"
        onPress={HandleEnrollBtn}
      >
        <Text className="text-white text-xl">Enroll</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default SelectCrop;
