import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { resolveApiMessage, tMessage } from "../../utils/translateApiMessage";


// Add items to cart
export const addItemsToCart = createAsyncThunk(
  "cart/AddItemsToCart",
  async ({ id, quantity, variantId = "" }, { getState, rejectWithValue }) => {
    try {
      const {data} = await axios.get(`/api/v1/product/${id}`);
      const selectedVariant = variantId
        ? data.product?.variants?.find((variant) => variant._id === variantId)
        : null;
      const productDiscount = Number(data.product.discount || 0);
      const variantPrice = selectedVariant?.price ?? data.product.price;
      const itemPrice = Math.max(0, variantPrice - productDiscount);
      const itemStock = selectedVariant?.stock ?? data.product.stock;
      const cartKey = `${data.product._id}-${selectedVariant?._id || "default"}`;
      return{
        cartKey,
        product:data.product._id,
        name:data.product.name,
        price:itemPrice,
        image:data.product.image[0].url,
        stock:itemStock,
        variantId: selectedVariant?._id || "",
        variantLabel: selectedVariant?.label || "",
        selectedOptions: {
          size: selectedVariant?.size || "",
          color: selectedVariant?.color || "",
        },
        sku: selectedVariant?.sku || "",
        quantity
        
      } ;


    } catch (error) {
      return rejectWithValue({ message: resolveApiMessage(error, "api.cart.addFailed") });
    }
  }
);


const cartSlice = createSlice({

  name: "cart",
  initialState: {

    cartItems: JSON.parse(localStorage.getItem("cartItems")) || [],
    quickBuyItem: null,
    loading: false,
    error: null,
    success: false,
    message: null,
    removingId: null,
    shippingInfo: JSON.parse(localStorage.getItem('shippingInfo')) || {}

  },
  reducers:{

    removeErrors: (state) => {

      state.error = null

    },
    removeMessage: (state) => {

      state.message = null

    },
    removeItemFromCart: (state, action) => {

      state.removingId = action.payload;
      state.cartItems = state.cartItems.filter( item => item.cartKey !== action.payload );
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
      state.removingId = null

    },
    saveShippingInfo:(state, action) => {

      state.shippingInfo = action.payload
      localStorage.setItem('shippingInfo', JSON.stringify(state.shippingInfo))

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
      localStorage.removeItem("cartItems");
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
    const existingItem = state.cartItems.find(i => i.cartKey === item.cartKey);

    if (existingItem) {
      existingItem.quantity = item.quantity;
      existingItem.stock = item.stock;
      existingItem.price = item.price;
      state.message = tMessage("api.cart.updatedQuantity", { name: item.name });
    } else {
      state.cartItems.push(item);
      state.message = tMessage("api.cart.itemAdded", { name: item.name });
    }

    state.loading = false;
    state.error = null;
    state.success = true;
    localStorage.setItem("cartItems", JSON.stringify(state.cartItems))
  });

    builder.addCase(addItemsToCart.rejected, (state, action) => {

      state.loading = false;
      state.error = action.payload?.message || tMessage("common.somethingWrong");

    })

  }

})



export const { removeErrors, removeMessage, removeItemFromCart, saveShippingInfo, setQuickBuyItem, clearQuickBuyItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
