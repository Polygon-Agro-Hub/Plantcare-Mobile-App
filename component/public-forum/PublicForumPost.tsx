import React, { useState, useEffect, useRef } from "react";
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
  Keyboard,
  Linking,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import axios from "axios";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
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
  const isSubmittingRef = useRef(false);

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
    try {
      if (Platform.OS === "ios") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            t("EditProfile.PermissionDenied") || t("Main.Sorry"),
            t("EditProfile.PleaseAllowAccessToYourGalleryToProceed") ||
              "Please allow access to your photo library to proceed!",
            [
              { text: t("Main.Cancel") || "Cancel", style: "cancel" },
              {
                text: t("Main.Settings") || "Settings",
                onPress: () => Linking.openSettings(),
              },
            ],
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const originalUri = result.assets[0].uri;
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          originalUri,
          [{ resize: { width: 1200 } }],
          {
            compress: 0.7,
            format: ImageManipulator.SaveFormat.JPEG,
          },
        );
        setPostImageUri(manipulatedImage.uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(
        t("Main.Sorry") || "Error",
        t("EditProfile.PleaseAllowAccessToYourGalleryToProceed") ||
          "Failed to select image. Please try again.",
        [{ text: t("Main.OK") }],
      );
    }
  };

  const handleImageRemove = () => {
    Alert.alert(
      t("PublicForum.RemoveImage") || "Remove Image",
      t("PublicForum.AreYouSureYouWantToRemovThisImage?") ||
      "Are you sure you want to remove this image?",
      [
        {
          text: t("Main.Cancel") || "Cancel",
          style: "cancel",
        },
        {
          text: t("PublicForum.Remove") || "Remove",
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
      } catch (error) { }
    };

    fetchToken();
  }, []);

  const handleSubmit = async () => {
    if (isSubmittingRef.current || loading) {
      return;
    }

    Keyboard.dismiss();

    const trimmedHeading = heading.trim();
    const trimmedMessage = message.trim();

    if (!trimmedHeading) {
      Alert.alert(
        t("Main.Sorry"),
        t("PublicForum.TitleIsRequired") || "Title is required",
        [{ text: t("Main.OK") }],
      );
      return;
    }

    if (!trimmedMessage) {
      Alert.alert(
        t("Main.Sorry"),
        t("PublicForum.DescriptionIsRequired") || "Description is required",
        [{ text: t("Main.OK") }],
      );
      return;
    }

    if (trimmedHeading.length > 250) {
      Alert.alert(
        t("Main.Sorry"),
        t("PublicForum.Maximum250charactersAllowed"),
        [{ text: t("Main.OK") }],
      );
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);

    const token = authToken || (await AsyncStorage.getItem("userToken"));
    if (!token) {
      setLoading(false);
      isSubmittingRef.current = false;
      Alert.alert(t("Main.Sorry"), "Please log in to publish a post.", [
        { text: t("Main.OK") },
      ]);
      return;
    }

    const formData = new FormData();
    formData.append("heading", trimmedHeading);
    formData.append("message", trimmedMessage);

    if (postImageUri) {
      const fileName = postImageUri.split("/").pop() || "photo.jpg";
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
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setLoading(false);
      isSubmittingRef.current = false;
      setHeading("");
      setMessage("");
      setPostImageUri(null);

      setTimeout(() => {
        Alert.alert(
          t("Main.Success"),
          t("PublicForum.YourPostAddedSuccessfully"),
          [
            {
              text: t("Main.OK"),
              onPress: () => {
                navigation.navigate("PublicForum" as any);
              },
            },
          ],
        );
      }, 100);
    } catch (error: any) {
      console.error("Error creating post:", error);
      setLoading(false);
      isSubmittingRef.current = false;
      const errorMsg =
        error?.response?.data?.code === "PROFANITY_DETECTED"
          ? t("PublicForum.ProhibitedLanguageDetected")
          : error?.response?.data?.message ||
            t("PublicForum.FailedToCreateThePostPleaseTryAgain");

      setTimeout(() => {
        Alert.alert(t("Main.Sorry"), errorMsg, [
          { text: t("Main.OK") },
        ]);
      }, 100);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      enabled
      style={{ flex: 1 }}
    >
      <View className="flex-1 bg-white">
        <CustomHeader
          title={t("PublicForum.CreateYourPost")}
          showBackButton={true}
          navigation={navigation}
          onBackPress={() => navigation.navigate("PublicForum" as any)}
        />

        <ScrollView contentContainerClassName="pb-24" className="px-6 py-4">
          <View className="mb-4">
            <Text className="text-base font-semibold">
              {t("PublicForum.Title")}
            </Text>
            <TextInput
              className="border-gray-300 bg-[#F4F7FF] rounded-3xl px-4 h-[50px] mt-2"
              placeholder={t("PublicForum.AddYourTitleHere")}
              value={heading}
              onChangeText={setHeading}
              maxLength={250}
              placeholderTextColor="#525252"
            />
            {heading.length >= 250 && (
              <Text className="text-red-500 mt-1 text-sm">
                {t("PublicForum.Maximum250charactersAllowed")}
              </Text>
            )}
          </View>

          <View className="mb-4 mt-4">
            <Text className="text-base font-semibold ml-4">
              {t("PublicForum.Discussion")}
            </Text>
            <TextInput
              className="bg-[#F4F7FF] border-gray-300 rounded-3xl px-4 py-2 mt-2 h-44 p-4"
              placeholder={t("PublicForum.AddYourDiscussionHere")}
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
                {t("PublicForum.UploadImage")}
              </Text>
            </TouchableOpacity>

            {postImageUri && (
              <View className="relative mt-[5%] w-full">
                <Image
                  source={{ uri: postImageUri }}
                  className="w-full min-h-60 rounded-lg"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={handleImageRemove}
                  className="absolute -top-3 -right-2 rounded-full p-1"
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

        </ScrollView>

        {/* Publish button matching UserFeedback design */}
        <View className="absolute bottom-0 left-0 right-0 bg-white px-10 py-4">
          <TouchableOpacity
            disabled={heading.trim() === "" || message.trim() === "" || loading}
            onPress={handleSubmit}
            activeOpacity={0.8}
            className={`w-full rounded-3xl h-[50px] justify-center items-center shadow-lg elevation-6 ${
              heading.trim() === "" || message.trim() === "" || loading
                ? "bg-[#9CA3AF]"
                : "bg-[#353535]"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-white font-semibold text-center text-lg">
                {t("PublicForum.Publish")}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Loading Overlay */}
        {loading && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
            }}
          >
            <View
              style={{
                backgroundColor: "#1F2937",
                paddingHorizontal: 28,
                paddingVertical: 20,
                borderRadius: 16,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              <ActivityIndicator size="large" color="#19D7B7" />
              <Text
                style={{
                  color: "white",
                  marginTop: 12,
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                {t("Main.Loading...")}
              </Text>
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default PublicForumPost;
