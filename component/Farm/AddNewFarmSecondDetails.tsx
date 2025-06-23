import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Image,
} from "react-native";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from "@/component/types";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";



type AddNewFarmSecondDetailsNavigationProp = StackNavigationProp<
  RootStackParamList,
  "AddNewFarmSecondDetails"
>;

type AddNewFarmSecondDetailsProps = {
  navigation: AddNewFarmSecondDetailsNavigationProp;
};



const AddNewFarmSecondDetails = () => {
     const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [numberOfStaff, setNumberOfStaff] = useState("");
  const [loginCredentialsNeeded, setLoginCredentialsNeeded] = useState("");



 const handleAddStaff = () => {
  if (!numberOfStaff) {
    alert('Please enter the number of staff');
    return;
  }
  if (!loginCredentialsNeeded) {
    alert('Please enter the number of login credentials needed');
    return;
  }

  try {
    navigation.navigate('Addmemberdetails' as any, { loginCredentialsNeeded });
  } catch (error) {
    console.error('Navigation error:', error);
  }
};

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        className="px-6"
      >
        {/* Header */}
         <View className=""
                 style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
                >
          <View className="flex-row items-center justify-between mb-6">
            <Text className="font-semibold text-lg ml-[30%]">Add New Farm</Text>
            <View className="bg-[#CDEEFF] px-3 py-1 rounded-lg">
              <Text className="text-[#223FFF] text-xs font-medium">BASIC</Text>
            </View>
          </View>

          {/* Progress Steps */}
          <View className="flex-row items-center justify-center mb-8">
            <View className="w-[29px] h-[29px] border border-[#2AAD7A] bg-[#2AAD7A] rounded-full flex items-center justify-center">
              <Image
                className="w-[10px] h-[13px]"
                source={require("../../assets/images/Farm/locationWhite.webp")}
              />
            </View>
            <View className="w-24 h-0.5 bg-[#2AAD7A] mx-2" />
            <View className="w-[29px] h-[29px] border border-[#C6C6C6] rounded-full flex items-center justify-center">
              <Image
                className="w-[11px] h-[12px]"
                source={require("../../assets/images/Farm/user.webp")}
              />
            </View>
            <View className="w-24 h-0.5 bg-[#C6C6C6] mx-2" />
            <View className="w-[29px] h-[29px] border border-[#C6C6C6] rounded-full flex items-center justify-center">
              <Image
                className="w-[13.125px] h-[15px]"
                source={require("../../assets/images/Farm/check.png")}
              />
            </View>
          </View>

          {/* Illustration and Number of Staff Section */}
          <View className="flex-1 items-center justify-center mt-2">
            <Image
              className="w-[259px] h-[161px]"
              source={require("../../assets/images/Farm/groupFarmers.webp")}
            />
            <View className="mt-5 w-full">
                <View className="flex-1 items-center justify-center mt-2">
              <Text className="font-semibold text-base">Number of Staff</Text>
              </View>
              <TextInput
                value={numberOfStaff}
                onChangeText={setNumberOfStaff}
                placeholder="Total number of staff working"
                placeholderTextColor="#585858 "
                className="bg-[#F4F4F4] p-3 rounded-full text-gray-800 mt-2 "
                keyboardType="numeric"
                
                style={{ textAlign: "center" }}
              />
              

              <View className="flex-1 items-center justify-center mt-2">
              <Text className="font-semibold text-base mt-2 ">
               How many staff will be 
              </Text>
              <View className="flex-1 items-center justify-center ">
              <Text className="font-semibold text-base ">
                using the app
              </Text>
              </View>
              </View>
              <TextInput
                value={loginCredentialsNeeded}
                onChangeText={setLoginCredentialsNeeded}
                placeholder="Number of login credentials needed"
                placeholderTextColor="#585858"
                className="bg-[#F4F4F4] p-3 rounded-full text-gray-800 mt-2"
                keyboardType="numeric"
                style={{ textAlign: "center" }}
              />
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View className="mt-8 mb-2">
          <TouchableOpacity className="bg-[#F3F3F5] py-3 mx-6 rounded-full">
            <Text className="text-[#84868B] text-center font-semibold text-lg">
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
        <View className="mt-2 mb-8">
          <TouchableOpacity
            className="bg-black py-3 mx-6 rounded-full"
            onPress={handleAddStaff}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Add Staff
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddNewFarmSecondDetails;