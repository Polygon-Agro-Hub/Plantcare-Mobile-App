
import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import Swiper from 'react-native-swiper';
import axios from 'axios';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/component/types';
import RenderHtml from 'react-native-render-html'; // npm i react-native-render-html
import { environment } from "@/environment/environment";

interface NewsItem {
  id: number;
  titleEnglish: string;
  titleSinhala: string;
  titleTamil: string;
  descriptionEnglish: string;
  descriptionSinhala: string;
  descriptionTamil: string;
  image: string;
  status: string;
  createdAt: string;
  createdBy: number;
}

interface NavigationbarProps {
  navigation: StackNavigationProp<RootStackParamList>; // Generalize to accept any navigation prop from RootStackParamList
}

const NewsSlideShow: React.FC<NavigationbarProps> = ({ navigation }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await axios.get<NewsItem[]>(`${environment.API_BASE_URL}api/news/get-all-news`);
      console.log(res.data);
      setNews(res.data);
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

  const screenWidth = Dimensions.get('window').width; // Get screen width to render HTML properly

  return (
    <View className="flex h-32 border-black">
      <Swiper
        loop={true}
        autoplay={true}
        autoplayTimeout={3}
        showsPagination={true}
        paginationStyle={{ right: 10 }} // Adjust pagination position for vertical slide
        height={150}
        horizontal={false} // This makes the swiper slide vertically
      >
        {news.map((item) => (
          <TouchableOpacity key={item.id} onPress={() => navigation.navigate('News', { newsId: item.id })}>
            <View className="relative h-32 w-10/12 flex justify-end border border-gray-300 rounded-lg shadow-md">
              <Image
                source={{ uri: item.image }}
                className="absolute h-full w-full border border-gray-300 rounded-lg shadow-md"
                resizeMode="cover"
              />
              <View className="flex absolute inset-0 bg-opacity-30 p-4 justify-end">
                <View className="flex-row items-center">
                  <AntDesign name="calendar" size={18} color="gray" />
                  <Text className="text-white text-sm ml-2">
                    {formatDate(item.createdAt)}
                  </Text>
                </View>

                {/* Render HTML Title */}
                <RenderHtml
                  contentWidth={screenWidth} // This makes the HTML render properly with respect to screen size
                  source={{ html: item.titleEnglish }} // Replace this with the title with HTML tags
                  baseStyle={{ color: 'white', fontWeight: 'bold', fontSize: 16 }} // Adjust style as needed
                />

                {/* Render HTML Description */}
                <RenderHtml
                  contentWidth={screenWidth}
                  source={{ html: item.descriptionEnglish.slice(0, 30) + ' ...' }}
                  baseStyle={{ color: 'white', fontSize: 14 }} // Customize style for description
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