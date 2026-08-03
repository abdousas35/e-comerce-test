import React from "react";
import { Helmet } from "react-helmet-async";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import DOMPurify from "dompurify";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageTitle from "../components/PageTitle";
import MetaTags from "../components/MetaTags";
import "../pageStyles/StaticPages.css";

function TermsAndConditions() {
  const { settings } = useSelector((state) => state.settings);
  const { t } = useTranslation();
  const content = settings?.termsAndConditions || "";
  const sanitizedContent = DOMPurify.sanitize(content);

  return (
    <>
      <Helmet>
        <title>{`Terms and Conditions - ${settings?.storeName || "Store"}`}</title>
        <meta
          name="description"
          content={`Read the terms for orders, payments, returns, and acceptable use when shopping at ${settings?.storeName || "this store"}.`}
        />
      </Helmet>
      <Navbar />
      <PageTitle title={t("template.static.termsTitle")} />
      <MetaTags
        title={`Terms and Conditions | ${settings?.storeName || "Store"}`}
        description="Store terms, order conditions, and usage policies for customers."
        keywords="terms and conditions, ecommerce terms, order conditions"
        path="/terms-and-conditions"
      />

      <main className="static-page-shell">
        <section className="static-page-card static-page-hero">
          <p className="static-kicker">{t("template.static.legal")}</p>
          <h1>{t("template.static.termsTitle")}</h1>
          <p>{t("template.static.termsIntro")}</p>
        </section>

        <section className="static-page-card static-legal-stack">
          <div
            className="static-page-block rich-text-content"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </section>
      </main>

      <Footer />
    </>
  );
}

export default TermsAndConditions;