import React, { useCallback, useEffect, useState } from "react";
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
import i18n from "@/i18n/i18n";
import { useTranslation } from "react-i18next";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import ContentLoader, { Rect, Circle } from "react-content-loader/native";
import { useFocusEffect } from "@react-navigation/native";
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
  language: string; 
}

const NewsSlideShow: React.FC<NavigationbarProps> = ({
  navigation,
  language,
}) => {

  const bufferToBase64 = (buffer: number[]): string => {
    const uint8Array = new Uint8Array(buffer); 
    return encode(uint8Array.buffer);
  };

  const formatImage = (imageBuffer: {
    type: string;
    data: number[];
  }): string => {
    const base64String = bufferToBase64(imageBuffer.data);
    return `data:image/png;base64,${base64String}`; 
  };

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  

  // useEffect(() => {
  //   fetchNews();
  // }, [language]); 
  useFocusEffect(
  useCallback(() => { 
    fetchNews(); 
  }, [language]) 
);
  const fetchNews = async () => {
    console.log("fetch news")
    try {
      const res = await axios.get<NewsItem[]>(
        `${environment.API_BASE_URL}api/news/get-all-news`
      );
      setNews(res.data);
      // res.data.forEach(item => console.log(item.image));
      setTimeout(() => {
        setLoading(false);
      }, 300);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };


  const formatDate = (dateString: string, language: string) => {
    const date = new Date(dateString);

    let locale = "en-US"; 

    if (language === "si") {
      locale = "si-LK"; 
    } else if (language === "ta") {
      locale = "ta-LK"; 
    }

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
    };

    return date.toLocaleDateString(locale, options);
  };

  const screenWidth = Dimensions.get("window").width; 
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

//   return (
//     <View className="flex h-52 border-black">
//       <Swiper
//         loop={true}
//         autoplay={true}
//         autoplayTimeout={3}
//         paginationStyle={{ top: 200 }}
//         height={150}
//         horizontal={true} 
//         dotColor="gray" 
//         showsPagination={false}
//       >
//         {news.map((item) => (
//           <TouchableOpacity
//             key={item.id}
//             onPress={() => navigation.navigate("News", { newsId: item.id })}
//           >
//             <View
//               className="relative h-52  flex justify-end border border-gray-300 rounded-xl shadow-md"
//               style={{ marginHorizontal: 10 }} 
//             >
//               <Image
//                source={
//                 typeof item.image === "string"
//                   ? { uri: item.image } 
//                   : { uri: formatImage(item.image) }
//               }
//                 className="absolute h-full w-full border border-gray-300 rounded-xl shadow-md"
//                 resizeMode="cover"
//               />
//               <View
//                 style={{
//                   position: "absolute",
//                   top: 0,
//                   bottom: 0,
//                   left: 0,
//                   right: 0,
//                   backgroundColor: "rgba(0, 0, 0, 0.25)", 
//                   borderRadius: 10, 
//                 }}
//               />
//               <View className="flex absolute inset-0 bg-opacity-30 p-4 justify-end">
//                 <View className="flex-row items-center">
//                   <AntDesign name="calendar" size={18} color="white" />
//                   <Text className="text-white text-sm ml-2">
//                     {formatDate(item.createdAt, language)}
//                   </Text>
//                 </View>

//                 <RenderHtml
//                   contentWidth={screenWidth}
//                   source={{
//                     html:
//                       language === "si"
//                         ? item.titleSinhala
//                         : language === "ta"
//                         ? item.titleTamil
//                         : item.titleEnglish,
//                   }}
//                   baseStyle={{
//                     color: "white",
//                     fontWeight: "bold",
//                     fontSize: 16,
//                   }}
//                 />
//               </View>
//             </View>
//           </TouchableOpacity>
//         ))}
//       </Swiper>
//     </View>
//   );
// };
return (
  <View className="flex h-52 border-black">
    {news.length === 0 ? (
      <View
        className="relative h-52 flex justify-center items-center border border-gray-300 rounded-3xl shadow-md"
        style={{ marginHorizontal: 10,  width: wp("90%") }}
      >
        <Image
          source={require("../assets/images/news1.webp")} // Replace with your actual placeholder image path
          className="h-full w-full rounded-xl shadow-md"
          resizeMode="cover"
        />
      </View>
    ) : (
      <Swiper
        loop={true}
        autoplay={true}
        autoplayTimeout={3}
        paginationStyle={{ top: 200 }}
        height={150}
        horizontal={true}
        dotColor="gray"
        showsPagination={false}
      >
        {news.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => navigation.navigate("News", { newsId: item.id })}
          >
            <View
              className="relative h-52 flex justify-end  rounded-3xl shadow-sm"
              style={{ marginHorizontal: 10 }}
            >
              <Image
                source={
                  typeof item.image === "string"
                    ? { uri: item.image }
                    : { uri: formatImage(item.image) }
                }
                className="absolute h-full w-full  rounded-3xl shadow-md"
                resizeMode="cover"
              />
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.25)", // Dark overlay
                  borderRadius: 30,
                }}
              />
              <View className="flex absolute inset-0 bg-opacity-30 p-4 justify-end">
                <View className="flex-row items-center">
                  <AntDesign name="calendar" size={18} color="white" />
                  <Text className="text-white text-sm ml-2">
                    {formatDate(item.createdAt, language)}
                  </Text>
                </View>

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
    )}
  </View>
);
}

export default NewsSlideShow;
