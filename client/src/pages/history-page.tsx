import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layouts/main-layout";
import { ProbeResultsTable } from "@/components/probe/probe-results-table";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProbeResult } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

// Backend probe result format
interface BackendProbeResult {
  id: number;
  user_id: number;
  probe_type: string;
  target: string;
  status: string;
  result: string | null;
  created_at: string;
}

export default function HistoryPage() {
  const [selectedProbe, setSelectedProbe] = useState<ProbeResult | null>(null);
  
  // Fetch all probe results directly from backend
  const { data: backendResponse, isLoading } = useQuery<any, Error>({
    queryKey: ["/probes/history"]
  });
  
  // Log the response for debugging
  if (backendResponse) {
    console.log("Probe history response:", backendResponse);
  }
  
  // Extract the probe results array from the response
  // AWS backend returns: { jobs: [] } in the response
  const backendProbeResults = backendResponse && backendResponse.jobs ? backendResponse.jobs : [];
  
  // Transform backend results to frontend format
  const probeResults: ProbeResult[] = (Array.isArray(backendProbeResults) ? backendProbeResults : []).map(probe => ({
    id: probe.id,
    userId: probe.user_id,
    probeType: probe.probe_type,
    target: probe.target,
    status: probe.status,
    result: probe.result,
    createdAt: new Date(probe.created_at)
  }));
  
  const handleViewDetails = (probe: ProbeResult) => {
    setSelectedProbe(probe);
  };
  
  const getProbeTypeBadgeVariant = (
    probeType: string
  ): "ping" | "traceroute" | "dns" | "whois" => {
    switch (probeType) {
      case "ping":
        return "ping";
      case "traceroute":
        return "traceroute";
      case "dns":
        return "dns";
      case "whois":
        return "whois";
      default:
        return "ping";
    }
  };
  
  return (
    <MainLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Probe History</h1>
          <p className="mt-1 text-sm text-gray-500">View all your past network probe results</p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <Card>
              {isLoading ? (
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-28" />
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-full" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              ) : (
                <ProbeResultsTable 
                  results={probeResults || []} 
                  onViewDetails={handleViewDetails}
                />
              )}
            </Card>
          </div>
        </div>
      </div>
      
      {/* Probe Details Dialog */}
      {selectedProbe && (
        <Dialog open={!!selectedProbe} onOpenChange={(open) => !open && setSelectedProbe(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Probe Details</DialogTitle>
              <DialogDescription>
                Detailed information about the probe result
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Probe Type</h3>
                  <Badge variant={getProbeTypeBadgeVariant(selectedProbe.probeType)} className="mt-1">
                    {selectedProbe.probeType}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <Badge variant={selectedProbe.status === "success" ? "success" : "error"} className="mt-1">
                    {selectedProbe.status === "success" ? "Success" : "Failed"}
                  </Badge>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Target</h3>
                <p className="text-sm mt-1">{selectedProbe.target}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date/Time</h3>
                <p className="text-sm mt-1">
                  {format(new Date(selectedProbe.createdAt), "yyyy-MM-dd HH:mm:ss")}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Result</h3>
                <div className="bg-gray-50 p-3 rounded-md mt-1">
                  <p className="text-sm font-mono whitespace-pre-wrap">{selectedProbe.result || "No result data"}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </MainLayout>
  );
}
