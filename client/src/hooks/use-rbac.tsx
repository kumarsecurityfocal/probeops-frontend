import { createContext, ReactNode, useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  SubscriptionTier, 
  SubscriptionTiers, 
  UserRole, 
  UserRoles, 
  RateLimit 
} from "@shared/schema";
import { useAuth } from "./use-auth";
import { getQueryFn, queryClient } from "@/lib/queryClient";

type RbacContextType = {
  // Role information
  role: UserRole | null;
  isAdmin: boolean;
  
  // Subscription information
  subscriptionTier: SubscriptionTier | null;
  
  // Rate limits
  rateLimit: RateLimit | null;
  isLoadingRateLimit: boolean;
  rateLimitError: Error | null;
  
  // Helper functions
  hasRole: (role: UserRole) => boolean;
  checkSubscriptionTier: (minimumTier: SubscriptionTier) => boolean;
  refreshRateLimits: () => void;
};

export const RbacContext = createContext<RbacContextType | null>(null);

export function RbacProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  // Get role from user
  const role = user?.role || null;
  const isAdmin = role === UserRoles.ADMIN;
  
  // Get subscription tier from user
  const subscriptionTier = user?.subscription_tier || null;
  
  // Fetch rate limits from API
  const {
    data: rateLimit,
    isLoading: isLoadingRateLimit,
    error: rateLimitError,
    refetch: refetchRateLimits
  } = useQuery<RateLimit, Error>({
    queryKey: ["/api/user/rate-limits"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user, // Only fetch if user is logged in
    // Refresh rate limits every 5 minutes
    refetchInterval: 5 * 60 * 1000,
  });
  
  // Helper function to check if user has the specified role
  const hasRole = (requiredRole: UserRole): boolean => {
    if (!role) return false;
    if (role === UserRoles.ADMIN) return true; // Admin can access everything
    return role === requiredRole;
  };
  
  // Helper function to check subscription tier (returns true if user has >= the required tier)
  const checkSubscriptionTier = (minimumTier: SubscriptionTier): boolean => {
    if (!subscriptionTier) return false;
    
    const tierValues = {
      [SubscriptionTiers.FREE]: 0,
      [SubscriptionTiers.STANDARD]: 1,
      [SubscriptionTiers.ENTERPRISE]: 2
    };
    
    return tierValues[subscriptionTier] >= tierValues[minimumTier];
  };
  
  // Function to manually refresh rate limits
  const refreshRateLimits = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/user/rate-limits"] });
  };
  
  return (
    <RbacContext.Provider
      value={{
        role,
        isAdmin,
        subscriptionTier,
        rateLimit: rateLimit || null,
        isLoadingRateLimit,
        rateLimitError,
        hasRole,
        checkSubscriptionTier,
        refreshRateLimits
      }}
    >
      {children}
    </RbacContext.Provider>
  );
}

export function useRbac() {
  const context = useContext(RbacContext);
  if (!context) {
    throw new Error("useRbac must be used within a RbacProvider");
  }
  return context;
}

export function useIsAdmin() {
  const { isAdmin } = useRbac();
  return isAdmin;
}

export function useHasRole(requiredRole: UserRole) {
  const { hasRole } = useRbac();
  return hasRole(requiredRole);
}

export function useSubscription() {
  const { subscriptionTier, checkSubscriptionTier } = useRbac();
  return { subscriptionTier, checkSubscriptionTier };
}

export function useRateLimits() {
  const { 
    rateLimit, 
    isLoadingRateLimit, 
    rateLimitError, 
    refreshRateLimits 
  } = useRbac();
  
  // Calculate percentages for progress bars
  const dailyUsagePercent = rateLimit ? 
    Math.min(Math.round((rateLimit.daily.used / rateLimit.daily.limit) * 100), 100) : 0;
  
  const monthlyUsagePercent = rateLimit ? 
    Math.min(Math.round((rateLimit.monthly.used / rateLimit.monthly.limit) * 100), 100) : 0;
  
  // Check if approaching limits (80% or more)
  const isApproachingDailyLimit = dailyUsagePercent >= 80;
  const isApproachingMonthlyLimit = monthlyUsagePercent >= 80;
  
  return {
    rateLimit,
    isLoading: isLoadingRateLimit,
    error: rateLimitError,
    refreshRateLimits,
    dailyUsagePercent,
    monthlyUsagePercent,
    isApproachingDailyLimit,
    isApproachingMonthlyLimit
  };
}