import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ProbeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  type: "ping" | "traceroute" | "dns" | "whois";
}

// Form schemas
const pingSchema = z.object({
  host: z.string().min(1, "Host is required"),
});

const tracerouteSchema = z.object({
  host: z.string().min(1, "Host is required"),
});

const dnsSchema = z.object({
  domain: z.string().min(1, "Domain is required"),
  recordType: z.string().min(1, "Record type is required"),
});

const whoisSchema = z.object({
  domain: z.string().min(1, "Domain is required"),
});

type PingFormValues = z.infer<typeof pingSchema>;
type TracerouteFormValues = z.infer<typeof tracerouteSchema>;
type DnsFormValues = z.infer<typeof dnsSchema>;
type WhoisFormValues = z.infer<typeof whoisSchema>;

export function ProbeCard({ title, description, icon, type }: ProbeCardProps) {
  const { toast } = useToast();
  
  // Ping form
  const pingForm = useForm<PingFormValues>({
    resolver: zodResolver(pingSchema),
    defaultValues: {
      host: "",
    },
  });
  
  // Traceroute form
  const tracerouteForm = useForm<TracerouteFormValues>({
    resolver: zodResolver(tracerouteSchema),
    defaultValues: {
      host: "",
    },
  });
  
  // DNS form
  const dnsForm = useForm<DnsFormValues>({
    resolver: zodResolver(dnsSchema),
    defaultValues: {
      domain: "",
      recordType: "A",
    },
  });
  
  // WHOIS form
  const whoisForm = useForm<WhoisFormValues>({
    resolver: zodResolver(whoisSchema),
    defaultValues: {
      domain: "",
    },
  });
  
  // Ping mutation
  const pingMutation = useMutation({
    mutationFn: async (data: PingFormValues) => {
      const res = await apiRequest("POST", "/api/probes/ping", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Ping completed",
        description: "The ping probe was executed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/probes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      pingForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Ping failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Traceroute mutation
  const tracerouteMutation = useMutation({
    mutationFn: async (data: TracerouteFormValues) => {
      const res = await apiRequest("POST", "/api/probes/traceroute", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Traceroute completed",
        description: "The traceroute probe was executed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/probes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      tracerouteForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Traceroute failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // DNS mutation
  const dnsMutation = useMutation({
    mutationFn: async (data: DnsFormValues) => {
      const res = await apiRequest("POST", "/api/probes/dns", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "DNS lookup completed",
        description: "The DNS lookup probe was executed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/probes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      dnsForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "DNS lookup failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // WHOIS mutation
  const whoisMutation = useMutation({
    mutationFn: async (data: WhoisFormValues) => {
      const res = await apiRequest("POST", "/api/probes/whois", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "WHOIS lookup completed",
        description: "The WHOIS lookup probe was executed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/probes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      whoisForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "WHOIS lookup failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handlePingSubmit = (data: PingFormValues) => {
    pingMutation.mutate(data);
  };
  
  const handleTracerouteSubmit = (data: TracerouteFormValues) => {
    tracerouteMutation.mutate(data);
  };
  
  const handleDnsSubmit = (data: DnsFormValues) => {
    dnsMutation.mutate(data);
  };
  
  const handleWhoisSubmit = (data: WhoisFormValues) => {
    whoisMutation.mutate(data);
  };
  
  const renderForm = () => {
    switch (type) {
      case "ping":
        return (
          <form onSubmit={pingForm.handleSubmit(handlePingSubmit)}>
            <div className="mb-4">
              <Label htmlFor="ping-host">Host / IP Address</Label>
              <Input
                id="ping-host"
                type="text"
                placeholder="example.com"
                {...pingForm.register("host")}
              />
              {pingForm.formState.errors.host && (
                <p className="mt-1 text-sm text-red-600">
                  {pingForm.formState.errors.host.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={pingMutation.isPending}
            >
              {pingMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Ping...
                </>
              ) : (
                "Run Ping"
              )}
            </Button>
          </form>
        );
      
      case "traceroute":
        return (
          <form onSubmit={tracerouteForm.handleSubmit(handleTracerouteSubmit)}>
            <div className="mb-4">
              <Label htmlFor="traceroute-host">Host / IP Address</Label>
              <Input
                id="traceroute-host"
                type="text"
                placeholder="example.com"
                {...tracerouteForm.register("host")}
              />
              {tracerouteForm.formState.errors.host && (
                <p className="mt-1 text-sm text-red-600">
                  {tracerouteForm.formState.errors.host.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={tracerouteMutation.isPending}
            >
              {tracerouteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Traceroute...
                </>
              ) : (
                "Run Traceroute"
              )}
            </Button>
          </form>
        );
      
      case "dns":
        return (
          <form onSubmit={dnsForm.handleSubmit(handleDnsSubmit)}>
            <div className="mb-4">
              <Label htmlFor="dns-domain">Domain Name</Label>
              <Input
                id="dns-domain"
                type="text"
                placeholder="example.com"
                {...dnsForm.register("domain")}
              />
              {dnsForm.formState.errors.domain && (
                <p className="mt-1 text-sm text-red-600">
                  {dnsForm.formState.errors.domain.message}
                </p>
              )}
            </div>
            <div className="mb-4">
              <Label htmlFor="dns-type">Record Type</Label>
              <Select 
                defaultValue="A"
                onValueChange={(value) => dnsForm.setValue("recordType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select record type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="AAAA">AAAA</SelectItem>
                  <SelectItem value="CNAME">CNAME</SelectItem>
                  <SelectItem value="MX">MX</SelectItem>
                  <SelectItem value="NS">NS</SelectItem>
                  <SelectItem value="TXT">TXT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={dnsMutation.isPending}
            >
              {dnsMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running DNS Lookup...
                </>
              ) : (
                "Run DNS Lookup"
              )}
            </Button>
          </form>
        );
      
      case "whois":
        return (
          <form onSubmit={whoisForm.handleSubmit(handleWhoisSubmit)}>
            <div className="mb-4">
              <Label htmlFor="whois-domain">Domain Name</Label>
              <Input
                id="whois-domain"
                type="text"
                placeholder="example.com"
                {...whoisForm.register("domain")}
              />
              {whoisForm.formState.errors.domain && (
                <p className="mt-1 text-sm text-red-600">
                  {whoisForm.formState.errors.domain.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={whoisMutation.isPending}
            >
              {whoisMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running WHOIS Lookup...
                </>
              ) : (
                "Run WHOIS Lookup"
              )}
            </Button>
          </form>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-100 text-primary">
          {icon}
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
        <div className="mt-4">
          {renderForm()}
        </div>
      </CardContent>
    </Card>
  );
}
