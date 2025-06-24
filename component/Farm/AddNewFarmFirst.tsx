import React from "react";
import { View, Text, TouchableOpacity, Image, SafeAreaView, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Replace this with your actual stack param list
type RootStackParamList = {
  FirstLoginProView: undefined;
  // add other routes here if needed
};

const AddNewFarmFirst: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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
        {/* Content Section */}
        <View className="text-center justify-center items-center p-8 mt-2">
          <Text className="text-xl w-[80%] text-center text-white font-semibold">
            Create Your First Farm For Free!
          </Text>
          <View className="w-[80%]">
            <Text className="text-sm text-center text-white mt-2">
              Simplify farm management like never before.
            </Text>
            <Text className="text-sm text-center text-white mt-2">
              Add new farms, assign managers, and oversee operations from a single powerful platform.
            </Text>
            <Text className="text-sm text-center text-white mt-2">
              Designed for farm owners who want efficiency, transparency, and growth all in one place.
            </Text>
          </View>

          <TouchableOpacity
            className="bg-white/25 py-3 px-[30%] mt-4 rounded-full items-center shadow-md shadow-black"
            onPress={() => navigation.navigate("FirstLoginProView")}
          >
            <Text className="text-white text-lg font-bold">Get Started</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddNewFarmFirst;
