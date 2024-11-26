import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { View, Text, ScrollView, TouchableOpacity,Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "./types";
import { AntDesign } from "@expo/vector-icons";

type PrivacyPolicyNavigationProp = StackNavigationProp<
  RootStackParamList,
  "PrivacyPolicy"
>;



interface PrivacyPolicyProps {
  navigation: PrivacyPolicyNavigationProp;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ navigation }) => {

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header Section */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
      <TouchableOpacity onPress={()=>navigation.goBack()}>
      {/* Back Button with PNG image */}
      <AntDesign name="left" size={24} color="#000000" />
    </TouchableOpacity>
        <Text className="text-center flex-1 text-lg font-bold text-black">
          Privacy Policy
        </Text>
      </View>
      <Text className="text-l text-blue-500 mt-2 ml-[40%] font-bold ">By 2024/11/08</Text>

      {/* Scrollable Content */}
      <ScrollView className="p-8">
        {/* Part 1 */}
       
        <Text className="text-sm text-gray-700 mt-2">
          PlantCare is committed to protecting your privacy. This Privacy Policy
          explains how we collect, use, disclose, and safeguard your information
          when you use our mobile application designed to provide farming
          guidance, asset management, weather reports, monitoring support, and a
          public forum for farmers. By using our App, you agree to the terms of
          this Privacy Policy. If you do not agree, please discontinue use of our
          App.
        </Text>
        <View className="flex-row justify-center items-center my-4">
       
 
        </View>

        {/* Part 2 */}
        <Text className="text-lg font-bold mt-4">1. Information We Collect</Text>
        <Text className="text-sm font-bold mt-9">Registration Information:</Text>
        <Text className="text-sm text-gray-700">
          To use our App, you must register by providing your name, contact
          details, address, and other personal information. Bank details may also
          be collected for specific features, such as financial planning or asset
          management.
        </Text>
        <Text className="text-sm font-bold mt-2">Location Information:</Text>
        <Text className="text-sm text-gray-700">
          We collect your location data to provide weather reports and tailored
          farming advice. This data is collected only when you enable location
          services.
        </Text>
        <Text className="text-sm font-bold mt-2">Usage Data:</Text>
        <Text className="text-sm text-gray-700">
          We collect information about your interaction with our App, including
          features accessed, activity logs, and preferences to improve our
          services and provide better recommendations.
        </Text>
        <Text className="text-sm font-bold mt-2">Public Forum Content:</Text>
        <Text className="text-sm text-gray-700">
          Any information shared by you in the public forum, such as issues,
          questions, or advice, is public and may be visible to other users.
          Please do not share sensitive information in this forum.
        </Text>

        {/* Part 3 */}
        <Text className="text-lg font-bold mt-6">2. How We Use Your Information</Text>
        <Text className="text-sm font-bold mt-9">To Provide Services:</Text>
        <Text className="text-sm text-gray-700">
          We use your information to deliver farming guidance, weather reports,
          asset management, and support features.
        </Text>
        <Text className="text-sm font-bold mt-2">
          Weather and Location Services:
        </Text>
        <Text className="text-sm text-gray-700">
          Your location is used to provide accurate weather updates relevant to
          your area.
        </Text>
        <Text className="text-sm font-bold mt-2">Account Management:</Text>
        <Text className="text-sm text-gray-700">
          Your details, including bank information, are used to manage your
          account and facilitate asset-related services.
        </Text>
        <Text className="text-sm font-bold mt-2">Public Forum:</Text>
        <Text className="text-sm text-gray-700">
          Information shared in the forum is used to create a collaborative
          environment where farmers can interact and solve problems.
        </Text>
        <Text className="text-sm font-bold mt-2">Research and Development:</Text>
        <Text className="text-sm text-gray-700">
          We use aggregated data to improve our services, including app features
          and user experience.
        </Text>

        {/* Part 4 */}
        <Text className="text-lg font-bold mt-4">
          3. Information Sharing and Disclosure
        </Text>
        <Text className="text-sm text-gray-700 mt-2">
          We do not share your personal information with third parties except as
          described in this Privacy Policy:
        </Text>
        <Text className="text-sm font-bold mt-9">Service Providers:</Text>
        <Text className="text-sm text-gray-700">
          We may share your information with trusted third-party providers who
          assist us in app functionality, data analysis, and weather report
          services.
        </Text>
        <Text className="text-sm font-bold mt-2">Legal Requirements:</Text>
        <Text className="text-sm text-gray-700">
          We may disclose your information to comply with legal obligations or in
          response to valid requests by public authorities.
        </Text>
        <Text className="text-sm font-bold mt-2">Aggregated Data:</Text>
        <Text className="text-sm mt-6 text-gray-700">
          Non-identifiable data may be shared for research and statistical
          purposes to improve the agricultural industry.
        </Text>
        <Text className="text-lg font-bold mt-4">
          4. Security of Your Information
        </Text>
        <Text className="text-sm mt-6 text-gray-700">
          We implement industry-standard security measures to protect your
          information. However, no online platform is entirely secure, so we
          cannot guarantee absolute security. Please notify us of any suspected
          security breaches.
        </Text>
        <Text className="text-lg font-bold mt-4">5. Your Privacy Choices</Text>
        <Text className="text-sm mt-6 text-gray-700 ">
        You can manage your privacy settings through the App, including enabling/disabling location services. You may also request data access, updates, or deletion as per applicable data protection laws.
        </Text>
        
        <Text className="text-lg font-bold mt-4">6. Children's Privacy</Text>
        <Text className="text-sm mt-6 text-gray-700 ">
        Our App is not intended for individuals under the age of 18. We do not knowingly collect personal information from minors.
        </Text>
        
        <Text className="text-lg font-bold mt-4">7. Updates to this Privacy Policy</Text>
        <Text className="text-sm mt-6 text-gray-700 mb-12">
        We may update this Privacy Policy periodically. The latest version will always be available in the App. Your continued use of our App after changes are made will constitute acceptance of the updated policy.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicy;
