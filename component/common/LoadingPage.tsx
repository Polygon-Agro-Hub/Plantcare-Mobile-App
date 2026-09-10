import React from "react";
import {
  View,
  Text,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useTranslation } from "react-i18next";
import LottieView from "lottie-react-native";

interface LoadingPageProps {
  message?: string;
  containerStyle?: StyleProp<ViewStyle>;
  messageStyle?: StyleProp<TextStyle>;
  fullScreen?: boolean;
  backgroundColor?: string;
}

const LoadingPage: React.FC<LoadingPageProps> = ({
  message,
  containerStyle,
  messageStyle,
  fullScreen = false,
  backgroundColor = "#FFFFFF",
}) => {
  const { t } = useTranslation();

  return (
    <View
      className={`${fullScreen ? "flex-1" : ""} justify-center items-center`}
      style={[
        { backgroundColor },
        fullScreen ? { minHeight: 300 } : { paddingVertical: 40 },
        containerStyle,
      ]}
    >
      <View className="flex-1 justify-center items-center">
        <LottieView
          source={require("@/assets/jsons/common/loader.json")}
          autoPlay
          loop
          style={{ width: 150, height: 150 }}
        />
      </View>
    </View>
  );
};

export default LoadingPage;