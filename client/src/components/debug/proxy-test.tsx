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
  const { user } = useAuth();
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const runTests = async () => {
    setLoading(true);
    setResults({});
    setAuthError(null);
    
    // Get token for authenticated requests
    const token = localStorage.getItem('jwt_token');
    const isAuthenticated = !!token;
    
    try {
      // Test the public endpoint (doesn't require authentication)
      try {
        console.log('Testing public endpoint with our API client');
        const publicResult = await api.get('/api/public/test');
        setResults(prev => ({
          ...prev,
          publicTest: {
            success: true,
            data: publicResult.data,
          }
        }));
      } catch (error: any) {
        console.error('Public endpoint test error:', error);
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
        console.log('Testing environment endpoint with our API client');
        const envResult = await api.get('/api/env');
        setResults(prev => ({
          ...prev,
          envTest: {
            success: true,
            data: envResult.data
          }
        }));
      } catch (error: any) {
        console.error('Environment endpoint test error:', error);
        setResults(prev => ({
          ...prev,
          envTest: {
            success: false,
            error: error.message
          }
        }));
      }
      
      // Test the auth-protected logs endpoint only if we have a token
      if (isAuthenticated) {
        try {
          console.log('Testing protected logs endpoint with JWT token');
          const logsResult = await api.get('/api/debug/proxy-logs');
          setResults(prev => ({
            ...prev,
            authProtectedLogsTest: {
              success: true,
              data: {
                message: "Successfully accessed protected endpoint",
                logsCount: logsResult.data?.logs?.length || 0
              }
            }
          }));
        } catch (error: any) {
          console.error('Protected logs endpoint test error:', error);
          
          // Check if this was an auth error
          if (error.response && error.response.status === 401) {
            // Set auth error message to show to the user
            setAuthError('Authentication failed for protected endpoint. Your session may have expired.');
            
            // If we received a 401, the token might be invalid
            if (token) {
              console.warn('Possible expired token detected during proxy test');
            }
          }
          
          setResults(prev => ({
            ...prev,
            authProtectedLogsTest: {
              success: false,
              error: error.message
            }
          }));
        }
      } else {
        setResults(prev => ({
          ...prev,
          authProtectedLogsTest: {
            success: false,
            error: "Not executed - No authentication token available"
          }
        }));
      }
      
      toast({
        title: "Proxy Tests Complete",
        description: "Check the results below",
      });
    } catch (error: any) {
      console.error('Overall test error:', error);
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
        {authError && (
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
        )}
        
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