import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cron from 'node-cron';

dotenv.config();
// Optional: Uncomment if using whatsapp-web.js for local testing
// const { initWhatsAppClient, sendWhatsAppMessage, getWhatsAppStatus } = require('./whatsapp-service');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/udhar', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ============ SCHEMAS ============

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  businessName: String,
  phoneNumber: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  subscription: {
    plan: { type: String, default: 'free' }, // free, pro
    expiresAt: Date,
  },
  createdAt: { type: Date, default: Date.now },
});

// Customer Schema
const customerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  phone: String,
  totalPending: { type: Number, default: 0 },
  notes: String,
  createdAt: { type: Date, default: Date.now },
});

// Transaction Schema (Invoice + Payment)
const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  type: { type: String, enum: ['invoice', 'payment_received'], required: true },
  amount: Number,
  description: String,
  dueDate: Date,
  status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Customer = mongoose.model('Customer', customerSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

// ============ MIDDLEWARE ============

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).json({ error: 'No token' });

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.userId = decoded.id;
    next();
  });
};

// ============ AUTH ROUTES ============

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, businessName, phoneNumber, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      businessName,
      phoneNumber,
      email,
      password: hashedPassword,
    });

    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '30d' });
    res.json({ token, user: { id: user._id, name, phoneNumber } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;
    const user = await User.findOne({ phoneNumber });

    if (!user) return res.status(400).json({ error: 'User not found' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '30d' });
    res.json({ token, user: { id: user._id, name: user.name, phoneNumber } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============ CUSTOMER ROUTES ============

app.get('/api/customers', verifyToken, async (req, res) => {
  try {
    const customers = await Customer.find({ userId: req.userId });
    res.json(customers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/customers', verifyToken, async (req, res) => {
  try {
    const { name, phone, notes } = req.body;
    const customer = new Customer({
      userId: req.userId,
      name,
      phone,
      notes,
    });
    await customer.save();
    res.json(customer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/customers/:id', verifyToken, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    const transactions = await Transaction.find({ customerId: req.params.id });
    res.json({ customer, transactions });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/customers/:id', verifyToken, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(customer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/customers/:id', verifyToken, async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    await Transaction.deleteMany({ customerId: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============ TRANSACTION ROUTES ============

app.post('/api/transactions', verifyToken, async (req, res) => {
  try {
    const { customerId, type, amount, description, dueDate } = req.body;

    const transaction = new Transaction({
      userId: req.userId,
      customerId,
      type,
      amount,
      description,
      dueDate,
      status: type === 'payment_received' ? 'paid' : 'pending',
    });

    await transaction.save();

    // Update customer's totalPending
    const customer = await Customer.findById(customerId);
    if (type === 'invoice') {
      customer.totalPending += amount;
    } else {
      customer.totalPending = Math.max(0, customer.totalPending - amount);
    }
    await customer.save();

    res.json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/transactions', verifyToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId }).populate('customerId');
    res.json(transactions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/transactions/:id', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const transaction = await Transaction.findById(req.params.id);

    // If marking as paid, update customer's totalPending
    if (status === 'paid' && transaction.status !== 'paid') {
      const customer = await Customer.findById(transaction.customerId);
      customer.totalPending = Math.max(0, customer.totalPending - transaction.amount);
      await customer.save();
    }

    transaction.status = status;
    await transaction.save();
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============ DASHBOARD ROUTE ============

app.get('/api/dashboard', verifyToken, async (req, res) => {
  try {
    const customers = await Customer.find({ userId: req.userId });
    const totalPending = customers.reduce((sum, c) => sum + c.totalPending, 0);
    const totalCustomers = customers.length;

    res.json({
      totalPending,
      totalCustomers,
      customers,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============ WHATSAPP ROUTES (Local Testing) ============

app.post('/api/whatsapp/send', verifyToken, async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    
    // For local testing, just log the message
    console.log(`[WhatsApp] Sending to ${phoneNumber}: ${message}`);
    
    res.json({ success: true, message: 'Message queued for sending' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/whatsapp/send-reminder', verifyToken, async (req, res) => {
  try {
    const { customerId } = req.body;
    const customer = await Customer.findById(customerId);

    if (!customer || !customer.phone) {
      return res.status(400).json({ error: 'Customer phone not found' });
    }

    const message = `Hi ${customer.name}, this is a reminder: You have ₹${customer.totalPending} pending. Please pay at your earliest convenience. Thank you!`;
    
    // Log for local testing
    console.log(`[WhatsApp Reminder] To ${customer.phone}: ${message}`);

    res.json({ success: true, message });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============ CRON JOB (Daily Reminders) ============

cron.schedule('0 9 * * *', async () => {
  console.log('Running daily reminder job...');
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueTransactions = await Transaction.find({
      dueDate: { $lt: today },
      status: 'pending',
    }).populate('customerId userId');

    for (const transaction of overdueTransactions) {
      const customer = transaction.customerId;
      console.log(
        `[Cron Reminder] ${customer.name} (${customer.phone}): ₹${transaction.amount} overdue since ${transaction.dueDate}`
      );
    }
  } catch (error) {
    console.error('Cron job error:', error);
  }
});

// ============ START SERVER ============

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
