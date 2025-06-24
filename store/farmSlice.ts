import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Farm basic details interface
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

// Farm second details interface
interface FarmSecondDetails {
  numberOfStaff: string;
  loginCredentialsNeeded: string;
}

// Initial state interface
interface FarmState {
  basicDetails: FarmBasicDetails | null;
  secondDetails: FarmSecondDetails | null;
  finalDetails?: any;
}

const initialState: FarmState = {
  basicDetails: null,
  secondDetails: null,
};

// Redux slice
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
  },
});

export const { 
  setFarmBasicDetails, 
  setFarmSecondDetails, 
  resetFarm, 
  updateFarmBasicDetails,
  updateFarmSecondDetails
} = farmSlice.actions;

export default farmSlice.reducer;

// Selectors
export const selectFarmBasicDetails = (state: any) => state.farm.basicDetails;
export const selectFarmSecondDetails = (state: any) => state.farm.secondDetails;
export const selectFarmName = (state: any) => state.farm.basicDetails?.farmName;
export const selectFarmDistrict = (state: any) => state.farm.basicDetails?.district;
export const selectNumberOfStaff = (state: any) => state.farm.secondDetails?.numberOfStaff;
export const selectLoginCredentialsNeeded = (state: any) => state.farm.secondDetails?.loginCredentialsNeeded;
export const selectSelectedImage = (state: any) => state.farm.basicDetails?.selectedImage;