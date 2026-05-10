import type { IForm, IUser } from "@/interfaces";
import { loginUser, logoutUser, restoreUser, signUpUser } from "@utils/apiUtil";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { modalSlice } from "@slices/modalSlice";
import DOMPurify from "dompurify";
import { StorageUtil } from "@/utils/storageUtil";

interface IAuthState {
  user: IUser | null;
  isAuth: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: IAuthState = {
  user: null,
  isAuth: false,
  isLoading: true,
  error: null,
};

export const signIn = createAsyncThunk(
  "auth/signin",
  async (form: IForm, { dispatch, rejectWithValue }) => {
    try {
      const { token, user } = await loginUser(
        JSON.stringify({
          email: DOMPurify.sanitize(form.email),
          password: DOMPurify.sanitize(form.password),
        })
      );

      if (!user || !token) {
        throw new Error("Invalid credentials");
      }

      dispatch(
        modalSlice.actions.setModal({
          message: "signInStatus.success",
          status: "success",
        })
      );

      StorageUtil.set("token", token);
      return user;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Authentication failed";

      dispatch(
        modalSlice.actions.setModal({
          message: "signInStatus.fetchError",
          status: "error",
        })
      );

      return rejectWithValue(message);
    }
  }
);

export const restoreAuth = createAsyncThunk(
  "auth/restoreAuth",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const user = await restoreUser();

      if (user) {
        dispatch(
          modalSlice.actions.setModal({
            message: "restoreAuthStatus.success",
            status: "success",
          })
        );
        return user;
      } else {
        StorageUtil.remove("token");

        dispatch(
          modalSlice.actions.setModal({
            message: "restoreAuthStatus.warning",
            status: "warning",
          })
        );
        return rejectWithValue("User not found");
      }
    } catch (error) {
      console.error("Auth check failed:", error);

      dispatch(
        modalSlice.actions.setModal({
          message: "restoreAuthStatus.error",
          status: "error",
        })
      );

      StorageUtil.remove("token");

      return rejectWithValue("Auth check failed");
    }
  }
);

export const signUp = createAsyncThunk(
  "auth/signup",
  async (form: IForm, { dispatch, rejectWithValue }) => {
    try {
      const { token, user } = await signUpUser(
        JSON.stringify({
          email: DOMPurify.sanitize(form.email),
          password: DOMPurify.sanitize(form.password),
        })
      );

      if (!user || !token) {
        throw new Error("Signup failed");
      }

      dispatch(
        modalSlice.actions.setModal({
          message: "signUpStatus.success",
          status: "success",
        })
      );

      StorageUtil.set("token", token);
      return user;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Signup failed";

      dispatch(
        modalSlice.actions.setModal({
          message: "signUpStatus.error",
          status: "error",
        })
      );

      return rejectWithValue(message);
    }
  }
);

export const logOut = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    await logoutUser();

    dispatch(
      modalSlice.actions.setModal({
        message: "logOutStatus.success",
        status: "info",
      })
    );
    return null;
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuth = true;
      state.error = null;
      state.isLoading = false;
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuth = false;
      state.error = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuth = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuth = false;
        state.user = null;
        state.error = action.payload as string;
      })

      .addCase(signUp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(restoreAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(restoreAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuth = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(restoreAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuth = false;
        state.user = null;
        state.error = action.payload as string;
      })

      .addCase(logOut.fulfilled, (state) => {
        state.user = null;
        state.isAuth = false;
        state.error = null;
        state.isLoading = false;
      });
  },
});

export const { clearAuth, setUser } = authSlice.actions;
export default authSlice.reducer;
