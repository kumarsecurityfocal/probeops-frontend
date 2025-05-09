import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";

export function ApiTester() {
  const { toast } = useToast();
  const [endpoint, setEndpoint] = useState("/users/me");
  const [method, setMethod] = useState("GET");
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      let result;
      
      switch (method) {
        case "GET":
          result = await api.get(endpoint);
          break;
        case "POST":
          result = await api.post(endpoint, body ? JSON.parse(body) : {});
          break;
        case "PUT":
          result = await api.put(endpoint, body ? JSON.parse(body) : {});
          break;
        case "DELETE":
          result = await api.delete(endpoint);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
      
      setResponse(result.data);
      toast({
        title: "API Request Successful",
        description: `${method} ${endpoint} completed successfully`,
      });
    } catch (err: any) {
      console.error("API Test Error:", err);
      setError(err.message || "Unknown error occurred");
      toast({
        title: "API Request Failed",
        description: err.message || "An error occurred during the API request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>API Proxy Tester</CardTitle>
        <CardDescription>
          Test the API proxy configuration by making requests to backend endpoints
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-1">
              <Label htmlFor="method">Method</Label>
              <select
                id="method"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div className="col-span-3">
              <Label htmlFor="endpoint">Endpoint</Label>
              <Input
                id="endpoint"
                placeholder="/api/endpoint"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
              />
            </div>
          </div>
          
          {(method === "POST" || method === "PUT") && (
            <div>
              <Label htmlFor="body">Request Body (JSON)</Label>
              <textarea
                id="body"
                placeholder='{"key": "value"}'
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          )}
          
          <Button 
            onClick={handleTest} 
            disabled={loading}
            className="w-full mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              "Test Request"
            )}
          </Button>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col items-start">
        <Tabs defaultValue="response" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="response">Response</TabsTrigger>
            <TabsTrigger value="error">Error</TabsTrigger>
          </TabsList>
          <TabsContent value="response" className="w-full">
            <div className="border rounded-md p-4 bg-muted/30 overflow-auto max-h-64">
              {response ? (
                <pre className="text-sm whitespace-pre-wrap">
                  {JSON.stringify(response, null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">No response data available</p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="error" className="w-full">
            <div className="border rounded-md p-4 bg-muted/30 overflow-auto max-h-64">
              {error ? (
                <pre className="text-sm text-destructive whitespace-pre-wrap">{error}</pre>
              ) : (
                <p className="text-sm text-muted-foreground">No errors encountered</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardFooter>
    </Card>
  );
}