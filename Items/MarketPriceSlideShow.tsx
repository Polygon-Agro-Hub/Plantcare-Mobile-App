import React, { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import Swiper from 'react-native-swiper';
import axios from 'axios';
import { environment } from "@/environment/environment";
import { useTranslation } from 'react-i18next';
import { encode } from 'base64-arraybuffer';

interface MarketItem { 
  id: number;
  image: { type: string; data: number[] };
  titleEnglish: string;
  titleSinhala: string;
  titleTamil: string;
  price:string;
  createdAt: string;
}

const MarketPriceSlideShow = () => {
  const [marcket, setNews] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [language, setLanguage] = useState('en');
  const { t } = useTranslation();

   // Updated bufferToBase64 function
  const bufferToBase64 = (buffer: number[]): string => {
    const uint8Array = new Uint8Array(buffer); // Create Uint8Array from number[]
    return encode(uint8Array.buffer); // Pass the underlying ArrayBuffer to encode
  };

  const formatImage = (imageBuffer: { type: string; data: number[] }): string => {
    const base64String = bufferToBase64(imageBuffer.data);
    return `data:image/png;base64,${base64String}`; // Assuming the image is PNG
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const selectedLanguage = t("NewsSlideShow.LNG");
      setLanguage(selectedLanguage);
      const res = await axios.get<MarketItem[]>(`${environment.API_BASE_URL}api/market-price/get-all-market`)
      setNews(res.data)
      
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long' };
    return date.toLocaleDateString('en-US', options as any);
  };

  // console.log(news);
  

  return (
    <View className=" flex h-32 border-black">
   <Swiper
        loop={true}
        autoplay={true}
        autoplayTimeout={3}
        showsPagination={true}
        paginationStyle={{ right: 10 }} // Adjust pagination position for vertical slide
        height={150} // Set the height for each slide
        horizontal={false} // This makes the swiper slide vertically
>
      {marcket.map((item) => (
        <View key={item.id} className="relative h-32 w-10/12 flex justify-end border border-gray-300 rounded-lg shadow-lg">
          <Image
            source={{ uri: formatImage(item.image) }}
            className="absolute  h-full w-full border border-gray-300 rounded-lg shadow-lg"
            resizeMode="cover"
          />
          <View className=" flex absolute inset-0 bg-opacity-30 p-4 justify-end rounded-full">
            {/* <View className='flex-row items-center'>
              <AntDesign name="calendar" size={18} color="gray" />
            </View> */}
            <Text className="font-semibold text-white">
              {
                language === 'si' 
              ? item.titleSinhala.slice(0, 30)
              : language === 'ta'
              ? item.titleTamil.slice(0,30)
              : item.titleEnglish.slice(0,30)
            }
            </Text>
            <Text className='text-white'>{item.price}</Text>
          </View>
        </View>
      ))}
    </Swiper>
  </View>
);
};

export default MarketPriceSlideShow;
