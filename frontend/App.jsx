import React, { useState, useEffect } from 'react';
import { Plus, LogOut, Send, Trash2, Eye } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://your-railway-url/api';

// ============ CONTEXT ============

const AuthContext = React.createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    }
  }, [token]);

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return React.useContext(AuthContext);
}

// ============ API HELPER ============

const api = (token) => ({
  post: async (endpoint, body) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
  get: async (endpoint) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
  put: async (endpoint, body) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
  delete: async (endpoint) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
});

// ============ LOGIN PAGE ============

function LoginPage() {
  const { setUser, setToken } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    businessName: '',
    phoneNumber: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isSignup ? '/auth/signup' : '/auth/login';
      const body = isSignup
        ? form
        : { phoneNumber: form.phoneNumber, password: form.password };

      const response = await api(null).post(endpoint, body);
      setToken(response.token);
      setUser(response.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">
          📝 Udhar
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Track small business invoices & payments
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <>
              <input
                type="text"
                placeholder="Your Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Business Name"
                value={form.businessName}
                onChange={(e) =>
                  setForm({ ...form, businessName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </>
          )}

          <input
            type="tel"
            placeholder="Phone Number"
            value={form.phoneNumber}
            onChange={(e) =>
              setForm({ ...form, phoneNumber: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading
              ? 'Loading...'
              : isSignup
              ? 'Create Account'
              : 'Sign In'}
          </button>
        </form>

        <button
          onClick={() => setIsSignup(!isSignup)}
          className="w-full text-blue-600 py-2 mt-4 text-sm font-semibold hover:underline"
        >
          {isSignup
            ? 'Already have an account? Sign in'
            : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
}

// ============ DASHBOARD PAGE ============

function Dashboard() {
  const { user, token, logout } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalPending, setTotalPending] = useState(0);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    notes: '',
  });
  const [newTransaction, setNewTransaction] = useState({
    customerId: '',
    type: 'invoice',
    amount: '',
    description: '',
    dueDate: '',
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await api(token).get('/dashboard');
      setCustomers(data.customers);
      setTotalPending(data.totalPending);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) {
      alert('Please fill in all fields');
      return;
    }
    try {
      await api(token).post('/customers', newCustomer);
      setNewCustomer({ name: '', phone: '', notes: '' });
      setShowAddCustomer(false);
      fetchDashboard();
    } catch (error) {
      alert('Error adding customer: ' + error.message);
    }
  };

  const handleAddTransaction = async () => {
    if (!newTransaction.customerId || !newTransaction.amount) {
      alert('Please fill in all fields');
      return;
    }
    try {
      await api(token).post('/transactions', newTransaction);
      setNewTransaction({
        customerId: '',
        type: 'invoice',
        amount: '',
        description: '',
        dueDate: '',
      });
      setShowAddTransaction(false);
      fetchDashboard();
    } catch (error) {
      alert('Error adding transaction: ' + error.message);
    }
  };

  const handleSendReminder = async (customerId) => {
    try {
      const response = await api(token).post('/whatsapp/send-reminder', {
        customerId,
      });
      alert('Reminder sent (logged to console in dev mode)');
      console.log('Reminder message:', response.message);
    } catch (error) {
      alert('Error sending reminder: ' + error.message);
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm('Delete this customer?')) {
      try {
        await api(token).delete(`/customers/${customerId}`);
        fetchDashboard();
      } catch (error) {
        alert('Error deleting customer: ' + error.message);
      }
    }
  };

  if (selectedCustomer) {
    return (
      <CustomerDetail
        customerId={selectedCustomer}
        onBack={() => setSelectedCustomer(null)}
        token={token}
        onRefresh={fetchDashboard}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📝 Udhar</h1>
            <p className="text-sm text-gray-600">{user?.phoneNumber}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Total Pending Card */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg shadow-lg p-6 mb-6">
          <p className="text-blue-100 mb-1">Total Pending Amount</p>
          <h2 className="text-4xl font-bold">₹{totalPending.toLocaleString()}</h2>
          <p className="text-blue-100 mt-2 text-sm">
            {customers.length} customers
          </p>
        </div>

        {/* Add Customer Button */}
        <button
          onClick={() => setShowAddCustomer(true)}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 mb-6"
        >
          <Plus size={20} /> Add New Customer
        </button>

        {/* Add Customer Modal */}
        {showAddCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
            <div className="bg-white w-full rounded-t-lg p-6 space-y-4">
              <h3 className="text-lg font-bold">Add Customer</h3>
              <input
                type="text"
                placeholder="Customer Name"
                value={newCustomer.name}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="tel"
                placeholder="Phone Number (WhatsApp)"
                value={newCustomer.phone}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, phone: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <textarea
                placeholder="Notes (optional)"
                value={newCustomer.notes}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, notes: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddCustomer(false)}
                  className="flex-1 bg-gray-300 text-gray-900 py-2 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCustomer}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Transaction Modal */}
        {showAddTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
            <div className="bg-white w-full rounded-t-lg p-6 space-y-4">
              <h3 className="text-lg font-bold">
                {newTransaction.type === 'invoice'
                  ? 'Add Invoice'
                  : 'Record Payment'}
              </h3>
              <select
                value={newTransaction.customerId}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    customerId: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select Customer</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setNewTransaction({
                      ...newTransaction,
                      type: 'invoice',
                    })
                  }
                  className={`flex-1 py-2 rounded-lg font-semibold ${
                    newTransaction.type === 'invoice'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200'
                  }`}
                >
                  Invoice
                </button>
                <button
                  onClick={() =>
                    setNewTransaction({
                      ...newTransaction,
                      type: 'payment_received',
                    })
                  }
                  className={`flex-1 py-2 rounded-lg font-semibold ${
                    newTransaction.type === 'payment_received'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200'
                  }`}
                >
                  Payment
                </button>
              </div>

              <input
                type="number"
                placeholder="Amount"
                value={newTransaction.amount}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    amount: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Description (e.g., Repair of AC)"
                value={newTransaction.description}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    description: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              {newTransaction.type === 'invoice' && (
                <input
                  type="date"
                  value={newTransaction.dueDate}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      dueDate: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddTransaction(false)}
                  className="flex-1 bg-gray-300 text-gray-900 py-2 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTransaction}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Customers List */}
        <div className="space-y-3">
          {loading ? (
            <p className="text-center text-gray-500 py-8">Loading...</p>
          ) : customers.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No customers yet. Add one to get started!
            </p>
          ) : (
            customers.map((customer) => (
              <div
                key={customer._id}
                className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition"
              >
                <div
                  onClick={() => setSelectedCustomer(customer._id)}
                  className="flex justify-between items-start mb-3"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{customer.name}</h3>
                    <p className="text-sm text-gray-500">{customer.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      ₹{customer.totalPending}
                    </p>
                    <p className="text-xs text-gray-500">Pending</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t">
                  <button
                    onClick={() =>
                      setNewTransaction({
                        customerId: customer._id,
                        type: 'invoice',
                        amount: '',
                        description: '',
                        dueDate: '',
                      }) || setShowAddTransaction(true)
                    }
                    className="flex-1 bg-blue-50 text-blue-600 py-2 rounded font-semibold text-sm hover:bg-blue-100 transition"
                  >
                    <Plus size={16} className="inline mr-1" /> Invoice
                  </button>
                  <button
                    onClick={() => handleSendReminder(customer._id)}
                    className="flex-1 bg-green-50 text-green-600 py-2 rounded font-semibold text-sm hover:bg-green-100 transition"
                  >
                    <Send size={16} className="inline mr-1" /> Remind
                  </button>
                  <button
                    onClick={() => handleDeleteCustomer(customer._id)}
                    className="bg-red-50 text-red-600 px-3 py-2 rounded font-semibold text-sm hover:bg-red-100 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Transaction Button */}
        {customers.length > 0 && (
          <button
            onClick={() => setShowAddTransaction(true)}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2 mt-6 fixed bottom-6 left-4 right-4 max-w-[calc(100%-2rem)] shadow-lg"
          >
            <Plus size={20} /> Add Invoice / Payment
          </button>
        )}
      </div>
    </div>
  );
}

// ============ CUSTOMER DETAIL PAGE ============

function CustomerDetail({ customerId, onBack, token, onRefresh }) {
  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerDetails();
  }, [customerId]);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      const data = await api(token).get(`/customers/${customerId}`);
      setCustomer(data.customer);
      setTransactions(data.transactions);
    } catch (error) {
      console.error('Failed to fetch customer details:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (transactionId) => {
    try {
      await api(token).put(`/transactions/${transactionId}`, {
        status: 'paid',
      });
      fetchCustomerDetails();
      onRefresh();
    } catch (error) {
      alert('Error updating transaction: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="text-blue-600 font-semibold mb-2"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {customer?.name}
          </h1>
          <p className="text-sm text-gray-600">{customer?.phone}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6">
        {/* Pending Amount Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg shadow-lg p-6 mb-6">
          <p className="text-blue-100 mb-1">Total Pending</p>
          <h2 className="text-4xl font-bold">
            ₹{customer?.totalPending.toLocaleString()}
          </h2>
        </div>

        {/* Transactions List */}
        <h3 className="font-bold text-lg mb-3 text-gray-900">
          Transaction History
        </h3>
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No transactions</p>
          ) : (
            transactions.map((t) => (
              <div
                key={t._id}
                className={`rounded-lg p-4 ${
                  t.type === 'invoice'
                    ? 'bg-blue-50 border-l-4 border-blue-600'
                    : 'bg-green-50 border-l-4 border-green-600'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {t.type === 'invoice' ? '📤' : '✅'}{' '}
                      {t.description || (t.type === 'invoice' ? 'Invoice' : 'Payment')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-xl font-bold ${
                        t.type === 'invoice' ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {t.type === 'invoice' ? '+' : '-'}₹{t.amount}
                    </p>
                    <p className="text-xs font-semibold text-gray-600 uppercase">
                      {t.status}
                    </p>
                  </div>
                </div>

                {t.type === 'invoice' && t.status === 'pending' && (
                  <button
                    onClick={() => markAsPaid(t._id)}
                    className="w-full mt-2 bg-green-600 text-white py-2 rounded font-semibold text-sm hover:bg-green-700 transition"
                  >
                    Mark as Paid
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ============ MAIN APP ============

function App() {  // ← Remove "export default"
  const { token } = useAuth();

  return token ? <Dashboard /> : <LoginPage />;
}

function WrappedApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default WrappedApp;  // ← Keep this one
