import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, BackHandler, Image } from "react-native";
import { useTranslation } from "react-i18next";

const Verify: React.FC = ({ navigation }: any) => {
  const { t } = useTranslation();

  useEffect(() => {
    const handleBackPress = () => {
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress,
    );

    return () => subscription.remove();
  }, []);

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 justify-center">
        <View className="flex justify-center items-center">
          <Image
            source={require("../../assets/images/otp/otp-verify.webp")}
            style={{ width: "100%", height: 250 }}
            resizeMode="contain"
          />
        </View>

        <View className="flex justify-center items-center px-4 mt-10">
          <Text
            className="font-semibold text-[#404040] text-center"
            style={{ fontSize: 25 }}
          >
            {t("Verify.SuccessfullyVerified")}!
          </Text>
          <Text
            className="text-[#AAAAAA] mt-5 text-center"
            style={{ fontSize: 18 }}
          >
            {t("Verify.YourIdentityHasBeen")}
          </Text>
          <Text className="text-[#AAAAAA] text-center" style={{ fontSize: 18 }}>
            {t("Verify.VerifiedSuccessfully")}
          </Text>
        </View>

        {/* Centered Button */}
        <View className="mt-10 items-center justify-center px-12 w-full">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate("MembershipScreenSignUp")}
            className="w-full rounded-3xl h-[50px] justify-center items-center bg-[#353535] shadow-lg elevation-6"
          >
            <Text className="text-white font-semibold text-center text-lg">
              {t("Main.Continue")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Verify;