import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import axios from "axios";
import { useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { RootStackParamList } from "./types";
import { environment } from "@/environment/environment";
import AntDesign from "react-native-vector-icons/AntDesign";
import { useTranslation } from "react-i18next";
import { RefreshControl } from "react-native";

type PublicForumRepliesNavigationProp = StackNavigationProp<
  RootStackParamList,
  "PublicForumReplies"
>;

interface PublicForumRepliesProps {
  navigation: PublicForumRepliesNavigationProp;
}

interface Comment {
  id: string;
  replyMessage: string;
  userName: string;
  createdAt: string;
}

const PublicForumReplies: React.FC<PublicForumRepliesProps> = ({
  navigation,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [refreshing, setRefreshing] = useState(false); // State for refreshing
  const { t } = useTranslation();
  const route = useRoute();
  const { postId } = route.params as { postId: string };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(
        `${environment.API_BASE_URL}api/auth/get/${postId}/`
      );
      const sortedComments = response.data.sort((a: Comment, b: Comment) => {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });

      setComments(sortedComments);
      // setComments(response.data);
      console.log("Comments", response.data);
    } catch (error) {
      console.error("Error fetching comments", error);
    }
  };

  const handleAddComment = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const replyId = "";

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await axios.post(
        `${environment.API_BASE_URL}api/auth/add/reply`,
        {
          chatId: postId,
          replyId: replyId,
          replyMessage: newComment,
        },
        { headers }
      );

      setComments([...comments, response.data]);
      setNewComment("");
      Alert.alert(t("PublicForum.success"), t("PublicForum.commentSuccess"));
    } catch (error) {
      console.error("Error adding comment", error);
      Alert.alert(t("PublicForum.error"), t("PublicForum.commentFailed"));
    }
  };

  // Function to handle refresh action
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchComments(); // Fetch comments again
    setRefreshing(false); // Set refreshing to false
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      enabled
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 16 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex-row justify-between mb-8 ">
          <TouchableOpacity onPress={() => navigation.goBack()} className="">
            <AntDesign name="left" size={24} color="#000502" />
          </TouchableOpacity>
        </View>

        <View className="flex-1 bg-gray-100 p-2 -mt-2">
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="bg-white p-4 mb-4 rounded-lg shadow-sm">
                <Text className="font-bold text-lg">{item.userName}</Text>
                <Text className="text-gray-700 mt-2">{item.replyMessage}</Text>
                <Text className="text-gray-400 mt-2">
                  {new Date(item.createdAt).toLocaleTimeString()}
                </Text>
              </View>
            )}
            // refreshing={refreshing} // Connect refreshing state
            // onRefresh={onRefresh} // Connect onRefresh function
          />

        </View>
      </ScrollView>
                <View className="flex-row items-center mt-4 p-4
          bottom-4 ">
            <TextInput
              value={newComment}
              onChangeText={setNewComment}
              placeholder={t("PublicForum.writeacomment")}
              className="flex-1 bg-white p-2 rounded-lg border border-gray-300"
            />
            <TouchableOpacity
              onPress={handleAddComment}
              className="ml-2 bg-blue-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white">{t("PublicForum.send")}</Text>
            </TouchableOpacity>
          </View>
    </KeyboardAvoidingView>
  );
};

export default PublicForumReplies;
