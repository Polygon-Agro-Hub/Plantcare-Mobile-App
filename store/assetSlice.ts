import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Asset {
  farmName: string;
  farmId: number | null;
}

const initialState = {
  assetsData: null as Asset | null,
};

const assetSlice = createSlice({
  name: "assets",
  initialState,
  reducers: {
    setAssetData(state, action: PayloadAction<Asset | null>) {
      state.assetsData = action.payload;
    },
    clearAssetData(state) {
      state.assetsData = null;
    },
  },
});

export const { setAssetData, clearAssetData } = assetSlice.actions;
export default assetSlice.reducer;
