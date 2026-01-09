import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartApi, productsApi, ordersApi, CartItem, Product, Order } from '../api/api';
import { useCart } from '../contexts/CartContext';
import { useUserAuth } from '../contexts/UserAuthContext';
import Modal from '../components/Modal';
import UserAuth from './UserAuth';
import './Cart.css';

type PaymentMethod = 'cod' | 'credit_card' | 'ewallet';
type EWalletProvider = 'gcash' | 'paymaya';

interface CreditCardInfo {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
}

const Cart = () => {
  const { refreshCart } = useCart();
  const { user, isAuthenticated, isAccountComplete } = useUserAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Record<number, Product>>({});
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [showUserAuth, setShowUserAuth] = useState(false);
  const [accountIncompleteError, setAccountIncompleteError] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Checkout steps
  const [step, setStep] = useState<'cart' | 'payment' | 'payment-details' | 'success'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [ewalletProvider, setEwalletProvider] = useState<EWalletProvider>('gcash');
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  
  // Form data
  const [creditCardInfo, setCreditCardInfo] = useState<CreditCardInfo>({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    // Select all items by default
    if (cartItems.length > 0 && selectedItems.size === 0) {
      setSelectedItems(new Set(cartItems.map(item => item.id)));
    }
  }, [cartItems]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const cartResponse = await cartApi.getAll();
      const items = cartResponse.data;
      setCartItems(items);

      // Load product details for each cart item
      const productIds = items.map((item) => item.productId);
      const productPromises = productIds.map((id) => productsApi.getById(id));
      const productResponses = await Promise.all(productPromises);
      const productsMap: Record<number, Product> = {};
      productResponses.forEach((response) => {
        productsMap[response.data.id] = response.data;
      });
      setProducts(productsMap);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }
    try {
      await cartApi.updateItem(itemId, newQuantity);
      await loadCart();
      await refreshCart();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to update quantity');
      setShowErrorModal(true);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await cartApi.removeItem(itemId);
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
      await loadCart();
      await refreshCart(); // Update cart badge
    } catch (err: any) {
      // If item not found (404), it's already deleted, just refresh
      if (err.response?.status === 404) {
        await loadCart();
        await refreshCart();
        return;
      }
      setErrorMessage(err.response?.data?.message || 'Failed to remove item');
      setShowErrorModal(true);
    }
  };

  const handleToggleItem = (itemId: number) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map(item => item.id)));
    }
  };


  const validateCreditCard = (): boolean => {
    const { cardNumber, cardName, expiryDate, cvv } = creditCardInfo;
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      setErrorMessage('Please fill in all credit card details');
      setShowErrorModal(true);
      return false;
    }
    if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
      setErrorMessage('Please enter a valid 16-digit card number');
      setShowErrorModal(true);
      return false;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      setErrorMessage('Please enter expiry date in MM/YY format');
      setShowErrorModal(true);
      return false;
    }
    if (!/^\d{3}$/.test(cvv)) {
      setErrorMessage('Please enter a valid 3-digit CVV');
      setShowErrorModal(true);
      return false;
    }
    return true;
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      setShowUserAuth(true);
      return;
    }

    if (selectedItems.size === 0) {
      setErrorMessage('Please select at least one item to checkout');
      setShowErrorModal(true);
      return;
    }

    if (!isAccountComplete()) {
      setAccountIncompleteError(true);
      setTimeout(() => {
        setAccountIncompleteError(false);
        navigate('/account');
      }, 2000);
      return;
    }

    setStep('payment');
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setPaymentMethod(method);
    if (method === 'cod') {
      // Cash on Delivery - proceed directly to place order
      // Close payment modal and process order smoothly
      setStep('cart'); // Close the payment modal immediately
      // Small delay to ensure modal closes before processing
      setTimeout(() => {
        handlePlaceOrder();
      }, 100);
    } else {
      // Credit Card or E-Wallet - show payment details form
      setStep('payment-details');
    }
  };

  const handleCreditCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateCreditCard()) {
      handlePlaceOrder();
    }
  };

  const handleEWalletSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handlePlaceOrder();
  };

  const handlePlaceOrder = async () => {
    try {
      setCheckingOut(true);
      const selectedCartItems = cartItems.filter(item => selectedItems.has(item.id));
      const orderItems = selectedCartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const response = await ordersApi.create(orderItems, user?.id);
      await refreshCart();
      
      // Remove selected items from cart
      for (const item of selectedCartItems) {
        try {
          await cartApi.removeItem(item.id);
        } catch (err: any) {
          // Ignore 404 errors (item might already be deleted)
          if (err.response?.status !== 404) {
            console.error('Failed to remove cart item:', err);
          }
        }
      }
      await loadCart();
      setSelectedItems(new Set());
      
      setPlacedOrder(response.data);
      setStep('success');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to place order');
      setShowErrorModal(true);
      setStep('payment'); // Go back to payment step on error
    } finally {
      setCheckingOut(false);
    }
  };

  const calculateTotal = () => {
    return cartItems
      .filter(item => selectedItems.has(item.id))
      .reduce((total, item) => {
        const product = products[item.productId];
        if (product) {
          return total + Number(product.price) * item.quantity;
        }
        return total;
      }, 0);
  };

  if (loading) {
    return <div className="loading">Loading cart...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="cart-page">
      <h1>Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <button onClick={() => navigate('/')} className="shop-btn">
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          {/* Step 1: Cart Items */}
          {step === 'cart' && (
            <>
              <div className="cart-header">
                <label className="select-all-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                    onChange={handleSelectAll}
                  />
                  <span>Select All</span>
                </label>
              </div>
              {accountIncompleteError && (
                <div className="account-error-banner">
                  ⚠️ Please complete your account profile (Address, Contact, City, Postal Code) to proceed with checkout.
                </div>
              )}
              <div className="cart-items">
                {cartItems.map((item) => {
                  const product = products[item.productId];
                  if (!product) return null;

                  return (
                    <div key={item.id} className={`cart-item ${selectedItems.has(item.id) ? 'selected' : ''}`}>
                      <div className="cart-item-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={() => handleToggleItem(item.id)}
                        />
                      </div>
                      <div className="cart-item-info">
                        <h3>{product.name}</h3>
                        <p className="cart-item-price">
                          ₱{Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} each
                        </p>
                      </div>
                      <div className="cart-item-controls">
                        <div className="quantity-controls">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="quantity-btn"
                          >
                            -
                          </button>
                          <span className="quantity">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="quantity-btn"
                            disabled={item.quantity >= product.stock}
                          >
                            +
                          </button>
                        </div>
                        <div className="cart-item-total">
                          ₱{(Number(product.price) * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="remove-btn"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="cart-summary">
                <div className="summary-row">
                  <span>Total ({selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''}):</span>
                  <span className="total-amount">
                    ₱{calculateTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <button 
                  onClick={handleProceedToCheckout} 
                  className="checkout-btn"
                  disabled={selectedItems.size === 0}
                >
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}

          {/* Step 2: Payment Method Selection */}
          {step === 'payment' && !checkingOut && (
            <Modal
              isOpen={true}
              onClose={() => setStep('cart')}
              title="Select Payment Method"
              type="form"
              size="medium"
            >
              <div className="payment-methods">
                <div className="payment-options">
                  <label
                    className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}
                    onClick={() => handlePaymentMethodSelect('cod')}
                  >
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} readOnly />
                    <div className="payment-info">
                      <span className="payment-icon">💵</span>
                      <div>
                        <span className="payment-name">Cash on Delivery</span>
                        <span className="payment-desc">Pay when you receive your order</span>
                      </div>
                    </div>
                  </label>
                  <label
                    className={`payment-option ${paymentMethod === 'credit_card' ? 'selected' : ''}`}
                    onClick={() => handlePaymentMethodSelect('credit_card')}
                  >
                    <input type="radio" name="payment" value="credit_card" checked={paymentMethod === 'credit_card'} readOnly />
                    <div className="payment-info">
                      <span className="payment-icon">💳</span>
                      <div>
                        <span className="payment-name">Credit Card</span>
                        <span className="payment-desc">Visa, Mastercard, Amex</span>
                      </div>
                    </div>
                  </label>
                  <label
                    className={`payment-option ${paymentMethod === 'ewallet' ? 'selected' : ''}`}
                    onClick={() => handlePaymentMethodSelect('ewallet')}
                  >
                    <input type="radio" name="payment" value="ewallet" checked={paymentMethod === 'ewallet'} readOnly />
                    <div className="payment-info">
                      <span className="payment-icon">📱</span>
                      <div>
                        <span className="payment-name">E-Wallet</span>
                        <span className="payment-desc">GCash, PayMaya</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </Modal>
          )}

          {/* Loading state during order processing */}
          {checkingOut && (
            <Modal
              isOpen={true}
              onClose={() => {}}
              title="Processing Order"
              type="info"
              size="small"
            >
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div className="loading-spinner" style={{ 
                  width: '48px', 
                  height: '48px', 
                  border: '4px solid var(--border-color)',
                  borderTop: '4px solid var(--accent)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 1rem'
                }}></div>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                  Processing your order...
                </p>
              </div>
            </Modal>
          )}

          {/* Step 3a: Credit Card Details */}
          {step === 'payment-details' && paymentMethod === 'credit_card' && !checkingOut && (
            <Modal
              isOpen={true}
              onClose={() => setStep('payment')}
              title="Credit Card Information"
              type="form"
              size="medium"
            >
              <form onSubmit={handleCreditCardSubmit} className="checkout-form">
                <div className="form-group">
                  <label>Card Number *</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    value={creditCardInfo.cardNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                      const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                      setCreditCardInfo({ ...creditCardInfo, cardNumber: formatted });
                    }}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Cardholder Name *</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={creditCardInfo.cardName}
                    onChange={(e) => setCreditCardInfo({ ...creditCardInfo, cardName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date *</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={creditCardInfo.expiryDate}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + '/' + value.slice(2, 4);
                        }
                        setCreditCardInfo({ ...creditCardInfo, expiryDate: value });
                      }}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV *</label>
                    <input
                      type="text"
                      placeholder="123"
                      maxLength={3}
                      value={creditCardInfo.cvv}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setCreditCardInfo({ ...creditCardInfo, cvv: value });
                      }}
                      required
                    />
                  </div>
                </div>
                <div className="order-summary">
                  <div className="summary-row">
                    <span>Total Amount:</span>
                    <span className="total-amount">
                      ₱{calculateTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" onClick={() => setStep('payment')} className="back-btn-form">
                    Back
                  </button>
                  <button type="submit" disabled={checkingOut} className="continue-btn">
                    {checkingOut ? 'Processing...' : 'Place Order'}
                  </button>
                </div>
              </form>
            </Modal>
          )}

          {/* Step 3b: E-Wallet Selection */}
          {step === 'payment-details' && paymentMethod === 'ewallet' && !checkingOut && (
            <Modal
              isOpen={true}
              onClose={() => setStep('payment')}
              title="E-Wallet Payment"
              type="form"
              size="medium"
            >
              <form onSubmit={handleEWalletSubmit} className="checkout-form">
                <div className="ewallet-options">
                  <label
                    className={`ewallet-option ${ewalletProvider === 'gcash' ? 'selected' : ''}`}
                    onClick={() => setEwalletProvider('gcash')}
                  >
                    <input type="radio" name="ewallet" value="gcash" checked={ewalletProvider === 'gcash'} readOnly />
                    <div className="ewallet-info">
                      <div className="ewallet-logo">GCash</div>
                      <span className="ewallet-desc">Pay using your GCash account</span>
                    </div>
                  </label>
                  <label
                    className={`ewallet-option ${ewalletProvider === 'paymaya' ? 'selected' : ''}`}
                    onClick={() => setEwalletProvider('paymaya')}
                  >
                    <input type="radio" name="ewallet" value="paymaya" checked={ewalletProvider === 'paymaya'} readOnly />
                    <div className="ewallet-info">
                      <div className="ewallet-logo">PayMaya</div>
                      <span className="ewallet-desc">Pay using your PayMaya account</span>
                    </div>
                  </label>
                </div>
                <div className="ewallet-form">
                  <div className="form-group">
                    <label>Mobile Number *</label>
                    <input
                      type="tel"
                      placeholder="09XXXXXXXXX"
                      value={user?.contactNumber || ''}
                      readOnly
                    />
                    <small>We'll send a payment request to this number</small>
                  </div>
                </div>
                <div className="order-summary">
                  <div className="summary-row">
                    <span>Total Amount:</span>
                    <span className="total-amount">
                      ₱{calculateTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" onClick={() => setStep('payment')} className="back-btn-form">
                    Back
                  </button>
                  <button type="submit" disabled={checkingOut} className="continue-btn">
                    {checkingOut ? 'Processing...' : `Pay with ${ewalletProvider === 'gcash' ? 'GCash' : 'PayMaya'}`}
                  </button>
                </div>
              </form>
            </Modal>
          )}

          {/* Step 4: Success with Receipt */}
          {step === 'success' && placedOrder && (
            <Modal
              isOpen={true}
              onClose={() => {
                setStep('cart');
                navigate('/');
              }}
              title="Payment Successful!"
              type="success"
              size="large"
            >
              <div className="order-receipt">
                <div className="payment-success-message">
                  <div className="success-icon">✓</div>
                  <h3>Payment Successful!</h3>
                  <p>Your order has been placed successfully. Thank you for your purchase!</p>
                </div>
                <div className="receipt-header">
                  <h3>Order Receipt & Tracking</h3>
                </div>
                <div className="receipt-info">
                  <div className="receipt-row">
                    <span className="receipt-label">Order ID:</span>
                    <span className="receipt-value">#{placedOrder.id}</span>
                  </div>
                  <div className="receipt-row">
                    <span className="receipt-label">Total Amount:</span>
                    <span className="receipt-value">
                      ₱{Number(placedOrder.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="receipt-row">
                    <span className="receipt-label">Payment Method:</span>
                    <span className="receipt-value">
                      {paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'credit_card' ? 'Credit Card' : `${ewalletProvider === 'gcash' ? 'GCash' : 'PayMaya'}`}
                    </span>
                  </div>
                  <div className="receipt-row">
                    <span className="receipt-label">Payment Status:</span>
                    <span className="receipt-value payment-success-badge">
                      Paid
                    </span>
                  </div>
                  <div className="receipt-row">
                    <span className="receipt-label">Order Date:</span>
                    <span className="receipt-value">
                      {new Date(placedOrder.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  {placedOrder.deliveryDate && (
                    <div className="receipt-row">
                      <span className="receipt-label">Estimated Delivery:</span>
                      <span className="receipt-value">
                        {new Date(placedOrder.deliveryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  )}
                  <div className="receipt-row">
                    <span className="receipt-label">Order Status:</span>
                    <span className="receipt-value status-badge" style={{ backgroundColor: '#ffc107' }}>
                      {placedOrder.status}
                    </span>
                  </div>
                </div>
                <div className="receipt-items">
                  <h4>Order Items:</h4>
                  <ul>
                    {placedOrder.items.map((item, index) => (
                      <li key={index}>
                        {item.productName} × {item.quantity} - ₱{Number(item.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="receipt-footer">
                  <p>You can track your order in your Account page.</p>
                  <div className="receipt-actions">
                    <button 
                      onClick={() => {
                        setStep('cart');
                        navigate('/');
                      }}
                      className="back-to-home-btn"
                    >
                      Back to Home
                    </button>
                    <button 
                      onClick={() => {
                        setStep('cart');
                        navigate('/');
                      }}
                      className="order-again-btn"
                    >
                      Order Again
                    </button>
                  </div>
                </div>
              </div>
            </Modal>
          )}
        </>
      )}

      <UserAuth
        isOpen={showUserAuth}
        onClose={() => setShowUserAuth(false)}
        onSuccess={() => setShowUserAuth(false)}
      />
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        type="error"
        title="Error"
        size="small"
      >
        <p style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
          {errorMessage}
        </p>
      </Modal>
    </div>
  );
};

export default Cart;
