#!/bin/bash

# This script builds and starts the production server
# Usage: ./start-prod.sh [port]
# Example: ./start-prod.sh 3000

# Set default port to 3000 or use the provided port
PORT=${1:-3000}

echo "🔨 Building application..."
npm run build

echo "🚀 Starting production server on port $PORT..."
PORT=$PORT node server/prod-server.js