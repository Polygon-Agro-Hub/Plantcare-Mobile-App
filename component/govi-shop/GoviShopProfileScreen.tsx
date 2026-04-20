import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTranslation } from "react-i18next";
import { RootStackParamList } from "../types/types";
import CustomHeader from "../common/CustomHeader";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { environment } from "@/environment/environment";
import { RouteProp } from "@react-navigation/core";

const { width: screenWidth } = Dimensions.get("window");

type GoviShopProfileNavigationProp = StackNavigationProp<
  RootStackParamList,
  "GoviShopProfileScreen"
>;

type GoviShopProfileRouteProp = RouteProp<
  RootStackParamList,
  "GoviShopProfileScreen"
>;

interface GoviShopProfileProps {
  navigation: GoviShopProfileNavigationProp;
  route: GoviShopProfileRouteProp;
}

interface ProductCategory {
  id: string;
  name: string;
  image: string;
  productCount: number;
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
  availableQty?: number;
  description?: string;
}

interface SubProduct {
  id: string;
  label: string;
  price: number;
  discountPrice?: number;
}

interface FilterButton {
  id: string;
  name: string;
}

interface CartItem {
  productId: string;
  productName: string;
  subProductId: string;
  subProductLabel: string;
  price: number;
  quantity: number;
  image: string;
}

const CHIP_COLUMNS = 4;
const CHIP_GAP = 6;

const CARD_INNER_WIDTH = screenWidth - 32 - 28 - 2;
const CHIP_WIDTH =
  (CARD_INNER_WIDTH - CHIP_GAP * (CHIP_COLUMNS - 1)) / CHIP_COLUMNS;
const MAX_CHIP_ROWS = 3;
const MAX_CHIPS_VISIBLE = CHIP_COLUMNS * MAX_CHIP_ROWS;

const GoviShopProfileScreen: React.FC<GoviShopProfileProps> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const { shopId, branchId, shopname, logo, adress } = route.params;

  const DEFAULT_SUB_PRODUCTS: SubProduct[] = [
    { id: "default_25ml", label: "25 ml", price: 0 },
    { id: "default_100ml", label: "100 ml", price: 0 },
    { id: "default_500ml", label: "500 ml", price: 0 },
    { id: "default_1l", label: "1 L", price: 0 },
    { id: "default_2l", label: "2 L", price: 0 },
    { id: "default_5l", label: "5 L", price: 0 },
    { id: "default_10l", label: "10 L", price: 0 },
    { id: "default_20l", label: "20 L", price: 0 },
    { id: "default_25l", label: "25 L", price: 0 },
    { id: "default_30l", label: "30 L", price: 0 },
    { id: "default_50l", label: "50 L", price: 0 },
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const [filterButtons, setFilterButtons] = useState<FilterButton[]>([
    { id: "all", name: "All" },
  ]);

  const [expandedProductId, setExpandedProductId] = useState<string | null>(
    null,
  );
  const [subProducts, setSubProducts] = useState<Record<string, SubProduct[]>>(
    {},
  );
  const [subProductsLoading, setSubProductsLoading] = useState<
    Record<string, boolean>
  >({});
  const [selectedSubProductId, setSelectedSubProductId] = useState<
    Record<string, string>
  >({});

  const [showAllChips, setShowAllChips] = useState<Record<string, boolean>>({});

  const [cart, setCart] = useState<CartItem[]>([]);
  const [showViewCart, setShowViewCart] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      const response = await axios.get(
        `${environment.API_BASE_URL}api/govi-shop/branches/${branchId}/categories`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const fetchedCategories: ProductCategory[] = response.data.map(
        (cat: any) => ({
          id: String(cat.categoryId),
          name: cat.catName,
          image: cat.thumbnail ?? "",
          productCount: cat.productCount ?? 0,
        }),
      );

      setCategories(fetchedCategories);
      setFilterButtons([
        { id: "all", name: "All" },
        ...fetchedCategories.map((cat) => ({ id: cat.id, name: cat.name })),
      ]);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchProducts = async (categoryName = "All", search = "") => {
    try {
      setProductsLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      const selectedCategory =
        categoryName !== "All"
          ? categories.find((cat) => cat.name === categoryName)
          : null;

      const response = await axios.get(
        `${environment.API_BASE_URL}api/govi-shop/branches/${branchId}/products`,
        {
          params: { categoryId: selectedCategory?.id ?? "", search },
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const mappedProducts: Product[] = response.data.map((p: any) => ({
        id: String(p.productId),
        name: p.prodName,
        level: p.catName ?? "",
        unit: p.minQty
          ? `Min ${p.minQty} ${p.baseUom ?? ""}`.trim()
          : (p.baseUom ?? ""),
        normalPrice: p.normalPrice ?? 0,
        discountPrice: p.discountPrice ?? undefined,
        image: p.thumbnail ?? "",
        categoryId: String(p.categoryId),
        availableQty: p.maxQty ?? undefined,
        description: p.discription ?? "",
      }));

      setProducts(mappedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setProductsLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSubProducts = async (productId: string) => {
    try {
      setSubProductsLoading((prev) => ({ ...prev, [productId]: true }));
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      const response = await axios.get(
        `${environment.API_BASE_URL}api/govi-shop/products/${productId}/variants`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const mapped: SubProduct[] = response.data.map((v: any) => ({
        id: String(v.variantId),
        label: `${v.qty} ${v.uom ?? ""}`.trim(),
        price: v.normalPrice ?? 0,
        discountPrice: v.discountPrice ?? undefined,
      }));

      const finalSubs = mapped.length > 0 ? mapped : DEFAULT_SUB_PRODUCTS;

      setSubProducts((prev) => ({ ...prev, [productId]: finalSubs }));
      setSelectedSubProductId((prev) => ({
        ...prev,
        [productId]: finalSubs[0].id,
      }));
    } catch (error) {
      console.error("Error fetching sub-products:", error);
      setSubProducts((prev) => ({
        ...prev,
        [productId]: DEFAULT_SUB_PRODUCTS,
      }));
      setSelectedSubProductId((prev) => ({
        ...prev,
        [productId]: DEFAULT_SUB_PRODUCTS[0].id,
      }));
    } finally {
      setSubProductsLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handlePlusPress = (productId: string) => {
    if (expandedProductId === productId) {
      setExpandedProductId(null);
      setShowViewCart(false);
    } else {
      setExpandedProductId(productId);
      if (!subProducts[productId]) {
        fetchSubProducts(productId);
      }
    }
  };

  const getCartQty = (productId: string, subProductId: string): number => {
    const item = cart.find(
      (c) => c.productId === productId && c.subProductId === subProductId,
    );
    return item?.quantity ?? 0;
  };

  const addToCart = (product: Product, sub: SubProduct) => {
    setCart((prev) => {
      const exists = prev.find(
        (c) => c.productId === product.id && c.subProductId === sub.id,
      );
      if (exists) {
        return prev.map((c) =>
          c.productId === product.id && c.subProductId === sub.id
            ? { ...c, quantity: c.quantity + 1 }
            : c,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          subProductId: sub.id,
          subProductLabel: sub.label,
          price: sub.discountPrice ?? sub.price,
          quantity: 1,
          image: product.image,
        },
      ];
    });
  };

  const removeFromCart = (productId: string, subProductId: string) => {
    setCart((prev) => {
      const updated = prev
        .map((c) =>
          c.productId === productId && c.subProductId === subProductId
            ? { ...c, quantity: c.quantity - 1 }
            : c,
        )
        .filter((c) => c.quantity > 0);
      if (updated.length === 0) setShowViewCart(false);
      return updated;
    });
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts("All", "");
  }, [branchId]);

  useEffect(() => {
    setExpandedProductId(null);
    fetchProducts(selectedFilter, searchQuery);
  }, [selectedFilter]);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchProducts(selectedFilter, searchQuery);
    }, 500);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setExpandedProductId(null);
    fetchCategories();
    fetchProducts(selectedFilter, searchQuery);
  }, [selectedFilter, searchQuery]);

  const renderFilterButton = ({ item }: { item: FilterButton }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedFilter(item.name);
        setSearchQuery("");
      }}
      style={{
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: selectedFilter === item.name ? "#FF8000" : "#FFFFFF",
        borderWidth: 1,
        borderColor: selectedFilter === item.name ? "#FF8000" : "#7A9BC9",
      }}
      activeOpacity={0.8}
    >
      <Text
        style={{
          fontWeight: "600",
          fontSize: 13,
          color: selectedFilter === item.name ? "#FFFFFF" : "#7A9BC9",
        }}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }: { item: Product }) => {
    const isExpanded = expandedProductId === item.id;
    const subs = subProducts[item.id] ?? [];
    const isLoadingSubs = subProductsLoading[item.id] ?? false;
    const activeSubId = selectedSubProductId[item.id];
    const activeSub = subs.find((s) => s.id === activeSubId);
    const cartQty = activeSub ? getCartQty(item.id, activeSub.id) : 0;
    const inCart = cartQty > 0;
    const availableQty = item.availableQty;
    const isShowingAll = showAllChips[item.id] ?? false;

    const visibleSubs = isShowingAll ? subs : subs.slice(0, MAX_CHIPS_VISIBLE);
    const hasMore = subs.length > MAX_CHIPS_VISIBLE;

    return (
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          marginBottom: 14,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "#F0F0F0",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
          elevation: 4,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.97}
          onPress={() => {
            if (isExpanded) {
              setExpandedProductId(null);
            } else {
              navigation.navigate("ViewProduct" as any, {
                productId: item.id,
                productName: item.name,
                image: item.image,
                categoryId: item.categoryId,
                branchId,
                shopId,
              });
            }
          }}
        >
          <View
            style={{ flexDirection: "row", padding: 14, alignItems: "center" }}
          >
            <View
              style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
            >
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 12,
                  backgroundColor: "#F3F4F6",
                  marginRight: 12,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: "#F0F0F0",
                }}
              >
                <Image
                  source={{ uri: item.image }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              </View>

              <Text
                style={{
                  flex: 1,
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#111827",
                  lineHeight: 20,
                }}
                numberOfLines={2}
              >
                {item.name}
              </Text>
            </View>

            {!isExpanded && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  handlePlusPress(item.id);
                }}
                activeOpacity={0.8}
                style={{
                  backgroundColor: "#3F3C57",
                  borderRadius: 20,
                  padding: 5,
                  marginLeft: 10,
                  shadowColor: "#3F3C57",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 5,
                }}
              >
                <Ionicons name="add" size={22} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={{ paddingHorizontal: 14, paddingBottom: 14 }}>
            <View
              style={{
                height: 1,
                backgroundColor: "#F0F0F0",
                marginBottom: 12,
              }}
            />

            {isLoadingSubs ? (
              <ActivityIndicator
                size="small"
                color="#FF8000"
                style={{ marginVertical: 10 }}
              />
            ) : subs.length === 0 ? (
              <Text
                style={{
                  color: "#AAA",
                  fontSize: 13,
                  textAlign: "center",
                  paddingVertical: 8,
                }}
              >
                No variants available
              </Text>
            ) : (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    marginRight: -CHIP_GAP,
                    marginBottom: 4,
                  }}
                >
                  {visibleSubs.map((sub) => {
                    const isSelected = activeSubId === sub.id;
                    return (
                      <TouchableOpacity
                        key={sub.id}
                        onPress={() =>
                          setSelectedSubProductId((prev) => ({
                            ...prev,
                            [item.id]: sub.id,
                          }))
                        }
                        activeOpacity={0.7}
                        style={{
                          width: CHIP_WIDTH,
                          marginRight: CHIP_GAP,
                          marginBottom: CHIP_GAP,
                          paddingVertical: 7,
                          borderRadius: 20,
                          borderWidth: 1.5,
                          borderColor: isSelected ? "#FF8000" : "#E0E0E0",
                          backgroundColor: "#FFFFFF",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "600",
                            color: isSelected ? "#FF8000" : "#888888",
                          }}
                          numberOfLines={1}
                        >
                          {sub.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {activeSub && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 4,
                    }}
                  >
                    <View style={{ gap: 2 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <FontAwesome5 name="coins" size={14} color="black" />
                        <Text
                          style={{
                            color: "#FF8000",
                            fontWeight: "800",
                            fontSize: 16,
                            marginLeft: 5,
                          }}
                        >
                          Rs.{" "}
                          {(
                            activeSub.discountPrice ?? activeSub.price
                          ).toLocaleString("en-LK", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Text>
                      </View>

                      {activeSub.discountPrice !== undefined && (
                        <Text
                          style={{
                            color: "#AAAAAA",
                            fontSize: 11,
                            textDecorationLine: "line-through",
                          }}
                        >
                          Rs.{" "}
                          {activeSub.price.toLocaleString("en-LK", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Text>
                      )}

                      {availableQty !== undefined && (
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <Ionicons
                            name="information-circle-outline"
                            size={12}
                            color="#AAAAAA"
                          />
                          <Text style={{ color: "#AAAAAA", fontSize: 11 }}>
                            {availableQty} Left
                          </Text>
                        </View>
                      )}
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      {!inCart ? (
                        <TouchableOpacity
                          style={{
                            backgroundColor: "#3F3C57",
                            borderRadius: 25,
                            paddingHorizontal: 9,
                            paddingVertical: 9,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                          }}
                          onPress={() => addToCart(item, activeSub)}
                          activeOpacity={0.85}
                        >
                          <Ionicons name="add" size={18} color="white" />
                        </TouchableOpacity>
                      ) : (
                        <>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              backgroundColor: "#FF80001A",
                              borderRadius: 20,
                              borderWidth: 1,
                              borderColor: "#E8E8E8",
                              overflow: "hidden",
                            }}
                          >
                            <TouchableOpacity
                              onPress={() =>
                                removeFromCart(item.id, activeSub.id)
                              }
                              style={{
                                backgroundColor: "#FF8000",
                                width: 34,
                                height: 34,
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: 17,
                              }}
                            >
                              {cartQty === 1 ? (
                                <Ionicons
                                  name="trash-outline"
                                  size={16}
                                  color="white"
                                />
                              ) : (
                                <Ionicons
                                  name="remove"
                                  size={18}
                                  color="white"
                                />
                              )}
                            </TouchableOpacity>

                            <Text
                              style={{
                                paddingHorizontal: 12,
                                fontWeight: "700",
                                fontSize: 15,
                                color: "#3F3C57",
                                minWidth: 28,
                                textAlign: "center",
                              }}
                            >
                              {cartQty}
                            </Text>

                            <TouchableOpacity
                              onPress={() => addToCart(item, activeSub)}
                              style={{
                                backgroundColor: "#FF8000",
                                width: 34,
                                height: 34,
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: 17,
                              }}
                            >
                              <Ionicons name="add" size={18} color="white" />
                            </TouchableOpacity>
                          </View>

                          {!showViewCart && (
                            <TouchableOpacity
                              style={{
                                backgroundColor: "#3F3C57",
                                width: 36,
                                height: 36,
                                borderRadius: 18,
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              onPress={() => setShowViewCart(true)}
                              activeOpacity={0.85}
                            >
                              <Ionicons
                                name="cart-outline"
                                size={18}
                                color="white"
                              />
                            </TouchableOpacity>
                          )}
                        </>
                      )}
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View
        style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 0 }}
      >
        <Image
          source={require("@/assets/images/govi-shop/shop-profile-header.webp")}
          style={{ width: screenWidth, height: 100 }}
          resizeMode="cover"
        />
        <View
          style={{
            position: "absolute",
            bottom: -80,
            alignSelf: "center",
            zIndex: 10,
            elevation: 10,
          }}
        >
          <View
            style={{
              width: 128,
              height: 128,
              backgroundColor: "#F3F4F6",
              overflow: "hidden",
            }}
          >
            <Image
              source={{ uri: logo }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          </View>
        </View>
      </View>

      <CustomHeader
        title=""
        showBackButton={true}
        navigation={navigation}
        transparent={true}
      />

      <ScrollView
        style={{ flex: 1, marginTop: 130 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: showViewCart ? 100 : 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View
          style={{
            alignItems: "center",
            paddingBottom: 16,
            paddingHorizontal: 16,
            backgroundColor: "#FFFFFF",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: "#000000",
              marginBottom: 6,
            }}
          >
            {shopname}
          </Text>
          {adress ? (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="location" size={16} color="#FF0000" />
              <Text style={{ fontSize: 13, color: "#626786", marginLeft: 4 }}>
                {adress}
              </Text>
            </View>
          ) : null}
        </View>

        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 8,
            backgroundColor: "#FFFFFF",
          }}
        >
          <View
            style={{
              backgroundColor: "#E8E9EDCC",
              borderRadius: 28,
              paddingHorizontal: 16,
              paddingVertical: 4,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={`Search ${
                selectedFilter === "All" ? "" : selectedFilter + " "
              }Products...`}
              placeholderTextColor="#373737"
              style={{
                flex: 1,
                marginLeft: 8,
                fontSize: 15,
                color: "#1F2937",
                paddingVertical: 8,
                height: 48,
              }}
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

        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: 8,
            backgroundColor: "#FFFFFF",
          }}
        >
          {categoriesLoading ? (
            <ActivityIndicator size="small" color="#FF8000" />
          ) : (
            <FlatList
              data={filterButtons}
              renderItem={renderFilterButton}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}
            />
          )}
        </View>

        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 8,
            backgroundColor: "#FFFFFF",
          }}
        >
          {productsLoading ? (
            <View style={{ paddingVertical: 40, alignItems: "center" }}>
              <ActivityIndicator size="large" color="#FF8000" />
            </View>
          ) : (
            <FlatList
              data={products}
              renderItem={renderProductItem}
              keyExtractor={(item, index) =>
                item?.id?.toString() ?? index.toString()
              }
              scrollEnabled={false}
              ListEmptyComponent={
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingVertical: 40,
                  }}
                >
                  <LottieView
                    source={require("@/assets/jsons/common/no-data.json")}
                    autoPlay
                    loop
                    style={{ width: 250, height: 250 }}
                  />
                  <Text
                    style={{
                      color: "#7A9BC9",
                      fontSize: 15,
                      marginTop: 16,
                      textAlign: "center",
                    }}
                  >
                    {searchQuery
                      ? `No results for "${searchQuery}"`
                      : `No ${
                          selectedFilter === "All" ? "" : selectedFilter + " "
                        }products available`}
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </ScrollView>

      {showViewCart && cartCount > 0 && (
        <View
          style={{
            position: "absolute",
            bottom: 100,
            left: "25%",
            right: "25%",
            zIndex: 999,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate("CartScreen" as any)}
            activeOpacity={0.9}
            style={{
              backgroundColor: "#FF8000CC",
              borderRadius: 50,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 14,
              paddingHorizontal: 20,
              shadowColor: "#3F3C57",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 10,
            }}
          >
            <View style={{ flexDirection: "column" }}>
              <Text
                style={{
                  color: "white",
                  fontWeight: "700",
                  fontSize: 15,
                  letterSpacing: 0.3,
                }}
              >
                View Cart
              </Text>
              <Text style={{ color: "white", fontSize: 12, opacity: 0.85 }}>
                {cartCount} {cartCount === 1 ? "item" : "items"}
              </Text>
            </View>

            <View
              style={{
                height: 40,
                width: 40,
                backgroundColor: "white",
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="chevron-forward" size={20} color="#FF8000" />
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default GoviShopProfileScreen;
