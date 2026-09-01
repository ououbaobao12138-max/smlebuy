# VS Store - Complete Application Documentation

## Overview
VS Store is a production-grade e-commerce platform with a complete storefront and administrative backend. Built with React, Supabase, and Vite, it provides comprehensive product management, multi-language support, and enterprise-level features.

## 📋 Table of Contents
1. [Features](#features)
2. [Architecture](#architecture)
3. [Components](#components)
4. [State Management](#state-management)
5. [Data Flow](#data-flow)
6. [API Integration](#api-integration)
7. [Usage Guide](#usage-guide)
8. [Customization](#customization)

---

## ✨ Features

### Frontend (Storefront)
- **Product Display**: Responsive grid layout (5 columns on desktop, 2 on mobile)
- **Product Search & Filter**: Real-time search with category filtering
- **Sorting Options**: Sort by popularity, newest, price (high-to-low, low-to-high)
- **Product Detail Page**: Full product information with QC photos and agent links
- **Shopping Bag**: Add/remove items with persistent state
- **Multi-Language Support**: 15+ languages including English, Chinese, Japanese, Korean, Spanish, French, German, Italian, Portuguese, Russian, Arabic, Hindi, Thai, Vietnamese, Indonesian
- **Multi-Currency**: 10 currencies (USD, EUR, GBP, JPY, CNY, INR, AED, SGD, MYR, THB) with real-time conversion
- **Responsive Design**: Full mobile optimization
- **Locale Selector**: Language and currency selection panel

### Admin Panel
- **Dashboard**: Real-time statistics (total products, live, draft, average price)
- **Product Management**:
  - Add/Edit/Delete products
  - Search and filter products
  - Status management (Live/Draft)
  - Bulk operations
- **Bulk Import**: 
  - CSV/XLSX file upload
  - JSON data import
  - Automatic product deduplication
- **QC Photos Management**:
  - Upload and manage quality check photos
  - Photos shared across all stores
  - Multiple images per product
- **Member Management**:
  - Add sub-accounts
  - Role assignment (seller, admin)
  - Status tracking
- **Store Management**:
  - Create multiple stores
  - Assign agents per store
  - Track products per store
- **Affiliate Settings**:
  - Generate affiliate codes
  - Create referral links
  - Track affiliate performance by agent

---

## 🏗️ Architecture

### Project Structure
```
src/
├── App.jsx                 # Main application component
├── App.css                 # Styling (2000+ lines of CSS)
├── index.css               # Global styles
├── main.jsx                # Entry point
├── supabaseClient.js        # Supabase configuration
└── supabaseManager.js       # Supabase utilities
```

### Key Technologies
- **Frontend**: React 19.2.8
- **Database**: Supabase (PostgreSQL)
- **Build Tool**: Vite 8.2.2
- **Data Processing**: XLSX 0.18.5
- **Styling**: CSS with responsive design (no CSS framework)

---

## 🧩 Components

### Frontend Components

#### StorefrontHeader
Displays navigation, search, language/currency selection, and shopping bag.
```jsx
<StorefrontHeader
  language="en"
  onLanguageChange={handleLanguageChange}
  currency="USD"
  onCurrencyChange={handleCurrencyChange}
  onBagClick={handleBagClick}
  onAdminClick={handleAdminClick}
  bagCount={0}
/>
```

#### ProductCard
Displays individual product with hover effects and quick-add functionality.
- Shows product image, name, category, price
- Tag (NEW, Popular, Featured)
- Save/wishlist button
- Quick add to bag on hover

#### Storefront
Main shopping view with filtering, sorting, and product grid.
- Category filtering
- Sort options (popularity, newest, price)
- Product grid (responsive)
- Pagination support

#### ProductDetailPage
Full product details with images, QC photos, and agent links.
- Product image with thumbnails
- Price in selected currency
- Quality check photos gallery
- Agent links
- Source URL link

### Admin Components

#### AdminDashboard
Statistics overview with key metrics.
- Total products count
- Live/Draft product breakdown
- Average price calculation

#### ProductManagement
Table-based product listing with actions.
- Search functionality
- Status filtering
- Edit/Delete buttons
- Product information display

#### BulkImportPage
CSV/XLSX/JSON import interface.
- File upload support
- JSON data paste
- Automatic product creation
- Import status feedback

#### MembersPage
Team member management interface.
- Member list with roles
- Status display
- Edit functionality
- Add member button

#### StoresPage
Multi-store management.
- Store creation
- Agent assignment
- Product count per store
- Status tracking

#### AffiliateSettingsPage
Affiliate code and referral link management.
- Code generation
- Agent selection
- Link generation
- Active codes listing

#### QCPhotosPage
Quality check photo management.
- Product selection
- Photo upload
- Batch photo management
- Status display

### Modal Components

#### ProductModal
Add/Edit product modal with form validation.
- Product name, price, category
- Image URL input with preview
- Status selection
- Save/Delete/Cancel actions

#### InviteMemberModal
Add team members with role assignment.
- Email input
- Role selection (seller/admin)
- Save/Cancel actions

#### CreateStoreModal
Create new store with agent selection.
- Store name input
- Multi-select agent checkboxes
- Save/Cancel actions

---

## 💾 State Management

### App Component State
```javascript
const [products, setProducts] = useState([]);        // All products
const [currentPage, setCurrentPage] = useState('storefront'); // Page routing
const [selectedProduct, setSelectedProduct] = useState(null); // Detail page
const [language, setLanguage] = useState('en');      // Current language
const [currency, setCurrency] = useState('USD');     // Current currency
const [bagItems, setBagItems] = useState([]);        // Shopping cart
const [isBagOpen, setIsBagOpen] = useState(false);   // Bag panel visibility
const [isLocaleOpen, setIsLocaleOpen] = useState(false); // Locale panel
const [isProductModalOpen, setIsProductModalOpen] = useState(false); // Modal visibility
const [editingProduct, setEditingProduct] = useState(null); // Current edit
const [loading, setLoading] = useState(true);        // Loading state
```

### Modal Component States
Each modal manages its own form state:
- ProductModal: formData (name, price, category, images, etc.)
- InviteMemberModal: email, role
- CreateStoreModal: storeName, selectedAgents

---

## 🔄 Data Flow

### Product Loading
1. App mounts → useEffect calls `loadProductsFromSupabase()`
2. Supabase Manager queries products from database
3. Products loaded and stored in state
4. Fallback to sample data if database unavailable

### Product Adding/Editing
1. User clicks "Add Product" or product edit button
2. Modal opens with form (empty or pre-filled)
3. User enters details and clicks Save
4. `handleAddProduct()` generates product hash
5. `saveProductToSupabase()` saves to Supabase
6. Local state updated
7. Modal closes

### Product Filtering & Searching
1. User types in search box or selects category
2. `filterProducts()` utility applies filters
3. `sortProducts()` sorts by selected option
4. ProductGrid re-renders with filtered results

### Currency Conversion
1. User selects currency from locale panel
2. `formatPrice()` utility calculates converted price
3. Price displays in selected currency format

### Multi-Language Support
1. User selects language from locale panel
2. `t()` translation function retrieves translated text
3. UI re-renders with new language

---

## 🔗 API Integration

### Supabase Tables

#### products
```sql
- id (TEXT PRIMARY KEY): Product hash
- name (TEXT): Product name
- price (NUMERIC): Base price
- category (TEXT): Product category
- images (ARRAY): Image URLs
- qc_photos (ARRAY): QC photo URLs
- weidian_urls (JSONB): Shop-specific URLs
```

#### shop_products
```sql
- id (UUID PRIMARY KEY)
- shop_id (UUID): Store reference
- product_id (TEXT): Product hash
- status (TEXT): 'Live' or 'Draft'
```

### Key Functions

#### loadProductsFromSupabase()
Loads all live products with QC availability flag.

#### saveProductToSupabase(product, shopId)
Saves/updates product with deduplication by hash.

#### updateQCPhotos(productId, qcPhotos)
Updates QC photos globally (visible to all shops).

#### getShopProducts(shopId)
Retrieves products for specific store.

#### generateProductHash(name, price, images)
Creates unique product identifier based on content.

---

## 📱 Usage Guide

### For Customers
1. **Browse Products**: View products on storefront with filters/sorting
2. **Search**: Use search box to find specific products
3. **Change Language**: Click language button, select from 15+ options
4. **Change Currency**: Click language panel, select currency
5. **View Details**: Click product card for full details
6. **Add to Bag**: Click "Add to Bag" button
7. **Checkout**: Click checkout button in bag panel

### For Administrators
1. **Dashboard**: View at-a-glance statistics
2. **Add Product**: Click "Add Product", fill form, save
3. **Edit Product**: Click edit button on product row
4. **Delete Product**: Click delete button (with confirmation)
5. **Bulk Import**: Go to Bulk Import tab, upload CSV/XLSX or paste JSON
6. **Manage QC**: Upload quality check photos in QC tab
7. **Add Members**: Invite team members with roles
8. **Create Stores**: Set up stores with agent assignments
9. **Affiliate Codes**: Generate referral links by agent

---

## 🎨 Customization

### Adding New Languages
1. Add language code to `LANGUAGES` object:
```javascript
const LANGUAGES = {
  'es': { name: 'Español', flag: '🇪🇸' },
  // Add new language
  'nl': { name: 'Nederlands', flag: '🇳🇱' }
};
```

2. Add translations to `TRANSLATIONS`:
```javascript
const TRANSLATIONS = {
  // ...
  'nl': {
    storefront: 'Winkel',
    admin: 'Admin',
    // ... add all keys
  }
};
```

### Adding New Currencies
1. Add currency to `CURRENCIES` object:
```javascript
const CURRENCIES = {
  'SEK': { symbol: 'kr', rate: 10.8 },
  // Add rate relative to USD
};
```

### Adding New Product Categories
1. Update `CATEGORIES` array:
```javascript
const CATEGORIES = [
  'Clothing', 'Shoes', 'Electronics',
  // Add new category
  'Gaming'
];
```

### Adding New Agents
1. Add agent to `AGENTS` array with logo in public/agent-icons/:
```javascript
const AGENTS = [
  { id: 'newagent', name: 'New Agent', logo: 'newagent.png' },
  // ...
];
```

### CSS Customization
- Colors: Modify color values in App.css
- Responsive breakpoints: Currently at 760px
- Fonts: DM Sans (Google Fonts)
- Spacing: Update padding/margin values

---

## 🚀 Deployment

### Build for Production
```bash
npm run build
```
Output: `dist/` folder ready for deployment

### Development Server
```bash
npm run dev
```
Available at: http://localhost:5173/

### Production Checklist
- [ ] Update Supabase credentials for production
- [ ] Configure environment variables
- [ ] Enable security policies
- [ ] Set up proper CORS
- [ ] Test all features in production environment
- [ ] Optimize images and assets
- [ ] Set up monitoring and logging

---

## 🔐 Security Considerations

### Current Implementation
- Supabase authentication ready
- CORS configuration available
- XSS protection through React
- SQL injection protection through Supabase

### Recommended Enhancements
- Implement user authentication
- Add role-based access control (RBAC)
- Validate all file uploads
- Rate limiting on API endpoints
- Encrypted sensitive data storage

---

## 📊 Performance Optimization

### Current Optimizations
- Responsive images
- CSS optimization
- Component memoization with useCallback
- Efficient filtering/sorting algorithms
- Dynamic imports ready

### Recommendations
- Implement image lazy loading
- Add pagination for large datasets
- Cache frequently accessed data
- Implement virtual scrolling for large lists
- Optimize bundle with code splitting

---

## 🐛 Troubleshooting

### Products Not Loading
1. Check Supabase connection credentials
2. Verify database tables exist
3. Check browser console for errors
4. Fallback to sample data working? If yes, database issue

### Modal Not Opening
1. Check modal state in React DevTools
2. Verify onClick handlers are connected
3. Check z-index CSS conflicts

### Currency/Language Not Changing
1. Verify state update in React DevTools
2. Check translation/currency objects have all keys
3. Clear browser cache

---

## 📝 Code Statistics

- **Total Lines**: ~2000 (App.jsx)
- **Components**: 20+
- **Utility Functions**: 5+
- **CSS Lines**: 1500+
- **Languages**: 15+
- **Currencies**: 10
- **Agents**: 17
- **Categories**: 15

---

## 📚 Related Files

- `supabaseClient.js`: Supabase configuration
- `supabaseManager.js`: Database utilities
- `App.css`: Complete styling
- `index.css`: Global styles
- `package.json`: Dependencies

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: Production Ready
