import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import axios from "axios";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import AntDesign from "react-native-vector-icons/AntDesign";
import i18n from "i18next";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import ContentLoader, { Rect, Circle } from "react-content-loader/native";

type PublicForumNavigationProp = StackNavigationProp<
  RootStackParamList,
  "PublicForum"
>;

interface Post {
  id: string;
  heading: string;
  message: string;
  postimage?: Buffer;
  replyCount: string;
  timestamp: string;
  createdAt: string;
}

interface PublicForumProps {
  navigation: PublicForumNavigationProp;
}

const PublicForum: React.FC<PublicForumProps> = ({ navigation }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchText, setSearchText] = useState("");
  const [comment, setComment] = useState<{ [key: string]: string }>({}); // State for typing comments, keyed by post ID
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1); // Page number for pagination
  const [loading, setLoading] = useState(false); // Indicator for loading more posts
  const [hasMore, setHasMore] = useState(true); // Check if more posts are available
  const { t } = useTranslation();
  const screenWidth = wp(100);
  const sampleImage = require("../assets/images/news1.webp");

  useEffect(() => {
    setLoading(true);
    let isMounted = true;
    const fetchPosts = async () => {
      try {
        const response = await axios.get(
          `${environment.API_BASE_URL}api/auth/get`,
          {
            params: { page, limit: 10 },
          }
        );
        if (isMounted) {
          setPosts((prevPosts) => [...prevPosts, ...response.data.posts]);
          setHasMore(response.data.posts.length === 10);
          setTimeout(() => {
            setLoading(false);
          }, 300);
        }
      } catch (error) {
        if (isMounted) {
        }
        setTimeout(() => {
          setLoading(false);
        }, 300);
      }
    };

    fetchPosts();

    return () => {
      isMounted = false; // Cleanup on unmount
    };
  }, [page]);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`https://yourapi.com/posts/${id}`);
      setPosts(posts.filter((post) => post.id !== id));
    } catch (error) {}
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      const limit = 10;
      const response = await axios.get(
        `${environment.API_BASE_URL}api/auth/get`,
        {
          params: { page: 1, limit },
        }
      );

      if (response.data && response.data.posts) {
        setPosts(response.data.posts);
        setPage(1);
        setHasMore(response.data.posts.length === limit);
      } else {
        setPosts([]);
      }
    } catch (error) {
      Alert.alert(t("PublicForum.sorry"), t("PublicForum.failedToRefresh"));
    } finally {
      setRefreshing(false);
    }
  };

  const loadMorePosts = () => {
    if (!loading && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleCommentSubmit = async (postId: string) => {
    try {
      const replyMessage = comment[postId] || "";
      if (replyMessage.trim() === "") {
        Alert.alert(t("PublicForum.sorry"), t("PublicForum.commentEmpty"));
        return;
      }
      const replyId = "";
      const token = await AsyncStorage.getItem("userToken");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      await axios.post(
        `${environment.API_BASE_URL}api/auth/add/reply`,
        {
          chatId: postId,
          replyId: replyId,
          replyMessage: replyMessage,
        },
        { headers }
      );

      // Alert.alert(t("PublicForum.success"), t("PublicForum.commentSuccess"));

      setComment((prev) => ({ ...prev, [postId]: "" }));

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, replyCount: String(Number(post.replyCount) + 1) }
            : post
        )
      );
    } catch (error) {
      Alert.alert(t("PublicForum.sorry"), t("PublicForum.commentFailed"));
    }
  };

  const formatDate = (createdAt: string) => {
    const date = new Date(createdAt); // Parse the date string
    const language = i18n.language || "en"; // Get the current language, default to 'en' if undefined

    return date.toLocaleDateString(language, {
      year: "numeric",
      month: "short", // Use 'short' to get abbreviated month names
      day: "numeric",
    });
  };

  const renderPostItem = ({ item }: { item: Post }) => {
    const postImageSource = item.postimage
      ? `${item.postimage.toString("base64")}`
      : null;

    const dynamicStyles = {
      imageMarginLeft: screenWidth < 400 ? wp(50) : wp(68),
      textMarginLeft: screenWidth < 400 ? wp(12) : wp(0),
    };

    const SkeletonLoader = () => {
      const rectHeight = hp("30%");
      const gap = hp("4%");

      return (
        <View style={{ marginTop: hp("2%"), paddingHorizontal: wp("5%") }}>
          <ContentLoader
            speed={2}
            width={wp("100%")}
            height={hp("150%")}
            viewBox={`0 0 ${wp("100%")} ${hp("150%")}`}
            backgroundColor="#ececec"
            foregroundColor="#fafafa"
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <Rect
                key={`rect-${index}`} // Ensure key is unique
                x="0"
                y={index * (rectHeight + gap)} // Add gap to vertical position
                rx="12"
                ry="20"
                width={wp("90%")}
                height={rectHeight} // Maintain rectangle height
              />
            ))}
          </ContentLoader>
        </View>
      );
    };

    if (loading) {
      return <SkeletonLoader />;
    }

    const truncatedHeading =
      item.heading.length > 25 ? item.heading.substring(0, 25) : item.heading;

    return (
      <View className="bg-white p-4 mb-4 mx-4 rounded-lg shadow-sm border border-gray-300">
        {/* <View className="flex-row justify-between items-start">
          <View className="flex-row items-center">
            <Text className="font-bold text-base ">{item.heading}</Text>
          </View>
          <View className="">
            <Text style={{ color: "gray" }}>{formatDate(item.createdAt)}</Text>
          </View>
        </View> */}
        <View className="flex-row justify-between ">
          <View className="flex-1 max-w-4/5">
            <Text
              className="font-bold text-base overflow-hidden"
              numberOfLines={1}
            >
              {truncatedHeading}
            </Text>
            {item.heading.length > 20 && (
              <Text className="font-bold text-base ">
                {item.heading.substring(20).replace(/^\s+/, "")}
              </Text>
            )}
          </View>
          <TouchableOpacity>
            <Text className="text-gray-500">{formatDate(item.createdAt)}</Text>
          </TouchableOpacity>
        </View>

        <View className="border border-gray-300 mt-2 rounded-lg">
          {postImageSource && (
            <Image
              source={{ uri: postImageSource }}
              className="w-full h-40 my-3 rounded-lg"
              resizeMode="contain"
            />
          )}
        </View>

        <Text className="text-gray-700 mt-3">{item.message}</Text>

        <View className="border-t border-gray-200 my-3" />

        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("PublicForumReplies", { postId: item.id })
              }
              className="mb-2 "
              style={{ marginLeft: dynamicStyles.imageMarginLeft }}
            >
              <Text
                className="text-blue-500 text-sm"
                style={{ marginLeft: dynamicStyles.textMarginLeft }}
              >
                {item.replyCount} {t("PublicForum.replies")}
              </Text>
            </TouchableOpacity>

            {/* <View className="flex-row items-center relative">
              <TextInput
                className="flex-1 text-gray-500 text-sm py-2 px-4 pr-10 border border-gray-300 rounded-full"
                placeholder={t("PublicForum.writeacomment")}
                value={comment[item.id] || ""}
                onChangeText={(text) =>
                  setComment((prev) => ({ ...prev, [item.id]: text }))
                }
              />
              <TouchableOpacity
                className="absolute right-2 top-1/3 transform -translate-y-1/2"
                onPress={() => handleCommentSubmit(item.id)}
              >
                <Feather name="send" size={20} color="gray" />
              </TouchableOpacity>
            </View> */}
            <View className="flex-row items-center relative">
              <TextInput
                className="flex-1 text-gray-500 text-sm py-2 px-4 pr-10 border border-gray-300 rounded-full"
                placeholder={t("PublicForum.writeacomment")}
                value={comment[item.id] || ""}
                onChangeText={(text) =>
                  setComment((prev) => ({ ...prev, [item.id]: text }))
                }
              />
              <TouchableOpacity
                className="absolute right-2 top-1/4 transform -translate-y-1/2"
                onPress={() => handleCommentSubmit(item.id)}
                disabled={!comment[item.id]?.trim()}
              >
                <Feather
                  name="send"
                  size={20}
                  color={!comment[item.id]?.trim() ? "lightgray" : "gray"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!hasMore) return null; // No more posts to load
    return (
      <View className="p-4">
        {loading ? (
          <View className="flex-row items-center justify-center">
            <ActivityIndicator size="small" color="gray" />
            <Text className="ml-2 text-gray-500">
              {t("PublicForum.loadingMore")}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            className="py-2 px-4 flex-row items-center justify-center"
            onPress={loadMorePosts}
          >
            <Text className="text-black font-bold">
              {t("PublicForum.viewMore")}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#DCFBE3]">
      <View className="flex-row items-center p-4 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="left" size={24} color="#000502" />
        </TouchableOpacity>
        <View className="flex-1 items-center flex-row justify-center">
          <View className="mr-2">
            <MaterialCommunityIcons
              name="message-processing"
              size={30}
              color="black"
            />
          </View>
          <Text className="text-lg font-semibold">
            {t("PublicForum.publicforum")}
          </Text>
        </View>
      </View>

      <View className="p-5 bg-[#DCFBE3]">
        <View className="flex-row items-center bg-white p-2 rounded-full shadow">
          <Feather name="search" size={20} color="gray" />
          <TextInput
            className="ml-2 flex-1 text-gray-600"
            placeholder={t("PublicForum.search")}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      <TouchableOpacity
        className="bg-green-500 rounded-full p-3 mx-4 mb-4 flex-row items-center justify-center"
        onPress={() => {
          navigation.navigate("PublicForumPost");
        }}
      >
        <Text className="text-white font-bold">
          {t("PublicForum.startanewdiscussion")}
        </Text>
        <Feather name="plus" size={26} color="white" className="ml-2" />
      </TouchableOpacity>

      <FlatList
        data={posts.filter(
          (post) =>
            (post.heading || "")
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            (post.message || "")
              .toLowerCase()
              .includes(searchText.toLowerCase())
        )}
        keyExtractor={(item) => item.id}
        renderItem={renderPostItem}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

export default PublicForum;
