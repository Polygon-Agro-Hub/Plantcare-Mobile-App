import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";
import Svg, { Circle } from "react-native-svg";

interface ProjectStatusProps {
  navigation: any;
  route: {};
}

const ProjectStatus: React.FC<ProjectStatusProps> = ({ navigation, route }) => {
  const { t } = useTranslation();

  const projectData = {
    id: "#GC000003",
    receivedInvestment: 190000,
    totalShares: 100,
    sharesLeft: 40,
    totalInvestmentNeeded: 240000,
    pendingBalance: 50000,
    transactions: [
      { amount: 50000, shares: 5, date: "June 02, 2025" },
      { amount: 20000, shares: 2, date: "June 01, 2025" },
    ],
  };

  const progressPercentage = 60;
  const radius = 45;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (progressPercentage / 100) * circumference;

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFC107" />

      <View className="pt-5 pb-6  overflow-hidden" style={{ height: 180 }}>
        <Video
          source={require("../../assets/images/govi-pension/pension-background.mov")}
          className="absolute top-0 left-0 bottom-0 right-0 w-full h-[200%]"
          shouldPlay
          isLooping
          isMuted
          resizeMode={ResizeMode.COVER}
        />

        {/* Content */}
        <View className="mb-2 z-10 px-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => navigation?.goBack()}
              className="mr-3 p-1 bg-[#F6F6F680] rounded rounded-full mt-[-2%]"
              activeOpacity={0.7}
            >
              <MaterialIcons name="chevron-left" size={28} color="#000" />
            </TouchableOpacity>

            <View className="absolute w-full left-0 right-0 items-center justify-center mt-[-2%]">
              <Text className="text-base font-semibold text-black">
                #GC000003
              </Text>
            </View>
          </View>
          <View className="absolute w-full left-0 right-0 items-center justify-center mt-[13%] mb-[10%]">
            <Text className="text-black">
              {t("ProjectStatus.Received Total Investment")}
            </Text>
          </View>
          <View className="w-full left-0 right-0 items-center justify-center mt-[14%] mb-[5%]">
            <Text className="text-3xl font-semibold text-black">
              {t("ProjectStatus.Rs.")} 190,000.00
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 mt-[-7%]">
        <View className="px-3">
          <View className="bg-white rounded-2xl p-3 px-5 mb-5 shadow- border border-[#6E98B8]">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-xs text-[#000000]">
                  {t("ProjectStatus.Total Shares")}
                </Text>
                <Text className="text-base font-semibold text-[#000000] mb-2">
                  {projectData.totalShares}
                </Text>

                <Text className="text-xs text-[#000000]">
                  {t("ProjectStatus.Shares Left")}
                </Text>
                <Text className="text-base font-semibold text-[#000000]">
                  {projectData.sharesLeft}
                </Text>
              </View>

              <View className="items-center justify-center">
                <Svg width={100} height={100}>
                  <Circle
                    cx={50}
                    cy={50}
                    r={radius}
                    stroke="#FBFAED"
                    strokeWidth={strokeWidth}
                    fill="none"
                  />

                  <Circle
                    cx={50}
                    cy={50}
                    r={radius}
                    stroke="#FFCD01"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation="-90"
                    origin="50, 50"
                  />
                </Svg>
                <View className="absolute items-center justify-center">
                  <Text className="text-xl font-bold text-[#000000]">
                    {progressPercentage}%
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View className="flex-row justify-between mb-4">
          <View className="bg-[#FBFAED] border border-[#FFCD01] rounded-xl p-4 flex-1 mr-2">
            <Text className="text-xs text-[#000000] mb-2 text-center">
              {t("ProjectStatus.Total Investment")}{'\n'}{t("ProjectStatus.Needed")}
            </Text>
            <Text className="text-base font-semibold text-[#000000] text-center">
              {t("ProjectStatus.Rs.")}{" "}
              {projectData.totalInvestmentNeeded.toLocaleString("en-IN")}.00
            </Text>
          </View>

          <View className="bg-[#FBFAED] border border-[#FFCD01] rounded-xl p-4 flex-1 ml-2">
            <Text className="text-xs text-[#000000] mb-2 text-center">
              {t("ProjectStatus.Pending Balance")}{'\n'}{t("ProjectStatus.to Receive")}
            </Text>
            <Text className="text-base font-semibold text-[#000000] text-center">
              {t("ProjectStatus.Rs.")}{" "}
              {projectData.pendingBalance.toLocaleString("en-IN")}.00
            </Text>
          </View>
        </View>

        {projectData.transactions.map((transaction, index) => (
          <View
            key={index}
            className="bg-[#FFFFFF] border border-[#6E98B8] rounded-xl p-4 mb-3"
          >
            <View className="flex-row justify-between">
              <Text className="text-base font-semibold text-[#000000]">
                {t("ProjectStatus.Rs.")}{" "}
                {transaction.amount.toLocaleString("en-IN")}.00
              </Text>
              <Text className="text-xs text-[#5A7386] mt-1">
                {transaction.date}
              </Text>
            </View>

            <Text className="text-xs text-[#5A7386]">
              {transaction.shares} {t("ProjectStatus.Shares")}
            </Text>
          </View>
        ))}

        <View className="h-8" />
      </ScrollView>
    </View>
  );
};

export default ProjectStatus;