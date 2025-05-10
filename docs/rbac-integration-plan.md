# ProbeOps RBAC Integration Plan

## Overview
This document outlines the plan for integrating the Role-Based Access Control (RBAC) module developed by the probeops-backend team into the ProbeOps GUI.

## Backend RBAC Implementation Details

### Authentication Methods

1. **JWT Token Authentication**
   - Endpoint: `/api/auth/login`
   - Header: `Authorization: Bearer {token}`
   - Contains: user role + subscription tier
   - Expiration: 24 hours

2. **API Key Authentication**
   - Header: `X-API-Key: {api_key}`
   - Created via: `/api/keys` endpoint
   - Inherits creator's permissions

### User Roles

1. **User Role** (`user`)
   - Default role for registered users
   - Access to standard probe endpoints
   - Manage own API keys
   - Rate-limited by subscription tier

2. **Admin Role** (`admin`)
   - Manage all users and API keys
   - Configure rate limits
   - Access system status
   - No rate limits

### Subscription Tiers

1. **Free Tier**
   - 100 requests/day, 1,000/month
   - 15-minute interval between probes

2. **Standard Tier**
   - 500 requests/day, 5,000/month
   - 5-minute interval between probes

3. **Enterprise Tier**
   - 1,000 requests/day, 10,000/month
   - 5-minute interval between probes

## Frontend Implementation Plan

### 1. User Interface Components

- **User Settings Page Enhancements**
  - Display current subscription tier
  - Upgrade/downgrade subscription options
  - Role indicator for users

- **Admin Panel Components** (admin role only)
  - User management table
  - API key management across all users
  - System status dashboard
  - Rate limit configuration

- **Rate Limit Displays**
  - Visual indicators for daily/monthly usage
  - Warnings when approaching limits
  - Upgrade prompts for users near limits

### 2. Authentication & Access Control Implementation

- **Enhanced Authentication Flow**
  - Store JWT token with role and subscription information
  - Handle 401 (Unauthorized) errors with automatic logout
  - Handle 403 (Forbidden) for role-based access violations
  - Handle 429 (Too Many Requests) for rate limit errors

- **React Hooks for Authorization**
  - `useRole` - Check if user has specific role
  - `useSubscription` - Access subscription tier information
  - `useRateLimits` - Get current usage and limits

- **Route Protection**
  - Admin routes restricted to admin role
  - Conditional rendering of UI elements based on role
  - Graceful error handling for unauthorized access attempts

### 3. API Integration

- **Update API Client**
  - Include authentication headers in all requests
  - Handle role-specific error responses
  - Track rate limit information from response headers

- **JWT Token Management**
  - Extract and store role information
  - Update auth context to include role and subscription information
  - Handle token expiration and refresh

### 4. User Experience Enhancements

- **Clear Role Indicators**
  - Admin badge in navigation
  - Role-specific UI elements

- **Subscription Information**
  - Tier status in dashboard
  - Usage statistics
  - Upgrade path prominently displayed

- **Error Handling**
  - User-friendly messages for authentication errors
  - Clear indications when rate limits are reached
  - Helpful guidance when access is denied due to role restrictions

## Implementation Phases

### Phase 1: Authentication Enhancement
1. Update auth context to extract role and subscription from JWT
2. Implement proper storage and retrieval of this information
3. Create hooks for checking roles and subscription tiers

### Phase 2: Role-Based UI Components
1. Add role checks to existing routes and components
2. Create admin-only sections in the UI
3. Implement role indicators in the navigation

### Phase 3: Subscription & Rate Limit Features
1. Add subscription tier display to user dashboard
2. Implement usage tracking and visualization
3. Add rate limit warnings and notifications

### Phase 4: Admin Panel
1. Create user management interface for admins
2. Implement system status dashboard
3. Add configuration options for rate limits

## Test Plan
1. Authentication flow with different roles
2. UI component visibility based on roles
3. Rate limit enforcement and warnings
4. Admin functionality access and controls