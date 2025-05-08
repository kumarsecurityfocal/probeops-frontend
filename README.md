# ProbeOps

A React frontend application for network diagnostics and monitoring.

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
- **Backend**: Express.js, in-memory storage (can be extended to PostgreSQL)
- **Authentication**: Session-based auth with Passport.js
- **State Management**: TanStack Query (React Query)
- **Form Handling**: React Hook Form + Zod validation

## Setup

1. Clone the repository
2. Install dependencies with `npm install`
3. Start development server with `npm run dev`

## Environment Variables

Create a `.env` file in the root directory with:

```
SESSION_SECRET=your_session_secret
```

## API Endpoints

The backend API provides endpoints for:

- Authentication: `/api/register`, `/api/login`, `/api/logout`, `/api/user`
- API Keys: `/api/keys`
- Network Probes: `/api/probes/ping`, `/api/probes/traceroute`, `/api/probes/dns`, `/api/probes/whois`
- Stats: `/api/stats`