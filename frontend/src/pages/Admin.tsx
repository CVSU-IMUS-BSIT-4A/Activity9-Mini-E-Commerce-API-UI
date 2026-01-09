import { useEffect, useState } from 'react';
import { productsApi, cartApi, ordersApi, usersApi, Product, CartItem, Order, User } from '../api/api';
import Modal from '../components/Modal';
import './Admin.css';

type Tab = 'dashboard' | 'products' | 'cart' | 'orders' | 'accounts';

interface AdminProps {
  activeTab?: Tab;
  onTabChange?: (tab: Tab) => void;
  onStatsUpdate?: (stats: { products: number; cartItems: number; orders: number; users: number }) => void;
}

const Admin = ({ activeTab: propActiveTab = 'dashboard', onTabChange, onStatsUpdate }: AdminProps) => {
  const [activeTab, setActiveTab] = useState<Tab>(propActiveTab);
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Product management
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    imageUrl: '',
  });

  // Order status update
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    setActiveTab(propActiveTab);
  }, [propActiveTab]);

  useEffect(() => {
    if (activeTab !== 'dashboard') {
      loadData();
    } else {
      // Refresh all data when switching to dashboard
      loadAllData();
    }
  }, [activeTab]);

  // Update parent component when tab changes internally
  useEffect(() => {
    if (onTabChange) {
      onTabChange(activeTab);
    }
  }, [activeTab, onTabChange]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [productsRes, cartRes, ordersRes, usersRes] = await Promise.all([
        productsApi.getAll(),
        cartApi.getAll(),
        ordersApi.getAll(),
        usersApi.getAll(),
      ]);
      
      setProducts(productsRes.data);
      setCartItems(cartRes.data);
      setOrders(ordersRes.data);
      setUsers(usersRes.data);
      
      // Update stats for dropdown
      if (onStatsUpdate) {
        onStatsUpdate({
          products: productsRes.data.length,
          cartItems: cartRes.data.length,
          orders: ordersRes.data.length,
          users: usersRes.data.length,
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (activeTab === 'products') {
        const response = await productsApi.getAll();
        setProducts(response.data);
      } else if (activeTab === 'cart') {
        const response = await cartApi.getAll();
        setCartItems(response.data);
      } else if (activeTab === 'orders') {
        const response = await ordersApi.getAll();
        setOrders(response.data);
      } else if (activeTab === 'accounts') {
        const response = await usersApi.getAll();
        setUsers(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: '', description: '', price: '', stock: '', imageUrl: '' });
    setShowProductModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      imageUrl: product.imageUrl || '',
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        imageUrl: productForm.imageUrl || undefined,
      };

      if (editingProduct) {
        await productsApi.update(editingProduct.id, productData);
      } else {
        await productsApi.create(productData);
      }
      
      setShowProductModal(false);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await productsApi.delete(id);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    
    try {
      await ordersApi.updateStatus(selectedOrder.id, newStatus);
      setShowStatusModal(false);
      setSelectedOrder(null);
      setNewStatus('');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleOpenStatusModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowStatusModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#ffc107';
      case 'completed':
        return '#28a745';
      case 'cancelled':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  // Calculate dashboard statistics
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status.toLowerCase() === 'pending').length;
  const completedOrders = orders.filter(o => o.status.toLowerCase() === 'completed').length;
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock < 10).length;
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading && activeTab === 'dashboard') {
    return <div className="admin-loading">Loading admin data...</div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Admin Dashboard</h1>
        <p className="admin-subtitle">Manage products, cart items, and orders</p>
      </div>


      {error && (
        <div className="admin-error">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="admin-content">
        {activeTab === 'dashboard' && (
          <div className="admin-dashboard">
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-icon revenue">₱</div>
                <div className="stat-info">
                  <h3>Total Revenue</h3>
                  <p className="stat-value">₱{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon orders">📦</div>
                <div className="stat-info">
                  <h3>Total Orders</h3>
                  <p className="stat-value">{totalOrders}</p>
                  <p className="stat-detail">{completedOrders} completed, {pendingOrders} pending</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon products">🛍️</div>
                <div className="stat-info">
                  <h3>Total Products</h3>
                  <p className="stat-value">{totalProducts}</p>
                  <p className="stat-detail">{lowStockProducts} low stock</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon cart">🛒</div>
                <div className="stat-info">
                  <h3>Cart Items</h3>
                  <p className="stat-value">{totalCartItems}</p>
                  <p className="stat-detail">{cartItems.length} active carts</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon users">👥</div>
                <div className="stat-info">
                  <h3>Total Users</h3>
                  <p className="stat-value">{users.length}</p>
                  <p className="stat-detail">{users.filter(u => !!(u.address && u.contactNumber && u.city && u.postalCode)).length} complete profiles</p>
                </div>
              </div>
            </div>

            <div className="dashboard-sections">
              <div className="dashboard-section">
                <h2>Recent Orders</h2>
                <div className="dashboard-table-container">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id}>
                          <td>#{order.id}</td>
                          <td>{order.items.length} item(s)</td>
                          <td>₱{Number(order.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td>
                            <span
                              className="admin-status-badge"
                              style={{ backgroundColor: getStatusColor(order.status) }}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {orders.length === 0 && (
                    <div className="admin-empty">No orders yet</div>
                  )}
                </div>
                {orders.length > 5 && (
                  <button className="admin-btn-view-all" onClick={() => setActiveTab('orders')}>
                    View All Orders →
                  </button>
                )}
              </div>

              <div className="dashboard-section">
                <h2>Low Stock Products</h2>
                <div className="dashboard-table-container">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Stock</th>
                        <th>Price</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.filter(p => p.stock < 10).slice(0, 5).map((product) => (
                        <tr key={product.id}>
                          <td>{product.name}</td>
                          <td>
                            <span className={`admin-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                              {product.stock}
                            </span>
                          </td>
                          <td>₱{Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td>
                            <button
                              className="admin-btn-edit"
                              onClick={() => {
                                setActiveTab('products');
                                setTimeout(() => handleEditProduct(product), 100);
                              }}
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {lowStockProducts === 0 && (
                    <div className="admin-empty">All products have sufficient stock</div>
                  )}
                </div>
                {lowStockProducts > 5 && (
                  <button className="admin-btn-view-all" onClick={() => setActiveTab('products')}>
                    View All Products →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <h2>Products Management</h2>
              <button className="admin-btn-primary" onClick={handleCreateProduct}>
                + Add Product
              </button>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td>
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="admin-product-image" />
                        ) : (
                          <div className="admin-product-placeholder">📦</div>
                        )}
                      </td>
                      <td>{product.name}</td>
                      <td className="admin-description-cell">{product.description}</td>
                      <td>₱{Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td>
                        <span className={`admin-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td>
                        <div className="admin-actions">
                          <button
                            className="admin-btn-edit"
                            onClick={() => handleEditProduct(product)}
                          >
                            Edit
                          </button>
                          <button
                            className="admin-btn-delete"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && (
                <div className="admin-empty">No products found</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'cart' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <h2>Cart Items</h2>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product ID</th>
                    <th>Quantity</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.productId}</td>
                      <td>{item.quantity}</td>
                      <td>{new Date(item.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {cartItems.length === 0 && (
                <div className="admin-empty">No cart items found</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <h2>Purchases Management</h2>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                      <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Items</th>
                        <th>Total Amount</th>
                        <th>Status</th>
                        <th>Delivery Date</th>
                        <th>Created At</th>
                        <th>Actions</th>
                      </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const orderUser = users.find(u => u.id === order.userId);
                    return (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>
                          {orderUser ? (
                            <div className="admin-user-info">
                              <div className="admin-user-name">{orderUser.name}</div>
                              <div className="admin-user-email">{orderUser.email}</div>
                            </div>
                          ) : (
                            <span className="admin-user-unknown">User #{order.userId}</span>
                          )}
                        </td>
                        <td>
                          <div className="admin-order-items">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="admin-order-item">
                                {item.productName} (x{item.quantity}) - ₱{Number(item.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td>₱{Number(order.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td>
                          <span
                            className="admin-status-badge"
                            style={{ backgroundColor: getStatusColor(order.status) }}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td>
                          {order.deliveryDate ? (
                            new Date(order.deliveryDate).toLocaleDateString()
                          ) : (
                            <span className="admin-text-muted">N/A</span>
                          )}
                        </td>
                        <td>{new Date(order.createdAt).toLocaleString()}</td>
                        <td>
                          <button
                            className="admin-btn-edit"
                            onClick={() => handleOpenStatusModal(order)}
                          >
                            Update Status
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {orders.length === 0 && (
                <div className="admin-empty">No orders found</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'accounts' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <h2>User Accounts Management</h2>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Contact</th>
                    <th>City</th>
                    <th>Postal Code</th>
                    <th>Account Status</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const isComplete = !!(user.address && user.contactNumber && user.city && user.postalCode);
                    return (
                      <tr key={user.id}>
                        <td>#{user.id}</td>
                        <td className="admin-user-name-cell">{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.address || <span className="admin-text-muted">Not set</span>}</td>
                        <td>{user.contactNumber || <span className="admin-text-muted">Not set</span>}</td>
                        <td>{user.city || <span className="admin-text-muted">Not set</span>}</td>
                        <td>{user.postalCode || <span className="admin-text-muted">Not set</span>}</td>
                        <td>
                          <span className={`admin-status-badge ${isComplete ? 'completed' : 'incomplete'}`} style={{ 
                            backgroundColor: isComplete ? '#28a745' : '#ffc107' 
                          }}>
                            {isComplete ? 'Complete' : 'Incomplete'}
                          </span>
                        </td>
                        <td>{new Date((user as any).createdAt || Date.now()).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="admin-empty">No users found</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      <Modal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        title={editingProduct ? 'Edit Product' : 'Create Product'}
        type="form"
        size="medium"
      >
        <form onSubmit={handleSaveProduct} className="admin-form">
          <div className="admin-form-group">
            <label>Product Name *</label>
            <input
              type="text"
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              required
            />
          </div>
          <div className="admin-form-group">
            <label>Description *</label>
            <textarea
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              required
              rows={4}
            />
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Price (₱) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                required
              />
            </div>
            <div className="admin-form-group">
              <label>Stock *</label>
              <input
                type="number"
                min="0"
                value={productForm.stock}
                onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="admin-form-group">
            <label>Image URL</label>
            <input
              type="text"
              value={productForm.imageUrl}
              onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
              placeholder="/images/products/product.jpg"
            />
          </div>
          <div className="admin-form-actions">
            <button type="button" onClick={() => setShowProductModal(false)} className="admin-btn-cancel">
              Cancel
            </button>
            <button type="submit" className="admin-btn-primary">
              {editingProduct ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Order Status Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Order Status"
        type="form"
        size="small"
      >
        {selectedOrder && (
          <div className="admin-form">
            <div className="admin-form-group">
              <label>Order ID: {selectedOrder.id}</label>
              <label>Current Status: {selectedOrder.status}</label>
            </div>
            <div className="admin-form-group">
              <label>New Status *</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                required
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="admin-form-actions">
              <button type="button" onClick={() => setShowStatusModal(false)} className="admin-btn-cancel">
                Cancel
              </button>
              <button type="button" onClick={handleUpdateOrderStatus} className="admin-btn-primary">
                Update Status
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Admin;

