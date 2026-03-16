import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";

interface PackageState {
  packageType: string | null;
  packagePrice?: number | null;
  isProcessing: boolean;
  paymentError: string | null;
  paymentSuccess: boolean;
  transactionId: string | null;
  expireDate: string | null;
}

const initialState: PackageState = {
  packageType: null,
  packagePrice: null,
  isProcessing: false,
  paymentError: null,
  paymentSuccess: false,
  transactionId: null,
  expireDate: null,
};

const decodeJWTToken = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    return null;
  }
};

const getUserId = async (token: string): Promise<string | null> => {
  let userId = await AsyncStorage.getItem("userId");

  if (userId) {
    return userId;
  }

  const decodedToken = decodeJWTToken(token);
  if (decodedToken) {
    userId =
      decodedToken.userId ||
      decodedToken.user_id ||
      decodedToken.id ||
      decodedToken.sub ||
      decodedToken.user?.id;

    if (userId) {
      await AsyncStorage.setItem("userId", userId.toString());
      return userId.toString();
    }
  }

  return null;
};

export const processPayment = createAsyncThunk(
  "package/processPayment",
  async (
    paymentData: {
      cardType: string;
      cardNumber: string;
      cardHolderName: string;
      expirationDate: string;
      cvv: string;
      packageType: string;
      packagePrice: number;
    },
    { rejectWithValue },
  ) => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        console.error("No auth token found in AsyncStorage");
        throw new Error("Authentication token not found. Please log in again.");
      }

      const userId = await getUserId(token);

      if (!userId) {
        console.error("No user ID found in AsyncStorage or token");
        throw new Error("User ID not found. Please log in again.");
      }

      const expireDate = new Date();
      let monthsToAdd = 1;

      const packageString = paymentData.packageType.toLowerCase();
      const monthMatch = packageString.match(/(\d+)\s*month/);
      if (monthMatch) {
        monthsToAdd = parseInt(monthMatch[1]);
      } else if (
        packageString.includes("yearly") ||
        packageString.includes("annual") ||
        packageString.includes("12")
      ) {
        monthsToAdd = 12;
      } else if (
        packageString.includes("quarterly") ||
        packageString.includes("3")
      ) {
        monthsToAdd = 3;
      } else if (packageString.includes("6")) {
        monthsToAdd = 6;
      }

      expireDate.setMonth(expireDate.getMonth() + monthsToAdd);
      const formattedExpireDate = expireDate.toISOString().split("T")[0];

      const payload = {
        userId,
        payment: paymentData.packagePrice,
        plan: paymentData.packageType,
        expireDate: formattedExpireDate,
        activeStatus: 1,
      };

      const apiBaseUrl = environment.API_BASE_URL;
      if (!apiBaseUrl) {
        throw new Error("API_BASE_URL is not defined in environment");
      }

      const url = `${apiBaseUrl.replace(/\/$/, "")}/api/farm/add-payment`;

      const response = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      return {
        paymentId: response.data.paymentId,
        expireDate: formattedExpireDate,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error("Payment error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      let errorMessage = "Payment processing failed";

      if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please log in again.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return rejectWithValue(errorMessage);
    }
  },
);

const packageSlice = createSlice({
  name: "package",
  initialState,
  reducers: {
    setPackageType(state, action: PayloadAction<string>) {
      state.packageType = action.payload;
    },
    setPackagePrice(state, action: PayloadAction<number>) {
      state.packagePrice = action.payload;
    },
    resetPackage(state) {
      state.packageType = null;
      state.packagePrice = null;
      state.isProcessing = false;
      state.paymentError = null;
      state.paymentSuccess = false;
      state.transactionId = null;
      state.expireDate = null;
    },
    clearPaymentStatus(state) {
      state.isProcessing = false;
      state.paymentError = null;
      state.paymentSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(processPayment.pending, (state) => {
        state.isProcessing = true;
        state.paymentError = null;
        state.paymentSuccess = false;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.paymentSuccess = true;
        state.transactionId = action.payload.paymentId;
        state.expireDate = action.payload.expireDate;
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.isProcessing = false;
        state.paymentError = action.payload as string;
        state.paymentSuccess = false;
      });
  },
});

export const {
  setPackageType,
  resetPackage,
  setPackagePrice,
  clearPaymentStatus,
} = packageSlice.actions;

export default packageSlice.reducer;

export const selectPackageType = (state: any) => state.package.packageType;
export const selectPackagePrice = (state: any) => state.package.packagePrice;
export const selectIsProcessing = (state: any) => state.package.isProcessing;
export const selectPaymentError = (state: any) => state.package.paymentError;
export const selectPaymentSuccess = (state: any) =>
  state.package.paymentSuccess;
export const selectTransactionId = (state: any) => state.package.transactionId;
export const selectExpireDate = (state: any) => state.package.expireDate;
