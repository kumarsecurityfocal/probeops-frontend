import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { RbacProvider } from "@/hooks/use-rbac";
import { ProtectedRoute, AdminRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import ProbeToolsPage from "@/pages/probe-tools-page";
import HistoryPage from "@/pages/history-page";
import ApiKeysPage from "@/pages/api-keys-page";
import SettingsPage from "@/pages/settings-page";
import DebugPage from "@/pages/debug-page";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/probe-tools" component={ProbeToolsPage} />
      <ProtectedRoute path="/history" component={HistoryPage} />
      <ProtectedRoute path="/api-keys" component={ApiKeysPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <Route path="/debug" component={DebugPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RbacProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </RbacProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
