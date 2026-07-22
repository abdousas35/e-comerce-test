import React from "react";
import { Helmet } from "react-helmet-async";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageTitle from "../components/PageTitle";
import MetaTags from "../components/MetaTags";
import "../pageStyles/StaticPages.css";

function Contact() {
  const { settings } = useSelector((state) => state.settings);
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{`${t("navbar.contactUs")} - ${settings?.storeName || "Store"}`}</title>
        <meta
          name="description"
          content={`Contact ${settings?.storeName || "our store"} for support, questions, or order assistance using ${settings?.contactEmail || "hello@example.com"}, ${settings?.contactPhone || "+000 000 000"}, or the address ${settings?.address || "provided in the store details"}.`}
        />
      </Helmet>
      <Navbar />
      <PageTitle title={t("navbar.contactUs")} />
      <MetaTags
        title={`${t("navbar.contactUs")} | ${settings?.storeName || "Store"}`}
        description={settings?.contactIntro || settings?.newsletterText || settings?.tagline}
        keywords="contact, support, email, phone"
        image={settings?.heroImage || settings?.logo}
        path="/contact-us"
      />

      <main className="static-page-shell">
        <section className="static-page-card static-page-hero">
          <p className="static-kicker">{t("template.home.contactLabel")}</p>
          <h1>{settings?.contactTitle || t("template.static.getInTouch")}</h1>
          <p>{settings?.contactIntro || settings?.newsletterText}</p>
        </section>

        <section className="static-page-card">
          <div className="static-contact-grid">
            <article>
              <strong>{t("footer.email")}</strong>
              <p>{settings?.contactEmail || "hello@example.com"}</p>
            </article>
            <article>
              <strong>{t("footer.phone")}</strong>
              <p>{settings?.contactPhone || "+000 000 000"}</p>
            </article>
            <article>
              <strong>{t("template.settings.address")}</strong>
              <p>{settings?.address || t("template.static.storeAddress")}</p>
            </article>
          </div>

          <div className="static-contact-note">
            <h2>{t("navbar.contactUs")}</h2>
            <p>{settings?.contactSupportHours || "Support hours: Monday to Saturday, 9:00 AM to 6:00 PM."}</p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Contact;
