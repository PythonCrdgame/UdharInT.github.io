# 📁 Udhar Project Structure

```
udhar/
│
├── 📄 server.js                    # Express backend (main entry)
├── 📄 whatsapp-service.js          # WhatsApp integration (local testing)
├── 📄 package.json                 # Backend dependencies
├── 📄 .env.example                 # Environment variables template
│
├── 📄 App.jsx                      # React main component
├── 📄 main.jsx                     # React entry point
├── 📄 index.html                   # HTML template
├── 📄 vite.config.js               # Vite configuration
├── 📄 frontend-package.json        # Frontend dependencies (rename to package.json)
│
├── 🐳 docker-compose.yml           # Docker setup
├── 🐳 Dockerfile.backend           # Backend container
├── 🐳 Dockerfile.frontend          # Frontend container
│
├── 📖 README.md                    # Full documentation
├── 📄 setup.sh                     # Quick setup script
├── 📄 .gitignore                   # Git ignore rules
│
└── 📚 FUTURE ADDITIONS:
    ├── utils/
    │   ├── api.js                  # API client
    │   ├── auth.js                 # Auth helpers
    │   └── date.js                 # Date formatters
    ├── components/
    │   ├── CustomerCard.jsx        # Reusable components
    │   ├── Modal.jsx
    │   └── Header.jsx
    ├── pages/
    │   ├── Dashboard.jsx           # Page components
    │   ├── CustomerDetail.jsx
    │   └── Settings.jsx
    ├── models/                     # Move to separate folder later
    │   ├── User.js
    │   ├── Customer.js
    │   └── Transaction.js
    └── routes/                     # Move API routes later
        ├── auth.js
        ├── customers.js
        ├── transactions.js
        └── whatsapp.js
```

## 🚀 Current File Organization

**For MVP (NOW)**:
- Everything is in root or single files
- Focus on functionality over organization
- Simple to understand and debug

**When scaling (later)**:
- Split backend into `routes/`, `models/`, `controllers/`, `middlewares/`
- Split frontend into `components/`, `pages/`, `utils/`, `hooks/`
- Add `config/`, `tests/`, `docs/`

---

## 🔄 Development Workflow

### 1. Start Backend
```bash
npm run dev
# Runs: nodemon server.js
# Watches for changes and restarts automatically
```

### 2. Start Frontend
```bash
npm run dev --prefix .  # or rename frontend-package.json → package.json
# Runs: vite
# Hot reload on every file change
```

### 3. Make Changes
- Backend: Edit `server.js`, save → server restarts
- Frontend: Edit `App.jsx`, save → browser hot-reloads
- Database: MongoDB listens on port 27017

### 4. Test API
```bash
# Example: Create customer
curl -X POST http://localhost:5000/api/customers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "phone": "9876543210"}'
```

---

## 📝 Next Steps (After MVP)

1. **Refactor Backend Routes**
   - Move authentication to `routes/auth.js`
   - Move customer logic to `routes/customers.js`
   - Move transactions to `routes/transactions.js`

2. **Extract Components**
   - CustomerCard, Modal, Header (reusable)
   - Separate login page from dashboard

3. **Add PDF Generation**
   - Use `pdfkit` or `react-pdf` to generate invoices

4. **Meta Cloud API**
   - Replace `whatsapp-web.js` with official Meta API
   - Set up templates for compliance

5. **Database Optimization**
   - Add indexes on frequently queried fields
   - Denormalize more for performance

6. **Testing**
   - Unit tests with Jest
   - API tests with Supertest
   - E2E tests with Cypress

---

## 💾 Backup & Deployment

### Local Development
- Save frequently
- Use Git to track changes
- Commit before major changes

### Production Deployment
- Use MongoDB Atlas (managed)
- Deploy backend to Heroku, Railway, or Render
- Deploy frontend to Vercel or Netlify
- Use environment variables for secrets

---

Generated with ❤️ for rapid prototyping
