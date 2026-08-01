import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Product from "../components/Product";
import ImageSlider from "../components/ImageSlider";
import CategoryShowcase from "../components/CategoryShowcase";
import ProductSectionBlock from "../components/ProductSectionBlock";
import PageTitle from "../components/PageTitle";
import MetaTags from "../components/MetaTags";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { getProduct } from "../features/products/productSlice";
import "../pageStyles/Home.css";

function Home() {
  const { loading, error, products } = useSelector((state) => state.product);
  const { settings } = useSelector((state) => state.settings);
  const [sections, setSections] = useState([]);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const featuredProducts = products.slice(0, 8);

  useEffect(() => {
    dispatch(getProduct({}));
    axios.get('/api/v1/homepage-sections')
      .then(({ data }) => setSections(data.sections))
      .catch(err => console.error("Failed to fetch sections", err));
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
      <CategoryShowcase />
      
      <div className="home-container fade-in">
        {sections.map(section => (
          <ProductSectionBlock key={section._id} section={section} />
        ))}

        <section className="home-intro-card">
          <p className="home-kicker">{settings?.tagline}</p>
          <h2 className="home-heading">{t("home.trendingNow")}</h2>
          <p className="home-supporting-copy">{settings?.heroSubtitle || settings?.tagline}</p>
        </section>

        <div className="home-product-container">
          {loading && <p>{t("home.loadingProducts")}</p>}
          {error && <p>{t("home.failedLoadProducts")}</p>}
          {!loading && products.length === 0 && <p>{t("home.noProductsFound")}</p>}
          {featuredProducts.map((product) => (<Product product={product} key={product._id} />))}
        </div>



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
