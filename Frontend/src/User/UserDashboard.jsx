import React, { useEffect, useState } from "react";
import "../UserStyles/UserDashboard.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { logout, removeSuccess } from "../features/user/userSlice";
import { toast } from "react-toastify";
import { useSearch } from "../context/SearchContext";

function UserDashboard({ user }) {


    const { cartItems } = useSelector((state) => state.cart)
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isSearchOpen } = useSearch();
    const { t } = useTranslation();
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 450);

    const [menuVisible, setMenuVisible] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsSmallScreen(window.innerWidth < 450);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    function toggleMenu() {
        setMenuVisible(!menuVisible);
    }

    function orders() { navigate("/orders/user"); }
    function trackOrder() { navigate("/track-order"); }
    function profile() { navigate("/profile"); }
    function myCart() { navigate("/cart"); }
    function logoutUser() {
        dispatch(logout())
            .unwrap()
            .then(() => {
                toast.success(t("navbar.logoutSuccess"), { position: "top-center", autoClose: 3000 })
                dispatch(removeSuccess())
            })
            .catch(() => {
                toast.error(t("navbar.logoutFailed"), { position: "top-center", autoClose: 3000 })
            })
    }
    function dashboard() { navigate("/admin/dashboard"); }

    const options = [
        { name: t("navbar.orders"), funcName: orders },
        { name: t("template.tracking.button"), funcName: trackOrder },
        { name: t("navbar.account"), funcName: profile },
        { name: t("user.dashboard.cartCompact", { count: cartItems.length }), funcName: myCart, isCart:true },
        { name: t("navbar.logout"), funcName: logoutUser },
    ];

    if(user.role === "admin"){
        options.unshift({ name: t("navbar.adminDashboard"), funcName: dashboard });
    }


    if (isSearchOpen && isSmallScreen) return null;

    return (
        <>
            <div className={`overlay ${menuVisible ? 'show' : ''}`} onClick={toggleMenu}></div>
            <div className="user-dashboard-container">
                <div className='profile-header' onClick={toggleMenu}>
                    <img src={user?.avatar?.url || "/images/profile.png"} alt={t("user.dashboard.profilePicture")} className='profile-avatar'/>
                    <span className='profile-name'>{user.name || t("user.dashboard.user")}</span>
                </div>

                {menuVisible && (
                    <div className='menu-options'>
                        {options.map(item => (
                            <button className={`menu-option-btn ${item.isCart?(cartItems.length > 0? "cart-not-empty" : "") : "" }`} onClick={item.funcName} key={item.name}>{item.name}</button>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

export default UserDashboard;
