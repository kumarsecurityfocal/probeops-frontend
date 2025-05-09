# ProbeOps API Proxy Configuration

This document describes the API proxy setup for the ProbeOps frontend application.

## Overview

The frontend application uses a proxy configuration to simplify development and avoid CORS issues while working on the application. This setup allows developers to:

1. Make API requests to `/api/*` endpoints during development
2. Have those requests automatically forwarded to the backend server
3. Debug API communication with logging and testing tools

## Development Setup

In development mode, requests to `/api/*` are proxied to the backend API server specified in the `.env.development` file. The default configuration points to `http://probeops-api:5000`.

### How It Works

1. The application uses `http-proxy-middleware` to intercept requests to `/api/*`
2. Requests are forwarded to the target server defined in `PROXY_TARGET` environment variable
3. The proxy automatically handles headers and CORS issues
4. All requests and errors are logged for debugging

### Debug Tools

A debug page is available at `/debug` with tools to:
- View the environment configuration
- Test API endpoints directly
- View proxy logs

## Production Setup

In production, the proxy is not used. Instead, the frontend makes requests directly to the backend API URL specified in `.env.production`.

### Path Handling

- In development: The frontend makes requests to `/api/*` which are proxied to the backend server
- In production: The frontend makes requests directly to `https://probeops.com/api/*`

### Configuration Files

- `.env.development`: Development environment variables
  - `PROXY_TARGET`: URL of the backend API server for development (default: `http://probeops-api:5000`)

- `.env.production`: Production environment variables
  - `VITE_API_URL`: URL of the backend API server for production (default: `https://probeops.com`)

## Switching Between Environments

The application automatically detects the environment based on the build type:

- During development (`npm run dev`), it uses the development proxy
- In production builds (`npm run build`), it uses direct API calls to the production URL

## Debugging the Proxy

If you encounter issues with the proxy:

1. Check the proxy logs on the Debug page (`/debug`)
2. Verify the target URL in `.env.development`
3. Ensure the backend server is running and accessible
4. Check server logs for additional errors

## Technical Implementation

The proxy implementation can be found in:
- `server/routes.ts`: Main proxy configuration
- `server/proxy-logger.ts`: Logging utilities
- `client/src/lib/api.ts`: Frontend API client setup