import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Splash from '../component/Splash';
import Lanuage from '../component/Lanuage';
import { createStackNavigator } from '@react-navigation/stack';
import SigninSelection from '@/component/SigninSelection';
import Signin from '@/component/Signin';
import SigninSelectionSinhala from '@/component/SigninSelectionSinhala';
import SigninSinhala from '@/component/SigninSinhala';
import SigninSelectionTamil from '@/component/SigninSelectionTamil';
import SigninTamil from '../component/SigninTamil';
import SuccessScreen from '../component/SuccessScreen';
import Selectedcrop from '@/component/Selectedcrop';
import News from '../component/News';
import SignupForum from '@/component/SignupForum';
import SignupFS from '@/component/SignupForumSinhala';
import SignupFT from '@/component/SignupForumTamil';
import Verify from '@/component/Verify';
import OtpSinhalaVerification from '@/component/OtpSinhalaDashbord';
import Otpverification from '@/component/Otpverification';
import Dashboard from '@/component/Dashbord';
import NewCrop from '@/component/NewCrop';
import SelectCrop from '@/component/SelectCrop';
import SinhalaVerify from '@/component/SinhalaVerify';
import SinhalaDashbord from '@/component/SinhalaDashbord';
import OtpTamilVerification from '@/component/OtpTamilVerification';
import TamilDashbord from '@/component/TamilDashbord';
import TamilNewCrop from '@/component/TamilNewCrop';
import EngProfile from '@/component/EngProfile';
import EngQRcode from '@/component/EngQRcode';
import EngEditProfile from '@/component/EngEditProfile';
import WeatherForecastEng from '@/component/WeatherForecastEng';
import FiveDayForecastEng from '@/component/FiveDayForecastEng';
import FiveDayForecastSinhala from '@/component/FiveDayForecastSinhala';
import WeatherForecastSinhala from '@/component/WeatherForecastSinhala';
import SinProfile from '@/component/SinProfile';
import SinEditProfile from '@/component/SinEditProfile';
import WeatherForecastTamil from '@/component/WeatherForecastTamil';
import TamilProfile from '@/component/TamilProfile';
import TamilEditProfile from '@/component/TamilEditProfile';
import SinQRcode from '@/component/SinQRcode';
import TamilQRcode from '@/component/TamilQRcode';
import FiveDayForecastTamil from '@/component/FiveDayForecastTamil';
import SinhalaNewCrop from '@/component/SinhalaNewCrop';
import CurrentAssert from '@/component/CurrentAssert';
import AddAsset from '@/component/AddAsset';
import RemoveAsset from '@/component/RemoveAsset';
import AssertsFixedView from '@/component/AssertsFixedView';
import AddFixedAsset from '@/component/AddFixedAsset';
import fixedDashboard from '@/component/fixedDashboard';
import CropCalander from '@/component/CropCalander';
import MyCrop from '@/component/MyCrop';
import TamilVerify from '@/component/TamilVerify';

import { NativeWindStyleSheet } from 'nativewind';
import { LanguageProvider } from '@/context/LanguageContext';
import PublicForum from '@/component/PublicForum';
import PublicForumReplies from '@/component/PublicForumReplies';
import PublicForumPost from '@/component/PublicForumPost';
import NewsSinhala from '@/component/NewsSinhala';
import NewsTamil from '@/component/NewsTamil';
import SinhalaMyCrop from '@/component/SinhalaMyCrop';
import TamilMyCrop from '@/component/TamilMyCrop';
import CropCalanderSinhala from '@/component/CropCalanderSinhala';
import CropCalanderTamil from '@/component/CropCalanderTamil';

NativeWindStyleSheet.setOutput({
  default: "native",
});

const Stack = createStackNavigator(); // Create Stack navigator instance

const windowDimensions = Dimensions.get('window'); // Get window dimensions

const Index = () => {
  return (
    <LanguageProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Lanuage" component={Lanuage} />
        <Stack.Screen name='SigninSelection' component={SigninSelection} />
        <Stack.Screen name='Signin' component={Signin} />
        <Stack.Screen name='SigninSinhala' component={SigninSelectionSinhala} />
        <Stack.Screen name='SigninSinhalasc' component={SigninSinhala} />
        <Stack.Screen name='SigninSeTamil' component={SigninSelectionTamil} />
        <Stack.Screen name='SigninTamil' component={SigninTamil} />
        <Stack.Screen name='SuccessScreen' component={SuccessScreen} />
        <Stack.Screen name='Selectedcrop' component={Selectedcrop} />
        <Stack.Screen name='SignupForum' component={SignupForum} />
        <Stack.Screen name='SignumpFS' component={SignupFS} />
        <Stack.Screen name='SignupFT' component={SignupFT} />
        <Stack.Screen name='News' component={News as any} />
        <Stack.Screen name='NewsSinhala' component={NewsSinhala as any} />
        <Stack.Screen name='NewsTamil' component={NewsTamil as any} />
        <Stack.Screen name='Verify' component={Verify} />
        <Stack.Screen name='OTPS' component={OtpSinhalaVerification} />
        <Stack.Screen name='OTPE' component={Otpverification} />
        <Stack.Screen name='Dashboard' component={Dashboard} />
        <Stack.Screen name='NewCrop' component={NewCrop} />
        <Stack.Screen name='SelectCrop' component={SelectCrop as any} />
        <Stack.Screen name='SinhalaVerify' component={SinhalaVerify} />
        <Stack.Screen name='SinhalaDashbord' component={SinhalaDashbord} />
        <Stack.Screen name='OtpTamilverification' component={OtpTamilVerification as any} />
        <Stack.Screen name='TamilDashbord' component={TamilDashbord} />
        <Stack.Screen name='TamilNewCrop' component={TamilNewCrop} />
        <Stack.Screen name='TamilVerify' component={TamilVerify} />
        <Stack.Screen name='EngProfile' component={EngProfile} />
        <Stack.Screen name='EngQRcode' component={EngQRcode} />
        <Stack.Screen name='SinQRcode' component={SinQRcode} />
        <Stack.Screen name='TamilQRcode' component={TamilQRcode} />
        <Stack.Screen name='EngEditProfile' component={EngEditProfile} />
        <Stack.Screen name='WeatherForecastEng' component={WeatherForecastEng} />
        <Stack.Screen name='FiveDayForecastEng' component={FiveDayForecastEng} />
        <Stack.Screen name='FiveDayForecastSinhala' component={FiveDayForecastSinhala} />
        <Stack.Screen name='FiveDayForecastTamil' component={FiveDayForecastTamil} />
        <Stack.Screen name='WeatherForecastSinhala' component={WeatherForecastSinhala} />
        <Stack.Screen name='SinProfile' component={SinProfile} />
        <Stack.Screen name='SinEditProfile' component={SinEditProfile} />
        <Stack.Screen name='WeatherForecastTamil' component={WeatherForecastTamil} />
        <Stack.Screen name='TamilProfile' component={TamilProfile} />
        <Stack.Screen name='TamilEditProfile' component={TamilEditProfile} />
        <Stack.Screen name='SinhalaNewCrop' component={SinhalaNewCrop} />
        <Stack.Screen name='CurrentAssert' component={CurrentAssert} />
        <Stack.Screen name='AddAsset' component={AddAsset} />
        <Stack.Screen name='RemoveAsset' component={RemoveAsset} />
        <Stack.Screen name='AssertsFixedView' component={AssertsFixedView} />
        <Stack.Screen name='AddFixedAsset' component={AddFixedAsset} />
        <Stack.Screen name='fixedDashboard' component={fixedDashboard} />
        <Stack.Screen name='CropCalanderSinhala' component={CropCalanderSinhala as any} />
        <Stack.Screen name='CropCalanderTamil' component={CropCalanderTamil as any} />
        <Stack.Screen name='CropCalander' component={CropCalander as any} />
        <Stack.Screen name='MyCrop' component={MyCrop as any} />
        <Stack.Screen name='PublicForum' component={PublicForum} />
        <Stack.Screen name='PublicForumReplies' component={PublicForumReplies} />
        <Stack.Screen name='PublicForumPost' component={PublicForumPost} />
        <Stack.Screen name='SinhalaMyCrop' component={SinhalaMyCrop as any} />
        <Stack.Screen name='TamilMyCrop' component={TamilMyCrop as any} />
        
        
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
