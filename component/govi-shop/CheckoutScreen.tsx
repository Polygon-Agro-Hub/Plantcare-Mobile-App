import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  ActivityIndicator,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/core";
import { useTranslation } from "react-i18next";
import { RootStackParamList } from "../types/types";
import CustomHeader from "../common/CustomHeader";
import { FontAwesome6 } from "@expo/vector-icons";
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

const formatPrice = (n: number) =>
  n.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatCardNumber = (value: string) => {
  const cleaned = value.replace(/\D/g, "").slice(0, 16);
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join("  ") : cleaned;
};

const formatExpiry = (value: string) => {
  const cleaned = value.replace(/\D/g, "").slice(0, 4);
  if (cleaned.length >= 3)
    return `${cleaned.slice(0, 2)} / ${cleaned.slice(2)}`;
  return cleaned;
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

  const [cardHolderName, setCardHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [placing, setPlacing] = useState(false);
  const [invNo, setInvNo] = useState("");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [shopAddress, setShopAddress] = useState("");

  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailed, setShowFailed] = useState(false);

  const isFormValid =
    cardHolderName.trim().length > 0 &&
    cardNumber.replace(/\s/g, "").length === 16 &&
    expiryDate.replace(/\s/g, "").length >= 4 &&
    cvv.length >= 3;

  const handlePayNow = async () => {
    if (!isFormValid || placing) return;
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
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <CustomHeader
        title={t("CheckoutScreen.Checkout")}
        showBackButton={true}
        navigation={navigation}
      />

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 36 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Total Amount Card */}
        <View className="mx-8 mt-5">
          <View className="border border-[#FF8000] rounded-xl py-4 px-5 items-center">
            <Text className="text-[#FF8000] text-sm font-medium mb-1">
              {t("CheckoutScreen.YourTotalAmount")} :
            </Text>
            <Text className="text-black text-2xl font-bold">
              Rs. {formatPrice(total)}
            </Text>
          </View>
        </View>

        {/* Card brand logos */}
        <View className="flex-row items-center mt-6 mb-5">
          <Text className="text-black text-sm font-semibold mr-3">
            ** {t("CheckoutScreen.CreditDebitCards")}
          </Text>
          <View className="flex-row items-center">
            <Image
              source={require("@/assets/images/govi-shop/visa-card.webp")}
              style={{
                width: 48,
                height: 30,
                resizeMode: "contain",
                marginRight: 8,
              }}
            />
            <Image
              source={require("@/assets/images/govi-shop/mastercard-card.webp")}
              style={{ width: 48, height: 30, resizeMode: "contain" }}
            />
          </View>
        </View>

        <View className="h-px bg-gray-200 mb-5" />

        {/* Card Holder Name */}
        <View className="mb-4">
          <Text className="text-gray-800 text-sm font-medium mb-1.5">
            {t("CheckoutScreen.CardHolderName")} <Text>*</Text>
          </Text>
          <TextInput
            className="bg-[#F4F4F4] rounded-full px-4 h-[50px] text-gray-800 text-sm"
            placeholder="--Please enter name--"
            placeholderTextColor="#585858"
            value={cardHolderName}
            onChangeText={setCardHolderName}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>

        {/* Card Number */}
        <View className="mb-4">
          <Text className="text-gray-800 text-sm font-medium mb-1.5">
            {t("CheckoutScreen.CardNumber")} <Text>*</Text>
          </Text>
          <TextInput
            className="bg-[#F4F4F4] rounded-full px-4 h-[50px] text-gray-800 text-sm tracking-widest"
            placeholder="---- ---- ---- ----"
            placeholderTextColor="#585858"
            value={cardNumber}
            onChangeText={(v) => setCardNumber(formatCardNumber(v))}
            keyboardType="numeric"
            maxLength={22}
            returnKeyType="next"
          />
        </View>

        {/* Expiry + CVV */}
        <View className="flex-row gap-3 mb-8">
          <View className="flex-1">
            <Text className="text-gray-800 text-sm font-medium mb-1.5">
              {t("CheckoutScreen.ExpiryDate")} <Text>*</Text>
            </Text>
            <TextInput
              className="bg-[#F4F4F4] rounded-full px-4 h-[50px] text-gray-800 text-sm"
              placeholder="MM / YY"
              placeholderTextColor="#585858"
              value={expiryDate}
              onChangeText={(v) => setExpiryDate(formatExpiry(v))}
              keyboardType="numeric"
              maxLength={7}
              returnKeyType="next"
            />
          </View>
          <View className="flex-1">
            <Text className="text-gray-800 text-sm font-medium mb-1.5">
              {t("CheckoutScreen.Cvv")} <Text>*</Text>
            </Text>
            <TextInput
              className="bg-[#F4F4F4] rounded-full px-4 h-[50px] text-gray-800 text-sm"
              placeholder="- - -"
              placeholderTextColor="#585858"
              value={cvv}
              onChangeText={(v) => setCvv(v.replace(/\D/g, "").slice(0, 3))}
              keyboardType="numeric"
              maxLength={3}
              secureTextEntry
              returnKeyType="done"
            />
          </View>
        </View>

        {/* Pay Now Button */}
        <TouchableOpacity
          onPress={handlePayNow}
          disabled={!isFormValid || placing}
          activeOpacity={0.85}
          className={`rounded-full h-[50px] flex-row items-center justify-center ${
            isFormValid && !placing ? "bg-gray-900" : "bg-gray-400"
          }`}
        >
          {placing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text className="text-white text-base font-semibold mr-2">
                {t("CheckoutScreen.PayNow")}
              </Text>
              <FontAwesome6 name="arrow-right-long" size={24} color="#ffffff" />
            </>
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
    </KeyboardAvoidingView>
  );
};

export default CheckoutScreen;
