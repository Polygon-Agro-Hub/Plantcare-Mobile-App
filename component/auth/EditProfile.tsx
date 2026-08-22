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
import { Platform } from "react-native";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/types";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
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
import { useDispatch, useSelector } from "react-redux";
import { selectUserPersonal, setUserPersonalData } from "@/store/userSlice";

type EditProfileNavigationProps = StackNavigationProp<
  RootStackParamList,
  "EditProfile"
>;

interface EditProfileProps {
  navigation: EditProfileNavigationProps;
}

const EditProfile: React.FC<EditProfileProps> = ({ navigation }) => {
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
  const dispatch = useDispatch();
  const userPersonalData = useSelector(selectUserPersonal);

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
          Alert.alert(
            t("Main.Error"),
            t("Main.SomethingWentWrongPleaseTryAgainlater"),
            [{ text: t("Main.OK") }],
          );
        }
      } catch (error) {
        Alert.alert(
          t("Main.Error"),
          t("Main.SomethingWentWrongPleaseTryAgainlater"),
          [{ text: t("Main.OK") }],
        );
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
        Alert.alert(
          t("Main.Error"),
          t("Main.SomethingWentWrongPleaseTryAgainlater"),
          [{ text: t("Main.OK") }],
        );
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
      if (data.status === "success") {
        // The server is the source of truth for the hosted image URL.
        // Fall back to the local uri only if the server doesn't echo one back.
        const newImageUrl: string =
          data.user?.profileImage || data.profileImage || imageUri;

        // Keep the local preview in sync with what will be persisted.
        setProfileImage({ uri: newImageUrl });

        // This is the critical fix: push the new image URL into Redux so
        // that any screen reading selectUserPersonal (e.g. UserProfile)
        // sees the update immediately, without needing an app reload.
        dispatch(
          setUserPersonalData({
            ...userPersonalData,
            profileImage: newImageUrl,
          }),
        );
      } else {
        Alert.alert(
          t("Main.Error"),
          t("Main.SomethingWentWrongPleaseTryAgainlater"),
          [{ text: t("Main.OK") }],
        );
      }
    } catch (error) {
      Alert.alert(
        t("Main.Error"),
        t("Main.SomethingWentWrongPleaseTryAgainlater"),
        [{ text: t("Main.OK") }],
      );
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("EditProfile.PermissionDenied"),
        t("EditProfile.PleaseAllowAccessToYourGalleryToProceed"),
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
      // Show the local file immediately for a responsive UI...
      setProfileImage({ uri: resizedImage.uri });
      // ...then uploadImage() will replace it (and Redux) with the
      // server-hosted URL once the upload succeeds.
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
      Alert.alert(
       t("Main.Sorry"),
        t("EditProfile.FirstNameAndLastNameCannotBeEmpty"),
        [{ text: t("Main.OK") }],
      );
      return;
    } else if (!trimmedFirstName) {
      Alert.alert(t("Main.Sorry"), t("Inputs.FirstNameRequired"), [
        { text: t("Main.OK") },
      ]);
      return;
    } else if (!trimmedLastName) {
      Alert.alert(t("Main.Sorry"), t("Inputs.LastNameRequired"), [
        { text: t("Main.OK") },
      ]);
      return;
    }

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert(
          t("Main.Error"),
          t("Main.SomethingWentWrongPleaseTryAgainlater"),
          [{ text: t("Main.OK") }],
        );
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
        // This is the critical fix: push the updated fields into Redux so
        // UserProfile (which reads selectUserPersonal) reflects the change
        // as soon as it comes back into focus.
        dispatch(
          setUserPersonalData({
            ...userPersonalData,
            firstName,
            lastName,
            NICnumber,
            phoneNumber,
          }),
        );

        Toast.show({
          type: "success",
          position: "bottom",
          text1: t("Main.Success"),
          text2: t("EditProfile.YourProfileHasBeenUpdatedSuccessfully"),
        });
        Alert.alert(
          t("Main.Success"),
          t("EditProfile.YourProfileHasBeenUpdatedSuccessfully"),
          [
            {
              text: t("Main.OK"),
              onPress: () => navigation.navigate("EngProfile"),
            },
          ],
        );
      } else {
        Alert.alert(
          t("Main.Error"),
          t("Main.SomethingWentWrongPleaseTryAgainlater"),
          [{ text: t("Main.OK") }],
        );
      }
    } catch (error) {
      Alert.alert(
        t("Main.Error"),
        t("EditProfile.FailedToUpdateProfileTryAgainLater"),
        [{ text: t("Main.OK") }],
      );
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
      <View className="flex-1 bg-white">
        <View className="relative">
          <CustomHeader
            title={t("EditProfile.EditProfile")}
            navigation={navigation}
            onBackPress={() => navigation.navigate("EngProfile")}
            rightComponent={
              <TouchableOpacity
                onPress={() => setMenuVisible(!isMenuVisible)}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
                <Entypo name="dots-three-vertical" size={20} color="black" />
              </TouchableOpacity>
            }
          />
          {isMenuVisible && (
            <View
              className="absolute bg-white rounded-lg border border-gray-200 shadow-lg z-50"
              style={{ top: 48, right: 16 }}
            >
              <TouchableOpacity
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate("DeleteFarmer");
                }}
                className="rounded-lg py-3 px-4"
              >
                <Text className="text-[16px] text-center">
                  {t("DeleteFarmer.DeleteMyAccount")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 bg-white w-full">
            <View className="flex-1">
              <View className="items-center mb-6">
                <View style={{ width: 100, height: 100, position: "relative" }}>
                  <Image
                    source={profileImage}
                    style={{ width: 100, height: 100, borderRadius: 50 }}
                  />
                  <TouchableOpacity
                    className="absolute bottom-0 right-0 p-2 bg-black rounded-full"
                    onPress={pickImage}
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 3.84,
                      elevation: 5,
                    }}
                  >
                    <Image
                      source={require("../../assets/images/auth/pencil.webp")}
                      style={{ width: 16, height: 16, tintColor: "white" }}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="px-6 py-4">
                <View className="mb-4">
                  <Text className="text-[#070707] text-sm mb-2">
                    {t("Inputs.FirstName")}
                  </Text>
                  <View className={inputStyle}>
                    <TextInput
                      value={firstName}
                      onChangeText={setFirstName}
                      maxLength={20}
                    />
                  </View>
                </View>

                <View className="mb-4">
                  <Text className="text-[#070707] text-sm mb-2">
                    {t("Inputs.LastName")}
                  </Text>
                  <View className={inputStyle}>
                    <TextInput
                      value={lastName}
                      onChangeText={setLastName}
                      maxLength={20}
                    />
                  </View>
                </View>

                <View className="mb-4">
                  <Text className="text-[#070707] text-sm mb-2">
                    {t("Inputs.PhoneNumber")}
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

                <View className="mb-4">
                  <Text className="text-[#070707] text-sm mb-2">
                    {t("Inputs.NICNumber")}
                  </Text>
                  <View className={`${inputStyle} text-[#8492A3]`}>
                    <TextInput value={NICnumber} editable={false} />
                  </View>
                </View>

                <View className="mb-4">
                  <Text className="text-[#070707] text-sm mb-2">
                    {t("AddressDetails.BuildingHouseNo")}
                  </Text>
                  <View className={inputStyle}>
                    <TextInput
                      placeholder={
                        t("AddressDetails.EnterHouseBuildingNo") ||
                        "Enter House / Building No"
                      }
                      value={buidingname}
                      onChangeText={setBuildingName}
                    />
                  </View>
                </View>

                <View className="mb-4">
                  <Text className="text-[#070707] text-sm mb-2">
                    {t("AddressDetails.StreetName")}
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

                <View className="mb-4">
                  <Text className="text-[#070707] text-sm mb-2">
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

                <View className="mb-4">
                  <Text className="text-[#070707] text-sm mb-2">
                    {t("FixedAssets.District")}
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
                        : t("FixedAssets.SelectDistrict")}
                    </Text>
                    <MaterialIcons
                      name="arrow-drop-down"
                      size={24}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>

                <View className="flex-1 items-center justify-center mt-6 mb-20 w-full px-6">
                  <TouchableOpacity
                    onPress={handleSave}
                    disabled={isLoading}
                    activeOpacity={0.8}
                    className={`w-full rounded-3xl h-[50px] justify-center items-center shadow-lg elevation-6 ${
                      isLoading ? "bg-[#9CA3AF]" : "bg-[#353535]"
                    }`}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text className="text-center text-white text-lg font-semibold">
                        {t("Main.Save")}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      <GlobalSearchModal
        visible={districtModalVisible}
        onClose={() => setDistrictModalVisible(false)}
        title={t("FixedAssets.SelectDistrict")}
        data={districtItems}
        selectedItems={district ? [district] : []}
        onSelect={handleDistrictSelect}
        searchPlaceholder={t("Main.Search...")}
        searchKeys={["label", "districtName"]}
        multiSelect={false}
        noResultsText="No district found"
      />
    </KeyboardAvoidingView>
  );
};

export default EditProfile;