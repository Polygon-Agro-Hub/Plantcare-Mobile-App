import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  BackHandler,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { selectUserPersonal } from "@/store/userSlice";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import CustomHeader from "../common/CustomHeader";
import { useTranslation } from "react-i18next";

interface SupervisorProfileViewProps {
  navigation: any;
}

const SupervisorProfileView: React.FC<SupervisorProfileViewProps> = ({
  navigation,
}) => {
  const userPersonalData = useSelector(selectUserPersonal);
  const { t } = useTranslation();

  const inputStyle =
    "h-10 px-3 bg-[#F4F4F4] rounded-3xl text-sm h-[50px] item-center justify-center";

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      return () => subscription.remove();
    }, [navigation]),
  );

  const profileImage = userPersonalData?.profileImage
    ? { uri: userPersonalData.profileImage }
    : require("../../assets/images/auth/profile.webp");

  return (
    <View className="flex-1 bg-white">
      {/* Header */}

      <CustomHeader
        title={t("Profile.ViewProfile") || "View Profile"}
        navigation={navigation}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View className="items-center mt-6 mb-2">
          <View className="relative">
            <Image
              source={profileImage}
              className="w-24 h-24 rounded-full bg-gray-200"
            />
            <View className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#00A896] items-center justify-center border-2 border-white">
              <Ionicons name="person" size={13} color="#fff" />
            </View>
          </View>
          <View className="mt-2 px-3 py-0.5 bg-[#E6F7F5] rounded-full">
            <Text className="text-xs text-[#00A896] font-semibold">
              {t("Farms.FarmSupervisor") || t("Farms.Supervisor") || "Supervisor"}
            </Text>
          </View>
        </View>

        {/* Fields */}
        <View className="px-5 mt-4 space-y-4">
          {/* First Name */}
          <View>
            <Text className="text-[#070707] text-sm mb-2">
              {t("Inputs.FirstName")}
            </Text>
            <View className={inputStyle}>
              <Text className="text-sm text-gray-800">
                {userPersonalData?.firstName || "—"}
              </Text>
            </View>
          </View>

          {/* Last Name */}
           <View className="mt-4" >
            <Text className="text-[#070707] text-sm mb-2">
              {t("Inputs.LastName")}
            </Text>
            <View className={inputStyle}>
              <Text className="text-sm text-gray-800">
                {userPersonalData?.lastName || "—"}
              </Text>
            </View>
          </View>

          {/* Phone Number */}
            <View className="mt-4" >
            <Text className="text-[#070707] text-sm mb-2">
              {t("Inputs.PhoneNumber")}
            </Text>
            <View className={inputStyle}>
              <Text className="text-sm text-gray-800">
                {userPersonalData?.phoneNumber || "—"}
              </Text>
            </View>
          </View>

          {/* NIC Number */}
            <View className="mt-4" >
            <Text className="text-[#070707] text-sm mb-2">
              {t("Inputs.NICNumber")}
            </Text>
            <View className={inputStyle}>
              <Text className="text-sm text-gray-800">
                {userPersonalData?.NICnumber || "—"}
              </Text>
            </View>
          </View>

          {/* Info note */}
         
        </View>

        <View className="h-10" />
      </ScrollView>
    </View>
  );
};

export default SupervisorProfileView;
