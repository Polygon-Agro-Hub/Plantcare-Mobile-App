import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import CustomHeader from "../common/CustomHeader";
import { RootStackParamList } from "../types/types";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/core";
import { environment } from "@/environment/environment";

type CartScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "CartScreen"
>;
type CartScreenRouteProp = RouteProp<RootStackParamList, "CartScreen">;

interface CartScreenProps {
  navigation: CartScreenNavigationProp;
  route: CartScreenRouteProp;
}

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
  productId: number;
  productName: string;
  subProductId: number | null;
  subProdColorId: number | null;
  equipColorId: number | null;
  variantLabel: string;
  pricePerUnit: number;
  originalPrice?: number;
  quantity: number;
  image: string;
  type: ProductType;
  colorCode?: string;
  availableQty?: number;
  isOutOfStock?: boolean;
}

function mapItem(r: any): CartItem {
  return {
    id: String(r.cartItemId),
    productId: Number(r.productId),
    productName: r.productName,
    subProductId: r.subProdId ?? null,
    subProdColorId: r.subProdColorId ?? null,
    equipColorId: r.equipColorId ?? null,
    variantLabel: r.variantLabel ?? "",
    pricePerUnit: Number(r.pricePerUnit ?? 0),
    originalPrice:
      r.originalPrice != null ? Number(r.originalPrice) : undefined,
    quantity: Number(r.qty),
    image: r.productImage ?? "",
    type: (r.type ?? "BOTTLE") as ProductType,
    colorCode: r.colorCode ?? undefined,
    availableQty: r.availableQty != null ? Number(r.availableQty) : undefined,
    isOutOfStock: r.isOutOfStock ?? false,
  };
}

function toCheckoutItem(c: CartItem) {
  return {
    ...c,
    productId: String(c.productId),
    subProductId: c.subProductId != null ? String(c.subProductId) : "",
    subProdColorId: c.subProdColorId != null ? String(c.subProdColorId) : "",
    equipColorId: c.equipColorId != null ? String(c.equipColorId) : "",
  };
}

const SERVICE_CHARGE_RATE = 0.05;

const formatPrice = (n: number) =>
  n.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const resolveColor = (raw?: string): string =>
  raw ? (raw.startsWith("#") ? raw : `#${raw}`) : "#CCCCCC";

const ColorDot: React.FC<{ colorCode: string }> = ({ colorCode }) => {
  const hex = resolveColor(colorCode);
  const isWhite = hex.toLowerCase() === "#ffffff";
  return (
    <View
      style={{
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: hex,
        borderWidth: 1,
        borderColor: isWhite ? "#CCC" : "transparent",
        marginRight: 4,
      }}
    />
  );
};

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
  const atCap =
    item.availableQty !== undefined && item.quantity >= item.availableQty;
  const showColor =
    (item.type === "EQUIPMENT" || item.type === "PIECES") && item.colorCode;

  return (
    <View
      className={`bg-white mb-2 mx-4 rounded-2xl overflow-hidden ${
        item.isOutOfStock ? "border-2 border-red-500" : "border border-gray-100"
      }`}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 3,
      }}
    >
      {/* Left accent bar */}
      <View
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          borderTopLeftRadius: 16,
          borderBottomLeftRadius: 16,
        }}
      />

      <View className="flex-row items-center px-3 py-3 pl-4">
        {/* Product Image */}
        <View className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 mr-3">
          <Image
            source={{ uri: item.image }}
            className="w-full h-full"
            resizeMode="cover"
          />
          {item.isOutOfStock && (
            <View className="absolute inset-0 bg-black/50 items-center justify-center">
              <Text className="text-white font-black text-[8px] text-center leading-3">
                OUT OF{"\n"}STOCK
              </Text>
            </View>
          )}
        </View>

        {/* Details */}
        <View className="flex-1">
          <Text
            className="text-gray-900 font-bold text-sm leading-5"
            numberOfLines={1}
          >
            {item.productName}
          </Text>

          <View className="flex-row items-center mt-0.5">
            {showColor && <ColorDot colorCode={item.colorCode!} />}
            <Text className="text-gray-400 text-xs font-medium">
              {item.variantLabel}
            </Text>
          </View>

          {item.isOutOfStock && (
            <Text className="text-red-500 text-[11px] font-bold mt-0.5">
              Out of Stock
            </Text>
          )}

          <View className="flex-row items-center gap-1 mt-1">
            <Text className="text-[#FF8000] font-extrabold text-sm">
              Rs. {formatPrice(item.pricePerUnit)}
            </Text>
          </View>

          {item.availableQty !== undefined && !item.isOutOfStock && (
            <Text className="text-[#74839F] text-[10px] font-semibold mt-0.5">
              {item.availableQty} {item.availableQty === 1 ? "packet" : "items"}{" "}
              left
            </Text>
          )}
        </View>

        {/* Right side: delete + stepper */}
        <View className="items-end gap-2 ml-2">
          {/* Delete button */}
          <TouchableOpacity
            onPress={() => onRemove(item.id)}
            activeOpacity={0.7}
            className="w-7 h-7 rounded-full bg-red-50 items-center justify-center"
          >
            <Ionicons name="trash-outline" size={13} color="#EF4444" />
          </TouchableOpacity>

          {/* Qty Stepper */}
          {!item.isOutOfStock ? (
            <View
              className="flex-row items-center rounded-full overflow-hidden border border-orange-200"
              style={{ backgroundColor: "#FFF3E0" }}
            >
              <TouchableOpacity
                onPress={() => onDecrease(item.id)}
                className="w-8 h-8 bg-[#FF8000] items-center justify-center rounded-full"
                activeOpacity={0.8}
              >
                {item.quantity === 1 ? (
                  <Ionicons name="trash-outline" size={12} color="white" />
                ) : (
                  <Ionicons name="remove" size={16} color="white" />
                )}
              </TouchableOpacity>

              <Text className="text-gray-800 font-extrabold text-sm min-w-[28px] text-center px-1">
                {item.quantity}
              </Text>

              <TouchableOpacity
                onPress={() => onIncrease(item.id)}
                disabled={atCap}
                activeOpacity={atCap ? 1 : 0.8}
                className={`w-8 h-8 items-center justify-center rounded-full ${
                  atCap ? "bg-gray-300" : "bg-[#FF8000]"
                }`}
              >
                <Ionicons name="add" size={16} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <View className="w-8 h-8" />
          )}
        </View>
      </View>
    </View>
  );
};

const SummaryRow: React.FC<{
  label: string;
  value: string;
  highlight?: boolean;
}> = ({ label, value, highlight }) => (
  <View className="flex-row justify-between items-center mb-2">
    <Text className="text-sm text-[#415479] font-bold">{label}</Text>
    <Text
      className={`text-sm ${
        highlight
          ? "text-[#FF8000] font-bold text-base"
          : "text-[#2E2E2E] font-bold"
      }`}
    >
      {value}
    </Text>
  </View>
);

const CartScreen: React.FC<CartScreenProps> = ({ route, navigation }) => {
  const shopname = route?.params?.shopname ?? "Cart";
  const branchId = route?.params?.branchId;

  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      const { data } = await axios.get(
        `${environment.API_BASE_URL}api/govi-shop/cart`,
        {
          params: { branchId },
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setCart((data.items ?? []).map(mapItem));
    } catch (e: any) {
      setError(e?.message ?? "Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [fetchCart]),
  );

  const upsertItem = useCallback(
    async (item: CartItem, newQty: number) => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) return;

        await axios.post(
          `${environment.API_BASE_URL}api/govi-shop/cart/item`,
          {
            branchId,
            productId: item.productId,
            subProdId: item.subProductId,
            subProdColorId: item.subProdColorId,
            equipColorId: item.equipColorId,
            qty: newQty,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } catch {
        Alert.alert("Error", "Could not update cart. Please try again.");
        fetchCart();
      }
    },
    [branchId, fetchCart],
  );

  const deleteItem = useCallback(
    async (item: CartItem) => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) return;

        await axios.delete(
          `${environment.API_BASE_URL}api/govi-shop/cart/item`,
          {
            headers: { Authorization: `Bearer ${token}` },
            data: {
              branchId,
              productId: item.productId,
              subProdId: item.subProductId,
              subProdColorId: item.subProdColorId,
              equipColorId: item.equipColorId,
            },
          },
        );
      } catch {
        Alert.alert("Error", "Could not remove item. Please try again.");
        fetchCart();
      }
    },
    [branchId, fetchCart],
  );

  const handleIncrease = useCallback(
    (id: string) => {
      setCart((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          if (c.availableQty !== undefined && c.quantity >= c.availableQty)
            return c;
          const updated = { ...c, quantity: c.quantity + 1 };
          upsertItem(updated, updated.quantity);
          return updated;
        }),
      );
    },
    [upsertItem],
  );

  const handleDecrease = useCallback(
    (id: string) => {
      const item = cart.find((c) => c.id === id);
      if (!item) return;

      if (item.quantity === 1) {
        Alert.alert("Remove Item", `Remove "${item.productName}" from cart?`, [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => {
              setCart((p) => p.filter((c) => c.id !== id));
              upsertItem(item, 0);
            },
          },
        ]);
        return;
      }

      setCart((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          const updated = { ...c, quantity: c.quantity - 1 };
          upsertItem(updated, updated.quantity);
          return updated;
        }),
      );
    },
    [cart, upsertItem],
  );

  const handleRemove = useCallback(
    (id: string) => {
      const item = cart.find((c) => c.id === id);
      Alert.alert("Remove Item", `Remove "${item?.productName}" from cart?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setCart((p) => p.filter((c) => c.id !== id));
            if (item) deleteItem(item);
          },
        },
      ]);
    },
    [cart, deleteItem],
  );

  const validItems = cart.filter((c) => !c.isOutOfStock);
  const outOfStockItems = cart.filter((c) => c.isOutOfStock);
  const subtotal = validItems.reduce(
    (s, c) => s + c.pricePerUnit * c.quantity,
    0,
  );
  const serviceCharge = subtotal * SERVICE_CHARGE_RATE;
  const total = subtotal + serviceCharge;
  const cartCount = validItems.reduce((s, c) => s + c.quantity, 0);

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
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Proceed",
          onPress: () =>
            navigation.navigate("CheckoutScreen", {
              cartItems: validItems.map(toCheckoutItem),
              subtotal,
              serviceCharge,
              total,
              cartCount,
              shopName: shopname,
              branchId,
            }),
        },
      ],
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <CustomHeader
          title={shopname}
          showBackButton
          navigation={navigation}
          transparent={false}
        />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF8000" />
          <Text className="text-gray-400 mt-3 text-sm">Loading cart…</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-white">
        <CustomHeader
          title={shopname}
          showBackButton
          navigation={navigation}
          transparent={false}
        />
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="cloud-offline-outline" size={48} color="#CCC" />
          <Text className="text-gray-400 mt-3 text-sm text-center">
            {error}
          </Text>
          <TouchableOpacity
            onPress={fetchCart}
            className="mt-4 bg-[#FF8000] px-6 py-2 rounded-full"
          >
            <Text className="text-white font-bold">Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (cart.length === 0) {
    return (
      <View className="flex-1 bg-white">
        <CustomHeader
          title={shopname}
          showBackButton
          navigation={navigation}
          transparent={false}
        />
        <View className="flex-1 items-center justify-center">
          <Ionicons name="cart-outline" size={64} color="#CCC" />
          <Text className="text-gray-400 mt-3 text-sm">Your cart is empty</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <CustomHeader
        title={shopname}
        showBackButton
        navigation={navigation}
        transparent={false}
      />

      {/* Count header */}
      <View className="px-4 pt-3 pb-2">
        <Text className="text-[#000000] font-semibold text-sm">
          All ({cart.length})
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={cart}
        renderItem={({ item }) => (
          <CartCard
            item={item}
            onIncrease={handleIncrease}
            onDecrease={handleDecrease}
            onRemove={handleRemove}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 4, paddingBottom: 180 }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View className="h-1" />}
        ListFooterComponent={
          <View className="mx-4 mt-5">
            <View className="bg-white rounded-2xl p-4">
              <View className="h-px bg-gray-200 mb-3" />
              <SummaryRow
                label="Subtotal"
                value={`Rs. ${formatPrice(subtotal)}`}
              />
              <SummaryRow
                label={`Service Charge (${(SERVICE_CHARGE_RATE * 100).toFixed(0)}%)`}
                value={`+ Rs. ${formatPrice(serviceCharge)}`}
              />
              <View className="h-px bg-gray-200 my-3" />
              <SummaryRow
                label="Total"
                value={`Rs. ${formatPrice(total)}`}
                highlight
              />
            </View>
          </View>
        }
      />

      {/* Checkout bar */}
      <View className="px-4 pt-3 pb-7">
        <TouchableOpacity
          onPress={handleCheckout}
          activeOpacity={0.88}
          className="rounded-full flex-row items-center justify-center py-4 px-6 bg-[#353535]"
          style={{
            shadowColor: "#3F3C57",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          <Text className="text-white font-extrabold text-base tracking-wide mr-2">
            Go to Checkout
          </Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CartScreen;
