/**
 * This component has been deprecated as the Debug → Proxy Test Suite functionality has been removed.
 * We're keeping an empty implementation to maintain imports.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * This component has been deprecated as the proxy logs feature has been removed.
 */
export function ProxyLogs() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Proxy Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          This feature has been deprecated. Proxy logging has been removed from the application.
        </p>
      </CardContent>
    </Card>
  );
}