import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { MainLayout } from "@/components/layouts/main-layout";
import { ProbeResultsTable } from "@/components/probe/probe-results-table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProbeStats, ProbeResult } from "@/lib/types";
import { Activity, ArrowRight, Signal, CheckCircle, XCircle, Key, ArrowUpCircle } from "lucide-react";
import { RateLimitDisplay } from "@/components/subscription/rate-limit-display";
import { useSubscription } from "@/hooks/use-rbac";

export default function DashboardPage() {
  // Get subscription information
  const { subscriptionTier } = useSubscription();
  
  // Fetch stats data directly from backend
  const { data: stats, isLoading: isLoadingStats } = useQuery<ProbeStats>({
    queryKey: ["/stats"], // Direct backend endpoint
  });
  
  // Fetch recent probes directly from backend
  const { data: recentProbes, isLoading: isLoadingProbes } = useQuery<ProbeResult[]>({
    queryKey: ["/probes/history", { limit: 5 }],
  });
  
  // Handle upgrade subscription button click
  const handleUpgradeClick = () => {
    // Navigate to settings page
    window.location.href = '/settings';
  };
  
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
              <Card className="card-stats overflow-hidden border-l-4 border-l-primary hover:animate-[pulse_2s_ease-in-out]">
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
              <Card className="card-stats overflow-hidden border-l-4 border-l-success hover:animate-[pulse_2s_ease-in-out]">
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
              <Card className="card-stats overflow-hidden border-l-4 border-l-destructive hover:animate-[pulse_2s_ease-in-out]">
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
              <Card className="card-stats overflow-hidden border-l-4 border-l-warning hover:animate-[pulse_2s_ease-in-out]">
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
            
            {/* Usage and Subscription */}
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
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
                
                <Card className="border border-border/40 shadow-sm h-full">
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
              
              {/* Usage Limits Section */}
              <div>
                <h2 className="text-xl font-bold mb-5 flex items-center">
                  <ArrowUpCircle className="h-5 w-5 mr-2 text-primary" />
                  Usage Limits
                </h2>
                
                <RateLimitDisplay onUpgradeClick={handleUpgradeClick} />
                
                <div className="mt-6">
                  <Card className="border border-border/40 shadow-sm">
                    <CardHeader className="pb-2">
                      <h3 className="text-sm font-medium">Need More Requests?</h3>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Upgrade your plan to get more requests per day and faster probe intervals.
                      </p>
                      <Button 
                        onClick={handleUpgradeClick}
                        className="w-full mt-4 bg-gradient-to-r from-primary to-primary/80 text-white"
                        size="sm"
                      >
                        <ArrowUpCircle className="mr-2 h-4 w-4" />
                        Upgrade Subscription
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
