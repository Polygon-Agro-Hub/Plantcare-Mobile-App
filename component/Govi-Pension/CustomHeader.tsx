import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { StackNavigationProp } from "@react-navigation/stack";

interface CustomHeaderProps {
  title: string;
  showBackButton?: boolean;
  navigation?: StackNavigationProp<any>;
  onBackPress?: () => void;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
  title,
  showBackButton = true,
  navigation,
  onBackPress,
}) => {
  return (
    <View
      className={`flex-row items-center justify-between px-4 py-3 relative`}
    >
      {/* LEFT - BACK BUTTON */}
      <View style={{ width: wp(15) }}>
        {showBackButton && navigation && (
          <TouchableOpacity
            onPress={onBackPress ?? (() => navigation.goBack())}
            className="items-start"
          >
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
        )}
      </View>

      {/* CENTER - TITLE */}
      <View className="flex-1 items-center">
        <Text className={`text-xl font-semibold text-center text-black`}>
          {title}
        </Text>
      </View>

      {/* RIGHT */}
      <View style={{ width: wp(15) }} className="items-end"></View>
    </View>
  );
};

export default CustomHeader;
