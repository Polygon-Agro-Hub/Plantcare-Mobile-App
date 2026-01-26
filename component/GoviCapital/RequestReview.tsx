import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from "react-native";

import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import LottieView from "lottie-react-native";
import { useTranslation } from "react-i18next";

interface RequestReviewProps {
  navigation: any;
  route: {
    params: {
      request: any;
      status: string;
    };
  };
}

const RequestReview: React.FC<RequestReviewProps> = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const { request, status } = route.params || {};

  // Determine which status to display
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
            "Govicapital.Your project has been successfully published on the GoViCapital platform",
          ),
          showSecondButton: true,
          secondButtonText: t("Govicapital.View Project Status"),
          animation: "stars", // You can use Lottie animation
        };
      case "rejected":
        return {
          icon: "alert-circle",
          iconColor: "#FF6B6B",
          bgColor: "#FFE8E8",
          title: t("Govicapital.Try Again"),
          message: t(
            "Govicapital.We're sorry to inform you that your project request to GoViCapital has been declined",
          ),
          showSecondButton: false,
          animation: "warning",
        };
      default: // pending, under_review
        return {
          icon: "clock-outline",
          iconColor: "#FFA500",
          bgColor: "#FFF4E6",
          title: t("Govicapital.Stay Tuned"),
          message: t(
            "Govicapital.We're taking a closer look at your request and will update you soon",
          ),
          showSecondButton: false,
          animation: "hourglass",
        };
    }
  };

  const statusConfig = getStatusConfig();

  const handleViewDetails = () => {
    // Navigate to request details page
    console.log("View Full Details");
    navigation.navigate("ViewInvestmentRequestLetter", { request });
  };

  const handleViewProjectStatus = () => {
    // Navigate to project status page
    console.log("View Project Status");
    // navigation.navigate('ProjectStatus', { request });
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View className="bg-white px-4 py-4 ">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation?.goBack()}
            className="mr-3 p-1"
            activeOpacity={0.7}
          >
            <MaterialIcons name="chevron-left" size={28} color="#000" />
          </TouchableOpacity>

          {/* Add absolute positioning and center */}
          <View className="absolute w-full left-0 right-0 items-center justify-center">
            <Text className="text-base font-semibold text-black">
              #{request?.jobId || t("Govicapital.Request Review")}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Content Container */}
        <View className="flex-1 items-center justify-center px-6 py-8">
          {/* Icon/Animation Circle */}
          <View
            className="w-48 h-48 rounded-full items-center justify-center mb-8"
            style={{ backgroundColor: statusConfig.bgColor }}
          >
            {requestStatus === "approved" && (
              <View className="items-center justify-center">
                <LottieView
                  source={require("../../assets/jsons/Congratulations.json")}
                  style={{ width: 200, height: 200 }}
                  autoPlay
                  loop
                />
              </View>
            )}

            {requestStatus === "rejected" && (
              <View className=" items-center justify-center">
                <LottieView
                  source={require("../../assets/jsons/RequestRejected.json")}
                  style={{ width: 200, height: 200 }}
                  autoPlay
                  loop
                />
              </View>
            )}

            {(requestStatus === "pending" ||
              requestStatus === "under_review") && (
              <LottieView
                source={require("../../assets/jsons/StayTuned.json")}
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
            {/* View Full Details Button */}
            <TouchableOpacity
              onPress={handleViewDetails}
              activeOpacity={0.7}
              className="w-full bg-[#ECECEC] rounded-full py-4 mb-3"
            >
              <Text className="text-center text-[#8E8E8E] font-semibold text-base">
                {t("Govicapital.View Full Details")}
              </Text>
            </TouchableOpacity>

            {/* View Project Status Button (Only for Approved) */}
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
