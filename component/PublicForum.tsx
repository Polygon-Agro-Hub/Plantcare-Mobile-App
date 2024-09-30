// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   TextInput,
//   Alert,
//   Image,
// } from "react-native";
// import axios from "axios";
// import { StackNavigationProp } from "@react-navigation/stack";
// import { RootStackParamList } from "./types";
// import { Feather } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import Icon from "react-native-vector-icons/Ionicons";
// import { environment } from "@/environment/environment";
// import AntDesign from 'react-native-vector-icons/AntDesign';

// type PublicForumNavigationProp = StackNavigationProp<
//   RootStackParamList,
//   "PublicForum"
// >;

// interface Post {
//   id: string;
//   heading: string;
//   message: string;
//   postimage?: Buffer;
//   replyCount: string;
//   timestamp: string;
//   createdAt: string
// }

// interface PublicForumProps {
//   navigation: PublicForumNavigationProp;
// }

// const PublicForum: React.FC<PublicForumProps> = ({ navigation }) => {
//   const [posts, setPosts] = useState<Post[]>([]);
//   const [searchText, setSearchText] = useState("");
//   const [comment, setComment] = useState("");
//   const [refreshing, setRefreshing] = useState(false);

//   useEffect(() => {
//     fetchPosts();
//   }, []);

//   const fetchPosts = async () => {
//     try {
//       const response = await axios.get(`${environment.API_BASE_URL}api/auth/get`);
//       setPosts(response.data);
//       console.log("hiiiiii...", response.data)
//     } catch (error) {
//       console.error("Error fetching posts:", error);
//     }
//   };

//   const handleDelete = async (id: string) => {
//     try {
//       await axios.delete(`https://yourapi.com/posts/${id}`);
//       setPosts(posts.filter((post) => post.id !== id));
//     } catch (error) {
//       console.error("Error deleting post", error);
//     }
//   };

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await fetchPosts();
//     setRefreshing(false);
//   };

//   const handleCommentSubmit = async (postId: string) => {
//     try {
//       const replyId = ""; // Set this to the user's ID or appropriate identifier
//       const token = await AsyncStorage.getItem("userToken");

//       const headers = {
//         Authorization: `Bearer ${token}`,
//       };

//       await axios.post(
//         `${environment.API_BASE_URL}api/auth/add/reply`,
//         {
//           chatId: postId,
//           replyId: replyId,
//           replyMessage: comment,
//         },
//         { headers }
//       );

//       Alert.alert("Comment added successfully");
//       setComment("");
//       fetchPosts();
//     } catch (error) {
//       console.log("Error sending comment:", error);
//       Alert.alert("Error", "Failed to add comment.");
//     }
//   };

//   const renderPostItem = ({ item }: { item: Post }) => {
//     const postImageSource = item.postimage
//       ? `data:image/jpeg;base64,${item.postimage.toString("base64")}`
//       : null;

//     return (
//       <View className="bg-white p-4 mb-4 mx-4 rounded-lg shadow-sm border border-gray-300">
//         <View className="flex-row justify-between items-start">
//           <View className="flex-row items-center">
//             <Text className="font-bold text-base">{item.heading}</Text>
//           </View>
//           <TouchableOpacity>
//             {/* <Feather name="more-horizontal" size={20} color="gray" /> */}
//             <Text>{item.createdAt}</Text>
//           </TouchableOpacity>
//         </View>

//         {postImageSource && (
//           <Image
//             source={{ uri: postImageSource }}
//             className="w-full h-40 my-3 rounded-lg"
//             resizeMode="cover"
//           />
//         )}

//         <Text className="text-gray-700 mt-3">{item.message}</Text>

//         <View className="border-t border-gray-200 my-3" />

//         <View className="flex-row justify-between items-center">
//           <View className="flex-1">
//             <View className="flex-row justify-between items-center">
//               <TouchableOpacity
//                 onPress={() =>
//                   navigation.navigate("PublicForumReplies", { postId: item.id })
//                 }
//                 className="mb-2 ml-[300px]"
//               >
//                 <Text className="text-blue-500 text-sm">
//                   {item.replyCount} replies
//                 </Text>
//               </TouchableOpacity>
//             </View>

//             <View className="flex-row items-center relative">
//               <TextInput
//                 className="flex-1 text-gray-500 text-sm py-2 px-4 pr-10 border border-gray-300 rounded-full"
//                 placeholder="Write a comment..."
//                 value={comment}
//                 onChangeText={setComment}
//               />
//               <TouchableOpacity
//                 className="absolute right-2 top-1/2 transform -translate-y-1/2"
//                 onPress={() => handleCommentSubmit(item.id)}
//               >
//                 <Feather name="send" size={20} color="gray" />
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </View>
//     );
//   };

//   return (
//     <View className="flex-1 bg-[#DCFBE3] ">
//       <View className="flex-row items-center p-4 bg-gray-100">
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//         <AntDesign name="left" size={24} color="#000502"/>
        
//         </TouchableOpacity>
//         <Text className="text-lg font-semibold ml-[25%]">Public Forum</Text>
//       </View>

//       <View className="p-5 bg-[#DCFBE3] ">
//         <View className="flex-row items-center bg-white p-2 rounded-full shadow">
//           <Feather name="search" size={20} color="gray" />
//           <TextInput
//             className="ml-2 flex-1 text-gray-600"
//             placeholder="Search..."
//             value={searchText}
//             onChangeText={setSearchText}
//           />
//         </View>
//       </View>

//       <TouchableOpacity
//         className="bg-green-500 rounded-full p-3 mx-4 mb-4 flex-row items-center justify-center"
//         onPress={() => {
//           navigation.navigate("PublicForumPost");
//         }}
//       >
//         <Text className="text-white font-bold">Start new Discussion</Text>
//         <Feather name="plus" size={26} color="white" className="ml-2" />
//       </TouchableOpacity>

//       <FlatList
//         data={posts.filter(
//           (post) =>
//             (post.heading || "")
//               .toLowerCase()
//               .includes(searchText.toLowerCase()) ||
//             (post.message || "")
//               .toLowerCase()
//               .includes(searchText.toLowerCase())
//         )} // Filter posts based on search text
//         keyExtractor={(item) => item.id}
//         renderItem={renderPostItem}
//         refreshing={refreshing}
//         onRefresh={onRefresh}
//       />
//     </View>
//   );
// };

// export default PublicForum;

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from "react-native";
import axios from "axios";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";
import { environment } from "@/environment/environment";
import AntDesign from 'react-native-vector-icons/AntDesign';

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
  const [comment, setComment] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${environment.API_BASE_URL}api/auth/get`);
      setPosts(response.data);
      console.log("hiiiiii...", response.data)
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`https://yourapi.com/posts/${id}`);
      setPosts(posts.filter((post) => post.id !== id));
    } catch (error) {
      console.error("Error deleting post", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handleCommentSubmit = async (postId: string) => {
    try {
      const replyId = ""; // Set this to the user's ID or appropriate identifier
      const token = await AsyncStorage.getItem("userToken");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      await axios.post(
        `${environment.API_BASE_URL}api/auth/add/reply`,
        {
          chatId: postId,
          replyId: replyId,
          replyMessage: comment,
        },
        { headers }
      );

      Alert.alert("Comment added successfully");
      setComment("");
      fetchPosts();
    } catch (error) {
      console.log("Error sending comment:", error);
      Alert.alert("Error", "Failed to add comment.");
    }
  };

  // Function to format the date
  const formatDate = (createdAt: string) => {
    const date = new Date(createdAt); // Parse the date string

    // Define the month names array
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Extract year, month, and day
    const year = date.getFullYear();
    const month = monthNames[date.getMonth()]; // Get the month name from the array
    const day = date.getDate();

    return `${year} ${month} ${day}`; // Return formatted date string
  };

  const renderPostItem = ({ item }: { item: Post }) => {
    const postImageSource = item.postimage
      ? `data:image/jpeg;base64,${item.postimage.toString("base64")}`
      : null;

    return (
      <View className="bg-white p-4 mb-4 mx-4 rounded-lg shadow-sm border border-gray-300">
        <View className="flex-row justify-between items-start">
          <View className="flex-row items-center">
            <Text className="font-bold text-base">{item.heading}</Text>
          </View>
          <TouchableOpacity>
            {/* Use formatDate function to format createdAt */}
            <Text style={{ color: 'gray' }}>{formatDate(item.createdAt)}</Text> 
          </TouchableOpacity>
        </View>

        {postImageSource && (
          <Image
            source={{ uri: postImageSource }}
            className="w-full h-40 my-3 rounded-lg"
            resizeMode="cover"
          />
        )}

        <Text className="text-gray-700 mt-3">{item.message}</Text>

        <View className="border-t border-gray-200 my-3" />

        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <View className="flex-row justify-between items-center">
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("PublicForumReplies", { postId: item.id })
                }
                className="mb-2 ml-[300px]"
              >
                <Text className="text-blue-500 text-sm">
                  {item.replyCount} replies
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center relative">
              <TextInput
                className="flex-1 text-gray-500 text-sm py-2 px-4 pr-10 border border-gray-300 rounded-full"
                placeholder="Write a comment..."
                value={comment}
                onChangeText={setComment}
              />
              <TouchableOpacity
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onPress={() => handleCommentSubmit(item.id)}
              >
                <Feather name="send" size={20} color="gray" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#DCFBE3] ">
      <View className="flex-row items-center p-4 bg-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()}>
        <AntDesign name="left" size={24} color="#000502"/>
        
        </TouchableOpacity>
        <Text className="text-lg font-semibold ml-[25%]">Public Forum</Text>
      </View>

      <View className="p-5 bg-[#DCFBE3] ">
        <View className="flex-row items-center bg-white p-2 rounded-full shadow">
          <Feather name="search" size={20} color="gray" />
          <TextInput
            className="ml-2 flex-1 text-gray-600"
            placeholder="Search..."
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
        <Text className="text-white font-bold">Start new Discussion</Text>
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
        )} // Filter posts based on search text
        keyExtractor={(item) => item.id}
        renderItem={renderPostItem}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
};

export default PublicForum;
