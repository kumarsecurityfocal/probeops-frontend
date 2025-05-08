// Common types used across the application

export interface ProbeStats {
  totalProbes: number;
  successfulProbes: number;
  failedProbes: number;
  activeApiKeys: number;
}

export interface PingProbe {
  host: string;
}

export interface TracerouteProbe {
  host: string;
}

export interface DnsProbe {
  domain: string;
  recordType: string;
}

export interface WhoisProbe {
  domain: string;
}

export interface ApiKey {
  id: number;
  userId: number;
  name: string;
  key: string;
  createdAt: Date;
}

export interface ProbeResult {
  id: number;
  userId: number;
  probeType: string;
  target: string;
  status: string;
  result: string | null;
  createdAt: Date;
}

export const PROBE_TYPES = {
  PING: 'ping',
  TRACEROUTE: 'traceroute',
  DNS: 'dns',
  WHOIS: 'whois',
} as const;

export const PROBE_STATUS = {
  SUCCESS: 'success',
  FAILURE: 'failure',
  PENDING: 'pending',
} as const;
