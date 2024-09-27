import { View, Text, ImageBackground, Image, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { RouteProp } from '@react-navigation/native';
import axios from 'axios';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { environment } from '@/environment/environment';
import RenderHtml from 'react-native-render-html'; // Import RenderHtml for rendering HTML content
import { ScrollView } from 'react-native-gesture-handler';
import TamilNavigationBar from '@/Items/TamilNavigationBar';

interface NewsItem {
  id: number;
  titleEnglish: string;
  descriptionEnglish: string;
  image: string;
  createdAt: string;
}

type NewsNavigationProp = RouteProp<RootStackParamList, 'News'>;
type SelectCropNavigationCrop = StackNavigationProp<RootStackParamList, 'News'>;

interface NewsProps {
  navigation: SelectCropNavigationCrop;
  route: NewsNavigationProp;
}

const banner = require('@/assets/images/NEWS.png');
const wave = require('@/assets/images/Group.png');

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const News: React.FC<NewsProps> = ({ navigation, route }) => {
  const { newsId } = route.params;
  const [news, setNews] = useState<NewsItem | null>(null);
  
  const screenWidth = Dimensions.get('window').width; // Screen width for proper HTML rendering

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get<NewsItem[]>(`${environment.API_BASE_URL}api/news/get-news/${newsId}`);
        if (res.data.length > 0) {
          setNews(res.data[0]); // Accessing the first item in the array
        } else {
          console.log('No news found');
        }
      } catch (err) {
        console.log("Failed to fetch", err);
      }
    };

    if (newsId) {
      fetchNews();
    }
  }, [newsId]);

  return (
    <View className='flex-1'>
      {/* Header */}
      <Image className="w-full h-40 mt-0" source={require('../assets/images/Group.png')} />
      <View className='absolute top-0 left-0 right-0'>
        <View className='flex-row pt-5'>
          <AntDesign
            name="left"
            size={24}
            color="#000502"
            onPress={() => navigation.goBack()}
          />
          <Text className='font-bold text-xl pt-4 pb-5 ml-[35%] mr-3'>News</Text>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className='pl-12 pt-8'>
          <Image
            source={{ uri: news?.image }}
            className='w-[90%] h-64 border border-gray-300 rounded-lg shadow-md'
          />
        </View>
        <View className='pt-5 pl-12 flex-row items-center'>
          <AntDesign name="calendar" size={20} color="#000502" />
          <Text className='ml-2'>{news?.createdAt ? formatDate(news.createdAt) : 'Date not available'}</Text>
        </View>
        <View className='pl-12 pt-2'>
          <View className='w-1/5 border-t border-gray-300' />
        </View>
        <View className='pl-12 pt-4'>
          {/* Render HTML Title */}
          {news?.titleEnglish && (
            <RenderHtml
              contentWidth={screenWidth}
              source={{ html: news.titleEnglish }}
              baseStyle={{ fontWeight: 'bold', fontSize: 20, color: '#000' }} // Custom styles for the title
            />
          )}

          {/* Render HTML Description */}
          {news?.descriptionEnglish && (
            <RenderHtml
              contentWidth={screenWidth}
              source={{ html: news.descriptionEnglish }}
              baseStyle={{ fontSize: 16, color: '#333', marginTop: 8 }} // Custom styles for the description
            />
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      {/* <View className='flex-row justify-around items-center bg-white border-t border-gray-300 shadow-lg'>
        <View className='flex items-center justify-center pt-2 pb-2'>
          <Image source={require('../assets/images/Home.png')} style={{ width: 50, height: 50 }} />
          <Text className='text-green-500 mt-1'>Home</Text>
        </View>
        <View className='flex items-center justify-center pt-2 pb-2'>
          <Image source={require('../assets/images/plus.png')} />
          <Text className='text-green-500 mt-1'>New Crop</Text>
        </View>
        <View className='flex items-center justify-center pt-2 pb-2'>
          <Image source={require('../assets/images/Irrigation.png')} />
          <Text className='text-green-500 mt-1'>My Cultivation</Text>
        </View>
      </View> */}

<View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <TamilNavigationBar navigation={navigation} />
        </View>

    </View>
  );
};

export default News;
