import { configureStore } from '@reduxjs/toolkit';
import packageReducer from '../store/packageSlice';

const store = configureStore({
  reducer: {
    package: packageReducer,
  },
});

export default store;
export type RootState = ReturnType<typeof store.getState>; 