import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, BackHandler } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { RootStackParamList } from "./types";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { ScrollView } from "react-native-gesture-handler";
import AntDesign from "react-native-vector-icons/AntDesign";
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
  const [language, setLanguage] = useState("en")

  const handleGoBack = () => {
    navigation.navigate("Main",{screen:"EngEditProfile"})
  };

  useEffect (() => {
    const selectedLanguage = t("Feedback.LNG");
      setLanguage(selectedLanguage);
  })


       useFocusEffect(
          React.useCallback(() => {
            const onBackPress = () => {
              navigation.navigate("Main",{screen:"EngEditProfile"})
              return true; // Prevent default back action
            };
        
            BackHandler.addEventListener("hardwareBackPress", onBackPress);
        
            return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
          }, [navigation])
        );
  

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      className="bg-white"
      style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
    >
      <View className="flex-1 bg-white">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={handleGoBack}
             className="bg-[#F6F6F680] rounded-full items-center justify-center -mt-2"
                    style={{
                                width: 50,
                                height: 50,
                   
                              }}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <AntDesign name="left" size={24} color="#000502" />
          </TouchableOpacity>
          <View className="flex-1 items-center -ml-8">
            <Text className="text-black text-xl font-bold">              
              {t("DeleteFarmer.title")}
            </Text>
          </View>
        </View>

        <View className="flex-1 p-2">
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

          <View className="absolute bottom-0 left-0 right-0 bg-white px-6 py-4">
            <TouchableOpacity className="bg-black rounded-full py-3 w-full"
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
