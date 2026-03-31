import React from "react";
import { View, Text } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/types";
import CustomHeader from "../common/CustomHeader";

type GoviShopCartNavigationProp = StackNavigationProp<
  RootStackParamList,
  "GoviShopCartScreen"
>;

interface GoviShopCartProps {
  navigation: GoviShopCartNavigationProp;
}

const GoviShopCartScreen: React.FC<GoviShopCartProps> = ({ navigation }) => {
  return (
    <View className="flex-1 bg-white">
      <CustomHeader
        title="Cart"
        showBackButton={true}
        navigation={navigation}
      />

      <View className="flex-1 justify-center items-center px-6">
        {/* Under Development Text */}
        <Text className="text-2xl font-bold text-gray-800 text-center mb-4">
          🚧 Under Development
        </Text>
        <Text className="text-base text-gray-500 text-center">
          This feature is currently being built. Please check back soon!
        </Text>
      </View>
    </View>
  );
};

export default GoviShopCartScreen;