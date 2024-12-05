import React, { useEffect, useState } from "react";
import { View, Text, Image, ActivityIndicator } from "react-native";
import Swiper from "react-native-swiper";
import axios from "axios";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import { encode } from "base64-arraybuffer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
interface MarketItem {
  varietyId: number;
  image: { type: string; data: number[] };
  varietyNameEnglish: string;
  varietyNameSinhala: string;
  varietyNameTamil: string;
  bgColor: string;
  averagePrice: string;
  createdAt: string;
}

interface NavigationbarProps {
  language: string; // Accept language as prop
}

const MarketPriceSlideShow: React.FC<NavigationbarProps> = ({ language }) => {
  const [marcket, setNews] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { t } = useTranslation();
  const screenWidth = wp(100);

  const emtycard = require("@/assets/images/NoCrop.png");

  // Convert buffer to base64 image string
  const bufferToBase64 = (buffer: number[]): string => {
    const uint8Array = new Uint8Array(buffer); // Create Uint8Array from number[]
    return encode(uint8Array.buffer); // Pass the underlying ArrayBuffer to encode
  };

  // Format the image from buffer to base64 string
  const formatImage = (imageBuffer: {
    type: string;
    data: number[];
  }): string => {
    const base64String = bufferToBase64(imageBuffer.data);
    return `data:image/png;base64,${base64String}`; // Assuming the image is PNG
  };

  // Fetch market data
  const fetchNews = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      const res = await axios.get<MarketItem[]>(
        `${environment.API_BASE_URL}api/market-price/get-all-market`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNews(res.data);
    } catch (error) {
      console.error("Failed to fetch news:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch news initially and then every 10 seconds
  useEffect(() => {
    fetchNews(); // Initial fetch
    const interval = setInterval(fetchNews, 10000); // Fetch every 10 seconds

    return () => clearInterval(interval); // Clear interval when the component unmounts
  }, [language]);

  const dynamicStyles = {
    cropcardPadding: screenWidth < 400 ? 5 : 0,

  };

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  if (marcket.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
      <View
        className="flex-row h-32  justify-between bg-[#EDFFF0] rounded-lg shadow-lg items-center "
        style={{ marginHorizontal: 10, padding: dynamicStyles.cropcardPadding }}
      >
        <View className="flex-row items-center ">
          <Image
            source={emtycard} // Assuming 'emtycard' is the image source
            className="h-24 w-24 z-10 left-2"
            resizeMode="contain"
          />

          <Text className="ml-10 w-52">Please Enroll to Crops to see How the Market Prices are</Text>
        </View>
      </View>
    </View>
    
    );
  }

  return (
    <View className="flex h-32 border-black">
      <Swiper
        loop={true}
        autoplay={true}
        autoplayTimeout={3}
        paginationStyle={{ top: 120 }}
        height={150}
        horizontal={true}
        showsPagination={false}
      >
        {marcket.map((item) => (
          <View
            key={item.varietyId}
            style={{ marginHorizontal: 10 }}
            className="flex flex-row h-32 p-8 justify-between rounded-lg shadow-lg item-center pt-6"
          >
            <Image
              source={{ uri: formatImage(item.image) }}
              className="h-24 w-24 z-10 right-6 bottom-2"
              resizeMode="contain"
            />
            <View
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: `${item.bgColor}`,
                borderRadius: 10,
              }}
            />
            {/* Text Content */}
            {/* <View className="justify-between right-2 ">
              <View className="flex-row items-center pb-2">
                <Text className="font-semibold text-lg w-28">
                  {language === "si"
                    ? item.varietyNameSinhala?.slice(0, 30) || "N/A"
                    : language === "ta"
                    ? item.varietyNameTamil?.slice(0, 30) || "N/A"
                    : item.varietyNameEnglish?.slice(0, 30) || "N/A"}
                </Text>
                <Text className="font-semibold text-lg ">
                  : Rs.{item.averagePrice}/kg
                </Text>
              </View>

              <Text className="italic w-52">
                Note: The market price may differ from the listed price.
              </Text>
            </View> */}
            <View className="flex-1 justify-center items-center ">
              <View className="flex-row items-center pb-2">
                <Text className="font-semibold text-[14px]  w-28">
                  {language === "si" 
                    ? item.varietyNameSinhala?.slice(0, 30) || "N/A"
                    : language === "ta"
                    ? item.varietyNameTamil?.slice(0, 30) || "N/A"
                    : item.varietyNameEnglish?.slice(0, 30) || "N/A"}
                </Text>
                <Text className="font-semibold text-lg ">
                  : Rs.{item.averagePrice}/kg
                </Text>
              </View>

              <Text className="italic w-52">
                Note: The market price may differ from the listed price.
              </Text>
            </View>
          </View>
        ))}
      </Swiper>
    </View>
  );
};

export default MarketPriceSlideShow;
