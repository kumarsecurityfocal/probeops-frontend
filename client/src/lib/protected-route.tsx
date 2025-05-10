import { useAuth, useIsAdmin } from "@/hooks/use-auth";
import { UserRole, UserRoles } from "@shared/schema";
import { Loader2, ShieldAlert } from "lucide-react";
import { Redirect, Route } from "wouter";

interface ProtectedRouteProps {
  path: string;
  component: () => React.JSX.Element;
  requiredRole?: UserRole;
}

export function ProtectedRoute({
  path,
  component: Component,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const isAdmin = useIsAdmin();

  // Loading state
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Role-based access control
  if (requiredRole) {
    const hasRequiredRole = isAdmin || user.role === requiredRole;
    
    if (!hasRequiredRole) {
      return (
        <Route path={path}>
          <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground max-w-md mb-6">
              You don't have permission to access this page. This page requires {requiredRole} role.
            </p>
            <Redirect to="/" />
          </div>
        </Route>
      );
    }
  }

  // User has the required role or no specific role is required
  return <Route path={path} component={Component} />;
}

// Helper component for admin-only routes
export function AdminRoute({
  path,
  component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  return (
    <ProtectedRoute
      path={path}
      component={component}
      requiredRole={UserRoles.ADMIN}
    />
  );
}
