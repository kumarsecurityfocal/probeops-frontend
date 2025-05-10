import { UserRole, UserRoles } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ShieldAlert, ShieldCheck } from "lucide-react";

interface RoleBadgeProps {
  role: UserRole;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export function RoleBadge({ 
  role, 
  size = "md", 
  showIcon = true 
}: RoleBadgeProps) {
  // Get role configuration based on role value
  const getRoleConfig = (role: UserRole) => {
    switch (role) {
      case UserRoles.USER:
        return {
          label: "User",
          variant: "outline" as const,
          icon: <ShieldCheck className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />,
          className: "bg-slate-100 hover:bg-slate-100 text-slate-700 border-slate-200"
        };
      case UserRoles.ADMIN:
        return {
          label: "Admin",
          variant: "default" as const,
          icon: <ShieldAlert className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />,
          className: "bg-gradient-to-r from-rose-500 to-red-500 text-white border-none"
        };
      default:
        return {
          label: role,
          variant: "outline" as const,
          icon: <ShieldCheck className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />,
          className: ""
        };
    }
  };

  const config = getRoleConfig(role);
  
  // Size configurations
  const sizeClasses = {
    sm: "text-xs py-0 px-2 h-5",
    md: "text-sm py-0.5 px-2.5",
    lg: "text-base py-1 px-3"
  };

  return (
    <Badge 
      variant={config.variant}
      className={cn(sizeClasses[size], config.className)}
    >
      {showIcon && <span className="mr-1">{config.icon}</span>}
      {config.label}
    </Badge>
  );
}