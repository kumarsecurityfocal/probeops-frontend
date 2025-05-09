import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ProxyLogs() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const fetchLogs = async () => {
    setLoading(true);
    setAuthError(null);
    
    try {
      // Get JWT token from localStorage
      const token = localStorage.getItem('jwt_token');
      
      if (!token) {
        console.error('No JWT token available for API request');
        setAuthError('Authentication required. Please log in to view proxy logs.');
        setLogs([]);
        return;
      }
      
      // Log for debugging
      console.log('Making authenticated request to /api/debug/proxy-logs with JWT token');
      
      // Use our configured API client which already handles auth headers
      // Note: Ensure we're using the correct path with /api prefix
      const response = await api.get('/api/debug/proxy-logs');
      console.log('Proxy logs response:', response);
      
      setLogs(response.data.logs || []);
    } catch (err: any) {
      console.error('Failed to fetch proxy logs:', err);
      
      // Special handling for auth errors
      if (err.response && err.response.status === 401) {
        setAuthError('Your session has expired. Please log in again to view proxy logs.');
        
        // Clear potentially expired token
        if (localStorage.getItem('jwt_token')) {
          console.warn('Clearing potentially expired JWT token');
          // We don't clear the user object to avoid UI flashing,
          // auth hook will handle proper logout if needed
          localStorage.removeItem('jwt_token');
        }
      } else {
        // For other errors, show toast and add to logs
        toast({
          title: "Failed to fetch proxy logs",
          description: err.message || "An error occurred",
          variant: "destructive",
        });
        setLogs([`Error: ${err.message || "Failed to fetch logs"}`]);
      }
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchLogs();
    
    // Refresh logs every 10 seconds
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>API Proxy Logs</CardTitle>
            <CardDescription>
              Logs of API requests proxied to the backend server
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchLogs}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {authError ? (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>
              {authError}
            </AlertDescription>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => window.location.href = '/auth'}
            >
              Go to Login
            </Button>
          </Alert>
        ) : null}
        
        <div className="bg-muted/30 border rounded-md p-4 overflow-auto h-64">
          {logs.length > 0 ? (
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
              {logs.map((log, index) => (
                <div 
                  key={index} 
                  className={`py-1 ${log.includes('ERROR') ? 'text-destructive' : ''}`}
                >
                  {log}
                </div>
              ))}
            </pre>
          ) : (
            <div className="flex justify-center items-center h-full text-muted-foreground">
              {loading ? "Loading logs..." : authError ? "Authentication required" : "No proxy logs available"}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <div>Logs are stored in the server's logs directory</div>
        <Badge variant="outline">Development Mode Only</Badge>
      </CardFooter>
    </Card>
  );
}