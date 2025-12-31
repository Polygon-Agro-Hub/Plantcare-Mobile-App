import React, { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Image,
  BackHandler
} from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { StackNavigationProp } from "@react-navigation/stack";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { RootStackParamList } from "../types";
import Svg, { Ellipse, Defs, LinearGradient, Stop } from "react-native-svg";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";


interface InvestmentAndLoanProps {
  navigation: any;
}

const InvestmentAndLoan: React.FC<InvestmentAndLoanProps> = ({ navigation }) => {
  const { t, i18n } = useTranslation();

    useFocusEffect(
      useCallback(() => {
        const handleBackPress = () => {
          navigation.navigate("Main", {screen: "GoViCapitalRequests"});
          return true;
        };
    
       
                const subscription = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
           
                 return () => subscription.remove();
      }, [navigation])
    );

  return (
    <View className="flex-1 bg-white">
      <StatusBar />
      
      {/* Curved Background */}
      <View className="relative" style={{ height: hp(35) }}>
        {/* SVG Background - with pointerEvents="none" to not block touches */}
        <View style={{ position: 'absolute' }} pointerEvents="none">
          <Svg height={hp(50)} width={wp(100)}>
            <Defs>
              <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
                <Stop offset="1" stopColor="#72FFF5" stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Ellipse
              cx={wp(50)}
              cy={hp(14)}
              rx={wp(80)}
              ry={hp(30)}
              fill="url(#grad)"
            />
          </Svg>
        </View>
        
        {/* Image - with pointerEvents="none" to not block touches */}
        <View 
          className="absolute items-center justify-center" 
          style={{ 
            width: wp(100), 
            bottom: hp(-9),
          }}
          pointerEvents="none"
        >
          <Image
            source={require("../../assets/images/investmentuser.webp")}
            style={{
              width: wp(100),
              height: hp(45),
            }}
            resizeMode="contain"
          />
        </View>

        {/* Back Button - rendered last with higher zIndex */}
        <TouchableOpacity 
          onPress={() => 
           // navigation.navigate("GoViCapitalRequests")}
           navigation.navigate("Main", { screen: "GoViCapitalRequests" })}
          className="absolute top-3 left-4 w-10 h-10 items-center justify-center"
          style={{ zIndex: 10 }}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons name="chevron-left" size={28} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Content Section */}
      <View className="px-6" style={{ marginTop: 70 }}>
        {/* Header Text */}
        <View className="items-center mb-8">
          <Text className="text-2xl font-semibold text-gray-800 mb-3">
            {t("Govicapital.How can we help you?")}
          </Text>
          <Text className="text-sm text-gray-500 text-center leading-5">
            {t("Govicapital.description")}
          </Text>
        </View>

        {/* Cards Container */}
        <View className="flex-row gap-4">
          {/* Investment Card */}
          <TouchableOpacity 
            onPress={() => {
              // Navigate to investment screen
              navigation.navigate("InvestmentRequestForm");
            }}
            className="flex-1 bg-white rounded-2xl p-6 items-center justify-between"
            style={{ 
              minHeight: hp(18),
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 5
            }}
            activeOpacity={0.7}
          >
            <Text className="text-center text-gray-800 font-medium text-base leading-6 mb-4">
              {t("Govicapital.investmentCard")}   
            </Text>
            <View 
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{ backgroundColor: '#0FC7B2' }}
            >
              <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          {/* Loan Card */}
          <TouchableOpacity 
            onPress={() => {
              // Navigate to loan screen
              // navigation.navigate("LoanScreen");
            }}
            className="flex-1 bg-white rounded-2xl p-6 items-center justify-between"
            style={{ 
              minHeight: hp(18),
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 5
            }}
            activeOpacity={0.7}
          >
            <Text className="text-center text-gray-800 font-medium text-base leading-6 mb-4">
              {t("Govicapital.loanCard")}
            </Text>
            <View 
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{ backgroundColor: '#0FC7B2' }}
            >
              <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default InvestmentAndLoan;