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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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

interface SubProduct {
  id: string;
  label: string;
  price: number;
  discountPrice?: number;
  availableQty?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IMAGE_HEIGHT = SCREEN_WIDTH * 0.85;

const CHIP_COLUMNS = 4;
const CHIP_GAP = 8;
const CHIP_WIDTH =
  (SCREEN_WIDTH - 32 - CHIP_GAP * (CHIP_COLUMNS - 1)) / CHIP_COLUMNS;

const formatPrice = (price: number): string =>
  price.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const DEFAULT_SUB_PRODUCTS: SubProduct[] = [
  { id: "d_25ml",  label: "25 ml",  price: 100 },
  { id: "d_100ml", label: "100 ml", price: 200 },
  { id: "d_500ml", label: "500 ml", price: 500 },
  { id: "d_1l",    label: "1 L",    price: 1000 },
  { id: "d_2l",    label: "2 L",    price: 2000 },
  { id: "d_5l",    label: "5 L",    price: 5000 },
  { id: "d_10l",   label: "10 L",   price: 10000 },
  { id: "d_20l",   label: "20 L",   price: 20000 },
  { id: "d_25l",   label: "25 L",   price: 25000 },
  { id: "d_30l",   label: "30 L",   price: 30000 },
  { id: "d_50l",   label: "50 L",   price: 50000 },
];

const ViewProduct: React.FC<ViewProductProps> = ({ route, navigation }) => {
  const { productId, productName, image } = route.params as any;

  const [subProducts, setSubProducts] = useState<SubProduct[]>([]);
  const [loading, setLoading]         = useState(true);
  const [selectedSubId, setSelectedSubId] = useState<string>("");
  const [quantity, setQuantity]       = useState(1);
  const [showViewCart, setShowViewCart] = useState(false);

  // ── Fetch variants ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchVariants = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("userToken");
        if (!token) return;

        const response = await axios.get(
          `${environment.API_BASE_URL}api/govi-shop/products/${productId}/variants`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        const mapped: SubProduct[] = response.data.map((v: any) => ({
          id:            String(v.variantId),
          label:         `${v.qty} ${v.uom ?? ""}`.trim(),
          price:         v.normalPrice ?? 0,
          discountPrice: v.discountPrice ?? undefined,
          availableQty:  v.availableQty ?? undefined,
        }));

        const finalSubs = mapped.length > 0 ? mapped : DEFAULT_SUB_PRODUCTS;
        setSubProducts(finalSubs);
        setSelectedSubId(finalSubs[0].id);
      } catch {
        setSubProducts(DEFAULT_SUB_PRODUCTS);
        setSelectedSubId(DEFAULT_SUB_PRODUCTS[0].id);
      } finally {
        setLoading(false);
      }
    };

    fetchVariants();
  }, [productId]);

  // ── Derived values ──────────────────────────────────────────────────
  const activeSub    = subProducts.find((s) => s.id === selectedSubId);
  const activePrice  = activeSub ? (activeSub.discountPrice || activeSub.price || 0) : 0;
  const originalPrice = activeSub?.price ?? 0;
  const hasDiscount  = activeSub?.discountPrice !== undefined && activeSub.discountPrice < activeSub.price;
  const availableQty = activeSub?.availableQty;
  const subtotal     = activePrice * quantity;

  // ── Handlers ────────────────────────────────────────────────────────
  const increment = () => setQuantity((q) => q + 1);
  const decrement = () => setQuantity((q) => (q <= 1 ? 1 : q - 1));

  return (
    <View style={{ flex: 1, backgroundColor: "#1A1A1A" }}>
      <StatusBar barStyle="light-content" />

      {/* ── Image section ──────────────────────────────────────────── */}
      <View style={{ height: IMAGE_HEIGHT }}>
        <Image
          source={require("@/assets/images/govi-shop/shop-profile-header.webp")}
          style={{
            position: "absolute",
            top: 0, left: 0,
            width: SCREEN_WIDTH, height: 100,
            zIndex: 0,
          }}
          resizeMode="cover"
        />

        <Image
          source={image ? { uri: image } : require("@/assets/images/govi-shop/no-image.webp")}
          style={{
            position: "absolute",
            bottom: 0, left: 0,
            width: SCREEN_WIDTH,
            height: IMAGE_HEIGHT - 40,
            zIndex: 1,
            borderRadius: 16,
          }}
          resizeMode="cover"
        />

        {/* Close / back button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
          style={{
            position: "absolute",
            top: Platform.OS === "android" ? 45 : 44,
            left: 14,
            width: 32, height: 32,
            borderRadius: 16,
            backgroundColor: "rgba(255,255,255,0.92)",
            alignItems: "center", justifyContent: "center",
            shadowOpacity: 0.2, shadowRadius: 6,
            elevation: 4, zIndex: 10,
          }}
        >
          <Ionicons name="close" size={18} color="#1A1A2E" />
        </TouchableOpacity>
      </View>

      {/* ── Scrollable content ─────────────────────────────────────── */}
      <ScrollView
        style={{ flex: 1, backgroundColor: "#FFFFFF" }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 24,
        }}
      >
        {/* Product name */}
        <Text style={{ fontSize: 20, fontWeight: "700", color: "#1A1A2E", marginBottom: 12 }}>
          {productName}
        </Text>

        {/* Variant chips */}
        {loading ? (
          <ActivityIndicator size="small" color="#FF8000" style={{ marginVertical: 12 }} />
        ) : (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              marginRight: -CHIP_GAP,
              marginBottom: 16,
            }}
          >
            {subProducts.map((sub) => {
              const isSelected = selectedSubId === sub.id;
              return (
                <TouchableOpacity
                  key={sub.id}
                  onPress={() => {
                    setSelectedSubId(sub.id);
                    setQuantity(1);
                    setShowViewCart(false);
                  }}
                  activeOpacity={0.7}
                  style={{
                    width: CHIP_WIDTH,
                    marginRight: CHIP_GAP,
                    marginBottom: CHIP_GAP,
                    paddingVertical: 8,
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
        )}

        {/* Price row */}
        {activeSub && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#FF8000" }}>
              Rs. {formatPrice(activePrice)}
            </Text>
            {hasDiscount && (
              <Text style={{ fontSize: 14, color: "#AAAAAA", textDecorationLine: "line-through" }}>
                Rs. {formatPrice(originalPrice)}
              </Text>
            )}
          </View>
        )}

        {/* Available qty badge */}
        {availableQty !== undefined && availableQty > 0 && (
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
            <Text style={{ fontSize: 12, color: "#555555", fontWeight: "500" }}>
              {availableQty} Left
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ── "View Cart" floating pill (appears on cart icon press) ─── */}
      {showViewCart && (
        <View
          style={{
            position: "absolute",
            bottom: Platform.OS === "ios" ? 120 : 104,
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
              shadowColor: "#3F3C57",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 10,
            }}
          >
            <View>
              <Text style={{ color: "white", fontWeight: "700", fontSize: 15, letterSpacing: 0.3 }}>
                View Cart
              </Text>
              <Text style={{ color: "white", fontSize: 12, opacity: 0.85 }}>
                {quantity} {quantity === 1 ? "item" : "items"}
              </Text>
            </View>

            <View
              style={{
                height: 36, width: 36,
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

      {/* ── Bottom bar ─────────────────────────────────────────────── */}
      <View
        style={{
          backgroundColor: "white",
          paddingHorizontal: 16,
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
          <Text style={{ fontSize: 11, color: "#AAAAAA", fontWeight: "500" }}>Subtotal :</Text>
          <Text style={{ fontSize: 16, fontWeight: "800", color: "#FF8000" }}>
            Rs. {formatPrice(subtotal)}
          </Text>
        </View>

        {/* Qty stepper */}
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
            onPress={decrement}
            style={{
              backgroundColor: "#FF8000",
              width: 38, height: 38,
              alignItems: "center", justifyContent: "center",
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
            onPress={increment}
            style={{
              backgroundColor: "#FF8000",
              width: 38, height: 38,
              alignItems: "center", justifyContent: "center",
              borderRadius: 19,
            }}
          >
            <Ionicons name="add" size={18} color="white" />
          </TouchableOpacity>
        </View>

        {/* Cart icon — tap to show the View Cart pill */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setShowViewCart(true)}
          style={{
            width: 46, height: 46,
            borderRadius: 23,
            backgroundColor: "#3F3C57",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#3F3C57",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 6,
          }}
        >
          <Ionicons name="cart-outline" size={22} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ViewProduct;