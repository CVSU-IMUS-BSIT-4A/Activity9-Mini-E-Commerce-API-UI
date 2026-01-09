import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsApi, Product, cartApi } from '../api/api';
import { useCart } from '../contexts/CartContext';
import { useUserAuth } from '../contexts/UserAuthContext';
import Modal from '../components/Modal';
import UserAuth from './UserAuth';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const { isAuthenticated } = useUserAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showUserAuth, setShowUserAuth] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await productsApi.getById(Number(id));
      setProduct(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setAddingToCart(true);
      await cartApi.addItem(product.id, quantity);
      await refreshCart();
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate('/cart');
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to add product to cart');
      setShowErrorModal(true);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    if (!isAuthenticated) {
      setShowUserAuth(true);
      return;
    }

    // If authenticated, proceed directly to checkout
    try {
      // Clear cart first
      await cartApi.clearCart();
      // Add product to cart with selected quantity
      await cartApi.addItem(product.id, quantity);
      await refreshCart();
      // Navigate to cart
      navigate('/cart');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to proceed to checkout');
      setShowErrorModal(true);
    }
  };

  const handleQuantityChange = (change: number) => {
    if (!product) return;
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return <div className="loading">Loading product...</div>;
  }

  if (error || !product) {
    return (
      <div className="error-container">
        <div className="error">{error || 'Product not found'}</div>
        <button onClick={() => navigate('/')} className="back-btn">
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <button onClick={() => navigate('/')} className="back-btn">
        ← Back to Products
      </button>
      <div className="product-detail-container">
        <div className="product-detail-image">
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
            <span>No Image Available</span>
          </div>
        </div>
        <div className="product-detail-info">
          <h1>{product.name}</h1>
          <p className="product-detail-description">{product.description}</p>
          <div className="product-detail-price">
            <span className="price-label">Price:</span>
            <span className="price-value">₱{Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="product-detail-stock">
            <span className="stock-label">Stock:</span>
            <span className={`stock-value ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}
            </span>
          </div>
          {product.stock > 0 && (
            <div className="product-detail-actions">
              <div className="quantity-selector">
                <label>Quantity:</label>
                <div className="quantity-controls">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="qty-btn"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      if (val >= 1 && val <= product.stock) {
                        setQuantity(val);
                      }
                    }}
                    className="qty-input"
                  />
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    className="qty-btn"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="product-detail-buttons">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.stock === 0}
                  className="add-to-cart-detail-btn"
                >
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="buy-now-detail-btn"
                >
                  Buy Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/cart');
        }}
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
        onClose={() => setShowUserAuth(false)}
        onSuccess={async () => {
          setShowUserAuth(false);
          if (product) {
            // After login, proceed with buy now
            try {
              // Clear cart first
              await cartApi.clearCart();
              // Add product to cart with selected quantity
              await cartApi.addItem(product.id, quantity);
              await refreshCart();
              // Navigate to cart
              navigate('/cart');
            } catch (err: any) {
              setErrorMessage(err.response?.data?.message || 'Failed to proceed to checkout');
              setShowErrorModal(true);
            }
          }
        }}
      />
    </div>
  );
};

export default ProductDetail;

