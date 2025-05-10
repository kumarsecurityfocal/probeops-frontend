import { Badge } from "@/components/ui/badge";
import { SubscriptionTier, SubscriptionTiers } from "@shared/schema";
import { Crown, Gem, Star } from "lucide-react";

interface SubscriptionTierBadgeProps {
  tier: SubscriptionTier;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export function SubscriptionTierBadge({ 
  tier, 
  showIcon = true,
  size = "md" 
}: SubscriptionTierBadgeProps) {
  // Define styles for each tier
  const tierStyles = {
    [SubscriptionTiers.FREE]: {
      className: "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200",
      icon: <Star className="mr-1 h-3 w-3" />,
      label: "Free"
    },
    [SubscriptionTiers.STANDARD]: {
      className: "bg-primary-gradient text-white border-primary/20",
      icon: <Gem className="mr-1 h-3 w-3" />,
      label: "Standard"
    },
    [SubscriptionTiers.ENTERPRISE]: {
      className: "bg-gradient-to-r from-amber-500 to-yellow-400 text-white border-amber-600/20",
      icon: <Crown className="mr-1 h-3 w-3" />,
      label: "Enterprise"
    }
  };

  const { className, icon, label } = tierStyles[tier];
  
  const sizeStyles = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-2.5 py-0.5",
    lg: "text-sm px-3 py-1"
  };
  
  return (
    <Badge className={`${className} ${sizeStyles[size]}`} variant="outline">
      {showIcon && icon}
      {label}
    </Badge>
  );
}