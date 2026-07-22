import React from "react";
import { Helmet } from "react-helmet-async";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageTitle from "../components/PageTitle";
import MetaTags from "../components/MetaTags";
import "../pageStyles/StaticPages.css";

function PrivacyPolicy() {
  const { settings } = useSelector((state) => state.settings);

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
          <p>This page gives your clients a ready-to-edit privacy policy section they can customize before launch.</p>
        </section>

        <section className="static-page-card static-legal-stack">
          <article className="static-page-block">
            <h2>Information we collect</h2>
            <p>Orders, contact details, shipping information, and activity required to process purchases and improve service quality.</p>
          </article>
          <article className="static-page-block">
            <h2>How we use the information</h2>
            <p>We use customer information to fulfill orders, provide support, send transactional updates, and improve the shopping experience.</p>
          </article>
          <article className="static-page-block">
            <h2>How we protect your data</h2>
            <p>Administrative access is protected, customer sessions are authenticated, and business-critical actions are handled through controlled backend workflows.</p>
          </article>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default PrivacyPolicy;
