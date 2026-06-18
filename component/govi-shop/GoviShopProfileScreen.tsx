import React, { useCallback, useEffect, useRef, useState } from "react";
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
  Modal,
  Alert,
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
import { useFocusEffect } from "@react-navigation/native";

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

interface ColorDetail {
  colorId: number;
  color: string;
  normalPrice: number;
  discountPrice?: number;
  availableQty: number;
  batches?: Batch[];
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
  searchKeyWord?: string;
}
interface Batch {
  qty: number;
  salePrice: number;
  originalPrice: number | null;
}
interface SubProduct {
  id: string;
  label: string;
  price: number;
  discountPrice?: number;
  colorCode?: string;
  colors?: string[];
  availableQty?: number;
  isMRP?: number;
  batches?: Batch[];
  colorDetails?: ColorDetail[];
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

const UNIT_TO_BASE: Record<string, number> = {
  g: 1,
  kg: 1000,
  ml: 1,
  l: 1000,
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,
  pc: 1,
  pcs: 1,
};

const parseVariantQty = (label: string): number => {
  if (!label) return 0;
  const rollMatch = label.match(/^([\d.]+)\s*x\s*([\d.]+)\s*(\w+)?$/i);
  if (rollMatch) {
    const w = parseFloat(rollMatch[1]);
    const h = parseFloat(rollMatch[2]);
    const unit = (rollMatch[3] ?? "").toLowerCase();
    const multiplier = UNIT_TO_BASE[unit] ?? 1;
    return w * h * multiplier;
  }
  const match = label.match(/^([\d.]+)\s*(\w+)?$/i);
  if (match) {
    const qty = parseFloat(match[1]);
    const unit = (match[2] ?? "").toLowerCase();
    const multiplier = UNIT_TO_BASE[unit] ?? 1;
    return qty * multiplier;
  }
  return 0;
};

const sortSubProducts = (subs: SubProduct[]): SubProduct[] => {
  return [...subs].sort((a, b) => {
    const aVal = parseVariantQty(a.label);
    const bVal = parseVariantQty(b.label);
    return aVal - bVal;
  });
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

function resolveVariantIds(
  baseUom: string,
  sub: SubProduct,
  colorDetail?: ColorDetail,
) {
  const mode = getDisplayMode(baseUom);

  if (mode === "EQUIPMENT") {
    if (sub.colorCode && sub.colorCode.trim()) {
      return {
        subProdId: null,
        subProdColorId: null,
        equipColorId: Number(sub.id),
      };
    }
  }

  if (mode === "COLOR") {
    if (colorDetail) {
      return {
        subProdId: null,
        subProdColorId: Number(colorDetail.colorId),
        equipColorId: null,
      };
    }
  }

  return {
    subProdId: Number(sub.id),
    subProdColorId: null,
    equipColorId: null,
  };
}

const cartItemKey = (productId: string, subProductId: string) =>
  `${productId}_${subProductId}`;

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

  const [selectedColorIndexMap, setSelectedColorIndexMap] = useState<
    Record<string, number>
  >({});
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

  const [savedToDb, setSavedToDb] = useState<Set<string>>(new Set());

  const [cartIconLoading, setCartIconLoading] = useState<
    Record<string, boolean>
  >({});
  const [dbUpdateLoading, setDbUpdateLoading] = useState<
    Record<string, boolean>
  >({});

  const [boundaryModal, setBoundaryModal] = useState<{
    visible: boolean;
    product: Product | null;
    sub: SubProduct | null;
    currentBatchPrice: number;
    nextBatchPrice: number;
  } | null>(null);

  const cartRef = useRef(cart);
  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem("userToken");
    return { Authorization: `Bearer ${token}` };
  };

  const fetchCart = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      const { data } = await axios.get(
        `${environment.API_BASE_URL}api/govi-shop/cart`,
        {
          params: { branchId },
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const items = data.items ?? [];
      const mappedCart: CartItem[] = items.map((r: any) => {
        const subId = r.subProdId || r.subProdColorId || r.equipColorId || "";
        return {
          productId: String(r.productId),
          productName: r.productName,
          subProductId: String(subId),
          subProductLabel: r.variantLabel ?? "",
          price: Number(r.pricePerUnit ?? 0),
          quantity: Number(r.qty ?? 0),
          image: r.productImage ?? "",
        };
      });

      setCart(mappedCart);

      const dbKeys = new Set<string>();
      mappedCart.forEach((item) => {
        dbKeys.add(cartItemKey(item.productId, item.subProductId));
      });
      setSavedToDb(dbKeys);

      if (mappedCart.length > 0) {
        setShowViewCart(true);
      } else {
        setShowViewCart(false);
      }
    } catch (error) {
      console.error("Error fetching cart on profile screen:", error);
    }
  }, [branchId]);

  const getTotalCap = (sub: SubProduct): number | undefined => sub.availableQty;

  const getActiveColorDetail = (
    sub: SubProduct | undefined,
    colorIdx: number,
  ): ColorDetail | undefined => {
    if (!sub?.colorDetails || sub.colorDetails.length === 0) return undefined;
    return sub.colorDetails[colorIdx] ?? sub.colorDetails[0];
  };

  const getCartQty = (productId: string, subProductId: string): number =>
    cart.find(
      (c) => c.productId === productId && c.subProductId === subProductId,
    )?.quantity ?? 0;

  const addLocalCart = (product: Product, sub: SubProduct) => {
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

  const removeLocalCart = (product: Product, sub: SubProduct) => {
    setCart((prev) => {
      const updated = prev
        .map((c) =>
          c.productId === product.id && c.subProductId === sub.id
            ? { ...c, quantity: c.quantity - 1 }
            : c,
        )
        .filter((c) => c.quantity > 0);
      if (updated.length === 0) setShowViewCart(false);
      return updated;
    });
  };

  const callUpsertAPI = async (
    product: Product,
    sub: SubProduct,
    qty: number,
    colorDetail?: ColorDetail,
  ): Promise<boolean> => {
    try {
      const headers = await getAuthHeaders();
      const { subProdId, subProdColorId, equipColorId } = resolveVariantIds(
        product.baseUom,
        sub,
        colorDetail,
      );
      await axios.post(
        `${environment.API_BASE_URL}api/govi-shop/cart/item`,
        {
          branchId: Number(branchId),
          productId: Number(product.id),
          subProdId,
          subProdColorId,
          equipColorId,
          qty,
        },
        { headers },
      );
      return true;
    } catch (error: any) {
      Alert.alert(
        "Cart Error",
        error?.response?.data?.message ??
          "Failed to update cart. Please try again.",
      );
      return false;
    }
  };

  const callDeleteAPI = async (
    product: Product,
    sub: SubProduct,
    colorDetail?: ColorDetail,
  ): Promise<boolean> => {
    try {
      const headers = await getAuthHeaders();
      const { subProdId, subProdColorId, equipColorId } = resolveVariantIds(
        product.baseUom,
        sub,
        colorDetail,
      );
      await axios.delete(`${environment.API_BASE_URL}api/govi-shop/cart/item`, {
        headers,
        data: {
          branchId: Number(branchId),
          productId: Number(product.id),
          subProdId,
          subProdColorId,
          equipColorId,
        },
      });
      return true;
    } catch (error: any) {
      Alert.alert(
        "Cart Error",
        error?.response?.data?.message ??
          "Failed to remove item. Please try again.",
      );
      return false;
    }
  };

  const handleCartIconPress = async (product: Product, sub: SubProduct) => {
    const key = cartItemKey(product.id, sub.id);
    const qty = getCartQty(product.id, sub.id);
    if (qty === 0) return;

    setCartIconLoading((prev) => ({ ...prev, [key]: true }));
    const ok = await callUpsertAPI(product, sub, qty);
    setCartIconLoading((prev) => ({ ...prev, [key]: false }));

    if (ok) {
      setSavedToDb((prev) => new Set(prev).add(key));
      setShowViewCart(true);
    }
  };

  const tryAddToCart = (product: Product, sub: SubProduct) => {
    const currentQty = getCartQty(product.id, sub.id);
    const totalCap = getTotalCap(sub);
    if (totalCap !== undefined && currentQty >= totalCap) return;

    if (sub.isMRP === 1 && sub.batches && sub.batches.length > 1) {
      let cumulative = 0;
      for (let i = 0; i < sub.batches.length - 1; i++) {
        cumulative += sub.batches[i].qty;
        if (currentQty === cumulative) {
          const currentBatchPrice = sub.batches[i].salePrice;
          const nextBatchPrice = sub.batches[i + 1].salePrice;
          if (nextBatchPrice !== currentBatchPrice) {
            setBoundaryModal({
              visible: true,
              product,
              sub,
              currentBatchPrice,
              nextBatchPrice,
            });
            return;
          }
          break;
        }
      }
    }

    const key = cartItemKey(product.id, sub.id);
    const newQty = currentQty + 1;

    if (savedToDb.has(key)) {
      addLocalCart(product, sub);
      setDbUpdateLoading((prev) => ({ ...prev, [key]: true }));
      callUpsertAPI(product, sub, newQty).then((ok) => {
        if (!ok) removeLocalCart(product, sub);
        setDbUpdateLoading((prev) => ({ ...prev, [key]: false }));
      });
    } else {
      addLocalCart(product, sub);
    }
  };

  const handleRemove = (product: Product, sub: SubProduct) => {
    const qty = getCartQty(product.id, sub.id);
    const key = cartItemKey(product.id, sub.id);

    if (qty === 1) {
      setLooseStateMap((prev) => ({ ...prev, [product.id]: "preview" }));
    }

    if (savedToDb.has(key)) {
      const newQty = qty - 1;

      if (newQty === 0) {
        setCart((prev) => {
          const updated = prev.filter(
            (c) => !(c.productId === product.id && c.subProductId === sub.id),
          );
          if (updated.length === 0) setShowViewCart(false);
          return updated;
        });
        setSavedToDb((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
        const snapshot = [...cartRef.current];
        setDbUpdateLoading((prev) => ({ ...prev, [key]: true }));
        callDeleteAPI(product, sub).then((ok) => {
          if (!ok) setCart(snapshot);
          setDbUpdateLoading((prev) => ({ ...prev, [key]: false }));
        });
      } else {
        removeLocalCart(product, sub);
        setDbUpdateLoading((prev) => ({ ...prev, [key]: true }));
        callUpsertAPI(product, sub, newQty).then((ok) => {
          if (!ok) addLocalCart(product, sub);
          setDbUpdateLoading((prev) => ({ ...prev, [key]: false }));
        });
      }
    } else {
      removeLocalCart(product, sub);
    }
  };

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
        searchKeyWord: p.searchKeyWord ?? "",
      }));

      const variantChecks = await Promise.allSettled(
        mappedProducts.map((p) =>
          axios.get(
            `${environment.API_BASE_URL}api/govi-shop/products/${p.id}/variants`,
            {
              params: { branchId },
              headers: { Authorization: `Bearer ${token}` },
            },
          ),
        ),
      );

      const validProducts: Product[] = [];
      const cachedSubProducts: Record<string, SubProduct[]> = {};
      const cachedSelectedSubProductId: Record<string, string> = {};

      const cachedColorIndexMap: Record<string, number> = {};

      mappedProducts.forEach((p, i) => {
        const result = variantChecks[i];

        if (result.status === "rejected") return;
        const variants = result.value.data;
        if (!Array.isArray(variants) || variants.length === 0) return;

        const mode = getDisplayMode(p.baseUom);
        const mapped: SubProduct[] = variants.map((v: any) => {
          const basePrice = Number(v.normalPrice ?? 0);
          const salePrice =
            v.discountPrice != null ? Number(v.discountPrice) : undefined;
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
            const qty = v.qty != null ? parseFloat(String(v.qty)) : 1;
            label = `${qty} ${qty === 1 ? "pc" : "pcs"}`;
          } else if (mode === "EQUIPMENT") {
            label = v.color ?? "";
          } else {
            const qty = v.qty != null ? parseFloat(String(v.qty)) : "";
            label = `${qty} ${v.uom ?? ""}`.trim();
          }
          return {
            id: String(v.variantId),
            label,
            price: basePrice,
            discountPrice: salePrice,
            colorCode: v.color ?? undefined,
            colors: Array.isArray(v.colorDetails)
              ? v.colorDetails.map((c: any) => c.color)
              : Array.isArray(v.colors)
                ? v.colors
                : undefined,
            colorDetails: Array.isArray(v.colorDetails)
              ? v.colorDetails.map((c: any) => ({
                  colorId: c.colorId,
                  color: c.color,
                  normalPrice: Number(c.normalPrice ?? 0),
                  discountPrice:
                    c.discountPrice != null
                      ? Number(c.discountPrice)
                      : undefined,
                  availableQty: Number(c.availableQty ?? 0),
                  batches: Array.isArray(c.batches)
                    ? c.batches.map((b: any) => ({
                        qty: Number(b.qty),
                        salePrice: Number(b.salePrice),
                        originalPrice:
                          b.originalPrice != null
                            ? Number(b.originalPrice)
                            : null,
                      }))
                    : undefined,
                }))
              : undefined,
            availableQty: Number(v.availableQty ?? 0),
            isMRP: v.isMRP ?? 0,
            batches: Array.isArray(v.batches)
              ? v.batches.map((b: any) => ({
                  qty: Number(b.qty),
                  salePrice: Number(b.salePrice),
                  originalPrice:
                    b.originalPrice != null ? Number(b.originalPrice) : null,
                }))
              : undefined,
          };
        });

        const hasStock = mapped.some((s) => (s.availableQty ?? 0) > 0);
        if (!hasStock) return;

        const sortedMapped = sortSubProducts(mapped);

        const firstSub = sortedMapped[0];
        const firstColorDetail =
          mode === "COLOR" &&
          firstSub.colorDetails &&
          firstSub.colorDetails.length > 0
            ? firstSub.colorDetails[0]
            : null;

        const updatedProduct: Product = {
          ...p,
          normalPrice: firstColorDetail
            ? firstColorDetail.normalPrice
            : firstSub.price,
          discountPrice: firstColorDetail
            ? firstColorDetail.discountPrice
            : firstSub.discountPrice,
          availableQty: firstColorDetail
            ? firstColorDetail.availableQty > 0
              ? firstColorDetail.availableQty
              : undefined
            : firstSub.availableQty && firstSub.availableQty > 0
              ? firstSub.availableQty
              : undefined,
        };

        cachedSubProducts[p.id] = sortedMapped;
        const firstSelectable =
          mode === "EQUIPMENT" || mode === "COLOR"
            ? (sortedMapped.find((s) => s.colorCode && s.colorCode.trim()) ??
              sortedMapped[0])
            : sortedMapped[0];
        cachedSelectedSubProductId[p.id] = firstSelectable.id;

        if (mode === "COLOR") {
          cachedColorIndexMap[p.id] = 0;
        }

        validProducts.push(updatedProduct);
      });

      setSubProducts((prev) => ({ ...prev, ...cachedSubProducts }));
      setSelectedSubProductId((prev) => ({
        ...prev,
        ...cachedSelectedSubProductId,
      }));
      setSelectedColorIndexMap((prev) => ({ ...prev, ...cachedColorIndexMap }));
      setProducts(validProducts);
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
        { params: { branchId }, headers: { Authorization: `Bearer ${token}` } },
      );
      const mode = getDisplayMode(baseUom);
      const mapped: SubProduct[] = response.data.map((v: any) => {
        const basePrice = Number(v.normalPrice ?? 0);
        const salePrice =
          v.discountPrice != null ? Number(v.discountPrice) : undefined;
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
          const qty = v.qty != null ? parseFloat(String(v.qty)) : 1;
          label = `${qty} ${qty === 1 ? "pc" : "pcs"}`;
        } else if (mode === "EQUIPMENT") {
          label = v.color ?? "";
        } else {
          const qty = v.qty != null ? parseFloat(String(v.qty)) : "";
          label = `${qty} ${v.uom ?? ""}`.trim();
        }
        return {
          id: String(v.variantId),
          label,
          price: basePrice,
          discountPrice: salePrice,
          colorCode: v.color ?? undefined,
          colors: Array.isArray(v.colorDetails)
            ? v.colorDetails.map((c: any) => c.color)
            : Array.isArray(v.colors)
              ? v.colors
              : undefined,
          colorDetails: Array.isArray(v.colorDetails)
            ? v.colorDetails.map((c: any) => ({
                colorId: c.colorId,
                color: c.color,
                normalPrice: Number(c.normalPrice ?? 0),
                discountPrice:
                  c.discountPrice != null ? Number(c.discountPrice) : undefined,
                availableQty: Number(c.availableQty ?? 0),
                batches: Array.isArray(c.batches)
                  ? c.batches.map((b: any) => ({
                      qty: Number(b.qty),
                      salePrice: Number(b.salePrice),
                      originalPrice:
                        b.originalPrice != null
                          ? Number(b.originalPrice)
                          : null,
                    }))
                  : undefined,
              }))
            : undefined,
          availableQty: Number(v.availableQty ?? 0),
          isMRP: v.isMRP ?? 0,
          batches: Array.isArray(v.batches)
            ? v.batches.map((b: any) => ({
                qty: Number(b.qty),
                salePrice: Number(b.salePrice),
                originalPrice:
                  b.originalPrice != null ? Number(b.originalPrice) : null,
              }))
            : undefined,
        };
      });

      const hasStock = mapped.some((s) => (s.availableQty ?? 0) > 0);
      if (mapped.length === 0 || !hasStock) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        setSubProducts((prev) => ({ ...prev, [productId]: [] }));
        return [];
      }

      const sortedMapped = sortSubProducts(mapped);

      if (sortedMapped.length > 0) {
        const firstSub = sortedMapped[0];
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  normalPrice: firstSub.price,
                  discountPrice: firstSub.discountPrice,
                  availableQty:
                    firstSub.availableQty && firstSub.availableQty > 0
                      ? firstSub.availableQty
                      : undefined,
                }
              : p,
          ),
        );
      }

      setSubProducts((prev) => ({ ...prev, [productId]: sortedMapped }));

      if (sortedMapped.length > 0) {
        const firstSelectable =
          mode === "EQUIPMENT" || mode === "COLOR"
            ? (sortedMapped.find((s) => s.colorCode && s.colorCode.trim()) ??
              sortedMapped[0])
            : sortedMapped[0];
        setSelectedSubProductId((prev) => ({
          ...prev,
          [productId]: firstSelectable.id,
        }));

        if (mode === "COLOR") {
          setSelectedColorIndexMap((prev) => ({
            ...prev,
            [productId]: prev[productId] ?? 0,
          }));
        }
      }
      return sortedMapped;
    } catch (error: any) {
      console.error("Error fetching sub-products:", error);
      const status = error?.response?.status;
      if (status === 404 || status === 400) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      }
      setSubProducts((prev) => ({ ...prev, [productId]: [] }));
      return [];
    } finally {
      setSubProductsLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleLoosePlusPress = async (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const currentState = looseStateMap[productId] ?? "collapsed";
    setExpandedProductId(null);
    setLooseStateMap((prev) => {
      const next: Record<string, LooseState> = {};
      Object.keys(prev).forEach((key) => {
        next[key] = key === productId ? prev[key] : "collapsed";
      });
      return next;
    });
    if (currentState === "collapsed") {
      setLooseStateMap((prev) => ({ ...prev, [productId]: "preview" }));
      if (!subProducts[productId]) fetchSubProducts(productId, product.baseUom);
    } else if (currentState === "preview") {
      let subs = subProducts[productId];
      if (!subs || subs.length === 0)
        subs = await fetchSubProducts(productId, product.baseUom);
      if (subs.length > 0) {
        const firstSub = subs[0];
        setSelectedSubProductId((prev) => ({
          ...prev,
          [productId]: firstSub.id,
        }));
        tryAddToCart(product, firstSub);
        setLooseStateMap((prev) => ({ ...prev, [productId]: "active" }));
      }
    } else {
      const subs = subProducts[productId];
      if (subs && subs.length > 0) {
        const activeSub =
          subs.find((s) => s.id === selectedSubProductId[productId]) ?? subs[0];
        tryAddToCart(product, activeSub);
      }
    }
  };

  const handleNonLoosePlusPress = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setLooseStateMap({});
    if (expandedProductId === productId) {
      setExpandedProductId(null);
    } else {
      setExpandedProductId(productId);
      const mode = getDisplayMode(product.baseUom);
      if (mode === "COLOR") {
        setSelectedColorIndexMap((prev) => ({
          ...prev,
          [productId]: prev[productId] ?? 0,
        }));
      }

      if (!subProducts[productId]) fetchSubProducts(productId, product.baseUom);
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

  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [fetchCart]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setExpandedProductId(null);
    setLooseStateMap({});
    fetchCategories();
    fetchProducts(selectedFilter, searchQuery);
    fetchCart();
  }, [selectedFilter, searchQuery, fetchCart]);

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

      if (displayMode === "EQUIPMENT") {
        const coloredSubs = subs.filter(
          (s) => s.colorCode && s.colorCode.trim(),
        );

        if (coloredSubs.length > 0) {
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

        return null;
      }

      if (subs.length <= 1) return null;
      return (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: CHIP_GAP,
            marginBottom: 12,
          }}
        >
          {subs.map((sub) => {
            const isSelected = activeSubId === sub.id;
            const label = sub.label || `Variant ${sub.id}`;
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
                  paddingHorizontal: 16,
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
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }

    if (displayMode === "COLOR") {
      const activeSub = subs.find((s) => s.id === activeSubId);
      const colorDetails: ColorDetail[] = activeSub?.colorDetails ?? [];

      const selectedColorIdx = selectedColorIndexMap[item.id] ?? 0;

      const activeDetail = colorDetails[selectedColorIdx] ?? colorDetails[0];
      const displayPrice = activeDetail
        ? (activeDetail.discountPrice ?? activeDetail.normalPrice)
        : (activeSub?.discountPrice ?? activeSub?.price ?? 0);
      const originalPrice = activeDetail?.discountPrice
        ? activeDetail.normalPrice
        : null;
      const dotAvailableQty = activeDetail?.availableQty ?? 0;

      return (
        <>
          {/* ── Quantity chips ── */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: CHIP_GAP,
              marginBottom: colorDetails.length > 0 ? 10 : 4,
            }}
          >
            {subs.map((sub) => {
              const isSelected = activeSubId === sub.id;
              return (
                <TouchableOpacity
                  key={sub.id}
                  onPress={() => {
                    setSelectedSubProductId((prev) => ({
                      ...prev,
                      [item.id]: sub.id,
                    }));

                    setSelectedColorIndexMap((prev) => ({
                      ...prev,
                      [item.id]: 0,
                    }));
                  }}
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

          {/* ── Color dots — each with its own price ── */}
          {colorDetails.length > 0 && (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: COLOR_DOT_GAP,
                marginBottom: 8,
              }}
            >
              {colorDetails.map((cd, index) => {
                const hex = resolveColor(cd.color);
                const isWhite = hex.toLowerCase() === "#ffffff";
                const isSelected = selectedColorIdx === index;
                const outOfStock = cd.availableQty <= 0;

                return (
                  <TouchableOpacity
                    key={cd.colorId}
                    activeOpacity={outOfStock ? 1 : 0.75}
                    disabled={outOfStock}
                    onPress={() =>
                      setSelectedColorIndexMap((prev) => ({
                        ...prev,
                        [item.id]: index,
                      }))
                    }
                    style={{
                      width: COLOR_DOT_SIZE,
                      height: COLOR_DOT_SIZE,
                      borderRadius: COLOR_DOT_SIZE / 2,
                      backgroundColor: hex,
                      opacity: outOfStock ? 0.3 : 1,
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
              marginBottom: 4,
            }}
          >
            {visibleSubs.map((sub, index) => {
              const isSelected = activeSubId === sub.id;
              const isLeftChip = index % 2 === 0;
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
                    width: "48%",
                    marginRight: isLeftChip ? "4%" : 0,
                    marginBottom: ROLL_GAP,
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
    const displayPrice = activeSub.discountPrice ?? activeSub.price;
    const totalCap = getTotalCap(activeSub);
    const isPlusDisabled = totalCap !== undefined && cartQty >= totalCap;
    const key = cartItemKey(item.id, activeSub.id);
    const isSaved = savedToDb.has(key);
    const isCartIconSpinning = cartIconLoading[key] ?? false;
    const isDbUpdating = dbUpdateLoading[key] ?? false;

    const showCartIcon = cartQty > 0 && !isSaved;

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 4,
        }}
      >
        {/* Price */}
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
          </View>
          {totalCap !== undefined && (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
            >
              <Ionicons
                name="information-circle-outline"
                size={12}
                color="#AAAAAA"
              />
              <Text style={{ color: "#AAAAAA", fontSize: 11 }}>
                {totalCap} Left
              </Text>
            </View>
          )}
        </View>

        {/* Buttons */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {cartQty === 0 ? (
            <TouchableOpacity
              onPress={() => tryAddToCart(item, activeSub)}
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
              {/* Stepper */}
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
                  onPress={() => handleRemove(item, activeSub)}
                  disabled={isDbUpdating}
                  style={{
                    backgroundColor: isDbUpdating ? "#CCCCCC" : "#FF8000",
                    width: 34,
                    height: 34,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 17,
                  }}
                >
                  {isDbUpdating ? (
                    <ActivityIndicator size={16} color="white" />
                  ) : cartQty === 1 ? (
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
                  onPress={() => tryAddToCart(item, activeSub)}
                  activeOpacity={isPlusDisabled || isDbUpdating ? 1 : 0.85}
                  disabled={isPlusDisabled || isDbUpdating}
                  style={{
                    backgroundColor:
                      isPlusDisabled || isDbUpdating ? "#CCCCCC" : "#FF8000",
                    width: 34,
                    height: 34,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 17,
                  }}
                >
                  {isDbUpdating ? (
                    <ActivityIndicator size={18} color="white" />
                  ) : (
                    <Ionicons name="add" size={18} color="white" />
                  )}
                </TouchableOpacity>
              </View>

              {/* Cart icon */}
              {showCartIcon && (
                <TouchableOpacity
                  style={{
                    backgroundColor: "#3F3C57",
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={() => handleCartIconPress(item, activeSub)}
                  disabled={isCartIconSpinning}
                  activeOpacity={0.85}
                >
                  {isCartIconSpinning ? (
                    <ActivityIndicator size={18} color="white" />
                  ) : (
                    <Ionicons name="cart-outline" size={18} color="white" />
                  )}
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    );
  };

  const BoundaryConfirmModal = () => {
    if (!boundaryModal?.visible) return null;
    const { product, sub, currentBatchPrice, nextBatchPrice } = boundaryModal;
    if (!product || !sub) return null;

    const handleIDontWant = () => setBoundaryModal(null);
    const handleAddToCart = () => {
      setBoundaryModal(null);
      const key = cartItemKey(product.id, sub.id);
      const newQty = getCartQty(product.id, sub.id) + 1;
      if (savedToDb.has(key)) {
        addLocalCart(product, sub);
        setDbUpdateLoading((prev) => ({ ...prev, [key]: true }));
        callUpsertAPI(product, sub, newQty).then((ok) => {
          if (!ok) removeLocalCart(product, sub);
          setDbUpdateLoading((prev) => ({ ...prev, [key]: false }));
        });
      } else {
        addLocalCart(product, sub);
      }
    };

    return (
      <Modal
        transparent
        visible
        animationType="fade"
        onRequestClose={handleIDontWant}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.55)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 22,
              width: "100%",
              paddingHorizontal: 24,
              paddingTop: 28,
              paddingBottom: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.45,
              shadowRadius: 24,
              elevation: 24,
            }}
          >
            <TouchableOpacity
              onPress={handleIDontWant}
              activeOpacity={0.8}
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: "#2A2840",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="close" size={16} color="#AAAAAA" />
            </TouchableOpacity>
            <Text
              style={{
                color: "#000",
                fontWeight: "800",
                fontSize: 18,
                marginBottom: 20,
              }}
            >
              Please Confirm Action!
            </Text>
            <View
              style={{
                borderWidth: 1.5,
                borderColor: "#8F95BD",
                borderRadius: 12,
                padding: 16,
                marginBottom: 24,
              }}
            >
              <Text
                style={{ color: "#484848", fontSize: 13.5, lineHeight: 22 }}
              >
                {"Last batch priced at "}
                <Text style={{ color: "#000", fontWeight: "700" }}>
                  Rs.{" "}
                  {currentBatchPrice.toLocaleString("en-LK", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
                {" has been sold.\n\nThe next batch will be available at "}
                <Text style={{ color: "#FF8000", fontWeight: "700" }}>
                  Rs.{" "}
                  {nextBatchPrice.toLocaleString("en-LK", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  .
                </Text>
                {"\nDo you wish to continue?"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleIDontWant}
              activeOpacity={0.85}
              style={{
                backgroundColor: "#CCCCCC",
                borderRadius: 50,
                paddingVertical: 15,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <Ionicons name="arrow-back" size={18} color="#555" />
              <Text style={{ color: "#555", fontWeight: "700", fontSize: 15 }}>
                I don't want
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAddToCart}
              activeOpacity={0.88}
              style={{
                backgroundColor: "#2A2840",
                borderRadius: 50,
                paddingVertical: 15,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                borderWidth: 1.5,
                borderColor: "#3A3858",
              }}
            >
              <Text
                style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 15 }}
              >
                Add to Cart
              </Text>
              <Ionicons name="arrow-forward" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
        ? (subs
            .filter((s) => s.colorCode && s.colorCode.trim())
            .find((s) => s.id === activeSubId) ??
          subs.find((s) => s.id === activeSubId))
        : subs.find((s) => s.id === activeSubId);
    const cartQty = activeSub ? getCartQty(item.id, activeSub.id) : 0;

    const previewPrice = item.discountPrice ?? item.normalPrice;
    const previewOriginalPrice = item.discountPrice ? item.normalPrice : null;
    const showImageInHeader = isLoose
      ? looseState === "collapsed"
      : !isExpanded;
    const showTopRightPlus = isLoose
      ? looseState === "collapsed" || looseState === "preview"
      : !isExpanded;

    const looseKey = activeSub ? cartItemKey(item.id, activeSub.id) : "";
    const isLooseSaved = activeSub ? savedToDb.has(looseKey) : false;
    const isLooseCartIconSpinning = cartIconLoading[looseKey] ?? false;
    const isLooseDbUpdating = dbUpdateLoading[looseKey] ?? false;

    const looseShowCartIcon = cartQty > 0 && !isLooseSaved && activeSub != null;

    const loosePillLabel: string | null = (() => {
      if (item.minQtyRaw) {
        return `${item.minQtyRaw}${item.minQtyUom ? ` ${item.minQtyUom}` : ""}`;
      }
      const firstSubLabel = subProducts[item.id]?.[0]?.label ?? null;
      return firstSubLabel;
    })();

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
                shopname,
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

        {/* LOOSE: PREVIEW */}
        {isLoose && looseState === "preview" && (
          <View
            style={{
              paddingHorizontal: CARD_H_PADDING,
              paddingBottom: CARD_H_PADDING,
            }}
          >
            {(loosePillLabel || item.baseUom) && (
              <Text
                style={{
                  fontSize: 13,
                  color: "#8A94A6",
                  fontWeight: "500",
                  marginBottom: 10,
                }}
              >
                {loosePillLabel
                  ? `${loosePillLabel} - By ${item.baseUom}`
                  : `By ${item.baseUom}`}
              </Text>
            )}

            <View
              style={{
                height: 1,
                backgroundColor: "#F0F0F0",
                marginBottom: 12,
              }}
            />

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

        {/* LOOSE: ACTIVE */}
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
                {activeSub &&
                  (() => {
                    const totalCap = getTotalCap(activeSub);
                    const isPlusDisabled =
                      totalCap !== undefined && cartQty >= totalCap;
                    return (
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
                            <FontAwesome5
                              name="coins"
                              size={14}
                              color="black"
                            />
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

                          {totalCap !== undefined && (
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
                                {totalCap} Left
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
                              onPress={() => handleRemove(item, activeSub)}
                              disabled={isLooseDbUpdating}
                              style={{
                                backgroundColor: isLooseDbUpdating
                                  ? "#CCCCCC"
                                  : "#FF8000",
                                width: 34,
                                height: 34,
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: 17,
                              }}
                            >
                              {isLooseDbUpdating ? (
                                <ActivityIndicator size={16} color="white" />
                              ) : cartQty === 1 ? (
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
                              onPress={() => tryAddToCart(item, activeSub)}
                              activeOpacity={
                                isPlusDisabled || isLooseDbUpdating ? 1 : 0.85
                              }
                              disabled={isPlusDisabled || isLooseDbUpdating}
                              style={{
                                backgroundColor:
                                  isPlusDisabled || isLooseDbUpdating
                                    ? "#CCCCCC"
                                    : "#FF8000",
                                width: 34,
                                height: 34,
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: 17,
                              }}
                            >
                              {isLooseDbUpdating ? (
                                <ActivityIndicator size={18} color="white" />
                              ) : (
                                <Ionicons name="add" size={18} color="white" />
                              )}
                            </TouchableOpacity>
                          </View>
                          {looseShowCartIcon && (
                            <TouchableOpacity
                              style={{
                                backgroundColor: "#3F3C57",
                                width: 36,
                                height: 36,
                                borderRadius: 18,
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              onPress={() =>
                                handleCartIconPress(item, activeSub)
                              }
                              disabled={isLooseCartIconSpinning}
                              activeOpacity={0.85}
                            >
                              {isLooseCartIconSpinning ? (
                                <ActivityIndicator size={18} color="white" />
                              ) : (
                                <Ionicons
                                  name="cart-outline"
                                  size={18}
                                  color="white"
                                />
                              )}
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    );
                  })()}
              </>
            )}
          </View>
        )}

        {/* NON-LOOSE: EXPANDED */}
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
                {activeSub &&
                  (() => {
                    const mode = getDisplayMode(item.baseUom);
                    if (mode === "COLOR") {
                      const cd = getActiveColorDetail(
                        activeSub,
                        selectedColorIndexMap[item.id] ?? 0,
                      );
                      if (cd) {
                        const patchedSub: SubProduct = {
                          ...activeSub,
                          price: cd.normalPrice,
                          discountPrice: cd.discountPrice,
                          availableQty: cd.availableQty,
                          batches: cd.batches,
                        };
                        return renderPriceActionRow(item, patchedSub, cartQty);
                      }
                    }
                    return renderPriceActionRow(item, activeSub, cartQty);
                  })()}
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
              textAlign: "center",
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
              placeholder={`Search ${selectedFilter === "All" ? "" : selectedFilter + " "}Products...`}
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
                      : `No ${selectedFilter === "All" ? "" : selectedFilter + " "}products available`}
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
            onPress={() =>
              navigation.navigate("CartScreen" as any, { shopname, branchId })
            }
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

      <BoundaryConfirmModal />
    </View>
  );
};

export default GoviShopProfileScreen;
