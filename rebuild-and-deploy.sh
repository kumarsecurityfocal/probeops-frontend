#!/bin/bash
# ProbeOps Frontend Rebuild and Deploy Script

echo "✅ Starting clean rebuild and deployment process..."

# Step 1: Clean up old build artifacts
echo "🧹 Cleaning old build artifacts..."
rm -rf node_modules dist .vite

# Step 2: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 3: Build the application for production
echo "🔨 Building application for production..."
npm run build

# Step 4: Build and start Docker containers
echo "🐳 Building and starting Docker containers..."
docker-compose -f docker-compose.frontend.yml build --no-cache
docker-compose -f docker-compose.frontend.yml up -d

echo "✨ Deployment completed!"
echo "The application should now be running at http://localhost:3000"
echo "API URL is configured to: $(grep VITE_API_URL .env.production | cut -d'=' -f2)"