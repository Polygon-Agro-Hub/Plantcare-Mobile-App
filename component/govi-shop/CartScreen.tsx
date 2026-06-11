import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
} from "react-native";
import {
  Ionicons,
} from "@expo/vector-icons";
import CustomHeader from "../common/CustomHeader";
import { RootStackParamList } from "../types/types";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/core";

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
  productId: string;
  productName: string;
  subProductId: string;
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

const INITIAL_CART: CartItem[] = [
  {
    id: "c1",
    productId: "p1",
    productName: "Chlorine",
    subProductId: "s1",
    variantLabel: "20 ml",
    pricePerUnit: 100.0,
    quantity: 8,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200",
    type: "BOTTLE",
    availableQty: 10,
  },
  {
    id: "c2",
    productId: "p2",
    productName: "Chlorine",
    subProductId: "s2",
    variantLabel: "20 ml",
    pricePerUnit: 105.0,
    originalPrice: 130.0,
    quantity: 2,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200",
    type: "BOTTLE",
    availableQty: 1,
  },
  {
    id: "c3",
    productId: "p3",
    productName: "Sunflower Seed Packet",
    subProductId: "s3",
    variantLabel: "200 g",
    pricePerUnit: 100.0,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1490750967868-88df5691166b?w=200",
    type: "PACK",
    availableQty: 1,
  },
  {
    id: "c4",
    productId: "p4",
    productName: "Pesticide - Spray",
    subProductId: "s4",
    variantLabel: "500 ml",
    pricePerUnit: 100.0,
    quantity: 5,
    image: "https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=200",
    type: "LOOSE_VOLUME",
    availableQty: 10,
  },
  {
    id: "c5",
    productId: "p5",
    productName: "Compost",
    subProductId: "s5",
    variantLabel: "500 g",
    pricePerUnit: 100.0,
    quantity: 5,
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200",
    type: "LOOSE_WEIGHT",
    availableQty: 10,
  },
  {
    id: "c6",
    productId: "p6",
    productName: "Compost",
    subProductId: "s6",
    variantLabel: "500 g",
    pricePerUnit: 100.0,
    quantity: 5,
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200",
    type: "LOOSE_WEIGHT",
    availableQty: 10,
  },
  {
    id: "c7",
    productId: "p7",
    productName: "Chicken Mesh",
    subProductId: "s7",
    variantLabel: "10 m x 0.5 m",
    pricePerUnit: 100.0,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1605338803394-d5a3ccbaf2b6?w=200",
    type: "ROLL",
    availableQty: 10,
  },
  {
    id: "c8",
    productId: "p8",
    productName: "Tractor 4WD",
    subProductId: "s8",
    variantLabel: "Red · Equipment",
    pricePerUnit: 1000000.0,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1605338803394-d5a3ccbaf2b6?w=200",
    type: "EQUIPMENT",
    colorCode: "E53935",
    availableQty: 10,
  },
  {
    id: "c9",
    productId: "p9",
    productName: "Tractor 4WD",
    subProductId: "s9",
    variantLabel: "Color",
    pricePerUnit: 1000000.0,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1605338803394-d5a3ccbaf2b6?w=200",
    type: "EQUIPMENT",
    colorCode: "E53935",
    availableQty: 10,
  },
  {
    id: "c10",
    productId: "p10",
    productName: "Plastic Plant Pot",
    subProductId: "s10",
    variantLabel: "5 pcs",
    pricePerUnit: 1000000.0,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=200",
    type: "PIECES",
    colorCode: "E53935",
    isOutOfStock: true,
  },
];

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
          {/* Name row */}
          <Text
            className="text-gray-900 font-bold text-sm leading-5"
            numberOfLines={1}
          >
            {item.productName}
          </Text>

          {/* Variant + color */}
          <View className="flex-row items-center mt-0.5">
            {showColor && <ColorDot colorCode={item.colorCode!} />}
            <Text className="text-gray-400 text-xs font-medium">
              {item.variantLabel}
            </Text>
          </View>

          {/* Out of stock text badge */}
          {item.isOutOfStock && (
            <Text className="text-red-500 text-[11px] font-bold mt-0.5">
              Out of Stock
            </Text>
          )}

          {/* Price */}
          <View className="flex-row items-center gap-1 mt-1">
            <Text className="text-[#FF8000] font-extrabold text-sm">
              Rs. {formatPrice(item.pricePerUnit)}
            </Text>
          </View>

          {/* Stock cap warning */}
          {item.availableQty !== undefined && !item.isOutOfStock && (
            <View className="flex-row items-center gap-1 mt-0.5">
              <Text className="text-[#74839F] text-[10px] font-semibold">
                {item.availableQty}{" "}
                {item.availableQty === 1 ? "packet" : "items"} left
              </Text>
            </View>
          )}
        </View>

        {/* Right side: delete + stepper */}
        <View className="items-end gap-2 ml-2">
          {/* Delete */}
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
                className={`w-8 h-8 items-center justify-center rounded-full ${atCap ? "bg-gray-300" : "bg-[#FF8000]"}`}
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
    <Text
      className={`text-sm text-[#415479] font-bold `}
    >
      {label}
    </Text>
    <Text
      className={`text-sm ${highlight ? "text-[#FF8000] font-bold text-base" : "text-[#2E2E2E] font-bold"}`}
    >
      {value}
    </Text>
  </View>
);

const CartScreen: React.FC<CartScreenProps> = ({ route, navigation }) => {
  const shopname = route?.params?.shopname ?? "Cart";
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
  const totalItemCount = cart.length;

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
    [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Proceed", 
        onPress: () => navigation.navigate('CheckoutScreen', {
          cartItems: validItems,
          subtotal: subtotal,
          serviceCharge: serviceCharge,
          total: total,
          cartCount: cartCount,
          shopName: shopname,
        })
      }
    ]
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
    <View className="flex-1 bg-white">
      <CustomHeader
        title={shopname}
        showBackButton={true}
        navigation={navigation}
        transparent={false}
      />

      {/* ── Count header ── */}
      <View className="px-4 pt-3 pb-2">
        <Text className="text-[#000000] font-semibold text-sm">
          All ({totalItemCount})
        </Text>
      </View>

      {/* ── List ── */}
      <FlatList
        data={cart}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 4, paddingBottom: 180 }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View className="h-1" />}
        ListFooterComponent={
          <View className="mx-4 mt-5">
           
           

            {/* Summary card */}
            <View
              className="bg-white rounded-2xl p-4 "
           
            >
                  <View className="h-px bg-gray-200 mb-3" />
              <SummaryRow
                label="Subtotal"
                value={`Rs. ${formatPrice(subtotal)}`}
              />
              <SummaryRow
                label={`Service Charge(${(SERVICE_CHARGE_RATE * 100).toFixed(0)}%)`}
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

      {/* ── Checkout Bar ── */}
      <View className=" px-4 pt-3 pb-7 ">
        <TouchableOpacity
          onPress={handleCheckout}
          activeOpacity={0.88}
          className={`rounded-full flex-row items-center justify-center py-4 px-6 bg-[#353535]`}
          style={{
            shadowColor: "#3F3C57",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          <View>
            <Text className="text-white font-extrabold text-base tracking-wide">
              Go to Checkout
            </Text>
          </View>

          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CartScreen;
