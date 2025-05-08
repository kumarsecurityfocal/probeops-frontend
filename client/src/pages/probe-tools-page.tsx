import { MainLayout } from "@/components/layouts/main-layout";
import { ProbeCard } from "@/components/probe/probe-card";
import { ArrowUp10, Route, ServerCrash, Search } from "lucide-react";

export default function ProbeToolsPage() {
  return (
    <MainLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Network Probe Tools</h1>
          <p className="mt-1 text-sm text-gray-500">Run diagnostics on network hosts and services</p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Ping Probe */}
              <ProbeCard
                title="Ping"
                description="Check host connectivity and response time"
                icon={<ArrowUp10 className="h-6 w-6" />}
                type="ping"
              />
              
              {/* Traceroute Probe */}
              <ProbeCard
                title="Traceroute"
                description="Trace network path to destination"
                icon={<Route className="h-6 w-6" />}
                type="traceroute"
              />
              
              {/* DNS Lookup Probe */}
              <ProbeCard
                title="DNS Lookup"
                description="Query DNS records for a domain"
                icon={<ServerCrash className="h-6 w-6" />}
                type="dns"
              />
              
              {/* WHOIS Lookup Probe */}
              <ProbeCard
                title="WHOIS Lookup"
                description="Get domain registration information"
                icon={<Search className="h-6 w-6" />}
                type="whois"
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
