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
  BackHandler,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import CustomHeader from "../common/CustomHeader";

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
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("PublicForum" as any);
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => backHandler.remove();
    }, [navigation]),
  );

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("PublicForum.sorry"),
        t("PublicForum.permissionDeniedMessage"),
        [{ text: t("PublicForum.OK") }],
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

  const handleImageRemove = () => {
    Alert.alert(
      t("PublicForum.removeImage") || "Remove Image",
      t("PublicForum.removeImageConfirm") ||
        "Are you sure you want to remove this image?",
      [
        {
          text: t("PublicForum.cancel") || "Cancel",
          style: "cancel",
        },
        {
          text: t("PublicForum.remove") || "Remove",
          style: "destructive",
          onPress: () => setPostImageUri(null),
        },
      ],
    );
  };

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
        t("PublicForum.titleRequired") || "Title is required",
        [{ text: t("PublicForum.OK") }],
      );
      return;
    }

    if (!trimmedMessage) {
      Alert.alert(
        t("PublicForum.sorry"),
        t("PublicForum.descriptionRequired") || "Description is required",
        [{ text: t("PublicForum.OK") }],
      );
      return;
    }

    if (!trimmedHeading || !trimmedMessage) {
      Alert.alert(
        t("PublicForum.sorry"),
        t("PublicForum.fillAllRequiredFields") ||
          "Please fill in both Title and Description fields",
        [{ text: t("PublicForum.OK") }],
      );
      return;
    }
    if (trimmedHeading.length > 250) {
      Alert.alert(
        t("PublicForum.sorry"),
        t("PublicForum.Maximum 250 characters allowed."),
        [{ text: t("PublicForum.OK") }],
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
        },
      );

      Alert.alert(t("PublicForum.success"), t("PublicForum.postSuccess"), [
        {
          text: t("PublicForum.OK"),
          onPress: () => {
            setHeading("");
            setMessage("");
            setPostImageUri(null);
            setLoading(false);
            navigation.navigate("PublicForum" as any);
          },
        },
      ]);
      setHeading("");
      setMessage("");
      setPostImageUri(null);
      setLoading(false);
      navigation.navigate("PublicForum" as any);
    } catch (error) {
      console.error("Error creating post:", error);
      setLoading(false);
      Alert.alert(t("PublicForum.sorry"), t("PublicForum.postFailed"), [
        { text: t("PublicForum.OK") },
      ]);
    } finally {
      setLoading(false);
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
        <CustomHeader
          title={t("PublicForum.createyourpost")}
          showBackButton={true}
          navigation={navigation}
          onBackPress={() => navigation.navigate("PublicForum" as any)}
        />

        <ScrollView className="px-4 py-6 p-7">
          <View className="mb-4">
            <Text className="text-base font-semibold">
              {t("PublicForum.title")}
            </Text>
            <TextInput
              className="border-gray-300 bg-[#F4F7FF] rounded-3xl px-4 h-[50px] mt-2"
              placeholder={t("PublicForum.addyourtitlehere")}
              value={heading}
              onChangeText={setHeading}
              maxLength={250}
              placeholderTextColor="#525252"
            />
            {heading.length >= 250 && (
              <Text className="text-red-500 mt-1 text-sm">
                {t("PublicForum.Maximum 250 characters allowed.")}
              </Text>
            )}
          </View>

          <View className="mb-4 mt-6">
            <Text className="text-base font-semibold ml-4">
              {t("PublicForum.discussion")}
            </Text>
            <TextInput
              className="bg-[#F4F7FF] border-gray-300 rounded-3xl px-4 py-2 mt-2 h-44 p-4"
              placeholder={t("PublicForum.addyourdiscussionhere")}
              value={message}
              onChangeText={setMessage}
              multiline
              textAlignVertical="top"
              placeholderTextColor="#525252"
            />
          </View>

          <View className="mb-4 items-center mt-[3%]">
            <TouchableOpacity
              className="border bg-[#F4F7FF] border-[#525252] rounded-lg py-3 px-6"
              onPress={handleImagePick}
            >
              <Text className="text-[#667BA5]">
                {t("PublicForum.uploadImage")}
              </Text>
            </TouchableOpacity>

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
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Image
                    source={require("../../assets/images/public-forum/remove-image.webp")}
                    style={{ width: 18, height: 18 }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View className="items-center">
            <TouchableOpacity
              className="bg-[#353535] rounded-full py-3 w-[75%] items-center mt-[6%] mb-10"
              onPress={handleSubmit}
              style={{
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <Text className="text-white text-lg">
                {t("PublicForum.publish")}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default PublicForumPost;
