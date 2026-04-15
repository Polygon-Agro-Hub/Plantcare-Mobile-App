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
}

const LoadingPage: React.FC<LoadingPageProps> = ({
  message,
  containerStyle,
  messageStyle,
  fullScreen = false,
}) => {
  const { t } = useTranslation();

  return (
    <View
      className={`${fullScreen ? "flex-1" : ""} justify-center items-center bg-white`}
      style={[
        fullScreen ? { minHeight: 300 } : { paddingVertical: 40 },
        containerStyle,
      ]}
    >
      <View className="flex-1 justify-center items-center">
        <LottieView
          source={require("../../assets/jsons/loader.json")}
          autoPlay
          loop
          style={{ width: 300, height: 300 }}
        />
      </View>
     
    </View>
  );
};

export default LoadingPage;
