# ✅ Setup Checklist

## 🚀 Before Running:

- [ ] Node.js installed (`node --version`)
- [ ] npm installed (`npm --version`)

## 📦 Backend Setup:

- [ ] Run `cd backend && npm install`
- [ ] Run `cd backend && npm run seed` (creates data folder)
- [ ] Check `backend/data/products.json` exists and has data
- [ ] Run `cd backend && npm run start:dev`
- [ ] Verify: See "Backend server running on http://localhost:3001"
- [ ] Test: Open `http://localhost:3001/products` in browser (should show JSON)

## 📦 Frontend Setup:

- [ ] Run `cd frontend && npm install`
- [ ] Make sure backend is running first!
- [ ] Run `cd frontend && npm run dev`
- [ ] Verify: See "Local: http://localhost:3000"
- [ ] Open browser: `http://localhost:3000`
- [ ] Check: Products should load (no error message)

## ✅ Everything Working?

- [ ] Backend running on port 3001
- [ ] Frontend running on port 3000
- [ ] Products displaying on homepage
- [ ] No error messages in browser console
- [ ] No error messages in backend terminal

## 🔍 If Something's Wrong:

1. **Check backend terminal** - Any errors?
2. **Check browser console** (F12) - Any errors?
3. **Verify ports** - Backend on 3001, Frontend on 3000
4. **Check data folder** - `backend/data/products.json` exists?
5. **Restart everything** - Close all terminals and start fresh

---

**Remember:** Backend MUST be running before frontend tries to load products!
