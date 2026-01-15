# ⚡ Quick Start (Tagalog)

## 🚀 Para ma-run ang application:

### Option 1: Gamit ang Batch Files (Pinakamadali!)

1. **Double-click `start-backend.bat`**
   - Mag-o-open ng terminal
   - Auto-check kung may data folder
   - Auto-run seed kung wala
   - Start backend server

2. **Double-click `start-frontend.bat`** (sa bagong terminal o bukas ulit)
   - Start frontend server

3. **Open browser:** `http://localhost:3000`

### Option 2: Manual (Terminal Commands)

#### Step 1: Start Backend
```bash
cd backend
npm run seed        # First time lang, o kung walang data
npm run start:dev
```

✅ Dapat makita mo: `Backend server running on http://localhost:3001`

#### Step 2: Start Frontend (New Terminal)
```bash
cd frontend
npm run dev
```

✅ Dapat makita mo: `Local: http://localhost:3000`

#### Step 3: Open Browser
- Go to: `http://localhost:3000`
- Products dapat makita mo na!

## ✅ Checklist:

- [ ] Backend terminal nag-run (walang errors)
- [ ] Frontend terminal nag-run (walang errors)  
- [ ] Browser nag-open sa `http://localhost:3000`
- [ ] Products nakikita mo
- [ ] Walang error sa console

## ❌ Kung may Error:

### "Failed to Load Products"
1. Check kung backend ay running: `http://localhost:3001/products`
2. Kung walang response, i-restart ang backend
3. Run `npm run seed` kung walang data

### "Cannot connect to server"
1. Siguraduhin backend ay running sa port 3001
2. Check terminal ng backend kung may errors
3. I-restart ang backend

### "Products endpoint not found"
1. Backend hindi running
2. Run `cd backend && npm run start:dev`
3. Wait hanggang makita mo ang "Backend server running"

## 🔐 Admin Login:

- **Email:** `Admin@gmail.com`
- **Password:** `Admin123`

## 📝 Important Notes:

- ✅ **Hindi kailangan ng XAMPP!**
- ✅ Data ay naka-save sa `backend/data/` folder
- ✅ Pag nag-restart, naka-save pa rin ang data
- ✅ Para mag-reset, i-delete ang `backend/data/` folder at i-run ulit ang seed

---

**Happy coding! 🎉**
