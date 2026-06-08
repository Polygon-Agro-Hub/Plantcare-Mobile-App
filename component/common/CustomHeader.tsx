import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Entypo from "@expo/vector-icons/Entypo";

import { StackNavigationProp } from "@react-navigation/stack";

interface CustomHeaderProps {
  title: string;
  showBackButton?: boolean;
  navigation?: StackNavigationProp<any>;
  onBackPress?: () => void;
  titleSize?: number;
  rightComponent?: React.ReactNode;
  transparent?: boolean;
  headerStyle?: object;
  backButtonStyle?: object;
  titleStyle?: object;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
  title,
  showBackButton = true,
  navigation,
  onBackPress,
  titleSize,
  rightComponent,
  transparent = false,
  headerStyle,
  backButtonStyle,
  titleStyle,
}) => {
  return (
    <View
      className="flex-row items-center justify-between px-4 py-3 relative"
      style={[
        { backgroundColor: transparent ? "transparent" : "white" },
        headerStyle,
      ]}
    >
      {/* LEFT - BACK BUTTON */}
      <View style={{ width: 50 }}>
        {showBackButton && navigation && (
          <TouchableOpacity
            onPress={onBackPress ?? (() => navigation.goBack())}
            className="items-start"
          >
            <Entypo
              name="chevron-left"
              size={25}
              color={"black"}
              style={[
                {
                  backgroundColor: "#F6F6F6CC",
                  borderRadius: 50,
                  padding: 10,
                },
                backButtonStyle,
              ]}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* CENTER - TITLE */}
      <View className="flex-1 items-center h-[50px] justify-center">
        {title && (
          <Text
            className="font-semibold text-center"
            style={[
              { color: transparent ? "white" : "black" },
              titleSize ? { fontSize: titleSize } : { fontSize: 18 },
              titleStyle,
            ]}
          >
            {title}
          </Text>
        )}
      </View>

      {/* RIGHT - CUSTOMIZABLE SECTION */}
      <View style={{ width: 50 }} className="items-end">
        {rightComponent || null}
      </View>
    </View>
  );
};

export default CustomHeader;