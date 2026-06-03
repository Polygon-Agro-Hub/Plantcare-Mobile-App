import { useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  StatusBar,
  Text,
  TextInput,
  Platform,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import NavigationBar from "@/Items/NavigationBar";
import * as ExpoNavigationBar from "expo-navigation-bar";
import { LanguageProvider } from "@/context/LanguageContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider, useSelector } from "react-redux";
import store, { RootState } from "@/services/reducxStore";
import NetInfo from "@react-native-community/netinfo";
import { useTranslation } from "react-i18next";
import { navigationRef } from "../navigationRef";
import * as SplashScreen from "expo-splash-screen";
import Splash from "../component/auth/Splash";
import Lanuage from "../component/common/Lanuage";
import Signin from "@/component/auth/Signin";
import News from "../component/news/News";
import Signup from "@/component/auth/Signup";
import Verify from "@/component/otp-screens/Verify";
import Otpverification from "@/component/otp-screens/Otpverification";
import Dashboard from "@/component/dashboard/Dashbord";
import NewCrop from "@/component/crop-cultivation/NewCrop";
import SelectCrop from "@/component/crop-cultivation/SelectCrop";
import UserProfile from "@/component/auth/UserProfile";
import QRcode from "@/component/qr-code/QRcode";
import EditProfile from "@/component/auth/EditProfile";
import WeatherForecast from "@/component/weather-screens/WeatherForecast";
import FiveDayForecast from "@/component/weather-screens/FiveDayForecast";
import CurrentAssert from "@/component/currect-assets/CurrentAssert";
import AddAsset from "@/component/currect-assets/AddAsset";
import RemoveAsset from "@/component/currect-assets/RemoveAsset";
import AssertsFixedView from "@/component/fixed-assets/AssertsFixedView";
import AddFixedAsset from "@/component/fixed-assets/AddFixedAsset";
import FixedDashboard from "@/component/fixed-assets/fixedDashboard";
import CropCalander from "@/component/crop-cultivation/CropCalander";
import MyCrop from "@/component/crop-cultivation/MyCrop";
import PublicForum from "@/component/public-forum/PublicForum";
import PublicForumReplies from "@/component/public-forum/PublicForumReplies";
import PublicForumPost from "@/component/public-forum/PublicForumPost";
import UpdateAsset from "@/component/fixed-assets/UpdateAsset";
import CropEnrol from "@/component/crop-cultivation/CropEnrol";
import { LogBox } from "react-native";
import MembershipScreen from "@/component/membership-screens/MembershipScreen";
import BankDetailsScreen from "@/component/bank-details/Bankdetails";
import PrivacyPolicy from "@/component/policies/PrivacyPolicy";
import TermsConditions from "@/component/policies/TermsConditions";
import ComplainForm from "@/component/complains/ComplainForm";
import ComplainHistory from "@/component/complains/ComplainHistory";
import DeleteFarmer from "@/component/auth/DeleteFarmer";
import UserFeedback from "@/component/auth/UserFeedback";
import TransactionHistory from "@/component/transaction/TransactionList";
import TransactionReport from "@/component/transaction/TransactionReport";
import AddNewFarmFirst from "@/component/farms/first-time-visible/AddNewFarmFirst";
import FirstLoginView from "@/component/farms/first-time-visible/FirstLoginProView";
import FirstTimePackagePlan from "@/component/farms/first-time-visible/FirstTimePackagePlan";
import PaymentGatewayView from "@/component/farms/payment-gatewaye/PaymentGatewayView";
import PaymentGatewayeRenew from "@/component/farms/payment-gatewaye/PaymentGatewayeRenew";
import AddNewFarmBasicDetails from "@/component/farms/add-farm/AddNewFarmBasicDetails";
import AddNewFarmSecondDetails from "@/component/farms/add-farm/AddNewFarmSecondDetails";
import Addmemberdetails from "@/component/farms/add-farm/Addmemberdetails";
import AddFarmList from "@/component/farms/add-farm/AddFarmList";
import UnloackPro from "@/component/farms/unlock-pro/UnlockPro";
import UnLockProRenew from "@/component/farms/unlock-pro/UnLockProRenew";
import FarmDetailsScreen from "@/component/farms/crop-cultivation/FarmDetailsScreen";
import AddNewFarmUnloackPro from "@/component/farms/unlock-pro/AddNewFarmUnloackPro";
import EditManagersScreen from "@/component/farms/members-screen/EditManagersScreen";
import AddNewCrop from "@/component/farms/crop-cultivation/AddNewCrop";
import FarmCropEnroll from "@/component/farms/crop-cultivation/FarmCropEnroll";
import FarmSelectCrop from "@/component/farms/crop-cultivation/FarmSelectCrop";
import EditFarm from "@/component/farms/edit-farm/EditFarm";
import AddnewStaff from "@/component/farms/members-screen/AddnewStaff";
import EditStaffMember from "@/component/farms/members-screen/EditStaffMember";
import PublicForumPostEdit from "@/component/public-forum/PublicForumPostEdit";
import MyCultivation from "@/component/farms/crop-cultivation/MyCultivation";
import LabororDashbord from "@/component/laboror-screens/LabororDashbord";
import OwnerQRcode from "@/component/laboror-screens/OwnerQRcode";

import FarmCurrectAssetRemove from "@/component/farms/current-asset/FarmCurrectAssetRemove";
import FarmCropCalander from "@/component/farms/crop-cultivation/FarmCropCalander";
import ManagerDashbord from "@/component/manager-screens/ManagerDashbord";
import SupervisorDashboard from "@/component/supervisor-screens/SupervisorDashboard";
import EarnCertificate from "@/component/certificates/farm-certificate/EarnCertificate";
import PaymentScreen from "@/component/certificates/farm-certificate/PaymentScreen";
import CropEarnCertificate from "@/component/certificates/crop-certificate/CropEarnCertificate";
import CropPaymentScreen from "@/component/certificates/crop-certificate/CropPaymentScreen";
import CultivationEarnCertificate from "@/component/certificates/farm-certificate/CultivationEarnCertificate";
import CultivationPaymentScreen from "@/component/certificates/farm-certificate/CultivationPaymentScreen";
import RequestInspectionForm from "@/component/request-inspection/RequestInspectionForm";
import RequestInspectionPayment from "@/component/request-inspection/RequestInspectionPayment";
import RequestHistory from "@/component/request-inspection/RequestHistory";
import RequestSummery from "@/component/request-inspection/RequestSummery";
import FramcropCalenderwithcertificate from "@/component/farms/crop-cultivation/FramcropCalenderwithcertificate";
import CropEarnCertificateAfterEnroll from "@/component/certificates/crop-certificate/CropEarnCertificateAfterEnroll";
import CropPaymentScreenAfterEnroll from "@/component/certificates/crop-certificate/CropPaymentScreenAfterEnroll";
import FarmCertificateTask from "@/component/farms/crop-cultivation/FarmCertificateTask";
import ManagerFarmDetails from "@/component/manager-screens/ManagerFarmDetails";
import ManageMembersManager from "@/component/manager-screens/ManageMembersManager";
import ManagerAddStaff from "@/component/manager-screens/ManagerAddStaff";
import ManageMembersSupervisor from "@/component/manager-screens/ManageMembersSupervisor";
import SupervisorAddStaff from "@/component/supervisor-screens/SupervisorAddStaff";
import ManageEditscreen from "@/component/manager-screens/ManageEditscreen";
import SupervisorEditScreen from "@/component/supervisor-screens/SupervisorEditScreen";
import InvestmentAndLoan from "@/component/govi-capital/InvestmentAndLoan";
import InvestmentRequestForm from "@/component/govi-capital/InvestmentRequestForm";
import RequestLetter from "@/component/govi-capital/RequestLetter";
import GoViCapitalRequests from "@/component/govi-capital/GoViCapitalRequests";
import RequestReview from "@/component/govi-capital/RequestReview";
import ViewInvestmentRequestLetter from "@/component/govi-capital/ViewInvestmentRequestLetter";
import CropVarietySelectCard from "@/Items/FarmCropVarietySelectCard";
import GoviPensionInformation from "@/component/govi-pensions/GoviPensionInformation";
import GoviPensionForm from "@/component/govi-pensions/GoviPensionForm";
import GoviPensionStatus from "@/component/govi-pensions/GoviPensionStatus";
import MyPensionAccount from "@/component/govi-pensions/MyPensionAccount";
import ProjectStatus from "@/component/govi-capital/ProjectStatus";
import FarmCalMenu from "@/component/farm-cal/common/FarmCalMenu";
import CropPlanningCalculatorsMenu from "@/component/farm-cal/crop-planning-calculators/CropPlanningCalculatorsMenu";
import SeedRateCalculatorScreen from "@/component/farm-cal/crop-planning-calculators/SeedRateCalculatorScreen";
import IrrigationWaterCalculatorsMenuScreen from "@/component/farm-cal/irrigation-water-calculators/IrrigationWaterCalculatorsMenu";
import SoilFertilizerCalculatorsMenuScreen from "@/component/farm-cal/soil-fertilizer-calculators/SoilFertilizerCalculatorsMenuScreen";
import PesticidePestCalculatorsMenuScreen from "@/component/farm-cal/pesticide-pest-calculators/PesticidePestCalculatorsMenuScreen";
import EconomicCostCalendarsMenuScreen from "@/component/farm-cal/economic-cost-calendars/EconomicCostCalendarsMenuScreen";
import WeatherClimateCalculatorsMenuScreen from "@/component/farm-cal/weather-climate-calculators/WeatherClimateCalculatorsMenuScreen";
import PostHarvestStorageCalculatorsMenuScreen from "@/component/farm-cal/post-harvest-storage-calculators/PostHarvestStorageCalculatorsMenuScreen";
import ShelfLifeCalculatorScreen from "@/component/farm-cal/post-harvest-storage-calculators/ShelfLifeCalculatorScreen";
import ColdStorageCalculatorScreen from "@/component/farm-cal/post-harvest-storage-calculators/ColdStorageCalculatorScreen";
import GrainDryingCalculatorScreen from "@/component/farm-cal/post-harvest-storage-calculators/GrainDryingCalculatorScreen";
import YieldEstimationCalculatorScreen from "@/component/farm-cal/crop-planning-calculators/YieldEstimationCalculatorScreen";
import GerminationRateCalculatorScreen from "@/component/farm-cal/crop-planning-calculators/GerminationRateCalculatorScreen";
import PlantPopulationCalculatorScreen from "@/component/farm-cal/crop-planning-calculators/PlantPopulationCalculatorScreen";
import FertilizerRequirementCalculatorScreen from "@/component/farm-cal/soil-fertilizer-calculators/FertilizerRequirementCalculatorScreen";
import CompostMixingCalculatorScreen from "@/component/farm-cal/soil-fertilizer-calculators/CompostMixingCalculatorScreen";
import SprinklerSystemCalculatorScreen from "@/component/farm-cal/irrigation-water-calculators/SprinklerSystemCalculatorScreen";
import LaborCostCalculatorScreen from "@/component/farm-cal/economic-cost-calendars/LaborCostCalculatorScreen";
import LoanRepaymentCalculatorScreen from "@/component/farm-cal/economic-cost-calendars/LoanRepaymentCalculatorScreen";
import BreakEvenPriceCalculatorScreen from "@/component/farm-cal/economic-cost-calendars/BreakEvenPriceCalculatorScreen";
import FarmBudgetProfitCalculatorScreen from "@/component/farm-cal/economic-cost-calendars/FarmBudgetProfitCalculatorScreen";
import DripIrrigationCalculatorScreen from "@/component/farm-cal/irrigation-water-calculators/DripIrrigationCalculatorScreen";
import GoviShopLoadingScreen from "@/component/govi-shop/GoviShopLoading";
import ExploreShopsScreen from "@/component/govi-shop/ExploreShops";
import GoviShopCartScreen from "@/component/govi-shop/GoviShopCartScreen";
import GoviShopProfileScreen from "@/component/govi-shop/GoviShopProfileScreen";
import LocationAccess from "@/component/permission/LocationAccess";
import ViewProduct from "@/component/govi-shop/ViewProduct";
import SoilGridsScreen from "@/component/soil-grids/SoilGridsScreen";
import CartScreen from "@/component/govi-shop/CartScreen";

LogBox.ignoreAllLogs(true);

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

function MainTabNavigator() {
  const [initialTab, setInitialTab] = useState("Dashboard");
  const user = useSelector((state: RootState) => state.user.userData);

  useEffect(() => {
    if (!user) return;

    if (user.role === "Laborer") {
      setInitialTab("LabororDashbord");
    } else if (user.role === "Manager") {
      setInitialTab("ManagerDashbord");
    } else if (user.role === "Supervisor") {
      setInitialTab("SupervisorDashbord");
    } else {
      setInitialTab("Dashboard");
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
      <Tab.Screen name="EditProfile" component={EditProfile} />
      <Tab.Screen name="FiveDayForecast" component={FiveDayForecast as any} />
      <Tab.Screen name="fixedDashboard" component={FixedDashboard} />
      <Tab.Screen name="NewCrop" component={NewCrop} />
      <Tab.Screen name="News" component={News as any} />
      <Tab.Screen name="RemoveAsset" component={RemoveAsset} />
      <Tab.Screen name="WeatherForecast" component={WeatherForecast as any} />
      <Tab.Screen
        name="TransactionHistory"
        component={TransactionHistory as any}
      />

      <Tab.Screen name="AddNewFarmFirst" component={AddNewFarmFirst} />
      <Tab.Screen
        name="PaymentGatewayView"
        component={PaymentGatewayView as any}
      />
      <Tab.Screen
        name="PaymentGatewayeRenew"
        component={PaymentGatewayeRenew as any}
      />
      <Tab.Screen name="QRcode" component={QRcode} />
      <Tab.Screen name="ComplainForm" component={ComplainForm} />
      <Tab.Screen name="AddAsset" component={AddAsset} />
      <Tab.Screen name="MyCultivation" component={MyCultivation} />
      <Tab.Screen name="FarmDetailsScreen" component={FarmDetailsScreen} />
      <Tab.Screen name="AddFarmList" component={AddFarmList} />
      <Tab.Screen
        name="AddNewFarmBasicDetails"
        component={AddNewFarmBasicDetails}
      />
      <Tab.Screen
        name="AddNewFarmSecondDetails"
        component={AddNewFarmSecondDetails}
      />
      <Tab.Screen name="Addmemberdetails" component={Addmemberdetails} />
      <Tab.Screen name="EditFarm" component={EditFarm as any} />
      <Tab.Screen name="EditManagersScreen" component={EditManagersScreen} />
      <Tab.Screen name="AddnewStaff" component={AddnewStaff as any} />
      <Tab.Screen name="EditStaffMember" component={EditStaffMember as any} />
      <Tab.Screen name="FromFramEditFarm" component={EditFarm as any} />
      <Tab.Screen name="AddNewCrop" component={AddNewCrop} />
      <Tab.Screen name="AssertsFixedView" component={AssertsFixedView as any} />

      <Tab.Screen
        name="GoViCapitalRequests"
        component={GoViCapitalRequests as any}
      />
      <Tab.Screen
        name="RequestInspectionPayment"
        component={RequestInspectionPayment as any}
      />
      <Tab.Screen
        name="RequestHistory"
        component={RequestHistory as any}
      />
      <Tab.Screen
        name="RequestSummery"
        component={RequestSummery as any}
      />
      <Tab.Screen
        name="RequestInspectionForm"
        component={RequestInspectionForm as any}
      />
    </Tab.Navigator>
  );
}

function AppContent() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [isOfflineAlertShown, setIsOfflineAlertShown] = useState(false);

  useEffect(() => {
    // Hide splash screen when app is ready
    SplashScreen.hideAsync().catch((err) => {
      console.warn("Failed to hide splash screen:", err);
    });
  }, []);

  useEffect(() => {
    async function setupNavBar() {
      if (Platform.OS === "android") {
        await ExpoNavigationBar.setStyle("light");
      }
    }

    setupNavBar();
  }, []);

  useEffect(() => {
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      if (!state.isConnected && !isOfflineAlertShown) {
        setIsOfflineAlertShown(true);
        Alert.alert(
          t("Main.NoInternetConnection"),
          t("Main.PleaseTurnOnMobileDataOrWiFiToContinue"),
          [
            {
              text: "OK",
              onPress: () => {
                setIsOfflineAlertShown(false);
              },
            },
          ],
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
        return false;
      }

      const currentRouteName =
        (navigationRef.getCurrentRoute() as any)?.name ?? "";

      if (currentRouteName === "Dashboard") {
        BackHandler.exitApp();
        return true;
      } else if (navigationRef.canGoBack()) {
        navigationRef.goBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );
    return () => backHandler.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <SafeAreaView
        style={{
          flex: 1,
          paddingBottom: insets.bottom,
          backgroundColor: "#fff",
        }}
        edges={["top", "right", "left"]}
      >
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={Splash} />
            <Stack.Screen name="Lanuage" component={Lanuage} />
            <Stack.Screen name="Signin" component={Signin} />
            <Stack.Screen name="Signup" component={Signup} />
            <Stack.Screen name="Verify" component={Verify} />
            <Stack.Screen name="OTPE" component={Otpverification} />
            <Stack.Screen name="OTPEOLDUSER" component={Otpverification} />
            <Stack.Screen name="SelectCrop" component={SelectCrop as any} />
            <Stack.Screen name="EngProfile" component={UserProfile as any} />
            <Stack.Screen name="UpdateAsset" component={UpdateAsset as any} />
            <Stack.Screen name="PublicForum" component={PublicForum as any} />
            <Stack.Screen
              name="PublicForumReplies"
              component={PublicForumReplies}
            />
            <Stack.Screen name="PublicForumPost" component={PublicForumPost} />
            <Stack.Screen
              name="PublicForumPostEdit"
              component={PublicForumPostEdit as any}
            />

            <Stack.Screen
              name="MembershipScreen"
              component={MembershipScreen}
            />
            <Stack.Screen
              name="MembershipScreenSignUp"
              component={MembershipScreen}
            />

            <Stack.Screen
              name="BankDetailsScreen"
              component={BankDetailsScreen}
            />
            <Stack.Screen
              name="BankDetailsSignUp"
              component={BankDetailsScreen}
            />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
            <Stack.Screen name="TermsConditions" component={TermsConditions} />
            <Stack.Screen name="CropEnrol" component={CropEnrol as any} />
            <Stack.Screen name="DeleteFarmer" component={DeleteFarmer as any} />
            <Stack.Screen name="UserFeedback" component={UserFeedback as any} />
            <Stack.Screen
              name="TransactionReport"
              component={TransactionReport}
            />

            <Stack.Screen
              name="Main"
              component={MainTabNavigator}
              options={{ headerShown: false }}
            />

            <Stack.Screen name="FirstLoginProView" component={FirstLoginView} />
            <Stack.Screen
              name="FirstTimePackagePlan"
              component={FirstTimePackagePlan}
            />
            <Stack.Screen name="UnloackPro" component={UnloackPro} />
            <Stack.Screen name="UnLockProRenew" component={UnLockProRenew} />
            <Stack.Screen
              name="FarmDetailsScreen"
              component={FarmDetailsScreen}
            />
            <Stack.Screen
              name="AddNewFarmUnloackPro"
              component={AddNewFarmUnloackPro}
            />
            <Stack.Screen
              name="FarmCropEnroll"
              component={FarmCropEnroll as any}
            />
            <Stack.Screen
              name="FarmSelectCrop"
              component={FarmSelectCrop as any}
            />
            <Stack.Screen
              name="InvestmentAndLoan"
              component={InvestmentAndLoan as any}
            />
            <Stack.Screen
              name="InvestmentRequestForm"
              component={InvestmentRequestForm as any}
            />
            <Stack.Screen name="MyCrop" component={MyCrop as any} />
            <Stack.Screen
              name="FarmCropCalander"
              component={FarmCropCalander as any}
            />
            <Stack.Screen
              name="LabororEngProfile"
              component={UserProfile as any}
            />
            <Stack.Screen name="OwnerQRcode" component={OwnerQRcode} />
            <Stack.Screen
              name="FarmCurrectAssetRemove"
              component={FarmCurrectAssetRemove}
            />
            <Stack.Screen
              name="EarnCertificate"
              component={EarnCertificate as any}
            />
            <Stack.Screen
              name="PaymentScreen"
              component={PaymentScreen as any}
            />
            <Stack.Screen
              name="CropEarnCertificate"
              component={CropEarnCertificate as any}
            />
            <Stack.Screen
              name="CultivationEarnCertificate"
              component={CultivationEarnCertificate as any}
            />
            <Stack.Screen
              name="CropPaymentScreen"
              component={CropPaymentScreen as any}
            />
            <Stack.Screen
              name="CultivationPaymentScreen"
              component={CultivationPaymentScreen as any}
            />

            <Stack.Screen
              name="ManagerFarmDetails"
              component={ManagerFarmDetails as any}
            />
            <Stack.Screen
              name="ManagerAddStaff"
              component={ManagerAddStaff as any}
            />
            <Stack.Screen
              name="SupervisorAddStaff"
              component={SupervisorAddStaff as any}
            />
            <Stack.Screen
              name="ManageEditscreen"
              component={ManageEditscreen as any}
            />
            <Stack.Screen
              name="SupervisorEditScreen"
              component={SupervisorEditScreen as any}
            />
            <Stack.Screen
              name="ManageMembersSupervisor"
              component={ManageMembersSupervisor as any}
            />
            <Stack.Screen
              name="ManageMembersManager"
              component={ManageMembersManager as any}
            />
            <Stack.Screen
              name="FarmCertificateTask"
              component={FarmCertificateTask as any}
            />
            <Stack.Screen
              name="CropEarnCertificateAfterEnroll"
              component={CropEarnCertificateAfterEnroll as any}
            />
            <Stack.Screen
              name="FramcropCalenderwithcertificate"
              component={FramcropCalenderwithcertificate as any}
            />

            <Stack.Screen
              name="CropPaymentScreenAfterEnroll"
              component={CropPaymentScreenAfterEnroll as any}
            />
            <Stack.Screen
              name="ProjectStatus"
              component={ProjectStatus as any}
            />
            <Stack.Screen
              name="RequestLetter"
              component={RequestLetter as any}
            />
            <Stack.Screen
              name="RequestReview"
              component={RequestReview as any}
            />
            <Stack.Screen
              name="CropVarietySelectCard"
              component={CropVarietySelectCard as any}
            />
            <Stack.Screen
              name="ViewInvestmentRequestLetter"
              component={ViewInvestmentRequestLetter as any}
            />

            <Stack.Screen
              name="GoviPensionInformation"
              component={GoviPensionInformation as any}
            />
            <Stack.Screen
              name="GoviPensionForm"
              component={GoviPensionForm as any}
            />
            <Stack.Screen
              name="GoviPensionStatus"
              component={GoviPensionStatus as any}
            />
            <Stack.Screen
              name="MyPensionAccount"
              component={MyPensionAccount as any}
            />
            <Stack.Screen name="FarmCalMenu" component={FarmCalMenu as any} />
            <Stack.Screen
              name="CropPlanningCalculatorsMenu"
              component={CropPlanningCalculatorsMenu as any}
            />
            <Stack.Screen
              name="IrrigationWaterCalculatorsMenu"
              component={IrrigationWaterCalculatorsMenuScreen as any}
            />
            <Stack.Screen
              name="SoilFertilizerCalculatorsMenu"
              component={SoilFertilizerCalculatorsMenuScreen as any}
            />
            <Stack.Screen
              name="PesticidePestCalculatorsMenu"
              component={PesticidePestCalculatorsMenuScreen as any}
            />
            <Stack.Screen
              name="EconomicCostCalendarsMenu"
              component={EconomicCostCalendarsMenuScreen as any}
            />
            <Stack.Screen
              name="WeatherClimateCalculatorsMenu"
              component={WeatherClimateCalculatorsMenuScreen as any}
            />
            <Stack.Screen
              name="PostHarvestStorageCalculatorsMenu"
              component={PostHarvestStorageCalculatorsMenuScreen as any}
            />
            <Stack.Screen
              name="ShelfLifeCalculator"
              component={ShelfLifeCalculatorScreen as any}
            />
            <Stack.Screen
              name="ColdStorageCalculator"
              component={ColdStorageCalculatorScreen as any}
            />
            <Stack.Screen
              name="GrainDryingCalculator"
              component={GrainDryingCalculatorScreen as any}
            />
            <Stack.Screen
              name="SeedRateCalculatorScreen"
              component={SeedRateCalculatorScreen as any}
            />
            <Stack.Screen
              name="YieldEstimationCalculatorScreen"
              component={YieldEstimationCalculatorScreen as any}
            />
            <Stack.Screen
              name="GerminationRateCalculatorScreen"
              component={GerminationRateCalculatorScreen as any}
            />
            <Stack.Screen
              name="PlantPopulationCalculatorScreen"
              component={PlantPopulationCalculatorScreen as any}
            />
            <Stack.Screen
              name="FertilizerRequirementCalculatorScreen"
              component={FertilizerRequirementCalculatorScreen as any}
            />
            <Stack.Screen
              name="CompostMixingCalculatorScreen"
              component={CompostMixingCalculatorScreen as any}
            />
            <Stack.Screen
              name="SprinklerSystemCalculatorScreen"
              component={SprinklerSystemCalculatorScreen as any}
            />
            <Stack.Screen
              name="DripIrrigationCalculatorScreen"
              component={DripIrrigationCalculatorScreen as any}
            />
            <Stack.Screen
              name="LaborCostCalculatorScreen"
              component={LaborCostCalculatorScreen as any}
            />
            <Stack.Screen
              name="LoanRepaymentCalculatorScreen"
              component={LoanRepaymentCalculatorScreen as any}
            />
            <Stack.Screen
              name="BreakEvenPriceCalculatorScreen"
              component={BreakEvenPriceCalculatorScreen as any}
            />
            <Stack.Screen
              name="FarmBudgetProfitCalculatorScreen"
              component={FarmBudgetProfitCalculatorScreen as any}
            />
            <Stack.Screen
              name="GoviShopLoadingScreen"
              component={GoviShopLoadingScreen as any}
            />
            <Stack.Screen
              name="ExploreShopsScreen"
              component={ExploreShopsScreen}
            />
            <Stack.Screen
              name="GoviShopCartScreen"
              component={GoviShopCartScreen as any}
            />
            <Stack.Screen name="CartScreen" component={CartScreen as any} />
            <Stack.Screen
              name="GoviShopProfileScreen"
              component={GoviShopProfileScreen as any}
            />

            <Stack.Screen
              name="LocationAccess"
              component={LocationAccess as any}
            />
            <Stack.Screen name="ViewProduct" component={ViewProduct as any} />
            <Stack.Screen name="SoilGridsScreen" component={SoilGridsScreen} />
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
