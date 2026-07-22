import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
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

const fallbackShippingZones = [
  { state: "Tunis", cities: ["Bab El Bhar", "Bab Souika", "Carthage", "La Marsa", "Le Bardo"], rate: 6, estimatedDays: "1-2 business days" },
  { state: "Ariana", cities: ["Ariana City", "Ettadhamen", "La Soukra", "Raoued"], rate: 6, estimatedDays: "1-2 business days" },
  { state: "Ben Arous", cities: ["Bou Mhel", "El Mourouj", "Ezzahra", "Rades"], rate: 6, estimatedDays: "1-2 business days" },
  { state: "Manouba", cities: ["Manouba", "Djedeida", "Douar Hicher", "Mornaguia"], rate: 6, estimatedDays: "1-2 business days" },
  { state: "Nabeul", cities: ["Nabeul", "Hammamet", "Korba", "Kelibia"], rate: 7, estimatedDays: "2-3 business days" },
  { state: "Zaghouan", cities: ["Zaghouan", "El Fahs", "En-Nadhour", "Saouaf"], rate: 7, estimatedDays: "2-3 business days" },
  { state: "Bizerte", cities: ["Bizerte", "Mateur", "Menzel Bourguiba", "Utique"], rate: 7, estimatedDays: "2-3 business days" },
  { state: "Sousse", cities: ["Sousse", "Hammam Sousse", "Akouda", "Enfidha"], rate: 7, estimatedDays: "2-3 business days" },
  { state: "Monastir", cities: ["Monastir", "Ksar Hellal", "Moknine", "Teboulba"], rate: 7, estimatedDays: "2-3 business days" },
  { state: "Mahdia", cities: ["Mahdia", "Ksour Essef", "Chebba", "El Jem"], rate: 7, estimatedDays: "2-3 business days" },
  { state: "Beja", cities: ["Beja", "Medjez El Bab", "Nefza", "Testour"], rate: 8, estimatedDays: "2-4 business days" },
  { state: "Jendouba", cities: ["Jendouba", "Tabarka", "Fernana", "Bou Salem"], rate: 8, estimatedDays: "2-4 business days" },
  { state: "Le Kef", cities: ["Le Kef", "Nebeur", "Tajerouine", "Kalaat Senan"], rate: 8, estimatedDays: "2-4 business days" },
  { state: "Siliana", cities: ["Siliana", "Kesra", "Makthar", "Bou Arada"], rate: 8, estimatedDays: "2-4 business days" },
  { state: "Kairouan", cities: ["Kairouan", "Haffouz", "Sbikha", "Nasrallah"], rate: 8, estimatedDays: "2-4 business days" },
  { state: "Sfax", cities: ["Sfax", "Agareb", "Mahres", "Skhira"], rate: 8, estimatedDays: "2-4 business days" },
  { state: "Kasserine", cities: ["Kasserine", "Sbeitla", "Feriana", "Thala"], rate: 9, estimatedDays: "3-5 business days" },
  { state: "Sidi Bouzid", cities: ["Sidi Bouzid", "Regueb", "Meknassy", "Jilma"], rate: 9, estimatedDays: "3-5 business days" },
  { state: "Gafsa", cities: ["Gafsa", "Metlaoui", "Redeyef", "Sned"], rate: 9, estimatedDays: "3-5 business days" },
  { state: "Gabes", cities: ["Gabes", "El Hamma", "Ghannouch", "Mareth"], rate: 9, estimatedDays: "3-5 business days" },
  { state: "Medenine", cities: ["Medenine", "Ben Gardane", "Djerba", "Zarzis"], rate: 9, estimatedDays: "3-5 business days" },
  { state: "Tataouine", cities: ["Tataouine", "Ghomrassen", "Remada", "Smar"], rate: 10, estimatedDays: "4-6 business days" },
  { state: "Kebili", cities: ["Kebili", "Douz", "Faouar", "Souk Lahad"], rate: 10, estimatedDays: "4-6 business days" },
  { state: "Tozeur", cities: ["Tozeur", "Nefta", "Hazoua", "Degache"], rate: 10, estimatedDays: "4-6 business days" },
];

function Shipping() {
  const { shippingInfo } = useSelector((state) => state.cart);
  const { settings } = useSelector((state) => state.settings);
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [selectedState, setSelectedState] = useState(shippingInfo.selectedState || "");
  const [selectedCity, setSelectedCity] = useState(shippingInfo.selectedCity || "");
  const [cities, setCities] = useState([]);
  const [address, setAddress] = useState(shippingInfo.address || "");
  const [pincode, setPincode] = useState(shippingInfo.pincode || "");
  const [phoneNumber, setPhoneNumber] = useState(shippingInfo.phoneNumber || "");
  const [fullName, setFullName] = useState(shippingInfo.fullName || user?.name || "");
  const [email, setEmail] = useState(shippingInfo.email || user?.email || "");

  const shippingZones = React.useMemo(() => {
    const mergedZones = new Map();

    fallbackShippingZones.forEach((zone) => {
      mergedZones.set(zone.state, { ...zone });
    });

    (Array.isArray(settings?.shippingZones) ? settings.shippingZones : []).forEach((zone) => {
      if (!zone?.state) return;

      const existingZone = mergedZones.get(zone.state) || {};
      mergedZones.set(zone.state, {
        state: zone.state,
        cities: Array.isArray(zone.cities) && zone.cities.length > 0 ? zone.cities : existingZone.cities || [],
        rate: Number(zone.rate) || existingZone.rate || 0,
        estimatedDays: zone.estimatedDays || existingZone.estimatedDays || "2-4 business days",
      });
    });

    return Array.from(mergedZones.values());
  }, [settings?.shippingZones]);

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

    if (!selectedState || !selectedCity || !address || !pincode || !fullName || (!isAuthenticated && !email)) {
      toast.error(t("cart.fillRequired"), { position: "top-center", autoClose: 3000 });
      return;
    }

    dispatch(saveShippingInfo({ address, pincode, phoneNumber, selectedState, selectedCity, country: "Tunisia", fullName, email }));
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
      <Helmet>
        <title>{`Shipping - ${settings?.storeName || "Store"}`}</title>
        <meta
          name="description"
          content={`Enter your shipping details for ${settings?.storeName || "this store"} and complete your order with a fast delivery confirmation flow.`}
        />
      </Helmet>
      <PageTitle title={t("cart.shippingInfo")} />
      <Navbar />
      <CheckoutPath activePath={0} />

      <div className="shipping-form-container">
        <h1 className="shipping-form-header">{t("cart.shippingDetails")}</h1>
        <form className="shipping-form" onSubmit={shippingInfoSubmit}>
          <div className="shipping-section">
            <div className="shipping-form-group">
              <label htmlFor="fullName">Full name</label>
              <input type="text" required name="fullName" id="fullName" placeholder={t("cart.enterFullName")} value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>

            {!isAuthenticated && (
              <div className="shipping-form-group">
                <label htmlFor="guestEmail">Email</label>
                <input type="email" required name="guestEmail" id="guestEmail" placeholder={t("cart.enterEmail")} value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            )}

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
