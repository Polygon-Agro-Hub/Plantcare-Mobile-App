// src/store/packageService.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { s } from 'react-native-size-matters';

// Initial state
interface PackageState {
  packageType: string | null;
  packagePrice?: number | null; 
}

const initialState: PackageState = {
  packageType: null,
  packagePrice: null,
};

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
    },
  },
});

export const { setPackageType, resetPackage, setPackagePrice } = packageSlice.actions;

export default packageSlice.reducer;

export const selectPackageType = (state: any) => state.package.packageType; // Select packageType
export const selectPackagePrice = (state: any) => state.package.packagePrice; // Select packagePrice
