import React from "react";
import { Helmet } from "react-helmet-async";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageTitle from "../components/PageTitle";
import MetaTags from "../components/MetaTags";
import "../pageStyles/StaticPages.css";

const faqItems = [
  {
    question: "How long does delivery usually take?",
    answer: "Delivery timelines depend on the shipping destination, but most orders are processed quickly and customers receive updates during fulfillment.",
  },
  {
    question: "Can I return or exchange an item?",
    answer: "Yes. Use this section to explain your return policy clearly, including the return window, item condition requirements, and exchange process.",
  },
  {
    question: "How can I contact support?",
    answer: "Customers can contact your store by email, phone, or the contact page details configured in the admin dashboard.",
  },
];

function FAQ() {
  const { settings } = useSelector((state) => state.settings);

  return (
    <>
      <Helmet>
        <title>{`FAQ - ${settings?.storeName || "Store"}`}</title>
        <meta
          name="description"
          content={`Find answers to common questions about delivery, returns, support, and shop policies for ${settings?.storeName || "our store"}.`}
        />
      </Helmet>
      <Navbar />
      <PageTitle title="FAQ" />
      <MetaTags
        title={`FAQ | ${settings?.storeName || "Store"}`}
        description="Frequently asked questions about orders, shipping, support, and store policies."
        keywords="faq, help, support, shipping, returns"
        path="/faq"
      />

      <main className="static-page-shell">
        <section className="static-page-card static-page-hero">
          <p className="static-kicker">Support</p>
          <h1>Frequently asked questions</h1>
          <p>Use this page to answer the questions customers ask before they place an order.</p>
        </section>

        <section className="static-page-card static-faq-list">
          {faqItems.map((item) => (
            <article key={item.question} className="static-faq-item">
              <h2>{item.question}</h2>
              <p>{item.answer}</p>
            </article>
          ))}
        </section>
      </main>

      <Footer />
    </>
  );
}

export default FAQ;
