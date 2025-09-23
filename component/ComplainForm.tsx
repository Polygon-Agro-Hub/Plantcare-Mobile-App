import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { environment } from "@/environment/environment";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { AntDesign } from "@expo/vector-icons";
import { ScrollView } from "react-native-gesture-handler";
import DropDownPicker from "react-native-dropdown-picker";
import { set } from "lodash";
import { use } from "i18next";
import { useFocusEffect } from "@react-navigation/native";
import LottieView from "lottie-react-native"; 

type ComplainFormNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ComplainForm"
>;

interface ComplainFormProps {
  navigation: ComplainFormNavigationProp;
}

const ComplainForm: React.FC<ComplainFormProps> = ({ navigation }) => {
  const [complain, setComplain] = useState<string>("");
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [language, setLanguage] = useState("en");
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [Category, setCategory] = useState<{ value: string; label: string }[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer); // Cleanup the timer
  }, []);


         useFocusEffect(
            React.useCallback(() => {
              const onBackPress = () => {
                navigation.navigate("EngProfile");
                return true; // Prevent default back action
              };
          
                  const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
                   
                       return () => subscription.remove();
            }, [navigation])
          );
          
  useEffect(() => {
    const selectedLanguage = t("ReportComplaint.LNG");
    setLanguage(selectedLanguage);
    console.log("slect", selectedLanguage);
    const fetchComplainCategory = async () => {
      try {
        const response = await axios.get(
          `${environment.API_BASE_URL}api/complain/get-complain-category`
        );
        if (response.data.status === "success") {
          console.log(response.data.data);

          // Determine which language field to use
          const categoryField =
            selectedLanguage === "en"
              ? "categoryEnglish"
              : selectedLanguage === "si"
              ? "categorySinhala"
              : selectedLanguage === "ta"
              ? "categoryTamil"
              : "categoryEnglish";

          const mappedCategories = response.data.data
            .map((item: any) => {
              const categoryValue =
                item[categoryField] || item["categoryEnglish"];
              return {
                value: item.id,
                label: categoryValue,
              };
            })
            .filter((item: { value: any }) => item.value);

          setCategory(mappedCategories);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchComplainCategory();
  }, [t]);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          setAuthToken(token);
        }
      } catch (error) {
        console.error(t("PublicForum.tokenFetchFailed"), error);
      }
    };

    fetchToken();
  }, []);

  const handleSubmit = async () => {

    console.log("selectedCategory", selectedCategory);
    if (!selectedCategory || !complain) {
      Alert.alert(
        t("ReportComplaint.sorry"),
        t("ReportComplaint.fillAllFields"),
         [{ text:  t("PublicForum.OK") }]
      );
      return;
    }

    const storedLanguage = await AsyncStorage.getItem("@user_language");
    if (storedLanguage) {
      setLanguage(storedLanguage);
    }
    setIsLoading(true);
    console.log(storedLanguage)
    let farmerLanguage ;
    if (storedLanguage === "en") {
      farmerLanguage = "English";
    } else if (storedLanguage === "si") {
      farmerLanguage = "Sinhala";
    } else if (storedLanguage === "ta") {
      farmerLanguage = "Tamil";
    } else {
      farmerLanguage = "English"; // Default language
    }

    try {
      const response = await axios.post(
        `${environment.API_BASE_URL}api/complain/add-complain`,
        {
          language: farmerLanguage,
          category: selectedCategory,
          complain: complain,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      if (response.data.status === "success") {
        Alert.alert(
          t("ReportComplaint.success"),
          t("ReportComplaint.complaintSuccess"),
           [{ text:  t("PublicForum.OK") }]
        );
        setIsLoading(false);
        navigation.navigate("Main", { screen: "ComplainHistory" });
      } else {
        Alert.alert(
          t("ReportComplaint.sorry"),
          t("ReportComplaint.complaintFailed"),
           [{ text:  t("PublicForum.OK") }]
        );
        setIsLoading(false);
      }
    } catch (error) {
      Alert.alert(t("Main.error"), t("Main.somethingWentWrong"), [{ text:  t("PublicForum.OK") }]);
      setIsLoading(false);
    }
  };

  // const category = [
  //   {
  //     value: "Finance",
  //     label:t("ReportComplaint.Finance")
  //   },
  //   {
  //     value: "Agriculture",
  //     label:t("ReportComplaint.Agriculture")
  //   },
  //   {
  //     label:t("ReportComplaint.Call Center"),
  //     value:"Call Center"
  //   },
  //   {
  //     label:t("ReportComplaint.Procuiment"),
  //     value:"Procuiment"
  //   },
  //   {
  //     label:t("ReportComplaint.Other"),
  //     value:"Other"
  //   }
  // ];

  function dismissKeyboard(): void {
    throw new Error("Function not implemented.");
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      enabled
      style={{ flex: 1, backgroundColor: "#F9F9FA" }}
    >

      {loading ? (
          // Lottie Loader displays for 2 seconds
          <View className="flex-1 justify-center items-center">
            <LottieView
              source={require('../assets/jsons/loader.json')}
              autoPlay
              loop
              style={{ width: 300, height: 300 }}
            />
          </View>
        ) : (
        <>       
            <ScrollView className="flex-1  " keyboardShouldPersistTaps="handled">
                 <View className="flex-row items-center justify-between " style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }} >
                  <TouchableOpacity  onPress={() => navigation.navigate("EngProfile")}>
                    <AntDesign name="left" size={22} color="black" style={{ paddingHorizontal: wp(3), paddingVertical: hp(1.5), backgroundColor: "#fff" , borderRadius: 50 }}/>
                  </TouchableOpacity>
                  <View style={{ width: 22 }} /> {/* Placeholder to balance the header */}
                </View>
                <View className="items-center p-2 pb-20 -mt-10">
                  <Image
                    source={require("../assets/images/complain1.webp")}
                    className="w-36 h-36 "
                    resizeMode="contain" />

                  <View className="w-[90%] items-center p-6 shadow-2xl bg-[#FFFFFF] rounded-xl mb-20">
                    <View className="flex-row ">
                      <Text className="text-2xl font-semibold text-center mb-4 color-[#424242]">
                        {t("ReportComplaint.Tellus")}
                      </Text>
                      <Text className="text-2xl font-semibold text-center mb-4 pl-2 color-[#D72C62]">
                        {t("ReportComplaint.Problem")}
                      </Text>
                    </View>

                    <View className="w-full rounded-lg mb-4">
                      {Category.length > 0 && (
                        <DropDownPicker
                          open={open}
                          value={selectedCategory} // Assuming complain value is for category
                          setOpen={setOpen}
                          setValue={setSelectedCategory} // Here it updates the complain value, which represents the selected category
                          items={Category.map((item) => ({
                            label: t(item.label), // Apply translation here
                            value: item.value, // Keep the value as it is from Category
                          }))}
                          placeholder={t("ReportComplaint.selectCategory")}
                          placeholderStyle={{ color: "#d1d5db" }}
                          listMode="SCROLLVIEW"
                          zIndex={3000}
                          zIndexInverse={1000}
                          dropDownContainerStyle={{
                            borderColor: "#ccc",
                            borderWidth: 1,
                          }}
                          style={{
                            borderWidth: 1,
                            borderColor: "#ccc",
                            paddingHorizontal: 8,
                            paddingVertical: 10,
                          }}
                          textStyle={{ fontSize: 12 }}
                          onOpen={dismissKeyboard} />
                      )}
                    </View>

                    <Text className="text-sm text-gray-600 text-center mb-4">
                      {t("ReportComplaint.WewilRespond")}
                    </Text>

                    <TextInput
                      className="w-full h-52 border border-gray-300 rounded-lg p-3 bg-white mb-8 text-gray-800 "
                      placeholder={t("ReportComplaint.Kindlysubmit")}
                      multiline
                      value={complain}
                      onChangeText={(text) => setComplain(text)}
                      onFocus={() => setOpen(false)}
                      style={{ textAlignVertical: "top" }} />

                    <TouchableOpacity
                      className="w-full bg-gray-800 py-4 rounded-lg items-center  "
                      onPress={handleSubmit}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text className="text-white font-bold text-lg">
                          {t("ReportComplaint.Submit")}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView></>
        )}
    </KeyboardAvoidingView>
  );
};

export default ComplainForm;
