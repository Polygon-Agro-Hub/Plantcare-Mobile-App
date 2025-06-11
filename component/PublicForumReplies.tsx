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

// const PublicForumReplies: React.FC<PublicForumRepliesProps> = ({
//   navigation,
// }) => {
//   const [comments, setComments] = useState<Comment[]>([]);
//   const [newComment, setNewComment] = useState("");
//   const [refreshing, setRefreshing] = useState(false); // State for refreshing
//   const { t } = useTranslation();
//   const route = useRoute();
//   const { postId } = route.params as { postId: string };

//   useEffect(() => {
//     fetchComments();
//   }, [postId]);

//   const fetchComments = async () => {
//     try {
//       const response = await axios.get(
//         `${environment.API_BASE_URL}api/auth/get/${postId}/`
//       );
//       const sortedComments = response.data.sort((a: Comment, b: Comment) => {
//         return (
//           new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
//         );
//       });

//       setComments(sortedComments);
//       // setComments(response.data);
//       console.log("Comments", response.data);
//     } catch (error) {
//       console.error("Error fetching comments", error);
//     }
//   };

//   const handleAddComment = async () => {
//     try {
//       const token = await AsyncStorage.getItem("userToken");
//       const replyId = "";

//       const headers = {
//         Authorization: `Bearer ${token}`,
//       };

//       const response = await axios.post(
//         `${environment.API_BASE_URL}api/auth/add/reply`,
//         {
//           chatId: postId,
//           replyId: replyId,
//           replyMessage: newComment,
//         },
//         { headers }
//       );

//       setComments([...comments, response.data]);
//       setNewComment("");
//       dismissKeyboard();

//       // Alert.alert(t("PublicForum.success"), t("PublicForum.commentSuccess"));
//     } catch (error) {
//       Alert.alert(t("PublicForum.sorry"), t("PublicForum.commentFailed"));
//     }
//   };

//    const dismissKeyboard = () => {
//       Keyboard.dismiss();
//     };

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await fetchComments(); 
//     setRefreshing(false); 
//   };

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//       enabled
//       style={{ flex: 1 }}
//     >
//       <ScrollView
//         contentContainerStyle={{ flexGrow: 1, padding: 16 }}
//         keyboardShouldPersistTaps="handled"
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//       >
//         <View className="flex-row justify-between mb-8 ">
//           <TouchableOpacity onPress={() => navigation.goBack()} className="">
//             <AntDesign name="left" size={24} color="#000502" />
//           </TouchableOpacity>
//         </View>

//         <View className="flex-1 bg-gray-100 p-2 -mt-2">
//           <FlatList
//             data={comments}
//             keyExtractor={(item) => item.id}
//             renderItem={({ item }) => (
//               <View className="bg-white p-4 mb-4 rounded-lg shadow-sm">
//                 <Text className="font-bold text-lg">{item.userName}</Text>
//                 <Text className="text-gray-700 mt-2">{item.replyMessage}</Text>
//                 <Text className="text-gray-400 mt-2">
//                   {new Date(item.createdAt).toLocaleTimeString()}
//                 </Text>
//               </View>
//             )}
//             // refreshing={refreshing} // Connect refreshing state
//             // onRefresh={onRefresh} // Connect onRefresh function
//           />
//         </View>
//       </ScrollView>
//       <View
//         className="flex-row items-center mt-4 p-6
//           bottom-4 "
//       >
//         <TextInput
//           value={newComment}
//           onChangeText={setNewComment}
//           placeholder={t("PublicForum.writeacomment")}
//           className="flex-1 bg-white p-2 rounded-lg border border-gray-300"
//         />
//         {/* <TouchableOpacity
//               onPress={handleAddComment}
//               className="ml-2 bg-blue-500 px-4 py-2 rounded-lg"
//             >
//               <Text className="text-white">{t("PublicForum.send")}</Text>
//             </TouchableOpacity> */}
//         <TouchableOpacity
//           onPress={handleAddComment}
//           className={`ml-2 px-4 py-2 rounded-lg ${
//             newComment.trim() === "" ? "bg-gray-400" : "bg-blue-500"
//           }`}
//           disabled={newComment.trim() === ""}
//         >
//           <Text className="text-white">{t("PublicForum.send")}</Text>
//         </TouchableOpacity>
//       </View>
//     </KeyboardAvoidingView>
//   );
// };

// export default PublicForumReplies;

const PublicForumReplies: React.FC<PublicForumRepliesProps> = ({
  navigation,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state
  const [inputHeight, setInputHeight] = useState(40);
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
      console.log("Comments", response.data);
    } catch (error) {
      console.error("Error fetching comments", error);
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim() === "" || loading) return; // Prevent multiple submissions
    
    setLoading(true); // Start loading
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

      // Validate the response data before adding to comments
      const newCommentData = response.data;
      
      // Ensure createdAt is properly formatted
      if (newCommentData && !newCommentData.createdAt) {
        newCommentData.createdAt = new Date().toISOString();
      }

      // Instead of adding to existing comments, refresh the list to get the latest data
      await fetchComments();
      
      setNewComment("");
      setInputHeight(40);
      dismissKeyboard();
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert(t("PublicForum.sorry"), t("PublicForum.commentFailed"));
    } finally {
      setLoading(false); // Stop loading
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

  // Helper function to safely format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? "Just now" : date.toLocaleTimeString();
    } catch (error) {
      return "Just now";
    }
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
        <View className="flex-row justify-between mb-8">
          <TouchableOpacity onPress={() => navigation.goBack()} className="">
            <AntDesign name="left" size={24} color="#000502" />
          </TouchableOpacity>
        </View>

        <View className="flex-1 bg-gray-100 p-2 -mt-2">
          {/* <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="bg-white p-4 mb-4 rounded-lg shadow-sm">
                <Text className="font-bold text-lg">{item.userName}</Text>
                <Text className="text-gray-700 mt-2">{item.replyMessage}</Text>
                <Text className="text-gray-400 mt-2">
                  {formatDate(item.createdAt)}
                </Text>
              </View>
            )}
          /> */}
          <FlatList
  data={comments}
  keyExtractor={(item, index) => `${item.id}-${item.createdAt}-${index}`} // Ensuring uniqueness with createdAt and index
  renderItem={({ item }) => (
    <View className="bg-white p-4 mb-4 rounded-lg shadow-sm">
      <Text className="font-bold text-lg">{item.userName}</Text>
      <Text className="text-gray-700 mt-2">{item.replyMessage}</Text>
      <Text className="text-gray-400 mt-2">
        {formatDate(item.createdAt)}
      </Text>
    </View>
  )}
/>

        </View>
      </ScrollView>
      
      <View className="flex-row items-center mt-4 p-6 bottom-4">
        <TextInput
          value={newComment}
          onChangeText={setNewComment}
          placeholder={t("PublicForum.writeacomment")}
          multiline={true}
          textAlignVertical="top"
          onContentSizeChange={handleContentSizeChange}
          editable={!loading} // Disable input while loading
          style={{
            height: inputHeight,
            maxHeight: 60,
            minHeight: 40,
            opacity: loading ? 0.6 : 1, // Visual feedback when loading
          }}
          className="flex-1 bg-gray-50 px-3 py-2 rounded-lg border border-gray-300 mr-2"
          scrollEnabled={inputHeight >= 120}
        />
        
        <TouchableOpacity
          onPress={handleAddComment}
          className={`px-4 py-2 rounded-lg ${
            newComment.trim() === "" || loading ? "bg-gray-400" : "bg-blue-500"
          }`}
          disabled={newComment.trim() === "" || loading}
          style={{ 
            height: 40,
            minWidth: 60, // Ensure consistent width for loading state
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white">{t("PublicForum.send")}</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default PublicForumReplies;