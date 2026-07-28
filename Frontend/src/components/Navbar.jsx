import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "../componentStyles/Navbar.css";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../pageStyles/Search.css";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { logout, removeSuccess } from "../features/user/userSlice";
import { toast } from "react-toastify";
import { CONFIG } from "../config/config";
import axios from "axios";
import debounce from "lodash/debounce";

const ANNOUNCEMENT_REPEAT_COUNT = 3;
const SEARCH_DEBOUNCE_MS = 350;

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const profileMenuRef = useRef(null);
  const menuRef = useRef(null);
  const navbarRef = useRef(null);
  const searchWrapperRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const { cartItems } = useSelector((state) => state.cart);
  const { settings } = useSelector((state) => state.settings);

  // قراءة التصنيف المحدد حالياً من الـ URL
  const searchParams = new URLSearchParams(location.search);
  const currentCategory = searchParams.get("category") || "";

  const languageCycle = ["en", "ar", "fr"];
  const currentLanguage = i18n.resolvedLanguage || i18n.language || "en";
  const normalizedLanguage = currentLanguage.split("-")[0];
  const currentLanguageIndex = languageCycle.indexOf(normalizedLanguage);
  const nextLanguage = languageCycle[(currentLanguageIndex + 1 + languageCycle.length) % languageCycle.length];
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isHomeRoute = location.pathname === "/";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }

      if (menuRef.current && !menuRef.current.contains(event.target) && !event.target.closest(".navbar-hamburger")) {
        setIsMenuOpen(false);
      }

      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
        setIsSuggestionsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
        setIsMenuOpen(false);
        setIsSuggestionsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    const closeOnDesktop = () => {
      if (window.innerWidth > 900) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", closeOnDesktop);
    return () => window.removeEventListener("resize", closeOnDesktop);
  }, []);

  useEffect(() => {
    const setNavHeight = () => {
      if (navbarRef.current) {
        const height = navbarRef.current.offsetHeight;
        document.documentElement.style.setProperty("--navbar-height", `${height}px`);
      }
    };

    setNavHeight();

    const resizeObserver = new ResizeObserver(setNavHeight);
    if (navbarRef.current) resizeObserver.observe(navbarRef.current);

    window.addEventListener("resize", setNavHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", setNavHeight);
    };
  }, [isAdminRoute, isMenuOpen, isHomeRoute, settings?.announcementEnabled, settings?.announcementText]);

  // Fetch categories once on mount to populate the navbar category select
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get("/api/v1/products/categories");
        setCategories(data.categories || []);
      } catch (err) {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Debounced fetch for the live dropdown preview
  const fetchSuggestions = useMemo(
    () =>
      debounce(async (query) => {
        if (!query) {
          setSuggestions([]);
          setIsSuggestionsLoading(false);
          return;
        }
        try {
          const { data } = await axios.get("/api/v1/products/suggestions", {
            params: { keyword: query },
          });
          setSuggestions(data.products || []);
        } catch (err) {
          setSuggestions([]);
        } finally {
          setIsSuggestionsLoading(false);
        }
      }, SEARCH_DEBOUNCE_MS),
    []
  );

  // Cancel any pending debounced call when the component unmounts
  useEffect(() => {
    return () => fetchSuggestions.cancel();
  }, [fetchSuggestions]);

  const handleSearchChange = useCallback(
    (e) => {
      const value = e.target.value;
      setSearchQuery(value);

      const trimmed = value.trim();
      if (trimmed.length === 0) {
        fetchSuggestions.cancel();
        setSuggestions([]);
        setIsSuggestionsOpen(false);
        setIsSuggestionsLoading(false);
        return;
      }

      setIsSuggestionsOpen(true);
      setIsSuggestionsLoading(true);
      fetchSuggestions(trimmed);
    },
    [fetchSuggestions]
  );

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(nextLanguage);
  };

  const logoutUser = () => {
    dispatch(logout())
      .unwrap()
      .then(() => {
        toast.success(t("navbar.logoutSuccess"), { position: "top-center", autoClose: 3000 });
        dispatch(removeSuccess());
        setIsProfileMenuOpen(false);
      })
      .catch(() => {
        toast.error(t("navbar.logoutFailed"), { position: "top-center", autoClose: 3000 });
      });
  };

  const goTo = (path) => {
    navigate(path);
    closeMenus();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/products?keyword=${encodeURIComponent(query)}`);
      setSearchQuery("");
      setSuggestions([]);
      setIsSuggestionsOpen(false);
      setIsMenuOpen(false);
    }
  };

  const handleSuggestionClick = (product) => {
    navigate(`/product/${product.slug || product._id}`);
    setSearchQuery("");
    setSuggestions([]);
    setIsSuggestionsOpen(false);
  };

  const handleViewAllResults = () => {
    navigate(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
    setSuggestions([]);
    setIsSuggestionsOpen(false);
  };

  // معالجة تغيير التصنيف بسلاسة
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value) {
      navigate(`/products?category=${encodeURIComponent(value)}`);
    } else {
      navigate("/products");
    }
    setIsMenuOpen(false);
  };

  const announcementRepeats = Array.from({ length: ANNOUNCEMENT_REPEAT_COUNT });

  return (
    <nav className="navbar" ref={navbarRef}>
      <div className="navbar-shell">
        <div className="navbar-top-row">
          <div className="navbar-logo">
            <Link className="Navbar-button navbar-brand-link" to="/" onClick={closeMenus}>
              {settings?.logo ? (
                <img
                  src={settings.logo}
                  alt={settings?.storeName || CONFIG.appName}
                  className="navbar-brand-logo"
                />
              ) : null}
              <span>{settings?.storeName || t("navbar.brand")}</span>
            </Link>
          </div>

          <div className="navbar-links desktop-links">
            <ul>
              <li><Link to="/" className="Navbar-button" onClick={closeMenus}>{t("navbar.home")}</Link></li>
              <li><Link to="/products" className="Navbar-button" onClick={closeMenus}>{t("navbar.products")}</Link></li>
              <li><Link to="/about-us" className="Navbar-button" onClick={closeMenus}>{t("navbar.aboutUs")}</Link></li>
              <li><Link to="/contact-us" className="Navbar-button" onClick={closeMenus}>{t("navbar.contactUs")}</Link></li>
              {categories.length > 0 && (
                <li>
                  <select
                    className="navbar-category-select"
                    onChange={handleCategoryChange}
                    value={currentCategory}
                    aria-label={t("navbar.categories")}
                  >
                    <option value="">{t("navbar.allCategories")}</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </li>
              )}
            </ul>
          </div>

          <div className="navbar-icons">
            <button
              type="button"
              className="lang-switch-btn"
              onClick={toggleLanguage}
              aria-label={t("navbar.language")}
              title={t("navbar.language")}
            >
              {nextLanguage.toUpperCase()}
            </button>

            <div className="cart-container">
              <Link to="/cart" onClick={closeMenus}>
                <ShoppingCartIcon className="icon" />
                <span className="cart-badge">{cartItems.length}</span>
              </Link>
            </div>

            {isAuthenticated ? (
              <div className="navbar-profile-menu" ref={profileMenuRef}>
                <button
                  type="button"
                  className="navbar-avatar-btn"
                  aria-label={t("navbar.openProfileMenu")}
                  onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                >
                  <img
                    src={user?.avatar?.url || "/images/profile.png"}
                    alt={user?.name || t("navbar.profileAlt")}
                    className="navbar-profile-avatar"
                  />
                  <span className="navbar-profile-name">{user?.name || t("navbar.myProfile")}</span>
                  <KeyboardArrowDownIcon className={`navbar-profile-caret ${isProfileMenuOpen ? "open" : ""}`} />
                </button>

                <div className={`menu-options ${isProfileMenuOpen ? "show" : ""}`}>
                  {user?.role === "admin" && <button type="button" className="menu-option-btn" onClick={() => goTo("/admin/dashboard")}>{t("navbar.adminDashboard")}</button>}
                  <button type="button" className="menu-option-btn" onClick={() => goTo("/profile")}>{t("navbar.account")}</button>
                  <button type="button" className="menu-option-btn" onClick={() => goTo("/orders/user")}>{t("navbar.orders")}</button>
                  <button type="button" className="menu-option-btn" onClick={() => goTo("/track-order")}>{t("navbar.trackOrder")}</button>
                  <button type="button" className={`menu-option-btn ${cartItems.length > 0 ? "cart-not-empty" : ""}`} onClick={() => goTo("/cart")}>{t("navbar.cart", { count: cartItems.length })}</button>
                  <button type="button" className="menu-option-btn" onClick={logoutUser}>{t("navbar.logout")}</button>
                </div>
              </div>
            ) : (
              <Link to="/register" className="register-link" onClick={closeMenus}>
                <PersonAddIcon className="icon" />
              </Link>
            )}

            <button type="button" className="navbar-hamburger" onClick={() => setIsMenuOpen((prev) => !prev)} aria-label={t("navbar.toggleMenu")}>
              {isMenuOpen ? <CloseIcon className="icon" /> : <MenuIcon className="icon" />}
            </button>
          </div>
        </div>

        {!isAdminRoute && (
          <div className="navbar-search-row" ref={searchWrapperRef}>
            <form className="search-form navbar-search-form" onSubmit={handleSearchSubmit} autoComplete="off">
              <input
                type="text"
                className="search-input"
                placeholder={t("navbar.searchPlaceholder")}
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => {
                  if (searchQuery.trim() && suggestions.length > 0) setIsSuggestionsOpen(true);
                }}
              />
              <button type="submit" className="search-button2" aria-label={t("navbar.search")}>
                <SearchIcon focusable="false" className="search-icon" />
              </button>
            </form>

            {isSuggestionsOpen && (
              <div className="search-suggestions-dropdown">
                {isSuggestionsLoading ? (
                  <div className="search-suggestions-loading">{t("navbar.searching")}</div>
                ) : suggestions.length > 0 ? (
                  <>
                    {suggestions.map((product) => {
                      const finalPrice = Math.max(0, product.price - (product.discount || 0));
                      return (
                        <button
                          type="button"
                          key={product._id}
                          className="search-suggestion-item"
                          onClick={() => handleSuggestionClick(product)}
                        >
                          <img
                            src={product.image?.[0]?.url || product.images?.[0]?.url || "/placeholder.png"}
                            alt={product.name}
                            className="search-suggestion-image"
                          />
                          <div className="search-suggestion-details">
                            <span className="search-suggestion-name">{product.name}</span>
                            <span className="search-suggestion-price">
                              {finalPrice} {t("common.currency", "DZD")}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                    <button type="button" className="search-suggestions-viewall" onClick={handleViewAllResults}>
                      {t("navbar.viewAllResults", { query: searchQuery })}
                    </button>
                  </>
                ) : (
                  <div className="search-suggestions-empty">{t("navbar.noResultsFound")}</div>
                )}
              </div>
            )}
          </div>
        )}

        <div ref={menuRef} className={`navbar-mobile-panel ${isMenuOpen ? "show" : ""}`}>
          <div className="navbar-links mobile-links">
            <ul>
              <li><Link to="/" className="Navbar-button" onClick={closeMenus}>{t("navbar.home")}</Link></li>
              <li><Link to="/products" className="Navbar-button" onClick={closeMenus}>{t("navbar.products")}</Link></li>
              <li><Link to="/about-us" className="Navbar-button" onClick={closeMenus}>{t("navbar.aboutUs")}</Link></li>
              <li><Link to="/contact-us" className="Navbar-button" onClick={closeMenus}>{t("navbar.contactUs")}</Link></li>
              {categories.length > 0 && (
                <li>
                  <select
                    className="navbar-category-select"
                    onChange={handleCategoryChange}
                    value={currentCategory}
                    aria-label={t("navbar.categories")}
                  >
                    <option value="">{t("navbar.allCategories")}</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {isHomeRoute && settings?.announcementEnabled && settings?.announcementText ? (
        <div className="navbar-announcement-bar" aria-label={t("navbar.storeAnnouncement")}>
          <div className="navbar-announcement-track">
            {announcementRepeats.map((_, index) => (
              <div className="navbar-announcement-message" key={`announcement-a-${index}`}>
                <span>{settings.announcementText}</span>
              </div>
            ))}
            {announcementRepeats.map((_, index) => (
              <div className="navbar-announcement-message" key={`announcement-b-${index}`} aria-hidden="true">
                <span>{settings.announcementText}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </nav>
  );
}

export default Navbar;