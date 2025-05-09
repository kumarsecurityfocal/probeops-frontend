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
import { Trash2, Info } from "lucide-react";
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
      <div className="text-center py-8">
        <p className="text-muted-foreground">No API keys found</p>
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
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Key Preview</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiKeys.map((apiKey) => (
              <TableRow key={apiKey.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-1">
                    {apiKey.name}
                    {apiKey.description && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Info className="h-4 w-4 text-gray-400" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{apiKey.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableCell>
                <TableCell>{format(new Date(apiKey.createdAt), "yyyy-MM-dd")}</TableCell>
                <TableCell className="font-mono">{formatApiKey(apiKey.key)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(apiKey)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <AlertDialog open={!!keyToDelete} onOpenChange={(open) => !open && setKeyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the API key "{keyToDelete?.name}". 
              This action cannot be undone and may break applications using this key.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              {deleteApiKeyMutation.isPending ? "Deleting..." : "Delete API Key"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
