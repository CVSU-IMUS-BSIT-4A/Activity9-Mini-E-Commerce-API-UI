# 🚀 Quick Setup Guide

## Walang XAMPP na Kailangan! ✅

Ang application na ito ay gumagamit ng **JSON file storage** - hindi na kailangan ng MySQL o XAMPP!

## 📋 Steps para ma-run:

### 1. Backend Setup

```bash
# Pumunta sa backend folder
cd backend

# Install dependencies (first time lang)
npm install

# Seed data (gumagawa ng JSON files)
npm run seed

# Start backend server
npm run start:dev
```

✅ Backend ay mag-run sa: `http://localhost:3001`

### 2. Frontend Setup (New Terminal)

```bash
# Pumunta sa frontend folder
cd frontend

# Install dependencies (first time lang)
npm install

# Start frontend
npm run dev
```

✅ Frontend ay mag-run sa: `http://localhost:3000`

## 🎯 Admin Login

- **Email:** `Admin@gmail.com`
- **Password:** `Admin123`

## 📁 Data Storage

Lahat ng data ay naka-save sa JSON files sa `backend/data/` folder:
- `products.json` - Products
- `users.json` - Users
- `cart_items.json` - Cart items
- `orders.json` - Orders

**Hindi na kailangan:**
- ❌ XAMPP
- ❌ MySQL
- ❌ Database setup
- ❌ Database configuration

**Kailangan lang:**
- ✅ Node.js
- ✅ npm install
- ✅ npm run seed (first time)
- ✅ npm run start:dev / npm run dev

## 🔄 Para sa ibang tao na mag-run:

1. `cd backend && npm install && npm run seed && npm run start:dev`
2. `cd frontend && npm install && npm run dev`
3. Open `http://localhost:3000`

**Yun lang!** Walang database setup na kailangan! 🎉

## 💡 Tips

- Kapag nag-restart ng backend, naka-save pa rin lahat ng data sa JSON files
- Para mag-reset ng data, i-delete ang `backend/data/` folder at i-run ulit ang `npm run seed`
- Lahat ng changes ay automatic na naka-save sa JSON files

---

**Enjoy coding! 🚀**
