import authReducer from "@slices/authSlice";
import modalReducer from "@slices/modalSlice";
import { configureStore } from "@reduxjs/toolkit";
import noteSlice from "@slices/noteSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    modal: modalReducer,
    note: noteSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
