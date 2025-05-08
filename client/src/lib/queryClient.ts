import { QueryClient, QueryFunction } from "@tanstack/react-query";
import api from "./api";
import axios, { AxiosResponse } from "axios";

// Query function type for React Query
type UnauthorizedBehavior = "returnNull" | "throw";

// Main API request function for mutations
export async function apiRequest(
  method: string,
  endpoint: string,
  data?: unknown | undefined,
): Promise<AxiosResponse> {
  try {
    let response;
    
    switch (method.toUpperCase()) {
      case 'GET':
        response = await api.get(endpoint);
        break;
      case 'POST':
        response = await api.post(endpoint, data);
        break;
      case 'PUT':
        response = await api.put(endpoint, data);
        break;
      case 'DELETE':
        response = await api.delete(endpoint);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
    
    return response;
  } catch (error) {
    console.error("API Request error:", error);
    throw error;
  }
}

// Query function type for React Query
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      // Extract the endpoint from the query key
      const endpoint = queryKey[0] as string;
      
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error("Query fetch error:", error);
      
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        if (unauthorizedBehavior === "returnNull") {
          return null;
        }
      }
      
      throw error;
    }
  };

// Configure React Query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
