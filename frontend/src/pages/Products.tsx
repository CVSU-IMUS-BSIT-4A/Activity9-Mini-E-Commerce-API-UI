import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsApi, Product, cartApi } from '../api/api';
import { useCart } from '../contexts/CartContext';
import Modal from '../components/Modal';
import './Products.css';

const Products = () => {
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('default');

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
      setError(err.response?.data?.message || 'Failed to load products');
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
    
    if (searchQuery.trim() !== '') {
      filtered = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    const sorted = sortProducts(filtered);
    setFilteredProducts(sorted);
  }, [searchQuery, products, sortBy]);

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

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="products-page">
      <h1 className="page-title">Gaming PC Components & Systems</h1>
      <div className="search-sort-container">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search products by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-bar"
          />
          {searchQuery && (
            <span className="search-results">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            </span>
          )}
        </div>
        <div className="sort-container">
          <label htmlFor="sort-select" className="sort-label">Sort by:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="default">Default</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
            <option value="stock-high">Stock: High to Low</option>
            <option value="stock-low">Stock: Low to High</option>
            <option value="category">Category</option>
          </select>
        </div>
      </div>
      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="product-card"
            onClick={() => handleProductClick(product.id)}
          >
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
            <div className="product-info">
              <div className="product-category-badge">
                {getProductCategory(product.name)}
              </div>
              <h3 className="product-name">{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <div className="product-footer">
                <div className="product-price">
                  ₱{Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className={`product-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </div>
              </div>
              <button
                className="add-to-cart-btn"
                onClick={(e) => handleAddToCart(e, product.id)}
                disabled={product.stock === 0 || addingToCart === product.id}
              >
                {addingToCart === product.id
                  ? 'Adding...'
                  : product.stock === 0
                  ? 'Out of Stock'
                  : 'Add to Cart'}
              </button>
            </div>
          </div>
        ))}
      </div>
      {filteredProducts.length === 0 && !loading && (
        <div className="empty-state">
          {searchQuery ? `No products found for "${searchQuery}"` : 'No products available'}
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
    </div>
  );
};

export default Products;


