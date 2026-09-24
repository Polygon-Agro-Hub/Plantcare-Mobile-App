import {
  View,
  Text,
  Image,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  BackHandler,
} from "react-native";
import React, { useEffect, useState } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import { RouteProp } from "@react-navigation/native";
import axios from "axios";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/types";
import { environment } from "@/environment/environment";
import RenderHtml from "react-native-render-html";
import { ScrollView } from "react-native-gesture-handler";
import { useTranslation } from "react-i18next";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Entypo } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import LoadingPage from "../common/LoadingPage";

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

const banner = require("@/assets/images/news/news-image.webp");

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const prepareHtml = (htmlContent?: string) => {
  if (!htmlContent) return "";
  let content = htmlContent;
  if (content.includes("&lt;") && content.includes("&gt;")) {
    content = content
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }
  return content;
};

const titleBaseStyle = {
  fontWeight: "bold" as const,
  fontSize: 18,
  color: "#000",
  textAlign: "center" as const,
};

const titleTagsStyles = {
  h1: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: "#000000",
    textAlign: "center" as const,
    marginVertical: 4,
  },
  h2: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#000000",
    textAlign: "center" as const,
    marginVertical: 4,
  },
  h3: {
    fontSize: 17,
    fontWeight: "bold" as const,
    color: "#000000",
    textAlign: "center" as const,
    marginVertical: 3,
  },
  h4: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: "#000000",
    textAlign: "center" as const,
    marginVertical: 2,
  },
  h5: {
    fontSize: 15,
    fontWeight: "bold" as const,
    color: "#000000",
    textAlign: "center" as const,
    marginVertical: 2,
  },
  h6: {
    fontSize: 14,
    fontWeight: "bold" as const,
    color: "#000000",
    textAlign: "center" as const,
    marginVertical: 2,
  },
  p: { textAlign: "center" as const, color: "#000000" },
  div: { textAlign: "center" as const, color: "#000000" },
  span: { textAlign: "center" as const, color: "#000000" },
  body: { textAlign: "center" as const, color: "#000000" },
  u: { textDecorationLine: "underline" as const, textAlign: "center" as const },
  ins: { textDecorationLine: "underline" as const, textAlign: "center" as const },
  i: { fontStyle: "italic" as const, textAlign: "center" as const },
  em: { fontStyle: "italic" as const, textAlign: "center" as const },
  b: { fontWeight: "bold" as const, textAlign: "center" as const },
  strong: { fontWeight: "bold" as const, textAlign: "center" as const },
  s: { textDecorationLine: "line-through" as const, textAlign: "center" as const },
  strike: { textDecorationLine: "line-through" as const, textAlign: "center" as const },
  del: { textDecorationLine: "line-through" as const, textAlign: "center" as const },
};

const contentTagsStyles = {
  h1: {
    fontSize: 22,
    fontWeight: "bold" as const,
    color: "#111827",
    marginVertical: 8,
    lineHeight: 28,
  },
  h2: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: "#1f2937",
    marginVertical: 6,
    lineHeight: 26,
  },
  h3: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#1f2937",
    marginVertical: 6,
    lineHeight: 24,
  },
  h4: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: "#374151",
    marginVertical: 4,
    lineHeight: 22,
  },
  h5: {
    fontSize: 15,
    fontWeight: "bold" as const,
    color: "#374151",
    marginVertical: 4,
    lineHeight: 20,
  },
  h6: {
    fontSize: 14,
    fontWeight: "bold" as const,
    color: "#4b5563",
    marginVertical: 2,
    lineHeight: 18,
  },
  u: { textDecorationLine: "underline" as const },
  ins: { textDecorationLine: "underline" as const },
  i: { fontStyle: "italic" as const },
  em: { fontStyle: "italic" as const },
  b: { fontWeight: "bold" as const },
  strong: { fontWeight: "bold" as const },
  s: { textDecorationLine: "line-through" as const },
  strike: { textDecorationLine: "line-through" as const },
  del: { textDecorationLine: "line-through" as const },
  p: { marginVertical: 4, color: "#374151", fontSize: 16, lineHeight: 22 },
  span: { color: "#374151" },
  div: { color: "#374151" },
  body: { color: "#374151" },
  ul: { marginVertical: 4 },
  ol: { marginVertical: 4 },
  li: { marginVertical: 2, color: "#374151" },
};

const News: React.FC<NewsProps> = ({ navigation, route }) => {
  const { newsId } = route.params;
  const [news, setNews] = useState<NewsItem | null>(null);
  const [language, setLanguage] = useState("en");
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(true);

  const screenWidth = Dimensions.get("window").width;

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      return () => subscription.remove();
    }, [navigation]),
  );

  useEffect(() => {
    const selectedLanguage = t("Main.LNG");
    setLanguage(selectedLanguage);

    if (!newsId) return;

    setNews(null);
    setLoading(true);

    let isMounted = true;

    const fetchNews = async () => {
      try {
        const res = await axios.get<NewsItem[]>(
          `${environment.API_BASE_URL}api/news/get-news/${newsId}`,
        );
        if (isMounted) {
          if (res.data && res.data.length > 0) {
            setNews(res.data[0]);
          } else {
            setNews(null);
          }
        }
      } catch (err) {
        if (isMounted) {
          setNews(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchNews();

    return () => {
      isMounted = false;
    };
  }, [newsId, t]);

  if (loading) {
    return <LoadingPage fullScreen />;
  }

  if (!news) {
    return (
      <View className="flex-1 bg-white">
        <View className="flex-row ml-5 mt-5 items-center">
          <TouchableOpacity
            className="p-2 bg-transparent"
            onPress={() => navigation.goBack()}
          >
            <Entypo
              name="chevron-left"
              size={24}
              color="#000502"
              style={{
                backgroundColor: "#F6F6F6CC",
                borderRadius: 50,
                padding: wp(2.5),
              }}
            />
          </TouchableOpacity>
        </View>
        <View className="flex-1 justify-center items-center p-6">
          <Text className="text-gray-500 text-base text-center">
            {t("Main.NoDataFound") || "News not found"}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="absolute top-0 left-0 right-0 z-10  ">
        <View className="flex-row ml-5 mt-5 items-center">
          <TouchableOpacity
            className="p-2 bg-transparent"
            onPress={() => navigation.goBack()}
          >
            <Entypo
              name="chevron-left"
              size={24}
              color="#000502"
              style={{
                backgroundColor: "#F6F6F6CC",
                borderRadius: 50,
                padding: wp(2.5),
              }}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}>
        <View className="p-4">
          {news?.image ? (
            <View className="item-center">
              <View className=" right-0 bottom-0 opacity-90 rounded-3xl">
                <Image
                  source={
                    typeof news.image === "string"
                      ? { uri: news.image }
                      : { uri: banner }
                  }
                  className="w-[100%] h-56 bg-black  rounded-3xl shadow-md"
                />
              </View>
              <View className="py-5 -mt-14 items-center l">
                <View className="bg-[#FFFFFF] border-[#f8f8f8] border rounded-3xl shadow-md p-4 w-[90%]">
                  {language === "en" && news?.titleEnglish && (
                    <RenderHtml
                      contentWidth={screenWidth * 0.9 - 32}
                      source={{ html: prepareHtml(news.titleEnglish) }}
                      baseStyle={titleBaseStyle}
                      tagsStyles={titleTagsStyles}
                    />
                  )}
                  {language === "si" && news?.titleSinhala && (
                    <RenderHtml
                      contentWidth={screenWidth * 0.9 - 32}
                      source={{ html: prepareHtml(news.titleSinhala) }}
                      baseStyle={titleBaseStyle}
                      tagsStyles={titleTagsStyles}
                    />
                  )}
                  {language === "ta" && news?.titleTamil && (
                    <RenderHtml
                      contentWidth={screenWidth * 0.9 - 32}
                      source={{ html: prepareHtml(news.titleTamil) }}
                      baseStyle={titleBaseStyle}
                      tagsStyles={titleTagsStyles}
                    />
                  )}
                </View>
              </View>
            </View>
          ) : (
            <Text>Image not available</Text>
          )}
        </View>

        <View className="px-6 flex-row items-center">
          <AntDesign name="calendar" size={20} color="#000502" />
          <Text className="ml-2">
            {news?.createdAt
              ? formatDate(news.createdAt)
              : "Date not available"}
          </Text>
        </View>
        <View className="px-6 pt-2">
          <View className="w-full border-t border-gray-300" />
        </View>
        <View className="px-6 pb-2">
          {language === "en" && news?.descriptionEnglish && (
            <RenderHtml
              contentWidth={screenWidth - 48}
              source={{ html: prepareHtml(news.descriptionEnglish) }}
              baseStyle={{ fontSize: 16, color: "#333", marginTop: 8 }}
              tagsStyles={contentTagsStyles}
            />
          )}
          {language === "si" && news?.descriptionSinhala && (
            <RenderHtml
              contentWidth={screenWidth - 48}
              source={{ html: prepareHtml(news.descriptionSinhala) }}
              baseStyle={{ fontSize: 16, color: "#333", marginTop: 8 }}
              tagsStyles={contentTagsStyles}
            />
          )}
          {language === "ta" && news?.descriptionTamil && (
            <RenderHtml
              contentWidth={screenWidth - 48}
              source={{ html: prepareHtml(news.descriptionTamil) }}
              baseStyle={{ fontSize: 16, color: "#333", marginTop: 8 }}
              tagsStyles={contentTagsStyles}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default News;
