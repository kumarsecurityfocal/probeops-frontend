# ProbeOps RBAC Implementation

This document provides a comprehensive overview of the Role-Based Access Control implementation in the ProbeOps application.

## Authentication Methods

### JWT Token Authentication
- Used for interactive user sessions
- Tokens obtained through `/api/auth/login` endpoint
- Contains user information including role and subscription tier
- 24-hour expiration
- Included in `Authorization` header as `Bearer {token}`

### API Key Authentication
- Used for machine-to-machine communication
- Obtained through `/api/keys` endpoint (requires JWT authentication)
- Included in `X-API-Key` header
- Inherits permissions of the user who created it

## User Roles

### User Role (`user`)
- Default role for all registered users
- Access to standard network probe endpoints
- Can manage their own API keys
- Limited by subscription tier rate limits

### Admin Role (`admin`)
- Administrative access to all system features
- Can manage all users (create, update, deactivate)
- Can view and manage all API keys
- Can configure rate limits
- Full access to system status information
- Not subject to rate limits

## Subscription Tiers

### Free Tier
- Default for new users
- 100 API requests per day
- 1,000 API requests per month
- 15-minute interval between probe requests

### Standard Tier
- 500 API requests per day
- 5,000 API requests per month
- 5-minute interval between probe requests

### Enterprise Tier
- 1,000 API requests per day
- 10,000 API requests per month
- 5-minute interval between probe requests

## Rate Limiting

- Based on user's subscription tier
- Tracked by day, month, and interval
- Response headers include:
  - `X-RateLimit-Limit-Day`
  - `X-RateLimit-Remaining-Day`
  - `X-RateLimit-Limit-Month`
  - `X-RateLimit-Remaining-Month`
  - `X-RateLimit-Reset`
- 429 error when limit is exceeded

## Frontend Integration

### UI Adaptation Based on User Role

#### User Role UI
- Standard network probe tools
- Subscription tier information
- Upgrade options for Free tier users
- API key management
- Rate limit information and usage

#### Admin Role UI
- All user role features
- Admin dashboard section
- User management interface
- System status information
- Rate limit configuration tools

### Rate Limit Handling
- Display current rate limit status
- Clear error messages when limits are reached
- Subscription upgrade CTAs for Free tier users
- Countdown timers for interval-based rate limits