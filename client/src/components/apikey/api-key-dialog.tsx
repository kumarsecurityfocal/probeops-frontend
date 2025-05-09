import { useState } from "react";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Key, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiKey } from "@/lib/types";

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const apiKeySchema = z.object({
  name: z.string().min(1, "API key name is required"),
  description: z.string().optional(),
});

type ApiKeyFormValues = z.infer<typeof apiKeySchema>;

// Response from backend when creating an API key
// This interface accounts for different possible response formats from the backend
interface ApiKeyResponse {
  // Direct fields in case of flat response
  id?: number;
  user_id?: number;
  name?: string;
  key?: string;
  created_at?: string;
  
  // Fields in case of nested response format
  apiKey?: {
    id: number;
    user_id: number;
    name: string;
    key: string;
    created_at: string;
  };
  
  // Fields in case of an alternative api_key format
  api_key?: string;
  message?: string;
}

export function ApiKeyDialog({ open, onOpenChange }: ApiKeyDialogProps) {
  const { toast } = useToast();
  const [newApiKey, setNewApiKey] = useState<ApiKey | null>(null);
  const [copied, setCopied] = useState(false);
  
  const form = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });
  
  const createApiKeyMutation = useMutation({
    mutationFn: async (data: ApiKeyFormValues) => {
      try {
        const res = await apiRequest("POST", "apikeys", data);
        // Log the raw response to help with debugging
        console.log("Raw API key creation response:", res);
        
        // Axios responses contain data directly, no need to call .json()
        return res.data;
      } catch (error) {
        console.error("API key creation error:", error);
        throw error;
      }
    },
    onSuccess: (data: ApiKeyResponse) => {
      console.log("Successfully created API key:", data);
      
      // Handle different possible response formats
      let apiKey: ApiKey;
      const formName = form.getValues().name || "New API Key";
      
      try {
        if (data.apiKey && typeof data.apiKey === 'object') {
          // Response with nested apiKey object
          apiKey = {
            id: data.apiKey.id,
            userId: data.apiKey.user_id,
            name: data.apiKey.name,
            key: data.apiKey.key,
            createdAt: new Date(data.apiKey.created_at)
          };
        } else if (data.api_key && typeof data.api_key === 'string') {
          // Response with api_key string format (e.g. from register response)
          apiKey = {
            id: 0, // Will be refreshed on next list fetch
            userId: 0, // Will be refreshed on next list fetch
            name: formName,
            key: data.api_key,
            createdAt: new Date()
          };
        } else if (data.key && typeof data.key === 'string') {
          // Flat response structure with direct fields
          apiKey = {
            id: typeof data.id === 'number' ? data.id : 0,
            userId: typeof data.user_id === 'number' ? data.user_id : 0,
            name: typeof data.name === 'string' ? data.name : formName,
            key: data.key,
            createdAt: typeof data.created_at === 'string' ? new Date(data.created_at) : new Date()
          };
        } else {
          // If we get here, we have an unexpected response format
          // Create a fallback with just the form name and a placeholder for the key
          console.warn("Using fallback API key handling for unexpected response format:", data);
          
          let keyFromResponse = "";
          
          // Try to extract key from various possible locations
          if (typeof data === 'object') {
            if (typeof data.api_key === 'string') keyFromResponse = data.api_key;
            else if (typeof data.key === 'string') keyFromResponse = data.key;
            else if (data.apiKey && typeof data.apiKey.key === 'string') keyFromResponse = data.apiKey.key;
            // Try to handle case where the entire response might be the key string
            else if (typeof data.toString === 'function' && data.toString().length > 10) {
              keyFromResponse = data.toString();
            }
          }
          
          if (!keyFromResponse) {
            throw new Error("Could not extract API key from server response");
          }
          
          apiKey = {
            id: 0,
            userId: 0,
            name: formName,
            key: keyFromResponse,
            createdAt: new Date()
          };
        }
        
        // Show success toast notification
        toast({
          title: "API Key Created",
          description: `Your new API key "${apiKey.name}" has been created successfully`,
          variant: "default",
        });
        
        // Update state and invalidate queries
        setNewApiKey(apiKey);
        queryClient.invalidateQueries({ queryKey: ["apikeys"] });
      } catch (error) {
        console.error("Error processing API key response:", error, data);
        toast({
          title: "Error Processing API Key",
          description: "There was an error processing the API key response. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      console.error("API key creation error in mutation:", error);
      
      // Generate a more user-friendly error message based on the error
      let errorMessage = error.message;
      
      // Handle common error scenarios with more descriptive messages
      if (errorMessage.includes("400")) {
        errorMessage = "Invalid API key details. Please check your input and try again.";
      } else if (errorMessage.includes("401") || errorMessage.includes("403")) {
        errorMessage = "You're not authorized to create API keys. Please log in again.";
      } else if (errorMessage.includes("Network Error") || errorMessage.includes("CORS")) {
        errorMessage = "Network connection issue. Please check your internet connection and try again.";
      } else if (errorMessage.includes("500")) {
        errorMessage = "Server error occurred. Our team has been notified. Please try again later.";
      }
      
      toast({
        title: "Failed to create API key",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = (data: ApiKeyFormValues) => {
    createApiKeyMutation.mutate(data);
  };
  
  const copyToClipboard = () => {
    if (newApiKey) {
      navigator.clipboard.writeText(newApiKey.key);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "The API key has been copied to your clipboard",
      });
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };
  
  const handleClose = () => {
    form.reset();
    setNewApiKey(null);
    setCopied(false);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Create New API Key
          </DialogTitle>
          <DialogDescription>
            API keys allow external applications to access the ProbeOps API. 
            Create a key with a descriptive name to help you identify its purpose.
          </DialogDescription>
        </DialogHeader>
        
        {!newApiKey ? (
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="api-key-name">API Key Name</Label>
                <Input
                  id="api-key-name"
                  placeholder="e.g. Production Server"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="api-key-description">Description (Optional)</Label>
                <Input
                  id="api-key-description"
                  placeholder="e.g. For monitoring production infrastructure"
                  {...form.register("description")}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createApiKeyMutation.isPending}
              >
                {createApiKeyMutation.isPending ? "Creating..." : "Create API Key"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-api-key">Your New API Key</Label>
              <div className="flex items-center">
                <Input
                  id="new-api-key"
                  readOnly
                  value={newApiKey.key}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-12"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-red-600 mt-1">
                Copy this key now. You won't be able to see it again!
              </p>
            </div>
            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
