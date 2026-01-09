import { ReactNode, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AdminLayout.css';

interface AdminLayoutProps {
  children: ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  stats?: {
    products: number;
    cartItems: number;
    orders: number;
    users: number;
  };
}

const AdminLayout = ({ children, activeTab: propActiveTab = 'dashboard', onTabChange, stats }: AdminLayoutProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showNavDropdown, setShowNavDropdown] = useState(false);
  const activeTab = propActiveTab;

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleNavSelect = (tab: string) => {
    setShowNavDropdown(false);
    if (onTabChange) {
      onTabChange(tab);
    }
    // Prevent any navigation
    return false;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showNavDropdown && !target.closest('.admin-nav-dropdown')) {
        setShowNavDropdown(false);
      }
    };

    if (showNavDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showNavDropdown]);

  return (
    <div className="admin-layout">
      <header className="admin-header-nav">
        <div className="admin-header-container">
          <Link to="/admin" className="admin-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>Admin Panel</span>
          </Link>
          <div className="admin-header-actions">
            <div className="admin-nav-dropdown">
              <button 
                className="admin-nav-dropdown-btn"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowNavDropdown(!showNavDropdown);
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="dropdown-arrow">
                  <polyline points="6 9 12 15 18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {showNavDropdown && (
                <div className="admin-nav-dropdown-menu">
                  <button 
                    className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => handleNavSelect('dashboard')}
                  >
                    Dashboard
                  </button>
                  <button 
                    className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
                    onClick={() => handleNavSelect('products')}
                  >
                    Products {stats && `(${stats.products})`}
                  </button>
                  <button 
                    className={`admin-nav-item ${activeTab === 'cart' ? 'active' : ''}`}
                    onClick={() => handleNavSelect('cart')}
                  >
                    Cart Items {stats && `(${stats.cartItems})`}
                  </button>
                  <button 
                    className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => handleNavSelect('orders')}
                  >
                    Purchases {stats && `(${stats.orders})`}
                  </button>
                  <button 
                    className={`admin-nav-item ${activeTab === 'accounts' ? 'active' : ''}`}
                    onClick={() => handleNavSelect('accounts')}
                  >
                    Accounts {stats && `(${stats.users})`}
                  </button>
                </div>
              )}
            </div>
            <Link to="/" className="admin-header-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="15 3 21 3 21 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              View Store
            </Link>
            <button onClick={handleLogout} className="admin-logout-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="admin-layout-main">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;

