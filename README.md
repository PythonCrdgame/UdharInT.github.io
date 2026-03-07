# 📝 Udhar - Small Business Invoice Tracker

A mobile-first web app for small business owners and freelancers to track invoices, payments, and send WhatsApp reminders.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB (local or Atlas)
- (Optional) WhatsApp account for testing reminders

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

Server runs on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App runs on `http://localhost:3000`

---

## 📱 Features

### ✅ Core Features (MVP)
- **Authentication**: Sign up / Login with phone number
- **Customer Management**: Add, view, edit, delete customers
- **Invoices & Payments**: Track what customers owe
- **Dashboard**: Real-time summary of total pending amount
- **Mobile-First UI**: Responsive design optimized for phones

### 🔄 Phase 2 Features
- **WhatsApp Reminders**: Send payment reminders via WhatsApp
- **PDF Invoices**: Generate and download invoices
- **Recurring Invoices**: For teachers/tutors with monthly fees
- **Payment Gateway**: Razorpay/Stripe integration

---

## 🏗️ Architecture

### Backend Stack
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose ODM
- **Auth**: JWT (JSON Web Tokens)
- **Scheduling**: node-cron for automatic reminders
- **WhatsApp**: whatsapp-web.js (testing) → Meta Cloud API (production)

### Frontend Stack
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Icons**: lucide-react
- **State**: React Context API
- **Build**: Vite (lightning-fast HMR)

### Database Schema

#### User
```javascript
{
  name: String,
  businessName: String,
  phoneNumber: String (unique),
  email: String (unique),
  password: String (hashed),
  subscription: {
    plan: String ('free', 'pro'),
    expiresAt: Date
  },
  createdAt: Date
}
```

#### Customer
```javascript
{
  userId: ObjectId (ref: User),
  name: String,
  phone: String (for WhatsApp),
  totalPending: Number,
  notes: String,
  createdAt: Date
}
```

#### Transaction
```javascript
{
  userId: ObjectId (ref: User),
  customerId: ObjectId (ref: Customer),
  type: Enum ['invoice', 'payment_received'],
  amount: Number,
  description: String,
  dueDate: Date,
  status: Enum ['pending', 'paid', 'overdue'],
  createdAt: Date
}
```

---

## 📡 API Routes

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Sign in

### Customers
- `GET /api/customers` - List all customers
- `POST /api/customers` - Add new customer
- `GET /api/customers/:id` - Get customer details + transactions
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Transactions
- `GET /api/transactions` - List all transactions
- `POST /api/transactions` - Add invoice or payment
- `PUT /api/transactions/:id` - Update transaction status

### Dashboard
- `GET /api/dashboard` - Get summary (total pending, customer count)

### WhatsApp
- `POST /api/whatsapp/send` - Send custom message
- `POST /api/whatsapp/send-reminder` - Send payment reminder

---

## 💬 WhatsApp Integration

### Option A: Local Testing (Development)
Uses `whatsapp-web.js` to send messages via your personal WhatsApp Web session.

**Pros**: Quick to test, no API setup needed
**Cons**: High ban risk, not for production, requires active WhatsApp session

**Setup**:
1. Uncomment the WhatsApp service in `server.js`
2. Run the server and scan the QR code with WhatsApp
3. Messages will be sent through your WhatsApp account

### Option B: Meta Cloud API (Production)
Official WhatsApp Business API. Requires verification.

**Pros**: Production-safe, scalable, templates for compliance
**Cons**: Requires business registration, conversation-based pricing

**Setup Steps** (for later):
1. Create Meta Business Manager account
2. Get verified through a Business Service Provider (BSP) like WATI or Interakt
3. Create message templates (e.g., "payment_reminder")
4. Update `/api/whatsapp/send` route to call Meta API

---

## 🔐 Security

- Passwords are hashed with bcrypt (salt rounds: 10)
- JWT tokens expire in 30 days
- All API routes (except auth) require valid JWT token
- CORS enabled for localhost development

### For Production:
- Use HTTPS only
- Set secure JWT secret (min 32 characters)
- Enable MongoDB authentication
- Use environment variables for all secrets
- Validate and sanitize all inputs

---

## 📊 Testing the App

### Create Test Account
```
Phone: 9876543210 (any 10-digit number)
Password: Test@123
Business: Test Shop
```

### Test Workflow
1. Sign up → you get JWT token
2. Add customer → name, phone (for WhatsApp later)
3. Add invoice → amount, due date
4. Click "Remind via WhatsApp" → logs message (dev mode)
5. Mark invoice as paid → updates customer's pending amount

---

## 🎯 Roadmap

### Week 1-2: Foundation ✅
- Node.js + Express backend
- MongoDB schemas
- JWT authentication
- Basic customer CRUD

### Week 3: Core Tracking ⏳
- Transaction management
- Dashboard with pending amounts
- Customer detail pages

### Week 4: WhatsApp + Invoices
- WhatsApp reminders (local testing)
- PDF invoice generation
- Cron job for daily reminders

### Week 5: Polish + Launch
- UI/UX refinements
- Razorpay integration (optional)
- Beta testing with real users

---

## 🐛 Common Issues

### MongoDB Connection Error
```
Error: connect ECONNREFUSED
```
- Ensure MongoDB is running: `mongod` or use MongoDB Atlas
- Check MONGODB_URI in .env

### WhatsApp QR Code Not Showing
```
Client not initializing
```
- Ensure Puppeteer dependencies are installed
- Check Node.js version (use 16+)
- Try clearing `.wwebjs_auth` folder

### Port 5000/3000 Already in Use
```bash
# Kill the process using the port
lsof -ti:5000 | xargs kill -9
```

### JWT Token Expired
- Token expires in 30 days. Login again to refresh.
- Update `expiresIn` in `server.js` to change duration.

---

## 📝 Notes

- **Phone Numbers**: Store in format: 10 digits (India) or country-specific
- **WhatsApp**: Always use verified templates for production
- **Denormalization**: `Customer.totalPending` is denormalized for speed. Keep it in sync when transactions change.
- **Compliance**: Users must opt-in to receive WhatsApp messages.

---

## 📞 Support

For issues or feature requests:
1. Check the FAQ section
2. Review GitHub issues
3. Create a new issue with details

---

## 📄 License

MIT - Free to use and modify.

---

**Built with ❤️ for small business owners**
