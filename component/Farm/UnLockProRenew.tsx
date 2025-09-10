import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { LinearGradient } from "expo-linear-gradient";
import AntDesign from "react-native-vector-icons/AntDesign";
import { setPackageType, setPackagePrice } from "../../store/packageSlice";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

type UnLockProRenewNavigationProp = StackNavigationProp<
  RootStackParamList,
  "UnLockProRenew"
>;

type UnLockProRenewProps = {
  navigation: UnLockProRenewNavigationProp;
};

const UnLockProRenew: React.FC<UnLockProRenewProps> = ({
  navigation,
}) => {
  const [selectedPackage, setSelectedPackage] = useState<string | null>("12months");
  const [packagePrice, setPackagePriceState] = useState<number | null>(8500);
  const [packageType, setPackageTypeState] = useState<string | null>(
    "Get 12 months / Rs. 8,500"
  );
  const { t } = useTranslation();
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("Navigation state:", navigation.getState());
    console.log("Can go back:", navigation.canGoBack());
    
    // Listen to navigation events
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('UnLockProRenew screen focused');
      console.log("Current route:", navigation.getState().routes);
    });

    return unsubscribe;
  }, [navigation]);

  const handlePackageSelect = (pkgType: string, price: number) => {
    setSelectedPackage(pkgType);
    setPackageTypeState(
      `Get ${
        pkgType === "6months"
          ? "6 months / Rs. 4,500"
          : pkgType === "12months"
          ? "12 months / Rs. 8,500"
          : "4 months / Rs. 3,200"
      }`
    );
    setPackagePriceState(price);
  };

  const handleSubmit = () => {
    if (packagePrice !== null) {
      dispatch(setPackagePrice(packagePrice));
    }
    if (selectedPackage) {
      dispatch(setPackageType(selectedPackage));
    }
    navigation.navigate("Main", {
      screen: "PaymentGatewayeRenew", 
    });
  };

  // SOLUTION: Always navigate to AddNewFarmUnloackPro regardless of navigation history
  const handleBackNavigation = () => {
    console.log("Back button pressed - navigating to AddNewFarmUnloackPro");
    
    // Method 1: Reset navigation stack to only have AddNewFarmUnloackPro
    navigation.reset({
      index: 0,
      routes: [{ name: 'AddNewFarmUnloackPro' }],
    });
  };

  // Alternative solution methods (choose one):

  // Method 2: Pop to the first screen, then navigate to AddNewFarmUnloackPro
  const handleBackNavigationAlternative1 = () => {
    // Remove all screens from stack and navigate to AddNewFarmUnloackPro
    navigation.popToTop();
    navigation.navigate('AddNewFarmUnloackPro');
  };

  // Method 3: Find AddNewFarmUnloackPro in the stack and pop to it
  const handleBackNavigationAlternative2 = () => {
    const state = navigation.getState();
    const routes = state.routes;
    
    // Check if AddNewFarmUnloackPro exists in the navigation stack
    const firstLoginIndex = routes.findIndex(route => route.name === 'AddNewFarmUnloackPro');
    
    if (firstLoginIndex !== -1) {
      // AddNewFarmUnloackPro exists in stack, pop to it
      navigation.dispatch({
        type: 'POP_TO_TOP',
      });
      navigation.navigate('AddNewFarmUnloackPro');
    } else {
      // AddNewFarmUnloackPro doesn't exist in stack, reset to it
      navigation.reset({
        index: 0,
        routes: [{ name: 'AddNewFarmUnloackPro' }],
      });
    }
  };

  // Method 4: Using CommonActions (if you prefer)
  const handleBackNavigationAlternative3 = () => {
    const { CommonActions } = require('@react-navigation/native');
    
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'AddNewFarmUnloackPro' }],
      })
    );
  };

  return (
    <SafeAreaView className="f bg-white">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        className="bg-white"
      >
        <View
          className="flex-row items-center justify-between mb-2"
          style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
        >
          {/* Main solution - always go to AddNewFarmUnloackPro */}
          <TouchableOpacity
            onPress={handleBackNavigation}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <AntDesign name="left" size={24} color="#000502" />
          </TouchableOpacity>

        
        </View>
       
        <View className="flex-1 justify-center items-center p-4">
          <Image
            source={require("../../assets/images/Farm/PaymentPlan.png")}
            resizeMode="contain"
            style={{ width: "100%", height: 250 }}
          />

          <View className="text-center justify-center items-center mt-6">
            <View className="flex-row items-center justify-center space-x-2">
              <Text className="text-xl font-bold text-[#E5B323]">
                {t("Farms.UPGRADE TO PRO")}
              </Text>
              <Text>{t("Farms.PRO")}</Text>
            </View>

            <View className="mt-6 items-center">
              <View className="items-center justify-center p-2">
                <View className="flex-row justify-between gap-2 items-center">
            
                  <TouchableOpacity
                    onPress={() => handlePackageSelect("6months", 4500)}
                  >
                    <View
                      className={`flex p-2 rounded-md bg-white relative shadow-sm border-2 py-2 ${
                        selectedPackage === "6months"
                          ? "border-yellow-500"
                          : "border-black"
                      }`}
                    >
                      <View className="absolute top-0 left-0 w-12 h-10 bg-[#E5B323] flex justify-center items-center rounded-tl-sm rounded-br-full">
                        <Text
                          className="text-white text-lg font-semibold mb-3 mr-1"
                          style={{ transform: [{ rotate: "-30deg" }] }}
                        >
                          6%
                        </Text>
                      </View>
                      <View className="flex flex-col items-center mt-4">
                        <Text className="text-2xl text-black font-extrabold">
                          6
                        </Text>
                        <Text className="text-base text-gray-600 mb-1">
                          {t("Farms.months")}
                        </Text>
                        <Text className="text-lg text-black font-extrabold">
                          {t("Farms.Rs")} 4,500
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* 12 Months Card */}
                  <TouchableOpacity
                    onPress={() => handlePackageSelect("12months", 8500)}
                  >
                    <View
                      className={`flex rounded-xl bg-white relative border-2 py-6 ${
                        selectedPackage === "12months"
                          ? "border-[#E5B323]"
                          : "border-black"
                      }`}
                    >
                      <View className="w-full py-2 px-6  bg-[#E5B323] rounded-t-md items-center -mt-6">
                        <Text className="text-white text-md font-semibold">
                          {t("Farms.11%Save")}
                        </Text>
                      </View>
                      <View className="flex flex-col items-center">
                        <Text className="text-2xl text-black font-extrabold">
                          12
                        </Text>
                        <Text className="text-base text-yellow-700 mb-1">
                          {t("Farms.months")}
                        </Text>
                        <Text className="text-lg text-black font-extrabold">
                          {t("Farms.Rs")} 8,500
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handlePackageSelect("4months", 3200)}
                  >
                    <View
                      className={`flex p-2 rounded-md bg-white relative shadow-sm border-2 py-2 items-center justify-center ${
                        selectedPackage === "4months"
                          ? "border-yellow-500"
                          : "border-black"
                      }`}
                    >
                      <View className="flex flex-col items-center mt-4">
                        <Text className="text-2xl text-black font-extrabold">
                          4
                        </Text>
                        <Text className="text-base text-gray-600 mb-1">
                          {t("Farms.months")}
                        </Text>
                        <Text className="text-lg text-black font-extrabold">
                          {t("Farms.Rs")} 3,200
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <LinearGradient
              className="w-64 mt-8 py-3 rounded-full shadow-lg shadow-black mb-4"
              colors={["#FDCF3F", "#FEE969"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <TouchableOpacity
                className="text-center justify-center items-center"
                onPress={handleSubmit}
              >
                <Text className="text-[#7E5E00] text-lg font-semibold">
                  {packageType}
                </Text>
              </TouchableOpacity>
            </LinearGradient>

            <Text className="text-lg font-semibold text-black text-center mt-6">
              {t("Farms.When should I be billed?")}
            </Text>
            <View className="w-[98%] p-2 rounded-lg mt-2 mb-4">
              <Text className="text-sm text-black text-center">
                {t("Farms.Your billing cycle begins on the date you upgrade your plan.")}
              </Text>
              <Text className="text-sm text-black text-center">
                {t("Farms.We'll send you a payment reminder 14 days before your next billing date to ensure you have time to prepare.")}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
  },
});

export default UnLockProRenew;