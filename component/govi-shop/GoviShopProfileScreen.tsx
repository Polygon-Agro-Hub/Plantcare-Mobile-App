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

interface Product {
  id: string;
  name: string;
  level: string;
  unit: string;
  discountPrice?: number;
  normalPrice: number;
  image: string;
  categoryId: string;
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

  // Shop address
  const shopAddress = "11/A, Galle Road, Bambalapitiya";
  const shopDistrict = "Bambalapitiya";

  // Product Categories data
  const productCategories: ProductCategory[] = [
    {
      id: "1",
      name: "Chemicals",
      image:
        "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=200&h=200&fit=crop",
      productCount: 8,
    },
    {
      id: "2",
      name: "Fertilizers",
      image:
        "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=200&h=200&fit=crop",
      productCount: 6,
    },
    {
      id: "3",
      name: "Seeds",
      image:
        "https://images.unsplash.com/photo-1592417817098-8fd3d9db67b6?w=200&h=200&fit=crop",
      productCount: 12,
    },
    {
      id: "4",
      name: "Equipment",
      image:
        "https://images.unsplash.com/photo-1592982537447-6f2a6a0c7f5c?w=200&h=200&fit=crop",
      productCount: 9,
    },
  ];

  // Products data linked to categories
  const products: Product[] = [
    // Chemicals Products
    {
      id: "1",
      name: "Chlorine",
      level: "Professional Grade",
      unit: "20 ml Bottle",
      discountPrice: 10000.0,
      normalPrice: 12000.0,
      image:
        "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=200&h=200&fit=crop",
      categoryId: "1",
    },
    {
      id: "2",
      name: "Herbicide",
      level: "Industrial Grade",
      unit: "Min 2 L - By Volume",
      normalPrice: 2500.0,
      image:
        "https://images.unsplash.com/photo-1531674250511-9c7e9e2c7c3a?w=200&h=200&fit=crop",
      categoryId: "1",
    },
    {
      id: "3",
      name: "Pesticide",
      level: "Organic",
      unit: "Min 1 L - By Volume",
      discountPrice: 3200.0,
      normalPrice: 4000.0,
      image:
        "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=200&h=200&fit=crop",
      categoryId: "1",
    },
    // Fertilizers Products
    {
      id: "4",
      name: "Organic Fertilizer",
      level: "Premium Quality",
      unit: "Min 1 kg - By Weight",
      discountPrice: 850.0,
      normalPrice: 1000.0,
      image:
        "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=200&h=200&fit=crop",
      categoryId: "2",
    },
    {
      id: "5",
      name: "Urea Fertilizer",
      level: "High Grade",
      unit: "Min 5 kg - By Weight",
      discountPrice: 1600.0,
      normalPrice: 1800.0,
      image:
        "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=200&h=200&fit=crop",
      categoryId: "2",
    },
    {
      id: "6",
      name: "NPK Fertilizer",
      level: "Balanced",
      unit: "Min 2 kg - By Weight",
      normalPrice: 1200.0,
      image:
        "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=200&h=200&fit=crop",
      categoryId: "2",
    },
    // Seeds Products
    {
      id: "7",
      name: "Tomato Seeds",
      level: "Hybrid",
      unit: "500g Pack",
      discountPrice: 450.0,
      normalPrice: 600.0,
      image:
        "https://images.unsplash.com/photo-1592417817098-8fd3d9db67b6?w=200&h=200&fit=crop",
      categoryId: "3",
    },
    {
      id: "8",
      name: "Cucumber Seeds",
      level: "Premium",
      unit: "250g Pack",
      normalPrice: 350.0,
      image:
        "https://images.unsplash.com/photo-1592417817098-8fd3d9db67b6?w=200&h=200&fit=crop",
      categoryId: "3",
    },
    {
      id: "9",
      name: "Carrot Seeds",
      level: "Organic",
      unit: "100g Pack",
      discountPrice: 280.0,
      normalPrice: 350.0,
      image:
        "https://images.unsplash.com/photo-1592417817098-8fd3d9db67b6?w=200&h=200&fit=crop",
      categoryId: "3",
    },
    // Equipment Products
    {
      id: "10",
      name: "Tractor",
      level: "Heavy Duty",
      unit: "Per Day Rental",
      discountPrice: 5000.0,
      normalPrice: 6500.0,
      image:
        "https://images.unsplash.com/photo-1592982537447-6f2a6a0c7f5c?w=200&h=200&fit=crop",
      categoryId: "4",
    },
    {
      id: "11",
      name: "Water Pump",
      level: "Industrial",
      unit: "Min 1 unit",
      normalPrice: 15000.0,
      image:
        "https://images.unsplash.com/photo-1592982537447-6f2a6a0c7f5c?w=200&h=200&fit=crop",
      categoryId: "4",
    },
    {
      id: "12",
      name: "Sprayer",
      level: "Professional",
      unit: "16 L Capacity",
      discountPrice: 3500.0,
      normalPrice: 4500.0,
      image:
        "https://images.unsplash.com/photo-1592982537447-6f2a6a0c7f5c?w=200&h=200&fit=crop",
      categoryId: "4",
    },
  ];

  // Filter categories based on search query (when "All" is selected)
  const getFilteredCategories = () => {
    if (searchQuery) {
      return productCategories.filter((category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return productCategories;
  };

  // Get products for selected filter
  const getFilteredProducts = () => {
    let filteredProducts = products;

    if (selectedFilter !== "All") {
      // Find category id that matches the filter name
      const category = productCategories.find(
        (cat) => cat.name === selectedFilter,
      );
      if (category) {
        filteredProducts = filteredProducts.filter(
          (product) => product.categoryId === category.id,
        );
      }
    }

    if (searchQuery) {
      filteredProducts = filteredProducts.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return filteredProducts;
  };

  // Handle category click from "All" section
  const handleCategoryPress = (categoryName: string) => {
    setSelectedFilter(categoryName);
    setSearchQuery(""); // Clear search when changing to products view
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      className="bg-white rounded-xl mb-4 border border-gray-100 overflow-hidden"
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
      onPress={() => {
        console.log("Product pressed:", item.name);
        // Navigate to product detail screen
      }}
    >
      <View className="flex-row p-4">
        {/* Product Image */}
        <View className="w-24 h-24 rounded-lg bg-gray-100 mr-4 overflow-hidden">
          <Image
            source={{ uri: item.image }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        {/* Product Details */}
        <View className="flex-1 pr-8">
          {/* Product Name */}
          <Text className="text-base font-bold text-black mb-1">
            {item.name}
          </Text>

          {/* Level */}
          <Text className="text-xs text-[#2E2E2E] mb-1">{item.unit}</Text>

          {/* Price Section */}
          <View className="flex">
            {item.discountPrice ? (
              <>
                <Text className="text-lg font-bold text-[#FF8000] mr-2">
                  Rs. {item.discountPrice.toFixed(2)}
                </Text>
                <Text className="text-sm text-[#2E2E2E] line-through">
                  Rs. {item.normalPrice.toFixed(2)}
                </Text>
              </>
            ) : (
              <Text className="text-lg font-bold text-[#FF8000]">
                Rs. {item.normalPrice.toFixed(2)}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Add Button */}
      <TouchableOpacity
        className="absolute bottom-2 right-2 bg-[#3F3C57] rounded-full p-2"
        style={{
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
        onPress={() => {
          console.log("Add to cart:", item.name);
          // Add to cart logic here
        }}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }: { item: ProductCategory }) => (
    <TouchableOpacity
      onPress={() => handleCategoryPress(item.name)}
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
      onPress={() => {
        setSelectedFilter(item.name);
        setSearchQuery(""); // Clear search when changing filters
      }}
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

  const filteredCategories = getFilteredCategories();
  const filteredProducts = getFilteredProducts();

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
        rightComponent={
          <TouchableOpacity
            onPress={() => navigation.navigate("GoviShopCartScreen" as any)}
            className="bg-[#3F3C57] rounded-full p-2"
          >
            <View className="flex-row items-center gap-2 px-3 py-1">
              <Ionicons name="bag-handle" size={20} color="white" />
              <Text className="text-white text-xs font-bold">1</Text>
            </View>
          </TouchableOpacity>
        }
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

          {/* Address Section */}
          <View className="flex-row items-center">
            <Ionicons name="location" size={16} color="#FF0000" />
            <Text className="text-sm text-[#626786] ml-1">{shopDistrict}</Text>
          </View>

          <View className="flex-row items-center mt-1">
            <Text className="text-sm text-[#626786]">{shopAddress}</Text>
          </View>
        </View>

        {/* Search Section */}
        <View className="px-4 pb-2 bg-white">
          <View className="bg-[#E8E9EDCC] rounded-full px-4 py-1 flex-row items-center">
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={
                selectedFilter === "All"
                  ? "Search Categories..."
                  : `Search ${selectedFilter} Products...`
              }
              placeholderTextColor="#373737"
              className="flex-1 ml-2 text-base text-gray-800 py-2 h-12"
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

        {/* Filter Buttons - Horizontal Scroll */}
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

        {/* Content Section - Categories or Products */}
        <View className="px-4 pt-2 bg-white">
          {selectedFilter === "All" ? (
            // Show Categories when "All" is selected
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
                    {t("ExploreShops.NoCategoriesAvailable") ||
                      "No categories available"}
                  </Text>
                </View>
              }
            />
          ) : (
            // Show Products when filter is Chemicals, Fertilizers, Seeds, or Equipment
            <>
              <FlatList
                data={filteredProducts}
                renderItem={renderProductItem}
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
                      No {selectedFilter} products available
                    </Text>
                  </View>
                }
              />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default GoviShopProfileScreen;
