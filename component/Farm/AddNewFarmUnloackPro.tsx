import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import { LinearGradient } from 'expo-linear-gradient';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from "@/component/types";
import UnloackPro from "./UnlockPro";
const AddNewFarmUnloackPro: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-white justify-center items-center p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="" showsVerticalScrollIndicator={false}>
        {/* Trophy Image Section */}
        <View className="flex-1 justify-center items-center  ">
          <Image
            source={require("../../assets/images/Farm/gradient_trophy.jpg")}
            className="w-64 h-64 object-cover"
          />

          <View className="text-center justify-center items-center  p-2">
            <View className="flex-row items-center justify-center space-x-2">
              <Text className="text-xl font-bold text-black">{t("Farms.UPGRADE")}</Text>
              <Text className="text-base text-[#E2BE00] font-semibold bg-[#FFF5BD] p-1 px-6 rounded-md">
                {t("Farms.PRO")}
              </Text>
            </View>

            <Text className="mt-6 text-lg text-black text-center  ">
              {t("Farms.Please upgrade to PRO membership to access all the features")}
            </Text>

            {/* Features List */}
            <View className="mt-8 justify-center items-center w-[90%]">
              <View className="">
                <Text className="text-base text-black font-bold">
                  • {t("Farms.Create Unlimited Farms")}
                </Text>
                <Text className="text-base text-black mt-1 ml-3">
                  {t("Farms.Manage as many farms as you need.")}
                  <Text >
                    {"\n"}{t("Farms.No limits & No restrictions.")}
                    </Text>

                </Text>

                <Text className="text-base text-black font-bold mt-8">
                  • {t("Farms.Unlimited Crop Calendars")}
                </Text>
                <Text className="text-base text-black mt-1 ml-3">
                  {t("Farms.Plan, track, and optimize all your crop cycles without boundaries.")}
                </Text>
              </View>
  
            </View>

            {/* Unlock PRO Button */}


          </View>
        <LinearGradient
               className="w-[80%] mt-10 py-3 rounded-full shadow-md shadow-black mb-10"
        colors={['#FDCF3F', '#FEE969']}
          start={{ x: 0, y: 0 }}  // Start from left
              end={{ x: 1, y: 0 }} 
       >
          <TouchableOpacity
  className="justify-center items-center py-2"
  onPress={() => navigation.navigate('UnloackPro' as any)} // Fixed navigation syntax
>
  <Text className="text-[#7E5E00] text-lg font-semibold">{t("Farms.Unlock PRO")}</Text>
</TouchableOpacity>
      </LinearGradient>

        <TouchableOpacity className="absolute top-0 right-0 bg-gray-200 px-2  rounded-full shadow-lg" 
        onPress={() => navigation.goBack()}
        >
        <Text className="text-lg  text-white">X</Text>
      </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
  }
});
export default AddNewFarmUnloackPro;
