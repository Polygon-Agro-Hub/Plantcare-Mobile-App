import React from "react";
import { View, Text, TouchableOpacity, Image, SafeAreaView, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from "react-i18next";

type RootStackParamList = {
  FirstLoginProView: undefined;
  
};

const AddNewFarmFirst: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {t, i18n} = useTranslation();
  return (
    <SafeAreaView className="bg-[#093832] flex-1">
      <View></View>
      <View className="w-full h-[40%] bg-[#093832] overflow-hidden top-0 left-0 right-0">
        <Image
          source={require('../../assets/images/Farm/Welcome.png')}
          className="w-full h-full object-cover absolute"
          style={{ borderBottomLeftRadius: 90, borderBottomRightRadius: 90 }} // Adjust the radius as per your design
        />
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 60 }} className="bg-[#093832]" showsHorizontalScrollIndicator={false}>
     
        <View className="text-center justify-center items-center p-8 mt-2">
          <Text className="text-xl w-[80%] text-center text-white font-semibold">
            {t("Farms.Create Your First Farm For Free!")}
          </Text>
          <View className="w-[80%]">
            <Text className="text-sm text-center text-white mt-2">
              {t("Farms.Simplify farm management like never before.")}
            </Text>
            <Text className="text-sm text-center text-white mt-2">
              {t("Farms.Add new farms, assign managers, and oversee operations from a single powerful platform.")}
            </Text>
            <Text className="text-sm text-center text-white mt-2">
             {t("Farms.Designed for farm owners who want efficiency, transparency, and growth all in one place.")}
            </Text>
          </View>

          {/* <TouchableOpacity
            className="bg-white/25 py-3 px-[30%] mt-4 rounded-full items-center shadow-md shadow-black"
            onPress={() => navigation.navigate("FirstLoginProView")}
          > */}
           <TouchableOpacity
            className="bg-white/25 py-3 px-[30%] mt-4 rounded-full items-center shadow-md shadow-black"
            onPress={() => navigation.navigate("AddNewFarmBasicDetails" as any)}
          >
            <Text className="text-white text-lg font-bold"   
            style={{ fontSize:i18n.language === "en" ? 18 : i18n.language === "si" ? 16 : 16  }}>{t("Farms.Get Started")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddNewFarmFirst;
