import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  ScrollView,
} from "react-native";
import CustomHeader from "./CustomHeader";
import { StackNavigationProp } from "@react-navigation/stack";

interface GoviPensionInformationProps {
  navigation: StackNavigationProp<any>;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const GoviPensionInformation: React.FC<GoviPensionInformationProps> = ({
  navigation,
}) => {
  const [currentSection, setCurrentSection] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleApplyPress = () => {
    navigation.navigate("GoviPensionForm" as any);
  };

  const handleScrollEnd = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / screenWidth);
    setCurrentSection(index);
  };

  const scrollToSection = (index: number) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
      });
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

      if (!hasBoldText) {
        return <Text>{text}</Text>;
      }

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
              className={`text-sm mb-2 leading-7 text-[#426A98] font-normal ${
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
      {/* Custom Header */}
      <CustomHeader
        title="GoViPension"
        showBackButton={true}
        navigation={navigation}
        onBackPress={handleBackPress}
      />

      {/* Horizontal Scroll Sections with Vertical Scrolling */}
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

      {/* Pagination Dots */}
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
      <View className="px-4 mb-4">
        <TouchableOpacity
          className="bg-[#353535] py-4 rounded-full"
          onPress={handleApplyPress}
          activeOpacity={0.8}
        >
          <Text className="text-white text-xl font-bold text-center">
            Apply for Pension
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GoviPensionInformation;