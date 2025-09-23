import { configureStore } from '@reduxjs/toolkit';
import canvasReducer from './canvasSlice';

export const store = configureStore({
  reducer: {
    canvas: canvasReducer,
  },
});

// Type of the entire state tree
export type RootState = ReturnType<typeof store.getState>;

// Type of dispatch function
export type AppDispatch = typeof store.dispatch;
