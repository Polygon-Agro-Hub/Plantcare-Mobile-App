import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";

// Payment state interface
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

// Utility function to decode JWT token
const decodeJWTToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

// Utility function to get user ID from token or AsyncStorage
const getUserId = async (token: string): Promise<string | null> => {
  // First try to get from AsyncStorage
  let userId = await AsyncStorage.getItem('userId');
  
  if (userId) {
    return userId;
  }
  
  // If not found in AsyncStorage, try to decode from token
  const decodedToken = decodeJWTToken(token);
  if (decodedToken) {
    // Common JWT fields that might contain user ID
    userId = decodedToken.userId || 
             decodedToken.user_id || 
             decodedToken.id || 
             decodedToken.sub || 
             decodedToken.user?.id;
    
    if (userId) {
      // Save it to AsyncStorage for future use
      await AsyncStorage.setItem('userId', userId.toString());
      return userId.toString();
    }
  }
  
  return null;
};

// Async thunk for processing payment
export const processPayment = createAsyncThunk(
  'package/processPayment',
  async (paymentData: {
    cardType: string;
    cardNumber: string;
    cardHolderName: string;
    expirationDate: string;
    cvv: string;
    packageType: string;
    packagePrice: number;
  }, { rejectWithValue }) => {
    try {
      // Retrieve auth token from AsyncStorage
      const token = await AsyncStorage.getItem('userToken');

      // Debug logging
      console.log('Authentication check:', {
        tokenExists: !!token,
        tokenLength: token?.length || 0,
      });

      // Check if authentication data exists
      if (!token) {
        console.error('No auth token found in AsyncStorage');
        throw new Error('Authentication token not found. Please log in again.');
      }

      // Get user ID from AsyncStorage or decode from token
      const userId = await getUserId(token);

      console.log('User ID retrieval:', {
        userIdExists: !!userId,
        userId: userId || 'null'
      });

      if (!userId) {
        console.error('No user ID found in AsyncStorage or token');
        throw new Error('User ID not found. Please log in again.');
      }

      // Calculate expiration date (1 month from now by default)
      const expireDate = new Date();
      let monthsToAdd = 1;
      
      // Determine months to add based on package type
      const packageString = paymentData.packageType.toLowerCase();
      const monthMatch = packageString.match(/(\d+)\s*month/);
      if (monthMatch) {
        monthsToAdd = parseInt(monthMatch[1]);
      } else if (packageString.includes('yearly') || packageString.includes('annual') || packageString.includes('12')) {
        monthsToAdd = 12;
      } else if (packageString.includes('quarterly') || packageString.includes('3')) {
        monthsToAdd = 3;
      } else if (packageString.includes('6')) {
        monthsToAdd = 6;
      }

      expireDate.setMonth(expireDate.getMonth() + monthsToAdd);
      const formattedExpireDate = expireDate.toISOString().split('T')[0]; // YYYY-MM-DD format

      const payload = {
        userId,
        payment: paymentData.packagePrice,
        plan: paymentData.packageType,
        expireDate: formattedExpireDate,
        activeStatus: 1
      };

      const apiBaseUrl = environment.API_BASE_URL;
      if (!apiBaseUrl) {
        throw new Error('API_BASE_URL is not defined in environment');
      }

      const url = `${apiBaseUrl.replace(/\/$/, '')}/api/farm/add-payment`;
      
      console.log('Making payment request:', {
        url,
        payload: { ...payload, userId: '***' }, // Hide userId in logs
        hasToken: !!token
      });

      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Payment response:', response.data);

      return {
        paymentId: response.data.paymentId,
        expireDate: formattedExpireDate,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Payment error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      let errorMessage = 'Payment processing failed';
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return rejectWithValue(errorMessage);
    }
  }
);

// Redux slice
const packageSlice = createSlice({
  name: 'package',
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
        console.log('Payment processing started...');
        state.isProcessing = true;
        state.paymentError = null;
        state.paymentSuccess = false;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        console.log('Payment processing successful:', action.payload);
        state.isProcessing = false;
        state.paymentSuccess = true;
        state.transactionId = action.payload.paymentId;
        state.expireDate = action.payload.expireDate;
      })
      .addCase(processPayment.rejected, (state, action) => {
        console.log('Payment processing failed:', action.payload);
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
  clearPaymentStatus
} = packageSlice.actions;

export default packageSlice.reducer;

// Selectors
export const selectPackageType = (state: any) => state.package.packageType;
export const selectPackagePrice = (state: any) => state.package.packagePrice;
export const selectIsProcessing = (state: any) => state.package.isProcessing;
export const selectPaymentError = (state: any) => state.package.paymentError;
export const selectPaymentSuccess = (state: any) => state.package.paymentSuccess;
export const selectTransactionId = (state: any) => state.package.transactionId;
export const selectExpireDate = (state: any) => state.package.expireDate;