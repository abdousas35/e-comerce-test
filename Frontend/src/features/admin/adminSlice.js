import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { resolveApiMessage, tMessage } from "../../utils/translateApiMessage";

export const fetchAdminProducts = createAsyncThunk(
  "admin/fetchAdminProducts",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/api/v1/admin/products");
      return data;
    } catch (error) {
      return rejectWithValue({ message: resolveApiMessage(error, "api.admin.fetchProductsFailed") });
    }
  }
);

export const fetchAdminProductById = createAsyncThunk(
  "admin/fetchAdminProductById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/v1/product/${id}`);
      return data.product;
    } catch (error) {
      return rejectWithValue({ message: resolveApiMessage(error, "api.admin.fetchProductFailed") });
    }
  }
);

export const createProduct = createAsyncThunk(
  "admin/createProduct",
  async (productData, { rejectWithValue }) => {
    try {
      const config = { headers: { "Content-Type": "application/json" } };
      const { data } = await axios.post("/api/v1/admin/product/create", productData, config);
      return data;
    } catch (error) {
      return rejectWithValue({ message: resolveApiMessage(error, "api.admin.createProductFailed") });
    }
  }
);

export const updateProduct = createAsyncThunk(
  "admin/updateProduct",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const config = { headers: { "Content-Type": "application/json" } };
      const { data } = await axios.put(`/api/v1/admin/product/${id}`, formData, config);
      return data;
    } catch (error) {
      return rejectWithValue({ message: resolveApiMessage(error, "api.admin.updateProductFailed") });
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "admin/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.delete(`/api/v1/admin/product/${id}`);
      return { ...data, id };
    } catch (error) {
      return rejectWithValue({ message: resolveApiMessage(error, "api.admin.deleteProductFailed") });
    }
  }
);

export const fetchUsers = createAsyncThunk(
  "admin/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/api/v1/admin/usersList");
      return data;
    } catch (error) {
      return rejectWithValue({ message: resolveApiMessage(error, "api.admin.fetchUsersFailed") });
    }
  }
);

export const getSingleUser = createAsyncThunk(
  "admin/getSingleUser",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/v1/admin/user/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue({ message: resolveApiMessage(error, "api.admin.fetchUserFailed") });
    }
  }
);

export const updateUserRole = createAsyncThunk(
  "admin/updateUserRole",
  async ({ id, role }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(`/api/v1/admin/userRole/${id}`, { role });
      return data;
    } catch (error) {
      return rejectWithValue({ message: resolveApiMessage(error, "api.admin.updateUserRoleFailed") });
    }
  }
);

export const deleteUser = createAsyncThunk(
  "admin/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/v1/admin/userDelete/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue({ message: resolveApiMessage(error, "api.admin.deleteUserFailed") });
    }
  }
);

export const fetchAllOrders = createAsyncThunk(
  "admin/fetchAllOrders",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/api/v1/admin/orders");
      return data;
    } catch (error) {
      return rejectWithValue({ message: resolveApiMessage(error, "api.admin.fetchOrdersFailed") });
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "admin/updateOrderStatus",
  async ({ id, status, trackingNumber, trackingUrl, courier, note }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(`/api/v1/admin/orderUpdate/${id}`, { status, trackingNumber, trackingUrl, courier, note });
      return data;
    } catch (error) {
      return rejectWithValue({ message: resolveApiMessage(error, "api.admin.updateOrderStatusFailed") });
    }
  }
);

export const importProductsCsv = createAsyncThunk(
  "admin/importProductsCsv",
  async ({ csvText }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("/api/v1/admin/products/import-csv", { csvText });
      return data;
    } catch (error) {
      return rejectWithValue({ message: error.response?.data?.message || "Failed to import CSV products" });
    }
  }
);

export const deleteOrder = createAsyncThunk(
  "admin/deleteOrder",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.delete(`/api/v1/admin/orderDelete/${id}`);
      return { ...data, id };
    } catch (error) {
      return rejectWithValue({ message: resolveApiMessage(error, "api.admin.deleteOrderFailed") });
    }
  }
);

export const fetchProductReviews = createAsyncThunk(
  "admin/fetchProductReviews",
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/v1/reviews?id=${productId}`);
      if (!data.success) {
        return rejectWithValue({ message: tMessage("api.admin.fetchReviewsFailed") });
      }
      return { reviews: data.reviews || [], productId };
    } catch (error) {
      return rejectWithValue({ message: resolveApiMessage(error, "api.admin.fetchReviewsFailed") });
    }
  }
);

export const fetchCoupons = createAsyncThunk(
  "admin/fetchCoupons",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/api/v1/admin/coupons");
      return data;
    } catch (error) {
      return rejectWithValue({ message: error.response?.data?.message || "Failed to fetch coupons" });
    }
  }
);

export const createCoupon = createAsyncThunk(
  "admin/createCoupon",
  async (couponData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("/api/v1/admin/coupons", couponData, {
        headers: { "Content-Type": "application/json" },
      });
      return data;
    } catch (error) {
      return rejectWithValue({ message: error.response?.data?.message || "Failed to create coupon" });
    }
  }
);

export const deleteCoupon = createAsyncThunk(
  "admin/deleteCoupon",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/v1/admin/coupon/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue({ message: error.response?.data?.message || "Failed to delete coupon" });
    }
  }
);

export const deleteReview = createAsyncThunk(
  "admin/deleteReview",
  async ({ productId, reviewId }, { rejectWithValue }) => {
    try {
      const { data } = await axios.delete(`/api/v1/admin/deleteReview?productId=${productId}&id=${reviewId}`);

      if (!data.success) {
        return rejectWithValue({ message: tMessage("api.admin.deleteReviewFailed") });
      }

      return { success: true, productId };
    } catch (error) {
      return rejectWithValue({ message: resolveApiMessage(error, "api.admin.deleteReviewFailed") });
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    products: [],
    productCount: 0,
    resultPerPage: 6,
    totalPages: 1,
    success: false,
    loading: false,
    error: null,
    product: null,
    deleteLoading: false,
    users: [],
    user: {},
    orders: [],
    totalAmount: 0,
    order: [],
    reviews: [],
    coupons: [],
  },
  reducers: {
    removeErrors: (state) => {
      state.error = null;
    },
    removeSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || [];
        state.productCount = action.payload.productCount || 0;
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || tMessage("api.admin.fetchProductsFailed");
      })
      .addCase(fetchAdminProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload || null;
      })
      .addCase(fetchAdminProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || tMessage("api.admin.fetchProductFailed");
      })
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        if (action.payload.product) {
          state.products = [action.payload.product, ...state.products];
          state.productCount += 1;
        }
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || tMessage("api.admin.createProductFailed");
      })
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.success;
        state.product = action.payload.product;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || tMessage("api.admin.updateProductFailed");
      })
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.products = state.products.filter((p) => p._id !== action.payload.id);
        state.productCount -= 1;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || tMessage("api.admin.deleteProductFailed");
      })
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || tMessage("api.admin.fetchUsersFailed");
      })
      .addCase(getSingleUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSingleUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(getSingleUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || tMessage("api.admin.fetchUserFailed");
      })
      .addCase(updateUserRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.success;
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || tMessage("api.admin.updateUserRoleFailed");
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.users = state.users.filter((u) => u._id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || tMessage("api.admin.deleteUserFailed");
      })
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.orders = action.payload.orders;
        state.totalAmount = action.payload.totalAmount;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || tMessage("api.admin.fetchOrdersFailed");
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.success;
        state.orders = state.orders.map((o) => (o._id === action.payload.order._id ? action.payload.order : o));
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || tMessage("api.admin.updateOrderStatusFailed");
      })
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.orders = state.orders.filter((o) => o._id !== action.payload.id);
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || tMessage("api.admin.deleteOrderFailed");
      })
      .addCase(fetchProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.reviews;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || tMessage("api.admin.fetchReviewsFailed");
        state.reviews = [];
      })
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.reviews = state.reviews.filter((r) => r._id !== action.meta.arg.reviewId);
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || tMessage("api.admin.deleteReviewFailed");
      })
      .addCase(fetchCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload.coupons || [];
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch coupons";
      })
      .addCase(createCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        if (action.payload.coupon) {
          state.coupons = [action.payload.coupon, ...state.coupons];
        }
      })
      .addCase(createCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create coupon";
      })
      .addCase(importProductsCsv.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(importProductsCsv.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.products = [...(action.payload.products || []), ...state.products];
        state.productCount += action.payload.importedCount || 0;
      })
      .addCase(importProductsCsv.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to import CSV products";
      })
      .addCase(deleteCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.coupons = state.coupons.filter((coupon) => coupon._id !== action.payload);
      })
      .addCase(deleteCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete coupon";
      });
  },
});

export const { removeErrors, removeSuccess } = adminSlice.actions;
export default adminSlice.reducer;
