import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  BackHandler,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { StatusBar, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import AntDesign from "react-native-vector-icons/AntDesign";
import LottieView from "lottie-react-native";
import { useSelector } from "react-redux";
import { selectUserPersonal} from "@/store/userSlice";
import { useFocusEffect } from "@react-navigation/native"
import { setUserData,setUserPersonalData } from "../store/userSlice";
import { useDispatch } from "react-redux";

interface complainItem {
  id: number;
  createdAt: string;
  complain: string;
  language: string;
  complainCategory: string;
  status: "Opened" | "Closed";
  reply?: string;
  replyTime?: string;
  refNo: string;
}

type ComplainHistoryNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ComplainHistory"
>;

interface ComplainHistoryProps {
  navigation: ComplainHistoryNavigationProp;
}

const ComplainHistory: React.FC<ComplainHistoryProps> = ({ navigation }) => {
  const [complains, setComplains] = useState<complainItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("en");
  const [modalVisible, setModalVisible] = useState(false);
  const [complainReply, setComplainReply] = useState<string | null>(null);
  const [selectedComplain, setSelectedComplain] = useState<complainItem | null>(null);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userPersonalData = useSelector(selectUserPersonal);
  
  const [profile, setProfile] = useState<{
    firstName: string;
    lastName: string;
  } | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      setProfile({
        firstName: userPersonalData?.firstName || "",
        lastName: userPersonalData?.lastName || "",
      });
    }, [userPersonalData])
  );

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.setItem("skip", "false");
      await AsyncStorage.removeItem("firstName");
      await AsyncStorage.removeItem("lastName");
      await AsyncStorage.removeItem("phoneNumber");
      await AsyncStorage.removeItem("nic");
      dispatch(setUserPersonalData({}));
      navigation.navigate("Signin");
    } catch (error) {}
  };

  useEffect(() => {
    const handleBackPress = () => {
      navigation.navigate("EngProfile");
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBackPress);

    return () => {
      backHandler.remove();
    };
  }, []);

  const fetchOngoingCultivations = async () => {
    try {
      setLanguage(t("MyCrop.LNG"));
      const token = await AsyncStorage.getItem("userToken");

      const res = await axios.get<complainItem[]>(
        `${environment.API_BASE_URL}api/complain/get-complains`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setComplains(res.data);
      console.log("responted data......",res.data)
    } catch (err) {
      // Alert.alert(t("ReportHistory.sorry"), t("ReportHistory.noData"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOngoingCultivations();
  }, []);

  const formatDateTime = (isoDate: string) => {
    const date = new Date(isoDate);

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12; // Convert 0 to 12
    const minuteStr = minutes.toString().padStart(2, "0");
    const timeStr = `${hour12}.${minuteStr}${ampm}`;

    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();

    return `${timeStr},${day} ${month} ${year}`;
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  const handleViewReply = (complain: complainItem) => {
    if (complain.reply) {
      setComplainReply(complain.reply);
      setSelectedComplain(complain);
      setModalVisible(true);
    } else {
      Alert.alert(t("ReportHistory.sorry"), t("ReportHistory.NoReply"), [{ text:  t("PublicForum.OK") }]);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      enabled
      style={{ flex: 1, backgroundColor: "#F9F9FA" }}
    >
      <View className="flex-1 bg-[#F9F9FA]">
        <View className="flex-row items-center justify-between" style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}>
          <TouchableOpacity onPress={() => navigation.navigate("EngProfile")}>
            <AntDesign name="left" size={24} color="#000502" style={{ paddingHorizontal: wp(3), paddingVertical: hp(1.5), backgroundColor: "#fff", borderRadius: 50 }}/>
          </TouchableOpacity>
          <Text className="font-bold text-lg">
            {t("ReportHistory.Complaints") || "Complaints"}
          </Text>
          <View style={{ width: 22 }} />
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <LottieView
              source={require('../assets/jsons/loader.json')}
              autoPlay
              loop
              style={{ width: 300, height: 300 }}
            />
          </View>
        ) : complains.length === 0 ? (
          <View className="flex-1 items-center justify-center -mt-[70%]">
            <LottieView
              source={require("../assets/jsons/NoComplaints.json")}
              style={{ width: wp(50), height: hp(50) }}
              autoPlay
              loop
            />
            <Text className="text-center text-gray-600 -mt-[30%]">
              {t("ReportHistory.noData") || "No complaints found"}
            </Text>
          </View>
        ) : (
          <ScrollView
            className="p-4 flex-1"
            contentContainerStyle={{ paddingBottom: hp(4) }}
          >
            {complains.map((complain) => (
              <View
                key={complain.id}
                className="bg-white p-6 my-2 rounded-xl shadow-md border border-[#dfdfdfcc]"
              >
                <Text className="self-start mb-4 font-semibold">
                  {t("ReportHistory.RefNo") || "Ref No"} : {complain.refNo || "N/A"}
                </Text>
                <Text className="self-start mb-4 text-[#6E6E6E]">
                  {t("ReportHistory.Sent") || "Sent"} {formatDateTime(complain.createdAt)}
                </Text>

                <Text className="self-start mb-4">
                  {complain.complain || ""}
                </Text>
                <View className="flex-row justify-between items-center">
                  {complain.status === "Closed" && (
                    <TouchableOpacity
                      className="bg-black px-3 py-2 rounded"
                      onPress={() => handleViewReply(complain)}
                    >
                      <Text className="text-white text-xs">
                        {t("ReportHistory.View") || "View"}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <View style={{ flex: 1, alignItems: "flex-end" }}>
                    <Text
                      className={`text-s font-semibold px-4 py-2 rounded ${
                        complain.status === "Opened"
                          ? "bg-blue-100 text-[#0051FF]"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {complain.status === "Opened"
                        ? (t("ReportHistory.Opened") || "Opened")
                        : (t("ReportHistory.Closed") || "Closed")}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
          statusBarTranslucent={false}
        >
          <View 
            className="flex-1 items-center bg-white bg-opacity-50"
            style={{ 
              paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0
            }}
          >
            <ScrollView 
              className="bg-white rounded-lg shadow-lg w-full max-w-md"
              contentContainerStyle={{ padding: 24, paddingBottom: 70 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Close Button */}
              <TouchableOpacity 
                className="absolute top-3 right-3 bg-gray-200 p-1 rounded-full" 
                onPress={() => setModalVisible(false)}
              >
                <AntDesign name="close" size={18} color="gray" />
              </TouchableOpacity>


              <View className="mt-4">
               
                <Text className="text-gray-800 text-base leading-relaxed text-left">
                  {language === "si" ? 
                    `හිතවත් ${profile?.firstName || ""} ${profile?.lastName || ""},\n\nඅපි ඔබට කාරුණිකව දැනුම් දෙන්න කැමතියි ඔබගේ පැමිණිල්ල විසඳා ගෙන ඇත.\n\n${complainReply || "Loading..."}\n\nඔබට තවත් ගැටළු හෝ ප්‍රශ්න තිබේ නම්, කරුණාකර අප හා සම්බන්ධ වන්න. ඔබේ ඉවසීම සහ අවබෝධය වෙනුවෙන් ස්තූතියි.\n\nමෙයට,\nPolygon Agro Customer Support Team`
                    : language === "ta" ?
                    `அன்புள்ள ${profile?.firstName || ""} ${profile?.lastName || ""},\n\nநாங்கள் உங்கள் புகாரை தீர்க்கப்பட்டதாக தெரிவித்ததில் மகிழ்ச்சி அடைகிறோம்\n\n${complainReply || "Loading..."}\n\nஉங்களுக்கு மேலும் ஏதேனும் சிக்கல்கள் அல்லது கேள்விகள் இருந்தால், தயவுசெய்து எங்களைத் தொடர்பு கொள்ளவும். உங்கள் பொறுமைக்கும் புரிதலுக்கும் நன்றி.\n\nஇதற்கு,\nPolygon Agro Customer Support Team`
                    :
                    `Dear ${profile?.firstName || ""} ${profile?.lastName || ""},\n\nWe are pleased to inform you that your complaint has been resolved\n\n${complainReply || "Loading..."}\n\nIf you have any further concerns or questions, feel free to reach out.\nThank you for your patience and understanding.\n\nSincerely,\nPolygon Agro Customer Support Team`
                  }
                </Text>
                 {selectedComplain?.replyTime && (
                  <Text className="  mb-3 mt-1 ">
                    {formatDate(selectedComplain.replyTime)}
                  </Text>
                )}
              </View>
            </ScrollView>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ComplainHistory;