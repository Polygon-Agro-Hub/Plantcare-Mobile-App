import React from "react";
import { View, Text, TouchableOpacity, BackHandler } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { RootStackParamList } from "../types/types";
import { ScrollView } from "react-native-gesture-handler";
import CustomHeader from "../../component/common/CustomHeader";
import { useTranslation } from "react-i18next";

type DeleteFarmerScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "DeleteFarmer"
>;

type DeleteFarmerScreenRouteProp = RouteProp<
  RootStackParamList,
  "DeleteFarmer"
>;

interface DeleteFarmerProps {
  navigation: DeleteFarmerScreenNavigationProp;
  route: DeleteFarmerScreenRouteProp;
}

const DeleteFarmer: React.FC<DeleteFarmerProps> = ({ navigation }) => {
  const { t } = useTranslation();

  const handleGoBack = () => {
    navigation.navigate("Main", { screen: "EngEditProfile" });
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("Main", { screen: "EngEditProfile" });
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => backHandler.remove();
    }, [navigation]),
  );

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-white">
      <View className="flex-1 bg-white">
        <CustomHeader
          title={t("DeleteFarmer.title")}
          navigation={navigation}
          onBackPress={handleGoBack}
        />

        <View className="flex-1  px-6">
          <View className="mt-8">
            <Text className="text-black text-xl font-semibold mb-4 mt-4 ">
              {t("DeleteFarmer.confirmationMessage")}
            </Text>
            <Text className="text-gray-600 leading-relaxed mt-4">
              {t("DeleteFarmer.warningMessage")}
            </Text>
            <Text className="text-gray-600 leading-relaxed mt-6">
              {t("DeleteFarmer.sadMessage")}
            </Text>
          </View>

          <View className="absolute bottom-0 left-0 right-0 bg-white px-10 py-4">
            <TouchableOpacity
              className="bg-black rounded-full py-3 w-full"
              onPress={() => navigation.navigate("UserFeedback")}
            >
              <Text className="text-center text-white text-base font-semibold">
                {t("DeleteFarmer.deleteButton")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleGoBack}
              className="bg-gray-200 rounded-full py-3 w-full mt-4"
            >
              <Text className="text-center text-gray-700 text-base font-semibold">
                {t("DeleteFarmer.cancelButton")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default DeleteFarmer;
