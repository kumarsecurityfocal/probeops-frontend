import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { 
  insertUserSchema, 
  User as SelectUser, 
  InsertUser, 
  UserRole,
  SubscriptionTier,
  UserRoles,
  SubscriptionTiers
} from "@shared/schema";
import { authAPI } from "../lib/api";
import { queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Interface for the user data returned from the backend 
// Based on the actual response format from the API with RBAC additions
interface BackendUser {
  id: number;
  username: string;
  email: string;
  created_at: string;
  is_active: boolean;
  is_admin: boolean;
  api_key_count: number;
  // RBAC fields
  role: UserRole;
  subscription_tier: SubscriptionTier;
}

// Interface for login request data
interface LoginRequest {
  email: string;
  password: string;
}

// Interface for login response data - updated to match backend
interface LoginResponse {
  message: string;
  token: string;
  user: BackendUser;
}

// Interface for registration response data - updated to match backend
interface RegisterResponse {
  message: string;
  user: BackendUser;
  api_key: string;
}

type AuthContextType = {
  user: BackendUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<LoginResponse, Error, LoginRequest>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<RegisterResponse, Error, InsertUser>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<BackendUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Effect to load user from localStorage on initial load
  // Then verify with /users/me endpoint if token exists
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('jwt_token');
        
        if (storedUser && token) {
          setUser(JSON.parse(storedUser));
          
          // Verify token validity with backend
          try {
            const response = await authAPI.getUser();
            // Extract user from response structure
            console.log("User verification raw response:", response.data);
            
            // The actual user object might be nested inside a 'user' field
            const userData = response.data.user || response.data;
            console.log("Extracted user data:", userData);
            
            // Ensure user object has required RBAC fields with defaults if missing
            const enhancedUser = {
              ...userData,
              // If backend doesn't provide role, default based on is_admin flag
              role: userData.role || (userData.is_admin ? UserRoles.ADMIN : UserRoles.USER),
              // If backend doesn't provide subscription tier, default to free
              subscription_tier: userData.subscription_tier || SubscriptionTiers.FREE
            };
            
            // Update user data with fresh data from server
            setUser(enhancedUser);
            localStorage.setItem('user', JSON.stringify(enhancedUser));
          } catch (apiError) {
            console.error("Token validation failed:", apiError);
            // Clear invalid token data
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Error loading user from storage:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('jwt_token');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login mutation - using axios API client
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      console.log("Logging in with credentials:", credentials);
      const response = await authAPI.login(credentials);
      console.log("Login response:", response.data);
      return response.data;
    },
    onSuccess: (data: LoginResponse) => {
      console.log("Login success:", data);
      
      // Ensure user object has required RBAC fields with defaults if missing
      const enhancedUser = {
        ...data.user,
        // If backend doesn't provide role, default to regular user
        role: data.user.role || (data.user.is_admin ? UserRoles.ADMIN : UserRoles.USER),
        // If backend doesn't provide subscription tier, default to free
        subscription_tier: data.user.subscription_tier || SubscriptionTiers.FREE
      };
      
      // Save token and user info to localStorage
      localStorage.setItem('jwt_token', data.token);
      localStorage.setItem('user', JSON.stringify(enhancedUser));
      
      // Update state
      setUser(enhancedUser);
      
      // Show different message based on role
      const isAdmin = enhancedUser.role === UserRoles.ADMIN;
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${enhancedUser.username}! ${isAdmin ? 'You have admin access.' : ''}`,
      });
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  // Register mutation - using axios API client
  const registerMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      console.log("Registering with data:", userData);
      const response = await authAPI.register(userData);
      console.log("Registration response:", response.data);
      return response.data;
    },
    onSuccess: (data: RegisterResponse) => {
      console.log("Registration success:", data);
      
      // Ensure user object has required RBAC fields with defaults if missing
      const enhancedUser = {
        ...data.user,
        // New users are regular users by default
        role: data.user.role || UserRoles.USER,
        // New users start with free tier by default
        subscription_tier: data.user.subscription_tier || SubscriptionTiers.FREE
      };
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(enhancedUser));
      
      // Update state
      setUser(enhancedUser);
      
      // Save API key for later use
      localStorage.setItem('first_api_key', data.api_key);
      
      toast({
        title: "Registration successful",
        description: `Welcome, ${enhancedUser.username}! Your account has been created with the Free tier subscription. Your first API key has been created.`,
      });
      
      // Note: We can't auto-login after registration because password is now hashed
      // The user will need to manually login after registration
    },
    onError: (error: Error) => {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      });
    },
  });

  // Logout mutation - using JWT and optional API call
  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        // Try to call the logout endpoint, but continue even if it fails
        await authAPI.logout().catch(() => console.log("Backend logout call failed, continuing with local logout"));
      } finally {
        // Always remove local tokens regardless of API call success/failure
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user');
      }
    },
    onSuccess: () => {
      // Update state
      setUser(null);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    },
    onError: (error: Error) => {
      console.error("Logout error:", error);
      // Even if there's an API error, we'll still log the user out locally
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user');
      setUser(null);
      
      toast({
        title: "Logged out",
        description: "You've been logged out, but there was an issue with the server",
        variant: "default",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Helper hook to check if the current user is an admin
export function useIsAdmin() {
  const { user } = useAuth();
  return user?.role === UserRoles.ADMIN || user?.is_admin === true;
}

// Helper hook to get the user's subscription tier
export function useSubscriptionTier() {
  const { user } = useAuth();
  return user?.subscription_tier || null;
}
