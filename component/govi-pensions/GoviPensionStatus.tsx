import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { useTranslation } from "react-i18next";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import CustomHeader from "../common/CustomHeader";
import { RootStackParamList } from "../types/types";
import axios from "axios";
import { environment } from "../../environment/environment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LottieView from "lottie-react-native";

type GoviPensionStatusScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "GoviPensionStatus"
>;

type GoviPensionStatusScreenRouteProp = RouteProp<
  RootStackParamList,
  "GoviPensionStatus"
>;

interface GoviPensionStatusProps {
  navigation: GoviPensionStatusScreenNavigationProp;
  route: GoviPensionStatusScreenRouteProp;
}

type StatusType = "To Review" | "Approved" | "Rejected";

const GoviPensionStatus: React.FC<GoviPensionStatusProps> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const [currentStatus, setCurrentStatus] = useState<StatusType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState("en");


  useEffect(() => {
  const loadLanguage = async () => {
    const storedLang = await AsyncStorage.getItem("@user_language");
    if (storedLang) setLanguage(storedLang);
  };
  loadLanguage();
}, []);


  useEffect(() => {
    fetchPensionStatus();
  }, []);

  const fetchPensionStatus = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("userToken");

      const response = await axios.get(
        `${environment.API_BASE_URL}api/pension/pension-request/check-status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.status && response.data.reqStatus) {
        setCurrentStatus(response.data.reqStatus as StatusType);
      } else {
        navigation.navigate("Main", { screen: "Dashboard" });
      }
    } catch (error: any) {
      console.error("Error fetching pension status:", error);
      navigation.navigate("Main", { screen: "Dashboard" });
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("Main", { screen: "Dashboard" });
        return true;
      };
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      return () => backHandler.remove();
    }, [navigation]),
  );

  const getStatusConfig = () => {
    switch (currentStatus) {
      case "To Review":
        return {
          lottieSource: require("@/assets/jsons/govi-capital/stay-tuned.json"),
          title: t("GoviPensionStatus.StayTuned"),
          content: t(
            "GoviPensionStatus.WereTakingACloserLookAtYourPensionApplicationAndWillUpdateYouSoonThisProcessMightTakeAWhile",
          ),
          buttonText: t("Main.GoBack"),
          onPress: () => navigation.navigate("Main", { screen: "Dashboard" }),
          buttonStyle: "bg-[#ECECEC]",
          buttonTextColor: "text-[#8E8E8E]",
        };
      case "Approved":
        return {
          lottieSource: require("@/assets/jsons/govi-capital/congratulation.json"),
          title: t("GoviPensionStatus.Congratulations"),
          content: t(
            "GoviPensionStatus.YouAreNowEligibleForThePensionScheme",
          ),
          buttonText: t("GoviPensionStatus.ViewMyPensionAccount"),
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("userToken");
              await axios.put(
                `${environment.API_BASE_URL}api/pension/pension-request/update-first-time`,
                {},
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                },
              );
            } catch (error) {
              console.error("Error updating first time status:", error);
            } finally {
              navigation.navigate("MyPensionAccount");
            }
          },
          buttonStyle: "bg-[#353535]",
          buttonTextColor: "text-white",
        };
      case "Rejected":
        return {
          lottieSource: require("@/assets/jsons/govi-capital/request-rejected.json"),
          title: t("GoviPensionStatus.TryAgain"),
          content: t(
            "GoviPensionStatus.WereSorryToInformYouThatYourPensionRequestHasBeenRejectedPleaseFeelFreeToTryAgainInTheFuture",
          ),
          buttonText: t("Main.GoBack"),
          onPress: () => navigation.navigate("Main", { screen: "Dashboard" }),
          buttonStyle: "bg-[#ECECEC]",
          buttonTextColor: "text-[#8E8E8E]",
        };
      default:
        return {
          lottieSource: require("@/assets/jsons/govi-capital/stay-tuned.json"),
          title: t("GoviPensionStatus.Stay Tuned!"),
          content: t(
            "GoviPensionStatus.WereTakingACloserLookAtYourPensionApplicationAndWillUpdateYouSoonThisProcessMightTakeAWhile",
          ),
          buttonText: t("Main.GoBack"),
          onPress: () => navigation.navigate("Main", { screen: "Dashboard" }),
          buttonStyle: "bg-[#ECECEC]",
          buttonTextColor: "text-[#8E8E8E]",
        };
    }
  };

  const config = getStatusConfig();

  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        
        <CustomHeader
          title={t("TransactionList.GoViPension")}
          showBackButton={true}
          navigation={navigation}
          onBackPress={() =>
            navigation.navigate("Main", { screen: "Dashboard" })
          }
        />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#00A896" />
          <Text className="mt-4 text-gray-600">
            {t("GoviPensionStatus.LoadingStatus")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <CustomHeader
        title={t("TransactionList.GoViPension")}
        showBackButton={true}
        navigation={navigation}
        onBackPress={() => navigation.navigate("Main", { screen: "Dashboard" })}
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center justify-center mt-8 mb-8">
          <LottieView
            source={config.lottieSource}
            style={{ width: 200, height: 200 }}
            autoPlay
            loop
          />
        </View>

        {/* Status Title */}
        <View className="items-center mb-6">
         <Text
  className={`font-semibold text-black ${
    language === "si" || language === "ta" ? "text-2xl" : "text-4xl"
  }`}
>
  {config.title}
</Text>
        </View>

        {/* Status Content */}
        <View className="px-6 mb-10">
          <Text className="text-md text-[#4B6B87] text-center leading-7">
            {config.content}
          </Text>
        </View>

        <View className="flex-1" />
      </ScrollView>

      {/* Action Button */}
      <View className="px-6 pb-6 pt-4 bg-white">
        <TouchableOpacity
          onPress={config.onPress}
          className={`${config.buttonStyle} rounded-3xl h-[50px] justify-center `}
          activeOpacity={0.8}
        >
          <Text
            className={`${config.buttonTextColor} text-center font-bold text-lg`}
          >
            {config.buttonText}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GoviPensionStatus;
