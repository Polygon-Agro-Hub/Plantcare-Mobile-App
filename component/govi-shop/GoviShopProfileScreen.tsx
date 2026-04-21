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
  baseUom: string;
  minQtyRaw?: string;
  minQtyUom?: string;
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
  colorCode?: string;
  colors?: string[];
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

type UomDisplayMode = "DEFAULT" | "LOOSE" | "ROLL" | "COLOR" | "EQUIPMENT";

type LooseState = "collapsed" | "preview" | "active";

const getDisplayMode = (baseUom: string): UomDisplayMode => {
  const u = baseUom.toLowerCase();
  if (u.includes("loose")) return "LOOSE";
  if (u.includes("roll")) return "ROLL";
  if (u.includes("piece")) return "COLOR";
  if (u.includes("equipment")) return "EQUIPMENT";
  return "DEFAULT";
};

const resolveColor = (raw: string): string => {
  if (!raw) return "#CCCCCC";
  const trimmed = raw.trim();
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
};

const CARD_H_PADDING = 14;
const CARD_INNER_WIDTH = screenWidth - 32 - CARD_H_PADDING * 2;
const ROLL_GAP = 8;
const ROLL_CHIP_WIDTH = (CARD_INNER_WIDTH - ROLL_GAP) / 2;
const CHIP_COLUMNS = 4;
const CHIP_GAP = 6;
const CHIP_WIDTH =
  (CARD_INNER_WIDTH - CHIP_GAP * (CHIP_COLUMNS - 1)) / CHIP_COLUMNS;
const MAX_CHIP_ROWS = 3;
const MAX_CHIPS_VISIBLE = CHIP_COLUMNS * MAX_CHIP_ROWS;
const COLOR_DOT_SIZE = 34;
const COLOR_DOT_GAP = 8;

const GoviShopProfileScreen: React.FC<GoviShopProfileProps> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const { shopId, branchId, shopname, logo, adress } = route.params;

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

  const [looseStateMap, setLooseStateMap] = useState<
    Record<string, LooseState>
  >({});

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
        baseUom: p.baseUom ?? "",
        minQtyRaw: p.minQty ? String(p.minQty) : undefined,
        minQtyUom: p.uom ?? "",
        unit: p.minQty
          ? `Min ${p.minQty} ${p.uom ?? p.baseUom ?? ""}`.trim()
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

  const fetchSubProducts = async (
    productId: string,
    baseUom: string,
  ): Promise<SubProduct[]> => {
    try {
      setSubProductsLoading((prev) => ({ ...prev, [productId]: true }));
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return [];
      const response = await axios.get(
        `${environment.API_BASE_URL}api/govi-shop/products/${productId}/variants`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const mode = getDisplayMode(baseUom);
      const mapped: SubProduct[] = response.data.map((v: any) => {
        let label = "";
        if (mode === "ROLL") {
          const w = v.width != null ? parseFloat(String(v.width)) : "";
          const h = v.height != null ? parseFloat(String(v.height)) : "";
          const uom = v.uom ?? "m";
          label =
            w !== "" && h !== ""
              ? `${w} x ${h} ${uom}`.trim()
              : `${w || h} ${uom}`.trim();
        } else if (mode === "COLOR") {
          const qty = v.qty ?? 1;
          label = `${qty} ${qty === 1 ? "pc" : "pcs"}`;
        } else if (mode === "EQUIPMENT") {
          label = v.color ?? v.colorCode ?? "";
        } else {
          label = `${v.qty ?? ""} ${v.uom ?? ""}`.trim();
        }
        return {
          id: String(v.variantId),
          label,
          price: v.normalPrice ?? 0,
          discountPrice: v.discountPrice ?? undefined,
          colorCode: v.colorCode ?? v.color ?? undefined,
          colors: Array.isArray(v.colors) ? v.colors : undefined,
        };
      });
      setSubProducts((prev) => ({ ...prev, [productId]: mapped }));
      if (mapped.length > 0) {
        const firstSelectable =
          mode === "EQUIPMENT"
            ? (mapped.find((s) => s.colorCode && s.colorCode.trim()) ??
              mapped[0])
            : mapped[0];
        setSelectedSubProductId((prev) => ({
          ...prev,
          [productId]: firstSelectable.id,
        }));
      }
      return mapped;
    } catch (error) {
      console.error("Error fetching sub-products:", error);
      setSubProducts((prev) => ({ ...prev, [productId]: [] }));
      return [];
    } finally {
      setSubProductsLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const getCartQty = (productId: string, subProductId: string): number =>
    cart.find(
      (c) => c.productId === productId && c.subProductId === subProductId,
    )?.quantity ?? 0;

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
    const existingItem = cart.find(
      (c) => c.productId === productId && c.subProductId === subProductId,
    );
    if (existingItem && existingItem.quantity === 1) {
      setLooseStateMap((prev) => ({ ...prev, [productId]: "preview" }));
    }
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

  const handleLoosePlusPress = async (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const currentState = looseStateMap[productId] ?? "collapsed";

    if (currentState === "collapsed") {
      setLooseStateMap((prev) => ({ ...prev, [productId]: "preview" }));
      if (!subProducts[productId]) {
        fetchSubProducts(productId, product.baseUom);
      }
    } else if (currentState === "preview") {
      let subs = subProducts[productId];
      if (!subs || subs.length === 0) {
        subs = await fetchSubProducts(productId, product.baseUom);
      }
      if (subs.length > 0) {
        const firstSub = subs[0];
        setSelectedSubProductId((prev) => ({
          ...prev,
          [productId]: firstSub.id,
        }));
        addToCart(product, firstSub);
        setLooseStateMap((prev) => ({ ...prev, [productId]: "active" }));
      }
    } else {
      const subs = subProducts[productId];
      if (subs && subs.length > 0) {
        const activeSub =
          subs.find((s) => s.id === selectedSubProductId[productId]) ?? subs[0];
        addToCart(product, activeSub);
      }
    }
  };

  const handleNonLoosePlusPress = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    if (expandedProductId === productId) {
      setExpandedProductId(null);
    } else {
      setExpandedProductId(productId);
      if (!subProducts[productId]) {
        fetchSubProducts(productId, product.baseUom);
      }
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts("All", "");
  }, [branchId]);

  useEffect(() => {
    setExpandedProductId(null);
    setLooseStateMap({});
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
    setLooseStateMap({});
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

  const renderChips = (
    item: Product,
    subs: SubProduct[],
    activeSubId: string | undefined,
    displayMode: UomDisplayMode,
  ) => {
    const isShowingAll = showAllChips[item.id] ?? false;
    const visibleSubs = isShowingAll ? subs : subs.slice(0, MAX_CHIPS_VISIBLE);
    const hasMore = subs.length > MAX_CHIPS_VISIBLE;

    if (displayMode === "EQUIPMENT") {
      const coloredSubs = subs.filter((s) => s.colorCode && s.colorCode.trim());
      if (coloredSubs.length === 0) return null;
      return (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: COLOR_DOT_GAP,
            marginBottom: 12,
          }}
        >
          {coloredSubs.map((sub) => {
            const hex = resolveColor(sub.colorCode!);
            const isWhite = hex.toLowerCase() === "#ffffff";
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
                  width: COLOR_DOT_SIZE,
                  height: COLOR_DOT_SIZE,
                  borderRadius: COLOR_DOT_SIZE / 2,
                  backgroundColor: hex,
                  borderWidth: isSelected ? 3 : 1.5,
                  borderColor: isSelected
                    ? "#FF8000"
                    : isWhite
                      ? "#E0E0E0"
                      : "transparent",
                  shadowColor: isSelected ? "#FF8000" : "transparent",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: isSelected ? 0.45 : 0,
                  shadowRadius: 4,
                  elevation: isSelected ? 4 : 0,
                }}
              />
            );
          })}
        </View>
      );
    }

    if (displayMode === "COLOR") {
      const activeSub = subs.find((s) => s.id === activeSubId);
      const dotColors: string[] =
        activeSub?.colors && activeSub.colors.length > 0
          ? activeSub.colors
          : activeSub?.colorCode
            ? [activeSub.colorCode]
            : [];
      return (
        <>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: CHIP_GAP,
              marginBottom: dotColors.length > 0 ? 10 : 4,
            }}
          >
            {subs.map((sub) => {
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
                    paddingHorizontal: 18,
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
                      fontSize: 13,
                      fontWeight: "600",
                      color: isSelected ? "#FF8000" : "#888888",
                    }}
                  >
                    {sub.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {dotColors.length > 0 && (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: COLOR_DOT_GAP,
                marginBottom: 8,
              }}
            >
              {dotColors.map((rawColor, index) => {
                const hex = resolveColor(rawColor);
                const isWhite = hex.toLowerCase() === "#ffffff";
                return (
                  <View
                    key={index}
                    style={{
                      width: COLOR_DOT_SIZE,
                      height: COLOR_DOT_SIZE,
                      borderRadius: COLOR_DOT_SIZE / 2,
                      backgroundColor: hex,
                      borderWidth: 1.5,
                      borderColor: isWhite ? "#E0E0E0" : "transparent",
                    }}
                  />
                );
              })}
            </View>
          )}
        </>
      );
    }

    if (displayMode === "ROLL") {
      return (
        <>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: ROLL_GAP,
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
                    width: ROLL_CHIP_WIDTH,
                    paddingVertical: 9,
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
                      fontSize: 13,
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
          {hasMore && !isShowingAll && (
            <TouchableOpacity
              onPress={() =>
                setShowAllChips((prev) => ({ ...prev, [item.id]: true }))
              }
            >
              <Text style={{ color: "#FF8000", fontSize: 12, marginBottom: 6 }}>
                +{subs.length - MAX_CHIPS_VISIBLE} more
              </Text>
            </TouchableOpacity>
          )}
        </>
      );
    }

    return (
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
        {hasMore && !isShowingAll && (
          <TouchableOpacity
            onPress={() =>
              setShowAllChips((prev) => ({ ...prev, [item.id]: true }))
            }
          >
            <Text style={{ color: "#FF8000", fontSize: 12, marginBottom: 6 }}>
              +{subs.length - MAX_CHIPS_VISIBLE} more
            </Text>
          </TouchableOpacity>
        )}
      </>
    );
  };

  const renderPriceActionRow = (
    item: Product,
    activeSub: SubProduct,
    cartQty: number,
  ) => {
    const displayPrice =
      activeSub.discountPrice ??
      activeSub.price ??
      item.discountPrice ??
      item.normalPrice;
    const originalPrice =
      activeSub.discountPrice || item.discountPrice
        ? activeSub.price || item.normalPrice
        : null;
    const availableQty = item.availableQty;

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 4,
        }}
      >
        <View style={{ gap: 2 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
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
              {displayPrice.toLocaleString("en-LK", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            {originalPrice && (
              <Text
                style={{
                  color: "#AAAAAA",
                  fontSize: 11,
                  textDecorationLine: "line-through",
                  marginLeft: 6,
                }}
              >
                Rs.{" "}
                {originalPrice.toLocaleString("en-LK", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            )}
          </View>
          {availableQty !== undefined && (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
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

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {cartQty === 0 ? (
            <TouchableOpacity
              onPress={() => addToCart(item, activeSub)}
              activeOpacity={0.85}
              style={{
                backgroundColor: "#3F3C57",
                borderRadius: 20,
                padding: 8,
                shadowColor: "#3F3C57",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              <Ionicons name="add" size={20} color="white" />
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
                  onPress={() => removeFromCart(item.id, activeSub.id)}
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
                    <Ionicons name="trash-outline" size={16} color="white" />
                  ) : (
                    <Ionicons name="remove" size={18} color="white" />
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
                  <Ionicons name="cart-outline" size={18} color="white" />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    );
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    const displayMode = getDisplayMode(item.baseUom);
    const isLoose = displayMode === "LOOSE";
    const looseState = looseStateMap[item.id] ?? "collapsed";
    const isExpanded = expandedProductId === item.id;

    const subs = subProducts[item.id] ?? [];
    const isLoadingSubs = subProductsLoading[item.id] ?? false;
    const activeSubId = selectedSubProductId[item.id];

    const activeSub =
      displayMode === "EQUIPMENT"
        ? subs
            .filter((s) => s.colorCode && s.colorCode.trim())
            .find((s) => s.id === activeSubId)
        : subs.find((s) => s.id === activeSubId);

    const cartQty = activeSub ? getCartQty(item.id, activeSub.id) : 0;

    const looseSubtitle =
      isLoose && item.minQtyRaw
        ? `${item.minQtyRaw}${item.minQtyUom ? ` ${item.minQtyUom}` : ""} – By ${item.baseUom}`
            .replace(/\s+/g, " ")
            .trim()
        : null;

    const previewPrice = item.discountPrice ?? item.normalPrice;
    const previewOriginalPrice = item.discountPrice ? item.normalPrice : null;

    const showImageInHeader = isLoose
      ? looseState === "collapsed"
      : !isExpanded;

    const showTopRightPlus = isLoose ? looseState === "collapsed" : !isExpanded;

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
          activeOpacity={isLoose || isExpanded ? 1 : 0.97}
          onPress={() => {
            if (!isLoose && !isExpanded) {
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
            style={{
              flexDirection: "row",
              padding: CARD_H_PADDING,
              alignItems: "center",
            }}
          >
            {showImageInHeader && (
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
            )}

            <View style={{ flex: 1 }}>
              <Text
                style={{
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

            {showTopRightPlus && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  isLoose
                    ? handleLoosePlusPress(item.id)
                    : handleNonLoosePlusPress(item.id);
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

        {isLoose && looseState === "preview" && (
          <View
            style={{
              paddingHorizontal: CARD_H_PADDING,
              paddingBottom: CARD_H_PADDING,
            }}
          >
            <View
              style={{
                height: 1,
                backgroundColor: "#F0F0F0",
                marginBottom: 12,
              }}
            />

            {looseSubtitle && (
              <Text
                style={{
                  fontSize: 13,
                  color: "#8A94A6",
                  fontWeight: "500",
                  marginBottom: 10,
                }}
              >
                {looseSubtitle}
              </Text>
            )}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
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
                  {previewPrice.toLocaleString("en-LK", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
                {previewOriginalPrice && (
                  <Text
                    style={{
                      color: "#AAAAAA",
                      fontSize: 11,
                      textDecorationLine: "line-through",
                      marginLeft: 6,
                    }}
                  >
                    Rs.{" "}
                    {previewOriginalPrice.toLocaleString("en-LK", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                onPress={() => handleLoosePlusPress(item.id)}
                activeOpacity={0.8}
                style={{
                  backgroundColor: "#3F3C57",
                  borderRadius: 20,
                  padding: 5,
                  shadowColor: "#3F3C57",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 5,
                }}
              >
                <Ionicons name="add" size={22} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isLoose && looseState === "active" && (
          <View
            style={{
              paddingHorizontal: CARD_H_PADDING,
              paddingBottom: CARD_H_PADDING,
            }}
          >
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
            ) : (
              <>
                {activeSub && (
                  <View style={{ marginBottom: 10 }}>
                    <View
                      style={{
                        alignSelf: "flex-start",
                        paddingHorizontal: 14,
                        paddingVertical: 6,
                        borderRadius: 20,
                        borderWidth: 1.5,
                        borderColor: "#FF8000",
                      }}
                    >
                      <Text
                        style={{
                          color: "#FF8000",
                          fontWeight: "700",
                          fontSize: 13,
                        }}
                      >
                        {activeSub.label}
                        {cartQty > 0 ? ` X ${cartQty}` : ""}
                      </Text>
                    </View>
                  </View>
                )}

                {activeSub && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
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
                            activeSub.discountPrice ??
                            activeSub.price ??
                            item.discountPrice ??
                            item.normalPrice
                          ).toLocaleString("en-LK", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Text>
                      </View>
                      {(activeSub.discountPrice || item.discountPrice) && (
                        <Text
                          style={{
                            color: "#AAAAAA",
                            fontSize: 11,
                            textDecorationLine: "line-through",
                          }}
                        >
                          Rs.{" "}
                          {(activeSub.price || item.normalPrice).toLocaleString(
                            "en-LK",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          )}
                        </Text>
                      )}
                      {item.availableQty !== undefined && (
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
                            {item.availableQty} Left
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
                          onPress={() => removeFromCart(item.id, activeSub.id)}
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
                            <Ionicons name="remove" size={18} color="white" />
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
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        )}

        {!isLoose && isExpanded && (
          <View
            style={{
              paddingHorizontal: CARD_H_PADDING,
              paddingBottom: CARD_H_PADDING,
            }}
          >
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
                {renderChips(item, subs, activeSubId, displayMode)}
                {activeSub && renderPriceActionRow(item, activeSub, cartQty)}
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
