import { ApiTester } from "@/components/debug/api-tester";
import { ProxyLogs } from "@/components/debug/proxy-logs";
import { MainLayout } from "@/components/layouts/main-layout";

export default function DebugPage() {
  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Development Debugging</h1>
          <p className="text-muted-foreground">
            Use these tools to test API connectivity and debug development issues
          </p>
        </div>

        <div className="grid gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">API Configuration</h2>
            <div className="bg-muted/40 p-4 rounded-md">
              <pre className="text-sm">
                {`Environment: ${import.meta.env.PROD ? 'Production' : 'Development'}
API URL: ${import.meta.env.VITE_API_URL || '/api'}
JWT Token: ${localStorage.getItem('jwt_token') ? 'Present' : 'Not found'}`}
              </pre>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">API Request Tester</h2>
            <ApiTester />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">API Proxy Logs</h2>
            <ProxyLogs />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}