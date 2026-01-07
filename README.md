# Mini E-Commerce API + UI

A full-stack e-commerce application with React frontend and NestJS backend.

## Features

- **Products Management**: CRUD operations for products
- **Shopping Cart**: Add, update, and remove items from cart
- **Order Processing**: Create orders with stock and price validation
- **API Documentation**: Swagger/OpenAPI documentation built-in

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- Axios

### Backend
- NestJS
- TypeScript
- TypeORM
- MySQL
- Swagger/OpenAPI

## Prerequisites

- Node.js (v18 or higher)
- MySQL (v8 or higher)
- npm or yarn

## Setup Instructions

### 1. Database Setup

Create a MySQL database:

```sql
CREATE DATABASE mini_ecommerce;
```

Update the database credentials in `backend/src/app.module.ts` if needed:
- Default username: `root`
- Default password: `root`
- Default database: `mini_ecommerce`

### 2. Backend Setup

```bash
cd backend
npm install
npm run start:dev
```

The backend server will run on `http://localhost:3001`
- API endpoints: `http://localhost:3001`
- Swagger documentation: `http://localhost:3001/api`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Products
- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID
- `POST /products` - Create a new product
- `PATCH /products/:id` - Update a product
- `DELETE /products/:id` - Delete a product

### Cart
- `GET /cart` - Get all cart items
- `GET /cart/:id` - Get cart item by ID
- `POST /cart` - Add item to cart
- `PATCH /cart/:id` - Update cart item quantity
- `DELETE /cart/:id` - Remove item from cart
- `DELETE /cart` - Clear entire cart

### Orders
- `GET /orders` - Get all orders
- `GET /orders/:id` - Get order by ID
- `POST /orders` - Create a new order (checkout)
- `PATCH /orders/:id/status` - Update order status

## Validation Features

- **Stock Validation**: Prevents adding items to cart or placing orders when stock is insufficient
- **Price Validation**: Ensures prices are non-negative
- **Quantity Validation**: Ensures quantities are positive integers

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── products/       # Product module
│   │   ├── cart/           # Cart module
│   │   ├── orders/         # Order module
│   │   ├── app.module.ts   # Main app module
│   │   └── main.ts         # Application entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/          # React pages
│   │   ├── api/            # API client
│   │   └── App.tsx         # Main app component
│   └── package.json
└── README.md
```

## Usage

1. Start the MySQL database
2. Start the backend server (`npm run start:dev` in `backend/`)
3. Start the frontend server (`npm run dev` in `frontend/`)
4. Open `http://localhost:3000` in your browser
5. View API documentation at `http://localhost:3001/api`

### Seed Test Data (Optional)

To quickly populate the database with sample products:

```bash
cd backend
npm run seed
```

This will create 6 sample products with images and descriptions.

## Testing

For detailed testing instructions, see:
- **Quick Start**: `QUICK_START.md` - Fast testing guide
- **Complete Guide**: `TESTING_GUIDE.md` - Comprehensive testing instructions

### Quick Test Steps

1. **Seed data**: `cd backend && npm run seed`
2. **Start backend**: `npm run start:dev` (in `backend/`)
3. **Start frontend**: `npm run dev` (in `frontend/`)
4. **Test UI**: Open `http://localhost:3000` and browse products
5. **Test API**: Open `http://localhost:3001/api` for Swagger documentation

## Notes

- The database schema is automatically created using TypeORM's `synchronize: true` option (for development only)
- In production, set `synchronize: false` and use migrations
- CORS is enabled for `http://localhost:3000` - update in `backend/src/main.ts` if needed
