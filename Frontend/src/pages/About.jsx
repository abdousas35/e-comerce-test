import React from "react";
import { Helmet } from "react-helmet-async";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageTitle from "../components/PageTitle";
import MetaTags from "../components/MetaTags";
import "../pageStyles/StaticPages.css";

function About() {
  const { settings } = useSelector((state) => state.settings);
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{`${t("template.static.about")} - ${settings?.storeName || "Store"}`}</title>
        <meta
          name="description"
          content={`${settings?.storeName || "Store"} is built to share ${settings?.aboutTitle || "its story"}, explain its values, and connect customers with support at ${settings?.contactEmail || "hello@example.com"} and ${settings?.contactPhone || "+000 000 000"}.`}
        />
      </Helmet>
      <Navbar />
      <PageTitle title={t("template.static.about")} />
      <MetaTags
        title={`${t("template.static.about")} | ${settings?.storeName || "Store"}`}
        description={settings?.aboutIntro || settings?.footerAbout || settings?.tagline}
        keywords="about us, brand, store"
        image={settings?.heroImage || settings?.logo}
        path="/about-us"
      />

      <main className="static-page-shell">
        <section className="static-page-card static-page-hero">
          <p className="static-kicker">{t("template.static.about")}</p>
          <h1>{settings?.aboutTitle || settings?.storeName || t("template.static.ourStore")}</h1>
          <p>{settings?.aboutIntro || settings?.footerAbout}</p>
        </section>

        <section className="static-page-card static-page-stack">
          <article className="static-page-block">
            <h2>{settings?.storeName || t("template.static.ourStore")}</h2>
            <p>{settings?.aboutBody || settings?.tagline}</p>
          </article>

          <article className="static-page-block static-page-highlight">
            <h3>{t("template.static.getInTouch")}</h3>
            <p>{settings?.contactEmail || "hello@example.com"}</p>
            <p>{settings?.contactPhone || "+000 000 000"}</p>
          </article>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default About;
