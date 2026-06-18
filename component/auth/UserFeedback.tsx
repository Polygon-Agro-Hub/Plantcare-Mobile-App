import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  BackHandler,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import CustomHeader from "../../component/common/CustomHeader";
import Checkbox from "expo-checkbox";
import { useTranslation } from "react-i18next";
import { RootStackParamList } from "../types/types";
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

    const handleGoBack = () => {
      navigation.navigate("DeleteFarmer");
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
    navigation.navigate("DeleteFarmer");
  };

  const handleDelete = async () => {
    try {
      const selectedFeedbackIds = feedbackOptions
        .filter((option) => option.selected)
        .map((option) => option.id);

      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert(
          t("Main.Error"),
          t("Main.SomethingWentWrongPleaseTryAgainlater"),
          [
            {
              text: t("Main.OK"),
              onPress: () => {
                navigation.navigate("UserFeedback");
              },
            },
          ],
        );

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
        Alert.alert(
          t("Main.Error"),
          t("Main.SomethingWentWrongPleaseTryAgainlater"),
          [{ text: t("Main.OK") }],
        );
      }
    } catch (error) {
      Alert.alert(
        t("Main.Error"),
        t("Main.SomethingWentWrongPleaseTryAgainlater"),
        [{ text: t("Main.OK") }],
      );
    }
  };

  return (
    <View className="flex-1 bg-white">
      <CustomHeader
        title={t("Feedback.Feedback")}
        navigation={navigation}
        onBackPress={handleGoBack}
        showBackButton={false}
      />
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#000000" />
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerClassName="flex-grow pb-40"
            className="bg-white"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-1 px-6">
              <View className="mt-2">
                <Text className="text-black text-lg font-semibold mb-4">
                  {t("Feedback.WhyDidYouDecideToLeaveThisApp")}
                </Text>
                <Text className="text-gray-600 leading-relaxed">
                  {t("Feedback.GiveAnOptionalFeedbackToHelpUsImprove")}
                </Text>

                <View className="mt-6 mb-2">
                  {feedbackOptions.map((option) => (
                    <View
                      key={option.id}
                      className="flex-row items-center mb-4 flex-wrap flex-1"
                    >
                      <Checkbox
                        value={option.selected}
                        onValueChange={() => handleCheckboxToggle(option.id)}
                        color={option.selected ? "#000" : "#353535"}
                        className="w-[20px] h-[20px] mr-[10px] mb-[10px]"
                      />
                      <Text className="text-black flex-1 flex-wrap">
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
            </View>
          </ScrollView>

          {/* Delete Account button matching DeleteFarmer design */}
          <View className="absolute bottom-0 left-0 right-0 bg-white px-12 py-4">
            <TouchableOpacity
              disabled={selectedCount === 0}
              onPress={handleDelete}
              activeOpacity={0.8}
              className={`w-full rounded-3xl h-[50px] justify-center items-center shadow-lg elevation-6 ${
                selectedCount === 0 ? "bg-[#9CA3AF]" : "bg-[#353535]"
              }`}
            >
              <Text className="text-white font-semibold text-center text-lg">
                {t("DeleteFarmer.DeleteAccount")}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default FeedbackScreen;
