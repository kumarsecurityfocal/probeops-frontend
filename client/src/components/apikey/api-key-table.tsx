import { useState } from "react";
import { ApiKey } from "@/lib/types";
import { format } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Info, Key } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ApiKeyTableProps {
  apiKeys: ApiKey[];
}

// Backend API key format
interface BackendApiKey {
  id: number;
  user_id: number;
  name: string;
  key: string;
  created_at: string;
  description?: string;
}

export function ApiKeyTable({ apiKeys }: ApiKeyTableProps) {
  const { toast } = useToast();
  const [keyToDelete, setKeyToDelete] = useState<ApiKey | null>(null);
  
  const deleteApiKeyMutation = useMutation({
    mutationFn: async (id: number) => {
      try {
        // Log the delete attempt
        console.log(`Attempting to delete API key with ID: ${id}`);
        
        const response = await apiRequest("DELETE", `apikeys/${id}`);
        // Log the response for debugging
        console.log("Delete API key response:", response);
        
        return response.data;
      } catch (error) {
        console.error("Error deleting API key:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Successfully deleted API key:", data);
      
      // Improved success message with API key name
      toast({
        title: "API key deleted",
        description: `The API key "${keyToDelete?.name}" has been successfully deleted`,
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["apikeys"] });
      setKeyToDelete(null);
    },
    onError: (error: Error) => {
      console.error("API key deletion error in mutation:", error);
      
      // Generate a more user-friendly error message based on the error
      let errorMessage = error.message;
      
      // Handle common error scenarios with more descriptive messages
      if (errorMessage.includes("400")) {
        errorMessage = "Invalid API key ID. The key might have been already deleted.";
      } else if (errorMessage.includes("401") || errorMessage.includes("403")) {
        errorMessage = "You're not authorized to delete this API key. Please log in again.";
      } else if (errorMessage.includes("404")) {
        errorMessage = "API key not found. It may have been already deleted.";
      } else if (errorMessage.includes("Network Error") || errorMessage.includes("CORS")) {
        errorMessage = "Network connection issue. Please check your internet connection and try again.";
      } else if (errorMessage.includes("500")) {
        errorMessage = "Server error occurred. Our team has been notified. Please try again later.";
      }
      
      toast({
        title: "Failed to delete API key",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
  
  const handleDelete = (apiKey: ApiKey) => {
    setKeyToDelete(apiKey);
  };
  
  const confirmDelete = () => {
    if (keyToDelete) {
      deleteApiKeyMutation.mutate(keyToDelete.id);
    }
  };
  
  if (!apiKeys.length) {
    return (
      <div className="text-center py-16 px-4">
        <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 mb-4">
          <Key className="h-8 w-8 text-primary/70" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No API Keys Found</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Create your first API key to start making requests to the ProbeOps API from your applications.
        </p>
      </div>
    );
  }
  
  // Function to format API key for display
  const formatApiKey = (key: string): string => {
    if (!key) return "";
    
    // If key is less than 10 characters, mask all but the last 4
    if (key.length <= 10) {
      return `...${key.substring(key.length - 4)}`;
    }
    
    // For longer keys, show first 4 and last 4
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
  };
  
  return (
    <>
      <div className="w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 bg-muted/30">
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Created</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Key Preview</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiKeys.map((apiKey) => (
              <TableRow 
                key={apiKey.id}
                className="border-b border-border/20 hover:bg-muted/30 transition-colors"
              >
                <TableCell className="py-4">
                  <div className="flex flex-col">
                    <span className="text-base font-medium">{apiKey.name}</span>
                    {apiKey.description && (
                      <span className="text-sm text-muted-foreground mt-1">{apiKey.description}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(apiKey.createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <code className="font-mono text-xs px-2 py-1 bg-secondary/10 rounded text-secondary">{formatApiKey(apiKey.key)}</code>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(apiKey)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <AlertDialog open={!!keyToDelete} onOpenChange={(open) => !open && setKeyToDelete(null)}>
        <AlertDialogContent className="border-destructive/20">
          <AlertDialogHeader>
            <div className="mx-auto mb-4 w-12 h-12 flex items-center justify-center rounded-full bg-destructive/10">
              <Trash2 className="h-6 w-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-xl text-center">Delete API Key</AlertDialogTitle>
            <AlertDialogDescription className="text-center pt-2">
              <p className="text-base mb-2 text-foreground font-medium">"{keyToDelete?.name}"</p>
              <p className="text-muted-foreground">
                This action cannot be undone. Applications using this key will lose access to the ProbeOps API.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel className="border-border/50 font-medium">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive hover:bg-destructive/90 gap-2"
              disabled={deleteApiKeyMutation.isPending}
            >
              {deleteApiKeyMutation.isPending && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
              )}
              {deleteApiKeyMutation.isPending ? "Deleting..." : "Delete API Key"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
