import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native";
import CustomHeader from "../common/CustomHeader";
import { StackNavigationProp } from "@react-navigation/stack";
import axios from "axios";
import { environment } from "@/environment/environment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign, Entypo } from "@expo/vector-icons";

interface GoviPensionInformationProps {
  navigation: StackNavigationProp<any>;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const GoviPensionInformation: React.FC<GoviPensionInformationProps> = ({
  navigation,
}) => {
  const [currentSection, setCurrentSection] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const [showIneligibleModal, setShowIneligibleModal] = useState(false);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleApplyPress = async () => {
    try {
      setIsCheckingEligibility(true);
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.get(
        `${environment.API_BASE_URL}api/pension/check-eligibility`,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          timeout: 30000,
        },
      );
      const { eligible, message } = response.data;

      if (eligible) {
        navigation.navigate("GoviPensionForm" as any);
      } else {
        setShowIneligibleModal(true);
      }
    } catch (err) {
      setShowIneligibleModal(true);
    } finally {
      setIsCheckingEligibility(false);
    }
  };

  const handleScrollEnd = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / screenWidth);
    setCurrentSection(index);
  };

  const scrollToSection = (index: number) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true });
      setCurrentSection(index);
    }
  };

  const sections = [
    {
      id: 1,
      image: require("../../assets/images/govi-pension/information1.webp"),
      content: [
        "This pension scheme is created to support farmers and their families in the future. When a farmer joins the scheme, they will receive a monthly pension after retirement.",
        "The pension amount depends on how many years the farmer contributes to the scheme.",
        "For each year of contribution, the farmer earns Rs. 2,000 as monthly pension.",
        "The longer you stay in the scheme, the higher your monthly pension will be.",
      ],
    },
    {
      id: 2,
      title: "How this works?",
      image: require("../../assets/images/govi-pension/information2.webp"),
      content: [
        "If a farmer joins at 20 years old and works until 65 years,",
        "Total years = 45",
        "Monthly pension = Rs. 2,000 × 45",
        "= Rs. 90,000 per month",
      ],
    },
    {
      id: 3,
      title: "Who gets benefits other than me?",
      image: require("../../assets/images/govi-pension/information3.webp"),
      content: [
        "If a farmer joins at 20 years old and passes away at 50 years,",
        "Total years = 30",
        "Monthly pension = Rs. 2,000 × 30",
        "= Rs. 60,000 per month",
        "The spouse will receive Rs. 60,000 per month for the rest of their life.",
      ],
    },
  ];

  const renderSection = ({
    item,
    index,
  }: {
    item: (typeof sections)[0];
    index: number;
  }) => {
    const isFirstSection = index === 0;

    const renderTextWithBold = (text: string) => {
      const boldPatterns = ["Rs. 2,000", "Rs. 90,000", "Rs. 60,000"];
      const hasBoldText = boldPatterns.some((pattern) =>
        text.includes(pattern),
      );

      if (!hasBoldText) return <Text>{text}</Text>;

      let parts = [text];
      boldPatterns.forEach((pattern) => {
        parts = parts.flatMap((part) =>
          typeof part === "string"
            ? part
                .split(pattern)
                .flatMap((s, i, arr) =>
                  i < arr.length - 1 ? [s, pattern] : [s],
                )
            : [part],
        );
      });

      return (
        <>
          {parts.map((part, i) =>
            boldPatterns.includes(part) ? (
              <Text key={i} className="font-bold">
                {part}
              </Text>
            ) : (
              <Text key={i}>{part}</Text>
            ),
          )}
        </>
      );
    };

    return (
      <ScrollView
        style={{ width: screenWidth }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="items-center justify-center"
          style={{ height: Math.min(screenWidth * 0.75, screenHeight * 0.4) }}
        >
          <Image
            source={item.image}
            className="w-full h-full"
            resizeMode="contain"
          />
        </View>

        {item.title && (
          <Text className="text-lg font-bold text-[#426A98] text-center mt-6 mb-4">
            {item.title}
          </Text>
        )}

        <View className="mt-2">
          {item.content.map((paragraph, idx) => (
            <Text
              key={idx}
              className={`text-sm mb-2 leading-5 text-[#426A98] font-normal ${
                isFirstSection ? "text-center" : "text-left"
              }`}
            >
              {renderTextWithBold(paragraph)}
            </Text>
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <CustomHeader
        title="GoViPension"
        showBackButton={true}
        navigation={navigation}
        onBackPress={handleBackPress}
      />

      <View className="flex-1">
        <FlatList
          ref={flatListRef}
          data={sections}
          renderItem={renderSection}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>

      <View className="flex-row justify-center items-center py-4">
        {sections.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => scrollToSection(index)}
            className="mx-2"
          >
            <View
              className="rounded-full"
              style={{
                backgroundColor:
                  currentSection === index ? "#0FC7B2" : "#D9D9D9",
                width: currentSection === index ? 12 : 8,
                height: currentSection === index ? 12 : 8,
              }}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Apply Button */}
      <View className="px-4 mb-4   ">
        <TouchableOpacity
          className="bg-[#353535] h-[50px] rounded-3xl justify-center"
          onPress={handleApplyPress}
          activeOpacity={0.8}
          disabled={isCheckingEligibility}
        >
          {isCheckingEligibility ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white text-xl font-bold text-center">
              Apply for Pension
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Ineligible Modal */}
      <Modal
        visible={showIneligibleModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowIneligibleModal(false)}
      >
        <View
          style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.60)" }}
          className="justify-center items-center px-8"
        >
          <View className="bg-white rounded-2xl w-full px-6 pt-6 pb-8 items-center">
            <TouchableOpacity
              onPress={() => setShowIneligibleModal(false)}
              className="absolute top-3 right-3 p-1"
            >
              <View className="bg-[#B6B6B6] rounded-full w-6 h-6 items-center justify-center">
                <AntDesign name="close" size={10} color="white" />
              </View>
            </TouchableOpacity>

            <View className="bg-[#F6F7F9] rounded-lg w-10 h-10 items-center justify-center mb-4 mt-2">
              <Entypo name="warning" size={25} color="#505153" />
            </View>

            <Text className="text-base font-bold text-[#353535] text-center mb-2">
              You are not eligible yet.
            </Text>

            <Text className="text-sm text-[#555555] text-center leading-5">
              You need to successfully complete at least one enrolled
              cultivation to qualify for the pension scheme.
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default GoviPensionInformation;
