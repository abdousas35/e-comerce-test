import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { addItemsToCart, removeItemFromCart, removeMessage, removeErrors } from "../features/cart/cartSlice";

function CartItem({ item }) {
  const { success, loading, error, message } = useSelector((state) => state.cart);
  const [quantity, setQuantity] = useState(item.quantity);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const increase = () => {
    if (quantity >= item.stock) {
      toast.error(t("cart.quantityStock"), { position: "top-center", autoClose: 3000 });
      return;
    }
    setQuantity((prev) => prev + 1);
  };

  const decrease = () => {
    if (quantity <= 1) {
      toast.error(t("cart.quantityMin"), { position: "top-center", autoClose: 3000 });
      return;
    }
    setQuantity((prev) => prev - 1);
  };

  const handleUpdate = () => {
    if (loading) return;
    if (quantity !== item.quantity) {
      dispatch(addItemsToCart({ id: item.product, quantity, variantId: item.variantId }));
    }
  };

  const handleRemove = () => {
    if (loading) return;
    dispatch(removeItemFromCart(item.cartKey));
    toast.success(t("cart.itemRemoved"), { position: "top-center", autoClose: 3000 });
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
          {item.variantLabel ? <p className="item-price"><strong>Variant:</strong> {item.variantLabel}</p> : null}
        </div>
      </div>

      <div className="quantity-controls">
        <button className="quantity-button decrease-btn" onClick={decrease}>-</button>
        <input className="quantity-input" readOnly min="1" value={quantity} />
        <button className="quantity-button increase-btn" onClick={increase}>+</button>
      </div>

      <div className="item-total">
        <span className="item-total-price">{item.price * item.quantity}</span>
      </div>

      <div className="item-actions">
        <button className="update-item-btn" disabled={quantity === item.quantity} onClick={handleUpdate}>{t("common.update")}</button>
        <button className="remove-item-btn" onClick={handleRemove}>{t("common.remove")}</button>
      </div>
    </div>
  );
}

export default CartItem;
