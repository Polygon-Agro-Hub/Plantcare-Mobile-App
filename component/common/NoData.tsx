import React from "react";
import { View, Text, StyleProp, ViewStyle } from "react-native";
import LottieView from "lottie-react-native";

interface NoDataProps {
  text: string;
  style?: StyleProp<ViewStyle>;
}

const NoData: React.FC<NoDataProps> = ({ text, style }) => {
  return (
    <View
      className="flex-1 justify-center items-center w-full"
      style={[{ flex: 1, justifyContent: "center", alignItems: "center" }, style]}
    >
      <LottieView
        source={require("@/assets/jsons/common/no-data.json")}
        autoPlay
        loop
        style={{ width: 160, height: 160 }}
      />
      <Text className="text-[#7A9BC9] text-base text-center font-medium px-4">
        {text}
      </Text>
    </View>
  );
};

export default NoData;
