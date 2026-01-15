# 🔧 Troubleshooting Guide

## ❌ Error: "Failed to Load Products" or "Products endpoint not found"

### ✅ Quick Fix:

1. **Make sure backend is running:**
   ```bash
   cd backend
   npm run start:dev
   ```
   You should see: `Backend server running on http://localhost:3001`

2. **Run seed script to create data files:**
   ```bash
   cd backend
   npm run seed
   ```
   This creates the `data/` folder with `products.json` file.

3. **Check if backend is accessible:**
   - Open browser: `http://localhost:3001/products`
   - Should return JSON array of products
   - Or check Swagger: `http://localhost:3001/api`

4. **Verify frontend is running:**
   ```bash
   cd frontend
   npm run dev
   ```

### 🔍 Common Issues:

#### Issue 1: Backend won't start
**Error:** Module not found, compilation errors

**Solution:**
```bash
cd backend
npm install
npm run build
npm run start:dev
```

#### Issue 2: Data folder doesn't exist
**Error:** Cannot read products

**Solution:**
```bash
cd backend
npm run seed
```

#### Issue 3: Port already in use
**Error:** EADDRINUSE: address already in use :::3001

**Solution:**
- Close other instances
- Or change port in `backend/src/main.ts`

#### Issue 4: CORS errors
**Error:** CORS policy blocked

**Solution:**
- Backend CORS is already configured for `http://localhost:3000`
- Make sure frontend runs on port 3000
- Or update `FRONTEND_URL` in backend `.env` file

#### Issue 5: Products.json is empty
**Error:** No products showing

**Solution:**
```bash
cd backend
npm run seed
```
This will populate the products.json file with 27 products.

### 🧪 Testing Steps:

1. **Test Backend:**
   ```bash
   # Terminal 1
   cd backend
   npm run start:dev
   ```

2. **Test API endpoint:**
   - Open: `http://localhost:3001/products`
   - Should see JSON array

3. **Test Frontend:**
   ```bash
   # Terminal 2
   cd frontend
   npm run dev
   ```

4. **Open browser:**
   - Go to: `http://localhost:3000`
   - Products should load

### 📁 File Structure Check:

Make sure you have:
```
backend/
├── data/
│   ├── products.json    ← Must exist with data
│   ├── users.json
│   ├── cart_items.json
│   └── orders.json
└── src/
    └── ...
```

### 🚨 Still Not Working?

1. **Clear and restart:**
   ```bash
   # Stop all servers (Ctrl+C)
   
   # Backend
   cd backend
   npm run seed
   npm run start:dev
   
   # Frontend (new terminal)
   cd frontend
   npm run dev
   ```

2. **Check console errors:**
   - Browser DevTools (F12) → Console tab
   - Backend terminal for errors

3. **Verify ports:**
   - Backend: `http://localhost:3001`
   - Frontend: `http://localhost:3000`

### ✅ Success Indicators:

- ✅ Backend terminal shows: `Backend server running on http://localhost:3001`
- ✅ Browser `http://localhost:3001/products` shows JSON
- ✅ Frontend loads without errors
- ✅ Products display correctly

---

**Need more help?** Check the README.md for full setup instructions.
