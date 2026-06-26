import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  StatusBar,
  Platform,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { RootStackParamList } from "../types/types";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/core";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { environment } from "@/environment/environment";

type ViewProductNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ViewProduct"
>;
type ViewProductRouteProp = RouteProp<RootStackParamList, "ViewProduct">;

interface ViewProductProps {
  navigation: ViewProductNavigationProp;
  route: ViewProductRouteProp;
}

interface Batch {
  qty: number;
  salePrice: number;
  originalPrice: number | null;
}

interface ColorDetail {
  colorId: number;
  color: string;
  normalPrice: number;
  discountPrice?: number;
  availableQty: number;
  batches?: Batch[];
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

type UomDisplayMode = "DEFAULT" | "LOOSE" | "ROLL" | "COLOR" | "EQUIPMENT";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IMAGE_HEIGHT = SCREEN_WIDTH + 20;
const H_PAD = 16;

const CHIP_COLUMNS = 4;
const CHIP_GAP = 8;
const CHIP_WIDTH =
  (SCREEN_WIDTH - H_PAD * 2 - CHIP_GAP * (CHIP_COLUMNS - 1)) / CHIP_COLUMNS;
const MAX_CHIPS_VISIBLE = CHIP_COLUMNS * 3;

const ROLL_GAP = 8;

const COLOR_DOT_SIZE = 34;
const COLOR_DOT_GAP = 8;

const DEFAULT_SUB_PRODUCTS: SubProduct[] = [
  { id: "d_25ml", label: "25 ml", price: 100 },
  { id: "d_100ml", label: "100 ml", price: 200 },
  { id: "d_500ml", label: "500 ml", price: 500 },
  { id: "d_1l", label: "1 L", price: 1000 },
  { id: "d_2l", label: "2 L", price: 2000 },
  { id: "d_5l", label: "5 L", price: 5000 },
  { id: "d_10l", label: "10 L", price: 10000 },
  { id: "d_20l", label: "20 L", price: 20000 },
  { id: "d_25l", label: "25 L", price: 25000 },
  { id: "d_30l", label: "30 L", price: 30000 },
  { id: "d_50l", label: "50 L", price: 50000 },
];

const fmt = (n: number) =>
  n.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const getDisplayMode = (baseUom: string): UomDisplayMode => {
  const u = (baseUom ?? "").toLowerCase();
  if (u.includes("loose")) return "LOOSE";
  if (u.includes("roll")) return "ROLL";
  if (u.includes("piece")) return "COLOR";
  if (u.includes("equipment")) return "EQUIPMENT";
  return "DEFAULT";
};

const resolveColor = (raw: string): string => {
  if (!raw) return "#CCCCCC";
  const t = raw.trim();
  if (t.startsWith("#")) return t;
  const hexRegex =
    /^([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
  if (hexRegex.test(t)) return `#${t}`;
  return t.toLowerCase();
};

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

const ViewProduct: React.FC<ViewProductProps> = ({ route, navigation }) => {
  const {
    productId,
    productName,
    image,
    baseUom = "",
    branchId,
    description: routeDescription = "",
    shopname = "Cart",
  } = route.params as any;

  const [displayMode, setDisplayMode] = useState<UomDisplayMode>(
    getDisplayMode(baseUom),
  );

  const [subProducts, setSubProducts] = useState<SubProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubId, setSelectedSubId] = useState<string>("");
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [showAllChips, setShowAllChips] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showViewCart, setShowViewCart] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [description, setDescription] = useState<string>(routeDescription);

  const [savedToDb, setSavedToDb] = useState(false);

  const [cartIconLoading, setCartIconLoading] = useState(false);
  const [dbUpdateLoading, setDbUpdateLoading] = useState(false);

  const [boundaryModal, setBoundaryModal] = useState<{
    visible: boolean;
    sub: SubProduct | null;
    colorDetail?: ColorDetail;
    currentBatchPrice: number;
    nextBatchPrice: number;
  } | null>(null);

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
      const totalQty = items.reduce(
        (sum: number, r: any) => sum + Number(r.qty ?? 0),
        0,
      );

      setCartCount(totalQty);
      setShowViewCart(totalQty > 0);
    } catch (error) {
      console.error("Error fetching cart on ViewProduct:", error);
    }
  }, [branchId]);

  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [fetchCart]),
  );

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("userToken");
        if (!token) return;

        const { data } = await axios.get(
          `${environment.API_BASE_URL}api/govi-shop/products/${productId}/variants`,
          {
            params: { branchId },
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!routeDescription && data[0]?.description) {
          setDescription(data[0].description);
        }

        let currentMode = getDisplayMode(baseUom);
        if (
          currentMode === "DEFAULT" &&
          data.some((v: any) => v.width != null && v.height != null)
        ) {
          currentMode = "ROLL";
          setDisplayMode("ROLL");
        }

        const mapped: SubProduct[] = data.map((v: any) => {
          let label = "";
          if (currentMode === "ROLL") {
            const w = v.width != null ? parseFloat(String(v.width)) : "";
            const h = v.height != null ? parseFloat(String(v.height)) : "";
            const uom = v.uom ?? "m";
            label =
              w !== "" && h !== ""
                ? `${w} x ${h} ${uom}`.trim()
                : `${w || h} ${uom}`.trim();
          } else if (currentMode === "COLOR") {
            const q = v.qty ?? 1;
            label = `${q} ${q === 1 ? "pc" : "pcs"}`;
          } else if (currentMode === "EQUIPMENT") {
            label = v.color ?? v.label ?? "Equipment";
          } else {
            const qty =
              v.qty != null && String(v.qty).trim() !== ""
                ? parseFloat(String(v.qty))
                : "";
            const uomStr = (v.uom ?? "").trim();
            if (qty !== "" || uomStr !== "") {
              label = `${qty} ${uomStr}`.trim();
            } else {
              label = v.color ?? v.label ?? "Variant";
            }
          }
          return {
            id: String(v.variantId),
            label,
            price: Number(v.normalPrice ?? 0),
            discountPrice:
              v.discountPrice != null ? Number(v.discountPrice) : undefined,
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

        const final = mapped.length > 0 ? mapped : DEFAULT_SUB_PRODUCTS;
        setSubProducts(final);
        const first =
          displayMode === "EQUIPMENT"
            ? (final.find((s) => s.colorCode && s.colorCode.trim()) ?? final[0])
            : final[0];
        setSelectedSubId(first.id);
        setSelectedColorIndex(0);
      } catch {
        setSubProducts(DEFAULT_SUB_PRODUCTS);
        setSelectedSubId(DEFAULT_SUB_PRODUCTS[0].id);
        setSelectedColorIndex(0);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  const activeSub =
    displayMode === "EQUIPMENT"
      ? (subProducts
          .filter((s) => s.colorCode?.trim())
          .find((s) => s.id === selectedSubId) ??
        subProducts.find((s) => s.id === selectedSubId))
      : subProducts.find((s) => s.id === selectedSubId);

  const getActiveColorDetail = (
    sub: SubProduct | undefined,
    colorIdx: number,
  ): ColorDetail | undefined => {
    if (!sub?.colorDetails || sub.colorDetails.length === 0) return undefined;
    return sub.colorDetails[colorIdx] ?? sub.colorDetails[0];
  };

  const activeColorDetail =
    displayMode === "COLOR"
      ? getActiveColorDetail(activeSub, selectedColorIndex)
      : undefined;

  const activePrice = activeColorDetail
    ? (activeColorDetail.discountPrice ?? activeColorDetail.normalPrice)
    : activeSub
      ? (activeSub.discountPrice ?? activeSub.price)
      : 0;
  const originalPrice = activeColorDetail
    ? activeColorDetail.normalPrice
    : (activeSub?.price ?? 0);
  const hasDiscount = activeColorDetail
    ? !!activeColorDetail.discountPrice &&
      activeColorDetail.discountPrice < activeColorDetail.normalPrice
    : !!activeSub?.discountPrice && activeSub.discountPrice < activeSub.price;
  const availableQty = activeColorDetail
    ? activeColorDetail.availableQty > 0
      ? activeColorDetail.availableQty
      : undefined
    : activeSub?.availableQty && activeSub.availableQty > 0
      ? activeSub.availableQty
      : undefined;
  const subtotal = activePrice * quantity;
  const isPlusDisabled = availableQty !== undefined && quantity >= availableQty;

  const stockUnitLabel =
    displayMode === "ROLL" ? (availableQty === 1 ? "Roll" : "Rolls") : "";

  const callUpsertAPI = async (
    sub: SubProduct,
    qty: number,
    colorDetail?: ColorDetail,
  ): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const { subProdId, subProdColorId, equipColorId } = resolveVariantIds(
        baseUom,
        sub,
        colorDetail,
      );
      await axios.post(
        `${environment.API_BASE_URL}api/govi-shop/cart/item`,
        {
          branchId: Number(branchId),
          productId: Number(productId),
          subProdId,
          subProdColorId,
          equipColorId,
          qty,
        },
        { headers: { Authorization: `Bearer ${token}` } },
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
    sub: SubProduct,
    colorDetail?: ColorDetail,
  ): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const { subProdId, subProdColorId, equipColorId } = resolveVariantIds(
        baseUom,
        sub,
        colorDetail,
      );
      await axios.delete(`${environment.API_BASE_URL}api/govi-shop/cart/item`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          branchId: Number(branchId),
          productId: Number(productId),
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

  const handleSelectSub = (id: string) => {
    setSelectedSubId(id);
    setSelectedColorIndex(0);
    setQuantity(1);

    setSavedToDb(false);
  };

  const handleSelectColor = (index: number) => {
    setSelectedColorIndex(index);
    setQuantity(1);

    setSavedToDb(false);
  };

  const checkBatchBoundary = (
    sub: SubProduct,
    qty: number,
    colorDetail?: ColorDetail,
  ): boolean => {
    const batches = colorDetail ? colorDetail.batches : sub.batches;
    if (sub.isMRP !== 1 || !batches || batches.length <= 1) return false;
    let cum = 0;
    for (let i = 0; i < batches.length - 1; i++) {
      cum += batches[i].qty;
      if (qty === cum) {
        const cur = batches[i].salePrice;
        const next = batches[i + 1].salePrice;
        if (next !== cur) {
          setBoundaryModal({
            visible: true,
            sub,
            colorDetail,
            currentBatchPrice: cur,
            nextBatchPrice: next,
          });
          return true;
        }
      }
    }
    return false;
  };

  const handleCartPress = async () => {
    if (!activeSub) return;
    if (checkBatchBoundary(activeSub, quantity, activeColorDetail)) return;

    setCartIconLoading(true);
    const ok = await callUpsertAPI(activeSub, quantity, activeColorDetail);
    setCartIconLoading(false);

    if (ok) {
      setSavedToDb(true);
      fetchCart();
    }
  };

  const handleIncrement = () => {
    if (isPlusDisabled || !activeSub) return;
    const nextQty = quantity + 1;

    if (savedToDb) {
      if (checkBatchBoundary(activeSub, quantity, activeColorDetail)) return;
      setQuantity(nextQty);
      setDbUpdateLoading(true);
      callUpsertAPI(activeSub, nextQty, activeColorDetail).then((ok) => {
        if (!ok) setQuantity(quantity);
        else fetchCart();
        setDbUpdateLoading(false);
      });
    } else {
      if (checkBatchBoundary(activeSub, quantity, activeColorDetail)) return;
      setQuantity(nextQty);
    }
  };

  const handleDecrement = () => {
    if (!activeSub) return;

    if (savedToDb) {
      if (quantity <= 1) {
        const prevQty = quantity;
        setQuantity(1);
        setSavedToDb(false);
        setDbUpdateLoading(true);
        callDeleteAPI(activeSub, activeColorDetail).then((ok) => {
          if (!ok) {
            setQuantity(prevQty);
            setSavedToDb(true);
          } else {
            fetchCart();
          }
          setDbUpdateLoading(false);
        });
      } else {
        const newQty = quantity - 1;
        setQuantity(newQty);
        setDbUpdateLoading(true);
        callUpsertAPI(activeSub, newQty, activeColorDetail).then((ok) => {
          if (!ok) setQuantity(quantity);
          else fetchCart();
          setDbUpdateLoading(false);
        });
      }
    } else {
      if (quantity <= 1) {
        setQuantity(1);
      } else {
        setQuantity((q) => q - 1);
      }
    }
  };

  const renderChips = () => {
    const visible = showAllChips
      ? subProducts
      : subProducts.slice(0, MAX_CHIPS_VISIBLE);
    const hasMore = subProducts.length > MAX_CHIPS_VISIBLE;

    if (displayMode === "LOOSE") {
      const label = activeSub?.label ?? "";
      if (!label) return null;
      const pillText = quantity > 0 ? `${label} X ${quantity}` : label;
      return (
        <View style={{ marginBottom: 10 }}>
          <View
            style={{
              alignSelf: "flex-start",
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 20,
              borderWidth: 1.5,
              borderColor: "#FF8000",
              backgroundColor: "#FFF",
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: "#FF8000",
              }}
            >
              {pillText}
            </Text>
          </View>
        </View>
      );
    }

    const hasColorDotsOnly =
      subProducts.every(
        (s) => !s.label || s.label === "Variant" || s.label === s.colorCode,
      ) && subProducts.some((s) => s.colorCode?.trim());

    if (displayMode === "EQUIPMENT" || hasColorDotsOnly) {
      const dots = subProducts.filter((s) => s.colorCode?.trim());
      if (dots.length > 0) {
        return (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: COLOR_DOT_GAP,
              marginBottom: 14,
            }}
          >
            {dots.map((sub) => {
              const hex = resolveColor(sub.colorCode!);
              const isWhite = hex.toLowerCase() === "#ffffff";
              const sel = selectedSubId === sub.id;
              return (
                <TouchableOpacity
                  key={sub.id}
                  onPress={() => handleSelectSub(sub.id)}
                  activeOpacity={0.7}
                  style={{
                    width: COLOR_DOT_SIZE,
                    height: COLOR_DOT_SIZE,
                    borderRadius: COLOR_DOT_SIZE / 2,
                    backgroundColor: hex,
                    borderWidth: sel ? 3 : 1.5,
                    borderColor: sel
                      ? "#FF8000"
                      : isWhite
                        ? "#E0E0E0"
                        : "transparent",
                    elevation: sel ? 4 : 0,
                  }}
                />
              );
            })}
          </View>
        );
      }
      if (displayMode === "EQUIPMENT") return null;
    }

    if (displayMode === "COLOR") {
      const colorDetails: ColorDetail[] = activeSub?.colorDetails ?? [];

      return (
        <>
          {/* Quantity / pieces chips */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: CHIP_GAP,
              marginBottom: colorDetails.length ? 10 : 4,
            }}
          >
            {subProducts.map((sub) => {
              const sel = selectedSubId === sub.id;
              return (
                <TouchableOpacity
                  key={sub.id}
                  onPress={() => handleSelectSub(sub.id)}
                  activeOpacity={0.7}
                  style={{
                    paddingHorizontal: 18,
                    paddingVertical: 7,
                    borderRadius: 20,
                    borderWidth: 1.5,
                    borderColor: sel ? "#FF8000" : "#E0E0E0",
                    backgroundColor: "#FFF",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: sel ? "#FF8000" : "#888",
                    }}
                  >
                    {sub.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Color dots — each with its own price / stock, selectable */}
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
                const isWhite =
                  hex.toLowerCase() === "#ffffff" ||
                  hex.toLowerCase() === "white";
                const sel = selectedColorIndex === index;
                const outOfStock = cd.availableQty <= 0;
                return (
                  <TouchableOpacity
                    key={cd.colorId}
                    activeOpacity={outOfStock ? 1 : 0.7}
                    disabled={outOfStock}
                    onPress={() => handleSelectColor(index)}
                    style={{
                      width: COLOR_DOT_SIZE,
                      height: COLOR_DOT_SIZE,
                      borderRadius: COLOR_DOT_SIZE / 2,
                      backgroundColor: hex,
                      opacity: outOfStock ? 0.3 : 1,
                      borderWidth: sel ? 3 : 1.5,
                      borderColor: sel
                        ? "#FF8000"
                        : isWhite
                          ? "#E0E0E0"
                          : "transparent",
                      elevation: sel ? 4 : 0,
                    }}
                  />
                );
              })}
            </View>
          )}
        </>
      );
    }

    const defaultColorDetails = activeSub?.colorDetails ?? [];

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
            {visible.map((sub, index) => {
              const sel = selectedSubId === sub.id;
              const isLeftChip = index % 2 === 0;
              return (
                <TouchableOpacity
                  key={sub.id}
                  onPress={() => handleSelectSub(sub.id)}
                  activeOpacity={0.7}
                  style={{
                    width: "48%",
                    marginRight: isLeftChip ? "4%" : 0,
                    marginBottom: ROLL_GAP,
                    paddingVertical: 9,
                    borderRadius: 20,
                    borderWidth: 1.5,
                    borderColor: sel ? "#FF8000" : "#C4CEDB",
                    backgroundColor: "#FFF",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: sel ? "#FF8000" : "#111827",
                    }}
                    numberOfLines={1}
                  >
                    {sub.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {hasMore && !showAllChips && (
            <TouchableOpacity onPress={() => setShowAllChips(true)}>
              <Text style={{ color: "#FF8000", fontSize: 12, marginBottom: 6 }}>
                +{subProducts.length - MAX_CHIPS_VISIBLE} more
              </Text>
            </TouchableOpacity>
          )}
        </>
      );
    }

    if (
      visible.length === 1 &&
      visible[0].label === "Variant" &&
      defaultColorDetails.length === 0
    ) {
      return null;
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
          {visible.map((sub) => {
            const sel = selectedSubId === sub.id;
            return (
              <TouchableOpacity
                key={sub.id}
                onPress={() => handleSelectSub(sub.id)}
                activeOpacity={0.7}
                style={{
                  width: CHIP_WIDTH,
                  marginRight: CHIP_GAP,
                  marginBottom: CHIP_GAP,
                  paddingVertical: 8,
                  borderRadius: 20,
                  borderWidth: 1.5,
                  borderColor: sel ? "#FF8000" : "#E0E0E0",
                  backgroundColor: "#FFF",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: sel ? "#FF8000" : "#888",
                  }}
                  numberOfLines={1}
                >
                  {sub.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {defaultColorDetails.length > 0 && (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: COLOR_DOT_GAP,
              marginBottom: 8,
              marginTop: 10,
            }}
          >
            {defaultColorDetails.map((cd, index) => {
              const hex = resolveColor(cd.color);
              const isWhite =
                hex.toLowerCase() === "#ffffff" ||
                hex.toLowerCase() === "white";
              const sel = selectedColorIndex === index;
              const outOfStock = cd.availableQty <= 0;
              return (
                <TouchableOpacity
                  key={cd.colorId}
                  activeOpacity={outOfStock ? 1 : 0.7}
                  disabled={outOfStock}
                  onPress={() => handleSelectColor(index)}
                  style={{
                    width: COLOR_DOT_SIZE,
                    height: COLOR_DOT_SIZE,
                    borderRadius: COLOR_DOT_SIZE / 2,
                    backgroundColor: hex,
                    opacity: outOfStock ? 0.3 : 1,
                    borderWidth: sel ? 3 : 1.5,
                    borderColor: sel
                      ? "#FF8000"
                      : isWhite
                        ? "#E0E0E0"
                        : "transparent",
                    elevation: sel ? 4 : 0,
                  }}
                />
              );
            })}
          </View>
        )}
        {hasMore && !showAllChips && (
          <TouchableOpacity onPress={() => setShowAllChips(true)}>
            <Text style={{ color: "#FF8000", fontSize: 12, marginBottom: 6 }}>
              +{subProducts.length - MAX_CHIPS_VISIBLE} more
            </Text>
          </TouchableOpacity>
        )}
      </>
    );
  };

  const BoundaryModal = () => {
    if (!boundaryModal?.visible || !boundaryModal.sub) return null;
    const { sub, colorDetail, currentBatchPrice, nextBatchPrice } =
      boundaryModal;

    const handleConfirm = () => {
      setBoundaryModal(null);
      const nextQty = quantity + 1;

      if (savedToDb) {
        setQuantity(nextQty);
        setDbUpdateLoading(true);
        callUpsertAPI(sub, nextQty, colorDetail).then((ok) => {
          if (!ok) setQuantity(quantity);
          else fetchCart();
          setDbUpdateLoading(false);
        });
      } else {
        setQuantity(nextQty);
      }
    };

    return (
      <Modal
        transparent
        visible
        animationType="fade"
        onRequestClose={() => setBoundaryModal(null)}
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
              backgroundColor: "#FFF",
              borderRadius: 22,
              width: "100%",
              paddingHorizontal: 24,
              paddingTop: 28,
              paddingBottom: 24,
              elevation: 24,
            }}
          >
            <TouchableOpacity
              onPress={() => setBoundaryModal(null)}
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
              <Ionicons name="close" size={16} color="#AAA" />
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
                  Rs. {fmt(currentBatchPrice)}
                </Text>
                {" has been sold.\n\nThe next batch will be available at "}
                <Text style={{ color: "#FF8000", fontWeight: "700" }}>
                  Rs. {fmt(nextBatchPrice)} /unit.
                </Text>
                {"\n\nContinue at "}
                <Text style={{ color: "#000", fontWeight: "700" }}>
                  Rs. {fmt(nextBatchPrice)} ?
                </Text>
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setBoundaryModal(null)}
              style={{
                backgroundColor: "#E8E8E8",
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
                Cancel &amp; Go Back
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
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
              <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 15 }}>
                Add to Cart
              </Text>
              <Ionicons name="arrow-forward" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#1A1A1A" }}>
      <View style={{ height: IMAGE_HEIGHT }}>
        <Image
          source={require("@/assets/images/govi-shop/shop-profile-header.webp")}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: SCREEN_WIDTH,
            height: 100,
            zIndex: 0,
          }}
          resizeMode="cover"
        />
        <Image
          source={
            image
              ? { uri: image }
              : require("@/assets/images/govi-shop/no-image.webp")
          }
          style={{
            position: "absolute",
            top: 20,
            left: 0,
            width: SCREEN_WIDTH,
            height: SCREEN_WIDTH,
            zIndex: 1,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
          resizeMode="cover"
        />
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
          style={{
            position: "absolute",
            top: Platform.OS === "android" ? 45 : 44,
            left: 14,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: "rgba(255,255,255,0.92)",
            alignItems: "center",
            justifyContent: "center",
            elevation: 4,
            zIndex: 10,
          }}
        >
          <Ionicons name="close" size={18} color="#1A1A2E" />
        </TouchableOpacity>
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={{ flex: 1, backgroundColor: "#FFF" }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: H_PAD,
          paddingTop: 16,
          paddingBottom: 16,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: "#1A1A2E",
            marginBottom: 14,
          }}
        >
          {productName}
        </Text>

        {loading ? (
          <ActivityIndicator
            size="small"
            color="#FF8000"
            style={{ marginVertical: 12 }}
          />
        ) : (
          renderChips()
        )}

        <View
          style={{
            height: 1,
            backgroundColor: "#D3DBE3",
            marginHorizontal: -H_PAD,
            marginTop: 4,
            marginBottom: 14,
          }}
        />

        {activeSub && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#FF8000",
              }}
            >
              Rs. {fmt(activePrice)}
            </Text>
            {hasDiscount && (
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: "#4A4A4A",
                  textDecorationLine: "line-through",
                }}
              >
                Rs. {fmt(originalPrice)}
              </Text>
            )}
          </View>
        )}

        {availableQty !== undefined && (
          <View
            style={{
              alignSelf: "flex-start",
              backgroundColor: "#F0F4FF",
              borderRadius: 6,
              paddingHorizontal: 10,
              paddingVertical: 5,
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 11, color: "#6A728A", fontWeight: "700" }}>
              {availableQty} {stockUnitLabel ? `${stockUnitLabel} ` : ""}Left
            </Text>
          </View>
        )}

        {!!description && (
          <Text
            style={{
              fontSize: 13,
              color: "#8FA3B8",
              lineHeight: 22,
              textAlign: "justify",
            }}
          >
            {description}
          </Text>
        )}
      </ScrollView>

      {showViewCart && cartCount > 0 && (
        <View className="absolute bottom-[100px] left-[25%] right-[25%] z-[999]">
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("CartScreen" as any, {
                shopname,
                branchId: Number(branchId),
              })
            }
            activeOpacity={0.9}
            style={{
              backgroundColor: "#FF8000CC",
              borderRadius: 50,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 12,
              paddingHorizontal: 20,
              elevation: 10,
            }}
          >
            <View>
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
                height: 36,
                width: 36,
                backgroundColor: "white",
                borderRadius: 18,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="chevron-forward" size={18} color="#FF8000" />
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Fixed bottom bar */}
      <View
        style={{
          backgroundColor: "white",
          paddingHorizontal: H_PAD,
          paddingTop: 12,
          paddingBottom: Platform.OS === "ios" ? 28 : 16,
          borderTopWidth: 1,
          borderTopColor: "#F1F1F4",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Subtotal */}
        <View>
          <Text style={{ fontSize: 11, color: "#AAAAAA", fontWeight: "500" }}>
            Subtotal :
          </Text>
          <Text style={{ fontSize: 16, fontWeight: "800", color: "#FF8000" }}>
            Rs. {fmt(subtotal)}
          </Text>
        </View>

        {/* Right side: Stepper + Cart grouped together */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          {/* Stepper */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#FF80001A",
              borderRadius: 30,
              borderWidth: 1,
              borderColor: "#E8E8E8",
              overflow: "hidden",
            }}
          >
            {/* MINUS / TRASH */}
            <TouchableOpacity
              onPress={handleDecrement}
              disabled={dbUpdateLoading}
              style={{
                backgroundColor: dbUpdateLoading ? "#CCCCCC" : "#FF8000",
                width: 38,
                height: 38,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 19,
              }}
            >
              {dbUpdateLoading ? (
                <ActivityIndicator size={16} color="white" />
              ) : quantity <= 1 ? (
                <Ionicons name="trash-outline" size={16} color="white" />
              ) : (
                <Ionicons name="remove" size={18} color="white" />
              )}
            </TouchableOpacity>

            <Text
              style={{
                paddingHorizontal: 14,
                fontWeight: "700",
                fontSize: 15,
                color: "#3F3C57",
                minWidth: 30,
                textAlign: "center",
              }}
            >
              {quantity}
            </Text>

            {/* PLUS */}
            <TouchableOpacity
              onPress={handleIncrement}
              disabled={isPlusDisabled || dbUpdateLoading}
              style={{
                backgroundColor:
                  isPlusDisabled || dbUpdateLoading ? "#CCCCCC" : "#FF8000",
                width: 38,
                height: 38,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 19,
              }}
            >
              {dbUpdateLoading ? (
                <ActivityIndicator size={18} color="white" />
              ) : (
                <Ionicons name="add" size={18} color="white" />
              )}
            </TouchableOpacity>
          </View>

          {!savedToDb && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleCartPress}
              disabled={cartIconLoading}
              style={{
                width: 46,
                height: 46,
                borderRadius: 23,
                backgroundColor: cartIconLoading ? "#AAAAAA" : "#3F3C57",
                alignItems: "center",
                justifyContent: "center",
                elevation: 6,
              }}
            >
              {cartIconLoading ? (
                <ActivityIndicator size={22} color="white" />
              ) : (
                <Ionicons name="cart-outline" size={22} color="white" />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      <BoundaryModal />
    </View>
  );
};

export default ViewProduct;
