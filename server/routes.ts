import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { randomBytes } from "crypto";
import { probeTypes, probeStatus } from "@shared/schema";
import { log } from './vite';
import { initProxyLog, getRecentProxyLogs } from './proxy-logger';

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize proxy logs if in development mode
  if (process.env.NODE_ENV === 'development') {
    await initProxyLog();
  }
  
  // Set up authentication routes
  setupAuth(app);

  // API key routes
  app.get("/api/keys", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const apiKeys = await storage.getApiKeysByUserId(req.user.id);
    res.json(apiKeys);
  });

  app.post("/api/keys", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    
    const apiKey = await storage.createApiKey({
      userId: req.user.id,
      name,
    });
    
    res.status(201).json(apiKey);
  });

  app.delete("/api/keys/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid key ID" });
    }
    
    const key = await storage.getApiKeyById(id);
    if (!key) {
      return res.status(404).json({ message: "API key not found" });
    }
    
    if (key.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    await storage.deleteApiKey(id);
    res.sendStatus(204);
  });

  // Probe routes
  app.get("/api/probes", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const probes = await storage.getProbeResults(req.user.id, limit);
    res.json(probes);
  });

  app.get("/api/probes/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid probe ID" });
    }
    
    const probe = await storage.getProbeResultById(id);
    if (!probe) {
      return res.status(404).json({ message: "Probe not found" });
    }
    
    if (probe.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    res.json(probe);
  });

  // Ping probe
  app.post("/api/probes/ping", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const { host } = req.body;
    if (!host) {
      return res.status(400).json({ message: "Host is required" });
    }
    
    // Simulate the ping probe
    const success = Math.random() > 0.1; // 90% success rate
    const packetLoss = success ? Math.floor(Math.random() * 10) : 100;
    const avgTime = success ? (10 + Math.random() * 50).toFixed(2) : "0";
    
    const result = success
      ? `4 packets, ${packetLoss}% loss, ${avgTime}ms avg`
      : "Request timed out";
    
    const probeResult = await storage.createProbeResult({
      userId: req.user.id,
      probeType: probeTypes.PING,
      target: host,
      status: success ? probeStatus.SUCCESS : probeStatus.FAILURE,
      result
    });
    
    res.status(201).json(probeResult);
  });

  // Traceroute probe
  app.post("/api/probes/traceroute", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const { host } = req.body;
    if (!host) {
      return res.status(400).json({ message: "Host is required" });
    }
    
    // Simulate the traceroute probe
    const success = Math.random() > 0.1; // 90% success rate
    const hops = success ? Math.floor(8 + Math.random() * 15) : 0;
    const time = success ? (20 + Math.random() * 100).toFixed(2) : "0";
    
    const result = success
      ? `${hops} hops, ${time}ms`
      : "Traceroute failed";
    
    const probeResult = await storage.createProbeResult({
      userId: req.user.id,
      probeType: probeTypes.TRACEROUTE,
      target: host,
      status: success ? probeStatus.SUCCESS : probeStatus.FAILURE,
      result
    });
    
    res.status(201).json(probeResult);
  });

  // DNS probe
  app.post("/api/probes/dns", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const { domain, recordType } = req.body;
    if (!domain || !recordType) {
      return res.status(400).json({ message: "Domain and record type are required" });
    }
    
    // Simulate DNS lookup
    const success = Math.random() > 0.1; // 90% success rate
    
    let result;
    if (success) {
      switch(recordType) {
        case 'A':
          result = `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
          break;
        case 'AAAA':
          result = `2001:0db8:85a3:0000:0000:8a2e:${Math.floor(Math.random() * 10000)}:${Math.floor(Math.random() * 10000)}`;
          break;
        case 'CNAME':
          result = `cdn.${domain}`;
          break;
        case 'MX':
          result = `mail.${domain} priority 10`;
          break;
        case 'NS':
          result = `ns1.${domain}, ns2.${domain}`;
          break;
        case 'TXT':
          result = `v=spf1 include:_spf.${domain} ~all`;
          break;
        default:
          result = "Record found";
      }
    } else {
      result = "DNS resolution failed";
    }
    
    const probeResult = await storage.createProbeResult({
      userId: req.user.id,
      probeType: probeTypes.DNS,
      target: `${domain} (${recordType})`,
      status: success ? probeStatus.SUCCESS : probeStatus.FAILURE,
      result
    });
    
    res.status(201).json(probeResult);
  });

  // WHOIS probe
  app.post("/api/probes/whois", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const { domain } = req.body;
    if (!domain) {
      return res.status(400).json({ message: "Domain is required" });
    }
    
    // Simulate WHOIS lookup
    const success = Math.random() > 0.1; // 90% success rate
    
    const registrars = [
      "GoDaddy.com, LLC",
      "NameCheap, Inc",
      "Tucows Domains Inc.",
      "Network Solutions, LLC",
      "MarkMonitor Inc."
    ];
    
    const result = success
      ? `Registrar: ${registrars[Math.floor(Math.random() * registrars.length)]}`
      : "WHOIS lookup failed";
    
    const probeResult = await storage.createProbeResult({
      userId: req.user.id,
      probeType: probeTypes.WHOIS,
      target: domain,
      status: success ? probeStatus.SUCCESS : probeStatus.FAILURE,
      result
    });
    
    res.status(201).json(probeResult);
  });

  // Get statistics
  app.get("/api/stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const probes = await storage.getProbeResults(req.user.id);
    const apiKeys = await storage.getApiKeysByUserId(req.user.id);
    
    const totalProbes = probes.length;
    const successfulProbes = probes.filter(probe => probe.status === probeStatus.SUCCESS).length;
    const failedProbes = probes.filter(probe => probe.status === probeStatus.FAILURE).length;
    const activeApiKeys = apiKeys.length;
    
    res.json({
      totalProbes,
      successfulProbes,
      failedProbes,
      activeApiKeys
    });
  });
  
  // Environment test endpoint (for debugging the proxy)
  app.get("/api/env", (req, res) => {
    res.json({
      environment: process.env.NODE_ENV || 'unknown',
      timestamp: new Date().toISOString(),
      message: 'Environment test endpoint',
      proxy: process.env.PROXY_TARGET || 'not configured',
      headers: req.headers,
    });
  });
  
  // Public test endpoint (no authentication required)
  app.get("/api/public/test", (req, res) => {
    res.json({
      success: true,
      message: 'This is a public test endpoint that can be accessed without authentication',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
    });
  });
  
  // Endpoint for proxy logs has been removed
  
  // PROXY REMOVED: We're now using NGINX Proxy Manager on a separate server
  log('Development mode: API proxy has been removed. Update your API configuration in client/src/lib/api.ts', 'proxy');

  // Create and return the HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
