import authReducer from "@slices/authSlice";
import modalReducer from "@slices/modalSlice";
import { configureStore } from "@reduxjs/toolkit";
import noteSlice from "@slices/noteSlice";
import tagsSlice from "@/slices/tagsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    modal: modalReducer,
    note: noteSlice,
    tags: tagsSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
