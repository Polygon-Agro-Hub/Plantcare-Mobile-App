import React from "react";
import { View, Text } from "react-native";
import LottieView from "lottie-react-native";

interface NoDataProps {
  text: string;
}

const NoData: React.FC<NoDataProps> = ({ text }) => {
  return (
    <View
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      className="justify-center items-center px-4"
      pointerEvents="none"
    >
      <LottieView
        source={require("@/assets/jsons/common/no-data.json")}
        autoPlay
        loop
        style={{ width: 200, height: 200 }}
      />
      <Text className="text-[#7A9BC9] text-base text-center">
        {text}
      </Text>
    </View>
  );
};

export default NoData;
