import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "./use-auth";
import { UserRoles, SubscriptionTiers, UserRole, SubscriptionTier, RateLimit } from "@shared/schema";

// Define the RBAC context type
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

// Create the context
export const RbacContext = createContext<RbacContextType | null>(null);

// Rate limit tiers configuration
const TIER_LIMITS = {
  [SubscriptionTiers.FREE]: {
    daily: 100,
    monthly: 1000,
    probe_interval: 15
  },
  [SubscriptionTiers.STANDARD]: {
    daily: 500,
    monthly: 5000,
    probe_interval: 5
  },
  [SubscriptionTiers.ENTERPRISE]: {
    daily: 1000,
    monthly: 10000,
    probe_interval: 5
  }
};

// RBAC Provider component
export function RbacProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  // Extract role and subscription from user object
  const role = user?.role || null;
  const subscriptionTier = user?.subscription_tier || null;
  const isAdmin = role === UserRoles.ADMIN;
  
  // Query to fetch rate limit information
  const {
    data: rateLimit,
    isLoading: isLoadingRateLimit,
    error: rateLimitError,
    refetch: refreshRateLimits
  } = useQuery<RateLimit>({
    queryKey: ["/api/user/rate-limits"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/user/rate-limits");
        return response.data;
      } catch (error) {
        console.error("Failed to fetch rate limits:", error);
        
        // Fallback to default limits based on subscription tier if API fails
        if (subscriptionTier) {
          return {
            tier: subscriptionTier,
            daily: {
              limit: TIER_LIMITS[subscriptionTier].daily,
              used: 0,
              remaining: TIER_LIMITS[subscriptionTier].daily
            },
            monthly: {
              limit: TIER_LIMITS[subscriptionTier].monthly,
              used: 0,
              remaining: TIER_LIMITS[subscriptionTier].monthly
            },
            probe_interval: TIER_LIMITS[subscriptionTier].probe_interval
          };
        }
        throw error;
      }
    },
    enabled: !!user, // Only run if user is authenticated
    refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
    refetchOnWindowFocus: true,
  });

  // Helper function to check if user has a specific role
  const hasRole = (requiredRole: UserRole): boolean => {
    if (!role) return false;
    
    // Admin role has all permissions
    if (role === UserRoles.ADMIN) return true;
    
    // Check for exact role match
    return role === requiredRole;
  };

  // Helper function to check if user's subscription tier meets or exceeds a minimum tier
  const checkSubscriptionTier = (minimumTier: SubscriptionTier): boolean => {
    if (!subscriptionTier) return false;
    
    // Always return true for enterprise tier
    if (subscriptionTier === SubscriptionTiers.ENTERPRISE) return true;
    
    // Standard tier can access free and standard features
    if (subscriptionTier === SubscriptionTiers.STANDARD) {
      return minimumTier === SubscriptionTiers.FREE || minimumTier === SubscriptionTiers.STANDARD;
    }
    
    // Free tier can only access free features
    return minimumTier === SubscriptionTiers.FREE;
  };

  return (
    <RbacContext.Provider
      value={{
        role,
        isAdmin,
        subscriptionTier,
        rateLimit,
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

// Hook to access the RBAC context
export function useRbac() {
  const context = useContext(RbacContext);
  if (!context) {
    throw new Error("useRbac must be used within a RbacProvider");
  }
  return context;
}

// Helper hook to check if user is admin
export function useIsAdmin() {
  const { isAdmin } = useRbac();
  return isAdmin;
}

// Helper hook to check if user has a specific role
export function useHasRole(requiredRole: UserRole) {
  const { hasRole } = useRbac();
  return hasRole(requiredRole);
}

// Helper hook to get user's subscription tier information
export function useSubscription() {
  const { subscriptionTier, checkSubscriptionTier } = useRbac();
  return { subscriptionTier, checkSubscriptionTier };
}

// Helper hook to get rate limit information
export function useRateLimits() {
  const { rateLimit, isLoadingRateLimit, rateLimitError, refreshRateLimits } = useRbac();
  
  // Calculate percentage of usage
  const dailyUsagePercent = rateLimit ? 
    Math.min(100, Math.round((rateLimit.daily.used / rateLimit.daily.limit) * 100)) : 0;
  
  const monthlyUsagePercent = rateLimit ?
    Math.min(100, Math.round((rateLimit.monthly.used / rateLimit.monthly.limit) * 100)) : 0;
  
  // Determine if approaching limits
  const isApproachingDailyLimit = dailyUsagePercent >= 80;
  const isApproachingMonthlyLimit = monthlyUsagePercent >= 80;
  
  return {
    rateLimit,
    isLoading: isLoadingRateLimit,
    error: rateLimitError,
    refresh: refreshRateLimits,
    dailyUsagePercent,
    monthlyUsagePercent,
    isApproachingDailyLimit,
    isApproachingMonthlyLimit
  };
}