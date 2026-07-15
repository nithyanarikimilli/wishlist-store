import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import '../styles/WishlistsView.css';

/**
 * WishlistsView Component
 * Renders the multi-wishlist manager dashboard: wishlist creation, selection, deletion,
 * and displaying/removing products from the active wishlist.
 */
export default function WishlistsView({ 
  wishlists, 
  createWishlist, 
  deleteWishlist, 
  removeProductFromWishlist, 
  products,
  onTriggerToast,
  goToStore
}) {
  const [newWishlistName, setNewWishlistName] = useState('');
  const [activeWishlistId, setActiveWishlistId] = useState(null);

  // Set the first wishlist as active by default if none is selected
  useEffect(() => {
    if (wishlists.length > 0 && !activeWishlistId) {
      // If we had no active list, pick the first one
      setActiveWishlistId(wishlists[0].id);
    } else if (wishlists.length === 0) {
      // If all wishlists deleted, clear active
      setActiveWishlistId(null);
    } else if (activeWishlistId && !wishlists.some(w => w.id === activeWishlistId)) {
      // If active wishlist was deleted, fallback to first
      setActiveWishlistId(wishlists[0].id);
    }
  }, [wishlists, activeWishlistId]);

  const handleCreateWishlist = (e) => {
    e.preventDefault();
    const res = createWishlist(newWishlistName);
    if (res.success) {
      onTriggerToast(res.message, 'success');
      setNewWishlistName('');
      if (res.id) {
        setActiveWishlistId(res.id);
      }
    } else {
      onTriggerToast(res.message, 'error');
    }
  };

  const handleDeleteWishlist = (id, name, e) => {
    e.stopPropagation(); // Avoid triggering active list selection
    if (window.confirm(`Are you sure you want to delete the wishlist "${name}"?`)) {
      const res = deleteWishlist(id);
      if (res.success) {
        onTriggerToast(res.message, 'success');
      } else {
        onTriggerToast(res.message, 'error');
      }
    }
  };

  // Get active wishlist object
  const activeWishlist = wishlists.find(w => w.id === activeWishlistId);

  // Resolve product objects for IDs in active wishlist
  const wishlistProducts = activeWishlist 
    ? activeWishlist.productIds
        .map(pid => products.find(p => p.id === pid))
        .filter(Boolean) // Filter out any undefineds if database mismatch
    : [];

  const handleRemoveProduct = (productId, productName) => {
    if (activeWishlistId) {
      const res = removeProductFromWishlist(activeWishlistId, productId);
      if (res.success) {
        onTriggerToast(`Removed "${productName}" from "${activeWishlist.name}".`, 'success');
      } else {
        onTriggerToast(res.message, 'error');
      }
    }
  };

  return (
    <div className="wishlists-view-container">
      {/* Sidebar for Creation & Select list */}
      <aside className="wishlists-sidebar">
        <h2 className="sidebar-title">Manage Wishlists</h2>

        {/* Create Wishlist Form */}
        <form onSubmit={handleCreateWishlist} className="create-wishlist-form">
          <input
            type="text"
            className="create-wishlist-input"
            placeholder="New wishlist name..."
            value={newWishlistName}
            onChange={(e) => setNewWishlistName(e.target.value)}
            maxLength={35}
            aria-label="Wishlist name"
          />
          <button type="submit" className="create-wishlist-btn">
            Create Wishlist
          </button>
        </form>

        {/* List of Wishlists */}
        <div className="wishlist-selection-list" role="listbox" aria-label="Available wishlists">
          {wishlists.map((w) => (
            <div
              key={w.id}
              className={`wishlist-item-row ${w.id === activeWishlistId ? 'active' : ''}`}
            >
              <button
                className="wishlist-info-btn"
                onClick={() => setActiveWishlistId(w.id)}
                aria-label={`Select wishlist ${w.name}`}
                aria-pressed={w.id === activeWishlistId}
              >
                <span className="wishlist-name-txt">{w.name}</span>
                <span className="wishlist-count-txt">
                  {w.productIds.length} {w.productIds.length === 1 ? 'item' : 'items'}
                </span>
              </button>
              <button
                className="wishlist-delete-btn"
                onClick={(e) => handleDeleteWishlist(w.id, w.name, e)}
                title="Delete Wishlist"
                aria-label={`Delete wishlist ${w.name}`}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Main content grid view of active wishlist items */}
      <section className="wishlists-content">
        {activeWishlist ? (
          <>
            <div className="active-wishlist-header">
              <h2 className="active-wishlist-title">{activeWishlist.name}</h2>
            </div>
            
            {wishlistProducts.length > 0 ? (
              <div className="wishlists-product-grid">
                {wishlistProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isWishlistedOverride={true}
                    onWishlistToggleOverride={() => handleRemoveProduct(product.id, product.title)}
                  />
                ))}
              </div>
            ) : (
              <div className="wishlist-empty-state">
                <div className="wishlist-empty-icon">♥</div>
                <h3>This Wishlist is Empty</h3>
                <p>Add products to your "{activeWishlist.name}" wishlist directly from the Store catalog.</p>
                <button className="go-store-btn" onClick={goToStore}>
                  Browse Products
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="wishlist-empty-state">
            <div className="wishlist-empty-icon">📂</div>
            <h3>No Wishlists Found</h3>
            <p>Create a wishlist in the left panel to begin curating your collection.</p>
          </div>
        )}
      </section>
    </div>
  );
}
