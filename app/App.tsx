import React, { useEffect, useState } from "react";
import { Alert, BackHandler, Text, View ,  Dimensions, TextInput} from "react-native";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import NavigationBar from "@/Items/NavigationBar";
import { LanguageProvider } from "@/context/LanguageContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider, useSelector } from "react-redux";
import  store, { RootState } from "@/services/reducxStore";
import NetInfo from '@react-native-community/netinfo';
import { useTranslation } from "react-i18next";
import { navigationRef } from "../navigationRef"; 

import Splash from "../component/Splash";
import Lanuage from "../component/Lanuage";

import SigninSelection from "@/component/SigninSelection";
import Signin from "@/component/Signin";
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
import PublicForum from "@/component/PublicForum";
import PublicForumReplies from "@/component/PublicForumReplies";
import PublicForumPost from "@/component/PublicForumPost";
import UpdateAsset from "@/component/UpdateAsset";
import OtpverificationOldUser from "@/component/OtpverificationOldUser";
import CropEnrol from "@/component/CropEnrol";
import { LogBox } from 'react-native';
import MembershipScreen from "@/component/MembershipScreen";
import MembershipScreenUP from "@/component/MembershipScreenSignUp";
import BankDetailsScreen from "@/component/Bankdetails";
import BankDetailsSignUp from "@/component/BankdetailsSignUp";
import PrivacyPolicy from "@/component/PrivacyPolicy";
import TermsConditions from "@/component/TermsConditions";
import ComplainForm from "@/component/ComplainForm";
import ComplainHistory from "@/component/ComplainHistory";
import DeleteFarmer from "@/component/DeleteFarmer";
import UserFeedback from "@/component/UserFeedback";
import TransactionHistory from "@/component/TransactionList";
import TransactionReport from "@/component/TransactionReport";

import AddNewFarmFirst from "@/component/Farm/AddNewFarmFirst";
import FirstLoginView from "@/component/Farm/FirstLoginProView";
import FirstTimePackagePlan from "@/component/Farm/FirstTimePackagePlan";
import PaymentGatewayView from "@/component/Farm/PaymentGatewayView";
import PaymentGatewayeRenew from "@/component/Farm/PaymentGatewayeRenew";

import AddNewFarmBasicDetails from "@/component/Farm/AddNewFarmBasicDetails";
import AddNewFarmSecondDetails from "@/component/Farm/AddNewFarmSecondDetails";
import Addmemberdetails from "@/component/Farm/Addmemberdetails"
import AddFarmList from "@/component/Farm/AddFarmList"
import UnloackPro from "@/component/Farm/UnlockPro"
import UnLockProRenew from "@/component/Farm/UnLockProRenew"
import FarmDetailsScreen from "@/component/Farm/FarmDetailsScreen"
import AddNewFarmUnloackPro from "@/component/Farm/AddNewFarmUnloackPro"
import EditManagersScreen from "@/component/Farm/EditManagersScreen"
import AddNewCrop from "@/component/Farm/AddNewCrop"
import FarmCropEnroll from "@/component/Farm/FarmCropEnroll"
import FarmSelectCrop from "@/component/Farm/FarmSelectCrop"
import EditFarm from "@/component/Farm/EditFarm"
import FromFramEditFarm from "@/component/Farm/FromFramEditFarm"
import AddnewStaff from "@/component/Farm/AddnewStaff"
import EditStaffMember from "@/component/Farm/EditStaffMember"
import PublicForumPostEdit from "@/component/PublicForumPostEdit"
import MyCultivation from "@/component/Farm/MyCultivation"
import LabororDashbord from '@/component/Laboror/LabororDashbord'
import LabororEngProfile from '@/component/Laboror/LabororEngProfile'
import OwnerQRcode from '@/component/Laboror/OwnerQRcode'
import FarmCurrectAssets from '@/component/Farm/FarmCurrectAssets'
import FarmAssertsFixedView from '@/component/Farm/FarmAssertsFixedView'
import FarmFixDashBoard from '@/component/Farm/FarmFixDashBoard'
import FarmAddFixAssert from '@/component/Farm/FarmAddFixAssert'
import FarmAddCurrentAsset from '@/component/Farm/FarmAddCurrentAsset'
import FarmCurrectAssetRemove from '@/component/Farm/FarmCurrectAssetRemove'
import FarmCropCalander from '@/component/Farm/FarmCropCalander'
import ManagerDashbord from "@/component/Manager/ManagerDashbord";
import SupervisorDashboard from "@/component/Supervisor/SupervisorDashboard"
import { StatusBar } from "expo-status-bar";


LogBox.ignoreAllLogs(true);
NativeWindStyleSheet.setOutput({
  default: "native",
});

(Text as any).defaultProps = {
  ...(Text as any).defaultProps,
  allowFontScaling: false,
};

(TextInput as any).defaultProps = {
  ...(TextInput as any).defaultProps,
  allowFontScaling: false,
};

const Stack = createStackNavigator(); 
const Tab = createBottomTabNavigator();
const windowDimensions = Dimensions.get("window");

// Example Screens
function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-blue-100">
      <Text className="text-2xl font-bold text-blue-800">Home Screen</Text>
    </View>
  );
}

function MainTabNavigator() {
      const [initialTab, setInitialTab] = useState('Dashboard');
  const user = useSelector((state: RootState) => state.user.userData);

  useEffect(() => {
     if (!user) return;
     console.log(user.role)

    // Set the first tab based on user role
    if (user.role === "Laborer" ) {
      setInitialTab('LabororDashbord'); // Set the first tab for Distribution Manager/Officer
    } else if (user.role === "Manager") {
      setInitialTab('ManagerDashbord'); // Set the first tab for Manager
    } else if (user.role === "Supervisor") {
      setInitialTab('SupervisorDashbord'); // Set the first tab for Supervisor
    } else {
      setInitialTab('Dashboard'); // Set the first tab for other roles like Manager
    }
  }, [user]);

  return (
    <Tab.Navigator
       initialRouteName={initialTab}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: false,
        tabBarStyle: { position: "absolute", backgroundColor: "#fff" },
      })}
      

      
      tabBar={(props) => <NavigationBar {...props} />}
    >
   <Tab.Screen name="Dashboard" component={Dashboard} />
              <Tab.Screen name="LabororDashbord" component={LabororDashbord} />
              <Tab.Screen name="ManagerDashbord" component={ManagerDashbord} />
              <Tab.Screen name="SupervisorDashbord" component={SupervisorDashboard} />

      <Tab.Screen name="AddFixedAsset" component={AddFixedAsset} />
      <Tab.Screen name="ComplainHistory" component={ComplainHistory} />
      <Tab.Screen name="CropCalander" component={CropCalander as any} />
      <Tab.Screen name="CurrentAssert" component={CurrentAssert} />
      <Tab.Screen name="EngEditProfile" component={EngEditProfile} />
      <Tab.Screen name="FiveDayForecastEng" component={FiveDayForecastEng} />
      <Tab.Screen name="FiveDayForecastSinhala" component={FiveDayForecastSinhala} />
      <Tab.Screen name="FiveDayForecastTamil" component={FiveDayForecastTamil} />
      <Tab.Screen name="fixedDashboard" component={FixedDashboard} />
      <Tab.Screen name="NewCrop" component={NewCrop} />
      <Tab.Screen name="News" component={News as any} />
      <Tab.Screen name="RemoveAsset" component={RemoveAsset} />
      <Tab.Screen name="WeatherForecastEng" component={WeatherForecastEng} />
        <Tab.Screen name="WeatherForecastSinhala" component={WeatherForecastSinhala}/>
        <Tab.Screen name="WeatherForecastTamil" component={WeatherForecastTamil}/>
        <Tab.Screen name="TransactionHistory" component={TransactionHistory as any}/>
        
      <Tab.Screen name="AddNewFarmFirst" component={AddNewFarmFirst} />
      <Tab.Screen name="PaymentGatewayView" component={PaymentGatewayView as any} />
        <Tab.Screen name="PaymentGatewayeRenew" component={PaymentGatewayeRenew as any} />
       <Tab.Screen name="EngQRcode" component={EngQRcode} />
       <Tab.Screen name="ComplainForm" component={ComplainForm} />
       <Tab.Screen name="AddAsset" component={AddAsset} />
       <Tab.Screen name="FarmAddFixAssert" component={FarmAddFixAssert} />
       <Tab.Screen name="FarmCurrectAssets" component={FarmCurrectAssets }  />
       <Tab.Screen name="MyCultivation" component={MyCultivation} />
       <Tab.Screen name="FarmDetailsScreen" component={FarmDetailsScreen} />    
        <Tab.Screen name="AddFarmList" component={AddFarmList} />
         <Tab.Screen name="AddNewFarmBasicDetails" component={AddNewFarmBasicDetails} /> 
          <Tab.Screen name="AddNewFarmSecondDetails" component={AddNewFarmSecondDetails} />  
 <Tab.Screen name="Addmemberdetails" component={Addmemberdetails} /> 
 <Tab.Screen name="EditFarm" component={EditFarm as any} /> 
  <Tab.Screen name="EditManagersScreen" component={EditManagersScreen} /> 
   <Tab.Screen name="AddnewStaff" component={AddnewStaff as any} />
    <Tab.Screen name="EditStaffMember" component={EditStaffMember as any} />
     <Tab.Screen name="FromFramEditFarm" component={FromFramEditFarm as any} />
     <Tab.Screen name="AddNewCrop" component={AddNewCrop }/> 
      <Tab.Screen
          name="AssertsFixedView"
          component={AssertsFixedView as any}
        />
         <Tab.Screen name="FarmAddCurrentAsset" component={FarmAddCurrentAsset as any} />
         <Tab.Screen name="FarmAssertsFixedView" component={FarmAssertsFixedView as any} />
          <Tab.Screen name="FarmFixDashBoard" component={FarmFixDashBoard as any} />
    </Tab.Navigator>
  );
}

function AppContent() {
  const insets = useSafeAreaInsets();
 const { t } = useTranslation();

  const [isOfflineAlertShown, setIsOfflineAlertShown] = useState(false);

  useEffect(() => {
    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      if (!state.isConnected && !isOfflineAlertShown) {
        setIsOfflineAlertShown(true); // mark that alert is shown
        Alert.alert(
          t("Main.No Internet Connection"),
          t("Main.Please turn on mobile data or Wi-Fi to continue."),
          [
            {
              text: "OK",
              onPress: () => {
                // Reset flag after user presses OK
                setIsOfflineAlertShown(false);
              },
            },
          ]
        );
      }
    });

    return () => {
      unsubscribeNetInfo();
    };
  }, [isOfflineAlertShown]);

useEffect(() => {
  const backAction = () => {
    if (!navigationRef.isReady()) {
      // Navigation not ready yet, let default system back handle it
      return false;
    }

    const currentRouteName = navigationRef.getCurrentRoute()?.name ?? "";

    if (currentRouteName === "Dashboard") {
      BackHandler.exitApp();
      return true;
    } else if (navigationRef.canGoBack()) {
      navigationRef.goBack();
      return true;
    }
    return false;
  };

  const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
  return () => backHandler.remove();
}, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        style={{ flex: 1, paddingBottom: insets.bottom, backgroundColor: "#fff" }}
        edges={["top", "right", "left"]}
      >
        <StatusBar  style="dark" backgroundColor="#fff" />
        <NavigationContainer   ref={navigationRef}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
             <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Lanuage" component={Lanuage} />
        <Stack.Screen name="SigninSelection" component={SigninSelection} />
        <Stack.Screen name="Signin" component={Signin} />
        <Stack.Screen name="SignupForum" component={SignupForum} />
        <Stack.Screen name="Verify" component={Verify} />
        <Stack.Screen name="OTPE" component={Otpverification} />
        <Stack.Screen name="OTPEOLDUSER" component={OtpverificationOldUser} />
        <Stack.Screen name="SelectCrop" component={SelectCrop as any} />
        <Stack.Screen name="EngProfile" component={EngProfile as any} />
        <Stack.Screen name="UpdateAsset" component={UpdateAsset as any} />
        <Stack.Screen name="PublicForum" component={PublicForum as any} />
        <Stack.Screen
          name="PublicForumReplies"
          component={PublicForumReplies}
        />
        <Stack.Screen name="PublicForumPost" component={PublicForumPost} />
                <Stack.Screen name="PublicForumPostEdit" component={PublicForumPostEdit as any} />

        <Stack.Screen name="MembershipScreen" component={MembershipScreen} />
        <Stack.Screen name="MembershipScreenSignUp" component={MembershipScreenUP} />

        <Stack.Screen name="BankDetailsScreen" component={BankDetailsScreen} />
        <Stack.Screen name="BankDetailsSignUp" component={BankDetailsSignUp} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
        <Stack.Screen name="TermsConditions" component={TermsConditions} />
        <Stack.Screen name="CropEnrol" component={CropEnrol as any} />
        <Stack.Screen name="DeleteFarmer" component={DeleteFarmer as any} />
        <Stack.Screen name="UserFeedback" component={UserFeedback as any} />
        <Stack.Screen name="TransactionReport" component={TransactionReport} />

        <Stack.Screen name='Main' component={MainTabNavigator} options={{ headerShown: false }} />

        <Stack.Screen name="FirstLoginProView" component={FirstLoginView} />
        <Stack.Screen name="FirstTimePackagePlan" component={FirstTimePackagePlan} />        
         <Stack.Screen name="UnloackPro" component={UnloackPro} /> 
         <Stack.Screen name="UnLockProRenew" component={UnLockProRenew} />
         <Stack.Screen name="FarmDetailsScreen" component={FarmDetailsScreen} />     
          <Stack.Screen name="AddNewFarmUnloackPro" component={AddNewFarmUnloackPro} />   
             <Stack.Screen name="FarmCropEnroll" component={FarmCropEnroll as any} /> 
             <Stack.Screen name="FarmSelectCrop" component={FarmSelectCrop as any} /> 
              <Stack.Screen name="MyCrop" component={MyCrop as any} />
                 <Stack.Screen name="FarmCropCalander" component={FarmCropCalander as any} />
              <Stack.Screen name="LabororEngProfile" component={LabororEngProfile} />
              <Stack.Screen name="OwnerQRcode" component={OwnerQRcode} />
              <Stack.Screen name="FarmCurrectAssetRemove" component={FarmCurrectAssetRemove} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
      </Provider>
    </SafeAreaProvider>
  );
}