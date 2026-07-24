import { configureStore } from "@reduxjs/toolkit";
import productReducer from "../features/products/productSlice";
import userReducer from "../features/user/userSlice";
import cartReducer from "../features/cart/cartSlice";
import orderReducer from "../features/Order/orderSlice";
import adminReducer from "../features/admin/adminSlice";
import settingsReducer from "../features/settings/siteSettingsSlice";

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const store = configureStore({
  reducer: {
    product: productReducer,
    user: userReducer,
    cart: cartReducer,
    order: orderReducer,
    admin: adminReducer,
    settings: settingsReducer
  }
});

const debouncedSaveState = debounce((state) => {
  try {
    const serializedCartItems = JSON.stringify(state.cart.cartItems);
    localStorage.setItem("cartItems", serializedCartItems);
    
    const serializedShippingInfo = JSON.stringify(state.cart.shippingInfo);
    localStorage.setItem("shippingInfo", serializedShippingInfo);
  } catch (error) {
    console.error("Could not save state to localStorage", error);
  }
}, 300);

store.subscribe(() => {
  debouncedSaveState(store.getState());
});
