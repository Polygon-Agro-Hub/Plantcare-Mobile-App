import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import { AntDesign } from "@expo/vector-icons";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";
import { ScrollView } from "react-native-gesture-handler";
import Entypo from "react-native-vector-icons/Entypo";
import { useFocusEffect } from "@react-navigation/native";

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
  const [buidingname, setBuildingName] = useState("");
  const [streetname, setStreetName] = useState("");
  const [city, setCity] = useState("");
  const [profileImage, setProfileImage] = useState(
    require("../assets/images/pcprofile 1.webp")
  );
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const { t } = useTranslation();
  const [isMenuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
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
          const {
            firstName,
            lastName,
            phoneNumber,
            NICnumber,
            streetName,
            city,
            houseNo,
          } = data.user;
          setFirstName(firstName || "");
          setLastName(lastName || "");
          setPhoneNumber(phoneNumber || "");
          setNICnumber(NICnumber || "");
          setBuildingName(houseNo || "");
          setStreetName(streetName || "");
          setCity(city || "");
          setProfileImage({ uri: data.user.profileImage });
          if (!data.user.profileImage) {
            setProfileImage(require("../assets/images/pcprofile 1.webp"));
          }
        } else {
          Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
        }
      } catch (error) {
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
      }
    };
    fetchProfileData();
  }, []);

  const uploadImage = async (imageUri: string) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
        return;
      }
      const formData = new FormData();
      if (imageUri) {
        const fileName = imageUri.split("/").pop();
        const fileType = fileName?.split(".").pop()
          ? `image/${fileName.split(".").pop()}`
          : "image/jpeg";

        formData.append("profileImage", {
          uri: imageUri,
          name: fileName,
          type: fileType,
        } as any);
      }
      const response = await fetch(
        `${environment.API_BASE_URL}api/auth/upload-profile-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (data.status === "success") {
      } else {
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
      }
    } catch (error) {
      Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("EditProfile.permissionDenied"),
        t("EditProfile.permissionDeniedMessage")
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      setProfileImage({ uri: imageUri }); 
      await uploadImage(imageUri); 
    }
  };

  const validatePhoneNumber = (number: string) => {
    if (number.length === 10 && /^\d+$/.test(number)) {
      setPhoneNumberError("");
      return true;
    } else {
      setPhoneNumberError(t("EditProfile.phoneNumberError"));
      return false;
    }
  };

  const handleSave = async () => {
    if (!firstName || !lastName) {
      Alert.alert(t("signinForm.sorry"), t("EditProfile.nameError"));
      return;
    }
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
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
          body: JSON.stringify({
            firstName,
            lastName,
            buidingname,
            streetname,
            city,
          }),
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
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
      }
    } catch (error) {
      Alert.alert(t("Main.error"), t("EditProfile.updateProfileError"));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMenu = () => {
    setMenuVisible(!isMenuVisible);
  };

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setMenuVisible(false);
      };
    }, [])
  );
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-row items-center justify-between px-4 pt-4 mb-6 bg-white">
          {/* Back Button */}
          <View>
            <TouchableOpacity
              onPress={() => navigation.navigate("Dashboard")}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <AntDesign
                name="left"
                size={24}
                onPress={() => navigation.goBack()}
              />
            </TouchableOpacity>
          </View>

          {/* Page Title */}
          <View className="flex-1 items-center">
            <Text className="text-black text-xl font-bold ">
              {t("EditProfile.editProfile")}
            </Text>
          </View>

          {/* Dots-Three-Vertical Icon */}
          <View>
            <TouchableOpacity
              onPress={toggleMenu}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <Entypo name="dots-three-vertical" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-1 bg-white w-full">
          <View className="p-2 flex-1">
            <View className="items-center mb-6 relative">
              <Image
                source={
                  profileImage
                    ? profileImage
                    : require("../assets/images/pcprofile 1.webp")
                }
                style={{ width: 100, height: 100, borderRadius: 50 }}
              />
              <TouchableOpacity
                className="absolute right-0 bottom-0 p-1 bg-white mr-40 rounded-full"
                onPress={pickImage} 
              >
                <Image
                  source={require("../assets/images/Pencil.webp")} 
                  style={{ width: 17, height: 17, tintColor: "green" }} 
                />
              </TouchableOpacity>
            </View>

            <View className="p-6">
              <View className="space-y-8">
                <View>
                  <Text className="text-sm text-gray-700 mb-1">
                    {t("EditProfile.FirstName")}
                  </Text>
                  <TextInput
                    className="h-10 px-3 bg-gray-200 rounded-full text-sm"
                    value={firstName}
                    onChangeText={(text) => setFirstName(text)}
                  />
                </View>

                <View>
                  <Text className="text-sm text-gray-700 mb-1">
                    {t("EditProfile.LastName")}
                  </Text>
                  <TextInput
                    className="h-10 px-3 bg-gray-200 rounded-full text-sm"
                    value={lastName}
                    onChangeText={(text) => setLastName(text)}
                  />
                </View>

                <View>
                  <Text className="text-sm text-gray-700 mb-1">
                    {t("EditProfile.PhoneNumber")}
                  </Text>
                  <TextInput
                    className={`h-10 px-3 bg-gray-200 rounded-full text-sm ${
                      phoneNumberError ? "border-red-500" : ""
                    }`}
                    value={phoneNumber}
                    keyboardType="phone-pad"
                    editable={false}
                  />
                  {phoneNumberError ? (
                    <Text className="text-xs text-red-500 mt-1">
                      {phoneNumberError}
                    </Text>
                  ) : null}
                </View>

                <View>
                  <Text className="text-sm text-gray-700 mb-1">
                    {t("EditProfile.NIC")}
                  </Text>
                  <TextInput
                    className="h-10 px-3 bg-gray-200 rounded-full text-sm"
                    value={NICnumber}
                    editable={false}
                  />
                </View>
                <View>
                  <Text className="text-sm text-gray-700 mb-1">
                    {t("AddressDetails.Building")}
                  </Text>
                  <TextInput
                    className="h-10 px-3 bg-gray-200 rounded-full text-sm"
                    value={buidingname}
                    onChangeText={(text) => setBuildingName(text)}
                  />
                </View>

                <View>
                  <Text className="text-sm text-gray-700 mb-1">
                    {t("AddressDetails.Streetname")}
                  </Text>
                  <TextInput
                    className="h-10 px-3 bg-gray-200 rounded-full text-sm"
                    value={streetname}
                    onChangeText={(text) => setStreetName(text)}
                  />
                </View>

                <View>
                  <Text className="text-sm text-gray-700 mb-1">
                    {t("AddressDetails.City")}
                  </Text>
                  <TextInput
                    className="h-10 px-3 bg-gray-200 rounded-full text-sm"
                    value={city}
                    onChangeText={(text) => setCity(text)}
                  />
                </View>
              </View>

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
        </View>

        {isMenuVisible && (
          <View className="absolute top-12 right-6 bg-white  rounded-lg border border-gray-200 shadow-lg">
            <TouchableOpacity
              onPress={() => navigation.navigate("DeleteFarmer")}
              className=" rounded-lg py-3 px-4"
            >
              <Text className="text-[16px] text-center">{t("DeleteFarmer.title")}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default EngEditProfile;
