import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";

import { environment } from "@/environment/environment";

// Farm basic details interface (unchanged)
interface FarmBasicDetails {
  farmName: string;
  extent: {
    ha: string;
    ac: string;
    p: string;
  };
  district: string;
  plotNo: string;
  streetName: string;
  city: string;
  selectedImage: number;
}

// Farm second details interface (unchanged)
interface FarmSecondDetails {
  numberOfStaff: string;
  loginCredentialsNeeded: string;
}

// Staff member interface (unchanged)
interface StaffMember {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
}

// Complete farm data interface (unchanged)
interface CompleteFarmData {
  basicDetails: FarmBasicDetails;
  secondDetails: FarmSecondDetails;
  staffDetails: StaffMember[];
}

// API response interface (unchanged)
interface SaveFarmResponse {
  status: string;
  message: string;
  farmId?: number;
  staffIds?: number[];
  totalStaffCreated?: number;
}

// Initial state interface (unchanged)
interface FarmState {
  basicDetails: FarmBasicDetails | null;
  secondDetails: FarmSecondDetails | null;
  finalDetails?: any;
  isSubmitting: boolean;
  submitError: string | null;
  submitSuccess: boolean;
}

const initialState: FarmState = {
  basicDetails: null,
  secondDetails: null,
  isSubmitting: false,
  submitError: null,
  submitSuccess: false,
};

// Async thunk for saving farm to backend
export const saveFarmToBackend = createAsyncThunk<
  SaveFarmResponse,
  CompleteFarmData,
  { rejectValue: string }
>(
  'farm/saveFarmToBackend',
  async (farmData, { rejectWithValue }) => {
    // Transform the data to match backend controller expectations
    const transformedData = {
      // Basic farm details
      farmName: farmData.basicDetails.farmName,
      farmImage: farmData.basicDetails.selectedImage || 1,
      
      // Extent details (flattened)
      extentha: farmData.basicDetails.extent.ha,
      extentac: farmData.basicDetails.extent.ac,
      extentp: farmData.basicDetails.extent.p,
      
      // Location details
      district: farmData.basicDetails.district,
      plotNo: farmData.basicDetails.plotNo,
      street: farmData.basicDetails.streetName, // Note: streetName -> street
      city: farmData.basicDetails.city,
      
      // Staff counts
      staffCount: farmData.secondDetails.numberOfStaff,
      appUserCount: farmData.secondDetails.loginCredentialsNeeded,
      
      // Staff array
      staff: farmData.staffDetails.map(member => {
        // Split phone number into code and number for database
        const phoneMatch = member.phone.match(/^(\+\d{1,4})(.+)$/);
        const phoneCode = phoneMatch ? phoneMatch[1] : '+94';
        const phoneNumber = phoneMatch ? phoneMatch[2] : member.phone.replace(/^\+\d{1,4}/, '');
        
        return {
          id: member.id,
          firstName: member.firstName,
          lastName: member.lastName,
          phoneCode,
          phoneNumber,
          role: member.role,
          image: null, // DAO expects image field
        };
      }),
    };

    try {
      console.log('Original farm data:', farmData);
      console.log('Transformed data for backend:', transformedData);

      // Ensure API base URL is defined
      const apiBaseUrl = environment.API_BASE_URL;
      if (!apiBaseUrl) {
        throw new Error('API_BASE_URL is not defined in environment');
      }

      // Construct URL with leading slash
      const url = `${apiBaseUrl.replace(/\/$/, '')}/api/farm/add-farm`;

      // Retrieve auth token from AsyncStorage (React Native)
      const token = await AsyncStorage.getItem('userToken') || '';

      const response = await axios.post<SaveFarmResponse>(url, transformedData, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }), // Add token if available
        },
      });

      console.log('Backend success response:', response.data);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Network error occurred';
      console.error('Network/Fetch error:', {
        message: errorMessage,
        url: `${environment.API_BASE_URL}/api/farm/add-farm`,
        data: transformedData,
        status: error.response?.status,
      });
      return rejectWithValue(errorMessage);
    }
  }
);

// Redux slice (unchanged)
const farmSlice = createSlice({
  name: 'farm',
  initialState,
  reducers: {
    setFarmBasicDetails(state, action: PayloadAction<FarmBasicDetails>) {
      state.basicDetails = action.payload;
    },
    setFarmSecondDetails(state, action: PayloadAction<FarmSecondDetails>) {
      state.secondDetails = action.payload;
    },
    resetFarm(state) {
      state.basicDetails = null;
      state.secondDetails = null;
      state.finalDetails = null;
      state.isSubmitting = false;
      state.submitError = null;
      state.submitSuccess = false;
    },
    updateFarmBasicDetails(state, action: PayloadAction<Partial<FarmBasicDetails>>) {
      if (state.basicDetails) {
        state.basicDetails = { ...state.basicDetails, ...action.payload };
      }
    },
    updateFarmSecondDetails(state, action: PayloadAction<Partial<FarmSecondDetails>>) {
      if (state.secondDetails) {
        state.secondDetails = { ...state.secondDetails, ...action.payload };
      }
    },
    clearSubmitState(state) {
      state.isSubmitting = false;
      state.submitError = null;
      state.submitSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveFarmToBackend.pending, (state) => {
        console.log('Farm save pending...');
        state.isSubmitting = true;
        state.submitError = null;
        state.submitSuccess = false;
      })
      .addCase(saveFarmToBackend.fulfilled, (state, action) => {
        console.log('Farm save fulfilled:', action.payload);
        state.isSubmitting = false;
        state.submitSuccess = true;
        state.submitError = null;
        state.finalDetails = action.payload;
      })
      .addCase(saveFarmToBackend.rejected, (state, action) => {
        console.log('Farm save rejected:', action.payload);
        state.isSubmitting = false;
        state.submitError = action.payload || 'Failed to save farm. Please check your connection and try again.';
        state.submitSuccess = false;
      });
  },
});

export const {
  setFarmBasicDetails,
  setFarmSecondDetails,
  resetFarm,
  updateFarmBasicDetails,
  updateFarmSecondDetails,
  clearSubmitState,
} = farmSlice.actions;

export default farmSlice.reducer;

// Selectors (unchanged)
export const selectFarmBasicDetails = (state: any) => state.farm.basicDetails;
export const selectFarmSecondDetails = (state: any) => state.farm.secondDetails;
export const selectFarmName = (state: any) => state.farm.basicDetails?.farmName;
export const selectFarmDistrict = (state: any) => state.farm.basicDetails?.district;
export const selectNumberOfStaff = (state: any) => state.farm.secondDetails?.numberOfStaff;
export const selectLoginCredentialsNeeded = (state: any) => state.farm.secondDetails?.loginCredentialsNeeded;
export const selectSelectedImage = (state: any) => state.farm.basicDetails?.selectedImage;
export const selectIsSubmitting = (state: any) => state.farm.isSubmitting;
export const selectSubmitError = (state: any) => state.farm.submitError;
export const selectSubmitSuccess = (state: any) => state.farm.submitSuccess;