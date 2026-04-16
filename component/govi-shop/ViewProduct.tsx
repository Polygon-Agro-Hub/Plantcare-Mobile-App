import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  StatusBar,
  Platform,
  Modal,
  Animated,
} from "react-native";
import { FontAwesome6, Fontisto, Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../types/types";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/core";

type ViewProductNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ViewProduct"
>;
type ViewProductRouteProp = RouteProp<RootStackParamList, "ViewProduct">;

interface Product {
  id: string;
  name: string;
  image: string;
  normalPrice: number;
  discountPrice?: number;
  unit: string;
  level?: string;
  availableQty?: number;
  description?: string;
  categoryId?: string;
  qty?: number;
}

interface ViewProductProps {
  navigation: ViewProductNavigationProp;
  route: ViewProductRouteProp;
  product?: Product;
  onClose?: () => void;
  onViewDetails?: (product: Product, quantity: number) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const { width: screenWidth } = Dimensions.get("window");
const IMAGE_HEIGHT = SCREEN_WIDTH * 0.9;

const formatPrice = (price: number): string =>
  price.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const getStepSize = (unit: string): number => {
  const u = unit?.toLowerCase() ?? "";
  if (u.includes("ml")) return 50;
  if (u.includes("litre") || u === "l") return 0.5;
  if (u.includes("kg")) return 0.5;
  if (u.includes("g")) return 100;
  return 1;
};

const formatQty = (val: number, step: number): string => {
  const decimals = step < 1 ? (step.toString().split(".")[1]?.length ?? 1) : 0;
  return val.toFixed(decimals);
};

const DEMO_PRODUCT: Product = {
  id: "1",
  name: "Pesticide Powder",
  image: "https://images.unsplash.com/photo-1592997572594-34be38511e46?w=800",
  normalPrice: 500,
  unit: "kg",
  level: "Premium",
  availableQty: 50.125,
  description:
    "Pesticide powder is a dry, finely ground chemical formulation used to control or eliminate pests such as insects, weeds, fungi, or rodents. It is one of the simplest and oldest forms of pesticides and is widely used in agriculture, gardening, and public health.",
};

interface ConfirmOption {
  label: string;
  qty: number;
  breakdown?: { qty: number; price: number; unit: string }[];
  pricePerUnit: number;
  unit: string;
}

interface ConfirmModalProps {
  visible: boolean;
  product: Product;
  quantity: number;
  onClose: () => void;
  onConfirm: (selectedOption: ConfirmOption) => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  product,
  quantity,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.60)",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <TouchableOpacity activeOpacity={1}>
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.2,
              shadowRadius: 20,
              elevation: 12,
              minWidth: 220,
            }}
          >
            <TouchableOpacity
              onPress={onClose}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: "#E5E7EB",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="close" size={14} color="#999" />
            </TouchableOpacity>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginTop: 4,
              }}
            >
              <Fontisto name="shopping-bag" size={18} color="#FF8000" />
              <Text style={{ fontSize: 15, color: "#111" }}>
                Added to the Cart
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const ViewProduct: React.FC<ViewProductProps> = ({ route, navigation }) => {
  const product = route?.params?.product || DEMO_PRODUCT;

  const stepSize = getStepSize(product.unit);
  const minOrder = stepSize;

  const [quantity, setQuantity] = useState<number>(minOrder);
  const [modalVisible, setModalVisible] = useState(false);

  const activePrice = product.discountPrice ?? product.normalPrice;

  const increment = () =>
    setQuantity((prev) => parseFloat((prev + stepSize).toFixed(4)));

  const decrement = () =>
    setQuantity((prev) => {
      const next = parseFloat((prev - stepSize).toFixed(4));
      return next < minOrder ? minOrder : next;
    });

  const getImageSource = () => {
    if (!product.image) {
      return require("@/assets/images/govi-shop/no-image.webp");
    }
    return { uri: product.image };
  };

  const handleConfirm = (selectedOption: ConfirmOption) => {
    console.log("Added to cart:", product.name, selectedOption);
  };

  return (
    <View className="flex-1 bg-[#1A1A1A]" style={{ overflow: "hidden" }}>
      <StatusBar barStyle="light-content" />

      <View style={{ height: IMAGE_HEIGHT }}>
        <Image
          source={require("@/assets/images/govi-shop/shop-profile-header.webp")}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: screenWidth,
            height: 100,
            zIndex: 0,
          }}
          resizeMode="cover"
        />

        <Image
          source={getImageSource()}
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
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 4,
            zIndex: 10,
          }}
        >
          <Ionicons name="close" size={18} color="#1A1A2E" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 bg-white"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 20,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: "#1A1A2E",
            marginBottom: 4,
          }}
        >
          {product.name}
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "baseline",
            gap: 2,
            marginBottom: 10,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "800", color: "#FF8000" }}>
            Rs. {formatPrice(activePrice)}
          </Text>
        </View>

        {product.availableQty && (
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
              {formatQty(product.availableQty, stepSize)} Available
            </Text>
          </View>
        )}

        <Text
          style={{
            fontSize: 13,
            color: "#666",
            lineHeight: 20,
            textAlign: "justify",
          }}
        >
          {product.description ??
            `${product.name} is a professionally formulated agricultural product suitable for a wide range of farming applications.`}
        </Text>
      </ScrollView>

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
          gap: 12,
        }}
      >
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={decrement}
            activeOpacity={0.8}
            style={{
              width: 30,
              height: 30,
              borderRadius: 20,
              backgroundColor: "#FF8000",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="remove" size={20} color="white" />
          </TouchableOpacity>

          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#1A1A2E" }}>
              {formatQty(quantity, stepSize)}
            </Text>
          </View>

          <TouchableOpacity
            onPress={increment}
            activeOpacity={0.8}
            style={{
              width: 30,
              height: 30,
              borderRadius: 20,
              backgroundColor: "#FF8000",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View className="pl-[10%]">
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            activeOpacity={0.85}
            style={{
              width: 120,
              borderRadius: 30,
              backgroundColor: "#1A1A2E",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              height: 50,
            }}
            className="h-[50px]"
          >
            <FontAwesome6 name="arrow-right-long" size={25} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ConfirmModal
        visible={modalVisible}
        product={product}
        quantity={quantity}
        onClose={() => setModalVisible(false)}
        onConfirm={handleConfirm}
      />
    </View>
  );
};

export default ViewProduct;
