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
- A production web server (Nginx, Apache, etc.)
- Backend API running at a known URL

### Deployment Steps

1. Update `.env` file with production settings:
   ```
   # Frontend configuration
   VITE_API_URL=http://172.16.0.80:5000  # Your backend URL
   
   # Server configuration
   PORT=3000  # Use a different port than the backend
   ```

2. Build the production bundle:
   ```
   npm run build
   ```

3. Start the production server:
   ```
   NODE_ENV=production npm start
   ```

4. (Optional) Set up a reverse proxy with Nginx or similar:
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