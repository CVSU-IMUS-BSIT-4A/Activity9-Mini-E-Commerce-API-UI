# Activity9 - Mini E-Commerce API & UI

A full-stack mini e-commerce application with React frontend and NestJS backend. **No database required!** All data is stored in JSON files, making it easy to run without XAMPP or MySQL.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup Instructions

#### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Seed initial data (creates JSON files in data/ folder)
npm run seed

# Start the backend server
npm run start:dev
```

The backend will run on `http://localhost:3001` (or port specified in main.ts)

#### 2. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
Activity9-Mini-E-Commerce-API-UI/
├── backend/
│   ├── src/
│   │   ├── products/      # Product management
│   │   ├── users/          # User management
│   │   ├── cart/           # Shopping cart
│   │   ├── orders/         # Order management
│   │   ├── storage/        # File-based storage service
│   │   └── scripts/        # Seed scripts
│   └── data/               # JSON data files (created automatically)
│       ├── products.json
│       ├── users.json
│       ├── cart_items.json
│       └── orders.json
└── frontend/
    ├── src/
    │   ├── pages/          # React pages
    │   ├── components/     # Reusable components
    │   ├── contexts/       # React contexts
    │   └── api/            # API client
    └── public/
        └── images/         # Product images
```

## 🎯 Features

- ✅ **No Database Required** - Uses JSON file storage
- ✅ **Product Management** - CRUD operations for products
- ✅ **Shopping Cart** - Add, update, remove items
- ✅ **Order Management** - Create and track orders
- ✅ **User Management** - User registration and authentication
- ✅ **Admin Panel** - Manage products and orders
- ✅ **Responsive Design** - Works on all devices

## 🔐 Admin Credentials

- **Email:** `Admin@gmail.com`
- **Password:** `Admin123`

## 📝 API Endpoints

### Products
- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID
- `POST /products` - Create product
- `PATCH /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user
- `POST /users/login` - User login
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Cart
- `GET /cart` - Get all cart items
- `GET /cart/:id` - Get cart item by ID
- `POST /cart` - Add item to cart
- `PATCH /cart/:id` - Update cart item
- `DELETE /cart/:id` - Remove cart item
- `DELETE /cart` - Clear entire cart

### Orders
- `GET /orders` - Get all orders
- `GET /orders/:id` - Get order by ID
- `GET /orders/user/:userId` - Get orders by user
- `POST /orders` - Create order
- `PATCH /orders/:id/status` - Update order status
- `DELETE /orders/:id` - Delete order

## 🗄️ Data Storage

All data is stored in JSON files in the `backend/data/` directory:
- `products.json` - Product catalog
- `users.json` - User accounts
- `cart_items.json` - Shopping cart items
- `orders.json` - Order history

These files are created automatically when you run the seed script or when the application starts.

## 🛠️ Development

### Backend Commands
```bash
npm run start:dev    # Start development server with hot reload
npm run build        # Build for production
npm run start:prod   # Start production server
npm run seed         # Seed initial data
```

### Frontend Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 📦 Technologies Used

### Backend
- NestJS
- TypeScript
- File-based JSON storage (no database!)

### Frontend
- React
- TypeScript
- Vite
- React Router
- Axios

## 🎨 Features

- Modern, responsive UI
- Product catalog with images
- Shopping cart functionality
- Order management
- Admin panel
- User authentication
- Local storage for cart persistence

## 📝 Notes

- No XAMPP or MySQL needed!
- All data persists in JSON files
- Easy to share and run on any machine
- Perfect for development and testing

## 🐛 Troubleshooting

### Backend won't start
- Make sure you've run `npm install` in the backend directory
- Check if port 3001 is available
- Run `npm run seed` to create initial data files

### Frontend won't start
- Make sure you've run `npm install` in the frontend directory
- Check if port 3000 is available
- Make sure the backend is running

### Data not showing
- Run `npm run seed` in the backend directory
- Check if `backend/data/` folder exists
- Verify JSON files are created correctly

## 📄 License

This project is for educational purposes.

---

**Happy Coding! 🚀**
