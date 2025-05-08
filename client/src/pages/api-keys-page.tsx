import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layouts/main-layout";
import { ApiKeyTable } from "@/components/apikey/api-key-table";
import { ApiKeyDialog } from "@/components/apikey/api-key-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle } from "lucide-react";
import { ApiKey } from "@/lib/types";

export default function ApiKeysPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Fetch API keys
  const { data: apiKeys, isLoading } = useQuery<ApiKey[]>({
    queryKey: ["/api/keys"],
  });
  
  return (
    <MainLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">API Keys</h1>
              <p className="mt-1 text-sm text-gray-500">Manage your API keys for external applications</p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} className="flex items-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Key
            </Button>
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
              ) : (
                <ApiKeyTable apiKeys={apiKeys || []} />
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
