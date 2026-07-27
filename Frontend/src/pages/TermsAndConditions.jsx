import React from "react";
import { Helmet } from "react-helmet-async";
import { useSelector } from "react-redux";
import DOMPurify from "dompurify";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageTitle from "../components/PageTitle";
import MetaTags from "../components/MetaTags";
import "../pageStyles/StaticPages.css";

function TermsAndConditions() {
  const { settings } = useSelector((state) => state.settings);
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
      <PageTitle title="Terms and Conditions" />
      <MetaTags
        title={`Terms and Conditions | ${settings?.storeName || "Store"}`}
        description="Store terms, order conditions, and usage policies for customers."
        keywords="terms and conditions, ecommerce terms, order conditions"
        path="/terms-and-conditions"
      />

      <main className="static-page-shell">
        <section className="static-page-card static-page-hero">
          <p className="static-kicker">Legal</p>
          <h1>Terms and conditions</h1>
          <p>Please read these terms carefully before using our store.</p>
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