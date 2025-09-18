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
  const [authToken, setAuthToken] = useState<string | null>(null);
  const { t } = useTranslation();
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const selectedLanguage = t("PublicForum.LNG");
    setLanguage(selectedLanguage);
  }, [t]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("PublicForum" as any);
        return true;
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
        t("PublicForum.sorry"),
        t("PublicForum.permissionDeniedMessage")
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

  // Function to handle image removal
  const handleImageRemove = () => {
    Alert.alert(
      t("PublicForum.removeImage") || "Remove Image",
      t("PublicForum.removeImageConfirm") || "Are you sure you want to remove this image?",
      [
        {
          text: t("PublicForum.cancel") || "Cancel",
          style: "cancel"
        },
        {
          text: t("PublicForum.remove") || "Remove",
          style: "destructive",
          onPress: () => setPostImageUri(null)
        }
      ]
    );
  };

  // Retrieve token from AsyncStorage when the component mounts
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          setAuthToken(token);
        }
      } catch (error) {}
    };

    fetchToken();
  }, []);

  const handleSubmit = async () => {
    const trimmedHeading = heading.trim();
    const trimmedMessage = message.trim();
    
    if (!trimmedHeading) {
      Alert.alert(
        t("PublicForum.sorry"), 
        t("PublicForum.titleRequired") || "Title is required"
      );
      return;
    }
    
    if (!trimmedMessage) {
      Alert.alert(
        t("PublicForum.sorry"), 
        t("PublicForum.descriptionRequired") || "Description is required"
      );
      return;
    }
    
    if (!trimmedHeading || !trimmedMessage) {
      Alert.alert(
        t("PublicForum.sorry"), 
        t("PublicForum.fillAllRequiredFields") || "Please fill in both Title and Description fields"
      );
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("heading", trimmedHeading);
    formData.append("message", trimmedMessage);

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

      Alert.alert(
    t("PublicForum.success"), 
    t("PublicForum.postSuccess"),
    [
      {
        text: t("PublicForum.OK"),
        onPress: () => {
          setHeading("");
          setMessage("");
          setPostImageUri(null);
          setLoading(false);
          navigation.navigate("PublicForum" as any);
        }
      }
    ]
  );
      setHeading("");
      setMessage("");
      setPostImageUri(null);
      setLoading(false);
      navigation.navigate("PublicForum" as any);
    } catch (error) {
      console.error("Error creating post:", error);
      setLoading(false);
      Alert.alert(
        t("PublicForum.sorry"),
        t("PublicForum.postFailed")
      );
    }
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
      <View className="flex-1 bg-white">
        {/* Header Section */}
        <View className="flex-row items-center p-4 bg-white">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <AntDesign 
              name="left" 
              size={24} 
              color="#000502" 
              style={{ 
                paddingHorizontal: wp(3), 
                paddingVertical: hp(1.5), 
                backgroundColor: "#F6F6F680", 
                borderRadius: 50 
              }} 
            />
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
            <Text className="text-base font-semibold">
              {t("PublicForum.title")}
            </Text>
            <TextInput
              className="border-gray-300 bg-[#F4F7FF] rounded-[25px] px-4 py-2 mt-2"
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
              className="bg-[#F4F7FF] border-gray-300 rounded-[30px] px-4 py-2 mt-2 h-44 p-4"
              placeholder={t("PublicForum.addyourdiscussionhere")}
              value={message}
              onChangeText={setMessage}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Image Upload Section */}
          <View className="mb-4 items-center mt-[3%]">
            <TouchableOpacity
              className="border bg-[#F4F7FF] border-gray-300 rounded-lg py-3 px-6"
              onPress={handleImagePick}
            >
              <Text className="text-gray-500">
                {t("PublicForum.uploadImage")}
              </Text>
            </TouchableOpacity>
            
            {/* Image Display with Remove Button */}
            {postImageUri && (
              <View className="relative mt-[10%]">
                <Image 
                  source={{ uri: postImageUri }} 
                  className="w-[60vw] h-32 rounded-lg" 
                  style={{ width: wp(60), height: hp(16) }}
                />
                <TouchableOpacity
                  onPress={handleImageRemove}
                  className="absolute -top-3 -right-2  rounded-full p-1"
                  style={{
                    width: 24,
                    height: 24,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  {/* <AntDesign name="close" size={16} color="white" /> */}
                  <Image
                              source={require("../assets/images/removeimage.png")}
                                style={{ width: 18, height: 18 }}
                            resizeMode="contain"
                            />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Publish Button */}
          <View className="items-center">
            <TouchableOpacity
              className="bg-[#353535] rounded-full py-3 w-[75%] items-center mt-[6%] mb-10"
              onPress={handleSubmit}
            >
              <Text className="text-white text-lg">{t("PublicForum.publish")}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default PublicForumPost;