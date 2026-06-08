import { View, FlatList } from "react-native";
import React from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/component/types/types";
import CropSelectCard from "./FarmCropSelectCard";

interface CropData {
  id: string;
  cropNameEnglish: string;
  cropNameSinhala: string;
  cropNameTamil: string;
  bgColor: string;
  image: any;
}

interface FarmCropItemProps {
  data: CropData[];
  lang: string;
  navigation: StackNavigationProp<RootStackParamList, "AddNewCrop">;
  selectedCrop: boolean;
  setSelectedCrop: React.Dispatch<React.SetStateAction<boolean>>;
  onCropSelect: (cropId: string) => void;
  allowedCropIds: string[];
  refreshControl?: React.ReactElement<any>;
}

const FarmCropItem: React.FC<FarmCropItemProps> = ({
  data,
  navigation,
  lang,
  selectedCrop,
  setSelectedCrop,
  onCropSelect,
  allowedCropIds,
  refreshControl,
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
        refreshControl={refreshControl}
        renderItem={({ item, index }) => {
          const isAllowed =
            allowedCropIds.length === 0 || allowedCropIds.includes(item.id);

          return (
            <View
              style={{
                width: "30.6%",
                aspectRatio: 0.85,
                marginHorizontal: "1.3%",
                marginBottom: 6,
              }}
            >
              <CropSelectCard
                navigation={navigation as any}
                index={index}
                item={item}
                lang={lang}
                selectedCrop={selectedCrop}
                setSelectedCrop={setSelectedCrop}
                onCropSelect={onCropSelect}
                isAllowed={isAllowed}
              />
            </View>
          );
        }}
      />
    </View>
  );
};

export default FarmCropItem;
