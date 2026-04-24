import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
  Dimensions,
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import CustomHeader from "../common/CustomHeader";

const { width: screenWidth } = Dimensions.get("window");

// ─── Types ────────────────────────────────────────────────────────────────────

type ProductType =
  | "BOTTLE"
  | "ROLL"
  | "PACK"
  | "LOOSE_WEIGHT"
  | "LOOSE_VOLUME"
  | "PIECES"
  | "EQUIPMENT";

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  subProductId: string;
  variantLabel: string; // e.g. "500 ml", "10 m x 0.5 m", "200 g"
  pricePerUnit: number;
  originalPrice?: number; // if discounted
  quantity: number;
  image: string;
  type: ProductType;
  colorCode?: string; // for EQUIPMENT / PIECES
  availableQty?: number; // stock cap; undefined = unlimited
  isOutOfStock?: boolean;
}

// ─── Mock Data (7 product types) ─────────────────────────────────────────────

const INITIAL_CART: CartItem[] = [
  {
    id: "c1",
    productId: "p1",
    productName: "Chlorine Solution",
    subProductId: "s1",
    variantLabel: "500 ml · Bottle",
    pricePerUnit: 350.0,
    quantity: 3,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200",
    type: "BOTTLE",
    availableQty: 10,
  },
  {
    id: "c2",
    productId: "p2",
    productName: "Agricultural Shade Net",
    subProductId: "s2",
    variantLabel: "10 m × 0.5 m · Roll",
    pricePerUnit: 1200.0,
    originalPrice: 1500.0,
    quantity: 2,
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200",
    type: "ROLL",
  },
  {
    id: "c3",
    productId: "p3",
    productName: "Sunflower Seed Packet",
    subProductId: "s3",
    variantLabel: "200 g · Pack",
    pricePerUnit: 180.0,
    quantity: 5,
    image: "https://images.unsplash.com/photo-1490750967868-88df5691166b?w=200",
    type: "PACK",
    availableQty: 5,
  },
  {
    id: "c4",
    productId: "p4",
    productName: "Organic Compost",
    subProductId: "s4",
    variantLabel: "1 kg · Loose Weight",
    pricePerUnit: 95.0,
    quantity: 4,
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200",
    type: "LOOSE_WEIGHT",
  },
  {
    id: "c5",
    productId: "p5",
    productName: "Liquid Fertiliser",
    subProductId: "s5",
    variantLabel: "1 L · Loose Volume",
    pricePerUnit: 220.0,
    originalPrice: 260.0,
    quantity: 2,
    image: "https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=200",
    type: "LOOSE_VOLUME",
  },
  {
    id: "c6",
    productId: "p6",
    productName: "Ceramic Plant Pot",
    subProductId: "s6",
    variantLabel: "6 pcs · Pieces",
    pricePerUnit: 450.0,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=200",
    type: "PIECES",
    colorCode: "FF6B35",
    availableQty: 8,
  },
  {
    id: "c7",
    productId: "p7",
    productName: "Tractor 4WD",
    subProductId: "s7",
    variantLabel: "Red · Equipment",
    pricePerUnit: 1000000.0,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1605338803394-d5a3ccbaf2b6?w=200",
    type: "EQUIPMENT",
    colorCode: "E53935",
    isOutOfStock: true,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SERVICE_CHARGE_RATE = 0.05;

const TYPE_META: Record<
  ProductType,
  {
    icon: string;
    iconSet: "ionicons" | "fa5" | "mci";
    accent: string;
    bg: string;
  }
> = {
  BOTTLE: {
    icon: "water",
    iconSet: "ionicons",
    accent: "#2196F3",
    bg: "#E3F2FD",
  },
  ROLL: { icon: "scroll", iconSet: "fa5", accent: "#9C27B0", bg: "#F3E5F5" },
  PACK: {
    icon: "cube-outline",
    iconSet: "ionicons",
    accent: "#FF8000",
    bg: "#FFF3E0",
  },
  LOOSE_WEIGHT: {
    icon: "weight",
    iconSet: "fa5",
    accent: "#795548",
    bg: "#EFEBE9",
  },
  LOOSE_VOLUME: {
    icon: "flask",
    iconSet: "ionicons",
    accent: "#00BCD4",
    bg: "#E0F7FA",
  },
  PIECES: {
    icon: "apps-outline",
    iconSet: "ionicons",
    accent: "#E91E63",
    bg: "#FCE4EC",
  },
  EQUIPMENT: {
    icon: "construct-outline",
    iconSet: "ionicons",
    accent: "#607D8B",
    bg: "#ECEFF1",
  },
};

const formatPrice = (n: number) =>
  n.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const resolveColor = (raw?: string): string =>
  raw ? (raw.startsWith("#") ? raw : `#${raw}`) : "#CCCCCC";

// ─── Sub-components ───────────────────────────────────────────────────────────

const TypeBadge: React.FC<{ type: ProductType }> = ({ type }) => {
  const meta = TYPE_META[type];
  const label = type.replace("_", " ");

  const IconEl = () => {
    if (meta.iconSet === "fa5")
      return <FontAwesome5 name={meta.icon} size={10} color={meta.accent} />;
    if (meta.iconSet === "mci")
      return (
        <MaterialCommunityIcons
          name={meta.icon as any}
          size={10}
          color={meta.accent}
        />
      );
    return <Ionicons name={meta.icon as any} size={10} color={meta.accent} />;
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: meta.bg,
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 3,
        alignSelf: "flex-start",
        marginBottom: 6,
      }}
    >
      <IconEl />
      <Text
        style={{
          fontSize: 10,
          fontWeight: "700",
          color: meta.accent,
          letterSpacing: 0.4,
        }}
      >
        {label}
      </Text>
    </View>
  );
};

const ColorDot: React.FC<{ colorCode: string; size?: number }> = ({
  colorCode,
  size = 14,
}) => {
  const hex = resolveColor(colorCode);
  const isWhite = hex.toLowerCase() === "#ffffff";
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: hex,
        borderWidth: 1,
        borderColor: isWhite ? "#CCCCCC" : "transparent",
        marginRight: 5,
      }}
    />
  );
};

// ─── Cart Item Card ───────────────────────────────────────────────────────────

interface CartCardProps {
  item: CartItem;
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  onRemove: (id: string) => void;
}

const CartCard: React.FC<CartCardProps> = ({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}) => {
  const meta = TYPE_META[item.type];
  const lineTotal = item.pricePerUnit * item.quantity;
  const atCap =
    item.availableQty !== undefined && item.quantity >= item.availableQty;

  const showColor =
    (item.type === "EQUIPMENT" || item.type === "PIECES") && item.colorCode;

  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        marginBottom: 12,
        overflow: "hidden",
        borderWidth: item.isOutOfStock ? 1.5 : 1,
        borderColor: item.isOutOfStock ? "#FF3B30" : "#F0F0F0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      {/* Accent bar on left */}
      <View
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: item.isOutOfStock ? "#FF3B30" : meta.accent,
          borderTopLeftRadius: 18,
          borderBottomLeftRadius: 18,
        }}
      />

      <View style={{ padding: 14, paddingLeft: 18 }}>
        {/* Out of Stock Banner */}

        <View style={{ flexDirection: "row", gap: 12 }}>
          {/* Product Image */}
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 14,
              overflow: "hidden",
              backgroundColor: meta.bg,
              borderWidth: 1,
              borderColor: "#F0F0F0",
            }}
          >
            <Image
              source={{ uri: item.image }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
            {item.isOutOfStock && (
              <View
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: "rgba(0,0,0,0.45)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{ color: "white", fontWeight: "800", fontSize: 10 }}
                >
                  OUT OF{"\n"}STOCK
                </Text>
              </View>
            )}
          </View>

          {/* Details */}
          <View style={{ flex: 1 }}>
            <TypeBadge type={item.type} />

            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: "#111827",
                lineHeight: 19,
                marginBottom: 3,
              }}
              numberOfLines={2}
            >
              {item.productName}
            </Text>

            {/* Variant label row */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              {showColor && <ColorDot colorCode={item.colorCode!} />}
              <Text
                style={{ fontSize: 12, color: "#8A94A6", fontWeight: "500" }}
              >
                {item.variantLabel}
              </Text>
            </View>

            {/* Stock cap warning */}
            {item.availableQty !== undefined && !item.isOutOfStock && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 3,
                  marginBottom: 4,
                }}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={12}
                  color="#FF8000"
                />
                <Text
                  style={{ fontSize: 11, color: "#FF8000", fontWeight: "600" }}
                >
                  Only {item.availableQty} left
                </Text>
              </View>
            )}

            {/* Price row */}
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <FontAwesome5 name="coins" size={11} color="#3F3C57" />
              <Text
                style={{ fontSize: 15, fontWeight: "800", color: "#FF8000" }}
              >
                Rs. {formatPrice(item.pricePerUnit)}
              </Text>
              {item.originalPrice && (
                <Text
                  style={{
                    fontSize: 11,
                    color: "#BBBBBB",
                    textDecorationLine: "line-through",
                    fontWeight: "500",
                  }}
                >
                  Rs. {formatPrice(item.originalPrice)}
                </Text>
              )}
            </View>
          </View>

          {/* Delete button */}
          <TouchableOpacity
            onPress={() => onRemove(item.id)}
            activeOpacity={0.7}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: "#FFF0EF",
              alignItems: "center",
              justifyContent: "center",
              alignSelf: "flex-start",
            }}
          >
            <Ionicons name="trash-outline" size={15} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View
          style={{ height: 1, backgroundColor: "#F4F4F4", marginVertical: 12 }}
        />

        {/* Bottom row: line total + qty controls */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text style={{ fontSize: 11, color: "#AAAAAA", fontWeight: "500" }}>
              Item Total
            </Text>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#3F3C57" }}>
              Rs. {formatPrice(lineTotal)}
            </Text>
          </View>

          {/* Qty stepper */}
          {!item.isOutOfStock && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#FF80001A",
                borderRadius: 24,
                borderWidth: 1,
                borderColor: "#FFD9B0",
                overflow: "hidden",
              }}
            >
              <TouchableOpacity
                onPress={() => onDecrease(item.id)}
                style={{
                  backgroundColor: "#FF8000",
                  width: 36,
                  height: 36,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 18,
                }}
                activeOpacity={0.8}
              >
                {item.quantity === 1 ? (
                  <Ionicons name="trash-outline" size={15} color="white" />
                ) : (
                  <Ionicons name="remove" size={18} color="white" />
                )}
              </TouchableOpacity>

              <Text
                style={{
                  paddingHorizontal: 14,
                  fontWeight: "800",
                  fontSize: 16,
                  color: "#3F3C57",
                  minWidth: 32,
                  textAlign: "center",
                }}
              >
                {item.quantity}
              </Text>

              <TouchableOpacity
                onPress={() => onIncrease(item.id)}
                disabled={atCap}
                activeOpacity={atCap ? 1 : 0.8}
                style={{
                  backgroundColor: atCap ? "#D0D0D0" : "#FF8000",
                  width: 36,
                  height: 36,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 18,
                }}
              >
                <Ionicons name="add" size={18} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

// ─── Summary Card ─────────────────────────────────────────────────────────────

const SummaryRow: React.FC<{
  label: string;
  value: string;
  highlight?: boolean;
  small?: boolean;
}> = ({ label, value, highlight, small }) => (
  <View
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: small ? 8 : 10,
    }}
  >
    <Text
      style={{
        fontSize: small ? 13 : 14,
        color: highlight ? "#111827" : "#6B7280",
        fontWeight: highlight ? "800" : "500",
      }}
    >
      {label}
    </Text>
    <Text
      style={{
        fontSize: small ? 13 : 15,
        color: highlight ? "#FF8000" : "#374151",
        fontWeight: highlight ? "800" : "600",
      }}
    >
      {value}
    </Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const CartScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const [cart, setCart] = useState<CartItem[]>(INITIAL_CART);

  const validItems = cart.filter((c) => !c.isOutOfStock);
  const outOfStockItems = cart.filter((c) => c.isOutOfStock);

  const subtotal = validItems.reduce(
    (s, c) => s + c.pricePerUnit * c.quantity,
    0,
  );
  const serviceCharge = subtotal * SERVICE_CHARGE_RATE;
  const total = subtotal + serviceCharge;

  const cartCount = validItems.reduce((s, c) => s + c.quantity, 0);

  const handleIncrease = (id: string) => {
    setCart((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        if (c.availableQty !== undefined && c.quantity >= c.availableQty)
          return c;
        return { ...c, quantity: c.quantity + 1 };
      }),
    );
  };

  const handleDecrease = (id: string) => {
    setCart((prev) => {
      const item = prev.find((c) => c.id === id);
      if (!item) return prev;
      if (item.quantity === 1) {
        Alert.alert("Remove Item", `Remove "${item.productName}" from cart?`, [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => setCart((p) => p.filter((c) => c.id !== id)),
          },
        ]);
        return prev;
      }
      return prev.map((c) =>
        c.id === id ? { ...c, quantity: c.quantity - 1 } : c,
      );
    });
  };

  const handleRemove = (id: string) => {
    const item = cart.find((c) => c.id === id);
    Alert.alert("Remove Item", `Remove "${item?.productName}" from cart?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => setCart((p) => p.filter((c) => c.id !== id)),
      },
    ]);
  };

  const handleCheckout = () => {
    if (outOfStockItems.length > 0) {
      Alert.alert(
        "Out of Stock Items",
        "Please remove out-of-stock items before proceeding to checkout.",
      );
      return;
    }
    Alert.alert(
      "Checkout",
      `Proceeding with ${cartCount} items — Rs. ${formatPrice(total)}`,
    );
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <CartCard
      item={item}
      onIncrease={handleIncrease}
      onDecrease={handleDecrease}
      onRemove={handleRemove}
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <CustomHeader
        title="A Tech Lanka"
        showBackButton={true}
        navigation={navigation}
        transparent={true}
        
      />

      {/* ── Product List + Summary ── */}
      <FlatList
        data={cart}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <>
            {/* Divider */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <View
                style={{ flex: 1, height: 1, backgroundColor: "#E5E7EB" }}
              />
              <Text
                style={{
                  marginHorizontal: 12,
                  color: "#9CA3AF",
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                ORDER SUMMARY
              </Text>
              <View
                style={{ flex: 1, height: 1, backgroundColor: "#E5E7EB" }}
              />
            </View>

            {/* Summary card */}
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 18,
                padding: 20,
                borderWidth: 1,
                borderColor: "#F0F0F0",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.07,
                shadowRadius: 8,
                elevation: 4,
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  height: 1,
                  backgroundColor: "#F0F0F0",
                  marginVertical: 10,
                }}
              />

              <SummaryRow
                label="Subtotal"
                value={`Rs. ${formatPrice(subtotal)}`}
              />
              <SummaryRow
                label={`Service Charge (${(SERVICE_CHARGE_RATE * 100).toFixed(0)}%)`}
                value={`+ Rs. ${formatPrice(serviceCharge)}`}
              />

              <View
                style={{
                  height: 1,
                  backgroundColor: "#E5E7EB",
                  marginVertical: 10,
                }}
              />

              <SummaryRow
                label="Total"
                value={`Rs. ${formatPrice(total)}`}
                highlight
              />
            </View>
          </>
        }
      />

      {/* ── Checkout Bar ── */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#FFFFFF",
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 28,
          borderTopWidth: 1,
          borderTopColor: "#F0F0F0",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 12,
        }}
      >
        <TouchableOpacity
          onPress={handleCheckout}
          activeOpacity={0.88}
          style={{
            backgroundColor: outOfStockItems.length > 0 ? "#9CA3AF" : "#3F3C57",
            borderRadius: 50,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 16,
            paddingHorizontal: 24,
            shadowColor: "#3F3C57",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 14,
            elevation: 10,
          }}
        >
          <View>
            <Text
              style={{
                color: "white",
                fontWeight: "800",
                fontSize: 16,
                letterSpacing: 0.3,
              }}
            >
              Go to Checkout
            </Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 12,
                marginTop: 1,
              }}
            >
              {cartCount} {cartCount === 1 ? "item" : "items"} · Rs.{" "}
              {formatPrice(total)}
            </Text>
          </View>
          <View
            style={{
              width: 44,
              height: 44,
              backgroundColor: "#FF8000",
              borderRadius: 22,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="arrow-forward" size={22} color="white" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CartScreen;
