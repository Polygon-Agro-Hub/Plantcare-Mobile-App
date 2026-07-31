import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/core";
import { useTranslation } from "react-i18next";
import { RootStackParamList } from "../types/types";
import CustomHeader from "../common/CustomHeader";
import { MaterialIcons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { environment } from "@/environment/environment";

type CheckoutNavigationProp = StackNavigationProp<
  RootStackParamList,
  "CheckoutScreen"
>;
type CheckoutRouteProp = RouteProp<RootStackParamList, "CheckoutScreen">;

interface CheckoutScreenProps {
  navigation: CheckoutNavigationProp;
  route: CheckoutRouteProp;
}

const formatCurrency = (amount: number, prefix: string = "") => {
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${prefix}Rs.${formatted}`;
};

// Success Modal
const SuccessModal: React.FC<{
  visible: boolean;
  shopAddress: string;
  invNo: string;
  onViewInvoice: () => void;
  onClose: () => void;
  navigation: CheckoutNavigationProp;
}> = ({ visible, shopAddress, invNo, onViewInvoice, onClose, navigation }) => {
  const { t } = useTranslation();
  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 mt-4 pb-4">
          <TouchableOpacity
            onPress={() => navigation.replace("ExploreShopsScreen")}
            className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center"
          >
            <Text className="text-gray-600 text-sm font-bold">✕</Text>
          </TouchableOpacity>
          <Text className="text-black text-xl font-bold">
            {t("CheckoutScreen.OrderSuccessful")}
          </Text>
          <View className="w-8" />
        </View>

        {/* Body */}
        <View className="flex-1 px-6 items-center justify-center pb-10">
          <LottieView
            source={require("@/assets/jsons/govi-capital/congratulation.json")}
            autoPlay
            loop={true}
            style={{ width: 220, height: 200, marginBottom: 24 }}
          />

          {/* Invoice number */}
          {invNo ? (
            <View className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-3 mb-4 w-full items-center">
              <Text className="text-gray-500 text-xs mb-1">
                Order Reference
              </Text>
              <Text className="text-[#FF8000] font-bold text-base tracking-widest">
                {invNo}
              </Text>
            </View>
          ) : null}

          <Text className="text-gray-600 text-sm text-center leading-6 mb-1">
            Orders can be collected from our shop at
          </Text>
          <Text className="text-black text-sm font-bold text-center mb-4">
            {shopAddress}
          </Text>
          <Text className="text-gray-600 text-sm text-center leading-6 mb-12">
            Show your invoice from your order history at the time of collection.
          </Text>

          <TouchableOpacity
            onPress={onViewInvoice}
            className="bg-gray-900 rounded-full h-[52px] w-full items-center justify-center"
          >
            <Text className="text-white text-base font-semibold">
              {t("CheckoutScreen.ViewMyInvoice")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Failed Modal
const FailedModal: React.FC<{
  visible: boolean;
  onTryAgain: () => void;
  onClose: () => void;
}> = ({ visible, onTryAgain, onClose }) => {
  const { t } = useTranslation();
  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 mt-4 pb-4">
          <TouchableOpacity
            onPress={onClose}
            className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center"
          >
            <Text className="text-gray-600 text-sm font-bold">✕</Text>
          </TouchableOpacity>
          <Text className="text-black text-xl font-bold">
            {t("CheckoutScreen.PaymentFailed")}
          </Text>
          <View className="w-8" />
        </View>

        {/* Body */}
        <View className="flex-1 px-6 items-center justify-center pb-10">
          <LottieView
            source={require("@/assets/jsons/govi-capital/request-rejected.json")}
            autoPlay
            loop={true}
            style={{ width: 220, height: 200, marginBottom: 24 }}
          />
          <Text className="text-black text-2xl font-bold mb-5">
            Payment Failed!
          </Text>
          <Text className="text-gray-600 text-sm text-center leading-6 mb-12">
            Oops! Your payment didn't go through. Please try again or use a
            different card.
          </Text>
          <TouchableOpacity
            onPress={onTryAgain}
            className="bg-gray-900 rounded-full h-[52px] w-full items-center justify-center"
          >
            <Text className="text-white text-base font-semibold">
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const { total, subtotal, serviceCharge, cartCount, shopName, cartItems } =
    route.params;

  const branchId = (route.params as any).branchId as number;

  const [placing, setPlacing] = useState(false);
  const [invNo, setInvNo] = useState("");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [shopAddress, setShopAddress] = useState("");

  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailed, setShowFailed] = useState(false);

  const feePercent = subtotal > 0 ? Math.round((serviceCharge / subtotal) * 100) : 5;

  const handlePayNow = async () => {
    if (placing) return;
    try {
      setPlacing(true);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) throw new Error("Not authenticated");

      const { data } = await axios.post(
        `${environment.API_BASE_URL}api/govi-shop/checkout`,
        { branchId },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setInvNo(data.invNo ?? "");
      setOrderId(data.orderId ?? data.id ?? null);
      setShopAddress(data.shopAddress ?? "");
      setShowSuccess(true);
    } catch (err: any) {
      console.error("Place order error:", err?.response?.data ?? err.message);
      setShowFailed(true);
    } finally {
      setPlacing(false);
    }
  };

  const handleViewInvoice = () => {
    setShowSuccess(false);

    if (orderId) {
      console.log("oredrid", orderId);
      navigation.navigate("InvoiceScreen", { orderId });
    } else {
      navigation.popToTop();
    }
  };

  const handleTryAgain = () => setShowFailed(false);

  return (
    <View className="flex-1 bg-white">
      <CustomHeader
        title={t("CheckoutScreen.Checkout")}
        showBackButton={true}
        navigation={navigation}
      />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingBottom: 40,
        }}
        className="bg-white px-5"
        showsVerticalScrollIndicator={false}
      >
        {/* Verification Image */}
        <View className="flex justify-center items-center my-4">
          <Image
            source={require("../../assets/images/payments/payment-summery.webp")}
            style={{ width: "100%", height: 280 }}
            resizeMode="contain"
          />
        </View>

        {/* Pricing Summary Box */}
        <View style={styles.shadowBox} className="bg-white p-5 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text
              style={{ color: "#414347", fontWeight: "normal" }}
              className="text-base"
            >
              {t("Payment.SubTotal", "Sub Total")}
            </Text>
            <Text
              style={{ color: "#212121", fontWeight: "bold" }}
              className="text-base"
            >
              {formatCurrency(subtotal)}
            </Text>
          </View>

          <View className="flex-row justify-between items-center mb-4">
            <Text
              style={{ color: "#414347", fontWeight: "normal" }}
              className="text-base"
            >
              {t("Payment.ProcessingFee", "Processing Fee")} ({feePercent}%)
            </Text>
            <Text
              style={{ color: "#212121", fontWeight: "bold" }}
              className="text-base"
            >
              {formatCurrency(serviceCharge, "+ ")}
            </Text>
          </View>

          {/* Border Line */}
          <View className="border-b border-[#D1D7E4] my-2" />

          <View className="flex-row justify-between items-center mt-4">
            <Text
              style={{ color: "#414347", fontWeight: "normal", fontSize: 18 }}
            >
              {t("Payment.FullTotal", "Full Total")}
            </Text>
            <Text
              style={{ color: "#A07700", fontWeight: "bold", fontSize: 20 }}
            >
              {formatCurrency(total)}
            </Text>
          </View>
        </View>

        {/* Secure Info Alert Box */}
        <View
          style={styles.secureBox}
          className="flex-row items-center p-4 mb-8"
        >
          {/* Rounded Shield Icon Background */}
          <View
            style={styles.iconContainer}
            className="justify-center items-center mr-4"
          >
            <MaterialIcons name="security" size={24} color="#0F5132" />
          </View>
          <Text
            style={styles.secureText}
            className="flex-1 font-medium text-sm leading-5"
          >
            {t(
              "Payment.SecureInfo",
              "Your payment information is secure and encrypted.",
            )}
          </Text>
        </View>

        {/* Pay Now Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handlePayNow}
          disabled={placing}
          className="rounded-3xl h-[50px] justify-center items-center bg-[#000000] shadow-md mx-6"
          style={styles.buttonShadow}
        >
          {placing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text className="text-white font-bold text-center text-base">
              {t("CheckoutScreen.PayNow", "Pay Now")}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modals */}
      <SuccessModal
        visible={showSuccess}
        shopAddress={shopAddress}
        invNo={invNo}
        onViewInvoice={handleViewInvoice}
        onClose={() => setShowSuccess(false)}
        navigation={navigation}
      />
      <FailedModal
        visible={showFailed}
        onTryAgain={handleTryAgain}
        onClose={() => setShowFailed(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  shadowBox: {
    borderColor: "#D1D7E4",
    borderWidth: 1,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  secureBox: {
    backgroundColor: "#E8FFF4",
    borderColor: "#E8FFF4",
    borderWidth: 1,
    borderRadius: 12,
  },
  iconContainer: {
    backgroundColor: "#B5FFDB",
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  secureText: {
    color: "#0F5132",
  },
  buttonShadow: {
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});

export default CheckoutScreen;
