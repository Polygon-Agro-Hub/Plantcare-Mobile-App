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
  Keyboard,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import axios from "axios";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from "../types/types";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import { RefreshControl } from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import CustomHeader from "../common/CustomHeader";

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
  const [submitting, setSubmitting] = useState(false);
  const [inputHeight, setInputHeight] = useState(40);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  const { t } = useTranslation();
  const route = useRoute();
  const { postId, own, userId } = route.params as {
    postId: string;
    own: string;
    userId: number;
  };

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${environment.API_BASE_URL}api/auth/get/${postId}/`,
      );
      const sortedComments = response.data.sort((a: Comment, b: Comment) => {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });

      setComments(sortedComments);
    } catch (error) {
      console.error("Error fetching comments", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim() === "" || submitting) return;

    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem("userToken");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      let response;

      if (editingCommentId) {
        response = await axios.put(
          `${environment.API_BASE_URL}api/auth/update/reply/${editingCommentId}`,
          {
            replyMessage: newComment,
          },
          { headers },
        );
      } else {
        response = await axios.post(
          `${environment.API_BASE_URL}api/auth/add/reply`,
          {
            chatId: postId,
            replyMessage: newComment,
          },
          { headers },
        );
      }

      const commentData = response.data;
      if (commentData && !commentData.createdAt) {
        commentData.createdAt = new Date().toISOString();
      }

      await fetchComments();

      setNewComment("");
      setEditingCommentId(null);

      setInputHeight(40);
      dismissKeyboard();
    } catch (error) {
      console.error("Error with comment:", error);
      Alert.alert(
        t("PublicForum.sorry"),
        editingCommentId
          ? t("PublicForum.FailedToUpdatePost")
          : t("PublicForum.FailedToAddComment"),
      );
    } finally {
      setSubmitting(false);
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

  const handleContentSizeChange = (event: {
    nativeEvent: { contentSize: { height: any } };
  }) => {
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
  };

  const handleEditComment = (commentId: string) => {
    setActiveMenuId(null);

    const commentToEdit = comments.find((comment) => comment.id === commentId);
    if (commentToEdit) {
      setEditingCommentId(commentId);
      setNewComment(commentToEdit.replyMessage);

      const lines = commentToEdit.replyMessage.split("\n").length;
      const estimatedHeight = Math.min(Math.max(lines * 20 + 20, 40), 120);
      setInputHeight(estimatedHeight);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    setActiveMenuId(null);

    Alert.alert(
      t("Main.Delete"),
      t("PublicForum.AreYouSureYouWantToDeleteThisComment"),
      [
        {
          text: t("Main.Cancel"),
          style: "cancel",
        },
        {
          text: t("Main.Delete"),
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("userToken");
              const headers = {
                Authorization: `Bearer ${token}`,
              };

              await axios.delete(
                `${environment.API_BASE_URL}api/auth/delete/reply/${commentId}`,
                { headers },
              );

              await fetchComments();
            } catch (error) {
              console.error("Error deleting comment:", error);
              Alert.alert(
                t("Main.Error"),
                t("PublicForum.FailedToDDeletedComment"),
                [{ text: t("Main.OK") }],
              );
            }
          },
        },
      ],
    );
  };

  const isUserComment = (item: Comment) => {
    const commentUserId = item.replyStaffId || item.replyId;
    return commentUserId === userId;
  };

  const isPostOwner = own === "1";

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => {
        backHandler.remove();
      };
    }, [navigation]),
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      enabled
      className="bg-[#F4F7FF]"
      style={{ flex: 1 }}
    >
      <CustomHeader
        title=""
        showBackButton={true}
        navigation={navigation}
        onBackPress={() => navigation.goBack()}
        transparent
      />
      <View className="flex-1 p-4 bg-[#F4F7FF]">
        <FlatList
          data={comments}
          keyExtractor={(item, index) =>
            `${item.id}-${item.createdAt}-${index}`
          }
          renderItem={({ item }) => {
            const isOwnComment = isUserComment(item);

            return (
              <View
                className={`bg-white mb-4 rounded-lg shadow-sm border border-gray-300 ${isOwnComment ? "self-end ml-12" : "self-start mr-12"
                  }`}
                style={{ width: "90%" }}
              >
                <View className="flex-row justify-between p-4">
                  <View className="flex-1 max-w-4/5">
                    <View>
                      <Text
                        className={`text-base overflow-hidden  ${isOwnComment || isPostOwner
                          ? "font-bold"
                          : "font-bold text-gray-600"
                          }`}
                        numberOfLines={1}
                      >
                        {item.userName || "GoviCare"}{" "}
                        {isOwnComment && t("PublicForum.(You)")}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center gap-3">
                    <Text className="text-gray-500">
                      {formatDate(item.createdAt)}
                    </Text>
                    {(isOwnComment || isPostOwner) && (
                      <TouchableOpacity
                        onPress={() => toggleMenu(item.id)}
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                      >
                        <Entypo
                          name="dots-three-vertical"
                          size={15}
                          color="black"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <View className="border-t border-gray-200" />

                <View className="px-4 pb-4">
                  <Text
                    className={`text-gray-700 mt-3 ${editingCommentId === item.id ? "bg-yellow-100 p-2 rounded" : ""}`}
                  >
                    {item.replyMessage}
                    {editingCommentId === item.id && (
                      <Text className="text-xs text-gray-500 ml-2">
                        {" "}
                        {t("PublicForum.Editing...")}
                      </Text>
                    )}
                  </Text>
                </View>

                {activeMenuId === item.id && (
                  <View className="absolute top-12 right-6 bg-white rounded-lg border border-gray-200 shadow-lg z-10">
                    {isOwnComment && (
                      <TouchableOpacity
                        onPress={() => handleEditComment(item.id)}
                        className="rounded-lg py-2 px-4"
                      >
                        <Text className="text-[16px]">
                          {t("PublicForum.Edit")}
                        </Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      onPress={() => handleDeleteComment(item.id)}
                      className="rounded-lg py-2 px-4"
                    >
                      <Text className="text-[16px] text-red-600">
                        {t("Main.Delete")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            loading ? (
              <View className="flex-1 justify-center items-center py-8">
                <ActivityIndicator size="large" color="#000" />
                <Text className="text-gray-500 text-base mt-4">
                  {t("PublicForum.LoadingComments") || "Loading comments..."}
                </Text>
              </View>
            ) : (
              <View className="flex-1 justify-center items-center py-8">
                <Text className="text-gray-500 text-lg">
                  {t("PublicForum.NotHaveAnyCommentYet")}
                </Text>
              </View>
            )
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 80,
          }}
        />
      </View>

      <View className="absolute bottom-0 left-0 right-0 bg-[#F4F7FF] border-t border-gray-200">
        <View className="flex-row items-center p-4">
          <View className="flex-row items-center w-full h-[50px]">
            <TextInput
              value={newComment}
              onChangeText={setNewComment}
              placeholderTextColor="#000000"
              placeholder={
                editingCommentId
                  ? t("PublicForum.EditYourComment...")
                  : t("PublicForum.WriteAComment")
              }
              multiline={true}
              textAlignVertical="top"
              onContentSizeChange={handleContentSizeChange}
              editable={!submitting}
              style={{
                height: inputHeight,
                maxHeight: 120,
                minHeight: 40,
                opacity: submitting ? 0.6 : 1,
                borderColor: editingCommentId ? "#D1D5DB" : "#D1D5DB",
                borderWidth: editingCommentId ? 2 : 1,
              }}
              className={`flex-1 px-3 py-2 rounded-lg mr-2  ${editingCommentId ? "bg-gray-50" : "bg-gray-50"}`}
              scrollEnabled={inputHeight >= 120}
              autoFocus={editingCommentId ? true : false}
            />

            <TouchableOpacity
              onPress={handleAddComment}
              className={`px-4 py-2 rounded-lg ${newComment.trim() === "" || submitting
                ? "bg-gray-400"
                : editingCommentId
                  ? "bg-green-500"
                  : "bg-[#0075FF]"
                }`}
              disabled={newComment.trim() === "" || submitting}
              style={{
                height: 40,
                minWidth: 60,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white">
                  {editingCommentId
                    ? t("Main.Update")
                    : t("PublicForum.Send")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default PublicForumReplies;
