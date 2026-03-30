import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTranslation } from "react-i18next";
import { RootStackParamList } from "../types/types";
import CustomHeader from "../common/CustomHeader";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";

type ExploreShopsNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ExploreShopsScreen"
>;

interface ExploreShopsProps {
  navigation: ExploreShopsNavigationProp;
}

interface Shop {
  id: string;
  name: string;
  logo: string;
  productCount: number;
}

const ExploreShopsScreen: React.FC<ExploreShopsProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(3); // Example cart count, you can manage this dynamically

  // Temporary shop data
  const shops: Shop[] = [
    {
      id: "1",
      name: "Green Valley Farm",
      logo: "https://pub-79ee03a4a23e4dbbb70c7d799d3cb786.r2.dev/govishops/logos/ca894a7d-c384-4b69-92b5-f91b0ad9f71d.png",
      productCount: 24,
    },
    {
      id: "2",
      name: "Fresh Harvest Store",
      logo: "https://thumbs.dreamstime.com/b/elite-thief-gaming-logo-e-sport-apparel-mechandise-jersey-any-142368426.jpg",
      productCount: 18,
    },
    {
      id: "3",
      name: "Organic Market",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuO7Ak-bR5Dmfm2y6AaATrYU89c2tcb18P8A&s",
      productCount: 32,
    },
    {
      id: "4",
      name: "Nature's Basket",
      logo: "https://img.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg?semt=ais_hybrid&w=740&q=80",
      productCount: 15,
    },
    {
      id: "5",
      name: "Agro Fresh",
      logo: "https://pub-79ee03a4a23e4dbbb70c7d799d3cb786.r2.dev/govishops/logos/ca894a7d-c384-4b69-92b5-f91b0ad9f71d.png",
      productCount: 27,
    },
    {
      id: "6",
      name: "Nature's Basket",
      logo: "https://img.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg?semt=ais_hybrid&w=740&q=80",
      productCount: 15,
    },
    {
      id: "7",
      name: "Agro Fresh",
      logo: "https://pub-79ee03a4a23e4dbbb70c7d799d3cb786.r2.dev/govishops/logos/ca894a7d-c384-4b69-92b5-f91b0ad9f71d.png",
      productCount: 27,
    },
  ];

  // Filter shops based on search query
  const filteredShops = shops.filter((shop) =>
    shop.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderShopItem = ({ item }: { item: Shop }) => (
    <TouchableOpacity
      onPress={() => {
        // Navigate to shop details
        console.log("Shop pressed:", item.name);
        navigation.navigate("GoviShopProfileScreen" as any);
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
      {/* Left side - Shop Logo */}
      <View className="w-24 h-24 rounded-lg bg-gray-100 mr-4 overflow-hidden">
        <Image
          source={{ uri: item.logo }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      {/* Right side content */}
      <View className="flex-1 flex-row justify-between items-center">
        <View className="flex-1">
          {/* Shop Name */}
          <Text className="text-base font-bold text-gray-800 mb-1">
            {item.name}
          </Text>
          {/* Product Count */}
          <Text className="text-sm text-gray-500">
            {item.productCount} {t("ExploreShops.Products") || "Products"}
          </Text>
        </View>

        {/* Right arrow icon */}
        <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      <CustomHeader
        title={t("ExploreShops.Title") || "Explore Shops"}
        showBackButton={true}
        navigation={navigation}
        rightComponent={
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("GoviShopCartScreen" as any);
            }}
            className="bg-[#3F3C57] rounded-full p-2"
          >
            <View className="flex-row items-center gap-2 px-3 py-1">
              <Ionicons name="bag-handle" size={20} color="white" />
              {cartCount > 0 && (
                <Text className="text-white text-xs font-bold">
                  {cartCount}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        }
      />

      <View className="flex-1 px-4 pt-4">
        {/* Search Bar */}
        <View className="bg-[#E8E9EDCC] rounded-full px-4 py-1 mb-4 flex-row items-center shadow-sm">
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={
              t("ExploreShops.SearchPlaceholder") ||
              "Search Shops / Products..."
            }
            placeholderTextColor="#373737"
            className="flex-1 ml-2 text-base text-gray-800"
          />

          {searchQuery.length === 0 ? (
            <Ionicons name="search-outline" size={20} color="#373737" />
          ) : (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#373737" />
            </TouchableOpacity>
          )}
        </View>

        {/* Shop List */}
        <FlatList
          data={filteredShops}
          renderItem={renderShopItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-10">
              <LottieView
                source={require("@/assets/jsons/common/no-data.json")}
                autoPlay
                loop
                style={{ width: 250, height: 250 }}
              />
              <Text className="text-[#7A9BC9] text-base mt-4 text-center">
                {t("ExploreShops.NoShopsFound") || "No shops found"}
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

export default ExploreShopsScreen;
