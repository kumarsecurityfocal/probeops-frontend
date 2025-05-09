import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import api from "@/lib/api";

export function ProxyTest() {
  const { toast } = useToast();
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  
  const runTests = async () => {
    setLoading(true);
    setResults({});
    
    try {
      // Test the public endpoint
      try {
        const publicResult = await axios.get('/api/public/test');
        setResults(prev => ({
          ...prev,
          publicTest: {
            success: true,
            data: publicResult.data,
          }
        }));
      } catch (error: any) {
        setResults(prev => ({
          ...prev,
          publicTest: {
            success: false,
            error: error.message
          }
        }));
      }
      
      // Test the environment endpoint
      try {
        const envResult = await axios.get('/api/env');
        setResults(prev => ({
          ...prev,
          envTest: {
            success: true,
            data: envResult.data
          }
        }));
      } catch (error: any) {
        setResults(prev => ({
          ...prev,
          envTest: {
            success: false,
            error: error.message
          }
        }));
      }
      
      toast({
        title: "Proxy Tests Complete",
        description: "Check the results below",
      });
    } catch (error: any) {
      toast({
        title: "Test Failed",
        description: error.message || "An error occurred running the tests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Proxy Test Suite</CardTitle>
        <CardDescription>
          Run automated tests to verify the proxy configuration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={runTests} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              "Run Proxy Tests"
            )}
          </Button>
          
          {Object.keys(results).length > 0 && (
            <div className="space-y-4 mt-4">
              {Object.entries(results).map(([testName, result]) => (
                <div key={testName} className="border rounded-md p-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <span className={`w-3 h-3 rounded-full mr-2 ${(result as any).success ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {testName}
                  </h3>
                  <div className="bg-muted/30 rounded-md p-2 overflow-auto max-h-32">
                    <pre className="text-xs">
                      {(result as any).success 
                        ? JSON.stringify((result as any).data, null, 2)
                        : (result as any).error
                      }
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        These tests verify that the API proxy is correctly forwarding requests to the backend
      </CardFooter>
    </Card>
  );
}