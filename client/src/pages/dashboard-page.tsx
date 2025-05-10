import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { MainLayout } from "@/components/layouts/main-layout";
import { ProbeResultsTable } from "@/components/probe/probe-results-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProbeStats, ProbeResult } from "@/lib/types";
import { Activity, ArrowRight, Signal, CheckCircle, XCircle, Key } from "lucide-react";

export default function DashboardPage() {
  // Fetch stats data directly from backend
  const { data: stats, isLoading: isLoadingStats } = useQuery<ProbeStats>({
    queryKey: ["/stats"], // Direct backend endpoint
  });
  
  // Fetch recent probes directly from backend
  const { data: recentProbes, isLoading: isLoadingProbes } = useQuery<ProbeResult[]>({
    queryKey: ["/probes/history", { limit: 5 }],
  });
  
  return (
    <MainLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Network Operations <span className="text-gradient-primary">Dashboard</span></h1>
            <p className="text-muted-foreground mt-2">Monitor your network probes and API key usage in real-time</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            {/* Dashboard Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Total Probes */}
              <Card className="card-stats overflow-hidden border-l-4 border-l-primary">
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-primary/10 rounded-full p-3">
                      <Signal className="text-primary text-xl" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Probes</p>
                        {isLoadingStats ? (
                          <Skeleton className="h-8 w-16 mt-1" />
                        ) : (
                          <p className="text-3xl font-bold">{stats?.totalProbes || 0}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Successful Probes */}
              <Card className="card-stats overflow-hidden border-l-4 border-l-success">
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-success/10 rounded-full p-3">
                      <CheckCircle className="text-success text-xl" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Successful Probes</p>
                        {isLoadingStats ? (
                          <Skeleton className="h-8 w-16 mt-1" />
                        ) : (
                          <p className="text-3xl font-bold">{stats?.successfulProbes || 0}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Failed Probes */}
              <Card className="card-stats overflow-hidden border-l-4 border-l-destructive">
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-destructive/10 rounded-full p-3">
                      <XCircle className="text-destructive text-xl" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Failed Probes</p>
                        {isLoadingStats ? (
                          <Skeleton className="h-8 w-16 mt-1" />
                        ) : (
                          <p className="text-3xl font-bold">{stats?.failedProbes || 0}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Active API Keys */}
              <Card className="card-stats overflow-hidden border-l-4 border-l-warning">
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-warning/10 rounded-full p-3">
                      <Key className="text-warning text-xl" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active API Keys</p>
                        {isLoadingStats ? (
                          <Skeleton className="h-8 w-16 mt-1" />
                        ) : (
                          <p className="text-3xl font-bold">{stats?.activeApiKeys || 0}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Recent Probe Results */}
            <div className="mt-10">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-primary" />
                  Recent Probe Results
                </h2>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/history" className="text-primary hover:text-primary/80 flex items-center">
                    View all history
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
              
              <Card className="border border-border/40 shadow-sm">
                {isLoadingProbes ? (
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
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
                  <ProbeResultsTable results={recentProbes || []} />
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
