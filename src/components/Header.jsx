import React from 'react';
import '../styles/Header.css';

/**
 * Header / Navigation Bar Component
 * Displays application logo, tab navigation, and the theme mode toggle.
 */
export default function Header({ activeTab, setActiveTab, theme, toggleTheme }) {
  return (
    <header className="navbar">
      <div className="nav-container">
        <div className="nav-logo" onClick={() => setActiveTab('store')} style={{ cursor: 'pointer' }}>
          <div className="nav-logo-icon">A</div>
          <span>AURA storefront</span>
        </div>
        <nav>
          <ul className="nav-menu">
            <li className="nav-item">
              <button 
                className={activeTab === 'store' ? 'active' : ''} 
                onClick={() => setActiveTab('store')}
                aria-current={activeTab === 'store' ? 'page' : undefined}
              >
                Store
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={activeTab === 'wishlists' ? 'active' : ''} 
                onClick={() => setActiveTab('wishlists')}
                aria-current={activeTab === 'wishlists' ? 'page' : undefined}
              >
                Wishlists
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={activeTab === 'merge' ? 'active' : ''} 
                onClick={() => setActiveTab('merge')}
                aria-current={activeTab === 'merge' ? 'page' : undefined}
              >
                Merge Center
              </button>
            </li>
            
            {/* Theme Toggle Button */}
            <li className="nav-item">
              <button 
                onClick={toggleTheme} 
                className="theme-toggle-btn"
                aria-label="Toggle light/dark theme"
                title="Toggle light/dark theme"
              >
                {theme === 'light' ? (
                  /* Moon icon for switching to dark mode */
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                  </svg>
                ) : (
                  /* Sun icon for switching to light mode */
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                  </svg>
                )}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
