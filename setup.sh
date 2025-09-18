#!/bin/bash

# Tower Detection AI Setup Script

echo "🏗️  Setting up Tower Detection AI..."

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📚 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p uploads

# Set permissions
echo "🔐 Setting permissions..."
chmod 755 uploads

echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "1. Activate virtual environment: source venv/bin/activate"
echo "2. Run the app: python app.py"
echo "3. Open browser: http://localhost:5000"
echo ""
echo "Don't forget to add your trained YOLOv11 model as 'tower_model.pt' in the project root!"
