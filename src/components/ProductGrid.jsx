import React, { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import '../styles/ProductGrid.css';

/**
 * ProductGrid Component
 * Manages category filters, searches, and maps over products to display ProductCards.
 */
export default function ProductGrid({ 
  products, 
  wishlists = [], 
  onWishlistAction, 
  createWishlist, 
  onTriggerToast 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Derive unique categories from products list
  const categories = useMemo(() => {
    const list = products.map(p => p.category);
    return ['All', ...new Set(list)];
  }, [products]);

  // Filter products based on search term and category selection
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, searchTerm, selectedCategory]);

  return (
    <section className="storefront-container">
      {/* Hero Header */}
      <div className="storefront-hero">
        <h1 className="storefront-title">Curated Premium Tech</h1>
        <p className="storefront-subtitle">
          Explore our handpicked collection of modular devices, tactile accessories, and premium office gear built for creators.
        </p>
      </div>

      {/* Filter and Search Panel */}
      <div className="filter-controls">
        <div className="search-bar-container">
          <svg 
            className="search-icon"
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input 
            type="text" 
            className="search-input"
            placeholder="Search products or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search products"
          />
        </div>

        <div className="category-filters" role="group" aria-label="Filter products by category">
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid Layout */}
      <div className="product-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              wishlists={wishlists}
              onWishlistAction={onWishlistAction}
              createWishlist={createWishlist}
              onTriggerToast={onTriggerToast}
            />
          ))
        ) : (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h4>No Products Found</h4>
            <p>We couldn't find any products matching "{searchTerm}" under the {selectedCategory} category.</p>
          </div>
        )}
      </div>
    </section>
  );
}
