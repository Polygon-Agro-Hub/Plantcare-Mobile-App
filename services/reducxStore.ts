import { configureStore } from '@reduxjs/toolkit';
import packageReducer from '../store/packageSlice';
import farmReducer from '../store/farmSlice';
import  userReducer  from '../store/userSlice';

const store = configureStore({
  reducer: {
    package: packageReducer,
    farm: farmReducer,
     user: userReducer,
  },
});

export default store;
export type RootState = ReturnType<typeof store.getState>; 
export type AppDispatch = typeof store.dispatch;