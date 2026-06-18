import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/types";
import { LinearGradient } from "expo-linear-gradient";
import { setPackageType, setPackagePrice } from "../../../store/packageSlice";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import CustomHeader from "../../common/CustomHeader";

type FirstTimePackagePlanNavigationProp = StackNavigationProp<
  RootStackParamList,
  "FirstTimePackagePlan"
>;

type FirstTimePackagePlanProps = {
  navigation: FirstTimePackagePlanNavigationProp;
};

const FirstTimePackagePlan: React.FC<FirstTimePackagePlanProps> = ({
  navigation,
}) => {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(
    "12months",
  );
  const [packagePrice, setPackagePriceState] = useState<number | null>(8500);
  const [packageType, setPackageTypeState] = useState<string | null>(
    "Get 12 months / Rs. 8,500",
  );

  const dispatch = useDispatch();
  const { t } = useTranslation();
  const handlePackageSelect = (pkgType: string, price: number) => {
    setSelectedPackage(pkgType);
    setPackageTypeState(
      `Get ${
        pkgType === "6months"
          ? "6 months / Rs. 4,500"
          : pkgType === "12months"
            ? "12 months / Rs. 8,500"
            : "4 months / Rs. 3,200"
      }`,
    );
    setPackagePriceState(price);
  };

  const handleSubmit = () => {
    if (packagePrice !== null) {
      dispatch(setPackagePrice(packagePrice));
    }
    if (selectedPackage) {
      dispatch(setPackageType(selectedPackage));
    }
    navigation.navigate("Main", {
      screen: "PaymentGatewayView",
    });
  };

  return (
    <View className="flex-1 bg-white">
      <CustomHeader
        title=""
        navigation={navigation}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        className="bg-white"
      >

        <View className="flex-1 justify-center items-center p-6 w-full">
          <Image
            source={require("../../../assets/images/farms/payment-plan.webp")}
            resizeMode="contain"
            style={{ width: "100%", height: 250 }}
          />

          <View className="text-center justify-center items-center mt-6 w-full">
            <View className="flex-row items-center justify-center gap-2">
              <Text className="text-xl font-bold text-[#E5B323]">
                {t("Farms.Upgrade TO PRO")}
              </Text>
              <Text> {t("Farms.Pro")}</Text>
            </View>
            <View className="mt-6 items-center">
              <View className="items-center justify-center p-2">
                <View className="flex-row justify-between gap-2 items-center">
                  <TouchableOpacity
                    onPress={() => handlePackageSelect("6months", 4500)}
                  >
                    <View
                      className={`flex p-2 rounded-md bg-white relative shadow-sm border-2 py-2 ${
                        selectedPackage === "6months"
                          ? "border-yellow-500"
                          : "border-black"
                      }`}
                    >
                      <View className="absolute top-0 left-0 w-12 h-10 bg-[#E5B323] flex justify-center items-center rounded-tl-sm rounded-br-full">
                        <Text
                          className="text-white text-lg font-semibold mb-3 mr-1"
                          style={{ transform: [{ rotate: "-30deg" }] }}
                        >
                          6%
                        </Text>
                      </View>
                      <View className="flex flex-col items-center mt-4">
                        <Text className="text-2xl text-black font-extrabold">
                          6
                        </Text>
                        <Text className="text-base text-gray-600 mb-1">
                          {t("Farms.Months")}
                        </Text>
                        <Text className="text-lg text-black font-extrabold">
                          {t("Farms.Rs")} 4,500
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handlePackageSelect("12months", 8500)}
                  >
                    <View
                      className={`flex rounded-xl bg-white relative border-2 py-6 ${
                        selectedPackage === "12months"
                          ? "border-[#E5B323]"
                          : "border-black"
                      }`}
                    >
                      <View className="w-full py-2 px-6  bg-[#E5B323] rounded-t-md items-center -mt-6">
                        <Text className="text-white text-md font-semibold">
                          {t("Farms.11%Save")}
                        </Text>
                      </View>
                      <View className="flex flex-col items-center">
                        <Text className="text-2xl text-black font-extrabold">
                          12
                        </Text>
                        <Text className="text-base text-yellow-700 mb-1">
                          {t("Farms.Months")}
                        </Text>
                        <Text className="text-lg text-black font-extrabold">
                          {t("Farms.Rs")} 8,500
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handlePackageSelect("4months", 3200)}
                  >
                    <View
                      className={`flex p-2 rounded-md bg-white relative shadow-sm border-2 py-2 items-center justify-center ${
                        selectedPackage === "4months"
                          ? "border-yellow-500"
                          : "border-black"
                      }`}
                    >
                      <View className="flex flex-col items-center mt-4">
                        <Text className="text-2xl text-black font-extrabold">
                          4
                        </Text>
                        <Text className="text-base text-gray-600 mb-1">
                          {t("Farms.Months")}
                        </Text>
                        <Text className="text-lg text-black font-extrabold">
                          {t("Farms.Rs")} 3,200
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

          <View className="w-full px-6 mt-8">
            <LinearGradient
              className="w-full rounded-3xl h-[50px] shadow-lg elevation-6 overflow-hidden"
              colors={["#FDCF3F", "#FEE969"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <TouchableOpacity
                className="w-full h-full justify-center items-center"
                onPress={handleSubmit}
              >
                <Text className="text-[#7E5E00] text-lg font-semibold text-center">
                  {packageType}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          <View className="w-full px-6 mt-3 mb-2">
            <LinearGradient
              className="w-full rounded-3xl h-[50px] shadow-lg elevation-6 overflow-hidden"
              colors={["#E0E0E0", "#FFFFFF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <TouchableOpacity
                className="w-full h-full justify-center items-center"
                onPress={() =>
                  navigation.navigate("Main", {
                    screen: "AddNewFarmBasicDetails" as any,
                  })
                }
              >
                <Text className="text-[#727272] text-lg font-semibold text-center">
                  {t("Farms.Try1FarmForFree")}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

            <Text className="text-lg font-semibold text-black text-center mt-6">
              {t("Farms.WhenShouldIBeBilled")}
            </Text>
            <View className="w-[98%] p-2 rounded-lg mt-2 mb-4">
              <Text className="text-sm text-black text-center">
                {t(
                  "Farms.YourBillingCycleBeginsOnTheDateYouUpgradeYourPlan",
                )}
              </Text>
              <Text className="text-sm text-black text-center">
                {t(
                  "Farms.WellSendYouAPaymentReminder14DaysBeforeYourNextBillingDateToEnsureYouHaveTimeToPrepare",
                )}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default FirstTimePackagePlan;
