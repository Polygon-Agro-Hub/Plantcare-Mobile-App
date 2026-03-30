import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
  Dimensions,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTranslation } from "react-i18next";
import { RootStackParamList } from "../types/types";
import CustomHeader from "../common/CustomHeader";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";

const { width: screenWidth } = Dimensions.get("window");

type GoviShopProfileNavigationProp = StackNavigationProp<
  RootStackParamList,
  "GoviShopProfileScreen"
>;

interface GoviShopProfileProps {
  navigation: GoviShopProfileNavigationProp;
}

interface ProductCategory {
  id: string;
  name: string;
  image: string;
  productCount: number;
}

interface FilterButton {
  id: string;
  name: string;
}

const GoviShopProfileScreen: React.FC<GoviShopProfileProps> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  // Filter buttons data
  const filterButtons: FilterButton[] = [
    { id: "1", name: "All" },
    { id: "2", name: "Chemicals" },
    { id: "3", name: "Fertilizers" },
    { id: "4", name: "Seeds" },
    { id: "5", name: "Equipment" },
  ];

  // Shop data
  const shopName = "Green Valley Farm";
  const shopLogo =
    "https://pub-79ee03a4a23e4dbbb70c7d799d3cb786.r2.dev/govishops/logos/ca894a7d-c384-4b69-92b5-f91b0ad9f71d.png";
  const branchCount = 3;

  // Product Categories data
  const productCategories: ProductCategory[] = [
    {
      id: "1",
      name: "Fresh Vegetables",
      image:
        "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=100&h=100&fit=crop",
      productCount: 45,
    },
    {
      id: "2",
      name: "Fresh Fruits",
      image:
        "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=100&h=100&fit=crop",
      productCount: 32,
    },
    {
      id: "3",
      name: "Organic Grains",
      image:
        "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=100&h=100&fit=crop",
      productCount: 28,
    },
    {
      id: "4",
      name: "Dairy Products",
      image:
        "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=100&h=100&fit=crop",
      productCount: 19,
    },
    {
      id: "5",
      name: "Spices & Herbs",
      image:
        "https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=100&h=100&fit=crop",
      productCount: 24,
    },
    {
      id: "6",
      name: "Organic Tea",
      image:
        "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=100&h=100&fit=crop",
      productCount: 15,
    },
  ];

  // Filter categories based on search query and selected filter
  const filteredCategories = productCategories.filter((category) => {
    const matchesSearch = category.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    
    // Apply filter logic based on selected filter
    if (selectedFilter === "All") return matchesSearch;
    if (selectedFilter === "Chemicals") {
      return matchesSearch && category.name.toLowerCase().includes("chemical");
    }
    if (selectedFilter === "Fertilizers") {
      return matchesSearch && category.name.toLowerCase().includes("fertilizer");
    }
    return matchesSearch;
  });

  const renderCategoryItem = ({ item }: { item: ProductCategory }) => (
    <TouchableOpacity
      onPress={() => {
        console.log("Category pressed:", item.name);
        // Navigate to category products screen
      }}
      className="flex-row items-center bg-white rounded-xl p-4 mb-3 border border-gray-100"
      style={{
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
      }}
      activeOpacity={0.7}
    >
      {/* Left side - Category Image */}
      <View className="w-24 h-24 rounded-lg bg-gray-100 mr-4 overflow-hidden">
        <Image
          source={{ uri: item.image }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      {/* Right side content */}
      <View className="flex-1 flex-row justify-between items-center">
        <View className="flex-1">
          {/* Category Name */}
          <Text className="text-base font-bold text-gray-800 mb-1">
            {item.name}
          </Text>
          {/* Product Count */}
          <Text className="text-sm text-gray-500">
            {item.productCount} Products
          </Text>
        </View>

        {/* Right arrow icon */}
        <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  const renderFilterButton = ({ item }: { item: FilterButton }) => (
    <TouchableOpacity
      onPress={() => setSelectedFilter(item.name)}
      className={`px-6 py-2 rounded-full mr-3 ${
        selectedFilter === item.name
          ? "bg-[#FF8000]"
          : "bg-white border border-[#7A9BC9]"
      }`}
      activeOpacity={0.8}
    >
      <Text
        className={`font-semibold ${
          selectedFilter === item.name ? "text-white" : "text-[#7A9BC9]"
        }`}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header Image */}
      <View className="absolute top-0 left-0 right-0 z-0">
        <Image
          source={require("@/assets/images/govi-shop/shop-profile-header.webp")}
          style={{
            width: screenWidth,
            height: 100,
          }}
          resizeMode="cover"
        />

        {/* Shop Logo (OVERLAP) */}
        <View
          style={{
            position: "absolute",
            bottom: -80,
            alignSelf: "center",
            zIndex: 10,
            elevation: 10,
          }}
        >
          <View className="w-32 h-32 bg-gray-100 overflow-hidden">
            <Image
              source={{ uri: shopLogo }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
        </View>
      </View>

      {/* Custom Header with transparent background */}
      <CustomHeader
        title=""
        showBackButton={true}
        navigation={navigation}
        transparent={true}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        style={{ marginTop: 130 }}
      >
        {/* Shop Info Section */}
        <View className="items-center pb-4 px-4 bg-white">
          {/* Shop Name */}
          <Text className="text-xl font-bold text-black mb-2">{shopName}</Text>

          {/* Branch Count */}
          <View className="flex-row items-center">
            <Text className="text-sm underline text-[#626786] ml-1">
              {branchCount} Branches
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </View>
        </View>

        {/* Search Section */}
        <View className="px-4 pt-4 pb-2 bg-white">
          <View className="bg-[#E8E9EDCC] rounded-full px-4 py-1 flex-row items-center">
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search Products..."
              placeholderTextColor="#373737"
              className="flex-1 ml-2 text-base text-gray-800 py-2"
            />
            {searchQuery.length === 0 ? (
              <Ionicons name="search-outline" size={20} color="#373737" />
            ) : (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#373737" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Filter Buttons - Horizontal Scroll */}
        <View className="px-4 pt-4 pb-2 bg-white">
          <FlatList
            data={filterButtons}
            renderItem={renderFilterButton}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          />
        </View>

        {/* Product Categories Section */}
        <View className="px-4 pt-2 bg-white">
          <FlatList
            data={filteredCategories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center py-10">
                <LottieView
                  source={require("@/assets/jsons/common/no-data.json")}
                  autoPlay
                  loop
                  style={{ width: 250, height: 250 }}
                />
                <Text className="text-[#7A9BC9] text-base mt-4 text-center">
                  {t("ExploreShops.NoProductsAvailable") ||
                    "No products available"}
                </Text>
              </View>
            }
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default GoviShopProfileScreen;