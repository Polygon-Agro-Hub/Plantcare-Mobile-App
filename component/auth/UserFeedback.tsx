import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  BackHandler,
  ActivityIndicator,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";
import CustomHeader from "../../component/common/CustomHeader";
import Checkbox from "expo-checkbox";
import { useTranslation } from "react-i18next";
import { RootStackParamList } from "../types/types";
import { environment } from "@/environment/environment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "@/i18n/i18n";

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
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackOptions, setFeedbackOptions] = useState<FeedbackOption[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("DeleteFarmer");
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [navigation]),
  );

  useEffect(() => {
    const fetchFeedback = async () => {
      setIsLoading(true);
      try {
        const selectedLanguage = t("Main.LNG");
        setLanguage(selectedLanguage);
        const token = await AsyncStorage.getItem("userToken");

        if (!token) {
          setIsLoading(false);
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
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const data = await response.json();

        setFeedbackOptions(
          data.feedbackOptions.map((item: any) => ({
            id: item.id,
            feedbackEnglish: item.feedbackEnglish,
            feedbackSinahala: item.feedbackSinahala,
            feedbackTamil: item.feedbackTamil,
            selected: false,
          })),
        );
      } catch (error) {
        console.error("Error fetching feedback options:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  const handleCheckboxToggle = (id: string) => {
    setFeedbackOptions((prevOptions) =>
      prevOptions.map((option) => {
        if (option.id === id) {
          const newSelected = !option.selected;
          setSelectedCount((prevCount) =>
            newSelected ? prevCount + 1 : prevCount - 1,
          );
          return { ...option, selected: newSelected };
        }
        return option;
      }),
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
        Alert.alert(t("Main.Error"), t("Main.SomethingWentWrongPleaseTryAgainlater"), [
          {
            text: t("Main.OK"),
            onPress: () => {
              navigation.navigate("UserFeedback");
            },
          },
        ]);

        return;
      }

      const response = await fetch(
        `${environment.API_BASE_URL}api/auth/user-delete`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ feedbackIds: selectedFeedbackIds }),
        },
      );

      if (response.ok) {
        await AsyncStorage.removeItem("userToken");
        await AsyncStorage.clear();
        Alert.alert(t("Main.Success"), t("Feedback.DeleteSuccessThankYou"), [
          {
            text: t("Main.OK"),
            onPress: () => {
              navigation.navigate("Lanuage");
            },
          },
        ]);
        navigation.navigate("Lanuage");
      } else {
        Alert.alert(t("Main.Error"), t("Main.SomethingWentWrongPleaseTryAgainlater"), [
          { text: t("Main.OK") },
        ]);
      }
    } catch (error) {
      Alert.alert(t("Main.Error"), t("Main.SomethingWentWrongPleaseTryAgainlater"), [
        { text: t("Main.OK") },
      ]);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-white">
      <CustomHeader
        title={t("Feedback.Feedback")}
        navigation={navigation}
        onBackPress={handleGoBack}
      />

      <View className="flex-1  px-4">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#000000" />
          </View>
        ) : (
          <>
            <View className="mt-2">
              <Text
                className="text-black text- font-semibold mb-4"
                style={[
                  i18n.language === "si"
                    ? { fontSize: 17 }
                    : i18n.language === "ta"
                      ? { fontSize: 16 }
                      : { fontSize: 19 },
                ]}
              >
                {t("Feedback.WhyDidYouDecideToLeaveThisApp")}
              </Text>
              <Text className="text-gray-600 leading-relaxed">
                {t("Feedback.GiveAnOptionalFeedbackToHelpUsImprove")}
              </Text>

              <View className="mt-6 mb-2">
                {feedbackOptions.map((option) => (
                  <View
                    key={option.id}
                    className="flex-row items-center mb-4"
                    style={{ flexWrap: "wrap", flex: 1 }}
                  >
                    <Checkbox
                      value={option.selected}
                      onValueChange={() => handleCheckboxToggle(option.id)}
                      color={option.selected ? "#000" : "#353535"}
                      style={{
                        width: 20,
                        height: 20,
                        marginRight: 10,
                        marginBottom: 10,
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

            <View className=" bottom-0 left-0 right-0  px-6 py-4 mb-8 ">
              <TouchableOpacity
                className={`${selectedCount === 0
                    ? "bg-gray-400 rounded-full py-3 w-full"
                    : "bg-black rounded-full py-3 w-full"
                  }`}
                disabled={selectedCount === 0}
                onPress={handleDelete}
                style={{
                  shadowColor: "#000000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                <Text className="text-center text-white text-base font-semibold">
                  {t("Feedback.Done")}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default FeedbackScreen;
