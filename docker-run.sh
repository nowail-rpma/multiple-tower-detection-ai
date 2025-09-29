#!/bin/bash

# Tower Detection AI - Docker Run Script
# This script helps you run the tower detection application in Docker

echo "🏗️  Tower Detection AI - Docker Setup"
echo "======================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if model file exists
if [ ! -f "best.pt" ]; then
    echo "⚠️  Warning: best.pt model file not found."
    echo "   The application will use a pretrained YOLOv11 model instead."
    echo "   To use your custom model, place it as 'best.pt' in the project root."
    echo ""
fi

echo "🐳 Building Docker image..."
docker-compose build

echo "🚀 Starting the application..."
echo "   The application will be available at: http://localhost:5005"
echo "   Press Ctrl+C to stop the application"
echo ""

# Start the application
docker-compose up

echo ""
echo "👋 Application stopped. Thank you for using Tower Detection AI!"
