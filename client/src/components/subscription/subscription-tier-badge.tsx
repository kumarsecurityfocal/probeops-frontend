import { SubscriptionTier, SubscriptionTiers } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SubscriptionTierBadgeProps {
  tier: SubscriptionTier;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function SubscriptionTierBadge({ 
  tier, 
  size = "md", 
  showLabel = false 
}: SubscriptionTierBadgeProps) {
  // Get tier configuration based on tier value
  const getTierConfig = (tier: SubscriptionTier) => {
    switch (tier) {
      case SubscriptionTiers.FREE:
        return {
          label: "Free",
          variant: "outline" as const,
          icon: "🆓",
          description: "Basic access with limited API calls"
        };
      case SubscriptionTiers.STANDARD:
        return {
          label: "Standard",
          variant: "secondary" as const,
          icon: "⭐",
          description: "Standard access with increased API calls"
        };
      case SubscriptionTiers.ENTERPRISE:
        return {
          label: "Enterprise",
          variant: "default" as const,
          icon: "🏢",
          description: "Premium access with maximum API calls"
        };
      default:
        return {
          label: "Unknown",
          variant: "outline" as const,
          icon: "❓",
          description: "Unknown tier"
        };
    }
  };

  const config = getTierConfig(tier);
  
  // Size configurations
  const sizeClasses = {
    sm: "text-xs py-0 px-2 h-5",
    md: "text-sm py-0.5 px-2.5",
    lg: "text-base py-1 px-3"
  };

  return (
    <Badge 
      variant={config.variant}
      className={cn(
        sizeClasses[size],
        {
          "bg-slate-100 hover:bg-slate-100 text-slate-700 border-slate-200": tier === SubscriptionTiers.FREE,
          "bg-blue-100 hover:bg-blue-100 text-blue-700 border-blue-200": tier === SubscriptionTiers.STANDARD,
          "bg-gradient-to-r from-primary to-purple-600 text-white border-none": tier === SubscriptionTiers.ENTERPRISE
        }
      )}
    >
      <span className="mr-1">{config.icon}</span>
      {config.label}
      {showLabel && (
        <span className="ml-1 text-xs opacity-70">Tier</span>
      )}
    </Badge>
  );
}