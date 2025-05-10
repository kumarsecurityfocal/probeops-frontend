import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Role, Permission } from "@shared/schema";
import { useAuth } from "./use-auth";
import { getQueryFn } from "@/lib/queryClient";

// Define types for the RBAC context
type RbacContextType = {
  userRoles: Role[];
  userPermissions: Permission[];
  isRolesLoading: boolean;
  isPermissionsLoading: boolean;
  hasRole: (roleName: string) => boolean;
  hasPermission: (resource: string, action: string) => boolean;
  refreshPermissions: () => void;
};

// Create the RBAC context
export const RbacContext = createContext<RbacContextType | null>(null);

// Create the RBAC provider component
export function RbacProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);

  // Query to fetch the user's roles
  const {
    data: userRoles = [],
    isLoading: isRolesLoading,
    refetch: refetchRoles,
  } = useQuery<Role[]>({
    queryKey: ["/api/users", user?.id, "roles"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user, // Only fetch if user is logged in
  });

  // Query to fetch all permissions associated with user's roles
  const {
    data: permissions = [],
    isLoading: isPermissionsLoading,
    refetch: refetchPermissions,
  } = useQuery<Permission[]>({
    queryKey: ["userPermissions", userRoles?.map(role => role.id).join(",")],
    queryFn: async () => {
      if (!userRoles || userRoles.length === 0) return [];
      
      // Fetch permissions for each role and merge them
      const permissionSets = await Promise.all(
        userRoles.map(async (role) => {
          const response = await fetch(`/api/roles/${role.id}/permissions`);
          if (!response.ok) throw new Error("Failed to fetch permissions");
          return await response.json();
        })
      );
      
      // Flatten and deduplicate permissions
      const allPermissions = permissionSets.flat();
      const uniquePermissions = Array.from(
        new Map(allPermissions.map(item => [item.id, item])).values()
      );
      
      return uniquePermissions;
    },
    enabled: userRoles !== undefined && userRoles.length > 0,
  });

  // Set user permissions when data changes
  useEffect(() => {
    if (permissions) {
      setUserPermissions(permissions);
    }
  }, [permissions]);

  // Function to check if the user has a specific role
  const hasRole = (roleName: string): boolean => {
    if (!userRoles || userRoles.length === 0) return false;
    return userRoles.some(role => role.name === roleName);
  };

  // Function to check if the user has a specific permission
  const hasPermission = (resource: string, action: string): boolean => {
    if (!userPermissions || userPermissions.length === 0) return false;
    return userPermissions.some(
      permission => permission.resource === resource && permission.action === action
    );
  };

  // Function to refresh permissions
  const refreshPermissions = () => {
    refetchRoles();
    refetchPermissions();
  };

  return (
    <RbacContext.Provider
      value={{
        userRoles,
        userPermissions,
        isRolesLoading,
        isPermissionsLoading,
        hasRole,
        hasPermission,
        refreshPermissions,
      }}
    >
      {children}
    </RbacContext.Provider>
  );
}

// Custom hook to use the RBAC context
export function useRbac() {
  const context = useContext(RbacContext);
  if (!context) {
    throw new Error("useRbac must be used within a RbacProvider");
  }
  return context;
}

// Helper hook to check role
export function useHasRole(roleName: string) {
  const { hasRole, isRolesLoading } = useRbac();
  return {
    hasRole: hasRole(roleName),
    isLoading: isRolesLoading,
  };
}

// Helper hook to check permission
export function useHasPermission(resource: string, action: string) {
  const { hasPermission, isPermissionsLoading } = useRbac();
  return {
    hasPermission: hasPermission(resource, action),
    isLoading: isPermissionsLoading,
  };
}