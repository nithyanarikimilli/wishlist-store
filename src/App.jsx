import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ProductGrid from './components/ProductGrid';
import WishlistsView from './components/WishlistsView';
import MergePanel from './components/MergePanel';
import Toast from './components/Toast';
import useWishlists from './hooks/useWishlists';
import productsData from './data/products.json';
import './App.css';

/**
 * Root Application Component
 * Integrates state hooks, theme settings, routing, notifications, and panels.
 */
export default function App() {
  const [activeTab, setActiveTab] = useState('store');
  const [toasts, setToasts] = useState([]);

  // Theme preferences state
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {
      console.error('Failed to load theme preference from localStorage:', e);
    }
    
    // System color scheme preferences fallback
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  // Apply theme to the document HTML element
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.error('Failed to save theme to localStorage:', e);
    }
  }, [theme]);

  // Toggle between dark and light themes
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // Trigger floating alert banner
  const triggerToast = useCallback((message, type = 'info') => {
    const newToast = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      message,
      type
    };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Custom wishlists operations manager hook
  const {
    wishlists,
    createWishlist,
    deleteWishlist,
    addProductToWishlist,
    removeProductFromWishlist,
    mergeWishlists,
  } = useWishlists(triggerToast);

  // Router handler to toggle items in wishlists
  const handleWishlistAction = (wishlistId, productId, action) => {
    if (action === 'add') {
      const res = addProductToWishlist(wishlistId, productId);
      if (res.success) {
        triggerToast(res.message, 'success');
      } else {
        triggerToast(res.message, 'error');
      }
    } else if (action === 'remove') {
      const res = removeProductFromWishlist(wishlistId, productId);
      if (res.success) {
        triggerToast(res.message, 'success');
      } else {
        triggerToast(res.message, 'error');
      }
    }
  };

  // Switch to wishlists page after successfully merging
  const handleMergeSuccess = () => {
    setActiveTab('wishlists');
  };

  // Render main view content depending on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'store':
        return (
          <ProductGrid 
            products={productsData} 
            wishlists={wishlists}
            onWishlistAction={handleWishlistAction}
            createWishlist={createWishlist}
            onTriggerToast={triggerToast}
          />
        );
        
      case 'wishlists':
        return (
          <WishlistsView
            wishlists={wishlists}
            createWishlist={createWishlist}
            deleteWishlist={deleteWishlist}
            removeProductFromWishlist={removeProductFromWishlist}
            products={productsData}
            onTriggerToast={triggerToast}
            goToStore={() => setActiveTab('store')}
          />
        );
        
      case 'merge':
        return (
          <MergePanel
            wishlists={wishlists}
            mergeWishlists={mergeWishlists}
            onTriggerToast={triggerToast}
            onMergeSuccess={handleMergeSuccess}
            goToStore={() => setActiveTab('store')}
            goToWishlists={() => setActiveTab('wishlists')}
          />
        );
        
      default:
        return (
          <ProductGrid 
            products={productsData} 
            wishlists={wishlists}
            onWishlistAction={handleWishlistAction}
            createWishlist={createWishlist}
            onTriggerToast={triggerToast}
          />
        );
    }
  };

  return (
    <div className="app-container">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        theme={theme}
        toggleTheme={toggleTheme}
      />
      
      <main className="main-content">
        {renderContent()}
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Aura Storefront. All rights reserved. Part of technical assessment.</p>
      </footer>

      {/* Floating Notifications Alert Layer */}
      <Toast toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}
