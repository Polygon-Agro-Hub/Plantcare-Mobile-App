import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Linking,
  Alert,
  BackHandler,
  SafeAreaView,
  ScrollView,
} from "react-native";
import {
  AntDesign,
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "@/context/LanguageContext";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

type EngProfileNavigationProp = StackNavigationProp<
  RootStackParamList,
  "EngProfile"
>;

interface EngProfileProps {
  navigation: EngProfileNavigationProp;
}

const EngProfile: React.FC<EngProfileProps> = ({ navigation }) => {
  const [isLanguageDropdownOpen, setLanguageDropdownOpen] =
    useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(
    null
  );
  const [isComplaintDropdownOpen, setComplaintDropdownOpen] =
    useState<boolean>(false);
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [profile, setProfile] = useState<{
    firstName: string;
    lastName: string;
    phoneNumber: string;
    id: number;
    profileImage: string;
  } | null>(null);
  const { changeLanguage } = useContext(LanguageContext);
  const { t } = useTranslation();

  const complaintOptions = [
    t("Profile.ReportComplaint"),
    t("Profile.ViewComplaintHistory"),
  ];

  const handleComplaintSelect = (complaint: string) => {
    setComplaintDropdownOpen(false);

    if (complaint === t("Profile.ReportComplaint")) {
      navigation.navigate("ComplainForm");
    } else if (complaint === t("Profile.ViewComplaintHistory")) {
      navigation.navigate("ComplainHistory");
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          const response = await axios.get(
            `${environment.API_BASE_URL}api/auth/user-profile`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.data.status === "success") {
            setProfile(response.data.user);
          } else {
            Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
            navigation.navigate("Signin");
          }
        } else {
          Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
          navigation.navigate("Signin");
        }
      } catch (error) {}
    };

    fetchProfile();

    const handleBackPress = () => {
      navigation.navigate("Dashboard");
      return true;
    };

    BackHandler.addEventListener("hardwareBackPress", handleBackPress);

    return () => {
      BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
    };
  }, []);

  const handleCall = () => {
    const phoneNumber = "+1234567890";
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert(t("Main.error"), t("Profile.UnabletoOpen"));
        }
      })
      .catch((err) => console.error("An error occurred", err));
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.setItem("skip", "false");
      await AsyncStorage.removeItem("firstName");
      await AsyncStorage.removeItem("lastName");
      await AsyncStorage.removeItem("phoneNumber");
      await AsyncStorage.removeItem("nic");
      navigation.navigate("SigninOldUser");
    } catch (error) {}
  };

  const handleEditClick = () => {
    navigation.navigate("EngEditProfile");
  };

  const HanldeAsynStorage = async (lng: string) => {
    await AsyncStorage.setItem("@user_language", lng);
  };

  const handleLanguageSelect = async (language: string) => {
    setSelectedLanguage(language);
    setLanguageDropdownOpen(false);
    try {
      if (language === "ENGLISH") {
        LanguageSelect("en");
        HanldeAsynStorage("en");
      } else if (language === "தமிழ்") {
        LanguageSelect("ta");
        HanldeAsynStorage("ta");
      } else if (language === "SINHALA") {
        LanguageSelect("si");
        HanldeAsynStorage("si");
      }
    } catch (error) {}
  };

  const LanguageSelect = async (language: string) => {
    try {
      await AsyncStorage.setItem("@user_language", language);
      changeLanguage(language);
    } catch (error) {}
  };

  return (
    <SafeAreaView
      className="flex-1 bg-white "
      style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
    >
      <View className=" bg-white p-6 ">
        <View className=" absolute pb-5 pl-0">
          <AntDesign
            name="left"
            size={24}
            color="#000000"
            onPress={() => navigation.navigate("Dashboard")}
          />
        </View>
        <ScrollView>
          <View className="flex-row items-center mb-4 mt-4">
            <Image
              source={
                profile?.profileImage
                  ? { uri: profile.profileImage }
                  : require("../assets/images/pcprofile 1.png")
              }
              className="w-12 h-12 rounded-full mr-3"
            />
            <View className="flex-1">
              {profile ? (
                <Text className="text-lg mb-1">
                  {profile.firstName} {profile.lastName}
                </Text>
              ) : (
                <Text className="text-lg mb-1">Loading...</Text>
              )}
              {profile && (
                <Text className="text-sm text-gray-600">
                  {profile.phoneNumber}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={handleEditClick}>
              <Ionicons name="pencil" size={25} color="#2fcd46" />
            </TouchableOpacity>
          </View>

          <View className="h-0.5 bg-[#D2D2D2] my-2" />
          <TouchableOpacity
            onPress={() => setLanguageDropdownOpen(!isLanguageDropdownOpen)}
            className="flex-row items-center py-3"
          >
            <Ionicons name="globe-outline" size={20} color="black" />
            <Text className="flex-1 text-lg ml-2">
              {t("Profile.LanguageSettings")}
            </Text>
            <Ionicons
              name={isLanguageDropdownOpen ? "chevron-up" : "chevron-down"}
              size={20}
              color="black"
            />
          </TouchableOpacity>

          {isLanguageDropdownOpen && (
            <View className="pl-8">
              {["ENGLISH", "தமிழ்", "SINHALA"].map((language) => {
                const displayLanguage =
                  language === "SINHALA" ? "සිංහල" : language;
                return (
                  <TouchableOpacity
                    key={language}
                    onPress={() => handleLanguageSelect(language)}
                    className={`flex-row items-center py-2 px-4 rounded-lg my-1 ${
                      selectedLanguage === language ? "bg-green-200" : ""
                    }`}
                  >
                    <Text
                      className={`text-base ${
                        selectedLanguage === language
                          ? "text-black"
                          : "text-gray-700"
                      }`}
                    >
                      {displayLanguage}
                    </Text>
                    {selectedLanguage === language && (
                      <View className="absolute right-4">
                        <Ionicons name="checkmark" size={20} color="black" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View className="h-0.5 bg-[#D2D2D2] my-4" />

          <TouchableOpacity
            className="flex-row items-center py-3"
            onPress={() => navigation.navigate("EngQRcode")}
          >
            <Ionicons name="qr-code" size={20} color="black" />
            <Text className="flex-1 text-lg ml-2">{t("Profile.ViewQR")}</Text>
          </TouchableOpacity>

          <View className="h-0.5 bg-[#D2D2D2] my-4" />

          <TouchableOpacity
            className="flex-row items-center py-3"
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="person" size={20} color="black" />
            <Text className="flex-1 text-lg ml-2">
              {t("Profile.PlantCareHelp")}
            </Text>
          </TouchableOpacity>

          <View className="h-0.5 bg-[#D2D2D2] my-4" />

          <TouchableOpacity
            onPress={() => setComplaintDropdownOpen(!isComplaintDropdownOpen)}
            className="flex-row items-center py-3"
          >
            <AntDesign name="warning" size={20} color="black" />
            <Text className="flex-1 text-lg ml-2">
              {t("Profile.Complaints")}
            </Text>
            <Ionicons
              name={isComplaintDropdownOpen ? "chevron-up" : "chevron-down"}
              size={20}
              color="black"
            />
          </TouchableOpacity>

          {isComplaintDropdownOpen && (
            <View className="pl-8">
              {complaintOptions.map((complaint) => (
                <TouchableOpacity
                  key={complaint}
                  onPress={() => handleComplaintSelect(complaint)}
                  className={`flex-row items-center py-2 px-4 rounded-lg my-1 ${
                    selectedComplaint === complaint ? "bg-green-200" : ""
                  }`}
                >
                  <Text
                    className={`text-base ${
                      selectedComplaint === complaint
                        ? "text-black"
                        : "text-gray-700"
                    }`}
                  >
                    {complaint}
                  </Text>
                  {selectedComplaint === complaint && (
                    <View className="absolute right-4">
                      <Ionicons name="checkmark" size={20} color="black" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View className="h-0.5 bg-[#D2D2D2] my-4" />
          <TouchableOpacity
            className="flex-row items-center py-3"
            onPress={() => navigation.navigate("PrivacyPolicy")}
          >
            <MaterialIcons name="privacy-tip" size={20} color="black" />
            <Text className="flex-1 text-lg ml-2">
              {t("Profile.PrivacyPolicy")}
            </Text>
          </TouchableOpacity>

          <View className="h-0.5 bg-[#D2D2D2] my-4" />

          <TouchableOpacity
            className="flex-row items-center py-3"
            onPress={() => navigation.navigate("TermsConditions")}
          >
            <MaterialCommunityIcons
              name="text-box-check-outline"
              size={20}
              color="black"
            />
            <Text className="flex-1 text-lg ml-2">
              {t("Profile.Terms&Conditions")}
            </Text>
          </TouchableOpacity>

          <View className="h-0.5 bg-[#D2D2D2] my-4" />

          <TouchableOpacity
            className="flex-row items-center py-3"
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="red" />
            <Text className="flex-1 text-lg ml-2 text-red-600">
              {t("Profile.Logout")}
            </Text>
          </TouchableOpacity>

          <Modal
            transparent={true}
            visible={isModalVisible}
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
          >
            <View className="flex-1 justify-center items-center bg-black/50 bg-opacity-50">
              <View className="bg-white p-6 rounded-2xl shadow-lg w-80">
                <View className="flex-row justify-center mb-4">
                  <View className="bg-gray-200 rounded-full p-4">
                    <Image
                      source={require("../assets/images/Ring.png")}
                      className="w-16 h-16"
                    />
                  </View>
                </View>
                <Text className="text-xl font-bold text-center mb-2">
                  {t("Profile.NeedHelp")}?
                </Text>
                <Text className="text-base text-center mb-4">
                  {t("Profile.NeedPlantCareHelp")}
                </Text>
                <View className="flex-row justify-around">
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    className="bg-gray-300 p-3 rounded-2xl flex-1 mx-1 px-2"
                  >
                    <Text className="text-center">{t("Profile.Cancel")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleCall}
                    className="bg-green-500 p-3 rounded-2xl flex-1 mx-1 px-2"
                  >
                    <Text className="text-center text-white">
                      {t("Profile.Call")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default EngProfile;
