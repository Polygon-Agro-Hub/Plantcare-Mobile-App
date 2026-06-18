import { View, FlatList } from "react-native";
import React from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/component/types/types";
import CropVarietySelectCard from "./FarmCropVarietySelectCard";

interface VarietyData {
  cropGroupId: string;
  id: string;
  varietyNameEnglish: string;
  varietyNameSinhala: string;
  varietyNameTamil: string;
  bgColor: string;
  image: any;
}

interface FarmCropItemProps {
  data: VarietyData[];
  lang: string;
  navigation: StackNavigationProp<RootStackParamList, "AddNewCrop">;
  selectedCrop: boolean;
  farmId: number;
  onNavigate?: () => void;
}

const CropVariety: React.FC<FarmCropItemProps> = ({
  data,
  navigation,
  lang,
  selectedCrop,
  farmId,
  onNavigate,
}) => {
  return (
    <View style={{ flex: 1, paddingHorizontal: 18, paddingTop: 8 }}>
      <FlatList
        data={data}
        numColumns={3}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        columnWrapperStyle={{
          justifyContent: "flex-start",
          marginBottom: 12,
        }}
        renderItem={({ item, index }) => {
          return (
            <View
              style={{
                width: "30.6%",
                aspectRatio: 0.85,
                marginHorizontal: "1.3%",
                marginBottom: 6,
              }}
            >
              <CropVarietySelectCard
                navigation={navigation as any}
                index={index}
                item={item}
                lang={lang}
                selectedCrop={selectedCrop}
                farmId={farmId}
                onNavigate={onNavigate}
              />
            </View>
          );
        }}
      />
    </View>
  );
};

export default CropVariety;
