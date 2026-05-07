import React from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/types";
import CustomHeader from "../common/CustomHeader";

type SoilGridsNavigationProp = StackNavigationProp<
  RootStackParamList,
  "SoilGridsScreen"
>;

interface SoilGridsProps {
  navigation: SoilGridsNavigationProp;
}

const SoilGridsScreen: React.FC<SoilGridsProps> = ({ navigation }) => {
  return (
    <View className="flex-1 bg-white">
      <CustomHeader
        title="SoilGrids - Soil Data Viewer"
        showBackButton={true}
        navigation={navigation}
      />

      <WebView
        source={{ uri: "https://soilgrids.org/" }}
        style={{ flex: 1 }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        cacheEnabled={true}
      />
    </View>
  );
};

export default SoilGridsScreen;
