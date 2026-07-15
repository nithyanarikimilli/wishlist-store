# Aura Storefront — Premium Curated Tech Storefront

Aura Storefront is a responsive single-page e-commerce storefront built with **React + Vite**. It features a multi-wishlist curation system, real-time search and category filtering, local storage persistence, responsive styling variables, accessibility visible indicators, and a wishlist merging tool.

This project was built as part of a technical assessment with strict adherence to modularity, performance, and semantic accessibility guidelines.

---

## 🚀 Features

1. **Curated Product Catalog**: Responsive grid displaying premium tech products with consistent `1:1` aspect ratios, titles, prices, categories, and ratings.
2. **Real-time Filter & Search**: Instant filter updates matching keywords or category tags without re-renders or database delays.
3. **Multi-Wishlist Management**: Create, select, view, and delete multiple wishlists from a split-pane dashboard.
4. **Interactive Card Actions**: Add/remove items from multiple wishlists directly from a card popover on the storefront.
5. **Deduplicating Merge Tool**: Merge any two distinct wishlists into a new one. Deduplicates overlapping product IDs, preserves the primary order, and preserves the source wishlists.
6. **Graceful Skeletons & Fallbacks**: Displays shimmering skeleton screens during asset loading, and transitions to branded fallback panels if loading fails.
7. **Premium Light & Dark Modes**: Responsive transitions between dark/light themes, conforming to accessibility contrast guidelines and matching system color preferences.

---

## 🛠️ Tech Stack

- **Framework**: React 19 (Functional Components with Hooks)
- **Scaffolding/Build**: Vite 8
- **Styling**: Vanilla CSS with custom property tokens (no CSS frameworks or preprocessors)
- **Linter**: Oxlint (Clean checks, 0 warnings/errors)
- **Persistence**: Browser LocalStorage API
- **Deployment**: Configured for relative asset resolving, ready for GitHub Pages

---

## 📁 Folder Structure

```text
e-commerce/
├── public/
│   └── favicon.svg      # Favicon
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Header.jsx       # Navigation, logo, and light/dark theme toggle
│   │   ├── ProductCard.jsx  # Catalog details, skeletons, and wishlist popover
│   │   ├── ProductGrid.jsx  # Category lists, search triggers, and grids
│   │   ├── WishlistsView.jsx# Wishlist dashboards, sidebars, and item removals
│   │   ├── MergePanel.jsx   # Select fields, merge rules, and empty states
│   │   └── Toast.jsx        # Notification alert banners
│   ├── data/            # Mock dataset
│   │   └── products.json    # Static database of 10 tech products
│   ├── hooks/           # State logic
│   │   └── useWishlists.js  # Wishlists hook (CRUD and merge algorithms)
│   ├── styles/          # Vanilla CSS files
│   │   ├── variables.css    # Typography, transition, and color variables
│   │   ├── index.css        # Resetting and global transition definitions
│   │   ├── App.css          # Main view containers
│   │   ├── Header.css       # Navbar layout and toggle button
│   │   ├── ProductCard.css  # Cards, dropdowns, and skeleton shines
│   │   ├── ProductGrid.css  # Search box and category buttons
│   │   ├── WishlistsView.css# Dashboards, split panels, and icons
│   │   ├── MergePanel.css   # Select fields and empty state placeholders
│   │   └── Toast.css        # Floating notifications
│   ├── App.jsx          # Router state and main view mappings
│   └── main.jsx         # App entry point
├── index.html
├── package.json
└── vite.config.js
```

---

## ⚙️ Architecture & Logic Design

### 1. Wishlist Merge Algorithm
When list $A$ (Primary) and list $B$ (Secondary) are merged into $C$:
- The algorithm preserves the **exact order** of list $A$ first by cloning its product ID array.
- It iterates through list $B$. For each product ID, it performs a deduplication check (`Array.prototype.includes`). If the ID is not already present, it is appended to the end.
- Complexity: $O(N + M)$ time complexity, where $N$ and $M$ are lengths of the lists.
- The original lists $A$ and $B$ remain completely untouched (non-mutation guarantee).
- The result is saved as a new wishlist with a unique identifier (`crypto.randomUUID()`) and custom name.

### 2. localStorage Persistence Strategy
- All updates to wishlists state are reactively serialized to the `'ecommerce_wishlists'` storage key inside a `useEffect` hook.
- **Fail-safe Reads**: On startup, a validation helper verifies that the parsed storage data is an array of objects matching the schema:
  ```typescript
  interface Wishlist {
    id: string;
    name: string;
    productIds: number[];
    createdAt: string;
  }
  ```
- If schema validation fails or the JSON is corrupted, a `try/catch` catches the error, resets the state to `[]`, and alerts the user via a Toast error notification instead of crashing the application.
- Theme preferences are synchronized to the `'theme'` key. If missing, a media query query (`prefers-color-scheme: dark`) detects and matches the client operating system settings.

### 3. Accessibility Considerations (a11y)
- **Focus States**: High-contrast, custom focus outline offsets (`:focus-visible`) are configured for buttons, selectors, inputs, and cards.
- **Nested Controls Resolved**: Sidebar wishlist list items are flat `div` blocks holding two sibling focusable buttons: a select button and a delete button, preventing invalid nesting of button controls.
- **Vector Control**: Embedded `aria-hidden="true"` inside all SVGs to hide vector vectors from screen readers.
- **Labels**: Interactive inputs and buttons use appropriate `aria-label`, `aria-current`, and `aria-pressed` values.

---

## 🧪 Edge Cases Tested & Handled

- **Empty Merges**: Merging two empty wishlists successfully yields a new empty wishlist and alerts with a success/info toast.
- **Self-Selection**: Selection dropdowns disable picking the primary wishlist in the secondary selector.
- **Invalid Names**: Restricts names via regex `/^[a-zA-Z0-9\s-_]+$/` (letters, numbers, spaces, hyphens, and underscores) and caps lengths at 30 characters.
- **Refreshes & Offline Errors**: Retains data and loading states. Images display loading skeletons or load a clean, local vector-backed fallback overlay on error.

---

## 📥 Installation & Local Development

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### 1. Install Dependencies
Run the install command inside the root directory:
```bash
npm install
```

### 2. Run Locally (Development)
Spin up the Vite development server:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Verify Code Quality (Lint)
Run linter checks:
```bash
npm run lint
```

### 4. Build for Production
Compile optimized assets:
```bash
npm run build
```
Production assets are generated inside the `dist/` directory.

---

## 🚀 GitHub Pages Deployment Steps

Vite is pre-configured with relative bundle paths (`base: './'`) inside `vite.config.js`. This allows you to host the project at any subpath without breaking asset loads.

### Step-by-Step Deploy Guide
1. Build the production files:
   ```bash
   npm run build
   ```
2. Initialize git and commit files:
   ```bash
   git init
   git add .
   git commit -m "Initial storefront release"
   ```
3. Create a repository on GitHub, link it, and push your branch:
   ```bash
   git remote add origin https://github.com/username/repository-name.git
   git push -u origin main
   ```
4. Install `gh-pages` helper utility:
   ```bash
   npm install --save-dev gh-pages
   ```
5. Add deployment scripts to `package.json`:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
6. Deploy the project:
   ```bash
   npm run deploy
   ```
The site will be live at `https://username.github.io/repository-name/`.
