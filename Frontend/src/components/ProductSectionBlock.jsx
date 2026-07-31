import React from 'react';
import Product from './Product'; // Assuming ProductCard is Product.jsx
import '../componentStyles/ProductSectionBlock.css';

const ProductSectionBlock = ({ section }) => {
  if (!section.products || section.products.length === 0) return null;

  return (
    <section className="product-section-block">
      <div className="section-heading-frame">
        <h2>{section.name}</h2>
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
