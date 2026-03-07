# ⚡ QUICK START (5 minutes)

## 1️⃣ Prerequisites
- Node.js 16+ (`node -v`)
- MongoDB running locally OR MongoDB Atlas account

## 2️⃣ Setup Backend

```bash
# Copy .env
cp .env.example .env

# Install dependencies
npm install

# Start backend (Terminal 1)
npm run dev
```

✅ Backend running on `http://localhost:5000`

---

## 3️⃣ Setup Frontend

```bash
# Rename package file
mv frontend-package.json package.json

# Install dependencies
npm install

# Start frontend (Terminal 2)
npm run dev
```

✅ Frontend running on `http://localhost:3000`

---

## 4️⃣ Test the App

1. **Open browser**: `http://localhost:3000`
2. **Sign up**: Use any phone number (e.g., 9876543210)
3. **Add customer**: Click "Add New Customer"
4. **Add invoice**: Click the blue button, fill form
5. **Send reminder**: Click "Remind" button (logs to console in dev mode)

---

## 🐳 OR Use Docker (Optional)

```bash
docker-compose up
```

This starts:
- MongoDB on port 27017
- Backend on port 5000
- Frontend on port 3000

---

## 📊 What's Included

✅ **Full-stack starter**
- Node.js + Express backend
- React + Vite frontend
- MongoDB schemas
- JWT authentication
- WhatsApp integration (local testing)
- Cron jobs for reminders

✅ **Mobile-first UI**
- Responsive design
- Large buttons & forms
- Fast on 3G

✅ **Production-ready**
- Environment variables
- Error handling
- Database indexing
- Security best practices

---

## 🎯 Next Steps

1. **Test core features** (customers, invoices)
2. **Customize UI** (colors, logo, text)
3. **Add WhatsApp** (connect your number)
4. **Add payment gateway** (Razorpay/Stripe)
5. **Deploy** (Heroku, Railway, Vercel)

---

## 🆘 Troubleshooting

### ❌ Cannot connect to MongoDB
```
Error: connect ECONNREFUSED
```
**Fix**: 
- Ensure MongoDB is running: `mongod`
- OR use MongoDB Atlas: Update MONGODB_URI in .env

### ❌ Port 5000/3000 already in use
```bash
lsof -ti:5000 | xargs kill -9  # Kill process on 5000
lsof -ti:3000 | xargs kill -9  # Kill process on 3000
```

### ❌ Dependencies not installing
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Full Documentation

- `README.md` - Complete guide
- `PROJECT_STRUCTURE.md` - File organization
- `server.js` - Backend code (well-commented)
- `App.jsx` - Frontend code (well-commented)

---

## 🚀 You're Ready!

Everything is set up. Go build something awesome. 💪
