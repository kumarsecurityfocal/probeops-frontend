import { Badge } from "@/components/ui/badge";
import { UserRole, UserRoles } from "@shared/schema";
import { ShieldAlert, ShieldCheck, User } from "lucide-react";

interface RoleBadgeProps {
  role: UserRole;
  size?: "sm" | "md" | "lg";
}

export function RoleBadge({ role, size = "md" }: RoleBadgeProps) {
  // Define styles and icons for each role
  const roleStyles = {
    [UserRoles.USER]: {
      className: "bg-secondary/10 hover:bg-secondary/20 text-secondary border-secondary/20",
      icon: <User className="mr-1 h-3 w-3" />,
      label: "User"
    },
    [UserRoles.ADMIN]: {
      className: "bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-600/20",
      icon: <ShieldAlert className="mr-1 h-3 w-3" />,
      label: "Admin"
    }
  };

  const { className, icon, label } = roleStyles[role];

  const sizeStyles = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-2.5 py-0.5",
    lg: "text-sm px-3 py-1"
  };

  return (
    <Badge className={`${className} ${sizeStyles[size]}`} variant="outline">
      {icon}
      {label}
    </Badge>
  );
}