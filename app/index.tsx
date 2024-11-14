import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import Splash from "../component/Splash";
import Lanuage from "../component/Lanuage";
import { createStackNavigator } from "@react-navigation/stack";
import SigninSelection from "@/component/SigninSelection";
import Signin from "@/component/Signin";

import SuccessScreen from "../component/SuccessScreen";
import Selectedcrop from "@/component/Selectedcrop";
import News from "../component/News";
import SignupForum from "@/component/SignupForum";

import Verify from "@/component/Verify";
import Otpverification from "@/component/Otpverification";
import Dashboard from "@/component/Dashbord";
import NewCrop from "@/component/NewCrop";
import SelectCrop from "@/component/SelectCrop";
import EngProfile from "@/component/EngProfile";
import EngQRcode from "@/component/EngQRcode";
import EngEditProfile from "@/component/EngEditProfile";
import WeatherForecastEng from "@/component/WeatherForecastEng";
import FiveDayForecastEng from "@/component/FiveDayForecastEng";
import FiveDayForecastSinhala from "@/component/FiveDayForecastSinhala";
import WeatherForecastSinhala from "@/component/WeatherForecastSinhala";
import WeatherForecastTamil from "@/component/WeatherForecastTamil";
import FiveDayForecastTamil from "@/component/FiveDayForecastTamil";
import CurrentAssert from "@/component/CurrentAssert";
import AddAsset from "@/component/AddAsset";
import RemoveAsset from "@/component/RemoveAsset";
import AssertsFixedView from "@/component/AssertsFixedView";
import AddFixedAsset from "@/component/AddFixedAsset";
import FixedDashboard from "@/component/fixedDashboard";
import CropCalander from "@/component/CropCalander";
import MyCrop from "@/component/MyCrop";
import { NativeWindStyleSheet } from "nativewind";
import { LanguageProvider } from "@/context/LanguageContext";
import PublicForum from "@/component/PublicForum";
import PublicForumReplies from "@/component/PublicForumReplies";
import PublicForumPost from "@/component/PublicForumPost";
import UpdateAsset from "@/component/UpdateAsset";
import SigninOldUser from "@/component/SigninOldUser";
import OtpverificationOldUser from "@/component/OtpverificationOldUser";
import CropEnrol from "@/component/CropEnrol";
import { LogBox } from 'react-native';


LogBox.ignoreAllLogs(true);
NativeWindStyleSheet.setOutput({
  default: "native",
});

const Stack = createStackNavigator(); // Create Stack navigator instance

const windowDimensions = Dimensions.get("window"); // Get window dimensions

const Index = () => {
  return (
    <LanguageProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Lanuage" component={Lanuage} />
        <Stack.Screen name="SigninSelection" component={SigninSelection} />
        <Stack.Screen name="Signin" component={Signin} />
        <Stack.Screen name="SigninOldUser" component={SigninOldUser} />
        <Stack.Screen name="SuccessScreen" component={SuccessScreen} />
        <Stack.Screen name="Selectedcrop" component={Selectedcrop} />
        <Stack.Screen name="SignupForum" component={SignupForum} />
        <Stack.Screen name="News" component={News as any} />
        <Stack.Screen name="Verify" component={Verify} />
        <Stack.Screen name="OTPE" component={Otpverification} />
        <Stack.Screen name="OTPEOLDUSER" component={OtpverificationOldUser} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="NewCrop" component={NewCrop} />
        <Stack.Screen name="SelectCrop" component={SelectCrop as any} />
        <Stack.Screen name="EngProfile" component={EngProfile} />
        <Stack.Screen name="EngQRcode" component={EngQRcode} />
        <Stack.Screen name="EngEditProfile" component={EngEditProfile} />
        <Stack.Screen
          name="WeatherForecastEng"
          component={WeatherForecastEng}
        />
        <Stack.Screen
          name="FiveDayForecastEng"
          component={FiveDayForecastEng}
        />
        <Stack.Screen
          name="FiveDayForecastSinhala"
          component={FiveDayForecastSinhala}
        />
        <Stack.Screen
          name="FiveDayForecastTamil"
          component={FiveDayForecastTamil}
        />
        <Stack.Screen
          name="WeatherForecastSinhala"
          component={WeatherForecastSinhala}
        />

        <Stack.Screen
          name="WeatherForecastTamil"
          component={WeatherForecastTamil}
        />
        <Stack.Screen name="CurrentAssert" component={CurrentAssert} />
        <Stack.Screen name="AddAsset" component={AddAsset} />
        <Stack.Screen name="RemoveAsset" component={RemoveAsset} />
        <Stack.Screen
          name="AssertsFixedView"
          component={AssertsFixedView as any}
        />
        <Stack.Screen name="AddFixedAsset" component={AddFixedAsset} />
        <Stack.Screen name="fixedDashboard" component={FixedDashboard} />
        <Stack.Screen name="CropCalander" component={CropCalander as any} />
        <Stack.Screen name="MyCrop" component={MyCrop as any} />
        <Stack.Screen name="UpdateAsset" component={UpdateAsset as any} />
        <Stack.Screen name="PublicForum" component={PublicForum} />
        <Stack.Screen
          name="PublicForumReplies"
          component={PublicForumReplies}
        />
        <Stack.Screen name="PublicForumPost" component={PublicForumPost} />
        <Stack.Screen name="CropEnrol" component={CropEnrol as any} />
      </Stack.Navigator>
    </LanguageProvider>
  );
};

// Responsive styles (if needed for specific components)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: windowDimensions.width * 0.05, // 5% padding
    paddingVertical: windowDimensions.height * 0.02, // 2% padding
  },
  header: {
    fontSize: windowDimensions.width * 0.05, // 5% of screen width for font size
  },
});

export default Index;
