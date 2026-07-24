import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { resolveApiMessage, tMessage } from "../../utils/translateApiMessage";
import { fetchUserCart, mergeLocalCart, clearCart } from "../cart/cartSlice";

export const register = createAsyncThunk(
  "user/register",
  async (userData, { dispatch, getState, rejectWithValue }) => {
    try {
      const config = {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      };

      const { data } = await axios.post("/api/v1/register", userData, config);
      
      const { cart: { cartItems: localCart } } = getState();
      if (localCart && localCart.length > 0) {
        await dispatch(mergeLocalCart(localCart));
      } else {
        await dispatch(fetchUserCart());
      }

      return data;
    } catch (error) {
      return rejectWithValue({ message: resolveApiMessage(error, "api.user.registerFailed") });
    }
  }
);

export const login = createAsyncThunk(
  "user/login",
  async ({ email, password }, { dispatch, getState, rejectWithValue }) => {
    try {
      const config = {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      };
      const { data } = await axios.post("/api/v1/login", { email, password }, config);
      
      const { cart: { cartItems: localCart } } = getState();
      if (localCart && localCart.length > 0) {
        await dispatch(mergeLocalCart(localCart));
      } else {
        await dispatch(fetchUserCart());
      }

      return data;
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue({ message: tMessage("api.user.loginInvalid") });
      }
      return rejectWithValue({ message: resolveApiMessage(error, "api.user.loginFailed") });
    }
  }
);

export const loadUser = createAsyncThunk(
  "user/loadUser",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await axios.get("/api/v1/profile", { withCredentials: true });
      if (data.user) {
        await dispatch(fetchUserCart());
      }
      return data;
    } catch (error) {
      if (error.response?.status === 401) {
        return { user: null, success: false };
      }
      return rejectWithValue({ message: resolveApiMessage(error, "api.user.loadProfileFailed") });
    }
  }
);

export const logout = createAsyncThunk(
  "user/logout",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await axios.post("/api/v1/logout", {}, { withCredentials: true });
      dispatch(clearCart());
      return data;
    } catch (error) {
      return rejectWithValue({ message: resolveApiMessage(error, "api.user.logoutFailed") });
    }
  }
);

export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const config = {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      };

      const { data } = await axios.put("/api/v1/profile/update", formData, config);
      return data;
    } catch (error) {
      return rejectWithValue({ message: resolveApiMessage(error, "api.user.updateProfileFailed") });
    }
  }
);

export const changePassword = createAsyncThunk(
  "user/updatePassword",
  async (formData, { rejectWithValue }) => {
    try {
      const config = {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      };

      const { data } = await axios.put("/api/v1/password/change", formData, config);
      return data;
    } catch (error) {
      return rejectWithValue({ message: resolveApiMessage(error, "api.user.updatePasswordFailed") });
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "user/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const config = {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      };

      const { data } = await axios.post("/api/v1/password/forgot", email, config);
      return data;
    } catch (error) {
      return rejectWithValue({ message: resolveApiMessage(error, "api.user.forgotPasswordFailed") });
    }
  }
);

export const resetPassword = createAsyncThunk(
  "user/resetPassword",
  async ({ token, passwords }, { rejectWithValue }) => {
    try {
      const config = {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      };

      const { data } = await axios.post(`/api/v1/reset/${token}`, passwords, config);
      return data;
    } catch (error) {
      return rejectWithValue({ message: resolveApiMessage(error, "api.user.resetPasswordFailed") });
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    loading: false,
    error: null,
    success: false,
    isAuthenticated: false,
    message: null,
  },
  reducers: {
    removeErrors: (state) => {
      state.error = null;
    },
    removeSuccess: (state) => {
      state.success = null;
    },
    removeMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.success;
        state.user = action.payload?.user || null;
        state.isAuthenticated = Boolean(action.payload?.user);
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || tMessage("api.user.registerFailed");
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.success;
        state.user = action.payload?.user || null;
        state.isAuthenticated = Boolean(action.payload?.user);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || tMessage("api.user.loginInvalid");
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.success;
        state.user = action.payload?.user || null;
        state.isAuthenticated = Boolean(action.payload?.user);
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || tMessage("api.user.loadProfileFailed");
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.success = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || tMessage("api.user.logoutFailed");
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload?.user || state.user;
        state.success = true;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || tMessage("api.user.updateProfileFailed");
      })
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload || tMessage("api.user.updatePasswordFailed");
      })
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload?.message || tMessage("api.user.resetEmailSent");
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload || tMessage("api.user.forgotPasswordFailed");
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload || tMessage("api.user.resetPasswordFailed");
      });
  },
});

export const { removeErrors, removeSuccess, removeMessage } = userSlice.actions;
export default userSlice.reducer;
