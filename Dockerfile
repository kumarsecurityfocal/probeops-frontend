# Multi-stage build for ProbeOps Frontend
# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy application code
COPY . .

# Set production environment for the build
ENV NODE_ENV=production
# API URL will be provided from .env.production during build

# Build the application using production environment
# This will ensure the correct API URL is baked into the build
RUN echo "Building with API URL: $VITE_API_URL"
RUN NODE_ENV=production npm run build
# Debug: List the built files
RUN echo "Listing build files:" && find /app/dist -type f
# Update the directory structure to match what prod-server.js expects
# First, clear any existing client directory and create a fresh one
RUN rm -rf /app/dist/client && mkdir -p /app/dist/client
# Copy all content including nested directories from public to client
# Using cp -a to preserve all file attributes and symbolic links
RUN cp -a /app/dist/public/. /app/dist/client/
# Make sure all files have proper permissions
RUN chmod -R 755 /app/dist/client
# Debug: Verify the final client directory
RUN echo "Verifying client directory structure:" && find /app/dist/client -type d
RUN echo "Verifying client files:" && find /app/dist/client -type f
# Compare both directories to ensure all files were copied
RUN echo "Comparing directories to verify complete copy:" && \
    diff -r /app/dist/public /app/dist/client || echo "Directories have expected differences (if any)"

# Stage 2: Create production image
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
# API URL will be provided from .env.production via docker-compose env_file

# Install wget for health check and other utilities
RUN apk --no-cache add wget curl

# Copy only the built application from previous stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server/prod-server.js ./server/prod-server.js
COPY --from=builder /app/package*.json ./

# Comment explaining the CommonJS compatibility fix
# The prod-server.js file has been updated to use proper ES Module import for serve-handler

# Install only production dependencies
RUN npm ci --omit=dev

# Debug: Verify the directory structure in the production image
RUN echo "Checking final directory structure:" && find /app/dist -type d && echo "Files:" && find /app/dist -type f

# Expose port
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the production server
CMD ["node", "server/prod-server.js"]