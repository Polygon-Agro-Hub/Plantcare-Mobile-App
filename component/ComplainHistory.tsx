import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
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

interface complainItem {
  id: number;
  createdAt: string;
  complain: string;
  language: string;
  complainCategory: string;
  status: "Opened" | "Closed";
  reply?: string;
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
  const { t } = useTranslation();

  useEffect(() => {
    const handleBackPress = () => {
      navigation.navigate("EngProfile");
      return true;
    };

    BackHandler.addEventListener("hardwareBackPress", handleBackPress);

    return () => {
      BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
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
    } catch (err) {
      // Alert.alert(t("ReportHistory.sorry"), t("ReportHistory.noData"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOngoingCultivations();
  }, []);

  // const formatDateTime = (isoDate: string) => {
  //   const date = new Date(isoDate);
  //   const options: Intl.DateTimeFormatOptions = {
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     hour12: true,
  //     day: "numeric",
  //     month: "short",
  //     year: "numeric",
  //   };
  //   const formattedDateTime = new Intl.DateTimeFormat("en-US", options).format(
  //     date
  //   );
  //   return formattedDateTime;
  // };

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

  const handleViewReply = (reply: string | undefined) => {
    if (reply) {
      setComplainReply(reply);
      setModalVisible(true);
    } else {
      Alert.alert(t("ReportHistory.sorry"), t("ReportHistory.NoReply"));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      enabled
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1 bg-[#F9F9FA] ">
        <View
          className="flex-row justify-between"
          style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
        >
          <TouchableOpacity onPress={() => navigation.navigate("EngProfile")}>
            <AntDesign name="left" size={24} color="#000502" />
          </TouchableOpacity>
          <Text className="font-bold text-lg">
            {t("ReportHistory.Complaints")}
          </Text>
          <View style={{ width: 24 }} />
        </View>
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#26D041" />
          </View>
        ) : complains.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <LottieView
              source={require("../assets/jsons/NoComplaints.json")}
              style={{ width: wp(50), height: hp(50) }}
              autoPlay
              loop
            />
            <Text className="text-center text-gray-600 mt-4">
              {t("ReportHistory.noData")}
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
                  {t("ReportHistory.RefNo")} : {complain.refNo}
                </Text>
                <Text className="self-start mb-4 text-[#6E6E6E]">
                  {t("ReportHistory.Sent")} {""}
                  {formatDateTime(complain.createdAt)}
                </Text>

                <Text className="self-start mb-4">{complain.complain}</Text>
                <View className="flex-row justify-between items-center">
                  {complain.status === "Closed" && (
                    <TouchableOpacity
                      className="bg-black px-3 py-2 rounded"
                      onPress={() => handleViewReply(complain.reply)}
                    >
                      <Text className="text-white text-xs">
                        {t("ReportHistory.View")}
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
                        ? t("ReportHistory.Opened")
                        : t("ReportHistory.Closed")}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          {/* <View
            className="flex-1 justify-between items-center bg-[#FFFFFF]"
            style={{ padding: wp(4) }}
          >
            <View >
              <View>
                <TouchableOpacity onPress={() => setModalVisible(false)} className="mt-1 right-5" 
                  style={{ paddingHorizontal: wp(2), paddingVertical: hp(2) }}
                  >
                  <AntDesign name="left" size={24} color="#000502" />
                </TouchableOpacity>
              </View>

              <View className="p-4 bg-white rounded-xl w-full">
              <Text className="text-lg font-bold">
                {t("ReportHistory.ThankYou")}
              </Text>
              <ScrollView className="mt-8 h-[80%] pt-2">
                <Text className="pb-4">{complainReply || "Loading..."}</Text>
              </ScrollView>

              </View>
              
    
            </View>

            <View className="w-full absolute bottom-4 p-4">
              <TouchableOpacity
                className="bg-black py-4 rounded-lg items-center"
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-white text-lg">
                  {t("ReportHistory.Closed")}
                </Text>
              </TouchableOpacity>
            </View>
          </View> */}

          <SafeAreaView className="flex-1  bg-[#FFFFFF]">
            <View className="  ">
              <AntDesign
                name="left"
                size={24}
                color="#000000"
                onPress={() => setModalVisible(false)}
                style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
              />
            </View>
            <View className="flex-1 ">
              <View className="pb-20">
                <View className="items-center justify-center ">
                  <Text className="text-lg font-bold">
                    {t("ReportHistory.ThankYou")}
                  </Text>
                </View>
                <ScrollView className="mt-8 p-8 h-[85%] pt-2">
                  <Text className="pb-4">{complainReply || "Loading..."}</Text>
                </ScrollView>
              </View>

              <View className="w-full absolute bottom-2 p-8">
                <TouchableOpacity
                  className="bg-black py-4 rounded-lg items-center"
                  onPress={() => setModalVisible(false)}
                >
                  <Text className="text-white text-lg">
                    {t("ReportHistory.Closed")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default ComplainHistory;
