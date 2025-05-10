import { MainLayout } from "@/components/layouts/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleBadge } from "@/components/rbac/role-badge";
import { SubscriptionTierBadge } from "@/components/subscription/subscription-tier-badge";
import { RateLimitDisplay } from "@/components/subscription/rate-limit-display";
import { UpgradeSubscription } from "@/components/subscription/upgrade-subscription";
import { useSubscription } from "@/hooks/use-rbac";

export default function SettingsPage() {
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const getInitials = () => {
    if (!user) return "U";
    const firstInitial = user.firstName ? user.firstName[0] : "";
    const lastInitial = user.lastName ? user.lastName[0] : "";
    return firstInitial && lastInitial ? `${firstInitial}${lastInitial}` : user.username.substring(0, 2).toUpperCase();
  };
  
  return (
    <MainLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your account settings and preferences</p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4 space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Manage your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-lg">
                      {user?.firstName && user?.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user?.username}
                    </h3>
                    <p className="text-sm text-gray-500">{user?.username}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Security Card */}
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your security settings and account access</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Change Password</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Update your password to maintain account security
                  </p>
                  <Button variant="outline">Change Password</Button>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-2">Sign out from all devices</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Sign out from all devices where you are currently logged in
                  </p>
                  <Button variant="outline">Sign Out Everywhere</Button>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium text-red-600 mb-2">Log out</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Log out from your current session
                  </p>
                  <Button variant="destructive" onClick={handleLogout} disabled={logoutMutation.isPending}>
                    {logoutMutation.isPending ? "Logging out..." : "Log Out"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
