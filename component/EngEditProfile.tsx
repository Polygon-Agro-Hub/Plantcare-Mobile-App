import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,

  ActivityIndicator,
  BackHandler,
} from "react-native";
import { StatusBar, Platform } from "react-native";
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
import DropDownPicker from "react-native-dropdown-picker";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import * as ImageManipulator from 'expo-image-manipulator';
import LottieView from "lottie-react-native";

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
  const [district, setDistrict] = useState("");
  const [open, setOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(
    require("../assets/images/pcprofile 1.webp")
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true); // New state for data loading
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const { t } = useTranslation();
  const [isMenuVisible, setMenuVisible] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("EngProfile"); 
        return true; // Prevent default back action
      };

      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () => subscription.remove();
    }, [navigation])
  );

  const districtOptions = [
    { key: 1, value: "Ampara", translationKey: t("FixedAssets.Ampara") },
    {
      key: 2,
      value: "Anuradhapura",
      translationKey: t("FixedAssets.Anuradhapura"),
    },
    { key: 3, value: "Badulla", translationKey: t("FixedAssets.Badulla") },
    {
      key: 4,
      value: "Batticaloa",
      translationKey: t("FixedAssets.Batticaloa"),
    },
    { key: 5, value: "Colombo", translationKey: t("FixedAssets.Colombo") },
    { key: 6, value: "Galle", translationKey: t("FixedAssets.Galle") },
    { key: 7, value: "Gampaha", translationKey: t("FixedAssets.Gampaha") },
    {
      key: 8,
      value: "Hambantota",
      translationKey: t("FixedAssets.Hambantota"),
    },
    { key: 9, value: "Jaffna", translationKey: t("FixedAssets.Jaffna") },
    { key: 10, value: "Kalutara", translationKey: t("FixedAssets.Kalutara") },
    { key: 11, value: "Kandy", translationKey: t("FixedAssets.Kandy") },
    { key: 12, value: "Kegalle", translationKey: t("FixedAssets.Kegalle") },
    {
      key: 13,
      value: "Kilinochchi",
      translationKey: t("FixedAssets.Kilinochchi"),
    },
    {
      key: 14,
      value: "Kurunegala",
      translationKey: t("FixedAssets.Kurunegala"),
    },
    { key: 15, value: "Mannar", translationKey: t("FixedAssets.Mannar") },
    { key: 16, value: "Matale", translationKey: t("FixedAssets.Matale") },
    { key: 17, value: "Matara", translationKey: t("FixedAssets.Matara") },
    {
      key: 18,
      value: "Moneragala",
      translationKey: t("FixedAssets.Moneragala"),
    },
    {
      key: 19,
      value: "Mullaitivu",
      translationKey: t("FixedAssets.Mullaitivu"),
    },
    {
      key: 20,
      value: "Nuwara Eliya",
      translationKey: t("FixedAssets.NuwaraEliya"),
    },
    {
      key: 21,
      value: "Polonnaruwa",
      translationKey: t("FixedAssets.Polonnaruwa"),
    },
    { key: 22, value: "Puttalam", translationKey: t("FixedAssets.Puttalam") },
    {
      key: 23,
      value: "Rathnapura",
      translationKey: t("FixedAssets.Rathnapura"),
    },
    {
      key: 24,
      value: "Trincomalee",
      translationKey: t("FixedAssets.Trincomalee"),
    },
    { key: 25, value: "Vavuniya", translationKey: t("FixedAssets.Vavuniya") },
  ];

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsDataLoading(true); // Start loading
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
        console.log(data);
        if (data.status === "success") {
          const {
            firstName,
            lastName,
            phoneNumber,
            NICnumber,
            streetName,
            city,
            houseNo,
            district,
          } = data.user;
          setFirstName(firstName || "");
          setLastName(lastName || "");
          setPhoneNumber(phoneNumber || "");
          setNICnumber(NICnumber || "");
          setBuildingName(houseNo || "");
          setStreetName(streetName || "");
          setCity(city || "");
          setDistrict(district || "");
          setProfileImage({ uri: data.user.profileImage });
          if (!data.user.profileImage) {
            setProfileImage(require("../assets/images/pcprofile 1.webp"));
          }
        } else {
          Alert.alert(t("Main.error"), t("Main.somethingWentWrong"),[{ text:  t("PublicForum.OK") }]);
        }
      } catch (error) {
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"),[{ text:  t("PublicForum.OK") }]);
      } finally {
        setIsDataLoading(false); // Stop loading
      }
    };
    fetchProfileData();
  }, []);

  const uploadImage = async (imageUri: string) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"),[{ text:  t("PublicForum.OK") }]);
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
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"),[{ text:  t("PublicForum.OK") }]);
      }
    } catch (error) {
      Alert.alert(t("Main.error"), t("Main.somethingWentWrong"),[{ text:  t("PublicForum.OK") }]);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("EditProfile.permissionDenied"),
        t("EditProfile.permissionDeniedMessage"),[{ text:  t("PublicForum.OK") }]
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

      const resizedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 500 } }], 
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
      );
      console.log("Resized and compressed image:", resizedImage);
      setProfileImage({ uri: resizedImage.uri });
      // setProfileImage({ uri: imageUri });
      await uploadImage(resizedImage.uri);
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
      Alert.alert(t("signinForm.sorry"), t("EditProfile.nameError"),
           [
      {
        text: t("PublicForum.OK"),
        onPress: () => {
          navigation.navigate("EngProfile"); // Go back after successful update
        }
      }
    ]);
      return;
    }
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"),
            [{ text:  t("PublicForum.OK") }]);
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
            district,
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
          t("EditProfile.profileUpdatedSuccess"),
           [
      {
        text: t("PublicForum.OK"),
        onPress: () => {
          navigation.navigate("EngProfile"); // Go back after successful update
        }
      }
    ]
        );
      } else {
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"),        [{ text:  t("PublicForum.OK") }]);
      }
    } catch (error) {
      Alert.alert(t("Main.error"), t("EditProfile.updateProfileError"),
            [{ text:  t("PublicForum.OK") }]);
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

  // Show loading screen while data is being fetched
  if (isDataLoading) {
    return (
      <View className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <LottieView
            source={require('../assets/jsons/loader.json')}
            autoPlay
            loop
            style={{ width: 300, height: 300 }}
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      enabled
      style={{ flex: 1 }}
    >
      <StatusBar 
  barStyle="dark-content" 
  backgroundColor="transparent" 
  translucent={false}
/>
      <View className="flex-1 bg-white">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-row items-center justify-between px-4 pt-4 mb-6 bg-white">
            {/* Back Button */}
            <View>
              <TouchableOpacity
                onPress={() => navigation.navigate("Dashboard")}
                className="bg-[#F6F6F680] rounded-full items-center justify-center -mt-2"
                    style={{
                                width: 50,
                                height: 50,
                   
                              }}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
                <AntDesign
                  name="left"
                  size={24}
               
                  onPress={() => navigation.navigate("EngProfile")}
                />
              </TouchableOpacity>
            </View>

            {/* Page Title */}
            <View className="flex-1 items-center -ml-6">
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
                  className="absolute right-[-25] bottom-0 p-1 bg-black mr-40 rounded-full"
                  onPress={pickImage}
                >
                  <Image
                    source={require("../assets/images/Pencil.webp")}
                    style={{ width: 17, height: 17, tintColor: "white" }}
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
                      className="h-10 px-3 bg-[#F4F4F4] rounded-full text-sm"
                      value={firstName}
                      onChangeText={(text) => setFirstName(text)}
                      maxLength={20}
                    />
                  </View>

                  <View>
                    <Text className="text-sm text-gray-700 mb-1">
                      {t("EditProfile.LastName")}
                    </Text>
                    <TextInput
                      className="h-10 px-3 bg-[#F4F4F4] rounded-full text-sm"
                      value={lastName}
                      onChangeText={(text) => setLastName(text)}
                      maxLength={20}
                    />
                  </View>

                  <View>
                    <Text className="text-sm text-gray-700 mb-1">
                      {t("EditProfile.PhoneNumber")}
                    </Text>
                    <TextInput
                      className={`h-10 px-3 bg-[#F4F4F4] rounded-full text-sm ${
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
                      className="h-10 px-3 bg-[#F4F4F4] rounded-full text-sm"
                      value={NICnumber}
                      editable={false}
                    />
                  </View>
                  <View>
                    <Text className="text-sm text-gray-700 mb-1">
                      {t("AddressDetails.Building")}
                    </Text>
                    <TextInput
                      className="h-10 px-3 bg-[#F4F4F4] rounded-full text-sm"
                      value={buidingname}
                      onChangeText={(text) => setBuildingName(text)}
                    />
                  </View>

                  <View>
                    <Text className="text-sm text-gray-700 mb-1">
                      {t("AddressDetails.Streetname")}
                    </Text>
                    <TextInput
                      className="h-10 px-3 bg-[#F4F4F4] rounded-full text-sm"
                      value={streetname}
                      onChangeText={(text) => setStreetName(text)}
                    />
                  </View>

                  <View>
                    <Text className="text-sm text-gray-700 mb-1">
                      {t("AddressDetails.City")}
                    </Text>
                    <TextInput
                      className="h-10 px-3 bg-[#F4F4F4] rounded-full text-sm"
                      value={city}
                      onChangeText={(text) => setCity(text)}
                    />
                  </View>

                  <View>
                    <Text className="text-sm text-gray-700 mb-3">
                      {t("FixedAssets.district")}
                    </Text>
                    <View
                      className="h-8 mb-2 text-base pl-1  justify-center items-center "
                      // onTouchStart={() => {
                      //   dismissKeyboard();
                      // }}
                    >
                      <View className=" z-60   ">
                        <DropDownPicker
                          searchable={true}
                          open={open}
                          value={district}
                          // items={items}
                          setOpen={setOpen}
                          setValue={setDistrict}
                          // setItems={setItems}
                          items={districtOptions.map((item) => ({
                            label: t(item.translationKey),
                            value: item.value,
                          }))}
                          placeholder={t("FixedAssets.selectDistrict")}
                          searchPlaceholder={t("SignupForum.TypeSomething")} 
                          placeholderStyle={{ color: "#ccc" }}
                          listMode="MODAL"
                          modalProps={{
  animationType: "slide",
  transparent: false,
  presentationStyle: "fullScreen",
  statusBarTranslucent: false,
}}
modalContentContainerStyle={{
  paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  backgroundColor: '#fff',
}}
                          zIndex={3000}
                          zIndexInverse={1000}
                          dropDownContainerStyle={{
                            borderColor: "#ccc",
                            borderWidth: 0,
                          }}
                          style={{
                            backgroundColor: "#F4F4F4",
                            borderRadius: 30,
                            borderWidth: 0,
                            width: wp(85),
                            paddingHorizontal: 8,
                            paddingVertical: 10,
                          }}
                          textStyle={{ fontSize: 14 }}
                          // onOpen={dismissKeyboard}
                        />
                      </View>
                    </View>
                  </View>
                </View>

                <View className="flex-1 items-center mt-10 mb-12">
                  <TouchableOpacity
                    onPress={handleSave}
                    className={`bg-gray-800 rounded-full py-3 w-60 h-12 ${
                      isLoading ? "opacity-50" : ""
                    }`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text className="text-center text-white text-sm">
                        {t("EditProfile.Save")}
                      </Text>
                    )}
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
                <Text className="text-[16px] text-center">
                  {t("DeleteFarmer.title")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default EngEditProfile;