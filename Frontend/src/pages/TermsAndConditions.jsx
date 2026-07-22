import React from "react";
import { Helmet } from "react-helmet-async";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageTitle from "../components/PageTitle";
import MetaTags from "../components/MetaTags";
import "../pageStyles/StaticPages.css";

function TermsAndConditions() {
  const { settings } = useSelector((state) => state.settings);

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
          <p>Use this page as the launch-ready policy base for payments, orders, refunds, and acceptable site usage.</p>
        </section>

        <section className="static-page-card static-legal-stack">
          <article className="static-page-block">
            <h2>Orders and payments</h2>
            <p>Customers are responsible for providing accurate billing and shipping details. Orders are processed after successful review and confirmation.</p>
          </article>
          <article className="static-page-block">
            <h2>Returns and refunds</h2>
            <p>Refund and return terms should be updated to match the client policy, including timelines, exclusions, and item condition rules.</p>
          </article>
          <article className="static-page-block">
            <h2>Store usage</h2>
            <p>Visitors agree to use the site lawfully and not misuse storefront features, customer accounts, or protected content.</p>
          </article>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default TermsAndConditions;
