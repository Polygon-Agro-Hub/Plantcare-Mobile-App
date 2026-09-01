import React, { useState } from "react";
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
import AntDesign from "@expo/vector-icons/AntDesign";
import { useFocusEffect } from "@react-navigation/native";
import CustomHeader from "../common/CustomHeader";

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

const PublicForumPostEdit: React.FC<PublicForumPostEditProps> = ({
  navigation,
  route,
}) => {
  const { postId } = route?.params ?? {};

  const [heading, setHeading] = useState("");
  const [message, setMessage] = useState("");
  const [postImageUri, setPostImageUri] = useState<string | null>(null);

  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);

  const [previousImageUri, setPreviousImageUri] = useState<string | null>(null);

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
    if (Platform.OS === "ios") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          t("PublicForum.sorry"),
          t("PublicForum.WeNeedAccessToYourCameraToContinuePleaseEnablePermissions"),
          [{ text: t("Main.OK") }],
        );
        return;
      }
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
    }, [postId]),
  );

  const handleUpdatePost = async () => {
    setLoading(true);

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
        formData.append("prepostimage", previousImageUri);
      } else {
        formData.append("prepostimage", "");
      }

      const response = await axios.put(
        `${environment.API_BASE_URL}api/auth/updatepost/${postId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${await AsyncStorage.getItem("userToken")}`,
          },
        },
      );

      if (response.status === 200) {
        Alert.alert(
          t("Main.Success"),
          t("PublicForum.PostUpdatedSuccessfully!"),
          [
            {
              text: t("Main.OK"),
            },
          ],
        );
        navigation.goBack();
      } else {
        Alert.alert(t("PublicForum.error"), t("PublicForum.FailedToUpdatePost"), [
          {
            text: t("Main.OK"),
            style: "default",
          },
        ]);
      }
    } catch (error) {
      console.error("Error updating post:", error);

      Alert.alert(t("Main.Error"), t("Main.SomethingWentWrongPleaseTryAgainlater"), [
        { text: t("Main.OK") },
      ]);
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
          <Text className="text-white mt-4">{t("Main.Loading...")}</Text>
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
        <CustomHeader
          title={t("Edit Post")}
          showBackButton={true}
          navigation={navigation}
          onBackPress={() => navigation.goBack()}
        />

        <ScrollView className="px-4 py-6 p-7 ">
          <View className="mb-4">
            <Text className="text-base font-semibold">
              {t("PublicForum.Title")}
            </Text>
            <TextInput
              className=" border-gray-300  bg-[#F4F7FF] rounded-3xl px-4 h-[50px] mt-2"
              placeholder={t("PublicForum.AddYourTitleHere")}
              value={heading}
              onChangeText={setHeading}
              maxLength={250}
              placeholderTextColor="#000000"
            />
            {heading.length >= 250 && (
              <Text className="text-red-500 mt-1 text-sm">
                {t("PublicForum.Maximum250charactersAllowed")}
              </Text>
            )}
          </View>

          <View className="mb-4 mt-6">
            <Text className="text-base font-semibold ml-4">
              {t("PublicForum.Discussion")}
            </Text>
            <TextInput
              className=" bg-[#F4F7FF] border-gray-300 rounded-3xl px-4 py-2 mt-2 h-44  p-4 "
              placeholder={t("PublicForum.AddYourDiscussionHere")}
              value={message}
              onChangeText={setMessage}
              multiline
              textAlignVertical="top"
              placeholderTextColor="#000000"
            />
          </View>

          <View className="mb-4 items-center mt-[3%]">
            {postImageUri && (
              <TouchableOpacity
                onPress={deleteImage}
                className="absolute top-[32%] right-[18%] z-10 bg-[#FF0000] rounded-full"
              >
                <AntDesign name="minus" size={24} color="white" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              className="border bg-[#F4F7FF] border-[#525252]  py-3 px-6 rounded-lg"
              onPress={handleImagePick}
            >
              <Text className="text-[#667BA5]">
                {t("PublicForum.UploadImage")}
              </Text>
            </TouchableOpacity>
            {postImageUri && (
              <Image
                source={{ uri: postImageUri }}
                className="w-[60%] h-32 mt-[10%] "
                resizeMode="contain"
              />
            )}
          </View>
          <View className=" items-center">
            <TouchableOpacity
              className="bg-[#353535] rounded-full py-3 w-[75%] items-center mt-[6%] mb-10"
              onPress={handleUpdatePost}
              style={{
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <Text className="text-white text-lg">
                {t("Main.Update")}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default PublicForumPostEdit;
