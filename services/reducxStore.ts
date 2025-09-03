import { configureStore } from '@reduxjs/toolkit';
import packageReducer from '../store/packageSlice';
import farmReducer from '../store/farmSlice';
import  userReducer  from '../store/userSlice';
import assetReducer from '../store/assetSlice'

const store = configureStore({
  reducer: {
    package: packageReducer,
    farm: farmReducer,
     user: userReducer,
     assets: assetReducer
  },
});

export default store;
export type RootState = ReturnType<typeof store.getState>; 
export type AppDispatch = typeof store.dispatch;