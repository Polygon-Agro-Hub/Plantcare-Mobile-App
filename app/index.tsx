import React, {useCallback, useEffect, useState} from "react";
import { Text, TextInput, Platform, Dimensions, StyleSheet } from "react-native";
import Splash from "../component/Splash";
import Lanuage from "../component/Lanuage";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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
import { LanguageProvider } from "@/context/LanguageContext";
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
import NavigationBar from "@/Items/NavigationBar";
import DeleteFarmer from "@/component/DeleteFarmer";
import UserFeedback from "@/component/UserFeedback";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { BackHandler } from "react-native";
import TransactionHistory from "@/component/TransactionList";
import TransactionReport from "@/component/TransactionReport";

import AddNewFarmFirst from "@/component/Farm/AddNewFarmFirst";
import FirstLoginView from "@/component/Farm/FirstLoginProView";
import FirstTimePackagePlan from "@/component/Farm/FirstTimePackagePlan";
import PaymentGatewayView from "@/component/Farm/PaymentGatewayView";
import { Provider, useSelector } from 'react-redux';
import  store, { RootState } from "@/services/reducxStore";

import AddNewFarmBasicDetails from "@/component/Farm/AddNewFarmBasicDetails";
import AddNewFarmSecondDetails from "@/component/Farm/AddNewFarmSecondDetails";
import Addmemberdetails from "@/component/Farm/Addmemberdetails"
import AddFarmList from "@/component/Farm/AddFarmList"
import UnloackPro from "@/component/Farm/UnlockPro"
import FarmDetailsScreen from "@/component/Farm/FarmDetailsScreen"
import AddNewFarmUnloackPro from "@/component/Farm/AddNewFarmUnloackPro"
import EditManagersScreen from "@/component/Farm/EditManagersScreen"
import AddNewCrop from "@/component/Farm/AddNewCrop"
import FarmCropEnroll from "@/component/Farm/FarmCropEnroll"
import FarmSelectCrop from "@/component/Farm/FarmSelectCrop"
import EditFarm from "@/component/Farm/EditFarm"
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


function MainTabNavigator() {
    const [initialTab, setInitialTab] = useState('Dashboard');
  const user = useSelector((state: RootState) => state.user.userData);

  useEffect(() => {
     if (!user) return;
     console.log(user.role)

    // Set the first tab based on user role
    if (user.role === "Laboror" ) {
      setInitialTab('LabororDashbord'); // Set the first tab for Distribution Manager/Officer
    } else {
      setInitialTab('Dashboard'); // Set the first tab for other roles like Manager
    }
  }, [user]);
  return (
    <Tab.Navigator
     initialRouteName={initialTab}
      screenOptions={({ route }) => ({
        tabBarStyle: { display: 'none' }, 
        headerShown: false,
      })}
      tabBar={(props) => <NavigationBar {...props} />}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
              <Tab.Screen name="LabororDashbord" component={LabororDashbord} />

      <Tab.Screen name="AddFixedAsset" component={AddFixedAsset} />
      <Tab.Screen name="ComplainHistory" component={ComplainHistory} />
      <Tab.Screen name="CropCalander" component={CropCalander as any} />
      <Tab.Screen name="CurrentAssert" component={CurrentAssert} />
      <Tab.Screen name="EngEditProfile" component={EngEditProfile} />
      <Tab.Screen name="FiveDayForecastEng" component={FiveDayForecastEng} />
      <Tab.Screen name="FiveDayForecastSinhala" component={FiveDayForecastSinhala} />
      <Tab.Screen name="FiveDayForecastTamil" component={FiveDayForecastTamil} />
      <Tab.Screen name="fixedDashboard" component={FixedDashboard} />
      {/* <Tab.Screen name="MyCrop" component={MyCrop as any} /> */}
      <Tab.Screen name="NewCrop" component={NewCrop} />
      <Tab.Screen name="News" component={News as any} />
      <Tab.Screen name="RemoveAsset" component={RemoveAsset} />
      <Tab.Screen name="WeatherForecastEng" component={WeatherForecastEng} />
        <Tab.Screen name="WeatherForecastSinhala" component={WeatherForecastSinhala}/>
        <Tab.Screen name="WeatherForecastTamil" component={WeatherForecastTamil}/>
        <Tab.Screen name="TransactionHistory" component={TransactionHistory as any}/>
        
      <Tab.Screen name="AddNewFarmFirst" component={AddNewFarmFirst} />
      <Tab.Screen name="PaymentGatewayView" component={PaymentGatewayView as any} />
       <Tab.Screen name="EngQRcode" component={EngQRcode} />
       <Tab.Screen name="ComplainForm" component={ComplainForm} />
       <Tab.Screen name="AddAsset" component={AddAsset} />
       <Tab.Screen name="FarmAddFixAssert" component={FarmAddFixAssert} />
       <Tab.Screen name="FarmCurrectAssets" component={FarmCurrectAssets} />
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
const Index = () => {

  const navigation = useNavigation();

  useEffect(() => {
    const backAction = () => {
      const currentRouteName = navigation.getState()?.routes?.[navigation.getState()?.index ?? 0]?.name ?? '';

      if (currentRouteName === 'Dashboard') {
        BackHandler.exitApp(); // Exit the app if on Dashboard screen
        return true;
      } else if (navigation.canGoBack()) {
        navigation.goBack(); // Go back if possible
        return true;
      }

      return false; // Allow the default behavior if no custom logic applies
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => {
      backHandler.remove(); // Cleanup when component is unmounted
    };
  }, [navigation]);

  return (
    <Provider store={store}>
    <LanguageProvider>
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
        <Stack.Screen name="EngProfile" component={EngProfile} />
        {/* <Stack.Screen name="EngQRcode" component={EngQRcode} /> */}
        {/* <Stack.Screen name="AddAsset" component={AddAsset} /> */}
        {/* <Stack.Screen
          name="AssertsFixedView"
          component={AssertsFixedView as any}
        /> */}
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
        {/* <Stack.Screen name="ComplainForm" component={ComplainForm} /> */}
        <Stack.Screen name="TransactionReport" component={TransactionReport} />

        <Stack.Screen name='Main' component={MainTabNavigator} options={{ headerShown: false }} />

        <Stack.Screen name="FirstLoginProView" component={FirstLoginView} />
        <Stack.Screen name="FirstTimePackagePlan" component={FirstTimePackagePlan} />        
        {/* <Stack.Screen name="AddNewFarmBasicDetails" component={AddNewFarmBasicDetails} />  */}
        {/* <Stack.Screen name="Addmemberdetails" component={Addmemberdetails} />  */}
        {/* <Stack.Screen name="AddFarmList" component={AddFarmList} />  */}
         <Stack.Screen name="UnloackPro" component={UnloackPro} /> 
         <Stack.Screen name="FarmDetailsScreen" component={FarmDetailsScreen} />     
          <Stack.Screen name="AddNewFarmUnloackPro" component={AddNewFarmUnloackPro} />   
           {/* <Stack.Screen name="AddNewCrop" component={AddNewCrop }/>  */}
             <Stack.Screen name="FarmCropEnroll" component={FarmCropEnroll as any} /> 
             <Stack.Screen name="FarmSelectCrop" component={FarmSelectCrop as any} /> 
              {/* <Stack.Screen name="EditFarm" component={EditFarm as any} />  */}
                {/* <Stack.Screen name="AddnewStaff" component={AddnewStaff as any} /> */}
          
                 {/* <Stack.Screen name="EditStaffMember" component={EditStaffMember as any} /> */}
                  {/* <Stack.Screen name="FarmFixDashBoard" component={FarmFixDashBoard as any} /> */}
                  {/* <Stack.Screen name="FarmAddCurrentAsset" component={FarmAddCurrentAsset as any} /> */}
                   {/* <Stack.Screen name="FarmAssertsFixedView" component={FarmAssertsFixedView as any} /> */}
                    {/* <Stack.Screen name="EditManagersScreen" component={EditManagersScreen} />    */}
        {/* <Stack.Screen name="AddNewFarmSecondDetails" component={AddNewFarmSecondDetails} />     */}
        {/* <Stack.Screen name="LabororDashbord" component={LabororDashbord} /> */}
              <Stack.Screen name="MyCrop" component={MyCrop as any} />
              <Stack.Screen name="LabororEngProfile" component={LabororEngProfile} />
              <Stack.Screen name="OwnerQRcode" component={OwnerQRcode} />
              <Stack.Screen name="FarmCurrectAssetRemove" component={FarmCurrectAssetRemove} />

         
      </Stack.Navigator>
    </LanguageProvider>
    </Provider>
  );
};

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
