import React, { useState, useEffect } from 'react';
import './App.css';
import { supabase } from './supabaseClient';
import { loadProductsFromSupabase, saveProductToSupabase, updateQCPhotos, generateProductHash } from './supabaseManager';
import * as XLSX from 'xlsx';

// ============================================================================
// Constants & Data
// ============================================================================

const LANGUAGES = {
  'en': 'English',
  'zh': '简体中文',
  'ja': '日本語',
  'ko': '한국어',
  'es': 'Español',
  'fr': 'Français',
  'de': 'Deutsch',
  'it': 'Italiano',
  'pt': 'Português',
  'ru': 'Русский',
  'ar': 'العربية',
  'hi': 'हिन्दी',
  'th': 'ไทย',
  'vi': 'Tiếng Việt',
  'id': 'Bahasa Indonesia'
};

const CURRENCIES = {
  'USD': { symbol: '$', rate: 1 },
  'EUR': { symbol: '€', rate: 0.92 },
  'GBP': { symbol: '£', rate: 0.79 },
  'JPY': { symbol: '¥', rate: 110.5 },
  'CNY': { symbol: '¥', rate: 7.25 },
  'INR': { symbol: '₹', rate: 83.2 },
  'AED': { symbol: 'د.إ', rate: 3.67 },
  'SGD': { symbol: 'S$', rate: 1.36 },
  'MYR': { symbol: 'RM', rate: 4.7 },
  'THB': { symbol: '฿', rate: 36.5 }
};

const CATEGORIES = [
  'Clothing', 'Shoes', 'Accessories', 'Bags', 'Electronics',
  'Home & Garden', 'Sports', 'Toys & Games', 'Beauty', 'Books'
];

const AGENTS = [
  { id: 'kakobuy', name: 'KakoBuy', icon: '/public/agent-icons/kakobuy.webp' },
  { id: 'mulebuy', name: 'MuleBuy', icon: '/public/agent-icons/mulebuy.webp' },
  { id: 'cssbuy', name: 'CSSBuy', icon: '/public/agent-icons/cssbuy.webp' },
  { id: 'gtbuy', name: 'GTBuy', icon: '/public/agent-icons/gtbuy.webp' },
  { id: 'joyagoo', name: 'JoyaGoo', icon: '/public/agent-icons/joyagoo.webp' }
];

const TRANSLATIONS = {
  'en': {
    admin: 'Admin',
    storefront: 'Storefront',
    products: 'Products',
    bulkImport: 'Bulk Import',
    qcPhotos: 'QC Photos',
    members: 'Members',
    stores: 'Stores',
    affiliate: 'Affiliate',
    dashboard: 'Dashboard',
    addProduct: 'Add Product',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search products...',
    noProducts: 'No products found'
  },
  'zh': {
    admin: '后台',
    storefront: '前台',
    products: '产品',
    bulkImport: '批量导入',
    qcPhotos: 'QC照片',
    members: '成员',
    stores: '商店',
    affiliate: '联盟',
    dashboard: '仪表板',
    addProduct: '添加产品',
    save: '保存',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    search: '搜索产品...',
    noProducts: '未找到产品'
  }
};

// ============================================================================
// Utility Functions
// ============================================================================

const formatPrice = (price, currency = 'USD') => {
  const c = CURRENCIES[currency] || CURRENCIES.USD;
  return `${c.symbol}${(price * c.rate).toFixed(2)}`;
};

const t = (key, lang = 'en') => {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en'][key] || key;
};

// ============================================================================
// Main App Component
// ============================================================================

export default function App() {
  // 检测 URL 路径判断显示哪个页面
  const isAdminPage = window.location.pathname === '/admin';
  const [currentPage, setCurrentPage] = useState(isAdminPage ? 'admin' : 'storefront');
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);
  const [isLocaleOpen, setIsLocaleOpen] = useState(false);
  
  // Admin states
  const [adminTab, setAdminTab] = useState('dashboard');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: CATEGORIES[0],
    images: [],
    weidian_url: '',
    status: 'Live'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState('newest');

  // Load products from Supabase
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const loadedProducts = await loadProductsFromSupabase();
        setProducts(loadedProducts);
      } catch (error) {
        console.error('Failed to load products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // 更新 URL 当页面改变时
  useEffect(() => {
    if (currentPage === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else {
      window.history.pushState({}, '', '/');
    }
  }, [currentPage]);

  // Filter and sort products
  const filterProducts = () => {
    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Sort
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      // Already in order
    }

    return filtered;
  };

  const filteredProducts = filterProducts();

  // Handle product form
  const handleProductFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddProduct = async () => {
    if (!formData.name || !formData.price) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const newProduct = {
        ...formData,
        price: parseFloat(formData.price),
        images: formData.images.filter(img => img),
        qcPhotos: [],
        qcAvailable: false
      };

      const productId = await saveProductToSupabase(newProduct, 'main-shop');
      
      const productWithId = {
        ...newProduct,
        id: productId
      };

      setProducts(prev => [...prev, productWithId]);
      
      setFormData({
        name: '',
        price: '',
        category: CATEGORIES[0],
        images: [],
        weidian_url: '',
        status: 'Live'
      });
      setIsProductModalOpen(false);
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product');
    }
  };

  const handleDeleteProduct = (productId) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      images: product.images || [],
      weidian_url: product.weidian_url || '',
      status: product.status
    });
    setIsProductModalOpen(true);
  };

  const handleQCPhotoUpload = async (productId, photoUrls) => {
    try {
      await updateQCPhotos(productId, photoUrls);
      setProducts(prev => prev.map(p =>
        p.id === productId
          ? { ...p, qcPhotos: photoUrls, qcAvailable: photoUrls.length > 0 }
          : p
      ));
    } catch (error) {
      console.error('Error updating QC photos:', error);
      alert('Failed to update QC photos');
    }
  };

  // ============================================================================
  // Storefront View
  // ============================================================================
  if (currentPage === 'storefront') {
    return (
      <div className="storefront">
        {/* Header */}
        <header className="site-header">
          <div className="wordmark">VS</div>
          <nav className="main-nav">
            <a href="#products">Products</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </nav>
          <div className="header-actions">
            <button
              className="admin-link"
              onClick={() => setCurrentPage('admin')}
            >
              {t('admin', language)}
            </button>
            <button
              className="locale"
              onClick={() => setIsLocaleOpen(!isLocaleOpen)}
            >
              {language.toUpperCase()}
            </button>
          </div>
        </header>

        {/* Locale Panel */}
        {isLocaleOpen && (
          <div className="locale-overlay">
            <div className="locale-panel">
              <button
                className="locale-close"
                onClick={() => setIsLocaleOpen(false)}
              >
                ×
              </button>

              <div className="locale-section">
                <h2>Language</h2>
                <div className="choice-grid">
                  {Object.entries(LANGUAGES).map(([code, name]) => (
                    <button
                      key={code}
                      className={`choice-grid button ${language === code ? 'chosen' : ''}`}
                      onClick={() => setLanguage(code)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="locale-section">
                <h2>Currency</h2>
                <div className="choice-grid">
                  {Object.entries(CURRENCIES).map(([code, data]) => (
                    <button
                      key={code}
                      className={`choice-grid button ${currency === code ? 'chosen' : ''}`}
                      onClick={() => setCurrency(code)}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main id="shop">
          {/* Intro Section */}
          <div className="intro">
            <div>
              <div className="eyebrow">CURATED COLLECTION</div>
              <h1>Discover <em>Premium</em> Products</h1>
              <p className="intro-copy">
                Handpicked items from verified sellers worldwide. Quality guaranteed.
              </p>
            </div>
          </div>

          {/* Toolbar */}
          <div className="toolbar">
            <div className="sort">
              <label>Sort by </label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
            <div className="categories">
              <button
                className={selectedCategory === null ? 'active' : ''}
                onClick={() => setSelectedCategory(null)}
              >
                All
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={selectedCategory === cat ? 'active' : ''}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              Loading products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">{t('noProducts', language)}</div>
          ) : (
            <section className="product-grid">
              {filteredProducts.map((product, index) => (
                <article
                  key={product.id}
                  className="product-card"
                  style={{ '--delay': `${index * 0.05}s` }}
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="product-image">
                    <img
                      src={product.image || 'https://via.placeholder.com/255x300?text=No+Image'}
                      alt={product.name}
                    />
                    {product.tag && (
                      <span className="product-tag">{product.tag}</span>
                    )}
                    {product.qcAvailable && (
                      <span className="qc-badge">QC AVAILABLE</span>
                    )}
                  </div>
                  <div className="product-info">
                    <h2>{product.name}</h2>
                    <p>{product.category}</p>
                    <strong>{formatPrice(product.price, currency)}</strong>
                  </div>
                </article>
              ))}
            </section>
          )}
        </main>

        {/* Footer */}
        <footer>
          <span>VS Store</span>
          <span>© 2024. All rights reserved.</span>
        </footer>

        {/* Product Detail Modal */}
        {selectedProduct && (
          <div
            className="modal-overlay"
            onClick={() => setSelectedProduct(null)}
          >
            <div
              className="product-modal"
              style={{ maxWidth: '900px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-heading">
                <h2>{selectedProduct.name}</h2>
                <button onClick={() => setSelectedProduct(null)}>×</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                {/* Left: Image */}
                <div className="detail-image">
                  <div className="product-image">
                    <img
                      className="zoomable-image"
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                    />
                  </div>
                  {(selectedProduct.images || []).length > 0 && (
                    <div className="detail-thumbnails">
                      {selectedProduct.images.map((img, idx) => (
                        <img key={idx} src={img} alt="" />
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Info */}
                <div className="detail-info">
                  <div className="breadcrumb">{selectedProduct.category}</div>
                  <h1>{selectedProduct.name}</h1>
                  <span className="detail-price">
                    {formatPrice(selectedProduct.price, currency)}
                  </span>

                  {/* Agent Links */}
                  <div className="agent-links">
                    <p>Buy from trusted agents:</p>
                    {AGENTS.map(agent => (
                      <button
                        key={agent.id}
                        className="agent-button"
                        style={{ cursor: 'pointer' }}
                      >
                        <span>Buy on {agent.name}</span>
                        <span style={{ marginLeft: 'auto' }}>→</span>
                      </button>
                    ))}
                  </div>

                  {/* QC Photos */}
                  {selectedProduct.qcPhotos && selectedProduct.qcPhotos.length > 0 && (
                    <div className="qc-section">
                      <div className="qc-heading">
                        <h2>Quality Check</h2>
                        <span>{selectedProduct.qcPhotos.length} photos</span>
                      </div>
                      <div className="qc-gallery">
                        {selectedProduct.qcPhotos.map((photo, idx) => (
                          <img key={idx} src={photo} alt="" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // Admin View
  // ============================================================================
  return (
    <div className="storefront">
      {/* Admin Header */}
      <header className="site-header">
        <div className="wordmark">VS</div>
        <div style={{ marginLeft: 'auto' }}>
          <button
            style={{
              border: 0,
              background: 'none',
              color: '#b46f52',
              font: '11px monospace',
              cursor: 'pointer',
              marginRight: '20px'
            }}
            onClick={() => setCurrentPage('storefront')}
          >
            ← Back to Store
          </button>
        </div>
      </header>

      <main className="admin-page">
        {/* Admin Intro */}
        <section className="admin-intro">
          <div>
            <h1>Product Management</h1>
            <p>Manage your products, inventory, and settings</p>
          </div>
        </section>

        {/* Admin Tabs */}
        <div className="admin-tabs">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'products', label: 'Products' },
            { id: 'bulk', label: 'Bulk Import' },
            { id: 'qc', label: 'QC Photos' },
            { id: 'members', label: 'Members' },
            { id: 'stores', label: 'Stores' }
          ].map(tab => (
            <button
              key={tab.id}
              className={adminTab === tab.id ? 'active' : ''}
              onClick={() => setAdminTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {adminTab === 'dashboard' && (
          <div className="stat-grid">
            <div>
              <span>Total Products</span>
              <strong>{products.length}</strong>
            </div>
            <div>
              <span>Live</span>
              <strong>{products.filter(p => p.status === 'Live').length}</strong>
            </div>
            <div>
              <span>Draft</span>
              <strong>{products.filter(p => p.status === 'Draft').length}</strong>
            </div>
            <div>
              <span>Avg Price</span>
              <strong>
                {products.length > 0
                  ? formatPrice(
                      products.reduce((sum, p) => sum + p.price, 0) / products.length,
                      currency
                    )
                  : formatPrice(0, currency)}
              </strong>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {adminTab === 'products' && (
          <div className="admin-table-wrap">
            <div className="table-heading">
              <h2>Products</h2>
              <div className="table-tools">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  className="primary-action"
                  onClick={() => {
                    setEditingProduct(null);
                    setFormData({
                      name: '',
                      price: '',
                      category: CATEGORIES[0],
                      images: [],
                      weidian_url: '',
                      status: 'Live'
                    });
                    setIsProductModalOpen(true);
                  }}
                >
                  + Add Product
                </button>
              </div>
            </div>

            <div className="admin-table">
              <div className="table-row table-label">
                <span>Product</span>
                <span>Category</span>
                <span>Price</span>
                <span>Status</span>
                <span></span>
              </div>

              {filteredProducts.map(product => (
                <div key={product.id} className="table-row">
                  <div className="admin-product">
                    {product.image && <img src={product.image} alt="" />}
                    <span>{product.name}</span>
                  </div>
                  <span>{product.category}</span>
                  <span>{formatPrice(product.price, currency)}</span>
                  <span>
                    <i className={product.status === 'Live' ? 'live' : 'draft'}>
                      {product.status}
                    </i>
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="edit-button"
                      onClick={() => handleEditProduct(product)}
                    >
                      edit
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bulk Import Tab */}
        {adminTab === 'bulk' && (
          <div className="bulk-import-page">
            <h2>Bulk Import Products</h2>

            <label>
              <strong>Upload CSV or XLSX</strong>
              <input type="file" accept=".csv,.xlsx" />
              <small className="upload-format">
                Format: name, price, category, image_url, weidian_url
              </small>
            </label>

            <label>
              <strong>Or paste JSON</strong>
              <textarea
                placeholder='[{"name": "Product", "price": 10, "category": "...", "image": "...", "weidian_url": "..."}]'
              />
            </label>

            <button className="primary-action">Import Products</button>
          </div>
        )}

        {/* QC Photos Tab */}
        {adminTab === 'qc' && (
          <div className="admin-table-wrap">
            <h2 style={{ marginBottom: '22px' }}>Quality Check Photos</h2>

            <div className="admin-table">
              <div className="table-row table-label">
                <span>Product</span>
                <span>QC Photos</span>
                <span></span>
              </div>

              {products.map(product => (
                <div key={product.id} className="table-row" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
                  <div className="admin-product">
                    {product.image && <img src={product.image} alt="" />}
                    <span>{product.name}</span>
                  </div>
                  <span>{product.qcPhotos?.length || 0} photos</span>
                  <button
                    className="qc-edit-button"
                    onClick={() => {
                      const urls = prompt('Enter comma-separated photo URLs');
                      if (urls) {
                        handleQCPhotoUpload(product.id, urls.split(',').map(u => u.trim()));
                      }
                    }}
                  >
                    upload
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Members Tab */}
        {adminTab === 'members' && (
          <div className="accounts-section">
            <div className="table-heading">
              <h2>Team Members</h2>
              <button className="primary-action">+ Add Member</button>
            </div>

            <div className="account-list">
              <div className="account-row account-label">
                <span>Name / Email</span>
                <span>Role</span>
                <span>Status</span>
                <span></span>
              </div>

              <div className="account-row">
                <div>
                  <b>Main Account</b>
                  <small>owner@store.com</small>
                </div>
                <span>Admin</span>
                <i className="live">Active</i>
                <span></span>
              </div>
            </div>
          </div>
        )}

        {/* Stores Tab */}
        {adminTab === 'stores' && (
          <div className="accounts-section">
            <div className="table-heading">
              <h2>Your Stores</h2>
              <button className="primary-action">+ Create Store</button>
            </div>

            <div className="account-list">
              <div className="account-row account-label">
                <span>Store Name</span>
                <span>Agents</span>
                <span>Products</span>
                <span></span>
              </div>

              <div className="account-row shops-section">
                <b>Main Store</b>
                <span>All</span>
                <span>{products.length}</span>
                <button className="edit-button">edit</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="modal-overlay" onClick={() => setIsProductModalOpen(false)}>
          <div className="product-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-heading">
              <h2>{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setIsProductModalOpen(false)}>×</button>
            </div>

            <label>
              <small>Product Name *</small>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleProductFormChange}
              />
            </label>

            <label>
              <small>Price *</small>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleProductFormChange}
                step="0.01"
              />
            </label>

            <label>
              <small>Category</small>
              <select
                name="category"
                value={formData.category}
                onChange={handleProductFormChange}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </label>

            <label>
              <small>Image URL</small>
              <input
                type="text"
                value={formData.images[0] || ''}
                onChange={(e) => {
                  const newImages = [...formData.images];
                  newImages[0] = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    images: newImages
                  }));
                }}
              />
            </label>

            <label>
              <small>Weidian URL</small>
              <input
                type="text"
                name="weidian_url"
                value={formData.weidian_url}
                onChange={handleProductFormChange}
              />
            </label>

            <label>
              <small>Status</small>
              <select
                name="status"
                value={formData.status}
                onChange={handleProductFormChange}
              >
                <option value="Live">Live</option>
                <option value="Draft">Draft</option>
              </select>
            </label>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                className="primary-action"
                onClick={handleAddProduct}
              >
                {t('save', language)}
              </button>
              <button
                onClick={() => setIsProductModalOpen(false)}
                style={{
                  border: '1px solid #d7d4cd',
                  padding: '14px 18px',
                  background: '#fff',
                  color: '#333',
                  font: '11px monospace',
                  cursor: 'pointer'
                }}
              >
                {t('cancel', language)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
