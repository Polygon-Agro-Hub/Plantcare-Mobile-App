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
  Keyboard,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from "./types";
import { environment } from "@/environment/environment";
import AntDesign from "react-native-vector-icons/AntDesign";
import { useTranslation } from "react-i18next";
import { RefreshControl } from "react-native";
import Entypo from "react-native-vector-icons/Entypo";

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
  replyId: number;
  replyStaffId: number;
}

const PublicForumReplies: React.FC<PublicForumRepliesProps> = ({
  navigation,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputHeight, setInputHeight] = useState(40);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [originalComment, setOriginalComment] = useState("");
  const { t } = useTranslation();
  const route = useRoute();
  const { postId, own, userId } = route.params as { postId: string, own: string, userId: number };
  console.log("navigation data===========", postId, own, userId);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

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
      console.log("Comments", response.data);
    } catch (error) {
      console.error("Error fetching comments", error);
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim() === "" || loading) return;
    
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      let response;
      
      if (editingCommentId) {
        // Update existing comment
        response = await axios.put(
          `${environment.API_BASE_URL}api/auth/update/reply/${editingCommentId}`,
          {
            replyMessage: newComment,
          },
          { headers }
        );
        console.log("Comment updated:", response.data);
      } else {
        // Add new comment
        const replyId = "";
        response = await axios.post(
          `${environment.API_BASE_URL}api/auth/add/reply`,
          {
            chatId: postId,
            replyId: replyId,
            replyMessage: newComment,
          },
          { headers }
        );
        console.log("New comment added:", response.data);
      }

      const commentData = response.data;
      if (commentData && !commentData.createdAt) {
        commentData.createdAt = new Date().toISOString();
      }

      await fetchComments();
      
      // Reset states
      setNewComment("");
      setEditingCommentId(null);
      setOriginalComment("");
      setInputHeight(40);
      dismissKeyboard();
    } catch (error) {
      console.error("Error with comment:", error);
      Alert.alert(t("PublicForum.sorry"), editingCommentId ? t("PublicForum.updateFailed") : t("PublicForum.commentFailed"));
    } finally {
      setLoading(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchComments();
    setRefreshing(false);
  };

  const handleContentSizeChange = (event: { nativeEvent: { contentSize: { height: any; }; }; }) => {
    const { height } = event.nativeEvent.contentSize;
    const maxHeight = 120;
    const minHeight = 40;
    
    setInputHeight(Math.min(Math.max(height, minHeight), maxHeight));
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? "Just now" : date.toLocaleTimeString();
    } catch (error) {
      return "Just now";
    }
  };

  const toggleMenu = (id: string) => {
    setActiveMenuId(activeMenuId === id ? null : id);
    console.log("Toggling menu for post ID:", id);
  };

  const handleEditComment = (commentId: string) => {
    setActiveMenuId(null);
    
    // Find the comment to edit
    const commentToEdit = comments.find(comment => comment.id === commentId);
    if (commentToEdit) {
      setEditingCommentId(commentId);
      setNewComment(commentToEdit.replyMessage);
      setOriginalComment(commentToEdit.replyMessage);
      
      // Calculate input height based on comment content
      const lines = commentToEdit.replyMessage.split('\n').length;
      const estimatedHeight = Math.min(Math.max(lines * 20 + 20, 40), 120);
      setInputHeight(estimatedHeight);
    }
    console.log("Edit comment:", commentId);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setNewComment("");
    setOriginalComment("");
    setInputHeight(40);
  };

  const handleDeleteComment = (commentId: string) => {
    setActiveMenuId(null);
   
    Alert.alert(
      t("Delete Comment"),
      t("Are you sure you want to delete this comment?"),
      [
        {
          text: t("Cancel"),
          style: "cancel"
        },
        {
          text: t("Delete"),
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("userToken");
              const headers = {
                Authorization: `Bearer ${token}`,
              };
              
              // Replace with your actual delete API endpoint
              await axios.delete(
                `${environment.API_BASE_URL}api/auth/delete/reply/${commentId}`,
                { headers }
              );
              
              // Refresh comments after deletion
              await fetchComments();
              console.log("Comment deleted successfully:", commentId);
            } catch (error) {
              console.error("Error deleting comment:", error);
              Alert.alert(t("Error"), t("Failed to delete comment"));
            }
          }
        }
      ]
    );
  };


  const isUserComment = (item: Comment) => {
    const commentUserId = item.replyStaffId || item.replyId;
    return commentUserId === userId;
  };

  // Check if current user is the post owner
  const isPostOwner = own === "1";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      enabled
      className="bg-[#F4F7FF]"
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 16 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex-row justify-between mb-8">
          <TouchableOpacity onPress={() => navigation.goBack()} className="">
            <AntDesign name="left" size={24} color="#000502" />
          </TouchableOpacity>
        </View>

        <View className="flex-1 p-2 -mt-2 bg-[#F4F7FF]">
          <FlatList
            data={comments}
            keyExtractor={(item, index) => `${item.id}-${item.createdAt}-${index}`}
            renderItem={({ item }) => {
              const isOwnComment = isUserComment(item);
              
              return (
              <View
                  className={`bg-white mb-4 rounded-lg shadow-sm border border-gray-300 ${
                    isOwnComment ? "self-end ml-12" : "self-start mr-12"
                    
                  }`}
                  style={{ width: "90%" }} 
                >
                  <View className="flex-row justify-between p-4">
                   <View className="flex-1 max-w-4/5">
  {(isOwnComment || isPostOwner) && (
    <View>
      <Text className="font-bold text-base overflow-hidden" numberOfLines={1}>
        {item.userName} {isOwnComment && "(You)"}
      </Text>
    </View>
  )}
</View>
                    <View className="flex-row items-center space-x-3">
                      <Text className="text-gray-500">{formatDate(item.createdAt)}</Text>
                      {(isOwnComment || isPostOwner) && (
                        <TouchableOpacity
                          onPress={() => toggleMenu(item.id)}
                          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                        >
                          <Entypo name="dots-three-vertical" size={15} color="black" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                  
                  <View className="border-t border-gray-200" />
                  
                  <View className="px-4 pb-4">
                    <Text className={`text-gray-700 mt-3 ${editingCommentId === item.id ? 'bg-yellow-100 p-2 rounded' : ''}`}>
                      {item.replyMessage}
                      {editingCommentId === item.id && (
                        <Text className="text-xs text-gray-500 ml-2">(Editing...)</Text>
                      )}
                    </Text>
                  </View>

                  {/* Menu dropdown - positioned absolutely like in your working code */}
                  {activeMenuId === item.id && (
                    <View className="absolute top-12 right-6 bg-white rounded-lg border border-gray-200 shadow-lg">
                      {/* Show Edit only for own comments */}
                      {isOwnComment && (
                        <TouchableOpacity
                          onPress={() => handleEditComment(item.id)}
                          className="rounded-lg py-2 px-4"
                        >
                          <Text className="text-[16px]">
                            {t("Edit")}
                          </Text>
                        </TouchableOpacity>
                      )}
                      
                 
                      <TouchableOpacity
                        onPress={() => handleDeleteComment(item.id)}
                        className="rounded-lg py-2 px-4"
                      >
                        <Text className="text-[16px] text-red-600">
                          {t("Delete")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            }}
          />
        </View>
      </ScrollView>
      
      <View className="flex-row items-center mt-4 p-6 bottom-4 bg-[#F4F7FF]">
 
       
        
        <View className="flex-row items-center w-full">
          <TextInput
            value={newComment}
            onChangeText={setNewComment}
            placeholder={editingCommentId ? t("Edit your comment...") : t("PublicForum.writeacomment")}
            multiline={true}
            textAlignVertical="top"
            onContentSizeChange={handleContentSizeChange}
            editable={!loading}
            style={{
              height: inputHeight,
              maxHeight: 120,
              minHeight: 40,
              opacity: loading ? 0.6 : 1,
              borderColor: editingCommentId ? '#D1D5DB' : '#D1D5DB',
              borderWidth: editingCommentId ? 2 : 1,
            }}
            className={`flex-1 px-3 py-2 rounded-lg mr-2 ${editingCommentId ? 'bg-gray-50' : 'bg-gray-50'}`}
            scrollEnabled={inputHeight >= 120}
            autoFocus={editingCommentId ? true : false}
          />
          
          <TouchableOpacity
            onPress={handleAddComment}
            className={`px-4 py-2 rounded-lg ${
              newComment.trim() === "" || loading ? "bg-gray-400" : editingCommentId ? "bg-green-500" : "bg-blue-500"
            }`}
            disabled={newComment.trim() === "" || loading}
            style={{ 
              height: 40,
              minWidth: 60,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white">
                {editingCommentId ? t("Update") : t("PublicForum.send")}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default PublicForumReplies;