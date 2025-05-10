import { MainLayout } from "@/components/layouts/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleBadge } from "@/components/rbac/role-badge";
import { SubscriptionTierBadge } from "@/components/subscription/subscription-tier-badge";
import { RateLimitDisplay } from "@/components/rbac/rate-limit-display";
import { UpgradeSubscription } from "@/components/subscription/upgrade-subscription";
import { useSubscription } from "@/hooks/use-rbac";

export default function SettingsPage() {
  const { user, logoutMutation } = useAuth();
  const { subscriptionTier } = useSubscription();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const getInitials = () => {
    if (!user) return "U";
    // Just use the first two characters of the username since we don't have first/last name
    return user.username.substring(0, 2).toUpperCase();
  };
  
  return (
    <MainLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your account settings and preferences</p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <Tabs defaultValue="profile" className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            
            {/* Profile Tab */}
            <TabsContent value="profile" className="py-4">
              <Card>
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Manage your personal information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-lg">
                        {user?.username}
                      </h3>
                      <p className="text-sm text-gray-500 mb-1">{user?.email}</p>
                      <div className="flex gap-2 mt-1">
                        {user?.role && <RoleBadge role={user.role} size="sm" />}
                        {user?.subscription_tier && (
                          <SubscriptionTierBadge tier={user.subscription_tier} size="sm" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="grid gap-4">
                    <div>
                      <h3 className="text-lg font-medium">Account Information</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Update your basic account information
                      </p>
                      <Button>Edit Profile</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Subscription Tab */}
            <TabsContent value="subscription" className="py-4">
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Current Subscription</CardTitle>
                      <CardDescription>View your subscription details and usage limits</CardDescription>
                    </div>
                    {user?.subscription_tier && (
                      <SubscriptionTierBadge tier={user.subscription_tier} size="lg" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Usage Limits</h3>
                      <RateLimitDisplay />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-4">Account Status</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Plan</span>
                          <span className="font-medium">
                            {user?.subscription_tier ? (
                              user.subscription_tier.charAt(0).toUpperCase() + user.subscription_tier.slice(1)
                            ) : 'Free'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Member Since</span>
                          <span className="font-medium">
                            {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Role</span>
                          <span className="font-medium">
                            {user?.role ? (
                              user.role.charAt(0).toUpperCase() + user.role.slice(1)
                            ) : 'Standard User'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">API Keys</span>
                          <span className="font-medium">{user?.api_key_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Subscription Plans */}
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-6">Upgrade Subscription</h2>
                <UpgradeSubscription />
              </div>
            </TabsContent>
            
            {/* Security Tab */}
            <TabsContent value="security" className="py-4">
              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Manage your security settings and account access</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
