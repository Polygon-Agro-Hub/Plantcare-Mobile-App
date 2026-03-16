import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
  StyleProp,
  ViewStyle,
  TextStyle,
  ImageStyle,
  DimensionValue,
} from "react-native";

interface CalculatorButtonProps {
  id: string;
  label: string;
  icon: ImageSourcePropType;
  onPress: () => void;

  // Styling props
  containerStyle?: StyleProp<ViewStyle>;
  imageContainerStyle?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  labelStyle?: StyleProp<TextStyle>;

  // Layout props
  width?: DimensionValue;
  height?: DimensionValue;
  imageSize?: number;
  minHeight?: number;

  // Behavior props
  activeOpacity?: number;
  disabled?: boolean;

  // Additional customization
  showShadow?: boolean;
  backgroundColor?: string;
  borderRadius?: number;

  // Text props
  numberOfLines?: number;
}

const CalculatorButton: React.FC<CalculatorButtonProps> = ({
  id,
  label,
  icon,
  onPress,

  // Styling props with defaults
  containerStyle,
  imageContainerStyle,
  imageStyle,
  labelStyle,

  // Layout props with defaults
  width = "48%",
  height = "auto",
  imageSize = 100,
  minHeight = 180,

  // Behavior props with defaults
  activeOpacity = 0.7,
  disabled = false,

  // Additional customization with defaults
  showShadow = true,
  backgroundColor = "#FFFFFF",
  borderRadius = 12,

  // Text props
  numberOfLines = 2,
}) => {
  const shadowStyle = showShadow
    ? {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }
    : {};

  return (
    <TouchableOpacity
      key={id}
      onPress={onPress}
      activeOpacity={activeOpacity}
      disabled={disabled}
      style={[
        {
          width: width,
          height: height,
          minHeight: minHeight,
          backgroundColor: backgroundColor,
          borderRadius: borderRadius,
          padding: 16,
          alignItems: "center" as const,
          justifyContent: "space-between" as const,
        },
        showShadow && shadowStyle,
        containerStyle,
      ]}
    >
      <View
        style={[
          {
            width: imageSize,
            height: imageSize,
            alignItems: "center" as const,
            justifyContent: "center" as const,
            marginBottom: 8,
          },
          imageContainerStyle,
        ]}
      >
        <Image
          source={icon}
          style={[{ width: "100%", height: "100%" }, imageStyle]}
          resizeMode="contain"
        />
      </View>

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Text
          style={[
            {
              fontSize: 15,
              fontWeight: "700",
              color: "#1F2937",
              textAlign: "center" as const,
            },
            labelStyle,
          ]}
          numberOfLines={numberOfLines}
          ellipsizeMode="tail"
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default CalculatorButton;
