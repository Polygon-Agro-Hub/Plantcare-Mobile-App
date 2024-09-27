import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router"; // Used for navigation
import { RootStackParamList } from "./types";
import { StackNavigationProp } from "@react-navigation/stack";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SinhalaNavigationBar from "@/Items/SinhalaNavigationBar";

interface CropCardProps {
    id: number;
    image: any;
    cropName: string;
    //NatureOfCultivation: string;
    //SpecialNotes: string;
    onPress: () => void; // Callback for when the card is pressed
}


const CropCard: React.FC<CropCardProps> = ({ image, cropName, onPress }) => (
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
            source={{ uri: image }}
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
            {cropName}
        </Text>

        {/* Right: Circular Progress with Manual Text */}
        <View style={{ alignItems: "center", justifyContent: "center" }}>
            {/* <CircularProgress
        // value={progress * 100} // Multiply by 100 to convert to percentage
        radius={30}
        inActiveStrokeColor="#e0e0e0"
        activeStrokeColor="#4CAF50"
        activeStrokeWidth={8}
        inActiveStrokeWidth={8}
        showProgressValue={false} // Disable the default progress value display
      /> */}
            {/* Manually Positioned Text */}
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
);

type MyCropNavigationProp = StackNavigationProp<RootStackParamList, "SinhalaMyCrop">;

interface MyCropProps {
    navigation: MyCropNavigationProp;
}

const SinhalaMyCrop: React.FC<MyCropProps> = ({ navigation }) => {


    const [crops, setCrops] = useState<CropCardProps[]>([]);

    // Function to fetch ongoing cultivation data
    const fetchOngoingCultivations = async () => {
        try {
            const token = await AsyncStorage.getItem("userToken");

            const res = await axios.get<CropCardProps[]>(
                "http://10.0.2.2:3000/api/crop/get-user-ongoing-cul",
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
        }
    };

    useEffect(() => {
        // Call the fetch function inside useEffect
        fetchOngoingCultivations();
    }, []);

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
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={{ fontSize: 20, fontWeight: "bold", color: "#333" }}>
                    මගේ වගාව
                </Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {crops.map((crop) => (
                    <CropCard
                        id={crop.id}
                        image={crop.image}
                        cropName={crop.cropName}
                        onPress={() =>
                            navigation.navigate("CropCalanderSinhala", {
                                cropId: crop.id,
                                cropName: crop.cropName,
                            } as any)
                        } // Navigate to CropDetail with crop id
                    />
                ))}
            </ScrollView>

            <View style={{ width: "100%" }}>
                <SinhalaNavigationBar navigation={navigation}/>
            </View>
        </View>
    );
};

export default SinhalaMyCrop;
