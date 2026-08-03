import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  removeItemFromCart,
  removeMessage,
  removeErrors,
  setItemQuantity,
  syncCartToServer,
} from "../features/cart/cartSlice";

const SYNC_DEBOUNCE_MS = 600;

function CartItem({ item }) {
  const { success, error, message } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const syncTimeoutRef = useRef(null);

  // Debounced server sync — fires SYNC_DEBOUNCE_MS after the user stops clicking
  const scheduleSync = () => {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      dispatch(syncCartToServer());
    }, SYNC_DEBOUNCE_MS);
  };

  useEffect(() => {
    return () => {
      // Flush pending change on unmount so it isn't lost
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
        dispatch(syncCartToServer());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const increase = () => {
    if (item.quantity >= item.stock) {
      toast.error(t("cart.quantityStock"), { position: "top-center", autoClose: 3000 });
      return;
    }
    dispatch(setItemQuantity({ cartKey: item.cartKey, quantity: item.quantity + 1 }));
    scheduleSync();
  };

  const decrease = () => {
    if (item.quantity <= 1) {
      toast.error(t("cart.quantityMin"), { position: "top-center", autoClose: 3000 });
      return;
    }
    dispatch(setItemQuantity({ cartKey: item.cartKey, quantity: item.quantity - 1 }));
    scheduleSync();
  };

  const handleRemove = () => {
    dispatch(removeItemFromCart(item.cartKey));
    toast.success(t("cart.itemRemoved"), { position: "top-center", autoClose: 3000, toastId: `remove-${item.cartKey}` });
    dispatch(removeMessage());
  };

  useEffect(() => {
    if (error) {
      toast.error(t("common.somethingWrong"), { position: "top-center", autoClose: 3000 });
      dispatch(removeErrors());
    }
  }, [dispatch, error, t]);

  useEffect(() => {
    if (success && message) {
      toast.success(message, { position: "top-center", autoClose: 3000, toastId: "cart-update" });
      dispatch(removeMessage());
    }
  }, [success, message, dispatch]);

  return (
    <div className="cart-item">
      <div className="item-info">
        <img src={item.image || "/placeholder.png"} alt={item.name} className="item-image" />
        <div className="item-details">
          <h3 className="item-name">{item.name}</h3>
          <p className="item-price"><strong>{t("product.price")}:</strong> {item.price}</p>
          {item.variantLabel ? <p className="item-price"><strong>{t("cart.selection")}:</strong> {item.variantLabel}</p> : null}
        </div>
      </div>

      <div className="quantity-controls">
        <button className="quantity-button decrease-btn" onClick={decrease}>-</button>
        <input className="quantity-input" readOnly min="1" value={item.quantity} />
        <button className="quantity-button increase-btn" onClick={increase}>+</button>
      </div>

      <div className="item-total">
        <span className="item-total-price">{item.price * item.quantity}</span>
      </div>

      <div className="item-actions">
        <button className="remove-item-btn" onClick={handleRemove}>{t("common.remove")}</button>
      </div>
    </div>
  );
}

export default CartItem;