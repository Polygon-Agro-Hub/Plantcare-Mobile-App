import React from "react";
import { View, Text, TouchableOpacity, BackHandler } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { RootStackParamList } from "../types/types";
import { ScrollView } from "react-native-gesture-handler";
import CustomHeader from "../../component/common/CustomHeader";
import { useTranslation } from "react-i18next";

type DeleteFarmerScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "DeleteFarmer"
>;

type DeleteFarmerScreenRouteProp = RouteProp<
  RootStackParamList,
  "DeleteFarmer"
>;

interface DeleteFarmerProps {
  navigation: DeleteFarmerScreenNavigationProp;
  route: DeleteFarmerScreenRouteProp;
}

const DeleteFarmer: React.FC<DeleteFarmerProps> = ({ navigation }) => {
  const { t } = useTranslation();

  const handleGoBack = () => {
    navigation.navigate("Main", { screen: "EditProfile" });
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("Main", { screen: "EditProfile" });
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => backHandler.remove();
    }, [navigation]),
  );

  return (
    <View className="flex-1 bg-white">
      <CustomHeader
        title={t("DeleteFarmer.DeleteMyAccount")}
        navigation={navigation}
        onBackPress={handleGoBack}
      />
      <ScrollView 
        className="flex-1"
        contentContainerClassName="px-6 pb-40"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-black text-xl font-semibold mb-4 mt-4 ">
          {t("DeleteFarmer.AreYouSureDoYouWantToDeleteYourAccount")}
        </Text>
        <Text className="text-gray-600 leading-relaxed mt-4">
          {t("DeleteFarmer.OnceYouDeleteYourAccountItCannotBeUndoneAllYourDataWillBePermanentlyErasedFromThisAppIncludesYourProfileInformationPreferencesSavedAndAnyActivityHistory")}
        </Text>
        <Text className="text-gray-600 leading-relaxed mt-6">
          {t("DeleteFarmer.WeAreSadToSeeYouGoButWeUnderstandThatSometimesItsNecessaryPleaseTakeAMomentToConsiderTheConsequencesBeforeProceeding")}
        </Text>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-white px-12 py-4">
        {/* Delete Account Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate("UserFeedback")}
          activeOpacity={0.8}
          className="w-full rounded-3xl h-[50px] justify-center items-center bg-[#353535] shadow-lg elevation-6"
        >
          <Text className="text-white font-semibold text-center text-lg">
            {t("DeleteFarmer.DeleteAccount")}
          </Text>
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          onPress={handleGoBack}
          activeOpacity={0.8}
          className="w-full rounded-3xl h-[50px] justify-center items-center bg-[#E5E7EB] shadow-lg elevation-6 mt-4"
        >
          <Text className="text-[#374151] font-semibold text-center text-lg">
            {t("Main.Cancel")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DeleteFarmer;
