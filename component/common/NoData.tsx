import React from "react";
import { View, Text } from "react-native";
import LottieView from "lottie-react-native";

interface NoDataProps {
  text: string;
}

const NoData: React.FC<NoDataProps> = ({ text }) => {
  return (
    <View className="justify-center items-center w-full">
      <LottieView
        source={require("@/assets/jsons/common/no-data.json")}
        autoPlay
        loop
        style={{ width: 160, height: 160 }}
      />
      <Text className="text-[#7A9BC9] text-base text-center font-medium  px-4">
        {text}
      </Text>
    </View>
  );
};

export default NoData;
