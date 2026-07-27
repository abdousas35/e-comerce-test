import React from "react";
import { Helmet } from "react-helmet-async";
import { useSelector } from "react-redux";
import DOMPurify from "dompurify";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageTitle from "../components/PageTitle";
import MetaTags from "../components/MetaTags";
import "../pageStyles/StaticPages.css";

function PrivacyPolicy() {
  const { settings } = useSelector((state) => state.settings);
  const content = settings?.privacyPolicy || "";
  const sanitizedContent = DOMPurify.sanitize(content);

  return (
    <>
      <Helmet>
        <title>{`Privacy Policy - ${settings?.storeName || "Store"}`}</title>
        <meta
          name="description"
          content={`Review how ${settings?.storeName || "this store"} collects, uses, and protects customer information for orders, support, and account management.`}
        />
      </Helmet>
      <Navbar />
      <PageTitle title="Privacy Policy" />
      <MetaTags
        title={`Privacy Policy | ${settings?.storeName || "Store"}`}
        description="Learn how customer information is collected, used, and protected across the store."
        keywords="privacy policy, customer data, ecommerce privacy"
        path="/privacy-policy"
      />

      <main className="static-page-shell">
        <section className="static-page-card static-page-hero">
          <p className="static-kicker">Legal</p>
          <h1>Privacy policy</h1>
          <p>Learn how we handle your information.</p>
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

export default PrivacyPolicy;