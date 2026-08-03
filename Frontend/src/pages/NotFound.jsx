import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageTitle from "../components/PageTitle";
import MetaTags from "../components/MetaTags";
import "../pageStyles/StaticPages.css";

function NotFound() {
  const { settings } = useSelector((state) => state.settings);
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{`404 - ${settings?.storeName || "Store"}`}</title>
        <meta
          name="description"
          content={`The requested page could not be found. Return to the homepage or browse the catalog at ${settings?.storeName || "this store"}.`}
        />
      </Helmet>
      <Navbar />
      <PageTitle title={t("template.static.pageNotFound")} />
      <MetaTags
        title={`404 | ${settings?.storeName || "Store"}`}
        description="The page you are looking for could not be found."
        keywords="404, page not found"
        robots="noindex, follow"
      />

      <main className="static-page-shell">
        <section className="static-page-card static-not-found">
          <p className="static-kicker">404</p>
          <h1>{t("template.static.notFoundTitle")}</h1>
          <p>{t("template.static.notFoundMessage")}</p>
          <div className="static-actions">
            <Link to="/" className="static-action-btn">{t("template.static.backToHome")}</Link>
            <Link to="/products" className="static-action-btn secondary">{t("template.static.browseProducts")}</Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default NotFound;
