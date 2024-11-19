import React, { useEffect, useState } from "react";
import { View, Text, Image, ActivityIndicator } from "react-native";
import Swiper from "react-native-swiper";
import axios from "axios";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import { encode } from "base64-arraybuffer";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/component/types";

interface MarketItem {
  id: number;
  image: { type: string; data: number[] };
  titleEnglish: string;
  titleSinhala: string;
  titleTamil: string;
  price: string;
  createdAt: string;
}

interface NavigationbarProps {
  //navigation: StackNavigationProp<RootStackParamList>;
  language: string; // Accept language as prop
}

const MarketPriceSlideShow: React.FC<NavigationbarProps> = ({ language }) => {
  const [marcket, setNews] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  //const [language, setLanguage] = useState('en');
  const { t } = useTranslation();

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

  useEffect(() => {
    fetchNews();
  }, [language]);

  const fetchNews = async () => {
    try {
      const selectedLanguage = t("NewsSlideShow.LNG");
      //setLanguage(selectedLanguage);
      const res = await axios.get<MarketItem[]>(
        `${environment.API_BASE_URL}api/market-price/get-all-market`
      );
      setNews(res.data);
    } catch (error) {
      console.error("Failed to fetch news:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options = { year: "numeric", month: "long" };
    return date.toLocaleDateString("en-US", options as any);
  };

  // console.log(news);

  return (
    <View className=" flex h-16 border-black">
      <Swiper
        loop={true}
        autoplay={true}
        autoplayTimeout={3}
        showsPagination={true}
        paginationStyle={{ top: 10 }} // Adjust pagination position for vertical slide
        height={100} // Set the height for each slide
        horizontal={true} // This makes the swiper slide vertically
      >
        {marcket.map((item) => (
          <View
            key={item.id}
            className="relative h-16  flex justify-end border border-gray-300 rounded-lg shadow-lg"
          >
            <Image
              source={{ uri: formatImage(item.image) }}
              className="absolute  h-full w-full border border-gray-300 rounded-lg shadow-lg"
              resizeMode="cover"
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
            <View className=" flex absolute inset-0 bg-opacity-30 p-4 justify-end rounded-full">
              {/* <View className='flex-row items-center'>
              <AntDesign name="calendar" size={18} color="gray" />
            </View> */}
              <Text className="font-semibold text-white">
                {language === "si"
                  ? item.titleSinhala.slice(0, 30)
                  : language === "ta"
                  ? item.titleTamil.slice(0, 30)
                  : item.titleEnglish.slice(0, 30)}
              </Text>
              <Text className="text-white">{item.price}</Text>
            </View>
          </View>
        ))}
      </Swiper>
    </View>
  );
};

export default MarketPriceSlideShow;
