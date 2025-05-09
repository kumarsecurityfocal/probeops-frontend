import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { MainLayout } from "@/components/layouts/main-layout";
import { ProbeResultsTable } from "@/components/probe/probe-results-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProbeStats, ProbeResult } from "@/lib/types";
import { ArrowRight, Signal, CheckCircle, XCircle, Key } from "lucide-react";

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
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            {/* Dashboard Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Total Probes */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                      <Signal className="text-primary text-xl" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <div>
                        <p className="text-sm font-medium text-gray-500 truncate">Total Probes</p>
                        {isLoadingStats ? (
                          <Skeleton className="h-8 w-16 mt-1" />
                        ) : (
                          <p className="text-2xl font-semibold text-gray-900">{stats?.totalProbes || 0}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Successful Probes */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                      <CheckCircle className="text-green-500 text-xl" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <div>
                        <p className="text-sm font-medium text-gray-500 truncate">Successful Probes</p>
                        {isLoadingStats ? (
                          <Skeleton className="h-8 w-16 mt-1" />
                        ) : (
                          <p className="text-2xl font-semibold text-gray-900">{stats?.successfulProbes || 0}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Failed Probes */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                      <XCircle className="text-red-500 text-xl" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <div>
                        <p className="text-sm font-medium text-gray-500 truncate">Failed Probes</p>
                        {isLoadingStats ? (
                          <Skeleton className="h-8 w-16 mt-1" />
                        ) : (
                          <p className="text-2xl font-semibold text-gray-900">{stats?.failedProbes || 0}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Active API Keys */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                      <Key className="text-yellow-500 text-xl" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <div>
                        <p className="text-sm font-medium text-gray-500 truncate">Active API Keys</p>
                        {isLoadingStats ? (
                          <Skeleton className="h-8 w-16 mt-1" />
                        ) : (
                          <p className="text-2xl font-semibold text-gray-900">{stats?.activeApiKeys || 0}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Recent Probe Results */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Recent Probe Results</h2>
                <Button variant="ghost" asChild>
                  <Link href="/history" className="text-primary hover:text-indigo-700 flex items-center">
                    View all
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              
              <Card>
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
