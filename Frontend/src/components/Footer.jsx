import React from "react";
import { Phone, Mail, Instagram, Facebook, MusicNote, X } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import "../componentStyles/Footer.css";

function Footer() {
  const { t } = useTranslation();
  const { settings } = useSelector((state) => state.settings);
  const year = new Date().getFullYear();
  const socialItems = [
    { key: "instagram", href: settings?.socialLinks?.instagram, icon: <Instagram className="social-icon" /> },
    { key: "facebook", href: settings?.socialLinks?.facebook, icon: <Facebook className="social-icon" /> },
    { key: "tiktok", href: settings?.socialLinks?.tiktok, icon: <MusicNote className="social-icon" /> },
    { key: "x", href: settings?.socialLinks?.x, icon: <X className="social-icon" /> },
  ].filter((item) => item.href);

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section contact">
          <h3>{t("footer.contactUs")}</h3>
          <p><Phone fontSize="small" />{t("footer.phone")} : {settings?.contactPhone}</p>
          <p><Mail fontSize="small" />{t("footer.email")} : {settings?.contactEmail}</p>
          {settings?.address ? <p>{settings.address}</p> : null}
        </div>

        <div className="footer-section social">
          <h3>{t("footer.followMe")}</h3>
          <div className="social-links">
            {socialItems.length > 0 ? socialItems.map((item) => (
              <a href={item.href} target="_blank" rel="noreferrer" key={item.key}>
                {item.icon}
              </a>
            )) : <p>{settings?.storeName}</p>}
          </div>
        </div>

        <div className="footer-section about">
          <h3>{t("footer.aboutUs")}</h3>
          <p>{settings?.footerAbout || t("footer.sellingProducts")}</p>
        </div>

        <div className="footer-section footer-links-section">
          <h3>Quick Links</h3>
          <div className="footer-quick-links">
            <Link to="/about-us">{t("navbar.aboutUs")}</Link>
            <Link to="/contact-us">{t("navbar.contactUs")}</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-and-conditions">Terms & Conditions</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {settings?.storeName || t("footer.copyright", { year })} {year}</p>
      </div>
    </footer>
  );
}

export default Footer;
