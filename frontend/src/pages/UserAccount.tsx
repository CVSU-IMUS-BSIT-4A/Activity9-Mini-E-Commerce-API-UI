import { useEffect, useState } from 'react';
import { useUserAuth } from '../contexts/UserAuthContext';
import { usersApi, ordersApi, User, Order } from '../api/api';
import Modal from '../components/Modal';
import './UserAccount.css';

const UserAccount = () => {
  const { user, updateUser, refreshUser, isAccountComplete } = useUserAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    contactNumber: '',
    city: '',
    postalCode: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [userResponse, ordersResponse] = await Promise.all([
        usersApi.getById(user.id),
        ordersApi.getByUserId(user.id),
      ]);
      setFormData({
        name: userResponse.data.name || '',
        email: userResponse.data.email || '',
        address: userResponse.data.address || '',
        contactNumber: userResponse.data.contactNumber || '',
        city: userResponse.data.city || '',
        postalCode: userResponse.data.postalCode || '',
      });
      setOrders(ordersResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load account data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setError('');
    setSuccess('');

    try {
      await updateUser({
        name: formData.name,
        email: formData.email,
        address: formData.address,
        contactNumber: formData.contactNumber,
        city: formData.city,
        postalCode: formData.postalCode,
      });
      setSuccess('Profile updated successfully!');
      setShowEditModal(false);
      await refreshUser();
      await loadUserData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#ffc107';
      case 'processing': return '#007bff';
      case 'completed': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const handleDeleteClick = (orderId: number) => {
    setOrderToDelete(orderId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;
    
    try {
      setDeleting(true);
      await ordersApi.delete(orderToDelete);
      setSuccess('Order deleted successfully!');
      await loadUserData();
      setShowDeleteModal(false);
      setOrderToDelete(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete order');
      setTimeout(() => setError(''), 3000);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setOrderToDelete(null);
  };

  if (loading) {
    return <div className="user-account-loading">Loading account...</div>;
  }

  if (!user) {
    return <div className="user-account-error">Please login to view your account</div>;
  }

  const accountComplete = isAccountComplete();

  return (
    <div className="user-account-page">
      <div className="user-account-header">
        <h1>My Account</h1>
        <button className="edit-profile-btn" onClick={() => setShowEditModal(true)}>
          Edit Profile
        </button>
      </div>

      {error && (
        <div className="form-error" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="form-success" style={{ marginBottom: '1rem' }}>
          {success}
        </div>
      )}

      <div className="account-sections">
        {/* Profile Section */}
        <div className="account-section">
          <h2>Profile Information</h2>
          <div className="profile-info">
            <div className="info-row">
              <span className="info-label">Name:</span>
              <span className="info-value">{user.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{user.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Address:</span>
              <span className="info-value">{user.address || 'Not set'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Contact Number:</span>
              <span className="info-value">{user.contactNumber || 'Not set'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">City:</span>
              <span className="info-value">{user.city || 'Not set'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Postal Code:</span>
              <span className="info-value">{user.postalCode || 'Not set'}</span>
            </div>
          </div>
          {!accountComplete && (
            <div className="account-incomplete-warning">
              <p>⚠️ Please complete your profile to proceed with checkout.</p>
              <p>Required: Address, Contact Number, City, and Postal Code</p>
            </div>
          )}
        </div>

        {/* Orders Section */}
        <div className="account-section">
          <h2>Order History & Tracking</h2>
          {orders.length === 0 ? (
            <div className="no-orders">
              <p>You haven't placed any orders yet.</p>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-id">
                      <span className="order-label">Order ID:</span>
                      <span className="order-value">#{order.id}</span>
                    </div>
                    <div className="order-status">
                      <span 
                        className="status-badge" 
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="order-items">
                    <h4>Items:</h4>
                    <ul>
                      {order.items.map((item, index) => (
                        <li key={index}>
                          {item.productName} × {item.quantity} - ₱{Number(item.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="order-footer">
                    <div className="order-total">
                      <span className="total-label">Total Amount:</span>
                      <span className="total-value">
                        ₱{Number(order.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="order-dates">
                      <div className="order-date">
                        <span className="date-label">Order Date:</span>
                        <span className="date-value">{formatDate(order.createdAt)}</span>
                      </div>
                      {order.deliveryDate && (
                        <div className="order-date">
                          <span className="date-label">Estimated Delivery:</span>
                          <span className="date-value">{formatDate(order.deliveryDate)}</span>
                        </div>
                      )}
                    </div>
                    <div className="order-actions">
                      <button
                        className="delete-order-btn"
                        onClick={() => handleDeleteClick(order.id)}
                        title="Delete Order"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Delete Order
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Profile"
        type="form"
        size="large"
      >
        <form onSubmit={handleUpdateProfile} className="profile-form">
          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">{success}</div>}
          
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Address *</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter your complete address"
              required
            />
          </div>

          <div className="form-group">
            <label>Contact Number *</label>
            <input
              type="text"
              value={formData.contactNumber}
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              placeholder="09XXXXXXXXX"
              required
            />
          </div>

          <div className="form-group">
            <label>City *</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Enter your city"
              required
            />
          </div>

          <div className="form-group">
            <label>Postal Code *</label>
            <input
              type="text"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              placeholder="Enter postal code"
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        title="Delete Order"
        type="form"
        size="small"
      >
        <div className="delete-confirmation">
          <p style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
            Are you sure you want to delete Order #{orderToDelete}?
          </p>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            This action cannot be undone.
          </p>
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={handleCancelDelete}
              disabled={deleting}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="delete-confirm-btn" 
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Order'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserAccount;

