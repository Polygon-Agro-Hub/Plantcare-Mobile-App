import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { environment } from "@/environment/environment";

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

interface FarmSecondDetails {
  numberOfStaff: string;
  loginCredentialsNeeded: string;
}

interface StaffMember {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  nic: string;
}

interface CompleteFarmData {
  basicDetails: FarmBasicDetails;
  secondDetails: FarmSecondDetails;
  staffDetails: StaffMember[];
}

interface SaveFarmResponse {
  status: string;
  message: string;
  farmId?: number;
  regCode?: string;
  staffIds?: number[];
  totalStaffCreated?: number;
}

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

export interface FetchedStaffMember {
  id: number;
  firstName: string;
  lastName: string;
  phoneCode: string;
  phoneNumber: string;
  role: string;
  nic: string;
  image: string | null;
  createdAt: string;
}

interface FarmState {
  basicDetails: FarmBasicDetails | null;
  secondDetails: FarmSecondDetails | null;
  finalDetails?: any;
  isSubmitting: boolean;
  submitError: string | null;
  submitSuccess: boolean;
  farms: FetchedFarm[];
  isFetching: boolean;
  fetchError: string | null;
  lastFetchTime: string | null;
  currentFarmId: number | null;
  currentFarmDetails: FetchedFarm | null;
  lastCreatedFarmId: number | null;
  registrationCode: string | null;
}

const initialState: FarmState = {
  basicDetails: null,
  secondDetails: null,
  isSubmitting: false,
  submitError: null,
  submitSuccess: false,
  farms: [],
  isFetching: false,
  fetchError: null,
  lastFetchTime: null,
  currentFarmId: null,
  currentFarmDetails: null,
  lastCreatedFarmId: null,
  registrationCode: null,
};

export const saveFarmToBackend = createAsyncThunk<
  SaveFarmResponse,
  CompleteFarmData,
  { rejectValue: string }
>("farm/saveFarmToBackend", async (farmData, { rejectWithValue }) => {
  const transformedData = {
    farmName: farmData.basicDetails.farmName,
    farmImage: farmData.basicDetails.selectedImage || 1,
    extentha: farmData.basicDetails.extent.ha || "0",
    extentac: farmData.basicDetails.extent.ac || "0",
    extentp: farmData.basicDetails.extent.p || "0",
    district: farmData.basicDetails.district,
    plotNo: farmData.basicDetails.plotNo,
    street: farmData.basicDetails.streetName,
    city: farmData.basicDetails.city,
    staffCount: farmData.secondDetails.numberOfStaff,
    appUserCount: farmData.secondDetails.loginCredentialsNeeded,
    staff: farmData.staffDetails.map((member) => {
      let phoneCode = "+94";
      let phoneNumber = member.phone;

      if (member.phone.startsWith("+94")) {
        phoneCode = "+94";
        phoneNumber = member.phone.substring(3);
      } else if (member.phone.startsWith("+")) {
        phoneCode = member.phone.substring(0, 3);
        phoneNumber = member.phone.substring(3);
      } else {
        phoneNumber = member.phone;
      }

      return {
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        phoneCode,
        phoneNumber,
        role: member.role,
        nic: member.nic,
        image: null,
      };
    }),
  };

  try {
    const apiBaseUrl = environment.API_BASE_URL;
    if (!apiBaseUrl) {
      throw new Error("API_BASE_URL is not defined in environment");
    }

    const url = `${apiBaseUrl.replace(/\/$/, "")}/api/farm/add-farm`;
    const token = (await AsyncStorage.getItem("userToken")) || "";

    const response = await axios.post<SaveFarmResponse>(url, transformedData, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Network error occurred";
    console.error("Network/Fetch error:", {
      message: errorMessage,
      url: `${environment.API_BASE_URL}/api/farm/add-farm`,
      data: transformedData,
      status: error.response?.status,
    });
    return rejectWithValue(errorMessage);
  }
});

export const fetchFarmsFromBackend = createAsyncThunk<
  FetchedFarm[],
  void,
  { rejectValue: string }
>("farm/fetchFarmsFromBackend", async (_, { rejectWithValue }) => {
  try {
    const apiBaseUrl = environment.API_BASE_URL;
    if (!apiBaseUrl) {
      throw new Error("API_BASE_URL is not defined in environment");
    }

    const url = `${apiBaseUrl.replace(/\/$/, "")}/api/farm/get-farms`;
    const token = (await AsyncStorage.getItem("userToken")) || "";

    const response = await axios.get<FetchedFarm[]>(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    const processedFarms = response.data.map((farm) => ({
      ...farm,
      staff: farm.staff
        ? farm.staff.map((staffMember) => ({ ...staffMember }))
        : [],
    }));

    return processedFarms;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || "Failed to fetch farms";
    console.error("Fetch farms error:", {
      message: errorMessage,
      url: `${environment.API_BASE_URL}/api/farm/get-farms`,
      status: error.response?.status,
    });
    return rejectWithValue(errorMessage);
  }
});

export const fetchFarmDetails = createAsyncThunk<
  FetchedFarm,
  number,
  { rejectValue: string }
>("farm/fetchFarmDetails", async (farmId, { rejectWithValue }) => {
  try {
    const apiBaseUrl = environment.API_BASE_URL;
    if (!apiBaseUrl) {
      throw new Error("API_BASE_URL is not defined in environment");
    }

    const url = `${apiBaseUrl.replace(/\/$/, "")}/api/farm/get-farms/byFarm-Id/${farmId}`;
    const token = (await AsyncStorage.getItem("userToken")) || "";

    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    return response.data.farm;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch farm details";
    console.error("Fetch farm details error:", errorMessage);
    return rejectWithValue(errorMessage);
  }
});

const farmSlice = createSlice({
  name: "farm",
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
      state.currentFarmId = null;
      state.currentFarmDetails = null;
    },
    updateFarmBasicDetails(
      state,
      action: PayloadAction<Partial<FarmBasicDetails>>,
    ) {
      if (state.basicDetails) {
        state.basicDetails = { ...state.basicDetails, ...action.payload };
      }
    },
    updateFarmSecondDetails(
      state,
      action: PayloadAction<Partial<FarmSecondDetails>>,
    ) {
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
    clearFarmBasicDetails(state) {
      state.basicDetails = null;
    },
    clearFarmSecondDetails(state) {
      state.secondDetails = null;
    },
    updateFarm(state, action: PayloadAction<FetchedFarm>) {
      const farmIndex = state.farms.findIndex(
        (farm) => farm.id === action.payload.id,
      );
      if (farmIndex !== -1) {
        state.farms[farmIndex] = {
          ...action.payload,
          staff: action.payload.staff ? [...action.payload.staff] : [],
        };
      }
      if (state.currentFarmId === action.payload.id) {
        state.currentFarmDetails = action.payload;
      }
    },
    addFarm(state, action: PayloadAction<FetchedFarm>) {
      state.farms.push({
        ...action.payload,
        staff: action.payload.staff ? [...action.payload.staff] : [],
      });
    },
    setCurrentFarmId(state, action: PayloadAction<number | null>) {
      state.currentFarmId = action.payload;
      state.currentFarmDetails = null;
    },
    setCurrentFarmDetails(state, action: PayloadAction<FetchedFarm | null>) {
      state.currentFarmDetails = action.payload;
    },
    clearCurrentFarmContext(state) {
      state.currentFarmId = null;
      state.currentFarmDetails = null;
    },
    clearLastCreatedFarm(state) {
      state.lastCreatedFarmId = null;
      state.registrationCode = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(saveFarmToBackend.pending, (state) => {
        state.isSubmitting = true;
        state.submitError = null;
        state.submitSuccess = false;
      })
      .addCase(saveFarmToBackend.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.submitSuccess = true;
        state.submitError = null;
        state.finalDetails = action.payload;
        state.lastCreatedFarmId = action.payload.farmId || null;
        state.registrationCode = action.payload.regCode || null;
      })
      .addCase(saveFarmToBackend.rejected, (state, action) => {
        state.isSubmitting = false;
        state.submitError =
          action.payload ||
          "Failed to save farm. Please check your connection and try again.";
        state.submitSuccess = false;
      })

      .addCase(fetchFarmsFromBackend.pending, (state) => {
        state.isFetching = true;
        state.fetchError = null;
      })
      .addCase(fetchFarmsFromBackend.fulfilled, (state, action) => {
        state.isFetching = false;
        state.farms = action.payload.map((farm) => ({
          ...farm,
          staff: farm.staff.map((staffMember) => ({ ...staffMember })),
        }));
        state.fetchError = null;
        state.lastFetchTime = new Date().toISOString();
      })
      .addCase(fetchFarmsFromBackend.rejected, (state, action) => {
        state.isFetching = false;
        state.fetchError =
          action.payload ||
          "Failed to fetch farms. Please check your connection and try again.";
      })

      .addCase(fetchFarmDetails.pending, (state) => {
        state.isFetching = true;
        state.fetchError = null;
      })
      .addCase(fetchFarmDetails.fulfilled, (state, action) => {
        state.isFetching = false;
        state.currentFarmDetails = action.payload;
        state.fetchError = null;
        const farmIndex = state.farms.findIndex(
          (farm) => farm.id === action.payload.id,
        );
        if (farmIndex !== -1) {
          state.farms[farmIndex] = action.payload;
        }
      })
      .addCase(fetchFarmDetails.rejected, (state, action) => {
        state.isFetching = false;
        state.fetchError = action.payload || "Failed to fetch farm details";
      });
  },
});

export const {
  setFarmBasicDetails,
  setFarmSecondDetails,
  resetFarm,
  updateFarmBasicDetails,
  updateFarmSecondDetails,
  clearFarmBasicDetails,
  clearFarmSecondDetails,
  clearSubmitState,
  clearFetchState,
  clearFarms,
  updateFarm,
  addFarm,
  setCurrentFarmId,
  setCurrentFarmDetails,
  clearCurrentFarmContext,
  clearLastCreatedFarm,
} = farmSlice.actions;

export default farmSlice.reducer;

export const selectFarmBasicDetails = (state: any) => state.farm.basicDetails;
export const selectFarmSecondDetails = (state: any) => state.farm.secondDetails;
export const selectFarmName = (state: any) => state.farm.basicDetails?.farmName;
export const selectFarmDistrict = (state: any) =>
  state.farm.basicDetails?.district;
export const selectNumberOfStaff = (state: any) =>
  state.farm.secondDetails?.numberOfStaff;
export const selectLoginCredentialsNeeded = (state: any) =>
  state.farm.secondDetails?.loginCredentialsNeeded;
export const selectSelectedImage = (state: any) =>
  state.farm.basicDetails?.selectedImage;
export const selectIsSubmitting = (state: any) => state.farm.isSubmitting;
export const selectSubmitError = (state: any) => state.farm.submitError;
export const selectSubmitSuccess = (state: any) => state.farm.submitSuccess;

export const selectFarms = (state: any) => state.farm.farms;
export const selectIsFetching = (state: any) => state.farm.isFetching;
export const selectFetchError = (state: any) => state.farm.fetchError;
export const selectLastFetchTime = (state: any) => state.farm.lastFetchTime;

export const selectCurrentFarmId = (state: any) => state.farm.currentFarmId;
export const selectCurrentFarmDetails = (state: any) =>
  state.farm.currentFarmDetails;

export const selectLastCreatedFarmId = (state: any) =>
  state.farm.lastCreatedFarmId;
export const selectRegistrationCode = (state: any) =>
  state.farm.registrationCode;

export const selectFarmsCount = (state: any) => state.farm.farms.length;
export const selectFarmById = (farmId: number) => (state: any) =>
  state.farm.farms.find((farm: FetchedFarm) => farm.id === farmId);
export const selectFarmsByDistrict = (district: string) => (state: any) =>
  state.farm.farms.filter((farm: FetchedFarm) => farm.district === district);
export const selectFarmsWithStaff = (state: any) =>
  state.farm.farms.filter((farm: FetchedFarm) => farm.staff.length > 0);

export const selectCurrentFarmStaff = (state: any) =>
  state.farm.currentFarmDetails?.staff || [];
export const selectCurrentFarmManagers = (state: any) =>
  state.farm.currentFarmDetails?.staff?.filter(
    (staff: FetchedStaffMember) => staff.role === "Manager",
  ) || [];
export const selectCurrentFarmOtherStaff = (state: any) =>
  state.farm.currentFarmDetails?.staff?.filter(
    (staff: FetchedStaffMember) => staff.role !== "Manager",
  ) || [];

export const selectStaffByNic = (nic: string) => (state: any) => {
  const allStaff = state.farm.farms.flatMap((farm: FetchedFarm) => farm.staff);
  return allStaff.find((staff: FetchedStaffMember) => staff.nic === nic);
};

export const selectCurrentFarmStaffByNic = (nic: string) => (state: any) =>
  state.farm.currentFarmDetails?.staff?.find(
    (staff: FetchedStaffMember) => staff.nic === nic,
  );

export const transformFetchedFarmToFormData = (
  farm: FetchedFarm,
): CompleteFarmData => ({
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
  staffDetails: farm.staff.map((member) => ({
    id: member.id,
    firstName: member.firstName,
    lastName: member.lastName,
    phone: `${member.phoneCode}${member.phoneNumber}`,
    role: member.role,
    nic: member.nic,
  })),
});
