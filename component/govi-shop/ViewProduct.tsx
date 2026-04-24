import React, { useState, useEffect } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { RootStackParamList } from "../types/types";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/core";
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
}

type UomDisplayMode = "DEFAULT" | "LOOSE" | "ROLL" | "COLOR" | "EQUIPMENT";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IMAGE_HEIGHT = SCREEN_WIDTH * 0.85;
const H_PAD = 16;

const CHIP_COLUMNS = 4;
const CHIP_GAP = 8;
const CHIP_WIDTH =
  (SCREEN_WIDTH - H_PAD * 2 - CHIP_GAP * (CHIP_COLUMNS - 1)) / CHIP_COLUMNS;
const MAX_CHIPS_VISIBLE = CHIP_COLUMNS * 3;

const ROLL_GAP = 8;
const ROLL_CHIP_WIDTH = (SCREEN_WIDTH - H_PAD * 2 - ROLL_GAP) / 2;

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
  return t.startsWith("#") ? t : `#${t}`;
};

const ViewProduct: React.FC<ViewProductProps> = ({ route, navigation }) => {
  const {
    productId,
    productName,
    image,
    baseUom = "",
    branchId,
    description: routeDescription = "",
  } = route.params as any;

  const displayMode = getDisplayMode(baseUom);

  const [subProducts, setSubProducts] = useState<SubProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubId, setSelectedSubId] = useState<string>("");
  const [showAllChips, setShowAllChips] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showViewCart, setShowViewCart] = useState(false);
  const [description, setDescription] = useState<string>(routeDescription);

  const [boundaryModal, setBoundaryModal] = useState<{
    visible: boolean;
    sub: SubProduct | null;
    currentBatchPrice: number;
    nextBatchPrice: number;
  } | null>(null);

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

        const mapped: SubProduct[] = data.map((v: any) => {
          let label = "";
          if (displayMode === "ROLL") {
            const w = v.width != null ? parseFloat(String(v.width)) : "";
            const h = v.height != null ? parseFloat(String(v.height)) : "";
            const uom = v.uom ?? "m";
            label =
              w !== "" && h !== ""
                ? `${w} x ${h} ${uom}`.trim()
                : `${w || h} ${uom}`.trim();
          } else if (displayMode === "COLOR") {
            const q = v.qty ?? 1;
            label = `${q} ${q === 1 ? "pc" : "pcs"}`;
          } else if (displayMode === "EQUIPMENT") {
            label = v.color ?? "";
          } else {
            label = `${v.qty ?? ""} ${v.uom ?? ""}`.trim();
          }
          return {
            id: String(v.variantId),
            label,
            price: Number(v.normalPrice ?? 0),
            discountPrice:
              v.discountPrice != null ? Number(v.discountPrice) : undefined,
            colorCode: v.color ?? undefined,
            colors: Array.isArray(v.colors) ? v.colors : undefined,
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
      } catch {
        setSubProducts(DEFAULT_SUB_PRODUCTS);
        setSelectedSubId(DEFAULT_SUB_PRODUCTS[0].id);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  const activeSub =
    displayMode === "EQUIPMENT"
      ? subProducts
          .filter((s) => s.colorCode?.trim())
          .find((s) => s.id === selectedSubId)
      : subProducts.find((s) => s.id === selectedSubId);

  const activePrice = activeSub
    ? (activeSub.discountPrice ?? activeSub.price)
    : 0;
  const originalPrice = activeSub?.price ?? 0;
  const hasDiscount =
    !!activeSub?.discountPrice && activeSub.discountPrice < activeSub.price;
  const availableQty =
    activeSub?.availableQty && activeSub.availableQty > 0
      ? activeSub.availableQty
      : undefined;
  const subtotal = activePrice * quantity;
  const isPlusDisabled = availableQty !== undefined && quantity >= availableQty;

  const handleSelectSub = (id: string) => {
    setSelectedSubId(id);
    setQuantity(1);
    setShowViewCart(false);
  };

  const handleCartPress = () => {
    if (!activeSub) return;
    if (checkBatchBoundary(activeSub, quantity)) return;
    setShowViewCart(true);
  };

  const checkBatchBoundary = (sub: SubProduct, qty: number): boolean => {
    if (sub.isMRP !== 1 || !sub.batches || sub.batches.length <= 1)
      return false;
    let cum = 0;
    for (let i = 0; i < sub.batches.length - 1; i++) {
      cum += sub.batches[i].qty;
      if (qty === cum) {
        const cur = sub.batches[i].salePrice;
        const next = sub.batches[i + 1].salePrice;
        if (next !== cur) {
          setBoundaryModal({
            visible: true,
            sub,
            currentBatchPrice: cur,
            nextBatchPrice: next,
          });
          return true;
        }
      }
    }
    return false;
  };

  const handleIncrement = () => {
    if (isPlusDisabled || !activeSub) return;
    const nextQty = quantity + 1;

    if (showViewCart && checkBatchBoundary(activeSub, quantity)) return;
    setQuantity(nextQty);
  };

  const renderChips = () => {
    const visible = showAllChips
      ? subProducts
      : subProducts.slice(0, MAX_CHIPS_VISIBLE);
    const hasMore = subProducts.length > MAX_CHIPS_VISIBLE;

    if (displayMode === "EQUIPMENT") {
      const dots = subProducts.filter((s) => s.colorCode?.trim());
      if (!dots.length) return null;
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

    if (displayMode === "COLOR") {
      const dotColors: string[] = activeSub?.colors?.length
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
              marginBottom: dotColors.length ? 10 : 4,
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
          {dotColors.length > 0 && (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: COLOR_DOT_GAP,
                marginBottom: 8,
              }}
            >
              {dotColors.map((raw, i) => {
                const hex = resolveColor(raw);
                return (
                  <View
                    key={i}
                    style={{
                      width: COLOR_DOT_SIZE,
                      height: COLOR_DOT_SIZE,
                      borderRadius: COLOR_DOT_SIZE / 2,
                      backgroundColor: hex,
                      borderWidth: 1.5,
                      borderColor:
                        hex.toLowerCase() === "#ffffff"
                          ? "#E0E0E0"
                          : "transparent",
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
            {visible.map((sub) => {
              const sel = selectedSubId === sub.id;
              return (
                <TouchableOpacity
                  key={sub.id}
                  onPress={() => handleSelectSub(sub.id)}
                  activeOpacity={0.7}
                  style={{
                    width: ROLL_CHIP_WIDTH,
                    paddingVertical: 9,
                    borderRadius: 20,
                    borderWidth: 1.5,
                    borderColor: sel ? "#FF8000" : "#E0E0E0",
                    backgroundColor: "#FFF",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
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
    const { sub, currentBatchPrice, nextBatchPrice } = boundaryModal;
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
              onPress={() => {
                setBoundaryModal(null);
                setQuantity((q) => q + 1);
                setShowViewCart(true);
              }}
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
      <StatusBar barStyle="light-content" />

      {/* Hero image */}
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
            bottom: 0,
            left: 0,
            width: SCREEN_WIDTH,
            height: IMAGE_HEIGHT - 40,
            zIndex: 1,
            borderRadius: 16,
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
        {/* Name */}
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

        {/* Variant chips */}
        {loading ? (
          <ActivityIndicator
            size="small"
            color="#FF8000"
            style={{ marginVertical: 12 }}
          />
        ) : (
          renderChips()
        )}

        {/* Price */}
        {activeSub && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginTop: 4,
              marginBottom: 8,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <FontAwesome5 name="coins" size={13} color="#1A1A2E" />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: "#FF8000",
                  marginLeft: 4,
                }}
              >
                Rs. {fmt(activePrice)}
              </Text>
            </View>
            {hasDiscount && (
              <Text
                style={{
                  fontSize: 13,
                  color: "#AAAAAA",
                  textDecorationLine: "line-through",
                }}
              >
                Rs. {fmt(originalPrice)}
              </Text>
            )}
          </View>
        )}

        {/* Availability badge */}
        {availableQty !== undefined && (
          <View
            style={{
              alignSelf: "flex-start",
              backgroundColor: "#F3F3F3",
              borderRadius: 15,
              paddingHorizontal: 12,
              paddingVertical: 5,
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 12, color: "#555", fontWeight: "500" }}>
              {availableQty} Left
            </Text>
          </View>
        )}

        {/* Description */}
        {!!description && (
          <Text
            style={{
              fontSize: 13,
              color: "#555",
              lineHeight: 20,
              textAlign: "justify",
            }}
          >
            {description}
          </Text>
        )}
      </ScrollView>

      {/* View Cart pill */}
      {showViewCart && quantity > 0 && (
        <View
          style={{
            position: "absolute",
            bottom: Platform.OS === "ios" ? 128 : 112,
            left: "15%",
            right: "15%",
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
                {quantity} {quantity === 1 ? "item" : "items"}
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
          <TouchableOpacity
            onPress={() => {
              if (quantity <= 1) {
                setQuantity(1);
                setShowViewCart(false);
              } else {
                setQuantity((q) => q - 1);
              }
            }}
            style={{
              backgroundColor: "#FF8000",
              width: 38,
              height: 38,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 19,
            }}
          >
            {quantity <= 1 ? (
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

          <TouchableOpacity
            onPress={handleIncrement}
            disabled={isPlusDisabled}
            style={{
              backgroundColor: isPlusDisabled ? "#CCCCCC" : "#FF8000",
              width: 38,
              height: 38,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 19,
            }}
          >
            <Ionicons name="add" size={18} color="white" />
          </TouchableOpacity>
        </View>

        {!showViewCart && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleCartPress}
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              backgroundColor: "#3F3C57",
              alignItems: "center",
              justifyContent: "center",
              elevation: 6,
            }}
          >
            <Ionicons name="cart-outline" size={22} color="white" />
          </TouchableOpacity>
        )}
      </View>

      <BoundaryModal />
    </View>
  );
};

export default ViewProduct;
