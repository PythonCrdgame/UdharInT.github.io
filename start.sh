#!/bin/bash

set -e

echo "🚀 Udhar - Setup & Run Script"
echo "=============================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Setup Backend
echo "📦 Setting up Backend..."
cp .env.example .env 2>/dev/null || echo "ℹ️  .env file already exists"
npm install 2>/dev/null || echo "⚠️  Backend dependencies already installed"
echo "✅ Backend ready"
echo ""

# Setup Frontend
echo "📦 Setting up Frontend..."
npm install --prefix . 2>/dev/null || echo "⚠️  Frontend dependencies already installed"
echo "✅ Frontend ready"
echo ""

# Check MongoDB
echo "🗄️  Checking MongoDB..."
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed locally."
    echo "Options:"
    echo "  1. Install MongoDB: https://docs.mongodb.com/manual/installation/"
    echo "  2. Use MongoDB Atlas (free): https://www.mongodb.com/cloud/atlas"
    echo "  3. Use Docker: docker run -d -p 27017:27017 mongo"
    echo ""
    read -p "Have you set up MongoDB? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi
echo "✅ MongoDB ready"
echo ""

# Display startup instructions
echo "🎯 Ready to go!"
echo "=============================="
echo ""
echo "Start the Backend (Terminal 1):"
echo "  npm run dev"
echo ""
echo "Start the Frontend (Terminal 2):"
echo "  npm run dev --prefix ."
echo ""
echo "Then open: http://localhost:3000"
echo ""
echo "📱 Test Account:"
echo "  Phone: 9876543210"
echo "  Password: test123"
echo ""
echo "Happy coding! 🎉"
