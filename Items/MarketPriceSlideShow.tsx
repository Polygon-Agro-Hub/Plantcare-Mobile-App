import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Image, ActivityIndicator, Dimensions } from "react-native";
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
import LottieView from "lottie-react-native";
import ContentLoader, { Rect, Circle } from "react-content-loader/native";
import { useFocusEffect } from "@react-navigation/native";
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
  const { width, height } = Dimensions.get('window');
  const screenWidth = width;
  const screenHeight = height;
  const emtycard = require("@/assets/images/NoCrop.webp");
  // const emtycard = require("@/assets/jsons/nocrop.json");


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
    console.log("hitt1")
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
      setTimeout(() => {
        setLoading(false);
      }, 300);
    } catch (error) {
      console.error("Failed to market price:", error);
    } finally {
        setLoading(false);
    }
  };

  // useEffect(() => {
  //   fetchNews(); // Initial fetch
  //   const interval = setInterval(fetchNews, 10000); 

  //   return () => clearInterval(interval); 
  // }, [language]);
  useFocusEffect(
  useCallback(() => {
    
    fetchNews(); 
    // const interval = setInterval(fetchNews, 10000); 
    // return () => clearInterval(interval); 
  }, [language]) 
);

  const dynamicStyles = {
    cropcardPadding: screenWidth < width ? 0 : 25,
    dynamicMarginLeft: screenWidth < 376 ? "-ml-5" : "",

  };

  // Loading state
  const SkeletonLoader = () => (
    <ContentLoader
      speed={2}
      width={wp("100%")}
      height={hp("20%")}
      viewBox={`0 0 ${wp("90%")} ${hp("20%")}`}
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
    >
      <Rect
        rx="6"
        ry="4"
        width={wp("90%")} 
        height={hp("20%")} 
      />
    </ContentLoader>
  );
  
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <SkeletonLoader />
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
        {marcket.length === 0 ? (
          <View className="flex-1  items-center ">
            <View
              className="flex-row h-32  justify-between bg-[#EDFFF0] rounded-3xl shadow-sm items-center"
              style={{ marginHorizontal: 10, padding: dynamicStyles.cropcardPadding, width: wp("90%") }}
            >
              <View className="flex-row items-center mb-2">
                <Image
                  source={emtycard}
                  className="h-24 w-24 z-10 "
                  resizeMode="contain"
                />
                   {/* <LottieView
                  source={emtycard}
                  autoPlay
                  loop
                  style={{ width: 100, height: 100,  marginLeft: -10, }}
                  
                /> */}
                {/* <Text className="ml-4 w-52">
                  {t("MarketPriceSlideShow.PleaseEnroll")}
                </Text> */}
                <Text 
  className="ml-4"
  style={{ 
    width: wp("52%"), // Responsive width
    flexWrap: 'wrap',
    lineHeight: 18,
  }}
  numberOfLines={3}
>
  {t("MarketPriceSlideShow.PleaseEnroll")}
</Text>
              </View>
            </View>
          </View>
        ) : (
          marcket.map((item) => (
            <View
              key={item.varietyId}
              style={{ marginHorizontal: 10 }}
              className="flex flex-row h-32 p-8 justify-between rounded-lg shadow-lg item-center pt-6"
            >
              <Image
                // source={{ uri: formatImage(item.image) }}
                source={
                  typeof item.image === "string"
                    ? { uri: item.image } 
                    : { uri: formatImage(item.image) }
                } 
                className=" z-10 right-4 "
                style={{ width: 60, height: 'auto' }} // Fixed size for image
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
              <View className="flex-1 justify-center ">
               {/* <View className={`flex-row pb-2 items-center ${language === "en" ? "" : ""}`}>

                  <Text className={`font-semibold text-sm  w-[58%] mt-2 `}>
                    {language === "si"
                      ? item.varietyNameSinhala?.slice(0, 30) || "N/A"
                      : language === "ta"
                      ? item.varietyNameTamil?.slice(0, 30) || "N/A"
                      : item.varietyNameEnglish?.slice(0, 30) || "N/A"}
                      
                  </Text>
                  <Text className="font-semibold text-[15px]  w-48 mt-2">
                  : Rs.{(parseFloat(item.averagePrice) || 0).toFixed(2)}/kg
                  </Text>
                </View> */}
               
<View className={`flex-row pb-2 items-center ${language === "en" ? "" : ""}`}>                    
  <Text className={`font-semibold text-sm mt-2 flex-1`} numberOfLines={1}>                     
    {language === "si"
      ? item.varietyNameSinhala?.slice(0, 30) || "N/A"
      : language === "ta"
      ? item.varietyNameTamil?.slice(0, 30) || "N/A"
      : item.varietyNameEnglish?.slice(0, 30) || "N/A"}
      :   Rs.{(parseFloat(item.averagePrice) || 0).toFixed(2)}/kg                                       
  </Text>                 
</View> 
                <Text className="italic  ">
                {t("MarketPriceSlideShow.Note")}: {t("MarketPriceSlideShow.Text")}
                </Text>
              </View>
            </View>
          ))
        )}
      </Swiper>
    </View>
  );
};

export default MarketPriceSlideShow;
