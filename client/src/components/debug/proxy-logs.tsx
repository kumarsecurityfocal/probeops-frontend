import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw } from "lucide-react";
import axios from "axios";

export function ProxyLogs() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/debug/proxy-logs');
      setLogs(response.data.logs || []);
    } catch (err: any) {
      console.error('Failed to fetch proxy logs:', err);
      toast({
        title: "Failed to fetch proxy logs",
        description: err.message || "An error occurred",
        variant: "destructive",
      });
      setLogs([`Error: ${err.message || "Failed to fetch logs"}`]);
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
              {loading ? "Loading logs..." : "No proxy logs available"}
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