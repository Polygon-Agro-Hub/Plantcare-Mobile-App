import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userData: null
};



const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData(state, action) {
      state.userData = action.payload;
console.log("User data:", state.userData, );    },
    clearUserData(state) {
      state.userData = null;
    },
  },

  
});

export const { setUserData, clearUserData } = userSlice.actions;
export default userSlice.reducer;
