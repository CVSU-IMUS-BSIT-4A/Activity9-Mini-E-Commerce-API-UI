import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { CartProvider, useCart } from './contexts/CartContext';
import { SearchProvider, useSearch } from './contexts/SearchContext';
import { FavoritesProvider, useFavorites } from './contexts/FavoritesContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserAuthProvider, useUserAuth } from './contexts/UserAuthContext';
import AdminLayout from './layouts/AdminLayout';
import AdminFloatingButton from './components/AdminFloatingButton';
import UserAuth from './pages/UserAuth';
import UserAccount from './pages/UserAccount';
import Products from './pages/Products';
import Cart from './pages/Cart';
import ProductDetail from './pages/ProductDetail';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import './App.css';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { cartCount } = useCart();
  const { searchQuery, setSearchQuery } = useSearch();
  const { favorites } = useFavorites();
  const { user, logout, isAccountComplete } = useUserAuth();
  const navigate = useNavigate();
  const [showFavoritesDropdown, setShowFavoritesDropdown] = useState(false);
  const [showUserAuth, setShowUserAuth] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [favoriteProducts, setFavoriteProducts] = useState<Array<{ id: number; name: string }>>([]);

  useEffect(() => {
    const loadFavoriteProducts = async () => {
      if (favorites.length > 0) {
        try {
          const { productsApi } = await import('./api/api');
          const products = await Promise.all(
            favorites.map(async (id) => {
              try {
                const response = await productsApi.getById(id);
                return { id, name: response.data.name };
              } catch {
                return { id, name: `Product #${id}` };
              }
            })
          );
          setFavoriteProducts(products);
        } catch (error) {
          console.error('Failed to load favorite products', error);
        }
      } else {
        setFavoriteProducts([]);
      }
    };
    loadFavoriteProducts();
  }, [favorites]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showFavoritesDropdown && !target.closest('.nav-icon-wrapper')) {
        setShowFavoritesDropdown(false);
      }
      if (showAccountDropdown && !target.closest('.nav-icon-wrapper')) {
        setShowAccountDropdown(false);
      }
    };

    if (showFavoritesDropdown || showAccountDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFavoritesDropdown, showAccountDropdown]);


  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <svg className="logo-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 18C5.9 18 5.01 17.1 5.01 16L3 4H1V2H5L6.5 12H19L20.5 4H22V6H20.5L19 14H7C6.45 14 6 14.45 6 15C6 15.55 6.45 16 7 16H20V18H7Z" fill="currentColor"/>
            <circle cx="8" cy="20" r="1.5" fill="currentColor"/>
            <circle cx="18" cy="20" r="1.5" fill="currentColor"/>
          </svg>
          <span className="logo-text">Shopcart</span>
        </Link>
        <div className="nav-right">
          <div className="nav-search-compact">
            <input
              type="text"
              placeholder="Search Product"
              className="nav-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg className="nav-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
              <path d="m20 20-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="nav-icon-wrapper">
            <button 
              className="nav-icon-link favorites-link"
              onClick={() => setShowFavoritesDropdown(!showFavoritesDropdown)}
            >
              <svg className="nav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={favorites.length > 0 ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <span className="nav-icon-text">Favorites</span>
              {favorites.length > 0 && (
                <span className="favorites-badge">{favorites.length > 99 ? '99+' : favorites.length}</span>
              )}
            </button>
            {showFavoritesDropdown && (
              <div className="favorites-dropdown">
                <div className="favorites-dropdown-header">
                  <span>Favorites ({favorites.length})</span>
                  <button onClick={() => setShowFavoritesDropdown(false)} className="close-dropdown">×</button>
                </div>
                <div className="favorites-dropdown-content">
                  {favorites.length === 0 ? (
                    <div className="favorites-empty">No favorites yet</div>
                  ) : (
                    <div className="favorites-list">
                      {favoriteProducts.map((product) => (
                        <Link 
                          key={product.id} 
                          to={`/product/${product.id}`}
                          className="favorite-item"
                          onClick={() => setShowFavoritesDropdown(false)}
                        >
                          {product.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <Link to="/cart" className="nav-icon-link cart-link">
            <svg className="nav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 18C5.9 18 5.01 17.1 5.01 16L3 4H1V2H5L6.5 12H19L20.5 4H22V6H20.5L19 14H7C6.45 14 6 14.45 6 15C6 15.55 6.45 16 7 16H20V18H7Z" fill="currentColor"/>
              <circle cx="8" cy="20" r="1.5" fill="currentColor"/>
              <circle cx="18" cy="20" r="1.5" fill="currentColor"/>
            </svg>
            <span className="nav-icon-text">Cart</span>
            {cartCount > 0 && (
              <span className="cart-badge">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>
          <div className="nav-icon-wrapper">
            <button
              className="nav-icon-link"
              onClick={() => {
                if (user) {
                  setShowAccountDropdown(!showAccountDropdown);
                } else {
                  setShowUserAuth(true);
                }
              }}
            >
              <svg className="nav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span className="nav-icon-text">{user ? user.name.split(' ')[0] : 'Account'}</span>
            </button>
            {showAccountDropdown && user && (
              <div className="account-dropdown">
                <div className="account-dropdown-header">
                  <div className="account-user-info">
                    <div className="account-user-name">{user.name}</div>
                    <div className="account-user-email">{user.email}</div>
                    {!isAccountComplete() && (
                      <div className="account-incomplete-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Profile Incomplete
                      </div>
                    )}
                  </div>
                </div>
                <div className="account-dropdown-content">
                  <Link
                    to="/account"
                    className="account-dropdown-item"
                    onClick={() => setShowAccountDropdown(false)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    My Account
                  </Link>
                  <button
                    className="account-dropdown-item"
                    onClick={() => {
                      logout();
                      setShowAccountDropdown(false);
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
          <UserAuth
            isOpen={showUserAuth}
            onClose={() => setShowUserAuth(false)}
            onSuccess={() => setShowUserAuth(false)}
          />
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
            {theme === 'light' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedAdminRoute />} />
      </Routes>
    );
  }

  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/account" element={<UserAccount />} />
        </Routes>
      </main>
      <AdminFloatingButton />
    </div>
  );
}

const ProtectedAdminRoute = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
        const [activeTab, setActiveTab] = useState('dashboard');
        const [stats, setStats] = useState({ products: 0, cartItems: 0, orders: 0, users: 0 });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab} stats={stats}>
      <Admin activeTab={activeTab} onTabChange={setActiveTab} onStatsUpdate={setStats} />
    </AdminLayout>
  );
};

function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <SearchProvider>
          <FavoritesProvider>
            <UserAuthProvider>
              <AuthProvider>
                <Router>
                  <AppContent />
                </Router>
              </AuthProvider>
            </UserAuthProvider>
          </FavoritesProvider>
        </SearchProvider>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;


