import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import "../componentStyles/MobileMenu.css";

function MobileMenu({
  isOpen,
  onClose,
  menuRef,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  categories,
  currentCategory,
  onCategoryChange,
  isAuthenticated,
  user,
  onLogout,
  onNavigate,
  settings,
  t,
}) {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;

    const originalOverflow = document.body.style.overflow;
    const originalHeight = document.body.style.height;

    document.body.style.overflow = "hidden";
    document.body.style.height = "100%";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.height = originalHeight;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNavigate = (path) => {
    onNavigate(path);
    onClose();
  };

  return (
    <div className="mobile-menu-overlay" role="dialog" aria-modal="true" aria-label={t("navbar.toggleMenu") || "Mobile menu"}>
      <div ref={menuRef} className="mobile-menu-panel">
        <div className="mobile-menu-header">
          <button type="button" className="mobile-menu-close" onClick={onClose} aria-label={t("navbar.close") || "Close"}>
            <CloseIcon />
          </button>
        </div>

        <div className="mobile-menu-brand">
          {settings?.logo ? (
            <img src={settings.logo} alt={settings?.storeName || "Store"} className="mobile-menu-logo" />
          ) : (
            <div className="mobile-menu-logo-fallback">{settings?.storeName || "Store"}</div>
          )}
        </div>

        <form className="mobile-search-bar" onSubmit={(e) => {
          onSearchSubmit(e);
          onClose();
        }}>
          <input
            type="text"
            value={searchQuery}
            onChange={onSearchChange}
            placeholder={t("navbar.searchPlaceholder") || "Search products"}
            aria-label={t("navbar.search") || "Search"}
          />
          <button type="submit" className="mobile-search-btn" aria-label={t("navbar.search") || "Search"}>
            <SearchIcon />
          </button>
        </form>

        <nav className="mobile-nav-links">
          <Link to="/" className="mobile-nav-link" onClick={() => handleNavigate("/")}>
            {t("navbar.home") || "Home"}
          </Link>

          <Link to="/products" className="mobile-nav-link" onClick={() => handleNavigate("/products")}>
            {t("navbar.products") || "Products"}
          </Link>

          <Link to="/about-us" className="mobile-nav-link" onClick={() => handleNavigate("/about-us")}>
            {t("navbar.aboutUs") || "About us"}
          </Link>

          <Link to="/contact-us" className="mobile-nav-link" onClick={() => handleNavigate("/contact-us")}>
            {t("navbar.contactUs") || "Contact us"}
          </Link>

          {categories?.length > 0 ? (
            <div className="mobile-nav-dropdown">
              <button type="button" className="mobile-nav-link mobile-dropdown-toggle" onClick={() => setIsCategoriesOpen((prev) => !prev)}>
                <span>{t("navbar.categories") || "Categories"}</span>
                {isCategoriesOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </button>

              {isCategoriesOpen ? (
                <div className="mobile-dropdown-content">
                  <button
                    type="button"
                    className={`mobile-dropdown-item ${!currentCategory ? "active" : ""}`}
                    onClick={() => {
                      onCategoryChange({ target: { value: "" } });
                      onClose();
                    }}
                  >
                    {t("navbar.allCategories") || "All categories"}
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`mobile-dropdown-item ${currentCategory === cat ? "active" : ""}`}
                      onClick={() => {
                        onCategoryChange({ target: { value: cat } });
                        onClose();
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </nav>

        <div className="mobile-menu-account">
          {isAuthenticated ? (
            <>
              <button type="button" className="mobile-account-btn" onClick={() => handleNavigate("/profile")}>
                <PersonIcon />
                <span>{user?.name || t("navbar.myProfile") || "My profile"}</span>
              </button>
              <button type="button" className="mobile-account-btn mobile-account-logout" onClick={() => {
                onLogout();
                onClose();
              }}>
                <span>{t("navbar.logout") || "Logout"}</span>
              </button>
            </>
          ) : (
            <button type="button" className="mobile-account-btn" onClick={() => handleNavigate("/register")}>
              <PersonIcon />
              <span>{t("navbar.register") || "Register"}</span>
            </button>
          )}
        </div>

        <div className="mobile-menu-social">
          {settings?.socialLinks?.facebook ? (
            <a href={settings.socialLinks.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
              <FacebookIcon />
            </a>
          ) : null}
          {settings?.socialLinks?.instagram ? (
            <a href={settings.socialLinks.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
              <InstagramIcon />
            </a>
          ) : null}
          {settings?.socialLinks?.tiktok ? (
            <a href={settings.socialLinks.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok">
              <MusicNoteIcon />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default MobileMenu;
