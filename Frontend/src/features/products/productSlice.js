import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { resolveApiMessage, tMessage } from "../../utils/translateApiMessage";

export const getProduct = createAsyncThunk(
  "product/getProduct",
  async ({ keyword = "", category = "", page = 1, limit = 8 } = {}, { rejectWithValue }) => {
    try {
      // بناء الـ Query Params بشكل منظم وسليم
      const params = new URLSearchParams();

      if (keyword) params.append("keyword", keyword);
      if (category) params.append("category", category);
      if (page) params.append("page", page);
      if (limit) params.append("limit", limit);

      const link = `/api/v1/products?${params.toString()}`;
      const { data } = await axios.get(link);
      return data;
    } catch (error) {
      return rejectWithValue({ message: resolveApiMessage(error, "api.products.loadFailed") });
    }
  }
);

export const getProductDetails = createAsyncThunk("product/getProductDetails", async (id, { rejectWithValue }) => {
  try {
    const { data } = await axios.get(`/api/v1/product/${id}`);
    return data;
  } catch (error) {
    return rejectWithValue({ message: resolveApiMessage(error, "api.products.detailsFailed") });
  }
});

export const createReview = createAsyncThunk("product/createReview", async ({ rating, comment, productId }, { rejectWithValue }) => {
  try {
    const config = {
      headers: { "Content-Type": "application/json" },
      withCredentials: true
    };
    const { data } = await axios.post("/api/v1/review", { rating, comment, productId }, config);
    return data;
  } catch (error) {
    return rejectWithValue({ message: resolveApiMessage(error, "api.products.reviewFailed") });
  }
});

const productSlice = createSlice({
  name: "product",
  initialState: {
    products: [],
    productCount: 0,
    loading: false,
    error: null,
    product: null,
    resultPerPage: 6,
    totalPages: 0,
    reviewSuccess: false,
    reviewLoading: false
  },
  reducers: {
    removeErrors: (state) => { state.error = null },
    removeSuccess: (state) => { state.reviewSuccess = false },
    clearProducts: (state) => { state.products = []; state.productCount = 0 }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProduct.pending, (state) => { state.loading = true; state.error = null })
      .addCase(getProduct.fulfilled, (state, action) => {
        state.loading = false; state.error = null;
        if (Array.isArray(action.payload)) state.products = action.payload;
        else {
          state.products = action.payload.products || [];
          state.productCount = action.payload.productCount || 0;
          state.resultPerPage = action.payload.resultPerPage || 8;
          state.totalPages = action.payload.totalPages || Math.ceil((action.payload.productCount || 0) / (action.payload.resultPerPage || 6));
        }
      })
      .addCase(getProduct.rejected, (state, action) => { state.loading = false; state.error = action.payload?.message || tMessage("common.somethingWrong") })

      .addCase(getProductDetails.pending, (state) => { state.loading = true; state.error = null })
      .addCase(getProductDetails.fulfilled, (state, action) => { state.loading = false; state.error = null; state.product = action.payload.product || null })
      .addCase(getProductDetails.rejected, (state, action) => { state.loading = false; state.error = action.payload?.message || tMessage("common.somethingWrong") })

      .addCase(createReview.pending, (state) => { state.reviewLoading = true; state.error = null })
      .addCase(createReview.fulfilled, (state) => { state.reviewLoading = false; state.reviewSuccess = true })
      .addCase(createReview.rejected, (state, action) => { state.reviewLoading = false; state.error = action.payload?.message || tMessage("common.somethingWrong") })
  }
});

export const { removeErrors, removeSuccess, clearProducts } = productSlice.actions;
export default productSlice.reducer;