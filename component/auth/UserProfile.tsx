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
  ScrollView,
} from "react-native";
import {
  AntDesign,
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "@/context/LanguageContext";
import { useFocusEffect } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { selectUserPersonal, selectUserData } from "@/store/userSlice";
import { setUserPersonalData } from "../../store/userSlice";
import CustomHeader from "../common/CustomHeader";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

type UserProfileNavigationProp = StackNavigationProp<
  RootStackParamList,
  "EngProfile" | "LabororEngProfile"
>;

interface UserProfileProps {
  navigation: UserProfileNavigationProp;
}

const UserProfile: React.FC<UserProfileProps> = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const userData = useSelector(selectUserData);
  const isLaborer =
    userData?.role === "Laborer" || userData?.role === "Laboror";

  const [isLanguageDropdownOpen, setLanguageDropdownOpen] =
    useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(
    null,
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
    farmId?: number;
    farmName?: string;
    NICnumber?: string;
  } | null>(null);
  const { changeLanguage } = useContext(LanguageContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const userPersonalData = useSelector(selectUserPersonal);

  useFocusEffect(
    React.useCallback(() => {
      setProfile({
        firstName: userPersonalData?.firstName || "",
        lastName: userPersonalData?.lastName || "",
        phoneNumber: userPersonalData?.phoneNumber || "",
        id: userPersonalData?.id || 0,
        profileImage: userPersonalData?.profileImage || "",
        farmId: userPersonalData?.farmId || 0,
        farmName: userPersonalData?.farmName || "",
        NICnumber: userPersonalData?.NICnumber || "",
      });
      if (i18n.language === "en") {
        setSelectedLanguage("ENGLISH");
      } else if (i18n.language === "si") {
        setSelectedLanguage("SINHALA");
      } else if (i18n.language === "ta") {
        setSelectedLanguage("TAMIL");
      }
      return () => {
        setModalVisible(false);
      };
    }, [userPersonalData, i18n.language]),
  );

  const complaintOptions = [
    t("Profile.ReportComplaint"),
    t("Profile.ViewComplaintHistory"),
  ];

  const handleComplaintSelect = (complaint: string) => {
    setComplaintDropdownOpen(false);

    if (complaint === t("Profile.ReportComplaint")) {
      navigation.navigate("Main", { screen: "ComplainForm" });
    } else if (complaint === t("Profile.ViewComplaintHistory")) {
      navigation.navigate("Main", { screen: "ComplainHistory" });
    }
  };

  useEffect(() => {
    const handleBackPress = () => {
      if (isLaborer) {
        navigation.navigate("Main" as any);
      } else {
        navigation.navigate("Main", { screen: "Dashboard" });
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress,
    );

    return () => {
      backHandler.remove();
    };
  }, [isLaborer]);

  const handleCall = () => {
    const phoneNumber = "+94770111999";
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url).catch((err) =>
      Alert.alert(
        t("Main.Error"),
        t("Profile.UnableToOpenTheDialerPleaseTryAgain"),
        [{ text: t("Main.OK") }],
      ),
    );
  };

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

  const handleEditClick = () => {
    navigation.navigate("Main", { screen: "EditProfile" });
  };

  const HanldeAsynStorage = async (lng: string) => {
    await AsyncStorage.setItem("@user_language", lng);
  };

  const handleLanguageSelect = async (language: string) => {
    setIsLoading(true);
    setSelectedLanguage(language);
    setLanguageDropdownOpen(false);
    try {
      if (language === "ENGLISH") {
        LanguageSelect("en");
        HanldeAsynStorage("en");
        setIsLoading(false);
      } else if (language === "தமிழ்") {
        LanguageSelect("ta");
        HanldeAsynStorage("ta");
        setIsLoading(false);
      } else if (language === "SINHALA") {
        LanguageSelect("si");
        HanldeAsynStorage("si");
        setIsLoading(false);
      }
    } catch (error) {}
  };

  const LanguageSelect = async (language: string) => {
    try {
      await AsyncStorage.setItem("@user_language", language);
      changeLanguage(language);
    } catch (error) {}
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-lg">
          {isLaborer ? t("Loading...") : t("Main.Loading...")}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white ">
      {isLaborer ? (
        <View className="absolute pb-5 mt-2 pl-4 z-50">
          <AntDesign
            name="left"
            size={24}
            color="#000000"
            onPress={() => navigation.navigate("Main" as any)}
            style={{
              paddingHorizontal: wp(3),
              paddingVertical: hp(1.5),
              backgroundColor: "#F6F6F680",
              borderRadius: 50,
            }}
          />
        </View>
      ) : (
        <CustomHeader
          title=""
          showBackButton={true}
          navigation={navigation}
          onBackPress={() =>
            navigation.navigate("Main", { screen: "Dashboard" })
          }
        />
      )}
      <View className={`flex-1 bg-white px-6`}>
        <ScrollView
          className={isLaborer ? "p-2" : "py-2"}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={isLaborer ? undefined : { paddingBottom: 40 }}
        >
          <View
            className={`flex-row items-center mb-4 ${isLaborer ? "mt-10" : ""}`}
          >
            <Image
              source={
                profile?.profileImage
                  ? { uri: profile.profileImage }
                  : require("../../assets/images/auth/profile.webp")
              }
              className={`${isLaborer ? "w-12 h-12" : "w-16 h-16"} rounded-full mr-3`}
            />
            <View className="flex-1">
              {profile ? (
                <Text className="text-lg mb-1">
                  {profile.firstName} {profile.lastName}
                </Text>
              ) : (
                <Text className="text-lg mb-1">
                  {isLaborer ? "Loading..." : t("Main.Loading...")}
                </Text>
              )}
              {profile && (
                <Text className="text-sm text-gray-600">
                  {profile.phoneNumber}
                </Text>
              )}
            </View>
            {!isLaborer && (
              <TouchableOpacity onPress={handleEditClick}>
                <Image
                  source={require("../../assets/images/common/square-pen-solid.webp")}
                  className="w-7 h-7 "
                />
              </TouchableOpacity>
            )}
          </View>

          <View className="h-0.5 bg-[#D2D2D2] my-2" />
          <TouchableOpacity
            onPress={() => setLanguageDropdownOpen(!isLanguageDropdownOpen)}
            className="flex-row items-center py-3"
          >
            <Ionicons
              name="globe-outline"
              size={20}
              color={isLaborer ? "black" : "#434343"}
            />
            <Text
              className={`flex-1 text-lg ml-2 ${isLaborer ? "" : "text-[#434343]"}`}
            >
              {t("Profile.LanguageSettings")}
            </Text>
            {isLaborer ? (
              <MaterialIcons
                name={
                  isLanguageDropdownOpen ? "arrow-drop-up" : "arrow-drop-down"
                }
                size={24}
                color="black"
              />
            ) : (
              <MaterialIcons
                name={
                  isLanguageDropdownOpen ? "arrow-drop-up" : "arrow-drop-down"
                }
                size={24}
                color="#666"
              />
            )}
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
                      selectedLanguage === language ? "bg-[#E6FFFB]" : ""
                    }`}
                  >
                    <Text
                      className={`text-base ${
                        selectedLanguage === language
                          ? "text-black"
                          : isLaborer
                            ? "text-gray-700"
                            : "text-[#434343]"
                      }`}
                    >
                      {displayLanguage}
                    </Text>
                    {selectedLanguage === language && (
                      <View className="absolute right-4">
                        <Ionicons name="checkmark" size={20} color="#00A896" />
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
            onPress={() =>
              isLaborer
                ? navigation.navigate("OwnerQRcode")
                : navigation.navigate("Main", { screen: "QRcode" })
            }
          >
            <Ionicons
              name="qr-code"
              size={20}
              color={isLaborer ? "black" : "#434343"}
            />
            <Text
              className={`flex-1 text-lg ml-2 ${isLaborer ? "" : "text-[#434343]"}`}
            >
              {isLaborer ? t("Profile.ViewQRCode") : t("Profile.ViewMyQR")}
            </Text>
          </TouchableOpacity>

          <View className="h-0.5 bg-[#D2D2D2] my-4" />

          <TouchableOpacity
            className="flex-row items-center py-3"
            onPress={() => setModalVisible(true)}
          >
            <Ionicons
              name="person"
              size={20}
              color={isLaborer ? "black" : "#434343"}
            />
            <Text
              className={`flex-1 text-lg ml-2 ${isLaborer ? "" : "text-[#434343]"}`}
            >
              {t("Profile.GoViCareHelp")}
            </Text>
          </TouchableOpacity>

          {!isLaborer && (
            <>
              <View className="h-0.5 bg-[#D2D2D2] my-4" />

              <TouchableOpacity
                onPress={() =>
                  setComplaintDropdownOpen(!isComplaintDropdownOpen)
                }
                className="flex-row items-center py-3"
              >
                <AntDesign name="warning" size={20} color="#434343" />
                <Text className="flex-1 text-lg ml-2 text-[#434343]">
                  {t("Profile.Complaints")}
                </Text>
                <MaterialIcons
                  name={
                    isLanguageDropdownOpen ? "arrow-drop-up" : "arrow-drop-down"
                  }
                  size={24}
                  color="#666"
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
                            : "text-[#434343]"
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
            </>
          )}

          <View className="h-0.5 bg-[#D2D2D2] my-4" />
          <TouchableOpacity
            className="flex-row items-center py-3"
            onPress={() => navigation.navigate("PrivacyPolicy")}
          >
            <MaterialIcons
              name="privacy-tip"
              size={20}
              color={isLaborer ? "black" : "#434343"}
            />
            <Text
              className={`flex-1 text-lg ml-2 ${isLaborer ? "" : "text-[#434343]"}`}
            >
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
              color={isLaborer ? "black" : "#434343"}
            />
            <Text
              className={`flex-1 text-lg ml-2 ${isLaborer ? "" : "text-[#434343]"}`}
            >
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
              <View className="bg-white p-6 rounded-2xl shadow-lg w-11/12">
                <View className="flex-row justify-center mb-4">
                  <View className=" rounded-full p-4">
                    <Image
                      source={require("../../assets/images/common/phone call.webp")}
                      className="w-20 h-20"
                    />
                  </View>
                </View>
                <Text className="text-xl font-bold text-center mb-2">
                  {t("Profile.NeedHelp")}?
                </Text>
                <Text className="text-base text-center mb-8">
                  {t(
                    "Profile.NeedGoViCareHelpTapTheCallButtonForInstantSupport",
                  )}
                </Text>
                <View className="flex-row justify-around">
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    className="bg-gray-300 p-3 rounded-full flex-1 mx-1 px-2 items-center justify-center"
                  >
                    <Text className="text-center">{t("Main.Cancel")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleCall}
                    className="bg-[#00A896] p-3 rounded-full flex-1 mx-1 px-2 items-center justify-center"
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
    </View>
  );
};

export default UserProfile;
