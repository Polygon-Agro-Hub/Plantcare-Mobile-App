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
import { useNavigation, useRoute } from "@react-navigation/native";
import DropDownPicker from "react-native-dropdown-picker";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/component/types";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const AddMemberDetails: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { loginCredentialsNeeded } = route.params as { loginCredentialsNeeded: string };

  // Parse the number of staff members who need login credentials
  const numStaff = parseInt(loginCredentialsNeeded, 10) || 1;

  // State for dynamic staff members
  const [staff, setStaff] = useState(
    Array.from({ length: numStaff }, () => ({
      firstName: "",
      lastName: "",
      phone: "",
      role: null,
      openRole: false,
    }))
  );

  // Role items for dropdowns
  const [roleItems] = useState([
    { label: "Manager", value: "Manager" },
    { label: "Supervisor", value: "Supervisor" },
    { label: "Worker", value: "Worker" },
  ]);

  // Update staff state
  const updateStaff = (index: number, field: string, value: any) => {
    setStaff((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSaveFarm = () => {
    // Validate required fields for each staff member
    for (let i = 0; i < staff.length; i++) {
      const { firstName, lastName, phone, role } = staff[i];
      if (!firstName || !lastName || !phone || !role) {
        alert(`Please fill all fields for Staff ${i + 1}`);
        return;
      }
    }

    // Log staff data
    staff.forEach((member, index) => {
      console.log(`Staff ${index + 1} Data:`, {
        firstName: member.firstName,
        lastName: member.lastName,
        phone: member.phone,
        role: member.role,
      });
    });

    // Navigate or save logic here
  //  navigation.navigate("NextScreen"); // Replace with actual screen name
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        className="px-6"
      >
        {/* Header */}
        <View style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}>
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
            <View className="w-[29px] h-[29px] border border-[#2AAD7A] bg-[#2AAD7A] rounded-full flex items-center justify-center">
              <Image
                className="w-[11px] h-[12px]"
                source={require("../../assets/images/Farm/userwhite.webp")}
              />
            </View>
            <View className="w-24 h-0.5 bg-[#2AAD7A] mx-2" />
            <View className="w-[29px] h-[29px] border border-[#C6C6C6] rounded-full flex items-center justify-center">
              <Image
                className="w-[13.125px] h-[15px]"
                source={require("../../assets/images/Farm/check.png")}
              />
            </View>
          </View>
        </View>

        {/* Dynamic Staff Sections */}
        {staff.map((member, index) => (
          <View key={index} className="ml-3 mr-3 space-y-4 mt-6">
            <Text className="font-[#5A5A5A]">{`Manager - ${index + 1}`}</Text>
            <View className="w-full h-0.5 bg-[#AFAFAF] mx-2" />
            <View>
              <Text className="text-[#070707] font-medium mb-2">First Name</Text>
              <TextInput
                value={member.firstName}
                onChangeText={(text) => updateStaff(index, "firstName", text)}
                placeholder="Enter First Name"
                placeholderTextColor="#9CA3AF"
                className="bg-[#F4F4F4] p-3 rounded-full text-gray-800"
              />
            </View>
            <View>
              <Text className="text-[#070707] font-medium mb-2">Last Name</Text>
              <TextInput
                value={member.lastName}
                onChangeText={(text) => updateStaff(index, "lastName", text)}
                placeholder="Enter Last Name"
                placeholderTextColor="#9CA3AF"
                className="bg-[#F4F4F4] p-3 rounded-full text-gray-800"
              />
            </View>
            <View>
              <Text className="text-[#070707] font-medium mb-2">Phone Number</Text>
              <TextInput
                value={member.phone}
                onChangeText={(text) => updateStaff(index, "phone", text)}
                placeholder="Enter Phone Number"
                placeholderTextColor="#9CA3AF"
                className="bg-[#F4F4F4] p-3 rounded-full text-gray-800"
                keyboardType="phone-pad"
              />
            </View>
            <View style={{ zIndex: member.openRole ? 2000 : 1 }}>
              <Text className="text-[#070707] font-medium mb-2">Role</Text>
              <DropDownPicker
                open={member.openRole}
                value={member.role}
                items={roleItems}
                setOpen={(open) => updateStaff(index, "openRole", open)}
                setValue={(value) => updateStaff(index, "role", value)}
                setItems={() => {}} // No need to update items
                placeholder="Select Role"
                placeholderStyle={{ color: "#9CA3AF", fontSize: 16 }}
                style={{
                  backgroundColor: "#F4F4F4",
                  borderColor: "#F4F4F4",
                  borderRadius: 25,
                  height: 50,
                  paddingHorizontal: 16,
                }}
                textStyle={{ color: "#374151", fontSize: 16 }}
                dropDownContainerStyle={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#E5E7EB",
                  borderRadius: 8,
                  marginTop: 4,
                  elevation: 5,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  zIndex: 5000,
                  position: "absolute",
                  top: 50,
                  left: 0,
                  right: 0,
                }}
                listMode="SCROLLVIEW"
              />
            </View>
          </View>
        ))}

        {/* Buttons */}
        <View className="mt-8 mb-8">
          <TouchableOpacity className="bg-[#F3F3F5] py-3 mx-6 rounded-full">
            <Text className="text-[#84868B] text-center font-semibold text-lg">
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
        <View className="mt-2 mb-8">
          <TouchableOpacity
            className="bg-black py-3 mx-6 rounded-full"
            onPress={handleSaveFarm}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Save Farm
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddMemberDetails;