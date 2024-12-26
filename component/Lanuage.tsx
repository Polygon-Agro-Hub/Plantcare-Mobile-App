import React, { useContext, useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
const lg = require("../assets/images/lanuage.jpg");
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import { LanguageContext } from "@/context/LanguageContext";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

type LanuageScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Lanuage"
>;

interface LanuageProps {
  navigation: LanuageScreenNavigationProp;
}

// Define an interface for a news item
interface NewsItem {
  title: string;
  description: string;
  // Add other fields as needed
}

const Lanuage: React.FC<LanuageProps> = ({ navigation }) => {
  const { changeLanguage } = useContext(LanguageContext);

  // State to hold news items
  const [news, setNews] = useState<NewsItem[]>([]);
  const screenWidth = wp(100); // Get the full width of the screen

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
  }, []); // Empty dependency array means this effect runs only once

  const handleLanguageSelect = async (language: string) => {
    try {
      await AsyncStorage.setItem("@user_language", language);
      changeLanguage(language);
      navigation.navigate("SignupForum" as any); // Navigate to SignupForum
    } catch (error) {
      console.error("Failed to save language preference:", error);
    }
  };

  //Define dynamic styles based on screen size
  const dynamicStyles = {
    imageHeight: screenWidth < 400 ? wp(35) : wp(38), // Adjust image size
    fontSize: screenWidth < 400 ? wp(4) : wp(5),
    paddingTopForLngBtns: screenWidth < 400 ? wp(5) : wp(0),
  };

  return (
    <View className="flex-1 bg-white items-center">
      <Image
        className="mt-10 w-full"
        source={lg}
        resizeMode="contain"
        style={{ height: dynamicStyles.imageHeight }}
      />
      <Text className="text-3xl pt-[10%] font-semibold">Language</Text>
      <Text className="text-lg pt-[4%] font-extralight">
        மொழியைத் தேர்ந்தெடுக்கவும்
      </Text>
      <Text className="text-lg pt-[4%] mb-0 font-extralight">
        කරුණාකර භාෂාව තෝරන්න
      </Text>

      {/* TouchableOpacity Buttons */}
      <View
        className="flex-1 justify-center w-64 px-2 mt-0"
        style={{ paddingTop: dynamicStyles.paddingTopForLngBtns }}
      >
        <TouchableOpacity
          className="bg-gray-900 p-[7%] rounded-3xl mb-6"
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
          className="bg-gray-900 p-[7%] rounded-3xl mb-6"
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
          className="bg-gray-900 p-[7%] rounded-3xl mb-12"
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

      {/* Render the fetched news items */}
      <View className="w-full px-4">
        {news.map((item, index) => (
          <View
            key={index}
            className="mb-4 p-4 border border-gray-300 rounded-lg"
          >
            <Text className="font-semibold text-lg">{item.title}</Text>
            <Text className="text-gray-700">{item.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default Lanuage;
