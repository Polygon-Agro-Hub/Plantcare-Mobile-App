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
  Keyboard,
} from "react-native";
import { StatusBar, Platform } from "react-native";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/types";
import { AntDesign } from "@expo/vector-icons";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";
import { ScrollView } from "react-native-gesture-handler";
import Entypo from "@expo/vector-icons/Entypo";
import { useFocusEffect } from "@react-navigation/native";
import * as ImageManipulator from "expo-image-manipulator";
import districtData from "@/assets/jsons/common/district.json";
import GlobalSearchModal from "../../component/common/GlobalSearchModal";
import CustomHeader from "../../component/common/CustomHeader";
import LoadingPage from "../common/LoadingPage";

type EngEditProfileNavigationProps = StackNavigationProp<
  RootStackParamList,
  "EngEditProfile"
>;

interface EngEditProfileProps {
  navigation: EngEditProfileNavigationProps;
}

const EngEditProfile: React.FC<EngEditProfileProps> = ({ navigation }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [NICnumber, setNICnumber] = useState("");
  const [buidingname, setBuildingName] = useState("");
  const [streetname, setStreetName] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [profileImage, setProfileImage] = useState(
    require("../../assets/images/auth/profile.webp"),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [isMenuVisible, setMenuVisible] = useState(false);

  const [districtModalVisible, setDistrictModalVisible] = useState(false);

  const { t } = useTranslation();

  const districtItems = districtData.map((d) => ({
    label: t(d.translationKey),
    value: d.name,
    districtId: d.id,
    districtName: d.name,
  }));

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("EngProfile");
        return true;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      return () => subscription.remove();
    }, [navigation]),
  );

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setMenuVisible(false);
      };
    }, []),
  );

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsDataLoading(true);
        const response = await fetch(
          `${environment.API_BASE_URL}api/auth/user-profile`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${await AsyncStorage.getItem("userToken")}`,
            },
          },
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
          setProfileImage(
            data.user.profileImage
              ? { uri: data.user.profileImage }
              : require("../../assets/images/auth/profile.webp"),
          );
        } else {
          Alert.alert(t("Main.Error"), t("Main.SomethingWentWrongPleaseTryAgainlater"), [
            { text: t("Main.OK") },
          ]);
        }
      } catch (error) {
        Alert.alert(t("Main.Error"), t("Main.SomethingWentWrongPleaseTryAgainlater"), [
          { text: t("Main.OK") },
        ]);
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const uploadImage = async (imageUri: string) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert(t("Main.Error"), t("Main.SomethingWentWrongPleaseTryAgainlater"), [
          { text: t("Main.OK") },
        ]);
        return;
      }
      const formData = new FormData();
      const fileName = imageUri.split("/").pop();
      const fileType = fileName?.split(".").pop()
        ? `image/${fileName.split(".").pop()}`
        : "image/jpeg";
      formData.append("profileImage", {
        uri: imageUri,
        name: fileName,
        type: fileType,
      } as any);

      const response = await fetch(
        `${environment.API_BASE_URL}api/auth/upload-profile-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        },
      );
      const data = await response.json();
      if (data.status !== "success") {
        Alert.alert(t("Main.Error"), t("Main.SomethingWentWrongPleaseTryAgainlater"), [
          { text: t("Main.OK") },
        ]);
      }
    } catch (error) {
      Alert.alert(t("Main.Error"), t("Main.SomethingWentWrongPleaseTryAgainlater"), [
        { text: t("Main.OK") },
      ]);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("EditProfile.permissionDenied"),
        t("EditProfile.permissionDeniedMessage"),
        [{ text: t("Main.OK") }],
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled && result.assets?.length > 0) {
      const imageUri = result.assets[0].uri;
      const resizedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 500 } }],
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG },
      );
      setProfileImage({ uri: resizedImage.uri });
      await uploadImage(resizedImage.uri);
    }
  };

  const handleDistrictSelect = (items: string[]) => {
    if (!items.length) return;
    setDistrict(items[0]);
  };

  const handleSave = async () => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (!trimmedFirstName && !trimmedLastName) {
      Alert.alert(t("signinForm.sorry"), t("EditProfile.nameError"), [
        { text: t("Main.OK") },
      ]);
      return;
    } else if (!trimmedFirstName) {
      Alert.alert(t("signinForm.sorry"), t("EditProfile.firstNameRequired"), [
        { text: t("Main.OK") },
      ]);
      return;
    } else if (!trimmedLastName) {
      Alert.alert(t("signinForm.sorry"), t("EditProfile.lastNameRequired"), [
        { text: t("Main.OK") },
      ]);
      return;
    }

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert(t("Main.Error"), t("Main.SomethingWentWrongPleaseTryAgainlater"), [
          { text: t("Main.OK") },
        ]);
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
        },
      );

      const data = await response.json();
      if (data.status === "success") {
        Toast.show({
          type: "success",
          position: "bottom",
          text1: t("Main.Success"),
          text2: t("EditProfile.profileUpdatedSuccess"),
        });
        Alert.alert(
          t("Main.Success"),
          t("EditProfile.profileUpdatedSuccess"),
          [
            {
              text: t("Main.OK"),
              onPress: () => navigation.navigate("EngProfile"),
            },
          ],
        );
      } else {
        Alert.alert(t("Main.Error"), t("Main.SomethingWentWrongPleaseTryAgainlater"), [
          { text: t("Main.OK") },
        ]);
      }
    } catch (error) {
      Alert.alert(t("Main.Error"), t("EditProfile.updateProfileError"), [
        { text: t("Main.OK") },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isDataLoading) {
    return <LoadingPage fullScreen />;
  }

  const inputStyle =
    "h-10 px-3 bg-[#F4F4F4] rounded-3xl text-sm h-[50px] item-center justify-center";

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
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="relative">
            <CustomHeader
              title={t("EditProfile.editProfile")}
              navigation={navigation}
              onBackPress={() => navigation.navigate("EngProfile")}
            />

            <TouchableOpacity
              onPress={() => setMenuVisible(!isMenuVisible)}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              style={{ position: "absolute", right: 16, top: 16 }}
            >
              <Entypo name="dots-three-vertical" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <View className="flex-1 bg-white w-full">
            <View className="p-2 flex-1">
              <View className="items-center mb-6 relative">
                <Image
                  source={profileImage}
                  style={{ width: 100, height: 100, borderRadius: 50 }}
                />
                <TouchableOpacity
                  className="absolute right-[-25] bottom-0 p-1 bg-black mr-40 rounded-full"
                  onPress={pickImage}
                >
                  <Image
                    source={require("../../assets/images/auth/pencil.webp")}
                    style={{ width: 17, height: 17, tintColor: "white" }}
                  />
                </TouchableOpacity>
              </View>

              <View className="p-4">
                <View className="gap-8">
                  <View>
                    <Text className="text-sm text-gray-700 mb-1">
                      {t("EditProfile.FirstName")}
                    </Text>
                    <View className={inputStyle}>
                      <TextInput
                        value={firstName}
                        onChangeText={setFirstName}
                        maxLength={20}
                      />
                    </View>
                  </View>

                  <View>
                    <Text className="text-sm text-gray-700 mb-1">
                      {t("EditProfile.LastName")}
                    </Text>
                    <View className={inputStyle}>
                      <TextInput
                        value={lastName}
                        onChangeText={setLastName}
                        maxLength={20}
                      />
                    </View>
                  </View>

                  <View>
                    <Text className="text-sm text-gray-700 mb-1">
                      {t("EditProfile.PhoneNumber")}
                    </Text>
                    <View className={`${inputStyle} text-[#8492A3]`}>
                      <TextInput
                        value={phoneNumber}
                        keyboardType="phone-pad"
                        editable={false}
                      />
                    </View>
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
                    <View className={`${inputStyle} text-[#8492A3]`}>
                      <TextInput value={NICnumber} editable={false} />
                    </View>
                  </View>

                  <View>
                    <Text className="text-sm text-gray-700 mb-1">
                      {t("AddressDetails.Building")}
                    </Text>
                    <View className={inputStyle}>
                      <TextInput
                        placeholder={
                          t("AddressDetails.EnterBuildingHouse") ||
                          "Enter House / Building No"
                        }
                        value={buidingname}
                        onChangeText={setBuildingName}
                      />
                    </View>
                  </View>

                  <View>
                    <Text className="text-sm text-gray-700 mb-1">
                      {t("AddressDetails.Streetname")}
                    </Text>
                    <View className={inputStyle}>
                      <TextInput
                        placeholder={
                          t("AddressDetails.EnterStreetName") ||
                          "Enter Street Name"
                        }
                        value={streetname}
                        onChangeText={setStreetName}
                      />
                    </View>
                  </View>

                  <View>
                    <Text className="text-sm text-gray-700 mb-1">
                      {t("AddressDetails.City")}
                    </Text>
                    <View className={inputStyle}>
                      <TextInput
                        placeholder={
                          t("AddressDetails.EnterCityName") || "Enter City Name"
                        }
                        value={city}
                        onChangeText={setCity}
                      />
                    </View>
                  </View>

                  <View>
                    <Text className="text-sm text-gray-700 mb-2">
                      {t("FixedAssets.district")}
                    </Text>
                    <TouchableOpacity
                      className="h-[50px] rounded-3xl"
                      onPress={() => {
                        Keyboard.dismiss();
                        setDistrictModalVisible(true);
                      }}
                      style={{
                        backgroundColor: "#F4F4F4",
                        paddingHorizontal: 14,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          color: district ? "#111" : "#ccc",
                          flex: 1,
                        }}
                      >
                        {district
                          ? (districtItems.find((d) => d.value === district)
                            ?.label ?? district)
                          : t("FixedAssets.selectDistrict")}
                      </Text>
                      <AntDesign name="down" size={13} color="#555" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="flex-1 items-center justify-center mt-10 mb-12">
                  <TouchableOpacity
                    onPress={handleSave}
                    className={`bg-gray-800 rounded-3xl justify-center w-2/3 h-[50px] ${isLoading ? "opacity-50" : ""
                      }`}
                    disabled={isLoading}
                    style={{
                      shadowColor: "#000000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.25,
                      shadowRadius: 4,
                      elevation: 4,
                    }}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text className="text-center text-white text-lg">
                        {t("Main.Save")}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {isMenuVisible && (
            <View className="absolute top-12 right-6 bg-white rounded-lg border border-gray-200 shadow-lg">
              <TouchableOpacity
                onPress={() => navigation.navigate("DeleteFarmer")}
                className="rounded-lg py-3 px-4"
              >
                <Text className="text-[16px] text-center">
                  {t("DeleteFarmer.title")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>

      <GlobalSearchModal
        visible={districtModalVisible}
        onClose={() => setDistrictModalVisible(false)}
        title={t("FixedAssets.selectDistrict")}
        data={districtItems}
        selectedItems={district ? [district] : []}
        onSelect={handleDistrictSelect}
        searchPlaceholder={t("Main.Search...")}
        searchKeys={["label", "districtName"]}
        multiSelect={false}
      />
    </KeyboardAvoidingView>
  );
};

export default EngEditProfile;
