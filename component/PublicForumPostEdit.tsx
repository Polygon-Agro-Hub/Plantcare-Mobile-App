import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
  BackHandler
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import AntDesign from "react-native-vector-icons/AntDesign";
import { useFocusEffect } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
type PublicForumPostEditNavigationProp = StackNavigationProp<
  RootStackParamList,
  "PublicForumPost"
>;

interface PublicForumPostEditProps {
  navigation: PublicForumPostEditNavigationProp;
    route?: {
    params?: {
      postId?: number;
    };
  };
}

const PublicForumPostEdit: React.FC<PublicForumPostEditProps> = ({ navigation, route }) => {
    const { postId } = route?.params ?? {};
    console.log("pso",postId)
  const [heading, setHeading] = useState("");
  const [message, setMessage] = useState("");
  const [postImageUri, setPostImageUri] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null); // State for storing token
  const { t } = useTranslation();
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [postData, setPostData] = useState("")
    const [previousImageUri, setPreviousImageUri] = useState<string | null>(null);

  console.log("pdat", postData)

  useEffect(() => {
    const selectedLanguage = t("PublicForum.LNG");
    setLanguage(selectedLanguage);
  }, [t]);

          useFocusEffect(
              React.useCallback(() => {
                const onBackPress = () => {
                  navigation.navigate("PublicForum" as any);
                  return true; // Prevent default back action
                };
            
                BackHandler.addEventListener("hardwareBackPress", onBackPress);
            
                return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
              }, [navigation])
            );
            

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
useFocusEffect(
  React.useCallback(() => {
    setLoading(true);
    const fetchPosts = async () => {
      try {
        const response = await axios.get(
          `${environment.API_BASE_URL}api/auth/getpost/${postId}`,
        );
        const postData = response.data;
          setHeading(postData.heading);
          setMessage(postData.message);
          setPostImageUri(postData.postimage); 
           setPreviousImageUri(postData.postimage);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false); 
      }
    };

    fetchPosts();
  }, [postId]) 
);

const handleUpdatePost = async () => {
    setLoading(true);

    const updatedData = {
      heading,
      message,
      postimage: postImageUri,
      prevpostimg: previousImageUri || null,
    };

    try {
      const formData = new FormData();
    if (postImageUri) {
    const fileName = postImageUri.split("/").pop();
    const fileType = fileName?.split(".").pop()
      ? `image/${fileName.split(".").pop()}`
      : "image/jpeg";

    formData.append("postimage", {
      uri: postImageUri,
      name: fileName,
      type: fileType,
    } as any);
  }

      formData.append("heading", heading);
      formData.append("message", message);
          if (previousImageUri) {
      formData.append("prepostimage", previousImageUri); // Append only if previousImageUri is not null
    } else {
      formData.append("prepostimage", ''); // Append an empty string if the previous image is null
    }

    console.log(formData)
      // Send the updated data to the backend
      const response = await axios.put(
        `${environment.API_BASE_URL}api/auth/updatepost/${postId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
           Authorization: `Bearer ${await AsyncStorage.getItem("userToken")}`,
          },
        }
      );

      if (response.status === 200) {
        Alert.alert("Success", "Post updated successfully!");
        navigation.goBack(); // Go back after successful update
      } else {
        Alert.alert("Error", "Failed to update post.");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      Alert.alert("Error", "An error occurred while updating the post.");
    } finally {
      setLoading(false);
    }
  };

    const deleteImage = () => {
    setPostImageUri(null);
  };
    if (loading) {
      return (
        <Modal transparent={true} visible={loading} animationType="fade">
          <View className="flex-1 justify-center items-center bg-black/50">
            <ActivityIndicator size="large" color="#ffffff" />
            <Text className="text-white mt-4">{t("CropCalender.Loading")}</Text>
          </View>
        </Modal>
      );
    }

  return (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          enabled
          style={{ flex: 1 }}
        >
    
    <View className="flex-1 bg-white ">
      {/* Header Section */}
      <View className="flex-row items-center p-4 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="left" size={24} color="#000502" style={{ paddingHorizontal: wp(3), paddingVertical: hp(1.5), backgroundColor: "#F6F6F680" , borderRadius: 50 }}/>
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-lg font-semibold">
            {t("Edit Post")}
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView className="px-4 py-6 p-7 ">
        
        {/* Heading Input */}
        <View className="mb-4">
          <Text className="text-base font-semibold">
            {t("PublicForum.title")}
          </Text>
          <TextInput
            className=" border-gray-300  bg-[#F4F7FF] rounded-[25px] px-4 py-3 mt-2"
            placeholder={t("PublicForum.addyourtitlehere")}
            value={heading}
            onChangeText={setHeading}
          />
        </View>

        {/* Message Input */}
        <View className="mb-4 mt-6">
          <Text className="text-base font-semibold ml-4">
            {t("PublicForum.discussion")}
          </Text>
          <TextInput
            className=" bg-[#F4F7FF] border-gray-300 rounded-[25px] px-4 py-2 mt-2 h-44  p-4 "
            placeholder={t("PublicForum.addyourdiscussionhere")}
            value={message}
            onChangeText={setMessage}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Image Upload Section */}
        {/* <View className="mb-4 items-center mt-[5%]">
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
        </View> */}

                  <View className="mb-4 items-center mt-[3%]">
            {postImageUri && (
              <TouchableOpacity onPress={deleteImage} className="absolute top-[32%] right-[18%] z-10 bg-[#FF0000] rounded-full">
                <AntDesign name="minus" size={24} color="white" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              className="border bg-[#F4F7FF] border-gray-300  py-3 px-6 rounded-lg"
              onPress={handleImagePick}
            >
              <Text className="text-gray-500">{t("PublicForum.uploadImage")}</Text>
            </TouchableOpacity>
            {postImageUri && (
              <Image source={{ uri: postImageUri }} className="w-[60%] h-32 mt-[10%] "  resizeMode="contain"/>
            )}
          </View>
<View className=" items-center">
        {/* Publish Button */}
       <TouchableOpacity
            className="bg-[#353535] rounded-full py-3 w-[75%] items-center mt-[6%] mb-10"
            onPress={handleUpdatePost}
          >
            <Text className="text-white text-lg">{t("PublicForum.update")}</Text>
          </TouchableOpacity>
          </View>
      </ScrollView>
    </View>
    </KeyboardAvoidingView>
  );
};

export default PublicForumPostEdit;
