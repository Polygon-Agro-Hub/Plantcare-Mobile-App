import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from "react-native";
import LottieView from "lottie-react-native";
import { useTranslation } from "react-i18next";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../types/types";
import CustomHeader from "../common/CustomHeader";

type RequestReviewNavigationProp = StackNavigationProp<
  RootStackParamList,
  "RequestReview"
>;

type RequestReviewRouteProp = RouteProp<RootStackParamList, "RequestReview">;

interface RequestReviewProps {
  navigation: RequestReviewNavigationProp;
  route: RequestReviewRouteProp;
}

const RequestReview: React.FC<RequestReviewProps> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { request, status } = route.params || {};

  const requestStatus =
    status?.toLowerCase() || request?.reqStatus?.toLowerCase() || "pending";

  const getStatusConfig = () => {
    switch (requestStatus) {
      case "approved":
        return {
          icon: "star-circle",
          iconColor: "#FFD700",
          bgColor: "#FFF9E6",
          title: t("Govicapital.Congratulations"),
          message: t(
            "Govicapital.YourProjectHasBeenSuccessfullyPublishedOnTheGoViCapitalPlatform",
          ),
          showSecondButton: true,
          secondButtonText: t("Govicapital.ViewProjectStatus"),
          animation: "stars",
        };
      case "rejected":
        return {
          icon: "alert-circle",
          iconColor: "#FF6B6B",
          bgColor: "#FFE8E8",
          title: t("Govicapital.TryAgain"),
          message: t(
            "Govicapital.WereSorryToInformYouThatYourProjectRequestToGoViCapitalHasBeenDeclinedPleaseFeelFreeToTryAgainInTheFuture",
          ),
          showSecondButton: false,
          animation: "warning",
        };
      default:
        return {
          icon: "clock-outline",
          iconColor: "#FFA500",
          bgColor: "#FFF4E6",
          title: t("Govicapital.StayTuned"),
          message: t(
            "Govicapital.WereTakingACloserLookAtYourRequestAndWillUpdateYouSoonThisProcessMightTakeADayOrTwo",
          ),
          showSecondButton: false,
          animation: "hourglass",
        };
    }
  };

  const statusConfig = getStatusConfig();

  const handleViewDetails = () => {
    navigation.navigate("ViewInvestmentRequestLetter", { request });
  };

  const handleViewProjectStatus = () => {
    navigation.navigate("ProjectStatus", {
      jobid: request?.jobId,
      id: request?.id,
    });
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <CustomHeader
        title={`#${request?.jobId || t("Govicapital.RequestReview")}`}
        navigation={navigation}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 items-center justify-center px-6 py-8">
          <View
            className="w-48 h-48 rounded-full items-center justify-center mb-8"
            style={{ backgroundColor: statusConfig.bgColor }}
          >
            {requestStatus === "approved" && (
              <View className="items-center justify-center">
                <LottieView
                  source={require("@/assets/jsons/govi-capital/congratulation.json")}
                  style={{ width: 200, height: 200 }}
                  autoPlay
                  loop
                />
              </View>
            )}

            {requestStatus === "rejected" && (
              <View className=" items-center justify-center">
                <LottieView
                  source={require("@/assets/jsons/govi-capital/request-rejected.json")}
                  style={{ width: 200, height: 200 }}
                  autoPlay
                  loop
                />
              </View>
            )}

            {(requestStatus === "pending" ||
              requestStatus === "under_review") && (
              <LottieView
                source={require("@/assets/jsons/govi-capital/stay-tuned.json")}
                style={{ width: 200, height: 200 }}
                autoPlay
                loop
              />
            )}
          </View>

          {/* Title */}
          <Text className="text-2xl font-bold text-gray-900 mb-4 text-center">
            {statusConfig.title}
          </Text>

          {/* Message */}
          <Text className="text-base text-[#4B6B87] text-center leading-6 mb-2 px-4">
            {statusConfig.message}
          </Text>

          {/* Buttons */}
          <View className="w-full mt-8 px-4">
            <TouchableOpacity
              onPress={handleViewDetails}
              activeOpacity={0.7}
              className="w-full bg-[#ECECEC] rounded-full py-4 mb-3"
            >
              <Text className="text-center text-[#8E8E8E] font-semibold text-base">
                {t("Govicapital.ViewFullDetails")}
              </Text>
            </TouchableOpacity>

            {statusConfig.showSecondButton && (
              <TouchableOpacity
                onPress={handleViewProjectStatus}
                activeOpacity={0.7}
                className="w-full bg-[#353535] rounded-full py-4"
              >
                <Text className="text-center text-white font-semibold text-base">
                  {statusConfig.secondButtonText}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default RequestReview;
