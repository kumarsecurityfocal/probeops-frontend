import { RateLimit } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { useRateLimits } from "@/hooks/use-rbac";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface RateLimitDisplayProps {
  showCard?: boolean;
  showTitle?: boolean;
  showInterval?: boolean;
  compact?: boolean;
}

export function RateLimitDisplay({ 
  showCard = true, 
  showTitle = true, 
  showInterval = true,
  compact = false 
}: RateLimitDisplayProps) {
  const { rateLimit, isLoading, refreshRateLimits } = useRateLimits();
  const [timeUntilReset, setTimeUntilReset] = useState<string | null>(null);

  useEffect(() => {
    // Refresh rate limits when component mounts
    refreshRateLimits();
    
    // Set up interval to refresh every minute
    const interval = setInterval(() => {
      refreshRateLimits();
    }, 60000); // 1 minute
    
    return () => clearInterval(interval);
  }, [refreshRateLimits]);

  // Calculate percentage values for progress bars
  const getDailyPercentage = () => {
    if (!rateLimit) return 0;
    const { daily } = rateLimit;
    return Math.round((daily.used / daily.limit) * 100);
  };

  const getMonthlyPercentage = () => {
    if (!rateLimit) return 0;
    const { monthly } = rateLimit;
    return Math.round((monthly.used / monthly.limit) * 100);
  };

  // Format the value to a readable string
  const formatValue = (used: number, limit: number) => {
    return `${used} / ${limit}`;
  };

  // Return appropriate color based on usage percentage
  const getColorClass = (percentage: number) => {
    if (percentage > 90) return "text-destructive";
    if (percentage > 70) return "text-amber-500";
    return "text-muted-foreground";
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-full bg-gray-200 rounded-md mb-2"></div>
        <div className="h-2 w-full bg-gray-200 rounded-md mb-4"></div>
        <div className="h-8 w-full bg-gray-200 rounded-md mb-2"></div>
        <div className="h-2 w-full bg-gray-200 rounded-md"></div>
      </div>
    );
  }

  if (!rateLimit) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load rate limit information. Please refresh the page or contact support.
        </AlertDescription>
      </Alert>
    );
  }

  const dailyPercentage = getDailyPercentage();
  const monthlyPercentage = getMonthlyPercentage();
  const dailyColorClass = getColorClass(dailyPercentage);
  const monthlyColorClass = getColorClass(monthlyPercentage);

  const content = (
    <>
      {showTitle && !compact && (
        <div className="mb-4">
          <h3 className="text-lg font-medium">API Usage Limits</h3>
          <p className="text-sm text-muted-foreground">
            Your current usage based on your subscription tier
          </p>
        </div>
      )}

      <div className={`space-y-${compact ? "2" : "4"}`}>
        <div>
          <div className="flex justify-between mb-1">
            <span className={`text-${compact ? "xs" : "sm"} font-medium`}>Daily Usage</span>
            <span className={`text-${compact ? "xs" : "sm"} ${dailyColorClass}`}>
              {formatValue(rateLimit.daily.used, rateLimit.daily.limit)}
            </span>
          </div>
          <Progress value={dailyPercentage} className={cn(
            "h-2",
            dailyPercentage > 90 ? "bg-destructive/20" : 
            dailyPercentage > 70 ? "bg-amber-500/20" : ""
          )} />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className={`text-${compact ? "xs" : "sm"} font-medium`}>Monthly Usage</span>
            <span className={`text-${compact ? "xs" : "sm"} ${monthlyColorClass}`}>
              {formatValue(rateLimit.monthly.used, rateLimit.monthly.limit)}
            </span>
          </div>
          <Progress value={monthlyPercentage} className={cn(
            "h-2",
            monthlyPercentage > 90 ? "bg-destructive/20" : 
            monthlyPercentage > 70 ? "bg-amber-500/20" : ""
          )} />
        </div>

        {showInterval && (
          <div className={`text-${compact ? "xs" : "sm"} pt-1 flex items-center text-muted-foreground`}>
            <Clock className="h-3 w-3 mr-1" />
            <span>Probe interval: {rateLimit.probe_interval} minutes</span>
          </div>
        )}
      </div>
    </>
  );

  if (showCard) {
    return (
      <Card>
        <CardHeader className={compact ? "p-3" : "p-6"}>
          <CardTitle className={compact ? "text-sm" : "text-lg"}>API Usage</CardTitle>
          {!compact && <CardDescription>Your current rate limits and usage</CardDescription>}
        </CardHeader>
        <CardContent className={compact ? "p-3" : "p-6"}>
          {content}
        </CardContent>
      </Card>
    );
  }

  return <div className="w-full">{content}</div>;
}