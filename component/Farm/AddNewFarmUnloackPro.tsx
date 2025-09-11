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
import i18n from "@/i18n/i18n";
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
            className="w-60 h-60 object-cover"
          />

          <View className="text-center justify-center items-center  p-2">
            <View className="flex-row items-center justify-center space-x-2">
              <Text className="text-xl font-bold text-black"
                              style={[
  i18n.language === "si"
    ? { fontSize: 17}
    : i18n.language === "ta"
    ? { fontSize: 15 }
    : { fontSize: 22 }
]}
              >{t("Farms.UPGRADE")}</Text>
              <Text className="text-base text-[#E2BE00] font-semibold bg-[#FFF5BD] p-1 px-6 rounded-md"
                style={[
  i18n.language === "si"
    ? { fontSize: 13}
    : i18n.language === "ta"
    ? { fontSize: 13 }
    : { fontSize: 14 }
]}
              >
                {t("Farms.PRO")}
              </Text>
            </View>

            <Text className="mt-6 text-lg text-black text-center  "
                           style={[
  i18n.language === "si"
    ? { fontSize: 14}
    : i18n.language === "ta"
    ? { fontSize: 13 }
    : { fontSize: 16 }
]}
            >
              {t("Farms.Please upgrade to PRO membership to access all the features")}
            </Text>

            {/* Features List */}
            <View className="mt-8 justify-center items-center w-[90%]">
              <View className="">
                <Text className="text-base text-black font-bold"
                  style={[
  i18n.language === "si"
    ? { fontSize: 14}
    : i18n.language === "ta"
    ? { fontSize: 13 }
    : { fontSize: 16 }
]}
                >
                  • {t("Farms.Create Unlimited Farms")}
                </Text>
                <Text className="text-base text-black mt-1 ml-3"
                  style={[
  i18n.language === "si"
    ? { fontSize: 14}
    : i18n.language === "ta"
    ? { fontSize: 13 }
    : { fontSize: 16 }
]}
                >
                  {t("Farms.Manage as many farms as you need.")}
                  <Text 
                    style={[
  i18n.language === "si"
    ? { fontSize: 14}
    : i18n.language === "ta"
    ? { fontSize: 13 }
    : { fontSize: 16}
]}
                  >
                    {"\n"}{t("Farms.No limits & No restrictions.")}
                    </Text>

                </Text>

                <Text className="text-base text-black font-bold mt-8"
                  style={[
  i18n.language === "si"
    ? { fontSize: 14}
    : i18n.language === "ta"
    ? { fontSize: 13 }
    : { fontSize: 16 }
]}
                >
                  • {t("Farms.Unlimited Crop Calendars")}
                </Text>
                <Text className="text-base text-black mt-1 ml-3"
                  style={[
  i18n.language === "si"
    ? { fontSize: 14}
    : i18n.language === "ta"
    ? { fontSize: 13 }
    : { fontSize: 16 }
]}
                >
                  {t("Farms.Plan, track, and optimize all your crop cycles without boundaries.")}
                </Text>
              </View>
  
            </View>

          </View>
        <LinearGradient
               className="w-[80%] mt-10 py-3 rounded-full shadow-md shadow-black mb-10"
        colors={['#FDCF3F', '#FEE969']}
          start={{ x: 0, y: 0 }}  
              end={{ x: 1, y: 0 }} 
       >
          <TouchableOpacity
  className="justify-center items-center py-2"
  onPress={() => navigation.navigate('UnLockProRenew' as any)} // Fixed navigation syntax
>
  <Text className="text-[#7E5E00] text-lg font-semibold"
    style={[
  i18n.language === "si"
    ? { fontSize: 16}
    : i18n.language === "ta"
    ? { fontSize: 13 }
    : { fontSize: 17 }
]}
  >{t("Farms.Unlock PRO")}</Text>
</TouchableOpacity>
      </LinearGradient>

        <TouchableOpacity className="absolute top-0 right-0 bg-gray-200 px-2  rounded-full shadow-lg" 
      //  onPress={() => navigation.navigate("AddFarmList")}
        onPress={() => navigation.navigate("Main", { 
            screen: "AddFarmList",
         
          })} 
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
