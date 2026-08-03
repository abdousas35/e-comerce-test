import React from "react";
import { Helmet } from "react-helmet-async";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageTitle from "../components/PageTitle";
import MetaTags from "../components/MetaTags";
import "../pageStyles/StaticPages.css";

function FAQ() {
  const { settings } = useSelector((state) => state.settings);
  const { t } = useTranslation();
  const faqItems = Array.isArray(settings?.faqItems) && settings.faqItems.length
    ? settings.faqItems
    : [
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

  return (
    <>
      <Helmet>
        <title>{`${t("template.static.faqTitle")} - ${settings?.storeName || "Store"}`}</title>
        <meta
          name="description"
          content={`Find answers to common questions about delivery, returns, support, and shop policies for ${settings?.storeName || "our store"}.`}
        />
      </Helmet>
      <Navbar />
      <PageTitle title={t("template.static.faqTitle")} />
      <MetaTags
        title={`${t("template.static.faqTitle")} | ${settings?.storeName || "Store"}`}
        description={t("template.static.faqDescription")}
        keywords="faq, help, support, shipping, returns"
        path="/faq"
      />

      <main className="static-page-shell">
        <section className="static-page-card static-page-hero">
          <p className="static-kicker">{t("template.static.support")}</p>
          <h1>{t("template.static.faqHeading")}</h1>
          <p>{t("template.static.faqIntro")}</p>
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
