import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AdminFloatingButton.css';

const AdminFloatingButton = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Link to="/admin" className="admin-floating-btn" title="Back to Admin Panel">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
        <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <span>Admin</span>
    </Link>
  );
};

export default AdminFloatingButton;

