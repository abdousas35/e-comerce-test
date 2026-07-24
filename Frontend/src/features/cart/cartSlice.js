import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { resolveApiMessage, tMessage } from "../../utils/translateApiMessage";


// Add items to cart
export const addItemsToCart = createAsyncThunk(
  "cart/AddItemsToCart",
  async ({ id, quantity, variantId = "", product }, { dispatch, rejectWithValue }) => {
    
    const selectedVariant = variantId ? product?.variants?.find(v => v._id === variantId) : null;
    const itemPrice = selectedVariant?.price ?? product.price;
    const cartKey = `${product._id}-${selectedVariant?._id || "default"}`;
    const optimisticItem = {
        cartKey,
        product: product._id,
        name: product.name,
        price: itemPrice,
        image: product.image[0].url,
        stock: selectedVariant?.stock ?? product.stock,
        variantId: selectedVariant?._id || "",
        variantLabel: selectedVariant?.label || "",
        quantity,
        optimistic: true 
    };

    dispatch(cartSlice.actions.addOptimisticItem(optimisticItem));

    try {
      const {data} = await axios.get(`/api/v1/product/${id}`);
      const serverProduct = data.product;
      const serverSelectedVariant = variantId ? serverProduct?.variants?.find((variant) => variant._id === variantId) : null;
      const productDiscount = Number(serverProduct.discount || 0);
      const serverItemPrice = Math.max(0, (serverSelectedVariant?.price ?? serverProduct.price) - productDiscount);
      const serverItemStock = serverSelectedVariant?.stock ?? serverProduct.stock;
      const serverCartKey = `${serverProduct._id}-${serverSelectedVariant?._id || "default"}`;

      return {
        cartKey: serverCartKey,
        product: serverProduct._id,
        name: serverProduct.name,
        price: serverItemPrice,
        image: serverProduct.image[0].url,
        stock: serverItemStock,
        variantId: serverSelectedVariant?._id || "",
        variantLabel: serverSelectedVariant?.label || "",
        quantity
      } ;
    } catch (error) {
      dispatch(cartSlice.actions.rollbackOptimisticItem({ cartKey }));
      return rejectWithValue({ message: resolveApiMessage(error, "api.cart.addFailed") });
    }
  }
);

export const fetchUserCart = createAsyncThunk(
  "cart/fetchUserCart",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/api/v1/cart");
      return data.cart;
    } catch (error) {
      return rejectWithValue({ message: resolveApiMessage(error, "api.cart.fetchFailed") });
    }
  }
);

export const mergeLocalCart = createAsyncThunk(
  "cart/mergeLocalCart",
  async (cartItems, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("/api/v1/cart/merge", { cartItems });
      return data.cart;
    } catch (error) {
      return rejectWithValue({ message: resolveApiMessage(error, "api.cart.mergeFailed") });
    }
  }
);


const safeJSONParse = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Failed to parse ${key} from localStorage`, error);
    return defaultValue;
  }
};

const cartSlice = createSlice({

  name: "cart",
  initialState: {

    cartItems: safeJSONParse("cartItems", []),
    quickBuyItem: null,
    loading: false,
    error: null,
    success: false,
    message: null,
    removingId: null,
    shippingInfo: safeJSONParse("shippingInfo", {})

  },
  reducers:{
    addOptimisticItem: (state, action) => {
        const item = action.payload;
        const existingItem = state.cartItems.find(i => i.cartKey === item.cartKey);
        if (existingItem) {
            existingItem.quantity = item.quantity;
        } else {
            state.cartItems.push(item);
        }
        state.message = tMessage("api.cart.itemAdded", { name: item.name });

    },
    rollbackOptimisticItem: (state, action) => {
        state.cartItems = state.cartItems.filter(item => item.cartKey !== action.payload.cartKey);

    },
    removeErrors: (state) => {

      state.error = null

    },
    removeMessage: (state) => {

      state.message = null

    },
    removeItemFromCart: (state, action) => {

      state.removingId = action.payload;
      state.cartItems = state.cartItems.filter( item => item.cartKey !== action.payload );
      state.removingId = null

    },
    saveShippingInfo:(state, action) => {

      state.shippingInfo = action.payload

    },
    setQuickBuyItem: (state, action) => {
      state.quickBuyItem = action.payload;
    },
    clearQuickBuyItem: (state) => {
      state.quickBuyItem = null;
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.success = false;
      state.message = null;
      state.error = null;
    }

  },
  extraReducers: (builder) => {

    //Add items to cart
    builder.addCase(addItemsToCart.pending, (state) => {

      state.loading = true
      state.error = null

    })

  builder.addCase(addItemsToCart.fulfilled, (state, action) => {
    const item = action.payload;
    const existingItemIndex = state.cartItems.findIndex(i => i.cartKey === item.cartKey);

    if (existingItemIndex !== -1) {
      state.cartItems[existingItemIndex] = { ...item, optimistic: false };
    } 

    state.loading = false;
    state.error = null;
    state.success = true;
  });

    builder.addCase(addItemsToCart.rejected, (state, action) => {

      state.loading = false;
      state.error = action.payload?.message || tMessage("common.somethingWrong");

    })

    // Fetch user cart
    builder.addCase(fetchUserCart.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchUserCart.fulfilled, (state, action) => {
      state.loading = false;
      state.cartItems = action.payload;
    });
    builder.addCase(fetchUserCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message;
    });

    // Merge local cart
    builder.addCase(mergeLocalCart.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(mergeLocalCart.fulfilled, (state, action) => {
      state.loading = false;
      state.cartItems = action.payload;
    });
    builder.addCase(mergeLocalCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message;
    });

  }

})



export const { removeErrors, removeMessage, removeItemFromCart, saveShippingInfo, setQuickBuyItem, clearQuickBuyItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
