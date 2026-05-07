import React, { useEffect, useState } from "react";
import "../CartStyles/Shipping.css";
import PageTitle from "../components/PageTitle";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CheckoutPath from "./CheckoutPath";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { saveShippingInfo } from "../features/cart/cartSlice";
import { useNavigate } from "react-router-dom";

function Shipping() {
  const { shippingInfo } = useSelector((state) => state.cart);
  const { settings } = useSelector((state) => state.settings);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [selectedState, setSelectedState] = useState(shippingInfo.selectedState || "");
  const [selectedCity, setSelectedCity] = useState(shippingInfo.selectedCity || "");
  const [cities, setCities] = useState([]);
  const [address, setAddress] = useState(shippingInfo.address || "");
  const [pincode, setPincode] = useState(shippingInfo.pincode || "");
  const [phoneNumber, setPhoneNumber] = useState(shippingInfo.phoneNumber || "");

  const shippingZones = settings?.shippingZones || [];
  const statesAndCities = shippingZones.reduce((acc, zone) => {
    acc[zone.state] = zone.cities || [];
    return acc;
  }, {});

  const handleStateChange = (e) => {
    const state = e.target.value;
    setSelectedState(state);
    setCities(statesAndCities[state] || []);
    setSelectedCity("");
  };

  const shippingInfoSubmit = (e) => {
    e.preventDefault();

    if (phoneNumber.length !== 8) {
      toast.error(t("cart.invalidPhone"), { position: "top-center", autoClose: 3000 });
      return;
    }

    if (!selectedState || !selectedCity || !address || !pincode) {
      toast.error(t("cart.fillRequired"), { position: "top-center", autoClose: 3000 });
      return;
    }

    dispatch(saveShippingInfo({ address, pincode, phoneNumber, selectedState, selectedCity, country: "Tunisia" }));
    toast.success(t("cart.shippingSaved"), { position: "top-center", autoClose: 3000 });
    navigate("/order/confirm");
  };

  useEffect(() => {
    if (selectedState) {
      setCities(statesAndCities[selectedState] || []);
    }
  }, [selectedState]);

  return (
    <>
      <PageTitle title={t("cart.shippingInfo")} />
      <Navbar />
      <CheckoutPath activePath={0} />

      <div className="shipping-form-container">
        <h1 className="shipping-form-header">{t("cart.shippingDetails")}</h1>
        <form className="shipping-form" onSubmit={shippingInfoSubmit}>
          <div className="shipping-section">
            <div className="shipping-form-group">
              <label htmlFor="address">{t("cart.address")}</label>
              <input type="text" required name="address" id="address" placeholder={t("cart.enterAddress")} value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            <div className="shipping-form-group">
              <label htmlFor="pinCode">{t("cart.pinCode")}</label>
              <input type="password" required name="pinCode" id="pinCode" placeholder={t("cart.enterPinCode")} value={pincode} onChange={(e) => setPincode(e.target.value)} />
            </div>

            <div className="shipping-form-group">
              <label htmlFor="phoneNumber">{t("cart.phoneNumber")}</label>
              <input type="number" required name="phoneNumber" id="phoneNumber" placeholder={t("cart.enterPhoneNumber")} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            </div>
          </div>

          <div className="shipping-section">
            <div className="shipping-form-group">
              <label htmlFor="state">{t("cart.state")}</label>
              <select name="state" id="state" required value={selectedState} onChange={handleStateChange}>
                <option value="">{t("cart.selectState")}</option>
                {Object.keys(statesAndCities).map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div className="shipping-form-group">
              <label htmlFor="city">{t("cart.city")}</label>
              {selectedState ? (
                <select name="city" id="city" required value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                  <option value="">{t("cart.selectCity")}</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              ) : (
                <select name="city" id="city" disabled>
                  <option value="">{t("cart.selectStateFirst")}</option>
                </select>
              )}
            </div>
          </div>

          <button className="shipping-submit-btn" type="submit">{t("common.continue")}</button>
        </form>
      </div>

      <Footer />
    </>
  );
}

export default Shipping;
