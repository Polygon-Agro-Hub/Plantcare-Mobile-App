import { View, Text, Image, Dimensions, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import AntDesign from "react-native-vector-icons/AntDesign";
import { RouteProp } from "@react-navigation/native";
import axios from "axios";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import { environment } from "@/environment/environment";
import RenderHtml from "react-native-render-html";
import { ScrollView } from "react-native-gesture-handler";
import { useTranslation } from "react-i18next";
import { encode } from "base64-arraybuffer";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

interface NewsItem {
  id: number;
  titleEnglish: string;
  titleSinhala: string;
  titleTamil: string;
  descriptionEnglish: string;
  descriptionSinhala: string;
  descriptionTamil: string;
  image: { type: string; data: number[] };
  createdAt: string;
}

type NewsNavigationProp = RouteProp<RootStackParamList, "News">;
type SelectCropNavigationCrop = StackNavigationProp<RootStackParamList, "News">;

interface NewsProps {
  navigation: SelectCropNavigationCrop;
  route: NewsNavigationProp;
}

const banner = require("@/assets/images/NEWS.webp");
const wave = require("@/assets/images/Group.webp");

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const News: React.FC<NewsProps> = ({ navigation, route }) => {
  const { newsId } = route.params;
  const [news, setNews] = useState<NewsItem | null>(null);
  const [language, setLanguage] = useState("en");
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(true);
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

  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    const selectedLanguage = t("News.LNG");
    setLanguage(selectedLanguage);
    const fetchNews = async () => {
      try {
        const res = await axios.get<NewsItem[]>(
          `${environment.API_BASE_URL}api/news/get-news/${newsId}`
        );
        if (res.data.length > 0) {
          setNews(res.data[0]);
        } else {
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    if (newsId) {
      fetchNews();
    }
  }, [newsId]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}

      <View className="absolute top-0 left-0 right-0 z-10  ">
        <View className="flex-row ml-5 mt-5 items-center">
          <AntDesign
            name="left"
            size={24}
            color="#000502"
            onPress={() => navigation.goBack()}
            style={{ paddingHorizontal: wp(3), paddingVertical: hp(1.5), backgroundColor: "#F6F6F680" , borderRadius: 50 }}
          />
          {/* <Text className="font-bold flex-1 text-xl pt-2  pb-5 ml-[30%] mr-3">
            {t("News.news")}
          </Text> */}
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}>
        {/* <Image
          className="w-full h-40 mt-0 "
          source={require("../assets/images/Group.webp")}
        /> */}

        <View className=" p-3  ">
          {news?.image ? (
            <View className="item-center">
                      <View className=" right-0 bottom-0  opacity-90 rounded-3xl" >

            <Image
              source={
                typeof news.image === "string"
                  ? { uri: news.image }
                  : { uri: banner }
              }
              className="w-[100%] h-56 bg-black  rounded-3xl shadow-md"
            />
          </View>
              <View className="  py-5  -mt-14  items-center l">
                <View className="bg-[#FFFFFF] border-[#f8f8f8] border rounded-3xl shadow-md p-4 w-[90%]">
            {language === "en" && news?.titleEnglish && (
              <RenderHtml
                contentWidth={screenWidth}
                source={{ html: news.titleEnglish }}
                baseStyle={{ fontWeight: "bold", fontSize: 18, color: "#000" }} // Custom styles for the title
            />
          )}
          {language === "si" && news?.titleSinhala && (
            <RenderHtml
              contentWidth={screenWidth}
              source={{ html: news.titleSinhala }}
              baseStyle={{ fontWeight: "bold", fontSize: 18, color: "#000" }} // Custom styles for the title
            />
          )}
          {language === "ta" && news?.titleTamil && (
            <RenderHtml
              contentWidth={screenWidth}
              source={{ html: news.titleTamil }}
              baseStyle={{ fontWeight: "bold", fontSize: 18, color: "#000" }} // Custom styles for the title
            />
          )}
          </View>
          </View>
          </View>
          ) : (
            <Text>Image not available</Text> 
          )}
          
        </View>
    
        <View className=" pl-8 flex-row items-center">
          <AntDesign name="calendar" size={20} color="#000502" />
          <Text className="ml-2">
            {news?.createdAt
              ? formatDate(news.createdAt)
              : "Date not available"}
          </Text>
        </View>
        <View className="pl-8 pt-2">
          <View className="w-4/5 border-t border-gray-300" />
        </View>
        <View className="pl-8 pr-9 pb-2">
          {/* Render the title based on selected language */}
          {/* {language === "en" && news?.titleEnglish && (
            <RenderHtml
              contentWidth={screenWidth}
              source={{ html: news.titleEnglish }}
              baseStyle={{ fontWeight: "bold", fontSize: 20, color: "#000" }} // Custom styles for the title
            />
          )}
          {language === "si" && news?.titleSinhala && (
            <RenderHtml
              contentWidth={screenWidth}
              source={{ html: news.titleSinhala }}
              baseStyle={{ fontWeight: "bold", fontSize: 20, color: "#000" }} // Custom styles for the title
            />
          )}
          {language === "ta" && news?.titleTamil && (
            <RenderHtml
              contentWidth={screenWidth}
              source={{ html: news.titleTamil }}
              baseStyle={{ fontWeight: "bold", fontSize: 20, color: "#000" }} // Custom styles for the title
            />
          )} */}

          {/* Render the description based on selected language */}
          {language === "en" && news?.descriptionEnglish && (
            <RenderHtml
              contentWidth={screenWidth}
              source={{ html: news.descriptionEnglish }}
              baseStyle={{ fontSize: 16, color: "#333", marginTop: 8 }} // Custom styles for the description
            />
          )}
          {language === "si" && news?.descriptionSinhala && (
            <RenderHtml
              contentWidth={screenWidth}
              source={{ html: news.descriptionSinhala }}
              baseStyle={{ fontSize: 16, color: "#333", marginTop: 8 }} // Custom styles for the description
            />
          )}
          {language === "ta" && news?.descriptionTamil && (
            <RenderHtml
              contentWidth={screenWidth}
              source={{ html: news.descriptionTamil }}
              baseStyle={{ fontSize: 16, color: "#333", marginTop: 8 }} // Custom styles for the description
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default News;
