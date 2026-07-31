import React from "react";
import { View, Text } from "react-native";
import LottieView from "lottie-react-native";

interface ShopLoadingProps {
  text?: string;
}

const ShopLoading: React.FC<ShopLoadingProps> = ({ text }) => {
  return (
    <View className="flex-1 justify-center items-center py-10 w-full min-h-[350px]">
      <View className="w-20 h-20 mt-4">
        <LottieView
          source={require("@/assets/jsons/govi-shop/loading-animation.json")}
          autoPlay
          loop
          style={{ width: "100%", height: "100%" }}
        />
      </View>
      {text ? (
        <Text className="text-gray-500 text-sm mt-3 text-center font-medium px-4">
          {text}
        </Text>
      ) : null}
    </View>
  );
};

export default ShopLoading;
