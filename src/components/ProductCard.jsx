import React, { useState, useEffect, useRef } from 'react';
import '../styles/ProductCard.css';


/**
 * Product Card Component
 * Displays product details and supports adding/removing from multiple wishlists via an interactive popover menu.
 */
export default function ProductCard({ 
  product, 
  wishlists = [], 
  onWishlistAction, 
  createWishlist,
  onTriggerToast,
  isWishlistedOverride, // optional override (e.g. for wishlist view)
  onWishlistToggleOverride // optional override callback (e.g. for wishlist view)
}) {
  const { id, title, price, description, category, image, rating } = product;
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    setImgLoaded(false);
    setImgError(false);
  }, [id, image]);

  // Check which wishlists contain this product
  const wishlistsContainingProduct = wishlists.filter(w => w.productIds.includes(id));
  const isAnyWishlisted = wishlistsContainingProduct.length > 0;
  
  // Use override if provided, otherwise compute based on active check
  const activeWishlisted = isWishlistedOverride !== undefined ? isWishlistedOverride : isAnyWishlisted;

  // Star ratings helper
  const renderStars = (rate) => {
    const stars = [];
    const fullStars = Math.floor(rate);
    const hasHalfStar = rate % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i}>★</span>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<span key={i}>⯪</span>);
      } else {
        stars.push(<span key={i} style={{ opacity: 0.3 }}>★</span>);
      }
    }
    return stars;
  };

  // Close dropdown if clicking outside of the product card
  useEffect(() => {
    function handleClickOutside(event) {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleDescription = (e) => {
    e.preventDefault();
    setShowFullDesc(!showFullDesc);
  };

  const handleWishlistButtonClick = (e) => {
    e.stopPropagation();
    if (onWishlistToggleOverride) {
      onWishlistToggleOverride();
      return;
    }
    setShowDropdown(!showDropdown);
  };

  const handleItemToggle = (wishlistId, isCurrentlyActive) => {
    if (onWishlistAction) {
      onWishlistAction(wishlistId, id, isCurrentlyActive ? 'remove' : 'add');
    }
  };

  const handleInlineCreate = (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    if (createWishlist && onWishlistAction) {
      const res = createWishlist(newListName);
      if (res.success) {
        onTriggerToast(res.message, 'success');
        // Add product to this newly created list immediately
        onWishlistAction(res.id, id, 'add');
        setNewListName('');
      } else {
        onTriggerToast(res.message, 'error');
      }
    }
  };

  // A description is considered long if it exceeds 95 characters
  const isDescriptionLong = description.length > 95;

  // Determine button text, classes and icons based on state
  const getButtonConfig = () => {
    if (isWishlistedOverride) {
      return {
        text: 'Remove from Wishlist',
        className: 'add-to-wishlist-action-btn remove-state',
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        )
      };
    }

    if (wishlists.length > 0 && wishlistsContainingProduct.length > 0) {
      const allAdded = wishlistsContainingProduct.length === wishlists.length;
      return {
        text: allAdded ? 'Added ✓' : `Added to ${wishlistsContainingProduct.length} Lists ✓`,
        className: 'add-to-wishlist-action-btn added',
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )
      };
    }

    return {
      text: 'Add to Wishlist',
      className: 'add-to-wishlist-action-btn',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      )
    };
  };

  const btnConfig = getButtonConfig();

  return (
    <article className="product-card" ref={cardRef}>
      {/* Product Image and Category Overlay */}
      <div className="product-image-container">
        <span className="product-category">{category}</span>
        <button 
          className={`product-wishlist-btn ${activeWishlisted ? 'active' : ''}`}
          onClick={handleWishlistButtonClick}
          title="Manage Wishlists"
          aria-label="Manage Wishlists"
        >
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill={activeWishlisted ? "currentColor" : "none"} 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button>
        {!imgError ? (
          <>
            <img 
              src={image} 
              alt={title} 
              className={`product-image ${imgLoaded ? 'loaded' : 'loading'}`} 
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              loading="lazy" 
            />
            {!imgLoaded && (
              <div className="product-image-skeleton">
                <div className="skeleton-shine"></div>
              </div>
            )}
          </>
        ) : (
          <div className="product-image-fallback">
            <div className="fallback-gradient-overlay"></div>
            <svg className="fallback-icon" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>
            <span className="fallback-text">Image Unavailable</span>
          </div>
        )}
      </div>

      {/* Details Section */}
      <div className="product-details">
        <h3 className="product-title">{title}</h3>

        <div className="product-meta-row">
          <div className="product-price">${price.toFixed(2)}</div>
          <div className="product-rating" title={`Rating: ${rating.rate} out of 5`}>
            <div className="rating-stars">{renderStars(rating.rate)}</div>
            <span className="rating-score">{rating.rate}</span>
            <span className="rating-count">({rating.count})</span>
          </div>
        </div>

        <p className={`product-description ${showFullDesc ? '' : 'clamp'}`}>
          {description}
        </p>
        
        {isDescriptionLong && (
          <button 
            className="product-desc-toggle" 
            onClick={handleToggleDescription}
            aria-expanded={showFullDesc}
          >
            {showFullDesc ? 'Show Less' : 'Read More'}
          </button>
        )}

        {/* Action Button & Selection Popover */}
        <div className="product-action-section">
          <button 
            className={btnConfig.className}
            onClick={handleWishlistButtonClick}
          >
            {btnConfig.icon}
            {btnConfig.text}
          </button>

          {/* Wishlist Selection Dropdown Popover */}
          {showDropdown && (
            <div className="wishlist-dropdown-popover">
              <div className="wishlist-dropdown-header">
                <span>Select Wishlists</span>
                <button 
                  onClick={() => setShowDropdown(false)} 
                  style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 'bold' }}
                >
                  ✕
                </button>
              </div>

              <div className="wishlist-dropdown-list">
                {wishlists.map((w) => {
                  const isActive = w.productIds.includes(id);
                  return (
                    <button
                      key={w.id}
                      type="button"
                      className={`wishlist-dropdown-item ${isActive ? 'active' : ''}`}
                      onClick={() => handleItemToggle(w.id, isActive)}
                    >
                      <span>{w.name}</span>
                      <div className="wishlist-item-checkbox">✓</div>
                    </button>
                  );
                })}
                {wishlists.length === 0 && (
                  <div style={{ padding: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    No wishlists found.
                  </div>
                )}
              </div>

              <div className="dropdown-divider"></div>

              {/* Inline Create Form inside Popover */}
              <form onSubmit={handleInlineCreate} className="dropdown-create-group">
                <input
                  type="text"
                  className="dropdown-create-input"
                  placeholder="New list name..."
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  maxLength={30}
                  required
                />
                <button type="submit" className="dropdown-create-btn">
                  Add
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
