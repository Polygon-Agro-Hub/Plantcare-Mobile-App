import React, { useContext, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, BackHandler } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/types";
import { LanguageContext } from "@/context/LanguageContext";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useFocusEffect } from "@react-navigation/native";

const lg = require("../../assets/images/common/language1.webp");
type LanuageScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Lanuage"
>;

interface LanuageProps {
  navigation: LanuageScreenNavigationProp;
}

const Lanuage: React.FC<LanuageProps> = ({ navigation }) => {
  const { changeLanguage } = useContext(LanguageContext);
  const screenWidth = wp(100);

  useEffect(() => {
    const checkLanguagePreference = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem("@user_language");
        if (storedLanguage) {
          handleLanguageSelect(storedLanguage);
        }
      } catch (error) {
        console.error("Failed to retrieve language preference:", error);
      }
    };

    checkLanguagePreference();
  }, []);

  const handleLanguageSelect = async (language: string) => {
    try {
      await AsyncStorage.setItem("@user_language", language);
      changeLanguage(language);
      navigation.navigate("Signup" as any);
    } catch (error) {
      console.error("Failed to save language preference:", error);
    }
  };

  const dynamicStyles = {
    imageHeight: screenWidth < 400 ? wp(35) : wp(38),
    fontSize: screenWidth < 400 ? wp(4) : wp(5),
    paddingTopForLngBtns: screenWidth < 400 ? wp(5) : wp(0),
  };

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction,
      );

      return () => {
        backHandler.remove();
      };
    }, []),
  );

  return (
    <View className="flex-1 bg-white justify-center">
      <View className="items-center px-4">
        <Image
          source={lg}
          resizeMode="contain"
          style={{ height: dynamicStyles.imageHeight, width: wp(80) }}
        />

        <Text className="text-3xl pt-[10%] font-semibold text-center">
          Language
        </Text>

        <Text className="text-lg pt-[4%] font-extralight text-center">
          மொழியைத் தேர்ந்தெடுக்கவும்
        </Text>

        <Text className="text-lg pt-[4%] mb-0 font-extralight text-center">
          කරුණාකර භාෂාව තෝරන්න
        </Text>

        <View
          className="w-2/3 px-2 mt-8"
          style={{ paddingTop: dynamicStyles.paddingTopForLngBtns }}
        >
          <TouchableOpacity
            className="bg-[#353535] py-3 rounded-3xl mb-6"
            onPress={() => handleLanguageSelect("en")}
          >
            <Text
              className="text-white text-center"
              style={{ fontSize: dynamicStyles.fontSize }}
            >
              ENGLISH
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-[#353535] py-3 rounded-3xl mb-6"
            onPress={() => handleLanguageSelect("si")}
          >
            <Text
              className="text-white text-center"
              style={{ fontSize: dynamicStyles.fontSize }}
            >
              සිංහල
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-[#353535] py-3 rounded-3xl mb-12"
            onPress={() => handleLanguageSelect("ta")}
          >
            <Text
              className="text-white text-center"
              style={{ fontSize: dynamicStyles.fontSize }}
            >
              தமிழ்
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Lanuage;
