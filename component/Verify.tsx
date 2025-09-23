import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  BackHandler,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import AntDesign from "react-native-vector-icons/AntDesign";
import Animated, { FadeIn } from "react-native-reanimated";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

// Import navigation components
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useTranslation } from "react-i18next";

// Define the types for navigation
type RootStackParamList = {
  Verify: undefined;
  NextScreen: undefined; // Define other screens as needed
};

// Define the Verify screen component
const Verify: React.FC = ({ navigation }: any) => {
  const { t } = useTranslation();

  useEffect(() => {
    // Disable the back button
    const handleBackPress = () => {
      return true; // Prevent the default back button behavior
    };

         const subscription = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    
          return () => subscription.remove();
  }, []);

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="light" />

      <View className="flex justify-center items-center ">
           <Image
                    source={require("../assets/images/OTP verify.webp")}
                      style={{ width: '100%', height: "60%" }}
                  resizeMode="contain"
                  className="-mb-6"
                  />
        {/* <Animated.View
          entering={FadeIn.delay(250).springify()}
          className="absolute w-28 h-28 bg-green-400 rounded-full flex justify-center items-center"
        >
          <AntDesign name="check" size={50} color="gray" />
        </Animated.View>

        <Animated.View
          entering={FadeIn.delay(500).springify()}
          className="absolute w-40 h-40 bg-green-200 rounded-full flex justify-center items-center"
        >
          <View className="absolute w-28 h-28 bg-green-400 rounded-full flex justify-center items-center">
            <AntDesign name="check" size={50} color="gray" />
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeIn.delay(750).springify()}
          className="w-52 h-52 bg-green-100 rounded-full flex justify-center items-center"
        >
          <View className="absolute w-40 h-40 bg-green-200 rounded-full flex justify-center items-center">
            <View className="absolute w-28 h-28 bg-green-400 rounded-full flex justify-center items-center">
              <AntDesign name="check" size={50} color="gray" />
            </View>
          </View>
        </Animated.View> */}
      </View>

      <View className="flex justify-center items-center ">
        <Text style={{ fontSize: 27 }} className="font-semibold text-[#404040]">
          {t("Verify.Successfully")}!
        </Text>
        <Text className="text-[#AAAAAA] mt-5" style={{ fontSize: 20 }}>
          {t("Verify.Identity")}
        </Text>
        <Text className="text-[#AAAAAA]" style={{ fontSize: 20 }}>
          {t("Verify.Verified")}
        </Text>
      </View>

      <View className="mt-20">
        <TouchableOpacity
          style={{ height: hp(8), width: wp(80) }}
          className="bg-[#353535] flex items-center justify-center mx-auto rounded-full"
          onPress={() => navigation.navigate("MembershipScreenSignUp")} // Replace 'NextScreen' with your actual next screen
        >
          <Text
            style={{ fontSize: 20 }}
            className="text-white font-bold tracking-wide"
          >
            {t("Verify.Continue")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Verify;
