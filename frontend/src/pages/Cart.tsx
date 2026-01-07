import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartApi, productsApi, ordersApi, CartItem, Product } from '../api/api';
import { useCart } from '../contexts/CartContext';
import Modal from '../components/Modal';
import './Cart.css';

type PaymentMethod = 'cod' | 'credit_card' | 'ewallet';
type EWalletProvider = 'gcash' | 'paymaya';

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

interface CreditCardInfo {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
}

const Cart = () => {
  const { refreshCart } = useCart();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Record<number, Product>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  
  // Checkout steps
  const [step, setStep] = useState<'cart' | 'personal' | 'payment' | 'payment-details'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [ewalletProvider, setEwalletProvider] = useState<EWalletProvider>('gcash');
  
  // Form data
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });
  
  const [creditCardInfo, setCreditCardInfo] = useState<CreditCardInfo>({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

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
      alert(err.response?.data?.message || 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await cartApi.removeItem(itemId);
      await loadCart();
      await refreshCart(); // Update cart badge
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove item');
    }
  };

  const validatePersonalInfo = (): boolean => {
    const { firstName, lastName, email, phone, address, city, postalCode } = personalInfo;
    if (!firstName || !lastName || !email || !phone || !address || !city || !postalCode) {
      alert('Please fill in all required fields');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address');
      return false;
    }
    if (!/^09\d{9}$/.test(phone.replace(/\s/g, ''))) {
      alert('Please enter a valid Philippine mobile number (09XXXXXXXXX)');
      return false;
    }
    return true;
  };

  const validateCreditCard = (): boolean => {
    const { cardNumber, cardName, expiryDate, cvv } = creditCardInfo;
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      alert('Please fill in all credit card details');
      return false;
    }
    if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
      alert('Please enter a valid 16-digit card number');
      return false;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      alert('Please enter expiry date in MM/YY format');
      return false;
    }
    if (!/^\d{3}$/.test(cvv)) {
      alert('Please enter a valid 3-digit CVV');
      return false;
    }
    return true;
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }
    setStep('personal');
  };

  const handlePersonalInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePersonalInfo()) {
      setStep('payment');
    }
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setPaymentMethod(method);
    if (method === 'cod') {
      // Cash on Delivery - proceed directly to place order
      handlePlaceOrder();
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
      const orderItems = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      await ordersApi.create(orderItems);
      await refreshCart();
      
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate('/');
      }, 2000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to place order');
    } finally {
      setCheckingOut(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
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
              <div className="cart-items">
                {cartItems.map((item) => {
                  const product = products[item.productId];
                  if (!product) return null;

                  return (
                    <div key={item.id} className="cart-item">
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
                  <span>Total:</span>
                  <span className="total-amount">
                    ₱{calculateTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <button onClick={handleProceedToCheckout} className="checkout-btn">
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}

          {/* Step 2: Personal Information */}
          {step === 'personal' && (
            <Modal
              isOpen={true}
              onClose={() => setStep('cart')}
              title="Personal Information"
              type="form"
              size="large"
            >
              <form onSubmit={handlePersonalInfoSubmit} className="checkout-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      value={personalInfo.firstName}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      value={personalInfo.lastName}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="09XXXXXXXXX"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Address *</label>
                  <input
                    type="text"
                    placeholder="Street address, Building, Unit"
                    value={personalInfo.address}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      value={personalInfo.city}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, city: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Postal Code *</label>
                    <input
                      type="text"
                      value={personalInfo.postalCode}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, postalCode: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" onClick={() => setStep('cart')} className="back-btn-form">
                    Back to Cart
                  </button>
                  <button type="submit" className="continue-btn">
                    Continue to Payment
                  </button>
                </div>
              </form>
            </Modal>
          )}

          {/* Step 3: Payment Method Selection */}
          {step === 'payment' && (
            <Modal
              isOpen={true}
              onClose={() => setStep('personal')}
              title="Select Payment Method"
              type="form"
              size="large"
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

          {/* Step 4a: Credit Card Details */}
          {step === 'payment-details' && paymentMethod === 'credit_card' && (
            <Modal
              isOpen={true}
              onClose={() => setStep('payment')}
              title="Credit Card Information"
              type="form"
              size="large"
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

          {/* Step 4b: E-Wallet Selection */}
          {step === 'payment-details' && paymentMethod === 'ewallet' && (
            <Modal
              isOpen={true}
              onClose={() => setStep('payment')}
              title="E-Wallet Payment"
              type="form"
              size="large"
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
                      value={personalInfo.phone}
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
        </>
      )}

      <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/');
        }}
        type="success"
      >
        <p style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
          Order placed successfully!<br />
          Payment Method: {paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'credit_card' ? 'Credit Card' : `${ewalletProvider === 'gcash' ? 'GCash' : 'PayMaya'}`}
        </p>
      </Modal>
    </div>
  );
};

export default Cart;
