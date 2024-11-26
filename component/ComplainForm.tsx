import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
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
import Navigationbar from "../Items/NavigationBar";
import { LanguageContext } from "@/context/LanguageContext";

type ComplainFormNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ComplainForm"
>;

interface ComplainFormProps {
  navigation: ComplainFormNavigationProp;
}

const ComplainForm: React.FC<ComplainFormProps> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );
  const [complain, setComplain] = useState<string>("");
  const [authToken, setAuthToken] = useState<string | null>(null); 
  // const { changeLanguage } = useContext(LanguageContext);
  const [language, setLanguage] = useState("en");
  const { t } = useTranslation();
   

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
    if (!selectedCategory || !complain) {
      Alert.alert(t("Main.error"), t("ReportComplaint.fillAllFields"));
      return;
    }

    const storedLanguage = await AsyncStorage.getItem("@user_language");
    if (storedLanguage) {
      setLanguage(storedLanguage);
      
    }
    console.log(storedLanguage)
    console.log(selectedCategory, complain, authToken, storedLanguage)

    try {
      const response = await axios.post(
        `${environment.API_BASE_URL}api/complain/add-complain`,
        {
          language: storedLanguage,
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
        Alert.alert(t("ReportComplaint.success"), t("ReportComplaint.complaintSuccess"));
        navigation.goBack();
      } else {
        Alert.alert(t("ReportComplaint.failed"), t("ReportComplaint.complaintFailed"));
      }
    } catch (error) {
      Alert.alert(t("Main.error"),t("Main.somethingWentWrong"));
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#F9F9FA]"
      
    >
      <View className=" absolute">
        <AntDesign
          name="left"
          size={24}
          color="#000000"
          onPress={() => navigation.goBack()}
          style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
        />
      </View>

      <View className="items-center p-2 ">
        <Image
          source={require("../assets/images/complain1.png")} 
          className="w-36 h-36 "
          resizeMode="contain"
        />

        <View className="w-[90%] items-center p-6 shadow-2xl bg-[#FFFFFF] rounded-xl">
          <View className="flex-row ">
            <Text className="text-2xl font-semibold text-center mb-4 color-[#424242]">
              {t("ReportComplaint.Tellus")}
            </Text>
            <Text className="text-2xl font-semibold text-center mb-4 pl-2 color-[#D72C62]">
              {t("ReportComplaint.Problem")}
            </Text>
          </View>

          <View className="w-full border border-gray-300 rounded-lg bg-white mb-4">
            <Picker
              selectedValue={selectedCategory}
              onValueChange={(itemValue) => setSelectedCategory(itemValue)}
            >
              <Picker.Item label={t("Select Complain Category")} value="" />
              <Picker.Item label="Finance" value="Finance" />
              <Picker.Item label="Collection" value="Collection" />
              <Picker.Item label="Agro Input Supplier" value="Agro Input Supplier" />
              
            </Picker>
          </View>

          <Text className="text-sm text-gray-600 text-center mb-4">
            {t("We will respond to you within two days of receiving your message.")}
          </Text>

          <TextInput
            className="w-full h-52 border border-gray-300 rounded-lg p-3 bg-white mb-8 text-gray-800 "
            placeholder={t("Kindly submit your complain here..")}
            multiline
            value={complain}
            onChangeText={(text) => setComplain(text)}
            style={{ textAlignVertical: 'top' }}
          />

          <TouchableOpacity
            className="w-full bg-gray-800 py-4 rounded-lg items-center"
            onPress={handleSubmit}
          >
            <Text className="text-white font-bold text-lg">
              {t("Submit")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="absolute bottom-0  w-full" style={{ width: "100%" }} >
        <Navigationbar navigation={navigation} />
      </View>
    </SafeAreaView>
  );
};

export default ComplainForm;
