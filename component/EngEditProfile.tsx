import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import NavigationBar from "@/Items/NavigationBar";
import { AntDesign } from "@expo/vector-icons";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker"; // Import ImagePicker
import { ScrollView } from "react-native-gesture-handler";

type EngEditProfileNavigationProps = StackNavigationProp<
  RootStackParamList,
  "EngEditProfile"
>;

interface EngEditProfileProps {
  navigation: EngEditProfileNavigationProps;
}

const EngEditProfile: React.FC<EngEditProfileProps> = ({ navigation }) => {
  const route = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [NICnumber, setNICnumber] = useState("");
  const [profileImage, setProfileImage] = useState(
    require("../assets/images/pcprofile 1.jpg")
  ); // Default profile image
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    // Fetch initial profile data (dummy example, replace with your API call)
    const fetchProfileData = async () => {
      try {
        const response = await fetch(
          `${environment.API_BASE_URL}api/auth/user-profile`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${await AsyncStorage.getItem(
                "userToken"
              )}`,
            },
          }
        );
        const data = await response.json();
        if (data.status === "success") {
          const { firstName, lastName, phoneNumber, NICnumber } = data.user;
          setFirstName(firstName || "");
          setLastName(lastName || "");
          setPhoneNumber(phoneNumber || "");
          setNICnumber(NICnumber || "");
        } else {
          Alert.alert(t("EditProfile.error"), data.message);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        Alert.alert(t("Dashboard.error"), t("Dashboard.failedToFetch"));
      }
    };
    fetchProfileData();
  }, []);

  // Function to handle image picking
  const pickImage = async () => {
    // Ask for permission to access the gallery
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("EditProfile.permissionDenied"),
        t("EditProfile.permissionDeniedMessage")
      );
      return;
    }

    // Open the image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      // If the user selected an image, update the profile image
      setProfileImage({ uri: result.assets[0].uri }); // Get the first image's uri
    }
  };

  const validatePhoneNumber = (number: string) => {
    // Check if phone number is not empty and has exactly 10 digits
    if (number.length === 10 && /^\d+$/.test(number)) {
      setPhoneNumberError("");
      return true;
    } else {
      setPhoneNumberError("Phone number must be exactly 10 digits.");
      return false;
    }
  };

  const handleSave = async () => {
    // You can add any additional validation for firstName or lastName if needed
    if (!firstName || !lastName) {
      Alert.alert(t("EditProfile.error"), t("EditProfile.nameError"));
      return;
    }

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert(t("EditProfile.error"), t("EditProfile.authError"));
        return;
      }

      const response = await fetch(
        `${environment.API_BASE_URL}api/auth/user-update-names`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ firstName, lastName }),
        }
      );

      const data = await response.json();
      if (data.status === "success") {
        Toast.show({
          type: "success",
          position: "bottom",
          text1: t("EditProfile.success"),
          text2: t("EditProfile.profileUpdatedSuccess"),
        });
        Alert.alert(
          t("EditProfile.success"),
          t("EditProfile.profileUpdatedSuccess")
        );
        navigation.goBack();
      } else {
        Alert.alert(t("EditProfile.error"), data.message);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert(t("EditProfile.error"), t("EditProfile.updateProfileError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1 bg-white w-full">
        {/* Upper Profile Edit Section */}

        <View className="p-2 flex-1">
          {/* Header */}
          <View className="relative w-full mb-6">
            <TouchableOpacity
              className="absolute top-6 left-4 p-2 bg-transparent"
              onPress={() => route.back()}
            >
              <AntDesign name="left" size={24} color="#000000" />
            </TouchableOpacity>

            {/* Title */}
            <View className="mt-10 items-center">
              <Text className="text-center text-black text-xl font-bold">
                {t("EditProfile.editProfile")}
              </Text>
            </View>
          </View>

          {/* Avatar Image */}
          <View className="items-center mb-6 relative">
            <Image
              source={profileImage} // Updated to use selected profile image
              style={{ width: 100, height: 100, borderRadius: 50 }}
            />
            <TouchableOpacity
              className="absolute right-0 bottom-0 p-1 bg-white mr-40 rounded-full"
              onPress={pickImage} // Open gallery when pencil icon is clicked
            >
              <Image
                source={require("../assets/images/Pencil.png")} // Replace with your edit icon path
                style={{ width: 17, height: 17, tintColor: "green" }} // Adjust size and color
              />
            </TouchableOpacity>
          </View>

          {/* Input Fields */}
          <View className="p-6">
            <View className="space-y-8">
              {/* First Name Field - Editable */}
              <View>
                <Text className="text-sm text-gray-700 mb-1">
                  {t("EditProfile.FirstName")}
                </Text>
                <TextInput
                  className="h-10 px-3 bg-gray-200 rounded-full text-sm"
                  value={firstName}
                  onChangeText={(text) => setFirstName(text)} // Allow editing
                  placeholder="Enter First Name"
                />
              </View>

              {/* Last Name Field - Editable */}
              <View>
                <Text className="text-sm text-gray-700 mb-1">
                  {t("EditProfile.LastName")}
                </Text>
                <TextInput
                  className="h-10 px-3 bg-gray-200 rounded-full text-sm"
                  value={lastName}
                  onChangeText={(text) => setLastName(text)} // Allow editing
                  placeholder="Enter Last Name"
                />
              </View>

              {/* Phone Number Field - Non-editable */}
              <View>
                <Text className="text-sm text-gray-700 mb-1">
                  {t("EditProfile.PhoneNumber")}
                </Text>
                <TextInput
                  className={`h-10 px-3 bg-gray-200 rounded-full text-sm ${
                    phoneNumberError ? "border-red-500" : ""
                  }`}
                  value={phoneNumber}
                  placeholder="Enter Phone Number"
                  keyboardType="phone-pad"
                  editable={false} // Disable editing
                />
                {phoneNumberError ? (
                  <Text className="text-xs text-red-500 mt-1">
                    {phoneNumberError}
                  </Text>
                ) : null}
              </View>

              {/* NIC Number Field - Non-editable */}
              <View>
                <Text className="text-sm text-gray-700 mb-1">
                  {t("EditProfile.NIC")}
                </Text>
                <TextInput
                  className="h-10 px-3 bg-gray-200 rounded-full text-sm"
                  value={NICnumber}
                  editable={false} // Disable editing
                  placeholder="Enter NIC Number"
                />
              </View>
            </View>

            {/* Save Button */}
            <View className="flex-1 items-center mt-10">
              <TouchableOpacity
                onPress={handleSave}
                className={`bg-gray-800 rounded-full py-3 w-60 h-12 ${
                  isLoading ? "opacity-50" : ""
                }`}
                disabled={isLoading}
              >
                <Text className="text-center text-white text-sm">
                  {t("EditProfile.Save")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ width: "100%" }}>
          <NavigationBar navigation={navigation} />
        </View>

      </View>
    </ScrollView>
  );
};

export default EngEditProfile;
