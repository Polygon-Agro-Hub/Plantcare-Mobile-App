import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";
import AntDesign from "react-native-vector-icons/AntDesign";
import Checkbox from "expo-checkbox";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTranslation } from "react-i18next";
import { RootStackParamList } from "./types";
import { environment } from "@/environment/environment";
import AsyncStorage from "@react-native-async-storage/async-storage";

type FeedbackScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "UserFeedback"
>;

type FeedbackScreenRouteProp = RouteProp<RootStackParamList, "UserFeedback">;

interface FeedbackScreenProps {
  navigation: FeedbackScreenNavigationProp;
  route: FeedbackScreenRouteProp;
}

interface FeedbackOption {
  id: string;
  feedbackEnglish: string;
  feedbackSinahala: string;
  feedbackTamil: string;
  selected: boolean;
}

const FeedbackScreen: React.FC<FeedbackScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [language, setLanguage] = useState("en");
  const [selectedCount, setSelectedCount] = useState(0);

  const [feedbackOptions, setFeedbackOptions] = useState<FeedbackOption[]>([]);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const selectedLanguage = t("Feedback.LNG");
      setLanguage(selectedLanguage);
        const token = await AsyncStorage.getItem("userToken");

        if (!token) {
          console.log("User is not authenticated. Token missing.");
          return;
        }

        const response = await fetch(
          `${environment.API_BASE_URL}api/auth/user-feedback-options`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const data = await response.json(); 
        console.log("Feedback options:", data);
        setFeedbackOptions(
          data.feedbackOptions.map((item: any) => ({
            id: item.id,
            feedbackEnglish: item.feedbackEnglish,
            feedbackSinahala: item.feedbackSinahala,
            feedbackTamil: item.feedbackTamil,
            selected: false, 
          }))
        );

      } catch (error) {
        console.error("Error fetching feedback options:", error);
      } finally {
      }
    };

    fetchFeedback();
  }, []);

  // const handleCheckboxToggle = (id: string) => {
  //   setFeedbackOptions((prevOptions) =>
  //     prevOptions.map((option) =>
  //       option.id === id ? { ...option, selected: !option.selected } : option
  //     )
  //   );
  // };

  const handleCheckboxToggle = (id: string) => {
    setFeedbackOptions((prevOptions) =>
      prevOptions.map((option) => {
        if (option.id === id) {
          const newSelected = !option.selected;
          setSelectedCount((prevCount) =>
            newSelected ? prevCount + 1 : prevCount - 1
          );
          return { ...option, selected: newSelected };
        }
        return option;
      })
    );
  };
  

  const handleGoBack = () => {
    navigation.goBack();
  };


  const handleDelete = async () => {
      try {

        const selectedFeedbackIds = feedbackOptions
        .filter((option) => option.selected)
        .map((option) => option.id);

        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
          navigation.navigate("Lanuage"); 
          return;
        }
  
        const response = await fetch(`${environment.API_BASE_URL}api/auth/user-delete`, {
          method: "DELETE", 
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ feedbackIds: selectedFeedbackIds }),

        });
  
        if (response.ok) {
          await AsyncStorage.removeItem("userToken"); 
          await AsyncStorage.clear();
          Alert.alert(t("BankDetails.success"), t("Feedback.successMessage"))
          navigation.navigate("Lanuage")
    
        } else {
          Alert.alert(t("Main.error"),  t("Main.somethingWentWrong"));
        }
      } catch (error) {
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
      }
    };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      className="bg-white"
      style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
    >
      {/* Header */}
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={handleGoBack}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <AntDesign name="left" size={24} color="#000502" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-black text-xl font-bold">
            {t("Feedback.title")}
          </Text>
        </View>
      </View>

      <View className="flex-1 p-3 mt-4">
        <View className="mt-8">
          <Text className="text-black text-xl font-semibold mb-4">
          {t("Feedback.whyLeave")}
                    </Text>
          <Text className="text-gray-600 leading-relaxed">
          {t("Feedback.optionalFeedback")}
          </Text>

          <View className="mt-6">
            {feedbackOptions.map((option) => (
              <View
                key={option.id}
                className="flex-row items-center mb-4"
                style={{ flexWrap: "wrap", flex: 1 }} 
              >
                <Checkbox
                  value={option.selected}
                  onValueChange={() => handleCheckboxToggle(option.id)}
                  color={option.selected ? "#000" : '#353535'}
                  style={{
                    width: 20,
                    height: 20,
                    marginRight: 10,
                    marginBottom:10
                  }}
                />
                <Text
                  className="text-black"
                  style={{
                    flex: 1, 
                    flexWrap: "wrap", 
                  }}
                >
                 {language === "si"
                    ? option.feedbackSinahala
                    : language === "ta"
                    ? option.feedbackTamil
                    : option.feedbackEnglish}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Buttons */}
        <View className="absolute bottom-0 left-0 right-0 bg-white px-6 py-4">
          <TouchableOpacity
          //  className="bg-black rounded-full py-3 w-full"
          className={`${
            selectedCount === 0
              ? "bg-gray-400 rounded-full py-3 w-full"
              : "bg-black rounded-full py-3 w-full"
          }`}
          disabled={selectedCount === 0}
          onPress={handleDelete}
          >
            <Text className="text-center text-white text-base font-semibold">
              {t("Feedback.doneButton")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default FeedbackScreen;
