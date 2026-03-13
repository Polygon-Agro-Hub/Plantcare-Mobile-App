import React from "react";
import { Modal, View, Text, Image, TouchableOpacity } from "react-native";

interface ResultModalProps {
  visible: boolean;
  onClose: () => void;
  cropName: string;
  cropIcon?: any;
  resultValue: string;
  resultUnit: string;
}

const ResultModal: React.FC<ResultModalProps> = ({
  visible,
  onClose,
  cropName,
  cropIcon,
  resultValue,
  resultUnit,
}) => {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.75)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          className="bg-white w-3/4 shadow-lg overflow-hidden"
          style={{ borderRadius: 16 }}
        >
          {/* Yellow top bar */}
          <View
            style={{ height: 10, backgroundColor: "#F5C518", width: "100%" }}
          />

          {/* Content */}
          <View className="py-7 px-9 items-center">
            <TouchableOpacity
              onPress={onClose}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gray-200 items-center justify-center"
            >
              <Text className="text-xs text-gray-600 font-semibold">✕</Text>
            </TouchableOpacity>

            {cropIcon && (
              <Image
                source={cropIcon}
                className="w-24 h-24 mb-2"
                resizeMode="contain"
              />
            )}

            <Text className="text-lg font-semibold text-gray-900 mt-1">
              {cropName}
            </Text>

            <View className="flex-row items-baseline mt-2">
              <Text className="text-3xl font-extrabold text-gray-900">
                {resultValue}{" "}
              </Text>
              <Text className="text-3xl text-[#287097]">
                {resultUnit}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ResultModal;
