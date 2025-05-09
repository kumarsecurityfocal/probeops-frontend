import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layouts/main-layout";
import { ApiKeyTable } from "@/components/apikey/api-key-table";
import { ApiKeyDialog } from "@/components/apikey/api-key-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { ApiKey } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

// Interface for backend API key structure
interface BackendApiKey {
  id: number;
  user_id: number;
  name: string;
  key: string;
  created_at: string;
  description?: string;
}

export default function ApiKeysPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Fetch API keys directly from backend with improved options
  const { 
    data: backendResponse, 
    isLoading, 
    error, 
    isError,
    refetch,
    isFetching
  } = useQuery<any, Error>({
    queryKey: ["/apikeys"],
    retry: 2,  // Retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
    refetchOnWindowFocus: false
  });
  
  // Log the response for debugging
  if (backendResponse) {
    console.log("API keys response:", backendResponse);
  }
  
  // Log any errors to help with debugging
  if (error) {
    console.error("Error fetching API keys:", error);
  }

  // Safely extract the API keys array from the response with proper error handling
  let backendApiKeys: BackendApiKey[] = [];
  
  try {
    if (backendResponse) {
      if (Array.isArray(backendResponse)) {
        backendApiKeys = backendResponse;
      } else if (backendResponse.keys && Array.isArray(backendResponse.keys)) {
        backendApiKeys = backendResponse.keys;
      } else if (typeof backendResponse === 'object') {
        console.log("Response is an object but not in expected format:", backendResponse);
      }
    }
  } catch (err) {
    console.error("Error processing API keys response:", err);
  }
  
  // Transform backend API keys to frontend format
  const apiKeys: ApiKey[] = (Array.isArray(backendApiKeys) ? backendApiKeys : []).map(key => ({
    id: key.id,
    userId: key.user_id,
    name: key.name,
    key: key.key,
    createdAt: new Date(key.created_at),
    description: key.description
  }));
  
  // Handler for retry button
  const handleRetry = () => {
    toast({
      title: "Retrying connection...",
      description: "Attempting to reconnect to the server",
    });
    refetch();
  };
  
  return (
    <MainLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">API Keys</h1>
              <p className="mt-1 text-sm text-gray-500">Manage your API keys for external applications</p>
            </div>
            <div className="flex gap-2">
              {isFetching && !isLoading && (
                <Button variant="outline" disabled>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Refreshing...
                </Button>
              )}
              <Button onClick={() => setIsDialogOpen(true)} className="flex items-center">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Key
              </Button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <Card>
              {isLoading ? (
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              ) : isError ? (
                <CardContent className="p-6">
                  <div className="text-center py-8 space-y-4">
                    <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-red-100">
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-medium">Failed to load API keys</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      {error?.message || "There was an error connecting to the server. Please try again."}
                    </p>
                    <Button onClick={handleRetry} variant="outline" className="mt-2">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retry
                    </Button>
                  </div>
                </CardContent>
              ) : (
                <ApiKeyTable apiKeys={apiKeys} />
              )}
            </Card>
          </div>
        </div>
      </div>
      
      <ApiKeyDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />
    </MainLayout>
  );
}
