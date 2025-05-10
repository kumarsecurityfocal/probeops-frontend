import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth, useIsAdmin } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-rbac";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Home, 
  NetworkIcon, 
  History, 
  Key, 
  Settings, 
  Bell, 
  User, 
  LogOut, 
  Menu,
  Bug,
  Users,
  BarChart3,
  ShieldAlert
} from "lucide-react";
import { RoleBadge } from "@/components/rbac/role-badge";
import { SubscriptionTierBadge } from "@/components/subscription/subscription-tier-badge";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: <Home className="w-5 h-5" />,
    },
    {
      name: "Probe Tools",
      href: "/probe-tools",
      icon: <NetworkIcon className="w-5 h-5" />,
    },
    {
      name: "History",
      href: "/history",
      icon: <History className="w-5 h-5" />,
    },
    {
      name: "API Keys",
      href: "/api-keys",
      icon: <Key className="w-5 h-5" />,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: <Settings className="w-5 h-5" />,
    },
    {
      name: "Debug",
      href: "/debug",
      icon: <Bug className="w-5 h-5" />,
    },
  ];
  
  const getInitials = () => {
    if (!user || !user.username) return "U";
    // Just use the first two characters of the username since we don't have first/last name
    return user.username.substring(0, 2).toUpperCase();
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar (Desktop) */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-white border-r border-gray-200">
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4 py-6">
              <h1 className="text-2xl font-bold">
                <span className="text-gradient-primary">Probe</span>
                <span className="text-gradient-accent">Ops</span>
              </h1>
            </div>
            <div className="mt-6 flex-grow flex flex-col">
              <nav className="flex-1 px-2 space-y-1">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <a
                      className={cn(
                        "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                        location === item.href
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                      )}
                    >
                      <span className={cn(
                        "mr-3",
                        location === item.href
                          ? "text-primary"
                          : "text-gray-400 group-hover:text-primary/70"
                      )}>
                        {item.icon}
                      </span>
                      {item.name}
                    </a>
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex-shrink-0 w-full group block">
                <div className="flex items-center">
                  <Avatar>
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      {user?.username}
                    </p>
                    <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                      View profile
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* TopBar */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <Button
            variant="ghost"
            size="icon"
            className="px-4 border-r border-gray-200 text-gray-500 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <h1 className="text-xl font-bold md:hidden">
                <span className="text-gradient-primary">Probe</span>
                <span className="text-gradient-accent">Ops</span>
              </h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <Button
                variant="ghost"
                size="icon"
                className="bg-white rounded-full text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">View notifications</span>
                <Bell className="h-6 w-6" />
              </Button>

              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-3">
                    <span className="sr-only">Open user menu</span>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  
                  {user?.role && (
                    <div className="px-2 py-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Role</span>
                        <RoleBadge role={user.role} size="sm" />
                      </div>
                    </div>
                  )}
                  
                  {user?.subscription_tier && (
                    <div className="px-2 py-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Plan</span>
                        <SubscriptionTierBadge tier={user.subscription_tier} size="sm" />
                      </div>
                    </div>
                  )}
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Your Profile</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
                    <div className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </div>
                  </DropdownMenuItem>
                  {user?.role === 'admin' && (
                    <DropdownMenuItem onClick={() => window.location.href = '/admin'}>
                      <div className="flex items-center">
                        <ShieldAlert className="mr-2 h-4 w-4" />
                        <span>Admin Panel</span>
                      </div>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Mobile navigation drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div 
              className="fixed inset-0 bg-gray-600 bg-opacity-75" 
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 flex flex-col max-w-xs w-full bg-white">
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center flex-shrink-0 px-4 py-4">
                  <h1 className="text-xl font-bold">
                    <span className="text-gradient-primary">Probe</span>
                    <span className="text-gradient-accent">Ops</span>
                  </h1>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  {navItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <a
                        className={cn(
                          "group flex items-center px-2 py-2 text-base font-medium rounded-md",
                          location === item.href
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className={cn(
                          "mr-4",
                          location === item.href
                            ? "text-gray-500"
                            : "text-gray-400"
                        )}>
                          {item.icon}
                        </span>
                        {item.name}
                      </a>
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <div className="flex-shrink-0 group block">
                  <div className="flex items-center">
                    <Avatar>
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <p className="text-base font-medium text-gray-700 group-hover:text-gray-900">
                        {user?.username}
                      </p>
                      <Button variant="link" className="text-sm text-gray-500 p-0" onClick={handleLogout}>
                        Sign out
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>

        {/* Mobile bottom navigation */}
        <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around z-10">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a className={cn(
                "flex flex-col items-center py-2 px-3",
                location === item.href
                  ? "text-primary"
                  : "text-gray-500"
              )}>
                <span className="text-lg">{item.icon}</span>
                <span className="text-xs mt-1">{item.name.replace(" ", "")}</span>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
