import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Swiper from "react-native-swiper";
import axios from "axios";
import AntDesign from "react-native-vector-icons/AntDesign";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/component/types";
import RenderHtml from "react-native-render-html";
import { environment } from "@/environment/environment";
import { encode } from "base64-arraybuffer";
import { useTranslation } from "react-i18next";

interface NewsItem {
  id: number;
  titleEnglish: string;
  titleSinhala: string;
  titleTamil: string;
  descriptionEnglish: string;
  descriptionSinhala: string;
  descriptionTamil: string;
  image: { type: string; data: number[] };
  status: string;
  createdAt: string;
  createdBy: number;
}

interface NavigationbarProps {
  navigation: StackNavigationProp<RootStackParamList>;
  language: string; // Accept language as prop
}

const NewsSlideShow: React.FC<NavigationbarProps> = ({
  navigation,
  language,
}) => {
  // Updated bufferToBase64 function
  const bufferToBase64 = (buffer: number[]): string => {
    const uint8Array = new Uint8Array(buffer); // Create Uint8Array from number[]
    return encode(uint8Array.buffer); // Pass the underlying ArrayBuffer to encode
  };

  const formatImage = (imageBuffer: {
    type: string;
    data: number[];
  }): string => {
    const base64String = bufferToBase64(imageBuffer.data);
    return `data:image/png;base64,${base64String}`; // Assuming the image is PNG
  };

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchNews();
  }, [language]); // Re-fetch news when language changes

  const fetchNews = async () => {
    try {
      const res = await axios.get<NewsItem[]>(
        `${environment.API_BASE_URL}api/news/get-all-news`
      );
      setNews(res.data);
    } catch (error) {
      console.error("Failed to fetch news:", error);
    } finally {
      setLoading(false);
    }
  };

  // const formatDate = (dateString: string) => {
  //   const date = new Date(dateString);
  //   const options = { year: "numeric", month: "long" };
  //   return date.toLocaleDateString("en-US", options as any);
  // };

  const formatDate = (dateString: string, language: string) => {
    const date = new Date(dateString);

    let locale = "en-US"; // Default to English

    // Set the locale based on the selected language
    if (language === "si") {
      locale = "si-LK"; // Sinhala
    } else if (language === "ta") {
      locale = "ta-LK"; // Tamil
    }

    // const options = { year: "numeric", month: "long" };
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
    };

    return date.toLocaleDateString(locale, options);
  };

  const screenWidth = Dimensions.get("window").width; // Get screen width to render HTML properly

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  return (
    <View className="flex h-52 border-black">
      <Swiper
        loop={true}
        autoplay={true}
        autoplayTimeout={3}
        paginationStyle={{ top: 200 }} // Adjust pagination position for vertical slide
        height={150}
        horizontal={true} // This makes the swiper slide horizontally
        dotColor="gray" // Set the color of inactive pagination dots
        showsPagination={false}
      >
        {news.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => navigation.navigate("News", { newsId: item.id })}
          >
            <View
              className="relative h-52  flex justify-end border border-gray-300 rounded-xl shadow-md"
              style={{ marginHorizontal: 10 }} // Adds space between each slide
            >
              <Image
                source={{ uri: formatImage(item.image) }}
                className="absolute h-full w-full border border-gray-300 rounded-xl shadow-md"
                resizeMode="contain"
              />
              {/* Dark overlay to make text visible */}
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.25)", // Dark overlay with 50% opacity
                  borderRadius: 10, // Matching rounded corners for the overlay
                }}
              />
              <View className="flex absolute inset-0 bg-opacity-30 p-4 justify-end">
                <View className="flex-row items-center">
                  <AntDesign name="calendar" size={18} color="white" />
                  <Text className="text-white text-sm ml-2">
                    {formatDate(item.createdAt, language)}
                  </Text>
                </View>

                {/* Conditional rendering using ternary operator for Title */}
                <RenderHtml
                  contentWidth={screenWidth}
                  source={{
                    html:
                      language === "si"
                        ? item.titleSinhala
                        : language === "ta"
                        ? item.titleTamil
                        : item.titleEnglish,
                  }}
                  baseStyle={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </Swiper>
    </View>
  );
};

export default NewsSlideShow;
