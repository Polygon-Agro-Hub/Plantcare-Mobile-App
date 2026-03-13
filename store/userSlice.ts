import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { saveFarmToBackend } from "./farmSlice";

interface UserData {
  farmCount?: number;
  membership?: string;
  paymentActiveStatus?: boolean;

  id?: string;
  name?: string;
  email?: string;
  [key: string]: any;
  role: string;
}
interface UserPersonal {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  NICnumber?: string;
  profileImage?: string;
  [key: string]: any;
  id?: number;
  farmId?: number;
  farmName?: string;
}

interface UserState {
  userData: UserData | null;
  userPersonalData: UserPersonal | null;
}

const initialState: UserState = {
  userData: null,
  userPersonalData: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData(state, action: PayloadAction<UserData>) {
      state.userData = action.payload;
    },
    clearUserData(state) {
      state.userData = null;
    },

    incrementUserFarmCount(state) {
      if (state.userData) {
        state.userData.farmCount = (state.userData.farmCount || 0) + 1;
      }
    },

    decrementUserFarmCount(state) {
      if (state.userData) {
        state.userData.farmCount = Math.max(
          0,
          (state.userData.farmCount || 0) - 1,
        );
      }
    },

    setUserFarmCount(state, action: PayloadAction<number>) {
      if (state.userData) {
        state.userData.farmCount = action.payload;
      }
    },

    setUserPersonalData(state, action: PayloadAction<UserPersonal>) {
      state.userPersonalData = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(saveFarmToBackend.fulfilled, (state, action) => {
      if (state.userData) {
        state.userData.farmCount = (state.userData.farmCount || 0) + 1;
      }
    });
  },
});

export const {
  setUserData,
  clearUserData,
  incrementUserFarmCount,
  decrementUserFarmCount,
  setUserFarmCount,
  setUserPersonalData,
} = userSlice.actions;

export default userSlice.reducer;

export const selectUserData = (state: { user: UserState }) =>
  state.user.userData;
export const selectUserFarmCount = (state: { user: UserState }) =>
  state.user.userData?.farmCount || 0;
export const selectUserMembership = (state: { user: UserState }) =>
  state.user.userData?.membership;
export const selectPaymentActiveStatus = (state: { user: UserState }) =>
  state.user.userData?.paymentActiveStatus;
export const selectUserPersonal = (state: { user: UserState }) =>
  state.user.userPersonalData;
