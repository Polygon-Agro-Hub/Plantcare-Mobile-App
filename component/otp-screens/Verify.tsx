import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, BackHandler, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import i18n from "@/i18n/i18n";
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
      <StatusBar style="light" />

      <View className="flex justify-center items-center ">
        <Image
          source={require("../../assets/images/otp/otp-verify.webp")}
          style={{ width: "100%", height: "60%" }}
          resizeMode="contain"
          className="-mb-6"
        />
      </View>

      <View className="flex justify-center items-center ">
        <Text
          className="font-semibold text-[#404040]"
          style={[
            i18n.language === "si"
              ? { fontSize: 20 }
              : i18n.language === "ta"
                ? { fontSize: 20 }
                : { fontSize: 25 },
          ]}
        >
          {t("Verify.Successfully")}!
        </Text>
        <Text
          className="text-[#AAAAAA] mt-5"
          style={[
            i18n.language === "si"
              ? { fontSize: 18 }
              : i18n.language === "ta"
                ? { fontSize: 18 }
                : { fontSize: 18 },
          ]}
        >
          {t("Verify.Identity")}
        </Text>
        <Text
          className="text-[#AAAAAA]"
          style={[
            i18n.language === "si"
              ? { fontSize: 18 }
              : i18n.language === "ta"
                ? { fontSize: 18 }
                : { fontSize: 18 },
          ]}
        >
          {t("Verify.Verified")}
        </Text>
      </View>

      <View className="mt-20">
        <TouchableOpacity
          className="bg-[#353535] flex items-center w-2/3 justify-center mx-auto rounded-3xl h-[50px]"
          style={{
            width: wp(72),
            height: hp(7),
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 4,
          }}
          onPress={() => navigation.navigate("MembershipScreenSignUp")}
        >
          <Text
            style={[
              i18n.language === "si"
                ? { fontSize: 18 }
                : i18n.language === "ta"
                  ? { fontSize: 18 }
                  : { fontSize: 20 },
            ]}
            className="text-white font-bold tracking-wide"
          >
            {t("Main.Continue")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Verify;
