import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Product from "../components/Product";
import ImageSlider from "../components/ImageSlider";
import PageTitle from "../components/PageTitle";
import MetaTags from "../components/MetaTags";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { getProduct } from "../features/products/productSlice";
import "../pageStyles/Home.css";

function Home() {
  const { loading, error, products } = useSelector((state) => state.product);
  const { settings } = useSelector((state) => state.settings);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const featuredProducts = products.slice(0, 8);

  useEffect(() => {
    dispatch(getProduct({}));
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <Helmet>
        <title>{`${settings?.storeName || "Store"} - ${t("home.pageTitle")}`}</title>
        <meta
          name="description"
          content={`${settings?.storeName || "Store"} offers ${settings?.tagline || "a premium shopping experience"} with featured products, easy browsing, and contact details ${settings?.contactEmail || "hello@example.com"} and ${settings?.contactPhone || "+000 000 000"}.`}
        />
      </Helmet>
      <PageTitle title={t("home.pageTitle")} />
      <MetaTags
        title={settings?.storeName || t("home.pageTitle")}
        description={settings?.heroSubtitle || settings?.tagline}
        keywords="ecommerce, online store, premium storefront, white label template"
        image={settings?.heroImage || settings?.logo}
        path="/"
        schema={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: settings?.storeName,
          email: settings?.contactEmail,
          telephone: settings?.contactPhone,
          address: settings?.address,
          logo: settings?.logo,
          sameAs: Object.values(settings?.socialLinks || {}).filter(Boolean),
        }}
      />
      <ImageSlider />

      <div className="home-container">
        <section className="home-intro-card">
          <p className="home-kicker">{settings?.tagline}</p>
          <h2 className="home-heading">{t("home.trendingNow")}</h2>
          <p className="home-supporting-copy">{settings?.heroSubtitle || settings?.tagline}</p>
        </section>

        <h2 className="home-heading">{t("home.trendingNow")}</h2>
        <div className="home-product-container">
          {loading && <p>{t("home.loadingProducts")}</p>}
          {error && <p>{t("home.failedLoadProducts")}</p>}
          {!loading && products.length === 0 && <p>{t("home.noProductsFound")}</p>}
          {featuredProducts.map((product) => (<Product product={product} key={product._id} />))}
        </div>

        <section className="home-promo-grid">
          <article className="home-promo-card">
            <span>01</span>
            <h3>{t("template.home.brandReadyTitle")}</h3>
            <p>{t("template.home.brandReadyDesc")}</p>
          </article>
          <article className="home-promo-card">
            <span>02</span>
            <h3>{t("template.home.workflowsTitle")}</h3>
            <p>{t("template.home.workflowsDesc")}</p>
          </article>
          <article className="home-promo-card">
            <span>03</span>
            <h3>{t("template.home.deploymentTitle")}</h3>
            <p>{t("template.home.deploymentDesc")}</p>
          </article>
        </section>

        <section className="home-featured-strip">
          <div>
            <span>{t("template.home.premiumLabel")}</span>
            <h3>{t("template.home.premiumTitle")}</h3>
          </div>
          <div className="home-featured-metrics">
            <strong>{t("template.home.metricBranding")}</strong>
            <strong>{t("template.home.metricAdmin")}</strong>
            <strong>{t("template.home.metricHandoff")}</strong>
          </div>
        </section>

        <section className="home-testimonials-grid">
          <article className="home-testimonial-card">
            <p>{t("template.home.testimonialOneQuote")}</p>
            <strong>{t("template.home.testimonialOneAuthor")}</strong>
          </article>
          <article className="home-testimonial-card">
            <p>{t("template.home.testimonialTwoQuote")}</p>
            <strong>{t("template.home.testimonialTwoAuthor")}</strong>
          </article>
          <article className="home-testimonial-card">
            <p>{t("template.home.testimonialThreeQuote")}</p>
            <strong>{t("template.home.testimonialThreeAuthor")}</strong>
          </article>
        </section>

        <section className="home-contact-strip">
          <div>
            <p className="home-kicker">{t("template.home.contactLabel")}</p>
            <h3>{settings?.contactEmail || "hello@example.com"}</h3>
          </div>
          <div className="home-contact-meta">
            <span>{settings?.contactPhone || "+000 000 000"}</span>
            <span>{settings?.address || "Your branded store address"}</span>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}

export default Home;
