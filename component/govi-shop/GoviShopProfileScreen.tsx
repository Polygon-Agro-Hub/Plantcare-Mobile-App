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
import ShopLoading from "./ShopLoading";
import NoData from "../common/NoData";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
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
  const { shopId, branchId, shopname, logo, adress ,adressLoaction} = route.params;

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
    colorDetail?: ColorDetail;
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

  const addLocalCart = (
    product: Product,
    sub: SubProduct,
    colorDetail?: ColorDetail,
  ) => {
    const variantId = getVariantId(product.baseUom, sub, colorDetail);
    const price = colorDetail
      ? (colorDetail.discountPrice ?? colorDetail.normalPrice)
      : (sub.discountPrice ?? sub.price);

    setCart((prev) => {
      const exists = prev.find(
        (c) => c.productId === product.id && c.subProductId === variantId,
      );
      if (exists) {
        return prev.map((c) =>
          c.productId === product.id && c.subProductId === variantId
            ? { ...c, quantity: c.quantity + 1 }
            : c,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          subProductId: variantId,
          subProductLabel: sub.label,
          price,
          quantity: 1,
          image: product.image,
        },
      ];
    });
  };

  const removeLocalCart = (
    product: Product,
    sub: SubProduct,
    colorDetail?: ColorDetail,
  ) => {
    const variantId = getVariantId(product.baseUom, sub, colorDetail);
    setCart((prev) => {
      const updated = prev
        .map((c) =>
          c.productId === product.id && c.subProductId === variantId
            ? { ...c, quantity: c.quantity - 1 }
            : c,
        )
        .filter((c) => c.quantity > 0);
      if (updated.length === 0) setShowViewCart(false);
      return updated;
    });
  };

  const getVariantId = (
    baseUom: string,
    sub: SubProduct,
    colorDetail?: ColorDetail,
  ): string => {
    const mode = getDisplayMode(baseUom);
    if (mode === "COLOR" && colorDetail) return String(colorDetail.colorId);
    return sub.id;
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

  const handleCartIconPress = async (
    product: Product,
    sub: SubProduct,
    colorDetail?: ColorDetail,
  ) => {
    const variantId = getVariantId(product.baseUom, sub, colorDetail);
    const key = cartItemKey(product.id, variantId);
    const qty = getCartQty(product.id, variantId);
    if (qty === 0) return;

    setCartIconLoading((prev) => ({ ...prev, [key]: true }));
    const ok = await callUpsertAPI(product, sub, qty, colorDetail);
    setCartIconLoading((prev) => ({ ...prev, [key]: false }));

    if (ok) {
      setSavedToDb((prev) => new Set(prev).add(key));
      setShowViewCart(true);
    }
  };

  const tryAddToCart = (
    product: Product,
    sub: SubProduct,
    colorDetail?: ColorDetail,
  ) => {
    const variantId = getVariantId(product.baseUom, sub, colorDetail);
    const currentQty = getCartQty(product.id, variantId);
    const totalCap = colorDetail ? colorDetail.availableQty : getTotalCap(sub);
    if (totalCap !== undefined && currentQty >= totalCap) return;

    const batches = colorDetail ? colorDetail.batches : sub.batches;

    if (sub.isMRP === 1 && batches && batches.length > 1) {
      let cumulative = 0;
      for (let i = 0; i < batches.length - 1; i++) {
        cumulative += batches[i].qty;
        if (currentQty === cumulative) {
          const currentBatchPrice = batches[i].salePrice;
          const nextBatchPrice = batches[i + 1].salePrice;
          if (nextBatchPrice !== currentBatchPrice) {
            setBoundaryModal({
              visible: true,
              product,
              sub,
              colorDetail,
              currentBatchPrice,
              nextBatchPrice,
            });
            return;
          }
          break;
        }
      }
    }

    const key = cartItemKey(product.id, variantId);
    const newQty = currentQty + 1;

    if (savedToDb.has(key)) {
      addLocalCart(product, sub, colorDetail);
      setDbUpdateLoading((prev) => ({ ...prev, [key]: true }));
      callUpsertAPI(product, sub, newQty, colorDetail).then((ok) => {
        if (!ok) removeLocalCart(product, sub, colorDetail);
        setDbUpdateLoading((prev) => ({ ...prev, [key]: false }));
      });
    } else {
      addLocalCart(product, sub, colorDetail);
    }
  };

  const handleRemove = (
    product: Product,
    sub: SubProduct,
    colorDetail?: ColorDetail,
  ) => {
    const variantId = getVariantId(product.baseUom, sub, colorDetail);
    const qty = getCartQty(product.id, variantId);
    const key = cartItemKey(product.id, variantId);

    if (qty === 1) {
      setLooseStateMap((prev) => ({ ...prev, [product.id]: "preview" }));
    }

    if (savedToDb.has(key)) {
      const newQty = qty - 1;

      if (newQty === 0) {
        setCart((prev) => {
          const updated = prev.filter(
            (c) =>
              !(c.productId === product.id && c.subProductId === variantId),
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
        callDeleteAPI(product, sub, colorDetail).then((ok) => {
          if (!ok) setCart(snapshot);
          setDbUpdateLoading((prev) => ({ ...prev, [key]: false }));
        });
      } else {
        removeLocalCart(product, sub, colorDetail);
        setDbUpdateLoading((prev) => ({ ...prev, [key]: true }));
        callUpsertAPI(product, sub, newQty, colorDetail).then((ok) => {
          if (!ok) addLocalCart(product, sub, colorDetail);
          setDbUpdateLoading((prev) => ({ ...prev, [key]: false }));
        });
      }
    } else {
      removeLocalCart(product, sub, colorDetail);
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

        let mode = getDisplayMode(p.baseUom);
        if (mode === "DEFAULT" && variants.some((v: any) => v.width != null && v.height != null)) {
          mode = "ROLL";
          p.baseUom = "roll"; 
        }

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
      let mode = getDisplayMode(baseUom);
      if (mode === "DEFAULT" && response.data.some((v: any) => v.width != null && v.height != null)) {
        mode = "ROLL";
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, baseUom: "roll" } : p));
      }

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
      className="px-5 py-2 rounded-[20px] mr-2.5 border"
      style={{
        backgroundColor: selectedFilter === item.name ? "#FF8000" : "#FFFFFF",
        borderColor: selectedFilter === item.name ? "#FF8000" : "#7A9BC9",
      }}
      activeOpacity={0.8}
    >
      <Text
        className="font-semibold text-[13px]"
        style={{
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
              className="flex-row flex-wrap mb-3"
              style={{
                gap: COLOR_DOT_GAP,
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
          className="flex-row flex-wrap mb-3"
          style={{
            gap: CHIP_GAP,
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
                className="px-4 py-[7px] rounded-[20px] border-[1.5px] bg-white items-center justify-center"
                style={{
                  borderColor: isSelected ? "#FF8000" : "#E0E0E0",
                }}
              >
                <Text
                  className="text-[13px] font-semibold"
                  style={{
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
            className="flex-row flex-wrap"
            style={{
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
                  className="px-[18px] py-[7px] rounded-[20px] border-[1.5px] bg-white items-center justify-center"
                  style={{
                    borderColor: isSelected ? "#FF8000" : "#E0E0E0",
                  }}
                >
                  <Text
                    className="text-[13px] font-semibold"
                    style={{
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
              className="flex-row flex-wrap mb-2"
              style={{
                gap: COLOR_DOT_GAP,
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
            className="flex-row flex-wrap mb-1"
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
                  className="w-[48%] py-[9px] rounded-[20px] border-[1.5px] bg-white items-center justify-center"
                  style={{
                    marginRight: isLeftChip ? "4%" : 0,
                    marginBottom: ROLL_GAP,
                    borderColor: isSelected ? "#FF8000" : "#E0E0E0",
                  }}
                >
                  <Text
                    className="text-[13px] font-semibold"
                    style={{
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
              <Text className="text-[#FF8000] text-[12px] mb-1.5">
                +{subs.length - MAX_CHIPS_VISIBLE} more
              </Text>
            </TouchableOpacity>
          )}
        </>
      );
    }

    if (visibleSubs.length === 1 && visibleSubs[0].label === "Variant") {
      return null;
    }

    return (
      <>
        <View
          className="flex-row flex-wrap mb-1"
          style={{
            marginRight: -CHIP_GAP,
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
                className="py-[7px] rounded-[20px] border-[1.5px] bg-white items-center justify-center"
                style={{
                  width: CHIP_WIDTH,
                  marginRight: CHIP_GAP,
                  marginBottom: CHIP_GAP,
                  borderColor: isSelected ? "#FF8000" : "#E0E0E0",
                }}
              >
                <Text
                  className="text-[12px] font-semibold"
                  style={{
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
            <Text className="text-[#FF8000] text-[12px] mb-1.5">
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
    colorDetail?: ColorDetail,
  ) => {
    const displayPrice = colorDetail
      ? (colorDetail.discountPrice ?? colorDetail.normalPrice)
      : (activeSub.discountPrice ?? activeSub.price);
    const totalCap = colorDetail
      ? colorDetail.availableQty
      : getTotalCap(activeSub);
    const isPlusDisabled = totalCap !== undefined && cartQty >= totalCap;
    const variantId = getVariantId(item.baseUom, activeSub, colorDetail);
    const key = cartItemKey(item.id, variantId);
    const isSaved = savedToDb.has(key);
    const isCartIconSpinning = cartIconLoading[key] ?? false;
    const isDbUpdating = dbUpdateLoading[key] ?? false;
    const showCartIcon = cartQty > 0 && !isSaved;

    return (
      <View
        className="flex-row items-center justify-between mt-1"
      >
        {/* Price */}
        <View className="gap-[2px]">
          <View className="flex-row items-center gap-1">
            <FontAwesome5 name="coins" size={14} color="black" />
            <Text
              className="text-[#FF8000] font-[800] text-[16px] ml-[5px]"
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
              className="flex-row items-center gap-[3px]"
            >
              <Ionicons
                name="information-circle-outline"
                size={12}
                color="#AAAAAA"
              />
              <Text className="text-[#AAAAAA] text-[11px]">
                {totalCap} Left
              </Text>
            </View>
          )}
        </View>

        {/* Buttons */}
        <View className="flex-row items-center gap-2">
          {cartQty === 0 ? (
            <TouchableOpacity
              onPress={() => tryAddToCart(item, activeSub, colorDetail)}
              activeOpacity={0.85}
              className="bg-[#3F3C57] rounded-[20px] p-2"
              style={{
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
                className="flex-row items-center bg-[#FF80001A] rounded-[20px] border border-[#E8E8E8] overflow-hidden"
              >
                <TouchableOpacity
                  onPress={() => handleRemove(item, activeSub, colorDetail)}
                  disabled={isDbUpdating}
                  className="w-[34px] h-[34px] items-center justify-center rounded-[17px]"
                  style={{
                    backgroundColor: isDbUpdating ? "#CCCCCC" : "#FF8000",
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
                  className="px-3 font-bold text-[15px] text-[#3F3C57] min-w-[28px] text-center"
                >
                  {cartQty}
                </Text>
                <TouchableOpacity
                  onPress={() => tryAddToCart(item, activeSub, colorDetail)}
                  activeOpacity={isPlusDisabled || isDbUpdating ? 1 : 0.85}
                  disabled={isPlusDisabled || isDbUpdating}
                  className="w-[34px] h-[34px] items-center justify-center rounded-[17px]"
                  style={{
                    backgroundColor:
                      isPlusDisabled || isDbUpdating ? "#CCCCCC" : "#FF8000",
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
                  className="bg-[#3F3C57] w-[36px] h-[36px] rounded-[18px] items-center justify-center"
                  onPress={() =>
                    handleCartIconPress(item, activeSub, colorDetail)
                  }
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
    const { product, sub, colorDetail, currentBatchPrice, nextBatchPrice } =
      boundaryModal;
    if (!product || !sub) return null;

    const handleIDontWant = () => setBoundaryModal(null);
    const handleAddToCart = () => {
      setBoundaryModal(null);
      const variantId = getVariantId(product.baseUom, sub, colorDetail);
      const key = cartItemKey(product.id, variantId);
      const newQty = getCartQty(product.id, variantId) + 1;
      if (savedToDb.has(key)) {
        addLocalCart(product, sub, colorDetail);
        setDbUpdateLoading((prev) => ({ ...prev, [key]: true }));
        callUpsertAPI(product, sub, newQty, colorDetail).then((ok) => {
          if (!ok) removeLocalCart(product, sub, colorDetail);
          setDbUpdateLoading((prev) => ({ ...prev, [key]: false }));
        });
      } else {
        addLocalCart(product, sub, colorDetail);
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
          className="flex-1 bg-[rgba(0,0,0,0.55)] justify-center items-center px-5"
        >
          <View
            className="bg-white rounded-[22px] w-full px-6 pt-7 pb-6"
            style={{
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
              className="absolute top-3.5 right-3.5 w-[30px] h-[30px] rounded-[15px] bg-[#2A2840] items-center justify-center"
            >
              <Ionicons name="close" size={16} color="#AAAAAA" />
            </TouchableOpacity>
            <Text
              className="text-black font-[800] text-[18px] mb-5"
            >
              Please Confirm Action!
            </Text>
            <View
              className="border-[1.5px] border-[#8F95BD] rounded-xl p-4 mb-6"
            >
              <Text
                className="text-[#484848] text-[13.5px] leading-[22px]"
              >
                {"Last batch priced at "}
                <Text className="text-black font-bold">
                  Rs.{" "}
                  {currentBatchPrice.toLocaleString("en-LK", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
                {" has been sold.\n\nThe next batch will be available at "}
                <Text className="text-[#FF8000] font-bold">
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
              className="bg-[#CCCCCC] rounded-[50px] py-[15px] flex-row items-center justify-center gap-2.5 mb-3"
            >
              <Ionicons name="arrow-back" size={18} color="#555" />
              <Text className="text-[#555] font-bold text-[15px]">
                I don't want
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAddToCart}
              activeOpacity={0.88}
              className="bg-[#2A2840] rounded-[50px] py-[15px] flex-row items-center justify-center gap-2.5 border-[1.5px] border-[#3A3858]"
            >
              <Text
                className="text-white font-bold text-[15px]"
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

    const activeColorDetail =
      displayMode === "COLOR" && activeSub
        ? getActiveColorDetail(activeSub, selectedColorIndexMap[item.id] ?? 0)
        : undefined;

    const variantId = activeSub
      ? getVariantId(item.baseUom, activeSub, activeColorDetail)
      : undefined;

    const cartQty = activeSub && variantId ? getCartQty(item.id, variantId) : 0;

    const previewPrice = item.discountPrice ?? item.normalPrice;
    const previewOriginalPrice = item.discountPrice ? item.normalPrice : null;
    const showImageInHeader = !isExpanded;
    const showTopRightPlus = isLoose ? true : !isExpanded;

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
        className="bg-white rounded-2xl mb-3.5 overflow-hidden border border-[#F0F0F0]"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
          elevation: 4,
        }}
      >
        <TouchableOpacity
          activeOpacity={isExpanded ? 1 : 0.97}
          onPress={() => {
            if (!isExpanded) {
              navigation.navigate("ViewProduct" as any, {
                productId: item.id,
                productName: item.name,
                image: item.image,
                categoryId: item.categoryId,
                baseUom: item.baseUom,
                branchId,
                shopId,
                shopname,
              });
            }
          }}
        >
          <View
            className="flex-row items-center"
            style={{
              padding: CARD_H_PADDING,
            }}
          >
            {showImageInHeader && (
              <View
                className="w-[72px] h-[72px] rounded-xl bg-[#F3F4F6] mr-3 overflow-hidden border border-[#F0F0F0]"
              >
                <Image
                  source={{ uri: item.image }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
            )}
            <View className="flex-1">
              <Text
                className="text-[14px] font-bold text-[#111827] leading-5"
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
                className="bg-[#3F3C57] rounded-[20px] p-[5px] ml-2.5"
                style={{
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
                className="text-[13px] text-[#8A94A6] font-medium mb-2.5"
              >
                {loosePillLabel
                  ? `${loosePillLabel} - By ${item.baseUom}`
                  : `By ${item.baseUom}`}
              </Text>
            )}

            <View
              className="h-[1px] bg-[#F0F0F0] mb-3"
            />

            <View
              className="flex-row items-center justify-between"
            >
              <View
                className="flex-row items-center gap-1"
              >
                <FontAwesome5 name="coins" size={14} color="black" />
                <Text
                  className="text-[#FF8000] font-[800] text-[16px] ml-[5px]"
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
                className="bg-[#3F3C57] rounded-[20px] p-[5px]"
                style={{
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
              className="h-[1px] bg-[#F0F0F0] mb-3"
            />
            {isLoadingSubs ? (
              <ActivityIndicator
                size="small"
                color="#FF8000"
                className="my-2.5"
              />
            ) : (
              <>
                {activeSub && (
                  <View className="mb-2.5">
                    <View
                      className="self-start px-3.5 py-1.5 rounded-[20px] border-[1.5px] border-[#FF8000]"
                    >
                      <Text
                        className="text-[#FF8000] font-bold text-[13px]"
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
                        className="flex-row items-center justify-between"
                      >
                        <View className="gap-[2px]">
                          <View
                            className="flex-row items-center gap-1"
                          >
                            <FontAwesome5
                              name="coins"
                              size={14}
                              color="black"
                            />
                            <Text
                              className="text-[#FF8000] font-[800] text-[16px] ml-[5px]"
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
                              className="flex-row items-center gap-[3px]"
                            >
                              <Ionicons
                                name="information-circle-outline"
                                size={12}
                                color="#AAAAAA"
                              />
                              <Text className="text-[#AAAAAA] text-[11px]">
                                {totalCap} Left
                              </Text>
                            </View>
                          )}
                        </View>
                        <View
                          className="flex-row items-center gap-2"
                        >
                          <View
                            className="flex-row items-center bg-[#FF80001A] rounded-[20px] border border-[#E8E8E8] overflow-hidden"
                          >
                            <TouchableOpacity
                              onPress={() => handleRemove(item, activeSub)}
                              disabled={isLooseDbUpdating}
                              className="w-[34px] h-[34px] items-center justify-center rounded-[17px]"
                              style={{
                                backgroundColor: isLooseDbUpdating
                                  ? "#CCCCCC"
                                  : "#FF8000",
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
                              className="px-3 font-bold text-[15px] text-[#3F3C57] min-w-[28px] text-center"
                            >
                              {cartQty}
                            </Text>
                            <TouchableOpacity
                              onPress={() => tryAddToCart(item, activeSub)}
                              activeOpacity={
                                isPlusDisabled || isLooseDbUpdating ? 1 : 0.85
                              }
                              disabled={isPlusDisabled || isLooseDbUpdating}
                              className="w-[34px] h-[34px] items-center justify-center rounded-[17px]"
                              style={{
                                backgroundColor:
                                  isPlusDisabled || isLooseDbUpdating
                                    ? "#CCCCCC"
                                    : "#FF8000",
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
                              className="bg-[#3F3C57] w-[36px] h-[36px] rounded-[18px] items-center justify-center"
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
              className="h-[1px] bg-[#F0F0F0] mb-3"
            />
            {isLoadingSubs ? (
              <ActivityIndicator
                size="small"
                color="#FF8000"
                className="my-2.5"
              />
            ) : subs.length === 0 ? (
              <Text
                className="text-[#AAA] text-[13px] text-center py-2"
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
                        return renderPriceActionRow(
                          item,
                          patchedSub,
                          cartQty,
                          cd,
                        );
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
    <View className="flex-1 bg-white">
      <View
        className="absolute top-0 left-0 right-0 z-0"
      >
        <Image
          source={require("@/assets/images/govi-shop/shop-profile-header.webp")}
          className="h-[100px]"
          style={{ width: screenWidth }}
          resizeMode="cover"
        />
        <View
          className="absolute -bottom-20 self-center z-10"
          style={{
            elevation: 10,
          }}
        >
          <View
            className="w-32 h-32 bg-[#F3F4F6] overflow-hidden"
          >
            <Image
              source={{ uri: logo }}
              className="w-full h-full"
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
        className="flex-1 mt-[130px]"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: showViewCart ? 100 : 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View
          className="items-center pb-4 px-4 bg-white"
        >
          <Text
            className="text-[20px] font-bold text-black mb-1.5 text-center"
          >
            {shopname}
          </Text>
          {adress ? (
            <View className="flex-row items-center">
              <Ionicons name="location" size={16} color="#FF0000" />
              <Text className="text-[13px] text-[#626786] ml-1">
                {adress}
              </Text>
            </View>
          ) : null}
          <Text
            className=" text-[#626786] mb-1.5 text-center"
          >{adressLoaction}</Text>
          
        </View>

        <View
          className="mx-6 pb-2 bg-white"
        >
          <View
            className="bg-[#E8E9EDCC] rounded-[28px] px-4 py-1 flex-row items-center"
          >
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={`Search ${selectedFilter === "All" ? "" : selectedFilter + " "}Products...`}
              placeholderTextColor="#373737"
              className="flex-1 ml-2 text-base text-gray-800 h-[50px]"
            />
            {searchQuery.length === 0 ? (
              <Ionicons name="search-outline" size={28} color="#373737" />
            ) : (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-sharp" size={28} color="#373737" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {categoriesLoading || productsLoading ? (
          <ShopLoading
            text={t("GoviShop.LoadingProducts") || "Loading products..."}
          />
        ) : (
          <>
            <View
              className="mx-6 pt-3.5 pb-2 bg-white"
            >
              <FlatList
                data={filterButtons}
                renderItem={renderFilterButton}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 20 }}
              />
            </View>

            <View
              className="mx-6 pt-2 bg-white"
            >
              <FlatList
                data={products}
                renderItem={renderProductItem}
                keyExtractor={(item, index) =>
                  item?.id?.toString() ?? index.toString()
                }
                scrollEnabled={false}
                ListEmptyComponent={
                  <NoData
                    text={
                      searchQuery
                        ? `No results for "${searchQuery}"`
                        : `No ${selectedFilter === "All" ? "" : selectedFilter + " "}products available`
                    }
                  />
                }
              />
            </View>
          </>
        )}
      </ScrollView>

      {showViewCart && cartCount > 0 && (
        <View
          className="absolute bottom-[100px] left-[25%] right-[25%] z-[999]"
        >
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("CartScreen" as any, { shopname, branchId })
            }
            activeOpacity={0.9}
            className="bg-[#FF8000CC] rounded-[50px] flex-row items-center justify-between py-3.5 px-5"
            style={{
              shadowColor: "#3F3C57",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 10,
            }}
          >
            <View className="flex-col">
              <Text
                className="text-white font-bold text-[15px] tracking-[0.3px]"
              >
                View Cart
              </Text>
              <Text className="text-white text-[12px] opacity-85">
                {cartCount} {cartCount === 1 ? "item" : "items"}
              </Text>
            </View>
            <View
              className="h-10 w-10 bg-white rounded-[20px] items-center justify-center"
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
