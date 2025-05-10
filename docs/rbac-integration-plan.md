# ProbeOps RBAC Integration Plan

## Overview
This document outlines the plan for integrating the Role-Based Access Control (RBAC) module developed by the probeops-backend team into the ProbeOps GUI.

## Information Required from Backend Team

### API Endpoints
- **Role Management Endpoints**
  - GET `/api/roles` - List all available roles
  - GET `/api/roles/:id` - Get role details
  - POST `/api/roles` - Create a new role
  - PUT `/api/roles/:id` - Update role
  - DELETE `/api/roles/:id` - Delete role

- **User Role Assignment Endpoints**
  - GET `/api/users/:id/roles` - Get roles assigned to a user
  - POST `/api/users/:id/roles` - Assign role to a user
  - DELETE `/api/users/:id/roles/:roleId` - Remove role from a user

- **Permission Endpoints**
  - GET `/api/permissions` - List all available permissions
  - GET `/api/roles/:id/permissions` - Get permissions for a role

### Data Models
- **Role Model**
  ```typescript
  interface Role {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
  }
  ```

- **Permission Model**
  ```typescript
  interface Permission {
    id: number;
    name: string;
    description: string;
    resource: string;
    action: string;
  }
  ```

- **User Role Model**
  ```typescript
  interface UserRole {
    user_id: number;
    role_id: number;
    assigned_at: string;
  }
  ```

### Authentication Requirements
- Does the existing JWT token include role information?
- How should role-based permissions be checked on the frontend?
- Do we need to update authentication flow?

## Frontend Implementation Plan

### 1. User Interface Components
- **Role Management Page**
  - Table displaying all roles
  - Role creation modal
  - Role editing modal
  - Role deletion confirmation dialog

- **User Role Assignment Component**
  - Add to user profile/settings page
  - Multi-select dropdown for roles
  - Visual indicators for assigned roles

- **Permission Management**
  - Interface for assigning permissions to roles
  - Categorized permission list

### 2. Access Control Implementation
- Create RBAC-specific React hooks:
  - `usePermissions` - Check if user has specific permissions
  - `useRoles` - Get current user's roles

- Add permission checking to protected routes
- Implement UI element visibility based on permissions

### 3. API Integration
- Create API handlers for all RBAC endpoints
- Update auth context to include role information
- Implement caching strategy for permissions

### 4. User Experience
- Clear indicators of permission-based access restrictions
- Helpful error messages for permission denied scenarios
- Visual distinction between different roles

## Questions for Backend Team
1. What is the format of role-based permissions?
2. Is there a hierarchy of roles?
3. Are there any default roles built into the system?
4. How are custom permissions handled?
5. Does the backend validate permission requirements, or is that a frontend responsibility?
6. How should we handle cache invalidation for permission changes?

## Next Steps
1. Schedule meeting with probeops-backend team to discuss integration
2. Obtain API documentation and confirm data models
3. Create mockups for RBAC UI components
4. Implement API client methods for RBAC endpoints
5. Develop UI components based on approved designs
6. Integrate permission checking throughout the application
7. Test integration with backend
8. Review and iterate