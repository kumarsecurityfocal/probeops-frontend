import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Get the API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://35.173.110.195:5000';

// Get JWT token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('jwt_token');
};

// Function to check if response is OK and handle errors
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Try to parse error as JSON first
    let errorMessage;
    try {
      const errorData = await res.json();
      errorMessage = errorData.error || errorData.message || res.statusText;
    } catch (e) {
      // If not JSON, get as text
      errorMessage = await res.text() || res.statusText;
    }
    throw new Error(`${res.status}: ${errorMessage}`);
  }
}

// Build full URL with API base
const getFullUrl = (endpoint: string): string => {
  // If endpoint already starts with http, assume it's a full URL
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  
  // Remove leading slash if present to avoid double slashes
  const formattedEndpoint = endpoint.startsWith('/') 
    ? endpoint.substring(1) 
    : endpoint;
    
  return `${API_URL}/${formattedEndpoint}`;
};

// Main API request function for mutations
export async function apiRequest(
  method: string,
  endpoint: string,
  data?: unknown | undefined,
): Promise<Response> {
  const url = getFullUrl(endpoint);
  const token = getAuthToken();
  
  // Prepare headers with Content-Type and Authorization if token exists
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const res = await fetch(url, {
      method,
      headers,
      mode: 'cors',
      body: data ? JSON.stringify(data) : undefined,
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error("API Request error:", error);
    throw error;
  }
}

// Query function type for React Query
type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Extract the endpoint from the query key
    const endpoint = queryKey[0] as string;
    const url = getFullUrl(endpoint);
    const token = getAuthToken();
    
    // Prepare headers with Authorization if token exists
    const headers: Record<string, string> = {
      'Accept': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      const res = await fetch(url, { 
        headers,
        mode: 'cors'
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      console.error("Query fetch error:", error);
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
