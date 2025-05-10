import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SubscriptionTierBadge } from "./subscription-tier-badge";
import { useRateLimits } from "@/hooks/use-rbac";
import { Loader2, ArrowUpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RateLimit } from "@shared/schema";
import { cn } from "@/lib/utils";

interface RateLimitDisplayProps {
  onUpgradeClick?: () => void;
  variant?: "card" | "inline";
}

export function RateLimitDisplay({ 
  onUpgradeClick,
  variant = "card" 
}: RateLimitDisplayProps) {
  const { 
    rateLimit, 
    isLoading,
    isApproachingDailyLimit,
    isApproachingMonthlyLimit
  } = useRateLimits();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-primary/70" />
      </div>
    );
  }

  if (!rateLimit) {
    return null;
  }

  // Calculate usage percentages
  const dailyUsagePercent = Math.min(
    Math.round((rateLimit.daily.used / rateLimit.daily.limit) * 100),
    100
  );
  
  const monthlyUsagePercent = Math.min(
    Math.round((rateLimit.monthly.used / rateLimit.monthly.limit) * 100),
    100
  );

  const getProgressColorClass = (percent: number): string => {
    if (percent >= 90) return "bg-red-500";
    if (percent >= 75) return "bg-amber-500";
    return "bg-primary";
  };

  if (variant === "inline") {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Daily Usage</span>
            <span className="text-xs text-muted-foreground">
              {rateLimit.daily.used} / {rateLimit.daily.limit}
            </span>
          </div>
          {isApproachingDailyLimit && onUpgradeClick && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onUpgradeClick}
              className="h-6 text-xs"
            >
              <ArrowUpCircle className="h-3 w-3 mr-1" />
              Upgrade
            </Button>
          )}
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={cn("h-full transition-all", getProgressColorClass(dailyUsagePercent))}
            style={{ width: `${dailyUsagePercent}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">Usage Limits</h3>
          <SubscriptionTierBadge tier={rateLimit.tier} size="sm" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Daily Usage</span>
            <span className="text-xs text-muted-foreground">
              {rateLimit.daily.used} / {rateLimit.daily.limit}
            </span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all", getProgressColorClass(dailyUsagePercent))}
              style={{ width: `${dailyUsagePercent}%` }}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Monthly Usage</span>
            <span className="text-xs text-muted-foreground">
              {rateLimit.monthly.used} / {rateLimit.monthly.limit}
            </span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all", getProgressColorClass(monthlyUsagePercent))}
              style={{ width: `${monthlyUsagePercent}%` }}
            />
          </div>
        </div>
        
        {(isApproachingDailyLimit || isApproachingMonthlyLimit) && onUpgradeClick && (
          <Button 
            onClick={onUpgradeClick} 
            className="w-full mt-2 bg-gradient-to-r from-primary to-primary-dark text-white"
            size="sm"
          >
            <ArrowUpCircle className="mr-2 h-4 w-4" />
            Upgrade Plan
          </Button>
        )}
        
        <div className="text-xs text-muted-foreground mt-2">
          Probe interval: {rateLimit.probe_interval} minutes
        </div>
      </CardContent>
    </Card>
  );
}