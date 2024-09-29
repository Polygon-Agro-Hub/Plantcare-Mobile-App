import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker"; // Importing Expo Image Picker
import axios from "axios";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage

type PublicForumPostNavigationProp = StackNavigationProp<
  RootStackParamList,
  "PublicForumPost"
>;

interface PublicForumPostProps {
  navigation: PublicForumPostNavigationProp;
}

const PublicForumPost: React.FC<PublicForumPostProps> = ({ navigation }) => {
  const [heading, setHeading] = useState("");
  const [message, setMessage] = useState("");
  const [postImageUri, setPostImageUri] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null); // State for storing token

  //   const navigation = useNavigation<PublicForumPostNavigationProp>();

  // Function to handle image selection from the device storage using Expo Image Picker
  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission denied",
        "Sorry, we need camera roll permissions to make this work!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setPostImageUri(result.assets[0].uri);
    }
  };

  // Retrieve token from AsyncStorage when the component mounts
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken"); // Assuming 'authToken' is the key where token is stored
        if (token) {
          setAuthToken(token);
        }
      } catch (error) {
        console.error("Failed to fetch token from storage:", error);
      }
    };

    fetchToken();
  }, []);

  // Function to handle the form submission
  const handleSubmit = async () => {
    if (!heading || !message) {
      Alert.alert("Validation Error", "Please fill all fields");
      return;
    }

    const formData = new FormData();
    formData.append("heading", heading);
    formData.append("message", message);

    if (postImageUri) {
      const fileName = postImageUri.split("/").pop();
      const fileType = fileName?.split(".").pop()
        ? `image/${fileName.split(".").pop()}`
        : "image/jpeg"; // Default to jpeg

      formData.append("postimage", {
        uri: postImageUri,
        name: fileName,
        type: fileType,
      } as any);
    }

    try {
      const response = await axios.post(
        "http://10.0.2.2:3000/api/auth/add/post",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      console.log("Post created successfully:", response.data);
      Alert.alert("Your post added successfully!");
      // Optionally reset the form
      setHeading("");
      setMessage("");
      setPostImageUri(null);
      navigation.navigate("PublicForum" as any);
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert(
        "Error",
        "An error occurred while creating the post. Please try again."
      );
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header Section */}
      <View className="flex-row items-center p-4 bg-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold ml-[25%]">Create your post</Text>
      </View>

      {/* Main Content */}
      <View className="px-4 py-6 p-7">
        {/* Heading Input */}
        <View className="mb-4">
          <Text className="text-lg font-semibold">Title</Text>
          <TextInput
            className=" border-gray-300  bg-gray-200 rounded-[25px] px-4 py-2 mt-2"
            placeholder="Add your heading here.."
            value={heading}
            onChangeText={setHeading}
          />
        </View>

        {/* Message Input */}
        <View className="mb-4 mt-10">
          <Text className="text-lg font-semibold">Discussion</Text>
          <TextInput
            className=" bg-gray-200 border-gray-300 rounded-[30px] px-4 py-2 mt-2 h-44"
            placeholder="Add your message here.."
            value={message}
            onChangeText={setMessage}
            multiline
          />
        </View>

        {/* Image Upload Section */}
        <View className="mb-4 items-center mt-[5%]">
          <TouchableOpacity
            className="border bg-gray-200 border-gray-300 rounded p-4"
            onPress={handleImagePick}
          >
            <Text className="text-gray-500">Upload Image</Text>
          </TouchableOpacity>
          {postImageUri && (
            <Image source={{ uri: postImageUri }} className="w-32 h-32 mt-4" />
          )}
        </View>

        {/* Publish Button */}
        <TouchableOpacity
          className="bg-black rounded-full py-4 items-center mt-[10%]"
          onPress={handleSubmit}
        >
          <Text className="text-white text-lg">Publish</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PublicForumPost;
