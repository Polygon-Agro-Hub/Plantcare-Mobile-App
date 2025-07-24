// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   userData: null,

  
// };



// const userSlice = createSlice({
//   name: "user",
//   initialState,
//   reducers: {
//     setUserData(state, action) {
//       state.userData = action.payload;

//       console.log("kfsj",state.userData)
//     },
//     clearUserData(state) {
//       state.userData = null;
//     },
//   },

  
// });

// export const { setUserData, clearUserData } = userSlice.actions;
// export default userSlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { saveFarmToBackend } from "./farmSlice"; // Adjust the import path as needed

// Define the user data interface
interface UserData {
  farmCount?: number;
  membership?: string;
  paymentActiveStatus?: boolean;
  // Add other user properties as needed
  id?: string;
  name?: string;
  email?: string;
  [key: string]: any; // Allow for additional properties
  role: string
}

// Define the initial state interface
interface UserState {
  userData: UserData | null;
}

const initialState: UserState = {
  userData: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData(state, action: PayloadAction<UserData>) {
      state.userData = action.payload;
      console.log("User data set:", state.userData);
    },
    clearUserData(state) {
      state.userData = null;
    },
    // NEW: Manual increment farm count action
    incrementUserFarmCount(state) {
      if (state.userData) {
        state.userData.farmCount = (state.userData.farmCount || 0) + 1;
        console.log("Farm count incremented to:", state.userData.farmCount);
      }
    },
    // NEW: Manual decrement farm count action
    decrementUserFarmCount(state) {
      if (state.userData) {
        state.userData.farmCount = Math.max(0, (state.userData.farmCount || 0) - 1);
        console.log("Farm count decremented to:", state.userData.farmCount);
      }
    },
    // NEW: Set farm count directly
    setUserFarmCount(state, action: PayloadAction<number>) {
      if (state.userData) {
        state.userData.farmCount = action.payload;
        console.log("Farm count set to:", state.userData.farmCount);
      }
    },
  },

  
  extraReducers: (builder) => {
    builder
      // Listen to farm save success and increment user farm count
      .addCase(saveFarmToBackend.fulfilled, (state, action) => {
        if (state.userData) {
          state.userData.farmCount = (state.userData.farmCount || 0) + 1;
          console.log("✅ Farm saved successfully! User farm count incremented to:", state.userData.farmCount);
        }
      });
  },
});

export const { 
  setUserData, 
  clearUserData, 
  incrementUserFarmCount, 
  decrementUserFarmCount, 
  setUserFarmCount 
} = userSlice.actions;

export default userSlice.reducer;

// Selectors with proper typing
export const selectUserData = (state: { user: UserState }) => state.user.userData;
export const selectUserFarmCount = (state: { user: UserState }) => state.user.userData?.farmCount || 0;
export const selectUserMembership = (state: { user: UserState }) => state.user.userData?.membership;
export const selectPaymentActiveStatus = (state: { user: UserState }) => state.user.userData?.paymentActiveStatus;