import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
} from "react-native";
import CustomHeader from "./CustomHeader";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native-gesture-handler";

interface GoviPensionInformationProps {
  navigation: StackNavigationProp<any>;
}

const { width: screenWidth } = Dimensions.get("window");

const GoviPensionInformation: React.FC<GoviPensionInformationProps> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const [currentSection, setCurrentSection] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleApplyPress = () => {
    // Check current section and navigate accordingly
    if (currentSection === 0) {
      // If in section 1, move to section 2
      scrollToSection(1);
    } else if (currentSection === 1) {
      // If in section 2, move to section 3
      scrollToSection(2);
    } else if (currentSection === 2) {
      // If in section 3, navigate to GoviPensionForm
      navigation.navigate("GoviPensionForm" as any);
    }
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
        t("GoviPension.section1.para1"),
        t("GoviPension.section1.para2"),
        t("GoviPension.section1.para3"),
        t("GoviPension.section1.para4"),
      ],
    },
    {
      id: 2,
      image: require("../../assets/images/govi-pension/information2.webp"),
      title: t("GoviPension.howThisWorks"),
      content: [
        t("GoviPension.section2.para1"),
        t("GoviPension.section2.para2"),
        t("GoviPension.section2.para3"),
        t("GoviPension.section2.para4"),
      ],
    },
    {
      id: 3,
      image: require("../../assets/images/govi-pension/information3.webp"),
      title: t("GoviPension.otherBeneficiaries"),
      content: [
        t("GoviPension.section3.para1"),
        t("GoviPension.section3.para2"),
        t("GoviPension.section3.para3"),
        t("GoviPension.section3.para4"),
        t("GoviPension.section3.para5"),
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

      // Check if text contains any bold patterns
      const hasBoldText = boldPatterns.some((pattern) =>
        text.includes(pattern),
      );

      if (!hasBoldText) {
        return <Text>{text}</Text>;
      }

      // Split text and make only the amounts bold
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
      <View style={{ width: screenWidth }} className="px-4">
        {/* Section Image - Fixed to half screen height */}
        <View
          className="items-center justify-center"
          style={{ height: screenWidth * 0.75 }}
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
        {/* Section Content - Center aligned for all sections */}
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
      </View>
    );
  };

  // Get button text based on current section
  const getButtonText = () => {
    if (currentSection === 0 || currentSection === 1) {
      return t("GoviPension.next") || "Next";
    } else {
      return t("GoviPension.applyForPension") || "Apply for Pension";
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Custom Header */}
      <CustomHeader
        title={t("TransactionList.GoViPension")}
        showBackButton={true}
        navigation={navigation}
        onBackPress={handleBackPress}
      />
      <ScrollView>
        {/* Horizontal Scroll Sections */}
        <FlatList
          ref={flatListRef}
          data={sections}
          renderItem={renderSection}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          keyExtractor={(item) => item.id.toString()}
          className="flex-1"
        />

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
      </ScrollView>

      {/* Apply Button */}
      <View className="px-4 pb-6 pt-4">
        <TouchableOpacity
          className="bg-[#353535] py-4 rounded-full"
          onPress={handleApplyPress}
          activeOpacity={0.8}
        >
          <Text className="text-white text-lg font-bold text-center">
            {t("GoviPension.applyForPension")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GoviPensionInformation;
