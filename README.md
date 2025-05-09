# ProbeOps Frontend

A React frontend application for network diagnostics and monitoring that connects to the ProbeOps AWS backend API.

## Features

- User authentication (login/register)
- Network probing tools:
  - Ping
  - Traceroute
  - DNS lookup
  - WHOIS lookup
- Probe history tracking
- API key management for external integrations
- Clean, responsive UI built with React, TailwindCSS, and shadcn/ui

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, shadcn/ui
- **State Management**: TanStack Query (React Query)
- **API Communication**: Axios with JWT authentication
- **Form Handling**: React Hook Form + Zod validation

## Development Setup

1. Clone the repository
2. Install dependencies with `npm install`
3. Configure environment variables in `.env` 
4. Start development server with `npm run dev`

## Production Deployment

### Prerequisites

- Node.js 16+ and npm
- Backend API running at a known URL

### Deployment Options

#### Option 1: Docker Deployment (Recommended)

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone https://github.com/yourusername/probeops-frontend.git
   cd probeops-frontend
   ```

2. Create a `.env.production` file with your backend API URL:
   ```
   # Frontend configuration - set this to your backend API URL
   VITE_API_URL=http://172.16.0.80:5000
   ```

3. Build the Docker image:
   ```bash
   docker build -t probeops-frontend:latest .
   ```

4. Run the Docker container:
   ```bash
   # Run on default port 3000
   docker run -d -p 3000:3000 --name probeops-frontend probeops-frontend:latest
   
   # Or use a different port (e.g., 4000)
   docker run -d -p 4000:3000 --name probeops-frontend probeops-frontend:latest
   
   # Run with environment variables
   docker run -d -p 3000:3000 -e VITE_API_URL=http://your-backend-url:5000 --name probeops-frontend probeops-frontend:latest
   ```

5. Access the application at http://your-server-ip:3000

#### Option 1b: Docker Compose Frontend Deployment

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone https://github.com/yourusername/probeops-frontend.git
   cd probeops-frontend
   ```

2. Make sure you have a Docker network created for communication between frontend and backend containers:
   ```bash
   # Create the shared network (if not already created by the backend container)
   docker network create probeops-network
   ```

3. Ensure your backend container is running and correctly named:
   ```bash
   # Backend container must be running with the name 'probeops-api'
   # and connected to the 'probeops-network' network
   ```

4. The `docker-compose.frontend.yml` file is already configured to use the NGINX NPS server with HTTPS:
   ```yaml
   # Environment variables for browser-side API calls
   environment:
     - VITE_API_URL=https://probeops.com
   # Network for container-to-container communication  
   networks:
     - probeops-network
   
   # Network configuration (CRITICAL for container communication)
   networks:
     probeops-network:
       name: probeops-network
       external: true  # This ensures we connect to the existing network
   ```
   
   Note: We use the domain name with HTTPS instead of direct IP access for improved security and flexibility. This allows proper SSL/TLS encryption for all API calls.

5. Build and start the container with Docker Compose:
   ```bash
   # Clean build ensures correct API URL is baked into the frontend
   docker compose -f docker-compose.frontend.yml up -d --build
   ```

6. To stop the service:
   ```bash
   docker compose -f docker-compose.frontend.yml down
   ```

#### Option 2: Direct Node.js Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone https://github.com/yourusername/probeops-frontend.git
   cd probeops-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update `.env` file with production settings:
   ```
   # Frontend configuration - set this to your backend API URL
   VITE_API_URL=https://probeops.com
   ```

4. Run the production script (builds and starts the server):
   ```bash
   # Start with default port 3000
   ./start-prod.sh
   
   # OR specify a custom port
   ./start-prod.sh 4000
   ```

Both options will:
- Build the application
- Start a production server on the specified port (default: 3000)
- Configure the server to serve static files and handle client-side routing

### Changing the Port

You can change the port in two ways:

1. Pass it as an argument to the start script:
   ```bash
   ./start-prod.sh 4000
   ```

2. Set the PORT environment variable:
   ```bash
   PORT=4000 node server/prod-server.js
   ```

### Running as a Background Service

To keep the server running after you log out:

```bash
# Install PM2 globally
npm install -g pm2

# Start the service with PM2
PORT=3000 pm2 start server/prod-server.js --name "probeops-frontend"

# Make it start on server reboot
pm2 startup
pm2 save
```

### Advanced Deployment (Optional)

For production environments with multiple services, consider using:

1. A reverse proxy with Nginx:
   ```nginx
   server {
       listen 80;
       server_name probeops.yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Configuration Notes

- The application directly connects to the backend API at the URL specified in `VITE_API_URL`
- Ensure CORS is properly configured on the backend to allow requests from your frontend domain
- JWT tokens are used for authentication and stored in localStorage

## Backend API Endpoints

The backend API provides endpoints for:

- Authentication: `/users/login`, `/users/register`, `/users/me`, `/users/logout`
- API Keys: `/apikeys`, `/apikeys/:id`
- Network Probes: `/probes/ping`, `/probes/traceroute`, `/probes/dns`, `/probes/whois`
- Probe History: `/probes/history`
- Stats: `/stats`

## Important Changes in Production Version

1. Removed Express proxy server in favor of direct API communication
2. Updated all API endpoint references to use direct backend URLs
3. Added JWT token handling for authentication
4. Improved error handling and response mapping
5. Added comprehensive environment configuration
6. Fixed CommonJS module compatibility issues with serve-handler using proper ES Module imports
7. Added Docker network configuration for container-to-container communication
8. Ensured API URL is correctly baked into the production build using Docker build arguments
9. Created .env.production file with Docker-specific network settings
10. Used HTTPS with domain name (probeops.com) for secure API communication