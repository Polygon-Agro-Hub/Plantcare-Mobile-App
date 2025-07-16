// import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';
// import AsyncStorage from "@react-native-async-storage/async-storage";

// import { environment } from "@/environment/environment";

// // Farm basic details interface (unchanged)
// interface FarmBasicDetails {
//   farmName: string;
//   extent: {
//     ha: string;
//     ac: string;
//     p: string;
//   };
//   district: string;
//   plotNo: string;
//   streetName: string;
//   city: string;
//   selectedImage: number;
// }

// // Farm second details interface (unchanged)
// interface FarmSecondDetails {
//   numberOfStaff: string;
//   loginCredentialsNeeded: string;
// }

// // Staff member interface (unchanged)
// interface StaffMember {
//   id: number;
//   firstName: string;
//   lastName: string;
//   phone: string;
//   role: string;
// }

// // Complete farm data interface (unchanged)
// interface CompleteFarmData {
//   basicDetails: FarmBasicDetails;
//   secondDetails: FarmSecondDetails;
//   staffDetails: StaffMember[];
// }

// // API response interface (unchanged)
// interface SaveFarmResponse {
//   status: string;
//   message: string;
//   farmId?: number;
//   staffIds?: number[];
//   totalStaffCreated?: number;
// }

// // Fetched farm interface (matches backend response) - NOW EXPORTED
// export interface FetchedFarm {
//   id: number;
//   userId: number;
//   farmName: string;
//   farmIndex: string;
//   extentha: string;
//   extentac: string;
//   extentp: string;
//   district: string;
//   plotNo: string;
//   street: string;
//   city: string;
//   staffCount: number;
//   appUserCount: number;
//   imageId: string;
//   createdAt: string;
//   staff: FetchedStaffMember[];
// }

// // Fetched staff member interface (matches backend response) - NOW EXPORTED
// export interface FetchedStaffMember {
//   id: number;
//   firstName: string;
//   lastName: string;
//   phoneCode: string;
//   phoneNumber: string;
//   role: string;
//   image: string | null;
//   createdAt: string;
// }

// // Enhanced state interface
// interface FarmState {
//   basicDetails: FarmBasicDetails | null;
//   secondDetails: FarmSecondDetails | null;
//   finalDetails?: any;
//   isSubmitting: boolean;
//   submitError: string | null;
//   submitSuccess: boolean;
//   // New fields for fetching farms
//   farms: FetchedFarm[];
//   isFetching: boolean;
//   fetchError: string | null;
//   lastFetchTime: string | null;
// }

// const initialState: FarmState = {
//   basicDetails: null,
//   secondDetails: null,
//   isSubmitting: false,
//   submitError: null,
//   submitSuccess: false,
//   // New initial state
//   farms: [],
//   isFetching: false,
//   fetchError: null,
//   lastFetchTime: null,
// };

// // Async thunk for saving farm to backend (unchanged)
// export const saveFarmToBackend = createAsyncThunk<
//   SaveFarmResponse,
//   CompleteFarmData,
//   { rejectValue: string }
// >(
//   'farm/saveFarmToBackend',
//   async (farmData, { rejectWithValue }) => {
//     // Transform the data to match backend controller expectations
//     const transformedData = {
//       // Basic farm details
//       farmName: farmData.basicDetails.farmName,
//       farmImage: farmData.basicDetails.selectedImage || 1,
      
//       // Extent details (flattened)
//       extentha: farmData.basicDetails.extent.ha || "0",
//       extentac: farmData.basicDetails.extent.ac || "0",
//       extentp: farmData.basicDetails.extent.p || "0",
      
//       // Location details
//       district: farmData.basicDetails.district,
//       plotNo: farmData.basicDetails.plotNo,
//       street: farmData.basicDetails.streetName, // Note: streetName -> street
//       city: farmData.basicDetails.city,
      
//       // Staff counts
//       staffCount: farmData.secondDetails.numberOfStaff,
//       appUserCount: farmData.secondDetails.loginCredentialsNeeded,
      
//       // Staff array
//       staff: farmData.staffDetails.map(member => {
//         // Split phone number into code and number for database
//         const phoneMatch = member.phone.match(/^(\+\d{1,4})(.+)$/);
//         const phoneCode = phoneMatch ? phoneMatch[1] : '+94';
//         const phoneNumber = phoneMatch ? phoneMatch[2] : member.phone.replace(/^\+\d{1,4}/, '');
        
//         return {
//           id: member.id,
//           firstName: member.firstName,
//           lastName: member.lastName,
//           phoneCode,
//           phoneNumber,
//           role: member.role,
//           image: null, // DAO expects image field
//         };
//       }),
//     };

//     try {
//       console.log('Original farm data:', farmData);
//       console.log('Transformed data for backend:', transformedData);

//       // Ensure API base URL is defined
//       const apiBaseUrl = environment.API_BASE_URL;
//       if (!apiBaseUrl) {
//         throw new Error('API_BASE_URL is not defined in environment');
//       }

//       // Construct URL with leading slash
//       const url = `${apiBaseUrl.replace(/\/$/, '')}/api/farm/add-farm`;

//       // Retrieve auth token from AsyncStorage (React Native)
//       const token = await AsyncStorage.getItem('userToken') || '';

//       const response = await axios.post<SaveFarmResponse>(url, transformedData, {
//         headers: {
//           'Content-Type': 'application/json',
//           ...(token && { Authorization: `Bearer ${token}` }), // Add token if available
//         },
//       });

//       console.log('Backend success response:', response.data);
//       return response.data;
//     } catch (error: any) {
//       const errorMessage =
//         error.response?.data?.message ||
//         error.message ||
//         'Network error occurred';
//       console.error('Network/Fetch error:', {
//         message: errorMessage,
//         url: `${environment.API_BASE_URL}/api/farm/add-farm`,
//         data: transformedData,
//         status: error.response?.status,
//       });
//       return rejectWithValue(errorMessage);
//     }
//   }
// );

// // NEW: Async thunk for fetching farms
// export const fetchFarmsFromBackend = createAsyncThunk<
//   FetchedFarm[],
//   void,
//   { rejectValue: string }
// >(
//   'farm/fetchFarmsFromBackend',
//   async (_, { rejectWithValue }) => {
//     try {
//       // Ensure API base URL is defined
//       const apiBaseUrl = environment.API_BASE_URL;
//       if (!apiBaseUrl) {
//         throw new Error('API_BASE_URL is not defined in environment');
//       }

//       // Construct URL
//       const url = `${apiBaseUrl.replace(/\/$/, '')}/api/farm/get-farms`;

//       // Retrieve auth token from AsyncStorage
//       const token = await AsyncStorage.getItem('userToken') || '';

//       const response = await axios.get<FetchedFarm[]>(url, {
//         headers: {
//           'Content-Type': 'application/json',
//           ...(token && { Authorization: `Bearer ${token}` }),
//         },
//       });

//       console.log('Farms fetched successfully:', response.data);
      
//       // Ensure each farm has a unique reference and staff array
//       const processedFarms = response.data.map(farm => ({
//         ...farm,
//         staff: farm.staff ? farm.staff.map(staffMember => ({ ...staffMember })) : []
//       }));
      
//       return processedFarms;
//     } catch (error: any) {
//       const errorMessage =
//         error.response?.data?.message ||
//         error.message ||
//         'Failed to fetch farms';
//       console.error('Fetch farms error:', {
//         message: errorMessage,
//         url: `${environment.API_BASE_URL}/api/farm/get-farms`,
//         status: error.response?.status,
//       });
//       return rejectWithValue(errorMessage);
//     }
//   }
// );

// // Redux slice (enhanced)
// const farmSlice = createSlice({
//   name: 'farm',
//   initialState,
//   reducers: {
//     setFarmBasicDetails(state, action: PayloadAction<FarmBasicDetails>) {
//       state.basicDetails = action.payload;
//     },
//     setFarmSecondDetails(state, action: PayloadAction<FarmSecondDetails>) {
//       state.secondDetails = action.payload;
//     },
//     resetFarm(state) {
//       state.basicDetails = null;
//       state.secondDetails = null;
//       state.finalDetails = null;
//       state.isSubmitting = false;
//       state.submitError = null;
//       state.submitSuccess = false;
//     },
//     updateFarmBasicDetails(state, action: PayloadAction<Partial<FarmBasicDetails>>) {
//       if (state.basicDetails) {
//         state.basicDetails = { ...state.basicDetails, ...action.payload };
//       }
//     },
//     updateFarmSecondDetails(state, action: PayloadAction<Partial<FarmSecondDetails>>) {
//       if (state.secondDetails) {
//         state.secondDetails = { ...state.secondDetails, ...action.payload };
//       }
//     },
//     clearSubmitState(state) {
//       state.isSubmitting = false;
//       state.submitError = null;
//       state.submitSuccess = false;
//     },
//     // NEW: Clear fetch state
//     clearFetchState(state) {
//       state.isFetching = false;
//       state.fetchError = null;
//     },
//     // NEW: Clear all farms
//     clearFarms(state) {
//       state.farms = [];
//       state.fetchError = null;
//       state.lastFetchTime = null;
//     },
//     // NEW: Update specific farm
//     updateFarm(state, action: PayloadAction<FetchedFarm>) {
//       const farmIndex = state.farms.findIndex(farm => farm.id === action.payload.id);
//       if (farmIndex !== -1) {
//         state.farms[farmIndex] = {
//           ...action.payload,
//           staff: action.payload.staff ? [...action.payload.staff] : []
//         };
//       }
//     },
//     // NEW: Add new farm to existing list
//     addFarm(state, action: PayloadAction<FetchedFarm>) {
//       state.farms.push({
//         ...action.payload,
//         staff: action.payload.staff ? [...action.payload.staff] : []
//       });
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Save farm cases (unchanged)
//       .addCase(saveFarmToBackend.pending, (state) => {
//         console.log('Farm save pending...');
//         state.isSubmitting = true;
//         state.submitError = null;
//         state.submitSuccess = false;
//       })
//       .addCase(saveFarmToBackend.fulfilled, (state, action) => {
//         console.log('Farm save fulfilled:', action.payload);
//         state.isSubmitting = false;
//         state.submitSuccess = true;
//         state.submitError = null;
//         state.finalDetails = action.payload;
//       })
//       .addCase(saveFarmToBackend.rejected, (state, action) => {
//         console.log('Farm save rejected:', action.payload);
//         state.isSubmitting = false;
//         state.submitError = action.payload || 'Failed to save farm. Please check your connection and try again.';
//         state.submitSuccess = false;
//       })
//       // NEW: Fetch farms cases
//       .addCase(fetchFarmsFromBackend.pending, (state) => {
//         console.log('Farms fetch pending...');
//         state.isFetching = true;
//         state.fetchError = null;
//       })
//       .addCase(fetchFarmsFromBackend.fulfilled, (state, action) => {
//         console.log('Farms fetch fulfilled:', action.payload);
//         state.isFetching = false;
//         // Create a completely new array to avoid reference issues
//         state.farms = action.payload.map(farm => ({
//           ...farm,
//           staff: farm.staff.map(staffMember => ({ ...staffMember }))
//         }));
//         state.fetchError = null;
//         state.lastFetchTime = new Date().toISOString();
//       })
//       .addCase(fetchFarmsFromBackend.rejected, (state, action) => {
//         console.log('Farms fetch rejected:', action.payload);
//         state.isFetching = false;
//         state.fetchError = action.payload || 'Failed to fetch farms. Please check your connection and try again.';
//       });
//   },
// });

// export const {
//   setFarmBasicDetails,
//   setFarmSecondDetails,
//   resetFarm,
//   updateFarmBasicDetails,
//   updateFarmSecondDetails,
//   clearSubmitState,
//   clearFetchState,
//   clearFarms,
//   updateFarm,
//   addFarm,
// } = farmSlice.actions;

// export default farmSlice.reducer;

// // Selectors (unchanged + new ones)
// export const selectFarmBasicDetails = (state: any) => state.farm.basicDetails;
// export const selectFarmSecondDetails = (state: any) => state.farm.secondDetails;
// export const selectFarmName = (state: any) => state.farm.basicDetails?.farmName;
// export const selectFarmDistrict = (state: any) => state.farm.basicDetails?.district;
// export const selectNumberOfStaff = (state: any) => state.farm.secondDetails?.numberOfStaff;
// export const selectLoginCredentialsNeeded = (state: any) => state.farm.secondDetails?.loginCredentialsNeeded;
// export const selectSelectedImage = (state: any) => state.farm.basicDetails?.selectedImage;
// export const selectIsSubmitting = (state: any) => state.farm.isSubmitting;
// export const selectSubmitError = (state: any) => state.farm.submitError;
// export const selectSubmitSuccess = (state: any) => state.farm.submitSuccess;

// // NEW: Selectors for fetched farms
// export const selectFarms = (state: any) => state.farm.farms;
// export const selectIsFetching = (state: any) => state.farm.isFetching;
// export const selectFetchError = (state: any) => state.farm.fetchError;
// export const selectLastFetchTime = (state: any) => state.farm.lastFetchTime;

// // NEW: Utility selectors
// export const selectFarmsCount = (state: any) => state.farm.farms.length;
// export const selectFarmById = (farmId: number) => (state: any) => 
//   state.farm.farms.find((farm: FetchedFarm) => farm.id === farmId);
// export const selectFarmsByDistrict = (district: string) => (state: any) => 
//   state.farm.farms.filter((farm: FetchedFarm) => farm.district === district);
// export const selectFarmsWithStaff = (state: any) => 
//   state.farm.farms.filter((farm: FetchedFarm) => farm.staff.length > 0);

// // NEW: Transform fetched farm to form data (if needed for editing)
// export const transformFetchedFarmToFormData = (farm: FetchedFarm): CompleteFarmData => ({
//   basicDetails: {
//     farmName: farm.farmName,
//     extent: {
//       ha: farm.extentha,
//       ac: farm.extentac,
//       p: farm.extentp,
//     },
//     district: farm.district,
//     plotNo: farm.plotNo,
//     streetName: farm.street,
//     city: farm.city,
//     selectedImage: parseInt(farm.imageId) || 1,
//   },
//   secondDetails: {
//     numberOfStaff: farm.staffCount.toString(),
//     loginCredentialsNeeded: farm.appUserCount.toString(),
//   },
//   staffDetails: farm.staff.map(member => ({
//     id: member.id,
//     firstName: member.firstName,
//     lastName: member.lastName,
//     phone: `${member.phoneCode}${member.phoneNumber}`,
//     role: member.role,
//   })),
// });

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

// Fetched farm interface (matches backend response) - NOW EXPORTED
export interface FetchedFarm {
  id: number;
  userId: number;
  farmName: string;
  farmIndex: string;
  extentha: string;
  extentac: string;
  extentp: string;
  district: string;
  plotNo: string;
  street: string;
  city: string;
  staffCount: number;
  appUserCount: number;
  imageId: string;
  createdAt: string;
  staff: FetchedStaffMember[];
}

// Fetched staff member interface (matches backend response) - NOW EXPORTED
export interface FetchedStaffMember {
  id: number;
  firstName: string;
  lastName: string;
  phoneCode: string;
  phoneNumber: string;
  role: string;
  image: string | null;
  createdAt: string;
}

// Enhanced state interface with current farm ID
interface FarmState {
  basicDetails: FarmBasicDetails | null;
  secondDetails: FarmSecondDetails | null;
  finalDetails?: any;
  isSubmitting: boolean;
  submitError: string | null;
  submitSuccess: boolean;
  // New fields for fetching farms
  farms: FetchedFarm[];
  isFetching: boolean;
  fetchError: string | null;
  lastFetchTime: string | null;
  // NEW: Current farm ID for active farm context
  currentFarmId: number | null;
  // NEW: Current farm details cache
  currentFarmDetails: FetchedFarm | null;
}

const initialState: FarmState = {
  basicDetails: null,
  secondDetails: null,
  isSubmitting: false,
  submitError: null,
  submitSuccess: false,
  // New initial state
  farms: [],
  isFetching: false,
  fetchError: null,
  lastFetchTime: null,
  // NEW: Current farm state
  currentFarmId: null,
  currentFarmDetails: null,
};

// Async thunk for saving farm to backend (unchanged)
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
      extentha: farmData.basicDetails.extent.ha || "0",
      extentac: farmData.basicDetails.extent.ac || "0",
      extentp: farmData.basicDetails.extent.p || "0",
      
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

// NEW: Async thunk for fetching farms
export const fetchFarmsFromBackend = createAsyncThunk<
  FetchedFarm[],
  void,
  { rejectValue: string }
>(
  'farm/fetchFarmsFromBackend',
  async (_, { rejectWithValue }) => {
    try {
      // Ensure API base URL is defined
      const apiBaseUrl = environment.API_BASE_URL;
      if (!apiBaseUrl) {
        throw new Error('API_BASE_URL is not defined in environment');
      }

      // Construct URL
      const url = `${apiBaseUrl.replace(/\/$/, '')}/api/farm/get-farms`;

      // Retrieve auth token from AsyncStorage
      const token = await AsyncStorage.getItem('userToken') || '';

      const response = await axios.get<FetchedFarm[]>(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      console.log('Farms fetched successfully:', response.data);
      
      // Ensure each farm has a unique reference and staff array
      const processedFarms = response.data.map(farm => ({
        ...farm,
        staff: farm.staff ? farm.staff.map(staffMember => ({ ...staffMember })) : []
      }));
      
      return processedFarms;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch farms';
      console.error('Fetch farms error:', {
        message: errorMessage,
        url: `${environment.API_BASE_URL}/api/farm/get-farms`,
        status: error.response?.status,
      });
      return rejectWithValue(errorMessage);
    }
  }
);

// NEW: Async thunk for fetching single farm details
export const fetchFarmDetails = createAsyncThunk<
  FetchedFarm,
  number,
  { rejectValue: string }
>(
  'farm/fetchFarmDetails',
  async (farmId, { rejectWithValue }) => {
    try {
      const apiBaseUrl = environment.API_BASE_URL;
      if (!apiBaseUrl) {
        throw new Error('API_BASE_URL is not defined in environment');
      }

      const url = `${apiBaseUrl.replace(/\/$/, '')}/api/farm/get-farms/byFarm-Id/${farmId}`;
      const token = await AsyncStorage.getItem('userToken') || '';

      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      return response.data.farm;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch farm details';
      console.error('Fetch farm details error:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Redux slice (enhanced)
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
      // Reset current farm context
      state.currentFarmId = null;
      state.currentFarmDetails = null;
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
    clearFetchState(state) {
      state.isFetching = false;
      state.fetchError = null;
    },
    clearFarms(state) {
      state.farms = [];
      state.fetchError = null;
      state.lastFetchTime = null;
    },
    updateFarm(state, action: PayloadAction<FetchedFarm>) {
      const farmIndex = state.farms.findIndex(farm => farm.id === action.payload.id);
      if (farmIndex !== -1) {
        state.farms[farmIndex] = {
          ...action.payload,
          staff: action.payload.staff ? [...action.payload.staff] : []
        };
      }
      // Update current farm details if it matches
      if (state.currentFarmId === action.payload.id) {
        state.currentFarmDetails = action.payload;
      }
    },
    addFarm(state, action: PayloadAction<FetchedFarm>) {
      state.farms.push({
        ...action.payload,
        staff: action.payload.staff ? [...action.payload.staff] : []
      });
    },
    // NEW: Set current farm ID
    setCurrentFarmId(state, action: PayloadAction<number | null>) {
      state.currentFarmId = action.payload;
      // Clear current farm details when changing ID
      state.currentFarmDetails = null;
    },
    // NEW: Set current farm details
    setCurrentFarmDetails(state, action: PayloadAction<FetchedFarm | null>) {
      state.currentFarmDetails = action.payload;
    },
    // NEW: Clear current farm context
    clearCurrentFarmContext(state) {
      state.currentFarmId = null;
      state.currentFarmDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Save farm cases (unchanged)
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
      })
      // Fetch farms cases
      .addCase(fetchFarmsFromBackend.pending, (state) => {
        console.log('Farms fetch pending...');
        state.isFetching = true;
        state.fetchError = null;
      })
      .addCase(fetchFarmsFromBackend.fulfilled, (state, action) => {
        console.log('Farms fetch fulfilled:', action.payload);
        state.isFetching = false;
        state.farms = action.payload.map(farm => ({
          ...farm,
          staff: farm.staff.map(staffMember => ({ ...staffMember }))
        }));
        state.fetchError = null;
        state.lastFetchTime = new Date().toISOString();
      })
      .addCase(fetchFarmsFromBackend.rejected, (state, action) => {
        console.log('Farms fetch rejected:', action.payload);
        state.isFetching = false;
        state.fetchError = action.payload || 'Failed to fetch farms. Please check your connection and try again.';
      })
      // NEW: Fetch farm details cases
      .addCase(fetchFarmDetails.pending, (state) => {
        state.isFetching = true;
        state.fetchError = null;
      })
      .addCase(fetchFarmDetails.fulfilled, (state, action) => {
        state.isFetching = false;
        state.currentFarmDetails = action.payload;
        state.fetchError = null;
        // Update the farm in the farms array if it exists
        const farmIndex = state.farms.findIndex(farm => farm.id === action.payload.id);
        if (farmIndex !== -1) {
          state.farms[farmIndex] = action.payload;
        }
      })
      .addCase(fetchFarmDetails.rejected, (state, action) => {
        state.isFetching = false;
        state.fetchError = action.payload || 'Failed to fetch farm details';
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
  clearFetchState,
  clearFarms,
  updateFarm,
  addFarm,
  setCurrentFarmId,
  setCurrentFarmDetails,
  clearCurrentFarmContext,
} = farmSlice.actions;

export default farmSlice.reducer;

// Selectors (unchanged + new ones)
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

// Selectors for fetched farms
export const selectFarms = (state: any) => state.farm.farms;
export const selectIsFetching = (state: any) => state.farm.isFetching;
export const selectFetchError = (state: any) => state.farm.fetchError;
export const selectLastFetchTime = (state: any) => state.farm.lastFetchTime;

// NEW: Current farm selectors
export const selectCurrentFarmId = (state: any) => state.farm.currentFarmId;
export const selectCurrentFarmDetails = (state: any) => state.farm.currentFarmDetails;

// Enhanced utility selectors
export const selectFarmsCount = (state: any) => state.farm.farms.length;
export const selectFarmById = (farmId: number) => (state: any) => 
  state.farm.farms.find((farm: FetchedFarm) => farm.id === farmId);
export const selectFarmsByDistrict = (district: string) => (state: any) => 
  state.farm.farms.filter((farm: FetchedFarm) => farm.district === district);
export const selectFarmsWithStaff = (state: any) => 
  state.farm.farms.filter((farm: FetchedFarm) => farm.staff.length > 0);

// NEW: Current farm staff selectors
export const selectCurrentFarmStaff = (state: any) => state.farm.currentFarmDetails?.staff || [];
export const selectCurrentFarmManagers = (state: any) => 
  state.farm.currentFarmDetails?.staff?.filter((staff: FetchedStaffMember) => staff.role === 'Manager') || [];
export const selectCurrentFarmOtherStaff = (state: any) => 
  state.farm.currentFarmDetails?.staff?.filter((staff: FetchedStaffMember) => staff.role !== 'Manager') || [];

// Transform fetched farm to form data (if needed for editing)
export const transformFetchedFarmToFormData = (farm: FetchedFarm): CompleteFarmData => ({
  basicDetails: {
    farmName: farm.farmName,
    extent: {
      ha: farm.extentha,
      ac: farm.extentac,
      p: farm.extentp,
    },
    district: farm.district,
    plotNo: farm.plotNo,
    streetName: farm.street,
    city: farm.city,
    selectedImage: parseInt(farm.imageId) || 1,
  },
  secondDetails: {
    numberOfStaff: farm.staffCount.toString(),
    loginCredentialsNeeded: farm.appUserCount.toString(),
  },
  staffDetails: farm.staff.map(member => ({
    id: member.id,
    firstName: member.firstName,
    lastName: member.lastName,
    phone: `${member.phoneCode}${member.phoneNumber}`,
    role: member.role,
  })),
});