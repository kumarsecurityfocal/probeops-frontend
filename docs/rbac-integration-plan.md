# ProbeOps RBAC Integration Plan

## Overview

This document outlines the implementation strategy for Role-Based Access Control (RBAC) in the ProbeOps frontend application. The RBAC system is designed to control access to features and functionality based on user roles and subscription tiers.

## Authentication Methods

The ProbeOps system supports two main authentication methods:

1. **JWT Authentication**
   - Used for interactive user sessions in the web interface
   - Token contains user role and subscription tier information
   - 24-hour expiration period
   - Requires Authorization header with "Bearer" prefix

2. **API Key Authentication**
   - Used for programmatic access to the API
   - Inherits the permissions of the creating user
   - Requires X-API-KEY header
   - No expiration (until revoked)

## User Roles

ProbeOps defines two primary user roles:

| Role | Description | Access Level |
|------|-------------|--------------|
| User | Standard user with access to basic functionality | Limited to own resources |
| Admin | Administrator with full system access | Full system access |

### Role Permissions

#### User Role
- Create and manage their own API keys
- Run network probes with rate limits based on subscription
- View their probe history
- Manage their account settings

#### Admin Role
- All User role permissions
- Access to administrative functions
- Manage all users and their API keys
- View system-wide probe history
- Access debug information

## Subscription Tiers

ProbeOps implements three subscription tiers that control resource usage:

| Tier | Daily Request Limit | Monthly Request Limit | Probe Interval | 
|------|---------------------|----------------------|----------------|
| Free | 100 | 1,000 | 15 min |
| Standard | 500 | 5,000 | 5 min |
| Enterprise | 1,000 | 10,000 | 5 min |

## Frontend RBAC Implementation

### 1. Schema Implementation

The shared schema defines enums and types for:
- User roles (USER, ADMIN)
- Subscription tiers (FREE, STANDARD, ENTERPRISE)
- Rate limit information structure

### 2. Authentication Context

The authentication context is enhanced to:
- Store user role information from JWT
- Store subscription tier information
- Provide helper methods for role checking

### 3. RBAC Provider

A dedicated RBAC provider:
- Exposes role and subscription information
- Provides utilities for role-based permission checks
- Manages rate limit data from the backend

### 4. Protected Routes

Route protection components:
- Enforce authentication requirements
- Check role-based permissions
- Redirect unauthorized access attempts

### 5. UI Components for RBAC

User interface elements include:
- Role badges to indicate user roles
- Subscription tier indicators
- Rate limit displays with usage statistics
- Upgrade prompts for approaching limits

## Rate Limiting Behavior

Rate limits are enforced by the backend based on subscription tier:

1. Daily and monthly request quotas
2. Minimum intervals between consecutive probes
3. Visual indicators when approaching limits
4. Upgrade prompts when nearing capacity

## Implementation Roadmap

1. Define schema types for roles and permissions
2. Enhance authentication context with role information
3. Create RBAC provider for permission management
4. Implement protected routes with role checks
5. Add role and subscription UI components
6. Integrate rate limit displays and upgrade flows
7. Apply role-based conditional rendering throughout the application

## API Endpoints

The following endpoints are relevant to RBAC implementation:

- `/api/user` - Get current user information with role and subscription data
- `/api/user/rate-limits` - Get current usage and limits information
- `/api/user/subscription` - Update user subscription tier

## Testing Strategy

1. Mock different user roles and subscription tiers
2. Verify correct access control behavior
3. Test rate limit visualizations with different usage levels
4. Ensure subscription tier changes update permissions correctly