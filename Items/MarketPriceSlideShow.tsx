import React, { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import Swiper from 'react-native-swiper';
// import { styled } from 'nativewind';
import axios from 'axios';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { environment } from "@/environment/environment";

interface MarketItem { //newsItewm
  id: number;
  image: string;
  titleEnglish: string;
  price:string;
  createdAt: string;
}

const MarketPriceSlideShow = () => {
  const [marcket, setNews] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
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
            source={{uri:item.image}}
            className="absolute  h-full w-full border border-gray-300 rounded-lg shadow-lg"
            resizeMode="cover"
          />
          <View className=" flex absolute inset-0 bg-opacity-30 p-4 justify-end rounded-full">
            {/* <View className='flex-row items-center'>
              <AntDesign name="calendar" size={18} color="gray" />
            </View> */}
            <Text className="font-semibold text-white">
              {item.titleEnglish.slice(0, 30)}
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
