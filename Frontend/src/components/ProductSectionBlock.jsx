import React from 'react';
import Product from './Product';
import '../componentStyles/ProductSectionBlock.css';
// Importing Home.css for shared styling. In a larger refactor,
// common styles like .home-intro-card might be moved to a global stylesheet.
import '../pageStyles/Home.css';

const ProductSectionBlock = ({ section }) => {
  if (!section.products || section.products.length === 0) return null;

  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <section className="product-section-block">
      <div className="home-intro-card">
        <p className="home-kicker"></p> {/* Placeholder for consistent design */}
        <h2 className="home-heading">{capitalizeFirstLetter(section.name)}</h2>
        <p className="home-supporting-copy"></p> {/* Placeholder for consistent design */}
      </div>
      <div className="section-products-grid">
        {section.products.map(product => (
          <Product key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default ProductSectionBlock;
