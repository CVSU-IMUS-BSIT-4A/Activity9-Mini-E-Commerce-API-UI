import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsApi, Product, cartApi, ordersApi } from '../api/api';
import { useCart } from '../contexts/CartContext';
import { useSearch } from '../contexts/SearchContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useUserAuth } from '../contexts/UserAuthContext';
import Modal from '../components/Modal';
import UserAuth from './UserAuth';
import PromoCarousel from '../components/PromoCarousel';
import './Products.css';

const Products = () => {
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const { searchQuery } = useSearch();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { isAuthenticated } = useUserAuth();
  const [showUserAuth, setShowUserAuth] = useState(false);
  const [showBuyNowModal, setShowBuyNowModal] = useState(false);
  const [buyNowProduct, setBuyNowProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sortBy, setSortBy] = useState<string>('default');
  
  // Filter states
  const [componentType, setComponentType] = useState<string>('Component Type');
  const [priceRange, setPriceRange] = useState<string>('Price');
  const [review, setReview] = useState<string>('Review');
  const [color, setColor] = useState<string>('Color');
  const [material, setMaterial] = useState<string>('Material');
  const [offer, setOffer] = useState<string>('Offer');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsApi.getAll();
      setProducts(response.data);
      setFilteredProducts(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error loading products:', err);
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError('Cannot connect to server. Please make sure the backend server is running on http://localhost:3001');
      } else if (err.response?.status === 404) {
        setError('Products endpoint not found. Please check the backend server.');
      } else {
        setError(err.response?.data?.message || 'Failed to load products. Please check if the backend server is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getProductCategory = (name: string): string => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('motherboard') || lowerName.includes('b550') || lowerName.includes('z690') || lowerName.includes('b450') || lowerName.includes('x570') || lowerName.includes('b660')) return 'Motherboard';
    if (lowerName.includes('ryzen') || lowerName.includes('core i') || lowerName.includes('cpu') || lowerName.includes('processor')) return 'CPU';
    if (lowerName.includes('ddr') || lowerName.includes('ram') || lowerName.includes('memory') || lowerName.includes('vengeance') || lowerName.includes('trident')) return 'RAM';
    if (lowerName.includes('ssd') || lowerName.includes('hdd') || lowerName.includes('nvme') || lowerName.includes('storage') || lowerName.includes('sata')) return 'Storage';
    if (lowerName.includes('power') || lowerName.includes('psu') || lowerName.includes('watt') || lowerName.includes('80+')) return 'Power Supply';
    if (lowerName.includes('rtx') || lowerName.includes('radeon') || lowerName.includes('gpu') || lowerName.includes('geforce') || lowerName.includes('graphics')) return 'GPU';
    if (lowerName.includes('cooler') || lowerName.includes('fan') || lowerName.includes('aio') || lowerName.includes('liquid') || lowerName.includes('heatsink')) return 'Cooling';
    if (lowerName.includes('case') || lowerName.includes('chassis') || lowerName.includes('housing')) return 'Case';
    if (lowerName.includes('system') || lowerName.includes('pc -') || lowerName.includes('gaming pc')) return 'System Unit';
    return 'Other';
  };

  const sortProducts = (productsToSort: Product[]): Product[] => {
    const sorted = [...productsToSort];
    
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => Number(a.price) - Number(b.price));
      case 'price-high':
        return sorted.sort((a, b) => Number(b.price) - Number(a.price));
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'stock-high':
        return sorted.sort((a, b) => b.stock - a.stock);
      case 'stock-low':
        return sorted.sort((a, b) => a.stock - b.stock);
      case 'category':
        return sorted.sort((a, b) => {
          const catA = getProductCategory(a.name);
          const catB = getProductCategory(b.name);
          if (catA !== catB) return catA.localeCompare(catB);
          return a.name.localeCompare(b.name);
        });
      default:
        return sorted;
    }
  };

  useEffect(() => {
    let filtered = products;
    
    // Search filter
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Component Type filter
    if (componentType !== 'Component Type') {
      filtered = filtered.filter((product) => {
        const category = getProductCategory(product.name);
        return category === componentType;
      });
    }
    
    // Price Range filter
    if (priceRange !== 'Price') {
      filtered = filtered.filter((product) => {
        const price = Number(product.price);
        switch (priceRange) {
          case 'Under ₱10,000':
            return price < 10000;
          case '₱10,000 - ₱25,000':
            return price >= 10000 && price <= 25000;
          case '₱25,000 - ₱50,000':
            return price >= 25000 && price <= 50000;
          case '₱50,000 - ₱100,000':
            return price >= 50000 && price <= 100000;
          case 'Over ₱100,000':
            return price > 100000;
          default:
            return true;
        }
      });
    }
    
    // Review filter (simulated - using product characteristics as proxy for ratings)
    if (review !== 'Review') {
      const minStars = parseInt(review.charAt(0));
      filtered = filtered.filter((product) => {
        // Simulate ratings based on product characteristics:
        // Higher stock = more popular = better ratings
        // System units and high-end products = better ratings
        const category = getProductCategory(product.name);
        const isSystemUnit = category === 'System Unit';
        const isHighEnd = Number(product.price) > 50000;
        const hasGoodStock = product.stock > 15;
        
        // Simulate rating: 4-5 stars for most products, lower for low stock items
        let simulatedRating = 4;
        if (isSystemUnit || isHighEnd) simulatedRating = 5;
        else if (hasGoodStock) simulatedRating = 4;
        else if (product.stock > 5) simulatedRating = 3;
        else simulatedRating = 2;
        
        return simulatedRating >= minStars;
      });
    }
    
    // Color filter (simulated - based on product name/description)
    if (color !== 'Color') {
      filtered = filtered.filter((product) => {
        const lowerName = product.name.toLowerCase();
        const lowerDesc = product.description.toLowerCase();
        const searchText = lowerName + ' ' + lowerDesc;
        
        switch (color) {
          case 'Black':
            return searchText.includes('black') || searchText.includes('dark');
          case 'White':
            return searchText.includes('white') || searchText.includes('light');
          case 'RGB':
            return searchText.includes('rgb') || searchText.includes('led') || 
                   searchText.includes('lighting') || searchText.includes('aura');
          default:
            return true;
        }
      });
    }
    
    // Material filter (simulated - based on product name/description)
    if (material !== 'Material') {
      filtered = filtered.filter((product) => {
        const lowerName = product.name.toLowerCase();
        const lowerDesc = product.description.toLowerCase();
        const searchText = lowerName + ' ' + lowerDesc;
        
        switch (material) {
          case 'Metal':
            return searchText.includes('metal') || searchText.includes('aluminum') || 
                   searchText.includes('steel') || searchText.includes('alloy');
          case 'Plastic':
            return searchText.includes('plastic') || searchText.includes('polymer');
          case 'Mixed':
            return true; // Most products are mixed
          default:
            return true;
        }
      });
    }
    
    // Offer filter (simulated)
    if (offer !== 'Offer') {
      filtered = filtered.filter((product) => {
        // Simulate offers: products with lower stock or certain categories
        switch (offer) {
          case 'On Sale':
            // Products with stock < 20 or system units
            return product.stock < 20 || getProductCategory(product.name) === 'System Unit';
          case 'New Arrivals':
            // Recently added products (simulated by ID > some threshold)
            return product.id > 20;
          case 'Best Sellers':
            // Products with high stock (popular items)
            return product.stock > 15;
          default:
            return true;
        }
      });
    }
    
    const sorted = sortProducts(filtered);
    setFilteredProducts(sorted);
  }, [searchQuery, products, sortBy, componentType, priceRange, review, color, material, offer]);

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = async (e: React.MouseEvent, productId: number) => {
    e.stopPropagation();
    try {
      setAddingToCart(productId);
      await cartApi.addItem(productId, 1);
      await refreshCart();
      setShowSuccessModal(true);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to add product to cart');
      setShowErrorModal(true);
    } finally {
      setAddingToCart(null);
    }
  };

  const handleBuyNow = async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      setBuyNowProduct(product);
      setShowUserAuth(true);
      return;
    }

    // If authenticated, proceed directly to checkout with this product
    try {
      // Clear cart first
      await cartApi.clearCart();
      // Add product to cart
      await cartApi.addItem(product.id, 1);
      await refreshCart();
      // Navigate to cart
      navigate('/cart');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to proceed to checkout');
      setShowErrorModal(true);
    }
  };

  const handleAuthSuccess = () => {
    setShowUserAuth(false);
    if (buyNowProduct) {
      // After login, proceed with buy now
      const proceedBuyNow = async () => {
        try {
          // Clear cart first
          await cartApi.clearCart();
          // Add product to cart
          await cartApi.addItem(buyNowProduct.id, 1);
          await refreshCart();
          // Navigate to cart
          navigate('/cart');
        } catch (err: any) {
          setErrorMessage(err.response?.data?.message || 'Failed to proceed to checkout');
          setShowErrorModal(true);
        }
      };
      proceedBuyNow();
      setBuyNowProduct(null);
    }
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return (
      <div className="error-container" style={{ 
        padding: '3rem', 
        textAlign: 'center',
        maxWidth: '600px',
        margin: '2rem auto',
        background: 'var(--card-bg)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 16px var(--shadow)'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Failed to Load Products</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
          {error}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={loadProducts}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'var(--accent-hover)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'var(--accent)'}
          >
            🔄 Retry
          </button>
          <div style={{ 
            padding: '0.75rem 1.5rem',
            background: 'var(--bg-secondary)',
            borderRadius: '8px',
            fontSize: '0.9rem',
            color: 'var(--text-secondary)'
          }}>
            <strong>Quick Fix:</strong><br />
            Make sure backend is running:<br />
            <code style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>cd backend && npm run start:dev</code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      {/* Promotional Carousel */}
      <PromoCarousel />

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-row">
          <select 
            className="filter-dropdown"
            value={componentType}
            onChange={(e) => setComponentType(e.target.value)}
          >
            <option>Component Type</option>
            <option>Motherboard</option>
            <option>CPU</option>
            <option>RAM</option>
            <option>Storage</option>
            <option>Power Supply</option>
            <option>GPU</option>
            <option>Cooling</option>
            <option>Case</option>
            <option>System Unit</option>
          </select>
          <select 
            className="filter-dropdown"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
          >
            <option>Price</option>
            <option>Under ₱10,000</option>
            <option>₱10,000 - ₱25,000</option>
            <option>₱25,000 - ₱50,000</option>
            <option>₱50,000 - ₱100,000</option>
            <option>Over ₱100,000</option>
          </select>
          <select 
            className="filter-dropdown"
            value={review}
            onChange={(e) => setReview(e.target.value)}
          >
            <option>Review</option>
            <option>4+ Stars</option>
            <option>3+ Stars</option>
            <option>2+ Stars</option>
            <option>1+ Stars</option>
          </select>
          <select 
            className="filter-dropdown"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          >
            <option>Color</option>
            <option>Black</option>
            <option>White</option>
            <option>RGB</option>
          </select>
          <select 
            className="filter-dropdown"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
          >
            <option>Material</option>
            <option>Metal</option>
            <option>Plastic</option>
            <option>Mixed</option>
          </select>
          <select 
            className="filter-dropdown"
            value={offer}
            onChange={(e) => setOffer(e.target.value)}
          >
            <option>Offer</option>
            <option>On Sale</option>
            <option>New Arrivals</option>
            <option>Best Sellers</option>
          </select>
          <button 
            className="all-filters-btn"
            onClick={() => {
              setComponentType('Component Type');
              setPriceRange('Price');
              setReview('Review');
              setColor('Color');
              setMaterial('Material');
              setOffer('Offer');
            }}
          >
            <span>🔍</span> All Filters
          </button>
        </div>
        <div className="sort-row">
          <h3 className="products-section-title">Gaming PCs For You!</h3>
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="product-card"
            onClick={() => handleProductClick(product.id)}
          >
            <div className="product-image-wrapper">
              <button 
                className={`favorite-btn ${isFavorite(product.id) ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(product.id);
                }}
                aria-label={isFavorite(product.id) ? 'Remove from favorites' : 'Add to favorites'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorite(product.id) ? "currentColor" : "none"} xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </button>
              <div className="product-image">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const placeholder = target.nextElementSibling as HTMLElement;
                      if (placeholder && placeholder.classList.contains('placeholder-image')) {
                        placeholder.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div className="placeholder-image" style={{ display: product.imageUrl ? 'none' : 'flex' }}>
                  📦
                  <span>No Image</span>
                </div>
                {product.stock === 0 && (
                  <div className="out-of-stock-overlay">Out of Stock</div>
                )}
              </div>
            </div>
            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <div className="product-rating">
                <div className="stars">
                  {'★★★★★'.split('').map((star, i) => (
                    <span key={i} className="star filled">{star}</span>
                  ))}
                </div>
                <span className="review-count">({Math.floor(Math.random() * 200 + 50)})</span>
              </div>
              <div className="product-footer">
                <div className="product-price">
                  ₱{Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="product-actions">
                <button
                  className={`add-to-cart-btn ${product.stock === 0 ? 'disabled' : ''}`}
                  onClick={(e) => handleAddToCart(e, product.id)}
                  disabled={product.stock === 0 || addingToCart === product.id}
                >
                  {addingToCart === product.id
                    ? 'Adding...'
                    : product.stock === 0
                    ? 'Out of Stock'
                    : 'Add to Cart'}
                </button>
                <button
                  className={`buy-now-btn ${product.stock === 0 ? 'disabled' : ''}`}
                  onClick={(e) => handleBuyNow(e, product)}
                  disabled={product.stock === 0}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredProducts.length === 0 && !loading && (
        <div className="empty-state">
          {searchQuery || componentType !== 'Component Type' || priceRange !== 'Price' || 
           review !== 'Review' || color !== 'Color' || material !== 'Material' || offer !== 'Offer'
            ? 'No products found matching your filters. Try adjusting your search criteria.'
            : 'No products available'}
        </div>
      )}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        type="success"
      >
        <p style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
          Product added to cart successfully!
        </p>
      </Modal>
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        type="error"
        title="Error"
      >
        <p style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
          {errorMessage}
        </p>
      </Modal>
      <UserAuth
        isOpen={showUserAuth}
        onClose={() => {
          setShowUserAuth(false);
          setBuyNowProduct(null);
        }}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default Products;


