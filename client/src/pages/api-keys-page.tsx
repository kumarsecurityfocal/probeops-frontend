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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">API <span className="text-gradient-primary">Keys</span></h1>
              <p className="text-muted-foreground">Securely manage authentication tokens for external applications</p>
            </div>
            <div className="flex gap-2">
              {isFetching && !isLoading && (
                <Button variant="outline" disabled className="bg-background/80 backdrop-blur-sm border-border/50">
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Refreshing...
                </Button>
              )}
              <Button 
                onClick={() => setIsDialogOpen(true)} 
                className="flex items-center shadow-sm bg-gradient-primary text-white hover:shadow-md transition-shadow"
              >
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
                  <div>
                    {/* Table header skeleton */}
                    <div className="border-b border-border/50 pb-4 mb-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-24 ml-8" />
                        <Skeleton className="h-5 w-24 ml-8" />
                        <Skeleton className="h-5 w-16 ml-auto" />
                      </div>
                    </div>
                    
                    {/* Table rows skeleton */}
                    <div className="space-y-6">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-6 py-2 group animate-pulse">
                          <div className="flex flex-col space-y-2">
                            <Skeleton className="h-6 w-36" />
                            <Skeleton className="h-4 w-24 bg-muted/50" />
                          </div>
                          <Skeleton className="h-6 w-52 ml-8" />
                          <Skeleton className="h-6 w-24 ml-4" />
                          <Skeleton className="h-8 w-20 ml-auto rounded-md" />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              ) : isError ? (
                <CardContent className="p-8">
                  <div className="text-center py-10 space-y-6">
                    <div className="mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-destructive/10 border border-destructive/20">
                      <AlertTriangle className="h-10 w-10 text-destructive" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Connection Error</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        {error?.message || "Unable to load your API keys. This could be due to network issues or server maintenance."}
                      </p>
                    </div>
                    <Button 
                      onClick={handleRetry} 
                      className="mt-4 bg-gradient-primary hover:shadow-md transition-shadow"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Try Again
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
