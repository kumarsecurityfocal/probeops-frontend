import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Interface for the user data returned from the backend
interface JwtUser {
  id: number;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  token?: string;  // JWT token from the backend
}

// Interface for login request data
interface LoginRequest {
  username: string;
  password: string;
}

// Interface for login response data
interface LoginResponse {
  user: JwtUser;
  token: string;
}

// Interface for registration response data
interface RegisterResponse {
  user: JwtUser;
  token: string;
}

type AuthContextType = {
  user: JwtUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<LoginResponse, Error, LoginRequest>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<RegisterResponse, Error, InsertUser>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<JwtUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Effect to load user from localStorage on initial load
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('jwt_token');
        
        if (storedUser && token) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Error loading user from storage:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login mutation - adjusted for JWT
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const res = await apiRequest("POST", "users/login", credentials);
      return await res.json();
    },
    onSuccess: (data: LoginResponse) => {
      // Save token and user info to localStorage
      localStorage.setItem('jwt_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Update state
      setUser(data.user);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  // Register mutation - adjusted for JWT
  const registerMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      const res = await apiRequest("POST", "users/register", userData);
      return await res.json();
    },
    onSuccess: (data: RegisterResponse) => {
      // Save token and user info to localStorage
      localStorage.setItem('jwt_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Update state
      setUser(data.user);
      
      toast({
        title: "Registration successful",
        description: `Welcome, ${data.user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      });
    },
  });

  // Logout mutation - adjusted for JWT
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // With JWT, we don't need to hit an endpoint to logout
      // Just remove the token from localStorage
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user');
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
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
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
