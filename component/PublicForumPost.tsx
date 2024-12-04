import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker"; // Importing Expo Image Picker
import axios from "axios";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import AntDesign from "react-native-vector-icons/AntDesign";

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
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(true);
  //   const navigation = useNavigation<PublicForumPostNavigationProp>();
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const selectedLanguage = t("PublicForum.LNG");
    setLanguage(selectedLanguage);
  }, [t]);

  // Function to handle image selection from the device storage using Expo Image Picker
  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("PublicForum.sorry"), // Localized message
        t("PublicForum.permissionDeniedMessage") // Localized message
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
      } catch (error) {}
    };

    fetchToken();
  }, []);

  // Function to handle the form submission
  const handleSubmit = async () => {
    if (!heading || !message) {
      Alert.alert(t("PublicForum.sorry"), t("PublicForum.fillAllFields"));
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

    console.log("Form Data:", formData);

    try {
      const response = await axios.post(
        `${environment.API_BASE_URL}api/auth/add/post`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      Alert.alert(t("PublicForum.success"), t("PublicForum.postSuccess"));
      // Optionally reset the form
      setHeading("");
      setMessage("");
      setPostImageUri(null);
      navigation.navigate("PublicForum" as any);
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert(
        t("PublicForum.sorry"), // Localized alert
        t("PublicForum.postFailed") // Localized message
      );
    }
  };

  return (
    <View className="flex-1 bg-white ">
      {/* Header Section */}
      <View className="flex-row items-center p-4 bg-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="left" size={24} color="#000502" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-lg font-semibold">
            {t("PublicForum.createyourpost")}
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView className="px-4 py-6 p-7">
        {/* Heading Input */}
        <View className="mb-4">
          <Text className="text-lg font-semibold">
            {t("PublicForum.title")}
          </Text>
          <TextInput
            className=" border-gray-300  bg-gray-200 rounded-[25px] px-4 py-2 mt-2"
            placeholder={t("PublicForum.addyourtitlehere")}
            value={heading}
            onChangeText={setHeading}
          />
        </View>

        {/* Message Input */}
        <View className="mb-4 mt-10">
          <Text className="text-lg font-semibold">
            {t("PublicForum.discussion")}
          </Text>
          <TextInput
            className=" bg-gray-200 border-gray-300 rounded-[30px] px-4 py-2 mt-2 h-44  p-4 "
            placeholder={t("PublicForum.addyourdiscussionhere")}
            value={message}
            onChangeText={setMessage}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Image Upload Section */}
        <View className="mb-4 items-center mt-[5%]">
          <TouchableOpacity
            className="border bg-gray-200 border-gray-300 rounded p-4"
            onPress={handleImagePick}
          >
            <Text className="text-gray-500">
              {t("PublicForum.uploadImage")}
            </Text>
          </TouchableOpacity>
          {postImageUri && (
            <Image source={{ uri: postImageUri }} className="w-32 h-32 mt-4" />
          )}
        </View>

        {/* Publish Button */}
        <TouchableOpacity
          className="bg-black rounded-full py-4 items-center mt-[10%] mb-10"
          onPress={handleSubmit}
        >
          <Text className="text-white text-lg">{t("PublicForum.publish")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default PublicForumPost;
