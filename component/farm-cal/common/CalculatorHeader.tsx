import React from "react";
import { View, Text, Image, StatusBar, StyleSheet } from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import { TouchableOpacity } from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";

interface CalculatorHeaderProps {
  title: string;
  icon: any;
  onBack: () => void;
  titleFontSize?: number; 
}

const CalculatorHeader: React.FC<CalculatorHeaderProps> = ({
  title,
  icon,
  onBack,
  titleFontSize = 16, 
}) => {
  return (
    <View>
      <StatusBar barStyle="dark-content" backgroundColor="#FFDB33" />

      {/* Header Bar */}
      <View className="bg-[#FFDB33] flex-row items-center justify-between px-4 py-3 relative">
        {/* Left - Back Button */}
        <View style={{ width: wp(15) }}>
          <TouchableOpacity onPress={onBack} className="items-start">
            <Entypo
              name="chevron-left"
              size={25}
              color={"black"}
              style={{
                backgroundColor: "#F6F6F680",
                borderRadius: 50,
                padding: wp(2.5),
              }}
            />
          </TouchableOpacity>
        </View>

        {/* Center - Title */}
        <View className="flex-1 items-center">
          <Text
            className="font-semibold text-center text-black"
            style={{ fontSize: titleFontSize }} 
          >
            {title}
          </Text>
        </View>

        {/* Right - Placeholder */}
        <View style={{ width: wp(15) }} />
      </View>

      {/* Icon below header */}
      <View className="bg-white items-center py-10">
        <Image source={icon} className="w-28 h-28" resizeMode="contain" />
      </View>
    </View>
  );
};

export default CalculatorHeader;