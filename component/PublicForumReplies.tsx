import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import axios from "axios";
import { useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { RootStackParamList } from "./types";

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

const PublicForumReplies: React.FC<PublicForumRepliesProps> = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [refreshing, setRefreshing] = useState(false); // State for refreshing
  const route = useRoute();
  const { postId } = route.params as { postId: string };

  useEffect(() => {
    fetchComments(); // Fetch comments when the component mounts
  }, [postId]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(
        `http://10.0.2.2:3000/api/auth/get/${postId}/`
      );
      setComments(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching comments", error);
    }
  };

  const handleAddComment = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const replyId = ""; // Set this to the user's ID or appropriate identifier

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await axios.post(
        `http://10.0.2.2:3000/api/auth/add/reply`,
        {
          chatId: postId,
          replyId: replyId,
          replyMessage: newComment,
        },
        { headers }
      );

      setComments([...comments, response.data]);
      setNewComment("");
      Alert.alert("Comment added successfully");
    } catch (error) {
      console.error("Error adding comment", error);
      Alert.alert("Error", "Failed to add comment.");
    }
  };

  // Function to handle refresh action
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchComments(); // Fetch comments again
    setRefreshing(false); // Set refreshing to false
  };

  return (
    <View className="flex-1 bg-gray-100 p-4">
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
        refreshing={refreshing} // Connect refreshing state
        onRefresh={onRefresh} // Connect onRefresh function
      />
      <View className="flex-row items-center mt-4">
        <TextInput
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Write a comment..."
          className="flex-1 bg-white p-2 rounded-lg border border-gray-300"
        />
        <TouchableOpacity
          onPress={handleAddComment}
          className="ml-2 bg-blue-500 px-4 py-2 rounded-lg"
        >
          <Text className="text-white">Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PublicForumReplies;
